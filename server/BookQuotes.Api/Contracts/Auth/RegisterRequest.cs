using System.ComponentModel.DataAnnotations;
using BookQuotes.Api.Validation;

namespace BookQuotes.Api.Contracts.Auth;

public sealed class RegisterRequest
{
    [NotWhiteSpace]
    [StringLength(50, MinimumLength = 3)]
    public required string UserName { get; init; }

    [Required]
    [StringLength(100, MinimumLength = 8)]
    public required string Password { get; init; }

    [Required]
    [Compare(nameof(Password))]
    public required string ConfirmPassword { get; init; }
}
