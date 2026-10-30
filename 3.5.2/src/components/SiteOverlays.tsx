"use client";

import { useCallback, useState } from "react";
import { useEventListener } from "@/hooks/runtime/useEventListener";
import { useRuntimeUI } from "@/components/runtime/RuntimeUIProvider";
import { CommandPalette } from "@/components/command/CommandPalette";

function getScrollProgress(): number {
  if (typeof window === "undefined" || typeof document === "undefined") return 0;
  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
  if (scrollableHeight <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((window.scrollY / scrollableHeight) * 100)));
}

export function SiteOverlays() {
  const [showToTop, setShowToTop] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const { toastMessage } = useRuntimeUI();

  const updateScrollState = useCallback(() => {
    setShowToTop(window.scrollY > 480);
    setScrollProgress(getScrollProgress());
  }, []);

  useEventListener(
    typeof window === "undefined" ? null : window,
    "scroll",
    updateScrollState,
    { passive: true },
  );

  return (
    <>
      <progress
        aria-label="Прокрутка страницы"
        className="scroll-progress"
        max={100}
        value={scrollProgress}
      />
      <button
        aria-label="Наверх"
        className={`to-top${showToTop ? " visible" : ""}`}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        type="button"
      >
        ↑
      </button>
      <div className={`toast${toastMessage ? " show" : ""}`} role="status" aria-live="polite" aria-atomic="true">
        <span className="toast-icon" aria-hidden="true">✓</span>
        <span>{toastMessage || "Скопировано"}</span>
      </div>
      <CommandPalette />
    </>
  );
}
