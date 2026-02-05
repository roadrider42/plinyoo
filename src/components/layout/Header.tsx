// src/components/landing/Navbar.tsx
import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';

export default function Header() {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const linkBase =
    'px-3 py-2 text-sm font-medium transition-colors';
  const linkInactive = 'text-main-text hover:text-primary';
  const linkActive = 'text-primary';

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex-shrink-0">
<<<<<<< /Users/heikomiertzsch/2. Areas/plinyoo/src/components/layout/Header.tsx
            <Link to="/" className="text-xl font-bold font-sans text-text">plinyoo</Link>
=======
            <Link to="/" className="text-xl font-bold font-headline text-primary">plinyoo</Link>
>>>>>>> /Users/heikomiertzsch/.windsurf/worktrees/plinyoo/plinyoo-a7eb93d5/src/components/layout/Header.tsx
          </div>

          <div className="hidden md:flex flex-grow items-center justify-end gap-8">
            <nav className="flex items-center gap-6">
              <NavLink
                to="/mitmachen"
                className={({ isActive }) =>
                  `${linkBase} ${isActive ? linkActive : linkInactive}`
                }
              >
                {t('navigation.cta_primary')}
              </NavLink>
              <NavLink
                to="/investieren"
                className={({ isActive }) =>
                  `${linkBase} ${isActive ? linkActive : linkInactive}`
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

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <NavLink
              to="/mitmachen"
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-base font-medium ${isActive ? linkActive : 'text-main-text hover:bg-primary/10 hover:text-primary'}`
              }
              onClick={() => setIsMenuOpen(false)}
            >
              {t('navigation.cta_primary')}
            </NavLink>
            <NavLink
              to="/investieren"
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-base font-medium ${isActive ? linkActive : 'text-main-text hover:bg-primary/10 hover:text-primary'}`
              }
              onClick={() => setIsMenuOpen(false)}
            >
              {t('navigation.cta_secondary')}
            </NavLink>
            <div className="mt-4 flex justify-center">
              <LanguageSwitcher />
            </div>
            {/* Anmelde-Link entfernt */}
          </div>
        </div>
      )}
    </header>
  );
}
