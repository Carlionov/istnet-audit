"use client";

import { useRuntimeUI } from "@/components/runtime/RuntimeUIProvider";
import { TrackedLink } from "@/components/common/TrackedLink";
import { MISTNET_LINKS } from "@/lib/links";

export function HeaderActions() {
  const { openCommandPalette } = useRuntimeUI();

  return (
    <div className="nav-actions">
      <div className="nav-account-group">
        <TrackedLink action="cabinet_open" className="nav-cabinet" href={MISTNET_LINKS.cabinet}>
          Личный кабинет
        </TrackedLink>
        <button
          aria-controls="pal"
          aria-haspopup="dialog"
          aria-keyshortcuts="Control+K Meta+K"
          aria-label="Быстрые переходы"
          className="nav-search"
          onClick={openCommandPalette}
          title="Быстрые переходы · Ctrl+K"
          type="button"
        >
          <svg aria-hidden="true" className="nav-search-icon" fill="none" viewBox="0 0 24 24">
            <circle cx="10.8" cy="10.8" r="6.8" stroke="currentColor" />
            <path d="m16 16 4.5 4.5" stroke="currentColor" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <TrackedLink action="trial_open" className="nav-btn nav-cta" href={MISTNET_LINKS.cabinet}>
        Начать бесплатно <span aria-hidden="true">↗</span>
      </TrackedLink>
    </div>
  );
}
