import { NextResponse } from 'next/server';
import { loadGroups } from '@/lib/data-utils';

export async function GET() {
  try {
    const groups = loadGroups();
    const teachers = Array.from(new Set(groups.map(g => g.facultyMentor))).filter(Boolean);
    return NextResponse.json({ teachers });
  } catch (error: any) {
    console.error('Error fetching teachers:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

