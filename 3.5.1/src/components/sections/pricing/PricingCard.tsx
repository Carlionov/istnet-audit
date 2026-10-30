import type { JSX } from "react";
import { MISTNET_LINKS } from "@/lib/links";
import type { PricingPlan } from "@/data/pricing";

export interface PricingCardProps {
  readonly plan: PricingPlan;
}

export function PricingCard({ plan }: PricingCardProps): JSX.Element {
  const cardClassName =
    plan.id === "TITAN"
      ? "price-card featured reveal tilt-card"
      : "price-card reveal tilt-card";

  return (
    <article className={cardClassName} aria-label={`Тариф ${plan.id}`}>
      {plan.badge ? <div className="price-badge">{plan.badge}</div> : null}
      <div className="price-name">{plan.name}</div>
      <div className="price-desc">{plan.description}</div>
      <div className="price-amount-wrap">
        <div className="price-amount">{plan.amount}</div>
        <div className="price-old">{plan.oldAmount}</div>
        <div className="price-discount">{plan.discount}</div>
      </div>
      <div className="price-period">{plan.period}</div>
      <ul className="price-features">
        {plan.features.map((feature) => (
          <li className={feature.tone} key={feature.label}>
            {feature.label}
          </li>
        ))}
      </ul>
      <a
        className="price-btn"
        href={MISTNET_LINKS.quickPurchase}
        data-track="quick_purchase"
        data-plan={plan.id}
      >
        {plan.primaryAction}
      </a>
      {plan.checkoutNote ? (
        <p className="price-checkout-note">{plan.checkoutNote}</p>
      ) : null}
      {plan.trialAction ? (
        <a
          className="price-btn-trial"
          href={MISTNET_LINKS.cabinet}
          data-track="trial_open"
        >
          {plan.trialAction}
        </a>
      ) : null}
    </article>
  );
}
