using BookQuotes.Api.Data;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace BookQuotes.Api.Tests;

public class DatabaseSeederTests
{
    [Fact]
    public async Task SeedAsync_AddsBooksOnlyOnce()
    {
        await using var connection = new SqliteConnection("DataSource=:memory:");
        await connection.OpenAsync();

        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseSqlite(connection)
            .Options;

        await using var dbContext = new ApplicationDbContext(options);
        await dbContext.Database.EnsureCreatedAsync();

        await DatabaseSeeder.SeedAsync(dbContext);
        await DatabaseSeeder.SeedAsync(dbContext);

        Assert.Equal(3, await dbContext.Books.CountAsync());
    }
}
