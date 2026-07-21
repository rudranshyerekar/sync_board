import httpClient from './httpClient';

export const cardApi = {
  createCard: async (columnId, cardData) => {
    const response = await httpClient.post(`/columns/${columnId}/cards`, cardData);
    return response.data;
  },

  getCards: async (columnId) => {
    const response = await httpClient.get(`/columns/${columnId}/cards`);
    return response.data;
  },

  updateCard: async (cardId, cardData) => {
    const response = await httpClient.put(`/cards/${cardId}`, cardData);
    return response.data;
  },

  moveCard: async (cardId, targetColumnId, position) => {
    const response = await httpClient.patch(`/cards/${cardId}/move`, null, {
      params: { targetColumnId, position }
    });
    return response.data;
  },

  deleteCard: async (cardId) => {
    const response = await httpClient.delete(`/cards/${cardId}`);
    return response.data;
  }
};
