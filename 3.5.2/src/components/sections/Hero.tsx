import type { JSX } from "react";
import { HeroNetworkBridge } from "@/components/HeroNetworkBridge";
import { HeroContent } from "@/components/hero/HeroContent";
import { HERO_STATS } from "@/components/hero/hero.data";
import { SERVER_LOCATIONS } from "@/data/servers";
import { HeroPingPanel } from "@/components/hero/HeroPingPanel";
import { HeroStats } from "@/components/hero/HeroStats";
import { HeroVisual } from "@/components/hero/HeroVisual";

export function Hero(): JSX.Element {
  return (
    <section className="container hero">
      <HeroNetworkBridge />

      <div className="hero-text">
        <HeroContent />
        <HeroPingPanel locations={SERVER_LOCATIONS} />
        <HeroStats items={HERO_STATS} />
      </div>

      <HeroVisual />
    </section>
  );
}
