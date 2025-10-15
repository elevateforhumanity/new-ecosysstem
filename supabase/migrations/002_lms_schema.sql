-- LMS Complete Database Schema
-- Creates all tables needed for a functional Learning Management System

-- Courses table
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    duration TEXT,
    credentials TEXT,
    instructor_id UUID REFERENCES public.profiles(id),
    published BOOLEAN DEFAULT false,
    thumbnail_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Course modules/lessons
CREATE TABLE IF NOT EXISTS public.modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    content TEXT,
    video_url TEXT,
    duration_minutes INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Student enrollments
CREATE TABLE IF NOT EXISTS public.enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'dropped')),
    UNIQUE(user_id, course_id)
);

-- Module completion tracking
CREATE TABLE IF NOT EXISTS public.module_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enrollment_id UUID REFERENCES public.enrollments(id) ON DELETE CASCADE,
    module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    time_spent_minutes INTEGER DEFAULT 0,
    UNIQUE(enrollment_id, module_id)
);

-- Certificates
CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    certificate_url TEXT,
    credential_id TEXT UNIQUE,
    UNIQUE(user_id, course_id)
);

-- Assignments/Projects
CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMP WITH TIME ZONE,
    points INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Assignment submissions
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT,
    file_url TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    grade INTEGER,
    feedback TEXT,
    graded_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(assignment_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for courses
CREATE POLICY "Courses are viewable by everyone" ON public.courses
    FOR SELECT USING (published = true OR instructor_id = auth.uid());

CREATE POLICY "Instructors can insert courses" ON public.courses
    FOR INSERT WITH CHECK (auth.uid() = instructor_id);

CREATE POLICY "Instructors can update own courses" ON public.courses
    FOR UPDATE USING (auth.uid() = instructor_id);

-- RLS Policies for enrollments
CREATE POLICY "Users can view own enrollments" ON public.enrollments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can enroll in courses" ON public.enrollments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own enrollments" ON public.enrollments
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for module_progress
CREATE POLICY "Users can view own progress" ON public.module_progress
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.enrollments
            WHERE enrollments.id = module_progress.enrollment_id
            AND enrollments.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own progress" ON public.module_progress
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.enrollments
            WHERE enrollments.id = module_progress.enrollment_id
            AND enrollments.user_id = auth.uid()
        )
    );

-- RLS Policies for certificates
CREATE POLICY "Users can view own certificates" ON public.certificates
    FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for submissions
CREATE POLICY "Users can view own submissions" ON public.submissions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can submit assignments" ON public.submissions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_courses_published ON public.courses(published);
CREATE INDEX idx_courses_instructor ON public.courses(instructor_id);
CREATE INDEX idx_modules_course ON public.modules(course_id);
CREATE INDEX idx_enrollments_user ON public.enrollments(user_id);
CREATE INDEX idx_enrollments_course ON public.enrollments(course_id);
CREATE INDEX idx_module_progress_enrollment ON public.module_progress(enrollment_id);
CREATE INDEX idx_certificates_user ON public.certificates(user_id);
CREATE INDEX idx_submissions_user ON public.submissions(user_id);

-- Function to update enrollment progress
CREATE OR REPLACE FUNCTION update_enrollment_progress()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.enrollments
    SET progress = (
        SELECT ROUND(
            (COUNT(*) FILTER (WHERE completed = true)::FLOAT / 
             NULLIF(COUNT(*)::FLOAT, 0)) * 100
        )
        FROM public.module_progress
        WHERE enrollment_id = NEW.enrollment_id
    )
    WHERE id = NEW.enrollment_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-update progress
CREATE TRIGGER on_module_progress_change
    AFTER INSERT OR UPDATE ON public.module_progress
    FOR EACH ROW EXECUTE FUNCTION update_enrollment_progress();

-- Function to issue certificate on course completion
CREATE OR REPLACE FUNCTION issue_certificate_on_completion()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.progress = 100 AND OLD.progress < 100 THEN
        INSERT INTO public.certificates (user_id, course_id, credential_id)
        VALUES (
            NEW.user_id,
            NEW.course_id,
            'CERT-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 12))
        )
        ON CONFLICT (user_id, course_id) DO NOTHING;
        
        UPDATE public.enrollments
        SET status = 'completed', completed_at = NOW()
        WHERE id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-issue certificates
CREATE TRIGGER on_course_completion
    AFTER UPDATE ON public.enrollments
    FOR EACH ROW EXECUTE FUNCTION issue_certificate_on_completion();
