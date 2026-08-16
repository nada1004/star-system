/* ══════════════════════════════════════════════════════════════
   보드2 브리핑 - 날짜범위/상태저장/필터 유틸 (board2-briefing.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

// 로컬(기기) 시간대 기준 YYYY-MM-DD. toISOString()은 UTC로 변환하면서
// 한국시간(UTC+9) 자정 근처 날짜가 하루 앞으로 밀리는 문제가 있어 사용하지 않는다.
function _b2FmtLocalYMD(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function _b2WeeklyGetDefaultRange(offsetWeeks) {
  const now = new Date();
  const offset = offsetWeeks || 0;
  const day = now.getDay();
  const diffToMon = (day === 0 ? -6 : 1 - day);
  const mon = new Date(now);
  mon.setDate(now.getDate() + diffToMon + offset * 7);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  // 월간(_b2MonthlyGetDefaultRange)과 동일하게, 진행 중인 이번주(offset===0)는 아직
  // 일요일이 지나지 않았으므로 끝나지 않은 미래 날짜(일요일)가 아니라 "오늘"까지만 반영한다.
  // 이걸 빠뜨리면 이번주 기록이 아직 진행 중인데도 이미 끝난 주(월~일 전체)처럼 저장되어,
  // 스트리머 팝업 MVP 기록에 미래 날짜가 찍히거나 "확정된" 기록처럼 보이다가 뒤늦게
  // 다른 선수로 바뀌는 것처럼 보이는 원인이 된다.
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const to = (offset === 0 && today < sun) ? today : sun;
  return { from: _b2FmtLocalYMD(mon), to: _b2FmtLocalYMD(to) };
}
function _b2MonthlyGetDefaultRange(offsetMonths, fullMonth) {
  const now = new Date();
  const offset = offsetMonths || 0;
  const base = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const from = new Date(base.getFullYear(), base.getMonth(), 1);
  const to = fullMonth
    ? new Date(base.getFullYear(), base.getMonth() + 1, 0)
    : (offset === 0 ? new Date(now.getFullYear(), now.getMonth(), now.getDate()) : new Date(base.getFullYear(), base.getMonth() + 1, 0));
  return { from: _b2FmtLocalYMD(from), to: _b2FmtLocalYMD(to) };
}
function _b2EnsureStyleTag(id, cssText) {
  try {
    const head = document.head || (document.getElementsByTagName && document.getElementsByTagName('head')[0]);
    if (!head) return;
    const css = String(cssText || '');
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement('style');
      el.id = id;
      el.type = 'text/css';
      el.appendChild(document.createTextNode(css));
      head.appendChild(el);
      return;
    }
    if ((el.textContent || '') !== css) el.textContent = css;
  } catch (e) {}
}
// ── MVP 카드 그라디언트 효과 / 디자인 모드 설정 (설정탭 "브리핑 디자인 & 효과"에서 조정) ──
function _b2MvpFxDefaults() {
  return { on: true, style: 'fade', intensity: 30, design: 'photo' };
}
const _B2_MVP_FX_STYLES = ['fade', 'vignette', 'topbottom', 'tint', 'spotlight', 'noir', 'diagonal', 'glass', 'none'];
const _B2_MVP_DESIGNS = ['photo', 'panel', 'frame', 'glasscard', 'border', 'ribbon', 'split', 'poster'];
function _b2MvpFxLoad() {
  const d = _b2MvpFxDefaults();
  try {
    const onRaw = localStorage.getItem('su_b2mvp_fx_on');
    const styleRaw = localStorage.getItem('su_b2mvp_fx_style');
    const intRaw = localStorage.getItem('su_b2mvp_fx_intensity');
    const designRaw = localStorage.getItem('su_b2mvp_design_mode');
    const on = onRaw === null ? d.on : onRaw === '1';
    const style = _B2_MVP_FX_STYLES.includes(styleRaw) ? styleRaw : d.style;
    const design = _B2_MVP_DESIGNS.includes(designRaw) ? designRaw : d.design;
    const intN = parseInt(intRaw, 10);
    const intensity = Number.isFinite(intN) ? Math.max(0, Math.min(100, intN)) : d.intensity;
    return { on, style, intensity, design };
  } catch (e) {
    return d;
  }
}
// ── 브리핑 탭 전체 디자인 테마 (설정탭에서 선택, MVP 카드 외 헤더/카드/색감 톤 전체에 적용) ──
const _B2_BRIEFING_THEMES = ['classic', 'minimal', 'vivid', 'mono', 'elegant', 'pastel', 'luxury', 'sports', 'esports', 'pop', 'nature', 'ocean', 'sunset', 'neon'];
function _b2BriefingThemeLoad() {
  try {
    const v = localStorage.getItem('su_b2_briefing_theme');
    return _B2_BRIEFING_THEMES.includes(v) ? v : 'classic';
  } catch (e) {
    return 'classic';
  }
}
function _b2IsValidDateStr(s) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(s || '').trim());
}
function _b2NormalizeBriefingRange(from, to) {
  const f = String(from || '').trim().slice(0, 10);
  const t = String(to || '').trim().slice(0, 10);
  if (!_b2IsValidDateStr(f) || !_b2IsValidDateStr(t)) return { from: f, to: t, swapped: false };
  const fn = parseInt(f.replace(/-/g, ''), 10) || 0;
  const tn = parseInt(t.replace(/-/g, ''), 10) || 0;
  if (fn && tn && fn > tn) return { from: t, to: f, swapped: true };
  return { from: f, to: t, swapped: false };
}
function _b2BriefingLoadState() {
  try {
    const raw = localStorage.getItem('b2w2_state_v1');
    if (!raw) return null;
    const st = JSON.parse(raw);
    if (!st || typeof st !== 'object') return null;
    const preset = String(st.preset || '').trim();
    const from = String(st.from || '').trim();
    const to = String(st.to || '').trim();
    const univ = String(st.univ || '').trim() || '전체';
    const okPreset = ['thisWeek', 'lastWeek', 'thisMonth', 'lastMonth', 'custom', 'mvpArchive'].includes(preset);
    const norm = _b2NormalizeBriefingRange(from, to);
    return {
      preset: okPreset ? preset : null,
      from: _b2IsValidDateStr(norm.from) ? norm.from : null,
      to: _b2IsValidDateStr(norm.to) ? norm.to : null,
      univ
    };
  } catch (e) {
    return null;
  }
}
function _b2BriefingSaveState() {
  try {
    const preset = String(window._b2WeeklyPreset || '').trim();
    const from = String(window._b2WeeklyDateFrom || '').trim();
    const to = String(window._b2WeeklyDateTo || '').trim();
    const univ = String(window._b2WeeklyUniv || '전체').trim() || '전체';
    const payload = {
      preset: ['thisWeek', 'lastWeek', 'thisMonth', 'lastMonth', 'custom', 'mvpArchive'].includes(preset) ? preset : 'custom',
      from,
      to,
      univ
    };
    localStorage.setItem('b2w2_state_v1', JSON.stringify(payload));
  } catch (e) {}
}
function _b2BriefingPresetRange(preset) {
  const key = String(preset || 'thisWeek');
  if (key === 'lastWeek') return _b2WeeklyGetDefaultRange(-1);
  if (key === 'thisMonth') return _b2MonthlyGetDefaultRange(0, false);
  if (key === 'lastMonth') return _b2MonthlyGetDefaultRange(-1, true);
  return _b2WeeklyGetDefaultRange(0);
}
function _b2SetBriefingPreset(preset) {
  const r = _b2BriefingPresetRange(preset);
  window._b2WeeklyPreset = String(preset || 'thisWeek');
  window._b2WeeklyDateFrom = r.from;
  window._b2WeeklyDateTo = r.to;
  _b2BriefingSaveState();
  if (typeof render === 'function') render();
}
// 기간/대학 필터를 기본값(이번주 · 전체 대학)으로 되돌림
function _b2ResetBriefingFilters() {
  window._b2WeeklyUniv = '전체';
  window._b2WeeklyChartSort = 'games';
  try { localStorage.setItem('b2w2_chart_sort_v1', 'games'); } catch (e) {}
  _b2SetBriefingPreset('thisWeek');
}
function _b2GetBriefingInputValues() {
  const f = document.getElementById('b2w2-from');
  const t = document.getElementById('b2w2-to');
  const s = document.getElementById('b2w2-univ');
  const fallback = _b2BriefingPresetRange('thisWeek');
  return {
    from: (f && f.value) || window._b2WeeklyDateFrom || fallback.from,
    to: (t && t.value) || window._b2WeeklyDateTo || fallback.to,
    univ: (s && s.value) || window._b2WeeklyUniv || '전체'
  };
}
function _b2SyncBriefingCustomInputs(applyNow) {
  const v = _b2GetBriefingInputValues();
  const norm = _b2NormalizeBriefingRange(v.from, v.to);
  window._b2WeeklyDateFrom = norm.from;
  window._b2WeeklyDateTo = norm.to;
  window._b2WeeklyUniv = v.univ;
  window._b2WeeklyPreset = 'custom';
  if (norm.swapped) {
    const f = document.getElementById('b2w2-from');
    const t = document.getElementById('b2w2-to');
    if (f) f.value = norm.from;
    if (t) t.value = norm.to;
  }
  _b2BriefingSaveState();
  if (applyNow && typeof render === 'function') render();
}
function _b2ApplyBriefingCustomFromInputs() {
  _b2SyncBriefingCustomInputs(true);
}
function _b2ActivateBriefingCustom(focusInput) {
  _b2SyncBriefingCustomInputs(true);
  if (focusInput) {
    setTimeout(() => {
      const el = document.getElementById('b2w2-from');
      if (el && typeof el.focus === 'function') el.focus();
      try{ if (el && typeof el.showPicker === 'function') el.showPicker(); }catch(e){}
    }, 30);
  }
}
function _b2SetBriefingRecentDays(days) {
  const n = Math.max(1, Number(days) || 7);
  const to = new Date();
  to.setHours(0,0,0,0);
  const from = new Date(to);
  from.setDate(to.getDate() - (n - 1));
  window._b2WeeklyPreset = 'custom';
  window._b2WeeklyDateFrom = _b2FmtLocalYMD(from);
  window._b2WeeklyDateTo = _b2FmtLocalYMD(to);
  _b2BriefingSaveState();
  if (typeof render === 'function') render();
}
// ─── MVP 아카이브 모드: 기록 종류(전체/주간/월간) · 대학 필터 상태 ──
function _b2SetMvpArchiveType(kind) {
  window._b2MvpArchiveType = ['week','month'].includes(kind) ? kind : 'all';
  if (typeof render === 'function') render();
}
function _b2SetMvpArchiveUniv(val) {
  window._b2MvpArchiveUniv = String(val || '전체').trim() || '전체';
  if (typeof render === 'function') render();
}
function _b2OpenBriefingDateInput(which) {
  const id = which === 'to' ? 'b2w2-to' : 'b2w2-from';
  const el = document.getElementById(id);
  if (!el) return;
  try { if (typeof el.focus === 'function') el.focus(); } catch(e){}
  try {
    if (typeof el.showPicker === 'function') {
      el.showPicker();
      return;
    }
  } catch(e){}
  const current = String(el.value || (which === 'to' ? window._b2WeeklyDateTo : window._b2WeeklyDateFrom) || '').trim();
  const input = window.prompt('날짜를 YYYY-MM-DD 형식으로 입력하세요.', current);
  if (input == null) return;
  const raw = String(input).trim().replace(/\./g,'-').replace(/\//g,'-');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    alert('날짜 형식은 YYYY-MM-DD 로 입력해주세요.');
    return;
  }
  el.value = raw;
  _b2SyncBriefingCustomInputs(true);
}


// 데이터 집계 헬퍼(_b2WeeklyAggregate 등)는 board2-briefing-data.js 로 분리됨

// ─── 대학별 전적 현황 정렬 기준 토글(전적순/승률순) ─────
function _b2SetWeeklyChartSort(mode) {
  const next = mode === 'winrate' ? 'winrate' : 'games';
  if (window._b2WeeklyChartSort === next) return;
  window._b2WeeklyChartSort = next;
  try { localStorage.setItem('b2w2_chart_sort_v1', next); } catch (e) {}
  if (typeof render === 'function') render();
}
try {
  if (typeof window._b2WeeklyChartSort === 'undefined') {
    window._b2WeeklyChartSort = (() => {
      try { return localStorage.getItem('b2w2_chart_sort_v1') || 'games'; } catch (e) { return 'games'; }
    })();
  }
} catch (e) {}

