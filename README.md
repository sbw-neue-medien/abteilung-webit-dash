# webIT Abteilungs-Dashboard — Frontend

Vue 3 Single-Page Application für die Verwaltung der webIT-Abteilung.

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
│   ├── KanbanBoard.vue
│   ├── KanbanCard.vue
│   ├── MentorForm.vue
│   ├── SprintPanel.vue
│   ├── TodoList.vue
│   ├── ProjectForm.vue
│   └── Modal.vue
├── stores/       # Pinia Stores
│   ├── auth.js
│   ├── projects.js
│   ├── tasks.js
│   ├── sprints.js
│   ├── timeEntries.js
│   ├── todos.js
│   └── users.js
├── views/        # Seiten-Komponenten (eine pro Route)
│   ├── LoginView.vue
│   ├── DashboardView.vue
│   ├── ProjectsView.vue
│   ├── ProjectDetailView.vue
│   ├── TimeEntryView.vue
│   ├── LearnersView.vue
│   ├── MentorsView.vue
│   └── MyAreaView.vue
└── router/       # Route-Definitionen
```

---

## Routen

| Pfad | Seite | Zugang |
|---|---|---|
| `/login` | Login | öffentlich |
| `/` | Dashboard | alle |
| `/projekte` | Projektübersicht | alle |
| `/projekte/:id` | Projektdetail (Kanban + Sprints + Todos) | alle |
| `/zeiterfassung` | Zeiterfassung | alle |
| `/lernende` | Lernende verwalten | Leiter (voll), Mentor (read-only) |
| `/mentoren` | Mentoren verwalten + Zuweisung | nur Leiter |
| `/mein-bereich` | Eigenes Profil & Stunden | Leiter, Lernender |

---

## Features

- **Kanban-Board** mit Drag-and-Drop (Offen → In Arbeit → Review → Erledigt)
- **Sprint-Planung** — wöchentliche Sprints pro Projekt, Filter im Kanban
- **Zeiterfassung** — Stunden pro Projekt/Aufgabe erfassen
- **Todos** — einfache Aufgabenliste mit geplantem/effektivem Aufwand
- **Eigenprojekte** — persönliche Projekte einem Lernenden zuordnen
- **Rollen** — drei Rollen mit abgestuftem Zugriff:
  - **Leiter** — Vollzugriff, verwaltet Benutzer, Projekte, Sprints und Mentoren
  - **Lernender** — sieht eigene/zugewiesene Projekte und eigene Zeiterfassung
  - **Mentor** — read-only Zugriff auf Daten der zugewiesenen Lernenden; kein Schreibzugriff

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
- Tailwind-Tokens: `text-hi`, `text-mid`, `text-lo`, `bg-surface`, `bg-lift`, `ring-line`, `text-brand-*`
