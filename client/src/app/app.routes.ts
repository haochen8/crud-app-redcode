import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'books' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login-page').then((page) => page.LoginPage),
    title: 'Login | Book & Quotes',
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register-page').then((page) => page.RegisterPage),
    title: 'Register | Book & Quotes',
  },
  {
    path: 'books',
    loadComponent: () =>
      import('./features/books/book-list-page').then((page) => page.BookListPage),
    title: 'Books | Book & Quotes',
  },
  {
    path: 'books/new',
    loadComponent: () =>
      import('./features/books/book-form-page').then((page) => page.BookFormPage),
    data: { mode: 'create' },
    title: 'Add Book | Book & Quotes',
  },
  {
    path: 'books/:id/edit',
    loadComponent: () =>
      import('./features/books/book-form-page').then((page) => page.BookFormPage),
    data: { mode: 'edit' },
    title: 'Edit Book | Book & Quotes',
  },
  {
    path: 'quotes',
    loadComponent: () =>
      import('./features/quotes/quote-list-page').then((page) => page.QuoteListPage),
    title: 'My Quotes | Book & Quotes',
  },
  {
    path: '**',
    loadComponent: () =>
      import('./features/not-found/not-found-page').then((page) => page.NotFoundPage),
    title: 'Page Not Found | Book & Quotes',
  },
];
