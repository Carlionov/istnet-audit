"use client";

import Image from "next/image";
import { useEffect, useState, type JSX } from "react";
import { useReducedMotion } from "@/hooks/runtime/useReducedMotion";

const TALK_MESSAGES = [
  "Привет! Я MIST — маскот MISTNET",
  "Тест на 3 дня можно активировать в кабинете",
  "Для входа Telegram не обязателен",
  "Помогу разобраться с сайтом!",
] as const;

const POKE_MESSAGES = [
  "Ой, щекотно!",
  "Загляни в раздел тарифов!",
  "Начать можно через личный кабинет",
  "Ещё разок?",
] as const;

export function HeroMascot(): JSX.Element {
  const reducedMotion = useReducedMotion();
  const [message, setMessage] = useState<string>(TALK_MESSAGES[0]);
  const [messageVisible, setMessageVisible] = useState(false);
  const [pokeIndex, setPokeIndex] = useState(0);
  const [interactionVersion, setInteractionVersion] = useState(0);
  const [sparkBurst, setSparkBurst] = useState(0);

  useEffect(() => {
    if (reducedMotion) return;

    let intervalId = 0;
    const initialDelay = interactionVersion === 0 ? 1800 : 6000;
    const firstTimer = window.setTimeout(() => {
      setMessageVisible(true);
      let messageIndex = 0;
      intervalId = window.setInterval(() => {
        messageIndex = (messageIndex + 1) % TALK_MESSAGES.length;
        setMessage(TALK_MESSAGES[messageIndex]);
      }, 4800);
    }, initialDelay);

    return () => {
      window.clearTimeout(firstTimer);
      window.clearInterval(intervalId);
    };
  }, [interactionVersion, reducedMotion]);

  useEffect(() => {
    if (sparkBurst === 0) return;
    const timerId = window.setTimeout(() => setSparkBurst(0), 900);
    return () => window.clearTimeout(timerId);
  }, [sparkBurst]);

  const handleMascotClick = () => {
    setMessage(POKE_MESSAGES[pokeIndex % POKE_MESSAGES.length]);
    setPokeIndex((index) => index + 1);
    setMessageVisible(true);
    setInteractionVersion((version) => version + 1);
    setSparkBurst((burst) => burst + 1);
    if (navigator.vibrate) navigator.vibrate(10);
  };

  return (
    <div className="mascot-scroll">
      <div className="mascot-wrap">
        <div aria-hidden="true" className={`bot-say${messageVisible || reducedMotion ? " on" : ""}`}>
          {message}
        </div>
        <span aria-hidden="true" className="orb o1">WireGuard</span>
        <span aria-hidden="true" className="orb o2">Cabinet First</span>
        <div className="mascot-glow" />
        <div className="holo-ring" />
        <div className="holo-ring r2" />
        <div className="mascot-stage">
          <svg aria-hidden="true" className="mascot-svg" viewBox="0 0 400 400">
            <defs>
              <radialGradient cx="50%" cy="35%" id="shieldFill" r="65%">
                <stop offset="0%" stopColor="rgba(0,210,255,.55)" />
                <stop offset="55%" stopColor="rgba(0,150,220,.18)" />
                <stop offset="100%" stopColor="rgba(20,40,80,.05)" />
              </radialGradient>
              <linearGradient id="shieldStroke" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#33ddff" />
                <stop offset="100%" stopColor="#7c3aed" />
              </linearGradient>
              <filter height="160%" id="shieldGlow" width="160%" x="-30%" y="-30%">
                <feGaussianBlur result="b" stdDeviation="6" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <g filter="url(#shieldGlow)">
              <path
                d="M200 50 L340 110 L340 220 Q340 320 200 365 Q60 320 60 220 L60 110 Z"
                fill="url(#shieldFill)"
                stroke="url(#shieldStroke)"
                strokeLinejoin="round"
                strokeWidth="2.5"
              />
              <path
                d="M200 75 L315 125 L315 220 Q315 300 200 340 Q85 300 85 220 L85 125 Z"
                fill="none"
                stroke="rgba(0,210,255,.3)"
                strokeDasharray="4 6"
                strokeWidth="1"
              />
              <path
                d="M160 200 L190 230 L245 165"
                fill="none"
                filter="url(#shieldGlow)"
                stroke="#fff"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="8"
              />
            </g>
            <circle cx="200" cy="200" fill="none" r="180" stroke="rgba(0,210,255,.08)" strokeDasharray="2 8" strokeWidth="1" />
          </svg>
          <button
            aria-label="Поговорить с маскотом MISTNET"
            className="mascot-bot-trigger"
            onClick={handleMascotClick}
            type="button"
          >
            <Image
              alt="Талисман MISTNET: робот MN машет рукой"
              className="mascot-bot"
              height={960}
              priority
              quality={92}
              sizes="(max-width: 960px) 72vw, (max-width: 1400px) 38vw, 460px"
              src="/mascot.webp"
              width={640}
            />
          </button>
          {sparkBurst > 0 ? (
            <span aria-hidden="true" className={`spark-burst spark-burst-${sparkBurst % 3}`}>
              {Array.from({ length: 14 }, (_, index) => <span className={`spark spark-${index + 1}`} key={`${sparkBurst}-${index}`} />)}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
