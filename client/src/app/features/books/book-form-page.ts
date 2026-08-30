import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-book-form-page',
  imports: [RouterLink],
  template: `
    <section class="mx-auto" style="max-width: 48rem" [attr.aria-labelledby]="headingId">
      <h1 [id]="headingId" class="h2">{{ isEdit ? 'Edit Book' : 'Add New Book' }}</h1>
      <p class="text-body-secondary">The book form will be available here.</p>
      <a class="btn btn-outline-secondary" routerLink="/books">Back to Books</a>
    </section>
  `,
})
export class BookFormPage {
  private readonly route = inject(ActivatedRoute);
  protected readonly isEdit = this.route.snapshot.data['mode'] === 'edit';
  protected readonly headingId = this.isEdit ? 'edit-book-title' : 'add-book-title';
}
