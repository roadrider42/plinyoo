// src/hooks/hook.useContactForm.ts
import { useMutation } from 'react-query';
import { sendContactForm } from '@/services/svc.contact';

// sendContactForm wirft bei jedem Fehler (#483) -- onSuccess heisst also
// wirklich: die Randfunktion hat mit 2xx geantwortet.
export function useContactForm() {
  return useMutation<void, Error, unknown>((formData: unknown) => sendContactForm(formData), {
    onError: (error: Error) => {
      console.error('Error submitting form:', error.name);
    },
  });
}
