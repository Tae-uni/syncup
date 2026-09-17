---
name: syncup-project-requirements
description: Canonical rules for interpreting and enforcing requirements in the SyncUp project
---

## Purpose
This Skill defines how requirements for the SyncUp project must be interpreted,
validated, and enforced during implementation, refactoring, and review.

All development decisions MUST prioritize correctness and requirement compliance
over convenience or speed.

## Required Context
- docs/requirements.md
- docs/architecture.md

## Non-Negotiable Rules
- Do NOT implement features that are not explicitly defined in the requirements.
- Do NOT reinterpret or extend requirements without explicit confirmation.
- If a requirement is ambiguous, STOP and ask for clarification.
- Existing behavior that satisfies a requirement must not be broken silently.
- Do Not introduce authentication or authorization mechanisms that are not explicitly defined in the requirements.

## Interpretation Principles
- Data integrity is more important than UI/UX convenience.
- Business rules take precedence over technical elegance.
- Performance optimizations are secondary to correctness.
- Explicit requirements override best practices.
- Simplicity and low friction are first-class requirements.

## Change Policy
When a change to requirements seems necessary:
1. Clearly state why the change is needed.
2. Describe the scope and affected components.
3. Propose at least one alternative that preserves existing requirements.
No implementation should proceed before approval.

## Output Expectations
- Always reference the relevant requirement when explaining a decision.
- Explicitly point out requirement violations if they exist.
- Avoid speculative improvements unless requested.