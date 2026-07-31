import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Search, Bell, Settings, LayoutDashboard, Filter, MoreVertical, UserPlus, Star, Grid, ArrowRight, MessageSquare, Calendar as CalendarIcon, Edit3, Lock } from 'lucide-react';
import { useBoardStore } from '../state/useBoardStore';
import { useAuthStore } from '../../auth/state/useAuthStore';
import { Column } from './Column';
import { InviteMemberModal } from '../../workspace/components/InviteMemberModal';
import { InviteBoardMemberModal } from './InviteBoardMemberModal';
import { ActivityFeed } from '../../activity/components/ActivityFeed';
import { Button } from '../../../components/Button';
import { Avatar } from '../../../components/Avatar';
import { CardDrawer } from '../../cardDetail/components/CardDrawer';
import { CreateColumnModal } from './CreateColumnModal';
import { usePresenceHeartbeat } from '../hooks/usePresenceHeartbeat';
import { NotificationBell } from '../../notifications/components/NotificationBell';

const BoardView = () => {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const { board, isLoading, error, fetchBoard, initRealTimeSync, disconnectRealTimeSync, activeUsers, createColumn, updateBoard, searchQuery, setSearchQuery } = useBoardStore();
  const currentUser = useAuthStore(state => state.user);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const presenceStatus = usePresenceHeartbeat(boardId);

  useEffect(() => {
    if (boardId) {
      fetchBoard(boardId);
      initRealTimeSync(boardId);
    }
    return () => {
      disconnectRealTimeSync();
    };
  }, [boardId, fetchBoard, initRealTimeSync, disconnectRealTimeSync]);

  if (isLoading || !board) {
    if (error) {
      return (
        <div className="h-full bg-bg-primary flex flex-col items-center justify-center text-text-secondary">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Board Not Found</h2>
          <p className="mb-4 text-gray-500">{error}</p>
          <Button onClick={() => navigate('/dashboard')} variant="primary">
            Back to Dashboard
          </Button>
        </div>
      );
    }
    return <div className="h-full bg-bg-primary flex items-center justify-center text-text-secondary">Loading Board...</div>;
  }

  const handleTitleSubmit = () => {
    if (editTitle.trim() && editTitle.trim() !== board.title) {
      updateBoard(board.id, editTitle.trim());
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') handleTitleSubmit();
    if (e.key === 'Escape') setIsEditingTitle(false);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-gray-50">

        {/* Top Header */}
        <header className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-6 flex-shrink-0 z-50 relative">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Boards</span>
            <span className="text-gray-400">/</span>
            <span className="font-semibold text-gray-900">{board.title}</span>
            {board.privacy === 'PRIVATE' && <Lock className="w-3.5 h-3.5 text-gray-400 ml-1.5" />}
            <Star className="w-4 h-4 text-gray-400 ml-1 cursor-pointer hover:text-yellow-400" />
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search cards, members..."
                className="pl-9 pr-4 py-1.5 border border-gray-200 bg-gray-50 rounded-full text-sm w-64 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary focus:bg-white transition-colors"
              />
            </div>
            <NotificationBell />
            <button className="text-gray-500 hover:text-gray-700">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Sub Header (Board Toolbar) */}
        <div className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6 flex-shrink-0 z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded flex items-center justify-center">
                <Grid className="w-4 h-4" />
              </div>
              {isEditingTitle ? (
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={handleTitleSubmit}
                  onKeyDown={handleTitleKeyDown}
                  autoFocus
                  className="border border-blue-500 rounded px-1 outline-none font-bold"
                />
              ) : (
                <span
                  onDoubleClick={() => {
                    setEditTitle(board.title);
                    setIsEditingTitle(true);
                  }}
                  className="cursor-pointer hover:bg-gray-100 px-1 rounded rounded-sm flex items-center gap-1.5"
                  title="Double-click to rename"
                >
                  {board.title}
                  {board.privacy === 'PRIVATE' && <Lock className="w-5 h-5 text-gray-400" />}
                </span>
              )}
              <Star className="w-5 h-5 text-gray-300 hover:text-yellow-400 cursor-pointer ml-1" />
            </h2>

            <div className="h-6 w-px bg-gray-200 mx-1"></div>

            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {activeUsers.map(user => (
                  <div key={user.id} className="relative z-10">
                    <Avatar user={user} size="sm" className="ring-2 ring-white" />
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4 ml-1">
                <span className="text-sm text-gray-500 flex items-center gap-1.5"><UserPlus className="w-3.5 h-3.5" /> {activeUsers.length} members</span>
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${presenceStatus === 'online' ? 'bg-green-500' : presenceStatus === 'idle' ? 'bg-yellow-500' : 'bg-gray-400'}`}></div>
                  <span className={`text-sm font-medium ${presenceStatus === 'online' ? 'text-green-600' : presenceStatus === 'idle' ? 'text-yellow-600' : 'text-gray-500'}`}>
                    {presenceStatus === 'online' ? 'Live' : presenceStatus === 'idle' ? 'Idle' : 'Away'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-indigo-600 border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
            >
              <UserPlus className="w-4 h-4" /> Invite
            </button>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium border rounded-md transition-colors ${
                isSidebarOpen ? 'text-indigo-600 border-indigo-200 bg-indigo-50 hover:bg-indigo-100' : 'text-gray-700 border-gray-300 bg-white hover:bg-gray-50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" /> Sidebar
            </button>
          </div>
        </div>

        {/* Main Layout (Canvas + Sidebar) */}
        <div className="flex-1 flex overflow-hidden">
          {/* Board Canvas */}
          <main className="flex-1 overflow-x-auto overflow-y-hidden p-6 relative">
            <div className="flex gap-6 h-full items-start pb-20">
              {board.columns.map(column => (
                <Column key={column.id} column={column} />
              ))}
              <button
                onClick={() => setIsAddingColumn(true)}
                className="w-[320px] flex-shrink-0 bg-transparent border-2 border-dashed border-gray-300 hover:border-gray-400 text-gray-500 hover:text-gray-700 font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-colors h-[60px]"
              >
                + Add Column
              </button>
            </div>

            {/* Create Column Modal */}
            <CreateColumnModal
              isOpen={isAddingColumn}
              onClose={() => setIsAddingColumn(false)}
            />

            {/* Invite Member Modal */}
            {board.privacy === 'PRIVATE' ? (
              <InviteBoardMemberModal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                boardId={board.id}
                workspaceId={board.workspaceId}
              />
            ) : (
              <InviteMemberModal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                workspaceId={board.workspaceId}
                workspaceName="Workspace"
              />
            )}

            {/* Floating Bottom Status Bar */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white border border-gray-200 shadow-lg rounded-full flex items-center justify-between px-6 py-2.5 text-xs text-gray-600 font-medium z-20 w-[600px] max-w-full">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>All changes saved</span>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 20V10M12 20V4M6 20v-6" /></svg>
                  <span>Connected <span className="text-gray-300 mx-1">•</span> 42ms</span>
                </div>
                <div className="flex items-center gap-2 text-indigo-600 font-semibold">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
                  <span>Live updates On</span>
                </div>
              </div>
            </div>
          </main>

          {/* Right Sidebar */}
          {isSidebarOpen && (
            <aside className="w-72 bg-white border-l border-gray-200 flex-shrink-0 flex flex-col hidden xl:flex">
            <div className="p-5 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                Online ({activeUsers.length})
              </h3>
              <div className="space-y-4">
                {activeUsers.map(user => (
                  <div key={user.id} className="flex gap-3">
                    <div className="relative">
                      <Avatar user={user} size="sm" />
                      <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${user.status === 'online' ? 'bg-green-500' : user.status === 'idle' ? 'bg-yellow-500' : 'bg-gray-400'}`}></div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 leading-tight">
                        {user.name} {currentUser?.id === user.id && '(You)'}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 capitalize">{user.status === 'online' ? 'Viewing board' : user.status}</p>
                    </div>
                  </div>
                ))}
                {activeUsers.length === 0 && (
                  <p className="text-sm text-gray-500 italic">No one else is here.</p>
                )}
              </div>
            </div>

            <div className="p-5 flex-1 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900">Activity Feed</h3>
                <Link to="/activity" className="text-xs font-medium text-indigo-600 hover:underline">View all</Link>
              </div>

              <ActivityFeed />
            </div>
            </aside>
          )}
        </div>

        {/* Detail Drawer (renders conditionally internally based on state) */}
        <CardDrawer />
      </div>
    </DndProvider>
  );
};

export default BoardView;
