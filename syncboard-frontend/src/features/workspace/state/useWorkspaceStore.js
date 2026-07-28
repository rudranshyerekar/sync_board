import { create } from 'zustand';
import { workspaceApi } from '../../../api/workspaceApi';
import { boardApi } from '../../../api/boardApi';

export const useWorkspaceStore = create((set, get) => ({
  workspaces: [],
  workspaceBoards: {}, // { [workspaceId]: Board[] }
  isLoading: false,
  hasFetched: false,

  fetchData: async (force = false) => {
    if (get().hasFetched && !force) return;
    
    set({ isLoading: true });
    try {
      const wsData = await workspaceApi.getMyWorkspaces();
      
      const boardsMap = {};
      await Promise.all(
        wsData.map(async (ws) => {
          try {
            const boards = await boardApi.getBoards(ws.id);
            boardsMap[ws.id] = boards;
          } catch (err) {
            console.error(`Failed to fetch boards for workspace ${ws.id}:`, err);
            boardsMap[ws.id] = [];
          }
        })
      );
      
      set({ 
        workspaces: wsData, 
        workspaceBoards: boardsMap, 
        isLoading: false,
        hasFetched: true
      });
    } catch (err) {
      console.error("Failed to load workspace data:", err);
      set({ isLoading: false });
    }
  },

  addWorkspace: (newWs) => {
    set((state) => ({
      workspaces: [...state.workspaces, newWs],
      workspaceBoards: { ...state.workspaceBoards, [newWs.id]: [] }
    }));
  },

  // Helper to get all boards flattened
  getAllBoards: () => {
    const { workspaceBoards } = get();
    return Object.values(workspaceBoards).flat();
  }
}));
