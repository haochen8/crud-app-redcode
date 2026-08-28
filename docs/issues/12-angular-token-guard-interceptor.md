# Add the auth interceptor, route guard, and logout

**Labels:** `frontend`, `auth`, `security`, `priority: high`  
**Milestone:** M4 – Angular CRUD  
**Depends on:** #9, #11

## Purpose
Attach JWTs to API requests and protect authenticated routes.

## Tasks
- [ ] Centralize local token storage in `AuthService`.
- [ ] Add a functional interceptor limited to the configured API origin.
- [ ] Add a functional route guard and requested-URL handling.
- [ ] Implement logout and clear state after `401`.
- [ ] Document localStorage XSS risk and the production alternative.

## Acceptance criteria
- Anonymous users cannot open protected routes.
- API requests contain Bearer tokens, but third-party requests never do.
- Logout and `401` reliably end the session.
