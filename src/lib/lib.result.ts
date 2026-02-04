// src/lib/lib.result.ts
// Zweck: Result-Pattern für typisierte Fehlerbehandlung
// Verantwortlichkeiten: Success/Error Wrapper, normierte Fehlercodes
// Anti-Beispiele: Keine Geschäftslogik, keine direkten API-Calls

/**
 * Normierte Fehlercodes für SpoonUp
 * Folgt Entwicklungsrichtlinien für einheitliche Fehlerbehandlung
 */
export type ErrorCode = 
  | 'INVALID_INPUT'
  | 'INVALID_DATA' 
  | 'NETWORK'
  | 'RLS_DENIED'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'UNKNOWN'
  | 'DB'
  | 'STORAGE'
  | 'USER_NOT_FOUND'
  | 'PERMISSION_DENIED'
  | 'INVALID_FILE'
  | 'FILE_TOO_LARGE'
  | 'INVALID_FORMAT'
  | 'STORAGE_ERROR'
  | 'DB_ERROR'
  | 'PROCESSING_ERROR';

/**
 * Fehler-Details mit User- und Dev-Messages
 */
export interface ErrorDetails {
  userMessage?: string;
  devMessage?: string;
  retryable?: boolean;
}

/**
 * Result-Pattern für typisierte Erfolg/Fehler-Behandlung
 */
export type Result<T> = 
  | { ok: true; data: T }
  | { ok: false; error: { code: ErrorCode } & ErrorDetails };

/**
 * Erstellt Success-Result
 * @param data - Erfolgreiche Daten
 * @returns Success Result
 */
export function createSuccess<T>(data: T): Result<T> {
  return { ok: true, data };
}

/**
 * Alias für createSuccess (kürzere Syntax)
 */
export const ok = createSuccess;

/**
 * Erstellt Error-Result
 * @param code - Fehlercode
 * @param details - Zusätzliche Fehlerdetails
 * @returns Error Result
 */
export function createError<T = never>(
  code: ErrorCode, 
  details: ErrorDetails = {}
): Result<T> {
  return { 
    ok: false, 
    error: { 
      code, 
      ...details 
    } 
  };
}

/**
 * Alias für createError (kürzere Syntax)
 */
export const err = createError;

/**
 * Type Guard für Success-Results
 */
export function isSuccess<T>(result: Result<T>): result is { ok: true; data: T } {
  return result.ok === true;
}

/**
 * Type Guard für Error-Results
 */
export function isError<T>(result: Result<T>): result is { ok: false; error: { code: ErrorCode } & ErrorDetails } {
  return result.ok === false;
}

/**
 * Extrahiert Daten aus Result oder wirft Fehler
 * @param result - Result zum Unwrappen
 * @returns Daten bei Success
 * @throws Error bei Failure
 */
export function unwrap<T>(result: Result<T>): T {
  if (result.ok) {
    return result.data;
  }
  
  const { error } = result;
  const message = error.userMessage || error.devMessage || `Error: ${error.code}`;
  throw new Error(message);
}

/**
 * Extrahiert Daten aus Result oder gibt Default zurück
 * @param result - Result zum Unwrappen
 * @param defaultValue - Fallback-Wert bei Fehler
 * @returns Daten bei Success, sonst Default
 */
export function unwrapOr<T>(result: Result<T>, defaultValue: T): T {
  return result.ok ? result.data : defaultValue;
}

/**
 * Mappt Success-Result zu neuem Typ
 * @param result - Ursprüngliches Result
 * @param fn - Mapping-Funktion
 * @returns Gemapptes Result
 */
export function mapResult<T, U>(
  result: Result<T>, 
  fn: (data: T) => U
): Result<U> {
  return result.ok 
    ? ok(fn(result.data))
    : result as Result<U>;
}

/**
 * Kombiniert mehrere Results (alle müssen erfolgreich sein)
 * @param results - Array von Results
 * @returns Success mit Array aller Daten oder erstes Error
 */
export function combineResults<T>(results: Result<T>[]): Result<T[]> {
  const data: T[] = [];
  
  for (const result of results) {
    if (!result.ok) {
      return result as Result<T[]>;
    }
    data.push(result.data);
  }
  
  return ok(data);
}
