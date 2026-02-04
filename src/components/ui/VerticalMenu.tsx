// src/components/ui/VerticalMenu.tsx
// Zweck: Wiederverwendbare vertikale Menüführung für Mobile-First-Ansatz
// Verantwortlichkeiten: Menüpunkte anzeigen, Navigation auslösen
// Anti-Beispiele: Keine Geschäftslogik, keine direkten API-Aufrufe

import React from 'react';
import { BadgeProps, BadgeVariant } from '@/types/dom.profile.types';

/**
 * Badge-Komponente für Menüeinträge
 */
export function MenuBadge({ count, variant = 'default' }: BadgeProps) {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  };

  return (
    <span 
      className={`inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-full ${variantClasses[variant]}`}
      data-testid="menu-badge"
    >
      {count}
    </span>
  );
}

export interface MenuItem<T extends string = string> {
  id: T;
  label: string;
  icon?: React.ReactNode;
  badge?: {
    count?: number;
    variant?: BadgeVariant;
  };
  onClick?: () => void;
  isActive?: boolean;
}

export interface VerticalMenuProps<T extends string = string> {
  items: MenuItem<T>[];
  onItemClick?: (id: T) => void;
  className?: string;
  iconOnly?: boolean;
}

/**
 * Vertikale Menüführung mit Mobile-First-Ansatz
 * 
 * @example
 * ```tsx
 * <VerticalMenu
 *   items={[
 *     { id: 'profile', label: 'Profil', icon: <UserIcon /> },
 *     { id: 'settings', label: 'Einstellungen', icon: <SettingsIcon /> }
 *   ]}
 *   onItemClick={(id) => console.log('Clicked:', id)}
 * />
 * ```
 */
export function VerticalMenu<T extends string = string>({ 
  items, 
  onItemClick, 
  className = '',
  iconOnly = false
}: VerticalMenuProps<T>): React.ReactElement {
  const handleClick = (item: MenuItem<T>) => {
    if (item.onClick) {
      item.onClick();
    }
    if (onItemClick) {
      onItemClick(item.id);
    }
  };

  return (
    <div 
      className={`space-y-1 ${className}`}
      data-testid="vertical-menu"
      role="menu"
    >
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => handleClick(item)}
          className={`w-full flex items-center gap-3 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-700 px-3 py-3 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 border-l-4 ${
            item.isActive 
              ? 'border-l-spoonup-braun bg-gray-50 dark:bg-zinc-800 text-spoonup-braun dark:text-spoonup-gelb' 
              : 'border-l-transparent text-gray-700 dark:text-gray-300'
          }`}
          aria-selected={item.isActive}
          role="menuitem"
          data-testid={`menu-item-${item.id}`}
        >
          {item.icon && (
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-700">
              {item.icon}
            </span>
          )}
          
          {!iconOnly && (
            <>
              <span className="flex-1 font-medium text-sm">{item.label}</span>
              
              {item.badge && (
                <MenuBadge count={item.badge.count} variant={item.badge.variant} />
              )}
              
              <svg 
                className="h-4 w-4 text-gray-400" 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 20 20" 
                fill="currentColor"
                aria-hidden="true"
              >
                <path 
                  fillRule="evenodd" 
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" 
                  clipRule="evenodd" 
                />
              </svg>
            </>
          )}
          
          {/* Wenn iconOnly, dann zeige Badge als Overlay */}
          {iconOnly && item.badge && (
            <span className="absolute top-0 right-0 -mt-1 -mr-1">
              <MenuBadge count={item.badge.count} variant={item.badge.variant} />
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

