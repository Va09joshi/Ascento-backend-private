import { z } from 'zod';

export const createPeriodSchema = z.object({
  body: z.object({
    section_id: z.string().uuid(),
    subject_id: z.string().uuid(),
    teacher_id: z.string().uuid(),
    day_of_week: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
    start_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:MM)'),
    end_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:MM)'),
    room_number: z.string().optional(),
    academic_year_id: z.string().uuid(),
  }).refine((data) => data.start_time < data.end_time, {
    message: "End time must be after start time",
    path: ["end_time"],
  }),
});

export const updatePeriodSchema = createPeriodSchema;
