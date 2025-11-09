import { NextRequest, NextResponse } from 'next/server';
import { getGroupsByTeacher, loadGroups } from '@/lib/data-utils';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const teacherName = searchParams.get('teacherName');

    if (!teacherName) {
      return NextResponse.json({ error: 'Teacher name is required' }, { status: 400 });
    }

    let groups;
    if (teacherName === 'all') {
      groups = loadGroups();
    } else {
      groups = getGroupsByTeacher(teacherName);
    }

    return NextResponse.json({ groups });
  } catch (error: any) {
    console.error('Error fetching students:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

