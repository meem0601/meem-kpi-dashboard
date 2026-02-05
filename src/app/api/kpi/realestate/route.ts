import { NextResponse } from 'next/server';
import { realestateBase, getCurrentMonthRange, getMonthRange, getLast12Months, toNumber } from '@/lib/airtable';

// 除外するステータスのリスト
const EXCLUDED_STATUSES = [
  '案件登録',
  '内見',
  '申込済み_審査中',
  '案件登録後キャンセル',
  '内見登録後キャンセル',
  '申込後キャンセル',
  '審査落ち',
];

interface RealestateKPI {
  revenue: number;
  contracts: number;
  pipeline: {
    prospects: number;        // 見込み顧客(新規)
    expectedThisMonth: number; // 当月申込見込
    awaitingReview: number;   // 審査待ち
  };
  monthlyRevenue: { month: string; revenue: number }[];
}

export async function GET() {
  try {
    const { start, end } = getCurrentMonthRange();
    
    // Fetch all records from 案件管理 table
    const records = await realestateBase('案件管理').select({
      fields: ['ステータス', '最終申込日', 'AD(税抜)', '仲介手数料(税抜)', '案件登録日'],
    }).all();

    let revenue = 0;
    let contracts = 0;
    let prospects = 0;
    let awaitingReview = 0;

    records.forEach((record) => {
      const status = record.get('ステータス') as string;
      const applicationDate = record.get('最終申込日') as string;
      const registrationDate = record.get('案件登録日') as string;
      const ad = toNumber(record.get('AD(税抜)'));
      const commission = toNumber(record.get('仲介手数料(税抜)'));

      // 売上・成約数: ステータスが除外リストに含まれない + 最終申込日が当月
      if (!EXCLUDED_STATUSES.includes(status) && applicationDate && applicationDate >= start && applicationDate <= end) {
        revenue += ad + commission;
        contracts++;
      }

      // パイプライン
      // 見込み顧客(新規): ステータス=案件登録/内見 + 案件登録日が当月
      if ((status === '案件登録' || status === '内見') && registrationDate && registrationDate >= start && registrationDate <= end) {
        prospects++;
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

        if (!EXCLUDED_STATUSES.includes(status) && applicationDate && applicationDate >= mStart && applicationDate <= mEnd) {
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
        expectedThisMonth: 0, // フィールドなしのため0
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
