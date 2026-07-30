import React, { useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Avatar } from '../../../components/Avatar';
import { useActivityStore } from '../state/useActivityStore';
import { useBoardStore } from '../../board/state/useBoardStore';

export const ActivityFeed = () => {
  const { board } = useBoardStore();
  const { activities, isLoading, hasMore, fetchMore, setWorkspaceId } = useActivityStore();

  useEffect(() => {
    if (board?.workspaceId) {
      setWorkspaceId(board.workspaceId);
    }
  }, [board?.workspaceId, setWorkspaceId]);

  return (
    <div className="space-y-6">
      {activities.map((activity, idx) => (
        <div key={activity.id} className="flex gap-3 relative">
          {idx < activities.length - 1 && (
            <div className="absolute left-4 top-8 bottom-[-24px] w-px bg-gray-200"></div>
          )}
          <Avatar user={activity.user} size="sm" className="relative z-10 bg-white ring-4 ring-white" />
          <div className="flex-1 pt-1">
            <p className="text-sm text-gray-800">
              <span className="font-semibold">{activity.user.name}</span>
            </p>
            <p className="text-sm text-gray-700 mt-0.5">
              <span className="font-medium text-gray-900 mr-1">{activity.action}:</span> 
              {activity.description}
            </p>
            <p className="text-[11px] text-gray-400 mt-1.5">
              {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
      ))}
      {isLoading && (
        <div className="py-4 flex justify-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
        </div>
      )}
      {!isLoading && activities.length === 0 && (
        <div className="text-center text-gray-500 text-sm py-4">No recent activity.</div>
      )}
      {!isLoading && hasMore && (
        <button 
          onClick={fetchMore}
          className="w-full text-center text-xs font-medium text-indigo-600 hover:underline py-2"
        >
          Load more
        </button>
      )}
    </div>
  );
};
