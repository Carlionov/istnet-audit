import type { JSX } from "react";
import { HeroMascot } from "@/components/hero/HeroMascot";
import { HeroServerList } from "@/components/hero/HeroServerList";

export function HeroVisual(): JSX.Element {
  return (
    <div className="hero-image">
      <HeroMascot />
      <HeroServerList />
    </div>
  );
}
