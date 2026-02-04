/**
 * lib/galaxy-visualizer.ts
 * 
 * Zweck: Enthält die gesamte Logik zur Berechnung und zum Layout der Galaxie-Visualisierung.
 * Verantwortlichkeiten:
 * - Umrechnung der Gesamtzahl der Sterne in eine hierarchische Struktur (Galaxien, Sonnensysteme, Einzelsterne).
 * - Berechnung der (x, y)-Koordinaten für jedes visuelle Element, um ein ansprechendes Layout zu gewährleisten.
 * - Bereitstellung von testbaren, reinen Funktionen ohne Nebeneffekte.
 */

// === 1. Typdefinitionen für die visuelle Struktur ===

export interface Star {
  id: string;
  x: number;
  y: number;
  r: number; // Radius
  color: string;
}

export interface SolarSystem {
  id: string;
  sun: Star; // Die zentrale Sonne
  planets: Star[]; // Die umliegenden Sterne/Planeten
  size: 'small' | 'large'; // Unterscheidung zwischen 5er und 10er System
  x: number; // Zentrum X
  y: number; // Zentrum Y
}

export interface Galaxy {
  id: string;
  x: number;
  y: number;
  // Eine Galaxie ist eine visuelle Repräsentation und hat keine untergeordneten Sterne in diesem Modell.
  // Sie wird als eigenständiges, großes Objekt gerendert.
}

export interface GalaxyLayout {
  galaxies: Galaxy[];
  largeSolarSystems: SolarSystem[];
  smallSolarSystems: SolarSystem[];
  individualStars: Star[];
}

// === 2. Hauptfunktion zur Berechnung der Struktur ===

/**
 * Berechnet die hierarchische Struktur der Galaxie basierend auf der Gesamtzahl der Sterne.
 * @param totalStars Die Gesamtzahl der Sterne.
 * @returns Ein Objekt, das die Anzahl der Galaxien, Sonnensysteme und Einzelsterne beschreibt.
 */
export function calculateGalaxyStructure(totalStars: number): { galaxies: number; largeSystems: number; smallSystems: number; stars: number } {
  let remainingStars = totalStars;

  const galaxies = Math.floor(remainingStars / 100);
  remainingStars %= 100;

  const largeSystems = Math.floor(remainingStars / 10);
  remainingStars %= 10;

  const smallSystems = Math.floor(remainingStars / 5);
  remainingStars %= 5;

  const stars = remainingStars;

  return { galaxies, largeSystems, smallSystems, stars };
}

// === 3. Funktionen zur Layout-Berechnung ===

const PADDING = 15;
const SIZES = {
  GALAXY: { width: 100, height: 100 },
  LARGE_SOLAR_SYSTEM: { width: 70, height: 70 },
  SMALL_SOLAR_SYSTEM: { width: 50, height: 50 },
  STAR: { width: 15, height: 15 },
};

/**
 * Positioniert die Planeten kreisförmig um eine Sonne.
 * @param sun Die Sonne des Systems.
 * @param planets Die zu positionierenden Planeten.
 * @param orbitRadius Der Radius der Umlaufbahn.
 */
function positionPlanets(sun: Star, planets: Star[], orbitRadius: number) {
  if (planets.length === 0) return;
  const angleStep = (2 * Math.PI) / planets.length;
  planets.forEach((planet, i) => {
    const angle = angleStep * i;
    planet.x = sun.x + orbitRadius * Math.cos(angle);
    planet.y = sun.y + orbitRadius * Math.sin(angle);
  });
}

function getElementKey(element: Galaxy | SolarSystem | Star): keyof typeof SIZES {
  if ('planets' in element) {
    return element.size === 'large' ? 'LARGE_SOLAR_SYSTEM' : 'SMALL_SOLAR_SYSTEM';
  } else if ('color' in element) {
    return 'STAR';
  } else {
    return 'GALAXY';
  }
}

/**
 * Ordnet eine Liste von visuellen Elementen in einem Raster-Layout an.
 * @param elements Die zu positionierenden Elemente (Galaxien, Systeme, Sterne).
 * @param sizes Die Größeninformationen für jeden Element-Typ.
 * @param containerWidth Die Gesamtbreite des verfügbaren Bereichs.
 */
function arrangeElements(elements: (Galaxy | SolarSystem | Star)[], sizes: Record<string, { width: number; height: number }>, containerWidth: number, containerHeight: number = 320) {
  if (elements.length === 0) return;

  const rows: (Galaxy | SolarSystem | Star)[][] = [];
  let currentRow: (Galaxy | SolarSystem | Star)[] = [];
  let currentRowWidth = 0;

  // 1. Elemente in Reihen aufteilen
  elements.forEach(element => {
    const key = getElementKey(element);
    const size = sizes[key];
    if (currentRowWidth + size.width + PADDING > containerWidth - PADDING && currentRow.length > 0) {
      rows.push(currentRow);
      currentRow = [];
      currentRowWidth = 0;
    }
    currentRow.push(element);
    currentRowWidth += size.width + PADDING;
  });
  rows.push(currentRow);

  // 2. Gesamthöhe berechnen und vertikal zentrieren
  const totalHeight = rows.reduce((acc, row) => {
    const maxRowHeight = Math.max(...row.map(el => sizes[getElementKey(el)].height));
    return acc + maxRowHeight + PADDING;
  }, 0) - PADDING; // Letztes Padding abziehen

  let startY = (containerHeight - totalHeight) / 2;
  // Sicherstellen, dass der Startpunkt nicht zu weit oben ist, wenn die Überschrift Platz braucht
  startY = Math.max(startY, PADDING + 60); 

  // 3. Jede Reihe positionieren
  let currentY = startY;
  rows.forEach(row => {
    const maxRowHeight = Math.max(...row.map(el => sizes[getElementKey(el)].height));
    
    // Berechne die Gesamtbreite der Reihe für die horizontale Zentrierung
    const rowWidth = row.reduce((acc, el) => acc + sizes[getElementKey(el)].width + PADDING, 0) - PADDING;
    let currentX = (containerWidth - rowWidth) / 2;

    row.forEach(element => {
      const key = getElementKey(element);
      const size = sizes[key];
      
      // Zentriere das Element vertikal in der Reihe
      element.x = currentX + size.width / 2;
      element.y = currentY + maxRowHeight / 2;

      if ('planets' in element) {
        element.sun.x = element.x;
        element.sun.y = element.y;
        const orbitRadius = element.size === 'large' ? 28 : 18;
        positionPlanets(element.sun, element.planets, orbitRadius);
      }
      currentX += size.width + PADDING;
    });
    currentY += maxRowHeight + PADDING;
  });
}

/**
 * Hauptfunktion, die die Struktur berechnet und das Layout für die Visualisierung erstellt.
 * @param totalStars Die Gesamtzahl der Sterne.
 * @param width Die verfügbare Breite der SVG-Leinwand.
 * @param height Die verfügbare Höhe der SVG-Leinwand.
 * @returns Ein vollständiges GalaxyLayout-Objekt mit Koordinaten für das Rendering.
 */
export function generateGalaxyLayout(totalStars: number, width: number, height: number = 320): GalaxyLayout {
  // Handle the edge case of zero stars to prevent crashes.
  if (totalStars === 0) {
    return {
      galaxies: [],
      largeSolarSystems: [],
      smallSolarSystems: [],
      individualStars: [],
    };
  }

  const structure = calculateGalaxyStructure(totalStars);

  const layout: GalaxyLayout = {
    galaxies: Array.from({ length: structure.galaxies }, (_, i) => ({ id: `g${i}`, x: 0, y: 0 })),
    largeSolarSystems: Array.from({ length: structure.largeSystems }, (_, i) => ({
      id: `lss${i}`,
      sun: { id: `lss${i}-sun`, x: 0, y: 0, r: 7, color: '#FFD700' },
      planets: Array.from({ length: 9 }, (_, p) => ({ id: `lss${i}-p${p}`, x: 0, y: 0, r: 2.5, color: 'white' })),
      size: 'large',
      x: 0,
      y: 0,
    })),
    smallSolarSystems: Array.from({ length: structure.smallSystems }, (_, i) => ({
      id: `sss${i}`,
      sun: { id: `sss${i}-sun`, x: 0, y: 0, r: 5, color: '#FFA500' },
      planets: Array.from({ length: 4 }, (_, p) => ({ id: `sss${i}-p${p}`, x: 0, y: 0, r: 2, color: 'white' })),
      size: 'small',
      x: 0,
      y: 0,
    })),
    individualStars: Array.from({ length: structure.stars }, (_, i) => ({ id: `star${i}`, x: 0, y: 0, r: 2, color: 'white' }))
  };

  // Kombiniere alle Elemente in einer einzigen Liste, von groß nach klein, um sie anzuordnen
  const allElements = [
    ...layout.galaxies,
    ...layout.largeSolarSystems,
    ...layout.smallSolarSystems,
    ...layout.individualStars
  ];

  arrangeElements(allElements, SIZES, width, height);

  return layout;
}
