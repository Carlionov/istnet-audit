import Link from "next/link";
import type { JSX } from "react";

export function FooterBrand(): JSX.Element {
  return (
    <div className="footer-brand">
      <Link className="logo" href="/" aria-label="MISTNET — на главную">
        MIST<span>NET</span>
      </Link>
      <p>
        MISTNET — VPN с несколькими локациями и вариантами подключения.
        Подпиской можно управлять через личный кабинет.
      </p>
    </div>
  );
}
