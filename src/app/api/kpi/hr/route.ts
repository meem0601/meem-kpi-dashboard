import { NextResponse } from 'next/server';
import { hrBase, getCurrentMonthRange, getMonthRange, getLast12Months, toNumber } from '@/lib/airtable';

interface HRKPI {
  revenue: number;
  contracts: number;
  pipeline: {
    prospects: number;        // 見込み顧客(新規)
    documentScreening: number; // 書類推薦中
    interviewing: number;     // 面接中
    offerPending: number;     // 内定中
  };
  monthlyRevenue: { month: string; revenue: number }[];
}

const INTERVIEW_STATUSES = ['一次面接', '二次面接', '最終面接'];

export async function GET() {
  try {
    const { start, end } = getCurrentMonthRange();
    
    // Fetch from 推薦一覧 table for revenue, deals, and pipeline
    const recommendationRecords = await hrBase('推薦一覧').select({
      fields: ['内定承諾日', '紹介料(税抜)', '選考状況', '選考状況(手動)', '応募者名'],
    }).all();

    // Fetch from 案件 table for prospects
    const caseRecords = await hrBase('案件').select({
      fields: ['推薦日', 'Created'],
    }).all();

    let revenue = 0;
    let contracts = 0;
    const documentScreeningApplicants = new Set<string>();
    const interviewingApplicants = new Set<string>();

    recommendationRecords.forEach((record) => {
      const acceptanceDate = record.get('内定承諾日') as string;
      const fee = toNumber(record.get('紹介料(税抜)'));
      const status = record.get('選考状況') as string;
      const manualStatus = record.get('選考状況(手動)') as string;
      const applicantName = record.get('応募者名') as string;

      // 売上・成約数: 内定承諾日が当月
      if (acceptanceDate && acceptanceDate >= start && acceptanceDate <= end) {
        revenue += fee;
        contracts++;
      }

      // パイプライン
      // 書類推薦中: 選考状況="書類選考" or 選考状況(手動)="書類選考" のユニーク応募者名
      if (status === '書類選考' || manualStatus === '書類選考') {
        if (applicantName) documentScreeningApplicants.add(applicantName);
      }

      // 面接中: 選考状況=一次面接/二次面接/最終面接 のユニーク応募者名
      if (INTERVIEW_STATUSES.includes(status) || INTERVIEW_STATUSES.includes(manualStatus)) {
        if (applicantName) interviewingApplicants.add(applicantName);
      }
    });

    // 見込み顧客(新規): 案件テーブル 推薦日=空 + Created当月
    let prospects = 0;
    caseRecords.forEach((record) => {
      const recommendationDate = record.get('推薦日') as string;
      const createdDate = record.get('Created') as string;

      if (!recommendationDate && createdDate) {
        const created = createdDate.split('T')[0];
        if (created >= start && created <= end) {
          prospects++;
        }
      }
    });

    // 月次推移（直近12ヶ月）
    const months = getLast12Months();
    const monthlyRevenue = months.map(({ year, month, label }) => {
      const { start: mStart, end: mEnd } = getMonthRange(year, month);
      let monthRev = 0;

      recommendationRecords.forEach((record) => {
        const acceptanceDate = record.get('内定承諾日') as string;
        const fee = toNumber(record.get('紹介料(税抜)'));

        if (acceptanceDate && acceptanceDate >= mStart && acceptanceDate <= mEnd) {
          monthRev += fee;
        }
      });

      return { month: label, revenue: monthRev };
    });

    const data: HRKPI = {
      revenue,
      contracts,
      pipeline: {
        prospects,
        documentScreening: documentScreeningApplicants.size,
        interviewing: interviewingApplicants.size,
        offerPending: 0, // 集計不可
      },
      monthlyRevenue,
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error('HR KPI Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch HR KPI' },
      { status: 500 }
    );
  }
}
