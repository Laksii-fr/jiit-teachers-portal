'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Group } from '@/lib/types';
import { MarksData } from '@/lib/types';

function FacultyHeadContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const name = searchParams.get('name') || '';
  const [teachers, setTeachers] = useState<string[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [marks, setMarks] = useState<MarksData>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!name) {
      router.push('/login');
      return;
    }
    fetchData();
  }, [name]);

  const fetchData = async () => {
    try {
      const [teachersRes, groupsRes, marksRes] = await Promise.all([
        fetch('/api/teachers'),
        fetch('/api/students?teacherName=all'),
        fetch('/api/marks'),
      ]);

      const teachersData = await teachersRes.json();
      const groupsData = await groupsRes.json();
      const marksData = await marksRes.json();

      if (teachersData.teachers) {
        setTeachers(teachersData.teachers);
      }

      if (groupsData.groups) {
        setGroups(groupsData.groups);
      }

      if (marksData.marks) {
        setMarks(marksData.marks);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    router.push('/login');
  };

  const handleExport = (format: 'json' | 'excel', type: 'all' | 'groups' | 'marks' = 'all') => {
    const url = `/api/export?format=${format}&type=${type}`;
    window.open(url, '_blank');
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: 'linear-gradient(135deg, #F5F0FF 0%, #E6D9F5 50%, #F0E6FF 100%)' }}>
        <div className="text-xl" style={{ color: '#9674B8' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #F5F0FF 0%, #E6D9F5 50%, #F0E6FF 100%)' }}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold" style={{ color: '#9674B8' }}>Faculty Head Dashboard</h1>
            <p className="mt-2" style={{ color: '#B19CD9' }}>Welcome, {name}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => handleExport('json', 'all')}
              className="rounded-xl px-4 py-2 text-sm font-medium transition-all hover:shadow-md"
              style={{ backgroundColor: '#E6D9F5', color: '#7B5FA6' }}
            >
              📥 Export JSON
            </button>
            <button
              onClick={() => handleExport('excel', 'all')}
              className="rounded-xl px-4 py-2 text-sm font-medium transition-all hover:shadow-md"
              style={{ backgroundColor: '#E6D9F5', color: '#7B5FA6' }}
            >
              📊 Export Excel
            </button>
            <button
              onClick={handleLogout}
              className="rounded-xl px-4 py-2 text-sm font-medium text-white transition-all hover:shadow-md"
              style={{ backgroundColor: '#B19CD9' }}
            >
              Logout
            </button>
          </div>
        </div>

        {teachers.length === 0 ? (
          <div className="rounded-xl p-8 text-center shadow-lg border backdrop-blur-sm" style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)', borderColor: '#D4C4E8' }}>
            <p style={{ color: '#9674B8' }}>No teachers found.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {teachers.map((teacher) => {
              const teacherGroups = groups.filter((g) => g.facultyMentor === teacher);
              const teacherMarks = marks[teacher] || {};

              if (teacherGroups.length === 0) return null;

              return (
                <div key={teacher} className="rounded-xl p-6 shadow-lg border backdrop-blur-sm" style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', borderColor: '#D4C4E8' }}>
                  <h2 className="mb-4 text-2xl font-semibold" style={{ color: '#9674B8' }}>
                    {teacher}
                  </h2>
                  <div className="space-y-4">
                    {teacherGroups.map((group) => {
                      const groupMarks = teacherMarks[group.gid] || {};
                      return (
                        <div key={group.gid} className="rounded-xl border p-4" style={{ borderColor: '#D4C4E8', backgroundColor: '#F5F0FF' }}>
                          <h3 className="mb-3 text-lg font-semibold" style={{ color: '#B19CD9' }}>
                            Group {group.gid}
                          </h3>
                          <div className="overflow-x-auto rounded-lg">
                            <table className="w-full">
                              <thead>
                                <tr style={{ backgroundColor: '#B19CD9' }}>
                                  <th className="px-4 py-2 text-left text-white font-medium">Enrollment Number</th>
                                  <th className="px-4 py-2 text-left text-white font-medium">Name</th>
                                  <th className="px-4 py-2 text-left text-white font-medium">Marks</th>
                                </tr>
                              </thead>
                              <tbody>
                                {group.students.map((student, idx) => (
                                  <tr
                                    key={`${group.gid}-${idx}-${student.enrollmentNumber || student.name}`}
                                    style={idx % 2 === 0 ? { backgroundColor: '#FFFFFF' } : { backgroundColor: '#F5F0FF' }}
                                  >
                                    <td className="px-4 py-2" style={{ color: '#7B5FA6' }}>{student.enrollmentNumber || 'N/A'}</td>
                                    <td className="px-4 py-2" style={{ color: '#7B5FA6' }}>{student.name || 'N/A'}</td>
                                    <td className="px-4 py-2 font-semibold" style={{ color: '#7B5FA6' }}>
                                      {groupMarks[student.enrollmentNumber] !== undefined
                                        ? groupMarks[student.enrollmentNumber]
                                        : 'Not assigned'}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function FacultyHeadPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center" style={{ background: 'linear-gradient(135deg, #F5F0FF 0%, #E6D9F5 50%, #F0E6FF 100%)' }}>
        <div className="text-xl" style={{ color: '#9674B8' }}>Loading...</div>
      </div>
    }>
      <FacultyHeadContent />
    </Suspense>
  );
}

