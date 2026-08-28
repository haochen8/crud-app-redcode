# Add API and authentication integration tests

**Labels:** `backend`, `test`, `priority: high`  
**Milestone:** M6 – Quality and Delivery  
**Depends on:** #6, #9, #18

## Purpose
Automatically verify critical API behavior and security boundaries.

## Tasks
- [ ] Configure `WebApplicationFactory` with an isolated database.
- [ ] Test registration, duplicates, successful login, and failed login.
- [ ] Verify `401` behavior and complete Books CRUD/status codes.
- [ ] Test validation and unknown IDs.
- [ ] Prove that two users cannot access each other's quotes.

## Acceptance criteria
- `dotnet test` succeeds from a clean checkout.
- Positive and negative authentication cases are covered.
- Tests require no developer database or production secret.
