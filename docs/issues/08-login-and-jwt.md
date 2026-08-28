# Implement login and JWT generation

**Labels:** `backend`, `auth`, `security`, `priority: high`  
**Milestone:** M3 – Authentication  
**Depends on:** #7

## Purpose
Validate credentials and issue a signed, time-limited JWT.

## Tasks
- [ ] Create login and auth-response DTOs.
- [ ] Implement login using Identity password verification.
- [ ] Create an injectable JWT service.
- [ ] Include user ID, username, issuer, audience, and expiration.
- [ ] Return generic `401` errors and add Bearer support to Swagger.

## Acceptance criteria
- Correct credentials return a valid token and expiration.
- Invalid credentials do not reveal whether the account exists.
- JWT validation succeeds and no signing secret is committed.
