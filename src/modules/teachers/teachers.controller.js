import { supabaseAdmin } from '../../config/supabase.js';
import * as userService from '../users/users.service.js';

export const createTeacher = async (req, res, next) => {
  try {
    const data = { ...req.body, role: 'teacher', created_by: req.user.id };
    const { user, tempPassword } = await userService.createUser(data, req.file);
    res.status(201).json({
      success: true,
      data: user,
      message: 'Teacher created successfully',
      tempPassword
    });
  } catch (error) {
    next(error);
  }
};

export const listTeachers = async (req, res, next) => {
  try {
    const filters = { ...req.query, role: 'teacher' };
    const teachers = await userService.listUsers(filters);
    res.status(200).json({ success: true, data: teachers });
  } catch (error) {
    next(error);
  }
};

export const getTeacherById = async (req, res, next) => {
  try {
    const teacher = await userService.getUserById(req.params.id);
    if (!teacher || teacher.role !== 'teacher') {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }
    res.status(200).json({ success: true, data: teacher });
  } catch (error) {
    next(error);
  }
};

export const updateTeacher = async (req, res, next) => {
  try {
    // Ensure we are updating a teacher
    const existing = await userService.getUserById(req.params.id);
    if (!existing || existing.role !== 'teacher') {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }
    const updatedTeacher = await userService.updateUser(req.params.id, req.body, req.file);
    res.status(200).json({ success: true, data: updatedTeacher, message: 'Teacher updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const deactivateTeacher = async (req, res, next) => {
  try {
    const existing = await userService.getUserById(req.params.id);
    if (!existing || existing.role !== 'teacher') {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }
    await userService.deactivateUser(req.params.id);
    res.status(200).json({ success: true, message: 'Teacher deactivated successfully' });
  } catch (error) {
    next(error);
  }
};

export const getDashboardStats = async (req, res, next) => {
  try {
    const teacherId = req.user.id;
    // Get current day of week (e.g. 'monday')
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', timeZone: 'Asia/Kolkata' }).toLowerCase();
    
    // 1. Get unique sections the teacher is teaching
    const { data: ttPeriods } = await supabaseAdmin
      .from('timetable_periods')
      .select('section_id')
      .eq('teacher_id', teacherId);
      
    const { data: sectionRows } = await supabaseAdmin
      .from('sections')
      .select('id')
      .eq('teacher_id', teacherId);

    let totalStudents = 0;
    const uniqueSections = new Set([
      ...(ttPeriods || []).map(p => p.section_id),
      ...(sectionRows || []).map(s => s.id)
    ]);
    
    if (uniqueSections.size > 0) {
      const { count } = await supabaseAdmin
        .from('student_sections')
        .select('*', { count: 'exact', head: true })
        .in('section_id', Array.from(uniqueSections))
        .eq('is_active', true);
      totalStudents = count || 0;
    }

    // 2. Upcoming Classes for Today
    const { data: upcomingClasses } = await supabaseAdmin
      .from('timetable_periods')
      .select(`
        id,
        start_time,
        end_time,
        room_number,
        sections ( name, classes ( name ) ),
        subjects ( name )
      `)
      .eq('teacher_id', teacherId)
      .eq('day_of_week', today)
      .eq('is_active', true)
      .order('start_time', { ascending: true });

    // 3. Notices
    const { count: noticesCount } = await supabaseAdmin
      .from('notices')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', true);

    res.status(200).json({
      success: true,
      data: {
        total_students: totalStudents,
        pending_homework: 0, // Placeholder
        upcoming_meetings: 0, // Placeholder
        unread_notices: noticesCount || 0,
        upcoming_classes: upcomingClasses || [],
      },
      message: 'Dashboard stats retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const getMyStudentsBySection = async (req, res, next) => {
  try {
    const teacherId = req.user.id;

    // 1. Get unique sections the teacher is teaching
    const { data: ttPeriods } = await supabaseAdmin
      .from('timetable_periods')
      .select('section_id')
      .eq('teacher_id', teacherId);
      
    const { data: sectionRows } = await supabaseAdmin
      .from('sections')
      .select('id')
      .eq('teacher_id', teacherId);

    const uniqueSections = new Set([
      ...(ttPeriods || []).map(p => p.section_id),
      ...(sectionRows || []).map(s => s.id)
    ]);

    if (uniqueSections.size === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    // 2. Fetch those sections, joining student_sections and users
    const { data: sectionsData, error } = await supabaseAdmin
      .from('sections')
      .select(`
        id,
        name,
        classes ( name ),
        student_sections (
          roll_number,
          users ( id, full_name, email, avatar_url, phone )
        )
      `)
      .in('id', Array.from(uniqueSections))
      .eq('is_active', true);

    if (error) {
      throw error;
    }

    // 3. Format response
    // Supabase will return student_sections array. Let's map it cleanly.
    const formattedData = sectionsData.map(section => ({
      section_id: section.id,
      section_name: section.name,
      class_name: section.classes?.name,
      students: (section.student_sections || []).map(ss => ({
        student_id: ss.users?.id,
        roll_number: ss.roll_number,
        full_name: ss.users?.full_name,
        email: ss.users?.email,
        phone: ss.users?.phone,
        avatar_url: ss.users?.avatar_url,
      })).filter(s => s.student_id) // filter out nulls
    }));

    res.status(200).json({ success: true, data: formattedData });
  } catch (error) {
    next(error);
  }
};
