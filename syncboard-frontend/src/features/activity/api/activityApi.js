import httpClient from '../../../api/httpClient';

export const activityApi = {
    getActivities: async (workspaceId, page = 0, size = 20) => {
        const response = await httpClient.get(`/workspaces/${workspaceId}/activities`, {
            params: { page, size }
        });
        return response.data;
    }
};
