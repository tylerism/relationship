---
name: connection-cards
description: Domain knowledge for the Connection Cards couples app — card deck schema, room sync, RTDB data model, local dev, and deployment. Use when working on public/index.html, room sharing, card content, Firebase sync, or AdSense integration in this repository.
---

# Connection Cards

## What it is

A couples connection game: browse prompts and actions by category, answer or skip cards, sync progress in real time with a shared room code.

## Data model (Realtime Database)

```
rooms/{roomId}/
  answers/{cardId}: { answer, question, type?, answeredAt }
  skipped/{cardId}: true
```

- Auth: anonymous (`firebase.auth().signInAnonymously()`)
- Room ID: 8-char alphanumeric from URL `?room=` or localStorage key `connectionCardsRoomV1`
- Listener: `db.ref('rooms/{roomId}').on('value', ...)` in `initFirebase()` drives all UI state

## Card deck

~200 cards in the `cards` array in `public/index.html`:

| Field | Values |
|-------|--------|
| `id` | Unique integer |
| `category` | e.g. "Us", "How You See Me", "Remember When", "Connection Actions" |
| `type` | `"question"` or `"action"` |
| `depth` | 1–3 (heart difficulty) |
| `question` / `action` | Card text |

Virtual categories (not in deck): "Skipped", "Answered" — computed from RTDB state.

## Local development

```bash
python3 server.py                    # http://localhost:8000
firebase emulators:start             # auth:9099, rtdb:9000
```

Use the Python server (not hosting emulator) so `firebase-init.js` detects localhost.

## Key files

- `public/index.html` — UI, styles, cards, app logic
- `public/js/firebase-init.js` — Firebase init + emulators
- `database.rules.json` — RTDB security rules
- `server.py` — local static server
- `public/js/ads-config.js` — AdSense settings

## Common tasks

**Add cards:** Append to `cards` array with next sequential `id`. Add `categoryThemes` entry for new categories.

**Fix sync:** Check auth sign-in, room ID, emulator ports, and RTDB rules. Verify `syncStatus` element and console errors.

**Change theme:** Edit `categoryThemes` object and matching CSS variables pattern.

**Deploy:** Merge to `main` triggers CI. Manual: `firebase deploy --only hosting,database`.

## Related skills

- `firebase-basics` — CLI setup and project management
- `firebase-auth-basics` — anonymous auth patterns
- `firebase-hosting-basics` — hosting deploy and previews
- `firebase-security-rules-auditor` — audit `database.rules.json`
