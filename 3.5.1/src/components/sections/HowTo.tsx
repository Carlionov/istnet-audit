import { MISTNET_LINKS } from "@/lib/links";

export function HowTo() {
  return (
    <>
      <section className="container section" id="howTo">
        <h2 className="section-title reveal">{"Подключение без обязательного Telegram"}</h2>
        <p className="section-subtitle reveal">{"Начни в личном кабинете — там же можно активировать тест, купить подписку и получить данные для подключения."}</p>
        <div className="steps-grid">
          <div className="step-card reveal">
            <div className="step-number">{"01"}</div>
            <h3>{"Открой личный кабинет"}</h3>
            <p>
              {"Перейди на "}
              <a href={MISTNET_LINKS.cabinet} data-track="cabinet_open" className="step-link">{"lk.mistnet.ru"}</a>
              {". Войти можно через Email, Google, Яндекс, VK или Telegram — мессенджер не обязателен."}
            </p>
          </div>
          <div className="step-card reveal">
            <div className="step-number">{"02"}</div>
            <h3>{"Активируй тест или выбери тариф"}</h3>
            <p>
              {"Бесплатный тест на 3 дня активируется в кабинете. Для покупки открой "}
              <a href={MISTNET_LINKS.quickPurchase} data-track="quick_purchase" className="step-link">{"страницу оформления"}</a>
              {" — там доступны START и TITAN, периоды и способ оплаты."}
            </p>
          </div>
          <div className="step-card reveal">
            <div className="step-number">{"03"}</div>
            <h3>{"Получи конфигурацию и подключись"}</h3>
            <p>{"В кабинете открой данные для подключения, добавь конфигурацию в совместимое приложение — например, Happ или INCY — и включи VPN."}</p>
          </div>
        </div>
        <div className="cabinet-assist-note">
          <span className="cabinet-assist-icon" aria-hidden="true">{"✓"}</span>
          <div>
            <strong>{"Telegram не работает? Это не проблема."}</strong>
            <p>{"Для входа и оформления подписки можно использовать сайт личного кабинета. Telegram-бот остаётся дополнительным способом связи."}</p>
          </div>
          <a href={MISTNET_LINKS.cabinet} data-track="cabinet_open">{"Открыть кабинет ↗"}</a>
        </div>
      </section>
    </>
  );
}
