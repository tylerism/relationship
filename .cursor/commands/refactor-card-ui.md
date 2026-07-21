# Refactor card UI

Improve the Connection Cards UI/UX while keeping the vanilla JS architecture.

## Constraints

- No bundler or npm frontend dependencies unless the user explicitly requests
- Keep all logic in `public/index.html` unless splitting is explicitly requested
- Preserve Firebase sync behavior and room sharing
- Match existing design language: soft gradients, category themes, heart depth indicators

## Process

1. Read the current UI in `public/index.html` (HTML structure + CSS + render functions)
2. Identify the specific improvement requested (or ask if none provided)
3. Make focused changes:
   - CSS: use existing CSS variables and `categoryThemes`
   - JS: preserve `renderCard()`, `renderMenu()`, `initFirebase()` contracts
4. Test mentally against mobile breakpoint (820px) and modal interactions

## Safe improvements

- Accessibility: focus states, aria labels, keyboard navigation
- Responsive layout tweaks
- Animation polish (respect `prefers-reduced-motion` if adding motion)
- Typography and spacing consistency

## Avoid

- Rewriting the entire file
- Changing card data schema
- Breaking RTDB write paths

Summarize visual/UX changes made and what to verify in the browser.
