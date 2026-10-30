"use client";

import { useEffect } from "react";
import { useLatest } from "@/hooks/runtime/useLatest";

/** Runs a callback on an interval without restarting it when the callback changes. */
export function useInterval(
  callback: () => void,
  delay: number | null,
  enabled = true,
): void {
  const callbackRef = useLatest(callback);

  useEffect(() => {
    if (!enabled || delay === null || delay < 0) return;

    const intervalId = window.setInterval(() => callbackRef.current(), delay);
    return () => window.clearInterval(intervalId);
  }, [callbackRef, delay, enabled]);
}
