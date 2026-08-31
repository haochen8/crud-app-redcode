using BookQuotes.Api.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace BookQuotes.Api.Data;

public sealed class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
    : IdentityDbContext<ApplicationUser>(options)
{
    public DbSet<Book> Books => Set<Book>();
    public DbSet<Quote> Quotes => Set<Quote>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<Book>(book =>
        {
            book.Property(item => item.Title)
                .HasMaxLength(200)
                .IsRequired();

            book.Property(item => item.Author)
                .HasMaxLength(120)
                .IsRequired();

            book.Property(item => item.PublishedDate)
                .IsRequired();

            book.Property(item => item.CreatedAt)
                .IsRequired();
        });

        builder.Entity<Quote>(quote =>
        {
            quote.Property(item => item.Text)
                .HasMaxLength(500)
                .IsRequired();

            quote.Property(item => item.Author)
                .HasMaxLength(120)
                .IsRequired();

            quote.Property(item => item.UserId)
                .IsRequired();

            quote.Property(item => item.CreatedAt)
                .IsRequired();

            quote.HasIndex(item => item.UserId);

            quote.HasOne(item => item.User)
                .WithMany(user => user.Quotes)
                .HasForeignKey(item => item.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
