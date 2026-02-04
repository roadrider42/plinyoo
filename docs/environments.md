Alles klar — wenn Supabase und Resend bereits im Demo-Betrieb funktionieren sollen (z. B. echter Formularversand für Kundenpräsentationen), dann brauchen wir eine klare, saubere Environment-Variable-Strategie, die:
	1.	Demo und Produktion sauber trennt
	2.	Fehlerfrei buildbar ist (Vite/CRA)
	3.	Supabase + Resend vollständig konfiguriert
	4.	Sicher ist (keine Keys in GitHub-Repo!)

Unten bekommst du die komplette, vollumfängliche Liste aller Environment-Variablen, die du wirklich brauchst — inkl. Aufteilung für:
	•	🔵 DEVELOPMENT (lokal)
	•	🟠 DEMO (GitHub Pages oder Demo-Domain)
	•	🟢 PRODUCTION (z. B. IONOS)

Und ich gebe dir die minimale, elegante Variante, die jedes Szenario abdeckt.

⸻

✅ 1. Pflicht-Variablen für Supabase

Supabase benötigt zwei Kernvariablen:

VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

Wenn du Storage verwendest:

VITE_SUPABASE_STORAGE_BUCKET=

Falls du RLS deaktiviert hast oder spezielle Policies nutzt, bleibst du bei den obigen drei Werten.

⸻

✅ 2. Pflicht-Variablen für Resend

Für Resend brauchst du mindestens:

VITE_RESEND_API_KEY=
VITE_RESEND_FROM_EMAIL=
VITE_RESEND_TO_EMAIL=

Optional, aber nützlich:

VITE_RESEND_REPLY_TO=

Wenn du mehrere Empfänger oder dynamische Empfänger benötigst:

VITE_RESEND_DEFAULT_RECIPIENT=


⸻

✅ 3. Betriebsmodus-Variablen (Demo vs. Production)

Du brauchst eine einzige Master-Variable, die entscheidet, wie sich die App verhält.

VITE_APP_ENV=

Mögliche Werte:
	•	development
	•	demo
	•	production

Dazu optional:

VITE_IS_DEMO=true/false
VITE_IS_PRODUCTION=true/false

Ich empfehle nur VITE_APP_ENV, Beispiel:

export const ENV = import.meta.env.VITE_APP_ENV; // "demo", "production" …
export const IS_DEMO = ENV === "demo";


⸻

✅ 4. API- und Routing-Variablen (insbesondere wichtig für GitHub Pages)

Weil eine PWA + GitHub Pages oft eine andere Pfadstruktur hat (z. B. /projectname/), brauchst du:

VITE_APP_BASE_PATH=

Beispiele:
	•	Demo unter GitHub Pages: /gutachter-demo/
	•	Live beim Kunden: /

Auch sinnvoll:

VITE_API_BASE_URL=

Falls du später ein Backend anbinden willst.

⸻

✅ 5. PWA / Design / Meta Variablen (optional aber sinnvoll)

VITE_APP_NAME=
VITE_APP_DESCRIPTION=
VITE_APP_VERSION=

Für Branding pro Kunde extrem praktisch.

⸻

⭐ Gesamtliste kompakt (alles, was du brauchst)

🔹 Supabase (Pflicht)

VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_SUPABASE_STORAGE_BUCKET=

🔹 Resend (Pflicht)

VITE_RESEND_API_KEY=
VITE_RESEND_FROM_EMAIL=
VITE_RESEND_TO_EMAIL=
VITE_RESEND_REPLY_TO=

🔹 Betriebsmodus (Pflicht)

VITE_APP_ENV=development|demo|production
VITE_APP_BASE_PATH=

Optional:

VITE_API_BASE_URL=

🔹 Meta / PWA (optional)

VITE_APP_NAME=
VITE_APP_DESCRIPTION=
VITE_APP_VERSION=


⸻

🧩 Beispiel: deine .env-Dateien

🔵 .env (lokale Entwicklung)

VITE_APP_ENV=development
VITE_SUPABASE_URL=https://xyz.supabase.co
VITE_SUPABASE_ANON_KEY=local-dev-key
VITE_RESEND_API_KEY=local-dev-resend-key
VITE_RESEND_FROM_EMAIL=demo@agentur.de
VITE_RESEND_TO_EMAIL=dev@agentur.de
VITE_APP_BASE_PATH=/


⸻

🟠 .env.demo (GitHub Pages)

VITE_APP_ENV=demo
VITE_SUPABASE_URL=https://your-demo-project.supabase.co
VITE_SUPABASE_ANON_KEY=demo-anon-key
VITE_RESEND_API_KEY=demo-resend-key
VITE_RESEND_FROM_EMAIL=demo@deinedomain.de
VITE_RESEND_TO_EMAIL=kontakt@agentur.de
VITE_APP_BASE_PATH=/gutachter-demo/


⸻

🟢 .env.production (IONOS oder Kundenhosting)

VITE_APP_ENV=production
VITE_SUPABASE_URL=https://customer.supabase.co
VITE_SUPABASE_ANON_KEY=customer-anon-key
VITE_RESEND_API_KEY=customer-resend-key
VITE_RESEND_FROM_EMAIL=kontakt@kunde.de
VITE_RESEND_TO_EMAIL=kunde@kunde.de
VITE_APP_BASE_PATH=/


⸻

🔧 Wie du diese Variablen später verwendest

Beispiel src/lib/config.ts:

export const ENV = import.meta.env.VITE_APP_ENV;
export const IS_DEMO = ENV === "demo";
export const IS_PRODUCTION = ENV === "production";

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY;
export const RESEND_FROM = import.meta.env.VITE_RESEND_FROM_EMAIL;
export const RESEND_TO = import.meta.env.VITE_RESEND_TO_EMAIL;

export const BASE_PATH = import.meta.env.VITE_APP_BASE_PATH;


