import React from 'react';
import { useDrop } from 'react-dnd';
import { Plus } from 'lucide-react';
import { ItemTypes } from '../dnd/ItemTypes';
import { CardPreview } from './CardPreview';
import { useBoardStore } from '../state/useBoardStore';

export const Column = ({ column }) => {
  const { moveCardOptimistic, syncMoveCard } = useBoardStore();

  const [{ isOver }, dropRef] = useDrop(() => ({
    accept: ItemTypes.CARD,
    drop: (item, monitor) => {
      // If we are dropping on the column itself (not on a specific card)
      // we just append it to the end.
      if (!monitor.didDrop()) {
        const targetColId = column.id;
        const newIndex = column.cards.length; // Drop at the end
        if (item.sourceColId === targetColId && item.index === newIndex) return;
        
        moveCardOptimistic(item.id, item.sourceColId, targetColId, newIndex);
        syncMoveCard(item.id, item.sourceColId, targetColId, newIndex);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver({ shallow: true }),
    }),
  }), [column.id, column.cards.length, moveCardOptimistic, syncMoveCard]);

  // Map colors from mock data to Tailwind classes
  const getBorderColor = (color) => {
    switch (color) {
      case 'gray': return 'border-t-gray-400';
      case 'yellow': return 'border-t-yellow-400';
      case 'blue': return 'border-t-blue-500';
      case 'green': return 'border-t-green-500';
      default: return 'border-t-gray-300';
    }
  };

  return (
    <div 
      ref={dropRef} 
      className={`w-[320px] flex-shrink-0 flex flex-col bg-bg-primary rounded-t-lg rounded-b-lg ${isOver ? 'bg-gray-50' : ''}`}
    >
      {/* Column Header */}
      <div className={`pt-4 pb-3 px-2 border-t-[3px] flex items-center justify-between ${getBorderColor(column.color)}`}>
        <h3 className="font-semibold text-text-primary">{column.title}</h3>
        <span className="text-gray-400 text-sm font-medium">{column.count}</span>
      </div>
      
      {/* Cards Container */}
      <div className="flex-1 flex flex-col gap-3 px-1 min-h-[150px]">
        {column.cards.map((card, index) => (
          <CardPreview 
            key={card.id} 
            card={card} 
            columnId={column.id} 
            index={index} 
          />
        ))}
        
        {/* Add Card Button */}
        <button className="flex items-center justify-center gap-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 py-3 rounded-md transition-colors w-full mt-2 border border-dashed border-transparent hover:border-gray-300">
          <Plus className="w-4 h-4" />
          <span className="text-sm font-medium">Add card</span>
        </button>
      </div>
    </div>
  );
};
