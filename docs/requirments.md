# Requirements specification

## Project: SyncUp
Developer: Taekwon Kim  

Stack
- Frontend: Next.js (TypeScript)
- Backend: Express.js (TypeScript)
- Database: PostgreSQL (Neon)
- Deployment: Vercel (Frontend), Railway (Backend)
- CI / CD: GitHub Actions

### Problem Statement
Scheduling meetings with multiple people is a common situation but it is often a tedious task. Most existing tools require sign-ups and are optimized for enterprise users or integrate with calendars. **SyncUp** project aims to make this process **fast** and **simple**.

### Objectives
A lightweight scheduling web app that helps users quickly find the best time to meet others. No needs to login and no need to connect external calendars.

### Project Context
This solo project follows the MVC architectural pattern and MVP development strategy. It applies an Agile-inspired approach, focusing on delivering core value features first and improving through short development cycles. It uses modern cloud platforms (Vercel, Railway, Neon) for CI/CD and deployment.

### Features
- Create a schedule room with title and data/time range.
- Sharable link without login.
- Participants select their available time slots.
- Result page shows availability heatmap.
- Final result based on the most common available time slots.