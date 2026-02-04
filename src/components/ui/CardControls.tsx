/**
 * Card Controls Component
 * 
 * Control-Surface für Feed-Karten mit Skip/Difficulty Feedback
 * - Skip Button → trackSkip Event
 * - "Zu schwer" Button → trackProgress mit difficulty metadata
 * - "Zu leicht" Button → trackProgress mit difficulty metadata
 * 
 * Folgt A11y Guidelines und Event-Tracking Pattern
 */

import * as React from 'react';
import eventTracker from '../../services/svc.events';

interface CardControlsProps {
  /** Card ID für Event-Tracking */
  cardId: string;
  /** Callback nach Skip-Aktion */
  onSkip?: () => void;
  /** Callback nach Difficulty Feedback */
  onDifficultyFeedback?: (difficulty: 'too_easy' | 'too_hard') => void;
  /** Custom CSS Klassen */
  className?: string;
  /** Disabled State */
  disabled?: boolean;
}

/**
 * Card Controls
 * Bietet Nutzer-Feedback Optionen für Feed-Karten
 */
export default function CardControls({ 
  cardId, 
  onSkip, 
  onDifficultyFeedback,
  className = '',
  disabled = false
}: CardControlsProps) {
  
  // Skip Handler
  const handleSkip = () => {
    if (disabled) return;
    
    // Track Skip Event
    eventTracker.trackSkip(cardId, 'user_skip');
    
    // Callback ausführen
    onSkip?.();
  };

  // Difficulty Feedback Handler
  const handleDifficultyFeedback = (difficulty: 'too_easy' | 'too_hard') => {
    if (disabled) return;
    
    // Track Difficulty Feedback Event
    eventTracker.trackDifficultyFeedback(cardId, difficulty);
    
    // Callback ausführen
    onDifficultyFeedback?.(difficulty);
  };

  return (
    <div 
      className={`card-controls mt-4 pt-3 border-t border-gray-100 ${className}`}
      role="group"
      aria-label="Karten-Aktionen"
    >
      <div className="flex items-center justify-between gap-3">
        {/* Skip Button */}
        <button
          type="button"
          className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          onClick={handleSkip}
          disabled={disabled}
          aria-label="Diese Karte überspringen"
        >
          <svg 
            className="w-4 h-4 mr-1.5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
          Skip
        </button>

        {/* Difficulty Feedback Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            onClick={() => handleDifficultyFeedback('too_hard')}
            disabled={disabled}
            aria-label="Diese Karte ist zu schwer"
          >
            <svg 
              className="w-4 h-4 mr-1.5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M19 14l-7 7m0 0l-7-7m7 7V3" 
              />
            </svg>
            Zu schwer
          </button>

          <button
            type="button"
            className="inline-flex items-center rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-green-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            onClick={() => handleDifficultyFeedback('too_easy')}
            disabled={disabled}
            aria-label="Diese Karte ist zu leicht"
          >
            <svg 
              className="w-4 h-4 mr-1.5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 10l7-7m0 0l7 7m-7-7v18" 
              />
            </svg>
            Zu leicht
          </button>
        </div>
      </div>

      {/* Optional: Feedback Text */}
      <div className="mt-2 text-xs text-gray-500 text-center">
        Dein Feedback hilft uns, bessere Inhalte für dich zu finden
      </div>
    </div>
  );
}

