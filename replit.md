# Chor Police Dakat Babu

A real-time multiplayer card bluffing game — "The Ultimate Bluffing Game" — playable online with 4–16 friends. Create or join a room with a 6-character code, get a secret role (Babu/Police/Chor/Dakat), and try to catch or evade the Police.

## Run & Operate

- `pnpm --filter @workspace/chor-police run dev` — run the web app (port auto-assigned)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm run typecheck` — full typecheck across all packages

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- **Web App**: React 19 + Vite + TailwindCSS v4 + Framer Motion
- **Auth**: Firebase Auth (Email/Password + Google + Guest)
- **Database**: Firebase Firestore (real-time listeners)
- **Sound**: Howler.js
- **PWA**: vite-plugin-pwa (installable on Android/iPhone from browser)
- **Routing**: Wouter
- **UI**: shadcn/ui components

## Where Things Live

- `artifacts/chor-police/` — React web app (PWA)
- `artifacts/chor-police/src/pages/` — All pages: Landing, Auth, CreateRoom, JoinRoom, Lobby, Game, History, Profile, Rules
- `artifacts/chor-police/src/lib/gameLogic.ts` — Role distribution & scoring logic
- `artifacts/chor-police/src/lib/sounds.ts` — Howler.js sound effects
- `artifacts/chor-police/src/contexts/AuthContext.tsx` — Firebase auth context
- `artifacts/chor-police/public/manifest.json` — PWA manifest
- `artifacts/api-server/` — Express API (health check only; game logic lives in Firestore)

## Firebase Project

- Project ID: `hiddenrole-567f1`
- Auth: Email/Password + Google enabled
- Firestore: rooms, users, gameHistory collections

## Firestore Schema

- `users/{uid}` — profile, stats, friends, friendRequests
- `rooms/{roomCode}` — real-time game room (6-char code)
- `rooms/{roomCode}/messages/{id}` — in-room chat
- `gameHistory/{id}` — completed game records

## Game Rules

- 4–16 players join a room with a code
- Roles distributed: 1 Babu (safe), 1+ Police, 1+ Chor, 1+ Dakat
- Police must identify the Chor from the player list
- Correct guess → Police earns points, Chor earns 0
- Wrong guess → Chor steals Police's points
- Babu and Dakat always earn their fixed points
- Scoring, rounds, and time limit are all configurable by the host

## Architecture Decisions

- Firebase-first: all real-time game state lives in Firestore; no custom WebSocket server needed
- Host triggers game start and next-round transitions; police players can finalize round result directly (avoids host/police mismatch bug in multi-police games)
- PWA manifest uses the game logo JPEG as icon (works for Android/iOS install)

## User Preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Firebase config is in env vars (`VITE_FIREBASE_*`) — set in Replit Secrets/Env
- PWA service worker only fully activates in production build; dev mode uses `devOptions: { enabled: true }`
- `react-confetti` must be installed separately (not in base scaffold)
- `vite-plugin-pwa` is a devDependency of `@workspace/chor-police`
