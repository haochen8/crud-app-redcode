using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using BookQuotes.Api.Contracts.Quotes;
using BookQuotes.Api.Data;
using BookQuotes.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BookQuotes.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public sealed class QuotesController(ApplicationDbContext dbContext) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType<IReadOnlyList<QuoteResponse>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<QuoteResponse>>> GetAll(
        CancellationToken cancellationToken)
    {
        var quotes = await dbContext.Quotes
            .AsNoTracking()
            .Where(quote => quote.UserId == GetUserId())
            .OrderBy(quote => quote.Id)
            .Select(quote => new QuoteResponse(
                quote.Id,
                quote.Text,
                quote.Author,
                quote.CreatedAt))
            .ToListAsync(cancellationToken);

        return Ok(quotes);
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType<QuoteResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<QuoteResponse>> GetById(
        int id,
        CancellationToken cancellationToken)
    {
        var quote = await FindOwnedQuote(id, asTracking: false, cancellationToken);
        return quote is null ? NotFound() : Ok(ToResponse(quote));
    }

    [HttpPost]
    [ProducesResponseType<QuoteResponse>(StatusCodes.Status201Created)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<QuoteResponse>> Create(
        CreateQuoteRequest request,
        CancellationToken cancellationToken)
    {
        var quote = new Quote
        {
            Text = request.Text.Trim(),
            Author = request.Author.Trim(),
            UserId = GetUserId(),
            CreatedAt = DateTimeOffset.UtcNow,
        };

        dbContext.Quotes.Add(quote);
        await dbContext.SaveChangesAsync(cancellationToken);

        return CreatedAtAction(nameof(GetById), new { id = quote.Id }, ToResponse(quote));
    }

    [HttpPut("{id:int}")]
    [ProducesResponseType<QuoteResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<QuoteResponse>> Update(
        int id,
        UpdateQuoteRequest request,
        CancellationToken cancellationToken)
    {
        var quote = await FindOwnedQuote(id, asTracking: true, cancellationToken);
        if (quote is null)
        {
            return NotFound();
        }

        quote.Text = request.Text.Trim();
        quote.Author = request.Author.Trim();
        await dbContext.SaveChangesAsync(cancellationToken);

        return Ok(ToResponse(quote));
    }

    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var quote = await FindOwnedQuote(id, asTracking: true, cancellationToken);
        if (quote is null)
        {
            return NotFound();
        }

        dbContext.Quotes.Remove(quote);
        await dbContext.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    private async Task<Quote?> FindOwnedQuote(
        int id,
        bool asTracking,
        CancellationToken cancellationToken)
    {
        var query = dbContext.Quotes
            .Where(quote => quote.Id == id && quote.UserId == GetUserId());

        return await (asTracking ? query : query.AsNoTracking())
            .SingleOrDefaultAsync(cancellationToken);
    }

    private string GetUserId() =>
        User.FindFirstValue(JwtRegisteredClaimNames.Sub)
        ?? throw new InvalidOperationException("The authenticated token has no subject claim.");

    private static QuoteResponse ToResponse(Quote quote) => new(
        quote.Id,
        quote.Text,
        quote.Author,
        quote.CreatedAt);
}
