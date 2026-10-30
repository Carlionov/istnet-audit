"use client";

import type { JSX } from "react";
import type { HeroLocation } from "@/components/hero/hero.types";
import { useServerStatus } from "@/components/runtime/ServerStatusProvider";

export interface HeroPingPanelProps {
  readonly locations: readonly HeroLocation[];
}

function getBarLevel(latencyMs: number | null): number {
  if (latencyMs === null) return 0;
  const width = 20 + ((94 - latencyMs) / (94 - 42)) * 74;
  return Math.max(0, Math.min(100, Math.round(width / 10) * 10));
}

export function HeroPingPanel({ locations }: HeroPingPanelProps): JSX.Element {
  const { mode, nodes, summary, message } = useServerStatus();
  const statusClass =
    mode === "demo"
      ? "demo"
      : mode === "live"
        ? locations.some((location) => nodes[location.id].status === "offline")
          ? "offline"
          : locations.some((location) => nodes[location.id].status === "online")
            ? "online"
            : "neutral"
        : "neutral";

  return (
    <div className="ping-widget">
      <div className="ping-header">
        <span>Состояние серверов</span>
        <span className={`ping-status ping-status-${statusClass}`}>
          <span aria-hidden="true" className="ping-dot" />
          <span>{summary}</span>
        </span>
      </div>

      <div className="ping-row ping-row-feature">
        <span className="node">🛡️ Режим обхода ограничений</span>
        <span className="ping-feature-tag">TITAN</span>
        <span className="val">—</span>
      </div>

      {locations.map((location) => {
        const node = nodes[location.id];
        const level = getBarLevel(node.latencyMs);
        const value = node.latencyMs === null ? "—" : `${node.latencyMs}ms`;

        return (
          <div className="ping-row" key={location.id}>
            <span className="node">
              <svg aria-hidden="true" className="flag" focusable="false">
                <use href={`#${location.flagSpriteId}`} />
              </svg>
              {` ${location.country} · ${location.city}`}
            </span>
            <div className="ping-bar" aria-hidden="true">
              <div className={`ping-bar-fill ping-width-${level}`} />
            </div>
            <span className={`val ${mode === "demo" ? "demo-ping-value" : ""}`}>
              {value}
            </span>
          </div>
        );
      })}

      <div className="ping-note">
        {message}
      </div>
    </div>
  );
}
