export function Terminal() {
  return (
    <>
      <section className="container section" id="terminal">
        <h2 className="section-title reveal">{"Технологии MISTNET"}</h2>
        <p className="section-subtitle reveal">{"Локации, тарифные лимиты, протоколы и управление подпиской — без лишних обещаний."}</p>
        <div className="terminal-wrapper reveal" id="terminalWrapper">
          <div className="terminal-header">
            <div className="term-dot red"></div>
            <div className="term-dot yellow"></div>
            <div className="term-dot green"></div>
          </div>
          <div className="terminal-body" id="terminalBody" aria-label="Краткая техническая информация MISTNET" aria-live="off">
            <div className="term-line"><span className="term-prompt">{"MistNet VPN >"}</span><span className="term-cmd">{" overview"}</span></div>
            <div className="term-output">{"> Локации: США · Финляндия · Нидерланды · Турция"}</div>
            <div className="term-output">{"> Тарифы: START — 50 ГБ / TITAN — 100 ГБ"}</div>
            <div className="term-output">{"> Управление подпиской: личный кабинет MISTNET"}</div>
            <div className="term-output glow">{"> Протоколы: WireGuard / VLESS / XHTTP / Hysteria"}</div>
          </div>
        </div>
      </section>
    </>
  );
}
