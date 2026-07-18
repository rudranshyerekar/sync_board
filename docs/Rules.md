# SyncBoard — Rules.md
### Engineering Rules, Library Guidance, Error Handling & Boundaries

**Companion to:** SyncBoard-PRD.md, Architecture.md
**Purpose:** The rulebook you check yourself against during code review — what's encouraged, what's forbidden, and where the hard lines are.

---

## Table of Contents

1. Guiding Principles (Recap)
2. Backend: Do's
3. Backend: Don'ts
4. Frontend: Do's
5. Frontend: Don'ts
6. Library Guidance
7. Error Handling Conventions
8. Module & Security Boundaries
9. Real-Time Event Boundaries (Ephemeral vs. Durable)
10. Naming Conventions
11. Git & Commit Practices
12. Pre-Merge Self-Checklist

---

## 1. Guiding Principles (Recap)

Every rule below exists in service of these four ideas — when in doubt, resolve ambiguity by asking which of these it protects:

- **The server is the single source of truth.** Clients never assume their local state is correct; they always reconcile against a broadcast or a fetched response.
- **Soft-lock, never hard-lock.** Never architect a feature that fully blocks a second user from acting — make state visible instead of restricting it, and rely on optimistic concurrency for actual conflict safety.
- **Ephemeral state is never persisted.** Typing indicators, "currently viewing," and heartbeat pings live only in memory and in the broadcast — never in the database.
- **Single-server first.** Don't reach for distributed-systems tooling (message brokers, multi-instance coordination) to solve a problem that a well-designed single instance already solves.

---

## 2. Backend: Do's

- **Do** put all business logic in the service layer. Controllers and STOMP message handlers should be thin — parse, delegate, respond.
- **Do** use DTOs for every request and response body. Never serialize a JPA entity directly to JSON — entities should stay inside the persistence layer.
- **Do** use constructor injection for dependencies, not field injection — it makes dependencies explicit and testable.
- **Do** validate every incoming request payload (required fields, length limits, valid enum values) before it reaches business logic.
- **Do** check authorization (is this user a member of this workspace, does their role permit this action) inside the service layer, every time — never assume the frontend already gatekept it.
- **Do** use a version field and an explicit optimistic-lock check on every card update, including moves.
- **Do** centralize exception handling in one global handler that maps exceptions to a consistent response shape.
- **Do** use enums for fixed sets of values (roles, presence status, notification type) rather than raw strings.
- **Do** paginate any endpoint that returns a potentially unbounded list (activity feed, notifications).
- **Do** write the broadcast call as the last step of a service method, after the database transaction has successfully committed — never broadcast an event for a write that might still roll back.
- **Do** log meaningful business events (login, workspace creation, card move) at an appropriate level — but never log passwords, tokens, or full request bodies containing sensitive data.

---

## 3. Backend: Don'ts

- **Don't** put any business logic in a controller or STOMP handler — if you find yourself writing an `if` statement that isn't about parsing input, move it to a service.
- **Don't** expose JPA entities directly as API responses — always map to a DTO, even when it feels like duplication.
- **Don't** trust a client-supplied version number blindly — always compare it against the current database value before accepting a write.
- **Don't** persist ephemeral events (typing, presence pings, "currently editing") to the database. If you catch yourself adding a table for this, stop and reconsider.
- **Don't** hardcode secrets (JWT signing key, DB credentials) anywhere in source — always read from environment/config, and never commit real values.
- **Don't** let one module's controller or service directly query another module's repository — go through that module's service interface instead.
- **Don't** use raw JDBC or hand-rolled SQL string concatenation — use Spring Data JPA (or, if truly necessary, parameterized queries only) to avoid injection risk and keep persistence consistent.
- **Don't** implement your own password hashing scheme — use a well-established library-provided algorithm (bcrypt/argon2-family) via Spring Security's provided encoders.
- **Don't** allow an unauthenticated WebSocket connection to subscribe to any topic — authenticate the handshake exactly as strictly as a REST request.
- **Don't** introduce a message broker (Kafka, RabbitMQ) or split into microservices "just in case" — this project's entire value is in solving real-time correctness on a single, well-modeled server.

---

## 4. Frontend: Do's

- **Do** treat every piece of server-derived state (boards, cards, comments, notifications) as something only a fetch or a broadcast can update — never mutate it directly from a local action without also sending the corresponding request.
- **Do** implement optimistic updates as a single, reusable pattern (apply locally → send request → reconcile on broadcast/response) and reuse it across features rather than writing bespoke optimistic logic per component.
- **Do** isolate all WebSocket connection, subscription, and reconnection logic into a dedicated layer that features consume through a simple interface.
- **Do** show a clear, human-readable message when an optimistic action gets rejected by the server (e.g., a stale card version) — never fail silently.
- **Do** debounce or throttle high-frequency ephemeral events (typing indicators) client-side before sending them, to avoid flooding the socket.
- **Do** clear "currently editing" and "typing" indicators automatically after a short timeout on the receiving end, not only when an explicit "stopped" event arrives — connections can drop without a clean signal.
- **Do** keep route guards strict: an expired or missing access token should redirect to login before a protected page ever renders, not after a failed API call.
- **Do** use a centralized Axios interceptor for attaching tokens and silently retrying once via the refresh token on a 401 — implement this once, not per API call.

---

## 5. Frontend: Don'ts

- **Don't** poll the REST API on an interval as a substitute for WebSocket updates — if a piece of data needs to feel live, it belongs on a topic, not a polling timer.
- **Don't** store the access token in `localStorage` if you can avoid it — prefer in-memory storage (lost on hard refresh, refreshed via the refresh-token flow) to reduce XSS exposure; if you do use persistent storage, understand the trade-off explicitly rather than defaulting to it out of convenience.
- **Don't** assume a WebSocket message always arrives — build the "reconnect = full resync" behavior in from the start rather than trying to patch in missed-event recovery later.
- **Don't** let every component open its own WebSocket connection — one connection per client session, shared across features via the WebSocket layer.
- **Don't** hardcode the API base URL or WebSocket URL — read from environment configuration so the same build works locally and once deployed.
- **Don't** render raw, unsanitized comment content directly into the DOM — treat all user-generated text as untrusted.
- **Don't** silently swallow a rejected optimistic update — always resolve it into a visible state (rollback + message), even if the UX is simple.

---

## 6. Library Guidance

### Recommended

| Purpose | Library | Why |
|---|---|---|
| JWT issuing/validation | A maintained Spring-Security-compatible JWT library | Avoids hand-rolling token signing/parsing, which is easy to get subtly wrong |
| Password hashing | Spring Security's built-in `PasswordEncoder` (bcrypt) | Battle-tested, no custom crypto |
| Object mapping (entity ↔ DTO) | MapStruct (optional) or hand-written mappers | Keeps entity/DTO separation consistent without excessive boilerplate |
| API documentation | springdoc-openapi | Gives you an interactive API reference for free, useful both for development and for showing recruiters a polished artifact |
| Frontend real-time | SockJS + STOMP.js | Purpose-built for exactly this topic-based pub/sub pattern |
| Frontend drag-and-drop | React DnD | Handles drag state and reordering interactions cleanly |
| Frontend HTTP | Axios | Interceptor support is what makes centralized token handling clean |

### Use With Care

- **Lombok** — fine for reducing entity/DTO boilerplate, but don't let it hide business logic; it should only ever generate getters/setters/constructors, never behavior.
- **Global frontend state libraries** (Redux, Zustand, etc.) — useful once state sharing across many features gets unwieldy, but don't introduce one on day one "by default." Start with React's built-in state/context and reach for a dedicated store only when you feel real pain without one.

### Avoid

- **Kafka, RabbitMQ, or any message broker** — out of scope for this project's architecture; adds distributed-systems complexity that doesn't serve the learning goals.
- **A second, separate WebSocket library alongside STOMP** — pick one real-time transport pattern and use it everywhere; don't mix raw WebSocket handling with STOMP in different parts of the app.
- **Any browser storage (`localStorage`/`sessionStorage`) for anything other than a deliberate, understood trade-off** — don't default to it out of habit.
- **Manually re-implemented CSRF/session mechanisms** alongside JWT — pick stateless JWT auth and don't layer traditional session-based mechanisms on top of it; that combination usually indicates confused security architecture rather than defense-in-depth.

---

## 7. Error Handling Conventions

### Backend

- All exceptions should ultimately be caught by a **single global exception handler** that maps them to a consistent response shape: a status code, a short error code/type, and a human-readable message — never a raw stack trace to the client.
- Distinguish **client errors (4xx)** — bad input, unauthorized, not found, version conflict — from **server errors (5xx)** — something actually broke. A version-conflict rejection (§9.4 of the PRD) is a client error (409 Conflict is the conventional choice), not a server failure.
- WebSocket/STOMP errors should follow the same philosophy: send a structured error message back to the sending client's personal channel rather than silently dropping a rejected message.
- Never let one bad message on the STOMP broker crash the shared connection for other users — isolate per-message error handling so one malformed or rejected event doesn't take down the broker.

### Frontend

- Every API call should have a defined failure path shown to the user — not just a console error. Even a simple toast ("Couldn't save that change — try again") is better than silence.
- Distinguish **recoverable errors** (a version conflict, a transient network blip — retry or reconcile) from **terminal errors** (invalid/expired session — redirect to login) in how the UI responds.
- Wrap major feature areas (e.g., the Board view) in an error boundary so a rendering bug in one card doesn't blank the entire screen.

---

## 8. Module & Security Boundaries

- A module's **service** is its only public API to the rest of the backend. Nothing outside a module should import or query its repository or entity directly.
- **Authorization is workspace-scoped.** A user's role in Workspace A must never leak into what they can do in Workspace B — every permission check should explicitly take the workspace (or the resource's owning workspace) into account, not just "is this user an Admin somewhere."
- **Never rely on obscurity for security** — a WebSocket topic name or a resource ID being hard to guess is not a substitute for an actual authorization check on subscribe/access.
- The **frontend never independently decides permissions** — role-based UI hiding (e.g., hiding a "delete board" button from a Member) is a UX nicety, not a security boundary; the backend must reject the action regardless of what the UI shows.

---

## 9. Real-Time Event Boundaries (Ephemeral vs. Durable)

Keep this distinction sharp everywhere in the codebase — it should be obvious from a glance at any event which category it falls into:

| | Ephemeral | Durable |
|---|---|---|
| Examples | Typing indicator, "currently editing," heartbeat, live presence | Card move, comment posted, card created/deleted, notification, activity entry |
| Persisted? | No | Yes |
| Survives server restart? | No — rebuilt as clients reconnect | Yes |
| Goes through service layer's transactional persistence? | No | Yes, before broadcasting |

If you're ever unsure which category a new feature's events fall into, ask: "if the server restarted right now, would losing this be a real problem?" If yes, it's durable. If the answer is "clients will just re-establish it naturally," it's ephemeral.

---

## 10. Naming Conventions

- **Backend packages**: lowercase, singular, feature-named (`card`, not `Cards` or `cardModule`).
- **DTOs**: suffix clearly (`CardRequest`, `CardResponse`) so it's never ambiguous whether you're looking at an entity or a transport object.
- **WebSocket destinations/topics**: consistent, predictable patterns scoped by resource type and ID (e.g., a board's topic vs. a card's topic vs. a user's personal topic should be immediately distinguishable by naming pattern alone).
- **Frontend feature folders**: match backend module names where they correspond (`board`, `card`, `presence`) so the mental model stays aligned across the stack.
- **Event/action names**: describe what happened, in past tense, from the server's canonical broadcast (`CardMoved`, `CommentAdded`) — distinct from client-to-server request names, which describe intent (`MoveCard`, `PostComment`).

---

## 11. Git & Commit Practices

- Commit at the granularity of one logical change per commit — not "end of day" mega-commits.
- Write commit messages that describe *why*, not just *what*, especially for anything touching concurrency logic or authorization checks.
- Keep a `main`/`develop` branch stable and buildable at all times; do feature work on branches, especially once real-time features (Phase 3+) are in play, since half-finished WebSocket wiring is especially prone to leaving the app in a broken state.
- Tag or note the commit where each Phase (see Phases.md) is considered complete — useful both for your own reference and as a portfolio narrative ("here's where real-time sync first worked end-to-end").

---

## 12. Pre-Merge Self-Checklist

Before considering any feature "done," check it against this list:

- [ ] Is all business logic in a service, not a controller/handler?
- [ ] Does every write check authorization against the correct workspace scope?
- [ ] Does every card update check and increment the version field?
- [ ] Is every ephemeral event kept out of the database?
- [ ] Does the broadcast happen only after a successful, committed write?
- [ ] Does the frontend reconcile optimistic state against the broadcast rather than assuming success?
- [ ] Is there a visible, non-silent path for every possible failure (rejected write, expired session, dropped connection)?
- [ ] Would reconnecting after a dropped connection correctly resync this feature's state?

---

*End of Rules.md — read alongside Architecture.md when structuring new code, and re-check the Pre-Merge Self-Checklist before calling any phase complete.*
