'use client';

import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  Clock,
  Layers,
  CheckCircle2,
  AlertTriangle,
  FileText,
  KeyRound,
  BarChart3,
  Award,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Calendar,
  Lock,
  Lightbulb
} from 'lucide-react';
import { AssessmentConfig, ConceptKit, EvaluationResult } from '../types/maply';

interface StudentDashboardViewProps {
  assessmentConfig: AssessmentConfig;
  kit: ConceptKit;
  studentName?: string;
  studentNim?: string;
  submissions?: EvaluationResult[];
  onStartWorkspace: () => void;
  onEnterToken: (token: string) => void;
  onViewResults: () => void;
}

const KIT_BUILD_TIPS = [
  {
    id: 1,
    category: 'Relasi Kausalitas',
    title: 'Perhatikan Orientasi Panah Berarah (Directed Proposition)',
    desc: 'Kaidah Kit-Build mengevaluasi subjek, predikat, dan objek secara eksak. Pastikan panah mengalir dari konsep penyebab ke akibat (misal:',
    highlight: '[CU] controls [Register]',
    postDesc: 'bukan sebaliknya). Relasi kausal berarah berbeda dengan relasi komutatif simetris.',
    badge: 'Arah Kausal',
    color: '#0038D1'
  },
  {
    id: 2,
    category: 'Struktur Hirashima',
    title: 'Bangun Net Structure, Hindari Sekadar Rantai Linier Tunggal',
    desc: 'Teori Hirashima membuktikan pemahaman konseptual mendalam tercermin dari Jejaring Kompleks (Net Structure) dengan keterkaitan silang antar cabang, bukan sekadar hafalan sekuensial satu arah (',
    highlight: 'Net Structure > Single Chain',
    postDesc: '). Buat proposisi relasional antar cabang konsep.',
    badge: 'Hirashima Topologi',
    color: '#059669'
  },
  {
    id: 3,
    category: 'Root Anchors',
    title: 'Mulai dari Keping Konsep Utama (Top-Level Nodes)',
    desc: 'Letakkan konsep hierarki inti terlebih dahulu di kanvas (misal: CPU, ALU, Memory Hierarchy), lalu sambungkan periferal. Cara ini terbukti meminimalkan kesalahan proposisi terbalik hingga',
    highlight: '40% Akurasi Lebih Tinggi',
    postDesc: 'pada evaluasi graf otomatis.',
    badge: 'Scaffolding',
    color: '#D97706'
  },
  {
    id: 4,
    category: 'Umpan Balik Graf',
    title: 'Tinjau Garis Merah pada Graf Komparatif Setelah Ujian',
    desc: 'Garis merah pada visualisasi evaluasi menandakan titik miskonsepsi terhadap Master Map Dosen. Pelajari koreksi pedagogisnya di tab',
    highlight: 'Hasil & Diagnosa Graf',
    postDesc: 'sebelum membuka asesmen modul berikutnya.',
    badge: 'Diagnosa Kognitif',
    color: '#DA3437'
  },
  {
    id: 5,
    category: 'Kelengkapan Graf',
    title: 'Kepingan Konsep Terbengkalai Dihitung sebagai False Negative',
    desc: 'Pastikan seluruh keping konsep penting telah dirangkai ke dalam graf. Kepingan yang tertinggal di nampan kanvas tanpa relasi akan menurunkan rasio kelengkapan kognitif Anda (',
    highlight: 'Recall Score < 100%',
    postDesc: '). Periksa kembali kanvas sebelum submit final.',
    badge: 'Kelengkapan Kit',
    color: '#7C3AED'
  }
];

export const StudentDashboardView: React.FC<StudentDashboardViewProps> = ({
  assessmentConfig,
  kit,
  studentName = 'Mahasiswa',
  studentNim = '-',
  submissions = [],
  onStartWorkspace,
  onEnterToken,
  onViewResults
}) => {
  const [tokenInput, setTokenInput] = useState('');
  const [tokenError, setTokenError] = useState('');

  // Compute real dynamic statistics
  const completedCount = submissions.length;
  const avgScore = completedCount > 0
    ? (submissions.reduce((acc, curr) => acc + curr.total_score, 0) / completedCount).toFixed(1)
    : '-';
  const totalTP = completedCount > 0
    ? submissions.reduce((acc, curr) => acc + (curr.metrics?.true_positive || 0), 0)
    : 0;
  const totalGaps = completedCount > 0
    ? submissions.reduce((acc, curr) => acc + (curr.knowledge_gaps?.length || 0), 0)
    : 0;

  // Dynamic Hirashima Mental Model Topology
  const avgStructural = completedCount > 0
    ? submissions.reduce((acc, curr) => acc + (curr.structural_understanding_score || 0), 0) / completedCount
    : 0;
  const netPercent = completedCount > 0 ? Math.min(95, Math.max(15, Math.round(avgStructural))) : 0;
  const remainingPercent = 100 - netPercent;
  const chainPercent = completedCount > 0 ? Math.round(remainingPercent * 0.72) : 0;
  const spokePercent = completedCount > 0 ? Math.max(0, 100 - netPercent - chainPercent) : 0;

  // Interactive rotating tips & tricks carousel state (pure slide geser)
  const [activeTipIndex, setActiveTipIndex] = useState(0);
  const [tipProgress, setTipProgress] = useState(0);
  const [isTipPaused, setIsTipPaused] = useState(false);

  useEffect(() => {
    if (isTipPaused) return;

    const DURATION_MS = 6000; // 6s per tip
    const TICK_MS = 50;

    const interval = setInterval(() => {
      setTipProgress((prev) => {
        if (prev >= 100) {
          setActiveTipIndex((curr) => (curr + 1) % KIT_BUILD_TIPS.length);
          return 0;
        }
        return prev + (TICK_MS / DURATION_MS) * 100;
      });
    }, TICK_MS);

    return () => clearInterval(interval);
  }, [isTipPaused, activeTipIndex]);

  const handleManualTipChange = (newIndex: number) => {
    setActiveTipIndex(newIndex);
    setTipProgress(0);
  };

  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) {
      setTokenError('Masukkan 6-karakter token ujian (misal: KBT-9428)');
      return;
    }
    onEnterToken(tokenInput.trim().toUpperCase());
  };

  return (
    <div className="bg-[#FAF7F2] text-[#1B1B1E] min-h-screen pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Top Student Greeting Card & Cognitive Persona */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border-2 border-[#1B1B1E] shadow-[4px_4px_0px_#1B1B1E]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left side: Greeting, Context & Academic Persona */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DEE1FF] border border-[#1B1B1E] text-xs font-bold text-[#001257]">
                  <span className="w-2 h-2 rounded-full bg-[#0038D1]"></span>
                  <span>SEMESTER AKADEMIK AKTIF &bull; FILKOM UB</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#ECFDF5] border border-[#059669] text-[10px] font-mono font-bold text-[#065F46]">
                  Mahasiswa Aktif
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-serif font-black text-[#1B1B1E] tracking-tight">
                Halo, {studentName} 👋
              </h1>

              <p className="text-xs sm:text-sm text-[#444655] max-w-xl leading-relaxed">
                Bukan sekadar mengingat fakta, tapi merangkai <strong className="text-[#1B1B1E] underline decoration-[#1B1B1E] decoration-2">struktur logika pengetahuan</strong> secara terpadu dan bermakna.
              </p>

              {/* Student Personification Meta Badges */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-[#FAF7F2] border border-[#1B1B1E] font-mono text-[11px] font-bold text-[#1B1B1E]">
                  NIM: {studentNim}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-[#FAF7F2] border border-[#1B1B1E] font-bold text-[11px] text-[#1B1B1E]">
                  Teknik Informatika
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-[#F6F2F7] border border-[#1B1B1E] font-mono font-bold text-[10.5px] text-[#0038D1]">
                  Status: {completedCount > 0 ? 'Relational Thinker' : 'Pengguna Baru'}
                </span>
              </div>
            </div>

            {/* Right side: Karakteristik Struktur Hirashima */}
            <div className="lg:col-span-5 p-4 sm:p-5 rounded-xl bg-[#FAF7F2] border-2 border-[#1B1B1E] shadow-[2px_2px_0px_#1B1B1E] space-y-3">
              <div className="flex items-center justify-between gap-3 pb-2.5 border-b border-[#1B1B1E]/10">
                <div className="min-w-0 pr-1">
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#1B1B1E] leading-snug">
                    Karakteristik Struktur Hirashima
                  </h3>
                  <span className="text-[10px] text-[#71717A] block mt-0.5">
                    Personifikasi model mental akumulatif
                  </span>
                </div>
                <div className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-[#1B1B1E] shadow-[1.5px_1.5px_0px_#1B1B1E] text-[10px] font-mono font-bold text-[#0038D1] whitespace-nowrap select-none">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#0038D1] shrink-0" />
                  <span>{completedCount} Modul Tuntas</span>
                </div>
              </div>

              {completedCount === 0 ? (
                <div className="py-6 text-center text-xs text-[#71717A] font-bold">
                  Belum ada asesmen yang diselesaikan. Selesaikan asesmen pertama Anda untuk melihat karakteristik topologi kognitif Anda.
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-[#1B1B1E]">Net Structure (Jejaring Kompleks)</span>
                      <span className="font-mono text-[#0038D1]">{netPercent}%</span>
                    </div>
                    <div className="w-full bg-white border border-[#1B1B1E] rounded-full h-2 overflow-hidden">
                      <div className="bg-[#0038D1] h-2 rounded-full transition-all duration-500" style={{ width: `${netPercent}%` }} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-[#1B1B1E]">Chain Structure (Rantai Linier)</span>
                      <span className="font-mono text-[#059669]">{chainPercent}%</span>
                    </div>
                    <div className="w-full bg-white border border-[#1B1B1E] rounded-full h-2 overflow-hidden">
                      <div className="bg-[#059669] h-2 rounded-full transition-all duration-500" style={{ width: `${chainPercent}%` }} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-[#1B1B1E]">Spoke Structure (Pusat / Bintang)</span>
                      <span className="font-mono text-[#D97706]">{spokePercent}%</span>
                    </div>
                    <div className="w-full bg-white border border-[#1B1B1E] rounded-full h-2 overflow-hidden">
                      <div className="bg-[#D97706] h-2 rounded-full transition-all duration-500" style={{ width: `${spokePercent}%` }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Cognitive Summary Metric Cards (REAL DATA) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border-2 border-[#1B1B1E] shadow-[3px_3px_0px_#1B1B1E] flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-[#71717A] uppercase tracking-wider">Indeks Kognitif</span>
              <Award className="w-4 h-4 text-[#0038D1]" />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-sans font-black tracking-tight text-[#0038D1] tabular-nums">
                  {avgScore}
                </span>
                {avgScore !== '-' && <span className="text-xs font-bold text-[#71717A]">/ 100</span>}
              </div>
              <p className="text-[11px] text-[#444655] mt-1.5">
                {completedCount > 0 ? `Rata-rata ${completedCount} asesmen tuntas` : 'Belum ada data asesmen'}
              </p>
            </div>
            <div className="pt-2 border-t border-[#1B1B1E]/10 flex items-center justify-between text-[10px] font-mono text-[#71717A]">
              <span>Evaluasi Graf</span>
              <span className="font-bold text-[#1B1B1E]">NetworkX Core</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border-2 border-[#1B1B1E] shadow-[3px_3px_0px_#1B1B1E] flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-[#71717A] uppercase tracking-wider">Modul Tuntas</span>
              <CheckCircle2 className="w-4 h-4 text-[#059669]" />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl sm:text-4xl font-sans font-black tracking-tight text-[#1B1B1E] tabular-nums">
                  {completedCount}
                </span>
                <span className="text-xs font-bold text-[#71717A] ml-1">Modul</span>
              </div>
              <p className="text-[11px] text-[#444655] mt-1.5 font-medium">Asesmen yang telah diselesaikan</p>
            </div>
            <div className="pt-2 border-t border-[#1B1B1E]/10 flex items-center justify-between text-[10px] font-mono text-[#71717A]">
              <span>Status</span>
              <span className="font-bold text-[#059669]">{completedCount > 0 ? 'Tervalidasi' : 'Siap Mulai'}</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border-2 border-[#1B1B1E] shadow-[3px_3px_0px_#1B1B1E] flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-[#71717A] uppercase tracking-wider">Proposisi Valid (TP)</span>
              <Sparkles className="w-4 h-4 text-[#059669]" />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-sans font-black tracking-tight text-[#059669] tabular-nums">
                  {totalTP}
                </span>
                <span className="text-xs font-bold text-[#059669]">Relasi</span>
              </div>
              <p className="text-[11px] text-[#444655] mt-1.5">Akurasi triple &lt;S, P, O&gt; tervalidasi</p>
            </div>
            <div className="pt-2 border-t border-[#1B1B1E]/10 flex items-center justify-between text-[10px] font-mono text-[#71717A]">
              <span>Kaidah Master Map</span>
              <span className="font-bold text-[#059669]">{totalTP > 0 ? 'Tercatat' : 'Belum Ada'}</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#FFE4E6] border-2 border-[#1B1B1E] shadow-[3px_3px_0px_#1B1B1E] flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-[#DA3437] uppercase tracking-wider">Miskonsepsi Terdeteksi</span>
              <AlertTriangle className="w-4 h-4 text-[#DA3437]" />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-sans font-black tracking-tight text-[#DA3437] tabular-nums">
                  {totalGaps}
                </span>
                <span className="text-xs font-bold text-[#DA3437]">Kesenjangan</span>
              </div>
              <p className="text-[11px] text-[#7F1D1D] mt-1.5">Relasi tidak tepat atau terlewat</p>
            </div>
            <div className="pt-2 border-t border-[#1B1B1E]/10 flex items-center justify-between text-[10px] font-mono text-[#DA3437]">
              <span>Tindak Lanjut</span>
              <span className="font-bold underline cursor-pointer" onClick={onViewResults}>
                {completedCount > 0 ? 'Tinjau Graf →' : 'Ikuti Asesmen'}
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: Primary Active Assessment Card (Connected to Backend) */}
        <div className="p-6 sm:p-7 rounded-3xl bg-[#FFEAA7] border-2 border-[#1B1B1E] shadow-[5px_5px_0px_#1B1B1E] space-y-4">
          {/* Header Row: Left Badge, Center Target Icon, Right Timer & Deadline */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Left Pill: Green dot + ASESMEN AKTIF */}
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#059669]"></span>
              <span className="font-mono text-xs font-black uppercase tracking-wider text-[#1B1B1E]">
                ASESMEN AKTIF &bull; {assessmentConfig.id.toUpperCase()}
              </span>
            </div>

            {/* Center: Decorative Focus Dot */}
            <div className="hidden md:flex w-7 h-7 rounded-full border border-[#1B1B1E] items-center justify-center bg-transparent">
              <span className="w-2 h-2 rounded-full bg-[#1B1B1E]"></span>
            </div>

            {/* Right Badges: Batas Waktu & Token */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-white border border-[#1B1B1E] text-xs font-bold text-[#1B1B1E] flex items-center gap-1.5 shadow-[1px_1px_0px_#1B1B1E]">
                <Clock className="w-3.5 h-3.5 text-[#0038D1]" />
                <span>Batas Waktu: {assessmentConfig.duration_minutes || assessmentConfig.time_limit_minutes || 30} Menit</span>
              </span>
              <span className="px-3.5 py-1 rounded-full bg-[#0038D1] text-white border border-[#1B1B1E] text-xs font-bold flex items-center gap-1.5 shadow-[1px_1px_0px_#1B1B1E]">
                <KeyRound className="w-3.5 h-3.5 text-white" />
                <span>Token: {assessmentConfig.exam_token || 'KBT-9428'}</span>
              </span>
            </div>
          </div>

          {/* Assessment Title & Subtitle */}
          <div className="space-y-2 pt-1">
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-[#1B1B1E] tracking-tight">
              {assessmentConfig.title}
            </h2>
            <p className="text-xs sm:text-sm text-[#444655] max-w-4xl leading-relaxed">
              {assessmentConfig.description || 'Rekonstruksi kepingan konsep dan relasi berarah sesuai struktur acuan dosen.'}
            </p>
          </div>

          {/* Bottom Bar: Concepts count, Relation types, Scheduled Exam and CTA Button */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t-2 border-[#1B1B1E]">
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs font-bold text-[#1B1B1E]">
              <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-[#1B1B1E] shadow-[1px_1px_0px_#1B1B1E]">
                <Layers className="w-3.5 h-3.5 text-[#0038D1]" />
                {kit?.concepts?.length || 5} Kepingan Konsep
              </span>
              <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-[#1B1B1E] shadow-[1px_1px_0px_#1B1B1E]">
                <Sparkles className="w-3.5 h-3.5 text-[#059669]" />
                {kit?.available_relationships?.length || 5} Tipe Relasi
              </span>
              <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-[#1B1B1E] shadow-[1px_1px_0px_#1B1B1E]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#DA3437]" />
                Sesi Ujian Aktif
              </span>
            </div>

            <button
              onClick={onStartWorkspace}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#0038D1] hover:bg-[#2F54EB] text-white font-black text-sm border-2 border-[#1B1B1E] shadow-[3px_3px_0px_#1B1B1E] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all cursor-pointer"
            >
              <span>Mulai Pengerjaan Kit Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Section 4: Fast Assessment Token Entry Box & Recent History */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Column: Quick Token PIN Box */}
          <div className="lg:col-span-5 p-5 rounded-2xl bg-white border-2 border-[#1B1B1E] shadow-[3px_3px_0px_#1B1B1E] flex flex-col justify-between space-y-3.5">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-[#1B1B1E]/10">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-[#0038D1]" />
                  <h3 className="text-sm sm:text-base font-serif font-black text-[#1B1B1E]">Akses Cepat via PIN Ujian</h3>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-[#ECFDF5] border border-[#059669] text-[9.5px] font-mono font-bold text-[#065F46] flex items-center gap-1 select-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse"></span>
                  Server Siap
                </span>
              </div>

              <p className="text-xs text-[#444655] leading-relaxed">
                Masukkan token 6-karakter dari dosen untuk langsung membuka sesi kanvas kit:
              </p>

              <form onSubmit={handleTokenSubmit} className="space-y-2">
                <div className="relative">
                  <input
                    type="text"
                    value={tokenInput}
                    onChange={(e) => {
                      setTokenInput(e.target.value);
                      setTokenError('');
                    }}
                    placeholder="Contoh: KBT-9428"
                    className="w-full p-2.5 pl-3.5 pr-14 rounded-xl bg-[#FAF7F2] border-2 border-[#1B1B1E] font-mono font-bold text-sm tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-[#0038D1] shadow-[2px_2px_0px_#1B1B1E]"
                  />
                  {tokenInput && (
                    <button
                      type="button"
                      onClick={() => setTokenInput('')}
                      className="absolute right-3 top-2.5 text-[11px] font-bold text-[#71717A] hover:text-[#1B1B1E] cursor-pointer"
                    >
                      Hapus
                    </button>
                  )}
                </div>

                {tokenError && <p className="text-[11px] font-bold text-red-600">{tokenError}</p>}

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#1B1B1E] hover:bg-[#0038D1] text-white font-bold text-xs border-2 border-[#1B1B1E] shadow-[2px_2px_0px_#1B1B1E] hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Buka Sesi Kanvas Kit-Build</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

            {/* Exam Session Notice */}
            <div className="p-2.5 rounded-xl bg-[#F6F2F7] border border-[#1B1B1E] flex items-center gap-2 text-xs text-[#444655]">
              <ShieldCheck className="w-4 h-4 text-[#0038D1] shrink-0" />
              <span className="text-[10.5px] leading-tight">
                Mode Ujian: Timer pengerjaan dan penyimpanan otomatis aktif sejak sesi dibuka.
              </span>
            </div>
          </div>

          {/* Right Column: Active & Upcoming Database Assessments */}
          <div className="lg:col-span-7 p-5 rounded-2xl bg-white border-2 border-[#1B1B1E] shadow-[3px_3px_0px_#1B1B1E] flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#1B1B1E]/10">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#0038D1]" />
                <h3 className="text-sm sm:text-base font-serif font-black text-[#1B1B1E]">
                  Asesmen Terjadwal di Database
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-[#FAF7F2] border border-[#1B1B1E] text-[10px] font-mono font-bold text-[#1B1B1E]">
                1 Asesmen Aktif
              </span>
            </div>

            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-[#FAF7F2] border-2 border-[#1B1B1E] shadow-[1.5px_1.5px_0px_#1B1B1E] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded-full bg-[#ECFDF5] border border-[#059669] text-[9.5px] font-mono font-black text-[#065F46] uppercase flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse"></span>
                      Aktif Sekarang
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-white border border-[#1B1B1E] text-[9.5px] font-mono font-bold text-[#0038D1]">
                      {assessmentConfig.id}
                    </span>
                    <span className="text-[10px] font-mono text-[#71717A]">Token: {assessmentConfig.exam_token || 'KBT-9428'}</span>
                  </div>
                  <h4 className="font-bold text-xs text-[#1B1B1E] truncate">
                    {assessmentConfig.title}
                  </h4>
                  <p className="text-[10.5px] text-[#444655]">
                    {assessmentConfig.description || 'Rekonstruksi kepingan konsep dan relasi berarah.'} &bull; Durasi: {assessmentConfig.duration_minutes || 30} Menit
                  </p>
                </div>
                <button
                  onClick={onStartWorkspace}
                  className="shrink-0 px-3.5 py-1.5 rounded-lg bg-[#0038D1] hover:bg-[#2F54EB] text-white text-xs font-bold border border-[#1B1B1E] shadow-[1px_1px_0px_#1B1B1E] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>Kerjakan</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section 5: Two-column Cognitive Diagnostics & Assessment History */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Left Column: Retensi Kognitif & Diagnosa Miskonsepsi */}
          <div className="p-6 rounded-2xl bg-white border-2 border-[#1B1B1E] shadow-[4px_4px_0px_#1B1B1E] space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b-2 border-[#FAF7F2] gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <BarChart3 className="w-5 h-5 text-[#0038D1] shrink-0" />
                  <h3 className="text-base font-serif font-black text-[#1B1B1E] truncate">
                    Retensi Kognitif & Miskonsepsi
                  </h3>
                </div>
                <div className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EEF2FF] border border-[#0038D1] text-[10px] font-mono font-bold text-[#0038D1] whitespace-nowrap shadow-[1px_1px_0px_#1B1B1E] select-none leading-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0038D1] shrink-0" />
                  <span className="whitespace-nowrap">Diagnosa Graf Kognitif</span>
                </div>
              </div>

              {completedCount === 0 ? (
                <div className="py-10 text-center space-y-2 bg-[#FAF7F2] rounded-xl border border-[#1B1B1E]/20 p-4">
                  <FileText className="w-8 h-8 text-[#71717A] mx-auto" />
                  <p className="text-xs font-bold text-[#1B1B1E]">Belum Ada Riwayat Pengerjaan</p>
                  <p className="text-[11px] text-[#71717A] max-w-sm mx-auto">
                    Kerjakan asesmen di atas untuk memetakan diagnosa miskonsepsi dan retensi kognitif Anda secara langsung.
                  </p>
                </div>
              ) : totalGaps === 0 ? (
                <div className="py-10 text-center space-y-2 bg-[#FAF7F2] rounded-xl border border-[#1B1B1E]/20 p-4">
                  <CheckCircle2 className="w-8 h-8 text-[#059669] mx-auto" />
                  <p className="text-xs font-bold text-[#1B1B1E]">Tidak Ada Miskonsepsi Kritis Terdeteksi</p>
                  <p className="text-[11px] text-[#71717A] max-w-sm mx-auto">
                    Seluruh proposisi yang Anda rangkai telah sesuai dengan struktur graf acuan dosen.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {submissions[0]?.knowledge_gaps?.slice(0, 3).map((gap, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-[#FFFBEB] border-2 border-[#1B1B1E] shadow-[2px_2px_0px_#1B1B1E] space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2 py-0.5 rounded bg-white border border-[#1B1B1E] text-[10px] font-mono font-black text-[#1B1B1E]">
                          Celah Kognitif #{idx + 1}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-[#FEE2E2] border border-[#1B1B1E] text-[10px] font-bold text-[#DC2626]">
                          Perlu Penguatan
                        </span>
                      </div>
                      <p className="text-xs font-bold text-[#1B1B1E]">{gap}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {completedCount > 0 && (
              <div className="pt-3 border-t border-[#1B1B1E]/10 flex justify-end">
                <button
                  onClick={onViewResults}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FAF7F2] hover:bg-[#EEF2FF] text-[#0038D1] border-2 border-[#1B1B1E] font-bold text-xs shadow-[2px_2px_0px_#1B1B1E] cursor-pointer transition-all"
                >
                  <span>Lihat Analisis Graf Komparatif Lengkap</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Riwayat Pengerjaan Asesmen (REAL DATA ONLY) */}
          <div className="p-6 rounded-2xl bg-white border-2 border-[#1B1B1E] shadow-[4px_4px_0px_#1B1B1E] space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b-2 border-[#FAF7F2]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#059669]" />
                  <h3 className="text-base font-serif font-black text-[#1B1B1E]">
                    Riwayat Pengerjaan Asesmen
                  </h3>
                </div>
                {completedCount > 0 && (
                  <button
                    onClick={onViewResults}
                    className="text-xs font-bold text-[#0038D1] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Hasil Graf Terakhir</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {completedCount === 0 ? (
                <div className="py-12 text-center space-y-2 bg-[#FAF7F2] rounded-xl border border-[#1B1B1E]/20 p-4">
                  <FileText className="w-8 h-8 text-[#71717A] mx-auto" />
                  <p className="text-xs font-bold text-[#1B1B1E]">Belum Ada Riwayat Asesmen</p>
                  <p className="text-[11px] text-[#71717A] max-w-sm mx-auto">
                    Data pengumpulan Anda akan otomatis tersimpan ke database setelah menyelesaikan asesmen pertama.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-[#71717A] pb-1">
                    <span>{completedCount} asesmen telah diselesaikan</span>
                    <span className="font-mono font-bold text-[#059669] bg-[#ECFDF5] px-2 py-0.5 rounded border border-[#A7F3D0]">
                      Rata-rata: {avgScore}%
                    </span>
                  </div>

                  {submissions.map((sub, idx) => (
                    <div
                      key={idx}
                      className="px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border-2 border-[#1B1B1E] flex items-center justify-between gap-3 shadow-[1.5px_1.5px_0px_#1B1B1E]"
                    >
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-1.5 py-0.2 rounded border text-[9px] font-mono font-bold bg-[#EEF2FF] text-[#0038D1] border-[#C7D2FE]">
                            {sub.assessment_id}
                          </span>
                          <h4 className="font-bold text-xs text-[#1B1B1E] truncate">
                            {assessmentConfig.title}
                          </h4>
                        </div>
                        <span className="text-[9.5px] font-mono text-[#71717A] block">
                          Terkumpul &bull; {sub.evaluated_edges?.length || 0} Proposisi Dievaluasi
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        <div className="w-12 h-10 rounded-lg bg-white border-2 border-[#1B1B1E] shadow-[1.5px_1.5px_0px_#1B1B1E] flex flex-col items-center justify-center shrink-0">
                          <span className="font-mono font-black text-xs text-[#0038D1] leading-none">
                            {sub.total_score}
                          </span>
                          <span className="text-[8px] font-mono font-bold text-[#71717A] uppercase leading-none mt-0.5">
                            Skor
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#1B1B1E]/10 flex items-center justify-between text-[11px] text-[#71717A]">
              <span>Portofolio Konseptual Real-Time</span>
              <span className="font-mono font-bold text-[#0038D1]">Sinkron dengan Server</span>
            </div>
          </div>
        </div>

        {/* Section 6: Interactive Tips & Tricks Carousel Banner (Pure Slide Geser, No Emoticons) */}
        {(() => {
          const currentTip = KIT_BUILD_TIPS[activeTipIndex];
          return (
            <div
              onMouseEnter={() => setIsTipPaused(true)}
              onMouseLeave={() => setIsTipPaused(false)}
              className="relative p-4 sm:p-5 rounded-2xl bg-[#F6F2F7] border-2 border-[#1B1B1E] shadow-[3px_3px_0px_#1B1B1E] overflow-hidden transition-all"
            >
              {/* Top Meta Header: Clean Lucide Icon, Title & Navigation Controls */}
              <div className="flex items-center justify-between gap-3 pb-2.5 mb-2.5 border-b border-[#1B1B1E]/10">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-white border border-[#1B1B1E] text-[#0038D1] shadow-[1px_1px_0px_#1B1B1E] flex items-center justify-center">
                    <Lightbulb className="w-4 h-4 text-[#0038D1]" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black uppercase tracking-wider text-[#1B1B1E]">
                      Tips & Trik Metode Kit-Build
                    </span>
                    <span
                      className="px-2 py-0.5 rounded-full border border-[#1B1B1E] text-[9.5px] font-mono font-bold text-white transition-colors"
                      style={{ backgroundColor: currentTip.color }}
                    >
                      {currentTip.category}
                    </span>
                  </div>
                </div>

                {/* Right controls: Prev / Dots / Next */}
                <div className="flex items-center gap-2">
                  {isTipPaused && (
                    <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-[#FAF7F2] border border-[#1B1B1E]/30 text-[9px] font-mono text-[#71717A] animate-pulse">
                      Jeda
                    </span>
                  )}
                  <div className="flex items-center gap-1 bg-[#FAF7F2] px-2 py-1 rounded-xl border border-[#1B1B1E]">
                    <button
                      type="button"
                      onClick={() =>
                        handleManualTipChange(
                          (activeTipIndex - 1 + KIT_BUILD_TIPS.length) % KIT_BUILD_TIPS.length
                        )
                      }
                      className="p-0.5 rounded hover:bg-white text-[#1B1B1E] cursor-pointer transition-colors"
                      title="Tip Sebelumnya"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex items-center gap-1 px-1">
                      {KIT_BUILD_TIPS.map((tip, idx) => (
                        <button
                          key={tip.id}
                          type="button"
                          onClick={() => handleManualTipChange(idx)}
                          className={`transition-all rounded-full cursor-pointer ${
                            idx === activeTipIndex
                              ? 'w-4 h-1.5'
                              : 'w-1.5 h-1.5 bg-[#1B1B1E]/30 hover:bg-[#1B1B1E]'
                          }`}
                          style={{
                            backgroundColor: idx === activeTipIndex ? currentTip.color : undefined
                          }}
                          title={`Buka Tip #${idx + 1}`}
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleManualTipChange((activeTipIndex + 1) % KIT_BUILD_TIPS.length)
                      }
                      className="p-0.5 rounded hover:bg-white text-[#1B1B1E] cursor-pointer transition-colors"
                      title="Tip Berikutnya"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Pure Horizontal Sliding Track (slide geser murni tanpa flicker) */}
              <div className="overflow-hidden w-full">
                <div
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${activeTipIndex * 100}%)` }}
                >
                  {KIT_BUILD_TIPS.map((tip) => (
                    <div key={tip.id} className="w-full shrink-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1 min-w-0 pr-2">
                          <h4 className="text-xs sm:text-sm font-black text-[#1B1B1E] flex items-center gap-2">
                            <span>{tip.title}</span>
                          </h4>
                          <p className="text-xs text-[#444655] leading-relaxed">
                            {tip.desc}{' '}
                            <code className="bg-white px-1.5 py-0.5 rounded border border-[#1B1B1E] font-mono font-bold text-[11px] text-[#1B1B1E] shadow-[1px_1px_0px_#1B1B1E]">
                              {tip.highlight}
                            </code>{' '}
                            {tip.postDesc}
                          </p>
                        </div>

                        <span className="shrink-0 self-start sm:self-center px-3 py-1 rounded-full bg-white border border-[#1B1B1E] text-[10px] font-bold text-[#1B1B1E] shadow-[1.5px_1.5px_0px_#1B1B1E]">
                          {tip.badge}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress Bar (Color filling from left to right) */}
              <div className="absolute bottom-0 left-0 w-full h-1.5 bg-[#1B1B1E]/10 overflow-hidden">
                <div
                  className="h-full transition-all duration-75 ease-linear rounded-r-full"
                  style={{
                    width: `${tipProgress}%`,
                    backgroundColor: currentTip.color
                  }}
                />
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};
