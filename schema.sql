-- CLEANUP EXISTING SCHEMA
DROP TABLE IF EXISTS audit_logs, bulk_import_jobs, announcements, notifications, payments, content_items, attendance, exam_schedule, exam_results, exams, timetable_periods, enrollments, courses, student_sections, class_subjects, subjects, sections, classes, academic_years, parent_student, users, branches CASCADE;
DROP TYPE IF EXISTS user_role, course_status, payment_status, notification_type, exam_type, day_of_week, bulk_job_status CASCADE;

-- ENUMS
CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'teacher', 'student', 'parent');
CREATE TYPE course_status AS ENUM ('active', 'inactive', 'archived');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE notification_type AS ENUM ('push', 'email', 'sms');
CREATE TYPE exam_type AS ENUM ('unit_test', 'midterm', 'final', 'practice', 'competition');
CREATE TYPE day_of_week AS ENUM ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');
CREATE TYPE bulk_job_status AS ENUM ('queued', 'processing', 'done', 'failed');

-- CORE ENTITIES
CREATE TABLE branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'student',
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  branch_id UUID REFERENCES branches(id),
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  address TEXT,
  is_active BOOLEAN DEFAULT true,
  must_change_password BOOLEAN DEFAULT true,
  fcm_token TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE parent_student (
  parent_id UUID REFERENCES users(id) ON DELETE CASCADE,
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  relationship TEXT DEFAULT 'parent',
  PRIMARY KEY (parent_id, student_id)
);

-- ACADEMIC STRUCTURE
CREATE TABLE academic_years (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_current BOOLEAN DEFAULT false,
  branch_id UUID REFERENCES branches(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  branch_id UUID REFERENCES branches(id),
  academic_year_id UUID REFERENCES academic_years(id),
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES users(id),
  max_students INTEGER DEFAULT 30,
  room_number TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT,
  description TEXT,
  type TEXT CHECK (type IN ('abacus', 'vedic_maths', 'mental_arithmetic', 'general')),
  branch_id UUID REFERENCES branches(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE class_subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id),
  teacher_id UUID REFERENCES users(id),
  periods_per_week INTEGER DEFAULT 5,
  UNIQUE(class_id, subject_id)
);

CREATE TABLE student_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  section_id UUID REFERENCES sections(id),
  academic_year_id UUID REFERENCES academic_years(id),
  roll_number TEXT,
  joined_at TIMESTAMPTZ DEFAULT now(),
  left_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(student_id, section_id, academic_year_id)
);

-- COURSES
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('abacus', 'vedic_maths', 'mental_arithmetic')),
  level INTEGER DEFAULT 1,
  duration_weeks INTEGER,
  fee NUMERIC(10,2) NOT NULL,
  status course_status DEFAULT 'active',
  branch_id UUID REFERENCES branches(id),
  class_id UUID REFERENCES classes(id),
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id),
  section_id UUID REFERENCES sections(id),
  enrolled_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  progress_percent INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

-- TIMETABLE
CREATE TABLE timetable_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id),
  teacher_id UUID REFERENCES users(id),
  day_of_week day_of_week NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room_number TEXT,
  academic_year_id UUID REFERENCES academic_years(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT no_teacher_clash UNIQUE(teacher_id, day_of_week, start_time, academic_year_id),
  CONSTRAINT no_section_clash UNIQUE(section_id, day_of_week, start_time, academic_year_id)
);

-- EXAMS & RESULTS
CREATE TABLE exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  type exam_type NOT NULL,
  class_id UUID REFERENCES classes(id),
  section_id UUID REFERENCES sections(id),
  subject_id UUID REFERENCES subjects(id),
  academic_year_id UUID REFERENCES academic_years(id),
  exam_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  total_marks NUMERIC(6,2) NOT NULL,
  passing_marks NUMERIC(6,2),
  instructions TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE exam_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  student_id UUID REFERENCES users(id),
  marks_obtained NUMERIC(6,2),
  grade TEXT,
  remarks TEXT,
  is_absent BOOLEAN DEFAULT false,
  entered_by UUID REFERENCES users(id),
  entered_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(exam_id, student_id)
);

CREATE TABLE exam_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academic_year_id UUID REFERENCES academic_years(id),
  exam_id UUID REFERENCES exams(id),
  venue TEXT,
  invigilator_id UUID REFERENCES users(id),
  notes TEXT
);

-- ATTENDANCE
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES users(id),
  section_id UUID REFERENCES sections(id),
  subject_id UUID REFERENCES subjects(id),
  course_id UUID REFERENCES courses(id),
  date DATE NOT NULL,
  present BOOLEAN DEFAULT false,
  late BOOLEAN DEFAULT false,
  remarks TEXT,
  marked_by UUID REFERENCES users(id),
  UNIQUE(student_id, section_id, subject_id, date)
);

-- CONTENT, PAYMENTS, NOTIFICATIONS, ANNOUNCEMENTS
CREATE TABLE content_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id),
  subject_id UUID REFERENCES subjects(id),
  title TEXT NOT NULL,
  type TEXT CHECK (type IN ('pdf', 'video', 'quiz', 'worksheet')),
  storage_path TEXT NOT NULL,
  public_url TEXT,
  file_size_bytes BIGINT,
  order_index INTEGER DEFAULT 0,
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID REFERENCES enrollments(id),
  student_id UUID REFERENCES users(id),
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  status payment_status DEFAULT 'pending',
  receipt TEXT,
  notes TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type notification_type DEFAULT 'push',
  data JSONB,
  is_read BOOLEAN DEFAULT false,
  sent_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  target_roles user_role[] DEFAULT ARRAY['student','parent']::user_role[],
  branch_id UUID REFERENCES branches(id),
  class_id UUID REFERENCES classes(id),
  section_id UUID REFERENCES sections(id),
  attachment_url TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- BULK IMPORT JOBS
CREATE TABLE bulk_import_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT CHECK (type IN ('students', 'results', 'attendance', 'timetable')),
  status bulk_job_status DEFAULT 'queued',
  total_rows INTEGER,
  processed_rows INTEGER DEFAULT 0,
  failed_rows INTEGER DEFAULT 0,
  error_log JSONB,
  file_path TEXT,
  result_file_path TEXT,
  created_by UUID REFERENCES users(id),
  branch_id UUID REFERENCES branches(id),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- AUDIT LOGS
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  old_value JSONB,
  new_value JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS POLICIES
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "students_own_attendance" ON attendance
  FOR SELECT USING (
    auth.uid() IN (
      SELECT auth_id FROM users WHERE id = attendance.student_id
    )
  );

CREATE POLICY "teacher_section_attendance" ON attendance
  FOR ALL USING (
    auth.uid() IN (
      SELECT u.auth_id FROM users u
      JOIN sections s ON s.teacher_id = u.id
      WHERE s.id = attendance.section_id
    )
  );

-- AUTH TRIGGER FOR AUTOMATIC USER CREATION
-- This is the Supabase best practice for syncing auth.users with public.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (auth_id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'student'::public.user_role)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
