import { supabaseAdmin } from '../../config/supabase.js';
import { detectClash } from '../../utils/timetableClashDetector.js';

export const createPeriod = async (data) => {
  const clashes = await detectClash(supabaseAdmin, data);

  if (clashes.length > 0) {
    throw { code: 'TIMETABLE_CLASH', message: 'Scheduling conflict detected', details: clashes };
  }

  const { data: period, error } = await supabaseAdmin
    .from('timetable_periods')
    .insert(data)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return period;
};

export const updatePeriod = async (id, data) => {
  const clashes = await detectClash(supabaseAdmin, { ...data, exclude_id: id });

  if (clashes.length > 0) {
    throw { code: 'TIMETABLE_CLASH', message: 'Scheduling conflict detected', details: clashes };
  }

  const { data: period, error } = await supabaseAdmin
    .from('timetable_periods')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return period;
};

export const getSectionTimetable = async (section_id, academic_year_id) => {
  let query = supabaseAdmin
    .from('timetable_periods')
    .select(`
      *,
      subjects(name, code),
      users(full_name)
    `)
    .eq('section_id', section_id);
    
  if (academic_year_id) {
    query = query.eq('academic_year_id', academic_year_id);
  }

  const { data, error } = await query.order('start_time', { ascending: true });
  if (error) throw new Error(error.message);
  return data;
};

export const getTeacherTimetable = async (teacher_id, academic_year_id) => {
  let query = supabaseAdmin
    .from('timetable_periods')
    .select(`
      *,
      subjects(name, code),
      sections(name, classes(name))
    `)
    .eq('teacher_id', teacher_id);
    
  if (academic_year_id) {
    query = query.eq('academic_year_id', academic_year_id);
  }

  const { data, error } = await query.order('start_time', { ascending: true });
  if (error) throw new Error(error.message);
  return data;
};

export const deletePeriod = async (id) => {
  const { error } = await supabaseAdmin.from('timetable_periods').delete().eq('id', id);
  if (error) throw new Error(error.message);
};
