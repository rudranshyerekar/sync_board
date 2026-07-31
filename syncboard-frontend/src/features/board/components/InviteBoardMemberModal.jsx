import React, { useState, useEffect } from 'react';
import { X, Lock, Plus, UserMinus } from 'lucide-react';
import { Button } from '../../../components/Button';
import { workspaceApi } from '../../../api/workspaceApi';
import { boardApi } from '../../../api/boardApi';
import { Avatar } from '../../../components/Avatar';

export const InviteBoardMemberModal = ({ isOpen, onClose, boardId, workspaceId }) => {
  const [workspaceMembers, setWorkspaceMembers] = useState([]);
  const [boardMembers, setBoardMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const [wsMembers, bMembers] = await Promise.all([
        workspaceApi.getMembers(workspaceId).then(res => res.map(m => m.user)),
        boardApi.getMembers(boardId)
      ]);
      setWorkspaceMembers(wsMembers);
      setBoardMembers(bMembers);
    } catch (err) {
      setError('Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMembers();
    }
  }, [isOpen, boardId, workspaceId]);

  if (!isOpen) return null;

  const handleAddMember = async (userId) => {
    try {
      await boardApi.addMember(boardId, userId);
      await fetchMembers();
    } catch (err) {
      setError('Failed to add member to board');
    }
  };

  const handleRemoveMember = async (userId) => {
    try {
      await boardApi.removeMember(boardId, userId);
      await fetchMembers();
    } catch (err) {
      setError('Failed to remove member from board');
    }
  };

  const boardMemberIds = boardMembers.map(m => m.id);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-border relative">
        <button 
          onClick={onClose} 
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 p-1 rounded-md"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Manage Board Access</h3>
            <p className="text-xs text-gray-500">Private boards require explicit invites.</p>
          </div>
        </div>

        {error && (
          <div className="text-red-500 text-xs font-medium bg-red-50 p-2.5 rounded border border-red-100 mb-4">
            {error}
          </div>
        )}

        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
          {loading ? (
            <div className="text-center py-4 text-gray-500 text-sm">Loading members...</div>
          ) : workspaceMembers.length === 0 ? (
            <div className="text-center py-4 text-gray-500 text-sm">No workspace members found.</div>
          ) : (
            workspaceMembers.map(member => {
              const isBoardMember = boardMemberIds.includes(member.id);
              return (
                <div key={member.id} className="flex items-center justify-between p-2 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Avatar user={member} size="sm" />
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-900">{member.name}</span>
                      <span className="text-xs text-gray-500">{member.email}</span>
                    </div>
                  </div>
                  <div>
                    {isBoardMember ? (
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                        title="Remove Access"
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAddMember(member.id)}
                        className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded border border-indigo-200 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="pt-4 mt-4 border-t border-gray-100 flex justify-end">
          <Button variant="secondary" onClick={onClose}>Done</Button>
        </div>
      </div>
    </div>
  );
};
