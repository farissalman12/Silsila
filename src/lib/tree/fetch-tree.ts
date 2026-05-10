import { prisma } from "@/lib/prisma";
import type { TreePerson, TreeEdge, TreeData, TreeMode } from "./types";

const MAX_DEPTH = 9;

interface RawPerson {
  id: string;
  fullName: string;
  gender: string;
  birthYear: number | null;
  deathYear: number | null;
  isLiving: boolean;
  photoUrl: string | null;
  verified: boolean;
  privacyLevel: string;
  village: { name: string } | null;
  clan: { name: string } | null;
}

const personSelect = {
  id: true,
  fullName: true,
  gender: true,
  birthYear: true,
  deathYear: true,
  isLiving: true,
  photoUrl: true,
  verified: true,
  privacyLevel: true,
  village: { select: { name: true } },
  clan: { select: { name: true } },
} as const;

function toTreePerson(p: RawPerson, generation: number): TreePerson {
  return {
    id: p.id,
    fullName: p.fullName,
    gender: p.gender as TreePerson["gender"],
    birthYear: p.birthYear,
    deathYear: p.deathYear,
    isLiving: p.isLiving,
    photoUrl: p.photoUrl,
    villageName: p.village?.name ?? null,
    clanName: p.clan?.name ?? null,
    verified: p.verified,
    generation,
  };
}

/**
 * Recursively fetch ancestors (parents of parents...) up to `depth` levels.
 */
async function fetchAncestors(
  personId: string,
  depth: number,
  generation: number,
  visited: Set<string>,
  persons: Map<string, TreePerson>,
  edges: TreeEdge[]
): Promise<void> {
  if (depth <= 0 || visited.has(personId)) return;
  visited.add(personId);

  // Find parent relationships where this person is person_b (child)
  const parentRels = await prisma.relationship.findMany({
    where: { personBId: personId, relationshipType: "parent" },
    include: { personA: { select: personSelect } },
  });

  for (const rel of parentRels) {
    const parent = rel.personA as unknown as RawPerson;
    if (!persons.has(parent.id)) {
      persons.set(parent.id, toTreePerson(parent, generation - 1));
    }
    edges.push({ from: parent.id, to: personId, type: "parent-child" });

    await fetchAncestors(parent.id, depth - 1, generation - 1, visited, persons, edges);
  }

  // Also fetch spouses of ancestors
  await fetchSpouses(personId, generation, persons, edges);
}

/**
 * Recursively fetch descendants (children of children...) down to `depth` levels.
 */
async function fetchDescendants(
  personId: string,
  depth: number,
  generation: number,
  visited: Set<string>,
  persons: Map<string, TreePerson>,
  edges: TreeEdge[]
): Promise<void> {
  if (depth <= 0 || visited.has(personId)) return;
  visited.add(personId);

  // Find parent relationships where this person is person_a (parent)
  const childRels = await prisma.relationship.findMany({
    where: { personAId: personId, relationshipType: "parent" },
    include: { personB: { select: personSelect } },
  });

  for (const rel of childRels) {
    const child = rel.personB as unknown as RawPerson;
    if (!persons.has(child.id)) {
      persons.set(child.id, toTreePerson(child, generation + 1));
    }
    edges.push({ from: personId, to: child.id, type: "parent-child" });

    await fetchDescendants(child.id, depth - 1, generation + 1, visited, persons, edges);
  }

  // Also fetch spouses
  await fetchSpouses(personId, generation, persons, edges);
}

/**
 * Fetch spouses of a person and add spouse edges.
 */
async function fetchSpouses(
  personId: string,
  generation: number,
  persons: Map<string, TreePerson>,
  edges: TreeEdge[]
): Promise<void> {
  // Spouse relationships where this person is either side
  const spouseRels = await prisma.relationship.findMany({
    where: {
      relationshipType: "spouse",
      OR: [{ personAId: personId }, { personBId: personId }],
    },
    include: {
      personA: { select: personSelect },
      personB: { select: personSelect },
    },
  });

  for (const rel of spouseRels) {
    const spouse = rel.personAId === personId
      ? (rel.personB as unknown as RawPerson)
      : (rel.personA as unknown as RawPerson);

    // Avoid duplicate spouse edge
    const edgeExists = edges.some(
      (e) => e.type === "spouse" && ((e.from === personId && e.to === spouse.id) || (e.from === spouse.id && e.to === personId))
    );

    if (!edgeExists) {
      if (!persons.has(spouse.id)) {
        persons.set(spouse.id, toTreePerson(spouse, generation));
      }
      edges.push({ from: personId, to: spouse.id, type: "spouse" });
    }
  }
}

/**
 * Build the full tree data for a given root person.
 */
export async function buildTreeData(
  rootPersonId: string,
  mode: TreeMode = "full",
  depthUp: number = 6,
  depthDown: number = 6
): Promise<TreeData | null> {
  // Clamp depths
  depthUp = Math.min(depthUp, MAX_DEPTH);
  depthDown = Math.min(depthDown, MAX_DEPTH);

  // Fetch root person
  const rootPerson = await prisma.person.findUnique({
    where: { id: rootPersonId, deletedAt: null },
    select: personSelect,
  });

  if (!rootPerson) return null;

  const persons = new Map<string, TreePerson>();
  const edges: TreeEdge[] = [];
  const visitedUp = new Set<string>();
  const visitedDown = new Set<string>();

  // Add root
  persons.set(rootPerson.id, toTreePerson(rootPerson as unknown as RawPerson, 0));

  // Fetch based on mode
  if (mode === "ancestors" || mode === "full") {
    await fetchAncestors(rootPerson.id, depthUp, 0, visitedUp, persons, edges);
  }

  if (mode === "descendants" || mode === "full") {
    await fetchDescendants(rootPerson.id, depthDown, 0, visitedDown, persons, edges);
  }

  // Also fetch spouses of root
  await fetchSpouses(rootPerson.id, 0, persons, edges);

  // Deduplicate edges
  const edgeKey = (e: TreeEdge) => `${e.type}:${e.from}:${e.to}`;
  const uniqueEdges = [...new Map(edges.map((e) => [edgeKey(e), e])).values()];

  // Compute max depth
  const personArray = Array.from(persons.values());
  const maxDepthUp = Math.abs(Math.min(0, ...personArray.map((p) => p.generation)));
  const maxDepthDown = Math.max(0, ...personArray.map((p) => p.generation));

  return {
    rootId: rootPerson.id,
    persons: personArray,
    edges: uniqueEdges,
    meta: {
      totalNodes: personArray.length,
      maxDepthUp,
      maxDepthDown,
      mode,
    },
  };
}
