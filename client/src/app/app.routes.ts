import { Routes } from '@angular/router';
import { BookFormPage } from './features/books/book-form-page';
import { BookListPage } from './features/books/book-list-page';
import { LoginPage } from './features/auth/login-page';
import { NotFoundPage } from './features/not-found/not-found-page';
import { QuoteListPage } from './features/quotes/quote-list-page';
import { RegisterPage } from './features/auth/register-page';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'books' },
  { path: 'login', component: LoginPage, title: 'Login | Book & Quotes' },
  { path: 'register', component: RegisterPage, title: 'Register | Book & Quotes' },
  { path: 'books', component: BookListPage, title: 'Books | Book & Quotes' },
  {
    path: 'books/new',
    component: BookFormPage,
    data: { mode: 'create' },
    title: 'Add Book | Book & Quotes',
  },
  {
    path: 'books/:id/edit',
    component: BookFormPage,
    data: { mode: 'edit' },
    title: 'Edit Book | Book & Quotes',
  },
  { path: 'quotes', component: QuoteListPage, title: 'My Quotes | Book & Quotes' },
  { path: '**', component: NotFoundPage, title: 'Page Not Found | Book & Quotes' },
];
