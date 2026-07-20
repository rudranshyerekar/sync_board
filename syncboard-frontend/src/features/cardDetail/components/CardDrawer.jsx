import React, { useMemo, useEffect } from 'react';
import { X, AlignLeft, User, Tag, Clock } from 'lucide-react';
import { useBoardStore } from '../../board/state/useBoardStore';
import { Avatar } from '../../../components/Avatar';
import { Badge } from '../../../components/Badge';
import { Button } from '../../../components/Button';

export const CardDrawer = () => {
  const { board, selectedCardId, setSelectedCard, publishEditStart, publishEditStop } = useBoardStore();

  // Find the selected card across all columns
  const card = useMemo(() => {
    if (!board || !selectedCardId) return null;
    for (const column of board.columns) {
      const found = column.cards.find(c => c.id === selectedCardId);
      if (found) return { ...found, columnTitle: column.title };
    }
    return null;
  }, [board, selectedCardId]);

  const cardId = card?.id;

  useEffect(() => {
    if (cardId) {
      publishEditStart(cardId);
      return () => {
        publishEditStop(cardId);
      };
    }
  }, [cardId, publishEditStart, publishEditStop]);

  if (!card) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity" 
        onClick={() => setSelectedCard(null)}
      />
      
      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-[450px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-border flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 flex items-start justify-between border-b border-border bg-gray-50">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {card.columnTitle}
              </span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 leading-tight">
              {card.title}
            </h2>
          </div>
          <button 
            onClick={() => setSelectedCard(null)}
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-y-6 gap-x-4">
            
            {/* Assignee */}
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-500 font-medium mb-2">
                <User className="w-4 h-4" /> Assignee
              </div>
              {card.assignee ? (
                <div className="flex items-center gap-2">
                  <Avatar user={card.assignee} size="md" />
                  <span className="text-sm font-medium text-gray-900">{card.assignee.name}</span>
                </div>
              ) : (
                <button className="w-8 h-8 rounded-full border border-dashed border-gray-400 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-600">
                  <User className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Label */}
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-500 font-medium mb-2">
                <Tag className="w-4 h-4" /> Label
              </div>
              {card.label ? (
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium
                  ${card.label.color === 'blue' ? 'text-blue-600 bg-blue-50' : ''}
                  ${card.label.color === 'indigo' ? 'text-indigo-600 bg-indigo-50' : ''}
                  ${card.label.color === 'orange' ? 'text-orange-600 bg-orange-50' : ''}
                  ${card.label.color === 'green' ? 'text-green-600 bg-green-50' : ''}
                `}>
                  {card.label.text}
                </span>
              ) : (
                <span className="text-sm text-gray-400">None</span>
              )}
            </div>

            {/* Due Date */}
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-500 font-medium mb-2">
                <Clock className="w-4 h-4" /> Due Date
              </div>
              {card.date ? (
                <span className="text-sm font-medium text-gray-900">{card.date}</span>
              ) : (
                <span className="text-sm text-gray-400">No due date</span>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 font-medium mb-3">
              <AlignLeft className="w-4 h-4" /> Description
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-md p-4 min-h-[100px] text-sm text-gray-700">
              {card.description || <span className="text-gray-400 italic">Add a more detailed description...</span>}
            </div>
          </div>
          
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-border bg-gray-50 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setSelectedCard(null)}>Cancel</Button>
          <Button variant="primary">Save Changes</Button>
        </div>
      </div>
    </>
  );
};
