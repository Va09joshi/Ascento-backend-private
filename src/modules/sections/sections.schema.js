import { z } from 'zod';

export const sectionSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required (e.g. Section A)'),
    class_id: z.string().uuid('Valid class ID is required'),
    teacher_id: z.string().uuid().optional(),
    max_students: z.number().int().optional(),
    room_number: z.string().optional(),
    is_active: z.boolean().optional(),
  }),
});

export const assignTeacherSchema = z.object({
  body: z.object({
    teacher_id: z.string().uuid('Valid teacher ID is required'),
  }),
});
