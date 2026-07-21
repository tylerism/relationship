# Deploy Firebase Hosting

Deploy Connection Cards to Firebase Hosting.

## Before deploying

1. Confirm the user wants to deploy (live deploys normally happen via CI on merge to `main`)
2. Review uncommitted changes — warn if deploying dirty state
3. Verify Firebase CLI is available:
   ```bash
   npx -y firebase-tools@latest --version
   ```

## Preview channel (safe)

```bash
firebase hosting:channel:deploy preview-$(date +%Y%m%d)
```

Share the preview URL from command output.

## Live deploy (careful)

Only if explicitly requested:

```bash
firebase deploy --only hosting,database
```

Project: `relationships-d7fce`

## With database rules

If `database.rules.json` changed, include `database` in the deploy target. Test rules in emulators first.

## CI path (preferred)

For production, create a PR and merge to `main`. GitHub Actions (`.github/workflows/firebase-hosting-merge.yml`) deploys automatically.

Report the deploy URL or any errors.
