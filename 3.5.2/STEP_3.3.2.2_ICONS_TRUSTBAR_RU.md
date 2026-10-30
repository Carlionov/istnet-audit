# MISTNET — этап 3.3.2.2: SVG-иконки и TrustBar

## Состав изменений

- `src/components/icons/FeatureIcon.tsx` — типизированные размеры `sm / md / lg`; прежний класс `trust-icon` оставлен классом по умолчанию для обратной совместимости; компонент больше не задаёт размеры и толщину линий inline-атрибутами. Внешний вид штрихов сохранён через `strokeLinecap="round"` и `strokeLinejoin="round"`.
- `src/components/sections/TrustBar.tsx` — все шесть маркеров используют общий `FeatureIcon`; текст вынесен в `trust-label` для управления типографикой из CSS.
- `src/components/Header.tsx` — иконка быстрого поиска управляется классом `nav-search-icon`.
- `src/components/hero/HeroContent.tsx` — галочка заметки о способах входа использует `hero-access-check-icon`.
- `src/components/hero/HeroServerList.tsx` — SVG-индикатор возможностей получает `hero-server-feature-icon`.
- `src/components/sections/Advantages.tsx` — inline `strokeWidth` удалён; толщина задаётся токеном CSS.
- `src/components/SiteDecorations.tsx` — иконка плавающей кнопки кабинета управляется `cabinet-fab-icon`; скрытый спрайт флагов получает `flag-sprite`.

## Единая система размеров

Все интерфейсные иконки используют токены из `src/styles/tokens.css`:

- `--icon-size-sm: 16px`
- `--icon-size-md: 18px`
- `--icon-size-lg: 24px`
- `--icon-stroke: 1.7`
- `--icon-hit-area: 44px` — минимальная область элемента TrustBar.

Правила размеров и толщины собраны в `src/app/mistnet-v2.css`. В React-компонентах больше нет дублирующих `width`, `height` и `strokeWidth` для перечисленных интерфейсных иконок.

## Что намеренно не менялось

`HeroMascot`, `HeroNetworkBridge`, иллюстрация fallback-карты и SVG-спрайт флагов содержат самостоятельную графику, а не интерфейсные иконки. Их внутренние геометрические размеры и толщины штрихов сохранены. `public/mistnet-runtime.js`, ID, data-атрибуты и runtime DOM-контракт не изменялись.

## Установка

Скопировать семь изменённых TSX-файлов из этого архива, сохранив пути. CSS и токены уже входят в полный архив этапа 3.3.2.1 и здесь также присутствуют в составе полной сборки.
