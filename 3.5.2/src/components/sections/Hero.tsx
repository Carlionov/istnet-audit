"use client";
import { useRef, type JSX } from "react";
import { HeroNetworkBridge } from "@/components/HeroNetworkBridge";
import { HeroContent } from "@/components/hero/HeroContent";
import { HERO_STATS } from "@/components/hero/hero.data";
import { SERVER_LOCATIONS } from "@/data/servers";
import { HeroPingPanel } from "@/components/hero/HeroPingPanel";
import { HeroStats } from "@/components/hero/HeroStats";
import { HeroVisual } from "@/components/hero/HeroVisual";
import { useThreeBackground } from "@/hooks/runtime/useThreeBackground";
import { useSmoothScroll } from "@/hooks/runtime/useSmoothScroll";
import { useGsapAnimations } from "@/hooks/runtime/useGsapAnimations";
export function Hero():JSX.Element{const canvasRef=useRef<HTMLCanvasElement|null>(null);useThreeBackground(canvasRef);useSmoothScroll();useGsapAnimations();return <section className="container hero"><canvas ref={canvasRef} id="heroCanvas" aria-hidden="true"/><HeroNetworkBridge/><div className="hero-text"><HeroContent/><HeroPingPanel locations={SERVER_LOCATIONS}/><HeroStats items={HERO_STATS}/></div><HeroVisual/></section>}
