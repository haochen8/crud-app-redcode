using System.IdentityModel.Tokens.Jwt;
using System.Text;
using BookQuotes.Api.Auth;
using BookQuotes.Api.Models;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace BookQuotes.Api.Tests;

public sealed class JwtTokenServiceTests
{
    private const string SigningKey = "a-test-signing-key-that-is-at-least-32-characters";

    [Fact]
    public void CreateToken_ReturnsAValidSignedTokenWithExpectedClaims()
    {
        var options = CreateOptions(SigningKey);
        var service = new JwtTokenService(options);
        var user = new ApplicationUser { Id = "user-123", UserName = "reader" };

        var result = service.CreateToken(user);

        var handler = new JwtSecurityTokenHandler { MapInboundClaims = false };
        var principal = handler.ValidateToken(
            result.AccessToken,
            new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = options.Value.Issuer,
                ValidateAudience = true,
                ValidAudience = options.Value.Audience,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(SigningKey)),
                ClockSkew = TimeSpan.Zero,
            },
            out var validatedToken);

        Assert.IsType<JwtSecurityToken>(validatedToken);
        Assert.Equal("user-123", principal.FindFirst(JwtRegisteredClaimNames.Sub)?.Value);
        Assert.Equal("reader", principal.FindFirst(JwtRegisteredClaimNames.UniqueName)?.Value);
        Assert.True(result.ExpiresAt > DateTimeOffset.UtcNow);
    }

    [Fact]
    public void CreateToken_ThrowsWhenSigningKeyIsTooShort()
    {
        var service = new JwtTokenService(CreateOptions("too-short"));

        var exception = Assert.Throws<InvalidOperationException>(
            () => service.CreateToken(new ApplicationUser { Id = "user-123", UserName = "reader" }));

        Assert.Contains("shorter than 32", exception.Message, StringComparison.OrdinalIgnoreCase);
    }

    private static IOptions<JwtOptions> CreateOptions(string key) => Options.Create(
        new JwtOptions
        {
            Issuer = "BookQuotes.Api.Tests",
            Audience = "BookQuotes.Client.Tests",
            Key = key,
            ExpiryMinutes = 30,
        });
}
