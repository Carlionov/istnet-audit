export type ServerLocationId = "us" | "fi" | "nl" | "tr";

export interface ServerLocation {
  readonly id: ServerLocationId;
  readonly country: string;
  readonly city: string;
  readonly detailSuffix?: string;
  readonly flagSpriteId: string;
  readonly initialDemoPing: number;
}

export const SERVER_LOCATIONS: readonly ServerLocation[] = [
  {
    id: "us",
    country: "США",
    city: "Нью-Йорк",
    flagSpriteId: "f-us",
    initialDemoPing: 86,
  },
  {
    id: "fi",
    country: "Финляндия",
    city: "Хельсинки",
    flagSpriteId: "f-fi",
    initialDemoPing: 48,
  },
  {
    id: "nl",
    country: "Нидерланды",
    city: "Амстердам",
    flagSpriteId: "f-nl",
    initialDemoPing: 57,
  },
  {
    id: "tr",
    country: "Турция",
    city: "Стамбул",
    detailSuffix: " · 4 конфигурации",
    flagSpriteId: "f-tr",
    initialDemoPing: 73,
  },
];

export const SERVER_LOCATION_BY_ID: Readonly<
  Record<ServerLocationId, (typeof SERVER_LOCATIONS)[number]>
> = {
  us: SERVER_LOCATIONS[0],
  fi: SERVER_LOCATIONS[1],
  nl: SERVER_LOCATIONS[2],
  tr: SERVER_LOCATIONS[3],
};
