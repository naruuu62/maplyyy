'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, Menu, X } from 'lucide-react';
import { getStoredUser } from '../lib/api';
import { User } from '../types/maply';

export type InstructorNavItem = 'Dashboard' | 'Courses' | 'Maps' | 'Assessments' | 'Analytics';

export interface InstructorNavbarProps {
  activeItem: InstructorNavItem;
  currentUser?: { full_name?: string; identifier?: string; email?: string } | null;
  onNavigate: (item: InstructorNavItem) => void;
  onLogout: () => void;
}

const NAV_ITEMS: { id: InstructorNavItem; label: string }[] = [
  { id: 'Dashboard', label: 'Dashboard' },
  { id: 'Courses', label: 'My Courses' },
  { id: 'Maps', label: 'Concept Maps' },
  { id: 'Assessments', label: 'Assessments' },
  { id: 'Analytics', label: 'Analytics' }
];

const COURSE_OPTIONS = [
  'FILKOM UB • Arsitektur Komputer (TIF-2101)',
  'FILKOM UB • Sistem Operasi (TIF-2202)',
  'FILKOM UB • Algoritma & Pemrograman II (CSP-2103)',
  'FILKOM UB • Jaringan Komputer (TIF-2304)'
];

export const InstructorNavbar: React.FC<InstructorNavbarProps> = ({
  activeItem,
  currentUser,
  onNavigate,
  onLogout
}) => {
  const [selectedCourse, setSelectedCourse] = useState(COURSE_OPTIONS[0]);
  const [isCourseMenuOpen, setIsCourseMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [localUser, setLocalUser] = useState<User | null>(null);

  useEffect(() => {
    if (!currentUser) {
      setLocalUser(getStoredUser());
    }
  }, [currentUser]);

  const activeUser = currentUser || localUser;
  const teacherName = activeUser?.full_name || 'Dosen Pengampu';
  const teacherNip = activeUser?.identifier ? `NIP: ${activeUser.identifier}` : (activeUser?.email || '');
  const initials = teacherName
    ? teacherName.split(' ').filter((p: string) => !p.includes('.') && p.trim().length > 0).map((p: string) => p[0]).join('').slice(0, 2).toUpperCase() || 'DS'
    : 'DS';

  const navigate = (item: InstructorNavItem) => {
    setIsMobileMenuOpen(false);
    onNavigate(item);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[#1b1b1e] bg-[#fbf8fc] shadow-[0_2px_0_rgba(27,27,30,0.08)]">
      <div className="mx-auto flex h-[58px] max-w-[1280px] items-center justify-between gap-2 px-3 sm:px-4">
        <div className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => navigate('Dashboard')}
            className="flex shrink-0 items-center gap-1.5 text-left"
            aria-label="Maply dashboard"
          >
            <span className="flex items-center gap-0.5">
              <span className="h-2 w-2 rounded-full bg-[#2f54eb] sm:h-2.5 sm:w-2.5" />
              <span className="h-0 w-0 border-b-[8px] border-l-[5px] border-r-[5px] border-b-[#da3437] border-l-transparent border-r-transparent sm:border-b-[9px] sm:border-l-[6px] sm:border-r-[6px]" />
              <span className="h-2 w-2 rounded-[1px] bg-[#ffb95f] sm:h-2.5 sm:w-2.5" />
            </span>
            <span className="font-serif text-[16px] font-bold tracking-[-0.45px] sm:text-[17px]">Maply</span>
          </button>
          <span className="hidden whitespace-nowrap rounded-full border border-[#1b1b1e] bg-[#f0edf1] px-2 py-1 text-[7px] font-bold uppercase leading-none tracking-[0.2px] min-[500px]:inline-flex sm:text-[8px]">
            Dosen / Pengajar
          </span>
        </div>

        <nav
          aria-label="Navigasi utama dosen"
          className="hidden h-[34px] shrink-0 items-center rounded-full border border-[#1b1b1e] bg-white p-[2px] min-[900px]:flex"
        >
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => navigate(item.id)}
              aria-current={activeItem === item.id ? 'page' : undefined}
              className={`h-full whitespace-nowrap rounded-full px-2 text-[9px] tracking-[0.05px] transition-colors min-[900px]:px-2.5 min-[900px]:text-[10px] ${
                activeItem === item.id ? 'bg-[#0038d1] text-white' : 'text-[#444655] hover:bg-[#f6f2f7]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-3 sm:gap-4">
          <div className="relative hidden min-[940px]:block">
            <button
              type="button"
              onClick={() => setIsCourseMenuOpen((open) => !open)}
              aria-expanded={isCourseMenuOpen}
              className="flex max-w-[165px] items-center gap-1.5 whitespace-nowrap rounded-full border border-[#1b1b1e] bg-[#f6f2f7] px-2.5 py-1 text-left text-[7px] font-bold tracking-[0.15px] min-[900px]:max-w-[190px] min-[900px]:px-3 min-[900px]:text-[8px]"
            >
              <span className="h-2 w-2 shrink-0 rounded-full bg-[#0038d1]" />
              <span className="truncate">{selectedCourse}</span>
              <ChevronDown className="h-2.5 w-2.5 shrink-0" />
            </button>
            {isCourseMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 overflow-hidden rounded-xl border border-[#e4e1e6] bg-white p-1 shadow-lg">
                {COURSE_OPTIONS.map((course) => (
                  <button
                    key={course}
                    type="button"
                    onClick={() => {
                      setSelectedCourse(course);
                      setIsCourseMenuOpen(false);
                    }}
                    className="block w-full rounded-lg px-3 py-2 text-left text-xs hover:bg-[#f6f2f7]"
                  >
                    {course}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="rounded-full border border-[#1b1b1e] bg-[#b61722] px-2.5 py-1 text-[8px] font-bold tracking-[0.2px] text-white shadow-[1px_1px_0_#1b1b1e] transition-transform hover:-translate-y-px sm:px-3 sm:text-[9px]"
          >
            Logout
          </button>
          <div className="hidden max-w-[125px] leading-tight min-[1160px]:ml-5 min-[1160px]:block min-[1160px]:max-w-[170px]">
            <div className="font-serif text-[8.5px] font-bold min-[1024px]:text-[9.5px] truncate text-[#1b1b1e]" title={teacherName}>
              {teacherName}
            </div>
            {teacherNip ? (
              <div className="mt-0.5 text-[7px] font-bold text-[#747687] min-[1024px]:text-[8px] truncate" title={teacherNip}>
                {teacherNip}
              </div>
            ) : null}
          </div>
          <div
            aria-label={`Profil ${teacherName}`}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0038d1] text-white font-mono font-bold text-xs shadow-[1.5px_1.5px_0_#1b1b1e]"
            title={teacherName}
          >
            {initials}
          </div>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e4e1e6] min-[900px]:hidden"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            aria-label={isMobileMenuOpen ? 'Tutup navigasi' : 'Buka navigasi'}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>
      {isMobileMenuOpen && (
        <nav
          aria-label="Navigasi utama dosen"
          className="absolute left-0 right-0 top-full border-b border-[#e4e1e6] bg-[#fbf8fc] p-3 shadow-lg min-[900px]:hidden"
        >
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => navigate(item.id)}
              className={`block w-full rounded-lg px-3 py-2.5 text-left text-sm ${
                activeItem === item.id ? 'bg-[#0038d1] text-white' : 'hover:bg-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      )}
    </header>
  );
};
