using BookQuotes.Api.Contracts.Auth;
using BookQuotes.Api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace BookQuotes.Api.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController(UserManager<ApplicationUser> userManager) : ControllerBase
{
    [HttpPost("register")]
    [ProducesResponseType<UserResponse>(StatusCodes.Status201Created)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<UserResponse>> Register(
        RegisterRequest request,
        CancellationToken cancellationToken)
    {
        var user = new ApplicationUser
        {
            UserName = request.UserName.Trim(),
        };

        var result = await userManager.CreateAsync(user, request.Password);
        cancellationToken.ThrowIfCancellationRequested();

        if (!result.Succeeded)
        {
            var problemDetails = CreateIdentityErrors(result.Errors);
            problemDetails.Extensions["traceId"] = HttpContext.TraceIdentifier;
            return ValidationProblem(problemDetails);
        }

        return StatusCode(
            StatusCodes.Status201Created,
            new UserResponse(user.Id, user.UserName));
    }

    private static ValidationProblemDetails CreateIdentityErrors(
        IEnumerable<IdentityError> errors)
    {
        var groupedErrors = errors
            .GroupBy(error => GetFieldName(error.Code))
            .ToDictionary(
                group => group.Key,
                group => group.Select(error => error.Description).ToArray());

        return new ValidationProblemDetails(groupedErrors)
        {
            Type = "https://tools.ietf.org/html/rfc9110#section-15.5.1",
            Title = "Registration failed.",
            Status = StatusCodes.Status400BadRequest,
        };
    }

    private static string GetFieldName(string errorCode) => errorCode switch
    {
        var code when code.StartsWith("Password", StringComparison.Ordinal) => "password",
        var code when code.Contains("UserName", StringComparison.Ordinal) => "userName",
        _ => string.Empty,
    };
}
