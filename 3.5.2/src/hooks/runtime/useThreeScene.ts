"use client";

import { useEffect, type RefObject } from "react";
import { useLatest } from "@/hooks/runtime/useLatest";
import { useReducedMotion } from "@/hooks/runtime/useReducedMotion";

export type ThreeSceneCleanup = () => void;
export type ThreeSceneFactory = (canvas: HTMLCanvasElement) => void | ThreeSceneCleanup;

export interface UseThreeSceneOptions {
  readonly enabled?: boolean;
  readonly rootMargin?: string;
  readonly onError?: (error: unknown) => void;
}

/** Lazily mounts a WebGL scene when its canvas approaches the viewport and disposes it on unmount. */
export function useThreeScene(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  createScene: ThreeSceneFactory,
  options: UseThreeSceneOptions = {},
): void {
  const { enabled = true, rootMargin = "180px 0px", onError } = options;
  const reducedMotion = useReducedMotion();
  const onErrorRef = useLatest(onError);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!enabled || reducedMotion || !canvas) return;

    let disposed = false;
    let sceneCleanup: ThreeSceneCleanup | undefined;
    let observer: IntersectionObserver | undefined;

    const mount = () => {
      if (disposed || sceneCleanup) return;
      try {
        const cleanup = createScene(canvas);
        if (typeof cleanup === "function") sceneCleanup = cleanup;
      } catch (error) {
        canvas.hidden = true;
        onErrorRef.current?.(error);
        console.warn("[MISTNET] Не удалось запустить WebGL-сцену:", error);
      }
    };

    if (typeof IntersectionObserver === "undefined") {
      mount();
    } else {
      observer = new IntersectionObserver(
        (entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;
          observer?.disconnect();
          mount();
        },
        { rootMargin, threshold: 0.01 },
      );
      observer.observe(canvas);
    }

    return () => {
      disposed = true;
      observer?.disconnect();
      sceneCleanup?.();
      sceneCleanup = undefined;
    };
  }, [canvasRef, createScene, enabled, onErrorRef, reducedMotion, rootMargin]);
}
