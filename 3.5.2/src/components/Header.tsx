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
