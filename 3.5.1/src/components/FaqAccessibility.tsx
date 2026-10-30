"use client";

import { useEffect } from "react";

/**
 * Synchronizes native inert/aria-hidden state with the legacy FAQ runtime.
 * The runtime remains the source of truth for opening and closing FAQ items
 * until the runtime-to-React migration in phase 3.5.
 */
export function FaqAccessibility() {
  useEffect(() => {
    const faq = document.getElementById("faq");
    if (!faq) return;

    const syncAnswers = () => {
      faq.querySelectorAll<HTMLElement>(".faq-item").forEach((item) => {
        const button = item.querySelector<HTMLButtonElement>(".faq-question");
        const answer = item.querySelector<HTMLElement>(".faq-answer");
        if (!button || !answer) return;

        const expanded = item.classList.contains("active");
        answer.inert = !expanded;
        answer.setAttribute("aria-hidden", String(!expanded));
      });
    };

    syncAnswers();

    const observer = new MutationObserver(syncAnswers);
    observer.observe(faq, {
      attributes: true,
      attributeFilter: ["class", "aria-expanded"],
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
