"use client";

import { useRef, useState, type JSX } from "react";
import type { HeroStatistic } from "@/components/hero/hero.types";
import { useAnimationFrame } from "@/hooks/runtime/useAnimationFrame";
import { useIntersectionObserver } from "@/hooks/runtime/useIntersectionObserver";
import { useReducedMotion } from "@/hooks/runtime/useReducedMotion";

interface AnimatedStatProps {
  readonly value: number;
  readonly suffix: string;
}

function AnimatedStat({ value, suffix }: AnimatedStatProps): JSX.Element {
  const { ref, isIntersecting } = useIntersectionObserver<HTMLHeadingElement>({
    threshold: 0.5,
    triggerOnce: true,
  });
  const reducedMotion = useReducedMotion();
  const [current, setCurrent] = useState(0);
  const [complete, setComplete] = useState(false);
  const startTimeRef = useRef<number | null>(null);

  useAnimationFrame((time) => {
    if (startTimeRef.current === null) startTimeRef.current = time;
    const progress = Math.min(1, (time - startTimeRef.current) / 1200);
    const eased = 1 - Math.pow(1 - progress, 3);
    setCurrent(Math.round(value * eased));
    if (progress >= 1) setComplete(true);
  }, isIntersecting && !reducedMotion && !complete);

  const displayedValue = reducedMotion ? value : current;
  return <h4 ref={ref}>{`${displayedValue}${suffix}`}</h4>;
}

export interface HeroStatsProps {
  readonly items: readonly HeroStatistic[];
}

export function HeroStats({ items }: HeroStatsProps): JSX.Element {
  return (
    <div className="stats" aria-label="Ключевые параметры MISTNET">
      {items.map((item) => (
        <div className={item.className} key={item.id}>
          {item.kind === "counter" ? (
            <AnimatedStat value={item.counterValue} suffix={item.counterSuffix} />
          ) : (
            <h4>{item.value}</h4>
          )}
          <p>{item.label}</p>
        </div>
      ))}
    </div>
  );
}
