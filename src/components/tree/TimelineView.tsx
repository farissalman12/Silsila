"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import type { TreeData, TreePerson } from "@/lib/tree/types";

const TIMELINE_NODE_R = 8;
const TIMELINE_NODE_R_HOVER = 12;
const GEN_ROW_HEIGHT = 80;
const YEAR_COL_WIDTH = 12; // pixels per year
const PADDING = 60;

const GENDER_COLORS = {
  male: { fill: "#DBEAFE", stroke: "#3B82F6" },
  female: { fill: "#FCE7F3", stroke: "#EC4899" },
  unknown: { fill: "#F5F5F4", stroke: "#A8A29E" },
};

const GENDER_COLORS_DARK = {
  male: { fill: "#1E3A5F", stroke: "#60A5FA" },
  female: { fill: "#4A1942", stroke: "#F472B6" },
  unknown: { fill: "#292524", stroke: "#78716C" },
};

interface TimelineViewProps {
  treeData: TreeData;
  isDark: boolean;
  onSelectNode: (id: string | null) => void;
  selectedNodeId: string | null;
}

interface PlottedNode {
  person: TreePerson;
  x: number;
  y: number;
}

export function TimelineView({ treeData, isDark, onSelectNode, selectedNodeId }: TimelineViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ w: 800, h: 600 });
  const cameraRef = useRef({ x: 0, y: 0, zoom: 1 });
  const dragRef = useRef({ isDragging: false, startX: 0, startY: 0, camX: 0, camY: 0 });
  const hoveredRef = useRef<string | null>(null);
  const animRef = useRef(0);

  // Compute plotted positions
  const plottedNodes = useRef<PlottedNode[]>([]);

  useEffect(() => {
    // Determine year range
    const years = treeData.persons
      .map((p) => p.birthYear)
      .filter((y): y is number => y !== null);
    if (years.length === 0) return;

    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);

    // Determine generation range
    const gens = treeData.persons.map((p) => p.generation);
    const minGen = Math.min(...gens);

    const nodes: PlottedNode[] = treeData.persons
      .filter((p) => p.birthYear !== null)
      .map((person) => ({
        person,
        x: PADDING + (person.birthYear! - minYear) * YEAR_COL_WIDTH,
        y: PADDING + (person.generation - minGen) * GEN_ROW_HEIGHT,
      }));

    plottedNodes.current = nodes;

    // Center camera
    const cam = cameraRef.current;
    const totalW = (maxYear - minYear) * YEAR_COL_WIDTH + PADDING * 2;
    const totalH = (Math.max(...gens) - minGen + 1) * GEN_ROW_HEIGHT + PADDING * 2;
    cam.zoom = Math.min(canvasSize.w / totalW, canvasSize.h / totalH, 1.5);
    cam.x = -(canvasSize.w / cam.zoom - totalW) / 2;
    cam.y = -(canvasSize.h / cam.zoom - totalH) / 2;
  }, [treeData, canvasSize]);

  // Resize observer
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

  // Render
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvasSize.w * dpr;
    canvas.height = canvasSize.h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cam = cameraRef.current;
    ctx.fillStyle = isDark ? "#1C1917" : "#FAFAF9";
    ctx.fillRect(0, 0, canvasSize.w, canvasSize.h);

    ctx.save();
    ctx.translate(-cam.x * cam.zoom, -cam.y * cam.zoom);
    ctx.scale(cam.zoom, cam.zoom);

    // Year axis
    const years = treeData.persons
      .map((p) => p.birthYear)
      .filter((y): y is number => y !== null);
    if (years.length > 0) {
      const minYear = Math.min(...years);
      const maxYear = Math.max(...years);
      const step = maxYear - minYear > 100 ? 20 : 10;

      ctx.font = "10px 'Inter', sans-serif";
      ctx.textAlign = "center";
      ctx.fillStyle = isDark ? "#78716C" : "#A8A29E";

      for (let yr = Math.floor(minYear / step) * step; yr <= maxYear + step; yr += step) {
        const x = PADDING + (yr - minYear) * YEAR_COL_WIDTH;
        ctx.strokeStyle = isDark ? "#292524" : "#E7E5E4";
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvasSize.h / cam.zoom + cam.y);
        ctx.stroke();
        ctx.fillText(yr.toString(), x, PADDING - 10);
      }
    }

    // Draw edges connecting parents to children
    const personPositions = new Map<string, { x: number; y: number }>();
    for (const pn of plottedNodes.current) {
      personPositions.set(pn.person.id, { x: pn.x, y: pn.y });
    }

    ctx.strokeStyle = isDark ? "#57534E" : "#D6D3D1";
    ctx.lineWidth = 1;
    for (const edge of treeData.edges) {
      if (edge.type !== "parent-child") continue;
      const from = personPositions.get(edge.from);
      const to = personPositions.get(edge.to);
      if (from && to) {
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
      }
    }

    // Draw nodes
    const colors = isDark ? GENDER_COLORS_DARK : GENDER_COLORS;
    for (const pn of plottedNodes.current) {
      const isSelected = pn.person.id === selectedNodeId;
      const isHovered = pn.person.id === hoveredRef.current;
      const r = isHovered ? TIMELINE_NODE_R_HOVER : TIMELINE_NODE_R;
      const c = colors[pn.person.gender];

      ctx.beginPath();
      ctx.arc(pn.x, pn.y, r, 0, Math.PI * 2);
      ctx.fillStyle = c.fill;
      ctx.fill();
      ctx.strokeStyle = isSelected ? "#F59E0B" : c.stroke;
      ctx.lineWidth = isSelected ? 3 : isHovered ? 2 : 1.5;
      ctx.stroke();

      // Label (only at sufficient zoom)
      if (cam.zoom > 0.5) {
        ctx.fillStyle = isDark ? "#FAFAF9" : "#1C1917";
        ctx.font = `${isHovered ? "600" : "400"} 9px 'Inter', sans-serif`;
        ctx.textAlign = "center";
        const label = pn.person.fullName.length > 14 ? pn.person.fullName.slice(0, 12) + "…" : pn.person.fullName;
        ctx.fillText(label, pn.x, pn.y + r + 12);
      }
    }

    ctx.restore();
    animRef.current = requestAnimationFrame(render);
  }, [canvasSize, treeData, isDark, selectedNodeId]);

  useEffect(() => {
    animRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animRef.current);
  }, [render]);

  // Hit test
  const hitTest = useCallback((clientX: number, clientY: number): TreePerson | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const cam = cameraRef.current;
    const wx = (clientX - rect.left) / cam.zoom + cam.x;
    const wy = (clientY - rect.top) / cam.zoom + cam.y;

    for (const pn of plottedNodes.current) {
      const dx = wx - pn.x;
      const dy = wy - pn.y;
      if (dx * dx + dy * dy <= (TIMELINE_NODE_R_HOVER + 2) ** 2) return pn.person;
    }
    return null;
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    dragRef.current = { isDragging: true, startX: e.clientX, startY: e.clientY, camX: cameraRef.current.x, camY: cameraRef.current.y };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const d = dragRef.current;
    if (d.isDragging) {
      const cam = cameraRef.current;
      cam.x = d.camX - (e.clientX - d.startX) / cam.zoom;
      cam.y = d.camY - (e.clientY - d.startY) / cam.zoom;
      return;
    }
    const node = hitTest(e.clientX, e.clientY);
    hoveredRef.current = node?.id ?? null;
    if (canvasRef.current) canvasRef.current.style.cursor = node ? "pointer" : "grab";
  }, [hitTest]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    const d = dragRef.current;
    const moved = Math.abs(e.clientX - d.startX) + Math.abs(e.clientY - d.startY);
    d.isDragging = false;
    if (moved < 4) {
      const node = hitTest(e.clientX, e.clientY);
      onSelectNode(node?.id ?? null);
    }
  }, [hitTest, onSelectNode]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const cam = cameraRef.current;
    const rect = canvasRef.current!.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const wxBefore = mx / cam.zoom + cam.x;
    const wyBefore = my / cam.zoom + cam.y;
    cam.zoom = Math.max(0.1, Math.min(5, cam.zoom * (1 - e.deltaY * 0.001)));
    cam.x = wxBefore - mx / cam.zoom;
    cam.y = wyBefore - my / cam.zoom;
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full" style={{ touchAction: "none" }}>
      <canvas
        ref={canvasRef}
        style={{ width: canvasSize.w, height: canvasSize.h, cursor: "grab" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => { dragRef.current.isDragging = false; }}
        onWheel={handleWheel}
      />
    </div>
  );
}
