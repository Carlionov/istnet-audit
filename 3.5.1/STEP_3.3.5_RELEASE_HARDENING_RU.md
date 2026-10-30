# Этап 3.3.5 — Release hardening и единый QA gate

## Цель

Подготовить проект к воспроизводимой проверке перед публикацией, не меняя визуальную систему, DOM-контракты и `public/mistnet-runtime.js`.

## Изменения

1. `.gitignore`: добавлено `!.env.example` сразу после `.env*`. Без этого шаблон переменных окружения игнорировался Git. `.env.local` и остальные реальные env-файлы по-прежнему исключены.
2. `scripts/qa-release.mjs`: добавлен последовательный release gate. Он запускает:
   - `npm run qa:static`
   - `npm run lint`
   - `npm run typecheck`
   - `npm run build`

   Gate останавливается на первом неуспешном шаге и возвращает ненулевой код. Запуск дочерних npm-команд настроен для Windows (`npm.cmd`) и POSIX.
3. `package.json`: добавлена команда `npm run qa:release`.
4. `scripts/qa-static.mjs`: добавлены проверки регистрации release gate, URL/integrity всех package-lock записей, правила Git для `.env.example`, отсутствия реальных endpoint/token в шаблоне и синтаксиса нового скрипта.
5. `README.md` и `START_HERE_RU.txt`: обновлены инструкции перед релизом.

## Результаты, подтверждённые в рабочей среде

- `npm run qa:static`: **25/25 PASS**.
- Lock-файл: 404 dependency entries, у всех есть `resolved` и `integrity`; все `resolved` адреса ведут на npm registry.
- Git ignore: `.env.example` не игнорируется; `.env.local` игнорируется.
- TS/TSX syntax transpilation: 40 файлов, 0 ошибок синтаксиса.
- PostCSS: все 3 основных CSS-файла разобраны без ошибок.
- `node --check`: `qa-static.mjs`, `qa-release.mjs`, `mistnet-runtime.js` — PASS.
- `runtime.js` не менялся; SHA-256: `29f9d7a2d38a1556daa01af9b1c3fafaddbdb54c992f241d704def9842ffbe90`.

## Ограничения текущей среды

Полный release gate не прошёл до конца, потому что зависимости в предоставленном `node_modules` — пустые заглушки, исполняемых файлов ESLint и Next.js нет, а npm cache пустой.

- `npm run qa:release`: статический шаг прошёл, затем gate остановился на ESLint (`eslint: not found`, exit 127). Это ожидаемое корректное поведение fail-fast.
- `npm run typecheck`: не прошёл из-за отсутствующих модулей Next.js/React и типов Node/React. Это не подтверждает наличие ошибок типов в исходниках.
- `npm run build`: `next: not found` (exit 127).
- Полноценные browser/Lighthouse проверки не выполнялись в этой среде.

Чтобы закончить release QA локально:

```bash
npm ci
npm run qa:release
npm run start
```

В Windows PowerShell команды выполняются в корне проекта. Для отдельной проверки Git:

```powershell
git check-ignore -v .env.example .env.local
```

Ожидаемый результат: `.env.example` не выводится как игнорируемый; `.env.local` выводится.

## Границы изменений

Не менялись `public/mistnet-runtime.js`, компоненты интерфейса, DOM ID, `data-*` атрибуты, маршруты и дизайн. `package-lock.json` не переписывался: изменение scripts в `package.json` не требует обновления lock-файла.
