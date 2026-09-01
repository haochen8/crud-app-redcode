using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace BookQuotes.Api.Data;

public sealed class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        var provider = Environment.GetEnvironmentVariable("Database__Provider") ?? "Sqlite";
        var connectionString = Environment.GetEnvironmentVariable(
            "ConnectionStrings__DefaultConnection") ?? "Data Source=bookquotes.db";
        var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();

        if (provider.Equals("SqlServer", StringComparison.OrdinalIgnoreCase))
        {
            optionsBuilder.UseSqlServer(connectionString);
        }
        else if (provider.Equals("Sqlite", StringComparison.OrdinalIgnoreCase))
        {
            optionsBuilder.UseSqlite(connectionString);
        }
        else
        {
            throw new InvalidOperationException(
                $"Unsupported database provider '{provider}'. Use 'Sqlite' or 'SqlServer'.");
        }

        return new ApplicationDbContext(optionsBuilder.Options);
    }
}
