import * as userService from '../users/users.service.js';
import { supabaseAdmin } from '../../config/supabase.js';

export const createStudent = async (req, res, next) => {
  try {
    const data = { ...req.body, role: 'student' };
    const { user, tempPassword } = await userService.createUser(data, req.user?.email);
    
    res.status(201).json({
      success: true,
      data: user,
      message: 'Student created successfully',
      tempPassword
    });
  } catch (error) {
    next(error);
  }
};

export const listStudents = async (req, res, next) => {
  try {
    const filters = { ...req.query, role: 'student' };
    const students = await userService.listUsers(filters);
    res.status(200).json({ success: true, data: students });
  } catch (error) {
    next(error);
  }
};

export const getStudentById = async (req, res, next) => {
  try {
    // If asking for "my-profile", resolve ID from req.user
    const isSelf = req.params.id === 'my-profile';
    const studentId = isSelf ? req.user.id : req.params.id;

    const student = await userService.getUserById(studentId);
    
    if (!student || student.role !== 'student') {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    res.status(200).json({ success: true, data: student });
  } catch (error) {
    next(error);
  }
};

export const updateStudent = async (req, res, next) => {
  try {
    const isSelf = req.params.id === 'my-profile';
    const studentId = isSelf ? req.user.id : req.params.id;

    const existing = await userService.getUserById(studentId);
    if (!existing || existing.role !== 'student') {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const updatedStudent = await userService.updateUser(studentId, req.body, req.file);

    // Update academic info if provided (and only if admin)
    if (!isSelf && (req.body.section_id || req.body.academic_year_id || req.body.roll_number)) {
      const { data: currentSection } = await supabaseAdmin
        .from('student_sections')
        .select('*')
        .eq('student_id', studentId)
        .eq('is_active', true)
        .maybeSingle();

      if (currentSection) {
        const updatePayload = {};
        if (req.body.section_id) updatePayload.section_id = req.body.section_id;
        if (req.body.academic_year_id) updatePayload.academic_year_id = req.body.academic_year_id;
        if (req.body.roll_number) updatePayload.roll_number = req.body.roll_number;

        await supabaseAdmin.from('student_sections')
          .update(updatePayload)
          .eq('student_id', studentId)
          .eq('is_active', true);
      } else {
        if (req.body.section_id && req.body.academic_year_id) {
          let rollNumber = req.body.roll_number;
          if (!rollNumber) {
            const { data: existingStudents } = await supabaseAdmin
              .from('student_sections')
              .select('roll_number')
              .eq('section_id', req.body.section_id)
              .eq('academic_year_id', req.body.academic_year_id);
            
            if (existingStudents) {
              const validRolls = existingStudents
                .map((s) => parseInt(s.roll_number, 10))
                .filter((n) => !isNaN(n));
              const maxRoll = validRolls.length > 0 ? Math.max(...validRolls) : 0;
              rollNumber = (maxRoll + 1).toString();
            } else {
              rollNumber = '1';
            }
          }
          await supabaseAdmin.from('student_sections').insert({
            student_id: studentId,
            section_id: req.body.section_id,
            academic_year_id: req.body.academic_year_id,
            roll_number: rollNumber,
            is_active: true
          });
        }
      }
    }

    res.status(200).json({ success: true, data: updatedStudent, message: 'Student profile updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const deactivateStudent = async (req, res, next) => {
  try {
    const existing = await userService.getUserById(req.params.id);
    if (!existing || existing.role !== 'student') {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    await userService.deactivateUser(req.params.id);
    res.status(200).json({ success: true, message: 'Student deactivated successfully' });
  } catch (error) {
    next(error);
  }
};
