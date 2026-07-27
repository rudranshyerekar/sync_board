import { create } from 'zustand';
import { commentApi } from '../../../api/commentApi';
import { wsService } from '../../../api/websocketService';
import { useAuthStore } from '../../auth/state/useAuthStore';

let typingTimeout = null;

// Keep per-card subscription callbacks so we can clean them up properly
let commentSubCallback = null;
let typingSubCallback = null;
let subscribedCardId = null;

export const useCommentStore = create((set, get) => ({
  comments: [],
  isLoading: false,
  typingUsers: [],
  activeCardId: null,

  fetchComments: async (cardId) => {
    set({ isLoading: true });
    try {
      const data = await commentApi.getComments(cardId);
      set({ comments: data, isLoading: false });
    } catch (err) {
      console.error('[Comments] Failed to fetch:', err);
      set({ isLoading: false });
    }
  },

  postComment: async (cardId, content) => {
    try {
      const saved = await commentApi.postComment(cardId, content);
      // Directly add to state from HTTP response as the source of truth.
      // The STOMP broadcast will arrive too, so we deduplicate by id.
      set((state) => {
        const alreadyExists = state.comments.some(c => c.id === saved.id);
        if (alreadyExists) return state;
        return { comments: [...state.comments, saved] };
      });
    } catch (err) {
      console.error('[Comments] Failed to post:', err);
      alert('Failed to post comment.');
    }
  },

  deleteComment: async (commentId) => {
    // Optimistic: remove immediately from UI
    set((state) => ({
      comments: state.comments.filter(c => c.id !== commentId),
    }));
    try {
      await commentApi.deleteComment(commentId);
      // STOMP COMMENT_DELETED broadcast will arrive for other tabs — handled in initCommentSync
    } catch (err) {
      console.error('[Comments] Failed to delete:', err);
      alert('Failed to delete comment.');
      // Refetch to restore correct state
      get().fetchComments(get().activeCardId);
    }
  },

  initCommentSync: (cardId) => {
    // Cleanup previous subscriptions if switching cards
    if (subscribedCardId && subscribedCardId !== cardId) {
      get().disconnectCommentSync();
    }
    subscribedCardId = cardId;
    set({ activeCardId: cardId });

    commentSubCallback = (message) => {
      if (message.type === 'COMMENT_ADDED') {
        set((state) => {
          // Deduplicate: the author's tab already added it via postComment()
          const alreadyExists = state.comments.some(c => c.id === message.payload.id);
          if (alreadyExists) return state;
          return { comments: [...state.comments, message.payload] };
        });
      } else if (message.type === 'COMMENT_DELETED') {
        set((state) => ({
          comments: state.comments.filter(c => c.id !== message.payload.commentId),
        }));
      }
    };

    typingSubCallback = (event) => {
      const currentUserEmail = useAuthStore.getState().user?.email;
      if (event.userEmail === currentUserEmail) return;

      if (event.event === 'TYPING_START') {
        set((state) => {
          const already = state.typingUsers.some(u => u.userEmail === event.userEmail);
          if (already) return state;
          return { typingUsers: [...state.typingUsers, { userEmail: event.userEmail, userName: event.userName }] };
        });
      } else if (event.event === 'TYPING_STOP') {
        set((state) => ({
          typingUsers: state.typingUsers.filter(u => u.userEmail !== event.userEmail),
        }));
      }
    };

    wsService.subscribe(`/topic/card/${cardId}/comments`, commentSubCallback);
    wsService.subscribe(`/topic/card/${cardId}/typing`, typingSubCallback);
  },

  disconnectCommentSync: () => {
    if (subscribedCardId) {
      if (commentSubCallback) wsService.unsubscribe(`/topic/card/${subscribedCardId}/comments`, commentSubCallback);
      if (typingSubCallback) wsService.unsubscribe(`/topic/card/${subscribedCardId}/typing`, typingSubCallback);
    }
    commentSubCallback = null;
    typingSubCallback = null;
    subscribedCardId = null;
    set({ comments: [], typingUsers: [], activeCardId: null });
  },

  sendTypingStart: (cardId, userName) => {
    if (typingTimeout) clearTimeout(typingTimeout);
    wsService.publish(`/app/card/${cardId}/typing`, { event: 'TYPING_START', userName });
    typingTimeout = setTimeout(() => get().sendTypingStop(cardId), 3000);
  },

  sendTypingStop: (cardId) => {
    if (typingTimeout) { clearTimeout(typingTimeout); typingTimeout = null; }
    wsService.publish(`/app/card/${cardId}/typing`, { event: 'TYPING_STOP' });
  },
}));
