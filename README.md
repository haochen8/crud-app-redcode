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

## Project language

Source code, UI text, documentation, commits, and GitHub issues use English.

## Backlog

See the [GitHub-ready issue backlog](docs/issues/README.md) for the implementation plan, dependencies, and acceptance criteria.

