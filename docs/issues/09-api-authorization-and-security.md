# Protect the API and configure CORS and secrets

**Labels:** `backend`, `auth`, `security`, `priority: high`  
**Milestone:** M3 – Authentication  
**Depends on:** #5, #8

## Purpose
Restrict CRUD endpoints to authenticated users and the intended client origin.

## Tasks
- [ ] Configure complete JWT Bearer validation.
- [ ] Protect Books and Quotes while keeping registration/login public.
- [ ] Verify authentication and authorization middleware order.
- [ ] Add a restricted CORS policy for the Angular development origin.
- [ ] Use user secrets/environment variables and document key setup.

## Acceptance criteria
- Missing, expired, and manipulated tokens are rejected.
- Valid tokens grant access.
- CORS allows only configured origins and Git contains no secrets.
