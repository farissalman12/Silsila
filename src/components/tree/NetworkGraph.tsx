"use client";

import { useRef, useEffect, useCallback, useState } from "react";

interface NetworkNode {
  id: string;
  fullName: string;
  gender: string;
  villageName: string | null;
  villageId: string | null;
  // Simulation state
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface NetworkEdge {
  source: string;
  target: string;
  type: string;
}

interface NetworkGraphProps {
  persons: {
    id: string;
    fullName: string;
    gender: string;
    village: { name: string; slug: string } | null;
    villageId: string | null;
  }[];
  relationships: {
    personAId: string;
    personBId: string;
    relationshipType: string;
  }[];
  villages: { id: string; name: string; slug: string }[];
}

// Village cluster colors
const VILLAGE_COLORS = [
  "#F59E0B", "#14B8A6", "#3B82F6", "#EC4899", "#8B5CF6",
  "#EF4444", "#06B6D4", "#84CC16",
];

export function NetworkGraph({ persons, relationships, villages }: NetworkGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ w: 800, h: 600 });
  const nodesRef = useRef<NetworkNode[]>([]);
  const edgesRef = useRef<NetworkEdge[]>([]);
  const cameraRef = useRef({ x: 0, y: 0, zoom: 1 });
  const dragRef = useRef({ isDragging: false, startX: 0, startY: 0, camX: 0, camY: 0 });
  const animRef = useRef(0);
  const simulationRef = useRef({ running: true, iteration: 0 });
  const [hoveredNode, setHoveredNode] = useState<NetworkNode | null>(null);

  const villageColorMap = useRef(new Map<string, string>());

  // Initialize nodes & edges
  useEffect(() => {
    const vMap = new Map<string, string>();
    villages.forEach((v, i) => {
      vMap.set(v.id, VILLAGE_COLORS[i % VILLAGE_COLORS.length]);
    });
    villageColorMap.current = vMap;

    // Create nodes with random initial positions clustered by village
    const villageAngles = new Map<string, number>();
    villages.forEach((v, i) => {
      villageAngles.set(v.id, (i / villages.length) * Math.PI * 2);
    });

    nodesRef.current = persons.map((p) => {
      const angle = villageAngles.get(p.villageId || "") || Math.random() * Math.PI * 2;
      const radius = 150 + Math.random() * 100;
      return {
        id: p.id,
        fullName: p.fullName,
        gender: p.gender,
        villageName: p.village?.name || null,
        villageId: p.villageId,
        x: Math.cos(angle) * radius + (Math.random() - 0.5) * 80,
        y: Math.sin(angle) * radius + (Math.random() - 0.5) * 80,
        vx: 0,
        vy: 0,
      };
    });

    const personSet = new Set(persons.map((p) => p.id));
    edgesRef.current = relationships
      .filter((r) => personSet.has(r.personAId) && personSet.has(r.personBId))
      .map((r) => ({
        source: r.personAId,
        target: r.personBId,
        type: r.relationshipType,
      }));

    simulationRef.current = { running: true, iteration: 0 };

    // Center camera
    cameraRef.current = { x: -canvasSize.w / 2, y: -canvasSize.h / 2, zoom: 1.2 };
  }, [persons, relationships, villages, canvasSize]);

  // Resize
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setCanvasSize({ w: Math.floor(width), h: Math.floor(height) });
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Force simulation + render
  const simulate = useCallback(() => {
    const nodes = nodesRef.current;
    const edges = edgesRef.current;
    const sim = simulationRef.current;

    if (sim.running && sim.iteration < 300) {
      const alpha = Math.max(0.001, 1 - sim.iteration / 300);
      sim.iteration++;

      // Build adjacency
      const nodeMap = new Map<string, NetworkNode>();
      for (const n of nodes) nodeMap.set(n.id, n);

      // Repulsion (simplified Barnes-Hut)
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x;
          const dy = nodes[j].y - nodes[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = (800 * alpha) / (dist * dist);
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          nodes[i].vx -= fx;
          nodes[i].vy -= fy;
          nodes[j].vx += fx;
          nodes[j].vy += fy;
        }
      }

      // Attraction along edges
      for (const edge of edges) {
        const a = nodeMap.get(edge.source);
        const b = nodeMap.get(edge.target);
        if (!a || !b) continue;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = (dist - 40) * 0.01 * alpha;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        a.vx += fx;
        a.vy += fy;
        b.vx -= fx;
        b.vy -= fy;
      }

      // Village clustering
      const villageCentroids = new Map<string, { x: number; y: number; count: number }>();
      for (const n of nodes) {
        if (!n.villageId) continue;
        const c = villageCentroids.get(n.villageId) || { x: 0, y: 0, count: 0 };
        c.x += n.x;
        c.y += n.y;
        c.count++;
        villageCentroids.set(n.villageId, c);
      }
      for (const n of nodes) {
        if (!n.villageId) continue;
        const c = villageCentroids.get(n.villageId);
        if (!c) continue;
        const cx = c.x / c.count;
        const cy = c.y / c.count;
        n.vx += (cx - n.x) * 0.005 * alpha;
        n.vy += (cy - n.y) * 0.005 * alpha;
      }

      // Apply velocity
      for (const n of nodes) {
        n.vx *= 0.6;
        n.vy *= 0.6;
        n.x += n.vx;
        n.y += n.vy;
      }
    }

    // Render
    const canvas = canvasRef.current;
    if (!canvas) { animRef.current = requestAnimationFrame(simulate); return; }
    const ctx = canvas.getContext("2d");
    if (!ctx) { animRef.current = requestAnimationFrame(simulate); return; }

    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvasSize.w * dpr;
    canvas.height = canvasSize.h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cam = cameraRef.current;
    ctx.fillStyle = "#FAFAF9";
    ctx.fillRect(0, 0, canvasSize.w, canvasSize.h);

    ctx.save();
    ctx.translate(-cam.x * cam.zoom, -cam.y * cam.zoom);
    ctx.scale(cam.zoom, cam.zoom);

    // Edges
    const nodeMap = new Map<string, NetworkNode>();
    for (const n of nodes) nodeMap.set(n.id, n);

    ctx.strokeStyle = "#E7E5E4";
    ctx.lineWidth = 0.5;
    for (const edge of edges) {
      const a = nodeMap.get(edge.source);
      const b = nodeMap.get(edge.target);
      if (!a || !b) continue;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }

    // Nodes
    for (const n of nodes) {
      const color = villageColorMap.current.get(n.villageId || "") || "#A8A29E";
      const isHovered = hoveredNode?.id === n.id;

      ctx.beginPath();
      ctx.arc(n.x, n.y, isHovered ? 7 : 4, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      if (isHovered) {
        ctx.strokeStyle = "#1C1917";
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Label at zoom
      if (cam.zoom > 1.5 || isHovered) {
        ctx.fillStyle = "#1C1917";
        ctx.font = `${isHovered ? "600" : "400"} ${isHovered ? 10 : 8}px 'Inter', sans-serif`;
        ctx.textAlign = "center";
        const label = n.fullName.length > 16 ? n.fullName.slice(0, 14) + "…" : n.fullName;
        ctx.fillText(label, n.x, n.y + (isHovered ? 14 : 11));
      }
    }

    ctx.restore();

    // Village legend
    const legendX = 16;
    let legendY = canvasSize.h - 16 - villages.length * 20;
    ctx.fillStyle = "rgba(250,250,249,0.9)";
    ctx.strokeStyle = "#D6D3D1";
    ctx.lineWidth = 1;
    const lw = 130;
    const lh = villages.length * 20 + 12;
    ctx.fillRect(legendX, legendY - 4, lw, lh);
    ctx.strokeRect(legendX, legendY - 4, lw, lh);

    ctx.font = "600 9px 'Inter', sans-serif";
    ctx.fillStyle = "#78716C";
    ctx.textAlign = "left";
    ctx.fillText("VILLAGES", legendX + 8, legendY + 8);
    legendY += 18;

    for (let i = 0; i < villages.length; i++) {
      const color = VILLAGE_COLORS[i % VILLAGE_COLORS.length];
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(legendX + 14, legendY + i * 18, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#1C1917";
      ctx.font = "400 10px 'Inter', sans-serif";
      ctx.fillText(villages[i].name, legendX + 24, legendY + i * 18 + 4);
    }

    animRef.current = requestAnimationFrame(simulate);
  }, [canvasSize, hoveredNode, villages]);

  useEffect(() => {
    animRef.current = requestAnimationFrame(simulate);
    return () => cancelAnimationFrame(animRef.current);
  }, [simulate]);

  // Interactions
  const hitTest = useCallback((cx: number, cy: number): NetworkNode | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const cam = cameraRef.current;
    const wx = (cx - rect.left) / cam.zoom + cam.x;
    const wy = (cy - rect.top) / cam.zoom + cam.y;
    for (const n of nodesRef.current) {
      const dx = wx - n.x;
      const dy = wy - n.y;
      if (dx * dx + dy * dy <= 100) return n;
    }
    return null;
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full relative" style={{ touchAction: "none" }}>
      <canvas
        ref={canvasRef}
        style={{ width: canvasSize.w, height: canvasSize.h, cursor: "grab" }}
        onMouseDown={(e) => {
          dragRef.current = { isDragging: true, startX: e.clientX, startY: e.clientY, camX: cameraRef.current.x, camY: cameraRef.current.y };
        }}
        onMouseMove={(e) => {
          const d = dragRef.current;
          if (d.isDragging) {
            const cam = cameraRef.current;
            cam.x = d.camX - (e.clientX - d.startX) / cam.zoom;
            cam.y = d.camY - (e.clientY - d.startY) / cam.zoom;
          } else {
            const n = hitTest(e.clientX, e.clientY);
            setHoveredNode(n);
            if (canvasRef.current) canvasRef.current.style.cursor = n ? "pointer" : "grab";
          }
        }}
        onMouseUp={() => { dragRef.current.isDragging = false; }}
        onMouseLeave={() => { dragRef.current.isDragging = false; setHoveredNode(null); }}
        onWheel={(e) => {
          e.preventDefault();
          const cam = cameraRef.current;
          const rect = canvasRef.current!.getBoundingClientRect();
          const mx = e.clientX - rect.left;
          const my = e.clientY - rect.top;
          const wxBefore = mx / cam.zoom + cam.x;
          const wyBefore = my / cam.zoom + cam.y;
          cam.zoom = Math.max(0.2, Math.min(6, cam.zoom * (1 - e.deltaY * 0.001)));
          cam.x = wxBefore - mx / cam.zoom;
          cam.y = wyBefore - my / cam.zoom;
        }}
        onClick={(e) => {
          const n = hitTest(e.clientX, e.clientY);
          if (n) {
            window.location.href = `/tree/${n.id}`;
          }
        }}
      />

      {/* Hover tooltip */}
      {hoveredNode && (
        <div className="absolute top-4 right-4 p-3 bg-white rounded-lg shadow-lg border border-stone-200 text-sm">
          <p className="font-serif font-semibold text-stone-900">{hoveredNode.fullName}</p>
          {hoveredNode.villageName && (
            <p className="text-xs text-stone-500 mt-0.5">{hoveredNode.villageName}</p>
          )}
          <p className="text-xs text-amber-600 mt-1">Click to view tree →</p>
        </div>
      )}
    </div>
  );
}
