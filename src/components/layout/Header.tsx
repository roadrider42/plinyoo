// src/components/landing/Navbar.tsx
import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';

export default function Header() {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const desktopLinkBase = 'px-3 py-2 text-sm font-medium transition-colors border-b-2';
  const desktopLinkInactive = 'text-main-text hover:text-primary border-transparent';
  const desktopLinkActive = 'text-primary border-primary';

  const mobileLinkBase = 'text-2xl font-medium';
  const mobileLinkInactive = 'text-main-text hover:text-primary';
  const mobileLinkActive = 'text-primary';

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex-shrink-0">
            <Link to="/" className="text-xl font-bold font-sans text-primary">plinyoo</Link>
          </div>

          <div className="hidden md:flex flex-grow items-center justify-end gap-8">
            <nav className="flex items-center gap-6">
              <NavLink
                to="/mitmachen"
                className={({ isActive }) =>
                  `${desktopLinkBase} ${isActive ? desktopLinkActive : desktopLinkInactive}`
                }
              >
                {t('navigation.cta_primary')}
              </NavLink>
              <NavLink
                to="/investieren"
                className={({ isActive }) =>
                  `${desktopLinkBase} ${isActive ? desktopLinkActive : desktopLinkInactive}`
                }
              >
                {t('navigation.cta_secondary')}
              </NavLink>
            </nav>
            <LanguageSwitcher />
            {/* Anmelde-Buttons entfernt */}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-3">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-primary hover:text-accent hover:bg-primary/10 focus:outline-none"
              aria-expanded={isMenuOpen}
              aria-label="Hauptmenü umschalten"
            >
              {!isMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white md:hidden">
          <div className="flex flex-col items-center justify-center h-full space-y-6">
            <NavLink
              to="/mitmachen"
              className={({ isActive }) =>
                `${mobileLinkBase} ${isActive ? mobileLinkActive : mobileLinkInactive}`
              }
              onClick={() => setIsMenuOpen(false)}
            >
              {t('navigation.cta_primary')}
            </NavLink>
            <NavLink
              to="/investieren"
              className={({ isActive }) =>
                `${mobileLinkBase} ${isActive ? mobileLinkActive : mobileLinkInactive}`
              }
              onClick={() => setIsMenuOpen(false)}
            >
              {t('navigation.cta_secondary')}
            </NavLink>
            <div className="mt-8">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
