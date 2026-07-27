import React, { useMemo, useEffect, useState, useRef } from 'react';
import { X, AlignLeft, User, Tag, Clock, Trash2, AlertCircle, Send, MessageSquare, Loader2, ChevronDown, Check } from 'lucide-react';
import { useBoardStore } from '../../board/state/useBoardStore';
import { useCommentStore } from '../state/useCommentStore';
import { useAuthStore } from '../../auth/state/useAuthStore';
import { workspaceApi } from '../../../api/workspaceApi';
import { Avatar } from '../../../components/Avatar';
import { Button } from '../../../components/Button';

const formatRelativeTime = (isoString) => {
  if (!isoString) return '';
  const now = new Date();
  const date = new Date(isoString);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  return `${Math.floor(diffHrs / 24)}d ago`;
};

/** Highlights @mentions in comment text */
const CommentContent = ({ content }) => {
  const parts = content.split(/(@\w+)/g);
  return (
    <span>
      {parts.map((part, i) =>
        /^@\w+/.test(part) ? (
          <span key={i} className="text-primary font-medium bg-blue-50 rounded px-0.5">{part}</span>
        ) : part
      )}
    </span>
  );
};

/** Assignee dropdown picker */
const AssigneePicker = ({ members, selectedId, onSelect }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = members.find(m => m.id === selectedId);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-md border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors text-sm w-full"
      >
        {selected ? (
          <>
            <Avatar user={selected} size="sm" />
            <span className="flex-1 text-left text-gray-800 font-medium truncate">{selected.name}</span>
          </>
        ) : (
          <>
            <div className="w-6 h-6 rounded-full border-2 border-dashed border-gray-400 flex items-center justify-center">
              <User className="w-3 h-3 text-gray-400" />
            </div>
            <span className="flex-1 text-left text-gray-400">Unassigned</span>
          </>
        )}
        <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
      </button>

      {open && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1 max-h-48 overflow-y-auto">
          {/* Unassign option */}
          <button
            type="button"
            onClick={() => { onSelect(null); setOpen(false); }}
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${!selectedId ? 'text-primary' : 'text-gray-500'}`}
          >
            <div className="w-6 h-6 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center flex-shrink-0">
              <User className="w-3 h-3 text-gray-300" />
            </div>
            <span className="flex-1 text-left">Unassigned</span>
            {!selectedId && <Check className="w-4 h-4 text-primary" />}
          </button>

          {members.map(member => (
            <button
              key={member.id}
              type="button"
              onClick={() => { onSelect(member.id); setOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${selectedId === member.id ? 'bg-blue-50' : ''}`}
            >
              <Avatar user={member} size="sm" />
              <div className="flex-1 text-left min-w-0">
                <p className="font-medium text-gray-800 truncate">{member.name}</p>
                <p className="text-xs text-gray-400 truncate">{member.email}</p>
              </div>
              {selectedId === member.id && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const CardDrawer = () => {
  const { board, selectedCardId, setSelectedCard, publishEditStart, publishEditStop, updateCard, deleteCard } = useBoardStore();
  const { comments, typingUsers, isLoading: commentsLoading, fetchComments, postComment, deleteComment, initCommentSync, disconnectCommentSync, sendTypingStart, sendTypingStop } = useCommentStore();
  const { user } = useAuthStore();

  const card = useMemo(() => {
    if (!board || !selectedCardId) return null;
    for (const column of board.columns) {
      const found = column.cards.find(c => c.id === selectedCardId);
      if (found) return { ...found, columnTitle: column.title };
    }
    return null;
  }, [board, selectedCardId]);

  const cardId = card?.id;

  const [editedTitle, setEditedTitle] = useState('');
  const [editedDesc, setEditedDesc] = useState('');
  const [editedPriority, setEditedPriority] = useState('MEDIUM');
  const [editedAssigneeId, setEditedAssigneeId] = useState(null);
  const [members, setMembers] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const commentsEndRef = useRef(null);

  // Reset form fields when card changes
  useEffect(() => {
    if (card) {
      setEditedTitle(card.title || '');
      setEditedDesc(card.description || '');
      setEditedPriority(card.priority || 'MEDIUM');
      setEditedAssigneeId(card.assignee?.id ?? card.assigneeId ?? null);
    }
  }, [card]);

  // Fetch workspace members for the assignee picker
  useEffect(() => {
    const workspaceId = board?.workspaceId;
    if (!workspaceId) return;
    workspaceApi.getMembers(workspaceId).then(setMembers).catch(console.error);
  }, [board?.workspaceId]);

  // Soft-lock broadcast
  useEffect(() => {
    if (cardId) {
      publishEditStart(cardId);
      return () => { publishEditStop(cardId); };
    }
  }, [cardId, publishEditStart, publishEditStop]);

  // Comment sync
  useEffect(() => {
    if (cardId) {
      fetchComments(cardId);
      initCommentSync(cardId);
      return () => {
        disconnectCommentSync();
        sendTypingStop(cardId);
      };
    }
  }, [cardId]);

  // Auto-scroll to newest comment
  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  if (!card) return null;

  const handleSave = () => {
    updateCard(card.id, {
      ...card,
      title: editedTitle,
      description: editedDesc,
      priority: editedPriority,
      assigneeId: editedAssigneeId,  // ← key fix: always send assigneeId
    });
    setSelectedCard(null);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this card?')) {
      deleteCard(card.id);
      setSelectedCard(null);
    }
  };

  const handleCommentInput = (e) => {
    setCommentText(e.target.value);
    if (e.target.value.trim() && cardId) {
      sendTypingStart(cardId, user?.name || 'Someone');
    }
  };

  const handleSendComment = async () => {
    const trimmed = commentText.trim();
    if (!trimmed || isSending) return;
    setIsSending(true);
    setCommentText('');
    sendTypingStop(cardId);
    await postComment(cardId, trimmed);
    setIsSending(false);
  };

  const handleCommentKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendComment();
    }
  };

  const typingLabel = typingUsers.length === 1
    ? `${typingUsers[0].userName} is typing…`
    : typingUsers.length > 1
    ? `${typingUsers.map(u => u.userName).join(', ')} are typing…`
    : null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={() => setSelectedCard(null)} />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-[480px] bg-white shadow-2xl z-50 border-l border-border flex flex-col">

        {/* Header */}
        <div className="px-6 py-4 flex items-start justify-between border-b border-border bg-gray-50">
          <div className="flex-1 min-w-0 mr-3">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
              {card.columnTitle}
            </span>
            <input
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="text-xl font-bold text-gray-900 leading-tight bg-transparent border-b border-transparent focus:border-gray-300 focus:outline-none w-full pb-1"
            />
          </div>
          <button onClick={() => setSelectedCard(null)} className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors flex-shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-y-6 gap-x-4">

            {/* Assignee — interactive picker */}
            <div className="col-span-2">
              <div className="flex items-center gap-2 text-sm text-gray-500 font-medium mb-2">
                <User className="w-4 h-4" /> Assignee
              </div>
              <AssigneePicker
                members={members}
                selectedId={editedAssigneeId}
                onSelect={setEditedAssigneeId}
              />
            </div>

            {/* Due Date */}
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-500 font-medium mb-2">
                <Clock className="w-4 h-4" /> Due Date
              </div>
              {(card.deadline || card.date) ? (
                <span className="text-sm font-medium text-gray-900">
                  {card.deadline ? new Date(card.deadline).toLocaleDateString() : card.date}
                </span>
              ) : (
                <span className="text-sm text-gray-400">No due date</span>
              )}
            </div>

            {/* Priority */}
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-500 font-medium mb-2">
                <AlertCircle className="w-4 h-4" /> Priority
              </div>
              <select
                value={editedPriority}
                onChange={(e) => setEditedPriority(e.target.value)}
                className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-md focus:ring-primary focus:border-primary block w-full p-2 outline-none"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 font-medium mb-3">
              <AlignLeft className="w-4 h-4" /> Description
            </div>
            <textarea
              value={editedDesc}
              onChange={(e) => setEditedDesc(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-md p-4 min-h-[100px] text-sm text-gray-700 w-full focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-none"
              placeholder="Add a more detailed description..."
            />
          </div>

          {/* ── Comments ── */}
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 font-medium mb-4">
              <MessageSquare className="w-4 h-4" /> Comments
              {comments.length > 0 && (
                <span className="text-xs font-semibold bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">{comments.length}</span>
              )}
            </div>

            <div className="space-y-4 mb-4">
              {commentsLoading && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                </div>
              )}
              {!commentsLoading && comments.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">No comments yet. Be the first!</p>
              )}
              {!commentsLoading && comments.map((comment) => {
                const isOwn = comment.author?.email === user?.email;
                return (
                  <div key={comment.id} className="flex gap-3 group">
                    <Avatar user={comment.author} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-xs font-semibold text-gray-800">{comment.author?.name}</span>
                        <span className="text-xs text-gray-400">{formatRelativeTime(comment.createdAt)}</span>
                        {isOwn && (
                          <button onClick={() => deleteComment(comment.id)} className="ml-auto opacity-0 group-hover:opacity-100 text-xs text-red-400 hover:text-red-600 transition-opacity">
                            Delete
                          </button>
                        )}
                      </div>
                      <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-sm text-gray-700 leading-relaxed">
                        <CommentContent content={comment.content} />
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={commentsEndRef} />
            </div>

            {/* Typing indicator */}
            {typingLabel && (
              <div className="text-xs text-gray-400 italic mb-2 flex items-center gap-1.5">
                <span className="flex gap-0.5">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
                {typingLabel}
              </div>
            )}

            {/* Comment input */}
            <div className="flex gap-2 items-end">
              <Avatar user={user} size="sm" />
              <div className="flex-1 relative">
                <textarea
                  id="comment-input"
                  value={commentText}
                  onChange={handleCommentInput}
                  onKeyDown={handleCommentKeyDown}
                  rows={2}
                  placeholder="Write a comment… (@email to mention)"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 pr-10 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-none"
                />
                <button
                  id="send-comment-btn"
                  onClick={handleSendComment}
                  disabled={!commentText.trim() || isSending}
                  className="absolute right-2 bottom-2 p-1.5 rounded-md text-primary hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-gray-50 flex justify-between items-center">
          <button onClick={handleDelete} className="text-red-500 hover:text-red-700 flex items-center gap-1 text-sm font-medium p-2 rounded hover:bg-red-50 transition-colors">
            <Trash2 className="w-4 h-4" /> Delete Card
          </button>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setSelectedCard(null)}>Cancel</Button>
            <Button variant="primary" onClick={handleSave}>Save Changes</Button>
          </div>
        </div>
      </div>
    </>
  );
};
