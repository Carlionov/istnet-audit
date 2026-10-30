# MISTNET — этап 3.5.2

Полный переход интерактивности с `public/mistnet-runtime.js` на React state, hooks и client components.

## Установка и команды

```powershell
npm ci
npm run lint
npm run typecheck
npm run build
```

## Что изменено

- Старый `public/mistnet-runtime.js` удалён.
- `MistnetScripts.tsx`, старые a11y-адаптеры и устаревшие runtime hooks удалены.
- FAQ, мобильное меню, ping/status, terminal, counters, command palette, toast, copy action, scroll UI и mascot управляются React.
- Таймеры, интервалы, requestAnimationFrame, IntersectionObserver и DOM event subscriptions имеют cleanup через effects/hooks.
- Ленивый static SVG globe оставлен вместо Three.js/WebGL; Lenis и GSAP не запускаются.
- `mistnet-v2.css` из последней согласованной сборки сохранён и включает TrustBar/секционные стили.

## Атрибуты, оставленные для CSS

- `data-status-location` — селектор hover-подсветки строк серверов в `mistnet-v2.css`.
- `data-text` — источник текста для псевдоэлементов `.logo-glitch` в `globals.css`.

Прежние JS-only `data-track`, `data-plan`, `data-copy`, `data-ping`, `data-node`, `data-counter`, `data-bot-trigger` и связанные атрибуты удалены. Конверсионные события теперь создаются в React-компоненте `TrackedLink`.

## Важное о проверке

В среде сборки этого архива не удалось установить npm dependencies. Статические проверки и синтаксическая транспиляция прошли, однако `npm run lint`, `npm run typecheck` и `npm run build` здесь не завершились успешно из-за отсутствующих `eslint`, React/Node type packages и `next`. Не считать сборку production-verified до успешного запуска этих трёх команд в окружении проекта.

Полный список изменений — `STEP_3.5.2_REACT_MIGRATION_RU.md`; полные файлы компонентов/хуков — `CODE_3.5.2_RU.md`.
