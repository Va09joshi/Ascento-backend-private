import { supabaseAdmin } from '../../config/supabase.js';
import { AppError } from '../../middleware/errorHandler.js';

export const getHomeworks = async (filters) => {
  let query = supabaseAdmin.from('homework').select('*, subjects(name), classes(name), sections(name)');
  
  if (filters.class_id) query = query.eq('class_id', filters.class_id);
  if (filters.section_id) query = query.eq('section_id', filters.section_id);
  if (filters.subject_id) query = query.eq('subject_id', filters.subject_id);
  if (filters.teacher_id) query = query.eq('teacher_id', filters.teacher_id);
  
  const { data, error } = await query.order('due_date', { ascending: true });
  if (error) throw new AppError(error.message, 500);
  return data;
};

export const createHomework = async (data) => {
  const { data: homework, error } = await supabaseAdmin
    .from('homework')
    .insert([data])
    .select()
    .single();
    
  if (error) throw new AppError(error.message, 500);
  return homework;
};

export const getHomeworkSubmissions = async (homeworkId) => {
  const { data, error } = await supabaseAdmin
    .from('homework_submissions')
    .select('*, users(full_name, email)')
    .eq('homework_id', homeworkId);
    
  if (error) throw new AppError(error.message, 500);
  return data;
};

export const submitHomework = async (homeworkId, studentId, fileUrl) => {
  // Check if already submitted
  const { data: existing } = await supabaseAdmin
    .from('homework_submissions')
    .select('id')
    .eq('homework_id', homeworkId)
    .eq('student_id', studentId)
    .single();
    
  if (existing) {
    // Update existing submission
    const { data, error } = await supabaseAdmin
      .from('homework_submissions')
      .update({ file_url: fileUrl, status: 'pending', submitted_at: new Date() })
      .eq('id', existing.id)
      .select()
      .single();
      
    if (error) throw new AppError(error.message, 500);
    return data;
  }
  
  const { data, error } = await supabaseAdmin
    .from('homework_submissions')
    .insert([{ homework_id: homeworkId, student_id: studentId, file_url: fileUrl, status: 'pending' }])
    .select()
    .single();
    
  if (error) throw new AppError(error.message, 500);
  return data;
};

export const gradeHomework = async (submissionId, grade, remarks) => {
  const { data, error } = await supabaseAdmin
    .from('homework_submissions')
    .update({ grade, remarks, status: 'graded' })
    .eq('id', submissionId)
    .select()
    .single();
    
  if (error) throw new AppError(error.message, 500);
  return data;
};
