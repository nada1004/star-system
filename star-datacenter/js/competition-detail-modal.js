/* 대회 상세 팝업 / 공유카드 연결 */

function openCompMatchDetailModal(tnId, gi, mi, rnd, isManual){
  try{ window.__detailCtx = 'compModal'; }catch(_){}
  const _mdDesignMode = (()=>{ try{ const v=(localStorage.getItem('su_md_design_mode')||'classic').trim(); return ['classic','glass','editorial','neon','midnight','sunset','aurora','mono'].includes(v)?v:'classic'; }catch(e){ return 'classic'; } })();
  const _mdLayoutMode = (()=>{ try{ const v=(localStorage.getItem('su_md_layout_mode')||'default').trim(); return ['default','compact','focus','broadcast','split','poster'].includes(v)?v:'default'; }catch(e){ return 'default'; } })();
  const tn=tourneys.find(t=>t.id===tnId);
  if(!tn)return;
  let m;
  if(gi!=null && (rnd==null || rnd===undefined) && !isManual){
    m=(tn.groups && tn.groups[gi] && tn.groups[gi].matches) ? tn.groups[gi].matches[mi] : null;
  } else if(isManual){
    m=(tn.bracket?.manualMatches||[])[mi];
  }else{
    const br=getBracket(tn);
    m=br?.matchDetails?.[`${rnd}-${mi}`];
  }
  if(!m)return;
  const _modeHdr = tn.type==='tier' ? 'tt' : ((String(tn.type||'').toLowerCase().includes('pro') || /프로리그/.test(String(tn.name||''))) ? 'pro' : '');
  const caBase=gc(m.a||'');const cbBase=gc(m.b||'');
  const ca=_modeHdr && typeof _getMatchDetailTeamHeaderColor==='function' ? _getMatchDetailTeamHeaderColor(_modeHdr,'A',caBase) : caBase;
  const cb=_modeHdr && typeof _getMatchDetailTeamHeaderColor==='function' ? _getMatchDetailTeamHeaderColor(_modeHdr,'B',cbBase) : cbBase;
  const isDone=m.sa!=null&&m.sb!=null;
  const aWin=isDone&&m.sa>m.sb;const bWin=isDone&&m.sb>m.sa;

  try{
    const titleEl=document.getElementById('cmdTitle');
    const subEl=document.getElementById('cmdSub');
    const bar=document.getElementById('cmdScoreBar');
    const headActions=document.getElementById('cmdHeadActions');
    const safe=(s)=>String(s||'').replace(/[<>]/g,'');
    const label = (gi!=null && (rnd==null || rnd===undefined) && !isManual)
      ? `${(m.grpName||('GROUP '+(m.grpLetter||''))).trim()} · ${((m.matchNum!=null)?(m.matchNum+'경기'):'경기')}`
      : (isManual ? (m.rndLabel||'토너먼트 경기') : ((rnd!=null)?`${(m.rndLabel||'')} `.trim()+'' : '토너먼트'));
    if(titleEl) titleEl.textContent = `📊 ${tn.name || '대회'} · ${label || '경기 상세'}`;
    const dStr = m.d ? String(m.d).slice(0,10) : '';
    if(subEl) subEl.textContent = dStr ? `📅 ${dStr}` : '';

    if(bar){
      if(isDone){
        const sa = m.sa ?? '';
        const sb = m.sb ?? '';
        // ✅ 수정: 패배팀만 회색 처리 (동점/무승부 시 양쪽 모두 컬러 유지)
        const loseA = isDone && bWin;
        const loseB = isDone && aWin;
        const aBg = loseA ? 'linear-gradient(180deg, rgba(248,250,252,.98), rgba(241,245,249,.96))' : (ca || '#64748b');
        const bBg = loseB ? 'linear-gradient(180deg, rgba(248,250,252,.98), rgba(241,245,249,.96))' : (cb || '#64748b');
        const aBd = loseA ? 'rgba(203,213,225,.88)' : _compMenuTint(ca || '#64748b', .46);
        const bBd = loseB ? 'rgba(203,213,225,.88)' : _compMenuTint(cb || '#64748b', .46);
        const aFg = loseA ? '#1f2937' : '#ffffff';
        const bFg = loseB ? '#1f2937' : '#ffffff';
        const uicon = (team)=>{
          try{
            const cfgList = Array.isArray(window.univCfg) && window.univCfg.length
              ? window.univCfg
              : (typeof getAllUnivs==='function' ? getAllUnivs() : []);
            const url=(window.UNIV_ICONS&&window.UNIV_ICONS[team])||((cfgList.find(x=>x&&x.name===team)||{}).icon)||((cfgList.find(x=>x&&x.name===team)||{}).img)||'';
            return url?`<span style="display:inline-flex;align-items:center;justify-content:center"><img class="cmd-uicon" src="${toHttpsUrl(url)}" style="object-fit:contain;border-radius:var(--su_univ_logo_radius,12px);background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.28);padding:7px" onerror="this.parentNode.style.display='none'"></span>`:'';
          }catch(e){ return ''; }
        };
        bar.innerHTML = `<div class="cmd-score">
          <div class="cmd-team" style="background:${aBg};border:1px solid ${aBd};justify-content:center;text-align:center;position:relative;color:${aFg};padding:0 18px"><span style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-weight:1000;font-size:22px;text-align:center;display:inline-flex;align-items:center;justify-content:center;gap:8px;max-width:calc(100% - 60px);white-space:normal;word-break:keep-all;overflow:hidden;line-height:1.2">${uicon(m.a||'')}<span style="overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical">${safe(m.a||'A팀')}</span></span></div>
          <div class="cmd-mid"><span style="color:${aWin?'#16a34a':bWin?'#dc2626':'#111827'}">${sa}</span><span class="cmd-colon">:</span><span style="color:${bWin?'#16a34a':aWin?'#dc2626':'#111827'}">${sb}</span></div>
          <div class="cmd-team" style="background:${bBg};border:1px solid ${bBd};justify-content:center;text-align:center;position:relative;color:${bFg};padding:0 18px"><span style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-weight:1000;font-size:22px;text-align:center;display:inline-flex;align-items:center;justify-content:center;gap:8px;max-width:calc(100% - 60px);white-space:normal;word-break:keep-all;overflow:hidden;line-height:1.2">${uicon(m.b||'')}<span style="overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical">${safe(m.b||'B팀')}</span></span></div>
        </div>`;
        bar.style.display='block';
      }else{
        bar.innerHTML='';
        bar.style.display='none';
      }
    }

    if(headActions){
      const _adm=(localStorage.getItem('su_share_admin_only')||'0')==='1';
      const okShare=(!_adm||isLoggedIn) && isDone;
      const isLeagueMatch=(gi!=null && (rnd==null || rnd===undefined) && !isManual);
      let btnHtml='';
      if(isLoggedIn){
        // 수정 버튼
        if(isLeagueMatch){
          btnHtml+=`<button class="btn btn-w btn-xs" style="display:inline-flex;align-items:center;gap:5px;padding:7px 12px;border-radius:999px;font-weight:700" onclick="if(typeof openCompMatchEditModal==='function')openCompMatchEditModal('${tnId}',${gi},${mi});else if(typeof grpEditMatchInline==='function')grpEditMatchInline('${tnId}',${gi},${mi})">✏️ 수정</button>`;
        } else if(isManual){
          btnHtml+=`<button class="btn btn-w btn-xs" style="display:inline-flex;align-items:center;gap:5px;padding:7px 12px;border-radius:999px;font-weight:700" onclick="if(typeof openBktManualEditModal==='function')openBktManualEditModal('${tnId}',${mi})">✏️ 수정</button>`;
        }
      }
      if(okShare){
        btnHtml+=`<button class="btn btn-p btn-xs" style="display:inline-flex;align-items:center;justify-content:center;gap:6px;min-width:104px;padding:7px 12px;border-radius:999px;background:linear-gradient(135deg,#7c3aed,#2563eb);border:1px solid rgba(255,255,255,.24);box-shadow:0 8px 20px rgba(37,99,235,.22);color:#fff;font-weight:900" onclick="${isLeagueMatch?`openCompMatchShareCard('${tnId}',${gi},${mi})`:`openBktShareCard('${tnId}',${rnd},${mi})`}">🎴 공유 카드</button>`;
      }
      headActions.innerHTML=btnHtml;
    }
    window._cmdDetailState = { tnId, gi, mi, rnd, isManual, isLeague: (gi!=null && (rnd==null || rnd===undefined) && !isManual) };
  }catch(e){}

  const content=document.getElementById('compMatchDetailContent');
  if(content){
    content.innerHTML=`<div class="cmd-detail">${buildDetailHTML(m,'comp',m.a||'A팀',m.b||'B팀',ca,cb,aWin,bWin)}</div>`;
  }
  try{
    const modal=document.getElementById('compMatchDetailModal');
    if(modal){
      modal.setAttribute('data-md-mode', _mdDesignMode);
      modal.setAttribute('data-md-layout', _mdLayoutMode);
      const box = modal.querySelector('.mbox--matchdetail');
      const body = modal.querySelector('.cmd-body');
      if(box){
        box.setAttribute('data-md-mode', _mdDesignMode);
        box.setAttribute('data-md-layout', _mdLayoutMode);
      }
      if(body){
        body.setAttribute('data-md-mode', _mdDesignMode);
        body.setAttribute('data-md-layout', _mdLayoutMode);
      }
    }
  }catch(e){}
  try{
    document.querySelectorAll('#compMatchDetailModal .cmd-detail-shell').forEach(el=>{
      el.setAttribute('data-md-mode', _mdDesignMode);
      el.setAttribute('data-md-layout', _mdLayoutMode);
    });
  }catch(e){}
  try{
    if(typeof om==='function') om('compMatchDetailModal');
    else { const mm=document.getElementById('compMatchDetailModal'); if(mm) mm.style.display='flex'; }
  }catch(e){}
}

function closeCompMatchDetailModal(){
  try{
    const headActions=document.getElementById('cmdHeadActions');
    if(headActions) headActions.innerHTML='';
    if(typeof cm==='function') cm('compMatchDetailModal');
    else { const mm=document.getElementById('compMatchDetailModal'); if(mm) mm.style.display='none'; }
  }catch(e){}
}

async function openCompMatchShareCard(tnId, gi, mi){
  try{
    if(typeof window._ensureStatsLoaded==='function'){
      await window._ensureStatsLoaded();
    }
    const tn=(tourneys||[]).find(t=>t.id===tnId);
    if(!tn) return;
    const grp=tn.groups&&tn.groups[gi];
    if(!grp) return;
    const m=grp.matches&&grp.matches[mi];
    if(!m) return;
    window._shareMatchObj={
      ...m,
      a:m.a||'', b:m.b||'',
      sa:m.sa, sb:m.sb,
      d:m.d||'',
      n:tn.name, compName:tn.name,
      teamALabel:m.a||'', teamBLabel:m.b||'',
      sets:m.sets||[],
      stage:'league',
      _matchType:'comp',
      grpName:grp.name||'',
      grpLetter:'ABCDEFGHIJ'[gi]||String(gi+1)
    };
    try{ window._shareMode='match'; }catch(e){}
    if(typeof openShareCardModal==='function') openShareCardModal();
    const _run=()=>{
      try{
        if(window._shareMatchObj && typeof renderShareCardByMatchObj==='function'){
          renderShareCardByMatchObj(window._shareMatchObj);
        }
      }catch(e){ console.error('[openCompMatchShareCard]', e); }
    };
    if(typeof window._shareCardDeferRender==='function') window._shareCardDeferRender(_run);
    else setTimeout(_run,0);
  }catch(e){
    console.error('[openCompMatchShareCard]', e);
  }
}

function openCompDetailShareCard(){
  try{
    const st = window._cmdDetailState || null;
    if(!st) return;
    if(st.isLeague){
      if(typeof openCompMatchShareCard==='function') openCompMatchShareCard(st.tnId, st.gi, st.mi);
      return;
    }
    if(typeof openBktShareCard==='function') openBktShareCard(st.tnId, st.rnd, st.mi);
  }catch(e){}
}

function openBktShareCard(tnId,rnd,mi){
  const m=getBktMatch(tnId,rnd,mi);if(!m||m.sa==null)return;
  const tn=tourneys.find(t=>t.id===tnId);if(!tn)return;
  const _payload={
    ...m,
    a:m.a||'', b:m.b||'',
    sa:m.sa, sb:m.sb,
    d:m.d||'',
    n:tn.name, compName:tn.name,
    teamALabel:m.a||'', teamBLabel:m.b||'',
    sets:m.sets||[],
    stage:'bkt',
    _matchType:'comp',
    grpName:m.rndLabel||'토너먼트',
    grpLetter:'T'
  };
  if(typeof window._openShareMatchObjCard==='function') window._openShareMatchObjCard(_payload);
}

try{
  window.openCompMatchDetailModal = openCompMatchDetailModal;
  window.closeCompMatchDetailModal = closeCompMatchDetailModal;
  window.openCompMatchShareCard = openCompMatchShareCard;
  window.openCompDetailShareCard = openCompDetailShareCard;
  window.openBktShareCard = openBktShareCard;
}catch(e){}
