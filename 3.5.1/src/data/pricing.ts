export type PricingPlanId = "START" | "TITAN";
export type PricingFeatureTone = "trial" | "bypass";

export interface PricingFeature {
  readonly label: string;
  readonly tone?: PricingFeatureTone;
}

export interface PricingPlan {
  readonly id: PricingPlanId;
  readonly name: string;
  readonly description: string;
  readonly amount: string;
  readonly oldAmount: string;
  readonly discount: string;
  readonly period: string;
  readonly features: readonly PricingFeature[];
  readonly badge?: string;
  readonly primaryAction: string;
  readonly checkoutNote?: string;
  readonly trialAction?: string;
}

export const PRICING_PLANS: readonly PricingPlan[] = [
  {
    id: "START",
    name: "⚡ START — «Свобода»",
    description:
      "Быстрый VPN для повседневного серфинга. Доступные стандартные локации указаны в личном кабинете.",
    amount: "89,10 ₽",
    oldAmount: "99,00 ₽",
    discount: "-10%",
    period: "в месяц",
    features: [
      { label: "50 ГБ трафика" },
      { label: "3 устройства" },
      { label: "Все стандартные локации" },
      { label: "Поддержка" },
    ],
    primaryAction: "Выбрать START в кабинете ↗",
    checkoutNote: "START выберешь на странице оформления",
  },
  {
    id: "TITAN",
    name: "👑 TITAN — «Без границ»",
    description:
      "Расширенные варианты подключения для более сложных сетевых условий. Доступность зависит от оператора, региона и текущих ограничений.",
    amount: "179,10 ₽",
    oldAmount: "199,00 ₽",
    discount: "-10%",
    period: "в месяц",
    features: [
      { label: "Бесплатный тест на 3 дня", tone: "trial" },
      { label: "Дополнительные варианты подключения", tone: "bypass" },
      { label: "100 ГБ трафика" },
      { label: "5 устройств" },
      { label: "Приоритетная поддержка" },
      { label: "Kill Switch и Split-tunneling" },
    ],
    badge: "⭐ ВЫГОДНО",
    primaryAction: "Выбрать TITAN в кабинете ↗",
    trialAction: "🎁 Активировать тест в личном кабинете",
  },
];
