import { supabaseAdmin } from '../../config/supabase.js';
import { generateSecurePassword } from '../../utils/passwordGenerator.js';
import { sendWelcomeEmail } from '../../utils/emailService.js';
import crypto from 'crypto';

import { AppError } from '../../middleware/errorHandler.js';

export const assignStudentToSection = async (studentId, sectionId, academicYearId, rollNumberProvided) => {
  if (!sectionId || !academicYearId) return null;
  
  const { data: currentSection } = await supabaseAdmin
    .from('student_sections')
    .select('*')
    .eq('student_id', studentId)
    .eq('is_active', true)
    .maybeSingle();

  if (currentSection) {
    const updatePayload = {};
    if (sectionId) updatePayload.section_id = sectionId;
    if (academicYearId) updatePayload.academic_year_id = academicYearId;
    if (rollNumberProvided) updatePayload.roll_number = rollNumberProvided;

    if (Object.keys(updatePayload).length > 0) {
      await supabaseAdmin.from('student_sections')
        .update(updatePayload)
        .eq('student_id', studentId)
        .eq('is_active', true);
    }
    return;
  }

  let rollNumber = rollNumberProvided;

  if (!rollNumber) {
    const { data: existingStudents, error: fetchError } = await supabaseAdmin
      .from('student_sections')
      .select('roll_number')
      .eq('section_id', sectionId)
      .eq('academic_year_id', academicYearId);

    if (!fetchError && existingStudents) {
      const validRolls = existingStudents
        .map((s) => parseInt(s.roll_number, 10))
        .filter((n) => !isNaN(n));

      const maxRoll = validRolls.length > 0 ? Math.max(...validRolls) : 0;
      rollNumber = (maxRoll + 1).toString();
    } else {
      rollNumber = '1';
    }
  }

  await supabaseAdmin.from('student_sections').insert({
    student_id: studentId,
    section_id: sectionId,
    academic_year_id: academicYearId,
    roll_number: rollNumber,
    is_active: true
  });
};

const uploadUserAvatar = async (file) => {
  const fileExt = file.originalname.split('.').pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const filePath = `avatars/${fileName}`;

  let mimeType = file.mimetype;
  if (mimeType === 'application/octet-stream' || !mimeType) {
    if (fileExt.toLowerCase() === 'png') mimeType = 'image/png';
    else if (fileExt.toLowerCase() === 'gif') mimeType = 'image/gif';
    else if (fileExt.toLowerCase() === 'webp') mimeType = 'image/webp';
    else mimeType = 'image/jpeg';
  }

  const { error: uploadError } = await supabaseAdmin.storage
    .from(process.env.SUPABASE_STORAGE_BUCKET)
    .upload(filePath, file.buffer, {
      contentType: mimeType,
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
  const authEmail = data.email || data.parent_email || `student_${Date.now()}@ascento.local`;
  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: authEmail,
    password: tempPassword,
    email_confirm: true,
  });

  if (authError) throw new AppError(authError.message, 400);

  // 2. Update users table (trigger creates initial row)
  const { data: user, error: dbError } = await supabaseAdmin.from('users').update({
    auth_id: authUser.user.id,
    role: data.role,
    full_name: data.full_name,
    email: authEmail,
    phone: data.phone,
    branch_id: data.branch_id,
    domain_id: data.domain_id,
    date_of_birth: data.date_of_birth,
    gender: data.gender,
    address: data.address,
    city: data.city,
    state: data.state,
    country: data.country,
    qualification: data.qualification,
    experience: data.experience,
    is_active: data.is_active !== undefined ? data.is_active : true,
    avatar_url: avatar_url,
    must_change_password: true,
    created_by: data.created_by,
  }).eq('auth_id', authUser.user.id).select().single();

  if (dbError) throw new AppError(dbError.message, 400);

  // 3. Assign to section if student
  if (data.role === 'student' && data.section_id) {
    await assignStudentToSection(user.id, data.section_id, data.academic_year_id, data.roll_number);
  }

  // Send welcome email with temp password
  const emailToSendTo = authEmail;

  if (emailToSendTo && emailToSendTo.includes('@') && !emailToSendTo.includes('@ascento.local')) {
    try {
      sendWelcomeEmail(emailToSendTo, tempPassword, data.full_name, authEmail).catch(e => {
        console.error('Failed to send welcome email:', e);
      });
    } catch (emailError) {
      // We log the error but don't fail the user creation
      console.error('Failed to initiate welcome email:', emailError);
    }
  }

  return { user, tempPassword };
};

export const listUsers = async (filters) => {
  let query = supabaseAdmin.from('users').select(`
    *,
    branches(name),
    student_sections(
      roll_number,
      section_id,
      academic_year_id,
      sections(name, classes(name))
    )
  `);

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
    .select(`
      *,
      branches(name),
      student_sections(
        roll_number,
        section_id,
        academic_year_id,
        sections(name, classes(name))
      )
    `)
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

  const validUserKeys = ['full_name', 'email', 'phone', 'gender', 'date_of_birth', 'address', 'city', 'state', 'country', 'qualification', 'experience', 'branch_id', 'domain_id', 'is_active', 'fcm_token'];
  const payload = {};
  
  for (const key of validUserKeys) {
    if (data[key] !== undefined) {
      payload[key] = data[key];
    }
  }

  if (avatar_url) {
    payload.avatar_url = avatar_url;
  }

  if (Object.keys(payload).length === 0) {
    const { data: user, error } = await supabaseAdmin.from('users').select().eq('id', id).single();
    if (error) throw new Error(error.message);
    return user;
  }

  const { data: user, error } = await supabaseAdmin
    .from('users')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  if (data.section_id) {
    await assignStudentToSection(id, data.section_id, data.academic_year_id, data.roll_number);
  }

  return user;
};

export const linkParent = async (data) => {
  const { error } = await supabaseAdmin.from('parent_student').insert(data);
  if (error) throw new Error(error.message);
};

export const deleteUser = async (id) => {
  const { data: user, error: fetchError } = await supabaseAdmin
    .from('users')
    .select('auth_id, email')
    .eq('id', id)
    .single();

  if (fetchError) throw new AppError(fetchError.message, 404);

  if (user && user.auth_id) {
    // Delete from Supabase Auth (frees up the email)
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(user.auth_id);
    if (authError) {
      // If user was already deleted manually in Auth, we can safely ignore the error and proceed to delete from DB
      if (authError.message?.toLowerCase().includes('not found') || authError.status === 404) {
        // Ignore and proceed to DB delete
      } else {
        // Fallback: Soft delete and rename email to free it up
        const fakeEmail = `deleted_${Date.now()}_${user.email}`;
        try {
          await supabaseAdmin.auth.admin.updateUserById(user.auth_id, { email: fakeEmail, email_confirm: true, user_metadata: { deleted: true } });
        } catch (e) {
          // ignore auth update errors on fallback
        }
        await supabaseAdmin.from('users').update({ is_active: false, email: fakeEmail }).eq('id', id);
        return;
      }
    }
  }

  // Hard delete from public.users table (might be handled by cascade from auth.users, but we do it to be safe)
  const { error: dbError } = await supabaseAdmin
    .from('users')
    .delete()
    .eq('id', id);

  if (dbError) {
    // If there's a foreign key constraint error, we fallback to soft delete
    const fakeEmail = `deleted_${Date.now()}_${user.email}`;
    await supabaseAdmin.from('users').update({ is_active: false, email: fakeEmail }).eq('id', id);
  }
};
