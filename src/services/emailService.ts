import { config } from '@/lib/config';

// This service would handle the actual email sending logic.
// It should only be active in live mode.

async function send(formData: any) {
  if (config.isDemoMode) {
    return { ok: true, message: "Email sending is disabled in demo mode." };
  }

  // In a real application, you would use a library like Resend or Nodemailer here.
  console.log("Sending email with data:", formData);
  // const response = await resend.emails.send(...);
  
  // Simulate a successful email send
  return { ok: true, message: "Email sent successfully (simulated)." };
}

export const emailService = {
  send,
};
