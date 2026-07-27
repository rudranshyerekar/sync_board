import React, { useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Plus, LayoutDashboard, CheckSquare, Activity, Calendar, Settings, LogOut } from 'lucide-react';
import { Button } from '../../components/Button';
import { Avatar } from '../../components/Avatar';
import { useAuthStore } from '../../features/auth/state/useAuthStore';
import { useNotificationStore } from '../../features/notifications/state/useNotificationStore';
import { useBoardStore } from '../../features/board/state/useBoardStore';

export const MainLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { fetchNotifications } = useNotificationStore();
  const { board } = useBoardStore();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Fetch initial notification count on mount (HTTP — does not need WS)
  useEffect(() => {
    fetchNotifications();
  }, []);

  const navItems = [
    { name: 'Boards', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'My Tasks', icon: CheckSquare, path: '/tasks' },
    { name: 'Activity', icon: Activity, path: '/activity' },
    { name: 'Calendar', icon: Calendar, path: '/calendar' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  const currentUser = user || { name: 'Guest User', email: 'guest@example.com' };

  return (
    <div className="h-screen bg-bg-primary flex overflow-hidden font-sans">

      {/* Global Left Sidebar */}
      <aside className="w-64 border-r border-border bg-white flex flex-col justify-between hidden md:flex flex-shrink-0">
        <div>
          {/* Logo + New Board */}
          <div className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-white font-bold text-lg">S</div>
              <div>
                <h1 className="font-bold text-gray-900 leading-tight">SyncBoard</h1>
                <p className="text-xs text-gray-500">Real-time. Together.</p>
              </div>
            </div>
          </div>

          <div className="px-4 mb-4">
            <Link to="/b/create">
              <Button variant="primary" className="w-full flex items-center justify-center gap-2 py-2.5">
                <Plus className="w-4 h-4" /> New Board
              </Button>
            </Link>
          </div>

          <nav className="space-y-1 px-3">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path) || (item.path === '/dashboard' && location.pathname.startsWith('/b/'));
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-primary'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="w-4 h-4" /> {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 px-3">
            <h2 className="text-xs font-bold text-gray-400 mb-3 px-3 uppercase tracking-wider">Your Boards</h2>
            <nav className="space-y-1">
              <Link to="/dashboard" className="flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md bg-blue-50 text-primary group">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded bg-purple-100 border border-purple-200 flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  </div>
                  <span className="truncate w-32">Product Launch Plan</span>
                </div>
                <button className="opacity-0 group-hover:opacity-100 text-primary hover:text-blue-700">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                </button>
              </Link>
              <Link to="/dashboard" className="flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 group">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded bg-blue-50 border border-blue-200 flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  </div>
                  <span className="truncate w-32">Website Redesign</span>
                </div>
                <button className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                </button>
              </Link>
              <Link to="/dashboard" className="flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 group">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded bg-green-50 border border-green-200 flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  </div>
                  <span className="truncate w-32">Marketing Q3</span>
                </div>
                <button className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                </button>
              </Link>
            </nav>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between p-2 -mx-2 rounded-md hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar user={currentUser} size="md" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{currentUser.name}</p>
                <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-red-500 p-1.5 rounded-md hover:bg-red-50 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-bg-primary">
        <Outlet />
      </div>
    </div>
  );
};
