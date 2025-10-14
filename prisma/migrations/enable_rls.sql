-- Enable Row Level Security (RLS) for Supabase
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Course" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Enrollment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Subscription" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Payment" ENABLE ROW LEVEL SECURITY;

-- Create policies for User table
CREATE POLICY "Users can view own profile" ON "User"
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON "User"
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Create policies for Course table
CREATE POLICY "Anyone can view published courses" ON "Course"
    FOR SELECT USING (published = true);

CREATE POLICY "Instructors can manage own courses" ON "Course"
    FOR ALL USING (auth.uid()::text = "instructorId"::text);

-- Create policies for Enrollment table
CREATE POLICY "Users can view own enrollments" ON "Enrollment"
    FOR SELECT USING (auth.uid()::text = "userId"::text);

CREATE POLICY "Users can enroll in courses" ON "Enrollment"
    FOR INSERT WITH CHECK (auth.uid()::text = "userId"::text);
