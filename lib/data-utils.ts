import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';
import { Group, MarksData, Student } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const GROUPS_FILE = path.join(DATA_DIR, 'groups.json');
const MARKS_FILE = path.join(DATA_DIR, 'marks.json');
const EXCEL_FILE = path.join(process.cwd(), 'Minor Project Odd 2025 (Title allocation) (Responses)_6_test.xlsx');

// Ensure data directory exists
export function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Save groups data
export function saveGroups(groups: Group[]) {
  ensureDataDir();
  fs.writeFileSync(GROUPS_FILE, JSON.stringify(groups, null, 2));
}

// Load groups from Excel file
export function loadGroupsFromExcel(): Group[] {
  if (!fs.existsSync(EXCEL_FILE)) {
    console.warn('Excel file not found:', EXCEL_FILE);
    return [];
  }

  try {
    const fileBuffer = fs.readFileSync(EXCEL_FILE);
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    // Get all column names from first row to help with debugging
    const firstRow = data[0] as any;
    const allColumnNames = firstRow ? Object.keys(firstRow) : [];
    console.log('Excel column names found:', allColumnNames);

    const groups: Group[] = [];

    // Helper function to find column by partial match
    const findColumn = (patterns: string[], allColumns: string[]): string | null => {
      for (const pattern of patterns) {
        const exactMatch = allColumns.find(col => col === pattern);
        if (exactMatch) return exactMatch;
        
        // Try case-insensitive match
        const caseMatch = allColumns.find(col => col.toLowerCase() === pattern.toLowerCase());
        if (caseMatch) return caseMatch;
        
        // Try partial match (contains)
        const partialMatch = allColumns.find(col => 
          col.toLowerCase().includes(pattern.toLowerCase()) || 
          pattern.toLowerCase().includes(col.toLowerCase())
        );
        if (partialMatch) return partialMatch;
      }
      return null;
    };

    // Find actual column names
    const gidColumn = findColumn(['GID', 'gid', 'Gid', 'G I D'], allColumnNames);
    const facultyColumn = findColumn([
      'Faculty mentor choice 1',
      'faculty mentor choice 1',
      'Faculty Mentor Choice 1'
    ], allColumnNames);

    for (const row of data as any[]) {
      const gid = gidColumn ? (row[gidColumn] || '') : '';
      const facultyMentor = facultyColumn ? (row[facultyColumn] || '') : '';

      if (!gid || !facultyMentor) continue;

      const students: Student[] = [];

      // Helper function to get value with multiple column name variations
      const getValue = (patterns: string[]) => {
        const columnName = findColumn(patterns, allColumnNames);
        if (columnName) {
          const value = row[columnName];
          if (value !== undefined && value !== null && value !== '') {
            // Handle both string and number types
            return String(value).trim();
          }
        }
        return '';
      };

      // Process Student 1
      const student1Enrollment = getValue([
        'Student 1 Enrollment Number',
        'Student 1 Enrollment Number ',
        'Student 1 enrollment number',
        'Student1 Enrollment Number'
      ]);
      const student1Name = getValue([
        'Student 1 Name',
        'Student 1 Name ',
        'Student 1 name',
        'Student1 Name'
      ]);
      if (student1Name || student1Enrollment) {
        students.push({
          enrollmentNumber: student1Enrollment,
          name: student1Name,
        });
      }

      // Process Student 2
      const student2Enrollment = getValue([
        'Student 2 Enrollment Number',
        'Student 2 Enrollment Number ',
        'Student 2 enrollment number',
        'Student2 Enrollment Number'
      ]);
      const student2Name = getValue([
        'Student 2 Name',
        'Student 2 Name ',
        'Student 2 name',
        'Student2 Name'
      ]);
      if (student2Name || student2Enrollment) {
        students.push({
          enrollmentNumber: student2Enrollment,
          name: student2Name,
        });
      }

      // Process Student 3
      const student3Enrollment = getValue([
        'Student 3 Enrollment Number',
        'Student 3 Enrollment Number ',
        'Student 3 enrollment number',
        'Student3 Enrollment Number'
      ]);
      const student3Name = getValue([
        'Student 3 Name',
        'Student 3 Name ',
        'Student 3 name',
        'Student3 Name'
      ]);
      if (student3Name || student3Enrollment) {
        students.push({
          enrollmentNumber: student3Enrollment,
          name: student3Name,
        });
      }

      if (students.length > 0) {
        groups.push({
          gid,
          students,
          facultyMentor,
        });
      }
    }

    return groups;
  } catch (error) {
    console.error('Error loading from Excel:', error);
    return [];
  }
}

// Load groups data
export function loadGroups(): Group[] {
  ensureDataDir();
  
  // If groups.json doesn't exist, try to load from Excel and save it
  if (!fs.existsSync(GROUPS_FILE)) {
    const groups = loadGroupsFromExcel();
    if (groups.length > 0) {
      saveGroups(groups);
      return groups;
    }
    return [];
  }
  
  const data = fs.readFileSync(GROUPS_FILE, 'utf-8');
  return JSON.parse(data);
}

// Save marks data
export function saveMarks(marks: MarksData) {
  ensureDataDir();
  fs.writeFileSync(MARKS_FILE, JSON.stringify(marks, null, 2));
}

// Load marks data
export function loadMarks(): MarksData {
  ensureDataDir();
  if (!fs.existsSync(MARKS_FILE)) {
    return {};
  }
  const data = fs.readFileSync(MARKS_FILE, 'utf-8');
  return JSON.parse(data);
}

// Update marks for a specific student
export function updateMarks(teacherName: string, gid: string, enrollmentNumber: string, marks: number) {
  const marksData = loadMarks();
  if (!marksData[teacherName]) {
    marksData[teacherName] = {};
  }
  if (!marksData[teacherName][gid]) {
    marksData[teacherName][gid] = {};
  }
  marksData[teacherName][gid][enrollmentNumber] = marks;
  saveMarks(marksData);
}

// Get groups for a specific teacher
export function getGroupsByTeacher(teacherName: string): Group[] {
  const groups = loadGroups();
  return groups.filter(group => group.facultyMentor === teacherName);
}

