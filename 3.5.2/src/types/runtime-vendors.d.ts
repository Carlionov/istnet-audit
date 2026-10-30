import type {
  GsapRuntimeLike,
  ScrollTriggerRuntimeLike,
} from "@/hooks/runtime/useGsapRuntime";

export {};

declare global {
  interface Window {
    gsap?: GsapRuntimeLike;
    ScrollTrigger?: ScrollTriggerRuntimeLike;
    __scrollP?: number;
    dataLayer?: Array<Record<string, unknown>>;
  }
}
