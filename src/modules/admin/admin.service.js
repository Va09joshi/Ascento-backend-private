import { supabaseAdmin } from '../../config/supabase.js';

export const getDashboardStats = async (branch_id) => {
  const stats = {};

  let studentQuery = supabaseAdmin.from('users').select('id', { count: 'exact' }).eq('role', 'student').eq('is_active', true);
  if (branch_id) studentQuery = studentQuery.eq('branch_id', branch_id);
  const { count: studentCount } = await studentQuery;
  stats.total_students = studentCount || 0;

  // Revenue (Paid payments)
  let revenueQuery = supabaseAdmin.from('payments').select('amount').eq('status', 'paid');
  // Need to join if we want to filter by branch, skipped for simplicity here
  const { data: payments } = await revenueQuery;
  stats.total_revenue = payments?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;

  // ... additional complex stats like attendance rate could go here

  return stats;
};
