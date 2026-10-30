import Link from "next/link";
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
        <h1>{"Кажется, эта страница затерялась в тумане."}</h1>
        <p>{"Такой страницы нет или ссылка устарела. Вернись на главную или открой личный кабинет."}</p>
        <div className="not-found-actions">
          <Link className="btn btn-primary" href="/">{"На главную ↗"}</Link>
          <a className="btn btn-secondary" href={MISTNET_LINKS.cabinet} data-track="cabinet_open">{"Личный кабинет"}</a>
        </div>
      </div>
    </main>
  );
}
