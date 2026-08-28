# Prepare repository and solution structure

**Labels:** `setup`, `documentation`, `priority: high`  
**Milestone:** M1 – Foundation

## Purpose
Create a clear monorepo structure for independently runnable API, client, and test projects.

## Tasks
- [ ] Create `server/` and `client/` directories.
- [ ] Add `.gitignore` rules for .NET, Node, Angular, IDE files, SQLite, build output, and secrets.
- [ ] Add a root README and document project naming.
- [ ] Add `global.json` for .NET 9 and document an Angular 20-compatible Node.js version.
- [ ] Ensure JWT keys, databases, and dependencies cannot be committed.

## Acceptance criteria
- The structure is clear to a new developer.
- Only intentional source files appear in `git status`.
- The README identifies Angular 20 and .NET 9.
