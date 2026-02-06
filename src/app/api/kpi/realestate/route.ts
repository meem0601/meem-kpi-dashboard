import { NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { realestateBase, getCurrentMonthRange, getMonthRange, getLast12Months, toNumber } from '@/lib/airtable';

// 60秒キャッシュ
export const revalidate = 60;

// 売上・成約カウントで除外するステータス
const REVENUE_EXCLUDED_STATUSES = [
  '案件登録',
  '内見',
  '申込済み_審査中',
  '案件登録後キャンセル',
  '内見登録後キャンセル',
  '申込後キャンセル',
  '審査落ち',
];

// 申込カウントで除外するステータス（案件登録/内見/キャンセル系のみ）
const APPLICATION_EXCLUDED_STATUSES = [
  '案件登録',
  '内見',
  '案件登録後キャンセル',
  '内見登録後キャンセル',
];

interface RealestateKPI {
  revenue: number;
  contracts: number;
  pipeline: {
    prospects: number;        // 見込み顧客数
    newProspects: number;     // 新規見込み数（当月案件登録）
    applications: number;     // 申込数（当月最終申込日、審査中・審査落ち含む）
    awaitingReview: number;   // 審査待ち
  };
  monthlyRevenue: { month: string; revenue: number }[];
}

export async function GET() {
  try {
    const { start, end } = getCurrentMonthRange();
    
    // Fetch all records from 案件管理 table
    const records = await realestateBase('案件管理').select({
      fields: ['ステータス', '最終申込日', 'AD(税抜)', '仲介手数料(税抜)', '案件登録日', '顧客獲得ルート'],
    }).all();

    let revenue = 0;
    let contracts = 0;
    let prospects = 0;       // 見込み顧客（案件登録/内見）
    let newProspects = 0;    // 新規見込み（当月案件登録）
    let applications = 0;    // 申込（当月最終申込日、除外ステータス以外）
    let awaitingReview = 0;

    records.forEach((record) => {
      const status = record.get('ステータス') as string;
      const applicationDate = record.get('最終申込日') as string;
      const registrationDate = record.get('案件登録日') as string;
      const ad = toNumber(record.get('AD(税抜)'));
      const commission = toNumber(record.get('仲介手数料(税抜)'));

      // 売上・成約数: ステータスが除外リストに含まれない + 最終申込日が当月
      // 除外ステータス以外で、最終申込日が当月内の場合にカウント
      if (!REVENUE_EXCLUDED_STATUSES.includes(status) && applicationDate && applicationDate >= start && applicationDate <= end) {
        revenue += ad + commission;
        contracts++;
      }

      // パイプライン
      // 見込み顧客: ステータス=案件登録/内見/内見登録後キャンセル/申込後キャンセル/審査落ち
      // ※顧客獲得ルート=撮影は除外
      const acquisitionRoute = record.get('顧客獲得ルート') as string;
      if ((status === '案件登録' || status === '内見' || status === '内見登録後キャンセル' || status === '申込後キャンセル' || status === '審査落ち') && acquisitionRoute !== '撮影') {
        prospects++;
      }

      // 新規見込み: 案件登録日が当月
      if (registrationDate && registrationDate >= start && registrationDate <= end) {
        newProspects++;
      }

      // 申込: ステータスが除外リスト以外 + 最終申込日が当月（審査中・審査落ちも含む）
      if (!APPLICATION_EXCLUDED_STATUSES.includes(status) && applicationDate && applicationDate >= start && applicationDate <= end) {
        applications++;
      }

      // 審査待ち: ステータス="申込済み_審査中"
      if (status === '申込済み_審査中') {
        awaitingReview++;
      }
    });

    // 月次推移（直近12ヶ月）
    const months = getLast12Months();
    const monthlyRevenue = months.map(({ year, month, label }) => {
      const { start: mStart, end: mEnd } = getMonthRange(year, month);
      let monthRev = 0;

      records.forEach((record) => {
        const status = record.get('ステータス') as string;
        const applicationDate = record.get('最終申込日') as string;
        const ad = toNumber(record.get('AD(税抜)'));
        const commission = toNumber(record.get('仲介手数料(税抜)'));

        if (!REVENUE_EXCLUDED_STATUSES.includes(status) && applicationDate && applicationDate >= mStart && applicationDate <= mEnd) {
          monthRev += ad + commission;
        }
      });

      return { month: label, revenue: monthRev };
    });

    const data: RealestateKPI = {
      revenue,
      contracts,
      pipeline: {
        prospects,
        newProspects,
        applications,
        awaitingReview,
      },
      monthlyRevenue,
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error('Realestate KPI Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Realestate KPI' },
      { status: 500 }
    );
  }
}
