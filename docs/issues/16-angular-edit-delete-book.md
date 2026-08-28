# Implement book editing and deletion

**Labels:** `frontend`, `feature`, `priority: high`  
**Milestone:** M4 – Angular CRUD  
**Depends on:** #15

## Purpose
Complete Books CRUD with safe edit and delete flows.

## Tasks
- [ ] Load the route ID and populate the reusable form.
- [ ] Submit updates and navigate after success.
- [ ] Handle invalid and unknown IDs.
- [ ] Require explicit delete confirmation.
- [ ] Update local state after success and preserve it after failure.

## Acceptance criteria
- Current values load and saved changes appear in the list.
- Cancelled deletion sends no request.
- Confirmed deletion removes the database record and UI item.
