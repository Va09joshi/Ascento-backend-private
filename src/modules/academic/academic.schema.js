import { z } from 'zod';

export const academicYearSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required (e.g. 2024-25)'),
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid start date format (YYYY-MM-DD)'),
    end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid end date format (YYYY-MM-DD)'),
    is_current: z.boolean().optional(),
    branch_id: z.string().uuid().optional(),
  }).refine((data) => new Date(data.start_date) < new Date(data.end_date), {
    message: "End date must be after start date",
    path: ["end_date"],
  }),
});
