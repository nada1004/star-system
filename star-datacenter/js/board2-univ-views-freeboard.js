// board2-univ-views.js에서 분리됨 (대학별 그룹핑(_b2UnivBlock) + 무소속 뷰 + 멤버 상세/이미지 저장) — 원본 라인 1346-1851

function _b2UnivBlock(univName, col, members, forExport=false) {
  // Safety check for undefined university name
  if (!univName) {
    return `<div style="border-radius:14px;border:2px dashed #ccc55;padding:16px 18px;background:#f5f5f5;display:flex;align-items:center;gap:10px;opacity:.7">
      <span style="font-weight:900;font-size:var(--fs-md);color:#999;">[Unknown University]</span>
      <span style="font-size:var(--fs-caption);color:var(--gray-l)"> university name is undefined</span>
    </div>`;
  }
  
  const uCfg = univCfg.find(x => x.name === univName) || {};
  const iconUrl = uCfg.icon || uCfg.img || UNIV_ICONS[univName] || '';
  const textCol = _b2ContrastColor(col);
  const lightCol = col + _b2AlphaHex(b2BgAlpha);
  const labelCol = col + _b2AlphaHex(b2LabelAlpha);
  const _hasBgImg = !!uCfg.bgImg;
  const _isDark = (typeof document!=='undefined' && document.body && document.body.classList.contains('dark'));
  const _softPanel = _isDark
    ? 'linear-gradient(180deg,rgba(15,23,42,.72),rgba(15,23,42,.6))'
    : 'linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.94))';
  const _softBorder = _hasBgImg ? 'rgba(255,255,255,.18)' : (_isDark ? 'rgba(148,163,184,.32)' : 'rgba(255,255,255,.55)');
  const _rowPanelBg = _hasBgImg
    ? 'linear-gradient(180deg,rgba(255,255,255,.00),rgba(248,250,252,.00))'
    : _softPanel;
  const _memoPanelBg = _hasBgImg
    ? 'linear-gradient(180deg,rgba(255,255,255,.12),rgba(248,250,252,.04))'
    : _softPanel;
  const _rowPanelBorder = _hasBgImg ? 'rgba(255,255,255,.04)' : _softBorder;
  const _rowPanelShadow = _hasBgImg ? 'none' : (_isDark ? '0 10px 18px rgba(0,0,0,.22)' : '0 10px 18px rgba(15,23,42,.04)');

  // 멤버 없을 때 빈 블록
  if (!members.length) {
    return `<div style="border-radius:14px;border:2px dashed ${col}55;padding:16px 18px;background:${lightCol};display:flex;align-items:center;gap:10px;opacity:.7">
      ${iconUrl?`<img src="${toHttpsUrl(iconUrl)}" style="width:var(--su_univ_logo_size,36px);height:var(--su_univ_logo_size,36px);object-fit:contain;border-radius:var(--su_univ_logo_radius,10px)" onerror="this.style.display='none'">`:''}
      <span style="font-weight:900;font-size:var(--fs-md);color:${col};cursor:pointer" onclick="if(typeof openUnivModal==='function')openUnivModal('${univName}')">${univName}</span>
      <span style="font-size:var(--fs-caption);color:var(--gray-l)">등록된 선수 없음</span>
    </div>`;
  }

  // 직책 그룹
  const roledMembers = members.filter(p => _b2HasRole(p));
  roledMembers.sort((a,b) => _b2RoleRank(a) - _b2RoleRank(b));

  // 티어 그룹
  const tieredMembers = members.filter(p => !_b2HasRole(p));
  const tierGroups = {};
  tieredMembers.forEach(p => {
    const t = p.tier || '?';
    if (!tierGroups[t]) tierGroups[t] = [];
    tierGroups[t].push(p);
  });
  const orderedTierKeys = TIERS.filter(t => tierGroups[t]).concat(
    Object.keys(tierGroups).filter(t => !TIERS.includes(t))
  );

  // 사이드 패널 (현황판 memoImgs/memo) — _tableRow 정의 전에 계산해야 padding-right에 사용 가능
  const _smemo = uCfg.memo || '';
  const _simgs = (uCfg.memoImgs||[]).concat(uCfg.memoImg?[uCfg.memoImg]:[]);
  const hasSide = !!((_smemo||_simgs.length));

  // 새 레이아웃: 왼쪽 라벨 열(대학색) + 오른쪽 스트리머 열(연한 배경)
  const _tableRow = (label, isRole, chips) => `
    <div data-b2-univ-row="1" class="b2-univ-row" style="display:flex;align-items:stretch;gap:0;margin-bottom:8px">
      <div class="b2-univ-row-label" style="background:${labelCol}!important;min-width:70px;width:70px;display:flex;align-items:center;justify-content:center;padding:10px 6px;flex-shrink:0;border-radius:var(--r2) 0 0 16px;border:1px solid ${col}33;border-right:none;box-shadow:inset 0 1px 0 rgba(255,255,255,.28)">
        <span style="font-size:var(--fs-caption);font-weight:900;color:${col};text-align:center;line-height:1.35;word-break:keep-all;letter-spacing:-.01em">${label}</span>
      </div>
      <div class="b2-univ-row-body" style="flex:1;min-width:0;background:${_rowPanelBg};padding:10px 12px;border-radius:0 16px 16px 0;border:1px solid ${_rowPanelBorder};box-shadow:${_rowPanelShadow}">
        ${chips}
      </div>
    </div>`;

  // 같은 직책끼리 묶어서 1행
  const roleGroups = {};
  const roleOrder = [];
  roledMembers.forEach(p => {
    const r = p.role || '';
    if (!roleGroups[r]) { roleGroups[r] = []; roleOrder.push(r); }
    roleGroups[r].push(p);
  });
  const _bgPos = uCfg.bgImgPos || 'center center';
  const _bgSize = uCfg.bgImgSize || 'auto';
  // [FIX-BRIGHT-1] 모든 대학이 동일한 밝기 공식을 사용 (설정탭 슬라이더로 조절 가능, su_b2bia)
  const _bgOpacityNum = (uCfg.bgImgAlpha ?? b2BgImgAlpha) / 100;
  const _bgOpacity = _bgOpacityNum.toFixed(2);
  const _uKeyRaw = String(univName||'').trim();
  const _uKey = _uKeyRaw.toUpperCase();
  const _logoOverlayCfg = (() => {
    const def = { wmGlobalOn: 1, wmOn: 1, wmScale: 150, wmRight: 120, wmBottom: 30, bgScale: 100 };
    try{
      const raw = String(localStorage.getItem('su_b2_univ_logo_overlay_v1') || '').trim();
      const parsed = raw ? (JSON.parse(raw) || {}) : {};
      const d = (parsed && parsed.default && typeof parsed.default === 'object') ? parsed.default : {};
      const per = (parsed && parsed.perUniv && typeof parsed.perUniv === 'object') ? parsed.perUniv : {};
      const over = (_uKeyRaw && per && per[_uKeyRaw] && typeof per[_uKeyRaw] === 'object') ? per[_uKeyRaw] : {};
      const out = Object.assign({}, def, d, over);
      out.wmGlobalOn = (out.wmGlobalOn==null) ? 1 : (Number(out.wmGlobalOn) ? 1 : 0);
      out.wmOn = (out.wmOn==null) ? 1 : (Number(out.wmOn) ? 1 : 0);
      out.wmScale = Math.max(50, Math.min(250, parseInt(out.wmScale||150, 10) || 150));
      out.wmRight = Math.max(0, Math.min(260, parseInt(out.wmRight||120, 10) || 120));
      out.wmBottom = Math.max(0, Math.min(160, parseInt(out.wmBottom||30, 10) || 30));
      out.bgScale = Math.max(60, Math.min(120, parseInt(out.bgScale||100, 10) || 100));
      return out;
    }catch(e){
      return def;
    }
  })();
  // [FIX-BRIGHT-2] 대학 이름 하드코딩 대신 대학별 설정값(uCfg.bgIsLogo)으로 "로고형 배경"(중앙 배치) 여부를 판단.
  // 설정탭 > 🖼️ 현황판 라벨 배경 이미지별 설정에서 대학별로 켜고 끌 수 있음.
  const _bgIsLogo = !!uCfg.bgIsLogo;
  const _bgLogoPos = '44% 50%';
  const _bgLogoSizeBase = (() => {
    const custom = String(uCfg.bgLogoSize||'').trim();
    if (custom) return custom;
    return 'min(82%,720px) auto';
  })();
  const _bgLogoSize = (() => {
    const sc = (_logoOverlayCfg.bgScale || 100) / 100;
    if (sc === 1) return _bgLogoSizeBase;
    const m = String(_bgLogoSizeBase||'').match(/min\(\s*(\d+)\s*%\s*,\s*(\d+)\s*px\s*\)/i);
    if (!m) return _bgLogoSizeBase;
    const pct = Math.max(10, Math.min(100, Math.round(parseInt(m[1],10) * sc)));
    const px = Math.max(80, Math.min(1200, Math.round(parseInt(m[2],10) * sc)));
    return `min(${pct}%,${px}px) auto`;
  })();
  // [FIX-BRIGHT-3] 로고형/일반 배경 모두 같은 밝기값(_bgOpacity)을 사용 — 더 이상 로고형만 강제로 어둡게 하지 않음.
  const _bgOpacity2 = _bgOpacity;
  const _profileViewMode = _b2GetUnivProfileViewMode();
  const bgImgHtml = uCfg.bgImg
    ? forExport
      ? (_bgIsLogo
        ? `<img src="${uCfg.bgImg}" crossorigin="anonymous" style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:${_bgLogoSize.replace(' auto','')};max-width:760px;max-height:78%;height:auto;object-fit:contain;object-position:${_bgLogoPos};opacity:${_bgOpacity2};pointer-events:none;z-index:0" onerror="this.style.display='none'">`
        : `<img src="${uCfg.bgImg}" crossorigin="anonymous" class="b2-fit-auto" data-fit-kind="bg" data-fit-mode="${_bgSize}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:${_bgSize==='auto'?'cover':_bgSize};object-position:${_bgPos};opacity:${_bgOpacity2};pointer-events:none;z-index:0" onload="_b2ApplyBgAutoSizing(this)">`)
      : (_bgIsLogo
        ? `<div class="b2-bg-layer" data-bg-src="${String(uCfg.bgImg).replace(/"/g,'&quot;')}" data-bg-pos="${_bgLogoPos}" style="position:absolute;inset:0;opacity:${_bgOpacity2};pointer-events:none;z-index:0;background-position:${_bgLogoPos};background-size:${_bgLogoSize};background-repeat:no-repeat"></div>`
        : `<div class="b2-bg-layer" data-bg-src="${String(uCfg.bgImg).replace(/"/g,'&quot;')}" data-bg-pos="${String(_bgPos).replace(/"/g,'&quot;')}" data-bg-size-mode="${_bgSize}" style="position:absolute;inset:0;opacity:${_bgOpacity2};pointer-events:none;z-index:0;background-position:${_bgPos};background-size:${_bgSize==='auto'?'cover':_bgSize};background-repeat:no-repeat"></div>`)
    : '';

  let rows = '';
  let _tableHeadShown = false;
  roleOrder.forEach(role => {
    const group = roleGroups[role];
    const chips = _b2RenderUnivGroupCards(group, col, true, _profileViewMode, _profileViewMode==='table' && _tableHeadShown);
    if (_profileViewMode==='table' && group.length) _tableHeadShown = true;
    rows += _tableRow(role, true, chips);
  });
  orderedTierKeys.forEach(tier => {
    const group = tierGroups[tier];
    group.sort((a,b) => (a.name||'').localeCompare(b.name||'', 'ko', {sensitivity:'base'}));
    const chips = _b2RenderUnivGroupCards(group, col, false, _profileViewMode, _profileViewMode==='table' && _tableHeadShown);
    if (_profileViewMode==='table' && group.length) _tableHeadShown = true;
    rows += _tableRow(tier, false, chips);
  });
  const sidePanelHtml = hasSide ? `<div style="margin-top:10px;background:${_memoPanelBg};padding:12px;box-sizing:border-box;overflow:hidden;border-radius:18px;border:1px solid ${_softBorder};box-shadow:0 14px 26px rgba(15,23,42,.06)">
    <div style="font-size:var(--fs-caption);font-weight:900;color:${col};margin-bottom:${(_simgs.length||_smemo)?'10px':'0'}">사이드 메모</div>
    ${_simgs.map((src,i)=>`<img src="${src}" style="width:100%;max-width:260px;border-radius:12px;${(i<_simgs.length-1||_smemo)?'margin-bottom:8px;':''}display:block;object-fit:contain;border:1px solid rgba(148,163,184,.14);background:${_isDark?'#1e293b':'#fff'}" onerror="this.style.display='none'">`).join('')}
    ${_smemo?`<div style="font-size:var(--fs-caption);color:${_isDark?'#cbd5e1':'#334155'};white-space:pre-wrap;line-height:1.65;margin-top:${_simgs.length?'8px':'0'}">${_smemo}</div>`:''}
  </div>` : '';
  const _wmSpec = (() => {
    const kRaw = String(univName||'').trim();
    const k = kRaw.toUpperCase();
    if (k === 'HM' || k === 'DM' || k === 'SSG') return { pct: 20, max: 148, op1: '.34', op0: '.24' };
    if (k === 'JSA' || kRaw === '흑카데미') return { pct: 22, max: 160, op1: '.36', op0: '.26', right: 66, bottom: 28 };
    if (
      k === 'JSA' || k === 'BGM' || _bgIsLogo ||
      kRaw.includes('몬스타') || k.includes('MONSTAR')
    ) {
      return { pct: 26, max: 182, op1: '.36', op0: '.26', right: 46, bottom: 28 };
    }
    return { pct: 22, max: 160, op1: '.36', op0: '.26' };
  })();
  const _wmScale = (_logoOverlayCfg.wmScale || 100) / 100;
  const _wmPct = Math.max(6, Math.min(60, Math.round(_wmSpec.pct * _wmScale)));
  const _wmMax = Math.max(60, Math.min(520, Math.round(_wmSpec.max * _wmScale)));
  const _wmRightBase = (typeof _wmSpec.right === 'number') ? _wmSpec.right : 18;
  const _wmBottomBase = (typeof _wmSpec.bottom === 'number') ? _wmSpec.bottom : 22;
  const _wmRight = (typeof _logoOverlayCfg.wmRight === 'number') ? _logoOverlayCfg.wmRight : _wmRightBase;
  const _wmBottom = (typeof _logoOverlayCfg.wmBottom === 'number') ? _logoOverlayCfg.wmBottom : _wmBottomBase;
  const _wmMaxH = Math.round(_wmMax * 0.70);
  const _wmOn = ((_logoOverlayCfg.wmGlobalOn==null)?true:!!Number(_logoOverlayCfg.wmGlobalOn)) && ((_logoOverlayCfg.wmOn==null)?true:!!Number(_logoOverlayCfg.wmOn));
  const bodyContent = `<div class="b2-bg-host" style="position:relative;overflow:hidden;background:${_hasBgImg?'transparent':(_isDark?'linear-gradient(180deg,rgba(15,23,42,.6),rgba(15,23,42,.48))':'linear-gradient(180deg,rgba(255,255,255,.92),rgba(248,250,252,.82))')}">
    ${bgImgHtml}
    ${(_wmOn && iconUrl)?`<img src="${toHttpsUrl(iconUrl)}" aria-hidden="true" style="position:absolute;right:${_wmRight}px;bottom:${_wmBottom}px;width:min(${_wmPct}%,${_wmMax}px);max-width:${_wmMax}px;max-height:${_wmMaxH}px;opacity:${_hasBgImg?_wmSpec.op1:_wmSpec.op0};object-fit:contain;pointer-events:none;z-index:0;filter:drop-shadow(0 12px 28px rgba(15,23,42,.18))" onerror="this.style.display='none'">`:''}
    <div data-b2-univ-content="1" style="position:relative;z-index:1;padding:16px 20px 22px 16px;background:${_hasBgImg?'transparent':'transparent'}">
      <div>${rows}</div>
      ${sidePanelHtml}
    </div>
  </div>`;

  const _ubCreatedRaw = String(uCfg.createdAt || uCfg.created || uCfg.createDate || uCfg.since || uCfg.startDate || '').trim();
  const _ubCreatedLabel = (() => {
    if (!_ubCreatedRaw) return '';
    const raw = String(_ubCreatedRaw).trim();
    let m = raw.match(/^(\d{4})[.\-\/](\d{2})[.\-\/](\d{2})/);
    if (!m) m = raw.match(/^(\d{4})(\d{2})(\d{2})/);
    if (!m) return raw.slice(0, 10);
    return `${m[1]}.${m[2]}.${m[3]}`;
  })();

  // 하단 메모/이미지 (bMemo/bMemoImgs)
  const _bnote = uCfg.bMemo || '';
  const _bimgs = (uCfg.bMemoImgs||[]).concat(uCfg.bMemoImg?[uCfg.bMemoImg]:[]);
  const _bimgHtmls = _bimgs.map(src=>`<img class="b2-bottom-img" src="${src}" style="border-radius:12px;display:inline-block;border:1px solid rgba(148,163,184,.14);background:${_isDark?'#1e293b':'#fff'}" onerror="this.style.display='none'">`).join('');
  const bottomSection = (_bnote||_bimgs.length) ? `<div style="padding:14px 16px 16px;background:${_hasBgImg?(_isDark?'linear-gradient(180deg,rgba(15,23,42,.4),rgba(15,23,42,.28))':'linear-gradient(180deg,rgba(255,255,255,.28),rgba(248,250,252,.14))'):(_isDark?'linear-gradient(180deg,rgba(15,23,42,.7),rgba(15,23,42,.6))':'linear-gradient(180deg,rgba(255,255,255,.92),rgba(248,250,252,.86))')};border-top:1px solid ${_isDark?'rgba(148,163,184,.2)':'rgba(148,163,184,.16)'}">
    <div style="font-size:var(--fs-caption);font-weight:900;color:${col};margin-bottom:${(_bimgHtmls||_bnote)?'10px':'0'}">하단 메모</div>
    ${_bimgHtmls?`<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:${_bnote?'8px':'0'}">${_bimgHtmls}</div>`:''}
    ${_bnote?`<div style="font-size:var(--fs-sm);color:${_isDark?'#cbd5e1':'#334155'};white-space:pre-wrap;line-height:1.7">${_bnote}</div>`:''}
  </div>` : '';

  return `
    <div data-b2card="${univName.replace(/"/g,'&quot;')}" style="border-radius:22px;overflow:hidden;border:1px solid ${_isDark?'#334155':'rgba(148,163,184,.16)'};background:${_isDark?'linear-gradient(180deg,rgba(15,23,42,.78),rgba(15,23,42,.68))':'linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.96))'};box-shadow:${_isDark?'0 18px 32px rgba(0,0,0,.28)':'0 18px 32px rgba(15,23,42,.06)'}">
      <div style="background:linear-gradient(135deg,${col} 0%,${col}dd 100%);padding:16px 16px 14px;position:relative;overflow:hidden">
        <div style="position:absolute;inset:0;background:linear-gradient(145deg,rgba(255,255,255,${_hasBgImg?'.08':'.18'}),rgba(255,255,255,0) 58%);pointer-events:none"></div>
        <div style="display:flex;align-items:stretch;gap:12px;position:relative;z-index:1">
          ${iconUrl?`<img src="${toHttpsUrl(iconUrl)}" style="width:clamp(56px,var(--su_univ_logo_size,64px),76px);height:clamp(56px,var(--su_univ_logo_size,64px),76px);object-fit:contain;border-radius:0;flex-shrink:0;cursor:pointer;background:transparent;border:none;padding:0" onclick="if(typeof openUnivModal==='function')openUnivModal('${univName}')" onerror="this.style.display='none'">`:''}
          <div style="min-width:0;flex:1;display:flex;flex-direction:column;gap:7px">
            <div style="display:flex;align-items:flex-start;gap:10px;justify-content:space-between;flex-wrap:wrap">
              <div style="min-width:0;flex:1">
                <div style="display:flex;align-items:center;gap:8px;flex-wrap:nowrap;min-width:0">
                  <span style="font-weight:950;font-size:20px;color:${textCol};cursor:pointer;letter-spacing:-.03em;line-height:1.08;min-width:0;flex:0 1 auto;max-width:min(420px,62%);overflow:hidden;text-overflow:ellipsis;white-space:nowrap" onclick="if(typeof openUnivModal==='function')openUnivModal('${univName}')">${univName}</span>
                  <span style="display:inline-flex;align-items:center;gap:6px;flex-shrink:0;white-space:nowrap">
                    <span style="background:${textCol}1f;color:${textCol};font-size:var(--fs-caption);font-weight:800;padding:4px 9px;border-radius:999px;border:1px solid ${textCol}26;cursor:pointer;box-shadow:inset 0 1px 0 rgba(255,255,255,.06);white-space:nowrap" onclick="event.stopPropagation();openB2MemberBreakdown(this,'${univName}')">${members.length}명</span>
                    ${_ubCreatedLabel?`<span style="background:${textCol}18;color:${textCol};font-size:10px;font-weight:900;padding:4px 8px;border-radius:999px;border:1px solid ${textCol}22;box-shadow:inset 0 1px 0 rgba(255,255,255,.06);flex-shrink:0;white-space:nowrap">${_ubCreatedLabel}</span>`:''}
                  </span>
                </div>
                ${uCfg.memo2?`<div style="margin-top:5px;font-size:10px;font-weight:700;color:${textCol}dd;line-height:1.45;display:flex;align-items:center;gap:6px;flex-wrap:wrap">
                  <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:0 1 auto;max-width:48%;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.14);border-radius:999px;padding:3px 8px">${uCfg.memo2}</span>
                </div>`:''}
              </div>
              <div style="display:flex;align-items:flex-start;gap:6px;flex-wrap:wrap;justify-content:flex-end">
                ${(uCfg.championships||0)>0?`<span style="display:flex;gap:1px;flex-shrink:0;padding:5px 8px;border-radius:999px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.12)">${'<span style="font-size:var(--fs-md)">⭐</span>'.repeat(uCfg.championships)}</span>`:''}
                ${isLoggedIn?`<button class="no-export" onclick="event.stopPropagation();_b2ToggleCard(this,'${univName.replace(/'/g,"\\'")}')" style="background:${textCol}22;border:1px solid ${textCol}33;color:${textCol};font-size:var(--fs-caption);cursor:pointer;padding:4px 9px;border-radius:var(--r);flex-shrink:0;font-weight:800;z-index:var(--z-dropdown);position:relative;box-shadow:inset 0 1px 0 rgba(255,255,255,.08)" title="${_b2Collapsed.has(univName)?'펼치기':'접기'}">${_b2Collapsed.has(univName)?'▶ 접기 해제':'▼ 접기'}</button>`:''}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="b2-card-body" style="${_b2Collapsed.has(univName)?'display:none':''}">
        ${bodyContent}
        ${bottomSection}
      </div>
    </div>`;
}

/* ── 무소속 뷰 ── */
function _b2FreeView() {
  // [FIX-FREE-2] 대학 해체 시 "소속 선수 이동" 옵션을 껐으면(confirmDissolve, movePlayers=false)
  // 선수의 p.univ 값이 해체된 대학명 그대로 남습니다. 이 경우 대학별 화면(univList)에는
  // 해체된 대학이 빠져 있어 표시되지 않고, 기존 무소속 필터는 pu가 ''나 '무소속'일 때만
  // 통과시켜서 이 선수들이 어느 현황판 화면에도 노출되지 않고 사라지는 문제가 있었습니다.
  // → 해체된 대학 소속(미이동) 선수도 무소속 목록에 포함되도록 조건을 넓혔습니다.
  const _freeDissSet = new Set((typeof univCfg !== 'undefined' ? univCfg : []).filter(u=>u.dissolved).map(u=>String(u.name||'').trim()));
  const _fvGenderFilter = _b2GetFreeGenderFilter();
  const freeMembers = players.filter(p => {
    const pu = String(p?.univ||'').trim();
    const isFreeOrOrphaned = !pu || pu === '무소속' || _freeDissSet.has(pu);
    if (!(isFreeOrOrphaned && !p.hidden && !p.retired && !p.hideFromBoard)) return false;
    if (_fvGenderFilter === 'M' && p.gender !== 'M') return false;
    if (_fvGenderFilter === 'F' && p.gender !== 'F') return false;
    return true;
  });
  if (!freeMembers.length) return `<div style="text-align:center;color:var(--text3);padding:40px">무소속 멤버가 없습니다</div>`;

  const roledFree   = freeMembers.filter(p => _b2HasRole(p));
  roledFree.sort((a,b) => _b2RoleRank(a) - _b2RoleRank(b));
  const tieredFree  = freeMembers.filter(p => !_b2HasRole(p));

  const tierGroups = {};
  tieredFree.forEach(p => {
    const t = p.tier || '?';
    if (!tierGroups[t]) tierGroups[t] = [];
    tierGroups[t].push(p);
  });
  const orderedTierKeys = TIERS.filter(t => tierGroups[t]).concat(
    Object.keys(tierGroups).filter(t => !TIERS.includes(t))
  );

  // 이번주 전적 계산
  const _fvNow=new Date(),_fvDay=_fvNow.getDay();
  const _fvMon=new Date(_fvNow); _fvMon.setDate(_fvNow.getDate()+(_fvDay===0?-6:1-_fvDay));
  const _fvFromN=parseInt(_fvMon.toISOString().slice(0,10).replace(/-/g,''));
  const _fvToN  =parseInt(_fvNow.toISOString().slice(0,10).replace(/-/g,''));
  const _fvDN   =s=>parseInt(String(s||'').replace(/[-\.]/g,''))||0;
  let _fvTw=0,_fvTl=0,_fvWw=0,_fvWl=0,_fvActive=0;
  tieredFree.forEach(p=>{
    let acted=false;
    (Array.isArray(p.history)?p.history:[]).forEach(h=>{
      if(h.result==='승')_fvTw++; else if(h.result==='패')_fvTl++;
      const d=_fvDN(h.date||h.d||'');
      if(d>=_fvFromN&&d<=_fvToN){if(h.result==='승')_fvWw++;else if(h.result==='패')_fvWl++;acted=true;}
    });
    if(acted)_fvActive++;
  });
  const _fvTg=_fvTw+_fvTl;
  const _fvWr=_fvTg>0?Math.round(_fvTw/_fvTg*100):null;
  const _fvWrc=_fvWr===null?'#94a3b8':_fvWr>=60?'#10b981':_fvWr>=40?'#f59e0b':'#ef4444';
  const _fvWwT=_fvWw+_fvWl;

  // 종족 카운트
  const rCts={P:0,T:0,Z:0,'?':0};
  tieredFree.forEach(p=>{ const r=p.race||'?'; rCts[r in rCts?r:'?']++; });
  const rTotal=tieredFree.length||1;

  const defCol = '#64748b';
  const _fvMode = _b2GetFreeViewMode();
  const _fvIsDark = (typeof document!=='undefined' && document.body && document.body.classList.contains('dark'));
  const _fvWrapBg = _fvIsDark
    ? 'linear-gradient(180deg,rgba(15,23,42,.98),rgba(10,17,32,.96))'
    : 'linear-gradient(180deg,rgba(255,255,255,.99),rgba(248,250,252,.96))';
  const _fvWrapBorder = _fvIsDark ? 'rgba(148,163,184,.20)' : 'rgba(148,163,184,.16)';
  const _fvBodyBg = _fvIsDark
    ? 'linear-gradient(180deg,rgba(15,23,42,.92),rgba(10,17,32,.86))'
    : 'linear-gradient(180deg,rgba(255,255,255,.96),rgba(248,250,252,.90))';
  const _fvModeBtn = (mode, label) => {
    if (window.TabVis && typeof window.TabVis.visible === 'function' && !window.TabVis.visible('b2.free.mode.' + mode)) return '';
    return `
    <button type="button" class="no-export" onclick="_b2SetFreeViewMode('${mode}')" style="padding:4px 11px;border-radius:999px;border:1px solid ${_fvMode===mode?'rgba(255,255,255,.7)':'rgba(255,255,255,.22)'};background:${_fvMode===mode?'rgba(255,255,255,.24)':'rgba(255,255,255,.08)'};color:#fff;font-size:10px;font-weight:900;cursor:pointer">${label}</button>`;
  };
  const _fvGenderBtn = (g, label) => `
    <button type="button" class="no-export" onclick="_b2SetFreeGenderFilter('${g}')" style="padding:4px 11px;border-radius:999px;border:1px solid ${_fvGenderFilter===g?'rgba(255,255,255,.7)':'rgba(255,255,255,.22)'};background:${_fvGenderFilter===g?'rgba(255,255,255,.24)':'rgba(255,255,255,.08)'};color:#fff;font-size:10px;font-weight:900;cursor:pointer">${label}</button>`;
  let h = `<div style="border-radius:22px;overflow:hidden;border:1px solid ${_fvWrapBorder};background:${_fvWrapBg};box-shadow:0 18px 32px rgba(15,23,42,.06)">
    <div style="background:linear-gradient(135deg,${defCol} 0%,#475569 100%);padding:14px 16px 12px;position:relative;overflow:hidden">
      <div style="position:absolute;inset:0;background:linear-gradient(145deg,rgba(255,255,255,.14),rgba(255,255,255,0) 58%);pointer-events:none"></div>
      <div style="position:relative;z-index:1">
      <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
        <span style="font-weight:950;font-size:var(--fs-lg);color:#fff;letter-spacing:-.02em">🚶 무소속</span>
        <span style="background:rgba(255,255,255,.18);color:#fff;font-size:var(--fs-caption);font-weight:800;padding:4px 9px;border-radius:999px;border:1px solid rgba(255,255,255,.15)">${freeMembers.length}명</span>
        ${_fvActive>0?`<span style="background:rgba(255,165,0,.35);color:#fef08a;font-size:10px;font-weight:900;padding:4px 8px;border-radius:999px;border:1px solid rgba(255,255,255,.12)">🔥 이번주 ${_fvActive}명</span>`:''}
        ${_fvWwT>0?`<span style="background:rgba(0,0,0,.18);color:${_fvWw>=_fvWl?'#bbf7d0':'#fecaca'};font-size:10px;font-weight:900;padding:4px 8px;border-radius:999px;border:1px solid rgba(255,255,255,.12)">${_fvWw}승${_fvWl}패</span>`:''}
        ${_fvWr!==null?`<span style="background:rgba(0,0,0,.18);color:${_fvWrc};font-size:10px;font-weight:900;padding:4px 8px;border-radius:999px;border:1px solid rgba(255,255,255,.12)" title="통산 ${_fvTw}승 ${_fvTl}패">📊 통산 ${_fvWr}%</span>`:''}
        <div style="margin-left:auto;display:flex;gap:4px;align-items:center">
          ${rCts.P?`<span style="font-size:10px;background:rgba(124,58,237,.4);color:#ede9fe;padding:4px 8px;border-radius:999px;font-weight:900;border:1px solid rgba(255,255,255,.12)">🔮${rCts.P}</span>`:''}
          ${rCts.T?`<span style="font-size:10px;background:rgba(2,132,199,.4);color:#e0f2fe;padding:4px 8px;border-radius:999px;font-weight:900;border:1px solid rgba(255,255,255,.12)">⚔️${rCts.T}</span>`:''}
          ${rCts.Z?`<span style="font-size:10px;background:rgba(5,150,105,.4);color:#d1fae5;padding:4px 8px;border-radius:999px;font-weight:900;border:1px solid rgba(255,255,255,.12)">🦎${rCts.Z}</span>`:''}
        </div>
      </div>
      <div style="display:flex;height:5px;border-radius:3px;overflow:hidden;margin-top:8px;background:rgba(255,255,255,.15)">
        ${rCts.P?`<div style="flex:${rCts.P};background:#7c3aed;opacity:.85"></div>`:''}
        ${rCts.T?`<div style="flex:${rCts.T};background:#0284c7;opacity:.85"></div>`:''}
        ${rCts.Z?`<div style="flex:${rCts.Z};background:#059669;opacity:.85"></div>`:''}
        ${rCts['?']?`<div style="flex:${rCts['?']};background:rgba(255,255,255,.2)"></div>`:''}
      </div>
      <div style="display:flex;align-items:center;gap:5px;flex-wrap:wrap;margin-top:10px;padding-top:10px;border-top:1px dashed rgba(255,255,255,.18)" class="no-export">
        <span style="font-size:10px;font-weight:800;color:rgba(255,255,255,.65);margin-right:2px">🖼️ 모드</span>
        ${_fvModeBtn('default','기본')}
        ${_fvModeBtn('stat','📊 통계카드')}
        ${_fvModeBtn('table','🗂️ 테이블')}
        <div style="margin-left:auto;display:flex;align-items:center;gap:5px">
          <span style="font-size:10px;font-weight:800;color:rgba(255,255,255,.65);margin-right:2px">⚥ 성별</span>
          ${_fvGenderBtn('ALL','전체')}
          ${_fvGenderBtn('M','남자만 보기')}
          ${_fvGenderBtn('F','여자만 보기')}
        </div>
      </div>
      </div>
    </div>
    <div style="background:${_fvBodyBg};padding:16px">`;

  if (_fvMode === 'stat') {
    let _statHtml = '';
    if (roledFree.length) {
      _statHtml += `<div style="display:flex;align-items:center;gap:8px;margin:0 0 10px;padding-bottom:6px;border-bottom:2px solid ${defCol}33">
        <span style="font-size:var(--fs-md);font-weight:950;color:${defCol};letter-spacing:-.01em">👑 직책자</span>
        <span style="font-size:10px;font-weight:800;color:var(--text3);background:${defCol}14;padding:2px 8px;border-radius:999px">${roledFree.length}명</span>
      </div>`;
      _statHtml += `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:14px;margin-bottom:20px">${roledFree.map(p => _b2LineupCard3(p, defCol)).join('')}</div>`;
    }
    orderedTierKeys.forEach((tier, tIdx) => {
      const group = tierGroups[tier].slice().sort((a,b)=>(a.name||'').localeCompare(b.name||'','ko',{sensitivity:'base'}));
      const tCol = getTierBtnColor(tier);
      _statHtml += `<div style="display:flex;align-items:center;gap:8px;margin:${tIdx===0&&!roledFree.length?'0':'20px'} 0 10px;padding-bottom:6px;border-bottom:2px solid ${tCol}33">
        <span style="font-size:var(--fs-md);font-weight:950;color:${tCol};letter-spacing:-.01em">${tier}</span>
        <span style="font-size:10px;font-weight:800;color:var(--text3);background:${tCol}14;padding:2px 8px;border-radius:999px">${group.length}명</span>
      </div>`;
      _statHtml += `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:14px">${group.map(p => _b2LineupCard3(p, tCol)).join('')}</div>`;
    });
    h += _statHtml;
  } else if (_fvMode === 'table') {
    const _allFree = roledFree.concat(orderedTierKeys.flatMap(t => tierGroups[t].slice().sort((a,b)=>(a.name||'').localeCompare(b.name||'','ko',{sensitivity:'base'}))));
    h += _b2LineupTable(_allFree, defCol);
  } else {
    const _frowPanelBg = _fvIsDark
      ? 'linear-gradient(180deg,rgba(30,41,59,.92),rgba(22,32,50,.88))'
      : 'linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.94))';
    const _frowPanelBorder = _fvIsDark ? 'rgba(148,163,184,.20)' : 'rgba(148,163,184,.14)';
    const _frow = (labelEl, contentEl) => `<div style="display:flex;align-items:stretch;gap:0;margin-bottom:8px">${labelEl}<div style="flex:1;padding:10px 12px;background:${_frowPanelBg};border:1px solid ${_frowPanelBorder};border-left:none;border-radius:0 16px 16px 0;box-shadow:0 10px 18px rgba(15,23,42,.04)">${contentEl}</div></div>`;
    const _fl = (text, isRole) => `<span style="font-size:var(--fs-sm);font-weight:900;color:${isRole?defCol:'var(--text3)'};width:68px;min-width:68px;text-align:center;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;background:#64748b${_b2AlphaHex(b2LabelAlpha)}!important;border:1px solid rgba(100,116,139,.28);border-right:none;border-radius:var(--r2) 0 0 16px;padding:8px 6px;box-shadow:inset 0 1px 0 rgba(255,255,255,.2)">${text}</span>`;

    roledFree.forEach(p => {
      h += _frow(_fl(p.role||'', true), _b2NameTag(p, defCol, true));
    });
    orderedTierKeys.forEach(tier => {
      const group = tierGroups[tier];
      group.sort((a,b) => (a.name||'').localeCompare(b.name||'', 'ko', {sensitivity:'base'}));
      const col = getTierBtnColor(tier);
      h += _frow(_fl(tier, false), `<div style="display:flex;flex-wrap:wrap;gap:5px;padding:2px 0">${group.map(p => _b2NameTag(p, col, false)).join('')}</div>`);
    });
  }
  h += `</div></div>`;
  return h;
}

function _b2GetFreeViewMode() {
  let v = 'default';
  try{
    const raw = String(localStorage.getItem('su_b2_free_view') || '').trim();
    v = ['default','stat','table'].includes(raw) ? raw : 'default';
  }catch(e){
    v = 'default';
  }
  if (window.TabVis && typeof window.TabVis.visible === 'function' && !window.TabVis.visible('b2.free.mode.' + v)) {
    v = ['default','stat','table'].find(m => window.TabVis.visible('b2.free.mode.' + m)) || 'default';
  }
  return v;
}

function _b2SetFreeViewMode(mode) {
  const nextMode = ['default','stat','table'].includes(String(mode||'')) ? String(mode) : 'default';
  try{ localStorage.setItem('su_b2_free_view', nextMode); }catch(e){}
  if (typeof render === 'function') render();
}

function _b2GetFreeGenderFilter() {
  try{
    const raw = String(localStorage.getItem('su_b2_free_gender') || '').trim();
    return ['ALL','M','F'].includes(raw) ? raw : 'ALL';
  }catch(e){
    return 'ALL';
  }
}

function _b2SetFreeGenderFilter(g) {
  const next = ['ALL','M','F'].includes(String(g||'')) ? String(g) : 'ALL';
  try{ localStorage.setItem('su_b2_free_gender', next); }catch(e){}
  if (typeof render === 'function') render();
}


function openB2MemberBreakdown(el, univName) {
  const existing = document.getElementById('b2-mbp');
  if (existing) { const wasEl = existing._forEl; existing.remove(); if (wasEl === el) return; }
  const col = gc(univName);
  const members = players.filter(p => String(p?.univ||'').trim() === String(univName||'').trim() && !p.hidden && !p.retired && !p.hideFromBoard);
  const roled = members.filter(p => _b2HasRole(p));
  const tiered = members.filter(p => !_b2HasRole(p));
  const tierCounts = {};
  tiered.forEach(p => { const t = p.tier||'?'; tierCounts[t] = (tierCounts[t]||0)+1; });
  const orderedTiers = TIERS.filter(t => tierCounts[t]).concat(Object.keys(tierCounts).filter(t => !TIERS.includes(t)));
  const row = (label, val, c) => `<div style="display:flex;justify-content:space-between;align-items:center;gap:16px;padding:2px 0">
    <span style="color:${c||'var(--text2)'};font-size:var(--fs-sm)">${label}</span>
    <span style="font-weight:700;color:var(--text1);font-size:var(--fs-sm)">${val}명</span></div>`;
  const popup = document.createElement('div');
  popup.id = 'b2-mbp';
  popup.style.cssText = 'position:fixed;z-index:var(--z-top);background:linear-gradient(180deg,rgba(255,255,255,.99),rgba(248,250,252,.96));border:1px solid rgba(148,163,184,.16);border-radius:18px;box-shadow:0 16px 38px rgba(15,23,42,.16);padding:14px 15px;min-width:220px;backdrop-filter:blur(12px)';
  popup.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:10px">
      <div style="font-weight:900;font-size:14px;color:${col};letter-spacing:-.02em">${univName} 구성</div>
      <div style="font-size:var(--fs-caption);font-weight:900;color:var(--text3)">${members.length}명</div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-bottom:10px">
      <div style="padding:10px 11px;border-radius:14px;background:${col}12;border:1px solid ${col}22"><div style="font-size:10px;font-weight:900;color:var(--text3)">직책자</div><div style="margin-top:5px;font-size:var(--fs-lg);font-weight:1000;color:${col}">${roled.length}</div></div>
      <div style="padding:10px 11px;border-radius:14px;background:${col}0a;border:1px solid ${col}18"><div style="font-size:10px;font-weight:900;color:var(--text3)">일반 스트리머</div><div style="margin-top:5px;font-size:var(--fs-lg);font-weight:1000;color:var(--text1)">${tiered.length}</div></div>
    </div>
    ${row('직책자', roled.length)}
    ${row('일반 스트리머', tiered.length)}
    ${orderedTiers.length ? `<div style="border-top:1px solid var(--border2);margin:6px 0"></div>${orderedTiers.map(t=>row(t, tierCounts[t], getTierBtnColor(t))).join('')}` : ''}`;
  popup._forEl = el;
  document.body.appendChild(popup);
  const rect = el.getBoundingClientRect();
  popup.style.top = (rect.bottom + 6) + 'px';
  popup.style.left = rect.left + 'px';
  requestAnimationFrame(() => {
    if (rect.left + popup.offsetWidth > window.innerWidth - 8) popup.style.left = (rect.right - popup.offsetWidth) + 'px';
    if (rect.bottom + popup.offsetHeight + 6 > window.innerHeight) popup.style.top = (rect.top - popup.offsetHeight - 6) + 'px';
  });
  setTimeout(() => {
    function _c(e) { if (!popup.contains(e.target) && e.target !== el) { _close(); } }
    function _s() { _close(); }
    function _close() { popup.remove(); document.removeEventListener('click', _c); window.removeEventListener('scroll', _s, true); }
    document.addEventListener('click', _c);
    window.addEventListener('scroll', _s, {capture:true, once:true});
  }, 0);
}

async function saveB2Img() {
  const univList = _b2VisUnivs().filter(u => u.name !== '무소속');
  const targets = _b2SaveUniv === '전체' ? univList : univList.filter(u => u.name === _b2SaveUniv);
  if (!targets.length) { alert('저장할 대학이 없습니다.'); return; }

  const btn = document.querySelector('[onclick="saveB2Img()"]');
  if (btn) { btn.disabled = true; btn.textContent = '⏳...'; }

  const CARD_W = 720;
  const gap = 14;
  const PAD = 24;

  const tmpDiv = document.createElement('div');
  tmpDiv.style.cssText = `position:fixed;left:-9999px;top:0;padding:${PAD}px;background:#f0f2f5;box-sizing:border-box;width:${CARD_W + PAD * 2}px`;
  tmpDiv.innerHTML = `<style>.b2-bottom-img{max-width:160px;max-height:130px;object-fit:contain;}</style>
    <div style="display:flex;flex-direction:column;gap:${gap}px">
      ${targets.map(u => _b2UnivBlock(u.name, gc(u.name), players.filter(p => String(p?.univ||'').trim() === String(u.name||'').trim() && !p.hidden && !p.retired && !p.hideFromBoard), true)).join('')}
    </div>`;
  document.body.appendChild(tmpDiv);
  // no-export 요소 제거 (접기 버튼 등)
  tmpDiv.querySelectorAll('.no-export,.no-export-movebtns').forEach(el => el.remove());

  await new Promise(r => setTimeout(r, 100));
  injectUnivIcons(tmpDiv);

  const h = tmpDiv.scrollHeight + 32;
  const w = tmpDiv.scrollWidth;
  const fname = (_b2SaveUniv === '전체' ? '대학별현황판_전체' : `대학별현황판_${_b2SaveUniv}`) + '_' + new Date().toISOString().slice(0,10) + '.png';

  try {
    if (typeof _captureAndSave !== 'function') throw new Error('이미지 저장 기능을 불러오지 못했습니다.');
    await _captureAndSave(tmpDiv, w, h, fname);
  } catch(e) {
    console.error('[현황판 이미지 저장 실패]', e);
    alert('❌ 이미지 저장 실패\n\n' + (e.message || '알 수 없는 오류가 발생했습니다.'));
  }
  finally {
    document.body.removeChild(tmpDiv);
    if (btn) { btn.disabled = false; btn.textContent = '📷 이미지저장'; }
  }
}
