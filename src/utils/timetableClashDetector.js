export const detectClash = async (supabase, { section_id, teacher_id, day_of_week, start_time, end_time, academic_year_id, exclude_id }) => {
  const clashes = [];

  // Teacher clash
  const { data: teacherClash } = await supabase
    .from('timetable_periods')
    .select('*, sections(name), subjects(name)')
    .eq('teacher_id', teacher_id)
    .eq('day_of_week', day_of_week)
    .eq('academic_year_id', academic_year_id)
    .lt('start_time', end_time)
    .gt('end_time', start_time)
    .neq('id', exclude_id ?? '00000000-0000-0000-0000-000000000000');
  
  if (teacherClash?.length) {
    clashes.push({ type: 'TEACHER_CLASH', details: teacherClash });
  }

  // Section clash
  const { data: sectionClash } = await supabase
    .from('timetable_periods')
    .select('*, subjects(name), users(full_name)')
    .eq('section_id', section_id)
    .eq('day_of_week', day_of_week)
    .eq('academic_year_id', academic_year_id)
    .lt('start_time', end_time)
    .gt('end_time', start_time)
    .neq('id', exclude_id ?? '00000000-0000-0000-0000-000000000000');
  
  if (sectionClash?.length) {
    clashes.push({ type: 'SECTION_CLASH', details: sectionClash });
  }

  return clashes;
};
