import { z } from 'zod';

export const examSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    type: z.enum(['unit_test', 'midterm', 'final', 'practice', 'competition']),
    class_id: z.string().uuid().optional(),
    section_id: z.string().uuid().optional(),
    subject_id: z.string().uuid().optional(),
    academic_year_id: z.string().uuid(),
    exam_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
    start_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(),
    end_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(),
    total_marks: z.number().positive(),
    passing_marks: z.number().positive().optional(),
    instructions: z.string().optional(),
  }),
});

export const resultSchema = z.object({
  body: z.object({
    results: z.array(
      z.object({
        student_id: z.string().uuid(),
        marks_obtained: z.number().min(0).optional(),
        is_absent: z.boolean().optional(),
        remarks: z.string().optional(),
      })
    ).min(1, 'At least one result must be provided'),
  }),
});
