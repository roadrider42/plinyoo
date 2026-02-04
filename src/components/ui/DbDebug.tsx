/**
 * DbDebug.tsx
 * 
 * Einfache Komponente zur direkten Überprüfung der Datenbanktabellen
 * Hilft bei der Diagnose von Datenbankproblemen
 */

import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

interface DbRecord {
  [key: string]: any;
}

export default function DbDebug() {
  const [events, setEvents] = useState<DbRecord[]>([]);
  const [progress, setProgress] = useState<DbRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Hole Session
        const { data: sessionData, error: sessionError } = await supabase().auth.getSession();
        
        if (sessionError) {
          throw new Error(`Session-Fehler: ${sessionError.message}`);
        }
        
        if (!sessionData?.session?.user) {
          throw new Error('Keine aktive Session gefunden');
        }
        
        const userId = sessionData.session.user.id;
        
        // Hole Events
        const { data: eventsData, error: eventsError } = await supabase()
          .from('user_learning_events')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (eventsError) {
          throw new Error(`Events-Fehler: ${eventsError.message}`);
        }
        
        // Hole Progress
        const { data: progressData, error: progressError } = await supabase()
          .from('user_learning_progress_new')
          .select('*')
          .eq('user_id', userId)
          .order('updated_at', { ascending: false })
          .limit(10);
        
        if (progressError) {
          throw new Error(`Progress-Fehler: ${progressError.message}`);
        }
        
        setEvents(eventsData || []);
        setProgress(progressData || []);
        setError(null);
      } catch (err) {
        console.error('Fehler beim Abrufen der Daten:', err);
        setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  // Direkter Test: Schreibe in beide Tabellen
  const handleTestWrite = async () => {
    try {
      setLoading(true);
      
      // Hole Session
      const { data: sessionData, error: sessionError } = await supabase().auth.getSession();
      
      if (sessionError) {
        throw new Error(`Session-Fehler: ${sessionError.message}`);
      }
      
      if (!sessionData?.session?.user) {
        throw new Error('Keine aktive Session gefunden');
      }
      
      const userId = sessionData.session.user.id;
      // Verwende eine gültige UUID statt eines dynamischen Strings
      const testCardId = '00000000-0000-0000-0000-000000000001';
      
      // 1. Schreibe Event
      const { error: eventError } = await supabase()
        .from('user_learning_events')
        .insert({
          user_id: userId,
          card_id: testCardId,
          event_type: 'progress',
          event_meta: { duration_seconds: 30, type: 'test_write' }
        });
      
      if (eventError) {
        throw new Error(`Event-Schreibfehler: ${eventError.message}`);
      }
      
      // 2. Direktes Insert/Update in die user_learning_progress_new-Tabelle
      const { error: directError } = await supabase()
        .from('user_learning_progress_new')
        .upsert({
          user_id: userId,
          card_id: testCardId,
          time_spent_seconds: 30,
          status: 'in_progress', // Erlaubte Werte: 'not_started', 'in_progress', 'completed'
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,card_id',
          ignoreDuplicates: false
        });
      
      if (directError) {
        throw new Error(`Direkter Update-Fehler: ${directError.message}`);
      }
      
      // 3. Lade Daten neu
      const { data: eventsData } = await supabase()
        .from('user_learning_events')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);
      
      const { data: progressData } = await supabase()
        .from('user_learning_progress_new')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(10);
      
      setEvents(eventsData || []);
      setProgress(progressData || []);
      setError(null);
      
      alert('Test erfolgreich! Daten wurden in beide Tabellen geschrieben.');
    } catch (err) {
      console.error('Fehler beim Testschreiben:', err);
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
      alert(`Fehler: ${err instanceof Error ? err.message : 'Unbekannter Fehler'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-xs">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">DB Debug</h3>
        <button 
          onClick={handleTestWrite}
          className="px-2 py-1 bg-spoonup-braun text-white rounded text-xs hover:bg-spoonup-gelb hover:text-spoonup-braun transition-colors"
          disabled={loading}
        >
          Test-Schreibzugriff
        </button>
      </div>
      
      {loading && <div className="text-gray-500">Lade Daten...</div>}
      
      {error && (
        <div className="text-red-600 mb-2 whitespace-pre-wrap">{error}</div>
      )}
      
      <div className="space-y-4">
        {/* Events */}
        <div>
          <h4 className="font-medium mb-1">Events ({events.length})</h4>
          {events.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-1 border">event_type</th>
                    <th className="p-1 border">card_id</th>
                    <th className="p-1 border">meta</th>
                    <th className="p-1 border">created_at</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event, i) => (
                    <tr key={i} className="border-b">
                      <td className="p-1 border">{event.event_type}</td>
                      <td className="p-1 border">{event.card_id?.substring(0, 8)}...</td>
                      <td className="p-1 border">{JSON.stringify(event.event_meta)}</td>
                      <td className="p-1 border">{new Date(event.created_at).toLocaleTimeString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-gray-500">Keine Events gefunden</div>
          )}
        </div>
        
        {/* Progress */}
        <div>
          <h4 className="font-medium mb-1">Progress ({progress.length})</h4>
          {progress.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-1 border">card_id</th>
                    <th className="p-1 border">time_spent_seconds</th>
                    <th className="p-1 border">status</th>
                    <th className="p-1 border">updated_at</th>
                  </tr>
                </thead>
                <tbody>
                  {progress.map((item, i) => (
                    <tr key={i} className="border-b">
                      <td className="p-1 border">{item.card_id?.substring(0, 8)}...</td>
                      <td className="p-1 border">{item.time_spent_seconds}</td>
                      <td className="p-1 border">{item.status}</td>
                      <td className="p-1 border">{new Date(item.updated_at).toLocaleTimeString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-gray-500">Kein Fortschritt gefunden</div>
          )}
        </div>
      </div>
    </div>
  );
}
