import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { environment } from '../../../environments/environment';
import { authGuard } from './auth.guard';
import { authInterceptor } from './auth.interceptor';
import { AuthResponse } from './auth.models';
import { AuthService } from './auth.service';

describe('authentication security', () => {
  const response: AuthResponse = {
    accessToken: 'signed-token',
    expiresAt: new Date(Date.now() + 60_000).toISOString(),
    user: { id: 'user-1', userName: 'reader' },
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
    localStorage.clear();
  });

  it('persists a successful login and clears it on logout', () => {
    const authService = TestBed.inject(AuthService);

    authService.login({ userName: 'reader', password: 'StrongPass1' }).subscribe();
    TestBed.inject(HttpTestingController)
      .expectOne(`${environment.apiUrl}/auth/login`)
      .flush(response);

    expect(authService.isAuthenticated()).toBeTrue();
    expect(localStorage.length).toBe(1);

    authService.logout();

    expect(authService.isAuthenticated()).toBeFalse();
    expect(localStorage.length).toBe(0);
  });

  it('restores a valid stored session', () => {
    localStorage.setItem('book-quotes.auth-session', JSON.stringify(response));

    const authService = TestBed.inject(AuthService);

    expect(authService.isAuthenticated()).toBeTrue();
    expect(authService.accessToken()).toBe('signed-token');
    expect(authService.currentUser()).toEqual(response.user);
    authService.logout();
  });

  it('discards malformed and expired stored sessions', () => {
    localStorage.setItem('book-quotes.auth-session', '{not-json');
    const malformedService = TestBed.inject(AuthService);

    expect(malformedService.isAuthenticated()).toBeFalse();
    expect(localStorage.length).toBe(0);

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    localStorage.setItem(
      'book-quotes.auth-session',
      JSON.stringify({ ...response, expiresAt: new Date(Date.now() - 1_000).toISOString() }),
    );
    const expiredService = TestBed.inject(AuthService);

    expect(expiredService.isAuthenticated()).toBeFalse();
    expect(localStorage.length).toBe(0);
  });

  it('keeps the user signed out when login fails', () => {
    const authService = TestBed.inject(AuthService);
    let status: number | undefined;

    authService.login({ userName: 'reader', password: 'WrongPass1' }).subscribe({
      error: (error) => (status = error.status),
    });
    TestBed.inject(HttpTestingController)
      .expectOne(`${environment.apiUrl}/auth/login`)
      .flush({ title: 'Invalid username or password.' }, { status: 401, statusText: 'Unauthorized' });

    expect(status).toBe(401);
    expect(authService.isAuthenticated()).toBeFalse();
    expect(localStorage.length).toBe(0);
  });

  it('sends the token only to the configured API', () => {
    const authService = TestBed.inject(AuthService);
    const http = TestBed.inject(HttpClient);
    const httpTesting = TestBed.inject(HttpTestingController);

    authService.login({ userName: 'reader', password: 'StrongPass1' }).subscribe();
    httpTesting.expectOne(`${environment.apiUrl}/auth/login`).flush(response);

    http.get(`${environment.apiUrl}/books`).subscribe();
    const apiRequest = httpTesting.expectOne(`${environment.apiUrl}/books`);
    expect(apiRequest.request.headers.get('Authorization')).toBe('Bearer signed-token');
    apiRequest.flush([]);

    http.get('https://third-party.example/data').subscribe();
    const thirdPartyRequest = httpTesting.expectOne('https://third-party.example/data');
    expect(thirdPartyRequest.request.headers.has('Authorization')).toBeFalse();
    thirdPartyRequest.flush({});

    http.get(`${environment.apiUrl}-v2/books`).subscribe();
    const lookalikeRequest = httpTesting.expectOne(`${environment.apiUrl}-v2/books`);
    expect(lookalikeRequest.request.headers.has('Authorization')).toBeFalse();
    lookalikeRequest.flush({});
    authService.logout();
  });

  it('redirects anonymous navigation and preserves the requested URL', () => {
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as never, { url: '/quotes' } as RouterStateSnapshot),
    );

    expect(result instanceof UrlTree).toBeTrue();
    expect(TestBed.inject(Router).serializeUrl(result as UrlTree)).toBe(
      '/login?returnUrl=%2Fquotes',
    );
  });

  it('allows authenticated navigation', () => {
    const authService = TestBed.inject(AuthService);
    authService.login({ userName: 'reader', password: 'StrongPass1' }).subscribe();
    TestBed.inject(HttpTestingController)
      .expectOne(`${environment.apiUrl}/auth/login`)
      .flush(response);

    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as never, { url: '/books' } as RouterStateSnapshot),
    );

    expect(result).toBeTrue();
    authService.logout();
  });

  it('clears an invalidated session and redirects after an API 401', () => {
    const authService = TestBed.inject(AuthService);
    const http = TestBed.inject(HttpClient);
    const httpTesting = TestBed.inject(HttpTestingController);
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);

    authService.login({ userName: 'reader', password: 'StrongPass1' }).subscribe();
    httpTesting.expectOne(`${environment.apiUrl}/auth/login`).flush(response);
    http.get(`${environment.apiUrl}/books`).subscribe({ error: () => undefined });
    httpTesting
      .expectOne(`${environment.apiUrl}/books`)
      .flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(authService.isAuthenticated()).toBeFalse();
    expect(localStorage.length).toBe(0);
    expect(router.navigate).toHaveBeenCalledOnceWith(['/login'], {
      queryParams: { returnUrl: '/' },
    });
  });
});
