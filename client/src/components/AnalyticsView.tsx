'use client';

import React from 'react';
import { ClassKnowledgeGapSummary, User } from '../types/maply';
import { Users, TrendingUp, AlertOctagon, CheckCircle2, Lightbulb, BarChart3 } from 'lucide-react';
import { InstructorNavbar, InstructorNavItem } from './InstructorNavbar';

interface AnalyticsViewProps {
  analytics: ClassKnowledgeGapSummary;
  currentUser?: User | null;
  onNavigate: (item: InstructorNavItem) => void;
  onLogout: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ analytics, currentUser, onNavigate, onLogout }) => {
  const dist = analytics.score_distribution;
  const maxDist = Math.max(...Object.values(dist), 1);

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <InstructorNavbar activeItem="Analytics" currentUser={currentUser} onNavigate={onNavigate} onLogout={onLogout} />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Ribbon Matching Figma #7:1718 */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-[#1B1B1E] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-[#E6F4EA] border border-[#1B1B1E] text-[10px] font-extrabold text-[#059669]">
              ● AGGREGATE CLASS REPORT
            </span>
            <span className="text-xs font-bold text-[#444655]">FILKOM UNIVERSITAS BRAWIJAYA</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-[#1B1B1E] mt-1">
            Analisis Pemahaman Konseptual Tingkat Kelas (Knowledge Gaps)
          </h1>
          <p className="text-xs text-[#444655] mt-0.5">
            Evaluasi perbandingan struktur graf terhadap Master Map menggunakan NetworkX.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-full bg-white border-2 border-[#1B1B1E] shadow-[2px_2px_0px_#1B1B1E] text-xs font-black text-[#0038D1]">
            {analytics.total_students > 0 ? `${analytics.average_score}% Akurasi Konseptual` : 'Menunggu Pengumpulan'}
          </span>
        </div>
      </div>

      {/* Overview Stat Cards in Neo-Brutalist Theme */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-white border-2 border-[#1B1B1E] shadow-[4px_4px_0px_#1B1B1E] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-[#444655] uppercase tracking-wider">
              TOTAL PARTISIPAN
            </span>
            <div className="text-3xl font-serif font-black text-[#1B1B1E] mt-1">
              {analytics.total_students}
            </div>
            <span className="text-[11px] text-[#059669] font-bold mt-1 inline-block">
              Mahasiswa Mengerjakan
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#D1E9FF] border-2 border-[#1B1B1E] shadow-[2px_2px_0px_#1B1B1E] flex items-center justify-center text-[#0038D1]">
            <Users className="w-6 h-6 stroke-[2.5]" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border-2 border-[#1B1B1E] shadow-[4px_4px_0px_#1B1B1E] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-[#444655] uppercase tracking-wider">
              RATA-RATA KELAS
            </span>
            <div className="text-3xl font-serif font-black text-[#0038D1] mt-1">
              {analytics.average_score}%
            </div>
            <span className="text-[11px] text-[#444655] font-bold mt-1 inline-block">
              Conceptual Score
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#FFEAA7] border-2 border-[#1B1B1E] shadow-[2px_2px_0px_#1B1B1E] flex items-center justify-center text-[#1B1B1E]">
            <TrendingUp className="w-6 h-6 stroke-[2.5]" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border-2 border-[#1B1B1E] shadow-[4px_4px_0px_#1B1B1E] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-[#444655] uppercase tracking-wider">
              TOP KNOWLEDGE GAPS
            </span>
            <div className="text-3xl font-serif font-black text-[#DA3437] mt-1">
              {analytics.problematic_relationships.length} Relasi
            </div>
            <span className="text-[11px] text-[#444655] font-bold mt-1 inline-block">
              Tingkat Miskonsepsi &gt; 35%
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#FFE4E6] border-2 border-[#1B1B1E] shadow-[2px_2px_0px_#1B1B1E] flex items-center justify-center text-[#DA3437]">
            <AlertOctagon className="w-6 h-6 stroke-[2.5]" />
          </div>
        </div>
      </div>

      {/* Main Grid: Distribution & Pedagogical Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Distribution Chart */}
        <div className="p-6 rounded-2xl bg-white border-2 border-[#1B1B1E] shadow-[5px_5px_0px_#1B1B1E] space-y-4">
          <div className="flex items-center justify-between border-b-2 border-[#1B1B1E] pb-3">
            <h2 className="text-sm font-black text-[#1B1B1E] uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#0038D1]" />
              Distribusi Pemahaman Konseptual Kelas
            </h2>
            <span className="text-xs font-bold text-[#444655]">Jumlah Mhs</span>
          </div>

          <div className="space-y-3 pt-2">
            {[
              { label: '90 - 100 (Sangat Paham)', val: dist['90-100'], color: 'bg-[#059669]' },
              { label: '80 - 89 (Paham Baik)', val: dist['80-89'], color: 'bg-[#0038D1]' },
              { label: '70 - 79 (Cukup Paham)', val: dist['70-79'], color: 'bg-[#FFEAA7]' },
              { label: '60 - 69 (Kurang Relasi)', val: dist['60-69'], color: 'bg-[#FFB95F]' },
              { label: '< 60 (Perlu Remediasi)', val: dist['<60'], color: 'bg-[#DA3437]' }
            ].map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-[#1B1B1E]">{item.label}</span>
                  <span className="text-[#1B1B1E]">{item.val} Mahasiswa</span>
                </div>
                <div className="w-full bg-[#FAF7F2] border border-[#1B1B1E] rounded-full h-3.5 overflow-hidden">
                  <div
                    className={`${item.color} h-3.5 border-r border-[#1B1B1E] transition-all duration-500`}
                    style={{ width: `${(item.val / maxDist) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pedagogical Action Plan */}
        <div className="p-6 rounded-2xl bg-white border-2 border-[#1B1B1E] shadow-[5px_5px_0px_#1B1B1E] flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[#0038D1] font-serif font-black text-base border-b-2 border-[#1B1B1E] pb-3">
              <Lightbulb className="w-5 h-5 text-[#0038D1]" />
              <span>Rekomendasi Tindak Lanjut Dosen (Actionable Insights)</span>
            </div>
            {analytics.total_students === 0 ? (
              <p className="text-xs text-[#71717A] leading-relaxed py-4 text-center">
                Belum ada data pengerjaan dari mahasiswa untuk modul ini. Analisis proposisi dan langkah remediasi otomatis dibuat begitu mahasiswa mengumpulkan tugas di kanvas.
              </p>
            ) : (
              <>
                <p className="text-xs text-[#444655] leading-relaxed">
                  Berdasarkan perbandingan graf hasil rekonstruksi mahasiswa, rata-rata skor konseptual kelas mencapai{' '}
                  <strong>{analytics.average_score}%</strong>. Ditemukan{' '}
                  <strong>{analytics.problematic_relationships.length} titik relasi kunci</strong> yang mengalami miskonsepsi atau belum terhubung secara akurat.
                </p>
                <div className="p-3.5 rounded-xl bg-[#FAF7F2] border-2 border-[#1B1B1E] shadow-[2px_2px_0px_#1B1B1E] space-y-2 text-xs">
                  <span className="font-black text-[#1B1B1E] block">Langkah Remediasi Konsep yang Disarankan:</span>
                  <ul className="list-disc list-inside space-y-1 text-[#444655] text-[11px] font-medium">
                    {analytics.problematic_relationships.slice(0, 3).map((rel, i) => (
                      <li key={i}>
                        Koreksi pemahaman relasi antara <strong>[{rel.source}]</strong> dan <strong>[{rel.target}]</strong> ({rel.error_percentage}% kelas mengalami miskonsepsi).
                      </li>
                    ))}
                    {analytics.problematic_relationships.length === 0 && (
                      <li>Seluruh proposisi acuan dipahami dengan sangat baik oleh kelas.</li>
                    )}
                    <li>Gunakan visualisasi evaluasi graf komparatif sebagai bahan review perkuliahan.</li>
                  </ul>
                </div>
              </>
            )}
          </div>

          <div className="pt-3 border-t-2 border-[#1B1B1E] flex items-center justify-between text-xs font-bold text-[#444655]">
            <span>Metodologi: Kit-Build Concept Mapping</span>
            <span className="text-[#0038D1]">100% Deterministik Graf</span>
          </div>
        </div>
      </div>

      {/* Relational Breakdown Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Knowledge Gaps */}
        <div className="p-6 rounded-2xl bg-white border-2 border-[#1B1B1E] shadow-[5px_5px_0px_#1B1B1E] space-y-4">
          <div className="flex items-center gap-2 text-[#DA3437] font-serif font-black text-sm border-b-2 border-[#1B1B1E] pb-3">
            <AlertOctagon className="w-4 h-4 text-[#DA3437]" />
            <span>Top Knowledge Gaps (Paling Banyak Miskonsepsi / Hilang)</span>
          </div>
          <div className="space-y-2.5">
            {analytics.problematic_relationships.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-[#71717A] font-bold">
                {analytics.total_students === 0
                  ? "Belum ada data pengerjaan mahasiswa."
                  : "Tidak ditemukan miskonsepsi signifikan (semua relasi dipahami dengan baik)."}
              </div>
            ) : (
              analytics.problematic_relationships.map((rel, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#FFF1F2] border-2 border-[#1B1B1E] shadow-[2px_2px_0px_#1B1B1E] flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-black text-[#1B1B1E] flex items-center gap-1.5 flex-wrap">
                      <span>[{rel.source}]</span>
                      <span className="text-[#DA3437] font-bold px-1.5 py-0.5 bg-white rounded-sm border border-[#DA3437] text-[10px]">
                        ── {rel.label} ──▶
                      </span>
                      <span>[{rel.target}]</span>
                    </div>
                    <span className="text-[11px] text-[#444655] mt-1 block font-medium">
                      {rel.correct_percentage}% Mahasiswa Tepat &bull; {rel.error_percentage}% Miskonsepsi
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-[#DA3437] px-2.5 py-1 rounded-full bg-white border-2 border-[#1B1B1E] shadow-[1.5px_1.5px_0px_#1B1B1E]">
                      {rel.error_percentage}% Gap
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Well Understood Links */}
        <div className="p-6 rounded-2xl bg-white border-2 border-[#1B1B1E] shadow-[5px_5px_0px_#1B1B1E] space-y-4">
          <div className="flex items-center gap-2 text-[#059669] font-serif font-black text-sm border-b-2 border-[#1B1B1E] pb-3">
            <CheckCircle2 className="w-4 h-4 text-[#059669]" />
            <span>Konsep yang Sangat Dipahami Kelas</span>
          </div>
          <div className="space-y-2.5">
            {analytics.well_understood_relationships.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-[#71717A] font-bold">
                {analytics.total_students === 0
                  ? "Belum ada data pengerjaan mahasiswa."
                  : "Belum ada relasi dengan tingkat pemahaman di atas 80%."}
              </div>
            ) : (
              analytics.well_understood_relationships.map((rel, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#E6F4EA] border-2 border-[#1B1B1E] shadow-[2px_2px_0px_#1B1B1E] flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-black text-[#1B1B1E] flex items-center gap-1.5 flex-wrap">
                      <span>[{rel.source}]</span>
                      <span className="text-[#059669] font-bold px-1.5 py-0.5 bg-white rounded-sm border border-[#059669] text-[10px]">
                        ── {rel.label} ──▶
                      </span>
                      <span>[{rel.target}]</span>
                    </div>
                    <span className="text-[11px] text-[#444655] mt-1 block font-medium">
                      Dipahami oleh {rel.correct_percentage}% dari total mahasiswa
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-[#059669] px-2.5 py-1 rounded-full bg-white border-2 border-[#1B1B1E] shadow-[1.5px_1.5px_0px_#1B1B1E]">
                      {rel.correct_percentage}% Tepat
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      </main>
    </div>
  );
};
