# Testing

The automated test layers are independent: backend integration tests create an isolated SQLite
database, Angular unit tests use HTTP test doubles, and Playwright recreates `.e2e-data/book-quotes.db`
before starting the full application.

## Commands

Run the backend integration suite from the repository root:

```bash
dotnet test server/BookQuotes.sln
```

Run Angular unit tests and the production build:

```bash
cd client
npm ci
npm test -- --watch=false --browsers=ChromeHeadless
npm run build
```

Install Playwright's browser once, then run the full-system tests. Playwright starts and stops both
the API and Angular development server automatically; ports 5047 and 4200 must be available.

```bash
cd client
npx playwright install chromium
npm run test:e2e
```

Use `npm run test:e2e:headed` when visually inspecting the flows.

## Responsive device matrix

The automated Chromium projects cover a 1440 × 900 desktop and a 360 × 800 mobile viewport. Before
a release, use this manual matrix to catch browser- and device-specific layout differences:

| Target | Viewport or zoom | Browsers | Checks |
| --- | --- | --- | --- |
| Small phone | 360 px wide | Chrome Android, Safari iOS | Collapsed navigation, stacked forms and actions, no horizontal scroll |
| Tablet | 768 px wide | Safari iPadOS, Chrome Android | Navigation breakpoint, book table, two-column quote layout |
| Laptop | 1024 px wide | Chrome, Firefox, Safari, Edge | CRUD forms, dialogs, keyboard focus order, both themes |
| Desktop | 1440 px wide | Chrome, Firefox, Safari, Edge | Full journeys, spacing, loading/empty/error/success states |
| Zoomed desktop | 200% browser zoom | Chrome, Firefox, Safari, Edge | Content reflow, readable text, visible focus, controls do not overlap |

For every target, verify registration, login/logout, Books CRUD, Quotes CRUD, theme persistence,
keyboard-only navigation, touch interaction where available, and visible Font Awesome icons.
