using BookQuotes.Api.Contracts.Books;
using BookQuotes.Api.Data;
using BookQuotes.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BookQuotes.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public sealed class BooksController(ApplicationDbContext dbContext) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType<IReadOnlyList<BookResponse>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<BookResponse>>> GetAll(
        CancellationToken cancellationToken)
    {
        var books = await dbContext.Books
            .AsNoTracking()
            .OrderBy(book => book.Title)
            .Select(book => new BookResponse(
                book.Id,
                book.Title,
                book.Author,
                book.PublishedDate,
                book.CreatedAt))
            .ToListAsync(cancellationToken);

        return Ok(books);
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType<BookResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<BookResponse>> GetById(
        int id,
        CancellationToken cancellationToken)
    {
        var book = await dbContext.Books
            .AsNoTracking()
            .SingleOrDefaultAsync(item => item.Id == id, cancellationToken);

        return book is null ? NotFound() : Ok(ToResponse(book));
    }

    [HttpPost]
    [ProducesResponseType<BookResponse>(StatusCodes.Status201Created)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<BookResponse>> Create(
        CreateBookRequest request,
        CancellationToken cancellationToken)
    {
        var book = new Book
        {
            Title = request.Title.Trim(),
            Author = request.Author.Trim(),
            PublishedDate = request.PublishedDate,
            CreatedAt = DateTimeOffset.UtcNow,
        };

        dbContext.Books.Add(book);
        await dbContext.SaveChangesAsync(cancellationToken);

        var response = ToResponse(book);
        return CreatedAtAction(nameof(GetById), new { id = book.Id }, response);
    }

    [HttpPut("{id:int}")]
    [ProducesResponseType<BookResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<BookResponse>> Update(
        int id,
        UpdateBookRequest request,
        CancellationToken cancellationToken)
    {
        var book = await dbContext.Books.SingleOrDefaultAsync(
            item => item.Id == id,
            cancellationToken);

        if (book is null)
        {
            return NotFound();
        }

        book.Title = request.Title.Trim();
        book.Author = request.Author.Trim();
        book.PublishedDate = request.PublishedDate;

        await dbContext.SaveChangesAsync(cancellationToken);
        return Ok(ToResponse(book));
    }

    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var book = await dbContext.Books.SingleOrDefaultAsync(
            item => item.Id == id,
            cancellationToken);

        if (book is null)
        {
            return NotFound();
        }

        dbContext.Books.Remove(book);
        await dbContext.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    private static BookResponse ToResponse(Book book) => new(
        book.Id,
        book.Title,
        book.Author,
        book.PublishedDate,
        book.CreatedAt);
}
