import { z } from 'zod';

export const createNoticeSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    content: z.string().min(1, 'Content is required'),
    banner_url: z.string().url().or(z.literal('')).nullable().optional(),
    type: z.enum(['event', 'news', 'update', 'alert']).optional(),
    is_published: z.boolean().optional(),
  }),
});

export const updateNoticeSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    content: z.string().optional(),
    banner_url: z.string().url().or(z.literal('')).nullable().optional(),
    type: z.enum(['event', 'news', 'update', 'alert']).optional(),
    is_published: z.boolean().optional(),
  }),
});
