namespace BookQuotes.Api.Models;

public sealed class Quote
{
    public int Id { get; set; }
    public required string Text { get; set; }
    public required string Author { get; set; }
    public required string UserId { get; set; }
    public required ApplicationUser User { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}
