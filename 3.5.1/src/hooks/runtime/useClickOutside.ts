"use client";

import { useEffect, type RefObject } from "react";
import { useLatest } from "@/hooks/runtime/useLatest";

export function useClickOutside<TElement extends Element>(
  elementRef: RefObject<TElement | null>,
  onOutside: (event: PointerEvent) => void,
  enabled = true,
): void {
  const callbackRef = useLatest(onOutside);

  useEffect(() => {
    const element = elementRef.current;
    if (!enabled || !element || typeof document === "undefined") return;

    const handlePointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !element.contains(event.target)) {
        callbackRef.current(event);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown, true);
    return () => document.removeEventListener("pointerdown", handlePointerDown, true);
  }, [callbackRef, elementRef, enabled]);
}
