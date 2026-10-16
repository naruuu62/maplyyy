'use client';

import React, { useState, useMemo } from 'react';
import { AssessmentConfig, ConceptKit, EvaluationResult } from '../types/maply';
import {
  BookOpen,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Search,
  Filter,
  Layers,
  Award,
  Sparkles,
  Play,
  RotateCcw,
  ChevronRight,
  ShieldCheck,
  KeyRound
} from 'lucide-react';

interface StudentAssessmentsViewProps {
  assessments?: AssessmentConfig[];
  assessmentConfig?: AssessmentConfig;
  kit: ConceptKit | null;
  submissions?: EvaluationResult[];
  onStartWorkspace: (assessmentId: string) => void;
  onViewResults: (assessmentId: string) => void;
}

export const StudentAssessmentsView: React.FC<StudentAssessmentsViewProps> = ({
  assessments = [],
  assessmentConfig,
  kit,
  submissions = [],
  onStartWorkspace,
  onViewResults
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'in_progress' | 'completed'>('all');
  const [courseFilter, setCourseFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fallback to assessmentConfig if assessments list is empty
  const rawList: AssessmentConfig[] = useMemo(() => {
    if (assessments && assessments.length > 0) return assessments;
    if (assessmentConfig) return [assessmentConfig];
    return [];
  }, [assessments, assessmentConfig]);

  // Helper to extract course metadata cleanly without hardcoding
  const getCourseInfo = (asm: AssessmentConfig) => {
    const desc = asm.description || '';
    if (desc.includes('Kelas') || desc.includes('Rombel') || desc.includes('(')) {
      const parts = desc.split(/[-–(]/);
      if (parts[0]?.trim()) {
        return {
          course: parts[0].trim(),
          code: 'FILKOM-UB',
          lecturer: 'Dosen Pengampu'
        };
      }
    }
    const t = (asm.title + ' ' + desc).toLowerCase();
    if (t.includes('sistem operasi') || t.includes('paging') || t.includes('scheduling')) {
      return { course: 'Sistem Operasi', code: 'TIF-2103', lecturer: 'Dosen Pengampu' };
    }
    if (t.includes('basis data') || t.includes('database') || t.includes('sql') || t.includes('relasional')) {
      return { course: 'Basis Data', code: 'TIF-2104', lecturer: 'Dosen Pengampu' };
    }
    if (t.includes('jaringan') || t.includes('network') || t.includes('osi') || t.includes('tcp')) {
      return { course: 'Jaringan Komputer', code: 'TIF-2102', lecturer: 'Dosen Pengampu' };
    }
    if (t.includes('cpu') || t.includes('arsitektur') || t.includes('komputer') || t.includes('alu')) {
      return { course: 'Arsitektur Komputer', code: 'TIF-2101', lecturer: 'Dosen Pengampu' };
    }
    return {
      course: desc.trim() || 'Teknik Informatika',
      code: 'TIF-KBT',
      lecturer: 'Dosen Pengampu'
    };
  };

  // Build items with real submission evaluation statuses
  const items = useMemo(() => {
    return rawList.map((asm) => {
      const existingSub = submissions.find((s) => s.assessment_id === asm.id);
      const courseInfo = getCourseInfo(asm);
      const isCompleted = !!existingSub;

      return {
        id: asm.id,
        title: asm.title,
        course: courseInfo.course,
        code: courseInfo.code,
        lecturer: courseInfo.lecturer,
        status: isCompleted ? ('completed' as const) : ('in_progress' as const),
        statusLabel: isCompleted
          ? `Telah Dinilai • Skor ${existingSub.total_score}/100`
          : 'Aktif • Siap Dikerjakan',
        badgeColor: isCompleted
          ? 'bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]'
          : 'bg-[#EFF6FF] text-[#1E40AF] border-[#93C5FD]',
        topic: asm.instructions ? asm.instructions.slice(0, 50) + (asm.instructions.length > 50 ? '...' : '') : 'REKONSTRUKSI GRAF KONSEPTUAL',
        desc: asm.description || asm.instructions || 'Rekonstruksi kepingan konsep dan relasi berarah sesuai struktur acuan dosen.',
        duration: asm.duration_minutes || 30,
        token: asm.exam_token,
        score: existingSub ? existingSub.total_score : null,
        isCompleted
      };
    });
  }, [rawList, submissions]);

  // Accurate live counts
  const totalCount = items.length;
  const completedCount = items.filter((i) => i.status === 'completed').length;
  const activeCount = items.filter((i) => i.status === 'in_progress').length;

  // Dynamically extract unique courses and their true counts
  const coursePills = useMemo(() => {
    const map = new Map<string, number>();
    items.forEach((item) => {
      map.set(item.course, (map.get(item.course) || 0) + 1);
    });
    return Array.from(map.entries()).map(([course, count]) => ({
      id: course,
      label: `${course} (${count})`
    }));
  }, [items]);

  // Filtering
  const filtered = useMemo(() => {
    return items.filter((a) => {
      if (filterTab === 'in_progress' && a.status !== 'in_progress') return false;
      if (filterTab === 'completed' && a.status !== 'completed') return false;
      if (courseFilter !== 'all' && a.course !== courseFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = a.title.toLowerCase().includes(q);
        const matchesCourse = a.course.toLowerCase().includes(q);
        const matchesDesc = a.desc.toLowerCase().includes(q);
        if (!matchesTitle && !matchesCourse && !matchesDesc) return false;
      }
      return true;
    });
  }, [items, filterTab, courseFilter, searchQuery]);

  return (
    <div className="bg-[#FAF7F2] text-[#1B1B1E] min-h-screen pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-8">
        {/* ========================================================= */}
        {/* SECTION 1: HEADER BANNER */}
        {/* ========================================================= */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b-2 border-[#1B1B1E]/10">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#F0EDF1] border border-[#1B1B1E] shadow-[1.5px_1.5px_0px_#1B1B1E] text-[10px] font-serif font-black uppercase tracking-wider text-[#1B1B1E]">
                PORTAL MAHASISWA &bull; FILKOM UB
              </span>
              <span className="px-2.5 py-1 rounded-full bg-[#ECFDF5] text-[#065F46] text-[10px] font-mono font-bold flex items-center gap-1.5 border border-[#059669]">
                <Sparkles className="w-3 h-3 text-[#059669]" />
                Sinkron dengan Server
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black text-[#1B1B1E] tracking-tight leading-tight">
              Daftar Asesmen Mahasiswa
            </h1>

            <p className="text-xs sm:text-sm text-[#444655] leading-relaxed">
              Asesmen rekonstruksi peta konsep berarah (Kit-Build). Bangun proposisi ilmiah yang valid dari kepingan konsep yang tersedia di database.
            </p>
          </div>

          {/* Right Benchmark Badge Card (Connected to Real Submissions) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border-2 border-[#1B1B1E] shadow-[4px_4px_0px_#1B1B1E] flex items-center gap-4 shrink-0">
            <div className="w-14 h-14 rounded-xl bg-[#DEE1FF] border-2 border-[#1B1B1E] flex flex-col items-center justify-center text-center">
              <span className="text-xl font-black font-sans tracking-tight text-[#0038D1] leading-none tabular-nums">
                {submissions.length > 0
                  ? (submissions.reduce((a, b) => a + b.total_score, 0) / submissions.length).toFixed(1)
                  : '0.0'}
              </span>
              <span className="text-[8.5px] font-mono font-bold uppercase text-[#001257]">RATA-RATA</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[9.5px] font-mono font-bold uppercase tracking-wider text-[#6D4400] block">
                PROGRES PENUGASAN
              </span>
              <h4 className="text-base font-serif font-black text-[#1B1B1E] leading-tight">
                {completedCount} dari {totalCount} Selesai
              </h4>
              <p className="text-[11px] text-[#444655] font-medium">
                {completedCount === totalCount && totalCount > 0
                  ? 'Seluruh modul aktif tuntas'
                  : `${activeCount} modul aktif perlu dikerjakan`}
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SECTION 2: TACTILE FILTER BAR (Status + Dynamic Course Filters) */}
        {/* ========================================================= */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-[#F6F2F7] border-2 border-[#1B1B1E] shadow-[3px_3px_0px_#1B1B1E] space-y-3">
          {/* Top Row: Status Tabs & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Pill Tabs for Status */}
            <div className="flex items-center gap-1.5 p-1 bg-white border-2 border-[#1B1B1E] rounded-full shadow-[2px_2px_0px_#1B1B1E] text-xs">
              <button
                onClick={() => setFilterTab('all')}
                className={`px-3 sm:px-4 py-1.5 rounded-full font-serif text-xs transition-all cursor-pointer ${
                  filterTab === 'all'
                    ? 'bg-[#0038D1] text-white font-black shadow-[1.5px_1.5px_0px_#1B1B1E]'
                    : 'text-[#444655] hover:text-[#1B1B1E] font-bold'
                }`}
              >
                Semua Status ({totalCount})
              </button>
              <button
                onClick={() => setFilterTab('in_progress')}
                className={`px-3 sm:px-4 py-1.5 rounded-full font-serif text-xs transition-all cursor-pointer ${
                  filterTab === 'in_progress'
                    ? 'bg-[#0038D1] text-white font-black shadow-[1.5px_1.5px_0px_#1B1B1E]'
                    : 'text-[#444655] hover:text-[#1B1B1E] font-bold'
                }`}
              >
                Tersedia / Aktif ({activeCount})
              </button>
              <button
                onClick={() => setFilterTab('completed')}
                className={`px-3 sm:px-4 py-1.5 rounded-full font-serif text-xs transition-all cursor-pointer ${
                  filterTab === 'completed'
                    ? 'bg-[#0038D1] text-white font-black shadow-[1.5px_1.5px_0px_#1B1B1E]'
                    : 'text-[#444655] hover:text-[#1B1B1E] font-bold'
                }`}
              >
                Telah Selesai ({completedCount})
              </button>
            </div>

            {/* Search Box */}
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="w-4 h-4 text-[#71717A] absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari modul atau mata kuliah..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border-2 border-[#1B1B1E] shadow-[2px_2px_0px_#1B1B1E] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0038D1]"
              />
            </div>
          </div>

          {/* Bottom Row: Course Filter Buttons (100% Dynamic from assessments) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 text-xs">
            <span className="text-[11px] font-mono font-bold text-[#71717A] uppercase mr-1 shrink-0">
              Mata Kuliah:
            </span>
            <button
              onClick={() => setCourseFilter('all')}
              className={`px-3 py-1 rounded-full text-xs font-serif shrink-0 border transition-all cursor-pointer ${
                courseFilter === 'all'
                  ? 'bg-[#1B1B1E] text-white font-black border-[#1B1B1E] shadow-[1.5px_1.5px_0px_#0038D1]'
                  : 'bg-white hover:bg-slate-100 text-[#444655] font-bold border-[#1B1B1E]/30'
              }`}
            >
              Semua Matkul ({totalCount})
            </button>
            {coursePills.map((c) => (
              <button
                key={c.id}
                onClick={() => setCourseFilter(c.id)}
                className={`px-3 py-1 rounded-full text-xs font-serif shrink-0 border transition-all cursor-pointer ${
                  courseFilter === c.id
                    ? 'bg-[#1B1B1E] text-white font-black border-[#1B1B1E] shadow-[1.5px_1.5px_0px_#0038D1]'
                    : 'bg-white hover:bg-slate-100 text-[#444655] font-bold border-[#1B1B1E]/30'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* ========================================================= */}
        {/* SECTION 3: ASSESSMENT CARDS LIST */}
        {/* ========================================================= */}
        {filtered.length === 0 ? (
          <div className="p-8 sm:p-12 rounded-2xl bg-white border-2 border-[#1B1B1E] shadow-[4px_4px_0px_#1B1B1E] text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-[#F6F2F7] border-2 border-[#1B1B1E] flex items-center justify-center mx-auto shadow-[2px_2px_0px_#1B1B1E]">
              <Filter className="w-6 h-6 text-[#71717A]" />
            </div>
            <h3 className="text-lg font-serif font-black text-[#1B1B1E]">
              Tidak Ada Asesmen Sesuai Filter
            </h3>
            <p className="text-xs sm:text-sm text-[#444655] max-w-md mx-auto">
              Tidak ada modul asesmen yang cocok dengan kriteria status atau mata kuliah yang sedang Anda pilih.
            </p>
            <div className="pt-2">
              <button
                onClick={() => {
                  setFilterTab('all');
                  setCourseFilter('all');
                  setSearchQuery('');
                }}
                className="px-4 py-2 rounded-xl bg-[#0038D1] hover:bg-[#1A4BDB] text-white font-serif font-black text-xs border-2 border-[#1B1B1E] shadow-[2px_2px_0px_#1B1B1E] cursor-pointer"
              >
                Reset Semua Filter
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {filtered.map((asm) => (
              <div
                key={asm.id}
                className="rounded-2xl bg-white border-2 border-[#1B1B1E] shadow-[4px_4px_0px_#1B1B1E] overflow-hidden transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[6px_6px_0px_#1B1B1E]"
              >
                {/* Top Utility Strip */}
                <div className="px-5 py-2.5 bg-[#F0EDF1] border-b-2 border-[#1B1B1E] flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-md bg-white border border-[#1B1B1E] shadow-[1px_1px_0px_#1B1B1E] font-serif font-black text-[11px] text-[#1B1B1E]">
                      {asm.course}
                    </span>
                    <span className="font-mono text-[#71717A] text-[11px] font-bold">
                      {asm.code} &bull; {asm.lecturer}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {asm.token && (
                      <span className="px-2 py-0.5 rounded-md bg-white border border-[#1B1B1E] font-mono text-[10.5px] font-bold text-[#1B1B1E] flex items-center gap-1 shadow-[1px_1px_0px_#1B1B1E]">
                        <KeyRound className="w-3 h-3 text-[#0038D1]" />
                        Token: {asm.token}
                      </span>
                    )}
                    <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-mono font-bold ${asm.badgeColor}`}>
                      {asm.statusLabel}
                    </span>
                  </div>
                </div>

                {/* Main Card Body */}
                <div className="p-5 sm:p-6 space-y-4">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#0038D1] flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5" />
                        {asm.topic}
                      </span>

                      <h3 className="text-xl sm:text-2xl font-serif font-black text-[#1B1B1E] leading-snug">
                        {asm.title}
                      </h3>

                      <p className="text-xs sm:text-[13px] text-[#444655] leading-relaxed max-w-3xl">
                        {asm.desc}
                      </p>
                    </div>

                    {/* Actions depending on status */}
                    <div className="flex flex-col items-stretch sm:items-end gap-2 shrink-0">
                      {asm.status === 'in_progress' ? (
                        <button
                          onClick={() => onStartWorkspace(asm.id)}
                          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#0038D1] hover:bg-[#1A4BDB] text-white font-serif font-black text-xs sm:text-sm border-2 border-[#1B1B1E] shadow-[3px_3px_0px_#1B1B1E] hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
                        >
                          <Play className="w-4 h-4 fill-white" />
                          <span>Buka Sesi Kanvas Kit-Build</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => onViewResults(asm.id)}
                          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-[#1B1B1E] font-serif font-bold text-xs border-2 border-[#1B1B1E] shadow-[2.5px_2.5px_0px_#1B1B1E] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all cursor-pointer"
                        >
                          <Award className="w-4 h-4 text-[#D97706]" />
                          <span>Lihat Evaluasi & Hasil Graf</span>
                        </button>
                      )}

                      <span className="text-[10.5px] font-mono text-[#71717A] text-right flex items-center gap-1 justify-end">
                        <Clock className="w-3 h-3 text-[#71717A]" />
                        Durasi: {asm.duration} Menit &bull; {asm.isCompleted ? '1 Percobaan' : 'Belum Dikerjakan'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ========================================================= */}
        {/* SECTION 4: PEDAGOGICAL GUIDANCE CALLOUT */}
        {/* ========================================================= */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#F6F2F7] border-2 border-[#1B1B1E] shadow-[3px_3px_0px_#1B1B1E] flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#FFDDB8] border-2 border-[#1B1B1E] flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#1B1B1E]">
            <ShieldCheck className="w-6 h-6 text-[#2A1700]" />
          </div>

          <div className="space-y-1 flex-1">
            <h4 className="text-sm sm:text-base font-serif font-black text-[#1B1B1E]">
              Ketentuan Pengerjaan Kit-Build Concept Map (Hirashima Framework)
            </h4>
            <p className="text-xs text-[#555] leading-relaxed">
              Penilaian menggunakan algoritma graf deterministik (NetworkX). Setiap proposisi dinilai secara utuh dalam formula{' '}
              <code className="px-1.5 py-0.5 rounded bg-white border border-[#1B1B1E] font-mono font-bold text-[11px] text-[#0038D1]">
                [Konsep Asal] ➔ [Label Relasi] ➔ [Konsep Tujuan]
              </code>
              . Nilai dan umpan balik otomatis dihitung langsung setelah Anda menekan tombol Kirim Asesmen.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
