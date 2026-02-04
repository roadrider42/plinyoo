

🚀 STANDARD-WORKFLOW: Ein neues Kundenprojekt anlegen (professionell & reproduzierbar)

Ich gliedere es in 5 Hauptphasen, jeweils exakt so, wie du sie anwenden kannst:
	1.	Neues Repo erstellen
	2.	Lokale Einrichtung / Template klonen
	3.	Supabase für das neue Projekt vorbereiten
	4.	Environment-Variablen setzen & Demo-Modus aktivieren
	5.	Demo auf GitHub Pages veröffentlichen
	6.	Optional: Übergang zu IONOS (Produktivbetrieb)

⸻

1️⃣ NEUES REPOSITORY AUF GITHUB ANLEGEN

Schritt 1: Neues Repo erstellen

Gehe zu GitHub → “New repository”

Beispiel-Name:

kunde-gutachter-website

oder Agentur-stabil:

client-[name]-project

⚠️ Wichtig: NICHT mit README initialisieren (macht das Klonen leichter).

⸻

2️⃣ LOKALE EINRICHTUNG — DEIN TEMPLATE KOPIEREN

Schritt 2: Template-Repo klonen

Du hast dein plinyoo-Projekt als Vorlage → Die richtige Vorgehensweise:

git clone https://github.com/roadrider42/plinyoo.git bau-gutachter

Dann in das neue Projekt wechseln:

cd kunde-projekt

Schritt 3: Alte Git-Historie entfernen

Damit du ein „sauberes“ Kundenprojekt bekommst:

rm -rf .git

Dann:

git initmain
git add .
git commit -m "Initial commit for Kunde"

Schritt 4: Repo mit GitHub verbinden

git remote add origin git@github.com:deinAccount/kunde-gutachter-website.git
git push -u origin main

Jetzt ist dein kompletter Template-Code im neuen Repo.

⸻

3️⃣ SUPABASE EINRICHTUNG FÜR DAS NEUE PROJEKT

Es gibt zwei mögliche Wege:

⸻

🔵 A) EIN Supabase-Projekt für alle Kunden (mit Project Prefix)

Das ist gut, solange du PWA nur für Kontaktformulare nutzt.

Vorgehen:

Schritt 1: Supabase öffnen → SQL Editor

Für jeden Kunden legst du Tabellen mit Prefix an:

Beispiel:

kunde01_contact_messages
kunde01_uploads

Oder generisch:

project_123_form_submissions
project_123_files

Schritt 2: Tabellen definieren

Beispiel:

Natürlich — ich baue dir jetzt den kompletten SQL-Create-Befehl für Supabase, basierend auf genau dem Schema, das auf deinem Screenshot zu sehen ist.
Damit kannst du die Tabelle 000_contacts problemlos neu anlegen.

Ich mache keine Annahmen, sondern übernehme exakt die Felder:
	•	id (uuid, not null, PK)
	•	created_at (timestamptz, default now())
	•	name (text)
	•	email (text)
	•	message (text)
	•	form_type (text)

⸻

✅ CREATE TABLE für Supabase — Tabelle 000_contacts

❗ Wichtig: Tabellenname darf mit Ziffern beginnen — Postgres erlaubt das, aber du musst ihn in "Anführungszeichen" setzen. Supabase unterstützt das.

create table "000_contacts" (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  name text,
  email text,
  message text,
  form_type text
);


⸻

🔐 Optional (empfohlen): RLS aktivieren + Insert-Policy setzen

Wenn du möchtest, dass dein Frontend einfach schreiben darf:

alter table "000_contacts" enable row level security;

Dann die Policy:

create policy "allow inserts for anon"
on "000_contacts"
for insert
to anon
with check (true);


⸻

🧪 Optional: Testeintrag (zum Prüfen)

insert into "000_contacts" (name, email, message, form_type)
values ('Test', 'test@example.com', 'Hallo!', 'contact');


⸻

🎯 Wenn du willst:

Ich kann dir auch direkt
	•	ein ALTER TABLE bauen, falls du eine bestehende Tabelle erweitern möchtest
	•	ein Backup-Script erzeugen
	•	die Supabase TypeScript-Typen für diese Tabelle generieren
	•	ein Supabase-Client-Service für deine PWA schreiben (insert + fetch)

Sag einfach, was du brauchst.

Schritt 3: Storage-Bucket anlegen

Bucket-Name:

project_123_uploads

Schritt 4: RLS-Policies aktivieren

Für form submissions:

alter table project_123_form_submissions enable row level security;

create policy "allow inserts" 
on project_123_form_submissions
for insert
to anon
with check (true);

Das reicht für ein Kontaktformular.

⸻

🟢 B) Ein eigenes Supabase-Projekt pro Kunde (beste Isolierung)

Empfohlen, wenn:
	•	Kunden personenbezogene Daten speichern
	•	du später weitere Features anbietest (Portal, Dokumente, Dashboard)

➡️ Dann:
	1.	Supabase Dashboard → New project
	2.	Project Name: gutachter-kunde01
	3.	Tabellen wie oben anlegen
	4.	API-Keys kopieren (für .env.demo & .env.production)

⸻

4️⃣ ENVIRONMENT-VARIABLEN KONFIGURIEREN

Du brauchst drei Dateien:

.env           → für lokale Entwicklung
.env.demo      → für Demo auf GitHub Pages
.env.production → für IONOS oder Live-Betrieb


⸻

Beispiel für deinen neuen Kunden:

.env (lokal)

VITE_APP_ENV=development
VITE_SUPABASE_URL=https://xyz.supabase.co
VITE_SUPABASE_ANON_KEY=local-dev-key
VITE_RESEND_API_KEY=local-dev-resend
VITE_RESEND_FROM_EMAIL=demo@agentur.de
VITE_RESEND_TO_EMAIL=agentur@agentur.de
VITE_APP_BASE_PATH=/


⸻

.env.demo (GitHub Pages)

VITE_APP_ENV=demo
VITE_SUPABASE_URL=https://xyz.supabase.co
VITE_SUPABASE_ANON_KEY=anon-key
VITE_RESEND_API_KEY=demo-key
VITE_RESEND_FROM_EMAIL=demo@agentur.de
VITE_RESEND_TO_EMAIL=agentur@agentur.de
VITE_APP_BASE_PATH=/kunde-gutachter-website/


⸻

.env.production (IONOS)

VITE_APP_ENV=production
VITE_SUPABASE_URL=https://customer.supabase.co
VITE_SUPABASE_ANON_KEY=prod-key
VITE_RESEND_API_KEY=kundenspezifisch
VITE_RESEND_FROM_EMAIL=kontakt@kunde.de
VITE_RESEND_TO_EMAIL=kontakt@kunde.de
VITE_APP_BASE_PATH=/


⸻

5️⃣ DEMO-AUSLIEFERUNG (GitHub Pages)

Schritt 1: Deploy Action verwenden

Dein Template sollte bereits eine workflow-Datei haben:

.github/workflows/deploy.yml

Du baust jetzt einfach:

npm run build --mode demo

Dann wird aus /dist nach GitHub Pages deployt.

GitHub Pages URL:

https://deinaccount.github.io/kunde-gutachter-website/

Das ist deine „Demo-Version für den Kunden“.

⸻

6️⃣ OPTIONAL: LIVE-BETRIEB BEIM KUNDEN (IONOS)

Wenn der Kunde später zusagt:

Schritt 1: .env.production mit Kundendaten füllen

Schritt 2: Build erstellen

npm run build --mode production

Schritt 3: Build per FTP oder IONOS Deploy Now hochladen

Schritt 4: Domain verbinden, SSL aktivieren

FERTIG.

⸻

🎉 DEIN END-TO-END WORKFLOW IST JETZT:

„Neues Repo → Supabase Prefix → Env-Dateien → Demo deployen → Kunde testen → Live ausrollen“

⸻

Wenn du möchtest, kann ich dir zusätzlich erstellen:

📁 eine komplette Ordnerstruktur für dein Template-Repo
📘 eine fertige Datei docs/setup-new-project.md, die du in jedes Repo legen kannst
🧪 Test-Suite für Formularversand
🔌 Beispielcode für supabaseClient, formService, emailService

Sag einfach: Was soll ich als Nächstes produzieren?