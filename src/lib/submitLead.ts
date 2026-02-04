// src/lib/submitLead.ts
// Zweck: Stellt eine clientseitige Funktion zur Verfügung, um Formulardaten an die Supabase Edge Function zu senden.

import { supabase } from './supabase';
import type { LeadPayload } from '@/domain/dom.lead.zod';

/**
 * Sendet die Formulardaten an die 'contact-form-email' Supabase Edge Function.
 * Diese Funktion wird von den UI-Komponenten der Formulare aufgerufen.
 * @param payload - Die aus dem Formular gesammelten Daten.
 * @returns - True bei Erfolg, wirft einen Fehler bei Misserfolg.
 */
export async function submitLead(payload: LeadPayload): Promise<boolean> {
  console.log('Sende Formulardaten an die Edge Function:', payload);

  // Ruft die Supabase Edge Function 'contact-form-email' auf und übergibt die Formulardaten.
  const { data, error } = await supabase().functions.invoke('contact-form-email', {
    body: payload,
  });

  if (error) {
    console.error('❌ Fehler beim Aufruf der Edge Function:', error);
    throw new Error('Fehler bei der Übermittlung des Formulars.');
  }

  console.log('✅ Formulardaten erfolgreich an die Edge Function gesendet:', data);
  return true;
}

