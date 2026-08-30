namespace BookQuotes.Api.Auth;

public sealed record JwtTokenResult(string AccessToken, DateTimeOffset ExpiresAt);
