import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../store/authStore';

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const studentLinks = [
    { path: '/dashboard', label: 'My Courses', icon: '📚' },
    { path: '/courses', label: 'Browse Courses', icon: '🔍' },
    { path: '/profile', label: 'Profile', icon: '👤' },
  ];

  const instructorLinks = [
    { path: '/dashboard/instructor', label: 'Dashboard', icon: '📊' },
    { path: '/dashboard/instructor/courses', label: 'My Courses', icon: '📚' },
    {
      path: '/dashboard/instructor/create',
      label: 'Create Course',
      icon: '➕',
    },
  ];

  const adminLinks = [
    { path: '/dashboard/admin', label: 'Dashboard', icon: '📊' },
    { path: '/dashboard/admin/users', label: 'Users', icon: '👥' },
    { path: '/dashboard/admin/courses', label: 'Courses', icon: '📚' },
  ];

  const links =
    user?.role === 'admin'
      ? adminLinks
      : user?.role === 'instructor'
        ? instructorLinks
        : studentLinks;

  return (
    <aside className="w-64 bg-white shadow-sm min-h-screen p-4">
      <nav className="space-y-2">
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              isActive(link.path)
                ? 'bg-primary-50 text-primary-700 font-medium'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="text-xl">{link.icon}</span>
            <span>{link.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
