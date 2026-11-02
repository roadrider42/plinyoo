# Vorschläge für bessere Lesbarkeit der Buchseite

## ✅ Bereits umgesetzt
- Beitrag ist standardmäßig eingeklappt (`<details>` ohne `open`)

## 🎯 Vorschläge für bessere Lesbarkeit

### 1. Zeilenlängen optimieren

**Problem:** Lange Textblöcke sind schwer zu lesen, besonders auf Desktop.

**Lösung:** Maximale Zeichenbreite von ~60-70 Zeichen für Fließtext (statt vollen Bildschirmbreite).

**Wo:** CSS für `.lesetext` in `scripts/buchseiten.mjs`

```css
.lesetext {
  max-width: 65ch;  /* optimal für Lesbarkeit */
  line-height: 1.7;  /* mehr Zeilenabstand */
  margin: 0 auto;    /* zentriert auf Desktop */
}
```

---

### 2. Mehr visuelle Trennung zwischen Abschnitten

**Problem:** Die 4 Textabsätze des Beitrags laufen ineinander.

**Lösung:** Größere Abstände zwischen Absätzen (statt 14px → 24px).

**Wo:** CSS in `scripts/buchseiten.mjs` (Zeile ~380)

```css
.lesetext p {
  margin-bottom: 1.5rem;  /* 24px statt 14px */
}
```

---

### 3. Zitate und wichtige Punkte hervorheben

**Problem:** Wichtige Aussagen gehen im Fließtext unter.

**Lösung:** Zitate wie Egalim-Gesetze und Tesla-Beispiel optisch abheben.

**Beispiel:** In `content/buecher/dalrymple-anarchie.json` HTML-Formatierung für Zitate:

```json
"absaetze": [
  "Normaler Text...",
  "<blockquote>Egalim-Gesetze sollen Landwirte schützen...</blockquote>",
  "Normaler Text..."
]
```

**CSS:**
```css
.lesetext blockquote {
  border-left: 4px solid var(--teal);
  padding-left: 1rem;
  margin: 1.5rem 0;
  font-style: italic;
  background: var(--mist);
  padding: 1rem;
  border-radius: 8px;
}
```

---

### 4. Zahlen und Werte hervorheben

**Problem:** Wichtige Zahlen (470 Millionen, 1,6 Milliarden) gehen unter.

**Lösung:** Werte fett oder in Farbe markieren.

**Beispiel:**
```json
"absaetze": [
  "... auf <strong>470 Millionen bis eine Milliarde Euro</strong> im Jahr..."
]
```

---

### 5. Absatzstruktur im Beitrag verbessern

**Aktuell:** 4 lange Absätze

**Vorschlag:** Aufteilen in 6-7 kürzere Absätze mit thematischen Trennungen:

- Absatz 1: Einführung (Staatliche Privilegien bei East India Company)
- Absatz 2: Ausmaß der Company (Armee, Diwani)
- Absatz 3: **Neuer Absatz:** "Das war keine reine Marktdynamik."
- Absatz 4: Finanzkrise 2008 (Banken)
- Absatz 5: **Neuer Absatz:** Ähnliches Muster: Tesla
- Absatz 6: China (Solar/Elektro)
- Absatz 7: Frankreich (Egalim, SRP+10)
- Absatz 8: Fazit (Wer trägt die Kosten?)

---

### 6. Lead-Satz als Überschrift

**Vorschlag:** Den ersten Satz des Beitrags als kleine Überschrift oder Lead-Paragraph markieren.

```css
.lesetext .lead {
  font-size: 1.1em;
  font-weight: 600;
  color: var(--graphite);
  margin-bottom: 1.5rem;
}
```

```json
"absaetze": [
  "<p class='lead'>Ähnliche Muster lassen sich auch in der jüngeren Vergangenheit beobachten.</p>",
  "Restlicher Text..."
]
```

---

### 7. Mobile-Lesbarkeit verbessern

**Problem:** Auf dem Handy sind die Textblöcke noch dichter.

**Lösung:** Mehr Padding und größere Schrift auf Mobile.

```css
@media (max-width: 768px) {
  .lesetext {
    font-size: 1.05em;  /* etwas größer auf Mobile */
    padding: 0 1rem;   /* mehr Seitenabstand */
  }
  .lesetext p {
    margin-bottom: 1.25rem;
  }
}
```

---

### 8. Progressives Disclosure für Frankreich-Beispiel

**Vorschlag:** Da das Frankreich-Beispiel sehr detailliert ist, könnte es in ein eigenes `<details>` ausgegliedert werden:

```html
<details class="beispiel-details">
  <summary>Beispiel: Frankreich (Egalim, SRP+10)</summary>
  <p>Der ausführliche Text...</p>
</details>
```

**Vorteil:** Leser können sich entscheiden, ob sie das Detail lesen wollen.

---

## 🎨 Design-Vorschläge (Optional)

### Hintergrund für Beitrag
Damit der Beitrag als separater Bereich erkennbar ist:

```css
.beitrag-fold {
  background: linear-gradient(to bottom, var(--mist), transparent);
  border-left: 4px solid var(--teal);
  padding: 1.5rem;
  margin: 2rem 0;
  border-radius: 8px;
}
```

### Ikone vor "Weiterlesen"
Visueller Anker:

```html
<summary>
  <span class="bk">💭 Dazu ein Beitrag</span>
  ...
</summary>
```

---

## 📊 Prioritäten

### Hoch (sofort umsetzbar):
1. ✅ Beitrag eingeklappt (bereits erledigt)
2. Zeilenlängen begrenzen (max-width: 65ch)
3. Mehr Abstände zwischen Absätzen
4. Zahlen hervorheben

### Mittel:
5. Absatzstruktur verbessern (mehr kürzere Absätze)
6. Mobile-Lesbarkeit
7. Lead-Satz als Überschrift

### Niedrig (nice-to-have):
8. Zitate als Blockquote formatieren
9. Hintergrund für Beitrag
10. Progressive Disclosure für Frankreich-Beispiel

---

## 🔧 Umsetzung

Wenn du bestimmte Vorschläge umsetzen willst, sag mir welche:
- Ich kann das CSS in `scripts/buchseiten.mjs` anpassen
- Oder den Text in `content/buecher/dalrymple-anarchie.json` restrukturieren
