export interface Student {
  enrollmentNumber: string;
  name: string;
  marks?: number;
}

export interface Group {
  gid: string;
  students: Student[];
  facultyMentor: string;
}

export interface TeacherData {
  teacherName: string;
  groups: Group[];
}

export interface MarksData {
  [teacherName: string]: {
    [gid: string]: {
      [enrollmentNumber: string]: number;
    };
  };
}

