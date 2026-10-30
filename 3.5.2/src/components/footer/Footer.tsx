import type { JSX } from "react";
import { FooterBottom } from "@/components/footer/FooterBottom";
import { FooterBrand } from "@/components/footer/FooterBrand";
import { FooterLinkColumn } from "@/components/footer/FooterLinkColumn";
import { FOOTER_LINK_COLUMNS } from "@/components/footer/footer.data";

export function Footer(): JSX.Element {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <FooterBrand />
        {FOOTER_LINK_COLUMNS.map((column) => (
          <FooterLinkColumn column={column} key={column.title} />
        ))}
      </div>
      <FooterBottom />
    </footer>
  );
}
