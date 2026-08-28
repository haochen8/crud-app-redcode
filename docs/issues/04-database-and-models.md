# Configure EF Core, SQLite, and data models

**Labels:** `backend`, `database`, `priority: high`  
**Milestone:** M1 – Foundation  
**Depends on:** #2

## Purpose
Create persistence for users and books while preparing for user-owned quotes.

## Tasks
- [ ] Install matching EF Core 9 SQLite, Design, Tools, and Identity packages.
- [ ] Create `ApplicationUser` and an Identity-based `ApplicationDbContext`.
- [ ] Create Book with ID, title, author, publication date, and creation timestamp.
- [ ] Configure constraints, connection string, and ignored local database files.
- [ ] Create the initial migration and idempotent development seed data.

## Acceptance criteria
- A clean database is reproducible from migrations.
- Identity and Book tables have the expected schema.
- Seeding creates no duplicates and source control contains no secrets.
