"use client";

import type { JSX } from "react";
import {
  HERO_APP_ENTRIES,
  HERO_APP_SUMMARY,
} from "@/components/hero/hero.data";
import type { HeroAppEntry } from "@/components/hero/hero.types";
import { useServerStatus } from "@/components/runtime/ServerStatusProvider";
import { SERVER_LOCATION_BY_ID } from "@/data/servers";

interface HeroAppEntryRowProps {
  readonly entry: HeroAppEntry;
}

function HeroAppEntryRow({ entry }: HeroAppEntryRowProps): JSX.Element {
  const { mode, nodes } = useServerStatus();

  if (entry.kind === "feature") {
    return (
      <li>
        <span aria-hidden="true" className="app-ico">
          <svg
            className="hero-server-feature-icon"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            viewBox="0 0 24 24"
          >
            <path d="M4 18v-3M9 18v-6M14 18V9M19 18V5" />
          </svg>
        </span>
        <div>
          <b>{entry.title}</b>
          <small>{entry.description}</small>
        </div>
        <em className="ms feature">{entry.badge}</em>
      </li>
    );
  }

  const location = SERVER_LOCATION_BY_ID[entry.locationId];
  const node = nodes[location.id];
  const statusClass = mode === "demo" ? "demo" : node.status;
  const statusText =
    mode === "demo"
      ? `≈ ${node.latencyMs ?? location.initialDemoPing}ms`
      : mode === "live" && node.status !== "unknown"
        ? node.status.toUpperCase()
        : "—";

  return (
    <li data-status-location={location.id}>
      <span aria-hidden="true" className="app-ico">
        <svg aria-hidden="true" className="flag" focusable="false">
          <use href={`#${location.flagSpriteId}`} />
        </svg>
      </span>
      <div>
        <b>{`MN - ${location.country} #${entry.serverNumber}`}</b>
        <small>{`${location.city} · ${entry.detail}`}</small>
      </div>
      <em className={`ms ${statusClass}`}>
        {statusText}
      </em>
    </li>
  );
}

export function HeroServerList(): JSX.Element {
  const { mode } = useServerStatus();

  return (
    <div className="app-scroll">
      <aside aria-label="Серверы MISTNET в приложении" className="app-list">
        <div className="app-head">
          <span>Серверы в приложении</span>
          <span className="app-demo-badge" hidden={mode !== "demo"}>
            ДЕМО-ПИНГ
          </span>
        </div>
        <ul>
          {HERO_APP_ENTRIES.map((entry) => (
            <HeroAppEntryRow entry={entry} key={entry.id} />
          ))}
        </ul>
        <div className="app-more">{HERO_APP_SUMMARY}</div>
      </aside>
    </div>
  );
}
