import { z } from 'zod';

export const subjectSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    code: z.string().optional(),
    description: z.string().optional(),
    type: z.enum(['abacus', 'vedic_maths', 'mental_arithmetic', 'general']).optional(),
    branch_id: z.string().uuid().optional(),
    is_active: z.boolean().optional(),
  }),
});

export const assignToClassSchema = z.object({
  body: z.object({
    class_id: z.string().uuid('Valid class ID is required'),
    subject_id: z.string().uuid('Valid subject ID is required'),
    teacher_id: z.string().uuid('Valid teacher ID is required').optional(),
    periods_per_week: z.number().int().optional(),
  }),
});
