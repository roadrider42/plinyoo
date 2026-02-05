

Ziel

Plinyoo Landingpage vollständig auf „Cognitive Infrastructure“ finalisieren: modern, ruhig, strukturiert, mit frischer Teal/Mist-Note, ohne Fashion-/Promo-Vibe.

⸻

Umsetzungspaket A – Fonts & CSP (Pflicht, damit CI überhaupt greift)
	1.	In index.html CSP ersetzen durch:

<meta http-equiv="Content-Security-Policy"
  content="
    default-src 'self';
    script-src 'self' https://plausible.io 'unsafe-inline';
    style-src 'self' https://fonts.googleapis.com 'unsafe-inline';
    font-src 'self' data: https://fonts.gstatic.com;
    img-src 'self' data:;
    connect-src 'self' https://plausible.io;
  ">

	2.	theme-color auf CI umstellen:

<meta name="theme-color" content="#F4F5F7" media="(prefers-color-scheme: light)" />
<meta name="theme-color" content="#0F1419" media="(prefers-color-scheme: dark)" />

	3.	Sicherstellen, dass src/main.tsx als erste Zeile das globale CSS importiert:

import './index.css';


⸻

Umsetzungspaket B – Tailwind Tokens verbindlich nutzen (Pflicht)

Regel: Keine text-gray-*, bg-slate-*, bg-[#...] mehr in Landing-Komponenten.
Stattdessen nur Tokens: text-*, surface-*, border-*, accent/soft-teal/highlight.

Durchsetzung:
	•	Suche/ersetze in src/components/landing/**:
	•	gray-, slate-, zinc-, neutral-, bg-[#, text-[#
	•	Ersetzen durch:
	•	text-text, text-text-muted, bg-surface-1, bg-surface-2, bg-surface-tint, border-border

⸻

Umsetzungspaket C – Section-Rhythmus (macht es sofort moderner)

Auf der Landingpage sollen Sections abwechselnde Hintergründe bekommen:
	•	Standard: bg-main-background
	•	Jede zweite Section: bg-surface-2 border-y border-border/60
	•	Vorteil-Sektion/Highlights: bg-surface-tint (Mist Green)

Definition:
	•	Maximal eine große gelbe Fläche (CTA unten). Sonst Gelb nur als Akzent.

⸻

Umsetzungspaket D – Hero finalisieren (modern + „geerdet“)
	1.	Hero bekommt eine subtile Erdung unter Buttons:

<div className="mt-12 h-px w-24 mx-auto bg-border"></div>

	2.	Eyebrow im Hero immer text-soft-teal:

<p className="text-sm font-medium tracking-wide text-soft-teal mb-4">
  Digitale Lern- und Entscheidungsbegleitung
</p>

	3.	Hero-Container bekommt ein leichtes System-Gefühl:

	•	max width strikt (max-w-4xl)
	•	Zeilenlänge begrenzen (leading-tight für H1, max-w-2xl für Subtext)

⸻

Umsetzungspaket E – Cards „Tooliger“ machen (weg vom Baukasten)

Für alle Cards:
	•	shadow-none oder maximal shadow-ci-hairline
	•	border border-border
	•	rounded-lg
	•	Titel font-semibold, Text text-text-muted

Standard-Card-Klasse (vereinheitlichen):

const cardBase = "bg-surface-1 border border-border rounded-lg p-6 shadow-ci-hairline";

Icons:
	•	einheitlich (outline)
	•	Größe 18–20
	•	Farbe text-soft-teal

⸻

Umsetzungspaket F – Testimonials/Zitat in „Beobachtung“-Stil

Zitat-Block umstellen auf:
	•	label: „Beobachtung aus der Praxis“
	•	kein Kursiv, keine übermäßige Emotionalität
	•	linke Border border-l-2 border-soft-teal

⸻

Umsetzungspaket G – FAQ als Knowledge Base (weniger Accordion-Spielzeug)
	•	stärkere Trennlinien: border-border/70
	•	Frage text-text, Antwort text-text-muted
	•	Icons kleiner, dezent (Soft Teal nur beim Hover oder Aktiv)

⸻

Umsetzungspaket H – CTA (Gelb) entschärfen (kein Promo-Look)
	1.	Gelb bleibt, aber Buttons:

	•	Primary Button bg-primary text-white
	•	Secondary Link als Text (text-primary underline-offset-4)

	2.	Headline sachlicher:

	•	„Wie kann plinyoo konkret unterstützen?“ statt „Bereit…“
