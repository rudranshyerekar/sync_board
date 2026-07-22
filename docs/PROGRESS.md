# SyncBoard — PROGRESS.md
### Project Status, Implementation Tracker & AI Context Handoff

**Purpose:** This is the single file an AI (or new developer) should read first to understand where the project stands without re-analyzing the entire codebase. Update this file after every significant implementation milestone.

**Last Updated:** 2026-07-22

---

## Quick Summary

SyncBoard is a **real-time collaborative Kanban board** built with Spring Boot (backend), React (frontend), and WebSockets (STOMP over SockJS). The database is **MySQL (local, not containerized)**.

---

## Current Phase: Phase 4 — Presence + Editing

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 0 — Project Setup | ✅ Complete | Skeleton project, folder structure, DB setup |
| Phase 1 — Backend CRUD + Auth | ✅ Complete | Entities, REST APIs, JWT auth, authorization, `GET /api/users/me` |
| Phase 2 — Frontend & Backend Integration | ✅ Complete | Full REST integration, Session restoration, DTO alignment, Aggregated `/api/boards/{id}/full` API |
| Phase 3 — WebSocket Card Sync | ✅ Complete | STOMP server message broker (`WebSocketConfig`), client STOMP subscriptions, live card moves |
| Phase 4 — Presence + Editing | 🚧 In Progress | Heartbeat, online/offline status, soft-lock card indicators |
| Phase 5 — Comments + Notifications | ⬜ Not Started | Live comments thread, notifications dispatcher |
| Phase 6 — Activity + Hardening | ⬜ Not Started | Activity feed audit, permission polish, concurrency hardening |
| Phase 7 — Docker + Tests + Deploy | ⬜ Not Started | Dockerfiles, unit/integration testing, deployment docs |

**Status Legend:** ⬜ Not Started | 🚧 In Progress | ✅ Complete | ⏸️ Paused

---

## Tech Stack (Confirmed)

### Backend
- **Framework:** Spring Boot 3.3.1 (Java 17)
- **Security:** Spring Security 6 + JWT (Access Token + 7-Day Refresh Token)
- **Real-Time:** Spring WebSocket + STOMP broker (Pending `WebSocketConfig`)
- **ORM:** Spring Data JPA / Hibernate
- **Database:** MySQL 8.0 (local installation on port 3306)
- **Build Tool:** Maven (`pom.xml`)

### Frontend
- **Framework:** React 19 (Vite 8)
- **Routing:** React Router v7
- **Styling:** Tailwind CSS v4
- **Drag & Drop:** React DnD 16
- **Real-Time Client:** SockJS + STOMP.js
- **HTTP Client:** Axios 1.18.1
- **State Management:** Zustand 5 (`useAuthStore`, `useBoardStore`)

### Infrastructure
- **Database:** MySQL running locally as a Windows service (`jdbc:mysql://localhost:3306/syncboard`)
- **Dev Workflow:** `./mvnw spring-boot:run` + `npm run dev`

---

## What Exists So Far

### Project Documentation (Complete)
- [x] **README.md** — Project overview, features, tech stack
- [x] **SyncBoard-PRD.md** — Full Product Requirements Document (22 sections)
- [x] **Architecture.md** — System architecture, folder structures, data flows
- [x] **Phases.md** — 8-phase development plan with checklists
- [x] **Rules.md** — Engineering rules & conventions
- [x] **PROGRESS.md** — THIS FILE (project status tracker)
- [x] **Design.md** — UI/UX design system, colors, typography
- [x] **DATABASE.md** — MySQL setup guide and schema reference

### Architecture & Quality Audit Reports (Generated)
- [x] **Contract-Review.md** — Complete Frontend-Backend contract inventory & 9 mismatches
- [x] **project_analysis_report.md** — Deep 24-point system architecture report
- [x] **integration_review_report.md** — Full-stack contract review & integration catalog
- [x] **pre_testing_bug_hunting_review.md** — Pre-testing bug hunt, mock audit, & contract mismatches

### Source Code
- [x] Backend project (`syncboard-backend`) — Spring Boot REST APIs, JWT Security, Aggregated Board APIs, JPA Repositories
- [x] Frontend project (`syncboard-frontend`) — React 19 UI, Zustand state management, Axios interceptors, React DnD Kanban board
- [x] Database schema — MySQL `syncboard` database with 8 relational tables and indexes

---

## Key Decisions Made

| # | Decision | Rationale | Date |
|---|----------|-----------|------|
| 1 | **MySQL (local) instead of PostgreSQL (Docker)** | Developer preference; avoids Docker dependency for database; MySQL runs as a local Windows service | 2026-07-18 |
| 2 | **Modular monolith, not microservices** | Single-server simplicity; demonstrates real-time correctness without distributed-systems overhead | Planning phase |
| 3 | **STOMP over SockJS, not raw WebSocket** | Topic-based pub/sub fits board/card/presence subscription model naturally | Planning phase |
| 4 | **Optimistic concurrency + soft-lock (dual mechanism)** | Soft-lock reduces conflict frequency (UX); version check guarantees no silent overwrites (safety) | Planning phase |
| 5 | **Aggregated Board Hierarchy Endpoint (`GET /api/boards/{id}/full`)** | Replaces $N+1$ frontend fetch requests (1 board + 1 columns + $N$ cards) with 1 single nested JSON response | 2026-07-22 |
| 6 | **Session Restoration via `GET /api/users/me`** | `useAuthStore.checkAuth()` calls `/api/users/me` on app boot to restore user state on page refresh (F5) | 2026-07-22 |

---

## Known Issues & Backlog Items

| # | Issue | Impact | File Location / Reference |
|---|-------|--------|---------------------------|
| 1 | **Unimplemented Backend Domain Services (Presence, Comments, Activity, Notifications)** | Critical | `com.syncboard.presence`, `com.syncboard.comment`, `com.syncboard.activity`, `com.syncboard.notification` |
| 4 | **Card Priority Selector Missing in Drawer UI** | Medium | `syncboard-frontend/src/features/cardDetail/components/CardDrawer.jsx` |
| 5 | **Mobile Responsive Sidebar Menu Missing (< 768px)** | Medium | `syncboard-frontend/src/app/layout/MainLayout.jsx` |

---

## Recent Changes (Reverse Chronological)

### 2026-07-22
- **Phase 3 Real-Time WebSocket Integration:** Successfully replaced the frontend's mock WebSocket service with a real SockJS + STOMP client using `@stomp/stompjs`. 
- **Backend WebSocket Config:** Implemented `WebSocketConfig.java` to enable the STOMP message broker on the `/ws` endpoint.
- **WebSocket JWT Auth:** Created `JwtChannelInterceptor.java` to secure the STOMP connection by verifying the JWT access token sent in the `CONNECT` frame.
- **Live Card Moves:** Configured `useBoardStore` to push card move events through STOMP (`/app/board/{boardId}/card/move`), and added `BoardWebSocketController` to broadcast `CARD_MOVED` and `CARD_EDITING_START` events to all connected clients.
- **Full-Stack Integration Fixes:** Resolved 5 key integration gaps between `syncboard-backend` and `syncboard-frontend`.
- **User Session Restoration:** Created `GET /api/users/me` endpoint in backend (`UserController.java`, `UserService.java`). Updated `useAuthStore.checkAuth()` to fetch user details when `accessToken` is found in `localStorage`, calling it on boot in `App.jsx` so sessions persist on browser refresh (F5). Bound dynamic user profile and logout action in `MainLayout.jsx`.
- **JWT Refresh TTL Fix:** Updated `AuthService.java` and `JwtTokenProvider.java` so refreshed tokens issue new refresh tokens with the full 7-day TTL instead of short access token TTL.
- **Card Assignee & Deadline DTO Alignment:** Enhanced `CardResponse.java` to return populated `UserResponse assignee` object and deadline string. Updated `CardPreview.jsx` and `CardDrawer.jsx` to safely render assignee avatars and deadline dates.
- **Aggregated Board Hierarchy API ($N+1$ Request Fix):** Created `FullBoardResponse.java` and `ColumnWithCardsResponse.java`. Added `GET /api/boards/{boardId}/full` in `BoardSingleController.java` and `BoardService.java`. Refactored `useBoardStore.js` `fetchBoard()` to query full board hierarchy in 1 single HTTP request instead of 8 sequential requests.
- **Multi-Workspace & Member Invite UI:** Updated `DashboardView.jsx` to fetch and group boards per workspace dynamically across all user workspaces. Added `InviteMemberModal.jsx` connected to `workspaceApi.inviteMember`. Refactored `CreateBoardView.jsx` with controlled workspace selection dropdown and form state.
- **Full Build Verification:** Backend compiled clean (`./mvnw clean compile` -> `BUILD SUCCESS`) and frontend built clean (`npm run build` -> `vite build` succeeded in 649ms).
- **Completed Quality & Security Audits:** Created 24-point system architecture report, 15-point full-stack integration review, and pre-testing bug hunting audit.
- **UI Alignment - Sidebar:** Added "YOUR BOARDS" section to the left sidebar in `MainLayout.jsx` with static mock data to match the UI design.
- **UI Alignment - Create Card Modal:** Replaced the inline textarea with a detailed `CreateCardModal.jsx` for card creation. Updated `useBoardStore` to transmit the full payload (title, description, priority, deadline, assigneeId, position).
- **UI Alignment - Create Column Modal:** Created `CreateColumnModal.jsx` featuring color swatches and position selection. Updated `BoardColumn` entity and `ColumnResponse/Request` DTOs to include `color` and `description`. Updated `BoardService` and `BoardColumnService` to map and persist the new column metadata, rendering dynamic colored dots in `Column.jsx` headers.

### 2026-07-20
- Built full React frontend Kanban UI using `react-dnd` and Tailwind CSS matching the visual mockup.
- Created `MockDataService` and Zustand store (`useBoardStore`) for optimistic updates and state management.
- Implemented `BoardView`, `Column`, `CardPreview`, and `CardDrawer` components.
- Extracted global shell into `MainLayout.jsx` and built responsive, fully-styled `DashboardView` and `CreateBoardView`.

### 2026-07-18
- Initialized Spring Boot backend project (`syncboard-backend`) with Maven.
- Initialized React frontend project (`syncboard-frontend`) with Vite.
- Created `syncboard` local MySQL database.
- Created documentation in `docs/` (`SyncBoard-PRD.md`, `Architecture.md`, `Phases.md`, `Rules.md`, `Design.md`, `DATABASE.md`).

---

## File Map (Quick Reference)

```
sync_board/
├── README.md                 — Project overview (stays at root for GitHub visibility)
├── .gitignore                — Git ignore rules
├── .env.example              — Environment variable template
├── docs/
│   ├── PROGRESS.md           — THIS FILE (status tracker & AI context)
│   ├── SyncBoard-PRD.md      — Full product requirements (THE reference doc)
│   ├── Architecture.md       — System design, folder structures, data flows
│   ├── Phases.md             — Phase-by-phase development checklist
│   ├── Rules.md              — Engineering rules & conventions
│   ├── Design.md             — UI/UX design system
│   ├── DATABASE.md           — MySQL setup & schema reference
│   ├── images/               — UI reference screenshots
│   └── materials/            — Reference PDFs and analysis
├── syncboard-backend/        — Spring Boot 3.3.1 backend project
└── syncboard-frontend/       — React 19 frontend SPA project
```

---

## For AI Assistants: Context Loading Priority

When starting a new chat session about this project, read files in this order:

1. **docs/PROGRESS.md** (this file) — current status, what exists, recent changes
2. **docs/Phases.md** — what phase we're in, what tasks remain
3. **docs/Architecture.md** — how the system is structured
4. **docs/Rules.md** — engineering conventions to follow
5. **docs/SyncBoard-PRD.md** — detailed specs
6. **docs/Design.md** — UI/UX decisions
7. **docs/DATABASE.md** — schema details

---

*Update this file after every significant implementation milestone. Keep it honest — an AI reading a stale PROGRESS.md is worse than having none at all.*
