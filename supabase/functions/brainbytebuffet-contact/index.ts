import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.4";
import { Resend } from 'https://esm.sh/resend@3.4.0';

// 1. Complete CORS Headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface FormData {
  name: string;
  email: string;
  message?: string;
  formType: 'contact' | 'join' | 'invest';
  role?: string;
  availability?: string;
  linkedin?: string;
  github?: string;
  investment_range?: string;
}

function createSubject(formType: FormData['formType']): string {
  switch (formType) {
    case 'join': return 'Neue Mitmachen-Anfrage';
    case 'invest': return 'Neue Investoren-Anfrage';
    default: return 'Neue Kontaktanfrage (Use Case)';
  }
}

function createEmailBody(formData: FormData): string {
  let body = `Neue Anfrage über das ${formData.formType}-Formular:\n\n`;
  body += `Name: ${formData.name}\n`;
  body += `E-Mail: ${formData.email}\n`;
  if (formData.formType === 'join') {
    body += `Rolle/Skill: ${formData.role || 'N/A'}\n`;
    body += `Verfügbarkeit: ${formData.availability || 'N/A'}\n`;
    body += `LinkedIn: ${formData.linkedin || 'N/A'}\n`;
    body += `GitHub: ${formData.github || 'N/A'}\n`;
  } else if (formData.formType === 'invest') {
    body += `Investitionsrahmen: ${formData.investment_range || 'N/A'}\n`;
    body += `LinkedIn: ${formData.linkedin || 'N/A'}\n`;
  }
  if (formData.message) {
    body += `Nachricht: ${formData.message}\n`;
  }
  return body;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 3. Securely get environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const contactReceiverEmail = Deno.env.get("CONTACT_RECEIVER_EMAIL");

    if (!supabaseUrl || !serviceRoleKey || !resendApiKey || !contactReceiverEmail) {
      console.error("Server misconfiguration: Missing environment variables.");
      return new Response(JSON.stringify({ error: 'Server misconfigured' }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const formData: FormData = await req.json();

    // 2. Handle DB and Email errors properly
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
    const { error: dbError } = await supabaseAdmin.from("brainbytebuffet_contacts").insert({
      name: formData.name,
      email: formData.email,
      message: formData.message || null,
      form_type: formData.formType,
    });

    if (dbError) {
      console.error("DB Insert Error:", dbError);
      return new Response(JSON.stringify({ error: 'Failed to save contact' }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resend = new Resend(resendApiKey);
    const { error: emailError } = await resend.emails.send({
      from: 'BrainByteBuffet <noreply@email.spoonup.me>',
      to: [contactReceiverEmail],
      subject: createSubject(formData.formType),
      text: createEmailBody(formData),
    });

    if (emailError) {
      console.error("Resend Email Error:", emailError);
      return new Response(JSON.stringify({ error: 'Failed to send email' }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ message: 'Form submitted successfully' }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Request Handling Error:", err);
    return new Response(JSON.stringify({ error: 'Bad Request' }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});