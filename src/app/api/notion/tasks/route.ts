import { NextResponse } from 'next/server';
import { Client } from '@notionhq/client';

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

const TASK_DATABASE_ID = '2e8559b7-1fa2-8097-b09e-c8bc5114604f';

// タスク一覧取得
export async function GET() {
  try {
    // @ts-expect-error - Notion SDK v5 type definitions issue
    const response = await notion.databases.query({
      database_id: TASK_DATABASE_ID,
      filter: {
        property: 'ステータス',
        status: {
          does_not_equal: '完了',
        },
      },
      sorts: [
        {
          property: '期日',
          direction: 'ascending',
        },
      ],
      page_size: 10,
    });

    const tasks = response.results.map((page: any) => {
      const properties = page.properties;
      return {
        id: page.id,
        title: properties['項目']?.title?.[0]?.plain_text || 'No title',
        status: properties['ステータス']?.status?.name || '',
        priority: properties['優先順位']?.select?.name || '',
        dueDate: properties['期日']?.date?.start || null,
        business: properties['事業']?.select?.name || '',
        url: page.url,
      };
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Notion Tasks Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

// タスク作成
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title } = body;

    if (!title || typeof title !== 'string') {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    const response = await notion.pages.create({
      parent: {
        database_id: TASK_DATABASE_ID,
      },
      properties: {
        '項目': {
          title: [
            {
              text: {
                content: title,
              },
            },
          ],
        },
        'ステータス': {
          status: {
            name: '未着手',
          },
        },
      },
    });

    return NextResponse.json({ 
      success: true, 
      id: response.id,
      url: 'url' in response ? response.url : null,
    });
  } catch (error) {
    console.error('Notion Create Task Error:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}
