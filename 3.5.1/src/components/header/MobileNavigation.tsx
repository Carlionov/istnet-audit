import { MISTNET_LINKS } from "@/lib/links";

export function MobileNavigation() {
  return (
    <div
      aria-hidden="true"
      aria-label="Мобильная навигация MISTNET"
      aria-modal="true"
      className="mnav"
      data-lenis-prevent=""
      id="mnav"
      inert
      role="dialog"
    >
      <nav aria-label="Мобильное меню">
        <a href="#advantages">Преимущества</a>
        <a href="#map">Локации</a>
        <a href="#pricing">Тарифы</a>
        <a href="#howTo">Как подключиться</a>
        <a href="#faq">FAQ</a>
        <a href={MISTNET_LINKS.cabinet} data-track="cabinet_open">
          Личный кабинет / бесплатный тест
        </a>
        <a href={MISTNET_LINKS.quickPurchase} data-track="quick_purchase">
          Купить подписку
        </a>
        <a href={MISTNET_LINKS.telegramBot} rel="noopener noreferrer" target="_blank">
          Telegram-бот (альтернатива)
        </a>
      </nav>
    </div>
  );
}
