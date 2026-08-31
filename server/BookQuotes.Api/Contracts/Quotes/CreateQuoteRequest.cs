using System.ComponentModel.DataAnnotations;
using BookQuotes.Api.Validation;

namespace BookQuotes.Api.Contracts.Quotes;

public sealed class CreateQuoteRequest
{
    [NotWhiteSpace]
    [StringLength(500)]
    public required string Text { get; init; }

    [NotWhiteSpace]
    [StringLength(120)]
    public required string Author { get; init; }
}
