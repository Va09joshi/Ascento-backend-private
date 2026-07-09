import { supabaseAdmin } from '../../config/supabase.js';

export const createDomain = async (data) => {
  const { data: domain, error } = await supabaseAdmin
    .from('domains')
    .insert([data])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return domain;
};

export const listDomains = async () => {
  const { data, error } = await supabaseAdmin
    .from('domains')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

export const getDomainById = async (id) => {
  const { data, error } = await supabaseAdmin
    .from('domains')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const updateDomain = async (id, data) => {
  const { data: domain, error } = await supabaseAdmin
    .from('domains')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return domain;
};

export const deleteDomain = async (id) => {
  const { error } = await supabaseAdmin
    .from('domains')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
};
