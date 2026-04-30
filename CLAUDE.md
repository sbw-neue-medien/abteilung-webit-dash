# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Two repos, one working directory

This working directory contains **two separate git repositories**:

| Repo | Path | Remote |
|---|---|---|
| Frontend | `/home/j/Projekte/webIT/` | `sbw-neue-medien/abteilung-webit-dash` |
| Backend | `/home/j/Projekte/webIT/api/` | `sbw-neue-medien/abteilung-webit-api` |

Always create matching feature branches in **both** repos and open a PR for each. Never commit directly to `main`.

## Dev environment

The app runs in Docker. Two containers:
- `webit-app-web` — PHP + served frontend
- `webit-app-db` — MariaDB (client binary is `mariadb`, not `mysql`)

**Run migrations:**
```bash
docker exec -i webit-app-db mariadb -u webit_abteilung -pguessme webit_abteilung < api/database/<migration>.sql
```

**Frontend dev server** (proxies `/api` to `http://localhost` by default):
```bash
npm run dev
# Against a different backend port:
VITE_API_TARGET=http://localhost:9080 npm run dev
```

No test suite exists in either repo.

## Backend architecture (`api/`)

Single-file router: every request hits `api/index.php`, which matches a route and calls a controller method. No framework.

**Adding a new endpoint:** create a model in `models/`, a controller in `controllers/`, register the route in `index.php`, and `require_once` both new files at the top of `index.php`.

**Auth middleware** (`middleware/Auth.php`):
- `Auth::requireAuth()` — validates JWT, returns payload array `['sub' => id, 'role' => ...]`
- `Auth::requireLeiter()` — requireAuth + role check
- `BaseController::requireNotMentor($me)` — call after requireAuth on all write endpoints that aren't already leiter-only

**Three roles:** `leiter` (full access), `lernender` (own projects + entries only), `mentor` (read-only on assigned learners' data, blocked from all writes via `requireNotMentor()`).

**Project access:** `Project::canAccess($projectId, $userId, $role)` handles all three roles — it calls `Project::canAccessAsMentor()` for mentors, which checks `mentor_assignments`.

**Mentor access to time entries:** `TimeEntry::forMentor($mentorId, $filters)` — use this instead of `forUser()` in the mentor branch of controllers.

**DB:** PDO singleton via `Database::get()`. All durations stored in **minutes**. Task `actual_duration_min` is computed on-the-fly by summing `time_entries` — not stored.

**Config:** `api/config/config.php` defines constants (`DB_HOST`, `JWT_SECRET`, `MAIL_*`, `APP_URL`). The Docker DB hostname is `db`.

**Migrations:** incremental SQL files in `api/database/`. Apply them in order; `schema.sql` is the baseline. Current migrations: `migration_avatars.sql`, `migration_email.sql`, `migration_sprints.sql`, `migration_password_reset.sql`, `migration_mentor.sql`.

## Frontend architecture (`src/`)

**API calls:** all HTTP requests go through `src/api/index.js` — a thin `fetch` wrapper. Add new endpoints here.

**State:** Pinia stores in `src/stores/` — one per resource (`auth`, `projects`, `tasks`, `sprints`, `timeEntries`, `todos`, `users`). All follow the same pattern: `list`, `loading`, `fetchAll`/`fetchForProject`, `create`, `update`, `remove`.

**Auth store** (`src/stores/auth.js`): exposes `isLoggedIn`, `isLeiter`, `isMentor`. Use these for role-based UI branching.

**Route guards** (`src/router/index.js`):
- `meta: { leiter: true }` — leiter-only
- `meta: { leiterOrMentor: true }` — leiter or mentor (e.g. `/lernende`)
- No meta — any authenticated user

**Mentor UI pattern:** check `auth.isMentor` to hide write buttons and pass `:readonly="auth.isMentor"` to `KanbanBoard` (which propagates to `KanbanCard`). The `KanbanBoard` `readonly` prop disables drag-and-drop and hides add/edit/delete controls.

**Tailwind tokens** (defined in the theme, not standard Tailwind): `text-hi`, `text-mid`, `text-lo`, `bg-surface`, `bg-lift`, `ring-line`, `text-brand-{500,600,700}`, `bg-brand-subtle`, `border-groove`.
