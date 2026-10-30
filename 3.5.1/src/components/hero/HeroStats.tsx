import type { JSX } from "react";
import type { HeroStatistic } from "@/components/hero/hero.types";

export interface HeroStatsProps {
  readonly items: readonly HeroStatistic[];
}

export function HeroStats({ items }: HeroStatsProps): JSX.Element {
  return (
    <div className="stats" aria-label="Ключевые параметры MISTNET">
      {items.map((item) => (
        <div className={item.className} key={item.id}>
          {item.kind === "counter" ? (
            <h4 data-counter={item.counterValue} data-suffix={item.counterSuffix}>
              {item.value}
            </h4>
          ) : (
            <h4>{item.value}</h4>
          )}
          <p>{item.label}</p>
        </div>
      ))}
    </div>
  );
}
