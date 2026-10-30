"use client";

import { useEffect, type RefObject } from "react";
import { useLatest } from "@/hooks/runtime/useLatest";
import { useGsapRuntime, type GsapRuntimeLike, type ScrollTriggerRuntimeLike } from "@/hooks/runtime/useGsapRuntime";
import { useReducedMotion } from "@/hooks/runtime/useReducedMotion";

export type GsapSetup = (
  gsap: GsapRuntimeLike,
  scrollTrigger: ScrollTriggerRuntimeLike,
) => void;

/** Runs a scoped GSAP setup and reverts its context when the component unmounts. */
export function useGsapContext(
  setup: GsapSetup,
  scopeRef: RefObject<HTMLElement | null>,
  enabled = true,
): void {
  const reducedMotion = useReducedMotion();
  const setupRef = useLatest(setup);
  const runtime = useGsapRuntime(enabled && !reducedMotion);

  useEffect(() => {
    if (!enabled || reducedMotion || runtime.status !== "ready") return;

    const gsap = runtime.gsap;
    const scrollTrigger = runtime.scrollTrigger;
    if (!gsap || !scrollTrigger) return;

    gsap.registerPlugin(scrollTrigger);
    const context = gsap.context(
      () => setupRef.current(gsap, scrollTrigger),
      scopeRef.current,
    );

    return () => context.revert();
  }, [enabled, reducedMotion, runtime.gsap, runtime.scrollTrigger, runtime.status, scopeRef, setupRef]);
}
