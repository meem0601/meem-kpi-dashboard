'use client';

import { useState, useEffect } from 'react';

interface Assignee {
  id: string;
  name: string;
  avatarUrl: string | null;
}

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string | null;
  business: string;
  assignees: Assignee[];
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

const businessColors: Record<string, string> = {
  'コーポレート': 'bg-slate-500',
  '経済圏': 'bg-blue-500',
  '不動産': 'bg-green-500',
  '人材': 'bg-purple-500',
  '結婚相談所': 'bg-pink-500',
};

export default function TaskSection() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
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

  const formatDateLarge = (dateStr: string | null) => {
    if (!dateStr) return { day: '-', weekday: '' };
    const date = new Date(dateStr);
    const weekday = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
    return {
      day: `${date.getMonth() + 1}/${date.getDate()}`,
      weekday: `(${weekday})`,
    };
  };

  const isOverdue = (dateStr: string | null) => {
    if (!dateStr) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(dateStr);
    return dueDate < today;
  };

  const isToday = (dateStr: string | null) => {
    if (!dateStr) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(dateStr);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate.getTime() === today.getTime();
  };

  const handleCardClick = (task: Task) => {
    setSelectedTask(task);
    setEditingTask({
      id: task.id,
      title: task.title,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate || '',
    });
    setError(null);
  };

  const handleCloseModal = () => {
    setSelectedTask(null);
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

      handleCloseModal();
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
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
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
    <>
      <div className="bg-gradient-to-br from-white to-amber-50/30 rounded-xl shadow-lg p-6 border border-amber-100">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <span className="text-2xl">📅</span>
              今週のタスク
            </h3>
            <p className="text-sm text-gray-500 mt-1 ml-9">{getWeekRangeText()}</p>
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
              className="text-sm text-amber-600 hover:text-amber-800 font-medium flex items-center gap-1 transition-colors px-3 py-2 bg-amber-50 rounded-lg hover:bg-amber-100"
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

        {tasks.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <span className="text-5xl mb-4 block">🎉</span>
            <p className="text-lg font-medium">今週の期日のタスクはありません</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map((task) => {
              const dateInfo = formatDateLarge(task.dueDate);
              const overdue = isOverdue(task.dueDate) && task.status !== '完了';
              const today = isToday(task.dueDate);

              return (
                <div
                  key={task.id}
                  onClick={() => handleCardClick(task)}
                  className={`relative p-5 bg-white rounded-xl border-2 transition-all cursor-pointer hover:shadow-lg hover:scale-[1.02] ${
                    overdue
                      ? 'border-red-300 bg-red-50/30'
                      : today
                      ? 'border-amber-300 bg-amber-50/30'
                      : task.status === '完了'
                      ? 'border-green-200 opacity-60'
                      : 'border-gray-100 hover:border-amber-200'
                  }`}
                >
                  {/* 事業カラーバー */}
                  {task.business && (
                    <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-xl ${businessColors[task.business] || 'bg-gray-400'}`} />
                  )}

                  {/* 期日（大きく表示） */}
                  <div className={`text-right mb-3 ${overdue ? 'text-red-600' : today ? 'text-amber-600' : 'text-gray-500'}`}>
                    <span className="text-2xl font-bold">{dateInfo.day}</span>
                    <span className="text-lg ml-1">{dateInfo.weekday}</span>
                    {overdue && <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">期限切れ</span>}
                    {today && !overdue && <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">今日</span>}
                  </div>

                  {/* タスク名 */}
                  <h4 className={`text-lg font-semibold text-gray-800 mb-3 line-clamp-2 ${task.status === '完了' ? 'line-through text-gray-500' : ''}`}>
                    {task.title}
                  </h4>

                  {/* ステータス・優先度バッジ */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColors[task.status] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                      {task.status}
                    </span>
                    {task.priority && (
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${priorityColors[task.priority] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                        {task.priority}
                      </span>
                    )}
                  </div>

                  {/* 担当者 */}
                  {task.assignees && task.assignees.length > 0 && (
                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                      <div className="flex -space-x-2">
                        {task.assignees.slice(0, 3).map((assignee) => (
                          <div key={assignee.id} className="relative" title={assignee.name}>
                            {assignee.avatarUrl ? (
                              <img
                                src={assignee.avatarUrl}
                                alt={assignee.name}
                                className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-white shadow-sm flex items-center justify-center">
                                <span className="text-white text-xs font-bold">
                                  {assignee.name.charAt(0)}
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                        {task.assignees.length > 3 && (
                          <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white shadow-sm flex items-center justify-center">
                            <span className="text-gray-600 text-xs font-bold">+{task.assignees.length - 3}</span>
                          </div>
                        )}
                      </div>
                      <span className="text-sm text-gray-600 font-medium">
                        {task.assignees.map(a => a.name).join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-400 text-center">
            {tasks.length}件のタスク • カードをクリックして詳細表示
          </p>
        </div>
      </div>

      {/* 詳細モーダル */}
      {selectedTask && editingTask && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={handleCloseModal}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* モーダルヘッダー */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">タスク詳細</h3>
                  <p className="text-sm text-gray-500 mt-1">編集して保存できます</p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* モーダル本体 */}
            <div className="p-6 space-y-5">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              )}

              {/* タスク名 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">タスク名</label>
                <input
                  type="text"
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                  className="w-full px-4 py-3 text-lg border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                />
              </div>

              {/* ステータス */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">ステータス</label>
                <select
                  value={editingTask.status}
                  onChange={(e) => setEditingTask({ ...editingTask, status: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white text-lg"
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              {/* 優先順位 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">優先順位</label>
                <select
                  value={editingTask.priority}
                  onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white text-lg"
                >
                  <option value="">-</option>
                  {PRIORITY_OPTIONS.map((priority) => (
                    <option key={priority} value={priority}>{priority}</option>
                  ))}
                </select>
              </div>

              {/* 期日 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">期日</label>
                <input
                  type="date"
                  value={editingTask.dueDate}
                  onChange={(e) => setEditingTask({ ...editingTask, dueDate: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent text-lg"
                />
              </div>

              {/* 担当者（表示のみ） */}
              {selectedTask.assignees && selectedTask.assignees.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">担当者</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedTask.assignees.map((assignee) => (
                      <div key={assignee.id} className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-2">
                        {assignee.avatarUrl ? (
                          <img
                            src={assignee.avatarUrl}
                            alt={assignee.name}
                            className="w-6 h-6 rounded-full"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                              {assignee.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <span className="text-sm font-medium text-gray-700">{assignee.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 事業 */}
              {selectedTask.business && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">事業</label>
                  <span className={`inline-flex items-center px-3 py-2 rounded-lg text-white font-medium ${businessColors[selectedTask.business] || 'bg-gray-500'}`}>
                    {selectedTask.business}
                  </span>
                </div>
              )}

              {/* Notionリンク */}
              <div>
                <a
                  href={selectedTask.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-800 font-medium transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Notionで開く
                </a>
              </div>
            </div>

            {/* モーダルフッター */}
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={handleCloseModal}
                disabled={saving}
                className="px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50 font-medium"
              >
                キャンセル
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center gap-2 font-medium"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    保存中...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    保存
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
