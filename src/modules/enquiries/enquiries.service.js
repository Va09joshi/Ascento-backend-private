import { supabaseAdmin } from '../../config/supabase.js';

export const createEnquiry = async (data) => {
  const { data: enquiry, error } = await supabaseAdmin
    .from('enquiries')
    .insert([data])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return enquiry;
};

export const listEnquiries = async () => {
  const { data, error } = await supabaseAdmin
    .from('enquiries')
    .select('*, domains(name)')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

export const getEnquiryById = async (id) => {
  const { data, error } = await supabaseAdmin
    .from('enquiries')
    .select('*, domains(name)')
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const updateEnquiry = async (id, data) => {
  const { data: enquiry, error } = await supabaseAdmin
    .from('enquiries')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return enquiry;
};

export const deleteEnquiry = async (id) => {
  const { error } = await supabaseAdmin
    .from('enquiries')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
};
