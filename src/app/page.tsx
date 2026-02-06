'use client';

import { useEffect, useState } from 'react';
import KPICard from '@/components/KPICard';
import PipelineCard from '@/components/PipelineCard';
import RevenueChart from '@/components/RevenueChart';
import TaskList from '@/components/TaskList';

// Skeleton Components for loading state
function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-100">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
      </div>
      <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-3"></div>
      <div className="h-2 w-full bg-gray-100 rounded-full mb-2">
        <div className="h-2 w-1/2 bg-gray-200 rounded-full animate-pulse"></div>
      </div>
      <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
    </div>
  );
}

function SkeletonPipelineCard() {
  return (
    <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-100">
      <div className="h-4 w-36 bg-gray-200 rounded animate-pulse mb-4"></div>
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="h-6 w-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
import TaskSection from '@/components/TaskSection';

// 目標値（ハードコード - 後で設定画面を作成）
const TARGETS = {
  sales: {
    revenue: 15000000,  // 1500万円
    deals: 30,
  },
  realestate: {
    revenue: 9000000,  // 900万円
    contracts: 60,
  },
  hr: {
    revenue: 2000000,  // 200万円
    contracts: 3,
  },
};

interface SalesKPI {
  revenue: number;
  deals: number;
  pipeline: {
    pending: number;
    considering: number;
    waitingPayment: number;
  };
  monthlyRevenue: { month: string; revenue: number }[];
}

interface RealestateKPI {
  revenue: number;           // 確定売上
  projectedRevenue: number;  // 見込売上
  contracts: number;
  pipeline: {
    prospects: number;
    newProspects: number;
    applications: number;
    awaitingReview: number;
  };
  monthlyRevenue: { month: string; revenue: number }[];
}

interface HRKPI {
  revenue: number;
  contracts: number;
  pipeline: {
    prospects: number;
    documentScreening: number;
    interviewing: number;
    offerPending: number;
  };
  monthlyRevenue: { month: string; revenue: number }[];
}

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string | null;
  business: string;
  url: string;
}

export default function Dashboard() {
  const [salesKPI, setSalesKPI] = useState<SalesKPI | null>(null);
  const [realestateKPI, setRealestateKPI] = useState<RealestateKPI | null>(null);
  const [hrKPI, setHRKPI] = useState<HRKPI | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [salesRes, realestateRes, hrRes, tasksRes] = await Promise.all([
          fetch('/api/kpi/sales'),
          fetch('/api/kpi/realestate'),
          fetch('/api/kpi/hr'),
          fetch('/api/notion/tasks'),
        ]);

        if (!salesRes.ok || !realestateRes.ok || !hrRes.ok) {
          throw new Error('Failed to fetch KPI data');
        }

        const [salesData, realestateData, hrData, tasksData] = await Promise.all([
          salesRes.json(),
          realestateRes.json(),
          hrRes.json(),
          tasksRes.json(),
        ]);

        setSalesKPI(salesData);
        setRealestateKPI(realestateData);
        setHRKPI(hrData);
        setTasks(tasksData.tasks || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}年${now.getMonth() + 1}月`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
        {/* 背景装飾 */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 -left-40 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-green-400/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 p-6 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">📊</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  MEEM KPIダッシュボード
                </h1>
                <p className="text-sm text-gray-500">リアルタイム業績管理</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-white/80 backdrop-blur rounded-xl shadow-md border border-gray-100">
                <span className="text-lg font-semibold text-gray-700">📅 {getCurrentMonth()}</span>
              </div>
              <div className="p-2 bg-white/80 backdrop-blur rounded-xl shadow-md border border-gray-100">
                <div className="animate-spin w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* KPI Cards Skeleton - Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={`kpi-1-${i}`} />
            ))}
          </div>

          {/* KPI Cards Skeleton - Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={`kpi-2-${i}`} />
            ))}
          </div>

          {/* Pipeline Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
            {[1, 2, 3].map((i) => (
              <SkeletonPipelineCard key={`pipeline-${i}`} />
            ))}
          </div>

          {/* Chart Skeleton */}
          <div className="mb-5">
            <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-100">
              <div className="h-5 w-32 bg-gray-200 rounded animate-pulse mb-4"></div>
              <div className="h-64 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
                <span className="text-gray-400">グラフを読み込み中...</span>
              </div>
            </div>
          </div>

          {/* Bottom Section Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-100">
              <div className="h-5 w-24 bg-gray-200 rounded animate-pulse mb-4"></div>
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={`task-${i}`} className="h-12 bg-gray-100 rounded-lg animate-pulse"></div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-100">
              <div className="h-5 w-28 bg-gray-200 rounded animate-pulse mb-4"></div>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={`link-${i}`} className="h-14 bg-gray-100 rounded-xl animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900/50 to-slate-900 flex items-center justify-center">
        <div className="text-center bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
          <div className="text-5xl mb-4">⚠️</div>
          <p className="text-xl text-white font-semibold mb-2">エラーが発生しました</p>
          <p className="text-white/60 text-sm mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl font-medium"
          >
            再読み込み
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
      {/* 背景装飾 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-green-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">📊</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                MEEM KPIダッシュボード
              </h1>
              <p className="text-sm text-gray-500">リアルタイム業績管理</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-white/80 backdrop-blur rounded-xl shadow-md border border-gray-100">
              <span className="text-lg font-semibold text-gray-700">📅 {getCurrentMonth()}</span>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="p-2 bg-white/80 backdrop-blur rounded-xl shadow-md border border-gray-100 hover:bg-white transition-colors"
              title="更新"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

        {/* KPI Cards - Revenue */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
          <div className="animate-slideUp" style={{ animationDelay: '0ms' }}>
            <KPICard
              title="Sales売上"
              current={salesKPI?.revenue || 0}
              target={TARGETS.sales.revenue}
              color="blue"
              icon="💼"
            />
          </div>
          <div className="animate-slideUp" style={{ animationDelay: '100ms' }}>
            <KPICard
              title="不動産AS売上"
              current={realestateKPI?.revenue || 0}
              target={TARGETS.realestate.revenue}
              color="green"
              icon="🏠"
              projectedValue={realestateKPI?.projectedRevenue}
            />
          </div>
          <div className="animate-slideUp" style={{ animationDelay: '200ms' }}>
            <KPICard
              title="人材売上"
              current={hrKPI?.revenue || 0}
              target={TARGETS.hr.revenue}
              color="purple"
              icon="👥"
            />
          </div>
        </div>

        {/* KPI Cards - Deals/Contracts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
          <div className="animate-slideUp" style={{ animationDelay: '150ms' }}>
            <KPICard
              title="Sales成約数"
              current={salesKPI?.deals || 0}
              target={TARGETS.sales.deals}
              unit="件"
              color="blue"
              icon="✅"
            />
          </div>
          <div className="animate-slideUp" style={{ animationDelay: '250ms' }}>
            <KPICard
              title="不動産契約数"
              current={realestateKPI?.contracts || 0}
              target={TARGETS.realestate.contracts}
              unit="件"
              color="green"
              icon="📝"
            />
          </div>
          <div className="animate-slideUp" style={{ animationDelay: '350ms' }}>
            <KPICard
              title="人材成約数"
              current={hrKPI?.contracts || 0}
              target={TARGETS.hr.contracts}
              unit="件"
              color="purple"
              icon="🤝"
            />
          </div>
        </div>

        {/* Pipeline Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
          <div className="animate-slideUp" style={{ animationDelay: '200ms' }}>
            <PipelineCard
              title="【Sales】パイプライン"
              items={[
                { label: '面談待ち', count: salesKPI?.pipeline.pending || 0, color: 'bg-blue-400' },
                { label: '検討中', count: salesKPI?.pipeline.considering || 0, color: 'bg-blue-500' },
                { label: '着金待ち', count: salesKPI?.pipeline.waitingPayment || 0, color: 'bg-blue-600' },
              ]}
            />
          </div>
          <div className="animate-slideUp" style={{ animationDelay: '300ms' }}>
            <PipelineCard
              title="【不動産AS】パイプライン"
              items={[
                { label: '見込み顧客', count: realestateKPI?.pipeline.prospects || 0, subLabel: `新規 ${realestateKPI?.pipeline.newProspects || 0}`, color: 'bg-green-400' },
                { label: '申込', count: realestateKPI?.pipeline.applications || 0, color: 'bg-green-500' },
                { label: '審査待ち', count: realestateKPI?.pipeline.awaitingReview || 0, color: 'bg-green-600' },
              ]}
            />
          </div>
          <div className="animate-slideUp" style={{ animationDelay: '400ms' }}>
            <PipelineCard
              title="【人材】パイプライン"
              items={[
                { label: '見込み(新規)', count: hrKPI?.pipeline.prospects || 0, color: 'bg-purple-400' },
                { label: '書類推薦中', count: hrKPI?.pipeline.documentScreening || 0, color: 'bg-purple-500' },
                { label: '面接中', count: hrKPI?.pipeline.interviewing || 0, color: 'bg-purple-600' },
                { label: '内定中', count: hrKPI?.pipeline.offerPending || 0, color: 'bg-purple-700' },
              ]}
            />
          </div>
        </div>

        {/* Revenue Chart */}
        {salesKPI && realestateKPI && hrKPI && (
          <div className="mb-5 animate-slideUp" style={{ animationDelay: '300ms' }}>
            <RevenueChart
              salesData={salesKPI.monthlyRevenue}
              realestateData={realestateKPI.monthlyRevenue}
              hrData={hrKPI.monthlyRevenue}
            />
          </div>
        )}

        {/* This Week's Tasks Section */}
        <div className="mb-5 animate-slideUp" style={{ animationDelay: '320ms' }}>
          <TaskSection />
        </div>

        {/* Tasks and Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="animate-slideUp" style={{ animationDelay: '350ms' }}>
            <TaskList tasks={tasks} loading={false} />
          </div>
          <div className="animate-slideUp" style={{ animationDelay: '400ms' }}>
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg p-5 border border-gray-100 hover:shadow-xl transition-all duration-300">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <span className="text-xl">🔗</span>
                クイックリンク
              </h3>
              <div className="space-y-3">
                <a
                  href="https://www.notion.so/2e8559b71fa28097b09ec8bc5114604f"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl hover:from-blue-100 hover:to-indigo-100 text-gray-700 transition-all border border-blue-100 group"
                >
                  <span className="text-xl group-hover:scale-110 transition-transform">📋</span>
                  <span className="font-medium">タスク管理</span>
                  <svg className="w-4 h-4 ml-auto text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
                <a
                  href="https://www.notion.so/2e8559b71fa2808c8b97000b74435c7c"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl hover:from-purple-100 hover:to-pink-100 text-gray-700 transition-all border border-purple-100 group"
                >
                  <span className="text-xl group-hover:scale-110 transition-transform">📝</span>
                  <span className="font-medium">MTG議事録</span>
                  <svg className="w-4 h-4 ml-auto text-gray-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
                <a
                  href="/links"
                  className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl hover:from-green-100 hover:to-emerald-100 text-gray-700 transition-all border border-green-100 group"
                >
                  <span className="text-xl group-hover:scale-110 transition-transform">🔖</span>
                  <span className="font-medium">リンク集</span>
                  <svg className="w-4 h-4 ml-auto text-gray-400 group-hover:text-green-500 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-400 text-xs mt-8 py-4 border-t border-gray-100">
          <p>Last updated: {new Date().toLocaleString('ja-JP')}</p>
          <p className="mt-1">Powered by Notion & Airtable</p>
        </div>
      </div>
    </div>
  );
}
