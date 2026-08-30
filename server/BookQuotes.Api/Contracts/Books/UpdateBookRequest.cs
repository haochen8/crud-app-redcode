namespace BookQuotes.Api.Contracts.Books;

public sealed record UpdateBookRequest(
    string Title,
    string Author,
    DateOnly PublishedDate);
