"use client";

import { useExternalScript } from "@/hooks/runtime/useExternalScript";
import type { ExternalScriptStatus } from "@/hooks/runtime/useExternalScript";

const THREE_SRC = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";

export interface ThreeRuntimeResult {
  readonly status: ExternalScriptStatus;
  readonly available: boolean;
}

/** Loads the legacy global Three.js build lazily without adding it to the main bundle. */
export function useThreeRuntime(enabled = true): ThreeRuntimeResult {
  const status = useExternalScript({
    src: THREE_SRC,
    enabled,
    isReady: () =>
      typeof window !== "undefined" &&
      typeof (window as Window & { THREE?: unknown }).THREE === "object",
    timeoutMs: 10000,
  });

  return { status, available: status === "ready" };
}
