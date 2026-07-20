import { create } from 'zustand';
import { mockApi } from '../../../api/mockDataService';
import { wsService } from '../../../api/websocketService';

export const useBoardStore = create((set, get) => ({
  board: null,
  isLoading: false,
  error: null,
  selectedCardId: null,
  activeUsers: [],
  editingCards: {}, // { cardId: user }

  setSelectedCard: (cardId) => set({ selectedCardId: cardId }),

  fetchBoard: async (boardId) => {
    set({ isLoading: true, error: null });
    try {
      const data = await mockApi.fetchBoard(boardId);
      set({ board: data, isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  // --- Real-time Sync (Phase 3 & 4) ---
  initRealTimeSync: (boardId) => {
    wsService.connect('mock-token', () => {
      // 1. Subscribe to Presence
      wsService.subscribe(`/topic/board/${boardId}/presence`, (message) => {
        if (message.type === 'PRESENCE_UPDATE') {
          set({ activeUsers: message.users });
        }
      });

      // 2. Subscribe to Board Events (Moves, Edits)
      wsService.subscribe(`/topic/board/${boardId}`, (message) => {
        const state = get();
        
        switch (message.type) {
          case 'CARD_MOVED': {
            // An external user moved a card. We apply the same optimistic logic locally.
            const { cardId, sourceColId, targetColId, newIndex } = message.payload;
            state.moveCardOptimistic(cardId, sourceColId, targetColId, newIndex);
            break;
          }
            
          case 'CARD_EDITING_START':
            set((prev) => ({
              editingCards: {
                ...prev.editingCards,
                [message.payload.cardId]: message.payload.user
              }
            }));
            break;
            
          case 'CARD_EDITING_STOP':
            set((prev) => {
              const newEditing = { ...prev.editingCards };
              delete newEditing[message.payload.cardId];
              return { editingCards: newEditing };
            });
            break;
        }
      });
    });
  },

  disconnectRealTimeSync: () => {
    wsService.disconnect();
    set({ activeUsers: [], editingCards: {} });
  },

  // Broadcast that LOCAL user started editing
  publishEditStart: (cardId) => {
    wsService.publish(`/app/board/${get().board?.id}/edit/start`, { cardId });
  },

  // Broadcast that LOCAL user stopped editing
  publishEditStop: (cardId) => {
    wsService.publish(`/app/board/${get().board?.id}/edit/stop`, { cardId });
  },

  // Optimistic update for dragging cards
  moveCardOptimistic: (cardId, sourceColId, targetColId, newIndex) => {
    set((state) => {
      if (!state.board) return state;

      const newBoard = JSON.parse(JSON.stringify(state.board)); // Deep clone for safety
      
      const sourceCol = newBoard.columns.find(c => c.id === sourceColId);
      const targetCol = newBoard.columns.find(c => c.id === targetColId);
      
      if (!sourceCol || !targetCol) return state;

      const cardIndex = sourceCol.cards.findIndex(c => c.id === cardId);
      if (cardIndex === -1) return state;

      const [card] = sourceCol.cards.splice(cardIndex, 1);
      targetCol.cards.splice(newIndex, 0, card);

      return { board: newBoard };
    });
  },

  // Sync with backend (mock) after optimistic update
  syncMoveCard: async (cardId, sourceColId, targetColId, newPosition) => {
    try {
      await mockApi.moveCard(cardId, sourceColId, targetColId, newPosition);
      // If it fails, we would roll back the optimistic update here.
    } catch (err) {
      console.error("Failed to sync card move:", err);
      // Trigger a re-fetch to repair state on failure
      get().fetchBoard(get().board.id);
    }
  }
}));
