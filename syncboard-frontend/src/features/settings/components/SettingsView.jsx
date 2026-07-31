import React, { useState, useEffect } from 'react';
import { Settings, Users, User, Shield, Key, Bell, Trash2, Check, ExternalLink, UserPlus } from 'lucide-react';
import { useAuthStore } from '../../auth/state/useAuthStore';
import { workspaceApi } from '../../../api/workspaceApi';
import { Avatar } from '../../../components/Avatar';
import { Button } from '../../../components/Button';
import { InviteMemberModal } from '../../workspace/components/InviteMemberModal';

export const SettingsView = () => {
  const { user } = useAuthStore();
  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [workspaceMembers, setWorkspaceMembers] = useState([]);
  const [activeTab, setActiveTab] = useState('MEMBERS'); // MEMBERS, GENERAL, NOTIFICATIONS
  const [loading, setLoading] = useState(true);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  const fetchWorkspaces = async () => {
    setLoading(true);
    try {
      const data = await workspaceApi.getMyWorkspaces();
      setWorkspaces(data);
      if (data.length > 0) {
        setSelectedWorkspace(data[0]);
      }
    } catch (err) {
      console.error("Failed to load workspaces for settings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  useEffect(() => {
    if (selectedWorkspace) {
      const fetchMembers = async () => {
        try {
          const members = await workspaceApi.getMembers(selectedWorkspace.id);
          setWorkspaceMembers(members);
        } catch (err) {
          console.error("Failed to load members:", err);
        }
      };
      fetchMembers();
    } else {
      setWorkspaceMembers([]);
    }
  }, [selectedWorkspace]);

  const handleRoleChange = async (memberId, newRole) => {
    try {
      await workspaceApi.updateRole(selectedWorkspace.id, memberId, { role: newRole });
      setSaveStatus('Role updated successfully');
      setTimeout(() => setSaveStatus(null), 3000);
      fetchWorkspaces();
    } catch (err) {
      alert("Failed to update role. Ensure you have Owner or Admin privileges in this workspace.");
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm("Are you sure you wish to remove this member from the workspace?")) return;
    try {
      await workspaceApi.removeMember(selectedWorkspace.id, memberId);
      setSaveStatus('Member removed');
      setTimeout(() => setSaveStatus(null), 3000);
      fetchWorkspaces();
    } catch (err) {
      alert("Failed to remove member. You may not have administrative permissions.");
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-bg-primary">
      {/* Header */}
      <header className="px-8 py-6 border-b border-border bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="w-7 h-7 text-primary" />
            Workspace & Account Settings
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage permissions, collaborate with team members, and configure your live board environment.
          </p>
        </div>
        {workspaces.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Workspace:</span>
            <select
              value={selectedWorkspace?.id || ''}
              onChange={(e) => {
                const ws = workspaces.find(w => w.id === parseInt(e.target.value));
                if (ws) setSelectedWorkspace(ws);
              }}
              className="px-4 py-2 bg-white border border-border rounded-lg text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              {workspaces.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>
        )}
      </header>

      {/* Settings Navigation Tabs */}
      <div className="px-8 border-b border-border bg-gray-50 flex gap-8">
        <button
          onClick={() => setActiveTab('MEMBERS')}
          className={`py-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${activeTab === 'MEMBERS'
            ? 'border-primary text-primary'
            : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
        >
          <Users className="w-4 h-4" /> Workspace Members ({workspaceMembers.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('GENERAL')}
          className={`py-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${activeTab === 'GENERAL'
            ? 'border-primary text-primary'
            : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
        >
          <User className="w-4 h-4" /> Profile & Security
        </button>
      </div>

      {/* Tab Content Area */}
      <main className="flex-1 overflow-y-auto p-8 max-w-5xl mx-auto w-full">
        {saveStatus && (
          <div className="mb-6 px-4 py-3 bg-green-50 border border-green-200 text-green-800 rounded-xl flex items-center gap-2 text-sm font-medium animate-pulse">
            <Check className="w-4 h-4 text-green-600" /> {saveStatus}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading workspace configuration...</div>
        ) : activeTab === 'MEMBERS' ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Team Collaborators</h2>
                <p className="text-sm text-gray-500">Assign role hierarchies to control who can modify boards and project columns.</p>
              </div>
              {selectedWorkspace && (
                <Button
                  variant="primary"
                  onClick={() => setInviteModalOpen(true)}
                  className="flex items-center gap-2 text-sm px-4 py-2"
                >
                  <UserPlus className="w-4 h-4" /> Invite New Member
                </Button>
              )}
            </div>

            <div className="bg-white rounded-xl border border-border shadow-sm divide-y divide-border">
              {workspaceMembers.length ? (
                workspaceMembers.map((member) => (
                  <div key={member.id} className="p-5 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <Avatar user={member.user} size="lg" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900">{member.user?.name || member.user?.username || 'Member'}</span>
                          {member.user?.email === user?.email && (
                            <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-full">You</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{member.user?.email || 'No email registered'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-xs font-semibold text-gray-700">
                        <Shield className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{member.role || 'MEMBER'}</span>
                      </div>

                      {member.role !== 'OWNER' && member.user?.email !== user?.email && (
                        <div className="flex items-center gap-2">
                          <select
                            onChange={(e) => handleRoleChange(member.id, e.target.value)}
                            defaultValue={member.role}
                            className="text-xs px-2 py-1 border border-border rounded bg-white text-gray-700 cursor-pointer"
                          >
                            <option value="MEMBER">Member</option>
                            <option value="ADMIN">Admin</option>
                          </select>
                          <button
                            onClick={() => handleRemoveMember(member.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 rounded hover:bg-red-50 transition-colors"
                            title="Remove Member"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-400 text-sm">No collaborative members in this workspace yet.</div>
              )}
            </div>
          </div>
        ) : activeTab === 'GENERAL' ? (
          <div className="bg-white rounded-xl border border-border shadow-sm p-6 space-y-6">
            <div>
              <h3 className="text-base font-bold text-gray-900">Personal Account Profile</h3>
              <p className="text-xs text-gray-500">Your profile credentials authenticated via JWT bearer protocol.</p>
            </div>
            <div className="grid grid-cols-2 gap-6 max-w-xl">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Display Name</label>
                <input
                  type="text"
                  disabled
                  value={user?.name || 'SyncBoard User'}
                  className="w-full px-4 py-2 bg-gray-50 border border-border rounded-lg text-sm text-gray-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-4 py-2 bg-gray-50 border border-border rounded-lg text-sm text-gray-600"
                />
              </div>
            </div>
            <div className="pt-4 border-t border-border">
              <span className="text-xs font-semibold text-gray-400">Account status: Active · Token verification passed</span>
            </div>
          </div>
        ) : null}
      </main>
      {/* Invite Member Modal binding */}
      {inviteModalOpen && selectedWorkspace && (
        <InviteMemberModal
          workspaceId={selectedWorkspace.id}
          onClose={() => setInviteModalOpen(false)}
          onMemberInvited={() => {
            setInviteModalOpen(false);
            fetchWorkspaces();
          }}
        />
      )}
    </div>
  );
};
