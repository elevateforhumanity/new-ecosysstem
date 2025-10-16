-- LMS Seed Data
-- Sample courses and content for testing

-- Insert sample instructor profile (you'll need to replace with real user ID after signup)
-- For now, we'll use a placeholder that you can update later

-- Insert sample courses
INSERT INTO public.courses (id, title, description, duration, credentials, published) VALUES
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Digital Drawing & Illustration Specialist', 'Master digital art with Adobe Creative Suite, Procreate, and industry-standard techniques. Learn from concept to final artwork.', '24 weeks • 600 hours', 'Adobe, Google, Canva credentials', true),
('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'AI Fundamentals & Machine Learning', 'Introduction to artificial intelligence and machine learning. Build real-world AI applications using Python and TensorFlow.', '48 hours • 12 modules', 'Industry certification', true),
('c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', 'Data Science & Analytics', 'Learn data analysis, visualization, and statistical modeling. Work with real datasets and industry tools.', '64 hours • 16 modules', 'Professional certificate', true),
('d4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a', 'Cybersecurity Specialist', 'Comprehensive cybersecurity training covering network security, ethical hacking, and CISSP preparation.', '80 hours • 20 modules', 'CISSP preparation', true),
('e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b', 'Google Data Analytics Certificate', 'Official Google Career Certificate in Data Analytics. Learn to analyze data and make data-driven decisions.', '6 months', 'Google Career Certificate', true);

-- Insert modules for Digital Drawing course
INSERT INTO public.modules (course_id, title, description, order_index, duration_minutes) VALUES
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Introduction to Digital Art', 'Overview of digital art tools and techniques', 1, 60),
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Adobe Photoshop Basics', 'Learn the fundamentals of Photoshop for digital illustration', 2, 120),
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Drawing Techniques', 'Master digital drawing techniques and brush work', 3, 180),
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Color Theory', 'Understanding color in digital art', 4, 90),
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Character Design', 'Create compelling character designs', 5, 150);

-- Insert modules for AI Fundamentals course
INSERT INTO public.modules (course_id, title, description, order_index, duration_minutes) VALUES
('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'What is AI?', 'Introduction to artificial intelligence concepts', 1, 45),
('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'Machine Learning Basics', 'Understanding machine learning algorithms', 2, 90),
('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'Python for AI', 'Python programming for AI applications', 3, 120),
('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'Neural Networks', 'Deep learning and neural network fundamentals', 4, 150);

-- Insert modules for Data Science course
INSERT INTO public.modules (course_id, title, description, order_index, duration_minutes) VALUES
('c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', 'Data Science Overview', 'Introduction to data science and analytics', 1, 60),
('c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', 'Statistics Fundamentals', 'Essential statistics for data analysis', 2, 120),
('c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', 'Data Visualization', 'Creating effective data visualizations', 3, 90),
('c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', 'SQL for Data Analysis', 'Database querying and data manipulation', 4, 150);

-- Insert modules for Cybersecurity course
INSERT INTO public.modules (course_id, title, description, order_index, duration_minutes) VALUES
('d4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a', 'Cybersecurity Fundamentals', 'Introduction to cybersecurity concepts', 1, 90),
('d4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a', 'Network Security', 'Securing networks and infrastructure', 2, 120),
('d4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a', 'Ethical Hacking', 'Penetration testing and vulnerability assessment', 3, 180),
('d4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a', 'CISSP Preparation', 'Preparing for CISSP certification', 4, 240);

-- Note: Enrollments and progress will be created when users sign up and enroll
-- The frontend will handle user enrollment through the API
