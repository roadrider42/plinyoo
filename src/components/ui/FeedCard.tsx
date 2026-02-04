/**
 * components/ui/FeedCard.tsx
 * Verbesserte Version mit Intersection Observer für präzises Tracking der Verweildauer.
 * 
 * Verantwortlichkeiten:
 * - Anzeige einer einzelnen Lernkarte im Feed
 * - Präzise Messung der Verweildauer mit Intersection Observer
 * - Regelmäßige Aktualisierung der Verweildauer in der Datenbank
 * - Tracking von Benutzerinteraktionen
 */

import React, { useEffect, useRef, useState } from 'react';
import type { FeedCardRow } from '@/domain/dom.learning.types';
import { trackCardDwellTime } from '@/services/svc-learning-time';
import { LearningCardImageGallery } from '../ui.LearningCardImageGallery';

type Props = {
  card: FeedCardRow;
  onVisibleChange?: (cardId: string, visible: boolean) => void;
  onSkip?: (cardId: string, reason?: string) => void;
  onComplete?: (cardId: string, dwellTimeMs?: number) => void;
  onProgress?: (cardId: string, progressPercent: number) => void;
  onQuizAnswer?: (cardId: string, isCorrect: boolean, selectedOption?: string) => void;
};

export default function FeedCard({ card, onVisibleChange }: Props) {
  const startRef = useRef<number | null>(null);
  const visRef = useRef<boolean>(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Konstanten für die ID-Korrektur
  const KAP_SOUNION_TITLE = 'Kap Sounion';
  const KAP_SOUNION_CORRECT_ID = 'a48643d3-08f2-415d-9b51-7275f60ca1d2';
  
  // Hilfsfunktion zur Korrektur bekannter problematischer IDs
  const correctCardId = (id: string | undefined, title: string | undefined): string | undefined => {
    if (!id || !title) return id;
    
    // Korrektur für Kap Sounion
    if (title.includes(KAP_SOUNION_TITLE)) {
      if (id !== KAP_SOUNION_CORRECT_ID) {
        console.warn(`[ID CORRECTION] Ersetze falsche ID ${id} mit korrekter ID ${KAP_SOUNION_CORRECT_ID} für Karte "${title}"`);
        return KAP_SOUNION_CORRECT_ID;
      }
    }
    
    return id;
  };
  
  // Stelle sicher, dass wir eine gültige Karten-ID haben
  // Prüfe verschiedene mögliche Orte für die ID
  // WICHTIG: Wir verwenden nur die tatsächliche Karten-ID aus der Datenbank
  const cardId = card?.id || 
                (card as any)?.card_id;
  
  // WICHTIG: Wir korrigieren bekannte problematische IDs
  let finalCardId = correctCardId(cardId, card?.title);
  
  // Erweiterte Debug-Ausgabe für die Karte
  console.log('FeedCard Daten:', {
    cardId,
    finalCardId,
    title: card?.title,
    cardObjectType: typeof card,
    cardObjectKeys: typeof card === 'object' ? Object.keys(card) : [],
    hasId: !!card?.id,
    hasCardId: !!(card as any)?.card_id,
    rawCardId: card?.id,
    rawCardCardId: (card as any)?.card_id,
    // Wichtig: Überprüfe, ob die ID eine gültige UUID ist
    isValidUUID: cardId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cardId)
  });
  
  // Wenn keine ID vorhanden ist, geben wir eine Warnung aus und tracken keine Zeit
  if (!finalCardId && card?.title) {
    console.warn(`Keine gültige ID für Karte "${card.title}" gefunden. Zeittracking wird deaktiviert.`);
  }
  
  // Zustandsvariable für die letzte Aktualisierung
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());
  // Intervall-ID für regelmäßige Aktualisierungen
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Akkumulierte Zeit seit der letzten Aktualisierung
  const accumulatedTimeRef = useRef<number>(0);
  
  // Funktion zum Speichern der Verweildauer
  const saveTimeSpent = (force = false) => {
    if ((!visRef.current && !force) || !startRef.current || !finalCardId) return;
    
    const now = Date.now();
    const elapsedSinceStart = Math.max(0, Math.round((now - startRef.current) / 1000));
    const elapsedSinceLastUpdate = Math.max(0, Math.round((now - lastUpdate) / 1000));
    
    // Nur aktualisieren, wenn genügend Zeit vergangen ist oder wenn erzwungen
    // Reduziere die Mindestzeit auf 3 Sekunden für häufigere Updates
    if (elapsedSinceLastUpdate >= 3 || force) {
      // Berechne die zu speichernde Zeit
      const secondsToSave = force ? elapsedSinceStart : elapsedSinceLastUpdate;
      
      if (secondsToSave > 0) {
        console.log(`[TIME TRACKING] Karte ${finalCardId} - Speichere Zeit: ${secondsToSave}s (Erzwungen: ${force})`);
        
        // Aktualisiere die Verweildauer in der Datenbank
        trackCardDwellTime(finalCardId, secondsToSave)
          .then(result => {
            if (result.ok) {
              console.log(`[TIME TRACKING] Erfolgreich ${secondsToSave}s für Karte ${finalCardId} gespeichert`);
              // Aktualisiere den Zeitstempel der letzten Aktualisierung
              setLastUpdate(now);
              // Setze die akkumulierte Zeit zurück
              accumulatedTimeRef.current = 0;
              
              // Erzwinge ein Neuladen der Daten nach erfolgreicher Aktualisierung
              // Dies ist wichtig, damit die UI die aktualisierten Zeiten anzeigt
              window.dispatchEvent(new CustomEvent('feed-time-updated', { detail: { cardId: finalCardId } }));
            } else {
              console.error(`[TIME TRACKING] Fehler beim Speichern der Zeit für Karte ${finalCardId}:`, result.error);
              // Akkumuliere die Zeit für den nächsten Versuch
              accumulatedTimeRef.current += secondsToSave;
            }
          })
          .catch(error => {
            console.error('[TIME TRACKING] Unerwarteter Fehler beim Speichern der Verweildauer:', error);
            // Akkumuliere die Zeit für den nächsten Versuch
            accumulatedTimeRef.current += secondsToSave;
          });
      }
    } else {
      // Akkumuliere die Zeit für die nächste Aktualisierung
      accumulatedTimeRef.current += elapsedSinceLastUpdate;
    }
  };

  // Effekt für den Intersection Observer
  useEffect(() => {
    // Erstelle einen Intersection Observer, um zu prüfen, ob die Karte sichtbar ist
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        const isVisible = entry.isIntersecting;
        
        if (isVisible && !visRef.current) {
          // Karte wird sichtbar
          visRef.current = true;
          startRef.current = Date.now();
          setLastUpdate(Date.now()); // Setze den Zeitstempel der letzten Aktualisierung
          if (finalCardId) onVisibleChange?.(finalCardId, true);
          console.log(`[TIME TRACKING] Karte ${finalCardId || 'unbekannt'} ist jetzt sichtbar`);
          
          // Starte ein Intervall für regelmäßige Aktualisierungen - häufiger aktualisieren (alle 5 Sekunden)
          intervalRef.current = setInterval(() => {
            saveTimeSpent();
          }, 5000); // Alle 5 Sekunden aktualisieren für bessere Genauigkeit
        } else if (!isVisible && visRef.current) {
          // Karte wird unsichtbar
          saveTimeSpent(true); // Erzwinge das Speichern der Zeit
          visRef.current = false;
          startRef.current = null;
          if (finalCardId) onVisibleChange?.(finalCardId, false);
          
          // Stoppe das Intervall
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
      },
      {
        threshold: 0.3, // Karte gilt als sichtbar, wenn mindestens 30% sichtbar sind (war 50%)
        rootMargin: '0px', // Keine zusätzlichen Margins
      }
    );
    
    if (cardRef.current) {
      observer.observe(cardRef.current);
    }
    
    return () => {
      observer.disconnect();
      
      // Stoppe das Intervall
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      // Speichere die Zeit, wenn die Komponente unmounted wird und die Karte noch sichtbar war
      if (visRef.current) {
        saveTimeSpent(true); // Erzwinge das Speichern der Zeit
        if (finalCardId) onVisibleChange?.(finalCardId, false);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finalCardId, onVisibleChange]);
  
  // Effekt für das Speichern der Zeit beim Verlassen der Seite
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && visRef.current) {
        saveTimeSpent(true); // Erzwinge das Speichern der Zeit
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Stille Debug-Ausgabe nur für Entwicklungszwecke
  if (card.title && card.title.includes(KAP_SOUNION_TITLE) && finalCardId !== KAP_SOUNION_CORRECT_ID) {
    console.warn(`[ID WARNING] Karte "${card.title}" hat falsche ID: ${finalCardId}, erwartet: ${KAP_SOUNION_CORRECT_ID}`);
  }
  
  return (
    <div ref={cardRef} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{card.title}</h3>
        <span className="text-xs text-gray-500">
          {card.type === 'quiz' ? 'Quiz' : 'Micro-Lesson'} • ~{Math.round(card.duration_s / 60)} min
        </span>
      </div>
      
      {/* Kein Debug-Button mehr, die ID-Korrektur funktioniert jetzt automatisch */}

      {/* Bilder anzeigen, wenn vorhanden */}
      {Array.isArray(card.images) && card.images.length > 0 && (
        <div className="mt-3">
          <LearningCardImageGallery 
            images={card.images} 
            alt={`Bilder zu ${card.title}`}
            className="max-h-48"
          />
        </div>
      )}

      {card.content ? (
        <p className="mt-2 text-sm text-gray-700">{card.content}</p>
      ) : card.type === 'quiz' ? (
        <p className="mt-2 text-sm text-gray-700">Quiz verfügbar.</p>
      ) : (
        <p className="mt-2 text-sm text-gray-400">Keine Inhalte verfügbar</p>
      )}

      {Array.isArray(card.tags) && card.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {card.tags.map((t) => (
            <span
              key={t.id}
              className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
            >
              {t.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
