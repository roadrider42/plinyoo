import { config } from '@/lib/config';

// This service will decide whether to use the live email service or a demo mock.

async function sendForm(formData: any) {
  if (config.isDemoMode) {
    console.log("--- DEMO MODE ---");
    console.log("Form data that would be sent:", formData);
    return { ok: true, message: "Demo submission successful." };
  } else {
    // In a real scenario, this would call the emailService.
    // For now, we'll just log it as if it were live.
    console.log("--- LIVE MODE ---");
    console.log("Sending form data via email service:", formData);
    // Replace with: return await emailService.send(formData);
    return { ok: true, message: "Live submission successful (simulated)." };
  }
}

export const formService = {
  sendForm,
};
