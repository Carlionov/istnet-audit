import { MISTNET_LINKS } from "@/lib/links";

export function FinalCTA() {
  return (
    <>
      <section className="final-cta reveal">
        <h2>
          {"Готов к "}
          <span className="grad">{"свободе"}</span>
          {"?"}
        </h2>
        <p>{"Активируй бесплатный тест или выбери подписку в личном кабинете. Telegram для этого не обязателен."}</p>
        <div className="btn-group">
          <a className="btn btn-primary magnetic final-cta-primary" href={MISTNET_LINKS.cabinet} data-track="trial_open">{"🎁 Начать бесплатно в кабинете ↗"}</a>
          <a className="btn btn-secondary magnetic" href={MISTNET_LINKS.quickPurchase} data-track="quick_purchase">{"Купить подписку →"}</a>
        </div>
        <div className="copy-hint">
          {"личный кабинет: "}
          <button type="button" className="copy-value" aria-label="Скопировать адрес личного кабинета" data-copy={MISTNET_LINKS.cabinet}>{"lk.mistnet.ru"}</button>
          {" · "}
          <a href={MISTNET_LINKS.telegramBot} rel="noopener noreferrer" target="_blank">{"Telegram-бот — альтернативный способ"}</a>
        </div>
      </section>
    </>
  );
}
