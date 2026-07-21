# Add connection cards

Add new cards to the Connection Cards deck in `public/index.html`.

## Input

Use any card ideas the user provides after the command. If none given, ask what categories, types (question/action), and depth levels they want.

## Steps

1. Read the existing `cards` array in `public/index.html`
2. Find the highest existing `id` and the list of current `category` values
3. For each new card, append an object with:
   ```javascript
   {
     id: <next sequential id>,
     category: "<existing or new category>",
     type: "question" | "action",
     depth: 1 | 2 | 3,
     question: "..."   // if type is question
     // action: "..." // if type is action
   }
   ```
4. If adding a **new category**, add a matching entry in `categoryThemes` (copy an existing theme and adjust colors)
5. Verify JSON-like syntax in the array (trailing commas, quotes)

## Quality guidelines

- Questions should feel warm, specific, and conversational — not clinical
- Actions should be doable in one sitting without special equipment
- Mix depths: 1 = light/fun, 2 = thoughtful, 3 = vulnerable/deep
- Avoid duplicate or near-duplicate prompts already in the deck

## After editing

Summarize how many cards were added, their IDs, and any new categories created.
