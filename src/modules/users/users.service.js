import { supabaseAdmin } from '../../config/supabase.js';
import { generateSecurePassword } from '../../utils/passwordGenerator.js';
// import { emailQueue } from '../../jobs/emailQueue.js'; // Will implement queue later
import crypto from 'crypto';

import { AppError } from '../../middleware/errorHandler.js';

const uploadUserAvatar = async (file) => {
  const fileExt = file.originalname.split('.').pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const filePath = `avatars/${fileName}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from(process.env.SUPABASE_STORAGE_BUCKET)
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
    });

  if (uploadError) throw new AppError(uploadError.message, 500);

  const { data: publicUrlData } = supabaseAdmin.storage
    .from(process.env.SUPABASE_STORAGE_BUCKET)
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
};

export const createUser = async (data, file) => {
  const tempPassword = generateSecurePassword();

  let avatar_url = data.avatar_url;
  if (file) {
    avatar_url = await uploadUserAvatar(file);
  }

  // 1. Create in Supabase Auth
  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: data.email,
    password: tempPassword,
    email_confirm: true,
  });

  if (authError) throw new AppError(authError.message, 400);

  // 2. Update users table (trigger creates initial row)
  const { data: user, error: dbError } = await supabaseAdmin.from('users').update({
    auth_id: authUser.user.id,
    role: data.role,
    full_name: data.full_name,
    email: data.email,
    phone: data.phone,
    branch_id: data.branch_id,
    domain_id: data.domain_id,
    date_of_birth: data.date_of_birth,
    gender: data.gender,
    address: data.address,
    avatar_url: avatar_url,
    must_change_password: true,
    created_by: data.created_by,
  }).eq('auth_id', authUser.user.id).select().single();

  if (dbError) throw new AppError(dbError.message, 400);

  // 3. Assign to section if student
  if (data.role === 'student' && data.section_id) {
    await supabaseAdmin.from('student_sections').insert({
      student_id: user.id,
      section_id: data.section_id,
      academic_year_id: data.academic_year_id,
      roll_number: data.roll_number,
    });
  }

  // 4. Link parent if provided
  if (data.role === 'student' && data.parent_id) {
    await supabaseAdmin.from('parent_student').insert({
      parent_id: data.parent_id,
      student_id: user.id,
    });
  }

  // Queue email (mocked for now, will connect to bullmq)
  // await emailQueue.add('welcome', { email: data.email, tempPassword });

  return { user, tempPassword };
};

export const listUsers = async (filters) => {
  let query = supabaseAdmin.from('users').select('*, branches(name)');

  if (filters.role) query = query.eq('role', filters.role);
  if (filters.branch_id) query = query.eq('branch_id', filters.branch_id);
  if (filters.is_active !== undefined) {
    query = query.eq('is_active', filters.is_active);
  } else {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  
  return data;
};

export const getUserById = async (id) => {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*, branches(name)')
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const updateUser = async (id, data, file) => {
  let avatar_url = data.avatar_url;
  
  if (file) {
    avatar_url = await uploadUserAvatar(file);
  }

  const payload = { ...data };
  if (avatar_url) {
    payload.avatar_url = avatar_url;
  }

  const { data: user, error } = await supabaseAdmin
    .from('users')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return user;
};

export const linkParent = async (data) => {
  const { error } = await supabaseAdmin.from('parent_student').insert(data);
  if (error) throw new Error(error.message);
};
