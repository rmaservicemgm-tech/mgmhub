(function () {
  'use strict';

  const MODE_KEY = 'mgm_theme_beta_mode';
  const ACCENT_KEY = 'mgm_theme_beta_accent';
  const CUSTOM_COLOR_KEY = 'mgm_theme_beta_custom';
  const presets = {
    mgm: '#0073e6',
    teal: '#0891b2',
    green: '#16a34a',
    violet: '#7c3aed',
    rose: '#e11d48',
    amber: '#d97706'
  };

  function readStoredValue(key, fallback) {
    try {
      return localStorage.getItem(key) || fallback;
    } catch (error) {
      console.warn('[MGM Hub Temas Beta] No se pudo leer la apariencia guardada:', error);
      return fallback;
    }
  }

  function saveStoredValue(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('[MGM Hub Temas Beta] No se pudo guardar la apariencia:', error);
    }
  }

  function getAccentColor(accent) {
    if (accent === 'custom') {
      const custom = readStoredValue(CUSTOM_COLOR_KEY, '#0ea5e9');
      return /^#[0-9a-f]{6}$/i.test(custom) ? custom : '#0ea5e9';
    }
    return presets[accent] || presets.mgm;
  }

  function setColorVariables(color) {
    const root = document.documentElement;
    const rgb = color.match(/[0-9a-f]{2}/gi).map(value => parseInt(value, 16));
    const isDark = root.dataset.theme === 'dark';
    const mixTarget = isDark ? [15, 30, 48] : [255, 255, 255];
    const mixRatio = isDark ? 0.28 : 0.88;
    const soft = rgb.map((channel, index) => Math.round(channel * (1 - mixRatio) + mixTarget[index] * mixRatio));
    root.style.setProperty('--user-accent', color);
    root.style.setProperty('--user-accent-soft', `rgb(${soft.join(', ')})`);
    root.style.setProperty('--user-accent-glow', `rgba(${rgb.join(', ')}, 0.22)`);
  }

  function applyTheme() {
    const mode = readStoredValue(MODE_KEY, 'light') === 'dark' ? 'dark' : 'light';
    const accent = readStoredValue(ACCENT_KEY, 'mgm');
    const root = document.documentElement;
    root.dataset.theme = mode;
    root.dataset.accent = accent;
    setColorVariables(getAccentColor(accent));

    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) themeColor.content = mode === 'dark' ? '#08111f' : '#f0f4f9';
  }

  window.setMgmThemeMode = function (mode) {
    saveStoredValue(MODE_KEY, mode === 'dark' ? 'dark' : 'light');
    applyTheme();
    window.syncMgmThemeControls();
  };

  window.setMgmThemeAccent = function (accent, customColor) {
    const selected = Object.prototype.hasOwnProperty.call(presets, accent) || accent === 'custom' ? accent : 'mgm';
    if (selected === 'custom' && customColor && /^#[0-9a-f]{6}$/i.test(customColor)) {
      saveStoredValue(CUSTOM_COLOR_KEY, customColor);
    }
    saveStoredValue(ACCENT_KEY, selected);
    applyTheme();
    window.syncMgmThemeControls();
  };

  window.syncMgmThemeControls = function () {
    const mode = document.getElementById('mgm-theme-mode');
    const accent = document.getElementById('mgm-theme-accent');
    const color = document.getElementById('mgm-theme-custom-color');
    if (mode) mode.value = readStoredValue(MODE_KEY, 'light');
    if (accent) accent.value = readStoredValue(ACCENT_KEY, 'mgm');
    if (color) color.value = getAccentColor('custom');
  };

  applyTheme();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.syncMgmThemeControls, { once: true });
  } else {
    window.syncMgmThemeControls();
  }
})();
