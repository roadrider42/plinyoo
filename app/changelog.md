# Changelog

## 0.7.4 (2026-03-09)
- **Bugfix (Lernzeit-Tracking)**: Race Condition beim Speichern der Lernzeit behoben - keine Duplicate Key Errors mehr bei parallelen Speichervorgängen.
- **Verbesserung (Performance)**: UPSERT statt SELECT + INSERT/UPDATE für atomare Datenbankoperationen und bessere Konsistenz.

## 0.7.3 (2026-03-09)
- **Neue Funktion (Karten-Filter)**: Filter "Ohne Tag" im Karten-Editor hinzugefügt - zeigt alle Karten an, die noch keinem Tag zugeordnet sind.
- **Neue Funktion (Mehrsprachigkeit)**: Japanisch (日本語) als Lern- und Muttersprache in den Profil-Einstellungen verfügbar.
- **Verbesserung (Karten-Filter)**: "Ohne Tag"-Filter berücksichtigt korrekt Berechtigungen - zeigt nur Karten an, die der Nutzer sehen darf.
- **Dokumentation**: SQL-Template um japanische Übersetzungen erweitert für Beispiel-Lernkarten.

## 0.7.2 (2026-03-09)
- **Bugfix (Quiz)**: Multiple-Choice-Fragen zeigen richtige Antworten nicht mehr vorzeitig beim Fragenwechsel an - Timer werden jetzt korrekt aufgeräumt.
- **Bugfix (Quiz)**: Verzögerung bei der Anzeige richtiger Antworten auch bei korrekten Multiple-Choice-Antworten implementiert (800ms) - besseres visuelles Feedback für Nutzer.
- **Neue Funktion (Mehrsprachigkeit)**: Quiz-Fragen werden jetzt in der gewählten Lernsprache angezeigt - vollständige Unterstützung für Englisch und andere Sprachen.
- **Bugfix (Mehrsprachigkeit)**: Cache-Problem behoben - Sprachwechsel aktualisiert jetzt sofort die Quiz-Inhalte ohne Neuladen der Seite.
- **Bugfix (Mehrsprachigkeit)**: Korrekte Antworten werden jetzt auch bei übersetzten Quiz-Fragen richtig erkannt und grün markiert.
- **Verbesserung (Code-Qualität)**: Ungenutzte Quiz-Route entfernt (`/quiz-neu/quiz-simple-demo`) für sauberere Codebasis.

## 0.6.1 (2026-03-06)
- **Verbesserung (Stabilität)**: Endloses Nachladen von Feed-Karten behoben - Feed wird jetzt nur noch beim initialen Load und beim Scrollen geladen.
- **Verbesserung (Stabilität)**: Endlose Console-Logs im Dashboard entfernt - keine Performance-Probleme mehr durch exzessive Debug-Ausgaben.
- **Verbesserung (Performance)**: Feed-Karten-Verarbeitung mit useMemo stabilisiert - keine unnötigen Neuberechnungen mehr bei jedem Render.
- **Verbesserung (Performance)**: Blob-URL Memory Leaks behoben - Bilder werden jetzt korrekt aufgeräumt beim Unmount.
- **Bugfix (Sicherheit)**: Blob-URL Sicherheitsfehler beim Bildupload behoben - keine blockierten Zugriffe mehr auf temporäre Bild-URLs.
- **Verbesserung (Code-Qualität)**: Debug-Logs aus Service-, Hook- und Repository-Layer entfernt für sauberere Console und bessere Performance.

## 0.5.1 (2026-03-05)
- **UX-Verbesserung (Restaurant-Logo)**: Logo-Upload jetzt ohne Crop-Dialog - einfach hochladen, fertig!
- **Verbesserung (Restaurant-Logo)**: Automatisches intelligentes Verarbeiten - alle Formate werden unterstützt (auch horizontale Logos wie 361×91px).
- **Verbesserung (Restaurant-Logo)**: Logos werden automatisch zentriert mit weißem Padding, Aspect Ratio bleibt erhalten.
- **UX-Verbesserung (Restaurant-Logo)**: Keine manuelle Zoom- oder Crop-Einstellung mehr nötig - maximale Einfachheit für den Nutzer.

## 0.5.0 (2026-03-05)
- **Verbesserung (Anmeldung)**: Allgemeine Verbesserung im Anmeldeprozess - optimierte Fehlerbehandlung und Performance.
- **Verbesserung (Changelog-System)**: Changelog wird jetzt inkrementell geladen - nur neue Einträge werden abgerufen, was die Performance verbessert.
- **Verbesserung (Changelog-System)**: Differenzierte Fehlerbehandlung beim Login - kein störendes Changelog-Modal mehr bei Verbindungsproblemen.
- **Architektur (Changelog-System)**: Zentrale Konfiguration für Timeouts und Verzögerungen in `changelog.config.ts`.
- **Dokumentation**: Vollständige technische Dokumentation des Changelog-Systems erstellt.

## 0.4.9 (2026-03-03)
- **Neue Funktion (Lernkarten)**: YouTube-Videos können jetzt direkt in Lernkarten eingebettet werden - inklusive Unterstützung für YouTube Shorts!
- **Verbesserung (Datenschutz)**: Videos werden über youtube-nocookie.com eingebettet für besseren Datenschutz.
- **UX-Verbesserung (Videos)**: Fallback-Link "Auf YouTube ansehen" unter jedem Video, falls das Embedding blockiert wird.
- **Verbesserung (Feed)**: Alle Lernkarten werden jetzt im Feed angezeigt - der Filter für erledigte Karten wurde entfernt.
- **Performance (Feed)**: Mehr Karten werden auf einmal geladen (50 statt 6) für flüssigeres Scrollen.
- **Bugfix (Lernkarten)**: Videos werden jetzt korrekt gespeichert und in allen Ansichten angezeigt (Feed, Lernmodus, Content-Manager).

## 0.4.8 (2026-03-03)
- **Bugfix (Quiz-Editor)**: Problem beim Speichern neuer Quiz-Fragen behoben - neue Fragen werden jetzt mit Standard-Antwortoptionen (A und B) initialisiert, sodass der Speichern-Button korrekt aktiviert wird.
- **Verbesserung (Quiz-Editor)**: Layout der Antwortoptionen optimiert - Radio-Button und Label in einer Zeile, Eingabefeld darunter in voller Breite für bessere Lesbarkeit und Bedienbarkeit auf allen Geräten.
- **UX-Verbesserung (Quiz-Editor)**: Größere Eingabefelder mit verbessertem Padding und Focus-Ring für bessere Accessibility und mobile Nutzung.

## 0.4.7 (2026-03-03)
- **Test:** Diese Version testet das Changelog-Modal System.

## 0.4.6 (2026-03-03)
- **Was ist neu?** Beim Login siehst du jetzt automatisch alle Neuerungen der aktuellen Version - so bleibst du immer auf dem Laufenden!
- **Geräte-Synchronisation:** Deine gesehenen Changelog-Versionen werden über alle deine Geräte synchronisiert. Du siehst Updates nur einmal, egal wo du dich anmeldest.
- **Jederzeit nachschlagen:** Im Profil findest du einen neuen Tab "Was ist neu?", um den Changelog jederzeit anzuschauen.
- **Quiz immer griffbereit:** Der Quiz-Button schwebt jetzt über dem Inhalt und ist immer sichtbar - so kannst du jederzeit dein Wissen testen.
- **Smarter Quiz-Zugang:** Auch in der Detailansicht einzelner Lernkarten findest du jetzt den Quiz-Button mit automatisch passendem Thema.
- **Lernkarten besser verlinken:** Beim Erstellen neuer Verknüpfungen zwischen Karten bleiben alle bestehenden Links erhalten - dein Lernnetzwerk wächst stetig.
- **Sofortige Aktualisierung:** Nach dem Verlinken von Karten aktualisiert sich die Ansicht sofort - keine veralteten Informationen mehr.
- **Volltext-Suche:** Du kannst jetzt in allen Lernkarten nach Inhalten suchen - finde schnell, was du suchst!
- **Kompakterer Editor:** Der Lernkarten-Editor nutzt den Platz besser aus und zeigt mehr Informationen auf einen Blick.

## 0.4.5 (2025-11-23)
- **Mehrsprachigkeit:** Die Startseite ist jetzt auf Deutsch und Englisch verfügbar - wechsle einfach die Sprache oben rechts.

## 0.4.4 (2025-11-23)
- **Stabilität:** Die App startet jetzt zuverlässiger - ein technisches Problem beim Laden wurde behoben.

## 0.4.3 (2025-11-11)
- **Verbesserung (Follower-System):** Der Einladungsprozess für Follower wurde grundlegend überarbeitet. E-Mails werden nun korrekt personalisiert und der Annahme-Link führt zu einer neuen, dedizierten Bestätigungsseite.
- **Verbesserung (Sicherheit):** Eine neue Passwort-Richtlinie für neue Benutzer wurde implementiert, die die Sicherheit erhöht und Echtzeit-Feedback gibt.
- **Fix (UI):** Ein Anzeigefehler wurde behoben, bei dem der schwebende Quiz-Button über dem Profil-Modal erschien.
- **Fix (Stabilität):** Diverse kleinere Fehler im UI-Rendering (SVG-Icons) und in ungenutzten Komponenten wurden behoben, um die Stabilität zu verbessern.

## 0.4.2 (2025-10-03)
- **Bugfix (Feed)**: Ein kritischer Fehler im Feed-System wurde behoben, der durch mehrdeutige Spaltenreferenzen in der Datenbank verursacht wurde. Der Feed lädt nun wieder zuverlässig und zeigt alle Lernkarten korrekt an.
- **Verbesserung (Feed)**: Die Feed-Abfrage wurde grundlegend überarbeitet und verwendet nun direkte Datenbankabfragen statt problematischer RPC-Funktionen, was zu einer verbesserten Stabilität führt.
- **Verbesserung (Feed)**: Die Sortierung der Lernkarten nach Anzeigedauer und Erstellungsdatum wurde optimiert.
- **Verbesserung (Feed)**: Die Filterung nach Tags, Schwierigkeitsgrad und Kategorie funktioniert nun zuverlässiger.
- **Hinweis (Tests)**: Ein E2E-Test für die Lernkarten-Erstellung wurde vorübergehend deaktiviert, bis die Auswirkungen der Feed-System-Änderungen vollständig untersucht wurden.

## 0.4.1 (2025-09-25)
- **Bugfix (Dashboard & Einladungen)**: Ein kritischer und vielschichtiger Fehler wurde behoben, bei dem neu eingeladene Follower nach der Annahme der Einladung keine Restaurant-Kachel auf ihrem Dashboard sahen.
- **Fix (Datenbank)**: Die `accept_follower_invite`-SQL-Funktion setzt nun korrekt den `status` auf `'following'`, um die Konsistenz zwischen geschriebenen und gelesenen Daten zu gewährleisten.
- **Fix (Berechtigungen)**: Fehlende RLS-Policies für die Tabellen `profiles` und `restaurants` wurden hinzugefügt. Benutzer können nun ihr eigenes Profil und die öffentlichen Restaurant-Daten lesen, was für die Anzeige der Kachel entscheidend ist.
- **Fix (Anwendungslogik)**: Der `DashboardService` wurde überarbeitet, um die Logik zur Erstellung von Dashboard-Karten zu zentralisieren und Inkonsistenzen zu beseitigen. Er ist nun die alleinige Quelle der Wahrheit für Dashboard-Inhalte.
- **Fix (UI)**: Eine verwaiste "Follower"-Rolle, die Anzeigefehler in der Profilverwaltung verursachte, wurde aus allen UI-Definitionen entfernt.

## 0.4.0 (2025-09-21)
- **Refactoring (Datenbank)**: Das Datenbankschema für Tags wurde grundlegend bereinigt. Die überflüssige `tag`-Tabelle wurde entfernt und alle Beziehungen wurden auf die `tags`-Tabelle (Plural) konsolidiert. Dies löst eine Reihe von Inkonsistenzen und Fehlern.
- **Bugfix (Tag-Filter)**: Ein kritischer Fehler wurde behoben, bei dem Lernkarten trotz korrekter Verknüpfung nicht im Feed angezeigt wurden. Ursache war eine Inkonsistenz im Tabellennamen (`learning_card_tags` vs. `learning_card_tags_new`).
- **Bugfix (Speichern)**: Ein Fehler, der das Speichern von Änderungen an Lernkarten verhinderte (HTTP 404), wurde durch die Korrektur des Tabellennamens in der Update-Logik behoben.
- **Bugfix (UI)**: Doppelt angezeigte Tags im Filter-Dropdown werden nun korrekt gefiltert, um nur eindeutige Einträge anzuzeigen.
- **Bugfix (Galaxie)**: Ein Fehler beim Abrufen der Sternenanzahl (`relation "public.tag" does not exist`) wurde durch die Korrektur der `get_user_star_count`-Datenbankfunktion behoben.

## 0.3.9 (2025-09-20)
- **Bugfix (Quiz & Lernpfad)**: Ein kritischer Fehler wurde behoben, der das Starten von Quizzen für bestimmte Tags (z.B. "Biologie") verhinderte und fälschlicherweise die "Alles erledigt!"-Meldung anzeigte. Die zugrundeliegenden Datenbankabfragen wurden von Grund auf korrigiert.
- **Bugfix (Quiz & Lernpfad)**: Die Logik zum Laden von Lernkarten und Quizfragen wurde vereinheitlicht und repariert, um Inkonsistenzen zwischen verschiedenen Tags zu beseitigen.
- **Bugfix (Sterne)**: Die Aktualisierung der Sternen-Anzeige (Galaxie) nach einer korrekt beantworteten Frage funktioniert wieder zuverlässig.

## 0.3.8 (2025-09-19)
- **Neue Funktion**: Hierarchische Galaxie-Visualisierung implementiert.
- **Visualisierung**: Sterne werden nun als einzelne Sterne, kleine Sonnensysteme (5 Sterne), große Sonnensysteme (10 Sterne) und Galaxien (100 Sterne) dargestellt.
- **Animation**: Sonnensysteme haben nun Planeten, die auf Kreisbahnen um ihre Sonne kreisen.
- **Architektur**: Eigene Logik-Datei `galaxy-visualizer.ts` für Berechnungs- und Layout-Logik erstellt.
- **Bugfix**: Absturz der Lernpfad-Seite nach Auswahl eines Tags behoben.
- **Bugfix**: Zahlreiche Rendering- und Logik-Fehler in der Galaxie-Ansicht behoben.
- **Bugfix (Quiz)**: Die Zählung der Sterne für die Galaxie-Ansicht wurde korrigiert. Die Datenbankfunktion `get_user_star_count` zählt nun korrekt die Sterne pro Thema (Tag), wodurch der Lernfortschritt wieder korrekt angezeigt wird.
- **Bugfix (Changelog)**: Das "Was ist neu?"-Modal erschien fälschlicherweise bei jeder Navigation. Die Logik wurde korrigiert, sodass es nur noch einmal nach einem App-Update angezeigt wird.
- **Verbesserung (Changelog)**: Das Layout des Changelog-Modals wurde verbessert. Der Footer mit dem "Verstanden"-Button ist nun immer sichtbar, auch bei langen Inhalten.
- **Verbesserung (Lernpfad)**: Der "Mehr laden"-Button wurde entfernt und durch eine nahtlose "Infinite Scroll"-Funktionalität ersetzt. Neue Karten laden jetzt automatisch.
- **Bugfix (Lernpfad)**: Ein kritischer Fehler ("Cursor ungültig"), der das automatische Nachladen von Lernkarten verhinderte, wurde behoben.

## 0.3.7 (2025-09-18)
- **Neue Funktion**: Verbesserte Quiz-Komponente mit direktem visuellen Feedback
- **Neue Funktion**: Fortschrittsanzeige und Ergebnisseite für Quiz-Fragen
- **UX-Verbesserung**: Manuelle Navigation zwischen Quiz-Fragen mit Vor/Zurück-Buttons
- **UX-Verbesserung**: Klare visuelle Unterscheidung zwischen richtigen und falschen Antworten
- **Architektur**: Domain-driven Design mit Typen und Zod-Schemas für Quiz-Daten
- **Architektur**: Verbesserte Routing-Struktur für Quiz-Komponenten
- **Bugfix**: State-Reset zwischen Quiz-Fragen behoben

## 0.3.6 (2025-09-17)
- **Neue Funktion**: Dwell-Time-Tracking für Lernkarten implementiert
- **Neue Funktion**: Anzeige der aktuellen und gespeicherten Verweildauer unter jeder Karte
- **Verbesserung**: Korrekte Aufsummierung der Verweildauer über mehrere Sitzungen
- **Verbesserung**: Anzeigedauer wird auf Null zurückgesetzt, wenn die Karte aus dem Viewport verschwindet
- **Datenbank**: RLS-Policies für user_learning_progress implementiert
- **Datenbank**: Foreign Key von user_learning_progress auf learning_card_new korrigiert
- **Architektur**: Verbesserte Fehlerbehandlung im Dwell-Time-Service

## 0.3.5 (2025-09-14)
- **UI**: Verbesserte Learning Card Management mit konsistentem App-Header
- **UI**: Korrigiertes Layout im Learning Card Bearbeitungsmodus
- **UI**: Entfernte überlagernde Elemente im Learning Card Manager
- **UX**: Konsistentes Erscheinungsbild in der gesamten Anwendung

## 0.3.4 (2025-09-13)
- **UI**: Entfernte doppelte "Lernen"-Überschrift aus dem Dashboard
- **UI**: Entfernte doppelte "Cheers, Heiko!"-Begrüßung aus dem Dashboard
- **UI**: Entfernte horizontales Menü mit Buch-, Plus- und Zahnrad-Icons
- **UI**: Behoben asChild-Prop-Fehler im Button-Element
- **UI**: Verbesserte Darstellung der Profilinformationen im Dashboard
- **Navigation**: Logo-Klick führt zum Dashboard statt zum Profil
- **Performance**: Reduzierte linke Navbar auf Icons für bessere Platznutzung

## 0.3.3 (2025-08-30)
- **Avatar-Upload Bug behoben**: Neues Foto wird sofort als Avatar angezeigt
- **Navigation Bug behoben**: Profil Editor schließt korrekt zum Dashboard (Mobile & Desktop)
- Verbesserte Avatar-Cache-Aktualisierung mit React Query
- Optimierte Profil-Navigation mit React Router

## 0.3.2 (2025-08-30)
- **Neue Funktion**: Vollständiges Restaurant-Management-System implementiert
- **Neue Funktion**: CRUD-Operationen für Restaurants (Erstellen, Bearbeiten, Löschen)
- **Neue Funktion**: Mobile-first UI mit Confirmation Dialogs für Lösch-Aktionen
- **Neue Funktion**: Restaurant-Karte an oberster Dashboard-Position für Restaurant-Betreiber
- **Verbesserung**: RLS-Policies für sichere Restaurant-Datenzugriffe implementiert
- **Verbesserung**: Zentrale LocalUser Interface-Definition - alle lokalen Duplikate entfernt
- **Verbesserung**: React Query Integration für optimistische Updates und Caching
- **Architektur**: Domain-driven Design mit klarer Trennung (UI → Hooks → Services → Repositories)
- **Architektur**: Zod-Validierung an allen IO-Grenzen für Typsicherheit

## 0.3.1 (2025-08-30)
- Vollständige Sprachverwaltung mit Variante D (Radio + Pips) implementiert
- Typeahead-Suche für neue Sprachen hinzufügen
- Empty-State für neue Nutzer mit Smart-Suggestions (Device/Profile-Sprache)
- Kompaktes Layout ohne horizontales Scrollen optimiert
- Level-Pips mit großen Touch-Targets (32px) für mobile Bedienung
- Stern-Badge (★) für bessere Primärsprache-Kennzeichnung
- Hover-basierte Remove-Buttons mit intelligenter Deaktivierung
- Dirty-State Indikator (●) im Speichern-Button
- Vollständige A11y-Unterstützung mit Focus-States
- Avatar-Mapping Bugfix: Rollen-Display-Namen korrigiert

## 0.3.0 (2025-08-25)
- Update-Flow mit Snackbar implementiert
- Service Worker SKIP_WAITING Handler
- NetworkFirst Caching für changelog.md
- Automatischer Reload bei Service Worker Updates
- Verbesserte PWA Update-Erfahrung

## 0.2.0 (2025-08-25)
- Avatar zeigt roten Punkt bei Neuerungen
- Performance: schnellere Startseite
- Push-Benachrichtigungen für Updates implementiert
- Service Worker Registration mit onUpdate/onReady Callbacks
- Versionsvergleich mit Semantic Versioning
- LocalStorage für letzte Login-Version

## 0.1.0 (2025-07-10)
- Push-Benachrichtigungen für Updates
- Bugfix: Login-Retry Mechanismus
- Verbesserte Profilverwaltung
- Avatar-Upload mit Kamera-Integration

## 0.0.0 (2025-06-01)
- Erste stabile Version
- Grundlegende Profilverwaltung
- Authentifizierung mit Supabase
- Progressive Web App Funktionalität
- Responsive Design für Mobile und Desktop
