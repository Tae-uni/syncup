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

Node version: v18.18.0 (see `.nvmrc`)

## Architecture

### Monorepo Structure
- `client/` - Next.js 14 App Router frontend
- `server/` - Express.js backend with Prisma ORM
- `docs/` - Requirements spec and ERD

### Backend Pattern (server/src/)
```
features/sync/
├── routes.ts           # Route definitions
├── sync.controller.ts  # HTTP handlers
├── sync.service.ts     # Business logic
├── vote.controller.ts
├── vote.service.ts
└── schemas.ts          # Zod validation schemas

middlewares/
├── AppError.ts         # Custom error class: AppError(message, statusCode, code, details?)
└── errorHandler.ts     # Returns { success: false, error: { code, message, details? } }

utils/asyncHandler.ts   # Wraps async route handlers
config/prisma.ts        # Prisma singleton
```

### Frontend Pattern (client/src/)
```
app/sync/
├── page.tsx            # Create sync page
├── [id]/page.tsx       # View/vote sync page
└── syncApi.ts          # API client with ApiResponse<T> type

components/sync/        # Feature-specific components
lib/
├── timezoneConvert.ts  # Timezone conversion (UTC storage, local display)
└── heatmapTimeUtils.ts
types/sync.ts           # Shared TypeScript types
```

### API Routes
- `POST /api/sync` - Create sync with time options
- `GET /api/sync/:id` - Get sync details with votes
- `POST /api/sync/:id/votes` - Submit vote (name + passcode required)
- `DELETE /api/sync/:id/votes` - Cancel votes (name + passcode verification)

### Database Models (Prisma)
- **Sync** - Scheduling session (title, description, timeZone, expiresAt)
- **TimeOption** - Proposed time slots linked to Sync
- **Participant** - Voters identified by name + hashedPasscode (unique per Sync)
- **Vote** - Links Participant to TimeOption (unique constraint)

Cascade: Deleting a Sync cascades to TimeOptions, Participants, and Votes.

## Key Patterns

### Error Handling
Server errors use `AppError` class thrown from services, caught by global handler:
```typescript
throw new AppError('Invalid passcode', 401, 'INVALID_PASSCODE');
```

### Timezone Handling
- All times stored in UTC in database
- Conversion to local timezone happens only at display time
- Use `lib/timezoneConvert.ts` patterns for any time logic

### Validation
Zod schemas in `server/src/features/sync/schemas.ts` with superRefine for complex rules.

## Development Rules

From project skills that MUST be followed:

1. Do NOT implement features not explicitly defined in `docs/requirements.md`
2. Do NOT reinterpret or extend requirements without confirmation
3. If a requirement is ambiguous, STOP and ask for clarification
4. New APIs must follow existing `routes.ts` patterns
5. New components go in `components/sync/`
6. Error handling must use `AppError` class
7. Types must be defined in `types/sync.ts`
8. Do NOT introduce new patterns without explicit approval

## Git Conventions

### Commit Messages
Use gitmoji prefix with scope: `:emoji: (scope) short description`
- `:sparkles:` new feature, `:bug:` bug fix, `:memo:` docs, `:recycle:` refactor

### Pull Requests
- Title: `Type/issue-number short description` (e.g. `Feat/28 update Swagger docs`)
- Body:
  ```
  ## Changes
  - bullet points

  Closes #number
  ```

## Environment Variables

- Server: `DATABASE_URL` (PostgreSQL connection string)
- Client: `NEXT_PUBLIC_API_URL=http://localhost:5002`
