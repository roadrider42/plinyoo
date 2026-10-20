# SEO-Empfehlungen für plinyoo

## 📋 Zusammenfassung der Änderungen

### ✅ Bereits umgesetzt:
1. **Sitemap.xml Generator** - `scripts/generate-sitemap.mjs` wird beim Build ausgeführt
2. **Erweiterte Meta-Tags** - canonical, keywords, author, twitter:site zu index.html
3. **robots.txt** - Sitemap-Link hinzugefügt

### 🔧 Noch zu implementieren:

---

## 1. Strukturierte Daten (Schema.org)

### Für die Startseite (Organization):
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "plinyoo",
  "url": "https://www.plinyoo.com",
  "logo": "https://www.plinyoo.com/logo.png",
  "description": "Intelligente persönliche digitale Lernplattformen",
  "sameAs": [
    "https://www.instagram.com/plinyoo_path",
    "https://x.com/plinyoo_path"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer service",
    "email": "kontakt@plinyoo.com"
  }
}
</script>
```

### Für Buchseiten (Book):
In `scripts/buchseiten.mjs` hinzufügen:
```javascript
const structuredData = {
  "@context": "https://schema.org",
  "@type": "Book",
  "name": b.titel,
  "author": {
    "@type": "Person",
    "name": b.autor
  },
  "isbn": b.isbn,
  "datePublished": b.erschienen,
  "publisher": {
    "@type": "Organization",
    "name": b.verlag
  },
  "url": url,
  "description": b.leitfrage
};
```

---

## 2. Hreflang-Tags für mehrsprachige Inhalte

**Problem:** Die Seite ist in 7 Sprachen verfügbar, aber Google weiß nicht, welche Version für welche Sprache/Region relevant ist.

**Lösung:** In index.html und Buchseiten hreflang-Tags hinzufügen:

```html
<link rel="alternate" hreflang="de" href="https://www.plinyoo.com/" />
<link rel="alternate" hreflang="en" href="https://www.plinyoo.com/en/" />
<link rel="alternate" hreflang="es" href="https://www.plinyoo.com/es/" />
<link rel="alternate" hreflang="fr" href="https://www.plinyoo.com/fr/" />
<link rel="alternate" hreflang="pt" href="https://www.plinyoo.com/pt/" />
<link rel="alternate" hreflang="pl" href="https://www.plinyoo.com/pl/" />
<link rel="alternate" hreflang="uk" href="https://www.plinyoo.com/uk/" />
<link rel="alternate" hreflang="x-default" href="https://www.plinyoo.com/" />
```

**Hinweis:** Dies erfordert URL-basierte Sprachroutes (z.B. /en/, /es/) statt Client-Side Sprachumschaltung.

---

## 3. Hash-Router Problem (KRITISCH)

**Aktuell:** `createHashRouter` → URLs wie `/#/zugang`
**Problem:** Suchmaschinen crawlen nicht hinter `#`

**Lösungsoptionen:**

### Option A: BrowserRouter (mittelschwer)
```typescript
// src/routes/AppRoutes.tsx
import { createBrowserRouter } from 'react-router-dom';
export const router = createBrowserRouter([...]);
```

**Erfordert Server-Konfiguration:**
- Nginx:
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```
- Apache:
```apache
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

### Option B: SSR mit Vite-SSG (besser für SEO)
```bash
npm install vite-plugin-ssg
```

Generiert statische HTML-Dateien für jede Route - ideal für SEO.

---

## 4. OG-Image erstellen

**Aktuell:** `/og-image.png` existiert noch nicht

**Anforderungen:**
- Größe: 1200x630px (Facebook/Richtung)
- Format: PNG oder JPG
- Inhalt: Logo + Claim + plinyoo URL
- Text lesbar auf dunklem und hellem Hintergrund

**Tools:**
- Canva: https://www.canva.com/templates/s/og-image/
- Figma: Templates für Social Media

---

## 5. Performance-Optimierung

### Core Web Vitals:
- **LCP (Largest Contentful Paint):**< 2.5s
- **FID (First Input Delay):**< 100ms
- **CLS (Cumulative Layout Shift):**< 0.1

**Verbesserungen:**
1. Lazy Loading für Bilder:
```html
<img loading="lazy" src="..." alt="..." />
```

2. Font-Display optimieren:
```css
@font-face {
  font-display: swap;
}
```

3. Critical CSS inlining (bereits teilweise umgesetzt)

---

## 6. Favicon optimieren

Mehrere Größen für verschiedene Geräte:
```html
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
```

---

## 7. Überschriften-Struktur prüfen

**Problem:** H1 wird dynamisch via React gerendert - nicht gut für SEO

**Lösung:** Statische H1 in index.html oder server-side H1

---

## 8. XML-Sitemap bei Google Search Console einreichen

Nach dem Build:
1. https://search.google.com/search-console/
2. Property hinzufügen: https://www.plinyoo.com
3. Sitemaps → Sitemap hinzufügen: https://www.plinyoo.com/sitemap.xml

---

## 📊 Prioritäten-Liste

### Hoch (sofort):
1. ✅ Sitemap.xml erstellen (erledigt)
2. ✅ Meta-Tags erweitern (erledigt)
3. ⚠️ **Hash-Router durch BrowserRouter ersetzen** (kritisch!)
4. **OG-Image erstellen**

### Mittel (nächste 2 Wochen):
5. Strukturierte Daten (Schema.org)
6. Hreflang-Tags
7. Performance-Optimierung (Lazy Loading)

### Niedrig (nice-to-have):
8. Favicon-Größen
9. H1 statisch machen
10. Breadcrumbs-Navigation

---

## 🔍 Monitoring

### Tools:
- **Google Search Console:** Crawling-Fehler, Indexierungsstatus
- **PageSpeed Insights:** Core Web Vitals
- **Screaming Frog:** Site-Audit, duplizierte Inhalte
- **Ahrefs/Semrush:** Backlinks, Keyword-Rankings

### KPIs:
- Organischer Traffic
- Crawl-Budget
- Indexierte Seiten
- Keyword-Rankings
