# Add Angular unit tests

**Labels:** `frontend`, `test`, `priority: high`  
**Milestone:** M6 – Quality and Delivery  
**Depends on:** #12, #16, #19, #20

## Purpose
Protect core client behavior without requiring a running API.

## Tasks
- [ ] Test AuthService storage, login, and logout.
- [ ] Test interceptor origin filtering and route guards.
- [ ] Test BookService and QuoteService with HTTP test utilities.
- [ ] Test form validation, success navigation, failures, and cancelled deletion.
- [ ] Test stored and system-default themes.

## Acceptance criteria
- Tests pass without a backend.
- Auth includes positive and negative cases.
- Critical CRUD and validation behavior is covered.
