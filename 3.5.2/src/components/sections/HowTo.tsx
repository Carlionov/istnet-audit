import { TrackedLink } from "@/components/common/TrackedLink";
import { MISTNET_LINKS } from "@/lib/links";

export function HowTo() {
  return (
    <section className="container section" id="howTo">
      <h2 className="section-title">Подключение без обязательного Telegram</h2>
      <p className="section-subtitle">
        Начни в личном кабинете — там же можно активировать тест, купить подписку и получить данные для подключения.
      </p>

      <div className="steps-grid">
        <div className="step-card">
          <div className="step-number">01</div>
          <h3>Открой личный кабинет</h3>
          <p>
            Перейди на <TrackedLink action="cabinet_open" className="step-link" href={MISTNET_LINKS.cabinet}>lk.mistnet.ru</TrackedLink>.
            Войти можно через Email, Google, Яндекс, VK или Telegram — мессенджер не обязателен.
          </p>
        </div>

        <div className="step-card">
          <div className="step-number">02</div>
          <h3>Активируй тест или выбери тариф</h3>
          <p>
            Бесплатный тест на 3 дня активируется в кабинете. Для покупки открой{" "}
            <TrackedLink action="quick_purchase" className="step-link" href={MISTNET_LINKS.quickPurchase}>страницу оформления</TrackedLink>
            {" "}— там доступны START и TITAN, периоды и способ оплаты.
          </p>
        </div>

        <div className="step-card">
          <div className="step-number">03</div>
          <h3>Получи конфигурацию и подключись</h3>
          <p>
            В кабинете открой данные для подключения, добавь конфигурацию в совместимое приложение — например, Happ или INCY — и включи VPN.
          </p>
        </div>
      </div>

      <div className="cabinet-assist-note">
        <span className="cabinet-assist-icon" aria-hidden="true">✓</span>
        <div>
          <strong>Telegram не работает? Это не проблема.</strong>
          <p>
            Для входа и оформления подписки можно использовать сайт личного кабинета. Telegram-бот остаётся дополнительным способом связи.
          </p>
        </div>
        <TrackedLink action="cabinet_open" href={MISTNET_LINKS.cabinet}>Открыть кабинет ↗</TrackedLink>
      </div>
    </section>
  );
}
