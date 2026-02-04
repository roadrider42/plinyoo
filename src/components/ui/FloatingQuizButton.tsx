/**
 * @file FloatingQuizButton.tsx
 * @module components/ui/FloatingQuizButton
 *
 * @description
 * Schwebender Button, der erscheint, wenn ein Quiz für einen ausgewählten Tag verfügbar ist.
 * Die Verfügbarkeit wird extern über den `useQuizAvailability`-Hook geprüft und über die `isAvailable`-Prop gesteuert.
 *
 * @component
 * @param {object} props - Die Props der Komponente.
 * @param {string} props.tagId - Die ID des Tags, für den das Quiz gestartet werden soll.
 * @param {string} [props.tagName] - Der Name des Tags zur Anzeige im Button.
 * @param {boolean} props.isAvailable - Steuert die Sichtbarkeit des Buttons. Wird vom `useQuizAvailability`-Hook geliefert.
 * @param {string} [props.className] - Optionale CSS-Klassen.
 *
 * @example
 * const { isQuizAvailable } = useQuizAvailability(selectedTagId);
 * <FloatingQuizButton 
 *   tagId={selectedTagId}
 *   tagName={selectedTagName}
 *   isAvailable={isQuizAvailable} 
 * />
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BrainCircuit } from 'lucide-react';

interface FloatingQuizButtonProps {
  tagId: string;
  tagName?: string;
  isAvailable: boolean;
  className?: string;
}

export default function FloatingQuizButton({ tagId, tagName, isAvailable, className = '' }: FloatingQuizButtonProps) {
  const navigate = useNavigate();

  // Button nur anzeigen, wenn ein Quiz verfügbar ist
  if (!isAvailable || !tagId) return null;


  const handleQuizStart = () => {
    // Navigiere zur neuen Quiz-Seite mit der Tag-ID als Parameter
    navigate(`/quiz/tag/${encodeURIComponent(tagId)}`);
    
    // Event-Tracking (optional) - ohne require, da es in Vite Probleme verursacht
    try {
      // Direkt importieren statt require verwenden
      import('../../services/svc.events')
        .then(module => {
          const eventTracker = module.default;
          eventTracker.trackEvent('quiz_start', { tagId: tagId, tagName: tagName });
        })
        .catch(error => {
          console.error('Event tracking module import failed:', error);
        });
    } catch (error) {
      console.error('Event tracking failed:', error);
    }
  };

  return (
    <div 
      className={`fixed bottom-24 right-4 z-[9999] ${className}`}
      data-testid="floating-quiz-button"
      style={{ pointerEvents: 'auto' }}
    >
      <button
        onClick={handleQuizStart}
        className="flex items-center gap-2 bg-spoonup-braun text-white hover:bg-spoonup-gelb hover:text-spoonup-braun rounded-full px-5 py-3 shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-spoonup-braun focus:ring-offset-2"
        aria-label={`Quiz zu ${tagName || 'ausgewähltem Thema'} starten`}
        style={{ boxShadow: '0 0 15px rgba(0,0,0,0.3)' }}
      >
        <BrainCircuit className="h-5 w-5" />
        <span className="font-nunito font-medium">Quiz zu #{tagName || 'Thema'}</span>
      </button>
    </div>
  );
}
