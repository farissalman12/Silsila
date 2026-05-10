/**
 * Web Worker for computing tree layout off the main thread.
 * Receives TreeData, runs Reingold-Tilford, returns LayoutResult.
 *
 * NOTE: This file runs in a Web Worker context — no DOM access.
 * It's imported via `new Worker(new URL(...), import.meta.url)`.
 */

import { computeLayout } from "./layout-engine";
import type { LayoutWorkerRequest, LayoutWorkerResponse } from "./types";

self.onmessage = (event: MessageEvent<LayoutWorkerRequest>) => {
  const { treeData, nodeWidth, nodeHeight, horizontalSpacing, verticalSpacing } = event.data;

  try {
    const start = performance.now();

    const result = computeLayout(
      treeData,
      nodeWidth,
      nodeHeight,
      horizontalSpacing,
      verticalSpacing
    );

    const computeTimeMs = Math.round(performance.now() - start);

    const response: LayoutWorkerResponse = {
      type: "result",
      result,
      computeTimeMs,
    };

    self.postMessage(response);
  } catch (err) {
    const response: LayoutWorkerResponse = {
      type: "error",
      error: err instanceof Error ? err.message : "Unknown layout error",
    };
    self.postMessage(response);
  }
};
