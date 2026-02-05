'use client';

interface PipelineItem {
  label: string;
  count: number;
  color: string;
}

interface PipelineCardProps {
  title: string;
  items: PipelineItem[];
}

export default function PipelineCard({ title, items }: PipelineCardProps) {
  const maxCount = Math.max(...items.map(item => item.count), 1);

  return (
    <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
      <h3 className="text-sm font-medium text-gray-700 mb-3">{title}</h3>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-20 text-xs text-gray-600 truncate" title={item.label}>
              {item.label}
            </div>
            <div className="flex-1 bg-gray-100 rounded-full h-4 relative">
              <div
                className={`h-4 rounded-full ${item.color} transition-all duration-500`}
                style={{ width: `${(item.count / maxCount) * 100}%`, minWidth: item.count > 0 ? '8px' : '0' }}
              />
            </div>
            <div className="w-8 text-right text-sm font-medium text-gray-900">
              {item.count}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
