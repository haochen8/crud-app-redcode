# Create the add-book form

**Labels:** `frontend`, `feature`, `priority: high`  
**Milestone:** M4 – Angular CRUD  
**Depends on:** #13, #14

## Purpose
Allow users to create a book and return to the updated list.

## Tasks
- [ ] Create a reusable Reactive Form for title, author, and publication date.
- [ ] Mirror backend validation and show field errors.
- [ ] Submit through `BookService` and prevent duplicate requests.
- [ ] Navigate only after success.
- [ ] Add Cancel and preserve values after server errors.

## Acceptance criteria
- Valid books persist and appear in the list.
- Invalid and repeated submissions are prevented.
- The form works at 360 px and with a keyboard.
