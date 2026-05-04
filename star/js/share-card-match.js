/* ══════════════════════════════════════
   Share Card Match Entry
══════════════════════════════════════ */
function renderShareCardByMatchObj(m){
  const card=document.getElementById('share-card');if(!card)return;
  if(!m){card.innerHTML='<p style="color:var(--gray-l);padding:40px;text-align:center">경기를 선택하세요</p>';return;}
  try{ if(typeof refreshShareCardModalMeta==='function') refreshShareCardModalMeta(m); }catch(e){}
  const _soloModeKey = _resolveShareSoloModeKey(m);
  const _isSoloShare = ['ind','gj','progj'].includes(_soloModeKey);
  const a=_isSoloShare?(m.wName||m.a||'A팀'):(m.a||'A팀');
  const b=_isSoloShare?(m.lName||m.b||'B팀'):(m.b||'B팀');
  const _teamMode = !!(
    m._matchType==='comp' ||
    m._matchType==='ck' ||
    m._matchType==='pro' ||
    m._matchType==='tt' ||
    m._matchType==='procomp-team' ||
    m._matchType==='procomp-bkt' ||
    (Array.isArray(m.teamAMembers) && m.teamAMembers.length) ||
    (Array.isArray(m.teamBMembers) && m.teamBMembers.length)
  );
  const _paTop = (!_teamMode && a && a!=='A팀') ? statsP(a) : null;
  const _pbTop = (!_teamMode && b && b!=='B팀') ? statsP(b) : null;
  const _usePlayerPhoto = !!(m && (m._usePlayerPhoto || (_paTop && _pbTop)));
  const _dispA = _teamMode ? (m.teamALabel || a || 'A팀') : a;
  const _dispB = _teamMode ? (m.teamBLabel || b || 'B팀') : b;
  const _soloHero = (!_teamMode && _isSoloShare);
  const isCivil=m.type==='civil'||(a==='A팀'&&b==='B팀');
  let civUniv=null;
  if(isCivil){
    outer:for(const s of(m.sets||[])){for(const g of(s.games||[])){const pn=g.playerA||g.playerB;if(pn){const p=statsP(pn);if(p?.univ){civUniv=p.univ;break outer;}}}}
  }
  const civColor=civUniv?gc(civUniv):'#6366f1';
  const _TYPE_COLORS={
    pro:{a:'#1d4ed8',b:'#be123c'},
    tt:{a:'#7c3aed',b:'#047857'},
    ck:{a:'#0e7490',b:'#b45309'},
    'procomp-team':{a:'#1e3a8a',b:'#881337'},
    'procomp-bkt':{a:'#92400e',b:'#4c1d95'},
  };
  const _tc=m._matchType&&_TYPE_COLORS[m._matchType]?_TYPE_COLORS[m._matchType]:null;
  let ca=_tc?_tc.a:(isCivil?civColor:(m._shareColorA||gc(a)));
  let cb=_tc?_tc.b:(isCivil?civColor:(m._shareColorB||gc(b)));
  if(_soloHero){
    ca = m._shareColorA || (_paTop?.univ ? gc(_paTop.univ) : ca);
    cb = m._shareColorB || (_pbTop?.univ ? gc(_pbTop.univ) : cb);
  }
  const aWin=m.sa>m.sb, bWin=m.sb>m.sa;
  const draw=!aWin&&!bWin;
  const makeTheme = window.__shareCardMatchMakeCardTheme || (()=>({headerBg:'#1e293b', bodyBg:'#f8fafc', accentHex:'#6366f1', accentDark:'#1e293b', text:'#1e293b', textDim:'rgba(30,41,59,.55)', divider:'rgba(30,41,59,.12)'}));
  const hexToRgb = window.__shareCardMatchHexToRgb || (()=>'128,128,128');
  const univIconHTML = window.__shareCardUnivIconHTML || (()=>'');
  const teamRepIconHTML = window.__shareCardTeamRepIconHTML || (()=>'');
  const teamRepNote = window.__shareCardTeamRepNote || (()=>'');
  const teamPickRep = window.__shareCardPickTeamRep || (()=>null);
  const theme = aWin ? makeTheme(ca) : bWin ? makeTheme(cb) : {
    headerBg:'#334155', bodyBg:'#f8fafc',
    accentHex:'#475569', accentDark:'#1e293b',
    text:'#1e293b', textDim:'rgba(71,85,105,.6)', divider:'rgba(148,163,184,.2)'
  };
  const winnerColor=aWin?ca:bWin?cb:'#475569';
  const _sc = _getShareCardPreset(winnerColor||ca, (aWin?cb:ca)||cb);
  const _vp = _getShareViewportMeta();
  const _photoSize = _soloHero ? (_vp.narrow?'74px':'88px') : (_vp.narrow?'66px':'80px');
  const _nameSize = _soloHero ? (_vp.narrow?'13.5px':'15.5px') : (_vp.narrow?'13px':'14.5px');
  const _scoreSize = _soloHero ? (_vp.narrow?'48px':'60px') : (_vp.narrow?'44px':'54px');
  const caRgb=hexToRgb(ca), cbRgb=hexToRgb(cb);
  const _ctx = { m, _vp, theme, _sc, _soloHero, ca, cb, a, b, _dispA, _dispB, aWin, bWin, draw, _teamMode, _usePlayerPhoto, _paTop, _pbTop, caRgb, cbRgb };
  const setsHTML = typeof window.__shareCardBuildSetsHTML === 'function' ? window.__shareCardBuildSetsHTML(_ctx) : '';
  const _teamHeaderHTML = typeof window.__shareCardTeamHeaderHTML === 'function' ? window.__shareCardTeamHeaderHTML(_ctx) : '';

  card.innerHTML=`<div style="background:${_soloHero?(_sc.mode==='dark'?'linear-gradient(180deg,#0f172a,#111827 62%,#172554 100%)':_sc.mode==='minimal'?'linear-gradient(180deg,#ffffff,#f8fafc 100%)':_sc.mode==='glass'?'linear-gradient(180deg,#ffffff,#f8fbff 62%,#edf4ff 100%)':_sc.mode==='glossy'?`linear-gradient(180deg,${_hexToRgbaShare(winnerColor,.12)},#fff 42%,#eef4ff 100%)`:'linear-gradient(180deg,#ffffff,#f8fafc 62%,#eef4ff 100%)'):theme.bodyBg};color:${_sc.tone==='dark'?theme.text:_sc.text};min-width:0;width:100%;max-width:100%;border-radius:${_vp.narrow?'18px':'22px'};overflow:hidden;font-family:'Noto Sans KR',sans-serif;box-shadow:${_sc.shellShadow}">

    <!-- 상단 헤더 바: 승리팀 풀컬러 -->
    <div style="background:${_soloHero?(_sc.mode==='minimal'?`linear-gradient(135deg, ${_hexToRgbaShare(ca,.12)} 0%, #ffffff 48%, ${_hexToRgbaShare(cb,.12)} 100%)`:_sc.mode==='glass'?`linear-gradient(135deg, ${_hexToRgbaShare(ca,.18)} 0%, rgba(255,255,255,.78) 48%, ${_hexToRgbaShare(cb,.18)} 100%)`:_sc.mode==='dark'?`linear-gradient(135deg, ${ca} 0%, #0f172a 52%, ${cb} 100%)`:`linear-gradient(135deg, ${ca} 0%, ${theme.headerBg} 52%, ${cb} 100%)`):theme.headerBg};padding:${_soloHero?(_vp.narrow?'16px 14px 18px':'20px 22px 22px'):(_vp.narrow?'14px 14px 16px':'18px 22px 20px')};position:relative;overflow:hidden">
      <!-- 배경 장식 -->
      <div style="position:absolute;top:-30px;right:-30px;width:${_soloHero?'156px':'130px'};height:${_soloHero?'156px':'130px'};border-radius:50%;background:${_sc.deco1};pointer-events:none"></div>
      <div style="position:absolute;bottom:-40px;left:20px;width:${_soloHero?'120px':'100px'};height:${_soloHero?'120px':'100px'};border-radius:50%;background:${_sc.deco2};pointer-events:none"></div>
      <div style="position:absolute;inset:0 auto auto 0;width:56%;height:1px;background:linear-gradient(90deg, rgba(255,255,255,.28), rgba(255,255,255,0));pointer-events:none"></div>
      ${_soloHero?`<div style="position:absolute;inset:auto 0 0 0;height:54px;background:linear-gradient(180deg, rgba(255,255,255,0), rgba(255,255,255,.08));pointer-events:none"></div>`:''}

      <!-- 대회명 + 날짜 -->
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:${_soloHero?'18px':'16px'};gap:8px;flex-wrap:wrap">
        ${(()=>{
          const _typeLbl={ind:'⚔️ 개인전',gj:'🔥 끝장전',progj:'👑 프로리그 끝장전',mini:'⚡ 미니대전',univm:'🏟️ 대학대전',comp:'🏆 대회',pro:'🏆 프로리그',tt:'🎯 티어대회',ck:'🤝 대학CK','procomp-team':'🤝 팀전','procomp-bkt':'🗂️ 토너먼트'}[m._matchType]||'';
          const lbl=_typeLbl||(m.n?`🎖️ ${m.n}`:'');
          const subLbl=String(m._subLabel||'').trim();
          const _normLbl=(s)=>String(s||'').replace(/[⚔️🔥👑🏆🎯🤝🗂️🎖️]/g,'').replace(/\s+/g,' ').trim();
          const fullLbl=lbl?(subLbl && _normLbl(subLbl)!==_normLbl(lbl) ? `${lbl} · ${subLbl}` : lbl):(subLbl||'');
          return fullLbl?`<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap"><div style="font-size:${_soloHero?'11px':'11px'};color:${_sc.chipText};font-weight:900;background:${_sc.chipBg};border:${_sc.chipBorder};padding:${_soloHero?'4px 13px':'3px 12px'};border-radius:20px;backdrop-filter:blur(6px);box-shadow:inset 0 1px 0 rgba(255,255,255,.10)">${fullLbl}</div></div>`:'<div></div>';
        })()}
        ${m.d?`<div style="font-size:11px;color:${_sc.subChipText};font-weight:800;background:${_sc.subChipBg};padding:4px 10px;border-radius:999px;backdrop-filter:blur(6px);border:${_sc.mode==='minimal'||_sc.mode==='glass'?_sc.chipBorder:'none'};box-shadow:inset 0 1px 0 rgba(255,255,255,.08)">${m.d}</div>`:''}
      </div>

      ${(_teamMode && _teamHeaderHTML) ? _teamHeaderHTML : `
      <!-- 팀 대결 -->
      <div style="display:flex;align-items:center;justify-content:center;gap:${_soloHero?(_vp.narrow?'10px':'14px'):(_vp.narrow?'8px':'10px')};position:relative;z-index:1">
        <!-- A팀 -->
        <div style="text-align:center;flex:1;min-width:0">
          ${_teamMode?teamRepIconHTML(_ctx, 'A', aWin):(!m._noUnivIcon?(_usePlayerPhoto
            ?`<div style="width:${_photoSize};height:${_photoSize};border-radius:var(--su_profile_radius,50%);margin:0 auto 9px;overflow:hidden;${aWin?'box-shadow:0 0 0 3px rgba(255,255,255,.88),0 12px 30px rgba(0,0,0,.34)':'opacity:.56;box-shadow:0 0 0 2px rgba(255,255,255,.24)'}">
              ${getPlayerPhotoHTML(a,_photoSize,'width:100%;height:100%;object-fit:cover;object-position:center top')}
            </div>`
            :`<div style="width:58px;height:58px;border-radius:16px;background:${aWin?`rgba(${caRgb},.38)`:`rgba(${caRgb},.14)`};margin:0 auto 8px;display:flex;align-items:center;justify-content:center;${aWin?'box-shadow:0 4px 20px rgba(0,0,0,.25);border:2px solid rgba(255,255,255,.55);':'opacity:.5;'}overflow:hidden">
              ${univIconHTML(isCivil&&civUniv?civUniv:a,'40px')}
            </div>`)
          :'<div style="height:12px"></div>')}
          <div style="font-size:${_nameSize};font-weight:${aWin?1000:700};color:${aWin?'#fff':'rgba(255,255,255,.74)'};white-space:${_vp.tiny?'normal':'nowrap'};overflow:hidden;text-overflow:ellipsis;text-shadow:${_soloHero?'0 2px 10px rgba(0,0,0,.18)':'none'};line-height:1.2;word-break:keep-all">${isCivil?'⚔️ A팀':_dispA}</div>
          ${_teamMode?(()=>{const _pa=teamPickRep(_ctx, 'A');const _pp=(_pa&&_pa.name)?(statsP(_pa.name)||_pa):_pa;const _note=teamRepNote(_ctx, 'A');return (_note||(_pp&&_pp.univ))?`<div style="display:flex;justify-content:center;align-items:center;gap:4px;margin-top:4px;flex-wrap:wrap">${_note?`<span style="font-size:9px;color:rgba(255,255,255,.96);font-weight:900;background:rgba(255,255,255,.14);padding:2px 6px;border-radius:999px">${_note}</span>`:''}${(_pp&&_pp.univ)?`<span style="font-size:9px;color:rgba(255,255,255,.68);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:90px">${_pp.univ}</span>`:''}</div>`:''})():(_usePlayerPhoto?(()=>{const _pa=statsP(a);return _pa&&(_pa.race||_pa.univ)?`<div style="display:flex;justify-content:center;align-items:center;gap:3px;margin-top:2px;flex-wrap:wrap">${_pa.race?`<span class="rbadge r${_pa.race}" style="font-size:9px;padding:1px 5px">${_pa.race}</span>`:''}${_pa.univ?`<span style="font-size:9px;color:rgba(255,255,255,.5);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:86px">${_pa.univ}</span>`:''}</div>`:''})():'')}
          ${aWin?`<div style="margin-top:6px"><span style="background:rgba(255,255,255,.25);border:1px solid rgba(255,255,255,.5);color:#fff;font-size:9px;font-weight:900;padding:3px 10px;border-radius:999px;letter-spacing:.4px">🏆 승리</span></div>`:`<div style="margin-top:6px"><span style="background:rgba(255,255,255,.10);border:1px solid rgba(255,255,255,.14);color:rgba(255,255,255,.72);font-size:9px;font-weight:800;padding:3px 10px;border-radius:999px">패배</span></div>`}
        </div>

        <!-- 스코어 -->
        <div style="text-align:center;flex-shrink:0;padding:0 6px">
          <div style="font-size:${_scoreSize};font-weight:1000;letter-spacing:${_soloHero?'1px':'2px'};line-height:1;color:#fff;text-shadow:0 4px 16px rgba(0,0,0,.24)">
            <span>${m.sa??'-'}</span><span style="font-size:${_vp.narrow?'22px':'30px'};opacity:.54;margin:0 3px">:</span><span>${m.sb??'-'}</span>
          </div>
          ${draw?`<div style="font-size:10px;color:rgba(255,255,255,.7);margin-top:4px;letter-spacing:2px;font-weight:700">무 승 부</div>`:''}
        </div>

        <!-- B팀 -->
        <div style="text-align:center;flex:1;min-width:0">
          ${_teamMode?teamRepIconHTML(_ctx, 'B', bWin):(!m._noUnivIcon?(_usePlayerPhoto
            ?`<div style="width:${_photoSize};height:${_photoSize};border-radius:var(--su_profile_radius,50%);margin:0 auto 9px;overflow:hidden;${bWin?'box-shadow:0 0 0 3px rgba(255,255,255,.88),0 12px 30px rgba(0,0,0,.34)':'opacity:.56;box-shadow:0 0 0 2px rgba(255,255,255,.24)'}">
              ${getPlayerPhotoHTML(b,_photoSize,'width:100%;height:100%;object-fit:cover;object-position:center top')}
            </div>`
            :`<div style="width:58px;height:58px;border-radius:16px;background:${bWin?`rgba(${cbRgb},.38)`:`rgba(${cbRgb},.14)`};margin:0 auto 8px;display:flex;align-items:center;justify-content:center;${bWin?'box-shadow:0 4px 20px rgba(0,0,0,.25);border:2px solid rgba(255,255,255,.55);':'opacity:.5;'}overflow:hidden">
              ${univIconHTML(isCivil&&civUniv?civUniv:b,'40px')}
            </div>`)
          :'<div style="height:12px"></div>')}
          <div style="font-size:${_nameSize};font-weight:${bWin?1000:700};color:${bWin?'#fff':'rgba(255,255,255,.74)'};white-space:${_vp.tiny?'normal':'nowrap'};overflow:hidden;text-overflow:ellipsis;text-shadow:${_soloHero?'0 2px 10px rgba(0,0,0,.18)':'none'};line-height:1.2;word-break:keep-all">${isCivil?'🛡️ B팀':_dispB}</div>
          ${_teamMode?(()=>{const _pb=teamPickRep(_ctx, 'B');const _pp=(_pb&&_pb.name)?(statsP(_pb.name)||_pb):_pb;const _note=teamRepNote(_ctx, 'B');return (_note||(_pp&&_pp.univ))?`<div style="display:flex;justify-content:center;align-items:center;gap:4px;margin-top:4px;flex-wrap:wrap">${_note?`<span style="font-size:9px;color:rgba(255,255,255,.96);font-weight:900;background:rgba(255,255,255,.14);padding:2px 6px;border-radius:999px">${_note}</span>`:''}${(_pp&&_pp.univ)?`<span style="font-size:9px;color:rgba(255,255,255,.68);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:90px">${_pp.univ}</span>`:''}</div>`:''})():(_usePlayerPhoto?(()=>{const _pb=statsP(b);return _pb&&(_pb.race||_pb.univ)?`<div style="display:flex;justify-content:center;align-items:center;gap:3px;margin-top:2px;flex-wrap:wrap">${_pb.race?`<span class="rbadge r${_pb.race}" style="font-size:9px;padding:1px 5px">${_pb.race}</span>`:''}${_pb.univ?`<span style="font-size:9px;color:rgba(255,255,255,.5);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:86px">${_pb.univ}</span>`:''}</div>`:''})():'')}
          ${bWin?`<div style="margin-top:6px"><span style="background:rgba(255,255,255,.25);border:1px solid rgba(255,255,255,.5);color:#fff;font-size:9px;font-weight:900;padding:3px 10px;border-radius:999px;letter-spacing:.4px">🏆 승리</span></div>`:`<div style="margin-top:6px"><span style="background:rgba(255,255,255,.10);border:1px solid rgba(255,255,255,.14);color:rgba(255,255,255,.72);font-size:9px;font-weight:800;padding:3px 10px;border-radius:999px">패배</span></div>`}
        </div>
      </div>
      `}
    </div>

    <!-- 바디: 연한 배경 -->
    <div style="padding:${setsHTML?(_soloHero?(_vp.narrow?'14px 12px 16px':'16px 18px 18px'):(_vp.narrow?'12px 12px 14px':'14px 18px 16px')):(_soloHero?(_vp.narrow?'12px 12px 14px':'14px 18px 16px'):(_vp.narrow?'10px 12px 12px':'10px 18px 14px'))}">
      ${setsHTML?`<div style="margin-bottom:${_soloHero?'8px':'6px'}">${setsHTML}</div>`:''}
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;padding-top:8px;border-top:1px solid ${theme.divider}">
        <div style="font-size:10px;color:${_sc.tone==='dark'?theme.textDim:_sc.footerText};font-weight:800">${m.d||''}</div>
        <div style="display:inline-flex;align-items:center;gap:5px;font-size:10px;color:${_sc.tone==='dark'?theme.textDim:_sc.footerText};letter-spacing:.3px;font-weight:900;background:${_sc.mode==='dark'?'rgba(255,255,255,.05)':'rgba(255,255,255,.55)'};padding:3px 9px;border-radius:999px;border:1px solid ${theme.divider}">${_sc.mode==='glossy'?'✨ ':_soloHero?'✨ ':'⭐ '}스타대학 데이터 센터</div>
      </div>
    </div>
  </div>`;
}
try{
  window.renderShareCardByMatchObj = renderShareCardByMatchObj;
}catch(e){}
