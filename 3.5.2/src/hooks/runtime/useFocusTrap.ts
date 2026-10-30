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
