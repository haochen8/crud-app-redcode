# Book & Quotes

Book & Quotes is a responsive CRUD web application for managing books and personal favorite quotes. It uses an Angular 20 client and an ASP.NET Core 9 Web API with JWT authentication.

## Planned technology stack

- Angular 20 with standalone components and Reactive Forms
- TypeScript and RxJS
- Bootstrap 5.3 and Font Awesome
- ASP.NET Core 9 Web API
- Entity Framework Core 9 with SQLite
- ASP.NET Core Identity and JWT Bearer authentication
- Automated API, client, and end-to-end tests

## Repository structure

```text
.
├── client/        Angular application
├── server/        ASP.NET Core API and test projects
├── docs/issues/   Project backlog and acceptance criteria
├── global.json    Required .NET SDK family
└── README.md
```

## Prerequisites

- A .NET 9 SDK. `global.json` permits roll-forward to the latest installed .NET 9 feature band.
- Node.js `^20.19.0`, `^22.12.0`, or `^24.0.0` for Angular 20.2/20.3.
- npm.

Detailed setup, database, secret-management, build, and test instructions will be added as the corresponding project features are implemented.

## Backend development

Restore, build, test, and run the API from the repository root:

```bash
dotnet restore server/BookQuotes.sln
dotnet build server/BookQuotes.sln --no-restore
dotnet test server/BookQuotes.sln --no-build
dotnet run --project server/BookQuotes.Api
```

The HTTP development profile listens on `http://localhost:5047`; the HTTPS profile also listens on `https://localhost:7047`. In Development, the health endpoint is `/health` and the OpenAPI document is `/openapi/v1.json`.

The API uses SQLite. On startup it applies pending EF Core migrations and adds development book data only when the Books table is empty. To create a migration, restore the repository-local tools and run:

```bash
dotnet tool restore
dotnet tool run dotnet-ef migrations add <MigrationName> \
  --project server/BookQuotes.Api \
  --startup-project server/BookQuotes.Api \
  --output-dir Data/Migrations
```

Registration uses a username and an ASP.NET Core Identity password. JWT signing keys must stay outside source control. Configure a local key with at least 32 characters:

```bash
dotnet user-secrets init --project server/BookQuotes.Api
dotnet user-secrets set "Jwt:Key" "replace-with-a-long-random-development-key" \
  --project server/BookQuotes.Api
```

For deployed environments, provide the same value through a secret environment variable such as `Jwt__Key`.

The API validates each token's signature, issuer, audience, and lifetime without a clock-skew grace period. CRUD endpoints require a valid Bearer token, while registration, login, health, and development OpenAPI endpoints remain public. The default CORS policy permits only the Angular development origin (`http://localhost:4200`); configure additional deployment origins through `Cors__AllowedOrigins__0`, `Cors__AllowedOrigins__1`, and so on.

## Frontend development

Install dependencies, start the development server, run tests, and create a production build:

```bash
cd client
npm ci
npm start
npm test -- --watch=false
npm run build
```

The Angular development server listens on `http://localhost:4200`. Development builds use `http://localhost:5047/api`; production builds use `https://localhost:7047/api`. These values are defined in `client/src/environments/` rather than in services.

## Project language

Source code, UI text, documentation, commits, and GitHub issues use English.

## Backlog

See the [GitHub-ready issue backlog](docs/issues/README.md) for the implementation plan, dependencies, and acceptance criteria.
