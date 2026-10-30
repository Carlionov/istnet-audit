import type { JSX } from "react";
import type { ServerLocation } from "@/data/servers";
import type { ServerNodeView, ServerMonitorMode } from "@/components/runtime/ServerStatusProvider";

export interface LocationLegendItemProps {
  readonly location: ServerLocation;
  readonly mode: ServerMonitorMode;
  readonly node: ServerNodeView;
}

export function LocationLegendItem({ location, mode, node }: LocationLegendItemProps): JSX.Element {
  const pingLabel =
    mode === "demo"
      ? `≈ ${node.latencyMs ?? location.initialDemoPing}ms`
      : mode === "live" && node.latencyMs !== null
        ? `${node.latencyMs}ms`
        : mode === "live" && node.status !== "unknown"
          ? node.status.toUpperCase()
          : "—";

  return (
    <div className="leg-item">
      <span className="leg-flag">
        <svg aria-hidden="true" className="flag" focusable="false">
          <use href={`#${location.flagSpriteId}`} />
        </svg>
      </span>
      <div className="leg-meta">
        <h4>{location.country}</h4>
        <p>{`${location.city}${location.detailSuffix ?? ""}`}</p>
      </div>
      <span className={`leg-ping ${mode === "demo" ? "demo" : node.status}`}>
        {pingLabel}
      </span>
    </div>
  );
}
