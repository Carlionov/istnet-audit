"use client";

import { useExternalScript } from "@/hooks/runtime/useExternalScript";
import type { ExternalScriptStatus } from "@/hooks/runtime/useExternalScript";

const GSAP_SRC = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js";
const SCROLL_TRIGGER_SRC = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js";

export interface GsapRuntimeResult {
  readonly status: ExternalScriptStatus;
  readonly gsap: GsapRuntimeLike | null;
  readonly scrollTrigger: ScrollTriggerRuntimeLike | null;
}

export interface GsapVars {
  readonly [key: string]: unknown;
}

export type GsapTarget =
  | string
  | Element
  | readonly Element[]
  | NodeListOf<Element>
  | null;

export interface GsapTweenLike {
  kill(): void;
}

export interface GsapContextLike {
  revert(): void;
}

export interface GsapTimelineLike extends GsapTweenLike {
  to(target: GsapTarget, vars: GsapVars, position?: number | string): GsapTimelineLike;
}

export interface GsapRuntimeLike {
  registerPlugin(...plugins: unknown[]): void;
  context(callback: () => void, scope?: Element | null): GsapContextLike;
  set(target: GsapTarget, vars: GsapVars): GsapTweenLike;
  to(target: GsapTarget, vars: GsapVars): GsapTweenLike;
  timeline(vars?: GsapVars): GsapTimelineLike;
  ticker: {
    add(callback: (time: number) => void): void;
    remove(callback: (time: number) => void): void;
    lagSmoothing(threshold: number, adjustedLag?: number): void;
  };
}

export interface ScrollTriggerRuntimeLike {
  config(options: { readonly ignoreMobileResize?: boolean }): void;
  update(): void;
  refresh(): void;
  create(options: GsapVars): GsapTweenLike;
  batch(targets: readonly Element[], options: GsapVars): void;
}

export function useGsapRuntime(enabled = true): GsapRuntimeResult {
  const gsapStatus = useExternalScript({
    src: GSAP_SRC,
    enabled,
    isReady: () => typeof window !== "undefined" && Boolean(window.gsap),
    timeoutMs: 8000,
  });

  const scrollTriggerStatus = useExternalScript({
    src: SCROLL_TRIGGER_SRC,
    enabled: enabled && gsapStatus === "ready",
    isReady: () => typeof window !== "undefined" && Boolean(window.ScrollTrigger),
    timeoutMs: 8000,
  });

  const status: ExternalScriptStatus = !enabled
    ? "idle"
    : gsapStatus === "error" || scrollTriggerStatus === "error"
      ? "error"
      : scrollTriggerStatus === "ready"
        ? "ready"
        : "loading";

  return {
    status,
    gsap: typeof window !== "undefined" ? window.gsap ?? null : null,
    scrollTrigger:
      typeof window !== "undefined" ? window.ScrollTrigger ?? null : null,
  };
}
