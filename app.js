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
    AGENDA_GAS_URL: 'https://script.google.com/macros/s/AKfycbxdr46a9UuitHx8LyWDBHi3yZ-yAfRsQMqlwIhIwgeFRC_zm5CLMYO5HMuXwKMimBw4/exec',

    // 3. PROMOCIONES DEL MES (Slider & Rotator)
    PROMOS_GAS_URL: 'https://script.google.com/macros/s/AKfycbxP0mmc5rSsn6-b29iHM3HpgMKqAQL0auCRHGIoM7DfUxrkFvvMyzI4LTBueCHs6iDzyw/exec',

    // 4. AUDIO PLAYER (Playlist Streaming Multi-Pista)
    AUDIO_GAS_URL: 'https://script.google.com/macros/s/AKfycbwlzKNgocSThMfZJ5qPi1cJNrBreEeAVbvN-anObK3jW1vFnPIRadt77tMp4qTdBiAg/exec',

    // 5. SPLASHSCREEN (Campañas IMOU / Promos)
    SPLASH_GAS_URL: 'https://script.google.com/macros/s/AKfycbw3Aey_uya9yLM8xKrcQCBrlMcTSkAdnUBCQEq_kitdBN4-BZHnxbJP66lO5qgZgO8KAQ/exec',

    // 6. NOTIFICACIONES & TRACKING (El usuario creará este nuevo GAS)
    NOTIFS_GAS_URL: 'https://script.google.com/macros/s/AKfycby8EOl7-hZ1Q8rvPCjFB2ItFrRKqwVmDoPJrhX3sM_3-O8xeoWmuZ0RxbEgNUjLN_6dfA/exec',

    // 7. CATÁLOGO DE PREMIOS & CANJES (Backend MGM Puntos o propio)
    PREMIOS_GAS_URL: 'https://script.google.com/macros/s/AKfycbwV90SCVdMrMgE1Vlev3rdpcqMJlVwCV5du_MGJ-BtV5Di8LMY9UroYD7dXhWBXyI2yGw/exec',

    VAL_PUNTO: 0.01,
    BOTPRESS_BOT_ID: 'e5a3c8a6-9aec-41a3-870d-d1985dc8c7df',
    SPLASH_ENABLED: true,

    // Playlist de audios: sólo se poblará si el backend devuelve pistas reales
    DEFAULT_AUDIO_TRACKS: [],
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
  const K_SEEN_NOTIFS = 'mgm_seen_notifs';
  const K_NOTIFIED_TX    = 'mgm_notified_tx_v1';
  const K_MY_COURSES     = 'mgm_my_courses';

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
    myCourses: JSON.parse(localStorage.getItem(K_MY_COURSES)) || [],
    promos: [],
    rewards: [],
    activeRewardData: null,
    notifications: JSON.parse(localStorage.getItem(K_NOTIFS)) || [],
    clearedNotifs: JSON.parse(localStorage.getItem(K_CLEARED_NOTIFS)) || [],
    seenNotifs: JSON.parse(localStorage.getItem(K_SEEN_NOTIFS)) || [],
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
      tipo:'puntos', imagen:'', fecha_inicio:'2026-01-01', fecha_fin:'2026-12-31', activa:'SÍ', likes:24, enlace: 'https://mgmpty.com'
    },
    {
      id:'P002', nombre:'Descuento de Cumpleaños 🎂',
      descripcion:'Disfruta un 10% de descuento especial el día de tu cumpleaños.\n(Si tu cumpleaños cae en domingo, tu descuento es válido el lunes siguiente).\nSolo presenta tu cédula en caja.',
      tipo:'descuento', imagen:'', fecha_inicio:'2026-01-01', fecha_fin:'2026-12-31', activa:'SÍ', likes:18, enlace: ''
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

  const DEMO_REWARDS = [
    {
      id: 'REW-001',
      nombre: 'Cámara Wi-Fi IMOU Cue 2 (1080P)',
      modelo: 'IPC-C22EP-A',
      descripcion: 'Cámara inteligente para interiores con audio bidireccional, visión nocturna y detección de humanos por inteligencia artificial.',
      puntos: 2500,
      imagen: 'https://www.imoulife.com/public/asset/v2/img/product/cue2/cue2-pic1.png',
      fecha_inicio: '2026-01-01',
      fecha_fin: '2026-12-31',
      activo: 'SÍ',
      stock: 'Disponible',
      link: 'https://mgmpty.odoo.com/shop/camara-wifi-imou-cue-2'
    },
    {
      id: 'REW-002',
      nombre: 'Cámara Wi-Fi IMOU Ranger 2 (360°)',
      modelo: 'IPC-A22EN-G',
      descripcion: 'Cobertura 360° con seguimiento inteligente de movimiento, sirena disuasoria y modo de privacidad.',
      puntos: 3500,
      imagen: 'https://www.imoulife.com/public/asset/v2/img/product/ranger2/ranger2-pic1.png',
      fecha_inicio: '2026-01-01',
      fecha_fin: '2026-12-31',
      activo: 'SÍ',
      stock: 'Disponible',
      link: 'https://mgmpty.odoo.com/shop/camara-wifi-imou-ranger-2'
    },
    {
      id: 'REW-003',
      nombre: 'Cámara Exterior IMOU Cruiser Dual (10MP)',
      modelo: 'IPC-S7XP-10M0WED',
      descripcion: 'Doble lente PTZ exterior con visión nocturna Smart Dual Light a todo color y certificación de intemperie IP66.',
      puntos: 6500,
      imagen: '',
      fecha_inicio: '2026-01-01',
      fecha_fin: '2026-12-31',
      activo: 'SÍ',
      stock: 'Disponible',
      link: 'https://mgmpty.odoo.com/shop/camara-exterior-imou-cruiser-dual'
    },
    {
      id: 'REW-004',
      nombre: 'Kit Ponchadora & Herramientas de Red Pro',
      modelo: 'TOOL-KIT-PRO',
      descripcion: 'Ponchadora profesional RJ45/RJ11 con probador de cables UTP y pelador para técnicos e instaladores.',
      puntos: 1800,
      imagen: '',
      fecha_inicio: '2026-01-01',
      fecha_fin: '',
      activo: 'SÍ',
      stock: 'Disponible',
      link: ''
    },
    {
      id: 'REW-005',
      nombre: 'Gorra Oficial & Kit Merch MGM 2026',
      modelo: 'MERCH-MGM-2026',
      descripcion: 'Gorra bordada de colección MGM + vaso térmico metálico y lanyard oficial.',
      puntos: 800,
      imagen: '',
      fecha_inicio: '2026-01-01',
      fecha_fin: '',
      activo: 'SÍ',
      stock: 'Disponible',
      link: ''
    }
  ];

  const DEMO_EVENTS = [];

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
    if (v.includes('@')) return v.trim();
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

  function isRewardActive(r) {
    if (!r) return false;
    const act = (r.activo || r.activa || 'SÍ').toString().toUpperCase().trim();
    if (!['SÍ','SI','1','TRUE','DISPONIBLE'].includes(act)) return false;
    if (r.stock && r.stock.toString().toUpperCase().trim() === 'AGOTADO') return false;
    const today = new Date(); today.setHours(0,0,0,0);
    if (r.fecha_inicio) {
      const fi = new Date(r.fecha_inicio.toString().split('T')[0] + 'T00:00:00');
      if (!isNaN(fi.getTime()) && today < fi) return false;
    }
    if (r.fecha_fin) {
      const ff = new Date(r.fecha_fin.toString().split('T')[0] + 'T23:59:59');
      if (!isNaN(ff.getTime()) && today > ff) return false;
    }
    return true;
  }

  function formatRewardValidez(r) {
    if (!r) return { text: 'Disponible', isExpiringSoon: false, color: 'var(--text-subtle)' };
    const finStr = (r.fecha_fin || '').toString().trim();
    if (!finStr || finStr.toLowerCase().includes('stock') || finStr.toLowerCase().includes('agot') || finStr.toLowerCase().includes('perman')) {
      return { text: '🔥 Hasta agotar stock', isExpiringSoon: false, color: 'var(--text-subtle)' };
    }
    try {
      const ff = new Date(finStr.split('T')[0] + 'T23:59:59');
      if (isNaN(ff.getTime())) {
        return { text: finStr, isExpiringSoon: false, color: 'var(--text-subtle)' };
      }
      const today = new Date(); today.setHours(0,0,0,0);
      const diffDays = Math.ceil((ff.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays <= 7 && diffDays >= 0) {
        return {
          text: diffDays === 0 ? '⚡ ¡Vence hoy!' : `⚡ ¡Últimos ${diffDays} días!`,
          isExpiringSoon: true,
          color: '#ef4444'
        };
      }
      const dateFmt = ff.toLocaleDateString('es-PA', { day: 'numeric', month: 'short', year: 'numeric' });
      return { text: `⏱️ Válido hasta ${dateFmt}`, isExpiringSoon: false, color: 'var(--text-subtle)' };
    } catch(e) {
      return { text: finStr, isExpiringSoon: false, color: 'var(--text-subtle)' };
    }
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

  function parseSafeDate(dateInput) {
    if (!dateInput) return null;
    if (dateInput instanceof Date) return isNaN(dateInput.getTime()) ? null : dateInput;
    if (typeof dateInput === 'number') {
      const d = new Date(dateInput);
      return isNaN(d.getTime()) ? null : d;
    }
    if (typeof dateInput === 'string') {
      const trimmed = dateInput.trim();
      if (!trimmed) return null;
      if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        const d = new Date(trimmed + 'T12:00:00');
        return isNaN(d.getTime()) ? null : d;
      }
      if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}/.test(trimmed)) {
        const d = new Date(trimmed.replace(' ', 'T'));
        return isNaN(d.getTime()) ? null : d;
      }
      const d = new Date(trimmed);
      return isNaN(d.getTime()) ? null : d;
    }
    return null;
  }

  function formatDateDisplay(dateStr) {
    const d = parseSafeDate(dateStr);
    if (!d) return dateStr ? String(dateStr) : '—';
    try {
      const formatted = d.toLocaleDateString('es-PA', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    } catch {
      return String(dateStr);
    }
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
    if (['get_client', 'get_promotions', 'get_terms', 'get_rewards', 'get_premios'].includes(action)) {
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
      if (action === 'get_rewards' || action === 'get_premios') return resolve({ success:true, rewards: DEMO_REWARDS.filter(isRewardActive) });
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
        const rawInput = (payload.cedula || '').toString().trim();
        const rawCed = rawInput.toUpperCase();
        const cleanCed = rawCed.replace(/[^A-Z0-9]/g, '');
        const searchEmail = rawInput.toLowerCase();
        
        const c = state.clients.find(x => {
          const xCed = (x.cedula || '').toString().trim().toUpperCase();
          const xCorreo = (x.correo || '').toString().trim().toLowerCase();
          
          if (xCorreo && xCorreo === searchEmail) return true;
          return xCed === rawCed || xCed.replace(/[^A-Z0-9]/g, '') === cleanCed;
        });
        if (!c) return resolve({ success:false, message:`No encontramos ningún miembro registrado con la identificación o correo: ${payload.cedula}` });
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
      loadMyCourses();
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
    if (tabName === 'rma') {
      setTimeout(() => {
        // Pre-llenar el email en el form manual si el usuario está logueado
        const emailInp = document.querySelector('#consultaForm input[name="email"]');
        if (emailInp && !emailInp.value && state.authUser && state.authUser.email) {
          emailInp.value = state.authUser.email;
        }
        // Cargar automáticamente los equipos activos del usuario logueado
        if (typeof window.loadUserActiveRmas === 'function') {
          window.loadUserActiveRmas();
        }
      }, 150);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════════
  // HELPER: DETECCIÓN Y FORMATEO DE ENLACES EXTERNOS VS INTERNOS
  // ══════════════════════════════════════════════════════════════════════════════

  function isExternalUrl(str) {
    if (!str || typeof str !== 'string') return false;
    const s = str.trim().toLowerCase();
    if (!s) return false;

    // Prefijos explícitos comunes
    if (s.startsWith('http://') || s.startsWith('https://')) return true;
    if (s.startsWith('www.') || s.startsWith('wa.me/')) return true;
    if (s.startsWith('ext:') || s.startsWith('url:') || s.startsWith('link:') || s.startsWith('odoo:')) return true;
    if (s.startsWith('/')) return true; // Ruta relativa hacia la web externa (Odoo)

    // Si coincide con alguna pestaña interna conocida o deeplink interno, NO es externa
    const internalTabs = ['home', 'inicio', 'puntos', 'agenda', 'promos', 'rma', 'asesoria', 'soporte', 'toolbox', 'toolbox-calculadora-almacenamiento', 'toolbox-conversor-tecnico', 'toolbox-calculadora-ups'];
    const prefix = s.split(':')[0].trim();
    if (internalTabs.includes(prefix)) return false;

    // Si tiene formato de dominio (ej: mgmpty.odoo.com, google.com, meet.google.com, zoom.us)
    if (/^[a-z0-9-]+(\.[a-z0-9-]+)+([/?#].*)?$/i.test(s)) return true;

    return false;
  }

  function formatExternalUrl(str) {
    if (!str || typeof str !== 'string') return '';
    let s = str.trim();
    if (!s) return '';

    // Remover prefijos explícitos si existen
    if (/^ext:/i.test(s)) s = s.substring(4).trim();
    else if (/^url:/i.test(s)) s = s.substring(4).trim();
    else if (/^link:/i.test(s)) s = s.substring(5).trim();
    else if (/^odoo:/i.test(s)) {
      const slug = s.substring(5).trim();
      return slug.startsWith('/') ? `https://mgmpty.odoo.com${slug}` : `https://mgmpty.odoo.com/${slug}`;
    }

    // Si empieza con /, anexar al dominio web de Odoo
    if (s.startsWith('/')) {
      return `https://mgmpty.odoo.com${s}`;
    }

    // Si ya tiene protocolo http o https
    if (/^https?:\/\//i.test(s)) {
      return s;
    }

    // Si es WhatsApp wa.me
    if (/^wa\.me\//i.test(s)) {
      return `https://${s}`;
    }

    // Por defecto para dominios directos (ej. mgmpty.odoo.com, www.sitio.com)
    return `https://${s}`;
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // DEEP LINK NAVIGATION — navigateTo(seccion)
  // Formato: 'tab' o 'tab:sub_o_id' — Ej: 'puntos:registro', 'agenda:EV001'
  // O Enlace Externo — Ej: 'https://mgmpty.odoo.com', 'mgmpty.odoo.com', 'wa.me/...'
  // ══════════════════════════════════════════════════════════════════════════════
  window.navigateTo = function(seccion) {
    if (!seccion) return;
    const trimmed = String(seccion).trim();
    if (!trimmed) return;

    // Si la sección es una URL externa (ej: enlace a Odoo, WhatsApp, Meet, web externa)
    if (isExternalUrl(trimmed)) {
      const finalUrl = formatExternalUrl(trimmed);
      window.open(finalUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    const parts = trimmed.split(':');
    const tab = parts[0].toLowerCase();
    const sub = parts[1] || null;

    // Cerrar cualquier modal abierto antes de navegar
    document.querySelectorAll('.app-modal.active').forEach(m => m.classList.remove('active'));

    // Navegar al tab principal
    if (tab === 'toolbox' && sub) {
        switchMainTab(tab + '-' + sub);
        return;
    } else {
        switchMainTab(tab);
    }

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
          // Intentar abrir; si no se encontró aún, reintentar (el fetch puede seguir corriendo)
          const found = state.agendaEvents.find(e =>
            String(e.id).toLowerCase().trim() === sub.toLowerCase().trim() ||
            String(e.id).toLowerCase().includes(sub.toLowerCase()) ||
            sub.toLowerCase().includes(String(e.id).toLowerCase().trim())
          );
          if (found || attempts >= 30) {
            openEventDetail(sub);
          } else {
            setTimeout(() => tryOpenEvent(attempts + 1), 300);
          }
        } else if (attempts < 50) {
          // Si todavía no hay eventos cargados, esperar más
          setTimeout(() => tryOpenEvent(attempts + 1), 300);
        } else {
          console.warn('[MGM] Deep link agenda: tiempo de espera agotado para id:', sub);
        }
      };
      // Iniciar con pequeño delay para dar tiempo al caché de renderizar
      setTimeout(() => tryOpenEvent(0), 200);
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

    // --- RMA: auto-llenar y buscar cuando viene número de RMA de notificación ---
    if (tab === 'rma' && sub) {
      setTimeout(() => {
        // Leer el email del QR si viene en la URL (?tab=rma&sub=RMA-...&email=...)
        const _rmaEmail = window._pendingRmaEmail
          || (state.authUser && state.authUser.email)
          || '';
        window._pendingRmaEmail = null; // consumir una sola vez
        if (typeof window.consultarRmaDirecto === 'function') {
          window.consultarRmaDirecto(sub, _rmaEmail);
        } else {
          // Fallback: solo llenar el campo
          const form = document.getElementById('consultaForm');
          if (form && form.rma) {
            form.rma.value = sub;
            if (_rmaEmail && form.email) form.email.value = _rmaEmail;
            form.rma.focus();
          }
        }
      }, 300);
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

  window.openAppModal = function(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.add('active');
  };

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

  async function setClientSession(clientData, eventType = 'login') {
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

    // 6. Consultar notificaciones y sincronizar eliminadas desde el backend PRIMERO
    await checkNotifications();

    // 7. Renderizar dashboard de puntos al instante
    renderDashboard(state.authUser);

    // 8. Detectar movimientos de puntos (acreditaciones, canjes/redenciones, ajustes del asesor)
    checkAndNotifyNewPoints(state.authUser, eventType);

    // 9. Consultar cursos/capacitaciones en los que está inscrito el usuario
    loadMyCourses();

    // 10. Actualizar catálogo de premios para reflejar puntos del usuario
    loadHomeRewards();

    // 11. Sincronizar foto de perfil desde el backend (siempre, para reflejar cambios de otros dispositivos)
    syncUserAvatarFromBackend(state.authUser.cedula);
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
      
      // Mostrar y pre-llenar código de referido si existe
      try {
        const refCode = sessionStorage.getItem('mgm_ref_code');
        const refGroup = document.getElementById('reg-referrer-group');
        const refInput = document.getElementById('reg-referrer-code');
        if (refCode && refGroup && refInput) {
          refInput.value = refCode;
          refGroup.style.display = 'block';
        }
      } catch (e) {}
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
      const avatarHtml = state.authUser.avatar
        ? `<div class="hab-avatar"><img src="${state.authUser.avatar}" alt="Avatar"></div>`
        : `<div class="hab-avatar">${inicial}</div>`;

      banner.innerHTML = `
        <div class="home-auth-banner-card auth" onclick="switchMainTab('puntos')">
          <div class="hab-left">
            ${avatarHtml}
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
    if (!cedula) { showAlert('puntos-login-alert', 'error', 'Por favor ingresa tu cédula o correo.'); return; }
    if (typeof window.showMgmLoader === 'function') window.showMgmLoader('Iniciando sesión...');
    const btn = e.target.querySelector('[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Consultando...';

    const res = await api('get_client', { cedula });
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Iniciar Sesión / Ver Mis Puntos';

    if (typeof window.hideMgmLoader === 'function') window.hideMgmLoader();

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
  function checkAndNotifyNewPoints(freshClient, eventType = 'auto') {
    if (!freshClient) return;
    
    let notifiedTxs = JSON.parse(localStorage.getItem(K_NOTIFIED_TX)) || [];
    const historico = freshClient.historico || [];
    if (historico.length === 0) return;

    // Si el dispositivo no tiene transacciones previas registradas (ej. inicio en nuevo dispositivo)
    const isNewDevice = notifiedTxs.length === 0;

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

      // Determinar si ya está en la lista de notificaciones o fue borrada por el usuario (sincronizada con backend)
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
          if (!isNewDevice) {
            liveAlerts.push({ type: alertType, tx, notif: notifObj, ptsNum, ptsAbs });
          }
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
    // 🎂 Cumpleaños — modal de regalo + notificación persistente en campanita
    if (bdayInfo.active) {
      // Lanzar modal automático UNA vez por sesión
      if (!sessionStorage.getItem('mgm_bday_modal')) {
        sessionStorage.setItem('mgm_bday_modal', '1');
        setTimeout(() => { if (typeof window.showBirthdayModal === 'function') window.showBirthdayModal(bdayInfo.isSundayMoved); }, 700);
      }
      // Inyectar notificación persistente en campanita (solo una vez por día)
      const todayKey = 'bday_' + new Date().toISOString().split('T')[0];
      if (!state.notifications.some(n => String(n.id) === todayKey)) {
        state.notifications.unshift({
          id: todayKey,
          type: 'bday',
          isSundayMoved: bdayInfo.isSundayMoved,
          title: bdayInfo.isSundayMoved ? '¡Feliz Cumpleaños! 🎉🎂 (Beneficio Domingo)' : '¡Feliz Cumpleaños! 🎉🎂',
          body: 'Toca aquí para ver tu regalo especial — 10% OFF hoy en MGM.',
          fecha: new Date().toISOString(),
        });
        localStorage.setItem(K_NOTIFS, JSON.stringify(state.notifications));
        if (typeof updateNotifBadge === 'function') updateNotifBadge();
      }
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

    // Cargar panel de referidos
    renderReferidosPanel(c.cedula, c.ref_code);
  }

  window.resetPuntosLogin = function() {
    logoutClient();
  };

  // Registro de nuevo cliente con Auto-Login inmediato y Tracking
  document.getElementById('form-puntos-register')?.addEventListener('submit', async e => {
    e.preventDefault();
    const data = {
      nombre:        document.getElementById('reg-nombre').value.trim(),
      cedula:        document.getElementById('reg-cedula').value.trim(),
      correo:        document.getElementById('reg-correo').value.trim(),
      telefono:      document.getElementById('reg-telefono').value.trim(),
      cumpleanos:    document.getElementById('reg-cumpleanos').value,
      referrer_code: document.getElementById('reg-referrer-code') ? document.getElementById('reg-referrer-code').value.trim() : ''
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
          enlace: p.enlace || p.link || p.url || '',
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
    const render = () => {
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
    };

    if (state.promos.length === 0) {
      const cached = localStorage.getItem('MGM_CACHE_PROMOS');
      if (cached) {
        try {
          state.promos = JSON.parse(cached);
          render();
        } catch(e) {}
      }
      
      fetchPromosFromGAS().then(fresh => {
        if (fresh && fresh.length > 0) {
          state.promos = fresh;
          localStorage.setItem('MGM_CACHE_PROMOS', JSON.stringify(fresh));
          render();
        }
      });
    } else {
      render();
    }
  }

  async function loadAllPromos() {
    if (state.promos.length === 0) {
      const cached = localStorage.getItem('MGM_CACHE_PROMOS');
      if (cached) {
        try {
          state.promos = JSON.parse(cached);
          renderPromosGallery();
        } catch(e) {}
      }
      
      const fresh = await fetchPromosFromGAS();
      if (fresh && fresh.length > 0) {
        state.promos = fresh;
        localStorage.setItem('MGM_CACHE_PROMOS', JSON.stringify(fresh));
        renderPromosGallery();
      }
    } else {
      renderPromosGallery();
    }
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
  // MÓDULO CATÁLOGO DE PREMIOS (CANJES POR PUNTOS)
  // ══════════════════════════════════════════════════════════════════════════════

  async function fetchRewardsFromGAS() {
    try {
      // Intentar primero vía GET al backend de puntos o URL dedicada
      let url = `${CFG.PREMIOS_GAS_URL}?action=get_rewards`;
      const res = await fetch(url);
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data.rewards || data.premios || []);
      if (Array.isArray(list) && list.length > 0) {
        return list.map((r, idx) => ({
          id:           r.id || ('REW_GAS_' + idx),
          nombre:       r.nombre || r.name || r.titulo || `Premio MGM #${idx + 1}`,
          modelo:       r.modelo || r.model || '',
          descripcion:  r.descripcion || r.desc || '',
          puntos:       parseInt(r.puntos || r.pts || r.puntos_costo || 0),
          imagen:       r.imagen || r.img || r.imagen_url || '',
          link:         r.link || r.url || r.enlace || r.ficha || '',
          fecha_inicio: r.fecha_inicio || '',
          fecha_fin:    r.fecha_fin || r.validez || '',
          activo:       r.activo || r.activa || 'SÍ',
          stock:        r.stock || 'Disponible'
        })).filter(isRewardActive);
      }
    } catch (err) {
      console.warn('Error al conectar con PREMIOS_GAS_URL vía GET, intentando fallback:', err);
    }

    const resApi = await api('get_rewards');
    return (resApi.success && resApi.rewards && resApi.rewards.length > 0)
      ? resApi.rewards.filter(isRewardActive)
      : DEMO_REWARDS.filter(isRewardActive);
  }

  window.loadHomeRewards = async function() {
    const render = () => {
      const slider = document.getElementById('home-premios-slider');
      if (!slider) return;

      if (!state.rewards || state.rewards.length === 0) {
        slider.innerHTML = `<div style="color: var(--text-muted); font-size: 12px; padding: 20px;">Próximamente nuevo catálogo de premios disponibles.</div>`;
        return;
      }

      slider.innerHTML = state.rewards.map((r, idx) => {
        const validez = formatRewardValidez(r);
        const ptsFormatted = Number(r.puntos || 0).toLocaleString('es-PA');

        return `
        <div class="premio-slide-card" onclick="openRewardDetail(${idx})">
          <div class="premio-card-img-wrap">
            ${r.imagen
              ? `<img src="${r.imagen}" alt="${r.nombre}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                 <div style="display:none; font-size:42px; color:#cbd5e1; align-items:center; justify-content:center; width:100%; height:100%;"><i class="fa-solid fa-gift"></i></div>`
              : `<div style="font-size:42px; color:#cbd5e1; display:flex; align-items:center; justify-content:center; width:100%; height:100%;"><i class="fa-solid fa-gift"></i></div>`
            }
            <div class="premio-pts-tag">
              <i class="fa-solid fa-coins"></i> ${ptsFormatted} Pts
            </div>
          </div>

          ${r.modelo ? `<div class="premio-model-tag">MOD. ${r.modelo}</div>` : ''}
          <div class="premio-card-title">${r.nombre}</div>
          <div class="premio-card-desc">${(r.descripcion || '').split('\n')[0]}</div>

          <div class="premio-card-footer">
            <div class="premio-validez-text" style="color:${validez.color};">
              ${validez.text}
            </div>
            <button class="premio-btn-action" onclick="event.stopPropagation(); openRewardDetail(${idx});">
              Canjear
            </button>
          </div>
        </div>`;
      }).join('');
    };

    if (!state.rewards || state.rewards.length === 0) {
      const cached = localStorage.getItem('MGM_CACHE_REWARDS');
      if (cached) {
        try {
          state.rewards = JSON.parse(cached);
          render();
        } catch(e) {}
      }
      
      fetchRewardsFromGAS().then(fresh => {
        if (fresh && fresh.length > 0) {
          state.rewards = fresh;
          localStorage.setItem('MGM_CACHE_REWARDS', JSON.stringify(fresh));
          render();
        }
      });
    } else {
      render();
    }
  };

  window.openRewardDetail = function(idx) {
    const r = state.rewards[idx];
    if (!r) return;
    state.activeRewardData = r;

    document.getElementById('modal-premio-title').textContent = r.nombre;
    document.getElementById('modal-premio-desc').textContent  = r.descripcion || 'Sin descripción detallada disponible.';
    
    const modelEl = document.getElementById('modal-premio-model');
    if (modelEl) {
      if (r.modelo) {
        modelEl.textContent = `MOD. ${r.modelo}`;
        modelEl.style.display = 'inline-block';
      } else {
        modelEl.style.display = 'none';
      }
    }

    const validez = formatRewardValidez(r);
    const valEl = document.getElementById('modal-premio-validez');
    if (valEl) {
      valEl.textContent = validez.text;
      valEl.style.color = validez.color || 'var(--text-muted)';
    }

    const stockEl = document.getElementById('modal-premio-stock');
    if (stockEl) {
      stockEl.textContent = r.stock || 'Disponible';
      stockEl.style.color = (r.stock && r.stock.toLowerCase().includes('agot')) ? '#dc2626' : '#16a34a';
      stockEl.style.background = (r.stock && r.stock.toLowerCase().includes('agot')) ? '#fef2f2' : '#f0fdf4';
    }

    const ptsBadge = document.getElementById('modal-premio-pts-badge');
    const ptsFormatted = Number(r.puntos || 0).toLocaleString('es-PA');
    const usdVal = (Number(r.puntos || 0) * CFG.VAL_PUNTO).toFixed(2);
    if (ptsBadge) {
      ptsBadge.innerHTML = `<i class="fa-solid fa-coins"></i> ${ptsFormatted} Pts <span style="font-size:11px; opacity:0.85; font-weight:700;">($${usdVal} USD)</span>`;
    }

    const imgWrap = document.getElementById('modal-premio-img-wrap');
    if (imgWrap) {
      if (r.imagen) {
        imgWrap.innerHTML = `
          <img id="modal-premio-img" src="${r.imagen}" alt="${r.nombre}" style="max-width:100%; max-height:100%; object-fit:contain;"
            onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
          <div style="display:none; font-size:60px; color:#cbd5e1; align-items:center; justify-content:center; width:100%; height:100%;"><i class="fa-solid fa-gift"></i></div>
        `;
      } else {
        imgWrap.innerHTML = `<div style="font-size:60px; color:#cbd5e1; display:flex; align-items:center; justify-content:center; width:100%; height:100%;"><i class="fa-solid fa-gift"></i></div>`;
      }
    }

    // Comparación dinámica con los puntos del usuario autenticado
    const statusBox = document.getElementById('modal-premio-user-status');
    if (statusBox) {
      if (state.authUser) {
        const userPts = parseInt(state.authUser.puntos) || 0;
        const requiredPts = parseInt(r.puntos) || 0;
        const diff = userPts - requiredPts;

        if (diff >= 0) {
          statusBox.style.background = '#f0fdf4';
          statusBox.style.borderColor = '#bbf7d0';
          statusBox.innerHTML = `
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:4px;">
              <span style="font-size:12px; color:#166534; font-weight:700;">Tu saldo disponible:</span>
              <strong style="font-size:14px; color:#15803d;">${userPts.toLocaleString('es-PA')} Pts</strong>
            </div>
            <div style="font-size:12.5px; color:#16a34a; font-weight:800;">
              🎉 ¡Te alcanza para canjear este premio! Te sobrarán ${diff.toLocaleString('es-PA')} Pts.
            </div>
          `;
        } else {
          statusBox.style.background = '#fffbeb';
          statusBox.style.borderColor = '#fde68a';
          statusBox.innerHTML = `
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:4px;">
              <span style="font-size:12px; color:#92400e; font-weight:700;">Tu saldo actual:</span>
              <strong style="font-size:14px; color:#b45309;">${userPts.toLocaleString('es-PA')} Pts</strong>
            </div>
            <div style="font-size:12.5px; color:#d97706; font-weight:700;">
              Te faltan <strong style="color:#b45309;">${Math.abs(diff).toLocaleString('es-PA')} Pts</strong> para alcanzar este premio. ¡Sigue acumulando en tus compras!
            </div>
          `;
        }
      } else {
        statusBox.style.background = 'var(--bg-surface)';
        statusBox.style.borderColor = 'var(--border-light)';
        statusBox.innerHTML = `
          <div style="display:flex; align-items:center; justify-content:space-between;">
            <span style="font-size:12px; color:var(--text-muted);">¿Tienes puntos acumulados?</span>
            <button onclick="closeAppModal('modal-premio-detail'); openLoginModal();" style="background:transparent; border:none; color:var(--primary-blue); font-weight:800; font-size:12px; cursor:pointer; text-decoration:underline;">
              Iniciar sesión →
            </button>
          </div>
        `;
      }
    }

    // Botón 'Ver en tienda': mostrar u ocultar según si hay link
    const btnTienda = document.getElementById('modal-premio-btn-tienda');
    if (btnTienda) {
      if (r.link) {
        btnTienda.href = r.link;
        btnTienda.style.display = 'inline-flex';
      } else {
        btnTienda.style.display = 'none';
      }
    }

    openAppModal('modal-premio-detail');
  };

  window.actionCanjearPremio = function() {
    const r = state.activeRewardData;
    if (!r) return;

    const clienteNombre = state.authUser ? state.authUser.nombre : 'Cliente MGM';
    const clienteCedula = state.authUser ? state.authUser.cedula : 'Por verificar';
    const clientePuntos = state.authUser ? (state.authUser.puntos || 0).toLocaleString('es-PA') : 'Por verificar';
    const usdEquiv = (Number(r.puntos || 0) * CFG.VAL_PUNTO).toFixed(2);

    const msg = `*MGM HUB | SOLICITUD DE CANJE DE PREMIO* 🎁\n\n` +
      `¡Hola equipo MGM! Deseo solicitar el canje de este producto con mis puntos:\n\n` +
      `• *Premio:* ${r.nombre}\n` +
      (r.modelo ? `• *Modelo:* ${r.modelo}\n` : '') +
      `• *Costo:* ${Number(r.puntos).toLocaleString('es-PA')} Pts (Eq. $${usdEquiv} USD)\n` +
      `• *Cliente:* ${clienteNombre}\n` +
      `• *Cédula:* ${clienteCedula}\n` +
      `• *Saldo en cuenta:* ${clientePuntos} Pts\n\n` +
      `¿Me confirman por favor la disponibilidad en sucursal y la entrega? ¡Muchas gracias!`;

    // Asesor 1 (+507 6454-1476)
    const phone = '50764541476';
    const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
  };

  window.sharePremio = function() {
    const r = state.activeRewardData;
    if (!r) return;
    const shareText = `🎁 ¡Mira este premio en MGM Hub! ${r.nombre} (${r.modelo || ''}) canjeable por ${Number(r.puntos).toLocaleString('es-PA')} MGM Puntos.`;
    const shareUrl = r.link || window.location.href;
    if (navigator.share) {
      navigator.share({
        title: r.nombre,
        text: shareText,
        url: shareUrl
      }).catch(()=>{});
    } else {
      navigator.clipboard.writeText(shareText + ' ' + window.location.href).then(() => {
        showToast('Enlace y detalle del premio copiado al portapapeles.', 'fa-solid fa-copy');
      });
    }
  };

  // ══════════════════════════════════════════════════════════════════════════════
  // MÓDULO AGENDA & CALENDARIO (AGENDA_GAS_URL)
  // ══════════════════════════════════════════════════════════════════════════════

  const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

  function formatEventUrl(rawLink) {
    if (!rawLink) return 'https://mgmpty.odoo.com/event';
    const trimmed = String(rawLink).trim();
    if (!trimmed) return 'https://mgmpty.odoo.com/event';
    
    // Si el enlace es solo un ID numérico de evento de Odoo (ej. '15')
    if (/^\d+$/.test(trimmed)) {
      return `https://mgmpty.odoo.com/event/${trimmed}/register`;
    }

    // Si ya tiene protocolo (https://, http://, wa.me, etc.) se respeta
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    // Si inicia con /, unimos con el dominio de Odoo
    if (trimmed.startsWith('/')) return `https://mgmpty.odoo.com${trimmed}`;
    
    // Agregar dominio a ruta relativa que viene en Columna L sin '/' inicial
    return `https://mgmpty.odoo.com/${trimmed}`;
  }

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
                    // Prioridad de ID: campo id del GAS (col A del Sheet) → fallback generado
                    const evId = (ev.id !== undefined && ev.id !== null && String(ev.id).trim() !== '')
                      ? String(ev.id).trim()
                      : `EV_${y}_${parseInt(m)+1}_${d}_${idx}`;
                    eventsList.push({
                      id: evId,
                      titulo: ev.title || 'Evento MGM',
                      categoria: (ev.type || 'training').toLowerCase(),
                      fecha: dateStr,
                      hora: ev.time || '10:00 AM',
                      duracion: '2h',
                      descripcion: ev.description || '',
                      costo: ev.price || 'Gratis',
                      lugar: ev.extra_2 || 'En línea',
                      cupos: ev.extra_1 || '20',
                      registro_url: formatEventUrl(ev.registro_url || ev.button_link || ev.link || ev.url || ev.formulario || ''),
                      button_text: ev.button_text || 'Reservar Cupo'
                    });
                  });
                }
              }
            }
          }
        } else {
          eventsList.push(...data.map((ev, idx) => ({
            id: ev.id || `EV_R_${idx}`,
            ...ev,
            registro_url: formatEventUrl(ev.registro_url || ev.button_link)
          })));
        }
        if (eventsList.length > 0) return eventsList;
      }
    } catch (err) {
      console.warn('Error consultando AGENDA_GAS_URL:', err);
    }
    return DEMO_EVENTS;
  }

  async function loadAgendaEvents() {
    const cached = localStorage.getItem('MGM_CACHE_EVENTS');
    if (cached) {
      try {
        state.agendaEvents = JSON.parse(cached);
        renderCalendar();
      } catch(e) {}
    }
    
    const fresh = await fetchEventsFromGAS();
    if (fresh && fresh !== DEMO_EVENTS) {
      state.agendaEvents = fresh;
      localStorage.setItem('MGM_CACHE_EVENTS', JSON.stringify(fresh));
      renderCalendar();
    } else if (!cached) {
      state.agendaEvents = DEMO_EVENTS;
      renderCalendar();
    }
  }

  async function loadHomeNextEvent() {
    const render = () => {
      const events = state.agendaEvents;
      const today = new Date(); today.setHours(0,0,0,0);
      const upcoming = events
        .filter(e => new Date(e.fecha + 'T00:00:00') >= today)
        .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

      const banner = document.getElementById('home-event-banner');
      if (!upcoming.length) {
        if (banner) banner.style.display = 'none';
        return;
      } else {
        if (banner) banner.style.display = '';
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
    };

    if (state.agendaEvents.length === 0) {
      const cached = localStorage.getItem('MGM_CACHE_EVENTS');
      if (cached) {
        try {
          state.agendaEvents = JSON.parse(cached);
          render();
        } catch(e) {}
      }
      
      fetchEventsFromGAS().then(fresh => {
        if (fresh && fresh !== DEMO_EVENTS) {
          state.agendaEvents = fresh;
          localStorage.setItem('MGM_CACHE_EVENTS', JSON.stringify(fresh));
          render();
        }
      });
    } else {
      render();
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
    const searchId = String(eventId).toLowerCase().trim();

    // 1) Coincidencia exacta por ID (case-insensitive)
    let ev = state.agendaEvents.find(e => String(e.id).toLowerCase().trim() === searchId);

    // 2) Coincidencia parcial: el ID del evento contiene el buscado o viceversa
    if (!ev) {
      ev = state.agendaEvents.find(e =>
        String(e.id).toLowerCase().includes(searchId) ||
        searchId.includes(String(e.id).toLowerCase().trim())
      );
    }

    // 3) Búsqueda por título (útil cuando el ID no viene del GAS)
    if (!ev) {
      ev = state.agendaEvents.find(e =>
        String(e.titulo).toLowerCase().includes(searchId)
      );
    }

    if (!ev) {
      console.warn('[MGM] openEventDetail: no se encontró evento con id:', eventId, '| eventos disponibles:', state.agendaEvents.map(e => e.id));
      return;
    }
    state.activeEventData = ev;

    document.getElementById('modal-event-cat').textContent   = ev.categoria?.toUpperCase() || 'EVENTO';
    document.getElementById('modal-event-title').textContent = ev.titulo;
    document.getElementById('modal-event-desc').textContent  = ev.descripcion;
    document.getElementById('modal-event-date').innerHTML    = `<strong>${formatDateDisplay(ev.fecha)}</strong>`;
    document.getElementById('modal-event-time').innerHTML    = `<strong>${ev.hora || '—'} (${ev.duracion || '—'})</strong>`;
    document.getElementById('modal-event-cost').innerHTML    = `<strong>${ev.costo || '—'}</strong>`;
    document.getElementById('modal-event-place').innerHTML   = `<strong>${ev.lugar || '—'}</strong>`;

    const btnReserve = document.getElementById('modal-event-btn-reserve');
    if (btnReserve) {
      btnReserve.href = formatEventUrl(ev.registro_url || ev.button_link);
      btnReserve.innerHTML = `<i class="fa-solid fa-ticket"></i> ${ev.button_text || 'Reservar Cupo'}`;
    }

    const deepLinkInput = document.getElementById('modal-event-deeplink-input');
    if (deepLinkInput) {
      deepLinkInput.value = `${window.location.origin}${window.location.pathname}?tab=agenda&id=${ev.id}`;
    }

    openAppModal('modal-event-detail');
  };

  window.copyEventDeepLink = function() {
    const input = document.getElementById('modal-event-deeplink-input');
    if (input) {
      navigator.clipboard.writeText(input.value).then(() => {
        if (typeof showToast === 'function') {
          showToast('¡Enlace directo copiado!', 'fa-solid fa-clipboard-check');
        }
      });
    }
  };

  window.openEventQR = function() {
    const ev = state.activeEventData;
    if (!ev) return;
    const url = formatEventUrl(ev.qr_url || ev.registro_url || ev.button_link);
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
    const url = formatEventUrl(ev.registro_url || ev.button_link);
    const text = `📅 ${ev.titulo}\n🗓️ ${formatDateDisplay(ev.fecha)} · ${ev.hora}\n📍 ${ev.lugar}\n\nRegistro: ${url}`;
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

  // ══════════════════════════════════════════════════════════════════════════════
  // MIS CAPACITACIONES INSCRITAS (Cuenta del Usuario con cuenta regresiva & Meet)
  // ══════════════════════════════════════════════════════════════════════════════

  async function loadMyCourses() {
    renderMyCourses(); // Renderizar lo que haya en caché inmediatamente

    if (!state.authUser || !state.authUser.cedula) return;
    if (CFG.NOTIFS_GAS_URL === 'URL_TEMPORAL_PENDIENTE') return;

    try {
      const res = await fetch(CFG.NOTIFS_GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'get_my_courses', cedula: state.authUser.cedula })
      }).then(r => r.json());

      if (res && res.success && Array.isArray(res.courses)) {
        state.myCourses = res.courses;
        localStorage.setItem(K_MY_COURSES, JSON.stringify(res.courses));
        renderMyCourses();
      }
    } catch(err) {
      console.warn('[MGM Hub] Error consultando mis capacitaciones:', err);
    }
  }

  function renderMyCourses() {
    const listEl = document.getElementById('my-courses-list');
    const countEl = document.getElementById('my-courses-count');
    if (!listEl) return;

    // Caso 1: Usuario no autenticado
    if (!state.authUser || !state.authUser.cedula) {
      if (countEl) countEl.style.display = 'none';
      listEl.innerHTML = `
        <div class="my-courses-unauth">
          <div class="my-courses-empty-icon"><i class="fa-solid fa-id-card" style="color: #6366f1;"></i></div>
          <div class="my-courses-empty-title">¿Ya te inscribiste a un curso?</div>
          <div class="my-courses-empty-desc">
            Inicia sesión con tu cédula en <strong>MGM Puntos</strong> para ver aquí tus cursos confirmados, enlaces a Google Meet y recordatorios en vivo.
          </div>
          <button class="btn-submit" onclick="switchMainTab('puntos')" style="margin-top: 14px; width: auto; padding: 9px 18px; font-size: 13px; display: inline-flex; align-items: center; gap: 6px;">
            <i class="fa-solid fa-arrow-right-to-bracket"></i> Iniciar Sesión con mi Cédula
          </button>
        </div>
      `;
      return;
    }

    // Caso 2: Autenticado pero sin cursos inscritos
    if (!state.myCourses || state.myCourses.length === 0) {
      if (countEl) countEl.style.display = 'none';
      listEl.innerHTML = `
        <div class="my-courses-empty">
          <div class="my-courses-empty-icon">📅</div>
          <div class="my-courses-empty-title">Aún no tienes cursos inscritos</div>
          <div class="my-courses-empty-desc">
            Elige una capacitación en el calendario de arriba y toca <strong>"Reservar Cupo"</strong> para registrarte. Tus eventos aparecerán aquí automáticamente.
          </div>
        </div>
      `;
      return;
    }

    // Caso 3: Tiene cursos inscritos
    if (countEl) {
      countEl.textContent = state.myCourses.length;
      countEl.style.display = 'inline-flex';
    }

    const ahora = new Date();

    listEl.innerHTML = state.myCourses.map(course => {
      const fechaEv = parseSafeDate(course.fecha);
      const isFechaValida = !!fechaEv;
      
      let countdownHtml = '';

      if (isFechaValida) {
        const diffMs = fechaEv.getTime() - ahora.getTime();
        const diffHoras = diffMs / (1000 * 60 * 60);
        const diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        if (diffMs <= 0 && diffMs > -7200000) {
          countdownHtml = `<div class="my-course-countdown-pill days-live"><i class="fa-solid fa-satellite-dish"></i> ¡EN VIVO AHORA!</div>`;
        } else if (diffMs <= -7200000) {
          countdownHtml = `<div class="my-course-countdown-pill days-past"><i class="fa-solid fa-check"></i> Evento Finalizado</div>`;
        } else if (diffHoras < 1) {
          const minRestantes = Math.max(1, Math.round(diffMs / 60000));
          countdownHtml = `<div class="my-course-countdown-pill days-today"><i class="fa-solid fa-bell"></i> ¡Inicia en ${minRestantes} min!</div>`;
        } else if (diffHoras < 24) {
          countdownHtml = `<div class="my-course-countdown-pill days-today"><i class="fa-solid fa-fire"></i> ¡HOY a las ${formatEventTime(course.fecha)}!</div>`;
        } else if (diffDias === 1) {
          countdownHtml = `<div class="my-course-countdown-pill days-soon"><i class="fa-solid fa-clock"></i> Mañana a las ${formatEventTime(course.fecha)}</div>`;
        } else if (diffDias <= 3) {
          countdownHtml = `<div class="my-course-countdown-pill days-soon"><i class="fa-solid fa-hourglass-half"></i> Faltan ${diffDias} días</div>`;
        } else {
          countdownHtml = `<div class="my-course-countdown-pill days-normal"><i class="fa-regular fa-calendar"></i> Faltan ${diffDias} días</div>`;
        }
      }

      const meetBtnHtml = course.meet ? `
        <a href="${course.meet}" target="_blank" class="btn-meet-join">
          <i class="fa-solid fa-video"></i> Entrar a Google Meet
        </a>
      ` : `
        <button class="btn-meet-join" onclick="showToast('Enlace de Meet disponible próximamente', 'fa-solid fa-circle-info')">
          <i class="fa-solid fa-circle-info"></i> Enlace disponible pronto
        </button>
      `;

      return `
        <div class="my-course-card">
          <div class="my-course-top-row">
            <span class="my-course-badge-enrolled">
              <i class="fa-solid fa-circle-check"></i> Cupo Confirmado
            </span>
            ${course.codigo ? `<span class="my-course-code" title="Código de registro">${course.codigo}</span>` : ''}
          </div>

          <div class="my-course-title">${course.nombre}</div>

          <div class="my-course-meta-row">
            <div class="my-course-meta-item">
              <i class="fa-solid fa-calendar-day" style="color: var(--primary-blue);"></i>
              <span>${formatDateDisplay(course.fecha)}</span>
            </div>
            ${isFechaValida ? `
            <div class="my-course-meta-item">
              <i class="fa-solid fa-clock" style="color: var(--text-muted);"></i>
              <span>${formatEventTime(course.fecha)}</span>
            </div>` : ''}
          </div>

          ${countdownHtml}

          <div class="my-course-actions-row">
            ${meetBtnHtml}
            ${course.meet ? `
            <button class="btn-course-action-icon" onclick="copyEventMeet('${course.meet}')" title="Copiar enlace de Meet">
              <i class="fa-regular fa-copy"></i>
            </button>` : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  function formatEventTime(fechaStr) {
    const d = parseSafeDate(fechaStr);
    if (!d) return '09:00 AM';
    try {
      return d.toLocaleTimeString('es-PA', { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch(e) {
      return '09:00 AM';
    }
  }

  window.copyEventMeet = function(url) {
    if (!url) return;
    navigator.clipboard.writeText(url).then(() => {
      showToast('¡Enlace de Meet copiado!', 'fa-solid fa-clipboard-check');
    });
  };

  window.handlePromoLinkClick = function(event, enlace) {
    if (!enlace) return;
    try {
      const url = new URL(enlace);
      if (url.searchParams.has('tab') && (url.hostname.includes('github.io') || url.hostname.includes('mgmpty') || url.pathname.includes('index.html'))) {
        event.preventDefault();
        event.stopPropagation();
        const tab = url.searchParams.get('tab');
        
        if (typeof closeCopySheet === 'function') closeCopySheet();
        if (typeof closePromoDetail === 'function') closePromoDetail();
        if (typeof switchMainTab === 'function') switchMainTab(tab);
        return;
      }
    } catch(e) {}
    event.stopPropagation();
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
          ${p.enlace ? `<a href="${p.enlace}" target="_blank" class="cli-feed-link-btn" onclick="handlePromoLinkClick(event, '${p.enlace}')"><i class="fa-solid fa-link"></i> Ver enlace</a>` : ''}
          <button class="cli-feed-more-btn" onclick="openCopySheet('${p.id}', '${encodeURIComponent(p.nombre)}', '${encodeURIComponent(p.descripcion || '')}', '${p.fecha_inicio || ''}', '${p.fecha_fin || ''}', '${encodeURIComponent(p.enlace || '')}')">...más</button>
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
            onclick="openCopySheet('${p.id}', '${encodeURIComponent(p.nombre)}', '${encodeURIComponent(p.descripcion || '')}', '${p.fecha_inicio || ''}', '${p.fecha_fin || ''}', '${encodeURIComponent(p.enlace || '')}')">
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

  window.openCopySheet = function(id, encTitle, encDesc, fi, ff, encEnlace) {
    _activeCopyPromoId = id;
    document.getElementById('cli-copy-title').textContent = decodeURIComponent(encTitle);
    document.getElementById('cli-copy-desc').textContent  = decodeURIComponent(encDesc);
    
    const enlaceDecoded = encEnlace ? decodeURIComponent(encEnlace) : '';
    const linkEl = document.getElementById('cli-copy-link');
    if (linkEl) {
      if (enlaceDecoded) {
        linkEl.href = enlaceDecoded;
        linkEl.onclick = (e) => handlePromoLinkClick(e, enlaceDecoded);
        linkEl.style.display = 'inline-flex';
      } else {
        linkEl.style.display = 'none';
        linkEl.onclick = null;
      }
    }

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
    const tracks = CFG.AUDIO_TRACKS;
    if (!tracks || !tracks.length || !audioEl) {
      if (audioBar) audioBar.classList.add('hidden');
      return;
    }

    state.audioTrackIndex = ((idx % tracks.length) + tracks.length) % tracks.length;
    const track = tracks[state.audioTrackIndex];

    if (track && track.src) {
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
    } else {
      if (audioBar) audioBar.classList.add('hidden');
    }
  }

  async function fetchAudioPlaylist() {
    try {
      const res = await fetch(CFG.AUDIO_GAS_URL);
      const data = await res.json();
      const rawList = Array.isArray(data) ? data : (data && Array.isArray(data.value) ? data.value : []);

      if (Array.isArray(rawList) && rawList.length > 0) {
        const mapped = rawList.map(t => ({
          title: t.title || t.titulo || t.nombre || 'MGM Audio',
          artist: t.artist || t.artista || 'MGM Radio',
          src: t.url || t.src || t.audio_url || t.audio || t.link || '',
          cover: t.cover || t.imagen || t.img || 'https://mgmpty.odoo.com/web/image/68369-dbd5e226/Logo%20MGM.png'
        })).filter(t => t.src);

        if (mapped.length > 0) {
          CFG.AUDIO_TRACKS = mapped;
          loadTrack(0);
          return;
        }
      }

      // Si no hay pistas válidas en el GAS, dejar vacío y ocultar completamente el reproductor
      CFG.AUDIO_TRACKS = [];
      if (audioBar) audioBar.classList.add('hidden');
      if (audioEl) {
        audioEl.pause();
        audioEl.src = '';
      }
    } catch (err) {
      console.warn('Audio GAS fetch error / sin pistas:', err);
      CFG.AUDIO_TRACKS = [];
      if (audioBar) audioBar.classList.add('hidden');
      if (audioEl) {
        audioEl.pause();
        audioEl.src = '';
      }
    }
  }

  document.getElementById('audio-btn-play')?.addEventListener('click', () => {
    const tracks = CFG.AUDIO_TRACKS;
    if (!audioEl || !tracks || !tracks.length) return;

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
      updateAuthModalProfile();
      
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
    // La bienvenida se gestiona de forma centralizada y única en el backend de Google Sheets (WELCOME_<CEDULA>)
    // Se recibe sincronizada automáticamente vía checkNotifications() y se emite solo una vez.
  }

  window.logoutClient = function() {
    state.authUser = null;
    localStorage.removeItem(K_AUTH);
    state.myCourses = [];
    localStorage.removeItem(K_MY_COURSES);
    renderMyCourses();
    // Limpiar completamente las notificaciones al cerrar sesión
    state.notifications = [];
    localStorage.setItem(K_NOTIFS, '[]');
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
      if (state.authUser.avatar) {
        btn.innerHTML = `<img src="${state.authUser.avatar}" alt="Avatar" class="header-user-avatar">`;
        btn.style.padding = '0';
        btn.style.border = '2px solid #0ea5e9';
      } else {
        btn.innerHTML = `<span style="font-weight:800;font-size:14px;color:#0ea5e9;">${state.authUser.nombre.charAt(0).toUpperCase()}</span>`;
        btn.style.padding = '';
        btn.style.border = '2px solid #0ea5e9';
      }
    } else {
      btn.innerHTML = `<i class="fa-regular fa-user"></i>`;
      btn.style.padding = '';
      btn.style.border = '';
    }
  }

  // Sincronizar datos y foto en el modal de perfil
  function updateAuthModalProfile() {
    if (!state.authUser) return;
    const initEl = document.getElementById('auth-initials');
    const imgEl = document.getElementById('auth-avatar-img');
    const nameEl = document.getElementById('auth-name');
    const cedEl = document.getElementById('auth-cedula');
    const ptosEl = document.getElementById('auth-puntos');

    if (nameEl) nameEl.textContent = state.authUser.nombre || '---';
    if (cedEl) cedEl.textContent = state.authUser.cedula ? `Cédula: ${state.authUser.cedula}` : '---';
    if (ptosEl) ptosEl.textContent = (state.authUser.puntos || 0).toLocaleString('es-PA');

    if (state.authUser.avatar) {
      if (imgEl) {
        imgEl.src = state.authUser.avatar;
        imgEl.style.display = 'block';
      }
      if (initEl) initEl.style.display = 'none';
    } else {
      if (initEl) {
        initEl.textContent = (state.authUser.nombre || 'M').charAt(0).toUpperCase();
        initEl.style.display = 'flex';
      }
      if (imgEl) imgEl.style.display = 'none';
    }
  }

  /**
   * Comprime y recorta la imagen en el cliente para que pese lo mínimo posible (~15KB - 25KB)
   * Recorte centrado 1:1, resolución 256x256 px, compresión JPEG 80%.
   */
  function compressAndCropAvatar(file, targetSize = 256, quality = 0.8) {
    return new Promise((resolve, reject) => {
      if (!file || !file.type.startsWith('image/')) {
        return reject(new Error('Por favor selecciona un archivo de imagen válido (JPG, PNG, WebP).'));
      }
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('No se pudo leer el archivo seleccionado.'));
      reader.onload = e => {
        const img = new Image();
        img.onerror = () => reject(new Error('Error al procesar la imagen seleccionada.'));
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = targetSize;
            canvas.height = targetSize;
            const ctx = canvas.getContext('2d');

            // Recorte cuadrado centrado 1:1 para evitar deformaciones
            const minDim = Math.min(img.width, img.height);
            const sx = (img.width - minDim) / 2;
            const sy = (img.height - minDim) / 2;

            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, targetSize, targetSize);

            // Generar JPEG comprimido
            const dataUrl = canvas.toDataURL('image/jpeg', quality);
            resolve(dataUrl);
          } catch (err) {
            reject(err);
          }
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  /**
   * Manejador de subida de avatar disparado desde el modal de perfil
   */
  window.handleAvatarSelected = async function(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    if (!state.authUser) {
      alert('Debes iniciar sesión para actualizar tu foto de perfil.');
      return;
    }

    const feedbackEl = document.getElementById('avatar-upload-feedback');
    const imgEl = document.getElementById('auth-avatar-img');
    const initEl = document.getElementById('auth-initials');

    if (feedbackEl) {
      feedbackEl.style.display = 'block';
      feedbackEl.style.background = '#f0f9ff';
      feedbackEl.style.color = '#0284c7';
      feedbackEl.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Optimizando foto de perfil...';
    }

    try {
      // 1. Tratamiento y compresión en cliente a peso mínimo (~20KB)
      const compressedDataUrl = await compressAndCropAvatar(file, 256, 0.8);

      // 2. Feedback inmediato en toda la interfaz (0ms de latencia)
      if (imgEl) {
        imgEl.src = compressedDataUrl;
        imgEl.style.display = 'block';
      }
      if (initEl) initEl.style.display = 'none';

      state.authUser.avatar = compressedDataUrl;
      localStorage.setItem(K_AUTH, JSON.stringify(state.authUser));

      updateHeaderUserIcon();
      updateHomeAuthBanner();

      if (feedbackEl) {
        feedbackEl.style.background = '#f0fdf4';
        feedbackEl.style.color = '#15803d';
        feedbackEl.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Guardando...';
      }

      // 3. Envío al backend de Google Apps Script (Carpeta Drive 1wKgyYIkGVUWz25DC9P56uTx9Pr92dsxb)
      const cedula = (state.authUser.cedula || '').toString().trim();
      const payload = {
        action: 'upload_avatar',
        cedula: cedula,
        nombre: state.authUser.nombre || '',
        base64: compressedDataUrl
      };

      let targetUrl = CFG.NOTIFS_GAS_URL;
      if (!targetUrl || targetUrl === 'URL_TEMPORAL_PENDIENTE') {
        targetUrl = CFG.PUNTOS_GAS_URL;
      }

      try {
        const res = await fetch(targetUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload)
        });
        const json = await res.json();
        if (json && json.success && (json.avatarUrl || json.viewUrl)) {
          state.authUser.avatarDriveUrl = json.avatarUrl || json.viewUrl;
          localStorage.setItem(K_AUTH, JSON.stringify(state.authUser));
        }
      } catch (uploadErr) {
        console.warn('Aviso: guardado local completado; sincronización en segundo plano con Drive pendiente:', uploadErr);
      }

      if (feedbackEl) {
        feedbackEl.style.background = '#f0fdf4';
        feedbackEl.style.color = '#15803d';
        feedbackEl.innerHTML = '✅ ¡Foto de perfil guardada exitosamente!';
        setTimeout(() => {
          if (feedbackEl) feedbackEl.style.display = 'none';
        }, 3500);
      }

    } catch (err) {
      console.error('Error al actualizar avatar:', err);
      if (feedbackEl) {
        feedbackEl.style.background = '#fef2f2';
        feedbackEl.style.color = '#b91c1c';
        feedbackEl.innerHTML = '❌ ' + (err.message || 'Error al procesar la imagen');
      }
    } finally {
      event.target.value = '';
    }
  };

  /**
   * Sincroniza la foto de perfil desde el backend de Notificaciones.
   * Siempre sobrescribe el caché local con la versión del servidor,
   * para que los cambios hechos en PC aparezcan en el móvil y viceversa.
   */
  async function syncUserAvatarFromBackend(cedula) {
    if (!cedula || !CFG.NOTIFS_GAS_URL || CFG.NOTIFS_GAS_URL === 'URL_TEMPORAL_PENDIENTE') return;
    try {
      const res = await fetch(`${CFG.NOTIFS_GAS_URL}?action=get_avatar&cedula=${encodeURIComponent(cedula)}`);
      const data = await res.json();
      if (data && data.success && data.avatarUrl) {
        if (state.authUser && state.authUser.cedula === cedula) {
          // Actualizar tanto avatar (para display inmediato) como avatarDriveUrl (persistencia)
          state.authUser.avatar = data.avatarUrl;
          state.authUser.avatarDriveUrl = data.avatarUrl;
          localStorage.setItem(K_AUTH, JSON.stringify(state.authUser));
          updateHeaderUserIcon();
          updateHomeAuthBanner();
          updateAuthModalProfile();
        }
      }
    } catch(err) {
      console.warn('[MGM] Sincronización de avatar no disponible:', err);
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
  function fireNativeNotif(title, body, targetUrl) {
    if (Notification.permission !== 'granted') return;
    try {
      const options = {
        body,
        icon: 'https://mgmpty.odoo.com/web/image/68369-dbd5e226/Logo%20MGM.png',
        badge: 'https://mgmpty.odoo.com/web/image/68369-dbd5e226/Logo%20MGM.png',
        vibrate: [200, 100, 200],
        data: { url: targetUrl || '' }
      };

      // Service Worker notification (funciona en móvil como PWA)
      if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then(reg => {
          reg.showNotification(title, options);
        }).catch(() => {
          const notif = new Notification(title, options);
          if (targetUrl) {
            notif.onclick = () => { window.focus(); navigateTo(targetUrl); notif.close(); };
          }
        });
      } else {
        const notif = new Notification(title, options);
        if (targetUrl) {
          notif.onclick = () => { window.focus(); navigateTo(targetUrl); notif.close(); };
        }
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
      const email  = (state.authUser && state.authUser.email) ? state.authUser.email : '';
      const nombre = (state.authUser && state.authUser.nombre) ? state.authUser.nombre : '';
      const res = await fetch(CFG.NOTIFS_GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'get_notifications', cedula, email, nombre })
      }).then(r => r.json());

      if (res.success) {
        let hasChanged = false;

        // 1. Sincronizar IDs borrados en otros dispositivos
        if (Array.isArray(res.clearedIds)) {
          let newCleared = false;
          res.clearedIds.forEach(id => {
            const sId = String(id);
            if (!state.clearedNotifs.includes(sId)) {
              state.clearedNotifs.push(sId);
              newCleared = true;
            }
          });
          if (newCleared) {
            localStorage.setItem(K_CLEARED_NOTIFS, JSON.stringify(state.clearedNotifs));
          }
        }

        // 2. Sincronizar eliminaciones: descartar cualquier notificación local que esté en clearedNotifs
        // o que ya no exista en el servidor (salvo transacciones de puntos no borradas)
        const serverIds = Array.isArray(res.notifications) ? res.notifications.map(n => String(n.id)) : [];
        const originalLength = state.notifications.length;
        state.notifications = state.notifications.filter(localNotif => {
          const localId = String(localNotif.id);
          if (state.clearedNotifs.includes(localId)) return false;
          if (localId.startsWith('pts_')) return true; // Mantener puntos si no fueron borrados
          return serverIds.includes(localId);  // Mantener del server solo si sigue activa
        });
        
        if (state.notifications.length !== originalLength) {
          hasChanged = true;
        }

        // Agregar nuevas notificaciones o actualizar existentes
        res.notifications.forEach(rawN => {
        // Normalizar campos: el GAS puede devolver titulo/mensaje o title/body, y seccion/url/enlace/link
          // Si no viene fecha, la extraemos del timestamp embebido en el ID (ej: RMA-2026-0018-1726344000000)
          let parsedDate = rawN.date || rawN.fecha || '';
          if (parsedDate) {
            const d = new Date(parsedDate);
            if (!isNaN(d.getTime())) {
              const yyyy = d.getFullYear();
              const mm = String(d.getMonth() + 1).padStart(2, '0');
              const dd = String(d.getDate()).padStart(2, '0');
              const hh = String(d.getHours()).padStart(2, '0');
              const min = String(d.getMinutes()).padStart(2, '0');
              parsedDate = `${yyyy}-${mm}-${dd} ${hh}:${min}`;
            }
          } else {
            const tsMatch = String(rawN.id || '').match(/-(\d{10,13})$/);
            const d = tsMatch ? new Date(parseInt(tsMatch[1]).toString().length <= 10 ? parseInt(tsMatch[1]) * 1000 : parseInt(tsMatch[1])) : new Date();
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            const hh = String(d.getHours()).padStart(2, '0');
            const min = String(d.getMinutes()).padStart(2, '0');
            parsedDate = `${yyyy}-${mm}-${dd} ${hh}:${min}`;
          }
          const n = {
            id:      rawN.id,
            title:   rawN.title   || rawN.titulo  || '',
            body:    rawN.body    || rawN.mensaje  || '',
            date:    parsedDate,
            seccion: (rawN.seccion || rawN.enlace || rawN.url || rawN.link || '').trim(),
            url:     (rawN.url || rawN.enlace || rawN.link || '').trim(),
            fecha_inicio: rawN.fecha_inicio || rawN.inicio || '',
            fecha_fin:    rawN.fecha_fin || rawN.fin || rawN.expiracion || ''
          };

          const stringId = String(n.id);
          const alreadyExists = state.notifications.some(existing => String(existing.id) === stringId);
          const isCleared = state.clearedNotifs.includes(stringId);

          if (!alreadyExists && !isCleared) {
            state.notifications.unshift(n);
            hasChanged = true;
            
            // Solo disparar toast/nativo si nunca lo hemos visto en este dispositivo
            if (!state.seenNotifs.includes(stringId)) {
              state.seenNotifs.push(stringId);
              localStorage.setItem(K_SEEN_NOTIFS, JSON.stringify(state.seenNotifs));
              
              // Disparar notificación nativa del sistema
              fireNativeNotif(n.title || 'MGM', n.body || '', n.seccion || n.url || '');
              // Mostrar Toast visual en la app
              if (typeof showToast === 'function') {
                showToast(n.title || 'Nueva notificación de MGM', 'fa-solid fa-bell');
              }
            }
          } else if (alreadyExists) {
            // Actualizar si hay cambios en el texto o destino
            const existingIdx = state.notifications.findIndex(existing => String(existing.id) === stringId);
            if (existingIdx !== -1) {
              const existingNotif = state.notifications[existingIdx];
              if (existingNotif.title !== n.title || existingNotif.body !== n.body || existingNotif.seccion !== n.seccion || existingNotif.url !== n.url) {
                state.notifications[existingIdx] = n;
                hasChanged = true;
              }
            }
          }
        });

        // Helper para parsear fechas robustamente (soporta YYYY-MM-DD, DD/MM/YYYY, y fechas ISO UTC)
        const parseDateRobust = (dateStr, isEnd) => {
          let str = String(dateStr || '').trim().split(' ')[0].split('T')[0];
          if (!str) return null;
          // Si viene en formato DD/MM/YYYY, convertirlo a YYYY-MM-DD
          if (str.includes('/')) {
            const parts = str.split('/');
            if (parts.length === 3 && parts[0].length <= 2) {
              str = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
            }
          }
          return new Date(str + (isEnd ? 'T23:59:59' : 'T00:00:00'));
        };

        const todayForNotifs = new Date();
        const finalLength = state.notifications.length;
        state.notifications = state.notifications.filter(n => {
          if (n.fecha_inicio) {
            const fi = parseDateRobust(n.fecha_inicio, false);
            if (fi && !isNaN(fi.getTime()) && todayForNotifs < fi) return false;
          }
          if (n.fecha_fin) {
            const ff = parseDateRobust(n.fecha_fin, true);
            if (ff && !isNaN(ff.getTime()) && todayForNotifs > ff) return false;
          }
          return true;
        });
        
        if (state.notifications.length !== finalLength) {
          hasChanged = true;
        }

        // Ordenar: más recientes primero (por fecha parseada, fallback al ID)
        state.notifications.sort((a, b) => {
          const parseForSort = (d) => {
            if (!d) return 0;
            const parsed = new Date(String(d).replace(/^(\d{2})\/(\d{2})\/(\d{4})/, '$3-$2-$1'));
            return isNaN(parsed.getTime()) ? 0 : parsed.getTime();
          };
          return parseForSort(b.date) - parseForSort(a.date);
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

  // Añadir notificación local (ej. Evaluación RMA)
  window.addLocalNotification = function(notif) {
    const stringId = String(notif.id);
    const alreadyExists = state.notifications.some(n => String(n.id) === stringId);
    if (!alreadyExists && !state.clearedNotifs.includes(stringId)) {
      state.notifications.unshift({
        id: notif.id,
        title: notif.title,
        body: notif.message,
        date: new Date().toISOString(),
        seccion: notif.seccion || '',
        url: ''
      });
      localStorage.setItem(K_NOTIFS, JSON.stringify(state.notifications));
      renderNotifications();
      updateNotifBadge();
    }
  };

  // Limpiar cola de mensajes (Borrar todos) — abre modal elegante
  window.clearNotifications = function() {
    if (state.notifications.length === 0) return;
    // Abre el modal de confirmación elegante (en lugar del confirm() nativo)
    const modal = document.getElementById('modal-confirm-clear');
    if (modal) {
      modal.classList.add('active');
    }
  };

  // Borrado individual de una sola notificación (una a la vez) con sincronización multidispositivo
  window.dismissNotification = function(notifId, e) {
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }
    const stringId = String(notifId);

    // Remover del estado local
    state.notifications = state.notifications.filter(n => String(n.id) !== stringId);
    if (!state.clearedNotifs.includes(stringId)) {
      state.clearedNotifs.push(stringId);
    }
    localStorage.setItem(K_CLEARED_NOTIFS, JSON.stringify(state.clearedNotifs));
    localStorage.setItem(K_NOTIFS, JSON.stringify(state.notifications));
    renderNotifications();
    updateNotifBadge();

    // Sincronizar borrado con el backend para que los demás dispositivos no la muestren
    if (state.authUser && state.authUser.cedula &&
        CFG.NOTIFS_GAS_URL && CFG.NOTIFS_GAS_URL !== 'URL_TEMPORAL_PENDIENTE') {
      fetch(CFG.NOTIFS_GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'clear_notifications',
          cedula: state.authUser.cedula,
          notifIds: [stringId]
        })
      }).catch(err => console.warn('[MGM] Error sincronizando borrado individual:', err));
    }
  };

  // Ejecuta el borrado masivo real (llamado desde el botón "Eliminar" del modal)
  window.confirmClearNotifications = function() {
    // Cerrar el modal de confirmación
    const modal = document.getElementById('modal-confirm-clear');
    if (modal) modal.classList.remove('active');

    // Recopilar TODOS los IDs antes de limpiar el array para sincronizar borrado completo
    const idsToClear = state.notifications.map(n => String(n.id));
    if (idsToClear.length === 0) return;

    // Guardar las IDs borradas localmente para que no vuelvan a aparecer del backend
    idsToClear.forEach(stringId => {
      if (!state.clearedNotifs.includes(stringId)) {
        state.clearedNotifs.push(stringId);
      }
    });
    localStorage.setItem(K_CLEARED_NOTIFS, JSON.stringify(state.clearedNotifs));

    state.notifications = [];
    localStorage.setItem(K_NOTIFS, JSON.stringify(state.notifications));
    renderNotifications();
    updateNotifBadge();

    // Sincronizar borrado masivo con el backend para que otros dispositivos no vean estas notificaciones
    if (state.authUser && state.authUser.cedula &&
        CFG.NOTIFS_GAS_URL && CFG.NOTIFS_GAS_URL !== 'URL_TEMPORAL_PENDIENTE') {
      fetch(CFG.NOTIFS_GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'clear_notifications',
          cedula: state.authUser.cedula,
          notifIds: idsToClear
        })
      }).catch(err => console.warn('[MGM] No se pudo sincronizar borrado masivo de notificaciones:', err));
    }
  };

  // Manejador centralizado y seguro para el clic en notificaciones
  window.handleNotificationClick = function(notifId) {
    const notif = state.notifications.find(item => String(item.id) === String(notifId));
    if (!notif) return;

    // Notificación de cumpleaños → abrir modal especial con confeti
    if (notif.type === 'bday' || String(notifId).startsWith('bday_')) {
      closeAppModal('modal-notifications');
      if (typeof window.showBirthdayModal === 'function') window.showBirthdayModal(notif.isSundayMoved);
      return;
    }

    const target = (notif.seccion || notif.url || '').trim();
    if (target) {
      closeAppModal('modal-notifications');
      navigateTo(target);
    }
  };

  // Modal de cumpleaños: mensaje personalizado + confeti
  window.showBirthdayModal = function(isSundayMoved) {
    const textEl = document.getElementById('modal-birthday-text');
    if (textEl) {
      textEl.innerHTML = isSundayMoved
        ? 'Como tu cumpleaños cayó domingo, <strong>¡hoy lunes es tu día especial!</strong> Tienes un <strong>10% de descuento en todas tus compras hoy</strong> en nuestras sucursales de MGM.'
        : '¡Hoy es tu día especial! Queremos celebrarlo contigo otorgándote un <strong>10% de descuento en todas tus compras hoy</strong> en nuestras sucursales de MGM.';
    }
    openAppModal('modal-birthday');
    setTimeout(() => { if (typeof mgmConfetti !== 'undefined' && mgmConfetti.birthday) mgmConfetti.birthday(); }, 400);
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
      puntos:   { icon: 'fa-star',          color: '#f59e0b', badgeText: '⭐ Puntos',  badgeBg: '#fef3c7', badgeTxt: '#b45309' },
      agenda:   { icon: 'fa-calendar-days', color: '#6366f1', badgeText: '📅 Agenda',  badgeBg: '#ede9fe', badgeTxt: '#5b21b6' },
      promos:   { icon: 'fa-fire',          color: '#ef4444', badgeText: '🔥 Promo',   badgeBg: '#fee2e2', badgeTxt: '#b91c1c' },
      rma:      { icon: 'fa-screwdriver-wrench', color: '#0f766e', badgeText: '🔧 Mi RMA', badgeBg: '#ccfbf1', badgeTxt: '#0f766e' },
      external: { icon: 'fa-arrow-up-right-from-square', color: '#005bbb', badgeText: '🌐 MGM Web ↗', badgeBg: '#e8f1ff', badgeTxt: '#005bbb' },
      default:  { icon: 'fa-circle-info',   color: '#0ea5e9', badgeText: null,         badgeBg: null,      badgeTxt: null      }
    };

    list.innerHTML = state.notifications.map(n => {
      // Usar campo seccion o url del backend; fallback: inferir por contenido
      let seccion = (n.seccion || n.url || '').trim();
      const titleLower = (n.title || '').toLowerCase();
      const bodyLower  = (n.body || '').toLowerCase();
      const combinedText = `${titleLower} ${bodyLower}`;

      // Helper para comprobar palabras completas de forma segura
      const hasWord = (rx) => rx.test(combinedText);

      // Si no viene sección del backend, inferirla por palabras clave
      if (!seccion) {
        if (hasWord(/\b(rma|garant[ií]a|garantias|taller|reparaci[oó]n|reparar|equipo)\b/i)) {
          seccion = 'rma';
        } else if (hasWord(/\b(punto|puntos|cumplea[nñ]os|redim|canje|canjear|saldo|acredit|ajuste)\b/i)) {
          seccion = 'puntos:cuenta';
        } else if (hasWord(/\b(promo|oferta|descuento|rebaja|remate)\b/i)) {
          seccion = 'promos';
        } else if (hasWord(/\b(evento|webinar|curso|capacitaci[oó]n|charla|certificaci[oó]n)\b/i)) {
          seccion = 'agenda';
        }
      }

      const isExternal = isExternalUrl(seccion);
      const tab = isExternal ? 'external' : seccion.split(':')[0].toLowerCase();
      const baseCfg = SECC_CFG[tab] || SECC_CFG.default;

      // Icono y badge base
      let itemIcon      = n.icon      || baseCfg.icon;
      let itemColor     = n.iconColor || baseCfg.color;
      let itemBadgeText = n.badgeText || baseCfg.badgeText;
      let itemBadgeBg   = n.badgeBg   || baseCfg.badgeBg;
      let itemBadgeTxt  = n.badgeTxt  || baseCfg.badgeTxt;

      if (isExternal) {
        const lowerSec = seccion.toLowerCase();
        if (lowerSec.includes('wa.me') || lowerSec.includes('whatsapp')) {
          itemIcon      = 'fa-brands fa-whatsapp';
          itemColor     = '#22c55e';
          itemBadgeText = '💬 WhatsApp ↗';
          itemBadgeBg   = '#dcfce7';
          itemBadgeTxt  = '#15803d';
        } else if (lowerSec.includes('meet.google') || lowerSec.includes('zoom.us') || lowerSec.includes('teams.live')) {
          itemIcon      = 'fa-video';
          itemColor     = '#0284c7';
          itemBadgeText = '📹 Reunión ↗';
          itemBadgeBg   = '#e0f2fe';
          itemBadgeTxt  = '#0369a1';
        } else if (lowerSec.includes('odoo') || lowerSec.includes('mgm') || seccion.startsWith('/')) {
          itemIcon      = 'fa-arrow-up-right-from-square';
          itemColor     = '#005bbb';
          itemBadgeText = '🌐 MGM Web ↗';
          itemBadgeBg   = '#e8f1ff';
          itemBadgeTxt  = '#005bbb';
        } else {
          itemIcon      = 'fa-arrow-up-right-from-square';
          itemColor     = '#0ea5e9';
          itemBadgeText = '🌐 Ver enlace ↗';
          itemBadgeBg   = '#f0f9ff';
          itemBadgeTxt  = '#0284c7';
        }
      } else if (!n.badgeText) {
        // Refinar insignia y estilo visual según el tipo específico de evento/alerta interna

        // 1. RMA / Garantías / Taller técnico
        if (tab === 'rma' || hasWord(/\b(rma|garant[ií]a|garantias|taller\s+rma|taller|reparaci[oó]n)\b/i)) {
          itemIcon      = 'fa-screwdriver-wrench';
          itemColor     = '#0f766e';
          itemBadgeText = '🔧 Mi RMA';
          itemBadgeBg   = '#ccfbf1';
          itemBadgeTxt  = '#0f766e';
        }
        // 2. Canjes de premios de puntos
        else if (hasWord(/\b(redim|canje|canjeado|canjeaste|canjear|recompensa)\b/i)) {
          itemIcon      = 'fa-gift';
          itemColor     = '#10b981';
          itemBadgeText = '🎁 Canje';
          itemBadgeBg   = '#d1fae5';
          itemBadgeTxt  = '#065f46';
        }
        // 3. Devolución de mercadería / Nota de crédito comercial (\bnc\b como palabra entera, ¡NUNCA .includes('nc')!)
        else if (hasWord(/\b(devoluci[oó]n|devoluciones|nota(?:s)? de cr[eé]dito|\bnc\b)\b/i)) {
          itemIcon      = 'fa-file-invoice-dollar';
          itemColor     = '#ef4444';
          itemBadgeText = '📋 Devolución';
          itemBadgeBg   = '#fee2e2';
          itemBadgeTxt  = '#991b1b';
        }
        // 4. Ajustes de saldo de puntos
        else if (hasWord(/\b(ajuste|ajustes)\b/i)) {
          const isFavor = hasWord(/\b(favor|acredit|bono|\(\+\))\b/i);
          itemIcon      = isFavor ? 'fa-award' : 'fa-sliders';
          itemColor     = isFavor ? '#8b5cf6' : '#f59e0b';
          itemBadgeText = isFavor ? '✨ Ajuste (+)' : '⚠️ Ajuste (-)';
          itemBadgeBg   = isFavor ? '#ede9fe' : '#fef3c7';
          itemBadgeTxt  = isFavor ? '#5b21b6' : '#92400e';
        }
        // 5. Cumpleaños del cliente
        else if (hasWord(/\b(cumplea[nñ]os|aniversario)\b/i)) {
          itemIcon      = 'fa-cake-candles';
          itemColor     = '#ec4899';
          itemBadgeText = '🎂 Cumpleaños';
          itemBadgeBg   = '#fce7f3';
          itemBadgeTxt  = '#9d174d';
        }
        // 6. Bienvenida a MGM Hub
        else if (hasWord(/\b(bienvenid[oa]s?)\b/i)) {
          itemIcon      = 'fa-hand-peace';
          itemColor     = '#6366f1';
          itemBadgeText = '🎉 Bienvenida';
          itemBadgeBg   = '#e0e7ff';
          itemBadgeTxt  = '#4338ca';
        }
        // 7. Cursos y capacitaciones
        else if (hasWord(/\b(curso|cursos|capacitaci[oó]n|capacitaciones|certificaci[oó]n|webinar)\b/i)) {
          itemIcon      = 'fa-graduation-cap';
          itemColor     = '#005bbb';
          itemBadgeText = '🎓 Capacitación';
          itemBadgeBg   = '#e8f1ff';
          itemBadgeTxt  = '#005bbb';
        }
      }

      const isClickable = !!seccion;
      const safeId = String(n.id).replace(/'/g, "\\'");

      const clickAttr = isClickable
        ? `onclick="handleNotificationClick('${safeId}')" style="cursor:pointer;"`
        : '';

      const hoverIn  = `this.style.boxShadow='0 4px 14px rgba(0,33,74,0.13)'; ${isClickable ? "this.style.transform='translateY(-1px)';" : ''}`;
      const hoverOut = `this.style.boxShadow='0 2px 6px rgba(0,33,74,0.05)'; this.style.transform='translateY(0)';`;

      const iconClass = itemIcon.includes('fa-') && !itemIcon.includes('fa-solid') && !itemIcon.includes('fa-brands') && !itemIcon.includes('fa-regular')
        ? `fa-solid ${itemIcon}`
        : itemIcon;

      return `
      <div ${clickAttr}
        style="position:relative; background:var(--bg-surface); border:1px solid var(--border-light); border-radius:12px; padding:14px; margin-bottom:10px; box-shadow:var(--shadow-xs); transition: box-shadow 0.2s, transform 0.2s;"
        onmouseover="${hoverIn}" onmouseout="${hoverOut}">
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
          <i class="${iconClass}" style="color:${itemColor}; font-size:14px;"></i>
          <div style="font-size:14px; font-weight:800; color:var(--text-dark); flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis;">${n.title || 'Sin Título'}</div>
          ${itemBadgeText ? `<span style="font-size:10px; background:${itemBadgeBg}; color:${itemBadgeTxt}; padding:2px 7px; border-radius:20px; font-weight:700; white-space:nowrap;">${itemBadgeText}</span>` : ''}
          <button type="button" onclick="dismissNotification('${safeId}', event)" title="Eliminar notificación"
            style="background:none; border:none; color:var(--text-subtle); cursor:pointer; padding:3px 6px; border-radius:6px; font-size:13px; display:inline-flex; align-items:center; justify-content:center; transition:color 0.15s, background 0.15s; margin-left:4px;"
            onmouseover="this.style.color='#ef4444'; this.style.background='rgba(239,68,68,0.1)';"
            onmouseout="this.style.color='var(--text-subtle)'; this.style.background='none';">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div style="font-size:13px; color:var(--text-muted); line-height:1.5;">${n.body || ''}</div>
        <div style="font-size:11px; color:var(--text-subtle); margin-top:8px; text-align:right;">${n.date || ''}</div>
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

    // Capturar código de referido de URL si existe
    const urlParams = new URLSearchParams(window.location.search);
    const refParam = urlParams.get('ref');
    if (refParam) {
      try {
        sessionStorage.setItem('mgm_ref_code', refParam);
      } catch (e) { console.error('Error saving ref code', e); }
      // Navegar a registro si no hay sesión activa
      if (!state.authUser) {
        navigateToSection('puntos:registro');
      } else {
        switchMainTab('home');
      }
    } else {
      switchMainTab('home');
    }

    // Inicializar estado de UI autenticación
    updateHeaderUserIcon();
    updateHomeAuthBanner();
    updatePuntosAuthViews();
    
    // Si el usuario está autenticado, registrar visita en tracking sheet y refrescar puntos
    if (state.authUser) {
      trackUserActivity(state.authUser.cedula, state.authUser.nombre, 'app_open');
      autoLoadPuntosDashboard();
      loadMyCourses();
      // Siempre sincronizar foto de perfil desde el backend (multi-dispositivo)
      syncUserAvatarFromBackend(state.authUser.cedula);
    } else {
      renderMyCourses();
    }
    
    // Actualizar badge visual con las locales
    updateNotifBadge();
    
    // Consultar nuevas notificaciones
    checkNotifications();

    await Promise.allSettled([
      loadHomePromos(),
      loadHomeRewards(),
      loadHomeNextEvent(),
      fetchAudioPlaylist()
    ]);

    checkAndShowSplash();

    // ── DEEP LINK: Leer parámetros de URL al arrancar la app ──────────────────────
    // Ejemplos: ?tab=puntos&sub=registro | ?tab=agenda&id=EV001 | ?tab=promos&id=P001
    // QR RMA:   ?tab=rma&sub=RMA-2026-0001&email=cliente@email.com
    const _urlParams = new URLSearchParams(window.location.search);
    const _deepTab   = _urlParams.get('tab');
    const _deepSub   = _urlParams.get('sub') || _urlParams.get('id');
    const _deepEmail = _urlParams.get('email') || '';
    if (_deepTab) {
      // Si hay email en la URL (viene del QR), guardarlo para que navigateTo lo use
      if (_deepEmail) window._pendingRmaEmail = _deepEmail;
      const _seccion = _deepSub ? `${_deepTab}:${_deepSub}` : _deepTab;
      if (typeof window.showMgmLoader === 'function') window.showMgmLoader('Cargando sección...');
      // Pequeño delay para dejar que los datos carguen antes de navegar
      setTimeout(() => {
        navigateTo(_seccion);
        if (typeof window.hideMgmLoader === 'function') window.hideMgmLoader();
      }, 400);
      // Limpiar la URL para que no se repita en recargas
      history.replaceState({}, document.title, window.location.pathname);
    }

    // ── SERVICE WORKER: Escuchar mensajes de navegación desde notificaciones ─
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', event => {
        if (event.data && event.data.type === 'NAVIGATE_TO' && event.data.seccion) {
          navigateTo(event.data.seccion);
        }
      });
    }
  }


  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

/* ==========================================================================
   MÓDULO RMA — CONSULTA DE GARANTÍA (Global, fuera del IIFE principal)
   Endpoint: mismo GAS de Notificaciones (action=get_rma)
   ========================================================================== */
(function() {
  'use strict';

  // URL del backend — usa el mismo GAS de Notificaciones
  const RMA_GAS_URL = 'https://script.google.com/macros/s/AKfycby8EOl7-hZ1Q8rvPCjFB2ItFrRKqwVmDoPJrhX3sM_3-O8xeoWmuZ0RxbEgNUjLN_6dfA/exec';

  // Mapa de estados → { clase CSS, icono, progreso % }
  const ESTADO_MAP = {
    'recibido':          { cls: 'recibido',        icon: 'fa-inbox',            progress: 15,  label: 'Recibido' },
    'en diagnóstico':    { cls: 'diagnostico',     icon: 'fa-microscope',       progress: 35,  label: 'En Diagnóstico' },
    'en diagnóstico':    { cls: 'diagnostico',     icon: 'fa-microscope',       progress: 35,  label: 'En Diagnóstico' },
    'en diagnostico':    { cls: 'diagnostico',     icon: 'fa-microscope',       progress: 35,  label: 'En Diagnóstico' },
    'en reparación':     { cls: 'reparacion',      icon: 'fa-screwdriver-wrench', progress: 55, label: 'En Reparación' },
    'en reparacion':     { cls: 'reparacion',      icon: 'fa-screwdriver-wrench', progress: 55, label: 'En Reparación' },
    'espera de repuesto':{ cls: 'espera-repuesto', icon: 'fa-clock',            progress: 50,  label: 'Espera Repuesto' },
    'listo para retirar':{ cls: 'listo',           icon: 'fa-circle-check',     progress: 90,  label: 'Listo para Retirar' },
    'entregado':         { cls: 'entregado',       icon: 'fa-check-double',     progress: 100, label: 'Entregado' },
    'sin garantía':      { cls: 'sin-garantia',    icon: 'fa-triangle-exclamation', progress: 0, label: 'Sin Garantía' },
    'sin garantia':      { cls: 'sin-garantia',    icon: 'fa-triangle-exclamation', progress: 0, label: 'Sin Garantía' },
  };

  function getEstadoInfo(rawEstado) {
    if (!rawEstado) return { cls: 'default', icon: 'fa-circle-question', progress: 0, label: rawEstado || 'Desconocido' };
    const key = rawEstado.trim().toLowerCase();
    return ESTADO_MAP[key] || { cls: 'default', icon: 'fa-circle-question', progress: 20, label: rawEstado };
  }

  function rmaSetLoading(on) {
    const btn = document.getElementById('rma-search-btn');
    if (!btn) return;
    btn.disabled = on;
    btn.innerHTML = on
      ? '<i class="fa-solid fa-spinner fa-spin"></i><span>Consultando...</span>'
      : '<i class="fa-solid fa-search"></i><span>Consultar Estado</span>';
  }

  function rmaShowError(msg) {
    const el = document.getElementById('rma-error-msg');
    if (!el) return;
    el.textContent = msg;
    el.style.display = 'block';
  }

  function rmaHideError() {
    const el = document.getElementById('rma-error-msg');
    if (el) el.style.display = 'none';
  }

  function buildRmaCard(item) {
    const estado = getEstadoInfo(item.estado);
    const fechaIngreso = item.fecha_ingreso || item.fecha || '—';
    const modelo      = item.modelo || item.producto || item.equipo || '—';
    const serial      = item.serial || item.numero_serie || item.serie || '';
    const falla       = item.falla || item.descripcion || '—';
    const tecnico     = item.tecnico || item.responsable || '—';
    const rmaNum      = item.rma || item.numero_rma || item.id || '';

    return `
      <div class="rma-card">
        <div class="rma-card-header">
          <div class="rma-card-icon">
            <i class="fa-solid ${estado.icon}"></i>
          </div>
          <div style="flex:1; min-width:0;">
            <div class="rma-card-model" title="${modelo}">${modelo}</div>
            ${serial ? `<div class="rma-card-serial">S/N: ${serial}</div>` : ''}
            ${rmaNum ? `<div class="rma-card-serial">RMA #${rmaNum}</div>` : ''}
          </div>
          <span class="rma-badge ${estado.cls}">
            <i class="fa-solid ${estado.icon}" style="font-size:10px;"></i>
            ${estado.label}
          </span>
        </div>
        <div class="rma-tracker">
          <div class="rma-tracker-progress" style="width:${Math.min(estado.progress, 100)}%;"></div>
          <div class="rma-step ${estado.progress >= 15 ? 'completed' : ''} ${estado.progress === 15 ? 'active' : ''}">
            <div class="rma-step-icon"><i class="fa-solid fa-inbox"></i></div>
            <div class="rma-step-label">Recibido</div>
          </div>
          <div class="rma-step ${estado.progress >= 35 ? 'completed' : ''} ${estado.progress === 35 ? 'active' : ''}">
            <div class="rma-step-icon"><i class="fa-solid fa-microscope"></i></div>
            <div class="rma-step-label">Diagnóstico</div>
          </div>
          <div class="rma-step ${estado.progress >= 50 ? 'completed' : ''} ${estado.progress === 50 || estado.progress === 55 ? 'active' : ''}">
            <div class="rma-step-icon"><i class="fa-solid fa-screwdriver-wrench"></i></div>
            <div class="rma-step-label">Reparación</div>
          </div>
          <div class="rma-step ${estado.progress >= 90 ? 'completed' : ''} ${estado.progress === 90 || estado.progress === 100 ? 'active' : ''}">
            <div class="rma-step-icon"><i class="fa-solid fa-check-double"></i></div>
            <div class="rma-step-label">Finalizado</div>
          </div>
        </div>
        <div class="rma-card-body">
          <div class="rma-info-row">
            <span class="rma-info-label"><i class="fa-solid fa-calendar-day" style="margin-right:5px;color:#4F46E5;"></i>Ingreso</span>
            <span class="rma-info-value">${fechaIngreso}</span>
          </div>
          <div class="rma-info-row">
            <span class="rma-info-label"><i class="fa-solid fa-comment-dots" style="margin-right:5px;color:#4F46E5;"></i>Falla</span>
            <span class="rma-info-value" style="white-space:normal;line-height:1.4;">${falla}</span>
          </div>
          ${tecnico !== '—' ? `
          <div class="rma-info-row">
            <span class="rma-info-label"><i class="fa-solid fa-user-gear" style="margin-right:5px;color:#4F46E5;"></i>Técnico</span>
            <span class="rma-info-value">${tecnico}</span>
          </div>` : ''}
        </div>
      </div>`;
  }

  window.buscarRMA = function() {
    const input = document.getElementById('rma-cedula-input');
    if (!input) return;
    const cedula = input.value.trim();
    if (!cedula) {
      rmaShowError('Por favor ingresa tu cédula o RUC.');
      return;
    }
    rmaHideError();
    rmaSetLoading(true);
    if (typeof window.showMgmLoader === 'function') window.showMgmLoader('Consultando equipo...');

    const url = `${RMA_GAS_URL}?action=get_rma&cedula=${encodeURIComponent(cedula)}`;

    // Mostrar spinner provisional mientras carga
    const resultSection = document.getElementById('rma-result-section');
    const searchCard    = document.querySelector('.rma-search-card');
    const cardsList     = document.getElementById('rma-cards-list');
    const resultSub     = document.getElementById('rma-result-sub');

    if (cardsList) cardsList.innerHTML = '<div class="rma-spinner">Consultando base de datos...</div>';
    if (resultSection) resultSection.style.display = 'block';

    fetch(url)
      .then(r => r.json())
      .then(data => {
        if (typeof window.hideMgmLoader === 'function') window.hideMgmLoader();
        rmaSetLoading(false);

        // Normalizar respuesta — admite { data: [...] } o array directo
        let items = Array.isArray(data) ? data : (data.data || data.rmas || data.result || []);

        if (!items.length) {
          if (cardsList) cardsList.innerHTML = `
            <div style="text-align:center;padding:30px 16px;">
              <i class="fa-solid fa-box-open" style="font-size:40px;color:#e0e7ff;margin-bottom:14px;display:block;"></i>
              <div style="font-size:14px;font-weight:700;color:var(--text-dark);margin-bottom:6px;">Sin equipos en servicio</div>
              <div style="font-size:12px;color:var(--text-muted);">No encontramos RMAs activos para <strong>${cedula}</strong>.<br>Si crees que es un error, contáctanos por WhatsApp.</div>
            </div>`;
          if (resultSub) resultSub.textContent = `Cédula: ${cedula}`;
          if (searchCard) searchCard.style.display = 'none';
          return;
        }

        if (searchCard) searchCard.style.display = 'none';
        if (resultSub) resultSub.textContent = `${items.length} equipo${items.length !== 1 ? 's' : ''} encontrado${items.length !== 1 ? 's' : ''} para ${cedula}`;
        if (cardsList) cardsList.innerHTML = items.map(buildRmaCard).join('');
      })
      .catch(err => {
        if (typeof window.hideMgmLoader === 'function') window.hideMgmLoader();
        rmaSetLoading(false);
        console.error('[RMA]', err);
        if (resultSection) resultSection.style.display = 'none';
        rmaShowError('No se pudo conectar al servidor. Verifica tu conexión e intenta de nuevo.');
      });
  };

  window.rmaVolverBusqueda = function() {
    const resultSection = document.getElementById('rma-result-section');
    const searchCard    = document.querySelector('.rma-search-card');
    const cardsList     = document.getElementById('rma-cards-list');
    const input         = document.getElementById('rma-cedula-input');

    if (resultSection) resultSection.style.display = 'none';
    if (searchCard)    searchCard.style.display = 'flex';
    if (cardsList)     cardsList.innerHTML = '';
    if (input)         { input.value = ''; input.focus(); }
    rmaHideError();
  };

  // Permitir buscar con Enter
  document.addEventListener('DOMContentLoaded', function() {
    const input = document.getElementById('rma-cedula-input');
    if (input) {
      input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') window.buscarRMA();
      });
    }
  });

})();

// ══════════════════════════════════════════════════════════════════════════════
// MÓDULO: CALCULADORA DE ALMACENAMIENTO CCTV
// Se inicializa cuando el usuario navega a la vista toolbox:calculadora-almacenamiento
// ══════════════════════════════════════════════════════════════════════════════
(function() {
  'use strict';

  // URL del Apps Script que devuelve discos del inventario MGM
  const STORAGE_CALC_GAS = "https://script.google.com/macros/s/AKfycbwwSvsAwud-fzGHdr9ylMLaU24unDUE9ixcK1D0lPFVT9PVbgp6vEn0UkaQgZn5Bp4vpQ/exec";

  // Tabla de bitrates base (kbps) por resolución y codec (cámaras IP)
  const bitrateTable = {
    digital: {
      "720":   { h264: 2048,  h265: 1536,  h265p: 1024,  mjpeg: 8000  },
      "1080":  { h264: 4096,  h265: 3072,  h265p: 2048,  mjpeg: 16000 },
      "3000":  { h264: 6144,  h265: 4608,  h265p: 3072,  mjpeg: 24000 },
      "4000":  { h264: 8192,  h265: 6144,  h265p: 4096,  mjpeg: 32000 },
      "5000":  { h264: 10240, h265: 7168,  h265p: 5120,  mjpeg: 40000 },
      "8000":  { h264: 16384, h265: 10240, h265p: 8192,  mjpeg: 64000 },
      "12000": { h264: 24576, h265: 16384, h265p: 12288, mjpeg: 96000 }
    },
    analog: {
      "720p": 2048, "1080p": 3072, "4MP": 5120, "5MP": 6144, "4K": 8192
    }
  };

  // Factores de modo de grabación (porcentaje del tiempo activo)
  const modeFactors = {
    continuous: 1,
    motion:     0.35,
    events:     0.15,
    work8:      0.33,
    work12:     0.50
  };

  // Estado de la calculadora
  let _discoSeleccionado = null;
  let _mostrarPrecioEnPDF = false;
  let _calcInitialized = false;

  // ─── Inicializar calculadora cuando el usuario llega a esa vista ───────────
  function initCalc() {
    const addBtn  = document.getElementById('addCam');
    const calcBtn = document.getElementById('btnCalcular');
    const pdfBtn  = document.getElementById('btnPDF');

    if (!addBtn) return; // DOM no listo todavia

    // Limpiar listeners previos clonando el nodo (evita duplicados)
    const newAdd  = addBtn.cloneNode(true);
    const newCalc = calcBtn ? calcBtn.cloneNode(true) : null;
    const newPdf  = pdfBtn  ? pdfBtn.cloneNode(true)  : null;
    addBtn.parentNode.replaceChild(newAdd, addBtn);
    if (calcBtn && newCalc) calcBtn.parentNode.replaceChild(newCalc, calcBtn);
    if (pdfBtn  && newPdf)  pdfBtn.parentNode.replaceChild(newPdf, pdfBtn);

    newAdd.addEventListener('click', addCameraRow);
    if (newCalc) newCalc.addEventListener('click', calcularTotal);
    if (newPdf)  newPdf.addEventListener('click', generarPDF);

    // Limpiar lista y resultado de sesiones previas
    const camList = document.getElementById('camList');
    const resBox  = document.getElementById('resultadoBox');
    if (camList) camList.innerHTML = '';
    if (resBox)  resBox.style.display = 'none';

    // Agregar primera fila de camara por defecto
    addCameraRow();
  }

  // ─── Agregar una fila de cámara ───────────────────────────────────────────
  function addCameraRow() {
    const container = document.getElementById('camList');
    if (!container) return;
    const index = container.children.length + 1;
    const div = document.createElement('div');
    div.className = 'cam-row';
    div.style.cssText = 'background:#fff; border:1px solid #dee2e6; border-radius:12px; padding:16px; margin-bottom:16px; position:relative; transition:0.2s;';
    div.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1px solid #eee; padding-bottom:10px;">
        <span style="font-weight:700; color:var(--primary-blue); font-size:13px;">CAMARA #${index}</span>
        <button style="background:#dc3545; color:white; border:none; border-radius:6px; padding:5px 10px; cursor:pointer; font-size:12px; font-weight:600;" onclick="this.parentElement.parentElement.remove(); calcRenumerar();">Eliminar</button>
      </div>
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(140px, 1fr)); gap:12px;">
        <div>
          <label style="font-size:10px; font-weight:700; text-transform:uppercase; color:#555; margin-bottom:4px; display:block;">Tecnologia</label>
          <select class="tipo" onchange="calcActualizarRes(this)" style="width:100%; padding:9px; border-radius:6px; border:1px solid #ced4da; font-size:13px; background:#fff;">
            <option value="digital">IP / Red</option>
            <option value="analog">Analogica HD (TVI/CVI)</option>
          </select>
        </div>
        <div>
          <label style="font-size:10px; font-weight:700; text-transform:uppercase; color:#555; margin-bottom:4px; display:block;">Resolucion</label>
          <select class="res" style="width:100%; padding:9px; border-radius:6px; border:1px solid #ced4da; font-size:13px; background:#fff;"></select>
        </div>
        <div>
          <label style="font-size:10px; font-weight:700; text-transform:uppercase; color:#555; margin-bottom:4px; display:block;">Compresion</label>
          <select class="codec" style="width:100%; padding:9px; border-radius:6px; border:1px solid #ced4da; font-size:13px; background:#fff;">
            <option value="h265p">H.265+</option>
            <option value="h265">H.265</option>
            <option value="h264">H.264</option>
            <option value="mjpeg">MJPEG</option>
          </select>
        </div>
        <div>
          <label style="font-size:10px; font-weight:700; text-transform:uppercase; color:#555; margin-bottom:4px; display:block;">FPS</label>
          <input type="number" class="fps" value="15" min="1" max="60" style="width:100%; padding:9px; border-radius:6px; border:1px solid #ced4da; font-size:13px; background:#fff;">
        </div>
        <div>
          <label style="font-size:10px; font-weight:700; text-transform:uppercase; color:#555; margin-bottom:4px; display:block;">Complejidad Escena</label>
          <select class="scene" style="width:100%; padding:9px; border-radius:6px; border:1px solid #ced4da; font-size:13px; background:#fff;">
            <option value="0.6">Baja (Pasillo)</option>
            <option value="1" selected>Media (Oficina)</option>
            <option value="1.4">Alta (Trafico)</option>
            <option value="2.0">Extrema (Casino)</option>
          </select>
        </div>
        <div>
          <label style="font-size:10px; font-weight:700; text-transform:uppercase; color:#555; margin-bottom:4px; display:block;">Modo Grabacion</label>
          <select class="mode" style="width:100%; padding:9px; border-radius:6px; border:1px solid #ced4da; font-size:13px; background:#fff;">
            <option value="continuous">24/7 Continua</option>
            <option value="motion">Movimiento</option>
            <option value="events">IA / Cruce Linea</option>
            <option value="work8">Horario Laboral (8h)</option>
            <option value="work12">Dia completo (12h)</option>
          </select>
        </div>
        <div>
          <label style="font-size:10px; font-weight:700; text-transform:uppercase; color:#555; margin-bottom:4px; display:block;">Bitrate Manual (kbps)</label>
          <input type="number" class="customBR" placeholder="Opcional" style="width:100%; padding:9px; border-radius:6px; border:1px solid #ced4da; font-size:13px; background:#fff;">
        </div>
      </div>
    `;
    container.appendChild(div);
    // Inicializar las opciones de resolución
    calcActualizarRes(div.querySelector('.tipo'));
  }

  // ─── Actualizar opciones de resolución según tecnología ───────────────────
  window.calcActualizarRes = function(select) {
    const row = select.closest('.cam-row');
    const resSelect   = row.querySelector('.res');
    const codecSelect = row.querySelector('.codec');
    resSelect.innerHTML = '';
    if (select.value === 'digital') {
      const ops = [
        {v:"720",   t:"1MP / 720p"},
        {v:"1080",  t:"2MP / 1080p"},
        {v:"3000",  t:"3MP"},
        {v:"4000",  t:"4MP"},
        {v:"5000",  t:"5MP"},
        {v:"8000",  t:"8MP / 4K"},
        {v:"12000", t:"12MP / Pro"}
      ];
      ops.forEach(o => resSelect.add(new Option(o.t, o.v)));
      codecSelect.disabled = false;
    } else {
      const ops = [
        {v:"720p",  t:"720p HD"},
        {v:"1080p", t:"1080p HD"},
        {v:"4MP",   t:"4MP HD"},
        {v:"5MP",   t:"5MP HD"},
        {v:"4K",    t:"8MP 4K"}
      ];
      ops.forEach(o => resSelect.add(new Option(o.t, o.v)));
      codecSelect.value    = 'h264';
      codecSelect.disabled = true;
    }
  };

  // ─── Renumerar cámaras tras eliminar ─────────────────────────────────────
  window.calcRenumerar = function() {
    document.querySelectorAll('.cam-row').forEach((r, i) => {
      const span = r.querySelector('span');
      if (span) span.textContent = 'CAMARA #' + (i + 1);
    });
  };

  // ─── Calcular total de almacenamiento ────────────────────────────────────
  function calcularTotal() {
    const days = parseInt(document.getElementById('days').value) || 1;
    let totalNeto = 0;
    const filas = [];

    document.querySelectorAll('.cam-row').forEach((row, i) => {
      const tipo   = row.querySelector('.tipo').value;
      const res    = row.querySelector('.res').value;
      const codec  = row.querySelector('.codec').value;
      const fps    = parseInt(row.querySelector('.fps').value) || 1;
      const scene  = parseFloat(row.querySelector('.scene').value);
      const mode   = row.querySelector('.mode').value;
      const custom = row.querySelector('.customBR').value;

      let br = custom
        ? parseInt(custom)
        : (tipo === 'digital' ? bitrateTable.digital[res][codec] : bitrateTable.analog[res]);

      br = br * (fps / 30) * scene;

      const tb = (br * 3600 * 24 * days * modeFactors[mode]) / (8 * 1024 * 1024 * 1024);
      totalNeto += tb;

      filas.push([
        i + 1,
        row.querySelector('.res').selectedOptions[0].text,
        tipo === 'analog' ? 'H.264/5 (DVR)' : codec.toUpperCase(),
        fps,
        row.querySelector('.scene').selectedOptions[0].text,
        row.querySelector('.mode').selectedOptions[0].text,
        Math.round(br).toLocaleString() + ' kbps',
        tb.toFixed(2)
      ]);
    });

    // Factor de seguridad: 9% overhead de formato de disco
    const totalConSeguridad = totalNeto / 0.91;

    // Mostrar resultados
    const resultadoBox = document.getElementById('resultadoBox');
    if (resultadoBox) resultadoBox.style.display = 'block';

    const resNeto   = document.getElementById('resNeto');
    const resDiscos = document.getElementById('resDiscos');
    if (resNeto)   resNeto.textContent   = totalNeto.toFixed(2) + ' TB';
    if (resDiscos) resDiscos.textContent = Math.ceil(totalConSeguridad) + ' TB Reales';

    // Renderizar tabla de detalle
    const tbody = document.querySelector('#tablaDetalle tbody');
    if (tbody) {
      tbody.innerHTML = filas.map(f =>
        `<tr>${f.map((td, ci) => {
          const align = ci === 0 || ci === 3 ? 'center' : ci >= 6 ? 'right' : 'left';
          const bold  = ci === 7 ? 'font-weight:700; color:#0c4a6e;' : '';
          return `<td style="padding:7px 8px; border-bottom:1px solid #f0f0f0; text-align:${align}; ${bold}">${td}</td>`;
        }).join('')}</tr>`
      ).join('');
    }

    // Consultar inventario MGM
    halarInventarioMGM(totalConSeguridad * 1024);
  }

  // ─── Consultar inventario de discos en MGM ────────────────────────────────
  function halarInventarioMGM(capGB) {
    const container = document.getElementById('listaDiscos');
    const loading   = document.getElementById('loadingMGM');
    const titulo    = document.getElementById('tituloRecomendaciones');
    if (!container) return;

    if (loading) loading.style.display = 'block';
    if (titulo)  titulo.style.display  = 'none';
    container.innerHTML = '';
    _discoSeleccionado  = null;

    fetch(`${STORAGE_CALC_GAS}?gb=${Math.round(capGB)}`)
      .then(r => r.json())
      .then(discos => {
        if (loading) loading.style.display = 'none';
        if (!discos || !discos.length) return;

        if (titulo) titulo.style.display = 'block';

        discos.forEach(d => {
          const unidades = Math.ceil(capGB / d.capacidad);
          const card = document.createElement('div');
          card.style.cssText = 'background:white; border:2px solid #e2e8f0; padding:14px; border-radius:10px; cursor:pointer; transition:0.2s;';
          card.innerHTML = `
            <div style="font-weight:700; font-size:13px; color:#333; margin-bottom:4px;">${d.modelo}</div>
            <div style="font-size:11px; color:var(--primary-blue); margin-bottom:4px;">SKU: ${d.sku} | ${d.capacidad/1024}TB</div>
            <div style="font-weight:700; color:#dc3545; font-size:12px; margin-bottom:4px;">Se requieren: <strong>${unidades}</strong> unidad(es)</div>
            <div style="font-weight:700; color:#10b981; font-size:13px; margin-bottom:8px;">P. Unitario: $${parseFloat(d.precio).toFixed(2)}</div>
            <label style="font-size:10px; display:flex; align-items:center; gap:5px; color:#555; cursor:pointer;">
              <input type="checkbox" class="chk-precio" style="cursor:pointer;"> Incluir precio en PDF
            </label>
          `;

          card.addEventListener('click', function(e) {
            if (e.target.type === 'checkbox') {
              _mostrarPrecioEnPDF = e.target.checked;
              return;
            }
            document.querySelectorAll('#listaDiscos > div').forEach(c => {
              c.style.border = '2px solid #e2e8f0';
              c.style.background = 'white';
            });
            card.style.border     = '2px solid var(--primary-blue)';
            card.style.background = '#eff6ff';
            _discoSeleccionado = {...d, qty: unidades};
            _mostrarPrecioEnPDF = card.querySelector('.chk-precio').checked;
          });

          container.appendChild(card);
        });
      })
      .catch(err => {
        if (loading) loading.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Error al conectar con inventario MGM.';
        console.error('[MGM Calc] Error inventario:', err);
      });
  }

  // ─── Generar PDF de cotización ────────────────────────────────────────────
  function generarPDF() {
    if (typeof window.jspdf === 'undefined') {
      if (typeof showToast === 'function') showToast('PDF no disponible: verifique conexion a internet.', 'fa-solid fa-triangle-exclamation');
      return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const client  = (document.getElementById('clientName') || {}).value || 'Cliente General';
    const logoUrl = 'https://mgmpty.odoo.com/web/image/68369-dbd5e226/Logo%20MGM.png';

    // Header azul
    doc.setFillColor(26, 115, 232);
    doc.rect(0, 0, 210, 45, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text('MGM SEGURIDAD', 15, 20);
    doc.setFontSize(10);
    doc.text('REPORTE TECNICO DE ALMACENAMIENTO DIGITAL', 15, 30);
    doc.text(`PROYECTO: ${client.toUpperCase()}`, 15, 38);

    try { doc.addImage(logoUrl, 'PNG', 160, 8, 35, 30); } catch(e) {}

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    const dias          = (document.getElementById('days') || {}).value || '?';
    const totalSugerido = (document.getElementById('resDiscos') || {}).textContent || '?';
    doc.text(`Dias de Respaldo: ${dias}`, 15, 55);
    doc.text(`Espacio Total Requerido: ${totalSugerido}`, 15, 63);

    let startYTable = 75;
    if (_discoSeleccionado) {
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      let txtEquipo = `EQUIPO SUGERIDO: (${_discoSeleccionado.qty}) ${_discoSeleccionado.modelo} [${_discoSeleccionado.sku}]`;
      if (_mostrarPrecioEnPDF) {
        const totalUSD = (_discoSeleccionado.qty * parseFloat(_discoSeleccionado.precio)).toFixed(2);
        txtEquipo += ` | Total: $${totalUSD}`;
      }
      doc.text(txtEquipo, 15, 72);
      doc.setFont(undefined, 'normal');
      startYTable = 80;
    }

    doc.autoTable({
      html: '#tablaDetalle',
      startY: startYTable,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [26, 115, 232] },
      margin: { top: startYTable }
    });

    const finalY = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(8);
    doc.setTextColor(120);
    const legal = 'AVISO TECNICO: Este calculo es una simulacion basada en algoritmos de compresion estandar. MGM no garantiza la duracion exacta. Consulte en mgmpty.odoo.com.';
    doc.text(legal, 15, finalY, { maxWidth: 180 });

    doc.save(`MGM_Almacenamiento_${client.replace(/\s/g, '_')}.pdf`);
    if (typeof showToast === 'function') {
      showToast('¡PDF de almacenamiento generado y descargado exitosamente!', 'fa-solid fa-file-pdf');
    }
  }

  // ─── Gancho: escuchar cambios de tab para inicializar la calculadora ──────
  const _origSwitch = window.switchMainTab;
  window.switchMainTab = function(tabName) {
    if (_origSwitch) _origSwitch(tabName);
    if (tabName === 'toolbox-calculadora-almacenamiento') {
      // Guard de autenticacion: usa localStorage como los demas modulos
      const _authData = localStorage.getItem('mgm_auth_user');
      if (!_authData) {
        const viewEl = document.getElementById('view-toolbox');
        document.querySelectorAll('.view-container').forEach(v => v.classList.remove('active'));
        if (viewEl) viewEl.classList.add('active');
        if (typeof showToast === 'function') showToast('Debes iniciar sesion para usar las Calculadoras Tecnicas.', 'fa-solid fa-lock');
        return;
      }
      // Usuario autenticado: inicializar calculadora cada vez que se abre
      initCalc();
    }
  };

  // Easter egg en consola (igual que la versión standalone)
  (function() {
    const fontP = "font-family:'Segoe UI',sans-serif;";
    const fontM = "font-family:'Cascadia Code',monospace;";
    console.log(
      "%cDREAMS STORAGE%cCAPACITY ENGINE%cTIER-3 READY%c",
      `${fontP} background:#001B2E; color:#2ECC71; padding:6px 12px; font-weight:900; border-radius:4px 0 0 4px;`,
      `${fontP} background:#2ECC71; color:#001B2E; padding:6px 12px; font-weight:800;`,
      `${fontP} background:#102A43; color:#FFF; padding:6px 12px; border-radius:0 4px 4px 0;`,
      "padding-left:10px;"
    );
    console.log(
      `%c» %cALGORITHM:%c Predictive Retention Modeling\n» %cPAYLOAD:%c Bitrate & Framerate Analysis\n» %cAUTHOR:%c Malloy Ruiz | MGM Tecno Sistemas 2026`,
      `${fontM} color:#486581;`, `color:#2ECC71; font-weight:bold;`, `${fontM} color:#486581;`,
      `${fontM} color:#486581;`, `color:#2ECC71; font-weight:bold;`, `${fontM} color:#486581;`,
      `color:#2ECC71; font-weight:bold;`, `${fontM} color:#486581;`
    );
  })();

})();

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// ══════════════════════════════════════════════════════════════════════════
// MÓDULO: CONVERSOR TÉCNICO
// ══════════════════════════════════════════════════════════════════════════
(function() {
  let _convInitialized = false;

  const C = {
   "Longitud":{ icon:"fa-ruler-horizontal", hint:"Longitudes habituales en instalación.", units:{ "Milímetros (mm)":1,"Centímetros (cm)":10,"Metros (m)":100,"Kilómetros (km)":100000,"Pulgadas (in)":25.4,"Pies (ft)":304.8,"Yardas (yd)":914.4,"Millas (mi)":1609344 } },
   "Área":{ icon:"fa-vector-square", hint:"1 m² = 1,000,000 mm².", units:{ "mm²":1,"cm²":100,"m²":1000000,"pulgadas²":645.16,"pies²":92903.04,"hectáreas":100000000 } },
   "Volumen":{ icon:"fa-cube", hint:"Conversión de volumen.", units:{ "mL":1,"Litros (L)":1000,"cm³":1,"m³":1000000,"Pulgadas³":16.387064,"Pies³":28316.846592,"Galones US":3785.411784 } },
   "Peso":{ icon:"fa-weight-hanging", hint:"Masa/peso expresado en unidades habituales.", units:{ "Gramos (g)":1,"Kilogramos (kg)":1000,"Toneladas (t)":1000000,"Onzas (oz)":28.349523125,"Libras (lb)":453.59237 } },
   "Temperatura":{ icon:"fa-thermometer-half", hint:"Conversión exacta entre °C, °F y Kelvin.", units:{"°C":"C","°F":"F","Kelvin (K)":"K"}, special:"temperature" },
   "Voltaje":{ icon:"fa-bolt", hint:"Voltaje eléctrico.", units:{"Microvoltios (µV)":0.000001,"Milivoltios (mV)":0.001,"Voltios (V)":1,"Kilovoltios (kV)":1000} },
   "Corriente":{ icon:"fa-wave-square", hint:"Corriente eléctrica.", units:{"Microamperios (µA)":0.000001,"Miliamperios (mA)":0.001,"Amperios (A)":1,"Kiloamperios (kA)":1000} },
   "Potencia":{ icon:"fa-plug", hint:"Potencia eléctrica y mecánica.", units:{"Milivatios (mW)":0.001,"Vatios (W)":1,"Kilovatios (kW)":1000,"Megavatios (MW)":1000000,"Caballos de fuerza (HP)":745.699872} },
   "Energía":{ icon:"fa-battery-three-quarters", hint:"Energía.", units:{"Milijulios (mJ)":0.001,"Julios (J)":1,"Wh":3600,"kWh":3600000,"MWh":3600000000} },
   "Resistencia":{ icon:"fa-resistor" , hint:"Resistencia eléctrica.", units:{"Miliohmios (mΩ)":0.001,"Ohmios (Ω)":1,"Kiloohmios (kΩ)":1000,"Megaohmios (MΩ)":1000000} },
   "Frecuencia":{ icon:"fa-signal", hint:"Frecuencia de señales y equipos.", units:{"Hz":1,"kHz":1000,"MHz":1000000,"GHz":1000000000} },
   "Datos":{ icon:"fa-database", hint:"Conversión decimal de capacidad de datos.", units:{"bits":0.125,"Bytes (B)":1,"KB":1000,"MB":1000000,"GB":1000000000,"TB":1000000000000,"KiB":1024,"MiB":1048576,"GiB":1073741824,"TiB":1099511627776} },
   "Velocidad de red":{ icon:"fa-network-wired", hint:"Velocidades de transmisión: bps, Kbps, Mbps y Gbps.", units:{"bps":1,"Kbps":1000,"Mbps":1000000,"Gbps":1000000000} },
   "Tiempo":{ icon:"fa-clock", hint:"Tiempo.", units:{"Milisegundos (ms)":0.001,"Segundos (s)":1,"Minutos (min)":60,"Horas (h)":3600,"Días":86400} },
   "Presión":{ icon:"fa-gauge", hint:"Presión.", units:{"Pa":1,"kPa":1000,"bar":100000,"PSI":6894.757293,"atm":101325} },
   "Flujo":{ icon:"fa-faucet", hint:"Flujo volumétrico.", units:{"L/s":1,"L/min":0.0166666666667,"m³/h":0.277777777778,"CFM":0.471947443} },
   "Iluminación":{ icon:"fa-lightbulb", hint:"Unidades fotométricas.", units:{"Lux (lx)":1,"Kilolux (klx)":1000} },
   "Ángulo":{ icon:"fa-drafting-compass", hint:"Ángulos.", units:{"Grados (°)":1,"Radianes (rad)":57.2957795131} },
   "dBm / potencia":{ icon:"fa-chart-bar", hint:"dBm es potencia logarítmica.", units:{"mW":1,"W":1000,"dBm":"dBm"}, special:"dbm" },
   "AWG / cable":{ icon:"fa-cable-car", hint:"Equivalencias nominales AWG ↔ diámetro ↔ área del conductor.", units:{}, special:"awg" }
  };

  const awg = [
    ["0000 (4/0)",11.684,107.219],["000 (3/0)",10.405,85.029],["00 (2/0)",9.266,67.431],["0 (1/0)",8.251,53.475],
    ["1",7.348,42.408],["2",6.544,33.631],["3",5.827,26.670],["4",5.189,21.150],["5",4.621,16.770],["6",4.115,13.300],
    ["7",3.665,10.550],["8",3.264,8.370],["9",2.906,6.630],["10",2.588,5.260],["11",2.305,4.170],["12",2.053,3.310],
    ["13",1.828,2.620],["14",1.628,2.080],["15",1.450,1.650],["16",1.291,1.310],["17",1.150,1.040],["18",1.024,0.823],
    ["19",0.912,0.653],["20",0.812,0.518],["21",0.723,0.410],["22",0.644,0.326],["23",0.573,0.258],["24",0.511,0.205],
    ["25",0.455,0.162],["26",0.405,0.129],["27",0.361,0.102],["28",0.321,0.0810],["29",0.287,0.0642],["30",0.255,0.0509],
    ["31",0.227,0.0404],["32",0.202,0.0320],["33",0.180,0.0254],["34",0.160,0.0201],["35",0.143,0.0169],["36",0.127,0.0127],
    ["37",0.114,0.0100],["38",0.101,0.0080],["39",0.0897,0.0063],["40",0.0799,0.0050]
  ];

  let currentCat = "Longitud";

  function populateCategories(filter="") {
    const catEl = document.getElementById("conv-categories");
    if (!catEl) return;
    catEl.innerHTML = "";
    Object.keys(C).filter(x => x.toLowerCase().includes(filter.toLowerCase()) || Object.keys(C[x].units).some(u=>u.toLowerCase().includes(filter.toLowerCase())))
    .forEach(x => {
      const b = document.createElement("button"); 
      b.className = "cat" + (x === currentCat ? " active" : "");
      const icon = C[x].icon || "fa-circle";
      b.innerHTML = '<i class="fas ' + icon + ' cat-icon"></i><span>' + x + '</span>'; 
      b.onclick = () => selectCategory(x); 
      catEl.appendChild(b);
    });
  }

  function selectCategory(cat) {
    currentCat = cat; 
    const searchEl = document.getElementById("conv-search");
    if (searchEl) populateCategories(searchEl.value);
    
    const data = C[cat];
    const fromEl = document.getElementById("conv-from");
    const toEl = document.getElementById("conv-to");
    if(!fromEl || !toEl) return;

    fromEl.innerHTML = ""; toEl.innerHTML = "";
    
    if (data.special === "awg") {
      ["AWG","Diámetro (mm)","Área (mm²)"].forEach(u => { fromEl.add(new Option(u,u)); toEl.add(new Option(u,u)); });
    } else {
      Object.keys(data.units).forEach(u => { fromEl.add(new Option(u,u)); toEl.add(new Option(u,u)); });
    }
    
    if (toEl.options.length > 1) toEl.selectedIndex = 1;
    const hintEl = document.getElementById("conv-hint");
    if (hintEl) hintEl.textContent = data.hint || "";
    
    convert();
  }

  function tempConvert(v,a,b){
    let c = a==="°C" ? v : a==="°F" ? (v-32)*5/9 : v-273.15;
    return b==="°C" ? c : b==="°F" ? c*9/5+32 : c+273.15;
  }
  function dbmToMw(v){ return Math.pow(10, v/10); }
  function mwToDbm(v){ return 10*Math.log10(v); }
  function dbmConvert(v,a,b){
    let mw = a==="dBm" ? dbmToMw(v) : a==="W" ? v*1000 : v;
    return b==="dBm" ? mwToDbm(mw) : b==="W" ? mw/1000 : mw;
  }
  function awgConvert(v,a,b){
    if (a===b) return v;
    if (a==="AWG"){
      const row = awg.find(r => Math.abs(parseFloat(r[0])===v));
      if (!row) return NaN;
      return b==="Diámetro (mm)" ? row[1] : row[2];
    }
    let row = awg.reduce((best,r) => Math.abs(r[b==="Diámetro (mm)"?1:2]-v) < Math.abs(best[b==="Diámetro (mm)"?1:2]-v) ? r : best, awg[0]);
    return parseFloat(row[0].replace(/[^\d.-]/g,"")) || 0;
  }

  function formatNum(n) {
    if (!Number.isFinite(n)) return "Valor no válido";
    const abs = Math.abs(n);
    if (abs !== 0 && (abs < 0.000001 || abs >= 1e12)) return n.toExponential(6);
    return new Intl.NumberFormat("es-PA", { maximumFractionDigits: 8 }).format(n);
  }

  function convert() {
    const valueEl = document.getElementById("conv-value");
    const fromEl = document.getElementById("conv-from");
    const toEl = document.getElementById("conv-to");
    const resEl = document.getElementById("conv-result");
    const resLbl = document.getElementById("conv-resultLabel");
    if (!valueEl || !fromEl || !toEl || !resEl || !resLbl) return;

    const data = C[currentCat], v = parseFloat(valueEl.value);
    if (Number.isNaN(v)) { resEl.textContent = "—"; return; }
    
    let out;
    if (data.special === "temperature") out = tempConvert(v, fromEl.value, toEl.value);
    else if (data.special === "dbm") out = dbmConvert(v, fromEl.value, toEl.value);
    else if (data.special === "awg") out = awgConvert(v, fromEl.value, toEl.value);
    else {
      const base = v * data.units[fromEl.value];
      out = base / data.units[toEl.value];
    }
    
    const formatted = formatNum(out);
    resEl.textContent = formatted + " " + toEl.value;
    resLbl.textContent = v + " " + fromEl.value + " =";
  }

  function initConversor() {
    if (_convInitialized) return;
    
    const searchEl = document.getElementById("conv-search");
    const valueEl = document.getElementById("conv-value");
    const fromEl = document.getElementById("conv-from");
    const toEl = document.getElementById("conv-to");
    const swapEl = document.getElementById("conv-swap");
    
    if (searchEl) searchEl.addEventListener("input", e => populateCategories(e.target.value));
    [valueEl, fromEl, toEl].forEach(e => { if (e) e.addEventListener("input", convert); });
    
    if (swapEl) {
      swapEl.onclick = () => {
        const x = fromEl.value; fromEl.value = toEl.value; toEl.value = x; convert();
      };
    }
    
    document.querySelectorAll(".conversor-module .conv-tab").forEach(t => {
      t.onclick = () => {
        document.querySelectorAll(".conversor-module .conv-tab").forEach(x => x.classList.remove("active"));
        document.querySelectorAll(".conversor-module .conv-panel").forEach(x => x.classList.remove("active"));
        t.classList.add("active");
        document.getElementById(t.dataset.tab).classList.add("active");
      };
    });

    populateCategories();
    selectCategory(currentCat);
    _convInitialized = true;
  }

  // Calculadora segura dentro del conversor
  let calcExpr = "";
  window.calcInput = function(x) {
    if (x === "%") x = "/100";
    calcExpr += x; 
    const d = document.getElementById("conv-calcDisplay");
    if(d) d.value = calcExpr || "0";
  };
  window.calcClear = function() { calcExpr = ""; const d = document.getElementById("conv-calcDisplay"); if(d) d.value = "0"; };
  window.calcBack = function() { calcExpr = calcExpr.slice(0, -1); const d = document.getElementById("conv-calcDisplay"); if(d) d.value = calcExpr || "0"; };
  window.calcEqual = function() {
    try {
      if (!/^[0-9+\-*/().\s]+$/.test(calcExpr)) throw Error();
      const result = Function('"use strict";return (' + calcExpr + ')')();
      if (!Number.isFinite(result)) throw Error();
      calcExpr = String(result); 
      const d = document.getElementById("conv-calcDisplay");
      if(d) d.value = result;
    } catch (e) {
      const d = document.getElementById("conv-calcDisplay");
      if(d) d.value = "Error";
      calcExpr = "";
      if (typeof showToast === 'function') {
        showToast('Expresión matemática inválida', 'fa-solid fa-triangle-exclamation');
      }
    }
  };

  // Teclado para calculadora
  document.addEventListener("keydown", e => {
    // Solo si el tab activo es toolbox-conversor-tecnico y panel es calculadora
    const mainView = document.getElementById("view-toolbox-conversor-tecnico");
    const calcPanel = document.getElementById("calc-panel");
    if (!mainView || !mainView.classList.contains("active")) return;
    if (!calcPanel || !calcPanel.classList.contains("active")) return;
    
    if (document.activeElement.tagName === "INPUT" && document.activeElement.id !== "conv-calcDisplay") return;
    if (/[0-9+\-*/().%]/.test(e.key)) calcInput(e.key);
    else if (e.key === "Enter") calcEqual();
    else if (e.key === "Backspace") calcBack();
    else if (e.key === "Escape") calcClear();
  });

  // Guard e inicialización de la pestaña
  const _origSwitchConv = window.switchMainTab;
  window.switchMainTab = function(tabName) {
    if (_origSwitchConv) _origSwitchConv(tabName);
    if (tabName === 'toolbox-conversor-tecnico') {
      const _authData = localStorage.getItem('mgm_auth_user');
      if (!_authData) {
        const viewEl = document.getElementById('view-toolbox');
        document.querySelectorAll('.view-container').forEach(v => v.classList.remove('active'));
        if (viewEl) viewEl.classList.add('active');
        if (typeof showToast === 'function') showToast('Debes iniciar sesion para usar las Calculadoras Tecnicas.', 'fa-solid fa-lock');
        return;
      }
      setTimeout(initConversor, 50);
    }
  };

})();


// ══════════════════════════════════════════════════════════════════════════
//  CALCULADORA UPS — gancho de navegacion (mismo patron que almacenamiento)
// ══════════════════════════════════════════════════════════════════════════
(function() {
  var _origSwitchUps = window.switchMainTab;
  window.switchMainTab = function(tabName) {
    if (_origSwitchUps) _origSwitchUps(tabName);
    if (tabName === 'toolbox-calculadora-ups') {
      var _authData = localStorage.getItem('mgm_auth_user');
      if (!_authData) {
        var viewEl = document.getElementById('view-toolbox');
        document.querySelectorAll('.view-container').forEach(function(v){ v.classList.remove('active'); });
        if (viewEl) viewEl.classList.add('active');
        if (typeof showToast === 'function') showToast('Debes iniciar sesion para usar las Calculadoras Tecnicas.', 'fa-solid fa-lock');
        return;
      }
    }
  };
})();

// ══════════════════════════════════════════════════════════════════════════
//  OFFLINE SUPPORT LOGIC
// ══════════════════════════════════════════════════════════════════════════
(function() {
  function updateOnlineStatus() {
    const offlineIcon = document.getElementById('offline-icon');
    if (!navigator.onLine) {
      if (offlineIcon) offlineIcon.style.display = 'inline-block';
      if (typeof window.showToast === 'function') {
        window.showToast("Estás desconectado. El contenido cargado está guardado.", "fa-solid fa-wifi-slash");
      }
    } else {
      if (offlineIcon) offlineIcon.style.display = 'none';
      if (typeof window.showToast === 'function') {
        window.showToast("Conexión restaurada.", "success");
      }
    }
  }

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  
  // Initial check
  if (!navigator.onLine) {
    const offlineIcon = document.getElementById('offline-icon');
    if (offlineIcon) offlineIcon.style.display = 'inline-block';
  }
})();

// ==========================================
// MÓDULO DE REFERIDOS — Funciones Globales
// ==========================================

async function renderReferidosPanel(cedula, refCodeFromClient) {
  if (!cedula) return;

  // Mostrar código de referido en la tarjeta
  const refCodeEl = document.getElementById('dash-ref-code');
  const shareBtn  = document.getElementById('btn-share-whatsapp');

  // Generar código local si el backend aún no lo devuelve
  const refCode = refCodeFromClient || ('MGM-' + (cedula.toString().replace(/[^0-9]/g,'').slice(-4) || '0000'));

  if (refCodeEl) refCodeEl.textContent = refCode;

  const appUrl = window.location.origin + window.location.pathname;
  const link   = `${appUrl}?ref=${encodeURIComponent(refCode)}`;
  const msg    = encodeURIComponent(`¡Hola! Te invito a unirte al programa de puntos MGM. Usa mi código *${refCode}* al registrarte y gana 300 puntos de bienvenida 🎁:\n${link}`);
  if (shareBtn) shareBtn.href = `https://wa.me/?text=${msg}`;
  
  const qrContainer = document.getElementById('qr-code-container');
  const qrImg = document.getElementById('ref-qr-img');
  if (qrContainer && qrImg) {
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(link)}`;
    qrContainer.style.display = 'block';
  }

  // Guardar link para copyReferralCode
  try { sessionStorage.setItem('mgm_my_ref_link', link); } catch(e) {}

  // Obtener lista de referidos del GAS
  const container = document.getElementById('ref-list-container');
  const statsEl   = document.getElementById('dash-ref-stats');
  const ptsTotalEl = document.getElementById('dash-ref-pts-total');

  try {
    const CFG_URL = 'https://script.google.com/macros/s/AKfycbwV90SCVdMrMgE1Vlev3rdpcqMJlVwCV5du_MGJ-BtV5Di8LMY9UroYD7dXhWBXyI2yGw/exec';
    if (!CFG_URL) return;

    const res = await fetch(CFG_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'get_referidos', cedula })
    }).then(r => r.json());

    if (res.success && res.referidos && res.referidos.length > 0) {
      let totalPts = 0;
      container.innerHTML = res.referidos.map(r => {
        const inicial = (r.nombre || '?')[0].toUpperCase();
        const completado = r.estado === 'completado';
        if (completado) totalPts += (r.puntosGanados || 0);
        return `
          <div class="ref-list-item">
            <div class="ref-avatar">${inicial}</div>
            <div class="ref-info">
              <div class="ref-name">${r.nombre}</div>
              <div class="ref-date">${r.fecha || ''} &nbsp; <span class="ref-status-badge ${completado ? 'completado' : 'pendiente'}">${completado ? 'Completado' : 'Pendiente'}</span></div>
            </div>
            <div class="ref-pts ${completado ? 'ganados' : 'pendientes'}">
              ${completado ? '+' + (r.puntosGanados || 300) + ' pts' : 'Pendiente'}
            </div>
          </div>`;
      }).join('');

      if (totalPts > 0 && statsEl && ptsTotalEl) {
        ptsTotalEl.textContent = totalPts.toLocaleString('es-PA');
        statsEl.style.display = 'block';
      }
    }
  } catch(e) {
    console.warn('[MGM Referidos] Error cargando referidos:', e);
  }
}

function copyReferralCode() {
  try {
    const link = sessionStorage.getItem('mgm_my_ref_link') || '';
    if (!link) return;
    navigator.clipboard.writeText(link).then(() => {
      const el = document.getElementById('dash-ref-code');
      const orig = el ? el.textContent : '';
      if (el) el.textContent = '¡Copiado!';
      setTimeout(() => { if (el) el.textContent = orig; }, 1800);
    });
  } catch(e) {}
}
