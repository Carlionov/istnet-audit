"use client";

import { useCallback, useSyncExternalStore } from "react";

/** Returns whether the current document is visible; defaults to visible during SSR. */
export function usePageVisibility(): boolean {
  const subscribe = useCallback((onStoreChange: () => void) => {
    if (typeof document === "undefined") return () => undefined;

    document.addEventListener("visibilitychange", onStoreChange);
    return () => document.removeEventListener("visibilitychange", onStoreChange);
  }, []);

  const getSnapshot = useCallback(
    () => typeof document === "undefined" || document.visibilityState === "visible",
    [],
  );

  return useSyncExternalStore(subscribe, getSnapshot, () => true);
}
