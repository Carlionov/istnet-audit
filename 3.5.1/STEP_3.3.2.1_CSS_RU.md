# MISTNET — этап 3.3.2.1: CSS и responsive

## Состав
- `src/styles/tokens.css` — единый `:root`, включает общий набор design tokens и icon tokens.
- `src/app/mistnet-v2.css` — полностью заменённый mobile-first refinement stylesheet.
- `globals.css` и `layout.tsx` из этапа 3.3.1 оставлены без изменений; `tokens.css` уже импортируется до глобальных CSS.
- `public/mistnet-runtime.js` не изменён.

## Выполнено
- В `mistnet-v2.css`: 0 `!important`, 0 блоков `:root`, 0 `@media max-width`, 0 отрицательных margin.
- Все responsive viewport breakpoints — `min-width`: 421, 721, 961, 1101, 1241, 1400, 1600 px.
- Все CSS color literals переведены на tokens; raw colors в `mistnet-v2.css`: 0.
- Все ссылки на CSS custom properties разрешаются; переменные шрифтов `--font-manrope` и `--font-jetbrains-mono` задаёт `next/font`, а `--bx`, `--by`, `--dx`, `--dy`, `--i` являются runtime custom properties.
- Spacing, radius, transition/animation durations и easing используют токены или именованные layout-токены; отрицательных margin нет.
- Mobile-first base: Hero / Footer / Locations — одноколоночные; TrustBar — две колонки; Pricing — одна колонка; Header — компактная мобильная навигация.
- От 721 px: тарифы в две колонки, Footer в три колонки, CTA шапки отображается.
- От 961 px: полная шапка, Hero в две колонки, Locations в две колонки, TrustBar в четыре колонки.
- От 1241 px: Hero в три Grid-колонки `copy / network / visual`; центральная сеть увеличена до 460 px, помещена в grid-area и центрируется через Grid. От 1400 px ширина увеличивается до 480 px.
- Footer links и основные мобильные controls имеют target минимум 44 px; input/select/textarea имеют 16 px; fixed controls учитывают safe-area-inset.
- Списки тарифов выравнивают псевдо-галочку по baseline через flex.

## Проверки
- PostCSS: `tokens.css`, `globals.css`, `mistnet-v2.css` — PASS.
- CSS variable scan: 500 токенов, 500 уникальных имён, 0 неопределённых design tokens.
- Runtime SHA-256 совпадает с исходной версией 3.3.1: `29f9d7a2d38a1556daa01af9b1c3fafaddbdb54c992f241d704def9842ffbe90`.
- TypeScript/TSX syntax transpilation в рабочей копии: 39 файлов, 0 syntax diagnostics.

## Проверки, которые не удалось выполнить в этой среде
`npm ci` завершился timeout при обращении к npm registry. В имеющемся `node_modules` отсутствуют исполняемые `eslint`, `tsc` и `next`, поэтому `npm run lint`, `npm run typecheck`, `npm run build` не могут стартовать. Реальные browser viewport checks на 320 / 375 / 390 / 768 / 1024 / 1280 / 1440 также не завершились из-за зависания headless Chromium. Статическую проверку CSS нельзя считать заменой этих запусков; production build не объявляется зелёным.

## Установка
Заменить в проекте:
- `src/styles/tokens.css`
- `src/app/mistnet-v2.css`

Остальные файлы и `public/mistnet-runtime.js` на этом подэтапе не заменять.
