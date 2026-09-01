import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService, getSafeAuthError } from '../../core/auth/auth.service';

function passwordsMatch(control: AbstractControl): ValidationErrors | null {
  return control.get('password')?.value === control.get('confirmPassword')?.value
    ? null
    : { passwordMismatch: true };
}

@Component({
  selector: 'app-register-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register-page.html',
  styleUrl: './auth-page.scss',
})
export class RegisterPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly isSubmitting = signal(false);
  protected readonly showPasswords = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly registerForm = this.formBuilder.nonNullable.group(
    {
      userName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(100),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/),
        ],
      ],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordsMatch },
  );
  private readonly passwordValue = toSignal(this.registerForm.controls.password.valueChanges, {
    initialValue: this.registerForm.controls.password.value,
  });
  protected readonly passwordRequirements = computed(() => {
    const value = this.passwordValue();
    return {
      length: value.length >= 8,
      uppercase: /[A-Z]/.test(value),
      lowercase: /[a-z]/.test(value),
      number: /\d/.test(value),
    };
  });

  protected togglePasswords(): void {
    this.showPasswords.update((isVisible) => !isVisible);
  }

  protected submit(): void {
    if (this.registerForm.invalid || this.isSubmitting()) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.errorMessage.set(null);
    this.isSubmitting.set(true);
    this.authService
      .register(this.registerForm.getRawValue())
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => void this.router.navigate(['/login'], { queryParams: { registered: 'true' } }),
        error: (error: unknown) =>
          this.errorMessage.set(
            getSafeAuthError(error, 'Registration failed. Please review the form and try again.'),
          ),
      });
  }
}
