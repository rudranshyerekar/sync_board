import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, AlertTriangle, ExternalLink } from 'lucide-react';
import { workspaceApi } from '../../../api/workspaceApi';
import { boardApi } from '../../../api/boardApi';

export const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAllTasks = async () => {
      setLoading(true);
      try {
        const workspaces = await workspaceApi.getMyWorkspaces();
        const items = [];
        for (const ws of workspaces) {
          const boards = await boardApi.getBoards(ws.id);
          for (const board of boards) {
            try {
              const fullBoard = await boardApi.getFullBoard ? await boardApi.getFullBoard(board.id) : null;
              if (fullBoard && fullBoard.columns) {
                for (const col of fullBoard.columns) {
                  if (col.cards) {
                    for (const card of col.cards) {
                      if (card.deadline) {
                        items.push({
                          ...card,
                          boardId: board.id,
                          boardTitle: board.title,
                          columnTitle: col.title
                        });
                      }
                    }
                  }
                }
              } else {
                const cols = await boardApi.getColumns(board.id);
                for (const col of cols) {
                  const cards = await boardApi.getCards(board.id, col.id);
                  for (const card of cards) {
                    if (card.deadline) {
                      items.push({
                        ...card,
                        boardId: board.id,
                        boardTitle: board.title,
                        columnTitle: col.title
                      });
                    }
                  }
                }
              }
            } catch (err) {
              console.warn(`Failed loading cards for calendar board ${board.id}`, err);
            }
          }
        }
        setTasks(items);
      } catch (err) {
        console.error("Failed loading calendar tasks:", err);
      } finally {
        setLoading(false);
      }
    };

    loadAllTasks();
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // First day of current month (0 = Sunday, 6 = Saturday)
  const firstDayIndex = new Date(year, month, 1).getDay();
  // Days in current month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Find tasks falling on a specific date
  const getTasksForDay = (day) => {
    const targetStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return tasks.filter(t => t.deadline && t.deadline.startsWith(targetStr));
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-bg-primary">
      {/* Header */}
      <header className="px-8 py-6 border-b border-border bg-white flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarIcon className="w-7 h-7 text-primary" />
            Deadline & Schedule Calendar
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Visual month-by-month itinerary of upcoming card milestones and deliverables.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-gray-50 border border-border p-1.5 rounded-lg">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 hover:bg-white rounded-md text-gray-600 shadow-sm transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="px-4 text-sm font-bold text-gray-800 w-36 text-center">
            {monthNames[month]} {year}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1.5 hover:bg-white rounded-md text-gray-600 shadow-sm transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Calendar Grid */}
      <main className="flex-1 overflow-y-auto p-8 bg-gray-50/50">
        {loading ? (
          <div className="flex items-center justify-center py-24 text-gray-400 font-medium">
            Building calendar schedule from active Kanban boards...
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col min-h-[600px]">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 border-b border-border bg-gray-50 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">
              <div className="py-3 border-r border-border">Sun</div>
              <div className="py-3 border-r border-border">Mon</div>
              <div className="py-3 border-r border-border">Tue</div>
              <div className="py-3 border-r border-border">Wed</div>
              <div className="py-3 border-r border-border">Thu</div>
              <div className="py-3 border-r border-border">Fri</div>
              <div className="py-3">Sat</div>
            </div>

            {/* Day Cells */}
            <div className="grid grid-cols-7 flex-1 divide-x divide-y divide-border">
              {Array.from({ length: firstDayIndex }).map((_, idx) => (
                <div key={`empty-${idx}`} className="bg-gray-50/40 p-2 min-h-[120px]" />
              ))}

              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const dayNumber = idx + 1;
                const dayTasks = getTasksForDay(dayNumber);
                const isToday = new Date().toDateString() === new Date(year, month, dayNumber).toDateString();

                return (
                  <div
                    key={`day-${dayNumber}`}
                    className={`p-2.5 min-h-[120px] transition-colors flex flex-col justify-between ${
                      isToday ? 'bg-blue-50/20 font-bold' : 'hover:bg-gray-50/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                          isToday ? 'bg-primary text-white shadow-md' : 'text-gray-700'
                        }`}>
                          {dayNumber}
                        </span>
                        {dayTasks.length > 0 && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded-full">
                            {dayTasks.length} {dayTasks.length === 1 ? 'task' : 'tasks'}
                          </span>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        {dayTasks.map(t => (
                          <Link
                            key={`${t.boardId}-${t.id}`}
                            to={`/b/${t.boardId}`}
                            className="block p-1.5 rounded bg-indigo-50 border border-indigo-200 hover:border-primary text-left transition-all group"
                          >
                            <div className="text-[11px] font-semibold text-primary truncate group-hover:underline">
                              {t.title}
                            </div>
                            <div className="text-[10px] text-gray-500 flex items-center justify-between mt-0.5">
                              <span className="truncate max-w-[80px]">{t.boardTitle}</span>
                              <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
