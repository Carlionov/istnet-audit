export interface FooterLinkItem {
  readonly label: string;
  readonly href: string;
  readonly target: "_blank" | null;
  readonly dataTrack?: "quick_purchase";
}

export interface FooterLinkColumnData {
  readonly title: string;
  readonly links: readonly FooterLinkItem[];
}
