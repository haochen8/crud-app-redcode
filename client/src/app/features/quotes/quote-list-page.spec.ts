import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { Quote } from './quote.models';
import { QuoteListPage } from './quote-list-page';
import { QuoteService } from './quote.service';

describe('QuoteListPage', () => {
  let quoteService: jasmine.SpyObj<QuoteService>;
  const starterQuotes: Quote[] = Array.from({ length: 5 }, (_, index) => ({
    id: index + 1,
    text: `Starter quote ${index + 1}`,
    author: `Author ${index + 1}`,
    createdAt: '2026-08-31T18:00:00Z',
  }));

  beforeEach(() => {
    quoteService = jasmine.createSpyObj<QuoteService>('QuoteService', [
      'getAll',
      'create',
      'update',
      'delete',
    ]);
    TestBed.configureTestingModule({
      imports: [QuoteListPage],
      providers: [{ provide: QuoteService, useValue: quoteService }],
    });
  });

  it('shows all five starter quotes in responsive cards', () => {
    quoteService.getAll.and.returnValue(of(starterQuotes));

    const fixture = TestBed.createComponent(QuoteListPage);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('article.quote-card').length).toBe(5);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Starter quote 5');
  });

  it('adds a validated quote without reloading', () => {
    quoteService.getAll.and.returnValue(of(starterQuotes));
    quoteService.create.and.returnValue(
      of({
        id: 6,
        text: 'A new quote',
        author: 'New Author',
        createdAt: '2026-08-31T18:00:00Z',
      }),
    );
    const fixture = TestBed.createComponent(QuoteListPage);
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('button.btn-primary') as HTMLButtonElement).click();
    fixture.detectChanges();
    setInput(fixture.nativeElement, '#quote-text', '  A new quote  ');
    setInput(fixture.nativeElement, '#quote-author', ' New Author ');
    submit(fixture.nativeElement);
    fixture.detectChanges();

    expect(quoteService.create).toHaveBeenCalledOnceWith({
      text: 'A new quote',
      author: 'New Author',
    });
    expect(fixture.nativeElement.querySelectorAll('article.quote-card').length).toBe(6);
    expect(fixture.nativeElement.querySelector('[role="status"]')?.textContent).toContain(
      'added successfully',
    );
  });

  it('does not submit an invalid quote form and exposes field errors', () => {
    quoteService.getAll.and.returnValue(of(starterQuotes));
    const fixture = TestBed.createComponent(QuoteListPage);
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('button.btn-primary') as HTMLButtonElement).click();
    fixture.detectChanges();
    submit(fixture.nativeElement);
    fixture.detectChanges();

    expect(quoteService.create).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelectorAll('.is-invalid').length).toBe(2);
    expect(fixture.nativeElement.querySelectorAll('[aria-invalid="true"]').length).toBe(2);
  });

  it('edits an existing quote in local state', () => {
    quoteService.getAll.and.returnValue(of(starterQuotes));
    quoteService.update.and.returnValue(of({ ...starterQuotes[0], text: 'Updated quote' }));
    const fixture = TestBed.createComponent(QuoteListPage);
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('.quote-card .btn-outline-primary') as HTMLButtonElement).click();
    fixture.detectChanges();
    setInput(fixture.nativeElement, '#quote-text', 'Updated quote');
    submit(fixture.nativeElement);
    fixture.detectChanges();

    expect(quoteService.update).toHaveBeenCalledOnceWith(1, {
      text: 'Updated quote',
      author: 'Author 1',
    });
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Updated quote');
    expect(fixture.nativeElement.querySelector('[role="status"]')?.textContent).toContain(
      'updated successfully',
    );
  });

  it('requires inline confirmation and removes only a successfully deleted quote', () => {
    quoteService.getAll.and.returnValue(of(starterQuotes));
    quoteService.delete.and.returnValue(of(undefined));
    const fixture = TestBed.createComponent(QuoteListPage);
    fixture.detectChanges();
    const deleteButton = fixture.nativeElement.querySelector(
      '.quote-card .btn-outline-danger',
    ) as HTMLButtonElement;

    deleteButton.click();
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('.delete-panel .btn-outline-secondary') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(quoteService.delete).not.toHaveBeenCalled();
    (fixture.nativeElement.querySelector('.quote-card .btn-outline-danger') as HTMLButtonElement).click();
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('.delete-panel .btn-danger') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(quoteService.delete).toHaveBeenCalledOnceWith(1);
    expect(fixture.nativeElement.querySelectorAll('article.quote-card').length).toBe(4);
    expect(fixture.nativeElement.querySelector('[role="status"]')?.textContent).toContain(
      'deleted successfully',
    );
  });

  it('shows API errors clearly', () => {
    quoteService.getAll.and.returnValue(throwError(() => new Error('failed')));
    const fixture = TestBed.createComponent(QuoteListPage);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeTruthy();
  });

  it('shows an empty state with an add action', () => {
    quoteService.getAll.and.returnValue(of([]));
    const fixture = TestBed.createComponent(QuoteListPage);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('No quotes yet');
  });

  it('filters saved quotes by words or author', () => {
    quoteService.getAll.and.returnValue(of(starterQuotes));
    const fixture = TestBed.createComponent(QuoteListPage);
    fixture.detectChanges();
    const search = fixture.nativeElement.querySelector('#quote-search') as HTMLInputElement;

    search.value = 'Author 4';
    search.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('article.quote-card').length).toBe(1);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Starter quote 4');
  });

  function setInput(element: HTMLElement, selector: string, value: string): void {
    const input = element.querySelector(selector) as HTMLInputElement | HTMLTextAreaElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
  }

  function submit(element: HTMLElement): void {
    element.querySelector('form')?.dispatchEvent(new Event('submit'));
  }
});
