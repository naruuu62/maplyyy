'use client';

import React, { useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowDownUp,
  ArrowUpRight,
  BookOpen,
  CalendarClock,
  ChevronDown,
  CircleHelp,
  Clock3,
  FileText,
  Filter,
  Gauge,
  Layers3,
  Search,
  Settings2,
  SlidersHorizontal,
  Sparkles,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { AssessmentConfig, ClassKnowledgeGapSummary, MasterConceptMap, User } from '../types/maply';
import { InstructorNavbar, InstructorNavItem } from './InstructorNavbar';

interface TeacherAssessmentsViewProps {
  assessmentConfig: AssessmentConfig;
  masterMap: MasterConceptMap;
  assessments?: AssessmentConfig[];
  analytics?: ClassKnowledgeGapSummary;
  currentUser?: User | null;
  onNavigate: (item: InstructorNavItem) => void;
  onCreateAssessment: () => void;
  onSaveAssessment: (config: AssessmentConfig) => Promise<void>;
  onLogout: () => void;
}

type AssessmentStatus = 'Published (Aktif)' | 'Scheduled' | 'Selesai & Dievaluasi';

const statusClasses: Record<AssessmentStatus, string> = {
  'Published (Aktif)': 'bg-[#e6f4ea] text-[#0038d1]',
  Scheduled: 'bg-[#ffddb8] text-[#6d4400]',
  'Selesai & Dievaluasi': 'bg-[#eae7eb] text-[#444655]',
};

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? 'bg-[#0038d1]' : 'bg-[#c4c5d8]'}`}
    >
      <span
        className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`}
      />
    </button>
  );
}

function SettingRow({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg bg-[#f6f2f7] p-3">
      <div className="min-w-0">
        <p className="text-xs font-bold">{title}</p>
        <p className="mt-1 text-[10px] leading-4 text-[#747687]">{description}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} label={title} />
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] font-bold uppercase tracking-[0.4px] text-[#747687]">
      {children}
    </span>
  );
}

export const TeacherAssessmentsView: React.FC<TeacherAssessmentsViewProps> = ({
  assessmentConfig,
  masterMap,
  assessments = [],
  analytics,
  currentUser,
  onNavigate,
  onCreateAssessment,
  onSaveAssessment,
  onLogout,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua status');
  const [duration, setDuration] = useState(assessmentConfig.duration_minutes);
  const [randomizeKit, setRandomizeKit] = useState(assessmentConfig.randomize_kit);
  const [allowBidirectional, setAllowBidirectional] = useState(
    assessmentConfig.allow_bidirectional_tolerance,
  );
  const [showKnowledgeGap, setShowKnowledgeGap] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState('');

  const assessmentItems = useMemo(() => {
    const list = assessments && assessments.length > 0 ? assessments : [assessmentConfig];
    return list.map((a) => {
      const desc = a.description || '';
      let courseName = masterMap.title || 'Arsitektur Komputer';
      let className = desc || 'Rombel A & B';
      if (desc.includes('Kelas') || desc.includes('Rombel')) {
        const parts = desc.split(/[-–(]/);
        if (parts[0]?.trim()) courseName = parts[0].trim();
      } else if (a.title.toLowerCase().includes('sistem operasi')) {
        courseName = 'Sistem Operasi';
      } else if (a.title.toLowerCase().includes('basis data')) {
        courseName = 'Basis Data';
      } else if (a.title.toLowerCase().includes('jaringan')) {
        courseName = 'Jaringan Komputer';
      }

      const isPublished = Boolean(a.exam_token);
      const totalStudents = analytics?.total_students || 0;
      const totalSubmissions = analytics?.total_submissions || totalStudents;
      const partPct = totalStudents > 0 ? Math.round((totalSubmissions / totalStudents) * 100) : (isPublished ? 100 : 0);
      const avgScore = analytics?.total_students ? Number(analytics.average_score) : (a.passing_grade || 75.0);

      return {
        id: a.id,
        title: a.title,
        detail: `Kit-Build • ${a.duration_minutes || 30} Menit • Token: ${a.exam_token || 'Belum Terbit'}`,
        course: courseName,
        className: className,
        participation: isPublished ? partPct : 0,
        status: (isPublished ? 'Published (Aktif)' : 'Scheduled') as AssessmentStatus,
        deadline: 'Sesi Aktif',
        score: avgScore,
        note: isPublished ? `Token: ${a.exam_token}` : 'Draf Asesmen'
      };
    });
  }, [assessments, assessmentConfig, masterMap.title, analytics]);

  const filteredAssessments = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return assessmentItems.filter((assessment) => {
      const matchesQuery =
        !query ||
        `${assessment.title} ${assessment.course} ${assessment.className}`
          .toLocaleLowerCase()
          .includes(query);
      const matchesStatus =
        statusFilter === 'Semua status' ||
        (statusFilter === 'Aktif' && assessment.status === 'Published (Aktif)') ||
        (statusFilter === 'Terjadwal' && assessment.status === 'Scheduled') ||
        (statusFilter === 'Selesai' && assessment.status === 'Selesai & Dievaluasi');
      return matchesQuery && matchesStatus;
    });
  }, [search, statusFilter, assessmentItems]);

  const saveParameters = async () => {
    setIsSaving(true);
    setNotice('');
    try {
      await onSaveAssessment({
        ...assessmentConfig,
        duration_minutes: duration,
        time_limit_minutes: duration,
        randomize_kit: randomizeKit,
        allow_bidirectional_tolerance: allowBidirectional,
        allow_bidirectional_fallback: allowBidirectional,
      });
      setNotice('Parameter asesmen berhasil disimpan.');
    } catch (error) {
      console.error('Failed to save assessment parameters:', error);
      setNotice('Parameter gagal disimpan. Coba lagi.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1b1b1e]">
      <InstructorNavbar activeItem="Assessments" currentUser={currentUser} onNavigate={onNavigate} onLogout={onLogout} />

      <main className="mx-auto flex w-full max-w-[1280px] flex-col gap-6 px-4 py-6 sm:px-8 sm:py-8">
        <section className="relative flex flex-col items-start justify-between gap-5 overflow-hidden rounded-2xl bg-white p-5 shadow-[4px_4px_0_#1b1b1e] sm:p-7 lg:flex-row lg:items-center">
          <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-12 h-48 w-48 rounded-full bg-[#f6f2f7]" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-16 right-40 h-32 w-32 rotate-12 rounded-2xl bg-[rgba(255,221,184,0.35)]" />
          <div className="relative max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.5px] text-[#747687]">
              <span className="h-2.5 w-2.5 rounded-full bg-[#0038d1]" />
              Kit-Build Protocol Hirashima • Section 10 OBE
              <span className="rounded-full bg-[#f0edf1] px-2 py-1 text-[#444655]">
                Semester Ganjil 2026/2027
              </span>
            </div>
            <h1 className="mt-2 font-serif text-3xl font-bold leading-tight tracking-[-0.8px] sm:text-[40px]">
              Manajemen &amp; Konfigurasi Asesmen
            </h1>
            <p className="mt-2 text-[13px] leading-6 text-[#444655]">
              Atur parameter dekomposisi Kit-Build, toleransi relasi graf, dan pantau status
              partisipasi mahasiswa dengan skoring propositional accuracy otomatis.
            </p>
          </div>
          <div className="relative flex w-full flex-col gap-2 min-[460px]:w-auto min-[460px]:flex-row lg:shrink-0">
            <button
              type="button"
              onClick={() => setNotice('Impor templat Master Map belum terhubung.')}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-[11px] font-bold shadow-[3px_3px_0_#1b1b1e] transition-transform hover:-translate-y-px"
            >
              <Layers3 className="h-4 w-4" />
              Impor Templat Master
            </button>
            <button
              type="button"
              onClick={onCreateAssessment}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0038d1] px-5 py-2.5 text-[11px] font-bold text-white shadow-[3px_3px_0_#1b1b1e] transition-transform hover:-translate-y-px"
            >
              <span aria-hidden="true" className="text-base leading-none">+</span>
              Buat Asesmen Baru
            </button>
          </div>
        </section>

        {notice && (
          <div
            role="status"
            className="flex items-center justify-between gap-3 rounded-xl border border-[#eae7eb] bg-white px-4 py-3 text-xs font-semibold shadow-[2px_2px_0_#1b1b1e]"
          >
            {notice}
            <button type="button" aria-label="Tutup pemberitahuan" onClick={() => setNotice('')}>
              ×
            </button>
          </div>
        )}

        <section aria-label="Ringkasan status asesmen" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Total asesmen aktif" icon={FileText} iconTone="blue">
            <div className="flex items-baseline gap-2">
              <strong className="font-serif text-4xl">{assessmentItems.length}</strong>
              <span className="text-[10px] text-[#747687]">/ {assessments.length || 1} Terdaftar</span>
            </div>
            <span className="inline-flex items-center gap-2 text-[10px] text-[#444655]">
              <span className="h-2 w-2 rounded-full bg-[#0038d1]" />
              {assessmentItems.filter((a) => a.status === 'Published (Aktif)').length || 1} berlangsung aktif
            </span>
          </MetricCard>
          <MetricCard label="Tingkat penyerahan" icon={Users} iconTone="gray">
            <div className="flex items-baseline gap-2">
              <strong className="font-serif text-4xl">
                {analytics?.total_students
                  ? `${Math.round(((analytics.total_submissions || analytics.total_students) / analytics.total_students) * 100)}%`
                  : '100%'}
              </strong>
              <span className="text-[10px] text-[#747687]">
                ({analytics?.total_submissions || analytics?.total_students || 0}/{analytics?.total_students || 0} mhs)
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#f0edf1]">
              <div
                className="h-full rounded-full bg-[#0038d1] transition-all"
                style={{
                  width: analytics?.total_students
                    ? `${Math.min(100, Math.round(((analytics.total_submissions || analytics.total_students) / analytics.total_students) * 100))}%`
                    : '100%'
                }}
              />
            </div>
          </MetricCard>
          <MetricCard label="Rerata proposition accuracy" icon={Gauge} iconTone="amber">
            <div className="flex items-baseline gap-2">
              <strong className="font-serif text-4xl">
                {analytics?.total_students ? Number(analytics.average_score).toFixed(1) : '0.0'}
              </strong>
              <span className="text-[10px] text-[#747687]">/ 100</span>
            </div>
            <span className="inline-flex items-center gap-2 text-[10px] font-bold text-[#0038d1]">
              <ArrowUpRight className="h-3 w-3" />
              {analytics?.total_students ? 'Deterministik Graf OBE' : 'Menunggu Pengerjaan'}
            </span>
          </MetricCard>
          <MetricCard label="Miskonsepsi terdeteksi" icon={AlertTriangle} iconTone="red">
            <strong className="font-serif text-4xl text-[#b61722]">
              {analytics?.problematic_relationships?.length || 0} Kasus
            </strong>
            <span
              className="text-[10px] leading-4 text-[#444655] truncate"
              title={analytics?.problematic_relationships?.[0] ? `${analytics.problematic_relationships[0].source} ↔ ${analytics.problematic_relationships[0].target}` : ''}
            >
              {analytics?.problematic_relationships?.[0]
                ? `Tinggi: ${analytics.problematic_relationships[0].source} ↔ ${analytics.problematic_relationships[0].target}`
                : 'Tidak ada miskonsepsi signifikan'}
            </span>
          </MetricCard>
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-[4px_4px_0_#1b1b1e] sm:p-6">
          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0038d1] text-xs font-bold text-white shadow-[2px_2px_0_#1b1b1e]">01</span>
              <div>
                <h2 className="font-serif text-xl font-bold sm:text-[22px]">Konfigurasi Parameter Asesmen Aktif</h2>
                <p className="mt-1 text-xs leading-5 text-[#444655]">
                  Dekomposisi Master Concept Map menjadi kit modular untuk evaluasi kognitif mahasiswa.
                </p>
              </div>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#f6f2f7] px-3 py-1.5 text-[10px] font-bold">
              <span className="h-2 w-2 rounded-full bg-[#b61722]" />
              Mode Konfigurasi Aktif
            </span>
          </div>

          <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-3">
            <section className="rounded-xl border border-[#eae7eb] bg-[#fbf8fc] p-4 shadow-[2px_2px_0_#1b1b1e]">
              <PanelHeading icon={BookOpen} title="1. Informasi Dasar" badge="Konteks OBE" />
              <div className="mt-4 space-y-4">
                <div>
                  <FieldLabel>Mata kuliah &amp; rombel</FieldLabel>
                  <div className="mt-1 flex items-center justify-between gap-2 rounded-lg bg-[#f6f2f7] px-3 py-2 text-xs">
                    <span>{assessmentConfig.description || `${masterMap.title} - Rombel A & B`}</span>
                    <ChevronDown className="h-4 w-4 shrink-0 text-[#747687]" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <FieldLabel>Master Map Acuan</FieldLabel>
                    <button type="button" onClick={() => onNavigate('Maps')} className="text-[10px] font-bold text-[#0038d1] hover:underline">
                      Lihat peta
                    </button>
                  </div>
                  <div className="mt-1 rounded-lg bg-[#f6f2f7] p-3">
                    <div className="flex items-start gap-2">
                      <Layers3 className="mt-0.5 h-4 w-4 shrink-0 text-[#0038d1]" />
                      <div>
                        <p className="text-xs font-bold">{masterMap.title}</p>
                        <p className="mt-1 text-[10px] text-[#747687]">{masterMap.nodes.length} konsep • {masterMap.edges.length} relasi • Rev. 3</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <FieldLabel>Judul asesmen</FieldLabel>
                  <p className="mt-1 rounded-lg bg-[#f6f2f7] px-3 py-2 text-xs">{assessmentConfig.title}</p>
                </div>
                <div>
                  <FieldLabel>Instruksi pengerjaan</FieldLabel>
                  <p className="mt-1 min-h-20 rounded-lg bg-[#f6f2f7] px-3 py-2 text-xs leading-5 text-[#444655]">
                    {assessmentConfig.instructions || 'Susun kembali kepingan konsep sesuai alur dan relasi yang tepat.'}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-[#eae7eb] bg-[#fbf8fc] p-4 shadow-[2px_2px_0_#1b1b1e]">
              <PanelHeading icon={CalendarClock} title="2. Waktu & Sesi" badge="SLA Timer" />
              <div className="mt-4 space-y-4">
                <label className="block">
                  <FieldLabel>Batas waktu pengerjaan (durasi)</FieldLabel>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={240}
                      value={duration}
                      onChange={(event) => setDuration(Math.max(1, Number(event.target.value) || 1))}
                      className="w-24 rounded-lg bg-[#f6f2f7] px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-[#0038d1]"
                    />
                    <span className="text-xs text-[#747687]">menit per mahasiswa</span>
                  </div>
                </label>
                <div>
                  <FieldLabel>Jadwal rilis &amp; tenggat (WIB)</FieldLabel>
                  <div className="mt-1 space-y-2 rounded-lg bg-[#f6f2f7] p-3 text-xs">
                    <div className="flex justify-between gap-3"><span className="text-[#747687]">Buka (Mulai)</span><strong>Sesi Aktif (Live)</strong></div>
                    <div className="flex justify-between gap-3"><span className="text-[#747687]">Tenggat (Deadline)</span><strong className="text-[#b61722]">Hari ini 23:59 WIB</strong></div>
                  </div>
                </div>
                <div className="rounded-lg bg-[#f6f2f7] p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold">Visibilitas Knowledge Gap</p>
                      <p className="mt-1 text-[10px] leading-4 text-[#747687]">Tampilkan skor dan peta kesalahan graf setelah mahasiswa menekan Submit.</p>
                    </div>
                    <Toggle checked={showKnowledgeGap} onChange={() => setShowKnowledgeGap((value) => !value)} label="Visibilitas Knowledge Gap" />
                  </div>
                </div>
                <div className="flex items-start gap-2 rounded-lg border border-[#ffddb8] bg-[#fff8ef] p-3 text-[10px] leading-4 text-[#6d4400]">
                  <CircleHelp className="mt-0.5 h-4 w-4 shrink-0" />
                  Jadwal detail dapat disesuaikan melalui wizard pembuatan asesmen.
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-[#eae7eb] bg-[#fbf8fc] p-4 shadow-[2px_2px_0_#1b1b1e]">
              <PanelHeading icon={SlidersHorizontal} title="3. Engine Kit-Build" badge="F. Hirashima" />
              <div className="mt-4 space-y-3">
                <SettingRow
                  title="Acak Urutan Concept Kit"
                  description="Posisi node pada palet di-random"
                  checked={randomizeKit}
                  onChange={() => setRandomizeKit((value) => !value)}
                />
                <SettingRow
                  title="Toleransi Relasi Komutatif"
                  description="Bebaskan arah panah relasi simetris"
                  checked={allowBidirectional}
                  onChange={() => setAllowBidirectional((value) => !value)}
                />
                <div>
                  <FieldLabel>Kartu distraktor (jebakan miskonsepsi)</FieldLabel>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {((assessmentConfig.distractor_nodes && assessmentConfig.distractor_nodes.length > 0) || (assessmentConfig.distractors && assessmentConfig.distractors.length > 0)) ? (
                      (assessmentConfig.distractor_nodes || (assessmentConfig.distractors || []).map((d, i) => ({ id: `dist-${i}`, label: d }))).map((distractor) => (
                        <span key={distractor.id} className="rounded-md bg-[#ffe4e6] border border-[#f43f5e] text-[#be123c] px-2.5 py-1.5 text-[10px] font-bold">
                          {distractor.label}
                        </span>
                      ))
                    ) : (
                      <span className="rounded-md bg-[#f6f2f7] px-2.5 py-1.5 text-[10px] text-[#747687]">
                        Tidak ada kartu distraktor aktif
                      </span>
                    )}
                  </div>
                </div>
                <div className="rounded-lg bg-[#f6f2f7] p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold">Preview kit konseptual</span>
                    <span className="text-[10px] text-[#747687]">{masterMap.nodes.length} node</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {masterMap.nodes.slice(0, 6).map((node) => (
                      <span key={node.id} className="rounded-md border border-[#d7d9eb] bg-white px-2 py-1 text-[10px] font-semibold">
                        {node.label}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={saveParameters}
                  disabled={isSaving}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#eae7eb] px-3 py-2.5 text-xs font-bold shadow-[2px_2px_0_#1b1b1e] transition-transform hover:-translate-y-px disabled:cursor-wait disabled:opacity-60"
                >
                  <Settings2 className="h-4 w-4" />
                  {isSaving ? 'Menyimpan...' : 'Simpan Parameter'}
                </button>
              </div>
            </section>
          </div>

          <div className="flex flex-col justify-between gap-3 border-t border-[#e2dfe4] pt-4 sm:flex-row sm:items-center">
            <p className="text-[10px] text-[#747687]">Parameter yang disimpan berlaku pada asesmen aktif dan dapat diubah kembali.</p>
            <button
              type="button"
              onClick={onCreateAssessment}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0038d1] px-4 py-2.5 text-[11px] font-bold text-white shadow-[3px_3px_0_#1b1b1e] transition-transform hover:-translate-y-px"
            >
              <Sparkles className="h-4 w-4" />
              Buat Asesmen Baru
            </button>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-[4px_4px_0_#1b1b1e] sm:p-6">
          <div className="mb-5 flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
            <div>
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-[#0038d1]" />
                <h2 className="font-serif text-xl font-bold sm:text-[22px]">Daftar Asesmen &amp; Status Mahasiswa</h2>
              </div>
              <p className="mt-1 text-xs leading-5 text-[#444655]">
                Pantau distribusi skor, partisipasi rombel, dan evaluasi hasil secara langsung.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[460px]:flex-row">
              <label className="relative min-w-0 flex-1 min-[460px]:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Cari asesmen atau topik..."
                  className="w-full rounded-lg bg-[#f6f2f7] py-2 pl-9 pr-3 text-xs outline-none focus:ring-2 focus:ring-[#0038d1]"
                />
              </label>
              <label className="flex items-center gap-2 rounded-lg bg-[#f6f2f7] px-3 py-2 text-xs">
                <Filter className="h-4 w-4 text-[#747687]" />
                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="min-w-24 bg-transparent outline-none">
                  <option>Semua status</option>
                  <option>Aktif</option>
                  <option>Terjadwal</option>
                  <option>Selesai</option>
                </select>
              </label>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] border-separate border-spacing-0 text-left">
              <thead>
                <tr className="bg-[#f6f2f7] text-[9px] font-bold uppercase tracking-[0.4px] text-[#444655]">
                  <th className="rounded-l-lg px-4 py-3">Detail asesmen</th>
                  <th className="px-4 py-3">Mata kuliah &amp; rombel</th>
                  <th className="px-4 py-3">Partisipasi</th>
                  <th className="px-4 py-3">Status &amp; tenggat</th>
                  <th className="px-4 py-3">Rata-rata skor</th>
                  <th className="rounded-r-lg px-4 py-3 text-right">Aksi kontrol</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssessments.map((assessment, index) => (
                  <tr key={assessment.id} className={index > 0 ? 'border-t border-[#f0edf1]' : ''}>
                    <td className="max-w-64 px-4 py-4">
                      <div className="flex items-start gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#dee1ff] text-[#0038d1]">
                          <FileText className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="text-xs font-bold">Asesmen #{String(index + 1).padStart(2, '0')}: {assessment.title}</p>
                          <p className="mt-1 text-[10px] text-[#747687]">{assessment.detail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-xs">
                      <p className="font-semibold">{assessment.course}</p>
                      <p className="mt-1 text-[10px] text-[#747687]">{assessment.className}</p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[#eae7eb]">
                          <div className="h-full rounded-full bg-[#0038d1]" style={{ width: `${assessment.participation}%` }} />
                        </div>
                        <span className="text-[10px] font-bold">{assessment.participation}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-full px-2 py-1 text-[9px] font-bold ${statusClasses[assessment.status]}`}>
                        {assessment.status}
                      </span>
                      <p className="mt-1 text-[10px] text-[#747687]">{assessment.deadline}</p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-baseline gap-1">
                        <strong className="font-serif text-xl">{assessment.score ? assessment.score.toFixed(1) : '—'}</strong>
                        {assessment.score > 0 && <span className="text-[10px] text-[#747687]">/100</span>}
                      </div>
                      <p className="mt-1 text-[9px] font-bold text-[#0038d1]">{assessment.note}</p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onNavigate('Analytics')}
                          className="inline-flex items-center gap-1 rounded-lg bg-[#0038d1] px-2.5 py-2 text-[10px] font-bold text-white shadow-[2px_2px_0_#1b1b1e] hover:bg-[#2349df]"
                        >
                          Hasil <ArrowDownUp className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={onCreateAssessment}
                          aria-label={`Buat asesmen berdasarkan ${assessment.title}`}
                          title="Buat asesmen baru"
                          className="rounded-lg bg-[#f0edf1] p-2 shadow-[2px_2px_0_#1b1b1e] hover:bg-[#eae7eb]"
                        >
                          <Clock3 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredAssessments.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-xs text-[#747687]">
                      Tidak ada asesmen yang cocok dengan pencarian atau filter ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex flex-col justify-between gap-3 border-t border-[#f0edf1] pt-4 text-[10px] text-[#444655] sm:flex-row sm:items-center">
            <span>Menampilkan {filteredAssessments.length} dari {assessmentItems.length} asesmen terdaftar</span>
            <div className="flex items-center gap-1">
              <button type="button" disabled className="rounded bg-[#f6f2f7] px-3 py-1.5 opacity-50">Sebelumnya</button>
              <span className="rounded bg-[#0038d1] px-3 py-1.5 font-bold text-white">1</span>
              <button type="button" disabled className="rounded bg-[#f6f2f7] px-3 py-1.5 opacity-50">Selanjutnya</button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

function MetricCard({
  label,
  icon,
  iconTone,
  children,
}: {
  label: string;
  icon: LucideIcon;
  iconTone: 'blue' | 'gray' | 'amber' | 'red';
  children: React.ReactNode;
}) {
  const tones = {
    blue: 'bg-[#dee1ff] text-[#0038d1]',
    gray: 'bg-[#eae7eb] text-[#444655]',
    amber: 'bg-[#ffddb8] text-[#8e5900]',
    red: 'bg-[#ffdad7] text-[#b61722]',
  };
  return (
    <article className="flex min-h-36 flex-col justify-between gap-4 rounded-xl bg-white p-4 shadow-[0_4px_6px_rgba(0,0,0,0.1)]">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[9px] font-bold uppercase tracking-[0.4px] text-[#747687]">{label}</span>
        <span className={`flex h-7 w-7 items-center justify-center rounded-full ${tones[iconTone]}`}>
          {React.createElement(icon, { className: 'h-3.5 w-3.5' })}
        </span>
      </div>
      <div className="flex flex-1 flex-col justify-between gap-2">{children}</div>
    </article>
  );
}

function PanelHeading({
  icon,
  title,
  badge,
}: {
  icon: LucideIcon;
  title: string;
  badge: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-[#f0edf1] pb-3">
      <div className="flex min-w-0 items-center gap-2">
        <span className="text-[#0038d1]">{React.createElement(icon, { className: 'h-4 w-4' })}</span>
        <h3 className="font-serif text-base font-bold">{title}</h3>
      </div>
      <span className="shrink-0 rounded bg-[#f0edf1] px-2 py-1 text-[9px] font-semibold text-[#444655]">{badge}</span>
    </div>
  );
}
