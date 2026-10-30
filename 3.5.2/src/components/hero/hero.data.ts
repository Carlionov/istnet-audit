import type { HeroAppEntry, HeroStatistic } from "@/components/hero/hero.types";
export const HERO_APP_ENTRIES: readonly HeroAppEntry[] = [
  {
    kind: "feature",
    id: "lte-mode",
    title: "Только при глушилках (LTE)",
    description: "Специальный режим TITAN",
    badge: "TITAN",
  },
  {
    kind: "server",
    id: "nl-1",
    locationId: "nl",
    serverNumber: 1,
    detail: "MistNet VPN",
  },
  {
    kind: "server",
    id: "nl-2",
    locationId: "nl",
    serverNumber: 2,
    detail: "MistNet VPN",
  },
  {
    kind: "server",
    id: "us-1",
    locationId: "us",
    serverNumber: 1,
    detail: "MistNet VPN",
  },
  {
    kind: "server",
    id: "us-2",
    locationId: "us",
    serverNumber: 2,
    detail: "MistNet VPN",
  },
  {
    kind: "server",
    id: "fi-1",
    locationId: "fi",
    serverNumber: 1,
    detail: "MistNet VPN",
  },
  {
    kind: "server",
    id: "tr-1",
    locationId: "tr",
    serverNumber: 1,
    detail: "VLESS / TCP / REALITY",
  },
  {
    kind: "server",
    id: "tr-2",
    locationId: "tr",
    serverNumber: 2,
    detail: "VLESS / GRPC / REALITY",
  },
  {
    kind: "server",
    id: "tr-3",
    locationId: "tr",
    serverNumber: 3,
    detail: "VLESS / XHTTP / REALITY",
  },
  {
    kind: "server",
    id: "tr-4",
    locationId: "tr",
    serverNumber: 4,
    detail: "HYSTERIA / TLS",
  },
];

export const HERO_STATS: readonly HeroStatistic[] = [
  {
    kind: "counter",
    id: "locations",
    value: "4",
    counterValue: 4,
    counterSuffix: "",
    label: "Локации",
    className: "stat-item",
  },
  {
    kind: "counter",
    id: "plans",
    value: "2",
    counterValue: 2,
    counterSuffix: "",
    label: "Тарифа",
    className: "stat-item",
  },
  {
    kind: "text",
    id: "trial",
    value: "3 дня",
    label: "Бесплатный тест",
    className: "stat-item stat-item-trial",
  },
];

export const HERO_APP_SUMMARY = "10 конфигураций · 4 локации";
