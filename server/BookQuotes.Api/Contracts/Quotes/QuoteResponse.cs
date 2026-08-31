namespace BookQuotes.Api.Contracts.Quotes;

public sealed record QuoteResponse(
    int Id,
    string Text,
    string Author,
    DateTimeOffset CreatedAt);
