import React, { useState, useEffect } from 'react';
import { X, FileText, User, Flag, Calendar, Hash, Info, Settings } from 'lucide-react';
import { Button } from '../../../components/Button';
import { useBoardStore } from '../state/useBoardStore';
import { workspaceApi } from '../../../api/workspaceApi';

export const CreateCardModal = ({ isOpen, onClose, column }) => {
  const { createCard, board } = useBoardStore();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [deadline, setDeadline] = useState('');
  const [position, setPosition] = useState('');
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    if (board?.workspaceId) {
      workspaceApi.getMembers(board.workspaceId).then(setMembers).catch(console.error);
    }
  }, [board?.workspaceId]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        priority,
      };
      if (deadline) {
        payload.deadline = new Date(deadline).toISOString();
      }
      if (assigneeId) {
        payload.assigneeId = Number(assigneeId);
      }
      if (position) {
        payload.position = Number(position);
      }
      await createCard(column.id, payload);
      setTitle('');
      setDescription('');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[60]" onClick={onClose} />
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl pointer-events-auto flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="flex items-start justify-between p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Create New Card</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Add a new task to <span className="font-medium text-indigo-600">"{column.title}"</span>
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
            <form id="create-card-form" onSubmit={handleSubmit} className="space-y-6">
              
              {/* Title */}
              <div>
                <div className="flex justify-between mb-1.5">
                  <label className="block text-sm font-semibold text-gray-900">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <span className="text-xs text-gray-400">{title.length} / 100</span>
                </div>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Design login page for MVP"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm"
                  autoFocus
                />
              </div>

              {/* Description */}
              <div>
                <div className="flex justify-between mb-1.5">
                  <label className="block text-sm font-semibold text-gray-900">
                    Description
                  </label>
                  <span className="text-xs text-gray-400">{description.length} / 1000</span>
                </div>
                <textarea
                  maxLength={1000}
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add details, context, or notes about this task..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm resize-none"
                />
              </div>

              {/* Grid Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Assignee */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                    Assignee
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="w-4 h-4 text-gray-400" />
                    </div>
                    <select
                      value={assigneeId}
                      onChange={(e) => setAssigneeId(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm appearance-none bg-white"
                    >
                      <option value="">Select assignee</option>
                      {members.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.email})
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                    Priority
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Flag className="w-4 h-4 text-orange-400" />
                    </div>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm appearance-none bg-white"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Deadline */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                    Deadline
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="w-4 h-4 text-gray-400" />
                    </div>
                    <input
                      type="datetime-local"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg pl-10 pr-8 py-2.5 text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm bg-white"
                    />
                    {deadline && (
                      <button type="button" onClick={() => setDeadline('')} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Position */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                    Position (Order)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="Auto (leave blank for last)"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 pr-10 py-2.5 text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                      <Hash className="w-4 h-4" />
                    </div>
                  </div>
                </div>

              </div>

              {/* Info Box */}
              <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 flex items-start gap-3 mt-6">
                <Info className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-indigo-800">
                  Cards are ordered within a list. You can change the position later by drag & drop.
                </p>
              </div>

            </form>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-100 flex items-center justify-between bg-gray-50 rounded-b-xl">
            <button type="button" className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors">
              <Settings className="w-4 h-4" />
              More options
              <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            <div className="flex items-center gap-3">
              <Button type="button" variant="secondary" onClick={onClose} className="px-6 py-2.5 bg-white">
                Cancel
              </Button>
              <Button type="submit" form="create-card-form" variant="primary" disabled={loading || !title.trim()} className="px-6 py-2.5 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition-colors">
                {loading ? 'Creating...' : 'Create Card'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
