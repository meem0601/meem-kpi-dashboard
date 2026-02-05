'use client';

import { useState } from 'react';

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string | null;
  business: string;
  url: string;
}

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
}

export default function TaskList({ tasks, loading }: TaskListProps) {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState(false);

  const priorityColors: Record<string, string> = {
    '今すぐやる': 'bg-red-100 text-red-800 border-red-200',
    '今週やる': 'bg-orange-100 text-orange-800 border-orange-200',
    '今月やる': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    '高': 'bg-red-100 text-red-800 border-red-200',
    '中': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    '低': 'bg-gray-100 text-gray-700 border-gray-200',
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
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
        body: JSON.stringify({ title: newTaskTitle.trim() }),
      });

      if (!response.ok) {
        throw new Error('タスクの作成に失敗しました');
      }

      setNewTaskTitle('');
      setCreateSuccess(true);
      setTimeout(() => setCreateSuccess(false), 3000);
      
      // ページをリロードして新しいタスクを表示
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : '作成エラー');
    } finally {
      setIsCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg p-5 border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <span className="text-xl">📋</span>
          タスク管理
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
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <span className="text-xl">📋</span>
          タスク管理
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
      <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="新しいタスクを入力..."
            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            onKeyPress={(e) => e.key === 'Enter' && handleCreateTask()}
            disabled={isCreating}
          />
          <button
            onClick={handleCreateTask}
            disabled={isCreating || !newTaskTitle.trim()}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1 shadow-md hover:shadow-lg"
          >
            {isCreating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                作成中
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                追加
              </>
            )}
          </button>
        </div>
        {createError && (
          <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {createError}
          </p>
        )}
        {createSuccess && (
          <p className="text-green-500 text-xs mt-2 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            タスクを作成しました！
          </p>
        )}
      </div>

      {/* タスクリスト */}
      {tasks.length === 0 ? (
        <div className="text-center text-gray-500 py-6">
          <span className="text-3xl mb-2 block">✅</span>
          <p className="text-sm">タスクがありません</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {tasks.slice(0, 5).map((task, index) => (
            <li 
              key={task.id} 
              className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all animate-fadeIn"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${priorityColors[task.priority] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                {task.priority || '-'}
              </span>
              <a
                href={task.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-sm text-gray-800 hover:text-blue-600 truncate font-medium transition-colors"
                title={task.title}
              >
                {task.title}
              </a>
              <span className="text-gray-400 text-xs bg-gray-50 px-2 py-1 rounded">
                {formatDate(task.dueDate)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
