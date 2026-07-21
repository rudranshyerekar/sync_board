import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, Check, Lock, Users, Code, Megaphone, Rocket, PenTool, Calendar, Plus, MoreHorizontal, Edit3 } from 'lucide-react';
import { Button } from '../../../components/Button';
import { Avatar } from '../../../components/Avatar';
import { workspaceApi } from '../../../api/workspaceApi';
import { boardApi } from '../../../api/boardApi';

const CreateBoardView = () => {
  const navigate = useNavigate();
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50">
      
      {/* Top Header */}
      <header className="h-16 border-b border-border bg-white flex items-center justify-between px-8 flex-shrink-0">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">Boards</span>
          <span className="text-gray-400">/</span>
          <span className="font-semibold text-gray-900">New Board</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search boards, cards, members..." 
              className="pl-9 pr-12 py-1.5 border border-gray-300 rounded-md text-sm w-72 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 border border-gray-200 rounded px-1">⌘K</span>
          </div>
          <button className="text-gray-500 hover:text-gray-700 relative">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
        </div>
      </header>

      {/* Main Form Area */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
          
          {/* Left Column: Form */}
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center border border-indigo-200">
                <LayoutIcon className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Create New Board</h1>
                <p className="text-gray-500">Set up a new board and invite your team to start collaborating.</p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl border border-border shadow-sm space-y-8">
              
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Board Details</h2>
                
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Board Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input 
                      id="boardName"
                      type="text" 
                      defaultValue="Product Launch Plan"
                      className="w-full border-2 border-primary rounded-md px-4 py-2.5 text-gray-900 focus:outline-none shadow-sm"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">18 / 60</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <div className="relative">
                    <textarea 
                      rows={3}
                      defaultValue="Plan and track tasks for the upcoming product launch."
                      className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-gray-900 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm resize-none"
                    />
                    <span className="absolute right-4 bottom-3 text-sm text-gray-400">50 / 500</span>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Privacy</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="border border-gray-200 rounded-lg p-4 flex gap-3 cursor-pointer hover:border-gray-300">
                    <input type="radio" name="privacy" className="mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Lock className="w-4 h-4" /> Private
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">Only invited members can access this board</p>
                    </div>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4 flex gap-3 cursor-pointer hover:border-gray-300">
                    <input type="radio" name="privacy" className="mt-1" defaultChecked />
                    <div>
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Users className="w-4 h-4" /> Workspace <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-bold">PRO</span>
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">All workspace members can access this board</p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex justify-between items-center">
                  <span>Invite Members <span className="text-gray-400 font-normal text-sm">(optional)</span></span>
                </h2>
                
                <div className="border border-gray-300 rounded-md p-1.5 flex flex-wrap items-center gap-2 bg-white">
                  <div className="flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded-md border border-gray-200">
                    <Avatar user={{ name: "Rohit Sharma", avatarUrl: "https://i.pravatar.cc/150?u=rohit" }} size="sm" className="w-5 h-5" />
                    <span className="text-sm font-medium text-gray-700">Rohit Sharma</span>
                    <button className="text-gray-400 hover:text-gray-600">×</button>
                  </div>
                  <div className="flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded-md border border-gray-200">
                    <Avatar user={{ name: "Sneha Patil", avatarUrl: "https://i.pravatar.cc/150?u=sneha" }} size="sm" className="w-5 h-5" />
                    <span className="text-sm font-medium text-gray-700">Sneha Patil</span>
                    <button className="text-gray-400 hover:text-gray-600">×</button>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Search members by name or email..." 
                    className="flex-1 min-w-[200px] border-none focus:outline-none focus:ring-0 text-sm p-1.5"
                  />
                </div>
              </section>

              <section>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Board Columns</h2>
                    <p className="text-sm text-gray-500 mt-1">Choose a template or customize your columns.</p>
                  </div>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary border border-primary/30 bg-primary/5 rounded-md hover:bg-primary/10 transition-colors">
                    <Edit3 className="w-4 h-4" /> Customize Columns
                  </button>
                </div>
                
                <div className="flex gap-3 overflow-x-auto pb-2">
                  <div className="w-36 flex-shrink-0 h-28 rounded-lg bg-gray-50 border border-gray-200 p-4 flex flex-col justify-between border-t-4 border-t-gray-400 shadow-sm relative">
                    <span className="font-semibold text-gray-900 text-[15px]">To Do</span>
                    <MoreHorizontal className="w-5 h-5 text-gray-400 absolute right-3 top-3" />
                  </div>
                  <div className="w-36 flex-shrink-0 h-28 rounded-lg bg-[#fffdf0] border border-yellow-100 p-4 flex flex-col justify-between border-t-4 border-t-yellow-400 shadow-sm relative">
                    <span className="font-semibold text-gray-900 text-[15px]">In Progress</span>
                    <MoreHorizontal className="w-5 h-5 text-gray-400 absolute right-3 top-3" />
                  </div>
                  <div className="w-36 flex-shrink-0 h-28 rounded-lg bg-[#f4f7ff] border border-blue-100 p-4 flex flex-col justify-between border-t-4 border-t-blue-500 shadow-sm relative">
                    <span className="font-semibold text-gray-900 text-[15px]">Review</span>
                    <MoreHorizontal className="w-5 h-5 text-gray-400 absolute right-3 top-3" />
                  </div>
                  <div className="w-36 flex-shrink-0 h-28 rounded-lg bg-[#f3fbf5] border border-green-100 p-4 flex flex-col justify-between border-t-4 border-t-green-500 shadow-sm relative">
                    <span className="font-semibold text-gray-900 text-[15px]">Done</span>
                    <MoreHorizontal className="w-5 h-5 text-gray-400 absolute right-3 top-3" />
                  </div>
                  <button className="w-36 flex-shrink-0 h-28 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-colors">
                    <span className="text-sm font-medium flex items-center gap-1"><Plus className="w-4 h-4" /> Add Column</span>
                  </button>
                </div>
              </section>

              <div className="pt-6 border-t border-gray-200 flex items-center justify-between">
                <Link to="/dashboard">
                  <Button variant="secondary" className="px-6">Cancel</Button>
                </Link>
                <Button 
                  variant="primary" 
                  className="px-8 flex items-center gap-2" 
                  onClick={async () => {
                    // Try to create the board
                    try {
                      // Get workspace
                      const wss = await workspaceApi.getMyWorkspaces();
                      if (wss.length > 0) {
                        const newBoard = await boardApi.createBoard(wss[0].id, { title: document.getElementById('boardName').value || 'New Board', position: 1000 });
                        navigate(`/b/${newBoard.id}`);
                      } else {
                        alert("No workspace found. Please create a workspace first.");
                      }
                    } catch (e) {
                      console.error(e);
                      alert("Failed to create board");
                    }
                  }}
                >
                  <span className="text-lg leading-none">+</span> Create Board
                </Button>
              </div>

            </div>
          </div>

          {/* Right Column: Templates */}
          <div className="w-full lg:w-[380px] space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">Choose a Template</h3>
              <button className="text-sm text-primary font-medium hover:underline">View all</button>
            </div>

            <div className="space-y-3">
              {[
                { icon: Code, color: 'text-indigo-600 bg-indigo-50', title: 'Software Development', desc: 'Perfect for agile development teams' },
                { icon: Megaphone, color: 'text-pink-600 bg-pink-50', title: 'Marketing Campaign', desc: 'Plan and execute marketing campaigns' },
                { icon: Rocket, color: 'text-purple-600 bg-purple-100 border-purple-200', title: 'Product Launch', desc: 'Launch new products successfully', selected: true },
                { icon: PenTool, color: 'text-green-600 bg-green-50', title: 'Content Creation', desc: 'Manage content production workflow' },
                { icon: Calendar, color: 'text-orange-600 bg-orange-50', title: 'Event Planning', desc: 'Plan and organize events' },
              ].map((tpl, i) => (
                <div key={i} className={`p-4 rounded-xl border flex gap-4 cursor-pointer transition-all ${tpl.selected ? 'border-primary shadow-sm bg-white ring-1 ring-primary' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 border ${tpl.color}`}>
                    <tpl.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 relative">
                    <h4 className={`font-semibold text-sm ${tpl.selected ? 'text-primary' : 'text-gray-900'}`}>{tpl.title}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{tpl.desc}</p>
                    {tpl.selected && (
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-orange-50 rounded-xl p-5 border border-orange-100 mt-8">
              <h4 className="font-semibold text-orange-800 flex items-center gap-2 mb-3">
                💡 Tips for a great start
              </h4>
              <ul className="space-y-2 text-sm text-orange-800/80">
                <li className="flex gap-2">✓ <span>Give your board a clear, descriptive name</span></li>
                <li className="flex gap-2">✓ <span>Add a description to align your team</span></li>
                <li className="flex gap-2">✓ <span>Choose a template to get started faster</span></li>
                <li className="flex gap-2">✓ <span>You can always change these later</span></li>
              </ul>
            </div>
          </div>
        </div>
    </main>
      
      {/* Bottom Status Bar */}
      <footer className="h-12 bg-white border-t border-border flex items-center justify-between px-6 text-xs text-gray-500 font-medium">
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
            <span>Live updates: On</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Simple Layout Icon for the header
const LayoutIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="9" y1="3" x2="9" y2="21"></line>
  </svg>
);

export default CreateBoardView;
