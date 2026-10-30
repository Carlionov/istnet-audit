# Шаг 3.3.1 — Design tokens и globals.css

## Что делаем

Добавляем единый источник токенов `src/styles/tokens.css` и переводим `globals.css` на токены, сохраняя исходные вычисленные значения. `mistnet-v2.css` и runtime не изменяем в этой порции.

## Структура

```text
src/
├── app/
│   ├── globals.css          # полный файл заменён
│   ├── layout.tsx           # подключён tokens.css первым
│   └── mistnet-v2.css       # на 3.3.1 не изменён
└── styles/
    └── tokens.css           # новый единый файл, 468 уникальных custom properties
```

## Полные файлы

- `src/styles/tokens.css` — полный файл в архиве и отдельной ссылкой.
- `src/app/globals.css` — полный файл в архиве и отдельной ссылкой.
- `src/app/layout.tsx` — полный файл в архиве и отдельной ссылкой; CSS imports идут в порядке tokens → globals → v2.

## Группы токенов

- Цвета: семантические базовые цвета, RGB channels, поверхности, glow и alpha-варианты исходной палитры.
- Отступы: 4 px scale `--space-1` … `--space-15`; точные legacy tokens оставлены, чтобы не изменить уже проверенную геометрию.
- Типографика: caption / small / body / lead / h3 / h2 / h1, fluid sizes, а также отдельные line-height-токены для каждой ступени.
- Радиусы: sm / md / lg / xl / pill и точные legacy значения.
- Движение: fast / base / slow, legacy durations и централизованные easing.
- Тени: primary, accent, card, focus и именованные component shadows.

## Перенесённые значения

| `globals.css` (исходная строка → новая строка) | Было | Стало |
|---|---|---|
| L12 → L6 | `line-height: 1.6` | `line-height: var(--line-height-body)` |
| L32 → L26 | `border-radius: 4px` | `border-radius: var(--radius-legacy-4)` |
| L49 → L43 | `margin-top: 12px` | `margin-top: var(--space-3)` |
| L81 → L75 | `padding: 0 40px` | `padding: 0 var(--space-9)` |
| L82 → L76 | `padding: 96px 0` | `padding: var(--space-15) 0` |
| L83 → L77 | `font-size: clamp(28px, 4.5vw, 42px)` | `font-size: var(--type-heading-2)` |
| L87 → L81 | `background: rgba(2,5,10,.82)` | `background: var(--color-bg-82)` |
| L92 → L86 | `padding: 9px 16px; border-radius: 10px` | `padding: var(--space-legacy-9) var(--space-4); border-radius: var(--radius-legacy-10)` |
| L154 → L148 | `gap: 12px; margin-bottom: 24px` | `gap: var(--space-3); margin-bottom: var(--space-6)` |
| L155 → L149 | `padding: 15px 20px; transition: ... .25s` | `padding: var(--space-legacy-15) var(--space-5); transition: ... var(--motion-0-25s)` |
| L158 → L152 | `box-shadow: 0 8px 26px var(--primary-glow)` | `box-shadow: var(--shadow-glow-primary)` |
| L174 → L168 | `transition: width .8s cubic-bezier(.4,0,.2,1)` | `transition: width var(--motion-0-8s) var(--ease-standard-material)` |
| L267 → L261 | `gap: 14px; padding: 14px 16px; border-radius: 12px` | `gap: var(--space-legacy-14); padding: var(--space-legacy-14) var(--space-4); border-radius: var(--radius-md)` |
| L319 → L313 | `padding: 20px; font-size: 16px; gap: 12px` | `padding: var(--space-5); font-size: var(--type-body); gap: var(--space-3)` |
| L338 → L332 | `gap: 40px; margin-bottom: 36px` | `gap: var(--space-9); margin-bottom: var(--space-legacy-36)` |
| L453 → L447 | `gap: 12px; padding: 12px 14px; border-radius: 10px` | `gap: var(--space-3); padding: var(--space-3) var(--space-legacy-14); border-radius: var(--radius-legacy-10)` |
| L501 → L495 | `transition: transform .5s cubic-bezier(.34,1.56,.64,1)` | `transition: transform var(--motion-0-5s) var(--ease-spring)` |
| L560 → L554 | `gap: 12px; padding: 9px 0` | `gap: var(--space-3); padding: var(--space-legacy-9) 0` |

This table shows representative mappings across the file. All declarations in the requested property groups were checked; there are no remaining raw pixel values in margin/padding/gap or border-radius, no raw color literals in color-bearing properties, and no raw duration/easing definitions in `globals.css`.

## !important

`globals.css`: **0**.

`mistnet-v2.css`: **36**, intentionally unchanged in this substep. They are addressed in 3.3.2 together with the legacy `:root` declarations and remaining token migration.

## Адаптивность

В 3.3.1 media queries не перестраивались, чтобы не менять текущую геометрию до миграции второго CSS-слоя. Существующие breakpoints остаются в `globals.css`; унификация и mobile-first перенос — 3.3.2. Текущие известные точки: 960 px, 720 px, 520 px, 380 px, 360 px, coarse pointer и reduced motion.

## DOM-контракты

`public/mistnet-runtime.js` сравнен побайтно с исходником этапа 3.2: изменений нет. Все существующие ID, классы и data-атрибуты runtime сохранены.

## Проверка

PostCSS parse трёх CSS-файлов — PASS; 468 уникальных токенов без дубликатов; `globals.css` — 0 `!important`, 0 raw spacing/radius/duration/color/easing значения; CSS variables без пропусков кроме динамических runtime custom properties `--angle`, `--mx`, `--my`.

`npm ci --dry-run --offline` — PASS, lockfile graph разрешается. Полный `npm ci` не выполнен: npm cache не содержит `zod-validation-error@4.0.2`, а online registry request timed out. Поэтому `npm run lint`, `npm run typecheck`, `npm run build` не запускались и не объявляются зелёными. Их нужно выполнить в локальном установленном проекте после копирования файлов.

## Следующий подэтап

3.3.2 — полный `mistnet-v2.css`, устранение 36 `!important`, удаление дополнительных `:root`, мобильный first сетки, icon tokens и обновление SVG-иконок/TrustBar.
