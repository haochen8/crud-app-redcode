import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private static readonly storageKey = 'book-quotes.theme';
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly themeState = signal<Theme>(this.getInitialTheme());

  readonly theme = this.themeState.asReadonly();

  constructor() {
    this.apply(this.themeState());
  }

  toggle(): void {
    const nextTheme: Theme = this.themeState() === 'light' ? 'dark' : 'light';
    this.themeState.set(nextTheme);
    this.apply(nextTheme);

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(ThemeService.storageKey, nextTheme);
    }
  }

  private getInitialTheme(): Theme {
    if (!isPlatformBrowser(this.platformId)) {
      return 'light';
    }

    const storedTheme = localStorage.getItem(ThemeService.storageKey);
    if (storedTheme === 'light' || storedTheme === 'dark') {
      return storedTheme;
    }

    return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  private apply(theme: Theme): void {
    this.document.documentElement.setAttribute('data-bs-theme', theme);
    this.document.documentElement.style.colorScheme = theme;
  }
}
