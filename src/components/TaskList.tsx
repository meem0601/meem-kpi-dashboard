'use client';

import { useState } from 'react';

interface CreatedTask {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string | null;
  business: string;
  url: string | null;
}

const BUSINESS_OPTIONS = ['コーポレート', '経済圏', '不動産', '人材', '結婚相談所'];
const PRIORITY_OPTIONS = ['今すぐやる', '今週やる', '今月やる', '高', '中', '低'];

const priorityColors: Record<string, string> = {
  '今すぐやる': 'bg-red-100 text-red-800 border-red-200',
  '今週やる': 'bg-orange-100 text-orange-800 border-orange-200',
  '今月やる': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  '高': 'bg-red-100 text-red-800 border-red-200',
  '中': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  '低': 'bg-gray-100 text-gray-700 border-gray-200',
};

const businessColors: Record<string, string> = {
  'コーポレート': 'bg-slate-100 text-slate-700 border-slate-200',
  '経済圏': 'bg-blue-100 text-blue-700 border-blue-200',
  '不動産': 'bg-green-100 text-green-700 border-green-200',
  '人材': 'bg-purple-100 text-purple-700 border-purple-200',
  '結婚相談所': 'bg-pink-100 text-pink-700 border-pink-200',
};

interface TaskListProps {
  tasks: any[];
  loading: boolean;
}

export default function TaskList({ tasks, loading }: TaskListProps) {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskBusiness, setNewTaskBusiness] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState(false);
  const [createdTasks, setCreatedTasks] = useState<CreatedTask[]>([]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    const weekday = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
    return `${date.getMonth() + 1}/${date.getDate()}(${weekday})`;
  };

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) return;
    
    setIsCreating(true);
    setCreateError(null);
    setCreateSuccess(false);

    try {
      const response = await fetch('/api/notion/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newTaskTitle.trim(),
          business: newTaskBusiness || undefined,
          dueDate: newTaskDueDate || undefined,
          priority: newTaskPriority || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('タスクの作成に失敗しました');
      }

      const data = await response.json();
      
      // 作成したタスクをローカルstateに追加
      if (data.task) {
        setCreatedTasks(prev => [data.task, ...prev]);
      }

      // フォームをリセット
      setNewTaskTitle('');
      setNewTaskBusiness('');
      setNewTaskDueDate('');
      setNewTaskPriority('');
      setCreateSuccess(true);
      setTimeout(() => setCreateSuccess(false), 3000);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : '作成エラー');
    } finally {
      setIsCreating(false);
    }
  };

  const handleRemoveCreatedTask = (taskId: string) => {
    setCreatedTasks(prev => prev.filter(t => t.id !== taskId));
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg p-5 border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">✨</span>
          新タスク
        </h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg p-5 border border-gray-100 hover:shadow-xl transition-all duration-300">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <span className="text-xl">✨</span>
          新タスク
        </h3>
        <a
          href="https://www.notion.so/2e8559b71fa28097b09ec8bc5114604f"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 transition-colors"
        >
          Notionで開く
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>

      {/* タスク作成フォーム */}
      <div className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
        {/* タスク名 */}
        <div className="mb-3">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="新しいタスクを入力..."
            className="w-full px-4 py-3 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            disabled={isCreating}
          />
        </div>

        {/* 事業・期日・優先度 */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">事業</label>
            <select
              value={newTaskBusiness}
              onChange={(e) => setNewTaskBusiness(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white"
              disabled={isCreating}
            >
              <option value="">-</option>
              {BUSINESS_OPTIONS.map((business) => (
                <option key={business} value={business}>{business}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">期日</label>
            <input
              type="date"
              value={newTaskDueDate}
              onChange={(e) => setNewTaskDueDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              disabled={isCreating}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">優先度</label>
            <select
              value={newTaskPriority}
              onChange={(e) => setNewTaskPriority(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white"
              disabled={isCreating}
            >
              <option value="">-</option>
              {PRIORITY_OPTIONS.map((priority) => (
                <option key={priority} value={priority}>{priority}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 作成ボタン */}
        <button
          onClick={handleCreateTask}
          disabled={isCreating || !newTaskTitle.trim()}
          className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-base font-medium rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
        >
          {isCreating ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              作成中...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              タスクを追加
            </>
          )}
        </button>

        {createError && (
          <p className="text-red-500 text-sm mt-3 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {createError}
          </p>
        )}
        {createSuccess && (
          <p className="text-green-500 text-sm mt-3 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            タスクを作成しました！
          </p>
        )}
      </div>

      {/* 作成済みタスクリスト（このセッションで作成したもののみ） */}
      {createdTasks.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 mb-2 font-medium">今回作成したタスク</p>
          <ul className="space-y-2">
            {createdTasks.map((task, index) => (
              <li 
                key={task.id} 
                className="flex items-start gap-3 p-3 bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all animate-fadeIn"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex-1 min-w-0">
                  {/* タスク名 */}
                  <p className="text-base font-medium text-gray-800 mb-2">{task.title}</p>
                  
                  {/* バッジ */}
                  <div className="flex flex-wrap gap-1.5">
                    {task.business && (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${businessColors[task.business] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                        {task.business}
                      </span>
                    )}
                    {task.priority && (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${priorityColors[task.priority] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                        {task.priority}
                      </span>
                    )}
                    {task.dueDate && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                        {formatDate(task.dueDate)}
                      </span>
                    )}
                  </div>
                </div>

                {/* 削除ボタン */}
                <button
                  onClick={() => handleRemoveCreatedTask(task.id)}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  title="リストから削除"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {createdTasks.length === 0 && (
        <div className="text-center text-gray-400 py-4">
          <span className="text-2xl mb-2 block">📝</span>
          <p className="text-sm">タスクを作成すると、ここに表示されます</p>
        </div>
      )}
    </div>
  );
}
