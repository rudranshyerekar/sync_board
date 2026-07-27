import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Users, Clock, Search, Filter, UserPlus } from 'lucide-react';
import { Avatar } from '../../../components/Avatar';
import { Button } from '../../../components/Button';
import { workspaceApi } from '../../../api/workspaceApi';
import { boardApi } from '../../../api/boardApi';
import { useAuthStore } from '../../auth/state/useAuthStore';
import { NotificationBell } from '../../notifications/components/NotificationBell';
import { InviteMemberModal } from './InviteMemberModal';
import { CreateWorkspaceModal } from './CreateWorkspaceModal';

const DashboardView = () => {
  const { user } = useAuthStore();
  const [workspaces, setWorkspaces] = useState([]);
  const [workspaceBoards, setWorkspaceBoards] = useState({}); // { [workspaceId]: Board[] }
  const [loading, setLoading] = useState(true);
  const [selectedInviteWs, setSelectedInviteWs] = useState(null);
  const [isCreateWsOpen, setIsCreateWsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const wsData = await workspaceApi.getMyWorkspaces();
        setWorkspaces(wsData);
        
        // Fetch boards for each workspace in parallel
        const boardsMap = {};
        await Promise.all(
          wsData.map(async (ws) => {
            try {
              const boards = await boardApi.getBoards(ws.id);
              boardsMap[ws.id] = boards;
            } catch (err) {
              console.error(`Failed to fetch boards for workspace ${ws.id}:`, err);
              boardsMap[ws.id] = [];
            }
          })
        );
        setWorkspaceBoards(boardsMap);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getInitials = (title) => {
    if (!title) return 'B';
    return title.charAt(0).toUpperCase();
  };

  const getRandomColor = (id) => {
    const colors = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-blue-500', 'bg-fuchsia-500'];
    return colors[(id || 0) % colors.length];
  };

  const allBoards = Object.values(workspaceBoards).flat();

  // Filter boards and workspaces based on searchQuery
  const filteredBoards = allBoards.filter(board => 
    !searchQuery || board.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredWorkspaces = workspaces.filter(ws => 
    !searchQuery || ws.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (workspaceBoards[ws.id] || []).some(b => b.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
              placeholder="Search boards and workspaces..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-1.5 border border-gray-300 rounded-md text-sm w-64 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <NotificationBell />
          <Button variant="secondary" className="flex items-center gap-2 py-1.5 text-sm text-gray-700">
            <Filter className="w-4 h-4" /> Filter
          </Button>
          <Button variant="secondary" onClick={() => setIsCreateWsOpen(true)} className="py-1.5 text-sm">
            Create Workspace
          </Button>
          <Link to="/b/create">
            <Button variant="primary" className="py-1.5">Create Board</Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto">
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <span className="text-gray-500">Loading dashboard...</span>
            </div>
          ) : (
            <>
              {filteredBoards.length > 0 && !searchQuery && (
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gray-500" /> Recently Viewed
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredBoards.slice(0, 4).map((board) => (
                      <Link key={`recent-${board.id}`} to={`/b/${board.id}`} className="block group">
                        <div className="bg-white rounded-xl border border-border overflow-hidden hover:shadow-md hover:border-primary transition-all">
                          <div className={`h-24 ${getRandomColor(board.id)} flex items-center justify-center`}>
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
              )}

              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-gray-500" /> Your Workspaces
                </h2>
                
                {filteredWorkspaces.map((ws) => {
                  const boards = (workspaceBoards[ws.id] || []).filter(b => 
                    !searchQuery || b.title.toLowerCase().includes(searchQuery.toLowerCase())
                  );
                  return (
                    <div key={ws.id} className="bg-white rounded-xl border border-border shadow-sm overflow-hidden mb-6">
                      <div className="px-6 py-4 border-b border-border bg-gray-50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-gray-700">{ws.name}</h3>
                          <span className="text-sm text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200">Workspace</span>
                        </div>
                        <Button 
                          variant="secondary" 
                          className="flex items-center gap-1.5 text-xs py-1 px-3"
                          onClick={() => setSelectedInviteWs(ws)}
                        >
                          <UserPlus className="w-3.5 h-3.5" /> Invite
                        </Button>
                      </div>
                      
                      {boards.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 border-t border-border">
                          {boards.map((board, index) => (
                            <Link 
                              key={board.id} 
                              to={`/b/${board.id}`}
                              className={`block p-6 hover:bg-gray-50 transition-colors ${
                                index % 3 !== 2 ? 'border-r border-border' : ''
                              } ${index < boards.length - 3 ? 'border-b border-border' : ''}`}
                            >
                              <div className="flex items-start justify-between mb-4">
                                <div className={`w-10 h-10 rounded-lg ${getRandomColor(board.id)} flex items-center justify-center text-white`}>
                                  <span className="font-bold">{getInitials(board.title)}</span>
                                </div>
                              </div>
                              <h4 className="font-semibold text-gray-900 mb-1">{board.title}</h4>
                              <p className="text-sm text-gray-500 mb-4">Updated recently</p>
                              
                              <div className="flex -space-x-2">
                                <Avatar user={{ name: user?.name || "User", avatarUrl: user?.avatarUrl || `https://i.pravatar.cc/150?u=${user?.id || 1}` }} size="sm" className="ring-2 ring-white" />
                              </div>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <div className="p-6 text-center text-gray-500 flex justify-between items-center">
                          <span>No boards in this workspace yet.</span>
                          <Link to="/b/create">
                            <Button variant="secondary" className="text-xs py-1">Create Board</Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  );
                })}

                {workspaces.length === 0 && !searchQuery && (
                  <div className="p-12 text-center border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center">
                    <p className="text-text-secondary mb-4">You don't have any workspaces yet.</p>
                    <Button variant="primary" onClick={() => setIsCreateWsOpen(true)}>
                      Create Workspace
                    </Button>
                  </div>
                )}
                
                {filteredWorkspaces.length === 0 && searchQuery && (
                  <div className="p-12 text-center text-gray-500">
                    No results found for "{searchQuery}".
                  </div>
                )}
              </div>
            </>
          )}

        </div>
      </main>

      {/* Invite Member Modal */}
      {selectedInviteWs && (
        <InviteMemberModal 
          isOpen={!!selectedInviteWs}
          onClose={() => setSelectedInviteWs(null)}
          workspaceId={selectedInviteWs.id}
          workspaceName={selectedInviteWs.name}
        />
      )}
      
      {/* Create Workspace Modal */}
      <CreateWorkspaceModal 
        isOpen={isCreateWsOpen}
        onClose={() => setIsCreateWsOpen(false)}
        onWorkspaceCreated={(newWs) => {
          setWorkspaces([...workspaces, newWs]);
          setWorkspaceBoards({ ...workspaceBoards, [newWs.id]: [] });
        }}
      />
    </div>
  );
};

export default DashboardView;
