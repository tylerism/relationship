# Start local development

Start the Connection Cards dev environment and verify it works.

## Steps

1. Check if anything is already listening on port 8000
2. Start Firebase emulators in the background (if not already running):
   ```bash
   firebase emulators:start
   ```
3. Start the Python dev server in the background:
   ```bash
   python3 server.py
   ```
4. Open http://localhost:8000 in the browser (or tell the user to)
5. Verify:
   - Page loads with card UI
   - Room code appears in the header
   - Sync status shows "Synced" (or "Connecting…" then "Synced")
   - Skip and answer actions work

## If sync fails

- Confirm emulators are running (Auth :9099, RTDB :9000)
- Confirm the app is served from localhost (not the hosting emulator on :5000)
- Check browser console for Firebase errors
- Read `public/js/firebase-init.js` emulator wiring

Report what you started, any errors, and the room code if visible.
