import { supabaseAdmin } from '../../config/supabase.js';

export const createAcademicYear = async (data) => {
  if (data.is_current) {
    // Unset current for others in the branch (or globally if no branch)
    const query = supabaseAdmin.from('academic_years').update({ is_current: false });
    if (data.branch_id) query.eq('branch_id', data.branch_id);
    await query;
  }

  const { data: academicYear, error } = await supabaseAdmin
    .from('academic_years')
    .insert(data)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return academicYear;
};

export const getAllAcademicYears = async () => {
  const { data, error } = await supabaseAdmin
    .from('academic_years')
    .select('*, branches(name)')
    .order('start_date', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

export const getCurrentAcademicYear = async () => {
  const { data, error } = await supabaseAdmin
    .from('academic_years')
    .select('*, branches(name)')
    .eq('is_current', true)
    .single();

  if (error && error.code !== 'PGRST116') throw new Error(error.message); // PGRST116 is no rows
  return data;
};

export const updateAcademicYear = async (id, data) => {
  const { data: academicYear, error } = await supabaseAdmin
    .from('academic_years')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return academicYear;
};

export const setCurrentAcademicYear = async (id) => {
  // Get the branch of the one being set to current
  const { data: target } = await supabaseAdmin.from('academic_years').select('branch_id').eq('id', id).single();
  
  if (target) {
    const query = supabaseAdmin.from('academic_years').update({ is_current: false });
    if (target.branch_id) query.eq('branch_id', target.branch_id);
    await query;
  }

  const { data: academicYear, error } = await supabaseAdmin
    .from('academic_years')
    .update({ is_current: true })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return academicYear;
};

export const deleteAcademicYear = async (id) => {
  const { error } = await supabaseAdmin
    .from('academic_years')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
};
