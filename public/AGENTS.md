# Frontend (public/)

All user-facing code lives here. The app is a single-page experience with no build step.

## Files

| File | Purpose |
|------|---------|
| `index.html` | HTML structure, CSS, card deck data, and all JavaScript |
| `js/firebase-init.js` | Firebase app init, emulator detection, exports `window.connectionCardsFirebase` |
| `js/ads-config.js` | AdSense publisher ID, slot IDs, enabled flag |
| `js/adsense.js` | Loads and renders ad units when enabled |

## Key JavaScript patterns

- **State:** `answersById`, `skippedIds`, `currentDeck`, `activeCategory` — updated from RTDB `value` listener in `initFirebase()`.
- **Room sharing:** `getOrCreateRoomId()` reads `?room=` from URL or `localStorage` key `connectionCardsRoomV1`.
- **Card rendering:** `renderCard()`, `renderMenu()`, `getDeckForCategory()` filter by category, answered, and skipped status.
- **Persistence:** `skipCard()` writes `skipped/{id}`, answer modal writes `answers/{id}` with `answer`, `question`, `type`, `answeredAt`.

## Editing cards

Add objects to the `cards` array near the top of the script block. Required fields:

```javascript
{
  id: 201,
  category: "Us",
  type: "question",       // or "action"
  depth: 2,               // 1–3, shown as hearts
  question: "..."         // for type "question"
  // action: "..."        // for type "action"
}
```

Categories drive the sidebar menu and `categoryThemes` color palette. Add a theme entry when introducing a new category.

## CSS

- Design tokens in `:root` and overridden per category via `applyCategoryTheme()`.
- Mobile layout: `.content` switches to single column below 820px.

## Do not

- Split into modules or add a bundler unless explicitly requested.
- Change Firebase SDK version without testing auth, RTDB listeners, and emulator wiring.
- Remove anonymous auth — RTDB rules require `auth != null`.
