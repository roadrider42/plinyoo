import { z } from 'zod';

// Hoechstlaengen je Feld (#533) -- DIESELBEN wie in plinyoo-contact
// (supabase/functions/plinyoo-contact/index.ts, PFLICHT_LAENGE und
// FREI_LAENGE). Der Browser kennt sie, damit eine zu lange Eingabe als solche
// erkannt wird ("Ein Feld enthaelt zu viel Text") und nicht erst als 400 ohne
// Grund vom Server zurueckkommt. `npm run pruefung:kontakt-meldung` faehrt beide
// Seiten und vergleicht, was sie je Feld annehmen.
export const KONTAKT_HOECHSTLAENGE = {
  name: 200,
  email: 254,
  message: 5000,
  role: 200,
  availability: 200,
  linkedin: 500,
  github: 500,
  investment_range: 100,
} as const;

const L = KONTAKT_HOECHSTLAENGE;

export const ContactFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(L.name),
  email: z.string().max(L.email).email('Invalid email address'),
  message: z.string().max(L.message).optional(),
  formType: z.enum(['contact', 'join', 'invest']),
  // Fields for 'join' form
  role: z.string().max(L.role).optional(),
  availability: z.string().max(L.availability).optional(),
  linkedin: z.string().max(L.linkedin).optional(),
  github: z.string().max(L.github).optional(),
  // Fields for 'invest' form
  investment_range: z.string().max(L.investment_range).optional(),
});
