import { TrackedLink } from "@/components/common/TrackedLink";
import { MISTNET_LINKS } from "@/lib/links";

export function SiteDecorations() {
  return (
    <>
      <svg aria-hidden="true" className="flag-sprite" height="0" width="0">
        <defs>
          <symbol id="f-nl" viewBox="0 0 24 16">
            <rect fill="#AE1C28" height="5.34" width="24" />
            <rect fill="#fff" height="5.34" width="24" y="5.33" />
            <rect fill="#21468B" height="5.34" width="24" y="10.66" />
          </symbol>
          <symbol id="f-fi" viewBox="0 0 24 16">
            <rect fill="#fff" height="16" width="24" />
            <rect fill="#003580" height="16" width="4" x="6" />
            <rect fill="#003580" height="4" width="24" y="6" />
          </symbol>
          <symbol id="f-us" viewBox="0 0 24 16">
            <rect fill="#fff" height="16" width="24" />
            <g fill="#B22234">
              <rect height="2.29" width="24" />
              <rect height="2.29" width="24" y="4.57" />
              <rect height="2.29" width="24" y="9.14" />
              <rect height="2.29" width="24" y="13.71" />
            </g>
            <rect fill="#3C3B6E" height="9.14" width="10.5" />
            <g fill="#fff">
              <circle cx="1.8" cy="1.6" r=".55" />
              <circle cx="4.2" cy="1.6" r=".55" />
              <circle cx="6.6" cy="1.6" r=".55" />
              <circle cx="9" cy="1.6" r=".55" />
              <circle cx="3" cy="4.5" r=".55" />
              <circle cx="5.4" cy="4.5" r=".55" />
              <circle cx="7.8" cy="4.5" r=".55" />
              <circle cx="1.8" cy="7.4" r=".55" />
              <circle cx="4.2" cy="7.4" r=".55" />
              <circle cx="6.6" cy="7.4" r=".55" />
              <circle cx="9" cy="7.4" r=".55" />
            </g>
          </symbol>
          <symbol id="f-tr" viewBox="0 0 24 16">
            <rect width="24" height="16" fill="#E30A17" />
            <circle cx="10" cy="8" r="4.4" fill="#fff" />
            <circle cx="11.2" cy="8" r="3.5" fill="#E30A17" />
            <path d="m15.4 5.1 1 2 2.2.3-1.6 1.5.4 2.2-2-1.1-2 1.1.4-2.2-1.6-1.5 2.2-.3z" fill="#fff" />
          </symbol>
        </defs>
      </svg>
      <a className="skip" href="#main">Перейти к содержимому</a>
      <div className="bg-layer bg-grid" />
      <div className="scanlines" />
      <div className="noise" />
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <TrackedLink
        action="cabinet_open"
        aria-label="Открыть личный кабинет MISTNET"
        className="cabinet-fab"
        href={MISTNET_LINKS.cabinet}
        title="Личный кабинет · тест 3 дня"
      >
        <svg aria-hidden="true" className="cabinet-fab-icon" fill="none" viewBox="0 0 24 24">
          <path d="M20 21a8 8 0 0 0-16 0" stroke="currentColor" strokeLinecap="round" />
          <circle cx="12" cy="8" r="4" stroke="currentColor" />
        </svg>
      </TrackedLink>
    </>
  );
}
