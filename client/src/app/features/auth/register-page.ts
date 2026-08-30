import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-register-page',
  imports: [RouterLink],
  template: `
    <section class="mx-auto" style="max-width: 36rem" aria-labelledby="register-title">
      <h1 id="register-title" class="h2">Create account</h1>
      <p class="text-body-secondary">Register to start managing your personal collection.</p>
      <p class="mb-0">Already registered? <a routerLink="/login">Go to login</a>.</p>
    </section>
  `,
})
export class RegisterPage {}
