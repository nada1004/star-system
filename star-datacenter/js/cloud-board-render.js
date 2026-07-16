function buildUnivBoardCard(u, forExport){
  if(!u)return'';
  const uNameJs = (typeof escJS==='function')
    ? escJS(u.name)
    : String(u.name||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\r/g,'\\r').replace(/\n/g,'\\n');
  const col=gc(u.name);
  const iconUrl=UNIV_ICONS[u.name]||(univCfg.find(x=>x.name===u.name)||{}).icon||'';
  const sorted=_getBoardPlayers(u.name);
  if(!sorted.length&&!forExport){
    // 선수 없는 대학도 빈 카드로 표시
    return `<div class="brd-card" data-univ="${escAttr(u.name)}" style="border:2px dashed ${col}66;border-radius:14px;padding:20px 18px;background:${col}08;display:flex;align-items:center;gap:10px;opacity:.75">
      ${iconUrl?`<img src="${toHttpsUrl(iconUrl)}" style="width:var(--su_univ_logo_size,32px);height:var(--su_univ_logo_size,32px);object-fit:contain;border-radius:var(--su_univ_logo_radius,10px)" onerror="this.style.display='none'">`:''}
      <span style="font-weight:900;font-size:15px;color:${col}">${u.name}</span>
      <span style="font-size:11px;color:var(--gray-l)">등록된 스트리머 없음</span>
    </div>`;
  }
  const cnt=sorted.length;
  const allUnivs=getAllUnivs();

  const RACE_CFG={T:{bg:'#dbeafe',col:'#1e40af',txt:'테'},Z:{bg:'#ede9fe',col:'#5b21b6',txt:'저'},P:{bg:'#fef3c7',col:'#92400e',txt:'프'},N:{bg:'#f1f5f9',col:'#475569',txt:'?'}};
  const hexToRgba=(h,a)=>{const r=parseInt(h.slice(1,3),16),g=parseInt(h.slice(3,5),16),b=parseInt(h.slice(5,7),16);return`rgba(${r},${g},${b},${a})`;};
  // 파스텔 변환: 원색을 흰색과 mix=60% 블렌딩
  const toPastel=(hex,mix=0.72)=>{
    const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
    const pr=Math.round(r*(1-mix)+255*mix),pg=Math.round(g*(1-mix)+255*mix),pb=Math.round(b*(1-mix)+255*mix);
    return '#'+[pr,pg,pb].map(v=>v.toString(16).padStart(2,'0')).join('');
  };
  const pastelCol=forExport?col:toPastel(col, Math.max(0.35, 0.95 - b2BgAlpha * 0.01));
  const headerCol = col; // 헤더는 대학 상징색 그대로 사용
  const shd=hexToRgba(col,.18);

  // 티어별 칩 레이아웃 빌더 (무소속 + forExport 시 모든 대학에 적용)
  const buildChipLayout=(isWide)=>{
    // 직급자와 일반 선수 분리
    const rolePlayers = sorted.filter(p=>p.role&&MAIN_ROLES.includes(p.role));
    const normalPlayers = sorted.filter(p=>!p.role||!MAIN_ROLES.includes(p.role));

    const tierMap={};
    normalPlayers.forEach(p=>{
      const t=p.tier||'기타';
      if(!tierMap[t])tierMap[t]=[];
      tierMap[t].push(p);
    });
    const tierOrder=TIERS.filter(t=>tierMap[t]);
    if(tierMap['기타']&&!TIERS.includes('기타'))tierOrder.push('기타');

    const buildPlayerChip=(p, chipIdx)=>{
      const pNameJs = (typeof escJS==='function')
        ? escJS(p && p.name)
        : String(p && p.name || '').replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\r/g,'\\r').replace(/\n/g,'\\n');
      const pNameHtml = (typeof window.escHTML==='function') ? window.escHTML(p && p.name) : String(p && p.name || '');
      const pRoleHtml = (typeof window.escHTML==='function') ? window.escHTML(p && p.role) : String(p && p.role || '');
      const rc=RACE_CFG[p.race]||{bg:'#f1f5f9',col:'#475569',txt:p.race||'?'};
      const isMain=p.role&&MAIN_ROLES.includes(p.role);
      const rCol=ROLE_COLORS[p.role]||'';
      const rIcon=ROLE_ICONS[p.role]||'';
      const photoSrcChip = _getBrdPhoto(p);
      // ── 포토카드 뷰 (화면 + 이미지저장 공통) ──
      if (boardCardView) {
        const rcBg = rc.col || col;
        const cardTierCol = p.tier ? (getTierBtnColor(p.tier) || '#64748b') : null;
        const cardTierText = p.tier ? (getTierBtnTextColor(p.tier) || '#fff') : '#fff';
        const rTxtCard = rc.txt||p.race||'?';
        const imgBorderRadius = boardCardShape === 'square' ? '8px' : '10px';
        const imgInner = photoSrcChip
          ? `<img src="${toScaledUrl(photoSrcChip,320)}" data-orig="${toHttpsUrl(photoSrcChip)}" class="brd-fit-auto" data-fit-kind="card" data-fit-mode="auto" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center;border-radius:${imgBorderRadius}" onload="_applyBoardBgAutoSizing(this)" ${forExport?'':' onerror="if(this.dataset.orig&&this.src!==this.dataset.orig){this.src=this.dataset.orig;}else{this.style.display=\'none\'}"'}>`
          + (forExport?'':`<div style="position:absolute;inset:0;background:linear-gradient(135deg,${col},${col}aa);display:none;align-items:center;justify-content:center;font-size:30px;font-weight:900;color:#fff;border-radius:${imgBorderRadius}">${rTxtCard}</div>`)
          : `<div style="position:absolute;inset:0;background:linear-gradient(135deg,${col},${col}aa);display:flex;align-items:center;justify-content:center;font-size:30px;font-weight:900;color:#fff;border-radius:${imgBorderRadius}">${rTxtCard}</div>`;
        // 종족/티어 배지 (좌상단)
        const topBadges = `<div style="position:absolute;top:6px;left:6px;display:flex;gap:3px;flex-wrap:wrap">`
          + `<span style="font-size:9px;font-weight:900;background:${rc.col||'#64748b'};color:#fff;border-radius:4px;padding:1px 5px;line-height:1.5;text-shadow:0 1px 2px rgba(0,0,0,.4)">${rTxtCard}</span>`
          + (p.tier?`<span style="font-size:9px;font-weight:800;background:${cardTierCol};color:${cardTierText};border-radius:4px;padding:1px 5px;line-height:1.5;text-shadow:0 1px 2px rgba(0,0,0,.3)">${p.tier}</span>`:'')
          + `</div>`;
        const overlay = `<div style="position:absolute;bottom:0;left:0;right:0;background:linear-gradient(transparent,rgba(0,0,0,.82));border-radius:0 0 10px 10px;padding:22px 6px 7px;text-align:center">`
          + (p.role?`<div style="font-size:9px;font-weight:700;color:#ffffffbb;margin-bottom:1px">${pRoleHtml}</div>`:'')
          + `<div style="font-weight:800;font-size:11px;color:#fff;word-break:break-all;text-shadow:0 1px 3px #000a">${pNameHtml}</div>`
          + (p.channelUrl
            ? (forExport
                ? `<div style="margin-top:4px;font-size:9px;font-weight:700;color:${col};background:rgba(255,255,255,.9);border-radius:4px;padding:1px 6px;display:inline-block">▶ 방송</div>`
                : `<a href="${p.channelUrl}" target="_blank" onclick="event.stopPropagation()" style="margin-top:4px;display:inline-block;font-size:9px;font-weight:700;color:${col};background:rgba(255,255,255,.9);border-radius:4px;padding:1px 6px;text-decoration:none">▶ 방송</a>`)
            : '')
          + `</div>`;
        const cardInner = `<div style="position:relative;width:100%;${forExport?'height:110px;padding-top:0':'aspect-ratio:3/4'};overflow:hidden;border-radius:10px">${imgInner}${topBadges}${overlay}</div>`;
        if (forExport) {
          return `<div style="border-radius:10px;overflow:hidden;border:2px solid ${hexToRgba(col,.5)}">${cardInner}</div>`;
        }
        const totalInUnivCard=sorted.length;
        const clickFnCard=_boardCanManage()
          ? `openBrdPlayerPopupFromChip(event,'${pNameJs}','${uNameJs}',${chipIdx??0},${totalInUnivCard})`
          : `openRandomPlayerModal()`;
        return `<div class="brd-chip" data-player="${escAttr(p.name)}" data-univ="${escAttr(u.name)}" data-idx="${chipIdx??0}"${_boardCanManage()?' draggable="true"':''}`
          + ` style="border-radius:10px;overflow:hidden;border:2px solid ${hexToRgba(col,.5)};cursor:pointer;transition:box-shadow .15s,transform .15s"`
          + ` onmouseover="this.style.boxShadow='0 6px 20px ${hexToRgba(col,.5)}';this.style.transform='translateY(-3px)'"`
          + ` onmouseout="this.style.boxShadow='';this.style.transform=''"`
          + ` onclick="event.stopPropagation();${clickFnCard}"`
          + ` ondragstart="if(_boardCanManage()){event.stopPropagation();event.dataTransfer.setData('text/chip',this.dataset.player);}">`
          + cardInner + `</div>`;
      }

      if(forExport){
        // 이미지 저장 (목록형): 화면 칩과 동일한 스타일로 렌더링
        const cBgE=hexToRgba(col,.16);
        const cBdE=hexToRgba(col,.45);
        const rTxt=rc.txt||p.race||'?';
        const chipTierCol2 = p.tier ? (getTierBtnColor(p.tier) || col) : '#9ca3af';
        const chipTierText2 = p.tier ? (getTierBtnTextColor(p.tier) || '#fff') : '#fff';
        // 전역 프로필 이미지 모양 설정(원/네모) 반영
        const imgRadius = 'var(--su_profile_radius,50%)';
        return `<span style="display:inline-flex;align-items:center;gap:12px;background:${cBgE};border-radius:16px;padding:10px 18px 10px 10px;margin:5px;box-shadow:0 2px 10px rgba(0,0,0,.13);border:2px solid ${cBdE}">
          ${photoSrcChip
            ?`<img src="${toThumbUrl(photoSrcChip,64)}" data-orig="${toHttpsUrl(photoSrcChip)}" class="brd-fit-auto" data-fit-kind="profile" data-fit-mode="auto" style="width:64px;height:64px;border-radius:${imgRadius};object-fit:cover;flex-shrink:0;border:3px solid ${col};box-shadow:0 2px 10px ${hexToRgba(col,.4)}" onload="_applyBoardBgAutoSizing(this)" onerror="if(this.dataset.orig&&this.src!==this.dataset.orig){this.src=this.dataset.orig;}">`
            :`<span style="width:64px;height:64px;border-radius:${imgRadius};background:${col};color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:26px;font-weight:900;flex-shrink:0;border:3px solid ${hexToRgba(col,.7)}">${rTxt}</span>`}
          <span style="display:inline-flex;flex-direction:column;gap:3px;min-width:0">
            ${isMain?`<span style="font-size:11px;font-weight:900;color:#fff;background:${col};border-radius:5px;padding:2px 8px;display:inline-block">${rIcon}${p.role}</span>`:''}
            <span style="font-weight:900;color:#111;font-size:16px;line-height:1.3;white-space:nowrap">${p.name}</span>
            <span style="display:inline-flex;align-items:center;gap:5px;line-height:1.2">
              <span style="font-size:12px;font-weight:900;background:${rc.col};color:#fff;border-radius:6px;padding:2px 8px">${rTxt}</span>
              ${p.tier?`<span style="font-size:11px;font-weight:800;background:${chipTierCol2};color:${chipTierText2};border-radius:6px;padding:2px 8px">${p.tier}</span>`:''}
            </span>
          </span>
        </span>`;
      }
      const compact=boardCompactMode;
      const totalInUniv=sorted.length;
      // 관리자는 이동/직책 팝업, 비관리자는 스트리머 상세
      const clickFn=_boardCanManage()
        ? `openBrdPlayerPopupFromChip(event,'${pNameJs}','${uNameJs}',${chipIdx??0},${totalInUniv})`
        : `openRandomPlayerModal()`;

      // 티어 고정 색상 (칩)
      const chipTierCol = p.tier ? (getTierBtnColor(p.tier) || col) : '#9ca3af';
      const chipTierText = p.tier ? (getTierBtnTextColor(p.tier) || '#fff') : '#fff';

      // 칩 배경: 대학 지정색
      const cBgL=hexToRgba(col,.16);
      const cBgH=hexToRgba(col,.28);
      const cBd=hexToRgba(col,.45);
      const rTxt=rc.txt||p.race||'?';
      const photoSz=compact?'36px':'64px';
      const photoFs=compact?'14px':'26px';
      const chipPad=compact?'5px 10px 5px 6px':'10px 18px 10px 10px';
      const chipGap=compact?'7px':'12px';
      const nameFs=compact?'13px':'16px';
      const badgeFs=compact?'10px':'12px';
      const tierBadgeFs=compact?'9px':'11px';
      // 사진 렌더: 사진 로드 실패 시 플레이스홀더(종족 텍스트) 표시
      const _photoEl = photoSrcChip
        ? `<span style="width:${photoSz};height:${photoSz};border-radius:var(--su_profile_radius,50%);flex-shrink:0;position:relative;display:inline-flex;align-items:center;justify-content:center;overflow:hidden;border:${compact?'2':'3'}px solid ${col};box-shadow:0 2px 10px ${hexToRgba(col,.4)};background:${col};color:#fff;font-size:${photoFs};font-weight:900">${rTxt}<img src="${toThumbUrl(photoSrcChip,compact?36:64)}" data-orig="${toHttpsUrl(photoSrcChip)}" class="brd-fit-auto" data-fit-kind="profile" data-fit-mode="auto" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:var(--su_profile_radius,50%)" onload="_applyBoardBgAutoSizing(this)" onerror="if(this.dataset.orig&&this.src!==this.dataset.orig){this.src=this.dataset.orig;}else{this.style.display='none'}"></span>`
        : `<span style="width:${photoSz};height:${photoSz};border-radius:var(--su_profile_radius,50%);background:${col};color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:${photoFs};font-weight:900;flex-shrink:0;border:${compact?'2':'3'}px solid ${hexToRgba(col,.7)}">${rTxt}</span>`;
      return `<span class="brd-chip" data-player="${escAttr(p.name)}" data-univ="${escAttr(u.name)}" data-idx="${chipIdx??0}"${_boardCanManage()?' draggable="true"':''} style="display:inline-flex;align-items:center;gap:${chipGap};background:${cBgL};border-radius:16px;padding:${chipPad};margin:${compact?'3px':'5px'};cursor:${_boardCanManage()?'grab':'pointer'};transition:all .15s;box-shadow:0 2px 10px rgba(0,0,0,.13);border:2px solid ${cBd}" onmouseover="this.style.background='${cBgH}';this.style.boxShadow='0 5px 18px rgba(0,0,0,.2)';this.style.borderColor='${hexToRgba(col,.65)}'" onmouseout="this.style.background='${cBgL}';this.style.boxShadow='0 2px 10px rgba(0,0,0,.13)';this.style.borderColor='${cBd}'" onclick="event.stopPropagation();${clickFn}" ondragstart="if(_boardCanManage()){event.stopPropagation();event.dataTransfer.setData('text/chip',this.dataset.player);}">
        ${_photoEl}
        <span style="display:inline-flex;flex-direction:column;gap:${compact?'2px':'3px'};min-width:0">
          ${isMain&&!compact?`<span style="font-size:11px;font-weight:900;color:#fff;background:${col};border-radius:5px;padding:2px 8px;display:inline-block">${rIcon}${p.role}</span>`:''}
          <span style="font-weight:900;color:#111;font-size:${nameFs};line-height:1.3;white-space:nowrap;${p.inactive?'opacity:.6':''}">${compact&&isMain?`${rIcon}`:''}${pNameHtml}${getStatusIconHTML(p.name)}${p.inactive?'<span style="font-size:9px;background:#fff7ed;color:#9a3412;border-radius:4px;padding:1px 4px;font-weight:700;margin-left:3px">⏸️</span>':''}${(()=>{if(!p.transferDate||!p.prevUniv)return'';const diff=(new Date()-new Date(p.transferDate))/(864e5);return diff<=30?`<span style="font-size:9px;background:#fef3c7;color:#92400e;border-radius:4px;padding:1px 5px;font-weight:800;margin-left:3px;border:1px solid #fcd34d" title="${escAttr(p.prevUniv)}에서 이적 (${escAttr(p.transferDate)})">🔄 이적</span>`:'';})()}</span>
          <span style="display:inline-flex;align-items:center;gap:${compact?'3px':'5px'};line-height:1.2">
            <span style="font-size:${badgeFs};font-weight:900;background:${rc.col};color:#fff;border-radius:6px;padding:${compact?'1px 5px':'2px 8px'}">${rTxt}</span>
            ${p.tier?`<span style="font-size:${tierBadgeFs};font-weight:800;background:${chipTierCol};color:${chipTierText};border-radius:6px;padding:${compact?'1px 5px':'2px 8px'}">${p.tier}</span>`:''}
          </span>
        </span>
      </span>`;    };

    // 전체 순서에서의 인덱스 맵
    const chipIdxMap={};
    sorted.forEach((p,i)=>{ chipIdxMap[p.name]=i; });

    // 직급자 섹션
    // 직책별 개별 행 (MAIN_ROLES 순서대로 각 역할 따로 표시)
    const roleRowsArr = MAIN_ROLES
      .map(role => rolePlayers.filter(p => p.role === role))
      .filter(group => group.length > 0);
    const roleSection = roleRowsArr.length > 0
      ? roleRowsArr.map(group => {
          const role = group[0].role;
          const rIcon = ROLE_ICONS[role] || '';
          const rCol = ROLE_COLORS[role] || col;
          return `<div style="margin-bottom:6px;padding:6px 8px 8px;border-radius:10px;background:${hexToRgba(col,.1)};border:1.5px solid ${hexToRgba(col,.25)}">
            <div style="font-size:10px;font-weight:900;color:#fff;padding:2px 9px;margin-bottom:4px;background:${rCol};border-radius:5px;display:inline-block;line-height:1.6">${rIcon}${role}</div>
            <div style="${boardCardView&&!forExport?'display:grid;grid-template-columns:repeat(auto-fill,minmax(90px,1fr));gap:8px;padding:4px 0':'display:flex;flex-wrap:wrap;gap:0'}">${group.map(p=>buildPlayerChip(p, chipIdxMap[p.name]??0)).join('')}</div>
          </div>`;
        }).join('')
      : '';

    // 무소속: 티어 레이블 포함 flat 리스트
    let tierRows='', allRows='';
    if(u.name==='무소속'&&!forExport){
      const tierSorted=[...sorted].sort((a,b)=>TIERS.indexOf(a.tier)-TIERS.indexOf(b.tier)||b.points-a.points);
      const chipIdxMapElo={};
      tierSorted.forEach((p,i)=>{ chipIdxMapElo[p.name]=i; });
      // 티어별 그룹핑하여 레이블 표시
      const freeTierMap={};
      tierSorted.forEach(p=>{ const t=p.tier||'기타'; if(!freeTierMap[t])freeTierMap[t]=[]; freeTierMap[t].push(p); });
      const freeTierOrder=[...TIERS.filter(t=>freeTierMap[t]),...(freeTierMap['기타']?['기타']:[])];
      tierRows=freeTierOrder.map(tier=>{
        const ps=freeTierMap[tier];
        const tColor=getTierBtnColor(tier)||col;
        const tText=getTierBtnTextColor(tier)||'#fff';
        return `<div style="padding:4px 0 2px;border-bottom:1px solid ${hexToRgba(col,.22)}">
          <div style="font-size:10px;font-weight:900;color:${tText};letter-spacing:1px;padding:2px 9px;margin-bottom:3px;background:${toPastel(tColor,Math.max(0,(50-b2LabelAlpha)*0.005))}!important;border-radius:5px;box-shadow:0 1px 4px rgba(0,0,0,.15);display:inline-block;line-height:1.5">${tier}</div>
          <div style="${boardCardView&&!forExport?'display:grid;grid-template-columns:repeat(auto-fill,minmax(90px,1fr));gap:8px;padding:4px 0':'display:flex;flex-wrap:wrap;gap:0'}">${ps.map(p=>buildPlayerChip(p, chipIdxMapElo[p.name]??0)).join('')}</div>
        </div>`;
      }).join('');
      allRows=tierRows;
    } else {
      tierRows=tierOrder.map((tier,tidx)=>{
        const ps=tierMap[tier];
        const tColor = getTierBtnColor(tier) || col;
        const tText = getTierBtnTextColor(tier) || '#fff';
        return `<div style="padding:4px 0 2px;border-bottom:1px solid ${hexToRgba(col,.22)}">
          <div style="font-size:10px;font-weight:900;color:${tText};letter-spacing:1px;padding:2px 9px;margin-bottom:3px;background:${toPastel(tColor,Math.max(0,(50-b2LabelAlpha)*0.005))}!important;border-radius:5px;box-shadow:0 1px 4px rgba(0,0,0,.15);display:inline-block;line-height:1.5">${tier}</div>
          <div style="${boardCardView&&!forExport?'display:grid;grid-template-columns:repeat(auto-fill,minmax(90px,1fr));gap:8px;padding:4px 0':'display:flex;flex-wrap:wrap;gap:0'}">${ps.map(p=>buildPlayerChip(p, chipIdxMap[p.name]??0)).join('')}</div>
        </div>`;
      }).join('');
      allRows = roleSection + tierRows;
    }

    const hdrDrag=_boardCanManage()&&!forExport?' draggable="true" ondragstart="event.stopPropagation();const card=this.closest(\'.brd-card\');const wrap=document.getElementById(\'board-wrap\');_brdDragSrc=card;card.classList.add(\'dragging\');event.dataTransfer.effectAllowed=\'move\';event.dataTransfer.setData(\'text/card\',card.dataset.univ);" ondragend="event.stopPropagation();const card=this.closest(\'.brd-card\');card.classList.remove(\'dragging\');const wrap=document.getElementById(\'board-wrap\');if(wrap){boardOrder=[...wrap.querySelectorAll(\'.brd-card\')].map(c=>c.dataset.univ);save();syncBoardOrderToUnivCfg();}wrap&&wrap.querySelectorAll(\'.brd-card\').forEach(c=>c.classList.remove(\'drag-over\'));_brdDragSrc=null;"':'';

    const _bgPos=u.bgImgPos||'center center';
    const _bgSize=u.bgImgSize||'auto';
    const _bgPosGrid=u.bgImg?(()=>{
      const vs=['top','center','bottom'],hs=['left','center','right'];
      return `<div onclick="event.stopPropagation()" style="display:flex;flex-direction:column;gap:1px" title="배경 위치">${vs.map(v=>`<div style="display:flex;gap:1px">${hs.map(h=>{const p=`${v} ${h}`,a=_bgPos===p;return`<button onclick="event.stopPropagation();setBoardBgImgPos('${uNameJs}','${p}')" style="width:10px;height:10px;border-radius:2px;border:1px solid ${a?'rgba(255,255,255,.9)':'rgba(255,255,255,.3)'};background:${a?'rgba(255,255,255,.6)':'rgba(255,255,255,.15)'};cursor:pointer;padding:0" title="${p}"></button>`;}).join('')}</div>`).join('')}</div>`;
    })():'';
    return `<div class="brd-card" data-univ="${escAttr(u.name)}" style="position:relative;--brd-col:${toPastel(col,Math.min(1, Math.max(0.35, 0.95 - b2BgAlpha * 0.01) + 0.08))};--brd-shd:${shd}${isWide?';grid-column:1/-1':''}" draggable="false">
      <div class="brd-hdr" style="background:linear-gradient(135deg,${col} 0%,${hexToRgba(col,.85)} 100%);border-radius:18px 18px 0 0;cursor:${_boardCanManage()&&!forExport?'grab':'default'};overflow:hidden"${hdrDrag}>
        <div style="display:flex;align-items:center;gap:10px;position:relative;z-index:1">
          <div style="width:var(--su_univ_logo_box,46px);height:var(--su_univ_logo_box,46px);border-radius:var(--su_univ_logo_radius,13px);background:rgba(255,255,255,.20);border:2px solid rgba(255,255,255,.35);display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden;${forExport?'':'cursor:pointer'}" draggable="false" ${forExport?'':`onmousedown="event.stopPropagation()" onclick="event.stopPropagation();if(typeof openUnivModal==='function')openUnivModal('${uNameJs}')"` } title="대학 상세 보기">
            ${iconUrl?`<img src="${toHttpsUrl(iconUrl)}" style="width:var(--su_univ_logo_size,34px);height:var(--su_univ_logo_size,34px);object-fit:contain;border-radius:var(--su_univ_logo_radius,10px)" onerror="this.parentElement.innerHTML='🏫'">`:'<span style="font-size:22px">🏫</span>'}
          </div>
          <div style="flex:1;min-width:0">
            <div style="display:flex;align-items:center;gap:6px;flex-wrap:nowrap;min-width:0;overflow:hidden">
              <button class="brd-univ-name-btn" style="color:#fff!important;font-weight:900;text-shadow:0 1px 4px rgba(0,0,0,.25);font-size:18px;display:inline-flex;align-items:center;gap:7px;flex-shrink:0" ${forExport?'':(`onclick="event.stopPropagation();toggleBoardUniv('${uNameJs}')"`)}>
                ${(u.name||'')}${(!forExport&&(boardSelUniv||'')===u.name)?`<span style="background:rgba(255,255,255,.95);color:${col};border-radius:50%;width:22px;height:22px;display:inline-flex;align-items:center;justify-content:center;font-size:14px;font-weight:900;box-shadow:0 2px 6px rgba(0,0,0,.2);flex-shrink:0">✓</span>`:''}</button>
              ${(u.championships||0)>0?`<span style="display:flex;gap:1px;flex-shrink:0">${'<span style="font-size:15px">⭐</span>'.repeat(u.championships||0)}</span>`:''}
              ${_boardCanManage()&&!forExport?`<input type="text" placeholder="📌 메모..." value="${escAttr(u.memo2||'')}" style="margin-left:4px;background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.35);border-radius:6px;padding:2px 8px;font-size:12px;color:#fff;outline:none;font-family:inherit;min-width:60px;width:200px;max-width:45%;flex:0 1 auto" onmousedown="event.stopPropagation()" onclick="event.stopPropagation()" onchange="setBoardMemo2('${uNameJs}',this.value)" onblur="setBoardMemo2('${uNameJs}',this.value)">`:(u.memo2?`<span style="margin-left:4px;font-size:12px;color:rgba(255,255,255,.92);font-weight:600;background:rgba(255,255,255,.15);border-radius:6px;padding:2px 8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex-shrink:1;max-width:45%">${(typeof window.escHTML==='function')?window.escHTML(u.memo2):u.memo2}</span>`:'')}
            </div>
            <div style="font-size:11px;color:rgba(255,255,255,.8);margin-top:3px;display:flex;align-items:center;gap:5px">${cnt}명 <button class="brd-collapse-btn no-export" onclick="event.stopPropagation();_brdCollapseToggle('${uNameJs}')"
              style="background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.35);border-radius:4px;color:#fff;font-size:10px;padding:0 5px;height:16px;cursor:pointer;line-height:1;font-weight:700">${boardCollapsed.has(u.name)?'▶':'▼'}</button>${u.dissolved?`<span style="background:rgba(0,0,0,.4);font-size:10px;padding:1px 7px;border-radius:10px;color:#fca5a5">🏚️ 해체${u.dissolvedDate?' '+u.dissolvedDate:''}</span>`:''}${_boardCanManage()&&u.hidden?`<span style="background:rgba(0,0,0,.4);font-size:10px;padding:1px 7px;border-radius:10px">🚫 방문자 숨김</span>`:''}</div>
          </div>
          ${!forExport?`<div class="no-export" style="display:flex;flex-direction:column;gap:3px;flex-shrink:0">
            ${_boardCanManage()?`<div style="display:flex;gap:3px;flex-wrap:wrap;justify-content:flex-end">
{{ ... }
              <button onclick="event.stopPropagation();boardCardMove('${escJS(u.name)}','left')" style="background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.35);border-radius:5px;color:#fff;font-size:11px;padding:0 7px;height:22px;cursor:pointer" title="왼쪽 이동">◀</button>
              <button onclick="event.stopPropagation();boardCardMove('${escJS(u.name)}','right')" style="background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.35);border-radius:5px;color:#fff;font-size:11px;padding:0 7px;height:22px;cursor:pointer" title="오른쪽 이동">▶</button>
              <button onclick="event.stopPropagation();toggleBoardHide('${escJS(u.name)}')" style="background:${u.hidden?'rgba(239,68,68,.55)':'rgba(255,255,255,.18)'};border:1px solid ${u.hidden?'rgba(239,68,68,.8)':'rgba(255,255,255,.35)'};border-radius:5px;color:#fff;font-size:12px;padding:0 7px;height:22px;cursor:pointer" title="${u.hidden?'숨김':'표시'}">${u.hidden?'🚫':'👁️'}</button>
              <label style="background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.35);border-radius:5px;color:#fff;font-size:12px;padding:0 7px;height:22px;cursor:pointer;display:flex;align-items:center;position:relative;overflow:hidden" onclick="event.stopPropagation()" title="색상">🎨<input type="color" value="${col}" style="position:absolute;opacity:0;width:100%;height:100%;cursor:pointer;top:0;left:0" onchange="event.stopPropagation();changeBoardUnivColor('${u.name}',this.value)"></label>
              <button onclick="event.stopPropagation();adjustChampionship('${escJS(u.name)}',1)" style="background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.35);border-radius:5px;color:#fff;font-size:11px;padding:0 7px;height:22px;cursor:pointer" title="우승 추가">⭐+</button>
              <button onclick="event.stopPropagation();adjustChampionship('${escJS(u.name)}',-1)" style="background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.35);border-radius:5px;color:#fff;font-size:11px;padding:0 7px;height:22px;cursor:pointer" title="우승 제거">⭐-</button>
              ${(()=>{const _ci=univCfg.findIndex(x=>x.name===u.name);if(_ci<0)return'';return u.dissolved?`<button onclick="event.stopPropagation();univCfg[${_ci}].dissolved=false;univCfg[${_ci}].hidden=false;delete univCfg[${_ci}].dissolvedDate;save();render()" style="background:rgba(34,197,94,.35);border:1px solid rgba(134,239,172,.8);border-radius:5px;color:#fff;font-size:11px;padding:0 7px;height:22px;cursor:pointer" title="해체 복구">🔄 복구</button>`:`<button onclick="event.stopPropagation();(function(){const _i=${_ci};if(typeof openDissolveModal==='function'){openDissolveModal(_i);}else{if(!confirm('${u.name.replace(/'/g,"\\'")} 대학을 해체하시겠습니까?'))return;univCfg[_i].dissolved=true;univCfg[_i].hidden=true;univCfg[_i].dissolvedDate=new Date().toISOString().slice(0,10);save();render();}})()" style="background:rgba(234,88,12,.35);border:1px solid rgba(253,186,116,.8);border-radius:5px;color:#fff;font-size:11px;padding:0 7px;height:22px;cursor:pointer" title="대학 해체">🏚️ 해체</button>`;})()}
              <label style="background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.35);border-radius:5px;color:#fff;font-size:11px;padding:0 7px;height:22px;cursor:pointer;display:flex;align-items:center;gap:2px" onclick="event.stopPropagation()" title="배경 이미지 파일 업로드">🖼️<input type="file" accept="image/*" style="display:none" onchange="event.stopPropagation();(function(f,n){if(!f)return;const r=new FileReader();r.onload=function(e){setBoardBgImg(n,e.target.result);};r.readAsDataURL(f);})(this.files[0],'${uNameJs}')"></label>
              <button onclick="event.stopPropagation();promptBoardBgImgUrl('${uNameJs}')" style="background:${u.bgImg&&!u.bgImg.startsWith('data:')?'rgba(99,102,241,.45)':'rgba(255,255,255,.18)'};border:1px solid ${u.bgImg&&!u.bgImg.startsWith('data:')?'rgba(165,180,252,.8)':'rgba(255,255,255,.35)'};border-radius:5px;color:#fff;font-size:11px;padding:0 7px;height:22px;cursor:pointer" title="배경 이미지 URL 링크">🔗</button>
              ${u.bgImg?`<button onclick="event.stopPropagation();removeBoardBgImg('${uNameJs}')" style="background:rgba(239,68,68,.35);border:1px solid rgba(239,68,68,.6);border-radius:5px;color:#fff;font-size:11px;padding:0 7px;height:22px;cursor:pointer" title="배경 제거">🗑️</button>
              <button onclick="event.stopPropagation();setBoardBgImgSize('${uNameJs}','${_bgSize==='cover'?'contain':(_bgSize==='contain'?'auto':'cover')}')" style="background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.35);border-radius:5px;color:#fff;font-size:10px;padding:0 6px;height:22px;cursor:pointer" title="${_bgSize==='cover'?'맞추기(contain)':(_bgSize==='contain'?'자동(auto)':'채우기(cover)')}">${_bgSize==='cover'?'↔맞추기':(_bgSize==='contain'?'🪄자동':'⬛채우기')}</button>
              ${_bgPosGrid}`:''}
            </div>`:''}
          </div>`:''}
        </div>
      </div>
      <div class="brd-sep" style="background:${hexToRgba(col,.25)}"></div>
      <div class="brd-card-body brd-body" style="background:${u.bgImg?'transparent':toPastel(col,Math.max(0.3, 0.88 - b2BgAlpha * 0.01))};overflow:hidden;position:relative;${boardCollapsed.has(u.name)?'display:none':''}">${u.bgImg?`<div class="brd-bg-layer" data-bg-src="${String(u.bgImg).replace(/"/g,'&quot;')}" data-bg-size-mode="${_bgSize}" style="position:absolute;inset:0;background:url('${String(u.bgImg).replace(/'/g,'%27')}') ${u.bgImgPos||'center center'}/${_bgSize==='auto'?'cover':_bgSize} no-repeat;opacity:0.35;pointer-events:none;z-index:0"></div>`:''}<div style="position:relative;z-index:1;background:${u.bgImg?'rgba(255,255,255,0.75)':'transparent'};min-height:100%">${(()=>{
        const _memo=u.memo||'';
        const _imgs=(u.memoImgs||[]).length?u.memoImgs:(u.memoImg?[u.memoImg]:[]);
        const _uname=u.name.replace(/'/g,"\\'").replace(/"/g,'&quot;');
        const panelStyle=`border-radius:10px;padding:8px;background:rgba(255,255,255,.25);border:1px solid rgba(255,255,255,.45);backdrop-filter:blur(8px);box-shadow:0 2px 12px rgba(0,0,0,.1)`;
        // 사이드 패널 (PC only, .brd-side-panel 클래스로 모바일 숨김)
        let sidePanelHtml='';
        if(_boardCanManage()&&!forExport){
          const imgList=_imgs.map((src,i)=>`<div style="position:relative;margin-bottom:5px">
            <img src="${src}" style="width:100%;border-radius:7px;display:block" onerror="this.style.display='none'">
            <button onclick="event.stopPropagation();removeBoardMemoImg('${_uname}',${i})" style="position:absolute;top:3px;right:3px;font-size:9px;background:rgba(239,68,68,.75);border:none;border-radius:4px;padding:1px 5px;color:#fff;cursor:pointer">✕</button>
          </div>`).join('');
          sidePanelHtml=`<div class="brd-side-panel no-export" style="${panelStyle}">
            ${imgList}
            <textarea placeholder="📝 사이드 메모..." rows="2" style="width:100%;box-sizing:border-box;border:1px solid rgba(255,255,255,.55);border-radius:7px;padding:4px 6px;font-size:11px;background:rgba(255,255,255,.45);resize:none;outline:none;font-family:inherit;color:#222;margin-top:${_imgs.length?'2px':'0'}" onmousedown="event.stopPropagation()" onclick="event.stopPropagation()" onchange="setBoardMemo('${_uname}',this.value)" onblur="setBoardMemo('${_uname}',this.value)">${_memo}</textarea>
            <div style="display:flex;gap:4px;margin-top:4px">
              <label style="display:inline-flex;align-items:center;gap:2px;cursor:pointer;font-size:10px;font-weight:700;background:rgba(255,255,255,.6);border:1px solid rgba(255,255,255,.65);border-radius:5px;padding:2px 6px" onclick="event.stopPropagation()" title="파일 업로드">🖼️ 업로드<input type="file" accept="image/*" style="display:none" onchange="event.stopPropagation();(function(f,n){if(!f)return;const r=new FileReader();r.onload=function(e){addBoardMemoImg(n,e.target.result);};r.readAsDataURL(f);})(this.files[0],'${_uname}')"></label>
              <button onclick="event.stopPropagation();promptBoardMemoImgUrl('${_uname}')" style="display:inline-flex;align-items:center;gap:2px;cursor:pointer;font-size:10px;font-weight:700;background:rgba(255,255,255,.6);border:1px solid rgba(255,255,255,.65);border-radius:5px;padding:2px 6px" title="이미지 URL 링크">🔗 링크</button>
            </div>
          </div>`;
        } else if(!forExport&&(_memo||_imgs.length)){
          const imgList=_imgs.map(src=>`<img src="${src}" style="width:100%;border-radius:7px;margin-bottom:5px;display:block" onerror="this.style.display='none'">`).join('');
          sidePanelHtml=`<div class="brd-side-panel no-export" style="${panelStyle}">${imgList}${_memo?`<div style="font-size:11px;color:#333;white-space:pre-wrap;line-height:1.5;margin-top:${_imgs.length?'4px':'0'}">${_memo}</div>`:''}</div>`;
        }
        // 하단 메모 (bMemo + bMemoImgs 배열)
        const _bnote=u.bMemo||'';
        const _bimgs=(u.bMemoImgs||[]).concat(u.bMemoImg?[u.bMemoImg]:[]);
        let bottomHtml='';
        if(_boardCanManage()&&!forExport){
          const imgList=_bimgs.map((src,i)=>`<div style="display:inline-flex;flex-direction:column;gap:3px;margin-right:6px;vertical-align:top">
            <img src="${src}" class="brd-bottom-section-img" style="max-width:130px;max-height:110px;object-fit:contain;border-radius:8px;display:block" onerror="this.style.display='none'">
            <button onclick="event.stopPropagation();removeBoardNoteImg('${_uname}',${i})" style="font-size:10px;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.25);border-radius:5px;padding:2px 6px;color:#dc2626;cursor:pointer">🗑️ 삭제</button>
          </div>`).join('');
          bottomHtml=`<div style="margin-top:8px;padding-top:8px;border-top:1px solid rgba(0,0,0,.08);display:flex;flex-direction:column;gap:5px">
            ${imgList?`<div style="display:flex;flex-wrap:wrap;gap:4px">${imgList}</div>`:''}
            <textarea placeholder="📋 하단 메모 입력..." rows="2" style="width:100%;box-sizing:border-box;border:1px solid rgba(0,0,0,.12);border-radius:7px;padding:5px 8px;font-size:11px;background:rgba(255,255,255,.55);resize:none;outline:none;font-family:inherit;color:#222" onmousedown="event.stopPropagation()" onclick="event.stopPropagation()" onchange="setBoardNote('${_uname}',this.value)" onblur="setBoardNote('${_uname}',this.value)">${_bnote}</textarea>
            <div style="display:flex;gap:5px;align-items:center">
              <label style="display:inline-flex;align-items:center;gap:3px;cursor:pointer;font-size:11px;font-weight:700;background:rgba(255,255,255,.7);border:1px solid rgba(0,0,0,.12);border-radius:6px;padding:3px 8px" onclick="event.stopPropagation()" title="파일 업로드">🖼️ 업로드<input type="file" accept="image/*" style="display:none" onchange="event.stopPropagation();(function(f,n){if(!f)return;const r=new FileReader();r.onload=function(e){addBoardNoteImg(n,e.target.result);};r.readAsDataURL(f);})(this.files[0],'${_uname}')"></label>
              <button onclick="event.stopPropagation();promptBoardNoteImgUrl('${_uname}')" style="display:inline-flex;align-items:center;gap:3px;cursor:pointer;font-size:11px;font-weight:700;background:rgba(255,255,255,.7);border:1px solid rgba(0,0,0,.12);border-radius:6px;padding:3px 8px" title="이미지 URL 링크">🔗 링크</button>
            </div>
          </div>`;
        } else if(_bnote||_bimgs.length){
          const imgList=_bimgs.map(src=>`<img src="${src}" class="brd-bottom-section-img" style="max-width:130px;max-height:110px;object-fit:contain;border-radius:8px;display:block" onerror="this.style.display='none'">`).join('');
          bottomHtml=`<div style="margin-top:8px;padding:8px;border-radius:8px;background:rgba(255,255,255,.35)">${imgList?`<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:${_bnote?'6px':'0'}">${imgList}</div>`:''}${_bnote?`<div style="font-size:12px;color:#333;white-space:pre-wrap;line-height:1.6">${_bnote}</div>`:''}</div>`;
        }
        const mainLayout=`<div style="overflow:hidden">${sidePanelHtml}${roleSection}${tierRows}</div>`;
        return `<div style="position:relative;z-index:1">${mainLayout}${bottomHtml}</div>`;
      })()}</div></div>
    </div>`;
  };

  // 항상 칩 레이아웃 사용 (무소속은 wide)
  return buildChipLayout(u.name==='무소속');
}

function _brdToast(msg, duration=2800){
  const existing = document.getElementById('brd-toast');
  if(existing) existing.remove();
  const el = document.createElement('div');
  el.id = 'brd-toast';
  el.textContent = msg;
  el.style.cssText = 'position:fixed;bottom:28px;left:50%;transform:translateX(-50%) translateY(20px);background:#1e293b;color:#fff;padding:10px 20px;border-radius:10px;font-size:13px;font-weight:600;z-index:9999;box-shadow:0 4px 20px rgba(0,0,0,.3);opacity:0;transition:opacity .25s,transform .25s;pointer-events:none;font-family:\'Noto Sans KR\',sans-serif;';
  document.body.appendChild(el);
  requestAnimationFrame(()=>{
    el.style.opacity='1'; el.style.transform='translateX(-50%) translateY(0)';
  });
  setTimeout(()=>{
    el.style.opacity='0'; el.style.transform='translateX(-50%) translateY(10px)';
    setTimeout(()=>el.remove(), 300);
  }, duration);
}

/* ── 선수 이동 팝업 ── */
let _brdPopup = null;
let _brdPopupListenerAdded = false;
function _closeBrdPopup(e){
  if(!_brdPopup) return;
  if(!_brdPopup.contains(e.target)){
    _brdClose();
  }
}
// 중앙화된 팝업 닫기 - 딤 오버레이 포함 항상 정리
// 현황판 칩 클릭 시 랜덤 스트리머 상세 열기
function openRandomPlayerModal(){
  const eligible = (window.players||[]).filter(p=>p&&p.name&&!p.hidden&&!p.retired);
  if(!eligible.length) return;
  const pick = eligible[Math.floor(Math.random()*eligible.length)];
  openPlayerModal(pick.name);
}

function _brdClose(){
  if(_brdPopup){ _brdPopup.remove(); _brdPopup=null; }
  const dim=document.getElementById('brd-popup-dim');
  if(dim) dim.remove();
}

// 칩 전용 팝업 (무소속 등 칩 레이아웃) - 위/아래 이동 대신 대학이동 위주
function openBrdPlayerPopupFromChip(e, playerName, univName, idx, total){
  if(!_boardCanManage()){ openRandomPlayerModal(); return; }
  e.stopPropagation();
  _brdClose();
  const allUnivs = _getBoardUnivs();
  const p = players.find(x=>x.name===playerName);
  if(!p) return;

  const popup = document.createElement('div');
  popup.className = 'brd-move-popup';
  _brdPopup = popup;

  const otherUnivs = allUnivs.filter(u=>u.name!==univName&&!u.dissolved);
  const univOpts = otherUnivs.map(u=>`<option value="${u.name}">${u.name}</option>`).join('');
  const _pnSafeChip = playerName.replace(/[^a-zA-Z0-9가-힣]/g,'');
  const pNameJs = (typeof escJS==='function')
    ? escJS(playerName)
    : String(playerName||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\r/g,'\\r').replace(/\n/g,'\\n');
  const uNameJs = (typeof escJS==='function')
    ? escJS(univName)
    : String(univName||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\r/g,'\\r').replace(/\n/g,'\\n');
  const pNameHtml = (typeof window.escHTML==='function') ? window.escHTML(playerName) : String(playerName||'');
  const uNameHtml = (typeof window.escHTML==='function') ? window.escHTML(univName) : String(univName||'');
  const _tierIdxChip = TIERS.indexOf(p.tier||'미정');
  const _prevTierChip = _tierIdxChip > 0 ? TIERS[_tierIdxChip-1] : null;
  const _nextTierChip = _tierIdxChip < TIERS.length-1 ? TIERS[_tierIdxChip+1] : null;

  popup.innerHTML = `
    <div class="brd-move-popup-title">👤 ${pNameHtml} <span style="font-size:10px;font-weight:400">(${uNameHtml})</span></div>
    <div style="padding:5px 6px 8px;border-bottom:1px solid var(--border)">
      <div style="font-size:10px;font-weight:700;color:var(--text3);margin-bottom:4px">🎭 상태 아이콘 <span style="margin-left:4px">${getStatusIconHTML(playerName)||''}</span></div>
      <div style="display:flex;flex-wrap:wrap;gap:2px;max-height:90px;overflow-y:auto" id="brd-icon-grid-${_pnSafeChip}">
        ${(()=>{const _ci=getStatusIcon(playerName);return Object.entries(STATUS_ICON_DEFS).map(([id,d])=>{const sel=(id==='none'&&!_ci)||(d.emoji&&_ci===d.emoji);const inner=d.emoji?(_siIsImg(d.emoji)?_siRender(d.emoji,'15px'):d.emoji):'<span style="font-size:9px">없음</span>';return `<button type="button" title="${d.label.replace(/"/g,'&quot;')}" onclick="setBrdStatusIcon(this,'${pNameJs}','${id}')" data-icon-id="${id}" style="padding:2px 5px;border-radius:4px;border:2px solid ${sel?'#16a34a':'var(--border)'};background:${sel?'#dcfce7':'var(--white)'};cursor:pointer;font-size:${id==='none'?'9px':'12px'};min-width:26px;display:inline-flex;align-items:center;justify-content:center">${inner}</button>`;}).join('');})()}
      </div>
    </div>
    <div class="brd-move-popup-sep"></div>
    <div style="padding:4px 6px 6px;font-size:11px;font-weight:700;color:var(--text3)">🏷️ 직책 수정</div>
    <div style="display:flex;gap:4px;flex-wrap:wrap;padding:0 6px 4px">
      ${['이사장','동아리 회장','총장','부총장','총괄','교수','코치'].map(r=>`<button class="btn btn-xs ${p.role===r?'btn-b':'btn-w'}" onclick="setBrdRole('${pNameJs}','${r}')" style="font-size:10px">${r}</button>`).join('')}
      <button class="btn btn-xs btn-w" onclick="setBrdRole('${pNameJs}','')" style="font-size:10px;color:#dc2626">해제</button>
    </div>
    <div style="display:flex;gap:4px;padding:0 6px 4px;align-items:center">
      <input id="brd-role-chip-${_pnSafeChip}" type="text" placeholder="직접 입력..." style="flex:1;padding:4px 7px;border-radius:6px;border:1px solid var(--border2);font-size:11px">
      <button class="btn btn-b btn-xs" onclick="(function(){const inp=document.getElementById('brd-role-chip-${_pnSafeChip}');if(inp&&inp.value.trim())setBrdRole('${pNameJs}',inp.value.trim())})()">설정</button>
    </div>
    ${univName!=='무소속'?`<button onclick="const p=players.find(x=>x.name==='${pNameJs}');if(p){const from=p.univ;p.univ='무소속';delete p.role;if(boardPlayerOrder[from])boardPlayerOrder[from]=boardPlayerOrder[from].filter(n=>n!=='${pNameJs}');save();_brdClose();_refreshBoardCard(from);_refreshBoardCard('무소속');_brdToast('🚶 무소속으로 이동 완료');}" style="width:calc(100% - 12px);margin:0 6px 6px;padding:5px;border-radius:6px;border:1.5px solid #cbd5e1;background:#f8fafc;font-size:11px;font-weight:700;cursor:pointer;color:#475569">🚶 무소속으로 이동</button>`:``}
    <div class="brd-move-popup-sep"></div>
    <div style="padding:4px 6px 2px;font-size:11px;font-weight:700;color:var(--text3)">⭐ 티어</div>
    <div style="display:flex;align-items:center;gap:5px;padding:3px 6px 8px">
      <button onclick="${_prevTierChip?`setBrdTier('${pNameJs}','${_prevTierChip}')`:'void 0'}" ${!_prevTierChip?'disabled':''} style="padding:3px 10px;border-radius:6px;border:1px solid var(--border2);background:var(--surface);font-size:12px;font-weight:700;cursor:pointer;opacity:${!_prevTierChip?'.3':'1'}">▲</button>
      <span style="flex:1;text-align:center;font-size:13px;font-weight:800;color:var(--text)">${p.tier||'미정'}</span>
      <button onclick="${_nextTierChip?`setBrdTier('${pNameJs}','${_nextTierChip}')`:'void 0'}" ${!_nextTierChip?'disabled':''} style="padding:3px 10px;border-radius:6px;border:1px solid var(--border2);background:var(--surface);font-size:12px;font-weight:700;cursor:pointer;opacity:${!_nextTierChip?'.3':'1'}">▼</button>
    </div>
    <div class="brd-move-popup-sep"></div>
    <div style="padding:4px 6px 6px;font-size:11px;font-weight:700;color:var(--text3)">🏫 다른 대학으로 이동</div>
    <div style="display:flex;gap:6px;padding:0 6px 6px">
      <select id="brd-chip-univ-target" style="flex:1;padding:5px 8px;border-radius:7px;border:1px solid var(--border2);font-size:12px;background:var(--white)">${univOpts||'<option disabled>대학 없음</option>'}</select>
      <button class="btn btn-b btn-xs" onclick="boardTransferPlayerFromChip('${pNameJs}','${uNameJs}')">이동</button>
    </div>
    <div class="brd-move-popup-sep"></div>
    <div style="padding:4px 6px 6px">
      <div style="font-size:10px;font-weight:700;color:var(--text3);margin-bottom:4px">🖼️ 프로필 이미지</div>
      <div style="display:flex;gap:4px">
        <input id="brd-photo-chip-${_pnSafeChip}" type="text" placeholder="이미지 URL 입력..." value="${(p.photo||'').replace(/"/g,'&quot;')}" style="flex:1;padding:3px 7px;border-radius:6px;border:1px solid var(--border2);font-size:11px">
        <button class="btn btn-b btn-xs" onclick="setBrdPhoto('${pNameJs}',document.getElementById('brd-photo-chip-${_pnSafeChip}').value)">저장</button>
      </div>
      ${p.photo?`<button onclick="setBrdPhoto('${pNameJs}','')" style="margin-top:3px;width:100%;padding:2px;border-radius:5px;border:1px solid #fca5a5;background:#fff1f2;font-size:10px;font-weight:700;cursor:pointer;color:#dc2626">🗑️ 이미지 삭제</button>`:''}
    </div>
    <div class="brd-move-popup-sep"></div>
    <div style="padding:4px 6px 6px">
      <div style="font-size:10px;font-weight:700;color:var(--text3);margin-bottom:5px">🔧 상태</div>
      <div style="display:flex;gap:4px">
        <button onclick="(function(){const p=players.find(x=>x.name==='${pNameJs}');if(!p)return;p.retired=!p.retired;save();_brdClose();render();_brdToast(p.retired?'🎗️ 은퇴 처리됨':'↩️ 은퇴 해제됨');})()" style="flex:1;padding:5px;border-radius:6px;border:1.5px solid ${p.retired?'#6b7280':'#e2e8f0'};background:${p.retired?'#f1f5f9':'var(--white)'};font-size:11px;font-weight:700;cursor:pointer;color:${p.retired?'#374151':'#64748b'}">🎗️ ${p.retired?'은퇴 해제':'은퇴'}</button>
        <button onclick="(function(){const p=players.find(x=>x.name==='${pNameJs}');if(!p)return;p.hidden=!p.hidden;save();_brdClose();render();_brdToast(p.hidden?'🚫 현황판에서 숨김':'👁️ 현황판에 표시됨');})()" style="flex:1;padding:5px;border-radius:6px;border:1.5px solid ${p.hidden?'#f87171':'#e2e8f0'};background:${p.hidden?'#fff1f2':'var(--white)'};font-size:11px;font-weight:700;cursor:pointer;color:${p.hidden?'#dc2626':'#64748b'}">🚫 ${p.hidden?'숨김 해제':'현황판 숨기기'}</button>
      </div>
    </div>
    <button class="brd-move-popup-btn" onclick="_brdClose();openPlayerModal('${pNameJs}')">👤 스트리머 상세 보기</button>
  `;

  document.body.appendChild(popup);
  const isMobChip = window.innerWidth <= 768;
  if(isMobChip){
    const dim = document.createElement('div');
    dim.id = 'brd-popup-dim';
    dim.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,.45);z-index:4999;backdrop-filter:blur(2px)';
    dim.onclick = () => { dim.remove(); _brdClose(); };
    document.body.insertBefore(dim, popup);
    popup.style.zIndex = '5000';
  } else {
  const targetEl = e.target.closest('.brd-chip');
  const rect = targetEl?.getBoundingClientRect() || {left:e.clientX, top:e.clientY, width:0, height:0};
  let left = rect.right + 6;
  let top = rect.top;
  const pw=240, ph=300;
  if(left + pw > window.innerWidth) left = rect.left - pw - 6;
  if(top + ph > window.innerHeight) top = window.innerHeight - ph - 10;
  if(top < 8) top = 8;
  popup.style.left = left + 'px';
  popup.style.top = top + 'px';
  }
}

function boardTransferPlayerFromChip(playerName, fromUniv){
  if(!_boardCanManage()){ alert('총관리자만 이동할 수 있습니다.'); return; }
  const sel = document.getElementById('brd-chip-univ-target');
  const toUniv = sel?.value;
  if(!toUniv || toUniv===fromUniv){ alert('이동할 대학을 선택하세요.'); return; }
  _brdClose();
  const p = players.find(x=>x.name===playerName);
  if(!p) return;
  if(!confirm(`"${playerName}"을(를) "${fromUniv}" → "${toUniv}"로 이동하시겠습니까?`)) return;
  p.prevUniv = fromUniv; p.transferDate = new Date().toISOString().slice(0,10);
  p.univ = toUniv;
  if(boardPlayerOrder[fromUniv]){
    boardPlayerOrder[fromUniv] = boardPlayerOrder[fromUniv].filter(n=>n!==playerName);
  }
  save(); saveBoardPlayerOrder();
  _refreshBoardCard(fromUniv);
  _refreshBoardCard(toUniv);
  _brdToast(`✅ "${playerName}" → "${toUniv}" 이동 완료`);
}


function openBrdPlayerPopup(e, playerName, univName, idx, total){
  // 비관리자는 팝업 없이 랜덤 스트리머 상세 열기
  if(!_boardCanManage()){ openRandomPlayerModal(); return; }

  e.stopPropagation();
  _brdClose();
  const allUnivs = _getBoardUnivs();
  const p = players.find(x=>x.name===playerName);
  if(!p) return;

  const popup = document.createElement('div');
  popup.className = 'brd-move-popup';
  _brdPopup = popup;

  const otherUnivs = allUnivs.filter(u=>u.name!==univName&&!u.dissolved);
  const univOpts = otherUnivs.map(u=>`<option value="${u.name}">${u.name}</option>`).join('');

  const _pnSafe = playerName.replace(/[^a-zA-Z0-9가-힣]/g,'');
  const pNameJs = (typeof escJS==='function')
    ? escJS(playerName)
    : String(playerName||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\r/g,'\\r').replace(/\n/g,'\\n');
  const uNameJs = (typeof escJS==='function')
    ? escJS(univName)
    : String(univName||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\r/g,'\\r').replace(/\n/g,'\\n');
  const pNameHtml = (typeof window.escHTML==='function') ? window.escHTML(playerName) : String(playerName||'');
  const uNameHtml = (typeof window.escHTML==='function') ? window.escHTML(univName) : String(univName||'');
  const _curIcon = getStatusIcon(playerName);
  const _tierIdx = TIERS.indexOf(p.tier||'미정');
  const _prevTier = _tierIdx > 0 ? TIERS[_tierIdx-1] : null;
  const _nextTier = _tierIdx < TIERS.length-1 ? TIERS[_tierIdx+1] : null;
  popup.innerHTML = `
    <div style="padding:8px 10px 6px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;gap:6px">
      <div style="font-size:12px;font-weight:800;color:var(--text)">👤 ${pNameHtml} <span style="font-size:10px;font-weight:500;color:var(--text3)">(${uNameHtml})</span></div>
      <button onclick="_brdClose()" style="background:none;border:none;color:var(--gray-l);font-size:14px;cursor:pointer;padding:0 2px;line-height:1">✕</button>
    </div>
    <div style="display:flex;gap:4px;padding:6px 8px;border-bottom:1px solid var(--border)">
      <button onclick="boardMovePlayer('${pNameJs}','${uNameJs}','top')" title="맨 위로" ${idx===0?'disabled':''} style="flex:1;padding:4px;border-radius:6px;border:1px solid var(--border2);background:var(--surface);font-size:16px;cursor:pointer;opacity:${idx===0?'.3':'1'}">⬆️</button>
      <button onclick="boardMovePlayer('${pNameJs}','${uNameJs}','up')" title="위로" ${idx===0?'disabled':''} style="flex:1;padding:4px;border-radius:6px;border:1px solid var(--border2);background:var(--surface);font-size:16px;cursor:pointer;opacity:${idx===0?'.3':'1'}">🔼</button>
      <button onclick="boardMovePlayer('${pNameJs}','${uNameJs}','down')" title="아래로" ${idx>=total-1?'disabled':''} style="flex:1;padding:4px;border-radius:6px;border:1px solid var(--border2);background:var(--surface);font-size:16px;cursor:pointer;opacity:${idx>=total-1?'.3':'1'}">🔽</button>
      <button onclick="boardMovePlayer('${pNameJs}','${uNameJs}','bottom')" title="맨 아래로" ${idx>=total-1?'disabled':''} style="flex:1;padding:4px;border-radius:6px;border:1px solid var(--border2);background:var(--surface);font-size:16px;cursor:pointer;opacity:${idx>=total-1?'.3':'1'}">⬇️</button>
    </div>
    <div style="padding:5px 8px;border-bottom:1px solid var(--border)">
      <div style="font-size:10px;font-weight:700;color:var(--text3);margin-bottom:4px">🏷️ 직책</div>
      <div style="display:flex;gap:3px;flex-wrap:wrap">
        ${['이사장','동아리 회장','총장','총괄','교수','코치'].map(r=>`<button class="btn btn-xs ${p.role===r?'btn-b':'btn-w'}" onclick="setBrdRole('${pNameJs}','${r}')" style="font-size:10px;padding:2px 7px">${r}</button>`).join('')}
        <button class="btn btn-xs btn-w" onclick="setBrdRole('${pNameJs}','')" style="font-size:10px;padding:2px 7px;color:#dc2626">해제</button>
      </div>
      <div style="display:flex;gap:4px;margin-top:4px">
        <input id="brd-role-custom-${_pnSafe}" type="text" placeholder="직접 입력..." style="flex:1;padding:3px 7px;border-radius:6px;border:1px solid var(--border2);font-size:11px">
        <button class="btn btn-b btn-xs" onclick="(function(){const inp=document.getElementById('brd-role-custom-${_pnSafe}');if(inp&&inp.value.trim())setBrdRole('${pNameJs}',inp.value.trim())})()" style="font-size:11px">설정</button>
      </div>
      ${univName!=='무소속'?`<button onclick="const p=players.find(x=>x.name==='${pNameJs}');if(p){const from=p.univ;p.univ='무소속';delete p.role;if(boardPlayerOrder[from])boardPlayerOrder[from]=boardPlayerOrder[from].filter(n=>n!=='${pNameJs}');save();_brdClose();_refreshBoardCard(from);_refreshBoardCard('무소속');_brdToast('🚶 무소속으로 이동 완료');}" style="width:100%;margin-top:5px;padding:4px;border-radius:6px;border:1.5px solid #cbd5e1;background:#f8fafc;font-size:11px;font-weight:700;cursor:pointer;color:#475569">🚶 무소속으로 이동</button>`:''}
    </div>
    <div style="padding:5px 8px;border-bottom:1px solid var(--border)">
      <div style="font-size:10px;font-weight:700;color:var(--text3);margin-bottom:4px">⭐ 티어</div>
      <div style="display:flex;align-items:center;gap:5px">
        <button onclick="${_prevTier?`setBrdTier('${pNameJs}','${_prevTier}')`:'void 0'}" ${!_prevTier?'disabled':''} style="padding:3px 10px;border-radius:6px;border:1px solid var(--border2);background:var(--surface);font-size:12px;font-weight:700;cursor:pointer;opacity:${!_prevTier?'.3':'1'}">▲</button>
        <span style="flex:1;text-align:center;font-size:13px;font-weight:800;color:var(--text)">${p.tier||'미정'}</span>
        <button onclick="${_nextTier?`setBrdTier('${pNameJs}','${_nextTier}')`:'void 0'}" ${!_nextTier?'disabled':''} style="padding:3px 10px;border-radius:6px;border:1px solid var(--border2);background:var(--surface);font-size:12px;font-weight:700;cursor:pointer;opacity:${!_nextTier?'.3':'1'}">▼</button>
      </div>
    </div>
    <div style="padding:5px 8px;border-bottom:1px solid var(--border)">
      <div style="font-size:10px;font-weight:700;color:var(--text3);margin-bottom:4px">🎭 상태 아이콘</div>
      <div style="display:flex;flex-wrap:wrap;gap:3px" id="brd-icon-grid-${_pnSafe}">
        ${Object.entries(STATUS_ICON_DEFS).map(([id,d])=>{const sel=(id==='none'&&!_curIcon)||(d.emoji&&_curIcon===d.emoji);const inner=d.emoji?(_siIsImg(d.emoji)?_siRender(d.emoji,'16px'):d.emoji):'<span style="font-size:10px">없음</span>';return `<button type="button" title="${d.label}" onclick="setBrdStatusIcon(this,'${pNameJs}','${id}')" data-icon-id="${id}" style="padding:3px 6px;border-radius:5px;border:2px solid ${sel?'#16a34a':'var(--border)'};background:${sel?'#dcfce7':'var(--white)'};cursor:pointer;font-size:${id==='none'?'10px':'13px'};min-width:28px;transition:.1s;display:inline-flex;align-items:center;justify-content:center">${inner}</button>`;}).join('')}
      </div>
      <div style="display:flex;gap:3px;margin-top:5px;align-items:center">
        <input id="brd-si-url-${_pnSafe}" type="text" placeholder="🔗 이미지 URL 입력" style="flex:1;padding:3px 7px;border-radius:5px;border:1px solid var(--border2);font-size:11px" oninput="_brdSiPreview('${_pnSafe}',this.value)">
        <span id="brd-si-prev-${_pnSafe}" style="width:22px;height:22px;display:inline-flex;align-items:center;justify-content:center;border:1px solid var(--border);border-radius:5px;background:var(--white);font-size:14px;flex-shrink:0"></span>
        <button class="btn btn-b btn-xs" onclick="_brdAddCustomIcon('${_pnSafe}','${pNameJs}')">추가</button>
      </div>
    </div>
    <div style="padding:5px 8px;border-bottom:1px solid var(--border)">
      <div style="font-size:10px;font-weight:700;color:var(--text3);margin-bottom:4px">🖼️ 프로필 이미지</div>
      <div style="display:flex;gap:4px">
        <input id="brd-photo-${_pnSafe}" type="text" placeholder="이미지 URL 입력..." value="${(p.photo||'').replace(/"/g,'&quot;')}" style="flex:1;padding:3px 7px;border-radius:6px;border:1px solid var(--border2);font-size:11px">
        <button class="btn btn-b btn-xs" onclick="setBrdPhoto('${pNameJs}',document.getElementById('brd-photo-${_pnSafe}').value)">저장</button>
      </div>
      ${p.photo?`<button onclick="setBrdPhoto('${pNameJs}','')" style="margin-top:3px;width:100%;padding:2px;border-radius:5px;border:1px solid #fca5a5;background:#fff1f2;font-size:10px;font-weight:700;cursor:pointer;color:#dc2626">🗑️ 이미지 삭제</button>`:''}
    </div>
    <div style="padding:5px 8px;border-bottom:1px solid var(--border)">
      <div style="font-size:10px;font-weight:700;color:var(--text3);margin-bottom:4px">🏫 대학 이동</div>
      <div style="display:flex;gap:4px">
        <select id="brd-univ-target" style="flex:1;padding:4px 8px;border-radius:6px;border:1px solid var(--border2);font-size:12px;background:var(--white)">${univOpts||'<option disabled>대학 없음</option>'}</select>
        <button class="btn btn-b btn-xs" onclick="boardTransferPlayer('${pNameJs}','${uNameJs}')">이동</button>
      </div>
    </div>
    <div style="padding:5px 8px;border-bottom:1px solid var(--border)">
      <div style="font-size:10px;font-weight:700;color:var(--text3);margin-bottom:5px">🔧 상태</div>
      <div style="display:flex;gap:4px">
        <button onclick="(function(){const p=players.find(x=>x.name==='${pNameJs}');if(!p)return;p.retired=!p.retired;save();_brdClose();render();_brdToast(p.retired?'🎗️ 은퇴 처리됨':'↩️ 은퇴 해제됨');})()" style="flex:1;padding:5px;border-radius:6px;border:1.5px solid ${p.retired?'#6b7280':'#e2e8f0'};background:${p.retired?'#f1f5f9':'var(--white)'};font-size:11px;font-weight:700;cursor:pointer;color:${p.retired?'#374151':'#64748b'}">🎗️ ${p.retired?'은퇴 해제':'은퇴'}</button>
        <button onclick="(function(){const p=players.find(x=>x.name==='${pNameJs}');if(!p)return;p.hidden=!p.hidden;save();_brdClose();render();_brdToast(p.hidden?'🚫 현황판에서 숨김':'👁️ 현황판에 표시됨');})()" style="flex:1;padding:5px;border-radius:6px;border:1.5px solid ${p.hidden?'#f87171':'#e2e8f0'};background:${p.hidden?'#fff1f2':'var(--white)'};font-size:11px;font-weight:700;cursor:pointer;color:${p.hidden?'#dc2626':'#64748b'}">🚫 ${p.hidden?'숨김 해제':'현황판 숨기기'}</button>
      </div>
    </div>
    <div style="display:flex;gap:4px;padding:6px 8px">
      <button style="flex:1;padding:6px;border-radius:7px;border:none;background:#2563eb;color:#fff;font-size:11px;font-weight:800;cursor:pointer;font-family:'Noto Sans KR',sans-serif" onclick="_brdClose();_refreshBoardCard('${uNameJs}');save();_brdToast('✅ 저장 완료')">💾 저장</button>
      <button style="flex:1;padding:6px;border-radius:7px;border:1px solid var(--border2);background:var(--surface);color:var(--text);font-size:11px;font-weight:600;cursor:pointer;font-family:'Noto Sans KR',sans-serif" onclick="_brdClose();openPlayerModal('${pNameJs}')">📋 상세</button>
    </div>
  `;

  document.body.appendChild(popup);

  // 모바일에서는 딤 오버레이 + 하단 시트, PC에서는 기존 위치 계산
  const isMob = window.innerWidth <= 768;
  if(isMob){
    // 딤 오버레이 생성
    const dim = document.createElement('div');
    dim.id = 'brd-popup-dim';
    dim.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,.45);z-index:4999;backdrop-filter:blur(2px)';
    dim.onclick = () => { dim.remove(); _brdClose(); };
    document.body.insertBefore(dim, popup);
    popup.style.zIndex = '5000';
  } else {
  // 위치 계산 - 클릭 대상이 brd-row 또는 brd-chip 어느 것이든 처리
  const targetEl = e.target.closest('.brd-row, .brd-chip');
  const rect = targetEl?.getBoundingClientRect() || {left:e.clientX, top:e.clientY, width:0, height:0};
  let left = rect.left + rect.width + 6;
  let top = rect.top;
  const pw=256, ph=420;
  if(left + pw > window.innerWidth) left = rect.left - pw - 6;
  if(top + ph > window.innerHeight) top = window.innerHeight - ph - 10;
  if(top < 8) top = 8;
  popup.style.left = left + 'px';
  popup.style.top = top + 'px';
  }
}

function setBrdTier(playerName, newTier){
  const p=players.find(x=>x.name===playerName);
  if(!p)return;
  p.tier=newTier;
  save();
  _brdClose();
  _refreshBoardCard(p.univ);
  _brdToast('⭐ 티어 변경: '+newTier);
}
function setBrdRole(playerName, role){
  const p=players.find(x=>x.name===playerName);
  if(!p)return;
  p.role=role||undefined;
  // 직책 변경 시 해당 대학의 수동 순서 초기화 → 직책 기준 자동 정렬
  if(boardPlayerOrder[p.univ]){
    delete boardPlayerOrder[p.univ];
    saveBoardPlayerOrder();
  }
  save();
  _brdClose();
  _refreshBoardCard(p.univ);
}
function setBrdPhoto(playerName, url){
  const p=players.find(x=>x.name===playerName);
  if(!p)return;
  const trimmed=url.trim();
  if(trimmed) p.photo=trimmed; else delete p.photo;
  _brdPhotoCacheSet(playerName, trimmed); // 캐시 갱신
  save();
  _refreshBoardCard(p.univ);
  _brdToast(trimmed?'🖼️ 프로필 이미지 저장 완료':'🗑️ 프로필 이미지 삭제');
}
function _brdSiPreview(pnSafe, v){
  const el = document.getElementById('brd-si-prev-'+pnSafe);
  if(!el) return;
  el.innerHTML = v && (v.startsWith('http')||v.startsWith('data:'))
    ? `<img src="${v}" style="width:18px;height:18px;object-fit:contain" onerror="this.style.display='none'">`
    : v;
}
function _brdAddCustomIcon(pnSafe, playerName){
  const urlEl = document.getElementById('brd-si-url-'+pnSafe);
  if(!urlEl || !urlEl.value.trim()) return;
  const pnJs = (typeof escJS==='function')
    ? escJS(playerName)
    : String(playerName||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\r/g,'\\r').replace(/\n/g,'\\n');
  addCustomStatusIcon('커스텀', urlEl.value.trim());
  urlEl.value = '';
  const prev = document.getElementById('brd-si-prev-'+pnSafe);
  if(prev) prev.innerHTML = '';
  // 그리드 갱신
  const grid = document.getElementById('brd-icon-grid-'+pnSafe);
  if(!grid) return;
  const _curIcon = playerStatusIcons[playerName] || '';
  grid.innerHTML = Object.entries(STATUS_ICON_DEFS).map(([id,d])=>{
    const sel=(id==='none'&&!_curIcon)||(d.emoji&&_curIcon===d.emoji);
    const inner=d.emoji?(_siIsImg(d.emoji)?_siRender(d.emoji,'16px'):d.emoji):'<span style="font-size:10px">없음</span>';
    return `<button type="button" title="${d.label}" onclick="setBrdStatusIcon(this,'${pnJs}','${id}')" data-icon-id="${id}" style="padding:3px 6px;border-radius:5px;border:2px solid ${sel?'#16a34a':'var(--border)'};background:${sel?'#dcfce7':'var(--white)'};cursor:pointer;font-size:${id==='none'?'10px':'13px'};min-width:28px;transition:.1s;display:inline-flex;align-items:center;justify-content:center">${inner}</button>`;
  }).join('');
}
function setBrdStatusIcon(btn, playerName, iconId){
  setStatusIcon(playerName, iconId);
  const grid = btn.closest('[id^="brd-icon-grid-"]');
  if(grid){
    grid.querySelectorAll('button[data-icon-id]').forEach(b=>{
      const sel = b.dataset.iconId === iconId;
      b.style.border = '2px solid '+(sel?'#16a34a':'var(--border)');
      b.style.background = sel?'#dcfce7':'var(--white)';
    });
  }
  const p = players.find(x=>x.name===playerName);
  if(p) _refreshBoardCard(p.univ);
}

function boardMovePlayer(playerName, univName, dir){
  if(!_boardCanManage()) return;
  _brdClose();
  const sorted = _getBoardPlayers(univName);
  const idx = sorted.findIndex(p=>p.name===playerName);
  if(idx < 0) return;
  const order = sorted.map(p=>p.name);
  let ni = idx;
  if(dir==='up') ni = Math.max(0, idx-1);
  else if(dir==='down') ni = Math.min(order.length-1, idx+1);
  else if(dir==='top') ni = 0;
  else if(dir==='bottom') ni = order.length-1;
  if(ni===idx) return;
  order.splice(idx,1);
  order.splice(ni,0,playerName);
  boardPlayerOrder[univName] = order;
  saveBoardPlayerOrder();
  // Firebase에도 순서 저장 (1.5초 debounce — 연속 이동 시 한 번만 저장)
  clearTimeout(window._bpoSaveTm);
  window._bpoSaveTm = setTimeout(() => { if(typeof save === 'function') save(); }, 1500);
  // 해당 카드만 다시 렌더
  _refreshBoardCard(univName);
}

function boardTransferPlayer(playerName, fromUniv){
  if(!_boardCanManage()){ alert('총관리자만 이동할 수 있습니다.'); return; }
  const sel = document.getElementById('brd-univ-target');
  const toUniv = sel?.value;
  if(!toUniv || toUniv===fromUniv){ alert('이동할 대학을 선택하세요.'); return; }
  _brdClose();
  const p = players.find(x=>x.name===playerName);
  if(!p) return;
  if(!confirm(`"${playerName}"을(를) "${fromUniv}" → "${toUniv}"로 이동하시겠습니까?\n\n스트리머 목록·티어 순위표·스트리머 상세·대학 상세가 모두 자동 반영됩니다.`)) return;

  // 실제 데이터 변경
  p.prevUniv = fromUniv; p.transferDate = new Date().toISOString().slice(0,10);
  p.univ = toUniv;

  // boardPlayerOrder에서 제거
  if(boardPlayerOrder[fromUniv]){
    boardPlayerOrder[fromUniv] = boardPlayerOrder[fromUniv].filter(n=>n!==playerName);
  }

  // 저장
  save();
  saveBoardPlayerOrder();

  // 현황판 두 카드 즉시 갱신
  _refreshBoardCard(fromUniv);
  _refreshBoardCard(toUniv);

  // 현재 열린 스트리머 상세 모달이 해당 선수면 갱신
  const pm = document.getElementById('playerModal');
  if(pm && pm.style.display !== 'none'){
    const nameEl = pm.querySelector('.brd-univ-name-btn, [data-player-name]');
    // 모달 타이틀에 선수 이름이 있으면 갱신
    if(pm.innerHTML && pm.innerHTML.includes(playerName)){
      openPlayerModal(playerName);
    }
  }

  // 성공 토스트
  _brdToast(`✅ "${playerName}" → "${toUniv}" 이동 완료`);
}

function _refreshBoardCard(univName){
  const wrap = document.getElementById('board-wrap');
  if(!wrap){ render(); return; }
  const u = getAllUnivs().find(x=>x.name===univName);
  const existing = _findBrdCardByUniv(univName, wrap);
  // 해당 대학에 선수가 없으면 카드 제거
  if(!u || !players.some(p=>p.univ===univName)){
    if(existing) existing.remove();
    return;
  }
  const newHtml = buildUnivBoardCard(u);
  if(!newHtml){
    if(existing) existing.remove();
    return;
  }
  const tmp = document.createElement('div');
  tmp.innerHTML = newHtml;
  const newCard = tmp.firstElementChild;
  if(existing) existing.replaceWith(newCard);
  else wrap.appendChild(newCard);
  injectUnivIcons(newCard);
  // 새 카드에 드래그 이벤트 재등록
  initBoardDragCard(newCard, wrap);
  // 플레이어 행 드래그 재등록 (관리자만)
  if(_boardCanManage()) newCard.querySelectorAll('.brd-body').forEach(body=>initBoardPlayerDrag(body));
}

/* ── 카드 클릭 순서 이동 ── */
function boardCardMove(univName, dir){
  if(!_boardCanManage()) return;
  const wrap = document.getElementById('board-wrap');
  if(!wrap) return;
  const cards = [...wrap.querySelectorAll('.brd-card')];
  const idx = cards.findIndex(c => c.dataset.univ === univName);
  if(idx < 0) return;
  let newIdx;
  if(dir === 'left')  newIdx = idx - 1;
  else                newIdx = idx + 1;
  if(newIdx < 0 || newIdx >= cards.length) return;
  const target = cards[newIdx];
  if(dir === 'left') target.before(cards[idx]);
  else               target.after(cards[idx]);
  // 순서 저장
  boardOrder = [...wrap.querySelectorAll('.brd-card')].map(c => c.dataset.univ);
  save();
  syncBoardOrderToUnivCfg();
  // 이동된 카드 잠깐 하이라이트
  cards[idx].style.outline = '3px solid rgba(255,255,255,.9)';
  setTimeout(() => { cards[idx].style.outline = ''; }, 500);
}


/* ── 카드 드래그 앤 드롭 ── */
