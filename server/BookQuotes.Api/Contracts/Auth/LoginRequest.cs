using System.ComponentModel.DataAnnotations;
using BookQuotes.Api.Validation;

namespace BookQuotes.Api.Contracts.Auth;

public sealed class LoginRequest
{
    [NotWhiteSpace]
    public required string UserName { get; init; }

    [Required]
    public required string Password { get; init; }
}
