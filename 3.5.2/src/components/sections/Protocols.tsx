export function Protocols() {
  return (
    <>
      <section className="container">
        <div className="traffic-band">
          <div className="traffic-label">{"Технологии подключения"}</div>
          <div className="traffic-num protocol-line">
            {"WireGuard "}
            <span>{"·"}</span>
            {" VLESS "}
            <span>{"·"}</span>
            {" XHTTP "}
            <span>{"·"}</span>
            {" Hysteria"}
          </div>
          <div className="traffic-sub">{"Разные протоколы для разных условий сети и совместимых приложений."}</div>
        </div>
      </section>
    </>
  );
}
