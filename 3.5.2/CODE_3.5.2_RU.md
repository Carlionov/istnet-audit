# Полный исходный код изменённых компонентов и хуков — этап 3.5.2

Файлы приведены полностью. Удалённые файлы перечислены в отчёте этапа.

## `src/app/api/status/route.ts`

```ts
import { NextResponse } from "next/server";
import { SERVER_LOCATIONS } from "@/data/servers";
import type { ServerLocationId } from "@/data/servers";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const ALLOWED_IDS = new Set<ServerLocationId>(SERVER_LOCATIONS.map((location) => location.id));
type NodeStatus = "online" | "offline" | "unknown";
type StatusNode = { id: ServerLocationId; status: NodeStatus; latencyMs: number | null };

function json(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
      Pragma: "no-cache",
    },
  });
}

/**
 * Upstream contract:
 * {
 *   "nodes": [
 *     { "id": "nl", "status": "online", "latencyMs": 42 },
 *     { "id": "tr", "status": "offline", "latencyMs": null }
 *   ],
 *   "updatedAt": "2026-10-30T12:30:00.000Z"
 * }
 */
export async function GET() {
  const endpoint = process.env.MISTNET_STATUS_ENDPOINT;
  if (!endpoint) {
    return json(
      {
        state: "unconfigured",
        message: "Set MISTNET_STATUS_ENDPOINT to enable live monitoring.",
        nodes: [],
      },
      503,
    );
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(endpoint);
    if (parsedUrl.protocol !== "https:" && parsedUrl.hostname !== "localhost") {
      return json({ state: "error", message: "Status endpoint must use HTTPS." }, 500);
    }
  } catch {
    return json({ state: "error", message: "Invalid status endpoint URL." }, 500);
  }

  try {
    const headers = new Headers({ Accept: "application/json" });
    const token = process.env.MISTNET_STATUS_TOKEN;
    if (token) headers.set("Authorization", `Bearer ${token}`);

    const upstream = await fetch(parsedUrl, {
      method: "GET",
      headers,
      cache: "no-store",
      signal: AbortSignal.timeout(6500),
    });

    if (!upstream.ok) {
      return json({ state: "error", message: `Monitoring upstream returned ${upstream.status}.` }, 502);
    }

    const payload: unknown = await upstream.json();
    if (!payload || typeof payload !== "object" || !Array.isArray((payload as { nodes?: unknown }).nodes)) {
      return json({ state: "error", message: "Invalid monitoring payload: nodes[] is required." }, 502);
    }

    const rawNodes = (payload as { nodes: unknown[] }).nodes;
    const nodes: StatusNode[] = rawNodes.flatMap((entry): StatusNode[] => {
      if (!entry || typeof entry !== "object") return [];
      const item = entry as { id?: unknown; status?: unknown; latencyMs?: unknown };
      if (typeof item.id !== "string" || !ALLOWED_IDS.has(item.id as ServerLocationId)) return [];
      const status: NodeStatus = item.status === "online" || item.status === "offline" ? item.status : "unknown";
      const latencyMs = typeof item.latencyMs === "number" && Number.isFinite(item.latencyMs) && item.latencyMs > 0 && item.latencyMs <= 10000
        ? Math.round(item.latencyMs)
        : null;
      return [{ id: item.id as ServerLocationId, status, latencyMs }];
    });

    const updatedAtRaw = (payload as { updatedAt?: unknown }).updatedAt;
    const updatedAt = typeof updatedAtRaw === "string" && !Number.isNaN(Date.parse(updatedAtRaw))
      ? new Date(updatedAtRaw).toISOString()
      : null;

    return json({ state: "configured", updatedAt, nodes });
  } catch (error) {
    const message = error instanceof Error && error.name === "TimeoutError"
      ? "Monitoring upstream timed out."
      : "Unable to reach monitoring upstream.";
    return json({ state: "error", message }, 502);
  }
}
```

## `src/app/not-found.tsx`

```tsx
import Link from "next/link";
import { TrackedLink } from "@/components/common/TrackedLink";
import { MISTNET_LINKS } from "@/lib/links";

export const metadata = {
  title: "Страница не найдена",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main className="not-found-page">
      <div className="not-found-card">
        <span className="not-found-code">404 / MISTNET</span>
        <h1>Кажется, эта страница затерялась в тумане.</h1>
        <p>Такой страницы нет или ссылка устарела. Вернись на главную или открой личный кабинет.</p>
        <div className="not-found-actions">
          <Link className="btn btn-primary" href="/">На главную ↗</Link>
          <TrackedLink action="cabinet_open" className="btn btn-secondary" href={MISTNET_LINKS.cabinet}>
            Личный кабинет
          </TrackedLink>
        </div>
      </div>
    </main>
  );
}
```

## `src/app/page.tsx`

```tsx
import { SiteDecorations } from "@/components/SiteDecorations";
import { Header } from "@/components/Header";
import { Footer } from "@/components/footer/Footer";
import { SiteOverlays } from "@/components/SiteOverlays";
import { Hero } from "@/components/sections/Hero";
import { TrustBar } from "@/components/sections/TrustBar";
import { Advantages } from "@/components/sections/Advantages";
import { StructuredData } from "@/components/StructuredData";
import { Pricing } from "@/components/sections/Pricing";
import { Locations } from "@/components/sections/Locations";
import { Protocols } from "@/components/sections/Protocols";
import { Terminal } from "@/components/sections/Terminal";
import { HowTo } from "@/components/sections/HowTo";
import { Quote } from "@/components/sections/Quote";
import { FAQ } from "@/components/sections/FAQ";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { RuntimeUIProvider } from "@/components/runtime/RuntimeUIProvider";
import { ServerStatusProvider } from "@/components/runtime/ServerStatusProvider";

export default function Home() {
  return (
    <RuntimeUIProvider>
      <ServerStatusProvider>
        <StructuredData />
        <SiteDecorations />
        <Header />
        <main id="main">
          <Hero />
          <TrustBar />
          <Advantages />
          <Pricing />
          <Locations />
          <Protocols />
          <Terminal />
          <HowTo />
          <Quote />
          <FAQ />
          <FinalCTA />
        </main>
        <Footer />
        <SiteOverlays />
      </ServerStatusProvider>
    </RuntimeUIProvider>
  );
}
```

## `src/components/Header.tsx`

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { HeaderActions } from "@/components/header/HeaderActions";
import { MobileNavigation } from "@/components/header/MobileNavigation";
import { useFocusTrap } from "@/hooks/runtime/useFocusTrap";
import { useEventListener } from "@/hooks/runtime/useEventListener";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);
  useEventListener(
    typeof window === "undefined" ? null : window,
    "resize",
    () => {
      if (window.matchMedia("(min-width: 961px)").matches) setMenuOpen(false);
    },
    { passive: true },
  );

  useFocusTrap(menuRef, {
    enabled: menuOpen,
    returnFocusRef: burgerRef,
    onEscape: () => setMenuOpen(false),
  });

  useEffect(() => {
    document.documentElement.classList.toggle("menu-open", menuOpen);
    return () => document.documentElement.classList.remove("menu-open");
  }, [menuOpen]);

  return (
    <header>
      <nav aria-label="Основная навигация" className="navbar visible">
        <div className="container">
          <Link className="logo" href="/" aria-label="MISTNET — на главную">
            MIST<span>NET</span>
          </Link>
          <div className="nav-links" aria-label="Разделы сайта">
            <a href="#advantages">Преимущества</a>
            <a href="#map">Локации</a>
            <a href="#pricing">Тарифы</a>
            <a href="#faq">FAQ</a>
          </div>
          <HeaderActions />
          <button
            aria-controls="mnav"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
            className="burger"
            onClick={() => setMenuOpen((open) => !open)}
            ref={burgerRef}
            type="button"
          >
            <span />
            <span />
          </button>
        </div>
      </nav>
      <MobileNavigation
        menuOpen={menuOpen}
        onNavigate={() => setMenuOpen(false)}
        menuRef={menuRef}
      />
    </header>
  );
}
```

## `src/components/SiteDecorations.tsx`

```tsx
import { TrackedLink } from "@/components/common/TrackedLink";
import { MISTNET_LINKS } from "@/lib/links";

export function SiteDecorations() {
  return (
    <>
      <svg aria-hidden="true" className="flag-sprite" height="0" width="0">
        <defs>
          <symbol id="f-nl" viewBox="0 0 24 16">
            <rect fill="#AE1C28" height="5.34" width="24" />
            <rect fill="#fff" height="5.34" width="24" y="5.33" />
            <rect fill="#21468B" height="5.34" width="24" y="10.66" />
          </symbol>
          <symbol id="f-fi" viewBox="0 0 24 16">
            <rect fill="#fff" height="16" width="24" />
            <rect fill="#003580" height="16" width="4" x="6" />
            <rect fill="#003580" height="4" width="24" y="6" />
          </symbol>
          <symbol id="f-us" viewBox="0 0 24 16">
            <rect fill="#fff" height="16" width="24" />
            <g fill="#B22234">
              <rect height="2.29" width="24" />
              <rect height="2.29" width="24" y="4.57" />
              <rect height="2.29" width="24" y="9.14" />
              <rect height="2.29" width="24" y="13.71" />
            </g>
            <rect fill="#3C3B6E" height="9.14" width="10.5" />
            <g fill="#fff">
              <circle cx="1.8" cy="1.6" r=".55" />
              <circle cx="4.2" cy="1.6" r=".55" />
              <circle cx="6.6" cy="1.6" r=".55" />
              <circle cx="9" cy="1.6" r=".55" />
              <circle cx="3" cy="4.5" r=".55" />
              <circle cx="5.4" cy="4.5" r=".55" />
              <circle cx="7.8" cy="4.5" r=".55" />
              <circle cx="1.8" cy="7.4" r=".55" />
              <circle cx="4.2" cy="7.4" r=".55" />
              <circle cx="6.6" cy="7.4" r=".55" />
              <circle cx="9" cy="7.4" r=".55" />
            </g>
          </symbol>
          <symbol id="f-tr" viewBox="0 0 24 16">
            <rect width="24" height="16" fill="#E30A17" />
            <circle cx="10" cy="8" r="4.4" fill="#fff" />
            <circle cx="11.2" cy="8" r="3.5" fill="#E30A17" />
            <path d="m15.4 5.1 1 2 2.2.3-1.6 1.5.4 2.2-2-1.1-2 1.1.4-2.2-1.6-1.5 2.2-.3z" fill="#fff" />
          </symbol>
        </defs>
      </svg>
      <a className="skip" href="#main">Перейти к содержимому</a>
      <div className="bg-layer bg-grid" />
      <div className="scanlines" />
      <div className="noise" />
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <TrackedLink
        action="cabinet_open"
        aria-label="Открыть личный кабинет MISTNET"
        className="cabinet-fab"
        href={MISTNET_LINKS.cabinet}
        title="Личный кабинет · тест 3 дня"
      >
        <svg aria-hidden="true" className="cabinet-fab-icon" fill="none" viewBox="0 0 24 24">
          <path d="M20 21a8 8 0 0 0-16 0" stroke="currentColor" strokeLinecap="round" />
          <circle cx="12" cy="8" r="4" stroke="currentColor" />
        </svg>
      </TrackedLink>
    </>
  );
}
```

## `src/components/SiteOverlays.tsx`

```tsx
"use client";

import { useCallback, useState } from "react";
import { useEventListener } from "@/hooks/runtime/useEventListener";
import { useRuntimeUI } from "@/components/runtime/RuntimeUIProvider";
import { CommandPalette } from "@/components/command/CommandPalette";

function getScrollProgress(): number {
  if (typeof window === "undefined" || typeof document === "undefined") return 0;
  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
  if (scrollableHeight <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((window.scrollY / scrollableHeight) * 100)));
}

export function SiteOverlays() {
  const [showToTop, setShowToTop] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const { toastMessage } = useRuntimeUI();

  const updateScrollState = useCallback(() => {
    setShowToTop(window.scrollY > 480);
    setScrollProgress(getScrollProgress());
  }, []);

  useEventListener(
    typeof window === "undefined" ? null : window,
    "scroll",
    updateScrollState,
    { passive: true },
  );

  return (
    <>
      <progress
        aria-label="Прокрутка страницы"
        className="scroll-progress"
        max={100}
        value={scrollProgress}
      />
      <button
        aria-label="Наверх"
        className={`to-top${showToTop ? " visible" : ""}`}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        type="button"
      >
        ↑
      </button>
      <div className={`toast${toastMessage ? " show" : ""}`} role="status" aria-live="polite" aria-atomic="true">
        <span className="toast-icon" aria-hidden="true">✓</span>
        <span>{toastMessage || "Скопировано"}</span>
      </div>
      <CommandPalette />
    </>
  );
}
```

## `src/components/command/CommandPalette.tsx`

```tsx
"use client";

import { useCallback, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { useEventListener } from "@/hooks/runtime/useEventListener";
import { useFocusTrap } from "@/hooks/runtime/useFocusTrap";
import { MISTNET_LINKS } from "@/lib/links";
import { useRuntimeUI } from "@/components/runtime/RuntimeUIProvider";

interface CommandItem {
  readonly label: string;
  readonly href: string;
  readonly description: string;
  readonly external?: boolean;
}

const COMMAND_ITEMS: readonly CommandItem[] = [
  { label: "Преимущества", href: "#advantages", description: "4 локации · понятные тарифы" },
  { label: "Тарифы", href: "#pricing", description: "START и TITAN" },
  { label: "Локации", href: "#map", description: "глобальная сеть" },
  { label: "Как подключиться", href: "#howTo", description: "без обязательного Telegram" },
  { label: "FAQ", href: "#faq", description: "частые вопросы" },
  { label: "Технологии", href: "#terminal", description: "как устроен MISTNET" },
  { label: "Личный кабинет", href: MISTNET_LINKS.cabinet, description: "тест 3 дня и управление подпиской", external: true },
  { label: "Купить подписку", href: MISTNET_LINKS.quickPurchase, description: "оформить START или TITAN", external: true },
  { label: "Telegram-бот", href: MISTNET_LINKS.telegramBot, description: "альтернативный способ", external: true },
];

export function CommandPalette() {
  const { commandPaletteOpen: open, closeCommandPalette: close, openCommandPalette: show } = useRuntimeUI();
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const linkRefs = useRef(new Map<string, HTMLAnchorElement>());
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const closePalette = useCallback(() => {
    setQuery("");
    setSelectedIndex(0);
    close();
  }, [close]);

  useFocusTrap(dialogRef, {
    enabled: open,
    initialFocusRef: inputRef,
    onEscape: closePalette,
  });

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("ru-RU");
    if (!normalizedQuery) return COMMAND_ITEMS;
    return COMMAND_ITEMS.filter((item) =>
      `${item.label} ${item.description}`.toLocaleLowerCase("ru-RU").includes(normalizedQuery),
    );
  }, [query]);

  const handleGlobalKeyDown = (event: KeyboardEvent) => {
    if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== "k") return;
    event.preventDefault();
    if (open) closePalette();
    else {
      setQuery("");
      setSelectedIndex(0);
      show();
    }
  };

  useEventListener(typeof document === "undefined" ? null : document, "keydown", handleGlobalKeyDown);

  const handleInputKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" && filteredItems.length > 0) {
      event.preventDefault();
      setSelectedIndex((current) => (current + 1) % filteredItems.length);
    } else if (event.key === "ArrowUp" && filteredItems.length > 0) {
      event.preventDefault();
      setSelectedIndex((current) => (current - 1 + filteredItems.length) % filteredItems.length);
    } else if (event.key === "Enter" && filteredItems[selectedIndex]) {
      const item = filteredItems[selectedIndex];
      linkRefs.current.get(item.href)?.click();
    }
  };

  return (
    <div
      aria-hidden={!open}
      aria-label="Быстрый переход"
      aria-labelledby="palTitle"
      aria-modal="true"
      className={open ? "command-palette open" : "command-palette"}
      hidden={!open}
      id="pal"
      onClick={(event) => {
        if (event.target === event.currentTarget) closePalette();
      }}
      ref={dialogRef}
      role="dialog"
    >
      <div className="pal-box">
        <div className="pal-head">
          <h2 className="sr-only" id="palTitle">Быстрый переход по сайту</h2>
          <input
            aria-label="Поиск по разделам сайта"
            autoComplete="off"
            onChange={(event) => {
              setQuery(event.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleInputKeyDown}
            placeholder="Куда перейти?"
            ref={inputRef}
            value={query}
          />
          <button aria-label="Закрыть быстрый переход" className="pal-close" onClick={closePalette} type="button">
            ×
          </button>
        </div>
        <ul className="pal-list">
          {filteredItems.map((item, index) => (
            <li key={item.href}>
              <a
                aria-current={index === selectedIndex ? "true" : undefined}
                className={index === selectedIndex ? "sel" : undefined}
                href={item.href}
                onClick={closePalette}
                ref={(node) => {
                  if (node) linkRefs.current.set(item.href, node);
                  else linkRefs.current.delete(item.href);
                }}
                rel={item.external ? "noopener noreferrer" : undefined}
                target={item.external ? "_blank" : undefined}
              >
                <span>{item.label}</span>
                <small>{item.description}</small>
              </a>
            </li>
          ))}
          {filteredItems.length === 0 ? <li className="pal-empty">Ничего не найдено</li> : null}
        </ul>
        <div className="pal-foot">↑ ↓ выбрать · Enter открыть · Esc закрыть</div>
      </div>
    </div>
  );
}
```

## `src/components/common/CopyValueButton.tsx`

```tsx
"use client";

import { useState } from "react";
import { useRuntimeUI } from "@/components/runtime/RuntimeUIProvider";

export interface CopyValueButtonProps {
  readonly value: string;
  readonly label: string;
  readonly children: string;
}

export function CopyValueButton({ value, label, children }: CopyValueButtonProps) {
  const { showToast } = useRuntimeUI();
  const [copying, setCopying] = useState(false);

  const copy = async () => {
    if (copying) return;
    setCopying(true);

    try {
      await navigator.clipboard.writeText(value);
      showToast("Скопировано");
    } catch {
      showToast("Не удалось скопировать. Скопируй адрес вручную.");
    } finally {
      setCopying(false);
    }
  };

  return (
    <button
      aria-label={label}
      className="copy-value"
      disabled={copying}
      onClick={() => void copy()}
      type="button"
    >
      {children}
    </button>
  );
}
```

## `src/components/common/TrackedLink.tsx`

```tsx
"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";
import { trackMistnetConversion } from "@/lib/runtime/tracking";
import type { MistnetConversionAction } from "@/lib/runtime/contracts";

export interface TrackedLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  readonly href: string;
  readonly action: MistnetConversionAction;
  readonly plan?: string | null;
  readonly children: ReactNode;
}

export function TrackedLink({
  href,
  action,
  plan = null,
  onClick,
  children,
  ...props
}: TrackedLinkProps) {
  return (
    <a
      {...props}
      href={href}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
          trackMistnetConversion({ event: action, plan, destination: href });
        }
      }}
    >
      {children}
    </a>
  );
}
```

## `src/components/footer/FooterLinkColumn.tsx`

```tsx
import type { JSX } from "react";
import { TrackedLink } from "@/components/common/TrackedLink";
import type {
  FooterLinkColumnData,
  FooterLinkItem,
} from "@/components/footer/footer.types";

interface FooterLinkProps {
  readonly link: FooterLinkItem;
}

function FooterLink({ link }: FooterLinkProps): JSX.Element {
  const linkProps = {
    href: link.href,
    target: link.target ?? undefined,
    rel: link.target === "_blank" ? "noopener noreferrer" : undefined,
  } as const;

  if (link.conversionAction) {
    return (
      <TrackedLink {...linkProps} action={link.conversionAction}>
        {link.label}
      </TrackedLink>
    );
  }

  return <a {...linkProps}>{link.label}</a>;
}

interface FooterLinkColumnProps {
  readonly column: FooterLinkColumnData;
}

export function FooterLinkColumn({ column }: FooterLinkColumnProps): JSX.Element {
  return (
    <nav aria-label={column.title} className="footer-col">
      <h5>{column.title}</h5>
      {column.links.map((link) => <FooterLink key={link.href} link={link} />)}
    </nav>
  );
}
```

## `src/components/footer/footer.data.ts`

```ts
import { MISTNET_LINKS } from "@/lib/links";
import type { FooterLinkColumnData } from "@/components/footer/footer.types";

export const FOOTER_LINK_COLUMNS: readonly FooterLinkColumnData[] = [
  {
    title: "Продукт",
    links: [
      { label: "Тарифы", href: "#pricing", target: null },
      { label: "Локации", href: "#map", target: null },
      { label: "FAQ", href: "#faq", target: null },
      {
        label: "Купить подписку",
        href: MISTNET_LINKS.quickPurchase,
        target: null,
        conversionAction: "quick_purchase",
      },
    ],
  },
  {
    title: "Личный кабинет и связь",
    links: [
      {
        label: "Личный кабинет / бесплатный тест",
        href: MISTNET_LINKS.cabinet,
        target: null,
      },
      {
        label: "Поддержка в Telegram",
        href: MISTNET_LINKS.telegramSupport,
        target: "_blank",
      },
      {
        label: "Telegram-бот (альтернатива)",
        href: MISTNET_LINKS.telegramBot,
        target: "_blank",
      },
    ],
  },
];
```

## `src/components/footer/footer.types.ts`

```ts
import type { MistnetConversionAction } from "@/lib/runtime/contracts";
export interface FooterLinkItem {
  readonly label: string;
  readonly href: string;
  readonly target: "_blank" | null;
  readonly conversionAction?: MistnetConversionAction;
}

export interface FooterLinkColumnData {
  readonly title: string;
  readonly links: readonly FooterLinkItem[];
}
```

## `src/components/header/HeaderActions.tsx`

```tsx
"use client";

import { useRuntimeUI } from "@/components/runtime/RuntimeUIProvider";
import { TrackedLink } from "@/components/common/TrackedLink";
import { MISTNET_LINKS } from "@/lib/links";

export function HeaderActions() {
  const { openCommandPalette } = useRuntimeUI();

  return (
    <div className="nav-actions">
      <div className="nav-account-group">
        <TrackedLink action="cabinet_open" className="nav-cabinet" href={MISTNET_LINKS.cabinet}>
          Личный кабинет
        </TrackedLink>
        <button
          aria-controls="pal"
          aria-haspopup="dialog"
          aria-keyshortcuts="Control+K Meta+K"
          aria-label="Быстрые переходы"
          className="nav-search"
          onClick={openCommandPalette}
          title="Быстрые переходы · Ctrl+K"
          type="button"
        >
          <svg aria-hidden="true" className="nav-search-icon" fill="none" viewBox="0 0 24 24">
            <circle cx="10.8" cy="10.8" r="6.8" stroke="currentColor" />
            <path d="m16 16 4.5 4.5" stroke="currentColor" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <TrackedLink action="trial_open" className="nav-btn nav-cta" href={MISTNET_LINKS.cabinet}>
        Начать бесплатно <span aria-hidden="true">↗</span>
      </TrackedLink>
    </div>
  );
}
```

## `src/components/header/MobileNavigation.tsx`

```tsx
import type { RefObject } from "react";
import { TrackedLink } from "@/components/common/TrackedLink";
import { MISTNET_LINKS } from "@/lib/links";

export interface MobileNavigationProps {
  readonly menuOpen: boolean;
  readonly onNavigate: () => void;
  readonly menuRef: RefObject<HTMLDivElement | null>;
}

export function MobileNavigation({ menuOpen, onNavigate, menuRef }: MobileNavigationProps) {
  return (
    <div
      aria-hidden={!menuOpen}
      aria-label="Мобильная навигация MISTNET"
      aria-modal={menuOpen ? true : undefined}
      className={`mnav${menuOpen ? " open" : ""}`}
      id="mnav"
      inert={!menuOpen}
      ref={menuRef}
      role="dialog"
    >
      <nav aria-label="Мобильное меню">
        <a href="#advantages" onClick={onNavigate}>Преимущества</a>
        <a href="#map" onClick={onNavigate}>Локации</a>
        <a href="#pricing" onClick={onNavigate}>Тарифы</a>
        <a href="#howTo" onClick={onNavigate}>Как подключиться</a>
        <a href="#faq" onClick={onNavigate}>FAQ</a>
        <TrackedLink action="cabinet_open" href={MISTNET_LINKS.cabinet} onClick={onNavigate}>
          Личный кабинет / бесплатный тест
        </TrackedLink>
        <TrackedLink action="quick_purchase" href={MISTNET_LINKS.quickPurchase} onClick={onNavigate}>
          Купить подписку
        </TrackedLink>
        <a href={MISTNET_LINKS.telegramBot} onClick={onNavigate} rel="noopener noreferrer" target="_blank">
          Telegram-бот (альтернатива)
        </a>
      </nav>
    </div>
  );
}
```

## `src/components/hero/HeroContent.tsx`

```tsx
import type { JSX } from "react";
import { TrackedLink } from "@/components/common/TrackedLink";
import { MISTNET_LINKS } from "@/lib/links";

export function HeroContent(): JSX.Element {
  return (
    <>
      <div className="logo-large logo-glitch" data-text="MISTNET">
        MIST<span>NET</span>
      </div>
      <h1>
        Свобода в каждой <span className="grad">секунде</span>
      </h1>
      <p className="hero-description">
        Высокоскоростной VPN без границ. Серверы в США, Финляндии, Нидерландах и Турции. <b>Обход белых списков.</b> Конфиденциальность и удобное подключение.
      </p>
      <p className="hero-offer">
        <span aria-hidden="true" className="hero-offer-icon">🎁</span>
        <span><b>Бесплатный тест на 3 дня</b> можно активировать в личном кабинете.</span>
      </p>
      <div className="btn-group">
        <TrackedLink action="trial_open" className="btn btn-primary" href={MISTNET_LINKS.cabinet}>
          Активировать 3 дня бесплатно ↗
        </TrackedLink>
        <a className="btn btn-secondary" href="#pricing">Выбрать тарифы</a>
      </div>
      <p className="hero-access-note">
        <span aria-hidden="true" className="hero-access-check">
          <svg aria-hidden="true" className="hero-access-check-icon" viewBox="0 0 16 16" fill="none">
            <path d="m3.5 8.2 2.8 2.7 6.2-6.1" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <span>Можно войти через Email, Google, Яндекс, VK или Telegram — мессенджер не обязателен.</span>
      </p>
    </>
  );
}
```

## `src/components/hero/HeroMascot.tsx`

```tsx
"use client";

import Image from "next/image";
import { useEffect, useState, type JSX } from "react";
import { useReducedMotion } from "@/hooks/runtime/useReducedMotion";

const TALK_MESSAGES = [
  "Привет! Я MIST — маскот MISTNET",
  "Тест на 3 дня можно активировать в кабинете",
  "Для входа Telegram не обязателен",
  "Помогу разобраться с сайтом!",
] as const;

const POKE_MESSAGES = [
  "Ой, щекотно!",
  "Загляни в раздел тарифов!",
  "Начать можно через личный кабинет",
  "Ещё разок?",
] as const;

export function HeroMascot(): JSX.Element {
  const reducedMotion = useReducedMotion();
  const [message, setMessage] = useState<string>(TALK_MESSAGES[0]);
  const [messageVisible, setMessageVisible] = useState(false);
  const [pokeIndex, setPokeIndex] = useState(0);
  const [interactionVersion, setInteractionVersion] = useState(0);
  const [sparkBurst, setSparkBurst] = useState(0);

  useEffect(() => {
    if (reducedMotion) return;

    let intervalId = 0;
    const initialDelay = interactionVersion === 0 ? 1800 : 6000;
    const firstTimer = window.setTimeout(() => {
      setMessageVisible(true);
      let messageIndex = 0;
      intervalId = window.setInterval(() => {
        messageIndex = (messageIndex + 1) % TALK_MESSAGES.length;
        setMessage(TALK_MESSAGES[messageIndex]);
      }, 4800);
    }, initialDelay);

    return () => {
      window.clearTimeout(firstTimer);
      window.clearInterval(intervalId);
    };
  }, [interactionVersion, reducedMotion]);

  useEffect(() => {
    if (sparkBurst === 0) return;
    const timerId = window.setTimeout(() => setSparkBurst(0), 900);
    return () => window.clearTimeout(timerId);
  }, [sparkBurst]);

  const handleMascotClick = () => {
    setMessage(POKE_MESSAGES[pokeIndex % POKE_MESSAGES.length]);
    setPokeIndex((index) => index + 1);
    setMessageVisible(true);
    setInteractionVersion((version) => version + 1);
    setSparkBurst((burst) => burst + 1);
    if (navigator.vibrate) navigator.vibrate(10);
  };

  return (
    <div className="mascot-scroll">
      <div className="mascot-wrap">
        <div aria-hidden="true" className={`bot-say${messageVisible || reducedMotion ? " on" : ""}`}>
          {message}
        </div>
        <span aria-hidden="true" className="orb o1">WireGuard</span>
        <span aria-hidden="true" className="orb o2">Cabinet First</span>
        <div className="mascot-glow" />
        <div className="holo-ring" />
        <div className="holo-ring r2" />
        <div className="mascot-stage">
          <svg aria-hidden="true" className="mascot-svg" viewBox="0 0 400 400">
            <defs>
              <radialGradient cx="50%" cy="35%" id="shieldFill" r="65%">
                <stop offset="0%" stopColor="rgba(0,210,255,.55)" />
                <stop offset="55%" stopColor="rgba(0,150,220,.18)" />
                <stop offset="100%" stopColor="rgba(20,40,80,.05)" />
              </radialGradient>
              <linearGradient id="shieldStroke" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#33ddff" />
                <stop offset="100%" stopColor="#7c3aed" />
              </linearGradient>
              <filter height="160%" id="shieldGlow" width="160%" x="-30%" y="-30%">
                <feGaussianBlur result="b" stdDeviation="6" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <g filter="url(#shieldGlow)">
              <path
                d="M200 50 L340 110 L340 220 Q340 320 200 365 Q60 320 60 220 L60 110 Z"
                fill="url(#shieldFill)"
                stroke="url(#shieldStroke)"
                strokeLinejoin="round"
                strokeWidth="2.5"
              />
              <path
                d="M200 75 L315 125 L315 220 Q315 300 200 340 Q85 300 85 220 L85 125 Z"
                fill="none"
                stroke="rgba(0,210,255,.3)"
                strokeDasharray="4 6"
                strokeWidth="1"
              />
              <path
                d="M160 200 L190 230 L245 165"
                fill="none"
                filter="url(#shieldGlow)"
                stroke="#fff"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="8"
              />
            </g>
            <circle cx="200" cy="200" fill="none" r="180" stroke="rgba(0,210,255,.08)" strokeDasharray="2 8" strokeWidth="1" />
          </svg>
          <button
            aria-label="Поговорить с маскотом MISTNET"
            className="mascot-bot-trigger"
            onClick={handleMascotClick}
            type="button"
          >
            <Image
              alt="Талисман MISTNET: робот MN машет рукой"
              className="mascot-bot"
              height={960}
              priority
              quality={92}
              sizes="(max-width: 960px) 72vw, (max-width: 1400px) 38vw, 460px"
              src="/mascot.webp"
              width={640}
            />
          </button>
          {sparkBurst > 0 ? (
            <span aria-hidden="true" className={`spark-burst spark-burst-${sparkBurst % 3}`}>
              {Array.from({ length: 14 }, (_, index) => <span className={`spark spark-${index + 1}`} key={`${sparkBurst}-${index}`} />)}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
```

## `src/components/hero/HeroPingPanel.tsx`

```tsx
"use client";

import type { JSX } from "react";
import type { HeroLocation } from "@/components/hero/hero.types";
import { useServerStatus } from "@/components/runtime/ServerStatusProvider";

export interface HeroPingPanelProps {
  readonly locations: readonly HeroLocation[];
}

function getBarLevel(latencyMs: number | null): number {
  if (latencyMs === null) return 0;
  const width = 20 + ((94 - latencyMs) / (94 - 42)) * 74;
  return Math.max(0, Math.min(100, Math.round(width / 10) * 10));
}

export function HeroPingPanel({ locations }: HeroPingPanelProps): JSX.Element {
  const { mode, nodes, summary, message } = useServerStatus();
  const statusClass =
    mode === "demo"
      ? "demo"
      : mode === "live"
        ? locations.some((location) => nodes[location.id].status === "offline")
          ? "offline"
          : locations.some((location) => nodes[location.id].status === "online")
            ? "online"
            : "neutral"
        : "neutral";

  return (
    <div className="ping-widget">
      <div className="ping-header">
        <span>Состояние серверов</span>
        <span className={`ping-status ping-status-${statusClass}`}>
          <span aria-hidden="true" className="ping-dot" />
          <span>{summary}</span>
        </span>
      </div>

      <div className="ping-row ping-row-feature">
        <span className="node">🛡️ Режим обхода ограничений</span>
        <span className="ping-feature-tag">TITAN</span>
        <span className="val">—</span>
      </div>

      {locations.map((location) => {
        const node = nodes[location.id];
        const level = getBarLevel(node.latencyMs);
        const value = node.latencyMs === null ? "—" : `${node.latencyMs}ms`;

        return (
          <div className="ping-row" key={location.id}>
            <span className="node">
              <svg aria-hidden="true" className="flag" focusable="false">
                <use href={`#${location.flagSpriteId}`} />
              </svg>
              {` ${location.country} · ${location.city}`}
            </span>
            <div className="ping-bar" aria-hidden="true">
              <div className={`ping-bar-fill ping-width-${level}`} />
            </div>
            <span className={`val ${mode === "demo" ? "demo-ping-value" : ""}`}>
              {value}
            </span>
          </div>
        );
      })}

      <div className="ping-note">
        {message}
      </div>
    </div>
  );
}
```

## `src/components/hero/HeroServerList.tsx`

```tsx
"use client";

import type { JSX } from "react";
import {
  HERO_APP_ENTRIES,
  HERO_APP_SUMMARY,
} from "@/components/hero/hero.data";
import type { HeroAppEntry } from "@/components/hero/hero.types";
import { useServerStatus } from "@/components/runtime/ServerStatusProvider";
import { SERVER_LOCATION_BY_ID } from "@/data/servers";

interface HeroAppEntryRowProps {
  readonly entry: HeroAppEntry;
}

function HeroAppEntryRow({ entry }: HeroAppEntryRowProps): JSX.Element {
  const { mode, nodes } = useServerStatus();

  if (entry.kind === "feature") {
    return (
      <li>
        <span aria-hidden="true" className="app-ico">
          <svg
            className="hero-server-feature-icon"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            viewBox="0 0 24 24"
          >
            <path d="M4 18v-3M9 18v-6M14 18V9M19 18V5" />
          </svg>
        </span>
        <div>
          <b>{entry.title}</b>
          <small>{entry.description}</small>
        </div>
        <em className="ms feature">{entry.badge}</em>
      </li>
    );
  }

  const location = SERVER_LOCATION_BY_ID[entry.locationId];
  const node = nodes[location.id];
  const statusClass = mode === "demo" ? "demo" : node.status;
  const statusText =
    mode === "demo"
      ? `≈ ${node.latencyMs ?? location.initialDemoPing}ms`
      : mode === "live" && node.status !== "unknown"
        ? node.status.toUpperCase()
        : "—";

  return (
    <li data-status-location={location.id}>
      <span aria-hidden="true" className="app-ico">
        <svg aria-hidden="true" className="flag" focusable="false">
          <use href={`#${location.flagSpriteId}`} />
        </svg>
      </span>
      <div>
        <b>{`MN - ${location.country} #${entry.serverNumber}`}</b>
        <small>{`${location.city} · ${entry.detail}`}</small>
      </div>
      <em className={`ms ${statusClass}`}>
        {statusText}
      </em>
    </li>
  );
}

export function HeroServerList(): JSX.Element {
  const { mode } = useServerStatus();

  return (
    <div className="app-scroll">
      <aside aria-label="Серверы MISTNET в приложении" className="app-list">
        <div className="app-head">
          <span>Серверы в приложении</span>
          <span className="app-demo-badge" hidden={mode !== "demo"}>
            ДЕМО-ПИНГ
          </span>
        </div>
        <ul>
          {HERO_APP_ENTRIES.map((entry) => (
            <HeroAppEntryRow entry={entry} key={entry.id} />
          ))}
        </ul>
        <div className="app-more">{HERO_APP_SUMMARY}</div>
      </aside>
    </div>
  );
}
```

## `src/components/hero/HeroStats.tsx`

```tsx
"use client";

import { useRef, useState, type JSX } from "react";
import type { HeroStatistic } from "@/components/hero/hero.types";
import { useAnimationFrame } from "@/hooks/runtime/useAnimationFrame";
import { useIntersectionObserver } from "@/hooks/runtime/useIntersectionObserver";
import { useReducedMotion } from "@/hooks/runtime/useReducedMotion";

interface AnimatedStatProps {
  readonly value: number;
  readonly suffix: string;
}

function AnimatedStat({ value, suffix }: AnimatedStatProps): JSX.Element {
  const { ref, isIntersecting } = useIntersectionObserver<HTMLHeadingElement>({
    threshold: 0.5,
    triggerOnce: true,
  });
  const reducedMotion = useReducedMotion();
  const [current, setCurrent] = useState(0);
  const [complete, setComplete] = useState(false);
  const startTimeRef = useRef<number | null>(null);

  useAnimationFrame((time) => {
    if (startTimeRef.current === null) startTimeRef.current = time;
    const progress = Math.min(1, (time - startTimeRef.current) / 1200);
    const eased = 1 - Math.pow(1 - progress, 3);
    setCurrent(Math.round(value * eased));
    if (progress >= 1) setComplete(true);
  }, isIntersecting && !reducedMotion && !complete);

  const displayedValue = reducedMotion ? value : current;
  return <h4 ref={ref}>{`${displayedValue}${suffix}`}</h4>;
}

export interface HeroStatsProps {
  readonly items: readonly HeroStatistic[];
}

export function HeroStats({ items }: HeroStatsProps): JSX.Element {
  return (
    <div className="stats" aria-label="Ключевые параметры MISTNET">
      {items.map((item) => (
        <div className={item.className} key={item.id}>
          {item.kind === "counter" ? (
            <AnimatedStat value={item.counterValue} suffix={item.counterSuffix} />
          ) : (
            <h4>{item.value}</h4>
          )}
          <p>{item.label}</p>
        </div>
      ))}
    </div>
  );
}
```

## `src/components/hero/HeroVisual.tsx`

```tsx
import type { JSX } from "react";
import { HeroMascot } from "@/components/hero/HeroMascot";
import { HeroServerList } from "@/components/hero/HeroServerList";

export function HeroVisual(): JSX.Element {
  return (
    <div className="hero-image">
      <HeroMascot />
      <HeroServerList />
    </div>
  );
}
```

## `src/components/runtime/RuntimeUIProvider.tsx`

```tsx
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useTimeout } from "@/hooks/runtime/useTimeout";

export interface RuntimeUIContextValue {
  readonly commandPaletteOpen: boolean;
  readonly openCommandPalette: () => void;
  readonly closeCommandPalette: () => void;
  readonly toastMessage: string;
  readonly showToast: (message: string) => void;
}

const RuntimeUIContext = createContext<RuntimeUIContextValue | null>(null);

export interface RuntimeUIProviderProps {
  readonly children: ReactNode;
}

export function RuntimeUIProvider({ children }: RuntimeUIProviderProps) {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVersion, setToastVersion] = useState(0);

  const openCommandPalette = useCallback(() => setCommandPaletteOpen(true), []);
  const closeCommandPalette = useCallback(() => setCommandPaletteOpen(false), []);
  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setToastVersion((version) => version + 1);
  }, []);

  useTimeout(
    () => setToastMessage(""),
    toastMessage ? 2200 : null,
    Boolean(toastMessage),
    toastVersion,
  );

  const value = useMemo<RuntimeUIContextValue>(
    () => ({
      commandPaletteOpen,
      openCommandPalette,
      closeCommandPalette,
      toastMessage,
      showToast,
    }),
    [commandPaletteOpen, closeCommandPalette, openCommandPalette, showToast, toastMessage],
  );

  return <RuntimeUIContext.Provider value={value}>{children}</RuntimeUIContext.Provider>;
}

export function useRuntimeUI(): RuntimeUIContextValue {
  const context = useContext(RuntimeUIContext);
  if (!context) {
    throw new Error("useRuntimeUI must be used within RuntimeUIProvider");
  }
  return context;
}
```

## `src/components/runtime/ServerStatusProvider.tsx`

```tsx
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useInterval } from "@/hooks/runtime/useInterval";
import { SERVER_LOCATIONS } from "@/data/servers";
import { usePageVisibility } from "@/hooks/runtime/usePageVisibility";
import {
  MISTNET_INTEGRATION_CONTRACTS,
  type ServerNodeId,
  type ServerNodeStatus,
} from "@/lib/runtime/contracts";
import { parseServerStatusResponse } from "@/lib/runtime/status";

export type ServerMonitorMode = "loading" | "demo" | "live" | "unavailable";

export interface ServerNodeView {
  readonly id: ServerNodeId;
  readonly status: ServerNodeStatus;
  readonly latencyMs: number | null;
}

export interface ServerStatusContextValue {
  readonly mode: ServerMonitorMode;
  readonly nodes: Readonly<Record<ServerNodeId, ServerNodeView>>;
  readonly updatedAt: string | null;
  readonly message: string;
  readonly summary: string;
}

const SERVER_IDS: readonly ServerNodeId[] = SERVER_LOCATIONS.map((location) => location.id);
const INITIAL_VALUES: Record<ServerNodeId, number> = Object.fromEntries(
  SERVER_LOCATIONS.map((location) => [location.id, location.initialDemoPing]),
) as Record<ServerNodeId, number>;

function createInitialNodes(): Record<ServerNodeId, ServerNodeView> {
  return Object.fromEntries(
    SERVER_IDS.map((id) => [id, { id, status: "unknown", latencyMs: null }]),
  ) as Record<ServerNodeId, ServerNodeView>;
}

const ServerStatusContext = createContext<ServerStatusContextValue | null>(null);

export interface ServerStatusProviderProps {
  readonly children: ReactNode;
}

export function ServerStatusProvider({ children }: ServerStatusProviderProps) {
  const [mode, setMode] = useState<ServerMonitorMode>("loading");
  const [nodes, setNodes] = useState<Record<ServerNodeId, ServerNodeView>>(createInitialNodes);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [message, setMessage] = useState("Проверяем, подключён ли реальный мониторинг…");
  const [summary, setSummary] = useState("ПРОВЕРКА МОНИТОРИНГА");
  const isVisible = usePageVisibility();
  const requestControllerRef = useRef<AbortController | null>(null);

  const refresh = useCallback(async () => {
    if (!isVisible || requestControllerRef.current) return;

    const controller = new AbortController();
    requestControllerRef.current = controller;

    try {
      const response = await fetch(MISTNET_INTEGRATION_CONTRACTS.statusEndpoint, {
        cache: "no-store",
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });
      const payload: unknown = await response.json();
      const parsed = parseServerStatusResponse(payload);

      if (!parsed) throw new Error("Некорректный ответ мониторинга.");

      if (parsed.state === "unconfigured") {
        setMode("demo");
        setNodes((current) =>
          Object.fromEntries(
            SERVER_IDS.map((id) => [id, { id, status: "unknown", latencyMs: current[id].latencyMs ?? INITIAL_VALUES[id] }]),
          ) as Record<ServerNodeId, ServerNodeView>,
        );
        setUpdatedAt(null);
        setSummary("ДЕМО-ПИНГ · API НЕ ПОДКЛЮЧЁН");
        setMessage("Значения меняются в диапазоне 42–94 мс для демонстрации интерфейса. Это не реальные замеры и не подтверждение доступности серверов.");
        return;
      }

      if (!response.ok || parsed.state === "error") {
        throw new Error(parsed.state === "error" ? parsed.message : "Мониторинг недоступен.");
      }

      const nextNodes = createInitialNodes();
      parsed.nodes.forEach((node) => {
        nextNodes[node.id] = node;
      });
      const anyOnline = SERVER_IDS.some((id) => nextNodes[id].status === "online");
      const anyOffline = SERVER_IDS.some((id) => nextNodes[id].status === "offline");

      setMode("live");
      setNodes(nextNodes);
      setUpdatedAt(parsed.updatedAt);
      setSummary(anyOffline ? "ЕСТЬ НЕДОСТУПНЫЕ УЗЛЫ" : anyOnline ? "МОНИТОРИНГ АКТИВЕН" : "НЕТ ДАННЫХ");
      setMessage(
        parsed.updatedAt
          ? `Данные мониторинга обновлены: ${new Date(parsed.updatedAt).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}.`
          : "Статус и задержка получены из API мониторинга.",
      );
    } catch (error) {
      if (controller.signal.aborted) return;
      setMode("unavailable");
      setNodes((current) =>
        Object.fromEntries(SERVER_IDS.map((id) => [id, { ...current[id], status: "unknown", latencyMs: null }])) as Record<ServerNodeId, ServerNodeView>,
      );
      setUpdatedAt(null);
      setSummary("МОНИТОРИНГ НЕДОСТУПЕН");
      setMessage(error instanceof Error ? error.message : "Не удалось получить данные мониторинга.");
    } finally {
      if (requestControllerRef.current === controller) requestControllerRef.current = null;
    }
  }, [isVisible]);

  useEffect(() => {
    void refresh();
    return () => {
      const controller = requestControllerRef.current;
      requestControllerRef.current = null;
      controller?.abort();
    };
  }, [refresh]);

  useInterval(() => void refresh(), 30000, isVisible && mode !== "loading");

  useInterval(
    () => {
      const deltas = Object.fromEntries(
        SERVER_IDS.map((id) => [
          id,
          Math.floor(Math.random() * 9) - 4 || (Math.random() > 0.5 ? 1 : -1),
        ]),
      ) as Record<ServerNodeId, number>;

      setNodes((current) => {
        const next = { ...current };
        SERVER_IDS.forEach((id) => {
          const currentValue = current[id].latencyMs ?? INITIAL_VALUES[id];
          next[id] = {
            id,
            status: "unknown",
            latencyMs: Math.max(42, Math.min(94, currentValue + deltas[id])),
          };
        });
        return next;
      });
    },
    2600,
    isVisible && mode === "demo",
  );

  const value = useMemo<ServerStatusContextValue>(
    () => ({ mode, nodes, updatedAt, message, summary }),
    [message, mode, nodes, summary, updatedAt],
  );

  return <ServerStatusContext.Provider value={value}>{children}</ServerStatusContext.Provider>;
}

export function useServerStatus(): ServerStatusContextValue {
  const context = useContext(ServerStatusContext);
  if (!context) throw new Error("useServerStatus must be used within ServerStatusProvider");
  return context;
}
```

## `src/components/sections/Advantages.tsx`

```tsx
import { TrackedLink } from "@/components/common/TrackedLink";
import { MISTNET_LINKS } from "@/lib/links";

const advantages = [
  {
    number: "01",
    title: "Четыре локации",
    text: "Выбирай подходящий регион: США, Финляндия, Нидерланды или Турция. Для Стамбула предусмотрено несколько вариантов подключения.",
    icon: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M3.5 12h17M12 3.5c2.2 2.3 3.2 5.1 3.2 8.5s-1 6.2-3.2 8.5c-2.2-2.3-3.2-5.1-3.2-8.5s1-6.2 3.2-8.5Z" />
      </>
    ),
  },
  {
    number: "02",
    title: "Несколько протоколов",
    text: "WireGuard, VLESS, XHTTP и Hysteria. Доступный вариант зависит от конфигурации и выбранного тарифа.",
    icon: (
      <>
        <path d="M12 3 4.5 7v5c0 4.2 2.7 7.6 7.5 9 4.8-1.4 7.5-4.8 7.5-9V7L12 3Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
  },
  {
    number: "03",
    title: "Telegram не обязателен",
    text: "В личный кабинет можно войти через Email и доступные способы авторизации. Покупка подписки также оформляется через сайт.",
    icon: (
      <>
        <rect x="4" y="5" width="16" height="14" rx="3" />
        <path d="m5 8 7 5 7-5M8 16h3" />
      </>
    ),
  },
  {
    number: "04",
    title: "Понятные тарифы",
    text: "START — 50 ГБ и до 3 устройств. TITAN — 100 ГБ и до 5 устройств, а также дополнительные варианты подключения.",
    icon: (
      <>
        <rect x="3.5" y="5" width="17" height="14" rx="2.5" />
        <path d="M3.5 9h17M7 14h4M7 16.5h7" />
      </>
    ),
  },
];

export function Advantages() {
  return (
    <section className="container section advantages-section" id="advantages" aria-labelledby="advantages-title">
      <div className="section-kicker">MISTNET БЕЗ ЛИШНИХ СЛОЖНОСТЕЙ</div>
      <h2 className="section-title" id="advantages-title">
        Всё важное — <span className="grad">уже внутри</span>
      </h2>
      <p className="section-subtitle">
        Выбирай локацию и подходящий тариф, а подпиской и подключением управляй в одном личном кабинете.
      </p>

      <div className="advantages-grid">
        {advantages.map((item) => (
          <article className="advantage-card" key={item.number}>
            <div className="advantage-card-top">
              <span className="advantage-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                  {item.icon}
                </svg>
              </span>
              <span className="advantage-number">{item.number}</span>
            </div>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </article>
        ))}
      </div>

      <div className="advantages-footer">
        <div>
          <strong>Можно начать без Telegram</strong>
          <p>Войди в кабинет удобным способом и активируй доступный бесплатный тест на 3 дня.</p>
        </div>
        <TrackedLink action="cabinet_open" className="advantages-link" href={MISTNET_LINKS.cabinet}>
          Открыть личный кабинет <span aria-hidden="true">↗</span>
        </TrackedLink>
      </div>
    </section>
  );
}
```

## `src/components/sections/FAQ.tsx`

```tsx
"use client";

import { useState, type ReactNode } from "react";
import { MISTNET_LINKS } from "@/lib/links";
import { SERVER_LOCATIONS } from "@/data/servers";

interface FAQItem {
  readonly question: string;
  readonly answer: ReactNode;
}

const questions: readonly FAQItem[] = [
  {
    question: "Обязательно ли пользоваться Telegram?",
    answer: (
      <>
        Нет. Для входа и управления подпиской используй <a href={MISTNET_LINKS.cabinet}>личный кабинет MISTNET</a>.
        Доступны способы входа через Email, Google, Яндекс, VK и Telegram. Сам мессенджер не обязателен.
      </>
    ),
  },
  {
    question: "Как активировать бесплатный тест?",
    answer: (
      <>
        Открой <a href={MISTNET_LINKS.cabinet}>личный кабинет</a> и войди удобным способом. На главной странице кабинета
        есть активация пробного периода на 3 дня. Telegram для этого не требуется.
      </>
    ),
  },
  {
    question: "Как купить START или TITAN?",
    answer: (
      <>
        Перейди на <a href={MISTNET_LINKS.quickPurchase}>страницу оформления подписки</a>. Там выбери START или TITAN,
        срок на 1, 2 или 3 месяца, укажи Email или Telegram username и доступный способ оплаты. На сайте MISTNET
        платёжные данные не вводятся — оформление проходит в кабинете.
      </>
    ),
  },
  {
    question: "Чем отличаются START и TITAN?",
    answer: (
      <>
        START включает 50 ГБ трафика и до 3 устройств. TITAN — 100 ГБ и до 5 устройств, а также дополнительные варианты
        подключения для более сложных сетевых условий. Подробные условия и итоговую стоимость проверь на странице оформления.
      </>
    ),
  },
  {
    question: "Какие локации доступны?",
    answer: (
      <>
        В интерфейсе MISTNET представлены{" "}
        {SERVER_LOCATIONS.map((location, index) => {
          const label = `${location.country} (${location.city})`;
          const separator = index === 0 ? "" : index === SERVER_LOCATIONS.length - 1 ? " и " : ", ";
          return `${separator}${label}`;
        })}.
        Доступность конкретной конфигурации отображается в личном кабинете.
      </>
    ),
  },
  {
    question: "Какие протоколы использует MISTNET?",
    answer: (
      <>
        MISTNET предлагает WireGuard, VLESS, XHTTP и Hysteria. Доступный протокол зависит от конфигурации,
        которую ты получаешь в личном кабинете, и совместимого приложения.
      </>
    ),
  },
  {
    question: "Работает ли обход ограничений у всех операторов?",
    answer: (
      <>
        Работа зависит от региона, сети оператора, маршрутизации и текущих ограничений. Дополнительные режимы TITAN
        предназначены для более сложных условий, но гарантировать одинаковый результат в каждой сети нельзя.
      </>
    ),
  },
  {
    question: "Что делать, если Telegram недоступен?",
    answer: (
      <>
        Используй <a href={MISTNET_LINKS.cabinet}>личный кабинет</a>: там можно войти через Email или доступный внешний
        способ авторизации, активировать тест, купить подписку и управлять подключением. Telegram-бот остаётся альтернативой.
      </>
    ),
  },
  {
    question: "Где получить помощь?",
    answer: (
      <>
        Открой раздел поддержки в личном кабинете или напиши в{" "}
        <a href={MISTNET_LINKS.telegramSupport} target="_blank" rel="noopener noreferrer">
          Telegram-поддержку @mistnet_support
        </a>.
        Telegram — дополнительный канал связи.
      </>
    ),
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="container section" id="faq" aria-labelledby="faq-title">
      <h2 className="section-title" id="faq-title">Частые вопросы</h2>
      <p className="section-subtitle">
        Коротко о тарифах, локациях, подключении и работе без Telegram.
      </p>
      <div className="faq-container">
        {questions.map((item, index) => {
          const expanded = openIndex === index;
          const questionId = `faq-question-${index + 1}`;
          const answerId = `faq-answer-${index + 1}`;

          return (
            <div className={`faq-item${expanded ? " active" : ""}`} key={item.question}>
              <button
                aria-controls={answerId}
                aria-expanded={expanded}
                className="faq-question"
                id={questionId}
                onClick={() => setOpenIndex(expanded ? null : index)}
                type="button"
              >
                {item.question}
                <span aria-hidden="true" className="faq-icon">+</span>
              </button>
              <div
                aria-hidden={!expanded}
                aria-labelledby={questionId}
                className="faq-answer"
                hidden={!expanded}
                id={answerId}
                inert={!expanded}
                role="region"
              >
                <p>{item.answer}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
```

## `src/components/sections/FinalCTA.tsx`

```tsx
import { CopyValueButton } from "@/components/common/CopyValueButton";
import { TrackedLink } from "@/components/common/TrackedLink";
import { MISTNET_LINKS } from "@/lib/links";

export function FinalCTA() {
  return (
    <section className="final-cta">
      <h2>
        Готов к <span className="grad">свободе</span>?
      </h2>
      <p>Активируй бесплатный тест или выбери подписку в личном кабинете. Telegram для этого не обязателен.</p>
      <div className="btn-group">
        <TrackedLink action="trial_open" className="btn btn-primary final-cta-primary" href={MISTNET_LINKS.cabinet}>
          🎁 Начать бесплатно в кабинете ↗
        </TrackedLink>
        <TrackedLink action="quick_purchase" className="btn btn-secondary" href={MISTNET_LINKS.quickPurchase}>
          Купить подписку →
        </TrackedLink>
      </div>
      <div className="copy-hint">
        личный кабинет: <CopyValueButton label="Скопировать адрес личного кабинета" value={MISTNET_LINKS.cabinet}>lk.mistnet.ru</CopyValueButton>
        {" · "}
        <a href={MISTNET_LINKS.telegramBot} rel="noopener noreferrer" target="_blank">
          Telegram-бот — альтернативный способ
        </a>
      </div>
    </section>
  );
}
```

## `src/components/sections/Hero.tsx`

```tsx
import type { JSX } from "react";
import { HeroNetworkBridge } from "@/components/HeroNetworkBridge";
import { HeroContent } from "@/components/hero/HeroContent";
import { HERO_STATS } from "@/components/hero/hero.data";
import { SERVER_LOCATIONS } from "@/data/servers";
import { HeroPingPanel } from "@/components/hero/HeroPingPanel";
import { HeroStats } from "@/components/hero/HeroStats";
import { HeroVisual } from "@/components/hero/HeroVisual";

export function Hero(): JSX.Element {
  return (
    <section className="container hero">
      <HeroNetworkBridge />

      <div className="hero-text">
        <HeroContent />
        <HeroPingPanel locations={SERVER_LOCATIONS} />
        <HeroStats items={HERO_STATS} />
      </div>

      <HeroVisual />
    </section>
  );
}
```

## `src/components/sections/HowTo.tsx`

```tsx
import { TrackedLink } from "@/components/common/TrackedLink";
import { MISTNET_LINKS } from "@/lib/links";

export function HowTo() {
  return (
    <section className="container section" id="howTo">
      <h2 className="section-title">Подключение без обязательного Telegram</h2>
      <p className="section-subtitle">
        Начни в личном кабинете — там же можно активировать тест, купить подписку и получить данные для подключения.
      </p>

      <div className="steps-grid">
        <div className="step-card">
          <div className="step-number">01</div>
          <h3>Открой личный кабинет</h3>
          <p>
            Перейди на <TrackedLink action="cabinet_open" className="step-link" href={MISTNET_LINKS.cabinet}>lk.mistnet.ru</TrackedLink>.
            Войти можно через Email, Google, Яндекс, VK или Telegram — мессенджер не обязателен.
          </p>
        </div>

        <div className="step-card">
          <div className="step-number">02</div>
          <h3>Активируй тест или выбери тариф</h3>
          <p>
            Бесплатный тест на 3 дня активируется в кабинете. Для покупки открой{" "}
            <TrackedLink action="quick_purchase" className="step-link" href={MISTNET_LINKS.quickPurchase}>страницу оформления</TrackedLink>
            {" "}— там доступны START и TITAN, периоды и способ оплаты.
          </p>
        </div>

        <div className="step-card">
          <div className="step-number">03</div>
          <h3>Получи конфигурацию и подключись</h3>
          <p>
            В кабинете открой данные для подключения, добавь конфигурацию в совместимое приложение — например, Happ или INCY — и включи VPN.
          </p>
        </div>
      </div>

      <div className="cabinet-assist-note">
        <span className="cabinet-assist-icon" aria-hidden="true">✓</span>
        <div>
          <strong>Telegram не работает? Это не проблема.</strong>
          <p>
            Для входа и оформления подписки можно использовать сайт личного кабинета. Telegram-бот остаётся дополнительным способом связи.
          </p>
        </div>
        <TrackedLink action="cabinet_open" href={MISTNET_LINKS.cabinet}>Открыть кабинет ↗</TrackedLink>
      </div>
    </section>
  );
}
```

## `src/components/sections/Locations.tsx`

```tsx
"use client";

import type { JSX } from "react";
import { LocationLegendItem } from "@/components/sections/locations/LocationLegendItem";
import { GlobeVisual } from "@/components/sections/locations/GlobeVisual";
import { useServerStatus } from "@/components/runtime/ServerStatusProvider";
import { SERVER_LOCATIONS } from "@/data/servers";

export function Locations(): JSX.Element {
  const { mode, nodes } = useServerStatus();

  return (
    <section className="container section" id="map">
      <h2 className="section-title">Глобальная сеть</h2>
      <p className="section-subtitle">
        Четыре локации в Европе, Америке и Азии — выбирай подходящую.
      </p>
      <div className="globe-wrap">
        <GlobeVisual />
        <div className="globe-legend">
          {SERVER_LOCATIONS.map((location) => (
            <LocationLegendItem key={location.id} location={location} mode={mode} node={nodes[location.id]} />
          ))}
        </div>
      </div>
      <p className="location-ping-note" hidden={mode !== "demo"}>
        * Пинг на схеме — демонстрационный диапазон 42–94 мс, а не результат измерения. Реальные показатели появятся после подключения мониторинга.
      </p>
    </section>
  );
}
```

## `src/components/sections/Pricing.tsx`

```tsx
import type { JSX } from "react";
import { PricingCard } from "@/components/sections/pricing/PricingCard";
import { PRICING_PLANS } from "@/data/pricing";

export function Pricing(): JSX.Element {
  return (
    <section className="container section" id="pricing">
      <h2 className="section-title">Выберите тариф</h2>
      <p className="section-subtitle">
        Два понятных тарифа — выбери свой.
        <br />
        Период и оплату можно выбрать на следующем шаге в личном кабинете.
      </p>
      <div className="pricing-grid">
        {PRICING_PLANS.map((plan) => (
          <PricingCard key={plan.id} plan={plan} />
        ))}
      </div>
      <p className="pricing-cabinet-hint">
        На единой странице оформления выбери тариф START или TITAN, период 1 / 2 / 3 месяца и доступный способ оплаты. Для покупки можно указать Email — Telegram не обязателен.
      </p>
    </section>
  );
}
```

## `src/components/sections/Protocols.tsx`

```tsx
export function Protocols() {
  return (
    <>
      <section className="container">
        <div className="traffic-band">
          <div className="traffic-label">{"Технологии подключения"}</div>
          <div className="traffic-num protocol-line">
            {"WireGuard "}
            <span>{"·"}</span>
            {" VLESS "}
            <span>{"·"}</span>
            {" XHTTP "}
            <span>{"·"}</span>
            {" Hysteria"}
          </div>
          <div className="traffic-sub">{"Разные протоколы для разных условий сети и совместимых приложений."}</div>
        </div>
      </section>
    </>
  );
}
```

## `src/components/sections/Quote.tsx`

```tsx
export function Quote() {
  return (
    <>
      <section className="quote-section">
        <div className="container">
          <p>
            {"«Твой интернет должен работать на тебя, а не на "}
            <span>{"ограничений"}</span>
            {".»"}
          </p>
        </div>
      </section>
    </>
  );
}
```

## `src/components/sections/Terminal.tsx`

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useIntersectionObserver } from "@/hooks/runtime/useIntersectionObserver";

const COMMAND = "why-us";
const OUTPUT_LINES = [
  { text: "Локации: США · Финляндия · Нидерланды · Турция", tone: "normal" },
  { text: "Дополнительные режимы подключения: доступны в TITAN", tone: "normal" },
  { text: "Управление подпиской: личный кабинет MISTNET", tone: "normal" },
  { text: "Лимиты трафика: START — 50 ГБ / TITAN — 100 ГБ", tone: "normal" },
  { text: "Протоколы: WireGuard / VLESS / XHTTP / Hysteria", tone: "success" },
] as const;

export function Terminal() {
  const { ref, isIntersecting } = useIntersectionObserver<HTMLElement>({
    threshold: 0.2,
    triggerOnce: true,
  });
  const [typedCommand, setTypedCommand] = useState("");
  const [visibleOutputCount, setVisibleOutputCount] = useState(0);
  const animationRunRef = useRef(false);

  useEffect(() => {
    if (!isIntersecting || animationRunRef.current) return;
    animationRunRef.current = true;
    let typingInterval = 0;
    let outputTimeout = 0;
    let startTimeout = 0;
    let index = 0;
    let outputIndex = 0;

    const typeNextCharacter = () => {
      index += 1;
      setTypedCommand(COMMAND.slice(0, index));

      if (index >= COMMAND.length) {
        window.clearInterval(typingInterval);
        outputTimeout = window.setTimeout(showNextOutput, 400);
      }
    };

    const showNextOutput = () => {
      outputIndex += 1;
      setVisibleOutputCount(outputIndex);
      if (outputIndex < OUTPUT_LINES.length) {
        outputTimeout = window.setTimeout(showNextOutput, 380);
      }
    };

    startTimeout = window.setTimeout(() => {
      typingInterval = window.setInterval(typeNextCharacter, 90);
    }, 400);

    return () => {
      window.clearTimeout(startTimeout);
      window.clearTimeout(outputTimeout);
      window.clearInterval(typingInterval);
      animationRunRef.current = false;
    };
  }, [isIntersecting]);

  return (
    <section className="container section" id="terminal" ref={ref}>
      <h2 className="section-title">Технологии MISTNET</h2>
      <p className="section-subtitle">
        Локации, тарифные лимиты, протоколы и управление подпиской — без лишних обещаний.
      </p>
      <div className="terminal-wrapper">
        <div className="terminal-header">
          <div className="term-dot red" />
          <div className="term-dot yellow" />
          <div className="term-dot green" />
        </div>
        <div
          aria-label="Краткая техническая информация MISTNET"
          aria-live="off"
          className="terminal-body"
        >
          <div className="term-line">
            <span className="term-prompt">MistNet VPN &gt;</span>
            <span className="term-cmd">{isIntersecting ? ` ${typedCommand}` : ` ${COMMAND}`}</span>
            {(!isIntersecting || visibleOutputCount < OUTPUT_LINES.length) ? <span className="cursor-blink">_</span> : null}
          </div>
          {OUTPUT_LINES.slice(0, visibleOutputCount).map((line) => (
            <div className={`term-output${line.tone === "success" ? " glow" : ""}`} key={line.text}>
              {`> ${line.text}`}
            </div>
          ))}
          {!isIntersecting
            ? OUTPUT_LINES.map((line) => (
                <div className={`term-output${line.tone === "success" ? " glow" : ""}`} key={line.text}>
                  {`> ${line.text}`}
                </div>
              ))
            : null}
        </div>
      </div>
    </section>
  );
}
```

## `src/components/sections/TrustBar.tsx`

```tsx
import type { JSX } from "react";
import { FeatureIcon } from "@/components/icons/FeatureIcon";
import type { FeatureIconName } from "@/components/icons/FeatureIcon";

interface TrustBarItem {
  readonly label: string;
  readonly icon: FeatureIconName;
}

const TRUST_ITEMS: readonly TrustBarItem[] = [
  { label: "WireGuard", icon: "shield" },
  { label: "VLESS / XHTTP", icon: "network" },
  { label: "Hysteria", icon: "activity" },
  { label: "4 локации", icon: "globe" },
  { label: "Вход без Telegram", icon: "user" },
  { label: "Тест 3 дня", icon: "gift" },
];

export function TrustBar(): JSX.Element {
  return (
    <ul className="trust-bar" aria-label="Ключевые особенности MISTNET">
      {TRUST_ITEMS.map((item) => (
        <li className="trust-item" key={item.label}>
          <span className="trust-mark" aria-hidden="true">
            <FeatureIcon name={item.icon} size="lg" />
          </span>
          <span className="trust-label">{item.label}</span>
        </li>
      ))}
    </ul>
  );
}
```

## `src/components/sections/locations/GlobeVisual.tsx`

```tsx
import type { JSX } from "react";

export function GlobeVisual(): JSX.Element {
  return (
    <div className="globe-stage">
      <svg
        aria-label="Схема глобальной сети MISTNET с четырьмя локациями"
        className="globe-fallback"
        fill="none"
        role="img"
        viewBox="0 0 460 460"
      >
        <defs>
          <radialGradient cx="36%" cy="30%" id="globeFallbackFill" r="72%">
            <stop offset="0%" stopColor="#174c69" stopOpacity=".55" />
            <stop offset="100%" stopColor="#071321" stopOpacity=".12" />
          </radialGradient>
        </defs>
        <circle cx="230" cy="230" r="176" fill="url(#globeFallbackFill)" stroke="#38cce8" strokeOpacity=".3" />
        <ellipse cx="230" cy="230" rx="176" ry="74" stroke="#38cce8" strokeOpacity=".18" />
        <ellipse cx="230" cy="230" rx="82" ry="176" stroke="#38cce8" strokeOpacity=".16" />
        <path d="M70 188c55 27 101 35 160 35 58 0 106-8 160-35M70 272c55-27 101-35 160-35 58 0 106 8 160 35" stroke="#38cce8" strokeOpacity=".14" />
        <path d="m112 162 113 72 132-85M225 234l-30 112M225 234l138 78" stroke="#43cbe9" strokeOpacity=".35" strokeDasharray="4 7" />
        <circle cx="112" cy="162" r="6" fill="#68e4f4" />
        <circle cx="225" cy="234" r="6" fill="#68e4f4" />
        <circle cx="357" cy="149" r="6" fill="#68e4f4" />
        <circle cx="195" cy="346" r="6" fill="#68e4f4" />
        <circle cx="363" cy="312" r="6" fill="#68e4f4" />
      </svg>
    </div>
  );
}
```

## `src/components/sections/locations/LocationLegendItem.tsx`

```tsx
import type { JSX } from "react";
import type { ServerLocation } from "@/data/servers";
import type { ServerNodeView, ServerMonitorMode } from "@/components/runtime/ServerStatusProvider";

export interface LocationLegendItemProps {
  readonly location: ServerLocation;
  readonly mode: ServerMonitorMode;
  readonly node: ServerNodeView;
}

export function LocationLegendItem({ location, mode, node }: LocationLegendItemProps): JSX.Element {
  const pingLabel =
    mode === "demo"
      ? `≈ ${node.latencyMs ?? location.initialDemoPing}ms`
      : mode === "live" && node.latencyMs !== null
        ? `${node.latencyMs}ms`
        : mode === "live" && node.status !== "unknown"
          ? node.status.toUpperCase()
          : "—";

  return (
    <div className="leg-item">
      <span className="leg-flag">
        <svg aria-hidden="true" className="flag" focusable="false">
          <use href={`#${location.flagSpriteId}`} />
        </svg>
      </span>
      <div className="leg-meta">
        <h4>{location.country}</h4>
        <p>{`${location.city}${location.detailSuffix ?? ""}`}</p>
      </div>
      <span className={`leg-ping ${mode === "demo" ? "demo" : node.status}`}>
        {pingLabel}
      </span>
    </div>
  );
}
```

## `src/components/sections/pricing/PricingCard.tsx`

```tsx
import type { JSX } from "react";
import { TrackedLink } from "@/components/common/TrackedLink";
import { MISTNET_LINKS } from "@/lib/links";
import type { PricingPlan } from "@/data/pricing";

export interface PricingCardProps {
  readonly plan: PricingPlan;
}

export function PricingCard({ plan }: PricingCardProps): JSX.Element {
  const cardClassName = plan.id === "TITAN"
    ? "price-card featured"
    : "price-card";

  return (
    <article className={cardClassName} aria-label={`Тариф ${plan.id}`}>
      {plan.badge ? <div className="price-badge">{plan.badge}</div> : null}
      <div className="price-name">{plan.name}</div>
      <div className="price-desc">{plan.description}</div>
      <div className="price-amount-wrap">
        <div className="price-amount">{plan.amount}</div>
        <div className="price-old">{plan.oldAmount}</div>
        <div className="price-discount">{plan.discount}</div>
      </div>
      <div className="price-period">{plan.period}</div>
      <ul className="price-features">
        {plan.features.map((feature) => (
          <li className={feature.tone} key={feature.label}>{feature.label}</li>
        ))}
      </ul>
      <TrackedLink
        action="quick_purchase"
        className="price-btn"
        href={MISTNET_LINKS.quickPurchase}
        plan={plan.id}
      >
        {plan.primaryAction}
      </TrackedLink>
      {plan.checkoutNote ? <p className="price-checkout-note">{plan.checkoutNote}</p> : null}
      {plan.trialAction ? (
        <TrackedLink action="trial_open" className="price-btn-trial" href={MISTNET_LINKS.cabinet}>
          {plan.trialAction}
        </TrackedLink>
      ) : null}
    </article>
  );
}
```

## `src/hooks/runtime/index.ts`

```ts
export { useAnimationFrame } from "@/hooks/runtime/useAnimationFrame";
export type { AnimationFrameCallback } from "@/hooks/runtime/useAnimationFrame";
export { useEventListener } from "@/hooks/runtime/useEventListener";
export type { UseEventListenerOptions } from "@/hooks/runtime/useEventListener";
export { useFocusTrap } from "@/hooks/runtime/useFocusTrap";
export type { UseFocusTrapOptions } from "@/hooks/runtime/useFocusTrap";
export { useIntersectionObserver } from "@/hooks/runtime/useIntersectionObserver";
export type {
  IntersectionObserverState,
  UseIntersectionObserverOptions,
} from "@/hooks/runtime/useIntersectionObserver";
export { useInterval } from "@/hooks/runtime/useInterval";
export { useLatest } from "@/hooks/runtime/useLatest";
export { usePageVisibility } from "@/hooks/runtime/usePageVisibility";
export { useReducedMotion } from "@/hooks/runtime/useReducedMotion";
export { useTimeout } from "@/hooks/runtime/useTimeout";
export { useMediaQuery } from "@/hooks/runtime/useMediaQuery";
```

## `src/hooks/runtime/useTimeout.ts`

```ts
"use client";

import { useEffect } from "react";
import { useLatest } from "@/hooks/runtime/useLatest";

/** Runs a one-shot callback and clears its timer on dependency change or unmount. */
export function useTimeout(
  callback: () => void,
  delay: number | null,
  enabled = true,
  restartKey?: unknown,
): void {
  const callbackRef = useLatest(callback);

  useEffect(() => {
    if (!enabled || delay === null || delay < 0) return;

    const timeoutId = window.setTimeout(() => callbackRef.current(), delay);
    return () => window.clearTimeout(timeoutId);
  }, [callbackRef, delay, enabled, restartKey]);
}
```

## `src/lib/runtime/contracts.ts`

```ts
import type { ServerLocationId } from "@/data/servers";

/**
 * Explicit integration boundary retained after the DOM runtime migration.
 * Keep these values stable for the status API and external analytics consumers.
 */
export const MISTNET_INTEGRATION_CONTRACTS = {
  statusEndpoint: "/api/status",
  conversionEventName: "mistnet:conversion",
} as const;

export type MistnetConversionAction = "cabinet_open" | "trial_open" | "quick_purchase";

export type ServerNodeId = ServerLocationId;
export type ServerNodeStatus = "online" | "offline" | "unknown";

export interface ServerStatusNode {
  readonly id: ServerNodeId;
  readonly status: ServerNodeStatus;
  readonly latencyMs: number | null;
}

export interface ServerStatusConfiguredResponse {
  readonly state: "configured";
  readonly nodes: readonly ServerStatusNode[];
  readonly updatedAt: string | null;
}

export interface ServerStatusUnconfiguredResponse {
  readonly state: "unconfigured";
  readonly message?: string;
  readonly nodes?: readonly ServerStatusNode[];
}

export interface ServerStatusErrorResponse {
  readonly state: "error";
  readonly message: string;
}

export type ServerStatusResponse =
  | ServerStatusConfiguredResponse
  | ServerStatusUnconfiguredResponse
  | ServerStatusErrorResponse;

export interface MistnetConversionDetail {
  readonly [key: string]: unknown;
  readonly event: MistnetConversionAction;
  readonly plan: string | null;
  readonly destination: string | null;
}

/** The dataLayer event carries the original conversion action (trial_open, etc.). */
export type MistnetDataLayerEvent = MistnetConversionDetail;
```

## `src/lib/runtime/status.ts`

```ts
import { SERVER_LOCATIONS } from "@/data/servers";
import type { ServerLocationId } from "@/data/servers";
import type {
  ServerNodeStatus,
  ServerStatusNode,
  ServerStatusResponse,
} from "@/lib/runtime/contracts";

const SERVER_NODE_IDS = new Set<ServerLocationId>(SERVER_LOCATIONS.map((location) => location.id));
const SERVER_NODE_STATUSES = new Set<ServerNodeStatus>([
  "online",
  "offline",
  "unknown",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseNode(value: unknown): ServerStatusNode | null {
  if (!isRecord(value)) return null;
  if (typeof value.id !== "string" || !SERVER_NODE_IDS.has(value.id as ServerLocationId)) {
    return null;
  }
  if (typeof value.status !== "string" || !SERVER_NODE_STATUSES.has(value.status as ServerNodeStatus)) {
    return null;
  }
  if (
    value.latencyMs !== null &&
    (typeof value.latencyMs !== "number" ||
      !Number.isFinite(value.latencyMs) ||
      value.latencyMs <= 0)
  ) {
    return null;
  }

  return {
    id: value.id as ServerLocationId,
    status: value.status as ServerNodeStatus,
    latencyMs: value.latencyMs,
  };
}

/** Validates the API boundary before untrusted JSON enters React state. */
export function parseServerStatusResponse(value: unknown): ServerStatusResponse | null {
  if (!isRecord(value) || typeof value.state !== "string") return null;

  if (value.state === "unconfigured") {
    return {
      state: "unconfigured",
      ...(typeof value.message === "string" ? { message: value.message } : {}),
      ...(Array.isArray(value.nodes) ? { nodes: [] } : {}),
    };
  }

  if (value.state === "error") {
    if (typeof value.message !== "string") return null;
    return { state: "error", message: value.message };
  }

  if (value.state !== "configured" || !Array.isArray(value.nodes)) return null;

  const nodes = value.nodes.map(parseNode);
  if (nodes.some((node) => node === null)) return null;

  const updatedAt =
    typeof value.updatedAt === "string" || value.updatedAt === null
      ? value.updatedAt
      : null;

  return {
    state: "configured",
    nodes: nodes as ServerStatusNode[],
    updatedAt,
  };
}
```

## `src/types/window.d.ts`

```ts
export {};

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}
```

