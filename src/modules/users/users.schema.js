import { z } from 'zod';

export const createUserSchema = z.object({
  body: z.object({
    role: z.enum(['admin', 'teacher', 'student', 'parent']),
    full_name: z.string().min(1, 'Full name is required'),
    email: z.string().email('Invalid email address').optional(),
    phone: z.string().optional(),
    branch_id: z.string().uuid().optional(),
    date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    avatar_url: z.string().url().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    qualification: z.string().optional(),
    experience: z.coerce.number().int().optional(),
    is_active: z.preprocess((val) => val === 'true' || val === true, z.boolean()).optional(),
    
    // For students
    class_id: z.string().uuid().optional(),
    section_id: z.string().uuid().optional(),
    academic_year_id: z.string().uuid().optional(),
    roll_number: z.string().optional(),
    parent_id: z.string().uuid().optional(),
    parent_name: z.string().optional(),
    parent_email: z.string().email('Invalid parent email').optional(),
    parent_phone: z.string().optional(),
    domain_id: z.string().uuid().optional(),
  }),
});

export const updateUserSchema = z.object({
  body: z.object({
    full_name: z.string().optional(),
    email: z.string().email('Invalid email address').optional(),
    phone: z.string().optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    qualification: z.string().optional(),
    experience: z.coerce.number().int().optional(),
    avatar_url: z.string().url().optional(),
    branch_id: z.string().uuid().optional(),
    domain_id: z.string().uuid().optional(),
    is_active: z.preprocess((val) => val === 'true' || val === true, z.boolean()).optional(),
    class_id: z.string().uuid().optional(),
    section_id: z.string().uuid().optional(),
    academic_year_id: z.string().uuid().optional(),
    roll_number: z.string().optional(),
  }),
});

export const linkParentSchema = z.object({
  body: z.object({
    parent_id: z.string().uuid('Valid parent ID required'),
    student_id: z.string().uuid('Valid student ID required'),
    relationship: z.string().optional(),
  }),
});
