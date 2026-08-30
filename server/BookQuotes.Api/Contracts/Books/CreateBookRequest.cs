namespace BookQuotes.Api.Contracts.Books;

public sealed record CreateBookRequest(
    string Title,
    string Author,
    DateOnly PublishedDate);
