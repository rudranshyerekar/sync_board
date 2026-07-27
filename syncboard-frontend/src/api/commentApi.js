import httpClient from './httpClient';

export const commentApi = {
  /**
   * POST /api/cards/{cardId}/comments
   * Returns the created CommentResponse
   */
  postComment: (cardId, content) =>
    httpClient.post(`/cards/${cardId}/comments`, { content }).then(r => r.data),

  /**
   * GET /api/cards/{cardId}/comments
   * Returns list of CommentResponse, oldest-first
   */
  getComments: (cardId) =>
    httpClient.get(`/cards/${cardId}/comments`).then(r => r.data),

  /**
   * DELETE /api/comments/{commentId}
   */
  deleteComment: (commentId) =>
    httpClient.delete(`/comments/${commentId}`),
};
