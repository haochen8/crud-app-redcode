using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Text;
using BookQuotes.Api.Data;
using BookQuotes.Api.Contracts.Auth;
using Microsoft.AspNetCore.Hosting;
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
        registerResponse.EnsureSuccessStatusCode();

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
    public async Task Books_AcceptsValidToken()
    {
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

        var response = await client.GetAsync("/api/books");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
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
