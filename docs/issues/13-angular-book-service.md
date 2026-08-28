# Create Angular models and BookService

**Labels:** `frontend`, `feature`, `priority: high`  
**Milestone:** M4 – Angular CRUD  
**Depends on:** #5, #12

## Purpose
Create a typed service layer between book components and the API.

## Tasks
- [ ] Add Book, create-request, and update-request types.
- [ ] Implement every CRUD call using the configured API URL.
- [ ] Return typed Observables without `any`.
- [ ] Normalize dates between form inputs and API payloads.
- [ ] Add HTTP service tests.

## Acceptance criteria
- One service exposes all Books operations.
- Components do not manage URL or auth-header details.
- Payloads match the backend contract.
