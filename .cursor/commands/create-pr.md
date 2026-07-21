# Create pull request

Create a GitHub pull request for the current branch.

## Steps

1. Run in parallel:
   - `git status`
   - `git diff`
   - `git branch -vv` (check remote tracking)
   - `git log main..HEAD --oneline` (commits on this branch)
   - `git diff main...HEAD` (full branch diff)
2. Ensure changes are committed. If uncommitted work exists, ask whether to commit first (do not commit without permission).
3. Push if needed:
   ```bash
   git push -u origin HEAD
   ```
4. Create the PR:
   ```bash
   gh pr create --title "..." --body "$(cat <<'EOF'
   ## Summary
   - ...

   ## Test plan
   - [ ] Run `python3 server.py` and verify card UI loads
   - [ ] Confirm room sync (skip/answer) with emulators
   - [ ] ...

   EOF
   )"
   ```

## PR title guidance

- Focus on the "why"
- Examples: "Add date-night card pack", "Tighten RTDB rules for room writes", "Fix sync status on reconnect"

Return the PR URL when done.
