import { MISTNET_LINKS } from "@/lib/links";

export function HeaderActions() {
  return (
    <div className="nav-actions">
      <div className="nav-account-group">
        <a
          className="nav-cabinet"
          href={MISTNET_LINKS.cabinet}
          data-track="cabinet_open"
        >
          Личный кабинет
        </a>
        <button
          aria-controls="pal"
          aria-haspopup="dialog"
          aria-keyshortcuts="Control+K Meta+K"
          aria-label="Быстрые переходы"
          className="nav-search"
          id="palOpen"
          title="Быстрые переходы · Ctrl+K"
          type="button"
        >
          <svg
            aria-hidden="true"
            className="nav-search-icon"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle cx="10.8" cy="10.8" r="6.8" stroke="currentColor" />
            <path d="m16 16 4.5 4.5" stroke="currentColor" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <a
        className="nav-btn nav-cta magnetic"
        href={MISTNET_LINKS.cabinet}
        data-track="trial_open"
      >
        Начать бесплатно <span aria-hidden="true">↗</span>
      </a>
    </div>
  );
}
