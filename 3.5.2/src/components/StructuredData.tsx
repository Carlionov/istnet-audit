const siteUrl = "https://mistnet.ru";

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "MISTNET",
      url: siteUrl,
      description: "VPN-сервис MISTNET с личным кабинетом, несколькими локациями и вариантами подключения.",
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      name: "MISTNET",
      url: siteUrl,
      inLanguage: "ru-RU",
      publisher: { "@id": `${siteUrl}/#organization` },
    },
    {
      "@type": "Service",
      "@id": `${siteUrl}/#vpn-service`,
      name: "MISTNET VPN",
      serviceType: "VPN service",
      url: siteUrl,
      provider: { "@id": `${siteUrl}/#organization` },
      description:
        "VPN-сервис с локациями в США, Финляндии, Нидерландах и Турции. Подпиской можно управлять через личный кабинет MISTNET.",
    },
  ],
};

export function StructuredData() {
  const json = JSON.stringify(structuredData).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
