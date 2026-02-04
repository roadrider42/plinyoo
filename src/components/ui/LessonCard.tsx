/**
 * LessonCard.tsx
 * 
 * Zweck: Micro-Lesson Card für Learning Feed
 * Verantwortlichkeiten:
 * - Lesson-Darstellung mit Inhalt
 * - Progress-Tracking und Completion-Events
 * - Responsive Design für Mobile/Desktop
 * - Dwell-Time Tracking für Analytics
 * 
 * Folgt Entwicklungsrichtlinien und UX-Guidelines
 */

import React, { useState, useEffect, useRef } from 'react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import eventTracker from "../../services/svc.events";
import type { FeedCardType } from '../../domain/dom.feed-card.zod';

interface LessonCardProps {
  /** Lesson-Daten aus Feed */
  card: FeedCardType;
  /** Callback für Skip-Events */
  onSkip?: () => void;
  /** Callback für Completion-Events */
  onComplete?: () => void;
  /** Callback für Progress-Events */
  onProgress?: (progress: number) => void;
}

type LessonState = 'reading' | 'completed';

/**
 * LessonCard Komponente
 * 
 * Features:
 * - Dwell-Time Tracking (95% = Completion)
 * - Progress-Indikator
 * - Touch-optimierte Navigation
 * - Accessibility Support
 * - Auto-Completion bei ausreichender Verweildauer
 */
export default function LessonCard({ 
  card, 
  onComplete, 
  onProgress 
}: LessonCardProps) {
  const [state, setState] = useState<LessonState>('reading');
  const [startTime] = useState(Date.now());
  const progressRef = useRef<any | undefined>(undefined);
  const cardRef = useRef<HTMLDivElement>(null);

  // Berechne erwartete Lesezeit (basierend auf duration_s)
  const expectedDuration = card.duration_s * 1000; // Convert to ms
  const completionThreshold = 0.95; // 95% der erwarteten Zeit

  // Progress-Tracking
  useEffect(() => {
    if (state !== 'reading') return;

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const currentProgress = Math.min(elapsed / expectedDuration, 1);
      
      onProgress?.(currentProgress);

      // Auto-Completion bei 95% Threshold
      if (currentProgress >= completionThreshold && state === 'reading') {
        setState('completed');
        onComplete?.();
        return;
      }

      // Continue tracking if not completed
      if (currentProgress < 1) {
        progressRef.current = setTimeout(updateProgress, 1000);
      }
    };

    progressRef.current = setTimeout(updateProgress, 1000);

    return () => {
      if (progressRef.current) {
        clearTimeout(progressRef.current);
      }
    };
  }, [state, startTime, expectedDuration, completionThreshold, onProgress, onComplete]);


  return (
    <>
      <h2 className="text-xl font-semibold text-gray-900 mb-2 sm:mb-4">{card.title}</h2>
      
      <div className="text-gray-800 leading-relaxed mb-4 whitespace-pre-wrap max-w-full">
        {card.body}
      </div>
      
      {card.tags && card.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {card.tags.map((tag, index) => (
            <span key={index} className="not-prose inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-spoonup-offwhite text-spoonup-braun">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </>
  );
}
