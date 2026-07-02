import { z } from 'zod';

export const aiReportSchema = z.object({
  body: z.object({
    student_id: z.string().uuid(),
    academic_year_id: z.string().uuid().optional(),
  }),
});
