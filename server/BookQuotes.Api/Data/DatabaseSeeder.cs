using BookQuotes.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace BookQuotes.Api.Data;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(
        ApplicationDbContext dbContext,
        CancellationToken cancellationToken = default)
    {
        if (await dbContext.Books.AnyAsync(cancellationToken))
        {
            return;
        }

        dbContext.Books.AddRange(
            new Book
            {
                Title = "The Pragmatic Programmer",
                Author = "Andrew Hunt and David Thomas",
                PublishedDate = new DateOnly(1999, 10, 20),
                CreatedAt = new DateTimeOffset(2026, 1, 1, 0, 0, 0, TimeSpan.Zero),
            },
            new Book
            {
                Title = "Clean Code",
                Author = "Robert C. Martin",
                PublishedDate = new DateOnly(2008, 8, 1),
                CreatedAt = new DateTimeOffset(2026, 1, 1, 0, 0, 1, TimeSpan.Zero),
            },
            new Book
            {
                Title = "Designing Data-Intensive Applications",
                Author = "Martin Kleppmann",
                PublishedDate = new DateOnly(2017, 3, 16),
                CreatedAt = new DateTimeOffset(2026, 1, 1, 0, 0, 2, TimeSpan.Zero),
            });

        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
