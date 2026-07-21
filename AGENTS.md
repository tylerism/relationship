# Connection Cards

A Firebase-hosted web app for couples: browse connection prompts and actions, answer or skip cards, and sync progress in real time via shared room codes.

**Stack:** Vanilla HTML/CSS/JS (`public/index.html`), Python dev server (`server.py`), Firebase Hosting, Firebase Auth (anonymous), Firebase Realtime Database.

## Commands

```bash
# Local dev server (serves public/)
python3 server.py
python3 server.py --port 3000

# Firebase emulators (auth :9099, RTDB :9000, hosting :5000)
firebase emulators:start

# Deploy preview channel (requires Firebase CLI auth)
firebase hosting:channel:deploy preview-$(date +%Y%m%d)

# Deploy live (normally via CI on merge to main)
firebase deploy --only hosting,database

# Validate security rules
firebase database:rules:get
```

For Firebase sync locally, run emulators **and** open the app via `python3 server.py` (not the hosting emulator alone) so `firebase-init.js` detects localhost and connects to emulators.

## Project structure

```
public/
  index.html          # Entire UI, card deck, and app logic (monolith)
  js/
    firebase-init.js  # Firebase config + emulator wiring
    ads-config.js     # AdSense config (publisher ID, slots)
    adsense.js        # AdSense loader
server.py             # Static file server for local dev
database.rules.json   # RTDB security rules (rooms/{roomId})
firebase.json         # Hosting, emulators, auth providers
firestore.rules       # Unused by app; RTDB is the live database
```

## Architecture

- **Cards:** ~200 prompts/actions in a `cards` array inside `index.html`. Each card has `id`, `category`, `type` (`question` | `action`), `depth` (1–3), and `question` or `action` text.
- **Rooms:** Partners share a room code (`?room=CODE` or localStorage). Data lives at `rooms/{roomId}/answers/{cardId}` and `rooms/{roomId}/skipped/{cardId}`.
- **Auth:** Anonymous sign-in required for RTDB read/write per `database.rules.json`.
- **Deploy:** GitHub Actions deploys to Firebase Hosting on push to `main`. PR previews use `firebase-hosting-pull-request.yml`.

## Code conventions

- Keep the app dependency-free: no bundler, no npm packages for the frontend.
- Prefer small, focused edits. The UI and logic live in one large `index.html` — avoid drive-by refactors.
- Match existing patterns: CSS variables for theming, `categoryThemes` for per-category colors, compat Firebase SDK loaded from CDN.
- Card IDs must be unique integers. New cards go at the end of the `cards` array with the next sequential `id`.
- Do not commit secrets. Firebase web API keys in `firebase-init.js` are public client config (expected).

## Guardrails

- **Database:** This app uses **Realtime Database**, not Firestore. Update `database.rules.json` for data access rules.
- **Emulators:** `firebase-init.js` auto-enables emulators on `localhost` / `127.0.0.1`.
- **Ads:** Ad changes require updates to `ads-config.js` and `public/ads.txt`. Do not enable ads without valid slot IDs.
- **Deploy:** Do not force-push to `main`. Live deploys happen via CI.
- **Commits:** Only commit when explicitly asked.

## Verification

After frontend changes:

1. Run `python3 server.py` and open http://localhost:8000
2. Confirm room code appears and sync status shows "Synced"
3. Test skip, answer, and category filtering
4. With emulators running, confirm data appears in the Emulator UI

After rules changes:

1. Run `firebase emulators:start` and test read/write in the app
2. Use `/audit-rtdb-rules` command or `firebase-security-rules-auditor` skill before deploying

## Skills and tools

- **Project skill:** `.cursor/skills/connection-cards/` — app domain knowledge
- **Firebase skills:** `.agents/skills/` — hosting, auth, RTDB, security rules (read `firebase-basics` first)
- **Firebase MCP:** `.cursor/mcp.json` — project management via Cursor MCP panel
- **Slash commands:** `.cursor/commands/` — type `/` in chat (e.g. `/dev-local`, `/add-connection-cards`)
