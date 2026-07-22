import React, { useState } from 'react';
import { X, Columns, Check, Settings, Info } from 'lucide-react';
import { Button } from '../../../components/Button';
import { useBoardStore } from '../state/useBoardStore';

const COLORS = [
  { id: 'gray', class: 'bg-gray-200' },
  { id: 'blue', class: 'bg-blue-500' },
  { id: 'yellow', class: 'bg-yellow-400' },
  { id: 'purple', class: 'bg-purple-600' },
  { id: 'green', class: 'bg-green-400' },
  { id: 'pink', class: 'bg-pink-400' },
  { id: 'orange', class: 'bg-orange-500' },
  { id: 'teal', class: 'bg-teal-400' },
];

export const CreateColumnModal = ({ isOpen, onClose }) => {
  const { createColumn, board } = useBoardStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState('purple');
  const [positionType, setPositionType] = useState('end'); // 'end', 'start', 'specific'
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      let finalPosition = null;
      if (positionType === 'start') {
        const firstCol = board?.columns?.[0];
        finalPosition = firstCol ? firstCol.position / 2.0 : 1000.0;
      }

      const payload = {
        title: title.trim(),
        description: description.trim(),
        color: selectedColor,
      };
      if (finalPosition) {
        payload.position = finalPosition;
      }

      await createColumn(board.id, payload);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[60]" onClick={onClose} />
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-xl pointer-events-auto flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="flex items-start justify-between p-6 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <Columns className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 leading-tight">Create New Column</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Add a new column to organize your workflow
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors -mr-2 -mt-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-2 overflow-y-auto custom-scrollbar flex-1">
            <form id="create-column-form" onSubmit={handleSubmit} className="space-y-6">
              
              {/* Title */}
              <div>
                <div className="flex justify-between mb-1.5">
                  <label className="block text-sm font-semibold text-gray-900">
                    Column Title <span className="text-red-500">*</span>
                  </label>
                  <span className="text-xs text-gray-400">{title.length} / 30</span>
                </div>
                <input
                  type="text"
                  required
                  maxLength={30}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Testing, Blocked, Backlog"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm"
                  autoFocus
                />
              </div>

              {/* Description */}
              <div>
                <div className="flex justify-between mb-1.5">
                  <label className="block text-sm font-semibold text-gray-900">
                    Description <span className="text-gray-500 font-normal">(optional)</span>
                  </label>
                  <span className="text-xs text-gray-400">{description.length} / 120</span>
                </div>
                <textarea
                  maxLength={120}
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the purpose of this column..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm resize-none"
                />
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Column Color
                </label>
                <div className="flex items-center gap-3">
                  {COLORS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedColor(c.id)}
                      className={`w-8 h-8 rounded-full ${c.class} flex items-center justify-center transition-transform hover:scale-110 ${selectedColor === c.id ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                    >
                      {selectedColor === c.id && <Check className="w-4 h-4 text-white" />}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">Choose a color to easily identify this column</p>
              </div>

              {/* Position */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Column Position
                </label>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="radio" 
                      name="position" 
                      checked={positionType === 'end'} 
                      onChange={() => setPositionType('end')}
                      className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700 font-medium">Add to the end (rightmost)</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="radio" 
                      name="position" 
                      checked={positionType === 'start'} 
                      onChange={() => setPositionType('start')}
                      className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700 font-medium">Add to the beginning (leftmost)</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer opacity-60">
                    <input 
                      type="radio" 
                      name="position" 
                      disabled
                      checked={positionType === 'specific'} 
                      onChange={() => setPositionType('specific')}
                      className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700 font-medium">Choose specific position</span>
                  </label>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 flex items-center gap-3 mt-4">
                <Info className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                <p className="text-xs text-indigo-800 font-medium">
                  Tip: You can reorder columns anytime by drag & drop.
                </p>
              </div>

            </form>
          </div>

          {/* Footer */}
          <div className="p-6 pt-4 flex items-center justify-between bg-white rounded-b-xl border-t border-gray-100 mt-2">
            <button type="button" className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors">
              <Settings className="w-4 h-4" />
              More options
              <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            <div className="flex items-center gap-3">
              <Button type="button" variant="secondary" onClick={onClose} className="px-6 py-2.5 bg-white border border-gray-300">
                Cancel
              </Button>
              <Button type="submit" form="create-column-form" variant="primary" disabled={loading || !title.trim()} className="px-6 py-2.5 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition-colors">
                {loading ? 'Creating...' : 'Create Column'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
