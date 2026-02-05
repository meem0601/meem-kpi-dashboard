import Airtable from 'airtable';

// Configure Airtable
Airtable.configure({
  apiKey: process.env.AIRTABLE_API_KEY,
});

// Base instances
export const salesBase = new Airtable().base(process.env.AIRTABLE_BASE_SALES!);
export const realestateBase = new Airtable().base(process.env.AIRTABLE_BASE_REALESTATE!);
export const hrBase = new Airtable().base(process.env.AIRTABLE_BASE_HR!);

// Helper to get current month range
export function getCurrentMonthRange(): { start: string; end: string } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
}

// Helper to get month range for specific year/month
export function getMonthRange(year: number, month: number): { start: string; end: string } {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
}

// Helper to get last 12 months
export function getLast12Months(): { year: number; month: number; label: string }[] {
  const months = [];
  const now = new Date();
  
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      year: date.getFullYear(),
      month: date.getMonth(),
      label: `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}`,
    });
  }
  
  return months;
}

// Safe number conversion
export function toNumber(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return parseFloat(value) || 0;
  return 0;
}
