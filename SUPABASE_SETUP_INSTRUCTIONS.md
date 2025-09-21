# 🚀 SUPABASE SETUP INSTRUCTIONS

## **STEP 1: Create Supabase Project**

### **1.1 Go to Supabase Dashboard**
1. Visit: https://app.supabase.com
2. Click "New Project"
3. Choose your organization
4. Project name: `elevate-for-humanity`
5. Database password: Create a strong password
6. Region: Choose closest to your users
7. Click "Create new project"

### **1.2 Wait for Project Creation**
- Takes 2-3 minutes to provision
- You'll see a progress indicator
- Don't close the browser tab

## **STEP 2: Get Your Credentials**

### **2.1 Project Settings**
1. Go to Settings → API
2. Copy these values:

```bash
Project URL: https://your-project-id.supabase.co
anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **2.2 Update .env File**
Replace the placeholder values in `.env`:

```bash
# Replace these with your actual values:
VITE_SUPABASE_URL=https://your-actual-project-id.supabase.co
SUPABASE_URL=https://your-actual-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_actual_anon_key
SUPABASE_SERVICE_KEY=your_actual_service_key
```

## **STEP 3: Set Up Database Schema**

### **3.1 Run SQL in Supabase**
1. Go to SQL Editor in Supabase dashboard
2. Create a new query
3. Copy and paste this schema:

```sql
-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'elevate_for_humanity_secure_jwt_secret_2024';

-- Create app_users table
CREATE TABLE IF NOT EXISTS app_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES app_users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  date_of_birth DATE,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create preferences table
CREATE TABLE IF NOT EXISTS preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES app_users(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT false,
  language TEXT DEFAULT 'en',
  timezone TEXT DEFAULT 'America/New_York',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create programs table
CREATE TABLE IF NOT EXISTS programs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  duration_weeks INTEGER,
  capacity INTEGER,
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'active',
  wioa_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create enrollments table
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES app_users(id) ON DELETE CASCADE,
  program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  enrollment_date DATE DEFAULT CURRENT_DATE,
  completion_date DATE,
  grade DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create assessments table
CREATE TABLE IF NOT EXISTS assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES app_users(id) ON DELETE CASCADE,
  program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
  assessment_type TEXT NOT NULL,
  questions JSONB,
  answers JSONB,
  score DECIMAL(5,2),
  max_score DECIMAL(5,2),
  passed BOOLEAN,
  taken_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create certificates table
CREATE TABLE IF NOT EXISTS certificates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES app_users(id) ON DELETE CASCADE,
  program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
  certificate_number TEXT UNIQUE NOT NULL,
  issued_date DATE DEFAULT CURRENT_DATE,
  expiry_date DATE,
  status TEXT DEFAULT 'active',
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- Create policies for app_users
CREATE POLICY "Users can view own data" ON app_users
  FOR SELECT USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can update own data" ON app_users
  FOR UPDATE USING (auth.uid() = auth_user_id);

-- Create policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM app_users WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own profile" ON profiles
  FOR ALL USING (
    user_id IN (
      SELECT id FROM app_users WHERE auth_user_id = auth.uid()
    )
  );

-- Create policies for preferences
CREATE POLICY "Users can manage own preferences" ON preferences
  FOR ALL USING (
    user_id IN (
      SELECT id FROM app_users WHERE auth_user_id = auth.uid()
    )
  );

-- Create policies for programs (public read)
CREATE POLICY "Anyone can view active programs" ON programs
  FOR SELECT USING (status = 'active');

-- Create policies for enrollments
CREATE POLICY "Users can view own enrollments" ON enrollments
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM app_users WHERE auth_user_id = auth.uid()
    )
  );

-- Create policies for assessments
CREATE POLICY "Users can view own assessments" ON assessments
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM app_users WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own assessments" ON assessments
  FOR INSERT WITH CHECK (
    user_id IN (
      SELECT id FROM app_users WHERE auth_user_id = auth.uid()
    )
  );

-- Create policies for certificates
CREATE POLICY "Users can view own certificates" ON certificates
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM app_users WHERE auth_user_id = auth.uid()
    )
  );

-- Insert sample programs
INSERT INTO programs (name, description, duration_weeks, capacity, wioa_approved) VALUES
('Healthcare Assistant', 'Comprehensive healthcare training program', 12, 25, true),
('IT Support Specialist', 'Computer support and troubleshooting', 16, 20, true),
('Construction Trades', 'Basic construction and safety training', 8, 30, true),
('Customer Service Excellence', 'Professional customer service skills', 6, 40, true),
('Digital Marketing Fundamentals', 'Online marketing and social media', 10, 15, false);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_app_users_updated_at BEFORE UPDATE ON app_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_preferences_updated_at BEFORE UPDATE ON preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_programs_updated_at BEFORE UPDATE ON programs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enrollments_updated_at BEFORE UPDATE ON enrollments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### **3.2 Run the Query**
1. Click "Run" to execute the SQL
2. You should see "Success. No rows returned"
3. Check the Table Editor to see your new tables

## **STEP 4: Test Connection**

### **4.1 Test Environment Variables**
```bash
# In your terminal:
npm run test:supabase
```

### **4.2 Check Tables**
1. Go to Table Editor in Supabase
2. You should see:
   - app_users
   - profiles
   - preferences
   - programs
   - enrollments
   - assessments
   - certificates

## **STEP 5: Enable Authentication**

### **5.1 Configure Auth Settings**
1. Go to Authentication → Settings
2. Site URL: `http://localhost:3000` (for development)
3. Redirect URLs: Add your domain when ready
4. Enable email confirmations: OFF (for development)
5. Enable phone confirmations: OFF

### **5.2 Email Templates (Optional)**
1. Go to Authentication → Email Templates
2. Customize signup/reset emails
3. Add your branding

## **🎯 VERIFICATION CHECKLIST**

After setup, verify:

- [ ] ✅ Supabase project created
- [ ] ✅ Environment variables updated in `.env`
- [ ] ✅ Database schema deployed
- [ ] ✅ Tables visible in Table Editor
- [ ] ✅ Row Level Security enabled
- [ ] ✅ Sample programs inserted
- [ ] ✅ Authentication configured

## **🚨 SECURITY NOTES**

### **Keep These Secret:**
- `SUPABASE_SERVICE_KEY` - Never expose in frontend
- Database password
- JWT secret

### **Safe to Expose:**
- `VITE_SUPABASE_URL` - Public URL
- `VITE_SUPABASE_ANON_KEY` - Public anonymous key

## **📞 NEED HELP?**

If you encounter issues:
1. Check Supabase project logs
2. Verify environment variables
3. Test connection with simple query
4. Check Row Level Security policies

**Once this is set up, we can build the student portal interface!**