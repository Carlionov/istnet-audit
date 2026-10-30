"use client";

import { useEffect } from "react";
import { useLatest } from "@/hooks/runtime/useLatest";

export type AnimationFrameCallback = (time: number, delta: number) => void;

/** Owns a requestAnimationFrame loop and always cancels the pending frame on cleanup. */
export function useAnimationFrame(
  callback: AnimationFrameCallback,
  enabled = true,
): void {
  const callbackRef = useLatest(callback);

  useEffect(() => {
    if (!enabled) return;

    let frameId = 0;
    let previousTime = 0;
    let disposed = false;

    const tick = (time: number) => {
      if (disposed) return;

      const delta = previousTime === 0 ? 0 : time - previousTime;
      previousTime = time;
      callbackRef.current(time, delta);
      frameId = window.requestAnimationFrame(tick);
    };

    frameId = window.requestAnimationFrame(tick);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frameId);
    };
  }, [callbackRef, enabled]);
}
