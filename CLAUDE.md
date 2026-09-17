# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SyncUp is a lightweight scheduling service where a Leader creates a Sync with time options and Participants vote on availability without user accounts. Authentication uses a simple name + 4-digit passcode pairing.

## Skills (MUST read before implementation)
- skills/requirements/SKILL.md
- skills/codebase/SKILL.md
- docs/requirements.md
- docs/architecture.md

## Commands

### Server (Express + Prisma)
```bash
cd server
npm run dev          # Start dev server (port 5002)
npm test             # Vitest integration tests (needs the test DB running)
npm run test:db:up   # Start test Postgres via Docker
npm run test:db:down # Stop and remove it
npm run typecheck    # tsc, includes tests
npm run lint         # ESLint
npm run format       # Prettier
npx prisma migrate dev    # Run migrations
npx prisma generate       # Regenerate Prisma client
npx prisma studio         # Database GUI
```

### Client (Next.js 14)
```bash
cd client
npm run dev          # Start dev server (port 3000)
npm run build        # Production build
npm run lint         # ESLint
```

Node version: v22 (see `.nvmrc`)

## Architecture

Two apps in one repo: `client/` (Next.js 14 App Router) and `server/` (Express + Prisma + PostgreSQL).
They share no packages and deploy separately. Backend layering is
route → validate → controller → service → Prisma.

**Read [docs/architecture.md](docs/architecture.md) before adding an endpoint, changing the data
model, or touching project structure.**

## Development Rules

From project skills that MUST be followed:

1. Do NOT implement features not explicitly defined in `docs/requirements.md`
2. Do NOT reinterpret or extend requirements without confirmation
3. If a requirement is ambiguous, STOP and ask for clarification
4. Do NOT introduce new patterns without explicit approval
5. New APIs must follow existing `routes.ts` patterns
6. Services throw `AppError`; a service must never send a response itself
7. Define Zod schemas in `features/sync/schemas.ts` and validate at the route via `validateRequest`
8. Store and transmit UTC; convert only at display time via `lib/timezoneConvert.ts`
9. New components go in `components/sync/`
10. Types must be defined in `types/sync.ts`

## Git Conventions

### Commit Messages
Use gitmoji prefix with scope: `:emoji: (scope) short description`
- `:sparkles:` feature, `:bug:` fix, `:pencil:` docs, `:recycle:` refactor
- `:wrench:` config, `:lock:` security, `:fire:` removal, `:white_check_mark:` tests, `:construction_worker:` CI

### Pull Requests
- Title: `Type/issue-number short description` (e.g. `Feat/28 update Swagger docs`)
- Body:
  ```
  ## Changes
  - bullet points

  Closes #number
  ```

## Environment Variables

- Server: `DATABASE_URL`, `PORT` (default 5002), `ALLOWED_ORIGIN` (default `http://localhost:3000`), `NODE_ENV`
- Client: `NEXT_PUBLIC_API_URL` (default `http://localhost:5002`)
