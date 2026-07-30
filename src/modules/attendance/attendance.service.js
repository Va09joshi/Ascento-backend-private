import { supabaseAdmin } from '../../config/supabase.js';

export const markBulkAttendance = async (data, marked_by) => {
  const { section_id, subject_id, course_id, date, records } = data;
  
  const formattedRecords = records.map(r => ({
    student_id: r.student_id,
    section_id,
    subject_id,
    course_id,
    date,
    present: r.present,
    late: r.late || false,
    remarks: r.remarks,
    marked_by,
  }));

  const { data: attendance, error } = await supabaseAdmin.from('attendance')
    .upsert(formattedRecords, { onConflict: 'student_id, section_id, subject_id, date' })
    .select();

  if (error) throw new Error(error.message);
  
  // Checking low attendance (<75%) and flagging in Redis could be implemented here as an async background task
  
  return attendance;
};

export const getAttendanceSheet = async (section_id, subject_id, date) => {
  const { data, error } = await supabaseAdmin.from('attendance')
    .select('*, users!student_id(full_name, roll_number)')
    .eq('section_id', section_id)
    .eq('subject_id', subject_id)
    .eq('date', date);

  if (error) throw new Error(error.message);
  return data;
};

export const getStudentSummary = async (student_id) => {
  const { data, error } = await supabaseAdmin.from('attendance').select('present').eq('student_id', student_id);
  if (error) throw new Error(error.message);
  
  const total = data.length;
  const present = data.filter(d => d.present).length;
  const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
  
  return { total_days: total, present_days: present, percentage };
};

export const getMonthlyAttendance = async (student_id, month, year) => {
  const monthStr = month.toString().padStart(2, '0');
  const startDate = `${year}-${monthStr}-01`;
  const endDate = new Date(year, month, 0).toISOString().split('T')[0];
  
  const { data, error } = await supabaseAdmin.from('attendance')
    .select('*')
    .eq('student_id', student_id)
    .gte('date', startDate)
    .lte('date', endDate);

  if (error) throw new Error(error.message);
  return data;
};
