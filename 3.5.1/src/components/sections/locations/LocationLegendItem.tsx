import type { JSX } from "react";
import type { ServerLocation } from "@/data/servers";

export interface LocationLegendItemProps {
  readonly location: ServerLocation;
}

export function LocationLegendItem({ location }: LocationLegendItemProps): JSX.Element {
  return (
    <div className="leg-item" data-status-location={location.id}>
      <span className="leg-flag">
        <svg aria-hidden="true" className="flag" focusable="false">
          <use href={`#${location.flagSpriteId}`} />
        </svg>
      </span>
      <div className="leg-meta">
        <h4>{location.country}</h4>
        <p>{`${location.city}${location.detailSuffix ?? ""}`}</p>
      </div>
      <span className="leg-ping" data-leg-ping={location.id}>
        {`≈ ${location.initialDemoPing}ms`}
      </span>
    </div>
  );
}
