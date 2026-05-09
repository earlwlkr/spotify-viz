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

## Spotify API safety

- Prefer current endpoints such as `/me/top/{type}`, `/me/tracks`, `/me/albums`, `/me/playlists`, `/playlists/{id}/items`, `/me/player/recently-played`, and `/me/player/currently-playing`.
- Check response fields too: a non-deprecated endpoint can still include deprecated or removed fields. Avoid building new features on fields such as `popularity`, `available_markets`, `linked_from`, preview URLs, user country/email/product, or artist `genres`.
- Use URI-based library endpoints (`/me/library` and `/me/library/contains`) instead of older type-specific save/remove/follow/contains routes.
- Use `/playlists/{id}/items` instead of deprecated playlist `/tracks` routes.
- If you were already signed in before these scopes changed, sign out and reconnect so Spotify grants playback-read scopes for Now Playing.

## Auth flow

- `/api/auth/spotify` → redirects to Spotify
- `/api/auth/callback/spotify` → exchanges code, sets cookies
- `lib/spotify.ts` → reads cookie, auto-refreshes token on expiry
