import { CopyValueButton } from "@/components/common/CopyValueButton";
import { TrackedLink } from "@/components/common/TrackedLink";
import { MISTNET_LINKS } from "@/lib/links";

export function FinalCTA() {
  return (
    <section className="final-cta">
      <h2>
        Готов к <span className="grad">свободе</span>?
      </h2>
      <p>Активируй бесплатный тест или выбери подписку в личном кабинете. Telegram для этого не обязателен.</p>
      <div className="btn-group">
        <TrackedLink action="trial_open" className="btn btn-primary final-cta-primary" href={MISTNET_LINKS.cabinet}>
          🎁 Начать бесплатно в кабинете ↗
        </TrackedLink>
        <TrackedLink action="quick_purchase" className="btn btn-secondary" href={MISTNET_LINKS.quickPurchase}>
          Купить подписку →
        </TrackedLink>
      </div>
      <div className="copy-hint">
        личный кабинет: <CopyValueButton label="Скопировать адрес личного кабинета" value={MISTNET_LINKS.cabinet}>lk.mistnet.ru</CopyValueButton>
        {" · "}
        <a href={MISTNET_LINKS.telegramBot} rel="noopener noreferrer" target="_blank">
          Telegram-бот — альтернативный способ
        </a>
      </div>
    </section>
  );
}
