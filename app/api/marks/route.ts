import { NextRequest, NextResponse } from 'next/server';
import { updateMarks, loadMarks } from '@/lib/data-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { teacherName, gid, enrollmentNumber, marks } = body;

    if (!teacherName || !gid || !enrollmentNumber || marks === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (marks < 0 || marks > 100) {
      return NextResponse.json({ error: 'Marks must be between 0 and 100' }, { status: 400 });
    }

    updateMarks(teacherName, gid, enrollmentNumber, marks);

    return NextResponse.json({ success: true, message: 'Marks saved successfully' });
  } catch (error: any) {
    console.error('Error saving marks:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const marks = loadMarks();
    return NextResponse.json({ marks });
  } catch (error: any) {
    console.error('Error fetching marks:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

