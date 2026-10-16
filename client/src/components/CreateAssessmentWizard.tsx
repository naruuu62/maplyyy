'use client';

import React, { useState } from 'react';
import {
  Check,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Copy,
  RefreshCw,
  QrCode,
  Sparkles,
  ShieldCheck,
  Sliders,
  Calendar,
  Clock,
  FileText,
  AlertCircle,
  HelpCircle,
  Layers,
  GraduationCap,
  Network,
  Eye,
  CheckCircle2,
  X
} from 'lucide-react';
import { AssessmentConfig, MasterConceptMap } from '../types/maply';

interface CreateAssessmentWizardProps {
  masterMap: MasterConceptMap;
  onSaveAssessment: (config: AssessmentConfig) => Promise<void>;
  onClose: () => void;
  onAssessmentPublished?: (token: string, config: AssessmentConfig) => void;
}

export const CreateAssessmentWizard: React.FC<CreateAssessmentWizardProps> = ({
  masterMap,
  onSaveAssessment,
  onClose,
  onAssessmentPublished
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Target Kelas & Info
  const [selectedClass, setSelectedClass] = useState('Arsitektur & Organisasi Komputer - Kelas B (42 Mahasiswa)');
  const [moduleTitle, setModuleTitle] = useState('Asesmen Tengah Semester: Struktur CPU & Hierarki Memori');
  const [moduleTags, setModuleTags] = useState(['#Midterm-CPL3', '#Formatif', '#KitBuild-Evaluasi']);
  const [newTagInput, setNewTagInput] = useState('');
  const [examMode, setExamMode] = useState<'scheduled' | 'formative' | 'diagnostic'>('scheduled');
  const [studentInstructions, setStudentInstructions] = useState(
    'Rangkai kembali simpul konsep CPU dan hierarki memori dengan menghubungkan relasi fungsional dan aliran data yang tepat. Perhatikan arah panah untuk relasi kausalitas.'
  );

  // Step 2: Pilih Master & Kit
  const [shuffleNodes, setShuffleNodes] = useState(true);
  const [includeDistractors, setIncludeDistractors] = useState(false);
  const [distractorList, setDistractorList] = useState(['GPU Shader Core', 'Secondary Storage (HDD)']);

  // Step 3: Toleransi & Bobot
  const [allowBidirectional, setAllowBidirectional] = useState(true);
  const [weightPresence, setWeightPresence] = useState(20);
  const [weightProposition, setWeightProposition] = useState(50);
  const [weightTopology, setWeightTopology] = useState(30);
  const [passingGrade, setPassingGrade] = useState(75);

  // Step 4: Token, Jadwal, Publikasi
  const [examToken, setExamToken] = useState('KBT-9428');
  const [tokenCopied, setTokenCopied] = useState(false);
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [maxAttempts, setMaxAttempts] = useState('1');
  const [startDate, setStartDate] = useState('2026-10-16T08:00');
  const [deadlineDate, setDeadlineDate] = useState('2026-10-16T10:00');
  const [gracePeriod, setGracePeriod] = useState(true);
  const [releasePolicy, setReleasePolicy] = useState<'simultaneous' | 'instant' | 'manual'>('simultaneous');
  const [showQrModal, setShowQrModal] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  const handleGenerateToken = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let res = 'KBT-';
    for (let i = 0; i < 4; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setExamToken(res);
  };

  const handleCopyToken = () => {
    navigator.clipboard.writeText(examToken);
    setTokenCopied(true);
    setTimeout(() => setTokenCopied(false), 2000);
  };

  const handleAddTag = () => {
    if (!newTagInput.trim()) return;
    const tag = newTagInput.startsWith('#') ? newTagInput.trim() : `#${newTagInput.trim()}`;
    if (!moduleTags.includes(tag)) {
      setModuleTags([...moduleTags, tag]);
    }
    setNewTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setModuleTags(moduleTags.filter((t) => t !== tagToRemove));
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const newConfig: AssessmentConfig = {
        id: `asm-${Date.now()}`,
        master_map_id: masterMap.id,
        title: moduleTitle,
        description: selectedClass,
        exam_token: examToken,
        instructions: studentInstructions,
        duration_minutes: durationMinutes,
        time_limit_minutes: durationMinutes,
        allow_bidirectional_tolerance: allowBidirectional,
        allow_bidirectional_fallback: allowBidirectional,
        tolerated_symmetric_labels: ['interacts with', 'connected to', 'communicates via'],
        randomize_kit: shuffleNodes,
        weights: {
          concept_recognition: weightPresence / 100,
          relationship_accuracy: weightProposition / 100,
          structural_understanding: weightTopology / 100
        },
        scoring_weights: {
          concept_presence: weightPresence / 100,
          proposition_accuracy: weightProposition / 100,
          topology: weightTopology / 100
        }
      };

      await onSaveAssessment(newConfig);
      setIsPublished(true);
      if (onAssessmentPublished) {
        onAssessmentPublished(examToken, newConfig);
      }
    } catch (err) {
      console.error('Failed to publish assessment:', err);
    } finally {
      setIsPublishing(false);
    }
  };

  const stepsMeta = [
    { num: 1, title: '01. Target Kelas & Info' },
    { num: 2, title: '02. Pilih Master & Kit' },
    { num: 3, title: '03. Toleransi & Bobot' },
    { num: 4, title: '04. Jadwal & Publikasi (Token)' }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#1B1B1E]/60 backdrop-blur-sm flex flex-col justify-start">
      <div className="min-h-screen bg-[#FBF8FC] flex flex-col">
        {/* Sticky Top Header */}
        <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b-2 border-[#1B1B1E] px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-[#0038D1] border-2 border-[#1B1B1E] flex items-center justify-center text-white font-black text-sm shadow-[2px_2px_0px_#1B1B1E]">
              M
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-[#0038D1]">
                  Wizard Pembuatan Asesmen Dosen
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#FFEAA7] border border-[#1B1B1E] text-[10px] font-bold text-[#1B1B1E]">
                  OBE CPL-3
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-[#1B1B1E] truncate max-w-md">
                {moduleTitle || 'Buat Modul Asesmen Kit-Build Baru'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ECFDF5] border border-[#1B1B1E] text-[11px] font-bold text-[#065F46]">
              <span className="w-2 h-2 rounded-full bg-[#059669] animate-pulse"></span>
              Auto-save Siakad Draf Aktif
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white hover:bg-slate-100 border-2 border-[#1B1B1E] shadow-[2px_2px_0px_#1B1B1E] text-[#1B1B1E] transition-all"
              title="Tutup Wizard"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Top Progress & Stepper Deck (Figma #54:8295 & #54:8730) */}
        <div className="bg-white border-b-2 border-[#1B1B1E] px-4 sm:px-8 py-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              {stepsMeta.map((s) => {
                const isActive = currentStep === s.num;
                const isPassed = currentStep > s.num;
                return (
                  <button
                    key={s.num}
                    onClick={() => setCurrentStep(s.num as any)}
                    className={`flex items-center gap-2.5 p-2.5 sm:p-3 rounded-xl border-2 border-[#1B1B1E] text-left transition-all ${
                      isActive
                        ? 'bg-[#2F54EB] text-white shadow-[3px_3px_0px_#1B1B1E] font-black'
                        : isPassed
                        ? 'bg-[#ECFDF5] text-[#065F46] shadow-[2px_2px_0px_#1B1B1E] font-bold'
                        : 'bg-[#FAF7F2] text-[#71717A] opacity-75 hover:opacity-100'
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black border ${
                        isActive
                          ? 'bg-white text-[#2F54EB] border-white'
                          : isPassed
                          ? 'bg-[#059669] text-white border-[#065F46]'
                          : 'bg-white text-[#71717A] border-[#1B1B1E]'
                      }`}
                    >
                      {isPassed ? <Check className="w-3.5 h-3.5" /> : s.num}
                    </span>
                    <span className="text-xs truncate">{s.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Wizard Main Content Body */}
        <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-8 space-y-6">
          {/* ================= STEP 1: TARGET KELAS & INFO ================= */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-6 rounded-2xl bg-white border-2 border-[#1B1B1E] shadow-[4px_4px_0px_#1B1B1E] space-y-5">
                <div className="flex items-center justify-between pb-3 border-b-2 border-[#FAF7F2]">
                  <div>
                    <h3 className="text-xl font-black text-[#1B1B1E]">Langkah 1: Target Kelas & Info Akademik</h3>
                    <p className="text-xs sm:text-sm text-[#444655]">
                      Tentukan rombongan belajar, judul asesmen, dan petunjuk bagi mahasiswa.
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#FFEAA7] border border-[#1B1B1E] text-xs font-bold">
                    SIAKAD Sync
                  </span>
                </div>

                {/* Course & Class Selection */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black uppercase tracking-wider text-[#1B1B1E]">
                      Mata Kuliah & Rombongan Belajar
                    </label>
                    <span className="text-[10px] font-mono text-[#71717A]">
                      Bisa pilih template atau ketik nama matkul bebas
                    </span>
                  </div>
                  <input
                    type="text"
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    placeholder="Contoh: Basis Data, Rekayasa Perangkat Lunak, Jaringan Komputer, dll."
                    list="course-suggestions"
                    className="w-full p-3 rounded-xl bg-white border-2 border-[#1B1B1E] shadow-[2px_2px_0px_#1B1B1E] text-sm font-bold text-[#1B1B1E] focus:outline-none focus:ring-2 focus:ring-[#0038D1]"
                  />
                  <datalist id="course-suggestions">
                    <option value="Arsitektur & Organisasi Komputer - Kelas B" />
                    <option value="Jaringan Komputer - Kelas A" />
                    <option value="Sistem Operasi - Kelas C" />
                    <option value="Basis Data & Pemodelan Relasional - Kelas D" />
                    <option value="Algoritma & Struktur Data - Kelas E" />
                    <option value="Rekayasa Perangkat Lunak - Kelas F" />
                    <option value="Kecerdasan Buatan & Machine Learning" />
                  </datalist>
                </div>

                {/* Modul Title */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-[#1B1B1E]">
                    Judul Modul Asesmen
                  </label>
                  <input
                    type="text"
                    value={moduleTitle}
                    onChange={(e) => setModuleTitle(e.target.value)}
                    placeholder="Contoh: Asesmen Tengah Semester: Struktur CPU"
                    className="w-full p-3 rounded-xl bg-white border-2 border-[#1B1B1E] shadow-[2px_2px_0px_#1B1B1E] text-sm font-bold text-[#1B1B1E] focus:outline-none focus:ring-2 focus:ring-[#0038D1]"
                  />
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-[#1B1B1E]">
                    Tag Asesmen & CPL OBE
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    {moduleTags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EEF2FF] border border-[#1B1B1E] text-xs font-bold text-[#0038D1]"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-red-600 font-black text-xs"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={newTagInput}
                        onChange={(e) => setNewTagInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                        placeholder="+ Tambah tag"
                        className="px-2.5 py-1 text-xs rounded-full border border-dashed border-[#1B1B1E] bg-[#FAF7F2] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddTag}
                        className="px-2 py-0.5 text-xs font-bold rounded-full bg-[#1B1B1E] text-white"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                {/* Execution Mode */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-[#1B1B1E]">
                    Tipe Moda Pelaksanaan
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      {
                        id: 'scheduled',
                        title: 'Mode Ujian Terjadwal',
                        desc: 'Waktu ketat, token PIN aktif, nilai akhir masuk penilaian resmi.',
                        badge: 'Rekomendasi UTS/UAS'
                      },
                      {
                        id: 'formative',
                        title: 'Latihan Mandiri Formatif',
                        desc: 'Bebas waktu, umpan balik langsung setelah pengerjaan untuk belajar.',
                        badge: 'Self-Study'
                      },
                      {
                        id: 'diagnostic',
                        title: 'Kuis Diagnostik Kilat',
                        desc: 'Uji awal prasyarat materi (5-10 menit) sebelum perkuliahan baru.',
                        badge: 'Pre-Class'
                      }
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setExamMode(mode.id as any)}
                        className={`p-4 rounded-xl border-2 border-[#1B1B1E] text-left transition-all ${
                          examMode === mode.id
                            ? 'bg-[#FFEAA7] shadow-[3px_3px_0px_#1B1B1E] ring-2 ring-[#1B1B1E]'
                            : 'bg-[#FAF7F2] hover:bg-white shadow-[2px_2px_0px_#1B1B1E]'
                        }`}
                      >
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-white border border-[#1B1B1E]">
                          {mode.badge}
                        </span>
                        <h4 className="font-bold text-sm text-[#1B1B1E] mt-2">{mode.title}</h4>
                        <p className="text-xs text-[#444655] mt-1 leading-snug">{mode.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Student Instructions */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-[#1B1B1E]">
                    Petunjuk Perakitan Bagi Mahasiswa
                  </label>
                  <textarea
                    rows={3}
                    value={studentInstructions}
                    onChange={(e) => setStudentInstructions(e.target.value)}
                    className="w-full p-3 rounded-xl bg-[#FAF7F2] border-2 border-[#1B1B1E] shadow-[2px_2px_0px_#1B1B1E] text-xs sm:text-sm text-[#1B1B1E] focus:outline-none focus:ring-2 focus:ring-[#0038D1]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 2: PILIH MASTER & KIT ================= */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Master Map Picker */}
                <div className="lg:col-span-7 p-6 rounded-2xl bg-white border-2 border-[#1B1B1E] shadow-[4px_4px_0px_#1B1B1E] space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-black text-[#1B1B1E]">Katalog Master Ground Truth</h3>
                      <p className="text-xs text-[#444655]">Graf acuan terverifikasi yang digunakan untuk menguji mahasiswa.</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-[#ECFDF5] border border-[#1B1B1E] text-xs font-bold text-[#065F46]">
                      ✓ Terverifikasi Dosen
                    </span>
                  </div>

                  {/* Active Master Card */}
                  <div className="p-4 rounded-xl bg-[#EEF2FF] border-2 border-[#0038D1] shadow-[3px_3px_0px_#0038D1] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-[#0038D1]">{masterMap.title}</span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-white border border-[#0038D1]">
                        Aktif Terpilih
                      </span>
                    </div>
                    <p className="text-xs text-[#444655]">{masterMap.description}</p>
                    <div className="flex items-center gap-4 text-xs font-bold text-[#1B1B1E]">
                      <span>● {masterMap.nodes.length} Simpul Konsep</span>
                      <span>▲ {masterMap.edges.length} Proposisi Relasi</span>
                    </div>
                  </div>

                  {/* Concept Nodes Showcase */}
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-wider text-[#1B1B1E]">
                      Daftar Konsep Master ({masterMap.nodes.length})
                    </label>
                    <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-[#FAF7F2] border-2 border-[#1B1B1E]">
                      {masterMap.nodes.map((n) => (
                        <span
                          key={n.id}
                          className="px-2.5 py-1 rounded-lg bg-white border border-[#1B1B1E] text-xs font-bold shadow-[1px_1px_0px_#1B1B1E]"
                        >
                          [{n.label}]
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Cognitive Options */}
                  <div className="space-y-3 pt-2 border-t border-[#E5E7EB]">
                    <label className="text-xs font-black uppercase tracking-wider text-[#1B1B1E]">
                      Opsi Manipulasi Kognitif Kit
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#1B1B1E]">
                      <input
                        type="checkbox"
                        checked={shuffleNodes}
                        onChange={(e) => setShuffleNodes(e.target.checked)}
                        className="w-4 h-4 rounded border-[#1B1B1E] text-[#0038D1] focus:ring-0"
                      />
                      <span>Acak posisi kepingan di baki mahasiswa (Cegah pola hafalan spasial)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#1B1B1E]">
                      <input
                        type="checkbox"
                        checked={includeDistractors}
                        onChange={(e) => setIncludeDistractors(e.target.checked)}
                        className="w-4 h-4 rounded border-[#1B1B1E] text-[#0038D1] focus:ring-0"
                      />
                      <span>Sertakan Node Pengecoh / Distractors (Uji diskriminasi konsep mendalam)</span>
                    </label>
                  </div>
                </div>

                {/* Right: Live Kit Simulator */}
                <div className="lg:col-span-5 p-6 rounded-2xl bg-[#FAF7F2] border-2 border-[#1B1B1E] shadow-[4px_4px_0px_#1B1B1E] space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-black text-[#1B1B1E]">Live Kit Simulator</h3>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#FFEAA7] border border-[#1B1B1E]">
                      Tampilan Baki Siswa
                    </span>
                  </div>
                  <p className="text-xs text-[#444655]">
                    Simulasi kepingan terurai yang akan diterima mahasiswa di kanvas kosong mereka.
                  </p>

                  <div className="p-3.5 rounded-xl bg-white border-2 border-[#1B1B1E] shadow-[2px_2px_0px_#1B1B1E] space-y-2">
                    <span className="text-[11px] font-black uppercase text-[#0038D1]">
                      1. Baki Kepingan Konsep (Nodes Kit)
                    </span>
                    <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                      {masterMap.nodes.map((n) => (
                        <span
                          key={n.id}
                          className="px-2 py-0.5 rounded bg-[#FAF7F2] border border-[#1B1B1E] text-[11px] font-bold"
                        >
                          {n.label}
                        </span>
                      ))}
                      {includeDistractors &&
                        distractorList.map((d) => (
                          <span
                            key={d}
                            className="px-2 py-0.5 rounded bg-[#FFE4E6] border border-[#E11D48] text-[11px] font-bold text-[#E11D48]"
                          >
                            {d} (Pengecoh)
                          </span>
                        ))}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border-2 border-[#1B1B1E] shadow-[2px_2px_0px_#1B1B1E] space-y-2">
                    <span className="text-[11px] font-black uppercase text-[#059669]">
                      2. Baki Label Relasi (Predicates Kit)
                    </span>
                    <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                      {Array.from(new Set(masterMap.edges.map((e) => e.label))).map((lbl) => (
                        <span
                          key={lbl}
                          className="px-2 py-0.5 rounded bg-[#ECFDF5] border border-[#059669] text-[11px] font-bold text-[#065F46]"
                        >
                          ── {lbl} ──▶
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 3: TOLERANSI & BOBOT ================= */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-6 rounded-2xl bg-white border-2 border-[#1B1B1E] shadow-[4px_4px_0px_#1B1B1E] space-y-6">
                <div>
                  <h3 className="text-xl font-black text-[#1B1B1E]">Langkah 3: Aturan Toleransi Arah & Distribusi Bobot OBE</h3>
                  <p className="text-xs sm:text-sm text-[#444655]">
                    Sesuaikan fleksibilitas matematika evaluasi graf deterministik NetworkX.
                  </p>
                </div>

                {/* Toleransi Arah Simetris */}
                <div className="p-4 rounded-xl bg-[#FAF7F2] border-2 border-[#1B1B1E] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-sm text-[#1B1B1E]">
                        Toleransi Arah Relasi Simetris (Directional Tolerance)
                      </h4>
                      <p className="text-xs text-[#444655] max-w-xl">
                        Mengizinkan relasi dwiarah/komutatif (seperti <code className="bg-white px-1">interacts with</code> atau{' '}
                        <code className="bg-white px-1">connected to</code>) dibalik arahnya oleh mahasiswa tanpa terkena penalti ganda.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAllowBidirectional(!allowBidirectional)}
                      className={`relative inline-flex h-6 w-12 items-center rounded-full border-2 border-[#1B1B1E] transition-colors ${
                        allowBidirectional ? 'bg-[#059669]' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white border border-[#1B1B1E] transition-transform ${
                          allowBidirectional ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Sliders for Scoring Weights */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black uppercase tracking-wider text-[#1B1B1E]">
                      Distribusi Bobot Penilaian Kognitif (Total 100%)
                    </label>
                    <span className="text-xs font-extrabold px-2.5 py-1 rounded bg-[#EEF2FF] border border-[#1B1B1E] text-[#0038D1]">
                      Total: {weightPresence + weightProposition + weightTopology}%
                    </span>
                  </div>

                  {/* Weight 1 */}
                  <div className="p-4 rounded-xl bg-[#FAF7F2] border-2 border-[#1B1B1E] space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span>1. Presensi Konsep (Kelengkapan Kepingan di Kanvas)</span>
                      <span className="text-[#0038D1] font-black">{weightPresence}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={weightPresence}
                      onChange={(e) => setWeightPresence(Number(e.target.value))}
                      className="w-full accent-[#0038D1]"
                    />
                    <p className="text-[11px] text-[#71717A]">
                      Proporsi simpul konsep master yang berhasil diposisikan mahasiswa pada lembar kerja.
                    </p>
                  </div>

                  {/* Weight 2 */}
                  <div className="p-4 rounded-xl bg-[#FAF7F2] border-2 border-[#1B1B1E] space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span>2. Akurasi Proposisi Triples &lt;Asal, Relasi, Tujuan&gt;</span>
                      <span className="text-[#0038D1] font-black">{weightProposition}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={weightProposition}
                      onChange={(e) => setWeightProposition(Number(e.target.value))}
                      className="w-full accent-[#0038D1]"
                    />
                    <p className="text-[11px] text-[#71717A]">
                      Ketepatan hubungan proposisional berarah antar simpul (Komponen pedagogis paling krusial).
                    </p>
                  </div>

                  {/* Weight 3 */}
                  <div className="p-4 rounded-xl bg-[#FAF7F2] border-2 border-[#1B1B1E] space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span>3. Topologi & Sentralitas Graf (Hierarchy & Centrality)</span>
                      <span className="text-[#0038D1] font-black">{weightTopology}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={weightTopology}
                      onChange={(e) => setWeightTopology(Number(e.target.value))}
                      className="w-full accent-[#0038D1]"
                    />
                    <p className="text-[11px] text-[#71717A]">
                      Kedalaman hierarki percabangan dan degree centrality konsep kunci.
                    </p>
                  </div>
                </div>

                {/* Passing Grade */}
                <div className="p-4 rounded-xl bg-[#FFEAA7] border-2 border-[#1B1B1E] flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-sm text-[#1B1B1E]">
                      Ambang Kelulusan Kognitif (Passing Grade OBE)
                    </h4>
                    <p className="text-xs text-[#444655]">
                      Skor minimal bagi mahasiswa agar tidak ditandai butuh intervensi remedial.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={50}
                      max={100}
                      value={passingGrade}
                      onChange={(e) => setPassingGrade(Number(e.target.value))}
                      className="w-16 p-2 rounded-lg bg-white border-2 border-[#1B1B1E] text-center font-black text-sm"
                    />
                    <span className="font-bold text-sm">/ 100</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 4: JADWAL & PUBLIKASI (TOKEN) ================= */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Token + Schedule */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Token Box (Figma #55:11541) */}
                  <div className="p-6 rounded-2xl bg-white border-2 border-[#1B1B1E] shadow-[4px_4px_0px_#1B1B1E] space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#059669] animate-ping"></span>
                        <h3 className="text-lg font-black text-[#1B1B1E]">
                          Token Masuk Mahasiswa & Mode Akses Cepat
                        </h3>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#065F46] text-xs font-bold border border-[#1B1B1E]">
                        Sesi Siap Rilis
                      </span>
                    </div>

                    <p className="text-xs text-[#444655]">
                      Bagikan PIN alfanumerik ini kepada mahasiswa di kelas atau laboratorium untuk akses langsung tanpa login SSO yang lama.
                    </p>

                    {/* Big Token Display */}
                    <div className="p-4 rounded-xl bg-[#FAF7F2] border-2 border-[#1B1B1E] shadow-[3px_3px_0px_#1B1B1E] flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#71717A]">
                          TOKEN PIN UJIAN (6-KARAKTER)
                        </span>
                        <div className="text-3xl font-mono font-black tracking-widest text-[#0038D1] mt-0.5">
                          {examToken}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleCopyToken}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border-2 border-[#1B1B1E] shadow-[2px_2px_0px_#1B1B1E] text-xs font-bold transition-all"
                        >
                          <Copy className="w-4 h-4 text-[#0038D1]" />
                          <span>{tokenCopied ? 'Tersalin!' : 'Salin Token'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleGenerateToken}
                          className="p-2 rounded-xl bg-white hover:bg-slate-50 border-2 border-[#1B1B1E] shadow-[2px_2px_0px_#1B1B1E] text-xs transition-all"
                          title="Acak Ulang Token"
                        >
                          <RefreshCw className="w-4 h-4 text-[#1B1B1E]" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setShowQrModal(true)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FFEAA7] hover:bg-[#FFDDB8] border-2 border-[#1B1B1E] shadow-[2px_2px_0px_#1B1B1E] text-xs font-bold transition-all"
                        >
                          <QrCode className="w-4 h-4" />
                          <span>QR Code</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Duration & Window (Figma #55:11637) */}
                  <div className="p-6 rounded-2xl bg-white border-2 border-[#1B1B1E] shadow-[4px_4px_0px_#1B1B1E] space-y-4">
                    <h3 className="text-base font-black text-[#1B1B1E]">Durasi & Jendela Pengerjaan</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#1B1B1E] flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> Durasi Timer (Menit)
                        </label>
                        <input
                          type="number"
                          value={durationMinutes}
                          onChange={(e) => setDurationMinutes(Number(e.target.value))}
                          className="w-full p-2.5 rounded-lg bg-[#FAF7F2] border-2 border-[#1B1B1E] font-bold text-sm"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#1B1B1E] flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5" /> Batas Percobaan
                        </label>
                        <select
                          value={maxAttempts}
                          onChange={(e) => setMaxAttempts(e.target.value)}
                          className="w-full p-2.5 rounded-lg bg-[#FAF7F2] border-2 border-[#1B1B1E] font-bold text-sm"
                        >
                          <option value="1">1x Sesi Resmi</option>
                          <option value="2">1x Sesi Resmi + 1x Remedial</option>
                          <option value="unlimited">Tidak Terbatas (Latihan Bebas)</option>
                        </select>
                      </div>
                    </div>

                    {/* Release Policy */}
                    <div className="space-y-2 pt-2 border-t border-[#E5E7EB]">
                      <label className="text-xs font-black uppercase tracking-wider text-[#1B1B1E]">
                        Kebijakan Rilis Hasil Kognitif
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {[
                          { id: 'simultaneous', title: 'Serentak Pasca-Tenggat', desc: 'Cegah kebocoran kunci' },
                          { id: 'instant', title: 'Instan Setelah Kirim', desc: 'Formatif mandiri' },
                          { id: 'manual', title: 'Manual Oleh Dosen', desc: 'Tinjau analisis dahulu' }
                        ].map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setReleasePolicy(p.id as any)}
                            className={`p-3 rounded-lg border-2 border-[#1B1B1E] text-left text-xs ${
                              releasePolicy === p.id
                                ? 'bg-[#2F54EB] text-white shadow-[2px_2px_0px_#1B1B1E] font-bold'
                                : 'bg-[#FAF7F2] text-[#1B1B1E]'
                            }`}
                          >
                            <div className="font-extrabold">{p.title}</div>
                            <div className={`text-[10px] mt-0.5 ${releasePolicy === p.id ? 'text-white/80' : 'text-[#71717A]'}`}>
                              {p.desc}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Pre-publish Summary Receipt (Figma #55:11812) */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="p-6 rounded-2xl bg-[#FAF7F2] border-2 border-[#1B1B1E] shadow-[4px_4px_0px_#1B1B1E] space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b-2 border-[#1B1B1E]">
                      <h3 className="text-base font-black text-[#1B1B1E]">Audit Pra-Publikasi</h3>
                      <span className="px-2 py-0.5 rounded bg-[#ECFDF5] border border-[#059669] text-[10px] font-black text-[#065F46]">
                        PASS NETWORKX
                      </span>
                    </div>

                    <div className="space-y-2.5 text-xs text-[#1B1B1E]">
                      <div className="flex justify-between py-1 border-b border-[#E5E7EB]">
                        <span className="text-[#71717A]">Target Kelas:</span>
                        <span className="font-bold max-w-[200px] truncate">{selectedClass}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-[#E5E7EB]">
                        <span className="text-[#71717A]">Master Map Acuan:</span>
                        <span className="font-bold">{masterMap.title}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-[#E5E7EB]">
                        <span className="text-[#71717A]">Kepingan Konsep:</span>
                        <span className="font-bold">{masterMap.nodes.length} Simpul Terurai</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-[#E5E7EB]">
                        <span className="text-[#71717A]">Toleransi Arah:</span>
                        <span className="font-bold">{allowBidirectional ? 'Aktif (Dwiarah Aman)' : 'Ketat'}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-[#E5E7EB]">
                        <span className="text-[#71717A]">Bobot Evaluasi:</span>
                        <span className="font-bold">{weightPresence}% / {weightProposition}% / {weightTopology}%</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-[#71717A]">Batas Waktu:</span>
                        <span className="font-bold">{durationMinutes} Menit</span>
                      </div>
                    </div>

                    {/* Student Entry Preview Simulator */}
                    <div className="p-4 rounded-xl bg-white border-2 border-[#1B1B1E] shadow-[2px_2px_0px_#1B1B1E] space-y-2">
                      <span className="text-[10px] font-black uppercase text-[#0038D1]">
                        Pratinjau Layar Siswa via PIN
                      </span>
                      <div className="p-3 rounded-lg bg-[#FAF7F2] border border-[#1B1B1E] text-center space-y-1">
                        <p className="text-[11px] font-bold text-[#1B1B1E]">Masuk Ujian Tanpa Login SSO:</p>
                        <div className="font-mono text-sm font-black text-[#0038D1] bg-white py-1 px-3 rounded border border-[#1B1B1E] inline-block">
                          {examToken}
                        </div>
                        <p className="text-[10px] text-[#71717A]">Langsung membuka Student Concept Workspace</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Sticky Tactile Bottom Wizard Bar (Figma #54:8625 & #55:11964) */}
        <footer className="sticky bottom-0 z-40 bg-white/95 backdrop-blur-md border-t-2 border-[#1B1B1E] px-4 sm:px-8 py-3.5 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
            <div>
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => (prev - 1) as any)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FAF7F2] hover:bg-slate-100 border-2 border-[#1B1B1E] shadow-[2px_2px_0px_#1B1B1E] text-xs font-bold text-[#1B1B1E] transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Kembali</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border-2 border-[#1B1B1E] text-xs font-bold text-[#71717A] transition-all"
                >
                  Batal
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => (prev + 1) as any)}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#0038D1] hover:bg-[#2F54EB] text-white text-xs sm:text-sm font-extrabold border-2 border-[#1B1B1E] shadow-[3px_3px_0px_#1B1B1E] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
                >
                  <span>Lanjut ke Langkah {currentStep + 1}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isPublishing}
                  onClick={handlePublish}
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#059669] hover:bg-[#047857] text-white text-xs sm:text-sm font-black border-2 border-[#1B1B1E] shadow-[4px_4px_0px_#1B1B1E] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isPublishing ? 'Menerbitkan...' : 'Publikasikan Asesmen & Terbitkan Token 🚀'}</span>
                </button>
              )}
            </div>
          </div>
        </footer>
      </div>

      {/* QR Code Modal Simulation */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-sm rounded-2xl bg-white border-2 border-[#1B1B1E] shadow-[6px_6px_0px_#1B1B1E] p-6 text-center space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black uppercase text-[#0038D1]">QR Code Akses Lab/Kelas</span>
              <button onClick={() => setShowQrModal(false)} className="text-[#1B1B1E] font-bold">
                ✕
              </button>
            </div>
            <div className="p-6 bg-[#FAF7F2] rounded-xl border-2 border-[#1B1B1E] flex flex-col items-center justify-center space-y-3">
              <QrCode className="w-32 h-32 text-[#1B1B1E]" />
              <div className="font-mono text-xl font-black text-[#0038D1] tracking-widest">{examToken}</div>
            </div>
            <p className="text-xs text-[#71717A]">
              Tampilkan di proyektor kelas agar mahasiswa memindai langsung ke halaman ujian.
            </p>
            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#0038D1] text-white font-bold text-xs border-2 border-[#1B1B1E] shadow-[2px_2px_0px_#1B1B1E]"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Published Success Dialog */}
      {isPublished && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="w-full max-w-md rounded-2xl bg-white border-2 border-[#1B1B1E] shadow-[8px_8px_0px_#1B1B1E] p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#ECFDF5] border-2 border-[#1B1B1E] mx-auto flex items-center justify-center text-[#059669] shadow-[3px_3px_0px_#1B1B1E]">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <h3 className="text-xl font-black text-[#1B1B1E]">Asesmen Berhasil Diterbitkan!</h3>
            <p className="text-xs sm:text-sm text-[#444655]">
              Asesmen telah live. Mahasiswa dapat langsung masuk melalui portal atau menggunakan PIN kilat berikut:
            </p>
            <div className="p-4 rounded-xl bg-[#FAF7F2] border-2 border-[#1B1B1E] shadow-[3px_3px_0px_#1B1B1E]">
              <span className="text-[10px] font-black uppercase text-[#71717A]">TOKEN RESMI</span>
              <div className="font-mono text-3xl font-black text-[#0038D1] tracking-widest mt-1">{examToken}</div>
            </div>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-full bg-[#0038D1] text-white font-black text-sm border-2 border-[#1B1B1E] shadow-[4px_4px_0px_#1B1B1E] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
            >
              Kembali ke Dashboard Dosen
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
