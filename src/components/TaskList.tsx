'use client';

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
  const priorityColors: Record<string, string> = {
    '今すぐやる': 'bg-red-100 text-red-800',
    '今週やる': 'bg-orange-100 text-orange-800',
    '今月やる': 'bg-yellow-100 text-yellow-800',
    '高': 'bg-red-100 text-red-800',
    '中': 'bg-yellow-100 text-yellow-800',
    '低': 'bg-gray-100 text-gray-800',
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3">📋 タスク管理</h3>
        <div className="text-center text-gray-500 py-4">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-medium text-gray-700">📋 タスク管理</h3>
        <a
          href="https://www.notion.so/2e8559b71fa28097b09ec8bc5114604f"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-600 hover:text-blue-800"
        >
          Notionで開く →
        </a>
      </div>
      {tasks.length === 0 ? (
        <div className="text-center text-gray-500 py-4">タスクがありません</div>
      ) : (
        <ul className="space-y-2">
          {tasks.slice(0, 5).map((task) => (
            <li key={task.id} className="flex items-center gap-2 text-sm">
              <span className={`px-2 py-0.5 rounded text-xs ${priorityColors[task.priority] || 'bg-gray-100 text-gray-800'}`}>
                {task.priority || '-'}
              </span>
              <a
                href={task.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-gray-900 hover:text-blue-600 truncate"
                title={task.title}
              >
                {task.title}
              </a>
              <span className="text-gray-500 text-xs">
                {formatDate(task.dueDate)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
