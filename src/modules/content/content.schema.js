import { z } from 'zod';

export const updateContentSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    order_index: z.number().int().optional(),
  }),
});
