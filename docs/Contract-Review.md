# SyncBoard — Frontend-Backend Contract Review

**Document Version:** 1.0  
**Role:** Senior Software Architect, Technical Lead, and Integration Engineer  
**Target:** Contract Verification & Interface Alignment Review  
**Date:** July 22, 2026  

---

## Executive Summary

This document presents a comprehensive **Frontend-Backend Contract Review** for the SyncBoard application. It analyzes the contract alignment between the Spring Boot backend (`syncboard-backend`) and the React frontend (`syncboard-frontend`) across:

- API Endpoints & HTTP Methods
- Request & Response Payloads
- DTO Definitions & Entity Mappings
- Validation Constraints
- Authentication & Token Refresh Flow
- Error Response Specifications
- File Uploads, Pagination, Filtering, & Sorting

No source code was modified during this review.

---

## 1. Complete API Contract Inventory

| Feature Domain | Endpoint Path | Method | Auth Required | Frontend Invocation File | Backend Controller File | Contract Alignment Status |
|---|---|---|---|---|---|---|
| **Health Check** | `/api/health` | GET | No | N/A | [HealthController.java](file:///d:/Project/sync_board/syncboard-backend/src/main/java/com/syncboard/common/controller/HealthController.java) | ✅ Matched |
| **Auth: Register** | `/api/auth/register` | POST | No | [authApi.js](file:///d:/Project/sync_board/syncboard-frontend/src/api/authApi.js#L9-L12) | [AuthController.java](file:///d:/Project/sync_board/syncboard-backend/src/main/java/com/syncboard/auth/controller/AuthController.java#L20-L23) | ✅ Matched |
| **Auth: Login** | `/api/auth/login` | POST | No | [authApi.js](file:///d:/Project/sync_board/syncboard-frontend/src/api/authApi.js#L4-L7) | [AuthController.java](file:///d:/Project/sync_board/syncboard-backend/src/main/java/com/syncboard/auth/controller/AuthController.java#L25-L28) | ✅ Matched |
| **Auth: Refresh** | `/api/auth/refresh` | POST | No | [httpClient.js](file:///d:/Project/sync_board/syncboard-frontend/src/api/httpClient.js#L37) | [AuthController.java](file:///d:/Project/sync_board/syncboard-backend/src/main/java/com/syncboard/auth/controller/AuthController.java#L30-L33) | ✅ Matched |
| **Auth: Logout** | `/api/auth/logout` | POST | Yes | [authApi.js](file:///d:/Project/sync_board/syncboard-frontend/src/api/authApi.js#L14-L23) | [AuthController.java](file:///d:/Project/sync_board/syncboard-backend/src/main/java/com/syncboard/auth/controller/AuthController.java#L35-L40) | 🟡 Incomplete (No BE revocation) |
| **User Profile** | `/api/users/me` | GET | Yes | [authApi.js](file:///d:/Project/sync_board/syncboard-frontend/src/api/authApi.js#L24-L27) | [UserController.java](file:///d:/Project/sync_board/syncboard-backend/src/main/java/com/syncboard/user/controller/UserController.java#L18-L21) | ✅ Matched |
| **Workspaces: Create** | `/api/workspaces` | POST | Yes | [workspaceApi.js](file:///d:/Project/sync_board/syncboard-frontend/src/api/workspaceApi.js#L4-L7) | [WorkspaceController.java](file:///d:/Project/sync_board/syncboard-backend/src/main/java/com/syncboard/workspace/controller/WorkspaceController.java#L24-L29) | ✅ Matched |
| **Workspaces: Get All** | `/api/workspaces` | GET | Yes | [workspaceApi.js](file:///d:/Project/sync_board/syncboard-frontend/src/api/workspaceApi.js#L9-L12) | [WorkspaceController.java](file:///d:/Project/sync_board/syncboard-backend/src/main/java/com/syncboard/workspace/controller/WorkspaceController.java#L31-L34) | ✅ Matched |
| **Workspaces: Get One** | `/api/workspaces/{id}` | GET | Yes | [workspaceApi.js](file:///d:/Project/sync_board/syncboard-frontend/src/api/workspaceApi.js#L14-L17) | [WorkspaceController.java](file:///d:/Project/sync_board/syncboard-backend/src/main/java/com/syncboard/workspace/controller/WorkspaceController.java#L36-L41) | ✅ Matched |
| **Workspaces: Invite Member** | `/api/workspaces/{id}/members` | POST | Yes | [workspaceApi.js](file:///d:/Project/sync_board/syncboard-frontend/src/api/workspaceApi.js#L19-L22) | [WorkspaceController.java](file:///d:/Project/sync_board/syncboard-backend/src/main/java/com/syncboard/workspace/controller/WorkspaceController.java#L43-L50) | ✅ Matched |
| **Workspaces: Update Role** | `/api/workspaces/{id}/members/{userId}/role` | PUT | Yes | [workspaceApi.js](file:///d:/Project/sync_board/syncboard-frontend/src/api/workspaceApi.js#L24-L27) | [WorkspaceController.java](file:///d:/Project/sync_board/syncboard-backend/src/main/java/com/syncboard/workspace/controller/WorkspaceController.java#L52-L60) | ✅ Matched |
| **Workspaces: Remove Member** | `/api/workspaces/{id}/members/{userId}` | DELETE | Yes | [workspaceApi.js](file:///d:/Project/sync_board/syncboard-frontend/src/api/workspaceApi.js#L29-L32) | [WorkspaceController.java](file:///d:/Project/sync_board/syncboard-backend/src/main/java/com/syncboard/workspace/controller/WorkspaceController.java#L62-L69) | ✅ Matched |
| **Boards: Create** | `/api/workspaces/{workspaceId}/boards` | POST | Yes | [boardApi.js](file:///d:/Project/sync_board/syncboard-frontend/src/api/boardApi.js#L5-L8) | [BoardController.java](file:///d:/Project/sync_board/syncboard-backend/src/main/java/com/syncboard/board/controller/BoardController.java#L22-L28) | ✅ Matched |
| **Boards: List by Workspace** | `/api/workspaces/{workspaceId}/boards` | GET | Yes | [boardApi.js](file:///d:/Project/sync_board/syncboard-frontend/src/api/boardApi.js#L10-L13) | [BoardController.java](file:///d:/Project/sync_board/syncboard-backend/src/main/java/com/syncboard/board/controller/BoardController.java#L30-L35) | ✅ Matched |
| **Boards: Get One** | `/api/boards/{boardId}` | GET | Yes | [boardApi.js](file:///d:/Project/sync_board/syncboard-frontend/src/api/boardApi.js#L15-L18) | [BoardSingleController.java](file:///d:/Project/sync_board/syncboard-backend/src/main/java/com/syncboard/board/controller/BoardSingleController.java#L20-L25) | ✅ Matched |
| **Boards: Get Full Hierarchy** | `/api/boards/{boardId}/full` | GET | Yes | [boardApi.js](file:///d:/Project/sync_board/syncboard-frontend/src/api/boardApi.js#L20-L23) | [BoardSingleController.java](file:///d:/Project/sync_board/syncboard-backend/src/main/java/com/syncboard/board/controller/BoardSingleController.java#L27-L32) | ✅ Matched |
| **Boards: Update** | `/api/boards/{boardId}` | PUT | Yes | [boardApi.js](file:///d:/Project/sync_board/syncboard-frontend/src/api/boardApi.js#L25-L28) | [BoardSingleController.java](file:///d:/Project/sync_board/syncboard-backend/src/main/java/com/syncboard/board/controller/BoardSingleController.java#L34-L40) | ✅ Matched |
| **Boards: Delete** | `/api/boards/{boardId}` | DELETE | Yes | [boardApi.js](file:///d:/Project/sync_board/syncboard-frontend/src/api/boardApi.js#L30-L33) | [BoardSingleController.java](file:///d:/Project/sync_board/syncboard-backend/src/main/java/com/syncboard/board/controller/BoardSingleController.java#L42-L48) | ✅ Matched |
| **Columns: Create** | `/api/boards/{boardId}/columns` | POST | Yes | [boardApi.js](file:///d:/Project/sync_board/syncboard-frontend/src/api/boardApi.js#L36-L39) | [BoardColumnController.java](file:///d:/Project/sync_board/syncboard-backend/src/main/java/com/syncboard/board/controller/BoardColumnController.java#L22-L28) | ✅ Matched |
| **Columns: List by Board** | `/api/boards/{boardId}/columns` | GET | Yes | [boardApi.js](file:///d:/Project/sync_board/syncboard-frontend/src/api/boardApi.js#L41-L44) | [BoardColumnController.java](file:///d:/Project/sync_board/syncboard-backend/src/main/java/com/syncboard/board/controller/BoardColumnController.java#L30-L35) | ✅ Matched |
| **Columns: Update** | `/api/columns/{columnId}` | PUT | Yes | [boardApi.js](file:///d:/Project/sync_board/syncboard-frontend/src/api/boardApi.js#L46-L49) | [BoardColumnSingleController.java](file:///d:/Project/sync_board/syncboard-backend/src/main/java/com/syncboard/board/controller/BoardColumnSingleController.java#L20-L26) | ✅ Matched |
| **Columns: Delete** | `/api/columns/{columnId}` | DELETE | Yes | [boardApi.js](file:///d:/Project/sync_board/syncboard-frontend/src/api/boardApi.js#L51-L54) | [BoardColumnSingleController.java](file:///d:/Project/sync_board/syncboard-backend/src/main/java/com/syncboard/board/controller/BoardColumnSingleController.java#L28-L34) | ✅ Matched |
| **Cards: Create** | `/api/columns/{columnId}/cards` | POST | Yes | [cardApi.js](file:///d:/Project/sync_board/syncboard-frontend/src/api/cardApi.js#L4-L7) | [CardController.java](file:///d:/Project/sync_board/syncboard-backend/src/main/java/com/syncboard/card/controller/CardController.java#L22-L28) | ✅ Matched |
| **Cards: List by Column** | `/api/columns/{columnId}/cards` | GET | Yes | [cardApi.js](file:///d:/Project/sync_board/syncboard-frontend/src/api/cardApi.js#L9-L12) | [CardController.java](file:///d:/Project/sync_board/syncboard-backend/src/main/java/com/syncboard/card/controller/CardController.java#L30-L35) | ✅ Matched |
| **Cards: Update** | `/api/cards/{cardId}` | PUT | Yes | [cardApi.js](file:///d:/Project/sync_board/syncboard-frontend/src/api/cardApi.js#L14-L17) | [CardSingleController.java](file:///d:/Project/sync_board/syncboard-backend/src/main/java/com/syncboard/card/controller/CardSingleController.java#L20-L26) | ✅ Matched |
| **Cards: Move** | `/api/cards/{cardId}/move` | PATCH | Yes | [cardApi.js](file:///d:/Project/sync_board/syncboard-frontend/src/api/cardApi.js#L19-L24) | [CardSingleController.java](file:///d:/Project/sync_board/syncboard-backend/src/main/java/com/syncboard/card/controller/CardSingleController.java#L28-L35) | ✅ Matched |
| **Cards: Delete** | `/api/cards/{cardId}` | DELETE | Yes | [cardApi.js](file:///d:/Project/sync_board/syncboard-frontend/src/api/cardApi.js#L26-L29) | [CardSingleController.java](file:///d:/Project/sync_board/syncboard-backend/src/main/java/com/syncboard/card/controller/CardSingleController.java#L37-L43) | ✅ Matched |

---

## 2. Identified Contract Mismatches Catalog

### Mismatch #1: Card Priority Picker Missing in UI
- **Feature:** Card Priority Selection & Editing
- **Frontend File:** [CardDrawer.jsx](file:///d:/Project/sync_board/syncboard-frontend/src/features/cardDetail/components/CardDrawer.jsx)
- **Backend File:** [CardPriority.java](file:///d:/Project/sync_board/syncboard-backend/src/main/java/com/syncboard/card/entity/CardPriority.java), [CardRequest.java](file:///d:/Project/sync_board/syncboard-backend/src/main/java/com/syncboard/card/dto/CardRequest.java#L14)
- **Description of Mismatch:** Backend defines `CardPriority` enum (`LOW`, `MEDIUM`, `HIGH`, `URGENT`) and accepts `priority` in `CardRequest`. Frontend `CardDrawer.jsx` has no priority selector dropdown or display input, ignoring priority during card updates.
- **Expected Behavior:** `CardDrawer.jsx` should render a priority dropdown allowing users to select `LOW`, `MEDIUM`, `HIGH`, or `URGENT` and send it to backend in `updateCard`.
- **Actual Behavior:** Frontend omits `priority` property during `CardDrawer` updates, forcing backend to preserve old priority or default to `MEDIUM`.
- **Severity:** High

---

### Mismatch #2: Header Search Bar Lacks Backend Query Parameters
- **Feature:** Board & Card Search
- **Frontend File:** [DashboardView.jsx](file:///d:/Project/sync_board/syncboard-frontend/src/features/workspace/components/DashboardView.jsx#L52-L62), [BoardView.jsx](file:///d:/Project/sync_board/syncboard-frontend/src/features/board/components/CardPreview.jsx#L44-L51), [CreateBoardView.jsx](file:///d:/Project/sync_board/syncboard-frontend/src/features/board/components/CreateBoardView.jsx#L23-L31)
- **Backend File:** [BoardController.java](file:///d:/Project/sync_board/syncboard-backend/src/main/java/com/syncboard/board/controller/BoardController.java), [CardController.java](file:///d:/Project/sync_board/syncboard-backend/src/main/java/com/syncboard/card/controller/CardController.java)
- **Description of Mismatch:** Frontend renders search `<input placeholder="Search boards..." />` and `Search cards, members...` across all headers. Backend controllers accept no search query parameters (`?query=...` or `?search=...`).
- **Expected Behavior:** Typing in the search input should trigger client-side filtering or execute a search query against backend search endpoints.
- **Actual Behavior:** Search inputs are decorative UI elements that have no input event listeners and send no parameters to backend.
- **Severity:** Medium

---

### Mismatch #3: Header Filter Buttons Unbound to Backend Criteria
- **Feature:** Board & Card Filtering
- **Frontend File:** [DashboardView.jsx](file:///d:/Project/sync_board/syncboard-frontend/src/features/workspace/components/DashboardView.jsx#L60-L62), [BoardView.jsx](file:///d:/Project/sync_board/syncboard-frontend/src/features/board/components/BoardView.jsx#L93-L95)
- **Backend File:** [BoardController.java](file:///d:/Project/sync_board/syncboard-backend/src/main/java/com/syncboard/board/controller/BoardController.java), [CardController.java](file:///d:/Project/sync_board/syncboard-backend/src/main/java/com/syncboard/card/controller/CardController.java)
- **Description of Mismatch:** Frontend headers feature `<Button variant="secondary"><Filter /> Filter</Button>`. Backend controllers offer no filtering parameters (e.g. filter by assignee, priority, due date).
- **Expected Behavior:** Clicking Filter should toggle a filter popover allowing users to filter cards by priority or assignee.
- **Actual Behavior:** Filter button is a static UI component with no onClick action or backend query support.
- **Severity:** Medium

---

### Mismatch #4: Absence of Pagination & Dynamic Sorting Contract
- **Feature:** Pagination & Sorting
- **Frontend File:** [DashboardView.jsx](file:///d:/Project/sync_board/syncboard-frontend/src/features/workspace/components/DashboardView.jsx), [useBoardStore.js](file:///d:/Project/sync_board/syncboard-frontend/src/features/board/state/useBoardStore.js)
- **Backend File:** [BoardController.java](file:///d:/Project/sync_board/syncboard-backend/src/main/java/com/syncboard/board/controller/BoardController.java), [CardController.java](file:///d:/Project/sync_board/syncboard-backend/src/main/java/com/syncboard/card/controller/CardController.java)
- **Description of Mismatch:** Neither backend nor frontend implements pagination (`Pageable`, `page`, `size`) or dynamic sorting (`sort=title,asc`). Backend returns full unpaginated lists ordered strictly by `position`.
- **Expected Behavior:** For large boards or workspaces with 100+ cards/boards, pagination or lazy loading should be implemented to prevent payload bloat.
- **Actual Behavior:** All endpoints return 100% of records in a single unpaginated array.
- **Severity:** Medium

---

### Mismatch #5: Silent Swallowing of Optimistic Locking Conflicts (409 CONFLICT)
- **Feature:** Optimistic Concurrency Control
- **Frontend File:** [useBoardStore.js](file:///d:/Project/sync_board/syncboard-frontend/src/features/board/state/useBoardStore.js#L66-L76)
- **Backend File:** [GlobalExceptionHandler.java](file:///d:/Project/sync_board/syncboard-backend/src/main/java/com/syncboard/common/exception/GlobalExceptionHandler.java#L57-L66)
- **Description of Mismatch:** Backend handles stale `@Version` updates by throwing `ObjectOptimisticLockingFailureException` and returning `409 CONFLICT` with JSON message: `"The record you are trying to update has been modified by another user."`. Frontend `updateCard()` catches the error with `console.error` without alerting the user or refreshing stale state.
- **Expected Behavior:** Frontend should catch 409 CONFLICT response, display a user toast alert ("Record was modified by another user"), and re-fetch board state.
- **Actual Behavior:** Frontend logs error to browser console silently; user assumes edit succeeded while server rejected it.
- **Severity:** High

---

### Mismatch #6: Floating Position Collision when Dropping Card in Single-Item Column
- **Feature:** Card Position Calculation
- **Frontend File:** [useBoardStore.js](file:///d:/Project/sync_board/syncboard-frontend/src/features/board/state/useBoardStore.js#L164-L175)
- **Backend File:** [CardService.java](file:///d:/Project/sync_board/syncboard-backend/src/main/java/com/syncboard/card/service/CardService.java#L126-L139)
- **Description of Mismatch:** In `useBoardStore.js` `syncMoveCard`:
  `if (cards.length > 1) { ... }`
  When moving a card into a column that has exactly 1 existing card, `cards.length` is 1, so `newPosition` remains the default fallback `1000.0`.
- **Expected Behavior:** Moving a card into a column with 1 existing card should compute a distinct fractional position ($1000 + 1000 = 2000.0$ or $1000 / 2 = 500.0$).
- **Actual Behavior:** Moved card receives `position = 1000.0`, matching the existing card's exact position, causing a floating position duplicate in the database.
- **Severity:** Medium

---

### Mismatch #7: Missing User Avatar Upload Infrastructure
- **Feature:** User Profile & Avatars
- **Frontend File:** [Avatar.jsx](file:///d:/Project/sync_board/syncboard-frontend/src/components/Avatar.jsx)
- **Backend File:** [User.java](file:///d:/Project/sync_board/syncboard-backend/src/main/java/com/syncboard/user/entity/User.java#L31)
- **Description of Mismatch:** Database entity `User` contains an `avatar_url` column, and frontend components consume `avatarUrl`. However, neither backend nor frontend provides a file upload endpoint (`MultipartFile`) or profile image picker.
- **Expected Behavior:** Users should be able to upload a profile picture file or select an avatar URL.
- **Actual Behavior:** Avatars rely on external Pravatar placeholder URLs (`https://i.pravatar.cc/150?...`).
- **Severity:** Low

---

### Mismatch #8: Raw Java Map Syntax Exposed in Validation Errors
- **Feature:** Form Validation & Error Normalization
- **Frontend File:** [useAuthStore.js](file:///d:/Project/sync_board/syncboard-frontend/src/features/auth/state/useAuthStore.js#L18)
- **Backend File:** [GlobalExceptionHandler.java](file:///d:/Project/sync_board/syncboard-backend/src/main/java/com/syncboard/common/exception/GlobalExceptionHandler.java#L51)
- **Description of Mismatch:** `GlobalExceptionHandler.java` formats `MethodArgumentNotValidException` by converting the errors Map to a string (`message(errors.toString())`), resulting in strings like `"{email=Must be valid email}"`. Frontend `useAuthStore.js` sets `error: error.response?.data?.message`, displaying raw Java Map syntax on the login/register card.
- **Expected Behavior:** Validation error messages should be formatted cleanly as user-friendly sentences or a structured JSON map.
- **Actual Behavior:** Raw Java Map string representation (`{email=Must be a well-formed email address}`) renders directly in the UI.
- **Severity:** Low

---

### Mismatch #9: Client-Only Logout Without Server-Side Token Revocation
- **Feature:** Authentication Lifecycle
- **Frontend File:** [authApi.js](file:///d:/Project/sync_board/syncboard-frontend/src/api/authApi.js#L14-L23)
- **Backend File:** [AuthController.java](file:///d:/Project/sync_board/syncboard-backend/src/main/java/com/syncboard/auth/controller/AuthController.java#L35-L40)
- **Description of Mismatch:** Frontend `authApi.logout()` calls `POST /api/auth/logout` and removes tokens from `localStorage`. Backend `logout()` returns `200 OK` without server-side token revocation (token blacklisting/invalidation).
- **Expected Behavior:** Backend should invalidate or blacklist the access/refresh token upon logout.
- **Actual Behavior:** Tokens remain valid on backend until natural expiration (15 min access / 7 day refresh).
- **Severity:** Medium
