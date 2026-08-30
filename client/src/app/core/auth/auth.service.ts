import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
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
  private static readonly storageKey = 'book-quotes.auth-session';
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly tokenState = signal<string | null>(null);
  private readonly userState = signal<AuthUser | null>(null);
  private readonly expiresAtState = signal<string | null>(null);
  private expiryTimer: ReturnType<typeof setTimeout> | undefined;

  readonly currentUser = this.userState.asReadonly();
  readonly accessToken = this.tokenState.asReadonly();
  readonly isAuthenticated = computed(
    () => this.tokenState() !== null && this.hasNotExpired(this.expiresAtState()),
  );

  constructor() {
    this.restoreSession();
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, request).pipe(
      tap((response) => {
        this.setSession(response);
      }),
    );
  }

  register(request: RegisterRequest): Observable<AuthUser> {
    return this.http.post<AuthUser>(`${environment.apiUrl}/auth/register`, request);
  }

  logout(): void {
    this.tokenState.set(null);
    this.userState.set(null);
    this.expiresAtState.set(null);
    clearTimeout(this.expiryTimer);

    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(AuthService.storageKey);
    }
  }

  private setSession(response: AuthResponse): void {
    this.tokenState.set(response.accessToken);
    this.userState.set(response.user);
    this.expiresAtState.set(response.expiresAt);
    this.scheduleExpiration(response.expiresAt);

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(AuthService.storageKey, JSON.stringify(response));
    }
  }

  private restoreSession(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    try {
      const storedValue = localStorage.getItem(AuthService.storageKey);
      if (!storedValue) {
        return;
      }

      const session = JSON.parse(storedValue) as Partial<AuthResponse>;
      if (
        typeof session.accessToken !== 'string' ||
        typeof session.expiresAt !== 'string' ||
        typeof session.user?.id !== 'string' ||
        typeof session.user.userName !== 'string' ||
        !this.hasNotExpired(session.expiresAt)
      ) {
        this.logout();
        return;
      }

      this.tokenState.set(session.accessToken);
      this.userState.set(session.user as AuthUser);
      this.expiresAtState.set(session.expiresAt);
      this.scheduleExpiration(session.expiresAt);
    } catch {
      this.logout();
    }
  }

  private hasNotExpired(expiresAt: string | null): boolean {
    return expiresAt !== null && Date.parse(expiresAt) > Date.now();
  }

  private scheduleExpiration(expiresAt: string): void {
    clearTimeout(this.expiryTimer);
    const delay = Math.max(0, Date.parse(expiresAt) - Date.now());
    this.expiryTimer = setTimeout(() => this.logout(), delay);
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
