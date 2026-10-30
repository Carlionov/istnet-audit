import type { JSX } from "react";

export type FeatureIconName =
  | "shield"
  | "network"
  | "activity"
  | "globe"
  | "user"
  | "gift";

export type FeatureIconSize = "sm" | "md" | "lg";

export interface FeatureIconProps {
  readonly name: FeatureIconName;
  readonly size?: FeatureIconSize;
  readonly className?: string;
}

export function FeatureIcon({
  name,
  size = "md",
  className = "trust-icon",
}: FeatureIconProps): JSX.Element {
  const classes = ["feature-icon", `feature-icon--${size}`, className]
    .filter(Boolean)
    .join(" ");

  return (
    <svg
      aria-hidden="true"
      className={classes}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
    >
      {name === "shield" && (
        <>
          <path d="M12 3 19 6v5.2c0 4.4-2.9 7.7-7 9.8-4.1-2.1-7-5.4-7-9.8V6l7-3Z" />
          <path d="m9 12 2 2 4-4" />
        </>
      )}
      {name === "network" && (
        <>
          <rect height="5" rx="1.4" width="6" x="9" y="3" />
          <rect height="5" rx="1.4" width="6" x="3" y="16" />
          <rect height="5" rx="1.4" width="6" x="15" y="16" />
          <path d="M12 8v4M6 16v-4h12v4" />
        </>
      )}
      {name === "activity" && <path d="M3 12h4l2.2-6 4.1 12 2.1-6H21" />}
      {name === "globe" && (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
        </>
      )}
      {name === "user" && (
        <>
          <circle cx="9" cy="8" r="3.2" />
          <path d="M3.5 20c.5-3.2 2.4-5 5.5-5 1.3 0 2.4.3 3.2.9M16 11l2 2 3.5-4" />
        </>
      )}
      {name === "gift" && (
        <>
          <rect height="12" rx="2" width="18" x="3" y="9" />
          <path d="M12 9v12M2.5 6h19v3h-19zM12 6H8.8a2.3 2.3 0 1 1 2.2-2.9L12 6Zm0 0h3.2a2.3 2.3 0 1 0-2.2-2.9L12 6Z" />
        </>
      )}
    </svg>
  );
}
