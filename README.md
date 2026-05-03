# webIT Abteilungs-Dashboard — Frontend

Vue 3 Single-Page Application für die Verwaltung der webIT-Abteilung.

**Version:** 1.5.0
**Repo:** `sbw-neue-medien/abteilung-webit-dash`
**Backend:** [`sbw-neue-medien/abteilung-webit-api`](https://github.com/sbw-neue-medien/abteilung-webit-api)

---

## Aufgabenteilung

| Bereich | Verantwortung | Repo |
|---|---|---|
| **Frontend** | UI, Routing, State-Management, API-Aufrufe | `abteilung-webit-dash` (dieses Repo) |
| **Backend** | REST-API, Datenbank, Authentifizierung, Zugriffsschutz | `abteilung-webit-api` |

Das Frontend kommuniziert ausschliesslich über HTTP-Requests mit dem Backend (`/api/*`). Es enthält keine Business-Logik und keine Datenbankzugriffe.

---

## Stack

- **Vue 3** — Composition API
- **Pinia** — State Management
- **Vue Router 4** — Client-seitiges Routing
- **Tailwind CSS 3** — Styling
- **Vite 5** — Build-Tool

---

## Projektstruktur

```
src/
├── api/          # Alle HTTP-Calls (api/index.js)
├── components/   # Wiederverwendbare Komponenten
│   ├── Footer.vue
│   ├── HelpModal.vue
│   ├── KanbanBoard.vue
│   ├── KanbanCard.vue
│   ├── MarkdownRenderer.vue
│   ├── MentorForm.vue
│   ├── Modal.vue
│   ├── NavBar.vue
│   ├── ProjectForm.vue
│   ├── SprintPanel.vue
│   ├── StatusBadge.vue
│   ├── TimeEntryForm.vue
│   ├── TodoList.vue
│   ├── UserAvatar.vue
│   └── UserForm.vue
├── stores/       # Pinia Stores
│   ├── auth.js
│   ├── projects.js
│   ├── tasks.js
│   ├── sprints.js
│   ├── timeEntries.js
│   ├── todos.js
│   └── users.js
├── views/        # Seiten-Komponenten (eine pro Route)
│   ├── DashboardView.vue
│   ├── LearnersView.vue
│   ├── LoginView.vue
│   ├── MentorsView.vue
│   ├── MyAreaView.vue
│   ├── PasswordResetView.vue
│   ├── ProjectDetailView.vue
│   ├── ProjectsView.vue
│   ├── SprintsView.vue
│   └── TimeEntryView.vue
└── router/       # Route-Definitionen
```

---

## Routen

| Pfad | Seite | Zugang |
|---|---|---|
| `/login` | Login | öffentlich |
| `/passwort-reset` | Passwort zurücksetzen | öffentlich |
| `/` | Dashboard | alle |
| `/projekte` | Projektübersicht | alle |
| `/projekte/:id` | Projektdetail (Kanban + Sprints + Todos) | alle |
| `/zeiterfassung` | Zeiterfassung | alle |
| `/mein-bereich` | Eigenes Profil & Stunden | Leiter, Lernpartner |
| `/sprints` | Sprint-Verwaltung | nur Leiter |
| `/lernende` | Lernpartner verwalten | Leiter (voll), Coach (read-only) |
| `/mentoren` | Coaches verwalten + Zuweisung | nur Leiter |

---

## Features

- **Kanban-Board** mit Drag-and-Drop (Offen → In Arbeit → Review → Erledigt), TodoList als rechte Sidebar
- **Kanban-Vorlagen** — Projekte als Vorlage speichern; Tasks werden beim Erstellen eines neuen Projekts übernommen
- **Sprint-Planung** — wöchentliche Sprints, Filter im Kanban
- **Zeiterfassung** — Stunden pro Projekt/Aufgabe erfassen
- **Todos** — einfache Aufgabenliste mit geplantem/effektivem Aufwand
- **Eigenprojekte** — persönliche Projekte einem Lernpartner zuordnen
- **Passwort-Reset** — per E-Mail anfordern und setzen
- **Avatar-Upload** — Profilbild pro Benutzer
- **E-Mail-Benachrichtigungen** — Leiter kann Benachrichtigungen bei Review-Aufgaben aktivieren
- **Dark Mode** — System-/manuelles Umschalten
- **Footer-Links** — konfigurierbare Links (verwaltet durch Leiter)
- **Rollen** — drei Rollen mit abgestuftem Zugriff:
  - **Leiter** — Vollzugriff, verwaltet Benutzer, Projekte, Sprints und Coaches
  - **Lernpartner** — sieht eigene/zugewiesene Projekte und eigene Zeiterfassung
  - **Coach** — read-only Zugriff auf Daten der zugewiesenen Lernpartner; kein Schreibzugriff

---

## Lokale Entwicklung

```bash
npm install
npm run dev          # http://localhost:5173 (proxied an Backend)
npm run debug        # Backend auf Port 9080
npm run build        # Produktions-Build nach dist/
```

Das Backend muss separat laufen (siehe `abteilung-webit-api`).

---

## Konventionen

- Alle Dauer-Werte in **Minuten** (z.B. 120 = 2h)
- API-Calls ausschliesslich über `src/api/index.js`
- Jeder Datensatz-Typ hat einen eigenen Pinia-Store in `src/stores/`
- Keine TypeScript — plain JavaScript + JSDoc bei Bedarf
- Tailwind-Tokens: `text-hi`, `text-mid`, `text-lo`, `bg-surface`, `bg-lift`, `ring-line`, `border-groove`, `text-brand-*`
- Logout via `window.location.href` (nicht `router.push`) — erzwingt Pinia-Store-Reset

---

## Changelog

### 1.5.0
- E-Mail-Benachrichtigungen: Toggle im Leiter-Profil bei Review-Aufgaben
- Kanban-Layout: Board zentriert, TodoList als rechte Sidebar auf breiten Screens
- Terminologie: Mentor → Coach, Lernende → Lernpartner (nur UI-Labels)
- Bugfix: Logout erzwingt Page-Reload (verhindert stale Pinia-Store nach Rollenwechsel)
- Bugfix: Login-Fehler zeigte fälschlich „Sitzung abgelaufen" (401 → 400 im Backend)

### 1.4.0
- Kanban-Vorlagen: Projekte als Vorlage speichern, Tasks beim Erstellen übernehmen
- Vorlagen-Tab in der Projektliste (nur Leiter)

### 1.3.0
- Coach-Rolle: read-only Zugriff auf Lernenden-Daten, Coach-Zuweisung durch Leiter

### 1.2.0
- Sprint-Planung mit Kanban-Filter
- Footer mit konfigurierbaren Links

### 1.1.0
- Hilfe-Modal für Lernpartner und Coaches
- Passwort-Reset per E-Mail
- Avatar-Upload

### 1.0.0
- Erstes Release: Kanban-Board, Zeiterfassung, Todos, Rollen
