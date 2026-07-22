import React, { useState } from 'react';
import { useDrop } from 'react-dnd';
import { Plus, MoreHorizontal, Trash2, Edit2, X } from 'lucide-react';
import { ItemTypes } from '../dnd/ItemTypes';
import { CardPreview } from './CardPreview';
import { CreateCardModal } from './CreateCardModal';
import { useBoardStore } from '../state/useBoardStore';

export const Column = ({ column }) => {
  const { moveCardOptimistic, syncMoveCard, createCard, updateColumn, deleteColumn, searchQuery } = useBoardStore();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  
  const [isAddingCard, setIsAddingCard] = useState(false);

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [{ isOver }, dropRef] = useDrop(() => ({
    accept: ItemTypes.CARD,
    drop: (item, monitor) => {
      // If we are dropping on the column itself (not on a specific card)
      // we just append it to the end.
      if (!monitor.didDrop()) {
        const targetColId = column.id;
        const newIndex = column.cards?.length || 0; // Drop at the end
        if (item.sourceColId === targetColId && item.index === newIndex) return;
        
        moveCardOptimistic(item.id, item.sourceColId, targetColId, newIndex);
        syncMoveCard(item.id, item.sourceColId, targetColId, newIndex);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver({ shallow: true }),
    }),
  }), [column.id, column.cards?.length, moveCardOptimistic, syncMoveCard]);

  const handleTitleSubmit = () => {
    if (editTitle.trim() && editTitle.trim() !== column.title) {
      updateColumn(column.id, editTitle.trim());
    }
    setIsEditingTitle(false);
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this column?")) {
      deleteColumn(column.id);
    }
  };

  // Filter cards by searchQuery
  const filteredCards = (column.cards || []).filter(card => {
    if (!searchQuery) return true;
    const lowerQuery = searchQuery.toLowerCase();
    return card.title?.toLowerCase().includes(lowerQuery) || 
           card.labels?.some(l => l.name.toLowerCase().includes(lowerQuery));
  });

  // Map colors from mock data to Tailwind classes
  const getBorderColor = (color) => {
    switch (color) {
      case 'gray': return 'border-t-gray-400';
      case 'blue': return 'border-t-blue-500';
      case 'yellow': return 'border-t-yellow-400';
      case 'purple': return 'border-t-purple-500';
      case 'green': return 'border-t-green-500';
      case 'pink': return 'border-t-pink-500';
      case 'orange': return 'border-t-orange-500';
      case 'teal': return 'border-t-teal-400';
      default: return 'border-t-gray-300';
    }
  };

  return (
    <div 
      ref={dropRef} 
      className={`w-[320px] flex-shrink-0 flex flex-col bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-gray-200 border-t-[3px] ${getBorderColor(column.color)} ${isOver ? 'bg-gray-50' : ''} h-fit max-h-full pb-3`}
    >
      {/* Column Header */}
      <div className={`pt-4 pb-3 px-4 flex items-center justify-between group`}>
        {isEditingTitle ? (
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleTitleSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleTitleSubmit();
              if (e.key === 'Escape') setIsEditingTitle(false);
            }}
            autoFocus
            className="font-semibold text-text-primary border border-blue-500 rounded px-1 outline-none w-full mr-2"
          />
        ) : (
          <h3 
            className="font-semibold text-text-primary flex-1 cursor-pointer"
            onDoubleClick={() => {
              setEditTitle(column.title);
              setIsEditingTitle(true);
            }}
            title="Double-click to rename"
          >
            {column.title}
          </h3>
        )}
        
        <div className="flex items-center gap-2 relative">
          <span className="text-gray-400 text-sm font-medium">{column.cards?.length || 0}</span>
          
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-gray-400 hover:text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-200"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {isMenuOpen && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setIsMenuOpen(false)}
              ></div>
              <div className="absolute top-full right-0 mt-1 w-40 bg-white border border-gray-200 rounded shadow-lg z-20 py-1">
                <button 
                  onClick={() => {
                    setEditTitle(column.title);
                    setIsEditingTitle(true);
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" /> Rename
                </button>
                <button 
                  onClick={() => {
                    handleDelete();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Cards Container */}
      <div className="flex-1 flex flex-col gap-3 px-3 overflow-y-auto min-h-[50px]">
        {filteredCards.map((card, index) => (
          <CardPreview 
            key={card.id} 
            card={card} 
            columnId={column.id} 
            index={index} 
          />
        ))}
        
        {/* Add Card Modal / Button */}
        {isAddingCard && (
          <CreateCardModal 
            isOpen={isAddingCard} 
            onClose={() => setIsAddingCard(false)} 
            column={column} 
          />
        )}
        <button 
          onClick={() => setIsAddingCard(true)}
          className="flex items-center justify-center gap-2 text-gray-500 hover:text-gray-700 border border-transparent hover:border-dashed hover:border-gray-300 py-2.5 px-3 rounded-lg transition-all w-full mt-1 group"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm font-medium">Add card</span>
        </button>
      </div>
    </div>
  );
};
