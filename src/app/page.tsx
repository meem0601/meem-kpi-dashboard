'use client';

import { useEffect, useState } from 'react';
import KPICard from '@/components/KPICard';
import PipelineCard from '@/components/PipelineCard';
import RevenueChart from '@/components/RevenueChart';
import TaskList from '@/components/TaskList';

// 目標値（ハードコード - 後で設定画面を作成）
const TARGETS = {
  sales: {
    revenue: 5000000,  // 500万円
    deals: 5,
  },
  realestate: {
    revenue: 3000000,  // 300万円
    contracts: 10,
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
  revenue: number;
  contracts: number;
  pipeline: {
    prospects: number;
    expectedThisMonth: number;
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">データを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="text-xl mb-2">⚠️ エラーが発生しました</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            再読み込み
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            🏢 MEEM KPIダッシュボード
          </h1>
          <span className="text-lg text-gray-600">{getCurrentMonth()}</span>
        </div>

        {/* KPI Cards - Revenue */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <KPICard
            title="Sales売上"
            current={salesKPI?.revenue || 0}
            target={TARGETS.sales.revenue}
            color="blue"
          />
          <KPICard
            title="不動産AS売上"
            current={realestateKPI?.revenue || 0}
            target={TARGETS.realestate.revenue}
            color="green"
          />
          <KPICard
            title="人材売上"
            current={hrKPI?.revenue || 0}
            target={TARGETS.hr.revenue}
            color="purple"
          />
        </div>

        {/* KPI Cards - Deals/Contracts */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <KPICard
            title="Sales成約数"
            current={salesKPI?.deals || 0}
            target={TARGETS.sales.deals}
            unit="件"
            color="blue"
          />
          <KPICard
            title="不動産契約数"
            current={realestateKPI?.contracts || 0}
            target={TARGETS.realestate.contracts}
            unit="件"
            color="green"
          />
          <KPICard
            title="人材成約数"
            current={hrKPI?.contracts || 0}
            target={TARGETS.hr.contracts}
            unit="件"
            color="purple"
          />
        </div>

        {/* Pipeline Cards */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <PipelineCard
            title="【Sales】パイプライン"
            items={[
              { label: '面談待ち', count: salesKPI?.pipeline.pending || 0, color: 'bg-blue-400' },
              { label: '検討中', count: salesKPI?.pipeline.considering || 0, color: 'bg-blue-500' },
              { label: '着金待ち', count: salesKPI?.pipeline.waitingPayment || 0, color: 'bg-blue-600' },
            ]}
          />
          <PipelineCard
            title="【不動産AS】パイプライン"
            items={[
              { label: '見込み(新規)', count: realestateKPI?.pipeline.prospects || 0, color: 'bg-green-400' },
              { label: '申込見込', count: realestateKPI?.pipeline.expectedThisMonth || 0, color: 'bg-green-500' },
              { label: '審査待ち', count: realestateKPI?.pipeline.awaitingReview || 0, color: 'bg-green-600' },
            ]}
          />
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

        {/* Revenue Chart */}
        {salesKPI && realestateKPI && hrKPI && (
          <div className="mb-4">
            <RevenueChart
              salesData={salesKPI.monthlyRevenue}
              realestateData={realestateKPI.monthlyRevenue}
              hrData={hrKPI.monthlyRevenue}
            />
          </div>
        )}

        {/* Tasks and Links */}
        <div className="grid grid-cols-2 gap-4">
          <TaskList tasks={tasks} loading={false} />
          <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">🔗 クイックリンク</h3>
            <div className="space-y-2">
              <a
                href="https://www.notion.so/2e8559b71fa28097b09ec8bc5114604f"
                target="_blank"
                rel="noopener noreferrer"
                className="block px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 text-gray-700"
              >
                📋 タスク管理 →
              </a>
              <a
                href="https://www.notion.so/"
                target="_blank"
                rel="noopener noreferrer"
                className="block px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 text-gray-700"
              >
                📝 MTG議事録 →
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-400 text-xs mt-6">
          Last updated: {new Date().toLocaleString('ja-JP')}
        </div>
      </div>
    </div>
  );
}
