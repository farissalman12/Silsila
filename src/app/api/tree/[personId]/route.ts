import { NextRequest, NextResponse } from "next/server";
import { buildTreeData } from "@/lib/tree/fetch-tree";
import type { TreeMode } from "@/lib/tree/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ personId: string }> }
) {
  const { personId } = await params;
  const searchParams = request.nextUrl.searchParams;

  const mode = (searchParams.get("mode") || "full") as TreeMode;
  const depthUp = parseInt(searchParams.get("depthUp") || "6", 10);
  const depthDown = parseInt(searchParams.get("depthDown") || "6", 10);

  if (!["ancestors", "descendants", "full"].includes(mode)) {
    return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
  }

  const treeData = await buildTreeData(personId, mode, depthUp, depthDown);

  if (!treeData) {
    return NextResponse.json({ error: "Person not found" }, { status: 404 });
  }

  return NextResponse.json(treeData);
}
