import React from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { MessageSquare, Calendar, CheckCircle2 } from 'lucide-react';
import { ItemTypes } from '../dnd/ItemTypes';
import { Avatar } from '../../../components/Avatar';
import { useBoardStore } from '../state/useBoardStore';
import { useAuthStore } from '../../auth/state/useAuthStore';

export const CardPreview = ({ card, columnId, index }) => {
  const { setSelectedCard, editingCards, board, moveCardOptimistic, syncMoveCard } = useBoardStore();
  const currentUser = useAuthStore(state => state.user);
  const editingUser = editingCards[card.id];
  const isEditingByOther = editingUser && currentUser && editingUser.id !== currentUser.id;
  const isDoneColumn = board?.columns?.find(c => c.id === columnId)?.title?.toLowerCase() === 'done';
  
  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: ItemTypes.CARD,
    item: { id: card.id, sourceColId: columnId, index },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const [{ isOver }, dropRef] = useDrop(() => ({
    accept: ItemTypes.CARD,
    drop: (item, monitor) => {
      if (monitor.didDrop()) return;
      
      const targetColId = columnId;
      const newIndex = index; // drop exactly at this card's current index
      
      if (item.sourceColId === targetColId && item.index === newIndex) return;
      
      moveCardOptimistic(item.id, item.sourceColId, targetColId, newIndex);
      syncMoveCard(item.id, item.sourceColId, targetColId, newIndex);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver({ shallow: true }),
    }),
  }), [columnId, index, moveCardOptimistic, syncMoveCard]);

  const setRefs = (node) => {
    dragRef(node);
    dropRef(node);
  };

  // Define label colors based on the text
  const getLabelColors = (color) => {
    switch (color) {
      case 'blue': return 'text-blue-600 bg-blue-50';
      case 'indigo': return 'text-indigo-600 bg-indigo-50';
      case 'orange': return 'text-orange-600 bg-orange-50';
      case 'green': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityColors = (priority) => {
    switch (priority) {
      case 'URGENT': return 'text-red-600 bg-red-50 border border-red-200';
      case 'HIGH': return 'text-orange-600 bg-orange-50 border border-orange-200';
      case 'MEDIUM': return 'text-yellow-700 bg-yellow-50 border border-yellow-200';
      case 'LOW': return 'text-blue-600 bg-blue-50 border border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border border-gray-200';
    }
  };

  return (
    <div
      ref={setRefs}
      onClick={() => setSelectedCard(card.id)}
      className={`relative bg-white p-4 rounded-xl shadow-sm border cursor-grab active:cursor-grabbing transition-all ${
        isDragging ? 'opacity-50' : 'opacity-100'
      } ${isEditingByOther ? 'ring-2 ring-blue-400/50' : ''} ${
        isOver ? 'border-t-4 border-t-indigo-500 border-x-border border-b-border' : 'border-border hover:border-gray-300'
      }`}
    >
      {/* Editing Indicator Badge */}
      {isEditingByOther && (
        <div className="absolute -top-3 -right-2 bg-blue-100 border border-blue-200 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm z-10">
          <Avatar user={editingUser} size="sm" className="w-4 h-4" />
          <span>Editing</span>
        </div>
      )}

      {/* Title */}
      <h4 className="text-[15px] font-medium text-text-primary leading-snug mb-4 pr-4">
        {card.title}
      </h4>

      {/* Label and Assignee / Meta Row */}
      <div className="flex items-center justify-between">
        
        {/* Left Side: Avatar and Label */}
        <div className="flex items-center gap-2 flex-wrap">
          {card.assignee && (
            <Avatar user={card.assignee} size="sm" />
          )}
          {card.priority && (
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getPriorityColors(card.priority)}`}>
              {card.priority}
            </span>
          )}
          {card.label && (
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getLabelColors(card.label.color)}`}>
              {card.label.text}
            </span>
          )}
        </div>

        {/* Right Side: Meta (Comments, Date, or Done Checkmark) */}
        <div className="flex items-center gap-3 text-gray-400 text-xs font-medium">
          {isDoneColumn || card.done ? (
            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
            </div>
          ) : (
            <>
              {(card.commentCount > 0 || card.comments > 0) && (
                <div className="flex items-center gap-1 hover:text-gray-600">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{card.commentCount ?? card.comments}</span>
                </div>
              )}
              {(card.deadline || card.date) && (
                <div className="flex items-center gap-1 text-red-500 hover:text-red-600">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{card.deadline ? new Date(card.deadline).toLocaleDateString() : card.date}</span>
                </div>
              )}
            </>
          )}
        </div>
        
      </div>
    </div>
  );
};
