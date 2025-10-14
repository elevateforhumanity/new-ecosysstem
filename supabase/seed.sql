-- Seed data for Elevate LMS
-- Insert sample courses
INSERT INTO public.courses (title, description, instructor_id, published) VALUES
('Introduction to Web Development', 'Learn the basics of HTML, CSS, and JavaScript', 1, true),
('Advanced React Patterns', 'Master advanced React concepts and patterns', 1, true),
('Database Design Fundamentals', 'Learn how to design efficient databases', 2, true),
('Python for Data Science', 'Introduction to data analysis with Python', 2, false);

-- Insert sample enrollments
INSERT INTO public.enrollments (user_id, course_id, progress) VALUES
(3, 1, 45),
(3, 2, 20),
(4, 1, 80),
(4, 3, 15);

-- Insert sample compliance records
INSERT INTO public.compliance_records (user_id, course_id, compliance_type, status) VALUES
(3, 1, 'WIOA', 'completed'),
(4, 1, 'WIOA', 'in_progress');
