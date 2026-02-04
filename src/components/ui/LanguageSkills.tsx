/**
 * ui.LanguageSkills.tsx
 * 
 * Zweck: Interaktive Sprachfähigkeiten-Komponente für Profil-Verwaltung (Version 1.3.1)
 * Verantwortlichkeiten:
 * - Anzeige und Bearbeitung von Sprachkenntnissen mit Level-Auswahl (Radio + Pips)
 * - Primary-Language-Management (genau eine Hauptsprache)
 * - Typeahead-Suche für neue Sprachen
 * - Empty-State mit Smart-Suggestions
 * 
 * Anti-Beispiele:
 * - Keine Geschäftslogik (nur UI-Präsentation)
 * - Keine direkten API-Calls (nutzt onChange Callback)
 * - Keine Validierung (Parent-Komponente ist verantwortlich)
 */

import React, { useState, useEffect } from 'react';
import { 
  LanguageSkill,
  LanguageCode,
  LanguageDisplayName,
  LANGUAGE_DISPLAY_NAMES,
  convertNameToCode,
  convertCodeToName
} from '../../domain/dom.languages';

/**
 * Props für LanguageSkills Komponente
 */
interface LanguageSkillsProps {
  /** Aktuelle Sprachkenntnisse */
  initialLanguages: LanguageSkill[];
  /** Callback bei Änderungen der Sprachkenntnisse */
  onChange: (languages: LanguageSkill[]) => void;
  /** Optional: Dirty-State Tracking */
  onDirtyStateChange?: (isDirty: boolean) => void;
}

/**
 * LanguageSkills - Interaktive Sprachkenntnisse-Verwaltung (Version 1.3.1)
 * 
 * @param props - LanguageSkillsProps
 * @returns JSX.Element - Sprachkenntnisse-Editor
 * 
 * @example
 * ```tsx
 * <LanguageSkills
 *   initialLanguages={userLanguages}
 *   onChange={(updated) => setUserLanguages(updated)}
 *   onDirtyStateChange={(isDirty) => setFormDirty(isDirty)}
 * />
 * ```
 * 
 * Features:
 * - Level-Auswahl von 1-5 mit Pips (Anfänger bis Muttersprachler)
 * - Primary-Language-Toggle mit Stern-Badge (★)
 * - Typeahead-Suche für neue Sprachen
 * - Empty-State mit Smart-Suggestions
 * - Hover-basierte Remove-Buttons
 * - Kompaktes Layout ohne horizontales Scrollen
 * - Große Touch-Targets (32px) für mobile Bedienung
 * - Vollständige A11y-Unterstützung mit Focus-States
 */
export function LanguageSkills({ initialLanguages, onChange, onDirtyStateChange }: LanguageSkillsProps) {
  const [languages, setLanguages] = useState<LanguageSkill[]>(initialLanguages);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  
  // Synchronisiere internen State mit initialLanguages
  useEffect(() => {
    setLanguages(initialLanguages);
    setIsDirty(false);
  }, [initialLanguages]);
  
  // Benachrichtige Parent über Dirty-State
  useEffect(() => {
    onDirtyStateChange?.(isDirty);
  }, [isDirty, onDirtyStateChange]);

  // Generiere Smart-Suggestions basierend auf Browser-Sprache und verfügbaren Sprachen
  useEffect(() => {
    if (languages.length === 0) {
      const browserLang = navigator.language.split('-')[0];
      const suggestions: LanguageDisplayName[] = [];
      
      // Browser-Sprache als erste Suggestion
      if (browserLang in LANGUAGE_DISPLAY_NAMES) {
        const browserLangName = LANGUAGE_DISPLAY_NAMES[browserLang as LanguageCode];
        if (browserLangName && !languages.some(l => l.name === browserLangName)) {
          suggestions.push(browserLangName);
        }
      }
      
      // Füge Deutsch und Englisch als Standard-Suggestions hinzu
      if (!languages.some(l => l.name === 'Deutsch') && !suggestions.includes('Deutsch' as LanguageDisplayName)) {
        suggestions.push('Deutsch' as LanguageDisplayName);
      }
      
      if (!languages.some(l => l.name === 'English') && !suggestions.includes('English' as LanguageDisplayName)) {
        suggestions.push('English' as LanguageDisplayName);
      }
      
      setSuggestions(suggestions);
    } else {
      setSuggestions([]);
    }
  }, [languages]);

  // Handle Level Change mit Pips
  const handleLevelChange = (languageId: string, newLevel: number) => {
    // Stellen sicher, dass newLevel ein gültiger LanguageLevel-Wert ist (1-5)
    const validLevel = Math.max(1, Math.min(5, newLevel)) as 1 | 2 | 3 | 4 | 5;
    
    const updated = languages.map(lang => 
      lang.id === languageId ? { ...lang, level: validLevel } : lang
    );
    setLanguages(updated);
    onChange(updated);
    setIsDirty(true);
  };

  // Handle Primary Language Change mit Radio-Button
  const handlePrimaryChange = (languageId: string) => {
    const updated = languages.map(lang => ({
      ...lang,
      isPrimary: lang.id === languageId
    }));
    setLanguages(updated);
    onChange(updated);
    setIsDirty(true);
  };

  // Handle Remove Language
  const handleRemove = (languageId: string) => {
    const updated = languages.filter(lang => lang.id !== languageId);
    setLanguages(updated);
    onChange(updated);
    setIsDirty(true);
  };

  // Handle Add Language from Suggestion
  const handleAddSuggestion = (languageName: LanguageDisplayName) => {
    try {
      const languageCode = convertNameToCode(languageName);
      
      // Sicherstellen, dass die Sprache noch nicht hinzugefügt wurde
      if (!languages.some(lang => lang.id === languageCode)) {
        const newLanguage: LanguageSkill = {
          id: languageCode,
          name: languageName,
          level: languages.length === 0 ? 5 : 3, // Erste Sprache ist Level 5, sonst 3
          isPrimary: languages.length === 0 // Erste Sprache ist primär
        };
        
        const updated = [...languages, newLanguage];
        setLanguages(updated);
        onChange(updated);
        setIsDirty(true);
        setSearchQuery('');
      }
    } catch (e) {
      console.error('Fehler beim Hinzufügen der Sprache:', e);
    }
  };

  // Handle Typeahead Search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim().length > 0) {
      const results = Object.values(LANGUAGE_DISPLAY_NAMES)
        .filter(name => 
          name.toLowerCase().includes(query.toLowerCase()) && 
          !languages.some(l => l.name === name)
        )
        .slice(0, 5); // Limitiere auf 5 Ergebnisse
      
      setSuggestions(results);
    } else {
      setSuggestions([]);
    }
  };

  // Level-Label für Accessibility
  const getLevelLabel = (level: number): string => {
    const labels = {
      1: 'Anfänger',
      2: 'Grundkenntnisse', 
      3: 'Fortgeschritten',
      4: 'Fließend',
      5: 'Muttersprachler'
    };
    return labels[level as keyof typeof labels] || 'Unbekannt';
  };

  return (
    <div className="space-y-4">
      {/* Sprachen-Liste mit Radio + Pips Design */}
      {languages.map((language) => (
        <div 
          key={language.id}
          className="bg-white rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-colors shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {/* Radio-Button für Primärsprache */}
              <button
                type="button"
                onClick={() => handlePrimaryChange(language.id)}
                className={`w-6 h-6 rounded-full flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${language.isPrimary ? 'bg-blue-600 text-white' : 'bg-gray-100 text-transparent'}`}
                aria-label={language.isPrimary ? `${language.name} ist Primärsprache` : `${language.name} als Primärsprache festlegen`}
                aria-pressed={language.isPrimary}
              >
                {language.isPrimary && <span aria-hidden="true">★</span>}
              </button>
              
              {/* Sprachname mit Badge */}
              <div>
                <h4 className="font-medium text-gray-900">{language.name}</h4>
                {language.isPrimary && (
                  <span className="text-xs text-blue-600 font-medium">
                    Primärsprache
                  </span>
                )}
              </div>
            </div>
            
            {/* Remove-Button (nur sichtbar bei Hover) */}
            <button
              type="button"
              onClick={() => handleRemove(language.id)}
              className="text-gray-400 hover:text-red-600 transition-colors p-2 rounded-full hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              aria-label={`${language.name} entfernen`}
              disabled={language.isPrimary && languages.length > 1} // Primärsprache kann nicht entfernt werden, wenn andere Sprachen existieren
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* Level-Pips mit großen Touch-Targets */}
          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sprachniveau: <span className="font-normal">{getLevelLabel(language.level)}</span>
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(level => (
                <button
                  key={level}
                  type="button"
                  onClick={() => handleLevelChange(language.id, level)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 ${level <= language.level ? 'bg-blue-600' : 'bg-gray-200'}`}
                  aria-label={`Sprachniveau ${level} - ${getLevelLabel(level)}${level === language.level ? ' (ausgewählt)' : ''}`}
                  aria-pressed={level === language.level}
                >
                  <span className="sr-only">{level}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ))}

      {/* Empty State mit Smart-Suggestions */}
      {languages.length === 0 && (
        <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200 border-dashed">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-1">Keine Sprachen konfiguriert</h3>
          <p className="text-sm text-gray-600 mb-4">Fügen Sie Ihre Sprachen hinzu, um Ihr Profil zu vervollständigen.</p>
          
          {/* Smart-Suggestions */}
          {suggestions.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 px-4">
              {suggestions.map(suggestion => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => handleAddSuggestion(suggestion)}
                  className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  {suggestion} hinzufügen
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Typeahead-Suche für neue Sprachen */}
      <div className="mt-4">
        <label htmlFor="language-search" className="block text-sm font-medium text-gray-700 mb-1">
          Neue Sprache hinzufügen
        </label>
        <div className="relative">
          <input
            id="language-search"
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Sprache suchen..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            aria-autocomplete="list"
            aria-controls="language-suggestions"
            aria-expanded={suggestions.length > 0}
          />
          
          {/* Suchergebnisse */}
          {suggestions.length > 0 && (
            <ul
              id="language-suggestions"
              className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm"
              role="listbox"
            >
              {suggestions.map((suggestion, index) => (
                <li
                  key={suggestion}
                  role="option"
                  className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-50 text-gray-900"
                  onClick={() => handleAddSuggestion(suggestion)}
                  aria-selected={index === 0}
                >
                  <div className="flex items-center">
                    <span className="font-normal block truncate">{suggestion}</span>
                  </div>
                  <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
