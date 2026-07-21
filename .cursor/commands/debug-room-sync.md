# Debug room sync

Diagnose Firebase Realtime Database sync issues in Connection Cards.

## Gather context

Use any symptoms the user describes (e.g. "stuck on Connecting", "answers not saving", "partner can't see updates").

## Investigation steps

1. Read `public/js/firebase-init.js` — emulator detection and config
2. Read `initFirebase()` in `public/index.html` — auth, room ID, RTDB listener
3. Check `database.rules.json` — auth required, validation on writes
4. Verify environment:
   - Local: emulators running? App served from localhost via `python3 server.py`?
   - Production: correct `databaseURL` in config?

## Common issues

| Symptom | Likely cause |
|---------|--------------|
| "Connecting…" forever | Emulators not running, or wrong ports |
| "Could not connect" | Auth failure, network, or invalid Firebase config |
| "Sync error" | RTDB rules rejecting read, or permission denied |
| Answers don't persist | Write validation failed (missing `question`/`answer` strings) |
| Partners see different rooms | Different room codes; share `?room=CODE` URL |
| Works locally, not prod | Deployed rules differ; check `firebase deploy --only database` |

## Debug actions

```bash
# Terminal 1
firebase emulators:start

# Terminal 2
python3 server.py
```

Check browser console for Firebase errors. Inspect RTDB data in Emulator UI at the `rooms/{roomId}` path.

## Output

Report root cause, evidence, and a minimal fix. Do not refactor unrelated code.
