# Этап 3.1 — Hero: декомпозиция и типизация

## Что изменено

- `src/components/sections/Hero.tsx` превращён в композиционный компонент, который собирает независимые части Hero.
- Текст и CTA вынесены в `HeroContent.tsx`.
- Панель пинга вынесена в `HeroPingPanel.tsx`.
- Три показателя вынесены в `HeroStats.tsx`.
- Робот и его SVG-декор вынесены в `HeroMascot.tsx`.
- Список серверных конфигураций вынесен в `HeroServerList.tsx`.
- Правая визуальная колонка вынесена в `HeroVisual.tsx`.
- Повторяющиеся локации, конфигурации и показатели находятся в `hero.data.ts`.
- Контракты данных описаны в `hero.types.ts`.
- Inline-ширина начального состояния полос пинга заменена CSS Module-классом `initialBar`.

## Сохранение DOM-контрактов

Runtime-facing IDs сохранены:

- `heroCanvas` — `Hero.tsx`.
- `heroTitle` — `HeroContent.tsx`.
- `statusBadge`, `statusLabel`, `statusNote` — `HeroPingPanel.tsx`.
- `tiltContainer` — `HeroVisual.tsx`.
- `botSay` — `HeroMascot.tsx`.
- `appDemoBadge` — `HeroServerList.tsx`.

Также сохранены SVG IDs `shieldFill`, `shieldStroke`, `shieldGlow`.

Сохранены runtime-классы: `.hero`, `.hero-text`, `.logo-large`, `.btn-group`, `.ping-widget`, `.stats`, `.app-list`, `.mascot-wrap`, `.mascot-stage`, `.mascot-bot`, `.mascot-scroll`, `.hero-network-bridge`, `.magnetic`, `.reveal`, `.ping-row`, `.ping-bar-fill`, `.ms`, `.orb` и остальные классы Hero.

Сохранены data-атрибуты: `data-text`, `data-track`, `data-status-location`, `data-node`, `data-ping`, `data-counter`, `data-suffix`, `data-location-status`.

## CSS

Глобальные `globals.css` и `mistnet-v2.css` не менялись. Единственное необходимое стилевое изменение вынесено в `HeroPingPanel.module.css`: `.initialBar { width: 0; }`. Runtime по-прежнему меняет ширину через `element.style.width` после получения состояния мониторинга.

## Проверка

- TS/TSX синтаксис: проверен для всех девяти файлов Hero.
- Strict TypeScript для декомпозированного Hero и его импортов: проверен отдельной временной проверочной конфигурацией с локальными декларациями внешних модулей. Это не заменяет полный typecheck проекта с реальными типами Next.js/React.
- Runtime DOM-контракты: проверено сохранение ID, CSS-классов и data-атрибутов.
- JSX inline styles: отсутствуют во всех новых Hero-компонентах.
- `public/mistnet-runtime.js`: не изменялся.

Полные `npm run lint`, `npm run typecheck` и `npm run build` в этой среде не выполнены: `npm ci` не завершился из-за тайм-аута доступа к npm registry. Выполнить эти команды в локальной среде проекта после распаковки архива.
