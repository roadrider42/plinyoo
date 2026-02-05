// src/pages/MitmachenPage.tsx
import React, { useState, useEffect } from "react";
import { useContactForm } from '@/hooks/hook.useContactForm';
import { Link } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import { useToast } from "@/components/ui/use-toast";


export default function MitmachenPage() {
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
    role: "",
    linkedin: "",
    github: "",
    availability: "",
    message: ""
  });


  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));


  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    contactMutation.mutate({ ...form, formType: 'join' }, {
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
          <h1 className="text-3xl md:text-4xl font-bold font-sans text-primary">{t('forms.join.title')}</h1>
          <p className="mt-3 text-lg">
            {t('forms.join.subtitle')}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {t('forms.join.subtitle_details')}
          </p>
        </div>


        {!contactMutation.isSuccess ? (
        <form onSubmit={onSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">{t('forms.common.name_label')}</label>
              <input name="name" value={form.name} onChange={onChange} className="mt-1 w-full rounded-lg border p-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium">{t('forms.common.email_label')}</label>
              <input type="email" name="email" value={form.email} onChange={onChange} className="mt-1 w-full rounded-lg border p-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium">{t('forms.join.role_label')}</label>
              <input name="role" value={form.role} onChange={onChange} placeholder={t('forms.join.role_placeholder')} className="mt-1 w-full rounded-lg border p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium">{t('forms.join.availability_label')}</label>
              <select name="availability" value={form.availability} onChange={onChange} className="mt-1 w-full rounded-lg border p-2">
                <option value="">{t('forms.join.availability_placeholder')}</option>
                <option value="fulltime">{t('forms.join.availability_options.fulltime')}</option>
                <option value="parttime">{t('forms.join.availability_options.parttime')}</option>
                <option value="freelance">{t('forms.join.availability_options.freelance')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">{t('forms.common.linkedin_label')}</label>
              <input name="linkedin" value={form.linkedin} onChange={onChange} className="mt-1 w-full rounded-lg border p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium">{t('forms.join.github_label')}</label>
              <input name="github" value={form.github} onChange={onChange} className="mt-1 w-full rounded-lg border p-2" />
            </div>
          </div>


          <div>
            <label className="block text-sm font-medium">{t('forms.join.motivation_label')}</label>
            <textarea name="message" value={form.message} onChange={onChange} rows={5} className="mt-1 w-full rounded-lg border p-2" />
          </div>


          <div className="flex justify-end">
            <button type="submit" disabled={contactMutation.isLoading} className="w-full bg-highlight text-white font-bold py-3 px-4 rounded-lg hover:bg-opacity-90 transition disabled:opacity-50">
              {contactMutation.isLoading ? t('forms.button_sending') : t('forms.button_send_interest')}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-4 text-center">
            {t('forms.privacy_notice')}
          </p>
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
