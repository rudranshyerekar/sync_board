# SyncBoard — PROGRESS.md
### Project Status, Implementation Tracker & AI Context Handoff

**Purpose:** This is the single file an AI (or new developer) should read first to understand where the project stands without re-analyzing the entire codebase. Update this file after every significant implementation milestone.

**Last Updated:** 2026-07-18

---

## Quick Summary

SyncBoard is a **real-time collaborative Kanban board** built with Spring Boot (backend), React (frontend), and WebSockets (STOMP over SockJS). The database is **MySQL (local, not containerized)**.

---

## Current Phase: Phase 1 — Backend CRUD + Auth (Not Started)

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 0 — Project Setup | ✅ Complete | Skeleton project, folder structure, DB setup |
| Phase 1 — Backend CRUD + Auth | ⬜ Not Started | Entities, REST APIs, JWT auth, authorization |
| Phase 2 — Frontend CRUD + DnD | ⬜ Not Started | React UI, Axios, drag-and-drop, route guards |
| Phase 3 — WebSocket Card Sync | ⬜ Not Started | STOMP integration, live card moves |
| Phase 4 — Presence + Editing | ⬜ Not Started | Heartbeat, online/offline, soft-lock indicators |
| Phase 5 — Comments + Notifications | ⬜ Not Started | Live comments, typing indicators, notifications |
| Phase 6 — Activity + Hardening | ⬜ Not Started | Activity feed, permission audit, concurrency polish |
| Phase 7 — Docker + Tests + Deploy | ⬜ Not Started | Dockerfiles, testing, deployment, final docs |

**Status Legend:** ⬜ Not Started | 🔨 In Progress | ✅ Complete | ⏸️ Paused

---

## Tech Stack (Confirmed)

### Backend
- **Framework:** Spring Boot
- **Security:** Spring Security + JWT (access + refresh tokens)
- **Real-Time:** Spring WebSocket + STOMP broker
- **ORM:** Spring Data JPA
- **Database:** MySQL (local installation, NOT Docker)
- **Build Tool:** Maven (pom.xml)

### Frontend
- **Framework:** React
- **Routing:** React Router
- **Styling:** Tailwind CSS
- **Drag & Drop:** React DnD
- **Real-Time Client:** SockJS + STOMP.js
- **HTTP Client:** Axios

### Infrastructure
- **Database:** MySQL running locally as a Windows service
- **Docker:** Optional — for backend/frontend containerization only (NOT for database)
- **Dev Workflow:** `mvn spring-boot:run` (or `./gradlew bootRun`) + `npm run dev`

---

## What Exists So Far

### Project Documentation (Complete)
- [x] **README.md** — Project overview, features, tech stack
- [x] **SyncBoard-PRD.md** — Full Product Requirements Document (22 sections, 600+ lines)
- [x] **Architecture.md** — System architecture, folder structures, data flows, tech stack
- [x] **Phases.md** — 8-phase development plan with checklists
- [x] **Rules.md** — Engineering rules, library guidance, error handling conventions
- [x] **PROGRESS.md** — This file (project status tracker)
- [x] **Design.md** — UI/UX design system, colors, typography, component specs
- [x] **.gitignore** — Ignore rules for Java, Node.js, IDE, environment files
- [x] **.env.example** — Environment variable template
- [x] **DATABASE.md** — MySQL setup guide and schema reference

### UI Reference Images (in docs/images/)
- [x] Board view, board config, board creation mockups
- [x] Activity feed, members list, settings page mockups

### Source Code
- [x] Backend project (Spring Boot) — Initialized (Maven)
- [x] Frontend project (React) — Initialized (Vite)
- [x] Database schema — MySQL database created

---

## Key Decisions Made

| # | Decision | Rationale | Date |
|---|----------|-----------|------|
| 1 | **MySQL (local) instead of PostgreSQL (Docker)** | Developer preference; avoids Docker dependency for database; MySQL runs as a local Windows service | 2026-07-18 |
| 2 | **Modular monolith, not microservices** | Single-server simplicity; demonstrates real-time correctness without distributed-systems overhead | Planning phase |
| 3 | **STOMP over SockJS, not raw WebSocket** | Topic-based pub/sub fits the board/card/presence subscription model naturally | Planning phase |
| 4 | **Optimistic concurrency + soft-lock (dual mechanism)** | Soft-lock reduces conflict frequency (UX); version check guarantees no silent overwrites (safety) | Planning phase |
| 5 | **Reconnect = full resync via REST** | Simpler and more robust than missed-event replay for this project's scale | Planning phase |
| 6 | **Feature-based folder organization (both stacks)** | Frontend features mirror backend modules for consistent mental model | Planning phase |

---

## Known Issues / Blockers

| # | Issue | Status | Notes |
|---|-------|--------|-------|
| — | None yet | — | Phase 0 completed. Ready to start Phase 1. |

---

## Recent Changes (Reverse Chronological)

### 2026-07-18
- Initialized Spring Boot backend project (`syncboard-backend`) with Maven
- Initialized React frontend project (`syncboard-frontend`) with Vite
- Created `syncboard` local MySQL database
- Changed configuration files preference from `.yml` to `.properties`
- Reorganized folder structure — moved all documentation into `docs/` directory
- Created PROGRESS.md (this file)
- Created Design.md, .gitignore, .env.example, DATABASE.md
- Updated all project documents (README.md, SyncBoard-PRD.md, Architecture.md, Phases.md) to replace PostgreSQL with local MySQL
- Completed deep project analysis

### 2026-07-18 (Initial)
- Repository created with planning documents
- PRD, Architecture, Phases, Rules, and README committed

---

## File Map (Quick Reference)

```
sync_board/
├── README.md                 — Project overview (stays at root for GitHub visibility)
├── .gitignore                — Git ignore rules
├── .env.example              — Environment variable template
└── docs/
    ├── PROGRESS.md           — THIS FILE (status tracker & AI context)
    ├── SyncBoard-PRD.md      — Full product requirements (THE reference doc)
    ├── Architecture.md       — System design, folder structures, data flows
    ├── Phases.md             — Phase-by-phase development checklist
    ├── Rules.md              — Engineering rules & conventions
    ├── Design.md             — UI/UX design system
    ├── DATABASE.md           — MySQL setup & schema reference
    ├── images/               — UI reference screenshots
    └── materials/            — Reference PDFs and analysis
```

---

## For AI Assistants: Context Loading Priority

When starting a new chat session about this project, read files in this order:

1. **docs/PROGRESS.md** (this file) — current status, what exists, recent changes
2. **docs/Phases.md** — what phase we're in, what tasks remain
3. **docs/Architecture.md** — how the system is structured (read the relevant sections)
4. **docs/Rules.md** — engineering conventions to follow
5. **docs/SyncBoard-PRD.md** — detailed specs (reference as needed, don't need to read all 600 lines upfront)
6. **docs/Design.md** — UI/UX decisions (read when working on frontend)
7. **docs/DATABASE.md** — schema details (read when working on backend/DB)

---

*Update this file after every significant implementation milestone. Keep it honest — an AI reading a stale PROGRESS.md is worse than having none at all.*
