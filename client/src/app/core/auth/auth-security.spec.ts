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
});
