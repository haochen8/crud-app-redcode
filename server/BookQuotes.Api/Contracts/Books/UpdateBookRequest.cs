using System.ComponentModel.DataAnnotations;
using BookQuotes.Api.Validation;

namespace BookQuotes.Api.Contracts.Books;

public sealed class UpdateBookRequest
{
    [NotWhiteSpace]
    [StringLength(200)]
    public required string Title { get; init; }

    [NotWhiteSpace]
    [StringLength(120)]
    public required string Author { get; init; }

    [NotFutureDate]
    public DateOnly PublishedDate { get; init; }
}
