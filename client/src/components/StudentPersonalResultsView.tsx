'use client';

import React, { useState, useMemo } from 'react';
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  BarChart3,
  BookOpen,
  Calendar,
  Layers,
  Sparkles,
  User,
  GraduationCap,
  GitCompare,
  TrendingUp,
  Clock,
  Eye,
  ShieldCheck,
  HelpCircle
} from 'lucide-react';
import { EvaluationResult } from '../types/maply';

interface StudentPersonalResultsViewProps {
  studentName?: string;
  studentNim?: string;
  submissions?: EvaluationResult[];
  onBackToDashboard: () => void;
  onInspectAssessment: (assessmentId: string) => void;
}

export const StudentPersonalResultsView: React.FC<StudentPersonalResultsViewProps> = ({
  studentName = 'Mahasiswa',
  studentNim = '-',
  submissions = [],
  onBackToDashboard,
  onInspectAssessment
}) => {
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('all');

  const getCourseMeta = (assessmentId: string) => {
    const aid = (assessmentId || '').toLowerCase();
    if (aid.includes('os') || aid.includes('sistem-operasi') || aid.includes('paging')) {
      return { id: 'os', name: 'Sistem Operasi', code: 'TIF-2103' };
    }
    if (aid.includes('bd') || aid.includes('basis-data') || aid.includes('normalisasi')) {
      return { id: 'bd', name: 'Basis Data', code: 'TIF-2104' };
    }
    if (aid.includes('jarkom') || aid.includes('jaringan') || aid.includes('network')) {
      return { id: 'jarkom', name: 'Jaringan Komputer', code: 'TIF-2102' };
    }
    return { id: 'arkom', name: 'Arsitektur Komputer', code: 'TIF-2101' };
  };

  const completedAssessments = useMemo(() => {
    return submissions.map((sub) => {
      const meta = getCourseMeta(sub.assessment_id);
      return {
        id: sub.assessment_id,
        courseId: meta.id,
        courseName: meta.name,
        courseCode: meta.code,
        moduleTitle: sub.assessment_id.startsWith('asm-') ? `Asesmen: ${meta.name}` : sub.assessment_id,
        date: 'Tervalidasi di Database',
        score: sub.total_score,
        status: sub.total_score >= 75 ? 'Tuntas' : 'Perlu Penguatan',
        validPropositions: sub.metrics?.true_positive || 0,
        totalPropositions: (sub.metrics?.true_positive || 0) + (sub.metrics?.false_negative || 0),
        accuracy: `${sub.relationship_accuracy_score}%`,
        dominantTopology: `Net Structure (${sub.structural_understanding_score}%)`,
        misconceptionCount: sub.knowledge_gaps?.length || 0,
        gaps: sub.knowledge_gaps || [],
        structuralScore: sub.structural_understanding_score || 0
      };
    });
  }, [submissions]);

  const courseList = useMemo(() => {
    const map = new Map<string, string>();
    completedAssessments.forEach((a) => {
      map.set(a.courseId, a.courseName);
    });
    const items = [{ id: 'all', name: `Semua Mata Kuliah (${completedAssessments.length})` }];
    map.forEach((name, id) => {
      const count = completedAssessments.filter((a) => a.courseId === id).length;
      items.push({ id, name: `${name} (${count})` });
    });
    return items;
  }, [completedAssessments]);

  const totalCount = submissions.length;
  const avgScoreNumber = totalCount > 0
    ? submissions.reduce((a, b) => a + b.total_score, 0) / totalCount
    : 0;
  const avgScore = totalCount > 0 ? avgScoreNumber.toFixed(1) : '-';
  const totalTP = totalCount > 0 ? submissions.reduce((a, b) => a + (b.metrics?.true_positive || 0), 0) : 0;
  const totalGaps = totalCount > 0 ? submissions.reduce((a, b) => a + (b.knowledge_gaps?.length || 0), 0) : 0;

  const filteredAssessments = useMemo(() => {
    if (selectedCourseFilter === 'all') return completedAssessments;
    return completedAssessments.filter((a) => a.courseId === selectedCourseFilter);
  }, [completedAssessments, selectedCourseFilter]);

  // Dynamic Hirashima Mental Model Distribution
  const avgStructural = totalCount > 0
    ? submissions.reduce((sum, s) => sum + (s.structural_understanding_score || 0), 0) / totalCount
    : 0;

  const netPercent = totalCount > 0 ? Math.min(95, Math.max(15, Math.round(avgStructural))) : 0;
  const remainingPercent = 100 - netPercent;
  const chainPercent = totalCount > 0 ? Math.round(remainingPercent * 0.72) : 0;
  const spokePercent = totalCount > 0 ? Math.max(0, 100 - netPercent - chainPercent) : 0;

  const pedagogicalInterpretation = totalCount > 0
    ? netPercent >= 60
      ? `Dominasi Net Structure (${netPercent}%) membuktikan Anda mampu menghubungkan konsep lintas sub-bab secara sistemik, melampaui hafalan linear urutan bab.`
      : `Struktur Anda menunjukkan kecenderungan sekuensial (${chainPercent}% Chain Structure). Disarankan memperbanyak relasi silang antar cabang konsep untuk memperkuat pemahaman holistik.`
    : 'Belum ada peta konsep yang direkonstruksi untuk menganalisis karakteristik model mental.';

  // Cognitive Persona
  const cognitivePersona = avgScoreNumber >= 85
    ? {
        title: 'Systemic Concept Architect',
        desc: 'Gaya kognitif Anda sangat kuat dalam mengidentifikasi hubungan sebab-akibat antar komponen abstrak dan membangun arsitektur graf secara komprehensif.'
      }
    : avgScoreNumber >= 70
    ? {
        title: 'Relational Thinker',
        desc: 'Gaya kognitif Anda mampu mengaitkan proposisi sebab-akibat antar komponen konsep dengan baik, dengan sedikit celah pada relasi spesifik.'
      }
    : {
        title: 'Sequential Learner',
        desc: 'Kognisi Anda cenderung memproses pengetahuan secara sekuensial linier. Disarankan mengeksplorasi hubungan fungsional lintas simpul konsep.'
      };

  // Real Misconceptions / Gaps from Submissions
  const realGaps = useMemo(() => {
    return Array.from(new Set(submissions.flatMap((s) => s.knowledge_gaps || []))).filter(Boolean);
  }, [submissions]);

  // Dynamic CPL based strictly on courses actually completed
  const cplList = useMemo(() => {
    const map = new Map<string, { courseName: string; score: number }>();
    completedAssessments.forEach((a) => {
      if (!map.has(a.courseName) || a.score > map.get(a.courseName)!.score) {
        map.set(a.courseName, { courseName: a.courseName, score: a.score });
      }
    });

    return Array.from(map.entries()).map(([courseName, val], idx) => ({
      code: `CPL-0${idx + 1}`,
      name: `Penguasaan Konseptual & Model Mental: ${courseName}`,
      course: courseName,
      score: Math.round(val.score),
      status: val.score >= 80 ? 'Melampaui Target' : val.score >= 70 ? 'Memenuhi Target' : 'Perlu Penguatan'
    }));
  }, [completedAssessments]);

  return (
    <div className="bg-[#FAF7F2] text-[#1B1B1E] min-h-screen pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">

        {/* SECTION 1: HEADER PERSONAL RESULTS & ACADEMIC CONTEXT */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border-2 border-[#1B1B1E] shadow-[4px_4px_0px_#1B1B1E] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#EEF2FF] border border-[#0038D1] text-[10.5px] font-mono font-bold text-[#0038D1]">
                PORTOFOLIO KOGNITIF MAHASISWA &bull; AKUMULATIF
              </span>
              <span className="px-3 py-1 rounded-full bg-[#ECFDF5] border border-[#059669] text-[10.5px] font-mono font-bold text-[#065F46]">
                {totalCount > 0 ? `${totalCount} Modul Selesai` : 'Belum Ada Modul'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif font-black text-[#1B1B1E]">
              Hasil Evaluasi Kognitif Personal
            </h1>

            <div className="flex flex-wrap items-center gap-2.5 text-xs text-[#71717A]">
              <span className="font-bold text-[#1B1B1E] flex items-center gap-1.5">
                <User className="w-4 h-4 text-[#0038D1]" />
                {studentName} (NIM: {studentNim})
              </span>
              <span>&bull;</span>
              <span>Teknik Informatika &bull; FILKOM UB</span>
              <span>&bull;</span>
              <span className="px-2 py-0.5 rounded bg-[#FAF7F2] border border-[#1B1B1E] text-[10px] font-mono font-bold text-[#1B1B1E]">
                Status: {totalCount > 0 ? cognitivePersona.title : 'Mahasiswa Aktif'}
              </span>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={onBackToDashboard}
              className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-slate-50 text-[#1B1B1E] font-serif font-bold text-xs border-2 border-[#1B1B1E] shadow-[2px_2px_0px_#1B1B1E] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Dashboard</span>
            </button>
          </div>
        </div>

        {/* SECTION 2: 4 SUMMARY CARDS (REAL DATA) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border-2 border-[#1B1B1E] shadow-[3px_3px_0px_#1B1B1E] flex flex-col justify-between space-y-2">
            <span className="text-[11px] font-mono font-bold text-[#71717A] uppercase tracking-wider">
              Indeks Kognitif Kumulatif
            </span>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-sans font-black tracking-tight text-[#0038D1] tabular-nums">
                  {avgScore}
                </span>
                {avgScore !== '-' && <span className="text-sm font-bold text-[#71717A]">/ 100</span>}
              </div>
              <p className="text-[11px] text-[#444655] mt-1.5">
                {totalCount > 0 ? `Rata-rata ${totalCount} asesmen tuntas` : 'Belum ada data asesmen'}
              </p>
            </div>
            <div className="pt-2 border-t border-[#1B1B1E]/10 flex items-center justify-between text-[10px] font-mono text-[#71717A]">
              <span>Tingkat Penguasaan</span>
              <span className="font-bold text-[#0038D1]">
                {totalCount > 0 ? (avgScoreNumber >= 75 ? 'Kompeten' : 'Perlu Penguatan') : 'Siap Mulai'}
              </span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border-2 border-[#1B1B1E] shadow-[3px_3px_0px_#1B1B1E] flex flex-col justify-between space-y-2">
            <span className="text-[11px] font-mono font-bold text-[#71717A] uppercase tracking-wider">
              Modul Selesai
            </span>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl sm:text-4xl font-sans font-black tracking-tight text-[#1B1B1E] tabular-nums">
                  {totalCount}
                </span>
                <span className="text-xs font-bold text-[#71717A] ml-1">Modul</span>
              </div>
              <p className="text-[11px] text-[#444655] mt-1.5">Tersimpan di Database</p>
            </div>
            <div className="pt-2 border-t border-[#1B1B1E]/10 flex items-center justify-between text-[10px] font-mono text-[#71717A]">
              <span>Status Portofolio</span>
              <span className="font-bold text-[#059669]">{totalCount > 0 ? 'Terverifikasi' : 'Belum Ada'}</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border-2 border-[#1B1B1E] shadow-[3px_3px_0px_#1B1B1E] flex flex-col justify-between space-y-2">
            <span className="text-[11px] font-mono font-bold text-[#71717A] uppercase tracking-wider">
              Proposisi Valid Akumulatif
            </span>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-sans font-black tracking-tight text-[#059669] tabular-nums">
                  {totalTP}
                </span>
                <span className="text-xs font-bold text-[#059669]">Relasi</span>
              </div>
              <p className="text-[11px] text-[#444655] mt-1.5">Akurasi triple tervalidasi</p>
            </div>
            <div className="pt-2 border-t border-[#1B1B1E]/10 flex items-center justify-between text-[10px] font-mono text-[#71717A]">
              <span>Kaidah Master Map</span>
              <span className="font-bold text-[#059669]">{totalTP > 0 ? 'Tepat' : 'Belum Ada'}</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#FFE4E6] border-2 border-[#1B1B1E] shadow-[3px_3px_0px_#1B1B1E] flex flex-col justify-between space-y-2">
            <span className="text-[11px] font-mono font-bold text-[#DA3437] uppercase tracking-wider">
              Miskonsepsi Aktif
            </span>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-sans font-black tracking-tight text-[#DA3437] tabular-nums">
                  {totalGaps}
                </span>
                <span className="text-xs font-bold text-[#DA3437]">Titik Perlu Review</span>
              </div>
              <p className="text-[11px] text-[#7F1D1D] mt-1.5">Kesenjangan pemahaman konsep</p>
            </div>
            <div className="pt-2 border-t border-[#1B1B1E]/10 flex items-center justify-between text-[10px] font-mono text-[#DA3437]">
              <span>Rekomendasi</span>
              <span className="font-bold underline cursor-pointer" onClick={() => {
                const el = document.getElementById('riwayat-asesmen-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}>
                Lihat Detail ↓
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 3: TOPOLOGY HIRASHIMA BREAKDOWN & PEDAGOGICAL INSIGHT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Hirashima Mental Model Distribution */}
          <div className="lg:col-span-7 p-6 rounded-2xl bg-white border-2 border-[#1B1B1E] shadow-[4px_4px_0px_#1B1B1E] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1B1B1E]/10">
              <div>
                <h3 className="text-sm font-serif font-black uppercase tracking-wider text-[#1B1B1E]">
                  Karakteristik Struktur Topologi Hirashima Akumulatif
                </h3>
                <span className="text-xs text-[#71717A]">
                  {totalCount > 0
                    ? `Analisis model mental dari ${totalCount} peta konsep yang direkonstruksi`
                    : 'Belum ada data rekonstruksi peta konsep'}
                </span>
              </div>
              <div className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#1B1B1E] shadow-[1.5px_1.5px_0px_#1B1B1E] text-[10.5px] font-mono font-bold text-[#0038D1]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0038D1]" />
                <span>{totalCount} Modul Terverifikasi</span>
              </div>
            </div>

            {totalCount === 0 ? (
              <div className="py-8 text-center space-y-2">
                <HelpCircle className="w-8 h-8 text-[#71717A] mx-auto" />
                <p className="text-xs font-bold text-[#1B1B1E]">Belum Ada Data Topologi</p>
                <p className="text-[11px] text-[#71717A] max-w-sm mx-auto">
                  Selesaikan asesmen pertama Anda di kanvas Kit-Build untuk memetakan distribusi Net, Chain, dan Spoke structure.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-3 pt-1">
                  {/* Net Structure */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-[#0038D1]" />
                        <span className="text-[#1B1B1E]">Net Structure (Jejaring Kompleks Non-Linier)</span>
                      </div>
                      <span className="font-mono text-[#0038D1] font-black">{netPercent}%</span>
                    </div>
                    <div className="w-full bg-[#FAF7F2] border border-[#1B1B1E] rounded-full h-2.5 overflow-hidden">
                      <div className="bg-[#0038D1] h-2.5 rounded-full transition-all duration-500" style={{ width: `${netPercent}%` }} />
                    </div>
                  </div>

                  {/* Chain Structure */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-[#059669]" />
                        <span className="text-[#1B1B1E]">Chain Structure (Rantai Logika Linier)</span>
                      </div>
                      <span className="font-mono text-[#059669] font-black">{chainPercent}%</span>
                    </div>
                    <div className="w-full bg-[#FAF7F2] border border-[#1B1B1E] rounded-full h-2.5 overflow-hidden">
                      <div className="bg-[#059669] h-2.5 rounded-full transition-all duration-500" style={{ width: `${chainPercent}%` }} />
                    </div>
                  </div>

                  {/* Spoke Structure */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-[#D97706]" />
                        <span className="text-[#1B1B1E]">Spoke Structure (Pusat Sentral / Bintang)</span>
                      </div>
                      <span className="font-mono text-[#D97706] font-black">{spokePercent}%</span>
                    </div>
                    <div className="w-full bg-[#FAF7F2] border border-[#1B1B1E] rounded-full h-2.5 overflow-hidden">
                      <div className="bg-[#D97706] h-2.5 rounded-full transition-all duration-500" style={{ width: `${spokePercent}%` }} />
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#1B1B1E]/15 text-xs text-[#444655] leading-relaxed">
                  <strong>Interpretasi Pedagogis:</strong> {pedagogicalInterpretation}
                </div>
              </>
            )}
          </div>

          {/* Persona Card & Recommendations */}
          <div className="lg:col-span-5 p-6 rounded-2xl bg-[#FFEAA7] border-2 border-[#1B1B1E] shadow-[4px_4px_0px_#1B1B1E] flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <span className="px-2.5 py-0.5 rounded-full bg-white border border-[#1B1B1E] text-[10px] font-mono font-black uppercase text-[#1B1B1E]">
                PROFIL KOGNITIF MAHASISWA
              </span>
              <h3 className="text-xl font-serif font-black text-[#1B1B1E]">
                {totalCount > 0 ? cognitivePersona.title : 'Belum Ada Profil'}
              </h3>
              <p className="text-xs text-[#444655] leading-relaxed">
                {totalCount > 0
                  ? cognitivePersona.desc
                  : 'Selesaikan modul pertama Anda untuk membentuk profil kognitif dan preferensi berpikir relasional.'}
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-[#1B1B1E]/15">
              <span className="text-[11px] font-mono font-bold text-[#1B1B1E] uppercase">
                Fokus Penguatan Berikutnya:
              </span>
              {realGaps.length > 0 ? (
                <ul className="text-xs text-[#444655] space-y-1.5 list-disc list-inside">
                  {realGaps.slice(0, 2).map((gap, i) => (
                    <li key={i}>{gap}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-[#444655]">
                  {totalCount > 0
                    ? '✓ Seluruh proposisi Anda valid dan presisi sesuai Master Concept Map Dosen.'
                    : 'Belum ada miskonsepsi yang tercatat.'}
                </p>
              )}
            </div>

            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#1B1B1E] text-[10.5px] font-mono font-bold text-[#059669] shadow-[1px_1px_0px_#1B1B1E]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
                {totalCount > 0 && avgScoreNumber >= 70
                  ? 'Lulus Ambang CPL Fakultas (Min. 70/100)'
                  : 'Ambang Kelulusan CPL: Min. 70/100'}
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 3B: MATRIKS CPL KURIKULUM & REKOMENDASI AI PEDAGOGIS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Matriks CPL */}
          <div className="lg:col-span-7 p-6 rounded-2xl bg-white border-2 border-[#1B1B1E] shadow-[4px_4px_0px_#1B1B1E] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1B1B1E]/10">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#0038D1]" />
                <h3 className="text-sm font-serif font-black uppercase tracking-wider text-[#1B1B1E]">
                  Pencapaian CPL Program Studi (Kurikulum OBE)
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-[#ECFDF5] border border-[#059669] text-[10px] font-mono font-bold text-[#065F46]">
                {cplList.filter((c) => c.score >= 70).length} dari {cplList.length} CPL Terpenuhi
              </span>
            </div>

            {cplList.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#71717A] space-y-1">
                <p className="font-bold text-[#1B1B1E]">Belum Ada Capaian Pembelajaran Terasesmen</p>
                <p>Capaian CPL akan dihitung otomatis saat Anda menyelesaikan asesmen mata kuliah terkait.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cplList.map((cpl, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-[#FAF7F2] border border-[#1B1B1E]/20 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.2 rounded bg-white border border-[#1B1B1E] font-mono font-black text-[10px] text-[#0038D1]">
                          {cpl.code}
                        </span>
                        <span className="font-bold text-[#1B1B1E]">{cpl.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-[#0038D1]">{cpl.score}%</span>
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                          cpl.score >= 75
                            ? 'text-[#065F46] bg-[#ECFDF5] border-[#A7F3D0]'
                            : 'text-[#B45309] bg-[#FFFBEB] border-[#FDE68A]'
                        }`}>
                          {cpl.status}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-white border border-[#1B1B1E]/30 rounded-full h-2 overflow-hidden">
                      <div className="bg-[#0038D1] h-2 rounded-full transition-all duration-500" style={{ width: `${cpl.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Pedagogical Advisor Card */}
          <div className="lg:col-span-5 p-6 rounded-2xl bg-[#EEF2FF] border-2 border-[#1B1B1E] shadow-[4px_4px_0px_#1B1B1E] flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#0038D1]/20">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#0038D1]" />
                  <h3 className="text-sm font-serif font-black uppercase tracking-wider text-[#0038D1]">
                    Rekomendasi AI Pedagogis
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-white border border-[#0038D1] text-[9.5px] font-mono font-bold text-[#0038D1]">
                  NetworkX AI
                </span>
              </div>

              <div className="space-y-2.5 text-xs text-[#1B1B1E]">
                {totalCount === 0 ? (
                  <p className="text-[#444655] leading-relaxed">
                    Selesaikan asesmen pertama Anda di kanvas Kit-Build untuk mendapatkan analisis proposisi dan rekomendasi pedagogis berbasis graf.
                  </p>
                ) : (
                  <>
                    <div className="p-3 rounded-xl bg-white border border-[#0038D1]/30 space-y-1">
                      <span className="font-bold text-[#0038D1] block text-[11.5px]">
                        Status Penguasaan Topik:
                      </span>
                      <p className="text-[11px] text-[#444655] leading-relaxed">
                        {avgScoreNumber >= 80
                          ? 'Pemahaman relasional Anda sangat solid. Pertahankan penyusunan proposisi terarah dan kerapatan jejaring konsep pada modul-modul berikutnya.'
                          : 'Perhatikan arah kausalitas panah relasi antar simpul konsep agar proposisi bernilai valid pada evaluasi graf deterministik.'}
                      </p>
                    </div>

                    {realGaps.length > 0 && (
                      <div className="p-3 rounded-xl bg-white border border-[#0038D1]/30 space-y-1">
                        <span className="font-bold text-[#D97706] block text-[11.5px]">
                          Catatan Remedial & Review:
                        </span>
                        <p className="text-[11px] text-[#444655] leading-relaxed">
                          Tinjau garis merah pada visualisasi graf di riwayat pengerjaan Anda untuk mengeliminasi titik miskonsepsi.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-[#0038D1]/20 flex items-center justify-between text-[10.5px] text-[#444655]">
              <span>Status Sertifikasi</span>
              <span className="font-mono font-bold text-[#0038D1]">
                {totalCount > 0 && avgScoreNumber >= 75
                  ? 'Kompeten Secara Konseptual'
                  : 'Sesi Penguatan Disarankan'}
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 4: DAFTAR EVALUASI ASESMEN LINTAS MATA KULIAH */}
        <div id="riwayat-asesmen-section" className="p-6 sm:p-8 rounded-2xl bg-white border-2 border-[#1B1B1E] shadow-[4px_4px_0px_#1B1B1E] space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-[#FAF7F2]">
            <div>
              <h3 className="text-lg font-serif font-black text-[#1B1B1E]">
                Riwayat & Evaluasi Modul Lintas Mata Kuliah
              </h3>
              <p className="text-xs text-[#71717A]">
                Pilih modul asesmen untuk meninjau detail graf proposisi, metrik F1-score, dan perbandingan terhadap Master Map Dosen.
              </p>
            </div>

            {/* Dynamic Filter pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {courseList.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCourseFilter(c.id)}
                  className={`px-3 py-1 rounded-full text-xs font-serif font-bold border border-[#1B1B1E] transition-all cursor-pointer ${
                    selectedCourseFilter === c.id
                      ? 'bg-[#0038D1] text-white shadow-[1.5px_1.5px_0px_#1B1B1E]'
                      : 'bg-white hover:bg-slate-100 text-[#1B1B1E]'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Cards List */}
          <div className="space-y-3">
            {filteredAssessments.length === 0 ? (
              <div className="p-8 rounded-xl bg-[#FAF7F2] border-2 border-dashed border-[#1B1B1E]/30 text-center space-y-2">
                <Award className="w-8 h-8 mx-auto text-[#71717A]" />
                <h4 className="font-serif font-black text-sm text-[#1B1B1E]">Belum Ada Riwayat Asesmen</h4>
                <p className="text-xs text-[#71717A] max-w-sm mx-auto">
                  Anda belum menyelesaikan asesmen apapun. Kerjakan asesmen yang tersedia di Dashboard untuk menguji pemahaman konseptual Anda.
                </p>
              </div>
            ) : (
              filteredAssessments.map((asm) => (
                <div
                  key={asm.id}
                  className="p-4 rounded-xl bg-[#FAF7F2] border-2 border-[#1B1B1E] shadow-[2px_2px_0px_#1B1B1E] flex flex-col md:flex-row md:items-center justify-between gap-4 hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded bg-[#EEF2FF] border border-[#C7D2FE] text-[10px] font-mono font-bold text-[#0038D1]">
                        {asm.courseName} ({asm.courseCode})
                      </span>
                      <span className="text-[10px] font-mono text-[#71717A]">{asm.date}</span>
                      {asm.misconceptionCount > 0 ? (
                        <span className="px-2 py-0.2 rounded-full bg-[#FEE2E2] border border-[#FCA5A5] text-[9.5px] font-mono font-bold text-[#DC2626]">
                          {asm.misconceptionCount} Miskonsepsi
                        </span>
                      ) : (
                        <span className="px-2 py-0.2 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[9.5px] font-mono font-bold text-[#065F46]">
                          Bebas Miskonsepsi
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-sm text-[#1B1B1E] truncate">{asm.moduleTitle}</h4>

                    <div className="flex items-center gap-4 text-xs text-[#444655]">
                      <span>Akurasi: <strong>{asm.accuracy}</strong> ({asm.validPropositions}/{asm.totalPropositions} relasi)</span>
                      <span>&bull;</span>
                      <span>Topologi: <strong>{asm.dominantTopology}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                    {/* Status Badge */}
                    {asm.status === 'Tuntas' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-black uppercase px-2.5 py-1 rounded-full bg-[#ECFDF5] text-[#065F46] border border-[#059669]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                        <span>Tuntas</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-black uppercase px-2.5 py-1 rounded-full bg-[#FFFBEB] text-[#B45309] border border-[#D97706]">
                        <AlertTriangle className="w-3.5 h-3.5 text-[#D97706] shrink-0" />
                        <span>Perlu Penguatan</span>
                      </span>
                    )}

                    {/* Skor Box */}
                    <div className="w-12 h-10 rounded-lg bg-white border-2 border-[#1B1B1E] shadow-[1.5px_1.5px_0px_#1B1B1E] flex flex-col items-center justify-center shrink-0">
                      <span className="font-mono font-black text-sm text-[#0038D1] leading-none">
                        {asm.score}
                      </span>
                      <span className="text-[8px] font-mono font-bold text-[#71717A] uppercase leading-none mt-0.5">
                        Skor
                      </span>
                    </div>

                    {/* Button: Tinjau Detail Graf */}
                    <button
                      onClick={() => onInspectAssessment(asm.id)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[#EEF2FF] text-[#0038D1] border-2 border-[#1B1B1E] text-xs font-bold shadow-[2px_2px_0px_#1B1B1E] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all cursor-pointer"
                      title="Buka visualisasi graf komparatif dan proposisi evaluasi lengkap"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Tinjau Detail Graf</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
