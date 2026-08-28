# Implement user registration

**Labels:** `backend`, `auth`, `priority: high`  
**Milestone:** M3 – Authentication  
**Depends on:** #4

## Purpose
Allow account creation with Identity-managed password hashing.

## Tasks
- [ ] Configure Identity Core and EF stores.
- [ ] Choose and document the login identifier.
- [ ] Create a validated registration DTO and endpoint using `UserManager`.
- [ ] Configure a clear password policy.
- [ ] Return safe duplicate/password errors and never log credentials.

## Acceptance criteria
- Unique users can register.
- Duplicates and weak passwords return validation errors.
- Only Identity-generated password hashes are stored.
