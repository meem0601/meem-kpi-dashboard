import { NextResponse } from 'next/server';
import { Client } from '@notionhq/client';

const TASK_DATABASE_ID = '2e8559b7-1fa2-8097-b09e-c8bc5114604f';

function getNotionClient() {
  return new Client({
    auth: process.env.NOTION_API_KEY,
  });
}

// 今週の開始日と終了日を取得
function getWeekRange() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  monday.setHours(0, 0, 0, 0);
  
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  
  return {
    start: monday.toISOString().split('T')[0],
    end: sunday.toISOString().split('T')[0],
  };
}

// タスク一覧取得
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filterType = searchParams.get('filter');

    let filter: any = {
      property: 'ステータス',
      status: {
        does_not_equal: '完了',
      },
    };

    // 今週期日のタスクをフィルタ
    if (filterType === 'this-week') {
      const { start, end } = getWeekRange();
      filter = {
        and: [
          {
            property: '期日',
            date: {
              on_or_after: start,
            },
          },
          {
            property: '期日',
            date: {
              on_or_before: end,
            },
          },
        ],
      };
    }

    const notion = getNotionClient();
    const response = await notion.databases.query({
      database_id: TASK_DATABASE_ID,
      filter,
      sorts: [
        {
          property: '期日',
          direction: 'ascending',
        },
      ],
      page_size: filterType === 'this-week' ? 50 : 10,
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
  } catch (error: any) {
    console.error('Notion Tasks Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks', details: error?.message || String(error) },
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

    const notion = getNotionClient();
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

// タスク更新
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, title, status, priority, dueDate } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    const properties: any = {};

    if (title !== undefined) {
      properties['項目'] = {
        title: [
          {
            text: {
              content: title,
            },
          },
        ],
      };
    }

    if (status !== undefined) {
      properties['ステータス'] = {
        status: {
          name: status,
        },
      };
    }

    if (priority !== undefined) {
      if (priority === '' || priority === null) {
        properties['優先順位'] = {
          select: null,
        };
      } else {
        properties['優先順位'] = {
          select: {
            name: priority,
          },
        };
      }
    }

    if (dueDate !== undefined) {
      if (dueDate === '' || dueDate === null) {
        properties['期日'] = {
          date: null,
        };
      } else {
        properties['期日'] = {
          date: {
            start: dueDate,
          },
        };
      }
    }

    const notion = getNotionClient();
    await notion.pages.update({
      page_id: id,
      properties,
    });

    return NextResponse.json({ 
      success: true, 
      id,
    });
  } catch (error) {
    console.error('Notion Update Task Error:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}
