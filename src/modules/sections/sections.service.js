import { supabaseAdmin } from '../../config/supabase.js';

export const createSection = async (data) => {
  const { data: section, error } = await supabaseAdmin
    .from('sections')
    .insert(data)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return section;
};

export const getAllSections = async (class_id) => {
  let query = supabaseAdmin
    .from('sections')
    .select('*, classes(name), users!teacher_id(full_name)')
    .order('name', { ascending: true });

  if (class_id) {
    query = query.eq('class_id', class_id);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
};

export const getSectionById = async (id) => {
  const { data, error } = await supabaseAdmin
    .from('sections')
    .select('*, classes(name), users!teacher_id(full_name)')
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const updateSection = async (id, data) => {
  const { data: section, error } = await supabaseAdmin
    .from('sections')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return section;
};

export const deleteSection = async (id) => {
  const { error } = await supabaseAdmin
    .from('sections')
    .update({ is_active: false })
    .eq('id', id);

  if (error) throw new Error(error.message);
};

export const getSectionStudents = async (id) => {
  const { data, error } = await supabaseAdmin
    .from('student_sections')
    .select('*, users(*)')
    .eq('section_id', id)
    .eq('is_active', true);

  if (error) throw new Error(error.message);
  return data;
};

export const assignTeacher = async (id, teacher_id) => {
  const { data: section, error } = await supabaseAdmin
    .from('sections')
    .update({ teacher_id })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return section;
};
