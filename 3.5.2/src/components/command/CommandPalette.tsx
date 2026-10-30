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
