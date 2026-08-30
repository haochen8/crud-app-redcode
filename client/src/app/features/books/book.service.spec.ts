import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { Book, toBookFormValue, toBookRequest } from './book.models';
import { BookService } from './book.service';

describe('BookService', () => {
  let service: BookService;
  let httpTesting: HttpTestingController;
  const booksUrl = `${environment.apiUrl}/books`;
  const book: Book = {
    id: 7,
    title: 'Kindred',
    author: 'Octavia E. Butler',
    publishedDate: '1979-06-01',
    createdAt: '2026-08-30T20:00:00Z',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(BookService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('gets all books', () => {
    let result: Book[] | undefined;
    service.getAll().subscribe((books) => (result = books));

    const request = httpTesting.expectOne(booksUrl);
    expect(request.request.method).toBe('GET');
    request.flush([book]);
    expect(result).toEqual([book]);
  });

  it('gets one book by id', () => {
    service.getById(7).subscribe();

    const request = httpTesting.expectOne(`${booksUrl}/7`);
    expect(request.request.method).toBe('GET');
    request.flush(book);
  });

  it('creates a book with the backend payload contract', () => {
    const payload = { title: 'Kindred', author: 'Octavia E. Butler', publishedDate: '1979-06-01' };
    service.create(payload).subscribe();

    const request = httpTesting.expectOne(booksUrl);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush(book);
  });

  it('updates a book with the backend payload contract', () => {
    const payload = { title: 'Kindred', author: 'Octavia E. Butler', publishedDate: '1979-06-01' };
    service.update(7, payload).subscribe();

    const request = httpTesting.expectOne(`${booksUrl}/7`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(payload);
    request.flush(book);
  });

  it('deletes a book by id', () => {
    service.delete(7).subscribe();

    const request = httpTesting.expectOne(`${booksUrl}/7`);
    expect(request.request.method).toBe('DELETE');
    request.flush(null);
  });

  it('normalizes form whitespace and API dates', () => {
    expect(
      toBookRequest({
        title: '  Kindred  ',
        author: '  Octavia E. Butler ',
        publishedDate: '1979-06-01T00:00:00Z',
      }),
    ).toEqual({
      title: 'Kindred',
      author: 'Octavia E. Butler',
      publishedDate: '1979-06-01',
    });
    expect(toBookFormValue(book).publishedDate).toBe('1979-06-01');
  });
});
