import { z } from 'zod';

export const branchSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    city: z.string().optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    logo_url: z.string().url().optional().or(z.literal('')),
    is_active: z.boolean().optional(),
  }),
});
