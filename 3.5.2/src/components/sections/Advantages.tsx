import { TrackedLink } from "@/components/common/TrackedLink";
import { MISTNET_LINKS } from "@/lib/links";

const advantages = [
  {
    number: "01",
    title: "Четыре локации",
    text: "Выбирай подходящий регион: США, Финляндия, Нидерланды или Турция. Для Стамбула предусмотрено несколько вариантов подключения.",
    icon: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M3.5 12h17M12 3.5c2.2 2.3 3.2 5.1 3.2 8.5s-1 6.2-3.2 8.5c-2.2-2.3-3.2-5.1-3.2-8.5s1-6.2 3.2-8.5Z" />
      </>
    ),
  },
  {
    number: "02",
    title: "Несколько протоколов",
    text: "WireGuard, VLESS, XHTTP и Hysteria. Доступный вариант зависит от конфигурации и выбранного тарифа.",
    icon: (
      <>
        <path d="M12 3 4.5 7v5c0 4.2 2.7 7.6 7.5 9 4.8-1.4 7.5-4.8 7.5-9V7L12 3Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
  },
  {
    number: "03",
    title: "Telegram не обязателен",
    text: "В личный кабинет можно войти через Email и доступные способы авторизации. Покупка подписки также оформляется через сайт.",
    icon: (
      <>
        <rect x="4" y="5" width="16" height="14" rx="3" />
        <path d="m5 8 7 5 7-5M8 16h3" />
      </>
    ),
  },
  {
    number: "04",
    title: "Понятные тарифы",
    text: "START — 50 ГБ и до 3 устройств. TITAN — 100 ГБ и до 5 устройств, а также дополнительные варианты подключения.",
    icon: (
      <>
        <rect x="3.5" y="5" width="17" height="14" rx="2.5" />
        <path d="M3.5 9h17M7 14h4M7 16.5h7" />
      </>
    ),
  },
];

export function Advantages() {
  return (
    <section className="container section advantages-section" id="advantages" aria-labelledby="advantages-title">
      <div className="section-kicker">MISTNET БЕЗ ЛИШНИХ СЛОЖНОСТЕЙ</div>
      <h2 className="section-title" id="advantages-title">
        Всё важное — <span className="grad">уже внутри</span>
      </h2>
      <p className="section-subtitle">
        Выбирай локацию и подходящий тариф, а подпиской и подключением управляй в одном личном кабинете.
      </p>

      <div className="advantages-grid">
        {advantages.map((item) => (
          <article className="advantage-card" key={item.number}>
            <div className="advantage-card-top">
              <span className="advantage-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                  {item.icon}
                </svg>
              </span>
              <span className="advantage-number">{item.number}</span>
            </div>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </article>
        ))}
      </div>

      <div className="advantages-footer">
        <div>
          <strong>Можно начать без Telegram</strong>
          <p>Войди в кабинет удобным способом и активируй доступный бесплатный тест на 3 дня.</p>
        </div>
        <TrackedLink action="cabinet_open" className="advantages-link" href={MISTNET_LINKS.cabinet}>
          Открыть личный кабинет <span aria-hidden="true">↗</span>
        </TrackedLink>
      </div>
    </section>
  );
}
