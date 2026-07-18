# SyncBoard — Architecture.md
### System Architecture, Application Flow, Folder Structure & Tech Stack

**Companion to:** SyncBoard-PRD.md
**Purpose:** The technical blueprint you open while actually building — how the system is organized, how data flows through it, and where every file belongs.

---

## Table of Contents

1. Architectural Overview
2. Layered Backend Architecture
3. Frontend Architecture
4. Backend Folder & File Structure
5. Frontend Folder & File Structure
6. Data Flow: REST Request Lifecycle
7. Data Flow: WebSocket/STOMP Lifecycle
8. Configuration & Environment Structure
9. Tech Stack Reference Table
10. Infrastructure & Docker Layout

---

## 1. Architectural Overview

SyncBoard is a **modular monolith**: one Spring Boot process, one React SPA, one MySQL instance. Modularity is achieved by strict package boundaries inside the monolith, not by splitting into network services.

Think of the system as three concentric layers:

- **Edge layer** — what the client actually talks to: REST controllers and the STOMP WebSocket endpoint.
- **Domain layer** — services that hold business rules (concurrency checks, permission checks, notification generation).
- **Persistence layer** — repositories and entities backed by MySQL.

A request enters through the edge layer, is authorized and processed in the domain layer, is persisted, and — for anything real-time — triggers a broadcast back out through the edge layer to every relevant subscriber, including the original caller.

---

## 2. Layered Backend Architecture

### 2.1 Layers, Top to Bottom

1. **Controller layer** — REST controllers. Responsible only for: parsing the request, checking authentication context, delegating to a service, and shaping the response. No business logic lives here.
2. **STOMP message-handling layer** — analogous to controllers but for WebSocket messages. Same rule: delegate to services, don't embed logic.
3. **Service layer** — owns all business rules: optimistic concurrency checks, permission checks, notification-triggering logic, presence state transitions. This is the only layer allowed to coordinate across multiple repositories/modules.
4. **Repository layer** — pure data access via Spring Data JPA. No business logic, no broadcasting, just persistence.
5. **Broadcast/messaging layer** — a thin utility layer services call into when they need to publish a canonical event to a topic. Keeping this separate from the service layer's business logic means you can unit test business rules without needing a live WebSocket session.

### 2.2 Module Boundaries

Each domain module (`auth`, `workspace`, `board`, `card`, `presence`, `notification`, `activity`) should be internally cohesive and only expose itself to other modules through its service interface — never let one module's controller reach directly into another module's repository. This is what keeps a monolith from silently turning into a tangle of cross-cutting dependencies that's harder to reason about than actual microservices would have been.

### 2.3 Cross-Cutting Concerns

- **Security** lives in its own package, providing a JWT filter that runs before controllers, plus a shared authentication-context accessor services can use to check "who is the current user" and "what is their role in this workspace."
- **Exception handling** is centralized (a single global exception handler) so every module returns errors in the same shape rather than each controller inventing its own error format.
- **Presence/session registry** is a cross-cutting component that tracks which users are connected via which STOMP sessions — it's used by the presence module but conceptually sits alongside security as connection-level infrastructure.

---

## 3. Frontend Architecture

### 3.1 Feature-Based Organization

Rather than organizing by technical type (all reducers together, all components together), organize primarily by **feature** (auth, workspace, board, presence, notifications, activity), with a small shared layer for truly cross-feature building blocks (buttons, inputs, layout shell). This keeps everything related to "how a card move works" in one place instead of scattered across five type-based folders.

### 3.2 State Management Philosophy

- **Server state** (boards, cards, comments, notifications) is the canonical truth and should always be reconciled against WebSocket broadcasts — treat local state as a cache that WebSocket events invalidate/update, not as independently authoritative.
- **Ephemeral/UI state** (which drawer is open, current drag position, typing indicator timers) can live in local component state or a lightweight global store — it never needs to survive a refresh and never needs to be persisted.
- **Optimistic updates** are applied to server-state as a temporary local overlay, then reconciled (confirmed or rolled back) once the canonical broadcast arrives — this pattern should be implemented once, generically, and reused across every optimistic action (card move, comment post, etc.) rather than reinvented per feature.

### 3.3 The WebSocket Layer as Its Own Concern

The WebSocket connection, topic subscription management, and message dispatching should be isolated into their own layer — not scattered inside individual components. A component should be able to say "give me live updates for board X" without knowing anything about STOMP, SockJS, or reconnection logic. This separation is what makes reconnect-and-resync implementable in one place instead of patched into every feature separately.

### 3.4 Routing Structure

Top-level routes: Login, Register, Dashboard, Workspace view, Board view (with the Card Detail Drawer as an overlay/modal route rather than a full navigation, to preserve board context), Profile/Settings. Route guards should redirect unauthenticated users to Login and should re-validate the access token's freshness before entering protected routes.

---

## 4. Backend Folder & File Structure

```
syncboard-backend/
├── src/main/java/com/syncboard/
│   ├── SyncBoardApplication.java        (entry point)
│   │
│   ├── config/
│   │   ├── SecurityConfig                (Spring Security filter chain, JWT filter registration)
│   │   ├── WebSocketConfig               (STOMP endpoint registration, broker config)
│   │   ├── CorsConfig
│   │   └── OpenApiConfig                 (optional — API documentation)
│   │
│   ├── security/
│   │   ├── JwtTokenProvider              (issue/validate/parse tokens)
│   │   ├── JwtAuthenticationFilter
│   │   ├── RefreshTokenService
│   │   └── SecurityContextHelper         (get current authenticated user)
│   │
│   ├── auth/
│   │   ├── controller/ AuthController
│   │   ├── service/ AuthService
│   │   └── dto/ RegisterRequest, LoginRequest, AuthResponse
│   │
│   ├── user/
│   │   ├── entity/ User
│   │   ├── repository/ UserRepository
│   │   └── service/ UserService
│   │
│   ├── workspace/
│   │   ├── entity/ Workspace, WorkspaceMember
│   │   ├── repository/
│   │   ├── controller/ WorkspaceController
│   │   ├── service/ WorkspaceService
│   │   └── dto/
│   │
│   ├── board/
│   │   ├── entity/ Board, Column
│   │   ├── repository/
│   │   ├── controller/ BoardController
│   │   ├── service/ BoardService
│   │   └── dto/
│   │
│   ├── card/
│   │   ├── entity/ Card
│   │   ├── repository/ CardRepository
│   │   ├── controller/ CardController
│   │   ├── messaging/ CardSocketHandler   (STOMP message handling for moves)
│   │   ├── service/ CardService           (owns optimistic concurrency logic)
│   │   └── dto/
│   │
│   ├── comment/
│   │   ├── entity/ Comment
│   │   ├── repository/
│   │   ├── controller/
│   │   ├── messaging/                     (typing indicator handling)
│   │   ├── service/
│   │   └── dto/
│   │
│   ├── presence/
│   │   ├── service/ PresenceService        (online/idle/away/offline state machine)
│   │   ├── SessionRegistry                 (tracks connected sessions + heartbeat timestamps)
│   │   └── messaging/ PresenceSocketHandler
│   │
│   ├── notification/
│   │   ├── entity/ Notification
│   │   ├── repository/
│   │   ├── controller/
│   │   ├── service/ NotificationService    (triggered by other services, not directly by clients)
│   │   └── dto/
│   │
│   ├── activity/
│   │   ├── entity/ Activity
│   │   ├── repository/
│   │   ├── controller/
│   │   └── service/ ActivityService        (append-only log writer)
│   │
│   └── common/
│       ├── exception/ (GlobalExceptionHandler, custom exception types)
│       ├── response/ (standard API response wrapper)
│       └── util/ (position-recalculation helper, mapper utilities)
│
├── src/main/resources/
│   ├── application.properties
│   ├── application-local.properties
│   └── application-prod.properties
│
├── src/test/java/com/syncboard/            (mirrors main structure, per module)
│
├── Dockerfile
└── pom.xml (or build.gradle)
```

**Why this shape:** every module owns its entity, repository, service, controller/messaging, and DTOs together, so opening one folder gives you the full story of that feature. `common/` and `security/` exist specifically because they're used *by* every module rather than belonging to any one of them.

---

## 5. Frontend Folder & File Structure

```
syncboard-frontend/
├── src/
│   ├── main entry (app bootstrap, router setup, global providers)
│   │
│   ├── app/
│   │   ├── router (route definitions, protected-route guard)
│   │   └── providers (auth context, theme context, websocket context)
│   │
│   ├── api/
│   │   ├── httpClient (Axios instance, request/response interceptors for JWT + refresh)
│   │   ├── authApi
│   │   ├── workspaceApi
│   │   ├── boardApi
│   │   ├── cardApi
│   │   ├── commentApi
│   │   └── notificationApi
│   │
│   ├── websocket/
│   │   ├── socketClient (SockJS + STOMP connection setup, connect/disconnect/reconnect logic)
│   │   ├── topicSubscriptions (helpers for subscribing/unsubscribing to board/card/presence/personal topics)
│   │   └── eventDispatcher (routes incoming broadcasts to the right feature's state update)
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   ├── components (LoginForm, RegisterForm)
│   │   │   ├── hooks
│   │   │   └── state
│   │   │
│   │   ├── workspace/
│   │   │   ├── components (WorkspaceList, MemberList, InviteModal)
│   │   │   ├── hooks
│   │   │   └── state
│   │   │
│   │   ├── board/
│   │   │   ├── components (BoardHeader, ColumnList, Column, CardItem)
│   │   │   ├── dnd (drag-and-drop wiring specific to the board)
│   │   │   ├── hooks (useBoardSync, useOptimisticCardMove)
│   │   │   └── state
│   │   │
│   │   ├── cardDetail/
│   │   │   ├── components (CardDrawer, CommentThread, TypingIndicator, EditingBanner)
│   │   │   ├── hooks
│   │   │   └── state
│   │   │
│   │   ├── presence/
│   │   │   ├── components (PresenceList, AvatarStatusDot)
│   │   │   └── hooks (useHeartbeat)
│   │   │
│   │   ├── notifications/
│   │   │   ├── components (NotificationBell, NotificationPanel)
│   │   │   └── state
│   │   │
│   │   └── activity/
│   │       └── components (ActivityFeed)
│   │
│   ├── components/                          (shared, feature-agnostic UI primitives)
│   │   ├── Button, Input, Modal, Drawer, Avatar, Badge, Toast, Tooltip
│   │
│   ├── hooks/                                (shared hooks not tied to one feature)
│   │   └── useDebounce, useClickOutside, useInterval
│   │
│   ├── styles/
│   │   ├── tokens (color, spacing, typography variables — see Design.md)
│   │   └── global styles
│   │
│   └── utils/
│       └── formatters, validators, constants
│
├── public/
├── index.html
├── tailwind.config
└── package.json
```

**Why this shape:** `features/` mirrors the backend's module boundaries almost one-to-one, which keeps the mental model consistent across the stack — if you're working on "card editing," you touch `card/` on the backend and `cardDetail/` on the frontend, and nowhere else.

---

## 6. Data Flow: REST Request Lifecycle

Applies to anything that doesn't need sub-second propagation (e.g., creating a workspace, renaming a board):

1. Client's Axios instance attaches the current access token to the request header.
2. Request hits the Controller, which delegates immediately to the Service layer.
3. Service layer checks authorization (is this user allowed to do this, in this workspace), applies business rules, and calls the Repository to persist.
4. If the change is one other clients should know about, the Service layer also calls the broadcast utility to publish a canonical event to the relevant topic.
5. Controller returns a response to the original caller; other connected clients receive the broadcast independently over their WebSocket connection.

---

## 7. Data Flow: WebSocket/STOMP Lifecycle

Applies to card moves, comments, typing indicators, presence, and editing indicators:

1. On login, the client opens a single SockJS/STOMP connection, authenticating the handshake with the access token.
2. The client subscribes to: its personal notification topic, the presence topic, and (once a board is opened) that board's topic and relevant card topics.
3. When the user performs an action (drag a card, type a comment), the client sends a STOMP message to the appropriate destination.
4. A message-handling component on the backend receives it, delegates to the Service layer exactly as a REST controller would (same business rules, same persistence path for durable events — no persistence for ephemeral ones).
5. The Service layer publishes the canonical event back out to the topic; every subscriber (including the sender) receives it and reconciles local state against it.
6. A background heartbeat mechanism runs continuously in parallel, independent of any specific user action, to maintain accurate presence state.

---

## 8. Configuration & Environment Structure

- **`application-local.properties`** — local MySQL database URL, permissive CORS for local frontend dev server, verbose logging.
- **`application-prod.properties`** — production database URL (via environment variable, never hardcoded), strict CORS limited to the deployed frontend origin, JWT secret sourced from environment/secret manager, reduced logging verbosity.
- **Frontend environment config** — API base URL and WebSocket URL should be environment-driven, not hardcoded, so the same build can point at local vs. deployed backends.
- **Secrets** (JWT signing secret, database credentials) never committed to source control — sourced from environment variables or a secrets manager, with only placeholder/example values in any checked-in config template.

---

## 9. Tech Stack Reference Table

| Layer | Technology | Notes |
|---|---|---|
| Frontend framework | React + React Router | |
| Styling | Tailwind CSS | Utility-first, pairs well with design tokens (see Design.md) |
| Drag & drop | React DnD | |
| Real-time client | SockJS + STOMP.js | |
| HTTP client | Axios | Interceptor-based token attachment and refresh |
| Backend framework | Spring Boot | |
| Security | Spring Security + JWT | Stateless REST auth, authenticated WebSocket handshake |
| Real-time server | Spring WebSocket + STOMP broker | |
| ORM | Spring Data JPA | |
| Database | MySQL (Local) | |
| Containerization | Docker + Docker Compose | |
| API documentation (optional) | springdoc-openapi | Auto-generates interactive API docs from controllers |

---

## 10. Infrastructure & Docker Layout

A `docker-compose.yml` at the repository root can optionally define two services for containerized deployment:

- **`backend`** — builds from the backend's Dockerfile, connects to the host machine's local MySQL instance (via `host.docker.internal` or the host's network IP), reads its database URL and JWT secret from environment variables defined in the compose file (or an `.env` file it references).
- **`frontend`** — either served as static build output through a lightweight web server, or run via its dev server during local development, pointed at the backend's exposed port.

Note: MySQL runs locally on the host as a native service, not inside a Docker container. For local development, running both the backend (`mvn spring-boot:run`) and frontend (`npm run dev`) directly is typically simpler than using Docker Compose.

Keep the Dockerfiles minimal and single-purpose — one for the backend, one for the frontend — rather than trying to build a single combined image, so each layer can be rebuilt independently as you iterate.

---

*End of Architecture.md — pairs with SyncBoard-PRD.md for "what to build," and this document for "how it's organized."*
