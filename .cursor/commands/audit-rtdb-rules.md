# Audit RTDB security rules

Review `database.rules.json` for the Connection Cards Realtime Database.

## Steps

1. Read `database.rules.json` and understand the data model:
   - `rooms/{roomId}/answers/{cardId}`
   - `rooms/{roomId}/skipped/{cardId}`
2. Read the `firebase-security-rules-auditor` skill in `.agents/skills/firebase-security-rules-auditor/SKILL.md` and follow its audit process
3. Cross-check rules against actual client writes in `public/index.html`:
   - `skipCard()` → `skipped/{id}` = true
   - Answer save → `answers/{id}` with `answer`, `question`, `type`, `answeredAt`
4. Test with emulators if possible:
   ```bash
   firebase emulators:start
   python3 server.py
   ```

## Report format

### Summary
One paragraph on overall rule safety.

### Findings
For each issue:
- **Severity:** Critical / High / Medium / Low
- **Rule:** Which path or validation
- **Risk:** What an attacker could do
- **Fix:** Concrete rule change

### Recommendations
Prioritized list of improvements (e.g. room membership, write rate limits, data size caps).

Do not deploy rule changes unless the user asks.
