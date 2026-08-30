import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
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

  protected readonly books = signal<Book[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly deletingId = signal<number | null>(null);
  protected readonly errorMessage = signal<string | null>(null);

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

  protected deleteBook(book: Book): void {
    const confirmed = globalThis.confirm(`Delete “${book.title}”? This action cannot be undone.`);
    if (!confirmed) {
      return;
    }

    this.deletingId.set(book.id);
    this.errorMessage.set(null);
    this.bookService
      .delete(book.id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.deletingId.set(null)),
      )
      .subscribe({
        next: () => this.books.update((books) => books.filter((item) => item.id !== book.id)),
        error: (error: unknown) => this.errorMessage.set(this.getErrorMessage(error)),
      });
  }

  private getErrorMessage(error: unknown): string {
    return error instanceof HttpErrorResponse && error.status === 0
      ? 'The API is unavailable. Check that it is running, then try again.'
      : 'We could not update the book list. Please try again.';
  }
}
