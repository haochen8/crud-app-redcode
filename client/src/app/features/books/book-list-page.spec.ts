import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Book } from './book.models';
import { BookService } from './book.service';
import { BookListPage } from './book-list-page';

describe('BookListPage', () => {
  let bookService: jasmine.SpyObj<BookService>;
  const book: Book = {
    id: 1,
    title: 'Kindred',
    author: 'Octavia E. Butler',
    publishedDate: '1979-06-01',
    createdAt: '2026-08-30T20:00:00Z',
  };

  beforeEach(() => {
    bookService = jasmine.createSpyObj<BookService>('BookService', ['getAll', 'delete']);
    TestBed.configureTestingModule({
      imports: [BookListPage],
      providers: [provideRouter([]), { provide: BookService, useValue: bookService }],
    });
  });

  it('renders every returned book in responsive views', () => {
    bookService.getAll.and.returnValue(of([book]));

    const fixture = TestBed.createComponent(BookListPage);
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(text).toContain('Kindred');
    expect(text).toContain('Octavia E. Butler');
    expect(text).toContain('Jun 1, 1979');
    expect(fixture.nativeElement.querySelector('table')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('article.card')).toBeTruthy();
  });

  it('renders an understandable empty state', () => {
    bookService.getAll.and.returnValue(of([]));

    const fixture = TestBed.createComponent(BookListPage);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('No books yet');
  });

  it('renders an error state with a retry action', () => {
    bookService.getAll.and.returnValue(throwError(() => new Error('failed')));

    const fixture = TestBed.createComponent(BookListPage);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeTruthy();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Retry');
  });

  it('does not delete when confirmation is cancelled', () => {
    bookService.getAll.and.returnValue(of([book]));
    spyOn(globalThis, 'confirm').and.returnValue(false);
    const fixture = TestBed.createComponent(BookListPage);
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('button.btn-outline-danger') as HTMLButtonElement).click();

    expect(bookService.delete).not.toHaveBeenCalled();
  });
});
