# Create the quote model and five starter quotes

**Labels:** `backend`, `database`, `feature`, `priority: high`  
**Milestone:** M5 – My Quotes and UX  
**Depends on:** #7

## Purpose
Create user-owned quotes and give each account five starter quotes.

## Tasks
- [ ] Create Quote with ID, text, author, user ID, and creation timestamp.
- [ ] Configure constraints, user relationship, and a user-ID index.
- [ ] Create and apply the migration.
- [ ] Define five starter quotes centrally.
- [ ] Create them atomically after registration and prevent duplicates.

## Acceptance criteria
- Every new user receives exactly five correctly owned quotes.
- Migrations reproduce the schema.
- Failed registration leaves no orphaned data.
