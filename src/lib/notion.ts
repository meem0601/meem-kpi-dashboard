import { Client } from '@notionhq/client';

export const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

// データベースID（TOOLS.mdから）
export const TASK_DATABASE_ID = '2e8559b7-1fa2-8097-b09e-c8bc5114604f';
export const EMPLOYEE_TASK_DATABASE_ID = '2f5559b7-1fa2-8164-b99d-cc0da9b80058';
