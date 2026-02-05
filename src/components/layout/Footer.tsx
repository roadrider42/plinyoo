/**
 * ui.Footer.tsx
 * 
 * Zweck: Footer-Komponente für Landing Pages mit Marken-Information und Navigation
 * Verantwortlichkeiten:
 * - Darstellung von plinyoo-Branding und Kontaktinformationen
 * - Navigation zu wichtigen Seiten (Datenschutz, Impressum, etc.)
 * - Responsive Grid-Layout für verschiedene Bildschirmgrößen
 * - Konsistente Farbgebung mit plinyoo-Design-System
 * 
 * Anti-Beispiele:
 * - Geschäftslogik oder State-Management
 * - Direkte API-Aufrufe
 * - Komplexe Interaktionen (reine Präsentationskomponente)
 */

import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-primary text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          {/* Branding */}
          <div className="w-full md:w-1/3">
            <h3 className="font-bold font-sans text-xl text-white">plinyoo</h3>
            <p className="text-sm text-white/70 mt-2">{t('footer.brand.subtitle')}</p>
          </div>
          {/* Links */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-4 text-sm w-full md:w-auto">
            <Link to="/impressum" className="text-white/70 hover:text-white transition-colors">{t('footer.links.imprint')}</Link>
            <Link to="/datenschutz" className="text-white/70 hover:text-white transition-colors">{t('footer.links.privacy')}</Link>
            <Link to="/urheberrecht" className="text-white/70 hover:text-white transition-colors">{t('footer.links.copyright')}</Link>
            <Link to="/mitmachen" className="text-white/70 hover:text-white transition-colors">{t('footer.links.join')}</Link>
            <Link to="/investieren" className="text-white/70 hover:text-white transition-colors">{t('footer.links.invest')}</Link>
            <Link to="/kontakt" className="text-white/70 hover:text-white transition-colors">{t('footer.links.contact')}</Link>
          </div>
        </div>
        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-white/10 text-center text-xs text-white/50">
          &copy; {new Date().getFullYear()} plinyoo. {t('footer.copyright')}
        </div>
      </div>
    </footer>
  );
}
