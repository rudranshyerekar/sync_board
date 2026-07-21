import React from 'react';
import { useDrag } from 'react-dnd';
import { MessageSquare, Calendar, CheckCircle2 } from 'lucide-react';
import { ItemTypes } from '../dnd/ItemTypes';
import { Avatar } from '../../../components/Avatar';
import { useBoardStore } from '../state/useBoardStore';

export const CardPreview = ({ card, columnId, index }) => {
  const { setSelectedCard, editingCards } = useBoardStore();
  const editingUser = editingCards[card.id];
  
  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: ItemTypes.CARD,
    item: { id: card.id, sourceColId: columnId, index },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

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

  return (
    <div
      ref={dragRef}
      onClick={() => setSelectedCard(card.id)}
      className={`relative bg-white p-4 rounded-xl shadow-sm border border-border cursor-grab active:cursor-grabbing hover:border-gray-300 transition-all ${
        isDragging ? 'opacity-50' : 'opacity-100'
      } ${editingUser ? 'ring-2 ring-blue-400/50' : ''}`}
    >
      {/* Editing Indicator Badge */}
      {editingUser && (
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
        <div className="flex items-center gap-3">
          {card.assignee && (
            <Avatar user={card.assignee} size="sm" />
          )}
          {card.label && (
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getLabelColors(card.label.color)}`}>
              {card.label.text}
            </span>
          )}
        </div>

        {/* Right Side: Meta (Comments, Date, or Done Checkmark) */}
        <div className="flex items-center gap-3 text-gray-400 text-xs font-medium">
          {card.done ? (
            <CheckCircle2 className="w-5 h-5 text-success fill-success/10" />
          ) : (
            <>
              {card.comments > 0 && (
                <div className="flex items-center gap-1 hover:text-gray-600">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{card.comments}</span>
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
