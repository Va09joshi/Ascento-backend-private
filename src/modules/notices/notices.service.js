import { supabaseAdmin as supabase } from '../../config/supabase.js';
import { AppError } from '../../middleware/errorHandler.js';
import crypto from 'crypto';

const uploadNoticeImage = async (file) => {
  const fileExt = file.originalname.split('.').pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const filePath = `notices/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(process.env.SUPABASE_STORAGE_BUCKET)
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
    });

  if (uploadError) throw new AppError(uploadError.message, 500);

  const { data: publicUrlData } = supabase.storage
    .from(process.env.SUPABASE_STORAGE_BUCKET)
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
};

export const createNotice = async (noticeData, file, authId) => {
  let banner_url = noticeData.banner_url;

  if (file) {
    banner_url = await uploadNoticeImage(file);
  }

  const payload = { ...noticeData, banner_url, created_by: authId };

  const { data, error } = await supabase
    .from('notices')
    .insert([payload])
    .select()
    .single();

  if (error) throw new AppError(error.message, 400);
  return data;
};

export const getNotices = async (isPublic) => {
  let query = supabase.from('notices').select('*').order('created_at', { ascending: false });
  
  if (isPublic) {
    query = query.eq('is_published', true);
  }

  const { data, error } = await query;
  if (error) throw new AppError(error.message, 400);
  return data;
};

export const getNoticeById = async (id) => {
  const { data, error } = await supabase
    .from('notices')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new AppError('Notice not found', 404);
  return data;
};

export const updateNotice = async (id, updateData, file) => {
  let banner_url = updateData.banner_url;

  if (file) {
    banner_url = await uploadNoticeImage(file);
  }

  const payload = { ...updateData };
  if (banner_url !== undefined) {
    payload.banner_url = banner_url;
  }

  const { data, error } = await supabase
    .from('notices')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new AppError(error.message, 400);
  return data;
};

export const deleteNotice = async (id) => {
  const { error } = await supabase
    .from('notices')
    .delete()
    .eq('id', id);

  if (error) throw new AppError(error.message, 400);
  return true;
};
