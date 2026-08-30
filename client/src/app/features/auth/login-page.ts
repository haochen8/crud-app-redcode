import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login-page',
  imports: [RouterLink],
  template: `
    <section class="mx-auto" style="max-width: 36rem" aria-labelledby="login-title">
      <h1 id="login-title" class="h2">Login</h1>
      <p class="text-body-secondary">Sign in to manage your books and favorite quotes.</p>
      <p class="mb-0">New here? <a routerLink="/register">Create an account</a>.</p>
    </section>
  `,
})
export class LoginPage {}
