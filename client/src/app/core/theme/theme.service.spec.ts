import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-bs-theme');
    document.documentElement.style.removeProperty('color-scheme');
  });

  afterEach(() => localStorage.clear());

  it('uses the system color scheme when no preference exists', () => {
    spyOn(window, 'matchMedia').and.returnValue({ matches: true } as MediaQueryList);

    const service = TestBed.inject(ThemeService);

    expect(service.theme()).toBe('dark');
    expect(document.documentElement.getAttribute('data-bs-theme')).toBe('dark');
  });

  it('uses the light system color scheme when no valid preference exists', () => {
    localStorage.setItem('book-quotes.theme', 'unsupported');
    spyOn(window, 'matchMedia').and.returnValue({ matches: false } as MediaQueryList);

    const service = TestBed.inject(ThemeService);

    expect(service.theme()).toBe('light');
    expect(document.documentElement.getAttribute('data-bs-theme')).toBe('light');
    expect(document.documentElement.style.colorScheme).toBe('light');
  });

  it('restores, toggles, applies, and persists an explicit preference', () => {
    localStorage.setItem('book-quotes.theme', 'light');
    const service = TestBed.inject(ThemeService);

    expect(service.theme()).toBe('light');
    service.toggle();

    expect(service.theme()).toBe('dark');
    expect(document.documentElement.getAttribute('data-bs-theme')).toBe('dark');
    expect(document.documentElement.style.colorScheme).toBe('dark');
    expect(localStorage.getItem('book-quotes.theme')).toBe('dark');
  });
});
