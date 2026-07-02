import { supabaseAdmin } from '../../config/supabase.js';

export const createSubject = async (data) => {
  const { data: subject, error } = await supabaseAdmin
    .from('subjects')
    .insert(data)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return subject;
};

export const getAllSubjects = async () => {
  const { data, error } = await supabaseAdmin
    .from('subjects')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw new Error(error.message);
  return data;
};

export const getSubjectById = async (id) => {
  const { data, error } = await supabaseAdmin
    .from('subjects')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const updateSubject = async (id, data) => {
  const { data: subject, error } = await supabaseAdmin
    .from('subjects')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return subject;
};

export const deleteSubject = async (id) => {
  const { error } = await supabaseAdmin
    .from('subjects')
    .update({ is_active: false })
    .eq('id', id);

  if (error) throw new Error(error.message);
};

export const assignToClass = async (data) => {
  const { data: mapping, error } = await supabaseAdmin
    .from('class_subjects')
    .upsert(data, { onConflict: 'class_id, subject_id' })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapping;
};

export const getSubjectsByClass = async (class_id) => {
  const { data, error } = await supabaseAdmin
    .from('class_subjects')
    .select('*, subjects(*), users!teacher_id(full_name)')
    .eq('class_id', class_id);

  if (error) throw new Error(error.message);
  return data;
};
