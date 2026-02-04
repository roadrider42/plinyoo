// src/hooks/hook.useContactForm.ts
import { useMutation } from 'react-query';
import { sendContactForm } from '@/services/svc.contact';

export function useContactForm() {
  return useMutation((formData: unknown) => sendContactForm(formData), {
    onSuccess: (data: void | { ok: boolean; data?: any; error?: any }) => {
      // This can be used to show a success toast or redirect
      console.log('Form submitted successfully:', data);
    },
    onError: (error: Error) => {
      // This will be caught by react-query and can be used to show an error toast
      console.error('Error submitting form:', error);
    },
  });
}
