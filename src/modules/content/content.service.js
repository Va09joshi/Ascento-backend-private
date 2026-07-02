import { supabaseAdmin } from '../../config/supabase.js';
import crypto from 'crypto';

export const uploadContent = async (file, data, user_id) => {
  const fileExt = file.originalname.split('.').pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const filePath = `${data.type}s/${fileName}`;

  const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
    .from(process.env.SUPABASE_STORAGE_BUCKET)
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
    });

  if (uploadError) throw new Error(uploadError.message);

  const { data: publicUrlData } = supabaseAdmin.storage
    .from(process.env.SUPABASE_STORAGE_BUCKET)
    .getPublicUrl(filePath);

  const { data: content, error: dbError } = await supabaseAdmin.from('content_items').insert({
    ...data,
    storage_path: filePath,
    public_url: publicUrlData.publicUrl,
    file_size_bytes: file.size,
    uploaded_by: user_id,
  }).select().single();

  if (dbError) {
    // Rollback storage if DB insert fails
    await supabaseAdmin.storage.from(process.env.SUPABASE_STORAGE_BUCKET).remove([filePath]);
    throw new Error(dbError.message);
  }

  return content;
};

export const getContent = async (filters) => {
  let query = supabaseAdmin.from('content_items').select('*').order('order_index', { ascending: true });
  if (filters.course_id) query = query.eq('course_id', filters.course_id);
  if (filters.class_id) query = query.eq('class_id', filters.class_id);
  if (filters.subject_id) query = query.eq('subject_id', filters.subject_id);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
};

export const getStreamUrl = async (id) => {
  const { data: content, error } = await supabaseAdmin.from('content_items').select('storage_path').eq('id', id).single();
  if (error) throw new Error(error.message);

  // Generate signed URL valid for 1 hour
  const { data, error: signedError } = await supabaseAdmin.storage
    .from(process.env.SUPABASE_STORAGE_BUCKET)
    .createSignedUrl(content.storage_path, 3600);

  if (signedError) throw new Error(signedError.message);
  return data.signedUrl;
};

export const updateContent = async (id, data) => {
  const { data: content, error } = await supabaseAdmin.from('content_items').update(data).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return content;
};

export const deleteContent = async (id) => {
  const { data: content, error } = await supabaseAdmin.from('content_items').select('storage_path').eq('id', id).single();
  if (error) throw new Error(error.message);

  await supabaseAdmin.storage.from(process.env.SUPABASE_STORAGE_BUCKET).remove([content.storage_path]);
  
  const { error: delError } = await supabaseAdmin.from('content_items').delete().eq('id', id);
  if (delError) throw new Error(delError.message);
};
