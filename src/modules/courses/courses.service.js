import { supabaseAdmin } from '../../config/supabase.js';

export const createCourse = async (data) => {
  const { data: course, error } = await supabaseAdmin
    .from('courses')
    .insert(data)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return course;
};

export const getAllCourses = async (branch_id) => {
  let query = supabaseAdmin.from('courses').select('*, classes(name)');
  if (branch_id) query = query.eq('branch_id', branch_id);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
};

export const getCourseById = async (id) => {
  const { data, error } = await supabaseAdmin.from('courses').select('*, classes(name)').eq('id', id).single();
  if (error) throw new Error(error.message);
  return data;
};

export const updateCourse = async (id, data) => {
  const { data: course, error } = await supabaseAdmin.from('courses').update(data).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return course;
};

export const deleteCourse = async (id) => {
  const { error } = await supabaseAdmin.from('courses').update({ status: 'archived' }).eq('id', id);
  if (error) throw new Error(error.message);
};

export const enrollStudent = async (data) => {
  const { data: enrollment, error } = await supabaseAdmin.from('enrollments').insert(data).select().single();
  if (error) throw new Error(error.message);
  return enrollment;
};

export const getCourseStudents = async (id) => {
  const { data, error } = await supabaseAdmin.from('enrollments').select('*, users(*)').eq('course_id', id);
  if (error) throw new Error(error.message);
  return data;
};
