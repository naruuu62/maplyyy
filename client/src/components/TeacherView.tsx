'use client';

import React, { useState, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  MarkerType,
  Edge,
  Node
} from '@xyflow/react';
import { MasterConceptMap, AssessmentConfig, AIDraftResponse, ConceptNode, ConceptEdge, User } from '../types/maply';
import { generateAIDraft } from '../lib/api';
import {
  Sparkles,
  CheckCheck,
  BrainCircuit,
  Check,
  ThumbsUp,
  ThumbsDown,
  Edit3,
  Plus,
  AlertTriangle,
  Save,
  Sliders,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { CreateAssessmentWizard } from './CreateAssessmentWizard';
import { InstructorNavbar, InstructorNavItem } from './InstructorNavbar';

interface TeacherViewProps {
  masterMap: MasterConceptMap;
  assessmentConfig: AssessmentConfig;
  backendOnline: boolean;
  currentUser?: User | null;
  onSaveMasterMap: (newMap: MasterConceptMap) => Promise<void>;
  onSaveAssessment: (config: AssessmentConfig) => Promise<void>;
  initiallyOpenAIDraft?: boolean;
  onInitialAIDraftOpenHandled?: () => void;
  onBackToDashboard: () => void;
  onOpenCourses: () => void;
  onOpenAssessments: () => void;
  onOpenAnalytics: () => void;
  onLogout: () => void;
}

const NODE_STYLE: React.CSSProperties = {
  background: '#ffffff',
  color: '#1B1B1E',
  border: '2px solid #1B1B1E',
  borderRadius: '10px',
  padding: '12px 18px',
  fontWeight: 800,
  fontSize: '13px',
  boxShadow: '4px 4px 0px 0px #1B1B1E'
};

const decorateEdgeLabel = (label: string) => `── ${label} ──▶`;
const stripEdgeLabel = (label: string) => label.replace(/^──\s*/, '').replace(/\s*──▶$/, '').trim();
const decorateNodeLabel = (label: string) => `■ [${label}]`;
const stripNodeLabel = (label: string) => label.replace(/^■\s*\[/, '').replace(/\]$/, '').trim();

const PREMIUM_ASSETS = {
  sparkle: ['c1f5d.svg', 11.9167, 11.9167],
  principle: ['27388.svg', 13.5, 14.25],
  document: ['4dcda.svg', 21.6667, 21.6667],
  source: ['e4b2d.svg', 21.3333, 26.6667],
  refresh: ['ff443.svg', 15, 13.5],
  guidance: ['e4752.svg', 15.8431, 16.6667],
  mapMode: ['a73a0.svg', 14.6667, 10]
} as const;

function PremiumMapIcon({ name }: { name: keyof typeof PREMIUM_ASSETS }) {
  const [asset, width, height] = PREMIUM_ASSETS[name];
  return <img src={`/figma/premium-map/${asset}`} width={width} height={height} alt="" aria-hidden="true" className="shrink-0" />;
}

function toRfNode(n: ConceptNode, i: number): Node {
  return {
    id: n.id,
    type: 'default',
    data: { label: decorateNodeLabel(n.label), description: n.description },
    position: {
      x: n.x || 150 + (i % 3) * 220,
      y: n.y || 80 + Math.floor(i / 3) * 150
    },
    style: NODE_STYLE
  };
}

function toRfEdge(e: ConceptEdge): Edge {
  return {
    id: e.id,
    source: e.source,
    target: e.target,
    label: decorateEdgeLabel(e.label),
    data: { is_bidirectional: !!e.is_bidirectional },
    type: 'smoothstep',
    markerEnd: { type: MarkerType.ArrowClosed, color: '#1B1B1E' },
    style: { stroke: '#1B1B1E', strokeWidth: 2.5 },
    labelStyle: { fill: '#1B1B1E', fontWeight: 800, fontSize: 11, fontFamily: 'monospace' },
    labelBgStyle: { fill: '#E6F4EA', fillOpacity: 1, rx: 4, ry: 4, stroke: '#1B1B1E', strokeWidth: 1.5 },
    labelBgPadding: [6, 4]
  };
}

export const TeacherView: React.FC<TeacherViewProps> = ({
  masterMap,
  assessmentConfig,
  backendOnline,
  currentUser,
  onSaveMasterMap,
  onSaveAssessment,
  initiallyOpenAIDraft = false,
  onInitialAIDraftOpenHandled,
  onBackToDashboard,
  onOpenCourses,
  onOpenAssessments,
  onOpenAnalytics,
  onLogout
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(masterMap.nodes.map(toRfNode));
  const [edges, setEdges, onEdgesChange] = useEdgesState(masterMap.edges.map(toRfEdge));

  // Builder inputs
  const [newConceptLabel, setNewConceptLabel] = useState('');
  const [relationLabel, setRelationLabel] = useState('contains');
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [conceptDepth, setConceptDepth] = useState<'Dasar' | 'Menengah' | 'Lanjut'>('Menengah');
  const [targetNodeCount, setTargetNodeCount] = useState(12);
  const [isDeconstructionMode, setIsDeconstructionMode] = useState(true);
  const [isDraftSaved, setIsDraftSaved] = useState(false);

  const [showPremiumGenerator] = useState(initiallyOpenAIDraft);
  const [showAiModal, setShowAiModal] = useState(initiallyOpenAIDraft);
  const [topic, setTopic] = useState('Arsitektur Komputer — CPU');
  const [materialText, setMaterialText] = useState(
    'CPU terdiri dari Control Unit dan ALU. ALU melakukan operasi aritmatika dan logika. Register digunakan untuk menyimpan data sementara. Register bertukar data dengan Memory utama.'
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiDraft, setAiDraft] = useState<AIDraftResponse | null>(null);

  // Assessment wizard
  const [showWizard, setShowWizard] = useState(false);

  // Assessment config
  const [allowTolerance, setAllowTolerance] = useState(assessmentConfig.allow_bidirectional_tolerance);
  const [duration, setDuration] = useState(assessmentConfig.duration_minutes);

  useEffect(() => {
    if (initiallyOpenAIDraft) {
      onInitialAIDraftOpenHandled?.();
    }
  }, [initiallyOpenAIDraft, onInitialAIDraftOpenHandled]);

  // Feedback
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ kind: 'ok' | 'err'; msg: string } | null>(null);

  const showToast = (kind: 'ok' | 'err', msg: string) => {
    setToast({ kind, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const selectedEdge = edges.find((e) => e.id === selectedEdgeId) || null;
  const labelOf = (id: string) => {
    const n = nodes.find((x) => x.id === id);
    return n ? stripNodeLabel(String(n.data.label)) : id;
  };

  const onConnect = useCallback(
    (params: Connection) => {
      const label = relationLabel.trim() || 'berkaitan dengan';
      const edge = toRfEdge({
        id: `e-${Date.now()}`,
        source: params.source,
        target: params.target,
        label
      });
      setEdges((eds) => addEdge(edge, eds));
    },
    [relationLabel, setEdges]
  );

  const handleAddConcept = () => {
    const label = newConceptLabel.trim();
    if (!label) return;
    if (nodes.some((n) => stripNodeLabel(String(n.data.label)).toLowerCase() === label.toLowerCase())) {
      showToast('err', `Konsep "${label}" sudah ada.`);
      return;
    }
    const id = `n-${Date.now()}`;
    setNodes((ns) => [...ns, toRfNode({ id, label, x: 80 + Math.random() * 400, y: 80 + Math.random() * 300 }, ns.length)]);
    setNewConceptLabel('');
  };

  const handleDeleteSelectedEdge = () => {
    if (!selectedEdgeId) return;
    setEdges((eds) => eds.filter((e) => e.id !== selectedEdgeId));
    setSelectedEdgeId(null);
  };

  const handleRelabelSelectedEdge = () => {
    if (!selectedEdgeId) return;
    const label = relationLabel.trim();
    if (!label) return;
    setEdges((eds) => eds.map((e) => (e.id === selectedEdgeId ? { ...e, label: decorateEdgeLabel(label) } : e)));
  };

  const buildMapFromCanvas = (): MasterConceptMap => ({
    ...masterMap,
    status: 'approved',
    nodes: nodes.map((n) => ({
      id: n.id,
      label: stripNodeLabel(String(n.data.label)),
      description: (n.data.description as string | undefined) ?? undefined,
      x: n.position.x,
      y: n.position.y
    })),
    edges: edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: stripEdgeLabel(String(e.label ?? '')),
      is_bidirectional: !!(e.data as { is_bidirectional?: boolean } | undefined)?.is_bidirectional
    }))
  });

  const persistMap = async (map: MasterConceptMap, successMsg: string) => {
    setIsSaving(true);
    try {
      await onSaveMasterMap(map);
      showToast('ok', successMsg);
    } catch (err) {
      showToast('err', `Gagal menyimpan: ${(err as Error).message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLockMasterMap = () => {
    const map = buildMapFromCanvas();
    if (map.edges.length === 0) {
      showToast('err', 'Master Map harus memiliki minimal satu relasi.');
      return;
    }
    persistMap(
      map,
      backendOnline
        ? 'Master Map tersimpan di server. Kit mahasiswa diperbarui & hasil lama direset.'
        : 'Master Map disimpan lokal (backend offline).'
    );
  };

  const handleSaveConfig = async () => {
    try {
      await onSaveAssessment({
        ...assessmentConfig,
        duration_minutes: duration,
        allow_bidirectional_tolerance: allowTolerance
      });
      showToast('ok', 'Konfigurasi asesmen tersimpan.');
    } catch (err) {
      showToast('err', `Gagal menyimpan konfigurasi: ${(err as Error).message}`);
    }
  };

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    try {
      const draft = await generateAIDraft(
        topic,
        `${materialText}\n\nTingkat kedalaman konsep: ${conceptDepth}. Target jumlah node: ${targetNodeCount}.`
      );
      setAiDraft(draft);
      setNodes(draft.nodes.map(toRfNode));
      setEdges(draft.edges.map(toRfEdge));
      setIsDraftSaved(false);
    } catch (err) {
      showToast('err', `Ekstraksi AI gagal: ${(err as Error).message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApproveAIDraft = async () => {
    if (!aiDraft) return;
    setShowAiModal(false);
    // On success the parent remounts this view with the new map
    await persistMap(
      {
        ...masterMap,
        title: aiDraft.topic,
        nodes: aiDraft.nodes,
        edges: aiDraft.edges,
        status: 'approved'
      },
      'Draf AI disetujui & dijadikan Master Map.'
    );
  };

  const handleSaveDraft = () => {
    if (!aiDraft) return;
    try {
      localStorage.setItem('maply_ai_draft_v1', JSON.stringify(aiDraft));
      setIsDraftSaved(true);
      showToast('ok', 'Draf AI tersimpan di perangkat ini.');
    } catch (err) {
      showToast('err', `Gagal menyimpan draf: ${(err as Error).message}`);
    }
  };

  const handleNav = (item: InstructorNavItem) => {
    if (item === 'Dashboard') {
      onBackToDashboard();
    } else if (item === 'Courses') {
      onOpenCourses();
    } else if (item === 'Assessments') {
      onOpenAssessments();
    } else if (item === 'Analytics') {
      onOpenAnalytics();
    }
  };

  if (showPremiumGenerator) {
    const wordCount = materialText.trim().split(/\s+/).filter(Boolean).length;
    const handlePremiumSaveConfig = () => void handleSaveConfig();

    return (
      <div className="min-h-screen bg-[#fbf8fc] text-[#1b1b1e]">
        <InstructorNavbar activeItem="Maps" currentUser={currentUser} onNavigate={handleNav} onLogout={onLogout} />

        {toast && (
          <div
            className={`fixed right-6 top-16 z-50 flex max-w-sm items-center gap-2 rounded-xl border border-[#1b1b1e] px-4 py-2.5 text-xs font-bold shadow-[3px_3px_0_#1b1b1e] ${
              toast.kind === 'ok' ? 'bg-[#e6f4ea] text-[#059669]' : 'bg-[#ffe4e6] text-[#da3437]'
            }`}
          >
            {toast.kind === 'ok' ? <Check className="h-4 w-4 shrink-0" /> : <AlertTriangle className="h-4 w-4 shrink-0" />}
            <span>{toast.msg}</span>
          </div>
        )}

        <main className="mx-auto flex w-full max-w-[1440px] flex-col gap-5 px-4 py-5 pb-28 sm:px-6 lg:px-8">
          <section className="flex flex-col justify-between gap-5 rounded-xl bg-[#f6f2f7] p-5 shadow-[0_4px_10px_rgba(0,0,0,0.03)] sm:p-6 xl:flex-row xl:items-center">
            <div className="min-w-0 max-w-3xl">
              <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2f54eb] px-2 py-1 text-[9px] font-bold uppercase tracking-[0.35px] text-white">
                  <PremiumMapIcon name="sparkle" /> Fitur Premium Dosen • AI Authoring Assistant
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#ffddb8] px-2 py-1 text-[9px] font-bold text-[#2a1700]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#6d4400]" /> Kit-Build Validation Mode
                </span>
              </div>
              <h1 className="font-serif text-3xl font-bold leading-tight tracking-[-0.8px] sm:text-[40px]">
                AI Concept Map Generator{' '}
                <span className="text-base font-normal tracking-normal text-[#747687] sm:text-xl">
                  (Asisten Draf Bahan Ajar)
                </span>
              </h1>
              <p className="mt-2 inline-flex flex-wrap items-center gap-x-1.5 rounded-lg bg-white px-3 py-2 text-xs leading-5 shadow-sm">
                <PremiumMapIcon name="principle" />
                <strong className="text-[#0038d1]">Prinsip Maply:</strong>
                AI hanya menghasilkan draf awal dari silabus kuliah. Dosen adalah otoritas penuh penentu Master Map yang sah.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3 rounded-xl bg-[#f0edf1] p-3 sm:p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#da3437] text-white shadow-sm">
                <PremiumMapIcon name="document" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                  <span className="max-w-[260px] truncate">{masterMap.title || topic}</span>
                  <span className="rounded-full bg-[#dee1ff] px-2 py-0.5 text-[9px] uppercase text-[#0038d1]">Verified</span>
                </div>
                <div className="mt-1 text-[10px] text-[#747687]">
                  {wordCount.toLocaleString()} kata • {nodes.length} konsep • {edges.length} relasi
                </div>
                <div className="mt-1 text-[10px] text-[#6d4400]">Model: AI Cognitive Parser • Confidence Avg: {aiDraft ? `${Math.round(aiDraft.confidence_score * 100)}%` : '92%'}</div>
              </div>
            </div>
          </section>

          <div className="grid items-start gap-5 xl:grid-cols-[minmax(300px,0.88fr)_minmax(0,1.8fr)]">
            <aside className="flex min-w-0 flex-col gap-5">
              <section className="rounded-xl bg-white p-5 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)] sm:p-6">
                <div className="mb-4 flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0038d1] text-[10px] font-bold text-white">1</span>
                    <h2 className="font-serif text-lg font-bold sm:text-[21px]">Sumber Bahan Ajar</h2>
                  </div>
                  <span className="shrink-0 rounded-full bg-[#eae7eb] px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-[#444655]">
                    Siap Parsing
                  </span>
                </div>

                <div className="rounded-lg bg-[#f6f2f7] p-3">
                  <div className="mb-2 flex items-center gap-3">
                    <PremiumMapIcon name="source" />
                    <div className="min-w-0">
                      <div className="truncate text-xs font-bold">{topic || 'Materi kuliah'}</div>
                      <div className="text-[10px] text-[#747687]">Sumber teks pembelajaran aktif</div>
                    </div>
                    <PremiumMapIcon name="refresh" />
                  </div>
                  <textarea
                    aria-label="Teks bahan ajar"
                    rows={5}
                    value={materialText}
                    onChange={(event) => setMaterialText(event.target.value)}
                    className="w-full resize-y rounded-lg border border-[#eae7eb] bg-white p-3 text-xs leading-5 text-[#444655] outline-none transition focus:border-[#0038d1] focus:ring-2 focus:ring-[#0038d1]/10"
                  />
                  <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                    {[
                      ['Paragraf', String(materialText.split(/\n+/).filter((part) => part.trim()).length)],
                      ['Kandidat', `${nodes.length} Istilah`],
                      ['Status', `${wordCount.toLocaleString()} Kata`]
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-lg bg-white px-2 py-2">
                        <div className="text-[8px] font-bold uppercase tracking-wide text-[#747687]">{label}</div>
                        <div className="mt-1 truncate text-[10px] font-bold text-[#0038d1]">{value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="premium-topic" className="mb-1 block text-xs font-bold">Topik Materi</label>
                    <input
                      id="premium-topic"
                      value={topic}
                      onChange={(event) => setTopic(event.target.value)}
                      className="w-full rounded-lg border border-[#e4e1e6] bg-white px-3 py-2 text-xs font-medium outline-none focus:border-[#0038d1] focus:ring-2 focus:ring-[#0038d1]/10"
                    />
                  </div>
                  <div>
                    <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                      <label className="text-xs font-bold">Tingkat Kedalaman Konsep</label>
                      <span className="rounded bg-[#dee1ff] px-2 py-1 text-[9px] font-bold text-[#0038d1]">
                        Tingkat {conceptDepth} ({conceptDepth === 'Dasar' ? 'Beginner' : conceptDepth === 'Lanjut' ? 'Advanced' : 'Intermediate'})
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1 rounded-lg bg-[#f6f2f7] p-1">
                      {(['Dasar', 'Menengah', 'Lanjut'] as const).map((depth) => (
                        <button
                          key={depth}
                          type="button"
                          aria-pressed={conceptDepth === depth}
                          onClick={() => setConceptDepth(depth)}
                          className={`rounded-md px-2 py-2 text-[10px] font-bold transition ${
                            conceptDepth === depth ? 'bg-white text-[#0038d1] shadow-sm' : 'text-[#444655] hover:bg-white/60'
                          }`}
                        >
                          {depth}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="mb-1.5 flex items-center justify-between gap-2">
                      <label htmlFor="premium-node-count" className="text-xs font-bold">Target Jumlah Node Konsep</label>
                      <span className="text-[10px] text-[#747687]">Ideal Kit-Build</span>
                    </div>
                    <input
                      id="premium-node-count"
                      type="range"
                      min={5}
                      max={24}
                      value={targetNodeCount}
                      onChange={(event) => setTargetNodeCount(Number(event.target.value))}
                      className="h-2 w-full cursor-pointer accent-[#0038d1]"
                    />
                    <div className="flex justify-between text-[9px] text-[#747687]"><span>5</span><strong className="text-[#1b1b1e]">{targetNodeCount} node</strong><span>24</span></div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold">Model AI Cognitive Parser</label>
                    <div className="flex items-center justify-between rounded-lg border border-[#e4e1e6] bg-[#f6f2f7] px-3 py-2 text-xs font-medium">
                      <span>AI Schema (Kit-Build)</span><ChevronDown className="h-4 w-4 text-[#747687]" />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateAI}
                    disabled={isGenerating || !topic.trim() || !materialText.trim()}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0038d1] px-4 py-3 text-xs font-bold text-white shadow-[3px_3px_0_#1b1b1e] transition hover:-translate-y-px hover:bg-[#2f54eb] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Sparkles className="h-4 w-4 text-[#ffddb8]" />
                    {isGenerating ? 'AI sedang mengekstrak...' : 'Fetch & Decode'}
                  </button>
                </div>
              </section>

              <section className="rounded-xl bg-white p-5 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)] sm:p-6">
                <div className="mb-4 flex items-center justify-between gap-2">
                  <h2 className="inline-flex items-center gap-2 font-serif text-lg font-bold">
                    <PremiumMapIcon name="guidance" /> Validasi Pengajar
                  </h2>
                  <span className="rounded-full bg-[#ffddb8] px-2 py-1 text-[9px] font-bold text-[#6d4400]">
                    {masterMap.status === 'approved' ? 'Master Map Aktif' : 'Pratinjau Draf'}
                  </span>
                </div>
                <div className="space-y-3 text-[11px]">
                  <div>
                    <div className="mb-1 flex justify-between"><span>Node tervalidasi</span><strong>{nodes.length} Node</strong></div>
                    <div className="h-2 overflow-hidden rounded-full bg-[#eae7eb]"><div className="h-full w-full rounded-full bg-[#0038d1]" /></div>
                  </div>
                  <div>
                    <div className="mb-1 flex justify-between"><span>Relasi terverifikasi</span><strong>{edges.length} Relasi</strong></div>
                    <div className="h-2 overflow-hidden rounded-full bg-[#eae7eb]"><div className="h-full w-[84%] rounded-full bg-[#b61722]" /></div>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleAddConcept}
                    className="inline-flex items-center gap-1 rounded-lg bg-[#f6f2f7] px-3 py-2 text-[10px] font-bold hover:bg-[#eae7eb]"
                  >
                    <Plus className="h-3.5 w-3.5" /> Tambah Node
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteSelectedEdge}
                    disabled={!selectedEdge}
                    className="inline-flex items-center gap-1 rounded-lg bg-[#f6f2f7] px-3 py-2 text-[10px] font-bold text-[#b61722] hover:bg-[#ffe4e6] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ThumbsDown className="h-3.5 w-3.5" /> Tolak Relasi Pilihan
                  </button>
                </div>
              </section>

              <section className="rounded-xl bg-white p-5 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)] sm:p-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="font-serif text-lg font-bold">Konfigurasi Asesmen</h2>
                  <Sliders className="h-4 w-4 text-[#0038d1]" />
                </div>
                <label htmlFor="duration-input" className="mb-1 block text-xs font-bold">Durasi Asesmen (Menit)</label>
                <input
                  id="duration-input"
                  type="number"
                  min={1}
                  value={duration}
                  onChange={(event) => setDuration(Math.max(1, Number(event.target.value)))}
                  className="w-full rounded-lg border border-[#e4e1e6] bg-[#f6f2f7] px-3 py-2 text-xs font-bold outline-none focus:border-[#0038d1]"
                />
                <label className="mt-3 flex items-center justify-between gap-3 rounded-lg bg-[#ffddb8] p-3 text-xs font-bold">
                  Toleransi Arah Simetris
                  <input
                    id="tolerance-toggle"
                    type="checkbox"
                    checked={allowTolerance}
                    onChange={(event) => setAllowTolerance(event.target.checked)}
                    className="h-4 w-4 accent-[#0038d1]"
                  />
                </label>
                <p className="mt-2 text-[10px] leading-4 text-[#747687]">
                  Label yang ditoleransi: {assessmentConfig.tolerated_symmetric_labels.join(', ')}.
                </p>
                <button
                  id="save-config-btn"
                  type="button"
                  onClick={handlePremiumSaveConfig}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-[#f6f2f7] px-4 py-2.5 text-xs font-bold hover:bg-[#eae7eb]"
                >
                  <Save className="h-4 w-4" /> Simpan Konfigurasi
                </button>
              </section>
            </aside>

            <div className="flex min-w-0 flex-col gap-5">
              <section className="overflow-hidden rounded-xl bg-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)]">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eae7eb] px-4 py-4 sm:px-6">
                  <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#0038d1]" />
                    <h2 className="font-serif text-base font-bold sm:text-lg">Peta Konsep Draf AI (Kit-Build Preview)</h2>
                    <span className="rounded-full bg-[#f6f2f7] px-2 py-1 font-mono text-[9px] text-[#444655]">Zoom: 100%</span>
                  </div>
                  <button
                    type="button"
                    aria-pressed={isDeconstructionMode}
                    onClick={() => setIsDeconstructionMode((active) => !active)}
                    className={`rounded-md px-3 py-2 text-[10px] font-bold transition ${
                      isDeconstructionMode ? 'bg-[#dee1ff] text-[#0038d1]' : 'bg-[#f6f2f7] text-[#444655]'
                    }`}
                  >
                    <span className="inline-flex items-center gap-1.5"><PremiumMapIcon name="mapMode" /> {isDeconstructionMode ? 'Mode Kit Dekonstruksi' : 'Mode Map Utuh'}</span>
                  </button>
                </div>

                <div className="relative h-[440px] bg-[rgba(246,242,247,0.4)] sm:h-[520px]">
                  <div className="absolute left-4 top-4 z-10 flex flex-wrap items-center gap-2 rounded-lg bg-white/95 p-2 shadow-sm">
                    <input
                      value={newConceptLabel}
                      onChange={(event) => setNewConceptLabel(event.target.value)}
                      onKeyDown={(event) => event.key === 'Enter' && handleAddConcept()}
                      placeholder="Nama node"
                      aria-label="Nama node baru"
                      className="w-28 rounded-md border border-[#e4e1e6] px-2 py-1.5 text-[10px] outline-none focus:border-[#0038d1]"
                    />
                    <button type="button" onClick={handleAddConcept} aria-label="Tambah node" className="rounded-md bg-[#0038d1] p-1.5 text-white">
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                    <span className="hidden h-5 w-px bg-[#e4e1e6] sm:block" />
                    <input
                      value={relationLabel}
                      onChange={(event) => setRelationLabel(event.target.value)}
                      aria-label="Label relasi"
                      className="w-28 rounded-md border border-[#e4e1e6] px-2 py-1.5 text-[10px] outline-none focus:border-[#0038d1]"
                    />
                  </div>
                  <ReactFlow
                    nodes={nodes.map((node) => ({
                      ...node,
                      style: {
                        background: '#ffffff',
                        color: '#1b1b1e',
                        border: '1px solid #eae7eb',
                        borderRadius: '12px',
                        padding: '12px 16px',
                        fontWeight: 700,
                        fontSize: '13px',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)'
                      }
                    }))}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onEdgeClick={(_, edge) => setSelectedEdgeId(edge.id)}
                    onPaneClick={() => setSelectedEdgeId(null)}
                    fitView
                  >
                    <Controls />
                    <MiniMap nodeStrokeColor="#0038d1" nodeColor="#dee1ff" />
                    <Background color="#eae7eb" gap={24} size={1} />
                  </ReactFlow>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 bg-[#f0edf1] px-4 py-3 sm:px-6">
                  <div className="flex flex-wrap items-center gap-4 text-[9px] font-bold text-[#444655]">
                    <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#0038d1]" /> Node AI tervalidasi</span>
                    <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[#ffb95f]" /> Proposisi terkait</span>
                    <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[#da3437]" /> Kandidat salah</span>
                  </div>
                  <span className="text-[9px] text-[#747687]">Klik relasi untuk meninjau dan memperbarui label</span>
                </div>
              </section>

              <section className="rounded-xl bg-white p-5 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)] sm:p-6">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-serif text-lg font-bold">Daftar Proposisi &amp; Hubungan AI</h2>
                    <p className="mt-1 text-[10px] text-[#747687]">Tinjau setiap relasi sebelum menjadikannya Master Map acuan.</p>
                  </div>
                  <span className="rounded-full bg-[#f6f2f7] px-3 py-1 text-[9px] font-bold text-[#444655]">{edges.length} proposisi</span>
                </div>
                <div className="space-y-2">
                  {edges.map((edge, index) => (
                    <button
                      key={edge.id}
                      type="button"
                      onClick={() => setSelectedEdgeId(edge.id)}
                      className={`flex w-full flex-wrap items-center justify-between gap-3 rounded-lg px-3 py-3 text-left transition sm:px-4 ${
                        selectedEdgeId === edge.id ? 'bg-[#dee1ff]/70 ring-1 ring-[#0038d1]/20' : 'bg-[#f6f2f7] hover:bg-[#f0edf1]'
                      }`}
                    >
                      <span className="flex min-w-0 flex-wrap items-center gap-2 text-xs font-bold">
                        <span>{labelOf(edge.source)}</span>
                        <span className="rounded bg-[#dee1ff] px-2 py-1 text-[#0038d1]">{String(edge.label)}</span>
                        <span>{labelOf(edge.target)}</span>
                      </span>
                      <span className="flex shrink-0 items-center gap-2">
                        <span className="rounded-full bg-white px-2 py-1 text-[9px] text-[#0038d1]">Confidence {Math.max(82, 98 - index * 3)}%</span>
                        <span className={`rounded-md px-2 py-1 text-[9px] font-bold ${
                          selectedEdgeId === edge.id ? 'bg-[#ffddb8] text-[#6d4400]' : 'bg-white text-[#444655]'
                        }`}>
                          {selectedEdgeId === edge.id ? 'Ditinjau' : 'AI Draft'}
                        </span>
                      </span>
                    </button>
                  ))}
                  {edges.length === 0 && (
                    <p className="rounded-lg bg-[#f6f2f7] p-4 text-xs text-[#747687]">Belum ada relasi. Tambahkan node dan hubungkan pada kanvas, atau jalankan ekstraksi AI.</p>
                  )}
                </div>
                <div className="mt-4 rounded-lg bg-[#f6f2f7] p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="text-xs font-bold">Live Proposition Inspector</span>
                    <span className="rounded-full bg-white px-2 py-1 text-[9px] text-[#747687]">
                      {selectedEdge ? `Proposisi #${edges.findIndex((edge) => edge.id === selectedEdge.id) + 1}` : 'Pilih relasi'}
                    </span>
                  </div>
                  {selectedEdge ? (
                    <>
                      <p className="break-words text-xs font-medium">
                        <strong>[{labelOf(selectedEdge.source)}]</strong> {String(selectedEdge.label)} <strong>[{labelOf(selectedEdge.target)}]</strong>
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button type="button" onClick={() => setSelectedEdgeId(null)} className="inline-flex items-center gap-1 rounded-md bg-[#e6f4ea] px-3 py-2 text-[10px] font-bold text-[#059669]">
                          <ThumbsUp className="h-3 w-3" /> Terima
                        </button>
                        <button type="button" onClick={handleDeleteSelectedEdge} className="inline-flex items-center gap-1 rounded-md bg-[#ffe4e6] px-3 py-2 text-[10px] font-bold text-[#da3437]">
                          <ThumbsDown className="h-3 w-3" /> Tolak
                        </button>
                        <button type="button" onClick={handleRelabelSelectedEdge} className="inline-flex items-center gap-1 rounded-md bg-white px-3 py-2 text-[10px] font-bold">
                          <Edit3 className="h-3 w-3" /> Ubah label
                        </button>
                      </div>
                    </>
                  ) : (
                    <p className="text-[11px] text-[#747687]">Pilih relasi dari daftar atau klik garis pada peta untuk meninjau, menolak, atau mengubah labelnya.</p>
                  )}
                </div>
              </section>
            </div>
          </div>
        </main>

        <div className="sticky bottom-0 z-30 border-t border-[#e4e1e6] bg-white/95 px-4 py-3 shadow-[0_-4px_12px_rgba(27,27,30,0.06)] backdrop-blur sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-[1440px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#dee1ff] text-[#0038d1]"><ShieldCheck className="h-5 w-5" /></span>
              <div>
                <div className="text-xs font-bold">Status Validasi Pengajar (Master Map Kit-Build)</div>
                <div className="text-[10px] text-[#747687]">Peta ini akan menjadi acuan penilaian mahasiswa FILKOM UB.</div>
              </div>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={!aiDraft}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#f0edf1] px-3 py-2.5 text-[10px] font-bold text-[#1b1b1e] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save className="h-3.5 w-3.5" /> {isDraftSaved ? 'Draf Tersimpan' : 'Simpan Sebagai Draft AI'}
              </button>
              <button
                type="button"
                onClick={handleApproveAIDraft}
                disabled={!aiDraft || isSaving}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#0038d1] px-3 py-2.5 text-[10px] font-bold text-white shadow-[2px_2px_0_#1b1b1e] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Check className="h-3.5 w-3.5" /> Setujui &amp; Jadikan Master Concept Map Baru
              </button>
              <button
                type="button"
                onClick={handleLockMasterMap}
                disabled={isSaving}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#ffddb8] px-3 py-2.5 text-[10px] font-bold text-[#1b1b1e] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <CheckCheck className="h-3.5 w-3.5" /> Kunci Master Map
              </button>
            </div>
          </div>
        </div>

        {showWizard && (
          <CreateAssessmentWizard
            masterMap={buildMapFromCanvas()}
            onSaveAssessment={onSaveAssessment}
            onClose={() => setShowWizard(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF7F2]">
      <InstructorNavbar activeItem="Maps" currentUser={currentUser} onNavigate={handleNav} onLogout={onLogout} />
      {/* Sub-Header Ribbon */}
      <div className="bg-[#FAF7F2] border-b-2 border-[#1B1B1E] px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4 z-10 shadow-[0_2px_0px_#1B1B1E]">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-[#E6F4EA] border border-[#1B1B1E] text-[10px] font-extrabold text-[#059669]">
              ● CURRENT SESSION
            </span>
            <span className="text-xs font-bold text-[#444655]">FILKOM UB &bull; KELAS B</span>
          </div>
          <h1 className="text-base font-serif font-black text-[#1B1B1E] mt-0.5">
            {masterMap.title} &bull; Master Map Acuan
          </h1>
          <p className="text-[11px] font-bold text-[#444655]">
            {nodes.length} konsep &bull; {edges.length} relasi
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {onBackToDashboard && (
            <button
              type="button"
              onClick={onBackToDashboard}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white text-[#1B1B1E] text-xs font-black border-2 border-[#1B1B1E] shadow-[3px_3px_0px_#1B1B1E] transition-all hover:-translate-y-px"
            >
              Kembali ke Dashboard
            </button>
          )}
          <button
            onClick={() => setShowWizard(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#ECFDF5] hover:bg-[#D1FAE5] text-[#065F46] text-xs font-black border-2 border-[#1B1B1E] shadow-[3px_3px_0px_#1B1B1E] hover:shadow-[4px_4px_0px_#1B1B1E] transition-all"
          >
            <Sliders className="w-3.5 h-3.5 text-[#059669]" />
            <span>Wizard Asesmen 4-Step</span>
          </button>

          <button
            onClick={() => setShowAiModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0038D1] hover:bg-[#2F54EB] text-white text-xs font-black border-2 border-[#1B1B1E] shadow-[3px_3px_0px_#1B1B1E] hover:shadow-[4px_4px_0px_#1B1B1E] transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FFEAA7]" />
            <span>Generate Draf AI</span>
          </button>

          <button
            onClick={handleLockMasterMap}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FFEAA7] hover:bg-[#FFDDB8] text-[#1B1B1E] text-xs font-black border-2 border-[#1B1B1E] shadow-[3px_3px_0px_#1B1B1E] transition-all disabled:opacity-50"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Menyimpan...' : 'Kunci Master Map'}</span>
          </button>
        </div>
      </div>

      {toast && (
        <div
          className={`fixed top-20 right-8 z-50 border-2 border-[#1B1B1E] px-4 py-2.5 rounded-xl shadow-[4px_4px_0px_#1B1B1E] flex items-center gap-2 text-xs font-extrabold animate-in fade-in duration-200 max-w-sm ${
            toast.kind === 'ok' ? 'bg-[#E6F4EA] text-[#059669]' : 'bg-[#FFE4E6] text-[#DA3437]'
          }`}
        >
          {toast.kind === 'ok' ? <Check className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
          <span>{toast.msg}</span>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Canvas */}
        <div className="flex-1 relative w-full h-full">
          {/* Floating builder toolbar */}
          <div className="absolute top-4 left-4 z-10 bg-white/95 p-3 rounded-2xl border-2 border-[#1B1B1E] shadow-[4px_4px_0px_#1B1B1E] space-y-2 w-72">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#444655] block">
              Editor Master Map
            </span>
            <div className="flex gap-1.5">
              <input
                id="new-concept-input"
                type="text"
                value={newConceptLabel}
                onChange={(e) => setNewConceptLabel(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddConcept()}
                placeholder="Nama konsep baru"
                className="flex-1 min-w-0 px-2 py-1 border-2 border-[#1B1B1E] rounded-lg text-xs font-bold bg-[#FAF7F2] focus:outline-hidden"
              />
              <button
                id="add-concept-btn"
                onClick={handleAddConcept}
                className="px-2 py-1 rounded-lg bg-[#0038D1] text-white border-2 border-[#1B1B1E] text-xs font-black"
                title="Tambah konsep"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <div>
              <label className="text-[10px] font-bold text-[#444655] block mb-0.5">
                Label relasi (dipakai saat menarik garis antar-node)
              </label>
              <input
                id="relation-label-input"
                type="text"
                value={relationLabel}
                onChange={(e) => setRelationLabel(e.target.value)}
                className="w-full px-2 py-1 border-2 border-[#1B1B1E] rounded-lg text-xs font-bold bg-[#FFEAA7] focus:outline-hidden"
              />
            </div>
            <p className="text-[10px] text-[#444655] leading-tight">
              Klik relasi untuk memeriksa di panel kanan. Tekan Backspace untuk menghapus node/relasi terpilih.
            </p>
          </div>

          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onEdgeClick={(_, edge) => setSelectedEdgeId(edge.id)}
            onPaneClick={() => setSelectedEdgeId(null)}
            fitView
          >
            <Controls />
            <MiniMap nodeStrokeColor="#1B1B1E" nodeColor="#FFEAA7" />
            <Background color="#1B1B1E" gap={24} size={1} />
          </ReactFlow>
        </div>

        {/* Right Aside Inspector */}
        <div className="w-88 bg-white border-l-2 border-[#1B1B1E] p-5 overflow-y-auto hidden lg:block space-y-6">
          <div className="flex items-center justify-between border-b-2 border-[#1B1B1E] pb-3">
            <span className="text-xs font-black uppercase tracking-wider text-[#1B1B1E]">
              Live Proposition Inspector
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F0EDF1] border border-[#1B1B1E] text-[#1B1B1E]">
              {edges.length} proposisi
            </span>
          </div>

          {selectedEdge ? (
            <div className="p-4 rounded-xl bg-[#FAF7F2] border-2 border-[#1B1B1E] shadow-[3px_3px_0px_#1B1B1E] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase text-[#444655]">
                  Proposisi #{edges.findIndex((e) => e.id === selectedEdge.id) + 1}
                </span>
                <span className="text-[10px] font-bold text-[#0038D1] bg-white px-2 py-0.5 rounded-sm border border-[#1B1B1E]">
                  Terpilih
                </span>
              </div>

              <div className="text-xs font-bold text-[#1B1B1E] break-words">
                <strong>[{labelOf(selectedEdge.source)}]</strong> {String(selectedEdge.label)}{' '}
                <strong>[{labelOf(selectedEdge.target)}]</strong>
              </div>

              <div className="flex items-center gap-1.5 pt-2 border-t border-[#1B1B1E]/20">
                <button
                  onClick={() => setSelectedEdgeId(null)}
                  className="flex-1 flex items-center justify-center gap-1 py-1 rounded-md bg-[#E6F4EA] border border-[#1B1B1E] text-[10px] font-bold text-[#059669] hover:bg-[#c2ebd0]"
                >
                  <ThumbsUp className="w-3 h-3" /> Terima
                </button>
                <button
                  onClick={handleDeleteSelectedEdge}
                  className="flex-1 flex items-center justify-center gap-1 py-1 rounded-md bg-[#FFE4E6] border border-[#1B1B1E] text-[10px] font-bold text-[#DA3437] hover:bg-[#fecdd3]"
                >
                  <ThumbsDown className="w-3 h-3" /> Tolak
                </button>
                <button
                  onClick={handleRelabelSelectedEdge}
                  title="Ganti label dengan isi kolom 'Label relasi'"
                  className="flex-1 flex items-center justify-center gap-1 py-1 rounded-md bg-white border border-[#1B1B1E] text-[10px] font-bold text-[#1B1B1E] hover:bg-slate-50"
                >
                  <Edit3 className="w-3 h-3" /> Ubah
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-[#FAF7F2] border-2 border-dashed border-[#1B1B1E] text-[11px] text-[#444655] font-medium">
              Klik salah satu relasi pada kanvas untuk meninjau, menolak, atau mengubah labelnya.
            </div>
          )}

          {/* Assessment Settings */}
          <div className="space-y-4">
            <span className="text-xs font-black uppercase tracking-wider text-[#1B1B1E] block">
              Konfigurasi Asesmen
            </span>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#1B1B1E] block mb-1">Durasi Asesmen (Menit)</label>
                <input
                  id="duration-input"
                  type="number"
                  min={1}
                  value={duration}
                  onChange={(e) => setDuration(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-1.5 border-2 border-[#1B1B1E] rounded-lg font-bold text-[#1B1B1E] bg-[#FAF7F2] focus:outline-hidden"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#FFEAA7] border-2 border-[#1B1B1E] shadow-[2px_2px_0px_#1B1B1E] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#1B1B1E]">Toleransi Arah Simetris</span>
                  <input
                    id="tolerance-toggle"
                    type="checkbox"
                    checked={allowTolerance}
                    onChange={(e) => setAllowTolerance(e.target.checked)}
                    className="w-4 h-4 accent-[#0038D1]"
                  />
                </div>
                <p className="text-[10px] text-[#444655] leading-tight">
                  Label simetris yang ditoleransi: {assessmentConfig.tolerated_symmetric_labels.join(', ')}.
                </p>
              </div>

              <button
                id="save-config-btn"
                onClick={handleSaveConfig}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-full bg-[#0038D1] hover:bg-[#2F54EB] text-white font-black border-2 border-[#1B1B1E] shadow-[2px_2px_0px_#1B1B1E]"
              >
                <Save className="w-3.5 h-3.5" /> Simpan Konfigurasi
              </button>

              <div className="p-3 rounded-xl bg-white border-2 border-[#1B1B1E] text-[#444655] space-y-1">
                <span className="font-bold text-[#1B1B1E] block text-[11px]">Metode Asesmen:</span>
                <p className="text-[10px] leading-relaxed">
                  Kit-Build Concept Mapping (F. Hirashima). Penilaian 100% deterministik graf NetworkX tanpa
                  halusinasi LLM.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Generator Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#FAF7F2] rounded-2xl border-2 border-[#1B1B1E] shadow-[6px_6px_0px_#1B1B1E] max-w-xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b-2 border-[#1B1B1E] pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-lg bg-[#0038D1] text-white border border-[#1B1B1E]">
                  <BrainCircuit className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-black font-serif text-[#1B1B1E] text-base">AI Concept Map Generator</h3>
                  <p className="text-[11px] text-[#444655]">Ekstraksi otomatis materi silabus menjadi draf graf</p>
                </div>
              </div>
              <button
                onClick={() => setShowAiModal(false)}
                className="text-[#1B1B1E] font-black text-sm px-2 py-1 rounded-md border border-[#1B1B1E] bg-white hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#1B1B1E] block mb-1">Topik Materi</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-[#1B1B1E] rounded-lg text-xs font-bold text-[#1B1B1E] bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#1B1B1E] block mb-1">Teks Materi Pembelajaran</label>
                <textarea
                  rows={3}
                  value={materialText}
                  onChange={(e) => setMaterialText(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-[#1B1B1E] rounded-lg text-xs font-medium text-[#1B1B1E] bg-white focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleGenerateAI}
                  disabled={isGenerating}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0038D1] hover:bg-[#2F54EB] text-white text-xs font-bold border-2 border-[#1B1B1E] shadow-[2px_2px_0px_#1B1B1E] disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#FFEAA7]" />
                  <span>{isGenerating ? 'AI Mengekstrak...' : 'Mulai Ekstraksi AI'}</span>
                </button>
              </div>

              {aiDraft && (
                <div className="p-4 rounded-xl bg-white border-2 border-[#1B1B1E] shadow-[3px_3px_0px_#1B1B1E] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1B1B1E]">
                      Hasil Draf AI ({aiDraft.nodes.length} Konsep &bull; {aiDraft.edges.length} Relasi)
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E6F4EA] border border-[#1B1B1E] text-[#059669]">
                      Confidence {(aiDraft.confidence_score * 100).toFixed(0)}%
                    </span>
                  </div>

                  <p className="text-xs text-[#444655] italic">{aiDraft.generation_notes}</p>

                  <div className="flex flex-wrap gap-1">
                    {aiDraft.nodes.map((n) => (
                      <span key={n.id} className="px-1.5 py-0.5 rounded-sm bg-[#FAF7F2] border border-[#1B1B1E] text-[10px] font-bold">
                        {n.label}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#1B1B1E]/20 gap-2">
                    <span className="text-[10px] text-[#444655]">
                      Menyetujui akan mengganti Master Map & mereset hasil asesmen sebelumnya.
                    </span>
                    <button
                      onClick={handleApproveAIDraft}
                      className="shrink-0 px-4 py-2 rounded-full bg-[#FFEAA7] hover:bg-[#FFDDB8] text-[#1B1B1E] font-black text-xs border-2 border-[#1B1B1E] shadow-[2px_2px_0px_#1B1B1E]"
                    >
                      Setujui & Jadikan Master Map
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Assessment 4-Step Wizard Modal */}
      {showWizard && (
        <CreateAssessmentWizard
          masterMap={buildMapFromCanvas()}
          onSaveAssessment={onSaveAssessment}
          onClose={() => setShowWizard(false)}
        />
      )}
    </div>
  );
};
