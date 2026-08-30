using System.ComponentModel.DataAnnotations;
using BookQuotes.Api.Contracts.Books;

namespace BookQuotes.Api.Tests;

public class BookRequestValidationTests
{
    [Fact]
    public void CreateRequest_RejectsBlankTextAndFutureDate()
    {
        var request = new CreateBookRequest
        {
            Title = "   ",
            Author = string.Empty,
            PublishedDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1)),
        };

        var results = Validate(request);

        Assert.Equal(3, results.Count);
        Assert.Contains(results, result => result.MemberNames.Contains(nameof(request.Title)));
        Assert.Contains(results, result => result.MemberNames.Contains(nameof(request.Author)));
        Assert.Contains(results, result => result.MemberNames.Contains(nameof(request.PublishedDate)));
    }

    [Fact]
    public void UpdateRequest_AcceptsValidBookData()
    {
        var request = new UpdateBookRequest
        {
            Title = "Refactoring",
            Author = "Martin Fowler",
            PublishedDate = new DateOnly(2018, 11, 19),
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
