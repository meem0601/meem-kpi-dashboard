import { NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { salesBase, getCurrentMonthRange, getMonthRange, getLast12Months, toNumber } from '@/lib/airtable';

// 60秒キャッシュ
export const revalidate = 60;

interface SalesKPI {
  revenue: number;
  deals: number;
  pipeline: {
    pending: number;      // 面談待ち
    considering: number;  // 検討中
    waitingPayment: number; // 着金待ち
  };
  monthlyRevenue: { month: string; revenue: number }[];
}

export async function GET() {
  try {
    const { start, end } = getCurrentMonthRange();
    
    // Fetch all records from 面談 table
    const records = await salesBase('面談').select({
      fields: ['面談結果', '初回着金日', '成約金額(税抜)', '面談予約日'],
    }).all();

    let revenue = 0;
    let deals = 0;
    let pending = 0;
    let considering = 0;
    let waitingPayment = 0;

    records.forEach((record) => {
      const result = record.get('面談結果') as string;
      const paymentDate = record.get('初回着金日') as string;
      const meetingDate = record.get('面談予約日') as string;
      const amount = toNumber(record.get('成約金額(税抜)'));

      // 売上・成約数: 面談結果="成約後着金" + 初回着金日が当月
      if (result === '成約後着金' && paymentDate && paymentDate >= start && paymentDate <= end) {
        revenue += amount;
        deals++;
      }

      // パイプライン
      // 面談待ち: 面談予約日が当月 + 面談結果=空
      if (meetingDate && meetingDate >= start && meetingDate <= end && !result) {
        pending++;
      }
      
      // 検討中
      if (result === '検討中') {
        considering++;
      }
      
      // 着金待ち
      if (result === '口頭成約') {
        waitingPayment++;
      }
    });

    // 月次推移（直近12ヶ月）
    const months = getLast12Months();
    const monthlyRevenue = await Promise.all(
      months.map(async ({ year, month, label }) => {
        const { start: mStart, end: mEnd } = getMonthRange(year, month);
        let monthRev = 0;

        records.forEach((record) => {
          const result = record.get('面談結果') as string;
          const paymentDate = record.get('初回着金日') as string;
          const amount = toNumber(record.get('成約金額(税抜)'));

          if (result === '成約後着金' && paymentDate && paymentDate >= mStart && paymentDate <= mEnd) {
            monthRev += amount;
          }
        });

        return { month: label, revenue: monthRev };
      })
    );

    const data: SalesKPI = {
      revenue,
      deals,
      pipeline: {
        pending,
        considering,
        waitingPayment,
      },
      monthlyRevenue,
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error('Sales KPI Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Sales KPI' },
      { status: 500 }
    );
  }
}
