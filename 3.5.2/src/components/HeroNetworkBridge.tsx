export function HeroNetworkBridge() {
  return (
    <div className="hero-network-bridge" aria-hidden="true">
      <svg viewBox="0 0 460 300" role="presentation" focusable="false">
        <defs>
          <linearGradient id="bridgeLine" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#00d2ff" stopOpacity=".08" />
            <stop offset=".5" stopColor="#54dff1" stopOpacity=".62" />
            <stop offset="1" stopColor="#8b70ee" stopOpacity=".12" />
          </linearGradient>
          <radialGradient id="bridgeCore">
            <stop offset="0" stopColor="#0e4563" stopOpacity=".92" />
            <stop offset="1" stopColor="#081321" stopOpacity=".82" />
          </radialGradient>
          <filter id="bridgeGlow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <ellipse cx="230" cy="150" rx="177" ry="105" fill="none" stroke="#3ccce8" strokeOpacity=".10" strokeDasharray="2 8" />
        <ellipse cx="230" cy="150" rx="132" ry="78" fill="none" stroke="#8a77e8" strokeOpacity=".10" transform="rotate(-24 230 150)" />
        <g fill="none" stroke="url(#bridgeLine)" strokeWidth="1.6" strokeLinecap="round">
          <path className="bridge-route" d="M48 56 C106 57 143 104 230 150" />
          <path className="bridge-route bridge-route-b" d="M412 56 C350 62 322 104 230 150" />
          <path className="bridge-route bridge-route-c" d="M48 244 C108 239 150 195 230 150" />
          <path className="bridge-route bridge-route-d" d="M412 244 C350 236 313 196 230 150" />
          <path d="M48 56 Q230 -6 412 56" strokeOpacity=".12" />
          <path d="M48 244 Q230 306 412 244" strokeOpacity=".12" />
        </g>
        <g className="bridge-location bridge-location-us" transform="translate(48 56)">
          <circle r="13" fill="#071523" stroke="#3bd4ef" strokeOpacity=".45" />
          <circle r="4" fill="#57dff1" />
          <text x="0" y="-23" textAnchor="middle">US · NYC</text>
        </g>
        <g className="bridge-location bridge-location-fi" transform="translate(48 244)">
          <circle r="13" fill="#071523" stroke="#3bd4ef" strokeOpacity=".45" />
          <circle r="4" fill="#57dff1" />
          <text x="0" y="27" textAnchor="middle">FI · HEL</text>
        </g>
        <g className="bridge-location bridge-location-nl" transform="translate(412 56)">
          <circle r="13" fill="#071523" stroke="#9b83f4" strokeOpacity=".5" />
          <circle r="4" fill="#a58af7" />
          <text x="0" y="-23" textAnchor="middle">NL · AMS</text>
        </g>
        <g className="bridge-location bridge-location-tr" transform="translate(412 244)">
          <circle r="13" fill="#071523" stroke="#9b83f4" strokeOpacity=".5" />
          <circle r="4" fill="#a58af7" />
          <text x="0" y="27" textAnchor="middle">TR · IST</text>
        </g>
        <g filter="url(#bridgeGlow)">
          <circle cx="230" cy="150" r="49" fill="none" stroke="#46d8ee" strokeOpacity=".28" />
          <circle cx="230" cy="150" r="36" fill="url(#bridgeCore)" stroke="#4bd8ed" strokeOpacity=".62" />
          <circle cx="230" cy="150" r="27" fill="none" stroke="#8b70ee" strokeOpacity=".34" strokeDasharray="3 5" />
          <path d="M217 153 228 164 246 137" fill="none" stroke="#d9fbff" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        <text className="bridge-brand" x="230" y="211" textAnchor="middle">MISTNET NETWORK</text>
        <text className="bridge-sub" x="230" y="229" textAnchor="middle">4 ЛОКАЦИИ · 10 КОНФИГУРАЦИЙ</text>
      </svg>
    </div>
  );
}
