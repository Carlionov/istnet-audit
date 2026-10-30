import type { MistnetConversionAction } from "@/lib/runtime/contracts";
export interface FooterLinkItem {
  readonly label: string;
  readonly href: string;
  readonly target: "_blank" | null;
  readonly conversionAction?: MistnetConversionAction;
}

export interface FooterLinkColumnData {
  readonly title: string;
  readonly links: readonly FooterLinkItem[];
}
