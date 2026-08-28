# Implement light and dark themes

**Labels:** `frontend`, `ui`, `priority: medium`  
**Milestone:** M5 – My Quotes and UX  
**Depends on:** #10

## Purpose
Complete the optional challenge with an accessible, persistent theme switch.

## Tasks
- [ ] Create `ThemeService` and apply Bootstrap `data-bs-theme` to the root.
- [ ] Use `prefers-color-scheme` when no preference exists.
- [ ] Persist the selected theme.
- [ ] Add an accessible sun/moon navbar control.
- [ ] Minimize startup flash and test every major component in both modes.

## Acceptance criteria
- Theme selection works globally and survives reload.
- First visit respects the system setting.
- Both themes have readable contrast.
