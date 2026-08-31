using Microsoft.AspNetCore.Identity;

namespace BookQuotes.Api.Models;

public sealed class ApplicationUser : IdentityUser
{
    public ICollection<Quote> Quotes { get; } = [];
}
