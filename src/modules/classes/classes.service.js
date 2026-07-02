import { supabaseAdmin } from '../../config/supabase.js';

export const createClass = async (data) => {
  const { data: classData, error } = await supabaseAdmin
    .from('classes')
    .insert(data)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return classData;
};

export const getAllClasses = async (branch_id, academic_year_id) => {
  let query = supabaseAdmin
    .from('classes')
    .select('*, branches(name), academic_years(name)')
    .order('order_index', { ascending: true });

  if (branch_id) query = query.eq('branch_id', branch_id);
  if (academic_year_id) query = query.eq('academic_year_id', academic_year_id);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
};

export const getClassById = async (id) => {
  const { data, error } = await supabaseAdmin
    .from('classes')
    .select('*, branches(name), academic_years(name)')
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const updateClass = async (id, data) => {
  const { data: classData, error } = await supabaseAdmin
    .from('classes')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return classData;
};

export const deleteClass = async (id) => {
  const { error } = await supabaseAdmin
    .from('classes')
    .update({ is_active: false })
    .eq('id', id);

  if (error) throw new Error(error.message);
};

export const getClassSections = async (id) => {
  const { data, error } = await supabaseAdmin
    .from('sections')
    .select('*, users!teacher_id(full_name)')
    .eq('class_id', id);

  if (error) throw new Error(error.message);
  return data;
};

export const getClassStudents = async (id) => {
  // Get all sections for this class, then get all active student_sections, joined with users
  const { data, error } = await supabaseAdmin
    .from('student_sections')
    .select('*, users(*), sections!inner(name, class_id)')
    .eq('sections.class_id', id)
    .eq('is_active', true);

  if (error) throw new Error(error.message);
  return data;
};
