'use client';

interface KPICardProps {
  title: string;
  current: number;
  target: number;
  unit?: string;
  color?: 'blue' | 'green' | 'purple' | 'orange';
}

export default function KPICard({ title, current, target, unit = '円', color = 'blue' }: KPICardProps) {
  const progress = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
  };

  const formatNumber = (num: number) => {
    if (unit === '円' && num >= 10000) {
      return `${(num / 10000).toFixed(1)}万`;
    }
    return num.toLocaleString();
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
      <h3 className="text-sm font-medium text-gray-500 mb-2">{title}</h3>
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-2xl font-bold text-gray-900">
          {formatNumber(current)}
        </span>
        <span className="text-sm text-gray-500">
          / {formatNumber(target)}{unit === '円' ? '円' : unit}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full ${colorClasses[color]} transition-all duration-500`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="text-right text-xs text-gray-500 mt-1">
        {progress.toFixed(0)}%
      </div>
    </div>
  );
}
