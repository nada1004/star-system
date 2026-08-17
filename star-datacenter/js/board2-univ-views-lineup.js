// board2-univ-views.js에서 분리됨 (라인업 포스터(STARTING XI) 카드/테이블/뷰 + 캡처/저장 유틸) — 원본 라인 2102-2489

function _b2LineupCard3(p, col) {
  const safeName = (p.name||'').replace(/'/g,"\\'");
  const raceLetter = (p.race && p.race!=='N') ? p.race : '?';
  const photo = p.photo ? toScaledUrl(p.photo,300) : '';
  const photoOrig = p.photo ? toHttpsUrl(p.photo) : '';
  const win = Number(p.win||0), loss = Number(p.loss||0), games = win+loss;
  const wr = games ? Math.round(win/games*100) : null;
  const wrCol = wr==null ? 'var(--text, #0f172a)' : (wr>=50 ? '#16a34a' : '#dc2626');
  const eloDefault = (typeof ELO_DEFAULT!=='undefined'?ELO_DEFAULT:1200);
  const elo = Number(p.elo || eloDefault);
  const eloCol = elo >= eloDefault ? '#2563eb' : '#dc2626';
  const points = Number(p.points||0);
  const tierCol = (p.tier && typeof getTierBtnColor==='function') ? getTierBtnColor(p.tier) : col;
  const tierTxt = (p.tier && typeof getTierBtnTextColor==='function') ? (getTierBtnTextColor(p.tier)||'#fff') : '#fff';
  let dateLine = '';
  try {
    const hist = (typeof _tpHistAllForPlayer==='function') ? _tpHistAllForPlayer(p) : [];
    const sorted = [...hist].sort((a,b)=>(typeof _tpDateNum==='function'?_tpDateNum(b?.date)-_tpDateNum(a?.date):0));
    if (sorted[0] && sorted[0].date) dateLine = `최근 기록 · ${sorted[0].date}`;
  } catch(e){}
  const boxes = [
    [games ? `${win}승 ${loss}패` : '기록 없음', '전적', 'var(--text, #0f172a)'],
    [wr==null ? '-' : `${wr}%`, '승률', wrCol],
    [pS(points), '포인트', 'var(--text, #0f172a)'],
    [elo, 'ELO', eloCol]
  ];
  const _lc3SecondRaw = String(p.secondProfileFile || '').trim();
  const _lc3SecondIsVideo = /\.(mp4|webm|ogg|mov|m4v)(\?|$)/i.test(_lc3SecondRaw);
  const lc3SecondPhoto = (_lc3SecondRaw && !_lc3SecondIsVideo) ? _lc3SecondRaw : '';
  const _lc3SecondIsGif = /\.gif(\?|$)/i.test(_lc3SecondRaw);
  const lc3SecondSrc = lc3SecondPhoto ? (_lc3SecondIsGif ? toHttpsUrl(lc3SecondPhoto) : toScaledUrl(lc3SecondPhoto,300)) : '';
  const lc3SecondHtml = lc3SecondPhoto
    ? `<img class="b2-players-card-secondary" style="z-index:1" src="${lc3SecondSrc}" data-orig="${toHttpsUrl(lc3SecondPhoto)}" loading="eager" fetchpriority="high" decoding="async" alt="" onerror="if(this.dataset.orig&&this.src!==this.dataset.orig){this.src=this.dataset.orig;}else{this.remove()}">`
    : '';
  const attrName = (p.name||'').replace(/"/g,'&quot;');
  return `<div class="b2-lc3" data-b2lc-player="${attrName}" style="--lc-col:${col}" onclick="_b2LineupCardHoverLeave();openPlayerModal('${safeName}')" onmouseenter="_b2LineupCardHoverEnter(event,this,'${safeName}','${col}')" onmouseleave="_b2LineupCardHoverLeave()${lc3SecondPhoto ? ";_b2CardHoverLeave(this)" : ""}"${lc3SecondPhoto ? ` onmousemove="_b2CardHoverScrub(event,this)"` : ''}>
    <div class="b2-lc3-photo">
      <button class="b2-lineup-tts-btn" title="이 스트리머 음성듣기" onclick="event.stopPropagation();_b2LineupSpeakPlayer('${safeName}')" style="position:absolute;top:8px;left:8px;z-index:3;width:28px;height:28px;border-radius:999px;border:1px solid rgba(255,255,255,.55);background:rgba(15,23,42,.55);color:#fff;font-size:13px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0">🔊</button>
      ${photo
        ? `<img class="b2-lc3-backdrop" src="${photo}" data-orig="${photoOrig}" crossorigin="anonymous" loading="eager" fetchpriority="high" decoding="async" aria-hidden="true" onerror="if(this.dataset.orig&&this.src!==this.dataset.orig){this.removeAttribute('crossorigin');this.src=this.dataset.orig;}else{this.style.display='none'}">
           <img src="${photo}" data-orig="${photoOrig}" crossorigin="anonymous" loading="eager" fetchpriority="high" decoding="async" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center;z-index:1" onerror="if(this.dataset.orig&&this.src!==this.dataset.orig){this.removeAttribute('crossorigin');this.src=this.dataset.orig;}else{this.style.display='none';this.previousElementSibling.style.display='none';this.nextElementSibling.style.display='flex'}">
           <div class="b2-lc3-fallback" style="display:none;z-index:1">${raceLetter}</div>`
        : `<div class="b2-lc3-fallback">${raceLetter}</div>`}
      ${lc3SecondHtml}
      <div class="b2-lc3-overlay">
        ${p.tier?`<div><span class="b2-lc3-tierchip" style="background:${tierCol};color:${tierTxt}">${p.tier}</span></div>`:''}
        <div class="b2-lc3-name">${p.name||''}</div>
        ${(p.role||dateLine)?`<div class="b2-lc3-sub">${p.role||''}${p.role&&dateLine?' · ':''}${dateLine}</div>`:''}
      </div>
    </div>
    <div class="b2-lc3-grid">
      ${boxes.map(([value,label,vcol])=>`<div class="b2-lc3-box"><div class="b2-lc3-box-value" style="color:${vcol}">${value}</div><div class="b2-lc3-box-label">${label}</div></div>`).join('')}
    </div>
  </div>`;
}

// 라인업 카드 - 모드4 "테이블형" (헤더가 있는 데이터 테이블, 가장 촘촘하고 다른 모드와 구조 자체가 다름)
;(function _injectLineupCard4Style(){
  if(typeof document==='undefined') return;
  const prev = document.getElementById('b2-lineup-card4-style');
  if(prev) prev.remove();
  const s=document.createElement('style');
  s.id='b2-lineup-card4-style';
  s.textContent=[
    '.b2-lc4-wrap{width:100%;overflow-x:auto;border-radius:14px}',
    '.b2-lc4{width:100%;border-collapse:separate;border-spacing:0;font-size:var(--fs-sm);min-width:520px}',
    '.b2-lc4 thead th{position:sticky;top:0;text-align:left;padding:9px 12px;font-size:10px;font-weight:900;color:#64748b;text-transform:uppercase;letter-spacing:.05em;background:transparent!important;background-image:none!important;border-bottom:1px solid rgba(0,0,0,.08);white-space:nowrap}',
    '.b2-lc4 thead th:first-child{border-radius:14px 0 0 0}',
    '.b2-lc4 thead th:last-child{border-radius:0 14px 0 0;text-align:right}',
    '.b2-lc4 tbody td{padding:7px 12px;border-bottom:1px solid rgba(0,0,0,.06);vertical-align:middle;background:color-mix(in srgb, var(--tier-c,transparent) 7%, transparent)!important}',
    '.b2-lc4 tbody tr:last-child td{border-bottom:none}',
    '.b2-lc4 tbody td:first-child{border-left:3px solid var(--tier-c,transparent)}',
    '.b2-lc4 tbody tr:hover td{background:var(--lc-col,#64748b)16!important}',
    '.b2-lc4 tbody tr{cursor:pointer;position:relative;transition:transform .18s cubic-bezier(.2,.8,.2,1),box-shadow .18s ease;transform-origin:center center}',
    '.b2-lc4 tbody tr:hover{transform:scale(1.025);box-shadow:0 10px 22px rgba(15,23,42,.18);z-index:30}',
    '.b2-lc4-head{display:flex;align-items:center;gap:8px;padding:9px 12px}',
    '.b2-lc4-head img{width:24px;height:24px;object-fit:contain;border-radius:6px;flex-shrink:0}',
    '.b2-lc4-head span{font-size:var(--fs-sm);font-weight:900;color:#0f172a}',
    '.b2-lc4-namecell{display:flex;align-items:center;gap:9px;min-width:120px}',
    '.b2-lc4-avatar{position:relative;width:28px;height:28px;flex-shrink:0;border-radius:50%;overflow:hidden;border:1.5px solid var(--lc-col,#64748b)55;background:linear-gradient(160deg,var(--lc-col,#64748b)55,var(--lc-col,#64748b)22)}',
    '.b2-lc4-avatar img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center}',
    '.b2-lc4-fallback{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:var(--fs-caption);font-weight:1000;color:#fff}',
    '.b2-lc4-name{font-weight:900;color:#0f172a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:130px}',
    '.b2-lc4-chip{display:inline-flex;align-items:center;padding:1px 8px;border-radius:999px;font-size:10px;font-weight:900;color:#fff;line-height:1.6;white-space:nowrap}',
    '.b2-lc4-wrcell{display:flex;align-items:center;justify-content:flex-end;gap:7px}',
    '.b2-lc4-bartrack{width:44px;height:5px;border-radius:999px;background:var(--lc-col,#64748b)18;overflow:hidden}',
    '.b2-lc4-barfill{height:100%;border-radius:999px}',
    '.b2-lc4-wr{font-weight:950;width:32px;text-align:right}',
    ':is(body.dark,html.dark) .b2-lc4-wrap{background:rgba(15,23,42,.4)}',
    ':is(body.dark,html.dark) .b2-lc4 thead th{color:#94a3b8;border-bottom-color:rgba(255,255,255,.08)}',
    ':is(body.dark,html.dark) .b2-lc4 tbody td{border-bottom-color:rgba(255,255,255,.06);background:rgba(15,23,42,.5)!important}',
    ':is(body.dark,html.dark) .b2-lc4 tbody tr:hover td{background:var(--lc-col,#64748b)26!important}',
    ':is(body.dark,html.dark) .b2-lc4-head span{color:#e2e8f0}',
    ':is(body.dark,html.dark) .b2-lc4-name{color:#e2e8f0}'
  ].join('');
  document.head.appendChild(s);
})();

function _b2LineupTableRow(p, col) {
  const safeName = (p.name||'').replace(/'/g,"\\'");
  const raceLetter = (p.race && p.race!=='N') ? p.race : '?';
  const photo = p.photo ? toThumbUrl(p.photo,28) : '';
  const photoOrig = p.photo ? toHttpsUrl(p.photo) : '';
  const raceCol = { T:'#2563eb', P:'#d97706', Z:'#7c3aed' }[p.race] || '#94a3b8';
  const win = Number(p.win||0), loss = Number(p.loss||0), games = win+loss;
  const wr = games ? Math.round(win/games*100) : null;
  const wrCol = wr==null ? '#94a3b8' : (wr>=50 ? '#16a34a' : '#dc2626');
  const tierCol = (p.tier && typeof getTierBtnColor==='function') ? getTierBtnColor(p.tier) : col;
  const tierTxt = (p.tier && typeof getTierBtnTextColor==='function') ? (getTierBtnTextColor(p.tier)||'#fff') : '#fff';
  const _2ndAvatar = (photo && typeof _phSwap2ndHTML==='function') ? _phSwap2ndHTML(p.secondProfileFile) : '';
  const attrName = (p.name||'').replace(/"/g,'&quot;');
  return `<tr data-b2lc-player="${attrName}" onclick="_b2LineupCardHoverLeave();openPlayerModal('${safeName}')" onmouseenter="_b2LineupCardHoverEnter(event,this,'${safeName}','${col}')" onmouseleave="_b2LineupCardHoverLeave()" style="--tier-c:${p.tier ? tierCol : 'transparent'}">
    <td><div class="b2-lc4-namecell">
      <div class="b2-lc4-avatar${_2ndAvatar?' ph-swap':''}">
        ${photo
          ? `<img src="${photo}" data-orig="${photoOrig}" crossorigin="anonymous" loading="eager" fetchpriority="high" decoding="async" onerror="if(this.dataset.orig&&this.src!==this.dataset.orig){this.removeAttribute('crossorigin');this.src=this.dataset.orig;}else{this.style.display='none';this.nextElementSibling.style.display='flex'}"><div class="b2-lc4-fallback" style="display:none">${raceLetter}</div>`
          : `<div class="b2-lc4-fallback">${raceLetter}</div>`}
        ${_2ndAvatar}
      </div>
      <span class="b2-lc4-name">${p.name||''}</span>
      <button class="b2-lineup-tts-btn" title="이 스트리머 음성듣기" onclick="event.stopPropagation();_b2LineupSpeakPlayer('${safeName}')" style="margin-left:6px;width:22px;height:22px;border-radius:999px;border:1px solid var(--border2);background:var(--white);color:var(--text2);font-size:11px;line-height:1;cursor:pointer;padding:0">🔊</button>
    </div></td>
    <td>${p.role || '일반'}</td>
    <td>${p.tier?`<span class="b2-lc4-chip" style="background:${tierCol};color:${tierTxt}">${p.tier}</span>`:'미정'}</td>
    <td>${(p.race&&p.race!=='N')?`<span class="b2-lc4-chip" style="background:${raceCol}">${p.race}</span>`:'-'}</td>
    <td>${games ? `${win}승 ${loss}패` : '기록 없음'}</td>
    <td><div class="b2-lc4-wrcell">
      <span class="b2-lc4-wr" style="color:${wrCol}">${wr==null?'-':wr+'%'}</span>
    </div></td>
  </tr>`;
}

function _b2LineupTable(members, col, iconUrl, univName, hideHead) {
  if (!members.length) return '';
  const headBar = iconUrl
    ? `<div class="b2-lc4-head"><img src="${toHttpsUrl(iconUrl)}" alt="" onerror="this.style.display='none'"><span>${univName||''}</span></div>`
    : '';
  return `<div class="b2-lc4-wrap" style="--lc-col:${col}">
    ${headBar}
    <table class="b2-lc4">
      ${hideHead ? '' : '<thead><tr><th>이름</th><th>역할</th><th>티어</th><th>종족</th><th>전적</th><th>승률</th></tr></thead>'}
      <tbody>${members.map(p => _b2LineupTableRow(p, col)).join('')}</tbody>
    </table>
  </div>`;
}

function _b2LineupCard(p, col, big, iconUrl) {
  const safeName = (p.name||'').replace(/'/g,"\\'");
  const raceLetter = (p.race && p.race!=='N') ? p.race : '?';
  const photo = p.photo ? toScaledUrl(p.photo,340) : '';
  const photoOrig = p.photo ? toHttpsUrl(p.photo) : '';
  const _raceCol = { T:'#2563eb', P:'#d97706', Z:'#7c3aed' }[p.race] || '#475569';
  const badgeTxt = big ? (p.role||'') : (p.tier||'');
  // 티어 배지 색상 — 스트리머탭 티어색상과 동일하게
  const _tierBadgeCol = (!big && p.tier && typeof getTierBtnColor==='function') ? getTierBtnColor(p.tier) : col;
  const _tierBadgeTxt = (!big && p.tier && typeof getTierBtnTextColor==='function') ? (getTierBtnTextColor(p.tier)||'#fff') : '#fff';
  // 배경 blur 레이어
  const _fillBackdrop = photo
    ? `<img src="${photo}" data-orig="${photoOrig}" crossorigin="anonymous" loading="eager" fetchpriority="high" decoding="async" aria-hidden="true" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center;transform:scale(1.22);filter:blur(16px) saturate(1.15) brightness(.8);opacity:.85" onerror="if(this.dataset.orig&&this.src!==this.dataset.orig){this.removeAttribute('crossorigin');this.src=this.dataset.orig;}else{this.style.display='none'}">
       <div style="position:absolute;inset:0;background:linear-gradient(180deg,${col}33 0%,rgba(0,0,0,.18) 100%)"></div>`
    : `<div style="position:absolute;inset:0;background:linear-gradient(160deg,${col}44 0%,${col}1a 100%)"></div>`;
  // 메인 사진 (전체 꽉 채움, 모양 적용 없이 카드 자체 overflow:hidden으로 처리)
  const photoHtml = photo
    ? `<img class="b2-lineup-card-photo" src="${photo}" data-orig="${photoOrig}" crossorigin="anonymous" loading="eager" fetchpriority="high" decoding="async" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center" onerror="if(this.dataset.orig&&this.src!==this.dataset.orig){this.removeAttribute('crossorigin');this.src=this.dataset.orig;}else{this.style.display='none';this.nextElementSibling.style.display='flex'}">
       <div style="position:absolute;inset:0;display:none;align-items:center;justify-content:center;flex-direction:column;gap:6px">
         <div style="font-size:56px;font-weight:900;color:${col};opacity:.7">${raceLetter}</div>
       </div>`
    : `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:6px">
         <div style="font-size:56px;font-weight:900;color:${col};opacity:.7">${raceLetter}</div>
       </div>`;
  // 이미지2(두번째 프로필) 호버 스크럽 미리보기 (PC 마우스 전용)
  const _lcSecondRaw = String(p.secondProfileFile || '').trim();
  const _lcSecondIsVideo = /\.(mp4|webm|ogg|mov|m4v)(\?|$)/i.test(_lcSecondRaw);
  const lcSecondPhoto = (_lcSecondRaw && !_lcSecondIsVideo) ? _lcSecondRaw : '';
  const _lcSecondIsGif = /\.gif(\?|$)/i.test(_lcSecondRaw);
  const lcSecondSrc = lcSecondPhoto ? (_lcSecondIsGif ? toHttpsUrl(lcSecondPhoto) : toScaledUrl(lcSecondPhoto,340)) : '';
  const lcSecondHtml = lcSecondPhoto
    ? `<img class="b2-players-card-secondary" style="z-index:1" src="${lcSecondSrc}" data-orig="${toHttpsUrl(lcSecondPhoto)}" loading="eager" fetchpriority="high" decoding="async" alt="" onerror="if(this.dataset.orig&&this.src!==this.dataset.orig){this.src=this.dataset.orig;}else{this.remove()}">`
    : '';
  // 종족 배지 — 우상단
  const _raceBadge = (p.race && p.race!=='N')
    ? `<div style="position:absolute;top:10px;right:10px;padding:3px 10px;border-radius:999px;background:${_raceCol};color:#fff;font-size:var(--fs-sm);font-weight:800;box-shadow:0 2px 8px rgba(0,0,0,.32);z-index:2;letter-spacing:.02em">${p.race}</div>`
    : '';
  const _nameBar = `
    <div style="position:absolute;bottom:0;left:0;right:0;z-index:2;padding:12px 14px 13px">
      ${badgeTxt?`<div style="margin-bottom:4px"><span style="background:${_tierBadgeCol};color:${_tierBadgeTxt};font-weight:900;font-size:var(--fs-base);padding:2px 9px;border-radius:999px;white-space:nowrap;line-height:1.6;letter-spacing:-.01em">${badgeTxt}</span></div>`:''}
      <div style="color:#fff;font-weight:900;font-size:19px;letter-spacing:-.02em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 1px 4px rgba(0,0,0,.5)">${p.name||''}</div>
    </div>`;
  const attrName = (p.name||'').replace(/"/g,'&quot;');
  return `
    <div data-b2lc-player="${attrName}" style="position:relative;cursor:pointer;border-radius:var(--r2);overflow:hidden;background:${_b2PastelBg(col,0.10)};box-shadow:0 4px 16px rgba(15,23,42,.18);border:1px solid ${col}33;transition:transform .15s,box-shadow .15s" onclick="_b2LineupCardHoverLeave();openPlayerModal('${safeName}')"
      onmouseenter="this.style.transform='translateY(-3px)';this.style.boxShadow='0 10px 26px rgba(15,23,42,.28)';_b2LineupCardHoverEnter(event,this,'${safeName}','${col}')"
      onmouseleave="this.style.transform='';this.style.boxShadow='0 4px 16px rgba(15,23,42,.18)'${lcSecondPhoto ? ";_b2CardHoverLeave(this)" : ""};_b2LineupCardHoverLeave()"${lcSecondPhoto ? ` onmousemove="_b2CardHoverScrub(event,this)"` : ''}>
      <div style="position:relative;width:100%;aspect-ratio:3/4;overflow:hidden">
        <button class="b2-lineup-tts-btn" title="이 스트리머 음성듣기" onclick="event.stopPropagation();_b2LineupSpeakPlayer('${safeName}')" style="position:absolute;top:8px;left:8px;z-index:3;width:28px;height:28px;border-radius:999px;border:1px solid rgba(255,255,255,.55);background:rgba(15,23,42,.55);color:#fff;font-size:13px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0">🔊</button>
        ${_fillBackdrop}
        ${photoHtml}
        ${lcSecondHtml}
        ${_raceBadge}
        ${_nameBar}
      </div>
    </div>`;
}

// 라인업 화면(카드/테이블)과 라인업 소개(TTS)가 항상 같은 순서로 선수를 나열하도록
// 멤버 필터링·정렬 로직을 한 곳으로 모았습니다.
function _b2LineupMembers(univName) {
  const members = players.filter(p => String(p?.univ||'').trim() === String(univName||'').trim() && !p.hidden && !p.retired && !p.hideFromBoard);
  const roleMembers = members.filter(p => _b2HasRole(p));
  roleMembers.sort((a,b) => _b2RoleRank(a) - _b2RoleRank(b));
  const rosterMembers = members.filter(p => !_b2HasRole(p));
  rosterMembers.sort((a,b) => {
    const ta = TIERS.indexOf(a.tier||''), tb = TIERS.indexOf(b.tier||'');
    const ra = ta>=0?ta:99, rb = tb>=0?tb:99;
    if (ra!==rb) return ra-rb;
    return (a.name||'').localeCompare(b.name||'', 'ko', {sensitivity:'base'});
  });
  return { members, roleMembers, rosterMembers };
}

function _b2LineupPoster(univName, col, forExport=false) {
  if (!univName) return `<div style="text-align:center;color:var(--text3);padding:40px">대학을 선택해주세요</div>`;
  const uCfg = (typeof univCfg !== 'undefined' ? univCfg.find(x=>x.name===univName) : null) || {};
  const iconUrl = uCfg.icon || uCfg.img || UNIV_ICONS[univName] || '';
  const { members, roleMembers, rosterMembers } = _b2LineupMembers(univName);

  if (!members.length) {
    return `<div style="border-radius:18px;border:2px dashed ${col}55;padding:30px;background:${col}10;text-align:center;color:var(--text3)">등록된 선수가 없습니다</div>`;
  }

  const _lcMode = (typeof _b2LineupCardMode !== 'undefined') ? _b2LineupCardMode : 'default';
  const _cardFn = _lcMode === 'stat' ? _b2LineupCard3 : null;
  const _cardMinW = _lcMode === 'stat' ? 190 : 170;
  const _lcGridCols = (_lcMode === 'table') ? '1fr' : `repeat(auto-fill,minmax(${_cardMinW}px,1fr))`;
  const _lcGridGap = (_lcMode === 'table') ? 0 : 16;
  const roleCardsHtml = _lcMode === 'table'
    ? _b2LineupTable(roleMembers, col, iconUrl, univName)
    : roleMembers.map(p => _cardFn ? _cardFn(p, col) : _b2LineupCard(p, col, true, iconUrl)).join('');
  const rosterCardsHtml = _lcMode === 'table'
    ? _b2LineupTable(rosterMembers, col, roleMembers.length ? '' : iconUrl, univName)
    : rosterMembers.map(p => _cardFn ? _cardFn(p, col) : _b2LineupCard(p, col, false, iconUrl)).join('');

  const dateTxt = new Date().toISOString().slice(0,10).replace(/-/g,'.');

  // 종족 통계 — 로스터(일반 멤버) 기준
  const raceCount = { T: 0, P: 0, Z: 0 };
  rosterMembers.forEach(p => { if (raceCount.hasOwnProperty(p.race)) raceCount[p.race]++; });
  const _raceMeta = [
    { k:'T', ico:'⚔️', col:'#2563eb' },
    { k:'P', ico:'🔮', col:'#d97706' },
    { k:'Z', ico:'🦎', col:'#7c3aed' }
  ];
  const raceStatHtml = _raceMeta.filter(r => raceCount[r.k] > 0).map(r => `
    <span style="display:inline-flex;align-items:center;gap:4px;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.22);border-radius:999px;padding:5px 12px 5px 10px;color:#fff;font-size:var(--fs-sm);font-weight:800">
      <span style="font-size:var(--fs-sm)">${r.ico}</span>${r.k} ${raceCount[r.k]}
    </span>`).join('');

  return `
    <div data-b2lineup="${univName.replace(/"/g,'&quot;')}" style="border-radius:24px;overflow:hidden;background:#0b1220;box-shadow:0 20px 40px rgba(15,23,42,.28)">
      <div style="padding:30px 30px 24px;position:relative;overflow:hidden;background:linear-gradient(135deg,${col} 0%,${col}cc 65%,#0b1220 130%)">
        <div style="position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,.14),transparent 58%);pointer-events:none"></div>
        ${iconUrl?`<img src="${toHttpsUrl(iconUrl)}" aria-hidden="true" style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);max-height:84%;max-width:160px;width:auto;height:auto;opacity:.20;object-fit:contain;pointer-events:none;filter:drop-shadow(0 0 20px ${col})" onerror="this.style.display='none'">`:''}
        <div style="position:relative;z-index:1;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap">
          <div style="display:flex;align-items:center;gap:14px;min-width:0">
            ${iconUrl?`<img src="${toHttpsUrl(iconUrl)}" style="width:62px;height:62px;object-fit:contain;border-radius:0;background:transparent;border:none;padding:0;flex-shrink:0" onerror="this.style.display='none'">`:''}
            <div style="min-width:0">
              <div style="color:rgba(255,255,255,.64);font-size:var(--fs-sm);font-weight:800;letter-spacing:.10em;text-transform:uppercase">SDC MEMBER LINEUP</div>
              <div style="color:#fff;font-weight:950;font-size:32px;letter-spacing:-.03em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 2px 8px rgba(0,0,0,.18)">${univName}</div>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:8px;flex-shrink:0">
            <span style="background:rgba(255,255,255,.16);color:#fff;font-size:var(--fs-base);font-weight:800;padding:7px 16px;border-radius:999px;border:1px solid rgba(255,255,255,.24);backdrop-filter:blur(8px)">총 ${members.length}명</span>
            <span style="color:rgba(255,255,255,.55);font-size:var(--fs-sm);font-weight:700">${dateTxt}</span>
          </div>
        </div>
        ${raceStatHtml ? `<div style="position:relative;z-index:1;display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:16px">${raceStatHtml}</div>` : ''}
      </div>
      <div style="position:relative;overflow:hidden;background:linear-gradient(180deg,${_b2PastelBg(col,0.26)} 0%,${_b2PastelBg(col,0.18)} 100%);padding:26px 28px 32px">
        ${(iconUrl)?`<img src="${toHttpsUrl(iconUrl)}" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:58%;max-width:560px;opacity:.16;object-fit:contain;pointer-events:none;z-index:0" onerror="this.style.display='none'">`:''}
        <div style="position:relative;z-index:1">
          ${roleCardsHtml ? `
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
            <div style="width:3px;height:14px;border-radius:999px;background:${col};flex-shrink:0"></div>
            <div style="font-size:var(--fs-caption);font-weight:900;color:${col};letter-spacing:.06em;text-transform:uppercase">직급자</div>
          </div>
          <div style="display:grid;grid-template-columns:${_lcGridCols};gap:${_lcGridGap}px;margin-bottom:24px">${roleCardsHtml}</div>
          ${_lcMode === 'table' ? '' : `<div style="height:1px;background:linear-gradient(90deg,${col}44,transparent);margin-bottom:20px"></div>`}
          ` : ''}
          <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px;flex-wrap:wrap">
            <div style="display:flex;align-items:center;gap:8px">
              <div style="width:3px;height:14px;border-radius:999px;background:${col}99;flex-shrink:0"></div>
              <div style="font-size:var(--fs-caption);font-weight:900;color:${col};letter-spacing:.06em;text-transform:uppercase">멤버</div>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:${_lcGridCols};gap:${_lcGridGap}px">${rosterCardsHtml}</div>
        </div>
      </div>
    </div>`;
}

function _b2LineupView() {
  const univList = _b2VisUnivs().filter(u => u.name !== '무소속');
  if (!univList.length) return `<div style="text-align:center;color:var(--text3);padding:40px">등록된 대학이 없습니다</div>`;
  if (!_b2LineupUniv || !univList.some(u=>u.name===_b2LineupUniv)) _b2LineupUniv = univList[0].name;
  const col = gc(_b2LineupUniv);
  return `<div style="max-width:1360px;margin:0 auto">${_b2LineupPoster(_b2LineupUniv, col, false)}</div>`;
}

/* ══════════════════════════════════════════════════════════════
   🔊 라인업 음성 소개 (Web Speech API) — 카드 화면을 그대로 두고
   대학 라인업을 순서대로 읽어주면서, 지금 소개 중인 선수 카드에
   하이라이트 표시를 준다. 서버/외부 API 없이 브라우저 내장 TTS만 사용.
══════════════════════════════════════════════════════════════ */
;(function _injectLineupSpeakStyle(){
  if(typeof document==='undefined') return;
  const prev = document.getElementById('b2-lineup-speak-style');
  if(prev) prev.remove();
  const s=document.createElement('style');
  s.id='b2-lineup-speak-style';
  s.textContent=[
    '.b2-lc-speaking{outline:3px solid #2563eb!important;outline-offset:3px;box-shadow:0 0 0 7px rgba(37,99,235,.22),0 10px 26px rgba(15,23,42,.28)!important;transition:outline .18s ease,box-shadow .18s ease}',
    '.b2-lc4 tbody tr.b2-lc-speaking td{background:rgba(37,99,235,.20)!important}',
    ':is(body.dark,html.dark) .b2-lc4 tbody tr.b2-lc-speaking td{background:rgba(96,165,250,.28)!important}',
    /* "소개 연출" 스포트라이트: 이미 등장한 카드 중 지금 소개 중이 아닌 카드는 어둡게+블러 처리해서
       무대 조명이 현재 카드에만 떨어지는 느낌을 준다. (b2-lc-speaking과 별개로 토글) */
    '.b2-lc-intro-dim{opacity:.4!important;filter:blur(1.5px) saturate(.65)!important;transform:scale(.96)!important;transition:opacity .4s ease,filter .4s ease,transform .4s ease!important}',
    /* 무대 암전 배경 */
    '#b2-lc-intro-backdrop{position:fixed;inset:0;z-index:9990;pointer-events:auto;opacity:0;transition:opacity .45s ease;background:radial-gradient(circle at 50% 45%,rgba(15,23,42,.28) 0%,rgba(15,23,42,.72) 62%,rgba(2,6,23,.88) 100%)}',
    '#b2-lc-intro-backdrop.on{opacity:1}',
    /* 중앙 스포트라이트 빔(살짝 흔들리는 조명) */
    '#b2-lc-intro-beam{position:fixed;left:50%;top:-12vh;width:52vw;height:120vh;margin-left:-26vw;z-index:9991;pointer-events:none;opacity:0;transition:opacity .5s ease;background:linear-gradient(to bottom,rgba(255,255,255,.20),rgba(255,255,255,.06) 45%,rgba(255,255,255,0) 78%);clip-path:polygon(38% 0,62% 0,100% 100%,0 100%);filter:blur(6px);animation:b2LcBeamSway 4.5s ease-in-out infinite alternate}',
    '#b2-lc-intro-beam.on{opacity:1}',
    /* [FEATURE-CINEMATIC] 영화관 느낌의 레터박스(상/하 검은 띠) — 재생 시작과 함께
       위아래에서 슬라이드되어 들어와 화면비를 좁혀 보이게 하고, 종료 시 다시 걷힌다. */
    '#b2-lc-intro-letterbox-top,#b2-lc-intro-letterbox-bottom{position:fixed;left:0;width:100%;height:9vh;min-height:44px;max-height:96px;z-index:9993;pointer-events:none;background:linear-gradient(180deg,#000,rgba(0,0,0,.94));transition:transform .6s cubic-bezier(.16,1,.3,1)}',
    '#b2-lc-intro-letterbox-top{top:0;transform:translateY(-100%)}',
    '#b2-lc-intro-letterbox-bottom{bottom:0;transform:translateY(100%)}',
    '#b2-lc-intro-letterbox-top.on{transform:translateY(0)}',
    '#b2-lc-intro-letterbox-bottom.on{transform:translateY(0)}',
    /* 화면 가장자리를 살짝 어둡게 눌러주는 비네트 — 카메라 렌즈 느낌 */
    '#b2-lc-intro-vignette{position:fixed;inset:0;z-index:9992;pointer-events:none;opacity:0;transition:opacity .6s ease;background:radial-gradient(ellipse at center,rgba(0,0,0,0) 55%,rgba(0,0,0,.55) 100%)}',
    '#b2-lc-intro-vignette.on{opacity:1}',
    '@keyframes b2LcBeamSway{from{transform:rotate(-2.5deg)}to{transform:rotate(2.5deg)}}',
    /* 복제 카드 등장/발광 (색은 --intro-glow로 선수 티어 색상에 맞춰 동적으로 바뀜) */
    '.b2-lc-intro-clone{border-radius:14px;will-change:transform,opacity,filter;--intro-glow:#60a5fa}',
    '.b2-lc-intro-clone.pulse{animation:b2LcClonePulse 1.5s ease-in-out infinite}',
    '@keyframes b2LcClonePulse{0%,100%{filter:drop-shadow(0 22px 55px rgba(15,23,42,.5)) drop-shadow(0 0 0 transparent)}50%{filter:drop-shadow(0 22px 55px rgba(15,23,42,.5)) drop-shadow(0 0 30px var(--intro-glow,#60a5fa))}}',
    /* 카드 위를 스치는 광택 */
    '.b2-lc-intro-shine{position:fixed;z-index:9999;pointer-events:none;overflow:hidden;border-radius:14px}',
    '.b2-lc-intro-shine::after{content:"";position:absolute;top:-60%;left:-40%;width:40%;height:220%;background:linear-gradient(100deg,rgba(255,255,255,0),rgba(255,255,255,.55),rgba(255,255,255,0));transform:rotate(12deg);animation:b2LcShine 1.05s cubic-bezier(.45,.05,.3,1) .12s 1 both}',
    '@keyframes b2LcShine{from{left:-45%}to{left:115%}}',
    /* 착지 파장 (선수 티어 색상 테두리) */
    '.b2-lc-intro-ripple{position:fixed;z-index:9997;pointer-events:none;border-radius:16px;border:2px solid var(--intro-glow,rgba(96,165,250,.85));animation:b2LcRipple .7s ease-out forwards}',
    '@keyframes b2LcRipple{from{opacity:.9;transform:scale(1)}to{opacity:0;transform:scale(1.35)}}',
    /* 착지 순간 사방으로 튀는 반짝이(스파클) 파티클 */
    '.b2-lc-intro-spark{position:fixed;z-index:9998;pointer-events:none;width:7px;height:7px;border-radius:50%;background:var(--intro-glow,#60a5fa);box-shadow:0 0 8px 1px var(--intro-glow,#60a5fa);animation:b2LcSpark .65s cubic-bezier(.16,.8,.3,1) forwards}',
    '@keyframes b2LcSpark{0%{opacity:1;transform:translate(0,0) scale(1)}100%{opacity:0;transform:translate(var(--sx,0),var(--sy,0)) scale(.3)}}',
    /* 종족별 파티클 변형 — 저그(유기체 블롭)/테란(금속 파편, 각짐)/프로토스(작은 사이오닉 입자) */
    '.b2-lc-intro-spark.race-z{width:9px;height:8px;border-radius:40% 60% 55% 45%/50% 40% 60% 50%;animation-duration:.85s}',
    '.b2-lc-intro-spark.race-t{border-radius:2px;width:6px;height:6px;box-shadow:0 0 6px 1px var(--intro-glow,#60a5fa)}',
    '.b2-lc-intro-spark.race-p{width:5px;height:5px;animation-duration:.75s}',
    /* 프로토스 착지 시 확장되는 사이오닉 링 */
    '.b2-lc-intro-psiring{position:fixed;z-index:9997;pointer-events:none;left:0;top:0;width:10px;height:10px;margin-left:-5px;margin-top:-5px;border-radius:50%;border:2px solid var(--intro-glow,#a78bfa);box-shadow:0 0 16px 2px var(--intro-glow,#a78bfa);animation:b2LcPsiRing .85s cubic-bezier(.16,.8,.3,1) forwards}',
    '@keyframes b2LcPsiRing{0%{opacity:.9;transform:scale(1)}100%{opacity:0;transform:scale(9)}}',
    /* ELO 배지 — 이름 자막 위쪽 */
    '#b2-lc-intro-elobadge{position:fixed;left:50%;bottom:11.5vh;transform:translate(-50%,10px);z-index:9999;pointer-events:none;opacity:0;transition:opacity .3s ease,transform .35s cubic-bezier(.34,1.56,.64,1);padding:3px 14px;border-radius:999px;background:rgba(255,255,255,.12);color:#fff;font-weight:800;font-size:12px;letter-spacing:.3px;backdrop-filter:blur(6px)}',
    '#b2-lc-intro-elobadge.on{opacity:1;transform:translate(-50%,0)}',
    /* 이름 자막 */
    '#b2-lc-intro-caption{position:fixed;left:50%;bottom:7vh;transform:translate(-50%,18px);z-index:9999;pointer-events:none;opacity:0;transition:opacity .3s ease,transform .35s cubic-bezier(.34,1.56,.64,1);padding:10px 22px;border-radius:999px;background:rgba(15,23,42,.82);color:#fff;font-weight:800;font-size:clamp(15px,2.4vw,22px);letter-spacing:.5px;box-shadow:0 12px 34px rgba(2,6,23,.5);backdrop-filter:blur(6px)}',
    '#b2-lc-intro-caption.on{opacity:1;transform:translate(-50%,0)}',
    /* 한줄평 자막(이름 자막 바로 아래, 살짝 더 작고 옅게) */
    '#b2-lc-intro-subcap{position:fixed;left:50%;bottom:3.4vh;transform:translate(-50%,14px);z-index:9999;pointer-events:none;opacity:0;transition:opacity .3s ease .05s,transform .35s cubic-bezier(.34,1.56,.64,1) .05s;padding:5px 16px;border-radius:999px;background:rgba(15,23,42,.6);color:rgba(255,255,255,.92);font-weight:700;font-size:clamp(12px,1.6vw,15px);letter-spacing:.2px;max-width:88vw;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;backdrop-filter:blur(6px)}',
    '#b2-lc-intro-subcap.on{opacity:1;transform:translate(-50%,0)}',
    /* 한줄평 자막 바로 아래 — 일시정지/종료 컨트롤 */
    '#b2-lc-intro-controls{position:fixed;left:50%;bottom:1.1vh;transform:translate(-50%,10px);z-index:10000;display:flex;gap:8px;opacity:0;pointer-events:none;transition:opacity .3s ease .1s,transform .35s cubic-bezier(.34,1.56,.64,1) .1s}',
    '#b2-lc-intro-controls.on{opacity:1;transform:translate(-50%,0);pointer-events:auto}',
    '#b2-lc-intro-controls button{cursor:pointer;border:1px solid rgba(255,255,255,.22);background:rgba(15,23,42,.62);color:rgba(255,255,255,.95);font-weight:700;font-size:12px;letter-spacing:.2px;padding:6px 14px;border-radius:999px;backdrop-filter:blur(6px);transition:background .15s ease,transform .15s ease}',
    '#b2-lc-intro-controls button:hover{background:rgba(30,41,59,.82);transform:translateY(-1px)}',
    '#b2-lc-intro-controls button:active{transform:translateY(0)}',
    /* 진행도 표시(상단 얇은 바) */
    '#b2-lc-intro-progress-track{position:fixed;left:0;top:0;width:100%;height:3px;z-index:10000;background:rgba(255,255,255,.12);opacity:0;transition:opacity .3s ease}',
    '#b2-lc-intro-progress-track.on{opacity:1}',
    '#b2-lc-intro-progress-bar{height:100%;width:0%;background:linear-gradient(90deg,#60a5fa,#a78bfa);transition:width .35s ease}',
    '.b2-lc-landed{animation:b2LcLanded .55s cubic-bezier(.34,1.56,.64,1)}',
    '@keyframes b2LcLanded{0%{transform:scale(1.06)}60%{transform:scale(.985)}100%{transform:scale(1)}}',
    /* 소개연출 재생 중에는 카드/표의 스트리머별 개별 🔊 듣기 버튼을 숨긴다 */
    'body.b2-lc-intro-active .b2-lineup-tts-btn{display:none!important}',
    /* 최상위 티어/에이스 등장 시 화면 흔들림 */
    '@keyframes b2LcShake{0%,100%{transform:translate3d(0,0,0)}20%{transform:translate3d(-6px,3px,0)}40%{transform:translate3d(5px,-4px,0)}60%{transform:translate3d(-4px,4px,0)}80%{transform:translate3d(6px,-2px,0)}}',
    '.b2-lc-intro-shake{animation:b2LcShake .5s ease-in-out}',
    /* 마지막(에이스) 카드 등장 시 화이트 플래시 */
    '#b2-lc-intro-flash{position:fixed;inset:0;z-index:9996;pointer-events:none;background:#fff;opacity:0}',
    '#b2-lc-intro-flash.hit{animation:b2LcFlash .55s ease-out}',
    '@keyframes b2LcFlash{0%{opacity:0}12%{opacity:.85}100%{opacity:0}}',
    /* 배경에 떠다니는 앰비언트 파티클(먼지/별) */
    '#b2-lc-intro-particles{position:fixed;inset:0;z-index:9989;pointer-events:none;overflow:hidden;opacity:0;transition:opacity .6s ease}',
    '#b2-lc-intro-particles.on{opacity:1}',
    '.b2-lc-ambient-p{position:absolute;bottom:-10px;border-radius:50%;background:rgba(255,255,255,.55);box-shadow:0 0 6px 1px rgba(255,255,255,.35);animation:b2LcAmbientFloat linear infinite}',
    '@keyframes b2LcAmbientFloat{0%{transform:translateY(0) translateX(0);opacity:0}8%{opacity:.8}92%{opacity:.6}100%{transform:translateY(-110vh) translateX(var(--drift,20px));opacity:0}}',
    /* 시작 전 3-2-1 카운트다운 */
    '#b2-lc-intro-countdown{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%) scale(1);z-index:10001;pointer-events:none;opacity:0;font-weight:900;font-size:min(22vw,220px);color:#fff;text-shadow:0 0 40px rgba(96,165,250,.8),0 8px 30px rgba(2,6,23,.6)}',
    '#b2-lc-intro-countdown.go{animation:b2LcCountdownPop .78s cubic-bezier(.2,1.4,.4,1)}',
    '@keyframes b2LcCountdownPop{0%{opacity:0;transform:translate(-50%,-50%) scale(.4)}18%{opacity:1;transform:translate(-50%,-50%) scale(1.08)}70%{opacity:1;transform:translate(-50%,-50%) scale(1)}100%{opacity:0;transform:translate(-50%,-50%) scale(1.15)}}',
    /* 한줄평 타이핑 효과용 커서 */
    '#b2-lc-intro-subcap.typing::after{content:"";display:inline-block;width:2px;height:1em;margin-left:2px;background:currentColor;vertical-align:-2px;animation:b2LcCaret .8s steps(1) infinite}',
    '@keyframes b2LcCaret{0%,49%{opacity:1}50%,100%{opacity:0}}',
    /* 라인업 카드 호버 시 뜨는 선수 정보 미니 팝업 (PC 마우스 전용) */
    '#b2-lc-hovertip{position:fixed;z-index:10050;pointer-events:none;opacity:0;transform:translateY(4px);transition:opacity .15s ease,transform .15s ease;background:rgba(15,23,42,.96);color:#fff;border:1px solid transparent;border-radius:14px;padding:12px 14px;box-shadow:0 16px 38px rgba(2,6,23,.45);min-width:300px;max-width:340px;backdrop-filter:blur(6px)}',
    '#b2-lc-hovertip.on{opacity:1;transform:translateY(0)}',
    '#b2-lc-hovertip.below{transform:translateY(-4px)}',
    '#b2-lc-hovertip.below.on{transform:translateY(0)}',
    '.b2-lc-hovertip-body{display:flex;flex-direction:column}',
    '.b2-lc-hovertip-top{display:flex;align-items:flex-start;gap:12px}',
    '.b2-lc-hovertip-photowrap{position:relative;width:92px;height:122px;border-radius:12px;overflow:hidden;flex-shrink:0;background:rgba(255,255,255,.1)}',
    '.b2-lc-hovertip-photo{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center}',
    '.b2-lc-hovertip-photo.has2{animation:b2LcHovertipFade1 4.4s ease-in-out infinite}',
    '.b2-lc-hovertip-photo2{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center;opacity:0;animation:b2LcHovertipFade2 4.4s ease-in-out infinite}',
    '@keyframes b2LcHovertipFade1{0%,42%{opacity:1}52%,92%{opacity:0}100%{opacity:1}}',
    '@keyframes b2LcHovertipFade2{0%,42%{opacity:0}52%,92%{opacity:1}100%{opacity:0}}',
    '.b2-lc-hovertip-fallback{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:30px;color:rgba(255,255,255,.65)}',
    '.b2-lc-hovertip-content{flex:1;min-width:0}',
    '.b2-lc-hovertip-title{font-size:10px;font-weight:900;color:rgba(255,255,255,.6);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px}',
    '.b2-lc-hovertip-name{font-size:14px;font-weight:900;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:2px}',
    '.b2-lc-hovertip-tier{display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:900;color:rgba(255,255,255,.65);margin-bottom:10px}',
    '.b2-lc-hovertip-tier-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0}',
    '.b2-lc-hovertip-30d{display:flex;align-items:center;gap:9px}',
    '.b2-lc-hovertip-30d-gauge{position:relative;width:48px;height:48px;border-radius:50%;flex-shrink:0}',
    '.b2-lc-hovertip-30d-gauge-inner{position:absolute;inset:4px;border-radius:50%;background:#0f172a;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:900;color:#fff}',
    '.b2-lc-hovertip-30d-text{font-size:10px;color:rgba(255,255,255,.8);font-weight:800;line-height:1.55}',
    '.b2-lc-hovertip-30d-text b{color:#fff;font-weight:900}',
    '.b2-lc-hovertip-30d-text .w{color:#f87171}',
    '.b2-lc-hovertip-30d-text .l{color:#60a5fa}',
    '.b2-lc-hovertip-section{margin-top:10px;padding-top:9px;border-top:1px solid rgba(255,255,255,.14)}',
    '.b2-lc-hovertip-race-row{display:flex;align-items:center;gap:7px;font-size:10px;padding:2.5px 0;color:rgba(255,255,255,.88)}',
    '.b2-lc-hovertip-race-label{width:38px;flex-shrink:0;font-weight:900}',
    '.b2-lc-hovertip-race-bar{flex:1;height:6px;border-radius:999px;background:rgba(255,255,255,.14);overflow:hidden}',
    '.b2-lc-hovertip-race-bar>span{display:block;height:100%;border-radius:999px}',
    '.b2-lc-hovertip-race-wr{width:34px;flex-shrink:0;text-align:right;font-weight:900;color:#fff}',
    '.b2-lc-hovertip-race-games{width:38px;flex-shrink:0;text-align:right;font-size:9px;color:rgba(255,255,255,.5);font-weight:700}',
    '.b2-lc-hovertip-trend-svg{display:block;width:100%;height:42px;margin-top:2px}',
    '.b2-lc-hovertip-dots{display:flex;gap:3px;margin-bottom:7px}',
    '.b2-lc-hovertip-dot{width:18px;height:18px;border-radius:5px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:900;color:#fff}',
    '.b2-lc-hovertip-dot.w{background:var(--win-col,#dc2626)}',
    '.b2-lc-hovertip-dot.l{background:var(--lose-col,#2563eb)}',
    '.b2-lc-hovertip-row{display:flex;align-items:center;gap:6px;font-size:11px;padding:2px 0;color:rgba(255,255,255,.92)}',
    '.b2-lc-hovertip-res{font-weight:900;flex-shrink:0;width:16px}',
    '.b2-lc-hovertip-res.w{color:var(--win-col,#f87171)}',
    '.b2-lc-hovertip-res.l{color:var(--lose-col,#60a5fa)}',
    '.b2-lc-hovertip-opp{flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.b2-lc-hovertip-date{flex-shrink:0;color:rgba(255,255,255,.5);font-size:10px}',
    '.b2-lc-hovertip-empty{font-size:11px;color:rgba(255,255,255,.7)}',
    /* 라이트모드: 배경이 대학색상의 연한색이라 흰색 글자 대신 진한 색 계열로 전환 */
    '#b2-lc-hovertip.light{color:#0f172a;box-shadow:0 16px 38px rgba(15,23,42,.18)}',
    '#b2-lc-hovertip.light .b2-lc-hovertip-photowrap{background:rgba(15,23,42,.06)}',
    '#b2-lc-hovertip.light .b2-lc-hovertip-fallback{color:rgba(15,23,42,.32)}',
    '#b2-lc-hovertip.light .b2-lc-hovertip-title{color:rgba(15,23,42,.55)}',
    '#b2-lc-hovertip.light .b2-lc-hovertip-name{color:#0f172a}',
    '#b2-lc-hovertip.light .b2-lc-hovertip-tier{color:rgba(15,23,42,.6)}',
    '#b2-lc-hovertip.light .b2-lc-hovertip-30d-gauge-inner{background:rgba(255,255,255,.92);color:#0f172a;box-shadow:inset 0 0 0 1px rgba(15,23,42,.08)}',
    '#b2-lc-hovertip.light .b2-lc-hovertip-30d-text{color:rgba(15,23,42,.72)}',
    '#b2-lc-hovertip.light .b2-lc-hovertip-30d-text b{color:#0f172a}',
    '#b2-lc-hovertip.light .b2-lc-hovertip-section{border-top-color:rgba(15,23,42,.12)}',
    '#b2-lc-hovertip.light .b2-lc-hovertip-race-row{color:rgba(15,23,42,.85)}',
    '#b2-lc-hovertip.light .b2-lc-hovertip-race-bar{background:rgba(15,23,42,.1)}',
    '#b2-lc-hovertip.light .b2-lc-hovertip-race-wr{color:#0f172a}',
    '#b2-lc-hovertip.light .b2-lc-hovertip-race-games{color:rgba(15,23,42,.45)}',
    '#b2-lc-hovertip.light .b2-lc-hovertip-row{color:rgba(15,23,42,.88)}',
    '#b2-lc-hovertip.light .b2-lc-hovertip-date{color:rgba(15,23,42,.45)}',
    '#b2-lc-hovertip.light .b2-lc-hovertip-empty{color:rgba(15,23,42,.6)}'
  ].join('');

  document.head.appendChild(s);
})();

/* ── 라인업 카드 호버 시 "최근 전적" 미니 툴팁 (PC 마우스 전용, 모바일 터치는 무시) ──
   카드에 잠깐(약 0.26초)만 머물러야 뜨도록 살짝 지연을 줘서, 카드 사이를 훑고 지나갈 때
   툴팁이 깜빡깜빡 뜨는 걸 방지한다. */
var _b2LcHoverTimer = null;
var _b2LcHoverCurName = '';

function _b2LineupCardHoverEnter(e, card, name, col) {
  try {
    if (window.TabVis && typeof window.TabVis.visible === 'function' && !window.TabVis.visible('b2.univ.hoverpopup')) return;
    if (!window.matchMedia || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (_b2LcHoverTimer) clearTimeout(_b2LcHoverTimer);
    _b2LcHoverCurName = name;
    _b2LcHoverTimer = setTimeout(() => {
      if (_b2LcHoverCurName !== name) return;
      _b2LineupShowHoverTip(card, name, col);
    }, 260);
  } catch(e){}
}

function _b2LineupCardHoverLeave() {
  _b2LcHoverCurName = '';
  try { if (_b2LcHoverTimer) { clearTimeout(_b2LcHoverTimer); _b2LcHoverTimer = null; } } catch(e){}
  try { const tip = document.getElementById('b2-lc-hovertip'); if (tip) tip.classList.remove('on'); } catch(e){}
}

// 종족 코드(Z/T/P) → 표시용 라벨/색상 (선수 상세 "상대 종족별 전적" 카드와 동일한 배색 사용)
var _B2LC_RACE_META = [
  ['P', '프로토스', '#f59e0b'],
  ['T', '테란', '#3b82f6'],
  ['Z', '저그', '#a855f7']
];

function _b2LcRaceRowHtml(label, color, w, l) {
  const t = w + l;
  const wr = t ? Math.round(w / t * 100) : 0;
  return `<div class="b2-lc-hovertip-race-row">
    <span class="b2-lc-hovertip-race-label" style="color:${color}">${label}</span>
    <span class="b2-lc-hovertip-race-bar"><span style="width:${t ? wr : 0}%;background:${color}"></span></span>
    <span class="b2-lc-hovertip-race-wr">${t ? wr + '%' : '-'}</span>
    <span class="b2-lc-hovertip-race-games">${t}전</span>
  </div>`;
}

// 최근 경기 결과(오래된 → 최신) 배열로부터 "경기력 추세" 미니 스파크라인(SVG) 생성
// 승=1 / 패=-1로 두고 직전 최대 5경기의 이동평균을 선으로 표시 (선수 상세 리포트의 경기력 추세 그래프와 같은 개념)
function _b2LcTrendSparkSvg(histAsc, isLight) {
  const seq = (histAsc || []).filter(h => h && (h.result === '승' || h.result === '패')).slice(-20);
  if (seq.length < 2) return '';
  const vals = seq.map((h, i) => {
    const start = Math.max(0, i - 4);
    const win = seq.slice(start, i + 1).filter(x => x.result === '승').length;
    const tot = i - start + 1;
    return (win / tot) * 2 - 1; // 0~1 승률 -> -1~1
  });
  const W = 280, H = 46, PAD = 4;
  const stepX = vals.length > 1 ? (W - PAD * 2) / (vals.length - 1) : 0;
  const yOf = v => PAD + (1 - (v + 1) / 2) * (H - PAD * 2);
  const pts = vals.map((v, i) => [PAD + i * stepX, yOf(v)]);
  const line = pts.map((pt, i) => (i === 0 ? 'M' : 'L') + pt[0].toFixed(1) + ',' + pt[1].toFixed(1)).join(' ');
  const areaClose = ` L${pts[pts.length - 1][0].toFixed(1)},${(H - PAD).toFixed(1)} L${pts[0][0].toFixed(1)},${(H - PAD).toFixed(1)} Z`;
  const midY = yOf(0).toFixed(1);
  const refLineCol = isLight ? 'rgba(15,23,42,.22)' : 'rgba(255,255,255,.28)';
  return `<div class="b2-lc-hovertip-title" style="margin-bottom:4px">경기력 추세 (최근 ${seq.length}경기)</div>
    <svg class="b2-lc-hovertip-trend-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
      <line x1="${PAD}" y1="${midY}" x2="${W - PAD}" y2="${midY}" stroke="${refLineCol}" stroke-width="1" stroke-dasharray="3,3"/>
      <path d="${line}${areaClose}" fill="rgba(96,165,250,.28)" stroke="none"/>
      <path d="${line}" fill="none" stroke="#60a5fa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
}

// 라인업 카드 호버 팝업에 쓰는 통계(30일 성적/종족별 전적/경기력 추세)는
// _tpHistAllForPlayer() 등 계산 비용이 있는 함수를 거치므로, 같은 선수를 다시 호버할 때
// 매번 재계산하지 않도록 렌더 1회당 선수 이름 기준으로 캐시한다.
// 캐시는 render()가 새로 호출될 때(render-core.js의 _renderImpl)마다 window._b2LcHoverStatCache = {}
// 로 통째로 비워지므로, 데이터가 바뀌어 화면이 다시 그려지면 자연히 최신 값으로 갱신된다.
function _b2LcComputeHoverStats(p) {
  const histAll = (typeof _tpHistAllForPlayer === 'function') ? (_tpHistAllForPlayer(p) || []) : (p.history || []);
  const decided = histAll.filter(h => h && (h.result === '승' || h.result === '패'));
  const histDesc = [...decided].sort((a, b) => (typeof _tpDateNum === 'function' ? _tpDateNum(b && b.date) - _tpDateNum(a && a.date) : 0));
  const histAsc = [...decided].sort((a, b) => (typeof _tpDateNum === 'function' ? _tpDateNum(a && a.date) - _tpDateNum(b && b.date) : 0));
  const recent = histDesc.slice(0, 5);

  // 최근 30일 성적
  const cutoff30 = (typeof _tpDaysAgoNum === 'function') ? _tpDaysAgoNum(30) : 0;
  const last30 = cutoff30 ? decided.filter(h => (typeof _tpDateNum === 'function' ? _tpDateNum(h.date) : 0) >= cutoff30) : [];
  const w30 = last30.filter(h => h.result === '승').length;
  const l30 = last30.filter(h => h.result === '패').length;

  // 종족별 전적 (전체 기간)
  const raceAgg = { Z: { w: 0, l: 0 }, T: { w: 0, l: 0 }, P: { w: 0, l: 0 } };
  decided.forEach(h => {
    const oppP = (typeof players !== 'undefined' ? players : []).find(x => x.name === h.opp);
    const r = String(h.oppRace || (oppP && oppP.race) || '').toUpperCase();
    if (raceAgg[r]) {
      if (h.result === '승') raceAgg[r].w++; else raceAgg[r].l++;
    }
  });

  // 경기력 추세 스파크라인 (svg는 이 시점에 미리 문자열로 만들어 캐시해둔다)
  const trendSvg = _b2LcTrendSparkSvg(histAsc, _b2LcHoverTipIsLight());

  return { recent, w30, l30, raceAgg, trendSvg };
}

function _b2LcGetHoverStats(p) {
  const cache = (window._b2LcHoverStatCache || (window._b2LcHoverStatCache = {}));
  const key = String((p && p.name) || '');
  if (cache[key]) return cache[key];
  const stats = _b2LcComputeHoverStats(p);
  cache[key] = stats;
  return stats;
}

// 팝업이 밝은(연한) 배경인지 여부 — 다크모드가 아니면 대학색상의 연한 배경을 쓰므로 true
function _b2LcHoverTipIsLight() {
  try {
    return !(
      (document.body && document.body.classList && document.body.classList.contains('dark')) ||
      (document.documentElement && document.documentElement.classList && document.documentElement.classList.contains('dark'))
    );
  } catch(e) { return true; }
}

function _b2LineupShowHoverTip(card, name, col) {
  try {
    const p = (typeof players !== 'undefined' ? players : []).find(x => String((x && x.name) || '') === String(name || ''));
    if (!p) return;
    const { recent, w30, l30, raceAgg, trendSvg } = _b2LcGetHoverStats(p);

    let tip = document.getElementById('b2-lc-hovertip');
    if (!tip) { tip = document.createElement('div'); tip.id = 'b2-lc-hovertip'; document.body.appendChild(tip); }

    // 카드/대학 고유 색상(col)의 연한 버전을 팝업 배경으로 사용 — 라이트모드는 흰색에 가깝게,
    // 다크모드는 기존 남색 톤에 살짝 색을 섞는 정도로만 (가독성 유지)
    const _tipCol = col || '#64748b';
    const _tipIsLight = _b2LcHoverTipIsLight();
    const _tipBg = (typeof _b2PastelBg === 'function') ? _b2PastelBg(_tipCol, _tipIsLight ? 0.16 : 0.22) : (_tipIsLight ? '#fff' : 'rgba(15,23,42,.96)');
    tip.style.background = _tipBg;
    tip.style.borderColor = _tipIsLight ? `${_tipCol}3d` : 'transparent';
    tip.classList.toggle('light', _tipIsLight);

    const raceLetter = (p.race && p.race !== 'N') ? p.race : '?';
    // p.photo가 비어있어도 window.playerPhotos(레거시/클라우드 동기화 맵)에 사진이 있을 수 있음.
    // 다른 화면(현황판 카드, 랭킹, 미니게임 등)은 전부 이 폴백을 쓰는데 호버팝업만 빠져 있어서
    // "카드엔 사진이 보이는데 호버팝업엔 안 보이는" 현상이 발생했다.
    const photoRaw = String(p.photo || (window.playerPhotos && window.playerPhotos[p.name]) || '').trim();
    // [FIX-HOVERTIP-GIF-HOTLINK] (2026-08-17) GIF는 움직이는 걸 살리려고 프록시(images.weserv.nl)를
    // 건너뛰고 원본 URL을 직접 불러오게 해뒀는데, 그 원본이 핫링크 차단(Discord CDN 등)이 걸려있으면
    // 이 팝업에서만 로드가 실패해서 사진 대신 이니셜만 보였다. 다른 화면(getPlayerPhotoHTML)은 GIF든
    // 아니든 항상 프록시를 거치므로 그쪽에서는 정상적으로 보였던 것 — 동일하게 항상 프록시를 거치도록
    // 통일한다(애니메이션은 정지 이미지가 되지만, 최소한 사진 자체가 안 보이는 것보다 낫다).
    const photoUrl = photoRaw ? (typeof toThumbUrl === 'function' ? toThumbUrl(photoRaw, 184) : toHttpsUrl(photoRaw)) : '';
    const photo2Raw = String(p.secondProfileFile || '').trim();
    const photo2Url = photo2Raw ? (typeof toThumbUrl === 'function' ? toThumbUrl(photo2Raw, 184) : toHttpsUrl(photo2Raw)) : '';
    const hasPhoto2 = !!photo2Url;
    const _photoOrigAttr = photoRaw ? ` data-orig="${toHttpsUrl(photoRaw).replace(/"/g,'&quot;')}"` : '';
    // 썸네일 프록시가 실패하면(드물게 원본이 프록시가 처리 못 하는 포맷/크기인 경우) 원본 URL로
    // 한 번 더 시도해보고, 그마저 실패하면 그때 이니셜로 대체한다.
    const photoHtml = photoUrl
      ? `<img class="b2-lc-hovertip-photo${hasPhoto2 ? ' has2' : ''}" src="${photoUrl}"${_photoOrigAttr} loading="eager" decoding="async" onerror="if(this.dataset.orig&&this.src!==this.dataset.orig){this.src=this.dataset.orig;}else{this.style.display='none';this.nextElementSibling.style.display='flex';}"><div class="b2-lc-hovertip-fallback" style="display:none">${raceLetter}</div>`
      : `<div class="b2-lc-hovertip-fallback" style="position:static;display:flex;width:100%;height:100%">${raceLetter}</div>`;
    // 프로필 이미지2가 있으면 살짝 겹쳐서 자동 크로스페이드(라인업 카드 자체는 좌우 스크럽 방식이지만,
    // 팝업은 pointer-events:none이라 마우스 위치를 못 받으므로 자동 전환 애니메이션으로 대체)
    const photo2Html = hasPhoto2
      ? `<img class="b2-lc-hovertip-photo2" src="${photo2Url}" loading="eager" decoding="async" onerror="this.remove()">`
      : '';

    // ── 이름 / 티어 ──
    const tierCol = (p.tier && typeof getTierBtnColor === 'function') ? getTierBtnColor(p.tier) : '#64748b';
    const tierHtml = p.tier
      ? `<div class="b2-lc-hovertip-tier"><span class="b2-lc-hovertip-tier-dot" style="background:${tierCol}"></span>${_b2TierLabel(p.tier)}</div>`
      : `<div class="b2-lc-hovertip-tier">&nbsp;</div>`;

    // ── 최근 30일 성적 (도넛 게이지) ──
    const t30 = w30 + l30;
    const wr30 = t30 ? Math.round(w30 / t30 * 100) : 0;
    const _gaugeTrack = _tipIsLight ? 'rgba(15,23,42,.12)' : 'rgba(255,255,255,.16)';
    const gaugeGrad = t30
      ? `conic-gradient(#f87171 ${wr30 * 3.6}deg, ${_gaugeTrack} 0)`
      : _gaugeTrack;
    const _gaugeInnerBg = (typeof _b2PastelBg === 'function') ? _b2PastelBg(_tipCol, _tipIsLight ? 0.23 : 0.29) : '';
    const thirtyDayHtml = `<div class="b2-lc-hovertip-30d">
      <div class="b2-lc-hovertip-30d-gauge" style="background:${gaugeGrad}">
        <div class="b2-lc-hovertip-30d-gauge-inner"${_gaugeInnerBg ? ` style="background:${_gaugeInnerBg}"` : ''}>${t30 ? wr30 + '%' : '-'}</div>
      </div>
      <div class="b2-lc-hovertip-30d-text">최근 30일<br><span class="w">${w30}승</span> <span class="l">${l30}패</span></div>
    </div>`;

    // ── 종족별 전적 (전체 기간) ──
    const raceHasAny = Object.values(raceAgg).some(a => (a.w + a.l) > 0);
    const raceSectionHtml = raceHasAny
      ? `<div class="b2-lc-hovertip-section">
          <div class="b2-lc-hovertip-title" style="margin-bottom:5px">종족별 전적</div>
          ${_B2LC_RACE_META.map(([code, label, color]) => _b2LcRaceRowHtml(label, color, raceAgg[code].w, raceAgg[code].l)).join('')}
        </div>`
      : '';

    // ── 경기력 추세 ──
    const trendSectionHtml = trendSvg ? `<div class="b2-lc-hovertip-section">${trendSvg}</div>` : '';

    // ── 최근 5경기 ──
    let recentSectionHtml;
    if (!recent.length) {
      recentSectionHtml = `<div class="b2-lc-hovertip-section"><div class="b2-lc-hovertip-title">최근 전적</div><div class="b2-lc-hovertip-empty">아직 등록된 전적이 없습니다</div></div>`;
    } else {
      const dots = recent.map(h => `<span class="b2-lc-hovertip-dot ${h.result === '승' ? 'w' : 'l'}">${h.result === '승' ? 'W' : 'L'}</span>`).join('');
      const rows = recent.map(h => `
        <div class="b2-lc-hovertip-row">
          <span class="b2-lc-hovertip-res ${h.result === '승' ? 'w' : 'l'}">${h.result === '승' ? '승' : '패'}</span>
          <span class="b2-lc-hovertip-opp">vs ${h.opp || '-'}</span>
          <span class="b2-lc-hovertip-date">${h.date || ''}</span>
        </div>`).join('');
      recentSectionHtml = `<div class="b2-lc-hovertip-section"><div class="b2-lc-hovertip-title">최근 전적</div><div class="b2-lc-hovertip-dots">${dots}</div>${rows}</div>`;
    }

    tip.innerHTML = `<div class="b2-lc-hovertip-body">
      <div class="b2-lc-hovertip-top">
        <div class="b2-lc-hovertip-photowrap">${photoHtml}${photo2Html}</div>
        <div class="b2-lc-hovertip-content">
          <div class="b2-lc-hovertip-name">${p.name || ''}</div>
          ${tierHtml}
          ${thirtyDayHtml}
        </div>
      </div>
      ${raceSectionHtml}
      ${trendSectionHtml}
      ${recentSectionHtml}
    </div>`;

    const rect = card.getBoundingClientRect();
    tip.classList.add('on');
    const th = tip.offsetHeight, tw = tip.offsetWidth;
    let top = rect.top - th - 10;
    let below = false;
    if (top < 8) { top = rect.bottom + 10; below = true; }
    let left = rect.left + rect.width / 2 - tw / 2;
    left = Math.max(8, Math.min(left, window.innerWidth - tw - 8));
    tip.style.left = left + 'px';
    tip.style.top = top + 'px';
    tip.classList.toggle('below', below);
  } catch(e){}
}

var _b2LineupSpeaking = false;
var _b2LineupSpeakTarget = '';   // '' = 라인업 전체, 그 외 = 특정 스트리머 이름
// 지금 재생/일시정지 중인 세션이 "스트리머 프로필 이미지의 🔊 버튼(개별 듣기)"에서
// 시작됐는지 여부. 툴바의 "음성듣기" 버튼(전체 듣기용)과는 서로 다른 방식으로 동작해야
// 하므로, 이 값으로 두 진입점을 구분한다.
var _b2LineupSpeakViaCard = false;

// 닉네임 낭독용 정리 — 화면 표시(p.name)는 그대로 두고 "음성으로 읽을 때"만 사용한다.
// 1) 선수 정보에 pronounceAs(발음 표기)가 입력돼 있으면 그걸 최우선으로 사용
//    (영문/숫자 조합 닉네임이 TTS로 이상하게 읽히는 걸 관리자가 직접 교정할 수 있게 함)
// 2) 없으면 원래 이름에서 언더바/대시("_", "-")를 공백으로 바꾸고("언더바"로 안 읽히게),
//    이모지를 제거해서 최대한 자연스럽게 읽히도록 정리한다.
function _b2LineupSpeakName(p) {
  try {
    return (window.SUTTS && window.SUTTS.speakName) ? window.SUTTS.speakName(p) : ((p && p.name) || '이름 미상');
  } catch(e) { return (p && p.name) || '이름 미상'; }
}

// 개별(카드 🔊 버튼) 듣기에서만 덧붙이는 "종족별 전적" 낭독 문구.
// 팝업(_b2LineupShowHoverTip)과 같은 캐시(_b2LcGetHoverStats)를 그대로 재사용해서
// 계산을 중복하지 않고, 화면에 보이는 종족별 전적과 항상 같은 수치를 읽도록 한다.
// 기록이 있는 종족만 언급한다.
function _b2LineupRaceSpeakText(p) {
  try {
    const { raceAgg } = _b2LcGetHoverStats(p);
    const parts = _B2LC_RACE_META
      .filter(([code]) => (raceAgg[code].w + raceAgg[code].l) > 0)
      .map(([code, label]) => `${label}전 ${raceAgg[code].w}승 ${raceAgg[code].l}패`);
    return parts.length ? `종족별 전적은 ${parts.join(', ')}입니다.` : '';
  } catch(e) { return ''; }
}

// 화면 카드와 동일한 순서(임원 → 멤버)로 소개 문장을 만든다.
// onlyName 이 주어지면 해당 스트리머 한 명만 읽는다.
function _b2LineupBuildSpeakQueue(univName, onlyName) {
  const { members, roleMembers, rosterMembers } = _b2LineupMembers(univName);
  const raceLabel = (r) => ({ T:'테란', P:'프로토스', Z:'저그' }[r] || '');
  const describe = (p) => {
    const parts = [];
    if (p.tier) {
      const _tierKo = (window.SUTTS && window.SUTTS.tierLabel) ? window.SUTTS.tierLabel(p.tier) : p.tier;
      // _tierKo가 이미 "…티어"로 끝나면(매핑된 G/K/JA/J/S 결과이거나, '0티어'처럼 원래 값 자체에
      // "티어"가 붙어있는 경우) 뒤에 " 티어"를 또 붙이지 않는다 — "0티어 티어"처럼 중복 낭독되는 걸 방지.
      parts.push(/티어$/.test(_tierKo) ? _tierKo : `${_tierKo} 티어`);
    }
    parts.push(_b2LineupSpeakName(p));
    const rl = raceLabel(p.race);
    if (rl) parts.push(rl);
    const win = Number(p.win||0), loss = Number(p.loss||0);
    if (win + loss > 0) {
      const wr = Math.round(win/(win+loss)*100);
      parts.push(`${win}승 ${loss}패, 승률 ${wr}퍼센트`);
    } else {
      parts.push('아직 등록된 전적이 없습니다');
    }
    return parts.join(', ');
  };

  if (onlyName) {
    const p = members.find(x => String(x.name||'') === String(onlyName));
    if (!p) return [];
    // 프로필 이미지 🔊 버튼으로 개별 듣기를 할 때만 종족별 전적 + 한줄평(설정에 입력돼 있으면)을
    // 이어서 읽어준다 (라인업 전체 소개는 인원이 많아 장황해지므로 기존처럼 기본 소개만 유지).
    const raceText = _b2LineupRaceSpeakText(p);
    const oneLiner = _b2LineupOneLiner(p);
    const text = `${univName} ${p.role ? p.role + ', ' : ''}${describe(p)}${raceText ? ' ' + raceText : ''}${oneLiner ? ' ' + oneLiner : ''}`;
    return [{ text, player: p.name }];
  }

  const queue = [{ text: `${univName} 라인업 소개를 시작합니다. 총 ${members.length}명입니다.`, player: null }];
  if (roleMembers.length) {
    queue.push({ text: '먼저 임원진입니다.', player: null });
    roleMembers.forEach(p => {
      queue.push({ text: `${p.role ? p.role + ', ' : ''}${describe(p)}`, player: p.name });
    });
  }
  if (rosterMembers.length) {
    queue.push({ text: '다음은 멤버 라인업입니다.', player: null });
    rosterMembers.forEach(p => queue.push({ text: describe(p), player: p.name }));
  }
  queue.push({ text: '이상으로 라인업 소개를 마칩니다.', player: null });
  return queue;
}

function _b2PickKoVoice() {
  try {
    const voices = (window.speechSynthesis && window.speechSynthesis.getVoices()) || [];
    return voices.find(v => /^ko[-_]KR$/i.test(v.lang)) || voices.find(v => /^ko/i.test(v.lang)) || null;
  } catch(e) { return null; }
}

function _b2LineupClearHighlight() {
  try { document.querySelectorAll('.b2-lc-speaking').forEach(el => el.classList.remove('b2-lc-speaking')); } catch(e){}
}

function _b2LineupHighlightPlayer(name) {
  _b2LineupClearHighlight();
  if (!name) return;
  try {
    const esc = (window.CSS && CSS.escape) ? CSS.escape(name) : String(name).replace(/["\\]/g, '\\$&');
    const el = document.querySelector(`[data-b2lc-player="${esc}"]`);
    if (el) {
      const introActive = typeof _b2LineupIntroAnim !== 'undefined' && _b2LineupIntroAnim;
      if (introActive) _b2LineupRevealCard(el);
      el.classList.add('b2-lc-speaking');
      if (introActive) _b2LineupApplySpotlightDim(el);
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  } catch(e){}
}

// 지금 소개 중인 카드(activeEl)만 밝게 두고, 이미 등장 완료된 나머지 카드는 어둡게 죽인다.
// 아직 등장 전(opacity 0 상태)인 카드는 건드리지 않는다 — 어차피 안 보이고,
// 나중에 _b2LineupRevealCard로 처음 나타날 때 자연스럽게 밝은 상태로 시작해야 하므로.
function _b2LineupApplySpotlightDim(activeEl) {
  try {
    document.querySelectorAll('[data-b2lc-player]').forEach(el => {
      if (el.style.opacity === '0') return;
      if (el === activeEl) el.classList.remove('b2-lc-intro-dim');
      else el.classList.add('b2-lc-intro-dim');
    });
  } catch(e){}
}

function _b2LineupClearSpotlightDim() {
  try { document.querySelectorAll('.b2-lc-intro-dim').forEach(el => el.classList.remove('b2-lc-intro-dim')); } catch(e){}
}

/* ── "소개 연출" — 전체 음성듣기 재생 시 카드를 순서대로 fade+slide-in 시킨다.
   기존 인라인 transition을 el.dataset에 잠깐 백업했다가, 등장 애니메이션이 끝나면
   원래대로 복구해서 카드 hover 효과 등은 그대로 유지되게 한다. ── */
function _b2LineupPrepareIntroHide() {
  try {
    document.querySelectorAll('[data-b2lc-player]').forEach(el => {
      if (el.dataset.introOrigTransition === undefined) el.dataset.introOrigTransition = el.style.transition || '';
      el.classList.remove('b2-lc-intro-dim');
      const isRow = el.tagName === 'TR';
      // 오버슈트(back-out) 이징으로 팝! 하고 튀어나오는 느낌 — 표(tr)는 스케일/회전이
      // 어색해 보여서 기존처럼 슬라이드만, 카드형은 스케일+살짝 회전을 더해 임팩트를 준다.
      el.style.transition = 'opacity .5s cubic-bezier(.34,1.56,.64,1), transform .5s cubic-bezier(.34,1.56,.64,1), box-shadow .15s ease';
      el.style.opacity = '0';
      el.style.transform = isRow ? 'translateX(-16px)' : 'translateY(18px) scale(.82) rotate(-3deg)';
    });
  } catch(e){}
}

function _b2LineupRevealCard(el) {
  if (!el) return;
  try {
    el.style.opacity = '1';
    el.style.transform = '';
    const orig = el.dataset.introOrigTransition;
    setTimeout(() => {
      try {
        if (typeof orig === 'string') el.style.transition = orig;
        delete el.dataset.introOrigTransition;
      } catch(e){}
    }, 520);
  } catch(e){}
}

function _b2LineupRevealAllIntro() {
  try {
    document.querySelectorAll('[data-b2lc-player]').forEach(el => {
      if (el.style.opacity === '0') _b2LineupRevealCard(el);
    });
    _b2LineupClearSpotlightDim();
  } catch(e){}
}

/* ══════════════════════════════════════════════════════════════
   🎬 "소개 연출" 단독 재생 — 음성듣기와 완전히 분리.
   카드를 모두 숨긴 뒤, 순서대로 (1) 화면 중앙에 크게 팝업 → (2) 자기 자리로
   날아가 안착 하는 스타팅 라인업 발표 연출을 재생한다.
   실제 카드는 자리만 유지한 채 숨겨두고, 복제본(clone)을 fixed로 띄워
   FLIP 방식으로 이동시키므로 레이아웃이 흔들리지 않는다.
══════════════════════════════════════════════════════════════ */
var _b2LineupIntroPlaying = false;
var _b2LineupIntroPaused = false;
var _b2LineupIntroToken = 0;
var _b2LineupIntroHoverPause = false; // true면 "수동 정지"가 아니라 마우스 호버로 인한 자동 일시정지

// 지금 재생 중인 카드 이동 애니메이션들 (Web Animations API). 일시정지 버튼을 누르면
// 여기 담긴 Animation 객체를 실제로 .pause()/.play() 시켜서 "음성만 멎고 카드는 계속
// 날아가는" 어색한 상태 없이, 카드 이동 자체도 그 순간 그대로 멈추게 한다.
var _b2LineupActiveAnims = new Set();

// keyframes/options로 Web Animations API 애니메이션을 시작하고 추적 목록에 등록한다.
// 시작 시점에 이미 일시정지 상태면 곧바로 pause 시켜서 재생 중 일시정지를 눌렀다가
// 다음 카드로 넘어가는 경계에서도 자연스럽게 이어지도록 한다.
function _b2StartAnim(el, keyframes, options) {
  let anim = null;
  try { anim = el.animate(keyframes, options); } catch(e) { return null; }
  _b2LineupActiveAnims.add(anim);
  const cleanup = () => { _b2LineupActiveAnims.delete(anim); };
  try { anim.finished.then(cleanup, cleanup); } catch(e) { cleanup(); }
  if (_b2LineupIntroPaused) { try { anim.pause(); } catch(e){} }
  return anim;
}

// 애니메이션이 끝날 때까지 대기(취소돼도 조용히 통과). 일시정지 중이면 Animation 자체가
// 멈춰있으므로 finished 프라미스도 자연스럽게 재생 재개될 때까지 기다리게 된다.
async function _b2WaitAnim(anim) {
  if (!anim) return;
  try { await anim.finished; } catch(e) {}
}

/* ── 🎵 대학별 "소개연출" BGM — 대학 정보 수정 패널에서 등록한 유튜브 링크를
   소개연출 재생 중 배경음악으로 재생한다. 헤더의 전역 BGM 플레이어와는 완전히
   분리된 별도 인스턴스를 사용해 서로 간섭하지 않는다. ── */
var _b2LineupBgmPlayer = null;
var _b2LineupBgmReady = false;
var _b2LineupBgmApiLoading = false;
var _b2LineupBgmPendingVid = null;
var _b2LineupBgmVolume = 50;
var _b2LineupBgmActive = false;
var _b2LineupBgmKickTimer = null;
// (기능추가, 2026-08-14) 소개연출 중 TTS 음성이 BGM에 묻히는 문제 — TTS가 말하는 동안은
// BGM 볼륨을 일시적으로 낮춰(더킹) 음성이 더 잘 들리게 하고, 끝나면 원래 볼륨으로 복원한다.
var _b2LineupBgmDucked = false;
var _b2LineupBgmDuckRatio = 0.32; // 더킹 시 원래 볼륨의 32%까지만 재생

function _b2LineupBgmExtractId(urlOrId) {
  const s = String(urlOrId || '').trim();
  if (!s) return '';
  if (/^[a-zA-Z0-9_-]{8,15}$/.test(s) && !s.includes('/')) return s;
  const m1 = s.match(/[?&]v=([a-zA-Z0-9_-]{8,15})/); if (m1) return m1[1];
  const m2 = s.match(/youtu\.be\/([a-zA-Z0-9_-]{8,15})/); if (m2) return m2[1];
  const m3 = s.match(/\/shorts\/([a-zA-Z0-9_-]{8,15})/); if (m3) return m3[1];
  const m4 = s.match(/\/embed\/([a-zA-Z0-9_-]{8,15})/); if (m4) return m4[1];
  return '';
}

function _b2LineupBgmLoadApi() {
  return new Promise((resolve) => {
    if (window.YT && window.YT.Player) return resolve(true);
    const check = () => { if (window.YT && window.YT.Player) resolve(true); else setTimeout(check, 150); };
    if (!_b2LineupBgmApiLoading) {
      _b2LineupBgmApiLoading = true;
      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        tag.async = true;
        document.head.appendChild(tag);
      }
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = function () { try { prev && prev(); } catch (e) {} resolve(true); };
    }
    check();
  });
}

function _b2LineupBgmEnsurePlayer() {
  return _b2LineupBgmLoadApi().then(() => {
    if (_b2LineupBgmPlayer) return _b2LineupBgmPlayer;
    let host = document.getElementById('b2LineupBgmHost');
    if (!host) {
      host = document.createElement('div');
      host.id = 'b2LineupBgmHost';
      host.style.cssText = 'position:fixed;left:-9999px;top:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;z-index:-1';
      document.body.appendChild(host);
    }
    _b2LineupBgmPlayer = new YT.Player('b2LineupBgmHost', {
      width: '1', height: '1', videoId: '',
      playerVars: { autoplay: 0, controls: 0, disablekb: 1, fs: 0, iv_load_policy: 3, modestbranding: 1, playsinline: 1, rel: 0 },
      events: {
        onReady: () => {
          _b2LineupBgmReady = true;
          _b2LineupBgmApplyVol();
          if (_b2LineupBgmPendingVid) {
            const vid = _b2LineupBgmPendingVid;
            _b2LineupBgmPendingVid = null;
            _b2LineupBgmPlayNow(vid);
          }
        },
        onStateChange: (e) => {
          // 곡이 끝나면 처음부터 반복 재생 (소개연출이 곡보다 길 수 있으므로)
          if (e.data === 0) { try { _b2LineupBgmPlayer.seekTo(0); _b2LineupBgmPlayer.playVideo(); } catch (e2) {} }
        }
      }
    });
    return _b2LineupBgmPlayer;
  });
}

function _b2LineupBgmApplyVol() {
  if (!_b2LineupBgmPlayer) return;
  try {
    let v = Math.max(0, Math.min(100, parseInt(_b2LineupBgmVolume, 10) || 0));
    if (_b2LineupBgmDucked) v = Math.round(v * _b2LineupBgmDuckRatio);
    if (v <= 0) { _b2LineupBgmPlayer.mute && _b2LineupBgmPlayer.mute(); }
    else { _b2LineupBgmPlayer.unMute && _b2LineupBgmPlayer.unMute(); }
    _b2LineupBgmPlayer.setVolume(v);
  } catch (e) {}
}

// 더킹 on/off — 소개연출 재생 시작~종료 동안 켜둔다. 저장된 볼륨값(_b2LineupBgmVolume) 자체는
// 건드리지 않고, 실제 재생 볼륨에만 일시적으로 비율을 곱해 적용한다.
function _b2LineupBgmSetDucked(on) {
  on = !!on;
  if (_b2LineupBgmDucked === on) return;
  _b2LineupBgmDucked = on;
  _b2LineupBgmApplyVol();
}

// (버그픽스, 2026-08-14) 저장한 BGM이 재생되지 않던 문제.
// 유튜브 플레이어가 클릭 직후가 아니라 API 로드 이후에 비동기로 만들어지기 때문에
// 브라우저 자동재생 정책에 막혀 loadVideoById만으로는 소리가 나지 않는 경우가 있었다.
// → 음소거 상태로 먼저 재생을 시작하고, 실제로 재생이 시작되면 음소거를 풀고
//   저장된 볼륨을 적용한다. 재생이 안 잡히면 몇 번 더 playVideo를 시도한다.
function _b2LineupBgmPlayNow(vid) {
  const p = _b2LineupBgmPlayer;
  if (!p || !vid) return;
  try {
    if (p.mute) p.mute();
    p.loadVideoById(vid);
    if (p.playVideo) p.playVideo();
  } catch (e) {}
  if (_b2LineupBgmKickTimer) { clearInterval(_b2LineupBgmKickTimer); _b2LineupBgmKickTimer = null; }
  let tries = 0;
  _b2LineupBgmKickTimer = setInterval(() => {
    if (!_b2LineupBgmActive || !_b2LineupBgmPlayer) {
      clearInterval(_b2LineupBgmKickTimer); _b2LineupBgmKickTimer = null; return;
    }
    let st = -1;
    try { st = _b2LineupBgmPlayer.getPlayerState(); } catch (e) {}
    if (st === 1) {
      _b2LineupBgmApplyVol();
      clearInterval(_b2LineupBgmKickTimer); _b2LineupBgmKickTimer = null; return;
    }
    if (++tries > 20) { clearInterval(_b2LineupBgmKickTimer); _b2LineupBgmKickTimer = null; return; }
    try { _b2LineupBgmPlayer.playVideo(); } catch (e) {}
  }, 300);
}

// "소개연출" 재생 시작 시 호출 — 현재 대학에 등록된 BGM 링크가 있으면 함께 재생한다.
function _b2LineupBgmStart(univName) {
  try {
    const list = (typeof univCfg !== 'undefined') ? univCfg : [];
    const u = list.find(x => x.name === univName);
    const vid = u ? _b2LineupBgmExtractId(u.bgmUrl) : '';
    _b2LineupBgmActive = false;
    if (!vid) { _b2LineupBgmSyncControls(); return; }
    _b2LineupBgmVolume = Number.isFinite(parseInt(u.bgmVolume, 10)) ? Math.max(0, Math.min(100, parseInt(u.bgmVolume, 10))) : 50;
    _b2LineupBgmActive = true;
    _b2LineupBgmEnsurePlayer().then(() => {
      if (!_b2LineupBgmActive) return; // 그 사이 정지된 경우 무시
      if (_b2LineupBgmReady) { _b2LineupBgmPlayNow(vid); }
      else { _b2LineupBgmPendingVid = vid; }
    });
    _b2LineupBgmSyncControls();
  } catch (e) {}
}

function _b2LineupBgmSetPaused(paused) {
  if (!_b2LineupBgmActive || !_b2LineupBgmPlayer) return;
  if (paused && _b2LineupBgmKickTimer) { clearInterval(_b2LineupBgmKickTimer); _b2LineupBgmKickTimer = null; }
  try { if (paused) _b2LineupBgmPlayer.pauseVideo(); else _b2LineupBgmPlayer.playVideo(); } catch (e) {}
}

function _b2LineupBgmStop() {
  _b2LineupBgmActive = false;
  _b2LineupBgmPendingVid = null;
  _b2LineupBgmDucked = false;
  if (_b2LineupBgmKickTimer) { clearInterval(_b2LineupBgmKickTimer); _b2LineupBgmKickTimer = null; }
  try { if (_b2LineupBgmPlayer) _b2LineupBgmPlayer.stopVideo(); } catch (e) {}
  _b2LineupBgmSyncControls();
}

// 오버레이 컨트롤의 볼륨 슬라이더 조작 시 호출 — 즉시 반영하고, 다음 재생을 위해
// 해당 대학 설정에도 저장해둔다.
function _b2LineupBgmSetVolume(v) {
  _b2LineupBgmVolume = Math.max(0, Math.min(100, parseInt(v, 10) || 0));
  _b2LineupBgmApplyVol();
  try {
    const univName = (typeof _b2LineupUniv !== 'undefined') ? _b2LineupUniv : '';
    const list = (typeof univCfg !== 'undefined') ? univCfg : [];
    const u = list.find(x => x.name === univName);
    if (u && u.bgmUrl) { u.bgmVolume = _b2LineupBgmVolume; try { if (typeof save === 'function') save(); } catch (e) {} }
  } catch (e) {}
}

function _b2LineupBgmSyncControls() {
  const wrap = document.getElementById('b2-lc-intro-bgm-vol-wrap');
  if (wrap) wrap.style.display = _b2LineupBgmActive ? 'flex' : 'none';
  const sl = document.getElementById('b2-lc-intro-bgm-vol');
  if (sl) sl.value = _b2LineupBgmVolume;
}

try {
  window._b2LineupBgmSetVolume = _b2LineupBgmSetVolume;
  // 대학 정보 수정에서 BGM 링크/볼륨을 저장했을 때 호출되는 훅. 현재 재생 중인 세션에는
  // 영향을 주지 않고, 다음 소개연출 재생부터 새 설정이 적용된다.
  window._b2LineupBgmSettingsChanged = function () {};
} catch (e) {}

/* ── 🔊 "소개연출" 효과음 — 별도 음원 파일 없이 Web Audio API로 짧은 톤을 그때그때
   합성해서 재생한다. TTS 음성과는 별개의 채널이라 서로 방해하지 않는다. ── */
var _b2IntroSFXCtx = null;
// 지금 울리고 있는 오실레이터들을 추적한다. 일시정지를 누르면 여기 담긴 소리를 즉시
// 끊어서, 화면은 멈췄는데 효과음만 계속 흘러나오는 이상한 상태를 막는다.
var _b2IntroSFXActiveNodes = [];
function _b2IntroSFXStopAll() {
  const nodes = _b2IntroSFXActiveNodes.splice(0);
  nodes.forEach(({ osc, gain, ctx }) => {
    try {
      const now = ctx.currentTime;
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(gain.gain.value, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.03);
      osc.stop(now + 0.04);
    } catch (e) {}
  });
}
function _b2IntroSFXGetCtx() {
  try {
    if (!_b2IntroSFXCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      _b2IntroSFXCtx = new AC();
    }
    if (_b2IntroSFXCtx.state === 'suspended') _b2IntroSFXCtx.resume();
    return _b2IntroSFXCtx;
  } catch(e) { return null; }
}
function _b2IntroSFXMuted() {
  try { return localStorage.getItem('su_b2_intro_sfx_muted') === '1'; } catch(e) { return false; }
}
function _b2IntroSFXToggleMute() {
  try { localStorage.setItem('su_b2_intro_sfx_muted', _b2IntroSFXMuted() ? '0' : '1'); } catch(e){}
  const btn = document.getElementById('b2-lc-intro-mute-btn');
  if (btn) btn.innerHTML = _b2IntroSFXMuted() ? '🔇' : '🔊';
}
// 간단한 tone 하나: freq(Hz), 시작 시각 offset(초), 길이(초), 파형, 최대 볼륨
function _b2IntroSFXTone(ctx, freq, startAt, dur, type, peak) {
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, startAt);
    gain.gain.setValueAtTime(0, startAt);
    gain.gain.linearRampToValueAtTime(peak != null ? peak : 0.12, startAt + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, startAt + dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start(startAt);
    osc.stop(startAt + dur + 0.02);
    const entry = { osc, gain, ctx };
    _b2IntroSFXActiveNodes.push(entry);
    const drop = () => { const i = _b2IntroSFXActiveNodes.indexOf(entry); if (i >= 0) _b2IntroSFXActiveNodes.splice(i, 1); };
    try { osc.onended = drop; } catch(e) { setTimeout(drop, (dur + 0.05) * 1000); }
  } catch(e){}
}
// 카드가 중앙으로 날아오를 때 "슉" 스윕음 (주파수를 짧게 쓸어올림)
function _b2IntroSFXWhoosh() {
  if (_b2IntroSFXMuted()) return;
  const ctx = _b2IntroSFXGetCtx();
  if (!ctx) return;
  try {
    const t0 = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, t0);
    osc.frequency.exponentialRampToValueAtTime(720, t0 + 0.32);
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(0.09, t0 + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.4);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + 0.42);
    const entry = { osc, gain, ctx };
    _b2IntroSFXActiveNodes.push(entry);
    const drop = () => { const i = _b2IntroSFXActiveNodes.indexOf(entry); if (i >= 0) _b2IntroSFXActiveNodes.splice(i, 1); };
    try { osc.onended = drop; } catch(e) { setTimeout(drop, 470); }
  } catch(e){}
}
// 착지 순간 짧은 chime — 티어 색상이 밝을수록(고티어) 화음을 더 풍성하게 쌓아준다.
function _b2IntroSFXChime(glowColor) {
  if (_b2IntroSFXMuted()) return;
  const ctx = _b2IntroSFXGetCtx();
  if (!ctx) return;
  const t0 = ctx.currentTime;
  // 기본 2음(3도) + 임의로 5도까지 살짝 더해 화려함 차등 (색상별로 결정적이진 않지만
  // 매번 똑같지 않게 살짝의 변주를 준다)
  _b2IntroSFXTone(ctx, 880, t0, 0.5, 'triangle', 0.11);
  _b2IntroSFXTone(ctx, 1108, t0 + 0.03, 0.5, 'triangle', 0.09);
  _b2IntroSFXTone(ctx, 1320, t0 + 0.06, 0.55, 'sine', 0.07);
}
// 라인업 소개 시작할 때 한 번, 짧은 팡파레(오르는 아르페지오)
function _b2IntroSFXFanfare() {
  if (_b2IntroSFXMuted()) return;
  const ctx = _b2IntroSFXGetCtx();
  if (!ctx) return;
  const t0 = ctx.currentTime;
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
    _b2IntroSFXTone(ctx, f, t0 + i * 0.09, 0.35, 'triangle', 0.1);
  });
}
// 카운트다운 숫자가 뜰 때마다 짧은 비프음 (마지막 "시작!"만 더 높고 길게)
function _b2IntroSFXCountdownBeep(isFinal) {
  if (_b2IntroSFXMuted()) return;
  const ctx = _b2IntroSFXGetCtx();
  if (!ctx) return;
  const t0 = ctx.currentTime;
  _b2IntroSFXTone(ctx, isFinal ? 1046.5 : 660, t0, isFinal ? 0.32 : 0.16, 'triangle', isFinal ? 0.16 : 0.11);
}
try {
  window._b2IntroSFXToggleMute = _b2IntroSFXToggleMute;
} catch(e){}

// 소개 시작 직전 "3・2・1・시작!" 카운트다운. 정지/일시정지 토큰을 그대로 존중한다.
async function _b2IntroCountdown(token) {
  try {
    let cd = document.getElementById('b2-lc-intro-countdown');
    if (!cd) { cd = document.createElement('div'); cd.id = 'b2-lc-intro-countdown'; document.body.appendChild(cd); }
    const steps = ['3', '2', '1', '시작!'];
    for (const s of steps) {
      if (token !== _b2LineupIntroToken) return false;
      if (!(await _b2IntroWaitIfPaused(token))) return false;
      cd.textContent = s;
      cd.classList.remove('go');
      void cd.offsetWidth;
      cd.classList.add('go');
      _b2IntroSFXCountdownBeep(s === '시작!');
      if (!(await _b2IntroWait(560, token))) return false;
    }
    return token === _b2LineupIntroToken;
  } catch(e) { return true; }
  finally { try { const cd = document.getElementById('b2-lc-intro-countdown'); if (cd) cd.remove(); } catch(e){} }
}

// 최상위 티어/에이스 등장 시 화면을 짧게 흔든다
function _b2IntroScreenShake() {
  try {
    const bd = document.getElementById('b2-lc-intro-backdrop');
    if (!bd) return;
    bd.classList.remove('b2-lc-intro-shake');
    void bd.offsetWidth;
    bd.classList.add('b2-lc-intro-shake');
    setTimeout(() => { try { bd.classList.remove('b2-lc-intro-shake'); } catch(e){} }, 520);
  } catch(e){}
}

// 라인업의 마지막(에이스) 카드가 등장할 때 화면 전체 화이트 플래시 + 추가 팡파레
function _b2IntroAceFlash() {
  try {
    const el = document.getElementById('b2-lc-intro-flash');
    if (el) { el.classList.remove('hit'); void el.offsetWidth; el.classList.add('hit'); }
  } catch(e){}
  _b2IntroSFXFanfare();
}

// TIERS 배열에서의 순번(0=최상위)을 반환. 몰라도 조용히 -1.
function _b2IntroTierRank(tier) {
  try {
    return (typeof TIERS !== 'undefined' && Array.isArray(TIERS)) ? TIERS.indexOf(tier) : -1;
  } catch(e) { return -1; }
}

function _b2LineupIntroSetPaused(paused) {
  _b2LineupIntroPaused = paused;
  try {
    if (paused) {
      if (window.SUTTS && window.SUTTS.isSpeaking && window.SUTTS.isSpeaking()) window.SUTTS.pause();
      // 지금 날아가는 중인 카드가 있으면 그 자리에서 진짜로 멈춘다 (기존엔 TTS만 멎고
      // 카드 이동 CSS 트랜지션은 끝까지 재생돼버리는 문제가 있었음).
      _b2LineupActiveAnims.forEach(a => { try { a.pause(); } catch(e){} });
      // 이미 울리기 시작한 효과음(슉/챠임 등)도 즉시 끊는다 — 화면은 멈췄는데 소리만
      // 계속 흘러나오던 문제 개선.
      _b2IntroSFXStopAll();
    } else {
      if (window.SUTTS && window.SUTTS.isPaused && window.SUTTS.isPaused()) window.SUTTS.resume();
      _b2LineupActiveAnims.forEach(a => { try { a.play(); } catch(e){} });
    }
    _b2LineupBgmSetPaused(paused);
  } catch(e){}
  _b2LineupIntroBtnLabel();
}

function _b2LineupIntroBtnLabel() {
  const btn = document.getElementById('b2-lineup-intro-btn');
  if (btn) btn.innerHTML = !_b2LineupIntroPlaying ? '▶ 재생' : (_b2LineupIntroPaused ? '▶ 이어보기' : '⏸ 일시정지');
  // 재생 중일 때만 별도의 "정지" 버튼을 보여준다 (일시정지/이어보기와는 별개 동작).
  const stopBtn = document.getElementById('b2-lineup-intro-stop-btn');
  if (stopBtn) stopBtn.style.display = _b2LineupIntroPlaying ? 'flex' : 'none';
  // 화면 중앙 오버레이(한줄평 자막 아래)의 일시정지/완전정지 버튼도 같이 갱신한다.
  const pauseBtn = document.getElementById('b2-lc-intro-pause-btn');
  if (pauseBtn) pauseBtn.innerHTML = _b2LineupIntroPaused ? '▶ 이어보기' : '⏸ 일시정지';
}

// ms만큼 대기하되, 중간에 일시정지 상태면 재생될 때까지 대기를 멈춰둔다.
// (80ms 단위로 잘게 쪼개서 진행하므로 일시정지 시점에서 거의 그대로 이어짐)
function _b2IntroWait(ms, token) {
  return new Promise(async (res) => {
    let remaining = ms;
    while (remaining > 0) {
      if (token !== _b2LineupIntroToken) return res(false);
      if (_b2LineupIntroPaused) { await new Promise(r => setTimeout(r, 120)); continue; }
      const step = Math.min(80, remaining);
      await new Promise(r => setTimeout(r, step));
      remaining -= step;
    }
    res(token === _b2LineupIntroToken);
  });
}

// 일시정지 상태면 재생 재개될 때까지 대기 (토큰이 바뀌면 = 완전 정지된 것이므로 즉시 빠져나옴)
function _b2IntroWaitIfPaused(token) {
  return new Promise(async (res) => {
    while (_b2LineupIntroPaused && token === _b2LineupIntroToken) { await new Promise(r => setTimeout(r, 120)); }
    res(token === _b2LineupIntroToken);
  });
}

/* ── 무대 장치(암전 배경 / 스포트라이트 빔 / 이름 자막) ── */
function _b2IntroStageOn() {
  try {
    // 소개연출 재생 중에는 카드별 "개별 듣기(🔊)" 버튼을 숨긴다 — 전체 연출 진행 중에
    // 개별 버튼을 눌러 다른 오디오 흐름이 겹치면 혼란스러우므로.
    document.body.classList.add('b2-lc-intro-active');
    let bd = document.getElementById('b2-lc-intro-backdrop');
    if (!bd) {
      bd = document.createElement('div');
      bd.id = 'b2-lc-intro-backdrop';
      document.body.appendChild(bd);
    }
    let beam = document.getElementById('b2-lc-intro-beam');
    if (!beam) { beam = document.createElement('div'); beam.id = 'b2-lc-intro-beam'; document.body.appendChild(beam); }
    // [FEATURE-CINEMATIC] 레터박스/비네트 — 설정에서 꺼둔 경우 생성하지 않는다.
    const _cineOn = (typeof window._b2CinemaModeOn === 'function') ? window._b2CinemaModeOn() : true;
    let lbTop = null, lbBot = null, vig = null;
    if (_cineOn) {
      lbTop = document.getElementById('b2-lc-intro-letterbox-top');
      if (!lbTop) { lbTop = document.createElement('div'); lbTop.id = 'b2-lc-intro-letterbox-top'; document.body.appendChild(lbTop); }
      lbBot = document.getElementById('b2-lc-intro-letterbox-bottom');
      if (!lbBot) { lbBot = document.createElement('div'); lbBot.id = 'b2-lc-intro-letterbox-bottom'; document.body.appendChild(lbBot); }
      vig = document.getElementById('b2-lc-intro-vignette');
      if (!vig) { vig = document.createElement('div'); vig.id = 'b2-lc-intro-vignette'; document.body.appendChild(vig); }
    }
    let cap = document.getElementById('b2-lc-intro-caption');
    if (!cap) { cap = document.createElement('div'); cap.id = 'b2-lc-intro-caption'; document.body.appendChild(cap); }
    let subcap = document.getElementById('b2-lc-intro-subcap');
    if (!subcap) { subcap = document.createElement('div'); subcap.id = 'b2-lc-intro-subcap'; document.body.appendChild(subcap); }
    let ctrl = document.getElementById('b2-lc-intro-controls');
    if (!ctrl) {
      ctrl = document.createElement('div');
      ctrl.id = 'b2-lc-intro-controls';
      ctrl.innerHTML =
        '<button type="button" id="b2-lc-intro-pause-btn" onclick="_b2LineupPlayIntroShow()">⏸ 일시정지</button>' +
        '<button type="button" id="b2-lc-intro-stopstage-btn" onclick="_b2LineupStopIntroShow()">⏹ 완전정지</button>' +
        `<button type="button" id="b2-lc-intro-mute-btn" title="효과음 켜기/끄기" onclick="_b2IntroSFXToggleMute()">${_b2IntroSFXMuted() ? '🔇' : '🔊'}</button>` +
        `<span id="b2-lc-intro-bgm-vol-wrap" style="display:${_b2LineupBgmActive ? 'flex' : 'none'};align-items:center;gap:6px;padding:0 4px 0 2px">` +
          `<span style="font-size:12px">🎵</span>` +
          `<input type="range" id="b2-lc-intro-bgm-vol" min="0" max="100" step="5" value="${_b2LineupBgmVolume}" style="width:70px;accent-color:#60a5fa;cursor:pointer" oninput="_b2LineupBgmSetVolume(this.value)" title="BGM 볼륨">` +
        '</span>';
      document.body.appendChild(ctrl);
    }
    let ptrack = document.getElementById('b2-lc-intro-progress-track');
    if (!ptrack) {
      ptrack = document.createElement('div');
      ptrack.id = 'b2-lc-intro-progress-track';
      ptrack.innerHTML = '<div id="b2-lc-intro-progress-bar"></div>';
      document.body.appendChild(ptrack);
    }
    if (!document.getElementById('b2-lc-intro-flash')) {
      const flash = document.createElement('div');
      flash.id = 'b2-lc-intro-flash';
      document.body.appendChild(flash);
    }
    requestAnimationFrame(() => {
      bd.classList.add('on'); beam.classList.add('on'); ctrl.classList.add('on'); ptrack.classList.add('on');
      if (lbTop) lbTop.classList.add('on');
      if (lbBot) lbBot.classList.add('on');
      if (vig) vig.classList.add('on');
    });
    _b2IntroParticlesStart();
  } catch(e){}
}

// 배경에 은은하게 떠다니는 먼지/별 파티클 — 무대 켜져 있는 동안 계속 생성된다.
var _b2IntroParticleTimer = null;
function _b2IntroParticlesStart() {
  try {
    let layer = document.getElementById('b2-lc-intro-particles');
    if (!layer) { layer = document.createElement('div'); layer.id = 'b2-lc-intro-particles'; document.body.appendChild(layer); }
    requestAnimationFrame(() => layer.classList.add('on'));
    const spawn = () => {
      const l = document.getElementById('b2-lc-intro-particles');
      if (!l) return;
      const p = document.createElement('div');
      p.className = 'b2-lc-ambient-p';
      const size = 2 + Math.random() * 3;
      p.style.width = size + 'px';
      p.style.height = size + 'px';
      p.style.left = (Math.random() * 100) + 'vw';
      const dur = 6 + Math.random() * 6;
      p.style.animationDuration = dur + 's';
      p.style.setProperty('--drift', (Math.random() * 60 - 30) + 'px');
      l.appendChild(p);
      setTimeout(() => { try { p.remove(); } catch(e){} }, dur * 1000 + 200);
    };
    for (let i = 0; i < 10; i++) setTimeout(spawn, i * 150);
    if (_b2IntroParticleTimer) clearInterval(_b2IntroParticleTimer);
    _b2IntroParticleTimer = setInterval(spawn, 450);
  } catch(e){}
}
function _b2IntroParticlesStop() {
  try {
    if (_b2IntroParticleTimer) { clearInterval(_b2IntroParticleTimer); _b2IntroParticleTimer = null; }
    const layer = document.getElementById('b2-lc-intro-particles');
    if (layer) { layer.classList.remove('on'); setTimeout(() => { try { layer.remove(); } catch(e){} }, 650); }
  } catch(e){}
}

function _b2IntroStageOff() {
  try { document.body.classList.remove('b2-lc-intro-active'); } catch(e){}
  try {
    ['b2-lc-intro-backdrop','b2-lc-intro-beam','b2-lc-intro-caption','b2-lc-intro-subcap','b2-lc-intro-controls','b2-lc-intro-progress-track','b2-lc-intro-elobadge','b2-lc-intro-letterbox-top','b2-lc-intro-letterbox-bottom','b2-lc-intro-vignette'].forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      el.classList.remove('on');
      setTimeout(() => { try { el.remove(); } catch(e){} }, 500);
    });
  } catch(e){}
  try { const fl = document.getElementById('b2-lc-intro-flash'); if (fl) fl.remove(); } catch(e){}
  try { const cd = document.getElementById('b2-lc-intro-countdown'); if (cd) cd.remove(); } catch(e){}
  _b2IntroParticlesStop();
  _b2LineupBgmSetDucked(false);
  _b2LineupBgmStop();
}

// 상단 진행도 바 갱신: current(1-based) / total
function _b2IntroProgressUpdate(current, total) {
  try {
    const bar = document.getElementById('b2-lc-intro-progress-bar');
    if (!bar) return;
    const pct = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;
    bar.style.width = pct + '%';
  } catch(e){}
}

function _b2IntroCaption(text) {
  try {
    const cap = document.getElementById('b2-lc-intro-caption');
    if (!cap) return;
    if (!text) { cap.classList.remove('on'); return; }
    cap.textContent = text;
    cap.classList.add('on');
  } catch(e){}
}

// 이름 자막 아래에 표시되는 짧은 "한줄평" 자막
function _b2IntroSubCaption(text) {
  try {
    const sc = document.getElementById('b2-lc-intro-subcap');
    if (!sc) return;
    if (!text) { sc.classList.remove('on'); return; }
    sc.textContent = text;
    sc.classList.add('on');
  } catch(e){}
}

// 한줄평 자막을 타자기처럼 한 글자씩 채워 보여준다 (음성 재생과 동시에 진행되도록 await하지 않고 호출).
// 새로 호출될 때마다 세대(gen)를 증가시켜, 이전 카드의 타이핑 타이머가 새 카드 자막을 덮어쓰지 않게 한다.
var _b2IntroSubCapGen = 0;
function _b2IntroSubCaptionType(text, token) {
  const gen = ++_b2IntroSubCapGen;
  try {
    const sc = document.getElementById('b2-lc-intro-subcap');
    if (!sc) return;
    if (!text) { sc.classList.remove('on', 'typing'); sc.textContent = ''; return; }
    sc.textContent = '';
    sc.classList.add('on', 'typing');
    let i = 0;
    const step = () => {
      if (gen !== _b2IntroSubCapGen || token !== _b2LineupIntroToken) return;
      if (_b2LineupIntroPaused) { setTimeout(step, 120); return; }
      i++;
      sc.textContent = text.slice(0, i);
      if (i < text.length) setTimeout(step, 32);
      else sc.classList.remove('typing');
    };
    step();
  } catch(e){}
}

// "한줄평" — 스트리머 정보수정에서 직접 입력한 값만 사용한다.
// (자동 생성 문구는 쓰지 않으며, 입력이 없으면 자막/음성 모두 생략)
function _b2LineupOneLiner(p) {
  try { return String((p && (p.oneLiner || p.oneline)) || '').trim(); } catch(e) { return ''; }
}

// 착지 순간 사방으로 튀는 반짝이 파티클 (color: 해당 선수 티어 색상, race: 종족별 파티클 모양/개수 차등)
function _b2IntroSparkBurst(rect, color, race, boost) {
  try {
    if (!rect) return;
    const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
    // 종족별 연출 차등: 저그(유기체 느낌, 많고 작게) / 테란(금속 파편, 적고 각지게) / 프로토스(사이오닉, 파티클 대신 링 위주)
    // boost: 최상위 티어/에이스 카드일 때 파티클 수를 더 늘려서 화려하게(기본 1, 클라이맥스 1.8)
    const n = Math.round((race === 'Z' ? 16 : (race === 'T' ? 8 : 10)) * (boost || 1));
    const raceCls = race === 'Z' ? ' race-z' : (race === 'T' ? ' race-t' : (race === 'P' ? ' race-p' : ''));
    for (let i = 0; i < n; i++) {
      const ang = (Math.PI * 2 * i / n) + (Math.random() * 0.4 - 0.2);
      const dist = (race === 'Z' ? 34 : 46) + Math.random() * 34;
      const sx = Math.cos(ang) * dist, sy = Math.sin(ang) * dist;
      const sp = document.createElement('div');
      sp.className = 'b2-lc-intro-spark' + raceCls;
      sp.style.setProperty('--sx', `${sx}px`);
      sp.style.setProperty('--sy', `${sy}px`);
      sp.style.setProperty('--intro-glow', color || '#60a5fa');
      sp.style.left = `${cx}px`;
      sp.style.top = `${cy}px`;
      document.body.appendChild(sp);
      setTimeout(() => { try { sp.remove(); } catch(e){} }, 700);
    }
    // 프로토스: 파티클 대신(+함께) 확장되는 사이오닉 링을 하나 더 띄운다.
    if (race === 'P') {
      const ring = document.createElement('div');
      ring.className = 'b2-lc-intro-psiring';
      ring.style.setProperty('--intro-glow', color || '#a78bfa');
      ring.style.left = `${cx}px`;
      ring.style.top = `${cy}px`;
      document.body.appendChild(ring);
      setTimeout(() => { try { ring.remove(); } catch(e){} }, 900);
    }
  } catch(e){}
}

// 최근 ELO 변동(최근 30일 누적) — history[].eloDelta 합산. 데이터/함수가 없으면 조용히 스킵.
function _b2IntroEloDelta(p) {
  try {
    if (!p || p.elo == null || typeof _statsAllHist !== 'function') return null;
    const hist = _statsAllHist(p) || [];
    const now = new Date();
    const from = new Date(now.getTime() - 30 * 24 * 3600 * 1000);
    const fromStr = from.toISOString().slice(0, 10);
    const delta = hist.filter(h => h && h.date && h.date >= fromStr && h.eloDelta != null)
      .reduce((s, h) => s + (Number(h.eloDelta) || 0), 0);
    return { elo: Number(p.elo), delta };
  } catch(e) { return null; }
}

// ELO 배지 표시 (이름 자막 위쪽에 짧게 붙는다). info: {elo, delta}
function _b2IntroEloBadge(info) {
  try {
    let b = document.getElementById('b2-lc-intro-elobadge');
    if (!info) { if (b) b.classList.remove('on'); return; }
    if (!b) {
      b = document.createElement('div');
      b.id = 'b2-lc-intro-elobadge';
      document.body.appendChild(b);
    }
    const d = info.delta || 0;
    const sign = d > 0 ? '+' : '';
    const dHtml = d !== 0
      ? ` <span style="color:${d > 0 ? '#4ade80' : '#f87171'}">(${sign}${d})</span>`
      : '';
    b.innerHTML = `ELO ${info.elo}${dHtml}`;
    b.classList.add('on');
  } catch(e){}
}

// 한 문장을 읽고, 다 읽으면 resolve. (연출이 중단되면 false)
async function _b2IntroSpeak(text, token) {
  if (!(await _b2IntroWaitIfPaused(token))) return false;
  return new Promise(res => {
    if (!text || !window.SUTTS || !('speechSynthesis' in window)) return res(token === _b2LineupIntroToken);
    let done = false;
    const fin = () => { if (done) return; done = true; res(token === _b2LineupIntroToken); };
    let ok = false;
    try { ok = window.SUTTS.speak([{ text: text }], { onEnd: fin }); } catch(e) { ok = false; }
    if (!ok) fin();
  });
}

// 카드 하나: 중앙에 크게 등장(플립+광택) → 소개 음성 → 자기 자리로 이동 → 착지 파장
// glowColor: 해당 선수의 티어 색상 — 발광 펄스/파장/스파클 색을 선수마다 다르게 보여준다.
// opts: { climax: 최상위 티어라 화면 흔들림+확대 스파클을 넣을지, isAce: 라인업 마지막 카드(에이스)라 화이트 플래시+추가 팡파레를 넣을지 }
function _b2LineupIntroFlyCard(el, token, speakText, glowColor, race, opts) {
  return new Promise(async (resolve) => {
    try {
      if (!el || el.tagName === 'TR') {
        _b2LineupRevealCard(el);
        if (speakText) await _b2IntroSpeak(speakText, token);
        return resolve();
      }
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      await _b2IntroWait(280, token);
      if (token !== _b2LineupIntroToken) return resolve();

      const r = el.getBoundingClientRect();
      const clone = el.cloneNode(true);
      clone.removeAttribute('id');
      clone.querySelectorAll('[id]').forEach(n => n.removeAttribute('id'));
      clone.classList.remove('b2-lc-intro-dim');
      clone.classList.add('b2-lc-intro-clone');
      clone.style.setProperty('--intro-glow', glowColor || '#60a5fa');
      // "프로필 사진을 더 크게" — 통계형(stat) 카드는 사진 아래 승/패 그리드가 카드 높이의
      // 상당 부분을 차지해서, 인트로에서만큼은 그 그리드를 숨기고 사진 영역을 카드 전체로
      // 채워서 인물이 화면을 압도하도록 한다. (기본형 카드는 이미 사진이 카드 전체를 채움)
      try {
        const grid = clone.querySelector('.b2-lc3-grid');
        const photoBox = clone.querySelector('.b2-lc3-photo');
        if (grid) grid.style.display = 'none';
        if (photoBox) { photoBox.style.aspectRatio = 'auto'; photoBox.style.height = '100%'; }
      } catch(e){}
      const cx = (window.innerWidth / 2) - (r.left + r.width / 2);
      const cy = (window.innerHeight / 2) - (r.top + r.height / 2);
      // 화면을 더 넉넉하게 채우도록 확대 비율/최대치 상향 (기존 1.3~2.2배 → 1.6~2.8배)
      const scale = Math.max(1.6, Math.min(2.8,
        Math.min((window.innerHeight * 0.74) / Math.max(1, r.height),
                 (window.innerWidth * 0.92) / Math.max(1, r.width))));
      clone.style.cssText += `position:fixed;left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;margin:0;z-index:9998;pointer-events:none;opacity:0;transform-style:preserve-3d;perspective:900px;filter:drop-shadow(0 24px 60px rgba(15,23,42,.45))`;
      document.body.appendChild(clone);

      // 광택 스윕 오버레이 (복제 카드 위치에 맞춰 얹는다)
      const shine = document.createElement('div');
      shine.className = 'b2-lc-intro-shine';
      const sw = r.width * scale, sh = r.height * scale;
      shine.style.cssText = `left:${(window.innerWidth - sw) / 2}px;top:${(window.innerHeight - sh) / 2}px;width:${sw}px;height:${sh}px`;

      // 등장: Web Animations API로 재생해서 일시정지 버튼을 누르면 카드 이동도
      // 그 순간 진짜로 멈추게 한다 (기존 CSS transition은 pause 불가능했음).
      _b2IntroSFXWhoosh();
      // [FEATURE-CINEMATIC] 시네마틱 모드일 땐 통통 튀는 오버슈트 없이, 영화 예고편처럼
      // 부드럽게 감속하며 안착하는 궤적/속도로 등장한다.
      const _cine = (typeof window._b2CinemaModeOn === 'function') ? window._b2CinemaModeOn() : true;
      const _flyInDur = _cine ? 750 : 550;
      const _flyInEase = _cine ? 'cubic-bezier(.16,1,.3,1)' : 'cubic-bezier(.22,1.4,.36,1)';
      const flyInMove = _b2StartAnim(clone, [
        { transform: `translate(${cx}px,${cy}px) scale(${scale * 0.6}) rotateY(-70deg)` },
        { transform: `translate(${cx}px,${cy}px) scale(${scale}) rotateY(0deg)` }
      ], { duration: _flyInDur, easing: _flyInEase, fill: 'forwards' });
      _b2StartAnim(clone, [{ opacity: 0 }, { opacity: 1 }], { duration: _cine ? 420 : 300, easing: 'ease', fill: 'forwards' });
      setTimeout(() => { try { document.body.appendChild(shine); } catch(e){} }, 260);
      setTimeout(() => { try { shine.remove(); } catch(e){} }, 1600);

      await _b2WaitAnim(flyInMove);
      if (token !== _b2LineupIntroToken) { try { clone.remove(); shine.remove(); } catch(e){} return resolve(); }

      // 화면 중앙에 도착한 순간 한 번 더 스파클 (착지 때와 별개로, 등장 자체를 더 화려하게)
      const _climax = !!(opts && opts.climax);
      const _isAce = !!(opts && opts.isAce);
      try {
        const cr = clone.getBoundingClientRect();
        _b2IntroSparkBurst(cr, glowColor, race, (_climax || _isAce) ? 1.8 : 1);
        if (_climax) _b2IntroScreenShake();
        if (_isAce) _b2IntroAceFlash();
      } catch(e){}

      // 중앙에서 소개 음성 재생 (읽는 동안 은은한 발광 펄스)
      clone.classList.add('pulse');
      if (speakText) {
        const alive = await _b2IntroSpeak(speakText, token);
        if (!alive || token !== _b2LineupIntroToken) { try { clone.remove(); shine.remove(); } catch(e){} return resolve(); }
      } else {
        if (!(await _b2IntroWait(600, token))) { try { clone.remove(); } catch(e){} return resolve(); }
      }
      clone.classList.remove('pulse');

      // 자기 자리로 날아가 안착 (역시 WAAPI — pause 중엔 진짜로 멈춘 채 대기)
      const flyBackMove = _b2StartAnim(clone, [
        { transform: `translate(${cx}px,${cy}px) scale(${scale}) rotateY(0deg)`, filter: 'drop-shadow(0 22px 55px rgba(15,23,42,.5))' },
        { transform: 'translate(0,0) scale(1) rotateY(0deg)', filter: 'drop-shadow(0 6px 14px rgba(15,23,42,.18))' }
      ], { duration: _cine ? 760 : 620, easing: 'cubic-bezier(.5,.02,.2,1)', fill: 'forwards' });
      await _b2WaitAnim(flyBackMove);
      if (token !== _b2LineupIntroToken) { try { clone.remove(); shine.remove(); } catch(e){} return resolve(); }

      _b2LineupRevealCard(el);
      try { clone.remove(); } catch(e){}
      // 착지 파장 + 스파클 + 카드 바운스 + 착지 효과음
      try {
        const rr = el.getBoundingClientRect();
        const ripple = document.createElement('div');
        ripple.className = 'b2-lc-intro-ripple';
        ripple.style.setProperty('--intro-glow', glowColor || '#60a5fa');
        ripple.style.cssText += `left:${rr.left}px;top:${rr.top}px;width:${rr.width}px;height:${rr.height}px`;
        document.body.appendChild(ripple);
        setTimeout(() => { try { ripple.remove(); } catch(e){} }, 720);
        _b2IntroSparkBurst(rr, glowColor, race, (_climax || _isAce) ? 1.8 : 1);
        _b2IntroSFXChime(glowColor);
        el.classList.add('b2-lc-landed');
        setTimeout(() => { try { el.classList.remove('b2-lc-landed'); } catch(e){} }, 600);
      } catch(e){}
      resolve();
    } catch(e) { _b2LineupRevealCard(el); resolve(); }
  });
}

// 완전 정지(하드 리셋) — 대학 변경/다른 서브뷰·탭 이동 등 재생을 이어갈 수 없는
// 상황에서 호출한다. 일시정지와 달리 진행 상태를 버리고 처음부터 다시 시작해야 한다.
// 소개 연출 중에는 화면 아무 곳이나 클릭하면 즉시 종료된다.
// (툴바의 소개연출/종료 버튼 클릭은 각자의 동작이 있으므로 제외)
var _b2LineupIntroClickStop = null;
function _b2LineupBindIntroClickStop() {
  _b2LineupUnbindIntroClickStop();
  _b2LineupIntroClickStop = function(ev) {
    try {
      const t = ev && ev.target;
      if (t && t.closest && t.closest('#b2-lineup-intro-btn,#b2-lineup-intro-stop-btn,#b2-lc-intro-controls')) return;
    } catch(e){}
    _b2LineupStopIntroShow();
  };
  setTimeout(() => {
    try { if (_b2LineupIntroClickStop) document.addEventListener('click', _b2LineupIntroClickStop, true); } catch(e){}
  }, 0);
}
function _b2LineupUnbindIntroClickStop() {
  try { if (_b2LineupIntroClickStop) document.removeEventListener('click', _b2LineupIntroClickStop, true); } catch(e){}
  _b2LineupIntroClickStop = null;
}

function _b2LineupStopIntroShow() {
  if (!_b2LineupIntroPlaying) return;
  _b2LineupUnbindIntroClickStop();
  _b2LineupIntroToken++;
  _b2LineupIntroPlaying = false;
  _b2LineupIntroPaused = false;
  _b2LineupIntroHoverPause = false;
  try { if (window.SUTTS) window.SUTTS.stop(); else window.speechSynthesis && window.speechSynthesis.cancel(); } catch(e){}
  _b2LineupActiveAnims.forEach(a => { try { a.cancel(); } catch(e){} });
  _b2LineupActiveAnims.clear();
  document.querySelectorAll('.b2-lc-intro-clone,.b2-lc-intro-shine,.b2-lc-intro-ripple,.b2-lc-intro-spark').forEach(el => el.remove());
  _b2IntroStageOff();
  _b2LineupRevealAllIntro();
  _b2LineupIntroBtnLabel();
}

async function _b2LineupPlayIntroShow() {
  // TabVis: 인트로 연출 자체가 OFF(비로그인 숨김)면 버튼이 안 보이지만, 방어적으로 한 번 더 체크
  if (window.TabVis && typeof window.TabVis.visible === 'function' && !window.TabVis.visible('b2.lineup.mode.intro')) return;
  // 재생 중 다시 누르면: 일시정지 ↔ 이어보기 토글.
  // (완전 정지는 대학/탭 이동 시 _b2LineupStopIntroShow가 별도로 처리)
  if (_b2LineupIntroPlaying) {
    // 버튼으로 수동 토글하면 호버-자동일시정지 상태는 해제하고, 수동 상태를 우선한다.
    _b2LineupIntroHoverPause = false;
    _b2LineupIntroSetPaused(!_b2LineupIntroPaused);
    return;
  }
  const els = Array.from(document.querySelectorAll('[data-b2lc-player]'));
  if (!els.length) { alert('소개할 스트리머가 없습니다.'); return; }

  // 소개 멘트: 음성듣기와 같은 문장 생성기를 재사용해 이름별로 매칭한다.
  // 여기에 선수 데이터 기반 "한줄평"과 티어 색상(발광 효과용)도 함께 준비한다.
  let intro = '', outro = '', lineMap = {}, oneLinerMap = {}, glowMap = {}, raceMap = {}, eloMap = {}, tierIdxMap = {};
  try {
    const q = _b2LineupBuildSpeakQueue(_b2LineupUniv) || [];
    if (q.length) { intro = q[0].text || ''; outro = q[q.length - 1].text || ''; }
    const { members } = _b2LineupMembers(_b2LineupUniv);
    q.forEach(it => {
      if (!it || !it.player) return;
      const name = String(it.player);
      lineMap[name] = it.text;
      const p = members.find(x => String(x.name || '') === name);
      if (p) {
        const oneLiner = _b2LineupOneLiner(p);
        oneLinerMap[name] = oneLiner;
        if (oneLiner) lineMap[name] = `${it.text}. ${oneLiner}`;
        glowMap[name] = (p.tier && typeof getTierBtnColor === 'function') ? (getTierBtnColor(p.tier) || '#60a5fa') : '#60a5fa';
        raceMap[name] = p.race || '';
        eloMap[name] = _b2IntroEloDelta(p);
        tierIdxMap[name] = _b2IntroTierRank(p.tier);
      }
    });
  } catch(e){}

  const token = ++_b2LineupIntroToken;
  _b2LineupIntroPlaying = true;
  _b2LineupIntroPaused = false;
  _b2LineupIntroBtnLabel();
  _b2LineupBindIntroClickStop();
  _b2LineupBgmStart(_b2LineupUniv);
  // 소개연출 재생 중에는 TTS 음성이 배경음악에 묻히지 않도록 BGM을 더킹(감쇠)한다.
  _b2LineupBgmSetDucked(true);
  _b2IntroStageOn();
  _b2LineupPrepareIntroHide();

  if (token !== _b2LineupIntroToken) { _b2IntroStageOff(); return; }
  if (!(await _b2IntroCountdown(token))) { _b2IntroStageOff(); return; }
  if (token !== _b2LineupIntroToken) { _b2IntroStageOff(); return; }
  _b2IntroSFXFanfare();

  if (intro) {
    _b2IntroCaption(intro);
    if (!(await _b2IntroSpeak(intro, token))) { _b2IntroStageOff(); return; }
  }

  let _introIdx = 0;
  for (const el of els) {
    if (token !== _b2LineupIntroToken) { _b2IntroStageOff(); return; }
    const name = el.getAttribute('data-b2lc-player') || '';
    _introIdx++;
    _b2IntroProgressUpdate(_introIdx, els.length);
    _b2IntroCaption(name);
    _b2IntroSubCaptionType(oneLinerMap[name] || '', token);
    _b2IntroEloBadge(eloMap[name]);
    const _tIdx = tierIdxMap[name];
    const _isClimaxTier = (_tIdx != null && _tIdx >= 0 && _tIdx <= 1); // TIERS 최상위 2단계(G/K)
    const _isAceCard = (_introIdx === els.length);
    await _b2LineupIntroFlyCard(el, token, lineMap[name] || '', glowMap[name], raceMap[name], { climax: _isClimaxTier, isAce: _isAceCard });
    if (token !== _b2LineupIntroToken) { _b2IntroStageOff(); return; }
    _b2LineupApplySpotlightDim(el);
    _b2IntroSubCaptionType('', token);
    _b2IntroEloBadge(null);
    if (!(await _b2IntroWait(200, token))) { _b2IntroStageOff(); return; }
  }

  if (outro) {
    _b2IntroCaption(outro);
    _b2IntroSubCaption('');
    _b2IntroEloBadge(null);
    _b2IntroProgressUpdate(els.length, els.length);
    _b2LineupClearSpotlightDim();
    await _b2IntroSpeak(outro, token);
  }
  if (token !== _b2LineupIntroToken) return;
  _b2IntroCaption('');
  _b2IntroEloBadge(null);
  _b2IntroSubCaption('');
  _b2IntroStageOff();
  _b2LineupClearSpotlightDim();
  _b2LineupIntroPlaying = false;
  _b2LineupIntroPaused = false;
  _b2LineupUnbindIntroClickStop();
  _b2LineupIntroBtnLabel();
}


try {
  window._b2LineupPlayIntroShow = _b2LineupPlayIntroShow;
  window._b2LineupStopIntroShow = _b2LineupStopIntroShow;
} catch(e){}

function _b2LineupSpeakBtnLabel() {
  const btn = document.getElementById('b2-lineup-speak-btn');
  if (!btn) return;
  const paused = !_b2LineupSpeaking && window.SUTTS && window.SUTTS.isPaused && window.SUTTS.isPaused();
  btn.innerHTML = _b2LineupSpeaking ? '⏸ 일시정지' : (paused ? '▶ 이어듣기' : '🔊 음성듣기');
}

function _b2LineupStopSpeak() {
  _b2LineupSpeaking = false;
  _b2LineupSpeakViaCard = false;
  try { if (window.SUTTS) window.SUTTS.stop(); else window.speechSynthesis && window.speechSynthesis.cancel(); } catch(e){}
  _b2LineupClearHighlight();
  _b2LineupRevealAllIntro();
  _b2LineupSpeakBtnLabel();
}

// 툴바의 "스트리머 선택" 드롭다운 변경
function _b2LineupSetSpeakTarget(name) {
  _b2LineupStopSpeak();
  _b2LineupSpeakTarget = String(name || '');
}

// 실제로 큐를 만들어 재생을 시작하는 공통 로직 (툴바 "음성듣기" / 카드 개별 듣기 둘 다 사용)
function _b2LineupStartSpeak(target) {
  const univList = _b2VisUnivs().filter(u => u.name !== '무소속');
  if (!_b2LineupUniv || !univList.some(u=>u.name===_b2LineupUniv)) _b2LineupUniv = univList[0] ? univList[0].name : '';
  if (!_b2LineupUniv) { alert('소개할 대학이 없습니다.'); return false; }

  _b2LineupSpeakTarget = target;

  const queue = _b2LineupBuildSpeakQueue(_b2LineupUniv, target);
  if (!queue.length || (!target && queue.length <= 1)) { alert('소개할 스트리머가 없습니다.'); return false; }

  // "소개 연출": 라인업 전체 소개(특정 인원 지정 안 함)일 때만 카드를 숨긴 채 시작해서
  // 호명되는 순서대로 하나씩 등장시킨다. 개별 스트리머 듣기는 대상 외 카드를 감출 이유가
  // 없으므로 대상(target)이 있을 땐 적용하지 않는다.
  const introAnimActive = !target && typeof _b2LineupIntroAnim !== 'undefined' && _b2LineupIntroAnim;
  if (introAnimActive) _b2LineupPrepareIntroHide();

  _b2LineupSpeaking = true;
  _b2LineupSpeakBtnLabel();
  const ok = window.SUTTS && window.SUTTS.speak(queue, {
    onItem: (item) => _b2LineupHighlightPlayer(item && item.player),
    onEnd: () => { _b2LineupSpeaking = false; _b2LineupSpeakViaCard = false; _b2LineupClearHighlight(); _b2LineupRevealAllIntro(); _b2LineupSpeakBtnLabel(); }
  });
  if (!ok) { _b2LineupSpeaking = false; if (introAnimActive) _b2LineupRevealAllIntro(); _b2LineupSpeakBtnLabel(); return false; }
  return true;
}

// 툴바의 "🔊 음성듣기" 버튼 — 기본적으로 "라인업 전체"(또는 드롭다운에서 고른 대상)를 읽는
// 버튼이다. 카드의 개별 듣기 버튼과는 별개의 진입점이므로:
// - 카드에서 시작한 개별 듣기가 재생/일시정지 중이면, 그 세션은 그대로 두지 않고
//   완전히 중단한 뒤 (드롭다운 기준으로) 새로 재생을 시작한다.
// - 그 외에는 기존처럼 일시정지/이어듣기 토글로 동작한다.
function _b2LineupToggleSpeak() {
  if (!('speechSynthesis' in window)) { alert('이 브라우저는 음성 안내를 지원하지 않습니다.'); return; }

  // 지금 드롭다운에 선택돼 있는 대상(전체="" / 특정 스트리머명)을 항상 최신 기준으로 읽는다.
  let selTarget = _b2LineupSpeakTarget;
  try {
    const sel = document.getElementById('b2-lineup-speak-sel');
    if (sel) selTarget = sel.value || '';
  } catch(e){}

  const cardSessionActive = _b2LineupSpeakViaCard &&
    (_b2LineupSpeaking || !!(window.SUTTS && window.SUTTS.isPaused && window.SUTTS.isPaused()));

  if (cardSessionActive) {
    // 개별(카드) 듣기 → 툴바 버튼 클릭 시: 일시정지가 아니라 "전체 듣기"로 전환한다.
    _b2LineupStopSpeak();
    _b2LineupStartSpeak(selTarget);
    return;
  }

  if (_b2LineupSpeaking) {
    _b2LineupSpeaking = false;
    try { window.SUTTS && window.SUTTS.pause(); } catch(e){}
    _b2LineupSpeakBtnLabel();
    return;
  }

  const isPaused = !!(window.SUTTS && window.SUTTS.isPaused && window.SUTTS.isPaused());
  // 일시정지했던 대상과 지금 선택된 대상이 같을 때만 이어듣기. 그 사이 "전체"↔"개별"로
  // 대상을 바꿨다면 이전 일시정지 세션은 버리고 새 대상으로 처음부터 다시 시작한다.
  if (isPaused && selTarget === _b2LineupSpeakTarget) {
    _b2LineupSpeaking = true;
    window.SUTTS.resume();
    _b2LineupSpeakBtnLabel();
    return;
  }
  if (isPaused) {
    try { window.SUTTS.stop(); } catch(e){}
    _b2LineupClearHighlight();
  }

  _b2LineupSpeakViaCard = false;
  _b2LineupStartSpeak(selTarget);
}

// 카드/표의 프로필 이미지 🔊 버튼 — 항상 그 스트리머 한 명만 바로 듣는다.
// 툴바의 "전체 듣기" 버튼/드롭다운과는 별개로 동작하므로 드롭다운 값은 건드리지 않고,
// 다른 무엇을 듣고 있었든(전체든 다른 스트리머든) 즉시 멈추고 클릭한 스트리머로 전환한다.
function _b2LineupSpeakPlayer(name) {
  if (!name) return;
  _b2LineupStopSpeak();
  _b2LineupSpeakViaCard = true;
  _b2LineupStartSpeak(String(name));
}

try {
  window._b2LineupToggleSpeak = _b2LineupToggleSpeak;
  window._b2LineupStopSpeak = _b2LineupStopSpeak;
  window._b2LineupSetSpeakTarget = _b2LineupSetSpeakTarget;
  window._b2LineupSpeakPlayer = _b2LineupSpeakPlayer;
} catch(e){}

// [REFACTOR] saveB2LineupImg / saveB2FreeImg 공통 캡처 로직
// 두 함수가 거의 동일한 "임시 div 생성 → 아이콘 주입 → 캡처 → 정리" 흐름을 중복 구현하고 있어
// 공통 헬퍼로 묶었습니다. (동작은 기존과 동일, 유지보수 시 한 곳만 고치면 되도록 개선)
async function _b2CaptureBoardHtml({ btnSelector, cardWidth, pad, innerHtml, heightPad, filename, errorLabel }) {
  const btn = document.querySelector(btnSelector);
  if (btn) { btn.disabled = true; btn.textContent = '⏳...'; }

  const tmpDiv = document.createElement('div');
  tmpDiv.style.cssText = `position:fixed;left:-9999px;top:0;padding:${pad}px;background:#f0f2f5;box-sizing:border-box;width:${cardWidth + pad * 2}px`;
  tmpDiv.innerHTML = innerHtml;
  document.body.appendChild(tmpDiv);
  // no-export 요소 제거 (접기 버튼 등)
  tmpDiv.querySelectorAll('.no-export,.no-export-movebtns').forEach(el => el.remove());

  await new Promise(r => setTimeout(r, 100));
  injectUnivIcons(tmpDiv);

  const h = tmpDiv.scrollHeight + heightPad;
  const w = tmpDiv.scrollWidth;

  try {
    if (typeof _captureAndSave !== 'function') throw new Error('이미지 저장 기능을 불러오지 못했습니다.');
    await _captureAndSave(tmpDiv, w, h, filename);
  } catch(e) {
    console.error(`[${errorLabel} 이미지 저장 실패]`, e);
    alert('❌ 이미지 저장 실패\n\n' + (e.message || '알 수 없는 오류가 발생했습니다.'));
  }
  finally {
    document.body.removeChild(tmpDiv);
    if (btn) { btn.disabled = false; btn.textContent = '📷 이미지저장'; }
  }
}

async function saveB2LineupImg() {
  const univList = _b2VisUnivs().filter(u => u.name !== '무소속');
  if (!_b2LineupUniv || !univList.some(u=>u.name===_b2LineupUniv)) _b2LineupUniv = univList[0] ? univList[0].name : '';
  if (!_b2LineupUniv) { alert('저장할 대학이 없습니다.'); return; }

  const col = gc(_b2LineupUniv);
  await _b2CaptureBoardHtml({
    btnSelector: '[onclick="saveB2LineupImg()"]',
    cardWidth: 1360,
    pad: 0,
    innerHtml: _b2LineupPoster(_b2LineupUniv, col, true),
    heightPad: 8,
    filename: `대학라인업_${_b2LineupUniv}_` + new Date().toISOString().slice(0,10) + '.png',
    errorLabel: '라인업'
  });
}

async function saveB2FreeImg() {
  await _b2CaptureBoardHtml({
    btnSelector: '[onclick="saveB2FreeImg()"]',
    cardWidth: 720,
    pad: 24,
    innerHtml: `<style>.b2-bottom-img{max-width:160px;max-height:130px;object-fit:contain;}</style>${_b2FreeView()}`,
    heightPad: 32,
    filename: '무소속현황판_' + new Date().toISOString().slice(0,10) + '.png',
    errorLabel: '무소속 현황판'
  });
}

function _b2ContrastColor(hex) {
  try {
    const c = String(hex||'').replace('#','').trim();
    const r = parseInt(c.slice(0,2),16), g = parseInt(c.slice(2,4),16), b = parseInt(c.slice(4,6),16);
    if([r,g,b].some(v=>Number.isNaN(v))) return '#ffffff';
    const f = (v)=>{ v/=255; return v<=0.03928? v/12.92 : Math.pow((v+0.055)/1.055, 2.4); };
    const L = 0.2126*f(r) + 0.7152*f(g) + 0.0722*f(b);
    // WCAG 대비비율 기준으로 흰/짙은 글자를 선택
    const contrastW = (1.0+0.05)/(L+0.05);
    const contrastD = (L+0.05)/(0.02+0.05); // #0f172a 근사(짙은 글자)
    return (contrastW >= contrastD) ? '#ffffff' : '#0f172a';
  } catch(e){ return '#ffffff'; }
}


/* ══════════════════════════════════════
   👤 프로필 뷰 — 좌측 메인 디스플레이 + 우측 그리드
════════════════════════════════════════ */

// 프로필 탭에서 선택한 선수 이름 저장/로드
// 이미지별 탭 진입 시 매번 랜덤 선수 선택 (새로고침해도 매번 다른 선수)
localStorage.removeItem('su_b2SelectedPlayer'); // 저장된 이전 선수 초기화
(function(){
  // photo가 있는 선수 우선, 없으면 전체에서 랜덤
  const all = players.filter(p => p && !p.hidden && !p.retired && !p.hideFromBoard);
  const withPhoto = all.filter(p => p.photo || (window.playerPhotos && window.playerPhotos[p.name]));
  const pool = withPhoto.length ? withPhoto : all;
  if (pool.length) {
    _b2SelectedPlayer = pool[Math.floor(Math.random() * pool.length)];
  }
})();
