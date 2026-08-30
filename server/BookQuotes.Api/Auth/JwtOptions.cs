namespace BookQuotes.Api.Auth;

public sealed class JwtOptions
{
    public const string SectionName = "Jwt";

    public required string Issuer { get; init; }
    public required string Audience { get; init; }
    public string Key { get; init; } = string.Empty;
    public int ExpiryMinutes { get; init; } = 30;
}
