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
