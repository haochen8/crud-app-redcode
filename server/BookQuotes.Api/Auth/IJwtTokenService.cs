using BookQuotes.Api.Models;

namespace BookQuotes.Api.Auth;

public interface IJwtTokenService
{
    JwtTokenResult CreateToken(ApplicationUser user);
}
