namespace BookQuotes.Api.Contracts.Books;

public sealed record BookResponse(
    int Id,
    string Title,
    string Author,
    DateOnly PublishedDate,
    DateTimeOffset CreatedAt);
