import { z } from 'zod';

export const courseSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    type: z.enum(['abacus', 'vedic_maths', 'mental_arithmetic']).optional(),
    level: z.number().int().optional(),
    duration_weeks: z.number().int().optional(),
    fee: z.number().min(0, 'Fee must be positive'),
    status: z.enum(['active', 'inactive', 'archived']).optional(),
    branch_id: z.string().uuid().optional(),
    class_id: z.string().uuid().optional(),
    thumbnail_url: z.string().url().optional().or(z.literal('')),
  }),
});
