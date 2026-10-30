import type { ServerLocation, ServerLocationId } from "@/data/servers";

export type HeroLocationId = ServerLocationId;
export type HeroLocation = ServerLocation;

export interface HeroFeatureEntry {
  readonly kind: "feature";
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly badge: string;
}

export interface HeroServerEntry {
  readonly kind: "server";
  readonly id: string;
  readonly locationId: HeroLocationId;
  readonly serverNumber: number;
  readonly detail: string;
}

export type HeroAppEntry = HeroFeatureEntry | HeroServerEntry;

export interface HeroCounterStatistic {
  readonly kind: "counter";
  readonly id: string;
  readonly value: string;
  readonly counterValue: number;
  readonly counterSuffix: string;
  readonly label: string;
  readonly className: string;
}

export interface HeroTextStatistic {
  readonly kind: "text";
  readonly id: string;
  readonly value: string;
  readonly label: string;
  readonly className: string;
}

export type HeroStatistic = HeroCounterStatistic | HeroTextStatistic;
