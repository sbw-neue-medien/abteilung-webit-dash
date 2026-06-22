# webIT Abteilungs-Dashboard — Frontend

Vue 3 Single-Page Application für die Verwaltung der webIT-Abteilung.

**Version:** 1.9.8
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
│   ├── LearnerCard.vue
│   ├── ProjectForm.vue
│   ├── ConfirmButton.vue
│   ├── NotificationBell.vue
│   ├── ProjectPermissionsPanel.vue
│   ├── SideBar.vue
│   ├── SprintPanel.vue
│   ├── StatusBadge.vue
│   ├── TimeEntryForm.vue
│   ├── TodoList.vue
│   ├── ToastContainer.vue
│   ├── TopBar.vue
│   ├── UserAvatar.vue
│   ├── UserForm.vue
│   └── UserPermissionsModal.vue
├── stores/       # Pinia Stores
│   ├── auth.js
│   ├── notifications.js
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
│   ├── RolesView.vue
│   ├── SprintsView.vue
│   ├── TimeEntryView.vue
│   └── WerkstattView.vue
├── composables/  # Wiederverwendbare Composition-Funktionen
│   ├── useDarkMode.js
│   ├── useNavLinks.js
│   └── useToast.js
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
| `/projekte/:id` | Projektdetail (Kanban + Sprints + Todos + Projektberechtigungen) | alle |
| `/zeiterfassung` | Zeiterfassung | alle |
| `/mein-bereich` | Eigenes Profil & Stunden | alle |
| `/sprints` | Sprint-Verwaltung | `sprints.manage` |
| `/lernende` | Lernpartner verwalten | `users.list` |
| `/mentoren` | Coaches verwalten + Zuweisung | `mentors.manage` |
| `/werkstatt` | Werkstatt-Übersicht | `werkstatt.view` |
| `/rollen` | Berechtigungen (Rollen-Matrix + Projektberechtigungen) | `settings.manage` |

---

## Features

- **Kanban-Board** mit Drag-and-Drop (Offen → In Arbeit → Review → Erledigt)
- **Kanban-Vorlagen** — Projekte als Vorlage speichern; Tasks beim Erstellen übernehmen
- **Sprint-Planung** — wöchentliche Sprints, Filter im Kanban; Serienbuchung über mehrere Sprints
- **Zeiterfassung** — Stunden pro Projekt/Aufgabe erfassen
- **Todos** — Checklisten pro Projekt mit geplantem/effektivem Aufwand (in Sidebar)
- **Eigenprojekte** — persönliche Projekte einem Lernpartner zuordnen
- **Mitglieder-Übersicht** — Lernpartner-Chips in der Projektliste, Mitgliederliste im Projektdetail
- **Berechtigungssystem** — granulare, dreistufige Rechteverwaltung:
  - `auth.can('x.y')` — pruft server-seitige effektive Berechtigungen
  - **Rollen-Matrix** (`/rollen`) — globale Berechtigungen pro Rolle konfigurieren
  - **Per-User-Overrides** — individuelle Rechte-Grants oder -Entzüge pro Benutzer (in Lernpartner-Verwaltung)
  - **Projektspezifische Grants** — Lernpartner für einzelne Projekte mit erweiterten Rechten ausstatten (Projektleiter-Muster)
- **Passwort-Reset** — per E-Mail anfordern und setzen
- **Avatar-Upload** — Profilbild pro Benutzer
- **E-Mail-Benachrichtigungen** — bei Review-Aufgaben (Leiter), bei Projekterstellung (Leiter + Mitglieder), bei Aufgabenzuweisung (Assignee), bei Eigenprojekt-Erstellung (Leiter + zugewiesene Coaches)
- **Lernpartner deaktivieren** — kein Login, aus Auswahllisten ausgeblendet, Eigenprojekte pausiert
- **Werkstatt-Übersicht** — Projekte, Sprint-Tasks, Stunden pro Lernpartner
- **Dark Mode** — System-/manuelles Umschalten
- **Todos** — Checklisten pro Projekt in der linken Sidebar (sichtbar auf `/projekte/:id`)
- **Benachrichtigungsglocke** — gruppierende Event-Feed in der TopBar (ein Eintrag pro Ereignis via `correlation_id`)
- **Toast-Benachrichtigungen** — nicht-blockierende Erfolgs-/Fehlermeldungen statt `alert()`
- **Inline-Bestätigung** — `ConfirmButton` ersetzt `window.confirm()` bei allen Lösch-Aktionen
- **Footer-Links** — konfigurierbar durch Leiter

---

## Lokale Entwicklung

```bash
npm install
npm run dev          # http://localhost:5173 (proxied an Backend)
npm run debug        # Backend auf Port 9080
npm run build        # Produktions-Build nach dist/
```

---

## Konventionen

- Alle Dauer-Werte in **Minuten** (z.B. 120 = 2h)
- API-Calls ausschliesslich über `src/api/index.js`
- Jeder Datensatz-Typ hat einen eigenen Pinia-Store in `src/stores/`
- Keine TypeScript — plain JavaScript
- Tailwind-Tokens: `text-hi`, `text-mid`, `text-lo`, `bg-surface`, `bg-lift`, `ring-line`, `border-groove`, `text-brand-*`
- Berechtigungsprüfungen im Template: `v-if="auth.can('x.y')"` — nie `auth.isLeiter` für Feature-Gates
- Logout via `window.location.href` — erzwingt Pinia-Store-Reset

---

## Changelog

### 1.9.8
- **CSV-Export für Zeiterfassung** (`TimeEntryView.vue`) — exportiert die aktuell gefilterten Einträge als Excel-kompatible CSV (Semikolon-getrennt, UTF-8-BOM); Dateiname enthält bei aktivem Lernpartner-Filter dessen Namen
- **`ProjectCard`-Komponente** — Projekt- und Vorlagenkarten in `ProjectsView.vue` waren als zwei fast identische Markup-Blöcke dupliziert; jetzt eine gemeinsame Komponente mit `is-template`/`can-edit`-Props
- **Aktueller Sprint im Filter hervorgehoben** (`ProjectDetailView.vue`) — der heute aktive Sprint erhält einen Ring-Indikator im Sprint-Filter, unabhängig von der aktuellen Auswahl; `currentSprintId` von einer Funktion zu einem reaktiven `computed` gemacht

### 1.9.7
- **Projekt-Team kontaktieren** — Leiter können mit einem Klick eine E-Mail an alle Projektmitglieder senden (vorausgefüllter Betreff und Anrede)
- **Zeiterfassung: Sprint-Perioden-Selektor** — derselbe Perioden-Selektor wie in der Werkstatt-Ansicht: direkte Sprint-Navigation oder freier Datumsbereich
- **Zeiterfassung: Projektlink** — der Projektname in der Zeiterfassungstabelle verlinkt direkt auf die Projektdetailansicht
- **Zeiterfassung: Stabile Spaltenbreiten** — Spaltenbreiten ändern sich nicht mehr mit dem Inhalt der Einträge
- **Zeiterfassung: Schnelleintrag** — neuer «+»-Button in der Kopfzeile für schnelle Neueingaben

### 1.9.6
- **Lead-Time-Ansicht** — Leiter und Coaches sehen die verbuchte Brutto-Arbeitszeit pro Lernpartner im gewählten Zeitraum als farbigen Fortschrittsbalken; Coaches sehen nur ihre zugeordneten Lernpartner
- **Kanban-Navigation in der Kopfzeile** — Vor/Zurück-Pfeile in einer festen Kopfzeile direkt neben den Spalten-Labels, die beim Scrollen sichtbar bleiben
- **Einklappbare Projektbeschreibung** — lange Beschreibungen in der Projektdetailansicht sind standardmässig eingeklappt

### 1.9.5
- **Mentor-Auswahl für Projekte** — Projekte können einem Coach direkt zugewiesen werden (api#55)
- **Kanban Pfeil-Navigation mit Snap-Scroll** — ersetzt die Scrollbar durch Pfeil-Buttons mit Snap-Verhalten (#82)
- **Kanban öffnet automatisch im aktuellen Sprint** (#84)
- **Persistenter «Eigenprojekte»-Filter** — Auswahl wird in `localStorage` gespeichert (#85, #86)
- **Zeiterfassung: horizontales Scrollen statt Abschneiden** der Tabelle (#89)
- **Mehrspaltige Markdown-Darstellung** für breite Container
- Diverse Layout-Fixes (Footer, TimeEntryForm)

### 1.9.4
- **Confirm-Button-Overflow-Fix** — Bestätigungs-Popup überlappte den Bildschirmrand bei Lösch-Buttons nahe der rechten Kante (#76)
- **Todo-Priorität statt Dauer** — Todos verwenden jetzt eine 1–5-Priorität statt einer geplanten Dauer (#78)

### 1.9.3
- **Zoom-Modal für Aufgaben** — schreibgeschütztes Vergrösserungs-Modal für Kanban-Karten (#74)

### 1.9.2
- **Bugfix: Aufgabe leer im Zeiterfassungs-Bearbeiten-Formular** — beim Öffnen eines Eintrags blieb das Aufgaben-Feld leer, weil der Projekt-Watcher noch nicht registriert war, als die sofortige Entry-Watch-Initialisierung das Projekt setzte; Reihenfolge der `watch`-Aufrufe getauscht

### 1.9.1
- **RSS-Feed-Link** — Leiter sehen im Benachrichtigungs-Dropdown einen «RSS»-Link, der die Feed-URL im neuen Tab öffnet (kompatibel mit MS Teams und RSS-Lesern wie Vivaldi)

### 1.9.0
- **Benachrichtigungsglocke** (`NotificationBell.vue`) — gruppierter Event-Feed in der TopBar; ein Eintrag pro Ereignis (via `correlation_id`); unseen-Badge (localStorage); relative Zeitangaben
- **Toast-System** (`useToast`, `ToastContainer`) — ersetzt alle `alert()`-Aufrufe; rot für Fehler, grün für Erfolg, neutral für Info; auto-dismiss nach 4 s
- **`ConfirmButton`** — ersetzt alle `window.confirm()`-Dialoge; zweistufiger Inline-Button mit auto-reset nach 3 s
- **TodoList in Sidebar** — erscheint als unterer Abschnitt der linken Sidebar auf `/projekte/:id`; Sidebar wird auf `w-72` verbreitert; rechte Kanban-Spalte entfernt
- **Aktivieren/Deaktivieren via Toast** — `confirm()` entfernt, Feedback via Toast
- **Passwort-Reset via Toast** — `confirm()` vor dem Senden entfernt, Feedback via Toast
- **Schweizer Anführungszeichen** — `„"` durch `«»` ersetzt
- Neue Pinia-Store: `notifications.js`
- Neue Composable: `useToast.js`

### 1.8.0
- **Eigenprojekt-Beschreibung bearbeiten** — Lernpartner können die Beschreibung ihres Eigenprojekts selbst bearbeiten (Markdown); alle anderen Felder bleiben Leiter-only
- **Coach: Mein Bereich** — Coaches haben jetzt Zugriff auf «Mein Bereich» und können Passwort und E-Mail-Benachrichtigungen selbst verwalten
- **E-Mail bei Eigenprojekt-Erstellung** — Leiter und zugewiesene Coaches werden benachrichtigt, wenn ein Lernpartner ein neues Eigenprojekt anlegt
- **MailTemplate-System** — zentrales Template-System für alle E-Mails (`MailTemplate::render(name, vars)`); Wording und Struktur an einer Stelle änderbar
- **Markdown-Links** — Links in `MarkdownRenderer` werden in der Brandfarbe und fett dargestellt
- **Farb-Token-System** — alle Farbwerte zentralisiert in CSS-Variablen (`src/style.css`); `tailwind.config.js` referenziert nur noch Variablen, keine Hex-Werte

### 1.7.0
- **Berechtigungssystem UI** — `auth.can()` nutzt server-seitige effektive Permissions statt lokaler Rollenkarte
- **Rollen-Matrix** (`/rollen`, neu: `RolesView.vue`) — Leiter konfiguriert Berechtigungen pro Rolle als Checkbox-Matrix; Abschnitt "Projektberechtigungen" mit Projekt-Selektor integriert
- **Per-User-Overrides** (`UserPermissionsModal.vue`) — individuelle Berechtigungs-Grants oder -Entzüge direkt in der Lernpartner-Verwaltung
- **Projektspezifische Grants** (`ProjectPermissionsPanel.vue`) — Leiter erteilt einem Lernpartner für ein einzelnes Projekt erweiterte Rechte (z.B. `tasks.create`, `projects.update`)
- **Mitglieder-Chips** in der Projektübersicht — zeigt zugewiesene Lernpartner direkt auf der Projektkarte
- **Bugfix:** Mitglieder-Chips fehlten beim ersten Laden nach dem Anmelden (Dashboard lädt Users jetzt vor)
- **Bugfix:** Mitgliederliste im Bearbeiten-Formular war leer (nutzt nun `member_ids` aus der Liste wenn `members` fehlt)
- Router-Guards nutzen `meta: { permission }` + `auth.can()` statt `leiter`/`leiterOrMentor`-Flags

### 1.6.0
- Dashboard-Layout: kollabierbare Sidebar-Navigation ersetzt die Top-Navigationsbar
- Sidebar: Icon + Label (expanded) / nur Icon mit Tooltip (collapsed), Zustand in localStorage
- TopBar: Logo, Werkstatt-Link (Leiter), Dark-Mode, Hilfe, Username, Logout
- Mobile: Icon-Only Bottom-Navigation statt Sidebar
- `useNavLinks.js`: geteiltes Composable für Sidebar und Bottom-Nav

### 1.5.3
- Lernpartner deaktivieren: Aktiv-Checkbox pro Lernpartner
- Inaktive: kein Login, aus Auswahllisten ausgeblendet, Eigenprojekte pausiert
- Dashboard, Werkstatt: inaktive Lernpartner ausgeblendet

### 1.5.0
- E-Mail-Benachrichtigungen: Toggle im Leiter-Profil bei Review-Aufgaben
- Kanban zentriert, TodoList als rechte Sidebar
- Terminologie: Mentor → Coach, Lernende → Lernpartner (nur Labels)

### 1.4.0
- Kanban-Vorlagen: als Vorlage speichern, Tasks beim Erstellen übernehmen

### 1.3.0
- Coach-Rolle: read-only Zugriff, Coach-Zuweisung durch Leiter

### 1.2.0
- Sprint-Planung mit Kanban-Filter, Footer-Links

### 1.1.0
- Hilfe-Modal, Passwort-Reset per E-Mail, Avatar-Upload

### 1.0.0
- Erstes Release: Kanban-Board, Zeiterfassung, Todos, Rollen
