# Implement the user-scoped Quotes CRUD API

**Labels:** `backend`, `auth`, `feature`, `priority: high`  
**Milestone:** M5 – My Quotes and UX  
**Depends on:** #9, #17

## Purpose
Give users CRUD access to their own quotes without exposing other users' data.

## Tasks
- [ ] Create quote read, create, and update DTOs.
- [ ] Implement authenticated list and get-by-ID filtered by the JWT user ID.
- [ ] Implement create with a server-assigned owner.
- [ ] Implement update and delete with ownership checks.
- [ ] Validate data and document consistent `403` or `404` behavior.

## Acceptance criteria
- Users can access only their own quotes.
- All endpoints require JWT authentication.
- Client-provided user IDs and guessed record IDs cannot bypass ownership.
