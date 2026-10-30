import type { JSX } from "react";
import { FeatureIcon } from "@/components/icons/FeatureIcon";
import type { FeatureIconName } from "@/components/icons/FeatureIcon";

interface TrustBarItem {
  readonly label: string;
  readonly icon: FeatureIconName;
}

const TRUST_ITEMS: readonly TrustBarItem[] = [
  { label: "WireGuard", icon: "shield" },
  { label: "VLESS / XHTTP", icon: "network" },
  { label: "Hysteria", icon: "activity" },
  { label: "4 локации", icon: "globe" },
  { label: "Вход без Telegram", icon: "user" },
  { label: "Тест 3 дня", icon: "gift" },
];

export function TrustBar(): JSX.Element {
  return (
    <ul className="trust-bar reveal" aria-label="Ключевые особенности MISTNET">
      {TRUST_ITEMS.map((item) => (
        <li className="trust-item" key={item.label}>
          <span className="trust-mark" aria-hidden="true">
            <FeatureIcon name={item.icon} size="lg" />
          </span>
          <span className="trust-label">{item.label}</span>
        </li>
      ))}
    </ul>
  );
}
