"use client";

import { useEffect, useRef, useState } from "react";
import { useIntersectionObserver } from "@/hooks/runtime/useIntersectionObserver";

const COMMAND = "why-us";
const OUTPUT_LINES = [
  { text: "Локации: США · Финляндия · Нидерланды · Турция", tone: "normal" },
  { text: "Дополнительные режимы подключения: доступны в TITAN", tone: "normal" },
  { text: "Управление подпиской: личный кабинет MISTNET", tone: "normal" },
  { text: "Лимиты трафика: START — 50 ГБ / TITAN — 100 ГБ", tone: "normal" },
  { text: "Протоколы: WireGuard / VLESS / XHTTP / Hysteria", tone: "success" },
] as const;

export function Terminal() {
  const { ref, isIntersecting } = useIntersectionObserver<HTMLElement>({
    threshold: 0.2,
    triggerOnce: true,
  });
  const [typedCommand, setTypedCommand] = useState("");
  const [visibleOutputCount, setVisibleOutputCount] = useState(0);
  const animationRunRef = useRef(false);

  useEffect(() => {
    if (!isIntersecting || animationRunRef.current) return;
    animationRunRef.current = true;
    let typingInterval = 0;
    let outputTimeout = 0;
    let startTimeout = 0;
    let index = 0;
    let outputIndex = 0;

    const typeNextCharacter = () => {
      index += 1;
      setTypedCommand(COMMAND.slice(0, index));

      if (index >= COMMAND.length) {
        window.clearInterval(typingInterval);
        outputTimeout = window.setTimeout(showNextOutput, 400);
      }
    };

    const showNextOutput = () => {
      outputIndex += 1;
      setVisibleOutputCount(outputIndex);
      if (outputIndex < OUTPUT_LINES.length) {
        outputTimeout = window.setTimeout(showNextOutput, 380);
      }
    };

    startTimeout = window.setTimeout(() => {
      typingInterval = window.setInterval(typeNextCharacter, 90);
    }, 400);

    return () => {
      window.clearTimeout(startTimeout);
      window.clearTimeout(outputTimeout);
      window.clearInterval(typingInterval);
      animationRunRef.current = false;
    };
  }, [isIntersecting]);

  return (
    <section className="container section" id="terminal" ref={ref}>
      <h2 className="section-title">Технологии MISTNET</h2>
      <p className="section-subtitle">
        Локации, тарифные лимиты, протоколы и управление подпиской — без лишних обещаний.
      </p>
      <div className="terminal-wrapper">
        <div className="terminal-header">
          <div className="term-dot red" />
          <div className="term-dot yellow" />
          <div className="term-dot green" />
        </div>
        <div
          aria-label="Краткая техническая информация MISTNET"
          aria-live="off"
          className="terminal-body"
        >
          <div className="term-line">
            <span className="term-prompt">MistNet VPN &gt;</span>
            <span className="term-cmd">{isIntersecting ? ` ${typedCommand}` : ` ${COMMAND}`}</span>
            {(!isIntersecting || visibleOutputCount < OUTPUT_LINES.length) ? <span className="cursor-blink">_</span> : null}
          </div>
          {OUTPUT_LINES.slice(0, visibleOutputCount).map((line) => (
            <div className={`term-output${line.tone === "success" ? " glow" : ""}`} key={line.text}>
              {`> ${line.text}`}
            </div>
          ))}
          {!isIntersecting
            ? OUTPUT_LINES.map((line) => (
                <div className={`term-output${line.tone === "success" ? " glow" : ""}`} key={line.text}>
                  {`> ${line.text}`}
                </div>
              ))
            : null}
        </div>
      </div>
    </section>
  );
}
