import { supabaseAdmin } from '../../config/supabase.js';
import { generateSecurePassword } from '../../utils/passwordGenerator.js';
import { sendWelcomeEmail } from '../../utils/emailService.js';
import crypto from 'crypto';

import { AppError } from '../../middleware/errorHandler.js';

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
  const authEmail = data.email || `student_${Date.now()}@ascento.local`;
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
    avatar_url: avatar_url,
    must_change_password: true,
    created_by: data.created_by,
  }).eq('auth_id', authUser.user.id).select().single();

  if (dbError) throw new AppError(dbError.message, 400);

  // 3. Assign to section if student
  if (data.role === 'student' && data.section_id) {
    let rollNumber = data.roll_number;

    // Auto-generate roll number if not provided
    if (!rollNumber) {
      const { data: existingStudents, error: fetchError } = await supabaseAdmin
        .from('student_sections')
        .select('roll_number')
        .eq('section_id', data.section_id)
        .eq('academic_year_id', data.academic_year_id);

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
      student_id: user.id,
      section_id: data.section_id,
      academic_year_id: data.academic_year_id,
      roll_number: rollNumber,
    });
  }

  // 4. Link parent if provided
  let parentId = data.parent_id;
  
  if (data.role === 'student' && !parentId && data.parent_email && data.parent_name) {
    try {
      // Check if parent auth user exists by email, if not create
      let authParentId;
      const { data: existingUser, error: checkError } = await supabaseAdmin.auth.admin.getUserById('none').catch(() => ({ data: null })); // Dummy call, actually we can just try creating it or querying
      
      const tempParentPassword = generateSecurePassword();
      const { data: authParent, error: authParentError } = await supabaseAdmin.auth.admin.createUser({
        email: data.parent_email,
        password: tempParentPassword,
        email_confirm: true,
      });

      if (authParentError) {
        // If parent exists, find by email in users table
        const { data: existingParent } = await supabaseAdmin.from('users').select('id').eq('email', data.parent_email).single();
        if (existingParent) {
          parentId = existingParent.id;
        }
      } else {
        // Update new parent row
        const { data: newParent } = await supabaseAdmin.from('users').update({
          auth_id: authParent.user.id,
          role: 'parent',
          full_name: data.parent_name,
          email: data.parent_email,
          phone: data.parent_phone,
          must_change_password: true,
          created_by: data.created_by,
        }).eq('auth_id', authParent.user.id).select().single();
        
        if (newParent) {
          parentId = newParent.id;
          try {
            sendWelcomeEmail(data.parent_email, tempParentPassword, data.parent_name).catch(e => {
              console.error('Failed to send parent welcome email:', e);
            });
          } catch (e) {
            console.error('Failed to initiate parent welcome email:', e);
          }
        }
      }
    } catch (err) {
      console.error('Parent creation error:', err);
    }
  }

  if (data.role === 'student' && parentId) {
    await supabaseAdmin.from('parent_student').insert({
      parent_id: parentId,
      student_id: user.id,
    });
  }

  // Send welcome email with temp password
  if (data.email) {
    try {
      sendWelcomeEmail(data.email, tempPassword, data.full_name).catch(e => {
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
