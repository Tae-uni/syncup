# SyncUp – Architecture

How SyncUp is built. Requirements are in [requirements.md](./requirements.md).

## Overview

The repository holds two independent apps. `client/` is a Next.js 14 frontend on the App Router,
and `server/` is an Express API backed by Prisma and PostgreSQL. They share no packages and no
build tooling. Each has its own `package.json` and deploys separately.

There are no user accounts. A 4-digit passcode proves ownership instead. The Leader gets one
passcode per Sync, and each Participant is identified by a name and passcode pair scoped to that
Sync. Both are stored as bcrypt hashes and never appear in API responses.

## Backend

Requests flow in one direction:

```
route → validateRequest (Zod) → rate limiter → controller → service → Prisma
```

Controllers only handle HTTP. Business rules and database access live in services. A service
reports failure by throwing `AppError` and never touches `res`.

```
server/
├── swagger.yaml                    # OpenAPI spec, served at /api-docs
├── prisma/schema.prisma
├── tests/                          # Vitest, run against a real Postgres
└── src/
    ├── index.ts
    ├── config/          prisma.ts (singleton), swagger.ts
    ├── features/sync/   routes.ts, schemas.ts, {sync,vote}.{controller,service}.ts
    ├── jobs/            cleanupExpiredSyncs.ts
    ├── middlewares/     AppError.ts, errorHandler.ts, rateLimiters.ts, validators.ts
    └── utils/           asyncHandler.ts
```

Middleware order in `index.ts` matters:

```
helmet → cors → express.json({ limit: "10kb" }) → globalRateLimit → routes → /api-docs → errorHandler
```

`errorHandler` has to stay last. `trust proxy` is set to `1`. Without it the rate limiters count
every request against the hosting proxy's IP instead of the client's.

## Frontend

```
client/src/
├── app/
│   ├── layout.tsx, page.tsx, manifest.ts
│   └── sync/
│       ├── page.tsx           # create
│       ├── [id]/page.tsx      # view and vote
│       ├── [id]/edit/page.tsx # leader edit, passcode gated
│       └── syncApi.ts
├── components/sync/           # feature components
├── components/ui/             # shadcn primitives
├── lib/timezoneConvert.ts, utils.ts
└── types/sync.ts
```

`syncApi.ts` is the only place that calls the API. It also maps server validation messages to
user-facing copy.

## API

Base path `/api/sync`. Full spec in `server/swagger.yaml`, browsable at `/api-docs`.

| Method | Path | Auth | Rate limit |
|--------|------|------|-----------|
| POST | `/` | None | create |
| GET | `/:id` | None | global |
| PUT | `/:id` | Leader passcode | passcode |
| DELETE | `/:id` | Leader passcode | passcode |
| POST | `/:id/verify-leader` | Leader passcode | passcode |
| POST | `/:id/votes` | Name + passcode | passcode |
| DELETE | `/:id/votes` | Name + passcode | passcode |

`PUT /:id` matches incoming slots against existing ones by `startTime|endTime`. Slots that are
unchanged keep their id, so votes on them survive the edit. Only slots that disappear from the
request are deleted. Participants left with zero votes are shown as needing to re-vote.

## Data model

Defined in `prisma/schema.prisma`. See also [erd.dbml](./erd.dbml) and [erd.svg](./erd.svg).

```
Sync ──┬── 1:N ──> TimeOption ──┐
       │                        ├──> Vote
       └── 1:N ──> Participant ─┘

TimeOption.createdBy ──> Participant   (optional)
```

`Vote` is a single join table. One row links one Participant to one TimeOption, and the pair is
unique, so a participant cannot vote twice for the same slot. The presence of a row is the vote
itself, meaning the participant is available for that time.

`TimeOption.createdBy` is a separate and optional link to the Participant who proposed the slot.

Participants belong to one Sync and are identified by name, unique within that Sync.
`Sync.timeZone` records the timezone the Leader was working in. It is display metadata, not a
storage format.

Deletion rules:

| Relation | On delete |
|----------|-----------|
| `Sync` → `TimeOption`, `Participant` | Cascade |
| `Participant`, `TimeOption` → `Vote` | Cascade |
| `Participant` → `TimeOption.createdBy` | SetNull |

Deleting a Sync removes everything under it. `TimeOption.createdBy` is the exception. Removing a
Participant nulls the authorship link rather than deleting the slot they proposed.

## Time

Everything is stored and transmitted in UTC. `startTime` and `endTime` cross the wire as ISO-8601
strings with a `Z` suffix, enforced by regex in `schemas.ts`. Conversion to a local timezone
happens only at display time, in `lib/timezoneConvert.ts`.

## Errors

Services throw `AppError(message, statusCode, code, details?)`. One terminal handler formats every
response as `{ success: false, error: { code, message, details? } }`. Anything that is not an
`AppError` is logged and returned as a generic `500 INTERNAL_ERROR`.

## Validation

`validateRequest` parses `params`, `query`, and `body` at the route boundary, so controllers and
services always receive validated input. A `ZodError` becomes `400 VALIDATION_ERROR` with a
`details` array of `{ path, message }`. Exceeding the time-option cap is special-cased to
`413 TOO_MANY_TIME_OPTIONS`.

Limits live in `schemas.ts`. The less obvious ones are 20 time options per Sync, a 10 kB request
body, and an expiry that defaults to three days out and cannot exceed thirty.

## Rate limiting

Three limiters share a 15-minute window. `globalRateLimit` allows 300 requests and applies to
everything, `createRateLimit` allows 20 on Sync creation, and `passcodeRateLimit` allows 10 on
every route that checks a passcode. The last one is what makes a 4-digit code usable as an
ownership check, since it caps how fast an attacker can work through the 10,000 possibilities.

## Expiration

A cron job (`0 2 * * 0`) deletes Syncs past their `expiresAt`. Cascade rules clear the rows
underneath, so expiry needs no separate cleanup path.

## Production

`helmet` for headers, CORS restricted to `ALLOWED_ORIGIN`, and Swagger try-it-out disabled when
`NODE_ENV=production`.
