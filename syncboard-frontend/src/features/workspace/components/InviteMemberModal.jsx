import React, { useState } from 'react';
import { X, UserPlus } from 'lucide-react';
import { Button } from '../../../components/Button';
import { workspaceApi } from '../../../api/workspaceApi';

export const InviteMemberModal = ({ isOpen, onClose, workspaceId, workspaceName }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('MEMBER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await workspaceApi.inviteMember(workspaceId, { email, role });
      setSuccess(true);
      setEmail('');
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to invite member');
    } finally {
      setLoading(false);
    }
  };

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
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-primary flex items-center justify-center">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Invite Member</h3>
            <p className="text-xs text-gray-500">To {workspaceName || 'Workspace'}</p>
          </div>
        </div>

        {success ? (
          <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg text-center text-sm font-medium mb-4">
            ✓ Member invited successfully!
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input 
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@example.com"
                className="w-full p-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select 
                value={role} 
                onChange={(e) => setRole(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white"
              >
                <option value="MEMBER">Member (Can edit boards & cards)</option>
                <option value="ADMIN">Admin (Can manage workspace & members)</option>
              </select>
            </div>

            {error && (
              <div className="text-red-500 text-xs font-medium bg-red-50 p-2.5 rounded border border-red-100">
                {error}
              </div>
            )}

            <div className="pt-2 flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? 'Sending...' : 'Send Invite'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
