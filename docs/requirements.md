# SyncUp – Requirements Specification

## 1. Project Overview
SyncUp is a lightweight scheduling service that allows a single organizer (Leader)
to propose time options and collect availability votes from participants
without requiring user accounts or registration.

The system is designed to be frictionless, fast, and intuitive.

## 2. Core Concepts
- Sync: A scheduling session created and managed by a Leader.
- Leader: The creator and sole administrator of a Sync.
- Participant: A user who joins a Sync to vote on time options.
- Time Option: A candidate date/time proposed by the Leader.
- Vote: A participant’s availability response to one or more Time Options.
- Passcode: A 4-digit numeric code used to verify ownership of a Leader’s Sync or a Participant’s vote.

## 3. Requirements at a Glance (Planned -> Status)

### Functional
| ID | Function | Priority | Status |
|----|----------|:--:|:--:|
| FR-01 | Create meeting (title, options → shareable URL) | P1 | ✅ Done |
| FR-02 | Share meeting (copy / QR / email) | P1 / P2 | 🔸 Copy link only |
| FR-03 | Submit time vote (name + slots) | P1 | ✅ Done |
| FR-04 | View results (highlight best time, per-person) | P1 | ✅ Done |
| FR-05 | Meeting expiration | P1 | ✅ Done |
| FR-06 | Anonymous access (no sign-up) | P1 | ✅ Done |

### Non-functional
| ID | Requirement | Status |
|----|-------------|--------|
| NFR-01 | Performance (load < 3s, API < 1s) | 🔸 Not measured |
| NFR-02 | Responsive (mobile / tablet / desktop) | ✅ Done |

> **Notes:** QR and email sharing (P2) were descoped in favor of a simple copy link.
> The original "host name" evolved into a name + 4-digit passcode for vote ownership.

---


## 4. Functional Requirements

### 4.1 Sync Creation (Leader Only)
- Only a Leader can create a Sync.
- A Sync must include:
  - A title
  - One or more Time Options
- The Leader must be able to add, modify, and remove Time Options.

### 4.2 Participant Voting
- Participants must be able to join a Sync without registration.
- To submit a vote, a participant must provide:
  - A display name
  - A 4-digit numeric passcode
- Participants may vote only on Time Options defined by the Leader.
- Participants must be able to modify or delete their own votes
  by re-entering the same name and passcode.

### 4.3 Access Control Rules
- Participants must NOT be able to:
  - Create or modify a Sync
  - Add or remove Time Options
- Leaders are not required to create a traditional account; instead, a Leader
  verifies ownership with a 4-digit passcode when editing or deleting a Sync.
- Passcodes are used solely for lightweight ownership verification.

### 4.4 Time Zone Handling
- All Time Options must be stored in UTC.
- Time zone conversion must occur only at presentation time.
- All participants must see the same Time Option moments,
  converted to their local time zones.

## 5. Non-Functional Requirements
- The system must prioritize simplicity and clarity.
- No feature should introduce unnecessary friction.
- Invalid or ambiguous time ranges must be rejected explicitly.
- API behavior must be predictable and deterministic.

## 6. Out of Scope
- User accounts or profiles
- Password-based authentication
- Role switching between Leader and Participant
- Calendar integrations
- Real-time communication features
