import httpClient from './httpClient';

export const boardApi = {
  // Boards
  createBoard: async (workspaceId, boardData) => {
    const response = await httpClient.post(`/workspaces/${workspaceId}/boards`, boardData);
    return response.data;
  },

  getBoards: async (workspaceId) => {
    const response = await httpClient.get(`/workspaces/${workspaceId}/boards`);
    return response.data;
  },

  getBoard: async (boardId) => {
    const response = await httpClient.get(`/boards/${boardId}`);
    return response.data;
  },

  getFullBoard: async (boardId) => {
    const response = await httpClient.get(`/boards/${boardId}/full`);
    return response.data;
  },

  updateBoard: async (boardId, boardData) => {
    const response = await httpClient.put(`/boards/${boardId}`, boardData);
    return response.data;
  },

  deleteBoard: async (boardId) => {
    const response = await httpClient.delete(`/boards/${boardId}`);
    return response.data;
  },

  // Members
  getMembers: async (boardId) => {
    const response = await httpClient.get(`/boards/${boardId}/members`);
    return response.data;
  },

  addMember: async (boardId, userId) => {
    const response = await httpClient.post(`/boards/${boardId}/members`, { userId });
    return response.data;
  },

  removeMember: async (boardId, userId) => {
    const response = await httpClient.delete(`/boards/${boardId}/members/${userId}`);
    return response.data;
  },

  // Columns
  createColumn: async (boardId, columnData) => {
    const response = await httpClient.post(`/boards/${boardId}/columns`, columnData);
    return response.data;
  },

  getColumns: async (boardId) => {
    const response = await httpClient.get(`/boards/${boardId}/columns`);
    return response.data;
  },

  updateColumn: async (columnId, columnData) => {
    const response = await httpClient.put(`/columns/${columnId}`, columnData);
    return response.data;
  },

  deleteColumn: async (columnId) => {
    const response = await httpClient.delete(`/columns/${columnId}`);
    return response.data;
  }
};
