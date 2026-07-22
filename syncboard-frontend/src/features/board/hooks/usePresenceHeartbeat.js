import { useEffect, useRef, useState } from 'react';
import { wsService } from '../../../api/websocketService';
import { useBoardStore } from '../state/useBoardStore';

const IDLE_TIMEOUT_MS = 60 * 1000; // 1 minute
const AWAY_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
const HEARTBEAT_INTERVAL_MS = 4000; // 4 seconds

export function usePresenceHeartbeat(boardId) {
  const [status, setStatus] = useState('online');
  const lastActivityRef = useRef(Date.now());
  const selectedCardId = useBoardStore(state => state.selectedCardId);

  useEffect(() => {
    // Activity tracking
    const handleActivity = () => {
      lastActivityRef.current = Date.now();
      if (status !== 'online') {
        setStatus('online');
      }
    };

    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'];
    events.forEach(e => window.addEventListener(e, handleActivity));

    // Status checker loop
    const statusChecker = setInterval(() => {
      const inactiveTime = Date.now() - lastActivityRef.current;
      if (inactiveTime > AWAY_TIMEOUT_MS) {
        if (status !== 'away') setStatus('away');
      } else if (inactiveTime > IDLE_TIMEOUT_MS) {
        if (status !== 'idle') setStatus('idle');
      }
    }, 10000); // Check every 10s

    return () => {
      events.forEach(e => window.removeEventListener(e, handleActivity));
      clearInterval(statusChecker);
    };
  }, [status]);

  useEffect(() => {
    if (!boardId) return;

    // Heartbeat loop
    const heartbeatLoop = setInterval(() => {
      wsService.publish(`/app/board/${boardId}/presence/heartbeat`, {
        status,
        editingCardId: selectedCardId
      });
    }, HEARTBEAT_INTERVAL_MS);

    return () => {
      clearInterval(heartbeatLoop);
      // Optional: send leave event when unmounting
      wsService.publish(`/app/board/${boardId}/presence/leave`, {});
    };
  }, [boardId, status, selectedCardId]);

  return status;
}
