import React, { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, Transition } from '@headlessui/react';
import { Globe, ChevronDown, Check } from 'lucide-react';

const LANGUAGE_LABELS: Record<string, string> = {
  de: 'Deutsch',
  en: 'English',
  es: 'Español',
  fr: 'Français',
  pl: 'Polski',
  pt: 'Português',
  uk: 'Українська',
};

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const supportedLanguages = (i18n.options.supportedLngs || []).filter(
    (lng) => lng !== 'cimode'
  );

  const currentLng = (i18n.language || 'de').split('-')[0];

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="flex h-9 items-center gap-1.5 rounded-full border border-border bg-surface-1 px-3 text-xs font-medium text-text-muted transition-colors hover:text-main-text">
          <Globe className="h-4 w-4" aria-hidden="true" />
          <span className="uppercase">{currentLng}</span>
          <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-50 mt-2 w-40 origin-top-right rounded-xl border border-border bg-surface-1 py-1 shadow-lg focus:outline-none">
          {supportedLanguages.map((lng) => (
            <Menu.Item key={lng}>
              {({ active }) => (
                <button
                  onClick={() => changeLanguage(lng)}
                  className={`${
                    active ? 'bg-surface-2 text-primary' : 'text-text-muted'
                  } group flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm`}
                >
                  <span>{LANGUAGE_LABELS[lng] || lng}</span>
                  {lng === currentLng && (
                    <Check className="h-4 w-4 text-primary" aria-hidden="true" />
                  )}
                </button>
              )}
            </Menu.Item>
          ))}
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default LanguageSwitcher;
