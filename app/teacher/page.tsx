'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Group, Student } from '@/lib/types';

export default function TeacherPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const teacherName = searchParams.get('name') || '';
  const [groups, setGroups] = useState<Group[]>([]);
  const [marks, setMarks] = useState<Record<string, Record<string, number>>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    if (!teacherName) {
      router.push('/login');
      return;
    }
    fetchData();
  }, [teacherName]);

  const fetchData = async () => {
    try {
      const [studentsRes, marksRes] = await Promise.all([
        fetch(`/api/students?teacherName=${encodeURIComponent(teacherName)}`),
        fetch('/api/marks'),
      ]);

      const studentsData = await studentsRes.json();
      const marksData = await marksRes.json();

      if (studentsData.groups) {
        setGroups(studentsData.groups);
        // Initialize marks state
        const initialMarks: Record<string, Record<string, number>> = {};
        studentsData.groups.forEach((group: Group) => {
          initialMarks[group.gid] = {};
          group.students.forEach((student: Student) => {
            initialMarks[group.gid][student.enrollmentNumber] = 0;
          });
        });

        // Merge with existing marks
        if (marksData.marks && marksData.marks[teacherName]) {
          const teacherMarks = marksData.marks[teacherName];
          Object.keys(teacherMarks).forEach((gid) => {
            if (!initialMarks[gid]) initialMarks[gid] = {};
            Object.keys(teacherMarks[gid]).forEach((enrollmentNumber) => {
              initialMarks[gid][enrollmentNumber] = teacherMarks[gid][enrollmentNumber];
            });
          });
        }

        setMarks(initialMarks);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarksChange = (gid: string, enrollmentNumber: string, value: string) => {
    const numValue = value === '' ? 0 : Math.max(0, Math.min(100, parseInt(value) || 0));
    setMarks((prev) => ({
      ...prev,
      [gid]: {
        ...prev[gid],
        [enrollmentNumber]: numValue,
      },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');

    try {
      const promises: Promise<any>[] = [];
      
      groups.forEach((group) => {
        group.students.forEach((student) => {
          const mark = marks[group.gid]?.[student.enrollmentNumber] ?? 0;
          promises.push(
            fetch('/api/marks', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                teacherName,
                gid: group.gid,
                enrollmentNumber: student.enrollmentNumber,
                marks: mark,
              }),
            })
          );
        });
      });

      await Promise.all(promises);
      setSaveMessage('Marks saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error saving marks:', error);
      setSaveMessage('Error saving marks. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: 'linear-gradient(135deg, #F5F0FF 0%, #E6D9F5 50%, #F0E6FF 100%)' }}>
        <div className="text-xl" style={{ color: '#9674B8' }}>Loading...</div>
      </div>
    );
  }

  const handleExport = (format: 'json' | 'excel', type: 'all' | 'groups' | 'marks' = 'all') => {
    const url = `/api/export?format=${format}&type=${type}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #F5F0FF 0%, #E6D9F5 50%, #F0E6FF 100%)' }}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold" style={{ color: '#9674B8' }}>Teacher Dashboard</h1>
            <p className="mt-2" style={{ color: '#B19CD9' }}>Welcome, {teacherName}</p>
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

        {saveMessage && (
          <div className={`mb-4 rounded-xl p-4 shadow-sm border ${
            saveMessage.includes('Error') 
              ? 'text-rose-700 border-rose-300' 
              : 'text-emerald-700 border-emerald-300'
          }`}
          style={saveMessage.includes('Error') 
            ? { backgroundColor: '#FDF2F8', borderColor: '#F9A8D4' } 
            : { backgroundColor: '#ECFDF5', borderColor: '#86EFAC' }
          }>
            {saveMessage}
          </div>
        )}

        {groups.length === 0 ? (
          <div className="rounded-xl p-8 text-center shadow-lg border backdrop-blur-sm" style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)', borderColor: '#D4C4E8' }}>
            <p style={{ color: '#9674B8' }}>No students assigned to you yet.</p>
          </div>
        ) : (
          <>
            {groups.map((group) => (
              <div key={group.gid} className="mb-6 rounded-xl p-6 shadow-lg border backdrop-blur-sm" style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', borderColor: '#D4C4E8' }}>
                <h2 className="mb-4 text-xl font-semibold" style={{ color: '#9674B8' }}>
                  Group {group.gid}
                </h2>
                <div className="overflow-x-auto rounded-lg">
                  <table className="w-full">
                    <thead>
                      <tr style={{ backgroundColor: '#B19CD9' }}>
                        <th className="px-4 py-3 text-left text-white font-medium">Enrollment Number</th>
                        <th className="px-4 py-3 text-left text-white font-medium">Name</th>
                        <th className="px-4 py-3 text-left text-white font-medium">Marks (out of 100)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.students.map((student, idx) => (
                        <tr 
                          key={`${group.gid}-${idx}-${student.enrollmentNumber || student.name}`} 
                          style={idx % 2 === 0 ? { backgroundColor: '#F5F0FF' } : { backgroundColor: '#FFFFFF' }}
                        >
                          <td className="px-4 py-3" style={{ color: '#7B5FA6' }}>{student.enrollmentNumber || 'N/A'}</td>
                          <td className="px-4 py-3" style={{ color: '#7B5FA6' }}>{student.name || 'N/A'}</td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={marks[group.gid]?.[student.enrollmentNumber || student.name] || 0}
                              onChange={(e) =>
                                handleMarksChange(group.gid, student.enrollmentNumber || student.name, e.target.value)
                              }
                              className="w-24 rounded-lg border-2 px-3 py-1.5 focus:outline-none focus:ring-2 transition-all"
                              style={{ 
                                borderColor: '#D4C4E8',
                                color: '#7B5FA6',
                                backgroundColor: '#FFFFFF'
                              }}
                              onFocus={(e) => e.target.style.borderColor = '#B19CD9'}
                              onBlur={(e) => e.target.style.borderColor = '#D4C4E8'}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="rounded-xl px-6 py-3 font-semibold text-white transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#B19CD9' }}
              >
                {isSaving ? 'Saving...' : '💾 Save Marks'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

