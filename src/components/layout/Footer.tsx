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
    <footer className="bg-primary text-white py-12 mt-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            <h3 className="font-bold font-serif text-lg">plinyoo</h3>
            <p className="text-sm text-gray-400 mt-2">{t('footer.brand.subtitle')}</p>
          </div>
          <div className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2 mt-4 md:mt-0 text-sm">
            <Link to="/impressum" className="text-gray-400 hover:text-white">{t('footer.links.imprint')}</Link>
            <Link to="/datenschutz" className="text-gray-400 hover:text-white">{t('footer.links.privacy')}</Link>
            <Link to="/urheberrecht" className="text-gray-400 hover:text-white">{t('footer.links.copyright')}</Link>
            <Link to="/mitmachen" className="text-gray-400 hover:text-white">{t('footer.links.join')}</Link>
            <Link to="/investieren" className="text-gray-400 hover:text-white">{t('footer.links.invest')}</Link>
            <Link to="/kontakt" className="text-gray-400 hover:text-white">{t('footer.links.contact')}</Link>
          </div>
        </div>
      </div>
      <div className="mt-8 text-center text-xs text-gray-400">
        &copy; {new Date().getFullYear()} plinyoo. {t('footer.copyright')}
      </div>
    </footer>
  );
}
