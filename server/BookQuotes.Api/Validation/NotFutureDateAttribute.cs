using System.ComponentModel.DataAnnotations;

namespace BookQuotes.Api.Validation;

[AttributeUsage(AttributeTargets.Property | AttributeTargets.Parameter)]
public sealed class NotFutureDateAttribute : ValidationAttribute
{
    public NotFutureDateAttribute()
        : base("The {0} field must be a valid date that is not in the future.")
    {
    }

    public override bool IsValid(object? value)
    {
        if (value is not DateOnly date || date == default)
        {
            return false;
        }

        return date <= DateOnly.FromDateTime(DateTime.UtcNow);
    }
}
