import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Plus, LayoutDashboard, CheckSquare, Activity, Calendar, Settings, LogOut, Menu, X, Lock } from 'lucide-react';
import { Button } from '../../components/Button';
import { Avatar } from '../../components/Avatar';
import { useAuthStore } from '../../features/auth/state/useAuthStore';
import { useNotificationStore } from '../../features/notifications/state/useNotificationStore';
import { useBoardStore } from '../../features/board/state/useBoardStore';
import { useWorkspaceStore } from '../../features/workspace/state/useWorkspaceStore';

export const MainLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { fetchNotifications } = useNotificationStore();
  const { board } = useBoardStore();
  const { getAllBoards, fetchData } = useWorkspaceStore();
  const allBoards = getAllBoards();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

useEffect(() => {
  fetchNotifications();
  fetchData();
}, [location.pathname, fetchNotifications, fetchData]);

  const navItems = [
    { name: 'Boards', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'My Tasks', icon: CheckSquare, path: '/tasks' },
    { name: 'Activity', icon: Activity, path: '/activity' },
    { name: 'Calendar', icon: Calendar, path: '/calendar' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  const currentUser = user || { name: 'Guest User', email: 'guest@example.com' };

  return (
    <div className="h-screen bg-bg-primary flex overflow-hidden font-sans relative">

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Global Left Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-white flex flex-col justify-between transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:flex flex-shrink-0`}>
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
            <button 
              className="md:hidden text-gray-400 hover:text-gray-600 p-1"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
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
            <div className="flex items-center justify-between px-3 mb-3">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Your Boards</h2>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">
                {allBoards.length}
              </span>
            </div>
            <nav className="space-y-1 max-h-48 overflow-y-auto pr-1">
              {allBoards.length === 0 ? (
                <div className="px-3 py-2 text-xs text-gray-400 italic">No boards active yet</div>
              ) : (
                allBoards.map((b, idx) => {
                  const isCurrent = location.pathname === `/b/${b.id}`;
                  const colors = [
                    'bg-purple-500 border-purple-200 bg-purple-100',
                    'bg-blue-500 border-blue-200 bg-blue-100',
                    'bg-green-500 border-green-200 bg-green-100',
                    'bg-amber-500 border-amber-200 bg-amber-100'
                  ];
                  const dotClass = colors[idx % colors.length].split(' ')[0];
                  const boxClass = colors[idx % colors.length].split(' ').slice(1).join(' ');

                  return (
                    <Link
                      key={b.id}
                      to={`/b/${b.id}`}
                      className={`flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors group ${
                        isCurrent ? 'bg-blue-50 text-primary font-bold shadow-sm' : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-3.5 h-3.5 rounded border flex-shrink-0 flex items-center justify-center ${boxClass}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`}></span>
                        </div>
                        <span className="truncate block max-w-[140px]">{b.title}</span>
                        {b.privacy === 'PRIVATE' && (
                          <Lock className="w-3 h-3 text-gray-400 flex-shrink-0 ml-0.5" />
                        )}
                      </div>
                      <span className="text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        →
                      </span>
                    </Link>
                  );
                })
              )}
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
        {/* Mobile Top Bar */}
        <div className="md:hidden flex items-center justify-between bg-white border-b border-border p-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-white font-bold text-lg">S</div>
            <h1 className="font-bold text-gray-900 leading-tight">SyncBoard</h1>
          </div>
          <button onClick={() => setIsMobileMenuOpen(true)} className="text-gray-600 p-1 hover:bg-gray-100 rounded">
            <Menu className="w-6 h-6" />
          </button>
        </div>

        <Outlet />
      </div>
    </div>
  );
};
