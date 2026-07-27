import httpClient from './httpClient';

export const workspaceApi = {
  createWorkspace: async (workspaceData) => {
    const response = await httpClient.post('/workspaces', workspaceData);
    return response.data;
  },

  getMyWorkspaces: async () => {
    const response = await httpClient.get('/workspaces');
    return response.data;
  },

  getWorkspace: async (id) => {
    const response = await httpClient.get(`/workspaces/${id}`);
    return response.data;
  },

  inviteMember: async (workspaceId, memberData) => {
    const response = await httpClient.post(`/workspaces/${workspaceId}/members`, memberData);
    return response.data;
  },

  updateRole: async (workspaceId, userId, roleData) => {
    const response = await httpClient.put(`/workspaces/${workspaceId}/members/${userId}/role`, roleData);
    return response.data;
  },

  removeMember: async (workspaceId, userId) => {
    const response = await httpClient.delete(`/workspaces/${workspaceId}/members/${userId}`);
    return response.data;
  },

  getMembers: async (workspaceId) => {
    const response = await httpClient.get(`/workspaces/${workspaceId}/members`);
    return response.data;
  },
};
