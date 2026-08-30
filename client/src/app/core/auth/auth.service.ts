import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AuthResponse,
  AuthUser,
  LoginRequest,
  RegisterRequest,
  ValidationProblem,
} from './auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenState = signal<string | null>(null);
  private readonly userState = signal<AuthUser | null>(null);

  readonly currentUser = this.userState.asReadonly();
  readonly isAuthenticated = computed(() => this.tokenState() !== null);

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, request).pipe(
      tap((response) => {
        this.tokenState.set(response.accessToken);
        this.userState.set(response.user);
      }),
    );
  }

  register(request: RegisterRequest): Observable<AuthUser> {
    return this.http.post<AuthUser>(`${environment.apiUrl}/auth/register`, request);
  }

  logout(): void {
    this.tokenState.set(null);
    this.userState.set(null);
  }
}

export function getSafeAuthError(error: unknown, fallback: string): string {
  if (!(error instanceof HttpErrorResponse)) {
    return fallback;
  }

  if (error.status === 0) {
    return 'The API is unavailable. Check that it is running and try again.';
  }

  const problem = error.error as ValidationProblem | null;
  const validationMessage = problem?.errors
    ? Object.values(problem.errors).flat().find((message) => message.trim().length > 0)
    : undefined;

  return validationMessage ?? problem?.title ?? fallback;
}
