import { supabaseAdmin } from '../../config/supabase.js';
import { calculateGrade } from '../../utils/gradeCalculator.js';
// import { sendPushNotification } from '../../config/fcm.js';

export const createExam = async (data) => {
  const { data: exam, error } = await supabaseAdmin.from('exams').insert(data).select().single();
  if (error) throw new Error(error.message);
  
  // Here we would also insert into exam_schedule if needed, and send push notifications
  return exam;
};

export const getExams = async (filters) => {
  let query = supabaseAdmin.from('exams').select('*, classes(name), subjects(name), sections(name)');
  if (filters.class_id) query = query.eq('class_id', filters.class_id);
  if (filters.section_id) query = query.eq('section_id', filters.section_id);
  if (filters.academic_year_id) query = query.eq('academic_year_id', filters.academic_year_id);
  
  const { data, error } = await query.order('exam_date', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
};

export const getExamById = async (id) => {
  const { data, error } = await supabaseAdmin.from('exams').select('*, classes(name), subjects(name), sections(name)').eq('id', id).single();
  if (error) throw new Error(error.message);
  return data;
};

export const updateExam = async (id, data) => {
  const { data: exam, error } = await supabaseAdmin.from('exams').update(data).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return exam;
};

export const deleteExam = async (id) => {
  const { error } = await supabaseAdmin.from('exams').delete().eq('id', id);
  if (error) throw new Error(error.message);
};

export const enterResults = async (exam_id, results_array, user_id) => {
  const { data: exam } = await supabaseAdmin.from('exams').select('total_marks').eq('id', exam_id).single();
  
  const formattedResults = results_array.map(r => {
    let grade = null;
    if (!r.is_absent && r.marks_obtained !== undefined && exam) {
      grade = calculateGrade(r.marks_obtained, exam.total_marks);
    }
    
    return {
      exam_id,
      student_id: r.student_id,
      marks_obtained: r.marks_obtained,
      grade,
      is_absent: r.is_absent || false,
      remarks: r.remarks,
      entered_by: user_id,
      entered_at: new Date(),
    };
  });

  const { data, error } = await supabaseAdmin.from('exam_results').upsert(formattedResults, { onConflict: 'exam_id, student_id' }).select();
  if (error) throw new Error(error.message);
  return data;
};

export const getExamResults = async (exam_id) => {
  const { data, error } = await supabaseAdmin.from('exam_results').select('*, users!student_id(full_name, roll_number)').eq('exam_id', exam_id);
  if (error) throw new Error(error.message);
  return data;
};

export const getMyResult = async (exam_id, student_id) => {
  const { data, error } = await supabaseAdmin.from('exam_results').select('*, exams(*)').eq('exam_id', exam_id).eq('student_id', student_id).single();
  if (error && error.code !== 'PGRST116') throw new Error(error.message);
  return data;
};
