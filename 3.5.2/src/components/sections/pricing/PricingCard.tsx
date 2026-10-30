import type { JSX } from "react";
import { TrackedLink } from "@/components/common/TrackedLink";
import { MISTNET_LINKS } from "@/lib/links";
import type { PricingPlan } from "@/data/pricing";

export interface PricingCardProps {
  readonly plan: PricingPlan;
}

export function PricingCard({ plan }: PricingCardProps): JSX.Element {
  const cardClassName = plan.id === "TITAN"
    ? "price-card featured"
    : "price-card";

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
          <li className={feature.tone} key={feature.label}>{feature.label}</li>
        ))}
      </ul>
      <TrackedLink
        action="quick_purchase"
        className="price-btn"
        href={MISTNET_LINKS.quickPurchase}
        plan={plan.id}
      >
        {plan.primaryAction}
      </TrackedLink>
      {plan.checkoutNote ? <p className="price-checkout-note">{plan.checkoutNote}</p> : null}
      {plan.trialAction ? (
        <TrackedLink action="trial_open" className="price-btn-trial" href={MISTNET_LINKS.cabinet}>
          {plan.trialAction}
        </TrackedLink>
      ) : null}
    </article>
  );
}
