/**
 * DwellTimeStats.tsx
 * 
 * Zweck: Anzeige der Verweildauer-Statistiken für eine Karte
 * Verantwortlichkeiten:
 * - Abrufen der Verweildauer aus der Datenbank
 * - Formatierung der Verweildauer
 * - Anzeige von aktueller und Gesamt-Verweildauer
 * - Anzeige der Karten-ID
 */

import React from 'react';
import { Clock, History } from 'lucide-react';
import { useCardDwellTime } from '../../hooks/hook.useLearningTime';

interface DwellTimeStatsProps {
  cardId: string;
  currentDwellSeconds: number;
  className?: string;
}

/**
 * Formatiert Sekunden in ein lesbares Format (mm:ss)
 */
function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  return `${minutes}m ${remainingSeconds}s`;
}

/**
 * Formatiert eine UUID zu einer kurzen Version (nur die ersten 8 Zeichen)
 */
function formatId(id: string): string {
  return `${id.slice(0, 8)}...`;
}

export default function DwellTimeStats({ cardId, currentDwellSeconds, className = '' }: DwellTimeStatsProps) {
  // Verwende den Hook, um die gespeicherte Gesamtzeit für diese spezifische Karte abzurufen
  const { data: savedTotalSeconds, isLoading, isError } = useCardDwellTime(cardId);
  
  return (
    <div className={`flex flex-wrap items-center justify-between w-full px-4 py-2 bg-spoonup-offwhite text-xs ${className}`}>
      <div className="flex items-center gap-4">
        {/* Aktuelle Anzeigezeit (beginnt bei 0 und zählt hoch) */}
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3 text-spoonup-darkgray" /> 
          <span className="font-medium">Aktuell:</span> {formatDuration(currentDwellSeconds)}
        </div>
        
        {/* Gespeicherte Gesamtzeit (Summe aller bisherigen Anzeigezeiten) */}
        <div className="flex items-center gap-1">
          <History className="h-3 w-3 text-spoonup-darkgray" /> 
          <span className="font-medium">Gesamt:</span> 
          {isLoading ? (
            <span className="text-gray-400">Lade...</span>
          ) : isError ? (
            <span className="text-red-400">Fehler</span>
          ) : !savedTotalSeconds || savedTotalSeconds === 0 ? (
            <span className="text-gray-400">Noch keine Verweildauer</span>
          ) : (
            formatDuration(savedTotalSeconds)
          )}
        </div>
      </div>
      
      {/* Karten-ID */}
      <div className="text-spoonup-darkgray">
        <span className="font-medium">ID:</span> {formatId(cardId)}
      </div>
    </div>
  );
}
