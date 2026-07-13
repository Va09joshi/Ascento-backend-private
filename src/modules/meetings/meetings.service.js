import { supabaseAdmin } from '../../config/supabase.js';
import { AppError } from '../../middleware/errorHandler.js';

export const getMeetings = async (filters) => {
  let query = supabaseAdmin.from('meetings').select('*, classes(name), sections(name)');
  
  if (filters.class_id) query = query.eq('class_id', filters.class_id);
  if (filters.section_id) query = query.eq('section_id', filters.section_id);
  
  // Get upcoming and today's meetings
  const today = new Date().toISOString().split('T')[0];
  query = query.gte('meet_date', today);
  
  const { data, error } = await query.order('meet_date', { ascending: true }).order('start_time', { ascending: true });
  if (error) throw new AppError(error.message, 500);
  return data;
};

export const createMeeting = async (data) => {
  const { data: meeting, error } = await supabaseAdmin
    .from('meetings')
    .insert([data])
    .select()
    .single();
    
  if (error) throw new AppError(error.message, 500);
  return meeting;
};

export const deleteMeeting = async (id, userId) => {
  // Only the creator or super_admin should delete, but we'll let supabase handle or just delete directly for now.
  const { error } = await supabaseAdmin.from('meetings').delete().eq('id', id);
  if (error) throw new AppError(error.message, 500);
  return true;
};
