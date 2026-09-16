---
name: syncup-codebase-context
description: Understand existing codebase patterns and maintain consistency
---

## Purpose
Ensure new feature implementations follow existing code patterns
and maintain consistency across the codebase.

## Required Context (MUST review before implementation)

### Backend
- prisma/schema.prisma (data models)
- src/features/sync/routes.ts (API endpoint patterns)
- src/features/sync/schemas.ts (validation patterns)
- src/features/sync/*.service.ts (business logic patterns)
- src/features/sync/*.controller.ts (controller patterns)
- src/middlewares/AppError.ts (error handling pattern)

### Frontend
- src/app/sync/syncApi.ts (API call patterns)
- src/components/sync/*.tsx (component patterns)
- src/types/sync.ts (type definitions)
- src/lib/*.ts (utility patterns)

## Rules
- New APIs must follow existing routes.ts patterns
- New components must be created under components/sync/
- Error handling must use AppError class
- Types must be defined in types/sync.ts
- Time-related logic must follow lib/timezoneConvert.ts patterns
- Do NOT introduce new patterns without explicit approval