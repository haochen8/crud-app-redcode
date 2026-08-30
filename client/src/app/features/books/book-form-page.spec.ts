import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Subject, throwError } from 'rxjs';
import { Book } from './book.models';
import { BookFormPage } from './book-form-page';
import { BookService } from './book.service';

describe('BookFormPage', () => {
  let bookService: jasmine.SpyObj<BookService>;
  const savedBook: Book = {
    id: 1,
    title: 'Kindred',
    author: 'Octavia E. Butler',
    publishedDate: '1979-06-01',
    createdAt: '2026-08-30T20:00:00Z',
  };

  beforeEach(() => {
    bookService = jasmine.createSpyObj<BookService>('BookService', ['create', 'getById', 'update']);
    TestBed.configureTestingModule({
      imports: [BookFormPage],
      providers: [provideRouter([]), { provide: BookService, useValue: bookService }],
    });
  });

  it('does not submit an invalid form and shows field errors', () => {
    const fixture = TestBed.createComponent(BookFormPage);
    fixture.detectChanges();

    submit(fixture.nativeElement);
    fixture.detectChanges();

    expect(bookService.create).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelectorAll('.is-invalid').length).toBe(3);
  });

  it('normalizes and submits once, then navigates after success', () => {
    const result = new Subject<Book>();
    bookService.create.and.returnValue(result);
    const router = TestBed.inject(Router);
    spyOn(router, 'navigateByUrl').and.resolveTo(true);
    const fixture = TestBed.createComponent(BookFormPage);
    fixture.detectChanges();
    fillValidForm(fixture.nativeElement);

    submit(fixture.nativeElement);
    submit(fixture.nativeElement);

    expect(bookService.create).toHaveBeenCalledOnceWith({
      title: 'Kindred',
      author: 'Octavia E. Butler',
      publishedDate: '1979-06-01',
    });
    expect(router.navigateByUrl).not.toHaveBeenCalled();

    result.next(savedBook);
    result.complete();

    expect(router.navigateByUrl).toHaveBeenCalledOnceWith('/books');
  });

  it('preserves values and displays a safe server error', () => {
    bookService.create.and.returnValue(
      throwError(
        () => new HttpErrorResponse({ status: 500, error: { title: 'The book could not be saved.' } }),
      ),
    );
    const fixture = TestBed.createComponent(BookFormPage);
    fixture.detectChanges();
    fillValidForm(fixture.nativeElement);

    submit(fixture.nativeElement);
    fixture.detectChanges();

    expect((fixture.nativeElement.querySelector('#book-title') as HTMLInputElement).value).toBe(
      '  Kindred  ',
    );
    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain(
      'The book could not be saved.',
    );
  });

  function fillValidForm(element: HTMLElement): void {
    setInput(element, '#book-title', '  Kindred  ');
    setInput(element, '#book-author', ' Octavia E. Butler ');
    setInput(element, '#book-published-date', '1979-06-01');
  }

  function setInput(element: HTMLElement, selector: string, value: string): void {
    const input = element.querySelector(selector) as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
  }

  function submit(element: HTMLElement): void {
    element.querySelector('form')?.dispatchEvent(new Event('submit'));
  }
});
