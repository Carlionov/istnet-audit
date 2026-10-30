import type { JSX } from "react";
import { PricingCard } from "@/components/sections/pricing/PricingCard";
import { PRICING_PLANS } from "@/data/pricing";

export function Pricing(): JSX.Element {
  return (
    <section className="container section" id="pricing">
      <h2 className="section-title reveal">Выберите тариф</h2>
      <p className="section-subtitle reveal">
        Два понятных тарифа — выбери свой.
        <br />
        Период и оплату можно выбрать на следующем шаге в личном кабинете.
      </p>
      <div className="pricing-grid">
        {PRICING_PLANS.map((plan) => (
          <PricingCard key={plan.id} plan={plan} />
        ))}
      </div>
      <p className="pricing-cabinet-hint reveal">
        На единой странице оформления выбери тариф START или TITAN, период 1 / 2 / 3 месяца и доступный способ оплаты. Для покупки можно указать Email — Telegram не обязателен.
      </p>
    </section>
  );
}
