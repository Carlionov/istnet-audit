import { MISTNET_LINKS } from "@/lib/links";
import type { FooterLinkColumnData } from "@/components/footer/footer.types";

export const FOOTER_LINK_COLUMNS: readonly FooterLinkColumnData[] = [
  {
    title: "Продукт",
    links: [
      { label: "Тарифы", href: "#pricing", target: null },
      { label: "Локации", href: "#map", target: null },
      { label: "FAQ", href: "#faq", target: null },
      {
        label: "Купить подписку",
        href: MISTNET_LINKS.quickPurchase,
        target: null,
        conversionAction: "quick_purchase",
      },
    ],
  },
  {
    title: "Личный кабинет и связь",
    links: [
      {
        label: "Личный кабинет / бесплатный тест",
        href: MISTNET_LINKS.cabinet,
        target: null,
      },
      {
        label: "Поддержка в Telegram",
        href: MISTNET_LINKS.telegramSupport,
        target: "_blank",
      },
      {
        label: "Telegram-бот (альтернатива)",
        href: MISTNET_LINKS.telegramBot,
        target: "_blank",
      },
    ],
  },
];
