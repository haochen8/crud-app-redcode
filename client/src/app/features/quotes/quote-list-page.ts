import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { Quote, toQuoteRequest } from './quote.models';
import { QuoteService } from './quote.service';

function notWhitespace(control: AbstractControl): ValidationErrors | null {
  return typeof control.value === 'string' && control.value.trim().length > 0
    ? null
    : { whitespace: true };
}

@Component({
  selector: 'app-quote-list-page',
  imports: [DatePipe, ReactiveFormsModule],
  templateUrl: './quote-list-page.html',
  styleUrl: './quote-list-page.scss',
})
export class QuoteListPage {
  private readonly quoteService = inject(QuoteService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly quotes = signal<Quote[]>([]);
  protected readonly searchTerm = signal('');
  protected readonly isLoading = signal(true);
  protected readonly isSaving = signal(false);
  protected readonly deletingId = signal<number | null>(null);
  protected readonly pendingDeleteId = signal<number | null>(null);
  protected readonly editingId = signal<number | null>(null);
  protected readonly isFormOpen = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);
  protected readonly quoteForm = this.formBuilder.nonNullable.group({
    text: ['', [Validators.required, notWhitespace, Validators.maxLength(500)]],
    author: ['', [Validators.required, notWhitespace, Validators.maxLength(120)]],
  });
  protected readonly filteredQuotes = computed(() => {
    const query = this.searchTerm().trim().toLocaleLowerCase();
    return query
      ? this.quotes().filter((quote) =>
          `${quote.text} ${quote.author}`.toLocaleLowerCase().includes(query),
        )
      : this.quotes();
  });

  constructor() {
    this.loadQuotes();
  }

  protected loadQuotes(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.quoteService
      .getAll()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: (quotes) => this.quotes.set(quotes),
        error: (error: unknown) => this.errorMessage.set(this.getErrorMessage(error)),
      });
  }

  protected dismissSuccess(): void {
    this.successMessage.set(null);
  }

  protected updateSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  protected clearSearch(): void {
    this.searchTerm.set('');
  }

  protected startCreate(): void {
    this.editingId.set(null);
    this.quoteForm.reset();
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.isFormOpen.set(true);
  }

  protected startEdit(quote: Quote): void {
    this.editingId.set(quote.id);
    this.quoteForm.setValue({ text: quote.text, author: quote.author });
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.isFormOpen.set(true);
  }

  protected cancelForm(): void {
    this.isFormOpen.set(false);
    this.editingId.set(null);
    this.quoteForm.reset();
  }

  protected submit(): void {
    if (this.quoteForm.invalid || this.isSaving()) {
      this.quoteForm.markAllAsTouched();
      return;
    }

    const editingId = this.editingId();
    const request = toQuoteRequest(this.quoteForm.getRawValue());
    const saveRequest = editingId === null
      ? this.quoteService.create(request)
      : this.quoteService.update(editingId, request);

    this.isSaving.set(true);
    this.errorMessage.set(null);
    saveRequest
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isSaving.set(false)),
      )
      .subscribe({
        next: (savedQuote) => {
          this.quotes.update((quotes) =>
            editingId === null
              ? [...quotes, savedQuote]
              : quotes.map((quote) => (quote.id === savedQuote.id ? savedQuote : quote)),
          );
          this.cancelForm();
          this.successMessage.set(
            editingId === null ? 'Quote added successfully.' : 'Quote updated successfully.',
          );
        },
        error: (error: unknown) => this.errorMessage.set(this.getErrorMessage(error)),
      });
  }

  protected deleteQuote(quote: Quote): void {
    this.pendingDeleteId.set(null);
    this.deletingId.set(quote.id);
    this.errorMessage.set(null);
    this.quoteService
      .delete(quote.id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.deletingId.set(null)),
      )
      .subscribe({
        next: () => {
          this.quotes.update((quotes) => quotes.filter((item) => item.id !== quote.id));
          this.successMessage.set('Quote deleted successfully.');
        },
        error: (error: unknown) => this.errorMessage.set(this.getErrorMessage(error)),
      });
  }

  protected requestDelete(quote: Quote): void {
    this.pendingDeleteId.set(quote.id);
    this.successMessage.set(null);
  }

  protected cancelDelete(): void {
    this.pendingDeleteId.set(null);
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse && error.status === 0) {
      return 'The API is unavailable. Check that it is running, then try again.';
    }

    if (error instanceof HttpErrorResponse && typeof error.error?.title === 'string') {
      return error.error.title;
    }

    return 'The quote could not be updated. Please try again.';
  }
}
