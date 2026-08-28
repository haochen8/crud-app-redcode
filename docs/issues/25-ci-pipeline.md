# Configure CI for builds and tests

**Labels:** `devops`, `test`, `priority: medium`  
**Milestone:** M6 – Quality and Delivery  
**Depends on:** #22, #23

## Purpose
Detect build and test failures automatically.

## Tasks
- [ ] Add GitHub Actions for pull requests and the default branch.
- [ ] Install required .NET and Node.js versions and restore locked dependencies.
- [ ] Build and test the backend.
- [ ] Clean-install, build, and test the frontend.
- [ ] Use safe test secrets and optionally run stable E2E smoke coverage.

## Acceptance criteria
- A clean checkout builds and tests both applications.
- Intentional failures make CI fail.
- No real secrets or local configuration are committed.
