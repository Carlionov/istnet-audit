# Шаг 3.5.1: runtime hooks и типизированная инфраструктура

## Что делаем

Создаём повторно используемые клиентские хуки и типизированные границы для lifecycle браузера, таймеров, анимации, внешних библиотек и интеграций мониторинга/аналитики. Существующий runtime пока остаётся единственным владельцем интерактивности страницы; поэтому подшаг не меняет поведение пользовательского интерфейса.

## Структура

```text
src/
├── hooks/
│   └── runtime/
│       ├── index.ts
│       ├── useAnimationFrame.ts
│       ├── useClickOutside.ts
│       ├── useEventListener.ts
│       ├── useExternalScript.ts
│       ├── useFocusTrap.ts
│       ├── useGsapContext.ts
│       ├── useGsapRuntime.ts
│       ├── useIntersectionObserver.ts
│       ├── useInterval.ts
│       ├── useLatest.ts
│       ├── useMediaQuery.ts
│       ├── usePageVisibility.ts
│       ├── useReducedMotion.ts
│       ├── useResizeObserver.ts
│       ├── useThreeRuntime.ts
│       ├── useThreeScene.ts
│       └── useTimeout.ts
├── lib/
│   └── runtime/
│       ├── contracts.ts
│       ├── status.ts
│       └── tracking.ts
└── types/
    └── runtime-vendors.d.ts
```

## Архитектурные решения

- `useEventListener` централизует подписки на события и всегда вызывает актуальный callback.
- `useInterval`, `useTimeout`, `useAnimationFrame` гарантируют cleanup таймеров и `requestAnimationFrame`.
- `useIntersectionObserver` и `useResizeObserver` владеют observer lifecycle и отключают observers при cleanup.
- `useFocusTrap` реализует клавиатурный trap, initial focus, Escape callback и возврат фокуса.
- `useExternalScript` дедуплицирует одновременную загрузку одной библиотеки, ограничивает ожидание тайм-аутом и удаляет неудачно загруженный script.
- `useGsapRuntime` загружает GSAP и ScrollTrigger последовательно; `useGsapContext` вызывает `context.revert()` на cleanup.
- `useThreeRuntime` оставляет Three.js вне основного bundle; `useThreeScene` запускает сцену при приближении canvas к viewport и вызывает disposer при unmount.
- `parseServerStatusResponse` валидирует JSON ответа `/api/status` до помещения данных в React state.
- `trackMistnetConversion` сохраняет фактический контракт текущего runtime: `mistnet:conversion` detail и `dataLayer` event, равный значению `data-track`.
- Lenis hook намеренно не добавлен: в текущем runtime Lenis не загружается, инициализация завершается без создания инстанса; остаётся нативный scroll.

## Что осталось в vanilla JS на этом подшаге

- Весь `public/mistnet-runtime.js` — намеренно оставлен до 3.5.2, пока новые React-компоненты не подключены.
- WebGL/Three.js пока остаётся загружаемым через общий CDN loader; typed scene lifecycle подготовлен хуком `useThreeScene`.
- GSAP / ScrollTrigger пока остаются используемыми старым runtime; typed loader и scoped context готовы для переноса.
- Lenis не переносится: фактической рабочей интеграции Lenis нет, а нативная прокрутка уже используется как fallback.

## Неизменённые контракты

- `public/mistnet-runtime.js` — байт-в-байт сохранён.
- `src/components/MistnetScripts.tsx` — пока продолжает подключать `/mistnet-runtime.js` через `afterInteractive`.
- Существующие DOM ID, class hooks, `data-track`, `data-plan`, `data-status-location`, `data-ping`, `data-node`, `data-leg-ping` и `data-location-status` не изменены.
- `package.json` и `package-lock.json` не менялись; новых npm-зависимостей нет.

## CSS

В `src/app/mistnet-v2.css` включён переданный пользователем полный файл как префикс, затем добавлен CSS-блок, внесённый на 3.4.2 для `.final-cta-primary`, `.step-link`, равной высоты pricing-карточек и focus-visible состояний. Это сохраняет TrustBar в варианте 2/3/6 колонок и не теряет CSS 3.4.2.

## Проверка

Локальные проверки текущего окружения:

- `node scripts/qa-static.mjs` — 25/25 PASS.
- `tsc --project /tmp/mistnet-3.5.1-types/tsconfig.json --pretty false` — PASS для новых hooks/utilities с временными минимальными объявлениями React.
- TypeScript transpile syntax — 65 TS/TSX файлов, 0 синтаксических ошибок.
- PostCSS parse — `tokens.css`, `globals.css`, `mistnet-v2.css`: PASS.
- `node --check public/mistnet-runtime.js` — PASS; SHA-256 совпадает с 3.4.2.

Полные команды в этом окружении:

- `npm ci` — завершился ошибкой npm `Exit handler never called!`.
- `npm run lint` — не запустился: `eslint: not found`, exit 127.
- `npm run typecheck` — не прошёл из-за отсутствующих типов `estree`, `json-schema`, `json5`, `node`, `react`, `react-dom`, exit 2.
- `npm run build` — не запустился: `next: not found`, exit 127.

Пользователь предоставил успешные результаты `lint`, `typecheck`, `build` для исходной базы 3.4.2 до добавления файлов 3.5.1. Эти результаты не являются проверкой новой версии 3.5.1. Поэтому переход к 3.5.2 должен происходить только после зелёного локального прогона трёх команд на этой версии.
