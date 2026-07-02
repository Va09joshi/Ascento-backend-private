import { z } from 'zod';

export const createOrderSchema = z.object({
  body: z.object({
    course_id: z.string().uuid().optional(),
    enrollment_id: z.string().uuid().optional(),
    amount: z.number().positive(),
  }),
});

export const verifyPaymentSchema = z.object({
  body: z.object({
    razorpay_order_id: z.string(),
    razorpay_payment_id: z.string(),
    razorpay_signature: z.string(),
  }),
});
