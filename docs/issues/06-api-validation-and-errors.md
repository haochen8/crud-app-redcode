# Add API validation and consistent error handling

**Labels:** `backend`, `quality`, `priority: high`  
**Milestone:** M2 – Books API  
**Depends on:** #5

## Purpose
Give the client predictable validation and safe error responses.

## Tasks
- [ ] Validate required fields, lengths, and publication dates.
- [ ] Return consistent field-level validation errors.
- [ ] Configure global exception handling with `ProblemDetails`.
- [ ] Log failures without exposing stack traces or secrets.
- [ ] Document and test common error responses in OpenAPI.

## Acceptance criteria
- Invalid requests return `400` with useful field errors.
- Unexpected errors use `ProblemDetails` without sensitive details.
- Create and update rules remain consistent.
