# Implement the Books REST API

**Labels:** `backend`, `feature`, `priority: high`  
**Milestone:** M2 – Books API  
**Depends on:** #4

## Purpose
Implement the complete Books CRUD REST contract.

## Tasks
- [ ] Create separate read, create, and update DTOs.
- [ ] Implement list and get-by-ID endpoints.
- [ ] Implement create and return `201 Created` with the resource URL.
- [ ] Implement update and delete using asynchronous EF Core calls.
- [ ] Return consistent `404` and `204` responses and verify OpenAPI.

## Acceptance criteria
- All CRUD operations persist correctly in SQLite.
- EF entities are not exposed directly.
- Status codes are consistent and unknown IDs never cause server errors.
