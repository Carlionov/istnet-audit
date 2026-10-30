"use client";

import { useCallback, useEffect, useState } from "react";
import { useLatest } from "@/hooks/runtime/useLatest";

export interface UseIntersectionObserverOptions extends IntersectionObserverInit {
  readonly enabled?: boolean;
  readonly triggerOnce?: boolean;
  readonly onChange?: (entry: IntersectionObserverEntry) => void;
}

export interface IntersectionObserverState<TElement extends Element> {
  readonly ref: (node: TElement | null) => void;
  readonly entry: IntersectionObserverEntry | null;
  readonly isIntersecting: boolean;
}

/** Observes a React-owned element and disconnects deterministically on cleanup. */
export function useIntersectionObserver<TElement extends Element = HTMLElement>(
  options: UseIntersectionObserverOptions = {},
): IntersectionObserverState<TElement> {
  const {
    enabled = true,
    triggerOnce = false,
    root = null,
    rootMargin = "0px",
    threshold = 0,
    onChange,
  } = options;
  const onChangeRef = useLatest(onChange);
  const [target, setTarget] = useState<TElement | null>(null);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const ref = useCallback((node: TElement | null) => setTarget(node), []);

  useEffect(() => {
    if (!enabled || !target || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver((entries) => {
      const nextEntry = entries[0];
      if (!nextEntry) return;

      setEntry(nextEntry);
      onChangeRef.current?.(nextEntry);

      if (triggerOnce && nextEntry.isIntersecting) observer.disconnect();
    }, { root, rootMargin, threshold });

    observer.observe(target);
    return () => observer.disconnect();
  }, [enabled, onChangeRef, root, rootMargin, target, threshold, triggerOnce]);

  return {
    ref,
    entry,
    isIntersecting: entry?.isIntersecting ?? false,
  };
}
