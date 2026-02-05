'use client';

interface PipelineItem {
  label: string;
  count: number;
  subLabel?: string;
  color: string;
}

interface PipelineCardProps {
  title: string;
  items: PipelineItem[];
}

export default function PipelineCard({ title, items }: PipelineCardProps) {
  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg p-5 border border-gray-100 hover:shadow-xl transition-all duration-300">
      <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></span>
        {title}
      </h3>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div 
            key={index} 
            className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
              <div>
                <span className="text-sm text-gray-700 font-medium">{item.label}</span>
                {item.subLabel && (
                  <span className="text-xs text-gray-500 ml-2">({item.subLabel})</span>
                )}
              </div>
            </div>
            <span className="text-xl font-bold text-gray-900">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
