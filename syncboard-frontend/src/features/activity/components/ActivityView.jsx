import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../auth/state/useAuthStore';
import { activityApi } from '../api/activityApi';
import { workspaceApi } from '../../../api/workspaceApi';
import { Avatar } from '../../../components/Avatar';
import { Activity, Folder } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const ActivityView = () => {
    const { user } = useAuthStore();
    const [workspaces, setWorkspaces] = useState([]);
    const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(null);
    const [activities, setActivities] = useState([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    // Fetch user's workspaces on mount
    useEffect(() => {
        const fetchWorkspaces = async () => {
            try {
                const wsList = await workspaceApi.getMyWorkspaces();
                setWorkspaces(wsList);
                if (wsList.length > 0 && !selectedWorkspaceId) {
                    setSelectedWorkspaceId(wsList[0].id);
                }
            } catch (error) {
                console.error("Failed to fetch workspaces for activity view:", error);
            }
        };
        fetchWorkspaces();
    }, []);

    const fetchActivities = async (workspaceId, pageNum) => {
        if (!workspaceId) return;
        setLoading(true);
        try {
            const data = await activityApi.getActivities(workspaceId, pageNum);
            setActivities(prev => pageNum === 0 ? data.content : [...prev, ...data.content]);
            setHasMore(!data.last);
            setPage(pageNum);
        } catch (error) {
            console.error("Failed to fetch activities:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedWorkspaceId) {
            setActivities([]);
            setPage(0);
            setHasMore(true);
            fetchActivities(selectedWorkspaceId, 0);
        }
    }, [selectedWorkspaceId]);

    const handleScroll = (e) => {
        const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
        if (scrollHeight - scrollTop <= clientHeight + 50 && !loading && hasMore && selectedWorkspaceId) {
            fetchActivities(selectedWorkspaceId, page + 1);
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-bg-secondary p-4 md:p-8 overflow-y-auto" onScroll={handleScroll}>
            <div className="max-w-3xl mx-auto w-full">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                            <Activity className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Workspace Activity</h1>
                            <p className="text-sm text-gray-500">A timeline of recent events in this workspace.</p>
                        </div>
                    </div>
                    {workspaces.length > 0 && (
                        <div className="flex items-center gap-2">
                            <Folder className="w-4 h-4 text-gray-500" />
                            <select
                                value={selectedWorkspaceId || ''}
                                onChange={(e) => setSelectedWorkspaceId(Number(e.target.value))}
                                className="bg-white border border-border rounded-md px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            >
                                {workspaces.map(ws => (
                                    <option key={ws.id} value={ws.id}>
                                        {ws.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    {activities.map((activity, index) => (
                        <div key={activity.id || index} className="bg-white rounded-lg border border-border p-4 flex gap-4 items-start shadow-sm hover:shadow-md transition-shadow">
                            <Avatar user={activity.user} size="md" />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <p className="text-sm font-semibold text-gray-900">
                                        {activity.user.name}
                                    </p>
                                    <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                                        {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-700">
                                    <span className="font-medium text-gray-900 mr-2">{activity.action}:</span> 
                                    {activity.description}
                                </p>
                            </div>
                        </div>
                    ))}
                    
                    {loading && (
                        <div className="py-4 flex justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        </div>
                    )}
                    
                    {!hasMore && activities.length > 0 && (
                        <div className="py-8 text-center text-gray-500 text-sm">
                            No more activity to show.
                        </div>
                    )}

                    {!loading && activities.length === 0 && (
                        <div className="py-12 text-center text-gray-500 flex flex-col items-center">
                            <Activity className="w-12 h-12 text-gray-300 mb-3" />
                            <p className="text-lg font-medium text-gray-900">No recent activity</p>
                            <p className="text-sm text-gray-500">Things have been quiet around here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
