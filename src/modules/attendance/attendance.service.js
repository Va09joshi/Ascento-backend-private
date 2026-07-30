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
  let query = supabaseAdmin.from('attendance')
    .select('*, users!student_id(full_name)')
    .eq('section_id', section_id)
    .eq('date', date);
    
  if (subject_id) {
    query = query.eq('subject_id', subject_id);
  } else {
    query = query.is('subject_id', null);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
};

export const getStudentSummary = async (student_id) => {
  const { data, error } = await supabaseAdmin.from('attendance').select('present, late').eq('student_id', student_id);
  if (error) throw new Error(error.message);
  
  const total = data.length;
  const present = data.filter(d => d.present).length;
  const late = data.filter(d => d.late).length;
  const absent = total - present;
  const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
  
  return { total_days: total, present_days: present, absent_days: absent, late_days: late, percentage };
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
