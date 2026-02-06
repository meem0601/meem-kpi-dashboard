'use client';

import { useEffect, useState, useRef } from 'react';

interface KPICardProps {
  title: string;
  current: number;
  target: number;
  unit?: string;
  color?: 'blue' | 'green' | 'purple' | 'orange';
  icon?: string;
  projectedValue?: number;  // 見込売上（オプション）
}

// カウントアップアニメーションフック
function useCountUp(end: number, duration: number = 1500) {
  const [count, setCount] = useState(0);
  const countRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    countRef.current = 0;
    startTimeRef.current = null;
    
    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);
      
      // イージング関数 (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentCount = Math.floor(easeOut * end);
      
      setCount(currentCount);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(animate);
  }, [end, duration]);

  return count;
}

export default function KPICard({ title, current, target, unit = '円', color = 'blue', icon, projectedValue }: KPICardProps) {
  const animatedCurrent = useCountUp(current);
  const animatedProjected = useCountUp(projectedValue || 0);
  const progress = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  
  const colorConfig = {
    blue: {
      gradient: 'from-blue-500 to-blue-600',
      lightBg: 'bg-blue-50',
      progressBg: 'bg-blue-500',
      text: 'text-blue-600',
      icon: '💼',
    },
    green: {
      gradient: 'from-emerald-500 to-green-600',
      lightBg: 'bg-green-50',
      progressBg: 'bg-green-500',
      text: 'text-green-600',
      icon: '🏠',
    },
    purple: {
      gradient: 'from-purple-500 to-violet-600',
      lightBg: 'bg-purple-50',
      progressBg: 'bg-purple-500',
      text: 'text-purple-600',
      icon: '👥',
    },
    orange: {
      gradient: 'from-orange-500 to-amber-600',
      lightBg: 'bg-orange-50',
      progressBg: 'bg-orange-500',
      text: 'text-orange-600',
      icon: '📊',
    },
  };

  const config = colorConfig[color];

  const formatNumber = (num: number) => {
    if (unit === '円' && num >= 10000) {
      return `${(num / 10000).toFixed(1)}万`;
    }
    return num.toLocaleString();
  };

  const getProgressColor = () => {
    if (progress >= 100) return 'bg-gradient-to-r from-green-400 to-green-500';
    if (progress >= 70) return 'bg-gradient-to-r from-yellow-400 to-yellow-500';
    return `bg-gradient-to-r ${config.gradient}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-100 hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
      {/* 背景装飾 */}
      <div className={`absolute top-0 right-0 w-24 h-24 ${config.lightBg} rounded-full -translate-y-8 translate-x-8 group-hover:scale-110 transition-transform duration-300`}></div>
      
      <div className="relative">
        {/* ヘッダー */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">{icon || config.icon}</span>
          <h3 className="text-sm font-semibold text-gray-600">{title}</h3>
        </div>
        
        {/* メイン数値 */}
        <div className="flex items-baseline gap-2 mb-3 flex-wrap">
          {projectedValue !== undefined ? (
            <>
              {/* 見込売上がある場合: 見込（確定）/目標 */}
              <span className={`text-3xl font-bold ${config.text} tabular-nums`}>
                {formatNumber(animatedProjected)}
              </span>
              <span className="text-sm text-gray-500">
                ({formatNumber(animatedCurrent)})
              </span>
              <span className="text-sm text-gray-400">
                / {formatNumber(target)}{unit === '円' ? '円' : unit}
              </span>
            </>
          ) : (
            <>
              {/* 通常表示 */}
              <span className={`text-3xl font-bold ${config.text} tabular-nums`}>
                {formatNumber(animatedCurrent)}
              </span>
              <span className="text-sm text-gray-400">
                / {formatNumber(target)}{unit === '円' ? '円' : unit}
              </span>
            </>
          )}
        </div>
        
        {/* プログレスバー */}
        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
          <div
            className={`h-3 rounded-full ${getProgressColor()} transition-all duration-1000 ease-out`}
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* 達成率 */}
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-gray-400">達成率</span>
          <span className={`text-sm font-bold ${progress >= 100 ? 'text-green-500' : config.text}`}>
            {progress.toFixed(0)}%
            {progress >= 100 && ' 🎉'}
          </span>
        </div>
      </div>
    </div>
  );
}
