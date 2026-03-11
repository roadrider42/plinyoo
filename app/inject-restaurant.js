// Script zur direkten DOM-Manipulation
// Fügt eine Restaurant-Kachel direkt in das Dashboard ein

document.addEventListener('DOMContentLoaded', function() {
  // Warte kurz, um sicherzustellen, dass das Dashboard geladen ist
  setTimeout(() => {
    console.log('Injecting restaurant card...');
    
    // Finde den Container für die Hauptinhalte
    const mainContent = document.querySelector('main > div');
    
    if (!mainContent) {
      console.error('Main content container not found');
      return;
    }
    
    // Erstelle die Restaurant-Kachel
    const restaurantSection = document.createElement('div');
    restaurantSection.className = 'py-6';
    restaurantSection.innerHTML = `
      <h2 class="text-xl font-semibold text-spoonup-darkgray mb-4">Mein Restaurant</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div class="bg-white rounded-xl shadow-sm overflow-hidden border border-zinc-200">
          <div class="p-4">
            <h3 class="text-lg font-semibold mb-2">Hans</h3>
            <p class="text-sm text-zinc-600 mb-3">Restaurant Hans - Testdaten</p>
            <div class="flex items-center justify-between">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Follower
              </span>
              <button class="text-sm text-blue-600 hover:text-blue-800">
                Öffnen
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Füge die Kachel als erstes Element in den Container ein
    mainContent.insertBefore(restaurantSection, mainContent.firstChild);
    
    console.log('Restaurant card injected successfully');
  }, 1000);
});
