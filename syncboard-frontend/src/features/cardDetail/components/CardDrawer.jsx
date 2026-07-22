import React, { useMemo, useEffect, useState } from 'react';
import { X, AlignLeft, User, Tag, Clock, Trash2, AlertCircle } from 'lucide-react';
import { useBoardStore } from '../../board/state/useBoardStore';
import { Avatar } from '../../../components/Avatar';
import { Badge } from '../../../components/Badge';
import { Button } from '../../../components/Button';

export const CardDrawer = () => {
  const { board, selectedCardId, setSelectedCard, publishEditStart, publishEditStop, updateCard, deleteCard } = useBoardStore();

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
  
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDesc, setEditedDesc] = useState("");
  const [editedPriority, setEditedPriority] = useState("LOW");

  useEffect(() => {
    if (card) {
      setEditedTitle(card.title || "");
      setEditedDesc(card.description || "");
      setEditedPriority(card.priority || "LOW");
    }
  }, [card]);

  useEffect(() => {
    if (cardId) {
      publishEditStart(cardId);
      return () => {
        publishEditStop(cardId);
      };
    }
  }, [cardId, publishEditStart, publishEditStop]);

  if (!card) return null;

  const handleSave = () => {
    updateCard(card.id, {
      ...card,
      title: editedTitle,
      description: editedDesc,
      priority: editedPriority
    });
    setSelectedCard(null);
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this card?")) {
      deleteCard(card.id);
      setSelectedCard(null);
    }
  };

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
            <input 
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="text-xl font-bold text-gray-900 leading-tight bg-transparent border-b border-transparent focus:border-gray-300 focus:outline-none w-full pb-1"
            />
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
          
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-border bg-gray-50 flex justify-between items-center">
          <button 
            onClick={handleDelete}
            className="text-red-500 hover:text-red-700 flex items-center gap-1 text-sm font-medium p-2 rounded hover:bg-red-50 transition-colors"
          >
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
