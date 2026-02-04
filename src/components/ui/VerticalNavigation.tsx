// src/components/ui/VerticalNavigation.tsx
// Zweck: Wiederverwendbare vertikale Navigation für verschiedene Entitäten (Profil, Restaurant, Content)
// Verantwortlichkeiten: Darstellung der Navigation, Handling der Tab-Auswahl, Mobile-First-Ansatz
// Anti-Beispiele: Keine Geschäftslogik, keine direkten API-Aufrufe

import React, { ReactNode } from 'react';
import '../../styles/vertical-tabs.css';

export interface NavigationItem {
  id: string;
  label: string;
  icon: ReactNode;
  badge?: {
    text: string;
    variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  };
}

export interface VerticalNavigationProps {
  items: NavigationItem[];
  activeItemId: string;
  onItemSelect: (id: string) => void;
  className?: string;
  contentClassName?: string;
  children?: ReactNode;
  mobileBreakpoint?: 'sm' | 'md' | 'lg' | 'xl';
  sidebarWidth?: string;
  collapsible?: boolean;
}

/**
 * Wiederverwendbare vertikale Navigation mit Mobile-First-Ansatz
 * 
 * @example
 * ```tsx
 * <VerticalNavigation
 *   items={[
 *     { id: 'profile', label: 'Profil', icon: <UserIcon /> },
 *     { id: 'settings', label: 'Einstellungen', icon: <SettingsIcon /> }
 *   ]}
 *   activeItemId="profile"
 *   onItemSelect={(id) => setActiveTab(id)}
 * >
 *   {activeTab === 'profile' && <ProfileContent />}
 *   {activeTab === 'settings' && <SettingsContent />}
 * </VerticalNavigation>
 * ```
 */
export function VerticalNavigation({
  items,
  activeItemId,
  onItemSelect,
  className = '',
  contentClassName = '',
  children,
  mobileBreakpoint = 'md',
  sidebarWidth = '240px',
  collapsible = false
}: VerticalNavigationProps) {
  const [collapsed, setCollapsed] = React.useState(false);
  
  // Bestimme die Breakpoint-Klasse basierend auf dem mobileBreakpoint
  const breakpointClass = `${mobileBreakpoint}:flex-row`;
  
  // Bestimme die Sidebar-Breite-Klasse
  const sidebarWidthStyle = { width: collapsed ? '60px' : sidebarWidth };
  const sidebarTransitionClass = 'transition-all duration-300 ease-in-out';
  
  // Badge-Varianten
  const getBadgeClass = (variant: string = 'default') => {
    switch (variant) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'info':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`vertical-tabs-container flex flex-col ${breakpointClass} ${className}`}>
      <div 
        className={`vertical-tabs ${sidebarTransitionClass}`}
        style={sidebarWidthStyle}
        role="tablist" 
        aria-label="Navigation"
      >
        {collapsible && (
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="w-full p-2 text-center border-b border-gray-200"
            aria-label={collapsed ? "Menü ausklappen" : "Menü einklappen"}
          >
            {collapsed ? '→' : '←'}
          </button>
        )}
        
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={activeItemId === item.id}
            aria-controls={`${item.id}-panel`}
            onClick={() => onItemSelect(item.id)}
            className={`vertical-tab-button ${activeItemId === item.id ? 'active' : ''}`}
          >
            <span className="tab-icon">{item.icon}</span>
            {!collapsed && (
              <>
                <span className="tab-label">{item.label}</span>
                {item.badge && (
                  <span className={`tab-badge ${getBadgeClass(item.badge.variant)}`}>
                    {item.badge.text}
                  </span>
                )}
              </>
            )}
          </button>
        ))}
      </div>
      
      <div className={`vertical-tab-content ${contentClassName}`}>
        {children}
      </div>
    </div>
  );
}

/**
 * Tab-Panel-Komponente für die Verwendung mit VerticalNavigation
 */
export interface TabPanelProps {
  id: string;
  active: boolean;
  children: ReactNode;
  className?: string;
}

export function TabPanel({ id, active, children, className = '' }: TabPanelProps) {
  if (!active) return null;
  
  return (
    <div 
      id={`${id}-panel`} 
      role="tabpanel" 
      aria-labelledby={`${id}-tab`}
      className={`tab-content active ${className}`}
    >
      {children}
    </div>
  );
}
