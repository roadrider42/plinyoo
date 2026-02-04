// src/routes/routes.helpers.ts
// Zweck: Service-Funktionen für das Routing-System
// Verantwortlichkeiten: Pfadgenerierung, Zugriffsprüfung, Breadcrumbs
// Anti-Beispiele: Keine UI-Komponenten, keine direkte Navigation

import { useNavigate, useLocation } from 'react-router-dom';
import { useCallback } from 'react';
import { RouteKey, RouteMetadata } from './routes.types';
import { ROUTES } from './routes.catalog';
import { UserRole } from '../domain/dom.roles.types';
import { Result, ok, err } from '../services/svc.types';

/**
 * Generiert einen Pfad für eine Route mit optionalen Parametern
 * 
 * @param key Route-Key aus dem Katalog
 * @param params Optionale Parameter für dynamische Routen
 * @param queryParams Optionale Query-Parameter
 * @returns Der generierte Pfad
 */
export function getRoutePath(
  key: RouteKey, 
  params?: Record<string, string>,
  queryParams?: Record<string, string>
): Result<string> {
  const route = ROUTES[key];
  if (!route) {
    return err('INVALID_ROUTE', { 
      userMessage: 'Die angeforderte Route existiert nicht.',
      devMessage: `Route mit Key "${key}" nicht gefunden!`
    });
  }

  let path = route.path;
  
  // Parameter ersetzen (z.B. /invite/:token -> /invite/abc123)
  if (params) {
    try {
      Object.entries(params).forEach(([param, value]) => {
        if (!value) {
          throw new Error(`Parameter "${param}" hat keinen Wert`);
        }
        path = path.replace(`:${param}`, encodeURIComponent(value));
      });
    } catch (error) {
      return err('INVALID_PARAMS', {
        userMessage: 'Ungültige Parameter für die Route.',
        devMessage: `Fehler beim Ersetzen der Parameter: ${error}`,
        cause: error
      });
    }
  }
  
  // Prüfen, ob noch Parameter-Platzhalter vorhanden sind
  if (path.includes(':')) {
    return err('MISSING_PARAMS', {
      userMessage: 'Fehlende Parameter für die Route.',
      devMessage: `Route "${key}" enthält noch Parameter-Platzhalter: ${path}`
    });
  }
  
  // Query-Parameter hinzufügen
  if (queryParams && Object.keys(queryParams).length > 0) {
    try {
      const queryString = Object.entries(queryParams)
        .filter(([_, value]) => value !== undefined && value !== null)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');
      
      if (queryString) {
        path = `${path}?${queryString}`;
      }
    } catch (error) {
      return err('INVALID_QUERY_PARAMS', {
        userMessage: 'Ungültige Query-Parameter für die Route.',
        devMessage: `Fehler beim Generieren der Query-Parameter: ${error}`,
        cause: error
      });
    }
  }
  
  return ok(path);
}

/**
 * Prüft, ob ein Benutzer Zugriff auf eine Route hat
 * 
 * @param routeKey Route-Key aus dem Katalog
 * @param userRole Rolle des Benutzers (undefined = nicht eingeloggt)
 * @returns true, wenn der Benutzer Zugriff hat
 */
export function canAccessRoute(routeKey: RouteKey, userRole?: UserRole | null): Result<boolean> {
  const route = ROUTES[routeKey];
  if (!route) {
    return err('INVALID_ROUTE', { 
      userMessage: 'Die angeforderte Route existiert nicht.',
      devMessage: `Route mit Key "${routeKey}" nicht gefunden!`
    });
  }
  
  // Öffentliche Routen sind immer zugänglich
  if (route.access === 'public') {
    return ok(true);
  }
  
  // Für geschützte und rollenbasierte Routen muss der Benutzer eingeloggt sein
  if (!userRole) {
    return ok(false);
  }
  
  // Für rollenbasierte Routen muss der Benutzer die richtige Rolle haben
  if (route.access === 'role-based') {
    if (!route.allowedRoles?.includes(userRole)) {
      return ok(false);
    }
  }
  
  return ok(true);
}

/**
 * Generiert Breadcrumbs für eine Route
 * 
 * @param routeKey Route-Key aus dem Katalog
 * @returns Array von Breadcrumb-Objekten
 */
export function generateBreadcrumbs(routeKey: RouteKey): Result<Array<{ key: RouteKey; title: string; path: string }>> {
  const breadcrumbs: Array<{ key: RouteKey; title: string; path: string }> = [];
  
  let currentRoute = ROUTES[routeKey];
  if (!currentRoute) {
    return err('INVALID_ROUTE', { 
      userMessage: 'Die angeforderte Route existiert nicht.',
      devMessage: `Route mit Key "${routeKey}" nicht gefunden!`
    });
  }
  
  // Aktuelle Route hinzufügen
  breadcrumbs.unshift({
    key: routeKey,
    title: currentRoute.title,
    path: currentRoute.path
  });
  
  // Eltern-Routen rekursiv hinzufügen
  try {
    while (currentRoute.parent) {
      const parentKey = currentRoute.parent as RouteKey;
      const parentRoute = ROUTES[parentKey];
      
      if (!parentRoute) {
        return err('INVALID_PARENT_ROUTE', {
          userMessage: 'Fehler beim Generieren der Breadcrumbs.',
          devMessage: `Eltern-Route "${parentKey}" nicht gefunden!`
        });
      }
      
      breadcrumbs.unshift({
        key: parentKey,
        title: parentRoute.title,
        path: parentRoute.path
      });
      
      currentRoute = parentRoute;
    }
  } catch (error) {
    return err('BREADCRUMB_ERROR', {
      userMessage: 'Fehler beim Generieren der Breadcrumbs.',
      devMessage: `Fehler beim Generieren der Breadcrumbs: ${error}`,
      cause: error
    });
  }
  
  // Home-Route am Anfang hinzufügen, wenn nicht bereits enthalten
  if (routeKey !== 'home' && !breadcrumbs.some(b => b.key === 'home')) {
    breadcrumbs.unshift({
      key: 'home',
      title: ROUTES.home.title,
      path: ROUTES.home.path
    });
  }
  
  return ok(breadcrumbs);
}

/**
 * Findet eine Route anhand eines Pfads
 * 
 * @param path URL-Pfad
 * @returns Route-Key und Parameter, wenn gefunden
 */
export function findRouteByPath(path: string): Result<{ key: RouteKey; params: Record<string, string> }> {
  // Query-Parameter entfernen
  const pathWithoutQuery = path.split('?')[0];
  
  // Exakte Übereinstimmung prüfen
  for (const [key, route] of Object.entries(ROUTES)) {
    if (route.path === pathWithoutQuery) {
      return ok({ key: key as RouteKey, params: {} });
    }
  }
  
  // Dynamische Routen prüfen
  for (const [key, route] of Object.entries(ROUTES)) {
    if (route.path.includes(':')) {
      const routeParts = route.path.split('/');
      const pathParts = pathWithoutQuery.split('/');
      
      if (routeParts.length === pathParts.length) {
        const params: Record<string, string> = {};
        let isMatch = true;
        
        for (let i = 0; i < routeParts.length; i++) {
          const routePart = routeParts[i];
          const pathPart = pathParts[i];
          
          if (routePart.startsWith(':')) {
            // Parameter extrahieren
            const paramName = routePart.substring(1);
            params[paramName] = decodeURIComponent(pathPart);
          } else if (routePart !== pathPart) {
            // Kein Match bei statischen Teilen
            isMatch = false;
            break;
          }
        }
        
        if (isMatch) {
          return ok({ key: key as RouteKey, params });
        }
      }
    }
  }
  
  return err('ROUTE_NOT_FOUND', {
    userMessage: 'Die angeforderte Seite wurde nicht gefunden.',
    devMessage: `Keine Route für Pfad "${path}" gefunden.`
  });
}

/**
 * Hook für typsichere Navigation
 * 
 * @example
 * ```tsx
 * const { navigateTo } = useRoutes();
 * 
 * // Typsichere Navigation zu einer Route
 * navigateTo('dashboard');
 * 
 * // Mit Parametern für dynamische Routen
 * navigateTo('invite', { token: 'abc123' });
 * 
 * // Mit Query-Parametern
 * navigateTo('login', {}, { redirect: '/dashboard' });
 * ```
 */
export function useTypedNavigate() {
  const navigate = useNavigate();
  
  const navigateTo = useCallback((
    routeKey: RouteKey, 
    params: Record<string, string> = {}, 
    queryParams: Record<string, string> = {},
    options?: { replace?: boolean }
  ) => {
    const pathResult = getRoutePath(routeKey, params, queryParams);
    
    if (pathResult.ok) {
      navigate(pathResult.data, options);
      return true;
    } else {
      console.error(`Navigation fehlgeschlagen: ${pathResult.error.code}`, pathResult.error);
      return false;
    }
  }, [navigate]);
  
  return {
    to: navigateTo,
    raw: navigate // Originale navigate-Funktion für spezielle Fälle
  };
}

/**
 * Hook zum Abrufen des aktuellen Route-Keys
 */
export function useCurrentRoute() {
  const location = useLocation();
  const pathname = location.pathname;
  
  const routeResult = findRouteByPath(pathname);
  
  if (routeResult.ok) {
    const { key, params } = routeResult.data;
    const metadata = ROUTES[key];
    
    return {
      key,
      metadata,
      params
    };
  }
  
  return {
    key: undefined,
    metadata: undefined,
    params: {}
  };
}
