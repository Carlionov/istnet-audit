
(async () => {
  'use strict';
  const reducedMotion = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const saveData = Boolean(navigator.connection && navigator.connection.saveData);
  const lowPower = (navigator.deviceMemory && navigator.deviceMemory <= 2) || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2);

  const load = (src, test, timeoutMs = 1800) => new Promise((resolve, reject) => {
    if (test()) return resolve();
    const existing = document.querySelector(`script[data-mistnet-src="${src}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Не удалось загрузить ' + src)), { once: true });
      return;
    }
    const s = document.createElement('script');
    let settled = false;
    const finish = (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (error) { reject(error); } else { resolve(); }
    };
    const timer = setTimeout(() => finish(new Error('Тайм-аут загрузки ' + src)), timeoutMs);
    s.dataset.mistnetSrc = src;
    s.src = src;
    s.async = true;
    s.onload = () => finish();
    s.onerror = () => finish(new Error('Не удалось загрузить ' + src));
    document.head.appendChild(s);
  });
  const loadOptional = async (src, test, timeoutMs = 1800) => {
    try { await load(src, test, timeoutMs); }
    catch (error) { console.warn('[MISTNET] необязательная библиотека пропущена:', src, error); }
  };
  // Optional animation libraries load in parallel with the base UI, never blocking menus, FAQ or CTAs.
  const optionalMotionReady = (!reducedMotion && !saveData && !lowPower)
    ? loadOptional('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js', () => !!window.gsap)
      .then(async () => {
        if (window.gsap) {
          await loadOptional('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js', () => !!window.ScrollTrigger);
        }
      })
    : Promise.resolve();
  try {
    // Lenis is intentionally not fetched: native scroll keeps the page lighter and still smooth.
    // Original MISTNET runtime, with optional visual libraries and safe fallbacks.

(() => {
'use strict';
const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const fine = matchMedia('(pointer:fine) and (hover:hover)').matches;
const reduced = matchMedia('(prefers-reduced-motion:reduce)').matches;
const lowEnd = (navigator.deviceMemory && navigator.deviceMemory <= 2) || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) || (navigator.connection && navigator.connection.saveData);
const isMobile = lowEnd || matchMedia('(max-width:960px)').matches || matchMedia('(pointer:coarse)').matches;
const DPR_CAP = isMobile ? 1.05 : 1.5;
/* adaptive quality: cap total rendered pixels and scale particles with area + DPR */
const pixelRatio = (w, h) => Math.max(.75, Math.min(devicePixelRatio || 1, DPR_CAP, Math.sqrt(2.4e6 / (w * h))));
const particleBudget = (w, h) => {
  const k = Math.min(1, 1.65 / (devicePixelRatio || 1) + .25);
  return Math.round(Math.max(55, Math.min(isMobile ? 88 : 460, (w * h) / (isMobile ? 13500 : 5600) * k)));
};

/* ---- preloader ---- */
function initPreloader(){
  const pre = $('#preloader'), body = $('#preBody'), bar = $('#preBar');
  if (!pre || !body || !bar) return;
  
  let animationDone = false;
  let windowLoaded = false;

  function hidePreloader() {
    if (animationDone && windowLoaded) {
      pre.classList.add('done');
      setTimeout(() => { if(pre.parentNode) pre.remove(); }, 600);
    }
  }

  if (document.readyState === 'complete') {
    windowLoaded = true;
  } else {
    window.addEventListener('load', () => {
      windowLoaded = true;
      hidePreloader();
    });
  }

  const lines = [
    {t:'> запуск интерфейса MISTNET', delay:170},
    {t:'> подготовка разделов сайта ... <span class="ok">ГОТОВО</span>', delay:210},
    {t:'> подготовка карточек доступных локаций', delay:210},
    {t:'> открываемые разделы: личный кабинет и тарифы', delay:220},
    {t:'> варианты подключения собраны в одном месте', delay:220},
    {t:'> добро пожаловать в <span class="p">MISTNET</span>', delay:240}
  ];
  if (reduced) { animationDone = true; hidePreloader(); return; }
  let i = 0;
  function next(){
    if (i >= lines.length) { animationDone = true; hidePreloader(); return; }
    const l = lines[i++];
    const d = document.createElement('div');
    d.className = 'pre-line';
    d.innerHTML = l.t;
    const bc = body.querySelector('.pre-bar');
    body.insertBefore(d, bc || null);
    requestAnimationFrame(() => d.classList.add('show'));
    bar.style.width = ((i / lines.length) * 100) + '%';
    setTimeout(next, l.delay);
  }
  setTimeout(next, 260);
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initPreloader);
else initPreloader();

/* ---- toast ---- */
const toast = $('#toast'), toastMsg = $('#toastMsg');
let toastTimer = null;
function showToast(msg){
  if (!toast) return;
  toastMsg.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

/* ---- copy ---- */
function initCopyButtons(){
$$('[data-copy]').forEach(el => {
  el.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(el.dataset.copy); showToast('Скопировано: ' + el.dataset.copy); }
    catch { showToast('Не удалось скопировать'); }
  });
});
}

/* ---- cursor ---- */
function initCustomCursor(){
  if (!fine || reduced) return;
  document.body.classList.add('custom-cursor');
  const cur = $('#cursor'), ring = $('#cursorRing');
  let mx = innerWidth/2, my = innerHeight/2, rx = mx, ry = my, raf = null;
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    if (!cur.classList.contains('show')) { cur.classList.add('show'); ring.classList.add('show'); }
    cur.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
    if (!raf) raf = requestAnimationFrame(loop);
  }, {passive:true});
  function loop(){
    rx += (mx - rx) * .18; ry += (my - ry) * .18;
    ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
    raf = (Math.abs(mx-rx) > .3 || Math.abs(my-ry) > .3) ? requestAnimationFrame(loop) : null;
  }
  $$('a,button,.faq-question,.btn,.price-btn,.price-btn-trial,.tilt-card,.toggle-switch').forEach(el => {
    el.addEventListener('mouseenter', () => { cur.classList.add('hover'); ring.classList.add('hover'); });
    el.addEventListener('mouseleave', () => { cur.classList.remove('hover'); ring.classList.remove('hover'); });
  });
}

/* ---- reveal ---- */
function initRevealFallback(){
const io = new IntersectionObserver(es => {
  es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('active'); io.unobserve(e.target); } });
}, {threshold:.12});
window.__revealIO = io; /* fallback only: GSAP takes over when available */
$$('.reveal').forEach(el => io.observe(el));
}

/* ---- split title ---- */
function splitTitle(){
  const t = $('#heroTitle'); if (!t) return;
  const frag = document.createDocumentFragment();
  [...t.childNodes].forEach(node => {
    if (node.nodeType === 3) {
      node.textContent.split(/(\s+)/).forEach(tok => {
        if (!tok) return;
        if (/^\s+$/.test(tok)) { frag.appendChild(document.createTextNode(tok)); return; }
        const s = document.createElement('span');
        s.className = 'split-word'; s.textContent = tok;
        frag.appendChild(s);
      });
    } else if (node.nodeType === 1) {
      const s = document.createElement('span');
      s.className = 'split-word ' + node.className;
      s.textContent = node.textContent;
      frag.appendChild(s);
      frag.appendChild(document.createTextNode(' '));
    }
  });
  t.innerHTML = ''; t.appendChild(frag);
  requestAnimationFrame(() => {
    $$('.split-word', t).forEach((w, i) => setTimeout(() => w.classList.add('in'), 60 * i));
  });
}

/* ---- nav / progress / totop ---- */
function initScrollUI(){
const nav = $('#navbar'), top = $('#toTop'), prog = $('#scrollProgress');
let ticking = false;
function onScroll(){
  const y = scrollY;
  if (nav) nav.classList.toggle('visible', y > 100);
  if (top) top.classList.toggle('visible', y > 400);
  if (prog) {
    const max = document.documentElement.scrollHeight - innerHeight;
    prog.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
  }
  
  const b1 = $('#blob1'), b2 = $('#blob2');
  if(b1 && !isMobile) b1.style.transform = `translateY(${y * 0.15}px)`;
  if(b2 && !isMobile) b2.style.transform = `translateY(${-y * 0.1}px)`;

  ticking = false;
}
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, {passive:true});
if (top) top.addEventListener('click', () => (window.__lenis ? window.__lenis.scrollTo(0) : scrollTo({top:0, behavior:'smooth'})));
}

/* ---- mascot tilt ---- */
function initMascotTilt(){
  if (!fine || reduced) return;
  const wrap = $('#tiltContainer'), img = $('.mascot-stage');
  if (wrap && img) {
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
    wrap.addEventListener('mousemove', e => {
      const r = wrap.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
      if (!raf) raf = requestAnimationFrame(loop);
    }, {passive:true});
    wrap.addEventListener('mouseleave', () => { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(loop); });
    function loop(){
      cx += (tx - cx) * .12; cy += (ty - cy) * .12;
      img.style.transform = `rotateY(${cx * 12}deg) rotateX(${-cy * 12}deg)`;
      raf = (Math.abs(tx-cx) > .001 || Math.abs(ty-cy) > .001) ? requestAnimationFrame(loop) : null;
    }
  }
}

/* ============ PRICING LOGIC ============ */
function priceTilt(){
  if (!fine || reduced) return;
  $$('.tilt-card').forEach(card => {
    let raf = null, tX = 0, tY = 0, cX = 0, cY = 0;
    
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      tX = ((e.clientX - r.left) / r.width - 0.5) * 2;
      tY = ((e.clientY - r.top) / r.height - 0.5) * 2;
      if (!raf) raf = requestAnimationFrame(loop);
    }, {passive:true});
    
    card.addEventListener('mouseleave', () => {
      tX = 0; tY = 0;
      if (!raf) raf = requestAnimationFrame(loop);
    });
    
    function loop(){
      cX += (tX - cX) * .12;
      cY += (tY - cY) * .12;
      card.style.transform = `rotateY(${cX * 6}deg) rotateX(${-cY * 6}deg) translateZ(0)`;
      raf = (Math.abs(tX-cX) > .001 || Math.abs(tY-cY) > .001) ? requestAnimationFrame(loop) : null;
    }
  });
}

function ripple(e) {
  const btn = e.currentTarget;
  const rect = btn.getBoundingClientRect();
  const circle = document.createElement('span');
  const diameter = Math.max(rect.width, rect.height);
  const radius = diameter / 2;
  circle.style.width = circle.style.height = `${diameter}px`;
  circle.style.left = `${e.clientX - rect.left - radius}px`;
  circle.style.top = `${e.clientY - rect.top - radius}px`;
  circle.classList.add('ripple');
  const existing = btn.querySelector('.ripple');
  if (existing) existing.remove();
  btn.appendChild(circle);
  setTimeout(() => circle.remove(), 600);
}

/* ---- magnetic ---- */
function initRippleButtons(){
  $$('.btn,.price-btn').forEach(btn => btn.addEventListener('click', ripple));
}

function initMagneticButtons(){
  if (!fine || reduced) return;
  $$('.magnetic').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width/2) * .18;
      const y = (e.clientY - r.top - r.height/2) * .18;
      btn.style.transform = `translate(${x}px,${y}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });
}

/* ---- faq ---- */
function initFaq(){
const faq = $('#faq');
if (faq) {
  faq.addEventListener('click', e => {
    const btn = e.target.closest('.faq-question'); if (!btn) return;
    const item = btn.parentElement, ans = btn.nextElementSibling;
    const open = item.classList.contains('active');
    $$('.faq-item', faq).forEach(i => {
      i.classList.remove('active');
      const q = i.querySelector('.faq-question'); if (q) q.setAttribute('aria-expanded', 'false');
      const a = i.querySelector('.faq-answer');
      if (a) a.style.maxHeight = '';
    });
    if (!open) {
      item.classList.add('active');
      btn.setAttribute('aria-expanded', 'true');
      if (ans) ans.style.maxHeight = ans.scrollHeight + 'px';
    }
  });
}
}

/* ---- counters ---- */
function initCounters(){
const cio = new IntersectionObserver(es => {
  es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    const target = parseInt(el.dataset.counter, 10);
    const suffix = el.dataset.suffix || '';
    const dur = 1200, start = performance.now();
    (function step(t){
      const p = Math.min(1, (t - start) / dur);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
      if (p < 1) requestAnimationFrame(step);
    })(performance.now());
    cio.unobserve(el);
  });
}, {threshold:.5});
$$('[data-counter]').forEach(c => cio.observe(c));
}

/* ---- server status: live API when configured; clearly labelled demo latency otherwise ---- */
function initServerStatus(){
  const badge = $('#statusBadge');
  const badgeLabel = $('#statusLabel');
  const note = $('#statusNote');
  const appDemoBadge = $('#appDemoBadge');
  const locationPingNote = $('#locationPingNote');
  let requestInFlight = false;
  let monitoringDisabled = false;
  let pollingInterval = null;
  let demoInterval = null;
  const allowed = ['us', 'fi', 'nl', 'tr'];
  const demoValues = { us: 86, fi: 48, nl: 57, tr: 73 };

  const renderUnknown = (label, message) => {
    if (badge) badge.className = 'ping-status ping-status-neutral';
    if (badgeLabel) badgeLabel.textContent = label;
    if (note) note.textContent = message;
    if (appDemoBadge) appDemoBadge.hidden = true;
    if (locationPingNote) locationPingNote.hidden = true;
    $$('[data-ping]').forEach(el => { el.textContent = '—'; });
    $$('[data-leg-ping]').forEach(el => { el.textContent = '—'; });
    $$('[data-location-status]').forEach(el => {
      el.textContent = '—';
      el.classList.remove('online', 'offline', 'demo');
      el.classList.add('unknown');
    });
    $$('.ping-bar-fill[data-node]').forEach(el => { el.style.width = '0%'; });
  };

  const stopDemoPing = () => {
    if (demoInterval) clearInterval(demoInterval);
    demoInterval = null;
  };

  const paintDemoPing = () => {
    for (const id of allowed) {
      const value = demoValues[id];
      $$(`[data-ping="${id}"]`).forEach(el => { el.textContent = `${value}ms`; });
      $$(`[data-leg-ping="${id}"]`).forEach(el => { el.textContent = `≈ ${value}ms`; });
      $$(`[data-location-status="${id}"]`).forEach(el => {
        el.textContent = `≈ ${value}ms`;
        el.classList.remove('online', 'offline', 'unknown');
        el.classList.add('demo');
      });
      const bar = $(`[data-node="${id}"]`);
      if (bar) {
        const width = 20 + ((94 - value) / (94 - 42)) * 74;
        bar.style.width = `${Math.round(width)}%`;
      }
    }
  };

  const startDemoPing = () => {
    stopDemoPing();
    if (badge) badge.className = 'ping-status ping-status-demo';
    if (badgeLabel) badgeLabel.textContent = 'ДЕМО-ПИНГ · API НЕ ПОДКЛЮЧЁН';
    if (note) note.textContent = 'Значения меняются в диапазоне 42–94 мс для демонстрации интерфейса. Это не реальные замеры и не подтверждение доступности серверов.';
    if (appDemoBadge) appDemoBadge.hidden = false;
    if (locationPingNote) locationPingNote.hidden = false;
    paintDemoPing();
    demoInterval = setInterval(() => {
      if (document.hidden) return;
      for (const id of allowed) {
        let delta = Math.floor(Math.random() * 9) - 4;
        if (delta === 0) delta = Math.random() > .5 ? 1 : -1;
        demoValues[id] = Math.max(42, Math.min(94, demoValues[id] + delta));
      }
      paintDemoPing();
    }, 2600);
  };

  async function refresh(){
    if (requestInFlight || document.hidden || monitoringDisabled) return;
    requestInFlight = true;
    try {
      const response = await fetch('/api/status', { cache: 'no-store', headers: { Accept: 'application/json' } });
      const data = await response.json();
      if (data.state === 'unconfigured') {
        monitoringDisabled = true;
        if (pollingInterval) clearInterval(pollingInterval);
        startDemoPing();
        return;
      }
      if (!response.ok || data.state !== 'configured' || !Array.isArray(data.nodes)) {
        stopDemoPing();
        renderUnknown('МОНИТОРИНГ НЕДОСТУПЕН', 'Не удалось получить актуальные данные. Демонстрационный пинг отключён, чтобы не путать его с реальными показателями.');
        return;
      }

      stopDemoPing();
      if (appDemoBadge) appDemoBadge.hidden = true;
      if (locationPingNote) locationPingNote.hidden = true;
      const nodes = new Map(data.nodes.filter(n => n && allowed.includes(n.id)).map(n => [n.id, n]));
      let anyOnline = false;
      let anyOffline = false;
      for (const id of allowed) {
        const node = nodes.get(id);
        const status = node?.status === 'online' || node?.status === 'offline' ? node.status : 'unknown';
        const latency = Number.isFinite(node?.latencyMs) && node.latencyMs > 0 ? Math.round(node.latencyMs) : null;
        if (status === 'online') anyOnline = true;
        if (status === 'offline') anyOffline = true;
        $$(`[data-ping="${id}"]`).forEach(el => { el.textContent = latency ? `${latency}ms` : '—'; });
        $$(`[data-leg-ping="${id}"]`).forEach(el => { el.textContent = latency ? `${latency}ms` : (status === 'online' ? 'ONLINE' : status === 'offline' ? 'OFFLINE' : '—'); });
        $$(`[data-location-status="${id}"]`).forEach(el => {
          el.textContent = status === 'online' ? 'ONLINE' : status === 'offline' ? 'OFFLINE' : '—';
          el.classList.remove('online', 'offline', 'unknown', 'demo');
          el.classList.add(status);
        });
        const bar = $(`[data-node="${id}"]`);
        if (bar) bar.style.width = latency ? `${Math.max(7, Math.min(100, 100 - latency / 3))}%` : '0%';
      }
      const summary = anyOffline ? 'ping-status-offline' : anyOnline ? 'ping-status-online' : 'ping-status-neutral';
      if (badge) badge.className = `ping-status ${summary}`;
      if (badgeLabel) badgeLabel.textContent = anyOffline ? 'ЕСТЬ НЕДОСТУПНЫЕ УЗЛЫ' : anyOnline ? 'МОНИТОРИНГ АКТИВЕН' : 'НЕТ ДАННЫХ';
      if (note) note.textContent = data.updatedAt ? `Данные мониторинга обновлены: ${new Date(data.updatedAt).toLocaleTimeString('ru-RU', {hour:'2-digit', minute:'2-digit'})}.` : 'Статус и задержка получены из API мониторинга.';
    } catch {
      stopDemoPing();
      renderUnknown('НЕТ СВЯЗИ С API', 'Не удалось получить данные мониторинга. Демонстрационные значения отключены, чтобы не выдавать их за реальные.');
    } finally {
      requestInFlight = false;
    }
  }

  renderUnknown('ПРОВЕРКА МОНИТОРИНГА', 'Проверяем, подключён ли реальный мониторинг…');
  refresh();
  pollingInterval = setInterval(() => { if (!document.hidden) refresh(); }, 30000);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      if (monitoringDisabled) paintDemoPing();
      else refresh();
    }
  });
  window.addEventListener('beforeunload', () => {
    if (pollingInterval) clearInterval(pollingInterval);
    stopDemoPing();
  }, { once: true });
}
/* ---- terminal ---- */
function initTerminal(){
  const body = $('#terminalBody'); if (!body) return;
  const lines = [
    {t:'why-us', type:'cmd'},
    {t:'Локации: США · Финляндия · Нидерланды · Турция', type:'out'},
    {t:'Дополнительные режимы подключения: доступны в TITAN', type:'out'},
    {t:'Управление подпиской: личный кабинет MISTNET', type:'out'},
    {t:'Лимиты трафика: START — 50 ГБ / TITAN — 100 ГБ', type:'out'},
    {t:'Протоколы: WireGuard / VLESS / XHTTP / Hysteria', type:'ok'}
  ];
  const CMD = lines[0].t;
  let started = false, timer = null;
  function render(){
    body.innerHTML = '';
    const pl = document.createElement('div');
    pl.className = 'term-line';
    pl.innerHTML = '<span class="term-prompt">MistNet VPN &gt;</span><span class="term-cmd" id="tcmd"></span><span class="cursor-blink">_</span>';
    body.appendChild(pl);
    let i = 0;
    timer = setInterval(() => {
      const s = $('#tcmd'); if (!s) return;
      s.textContent += CMD[i++];
      if (i >= CMD.length) { clearInterval(timer); timer = null; setTimeout(out, 400); }
    }, 90);
    function out(){
      let n = 1;
      (function step(){
        if (n >= lines.length) return;
        const l = lines[n++];
        const d = document.createElement('div');
        d.className = 'term-output' + (l.type === 'ok' ? ' glow' : '');
        d.textContent = '> ' + l.t;
        body.appendChild(d);
        setTimeout(step, 380);
      })();
    }
  }
  const tio = new IntersectionObserver(es => {
    if (es[0].isIntersecting && !started) { started = true; tio.disconnect(); setTimeout(render, 400); }
  }, {threshold:.2});
  const tt = $('#terminal'); if (tt) tio.observe(tt);
}

/* ============ THREE.JS SCENES ============ */
function initThree(){
  if (reduced) return;
  if (typeof THREE === 'undefined') {
    const canvas = $('#heroCanvas'); const globe = $('#globeCanvas');
    if (canvas) canvas.hidden = true;
    if (globe) globe.hidden = true;
    return;
  }
  const mountWhenVisible = (selector, mount) => {
    const element = $(selector);
    if (!element || !('IntersectionObserver' in window)) { if (element) mount(); return; }
    let initialized = false;
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting) || initialized) return;
      initialized = true;
      observer.disconnect();
      try { mount(); }
      catch (error) {
        console.warn('[MISTNET] Не удалось запустить сцену:', selector, error);
        if (element) element.hidden = true;
      }
    }, { rootMargin: '180px 0px', threshold: 0.01 });
    observer.observe(element);
  };
  mountWhenVisible('#heroCanvas', initHeroScene);
  mountWhenVisible('#globeCanvas', initGlobeScene);
}

/* [ВАУ-ЭФФЕКТ] Интерактивный Цифровой Туман (Neural Mist) */
function initHeroScene(){
  const canvas = $('#heroCanvas'); if (!canvas) return;
  const wrap = canvas.parentElement;
  let w = wrap.clientWidth, h = wrap.clientHeight;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, w/h, 0.1, 100);
  camera.position.z = 6;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !isMobile, alpha: true });
  renderer.setPixelRatio(pixelRatio(w, h));
  renderer.setSize(w, h, false);
  
  const COUNT = particleBudget(w, h);
  const positions = new Float32Array(COUNT * 3);
  const velocities = new Float32Array(COUNT * 3);
  for (let i = 0; i < COUNT; i++){
    positions[i*3]   = (Math.random()-.5) * 14;
    positions[i*3+1] = (Math.random()-.5) * 10;
    positions[i*3+2] = (Math.random()-.5) * 8;
    velocities[i*3]   = (Math.random()-.5) * .0018;
    velocities[i*3+1] = (Math.random()-.5) * .0018;
    velocities[i*3+2] = (Math.random()-.5) * .0018;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const seeds = new Float32Array(COUNT); for (let i = 0; i < COUNT; i++) seeds[i] = Math.random();
  pGeo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));

  /* custom shader: every particle breathes with light, cyan -> violet */
  const pMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime:{value:0}, uSize:{value: isMobile ? 1.7 : 2.0}, uPR:{value: renderer.getPixelRatio()},
      c1:{value:new THREE.Color(0x00d2ff)}, c2:{value:new THREE.Color(0x7c3aed)} },
    vertexShader: 'uniform float uTime,uSize,uPR;attribute float aSeed;varying float vP;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);vP=.5+.5*sin(uTime*1.6+aSeed*6.2832);gl_PointSize=uSize*uPR*(1.+vP*.45)*(6./-mv.z);gl_Position=projectionMatrix*mv;}',
    fragmentShader: 'precision mediump float;uniform vec3 c1,c2;varying float vP;void main(){float r=length(gl_PointCoord-.5);if(r>.5)discard;float g=smoothstep(.5,0.,r);gl_FragColor=vec4(mix(c1,c2,vP),g*g*(.16+.34*vP));}'
  });
  const points = new THREE.Points(pGeo, pMat);
  scene.add(points);

  const lineGeo = new THREE.BufferGeometry();
  const linePos = new Float32Array(COUNT * 6); 
  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3));
  lineGeo.setDrawRange(0,0);
  const lineMat = new THREE.LineBasicMaterial({color:0x39c9e6,transparent:true,opacity:.055,blending:THREE.AdditiveBlending});
  const linesMesh = new THREE.LineSegments(lineGeo,lineMat);
  scene.add(linesMesh);

  const mouse = new THREE.Vector2(999,999);
  const raycaster = new THREE.Raycaster();
  const plane = new THREE.Plane(new THREE.Vector3(0,0,1),0);
  const mouseWorld = new THREE.Vector3();
  
  canvas.addEventListener('mousemove', e => {
    mouse.x = (e.clientX / innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / innerHeight) * 2 + 1;
  }, {passive:true});
  
  canvas.addEventListener('touchmove', e => {
    const t = e.touches[0]; if (!t) return;
    mouse.x = (t.clientX / innerWidth) * 2 - 1;
    mouse.y = -(t.clientY / innerHeight) * 2 + 1;
  }, {passive:true});

  canvas.addEventListener('click', () => {
    for(let i=0; i<COUNT; i++){
      velocities[i*3] += (Math.random()-.5)*.022;
      velocities[i*3+1] += (Math.random()-.5)*.022;
    }
  });

  /* render loop runs ONLY while the canvas is on screen (battery friendly) */
  let visible = false, inViewport = false, raf = 0, lastFrame = 0;
  const visIO = new IntersectionObserver(es => { inViewport = es[0].isIntersecting; visible = inViewport && !document.hidden; if (visible && !raf) raf = requestAnimationFrame(loop); }, {threshold:.01, rootMargin:'120px'});
  document.addEventListener('visibilitychange', () => { visible = inViewport && !document.hidden; if (visible && !raf) raf = requestAnimationFrame(loop); });
  visIO.observe(canvas);

  function loop(now){
    if (!visible || document.hidden) { raf = 0; return; }
    raf = requestAnimationFrame(loop);
    if (now - lastFrame < (isMobile ? 1000 / 30 : 1000 / 45)) return;
    lastFrame = now;

    const pos = pGeo.attributes.position.array;
    let lineIdx = 0;
    const lp = lineGeo.attributes.position.array;
    
    raycaster.setFromCamera(mouse, camera);
    raycaster.ray.intersectPlane(plane, mouseWorld);

    for (let i = 0; i < COUNT; i++){
      pos[i*3]   += velocities[i*3];
      pos[i*3+1] += velocities[i*3+1];
      pos[i*3+2] += velocities[i*3+2];
      
      if (Math.abs(pos[i*3]) > 7) velocities[i*3] *= -1;
      if (Math.abs(pos[i*3+1]) > 5) velocities[i*3+1] *= -1;
      if (Math.abs(pos[i*3+2]) > 4) velocities[i*3+2] *= -1;
      
      const dx = pos[i*3] - mouseWorld.x;
      const dy = pos[i*3+1] - mouseWorld.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      
      if(dist > .001 && dist < 2.1){
        const force = (2.1 - dist) * .0009;
        velocities[i*3] += (dx/dist) * force;
        velocities[i*3+1] += (dy/dist) * force;
        
        for(let j=i+1; j<COUNT && lineIdx < COUNT*6-6; j++){
          const dx2 = pos[j*3] - pos[i*3];
          const dy2 = pos[j*3+1] - pos[i*3+1];
          const d2 = dx2*dx2 + dy2*dy2;
          if(d2 < 1.05){
            lp[lineIdx++] = pos[i*3]; lp[lineIdx++] = pos[i*3+1]; lp[lineIdx++] = pos[i*3+2];
            lp[lineIdx++] = pos[j*3]; lp[lineIdx++] = pos[j*3+1]; lp[lineIdx++] = pos[j*3+2];
          }
        }
      }
      
      velocities[i*3] *= 0.99;
      velocities[i*3+1] *= 0.99;
      velocities[i*3+2] *= 0.99;
    }
    
    pGeo.attributes.position.needsUpdate = true;
    lineGeo.setDrawRange(0, lineIdx/3);
    lineGeo.attributes.position.needsUpdate = true;

    const sp = window.__scrollP || 0; /* hero scroll progress from GSAP: mist drifts back and tilts */
    camera.position.z = 6.4 + sp * 1.7;
    points.rotation.x = linesMesh.rotation.x = sp * .4;
    pMat.uniforms.uTime.value = performance.now() * .001;
    points.rotation.y += .00025;
    linesMesh.rotation.y += .00025;

    renderer.render(scene, camera);
  }
  loop();

  addEventListener('resize', () => {
    w = wrap.clientWidth; h = wrap.clientHeight;
    camera.aspect = w/h; camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }, {passive:true});
}

/* ---- GLOBE SCENE ---- */
function initGlobeScene(){
  const canvas = $('#globeCanvas'); if (!canvas) return;
  const wrap = canvas.parentElement;
  let w = wrap.clientWidth, h = wrap.clientHeight;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, w/h, .1, 100);
  camera.position.z = 4.2;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !isMobile, alpha: true, powerPreference: isMobile ? 'default' : 'high-performance' });
  renderer.setPixelRatio(pixelRatio(w, h));
  renderer.setSize(w, h, false);

  const globeGroup = new THREE.Group();
  scene.add(globeGroup);

  const sphereGeo = new THREE.SphereGeometry(1.4, 36, 28);
  const sphereMat = new THREE.ShaderMaterial({
    wireframe: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime:{value:0}, uColor:{value:new THREE.Color(0x00d2ff)} },
    vertexShader: 'varying float vY;void main(){vY=position.y;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader: 'precision mediump float;uniform float uTime;uniform vec3 uColor;varying float vY;void main(){float band=smoothstep(.55,1.,sin(vY*2.4-uTime*1.4)*.5+.5);gl_FragColor=vec4(uColor,.08+band*.4);}'
  });
  const sphere = new THREE.Mesh(sphereGeo, sphereMat);
  globeGroup.add(sphere);

  const innerGeo = new THREE.SphereGeometry(1.37, 32, 24);
  const innerMat = new THREE.MeshBasicMaterial({ color: 0x00a0ff, transparent: true, opacity: .04 });
  const inner = new THREE.Mesh(innerGeo, innerMat);
  globeGroup.add(inner);

  const servers = [
    { lat: 40.7, lon: -74.0, key: 'us' },
    { lat: 60.2, lon: 24.9,  key: 'fi' },
    { lat: 52.4, lon: 4.9,   key: 'nl' },
    { lat: 41.01384, lon: 28.94966, key: 'tr' }
  ];

  function latLonToVec3(lat, lon, r){
    const phi = (90 - lat) * Math.PI / 180;
    const theta = (lon + 180) * Math.PI / 180;
    return new THREE.Vector3(
      -r * Math.sin(phi) * Math.cos(theta),
       r * Math.cos(phi),
       r * Math.sin(phi) * Math.sin(theta)
    );
  }

  const nodePositions = [];
  servers.forEach(s => {
    const p = latLonToVec3(s.lat, s.lon, 1.42);
    nodePositions.push(p);

    const dotGeo = new THREE.SphereGeometry(.03, 12, 12);
    const dotMat = new THREE.MeshBasicMaterial({ color: 0x00d2ff });
    const dot = new THREE.Mesh(dotGeo, dotMat);
    dot.position.copy(p);
    globeGroup.add(dot);

    const glowGeo = new THREE.SphereGeometry(.06, 12, 12);
    const glowMat = new THREE.MeshBasicMaterial({ color: 0x00d2ff, transparent: true, opacity: .19 });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.position.copy(p);
    globeGroup.add(glow);
  });

  for (let i = 0; i < nodePositions.length; i++){
    for (let j = i+1; j < nodePositions.length; j++){
      const a = nodePositions[i], b = nodePositions[j];
      const mid = a.clone().add(b).multiplyScalar(.5);
      const dist = a.distanceTo(b);
      mid.normalize().multiplyScalar(1.42 + dist * .35);
      const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
      const pts = curve.getPoints(50);
      const arcGeo = new THREE.BufferGeometry().setFromPoints(pts);
      const arcMat = new THREE.LineBasicMaterial({ color: 0x33ddff, transparent: true, opacity: .25 });
      const arc = new THREE.Line(arcGeo, arcMat);
      globeGroup.add(arc);
    }
  }

  let dragging = false, lastX = 0, lastY = 0;
  let rotX = 0, rotY = 0, tRotX = 0, tRotY = 0;

  canvas.addEventListener('pointerdown', e => {
    dragging = true; lastX = e.clientX; lastY = e.clientY;
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', e => {
    if (!dragging) return;
    const dx = e.clientX - lastX, dy = e.clientY - lastY;
    tRotY += dx * .008;
    tRotX += dy * .008;
    tRotX = Math.max(-1.2, Math.min(1.2, tRotX));
    lastX = e.clientX; lastY = e.clientY;
  });
  canvas.addEventListener('pointerup', () => { dragging = false; });
  canvas.addEventListener('pointercancel', () => { dragging = false; });

  /* render loop runs ONLY while the canvas is on screen (battery friendly) */
  let visible = false, inViewport = false, raf = 0, lastFrame = 0;
  const visIO = new IntersectionObserver(es => { inViewport = es[0].isIntersecting; visible = inViewport && !document.hidden; if (visible && !raf) raf = requestAnimationFrame(loop); }, {threshold:.01, rootMargin:'120px'});
  document.addEventListener('visibilitychange', () => { visible = inViewport && !document.hidden; if (visible && !raf) raf = requestAnimationFrame(loop); });
  visIO.observe(canvas);

  let hint = $('#globeHint');
  let hintHidden = false;

  function loop(now){
    if (!visible || document.hidden) { raf = 0; return; }
    raf = requestAnimationFrame(loop);
    if (now - lastFrame < (isMobile ? 1000 / 30 : 1000 / 45)) return;
    lastFrame = now;

    if (!dragging){ tRotY += .00135; }
    rotX += (tRotX - rotX) * .08;
    rotY += (tRotY - rotY) * .08;
    globeGroup.rotation.x = rotX;
    globeGroup.rotation.y = rotY;

    globeGroup.children.forEach(c => {
      if (c.geometry && c.geometry.parameters && c.geometry.parameters.radius === .06){
        const s = 1 + Math.sin(Date.now()*0.003 + c.position.x*2) * .3;
        c.scale.setScalar(s);
      }
    });

    sphereMat.uniforms.uTime.value = performance.now() * .001;
    renderer.render(scene, camera);

    if (dragging && hint && !hintHidden) { hint.style.opacity = '0'; hintHidden = true; }
  }
  loop();

  addEventListener('resize', () => {
    w = wrap.clientWidth; h = wrap.clientHeight;
    camera.aspect = w/h; camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }, {passive:true});
}

/* ---- mascot: speech bubble + sparks on click ---- */
function initMascotFun(){
  const wrap = $('.mascot-wrap'), bot = $('.mascot-bot'), say = $('#botSay'); if (!wrap || !bot || !say) return;
  const talk = ['Привет! Я MIST — маскот MISTNET', 'Тест на 3 дня можно активировать в кабинете', 'Для входа Telegram не обязателен', 'Помогу разобраться с сайтом!'];
  const poke = ['Ой, щекотно!', 'Загляни в раздел тарифов!', 'Начать можно через личный кабинет', 'Ещё разок?'];
  let n = 0, p = 0, timer;
  const show = txt => { say.classList.remove('on'); setTimeout(() => { say.textContent = txt; say.classList.add('on'); }, 200); };
  say.textContent = talk[0];
  if (reduced) { say.classList.add('on'); return; }
  setTimeout(() => say.classList.add('on'), 1800);
  const loop = () => { n = (n + 1) % talk.length; show(talk[n]); timer = setTimeout(loop, 4800); };
  timer = setTimeout(loop, 6600);
  bot.addEventListener('click', e => {
    const r = wrap.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    for (let i = 0; i < 14; i++) {
      const sp = document.createElement('span'), a = (i / 14) * 6.283 + Math.random() * .4, d = 50 + Math.random() * 60;
      sp.className = 'spark'; sp.style.left = x + 'px'; sp.style.top = y + 'px';
      sp.style.setProperty('--dx', Math.cos(a) * d + 'px'); sp.style.setProperty('--dy', Math.sin(a) * d + 'px');
      wrap.appendChild(sp); setTimeout(() => sp.remove(), 850);
    }
    if (navigator.vibrate) navigator.vibrate(10);
    clearTimeout(timer); show(poke[p++ % poke.length]); timer = setTimeout(loop, 6000);
  });
}

/* Server-list values are now updated exclusively by initServerStatus() from /api/status. */

/* ============ BOOT: every feature starts here, in order ============ */
function boot(){
  initCopyButtons();
  initCustomCursor();
  initRevealFallback();
  splitTitle();
  initScrollUI();
  initMascotTilt();
  priceTilt();
  initMagneticButtons();
  initRippleButtons();
  initFaq();
  initCounters();
  initServerStatus();
  initTerminal();

  initMascotFun();

}
boot();

/* ---- load WebGL only when the browser is idle; static content works without it ---- */
if (!reducedMotion && !saveData && !lowPower) {
  const startVisualLayer = () => {
    loadOptional('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js', () => !!window.THREE, 2200)
      .then(() => {
        if (typeof THREE !== 'undefined') initThree();
        else {
          const heroCanvas = $('#heroCanvas');
          const globeCanvas = $('#globeCanvas');
          if (heroCanvas) heroCanvas.hidden = true;
          if (globeCanvas) globeCanvas.hidden = true;
        }
      });
  };
  if ('requestIdleCallback' in window) requestIdleCallback(startVisualLayer, { timeout: 1800 });
  else setTimeout(startVisualLayer, 700);
}

})();

/* ===== UPGRADE ===== */
(() => {
  const $ = s => document.querySelector(s);
  // spotlight
  document.addEventListener('pointermove', e => {
    const c = e.target.closest && e.target.closest('.price-card,.step-card'); if (!c) return;
    const r = c.getBoundingClientRect();
    c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }, {passive:true});
  // command palette
  const pal = $('#pal'), inp = $('#palIn'), list = $('#palList'), closeBtn = $('#palClose');
  let previousFocus = null;
  const items = [['Преимущества','#advantages','4 локации · понятные тарифы'],['Тарифы','#pricing','START и TITAN'],['Локации','#map','глобус'],['Как подключиться','#howTo','без обязательного Telegram'],['FAQ','#faq','вопросы'],
    ['Личный кабинет и бесплатный тест','https://lk.mistnet.ru','Email · Google · Яндекс · VK'],['Купить подписку','https://lk.mistnet.ru/buy/mistnet','START / TITAN · 1 / 2 / 3 месяца'],['Telegram-бот','https://t.me/mistnetvpn_bot','альтернативный способ'],['Поддержка','https://t.me/mistnet_support','Telegram']];
  let sel = 0, shown = items;
  const draw = () => { list.innerHTML = ''; shown.forEach((it, i) => { const li = document.createElement('li'), a = document.createElement('a');
    a.href = it[1]; if (it[1][0] !== '#') { a.target = '_blank'; a.rel = 'noopener'; }
    a.className = i === sel ? 'sel' : ''; a.innerHTML = '<span></span><small></small>'; a.firstChild.textContent = it[0]; a.lastChild.textContent = it[2];
    a.addEventListener('click', close); li.appendChild(a); list.appendChild(li); }); };
  const open = () => {
    previousFocus = document.activeElement;
    pal.classList.add('open'); pal.setAttribute('aria-hidden', 'false');
    inp.value = ''; shown = items; sel = 0; draw(); inp.focus();
  };
  const close = () => {
    if (!pal) return;
    pal.classList.remove('open'); pal.setAttribute('aria-hidden', 'true');
    if (previousFocus && typeof previousFocus.focus === 'function') previousFocus.focus();
  };
  if (closeBtn) closeBtn.addEventListener('click', close);
  addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (pal.classList.contains('open')) close(); else open();
      return;
    }
    if (!pal.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'Tab') {
      const focusable = [inp, closeBtn, ...list.querySelectorAll('a')].filter(Boolean);
      if (!focusable.length) return;
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    else if (e.key === 'ArrowDown' && shown.length) { e.preventDefault(); sel = (sel + 1) % shown.length; draw(); }
    else if (e.key === 'ArrowUp' && shown.length) { e.preventDefault(); sel = (sel - 1 + shown.length) % shown.length; draw(); }
    else if (e.key === 'Enter' && shown[sel]) { const a = list.querySelector('a.sel'); if (a) a.click(); }
  });
  if (inp) {
    inp.addEventListener('input', () => {
      const q = inp.value.toLowerCase();
      shown = items.filter(i => (i[0] + i[2]).toLowerCase().includes(q));
      sel = 0;
      draw();
    });
  }
  if (pal) pal.addEventListener('click', e => { if (e.target === pal) close(); });
  const po = $('#palOpen');
  if (po) po.addEventListener('click', open);
})();


/* ===== MISTNET motion layer: optional GSAP + ScrollTrigger, mobile menu and button feedback ===== */
(() => {
  'use strict';
  const $ = (q, r = document) => r.querySelector(q);
  const $$ = (q, r = document) => [...r.querySelectorAll(q)];
  const reduced = matchMedia('(prefers-reduced-motion:reduce)').matches;

  initMobileMenu();
  initButtonFeedback();
  initConversionTracking();
  if (reduced || saveData || lowPower) return;   /* graceful fallback: CSS + IntersectionObserver */

  optionalMotionReady.then(() => {
    if (!window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    document.documentElement.classList.add('gsap-on');
    if (window.__revealIO) window.__revealIO.disconnect();

    initSmoothScroll();
    initHeroIntro();
    initShieldScroll();
    initScrollReveals();
    initPricingStagger();
    setTimeout(() => ScrollTrigger.refresh(), 0);
    if (document.fonts) document.fonts.ready.then(() => ScrollTrigger.refresh());
  }).catch(error => console.warn('[MISTNET] GSAP-анимации отключены, работает базовый интерфейс:', error));

  /* Native scroll + optional ScrollTrigger; no Lenis dependency. */
  function initSmoothScroll() {
    if (typeof Lenis === 'undefined') return;
    const lenis = new Lenis({ duration: 1.15, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    window.__lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    document.addEventListener('click', e => {
      const a = e.target.closest && e.target.closest('a[href^="#"]'); if (!a) return;
      const id = a.getAttribute('href');
      if (id === '#') { e.preventDefault(); lenis.scrollTo(0); return; }
      const target = $(id); if (!target) return;
      e.preventDefault(); lenis.scrollTo(target, { offset: -72, duration: 1.4 }); history.replaceState(null, '', id);
    });
  }

  /* staggered hero entrance, starts when the preloader is gone */
  function initHeroIntro() {
    const hero = $('.hero'); if (!hero) return;
    const items = ['.logo-large', '.hero-text > p', '.btn-group', '.ping-widget', '.stats', '.app-list'].map(q => $(q, hero)).filter(Boolean);
    const shield = $('.mascot-wrap', hero);
    gsap.set(items, { autoAlpha: 0, y: 32 });
    if (shield) gsap.set(shield, { autoAlpha: 0, scale: .82, rotation: -6 });
    const pre = $('#preloader');
    const ready = new Promise(res => {
      if (!pre || pre.classList.contains('done')) return res();
      const mo = new MutationObserver(() => { if (pre.classList.contains('done')) { mo.disconnect(); res(); } });
      mo.observe(pre, { attributes: true, attributeFilter: ['class'] });
      setTimeout(res, 5000);
    });
    ready.then(() => {
      const tl = gsap.timeline({ defaults: { ease: 'expo.out', duration: 1.1 } });
      tl.to(items, { autoAlpha: 1, y: 0, stagger: .11, onComplete: () => items.forEach(el => { el.classList.add('active'); gsap.set(el, { clearProps: 'transform' }); }) });
      if (shield) tl.to(shield, { autoAlpha: 1, scale: 1, rotation: 0, duration: 1.6, ease: 'elastic.out(1,.7)' }, .1);
    });
  }

  /* the shield sinks back into the scene while you scroll to pricing */
  function initShieldScroll() {
    const trigger = { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: .8 };
    gsap.to('.mascot-scroll', { scale: .78, yPercent: 10, rotationY: -16, opacity: .2, ease: 'none', scrollTrigger: trigger });
    gsap.to('.app-scroll', { scale: 1, yPercent: 0, rotationY: 0, transformPerspective: 1100, opacity: 1, ease: 'none', scrollTrigger: trigger });
    gsap.to('#heroCanvas', { opacity: .3, ease: 'none', scrollTrigger: trigger });
    ScrollTrigger.create({ trigger: '.hero', start: 'top top', end: 'bottom top', onUpdate: self => { window.__scrollP = self.progress; } });
  }

  /* batched scroll reveals + FAQ stagger */
  function initScrollReveals() {
    const els = $$('.reveal').filter(el => !el.closest('.hero'));
    gsap.set(els, { autoAlpha: 0, y: 42, filter: 'blur(6px)' });
    ScrollTrigger.batch(els, { start: 'top 90%', once: true, onEnter: batch =>
      gsap.to(batch, { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 1.1, ease: 'expo.out', stagger: .1, overwrite: true,
        onComplete: () => batch.forEach(el => { el.classList.add('active'); gsap.set(el, { clearProps: 'transform,filter,opacity,visibility' }); }) }) });
    const faq = $$('.faq-item');
    gsap.set(faq, { autoAlpha: 0, y: 24 });
    ScrollTrigger.batch(faq, { start: 'top 92%', once: true, onEnter: batch =>
      gsap.to(batch, { autoAlpha: 1, y: 0, duration: .8, ease: 'power3.out', stagger: .09, clearProps: 'transform,opacity,visibility' }) });
  }

  /* feature lists inside pricing cards */
  function initPricingStagger() {
    $$('.price-card').forEach(card => {
      const li = $$('.price-features li', card); if (!li.length) return;
      gsap.set(li, { autoAlpha: 0, x: -16 });
      ScrollTrigger.create({ trigger: card, start: 'top 78%', once: true, onEnter: () =>
        gsap.to(li, { autoAlpha: 1, x: 0, duration: .7, ease: 'power3.out', stagger: .07, delay: .25, clearProps: 'transform' }) });
    });
  }
})();

/* ---- first-party conversion events; connect analytics IDs when supplied ---- */
function initConversionTracking() {
  document.addEventListener('click', event => {
    const link = event.target && event.target.closest ? event.target.closest('[data-track]') : null;
    if (!link) return;
    const detail = {
      event: link.dataset.track || 'cta_click',
      plan: link.dataset.plan || null,
      destination: link.href || null,
    };
    window.dispatchEvent(new CustomEvent('mistnet:conversion', { detail }));
    if (!Array.isArray(window.dataLayer)) window.dataLayer = [];
    window.dataLayer.push({ event: 'mistnet_conversion', ...detail });
  }, { passive: true });
}

/* ---- mobile menu (works with or without Lenis) ---- */
function initMobileMenu() {
  const btn = document.getElementById('burger'), sheet = document.getElementById('mnav'); if (!btn || !sheet) return;
  [...sheet.querySelectorAll('a')].forEach((a, i) => a.style.setProperty('--i', i));
  const set = open => {
    sheet.classList.toggle('open', open); sheet.setAttribute('aria-hidden', String(!open));
    btn.setAttribute('aria-expanded', String(open)); btn.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    document.documentElement.classList.toggle('menu-open', open);
    if (window.__lenis) {
      if (open) window.__lenis.stop(); else window.__lenis.start();
    }
  };
  btn.addEventListener('click', () => set(!sheet.classList.contains('open')));
  sheet.addEventListener('click', e => { if (e.target.closest('a')) set(false); });
  addEventListener('keydown', e => { if (e.key === 'Escape') set(false); });
  matchMedia('(min-width:721px)').addEventListener('change', e => { if (e.matches) set(false); });
}

/* ---- tactile button feedback: light follows pointer, haptic tick on touch ---- */
function initButtonFeedback() {
  const sel = '.btn,.price-btn,.price-btn-trial,.nav-btn';
  document.addEventListener('pointermove', e => {
    const b = e.target.closest && e.target.closest(sel); if (!b) return;
    const r = b.getBoundingClientRect();
    b.style.setProperty('--bx', (e.clientX - r.left) + 'px'); b.style.setProperty('--by', (e.clientY - r.top) + 'px');
  }, { passive: true });
  document.addEventListener('pointerdown', e => {
    if (navigator.vibrate && e.target.closest && e.target.closest(sel)) navigator.vibrate(8);
  }, { passive: true });
}

  } catch (error) {
    console.error('[MISTNET] runtime initialization failed', error);
  }
})();
