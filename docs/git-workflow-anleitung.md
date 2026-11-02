# Git Workflow für plinyoo - Kurzanleitung

## 🎯 Ziel
Änderungen sollen automatisch deployed werden, wenn du sie pushst.

## 📋 Workflow für Änderungen

### Option 1: Mit Feature-Branch (empfohlen für größere Änderungen)

**Schritte:**
1. Auf Feature-Branch arbeiten (z.B. `text/beitrag-korrektur`)
2. Änderungen commiten:
   ```bash
   git add .
   git commit -m "Beschreibung der Änderung"
   ```
3. Pushen:
   ```bash
   git push
   ```
4. **WICHTIG:** Pull Request erstellen:
   ```bash
   gh pr create --base main --head text/beitrag-korrektur --title "Titel" --body "Beschreibung"
   ```
5. Pull Request auf GitHub öffnen und mergen
6. Nach Merge: Automatisches Deployment

---

### Option 2: Direkt auf main (für kleine Änderungen)

**Schritte:**
1. Auf main Branch wechseln:
   ```bash
   git checkout main
   git pull
   ```
2. Änderungen commiten:
   ```bash
   git add .
   git commit -m "Beschreibung"
   ```
3. Pushen:
   ```bash
   git push
   ```
4. Automatisches Deployment läuft sofort

---

## ⚠️ Häufige Fehler

### Fehler 1: Auf Feature-Branch pushen, aber keinen PR erstellen
**Problem:** Änderungen landen im Feature-Branch, werden aber nicht deployed
**Lösung:** Immer Pull Request erstellen mit `gh pr create`

### Fehler 2: Direkt auf main arbeiten ohne vorher zu pullen
**Problem:** Konflikte oder veralteter Code
**Lösung:** Immer `git pull` vor dem Commit auf main

### Fehler 3: Nicht wissen, auf welchem Branch man ist
**Prüfen:**
```bash
git branch
```
Zeigt aktuellen Branch mit `*` markiert

---

## 🔍 Schnell-Check vor Push

1. Welcher Branch?
   ```bash
   git branch
   ```

2. Änderungen prüfen:
   ```bash
   git status
   ```

3. Wenn auf Feature-Branch:
   - Commit + Push
   - **Pull Request erstellen:** `gh pr create`
   - Merge auf GitHub

4. Wenn auf main:
   - Commit + Push
   - Fertig (automatisches Deployment)

---

## 📝 Merkzettel

```
Auf Feature-Branch:
1. git add .
2. git commit -m "..."
3. git push
4. gh pr create --base main --head <branch-name> --title "..." --body "..."
5. Merge auf GitHub

Auf main:
1. git checkout main
2. git pull
3. git add .
4. git commit -m "..."
5. git push
```
