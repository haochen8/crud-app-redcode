import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { routes } from './app.routes';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient(), provideRouter(routes)],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.navbar-brand')?.textContent).toContain('Book & Quotes');
  });

  it('should render the Font Awesome book icon', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.fa-book-open')).toBeTruthy();
  });

  it('should toggle the mobile navigation with accessible state', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('.navbar-toggler') as HTMLButtonElement;
    const navigation = fixture.nativeElement.querySelector('#main-navigation') as HTMLElement;

    expect(button.getAttribute('aria-expanded')).toBe('false');
    button.click();
    fixture.detectChanges();

    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(navigation.classList).toContain('show');
  });

  it('should expose an accessible control that switches the global theme', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const initialTheme = document.documentElement.getAttribute('data-bs-theme');
    const button = fixture.nativeElement.querySelector('button[title*="theme"]') as HTMLButtonElement;

    expect(button.getAttribute('aria-label')).toContain('theme');
    button.click();
    fixture.detectChanges();

    expect(document.documentElement.getAttribute('data-bs-theme')).not.toBe(initialTheme);
  });
});
