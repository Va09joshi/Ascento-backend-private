import { supabaseAdmin } from '../../config/supabase.js';

export const createFeeStructure = async (data) => {
  const { data: feeStructure, error } = await supabaseAdmin
    .from('fee_structures')
    .insert([data])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return feeStructure;
};

export const listFeeStructures = async () => {
  const { data, error } = await supabaseAdmin
    .from('fee_structures')
    .select('*, domains(name), classes(name)')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

export const createFeeRecord = async (data) => {
  const { data: feeRecord, error } = await supabaseAdmin
    .from('fee_records')
    .insert([data])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return feeRecord;
};

export const listFeeRecords = async () => {
  const { data, error } = await supabaseAdmin
    .from('fee_records')
    .select('*, users(full_name, email), fee_structures(description)')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

export const updateFeeRecord = async (id, data) => {
  const { data: feeRecord, error } = await supabaseAdmin
    .from('fee_records')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return feeRecord;
};
