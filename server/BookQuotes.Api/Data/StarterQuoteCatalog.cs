using BookQuotes.Api.Models;

namespace BookQuotes.Api.Data;

public static class StarterQuoteCatalog
{
    public static readonly IReadOnlyList<StarterQuote> All =
    [
        new("Programs must be written for people to read, and only incidentally for machines to execute.", "Harold Abelson"),
        new("Simplicity is the soul of efficiency.", "Austin Freeman"),
        new("The secret of getting ahead is getting started.", "Mark Twain"),
        new("Stay hungry, stay foolish.", "Steve Jobs"),
        new("Knowledge is power.", "Francis Bacon"),
    ];

    public static IReadOnlyList<Quote> CreateFor(ApplicationUser user, DateTimeOffset createdAt) =>
        All.Select(quote => new Quote
        {
            Text = quote.Text,
            Author = quote.Author,
            UserId = user.Id,
            User = user,
            CreatedAt = createdAt,
        }).ToArray();
}

public sealed record StarterQuote(string Text, string Author);
