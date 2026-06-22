---
title: "webIT Abteilungs-Dashboard"
subtitle: "Management Summary"
date: "Juni 2026"
version: "1.9.8"
lang: de
geometry: margin=2.5cm
fontsize: 11pt
mainfont: "DejaVu Serif"
sansfont: "DejaVu Sans"
colorlinks: true
---

# Stand der Anwendung — Version 1.9.8

## Worum geht es?

Das webIT Abteilungs-Dashboard ist eine interne Webanwendung zur Verwaltung der Abteilungsarbeit. Es ermöglicht Lernenden, Leitern und Coaches, Projekte, Aufgaben und Arbeitszeiten strukturiert zu erfassen und einzusehen — alles an einem Ort, ohne externe Tools.

## Wer nutzt die Anwendung?

| Rolle | Zugang |
|---|---|
| **Leiter** | Vollzugriff — verwaltet Benutzer, Projekte, Sprints, Coaches und Berechtigungen |
| **Lernpartner** | Sieht eigene und zugewiesene Projekte, erfasst seine Arbeitszeiten |
| **Coach** | Lesezugriff auf die Daten der zugewiesenen Lernpartner inkl. Lead-Time-Ansicht, kein Schreibzugriff |

## Was kann die Anwendung?

- **Projektverwaltung** — Projekte anlegen, Lernpartner zuweisen, Status verfolgen (Geplant / Aktiv / Pausiert / Abgeschlossen)
- **Kanban-Board** — Aufgaben visuell in vier Phasen verwalten: Offen → In Arbeit → Review → Erledigt
- **Kanban-Vorlagen** — Wiederkehrende Projektstrukturen einmalig als Vorlage speichern und beim Erstellen neuer Projekte automatisch übernehmen
- **Serienbuchung** — Wiederkehrende Aufgaben über mehrere Sprints hinweg mit wenigen Klicks anlegen
- **Sprint-Planung** — Wöchentliche Arbeitspakete pro Projekt definieren und im Kanban filtern
- **Zeiterfassung** — Arbeitszeiten pro Projekt und Aufgabe erfassen; Auswertung nach Lernpartner
- **Todo-Listen** — Einfache Checklisten pro Projekt mit geplantem und tatsächlichem Aufwand
- **Eigenprojekte** — Persönliche Projekte einem Lernpartner zuordnen
- **Werkstatt-Übersicht** — Tabellarische Übersicht pro Lernpartner: aktive Projekte, Sprint-Tasks, Stunden
- **Benutzerverwaltung** — Konten anlegen, Passwörter zurücksetzen, Profilbilder hochladen, Lernpartner deaktivieren
- **Coach-System** — Coaches werden Lernpartner zugewiesen und erhalten automatisch Lesezugriff

### Neu in Version 1.7.0: Granulares Berechtigungssystem

Die Rechteverwaltung wurde grundlegend modernisiert und bietet jetzt drei Stufen:

| Stufe | Beschreibung |
|---|---|
| **Rollen-Berechtigungen** | Standardrechte pro Rolle (Leiter, Lernpartner, Coach) — konfigurierbar ohne Codeänderung |
| **Individuelle Overrides** | Einzelne Berechtigungen können pro Benutzer gewährt oder entzogen werden |
| **Projektspezifische Grants** | Einem Lernpartner können für ein bestimmtes Projekt erweiterte Rechte erteilt werden — z.B. als Projektleiter |

Damit ist es möglich, einen Lernpartner als **Projektleiter** für ein bestimmtes Projekt einzusetzen: Er erhält für dieses Projekt Schreibrechte auf Aufgaben und Mitgliederverwaltung, ohne global erweiterte Rechte zu erhalten.

### Neu in Version 1.7.0: E-Mail-Benachrichtigungen

| Ereignis | Empfänger |
|---|---|
| Projekt erstellt | Alle Leiter + zugewiesene Mitglieder |
| Eigenprojekt erstellt | Alle Leiter + zugewiesene Coaches + Lernpartner selbst |
| Aufgabe zur Review verschoben | Alle Leiter |
| Aufgabe zugewiesen | Der zugewiesene Lernpartner |

### Neu in Version 1.8.0

- **Eigenprojekt-Beschreibung** — Lernpartner können die Beschreibung ihres persönlichen Projekts selbst bearbeiten
- **Coach: Mein Bereich** — Coaches können ihr Passwort und ihre E-Mail-Benachrichtigungen selbst verwalten
- **Erweiterte E-Mail-Benachrichtigungen** — Leiter und Coaches werden bei neuen Eigenprojekten benachrichtigt

### Neu in Version 1.9.6

- **Lead-Time-Ansicht** — Leiter und Coaches sehen auf einen Blick, wie viel Prozent der verfügbaren Brutto-Arbeitszeit jeder Lernpartner im gewählten Zeitraum verbucht hat. Coaches sehen dabei nur ihre zugeordneten Lernpartner. Ein farbiger Fortschrittsbalken (grün ≥ 80 %, gelb ≥ 50 %, rot < 50 %) ermöglicht eine schnelle Einschätzung der Auslastung. Der Zeitraum wird über einen flexiblen Perioden-Selektor (Woche / Monat / Quartal / benutzerdefiniert) gesteuert. Die verfügbare Bruttozeit wird automatisch aus den Werktagen und der täglichen Netto-Betriebszeit (225 min) berechnet.

### Neu in Version 1.9.6

- **Kanban-Navigation in der Kopfzeile** — Die Vor/Zurück-Pfeile wurden in eine feste Kopfzeile direkt neben die Spalten-Labels (Offen · In Arbeit · Review · Erledigt) verschoben. Die Labels bleiben beim Scrollen immer sichtbar und scrollen synchron mit dem Karten-Bereich mit.
- **Einklappbare Projektbeschreibung** — Lange Beschreibungen in der Projektdetailansicht sind standardmässig eingeklappt (erste Zeile sichtbar) und können per Klick aufgeklappt werden. Das hält den Kanban-Bereich beim Öffnen eines Projekts im Blickfeld.

### Neu in Version 1.9.7

- **Projekt-Team kontaktieren** — Leiter können mit einem Klick eine E-Mail an alle Projektmitglieder senden. Das Standard-E-Mail-Programm öffnet sich mit vorausgefülltem Betreff («Projektname -») und Anrede («Liebes Projekt-Team»).
- **Zeiterfassung: Sprint-Perioden-Selektor** — Die Zeiterfassung verwendet denselben Perioden-Selektor wie die Werkstatt-Ansicht: Direkte Sprint-Navigation oder freier Datumsbereich wählbar.
- **Zeiterfassung: Projektlink** — Der Projektname in der Zeiterfassungstabelle ist ein direkter Link zur Projektdetailansicht.
- **Zeiterfassung: Stabile Spaltenbreiten** — Die Spaltenbreiten in der Zeiterfassungstabelle ändern sich nicht mehr mit dem Inhalt der Einträge.
- **Zeiterfassung: Schnelleintrag** — Neuer «+»-Button in der Kopfzeile der Zeiterfassung für schnelle Neueingaben.

### Neu in Version 1.9.8

- **CSV-Export für Zeiterfassung** — Einträge der aktuell gefilterten Ansicht lassen sich als CSV-Datei herunterladen (Excel-kompatibel); ist ein Lernpartner ausgewählt, erscheint dessen Name im Dateinamen
- **Aktueller Sprint im Filter hervorgehoben** — In der Projektdetailansicht markiert ein farbiger Ring den Sprint, der heute aktiv ist, unabhängig davon, welcher Sprint gerade ausgewählt ist

## Aktueller Stand

Die Anwendung ist produktiv im Einsatz. Version 1.9.8 wurde im Juni 2026 veröffentlicht.

**Produktions-Hinweis:** Beim Deployment einer neuen Version müssen Datenbank-Migrationen manuell auf dem Plesk-Server eingespielt werden, bevor der Code aktiviert wird.
