/**
 * AuthDebug.tsx
 * 
 * Einfache Komponente zur Anzeige des Authentifizierungsstatus
 * Hilft bei der Diagnose von Authentifizierungsproblemen
 */

import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function AuthDebug() {
  const [authStatus, setAuthStatus] = useState<{
    isAuthenticated: boolean;
    userId?: string;
    email?: string;
    error?: string;
  }>({
    isAuthenticated: false
  });

  useEffect(() => {
    async function checkAuth() {
      try {
        const { data, error } = await supabase().auth.getSession();
        
        if (error) {
          console.error('Fehler beim Abrufen der Session:', error);
          setAuthStatus({
            isAuthenticated: false,
            error: error.message
          });
          return;
        }
        
        if (data?.session) {
          setAuthStatus({
            isAuthenticated: true,
            userId: data.session.user.id,
            email: data.session.user.email
          });
          
          // Direkter Test: Versuche, einen Eintrag in user_learning_progress_new zu schreiben
          // Wir verwenden user_learning_progress_new statt user_learning_events, um den Trigger zu umgehen
          const testResult = await supabase()
            .from('user_learning_progress_new')
            .upsert({
              user_id: data.session.user.id,
              card_id: '00000000-0000-0000-0000-000000000001', // Verwende eine gültige UUID
              time_spent_seconds: 5,
              status: 'in_progress', // Erlaubte Werte: 'not_started', 'in_progress', 'completed'
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'user_id,card_id',
              ignoreDuplicates: false
            });
            
          if (testResult.error) {
            console.error('Test-Schreibzugriff fehlgeschlagen:', testResult.error);
            setAuthStatus(prev => ({
              ...prev,
              error: `Schreibzugriff fehlgeschlagen: ${testResult.error.message}`
            }));
          } else {
            console.log('Test-Schreibzugriff erfolgreich!');
          }
          
          // Teste auch die RPC-Funktion
          // Verwende die gleichen Testwerte wie oben zur Konsistenz
          const cardId = '00000000-0000-0000-0000-000000000001';
          const seconds = 5;
          const rpcResult = await supabase().rpc('increment_time_spent', {
            p_user_id: data.session.user.id,
            p_card_id: cardId, // Verwende eine gültige UUID
            p_seconds: seconds
          });
          
          if (rpcResult.error) {
            console.error('RPC-Test fehlgeschlagen:', rpcResult.error);
            setAuthStatus(prev => ({
              ...prev,
              error: `${prev.error || ''}\nRPC fehlgeschlagen: ${rpcResult.error.message}`
            }));
          } else {
            console.log('RPC-Test erfolgreich!');
          }
        } else {
          setAuthStatus({
            isAuthenticated: false
          });
        }
      } catch (error) {
        console.error('Unerwarteter Fehler:', error);
        setAuthStatus({
          isAuthenticated: false,
          error: error instanceof Error ? error.message : 'Unbekannter Fehler'
        });
      }
    }
    
    checkAuth();
  }, []);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-xs">
      <h3 className="font-semibold mb-2">Auth Debug</h3>
      <div className="space-y-1">
        <div>
          Status: <span className={authStatus.isAuthenticated ? 'text-green-600' : 'text-red-600'}>
            {authStatus.isAuthenticated ? 'Authentifiziert ✓' : 'Nicht authentifiziert ✗'}
          </span>
        </div>
        {authStatus.userId && (
          <div>User ID: {authStatus.userId.substring(0, 8)}...</div>
        )}
        {authStatus.email && (
          <div>Email: {authStatus.email}</div>
        )}
        {authStatus.error && (
          <div className="text-red-600 whitespace-pre-wrap">{authStatus.error}</div>
        )}
      </div>
    </div>
  );
}
