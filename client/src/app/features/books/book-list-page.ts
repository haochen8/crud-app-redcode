import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { Book } from './book.models';
import { BookService } from './book.service';

@Component({
  selector: 'app-book-list-page',
  imports: [DatePipe, RouterLink],
  templateUrl: './book-list-page.html',
  styleUrl: './book-list-page.scss',
})
export class BookListPage {
  private readonly bookService = inject(BookService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);

  protected readonly books = signal<Book[]>([]);
  protected readonly searchTerm = signal('');
  protected readonly sortBy = signal<'title' | 'author' | 'newest'>('title');
  protected readonly isLoading = signal(true);
  protected readonly deletingId = signal<number | null>(null);
  protected readonly pendingDeleteId = signal<number | null>(null);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(
    this.getNavigationSuccessMessage(),
  );
  protected readonly authorCount = computed(
    () => new Set(this.books().map((book) => book.author.toLocaleLowerCase())).size,
  );
  protected readonly filteredBooks = computed(() => {
    const query = this.searchTerm().trim().toLocaleLowerCase();
    const matchingBooks = query
      ? this.books().filter((book) =>
          `${book.title} ${book.author}`.toLocaleLowerCase().includes(query),
        )
      : [...this.books()];

    return matchingBooks.sort((left, right) => {
      switch (this.sortBy()) {
        case 'author':
          return left.author.localeCompare(right.author) || left.title.localeCompare(right.title);
        case 'newest':
          return right.publishedDate.localeCompare(left.publishedDate);
        default:
          return left.title.localeCompare(right.title);
      }
    });
  });

  constructor() {
    this.loadBooks();
  }

  protected loadBooks(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.bookService
      .getAll()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: (books) => this.books.set(books),
        error: (error: unknown) => this.errorMessage.set(this.getErrorMessage(error)),
      });
  }

  protected dismissSuccess(): void {
    this.successMessage.set(null);
  }

  protected updateSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  protected updateSort(event: Event): void {
    this.sortBy.set((event.target as HTMLSelectElement).value as 'title' | 'author' | 'newest');
  }

  protected clearSearch(): void {
    this.searchTerm.set('');
  }

  protected requestDelete(book: Book): void {
    this.pendingDeleteId.set(book.id);
    this.successMessage.set(null);
  }

  protected cancelDelete(): void {
    this.pendingDeleteId.set(null);
  }

  protected deleteBook(book: Book): void {
    this.pendingDeleteId.set(null);

    this.deletingId.set(book.id);
    this.errorMessage.set(null);
    this.bookService
      .delete(book.id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.deletingId.set(null)),
      )
      .subscribe({
        next: () => {
          this.books.update((books) => books.filter((item) => item.id !== book.id));
          this.successMessage.set(`“${book.title}” was deleted.`);
        },
        error: (error: unknown) => this.errorMessage.set(this.getErrorMessage(error)),
      });
  }

  private getErrorMessage(error: unknown): string {
    return error instanceof HttpErrorResponse && error.status === 0
      ? 'The API is unavailable. Check that it is running, then try again.'
      : 'We could not update the book list. Please try again.';
  }

  private getNavigationSuccessMessage(): string | null {
    const value = this.router.getCurrentNavigation()?.extras.state?.['successMessage'];
    return typeof value === 'string' ? value : null;
  }
}
