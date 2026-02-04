import { z } from 'zod';

export const ContactFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  message: z.string().optional(),
  formType: z.enum(['contact', 'join', 'invest']),
  // Fields for 'join' form
  role: z.string().optional(),
  availability: z.string().optional(),
  linkedin: z.string().optional(),
  github: z.string().optional(),
  // Fields for 'invest' form
  investment_range: z.string().optional(),
});
