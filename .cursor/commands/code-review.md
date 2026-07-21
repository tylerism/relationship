# Code review

Review the current changes in this Connection Cards repository.

## Scope

Run `git diff` and `git status` to see all staged and unstaged changes. If no changes, review recent commits on the current branch.

## Checklist

### Correctness
- [ ] Card IDs are unique; new cards use sequential IDs
- [ ] RTDB writes match `database.rules.json` validation
- [ ] Firebase listener and UI state stay in sync
- [ ] Category filtering handles answered/skipped cards correctly

### Security
- [ ] No secrets committed (`.env`, service account keys)
- [ ] RTDB rules not loosened without justification
- [ ] User input sanitized before display (XSS via answers)

### Style
- [ ] Matches vanilla JS patterns in `index.html`
- [ ] CSS uses existing variable/theme conventions
- [ ] No unnecessary refactors or scope creep

### Firebase / deploy
- [ ] Emulator wiring intact in `firebase-init.js`
- [ ] `firebase.json` and rules files consistent with app behavior

## Output format

### Summary
Brief overview of what changed.

### Findings
- 🔴 **Critical** — must fix
- 🟡 **Suggestion** — consider improving
- 🟢 **Nice to have** — optional

Be specific. Reference file paths and line areas. Suggest fixes, not just problems.
