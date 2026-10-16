'use client';

import React from 'react';
import { EvaluationResult } from '../types/maply';
import { CheckCircle2, AlertTriangle, XCircle, Award, Target, GitCompare, X } from 'lucide-react';

interface EvaluationModalProps {
  result: EvaluationResult | null;
  onClose: () => void;
}

export const EvaluationModal: React.FC<EvaluationModalProps> = ({ result, onClose }) => {
  if (!result) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FAF7F2] rounded-2xl border-2 border-[#1B1B1E] shadow-[8px_8px_0px_#1B1B1E] max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-[#FAF7F2] px-6 py-4 border-b-2 border-[#1B1B1E] flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FFEAA7] border-2 border-[#1B1B1E] shadow-[1.5px_1.5px_0px_#1B1B1E] flex items-center justify-center text-[#1B1B1E]">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-black text-[#1B1B1E]">
                Hasil Evaluasi Pemahaman Konseptual
              </h2>
              <p className="text-xs text-[#444655] font-semibold">
                Rekonstruksi Graf Peserta: {result.student_name} &bull; NetworkX Evaluator
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border-2 border-[#1B1B1E] bg-white hover:bg-slate-100 text-[#1B1B1E] font-black transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Main Score Card */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#FFEAA7] border-2 border-[#1B1B1E] shadow-[4px_4px_0px_#1B1B1E] flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#1B1B1E]">
                NILAI AKHIR
              </span>
              <div className="text-4xl font-serif font-black my-1 text-[#0038D1]">
                {result.total_score}
              </div>
              <span className="text-[10px] font-bold text-[#444655]">Skala 0 - 100</span>
            </div>

            <div className="md:col-span-3 grid grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-white border-2 border-[#1B1B1E] shadow-[3px_3px_0px_#1B1B1E] flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-black text-[#444655] uppercase">Pengenalan Konsep</span>
                  <div className="text-2xl font-serif font-black text-[#1B1B1E] mt-1">
                    {result.concept_recognition_score}%
                  </div>
                </div>
                <div className="w-full bg-[#FAF7F2] border border-[#1B1B1E] rounded-full h-2 mt-2 overflow-hidden">
                  <div
                    className="bg-[#0038D1] h-2 border-r border-[#1B1B1E]"
                    style={{ width: `${result.concept_recognition_score}%` }}
                  ></div>
                </div>
                <span className="text-[9px] font-bold text-[#444655] mt-1">Bobot 20%</span>
              </div>

              <div className="p-4 rounded-xl bg-white border-2 border-[#1B1B1E] shadow-[3px_3px_0px_#1B1B1E] flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-black text-[#444655] uppercase">Akurasi Relasi</span>
                  <div className="text-2xl font-serif font-black text-[#059669] mt-1">
                    {result.relationship_accuracy_score}%
                  </div>
                </div>
                <div className="w-full bg-[#FAF7F2] border border-[#1B1B1E] rounded-full h-2 mt-2 overflow-hidden">
                  <div
                    className="bg-[#059669] h-2 border-r border-[#1B1B1E]"
                    style={{ width: `${result.relationship_accuracy_score}%` }}
                  ></div>
                </div>
                <span className="text-[9px] font-bold text-[#444655] mt-1">Bobot 50% (Precision)</span>
              </div>

              <div className="p-4 rounded-xl bg-white border-2 border-[#1B1B1E] shadow-[3px_3px_0px_#1B1B1E] flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-black text-[#444655] uppercase">Struktural Graf</span>
                  <div className="text-2xl font-serif font-black text-[#2F54EB] mt-1">
                    {result.structural_understanding_score}%
                  </div>
                </div>
                <div className="w-full bg-[#FAF7F2] border border-[#1B1B1E] rounded-full h-2 mt-2 overflow-hidden">
                  <div
                    className="bg-[#2F54EB] h-2 border-r border-[#1B1B1E]"
                    style={{ width: `${result.structural_understanding_score}%` }}
                  ></div>
                </div>
                <span className="text-[9px] font-bold text-[#444655] mt-1">Bobot 30% (F1)</span>
              </div>
            </div>
          </div>

          {/* Graph Comparison Metrics */}
          <div className="bg-white rounded-xl p-4 border-2 border-[#1B1B1E] shadow-[3px_3px_0px_#1B1B1E]">
            <h3 className="text-[10px] font-black text-[#1B1B1E] uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <GitCompare className="w-4 h-4 text-[#0038D1]" />
              Metrik Perbandingan Graf Deterministik (NetworkX)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs">
              <div className="bg-[#FAF7F2] p-2 rounded-lg border border-[#1B1B1E]">
                <span className="text-[#444655] block text-[9px] font-bold">True Positive</span>
                <span className="font-serif font-black text-[#059669] text-sm">
                  {result.metrics.true_positive}
                </span>
              </div>
              <div className="bg-[#FAF7F2] p-2 rounded-lg border border-[#1B1B1E]">
                <span className="text-[#444655] block text-[9px] font-bold">False Positive</span>
                <span className="font-serif font-black text-[#DA3437] text-sm">
                  {result.metrics.false_positive}
                </span>
              </div>
              <div className="bg-[#FAF7F2] p-2 rounded-lg border border-[#1B1B1E]">
                <span className="text-[#444655] block text-[9px] font-bold">False Negative</span>
                <span className="font-serif font-black text-[#FFB95F] text-sm">
                  {result.metrics.false_negative}
                </span>
              </div>
              <div className="bg-[#FAF7F2] p-2 rounded-lg border border-[#1B1B1E]">
                <span className="text-[#444655] block text-[9px] font-bold">Precision</span>
                <span className="font-serif font-black text-[#1B1B1E] text-sm">
                  {result.metrics.precision}
                </span>
              </div>
              <div className="bg-[#FAF7F2] p-2 rounded-lg border border-[#1B1B1E]">
                <span className="text-[#444655] block text-[9px] font-bold">Recall</span>
                <span className="font-serif font-black text-[#1B1B1E] text-sm">
                  {result.metrics.recall}
                </span>
              </div>
              <div className="bg-[#FAF7F2] p-2 rounded-lg border border-[#1B1B1E]">
                <span className="text-[#444655] block text-[9px] font-bold">F1-Score</span>
                <span className="font-serif font-black text-[#0038D1] text-sm">
                  {result.metrics.f1_score}
                </span>
              </div>
            </div>
          </div>

          {/* Diagnostic Knowledge Gap Feedback */}
          {result.knowledge_gaps && result.knowledge_gaps.length > 0 && (
            <div className="p-4 rounded-xl bg-[#FFF1F2] border-2 border-[#1B1B1E] shadow-[3px_3px_0px_#1B1B1E]">
              <div className="flex items-center gap-2 mb-2 text-[#DA3437] font-serif font-black text-xs">
                <AlertTriangle className="w-4 h-4 text-[#DA3437]" />
                <span>Knowledge Gap & Miskonsepsi Utama yang Perlu Diperbaiki:</span>
              </div>
              <ul className="space-y-1 text-xs text-[#1B1B1E] font-medium list-disc list-inside">
                {result.knowledge_gaps.map((gap, i) => (
                  <li key={i}>{gap}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Relationship Breakdown List */}
          <div>
            <h3 className="text-[10px] font-black text-[#1B1B1E] uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-[#0038D1]" />
              Detail Status Relasi Konsep
            </h3>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {result.evaluated_edges.map((edge, idx) => {
                let badge = null;
                let bgClass = '';
                if (edge.status === 'correct') {
                  badge = (
                    <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E6F4EA] border border-[#1B1B1E] text-[#059669] text-[10px] font-black">
                      <CheckCircle2 className="w-3 h-3" /> Benar (TP)
                    </span>
                  );
                  bgClass = 'bg-[#FAF7F2] border-2 border-[#1B1B1E]';
                } else if (edge.status === 'missing') {
                  badge = (
                    <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FFFBEB] border border-[#1B1B1E] text-[#B45309] text-[10px] font-black">
                      <AlertTriangle className="w-3 h-3" /> Hilang (FN)
                    </span>
                  );
                  bgClass = 'bg-[#FFFBEB]/40 border-2 border-[#1B1B1E]';
                } else {
                  badge = (
                    <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FFE4E6] border border-[#1B1B1E] text-[#DA3437] text-[10px] font-black">
                      <XCircle className="w-3 h-3" /> Tidak Sesuai (FP)
                    </span>
                  );
                  bgClass = 'bg-[#FFE4E6]/40 border-2 border-[#1B1B1E]';
                }

                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl flex items-center justify-between text-xs transition-colors shadow-[2px_2px_0px_#1B1B1E] ${bgClass}`}
                  >
                    <div className="flex items-center gap-2 flex-wrap font-bold">
                      <span className="px-2 py-0.5 rounded-md bg-white border border-[#1B1B1E] text-[#1B1B1E]">
                        [{edge.source_label}]
                      </span>
                      <span className="text-[#0038D1] font-mono font-bold text-[11px]">
                        ── {edge.label} ──▶
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-white border border-[#1B1B1E] text-[#1B1B1E]">
                        [{edge.target_label}]
                      </span>
                      {edge.note && (
                        <span className="text-[#444655] font-normal text-[11px] ml-2">
                          ({edge.note})
                        </span>
                      )}
                    </div>
                    <div>{badge}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-[#FAF7F2] border-t-2 border-[#1B1B1E] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-[#0038D1] hover:bg-[#2F54EB] text-white font-black text-xs border-2 border-[#1B1B1E] shadow-[3px_3px_0px_#1B1B1E] transition-all"
          >
            Selesai Meninjau
          </button>
        </div>
      </div>
    </div>
  );
};
