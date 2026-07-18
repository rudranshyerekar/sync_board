# SyncBoard — DATABASE.md
### MySQL Setup Guide & Schema Reference

**Companion to:** SyncBoard-PRD.md (§8 Data Model), Architecture.md (§4 Backend Structure)
**Purpose:** Everything database-related in one place — local MySQL setup, schema design, and MySQL-specific notes that affect implementation.

---

## Table of Contents

1. Local MySQL Setup
2. MySQL-Specific Configuration Notes
3. Spring Boot Database Configuration
4. Conceptual Schema
5. Indexing Strategy
6. Migration Notes

---

## 1. Local MySQL Setup

### 1.1 Prerequisites

- MySQL Server 8.0+ installed and running locally as a Windows service
- MySQL client (MySQL Workbench, CLI, or DBeaver) for administration

### 1.2 Database Creation

Run these commands in a MySQL client:

```sql
-- Create the database with full Unicode support
CREATE DATABASE IF NOT EXISTS syncboard
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- (Optional) Create a dedicated user instead of using root
CREATE USER IF NOT EXISTS 'syncboard_user'@'localhost'
  IDENTIFIED BY 'your_password_here';

GRANT ALL PRIVILEGES ON syncboard.* TO 'syncboard_user'@'localhost';

FLUSH PRIVILEGES;
```

### 1.3 Verify Connection

```bash
mysql -u root -p -e "SHOW DATABASES;" | grep syncboard
```

---

## 2. MySQL-Specific Configuration Notes

> These are important differences from PostgreSQL that affect how the Spring Boot application is configured and how entities are designed.

### 2.1 Character Set

- **Always use `utf8mb4`**, not `utf8` — MySQL's `utf8` only supports 3-byte characters and will silently truncate 4-byte characters (emojis, some CJK characters).
- Set at database level (done above) AND at table/column level if needed.

### 2.2 ID Generation Strategy

- MySQL uses `AUTO_INCREMENT` (not PostgreSQL's `SERIAL` / sequences).
- In JPA entities, use:
  ```java
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
  ```
- **Do NOT use** `GenerationType.AUTO` — it may default to TABLE strategy on MySQL, which is less performant.

### 2.3 Transaction Isolation

- MySQL's default is `REPEATABLE_READ` (PostgreSQL defaults to `READ_COMMITTED`).
- For this project, the default `REPEATABLE_READ` is fine — it provides stronger guarantees and works well with optimistic locking.
- If phantom reads become an issue, explicitly set isolation in `application.properties`:
  ```properties
  spring.jpa.properties.hibernate.connection.isolation=2
  ```

### 2.4 String Columns

- MySQL has a 65,535 byte row size limit. With `utf8mb4` (4 bytes/char), `VARCHAR(255)` uses 1,020 bytes.
- For long text fields (card descriptions, comment content), use `@Lob` or `@Column(columnDefinition = "TEXT")`.
- For short fields (names, emails, titles), `VARCHAR(255)` is standard.

### 2.5 Boolean Columns

- MySQL stores booleans as `TINYINT(1)`. JPA maps Java `boolean`/`Boolean` correctly, no special handling needed.

### 2.6 Timestamps

- Use `DATETIME(6)` for microsecond precision (important for ordering events):
  ```java
  @Column(columnDefinition = "DATETIME(6)")
  private LocalDateTime createdAt;
  ```
- Or let Hibernate handle it automatically — it will use `DATETIME(6)` by default with MySQL 8+.

### 2.7 Optimistic Locking

- `@Version` annotation works identically on MySQL as on PostgreSQL — no changes needed.
- Hibernate automatically increments the version column and throws `OptimisticLockException` on stale writes.

---

## 3. Spring Boot Database Configuration

### 3.1 application-local.properties

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/syncboard?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC&characterEncoding=utf8mb4
spring.datasource.username=${MYSQL_USER:root}
spring.datasource.password=${MYSQL_PASSWORD:your_password}
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

spring.jpa.database-platform=org.hibernate.dialect.MySQLDialect
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
```

### 3.2 Maven Dependency

```xml
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <scope>runtime</scope>
</dependency>
```

### 3.3 Gradle Dependency

```groovy
runtimeOnly 'com.mysql:mysql-connector-j'
```

---

## 4. Conceptual Schema

> Based on SyncBoard-PRD.md §8. This is the conceptual model — JPA entities will generate the actual DDL via `ddl-auto: update` during development. Formal migrations (Flyway/Liquibase) can be added in Phase 7.

### 4.1 Entity Relationship Overview

```
User ──────┐
           ├── WorkspaceMember ──── Workspace
           │                           │
           │                         Board
           │                           │
           │                        Column
           │                           │
           ├── Card ◄── Comment        │
           │     │                     │
           │     └── (version field)   │
           │                           │
           ├── Notification            │
           │                           │
           └───────────────────── Activity
```

### 4.2 Entities Summary

| Entity | Key Fields | Notes |
|--------|-----------|-------|
| **User** | id, name, email, password_hash, avatar_url, presence_status, last_seen | `presence_status` is denormalized for fast lookup |
| **Workspace** | id, name, created_by, created_at | Top-level container |
| **WorkspaceMember** | id, user_id, workspace_id, role | Role: OWNER / ADMIN / MEMBER |
| **Board** | id, workspace_id, title, position | `position` for ordering within workspace |
| **Column** | id, board_id, title, position | `position` for ordering within board |
| **Card** | id, column_id, title, description, priority, assignee_id, deadline, position, **version**, created_at, updated_at | `version` for optimistic locking; `position` for ordering within column |
| **Comment** | id, card_id, author_id, content, created_at | Supports @mentions (parsed from content) |
| **Notification** | id, recipient_id, message, type, is_read, created_at | Type: ASSIGNMENT / MENTION / COMPLETION |
| **Activity** | id, workspace_id, user_id, action, description, created_at | Append-only audit log |

### 4.3 Position Field Strategy

Cards, Columns, and Boards all have a `position` field for ordering. Use a **fractional/gap-based approach**:

- Initial positions: 1000, 2000, 3000, ...
- Insert between two items: average of their positions (e.g., 1500 between 1000 and 2000)
- This avoids rewriting every sibling's position on a single reorder
- Periodically re-normalize positions if gaps become too small (rare edge case)

---

## 5. Indexing Strategy

> These indexes should be created as the project matures. JPA `@Index` annotations can define them on entities.

| Table | Index | Why |
|-------|-------|-----|
| `workspace_member` | `(user_id, workspace_id)` UNIQUE | Fast membership lookup, prevent duplicates |
| `board` | `(workspace_id, position)` | List boards in a workspace, ordered |
| `column_entity` | `(board_id, position)` | List columns in a board, ordered |
| `card` | `(column_id, position)` | List cards in a column, ordered |
| `card` | `(assignee_id)` | Query cards assigned to a user |
| `comment` | `(card_id, created_at)` | Fetch comments for a card, chronologically |
| `notification` | `(recipient_id, is_read, created_at)` | Fetch unread notifications, newest first |
| `activity` | `(workspace_id, created_at)` | Paginated activity feed per workspace |

---

## 6. Migration Notes

### 6.1 Development Phase (Phases 0–6)

- Use `spring.jpa.hibernate.ddl-auto=update` for convenience — Hibernate will auto-create/alter tables based on entity changes.
- This is acceptable during active development but NOT for production.

### 6.2 Production / Phase 7

- Switch to a proper migration tool: **Flyway** (recommended) or Liquibase.
- Set `spring.jpa.hibernate.ddl-auto=validate` (verify schema matches entities, but don't modify).
- Write versioned migration scripts for each schema change.

### 6.3 Test Database

- For integration tests, consider using **H2 in MySQL compatibility mode** or **Testcontainers with MySQL**:
  ```properties
  # application-test.properties (H2 option)
  spring.datasource.url=jdbc:h2:mem:testdb;MODE=MYSQL
  spring.datasource.driver-class-name=org.h2.Driver
  ```

---

*End of DATABASE.md — reference this when creating entities, configuring the datasource, or troubleshooting MySQL-specific issues.*
