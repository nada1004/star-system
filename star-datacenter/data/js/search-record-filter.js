/* ══════════════════════════════════════════════════════════════
   검색 - 기록 필터/맵 별칭/자동 출력 포맷 (search-parsing.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

// ── 검색바 실시간 DOM 필터링 (render() 없이 한글 IME 호환) ──────────────────
function recFilterInPlace(mode, query) {
  const q = (query || '').toLowerCase().trim();
  const container = document.getElementById('rec-list-' + mode);
  if (!container) return;
  const items = container.querySelectorAll('.rec-summary[data-hay]');
  let shown = 0;
  items.forEach(el => {
    const hay = (el.getAttribute('data-hay') || '').toLowerCase();
    const match = !q || hay.includes(q);
    el.style.display = match ? '' : 'none';
    if (match) shown++;
  });
  // 결과 카운트 업데이트
  const countEl = document.getElementById('rq-count-' + mode);
  if (countEl) countEl.textContent = q ? shown + '건' : '';
  // X 버튼 표시/숨김
  const clearBtn = document.getElementById('rq-clear-' + mode);
  if (clearBtn) clearBtn.style.display = q ? 'inline-block' : 'none';
  // 빈 결과 메시지
  const emptyEl = document.getElementById('rq-empty-' + mode);
  if (emptyEl) emptyEl.style.display = (q && shown === 0) ? 'block' : 'none';
  // 저장
  if (!window._recQ) window._recQ = {};
  window._recQ[mode] = query;
}

function recClearSearch(mode) {
  if (!window._recQ) window._recQ = {};
  window._recQ[mode] = '';
  const inp = document.getElementById('rq-' + mode);
  if (inp) { inp.value = ''; inp.focus(); }
  recFilterInPlace(mode, '');
}

/* ══════════════════════════════════════
   붙여넣기 자동 입력 기능
══════════════════════════════════════ */

// 맵 약자 → 전체 이름 매핑 (시스템 maps 배열에도 없으면 그대로 사용)
const PASTE_MAP_ALIAS_DEFAULT = {
  // ── 전체 이름 ──
  '투혼':'투혼','라데온':'라데온','라데리안':'라데온','녹아웃':'녹아웃','리트리트':'리트리트',
  '폴리포이드':'폴리포이드','플스타':'플스타','옥타곤':'옥타곤',
  // 애티튜드 표기 통일 (에티튜드도 호환)
  '애티튜드':'애티튜드','에티튜드':'애티튜드',
  '매치포인트':'매치포인트','도미네이터':'도미네이터',
  '실피드':'실피드','블리츠':'블리츠','서킷':'서킷','신 개마고원':'신 개마고원',
  '아이언포리스트':'아이언포리스트','파이썬':'파이썬','화랑':'화랑','지옥섬':'지옥섬',
  '투영':'투영','네오리게이트':'네오리게이트','메트로폴리스':'메트로폴리스',
  // 제인스
  '제인스':'제인스',
  // ── 약자 ──
  '라데':'라데온','라':'라데온','라데리안':'라데온',
  '녹아':'녹아웃','녹':'녹아웃',
  '리트':'리트리트','리':'리트리트',
  '폴':'폴리포이드','폴리':'폴리포이드','폴스':'폴리포이드',   // 폴스 추가
  '플스':'플스타','플립':'플스타',                             // 플립 추가
  '옥':'옥타곤','옥타':'옥타곤',                               // 옥타 추가
  // 애티튜드
  '에티':'애티튜드','애티':'애티튜드','에':'애티튜드',
  '매':'매치포인트','매치':'매치포인트',
  '도미':'도미네이터','도':'도미네이터',
  '실':'실피드','실피':'실피드',
  '블리':'블리츠','블':'블리츠',
  '서':'서킷',
  '투':'투혼',
  '메트':'메트로폴리스','메':'메트로폴리스',
  '개마':'신 개마고원','신개마':'신 개마고원','개':'신 개마고원',
  '아이':'아이언포리스트','포리':'아이언포리스트','아이언':'아이언포리스트',
  '파이':'파이썬','파':'파이썬',
  '화':'화랑',
  '지옥':'지옥섬','지':'지옥섬',
  '네오':'네오리게이트','리게':'네오리게이트',
  // 제인스
  '제인':'제인스',
};

// NFC 정규화: 다른 앱(카톡/디스코드 등)에서 복사한 텍스트가 NFD(분해형)로 들어와
// 설정 탭에 저장된 NFC(완성형) 약자와 겉보기엔 같아도 매칭 실패하는 것을 방지
function _mapAliasNfc(s) {
  s = String(s == null ? '' : s);
  return s.normalize ? s.normalize('NFC') : s;
}

// 기본 약자 + 사용자 정의 약자를 합쳐 반환
function getMapAlias() {
  const user = typeof userMapAlias !== 'undefined' ? userMapAlias : {};
  const merged = Object.assign({}, PASTE_MAP_ALIAS_DEFAULT, user);
  // __disabled 마커가 있는 기본 약자 제외
  Object.keys(user).forEach(k => {
    if(k.endsWith('__disabled')) {
      const orig = k.replace('__disabled','');
      delete merged[orig];
      delete merged[k];
    }
  });
  // 키/값을 NFC로 정규화한 항목도 함께 넣어 반환 (원본 키도 유지해 하위호환)
  const nfcDict = {};
  Object.keys(merged).forEach(k => {
    nfcDict[_mapAliasNfc(k)] = _mapAliasNfc(merged[k]);
  });
  return Object.assign({}, merged, nfcDict);
}

// 맵 이름 변환: exact alias → prefix 매칭(2자 이상) → 원본 반환
function resolveMapName(alias) {
  if (!alias) return alias;
  const dict = getMapAlias();
  const aliasNfc = _mapAliasNfc(alias).trim();
  if (dict[alias]) return dict[alias];
  if (dict[aliasNfc]) return dict[aliasNfc];
  if (aliasNfc.length < 2) return alias;
  // 등록된 전체 맵 이름 중 prefix 일치
  const allFull = [...new Set(Object.values(dict))];
  const pre = allFull.find(m => _mapAliasNfc(m).startsWith(aliasNfc));
  if (pre) return pre;
  // 사용자가 직접 등록한 maps 배열에서도 prefix 매칭
  const regPre = (typeof maps !== 'undefined' ? maps : []).find(m => _mapAliasNfc(m).startsWith(aliasNfc));
  if (regPre) return regPre;
  return alias;
}

/* ─────────────────────────────────────────────────────────────
   (요청사항) 자동인식 출력 포맷(전역)
   - 설정에서 어떤 입력이 와도 결과를 동일 포맷으로 출력할 수 있도록 통합
   - 변환툴/자동인식(표시·복사·출력)에서 공용으로 사용
───────────────────────────────────────────────────────────── */
const _AUTO_OUTFMT_KEY = 'su_auto_outfmt';
function _autoOutfmtDefault(){
  return {
    includeRace: true,      // 선수(종족)
    includeMap: true,       // [맵]
    mapBrackets: true,      // 맵을 [ ] 로 감쌈
    winnerEmphasis: 'none', // none | star | md
    winMark: '✅',
    loseMark: '⬜',
    vsMark: '🆚️',
    hideUnknownRace: true   // 종족이 N/미정이면 표시 안 함
  };
}
function autoOutfmtLoad(){
  try{
    const raw = localStorage.getItem(_AUTO_OUTFMT_KEY);
    if(!raw) return _autoOutfmtDefault();
    const obj = JSON.parse(raw) || {};
    return {..._autoOutfmtDefault(), ...obj};
  }catch(e){
    return _autoOutfmtDefault();
  }
}
function autoOutfmtSave(next){
  try{ localStorage.setItem(_AUTO_OUTFMT_KEY, JSON.stringify({..._autoOutfmtDefault(), ...(next||{})})); }catch(e){}
}
function _autoGetRace(name){
  try{
    if(typeof players !== 'undefined' && Array.isArray(players)){
      const p = players.find(x=>x && x.name===name);
      const r = (p && p.race) ? String(p.race).trim().toUpperCase() : '';
      if(r==='T'||r==='Z'||r==='P'||r==='N') return r;
    }
  }catch(e){}
  return '';
}
function autoFormatMatchLine(winName, loseName, mapName){
  const fmt = autoOutfmtLoad();
  const w = String(winName||'').trim();
  const l = String(loseName||'').trim();
  const m = String(mapName||'').trim();
  if(!w || !l) return '';

  const racePart = (nm)=>{
    if(!fmt.includeRace) return '';
    const r = _autoGetRace(nm);
    if(!r) return '';
    if(fmt.hideUnknownRace && r==='N') return '';
    return `(${r})`;
  };
  const emph = (nm)=>{
    if(fmt.winnerEmphasis==='md') return `**${nm}**`;
    if(fmt.winnerEmphasis==='star') return `★${nm}`;
    return nm;
  };
  const mapPart = ()=>{
    if(!fmt.includeMap) return '';
    if(!m || m==='-') return '';
    return fmt.mapBrackets ? `[${m}]` : m;
  };

  const mp = mapPart();
  return `${emph(w)}${racePart(w)} ${fmt.winMark} ${fmt.vsMark} ${fmt.loseMark} ${l}${racePart(l)}${mp ? ' ' + mp : ''}`.trim();
}

// 전역 노출(다른 모듈/설정에서 재사용)
try{
  window.autoOutfmtLoad = autoOutfmtLoad;
  window.autoOutfmtSave = autoOutfmtSave;
  window.autoFormatMatchLine = autoFormatMatchLine;
}catch(e){}

/**
 * 형식 C 파싱: N세트 맵약자 선수A 누적A:누적B 선수B
 * 예) "1세트 실피 이재호 0:1 변현제"
 * 누적 스코어를 이전 줄과 비교해 이번 세트 승자를 판별.
 * prevScore = {a, b} (직전까지의 누적), null이면 0:0 기준
 * 반환: { winName, loseName, map, nextScore:{a,b} } | null
 */
