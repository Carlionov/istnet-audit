import Image from "next/image";
import type { JSX } from "react";

export function HeroMascot(): JSX.Element {
  return (
    <div className="mascot-scroll">
      <div className="mascot-wrap">
        <div aria-hidden="true" className="bot-say" id="botSay" />
        <span aria-hidden="true" className="orb o1">
          WireGuard
        </span>
        <span aria-hidden="true" className="orb o2">
          Cabinet First
        </span>
        <div className="mascot-glow" />
        <div className="holo-ring" />
        <div className="holo-ring r2" />
        <div className="mascot-stage">
          <svg
            aria-label="MISTNET Mascot"
            className="mascot-svg"
            viewBox="0 0 400 400"
          >
            <defs>
              <radialGradient cx="50%" cy="35%" id="shieldFill" r="65%">
                <stop offset="0%" stopColor="rgba(0,210,255,.55)" />
                <stop offset="55%" stopColor="rgba(0,150,220,.18)" />
                <stop offset="100%" stopColor="rgba(20,40,80,.05)" />
              </radialGradient>
              <linearGradient id="shieldStroke" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#33ddff" />
                <stop offset="100%" stopColor="#7c3aed" />
              </linearGradient>
              <filter
                height="160%"
                id="shieldGlow"
                width="160%"
                x="-30%"
                y="-30%"
              >
                <feGaussianBlur result="b" stdDeviation="6" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <g filter="url(#shieldGlow)">
              <path
                d="M200 50 L340 110 L340 220 Q340 320 200 365 Q60 320 60 220 L60 110 Z"
                fill="url(#shieldFill)"
                stroke="url(#shieldStroke)"
                strokeLinejoin="round"
                strokeWidth="2.5"
              />
              <path
                d="M200 75 L315 125 L315 220 Q315 300 200 340 Q85 300 85 220 L85 125 Z"
                fill="none"
                stroke="rgba(0,210,255,.3)"
                strokeDasharray="4 6"
                strokeWidth="1"
              />
              <path
                d="M160 200 L190 230 L245 165"
                fill="none"
                filter="url(#shieldGlow)"
                stroke="#fff"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="8"
              />
            </g>
            <circle
              cx="200"
              cy="200"
              fill="none"
              r="180"
              stroke="rgba(0,210,255,.08)"
              strokeDasharray="2 8"
              strokeWidth="1"
            />
          </svg>
          <Image
            alt="Талисман MISTNET: робот MN машет рукой"
            className="mascot-bot"
            height={960}
            priority
            quality={92}
            sizes="(max-width: 960px) 72vw, (max-width: 1400px) 38vw, 460px"
            src="/mascot.webp"
            width={640}
          />
        </div>
      </div>
    </div>
  );
}
