/**
 * MGM HUB MOBILE APP - app.js
 * Lógica principal de la WebApp Móvil PWA
 * Módulos: Navegación · MGM Puntos · Agenda & Cursos · Promociones · Asesoría & Magie IA · Multi-Audio Player Streaming
 */
(function () {
  'use strict';

  // ══════════════════════════════════════════════════════════════════════════════
  // 🎉 MGM CONFETTI — Módulo de celebraciones con canvas-confetti
  // ══════════════════════════════════════════════════════════════════════════════
  const mgmConfetti = {
    // Colores MGM: azul marino, dorado, blanco, celeste
    _colors: ['#00214a', '#f59e0b', '#ffffff', '#0ea5e9', '#fbbf24', '#60a5fa'],
    _goldColors: ['#f59e0b', '#fbbf24', '#fef3c7', '#ffffff', '#d97706'],
    _blueColors: ['#0ea5e9', '#38bdf8', '#bae6fd', '#ffffff', '#0284c7'],
    _birthdayColors: ['#f59e0b', '#ef4444', '#8b5cf6', '#0ea5e9', '#10b981', '#f472b6', '#ffffff'],

    /** 🎊 Confeti bilateral grande — Registro nuevo exitoso */
    celebrate() {
      if (typeof confetti === 'undefined') return;
      const opts = { particleCount: 80, spread: 70, startVelocity: 45, ticks: 300, colors: this._colors, zIndex: 99999 };
      confetti({ ...opts, origin: { x: 0.1, y: 0.6 }, angle: 60 });
      confetti({ ...opts, origin: { x: 0.9, y: 0.6 }, angle: 120 });
      setTimeout(() => {
        confetti({ ...opts, particleCount: 50, origin: { x: 0.5, y: 0.5 }, angle: 90, startVelocity: 35 });
      }, 400);
    },

    /** 🌟 Confeti dorado MGM — Login / bienvenida exitosa */
    gold() {
      if (typeof confetti === 'undefined') return;
      confetti({
        particleCount: 100, spread: 80, startVelocity: 40, ticks: 250,
        colors: this._goldColors, zIndex: 99999,
        origin: { x: 0.5, y: 0.55 },
        shapes: ['star', 'circle']
      });
    },

    /** 🎆 Fuegos artificiales de cumpleaños — disparados desde los costados */
    birthday() {
      if (typeof confetti === 'undefined') return;
      const duration = 2500;
      const end = Date.now() + duration;
      const colors = this._birthdayColors;
      const frame = () => {
        confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0, y: 0.65 }, colors, zIndex: 99999 });
        confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1, y: 0.65 }, colors, zIndex: 99999 });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
    },

    /** ❤️ Mini-burst para likes en promos */
    burst(x, y) {
      if (typeof confetti === 'undefined') return;
      const nx = typeof x === 'number' ? Math.min(Math.max(x / window.innerWidth, 0.05), 0.95) : 0.5;
      const ny = typeof y === 'number' ? Math.min(Math.max(y / window.innerHeight, 0.05), 0.95) : 0.5;
      confetti({
        particleCount: 30, spread: 55, startVelocity: 25, ticks: 120,
        colors: ['#ef4444', '#f87171', '#fecaca', '#f59e0b', '#ffffff'],
        origin: { x: nx, y: ny }, zIndex: 99999, gravity: 1.2, scalar: 0.8
      });
    },

    /** 🔔 Confeti azul — Notificaciones activadas */
    bell() {
      if (typeof confetti === 'undefined') return;
      confetti({
        particleCount: 60, spread: 90, startVelocity: 30, ticks: 180,
        colors: this._blueColors, zIndex: 99999,
        origin: { x: 0.5, y: 0.4 }, scalar: 0.9
      });
    }
  };


  // ══════════════════════════════════════════════════════════════════════════════
  // CONFIGURACIÓN GLOBAL — ENDPOINTS OFICIALES DE GOOGLE APPS SCRIPT
  // ══════════════════════════════════════════════════════════════════════════════
  const CFG = {
    // 1. MGM PUNTOS BACKEND (Clientes, Puntos, Términos, Promociones)
    PUNTOS_GAS_URL: 'https://script.google.com/macros/s/AKfycbwV90SCVdMrMgE1Vlev3rdpcqMJlVwCV5du_MGJ-BtV5Di8LMY9UroYD7dXhWBXyI2yGw/exec',

    // 2. CALENDARIO & AGENDA (Eventos, Webinars, Capacitaciones)
    AGENDA_GAS_URL: 'https://script.google.com/macros/s/AKfycbyxahYk-Hgmtn0E_npeCGdS99fIKLQhVmQLeEQbXz3N59KuSWmHoYnq5p2xypPUGIK2yA/exec',

    // 3. PROMOCIONES DEL MES (Slider & Rotator)
    PROMOS_GAS_URL: 'https://script.google.com/macros/s/AKfycbxP0mmc5rSsn6-b29iHM3HpgMKqAQL0auCRHGIoM7DfUxrkFvvMyzI4LTBueCHs6iDzyw/exec',

    // 4. AUDIO PLAYER (Playlist Streaming Multi-Pista)
    AUDIO_GAS_URL: 'https://script.google.com/macros/s/AKfycbwlzKNgocSThMfZJ5qPi1cJNrBreEeAVbvN-anObK3jW1vFnPIRadt77tMp4qTdBiAg/exec',

    // 5. SPLASHSCREEN (Campañas IMOU / Promos)
    SPLASH_GAS_URL: 'https://script.google.com/macros/s/AKfycbw3Aey_uya9yLM8xKrcQCBrlMcTSkAdnUBCQEq_kitdBN4-BZHnxbJP66lO5qgZgO8KAQ/exec',

    // 6. NOTIFICACIONES & TRACKING (El usuario creará este nuevo GAS)
    NOTIFS_GAS_URL: 'https://script.google.com/macros/s/AKfycby8EOl7-hZ1Q8rvPCjFB2ItFrRKqwVmDoPJrhX3sM_3-O8xeoWmuZ0RxbEgNUjLN_6dfA/exec',

    VAL_PUNTO: 0.01,
    BOTPRESS_BOT_ID: 'e5a3c8a6-9aec-41a3-870d-d1985dc8c7df',
    SPLASH_ENABLED: true,

    // Playlist por defecto si la red o el GAS fallan
    DEFAULT_AUDIO_TRACKS: [
      {
        title: 'Remate Dahua MGM',
        artist: 'MGM Marketing Production',
        src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        cover: 'https://mgmpty.odoo.com/web/image/68369-dbd5e226/Logo%20MGM.png'
      },
      {
        title: 'Lanzamientos Hikvision 2026',
        artist: 'MGM Audio Spot',
        src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        cover: 'https://mgmpty.odoo.com/web/image/68369-dbd5e226/Logo%20MGM.png'
      },
      {
        title: 'Soluciones IMOU Panamá',
        artist: 'MGM Radio',
        src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
        cover: 'https://mgmpty.odoo.com/web/image/68369-dbd5e226/Logo%20MGM.png'
      }
    ],
    AUDIO_TRACKS: []
  };

  // ══════════════════════════════════════════════════════════════════════════════
  // STATE LOCAL
  // ══════════════════════════════════════════════════════════════════════════════
  const K_CLIENTS = 'mgm_local_clients';
  const K_TX      = 'mgm_local_tx';
  const K_SPLASH  = 'mgm_splash_date_v2';
  const K_LIKES   = 'mgm_promo_likes';
  const K_AUTH    = 'mgm_auth_user';
  const K_NOTIFS  = 'mgm_notifications';
  const K_CLEARED_NOTIFS = 'mgm_cleared_notifs';
  const K_NOTIFIED_TX    = 'mgm_notified_tx_v1';

  const state = {
    activeTab:   'home',
    activeSubtab: 'subview-cuenta',
    calYear:     new Date().getFullYear(),
    calMonth:    new Date().getMonth(),
    activeEventFilter: 'all',
    activeEventData:  null,
    activePromoData:  null,
    audioPlaying: false,
    audioTrackIndex: 0,
    agendaEvents: [],
    promos: [],
    notifications: JSON.parse(localStorage.getItem(K_NOTIFS)) || [],
    clearedNotifs: JSON.parse(localStorage.getItem(K_CLEARED_NOTIFS)) || [],
    authUser: JSON.parse(localStorage.getItem(K_AUTH)) || null,
    clients: JSON.parse(localStorage.getItem(K_CLIENTS)) || [
      { cedula:'8-888-1234', nombre:'Juan Carlos Pérez', correo:'juan@email.com', telefono:'6254-0412', cumpleanos:'1990-08-15', fechaRegistro:'2026-01-10', puntos:2800, totalComprasAno:1400.00 },
      { cedula:'4-752-9812', nombre:'María Elena Rodríguez', correo:'maria@email.com', telefono:'6611-9988', cumpleanos:'1988-11-22', fechaRegistro:'2026-02-14', puntos:450, totalComprasAno:450.00 }
    ],
    transactions: JSON.parse(localStorage.getItem(K_TX)) || [
      { fecha:'2026-08-10 16:30', cedula:'8-888-1234', factura:'RED-492104', subtotal:-5.00, multiplicador:'REDENCIÓN (100 pts = $1)', puntos:-500, asesor:'Carlos Ruiz' },
      { fecha:'2026-08-01 11:20', cedula:'8-888-1234', factura:'FAC-2026-0891', subtotal:1400.00, multiplicador:'2X Monto × 2X Día', puntos:5600, asesor:'Carlos Ruiz' },
      { fecha:'2026-07-15 09:40', cedula:'8-888-1234', factura:'FAC-2026-0742', subtotal:200.00, multiplicador:'1X Estándar', puntos:200, asesor:'Ana Gómez' }
    ]
  };

  // ══════════════════════════════════════════════════════════════════════════════
  // DATOS DE FALLBACK (DEMO / MODO OFFLINE)
  // ══════════════════════════════════════════════════════════════════════════════
  const DEMO_PROMOS = [
    {
      id:'P001', nombre:'Sábados con Triple Puntos',
      descripcion:'Cada sábado acumula 3X MGM PUNTOS en todas tus compras.\n¡Aprovecha el fin de semana para maximizar tus beneficios!',
      tipo:'puntos', imagen:'', fecha_inicio:'2026-01-01', fecha_fin:'2026-12-31', activa:'SÍ', likes:24
    },
    {
      id:'P002', nombre:'Descuento de Cumpleaños 🎂',
      descripcion:'Disfruta un 10% de descuento especial el día de tu cumpleaños.\n(Si tu cumpleaños cae en domingo, tu descuento es válido el lunes siguiente).\nSolo presenta tu cédula en caja.',
      tipo:'descuento', imagen:'', fecha_inicio:'2026-01-01', fecha_fin:'2026-12-31', activa:'SÍ', likes:18
    },
    {
      id:'P003', nombre:'Días Especiales MGM — 5X Puntos',
      descripcion:'En fechas especiales declaradas por MGM, acumulas hasta 5X tus puntos con cualquier compra.',
      tipo:'especial', imagen:'', fecha_inicio:'2026-01-01', fecha_fin:'2026-12-31', activa:'SÍ', likes:31
    }
  ];

  const DEMO_TERMS = [
    '1. **Acumulación:** Los puntos se acumulan al registrar cada compra con el asesor MGM autorizado.',
    '2. **Tasa estándar:** 1 MGM PUNTO por cada $1.00 USD de compra (subtotal sin ITBMS).',
    '3. **Multiplicadores:** En días especiales o promociones, el asesor puede aplicar multiplicadores 2X, 3X o 5X.',
    '4. **Redención:** 100 MGM PUNTOS = $1.00 USD de descuento directo en factura.',
    '5. **Comprobante:** Toda redención genera un comprobante con firmas del asesor y del cliente.',
    '6. **Vencimiento:** Los puntos vencen el 31 de diciembre de cada año calendario.',
    '7. **Intransferibilidad:** Los puntos son personales e intransferibles.'
  ];

  const DEMO_EVENTS = [
    {
      id:'EV001', titulo:'Webinar Hikvision ColorVu 2026', categoria:'webinar',
      fecha: buildDateStr(0, 5), hora:'10:00 AM', duracion:'2h',
      descripcion:'Descubre las últimas innovaciones en cámaras ColorVu de Hikvision. Certificación disponible al finalizar.',
      costo:'Gratis', lugar:'Zoom / Online', qr_url:'', registro_url:'https://mgmpty.odoo.com/mgm-puntos',
      instructor:'Carlos Ruiz - Ing. Proyectos'
    },
    {
      id:'EV002', titulo:'Capacitación Dahua Smart Dual Light', categoria:'training',
      fecha: buildDateStr(0, 15), hora:'09:00 AM', duracion:'3h',
      descripcion:'Instalación y configuración avanzada de cámaras Smart Dual Light para proyectos residenciales y corporativos.',
      costo:'$25', lugar:'Sala MGM Panamá', qr_url:'', registro_url:'https://mgmpty.odoo.com/mgm-puntos',
      instructor:'Ana Gómez - Soporte Técnico'
    },
    {
      id:'EV003', titulo:'Certificación IMOU Oficial 2026', categoria:'curso',
      fecha: buildDateStr(1, 8), hora:'08:00 AM', duracion:'4h',
      descripcion:'Programa oficial de certificación técnica IMOU. Incluye material, evaluación y certificado digital.',
      costo:'Gratis para distribuidores', lugar:'Online + MGM', qr_url:'', registro_url:'https://mgmpty.odoo.com/mgm-puntos',
      instructor:'Especialista IMOU Panamá'
    }
  ];

  // ══════════════════════════════════════════════════════════════════════════════
  // UTILITIES
  // ══════════════════════════════════════════════════════════════════════════════

  function buildDateStr(monthOffset, dayOfMonth) {
    const d = new Date();
    d.setMonth(d.getMonth() + monthOffset);
    d.setDate(dayOfMonth);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }

  function fmtCedula(v) {
    if (!v) return '';
    let raw = v.toUpperCase().trim();
    if (raw.includes('-')) {
      let parts = raw.split('-').map(p => p.replace(/[^A-Z0-9]/g, ''));
      return parts.slice(0, 4).filter((p, i) => i === 0 || p.length > 0 || raw.endsWith('-')).join('-');
    }
    let clean = raw.replace(/[^A-Z0-9]/g, '');
    if (!clean) return '';
    const prefRegex = /^(PE|PI|AV|1[0-3]AV|1[0-3]PI|[1-9]AV|[1-9]PI|1[0-3]|[1-9]|E|N)/;
    const match = clean.match(prefRegex);
    let prefix = match ? match[0] : clean.slice(0, 1);
    let rest = clean.slice(prefix.length);
    if (rest.length === 0) return prefix;
    if (rest.length <= 4) return `${prefix}-${rest}`;
    if (rest.length <= 7) {
      let tomoLen = rest.length > 4 ? rest.length - 4 : 3;
      return `${prefix}-${rest.slice(0, tomoLen)}-${rest.slice(tomoLen, 10)}`;
    }
    let tomoLen = rest.length >= 8 ? 4 : 3;
    return `${prefix}-${rest.slice(0, tomoLen)}-${rest.slice(tomoLen, 10)}`;
  }

  function isBdayBenefitActive(d) {
    if (!d) return { active: false, isSundayMoved: false };
    try {
      const now = new Date();
      const bday = new Date(d.toString().split('T')[0] + 'T12:00:00');
      if (isNaN(bday.getTime())) return { active: false, isSundayMoved: false };

      const bMonth = bday.getMonth();
      const bDate  = bday.getDate();

      const curYear  = now.getFullYear();
      const curMonth = now.getMonth();
      const curDate  = now.getDate();
      const curDayOfWeek = now.getDay(); // 0 = Domingo, 1 = Lunes...

      const bdayThisYear = new Date(curYear, bMonth, bDate, 12, 0, 0);
      const bdayDayOfWeek = bdayThisYear.getDay(); // 0 = Domingo

      // Caso 1: Su cumpleaños es HOY y NO es domingo
      if (curMonth === bMonth && curDate === bDate && curDayOfWeek !== 0) {
        return { active: true, isSundayMoved: false };
      }

      // Caso 2: Su cumpleaños cayó en DOMINGO y HOY es LUNES siguiente
      if (bdayDayOfWeek === 0 && curDayOfWeek === 1) {
        const ayer = new Date(now);
        ayer.setDate(curDate - 1);
        if (ayer.getMonth() === bMonth && ayer.getDate() === bDate) {
          return { active: true, isSundayMoved: true };
        }
      }

      return { active: false, isSundayMoved: false };
    } catch {
      return { active: false, isSundayMoved: false };
    }
  }

  function isBdayMonth(d) {
    return isBdayBenefitActive(d).active;
  }

  function isPromoActive(p) {
    if (!['SÍ','SI','sí','si','1','true'].includes((p.activa||'').toString().toUpperCase().trim())) return false;
    const today = new Date(); today.setHours(0,0,0,0);
    if (p.fecha_inicio) { const fi = new Date(p.fecha_inicio + 'T00:00:00'); if (today < fi) return false; }
    if (p.fecha_fin)    { const ff = new Date(p.fecha_fin    + 'T23:59:59'); if (today > ff) return false; }
    return true;
  }

  function showAlert(elId, type, msg) {
    const el = document.getElementById(elId);
    if (!el) return;
    el.textContent = msg;
    el.className = `app-alert show ${type}`;
    setTimeout(() => { el.className = 'app-alert'; }, 5000);
  }

  function daysUntil(dateStr) {
    if (!dateStr) return null;
    const today = new Date(); today.setHours(0,0,0,0);
    const target = new Date(dateStr + 'T00:00:00'); target.setHours(0,0,0,0);
    return Math.ceil((target - today) / 86400000);
  }

  function formatDateDisplay(dateStr) {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr + 'T12:00:00');
      return d.toLocaleDateString('es-PA', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
    } catch { return dateStr; }
  }

  function promoPlaceholderBg(tipo) {
    const maps = {
      puntos:   'linear-gradient(135deg, #fffde7, #fff8c5)',
      descuento:'linear-gradient(135deg, #e8f5e9, #c8e6c9)',
      oferta:   'linear-gradient(135deg, #fce4ec, #f8bbd0)',
      especial: 'linear-gradient(135deg, #ede7f6, #d1c4e9)',
    };
    return maps[tipo] || maps.especial;
  }

  function promoPlaceholderEmoji(tipo) {
    const map = { puntos:'⭐', descuento:'🏷️', oferta:'🛒', especial:'🎁' };
    return map[tipo] || '🎁';
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // API CALL: MGM PUNTOS BACKEND
  // ══════════════════════════════════════════════════════════════════════════════
  async function api(action, payload = {}) {
    if (['get_client', 'get_promotions', 'get_terms'].includes(action)) {
      try {
        let url = `${CFG.PUNTOS_GAS_URL}?action=${action}`;
        if (payload.cedula) url += `&cedula=${encodeURIComponent(payload.cedula)}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data && typeof data === 'object' && ('success' in data)) {
          if (data.success) return data;
          if (action === 'get_client') {
            const localRes = await localFallback(action, payload);
            if (localRes.success) return localRes;
          }
          return data;
        }
      } catch (err) {
        console.warn(`GET ${action} falló, intentando POST...`, err);
      }
    }

    try {
      const res = await fetch(CFG.PUNTOS_GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action, ...payload })
      });
      const data = await res.json();
      if (data && typeof data === 'object' && ('success' in data)) {
        if (data.success) return data;
        if (action === 'get_client') {
          const localRes = await localFallback(action, payload);
          if (localRes.success) return localRes;
        }
        return data;
      }
    } catch (err) {
      console.warn(`POST ${action} falló, usando fallback local:`, err);
    }

    return localFallback(action, payload);
  }

  function localFallback(action, payload) {
    return new Promise(resolve => setTimeout(() => {
      if (action === 'get_promotions') return resolve({ success:true, promos: DEMO_PROMOS.filter(isPromoActive) });
      if (action === 'get_terms')      return resolve({ success:true, terms: DEMO_TERMS });
      if (action === 'get_events')     return resolve({ success:true, events: DEMO_EVENTS });
      if (action === 'register_client') {
        const rawCed = (payload.cedula || '').toString().trim().toUpperCase();
        const cleanCed = rawCed.replace(/[^A-Z0-9]/g, '');
        if (state.clients.some(c => (c.cedula || '').replace(/[^A-Z0-9]/g, '') === cleanCed)) {
          return resolve({ success:false, message:`La cédula ${payload.cedula} ya está registrada en el sistema.` });
        }
        const newC = { ...payload, puntos:0, totalComprasAno:0, fechaRegistro: new Date().toISOString().slice(0,10) };
        state.clients.push(newC);
        localStorage.setItem(K_CLIENTS, JSON.stringify(state.clients));
        return resolve({ success:true, message:'✅ ¡Bienvenido/a al Programa MGM Puntos! Podrás acumular puntos en tu próxima compra.', client: newC });
      }
      if (action === 'get_client') {
        const rawCed = (payload.cedula || '').toString().trim().toUpperCase();
        const cleanCed = rawCed.replace(/[^A-Z0-9]/g, '');
        const c = state.clients.find(x => {
          const xCed = (x.cedula || '').toString().trim().toUpperCase();
          return xCed === rawCed || xCed.replace(/[^A-Z0-9]/g, '') === cleanCed;
        });
        if (!c) return resolve({ success:false, message:`No encontramos ningún miembro registrado con la identificación: ${payload.cedula}` });
        const txs = state.transactions.filter(t => (t.cedula || '').replace(/[^A-Z0-9]/g, '') === cleanCed).slice().reverse();
        return resolve({ success:true, client:{ ...c, historico:txs } });
      }
      return resolve({ success:false, message:'Acción no reconocida.' });
    }, 200));
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // MÓDULO DE NAVEGACIÓN PRINCIPAL (Bottom Nav Tabs)
  // ══════════════════════════════════════════════════════════════════════════════

  window.switchMainTab = function(tabName) {
    document.querySelectorAll('.view-container').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    const viewEl = document.getElementById(`view-${tabName}`);
    if (viewEl) viewEl.classList.add('active');

    const navBtn = document.querySelector(`.nav-item[data-tab="${tabName}"]`);
    if (navBtn) navBtn.classList.add('active');

    state.activeTab = tabName;

    if (tabName === 'agenda') {
      if (state.agendaEvents.length === 0) {
        loadAgendaEvents();
      } else {
        renderCalendar();
      }
    }
    if (tabName === 'promos') {
      if (state.promos.length === 0) {
        loadAllPromos();
      } else {
        renderPromosGallery();
      }
    }
    if (tabName === 'home') {
      if (state.promos.length === 0) loadHomePromos();
      if (state.agendaEvents.length === 0) loadHomeNextEvent();
    }
    // AUTO-LOGIN PUNTOS: si hay sesión activa, cargar dashboard directo; si no, preparar login
    if (tabName === 'puntos') {
      if (state.authUser) {
        autoLoadPuntosDashboard();
      } else {
        updatePuntosAuthViews();
        setTimeout(() => {
          const inp = document.getElementById('login-cedula');
          if (inp && state.activeSubtab === 'subview-cuenta') inp.focus();
        }, 200);
      }
    }
  };

  // ══════════════════════════════════════════════════════════════════════════════
  // DEEP LINK NAVIGATION — navigateTo(seccion)
  // Formato: 'tab' o 'tab:sub_o_id' — Ej: 'puntos:registro', 'agenda:EV001'
  // ══════════════════════════════════════════════════════════════════════════════
  window.navigateTo = function(seccion) {
    if (!seccion) return;
    const parts = seccion.split(':');
    const tab = parts[0];
    const sub = parts[1] || null;

    // Cerrar cualquier modal abierto antes de navegar
    document.querySelectorAll('.app-modal.active').forEach(m => m.classList.remove('active'));

    // Navegar al tab principal
    switchMainTab(tab);

    if (!sub) return;

    // --- Puntos: navegar a subtab ---
    if (tab === 'puntos') {
      const subviewMap = {
        registro:   'subview-registro',
        beneficios: 'subview-promos',
        terminos:   'subview-terminos',
        cuenta:     'subview-cuenta'
      };
      const targetSubview = subviewMap[sub] || 'subview-cuenta';
      const btn = document.querySelector(`.puntos-subtab[data-subview="${targetSubview}"]`);
      if (btn) btn.click();
    }

    // --- Agenda: abrir modal del evento por ID ---
    if (tab === 'agenda') {
      const tryOpenEvent = (attempts) => {
        if (state.agendaEvents.length > 0) {
          openEventDetail(sub);
        } else if (attempts < 20) {
          setTimeout(() => tryOpenEvent(attempts + 1), 300);
        }
      };
      tryOpenEvent(0);
    }

    // --- Promos: abrir modal de la promo por ID ---
    if (tab === 'promos') {
      const tryOpenPromo = (attempts) => {
        if (state.promos.length > 0) {
          const idx = state.promos.findIndex(p => p.id === sub);
          if (idx >= 0) openPromoDetail(idx);
        } else if (attempts < 20) {
          setTimeout(() => tryOpenPromo(attempts + 1), 300);
        }
      };
      tryOpenPromo(0);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // MAGIE IA — BOTPRESS WIDGET OFICIAL (misma lógica que funciona en la web)
  // ══════════════════════════════════════════════════════════════════════════

  window.openAsesoriaModal = function() {
    openAppModal('modal-asesoria');
  };

  /**
   * openBot() — Abre el chat oficial de Botpress (Asistente de Ventas MGM)
   * Lógica idéntica al archivo de referencia que funciona en la web.
   */
  window.openBot = function() {
    // Cerrar modales internos si están abiertos
    closeAppModal('modal-asesoria');

    if (window.botpress) {
      window.botpress.open();
    }
  };

  // Alias para compatibilidad con todos los botones de la app
  window.openMagieChatModal = window.openBot;

  window.closeAppModal = function(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.remove('active');
  };

  function openAppModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.add('active');
  }

  document.addEventListener('click', e => {
    if (e.target.classList.contains('app-modal')) {
      e.target.classList.remove('active');
    }
  });


  // ══════════════════════════════════════════════════════════════════════════════
  // MÓDULO MGM PUNTOS — CLIENTE
  // ══════════════════════════════════════════════════════════════════════════════

  document.querySelectorAll('.puntos-subtab').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-subview');
      document.querySelectorAll('.puntos-subtab').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.puntos-subview').forEach(v => v.classList.remove('active'));
      btn.classList.add('active');
      const subEl = document.getElementById(target);
      if (subEl) subEl.classList.add('active');
      state.activeSubtab = target;

      if (target === 'subview-cuenta') {
        if (state.authUser) autoLoadPuntosDashboard();
        else updatePuntosAuthViews();
      }
      if (target === 'subview-registro') updatePuntosAuthViews();
      if (target === 'subview-promos') loadPuntosPromos();
      if (target === 'subview-terminos') loadTerminos();
    });
  });

  document.querySelectorAll('[data-fmt="cedula"]').forEach(inp => {
    inp.addEventListener('input', e => {
      e.target.value = fmtCedula(e.target.value);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════════
  // GESTIÓN CENTRALIZADA DE SESIÓN (LOGIN, REGISTRO, AUTO-LOGIN & TRACKING)
  // ══════════════════════════════════════════════════════════════════════════════

  function setClientSession(clientData, eventType = 'login') {
    if (!clientData) return;
    state.authUser = { ...state.authUser, ...clientData };
    localStorage.setItem(K_AUTH, JSON.stringify(state.authUser));

    // 1. Actualizar icono con inicial y aro azul en el Header
    updateHeaderUserIcon();

    // 2. Actualizar Banner Inteligente de Bienvenida / Saldo en Home
    updateHomeAuthBanner();

    // 3. Sincronizar formularios y estados de la vista de Puntos
    updatePuntosAuthViews();

    // 4. Celebración visual
    if (eventType === 'registro') {
      mgmConfetti.celebrate();
    } else {
      mgmConfetti.gold();
    }

    // 5. Registrar en el Sheet de Tracking usando la acción 'track'
    trackUserActivity(state.authUser.cedula, state.authUser.nombre, eventType);

    // 6. Enviar notificación interna de bienvenida (si es nueva)
    checkAndSendWelcomeNotification(state.authUser.nombre);

    // 7. Renderizar dashboard de puntos al instante
    renderDashboard(state.authUser);

    // 8. Detectar movimientos de puntos (acreditaciones, canjes/redenciones, ajustes del asesor)
    checkAndNotifyNewPoints(state.authUser);

    // 9. Consultar notificaciones personalizadas desde el backend
    checkNotifications();
  }

  // Registrar actividad del usuario en el Sheet de Tracking (Google Apps Script)
  async function trackUserActivity(cedula, nombre, evento = 'visita') {
    if (!cedula || CFG.NOTIFS_GAS_URL === 'URL_TEMPORAL_PENDIENTE') return;
    try {
      await fetch(CFG.NOTIFS_GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'track',
          cedula: String(cedula).trim(),
          nombre: String(nombre || '').trim(),
          tipo: evento,
          evento: evento,
          timestamp: new Date().toISOString()
        })
      });
    } catch(e) {
      console.warn('[MGM Tracking] Error registrando en Sheet:', e);
    }
  }

  // Sincronizar estado visual de las pestañas de Puntos (Mi Cuenta y Registro)
  function updatePuntosAuthViews() {
    const isAuth = !!state.authUser;
    const loginBox = document.getElementById('puntos-login-box');
    const dashBox = document.getElementById('puntos-dashboard-box');
    const regAlreadyAuth = document.getElementById('reg-already-auth');
    const regFormWrap = document.getElementById('reg-form-wrap');
    const regAuthName = document.getElementById('reg-auth-name');
    const regAuthCedula = document.getElementById('reg-auth-cedula');

    if (isAuth) {
      if (loginBox) loginBox.style.display = 'none';
      if (dashBox) dashBox.style.display = 'block';
      if (regAlreadyAuth) regAlreadyAuth.style.display = 'block';
      if (regFormWrap) regFormWrap.style.display = 'none';
      if (regAuthName) regAuthName.textContent = state.authUser.nombre || '';
      if (regAuthCedula) regAuthCedula.textContent = `Cédula: ${state.authUser.cedula || ''}`;
    } else {
      if (loginBox) loginBox.style.display = 'block';
      if (dashBox) dashBox.style.display = 'none';
      if (regAlreadyAuth) regAlreadyAuth.style.display = 'none';
      if (regFormWrap) regFormWrap.style.display = 'block';
      const loginInp = document.getElementById('login-cedula');
      if (loginInp) loginInp.value = '';
    }
  }

  // Banner dinámico inteligente en la pantalla de Inicio
  function updateHomeAuthBanner() {
    const banner = document.getElementById('home-auth-banner');
    if (!banner) return;
    
    if (state.authUser) {
      const primerNombre = (state.authUser.nombre || '').split(' ')[0] || 'Cliente';
      const pts = parseInt(state.authUser.puntos) || 0;
      const valUsd = (pts * CFG.VAL_PUNTO).toFixed(2);
      const inicial = (state.authUser.nombre || 'M').charAt(0).toUpperCase();

      banner.innerHTML = `
        <div class="home-auth-banner-card auth" onclick="switchMainTab('puntos')">
          <div class="hab-left">
            <div class="hab-avatar">${inicial}</div>
            <div>
              <div class="hab-user-greeting">¡Hola, ${primerNombre}! 👋</div>
              <div class="hab-points-line">
                <span class="hab-pts-num">${pts.toLocaleString('es-PA')}</span> Puntos MGM
                <span class="hab-pts-usd">($${valUsd} USD)</span>
              </div>
            </div>
          </div>
          <div class="hab-right">
            <span class="hab-link">Ver Mi Tarjeta <i class="fa-solid fa-chevron-right"></i></span>
          </div>
        </div>
      `;
    } else {
      banner.innerHTML = `
        <div class="home-auth-banner-card unauth">
          <div class="hab-badge"><i class="fa-solid fa-crown"></i> MGM PUNTOS</div>
          <div class="hab-body">
            <h3 class="hab-title">¿Tienes puntos por canjear?</h3>
            <p class="hab-sub">Inicia sesión con tu cédula o regístrate para consultar tu saldo acumulado y beneficios.</p>
          </div>
          <div class="hab-actions">
            <button type="button" class="hab-btn primary" onclick="openLoginModal()"><i class="fa-solid fa-right-to-bracket"></i> Iniciar Sesión</button>
            <button type="button" class="hab-btn secondary" onclick="navigateTo('puntos:registro')"><i class="fa-solid fa-user-plus"></i> Registrarme</button>
          </div>
        </div>
      `;
    }
  }

  // Consulta por cédula en la pestaña de Puntos
  document.getElementById('form-puntos-login')?.addEventListener('submit', async e => {
    e.preventDefault();
    const cedula = document.getElementById('login-cedula').value.trim();
    if (!cedula) { showAlert('puntos-login-alert', 'error', 'Por favor ingresa tu cédula.'); return; }
    const btn = e.target.querySelector('[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Consultando...';

    const res = await api('get_client', { cedula });
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Iniciar Sesión / Ver Mis Puntos';

    if (!res.success) {
      showAlert('puntos-login-alert', 'error', res.message || 'No se encontró tu cuenta. ¿Ya estás registrado/a?');
      return;
    }
    // Guardar sesión persistente, auto-login y registrar tracking
    setClientSession(res.client, 'login');
  });

  // ══════════════════════════════════════════════════════════════════════════════
  // DETECCIÓN AUTOMÁTICA DE MOVIMIENTOS: PUNTOS ACREDITADOS, REDIMIDOS Y AJUSTES
  // (Generados desde el panel de administración de los asesores o compras)
  // ══════════════════════════════════════════════════════════════════════════════
  function checkAndNotifyNewPoints(freshClient) {
    if (!freshClient) return;
    
    let notifiedTxs = JSON.parse(localStorage.getItem(K_NOTIFIED_TX)) || [];
    const historico = freshClient.historico || [];
    if (historico.length === 0) return;

    let hasNewChanges = false;
    let newNotificationsToAdd = [];
    let liveAlerts = [];

    historico.forEach(tx => {
      // Clave identificadora única de la transacción (fecha + factura + puntos)
      const txKey = `${tx.fecha || ''}_${tx.factura || ''}_${tx.puntos || 0}`;
      const notifId = 'pts_' + txKey.replace(/[^a-zA-Z0-9]/g, '_');
      const ptsNum = Number(tx.puntos) || 0;
      const ptsAbs = Math.abs(ptsNum);
      const isNewlyDiscovered = !notifiedTxs.includes(txKey);

      // Determinar si ya está en la lista de notificaciones o fue borrada por el usuario
      const alreadyInList = state.notifications.some(n => String(n.id) === String(notifId));
      const wasCleared = state.clearedNotifs.includes(String(notifId));

      const fac = (tx.factura || '').toString().trim().toUpperCase();
      const mult = (tx.multiplicador || '').toString().trim().toUpperCase();
      const asesor = tx.asesor || 'Asesor Comercial';
      const saldoActual = (freshClient.puntos || 0).toLocaleString('es-PA');

      let notifObj = null;
      let alertType = null; // 'redemption', 'earned', 'adjustment_pos', 'adjustment_neg', 'nc'

      if (ptsNum < 0) {
        // Movimiento negativo: ¿Redención, Devolución/NC o Ajuste en contra?
        const isNC = fac.startsWith('NC-') || mult.includes('DEVOLUCI') || mult.includes('NOTA DE CR');
        const isAjusteNeg = mult.includes('AJUSTE EN CONTRA') || mult.includes('AJUSTE (-)') || mult.includes('AJUSTE NEG');

        if (isNC) {
          alertType = 'nc';
          notifObj = {
            id: notifId,
            title: `📋 Ajuste por Devolución / Nota de Crédito`,
            body: `Se debitaron ${ptsAbs.toLocaleString('es-PA')} puntos (${tx.factura || 'NC'}). Detalle: ${tx.multiplicador || 'Devolución'}. Asesor: ${asesor}. Tu saldo actual es de ${saldoActual} Pts.`,
            date: tx.fecha || new Date().toLocaleDateString('es-PA'),
            seccion: 'puntos:cuenta',
            icon: 'fa-file-invoice-dollar',
            iconColor: '#ef4444',
            badgeText: '📋 Devolución',
            badgeBg: '#fee2e2',
            badgeTxt: '#991b1b'
          };
        } else if (isAjusteNeg) {
          alertType = 'adjustment_neg';
          notifObj = {
            id: notifId,
            title: `⚠️ Ajuste de Puntos Aplicado`,
            body: `Se debitaron ${ptsAbs.toLocaleString('es-PA')} puntos de tu cuenta (${tx.factura || 'Ajuste'}). Detalle: ${tx.multiplicador}. Asesor: ${asesor}. Tu saldo es de ${saldoActual} Pts.`,
            date: tx.fecha || new Date().toLocaleDateString('es-PA'),
            seccion: 'puntos:cuenta',
            icon: 'fa-sliders',
            iconColor: '#f59e0b',
            badgeText: '⚠️ Ajuste (-)',
            badgeBg: '#fef3c7',
            badgeTxt: '#92400e'
          };
        } else {
          // REDENCIÓN DE PUNTOS (Canje por descuento en compras)
          alertType = 'redemption';
          const usdVal = Math.abs(Number(tx.subtotal) || (ptsAbs * CFG.VAL_PUNTO)).toFixed(2);
          notifObj = {
            id: notifId,
            title: `🎁 ¡${ptsAbs.toLocaleString('es-PA')} Puntos MGM Redimidos! ✨`,
            body: `Has canjeado ${ptsAbs.toLocaleString('es-PA')} puntos por $${usdVal} USD de descuento (Comprobante: ${tx.factura || 'MGM'}). Asesor: ${asesor}. Saldo disponible: ${saldoActual} Pts.`,
            date: tx.fecha || new Date().toLocaleDateString('es-PA'),
            seccion: 'puntos:cuenta',
            icon: 'fa-gift',
            iconColor: '#10b981',
            badgeText: '🎁 Canje',
            badgeBg: '#d1fae5',
            badgeTxt: '#065f46'
          };
        }
      } else if (ptsNum > 0) {
        // Movimiento positivo: ¿Ajuste a favor o Acreditación por compra?
        const isAjustePos = mult.includes('AJUSTE A FAVOR') || mult.includes('AJUSTE (+)') || mult.includes('AJUSTE POS') || mult.includes('BONIFICAC');

        if (isAjustePos) {
          alertType = 'adjustment_pos';
          notifObj = {
            id: notifId,
            title: `✨ ¡Ajuste de Puntos a tu Favor! 🌟`,
            body: `El asesor ${asesor} ha acreditado +${ptsNum.toLocaleString('es-PA')} puntos a tu favor (${tx.factura || 'Ajuste'}). Detalle: ${tx.multiplicador}. Tu saldo es de ${saldoActual} Pts.`,
            date: tx.fecha || new Date().toLocaleDateString('es-PA'),
            seccion: 'puntos:cuenta',
            icon: 'fa-award',
            iconColor: '#8b5cf6',
            badgeText: '✨ Ajuste (+)',
            badgeBg: '#ede9fe',
            badgeTxt: '#5b21b6'
          };
        } else {
          alertType = 'earned';
          notifObj = {
            id: notifId,
            title: `⭐ ¡+${ptsNum.toLocaleString('es-PA')} Puntos MGM Acreditados! 🎉`,
            body: `Se han acreditado ${ptsNum.toLocaleString('es-PA')} puntos a tu cuenta por tu compra (Factura: ${tx.factura || 'MGM'}). Asesor: ${asesor}. ¡Tu nuevo saldo es de ${saldoActual} Pts!`,
            date: tx.fecha || new Date().toLocaleDateString('es-PA'),
            seccion: 'puntos:cuenta',
            icon: 'fa-star',
            iconColor: '#f59e0b',
            badgeText: '⭐ Puntos',
            badgeBg: '#fef3c7',
            badgeTxt: '#b45309'
          };
        }
      }

      if (notifObj) {
        // Si no existe en la lista de notificaciones del cliente y no fue eliminada por el usuario
        if (!alreadyInList && !wasCleared) {
          newNotificationsToAdd.push(notifObj);
          hasNewChanges = true;
        }

        // Si es una transacción recién descubierta en vivo
        if (isNewlyDiscovered) {
          notifiedTxs.push(txKey);
          liveAlerts.push({ type: alertType, tx, notif: notifObj, ptsNum, ptsAbs });
        }
      } else if (isNewlyDiscovered) {
        notifiedTxs.push(txKey);
      }
    });

    // Agregar las nuevas notificaciones al estado
    if (newNotificationsToAdd.length > 0) {
      state.notifications.unshift(...newNotificationsToAdd);
      localStorage.setItem(K_NOTIFS, JSON.stringify(state.notifications));
      hasNewChanges = true;
    }

    localStorage.setItem(K_NOTIFIED_TX, JSON.stringify(notifiedTxs));

    if (hasNewChanges) {
      updateNotifBadge();
      renderNotifications();
    }

    // Disparar alertas en vivo (Toasts, Push, Confetti) solo si hay transacciones recién detectadas
    if (liveAlerts.length > 0) {
      const latest = liveAlerts[0];
      const { type, tx, notif, ptsNum, ptsAbs } = latest;

      if (type === 'redemption') {
        const usdVal = Math.abs(Number(tx.subtotal) || (ptsAbs * CFG.VAL_PUNTO)).toFixed(2);
        fireNativeNotif(
          `🎁 ¡Puntos MGM Redimidos!`,
          `Canjeaste ${ptsAbs.toLocaleString('es-PA')} puntos ($${usdVal} USD). Saldo actual: ${freshClient.puntos} Pts.`
        );
        mgmConfetti.celebrate();
        if (typeof showToast === 'function') {
          showToast(`🎁 ¡Has redimido ${ptsAbs.toLocaleString('es-PA')} Puntos MGM ($${usdVal} USD)!`, 'fa-solid fa-gift');
        }
      } else if (type === 'earned') {
        fireNativeNotif(
          `🎉 ¡+${ptsNum.toLocaleString('es-PA')} Puntos MGM Acreditados!`,
          `Se cargaron ${ptsNum.toLocaleString('es-PA')} puntos a tu cuenta. Nuevo saldo: ${freshClient.puntos} Pts.`
        );
        mgmConfetti.gold();
        if (typeof showToast === 'function') {
          showToast(`⭐ ¡Has recibido +${ptsNum.toLocaleString('es-PA')} Puntos MGM!`, 'fa-solid fa-coins');
        }
      } else if (type === 'adjustment_pos') {
        fireNativeNotif(
          `✨ ¡Ajuste de +${ptsNum.toLocaleString('es-PA')} Puntos Acreditado!`,
          `El asesor acreditó puntos a tu favor. Nuevo saldo: ${freshClient.puntos} Pts.`
        );
        mgmConfetti.gold();
        if (typeof showToast === 'function') {
          showToast(`✨ ¡Ajuste de +${ptsNum.toLocaleString('es-PA')} Puntos a tu favor!`, 'fa-solid fa-award');
        }
      } else if (type === 'nc') {
        fireNativeNotif(
          `📋 Ajuste por Nota de Crédito / Devolución`,
          `Se debitaron ${ptsAbs.toLocaleString('es-PA')} puntos (${tx.factura}). Saldo: ${freshClient.puntos} Pts.`
        );
        if (typeof showToast === 'function') {
          showToast(`📋 Ajuste por Devolución: -${ptsAbs.toLocaleString('es-PA')} Pts (${tx.factura})`, 'fa-solid fa-file-invoice-dollar');
        }
      } else if (type === 'adjustment_neg') {
        fireNativeNotif(
          `⚠️ Ajuste de Puntos en Cuenta`,
          `Se debitaron ${ptsAbs.toLocaleString('es-PA')} puntos (${tx.factura}). Saldo: ${freshClient.puntos} Pts.`
        );
        if (typeof showToast === 'function') {
          showToast(`⚠️ Ajuste aplicado: -${ptsAbs.toLocaleString('es-PA')} Pts`, 'fa-solid fa-sliders');
        }
      }
    }
  }

  // AUTO-LOAD: si el usuario ya está autenticado, carga dashboard y refresca datos frescos
  async function autoLoadPuntosDashboard() {
    if (!state.authUser) {
      updatePuntosAuthViews();
      return;
    }
    updatePuntosAuthViews();
    // Usar datos guardados primero (instantáneo)
    renderDashboard(state.authUser);
    // Luego refrescar desde el GAS en segundo plano
    try {
      const res = await fetch(CFG.PUNTOS_GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'get_client', cedula: state.authUser.cedula })
      }).then(r => r.json());
      if (res.success && res.client) {
        // Detectar si entraron puntos o transacciones nuevas y disparar notificación
        checkAndNotifyNewPoints(res.client);

        state.authUser = { ...state.authUser, ...res.client };
        localStorage.setItem(K_AUTH, JSON.stringify(state.authUser));
        renderDashboard(state.authUser);
        updateHeaderUserIcon();
        updateHomeAuthBanner();
        const authPtosEl = document.getElementById('auth-puntos');
        if (authPtosEl) authPtosEl.textContent = state.authUser.puntos || 0;
      }
    } catch(err) {
      console.warn('[MGM] Error refrescando puntos:', err);
    }
  }

  function renderDashboard(c) {
    if (!c) return;
    const pts = parseInt(c.puntos) || 0;
    document.getElementById('dash-pts').textContent        = pts.toLocaleString('es-PA');
    document.getElementById('dash-pts-usd').textContent    = `$${(pts * CFG.VAL_PUNTO).toFixed(2)} USD disponibles para canjear`;
    document.getElementById('dash-holder').textContent     = (c.nombre || '').toUpperCase();
    document.getElementById('dash-cedula-display').textContent = c.cedula || '';
    document.getElementById('dash-tier').textContent       = 'MGM MIEMBRO';

    const bdayEl = document.getElementById('dash-bday-banner');
    const bdayInfo = isBdayBenefitActive(c.cumpleanos);
    if (bdayEl) {
      if (bdayInfo.active) {
        bdayEl.style.display = 'flex';
        const titleEl = document.getElementById('bday-banner-title');
        const subEl = document.getElementById('bday-banner-sub');
        if (titleEl) {
          titleEl.textContent = bdayInfo.isSundayMoved ? '¡Feliz Cumpleaños! 🎉🎂 (Beneficio Domingo)' : '¡Feliz Cumpleaños! 🎉🎂';
        }
        if (subEl) {
          subEl.textContent = bdayInfo.isSundayMoved
            ? 'Como tu cumpleaños cayó domingo, ¡hoy lunes es tu día especial para disfrutar de tu 10% de descuento en MGM!'
            : '¡Hoy es tu día! Disfruta de un 10% de descuento en tus compras hoy en MGM.';
        }
      } else {
        bdayEl.style.display = 'none';
      }
    }
    // 🎂 Fuegos artificiales de cumpleaños — una vez por sesión el día del beneficio
    if (bdayInfo.active && !sessionStorage.getItem('mgm_bday_confetti')) {
      sessionStorage.setItem('mgm_bday_confetti', '1');
      setTimeout(() => mgmConfetti.birthday(), 600);
    }

    const tbody = document.getElementById('dash-tx-body');
    tbody.innerHTML = '';
    const historico = c.historico || [];
    if (historico.length > 0) {
      historico.forEach(tx => {
        const isRed = (tx.puntos || 0) < 0;
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td style="color: var(--text-muted); white-space: nowrap; font-size: 11px;">${tx.fecha || ''}</td>
          <td style="font-size: 11px;"><strong>${tx.factura || '—'}</strong><br>
            <span style="font-size: 10px; color: var(--text-muted);">${tx.multiplicador || ''}</span>
          </td>
          <td style="font-size: 12px;">$${parseFloat(tx.subtotal || 0).toFixed(2)}</td>
          <td>
            <span class="${isRed ? 'badge-pts-red' : 'badge-pts'}">
              ${isRed ? '' : '+'}${(tx.puntos || 0).toLocaleString()} Pts
            </span>
          </td>`;
        tbody.appendChild(tr);
      });
    } else {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color: var(--text-muted); padding: 20px; font-size: 12px;">Sin movimientos registrados aún.</td></tr>`;
    }

    document.getElementById('puntos-login-box').style.display  = 'none';
    document.getElementById('puntos-dashboard-box').style.display = 'block';
  }

  window.resetPuntosLogin = function() {
    logoutClient();
  };

  // Registro de nuevo cliente con Auto-Login inmediato y Tracking
  document.getElementById('form-puntos-register')?.addEventListener('submit', async e => {
    e.preventDefault();
    const data = {
      nombre:     document.getElementById('reg-nombre').value.trim(),
      cedula:     document.getElementById('reg-cedula').value.trim(),
      correo:     document.getElementById('reg-correo').value.trim(),
      telefono:   document.getElementById('reg-telefono').value.trim(),
      cumpleanos: document.getElementById('reg-cumpleanos').value
    };
    if (!data.nombre || !data.cedula || !data.correo || !data.telefono) {
      showAlert('reg-alert', 'error', 'Por favor completa todos los campos requeridos.');
      return;
    }
    const btn = e.target.querySelector('[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Registrando...';

    const res = await api('register_client', data);
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-badge-check"></i> Completar Registro & Iniciar Sesión';

    if (res.success) {
      showAlert('reg-alert', 'success', res.message || '¡Registro exitoso! Iniciando tu sesión...');
      
      const clientData = res.client || {
        nombre: data.nombre,
        cedula: data.cedula,
        correo: data.correo,
        telefono: data.telefono,
        cumpleanos: data.cumpleanos,
        puntos: 0,
        totalComprasAno: 0,
        historico: []
      };

      // 🌟 Auto Login instantáneo + Registro en el Tracking Sheet + Confeti + Notificación
      setClientSession(clientData, 'registro');
      e.target.reset();

      // Transición fluida a Mi Cuenta para ver puntos y tarjeta virtual
      setTimeout(() => {
        navigateTo('puntos:cuenta');
      }, 1200);
    } else {
      showAlert('reg-alert', 'error', res.message || 'Error al registrar. Intenta de nuevo.');
    }
  });

  async function loadPuntosPromos() {
    const container = document.getElementById('puntos-promos-container');
    if (!container || container.children.length > 0) return;
    const res = await api('get_promotions');
    const promos = (res.success && res.promos) ? res.promos.filter(isPromoActive) : [];
    if (promos.length === 0) {
      container.innerHTML = `<div style="text-align:center; padding: 30px; color: var(--text-muted);">
        <i class="fa-solid fa-star" style="font-size: 30px; color: var(--accent-gold); margin-bottom: 10px; display: block;"></i>
        <strong style="color: var(--text-dark); display: block; margin-bottom: 6px;">¡Pronto habrá beneficios especiales!</strong>
        <span style="font-size: 12px;">Regístrate en MGM Puntos y sé el primero en conocerlos.</span>
      </div>`;
      return;
    }
    container.innerHTML = promos.map(p => `
      <div style="
        background: var(--bg-surface);
        border: 1px solid var(--border-light);
        border-radius: var(--radius-md);
        padding: 14px;
        display: flex;
        gap: 12px;
        align-items: flex-start;
        box-shadow: var(--shadow-xs);
      ">
        <div style="
          width: 44px; height: 44px; border-radius: 10px;
          background: ${promoPlaceholderBg(p.tipo)};
          display: flex; align-items: center; justify-content: center;
          font-size: 20px; flex-shrink: 0;
        ">${promoPlaceholderEmoji(p.tipo)}</div>
        <div>
          <div style="font-size: 13.5px; font-weight: 800; color: var(--text-dark); margin-bottom: 3px;">${p.nombre}</div>
          <div style="font-size: 12px; color: var(--text-muted); line-height: 1.4;">${p.descripcion}</div>
          <div style="font-size: 10.5px; color: var(--text-subtle); margin-top: 5px;">
            📅 Válida: ${p.fecha_inicio || ''} — ${p.fecha_fin || ''}
          </div>
        </div>
      </div>`).join('');
  }

  async function loadTerminos() {
    const container = document.getElementById('terms-list-content');
    if (!container || container.dataset.loaded) return;
    const res = await api('get_terms');
    if (res.success && res.terms) {
      container.innerHTML = res.terms.map(t =>
        `<div style="padding: 10px 0; border-bottom: 1px solid var(--border-light);">
          ${t.replace(/\*\*(.*?)\*\*/g, '<strong style="color: var(--text-dark);">$1</strong>')}
        </div>`
      ).join('');
      container.dataset.loaded = '1';
    }
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // MÓDULO PROMOCIONES DEL MES (PROMOS_GAS_URL)
  // ══════════════════════════════════════════════════════════════════════════════

  async function fetchPromosFromGAS() {
    try {
      const res = await fetch(CFG.PROMOS_GAS_URL);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map((p, idx) => ({
          id: p.id || 'P_GAS_' + idx,
          nombre: p.nombre || p.title || `Promoción MGM #${idx + 1}`,
          descripcion: p.copy || p.descripcion || 'Conoce nuestras mejores ofertas en equipos de seguridad.',
          imagen: p.img || p.imagen || p.imagen_url || '',
          tipo: p.tipo || 'especial',
          fecha_inicio: p.fecha_inicio || '',
          fecha_fin: p.fecha_fin || '',
          activa: 'SÍ',
          likes: parseInt(p.likes || (12 + idx * 5))
        }));
      }
    } catch (err) {
      console.warn('Error al conectar con PROMOS_GAS_URL:', err);
    }
    const resApi = await api('get_promotions');
    return (resApi.success && resApi.promos && resApi.promos.length > 0)
      ? resApi.promos.filter(isPromoActive)
      : DEMO_PROMOS.filter(isPromoActive);
  }

  async function loadHomePromos() {
    state.promos = await fetchPromosFromGAS();
    const slider = document.getElementById('home-promos-slider');
    if (!slider) return;

    if (state.promos.length === 0) {
      slider.innerHTML = `<div style="color: var(--text-muted); font-size: 12px; padding: 20px;">Próximamente promociones especiales.</div>`;
      return;
    }

    slider.innerHTML = state.promos.map((p, idx) => `
      <div class="promo-slide-item" onclick="openPromoDetail(${idx})" style="background:${promoPlaceholderBg(p.tipo)};">
        ${p.imagen ? `<img src="${p.imagen}" alt="${p.nombre}" onerror="this.style.display='none'">` : ''}
        <div class="promo-slide-badge">${promoPlaceholderEmoji(p.tipo)} ${p.nombre}</div>
      </div>`).join('');
  }

  async function loadAllPromos() {
    if (state.promos.length === 0) {
      state.promos = await fetchPromosFromGAS();
    }
    renderPromosGallery();
  }

  function renderPromosGallery() {
    const gallery = document.getElementById('promos-full-gallery');
    if (!gallery) return;
    const likes = JSON.parse(localStorage.getItem(K_LIKES) || '{}');

    if (state.promos.length === 0) {
      gallery.innerHTML = `<div style="text-align: center; padding: 40px; color: var(--text-muted);">
        <i class="fa-solid fa-sparkles" style="font-size: 36px; margin-bottom: 12px; color: var(--accent-gold);"></i>
        <p>Próximamente promociones exclusivas para ti.</p>
      </div>`;
      return;
    }

    gallery.innerHTML = state.promos.map((p, idx) => {
      const promoLikes = parseInt(p.likes || 0) + (likes[p.id] ? 1 : 0);
      return `
        <div class="promo-full-card" onclick="openPromoDetail(${idx})">
          <div class="promo-card-img-wrap" style="background:${promoPlaceholderBg(p.tipo)};">
            ${p.imagen
              ? `<img src="${p.imagen}" alt="${p.nombre}" onerror="this.style.display='none'">`
              : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:56px;">${promoPlaceholderEmoji(p.tipo)}</div>`
            }
          </div>
          <div class="promo-card-content">
            <div class="promo-card-title">${p.nombre}</div>
            <div class="promo-card-desc">${(p.descripcion || '').split('\n')[0]}</div>
            <div class="promo-card-footer">
              <span style="font-size: 11px; color: var(--text-muted);">📅 Promoción vigente</span>
              <button class="btn-like ${likes[p.id] ? 'liked' : ''}" onclick="togglePromoLike('${p.id}', this, event)">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="${likes[p.id] ? '#ef4444' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                ${promoLikes}
              </button>
            </div>
          </div>
        </div>`;
    }).join('');
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // MÓDULO AGENDA & CALENDARIO (AGENDA_GAS_URL)
  // ══════════════════════════════════════════════════════════════════════════════

  const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

  async function fetchEventsFromGAS() {
    try {
      const res = await fetch(CFG.AGENDA_GAS_URL);
      const data = await res.json();
      if (data && typeof data === 'object') {
        const eventsList = [];
        if (!Array.isArray(data)) {
          for (const y in data) {
            for (const m in data[y]) {
              for (const d in data[y][m]) {
                const dayEvs = data[y][m][d];
                if (Array.isArray(dayEvs)) {
                  dayEvs.forEach((ev, idx) => {
                    const monthNum = String(parseInt(m) + 1).padStart(2, '0');
                    const dayNum = String(d).padStart(2, '0');
                    const dateStr = `${y}-${monthNum}-${dayNum}`;
                    eventsList.push({
                      id: `EV_${y}_${m}_${d}_${idx}`,
                      titulo: ev.title || 'Evento MGM',
                      categoria: (ev.type || 'training').toLowerCase(),
                      fecha: dateStr,
                      hora: ev.time || '10:00 AM',
                      duracion: '2h',
                      descripcion: ev.description || '',
                      costo: ev.price || 'Gratis',
                      lugar: ev.extra_2 || 'En línea',
                      cupos: ev.extra_1 || '20',
                      registro_url: ev.button_link || 'https://mgmpty.odoo.com/mgm-puntos',
                      button_text: ev.button_text || 'Reservar Cupo'
                    });
                  });
                }
              }
            }
          }
        } else {
          eventsList.push(...data);
        }
        if (eventsList.length > 0) return eventsList;
      }
    } catch (err) {
      console.warn('Error consultando AGENDA_GAS_URL:', err);
    }
    return DEMO_EVENTS;
  }

  async function loadAgendaEvents() {
    state.agendaEvents = await fetchEventsFromGAS();
    renderCalendar();
  }

  async function loadHomeNextEvent() {
    if (state.agendaEvents.length === 0) {
      state.agendaEvents = await fetchEventsFromGAS();
    }
    const events = state.agendaEvents;

    const today = new Date(); today.setHours(0,0,0,0);
    const upcoming = events
      .filter(e => new Date(e.fecha + 'T00:00:00') >= today)
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

    const banner = document.getElementById('home-event-banner');
    if (!upcoming.length) {
      if (banner) banner.style.display = 'none';
      return;
    }

    const next = upcoming[0];
    const diff = daysUntil(next.fecha);

    const catMap = { webinar:'Webinar Online 📺', training:'Capacitación 🎯', curso:'Certificación 🏆' };
    const catIconMap = {
      webinar: '<i class="fa-solid fa-desktop"></i>',
      training: '<i class="fa-solid fa-users"></i>',
      curso: '<i class="fa-solid fa-award"></i>'
    };

    const iconWrap = document.getElementById('home-event-icon-wrap');
    const badgeEl = document.getElementById('home-event-badge');
    const titleEl = document.getElementById('home-event-title');
    const timeEl  = document.getElementById('home-event-time');

    if (iconWrap) {
      iconWrap.innerHTML = catIconMap[next.categoria] || '<i class="fa-solid fa-calendar-star"></i>';
    }

    if (badgeEl) badgeEl.innerHTML = `<i class="fa-solid fa-bolt"></i> ${catMap[next.categoria] || 'Evento MGM'}`;
    if (titleEl) titleEl.textContent = next.titulo;
    if (timeEl) {
      if (diff === 0)      timeEl.textContent = `🔴 ¡HOY a las ${next.hora}!`;
      else if (diff === 1) timeEl.textContent = `⏰ Mañana a las ${next.hora}`;
      else                 timeEl.textContent = `En ${diff} días — ${next.hora}`;
    }
  }

  function renderCalendar() {
    const year  = state.calYear;
    const month = state.calMonth;
    const titleEl = document.getElementById('cal-month-title');
    if (titleEl) titleEl.textContent = `${MONTHS_ES[month]} ${year}`;

    const grid = document.getElementById('cal-grid-days-container');
    if (!grid) return;

    const firstDay    = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today       = new Date();
    const todayStr    = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

    const filteredEvents = state.agendaEvents.filter(e => {
      const eDate = new Date(e.fecha + 'T00:00:00');
      return eDate.getFullYear() === year && eDate.getMonth() === month &&
        (state.activeEventFilter === 'all' || e.categoria === state.activeEventFilter);
    });

    const eventsByDay = {};
    filteredEvents.forEach(e => {
      const day = parseInt(e.fecha.split('-')[2]);
      if (!eventsByDay[day]) eventsByDay[day] = [];
      eventsByDay[day].push(e);
    });

    let html = '';
    for (let i = 0; i < firstDay; i++) {
      html += `<div class="cal-day-cell empty"></div>`;
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const isToday = dateStr === todayStr;
      const eventsToday = eventsByDay[d] || [];

      html += `<div class="cal-day-cell ${isToday ? 'today' : ''}">
        <div class="cal-day-num">${d}</div>
        ${eventsToday.map(ev => `
          <div class="cal-event-pill ${ev.categoria}" onclick="openEventDetail('${ev.id}')" title="${ev.titulo}">
            ${ev.titulo.substring(0, 10)}…
          </div>`).join('')}
      </div>`;
    }

    grid.innerHTML = html;
  }

  window.filterEvents = function(cat, el) {
    state.activeEventFilter = cat;
    document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
    if (el) el.classList.add('active');
    renderCalendar();
  };

  document.getElementById('btn-cal-prev')?.addEventListener('click', () => {
    if (state.calMonth === 0) { state.calYear--; state.calMonth = 11; }
    else state.calMonth--;
    renderCalendar();
  });

  document.getElementById('btn-cal-next')?.addEventListener('click', () => {
    if (state.calMonth === 11) { state.calYear++; state.calMonth = 0; }
    else state.calMonth++;
    renderCalendar();
  });

  window.openEventDetail = function(eventId) {
    const ev = state.agendaEvents.find(e => e.id === eventId);
    if (!ev) return;
    state.activeEventData = ev;

    document.getElementById('modal-event-cat').textContent   = ev.categoria?.toUpperCase() || 'EVENTO';
    document.getElementById('modal-event-title').textContent = ev.titulo;
    document.getElementById('modal-event-desc').textContent  = ev.descripcion;
    document.getElementById('modal-event-date').innerHTML    = `<strong>${formatDateDisplay(ev.fecha)}</strong>`;
    document.getElementById('modal-event-time').innerHTML    = `<strong>${ev.hora || '—'} (${ev.duracion || '—'})</strong>`;
    document.getElementById('modal-event-cost').innerHTML    = `<strong>${ev.costo || '—'}</strong>`;
    document.getElementById('modal-event-place').innerHTML   = `<strong>${ev.lugar || '—'}</strong>`;

    const btnReserve = document.getElementById('modal-event-btn-reserve');
    if (btnReserve) btnReserve.href = ev.registro_url || '#';

    openAppModal('modal-event-detail');
  };

  window.openEventQR = function() {
    const ev = state.activeEventData;
    if (!ev) return;
    const url = ev.qr_url || ev.registro_url || `https://mgmpty.odoo.com/mgm-puntos`;
    const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
    document.getElementById('qr-image-src').src = qrSrc;
    closeAppModal('modal-event-detail');
    openAppModal('modal-event-qr');
  };

  window.openEventShare = function() {
    closeAppModal('modal-event-detail');
    openAppModal('modal-event-share');
  };

  window.shareAction = function(platform) {
    const ev = state.activeEventData;
    if (!ev) return;
    const text = `📅 ${ev.titulo}\n🗓️ ${formatDateDisplay(ev.fecha)} · ${ev.hora}\n📍 ${ev.lugar}\n\nRegistro: ${ev.registro_url || 'https://mgmpty.odoo.com/mgm-puntos'}`;
    const encoded = encodeURIComponent(text);
    if (platform === 'wa')   window.open(`https://wa.me/?text=${encoded}`, '_blank');
    if (platform === 'mail') window.open(`mailto:?subject=${encodeURIComponent(ev.titulo)}&body=${encoded}`, '_blank');
    if (platform === 'copy') { navigator.clipboard.writeText(text).then(() => showToast('¡Texto copiado!', 'fa-solid fa-clipboard-check')); }
    if (platform === 'cal') {
      const dateStart = ev.fecha.replace(/-/g,'');
      window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(ev.titulo)}&dates=${dateStart}T000000Z/${dateStart}T235959Z&details=${encodeURIComponent(ev.descripcion)}`, '_blank');
    }
    closeAppModal('modal-event-share');
  };

  window.openPromoDetail = function(idx) {
    const modal = document.getElementById('modal-promo-feed');
    const feed = document.getElementById('cli-modal-feed');
    if (!modal || !feed || !state.promos) return;
    
    const likes = JSON.parse(localStorage.getItem(K_LIKES) || '{}');

    feed.innerHTML = state.promos.map((p, i) => {
      const totalLikes = parseInt(p.likes || 0) + (likes[p.id] ? 1 : 0);
      const isLiked = !!likes[p.id];
      const descPreview = (p.descripcion || '').replace(/\n/g, ' ').substring(0, 80);

      return `
      <div class="cli-feed-item" id="promo-feed-${i}">
        ${ p.imagen
          ? `<img class="cli-feed-img" src="${p.imagen}" alt="${p.nombre}" onerror="this.style.display='none'">`
          : `<div class="cli-feed-img-placeholder" style="background:${promoPlaceholderBg(p.tipo)};">${promoPlaceholderEmoji(p.tipo)}</div>`
        }
        <div class="cli-feed-gradient"></div>

        <!-- Info inferior izquierda -->
        <div class="cli-feed-info">
          <span class="cli-feed-type">${(p.tipo || 'Especial').toUpperCase()}</span>
          <div class="cli-feed-title">${p.nombre}</div>
          <div class="cli-feed-caption">${descPreview}</div>
          <button class="cli-feed-more-btn" onclick="openCopySheet('${p.id}', '${encodeURIComponent(p.nombre)}', '${encodeURIComponent(p.descripcion || '')}', '${p.fecha_inicio || ''}', '${p.fecha_fin || ''}')">...más</button>
        </div>

        <!-- Botones de acción derecha -->
        <div class="cli-feed-actions">
          <!-- Like -->
          <button class="cli-action-btn ${isLiked ? 'liked' : ''}" id="like-btn-${i}"
            onclick="toggleReelsLike('${p.id}', ${i}, ${totalLikes}, this)">
            <i class="fa-${isLiked ? 'solid' : 'regular'} fa-heart"></i>
            <span id="like-count-${i}">${totalLikes}</span>
          </button>
          <!-- Comentarios (abre el sheet) -->
          <button class="cli-action-btn"
            onclick="openCopySheet('${p.id}', '${encodeURIComponent(p.nombre)}', '${encodeURIComponent(p.descripcion || '')}', '${p.fecha_inicio || ''}', '${p.fecha_fin || ''}')">
            <i class="fa-regular fa-comment"></i>
            <span>Comentar</span>
          </button>
          <!-- Compartir nativo -->
          <button class="cli-action-btn"
            onclick="sharePromo('${p.id}', '${encodeURIComponent(p.nombre)}', '${encodeURIComponent(p.descripcion || '')}')">
            <i class="fa-solid fa-share-nodes"></i>
            <span>Compartir</span>
          </button>
          <!-- WhatsApp -->
          <button class="cli-action-btn wa-btn"
            onclick="promptWhatsApp('${p.id}', '${encodeURIComponent(p.nombre)}')">
            <i class="fa-brands fa-whatsapp"></i>
            <span>Consultar</span>
          </button>
        </div>
      </div>`;
    }).join('');
    
    modal.style.display = 'flex';
    setTimeout(() => {
      const target = document.getElementById('promo-feed-' + idx);
      if (target) target.scrollIntoView({ behavior: 'auto', block: 'start' });
    }, 50);
  };

  // — Like dentro del feed Reels (sin confetti de posición ya que es overlay)
  window.toggleReelsLike = function(promoId, itemIdx, currentCount, btn) {
    const likes = JSON.parse(localStorage.getItem(K_LIKES) || '{}');
    const wasLiked = !!likes[promoId];
    likes[promoId] = !wasLiked;
    localStorage.setItem(K_LIKES, JSON.stringify(likes));

    const icon = btn.querySelector('i');
    const countEl = document.getElementById('like-count-' + itemIdx);
    
    let current = parseInt(countEl?.textContent || '0');

    if (likes[promoId]) {
      btn.classList.add('liked');
      icon.className = 'fa-solid fa-heart';
      if (countEl) countEl.textContent = current + 1;
      mgmConfetti.burst(window.innerWidth - 40, window.innerHeight * 0.45);
      // Sync al GAS
      fetch(CFG.NOTIFS_GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'add_like', promoId })
      }).catch(()=>{});
    } else {
      btn.classList.remove('liked');
      icon.className = 'fa-regular fa-heart';
      if (countEl) countEl.textContent = Math.max(0, current - 1);
    }
  };

  // — Abrir bottom sheet con copy completo
  let _activeCopyPromoId = null;

  window.openCopySheet = function(id, encTitle, encDesc, fi, ff) {
    _activeCopyPromoId = id;
    document.getElementById('cli-copy-title').textContent = decodeURIComponent(encTitle);
    document.getElementById('cli-copy-desc').textContent  = decodeURIComponent(encDesc);
    // Ocultar fechas si no las hay
    const datesEl = document.getElementById('cli-copy-dates');
    if (datesEl) datesEl.textContent = (fi && fi !== 'undefined') ? `📅 Válida: ${fi} — ${ff}` : '';
    
    // Cargar comentarios
    const listEl = document.getElementById('cli-copy-comments-list');
    listEl.innerHTML = '<div style="color: var(--text-muted); font-size: 12px; padding: 8px;">Cargando...</div>';
    loadSheetComments(id, listEl);
    
    document.getElementById('cli-copy-sheet').classList.add('open');
  };

  window.closeCopySheet = function() {
    document.getElementById('cli-copy-sheet').classList.remove('open');
    document.getElementById('cli-copy-comment-input').value = '';
    _activeCopyPromoId = null;
  };

  async function loadSheetComments(promoId, listEl) {
    if (!listEl) listEl = document.getElementById('cli-copy-comments-list');
    if (!listEl) return;

    // 1. Mostrar comentarios locales inmediatamente (sin esperar la red)
    const renderList = (comments) => {
      if (!comments || comments.length === 0) {
        listEl.innerHTML = '<div style="color:var(--text-muted);text-align:center;font-size:12px;padding:16px;">Sin comentarios aún. ¡Sé el primero!</div>';
        return;
      }
      listEl.innerHTML = comments.map(c =>
        `<div style="margin-bottom:10px; padding-bottom:8px; border-bottom:1px solid var(--border-light);">
          <div style="font-weight:800; font-size:12px; color:var(--primary-blue); margin-bottom:2px;">${c.nombre}</div>
          <div style="font-size:13px; color:var(--text-body);">${c.texto}</div>
        </div>`
      ).join('');
    };

    const local = JSON.parse(localStorage.getItem('mgm_comments_' + promoId) || '[]');
    renderList(local);

    // 2. Intentar sincronizar con GAS en segundo plano
    try {
      const response = await fetch(CFG.NOTIFS_GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'get_comments', promoId })
      });
      const res = await response.json();

      if (res && res.success && Array.isArray(res.comments) && res.comments.length > 0) {
        // Merge: combinar comentarios GAS + local (evitar duplicados por texto+nombre)
        const merged = [...res.comments];
        local.forEach(lc => {
          const exists = merged.some(gc => gc.nombre === lc.nombre && gc.texto === lc.texto);
          if (!exists) merged.push(lc);
        });
        // Actualizar localStorage con la version del GAS como base
        localStorage.setItem('mgm_comments_' + promoId, JSON.stringify(merged));
        renderList(merged);
      }
    } catch(e) {
      // Silencioso: ya mostramos el fallback local
      console.warn('[MGM] GAS comentarios no disponible, mostrando locales:', e.message);
    }
  }

  // — Sistema de Toasts
  window.showToast = function(msg, icon = 'fa-solid fa-circle-info') {
    let toast = document.getElementById('mgm-toast-el');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'mgm-toast-el';
      toast.className = 'mgm-toast';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<i class="${icon}"></i> <span>${msg}</span>`;
    // Forzar reflow para que la animación funcione si ya estaba en pantalla
    void toast.offsetWidth; 
    toast.classList.add('show');
    
    // Limpiar timeout anterior si existe
    if (toast.hideTimeout) clearTimeout(toast.hideTimeout);
    toast.hideTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  };

  window.postCommentFromSheet = async function() {
    if (!state.authUser) {
      showToast('Inicia sesión para comentar.', 'fa-solid fa-lock');
      openLoginModal();   // Se abre encima del feed (z-index 8000 > 3000)
      return;
    }
    const promoId = _activeCopyPromoId;
    if (!promoId) return;
    const input = document.getElementById('cli-copy-comment-input');
    const texto = input.value.trim();
    if (!texto) return;
    input.value = '';

    const listEl = document.getElementById('cli-copy-comments-list');
    if (listEl.innerHTML.includes('Sin comentarios')) listEl.innerHTML = '';
    listEl.innerHTML += `<div style="margin-bottom:8px; opacity:0.7;"><strong style="color:var(--text-dark);">${state.authUser.nombre}:</strong> <span style="color:var(--text-body);">${texto}</span></div>`;
    listEl.scrollTop = listEl.scrollHeight;

    try {
      await fetch(CFG.NOTIFS_GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'add_comment', promoId, nombre: state.authUser.nombre, texto })
      });
    } catch(e) {}

    const local = JSON.parse(localStorage.getItem('mgm_comments_' + promoId) || '[]');
    local.push({ nombre: state.authUser.nombre, texto });
    localStorage.setItem('mgm_comments_' + promoId, JSON.stringify(local));
    loadSheetComments(promoId, listEl);
  };


  window.closePromoDetail = function() {
      const modal = document.getElementById('modal-promo-feed');
      if (modal) {
          modal.style.display = 'none';
          document.getElementById('cli-modal-feed').innerHTML = ''; // Limpiar la memoria
      }
  };

  window.togglePromoLike = function(promoId, btn, ev) {
    ev.stopPropagation();
    const likes = JSON.parse(localStorage.getItem(K_LIKES) || '{}');
    const wasLiked = !!likes[promoId];
    likes[promoId] = !likes[promoId];
    localStorage.setItem(K_LIKES, JSON.stringify(likes));
    const svg = btn.querySelector('svg');
    if (svg) svg.setAttribute('fill', likes[promoId] ? '#ef4444' : 'none');
    btn.classList.toggle('liked', !!likes[promoId]);
    const promo = state.promos.find(p => p.id === promoId);
    if (promo) {
      const base = parseInt(promo.likes || 0);
      btn.querySelector('span') && (btn.lastChild.textContent = base + (likes[promoId] ? 1 : 0));
    }
    // ❤️ Mini-burst en el punto del click al dar like
    if (!wasLiked && likes[promoId]) {
      const rect = btn.getBoundingClientRect();
      mgmConfetti.burst(rect.left + rect.width / 2, rect.top + rect.height / 2);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════════
  // PROMOS: COMPARTIR, WHATSAPP Y COMENTARIOS
  // ══════════════════════════════════════════════════════════════════════════════
  
  window.sharePromo = function(id, encTitle, encDesc) {
    const title = decodeURIComponent(encTitle);
    const text  = decodeURIComponent(encDesc).substring(0, 100) + '...';
    const url   = window.location.href.split('?')[0] + `?tab=promos&id=${id}`;

    if (navigator.share) {
      navigator.share({
        title,
        text: `¡Mira esta promo en MGM Hub!\n${title}\n${text}`,
        url
      }).catch(err => console.warn('Share error:', err));
    } else {
      showToast('Tu navegador no soporta compartir nativo.', 'fa-solid fa-triangle-exclamation');
    }
  };

  let activeWaPromoText = '';
  
  window.promptWhatsApp = function(id, encTitle) {
    activeWaPromoText = `Hola, quisiera mas informacion sobre la promocion: ${decodeURIComponent(encTitle)}`;
    openAppModal('modal-wa-selector');
  };

  window.sendWaConsult = function(number) {
    if (!activeWaPromoText) return;
    window.open(`https://wa.me/507${number}?text=${encodeURIComponent(activeWaPromoText)}`, '_blank');
    closeAppModal('modal-wa-selector');
  };

  window.toggleComments = function(promoId, ev) {
    ev.stopPropagation();
    const section = document.getElementById('comments-section-' + promoId);
    if (!section) return;
    
    if (section.style.display === 'none') {
      section.style.display = 'block';
      loadCardComments(promoId);
    } else {
      section.style.display = 'none';
    }
  };

  async function loadCardComments(promoId) {
    const listEl = document.getElementById('comments-list-' + promoId);
    if (!listEl) return;

    const renderList = (comments) => {
      if (!comments || comments.length === 0) {
        listEl.innerHTML = `<div style="color: var(--text-muted); text-align: center; font-size: 12px; padding: 10px;">Aún no hay comentarios. Sé el primero.</div>`;
        return;
      }
      listEl.innerHTML = comments.map(c => `
        <div style="margin-bottom: 6px;">
          <strong style="color: var(--text-dark);">${c.nombre}:</strong>
          <span style="color: var(--text-body);">${c.texto}</span>
        </div>`
      ).join('');
    };

    // 1. Mostrar locales primero
    const local = JSON.parse(localStorage.getItem('mgm_comments_' + promoId) || '[]');
    renderList(local);

    // 2. Intentar GAS en segundo plano
    try {
      const response = await fetch(CFG.NOTIFS_GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'get_comments', promoId })
      });
      const res = await response.json();

      if (res && res.success && Array.isArray(res.comments) && res.comments.length > 0) {
        const merged = [...res.comments];
        local.forEach(lc => {
          const exists = merged.some(gc => gc.nombre === lc.nombre && gc.texto === lc.texto);
          if (!exists) merged.push(lc);
        });
        localStorage.setItem('mgm_comments_' + promoId, JSON.stringify(merged));
        renderList(merged);
      }
    } catch(err) {
      console.warn('[MGM] GAS card-comments no disponible:', err.message);
    }
  }

  window.postComment = async function(promoId) {
    if (!state.authUser) {
      showToast('Debes iniciar sesión para comentar.', 'fa-solid fa-lock');
      openLoginModal();
      return;
    }

    const input = document.getElementById('comment-input-' + promoId);
    const texto = input.value.trim();
    if (!texto) return;
    
    input.value = '';
    
    // UI instantánea (Optimistic UI)
    const listEl = document.getElementById('comments-list-' + promoId);
    if (listEl.innerHTML.includes('Aún no hay comentarios')) listEl.innerHTML = '';
    listEl.innerHTML += `
      <div style="margin-bottom: 6px; opacity: 0.7;">
        <strong style="color: var(--text-dark);">${state.authUser.nombre}:</strong> <span style="color: var(--text-body);">${texto}</span>
      </div>
    `;
    listEl.scrollTop = listEl.scrollHeight;
    
    try {
      await fetch(CFG.NOTIFS_GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'add_comment', promoId, nombre: state.authUser.nombre, texto })
      });
    } catch(e) { }
    
    // Fallback guardar local
    const localComments = JSON.parse(localStorage.getItem('mgm_comments_' + promoId) || '[]');
    localComments.push({ nombre: state.authUser.nombre, texto });
    localStorage.setItem('mgm_comments_' + promoId, JSON.stringify(localComments));
    
    loadCardComments(promoId);
  };

  window.toggleModalPromoLike = function() {
    const p = state.activePromoData;
    if (!p) return;
    const likes = JSON.parse(localStorage.getItem(K_LIKES) || '{}');
    likes[p.id] = !likes[p.id];
    localStorage.setItem(K_LIKES, JSON.stringify(likes));
    const base = parseInt(p.likes || 0);
    document.getElementById('modal-promo-likes-count').textContent = `${base + (likes[p.id] ? 1 : 0)}`;
    document.getElementById('modal-promo-like-btn').classList.toggle('liked', !!likes[p.id]);
  };

  // ══════════════════════════════════════════════════════════════════════════════
  // MÓDULO AUDIO PLAYER — REPRODUCCIÓN SECUENCIAL & MULTI-PISTA
  // ══════════════════════════════════════════════════════════════════════════════

  const audioEl    = document.getElementById('audio-element');
  const audioBar   = document.getElementById('audio-mini-bar');
  const playIcon   = document.getElementById('audio-play-icon');
  const pauseIcon  = document.getElementById('audio-pause-icon');
  const trackTitle = document.getElementById('audio-title');
  const trackArtist= document.getElementById('audio-artist');
  const coverImg   = document.getElementById('audio-cover');

  function loadTrack(idx) {
    const tracks = CFG.AUDIO_TRACKS.length > 0 ? CFG.AUDIO_TRACKS : CFG.DEFAULT_AUDIO_TRACKS;
    if (!tracks || !tracks.length || !audioEl) return;

    state.audioTrackIndex = ((idx % tracks.length) + tracks.length) % tracks.length;
    const track = tracks[state.audioTrackIndex];

    if (track.src) {
      const wasPlaying = state.audioPlaying;
      audioEl.src = track.src;
      if (trackTitle) trackTitle.textContent = track.title || 'MGM Radio';
      if (trackArtist) trackArtist.textContent = track.artist || 'MGM';
      if (coverImg) {
        coverImg.src = track.cover || 'https://mgmpty.odoo.com/web/image/68369-dbd5e226/Logo%20MGM.png';
      }
      if (audioBar) audioBar.classList.remove('hidden');

      if (wasPlaying) {
        audioEl.play().catch(err => console.warn('Autoplay track change error:', err));
      }
    }
  }

  async function fetchAudioPlaylist() {
    try {
      const res = await fetch(CFG.AUDIO_GAS_URL);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const mapped = data.map(t => ({
          title: t.title || t.titulo || t.nombre || 'MGM Audio',
          artist: t.artist || t.artista || 'MGM Radio',
          src: t.url || t.src || t.audio_url || t.audio || t.link || '',
          cover: t.cover || t.imagen || t.img || 'https://mgmpty.odoo.com/web/image/68369-dbd5e226/Logo%20MGM.png'
        })).filter(t => t.src);

        if (mapped.length > 0) {
          CFG.AUDIO_TRACKS = mapped;
        } else {
          CFG.AUDIO_TRACKS = CFG.DEFAULT_AUDIO_TRACKS;
        }
      } else {
        CFG.AUDIO_TRACKS = CFG.DEFAULT_AUDIO_TRACKS;
      }
    } catch (err) {
      console.warn('Audio GAS fetch warning, usando playlist por defecto:', err);
      CFG.AUDIO_TRACKS = CFG.DEFAULT_AUDIO_TRACKS;
    }

    loadTrack(0);
  }

  document.getElementById('audio-btn-play')?.addEventListener('click', () => {
    const tracks = CFG.AUDIO_TRACKS.length > 0 ? CFG.AUDIO_TRACKS : CFG.DEFAULT_AUDIO_TRACKS;
    if (!audioEl || !tracks.length) return;

    if (state.audioPlaying) {
      audioEl.pause();
      state.audioPlaying = false;
      playIcon && (playIcon.style.display = '');
      pauseIcon && (pauseIcon.style.display = 'none');
      coverImg?.classList.remove('spinning');
    } else {
      audioEl.play().then(() => {
        state.audioPlaying = true;
        playIcon && (playIcon.style.display = 'none');
        pauseIcon && (pauseIcon.style.display = '');
        coverImg?.classList.add('spinning');
      }).catch(err => console.warn('Audio play error:', err));
    }
  });

  document.getElementById('audio-btn-prev')?.addEventListener('click', () => {
    loadTrack(state.audioTrackIndex - 1);
  });

  document.getElementById('audio-btn-next')?.addEventListener('click', () => {
    loadTrack(state.audioTrackIndex + 1);
  });

  document.getElementById('audio-btn-close')?.addEventListener('click', () => {
    audioEl?.pause();
    state.audioPlaying = false;
    audioBar?.classList.add('hidden');
  });

  if (audioEl) {
    audioEl.addEventListener('ended', () => {
      loadTrack(state.audioTrackIndex + 1);
      audioEl.play().catch(e => console.warn(e));
    });
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // SPLASHSCREEN / PROMO INTERSTITIAL (SPLASH_GAS_URL)
  // ══════════════════════════════════════════════════════════════════════════════

  window.closeSplashOption = function(option) {
    const el = document.getElementById('imou-splash');
    if (el) { el.style.display = 'none'; el.classList.remove('show'); }
    
    if (option === 'today') {
      localStorage.setItem(K_SPLASH, new Date().toDateString());
    } else if (option === 'session') {
      sessionStorage.setItem('mgm_splash_session', 'hidden');
    }
  };

  window.toggleSplashSettings = function() {
    const menu = document.getElementById('splash-settings-menu');
    if (menu) menu.classList.toggle('show');
  };

  window.closeSplashWidget = function() {
    closeSplashOption('session'); // Por defecto se oculta en esta sesión
  };

  async function checkAndShowSplash() {
    if (!CFG.SPLASH_ENABLED) return;
    const lastShown = localStorage.getItem(K_SPLASH);
    if (lastShown === new Date().toDateString()) return;
    if (sessionStorage.getItem('mgm_splash_session') === 'hidden') return;

    try {
      const res = await fetch(CFG.SPLASH_GAS_URL);
      const data = await res.json();
      const listado = Array.isArray(data) ? data : [];
      const hoyEsSabado = new Date().getDay() === 6;

      const activas = listado.filter(c => {
        const hoy = new Date(); hoy.setHours(0,0,0,0);
        if (c.fecha_inicio) {
          const inicio = new Date(c.fecha_inicio);
          if (!isNaN(inicio.getTime()) && hoy < inicio) return false;
        }
        if (c.fecha_fin) {
          const fin = new Date(c.fecha_fin);
          if (!isNaN(fin.getTime()) && hoy > fin) return false;
        }
        return true;
      });

      let pool = [];
      if (hoyEsSabado) {
        const soloSabado = activas.filter(c => String(c.es_sabado).toUpperCase() === 'SI' || c.es_sabado === true);
        const diarias = activas.filter(c => !soloSabado.includes(c));
        pool = [...diarias, ...soloSabado, ...soloSabado];
      } else {
        pool = activas.filter(c => String(c.es_sabado).toUpperCase() !== 'SI' && c.es_sabado !== true);
      }

      if (pool.length > 0) {
        const elegida = pool[Math.floor(Math.random() * pool.length)];
        const imgEl = document.getElementById('splash-img');
        const wrapEl = document.getElementById('splash-content-wrap');

        if (imgEl && elegida.imagen_url) {
          imgEl.src = elegida.imagen_url;
          const urlLimpia = (elegida.enlace || '').toLowerCase();
          if (urlLimpia.includes('#magie')) {
            wrapEl.onclick = (e) => {
              e.preventDefault();
              openMagieChatModal();
              closeSplashOption('session');
            };
          } else if (elegida.enlace && elegida.enlace !== '#') {
            wrapEl.onclick = () => window.open(elegida.enlace, '_blank');
          }

          const splashEl = document.getElementById('imou-splash');
          if (splashEl) setTimeout(() => splashEl.classList.add('show'), 1200);
        }
      }
    } catch (err) {
      console.warn('Splash GAS fetch warning:', err);
    }
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // PWA: SERVICE WORKER
  // ══════════════════════════════════════════════════════════════════════════════

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(err => console.warn('SW register failed:', err));
    });
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // AUTHENTICATION & LOGIN (MGM PUNTOS)
  // ══════════════════════════════════════════════════════════════════════════════
  
  window.openLoginModal = function() {
    const isAuth = !!state.authUser;
    document.getElementById('login-view-unauth').style.display = isAuth ? 'none' : 'block';
    document.getElementById('login-view-auth').style.display = isAuth ? 'block' : 'none';
    
    if (isAuth) {
      document.getElementById('auth-initials').textContent = state.authUser.nombre.charAt(0).toUpperCase();
      document.getElementById('auth-name').textContent = state.authUser.nombre;
      document.getElementById('auth-cedula').textContent = state.authUser.cedula;
      document.getElementById('auth-puntos').textContent = state.authUser.puntos || 0;
      
      // Mostrar botón de notificaciones si no tienen permiso concedido
      const btnNotifs = document.getElementById('btn-enable-notifs');
      if (btnNotifs && Notification.permission !== 'granted') {
        btnNotifs.style.display = 'block';
      } else if (btnNotifs) {
        btnNotifs.style.display = 'none';
      }
    }
    
    const modal = document.getElementById('modal-user-login');
    if (modal) modal.classList.add('active');
  };

  window.submitLogin = async function() {
    const input = document.getElementById('login-cedula-input').value.trim();
    const errorMsg = document.getElementById('login-error-msg');
    const btn = document.getElementById('btn-login-submit');
    
    if (!input) {
      errorMsg.textContent = 'Por favor ingresa tu cédula o correo.';
      errorMsg.style.display = 'block';
      return;
    }
    
    errorMsg.style.display = 'none';
    btn.textContent = 'Verificando...';
    btn.disabled = true;
    
    try {
      const res = await fetch(CFG.PUNTOS_GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'get_client', cedula: input })
      }).then(r => r.json());
      
      if (res.success && res.client) {
        setClientSession(res.client, 'login');
        openLoginModal(); // Recargar modal a vista autenticada
      } else {
        errorMsg.textContent = res.message || 'Credenciales no encontradas en MGM Puntos.';
        errorMsg.style.display = 'block';
      }
    } catch (err) {
      // Fallback offline / demo para propósitos de prueba si GAS falla
      console.warn('Fallback login');
      const c = state.clients.find(x => x.cedula === input || x.correo === input);
      if (c) {
        setClientSession(c, 'login');
        openLoginModal();
      } else {
        errorMsg.textContent = 'Error de conexión. Intenta nuevamente.';
        errorMsg.style.display = 'block';
      }
    }
    
    btn.textContent = 'Ingresar a MGM Hub';
    btn.disabled = false;
  };

  function checkAndSendWelcomeNotification(nombre) {
    // Si ya existe la bienvenida, no hacer nada
    if (state.notifications.some(n => n.id === '0000')) return;

    const primerNombre = (nombre || '').split(' ')[0] || 'Cliente';
    const welcomeNotif = {
      id: '0000',
      title: '¡Bienvenido a MGM Hub! 🎉',
      body: `Hola ${primerNombre}, gracias por unirte a nuestro programa de beneficios. Te invitamos a seguir sumando puntos en todas tus compras y disfrutar de recompensas exclusivas.`,
      date: new Date().toLocaleDateString('es-PA')
    };

    state.notifications.unshift(welcomeNotif);
    localStorage.setItem(K_NOTIFS, JSON.stringify(state.notifications));
    updateNotifBadge();
    
    // Alerta visual local
    fireNativeNotif(welcomeNotif.title, welcomeNotif.body);
  }

  window.logoutClient = function() {
    state.authUser = null;
    localStorage.removeItem(K_AUTH);
    // Limpiar notificaciones de puntos de la sesión anterior (manteniendo bienvenida)
    state.notifications = state.notifications.filter(n => String(n.id) === '0000');
    localStorage.setItem(K_NOTIFS, JSON.stringify(state.notifications));
    updateNotifBadge();
    renderNotifications();
    updateHeaderUserIcon();
    updateHomeAuthBanner();
    updatePuntosAuthViews();
    closeAppModal('modal-user-login');
  };

  function updateHeaderUserIcon() {
    const btn = document.getElementById('btn-user-login');
    if (!btn) return;
    if (state.authUser) {
      btn.innerHTML = `<span style="font-weight:800;font-size:14px;color:#0ea5e9;">${state.authUser.nombre.charAt(0).toUpperCase()}</span>`;
      btn.style.background = '';  // Dejar que el CSS maneje el fondo
      btn.style.border = '2px solid #0ea5e9';
    } else {
      btn.innerHTML = `<i class="fa-regular fa-user"></i>`;
      btn.style.background = '';
      btn.style.border = '';
    }
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // NOTIFICATIONS (LOCAL + TRACKING BACKEND)
  // ══════════════════════════════════════════════════════════════════════════════

  window.openNotificationsPanel = function() {
    openAppModal('modal-notifications');
    renderNotifications();
    // Ocultar badge al abrir el panel (marcar como vistas)
    const badge = document.getElementById('notif-badge');
    if (badge) badge.style.display = 'none';
  };

  // Solicitar permiso de notificaciones nativas del navegador
  window.requestNotificationPermission = function() {
    if (!('Notification' in window)) {
      alert('Tu navegador no soporta notificaciones del sistema.');
      return;
    }
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        // 🔔 ¡Celebrar activación de notificaciones!
        mgmConfetti.bell();
        fireNativeNotif('MGM Hub', '¡Notificaciones activadas! 🔔 Recibirás alertas exclusivas.');
        openLoginModal(); // Refrescar modal para ocultar el botón
        if (state.authUser) {
          registerDeviceForNotifs(state.authUser.cedula, state.authUser.nombre);
        }
      }
    });
  };

  // Disparar una notificación nativa del navegador/sistema
  function fireNativeNotif(title, body) {
    if (Notification.permission !== 'granted') return;
    try {
      // Service Worker notification (funciona en móvil como PWA)
      if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then(reg => {
          reg.showNotification(title, {
            body,
            icon: 'https://mgmpty.odoo.com/web/image/68369-dbd5e226/Logo%20MGM.png',
            badge: 'https://mgmpty.odoo.com/web/image/68369-dbd5e226/Logo%20MGM.png',
            vibrate: [200, 100, 200]
          });
        }).catch(() => {
          new Notification(title, {
            body,
            icon: 'https://mgmpty.odoo.com/web/image/68369-dbd5e226/Logo%20MGM.png'
          });
        });
      } else {
        new Notification(title, {
          body,
          icon: 'https://mgmpty.odoo.com/web/image/68369-dbd5e226/Logo%20MGM.png'
        });
      }
    } catch(e) { console.warn('Notif error:', e); }
  }

  // Registrar dispositivo en el Sheet de Tracking
  async function registerDeviceForNotifs(cedula, nombre) {
    trackUserActivity(cedula, nombre, 'dispositivo');
  }

  // Consultar notificaciones del backend
  async function checkNotifications() {
    if (CFG.NOTIFS_GAS_URL === 'URL_TEMPORAL_PENDIENTE') return;
    
    try {
      const cedula = state.authUser ? state.authUser.cedula : 'ANONIMO';
      const res = await fetch(CFG.NOTIFS_GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'get_notifications', cedula })
      }).then(r => r.json());

      if (res.success && Array.isArray(res.notifications)) {
        let hasChanged = false;
        
        // Sincronizar eliminaciones: borrar notificaciones de servidor obsoletas (preservar bienvenida y puntos acreditados)
        const serverIds = res.notifications.map(n => String(n.id));
        const originalLength = state.notifications.length;
        state.notifications = state.notifications.filter(localNotif => {
          const localId = String(localNotif.id);
          if (localId === '0000' || localId.startsWith('pts_')) return true; // Preservar bienvenida y transacciones de puntos
          return serverIds.includes(localId);  // Mantener solo si sigue en el server
        });
        
        if (state.notifications.length !== originalLength) {
          hasChanged = true;
        }

        // Agregar nuevas notificaciones o actualizar existentes
        res.notifications.forEach(rawN => {
          // Normalizar campos: el GAS puede devolver titulo/mensaje o title/body
          const n = {
            id:      rawN.id,
            title:   rawN.title   || rawN.titulo  || '',
            body:    rawN.body    || rawN.mensaje  || '',
            date:    rawN.date    || rawN.fecha    || '',
            seccion: rawN.seccion || rawN.seccion  || ''
          };
          const stringId = String(n.id);
          const alreadyExists = state.notifications.some(existing => String(existing.id) === stringId);
          const isCleared = state.clearedNotifs.includes(stringId);

          if (!alreadyExists && !isCleared) {
            state.notifications.unshift(n);
            hasChanged = true;
            // Disparar notificación nativa del sistema
            fireNativeNotif(n.title || 'MGM', n.body || '');
            // Mostrar Toast visual en la app
            if (typeof showToast === 'function') {
              showToast(n.title || 'Nueva notificación de MGM', 'fa-solid fa-bell');
            }
          } else if (alreadyExists) {
            // Actualizar si hay cambios en el texto
            const existingIdx = state.notifications.findIndex(existing => String(existing.id) === stringId);
            if (existingIdx !== -1) {
              const existingNotif = state.notifications[existingIdx];
              if (existingNotif.title !== n.title || existingNotif.body !== n.body || existingNotif.seccion !== n.seccion) {
                state.notifications[existingIdx] = n;
                hasChanged = true;
              }
            }
          }
        });

        if (hasChanged) {
          localStorage.setItem(K_NOTIFS, JSON.stringify(state.notifications));
          updateNotifBadge();
          renderNotifications(); // Re-renderizar por si el panel está abierto
        }
      }
    } catch(e) {
      console.warn('[MGM Hub] Error al consultar notificaciones:', e);
    }
  }

  // Chequear notificaciones y puntos cada vez que el usuario vuelve a abrir la app (vuelve al tab)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      checkNotifications();
      if (state.authUser) autoLoadPuntosDashboard();
    }
  });

  // Chequeo periódico en segundo plano cada 20 segundos si la app está visible
  setInterval(() => {
    if (state.authUser && document.visibilityState === 'visible') {
      autoLoadPuntosDashboard();
    }
  }, 20000);

  // Actualizar el globito rojo de la campana
  function updateNotifBadge() {
    const badge = document.getElementById('notif-badge');
    if (!badge) return;
    const count = state.notifications.length;
    if (count > 0) {
      badge.textContent = count > 9 ? '9+' : String(count);
      badge.style.display = 'inline-flex';
    } else {
      badge.style.display = 'none';
    }
  }

  // Limpiar cola de mensajes (Borrar todos)
  window.clearNotifications = function() {
    if (state.notifications.length === 0) return;
    if (confirm('¿Estás seguro de que quieres borrar todas tus notificaciones?')) {
      // Guardar las IDs borradas para que no vuelvan a aparecer del backend
      state.notifications.forEach(n => {
        const stringId = String(n.id);
        if (!state.clearedNotifs.includes(stringId)) {
          state.clearedNotifs.push(stringId);
        }
      });
      localStorage.setItem(K_CLEARED_NOTIFS, JSON.stringify(state.clearedNotifs));

      state.notifications = [];
      localStorage.setItem(K_NOTIFS, JSON.stringify(state.notifications));
      renderNotifications();
      updateNotifBadge();
    }
  };

  // Renderizar la lista de notificaciones en el panel
  function renderNotifications() {
    const list = document.getElementById('notif-list');
    if (!list) return;

    if (state.notifications.length === 0) {
      list.innerHTML = `
        <div style="text-align:center; padding:40px 20px;">
          <div style="font-size:40px; margin-bottom:12px;">✅</div>
          <div style="font-size:15px; font-weight:800; color:var(--text-dark); margin-bottom:8px;">¡Estás al día!</div>
          <div style="font-size:13px; color:var(--text-muted); line-height:1.7;">
            No tienes notificaciones pendientes.<br>
            Aquí aparecerán promociones exclusivas,<br>alertas de puntos y mensajes de MGM.
          </div>
        </div>`;
      return;
    }

    // Configuración visual por sección destino
    const SECC_CFG = {
      puntos:  { icon: 'fa-star',          color: '#f59e0b', badgeText: '⭐ Puntos',  badgeBg: '#fef3c7', badgeTxt: '#b45309' },
      agenda:  { icon: 'fa-calendar-days', color: '#6366f1', badgeText: '📅 Agenda',  badgeBg: '#ede9fe', badgeTxt: '#5b21b6' },
      promos:  { icon: 'fa-fire',          color: '#ef4444', badgeText: '🔥 Promo',   badgeBg: '#fee2e2', badgeTxt: '#b91c1c' },
      default: { icon: 'fa-circle-info',   color: '#0ea5e9', badgeText: null,         badgeBg: null,      badgeTxt: null      }
    };

    list.innerHTML = state.notifications.map(n => {
      // Usar campo seccion del backend; fallback: detectar por título (compatibilidad)
      let seccion = (n.seccion || '').trim();
      const titleLower = (n.title || '').toLowerCase();
      const bodyLower  = (n.body || '').toLowerCase();

      if (!seccion) {
        if (titleLower.includes('punto') || titleLower.includes('cumpleaños') || titleLower.includes('cumpleanos') || titleLower.includes('redim') || titleLower.includes('canje') || titleLower.includes('ajuste')) seccion = 'puntos:cuenta';
        else if (titleLower.includes('promo') || titleLower.includes('oferta') || titleLower.includes('descuento')) seccion = 'promos';
        else if (titleLower.includes('evento') || titleLower.includes('webinar') || titleLower.includes('curso') || titleLower.includes('capacitación')) seccion = 'agenda';
      }

      const tab = seccion.split(':')[0];
      const baseCfg = SECC_CFG[tab] || SECC_CFG.default;

      // Icono y badge dinámicos por tipo de notificación
      let itemIcon      = n.icon      || baseCfg.icon;
      let itemColor     = n.iconColor || baseCfg.color;
      let itemBadgeText = n.badgeText || baseCfg.badgeText;
      let itemBadgeBg   = n.badgeBg   || baseCfg.badgeBg;
      let itemBadgeTxt  = n.badgeTxt  || baseCfg.badgeTxt;

      if (!n.badgeText) {
        if (titleLower.includes('redim') || titleLower.includes('canje') || bodyLower.includes('canjeado') || bodyLower.includes('redimi')) {
          itemIcon = 'fa-gift';
          itemColor = '#10b981';
          itemBadgeText = '🎁 Canje';
          itemBadgeBg = '#d1fae5';
          itemBadgeTxt = '#065f46';
        } else if (titleLower.includes('devolución') || titleLower.includes('devolucion') || titleLower.includes('nota de crédito') || titleLower.includes('nc')) {
          itemIcon = 'fa-file-invoice-dollar';
          itemColor = '#ef4444';
          itemBadgeText = '📋 Devolución';
          itemBadgeBg = '#fee2e2';
          itemBadgeTxt = '#991b1b';
        } else if (titleLower.includes('ajuste')) {
          const isFavor = titleLower.includes('favor') || titleLower.includes('acredit') || titleLower.includes('(+)');
          itemIcon = isFavor ? 'fa-award' : 'fa-sliders';
          itemColor = isFavor ? '#8b5cf6' : '#f59e0b';
          itemBadgeText = isFavor ? '✨ Ajuste (+)' : '⚠️ Ajuste (-)';
          itemBadgeBg = isFavor ? '#ede9fe' : '#fef3c7';
          itemBadgeTxt = isFavor ? '#5b21b6' : '#92400e';
        } else if (titleLower.includes('cumpleaños') || titleLower.includes('cumpleanos')) {
          itemIcon = 'fa-cake-candles';
          itemColor = '#ec4899';
          itemBadgeText = '🎂 Cumpleaños';
          itemBadgeBg = '#fce7f3';
          itemBadgeTxt = '#9d174d';
        } else if (titleLower.includes('bienvenido')) {
          itemIcon = 'fa-hand-peace';
          itemColor = '#6366f1';
          itemBadgeText = '🎉 Bienvenida';
          itemBadgeBg = '#e0e7ff';
          itemBadgeTxt = '#4338ca';
        }
      }

      const isClickable = !!seccion;

      const clickAttr = isClickable
        ? `onclick="closeAppModal('modal-notifications'); navigateTo('${seccion}');" style="cursor:pointer;"`
        : '';

      const hoverIn  = `this.style.boxShadow='0 4px 14px rgba(0,33,74,0.13)'; ${isClickable ? "this.style.transform='translateY(-1px)';" : ''}`;
      const hoverOut = `this.style.boxShadow='0 2px 6px rgba(0,33,74,0.05)'; this.style.transform='translateY(0)';`;

      return `
      <div ${clickAttr}
        style="background:var(--bg-surface); border:1px solid var(--border-light); border-radius:12px; padding:14px; margin-bottom:10px; box-shadow:var(--shadow-xs); transition: box-shadow 0.2s, transform 0.2s;"
        onmouseover="${hoverIn}" onmouseout="${hoverOut}">
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
          <i class="fa-solid ${itemIcon}" style="color:${itemColor}; font-size:14px;"></i>
          <div style="font-size:14px; font-weight:800; color:var(--text-dark); flex:1;">${n.title || 'Sin Título'}</div>
          ${itemBadgeText ? `<span style="font-size:10px; background:${itemBadgeBg}; color:${itemBadgeTxt}; padding:2px 7px; border-radius:20px; font-weight:700; white-space:nowrap;">${itemBadgeText} →</span>` : ''}
        </div>
        <div style="font-size:13px; color:var(--text-muted); line-height:1.5;">${n.body || ''}</div>
        <div style="font-size:11px; color:var(--text-subtle); margin-top:8px; text-align:right;">${n.date || 'Reciente'}</div>
      </div>`;
    }).join('');
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // INIT — ARRANCA LA APP MGM HUB
  // ══════════════════════════════════════════════════════════════════════════════

  async function init() {
    // Asegurar tema estándar limpio (sin modo oscuro residual)
    document.documentElement.removeAttribute('data-theme');
    try { localStorage.removeItem('mgm_theme'); } catch(e) {}

    switchMainTab('home');

    // Inicializar estado de UI autenticación
    updateHeaderUserIcon();
    updateHomeAuthBanner();
    updatePuntosAuthViews();
    
    // Si el usuario está autenticado, registrar visita en tracking sheet y refrescar puntos
    if (state.authUser) {
      trackUserActivity(state.authUser.cedula, state.authUser.nombre, 'app_open');
      autoLoadPuntosDashboard();
    }
    
    // Actualizar badge visual con las locales
    updateNotifBadge();
    
    // Consultar nuevas notificaciones
    checkNotifications();

    await Promise.allSettled([
      loadHomePromos(),
      loadHomeNextEvent(),
      fetchAudioPlaylist()
    ]);

    checkAndShowSplash();

    // ── DEEP LINK: Leer parámetros de URL al arrancar la app ─────────────────
    // Ejemplos: ?tab=puntos&sub=registro | ?tab=agenda&id=EV001 | ?tab=promos&id=P001
    const _urlParams = new URLSearchParams(window.location.search);
    const _deepTab   = _urlParams.get('tab');
    const _deepSub   = _urlParams.get('sub') || _urlParams.get('id');
    if (_deepTab) {
      const _seccion = _deepSub ? `${_deepTab}:${_deepSub}` : _deepTab;
      // Pequeño delay para dejar que los datos carguen antes de navegar
      setTimeout(() => navigateTo(_seccion), 400);
      // Limpiar la URL para que no se repita en recargas
      history.replaceState({}, document.title, window.location.pathname);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
