'use client';

import React from 'react';
import { EvaluationResult, AssessmentConfig } from '../types/maply';
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowLeft,
  RotateCcw,
  BookOpen,
  GitCompare,
  Target,
  Clock,
  User
} from 'lucide-react';

interface StudentEvaluationViewProps {
  result: EvaluationResult;
  assessmentConfig: AssessmentConfig;
  onBackToDashboard: () => void;
  onRetakeWorkspace: () => void;
}

export const StudentEvaluationView: React.FC<StudentEvaluationViewProps> = ({
  result,
  assessmentConfig,
  onBackToDashboard,
  onRetakeWorkspace
}) => {
  const isPassing = result.total_score >= 70;

  return (
    <div className="bg-[#FAF7F2] text-[#1B1B1E] min-h-screen pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">

        {/* SECTION 1: HEADER BAR (Figma #46:875) */}
        <div className="p-6 rounded-2xl bg-white border-2 border-[#1B1B1E] shadow-[4px_4px_0px_#1B1B1E] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#EEF2FF] border border-[#0038D1] text-[11px] font-black text-[#0038D1]">
                HASIL EVALUASI GRAF RESMI
              </span>
              <span className="text-xs text-[#71717A] font-bold">&bull;</span>
              <span className="text-xs font-mono font-bold text-[#4B5563]">
                FILKOM UB &bull; Arsitektur Komputer
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-serif font-black text-[#1B1B1E]">
              {assessmentConfig.title || 'Asesmen #01: Alur Pemrosesan CPU & Hirarki Memori'}
            </h1>
            <div className="flex items-center gap-3 text-xs text-[#71717A]">
              <span className="flex items-center gap-1 font-bold text-[#1B1B1E]">
                <User className="w-3.5 h-3.5 text-[#0038D1]" />
                {result.student_name}
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
              </span>
            </div>
          </div>

          {/* Navigation Actions */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              type="button"
              onClick={onBackToDashboard}
              className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-white hover:bg-slate-100 text-[#1B1B1E] font-serif font-bold text-xs border-2 border-[#1B1B1E] shadow-[2px_2px_0px_#1B1B1E] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Dashboard Mahasiswa</span>
            </button>
            <button
              type="button"
              onClick={onRetakeWorkspace}
              className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#0038D1] hover:bg-[#1A4BDB] text-white font-serif font-bold text-xs border-2 border-[#1B1B1E] shadow-[2.5px_2.5px_0px_#1B1B1E] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Kerjakan Ulang</span>
            </button>
          </div>
        </div>

        {/* SECTION 2: PRIMARY SCORE & TOPOLOGY METRICS (Figma #46:902) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Main Hero Score Block */}
          <div className="lg:col-span-4 p-6 sm:p-8 rounded-3xl bg-[#FFEAA7] border-2 border-[#1B1B1E] shadow-[6px_6px_0px_#1B1B1E] flex flex-col items-center justify-between text-center space-y-4">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#1B1B1E] text-[10px] font-mono font-bold uppercase tracking-wider text-[#1B1B1E]">
                <Award className="w-3.5 h-3.5 text-[#D97706]" />
                SKOR PEMAHAMAN KONSEPTUAL
              </span>
              <p className="text-xs text-[#555] pt-1">
                Evaluasi graf deterministik NetworkX tanpa estimasi LLM
              </p>
            </div>

            <div className="py-2">
              <div className="text-6xl sm:text-7xl font-sans font-black text-[#0038D1] tracking-tight tabular-nums">
                {result.total_score}
              </div>
              <span className="text-xs font-mono font-bold text-[#4B5563]">Skala 0 &ndash; 100</span>
            </div>

            <div className="w-full pt-3 border-t-2 border-[#1B1B1E]/20 flex items-center justify-between text-xs font-bold">
              <span className="text-[#4B5563]">Status Kelulusan:</span>
              <span
                className={`px-3 py-1 rounded-full border border-[#1B1B1E] font-black uppercase text-[11px] ${
                  isPassing ? 'bg-[#ECFDF5] text-[#059669]' : 'bg-[#FEE2E2] text-[#B91C1C]'
                }`}
              >
                {isPassing ? '✓ Memenuhi CPL' : '⚠ Butuh Penguatan'}
              </span>
            </div>
          </div>

          {/* Sub-Metric Cards Grid */}
          <div className="lg:col-span-8 flex flex-col justify-between gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 grow">
              {/* Metric 1 */}
              <div className="p-5 rounded-2xl bg-white border-2 border-[#1B1B1E] shadow-[3px_3px_0px_#1B1B1E] flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <span className="text-[10.5px] font-mono font-bold uppercase text-[#71717A] block">
                    01 &bull; Presensi Konsep
                  </span>
                  <div className="text-3xl font-sans font-black text-[#1B1B1E] tracking-tight tabular-nums">
                    {result.concept_recognition_score}%
                  </div>
                  <p className="text-[11px] text-[#555]">
                    Simpul acuan master yang berhasil diidentifikasi di kanvas
                  </p>
                </div>
                <div>
                  <div className="w-full bg-[#FAF7F2] border border-[#1B1B1E] rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-[#0038D1] h-2"
                      style={{ width: `${Math.min(result.concept_recognition_score, 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-[#71717A] mt-1 block">Bobot Evaluasi: 20%</span>
                </div>
              </div>

              {/* Metric 2 */}
              <div className="p-5 rounded-2xl bg-white border-2 border-[#1B1B1E] shadow-[3px_3px_0px_#1B1B1E] flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <span className="text-[10.5px] font-mono font-bold uppercase text-[#71717A] block">
                    02 &bull; Akurasi Proposisi
                  </span>
                  <div className="text-3xl font-sans font-black text-[#059669] tracking-tight tabular-nums">
                    {result.relationship_accuracy_score}%
                  </div>
                  <p className="text-[11px] text-[#555]">
                    Tautan relasi &lt;Subjek, Predikat, Objek&gt; valid
                  </p>
                </div>
                <div>
                  <div className="w-full bg-[#FAF7F2] border border-[#1B1B1E] rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-[#059669] h-2"
                      style={{ width: `${Math.min(result.relationship_accuracy_score, 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-[#71717A] mt-1 block">Bobot Evaluasi: 50%</span>
                </div>
              </div>

              {/* Metric 3 */}
              <div className="p-5 rounded-2xl bg-white border-2 border-[#1B1B1E] shadow-[3px_3px_0px_#1B1B1E] flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <span className="text-[10.5px] font-mono font-bold uppercase text-[#71717A] block">
                    03 &bull; Harmoni Topologi
                  </span>
                  <div className="text-3xl font-sans font-black text-[#2F54EB] tracking-tight tabular-nums">
                    {result.structural_understanding_score}%
                  </div>
                  <p className="text-[11px] text-[#555]">
                    Skor F1-harmonik struktur graf terhadap master
                  </p>
                </div>
                <div>
                  <div className="w-full bg-[#FAF7F2] border border-[#1B1B1E] rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-[#2F54EB] h-2"
                      style={{ width: `${Math.min(result.structural_understanding_score, 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-[#71717A] mt-1 block">Bobot Evaluasi: 30%</span>
                </div>
              </div>
            </div>

            {/* NetworkX Exact Mathematical Counters */}
            <div className="p-4 rounded-2xl bg-white border-2 border-[#1B1B1E] shadow-[3px_3px_0px_#1B1B1E]">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-mono font-bold text-[#1B1B1E] flex items-center gap-1.5 uppercase">
                  <GitCompare className="w-4 h-4 text-[#0038D1]" />
                  Matriks Pencocokan Graf Eksak (NetworkX Core)
                </span>
                <span className="text-[10px] font-mono text-[#71717A]">Directed Labeled Graph</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-[#FAF7F2] border border-[#1B1B1E]">
                  <span className="text-[9.5px] font-mono font-bold text-[#71717A] block">True Positive (TP)</span>
                  <span className="font-mono font-black text-sm text-[#059669]">
                    {result.metrics?.true_positive ?? 0}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-[#FAF7F2] border border-[#1B1B1E]">
                  <span className="text-[9.5px] font-mono font-bold text-[#71717A] block">False Positive (FP)</span>
                  <span className="font-mono font-black text-sm text-[#B91C1C]">
                    {result.metrics?.false_positive ?? 0}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-[#FAF7F2] border border-[#1B1B1E]">
                  <span className="text-[9.5px] font-mono font-bold text-[#71717A] block">False Negative (FN)</span>
                  <span className="font-mono font-black text-sm text-[#D97706]">
                    {result.metrics?.false_negative ?? 0}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-[#FAF7F2] border border-[#1B1B1E]">
                  <span className="text-[9.5px] font-mono font-bold text-[#71717A] block">Precision</span>
                  <span className="font-mono font-black text-sm text-[#1B1B1E]">
                    {result.metrics?.precision ?? 0}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-[#FAF7F2] border border-[#1B1B1E]">
                  <span className="text-[9.5px] font-mono font-bold text-[#71717A] block">Recall</span>
                  <span className="font-mono font-black text-sm text-[#1B1B1E]">
                    {result.metrics?.recall ?? 0}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-[#FAF7F2] border border-[#1B1B1E]">
                  <span className="text-[9.5px] font-mono font-bold text-[#71717A] block">F1-Score</span>
                  <span className="font-mono font-black text-sm text-[#0038D1]">
                    {result.metrics?.f1_score ?? 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2.5: SIDE-BY-SIDE VISUAL GRAPH COMPARISON (Figma Frame 3 #46:872 & Frame 5 #46:2372) */}
        <div className="p-6 rounded-2xl bg-white border-2 border-[#1B1B1E] shadow-[4px_4px_0px_#1B1B1E] space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b-2 border-[#FAF7F2]">
            <div className="space-y-0.5">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#DEE1FF] border border-[#0038D1] text-[10px] font-mono font-bold text-[#001257]">
                <GitCompare className="w-3 h-3 text-[#0038D1]" />
                KOMPARASI VISUAL TOPOLOGI GRAF
              </div>
              <h3 className="text-lg font-serif font-black text-[#1B1B1E]">
                Peta Rekonstruksi Anda vs Master Kit Dosen (Gold Standard)
              </h3>
            </div>
            {/* Visual Legend */}
            <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F0FDF4] border border-[#059669] text-[#065F46]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#059669]"></span>
                Valid (TP)
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FEF2F2] border border-[#DC2626] text-[#991B1B]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626]"></span>
                Miskonsepsi (FP)
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FFFBEB] border border-[#D97706] text-[#92400E]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D97706] border border-dashed border-[#1B1B1E]"></span>
                Terlewat (FN)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Graph: Student's Reconstruction */}
            <div className="p-4 rounded-xl bg-[#FAF7F2] border-2 border-[#1B1B1E] shadow-[2px_2px_0px_#1B1B1E] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-serif font-black text-[#1B1B1E] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#0038D1]"></span>
                  Peta Rekonstruksi Mahasiswa
                </span>
                <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-[#1B1B1E] text-[#1B1B1E]">
                  Akurasi: {result.relationship_accuracy_score}%
                </span>
              </div>

              {/* Graphical Canvas Render */}
              <div className="relative w-full h-72 bg-white rounded-lg border-2 border-[#1B1B1E] overflow-hidden p-3 flex flex-col justify-between">
                {/* SVG Graph Visualization */}
                <svg className="w-full h-full" viewBox="0 0 420 230">
                  <defs>
                    <marker id="arrow-green" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 1 L 9 5 L 0 9 z" fill="#059669" />
                    </marker>
                    <marker id="arrow-red" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 1 L 9 5 L 0 9 z" fill="#DC2626" />
                    </marker>
                    <marker id="arrow-amber" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 1 L 9 5 L 0 9 z" fill="#D97706" />
                    </marker>
                  </defs>

                  {/* Edges */}
                  {/* CPU to ALU (TP) */}
                  <line x1="210" y1="40" x2="100" y2="110" stroke="#059669" strokeWidth="2.5" markerEnd="url(#arrow-green)" />
                  <rect x="125" y="65" width="55" height="15" rx="3" fill="#ECFDF5" stroke="#059669" strokeWidth="1" />
                  <text x="152" y="76" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#065F46">contains</text>

                  {/* CPU to CU (TP) */}
                  <line x1="210" y1="40" x2="320" y2="110" stroke="#059669" strokeWidth="2.5" markerEnd="url(#arrow-green)" />
                  <rect x="245" y="65" width="55" height="15" rx="3" fill="#ECFDF5" stroke="#059669" strokeWidth="1" />
                  <text x="272" y="76" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#065F46">contains</text>

                  {/* ALU to Register (TP) */}
                  <line x1="100" y1="130" x2="170" y2="190" stroke="#059669" strokeWidth="2.5" markerEnd="url(#arrow-green)" />
                  <rect x="105" y="152" width="60" height="15" rx="3" fill="#ECFDF5" stroke="#059669" strokeWidth="1" />
                  <text x="135" y="163" textAnchor="middle" fontSize="7.5" fontWeight="bold" fill="#065F46">stores result</text>

                  {/* CU to ALU (FN - Missing) */}
                  <line x1="310" y1="120" x2="120" y2="120" stroke="#D97706" strokeWidth="2" strokeDasharray="4 4" markerEnd="url(#arrow-amber)" />
                  <rect x="185" y="112" width="50" height="15" rx="3" fill="#FFFBEB" stroke="#D97706" strokeWidth="1" />
                  <text x="210" y="123" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#92400E">controls</text>

                  {/* CPU to Register (FP - Misconception) */}
                  <path d="M 230 40 Q 280 120 210 185" fill="none" stroke="#DC2626" strokeWidth="2.5" markerEnd="url(#arrow-red)" />
                  <rect x="240" y="130" width="55" height="15" rx="3" fill="#FEF2F2" stroke="#DC2626" strokeWidth="1" />
                  <text x="267" y="141" textAnchor="middle" fontSize="7.5" fontWeight="bold" fill="#991B1B">controls (FP)</text>

                  {/* Nodes */}
                  {/* CPU */}
                  <g transform="translate(160, 20)">
                    <rect width="100" height="32" rx="6" fill="#FFEAA7" stroke="#1B1B1E" strokeWidth="2" />
                    <text x="50" y="20" textAnchor="middle" fontSize="11" fontWeight="900" fill="#1B1B1E">CPU</text>
                  </g>

                  {/* ALU */}
                  <g transform="translate(50, 105)">
                    <rect width="90" height="30" rx="6" fill="#FFFFFF" stroke="#1B1B1E" strokeWidth="2" />
                    <text x="45" y="19" textAnchor="middle" fontSize="10" fontWeight="800" fill="#1B1B1E">ALU</text>
                  </g>

                  {/* CU */}
                  <g transform="translate(280, 105)">
                    <rect width="90" height="30" rx="6" fill="#FFFFFF" stroke="#1B1B1E" strokeWidth="2" />
                    <text x="45" y="19" textAnchor="middle" fontSize="10" fontWeight="800" fill="#1B1B1E">Control Unit</text>
                  </g>

                  {/* Register */}
                  <g transform="translate(150, 180)">
                    <rect width="110" height="30" rx="6" fill="#FFFFFF" stroke="#1B1B1E" strokeWidth="2" />
                    <text x="55" y="19" textAnchor="middle" fontSize="10" fontWeight="800" fill="#1B1B1E">Register Bank</text>
                  </g>
                </svg>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-[#444655]">
                <span>Status Graf: Rekonstruksi Parsial</span>
                <span className="font-bold text-[#DC2626]">1 Miskonsepsi Terdeteksi</span>
              </div>
            </div>

            {/* Right Graph: Lecturer's Master Kit (Gold Standard) */}
            <div className="p-4 rounded-xl bg-[#FAF7F2] border-2 border-[#1B1B1E] shadow-[2px_2px_0px_#1B1B1E] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-serif font-black text-[#1B1B1E] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#059669]"></span>
                  Master Kit Dosen (Gold Standard Acuan)
                </span>
                <span className="text-[10px] font-mono bg-[#ECFDF5] px-2 py-0.5 rounded border border-[#059669] text-[#065F46] font-bold">
                  Target Ideal 100%
                </span>
              </div>

              {/* Graphical Canvas Render */}
              <div className="relative w-full h-72 bg-white rounded-lg border-2 border-[#1B1B1E] overflow-hidden p-3 flex flex-col justify-between">
                <svg className="w-full h-full" viewBox="0 0 420 230">
                  <defs>
                    <marker id="arrow-blue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 1 L 9 5 L 0 9 z" fill="#0038D1" />
                    </marker>
                  </defs>

                  {/* Edges */}
                  {/* CPU to ALU */}
                  <line x1="210" y1="40" x2="100" y2="110" stroke="#0038D1" strokeWidth="2.5" markerEnd="url(#arrow-blue)" />
                  <rect x="125" y="65" width="55" height="15" rx="3" fill="#EEF2FF" stroke="#0038D1" strokeWidth="1" />
                  <text x="152" y="76" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#0038D1">contains</text>

                  {/* CPU to CU */}
                  <line x1="210" y1="40" x2="320" y2="110" stroke="#0038D1" strokeWidth="2.5" markerEnd="url(#arrow-blue)" />
                  <rect x="245" y="65" width="55" height="15" rx="3" fill="#EEF2FF" stroke="#0038D1" strokeWidth="1" />
                  <text x="272" y="76" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#0038D1">contains</text>

                  {/* ALU to Register */}
                  <line x1="100" y1="130" x2="170" y2="190" stroke="#0038D1" strokeWidth="2.5" markerEnd="url(#arrow-blue)" />
                  <rect x="105" y="152" width="60" height="15" rx="3" fill="#EEF2FF" stroke="#0038D1" strokeWidth="1" />
                  <text x="135" y="163" textAnchor="middle" fontSize="7.5" fontWeight="bold" fill="#0038D1">stores result</text>

                  {/* CU to ALU (Standard Correct Edge) */}
                  <line x1="310" y1="120" x2="120" y2="120" stroke="#0038D1" strokeWidth="2.5" markerEnd="url(#arrow-blue)" />
                  <rect x="185" y="112" width="50" height="15" rx="3" fill="#EEF2FF" stroke="#0038D1" strokeWidth="1" />
                  <text x="210" y="123" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#0038D1">controls</text>

                  {/* Nodes */}
                  <g transform="translate(160, 20)">
                    <rect width="100" height="32" rx="6" fill="#DEE1FF" stroke="#1B1B1E" strokeWidth="2" />
                    <text x="50" y="20" textAnchor="middle" fontSize="11" fontWeight="900" fill="#001257">CPU</text>
                  </g>

                  <g transform="translate(50, 105)">
                    <rect width="90" height="30" rx="6" fill="#FFFFFF" stroke="#1B1B1E" strokeWidth="2" />
                    <text x="45" y="19" textAnchor="middle" fontSize="10" fontWeight="800" fill="#1B1B1E">ALU</text>
                  </g>

                  <g transform="translate(280, 105)">
                    <rect width="90" height="30" rx="6" fill="#FFFFFF" stroke="#1B1B1E" strokeWidth="2" />
                    <text x="45" y="19" textAnchor="middle" fontSize="10" fontWeight="800" fill="#1B1B1E">Control Unit</text>
                  </g>

                  <g transform="translate(150, 180)">
                    <rect width="110" height="30" rx="6" fill="#FFFFFF" stroke="#1B1B1E" strokeWidth="2" />
                    <text x="55" y="19" textAnchor="middle" fontSize="10" fontWeight="800" fill="#1B1B1E">Register Bank</text>
                  </g>
                </svg>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-[#444655]">
                <span>Hierarki Topologis: 3 Tingkat</span>
                <span className="font-bold text-[#0038D1]">Struktur Kausalitas Baku</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: DIAGNOSA KOGNITIF UTAMA (Figma #46:1026) */}
        {result.knowledge_gaps && result.knowledge_gaps.length > 0 && (
          <div className="p-5 sm:p-6 rounded-2xl bg-[#FFDDB8] border-2 border-[#1B1B1E] shadow-[4px_4px_0px_#1B1B1E] space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#B45309] animate-pulse"></span>
              <span className="text-xs font-mono font-black uppercase tracking-wider text-[#2A1700]">
                DIAGNOSA KOGNITIF UTAMA & KNOWLEDGE GAP
              </span>
            </div>
            <div className="space-y-1.5">
              {result.knowledge_gaps.map((gap, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-white/80 border border-[#1B1B1E]/20 text-xs sm:text-sm font-serif font-bold text-[#1B1B1E] flex items-start gap-2.5 leading-relaxed"
                >
                  <AlertTriangle className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                  <span>{gap}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 4: TABEL EVALUASI RELASI PROPOSISI (Figma #46:1035 & #46:1172) */}
        <div className="p-6 rounded-2xl bg-white border-2 border-[#1B1B1E] shadow-[4px_4px_0px_#1B1B1E] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b-2 border-[#FAF7F2]">
            <div className="space-y-0.5">
              <h3 className="text-base font-serif font-black text-[#1B1B1E] flex items-center gap-2">
                <Target className="w-4 h-4 text-[#0038D1]" />
                Tabel Evaluasi Relasi Proposisi Mahasiswa vs Master Map
              </h3>
              <p className="text-xs text-[#555]">
                Daftar lengkap triple konsep &lt;Subjek, Predikat, Objek&gt; dengan catatan verifikasi eksak
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#1B1B1E] text-xs font-mono font-bold text-[#1B1B1E]">
              Total Relasi: {result.evaluated_edges?.length ?? 0}
            </span>
          </div>

          <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
            {result.evaluated_edges && result.evaluated_edges.length > 0 ? (
              result.evaluated_edges.map((edge, idx) => {
                const isCorrect = edge.status === 'correct';
                const isMissing = edge.status === 'missing';

                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border-2 border-[#1B1B1E] shadow-[2px_2px_0px_#1B1B1E] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                      isCorrect
                        ? 'bg-[#F0FDF4]'
                        : isMissing
                        ? 'bg-[#FFFBEB]'
                        : 'bg-[#FEF2F2]'
                    }`}
                  >
                    {/* Triple Proposisi */}
                    <div className="flex items-center gap-2 flex-wrap font-bold text-xs sm:text-sm">
                      <span className="px-2.5 py-1 rounded-lg bg-white border border-[#1B1B1E] text-[#1B1B1E] font-serif shadow-[1px_1px_0px_#1B1B1E]">
                        [{edge.source_label}]
                      </span>
                      <span className={`font-mono font-bold text-xs ${
                        isCorrect ? 'text-[#059669]' : isMissing ? 'text-[#D97706]' : 'text-[#DC2626]'
                      }`}>
                        ── {edge.label} ──▶
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-white border border-[#1B1B1E] text-[#1B1B1E] font-serif shadow-[1px_1px_0px_#1B1B1E]">
                        [{edge.target_label}]
                      </span>
                      {edge.note && (
                        <span className="text-xs font-normal text-[#555] sm:ml-2">
                          ({edge.note})
                        </span>
                      )}
                    </div>

                    {/* Status Badge */}
                    <div className="shrink-0">
                      {isCorrect ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#059669] text-white text-xs font-bold shadow-[1px_1px_0px_#1B1B1E]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Valid (TP)</span>
                        </span>
                      ) : isMissing ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D97706] text-white text-xs font-bold shadow-[1px_1px_0px_#1B1B1E]">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Hilang (FN)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DC2626] text-white text-xs font-bold shadow-[1px_1px_0px_#1B1B1E]">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Miskonsepsi (FP)</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-xs text-[#71717A] font-mono">
                Tidak ada data relasi yang dievaluasi.
              </div>
            )}
          </div>
        </div>

        {/* SECTION 5: ACTION & REMEDIAL RECOMMENDATIONS (Figma #46:1258) */}
        <div className="p-6 rounded-2xl bg-white border-2 border-[#1B1B1E] shadow-[4px_4px_0px_#1B1B1E] space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#0038D1]" />
            <h3 className="text-base font-serif font-black text-[#1B1B1E]">
              Rekomendasi Bahan Belajar & Penguatan Remedial
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#1B1B1E] space-y-2">
              <span className="text-[10px] font-mono font-bold text-[#0038D1] uppercase">
                Materi 01 &bull; Modul 2.3
              </span>
              <h4 className="text-sm font-bold text-[#1B1B1E]">
                Alur Data Internal CPU: Hubungan Register Bank & Bus Data
              </h4>
              <p className="text-xs text-[#555] leading-relaxed">
                Tinjau kembali siklus fetch-decode-execute untuk memahami mengapa Register menerima hasil komputasi langsung dari ALU sebelum dialirkan ke memori utama.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#1B1B1E] space-y-2">
              <span className="text-[10px] font-mono font-bold text-[#059669] uppercase">
                Materi 02 &bull; Modul 3.1
              </span>
              <h4 className="text-sm font-bold text-[#1B1B1E]">
                Hierarki Waktu Akses: SRAM Cache L1/L2 vs DRAM Fisik
              </h4>
              <p className="text-xs text-[#555] leading-relaxed">
                Pelajari perbedaan relasi pembendungan (&apos;contains&apos;) dan transfer data (&apos;transfers data to&apos;) pada struktur cache berjenjang.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
