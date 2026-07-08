import supabase from '../../config/supabase.js';
import { AppError } from '../../middleware/errorHandler.js';

export const createNotice = async (noticeData, userId) => {
  const { data, error } = await supabase
    .from('notices')
    .insert([{ ...noticeData, created_by: userId }])
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

export const updateNotice = async (id, updateData) => {
  const { data, error } = await supabase
    .from('notices')
    .update(updateData)
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
