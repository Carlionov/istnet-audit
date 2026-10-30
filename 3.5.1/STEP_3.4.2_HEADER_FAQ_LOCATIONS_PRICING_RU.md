# Шаг 3.4.2: Header, FAQ, Locations, Pricing

## Что сделано

Header декомпозирован на навигацию, действия и мобильное меню; добавлены семантика, `aria-expanded`, focus-trap и возврат фокуса. FAQ получил `aria-expanded`, `aria-controls`, `aria-hidden` и `inert`; поскольку `runtime.js` напрямую управляет раскрытием DOM, React-state оставлен на этап 3.5, а отдельный адаптер синхронизирует доступность.

Locations и Hero используют общий типизированный массив `src/data/servers.ts`. Тарифы вынесены в типизированные данные и переиспользуемый `PricingCard`; CTA-URL, тексты, `data-track` и `data-plan` сохранены. JSX inline-стили удалены и перенесены в классы. Предоставленный пользователем `mistnet-v2.css` включён в архив без потери исходного содержимого; в конец добавлены CSS-правила для извлечённых стилей секций.

## Структура изменений

```text
src/
├── app/
│   └── mistnet-v2.css
├── components/
│   ├── FaqAccessibility.tsx
│   ├── Header.tsx
│   ├── MobileMenuA11y.tsx
│   ├── header/
│   │   ├── HeaderActions.tsx
│   │   └── MobileNavigation.tsx
│   ├── hero/
│   │   ├── HeroServerList.tsx
│   │   ├── hero.data.ts
│   │   └── hero.types.ts
│   └── sections/
│       ├── FAQ.tsx
│       ├── FinalCTA.tsx
│       ├── Hero.tsx
│       ├── HowTo.tsx
│       ├── Locations.tsx
│       ├── Pricing.tsx
│       ├── locations/
│       │   ├── GlobeVisual.tsx
│       │   └── LocationLegendItem.tsx
│       └── pricing/
│           └── PricingCard.tsx
└── data/
    ├── pricing.ts
    └── servers.ts
```

Также обновлён корневой `README.md`. `public/mistnet-runtime.js`, `src/lib/links.ts`, `package.json`, `package-lock.json`, `tsconfig.json`, глобальные CSS-токены и DOM-контракты runtime не менялись.

## Сохранённые DOM-контракты

### Header и мобильная навигация

- `#navbar`, `.navbar` — остаются на основном `<nav>` внутри `<header>` (`src/components/Header.tsx`).
- `#burger`, `.burger`, `aria-controls="mnav"`, `aria-expanded` — кнопка бургера в `Header.tsx`; значение `aria-expanded` обновляет runtime и синхронизирует `MobileMenuA11y.tsx`.
- `#mnav`, `.mnav`, `.open`, `[data-lenis-prevent]` — мобильная панель в `header/MobileNavigation.tsx`; `runtime.js` продолжает переключать класс `.open` и `aria-hidden`.
- `.nav-links`, `.nav-actions`, `.nav-account-group`, `.nav-cabinet`, `.nav-search`, `#palOpen`, `.nav-btn.nav-cta`, `.magnetic`, `[data-track]` — размещены в `Header.tsx` и `header/HeaderActions.tsx` с прежними именами и атрибутами.

### FAQ

- `#faq`, `.faq-container`, `.faq-item`, `.faq-question`, `.faq-answer`, `.faq-icon`, `.active` сохранены в `sections/FAQ.tsx`.
- Вопрос и ответ остаются непосредственными соседями: runtime продолжает читать ответ через `button.nextElementSibling`.
- `aria-expanded` по-прежнему обновляется `runtime.js`; `aria-controls` и `id` вопросов/ответов добавлены для доступной связи.
- `FaqAccessibility.tsx` наблюдает изменения `class` и `aria-expanded`, после чего синхронизирует `inert` и `aria-hidden` скрытого ответа. Раскрытие и закрытие ещё не перенесены в React-state.

### Locations и Hero

- `#map`, `.globe-wrap`, `.globe-stage`, `.globe-fallback`, `#globeCanvas`, `#globeHint`, `.globe-legend`, `.leg-item`, `.leg-flag`, `.leg-meta`, `.leg-ping`, `#locationPingNote` сохранены в `sections/Locations.tsx`, `locations/GlobeVisual.tsx`, `locations/LocationLegendItem.tsx`.
- `[data-status-location]` остаётся на строках локаций и строках ping; `[data-leg-ping]` остаётся на значении ping в легенде; `[data-location-status]` остаётся в `hero/HeroServerList.tsx`.
- `#appDemoBadge` сохранён на бейдже демонстрационного статуса в `HeroServerList.tsx`.
- `#statusBadge`, `#statusLabel`, `#statusNote`, `[data-ping]`, `[data-node]` сохранены в `HeroPingPanel.tsx` и его повторяемых строках.
- Источник отображаемых стран, городов, флагов и демонстрационных значений — `src/data/servers.ts`.

### Pricing и аналитика

- `#pricing`, `.pricing-grid`, `.price-card`, `.featured`, `.reveal`, `.tilt-card`, `.price-name`, `.price-desc`, `.price-amount-wrap`, `.price-amount`, `.price-old`, `.price-discount`, `.price-period`, `.price-features`, `.trial`, `.bypass`, `.price-btn`, `.price-checkout-note`, `.price-btn-trial` сохранены в `sections/Pricing.tsx` и `sections/pricing/PricingCard.tsx`.
- `[data-track="quick_purchase"]`, `[data-track="trial_open"]` и `[data-plan="START|TITAN"]` сохранены на исходных CTA-ссылках. Ссылки берутся из неизменённого `src/lib/links.ts`.
- `.step-card`, `.final-cta`, `.btn`, `.magnetic`, `[data-track]` сохранены на соответствующих секциях, поэтому делегированная аналитика и визуальные эффекты продолжают находить элементы.

## Перенесённые inline-стили

- `src/components/sections/FinalCTA.tsx:14` — inline `boxShadow: "0 8px 26px var(--accent-glow)"` и `background: "linear-gradient(90deg,var(--accent),var(--primary))"` — класс `final-cta-primary` в `src/app/mistnet-v2.css`.
- `src/components/sections/HowTo.tsx:15` — inline `color: "var(--primary)"` — класс `step-link`.
- `src/components/sections/HowTo.tsx:24` — inline `color: "var(--primary)"` — класс `step-link`.
- Поиск `style=` в `src/**/*.{ts,tsx}` после изменений: совпадений нет.

## Обоснованные решения

- FAQ не переведён на React-state: `runtime.js:initFaq()` подписан на делегированный click `#faq`, самостоятельно меняет `.active`, `aria-expanded` и `style.maxHeight`; перенос управления отложен до этапа 3.5, чтобы не создавать двух конкурирующих владельцев состояния.
- Mobile menu не перенесено на React-state: `runtime.js:initMobileMenu()` самостоятельно управляет `.open`, `aria-hidden`, `aria-expanded`, `menu-open` и жизненным циклом Lenis; focus-trap и синхронизация `inert` реализованы адаптером до миграции.
- Декомпозиция Locations и Pricing сохраняет стабильные runtime-селекторы, а данные локаций и тарифов сделаны readonly и типизированными.
- CTA остаются элементами `<a>`, так как выполняют навигацию на отдельные URL; кнопки используются только для действий без навигации.

## Открытые решения к этапу 3.5

- Перенести открытие/закрытие FAQ в React-state и удалить DOM-мутации `initFaq()`.
- Перенести открытие/закрытие мобильного меню в React-state и объединить focus-trap, aria/inert и Lenis lifecycle.
- Перевести статусы и ping (`data-status-location`, `data-location-status`, `data-leg-ping`, `data-ping`) на типизированное React-состояние.
- Перенести делегированную аналитику `[data-track]` и чтение `data-plan` в React-обработчики.
- Отвязать командную палитру, reveal/GSAP и WebGL lifecycle от прямых DOM-мутаций там, где это входит в утверждённый объём миграции.
