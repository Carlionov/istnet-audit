# Шаг 3.5.2: Полный переход на React и удаление runtime.js

## Что делаем

Удаляем императивный `public/mistnet-runtime.js` и обёртку загрузки. Интерактивность переводим на React state, client components и lifecycle hooks; браузерные таймеры и подписки очищаются при unmount/смене зависимостей.

## Структура

### Добавлены
- `src/components/command/CommandPalette.tsx`
- `src/components/common/CopyValueButton.tsx`
- `src/components/common/TrackedLink.tsx`
- `src/components/runtime/RuntimeUIProvider.tsx`
- `src/components/runtime/ServerStatusProvider.tsx`
- `src/types/window.d.ts`

### Изменены
- `scripts/qa-static.mjs`
- `src/app/api/status/route.ts`
- `src/app/globals.css`
- `src/app/mistnet-v2.css`
- `src/app/not-found.tsx`
- `src/app/page.tsx`
- `src/components/Header.tsx`
- `src/components/SiteDecorations.tsx`
- `src/components/SiteOverlays.tsx`
- `src/components/footer/FooterLinkColumn.tsx`
- `src/components/footer/footer.data.ts`
- `src/components/footer/footer.types.ts`
- `src/components/header/HeaderActions.tsx`
- `src/components/header/MobileNavigation.tsx`
- `src/components/hero/HeroContent.tsx`
- `src/components/hero/HeroMascot.tsx`
- `src/components/hero/HeroPingPanel.tsx`
- `src/components/hero/HeroServerList.tsx`
- `src/components/hero/HeroStats.tsx`
- `src/components/hero/HeroVisual.tsx`
- `src/components/sections/Advantages.tsx`
- `src/components/sections/FAQ.tsx`
- `src/components/sections/FinalCTA.tsx`
- `src/components/sections/Hero.tsx`
- `src/components/sections/HowTo.tsx`
- `src/components/sections/Locations.tsx`
- `src/components/sections/Pricing.tsx`
- `src/components/sections/Protocols.tsx`
- `src/components/sections/Quote.tsx`
- `src/components/sections/Terminal.tsx`
- `src/components/sections/TrustBar.tsx`
- `src/components/sections/locations/GlobeVisual.tsx`
- `src/components/sections/locations/LocationLegendItem.tsx`
- `src/components/sections/pricing/PricingCard.tsx`
- `src/hooks/runtime/index.ts`
- `src/hooks/runtime/useTimeout.ts`
- `src/lib/runtime/contracts.ts`
- `src/lib/runtime/status.ts`

### Удалены
- Удалить файл `public/mistnet-runtime.js` — в этой сборке удалён.
- Удалить файл `src/components/FaqAccessibility.tsx` — в этой сборке удалён.
- Удалить файл `src/components/MistnetScripts.tsx` — в этой сборке удалён.
- Удалить файл `src/components/MobileMenuA11y.tsx` — в этой сборке удалён.
- Удалить файл `src/components/hero/HeroPingPanel.module.css` — в этой сборке удалён.
- Удалить файл `src/hooks/runtime/useClickOutside.ts` — в этой сборке удалён.
- Удалить файл `src/hooks/runtime/useExternalScript.ts` — в этой сборке удалён.
- Удалить файл `src/hooks/runtime/useGsapContext.ts` — в этой сборке удалён.
- Удалить файл `src/hooks/runtime/useGsapRuntime.ts` — в этой сборке удалён.
- Удалить файл `src/hooks/runtime/useResizeObserver.ts` — в этой сборке удалён.
- Удалить файл `src/hooks/runtime/useThreeRuntime.ts` — в этой сборке удалён.
- Удалить файл `src/hooks/runtime/useThreeScene.ts` — в этой сборке удалён.
- Удалить файл `src/types/runtime-vendors.d.ts` — в этой сборке удалён.

## Интерактивность, перенесённая на React

- **Мобильная навигация:** `Header` управляет `menuOpen`; `useFocusTrap` удерживает Tab/Shift+Tab в открытом меню, закрывает по Escape и возвращает фокус. `menu-open` на `html` используется только для scroll lock и синхронизируется React effect.
- **FAQ:** один раскрытый элемент управляется `useState`; `aria-expanded`, `aria-controls`, `hidden`, `inert` и `aria-hidden` выводятся из одного состояния.
- **Мониторинг ping:** `ServerStatusProvider` получает typed API state через `fetch` и `AbortController`; режим demo явно помечается и использует демонстрационные значения, а не реальные измерения. Обновление при видимой вкладке управляется `useInterval`/`usePageVisibility`.
- **Счётчики:** `HeroStats` использует `IntersectionObserver`, `requestAnimationFrame` и поддержку `prefers-reduced-motion`; кадр отменяется при cleanup.
- **Терминал:** React state хранит набранную строку и число раскрытых строк; интервалы и таймауты очищаются при cleanup.
- **Command palette:** состояние открытия в `RuntimeUIProvider`; фильтр и выделенный элемент — React state; горячая клавиша обрабатывается hook-подпиской; фокус управляется `useFocusTrap`.
- **Mascot:** клик/сообщения/искры — React state; интервалы и таймеры очищаются при cleanup; вибрация вызывается только из пользовательского действия.
- **Toast/copy/scroll:** React state + `useTimeout` и `useEventListener`; копирование реализовано через Clipboard API с сообщением об ошибке.
- **Конверсионные события:** `TrackedLink` диспетчеризует `mistnet:conversion` и отправляет payload в `window.dataLayer`; старое делегирование `data-track` удалено.

## Что осталось в vanilla JS

Самостоятельного vanilla runtime больше нет. Оставлены только браузерные API, инкапсулированные в React hooks/effects или пользовательских обработчиках: `addEventListener`/`removeEventListener`, `IntersectionObserver`, `requestAnimationFrame`, `setTimeout`/`setInterval`, `fetch`, Clipboard API и `window.scrollTo`. Каждый созданный listener, observer, timer, interval, animation frame и запрос имеет соответствующий cleanup/cancel.

GSAP, Three.js/WebGL и Lenis не используются; globe отображается статическим SVG fallback, прокрутка нативная, а простые визуальные эффекты остаются CSS-анимациями. Traffic/protocol line не имеет отдельного JS ticker в исходном runtime и оставлен как статический React-текст с CSS-градиентом.

## Сохранённые data-* атрибуты

- `data-status-location` — остаётся на строках серверов, поскольку `mistnet-v2.css` использует его для hover-стиля.
- `data-text` — остаётся на логотипе, поскольку `globals.css` использует `attr(data-text)` в `.logo-glitch`.

Остальные JS-only data-атрибуты удалены. Идентификаторы, предназначенные только старому runtime (`palOpen`, `palIn`, `palClose`, `palList`, `toTop`, `scrollProgress`, `toastMsg`, `heroCanvas`, `globeCanvas` и legacy preloader IDs), удалены вместе с их обработчиками. Важные семантические ID `mnav`, `faq`, `faq-question-*`, `faq-answer-*`, `terminal`, `map`, `pricing` сохранены.

## Проверка

### Проверки, которые прошли в текущей среде

- `node scripts/qa-static.mjs` — 39/39 PASS.
- TS/TSX transpile syntax — 64 файла, 0 синтаксических диагностик.
- Проверка alias-import путей — 65 исходных файлов, PASS.
- PostCSS/tinycss2 parse — `tokens.css`, `globals.css`, `mistnet-v2.css`, PASS.
- `node --check` для `.mjs` — PASS.

### Фактический результат обязательных npm-команд в текущей среде

```text
npm run lint
> mistnet-landing@2.5.4 lint
> eslint .
sh: 1: eslint: not found
Exit code: 127
```

```text
npm run typecheck
> mistnet-landing@2.5.4 typecheck
> tsc --noEmit
error TS2688: Cannot find type definition file for 'estree'.
error TS2688: Cannot find type definition file for 'json-schema'.
error TS2688: Cannot find type definition file for 'json5'.
error TS2688: Cannot find type definition file for 'node'.
error TS2688: Cannot find type definition file for 'react'.
error TS2688: Cannot find type definition file for 'react-dom'.
Exit code: 2
```

```text
npm run build
> mistnet-landing@2.5.4 build
> next build
sh: 1: next: not found
Exit code: 127
```

`npm ci` в этой среде завершился ошибкой/тайм-аутом; пакеты `eslint`, `next`, `react` и необходимые `@types` отсутствуют. Поэтому нулевой полный lint/typecheck/production build не заявляется. Требование зелёного production build остаётся обязательным для закрытия 3.5.2; запускать эти команды надо в том Windows-проекте, где 3.5.1 уже собирался успешно.

## Открытые решения к этапу 3.6

- Согласовать границы `error.tsx` для сегментов App Router и поведение при ошибке API мониторинга.
- Определить `loading.tsx`/Suspense только для реально асинхронных частей интерфейса.
- Уточнить fallback-UI для временно недоступного status API без маскировки demo-данных под live.
- Проверить сохранение/возврат фокуса при навигации между сегментами и при ошибках рендера.

**Следующий этап — 3.6: error.tsx, loading.tsx, Suspense, клавиатурный доступ**
