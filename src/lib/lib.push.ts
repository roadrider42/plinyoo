/**
 * lib.push.ts - Push-Benachrichtigungen Client-Utility
 * 
 * Zweck: VAPID-basierte Push-Subscription Verwaltung
 * Verantwortlichkeiten: Permission-Request, Subscription-Erstellung, Server-Kommunikation
 * 
 * Folgt Entwicklungsrichtlinien: Result-Pattern, typisierte Grenzen, Fehlerbehandlung
 * 
 * Anti-Beispiele:
 * - Keine Geschäftslogik (nur technische Push-Funktionalität)
 * - Keine UI-State Verwaltung
 * - Keine direkten DOM-Manipulationen
 */

export type PushResult = 
  | { ok: true; subscription: PushSubscription }
  | { ok: false; reason: 'unsupported' | 'denied' | 'missing_vapid' | 'network_error' | 'unknown'; error?: string };

/**
 * Aktiviert Push-Benachrichtigungen für den aktuellen Browser
 * 
 * @param storeUrl - Supabase Edge Function URL zum Speichern der Subscription
 * @returns Promise<PushResult> - Erfolg mit Subscription oder Fehler mit Grund
 * 
 * @example
 * ```ts
 * const result = await enablePush('https://project.functions.supabase.co/store-sub');
 * if (result.ok) {
 *   console.log('Push aktiviert:', result.subscription);
 * } else {
 *   console.error('Push fehlgeschlagen:', result.reason);
 * }
 * ```
 */
export async function enablePush(storeUrl: string): Promise<PushResult> {
  console.log('🔍 lib.push - enablePush called with URL:', storeUrl);
  
  // Browser-Support prüfen
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log('🔍 lib.push - Browser does not support service workers or push');
    return { ok: false, reason: 'unsupported' };
  }

  try {
    // Service Worker Registration abrufen
    const reg = (window as any).__SW_REG__ || await navigator.serviceWorker.ready;

    // Prüfen ob bereits eine Subscription existiert (idempotent)
    const existingSubscription = await reg.pushManager.getSubscription();
    if (existingSubscription) {
      // Bereits abonniert - Server-seitig aktualisieren falls nötig
      const subscriptionData = existingSubscription.toJSON();
      const payload = {
        endpoint: subscriptionData.endpoint,
        p256dh: subscriptionData.keys?.p256dh,
        auth: subscriptionData.keys?.auth,
        ua: navigator.userAgent
      };

      const response = await fetch(storeUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        return { ok: true, subscription: existingSubscription };
      } else {
        throw new Error(`Server Error: ${response.status} ${response.statusText}`);
      }
    }

    // Permission anfordern falls nötig
    if (Notification.permission !== 'granted') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        return { ok: false, reason: 'denied' };
      }
    }

    // VAPID Public Key aus Environment
    const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC;
    console.log('🔍 lib.push - VAPID Public Key:', vapidPublicKey ? 'Found' : 'Missing');
    if (!vapidPublicKey) {
      console.log('🔍 lib.push - VAPID key missing, returning missing_vapid error');
      return { ok: false, reason: 'missing_vapid', error: 'VITE_VAPID_PUBLIC nicht konfiguriert' };
    }

    // VAPID Key konvertieren
    const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);

    // Push Subscription erstellen
    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey
    });

    // Subscription an Server senden
    const subscriptionData = subscription.toJSON();
    const payload = {
      endpoint: subscriptionData.endpoint,
      p256dh: subscriptionData.keys?.p256dh,
      auth: subscriptionData.keys?.auth,
      ua: navigator.userAgent
    };

    const response = await fetch(storeUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Server Error: ${response.status} ${response.statusText}`);
    }

    return { ok: true, subscription };

  } catch (error) {
    console.error('Push enablement failed:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Server Error')) {
        return { ok: false, reason: 'network_error', error: error.message };
      }
    }
    
    return { ok: false, reason: 'unknown', error: error instanceof Error ? error.message : 'Unbekannter Fehler' };
  }
}

/**
 * Konvertiert VAPID Base64URL String zu Uint8Array
 * 
 * @param base64String - VAPID Public Key im Base64URL Format
 * @returns Uint8Array für applicationServerKey
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
}

/**
 * Deaktiviert Push-Benachrichtigungen und entfernt Subscription vom Server
 * 
 * @param deleteUrl - Supabase Edge Function URL zum Löschen der Subscription
 * @returns Promise<PushResult> - Erfolg oder Fehler mit Grund
 * 
 * @example
 * ```ts
 * const result = await unsubscribePush('https://project.functions.supabase.co/delete-sub');
 * if (result.ok) {
 *   console.log('Push deaktiviert');
 * }
 * ```
 */
export async function unsubscribePush(deleteUrl: string): Promise<PushResult> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return { ok: false, reason: 'unsupported' };
  }

  try {
    const reg = (window as any).__SW_REG__ || await navigator.serviceWorker.ready;
    const subscription = await reg.pushManager.getSubscription();
    
    if (!subscription) {
      return { ok: true, subscription: null as any }; // Already unsubscribed
    }

    // Subscription JSON für Server-Request
    const subscriptionData = subscription.toJSON();

    // Browser-Subscription entfernen
    await subscription.unsubscribe().catch(() => {
      // Ignore errors - subscription might already be invalid
    });

    // Server-seitig entfernen
    const response = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: subscriptionData.endpoint })
    });

    if (!response.ok) {
      throw new Error(`Server Error: ${response.status} ${response.statusText}`);
    }

    return { ok: true, subscription: subscription };

  } catch (error) {
    console.error('Push unsubscribe failed:', error);
    
    if (error instanceof Error && error.message.includes('Server Error')) {
      return { ok: false, reason: 'network_error', error: error.message };
    }
    
    return { ok: false, reason: 'unknown', error: error instanceof Error ? error.message : 'Unbekannter Fehler' };
  }
}

/**
 * Prüft ob Push-Benachrichtigungen bereits aktiviert sind
 * 
 * @returns Promise<boolean> - true wenn bereits abonniert
 */
export async function isPushEnabled(): Promise<boolean> {
  console.log('🔍 lib.push - isPushEnabled called');
  
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log('🔍 lib.push - Browser does not support Push API');
    return false;
  }

  try {
    console.log('🔍 lib.push - Getting service worker registration...');
    console.log('🔍 lib.push - window.__SW_REG__:', (window as any).__SW_REG__);
    console.log('🔍 lib.push - navigator.serviceWorker:', navigator.serviceWorker);
    
    const reg = (window as any).__SW_REG__ || await Promise.race([
      navigator.serviceWorker.ready,
      new Promise((_, reject) => setTimeout(() => reject(new Error('SW timeout')), 5000))
    ]);
    console.log('🔍 lib.push - Service worker registration:', reg);
    
    const subscription = await reg.pushManager.getSubscription();
    console.log('🔍 lib.push - Current subscription:', subscription);
    
    const isEnabled = subscription !== null;
    console.log('🔍 lib.push - Push enabled result:', isEnabled);
    
    return isEnabled;
  } catch (error) {
    console.error('🔍 lib.push - Error checking push status:', error);
    return false;
  }
}
