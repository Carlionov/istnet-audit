"use client";

import { useMediaQuery } from "@/hooks/runtime/useMediaQuery";

/** Reflects the operating-system reduced-motion preference. */
export function useReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}
