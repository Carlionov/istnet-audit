"use client";

import { useEffect } from "react";

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(",");

/** Adds focus management around the mobile menu controlled by mistnet-runtime.js. */
export function MobileMenuA11y() {
  useEffect(() => {
    const menu = document.getElementById("mnav");
    const trigger = document.getElementById("burger");

    if (!(menu instanceof HTMLElement) || !(trigger instanceof HTMLButtonElement)) {
      return;
    }

    const getFocusableElements = (): HTMLElement[] =>
      Array.from(menu.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        (element) =>
          !element.hasAttribute("disabled") &&
          element.getAttribute("aria-hidden") !== "true" &&
          element.getClientRects().length > 0 &&
          window.getComputedStyle(element).visibility !== "hidden",
      );

    const isOpen = () =>
      menu.classList.contains("open") && menu.getAttribute("aria-hidden") !== "true";

    let lastFocusedMenuHref: string | null = null;

    const restoreFocus = () => {
      if (trigger.getClientRects().length > 0) {
        trigger.focus({ preventScroll: true });
        return;
      }

      if (!lastFocusedMenuHref) return;
      const desktopLinks = Array.from(
        document.querySelectorAll<HTMLAnchorElement>(".nav-links a"),
      );
      const target =
        desktopLinks.find((link) => link.getAttribute("href") === lastFocusedMenuHref) ??
        desktopLinks[0];
      target?.focus();
    };

    let wasOpen = isOpen();
    menu.inert = !wasOpen;
    trigger.setAttribute("aria-expanded", String(wasOpen));

    const synchronize = () => {
      const open = isOpen();
      menu.inert = !open;
      trigger.setAttribute("aria-expanded", String(open));

      if (!wasOpen && open) {
        getFocusableElements()[0]?.focus({ preventScroll: true });
      } else if (wasOpen && !open) {
        restoreFocus();
      }

      wasOpen = open;
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen() || event.key !== "Tab") return;

      const focusable = getFocusableElements();
      if (focusable.length === 0) {
        event.preventDefault();
        trigger.focus({ preventScroll: true });
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (!menu.contains(active)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus({ preventScroll: true });
        return;
      }

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus({ preventScroll: true });
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus({ preventScroll: true });
      }
    };

    const handleFocusIn = (event: FocusEvent) => {
      if (!isOpen() || !(event.target instanceof Node)) return;

      if (menu.contains(event.target)) {
        const focusedLink =
          event.target instanceof Element
            ? event.target.closest<HTMLAnchorElement>("a[href]")
            : null;
        if (focusedLink) lastFocusedMenuHref = focusedLink.getAttribute("href");
        return;
      }

      getFocusableElements()[0]?.focus({ preventScroll: true });
    };

    const observer = new MutationObserver(synchronize);
    observer.observe(menu, {
      attributes: true,
      attributeFilter: ["class", "aria-hidden"],
    });

    document.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("focusin", handleFocusIn, true);

    return () => {
      observer.disconnect();
      document.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("focusin", handleFocusIn, true);
    };
  }, []);

  return null;
}
