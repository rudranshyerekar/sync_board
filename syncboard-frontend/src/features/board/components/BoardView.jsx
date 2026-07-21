import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Search, Bell, Settings, LayoutDashboard, Filter, MoreHorizontal, UserPlus, Star } from 'lucide-react';
import { useBoardStore } from '../state/useBoardStore';
import { Column } from './Column';
import { Button } from '../../../components/Button';
import { Avatar } from '../../../components/Avatar';
import { CardDrawer } from '../../cardDetail/components/CardDrawer';

const BoardView = () => {
  const { boardId } = useParams();
  const { board, isLoading, fetchBoard, initRealTimeSync, disconnectRealTimeSync, activeUsers, createColumn } = useBoardStore();

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
    return <div className="h-full bg-bg-primary flex items-center justify-center text-text-secondary">Loading Board...</div>;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Top Header */}
        <header className="h-16 border-b border-border bg-white flex items-center justify-between px-6 flex-shrink-0">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">Boards</span>
              <span className="text-gray-400">/</span>
              <span className="font-semibold text-gray-900">{board.title}</span>
              <Star className="w-4 h-4 text-gray-400 ml-1 cursor-pointer hover:text-yellow-400" />
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search cards, members..." 
                  className="pl-9 pr-4 py-1.5 border border-gray-300 rounded-md text-sm w-64 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <button className="text-gray-500 hover:text-gray-700 relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              <button className="text-gray-500 hover:text-gray-700">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </header>

          {/* Sub Header (Board Toolbar) */}
          <div className="h-14 border-b border-border bg-white flex items-center justify-between px-6 flex-shrink-0">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-100 text-primary rounded flex items-center justify-center">
                  <LayoutDashboard className="w-3.5 h-3.5" />
                </div>
                {board.title}
                <Star className="w-5 h-5 text-gray-400 ml-1 cursor-pointer hover:text-yellow-400" />
              </h2>
              
              <div className="h-6 w-px bg-gray-300 mx-2"></div>
              
              <div className="flex -space-x-2">
                {activeUsers.map(user => (
                  <div key={user.id} className="relative z-10">
                    <Avatar user={user} size="sm" className="ring-2 ring-white" />
                    {/* Presence Dot */}
                    <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white
                      ${user.status === 'online' ? 'bg-success' : 'bg-warning'}
                    `}></div>
                  </div>
                ))}
              </div>
              <span className="text-sm text-gray-500 font-medium ml-2">{activeUsers.length} members</span>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="secondary" className="flex items-center gap-2 py-1.5 text-sm">
                <UserPlus className="w-4 h-4" /> Invite
              </Button>
              <Button variant="secondary" className="flex items-center gap-2 py-1.5 text-sm text-gray-700 border-gray-300 hover:bg-gray-50">
                <Filter className="w-4 h-4" /> Filter
              </Button>
              <Button variant="secondary" className="px-2 py-1.5 text-gray-700 border-gray-300 hover:bg-gray-50">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Board Canvas */}
          <main className="flex-1 overflow-x-auto overflow-y-hidden p-6 bg-gray-50">
            <div className="flex gap-6 h-full items-start">
              {board.columns.map(column => (
                <Column key={column.id} column={column} />
              ))}
              <button 
                onClick={() => {
                  const title = prompt("Enter new column title:");
                  if (title && title.trim() !== "") {
                    createColumn(board.id, title.trim());
                  }
                }}
                className="w-80 flex-shrink-0 bg-gray-200/50 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-colors border border-dashed border-gray-300 h-[60px]"
              >
                + Add Column
              </button>
            </div>
          </main>
        {/* Detail Drawer (renders conditionally internally based on state) */}
        <CardDrawer />
        
        {/* Bottom Status Bar */}
        <footer className="h-12 bg-white border-t border-border flex items-center justify-between px-6 text-xs text-gray-500 font-medium flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span>All changes saved</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
              <span>Connected <span className="text-gray-400 px-1">•</span> 42ms</span>
            </div>
            <div className="flex items-center gap-2 text-primary font-semibold">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              <span>Live updates On</span>
            </div>
          </div>
        </footer>
      </div>
    </DndProvider>
  );
};

export default BoardView;
