import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { toBookFormValue, toBookRequest } from './book.models';
import { BookService } from './book.service';

function notWhitespace(control: AbstractControl): ValidationErrors | null {
  return typeof control.value === 'string' && control.value.trim().length > 0
    ? null
    : { whitespace: true };
}

function notFutureDate(control: AbstractControl): ValidationErrors | null {
  return typeof control.value === 'string' && control.value > getTodayValue()
    ? { futureDate: true }
    : null;
}

function getTodayValue(): string {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${today.getFullYear()}-${month}-${day}`;
}

@Component({
  selector: 'app-book-form-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './book-form-page.html',
})
export class BookFormPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);
  private readonly bookService = inject(BookService);

  protected readonly isEdit = this.route.snapshot.data['mode'] === 'edit';
  protected readonly headingId = this.isEdit ? 'edit-book-title' : 'add-book-title';
  protected readonly today = getTodayValue();
  protected readonly isLoading = signal(this.isEdit);
  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly bookId = signal<number | null>(null);
  protected readonly bookForm = this.formBuilder.nonNullable.group({
    title: ['', [Validators.required, notWhitespace, Validators.maxLength(200)]],
    author: ['', [Validators.required, notWhitespace, Validators.maxLength(120)]],
    publishedDate: ['', [Validators.required, notFutureDate]],
  });

  constructor() {
    if (this.isEdit) {
      this.loadBook();
    }
  }

  protected submit(): void {
    if (this.bookForm.invalid || this.isSubmitting()) {
      this.bookForm.markAllAsTouched();
      return;
    }

    if (this.isEdit && this.bookId() === null) {
      return;
    }

    this.errorMessage.set(null);
    this.isSubmitting.set(true);
    const request = toBookRequest(this.bookForm.getRawValue());
    const saveRequest = this.isEdit
      ? this.bookService.update(this.bookId()!, request)
      : this.bookService.create(request);
    saveRequest
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => void this.router.navigateByUrl('/books'),
        error: (error: unknown) => this.errorMessage.set(this.getErrorMessage(error)),
      });
  }

  private loadBook(): void {
    const routeId = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isSafeInteger(routeId) || routeId <= 0) {
      this.errorMessage.set('The book ID in this URL is invalid.');
      this.isLoading.set(false);
      return;
    }

    this.bookId.set(routeId);
    this.bookService
      .getById(routeId)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (book) => this.bookForm.setValue(toBookFormValue(book)),
        error: (error: unknown) => {
          this.bookId.set(null);
          this.errorMessage.set(
            error instanceof HttpErrorResponse && error.status === 404
              ? 'The requested book was not found.'
              : this.getErrorMessage(error),
          );
        },
      });
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return 'The API is unavailable. Your values are still here; check the API and try again.';
      }

      if (typeof error.error?.title === 'string') {
        return error.error.title;
      }
    }

    return 'The book could not be saved. Your values are still here; please try again.';
  }
}
