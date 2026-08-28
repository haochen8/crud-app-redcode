# Create the ASP.NET Core 9 Web API

**Labels:** `backend`, `setup`, `priority: high`  
**Milestone:** M1 – Foundation  
**Depends on:** #1

## Purpose
Create a runnable API and test-project foundation.

## Tasks
- [ ] Create a solution and `BookQuotes.Api` targeting `net9.0` with controllers.
- [ ] Enable nullable reference types, implicit usings, HTTPS, and development settings.
- [ ] Enable OpenAPI/Swagger in Development.
- [ ] Add a health endpoint or health check.
- [ ] Create `BookQuotes.Api.Tests` and reference the API.

## Acceptance criteria
- `dotnet build` and the initial test command succeed.
- The API, OpenAPI, and health endpoint run locally.
