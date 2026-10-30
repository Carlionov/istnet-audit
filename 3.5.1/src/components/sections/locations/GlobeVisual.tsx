import type { JSX } from "react";

export function GlobeVisual(): JSX.Element {
  return (
    <div className="globe-stage">
      <svg aria-hidden="true" className="globe-fallback" viewBox="0 0 460 460" fill="none">
        <defs>
          <radialGradient id="globeFallbackFill" cx="36%" cy="30%" r="72%">
            <stop offset="0%" stopColor="#174c69" stopOpacity=".55" />
            <stop offset="100%" stopColor="#071321" stopOpacity=".12" />
          </radialGradient>
        </defs>
        <circle cx="230" cy="230" r="176" fill="url(#globeFallbackFill)" stroke="#38cce8" strokeOpacity=".3" />
        <ellipse cx="230" cy="230" rx="176" ry="74" stroke="#38cce8" strokeOpacity=".18" />
        <ellipse cx="230" cy="230" rx="82" ry="176" stroke="#38cce8" strokeOpacity=".16" />
        <path d="M70 188c55 27 101 35 160 35 58 0 106-8 160-35M70 272c55-27 101-35 160-35 58 0 106 8 160 35" stroke="#38cce8" strokeOpacity=".14" />
        <path d="m112 162 113 72 132-85M225 234l-30 112M225 234l138 78" stroke="#43cbe9" strokeOpacity=".35" strokeDasharray="4 7" />
        <circle cx="112" cy="162" r="6" fill="#68e4f4" />
        <circle cx="225" cy="234" r="6" fill="#68e4f4" />
        <circle cx="357" cy="149" r="6" fill="#68e4f4" />
        <circle cx="195" cy="346" r="6" fill="#68e4f4" />
        <circle cx="363" cy="312" r="6" fill="#68e4f4" />
      </svg>
      <canvas aria-label="Интерактивный 3D-глобус с серверами MISTNET" id="globeCanvas" role="img" />
      <div className="globe-hint" id="globeHint">перетащи, чтобы вращать</div>
    </div>
  );
}
