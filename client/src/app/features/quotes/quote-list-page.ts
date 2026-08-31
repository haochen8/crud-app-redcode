import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, signal } from '@angular/core';
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
  protected readonly isLoading = signal(true);
  protected readonly isSaving = signal(false);
  protected readonly deletingId = signal<number | null>(null);
  protected readonly editingId = signal<number | null>(null);
  protected readonly isFormOpen = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly quoteForm = this.formBuilder.nonNullable.group({
    text: ['', [Validators.required, notWhitespace, Validators.maxLength(500)]],
    author: ['', [Validators.required, notWhitespace, Validators.maxLength(120)]],
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

  protected startCreate(): void {
    this.editingId.set(null);
    this.quoteForm.reset();
    this.errorMessage.set(null);
    this.isFormOpen.set(true);
  }

  protected startEdit(quote: Quote): void {
    this.editingId.set(quote.id);
    this.quoteForm.setValue({ text: quote.text, author: quote.author });
    this.errorMessage.set(null);
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
        },
        error: (error: unknown) => this.errorMessage.set(this.getErrorMessage(error)),
      });
  }

  protected deleteQuote(quote: Quote): void {
    if (!globalThis.confirm(`Delete this quote by ${quote.author}? This action cannot be undone.`)) {
      return;
    }

    this.deletingId.set(quote.id);
    this.errorMessage.set(null);
    this.quoteService
      .delete(quote.id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.deletingId.set(null)),
      )
      .subscribe({
        next: () => this.quotes.update((quotes) => quotes.filter((item) => item.id !== quote.id)),
        error: (error: unknown) => this.errorMessage.set(this.getErrorMessage(error)),
      });
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
