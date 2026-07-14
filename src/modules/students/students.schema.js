import { z } from 'zod';

export const createStudentSchema = z.object({
  body: z.object({
    full_name: z.string().min(1, 'Full name is required'),
    email: z.string().email('Invalid email address').optional(),
    phone: z.string().optional(),
    branch_id: z.string().uuid('Invalid branch ID').optional(),
    date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date of birth must be YYYY-MM-DD').optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    address: z.string().optional(),
    
    // Academic details
    class_id: z.string().uuid('Invalid class ID').optional(),
    section_id: z.string().uuid('Invalid section ID').optional(),
    academic_year_id: z.string().uuid('Invalid academic year ID').optional(),
    roll_number: z.string().optional(),

    // Parent details (if creating parent at same time)
    parent_id: z.string().uuid('Invalid parent ID').optional(),
    parent_name: z.string().optional(),
    parent_email: z.string().email('Invalid parent email').optional(),
    parent_phone: z.string().optional(),
    domain_id: z.string().uuid().optional(),
  }),
});

export const updateStudentSchema = z.object({
  body: z.object({
    full_name: z.string().optional(),
    email: z.string().email('Invalid email address').optional(),
    phone: z.string().optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date of birth must be YYYY-MM-DD').optional(),
    address: z.string().optional(),
    branch_id: z.string().uuid().optional(),
    domain_id: z.string().uuid().optional(),
    is_active: z.boolean().optional(),
    
    // Academic updates
    class_id: z.string().uuid().optional(),
    section_id: z.string().uuid().optional(),
    academic_year_id: z.string().uuid().optional(),
    roll_number: z.string().optional(),
  }),
});

export const selfUpdateSchema = z.object({
  body: z.object({
    phone: z.string().optional(),
    address: z.string().optional(),
    avatar_url: z.string().url().optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date of birth must be YYYY-MM-DD').optional(),
    // Note: Students cannot update their own role, branch_id, class, or email
  }),
});
