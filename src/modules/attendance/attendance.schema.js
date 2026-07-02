import { z } from 'zod';

export const markAttendanceSchema = z.object({
  body: z.object({
    section_id: z.string().uuid(),
    subject_id: z.string().uuid(),
    course_id: z.string().uuid().optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    records: z.array(
      z.object({
        student_id: z.string().uuid(),
        present: z.boolean(),
        late: z.boolean().optional(),
        remarks: z.string().optional(),
      })
    ).min(1),
  }),
});
