import groqInstance from '../../config/groq.js';
import { supabaseAdmin } from '../../config/supabase.js';

export const generateStudentReport = async (student_id, academic_year_id) => {
  if (!groqInstance) throw new Error('Groq AI is not configured');

  const { data: student } = await supabaseAdmin.from('users').select('full_name, date_of_birth').eq('id', student_id).single();
  const { data: attendance } = await supabaseAdmin.from('attendance').select('present').eq('student_id', student_id);
  const { data: results } = await supabaseAdmin.from('exam_results').select('*, exams(title)').eq('student_id', student_id);

  const completion = await groqInstance.chat.completions.create({
    model: 'llama-3.1-70b-versatile',
    messages: [
      {
        role: 'system',
        content: 'You are an expert academic counsellor for an Abacus and Vedic Maths institute. Generate a structured, encouraging student progress report based on the data provided.'
      },
      {
        role: 'user',
        content: `Generate a performance report for this student:\n${JSON.stringify({
          student,
          attendance: { total_days: attendance?.length, present_days: attendance?.filter(a => a.present).length },
          examResults: results,
        })}`
      }
    ],
    max_tokens: 800,
  });

  return completion.choices[0]?.message?.content || 'No report generated';
};
