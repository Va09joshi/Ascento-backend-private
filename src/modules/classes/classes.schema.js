import { z } from 'zod';

export const classSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required (e.g. Level 1)'),
    description: z.string().optional(),
    branch_id: z.string().uuid().optional(),
    academic_year_id: z.string().uuid().optional(),
    order_index: z.number().int().optional(),
    is_active: z.boolean().optional(),
  }),
});
