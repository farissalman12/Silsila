"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import type { LayoutResult, LayoutNode, LayoutEdge } from "@/lib/tree/types";

// ============================================================
// Constants
// ============================================================
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 4;
const ZOOM_SENSITIVITY = 0.001;
const MINIMAP_W = 150;
const MINIMAP_H = 100;
const MINIMAP_MARGIN = 16;

// Colors
const COLORS = {
  bg: "#FAFAF9",
  bgDark: "#1C1917",
  node: { male: "#DBEAFE", female: "#FCE7F3", unknown: "#F5F5F4" },
  nodeBorder: { male: "#3B82F6", female: "#EC4899", unknown: "#A8A29E" },
  nodeBorderDark: { male: "#60A5FA", female: "#F472B6", unknown: "#78716C" },
  edge: "#D6D3D1",
  edgeDark: "#57534E",
  spouseEdge: "#F59E0B",
  selectedBorder: "#F59E0B",
  hoverBorder: "#D97706",
  text: "#1C1917",
  textDark: "#FAFAF9",
  textMuted: "#78716C",
  generationLine: "#E7E5E4",
  generationLineDark: "#292524",
  minimap: { bg: "rgba(250,250,249,0.9)", viewport: "rgba(245,158,11,0.3)", border: "rgba(245,158,11,0.6)" },
};

export interface TreeCanvasProps {
  layout: LayoutResult;
  selectedNodeId: string | null;
  onSelectNode: (id: string | null) => void;
  onDoubleClickNode: (id: string) => void;
  isDark: boolean;
}

export function TreeCanvas({ layout, selectedNodeId, onSelectNode, onDoubleClickNode, isDark }: TreeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Camera state
  const cameraRef = useRef({ x: 0, y: 0, zoom: 0.8 });
  const dragRef = useRef({ isDragging: false, startX: 0, startY: 0, startCamX: 0, startCamY: 0 });
  const hoveredNodeRef = useRef<string | null>(null);
  const animFrameRef = useRef<number>(0);

  const [canvasSize, setCanvasSize] = useState({ w: 800, h: 600 });

  // Resize observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setCanvasSize({ w: Math.floor(width), h: Math.floor(height) });
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Center camera on initial load
  useEffect(() => {
    if (layout.nodes.length === 0) return;
    const bounds = layout.bounds;
    const cam = cameraRef.current;
    const scaleX = canvasSize.w / (bounds.width + 200);
    const scaleY = canvasSize.h / (bounds.height + 200);
    cam.zoom = Math.min(scaleX, scaleY, 1);
    cam.x = bounds.minX + bounds.width / 2 - canvasSize.w / (2 * cam.zoom);
    cam.y = bounds.minY + bounds.height / 2 - canvasSize.h / (2 * cam.zoom);
  }, [layout, canvasSize]);

  // ============================================================
  // Render loop
  // ============================================================
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
    const zoom = cam.zoom;

    // Clear
    ctx.fillStyle = isDark ? COLORS.bgDark : COLORS.bg;
    ctx.fillRect(0, 0, canvasSize.w, canvasSize.h);

    ctx.save();
    ctx.translate(-cam.x * zoom, -cam.y * zoom);
    ctx.scale(zoom, zoom);

    // --- Generation ruler lines ---
    if (zoom > 0.2) {
      const generations = new Set(layout.nodes.map((n) => n.y));
      ctx.strokeStyle = isDark ? COLORS.generationLineDark : COLORS.generationLine;
      ctx.lineWidth = 1;
      ctx.setLineDash([6, 4]);
      for (const genY of generations) {
        ctx.beginPath();
        ctx.moveTo(layout.bounds.minX - 50, genY + layout.nodes[0]?.height / 2);
        ctx.lineTo(layout.bounds.maxX + 50, genY + layout.nodes[0]?.height / 2);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }

    // --- Draw edges ---
    for (const edge of layout.edges) {
      drawEdge(ctx, edge, zoom, isDark);
    }

    // --- Draw nodes ---
    for (const node of layout.nodes) {
      const isSelected = node.id === selectedNodeId;
      const isHovered = node.id === hoveredNodeRef.current;
      drawNode(ctx, node, zoom, isDark, isSelected, isHovered);
    }

    ctx.restore();

    // --- Minimap ---
    drawMinimap(ctx, canvasSize.w, canvasSize.h, cam, layout, isDark);

    animFrameRef.current = requestAnimationFrame(render);
  }, [canvasSize, layout, selectedNodeId, isDark]);

  useEffect(() => {
    animFrameRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [render]);

  // ============================================================
  // Hit testing
  // ============================================================
  const hitTest = useCallback(
    (clientX: number, clientY: number): LayoutNode | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      const cam = cameraRef.current;
      const worldX = (clientX - rect.left) / cam.zoom + cam.x;
      const worldY = (clientY - rect.top) / cam.zoom + cam.y;

      for (let i = layout.nodes.length - 1; i >= 0; i--) {
        const node = layout.nodes[i];
        if (worldX >= node.x && worldX <= node.x + node.width && worldY >= node.y && worldY <= node.y + node.height) {
          return node;
        }
      }
      return null;
    },
    [layout.nodes]
  );

  // ============================================================
  // Event handlers
  // ============================================================
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const drag = dragRef.current;
    drag.isDragging = true;
    drag.startX = e.clientX;
    drag.startY = e.clientY;
    drag.startCamX = cameraRef.current.x;
    drag.startCamY = cameraRef.current.y;
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const drag = dragRef.current;
      if (drag.isDragging) {
        const cam = cameraRef.current;
        cam.x = drag.startCamX - (e.clientX - drag.startX) / cam.zoom;
        cam.y = drag.startCamY - (e.clientY - drag.startY) / cam.zoom;
        return;
      }
      // Hover
      const node = hitTest(e.clientX, e.clientY);
      hoveredNodeRef.current = node?.id ?? null;
      const canvas = canvasRef.current;
      if (canvas) canvas.style.cursor = node ? "pointer" : "grab";
    },
    [hitTest]
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      const drag = dragRef.current;
      const moved = Math.abs(e.clientX - drag.startX) + Math.abs(e.clientY - drag.startY);
      drag.isDragging = false;

      if (moved < 4) {
        const node = hitTest(e.clientX, e.clientY);
        onSelectNode(node?.id ?? null);
      }
    },
    [hitTest, onSelectNode]
  );

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      const node = hitTest(e.clientX, e.clientY);
      if (node) onDoubleClickNode(node.id);
    },
    [hitTest, onDoubleClickNode]
  );

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const cam = cameraRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const worldXBefore = mouseX / cam.zoom + cam.x;
    const worldYBefore = mouseY / cam.zoom + cam.y;

    const delta = -e.deltaY * ZOOM_SENSITIVITY;
    cam.zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, cam.zoom * (1 + delta)));

    cam.x = worldXBefore - mouseX / cam.zoom;
    cam.y = worldYBefore - mouseY / cam.zoom;
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden" style={{ touchAction: "none" }}>
      <canvas
        ref={canvasRef}
        width={canvasSize.w}
        height={canvasSize.h}
        style={{ width: canvasSize.w, height: canvasSize.h, cursor: "grab" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => { dragRef.current.isDragging = false; }}
        onDoubleClick={handleDoubleClick}
        onWheel={handleWheel}
      />

      {/* Hover tooltip */}
      {hoveredNodeRef.current && (() => {
        const node = layout.nodes.find((n) => n.id === hoveredNodeRef.current);
        if (!node) return null;
        const cam = cameraRef.current;
        const tipX = (node.x - cam.x) * cam.zoom + node.width * cam.zoom / 2;
        const tipY = (node.y - cam.y) * cam.zoom - 8;
        return (
          <div
            className="absolute pointer-events-none px-2.5 py-1.5 rounded-md text-xs font-medium bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-lg whitespace-nowrap z-10"
            style={{ left: tipX, top: tipY, transform: "translate(-50%, -100%)" }}
          >
            <span className="font-semibold">{node.fullName}</span>
            {node.birthYear && <span className="text-stone-400 dark:text-stone-500 ml-1.5">b.{node.birthYear}</span>}
            {node.villageName && <span className="text-stone-400 dark:text-stone-500 ml-1.5">· {node.villageName}</span>}
          </div>
        );
      })()}
    </div>
  );
}

// ============================================================
// Drawing functions
// ============================================================

function drawNode(
  ctx: CanvasRenderingContext2D,
  node: LayoutNode,
  zoom: number,
  isDark: boolean,
  isSelected: boolean,
  isHovered: boolean
) {
  const { x, y, width, height } = node;
  const r = 8;

  // Background
  const genderKey = node.gender as keyof typeof COLORS.node;
  ctx.fillStyle = isDark
    ? (node.gender === "male" ? "#1E3A5F" : node.gender === "female" ? "#4A1942" : "#292524")
    : COLORS.node[genderKey];

  roundRect(ctx, x, y, width, height, r);
  ctx.fill();

  // Border
  if (isSelected) {
    ctx.strokeStyle = COLORS.selectedBorder;
    ctx.lineWidth = 3;
  } else if (isHovered) {
    ctx.strokeStyle = COLORS.hoverBorder;
    ctx.lineWidth = 2;
  } else {
    ctx.strokeStyle = isDark ? COLORS.nodeBorderDark[genderKey] : COLORS.nodeBorder[genderKey];
    ctx.lineWidth = 1.5;
  }
  roundRect(ctx, x, y, width, height, r);
  ctx.stroke();

  // Progressive detail
  if (zoom < 0.3) return; // dots only at very low zoom

  // Name
  const fontSize = Math.max(11, Math.min(13, 13));
  ctx.fillStyle = isDark ? COLORS.textDark : COLORS.text;
  ctx.font = `600 ${fontSize}px 'Inter', system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const nameText = node.fullName.length > 18 ? node.fullName.slice(0, 16) + "…" : node.fullName;
  ctx.fillText(nameText, x + width / 2, y + height / 2 - 10);

  if (zoom < 0.5) return; // name only at medium zoom

  // Years
  ctx.fillStyle = COLORS.textMuted;
  ctx.font = `400 ${fontSize - 2}px 'Inter', system-ui, sans-serif`;
  const years = node.birthYear
    ? node.isLiving
      ? `b. ${node.birthYear}`
      : `${node.birthYear} – ${node.deathYear || "?"}`
    : "";
  if (years) ctx.fillText(years, x + width / 2, y + height / 2 + 6);

  // Village
  if (zoom > 0.7 && node.villageName) {
    ctx.font = `400 ${fontSize - 3}px 'Inter', system-ui, sans-serif`;
    ctx.fillText(node.villageName, x + width / 2, y + height / 2 + 20);
  }

  // Verified badge
  if (node.verified) {
    ctx.fillStyle = "#F59E0B";
    ctx.beginPath();
    ctx.arc(x + width - 12, y + 12, 5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawEdge(ctx: CanvasRenderingContext2D, edge: LayoutEdge, _zoom: number, isDark: boolean) {
  ctx.beginPath();

  if (edge.type === "spouse") {
    // Horizontal dashed line for spouses
    ctx.strokeStyle = COLORS.spouseEdge;
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 3]);
    ctx.moveTo(edge.x1, edge.y1);
    ctx.lineTo(edge.x2, edge.y2);
  } else {
    // Elbow connector for parent-child
    ctx.strokeStyle = isDark ? COLORS.edgeDark : COLORS.edge;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([]);
    const midY = (edge.y1 + edge.y2) / 2;
    ctx.moveTo(edge.x1, edge.y1);
    ctx.lineTo(edge.x1, midY);
    ctx.lineTo(edge.x2, midY);
    ctx.lineTo(edge.x2, edge.y2);
  }

  ctx.stroke();
  ctx.setLineDash([]);
}

function drawMinimap(
  ctx: CanvasRenderingContext2D,
  canvasW: number,
  canvasH: number,
  cam: { x: number; y: number; zoom: number },
  layout: LayoutResult,
  isDark: boolean
) {
  if (layout.nodes.length === 0) return;

  const mx = canvasW - MINIMAP_W - MINIMAP_MARGIN;
  const my = canvasH - MINIMAP_H - MINIMAP_MARGIN;

  // Background
  ctx.fillStyle = isDark ? "rgba(28,25,23,0.9)" : COLORS.minimap.bg;
  ctx.strokeStyle = isDark ? "#44403C" : "#D6D3D1";
  ctx.lineWidth = 1;
  roundRect(ctx, mx, my, MINIMAP_W, MINIMAP_H, 6);
  ctx.fill();
  roundRect(ctx, mx, my, MINIMAP_W, MINIMAP_H, 6);
  ctx.stroke();

  // Scale to fit all nodes
  const bounds = layout.bounds;
  const scaleX = (MINIMAP_W - 8) / (bounds.width || 1);
  const scaleY = (MINIMAP_H - 8) / (bounds.height || 1);
  const scale = Math.min(scaleX, scaleY);

  const offsetX = mx + 4 + ((MINIMAP_W - 8) - bounds.width * scale) / 2 - bounds.minX * scale;
  const offsetY = my + 4 + ((MINIMAP_H - 8) - bounds.height * scale) / 2 - bounds.minY * scale;

  // Draw nodes as dots
  for (const node of layout.nodes) {
    const nx = node.x * scale + offsetX;
    const ny = node.y * scale + offsetY;
    ctx.fillStyle = node.gender === "male" ? "#3B82F6" : node.gender === "female" ? "#EC4899" : "#A8A29E";
    ctx.fillRect(nx, ny, Math.max(2, node.width * scale), Math.max(1, node.height * scale));
  }

  // Viewport rect
  const vpX = cam.x * scale + offsetX;
  const vpY = cam.y * scale + offsetY;
  const vpW = (canvasW / cam.zoom) * scale;
  const vpH = (canvasH / cam.zoom) * scale;

  ctx.fillStyle = COLORS.minimap.viewport;
  ctx.fillRect(vpX, vpY, vpW, vpH);
  ctx.strokeStyle = COLORS.minimap.border;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(vpX, vpY, vpW, vpH);
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
