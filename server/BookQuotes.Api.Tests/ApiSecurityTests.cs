using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Text;
using BookQuotes.Api.Data;
using BookQuotes.Api.Contracts.Auth;
using BookQuotes.Api.Contracts.Books;
using BookQuotes.Api.Contracts.Quotes;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace BookQuotes.Api.Tests;

public sealed class ApiSecurityTests : IAsyncLifetime
{
    private const string SigningKey = "integration-test-signing-key-with-32-characters";
    private const string Issuer = "BookQuotes.Api.Tests";
    private const string Audience = "BookQuotes.Client.Tests";
    private readonly string databasePath = Path.Combine(
        Path.GetTempPath(),
        $"book-quotes-security-{Guid.NewGuid():N}.db");
    private WebApplicationFactory<Program> factory = null!;
    private HttpClient client = null!;
    private string accessToken = string.Empty;

    public async Task InitializeAsync()
    {
        factory = new WebApplicationFactory<Program>().WithWebHostBuilder(builder =>
        {
            builder.ConfigureAppConfiguration((_, configuration) =>
                configuration.AddInMemoryCollection(new Dictionary<string, string?>
                {
                    ["ConnectionStrings:DefaultConnection"] = $"Data Source={databasePath}",
                    ["Jwt:Issuer"] = Issuer,
                    ["Jwt:Audience"] = Audience,
                    ["Jwt:Key"] = SigningKey,
                    ["Jwt:ExpiryMinutes"] = "30",
                    ["Cors:AllowedOrigins:0"] = "http://localhost:4200",
                }));
        });
        client = factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false,
        });

        var registerResponse = await client.PostAsJsonAsync("/api/auth/register", new
        {
            userName = "security-user",
            password = "StrongPass1",
            confirmPassword = "StrongPass1",
        });
        Assert.True(
            registerResponse.IsSuccessStatusCode,
            $"Test user registration failed with {(int)registerResponse.StatusCode}: " +
            await registerResponse.Content.ReadAsStringAsync());

        var loginResponse = await client.PostAsJsonAsync("/api/auth/login", new
        {
            userName = "security-user",
            password = "StrongPass1",
        });
        loginResponse.EnsureSuccessStatusCode();
        var auth = await loginResponse.Content.ReadFromJsonAsync<AuthResponse>();
        accessToken = Assert.IsType<AuthResponse>(auth).AccessToken;
    }

    [Fact]
    public async Task Books_RejectsMissingToken()
    {
        var response = await client.GetAsync("/api/books");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task UnknownApiRoute_ReturnsNotFoundInsteadOfSpaDocument()
    {
        var response = await client.GetAsync("/api/not-a-real-route");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        Assert.NotEqual("text/html", response.Content.Headers.ContentType?.MediaType);
    }

    [Fact]
    public async Task Registration_ReturnsCreatedAndRejectsDuplicateUserName()
    {
        var uniqueResponse = await client.PostAsJsonAsync("/api/auth/register", new
        {
            userName = "new-user",
            password = "StrongPass1",
            confirmPassword = "StrongPass1",
        });

        Assert.Equal(HttpStatusCode.Created, uniqueResponse.StatusCode);
        var createdUser = Assert.IsType<UserResponse>(
            await uniqueResponse.Content.ReadFromJsonAsync<UserResponse>());
        Assert.Equal("new-user", createdUser.UserName);
        Assert.False(string.IsNullOrWhiteSpace(createdUser.Id));

        var duplicateResponse = await client.PostAsJsonAsync("/api/auth/register", new
        {
            userName = "new-user",
            password = "StrongPass1",
            confirmPassword = "StrongPass1",
        });

        Assert.Equal(HttpStatusCode.BadRequest, duplicateResponse.StatusCode);
        var problem = await duplicateResponse.Content.ReadFromJsonAsync<ValidationProblemDetails>();
        Assert.Contains("userName", Assert.IsType<ValidationProblemDetails>(problem).Errors.Keys);
    }

    [Fact]
    public async Task Login_ReturnsTokenAndUserForValidCredentials()
    {
        var response = await client.PostAsJsonAsync("/api/auth/login", new
        {
            userName = "security-user",
            password = "StrongPass1",
        });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var auth = Assert.IsType<AuthResponse>(
            await response.Content.ReadFromJsonAsync<AuthResponse>());
        Assert.False(string.IsNullOrWhiteSpace(auth.AccessToken));
        Assert.True(auth.ExpiresAt > DateTimeOffset.UtcNow);
        Assert.Equal("security-user", auth.User.UserName);
    }

    [Theory]
    [InlineData("security-user", "WrongPass1")]
    [InlineData("missing-user", "StrongPass1")]
    public async Task Login_ReturnsUnauthorizedForInvalidCredentials(string userName, string password)
    {
        var response = await client.PostAsJsonAsync("/api/auth/login", new
        {
            userName,
            password,
        });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        var problem = await response.Content.ReadFromJsonAsync<ProblemDetails>();
        Assert.Equal("Invalid username or password.", Assert.IsType<ProblemDetails>(problem).Title);
    }

    [Fact]
    public async Task Books_AcceptsValidToken()
    {
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

        var response = await client.GetAsync("/api/books");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Books_SupportCompleteCrudWithExpectedStatusCodes()
    {
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

        var initialBooks = await client.GetFromJsonAsync<List<BookResponse>>("/api/books");
        Assert.Equal(3, Assert.IsType<List<BookResponse>>(initialBooks).Count);

        var createResponse = await client.PostAsJsonAsync("/api/books", new
        {
            title = "  Kindred  ",
            author = "  Octavia E. Butler  ",
            publishedDate = "1979-06-01",
        });
        Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);
        var created = Assert.IsType<BookResponse>(
            await createResponse.Content.ReadFromJsonAsync<BookResponse>());
        Assert.Equal("Kindred", created.Title);
        Assert.Equal("Octavia E. Butler", created.Author);
        Assert.EndsWith($"/api/Books/{created.Id}", createResponse.Headers.Location?.ToString());

        var getResponse = await client.GetAsync($"/api/books/{created.Id}");
        Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);
        Assert.Equal(
            created,
            await getResponse.Content.ReadFromJsonAsync<BookResponse>());

        var updateResponse = await client.PutAsJsonAsync($"/api/books/{created.Id}", new
        {
            title = "Kindred (Updated)",
            author = "Octavia E. Butler",
            publishedDate = "1979-06-01",
        });
        Assert.Equal(HttpStatusCode.OK, updateResponse.StatusCode);
        var updated = Assert.IsType<BookResponse>(
            await updateResponse.Content.ReadFromJsonAsync<BookResponse>());
        Assert.Equal("Kindred (Updated)", updated.Title);

        Assert.Equal(
            HttpStatusCode.NoContent,
            (await client.DeleteAsync($"/api/books/{created.Id}")).StatusCode);
        Assert.Equal(
            HttpStatusCode.NotFound,
            (await client.GetAsync($"/api/books/{created.Id}")).StatusCode);
    }

    [Fact]
    public async Task Books_RejectInvalidRequests()
    {
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

        var invalidCreate = await client.PostAsJsonAsync("/api/books", new
        {
            title = "   ",
            author = "Test Author",
            publishedDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1)),
        });
        Assert.Equal(HttpStatusCode.BadRequest, invalidCreate.StatusCode);
        var createProblem = await invalidCreate.Content.ReadFromJsonAsync<ValidationProblemDetails>();
        var createErrors = Assert.IsType<ValidationProblemDetails>(createProblem).Errors;
        Assert.Contains("Title", createErrors.Keys);
        Assert.Contains("PublishedDate", createErrors.Keys);

        var invalidUpdate = await client.PutAsJsonAsync("/api/books/1", new
        {
            title = "Valid title",
            author = "   ",
            publishedDate = "2000-01-01",
        });
        Assert.Equal(HttpStatusCode.BadRequest, invalidUpdate.StatusCode);
        var updateProblem = await invalidUpdate.Content.ReadFromJsonAsync<ValidationProblemDetails>();
        Assert.Contains(
            "Author",
            Assert.IsType<ValidationProblemDetails>(updateProblem).Errors.Keys);
    }

    [Fact]
    public async Task Books_ReturnNotFoundForUnknownIds()
    {
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
        const int unknownId = 999999;

        Assert.Equal(
            HttpStatusCode.NotFound,
            (await client.GetAsync($"/api/books/{unknownId}")).StatusCode);
        Assert.Equal(
            HttpStatusCode.NotFound,
            (await client.PutAsJsonAsync($"/api/books/{unknownId}", new
            {
                title = "Unknown Book",
                author = "Unknown Author",
                publishedDate = "2000-01-01",
            })).StatusCode);
        Assert.Equal(
            HttpStatusCode.NotFound,
            (await client.DeleteAsync($"/api/books/{unknownId}")).StatusCode);
    }

    [Fact]
    public async Task Books_RejectsManipulatedToken()
    {
        var segments = accessToken.Split('.');
        segments[2] = (segments[2][0] == 'a' ? 'b' : 'a') + segments[2][1..];
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
            "Bearer",
            string.Join('.', segments));

        var response = await client.GetAsync("/api/books");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Books_RejectsExpiredToken()
    {
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
            "Bearer",
            CreateExpiredToken());

        var response = await client.GetAsync("/api/books");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Cors_AllowsConfiguredOriginAndRejectsOtherOrigins()
    {
        using var allowedRequest = CreatePreflightRequest("http://localhost:4200");
        var allowedResponse = await client.SendAsync(allowedRequest);

        Assert.Equal(HttpStatusCode.NoContent, allowedResponse.StatusCode);
        Assert.Equal(
            "http://localhost:4200",
            Assert.Single(allowedResponse.Headers.GetValues("Access-Control-Allow-Origin")));

        using var deniedRequest = CreatePreflightRequest("https://untrusted.example");
        var deniedResponse = await client.SendAsync(deniedRequest);

        Assert.False(deniedResponse.Headers.Contains("Access-Control-Allow-Origin"));
    }

    [Fact]
    public async Task Registration_CreatesExactlyFiveQuotesOwnedByTheNewUser()
    {
        await using var scope = factory.Services.CreateAsyncScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var user = await dbContext.Users.SingleAsync(item => item.UserName == "security-user");
        var quotes = await dbContext.Quotes
            .Where(quote => quote.UserId == user.Id)
            .OrderBy(quote => quote.Id)
            .ToListAsync();

        Assert.Equal(5, quotes.Count);
        Assert.All(quotes, quote => Assert.Equal(user.Id, quote.UserId));
        Assert.Equal(
            StarterQuoteCatalog.All.Select(quote => (quote.Text, quote.Author)),
            quotes.Select(quote => (quote.Text, quote.Author)));
    }

    [Fact]
    public async Task FailedRegistration_LeavesNoUserOrOrphanedQuotes()
    {
        var response = await client.PostAsJsonAsync("/api/auth/register", new
        {
            userName = "invalid-user",
            password = "weak",
            confirmPassword = "weak",
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        await using var scope = factory.Services.CreateAsyncScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        Assert.False(await dbContext.Users.AnyAsync(user => user.UserName == "invalid-user"));
        Assert.Equal(5, await dbContext.Quotes.CountAsync());
    }

    [Fact]
    public async Task Quotes_RequireAuthenticationAndSupportCompleteCrud()
    {
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync("/api/quotes")).StatusCode);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

        var starterQuotes = await client.GetFromJsonAsync<List<QuoteResponse>>("/api/quotes");
        Assert.Equal(5, starterQuotes?.Count);

        var createResponse = await client.PostAsJsonAsync("/api/quotes", new
        {
            text = "A new test quote.",
            author = "Test Author",
        });
        Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);
        var created = Assert.IsType<QuoteResponse>(
            await createResponse.Content.ReadFromJsonAsync<QuoteResponse>());

        var updateResponse = await client.PutAsJsonAsync($"/api/quotes/{created.Id}", new
        {
            text = "An updated test quote.",
            author = "Updated Author",
        });
        Assert.Equal(HttpStatusCode.OK, updateResponse.StatusCode);
        var updated = Assert.IsType<QuoteResponse>(
            await updateResponse.Content.ReadFromJsonAsync<QuoteResponse>());
        Assert.Equal("An updated test quote.", updated.Text);

        Assert.Equal(
            HttpStatusCode.NoContent,
            (await client.DeleteAsync($"/api/quotes/{created.Id}")).StatusCode);
        Assert.Equal(
            HttpStatusCode.NotFound,
            (await client.GetAsync($"/api/quotes/{created.Id}")).StatusCode);
    }

    [Fact]
    public async Task Quotes_ReturnNotFoundForForeignIdsAndIgnoreClientOwnership()
    {
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
        var firstUsersQuotes = await client.GetFromJsonAsync<List<QuoteResponse>>("/api/quotes");
        var foreignQuoteId = Assert.IsType<List<QuoteResponse>>(firstUsersQuotes)[0].Id;

        (await client.PostAsJsonAsync("/api/auth/register", new
        {
            userName = "second-user",
            password = "StrongPass1",
            confirmPassword = "StrongPass1",
        })).EnsureSuccessStatusCode();
        var loginResponse = await client.PostAsJsonAsync("/api/auth/login", new
        {
            userName = "second-user",
            password = "StrongPass1",
        });
        loginResponse.EnsureSuccessStatusCode();
        var secondSession = Assert.IsType<AuthResponse>(
            await loginResponse.Content.ReadFromJsonAsync<AuthResponse>());
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
            "Bearer",
            secondSession.AccessToken);

        Assert.Equal(
            HttpStatusCode.NotFound,
            (await client.GetAsync($"/api/quotes/{foreignQuoteId}")).StatusCode);
        Assert.Equal(
            HttpStatusCode.NotFound,
            (await client.PutAsJsonAsync($"/api/quotes/{foreignQuoteId}", new
            {
                text = "Attempted overwrite",
                author = "Second User",
            })).StatusCode);
        Assert.Equal(
            HttpStatusCode.NotFound,
            (await client.DeleteAsync($"/api/quotes/{foreignQuoteId}")).StatusCode);

        var maliciousCreate = await client.PostAsJsonAsync("/api/quotes", new
        {
            text = "Server-owned quote",
            author = "Second User",
            userId = "a-client-supplied-owner-id",
        });
        maliciousCreate.EnsureSuccessStatusCode();
        var created = Assert.IsType<QuoteResponse>(
            await maliciousCreate.Content.ReadFromJsonAsync<QuoteResponse>());

        await using var scope = factory.Services.CreateAsyncScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        Assert.Equal(
            secondSession.User.Id,
            (await dbContext.Quotes.SingleAsync(quote => quote.Id == created.Id)).UserId);
    }

    public async Task DisposeAsync()
    {
        client.Dispose();
        await factory.DisposeAsync();

        if (File.Exists(databasePath))
        {
            File.Delete(databasePath);
        }
    }

    private static HttpRequestMessage CreatePreflightRequest(string origin)
    {
        var request = new HttpRequestMessage(HttpMethod.Options, "/api/books");
        request.Headers.Add("Origin", origin);
        request.Headers.Add("Access-Control-Request-Method", "GET");
        return request;
    }

    private static string CreateExpiredToken()
    {
        var now = DateTime.UtcNow;
        var token = new JwtSecurityToken(
            Issuer,
            Audience,
            [new Claim(JwtRegisteredClaimNames.Sub, "expired-user")],
            now.AddMinutes(-10),
            now.AddMinutes(-5),
            new SigningCredentials(
                new SymmetricSecurityKey(Encoding.UTF8.GetBytes(SigningKey)),
                SecurityAlgorithms.HmacSha256));

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
