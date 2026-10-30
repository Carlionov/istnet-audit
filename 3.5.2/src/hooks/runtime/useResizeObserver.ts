"use client";

import { useEffect, type RefObject } from "react";
import { useLatest } from "@/hooks/runtime/useLatest";

export interface UseResizeObserverOptions extends ResizeObserverOptions {
  readonly enabled?: boolean;
}

/** Subscribes to element size changes and disconnects on cleanup. */
export function useResizeObserver<TElement extends Element>(
  targetRef: RefObject<TElement | null>,
  callback: (entries: readonly ResizeObserverEntry[]) => void,
  options: UseResizeObserverOptions = {},
): void {
  const callbackRef = useLatest(callback);
  const { enabled = true, box = "content-box" } = options;

  useEffect(() => {
    const target = targetRef.current;
    if (!enabled || !target || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver((entries) => callbackRef.current(entries));
    observer.observe(target, { box });
    return () => observer.disconnect();
  }, [box, callbackRef, enabled, targetRef]);
}
