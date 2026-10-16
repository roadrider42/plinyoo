// src/pages/Zugang/ZugangPage.tsx
// Zweck: Zugang anfragen — für Lernende, Kuratoren und Wegbereiter (Gegenstück zum Mitmachen-Formular für Mitentwickler).
// Versand: derselbe Weg wie Kontakt (Edge Function plinyoo-contact, formType 'contact'). Die Edge Function und die
// Datenbank kennen keinen eigenen Formulartyp; die Zugangsanfrage steht deshalb als Kopfzeile in der Nachricht.
// Herkunft (Buchseite, Kanal) kommt aus der Adresse und steht ebenfalls als Kopfzeile (src/lib/kampagne.ts).

import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useContactForm } from '@/hooks/hook.useContactForm';
import { useToast } from '@/components/ui/use-toast';
import { getKampagne, kampagneZeilen } from '@/lib/kampagne';

// Beschriftungen für den Posteingang — fest deutsch, unabhängig von der Sprache der Seite
const ROLE_FOR_INBOX: Record<string, string> = {
  learner: 'Lernende:r',
  curator: 'Kurator:in (will Wissen weitergeben)',
  wegbereiter: 'Wegbereiter:in (führt ein Team)',
  other: 'Etwas anderes',
};

export default function ZugangPage() {
  const { t, i18n } = useTranslation();
  const { toast, dismiss } = useToast();
  const contactMutation = useContactForm();

  useEffect(() => () => dismiss(), [dismiss]);

  // Vorauswahl der Rolle, wenn der Besucher über eine der drei Türen kommt (?rolle=…)
  const [searchParams] = useSearchParams();
  const rolleAusAdresse = searchParams.get('rolle') ?? '';
  const rolleStart = (['learner', 'curator', 'wegbereiter', 'other'] as string[]).includes(rolleAusAdresse) ? rolleAusAdresse : '';

  const [form, setForm] = useState({ name: '', email: '', role: rolleStart, message: '' });

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lines = [
      '[Zugang anfragen]',
      `Ich komme als: ${ROLE_FOR_INBOX[form.role] ?? 'keine Angabe'}`,
      `Sprache der Seite: ${i18n.resolvedLanguage || i18n.language}`,
      ...kampagneZeilen(getKampagne()),
      '',
      form.message,
    ];
    contactMutation.mutate(
      { name: form.name, email: form.email, message: lines.join('\n'), formType: 'contact' },
      {
        onSuccess: () => {
          // Messpunkt ohne Personenbezug: nur Rolle (Schlüssel) und Buch (Kennung), nie Name, E-Mail oder Nachricht
          try {
            (window as unknown as { plausible?: (e: string, o?: object) => void }).plausible?.('Zugang angefragt', {
              props: { rolle: form.role || 'keine Angabe', buch: getKampagne().buch || 'ohne Buch' },
            });
          } catch { /* Messung darf die Anfrage nie stören */ }
          toast({ title: t('forms.validation.success_title'), description: t('forms.validation.success_message') });
        },
        onError: (error: any) => {
          toast({ title: t('forms.validation.error_title'), description: error.message || t('forms.validation.error_generic') });
        },
      },
    );
  };

  const roleKeys = ['learner', 'curator', 'wegbereiter', 'other'] as const;

  return (
    <main className="bg-main-background text-main-text">
      <section className="max-w-4xl mx-auto px-6 md:px-12 py-16">
        <div>
          <Link to="/" className="inline-block mb-8 text-sm text-primary hover:underline">
            &larr; {t('forms.back_to_home')}
          </Link>
        </div>
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold font-sans text-primary">{t('forms.access.title')}</h1>
          <p className="mt-3 text-lg">{t('forms.access.subtitle')}</p>
          <p className="text-sm text-gray-500 mt-1">{t('forms.access.subtitle_details')}</p>
        </div>

        {!contactMutation.isSuccess ? (
          <form onSubmit={onSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="zugang-name" className="block text-sm font-medium">{t('forms.common.name_label')}</label>
                <input id="zugang-name" name="name" value={form.name} onChange={onChange} className="mt-1 w-full rounded-lg border p-2" required />
              </div>
              <div>
                <label htmlFor="zugang-email" className="block text-sm font-medium">{t('forms.common.email_label')}</label>
                <input id="zugang-email" type="email" name="email" value={form.email} onChange={onChange} className="mt-1 w-full rounded-lg border p-2" required />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="zugang-role" className="block text-sm font-medium">{t('forms.access.role_label')}</label>
                <select id="zugang-role" name="role" value={form.role} onChange={onChange} className="mt-1 w-full rounded-lg border p-2">
                  <option value="">{t('forms.access.role_placeholder')}</option>
                  {roleKeys.map((key) => (
                    <option key={key} value={key}>{t(`forms.access.role_options.${key}`)}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="zugang-message" className="block text-sm font-medium">{t('forms.access.message_label')}</label>
              <textarea
                id="zugang-message"
                name="message"
                value={form.message}
                onChange={onChange}
                rows={5}
                placeholder={t('forms.access.message_placeholder')}
                className="mt-1 w-full rounded-lg border p-2"
              />
            </div>

            <div className="flex justify-end">
              <button type="submit" disabled={contactMutation.isLoading} className="w-full bg-highlight text-white font-bold py-3 px-4 rounded-lg hover:bg-opacity-90 transition disabled:opacity-50">
                {contactMutation.isLoading ? t('forms.button_sending') : t('forms.access.button')}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-4 text-center">{t('forms.privacy_notice')}</p>
          </form>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold font-sans text-primary">{t('forms.success.title')}</h2>
            <p className="mt-2 text-lg">{t('forms.success.message')}</p>
            <Link to="/" className="inline-block mt-8 px-6 py-2 text-sm font-semibold text-primary bg-transparent border-2 border-primary rounded-lg hover:bg-primary/10 transition-colors">
              {t('forms.back_to_home')}
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
