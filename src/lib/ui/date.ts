/**
 * lib/ui/date.ts
 * 
 * Hilfsfunktionen für die Datumsformatierung.
 */

/**
 * Formatiert einen Datum-String sicher in das deutsche Datumsformat.
 * Gibt einen leeren String zurück, wenn das Datum ungültig ist.
 */
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return 'Unbekannt';

  const date = new Date(dateString);

  // Prüfen, ob das Datum gültig ist
  if (isNaN(date.getTime())) {
    return 'Ungültiges Datum';
  }

  return date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
