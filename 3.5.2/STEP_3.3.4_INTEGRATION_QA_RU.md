# Этап 3.3.4 — интеграционный аудит MISTNET

## Цель

Провести финальную статическую проверку сборки после этапов 3.3.2.1, 3.3.2.2 и 3.3.3. Проверить целостность внутренних ссылок и DOM-контрактов, SEO-маршруты, публичные файлы, CSS-переменные, синтаксис и сохранность существующего runtime.

## Что изменено

### 1. Исправлены URL SEO-карты сайта

В `src/app/robots.ts` базовый домен хранился со слешем на конце, после чего к нему добавлялось `/sitemap.xml`. Это формировало ошибочный адрес `https://mistnet.ru//sitemap.xml`.

Теперь `robots.ts` и `sitemap.ts` используют базовый адрес без завершающего слеша:

- Sitemap в robots: `https://mistnet.ru/sitemap.xml`.
- Главная страница в sitemap: `https://mistnet.ru/`.
- Host в robots: `https://mistnet.ru`.

### 2. Добавлена независимая статическая QA-команда

Добавлен `scripts/qa-static.mjs` и скрипт npm:

```bash
npm run qa:static
```

Команда использует встроенные модули Node.js и не требует установленного `node_modules`. Она проверяет обязательные файлы, согласованность зависимостей `package.json` и `package-lock.json`, неизменность `runtime.js`, ID и внутренние якоря, literal `aria-controls`, внешние ссылки с `target="_blank"`, sitemap/robots, базовые CSS-ограничения, переменные CSS, H1 главной страницы и 404, язык документа, OG-изображение и синтаксис runtime.

## Результаты

- Статическая QA-команда: **20/20 PASS**.
- TypeScript/TSX syntax transpilation: **40 файлов, 0 синтаксических ошибок**. Это не semantic typecheck.
- PostCSS parse: `tokens.css`, `globals.css`, `mistnet-v2.css` — **3/3 PASS**.
- JavaScript syntax: `public/mistnet-runtime.js` и `scripts/qa-static.mjs` — **PASS**.
- SVG: `public/favicon.svg` проходит XML parsing.
- OG image: JPEG, 1200×630.
- Mascot: файл определяется как WebP с alpha-каналом.
- `runtime.js` SHA-256 совпадает с предыдущими этапами: `29f9d7a2d38a1556daa01af9b1c3fafaddbdb54c992f241d704def9842ffbe90`.
- `package.json` и корневые зависимости `package-lock.json` согласованы.

## Что осталось непроверенным

Полная сборка и реальные браузерные испытания не были выполнены из-за ограничений среды:

- `npm ci` завершился по тайм-ауту при обращении к npm registry.
- `npm run lint`: `eslint: not found` (exit 127).
- `npm run typecheck`: отсутствуют определения типов (`estree`, `json-schema`, `json5`, `node` и другие; exit 2). Синтаксическая транспиляция не заменяет эту проверку.
- `npm run build`: `next: not found` (exit 127).
- Chromium не завершает даже загрузку `about:blank` в headless-режиме за 12 секунд. Проверка реального layout на 320/375/390/768/1024/1280/1440 px не проведена.
- Lighthouse не запускался, production build и WCAG conformance не заявляются.

Перед релизом нужно выполнить `npm ci`, `npm run lint`, `npm run typecheck`, `npm run build`, запустить сервер и проверить интерактивность и overflow в реальном браузере на целевых ширинах. После этого можно запускать Lighthouse.

## Runtime и DOM-контракты

`public/mistnet-runtime.js` не изменялся. Его SHA-256 закреплён в `scripts/qa-static.mjs`, чтобы статическая проверка сообщала о случайном изменении runtime в следующих этапах.
