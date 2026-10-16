'use client';

import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { InstructorNavbar, InstructorNavItem } from './InstructorNavbar';
import {
  AssessmentConfig,
  ClassKnowledgeGapSummary,
  MasterConceptMap
} from '../types/maply';

const ASSETS = {
  newAssessment: ['eee2d.svg', 15, 15],
  map: ['30ea8.svg', 12.75, 16.5],
  lesson: ['41d08.svg', 16.5, 14.625],
  courses: ['09188.svg', 18.3333, 15],
  assessments: ['c7ff3.svg', 15, 16.6667],
  participation: ['4d328.svg', 20, 10],
  completion: ['bddce.svg', 16.6667, 10],
  metricLink: ['bcabf.svg', 9.3333, 9.3333],
  activity: ['8bb30.svg', 12, 14],
  warning: ['2ac32.svg', 18.3333, 20.3333],
  assessmentAction: ['1982a.svg', 16.5, 11.25],
  mapAction: ['1fbaa.svg', 15, 13.5],
  studentActivity: ['8b36f.svg', 12.8333, 12.25],
  chevron: ['0ea3b.svg', 5.55, 9],
  score: ['b5adf.svg', 11.6667, 11.0833],
  remedial: ['31bb6.svg', 12.8333, 11.0833],
  externalLink: ['62435.svg', 10.6667, 10.6667],
  mapLink: ['bb47a.svg', 10.5, 10.5],
  masterMap: ['a83c9.svg', 9.3333, 11.6667],
  included: ['3bcbb.svg', 15, 17],
  lock: ['175da.svg', 15, 17],
  limit: ['8c7b1.svg', 13.4167, 11.0833],
  ingest: ['7655a.svg', 16.5, 18.5],
  mapFeature: ['1f32f.svg', 18, 10.25],
  curriculum: ['066db.svg', 16.5, 14.75],
  validation: ['ebb73.svg', 16.5, 17.75],
  sync: ['9e4d4.svg', 15, 15.5],
  trial: ['03d99.svg', 12, 12],
  protocol: ['4ab16.svg', 19.0118, 20],
  profile: ['59e02.svg', 12, 12]
} as const;

type AssetName = keyof typeof ASSETS;

function DesignIcon({ name, className = '' }: { name: AssetName; className?: string }) {
  const [file, width, height] = ASSETS[name];

  return (
    <img
      src={`/figma/dashboard/${file}`}
      width={width}
      height={height}
      alt=""
      aria-hidden="true"
      className={`inline-block shrink-0 ${className}`}
    />
  );
}

interface TeacherDashboardViewProps {
  masterMap: MasterConceptMap;
  assessmentConfig: AssessmentConfig;
  assessments?: AssessmentConfig[];
  analytics: ClassKnowledgeGapSummary;
  currentUser?: { id: string; email: string; full_name: string; role: string; identifier?: string } | null;
  onOpenMap: () => void;
  onOpenCourses: () => void;
  onOpenAssessments: () => void;
  onOpenWizard: () => void;
  onOpenAnalytics: () => void;
  onOpenAiDraft: () => void;
  onLogout: () => void;
}



const FREE_FEATURES = [
  { icon: 'included', text: <>100% Kontrol Pedagogis: <span className="font-normal">Rancang manual konsep & relasi bebas</span></> },
  { icon: 'lock', text: <>Maksimal 5 Master Map Aktif <span className="font-normal">per semester</span></> },
  { icon: 'mapFeature', text: <>Dokumentasi Kit-Builder <span className="font-normal">terintegrasi</span></> },
  { icon: 'curriculum', text: <>Evaluasi Deterministik Graf NetworkX <span className="font-normal">(Zero Hallucination)</span></> },
  { icon: 'limit', text: <>Ekspor Data Analitik &amp; Sinkronisasi SIAKAD UB</> }
] as const;

const PRO_FEATURES = [
  { icon: 'ingest', text: <>AI Document Ingestion: <span className="font-normal">Ekstraksi otomatis SAP, PDF, dan Slide Kuliah</span></> },
  { icon: 'mapFeature', text: <>Master Map Tanpa Batas <span className="font-normal">untuk seluruh kelas FILKOM</span></> },
  { icon: 'curriculum', text: <>Rekomendasi Celah Kurikulum Prediktif (Outcome-Based Education)</> },
  { icon: 'validation', text: <>Dukungan Validasi Ahli: <span className="font-normal">Dosen tetap sebagai Otoritas Penilai</span></> },
  { icon: 'sync', text: <>Seluruh fitur evaluasi graf deterministik &amp; sinkronisasi SIAKAD UB</> }
] as const;

export const TeacherDashboardView: React.FC<TeacherDashboardViewProps> = ({
  masterMap,
  assessmentConfig,
  assessments = [],
  analytics,
  currentUser,
  onOpenMap,
  onOpenCourses,
  onOpenAssessments,
  onOpenWizard,
  onOpenAnalytics,
  onOpenAiDraft,
  onLogout
}) => {
  const [activeNav, setActiveNav] = useState<InstructorNavItem>('Dashboard');
  const totalSubmissions = analytics.total_students ?? analytics.total_submissions ?? 0;
  const passingRate = analytics.passing_rate ?? (totalSubmissions > 0 ? Math.round((analytics.average_score / 100) * 100) : 0);
  const problematic = analytics.problematic_relationships || [];
  const teacherName = currentUser?.full_name || 'Bapak/Ibu Dosen';
  const totalCourses = Math.max(1, new Set(assessments.map((a) => a.description || 'Arsitektur Komputer')).size);

  const navigate = (label: InstructorNavItem) => {
    setActiveNav(label);
    if (label === 'Courses') {
      onOpenCourses();
    } else if (label === 'Maps') {
      onOpenMap();
    } else if (label === 'Assessments') {
      onOpenAssessments();
    } else if (label === 'Analytics') {
      onOpenAnalytics();
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1b1b1e]">
      <InstructorNavbar activeItem={activeNav} currentUser={currentUser} onNavigate={navigate} onLogout={onLogout} />

      <main className="mx-auto flex w-full max-w-[1280px] flex-col gap-10 px-4 py-6 sm:px-8">
        <section className="relative flex flex-col justify-between gap-7 overflow-hidden rounded-2xl bg-white p-6 shadow-[4px_4px_0_#1b1b1e] sm:p-10 lg:flex-row lg:items-center">
          <div className="pointer-events-none absolute -right-8 -top-8 h-64 w-64 rounded-full bg-[#f6f2f7] opacity-60" />
          <div className="pointer-events-none absolute -bottom-16 right-28 h-48 w-48 rotate-12 rounded-2xl bg-[rgba(255,221,184,0.3)]" />
          <div className="relative max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#f0edf1] px-4 py-1 text-[9px] font-bold uppercase tracking-[0.45px]">
              <span className="h-2 w-2 rounded-full bg-[#0038d1]" />
              FILKOM UNIVERSITAS BRAWIJAYA &bull; PORTAL DOSEN
            </span>
            <h1 className="mt-3 font-serif text-3xl font-bold leading-tight tracking-[-0.8px] sm:text-[40px]">
              Selamat Datang, <span className="text-[#0038d1] underline decoration-wavy decoration-[#ffb95f]">{teacherName}</span> 👋
            </h1>
            <p className="mt-2 max-w-xl text-[13px] leading-6 text-[#444655]">
              Pantau dinamika kognitif dan struktur pemahaman mahasiswa secara deterministik tanpa tebakan AI.
              Evaluasi proposisi berbasis grafik Kit-Build secara langsung.
            </p>
          </div>
          <div className="relative flex flex-wrap gap-2 lg:justify-end">
            <button
              type="button"
              onClick={onOpenWizard}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0038d1] px-4 py-3 text-[11px] font-bold text-white shadow-[3px_3px_0_#1b1b1e] transition-transform hover:-translate-y-px"
            >
              <DesignIcon name="newAssessment" /> + Buat Asesmen Baru
            </button>
            <button
              type="button"
              onClick={onOpenMap}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-[11px] font-bold shadow-[3px_3px_0_#1b1b1e] transition-transform hover:-translate-y-px"
            >
              <DesignIcon name="map" /> Peta Konsep Acuan
            </button>
            <button
              type="button"
              onClick={onOpenAiDraft}
              className="inline-flex items-center gap-2 rounded-xl bg-[#eae7eb] px-4 py-3 text-[11px] font-bold shadow-[3px_3px_0_#1b1b1e] transition-transform hover:-translate-y-px"
            >
              <DesignIcon name="lesson" /> Bahan Ajar (AI Draft)
            </button>
          </div>
        </section>

        <section id="teacher-courses" aria-label="Ringkasan kelas dan asesmen" className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4 xl:gap-6">
          <MetricCard title="TOTAL MATAKULIAH" icon="courses" iconTone="blue">
            <strong className="font-serif text-[28px] leading-9">{totalCourses} Kelas Aktif</strong>
            <span className="text-[12px] leading-5 text-[#444655]">{assessmentConfig.description || 'Arsitektur Komputer'}</span>
            <span className="mt-1 inline-flex w-fit rounded-md bg-[#f6f2f7] px-2 py-1.5 text-[9px] font-bold text-[#0038d1]">
              FILKOM Universitas Brawijaya
            </span>
          </MetricCard>
          <MetricCard title="ASESMEN KIT-BUILD" icon="assessments" iconTone="amber">
            <strong className="font-serif text-[28px] leading-9">{assessments.length || 1} Asesmen Aktif</strong>
            <div className="flex items-center gap-2 text-[9px] font-bold">
              <span className="text-[#0038d1]">Token: {assessmentConfig.exam_token || 'KBT-CPU1'}</span>
            </div>
            <span className="mt-1 inline-flex w-fit rounded-md bg-[#f6f2f7] px-2 py-1.5 text-[9px] font-bold text-[#6d4400]">
              Status: Live Room
            </span>
          </MetricCard>
          <MetricCard title="PARTISIPASI SESI" icon="participation" iconTone="red">
            <strong className="font-serif text-[28px] leading-9">
              {totalSubmissions} Mahasiswa
            </strong>
            <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-[#eae7eb]">
              <div
                className="h-full rounded-full bg-[#da3437] transition-all duration-500"
                style={{ width: totalSubmissions > 0 ? `${Math.min(100, totalSubmissions * 20)}%` : '0%' }}
              />
            </div>
            <span className="mt-1 inline-flex w-fit rounded-md bg-[#f6f2f7] px-2 py-1.5 text-[9px] font-bold text-[#da3437]">
              {totalSubmissions > 0 ? `${totalSubmissions} Mahasiswa Telah Mengumpulkan` : 'Belum Ada Mahasiswa Mengumpulkan'}
            </span>
          </MetricCard>
          <MetricCard title="TINGKAT PENYELESAIAN" icon="completion" iconTone="gray">
            <strong className="font-serif text-[28px] leading-9">
              {totalSubmissions > 0 ? `${passingRate}%` : '0%'}
            </strong>
            <span className="text-[12px] leading-5 text-[#444655]">
              Rata-rata Skor: {totalSubmissions > 0 ? analytics.average_score : 0}/100
            </span>
            <button type="button" onClick={onOpenAnalytics} className="mt-1 inline-flex w-fit items-center gap-1 rounded-md bg-[#f6f2f7] px-2 py-1.5 text-[9px] font-bold text-[#0038d1] cursor-pointer">
              <DesignIcon name="metricLink" /> Lihat Analitik Lengkap
            </button>
          </MetricCard>
        </section>

        <section aria-label="Aktivitas asesmen terbaru" className="rounded-2xl bg-white p-4 shadow-[4px_4px_0_#1b1b1e] sm:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.45px]">
              <span className={`h-2.5 w-2.5 rounded-full ${totalSubmissions > 0 ? 'bg-[#059669]' : 'bg-[#71717A]'}`} />
              {totalSubmissions > 0 ? 'SEDANG BERLANGSUNG' : 'SESI TERBUKA — MENUNGGU PENGUMPULAN'}
            </div>
            <span className="rounded-full bg-[#f6f2f7] px-3 py-1 text-[9px] font-bold text-[#444655]">
              <span className="mr-1 text-[#0038d1]">◉</span> Status: {totalSubmissions} Mahasiswa Selesai
            </span>
          </div>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#0038d1] px-2 py-1 text-[8px] font-bold uppercase text-white">FILKOM</span>
                <span className="text-[10px] text-[#747687]">{assessmentConfig.description || 'Kelas Dosen'}</span>
              </div>
              <h2 className="font-serif text-xl font-bold leading-7">
                Asesmen: {assessmentConfig.title}
              </h2>
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-[#444655]">
                <span>{totalSubmissions} Mahasiswa Selesai</span>
                <span>•</span>
                <span>Metode: Closed Kit ({masterMap.nodes.length} Konsep, {masterMap.edges.length} Proposisi)</span>
              </div>

              {totalSubmissions === 0 ? (
                <div className="mt-4 flex items-start gap-2 rounded-xl bg-[#F0EDF1] p-3 text-[11px] leading-5 text-[#444655]">
                  <div className="min-w-0 flex-1 break-words">
                    <strong className="block text-[#1b1b1e]">Belum Ada Pengumpulan Peta Konsep</strong>
                    Sesi asesmen saat ini belum memiliki pengumpulan dari mahasiswa. Analisis miskonsepsi proposisi otomatis aktif begitu tugas pertama dikumpulkan.
                  </div>
                </div>
              ) : problematic.length > 0 ? (
                <div className="mt-4 flex items-start gap-2 rounded-xl bg-[rgba(255,218,215,0.3)] p-3 text-[11px] leading-5 text-[#444655]">
                  <DesignIcon name="warning" className="mt-0.5" />
                  <div className="min-w-0 flex-1 break-words">
                    <strong className="block text-[#1b1b1e]">Deteksi Celah Kognitif (Misconception Detected)</strong>
                    Sebanyak <strong>{problematic[0].error_percentage}% Mahasiswa</strong> keliru menghubungkan proposisi{' '}
                    <b>[{problematic[0].source}]</b> &rarr; <b>[{problematic[0].target}]</b> ({problematic[0].label}).
                  </div>
                </div>
              ) : (
                <div className="mt-4 flex items-start gap-2 rounded-xl bg-[#E6F4EA] p-3 text-[11px] leading-5 text-[#137333]">
                  <div className="min-w-0 flex-1 break-words">
                    <strong className="block text-[#137333]">Pemahaman Konsep Sangat Baik</strong>
                    Tidak ada miskonsepsi struktural dominan yang terdeteksi pada seluruh pengumpulan saat ini.
                  </div>
                </div>
              )}
            </div>
            <div className="flex shrink-0 flex-col gap-2 lg:w-[190px]">
              <button type="button" onClick={onOpenAnalytics} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0038d1] px-4 py-3 text-[10px] font-bold text-white shadow-[3px_3px_0_#1b1b1e] cursor-pointer">
                <DesignIcon name="assessmentAction" /> Buka Analisis Kelas
              </button>
              <button type="button" onClick={onOpenAnalytics} className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2 text-[10px] font-bold text-[#b61722] shadow-[2px_2px_0_#1b1b1e] cursor-pointer">
                <DesignIcon name="mapAction" /> Lihat Knowledge Gap
              </button>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-6" aria-label="Submission mahasiswa dan peta acuan">
          <div className="flex flex-col gap-4 lg:col-span-7">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 font-serif text-xl font-bold tracking-[-0.3px]">
                <DesignIcon name="activity" /> Aktivitas Submission Terkini
              </h2>
              <button type="button" onClick={onOpenAnalytics} className="text-[9px] font-bold text-[#747687] hover:text-[#0038d1]">
                Refresh Network Analysis
              </button>
            </div>
            <div className="overflow-hidden rounded-2xl bg-white shadow-[3px_3px_0_#1b1b1e]">
              {!analytics.student_performances || analytics.student_performances.length === 0 ? (
                <div className="p-8 text-center bg-white space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-[#F0EDF1] border-2 border-[#1B1B1E] mx-auto flex items-center justify-center">
                    <DesignIcon name="activity" />
                  </div>
                  <p className="font-serif font-black text-sm text-[#1B1B1E]">Belum Ada Aktivitas Submission</p>
                  <p className="text-xs text-[#71717A] max-w-sm mx-auto">
                    Belum ada mahasiswa yang mengumpulkan asesmen ini. Mahasiswa dapat memasukkan token ujian untuk mulai mengerjakan di kanvas.
                  </p>
                </div>
              ) : (
                (analytics.student_performances || []).map((perf: { student_id: string; student_name: string; total_score: number; status?: string }) => {
                  const initials = perf.student_name
                    ? perf.student_name.split(' ').map((p: string) => p[0]).join('').slice(0, 2).toUpperCase()
                    : 'M';
                  const isRemedial = perf.total_score < 75;
                  return (
                    <button
                      key={perf.student_id}
                      type="button"
                      onClick={onOpenAnalytics}
                      className="flex w-full items-center justify-between gap-3 border-b border-[#f0edf1] px-4 py-3 text-left last:border-b-0 hover:bg-[#fbf8fc] sm:px-5 cursor-pointer"
                    >
                      <span className="flex min-w-0 items-start gap-3">
                        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[10px] font-bold ${
                          isRemedial ? 'bg-[#ffdad7] text-[#b61722]' : 'bg-[#dee1ff] text-[#0038d1]'
                        }`}>
                          {initials}
                        </span>
                        <span className="min-w-0">
                          <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                            <strong className="text-[10px]">{perf.student_name}</strong>
                            <span className="inline-flex items-center gap-1 text-[8px] text-[#747687]">
                              <DesignIcon name="studentActivity" /> ID: {perf.student_id}
                            </span>
                          </span>
                          <span className="mt-1 flex flex-wrap items-center gap-x-1.5 text-[9px] text-[#444655]">
                            Arsitektur Komputer <span>•</span>
                            <span className="rounded bg-[#f0edf1] px-1.5 py-0.5">Kit-Build Concept Map</span>
                          </span>
                          {isRemedial && (
                            <span className="mt-1 flex items-center gap-1 text-[8px] font-bold text-[#b61722]">
                              <DesignIcon name="remedial" /> Perlu Remedial
                            </span>
                          )}
                        </span>
                      </span>
                      <span className="flex shrink-0 items-center gap-2">
                        <span className="text-right">
                          <strong className={`inline-flex items-center justify-end gap-1 font-serif text-lg ${isRemedial ? 'text-[#b61722]' : 'text-[#0038d1]'}`}>
                            <DesignIcon name="score" />{perf.total_score}<span className="text-[9px] font-normal text-[#444655]"> / 100</span>
                          </strong>
                          <span className={`block text-[8px] ${isRemedial ? 'text-[#b61722]' : 'text-[#747687]'}`}>
                            {perf.status || (isRemedial ? 'Perlu Remedial' : 'Lulus Standar')}
                          </span>
                        </span>
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f6f2f7]">
                          <DesignIcon name="chevron" />
                        </span>
                      </span>
                    </button>
                  );
                })
              )}
              {totalSubmissions > 0 && (
                <div className="border-t border-[#eae7eb] p-3 text-center">
                  <button type="button" onClick={onOpenAnalytics} className="inline-flex items-center gap-2 text-[10px] font-bold text-[#0038d1] cursor-pointer">
                    Lihat Seluruh {totalSubmissions} Hasil Submission <DesignIcon name="externalLink" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:col-span-5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 font-serif text-xl font-bold tracking-[-0.3px]">
                <span className="h-3 w-3 rounded-full bg-[#ffb95f]" /> Peta Konsep Acuan (Master)
              </h2>
              <span className="shrink-0 text-[9px] font-bold text-[#747687]">1 Master Map Aktif</span>
            </div>
            <article className="rounded-2xl bg-white p-4 shadow-[3px_3px_0_#1b1b1e] sm:p-5">
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-full bg-[#dee1ff] px-2 py-1 text-[8px] font-bold text-[#0038d1]">● {masterMap.course_id || 'Arsitektur Komputer'}</span>
                <span className="text-[8px] font-bold text-[#059669]">Status: {masterMap.status || 'approved'}</span>
              </div>
              <h3 className="mt-2 font-serif text-lg font-bold leading-6">
                {masterMap.title}
              </h3>
              <p className="mt-1 text-[10px] leading-5 text-[#444655]">{masterMap.description || 'Peta acuan konsep untuk evaluasi Kit-Build.'}</p>
              <div className="mt-2 flex items-center justify-between border-t border-[#eae7eb] pt-2">
                <div className="flex items-center gap-3 text-[8px] font-bold">
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-[#0038d1]" />{masterMap.nodes.length} Node</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-[#b61722]" />{masterMap.edges.length} Relasi</span>
                </div>
                <button type="button" onClick={onOpenMap} className="inline-flex items-center gap-1 text-[8px] font-bold text-[#0038d1] cursor-pointer">
                  Buka Kanvas <DesignIcon name="mapLink" />
                </button>
              </div>
            </article>
          </div>
        </section>

        <section aria-label="Pilihan lisensi dosen" className="flex flex-col gap-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-[#eae7eb] px-4 py-1 text-[9px] font-bold uppercase tracking-[0.45px]">
                <DesignIcon name="masterMap" /> PILIHAN LISENSI DOSEN
              </span>
              <h2 className="mt-2 font-serif text-2xl font-bold tracking-[-0.5px] sm:text-[28px]">Tingkatkan Kapasitas Authoring Peta Konsep Anda</h2>
              <p className="mt-1 text-[12px] leading-5 text-[#444655]">
                Fleksibilitas penuh antara kontrol pedagogis manual murni versus akselerasi ekstraksi materi ajar cerdas
                berbasis AI untuk efisiensi beban kerja dosen FILKOM UB.
              </p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-2 self-start rounded-xl bg-white px-3 py-2 text-[9px] shadow-[2px_2px_0_#1b1b1e] sm:self-auto">
              <span className="h-2 w-2 rounded-full bg-[#0038d1]" /> Akun Akademik Resmi Terverifikasi
            </span>
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <LicenseCard
              kind="free"
              title="Coba Gratis"
              subtitle="Penyusunan Peta Manual Penuh"
              description="Dirancang sangat pragmatis dengan bebas authoring konsep mandiri berstandar riset."
              features={FREE_FEATURES}
              buttonLabel="Paket Dasar Digunakan"
              onClick={onOpenMap}
            />
            <LicenseCard
              kind="pro"
              title="Coba Gratis 14 Hari"
              subtitle="Asisten AI Ekstraksi Silabus & Dokumen Ajar"
              description="Unggah slide kuliah, paper acuan, atau RPS untuk men-generate draf kanvas konsep dalam hitungan detik."
              features={PRO_FEATURES}
              buttonLabel="Coba AI Pro Dosen 14 Hari"
              onClick={onOpenAiDraft}
            />
          </div>
        </section>

        <button
          type="button"
          onClick={onOpenMap}
          className="flex flex-col items-start gap-4 rounded-2xl bg-[#f0edf1] p-6 text-left shadow-[3px_3px_0_#1b1b1e] transition-transform hover:-translate-y-px sm:flex-row sm:items-center sm:justify-between sm:p-8"
        >
          <span className="flex items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#0038d1] shadow-[2px_2px_0_#1b1b1e]">
              <DesignIcon name="protocol" />
            </span>
            <span>
              <strong className="block font-serif text-lg">Kit-Build Concept Map Research Protocol</strong>
              <span className="mt-1 block text-[10px] text-[#444655]">Framework F. Hirashima (Hiroshima University) sebagai landasan berbasis konseptual FILKOM UB.</span>
            </span>
          </span>
          <span className="flex flex-wrap gap-2 text-[8px] font-bold text-[#444655]">
            <span className="rounded-full bg-white px-3 py-2">F1-Score: 0.842</span>
            <span className="rounded-full bg-white px-3 py-2">Graph Logic: 100% Audit</span>
          </span>
        </button>
      </main>

      <footer className="bg-[#f6f2f7] px-4 py-5 sm:px-8">
        <div className="mx-auto flex max-w-[1216px] flex-col justify-between gap-3 text-[8px] text-[#747687] sm:flex-row sm:items-center">
          <span>MAPLE COGNITIVE LAB • Kit-Build Concept Map Method (F. Hirashima Framework) — FILKOM Universitas Brawijaya • Malang</span>
          <span>© 2025 Fakultas Ilmu Komputer UB</span>
        </div>
      </footer>
    </div>
  );
};

function MetricCard({
  title,
  icon,
  iconTone,
  children
}: {
  title: string;
  icon: AssetName;
  iconTone: 'blue' | 'amber' | 'red' | 'gray';
  children: React.ReactNode;
}) {
  const toneClasses = {
    blue: 'bg-[#dee1ff]',
    amber: 'bg-[#ffddb8]',
    red: 'bg-[#ffdad7]',
    gray: 'bg-[#eae7eb]'
  };

  return (
    <article className="flex min-h-[178px] flex-col justify-between gap-3 rounded-2xl bg-white p-5 shadow-[3px_3px_0_#1b1b1e] sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[9px] font-bold uppercase tracking-[0.45px] text-[#444655]">{title}</span>
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${toneClasses[iconTone]}`}><DesignIcon name={icon} /></span>
      </div>
      <div className="flex flex-col gap-1">{children}</div>
    </article>
  );
}

function LicenseCard({
  kind,
  title,
  subtitle,
  description,
  features,
  buttonLabel,
  onClick
}: {
  kind: 'free' | 'pro';
  title: string;
  subtitle: string;
  description: string;
  features: ReadonlyArray<{ icon: AssetName; text: React.ReactNode }>;
  buttonLabel: string;
  onClick: () => void;
}) {
  const isPro = kind === 'pro';

  return (
    <article className={`flex flex-col rounded-2xl bg-white p-6 shadow-[3px_3px_0_#1b1b1e] ${isPro ? 'border-t-4 border-[#0038d1]' : ''}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="rounded-full bg-[#eae7eb] px-2 py-1 text-[8px] font-bold uppercase tracking-[0.35px]">
          {isPro ? '✦ AI Augmented Pro' : '◉ Edu Free Tier (Aktif)'}
        </span>
        <span className={`rounded-full px-2 py-1 text-[8px] font-bold ${isPro ? 'bg-[#ffddb8] text-[#6d4400]' : 'text-[#747687]'}`}>
          {isPro ? 'AKSELERASI AI' : 'Standar FILKOM'}
        </span>
      </div>
      <div className="mt-3">
        <h3 className={`font-serif text-[40px] font-bold leading-[48px] ${isPro ? 'text-[#0038d1]' : ''}`}>{title}</h3>
        <strong className="mt-2 block text-[12px]">{subtitle}</strong>
        <p className="mt-1 text-[10px] leading-5 text-[#444655]">{description}</p>
      </div>
      <div className="my-4 border-t border-[#eae7eb]" />
      <ul className="flex-1 space-y-2.5 pb-5">
        {features.map((feature, index) => (
          <li key={`${kind}-${index}`} className="flex items-start gap-2 text-[10px] leading-5">
            <DesignIcon name={feature.icon} className="mt-0.5" />
            <span>{feature.text}</span>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={onClick}
        className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-[10px] font-bold transition-transform hover:-translate-y-px ${
          isPro ? 'bg-[#0038d1] text-white shadow-[3px_3px_0_#1b1b1e]' : 'bg-[#eae7eb] text-[#444655]'
        }`}
      >
        {buttonLabel}
        {isPro && <DesignIcon name="trial" />}
        {!isPro && <ChevronRight className="h-3 w-3" />}
      </button>
    </article>
  );
}
