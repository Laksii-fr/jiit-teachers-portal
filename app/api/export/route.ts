import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { loadGroups, loadMarks } from '@/lib/data-utils';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') || 'json'; // 'json' or 'excel'
    const type = searchParams.get('type') || 'all'; // 'all', 'groups', or 'marks'

    const groups = loadGroups();
    const marks = loadMarks();

    if (format === 'excel') {
      // Create Excel workbook
      const workbook = XLSX.utils.book_new();

      if (type === 'all' || type === 'groups') {
        // Create groups sheet
        const groupsData: any[] = [];
        groups.forEach((group) => {
          group.students.forEach((student, idx) => {
            groupsData.push({
              'GID': group.gid,
              'Faculty Mentor': group.facultyMentor,
              'Student Number': idx + 1,
              'Enrollment Number': student.enrollmentNumber || '',
              'Student Name': student.name || '',
            });
          });
        });
        const groupsSheet = XLSX.utils.json_to_sheet(groupsData);
        XLSX.utils.book_append_sheet(workbook, groupsSheet, 'Groups');
      }

      if (type === 'all' || type === 'marks') {
        // Create marks sheet
        const marksData: any[] = [];
        Object.keys(marks).forEach((teacherName) => {
          Object.keys(marks[teacherName]).forEach((gid) => {
            Object.keys(marks[teacherName][gid]).forEach((identifier) => {
              const group = groups.find(g => g.gid === gid);
              const student = group?.students.find(s => 
                s.enrollmentNumber === identifier || s.name === identifier
              );
              marksData.push({
                'Teacher Name': teacherName,
                'GID': gid,
                'Enrollment Number': student?.enrollmentNumber || identifier || '',
                'Student Name': student?.name || identifier || '',
                'Marks': marks[teacherName][gid][identifier],
              });
            });
          });
        });
        const marksSheet = XLSX.utils.json_to_sheet(marksData);
        XLSX.utils.book_append_sheet(workbook, marksSheet, 'Marks');
      }

      // Generate Excel buffer
      const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      
      return new NextResponse(excelBuffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="export_${type}_${new Date().toISOString().split('T')[0]}.xlsx"`,
        },
      });
    } else {
      // Return JSON
      let data: any = {};
      
      if (type === 'all' || type === 'groups') {
        data.groups = groups;
      }
      if (type === 'all' || type === 'marks') {
        data.marks = marks;
      }

      return NextResponse.json(data, {
        headers: {
          'Content-Disposition': `attachment; filename="export_${type}_${new Date().toISOString().split('T')[0]}.json"`,
        },
      });
    }
  } catch (error: any) {
    console.error('Error exporting data:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

