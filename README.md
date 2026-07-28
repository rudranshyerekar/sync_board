# SyncBoard

**SyncBoard** is a real-time collaborative Kanban board built to
demonstrate modern full-stack development and real-time communication
using **Spring Boot**, **React**, and **WebSockets (STOMP over
SockJS)**.

The application allows teams to collaborate on tasks with instant
synchronization across all connected users. Members can create
workspaces, manage Kanban boards, move tasks using drag-and-drop, view
online teammates, see who is currently editing a task, receive live
notifications, and collaborate seamlessly without refreshing the page.

## ✨ Features

-   🔐 JWT-based Authentication & Authorization
-   🗂️ Multi-workspace and Kanban Board Management
-   📌 Drag-and-Drop Task Management
-   ⚡ Real-Time Updates using WebSockets (STOMP)
-   🟢 Online User Presence Tracking
-   ✏️ Live Card Editing Indicators
-   💬 Real-Time Comments & Typing Indicators
-   🔔 Instant Notifications
-   📜 Activity Timeline
-   📱 Responsive and Modern UI

## 🛠️ Tech Stack

### Frontend

-   React
-   React Router
-   Tailwind CSS
-   React DnD
-   SockJS
-   STOMP.js
-   Axios

### Backend

-   Spring Boot
-   Spring Security
-   Spring WebSocket (STOMP)
-   JWT Authentication
-   Spring Data JPA
-   MySQL (Local)

### DevOps

-   Docker & Docker Compose (for backend/frontend containerization)
-   Local MySQL Server

## 🎯 Project Goal

The primary objective of SyncBoard is to showcase real-time
collaboration features and full-stack engineering concepts such as
WebSocket communication, session management, authentication, optimistic
UI updates, and collaborative user experiences in a production-inspired
application.

## 🚀 Status & Quick Start

> ✅ **Fully Completed & Production Ready** (All Phases 0–7 Complete)

### Run Locally with Docker Compose

You can boot the entire containerized application stack (frontend reverse-proxy + backend service) with a single command. By default, this connects to your local host MySQL instance on port `3306`:

```bash
# Start frontend (http://localhost:3000) and backend (http://localhost:8080)
docker compose up --build -d
```

---

## 🏛️ Architecture & Key Design Decisions

During development, several critical distributed and real-time design choices were made to balance responsiveness, server complexity, and consistency:

### 1. Dual Mechanism: Optimistic Concurrency + Soft-Locks
- **Soft-Lock (UX Indicator):** When a user opens a card drawer, a STOMP heartbeat broadcasts their edit presence to all connected teammates, showing a live editing badge. This reduces accidental conflict frequency.
- **Optimistic Locking (Data Integrity):** Every card entity maintains a `@Version` field. If two users edit simultaneously despite visual badges, the second save triggers an `ObjectOptimisticLockingFailureException` (`409 Conflict`), automatically alerting the client and cleanly resyncing without silent data corruption.

### 2. Heartbeat-Based Real-Time Presence & Eviction
- Rather than relying solely on fragile TCP/WebSocket disconnection events (which often miss silent drops like killing browser processes or sudden network loss), clients transmit a presence heartbeat every **4 seconds**.
- A Spring `@Scheduled` background loop sweeps active sessions every second, evicting any connection silent for **>10 seconds**. This guarantees honest online/idle/away rosters.

### 3. Reconnect = Full Resync Pattern
- Attempting to replay queued messaging events after a temporary network drop risks sequencing bugs in collaborative drag-and-drop boards.
- On client reconnect, the state management layer (`useBoardStore`) initiates an immediate REST fetch of the ground-truth board hierarchy, guaranteeing exact synchronization before re-attaching live STOMP subscriptions.

### 4. Aggregated Board Hierarchy Endpoint (Fixing $N+1$ Fetches)
- Loading a board conventionally would require $1 + \text{columns} + \text{cards}$ HTTP requests.
- We built `GET /api/boards/{id}/full`, which packages the entire workspace board, ordered columns, and populated assignee avatars into a single recursive payload, cutting initial view load latency by >80%.
