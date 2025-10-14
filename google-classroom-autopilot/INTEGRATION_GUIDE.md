# Integration Guide - Adding Classroom Components to EFH Platform

This guide shows how to integrate the Google Classroom Autopilot components into your main Elevate for Humanity platform.

## Step 1: Install Dependencies

```bash
cd /workspaces/tiny-new
npm install ./google-classroom-autopilot
```

## Step 2: Add Routes

Edit `src/App.tsx` or your router configuration:

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ClassroomAdminPanel from '@/components/classroom/admin/ClassroomAdminPanel';
import CourseCreationForm from '@/components/classroom/instructor/CourseCreationForm';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Existing routes */}
        <Route path="/" element={<Home />} />
        <Route path="/programs" element={<Programs />} />
        
        {/* New Classroom routes */}
        <Route path="/admin/classroom" element={<ClassroomAdminPanel />} />
        <Route path="/instructor/create-course" element={<CourseCreationForm />} />
      </Routes>
    </BrowserRouter>
  );
}
```

## Step 3: Add Navigation Links

Edit your navigation component:

```tsx
// For Admin users
<nav>
  <a href="/admin/classroom">Classroom Admin</a>
</nav>

// For Instructors
<nav>
  <a href="/instructor/create-course">Create Course</a>
</nav>
```

## Step 4: Add to LMS Dashboard

Edit `src/components/lms/LMSDashboard.tsx`:

```tsx
import { Link } from 'react-router-dom';

function LMSDashboard() {
  return (
    <div className="dashboard">
      <h1>LMS Dashboard</h1>
      
      {/* Quick Actions */}
      <div className="quick-actions">
        <Link to="/instructor/create-course" className="action-card">
          <span className="icon">📚</span>
          <h3>Create Course</h3>
          <p>Set up a new Google Classroom course</p>
        </Link>
        
        <Link to="/admin/classroom" className="action-card">
          <span className="icon">⚙️</span>
          <h3>Classroom Admin</h3>
          <p>Manage courses, students, and assignments</p>
        </Link>
      </div>
    </div>
  );
}
```

## Step 5: Add Permission Checks

Create a permission wrapper:

```tsx
// src/components/auth/RequireRole.tsx
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';

interface RequireRoleProps {
  role: 'admin' | 'instructor' | 'student';
  children: React.ReactNode;
}

export function RequireRole({ role, children }: RequireRoleProps) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (user.role !== role && user.role !== 'admin') {
    return <Navigate to="/unauthorized" />;
  }
  
  return <>{children}</>;
}
```

Use it in routes:

```tsx
<Route 
  path="/admin/classroom" 
  element={
    <RequireRole role="admin">
      <ClassroomAdminPanel />
    </RequireRole>
  } 
/>

<Route 
  path="/instructor/create-course" 
  element={
    <RequireRole role="instructor">
      <CourseCreationForm />
    </RequireRole>
  } 
/>
```

## Step 6: Add to Sidebar Navigation

Edit `src/components/layout/Sidebar.tsx`:

```tsx
const navigationItems = [
  // Existing items
  { path: '/', icon: '🏠', label: 'Home' },
  { path: '/programs', icon: '📚', label: 'Programs' },
  
  // Classroom items (conditional based on role)
  ...(user?.role === 'admin' || user?.role === 'instructor' ? [
    { 
      path: '/instructor/create-course', 
      icon: '➕', 
      label: 'Create Course' 
    },
  ] : []),
  
  ...(user?.role === 'admin' ? [
    { 
      path: '/admin/classroom', 
      icon: '⚙️', 
      label: 'Classroom Admin' 
    },
  ] : []),
];
```

## Step 7: Add Task Status Monitor

Create a component to show task status:

```tsx
// src/components/classroom/TaskStatusMonitor.tsx
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function TaskStatusMonitor() {
  const [tasks, setTasks] = useState([]);
  
  useEffect(() => {
    // Subscribe to task updates
    const subscription = supabase
      .channel('tasks')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'tasks' },
        (payload) => {
          console.log('Task updated:', payload);
          fetchTasks();
        }
      )
      .subscribe();
    
    fetchTasks();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  const fetchTasks = async () => {
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    setTasks(data || []);
  };
  
  return (
    <div className="task-monitor">
      <h3>Recent Tasks</h3>
      <ul>
        {tasks.map(task => (
          <li key={task.id} className={`status-${task.status}`}>
            <span className="kind">{task.kind}</span>
            <span className="status">{task.status}</span>
            <span className="time">{new Date(task.created_at).toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

Add to dashboard:

```tsx
<LMSDashboard>
  <TaskStatusMonitor />
</LMSDashboard>
```

## Step 8: Add Notifications

Create a notification system for task completion:

```tsx
// src/hooks/useTaskNotifications.ts
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

export function useTaskNotifications() {
  useEffect(() => {
    const subscription = supabase
      .channel('task-notifications')
      .on('postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'tasks',
          filter: 'status=eq.completed'
        },
        (payload) => {
          const task = payload.new;
          toast.success(`Task completed: ${task.kind}`);
        }
      )
      .on('postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'tasks',
          filter: 'status=eq.failed'
        },
        (payload) => {
          const task = payload.new;
          toast.error(`Task failed: ${task.kind}`);
        }
      )
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
}
```

Use in App:

```tsx
function App() {
  useTaskNotifications();
  
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        {/* ... */}
      </Routes>
    </BrowserRouter>
  );
}
```

## Step 9: Add to Environment Variables

Update `.env.example`:

```env
# Existing variables
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...

# Google Classroom (for display only, actual processing uses service account)
VITE_GOOGLE_CLASSROOM_ENABLED=true
```

## Step 10: Update Documentation

Add to your main README:

```markdown
## Google Classroom Integration

This platform includes full Google Classroom integration:

- **Automated Course Management**: Create and manage courses automatically
- **Roster Sync**: Keep student rosters synchronized
- **Assignment Creation**: Queue assignments for automatic creation
- **Grade Export**: Export grades to Supabase for reporting
- **Auto-Sync Jobs**: Nightly maintenance tasks

See [google-classroom-autopilot/README.md](./google-classroom-autopilot/README.md) for details.
```

## Testing the Integration

### 1. Test Admin Panel

```bash
# Start dev server
npm run dev

# Navigate to http://localhost:5173/admin/classroom
# Try queueing a test task
```

### 2. Test Course Creation

```bash
# Navigate to http://localhost:5173/instructor/create-course
# Fill out form and submit
# Check Supabase tasks table for new entry
```

### 3. Test Task Processing

```bash
# In separate terminal
cd google-classroom-autopilot
npx tsx src/index.ts autopilot:run:dwd

# Watch for task completion in UI
```

## Troubleshooting

### Components not rendering

**Check**:
- Import paths are correct
- Supabase client is initialized
- User authentication is working

### Tasks not processing

**Check**:
- GitHub Actions workflow is enabled
- Secrets are configured correctly
- Service account has proper permissions

### Permission errors

**Check**:
- User roles are set correctly in database
- RequireRole wrapper is applied
- Navigation items respect role checks

## Next Steps

1. ✅ Customize styling to match your theme
2. ✅ Add more task types as needed
3. ✅ Set up monitoring and alerts
4. ✅ Configure auto-sync job schedules
5. ✅ Add student-facing components

## Support

Questions? Contact: info@elevateforhumanity.org
