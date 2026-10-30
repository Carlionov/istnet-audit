import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { JetBrains_Mono, Manrope } from "next/font/google";
import "@/styles/tokens.css";
import "./globals.css";
import "./mistnet-v2.css";
import "./runtime-webgl.css";

const manrope = Manrope({ subsets: ["latin", "cyrillic"], display: "swap", variable: "--font-manrope" });
const jetBrainsMono = JetBrains_Mono({ subsets: ["latin", "cyrillic"], display: "swap", variable: "--font-jetbrains-mono" });
const siteUrl="https://mistnet.ru/";const pageTitle="MISTNET — VPN с 4 локациями и тестом на 3 дня";const pageDescription="MISTNET — VPN с локациями в США, Финляндии, Нидерландах и Турции. Тарифы START и TITAN, несколько протоколов, бесплатный тест на 3 дня и управление подпиской через личный кабинет. Telegram не обязателен.";
export const metadata:Metadata={metadataBase:new URL(siteUrl),title:{default:pageTitle,template:"%s | MISTNET"},description:pageDescription,applicationName:"MISTNET",category:"technology",keywords:["MISTNET","VPN MISTNET","VPN без Telegram","VPN с личным кабинетом","VPN США","VPN Финляндия","VPN Нидерланды","VPN Турция","WireGuard","VLESS","XHTTP","Hysteria"],authors:[{name:"MISTNET"}],creator:"MISTNET",publisher:"MISTNET",referrer:"strict-origin-when-cross-origin",formatDetection:{telephone:false,date:false,address:false,email:false},openGraph:{type:"website",locale:"ru_RU",url:siteUrl,siteName:"MISTNET",title:pageTitle,description:pageDescription,images:[{url:"/og-image.jpg",width:1200,height:630,alt:"MISTNET — VPN с личным кабинетом и четырьмя локациями"}]},twitter:{card:"summary_large_image",title:pageTitle,description:pageDescription,images:["/og-image.jpg"]},alternates:{canonical:siteUrl},robots:{index:true,follow:true,googleBot:{index:true,follow:true,"max-video-preview":-1,"max-image-preview":"large","max-snippet":-1}},icons:{icon:[{url:"/favicon.svg",type:"image/svg+xml"}],shortcut:"/favicon.svg"}};
export const viewport:Viewport={width:"device-width",initialScale:1,viewportFit:"cover",themeColor:"#02050a",colorScheme:"dark"};
export default function RootLayout({children}:{children:ReactNode}){return <html lang="ru"><body className={`${manrope.variable} ${jetBrainsMono.variable}`}>{children}</body></html>}
