---
title: "webIT Abteilungs-Dashboard"
subtitle: "Management Summary"
date: "Mai 2026"
lang: de
geometry: margin=2.5cm
fontsize: 11pt
mainfont: "DejaVu Serif"
sansfont: "DejaVu Sans"
colorlinks: true
---

# Stand der Anwendung — Version 1.4.0

## Worum geht es?

Das webIT Abteilungs-Dashboard ist eine interne Webanwendung zur Verwaltung der Abteilungsarbeit. Es ermöglicht Lernenden, Leitern und Mentoren, Projekte, Aufgaben und Arbeitszeiten strukturiert zu erfassen und einzusehen — alles an einem Ort, ohne externe Tools.

## Wer nutzt die Anwendung?

| Rolle | Zugang |
|---|---|
| **Leiter** | Vollzugriff — verwaltet Benutzer, Projekte, Sprints und Mentoren |
| **Lernender** | Sieht eigene und zugewiesene Projekte, erfasst seine Arbeitszeiten |
| **Mentor** | Lesezugriff auf die Daten der zugewiesenen Lernenden, kein Schreibzugriff |

## Was kann die Anwendung?

- **Projektverwaltung** — Projekte anlegen, Lernende zuweisen, Status verfolgen (Geplant / Aktiv / Pausiert / Abgeschlossen)
- **Kanban-Board** — Aufgaben visuell in vier Phasen verwalten: Offen → In Arbeit → Review → Erledigt
- **Kanban-Vorlagen** — Wiederkehrende Projektstrukturen einmalig als Vorlage speichern und beim Erstellen neuer Projekte automatisch übernehmen *(neu in 1.4.0)*
- **Sprint-Planung** — Wöchentliche Arbeitspakete pro Projekt definieren und im Kanban filtern
- **Zeiterfassung** — Arbeitszeiten pro Projekt und Aufgabe erfassen; Auswertung nach Lernenden
- **Todo-Listen** — Einfache Checklisten pro Projekt mit geplantem und tatsächlichem Aufwand
- **Mentoren-System** — Mentoren werden Lernenden zugewiesen und erhalten automatisch Lesezugriff auf deren Projekte und Zeiten
- **Benutzerverwaltung** — Konten anlegen, Passwörter zurücksetzen, Profilbilder hochladen

## Aktueller Stand

Die Anwendung ist produktiv im Einsatz. Version 1.4.0 wurde im Mai 2026 veröffentlicht. Aktuell in Vorbereitung: eine Verbesserung der Anmeldesicherheit, durch die Sitzungen automatisch verlängert werden solange die App aktiv genutzt wird.
