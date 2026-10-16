'use client';

import React, { useMemo, useRef, useState, useEffect } from 'react';
import { InstructorNavbar, InstructorNavItem } from './InstructorNavbar';
import { AssessmentConfig, ClassKnowledgeGapSummary, MasterConceptMap } from '../types/maply';

const COURSE_ASSETS = {
  import: ['f314b.svg', 12, 12],
  add: ['e79e9.svg', 16.667, 16.667],
  search: ['fe8f2.svg', 13.5, 13.5],
  filter: ['230ce.svg', 13.5, 13.5],
  courseMap: ['16271.svg', 26.667, 24],
  instructor: ['c9a79.svg', 11.667, 9.333],
  arrow: ['457a9.svg', 12, 12],
  soloInstructor: ['e29b1.svg', 9.333, 9.333],
  arrowMuted: ['c6538.svg', 12, 12],
  bell: ['5a7f0.svg', 13.333, 13.367],
  download: ['3ebfc.svg', 10.667, 10.667],
  settings: ['4f443.svg', 15.075, 15],
  students: ['8b734.svg', 16, 8],
  modules: ['c2900.svg', 11.333, 14.667],
  groups: ['eacce.svg', 14.667, 10.667],
  tableFilter: ['57772.svg', 12, 12],
  attendance: ['55ca7.svg', 15, 15],
  topology: ['45d0c.svg', 18.333, 15.417],
  misconception: ['b2763.svg', 18.333, 17.75],
  score: ['f0f8a.svg', 18.333, 15.417],
  insight: ['5736b.svg', 12.833, 12.25],
  mapAction: ['5f619.svg', 15, 13.5],
  assessmentAction: ['e88a6.svg', 14.259, 15],
  groupAction: ['e792f.svg', 12.833, 12.25],
  participantAction: ['aff1c.svg', 14.667, 10.667]
} as const;

type CourseAssetName = keyof typeof COURSE_ASSETS;

function CourseAsset({ name, className = '' }: { name: CourseAssetName; className?: string }) {
  const [file, width, height] = COURSE_ASSETS[name];
  return (
    <img
      src={`/figma/courses/${file}`}
      width={width}
      height={height}
      alt=""
      aria-hidden="true"
      className={`shrink-0 ${className}`}
    />
  );
}

type Course = {
  code: string;
  credits: number;
  title: string;
  rombels: string;
  students: number;
  assessments: number;
  score: number;
  color: string;
  instructor: string;
  room: string;
  status: 'active' | 'remedial' | 'archived';
};

type Student = {
  initials: string;
  name: string;
  nim: string;
  rombel: string;
  attendance: string;
  score: number;
  topology: string;
  gap: string;
  tone: string;
  status: 'complete' | 'incomplete';
};

type CourseTab = 'students' | 'assessments' | 'groups' | 'rubric';

interface TeacherCoursesViewProps {
  assessments?: AssessmentConfig[];
  masterMap?: MasterConceptMap;
  analytics?: ClassKnowledgeGapSummary;
  currentUser?: { id: string; email: string; full_name: string; role: string; identifier?: string } | null;
  onNavigate: (item: InstructorNavItem) => void;
  onLogout: () => void;
}

export const TeacherCoursesView: React.FC<TeacherCoursesViewProps> = ({
  assessments = [],
  masterMap,
  analytics,
  currentUser,
  onNavigate,
  onLogout
}) => {
  const teacherName = currentUser?.full_name || 'Dosen Pengampu';

  // Dynamic courses list extracted from database assessments and master maps
  const dynamicCourses: Course[] = useMemo(() => {
    const list: Course[] = [];
    const mainTitle = masterMap?.title ? masterMap.title.split(/[-–:]/)[0].trim() : 'Arsitektur Komputer';

    list.push({
      code: 'TIF-2101',
      credits: 3,
      title: mainTitle,
      rombels: 'Kelas Reguler (FILKOM UB)',
      students: analytics?.total_students || 0,
      assessments: assessments.length || 1,
      score: analytics?.average_score || 0,
      color: '#0038d1',
      instructor: teacherName,
      room: 'Gedung G-301 & Daring',
      status: 'active'
    });

    assessments.forEach((asm, idx) => {
      const desc = asm.description || '';
      let courseTitle = '';
      if (desc.includes('Kelas') || desc.includes('Rombel')) {
        courseTitle = desc.split(/[-–(]/)[0].trim();
      } else if (asm.title.toLowerCase().includes('sistem operasi')) {
        courseTitle = 'Sistem Operasi';
      } else if (asm.title.toLowerCase().includes('basis data')) {
        courseTitle = 'Basis Data';
      } else if (asm.title.toLowerCase().includes('jaringan')) {
        courseTitle = 'Jaringan Komputer';
      }

      if (courseTitle && !list.some((c) => c.title.toLowerCase() === courseTitle.toLowerCase())) {
        list.push({
          code: `TIF-${2102 + idx}`,
          credits: 3,
          title: courseTitle,
          rombels: 'Kelas Reguler',
          students: 0,
          assessments: 1,
          score: 0,
          color: idx % 2 === 0 ? '#8e5900' : '#2f54eb',
          instructor: teacherName,
          room: 'Gedung G',
          status: 'active'
        });
      }
    });

    return list;
  }, [masterMap, assessments, analytics, teacherName]);

  const [courses, setCourses] = useState<Course[]>(dynamicCourses);
  useEffect(() => {
    setCourses(dynamicCourses);
  }, [dynamicCourses]);

  const [selectedCourseCode, setSelectedCourseCode] = useState(dynamicCourses[0]?.code || 'TIF-2101');
  const [filter, setFilter] = useState<'all' | 'semester' | 'collaborative'>('all');
  const [query, setQuery] = useState('');
  const [courseTab, setCourseTab] = useState<CourseTab>('students');
  const [studentPage, setStudentPage] = useState(1);
  const [sortCourses, setSortCourses] = useState(false);
  const [topologyFilter, setTopologyFilter] = useState('Semua Pola');
  const [statusFilter, setStatusFilter] = useState('Semua Status');
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseCode, setNewCourseCode] = useState('');
  const [toast, setToast] = useState('');
  const uploadRef = useRef<HTMLInputElement>(null);

  const selectedCourse = courses.find((course) => course.code === selectedCourseCode) ?? courses[0] ?? dynamicCourses[0];

  // Dynamic students list from real database submissions via analytics.student_performances
  const realStudents: Student[] = useMemo(() => {
    if (analytics?.student_performances && analytics.student_performances.length > 0) {
      return analytics.student_performances.map((p) => {
        const initials = p.student_name
          ? p.student_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
          : 'M';
        const isComplete = p.total_score >= 75;
        return {
          initials,
          name: p.student_name,
          nim: p.student_id,
          rombel: 'Kelas Reguler',
          attendance: '1/1 Modul',
          score: p.total_score,
          topology: p.structural_score ? `Net (${p.structural_score}%)` : 'Tervalidasi Graf',
          gap: (p.gaps_count || 0) > 0 ? `${p.gaps_count} Miskonsepsi` : 'Komprehensif',
          tone: isComplete ? '#dee1ff' : '#ffdad7',
          status: isComplete ? ('complete' as const) : ('incomplete' as const)
        };
      });
    }
    return [];
  }, [analytics]);

  const filteredCourses = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return courses
      .filter((course) => {
        const matchesQuery = !normalizedQuery || `${course.title} ${course.code} ${course.rombels}`.toLocaleLowerCase().includes(normalizedQuery);
        return matchesQuery;
      })
      .sort((a, b) => (sortCourses ? a.title.localeCompare(b.title) : 0));
  }, [courses, query, sortCourses]);

  const filteredStudents = useMemo(() => {
    return realStudents.filter((student) => {
      const matchesTopology = topologyFilter === 'Semua Pola' || student.topology.startsWith(topologyFilter);
      const matchesStatus = statusFilter === 'Semua Status' || (statusFilter === 'Selesai' ? student.status === 'complete' : student.status === 'incomplete');
      return matchesTopology && matchesStatus;
    });
  }, [realStudents, statusFilter, topologyFilter]);

  const pageCount = Math.max(1, Math.ceil(filteredStudents.length / 5));
  const pageStudents = filteredStudents.slice((studentPage - 1) * 5, studentPage * 5);

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 3000);
  };

  const exportStudents = () => {
    if (filteredStudents.length === 0) {
      notify('Belum ada data nilai mahasiswa untuk diekspor.');
      return;
    }
    const rows = [
      ['Nama', 'NIM', 'Rombel', 'Kehadiran', 'Skor Kognitif', 'Topologi', 'Celah Pengetahuan'],
      ...filteredStudents.map((student) => [student.name, student.nim, student.rombel, student.attendance, student.score.toString(), student.topology, student.gap])
    ];
    const csv = rows.map((row) => row.map((value) => `"${value.replaceAll('"', '""')}"`).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${selectedCourse?.code || 'MAPLY'}-rekap-obe.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const addCourse = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const code = newCourseCode.trim().toUpperCase();
    if (!newCourseTitle.trim() || !code || courses.some((course) => course.code === code)) {
      notify('Isi nama dan kode mata kuliah dengan benar (kode tidak boleh duplikat).');
      return;
    }
    const newCourse: Course = {
      code,
      credits: 3,
      title: newCourseTitle.trim(),
      rombels: 'Kelas Baru',
      students: 0,
      assessments: 0,
      score: 0,
      color: '#0038d1',
      instructor: teacherName,
      room: 'Belum ditentukan',
      status: 'active'
    };
    setCourses((items) => [...items, newCourse]);
    setSelectedCourseCode(code);
    setIsAddCourseOpen(false);
    setNewCourseTitle('');
    setNewCourseCode('');
    notify('Mata kuliah baru berhasil ditambahkan.');
  };

  const navTo = (item: InstructorNavItem) => {
    if (item !== 'Courses') onNavigate(item);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1b1b1e]">
      <InstructorNavbar activeItem="Courses" currentUser={currentUser} onNavigate={navTo} onLogout={onLogout} />
      {toast && <div role="status" className="fixed right-5 top-20 z-50 rounded-xl bg-[#1b1b1e] px-4 py-3 text-xs font-bold text-white shadow-lg">{toast}</div>}
      <input
        ref={uploadRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          if (file) notify(`File ${file.name} dipilih; sinkronisasi SIAKAD belum terhubung.`);
          event.currentTarget.value = '';
        }}
      />

      <main className="mx-auto flex w-full max-w-[1280px] flex-col gap-6 px-4 py-6 sm:px-8">
        <section className="flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.5px] text-[#747687]">
              <span className="h-2.5 w-2.5 rounded-full bg-[#0038d1]" />
              <span>Semester Akademik Aktif • FILKOM UB</span>
              <span>•</span>
              <span className="text-[#0038d1]">Kit-Build Concept Map Method</span>
            </div>
            <h1 className="mt-2 font-serif text-[32px] font-bold leading-tight tracking-[-0.8px] sm:text-[40px]">
              Pengelolaan Mata Kuliah &amp; Kelas
            </h1>
            <p className="mt-1 max-w-3xl text-[13px] leading-6 text-[#444655]">
              Kelola daftar kelas aktif, distribusi peserta mahasiswa, dan keterkaitan modul asesmen peta konsep berbasis kerangka kognitif F. Hirashima.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2 xl:w-[330px] xl:flex-col xl:items-start">
            <button type="button" onClick={() => uploadRef.current?.click()} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-[11px] font-bold shadow-[0_2px_5px_rgba(0,0,0,0.1)] cursor-pointer">
              <CourseAsset name="import" /> Impor Data Mahasiswa (SIAKAD)
            </button>
            <button type="button" onClick={() => setIsAddCourseOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-[#0038d1] px-4 py-2 text-[11px] font-bold text-white shadow-[0_2px_5px_rgba(0,0,0,0.1)] cursor-pointer">
              <CourseAsset name="add" /> + Tambah Mata Kuliah Baru
            </button>
          </div>
        </section>

        {/* Filter bar */}
        <section aria-label="Filter dan pencarian mata kuliah" className="flex flex-col justify-between gap-3 rounded-xl bg-white p-2 shadow-[0_1px_2px_rgba(0,0,0,0.05)] xl:flex-row xl:items-center">
          <div className="flex gap-1 overflow-x-auto">
            <button
              type="button"
              onClick={() => { setFilter('all'); setStudentPage(1); }}
              className={`inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-[9px] font-bold sm:px-4 sm:text-[10px] ${filter === 'all' ? 'bg-[#0038d1] text-white' : 'text-[#444655] hover:bg-[#f6f2f7]'}`}
            >
              Semua Kelas <span className={`rounded-full px-1.5 text-[8px] ${filter === 'all' ? 'bg-white/20' : 'bg-[#eae7eb]'}`}>{courses.length}</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-lg bg-[#f6f2f7] px-3 py-1.5 text-xs">
              <CourseAsset name="search" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari nama matkul atau kode..." className="w-full bg-transparent text-xs outline-none sm:w-48" />
            </div>
            <button type="button" onClick={() => setSortCourses((value) => !value)} className="inline-flex items-center gap-1 rounded-lg bg-[#f6f2f7] px-3 py-2 text-[9px] font-bold cursor-pointer">
              <CourseAsset name="filter" /> Urutkan A-Z
            </button>
          </div>
        </section>

        {/* Courses Cards Grid */}
        <section aria-label="Daftar kartu mata kuliah" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {filteredCourses.map((course) => {
            const isSelected = course.code === selectedCourse?.code;
            return (
              <button
                key={course.code}
                type="button"
                onClick={() => { setSelectedCourseCode(course.code); setStudentPage(1); }}
                className={`flex flex-col justify-between rounded-2xl bg-white p-4 text-left transition-all cursor-pointer ${isSelected ? 'border-2 border-[#0038d1] shadow-[4px_4px_0_#1b1b1e]' : 'border border-[#f0edf1] shadow-sm hover:border-[#1b1b1e]'}`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[9px] font-bold text-[#747687]">{course.code}</span>
                    <span className="rounded-full bg-[#f6f2f7] px-2 py-0.5 text-[8px] font-bold text-[#0038d1]">{course.credits} SKS</span>
                  </div>
                  <h3 className="mt-2 font-serif text-lg font-bold leading-6">{course.title}</h3>
                  <span className="text-[10px] text-[#444655]">{course.rombels}</span>
                </div>
                <div className="mt-4 border-t border-[#f0edf1] pt-3 flex items-center justify-between text-[10px]">
                  <span className="text-[#747687]">{course.students} Mhs Terdata</span>
                  <span className="font-bold text-[#0038d1]">{course.assessments} Asesmen</span>
                </div>
              </button>
            );
          })}
        </section>

        {/* Detail Panel of Selected Course */}
        {selectedCourse && (
          <section className="rounded-2xl bg-white p-6 shadow-[4px_4px_0_#1b1b1e] space-y-6">
            <div className="flex flex-col justify-between gap-4 border-b border-[#f0edf1] pb-4 xl:flex-row xl:items-center">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-serif text-2xl font-bold">{selectedCourse.title}</h2>
                  <span className="rounded-full bg-[#dee1ff] px-2.5 py-0.5 text-[9px] font-bold text-[#001257]">{selectedCourse.code}</span>
                  <span className="rounded-full bg-[#eae7eb] px-2 py-0.5 text-[8.5px] font-bold">FILKOM UB</span>
                </div>
                <p className="text-xs text-[#747687]">
                  Dosen Pengampu: <strong className="text-[#1b1b1e]">{selectedCourse.instructor}</strong> &bull; Ruang: {selectedCourse.room}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={exportStudents} className="inline-flex items-center gap-2 rounded-xl bg-white border border-[#1b1b1e] px-4 py-2 text-xs font-bold shadow-[2px_2px_0_#1b1b1e] cursor-pointer">
                  <CourseAsset name="download" /> Unduh Rekap Nilai OBE (CSV)
                </button>
              </div>
            </div>

            {/* Course Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 flex-wrap gap-1">
                {([
                  ['students', `Daftar Mahasiswa (${realStudents.length})`, 'students'],
                  ['assessments', `Daftar Asesmen Modul (${selectedCourse.assessments})`, 'modules'],
                  ['rubric', 'Pengaturan Rubrik Kit-Build', 'tableFilter']
                ] as const).map(([id, label, icon]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setCourseTab(id)}
                    className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold cursor-pointer ${courseTab === id ? 'bg-[#0038d1] text-white' : 'text-[#444655] hover:bg-[#f6f2f7]'}`}
                  >
                    <CourseAsset name={icon} />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {courseTab === 'students' ? (
              <>
                {/* Real Summary Metrics from Analytics */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <SummaryMetric icon="attendance" title="Total Partisipasi" value={`${analytics?.total_students || 0} Mahasiswa`} detail="Tuntas Mengerjakan" />
                  <SummaryMetric icon="topology" title="Topologi Dominan" value={analytics?.total_students ? 'Net Model' : '-'} detail="Jejaring Konsep" />
                  <SummaryMetric icon="misconception" title="Deteksi Miskonsepsi" value={`${analytics?.problematic_relationships?.length || 0} Relasi`} danger={(analytics?.problematic_relationships?.length || 0) > 0} />
                  <SummaryMetric icon="score" title="Rata-Rata Kelas" value={`${analytics?.average_score || 0}%`} detail="Skor Konseptual" />
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                  <label className="flex items-center gap-2 rounded-lg bg-[#f6f2f7] px-3 py-2 text-xs font-bold">
                    Status:
                    <select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setStudentPage(1); }} className="bg-transparent outline-none">
                      <option>Semua Status</option>
                      <option>Selesai</option>
                      <option>Belum Selesai</option>
                    </select>
                  </label>
                </div>

                {filteredStudents.length === 0 ? (
                  <div className="p-8 text-center bg-white rounded-2xl border-2 border-dashed border-[#1B1B1E]/30 space-y-2">
                    <p className="font-serif font-black text-sm text-[#1B1B1E]">Belum Ada Mahasiswa Mengumpulkan</p>
                    <p className="text-xs text-[#71717A] max-w-sm mx-auto">
                      Belum ada data pengumpulan peta konsep untuk kelas ini di database. Mahasiswa dapat memasukkan token asesmen untuk mulai mengerjakan.
                    </p>
                  </div>
                ) : (
                  <>
                    <StudentTable students={pageStudents} onNotify={notify} />
                    <div className="flex flex-col justify-between gap-3 border-t border-[#eae7eb] pt-3 text-[10px] text-[#747687] sm:flex-row sm:items-center">
                      <span>Menampilkan {filteredStudents.length ? (studentPage - 1) * 5 + 1 : 0}–{Math.min(studentPage * 5, filteredStudents.length)} dari {filteredStudents.length} mahasiswa</span>
                      <div className="flex items-center gap-1">
                        <button type="button" disabled={studentPage === 1} onClick={() => setStudentPage((page) => Math.max(1, page - 1))} className="rounded-md px-2.5 py-1 text-xs font-bold disabled:opacity-40 cursor-pointer">Sebelumnya</button>
                        {Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => (
                          <button key={page} type="button" onClick={() => setStudentPage(page)} className={`h-7 min-w-7 rounded-md px-2 text-xs font-bold cursor-pointer ${page === studentPage ? 'bg-[#0038d1] text-white' : 'bg-[#f6f2f7]'}`}>{page}</button>
                        ))}
                        <button type="button" disabled={studentPage === pageCount} onClick={() => setStudentPage((page) => Math.min(pageCount, page + 1))} className="rounded-md px-2.5 py-1 text-xs font-bold disabled:opacity-40 cursor-pointer">Selanjutnya</button>
                      </div>
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="rounded-xl bg-[#f6f2f7] p-8 text-center space-y-2">
                <h3 className="font-serif text-lg font-bold">
                  {courseTab === 'assessments' ? 'Daftar Asesmen Modul Terhubung' : 'Pengaturan Rubrik & Parameter'}
                </h3>
                <p className="text-xs text-[#747687] max-w-md mx-auto">
                  {courseTab === 'assessments'
                    ? `${assessments.length} asesmen terhubung aktif di database. Buka tab Assessments di navigasi atas untuk mengubah parameter.`
                    : 'Parameter toleransi relasi simetris dan pembobotan graf dikonfigurasi melalui wizard asesmen.'}
                </p>
              </div>
            )}
          </section>
        )}
      </main>

      {/* Modal Add Course */}
      {isAddCourseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <form onSubmit={addCourse} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border-2 border-[#1B1B1E] space-y-4">
            <h2 className="font-serif text-xl font-bold text-[#1B1B1E]">Tambah Mata Kuliah Baru</h2>
            <p className="text-xs text-[#71717A]">
              Dosen bebas menambahkan mata kuliah apapun di FILKOM UB untuk authoring peta konsep Kit-Build.
            </p>
            <label className="block text-xs font-bold text-[#1B1B1E]">
              Nama Mata Kuliah
              <input required value={newCourseTitle} onChange={(event) => setNewCourseTitle(event.target.value)} placeholder="Contoh: Sistem Operasi, Basis Data, dll." className="mt-1 w-full rounded-lg border border-[#eae7eb] px-3 py-2 text-sm outline-none focus:border-[#0038d1]" />
            </label>
            <label className="block text-xs font-bold text-[#1B1B1E]">
              Kode Mata Kuliah
              <input required value={newCourseCode} onChange={(event) => setNewCourseCode(event.target.value)} placeholder="Contoh: TIF-2105" className="mt-1 w-full rounded-lg border border-[#eae7eb] px-3 py-2 text-sm outline-none focus:border-[#0038d1]" />
            </label>
            <div className="mt-5 flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setIsAddCourseOpen(false)} className="rounded-lg px-4 py-2 text-xs font-bold border border-[#eae7eb] cursor-pointer">Batal</button>
              <button type="submit" className="rounded-lg bg-[#0038d1] px-4 py-2 text-xs font-bold text-white shadow-md cursor-pointer">Simpan Mata Kuliah</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

function SummaryMetric({ icon, title, value, detail, danger = false }: { icon: CourseAssetName; title: string; value: string; detail?: string; danger?: boolean }) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-lg bg-[#f6f2f7] p-2.5">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm"><CourseAsset name={icon} /></span>
      <span className="min-w-0">
        <span className="block text-[9px] font-bold text-[#747687]">{title}</span>
        <span className={`font-serif text-lg font-bold leading-6 ${danger ? 'text-[#b61722]' : ''}`}>{value}</span>
        {detail && <span className="ml-1 text-[8.5px] text-[#747687]">{detail}</span>}
      </span>
    </div>
  );
}

function StudentTable({ students, onNotify }: { students: Student[]; onNotify: (message: string) => void }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[#f0edf1]">
      <table className="w-full min-w-[920px] border-collapse text-left">
        <thead className="bg-[#f6f2f7] text-[8.5px] font-bold uppercase tracking-[0.5px] text-[#444655]">
          <tr>
            <th className="px-3 py-3">Mahasiswa &amp; NIM</th>
            <th className="px-3 py-3">Kehadiran Asesmen</th>
            <th className="px-3 py-3">Skor Kognitif</th>
            <th className="px-3 py-3">Topologi Graf</th>
            <th className="px-3 py-3">Status Diagnosa</th>
            <th className="px-3 py-3 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.nim} className="border-t border-[#f0edf1] text-[9.5px]">
              <td className="px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold" style={{ backgroundColor: student.tone }}>{student.initials}</span>
                  <span className="min-w-0">
                    <strong className="block truncate text-[10.5px]">{student.name}</strong>
                    <span className="text-[8.5px] text-[#747687]">{student.nim} • {student.rombel}</span>
                  </span>
                </div>
              </td>
              <td className="px-3 py-2.5">
                <span className="inline-flex items-center gap-1.5 whitespace-nowrap"><span className={`h-1.5 w-1.5 rounded-full ${student.status === 'complete' ? 'bg-[#0038d1]' : 'bg-[#b61722]'}`} />{student.attendance}</span>
              </td>
              <td className={`px-3 py-2.5 font-serif text-base font-bold ${student.score >= 85 ? 'text-[#0038d1]' : student.score < 70 ? 'text-[#b61722]' : ''}`}>{student.score.toFixed(1)} <span className="font-sans text-[8px] font-normal text-[#747687]">/100</span></td>
              <td className="px-3 py-2.5"><span className="whitespace-nowrap rounded-full bg-[#dee1ff] px-2 py-1 text-[8.5px] font-bold text-[#001257]">● {student.topology}</span></td>
              <td className="px-3 py-2.5">
                <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-1 text-[8.5px] font-bold ${student.gap === 'Perlu Bimbingan' ? 'bg-[#ffdad7] text-[#410004]' : student.gap.includes('Miskonsepsi') ? 'bg-[#ffddb8] text-[#2a1700]' : 'bg-[#ECFDF5] text-[#065F46]'}`}>
                  {student.gap === 'Komprehensif' ? <CourseAsset name="insight" /> : student.gap.includes('Miskonsepsi') ? <CourseAsset name="participantAction" /> : <CourseAsset name="groupAction" />}
                  {student.gap}
                </span>
              </td>
              <td className="px-3 py-2.5">
                <div className="flex justify-end gap-1">
                  <button type="button" aria-label={`Lihat peta ${student.name}`} onClick={() => onNotify(`Peta konsep ${student.name} siap ditinjau di halaman Analytics.`)} className="rounded-md p-1.5 text-[#0038d1] hover:bg-[#f6f2f7] cursor-pointer"><CourseAsset name="mapAction" /></button>
                </div>
              </td>
            </tr>
          ))}
          {students.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-xs text-[#747687]">Tidak ada data mahasiswa.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
