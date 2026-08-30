import { Component } from '@angular/core';

@Component({
  selector: 'app-quote-list-page',
  template: `
    <section aria-labelledby="quotes-title">
      <h1 id="quotes-title" class="h2">My Quotes</h1>
      <p class="text-body-secondary">Your five starter quotes and personal favorites will appear here.</p>
    </section>
  `,
})
export class QuoteListPage {}
