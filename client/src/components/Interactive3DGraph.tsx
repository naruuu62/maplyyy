"use client";

import React, { useRef, useEffect, useState } from "react";
import { Rotate3d } from "lucide-react";

interface SphereNode3D {
  id: string;
  x: number;
  y: number;
  z: number;
  baseRadius: number;
  baseColor: string;
  highlightColor: string;
  shadowColor: string;
  glowColor: string;
  isCore?: boolean;
}

interface SphereEdge3D {
  id: string;
  source: string;
  target: string;
}

// 12 Constellation Sphere Nodes with true 3D spatial depth
const SPHERE_NODES: SphereNode3D[] = [
  // Primary Master Sphere (Blue) — offset in 3D so it orbits front/back
  {
    id: "core",
    x: 25,
    y: -15,
    z: 45,
    baseRadius: 25,
    baseColor: "#0038D1",
    highlightColor: "#93C5FD",
    shadowColor: "#00207A",
    glowColor: "rgba(0, 56, 209, 0.4)",
    isCore: true,
  },
  // Secondary Companion Sphere (Amber/Gold)
  {
    id: "core2",
    x: -35,
    y: 20,
    z: -35,
    baseRadius: 20,
    baseColor: "#F59E0B",
    highlightColor: "#FDE68A",
    shadowColor: "#B45309",
    glowColor: "rgba(245, 158, 11, 0.35)",
    isCore: true,
  },
  // Front-crossing satellite (Red)
  {
    id: "s1",
    x: -10,
    y: 15,
    z: 95,
    baseRadius: 15,
    baseColor: "#E11D48",
    highlightColor: "#FECDD3",
    shadowColor: "#9F1239",
    glowColor: "rgba(225, 29, 72, 0.35)",
  },
  // Top-left front satellite (Emerald)
  {
    id: "s2",
    x: -105,
    y: -55,
    z: 50,
    baseRadius: 14,
    baseColor: "#10B981",
    highlightColor: "#A7F3D0",
    shadowColor: "#047857",
    glowColor: "rgba(16, 185, 129, 0.35)",
  },
  // Upper-right back satellite (Purple)
  {
    id: "s3",
    x: 100,
    y: -65,
    z: -70,
    baseRadius: 15,
    baseColor: "#8B5CF6",
    highlightColor: "#DDD6FE",
    shadowColor: "#5B21B6",
    glowColor: "rgba(139, 92, 246, 0.35)",
  },
  // Bottom-right front satellite (Sky Blue)
  {
    id: "s4",
    x: 85,
    y: 80,
    z: 60,
    baseRadius: 16,
    baseColor: "#0284C7",
    highlightColor: "#BAE6FD",
    shadowColor: "#0369A1",
    glowColor: "rgba(2, 132, 199, 0.35)",
  },
  // Bottom-left back satellite (Slate)
  {
    id: "s5",
    x: -85,
    y: 85,
    z: -65,
    baseRadius: 14,
    baseColor: "#64748B",
    highlightColor: "#E2E8F0",
    shadowColor: "#334155",
    glowColor: "rgba(100, 116, 139, 0.3)",
  },
  // Top center back satellite (Rose)
  {
    id: "s6",
    x: 10,
    y: -110,
    z: -60,
    baseRadius: 13,
    baseColor: "#EC4899",
    highlightColor: "#FBCFE8",
    shadowColor: "#BE185D",
    glowColor: "rgba(236, 72, 153, 0.3)",
  },
  // Far right middle satellite (Yellow)
  {
    id: "s7",
    x: 135,
    y: 25,
    z: -20,
    baseRadius: 14,
    baseColor: "#EAB308",
    highlightColor: "#FEF08A",
    shadowColor: "#A16207",
    glowColor: "rgba(234, 179, 8, 0.35)",
  },
  // Far left middle satellite (Teal)
  {
    id: "s8",
    x: -130,
    y: -15,
    z: -45,
    baseRadius: 12,
    baseColor: "#14B8A6",
    highlightColor: "#99F6E4",
    shadowColor: "#0F766E",
    glowColor: "rgba(20, 184, 166, 0.3)",
  },
  // Top front-right satellite (Indigo)
  {
    id: "s9",
    x: -55,
    y: -75,
    z: 80,
    baseRadius: 13,
    baseColor: "#6366F1",
    highlightColor: "#C7D2FE",
    shadowColor: "#4338CA",
    glowColor: "rgba(99, 102, 241, 0.3)",
  },
  // Bottom far-right back satellite (Orange)
  {
    id: "s10",
    x: 110,
    y: 95,
    z: -50,
    baseRadius: 12,
    baseColor: "#F97316",
    highlightColor: "#FFEDD5",
    shadowColor: "#C2410C",
    glowColor: "rgba(249, 115, 22, 0.3)",
  },
];

// Constellation Edges connecting the 3D topology
const SPHERE_EDGES: SphereEdge3D[] = [
  { id: "e0", source: "core", target: "core2" },
  { id: "e1", source: "core", target: "s1" },
  { id: "e2", source: "core", target: "s3" },
  { id: "e3", source: "core", target: "s4" },
  { id: "e4", source: "core", target: "s7" },
  { id: "e5", source: "core", target: "s9" },
  { id: "e6", source: "core2", target: "s2" },
  { id: "e7", source: "core2", target: "s5" },
  { id: "e8", source: "core2", target: "s6" },
  { id: "e9", source: "core2", target: "s8" },
  { id: "e10", source: "s1", target: "s4" },
  { id: "e11", source: "s1", target: "s2" },
  { id: "e12", source: "s2", target: "s9" },
  { id: "e13", source: "s2", target: "s8" },
  { id: "e14", source: "s3", target: "s6" },
  { id: "e15", source: "s3", target: "s7" },
  { id: "e16", source: "s4", target: "s10" },
  { id: "e17", source: "s5", target: "s8" },
  { id: "e18", source: "s5", target: "s10" },
  { id: "e19", source: "s6", target: "s9" },
  { id: "e20", source: "s7", target: "s10" },
];

// Cascading Synaptic Signal Pathways: Energy flows from source -> target, and the target reacts with a ripple!
interface CascadingSignal {
  edgeId: string;
  sourceId: string;
  targetId: string;
  startNormalized: number; // 0..1 in cycle
  duration: number;        // in cycle units
}

const SIGNAL_CHAINS: CascadingSignal[] = [
  // Pathway A: core -> s1 -> s4
  { edgeId: "e1", sourceId: "core", targetId: "s1", startNormalized: 0.05, duration: 0.22 },
  { edgeId: "e10", sourceId: "s1", targetId: "s4", startNormalized: 0.27, duration: 0.22 },
  // Pathway B: core2 -> s2 -> s9
  { edgeId: "e6", sourceId: "core2", targetId: "s2", startNormalized: 0.40, duration: 0.22 },
  { edgeId: "e12", sourceId: "s2", targetId: "s9", startNormalized: 0.62, duration: 0.22 },
  // Pathway C: core -> s3 -> s6
  { edgeId: "e2", sourceId: "core", targetId: "s3", startNormalized: 0.70, duration: 0.22 },
  { edgeId: "e14", sourceId: "s3", targetId: "s6", startNormalized: 0.92, duration: 0.22 },
];

// Smooth Hermite / Ease-in-out S-curve
function easeInOutQuad(x: number): number {
  return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
}

export default function Interactive3DGraph() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [autoRotate, setAutoRotate] = useState(true);
  const autoRotateRef = useRef(true);

  // Sync ref with state
  autoRotateRef.current = autoRotate;

  // Rotation angles (radians)
  const rotationRef = useRef({ x: 0.32, y: -0.45 });
  const velocityRef = useRef({ x: 0, y: 0.0028 });
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const hoveredIdRef = useRef<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const now = performance.now();
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      if (canvas.width !== Math.round(rect.width * dpr) || canvas.height !== Math.round(rect.height * dpr)) {
        canvas.width = Math.round(rect.width * dpr);
        canvas.height = Math.round(rect.height * dpr);
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      const width = rect.width;
      const height = rect.height;
      const cx = width / 2;
      const cy = height / 2;

      // Update camera rotation
      if (autoRotateRef.current && !isDraggingRef.current) {
        rotationRef.current.y += velocityRef.current.y;
        rotationRef.current.x += velocityRef.current.x;
      } else if (!isDraggingRef.current) {
        velocityRef.current.x *= 0.94;
        velocityRef.current.y *= 0.94;
        rotationRef.current.x += velocityRef.current.x;
        rotationRef.current.y += velocityRef.current.y;
      }

      // Continuous high-precision master cycle (1 full cycle every 4.8 seconds)
      const masterCycle = (now * 0.00021) % 1;
      const ambientPulse = (now * 0.002) % (Math.PI * 2);

      // Clear transparent canvas
      ctx.clearRect(0, 0, width, height);

      // Soft ambient background aura
      const bgGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, Math.min(width, height) * 0.55);
      bgGrad.addColorStop(0, "rgba(0, 56, 209, 0.07)");
      bgGrad.addColorStop(0.4, "rgba(245, 158, 11, 0.03)");
      bgGrad.addColorStop(1, "rgba(250, 247, 242, 0)");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 3D Matrix Projection Setup
      const fov = 380;
      const cosY = Math.cos(rotationRef.current.y);
      const sinY = Math.sin(rotationRef.current.y);
      const cosX = Math.cos(rotationRef.current.x);
      const sinX = Math.sin(rotationRef.current.x);

      // Orbital Horizon Rings
      const draw3DRing = (radius: number, tiltAngle: number, dash: number[], stroke: string) => {
        ctx.save();
        ctx.beginPath();
        const segments = 64;
        for (let i = 0; i <= segments; i++) {
          const theta = (i / segments) * Math.PI * 2;
          const rx = Math.cos(theta) * radius;
          const rz = Math.sin(theta) * radius;
          const ry = Math.sin(theta) * radius * Math.sin(tiltAngle);

          const x1 = rx * cosY - rz * sinY;
          const z1 = rz * cosY + rx * sinY;
          const y2 = ry * cosX - z1 * sinX;
          const z2 = z1 * cosX + ry * sinX;

          const scale = fov / (fov + z2);
          const px = cx + x1 * scale;
          const py = cy + y2 * scale;

          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.strokeStyle = stroke;
        ctx.lineWidth = 1.2;
        ctx.setLineDash(dash);
        ctx.stroke();
        ctx.restore();
      };

      draw3DRing(145, 0.25, [4, 6], "rgba(0, 56, 209, 0.12)");
      draw3DRing(125, -0.5, [2, 5], "rgba(27, 27, 30, 0.07)");

      // Node Absorption Energy map (detect when signals arrive at a target node!)
      const nodeEnergyMap = new Map<string, number>();

      // Active surge list along edges for this frame
      const activeSurgesMap = new Map<
        string,
        {
          progress: number;
          smoothAlpha: number;
          headPos: number;
          tailPos: number;
        }
      >();

      SIGNAL_CHAINS.forEach((chain) => {
        // Calculate progress in current cycle
        let relTime = masterCycle - chain.startNormalized;
        if (relTime < 0) relTime += 1;

        if (relTime <= chain.duration) {
          // Travel phase
          const linearProgress = relTime / chain.duration; // 0..1
          const travelEase = easeInOutQuad(linearProgress); // smooth movement along cable

          // Bell curve opacity: fades in smoothly at origin, reaches 1, fades out smoothly into target
          const smoothAlpha = Math.sin(linearProgress * Math.PI);

          const beamSpan = 0.32; // Beam length along the wire
          const headPos = Math.min(1.0, travelEase + beamSpan * 0.3);
          const tailPos = Math.max(0.0, travelEase - beamSpan * 0.7);

          activeSurgesMap.set(chain.edgeId, {
            progress: travelEase,
            smoothAlpha,
            headPos,
            tailPos,
          });

          // Impact excitation as surge enters the destination node (at p >= 0.75)
          if (linearProgress >= 0.75) {
            const impactProgress = (linearProgress - 0.75) / 0.25; // 0..1
            const energy = Math.sin(impactProgress * Math.PI);
            const current = nodeEnergyMap.get(chain.targetId) || 0;
            nodeEnergyMap.set(chain.targetId, Math.max(current, energy));
          }
        } else if (relTime <= chain.duration + 0.08) {
          // Residual dissipation shockwave on destination node
          const residualProgress = (relTime - chain.duration) / 0.08;
          const energy = Math.cos(residualProgress * Math.PI * 0.5);
          const current = nodeEnergyMap.get(chain.targetId) || 0;
          nodeEnergyMap.set(chain.targetId, Math.max(current, energy));
        }
      });

      // Project all spheres
      const projectedSpheres = SPHERE_NODES.map((node) => {
        const x1 = node.x * cosY - node.z * sinY;
        const z1 = node.z * cosY + node.x * sinY;
        const y2 = node.y * cosX - z1 * sinX;
        const z2 = z1 * cosX + node.y * sinX;

        const scale = Math.max(0.55, Math.min(1.5, fov / (fov + z2)));
        const px = cx + x1 * scale;
        const py = cy + y2 * scale;
        const radius = node.baseRadius * scale;
        const depthAlpha = Math.max(0.4, Math.min(1.0, (z2 + 150) / 250));

        const energyBoost = nodeEnergyMap.get(node.id) || 0;

        return {
          node,
          px,
          py,
          pz: z2,
          scale,
          radius,
          depthAlpha,
          energyBoost,
        };
      });

      // Quick lookup map
      const projMap = new Map<string, (typeof projectedSpheres)[0]>();
      projectedSpheres.forEach((p) => projMap.set(p.node.id, p));

      // Calculate 3D projected edges
      const projectedEdges = SPHERE_EDGES.map((edge) => {
        const p1 = projMap.get(edge.source);
        const p2 = projMap.get(edge.target);
        if (!p1 || !p2) return null;

        const avgZ = (p1.pz + p2.pz) / 2;
        const avgScale = (p1.scale + p2.scale) / 2;
        const depthAlpha = Math.max(0.18, Math.min(0.85, (avgZ + 150) / 260));
        const surge = activeSurgesMap.get(edge.id);

        return {
          edge,
          p1,
          p2,
          pz: avgZ,
          avgScale,
          depthAlpha,
          surge,
        };
      }).filter(Boolean) as {
        edge: SphereEdge3D;
        p1: (typeof projectedSpheres)[0];
        p2: (typeof projectedSpheres)[0];
        pz: number;
        avgScale: number;
        depthAlpha: number;
        surge?: { progress: number; smoothAlpha: number; headPos: number; tailPos: number };
      }[];

      // Depth sorting queue
      type RenderItem =
        | { type: "edge"; item: (typeof projectedEdges)[0]; pz: number }
        | { type: "sphere"; item: (typeof projectedSpheres)[0]; pz: number };

      const renderQueue: RenderItem[] = [
        ...projectedEdges.map((e) => ({ type: "edge" as const, item: e, pz: e.pz })),
        ...projectedSpheres.map((s) => ({ type: "sphere" as const, item: s, pz: s.pz })),
      ];

      // Sort by pz ascending
      renderQueue.sort((a, b) => a.pz - b.pz);

      // Render all items in depth order
      renderQueue.forEach((queueItem) => {
        if (queueItem.type === "edge") {
          const { p1, p2, depthAlpha, avgScale, surge } = queueItem.item;

          // Subtle base edge shadow
          ctx.strokeStyle = `rgba(27, 27, 30, ${depthAlpha * 0.12})`;
          ctx.lineWidth = Math.max(1.5, 2.5 * avgScale);
          ctx.beginPath();
          ctx.moveTo(p1.px + 1.2, p1.py + 1.2);
          ctx.lineTo(p2.px + 1.2, p2.py + 1.2);
          ctx.stroke();

          // Main cable line
          ctx.strokeStyle = `rgba(27, 27, 30, ${depthAlpha * 0.75})`;
          ctx.lineWidth = Math.max(1.2, 2.0 * avgScale);
          ctx.beginPath();
          ctx.moveTo(p1.px, p1.py);
          ctx.lineTo(p2.px, p2.py);
          ctx.stroke();

          // If cable has an active traveling light surge:
          if (surge && surge.smoothAlpha > 0.01) {
            const { smoothAlpha, headPos, tailPos } = surge;

            const x0 = p1.px + (p2.px - p1.px) * tailPos;
            const y0 = p1.py + (p2.py - p1.py) * tailPos;
            const x1 = p1.px + (p2.px - p1.px) * headPos;
            const y1 = p1.py + (p2.py - p1.py) * headPos;

            const dist = Math.hypot(x1 - x0, y1 - y0);
            if (dist > 1) {
              const beamGrad = ctx.createLinearGradient(x0, y0, x1, y1);
              beamGrad.addColorStop(0, "rgba(0, 56, 209, 0)");
              beamGrad.addColorStop(0.3, `rgba(0, 56, 209, ${0.45 * depthAlpha * smoothAlpha})`);
              beamGrad.addColorStop(0.8, `rgba(96, 165, 250, ${0.9 * depthAlpha * smoothAlpha})`);
              beamGrad.addColorStop(1, `rgba(255, 255, 255, ${1.0 * depthAlpha * smoothAlpha})`);

              // 1. Soft glowing bloom layer of the cable
              ctx.save();
              ctx.strokeStyle = `rgba(0, 56, 209, ${0.4 * depthAlpha * smoothAlpha})`;
              ctx.lineWidth = Math.max(4.0, 7.0 * avgScale);
              ctx.lineCap = "round";
              ctx.beginPath();
              ctx.moveTo(x0, y0);
              ctx.lineTo(x1, y1);
              ctx.stroke();

              // 2. High-intensity core laser light surge
              ctx.strokeStyle = beamGrad;
              ctx.lineWidth = Math.max(2.2, 3.6 * avgScale);
              ctx.lineCap = "round";
              ctx.beginPath();
              ctx.moveTo(x0, y0);
              ctx.lineTo(x1, y1);
              ctx.stroke();
              ctx.restore();
            }
          }
        } else {
          // Render Sphere
          const { node, px, py, radius, scale, depthAlpha, energyBoost } = queueItem.item;
          const isHovered = hoveredIdRef.current === node.id;
          const finalRadius = isHovered ? radius * 1.2 : radius;

          // Arrival Synaptic Shockwave Ripple when energy enters the sphere!
          if (energyBoost > 0.05) {
            const rippleRadius = finalRadius + (16 * scale * energyBoost);
            const rippleAlpha = (1 - energyBoost * 0.7) * depthAlpha * 0.75;

            ctx.save();
            ctx.strokeStyle = `rgba(59, 130, 246, ${rippleAlpha})`;
            ctx.lineWidth = Math.max(1.5, 2.5 * scale);
            ctx.beginPath();
            ctx.arc(px, py, rippleRadius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
          }

          // Ambient halo aura (boosts noticeably when energy enters!)
          const baseHalo = (node.isCore ? 10 : 7) + Math.sin(ambientPulse) * 3;
          const totalHalo = baseHalo + (15 * energyBoost);
          const auraAlpha = node.isCore ? 0.35 : 0.25;

          ctx.fillStyle = energyBoost > 0.1
            ? `rgba(96, 165, 250, ${(auraAlpha + energyBoost * 0.4) * depthAlpha})`
            : node.glowColor;
          ctx.beginPath();
          ctx.arc(px, py, finalRadius + totalHalo * scale, 0, Math.PI * 2);
          ctx.fill();

          // Neo-Brutalist Hard Drop Shadow
          const shadowDist = (node.isCore ? 4.5 : 3.0) * scale;
          ctx.fillStyle = `rgba(27, 27, 30, ${0.75 * depthAlpha})`;
          ctx.beginPath();
          ctx.arc(px + shadowDist, py + shadowDist, finalRadius, 0, Math.PI * 2);
          ctx.fill();

          // 3D Sphere Shading Gradient (Light from top-left)
          const lightOffsetX = px - finalRadius * 0.35;
          const lightOffsetY = py - finalRadius * 0.38;

          const sphereGrad = ctx.createRadialGradient(
            lightOffsetX,
            lightOffsetY,
            finalRadius * 0.08,
            px,
            py,
            finalRadius
          );

          // If receiving energy, the highlight glints with brighter energetic brilliance!
          const apexHighlight = energyBoost > 0.2 ? "#FFFFFF" : node.highlightColor;
          sphereGrad.addColorStop(0, apexHighlight);
          sphereGrad.addColorStop(0.35, node.baseColor);
          sphereGrad.addColorStop(0.85, node.shadowColor);
          sphereGrad.addColorStop(1, "#1B1B1E");

          ctx.globalAlpha = depthAlpha;
          ctx.fillStyle = sphereGrad;
          ctx.beginPath();
          ctx.arc(px, py, finalRadius, 0, Math.PI * 2);
          ctx.fill();

          // Signature Neo-Brutalist 2px Dark Border
          ctx.strokeStyle = energyBoost > 0.3 ? "#3B82F6" : "#1B1B1E";
          ctx.lineWidth = node.isCore ? 2.5 : 2.0;
          ctx.stroke();

          // Specular Glint Reflection Dot
          ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
          ctx.beginPath();
          ctx.arc(lightOffsetX, lightOffsetY, Math.max(1.5, finalRadius * 0.2), 0, Math.PI * 2);
          ctx.fill();

          ctx.globalAlpha = 1.0;
        }
      });

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Pointer Drag Interaction
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (isDraggingRef.current) {
      const dx = e.clientX - lastMousePosRef.current.x;
      const dy = e.clientY - lastMousePosRef.current.y;

      rotationRef.current.y += dx * 0.008;
      rotationRef.current.x -= dy * 0.008;

      velocityRef.current = { x: -dy * 0.003, y: dx * 0.003 };
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[400px] sm:h-[450px] lg:h-[480px] select-none flex items-center justify-center"
    >
      {/* Pure Floating 3D Graph Canvas */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="w-full h-full block cursor-grab active:cursor-grabbing touch-none relative z-10"
      />

      {/* Bottom Minimalist Floating Control: Only Orbit ON/OFF */}
      <div className="absolute bottom-2 right-2 z-20 flex items-center pointer-events-auto">
        <button
          onClick={() => setAutoRotate((prev) => !prev)}
          className={`px-3 py-1 rounded-full border text-[11px] font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            autoRotate
              ? "bg-[#EEF2FF] border-[#0038D1] text-[#0038D1] shadow-[1.5px_1.5px_0px_#0038D1]"
              : "bg-white border-[#1B1B1E] text-[#1B1B1E] shadow-[1.5px_1.5px_0px_#1B1B1E] hover:bg-[#FAF7F2]"
          }`}
          title="Toggle Auto Orbit"
        >
          <Rotate3d className="w-3 h-3" />
          <span>{autoRotate ? "Orbit: ON" : "Orbit: OFF"}</span>
        </button>
      </div>
    </div>
  );
}
