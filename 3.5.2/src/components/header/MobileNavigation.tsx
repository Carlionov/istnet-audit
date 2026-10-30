import type { RefObject } from "react";
import { TrackedLink } from "@/components/common/TrackedLink";
import { MISTNET_LINKS } from "@/lib/links";

export interface MobileNavigationProps {
  readonly menuOpen: boolean;
  readonly onNavigate: () => void;
  readonly menuRef: RefObject<HTMLDivElement | null>;
}

export function MobileNavigation({ menuOpen, onNavigate, menuRef }: MobileNavigationProps) {
  return (
    <div
      aria-hidden={!menuOpen}
      aria-label="Мобильная навигация MISTNET"
      aria-modal={menuOpen ? true : undefined}
      className={`mnav${menuOpen ? " open" : ""}`}
      id="mnav"
      inert={!menuOpen}
      ref={menuRef}
      role="dialog"
    >
      <nav aria-label="Мобильное меню">
        <a href="#advantages" onClick={onNavigate}>Преимущества</a>
        <a href="#map" onClick={onNavigate}>Локации</a>
        <a href="#pricing" onClick={onNavigate}>Тарифы</a>
        <a href="#howTo" onClick={onNavigate}>Как подключиться</a>
        <a href="#faq" onClick={onNavigate}>FAQ</a>
        <TrackedLink action="cabinet_open" href={MISTNET_LINKS.cabinet} onClick={onNavigate}>
          Личный кабинет / бесплатный тест
        </TrackedLink>
        <TrackedLink action="quick_purchase" href={MISTNET_LINKS.quickPurchase} onClick={onNavigate}>
          Купить подписку
        </TrackedLink>
        <a href={MISTNET_LINKS.telegramBot} onClick={onNavigate} rel="noopener noreferrer" target="_blank">
          Telegram-бот (альтернатива)
        </a>
      </nav>
    </div>
  );
}
