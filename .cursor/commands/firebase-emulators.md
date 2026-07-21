# Firebase emulators

Start Firebase emulators for local Connection Cards development.

## Steps

1. Confirm `firebase.json` emulator config (auth :9099, database :9000, hosting :5000)
2. Start emulators:
   ```bash
   firebase emulators:start
   ```
3. Tell the user:
   - Emulator UI: http://127.0.0.1:4000 (or the port shown in output)
   - For app testing, also run `python3 server.py` and open http://localhost:8000
   - The app auto-connects to emulators when served from localhost

## Notes

- This app uses **Realtime Database**, not Firestore
- Anonymous auth must succeed for RTDB read/write
- Do not use the hosting emulator alone for sync testing — use `server.py` so emulator detection works
