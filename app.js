/**
 * MGM HUB MOBILE APP - app.js
 * Lógica principal de la WebApp Móvil PWA
 * Módulos: Navegación · MGM Puntos · Agenda & Cursos · Promociones · Asesoría & Magie IA · Multi-Audio Player Streaming
 */
(function () {
  'use strict';

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
    NOTIFS_GAS_URL: 'https://script.google.com/macros/s/AKfycbz8q-CUI-M2TBGhUTHwprY1LE3dTFIX9HzSszunexR493oYx63POxdECktGHCP0wY1YJA/exec',

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
      descripcion:'Disfruta un 10% de descuento especial durante todo tu mes de cumpleaños.\nSolo presenta tu cédula al asesor.',
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

  function isBdayMonth(d) {
    if (!d) return false;
    try { return new Date(d + 'T12:00:00').getMonth() === new Date().getMonth(); } catch { return false; }
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
    // AUTO-LOGIN PUNTOS: si hay sesión activa, cargar dashboard directo
    if (tabName === 'puntos') {
      autoLoadPuntosDashboard();
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

      if (target === 'subview-promos') loadPuntosPromos();
      if (target === 'subview-terminos') loadTerminos();
    });
  });

  document.querySelectorAll('[data-fmt="cedula"]').forEach(inp => {
    inp.addEventListener('input', e => {
      e.target.value = fmtCedula(e.target.value);
    });
  });

  document.getElementById('form-puntos-login')?.addEventListener('submit', async e => {
    e.preventDefault();
    const cedula = document.getElementById('login-cedula').value.trim();
    if (!cedula) { showAlert('puntos-login-alert', 'error', 'Por favor ingresa tu cédula.'); return; }
    const btn = e.target.querySelector('[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Consultando...';

    const res = await api('get_client', { cedula });
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-search"></i> Consultar Mi Saldo';

    if (!res.success) {
      showAlert('puntos-login-alert', 'error', res.message || 'No se encontró tu cuenta. ¿Ya estás registrado/a?');
      return;
    }
    renderDashboard(res.client);
  });

  // AUTO-LOAD: si el usuario ya está autenticado, carga dashboard sin pedir cédula
  async function autoLoadPuntosDashboard() {
    if (!state.authUser) return; // sin sesión, mostrar formulario normal
    // Mostrar spinner mientras recarga datos frescos del GAS
    document.getElementById('puntos-login-box').style.display = 'none';
    document.getElementById('puntos-dashboard-box').style.display = 'block';
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
        // Actualizar estado y perfil con puntos frescos
        state.authUser = { ...state.authUser, ...res.client };
        localStorage.setItem(K_AUTH, JSON.stringify(state.authUser));
        renderDashboard(state.authUser);
        // Actualizar también el icono de perfil
        updateHeaderUserIcon();
        // Actualizar puntos en el modal de perfil si está abierto
        const authPtosEl = document.getElementById('auth-puntos');
        if (authPtosEl) authPtosEl.textContent = state.authUser.puntos || 0;
      }
    } catch(err) {
      console.warn('[MGM] Error refrescando puntos:', err);
    }
  }

  function renderDashboard(c) {
    const pts = parseInt(c.puntos) || 0;
    document.getElementById('dash-pts').textContent        = pts.toLocaleString('es-PA');
    document.getElementById('dash-pts-usd').textContent    = `$${(pts * CFG.VAL_PUNTO).toFixed(2)} USD disponibles para canjear`;
    document.getElementById('dash-holder').textContent     = (c.nombre || '').toUpperCase();
    document.getElementById('dash-cedula-display').textContent = c.cedula || '';
    document.getElementById('dash-tier').textContent       = 'MGM MIEMBRO';

    const bdayEl = document.getElementById('dash-bday-banner');
    if (bdayEl) bdayEl.style.display = isBdayMonth(c.cumpleanos) ? 'flex' : 'none';

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
    document.getElementById('puntos-login-box').style.display    = 'block';
    document.getElementById('puntos-dashboard-box').style.display = 'none';
    document.getElementById('login-cedula').value = '';
    document.getElementById('puntos-login-alert').className = 'app-alert';
  };

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
    btn.innerHTML = '<i class="fa-solid fa-badge-check"></i> Completar Registro';

    if (res.success) {
      showAlert('reg-alert', 'success', res.message || '¡Registro exitoso!');
      e.target.reset();
      if (res.client) setTimeout(() => renderDashboard(res.client), 1500);
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
    if (platform === 'copy') { navigator.clipboard.writeText(text).then(() => alert('¡Texto copiado!')); }
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
        return `
        <div class="cli-feed-item" id="promo-feed-${i}">
            ${p.imagen
                ? `<img class="cli-feed-img" src="${p.imagen}" alt="${p.nombre}" onerror="this.style.display='none'">`
                : `<div class="cli-feed-img-placeholder" style="background:${promoPlaceholderBg(p.tipo)};">${promoPlaceholderEmoji(p.tipo)}</div>`
            }
            <div class="cli-feed-body" onclick="this.classList.toggle('expanded')">
                <span class="cli-feed-type">${(p.tipo||'Especial').toUpperCase()}</span>
                <div class="cli-feed-title">${p.nombre}</div>
                <div class="cli-feed-desc">${p.descripcion}</div>
                <div class="cli-feed-more">Ver más...</div>
                <div class="cli-feed-dates">📅 Válida: ${p.fecha_inicio || ''} — ${p.fecha_fin || ''}</div>
                
                <div style="margin-top: 16px; display: flex; align-items: center; justify-content: space-between;" onclick="event.stopPropagation()">
                    <button class="btn-like ${likes[p.id] ? 'liked' : ''}" onclick="togglePromoLike('${p.id}', this, event)">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="${likes[p.id] ? '#ef4444' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                        <span>${totalLikes} Me gusta</span>
                    </button>
                    <a href="https://wa.me/50762540412?text=Hola,%20quisiera%20mas%20informacion%20sobre%20la%20promocion:%20${encodeURIComponent(p.nombre)}" target="_blank" class="btn-submit" style="text-decoration: none; padding: 8px 12px; font-size: 12px; border-radius: 6px; background: rgba(255,255,255,0.2); color: #fff;">
                        <i class="fa-brands fa-whatsapp"></i> Consultar
                    </a>
                </div>
            </div>
        </div>
        `;
    }).join('');
    
    modal.style.display = 'flex';
    setTimeout(() => {
        const target = document.getElementById('promo-feed-' + idx);
        if (target) {
            target.scrollIntoView({ behavior: 'auto', block: 'start' });
        }
    }, 50);
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
        state.authUser = res.client;
        localStorage.setItem(K_AUTH, JSON.stringify(state.authUser));
        
        // Registrar en notificaciones si es posible
        registerDeviceForNotifs(state.authUser.cedula, state.authUser.nombre);
        
        // Bienvenida automática
        checkAndSendWelcomeNotification(state.authUser.nombre);

        openLoginModal(); // Recargar modal
        updateHeaderUserIcon();
      } else {
        errorMsg.textContent = res.message || 'Credenciales no encontradas en MGM Puntos.';
        errorMsg.style.display = 'block';
      }
    } catch (err) {
      // Fallback offline / demo para propósitos de prueba si GAS falla
      console.warn('Fallback login');
      const c = state.clients.find(x => x.cedula === input || x.correo === input);
      if (c) {
        state.authUser = c;
        localStorage.setItem(K_AUTH, JSON.stringify(state.authUser));
        
        checkAndSendWelcomeNotification(state.authUser.nombre);

        openLoginModal();
        updateHeaderUserIcon();
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
    updateHeaderUserIcon();
    closeAppModal('modal-user-login');
  };

  function updateHeaderUserIcon() {
    const btn = document.getElementById('btn-user-login');
    if (!btn) return;
    if (state.authUser) {
      btn.innerHTML = `<span style="font-weight:800;font-size:14px;color:#0ea5e9;">${state.authUser.nombre.charAt(0).toUpperCase()}</span>`;
      btn.style.background = '#e0f2fe';
    } else {
      btn.innerHTML = `<i class="fa-regular fa-user"></i>`;
      btn.style.background = 'rgba(0,0,0,0.05)';
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
    if (CFG.NOTIFS_GAS_URL === 'URL_TEMPORAL_PENDIENTE') return;
    try {
      await fetch(CFG.NOTIFS_GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'register_device', cedula, nombre })
      });
    } catch(e) {}
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

      if (res.success && Array.isArray(res.notifications) && res.notifications.length > 0) {
        let hasNew = false;
        res.notifications.forEach(n => {
          const stringId = String(n.id);
          const alreadyExists = state.notifications.some(existing => String(existing.id) === stringId);
          const isCleared = state.clearedNotifs.includes(stringId);

          if (!alreadyExists && !isCleared) {
            state.notifications.unshift(n);
            hasNew = true;
            // Disparar notificación nativa del sistema
            fireNativeNotif(n.title, n.body);
          }
        });

        if (hasNew) {
          localStorage.setItem(K_NOTIFS, JSON.stringify(state.notifications));
          updateNotifBadge();
        }
      }
    } catch(e) {
      console.warn('[MGM Hub] Error al consultar notificaciones:', e);
    }
  }

  // Chequear notificaciones cada vez que el usuario vuelve a abrir la app (vuelve al tab)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      checkNotifications();
    }
  });

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

    list.innerHTML = state.notifications.map(n => {
      // Detectar si la notificación es de puntos para agregar deeplink
      const isPuntos = n.title && (n.title.toLowerCase().includes('punto') || n.title.toLowerCase().includes('cumpleaños') || n.title.toLowerCase().includes('cumpleanos'));
      const iconClass = isPuntos ? 'fa-star' : 'fa-circle-info';
      const iconColor = isPuntos ? '#f59e0b' : '#0ea5e9';
      const clickAction = isPuntos ? `onclick="closeAppModal('modal-notifications'); switchMainTab('puntos');" style="cursor:pointer;"` : '';
      return `
      <div ${clickAction} style="background:#fff; border:1px solid var(--border-light); border-radius:12px; padding:14px; margin-bottom:10px; box-shadow:0 2px 6px rgba(0,33,74,0.05); transition: box-shadow 0.2s;" onmouseover="this.style.boxShadow='0 4px 14px rgba(0,33,74,0.13)'" onmouseout="this.style.boxShadow='0 2px 6px rgba(0,33,74,0.05)'">
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
          <i class="fa-solid ${iconClass}" style="color:${iconColor}; font-size:14px;"></i>
          <div style="font-size:14px; font-weight:800; color:var(--text-dark); flex:1;">${n.title}</div>
          ${isPuntos ? '<span style="font-size:10px; background:#fef3c7; color:#b45309; padding:2px 7px; border-radius:20px; font-weight:700;">Ver detalles →</span>' : ''}
        </div>
        <div style="font-size:13px; color:var(--text-muted); line-height:1.5;">${n.body}</div>
        <div style="font-size:11px; color:#cbd5e1; margin-top:8px; text-align:right;">${n.date || 'Reciente'}</div>
      </div>`;
    }).join('');
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // INIT — ARRANCA LA APP MGM HUB
  // ══════════════════════════════════════════════════════════════════════════════

  async function init() {
    switchMainTab('home');

    // Inicializar estado de UI autenticación
    updateHeaderUserIcon();
    
    // Si el usuario está autenticado, registrar equipo (si el backend existe) y checar notificaciones
    if (state.authUser) {
      registerDeviceForNotifs(state.authUser.cedula, state.authUser.nombre);
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
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
