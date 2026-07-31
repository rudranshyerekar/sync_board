import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckSquare, Clock, AlertCircle, Filter, Search, Calendar as CalendarIcon, ExternalLink } from 'lucide-react';
import { workspaceApi } from '../../../api/workspaceApi';
import { boardApi } from '../../../api/boardApi';
import { cardApi } from '../../../api/cardApi';
import { useAuthStore } from '../../auth/state/useAuthStore';
import { Avatar } from '../../../components/Avatar';

export const MyTasksView = () => {
  const { user } = useAuthStore();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('MY_TASKS'); // MY_TASKS, ALL, HIGH, DUE_SOON
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchMyTasks = async () => {
      setLoading(true);
      try {
        const workspaces = await workspaceApi.getMyWorkspaces();
        const allTasks = [];

        for (const ws of workspaces) {
          const boards = await boardApi.getBoards(ws.id);
          for (const board of boards) {
            try {
              // Try fetching full hierarchy first if available
              const fullBoard = await boardApi.getFullBoard ? await boardApi.getFullBoard(board.id) : null;
              if (fullBoard && fullBoard.columns) {
                for (const col of fullBoard.columns) {
                  if (col.cards) {
                    for (const card of col.cards) {
                      allTasks.push({
                        ...card,
                        boardId: board.id,
                        boardTitle: board.title,
                        workspaceName: ws.name,
                        columnTitle: col.title
                      });
                    }
                  }
                }
              } else {
                // Fallback to fetching columns and cards sequentially
                const columns = await boardApi.getColumns(board.id);
                for (const col of columns) {
                  const cards = await cardApi.getCards(col.id);
                  for (const card of cards) {
                    allTasks.push({
                      ...card,
                      boardId: board.id,
                      boardTitle: board.title,
                      workspaceName: ws.name,
                      columnTitle: col.title
                    });
                  }
                }
              }
            } catch (e) {
              console.warn(`Could not load cards for board ${board.id}`, e);
            }
          }
        }

        // Sort by deadline or ID
        allTasks.sort((a, b) => {
          if (a.deadline && b.deadline) return new Date(a.deadline) - new Date(b.deadline);
          return (b.id || 0) - (a.id || 0);
        });

        setTasks(allTasks);
      } catch (err) {
        console.error("Failed to fetch my tasks:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyTasks();
  }, []);

  // Filter tasks assigned to current user or show all if workspace task pool is small
  const filteredTasks = tasks.filter(t => {
    const matchesSearch = (t.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (t.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (filter === 'MY_TASKS') return t.assignee?.id === user?.id;
    if (filter === 'HIGH') return t.priority === 'HIGH' || t.priority === 'URGENT';
    if (filter === 'DUE_SOON') {
      if (!t.deadline) return false;
      const daysDiff = (new Date(t.deadline) - new Date()) / (1000 * 3600 * 24);
      return daysDiff <= 3 && daysDiff >= -5;
    }
    return true;
  });

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'URGENT':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-red-100 text-red-700 border border-red-200">Urgent</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-orange-100 text-orange-700 border border-orange-200">High</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-amber-100 text-amber-700 border border-amber-200">Medium</span>;
      case 'LOW':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-green-100 text-green-700 border border-green-200">Low</span>;
      default:
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-gray-100 text-gray-600 border border-gray-200">None</span>;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-bg-primary">
      {/* Header */}
      <header className="px-8 py-6 border-b border-border bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CheckSquare className="w-7 h-7 text-primary" />
            My Tasks & Workspace Actions
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Centralized task tracking across all your collaborative Kanban boards and workspaces.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>
      </header>

      {/* Filter Toolbar */}
      <div className="px-8 py-4 bg-gray-50 border-b border-border flex items-center gap-3">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> Filter Tasks:
        </span>
        <button
          onClick={() => setFilter('MY_TASKS')}
          className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
            filter === 'MY_TASKS' ? 'bg-primary text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
          }`}
        >
          Assigned to Me
        </button>
        <button
          onClick={() => setFilter('ALL')}
          className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
            filter === 'ALL' ? 'bg-primary text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
          }`}
        >
          All Tasks ({tasks.length})
        </button>
        <button
          onClick={() => setFilter('HIGH')}
          className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
            filter === 'HIGH' ? 'bg-red-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
          }`}
        >
          High & Urgent Priority
        </button>
        <button
          onClick={() => setFilter('DUE_SOON')}
          className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
            filter === 'DUE_SOON' ? 'bg-amber-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
          }`}
        >
          Due Soon / Overdue
        </button>
      </div>

      {/* Task Table Content */}
      <main className="flex-1 overflow-y-auto px-8 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400 font-medium">
            Loading tasks across your workspaces...
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-border border-dashed">
            <CheckSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-700">No matching tasks found</h3>
            <p className="text-sm text-gray-400 mt-1">Try changing your filters or add new cards to your project boards.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider border-b border-border">
                <tr>
                  <th className="py-3.5 px-6">Task Name</th>
                  <th className="py-3.5 px-6">Board / Workspace</th>
                  <th className="py-3.5 px-6">Column Status</th>
                  <th className="py-3.5 px-6">Priority</th>
                  <th className="py-3.5 px-6">Deadline</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTasks.map((task, idx) => (
                  <tr key={`${task.boardId}-${task.id || idx}`} className="hover:bg-blue-50/30 transition-colors">
                    <td className="py-4 px-6 font-medium text-gray-900 flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 flex-shrink-0" />
                      <span className="truncate max-w-xs block font-semibold">{task.title}</span>
                    </td>
                    <td className="py-4 px-6 text-gray-600">
                      <div className="font-medium text-gray-800">{task.boardTitle}</div>
                      <div className="text-xs text-gray-400">{task.workspaceName}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                        {task.columnTitle || 'Todo'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {getPriorityBadge(task.priority)}
                    </td>
                    <td className="py-4 px-6 text-gray-600">
                      {task.deadline ? (
                        <div className="flex items-center gap-1 text-xs font-medium">
                          <CalendarIcon className="w-3.5 h-3.5 text-gray-400" />
                          <span>{new Date(task.deadline).toLocaleDateString()}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">No date set</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        to={`/b/${task.boardId}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary hover:text-white rounded-lg transition-colors"
                      >
                        Open <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};
