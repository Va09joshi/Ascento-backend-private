import { supabaseAdmin } from '../../config/supabase.js';

export const createBranch = async (data) => {
  const { data: branch, error } = await supabaseAdmin
    .from('branches')
    .insert(data)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return branch;
};

export const getAllBranches = async () => {
  const { data, error } = await supabaseAdmin
    .from('branches')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw new Error(error.message);
  return data;
};

export const getBranchById = async (id) => {
  const { data, error } = await supabaseAdmin
    .from('branches')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const updateBranch = async (id, data) => {
  const { data: branch, error } = await supabaseAdmin
    .from('branches')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return branch;
};

export const deleteBranch = async (id) => {
  const { error } = await supabaseAdmin
    .from('branches')
    .update({ is_active: false }) // Soft delete
    .eq('id', id);

  if (error) throw new Error(error.message);
};
