# Полный код — подэтап 3.5.1

Ниже приведены полные версии всех новых файлов без сокращений. Актуальный полный CSS лежит отдельно в `src/app/mistnet-v2.css` и включён в архив.

## `src/hooks/runtime/index.ts`

```typescript
export { useAnimationFrame } from "@/hooks/runtime/useAnimationFrame";
export type { AnimationFrameCallback } from "@/hooks/runtime/useAnimationFrame";
export { useEventListener } from "@/hooks/runtime/useEventListener";
export type { UseEventListenerOptions } from "@/hooks/runtime/useEventListener";
export { useExternalScript, loadExternalScript } from "@/hooks/runtime/useExternalScript";
export type { ExternalScriptOptions, ExternalScriptStatus } from "@/hooks/runtime/useExternalScript";
export { useFocusTrap } from "@/hooks/runtime/useFocusTrap";
export type { UseFocusTrapOptions } from "@/hooks/runtime/useFocusTrap";
export { useGsapContext } from "@/hooks/runtime/useGsapContext";
export type { GsapSetup } from "@/hooks/runtime/useGsapContext";
export { useGsapRuntime } from "@/hooks/runtime/useGsapRuntime";
export type {
  GsapContextLike,
  GsapRuntimeLike,
  GsapTarget,
  GsapTimelineLike,
  GsapTweenLike,
  GsapVars,
  ScrollTriggerRuntimeLike,
  GsapRuntimeResult,
} from "@/hooks/runtime/useGsapRuntime";
export { useIntersectionObserver } from "@/hooks/runtime/useIntersectionObserver";
export type {
  IntersectionObserverState,
  UseIntersectionObserverOptions,
} from "@/hooks/runtime/useIntersectionObserver";
export { useInterval } from "@/hooks/runtime/useInterval";
export { useLatest } from "@/hooks/runtime/useLatest";
export { useMediaQuery } from "@/hooks/runtime/useMediaQuery";
export { usePageVisibility } from "@/hooks/runtime/usePageVisibility";
export { useReducedMotion } from "@/hooks/runtime/useReducedMotion";
export { useThreeRuntime } from "@/hooks/runtime/useThreeRuntime";
export type { ThreeRuntimeResult } from "@/hooks/runtime/useThreeRuntime";
export { useThreeScene } from "@/hooks/runtime/useThreeScene";
export type {
  ThreeSceneCleanup,
  ThreeSceneFactory,
  UseThreeSceneOptions,
} from "@/hooks/runtime/useThreeScene";
export { useTimeout } from "@/hooks/runtime/useTimeout";

export { useClickOutside } from "@/hooks/runtime/useClickOutside";
export { useResizeObserver } from "@/hooks/runtime/useResizeObserver";
export type { UseResizeObserverOptions } from "@/hooks/runtime/useResizeObserver";

```

## `src/hooks/runtime/useAnimationFrame.ts`

```typescript
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

```

## `src/hooks/runtime/useClickOutside.ts`

```typescript
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

```

## `src/hooks/runtime/useEventListener.ts`

```typescript
"use client";

import { useEffect } from "react";
import { useLatest } from "@/hooks/runtime/useLatest";

type EventMapFor<TTarget> = TTarget extends Window
  ? WindowEventMap
  : TTarget extends Document
    ? DocumentEventMap
    : TTarget extends HTMLElement
      ? HTMLElementEventMap
      : Record<string, Event>;

export interface UseEventListenerOptions extends AddEventListenerOptions {
  readonly enabled?: boolean;
}

/** Adds a typed DOM listener and always dispatches to the latest callback. */
export function useEventListener<
  TTarget extends EventTarget,
  TEventMap = EventMapFor<TTarget>,
  TEventName extends keyof TEventMap & string = keyof TEventMap & string,
>(
  target: TTarget | null | undefined,
  eventName: TEventName,
  handler: (event: TEventMap[TEventName]) => void,
  options: UseEventListenerOptions = {},
): void {
  const handlerRef = useLatest(handler);
  const { enabled = true, capture = false, once = false, passive = false } = options;

  useEffect(() => {
    if (!enabled || !target) return;

    const listener: EventListener = (event) => {
      handlerRef.current(event as TEventMap[TEventName]);
    };

    target.addEventListener(eventName, listener, { capture, once, passive });

    return () => {
      target.removeEventListener(eventName, listener, capture);
    };
  }, [capture, enabled, eventName, handlerRef, once, passive, target]);
}

```

## `src/hooks/runtime/useExternalScript.ts`

```typescript
"use client";

import { useEffect, useState } from "react";
import { useLatest } from "@/hooks/runtime/useLatest";

export type ExternalScriptStatus = "idle" | "loading" | "ready" | "error";

export interface ExternalScriptOptions {
  readonly src: string;
  readonly enabled?: boolean;
  readonly isReady?: () => boolean;
  readonly integrity?: string;
  readonly crossOrigin?: "anonymous" | "use-credentials";
  readonly timeoutMs?: number;
}

const scriptPromises = new Map<string, Promise<void>>();

function isScriptReady(options: ExternalScriptOptions): boolean {
  if (options.isReady?.()) return true;

  const expectedSrc = new URL(options.src, document.baseURI).href;
  const existing = Array.from(document.scripts).find(
    (script) => script.src === expectedSrc,
  );

  return existing?.dataset.mistnetLoaded === "true";
}

/** Loads a shared external script once; failed promises are evicted to allow retry. */
export function loadExternalScript(options: ExternalScriptOptions): Promise<void> {
  if (typeof document === "undefined") {
    return Promise.reject(new Error("External scripts can only load in the browser."));
  }

  if (isScriptReady(options)) return Promise.resolve();

  const cached = scriptPromises.get(options.src);
  if (cached) return cached;

  const promise = new Promise<void>((resolve, reject) => {
    const expectedSrc = new URL(options.src, document.baseURI).href;
    const existing = Array.from(document.scripts).find(
      (script) => script.src === expectedSrc,
    );
    const script = existing ?? document.createElement("script");
    let settled = false;

    const cleanup = () => {
      window.clearTimeout(timeoutId);
      script.removeEventListener("load", handleLoad);
      script.removeEventListener("error", handleError);
    };

    const finish = (error?: Error) => {
      if (settled) return;
      settled = true;
      cleanup();

      if (error) {
        scriptPromises.delete(options.src);
        if (script.dataset.mistnetSrc === options.src) script.remove();
        reject(error);
      } else {
        script.dataset.mistnetLoaded = "true";
        resolve();
      }
    };

    const handleLoad = () => {
      if (options.isReady && !options.isReady()) {
        finish(new Error(`Скрипт загружен, но API не обнаружен: ${options.src}`));
        return;
      }
      finish();
    };
    const handleError = () => finish(new Error(`Не удалось загрузить ${options.src}`));
    const timeoutId = window.setTimeout(
      () => finish(new Error(`Тайм-аут загрузки ${options.src}`)),
      options.timeoutMs ?? 8000,
    );

    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener("error", handleError, { once: true });

    if (!existing) {
      script.src = options.src;
      script.async = true;
      script.dataset.mistnetSrc = options.src;
      if (options.integrity) {
        script.integrity = options.integrity;
        script.crossOrigin = options.crossOrigin ?? "anonymous";
      } else if (options.crossOrigin) {
        script.crossOrigin = options.crossOrigin;
      }
      document.head.appendChild(script);
    }
  });

  scriptPromises.set(options.src, promise);
  return promise;
}

export function useExternalScript(options: ExternalScriptOptions): ExternalScriptStatus {
  const optionsRef = useLatest(options);
  const [loadState, setLoadState] = useState<{
    readonly src: string;
    readonly status: ExternalScriptStatus;
  }>({ src: "", status: "idle" });
  const enabled = options.enabled !== false;
  const status = !enabled
    ? "idle"
    : loadState.src === options.src
      ? loadState.status
      : "loading";

  useEffect(() => {
    const current = optionsRef.current;
    if (current.enabled === false) return;

    let active = true;

    void loadExternalScript(current).then(
      () => {
        if (active) setLoadState({ src: current.src, status: "ready" });
      },
      (error: unknown) => {
        if (!active) return;
        setLoadState({ src: current.src, status: "error" });
        console.warn("[MISTNET] Внешняя библиотека недоступна:", current.src, error);
      },
    );

    return () => {
      active = false;
    };
  }, [enabled, options.src, optionsRef]);

  return status;
}

```

## `src/hooks/runtime/useFocusTrap.ts`

```typescript
"use client";

import { useEffect, type RefObject } from "react";
import { useLatest } from "@/hooks/runtime/useLatest";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "area[href]",
  "button:not([disabled])",
  'input:not([disabled]):not([type="hidden"])',
  "select:not([disabled])",
  "textarea:not([disabled])",
  "iframe",
  "object",
  "embed",
  "[contenteditable='true']",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

export interface UseFocusTrapOptions {
  readonly enabled: boolean;
  readonly initialFocusRef?: RefObject<HTMLElement | null>;
  readonly returnFocusRef?: RefObject<HTMLElement | null>;
  readonly onEscape?: () => void;
}

/** Traps Tab navigation in a React-owned modal/dialog and restores focus on close. */
export function useFocusTrap(
  containerRef: RefObject<HTMLElement | null>,
  options: UseFocusTrapOptions,
): void {
  const { enabled, initialFocusRef, returnFocusRef, onEscape } = options;
  const onEscapeRef = useLatest(onEscape);

  useEffect(() => {
    const container = containerRef.current;
    if (!enabled || !container || typeof document === "undefined") return;

    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    // Snapshot the ref during setup; React may update .current before cleanup.
    const returnFocusTarget = returnFocusRef?.current ?? null;

    const getFocusable = (): HTMLElement[] =>
      Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        (element) =>
          !element.hasAttribute("disabled") &&
          !element.hasAttribute("inert") &&
          element.getAttribute("aria-hidden") !== "true" &&
          element.getClientRects().length > 0 &&
          window.getComputedStyle(element).visibility !== "hidden",
      );

    const initialTarget = initialFocusRef?.current ?? getFocusable()[0] ?? container;
    const hadTabIndex = container.hasAttribute("tabindex");
    if (initialTarget === container && !hadTabIndex) container.tabIndex = -1;
    initialTarget.focus({ preventScroll: true });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onEscapeRef.current?.();
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = getFocusable();
      if (focusable.length === 0) {
        event.preventDefault();
        container.focus({ preventScroll: true });
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (!container.contains(active)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus({ preventScroll: true });
      } else if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus({ preventScroll: true });
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus({ preventScroll: true });
      }
    };

    const handleFocusIn = (event: FocusEvent) => {
      if (event.target instanceof Node && !container.contains(event.target)) {
        (getFocusable()[0] ?? container).focus({ preventScroll: true });
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("focusin", handleFocusIn, true);

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("focusin", handleFocusIn, true);

      if (initialTarget === container && !hadTabIndex) {
        container.removeAttribute("tabindex");
      }

      const returnTarget = returnFocusTarget ?? previouslyFocused;
      if (returnTarget?.isConnected) returnTarget.focus({ preventScroll: true });
    };
  }, [containerRef, enabled, initialFocusRef, onEscapeRef, returnFocusRef]);
}

```

## `src/hooks/runtime/useGsapContext.ts`

```typescript
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

```

## `src/hooks/runtime/useGsapRuntime.ts`

```typescript
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

```

## `src/hooks/runtime/useIntersectionObserver.ts`

```typescript
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

```

## `src/hooks/runtime/useInterval.ts`

```typescript
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

```

## `src/hooks/runtime/useLatest.ts`

```typescript
"use client";

import { useEffect, useRef } from "react";

/** Keeps the latest committed value available to long-lived effects and listeners. */
export function useLatest<T>(value: T) {
  const valueRef = useRef(value);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  return valueRef;
}

```

## `src/hooks/runtime/useMediaQuery.ts`

```typescript
"use client";

import { useCallback, useSyncExternalStore } from "react";

/** SSR-safe media query subscription backed by useSyncExternalStore. */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
        return () => undefined;
      }

      const mediaQuery = window.matchMedia(query);
      mediaQuery.addEventListener("change", onStoreChange);
      return () => mediaQuery.removeEventListener("change", onStoreChange);
    },
    [query],
  );

  const getSnapshot = useCallback(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return false;
    }
    return window.matchMedia(query).matches;
  }, [query]);

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

```

## `src/hooks/runtime/usePageVisibility.ts`

```typescript
"use client";

import { useCallback, useSyncExternalStore } from "react";

/** Returns whether the current document is visible; defaults to visible during SSR. */
export function usePageVisibility(): boolean {
  const subscribe = useCallback((onStoreChange: () => void) => {
    if (typeof document === "undefined") return () => undefined;

    document.addEventListener("visibilitychange", onStoreChange);
    return () => document.removeEventListener("visibilitychange", onStoreChange);
  }, []);

  const getSnapshot = useCallback(
    () => typeof document === "undefined" || document.visibilityState === "visible",
    [],
  );

  return useSyncExternalStore(subscribe, getSnapshot, () => true);
}

```

## `src/hooks/runtime/useReducedMotion.ts`

```typescript
"use client";

import { useMediaQuery } from "@/hooks/runtime/useMediaQuery";

/** Reflects the operating-system reduced-motion preference. */
export function useReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

```

## `src/hooks/runtime/useResizeObserver.ts`

```typescript
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

```

## `src/hooks/runtime/useThreeRuntime.ts`

```typescript
"use client";

import { useExternalScript } from "@/hooks/runtime/useExternalScript";
import type { ExternalScriptStatus } from "@/hooks/runtime/useExternalScript";

const THREE_SRC = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";

export interface ThreeRuntimeResult {
  readonly status: ExternalScriptStatus;
  readonly available: boolean;
}

/** Loads the legacy global Three.js build lazily without adding it to the main bundle. */
export function useThreeRuntime(enabled = true): ThreeRuntimeResult {
  const status = useExternalScript({
    src: THREE_SRC,
    enabled,
    isReady: () =>
      typeof window !== "undefined" &&
      typeof (window as Window & { THREE?: unknown }).THREE === "object",
    timeoutMs: 10000,
  });

  return { status, available: status === "ready" };
}

```

## `src/hooks/runtime/useThreeScene.ts`

```typescript
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

```

## `src/hooks/runtime/useTimeout.ts`

```typescript
"use client";

import { useEffect } from "react";
import { useLatest } from "@/hooks/runtime/useLatest";

/** Runs a one-shot callback and clears its timer on dependency change or unmount. */
export function useTimeout(
  callback: () => void,
  delay: number | null,
  enabled = true,
): void {
  const callbackRef = useLatest(callback);

  useEffect(() => {
    if (!enabled || delay === null || delay < 0) return;

    const timeoutId = window.setTimeout(() => callbackRef.current(), delay);
    return () => window.clearTimeout(timeoutId);
  }, [callbackRef, delay, enabled]);
}

```

## `src/lib/runtime/contracts.ts`

```typescript
/**
 * Explicit integration boundary retained after the DOM runtime migration.
 * Keep these values stable for the status API and external analytics consumers.
 */
export const MISTNET_INTEGRATION_CONTRACTS = {
  statusEndpoint: "/api/status",
  conversionEventName: "mistnet:conversion",
  dataLayerName: "dataLayer",
  trackingAttribute: "data-track",
  planAttribute: "data-plan",
} as const;

export type ServerNodeId = "us" | "fi" | "nl" | "tr";
export type ServerNodeStatus = "online" | "offline" | "unknown";

export interface ServerStatusNode {
  readonly id: ServerNodeId;
  readonly status: ServerNodeStatus;
  readonly latencyMs: number | null;
}

export interface ServerStatusConfiguredResponse {
  readonly state: "configured";
  readonly nodes: readonly ServerStatusNode[];
  readonly updatedAt: string | null;
}

export interface ServerStatusUnconfiguredResponse {
  readonly state: "unconfigured";
  readonly message?: string;
  readonly nodes?: readonly ServerStatusNode[];
}

export interface ServerStatusErrorResponse {
  readonly state: "error";
  readonly message: string;
}

export type ServerStatusResponse =
  | ServerStatusConfiguredResponse
  | ServerStatusUnconfiguredResponse
  | ServerStatusErrorResponse;

export interface MistnetConversionDetail {
  readonly [key: string]: unknown;
  readonly event: string;
  readonly plan: string | null;
  readonly destination: string | null;
}

/** The dataLayer event name is the original data-track action (trial_open, etc.). */
export type MistnetDataLayerEvent = MistnetConversionDetail;

```

## `src/lib/runtime/status.ts`

```typescript
import type {
  ServerNodeId,
  ServerNodeStatus,
  ServerStatusNode,
  ServerStatusResponse,
} from "@/lib/runtime/contracts";

const SERVER_NODE_IDS = new Set<ServerNodeId>(["us", "fi", "nl", "tr"]);
const SERVER_NODE_STATUSES = new Set<ServerNodeStatus>([
  "online",
  "offline",
  "unknown",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseNode(value: unknown): ServerStatusNode | null {
  if (!isRecord(value)) return null;
  if (typeof value.id !== "string" || !SERVER_NODE_IDS.has(value.id as ServerNodeId)) {
    return null;
  }
  if (typeof value.status !== "string" || !SERVER_NODE_STATUSES.has(value.status as ServerNodeStatus)) {
    return null;
  }
  if (
    value.latencyMs !== null &&
    (typeof value.latencyMs !== "number" ||
      !Number.isFinite(value.latencyMs) ||
      value.latencyMs <= 0)
  ) {
    return null;
  }

  return {
    id: value.id as ServerNodeId,
    status: value.status as ServerNodeStatus,
    latencyMs: value.latencyMs,
  };
}

/** Validates the API boundary before untrusted JSON enters React state. */
export function parseServerStatusResponse(value: unknown): ServerStatusResponse | null {
  if (!isRecord(value) || typeof value.state !== "string") return null;

  if (value.state === "unconfigured") {
    return {
      state: "unconfigured",
      ...(typeof value.message === "string" ? { message: value.message } : {}),
      ...(Array.isArray(value.nodes) ? { nodes: [] } : {}),
    };
  }

  if (value.state === "error") {
    if (typeof value.message !== "string") return null;
    return { state: "error", message: value.message };
  }

  if (value.state !== "configured" || !Array.isArray(value.nodes)) return null;

  const nodes = value.nodes.map(parseNode);
  if (nodes.some((node) => node === null)) return null;

  const updatedAt =
    typeof value.updatedAt === "string" || value.updatedAt === null
      ? value.updatedAt
      : null;

  return {
    state: "configured",
    nodes: nodes as ServerStatusNode[],
    updatedAt,
  };
}

```

## `src/lib/runtime/tracking.ts`

```typescript
import {
  MISTNET_INTEGRATION_CONTRACTS,
  type MistnetConversionDetail,
  type MistnetDataLayerEvent,
} from "@/lib/runtime/contracts";

/** Emits the public conversion event and the matching dataLayer payload. */
export function trackMistnetConversion(detail: MistnetConversionDetail): void {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent<MistnetConversionDetail>(
      MISTNET_INTEGRATION_CONTRACTS.conversionEventName,
      { detail },
    ),
  );

  const dataLayer = window.dataLayer ?? (window.dataLayer = []);
  const event: MistnetDataLayerEvent = { ...detail };
  dataLayer.push(event);
}

```

## `src/types/runtime-vendors.d.ts`

```typescript
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

```
