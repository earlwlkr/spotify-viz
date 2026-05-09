# Spotify Viz

A collection of data visualizations built on the Spotify Web API.

## Setup

1. Copy `.env.example` to `.env.local` and fill in your Spotify credentials.
2. `npm install`
3. `npm run dev`
4. Visit `http://localhost:3000` and click "Connect Spotify".

## Adding a new project

1. Create a folder under `src/app/projects/<slug>/`.
2. Add a card in `src/app/page.tsx`.
3. Use helpers from `src/lib/spotify.ts` to fetch data.
4. Drop in components from `src/components/viz/` or build your own.

## Auth flow

- `/api/auth/spotify` → redirects to Spotify
- `/api/auth/callback/spotify` → exchanges code, sets cookies
- `lib/spotify.ts` → reads cookie, auto-refreshes token on expiry
