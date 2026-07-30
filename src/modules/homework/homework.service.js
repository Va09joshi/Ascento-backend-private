import { supabaseAdmin } from '../../config/supabase.js';
import { AppError } from '../../middleware/errorHandler.js';

export const getHomeworks = async (filters, studentId = null) => {
  let query = supabaseAdmin.from('homework').select(`
    *, 
    subjects(name), 
    classes(name), 
    sections(name)
    ${studentId ? ', homework_submissions(*)' : ''}
  `);
  
  if (filters.class_id) query = query.eq('class_id', filters.class_id);
  if (filters.section_id) query = query.eq('section_id', filters.section_id);
  if (filters.subject_id) query = query.eq('subject_id', filters.subject_id);
  if (filters.teacher_id) query = query.eq('teacher_id', filters.teacher_id);
  
  if (studentId) {
    query = query.eq('homework_submissions.student_id', studentId);
  }
  
  const { data, error } = await query.order('due_date', { ascending: true });
  if (error) throw new AppError(error.message, 500);
  
  // Format the response so that the student's submission dictates the status
  if (studentId && data) {
    return data.map(hw => {
      const submissions = hw.homework_submissions || [];
      // Because we filtered by student_id in the join, there should be at most 1
      const mySubmission = submissions.find(s => s.student_id === studentId);
      
      return {
        ...hw,
        status: mySubmission ? mySubmission.status : 'pending',
        submissionUrl: mySubmission ? mySubmission.file_url : null,
        marks: mySubmission ? mySubmission.grade : null,
        remarks: mySubmission ? mySubmission.remarks : null,
      };
    });
  }
  
  return data;
};

export const createHomework = async (data) => {
  // Enforce teacher assignment via sections or timetable
  const { data: section, error: secError } = await supabaseAdmin
    .from('sections')
    .select('id')
    .eq('id', data.section_id)
    .eq('teacher_id', data.teacher_id)
    .limit(1);

  const { data: ttPeriod, error: ttError } = await supabaseAdmin
    .from('timetable_periods')
    .select('id')
    .eq('section_id', data.section_id)
    .eq('teacher_id', data.teacher_id)
    .limit(1);

  if (secError) throw new AppError(secError.message, 500);
  if (ttError) throw new AppError(ttError.message, 500);
  
  if ((!section || section.length === 0) && (!ttPeriod || ttPeriod.length === 0)) {
    throw new AppError('You are not assigned to this class and section.', 403);
  }

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
      .update({ file_url: fileUrl, status: 'submitted', submitted_at: new Date() })
      .eq('id', existing.id)
      .select()
      .single();
      
    if (error) throw new AppError(error.message, 500);
    return data;
  }
  
  const { data, error } = await supabaseAdmin
    .from('homework_submissions')
    .insert([{ homework_id: homeworkId, student_id: studentId, file_url: fileUrl, status: 'submitted' }])
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
