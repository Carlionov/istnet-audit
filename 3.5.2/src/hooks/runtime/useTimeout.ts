"use client";

import { useEffect } from "react";
import { useLatest } from "@/hooks/runtime/useLatest";

/** Runs a one-shot callback and clears its timer on dependency change or unmount. */
export function useTimeout(
  callback: () => void,
  delay: number | null,
  enabled = true,
  restartKey?: unknown,
): void {
  const callbackRef = useLatest(callback);

  useEffect(() => {
    if (!enabled || delay === null || delay < 0) return;

    const timeoutId = window.setTimeout(() => callbackRef.current(), delay);
    return () => window.clearTimeout(timeoutId);
  }, [callbackRef, delay, enabled, restartKey]);
}
