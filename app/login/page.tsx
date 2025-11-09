'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function LoginPage() {
  const [name, setName] = useState('');
  const [role, setRole] = useState<'teacher' | 'facultyHead'>('teacher');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter your name');
      return;
    }

    setIsLoading(true);
    
    if (role === 'facultyHead') {
      router.push(`/faculty-head?name=${encodeURIComponent(name)}`);
    } else {
      router.push(`/teacher?name=${encodeURIComponent(name)}`);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center" style={{ background: 'linear-gradient(135deg, #F5F0FF 0%, #E6D9F5 50%, #F0E6FF 100%)' }}>
      <div className="w-full max-w-md rounded-2xl backdrop-blur-sm p-8 shadow-2xl border" style={{ backgroundColor: 'rgba(255, 255, 255, 0.85)', borderColor: '#D4C4E8' }}>
        <div className="mb-6 flex justify-center">
          <Image
            src="/Jaypee.png"
            alt="JIIT Logo"
            width={200}
            height={200}
            className="object-contain"
            priority
          />
        </div>
        <h1 className="mb-6 text-center text-3xl font-semibold" style={{ color: '#9674B8' }}>
          Teacher Portal
        </h1>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2" style={{ color: '#B19CD9' }}>
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border-2 px-4 py-2.5 transition-all focus:outline-none focus:ring-2 focus:ring-opacity-50"
              style={{ 
                borderColor: '#D4C4E8',
                color: '#7B5FA6',
                backgroundColor: '#FFFFFF'
              }}
              onFocus={(e) => e.target.style.borderColor = '#B19CD9'}
              onBlur={(e) => e.target.style.borderColor = '#D4C4E8'}
              placeholder="Enter your name"
              required
            />
          </div>
          
          <div>
            <label htmlFor="role" className="block text-sm font-medium mb-2" style={{ color: '#B19CD9' }}>
              Role
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as 'teacher' | 'facultyHead')}
              className="w-full rounded-xl border-2 px-4 py-2.5 transition-all focus:outline-none focus:ring-2 focus:ring-opacity-50"
              style={{ 
                borderColor: '#D4C4E8',
                color: '#7B5FA6',
                backgroundColor: '#FFFFFF'
              }}
              onFocus={(e) => e.target.style.borderColor = '#B19CD9'}
              onBlur={(e) => e.target.style.borderColor = '#D4C4E8'}
            >
              <option value="teacher">Teacher</option>
              <option value="facultyHead">Faculty Head</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl px-4 py-3 font-semibold text-white transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#B19CD9' }}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

