import type { JSX } from "react";
import { TrackedLink } from "@/components/common/TrackedLink";
import { MISTNET_LINKS } from "@/lib/links";

export function HeroContent(): JSX.Element {
  return (
    <>
      <div className="logo-large logo-glitch" data-text="MISTNET">
        MIST<span>NET</span>
      </div>
      <h1>
        Свобода в каждой <span className="grad">секунде</span>
      </h1>
      <p className="hero-description">
        Высокоскоростной VPN без границ. Серверы в США, Финляндии, Нидерландах и Турции. <b>Обход белых списков.</b> Конфиденциальность и удобное подключение.
      </p>
      <p className="hero-offer">
        <span aria-hidden="true" className="hero-offer-icon">🎁</span>
        <span><b>Бесплатный тест на 3 дня</b> можно активировать в личном кабинете.</span>
      </p>
      <div className="btn-group">
        <TrackedLink action="trial_open" className="btn btn-primary" href={MISTNET_LINKS.cabinet}>
          Активировать 3 дня бесплатно ↗
        </TrackedLink>
        <a className="btn btn-secondary" href="#pricing">Выбрать тарифы</a>
      </div>
      <p className="hero-access-note">
        <span aria-hidden="true" className="hero-access-check">
          <svg aria-hidden="true" className="hero-access-check-icon" viewBox="0 0 16 16" fill="none">
            <path d="m3.5 8.2 2.8 2.7 6.2-6.1" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <span>Можно войти через Email, Google, Яндекс, VK или Telegram — мессенджер не обязателен.</span>
      </p>
    </>
  );
}
