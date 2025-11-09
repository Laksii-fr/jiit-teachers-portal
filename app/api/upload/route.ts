import { NextResponse } from 'next/server';
import { loadGroupsFromExcel, saveGroups } from '@/lib/data-utils';

export async function GET() {
  try {
    const groups = loadGroupsFromExcel();
    
    if (groups.length === 0) {
      return NextResponse.json({ error: 'No groups found in Excel file' }, { status: 404 });
    }

    saveGroups(groups);

    return NextResponse.json({ 
      success: true, 
      message: `Loaded ${groups.length} groups from Excel file`,
      groups 
    });
  } catch (error: any) {
    console.error('Error processing file:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

