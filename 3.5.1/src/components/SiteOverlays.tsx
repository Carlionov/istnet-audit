export function SiteOverlays() {
  return (
    <>
      <button aria-label="Наверх" className="to-top" id="toTop" type="button">{"↑"}</button>
      <div className="toast" id="toast" role="status" aria-live="polite" aria-atomic="true">
        <span className="toast-icon" aria-hidden="true">{"✓"}</span>
        <span id="toastMsg">{"Скопировано"}</span>
      </div>
      <div aria-label="Быстрый переход" aria-labelledby="palTitle" aria-hidden="true" aria-modal="true" id="pal" role="dialog">
        <div className="pal-box">
          <div className="pal-head">
            <h2 className="sr-only" id="palTitle">{"Быстрый переход по сайту"}</h2>
            <input aria-label="Поиск по разделам сайта" autoComplete="off" id="palIn" placeholder="Куда перейти?" />
            <button aria-label="Закрыть быстрый переход" className="pal-close" id="palClose" type="button">{"×"}</button>
          </div>
          <ul className="pal-list" data-lenis-prevent="" id="palList"></ul>
          <div className="pal-foot">{"↑ ↓ выбрать · Enter открыть · Esc закрыть"}</div>
        </div>
      </div>
    </>
  );
}
