"use client";

import { useEffect, useState } from "react";

const lines = [
  { t: "> инициализация mistnet-core v2.4.1", delay: 180 },
  { t: '> загрузка криптомодулей ... <span class="ok">УСПЕШНО</span>', delay: 240 },
  { t: "> рукопожатие: WireGuard / VLESS-XHTTP", delay: 220 },
  { t: "> подключение к узлам: США · Финляндия · Нидерланды", delay: 260 },
  { t: '> проверка политики No-Logs ... <span class="ok">ПОДТВЕРЖДЕНО</span>', delay: 230 },
  { t: '> готово. добро пожаловать в свободу, <span class="p">He</span>', delay: 280 },
];

export function Preloader() {
  const [visible, setVisible] = useState(true);
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (index >= lines.length) {
      const timer = setTimeout(() => {
        setDone(true);
        setTimeout(() => setVisible(false), 600);
      }, 500);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => setIndex((i) => i + 1), lines[index].delay);
    return () => clearTimeout(timer);
  }, [index]);

  if (!visible) return null;

  return (
    <div id="preloader" className={done ? "done" : ""}>
      <div className="pre-term">
        <div className="pre-head">
          <div className="pre-dot r"></div>
          <div className="pre-dot y"></div>
          <div className="pre-dot g"></div>
          <span className="pre-title">mistnet://boot</span>
        </div>
        <div className="pre-body" id="preBody">
          {lines.slice(0, index).map((line, i) => (
            <div key={i} className="pre-line show" dangerouslySetInnerHTML={{ __html: line.t }} />
          ))}
          <div className="pre-bar">
            <div className="pre-bar-fill" style={{ width: `${(index / lines.length) * 100}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}