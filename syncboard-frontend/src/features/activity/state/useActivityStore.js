import { create } from 'zustand';
import { activityApi } from '../api/activityApi';

export const useActivityStore = create((set, get) => ({
  activities: [],
  page: 0,
  hasMore: true,
  isLoading: false,
  workspaceId: null,

  setWorkspaceId: (workspaceId) => {
    if (get().workspaceId !== workspaceId) {
      set({ workspaceId, activities: [], page: 0, hasMore: true });
      get().fetchActivities(workspaceId, 0);
    }
  },

  fetchActivities: async (workspaceId, pageNum = 0) => {
    if (!workspaceId) return;
    set({ isLoading: true });
    try {
      const data = await activityApi.getActivities(workspaceId, pageNum);
      set((state) => ({
        activities: pageNum === 0 ? data.content : [...state.activities, ...data.content],
        hasMore: !data.last,
        page: pageNum,
        isLoading: false
      }));
    } catch (error) {
      console.error("Failed to fetch activities:", error);
      set({ isLoading: false });
    }
  },

  fetchMore: () => {
    const { workspaceId, page, hasMore, isLoading, fetchActivities } = get();
    if (hasMore && !isLoading && workspaceId) {
      fetchActivities(workspaceId, page + 1);
    }
  }
}));
