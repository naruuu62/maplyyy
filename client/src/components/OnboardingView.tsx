'use client';

import React from 'react';
import { ActiveTab } from './Navbar';
import Interactive3DGraph from './Interactive3DGraph';
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  FileText,
  Network,
  CheckCircle2,
  AlertTriangle,
  Layers,
  BarChart3,
  KeyRound,
  Award,
  BookOpen,
  School,
  Lock,
  ChevronRight,
  Target,
  MousePointer,
  Compass,
  Check
} from 'lucide-react';

interface OnboardingViewProps {
  onNavigate: (tab: ActiveTab) => void;
  onOpenAuthModal?: (role?: 'student' | 'teacher') => void;
  onOpenWizard?: () => void;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({
  onNavigate,
  onOpenAuthModal,
  onOpenWizard
}) => {
  return (
    <div className="bg-[#FAF7F2] text-[#1B1B1E] min-h-screen">
      {/* Hero Section (Pixel-matched to Figma #52:7232 and User Reference) */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-1 sm:pt-2 pb-2 sm:pb-3 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ================= LEFT COLUMN: TYPOGRAPHY & INTENT (7 cols) ================= */}
          <div className="lg:col-span-7 space-y-5">
            {/* Eyebrow Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border-2 border-[#1B1B1E] shadow-[2px_2px_0px_#1B1B1E] text-[10px] font-extrabold uppercase tracking-widest text-[#1B1B1E]">
              <span className="w-2 h-2 rounded-full bg-[#DA3437]"></span>
              <span>KIT-BUILD METHODOLOGY &bull; TOPOLOGICAL ASSESSMENT</span>
            </div>

            {/* Main Headline with organic yellow brush stroke under 'See how they connect' */}
            <div className="space-y-1">
              <h1 className="text-4xl sm:text-6xl lg:text-[62px] font-serif font-black tracking-tight leading-[1.08] text-[#1B1B1E]">
                Don’t just test what they remember.{' '}
                <span className="relative inline-block text-[#0038D1]">
                  <span className="relative z-10">See how they connect</span>
                  {/* Organic yellow brush stroke highlight */}
                  <span className="absolute left-[-2px] right-[-2px] bottom-1 h-3.5 sm:h-4 bg-[#FFB95F]/70 rounded-full z-0 transform -rotate-1 pointer-events-none"></span>
                </span>{' '}
                what they know.
              </h1>
            </div>

            {/* Subtitle Paragraph */}
            <p className="text-sm sm:text-base text-[#444655] font-medium leading-relaxed max-w-2xl pt-1">
              Platform web yang mengukur pemahaman konseptual mahasiswa melalui rekonstruksi{' '}
              <span className="italic font-semibold text-[#1B1B1E]">directed concept map</span> (Kit-Build method).
              Evaluasi graf matematis 100% deterministik, membedakan miskonsepsi nyata tanpa risiko halusinasi skor LLM.
            </p>

            {/* CTAs Row 1: Masuk Sebagai Mahasiswa & Masuk Portal Dosen (Elongated Pill, Exactly Equal Size, No Wrap) */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => (onOpenAuthModal ? onOpenAuthModal('student') : onNavigate('student'))}
                className="flex items-center justify-center w-full sm:w-[310px] h-[52px] px-6 rounded-full bg-[#0038D1] hover:bg-[#1A4BDB] text-white font-serif font-bold text-base sm:text-[17px] border-2 border-[#1B1B1E] shadow-[4px_4px_0px_#1B1B1E] hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#1B1B1E] transition-all cursor-pointer text-center whitespace-nowrap"
              >
                <span>Masuk Sebagai Mahasiswa</span>
              </button>

              <button
                type="button"
                onClick={() => (onOpenAuthModal ? onOpenAuthModal('teacher') : onNavigate('teacher'))}
                className="flex items-center justify-center w-full sm:w-[310px] h-[52px] px-6 rounded-full bg-white hover:bg-[#F4F4F6] text-[#1B1B1E] font-serif font-bold text-base sm:text-[17px] border-2 border-[#1B1B1E] shadow-[4px_4px_0px_#1B1B1E] hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#1B1B1E] transition-all cursor-pointer text-center whitespace-nowrap"
              >
                <span>Masuk Portal Dosen</span>
              </button>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: INTERACTIVE 3D KNOWLEDGE GRAPH (5 cols) ================= */}
          <div className="lg:col-span-5">
            <Interactive3DGraph />
          </div>
        </div>

        {/* Full-width Banner across both columns (All the way to the right, no newline wrapping, no percentage) */}
        <div className="max-w-7xl mx-auto pt-6">
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[#F6F2F7] border-2 border-[#1B1B1E] shadow-[4px_4px_0px_#1B1B1E] flex flex-col md:flex-row items-center justify-between gap-4">

            {/* Left: Target Icon + COGNITIVE FIDELITY & Propositional Match (No percentage) */}
            <div className="flex items-center gap-3.5 shrink-0">
              <div className="w-10 h-10 rounded-full bg-[#FFDDB8] border-2 border-[#1B1B1E] flex items-center justify-center shadow-[1.5px_1.5px_0px_#1B1B1E] shrink-0">
                <Target className="w-5 h-5 text-[#8E5900] stroke-[2.5]" />
              </div>
              <div className="whitespace-nowrap">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#71717A] block leading-none mb-1">
                  COGNITIVE FIDELITY
                </span>
                <span className="text-base sm:text-lg font-serif font-black text-[#1B1B1E] leading-tight block">
                  Propositional Match
                </span>
              </div>
            </div>

            {/* Middle: Zero LLM Hallucinations on Scoring Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border-2 border-[#1B1B1E] text-xs font-bold text-[#1B1B1E] shadow-[1.5px_1.5px_0px_#1B1B1E] whitespace-nowrap">
              <span className="w-2 h-2 rounded-full bg-[#059669]"></span>
              <span>Zero LLM Hallucinations on Scoring (NetworkX Core)</span>
            </div>

            {/* Right: Pelajari Cara Kerja Kit-Build Button */}
            <button
              onClick={() => {
                const el = document.getElementById('section-kit-build');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                else if (onOpenAuthModal) onOpenAuthModal('student');
              }}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#FFDDB8] hover:bg-[#FFCE99] text-[#2A1700] font-bold text-xs sm:text-[13px] border-2 border-[#1B1B1E] shadow-[2px_2px_0px_#1B1B1E] hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer whitespace-nowrap shrink-0"
            >
              <span className="w-2 h-2 rounded-full bg-[#059669]"></span>
              <span>Pelajari Cara Kerja Kit-Build</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#2A1700]" />
            </button>
          </div>
        </div>
      </section>

      {/* SECTION: DEDICATED ROLE LOGIN SELECTOR (Dual Persona Portal Cards) */}
      <section id="section-kit-build" className="px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-16 sm:pb-20 bg-[#FAF7F2]">
        <div className="max-w-6xl mx-auto space-y-10">

          {/* Section Header */}
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E0E7FF] border-2 border-[#1B1B1E] shadow-[2px_2px_0px_#1B1B1E]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0038D1]"></span>
              <span className="text-[11px] font-black uppercase tracking-wider text-[#0038D1]">
                GERBANG MASUK MULTI-PERAN
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black text-[#1B1B1E] tracking-tight">
              Pilih Akses Masuk Anda ke Maply
            </h2>

            <p className="text-sm sm:text-base text-[#4B5563] leading-relaxed">
              Akses portal sesuai peran Anda. Mahasiswa masuk ke ruang pengerjaan kit rekonstruksi, sedangkan Dosen
              masuk ke ruang perancangan kurikulum dan evaluasi graf.
            </p>
          </div>

          {/* Dual Persona Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">

            {/* Card 1: Mahasiswa / Pelajar */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border-[3px] border-[#0038D1] shadow-[8px_8px_0px_#0038D1] flex flex-col justify-between space-y-7 transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[10px_10px_0px_#0038D1]">
              <div className="space-y-6">

                {/* Badges Row */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0038D1] text-white text-[11px] font-black uppercase tracking-wider shadow-[1.5px_1.5px_0px_#1B1B1E]">
                      <span className="w-1.5 h-1.5 bg-white rounded-xs"></span>
                      MAHASISWA / PELAJAR
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#064E3B] text-[#A7F3D0] text-[11px] font-bold border border-[#065F46] shadow-[1px_1px_0px_#065F46]">
                      <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
                      Sesi Kuis Aktif
                    </span>
                  </div>
                  <span className="text-xs font-mono text-[#71717A] font-semibold tracking-wide">
                    Student Workspace
                  </span>
                </div>

                {/* Title & Description */}
                <div className="space-y-2">
                  <h3 className="text-2xl sm:text-[28px] font-serif font-black text-[#1B1B1E] leading-tight">
                    Taman Asesmen Rekonstruksi{' '}
                    <span className="relative inline-block">
                      <span className="relative z-10">Mandiri</span>
                      <span className="absolute bottom-1 left-0 right-0 h-3 bg-[#D1E9FF] z-0 -rotate-1 rounded-sm"></span>
                    </span>
                  </h3>
                  <p className="text-xs sm:text-[13.5px] text-[#4B5563] leading-relaxed">
                    Selesaikan puzzle konsep interaktif dengan menyambungkan soket kepingan node materi. Dapatkan umpan balik kognitif instan tanpa takut dihakimi nilai kaku.
                  </p>
                </div>

                {/* Interactive Simulator Box */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#F6F4F8] border-2 border-[#1B1B1E] shadow-[inset_1px_1px_0px_rgba(27,27,30,0.06)] space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono font-bold">
                    <span className="text-[#0038D1] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#0038D1]"></span>
                      SIMULASI KANVAS KIT-BUILD
                    </span>
                    <span className="text-[#059669] text-[11px] font-black bg-[#ECFDF5] px-2.5 py-0.5 rounded-md border border-[#A7F3D0] shadow-[1px_1px_0px_#A7F3D0]">
                      1/2 Pasangan Valid (TP)
                    </span>
                  </div>

                  {/* Active Concept Connection Stage (Realistic Canvas Simulation) */}
                  <div className="p-3.5 rounded-xl border-2 border-[#1B1B1E] shadow-[2.5px_2.5px_0px_#1B1B1E] space-y-2.5 bg-white bg-[radial-gradient(#E2E8F0_1px,transparent_1px)] [background-size:10px_10px]">
                    <div className="flex items-center justify-between gap-1 sm:gap-2">
                      {/* Source Node */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="w-3.5 h-3.5 rounded-full bg-[#0038D1] border-2 border-[#1B1B1E] flex items-center justify-center shrink-0 shadow-[1px_1px_0px_#1B1B1E]">
                          <span className="w-1 h-1 rounded-full bg-white"></span>
                        </span>
                        <span className="px-2.5 py-1.5 rounded-lg bg-[#EEF2FF] border-2 border-[#0038D1] text-[11px] sm:text-xs font-black text-[#0038D1] shadow-[2px_2px_0px_#1B1B1E] whitespace-nowrap">
                          [Virtual Memory]
                        </span>
                      </div>

                      {/* Directed Linking Phrase with Realistic Canvas Arrow */}
                      <div className="flex items-center grow justify-center px-0.5 sm:px-1">
                        <div className="h-[2.5px] bg-[#1B1B1E] grow min-w-[8px]"></div>
                        <span className="shrink-0 mx-0.5 sm:mx-1 px-2.5 py-1 rounded-md bg-[#FFE4E6] border-2 border-[#1B1B1E] text-[10px] sm:text-[11px] font-mono font-black text-[#DA3437] shadow-[2px_2px_0px_#1B1B1E] whitespace-nowrap flex items-center gap-1">
                          maps to
                        </span>
                        <div className="h-[2.5px] bg-[#1B1B1E] grow min-w-[8px]"></div>
                        <svg className="w-3.5 h-3.5 text-[#1B1B1E] shrink-0 -ml-[2px]" viewBox="0 0 10 10" fill="currentColor">
                          <polygon points="0,1.5 8,5 0,8.5" />
                        </svg>
                      </div>

                      {/* Target Node */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="px-2.5 py-1.5 rounded-lg bg-[#FEF3C7] border-2 border-[#B45309] text-[11px] sm:text-xs font-black text-[#B45309] shadow-[2px_2px_0px_#1B1B1E] whitespace-nowrap">
                          [Page Table]
                        </span>
                        <span className="w-3.5 h-3.5 rounded-full bg-[#D97706] border-2 border-[#1B1B1E] flex items-center justify-center shrink-0 shadow-[1px_1px_0px_#1B1B1E]">
                          <span className="w-1 h-1 rounded-full bg-white"></span>
                        </span>
                      </div>
                    </div>

                    {/* Instant Feedback Sub-Bar */}
                    <div className="flex items-center justify-between pt-1.5 border-t border-dashed border-[#E5E7EB] text-[11px]">
                      <span className="text-[#059669] font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
                        <span>True Positive (TP): Relasi Valid Terhubung</span>
                      </span>
                      <span className="text-[10px] font-mono text-[#0038D1] font-bold hidden sm:inline">
                        Isomorfisme Graf ✓
                      </span>
                    </div>
                  </div>

                  {/* Concept Kit Tray Box (Student's unplaced concept nodes) */}
                  <div className="p-2.5 sm:p-3 bg-white/80 rounded-xl border border-[#1B1B1E]/20 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-mono font-bold text-[#4B5563] uppercase tracking-wider text-[10px] flex items-center gap-1">
                        <span></span> Kepingan di Tray (Siap Dirangkai):
                      </span>
                      <span className="text-[10px] font-mono font-bold text-[#B45309] bg-[#FEF3C7] px-2 py-0.5 rounded border border-[#FDE68A]">
                        Tersisa 3 Node
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-md bg-[#FAF7F2] border border-[#1B1B1E] text-[11px] font-bold text-[#1B1B1E] shadow-[1px_1px_0px_#1B1B1E] hover:bg-white cursor-pointer transition-colors flex items-center gap-1">
                        <span className="text-[#0038D1] font-mono">+</span> [TLB Cache]
                      </span>
                      <span className="px-2.5 py-1 rounded-md bg-[#FAF7F2] border border-[#1B1B1E] text-[11px] font-bold text-[#1B1B1E] shadow-[1px_1px_0px_#1B1B1E] hover:bg-white cursor-pointer transition-colors flex items-center gap-1">
                        <span className="text-[#0038D1] font-mono">+</span> [Physical RAM]
                      </span>
                      <span className="px-2.5 py-1 rounded-md bg-[#FAF7F2] border border-[#1B1B1E] text-[11px] font-bold text-[#1B1B1E] shadow-[1px_1px_0px_#1B1B1E] hover:bg-white cursor-pointer transition-colors flex items-center gap-1">
                        <span className="text-[#0038D1] font-mono">+</span> [Page Fault]
                      </span>
                    </div>
                  </div>
                </div>

                {/* Feature Checklist */}
                <div className="space-y-2.5 pt-1">
                  <div className="flex items-center gap-2.5 text-xs sm:text-[13px] font-bold text-[#1B1B1E]">
                    <div className="w-5 h-5 rounded-full bg-[#ECFDF5] border border-[#059669] flex items-center justify-center shrink-0 shadow-[1px_1px_0px_#059669]">
                      <Check className="w-3 h-3 text-[#059669] stroke-[3]" />
                    </div>
                    <span>Pengerjaan kuis rekonstruksi kit interaktif soket-ke-soket</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs sm:text-[13px] font-bold text-[#1B1B1E]">
                    <div className="w-5 h-5 rounded-full bg-[#ECFDF5] border border-[#059669] flex items-center justify-center shrink-0 shadow-[1px_1px_0px_#059669]">
                      <Check className="w-3 h-3 text-[#059669] stroke-[3]" />
                    </div>
                    <span>Umpan balik miskonsepsi instan tanpa skor intimidatif</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs sm:text-[13px] font-bold text-[#1B1B1E]">
                    <div className="w-5 h-5 rounded-full bg-[#ECFDF5] border border-[#059669] flex items-center justify-center shrink-0 shadow-[1px_1px_0px_#059669]">
                      <Check className="w-3 h-3 text-[#059669] stroke-[3]" />
                    </div>
                    <span>Visualisasi pemahaman kognitif personal (Personal Mental Model)</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => (onOpenAuthModal ? onOpenAuthModal('student') : onNavigate('student'))}
                  className="w-full py-3.5 sm:py-4 px-6 rounded-full bg-[#0038D1] hover:bg-[#1A4BDB] text-white font-bold text-sm sm:text-base border-2 border-[#1B1B1E] shadow-[4px_4px_0px_#1B1B1E] hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#1B1B1E] transition-all flex items-center justify-center gap-2.5 cursor-pointer group"
                >
                  <span>Masuk sebagai Mahasiswa (NIM / SSO FILKOM)</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <p className="text-[11px] text-[#71717A] text-center font-medium">
                  Gunakan akun Mahasiswa Universitas Brawijaya / Google Classroom
                </p>
              </div>
            </div>

            {/* Card 2: Dosen / Peneliti */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border-[3px] border-[#1B1B1E] shadow-[8px_8px_0px_#1B1B1E] flex flex-col justify-between space-y-7 transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[10px_10px_0px_#8E5900]">
              <div className="space-y-6">

                {/* Badges Row */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFDDB8] text-[#2A1700] text-[11px] font-black uppercase tracking-wider border-2 border-[#1B1B1E] shadow-[1.5px_1.5px_0px_#1B1B1E]">
                      <span className="text-xs"></span>
                      DOSEN & PENGAJAR
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F4F4F6] text-[#4B5563] text-[11px] font-bold border border-[#1B1B1E] shadow-[1px_1px_0px_#1B1B1E]">
                      OBE & Analytics
                    </span>
                  </div>
                  <span className="text-xs font-mono text-[#71717A] font-semibold tracking-wide">
                    Teacher Console
                  </span>
                </div>

                {/* Title & Description */}
                <div className="space-y-2">
                  <h3 className="text-2xl sm:text-[28px] font-serif font-black text-[#1B1B1E] leading-tight">
                    Master Map Builder & Analisis{' '}
                    <span className="relative inline-block">
                      <span className="relative z-10">Kelas</span>
                      <span className="absolute bottom-1 left-0 right-0 h-3 bg-[#FFDDB8] z-0 -rotate-1 rounded-sm"></span>
                    </span>
                  </h3>
                  <p className="text-xs sm:text-[13.5px] text-[#4B5563] leading-relaxed">
                    Rancang kerangka konsep kuliah (Master Concept Map), dekonstruksi kit otomatis ke mahasiswa, dan periksa peta miskonsepsi sekelas dalam hitungan detik.
                  </p>
                </div>

                {/* Interactive Analytics Box */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#F6F4F8] border-2 border-[#1B1B1E] shadow-[inset_1px_1px_0px_rgba(27,27,30,0.06)] space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono font-bold">
                    <span className="text-[#8E5900] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#D97706]"></span>
                      MATRIKS GRAF KELAS REALTIME
                    </span>
                    <span className="text-[#B91C1C] text-[11px] font-black bg-[#FEE2E2] px-2.5 py-0.5 rounded-md border border-[#FCA5A5] flex items-center gap-1.5 shadow-[1px_1px_0px_#FCA5A5]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#B91C1C] animate-pulse"></span>
                      2 Miskonsepsi Terdeteksi
                    </span>
                  </div>

                  {/* Dual Metric Box Grid */}
                  <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                    {/* Metric 1: Rerata TP */}
                    <div className="p-3 bg-white rounded-xl border-2 border-[#1B1B1E] shadow-[2px_2px_0px_#1B1B1E] flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-mono font-black uppercase tracking-wider text-[#71717A] block">
                          RERATA KECOCOKAN TP
                        </span>
                        <div className="flex items-baseline gap-0.5 mt-0.5">
                          <span className="text-2xl sm:text-3xl font-sans font-black tracking-tight text-[#0038D1] lining-nums tabular-nums">
                            88.4
                          </span>
                          <span className="text-xl sm:text-2xl font-sans font-black text-[#0038D1] lining-nums">
                            %
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 pt-1.5 border-t border-dashed border-[#E5E7EB]">
                        <div className="w-full h-1.5 rounded-full bg-[#E5E7EB] overflow-hidden">
                          <div className="w-[88.4%] h-full bg-[#0038D1] rounded-full"></div>
                        </div>
                        <span className="text-[10px] font-bold text-[#059669] mt-1 block">
                          ✓ Pemahaman Kohort Kuat
                        </span>
                      </div>
                    </div>

                    {/* Metric 2: Missing Edge */}
                    <div className="p-3 bg-white rounded-xl border-2 border-[#1B1B1E] shadow-[2px_2px_0px_#1B1B1E] flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-mono font-black uppercase tracking-wider text-[#71717A] block">
                          MISSING EDGE KRITIS
                        </span>
                        <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
                          <span className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-[#FEE2E2] border-2 border-[#B91C1C] text-xs sm:text-sm font-black text-[#B91C1C] shadow-[1.5px_1.5px_0px_#B91C1C]">
                            ALU
                          </span>
                          <span className="text-sm sm:text-base font-mono font-black text-[#B91C1C]">&rarr;</span>
                          <span className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-[#FEE2E2] border-2 border-[#B91C1C] text-xs sm:text-sm font-black text-[#B91C1C] shadow-[1.5px_1.5px_0px_#B91C1C]">
                            Bus
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 pt-1.5 border-t border-dashed border-[#E5E7EB]">
                        <span className="text-[10px] font-mono text-[#B91C1C] font-bold block truncate">
                          ⚠️ 14 Mhs Keliru Konsep Ini
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* OBE / Syllabus Decomposition Preview Strip */}
                  <div className="p-2.5 sm:p-3 bg-white/80 rounded-xl border border-[#1B1B1E]/20 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-mono font-bold text-[#4B5563] uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
                        <span>Kesesuaian Capaian Pembelajaran (OBE / CPL):</span>
                      </span>
                      <span className="text-[10px] font-mono font-bold text-[#059669] bg-[#ECFDF5] px-2 py-0.5 rounded border border-[#A7F3D0]">
                        CPL-02: 91.2%
                      </span>
                    </div>
                    <p className="text-[10px] text-[#6B7280] leading-snug">
                      Ekstraksi Master Map dari silabus otomatis terhubung ke rubrik asesmen KKNI FILKOM.
                    </p>
                  </div>
                </div>

                {/* Feature Checklist */}
                <div className="space-y-2.5 pt-1">
                  <div className="flex items-center gap-2.5 text-xs sm:text-[13px] font-bold text-[#1B1B1E]">
                    <div className="w-5 h-5 rounded-full bg-[#FEF3C7] border border-[#D97706] flex items-center justify-center shrink-0 shadow-[1px_1px_0px_#D97706]">
                      <Check className="w-3 h-3 text-[#B45309] stroke-[3]" />
                    </div>
                    <span>Pembuatan Master Map visual dan dekomposisi kit instan</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs sm:text-[13px] font-bold text-[#1B1B1E]">
                    <div className="w-5 h-5 rounded-full bg-[#FEF3C7] border border-[#D97706] flex items-center justify-center shrink-0 shadow-[1px_1px_0px_#D97706]">
                      <Check className="w-3 h-3 text-[#B45309] stroke-[3]" />
                    </div>
                    <span>Analisis Class Knowledge Gap & Cluster Miskonsepsi Siswa</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs sm:text-[13px] font-bold text-[#1B1B1E]">
                    <div className="w-5 h-5 rounded-full bg-[#FEF3C7] border border-[#D97706] flex items-center justify-center shrink-0 shadow-[1px_1px_0px_#D97706]">
                      <Check className="w-3 h-3 text-[#B45309] stroke-[3]" />
                    </div>
                    <span>Evaluasi graf deterministik NetworkX tanpa tebakan LLM</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => (onOpenAuthModal ? onOpenAuthModal('teacher') : onNavigate('teacher'))}
                  className="w-full py-3.5 sm:py-4 px-6 rounded-full bg-[#1B1B1E] hover:bg-[#2A2A2E] text-white font-bold text-sm sm:text-base border-2 border-[#1B1B1E] shadow-[4px_4px_0px_#1B1B1E] hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#1B1B1E] transition-all flex items-center justify-center gap-2.5 cursor-pointer group"
                >
                  <span>Masuk Portal Dosen (NIP / Akun Kampus)</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <p className="text-[11px] text-[#71717A] text-center font-medium">
                  Dukungan NIP Dosen UB & Integrasi SIAKAD / Kurikulum OBE
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 4: CARA KERJA ENGINE KIT-BUILD DUAL PEDAGOGY (Figma & User Reference) */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 max-w-6xl mx-auto">
        <div className="p-6 sm:p-10 lg:p-12 rounded-3xl bg-[#FAF7F2] border-[2.5px] border-[#1B1B1E] shadow-[8px_8px_0px_#1B1B1E] space-y-14">

          {/* ================= TIER 1: CARA KERJA ENGINE UNTUK DOSEN ================= */}
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="text-center space-y-3">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFDDB8] border-2 border-[#1B1B1E] shadow-[2px_2px_0px_#1B1B1E]">
                  <span className="text-sm"></span>
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#2A1700]">
                    KHUSUS PENGAJAR & PERANCANG KURIKULUM
                  </span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-serif font-black text-[#1B1B1E] tracking-tight">
                  Cara Kerja Engine Kit-Build untuk Dosen
                </h2>
              </div>

              {/* Context Notice Box */}
              <div className="max-w-3xl mx-auto p-4 rounded-xl bg-white border-2 border-[#1B1B1E] shadow-[2.5px_2.5px_0px_#1B1B1E] text-xs sm:text-[13px] text-[#444655] leading-relaxed">
                <span className="font-bold text-[#1B1B1E]">Catatan Konteks:</span> Area penjelasan arsitektur evaluasi dan penyusunan peta master ini dirancang khusus untuk <strong className="text-[#1B1B1E]">Dosen / Pengajar</strong> dalam mengimplementasikan asesmen kognitif berbasis konsep di kelas akademik.
              </div>
            </div>

            {/* Subheading */}
            <div className="pt-2">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-2.5 h-2.5 rounded-full bg-[#8E5900]"></span>
                <h3 className="text-lg sm:text-xl font-serif font-black text-[#1B1B1E]">
                  <span className="font-sans">3</span> Langkah Kit-Build untuk Dosen
                </h3>
              </div>

              {/* 3 Step Cards Grid for Dosen */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">

                {/* Card 01: Dosen Menyusun Kerangka Konsep */}
                <div className="p-5 sm:p-6 rounded-2xl bg-white border-2 border-[#1B1B1E] shadow-[4px_4px_0px_#1B1B1E] flex flex-col justify-between space-y-5 transition-all hover:translate-x-[-1px] hover:translate-y-[-1px]">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full bg-[#FFDDB8] border border-[#1B1B1E] text-[11px] font-black text-[#2A1700]">
                        01 / Master Map
                      </span>
                      <span className="w-2.5 h-2.5 rounded-full bg-[#8E5900]"></span>
                    </div>
                    <h4 className="text-base sm:text-lg font-serif font-black text-[#1B1B1E] leading-snug">
                      Dosen Menyusun Kerangka Konsep
                    </h4>
                    <p className="text-xs text-[#555] leading-relaxed">
                      Pengajar merancang node konsep kunci dan relasi terarah berlabel secara visual di kanvas. Menjadi standar emas (ground truth) silabus mata kuliah.
                    </p>

                    {/* Inner widget */}
                    <div className="p-3.5 rounded-xl bg-[#F6F4F8] border border-[#1B1B1E]/20 space-y-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#0038D1]">
                        <Network className="w-4 h-4 text-[#0038D1]" />
                        <span>Kanvas Visual Drag-and-Drop</span>
                      </div>
                      <p className="text-[11px] text-[#71717A]">
                        Penetapan label proposisi & arah relasi node
                      </p>
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-[#EAE7EB] flex items-center justify-between text-[11px] font-mono">
                    <span className="text-[#71717A]">Hasil Langkah:</span>
                    <span className="font-bold text-[#8E5900] bg-[#FFDDB8]/40 px-2 py-0.5 rounded border border-[#FFDDB8] inline-flex items-center gap-1">
                      <Check className="w-3 h-3 text-[#8E5900] stroke-[2.5]" />
                      Standar Emas Presisi
                    </span>
                  </div>
                </div>

                {/* Card 02: Sistem Mendekomposisi Jadi Kit */}
                <div className="p-5 sm:p-6 rounded-2xl bg-white border-2 border-[#1B1B1E] shadow-[4px_4px_0px_#1B1B1E] flex flex-col justify-between space-y-5 transition-all hover:translate-x-[-1px] hover:translate-y-[-1px]">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full bg-[#FFE4E6] border border-[#1B1B1E] text-[11px] font-black text-[#B61722]">
                        02 / Kit Decomposition
                      </span>
                      <span className="w-2.5 h-2.5 rounded-full bg-[#B61722]"></span>
                    </div>
                    <h4 className="text-base sm:text-lg font-serif font-black text-[#1B1B1E] leading-snug">
                      Sistem Mendekomposisi Jadi Kit
                    </h4>
                    <p className="text-xs text-[#555] leading-relaxed">
                      Algoritma otomatis memisahkan konektor relasi dan mengacak kepingan konsep. Mahasiswa menerima kit pecahan tanpa melihat diagram jawaban asli.
                    </p>

                    {/* Inner widget */}
                    <div className="p-3.5 rounded-xl bg-[#F6F4F8] border border-[#1B1B1E]/20 space-y-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#B61722]">
                        <Layers className="w-4 h-4 text-[#B61722]" />
                        <span>Pemisahan Graf Otomatis</span>
                      </div>
                      <p className="text-[11px] text-[#71717A]">
                        Kotak kepingan acak siap dibagikan ke kelas
                      </p>
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-[#EAE7EB] flex items-center justify-between text-[11px] font-mono">
                    <span className="text-[#71717A]">Hasil Langkah:</span>
                    <span className="font-bold text-[#B61722] bg-[#FFE4E6]/50 px-2 py-0.5 rounded border border-[#FFE4E6] inline-flex items-center gap-1">
                      <Check className="w-3 h-3 text-[#B61722] stroke-[2.5]" />
                      Kit Siap Ditugaskan
                    </span>
                  </div>
                </div>

                {/* Card 03: Evaluasi Graf Matematis Otomatis */}
                <div className="p-5 sm:p-6 rounded-2xl bg-white border-2 border-[#1B1B1E] shadow-[4px_4px_0px_#1B1B1E] flex flex-col justify-between space-y-5 transition-all hover:translate-x-[-1px] hover:translate-y-[-1px]">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full bg-[#EEF2FF] border border-[#1B1B1E] text-[11px] font-black text-[#0038D1]">
                        03 / NetworkX Matching
                      </span>
                      <span className="w-2.5 h-2.5 rounded-full bg-[#059669]"></span>
                    </div>
                    <h4 className="text-base sm:text-lg font-serif font-black text-[#1B1B1E] leading-snug">
                      Evaluasi Graf Matematis Otomatis
                    </h4>
                    <p className="text-xs text-[#555] leading-relaxed">
                      Topological matching NetworkX membandingkan susunan mahasiswa vs master map. Menghasilkan metrik TP, FP, Missing link tanpa tebakan scoring LLM.
                    </p>

                    {/* Inner widget */}
                    <div className="p-3.5 rounded-xl bg-[#F6F4F8] border border-[#1B1B1E]/20 space-y-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#059669]">
                        <CheckCircle2 className="w-4 h-4 text-[#059669]" />
                        <span>100% Deterministik Graf</span>
                      </div>
                      <p className="text-[11px] text-[#71717A]">
                        Zero halusinasi & deteksi pola miskonsepsi
                      </p>
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-[#EAE7EB] flex items-center justify-between text-[11px] font-mono">
                    <span className="text-[#71717A]">Hasil Langkah:</span>
                    <span className="font-bold text-[#0038D1] bg-[#EEF2FF] px-2 py-0.5 rounded border border-[#C7D2FE] inline-flex items-center gap-1">
                      <Check className="w-3 h-3 text-[#0038D1] stroke-[2.5]" />
                      100% Deterministik Graf
                    </span>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* ================= TIER 2: 3 LANGKAH BAGI MAHASISWA ================= */}
          <div className="pt-8 border-t-2 border-[#1B1B1E]/15 space-y-6">

            {/* Header Tier 2 */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E0E7FF] border-2 border-[#1B1B1E] shadow-[1.5px_1.5px_0px_#1B1B1E]">
                  <span className="w-2 h-2 rounded-full bg-[#0038D1]"></span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#0038D1]">
                    KHUSUS MAHASISWA & PEMBELAJAR MANDIRI
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-serif font-black text-[#1B1B1E]">
                  <span className="font-sans">3</span> Langkah Rekonstruksi Peta Konsep bagi Mahasiswa
                </h3>
                <p className="text-xs sm:text-sm text-[#444655]">
                  Bagaimana mahasiswa membuktikan pemahaman konseptual nyata tanpa intimidasi ujian hafalan biasa.
                </p>
              </div>

              {/* Floating Mode Pill on Right */}
              <div className="shrink-0">
                <span className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white border-2 border-[#1B1B1E] shadow-[2px_2px_0px_#1B1B1E] text-xs font-bold text-[#0038D1]">
                  <GraduationCap className="w-4 h-4 text-[#0038D1]" />
                  <span>Mode Belajar Eksploratif</span>
                </span>
              </div>
            </div>

            {/* 3 Step Cards Grid for Mahasiswa */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">

              {/* Card 01: Buka Tray Kepingan Konsep */}
              <div className="p-5 sm:p-6 rounded-2xl bg-white border-2 border-[#1B1B1E] shadow-[4px_4px_0px_#1B1B1E] flex flex-col justify-between space-y-5 transition-all hover:translate-x-[-1px] hover:translate-y-[-1px]">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full bg-[#EEF2FF] border border-[#1B1B1E] text-[11px] font-black text-[#0038D1]">
                      01 / Terima Kepingan Kit Acak
                    </span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#0038D1]"></span>
                  </div>
                  <h4 className="text-base sm:text-lg font-serif font-black text-[#1B1B1E] leading-snug">
                    Buka Tray Kepingan Konsep
                  </h4>
                  <p className="text-xs text-[#555] leading-relaxed">
                    Mahasiswa menerima himpunan simpul konsep materi dan kepingan relasi berarah yang telah didekomposisi oleh sistem tanpa melihat jawaban asli dosen.
                  </p>

                  {/* Inner widget: Tray Kepingan Konsep */}
                  <div className="p-3.5 rounded-xl bg-white border-2 border-[#1B1B1E] shadow-[2px_2px_0px_#1B1B1E] space-y-2.5 bg-[radial-gradient(#CBD5E1_1px,transparent_1px)] [background-size:8px_8px]">
                    <div className="flex items-center justify-between text-[11px] font-mono font-bold">
                      <span className="text-[#1B1B1E] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#0038D1]"></span>
                        <span>Tray Kepingan Interaktif</span>
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-[#ECFDF5] border border-[#059669] text-[10px] font-bold text-[#059669]">
                        Siap Disusun
                      </span>
                    </div>

                    {/* Concept & Relation Chips in Tray */}
                    <div className="flex flex-wrap items-center gap-2 pt-0.5">
                      {/* Node Chip 1: Virtual Memory */}
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#EEF2FF] border-2 border-[#0038D1] shadow-[1.5px_1.5px_0px_#1B1B1E] shrink-0">
                        <span className="w-2 h-2 rounded-full bg-[#0038D1] border border-[#1B1B1E]"></span>
                        <span className="text-[11px] font-black text-[#0038D1]">Virtual Memory</span>
                      </div>

                      {/* Directed Relation Chip: maps to */}
                      <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-[#FFE4E6] border-2 border-[#1B1B1E] shadow-[1.5px_1.5px_0px_#1B1B1E] shrink-0">
                        <span className="text-[10px] font-mono font-black text-[#DA3437]">maps to</span>
                        <svg className="w-2.5 h-2.5 text-[#DA3437] fill-current" viewBox="0 0 10 10">
                          <polygon points="0,2 7,5 0,8" />
                        </svg>
                      </div>

                      {/* Node Chip 2: Page Table */}
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FEF3C7] border-2 border-[#B45309] shadow-[1.5px_1.5px_0px_#1B1B1E] shrink-0">
                        <span className="w-2 h-2 rounded-full bg-[#D97706] border border-[#1B1B1E]"></span>
                        <span className="text-[11px] font-black text-[#B45309]">Page Table</span>
                      </div>

                      {/* Node Chip 3: + TLB Cache */}
                      <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#FAF7F2] border border-[#1B1B1E] shadow-[1px_1px_0px_#1B1B1E] shrink-0 text-[#1B1B1E]">
                        <span className="text-[#0038D1] font-mono font-black text-[11px]">+</span>
                        <span className="text-[10px] font-bold text-[#555]">TLB Cache</span>
                      </div>
                    </div>

                    {/* Bottom Micro Indicator */}
                    <div className="flex items-center justify-between pt-1.5 border-t border-dashed border-[#1B1B1E]/15 text-[10px] font-mono text-[#555]">
                      <span className="font-bold text-[#0038D1] flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0038D1]"></span>
                        <span>Soket Magnetik Plug-in</span>
                      </span>
                      <span className="font-bold text-[#B45309] bg-[#FEF3C7] px-1.5 py-0.5 rounded border border-[#FDE68A]">
                        3 Simpul + 1 Relasi
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-[#EAE7EB] flex items-center justify-between text-[11px] font-mono">
                  <span className="text-[#71717A]">Hasil Sesi:</span>
                  <span className="font-bold text-[#0038D1] bg-[#EEF2FF] px-2 py-0.5 rounded border border-[#C7D2FE] inline-flex items-center gap-1">
                    <Check className="w-3 h-3 text-[#0038D1] stroke-[2.5]" />
                    Kanvas Bebas Tekanan
                  </span>
                </div>
              </div>

              {/* Card 02: Rangkai Soket Plug & Snap */}
              <div className="p-5 sm:p-6 rounded-2xl bg-white border-2 border-[#1B1B1E] shadow-[4px_4px_0px_#1B1B1E] flex flex-col justify-between space-y-5 transition-all hover:translate-x-[-1px] hover:translate-y-[-1px]">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full bg-[#FFDDB8] border border-[#1B1B1E] text-[11px] font-black text-[#2A1700]">
                      02 / Susun & Hubungkan Proposisi
                    </span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#8E5900]"></span>
                  </div>
                  <h4 className="text-base sm:text-lg font-serif font-black text-[#1B1B1E] leading-snug">
                    Rangkai Soket Plug & Snap
                  </h4>
                  <p className="text-xs text-[#555] leading-relaxed">
                    Seret kepingan ke kanvas rekonstruksi. Pasangkan soket konsep dengan relasi berlabel yang tepat untuk membentuk struktur pengetahuan terpadu.
                  </p>

                  {/* Inner widget */}
                  <div className="p-3 rounded-xl bg-[#F6F4F8] border border-[#1B1B1E]/20 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono font-bold">
                      <span className="text-[#8E5900] flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#8E5900]" />
                        <span>Soket Plug & Snap</span>
                      </span>
                      <span className="text-[#059669]">Terhubung Valid: 85%</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-[#E5E7EB] border border-[#1B1B1E]/20 overflow-hidden">
                      <div className="w-[85%] h-full bg-[#059669] rounded-full"></div>
                    </div>
                    <p className="text-[10px] text-[#71717A]">
                      Soket magnetik otomatis snap saat relasi mendekati simpul
                    </p>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-[#EAE7EB] flex items-center justify-between text-[11px] font-mono">
                  <span className="text-[#71717A]">Hasil Sesi:</span>
                  <span className="font-bold text-[#8E5900] bg-[#FFDDB8]/40 px-2 py-0.5 rounded border border-[#FFDDB8] inline-flex items-center gap-1">
                    <Check className="w-3 h-3 text-[#8E5900] stroke-[2.5]" />
                    Struktur Proposisi Utuh
                  </span>
                </div>
              </div>

              {/* Card 03: Evaluasi Kognitif Personal */}
              <div className="p-5 sm:p-6 rounded-2xl bg-white border-2 border-[#1B1B1E] shadow-[4px_4px_0px_#1B1B1E] flex flex-col justify-between space-y-5 transition-all hover:translate-x-[-1px] hover:translate-y-[-1px]">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full bg-[#ECFDF5] border border-[#1B1B1E] text-[11px] font-black text-[#059669]">
                      03 / Diagnosa & Feedback
                    </span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#059669]"></span>
                  </div>
                  <h4 className="text-base sm:text-lg font-serif font-black text-[#1B1B1E] leading-snug">
                    Evaluasi Kognitif Personal
                  </h4>
                  <p className="text-xs text-[#555] leading-relaxed">
                    Sistem langsung menganalisis isomorfisme graf secara real-time. Tunjukkan persis di mana letak miskonsepsi (bukan sekadar salah/benar) dan dapatkan rekomendasi micro-remedial.
                  </p>

                  {/* Inner widget */}
                  <div className="p-3.5 rounded-xl bg-[#F6F4F8] border border-[#1B1B1E]/20 space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#059669]">
                      <Target className="w-3.5 h-3.5 text-[#059669]" />
                      <span>Peta Celah Kognitif Personal</span>
                    </div>
                    <p className="text-[11px] text-[#71717A]">
                      Deteksi Miskonsepsi Instan & Rekomendasi Remedial
                    </p>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-[#EAE7EB] flex items-center justify-between text-[11px] font-mono">
                  <span className="text-[#71717A]">Hasil Sesi:</span>
                  <span className="font-bold text-[#059669] bg-[#ECFDF5] px-2 py-0.5 rounded border border-[#A7F3D0] inline-flex items-center gap-1">
                    <Check className="w-3 h-3 text-[#059669] stroke-[2.5]" />
                    Diagnosa & Remedial Cepat
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* ================= BOTTOM TRUST INSET BANNER ================= */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border-2 border-[#1B1B1E] shadow-[3px_3px_0px_#1B1B1E] flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-full bg-[#EEF2FF] border border-[#0038D1] flex items-center justify-center shrink-0 shadow-[1px_1px_0px_#0038D1]">
              <ShieldCheck className="w-5 h-5 text-[#0038D1]" />
            </div>
            <p className="text-xs sm:text-sm text-[#444655] leading-relaxed">
              Belajar dari kekeliruan struktural tanpa rasa takut &mdash; Maply membedakan <strong className="text-[#1B1B1E]">&lsquo;lupa rumus&rsquo;</strong> dengan <strong className="text-[#1B1B1E]">&lsquo;salah paham konsep&rsquo;</strong>.
            </p>
          </div>

        </div>
      </section>


      {/* Academic Footer (Figma #52:7691) */}
      <footer className="py-6 px-4 bg-[#F4EFE6] border-t-2 border-[#1B1B1E] text-center text-xs font-semibold text-[#444655]">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Maply Cognitive Lab &bull; In academic partnership with FILKOM Universitas Brawijaya.</p>
          <div className="flex items-center gap-3 text-xs font-bold">
            <span className="hover:underline cursor-pointer">Buku Panduan Dosen</span>
            <span>&bull;</span>
            <span className="hover:underline cursor-pointer">Panduan Kit-Build Mahasiswa</span>
            <span>&bull;</span>
            <span className="hover:underline cursor-pointer">Dokumentasi API NetworkX</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
