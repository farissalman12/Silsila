"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { TreeCanvas } from "@/components/tree/TreeCanvas";
import { TimelineView } from "@/components/tree/TimelineView";
import { useLayoutWorker } from "@/lib/tree/use-layout-worker";
import { useTheme } from "@/components/providers/ThemeProvider";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { formatLifeSpan } from "@/lib/utils";
import type { TreeData, LayoutResult, TreeMode, LayoutNode } from "@/lib/tree/types";
import Link from "next/link";

interface TreeViewClientProps {
  personId: string;
  personName: string;
}

export function TreeViewClient({ personId, personName }: TreeViewClientProps) {
  const router = useRouter();
  const { theme } = useTheme();
  const { computeLayout } = useLayoutWorker();

  const [treeData, setTreeData] = useState<TreeData | null>(null);
  const [layout, setLayout] = useState<LayoutResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [mode, setMode] = useState<TreeMode>("full");
  const [depth, setDepth] = useState(6);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(true);
  const [viewMode, setViewMode] = useState<"canvas" | "timeline">("canvas");

  // Fetch tree data
  const fetchTree = useCallback(async (rootId: string, treeMode: TreeMode, treeDepth: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/tree/${rootId}?mode=${treeMode}&depthUp=${treeDepth}&depthDown=${treeDepth}`);
      if (!res.ok) throw new Error("Failed to load tree data");
      const data: TreeData = await res.json();
      setTreeData(data);

      const result = await computeLayout(data);
      setLayout(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [computeLayout]);

  useEffect(() => {
    fetchTree(personId, mode, depth);
  }, [personId, mode, depth, fetchTree]);

  // Handle re-rooting on double-click
  const handleDoubleClickNode = useCallback((nodeId: string) => {
    router.push(`/tree/${nodeId}`);
  }, [router]);

  // Selected person details — check layout nodes and tree data
  const selectedPerson = selectedNodeId
    ? layout?.nodes.find((n: LayoutNode) => n.id === selectedNodeId)
      ?? (treeData?.persons.find((p) => p.id === selectedNodeId) ? { ...treeData.persons.find((p) => p.id === selectedNodeId)!, x: 0, y: 0, width: 0, height: 0 } : null)
    : null;

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedNodeId(null);
        setPanelOpen(false);
      }
      if (e.key === "f" || e.key === "F") {
        setPanelOpen((p) => !p);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-stone-50 dark:bg-stone-950">
      {/* Toolbar */}
      <div className="flex-shrink-0 h-12 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 flex items-center px-4 gap-3 overflow-x-auto">
        {/* Back */}
        <Link href={`/person/${personId}`} className="text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200 flex-shrink-0">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>

        <div className="w-px h-6 bg-stone-200 dark:bg-stone-700 flex-shrink-0" />

        {/* Title */}
        <h1 className="text-sm font-serif font-semibold text-stone-900 dark:text-stone-100 truncate flex-shrink-0">
          {personName}
        </h1>

        <div className="w-px h-6 bg-stone-200 dark:bg-stone-700 flex-shrink-0" />

        {/* Mode switcher */}
        <div className="flex items-center bg-stone-100 dark:bg-stone-800 rounded-lg p-0.5 flex-shrink-0">
          {(["ancestors", "full", "descendants"] as TreeMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors capitalize ${
                mode === m
                  ? "bg-white dark:bg-stone-700 text-amber-600 dark:text-amber-400 shadow-sm"
                  : "text-stone-500 dark:text-stone-400 hover:text-stone-700"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Depth slider */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <label className="text-xs text-stone-500 dark:text-stone-400">Depth:</label>
          <input
            type="range"
            min={1}
            max={9}
            value={depth}
            onChange={(e) => setDepth(parseInt(e.target.value, 10))}
            className="w-20 h-1 accent-amber-500"
          />
          <span className="text-xs font-mono text-stone-600 dark:text-stone-300 w-4">{depth}</span>
        </div>

        <div className="w-px h-6 bg-stone-200 dark:bg-stone-700 flex-shrink-0" />

        {/* View switcher */}
        <div className="flex items-center bg-stone-100 dark:bg-stone-800 rounded-lg p-0.5 flex-shrink-0">
          <button
            onClick={() => setViewMode("canvas")}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              viewMode === "canvas"
                ? "bg-white dark:bg-stone-700 text-amber-600 dark:text-amber-400 shadow-sm"
                : "text-stone-500 dark:text-stone-400 hover:text-stone-700"
            }`}
          >
            Tree
          </button>
          <button
            onClick={() => setViewMode("timeline")}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              viewMode === "timeline"
                ? "bg-white dark:bg-stone-700 text-amber-600 dark:text-amber-400 shadow-sm"
                : "text-stone-500 dark:text-stone-400 hover:text-stone-700"
            }`}
          >
            Timeline
          </button>
        </div>

        <div className="flex-1" />

        {/* Panel toggle */}
        <button
          onClick={() => setPanelOpen(!panelOpen)}
          className="p-1.5 rounded-lg text-stone-500 hover:text-stone-700 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800 transition-colors flex-shrink-0"
          aria-label="Toggle panel"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
          </svg>
        </button>
      </div>

      {/* Main area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Canvas */}
        <div className="flex-1 relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-stone-50/80 dark:bg-stone-950/80 z-20">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-stone-500 dark:text-stone-400">Computing layout...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <div className="text-center p-6 bg-white dark:bg-stone-900 rounded-card shadow-lg border border-red-200 dark:border-red-800">
                <p className="text-red-600 dark:text-red-400 font-medium mb-2">Error loading tree</p>
                <p className="text-sm text-stone-500">{error}</p>
                <button onClick={() => fetchTree(personId, mode, depth)} className="mt-3 px-4 py-1.5 text-sm bg-amber-500 text-white rounded-lg">
                  Retry
                </button>
              </div>
            </div>
          )}

          {!loading && viewMode === "canvas" && layout && (
            <TreeCanvas
              layout={layout}
              selectedNodeId={selectedNodeId}
              onSelectNode={setSelectedNodeId}
              onDoubleClickNode={handleDoubleClickNode}
              isDark={theme === "dark"}
            />
          )}

          {!loading && viewMode === "timeline" && treeData && (
            <TimelineView
              treeData={treeData}
              isDark={theme === "dark"}
              onSelectNode={setSelectedNodeId}
              selectedNodeId={selectedNodeId}
            />
          )}
        </div>

        {/* Side panel */}
        {panelOpen && (
          <aside className="w-72 flex-shrink-0 bg-white dark:bg-stone-900 border-l border-stone-200 dark:border-stone-800 overflow-y-auto">
            {selectedPerson ? (
              <div className="p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <Avatar
                    name={selectedPerson.fullName}
                    gender={selectedPerson.gender}
                    size="lg"
                    src={selectedPerson.photoUrl}
                  />
                  <div className="flex-1 min-w-0">
                    <h2 className="font-serif font-bold text-stone-900 dark:text-stone-100 text-sm leading-tight">
                      {selectedPerson.fullName}
                    </h2>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                      {formatLifeSpan(selectedPerson.birthYear, selectedPerson.deathYear, selectedPerson.isLiving)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {selectedPerson.gender !== "unknown" && (
                    <Badge variant={selectedPerson.gender === "male" ? "blue" : "pink"} size="sm">
                      {selectedPerson.gender}
                    </Badge>
                  )}
                  {selectedPerson.villageName && (
                    <Badge variant="stone" size="sm">{selectedPerson.villageName}</Badge>
                  )}
                  {selectedPerson.clanName && (
                    <Badge variant="amber" size="sm">{selectedPerson.clanName}</Badge>
                  )}
                  {selectedPerson.verified && (
                    <Badge variant="success" size="sm">Verified</Badge>
                  )}
                </div>

                <div className="pt-3 border-t border-stone-200 dark:border-stone-700 space-y-2">
                  <Link
                    href={`/person/${selectedPerson.id}`}
                    className="block w-full text-center py-2 text-sm font-medium bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
                  >
                    View Full Profile
                  </Link>
                  <button
                    onClick={() => handleDoubleClickNode(selectedPerson.id)}
                    className="block w-full text-center py-2 text-sm font-medium border border-stone-300 dark:border-stone-600 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                  >
                    Set as Root
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-5 text-center">
                <svg className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <p className="text-sm text-stone-500 dark:text-stone-400 font-medium">Click a person</p>
                <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">Select a node to see details</p>
              </div>
            )}
          </aside>
        )}
      </div>

      {/* Status bar */}
      <div className="flex-shrink-0 h-7 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 flex items-center px-4 gap-4 text-xs text-stone-500 dark:text-stone-400">
        <span>{treeData?.meta.totalNodes || 0} nodes</span>
        <span>·</span>
        <span>Mode: {mode}</span>
        <span>·</span>
        <span>Depth: {depth}</span>
        {treeData && (
          <>
            <span>·</span>
            <span>↑{treeData.meta.maxDepthUp} ↓{treeData.meta.maxDepthDown} generations</span>
          </>
        )}
        <div className="flex-1" />
        <span className="text-stone-400 dark:text-stone-500">Scroll to zoom · Drag to pan · Click to select · Double-click to re-root</span>
      </div>
    </div>
  );
}
