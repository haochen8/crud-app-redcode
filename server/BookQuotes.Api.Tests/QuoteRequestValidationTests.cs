using System.ComponentModel.DataAnnotations;
using BookQuotes.Api.Contracts.Quotes;

namespace BookQuotes.Api.Tests;

public sealed class QuoteRequestValidationTests
{
    [Fact]
    public void CreateRequest_RejectsBlankTextAndAuthor()
    {
        var request = new CreateQuoteRequest { Text = "   ", Author = string.Empty };

        var results = Validate(request);

        Assert.Equal(2, results.Count);
        Assert.Contains(results, result => result.MemberNames.Contains(nameof(request.Text)));
        Assert.Contains(results, result => result.MemberNames.Contains(nameof(request.Author)));
    }

    [Fact]
    public void UpdateRequest_AcceptsValidQuoteData()
    {
        var request = new UpdateQuoteRequest
        {
            Text = "Simplicity is the soul of efficiency.",
            Author = "Austin Freeman",
        };

        Assert.Empty(Validate(request));
    }

    private static List<ValidationResult> Validate(object model)
    {
        var results = new List<ValidationResult>();
        Validator.TryValidateObject(model, new ValidationContext(model), results, true);
        return results;
    }
}
