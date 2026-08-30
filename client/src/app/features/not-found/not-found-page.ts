import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink],
  template: `
    <section class="text-center py-5" aria-labelledby="not-found-title">
      <i class="fa-solid fa-compass fa-3x text-primary mb-3" aria-hidden="true"></i>
      <h1 id="not-found-title" class="h2">Page Not Found</h1>
      <p class="text-body-secondary">The page you requested does not exist.</p>
      <a class="btn btn-primary" routerLink="/books">Return to Books</a>
    </section>
  `,
})
export class NotFoundPage {}
