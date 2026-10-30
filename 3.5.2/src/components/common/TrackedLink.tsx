"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";
import { trackMistnetConversion } from "@/lib/runtime/tracking";
import type { MistnetConversionAction } from "@/lib/runtime/contracts";

export interface TrackedLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  readonly href: string;
  readonly action: MistnetConversionAction;
  readonly plan?: string | null;
  readonly children: ReactNode;
}

export function TrackedLink({
  href,
  action,
  plan = null,
  onClick,
  children,
  ...props
}: TrackedLinkProps) {
  return (
    <a
      {...props}
      href={href}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
          trackMistnetConversion({ event: action, plan, destination: href });
        }
      }}
    >
      {children}
    </a>
  );
}
