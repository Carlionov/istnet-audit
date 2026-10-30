import Link from "next/link";
import { HeaderActions } from "@/components/header/HeaderActions";
import { MobileNavigation } from "@/components/header/MobileNavigation";

export function Header() {
  return (
    <header>
      <nav aria-label="Основная навигация" className="navbar" id="navbar">
        <div className="container">
          <Link className="logo" href="/" aria-label="MISTNET — на главную">
            MIST
            <span>NET</span>
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
            aria-expanded="false"
            aria-label="Открыть меню"
            className="burger"
            id="burger"
            type="button"
          >
            <span />
            <span />
          </button>
        </div>
      </nav>
      <MobileNavigation />
    </header>
  );
}
