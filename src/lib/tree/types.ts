/**
 * Shared types for the family tree visualization engine.
 * Used by: data layer, layout engine, canvas renderer, and API routes.
 */

/** A node in the tree data structure (before layout) */
export interface TreePerson {
  id: string;
  fullName: string;
  gender: "male" | "female" | "unknown";
  birthYear: number | null;
  deathYear: number | null;
  isLiving: boolean;
  photoUrl: string | null;
  villageName: string | null;
  clanName: string | null;
  verified: boolean;
  generation: number; // relative to root (root = 0, parents = -1, children = +1)
}

/** A relationship edge in the tree */
export interface TreeEdge {
  from: string; // person ID
  to: string;   // person ID
  type: "parent-child" | "spouse";
}

/** Full tree data returned by the API */
export interface TreeData {
  rootId: string;
  persons: TreePerson[];
  edges: TreeEdge[];
  meta: {
    totalNodes: number;
    maxDepthUp: number;   // generations above root
    maxDepthDown: number; // generations below root
    mode: TreeMode;
  };
}

/** Tree view modes */
export type TreeMode = "ancestors" | "descendants" | "full";

/** A positioned node after layout computation */
export interface LayoutNode extends TreePerson {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** A positioned edge after layout */
export interface LayoutEdge extends TreeEdge {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

/** Complete layout result from the engine */
export interface LayoutResult {
  nodes: LayoutNode[];
  edges: LayoutEdge[];
  bounds: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    width: number;
    height: number;
  };
}

/** Messages sent to the layout Web Worker */
export interface LayoutWorkerRequest {
  type: "compute";
  treeData: TreeData;
  nodeWidth: number;
  nodeHeight: number;
  horizontalSpacing: number;
  verticalSpacing: number;
}

/** Messages received from the layout Web Worker */
export interface LayoutWorkerResponse {
  type: "result" | "error";
  result?: LayoutResult;
  error?: string;
  computeTimeMs?: number;
}
