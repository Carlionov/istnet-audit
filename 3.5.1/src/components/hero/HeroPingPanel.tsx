import type { JSX } from "react";
import type { HeroLocation } from "@/components/hero/hero.types";
import styles from "@/components/hero/HeroPingPanel.module.css";

export interface HeroPingPanelProps {
  readonly locations: readonly HeroLocation[];
}

export function HeroPingPanel({ locations }: HeroPingPanelProps): JSX.Element {
  return (
    <div className="ping-widget reveal">
      <div className="ping-header">
        <span>Состояние серверов</span>
        <span className="ping-status ping-status-neutral" id="statusBadge">
          <span className="ping-dot" />
          <span id="statusLabel">ДЕМО-ПИНГ · API НЕ ПОДКЛЮЧЁН</span>
        </span>
      </div>

      <div className="ping-row ping-row-feature">
        <span className="node">🛡️ Режим обхода ограничений</span>
        <span className="ping-feature-tag">TITAN</span>
        <span className="val">—</span>
      </div>

      {locations.map((location) => (
        <div
          className="ping-row"
          data-status-location={location.id}
          key={location.id}
        >
          <span className="node">
            <svg aria-hidden="true" className="flag" focusable="false">
              <use href={`#${location.flagSpriteId}`} />
            </svg>
            {` ${location.country} · ${location.city}`}
          </span>
          <div className="ping-bar">
            <div
              className={`ping-bar-fill ${styles.initialBar}`}
              data-node={location.id}
            />
          </div>
          <span className="val demo-ping-value" data-ping={location.id}>
            {`${location.initialDemoPing}ms`}
          </span>
        </div>
      ))}

      <div className="ping-note" id="statusNote">
        Демонстрационные значения меняются в диапазоне 42–94 мс. Это не реальные
        замеры и не подтверждение доступности серверов.
      </div>
    </div>
  );
}
