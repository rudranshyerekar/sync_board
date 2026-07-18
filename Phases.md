# SyncBoard — Phases.md
### Detailed Phase-by-Phase Development Plan

**Companion to:** SyncBoard-PRD.md, Architecture.md, Rules.md
**Purpose:** A granular, checklist-driven build order. Each phase produces something demonstrable before you move to the next — never leave a long stretch with nothing working end-to-end.

---

## How to Use This Document

Each phase below includes: its goal, a task checklist, what "done" concretely looks like, and common pitfalls specific to that phase. Work through phases in order — later phases assume earlier ones are solid, especially Phase 3 onward, which builds directly on the data model and CRUD behavior established in Phases 1–2.

Suggested pacing assumes part-time/self-paced work; treat the durations as a rough compass, not a deadline.

---

## Phase 0 — Project Setup

**Goal:** A clean, running skeleton before any feature work begins.

**Tasks:**
- [ ] Initialize the backend project (Spring Boot, with Web, Security, WebSocket, Data JPA, and MySQL driver dependencies).
- [ ] Initialize the frontend project (React, React Router, Tailwind CSS configured).
- [ ] Set up the local MySQL instance (ensure the MySQL server is running, create the `syncboard` database with `utf8mb4` charset).
- [ ] Verify the backend can connect to the database and the frontend dev server can reach the backend (a simple health-check endpoint is enough).
- [ ] Establish the folder structure from Architecture.md for both projects, even with empty placeholder files.
- [ ] Set up environment/config files for local development (see Architecture.md §8).

**Done when:** you can run the backend, run the frontend, and hit a trivial "health" endpoint from the browser, with the database container up alongside.

**Pitfalls:** don't skip setting up the module folder structure early — retrofitting it after a few features exist is more disruptive than starting with it, even mostly empty.

---

## Phase 1 — Authentication, Workspace & Board CRUD (Backend Only)

**Goal:** Every core entity exists and is manageable via REST, verified without a frontend yet (a REST client or API docs UI is enough).

**Tasks:**
- [ ] Implement User entity, registration, and password hashing.
- [ ] Implement login issuing an access token and a refresh token.
- [ ] Implement the JWT authentication filter protecting all non-auth endpoints.
- [ ] Implement refresh-token exchange and logout (token revocation).
- [ ] Implement Workspace and WorkspaceMember entities; creating a workspace auto-assigns the creator as Owner.
- [ ] Implement invite/add-member and role-assignment endpoints, enforcing Owner/Admin-only access.
- [ ] Implement Board, Column, and Card entities with full CRUD endpoints, scoped correctly to their parent workspace/board.
- [ ] Implement the global exception handler and consistent error response shape (see Rules.md §7).
- [ ] Add the `version` field to Card and wire a basic optimistic-lock check on update (full soft-lock/editing UX comes later — the version mechanism itself should exist now).

**Done when:** using only REST calls, you can register two users, have one create a workspace and invite the other, and both can create boards, columns, and cards within it — with unauthorized actions (e.g., a Member trying to delete a board) correctly rejected.

**Pitfalls:** don't defer authorization checks to "later" — bolting them on after CRUD already works tends to leave gaps. Build the permission check into each endpoint from the start, even if roles are simple at this stage.

---

## Phase 2 — Frontend CRUD & Drag-and-Drop (Single-User, No Real-Time Yet)

**Goal:** A fully working single-user board experience, entirely over REST, before any WebSocket complexity is introduced.

**Tasks:**
- [ ] Build Login/Register pages and the Axios interceptor for token attachment + silent refresh.
- [ ] Build the Dashboard, Workspace view, and Board view, all fetching from the Phase 1 REST APIs.
- [ ] Build the Card Detail Drawer showing full card fields (no comments/live features yet).
- [ ] Wire up React DnD for card movement between columns, persisting the move via REST on drop.
- [ ] Implement the position-recalculation approach for reordering (see PRD §8.3) and verify it holds up under repeated reordering without needing to rewrite every sibling's position.
- [ ] Implement route guards so unauthenticated access redirects to Login.

**Done when:** a single logged-in user can fully manage a board — create/edit/delete cards, drag them between columns, reorder within a column — and refreshing the page always reflects the true current state.

**Pitfalls:** resist the temptation to "just add the WebSocket now since you're already touching this component" — a genuinely solid single-user experience makes every subsequent real-time bug far easier to isolate, because you'll know it's not a plain CRUD bug.

---

## Phase 3 — WebSocket/STOMP Integration for Live Card Sync

**Goal:** The first true real-time milestone — two browser sessions see card moves live, without refreshing.

**Tasks:**
- [ ] Set up the STOMP endpoint and broker configuration on the backend, with the WebSocket handshake authenticated via the access token.
- [ ] Build the frontend WebSocket layer (connection, subscription management, dispatcher) as its own module, not embedded in board components.
- [ ] Route card moves through STOMP (client sends the move, server validates/persists/broadcasts) rather than plain REST, or dual-path it deliberately if you choose that design (see PRD §12).
- [ ] Implement the optimistic-update pattern on the frontend generically: apply locally, send, reconcile on the broadcast.
- [ ] Implement the "reconnect = full resync" behavior: on reconnect, re-fetch the board's current state via REST rather than trying to replay missed events.

**Done when:** with two browser windows open on the same board (e.g., a normal window and an incognito window as two different users), dragging a card in one instantly moves it in the other, with no manual refresh — and disconnecting/reconnecting one window correctly resyncs it.

**Pitfalls:** this is usually the phase where "it works on my machine with one tab" bugs show up — always test with two real, separate sessions, not just one tab believing its own optimistic update.

---

## Phase 4 — Presence, Heartbeat & Editing Indicators

**Goal:** The board feels populated and honest about who's around and who's touching what.

**Tasks:**
- [ ] Implement the session registry tracking connected users and their last-heartbeat timestamp.
- [ ] Implement the client-side heartbeat (periodic ping) and the server-side timeout check that marks a user Offline if a heartbeat is missed.
- [ ] Broadcast presence changes (online/idle/away/offline) to the presence topic and render the live presence list in the UI.
- [ ] Implement Idle/Away transitions based on client-side input inactivity.
- [ ] Implement "currently editing" broadcast when a card detail drawer opens, and the corresponding banner on other clients viewing the same card.
- [ ] Tie the editing indicator's lifetime to the same liveness mechanism as presence, so it clears automatically if the editor's connection goes stale (see Rules.md §9 and PRD §16).
- [ ] Verify the full optimistic-concurrency conflict flow end-to-end (PRD §10.5): two users editing the same card, one saves first, the second gets a clear rejection with the current state.

**Done when:** closing a browser tab without a clean disconnect (e.g., killing the browser process, or using dev tools to simulate an offline network) still results in that user showing as Offline within your defined grace period on other clients — and two simultaneous edits to the same card never silently overwrite each other.

**Pitfalls:** don't rely solely on the WebSocket's disconnect event for offline detection — deliberately test the "silent drop" scenario (dev tools → offline, or force-quitting the browser), since that's the realistic failure mode a demo or interviewer is likely to probe.

---

## Phase 5 — Comments, Typing Indicators & Notifications

**Goal:** The card detail experience feels alive, and users learn about relevant events without staring at the board.

**Tasks:**
- [ ] Implement Comment entity, posting, and fetching, with live broadcast to everyone viewing that card.
- [ ] Implement mention parsing in comments (referencing another workspace member).
- [ ] Implement the typing-indicator ephemeral event: client sends while focused/typing, server broadcasts, other clients show a transient indicator that auto-clears after a short timeout.
- [ ] Implement the Notification entity and service, triggered server-side by other services (assignment, mention, completion) — never created directly by a raw client request.
- [ ] Implement live delivery of notifications to a connected user's personal topic, plus persistence so offline users see them on next login.
- [ ] Build the Notification Bell/Panel UI with unread counts and mark-as-read.

**Done when:** posting a comment appears live for everyone viewing that card; typing shows and then correctly disappears if you stop typing (and also if you abruptly close the tab); assigning a card or mentioning someone generates a notification that appears live if they're connected, and is waiting for them if they're not.

**Pitfalls:** don't let notification-creation logic leak into controllers or into unrelated services directly touching the Notification repository — route it through NotificationService so all notification-triggering stays centralized and easy to reason about (see Rules.md §2, §8).

---

## Phase 6 — Activity Log, Permissions Hardening & Concurrency Polish

**Goal:** The system feels complete, auditable, and safe under real concurrent use — not just functional in a happy-path demo.

**Tasks:**
- [ ] Implement the Activity entity and ensure every durable state-changing action (card moved, created, deleted; comment added; member joined; priority changed) generates a readable activity entry.
- [ ] Build the Activity Feed UI, paginated, readable as a human-facing log rather than raw event data.
- [ ] Re-audit every endpoint and STOMP handler against the Pre-Merge Self-Checklist in Rules.md §12 — especially authorization scoping and version checks.
- [ ] Improve the conflict-resolution UX for optimistic concurrency rejections (e.g., a clearer "someone else changed this — here's what changed" message rather than a generic error).
- [ ] Stress-test with rapid repeated actions (fast repeated drags, rapid comment posting) to confirm ordering and correctness hold up.
- [ ] Confirm role enforcement (Owner/Admin/Member) is checked server-side for every relevant action, not just hidden in the UI.

**Done when:** you can hand the app to someone else, have them deliberately try to break it (rapid actions, simultaneous edits, removing a member mid-session), and the system degrades gracefully rather than corrupting state or crashing.

**Pitfalls:** this phase is easy to under-invest in because nothing "new" is visibly being built — but it's often the difference between a project that merely demos well and one that holds up under real scrutiny (e.g., in a technical interview where someone actively tries to break it).

---

## Phase 7 — Dockerization, Testing, Deployment & Documentation

**Goal:** A polished, shippable, explainable project.

**Tasks:**
- [ ] Write Dockerfiles for backend and frontend, and optionally a `docker-compose.yml` for containerized deployment (the MySQL database runs locally on the host, not in Docker).
- [ ] Verify the entire stack starts from a single `docker compose up` on a clean machine/environment.
- [ ] Write backend unit tests for the highest-risk logic: optimistic concurrency checks, position recalculation, permission checks.
- [ ] Write at least a handful of WebSocket/STOMP integration tests simulating two connected clients.
- [ ] Set up production-profile configuration (env-driven secrets, restricted CORS).
- [ ] Deploy to a single-instance host of your choice.
- [ ] Write a README covering: what the project is, the architecture at a glance, how to run it locally, and a short "design decisions" section (soft-lock vs. optimistic concurrency, heartbeat-based presence, reconnect-and-resync) that doubles as interview talking points.

**Done when:** a stranger could clone the repository, run one command, and have a working local instance — and could read the README and understand not just what the app does, but why it's built the way it is.

**Pitfalls:** don't let documentation become an afterthought written in the last hour — the "design decisions" section is genuinely one of the most valuable artifacts of this whole project for portfolio purposes, since it's what turns a working app into a demonstrated understanding of real-time systems.

---

## Phase Summary Table

| Phase | Focus | Key Milestone |
|---|---|---|
| 0 | Project setup | Skeleton runs end-to-end |
| 1 | Backend CRUD + auth | All entities manageable via REST, with authz |
| 2 | Frontend CRUD + DnD | Solid single-user board experience |
| 3 | WebSocket card sync | Two sessions see moves live |
| 4 | Presence + editing indicators | Honest online/offline + soft-lock, tested against silent drops |
| 5 | Comments + typing + notifications | Card detail feels alive; notifications work live and offline |
| 6 | Activity log + hardening | Auditable, authorization-tight, concurrency-safe under stress |
| 7 | Docker + tests + deploy + docs | Shippable, explainable, portfolio-ready |

---

*End of Phases.md — work top to bottom; don't start a phase's real-time work until the prior phase's data/authorization foundation is solid.*
