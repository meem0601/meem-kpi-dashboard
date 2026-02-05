'use client';

import { useState, useEffect } from 'react';

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string | null;
  business: string;
  url: string;
}

interface EditingTask {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string;
}

const STATUS_OPTIONS = ['未着手', '進行中', '完了'];
const PRIORITY_OPTIONS = ['今すぐやる', '今週やる', '今月やる', '高', '中', '低'];

const priorityColors: Record<string, string> = {
  '今すぐやる': 'bg-red-100 text-red-800 border-red-200',
  '今週やる': 'bg-orange-100 text-orange-800 border-orange-200',
  '今月やる': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  '高': 'bg-red-100 text-red-800 border-red-200',
  '中': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  '低': 'bg-gray-100 text-gray-700 border-gray-200',
};

const statusColors: Record<string, string> = {
  '未着手': 'bg-gray-100 text-gray-700 border-gray-300',
  '進行中': 'bg-blue-100 text-blue-700 border-blue-300',
  '完了': 'bg-green-100 text-green-700 border-green-300',
};

export default function TaskSection() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTask, setEditingTask] = useState<EditingTask | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/notion/tasks?filter=this-week');
      if (!res.ok) throw new Error('Failed to fetch tasks');
      const data = await res.json();
      setTasks(data.tasks || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    const weekday = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
    return `${date.getMonth() + 1}/${date.getDate()}(${weekday})`;
  };

  const isOverdue = (dateStr: string | null) => {
    if (!dateStr) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(dateStr);
    return dueDate < today;
  };

  const handleEdit = (task: Task) => {
    setEditingTask({
      id: task.id,
      title: task.title,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate || '',
    });
    setError(null);
  };

  const handleCancel = () => {
    setEditingTask(null);
    setError(null);
  };

  const handleSave = async () => {
    if (!editingTask) return;

    setSaving(true);
    setError(null);

    try {
      const res = await fetch('/api/notion/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingTask.id,
          title: editingTask.title,
          status: editingTask.status,
          priority: editingTask.priority || null,
          dueDate: editingTask.dueDate || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update task');
      }

      setSuccessMessage('タスクを更新しました');
      setTimeout(() => setSuccessMessage(null), 3000);

      setEditingTask(null);
      await fetchTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update error');
    } finally {
      setSaving(false);
    }
  };

  const getWeekRangeText = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return `${monday.getMonth() + 1}/${monday.getDate()} - ${sunday.getMonth() + 1}/${sunday.getDate()}`;
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-white to-amber-50/30 rounded-xl shadow-lg p-6 border border-amber-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">📅</span>
          今週のタスク
        </h3>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white to-amber-50/30 rounded-xl shadow-lg p-6 border border-amber-100">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <span className="text-2xl">📅</span>
            今週のタスク
          </h3>
          <p className="text-xs text-gray-500 mt-1 ml-9">{getWeekRangeText()}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchTasks}
            className="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
            title="更新"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <a
            href="https://www.notion.so/2e8559b71fa28097b09ec8bc5114604f"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-amber-600 hover:text-amber-800 font-medium flex items-center gap-1 transition-colors px-3 py-2 bg-amber-50 rounded-lg hover:bg-amber-100"
          >
            Notionで開く
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>

      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {successMessage}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {tasks.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          <span className="text-4xl mb-3 block">🎉</span>
          <p className="text-sm font-medium">今週の期日のタスクはありません</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`p-4 bg-white rounded-xl border transition-all ${
                editingTask?.id === task.id
                  ? 'border-amber-400 shadow-md ring-2 ring-amber-100'
                  : 'border-gray-100 hover:border-gray-200 hover:shadow-sm'
              } ${task.status === '完了' ? 'opacity-60' : ''}`}
            >
              {editingTask?.id === task.id ? (
                // 編集モード
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">タスク名</label>
                    <input
                      type="text"
                      value={editingTask.title}
                      onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">ステータス</label>
                      <select
                        value={editingTask.status}
                        onChange={(e) => setEditingTask({ ...editingTask, status: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent text-sm bg-white"
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">優先順位</label>
                      <select
                        value={editingTask.priority}
                        onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent text-sm bg-white"
                      >
                        <option value="">-</option>
                        {PRIORITY_OPTIONS.map((priority) => (
                          <option key={priority} value={priority}>{priority}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">期日</label>
                      <input
                        type="date"
                        value={editingTask.dueDate}
                        onChange={(e) => setEditingTask({ ...editingTask, dueDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={handleCancel}
                      disabled={saving}
                      className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                    >
                      キャンセル
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-4 py-2 text-sm bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center gap-2"
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          保存中...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          保存
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                // 表示モード
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium border ${statusColors[task.status] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                        {task.status}
                      </span>
                      {task.priority && (
                        <span className={`px-2 py-0.5 rounded text-xs font-medium border ${priorityColors[task.priority] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                          {task.priority}
                        </span>
                      )}
                    </div>
                    <p className={`text-sm font-medium text-gray-800 truncate ${task.status === '完了' ? 'line-through' : ''}`} title={task.title}>
                      {task.title}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-1 rounded ${
                      isOverdue(task.dueDate) && task.status !== '完了'
                        ? 'bg-red-100 text-red-700 font-medium'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {formatDate(task.dueDate)}
                    </span>
                    <button
                      onClick={() => handleEdit(task)}
                      className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                      title="編集"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-400 text-center">
          {tasks.length}件のタスク • クリックで直接編集
        </p>
      </div>
    </div>
  );
}
