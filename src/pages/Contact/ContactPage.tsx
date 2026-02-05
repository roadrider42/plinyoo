// src/pages/KontaktPage.tsx
import React, { useState, useEffect } from "react";
import { useContactForm } from '@/hooks/hook.useContactForm';
import { Link } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import { useToast } from "@/components/ui/use-toast";

export default function KontaktPage() {
  const { t } = useTranslation();
  const { toast, dismiss } = useToast();
  const contactMutation = useContactForm();
  useEffect(() => {
    return () => {
      dismiss();
    };
  }, [dismiss]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    message: ""
  });

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    contactMutation.mutate({ ...form, formType: 'contact' }, {
      onSuccess: () => {
        toast({ title: t('forms.validation.success_title'), description: t('forms.validation.success_message') });
      },
      onError: (error: any) => {
        toast({ title: t('forms.validation.error_title'), description: error.message || t('forms.validation.error_generic') });
      }
    });
  };

  return (
    <main className="bg-main-background text-main-text">
      <section className="max-w-4xl mx-auto px-6 md:px-12 py-16">
        <div>
          <Link to="/" className="inline-block mb-8 text-sm text-primary hover:underline"> &larr; {t('forms.back_to_home')} </Link>
        </div>
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-sans font-semibold text-text">{t('forms.use_case.title')}</h1>
          <p className="mt-3 text-lg">
            {t('forms.use_case.subtitle')}
          </p>
        </div>

        {!contactMutation.isSuccess ? (
          <form onSubmit={onSubmit} className="bg-surface-1 border border-border shadow-ci rounded-xl p-6 md:p-8 space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">{t('forms.common.name_label')}</label>
                <input name="name" value={form.name} onChange={onChange} className="mt-1 w-full rounded-lg border p-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium">{t('forms.common.email_label')}</label>
                <input type="email" name="email" value={form.email} onChange={onChange} className="mt-1 w-full rounded-lg border p-2" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium">{t('forms.common.message_label')}</label>
              <textarea name="message" value={form.message} onChange={onChange} rows={5} className="mt-1 w-full rounded-lg border p-2" placeholder={t('forms.use_case.message_placeholder')}></textarea>
            </div>
            <p className="text-xs text-gray-500">{t('forms.privacy_notice')}</p>
            <button type="submit" disabled={contactMutation.isLoading} className="w-full bg-primary text-text-inverse px-5 py-3 rounded-lg shadow-ci hover:shadow-ci-lg transition disabled:opacity-50">
              {contactMutation.isLoading ? t('forms.button_sending') : t('forms.button_send_request')}
            </button>
          </form>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-sans font-semibold text-text">{t('forms.success.title')}</h2>
            <p className="mt-2 text-lg">{t('forms.success.message')}</p>
            <Link to="/" className="inline-block mt-8 bg-surface-1 border border-border text-text px-5 py-3 rounded-lg hover:border-border-strong transition">
              {t('forms.back_to_home')}
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
