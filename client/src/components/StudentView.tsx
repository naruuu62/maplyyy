'use client';

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  MarkerType,
  Handle,
  Position,
  NodeProps
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  ConceptKit,
  EvaluationResult,
  ConceptNode as ConceptNodeType,
  ConceptEdge as ConceptEdgeType,
  AssessmentConfig
} from '../types/maply';
import { submitStudentMap } from '../lib/api';
import {
  Send,
  RotateCcw,
  CheckCircle2,
  Clock,
  X,
  FileCheck,
  Sparkles,
  Layers,
  HelpCircle,
  AlertCircle,
  AlertTriangle,
  Move,
  GraduationCap,
  Grid,
  Search,
  Check,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  Trash2,
  PlusCircle,
  Info,
  Network
} from 'lucide-react';

// =========================================================================
// CUSTOM REACTFLOW NODE COMPONENT (DYNAMIC FROM KIT CONCEPTS)
// =========================================================================

interface DynamicConceptNodeData {
  id: string;
  title: string;
  subtitle?: string;
  isPlaced: boolean;
  onRemove?: (id: string) => void;
}

const ConceptCardNode: React.FC<NodeProps> = ({ data, selected }) => {
  const d = data as unknown as DynamicConceptNodeData;
  return (
    <div
      className={`relative min-w-[210px] max-w-[270px] bg-white rounded-2xl border-2 border-[#1B1B1E] p-3.5 shadow-[3px_3px_0px_#1B1B1E] transition-all select-none group ${
        selected ? 'ring-2 ring-[#0038D1] shadow-[4px_4px_0px_#0038D1]' : ''
      }`}
    >
      {/* 4 Connection Socket Handles (Top, Bottom, Left, Right) */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-white !border-2 !border-[#1B1B1E] hover:!bg-[#0038D1] transition-colors"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-white !border-2 !border-[#1B1B1E] hover:!bg-[#0038D1] transition-colors"
      />
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-white !border-2 !border-[#1B1B1E] hover:!bg-[#0038D1] transition-colors"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-white !border-2 !border-[#1B1B1E] hover:!bg-[#0038D1] transition-colors"
      />

      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 min-w-0">
          <span className="shrink-0 text-sm mt-0.5 text-[#0038D1]">●</span>
          <div className="min-w-0">
            <h4 className="font-serif font-black text-xs text-[#1B1B1E] leading-snug break-words">
              {d.title}
            </h4>
            {d.subtitle && (
              <p className="text-[10px] text-[#555] font-sans mt-0.5 leading-tight line-clamp-2">
                {d.subtitle}
              </p>
            )}
          </div>
        </div>
        {d.onRemove && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              d.onRemove?.(d.id);
            }}
            title="Kembalikan kartu ke nampan palet"
            className="opacity-0 group-hover:opacity-100 p-1 text-[#71717A] hover:text-[#DA3437] transition-all cursor-pointer rounded"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

// =========================================================================
// MAIN STUDENT VIEW COMPONENT (DYNAMIC DRAFT & FULL KIT-BUILD INTEGRATION)
// =========================================================================

interface StudentViewProps {
  kit: ConceptKit;
  onEvaluationComplete: (result: EvaluationResult) => void;
  onBackToDashboard?: () => void;
  assessmentConfig?: AssessmentConfig;
  timeRemainingSeconds?: number;
  studentName?: string;
  studentNim?: string;
}

interface DraftState {
  placedIds: string[];
  nodes: { id: string; x: number; y: number }[];
  edges: { id: string; source: string; target: string; label: string }[];
  selectedRelation: string;
}

export const StudentView: React.FC<StudentViewProps> = ({
  kit,
  onEvaluationComplete,
  onBackToDashboard,
  assessmentConfig,
  timeRemainingSeconds,
  studentName = 'Mahasiswa',
  studentNim = '-'
}) => {
  const currentAssessmentId = assessmentConfig?.id || kit.assessment_id;
  const draftStorageKey = `maply_workspace_draft_${currentAssessmentId}`;

  const nodeTypes = useMemo(
    () => ({
      conceptCard: ConceptCardNode
    }),
    []
  );

  const availableRels = useMemo(() => {
    return kit.available_relationships && kit.available_relationships.length > 0
      ? kit.available_relationships
      : ['terhubung dengan', 'mengatur', 'berisi', 'mengirim data ke'];
  }, [kit.available_relationships]);

  const [selectedRelation, setSelectedRelation] = useState<string>(availableRels[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showPetunjukModal, setShowPetunjukModal] = useState(false);
  const [autoSaveTime, setAutoSaveTime] = useState<string>('Menyimpan...');

  // Track which concepts from kit are on canvas vs still in the tray
  const [placedConceptIds, setPlacedConceptIds] = useState<Set<string>>(new Set());

  // ReactFlow Nodes & Edges
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Function to remove a node from canvas back to the tray
  const handleRemoveNodeFromCanvas = useCallback(
    (conceptId: string) => {
      setNodes((nds) => nds.filter((n) => n.id !== conceptId));
      setEdges((eds) => eds.filter((e) => e.source !== conceptId && e.target !== conceptId));
      setPlacedConceptIds((prev) => {
        const next = new Set(prev);
        next.delete(conceptId);
        return next;
      });
    },
    [setNodes, setEdges]
  );

  // Initialize or restore draft from localStorage
  useEffect(() => {
    let restoredDraft: DraftState | null = null;
    try {
      const raw = localStorage.getItem(draftStorageKey);
      if (raw) {
        restoredDraft = JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Failed to parse draft from localStorage:', e);
    }

    if (restoredDraft && Array.isArray(restoredDraft.placedIds) && restoredDraft.placedIds.length > 0) {
      // Reconstitute nodes from restored draft
      const restoredNodeList: Node[] = [];
      const restoredPlacedSet = new Set<string>();

      restoredDraft.nodes.forEach((saved) => {
        const matchingConcept = kit.concepts.find((c) => c.id === saved.id);
        if (matchingConcept) {
          restoredPlacedSet.add(matchingConcept.id);
          restoredNodeList.push({
            id: matchingConcept.id,
            type: 'conceptCard',
            position: { x: saved.x, y: saved.y },
            data: {
              id: matchingConcept.id,
              title: matchingConcept.label,
              subtitle: matchingConcept.description || '',
              isPlaced: true,
              onRemove: handleRemoveNodeFromCanvas
            }
          });
        }
      });

      // Reconstitute edges
      const restoredEdgeList: Edge[] = (restoredDraft.edges || []).map((e, idx) => ({
        id: e.id || `edge-${idx}`,
        source: e.source,
        target: e.target,
        label: e.label.startsWith('──') ? e.label : `── ${e.label} ──▶`,
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed, color: '#1B1B1E' },
        style: { stroke: '#1B1B1E', strokeWidth: 2.5 },
        labelStyle: { fill: '#1B1B1E', fontWeight: 800, fontSize: 10, fontFamily: 'monospace' },
        labelBgStyle: { fill: '#FAF7F2', fillOpacity: 1, rx: 4, ry: 4, stroke: '#1B1B1E', strokeWidth: 1.5 },
        labelBgPadding: [6, 4]
      }));

      setNodes(restoredNodeList);
      setEdges(restoredEdgeList);
      setPlacedConceptIds(restoredPlacedSet);
      if (restoredDraft.selectedRelation) {
        setSelectedRelation(restoredDraft.selectedRelation);
      }
    } else {
      // Clean start: place initial 2-3 anchor nodes on canvas, leave remainder in tray
      const initialCount = Math.min(3, kit.concepts.length);
      const initialPlaced = kit.concepts.slice(0, initialCount);
      const placedSet = new Set<string>(initialPlaced.map((c) => c.id));

      const newNodes: Node[] = initialPlaced.map((c, idx) => {
        // Aesthetic non-overlapping layout
        const x = 200 + (idx % 2) * 280;
        const y = 80 + Math.floor(idx / 2) * 180;
        return {
          id: c.id,
          type: 'conceptCard',
          position: { x, y },
          data: {
            id: c.id,
            title: c.label,
            subtitle: c.description || '',
            isPlaced: true,
            onRemove: handleRemoveNodeFromCanvas
          }
        };
      });

      setNodes(newNodes);
      setEdges([]);
      setPlacedConceptIds(placedSet);
    }
  }, [currentAssessmentId, draftStorageKey, kit.concepts, handleRemoveNodeFromCanvas, setNodes, setEdges]);

  // Persist draft to localStorage on changes
  useEffect(() => {
    if (nodes.length === 0 && placedConceptIds.size === 0) return;

    try {
      const draft: DraftState = {
        placedIds: Array.from(placedConceptIds),
        nodes: nodes.map((n) => ({ id: n.id, x: n.position.x, y: n.position.y })),
        edges: edges.map((e) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          label: (e.label as string) || ''
        })),
        selectedRelation
      };
      localStorage.setItem(draftStorageKey, JSON.stringify(draft));

      const now = new Date();
      const h = now.getHours().toString().padStart(2, '0');
      const m = now.getMinutes().toString().padStart(2, '0');
      const s = now.getSeconds().toString().padStart(2, '0');
      setAutoSaveTime(`${h}:${m}:${s} WIB`);
    } catch (e) {
      console.warn('Failed to auto-save workspace draft:', e);
    }
  }, [nodes, edges, placedConceptIds, selectedRelation, draftStorageKey]);

  // Connect handler (draws a new directed proposition edge)
  const onConnect = useCallback(
    (params: Connection) => {
      if (!params.source || !params.target || params.source === params.target) return;
      const newEdge: Edge = {
        ...params,
        id: `edge-${Date.now()}`,
        label: `── ${selectedRelation} ──▶`,
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed, color: '#1B1B1E' },
        style: { stroke: '#1B1B1E', strokeWidth: 2.5 },
        labelStyle: { fill: '#1B1B1E', fontWeight: 800, fontSize: 10, fontFamily: 'monospace' },
        labelBgStyle: { fill: '#FFEAA7', fillOpacity: 1, rx: 4, ry: 4, stroke: '#1B1B1E', strokeWidth: 1.5 },
        labelBgPadding: [6, 4]
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [selectedRelation, setEdges]
  );

  // Add concept from tray palette onto the canvas
  const handlePlaceConcept = useCallback(
    (concept: ConceptNodeType) => {
      if (placedConceptIds.has(concept.id)) return;

      const offsetIdx = nodes.length;
      const x = 240 + (offsetIdx % 3) * 120;
      const y = 140 + (offsetIdx % 4) * 80;

      const newNode: Node = {
        id: concept.id,
        type: 'conceptCard',
        position: { x, y },
        data: {
          id: concept.id,
          title: concept.label,
          subtitle: concept.description || '',
          isPlaced: true,
          onRemove: handleRemoveNodeFromCanvas
        }
      };

      setNodes((nds) => [...nds, newNode]);
      setPlacedConceptIds((prev) => new Set(prev).add(concept.id));
    },
    [placedConceptIds, nodes.length, setNodes, handleRemoveNodeFromCanvas]
  );

  // Reset Canvas to initial clean state
  const handleResetCanvas = useCallback(() => {
    try {
      localStorage.removeItem(draftStorageKey);
    } catch {}
    const initialCount = Math.min(3, kit.concepts.length);
    const initialPlaced = kit.concepts.slice(0, initialCount);
    const placedSet = new Set<string>(initialPlaced.map((c) => c.id));

    const newNodes: Node[] = initialPlaced.map((c, idx) => ({
      id: c.id,
      type: 'conceptCard',
      position: { x: 200 + (idx % 2) * 280, y: 80 + Math.floor(idx / 2) * 180 },
      data: {
        id: c.id,
        title: c.label,
        subtitle: c.description || '',
        isPlaced: true,
        onRemove: handleRemoveNodeFromCanvas
      }
    }));

    setNodes(newNodes);
    setEdges([]);
    setPlacedConceptIds(placedSet);
  }, [draftStorageKey, kit.concepts, handleRemoveNodeFromCanvas, setNodes, setEdges]);

  // Format timer
  const formatRemainingTime = (seconds?: number) => {
    const s = seconds !== undefined ? seconds : 1800;
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Final submission to backend
  const handleFinalSubmit = async () => {
    setShowSubmitModal(false);
    setIsSubmitting(true);
    try {
      const cleanEdgeLabel = (text: string) =>
        text.replace(/──/g, '').replace(/──▶/g, '').replace(/\?/g, '').trim();

      const submittedNodes: ConceptNodeType[] = nodes.map((n) => ({
        id: n.id,
        label: (n.data as { title: string }).title || n.id,
        x: n.position.x,
        y: n.position.y
      }));

      const submittedEdges: ConceptEdgeType[] = edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: cleanEdgeLabel((e.label as string) || 'terhubung dengan')
      }));

      const res = await submitStudentMap(
        currentAssessmentId,
        studentName,
        submittedNodes,
        submittedEdges
      );

      // Clean local draft once successfully evaluated
      try {
        localStorage.removeItem(draftStorageKey);
      } catch {}

      onEvaluationComplete(res);
    } catch (err) {
      console.error('Submission error:', err);
      alert('Gagal mengirimkan asesmen. Pastikan server terhubung.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Inspect summary stats
  const totalConcepts = kit.concepts.length;
  const placedCount = nodes.length;
  const completenessPercent = totalConcepts > 0 ? Math.round((placedCount / totalConcepts) * 100) : 0;
  const edgesCount = edges.length;

  return (
    <div className="flex h-[calc(100dvh-59px)] min-h-0 w-full flex-col overflow-hidden bg-[#FAF7F2] font-sans text-[#1B1B1E] select-none">
      {/* ========================================================= */}
      {/* 1. TOP HEADER BAR */}
      {/* ========================================================= */}
      <header className="h-16 px-4 sm:px-6 bg-white border-b-2 border-[#1B1B1E] flex items-center justify-between gap-4 shrink-0 z-30 shadow-[0_2px_4px_rgba(27,27,30,0.04)]">
        {/* Left: UB badge + Breadcrumb & sub-pills */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onBackToDashboard}
            className="w-8 h-8 rounded-lg bg-[#0038D1] border-2 border-[#1B1B1E] flex items-center justify-center text-white font-serif font-black text-xs shadow-[2px_2px_0px_#1B1B1E] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all cursor-pointer shrink-0"
            title="Kembali ke Dashboard / Picker"
          >
            UB
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-serif font-bold text-[#1B1B1E] truncate">
              <button
                type="button"
                onClick={onBackToDashboard}
                className="hover:text-[#0038D1] transition-colors cursor-pointer"
              >
                {assessmentConfig?.master_map_id || 'Mata Kuliah'}
              </button>
              <span className="text-[#888]">/</span>
              <span className="font-black text-[#1B1B1E] truncate">
                {assessmentConfig?.title || 'Asesmen Kit-Build'}
              </span>
            </div>

            <div className="flex items-center gap-2 mt-0.5 text-[10px]">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white border border-[#1B1B1E] font-mono text-[#1B1B1E]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1B1B1E]"></span>
                Token: {assessmentConfig?.exam_token || 'AKTIF'}
              </span>

              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white border border-[#1B1B1E] font-mono font-medium text-[#065F46]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#059669]"></span>
                Auto-saved ({autoSaveTime})
              </span>
            </div>
          </div>
        </div>

        {/* Right: Live Timer, Petunjuk, Reset & Kirim Jawaban */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border-2 border-[#1B1B1E] text-xs font-mono font-black text-[#1B1B1E] shadow-[1.5px_1.5px_0px_#1B1B1E]">
            <span className="w-2 h-2 rounded-full bg-[#DA3437] animate-pulse"></span>
            <span>{formatRemainingTime(timeRemainingSeconds)} SISA</span>
          </div>

          <button
            type="button"
            onClick={() => setShowPetunjukModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-[#F0ECE1] border-2 border-[#1B1B1E] text-xs font-serif font-bold text-[#1B1B1E] shadow-[1.5px_1.5px_0px_#1B1B1E] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#1B1B1E]" />
            <span className="hidden sm:inline">Petunjuk</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (confirm('Kosongkan draft kanvas dan kembalikan ke layout awal?')) {
                handleResetCanvas();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-[#F0ECE1] border-2 border-[#1B1B1E] text-xs font-serif font-bold text-[#1B1B1E] shadow-[1.5px_1.5px_0px_#1B1B1E] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#1B1B1E]" />
            <span className="hidden sm:inline">Reset Draft</span>
          </button>

          <button
            type="button"
            onClick={() => setShowSubmitModal(true)}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-4 sm:px-5 py-1.5 rounded-full bg-[#0038D1] hover:bg-[#1A4BDB] text-white font-serif font-black text-xs sm:text-sm border-2 border-[#1B1B1E] shadow-[3px_3px_0px_#1B1B1E] hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
          >
            <span>Kirim Jawaban Asesmen</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 2. THREE-PANE BODY WORKSPACE */}
      {/* ========================================================= */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* ========================================================= */}
        {/* LEFT PANEL: CONCEPT & RELATION TRAY PALETTE */}
        {/* ========================================================= */}
        <aside className="w-76 sm:w-80 lg:w-[310px] bg-[#FAF7F2] border-r-2 border-[#1B1B1E] flex flex-col h-full shrink-0 z-10 shadow-[2px_0px_0px_rgba(27,27,30,0.04)]">
          <div className="bg-[#FFDDB8] border-b-2 border-[#1B1B1E] px-4 py-3 shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-xs bg-[#1B1B1E]"></span>
              <h2 className="font-serif font-black text-sm text-[#1B1B1E]">
                Palet Dekomposisi
              </h2>
            </div>
            <p className="text-[10px] font-mono text-[#6D4400] font-bold mt-0.5">
              Kit-Build Method • {kit.concepts.length} Keping Konsep
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
            {/* Section 1: Kepingan Konsep Dinamis */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs pb-1 border-b border-[#1B1B1E]/10">
                <div className="flex items-center gap-1.5 font-bold text-[#1B1B1E]">
                  <span>Kepingan Konsep</span>
                  <span className="px-1.5 py-0.2 rounded bg-[#EEF2FF] border border-[#0038D1] text-[9px] font-mono font-bold text-[#0038D1]">
                    {placedCount}/{totalConcepts} di Kanvas
                  </span>
                </div>
                <Grid className="w-3.5 h-3.5 text-[#71717A]" />
              </div>

              <div className="space-y-2 text-xs">
                {kit.concepts.map((concept) => {
                  const isPlaced = placedConceptIds.has(concept.id);
                  return (
                    <div
                      key={concept.id}
                      onClick={() => !isPlaced && handlePlaceConcept(concept)}
                      className={`p-3 rounded-xl border-2 transition-all select-none ${
                        isPlaced
                          ? 'bg-white/70 border-[#1B1B1E]/30 opacity-60 cursor-default'
                          : 'bg-white border-[#1B1B1E] shadow-[3px_3px_0px_#1B1B1E] hover:translate-x-[-1px] hover:translate-y-[-1px] cursor-pointer'
                      }`}
                      title={isPlaced ? 'Konsep sudah terpasang di kanvas' : 'Klik untuk menaruh ke kanvas'}
                    >
                      <div className="flex items-start justify-between gap-1.5">
                        <div className="flex items-start gap-1.5 min-w-0">
                          <span className={`w-2 h-2 rounded-full mt-1 shrink-0 ${isPlaced ? 'bg-[#9CA3AF]' : 'bg-[#0038D1]'}`}></span>
                          <div className="min-w-0">
                            <h4 className={`font-serif font-black text-xs leading-snug break-words ${isPlaced ? 'line-through text-[#6B7280]' : 'text-[#1B1B1E]'}`}>
                              {concept.label}
                            </h4>
                            {concept.description && (
                              <p className="text-[10px] text-[#555] font-sans mt-0.5 leading-tight line-clamp-1">
                                {concept.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-black uppercase shrink-0 ${
                            isPlaced
                              ? 'bg-[#ECFDF5] text-[#065F46] border border-[#059669]'
                              : 'bg-[#0038D1] text-white'
                          }`}
                        >
                          {isPlaced ? 'Terpasang ✓' : '+ Taruh'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section 2: Kepingan Relasi Tersedia */}
            <div className="space-y-2 pt-2 border-t border-[#1B1B1E]/10">
              <div className="flex items-center justify-between text-xs pb-1 border-b border-[#1B1B1E]/10">
                <div className="flex items-center gap-1.5 font-bold text-[#1B1B1E]">
                  <span>Pilihan Predikat Relasi</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-[#0038D1]">
                  Aktif: {selectedRelation}
                </span>
              </div>

              <div className="space-y-1.5 text-xs font-mono">
                {availableRels.map((relLabel) => {
                  const isActive = selectedRelation === relLabel;
                  return (
                    <button
                      key={relLabel}
                      type="button"
                      onClick={() => setSelectedRelation(relLabel)}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl border-2 transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#FFEAA7] border-[#1B1B1E] font-black text-[#1B1B1E] shadow-[2px_2px_0px_#1B1B1E]'
                          : 'bg-white border-[#1B1B1E] text-[#1B1B1E] hover:bg-[#FAF7F2]'
                      }`}
                    >
                      <span className="truncate">─[ {relLabel} ]─▶</span>
                      {isActive && (
                        <span className="px-1.5 py-0.2 rounded bg-white border border-[#1B1B1E] text-[9px] font-bold">
                          Aktif
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="p-3 bg-white border-t-2 border-[#1B1B1E] text-[10px] space-y-1 shrink-0">
            <div className="flex items-center gap-1 font-mono font-black text-[#1B1B1E] uppercase">
              <span>ATURAN PROPOSISI BERARAH:</span>
            </div>
            <p className="font-mono text-[#555] bg-[#FAF7F2] p-1.5 rounded border border-[#1B1B1E]/20 text-[9.5px]">
              [Subjek] ➔ [Predikat Relasi] ➔ [Objek]
            </p>
          </div>
        </aside>

        {/* ========================================================= */}
        {/* CENTER PANEL: REACTFLOW CANVAS */}
        {/* ========================================================= */}
        <main className="flex-1 relative flex flex-col h-full bg-[#FAF7F2] overflow-hidden">
          <div className="flex-1 w-full h-full">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              fitView
              fitViewOptions={{ padding: 0.2 }}
            >
              <Controls className="!bg-white !border-2 !border-[#1B1B1E] !shadow-[2px_2px_0px_#1B1B1E] !rounded-xl" />
              <MiniMap
                className="!bg-white !border-2 !border-[#1B1B1E] !shadow-[3px_3px_0px_#1B1B1E] !rounded-xl"
                nodeStrokeColor="#1B1B1E"
                nodeColor="#FFEAA7"
              />
              <Background color="#1B1B1E" gap={24} size={1} />
            </ReactFlow>
          </div>

          <div className="h-8 bg-white border-t-2 border-[#1B1B1E] px-4 flex items-center justify-between text-[10.5px] text-[#444655] shrink-0 z-20">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full border border-[#1B1B1E] flex items-center justify-center text-[8px] font-bold">
                i
              </span>
              <span>
                Tarik garis dari titik handle kartu untuk menghubungkan proposisi berarah. Drag kartu untuk merapikan graf.
              </span>
            </div>

            <div className="flex items-center gap-4">
              <span className="font-mono text-[10px] text-[#71717A]">
                Snap: Grid Active
              </span>
              <span className="flex items-center gap-1.5 font-mono text-[#0038D1] font-bold">
                <span className="w-2 h-2 rounded-full bg-[#059669]"></span>
                Kit Tersinkronisasi
              </span>
            </div>
          </div>
        </main>

        {/* ========================================================= */}
        {/* RIGHT PANEL: INSPEKTUR GRAF */}
        {/* ========================================================= */}
        <aside className="w-80 lg:w-[330px] bg-white border-l-2 border-[#1B1B1E] flex flex-col h-full shrink-0 z-10 shadow-[-2px_0px_0px_rgba(27,27,30,0.04)]">
          <div className="px-4 py-3 border-b-2 border-[#1B1B1E] shrink-0 bg-white">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0038D1]"></span>
              <h3 className="font-serif font-black text-sm text-[#1B1B1E]">
                Inspektur Graf
              </h3>
            </div>
            <p className="text-[10px] font-mono text-[#71717A] mt-0.5">
              Evaluator Deterministik Kit-Build
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Card 1: Kelengkapan Graf */}
            <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border-2 border-[#1B1B1E] shadow-[2px_2px_0px_#1B1B1E] space-y-2">
              <div className="flex items-center justify-between text-xs font-serif font-black text-[#1B1B1E]">
                <span>Kelengkapan Kepingan</span>
                <span className="font-mono text-sm text-[#0038D1]">
                  {completenessPercent}%
                </span>
              </div>

              <div className="w-full h-2.5 bg-white border-2 border-[#1B1B1E] rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-[#0038D1] rounded-full transition-all duration-300"
                  style={{ width: `${completenessPercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-[#555]">
                <span>{placedCount} dari {totalConcepts} keping di kanvas</span>
                <span>{edgesCount} proposisi</span>
              </div>
            </div>

            {/* Card 2: Audit Proposisi Aktif */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-serif font-bold text-[#1B1B1E]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#0038D1]"></span>
                  <span>Proposisi yang Dirangkai ({edgesCount})</span>
                </div>
              </div>

              {edges.length === 0 ? (
                <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#1B1B1E]/20 text-center space-y-1">
                  <Network className="w-5 h-5 text-[#71717A] mx-auto" />
                  <p className="text-xs font-bold text-[#1B1B1E]">Belum Ada Garis Relasi</p>
                  <p className="text-[10px] text-[#71717A]">
                    Tarik garis antar kartu konsep untuk membentuk proposisi berarah.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                  {edges.map((e, idx) => {
                    const srcNode = nodes.find((n) => n.id === e.source);
                    const tgtNode = nodes.find((n) => n.id === e.target);
                    const srcLabel = (srcNode?.data as any)?.title || e.source;
                    const tgtLabel = (tgtNode?.data as any)?.title || e.target;
                    const rawLabel = String(e.label || '').replace(/──/g, '').replace(/──▶/g, '').trim();

                    return (
                      <div
                        key={e.id}
                        className="p-2.5 rounded-xl bg-white border-2 border-[#1B1B1E] shadow-[1.5px_1.5px_0px_#1B1B1E] space-y-1"
                      >
                        <div className="flex items-center justify-between gap-1 text-[11px] font-mono font-bold text-[#1B1B1E]">
                          <span className="truncate">#{idx + 1} {srcLabel}</span>
                          <span className="text-[#0038D1]">➔</span>
                          <span className="truncate">{tgtLabel}</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-[#444655]">
                          <span className="bg-[#FFEAA7] px-1.5 py-0.2 rounded border border-[#1B1B1E] font-mono">
                            {rawLabel}
                          </span>
                          <button
                            type="button"
                            onClick={() => setEdges((eds) => eds.filter((x) => x.id !== e.id))}
                            className="text-[#DA3437] hover:underline cursor-pointer flex items-center gap-0.5"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Card 3: Petunjuk Asesmen */}
            <div className="p-3.5 rounded-2xl bg-[#FFF9E6] border-2 border-[#1B1B1E] shadow-[2px_2px_0px_#1B1B1E] space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-serif font-black text-[#1B1B1E]">
                <GraduationCap className="w-4 h-4 text-[#D97706]" />
                <span>Instruksi Asesmen</span>
              </div>
              <p className="text-[10.5px] text-[#444655] leading-relaxed">
                {assessmentConfig?.instructions || 'Susun seluruh kepingan konsep dan hubungkan proposisi kausalitas berarah secara tepat.'}
              </p>
            </div>
          </div>
        </aside>
      </div>

      {/* ========================================================= */}
      {/* 3. MODAL PETUNJUK PENGERJAAN */}
      {/* ========================================================= */}
      {showPetunjukModal && (
        <div className="fixed inset-0 z-50 bg-[#1B1B1E]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white rounded-3xl border-2 border-[#1B1B1E] shadow-[6px_6px_0px_#1B1B1E] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#FFEAA7] border-b-2 border-[#1B1B1E] px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#1B1B1E]" />
                <span className="text-xs font-serif font-black uppercase tracking-wider text-[#1B1B1E]">
                  Petunjuk Rekonstruksi Kit-Build
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowPetunjukModal(false)}
                className="w-7 h-7 rounded-full bg-white hover:bg-slate-100 border-2 border-[#1B1B1E] flex items-center justify-center text-[#1B1B1E] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs leading-relaxed">
              <div className="space-y-2">
                <h4 className="font-serif font-black text-sm text-[#1B1B1E]">
                  Cara Mengerjakan Asesmen Peta Konsep:
                </h4>
                <ol className="list-decimal pl-4 space-y-2 text-[#444655]">
                  <li>
                    <strong>Palet Dekomposisi (Kiri):</strong> Pilih kepingan konsep yang masih di nampan dan klik <em>+ Taruh</em> untuk menempatkannya ke kanvas.
                  </li>
                  <li>
                    <strong>Membuat Garis Relasi:</strong> Pilih predikat relasi yang sesuai di palet kiri, lalu tarik garis dari socket lingkaran kartu asal ke kartu tujuan.
                  </li>
                  <li>
                    <strong>Inspektur Graf (Kanan):</strong> Pantau daftar proposisi yang telah terbentuk. Anda dapat menghapus garis relasi yang keliru sewaktu-waktu.
                  </li>
                  <li>
                    <strong>Kirim Jawaban:</strong> Klik tombol <em>Kirim Jawaban Asesmen</em> di pojok kanan atas setelah seluruh kepingan terpasang dan terhubung.
                  </li>
                </ol>
              </div>

              <button
                type="button"
                onClick={() => setShowPetunjukModal(false)}
                className="w-full py-2.5 rounded-xl bg-[#0038D1] text-white font-serif font-black text-xs border-2 border-[#1B1B1E] shadow-[2px_2px_0px_#1B1B1E] cursor-pointer"
              >
                Saya Mengerti &bull; Lanjutkan Pengerjaan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. MODAL KONFIRMASI PENGUMPULAN ASESMEN */}
      {/* ========================================================= */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-[#1B1B1E]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl border-2 border-[#1B1B1E] shadow-[6px_6px_0px_#1B1B1E] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#FFEAA7] border-b-2 border-[#1B1B1E] px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-[#0038D1]" />
                <span className="text-xs font-serif font-black uppercase tracking-wider text-[#1B1B1E]">
                  Konfirmasi Pengumpulan
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="w-7 h-7 rounded-full bg-white hover:bg-slate-100 border-2 border-[#1B1B1E] flex items-center justify-center text-[#1B1B1E] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="space-y-2">
                <h4 className="font-serif font-black text-base text-[#1B1B1E]">
                  Kirimkan Graf Asesmen Anda?
                </h4>
                <p className="text-xs text-[#444655] leading-relaxed">
                  Setelah dikumpulkan, jawaban akan langsung dievaluasi secara deterministik terhadap Master Map Acuan Dosen. Sesi ini tidak dapat dikerjakan ulang.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border-2 border-[#1B1B1E] space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-[#71717A]">Keping Konsep:</span>
                  <span className="font-bold text-[#1B1B1E]">{placedCount} dari {totalConcepts} keping</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#71717A]">Total Proposisi:</span>
                  <span className="font-bold text-[#0038D1]">{edgesCount} proposisi</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#71717A]">Peserta:</span>
                  <span className="font-bold text-[#1B1B1E]">{studentName}</span>
                </div>
              </div>

              {placedCount < totalConcepts && (
                <div className="p-2.5 rounded-xl bg-[#FFFBEB] border border-[#D97706] text-[11px] text-[#B45309] flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    Perhatian: Masih ada {totalConcepts - placedCount} keping konsep yang belum diletakkan di kanvas.
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white hover:bg-[#FAF7F2] border-2 border-[#1B1B1E] font-serif font-bold text-xs text-[#1B1B1E] shadow-[2px_2px_0px_#1B1B1E] cursor-pointer"
                >
                  Batal / Cek Lagi
                </button>
                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-[#0038D1] hover:bg-[#2F54EB] border-2 border-[#1B1B1E] font-serif font-black text-xs text-white shadow-[2px_2px_0px_#1B1B1E] cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmitting ? 'Mengevaluasi...' : 'Ya, Kirim Final'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
