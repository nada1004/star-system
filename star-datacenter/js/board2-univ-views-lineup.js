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
    ? `<img class="b2-players-card-secondary" style="z-index:1" src="${lc3SecondSrc}" data-orig="${toHttpsUrl(lc3SecondPhoto)}" loading="lazy" decoding="async" alt="" onerror="if(this.dataset.orig&&this.src!==this.dataset.orig){this.src=this.dataset.orig;}else{this.remove()}">`
    : '';
  const attrName = (p.name||'').replace(/"/g,'&quot;');
  return `<div class="b2-lc3" data-b2lc-player="${attrName}" style="--lc-col:${col}" onclick="openPlayerModal('${safeName}')"${lc3SecondPhoto ? ` onmousemove="_b2CardHoverScrub(event,this)" onmouseleave="_b2CardHoverLeave(this)"` : ''}>
    <div class="b2-lc3-photo">
      ${photo
        ? `<img class="b2-lc3-backdrop" src="${photo}" data-orig="${photoOrig}" crossorigin="anonymous" loading="lazy" decoding="async" aria-hidden="true" onerror="if(this.dataset.orig&&this.src!==this.dataset.orig){this.removeAttribute('crossorigin');this.src=this.dataset.orig;}else{this.style.display='none'}">
           <img src="${photo}" data-orig="${photoOrig}" crossorigin="anonymous" loading="lazy" decoding="async" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center;z-index:1" onerror="if(this.dataset.orig&&this.src!==this.dataset.orig){this.removeAttribute('crossorigin');this.src=this.dataset.orig;}else{this.style.display='none';this.previousElementSibling.style.display='none';this.nextElementSibling.style.display='flex'}">
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
  return `<tr data-b2lc-player="${attrName}" onclick="openPlayerModal('${safeName}')" style="--tier-c:${p.tier ? tierCol : 'transparent'}">
    <td><div class="b2-lc4-namecell">
      <div class="b2-lc4-avatar${_2ndAvatar?' ph-swap':''}">
        ${photo
          ? `<img src="${photo}" data-orig="${photoOrig}" crossorigin="anonymous" loading="lazy" decoding="async" onerror="if(this.dataset.orig&&this.src!==this.dataset.orig){this.removeAttribute('crossorigin');this.src=this.dataset.orig;}else{this.style.display='none';this.nextElementSibling.style.display='flex'}"><div class="b2-lc4-fallback" style="display:none">${raceLetter}</div>`
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
    ? `<img src="${photo}" data-orig="${photoOrig}" crossorigin="anonymous" loading="lazy" decoding="async" aria-hidden="true" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center;transform:scale(1.22);filter:blur(16px) saturate(1.15) brightness(.8);opacity:.85" onerror="if(this.dataset.orig&&this.src!==this.dataset.orig){this.removeAttribute('crossorigin');this.src=this.dataset.orig;}else{this.style.display='none'}">
       <div style="position:absolute;inset:0;background:linear-gradient(180deg,${col}33 0%,rgba(0,0,0,.18) 100%)"></div>`
    : `<div style="position:absolute;inset:0;background:linear-gradient(160deg,${col}44 0%,${col}1a 100%)"></div>`;
  // 메인 사진 (전체 꽉 채움, 모양 적용 없이 카드 자체 overflow:hidden으로 처리)
  const photoHtml = photo
    ? `<img class="b2-lineup-card-photo" src="${photo}" data-orig="${photoOrig}" crossorigin="anonymous" loading="lazy" decoding="async" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center" onerror="if(this.dataset.orig&&this.src!==this.dataset.orig){this.removeAttribute('crossorigin');this.src=this.dataset.orig;}else{this.style.display='none';this.nextElementSibling.style.display='flex'}">
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
    ? `<img class="b2-players-card-secondary" style="z-index:1" src="${lcSecondSrc}" data-orig="${toHttpsUrl(lcSecondPhoto)}" loading="lazy" decoding="async" alt="" onerror="if(this.dataset.orig&&this.src!==this.dataset.orig){this.src=this.dataset.orig;}else{this.remove()}">`
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
    <div data-b2lc-player="${attrName}" style="position:relative;cursor:pointer;border-radius:var(--r2);overflow:hidden;background:${_b2PastelBg(col,0.10)};box-shadow:0 4px 16px rgba(15,23,42,.18);border:1px solid ${col}33;transition:transform .15s,box-shadow .15s" onclick="openPlayerModal('${safeName}')"
      onmouseenter="this.style.transform='translateY(-3px)';this.style.boxShadow='0 10px 26px rgba(15,23,42,.28)'"
      onmouseleave="this.style.transform='';this.style.boxShadow='0 4px 16px rgba(15,23,42,.18)'${lcSecondPhoto ? ";_b2CardHoverLeave(this)" : ""}"${lcSecondPhoto ? ` onmousemove="_b2CardHoverScrub(event,this)"` : ''}>
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
    ':is(body.dark,html.dark) .b2-lc4 tbody tr.b2-lc-speaking td{background:rgba(96,165,250,.28)!important}'
  ].join('');
  document.head.appendChild(s);
})();

var _b2LineupSpeaking = false;
var _b2LineupSpeakTarget = '';   // '' = 라인업 전체, 그 외 = 특정 스트리머 이름

// 화면 카드와 동일한 순서(임원 → 멤버)로 소개 문장을 만든다.
// onlyName 이 주어지면 해당 스트리머 한 명만 읽는다.
function _b2LineupBuildSpeakQueue(univName, onlyName) {
  const { members, roleMembers, rosterMembers } = _b2LineupMembers(univName);
  const raceLabel = (r) => ({ T:'테란', P:'프로토스', Z:'저그' }[r] || '');
  const describe = (p) => {
    const parts = [];
    if (p.tier) parts.push(`${p.tier} 티어`);
    parts.push(`${p.name || '이름 미상'}`);
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
    return [{ text: `${univName} ${p.role ? p.role + ', ' : ''}${describe(p)}`, player: p.name }];
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
      el.classList.add('b2-lc-speaking');
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  } catch(e){}
}

function _b2LineupSpeakBtnLabel() {
  const btn = document.getElementById('b2-lineup-speak-btn');
  if (!btn) return;
  btn.innerHTML = _b2LineupSpeaking ? '⏹ 정지' : '🔊 음성듣기';
}

function _b2LineupStopSpeak() {
  _b2LineupSpeaking = false;
  try { if (window.SUTTS) window.SUTTS.stop(); else window.speechSynthesis && window.speechSynthesis.cancel(); } catch(e){}
  _b2LineupClearHighlight();
  _b2LineupSpeakBtnLabel();
}

// 툴바의 "스트리머 선택" 드롭다운 변경
function _b2LineupSetSpeakTarget(name) {
  _b2LineupStopSpeak();
  _b2LineupSpeakTarget = String(name || '');
}

function _b2LineupToggleSpeak() {
  if (!('speechSynthesis' in window)) { alert('이 브라우저는 음성 안내를 지원하지 않습니다.'); return; }
  if (_b2LineupSpeaking) { _b2LineupStopSpeak(); return; }

  const univList = _b2VisUnivs().filter(u => u.name !== '무소속');
  if (!_b2LineupUniv || !univList.some(u=>u.name===_b2LineupUniv)) _b2LineupUniv = univList[0] ? univList[0].name : '';
  if (!_b2LineupUniv) { alert('소개할 대학이 없습니다.'); return; }

  // 드롭다운에서 특정 스트리머가 선택되어 있으면 그 한 명만 읽는다.
  let target = _b2LineupSpeakTarget;
  try {
    const sel = document.getElementById('b2-lineup-speak-sel');
    if (sel) target = sel.value || '';
  } catch(e){}
  _b2LineupSpeakTarget = target;

  const queue = _b2LineupBuildSpeakQueue(_b2LineupUniv, target);
  if (!queue.length || (!target && queue.length <= 1)) { alert('소개할 스트리머가 없습니다.'); return; }

  _b2LineupSpeaking = true;
  _b2LineupSpeakBtnLabel();
  const ok = window.SUTTS && window.SUTTS.speak(queue, {
    onItem: (item) => _b2LineupHighlightPlayer(item && item.player),
    onEnd: () => { _b2LineupSpeaking = false; _b2LineupClearHighlight(); _b2LineupSpeakBtnLabel(); }
  });
  if (!ok) { _b2LineupSpeaking = false; _b2LineupSpeakBtnLabel(); }
}

// 카드/표에서 개별 스트리머 한 명만 바로 듣기
function _b2LineupSpeakPlayer(name) {
  if (!name) return;
  _b2LineupStopSpeak();
  _b2LineupSpeakTarget = String(name);
  try { const sel = document.getElementById('b2-lineup-speak-sel'); if (sel) sel.value = _b2LineupSpeakTarget; } catch(e){}
  _b2LineupToggleSpeak();
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
