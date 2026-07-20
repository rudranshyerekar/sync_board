import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Users, Clock, Search, Filter } from 'lucide-react';
import { Avatar } from '../../../components/Avatar';
import { Button } from '../../../components/Button';

const DashboardView = () => {
  // Mock list of boards for the dashboard
  const mockBoards = [
    { id: 'board-1', title: 'Website Redesign', members: 4, lastActive: '12m ago', color: 'bg-indigo-500' },
    { id: 'board-2', title: 'Mobile App', members: 6, lastActive: '2h ago', color: 'bg-emerald-500' },
    { id: 'board-3', title: 'Marketing Plan', members: 2, lastActive: '1d ago', color: 'bg-amber-500' },
    { id: 'board-4', title: 'DevOps Pipeline', members: 3, lastActive: '3d ago', color: 'bg-blue-500' },
    { id: 'board-5', title: 'Study Scheduler', members: 1, lastActive: '1w ago', color: 'bg-fuchsia-500' },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50">
      
      {/* Header */}
      <header className="h-16 border-b border-border bg-white flex items-center justify-between px-8 flex-shrink-0">
        <h1 className="text-xl font-bold text-gray-900">Boards</h1>
        
        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search boards..." 
              className="pl-9 pr-4 py-1.5 border border-gray-300 rounded-md text-sm w-64 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <Button variant="secondary" className="flex items-center gap-2 py-1.5 text-sm text-gray-700">
            <Filter className="w-4 h-4" /> Filter
          </Button>
          <Link to="/b/create">
            <Button variant="primary" className="py-1.5">Create Board</Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto">
          
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-500" /> Recently Viewed
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {mockBoards.slice(0, 2).map((board) => (
                <Link key={`recent-${board.id}`} to={`/b/${board.id}`} className="block group">
                  <div className="bg-white rounded-xl border border-border overflow-hidden hover:shadow-md hover:border-primary transition-all">
                    <div className={`h-24 ${board.color} flex items-center justify-center`}>
                      <LayoutDashboard className="w-10 h-10 text-white/50" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">{board.title}</h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-500" /> Your Workspaces
            </h2>
            
            <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-border bg-gray-50 flex items-center justify-between">
                <h3 className="font-semibold text-gray-700">Frontend Development Team</h3>
                <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded border border-gray-200">Free Plan</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 border-t border-border">
                {mockBoards.map((board, index) => (
                  <Link 
                    key={board.id} 
                    to={`/b/${board.id}`}
                    className={`block p-6 hover:bg-gray-50 transition-colors ${
                      index % 3 !== 2 ? 'border-r border-border' : ''
                    } ${index < mockBoards.length - 3 ? 'border-b border-border' : ''}`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-10 h-10 rounded-lg ${board.color} flex items-center justify-center text-white`}>
                        <span className="font-bold">{board.title.charAt(0)}</span>
                      </div>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">{board.title}</h4>
                    <p className="text-sm text-gray-500 mb-4">Updated {board.lastActive}</p>
                    
                    <div className="flex -space-x-2">
                      <Avatar user={{ name: "A", avatarUrl: "https://i.pravatar.cc/150?u=1" }} size="sm" className="ring-2 ring-white" />
                      <Avatar user={{ name: "B", avatarUrl: "https://i.pravatar.cc/150?u=2" }} size="sm" className="ring-2 ring-white" />
                      {board.members > 2 && (
                        <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600 ring-2 ring-white">
                          +{board.members - 2}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default DashboardView;
