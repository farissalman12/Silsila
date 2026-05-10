/**
 * Hook to manage the layout Web Worker lifecycle.
 * Provides a simple `computeLayout()` async function that
 * offloads computation to a worker and returns the result.
 */

"use client";

import { useRef, useCallback, useEffect } from "react";
import type { TreeData, LayoutResult, LayoutWorkerRequest, LayoutWorkerResponse } from "./types";

const DEFAULT_NODE_WIDTH = 180;
const DEFAULT_NODE_HEIGHT = 72;
const DEFAULT_H_SPACING = 40;
const DEFAULT_V_SPACING = 100;

export function useLayoutWorker() {
  const workerRef = useRef<Worker | null>(null);
  const pendingResolveRef = useRef<((result: LayoutResult) => void) | null>(null);
  const pendingRejectRef = useRef<((error: Error) => void) | null>(null);

  useEffect(() => {
    // Create the worker
    workerRef.current = new Worker(
      new URL("./layout-worker.ts", import.meta.url),
      { type: "module" }
    );

    workerRef.current.onmessage = (event: MessageEvent<LayoutWorkerResponse>) => {
      const data = event.data;
      if (data.type === "result" && data.result) {
        pendingResolveRef.current?.(data.result);
      } else if (data.type === "error") {
        pendingRejectRef.current?.(new Error(data.error || "Layout failed"));
      }
      pendingResolveRef.current = null;
      pendingRejectRef.current = null;
    };

    workerRef.current.onerror = (err) => {
      pendingRejectRef.current?.(new Error(err.message));
      pendingResolveRef.current = null;
      pendingRejectRef.current = null;
    };

    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

  const compute = useCallback(
    (
      treeData: TreeData,
      nodeWidth = DEFAULT_NODE_WIDTH,
      nodeHeight = DEFAULT_NODE_HEIGHT,
      horizontalSpacing = DEFAULT_H_SPACING,
      verticalSpacing = DEFAULT_V_SPACING
    ): Promise<LayoutResult> => {
      return new Promise((resolve, reject) => {
        if (!workerRef.current) {
          // Fallback: compute on main thread
          import("./layout-engine").then(({ computeLayout }) => {
            try {
              const result = computeLayout(treeData, nodeWidth, nodeHeight, horizontalSpacing, verticalSpacing);
              resolve(result);
            } catch (err) {
              reject(err);
            }
          });
          return;
        }

        pendingResolveRef.current = resolve;
        pendingRejectRef.current = reject;

        const message: LayoutWorkerRequest = {
          type: "compute",
          treeData,
          nodeWidth,
          nodeHeight,
          horizontalSpacing,
          verticalSpacing,
        };

        workerRef.current.postMessage(message);
      });
    },
    []
  );

  return { computeLayout: compute };
}
