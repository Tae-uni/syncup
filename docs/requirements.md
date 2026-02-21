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
- Passcode: A 4-digit numeric code used to identify and modify a participant’s vote.

## 3. Functional Requirements

### 3.1 Sync Creation (Leader Only)
- Only a Leader can create a Sync.
- A Sync must include:
  - A title
  - One or more Time Options
- The Leader must be able to add, modify, and remove Time Options.

### 3.2 Participant Voting
- Participants must be able to join a Sync without registration.
- To submit a vote, a participant must provide:
  - A display name
  - A 4-digit numeric passcode
- Participants may vote only on Time Options defined by the Leader.
- Participants must be able to modify or delete their own votes
  by re-entering the same name and passcode.

### 3.3 Access Control Rules
- Participants must NOT be able to:
  - Create or modify a Sync
  - Add or remove Time Options
- Leaders must NOT be required to authenticate using traditional accounts.
- Passcodes are used solely for lightweight vote ownership verification.

### 3.4 Time Zone Handling
- All Time Options must be stored in UTC.
- Time zone conversion must occur only at presentation time.
- All participants must see the same Time Option moments,
  converted to their local time zones.

## 4. Non-Functional Requirements
- The system must prioritize simplicity and clarity.
- No feature should introduce unnecessary friction.
- Invalid or ambiguous time ranges must be rejected explicitly.
- API behavior must be predictable and deterministic.

## 5. Out of Scope
- User accounts or profiles
- Password-based authentication
- Role switching between Leader and Participant
- Calendar integrations
- Real-time communication features
