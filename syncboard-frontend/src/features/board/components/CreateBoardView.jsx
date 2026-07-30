import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, Check, Lock, Users, Code, Megaphone, Rocket, PenTool, Calendar, Plus, MoreHorizontal, Edit3, HelpCircle, X, MoreVertical } from 'lucide-react';
import { Button } from '../../../components/Button';
import { Avatar } from '../../../components/Avatar';
import { workspaceApi } from '../../../api/workspaceApi';
import { boardApi } from '../../../api/boardApi';
import { useAuthStore } from '../../auth/state/useAuthStore';
import { NotificationBell } from '../../notifications/components/NotificationBell';
import { useWorkspaceStore } from '../../workspace/state/useWorkspaceStore';

const CreateBoardView = () => {
  const navigate = useNavigate();
  const [boardName, setBoardName] = useState("Product Launch Plan");
  const [description, setDescription] = useState("Plan and track tasks for the upcoming product launch.");
  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState('launch');
  const [isAddingCustomColumn, setIsAddingCustomColumn] = useState(false);
  const [customColumnName, setCustomColumnName] = useState('');
  const [customColumnColor, setCustomColumnColor] = useState('gray');
  const { fetchData } = useWorkspaceStore();

  const templates = [
    { id: 'software', icon: Code, color: 'text-indigo-600 bg-indigo-50 border-indigo-200', title: 'Software Development', desc: 'Perfect for agile development teams', boardName: 'Sprint Board', defaultDesc: 'Track sprint tasks and bugs.', initialColumns: ['Backlog', 'To Do', 'In Progress', 'Code Review', 'QA', 'Done'] },
    { id: 'marketing', icon: Megaphone, color: 'text-pink-600 bg-pink-50 border-pink-200', title: 'Marketing Campaign', desc: 'Plan and execute marketing campaigns', boardName: 'Marketing Campaign', defaultDesc: 'Plan and execute upcoming marketing campaigns.', initialColumns: ['Ideation', 'Drafting', 'Review', 'Scheduled', 'Published'] },
    { id: 'launch', icon: Rocket, color: 'text-purple-600 bg-purple-100 border-purple-200', title: 'Product Launch', desc: 'Launch new products successfully', boardName: 'Product Launch Plan', defaultDesc: 'Plan and track tasks for the upcoming product launch.', initialColumns: ['Planning', 'In Progress', 'Blocked', 'Ready for Launch', 'Launched'] },
    { id: 'content', icon: PenTool, color: 'text-green-600 bg-green-50 border-green-200', title: 'Content Creation', desc: 'Manage content production workflow', boardName: 'Content Calendar', defaultDesc: 'Manage content production and review workflows.', initialColumns: ['Ideas', 'Writing', 'Editing', 'Approved', 'Published'] },
    { id: 'event', icon: Calendar, color: 'text-orange-600 bg-orange-50 border-orange-200', title: 'Event Planning', desc: 'Plan and organize events', boardName: 'Event Planning', defaultDesc: 'Plan and organize tasks for the upcoming event.', initialColumns: ['Logistics', 'Marketing', 'Speakers', 'Catering', 'Done'] },
  ];

  const [privacy, setPrivacy] = useState('WORKSPACE');
  const [workspaceMembers, setWorkspaceMembers] = useState([]);
  const [inviteeIds, setInviteeIds] = useState([]);
  const [initialColumns, setInitialColumns] = useState(templates.find(t => t.id === 'launch').initialColumns.map((title, i) => ({
    title,
    color: ['gray', 'yellow', 'blue', 'green', 'purple', 'pink', 'orange'][i % 7]
  })));
  const currentUser = useAuthStore(state => state.user);

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const ws = await workspaceApi.getMyWorkspaces();
        setWorkspaces(ws);
        if (ws.length > 0 && !selectedWorkspaceId) {
          setSelectedWorkspaceId(ws[0].id.toString());
        }
      } catch (err) {
        console.error("Failed to fetch workspaces:", err);
      }
    };
    fetchWorkspaces();
  }, [selectedWorkspaceId]);

  useEffect(() => {
    if (selectedWorkspaceId) {
      workspaceApi.getMembers(selectedWorkspaceId)
        .then(members => setWorkspaceMembers(members))
        .catch(console.error);
    }
  }, [selectedWorkspaceId]);

  const handleCreateBoard = async () => {
    if (!boardName.trim()) {
      alert("Please enter a board name");
      return;
    }
    if (!selectedWorkspaceId) {
      alert("Please select a workspace");
      return;
    }

    setLoading(true);
    try {
      const newBoard = await boardApi.createBoard(selectedWorkspaceId, {
        title: boardName.trim(),
        description: description.trim(),
        privacy,
        initialColumns,
        inviteeIds: privacy === 'PRIVATE' ? inviteeIds : [],
        position: 1000
      });
      await fetchData(true);
      navigate(`/b/${newBoard.id}`);
    } catch (e) {
      console.error("Failed to create board:", e);
      alert(e.response?.data?.message || "Failed to create board");
    } finally {
      setLoading(false);
    }
  };

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
          <NotificationBell />
          <button className="text-gray-500 hover:text-gray-700 ml-1">
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Form Area */}
      <main className="flex-1 overflow-y-auto p-8 relative">
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
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Target Workspace</h2>
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Workspace <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedWorkspaceId}
                    onChange={(e) => setSelectedWorkspaceId(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-gray-900 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm bg-white"
                  >
                    {workspaces.map(ws => (
                      <option key={ws.id} value={ws.id}>{ws.name}</option>
                    ))}
                  </select>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Board Details</h2>

                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Board Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={boardName}
                      onChange={(e) => setBoardName(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-gray-900 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <div className="relative">
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-gray-900 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm resize-none"
                    />
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Privacy</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div
                    className={`border rounded-lg p-4 flex gap-3 cursor-pointer transition-colors ${privacy === 'PRIVATE' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-gray-200 hover:border-gray-300'}`}
                    onClick={() => setPrivacy('PRIVATE')}
                  >
                    <input type="radio" name="privacy" checked={privacy === 'PRIVATE'} readOnly className="mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Lock className="w-4 h-4" /> Private
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">Only invited members can access this board</p>
                    </div>
                  </div>
                  <div
                    className={`border rounded-lg p-4 flex gap-3 cursor-pointer transition-colors ${privacy === 'WORKSPACE' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-gray-200 hover:border-gray-300'}`}
                    onClick={() => { setPrivacy('WORKSPACE'); setInviteeIds([]); }}
                  >
                    <input type="radio" name="privacy" checked={privacy === 'WORKSPACE'} readOnly className="mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Users className="w-4 h-4" /> Workspace <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-bold">PRO</span>
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">All workspace members can access this board</p>
                    </div>
                  </div>
                </div>
              </section>

              {privacy === 'PRIVATE' && (
                <section>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Invite Members</h2>
                  <div className="border border-gray-300 rounded-md p-3 flex flex-col gap-3">
                    <div className="flex flex-wrap gap-2">
                      {inviteeIds.map(id => {
                        const member = workspaceMembers.find(m => m.id === id);
                        if (!member) return null;
                        return (
                          <div key={id} className="flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded-md border border-gray-200">
                            <Avatar user={member} size="sm" className="w-5 h-5" />
                            <span className="text-sm font-medium text-gray-700">{member.name}</span>
                            <X
                              className="w-3.5 h-3.5 text-gray-400 cursor-pointer hover:text-red-500"
                              onClick={() => setInviteeIds(prev => prev.filter(i => i !== id))}
                            />
                          </div>
                        );
                      })}
                      {inviteeIds.length === 0 && <span className="text-sm text-gray-400 italic">No members invited yet.</span>}
                    </div>

                    <div className="border-t border-gray-200 pt-3 mt-1">
                      <p className="text-xs font-semibold text-gray-500 mb-2 uppercase">Available Workspace Members</p>
                      <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                        {workspaceMembers.filter(m => m.id !== currentUser?.id && !inviteeIds.includes(m.id)).map(m => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setInviteeIds(prev => [...prev, m.id])}
                            className="flex items-center gap-1.5 px-2 py-1 text-xs border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                          >
                            <Plus className="w-3 h-3 text-gray-400" />
                            {m.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              )}

              <section>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Board Columns</h2>
                    <p className="text-sm text-gray-500 mt-1">Choose a template or customize your columns.</p>
                  </div>
                </div>

                <div
                  className="flex gap-3 overflow-x-auto pb-4 max-w-[700px] snap-x"
                  style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#cbd5e1 transparent'
                  }}
                >
                  {initialColumns.map((col, idx) => {
                    const colorMap = {
                      gray: "bg-gray-50 border-gray-200 border-t-gray-400",
                      yellow: "bg-[#fffdf0] border-yellow-100 border-t-yellow-400",
                      blue: "bg-blue-50 border-blue-100 border-t-blue-500",
                      green: "bg-[#f3fbf5] border-green-100 border-t-green-500",
                      purple: "bg-purple-50 border-purple-100 border-t-purple-400",
                      pink: "bg-pink-50 border-pink-100 border-t-pink-400",
                      orange: "bg-orange-50 border-orange-100 border-t-orange-500",
                      teal: "bg-teal-50 border-teal-100 border-t-teal-400"
                    };
                    const colorClass = colorMap[col.color] || colorMap.gray;
                    return (
                      <div key={idx} className={`w-48 flex-shrink-0 h-32 rounded-lg border p-4 flex flex-col justify-between border-t-4 shadow-sm relative group snap-start ${colorClass}`}>
                        <div className="flex justify-between items-start">
                          <span className="font-semibold text-gray-900 text-[14px] line-clamp-2">{col.title}</span>
                          <X
                            className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 cursor-pointer hover:text-red-500 transition-opacity"
                            onClick={() => setInitialColumns(prev => prev.filter((_, i) => i !== idx))}
                          />
                        </div>
                      </div>
                    );
                  })}

                  {isAddingCustomColumn ? (
                    <div className="w-48 flex-shrink-0 h-32 rounded-lg border-2 border-primary bg-primary/5 p-3 flex flex-col justify-between gap-1 snap-start">
                      <input
                        type="text"
                        value={customColumnName}
                        onChange={(e) => setCustomColumnName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            if (customColumnName.trim()) {
                              setInitialColumns(prev => [...prev, { title: customColumnName.trim(), color: customColumnColor }]);
                              setCustomColumnName('');
                              setIsAddingCustomColumn(false);
                            }
                          } else if (e.key === 'Escape') {
                            setCustomColumnName('');
                            setIsAddingCustomColumn(false);
                          }
                        }}
                        autoFocus
                        placeholder="Column name"
                        className="w-full text-sm p-1.5 border border-gray-300 rounded focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white"
                      />
                      <div className="flex gap-1 overflow-x-auto py-1">
                        {['gray', 'blue', 'yellow', 'purple', 'green', 'pink', 'orange', 'teal'].map(c => {
                          const bgColors = {
                            gray: 'bg-gray-400', blue: 'bg-blue-500', yellow: 'bg-yellow-400',
                            purple: 'bg-purple-500', green: 'bg-green-500', pink: 'bg-pink-500',
                            orange: 'bg-orange-500', teal: 'bg-teal-400'
                          };
                          return (
                            <div 
                              key={c}
                              onClick={() => setCustomColumnColor(c)}
                              className={`w-4 h-4 rounded-full cursor-pointer flex-shrink-0 ${bgColors[c]} ${customColumnColor === c ? 'ring-2 ring-offset-1 ring-primary' : ''}`}
                            />
                          );
                        })}
                      </div>
                      <div className="flex justify-end gap-1 mt-1">
                        <button 
                          onClick={() => { setCustomColumnName(''); setIsAddingCustomColumn(false); }}
                          className="p-1.5 hover:bg-white rounded border border-transparent hover:border-gray-200 text-gray-500 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => {
                            if (customColumnName.trim()) {
                              setInitialColumns(prev => [...prev, { title: customColumnName.trim(), color: customColumnColor }]);
                              setCustomColumnName('');
                              setIsAddingCustomColumn(false);
                            }
                          }}
                          className="p-1.5 bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded text-primary transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="w-48 flex-shrink-0 h-32 rounded-lg bg-transparent border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:border-gray-400 cursor-pointer transition-colors snap-start"
                      onClick={() => setIsAddingCustomColumn(true)}
                    >
                      <div className="flex items-center gap-1.5 font-medium text-[14px]">
                        <Plus className="w-4 h-4" /> Add Column
                      </div>
                    </div>
                  )}
                </div>
              </section>

              <div className="pt-6 border-t border-gray-200 flex items-center justify-between">
                <Link to="/dashboard">
                  <Button variant="secondary" className="px-6">Cancel</Button>
                </Link>
                <Button
                  variant="primary"
                  className="px-8 flex items-center gap-2"
                  onClick={handleCreateBoard}
                  disabled={loading}
                >
                  <span className="text-lg leading-none">+</span> {loading ? 'Creating...' : 'Create Board'}
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
              {templates.map((tpl) => (
                <div
                  key={tpl.id}
                  onClick={() => {
                    setSelectedTemplateId(tpl.id);
                    setBoardName(tpl.boardName);
                    setDescription(tpl.defaultDesc);
                    setInitialColumns(tpl.initialColumns.map((title, i) => ({
                      title,
                      color: ['gray', 'yellow', 'blue', 'green', 'purple', 'pink', 'orange'][i % 7]
                    })));
                  }}
                  className={`border rounded-xl p-4 cursor-pointer transition-all ${selectedTemplateId === tpl.id ? 'border-indigo-600 ring-1 ring-indigo-600 bg-indigo-50/50' : 'border-border hover:border-indigo-300 hover:shadow-sm bg-white'}`}
                >
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 border ${tpl.color}`}>
                    <tpl.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 relative">
                    <h4 className={`font-semibold text-sm ${selectedTemplateId === tpl.id ? 'text-primary' : 'text-gray-900'}`}>{tpl.title}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{tpl.desc}</p>
                    {selectedTemplateId === tpl.id && (
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

        {/* Floating Bottom Status Bar */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white border border-gray-200 shadow-lg rounded-full flex items-center justify-between px-6 py-2.5 text-xs text-gray-600 font-medium z-20 w-[600px] max-w-full">
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
