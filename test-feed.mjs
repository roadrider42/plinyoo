// test-feed.js - Einfacher Test für die Feed-Funktionalität
import { getOptimizedFeedCards } from './src/repositories/repo.feed-optimized.ts';
// supabase wird automatisch in getOptimizedFeedCards importiert

// Testfunktion
async function testFeed() {
  try {
    console.log('Starte Feed-Test...');
    
    // Beispiel-Parameter
    const params = {
      batch_size: 10,
      userId: 'eae62fd2-6ad0-4096-8640-9aad38e8744e', // Beispiel-User-ID
      // Optional: tagIds, difficulty, categoryId
    };
    
    console.log('Rufe getOptimizedFeedCards auf mit Parametern:', params);
    
    // Rufe die Funktion auf
    const result = await getOptimizedFeedCards(params);
    
    console.log(`Feed-Test erfolgreich! ${result.length} Karten geladen.`);
    console.log('Erste 3 Karten:', result.slice(0, 3).map(card => ({
      id: card.id,
      title: card.title,
      type: card.type,
      time_spent: card.time_spent
    })));
    
    return result;
  } catch (error) {
    console.error('Feed-Test fehlgeschlagen:', error);
    throw error;
  }
}

// Führe den Test aus
testFeed()
  .then(() => console.log('Test abgeschlossen.'))
  .catch(err => console.error('Test fehlgeschlagen:', err));
