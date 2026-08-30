import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-book-list-page',
  imports: [RouterLink],
  template: `
    <section aria-labelledby="books-title">
      <div class="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 mb-4">
        <div>
          <h1 id="books-title" class="h2 mb-1">Books</h1>
          <p class="text-body-secondary mb-0">Your book collection will appear here.</p>
        </div>
        <a class="btn btn-primary align-self-start" routerLink="/books/new">
          <i class="fa-solid fa-plus me-1" aria-hidden="true"></i>
          Add New Book
        </a>
      </div>
    </section>
  `,
})
export class BookListPage {}
