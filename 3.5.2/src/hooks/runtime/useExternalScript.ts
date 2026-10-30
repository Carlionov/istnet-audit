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
