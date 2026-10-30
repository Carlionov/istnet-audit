import { MISTNET_LINKS } from "@/lib/links";

export function SiteDecorations() {
  return (
    <>
      <svg aria-hidden="true" className="flag-sprite" height="0" width="0">
        <defs>
          <symbol id="f-nl" viewBox="0 0 24 16">
            <rect fill="#AE1C28" height="5.34" width="24"></rect>
            <rect fill="#fff" height="5.34" width="24" y="5.33"></rect>
            <rect fill="#21468B" height="5.34" width="24" y="10.66"></rect>
          </symbol>
          <symbol id="f-fi" viewBox="0 0 24 16">
            <rect fill="#fff" height="16" width="24"></rect>
            <rect fill="#003580" height="16" width="4" x="6"></rect>
            <rect fill="#003580" height="4" width="24" y="6"></rect>
          </symbol>
          <symbol id="f-us" viewBox="0 0 24 16">
            <rect fill="#fff" height="16" width="24"></rect>
            <g fill="#B22234">
              <rect height="2.29" width="24"></rect>
              <rect height="2.29" width="24" y="4.57"></rect>
              <rect height="2.29" width="24" y="9.14"></rect>
              <rect height="2.29" width="24" y="13.71"></rect>
            </g>
            <rect fill="#3C3B6E" height="9.14" width="10.5"></rect>
            <g fill="#fff">
              <circle cx="1.8" cy="1.6" r=".55"></circle>
              <circle cx="4.2" cy="1.6" r=".55"></circle>
              <circle cx="6.6" cy="1.6" r=".55"></circle>
              <circle cx="9" cy="1.6" r=".55"></circle>
              <circle cx="3" cy="4.5" r=".55"></circle>
              <circle cx="5.4" cy="4.5" r=".55"></circle>
              <circle cx="7.8" cy="4.5" r=".55"></circle>
              <circle cx="1.8" cy="7.4" r=".55"></circle>
              <circle cx="4.2" cy="7.4" r=".55"></circle>
              <circle cx="6.6" cy="7.4" r=".55"></circle>
              <circle cx="9" cy="7.4" r=".55"></circle>
            </g>
          </symbol>
          <symbol id="f-tr" viewBox="0 0 24 16">
            <rect width="24" height="16" fill="#E30A17"></rect>
            <circle cx="10" cy="8" r="4.4" fill="#fff"></circle>
            <circle cx="11.2" cy="8" r="3.5" fill="#E30A17"></circle>
            <path d="m15.4 5.1 1 2 2.2.3-1.6 1.5.4 2.2-2-1.1-2 1.1.4-2.2-1.6-1.5 2.2-.3z" fill="#fff"></path>
          </symbol>
        </defs>
      </svg>
      <a className="skip" href="#main">{"Перейти к содержимому"}</a>
      <div id="preloader">
        <div className="pre-term">
          <div className="pre-head">
            <div className="pre-dot r"></div>
            <div className="pre-dot y"></div>
            <div className="pre-dot g"></div>
            <span className="pre-title">{"mistnet://boot"}</span>
          </div>
          <div className="pre-body" id="preBody">
            <div className="pre-bar">
              <div className="pre-bar-fill" id="preBar"></div>
            </div>
          </div>
        </div>
      </div>
      <div className="scroll-progress" id="scrollProgress"></div>
      <div className="cursor" id="cursor"></div>
      <div className="cursor-ring" id="cursorRing"></div>
      <div className="bg-layer bg-grid"></div>
      <div className="scanlines"></div>
      <div className="noise"></div>
      <div className="blob blob-1" id="blob1"></div>
      <div className="blob blob-2" id="blob2"></div>
      <a aria-label="Открыть личный кабинет MISTNET" className="cabinet-fab" href={MISTNET_LINKS.cabinet} data-track="cabinet_open" title="Личный кабинет · тест 3 дня">
        <svg aria-hidden="true" className="cabinet-fab-icon" fill="none" viewBox="0 0 24 24">
          <path d="M20 21a8 8 0 0 0-16 0" stroke="currentColor" strokeLinecap="round" ></path>
          <circle cx="12" cy="8" r="4" stroke="currentColor" ></circle>
        </svg>
      </a>
    </>
  );
}
