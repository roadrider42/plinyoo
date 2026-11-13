// plinyoo-contact -- Kontaktformulare der Startseite (Kontakt, Mitmachen,
// Investieren, Zugang). Ohne Anmeldung erreichbar.
//
// AUSROLLEN NUR IN DIESER REIHENFOLGE: erst die SQL-Datei
// 20270303090000_483_kontaktmail_grenze.sql aus spoonup einspielen
// (legt kontaktmail_buchen an), dann diese Funktion ausrollen. Ohne die
// SQL-Datei antwortet die Funktion 500 und verschickt nichts.
//
// #483 (spoonup), Heiko E-357 (08.11.2026): Die Funktion bleibt ohne
// Anmeldung erreichbar, zaehlt aber ueber DENSELBEN Zaehler wie
// contact-fom-email in spoonup -- eine Grenze fuer alle Kontaktmails
// zusammen, nicht je Netzadresse (ein Schulnetz teilt sich eine). Gezaehlt
// wird in der Datenbank (kontaktmail_buchen, nur mit dem Dienstschluessel),
// weil eine Edge Function in vielen Instanzen nebeneinander laeuft.
// Nachweis: supabase/tests/plinyoo-contact-483.mjs.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.4";
import { Resend } from 'https://esm.sh/resend@3.4.0';

// Die EINZIGE Stelle der Zahl in diesem Repo; die SQL-Funktion bekommt sie
// mitgeschickt. Sie muss KONTAKTMAIL_GRENZE in spoonup
// (supabase/functions/contact-fom-email/index.ts) gleichen -- beide buchen in
// denselben Zaehler, und mit zwei Grenzen gaelte fuer jeden Aufrufer die
// andere. Verglichen wird nur hier in plinyoo, und nur von Hand:
// `npm run pruefung:kontakt-grenze` (G1 in supabase/tests/plinyoo-contact-483.mjs)
// liest die spoonup-Zahl aus ../SpoonUp oder per SPOONUP_REF; ohne den
// spoonup-Stand meldet er NICHT MESSBAR. Keine CI faehrt ihn, und in spoonup
// prueft keine Pruefung diese Seite -- wer die Zahl nur dort aendert, merkt
// es erst, wenn hier jemand den Befehl faehrt.
const KONTAKTMAIL_GRENZE = { anzahl: 20, fenster_minuten: 60 } as const;
// Derselbe Satz wie in contact-fom-email (Sprecher, #469) -- dieselbe Lage.
const GRENZE_SATZ = 'Gerade kommen sehr viele Anfragen an. Bitte versuche es spätestens in einer Stunde noch einmal.';

// 1. Complete CORS Headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface FormData {
  name: string;
  email: string;
  message?: string;
  formType: 'contact' | 'join' | 'invest';
  role?: string;
  availability?: string;
  linkedin?: string;
  github?: string;
  investment_range?: string;
}

// Laengengrenzen wie in contact-fom-email (#469): weit gezogen, eine echte
// Anfrage scheitert nie an ihnen (die Zugang-Seite setzt mehrere Zeilen in
// `message` zusammen), sie halten nur Masse ab.
const FORM_TYPEN = ['contact', 'join', 'invest'] as const;
const PFLICHT_LAENGE = { name: 200, email: 254 } as const;
const FREI_LAENGE = { message: 5000, role: 200, availability: 200, linkedin: 500, github: 500, investment_range: 100 } as const;
const ADRESSE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function pruefeFormular(roh: unknown): FormData | null {
  if (typeof roh !== 'object' || roh === null || Array.isArray(roh)) return null;
  const f = roh as Record<string, unknown>;
  for (const [feld, max] of Object.entries(PFLICHT_LAENGE)) {
    const wert = f[feld];
    if (typeof wert !== 'string' || wert.trim().length === 0 || wert.length > max) return null;
  }
  if (!ADRESSE.test(f.email as string)) return null;
  if (!FORM_TYPEN.includes(f.formType as FormData['formType'])) return null;
  for (const [feld, max] of Object.entries(FREI_LAENGE)) {
    const wert = f[feld];
    // Wie Zod .optional() in contact-fom-email: nur ein fehlendes Feld ist
    // erlaubt, null nicht.
    if (wert === undefined) continue;
    if (typeof wert !== 'string' || wert.length > max) return null;
  }
  return f as unknown as FormData;
}

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function createSubject(formType: FormData['formType']): string {
  switch (formType) {
    case 'join': return 'Neue Mitmachen-Anfrage';
    case 'invest': return 'Neue Investoren-Anfrage';
    default: return 'Neue Kontaktanfrage (Use Case)';
  }
}

function createEmailBody(formData: FormData): string {
  let body = `Neue Anfrage über das ${formData.formType}-Formular:\n\n`;
  body += `Name: ${formData.name}\n`;
  body += `E-Mail: ${formData.email}\n`;
  if (formData.formType === 'join') {
    body += `Rolle/Skill: ${formData.role || 'N/A'}\n`;
    body += `Verfügbarkeit: ${formData.availability || 'N/A'}\n`;
    body += `LinkedIn: ${formData.linkedin || 'N/A'}\n`;
    body += `GitHub: ${formData.github || 'N/A'}\n`;
  } else if (formData.formType === 'invest') {
    body += `Investitionsrahmen: ${formData.investment_range || 'N/A'}\n`;
    body += `LinkedIn: ${formData.linkedin || 'N/A'}\n`;
  }
  if (formData.message) {
    body += `Nachricht: ${formData.message}\n`;
  }
  return body;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 3. Securely get environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const contactReceiverEmail = Deno.env.get("CONTACT_RECEIVER_EMAIL");

    if (!supabaseUrl || !serviceRoleKey || !resendApiKey || !contactReceiverEmail) {
      console.error("Server misconfiguration: Missing environment variables.");
      return json({ error: 'Server misconfigured' }, 500);
    }

    let roh: unknown;
    try {
      roh = await req.json();
    } catch {
      return json({ error: 'Bad Request' }, 400);
    }
    const formData = pruefeFormular(roh);
    if (!formData) {
      return json({ error: 'Bad Request' }, 400);
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Erst nach der Pruefung buchen (ein ungueltiges Formular verbraucht
    // keinen Platz), und VOR Zeile und Mail: bei 'gesamt' entsteht keins von
    // beiden. Scheitert die Buchung oder antwortet sie Unbekanntes, geht
    // nichts hinaus -- ein Fehler ist kein "noch Platz".
    const { data: gebucht, error: buchungsFehler } = await supabaseAdmin.rpc('kontaktmail_buchen', {
      p_grenze: KONTAKTMAIL_GRENZE.anzahl,
      p_fenster_minuten: KONTAKTMAIL_GRENZE.fenster_minuten,
    });
    if (buchungsFehler) {
      console.error("kontaktmail_buchen fehlgeschlagen:", (buchungsFehler as any).code ?? 'ohne Code');
      return json({ error: 'Failed to save contact' }, 500);
    }
    if (gebucht === 'gesamt') {
      console.warn("Kontaktmail: Grenze erreicht", KONTAKTMAIL_GRENZE);
      return json({ error: 'GRENZE_ERREICHT', meldung: GRENZE_SATZ }, 429);
    }
    if (gebucht !== 'erlaubt') {
      console.error("kontaktmail_buchen: unbekannte Antwort", JSON.stringify(gebucht));
      return json({ error: 'Failed to save contact' }, 500);
    }

    // Fehler der Datenbank und von Resend gehen nur mit Code ins Protokoll,
    // nie an den (anonymen) Aufrufer: Fehlertexte nennen Tabellen, Spalten
    // oder das Postfach des Empfaengers.
    const { error: dbError } = await supabaseAdmin.from("plinyoo_contacts").insert({
      name: formData.name,
      email: formData.email,
      message: formData.message || null,
      form_type: formData.formType,
    });

    if (dbError) {
      console.error("DB Insert Error:", (dbError as any).code ?? 'ohne Code');
      return json({ error: 'Failed to save contact' }, 500);
    }

    const resend = new Resend(resendApiKey);
    const { error: emailError } = await resend.emails.send({
      from: 'plinyoo <noreply@email.spoonup.me>',
      to: [contactReceiverEmail],
      subject: createSubject(formData.formType),
      text: createEmailBody(formData),
    });

    if (emailError) {
      console.error("Resend Email Error:", (emailError as any).name ?? 'ohne Namen', (emailError as any).statusCode ?? '');
      return json({ error: 'Failed to send email' }, 500);
    }

    return json({ message: 'Form submitted successfully' }, 200);

  } catch (err) {
    // Ungueltige Eingaben sind oben schon beantwortet; was hier ankommt, ist
    // ein Fehler auf unserer Seite (Netz, Datenbank) -- 500, nicht 400.
    console.error("Request Handling Error:", err instanceof Error ? err.name : 'unbekannt');
    return json({ error: 'Failed to save contact' }, 500);
  }
});
