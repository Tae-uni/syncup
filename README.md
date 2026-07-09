# SyncUp

A lightweight scheduling tool for finding a time that works for everyone, without asking anyone to create an account.

A Leader proposes a few time slots, shares a link, and participants mark when they're free using nothing but a name and a 4-digit passcode. No sign-up, no email, no third-party sign-in.

**Live demo:** <!-- TODO: add deployed URL -->

<!-- TODO: add a screenshot of the live results view (with a few votes filled in) -->

## Why I built it

Coordinating a time in a group chat always turns into the same back-and-forth: "when are you free?" asked fifteen times. I wanted a version that stays out of the way (no accounts, no friction, just a shared link) and gets the two details right that make this kind of tool actually usable: timezones across participants, and not losing votes when the organizer tweaks the options.

The goal was simple and modern, not feature-heavy. The interesting part is underneath the UI.

## Tech stack

**Frontend:** Next.js 14 (App Router), TypeScript, Tailwind + shadcn/ui, Luxon and date-fns-tz for timezone math, `@vvo/tzdb` for the timezone picker.

**Backend:** Express + TypeScript, Prisma ORM over PostgreSQL, Zod for validation, bcrypt, helmet, express-rate-limit. The API is documented with a hand-written OpenAPI spec served through Swagger UI.

## Highlights

- **No accounts.** Join and vote with just a name and a 4-digit passcode.
- **Timezone-aware.** Times are stored in UTC and converted per viewer, with a toggle to switch between the Sync's timezone and your own local one.
- **Votes survive edits.** Organizers can add or remove time slots without erasing the votes already cast on the others.
- **Atomic writes.** A participant's votes are replaced inside a single transaction, with unique constraints guarding integrity at the database level.
- **Validated at the boundary.** Every request passes Zod schemas (including cross-field rules) before touching business logic, and request bodies are capped at 10kb.
- **Consistent API.** One response envelope, a typed error-code taxonomy, and meaningful status codes (`410` expired, `413` too large, `429` rate-limited).
- **Brute-force resistant.** Passcodes are bcrypt-hashed and the auth endpoints are rate-limited.
- **Self-cleaning.** Syncs expire and a weekly job purges the old ones.
- **Documented.** The full API is described in an OpenAPI spec and browsable at `/api-docs`.

## Design notes

Notes on a few of the implementation decisions.

### Preserving votes when options change

Time slots cascade to votes, so naively recreating them on every edit would discard existing answers. Instead, `updateSync` diffs incoming slots against stored ones by their `start|end` key, so only added and removed slots change and untouched slots keep their votes. ([`server/src/features/sync/sync.service.ts`](server/src/features/sync/sync.service.ts))

### Identity and passcodes

A participant is identified by a name and a 4-digit passcode, with no account required. Since a 4-digit code is only 10,000 possibilities, passcodes are bcrypt-hashed and the verify, vote, and cancel endpoints are rate-limited to 10 attempts per 15 minutes. This is ownership verification rather than real authentication (see [limitations](#limitations--roadmap)).

### Timezone handling

All times are stored in UTC and converted only at display time, so a slot refers to the same moment for everyone. Participants can toggle between the Sync's timezone and their own local one, with the conversion logic kept in one place ([`client/src/lib/timezoneConvert.ts`](client/src/lib/timezoneConvert.ts)).

## Running locally

Requires Node `v22` (see `.nvmrc`) and a PostgreSQL database.

```bash
# server
cd server
npm install
npx prisma migrate dev
npm run dev                 # http://localhost:5002

# client
cd client
npm install
npm run dev                 # http://localhost:3000
```

Interactive API docs (Swagger UI) are served at **http://localhost:5002/api-docs**.

## Project layout

```
server/src/features/sync/   routes -> controller -> service -> schemas
server/src/middlewares/      AppError + global error handler
server/prisma/               Prisma schema (Sync, TimeOption, Participant, Vote)
server/src/jobs/             scheduled cleanup
server/swagger.yaml          OpenAPI 3.0 spec
client/src/app/sync/         create / view / edit pages
client/src/components/sync/  vote form, availability results, timezone picker, ...
client/src/lib/              timezone conversion + shared helpers
```

## Limitations & roadmap

Being clear about what this isn't:

- **The passcode model is lightweight by design.** Anyone who knows a participant's name and guesses their code can edit that vote. Suitable for casual scheduling, not for anything sensitive.
- **No realtime.** Results update on refetch; websockets would be the natural next step.
- **The cleanup cron runs in-process.** On a host that sleeps it needs an external ping to fire reliably.