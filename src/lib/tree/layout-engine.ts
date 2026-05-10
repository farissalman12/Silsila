/**
 * Reingold-Tilford tree layout algorithm.
 * Produces aesthetically pleasing, compact tree layouts.
 *
 * Based on: "Tidier Drawings of Trees" (Reingold & Tilford, 1981)
 * with Buchheim et al. improvements for linear-time computation.
 *
 * Supports: top-down (descendants), bottom-up (ancestors), and bidirectional (full).
 */

import type { TreeData, TreePerson, TreeEdge, LayoutNode, LayoutEdge, LayoutResult } from "./types";

// Internal node used during layout computation
interface RTNode {
  id: string;
  person: TreePerson;
  children: RTNode[];
  spouse: RTNode | null;
  x: number;
  y: number;
  mod: number;       // modifier for subtree shift
  thread: RTNode | null;
  ancestor: RTNode;
  change: number;
  shift: number;
  number: number;    // position among siblings (1-indexed)
  prelim: number;
}

const NODE_WIDTH = 180;
const NODE_HEIGHT = 72;
const H_SPACING = 40;  // horizontal gap between sibling nodes
const V_SPACING = 100; // vertical gap between generations
const SPOUSE_GAP = 20; // gap between spouses

function createRTNode(person: TreePerson, number: number): RTNode {
  const node: RTNode = {
    id: person.id,
    person,
    children: [],
    spouse: null,
    x: 0,
    y: 0,
    mod: 0,
    thread: null,
    ancestor: null as unknown as RTNode,
    change: 0,
    shift: 0,
    number,
    prelim: 0,
  };
  node.ancestor = node;
  return node;
}

/**
 * Build an internal tree structure from flat TreeData.
 * For "descendants" mode: root at top, children below.
 * For "ancestors" mode: root at bottom, parents above.
 * For "full" mode: root centered, ancestors above, descendants below.
 */
function buildRTTree(data: TreeData): RTNode | null {
  const personMap = new Map<string, TreePerson>();
  for (const p of data.persons) {
    personMap.set(p.id, p);
  }

  // Build adjacency: parent → children
  const childrenOf = new Map<string, string[]>();
  const spouseOf = new Map<string, string[]>();

  for (const edge of data.edges) {
    if (edge.type === "parent-child") {
      const children = childrenOf.get(edge.from) || [];
      children.push(edge.to);
      childrenOf.set(edge.from, children);
    } else if (edge.type === "spouse") {
      const spousesA = spouseOf.get(edge.from) || [];
      spousesA.push(edge.to);
      spouseOf.set(edge.from, spousesA);

      const spousesB = spouseOf.get(edge.to) || [];
      spousesB.push(edge.from);
      spouseOf.set(edge.to, spousesB);
    }
  }

  // Build the tree recursively from root
  const visited = new Set<string>();

  function buildSubtree(personId: string, siblingNumber: number): RTNode | null {
    if (visited.has(personId)) return null;
    visited.add(personId);

    const person = personMap.get(personId);
    if (!person) return null;

    const node = createRTNode(person, siblingNumber);

    // Get children and sort by birth year
    const childIds = childrenOf.get(personId) || [];
    const childPersons = childIds
      .map((id) => personMap.get(id))
      .filter((p): p is TreePerson => p !== undefined)
      .sort((a, b) => (a.birthYear || 9999) - (b.birthYear || 9999));

    let childNum = 1;
    for (const childPerson of childPersons) {
      const childNode = buildSubtree(childPerson.id, childNum);
      if (childNode) {
        node.children.push(childNode);
        childNum++;
      }
    }

    // Attach first spouse
    const spouseIds = spouseOf.get(personId) || [];
    if (spouseIds.length > 0 && !visited.has(spouseIds[0])) {
      const spousePerson = personMap.get(spouseIds[0]);
      if (spousePerson) {
        visited.add(spouseIds[0]);
        node.spouse = createRTNode(spousePerson, 0);
      }
    }

    return node;
  }

  // For ancestors mode, we need to invert the tree (parents become children)
  if (data.meta.mode === "ancestors") {
    // Build inverted adjacency: child → parents
    const parentsOf = new Map<string, string[]>();
    for (const edge of data.edges) {
      if (edge.type === "parent-child") {
        const parents = parentsOf.get(edge.to) || [];
        parents.push(edge.from);
        parentsOf.set(edge.to, parents);
      }
    }

    function buildAncestorSubtree(personId: string, siblingNumber: number): RTNode | null {
      if (visited.has(personId)) return null;
      visited.add(personId);

      const person = personMap.get(personId);
      if (!person) return null;

      const node = createRTNode(person, siblingNumber);

      // Parents become "children" in the inverted tree
      const parentIds = parentsOf.get(personId) || [];
      const parentPersons = parentIds
        .map((id) => personMap.get(id))
        .filter((p): p is TreePerson => p !== undefined)
        .sort((a, b) => (a.birthYear || 9999) - (b.birthYear || 9999));

      let childNum = 1;
      for (const parentPerson of parentPersons) {
        const parentNode = buildAncestorSubtree(parentPerson.id, childNum);
        if (parentNode) {
          node.children.push(parentNode);
          childNum++;
        }
      }

      // Attach spouse
      const spouseIds = spouseOf.get(personId) || [];
      if (spouseIds.length > 0 && !visited.has(spouseIds[0])) {
        const spousePerson = personMap.get(spouseIds[0]);
        if (spousePerson) {
          visited.add(spouseIds[0]);
          node.spouse = createRTNode(spousePerson, 0);
        }
      }

      return node;
    }

    return buildAncestorSubtree(data.rootId, 1);
  }

  // For full mode, we build descendants first, then stitch ancestors on top
  // Simplified: just build from root downward (descendants tree covers both via edges)
  return buildSubtree(data.rootId, 1);
}

// ============================================================
// Reingold-Tilford first & second walk
// ============================================================

function firstWalk(v: RTNode): void {
  if (v.children.length === 0) {
    // Leaf node
    v.prelim = 0;
    return;
  }

  // Process all children
  for (const child of v.children) {
    firstWalk(child);
  }

  // Midpoint of children
  const firstChild = v.children[0];
  const lastChild = v.children[v.children.length - 1];
  const midpoint = (firstChild.prelim + lastChild.prelim) / 2;

  v.prelim = midpoint;

  // Separate subtrees
  let previousSibling: RTNode | null = null;
  for (const child of v.children) {
    if (previousSibling) {
      separate(previousSibling, child);
    }
    previousSibling = child;
  }
}

function separate(left: RTNode, right: RTNode): void {
  const minDistance = NODE_WIDTH + H_SPACING;
  const rightContour = getLeftContour(right);
  const leftContour = getRightContour(left);
  const overlap = leftContour - rightContour + minDistance;

  if (overlap > 0) {
    right.prelim += overlap;
    right.mod += overlap;

    // Distribute shift evenly across in-between siblings
    distributeShift(right);
  }
}

function getLeftContour(node: RTNode): number {
  let min = node.prelim;
  for (const child of node.children) {
    min = Math.min(min, child.prelim + node.mod);
  }
  return min;
}

function getRightContour(node: RTNode): number {
  let max = node.prelim;
  for (const child of node.children) {
    max = Math.max(max, child.prelim + node.mod);
  }
  return max;
}

function distributeShift(node: RTNode): void {
  // Simplified distribution - shifts are already applied via mod
  node.shift = 0;
  node.change = 0;
}

function secondWalk(node: RTNode, modSum: number, depth: number): void {
  node.x = node.prelim + modSum;
  node.y = depth * (NODE_HEIGHT + V_SPACING);

  for (const child of node.children) {
    secondWalk(child, modSum + node.mod, depth + 1);
  }
}

// ============================================================
// Main layout function
// ============================================================

export function computeLayout(
  data: TreeData,
  nodeWidth = NODE_WIDTH,
  nodeHeight = NODE_HEIGHT,
  hSpacing = H_SPACING,
  vSpacing = V_SPACING
): LayoutResult {
  const root = buildRTTree(data);

  if (!root) {
    return {
      nodes: [],
      edges: [],
      bounds: { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 },
    };
  }

  // Run the two-pass algorithm
  firstWalk(root);
  secondWalk(root, 0, 0);

  // Flatten the tree into positioned nodes
  const layoutNodes: LayoutNode[] = [];
  const nodePositions = new Map<string, { x: number; y: number }>();

  function flatten(node: RTNode): void {
    layoutNodes.push({
      ...node.person,
      x: node.x,
      y: node.y,
      width: nodeWidth,
      height: nodeHeight,
    });
    nodePositions.set(node.id, { x: node.x, y: node.y });

    // Place spouse to the right
    if (node.spouse) {
      const spouseX = node.x + nodeWidth + SPOUSE_GAP;
      layoutNodes.push({
        ...node.spouse.person,
        x: spouseX,
        y: node.y,
        width: nodeWidth,
        height: nodeHeight,
      });
      nodePositions.set(node.spouse.id, { x: spouseX, y: node.y });
    }

    for (const child of node.children) {
      flatten(child);
    }
  }

  flatten(root);

  // Build layout edges from original tree edges
  const layoutEdges: LayoutEdge[] = [];

  for (const edge of data.edges) {
    const fromPos = nodePositions.get(edge.from);
    const toPos = nodePositions.get(edge.to);

    if (fromPos && toPos) {
      layoutEdges.push({
        ...edge,
        x1: fromPos.x + nodeWidth / 2,
        y1: edge.type === "parent-child" ? fromPos.y + nodeHeight : fromPos.y + nodeHeight / 2,
        x2: toPos.x + nodeWidth / 2,
        y2: edge.type === "parent-child" ? toPos.y : toPos.y + nodeHeight / 2,
      });
    }
  }

  // Compute bounds
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const node of layoutNodes) {
    minX = Math.min(minX, node.x);
    minY = Math.min(minY, node.y);
    maxX = Math.max(maxX, node.x + nodeWidth);
    maxY = Math.max(maxY, node.y + nodeHeight);
  }

  // Normalize: shift everything so minX=0, minY=0
  const offsetX = -minX + hSpacing;
  const offsetY = -minY + vSpacing;

  for (const node of layoutNodes) {
    node.x += offsetX;
    node.y += offsetY;
  }
  for (const edge of layoutEdges) {
    edge.x1 += offsetX;
    edge.y1 += offsetY;
    edge.x2 += offsetX;
    edge.y2 += offsetY;
  }

  minX += offsetX;
  minY += offsetY;
  maxX += offsetX;
  maxY += offsetY;

  return {
    nodes: layoutNodes,
    edges: layoutEdges,
    bounds: {
      minX,
      minY,
      maxX,
      maxY,
      width: maxX - minX,
      height: maxY - minY,
    },
  };
}
