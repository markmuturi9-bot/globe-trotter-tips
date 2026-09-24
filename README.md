# TIPIT

TIPIT is an app for saving and sharing travel tips on a map. Frontend is
React + Vite + TypeScript, packaged for iOS with Capacitor, backed by
Supabase (Postgres, Auth, Storage, Edge Functions).

See `CLAUDE.md` for the working rules this project follows, and
`docs/STATUS.md` for current status and known issues.

## Local development

```sh
# Install dependencies
npm install

# Start the dev server
npm run dev

# Type-check / lint
npm run lint

# Production build
npm run build
```

The public Supabase URL and publishable key are hardcoded in
`src/integrations/supabase/client.ts` — they're not secrets, so no `.env`
file is required to run the app locally.

## Backend (Supabase)

- Database schema lives in `supabase/migrations/` — see `supabase db
  push` (Supabase CLI) to apply migrations to a linked project.
- Edge Functions live in `supabase/functions/`.
- Pushing changes under `supabase/` to `main` runs
  `.github/workflows/supabase-deploy.yml`, which applies migrations,
  updates Edge Function secrets, and deploys all functions. It can also
  be run manually from the Actions tab.

## Mobile (Capacitor)

```sh
npm run build
npx cap sync ios       # after adding the ios/ project
npx cap open ios
```

The iOS project (`ios/App`) is managed separately and is not always
present in this repository.
