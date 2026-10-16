'use client';

import React from 'react';
import { ArrowRight, CheckCircle2, Clock, FileText, Layers, PlayCircle } from 'lucide-react';
import { AssessmentConfig, EvaluationResult } from '../types/maply';

interface WorkspacePickerViewProps {
  assessments: AssessmentConfig[];
  submissions: EvaluationResult[];
  /** assessmentId -> epoch ms when the student opened the workspace (not yet submitted) */
  startedAt: Record<string, number>;
  onOpen: (assessmentId: string) => void;
  onViewResult: (assessmentId: string) => void;
}

const formatStarted = (ms: number) =>
  new Date(ms).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

export const WorkspacePickerView: React.FC<WorkspacePickerViewProps> = ({
  assessments,
  submissions,
  startedAt,
  onOpen,
  onViewResult
}) => {
  const submittedIds = new Set(submissions.map((s) => s.assessment_id));
  const inProgress = assessments.filter((a) => !submittedIds.has(a.id) && startedAt[a.id]);
  const available = assessments.filter((a) => !submittedIds.has(a.id) && !startedAt[a.id]);
  const done = assessments.filter((a) => submittedIds.has(a.id));

  const Card: React.FC<{ a: AssessmentConfig; variant: 'resume' | 'start' | 'done' }> = ({ a, variant }) => {
    const sub = submissions.find((s) => s.assessment_id === a.id);
    return (
      <div
        className={`p-4 rounded-2xl border-2 border-[#1B1B1E] flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          variant === 'resume'
            ? 'bg-[#FFEAA7] shadow-[4px_4px_0px_#1B1B1E]'
            : variant === 'start'
            ? 'bg-white shadow-[3px_3px_0px_#1B1B1E]'
            : 'bg-[#FAF7F2] shadow-[2px_2px_0px_#1B1B1E] opacity-90'
        }`}
      >
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono font-bold">
            <span className="px-2 py-0.5 rounded-full bg-white border border-[#1B1B1E] text-[#0038D1]">{a.id}</span>
            <span className="flex items-center gap-1 text-[#444655]">
              <Clock className="w-3 h-3" />
              {a.duration_minutes || a.time_limit_minutes || 30} menit
            </span>
            {variant === 'resume' && startedAt[a.id] && (
              <span className="text-[#B45309]">Dimulai {formatStarted(startedAt[a.id])}</span>
            )}
          </div>
          <h3 className="font-serif font-black text-base text-[#1B1B1E] truncate">{a.title}</h3>
          {a.description && <p className="text-xs text-[#444655] line-clamp-2">{a.description}</p>}
        </div>

        {variant === 'done' ? (
          <button
            type="button"
            onClick={() => onViewResult(a.id)}
            className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-[#065F46] border-2 border-[#059669] font-bold text-xs cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            Selesai{sub ? ` • ${sub.total_score}/100` : ''} — Lihat Hasil
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onOpen(a.id)}
            className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0038D1] hover:bg-[#2F54EB] text-white font-black text-xs border-2 border-[#1B1B1E] shadow-[2px_2px_0px_#1B1B1E] cursor-pointer transition-all"
          >
            {variant === 'resume' ? <PlayCircle className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            {variant === 'resume' ? 'Lanjutkan' : 'Mulai'}
          </button>
        )}
      </div>
    );
  };

  const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <section className="space-y-3">
      <h2 className="text-xs font-black uppercase tracking-wider text-[#444655]">{title}</h2>
      {children}
    </section>
  );

  return (
    <div className="bg-[#FAF7F2] text-[#1B1B1E] min-h-screen pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border-2 border-[#1B1B1E] shadow-[2px_2px_0px_#1B1B1E] text-[10px] font-extrabold uppercase tracking-widest">
            <Layers className="w-3 h-3 text-[#0038D1]" />
            Workspace
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-black tracking-tight">Pilih Asesmen yang Dikerjakan</h1>
          <p className="text-xs sm:text-sm text-[#444655]">
            Lanjutkan asesmen yang sedang berjalan atau mulai asesmen baru. Asesmen yang sudah dikumpulkan tidak bisa dikerjakan ulang.
          </p>
        </div>

        {assessments.length === 0 && (
          <div className="py-14 text-center space-y-2 bg-white rounded-2xl border-2 border-[#1B1B1E] shadow-[3px_3px_0px_#1B1B1E] p-6">
            <FileText className="w-8 h-8 text-[#71717A] mx-auto" />
            <p className="text-sm font-bold">Belum ada asesmen aktif</p>
            <p className="text-xs text-[#71717A]">Asesmen akan muncul di sini setelah dosen menerbitkannya.</p>
          </div>
        )}

        {inProgress.length > 0 && (
          <Section title="Sedang dikerjakan">
            {inProgress.map((a) => (
              <Card key={a.id} a={a} variant="resume" />
            ))}
          </Section>
        )}

        {available.length > 0 && (
          <Section title="Asesmen tersedia">
            {available.map((a) => (
              <Card key={a.id} a={a} variant="start" />
            ))}
          </Section>
        )}

        {done.length > 0 && (
          <Section title="Sudah dikumpulkan">
            {done.map((a) => (
              <Card key={a.id} a={a} variant="done" />
            ))}
          </Section>
        )}
      </div>
    </div>
  );
};

