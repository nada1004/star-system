/* ══════════════════════════════════════════════════════════════
   일반 대회 브리핑 (조별리그 브리핑 / 토너먼트 브리핑 / 대회 브리핑)
   - 현황판(보드2) 주간 브리핑의 b2w2-* 디자인 시스템을 그대로 재사용
   ══════════════════════════════════════════════════════════════ */

/* ── 공통 유틸 ── */
function _cbUcol(n){ try{ const c=(typeof gc==='function'&&n)?gc(n):''; return c||'#64748b'; }catch(e){ return '#64748b'; } }
function _cbFmtD(d){ return d?String(d).slice(2).replace(/-/g,'.'):''; }
function _cbPct(a,b){ return b?Math.round(a/b*100):0; }
function _cbEsc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

/* 조별리그 전 경기 수집 */
function _cbLeagueMatches(tn){
  const out=[];
  (tn?.groups||[]).forEach((grp,gi)=>{
    const gl='ABCDEFGHIJ'[gi]||String(gi+1);
    (grp.matches||[]).forEach((m,mi)=>{
      out.push({...m,grpName:grp.name||`${gl}조`,grpLetter:gl,grpIdx:gi,matchNum:mi+1,
        done:(m.sa!=null&&m.sb!=null)});
    });
  });
  return out;
}

/* 대진표(토너먼트) 전 경기 수집 — 라운드 라벨 포함 */
function _cbBktMatches(tn){
  const out=[];
  if(!tn) return out;
  const br=(typeof getBracket==='function')?getBracket(tn):(tn.bracket||{});
  const firstSize=(typeof _bktComputeBracketSize==='function')?_bktComputeBracketSize(tn):8;
  let totalRounds=0,n=Math.max(2,firstSize);
  while(n>1){ n=Math.ceil(n/2); totalRounds++; }
  if(!totalRounds) totalRounds=1;
  const roundLabels={1:'결승',2:'4강',3:'8강',4:'16강',5:'32강',6:'64강',7:'128강',8:'256강'};
  Object.keys(br.matchDetails||{}).forEach(k=>{
    const m=br.matchDetails[k]; if(!m) return;
    const [rs,mis]=String(k).split('-');
    const r=parseInt(rs,10), mi=parseInt(mis,10);
    const rNum=totalRounds-r;
    const rLabel=roundLabels[rNum]||(Math.pow(2,Math.max(1,rNum))+'강');
    const done=m.sa!=null&&m.sb!=null;
    const winner=done?(m.sa>m.sb?m.a:m.sb>m.sa?m.b:''):'';
    out.push({...m,r,mi,rLabel,done,winner,isManual:false});
  });
  (br.manualMatches||[]).forEach((m,idx)=>{
    if(!m) return;
    const done=m.sa!=null&&m.sb!=null;
    const winner=done?(m.sa>m.sb?m.a:m.sb>m.sa?m.b:''):'';
    out.push({...m,r:-1,mi:idx,rLabel:m.rndLabel||'토너먼트 경기',done,winner,isManual:true});
  });
  out.sort((a,b)=>(a.r===-1?9999:a.r)-(b.r===-1?9999:b.r)||a.mi-b.mi);
  return out;
}

/* 팀(대학) 단위 집계 */
function _cbTeamStats(matches){
  const st={};
  const ens=(u)=>{ if(u&&!st[u]) st[u]={u,w:0,l:0,sw:0,sl:0,g:0,form:[]}; };
  matches.forEach(m=>{
    ens(m.a); ens(m.b);
    if(!m.done||!m.a||!m.b) return;
    st[m.a].g++; st[m.b].g++;
    st[m.a].sw+=m.sa; st[m.a].sl+=m.sb;
    st[m.b].sw+=m.sb; st[m.b].sl+=m.sa;
    if(m.sa>m.sb){ st[m.a].w++; st[m.b].l++; st[m.a].form.push(1); st[m.b].form.push(0); }
    else if(m.sb>m.sa){ st[m.b].w++; st[m.a].l++; st[m.b].form.push(1); st[m.a].form.push(0); }
  });
  return Object.values(st).map(s=>({...s,diff:s.sw-s.sl,rate:s.g?Math.round(s.w/s.g*100):0}))
    .sort((a,b)=>b.w-a.w||b.diff-a.diff||b.sw-a.sw);
}

/* 선수 단위 집계 (조별/대진표 phase 지정) */
function _cbPlayerStats(matches){
  const ps={};
  const ens=(n)=>{ if(!ps[n]) ps[n]={name:n,w:0,l:0,form:[]}; };
  matches.forEach(m=>{
    if(!m.done) return;
    (m.sets||[]).forEach(set=>{
      (set.games||[]).forEach(g=>{
        if(!g.playerA||!g.playerB||!g.winner) return;
        const wn=g.winner==='A'?g.playerA:g.playerB;
        const ln=g.winner==='A'?g.playerB:g.playerA;
        ens(wn); ens(ln);
        ps[wn].w++; ps[ln].l++;
        ps[wn].form.push({d:m.d||'',win:true});
        ps[ln].form.push({d:m.d||'',win:false});
      });
    });
  });
  return Object.values(ps).map(p=>{
    const total=p.w+p.l;
    const all=p.form.slice().sort((a,b)=>(a.d||'').localeCompare(b.d||''));
    let streak=0,sw=null;
    for(let i=all.length-1;i>=0;i--){ if(sw===null){sw=all[i].win;streak=1;} else if(all[i].win===sw){streak++;} else break; }
    const pObj=(typeof players!=='undefined'?players:[]).find(x=>x.name===p.name);
    return {...p,total,rate:total?Math.round(p.w/total*100):0,streak,streakWin:sw,univ:pObj?pObj.univ:''};
  }).filter(p=>p.total>0);
}

/* ── 공용 UI 조각 ── */
function _cbShell(kicker,title,desc,metaKicker,headline,cells,body){
  return `<div class="b2w2-wrap" data-theme="${(typeof _b2BriefingThemeLoad==='function')?_b2BriefingThemeLoad():'paper'}">
    <div class="b2w2-masthead">
      <span class="b2w2-masthead-brand"><span class="b2w2-masthead-mark"></span>STAR DATACENTER</span>
      <span>${_cbEsc(kicker)}</span>
    </div>
    <section class="b2w2-hero">
      <div class="b2w2-hero-main">
        <div style="font-size:var(--fs-caption);font-weight:900;letter-spacing:.08em;color:var(--b2w-gold);text-transform:uppercase">${_cbEsc(kicker)}</div>
        <div class="b2w2-hero-title">${_cbEsc(title)}</div>
        <div class="b2w2-hero-desc">${desc}</div>
      </div>
      <div class="b2w2-hero-meta">
        <div class="b2w2-hero-meta-kicker">${_cbEsc(metaKicker)}</div>
        <div class="b2w2-hero-meta-headline">${headline}</div>
        <div class="b2w2-hero-meta-grid">
          ${cells.map(c=>`<div class="b2w2-hero-meta-cell">
            <div class="b2w2-hero-meta-label">${_cbEsc(c[0])}</div>
            <div class="b2w2-hero-meta-value">${c[1]}</div>
          </div>`).join('')}
        </div>
      </div>
    </section>
    ${body}
  </div>`;
}

function _cbKpis(items){
  return `<div class="b2w2-kpi-grid">${items.map(k=>`<div class="b2w2-kpi-card">
    <div class="b2w2-kpi-label">${_cbEsc(k[0])}</div>
    <div class="b2w2-kpi-value">${k[1]}</div>
    <div class="b2w2-kpi-sub">${k[2]||''}</div>
  </div>`).join('')}</div>`;
}

function _cbSection(title,sub,inner){
  return `<section class="b2w2-sec" style="margin-top:18px">
    <div class="b2w2-dual-head" style="margin-bottom:10px">
      <div>
        <div class="b2w2-dual-title">${_cbEsc(title)}</div>
        ${sub?`<div class="b2w2-dual-sub">${_cbEsc(sub)}</div>`:''}
      </div>
    </div>
    ${inner}
  </section>`;
}

function _cbEmpty(msg){
  return `<div class="b2w2-empty" style="padding:26px;text-align:center;color:var(--b2w-ink-soft,#6b7280)">${_cbEsc(msg)}</div>`;
}

function _cbBar(pct,col){
  return `<div style="height:8px;background:var(--b2w-rule-soft,#e5e7eb);border-radius:99px;overflow:hidden">
    <div style="height:100%;width:${pct}%;background:${col||'var(--b2w-accent,#2563eb)'};border-radius:99px;transition:.3s"></div>
  </div>`;
}

function _cbTeamChip(name,extra){
  const col=_cbUcol(name);
  return `<span style="display:inline-flex;align-items:center;gap:8px;font-weight:900;color:${col}">
    ${(typeof _univIconTag==='function')?_univIconTag(name,17):''}<span>${_cbEsc(name||'미정')}</span>${extra?`<span style="font-weight:700;color:var(--b2w-ink-soft,#6b7280)">${extra}</span>`:''}
  </span>`;
}

/* 조 색상 (조별리그 일정/기록 탭과 동일 팔레트) */
function _cbGrpColor(i){ return ['#2563eb','#dc2626','#16a34a','#d97706','#7c3aed','#0891b2'][(i||0)%6]; }

/* 조 배지 (조 색상 적용) */
function _cbGrpBadge(letter,idx,label){
  const col=_cbGrpColor(idx);
  return `<span style="font-size:11px;font-weight:900;color:#fff;background:linear-gradient(135deg,${col},${col}cc);padding:3px 10px;border-radius:99px;box-shadow:0 2px 6px ${col}44;flex-shrink:0">${_cbEsc(label||(letter+'조'))}</span>`;
}

/* 스트리머(선수) 프로필 이미지 — 설정탭의 프로필 모양(--su_profile_radius/clip) 적용 */
function _cbPlayerAvatar(name,size){
  const s=size||26;
  const shape=`border-radius:var(--su_profile_radius,50%);clip-path:var(--su_profile_clip,none)`;
  let p=null;
  try{ p=(typeof players!=='undefined'?players:[]).find(x=>x.name===name)||null; }catch(e){}
  const col=(p&&p.univ)?_cbUcol(p.univ):'#94a3b8';
  const photo=p&&p.photo?p.photo:'';
  if(photo){
    const src=(typeof toThumbUrl==='function')?toThumbUrl(photo,s*2):((typeof toHttpsUrl==='function')?toHttpsUrl(photo):photo);
    return `<img src="${src}" loading="lazy" decoding="async" style="width:${s}px;height:${s}px;${shape};object-fit:cover;flex-shrink:0;border:1.5px solid ${col}55;background:#e2e8f0" onerror="this.style.display='none'">`;
  }
  return `<span style="width:${s}px;height:${s}px;${shape};background:${col};display:inline-flex;align-items:center;justify-content:center;font-weight:900;font-size:${Math.round(s*0.44)}px;color:#fff;flex-shrink:0">${_cbEsc(String(name||'?').slice(0,1))}</span>`;
}

function _cbRankList(rows){
  if(!rows.length) return _cbEmpty('표시할 기록이 없습니다.');
  return `<div class="b2w2-rank-list">${rows.map((r,i)=>{
    const col=r.color||_cbUcol(r.name);
    return `<div class="b2w2-rank-row" style="display:flex;align-items:center;gap:10px;padding:9px 12px;border:1px solid var(--b2w-rule-soft,#e5e7eb);border-left:4px solid ${col};border-radius:10px;background:var(--b2w-paper-alt,#fff);margin-bottom:6px">
      <span class="b2w2-rank-badge" style="min-width:22px;font-weight:900;color:${i===0?'var(--b2w-gold,#b8862c)':'var(--b2w-ink-soft,#6b7280)'}">${i+1}</span>
      <span style="flex:1;min-width:0;display:flex;align-items:center;gap:8px;font-weight:900;color:${col}">${r.icon||''}<span style="min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${_cbEsc(r.name)}</span></span>
      ${r.sub?`<span style="font-size:11px;font-weight:700;color:var(--b2w-ink-soft,#6b7280);white-space:nowrap">${r.sub}</span>`:''}
      <span style="font-weight:900;color:var(--b2w-ink,#111827);white-space:nowrap">${r.value}</span>
    </div>`;
  }).join('')}</div>`;
}

function _cbMatchRow(m,label){
  const ca=_cbUcol(m.a), cb=_cbUcol(m.b);
  const aWin=m.done&&m.sa>m.sb, bWin=m.done&&m.sb>m.sa;
  return `<div style="display:flex;align-items:center;gap:9px;padding:9px 12px;border:1px solid var(--b2w-rule-soft,#e5e7eb);border-radius:10px;background:var(--b2w-paper-alt,#fff);margin-bottom:6px">
    ${label?`<span style="flex-shrink:0;font-size:10px;font-weight:900;color:#fff;background:var(--b2w-accent,#2563eb);padding:2px 8px;border-radius:99px">${_cbEsc(label)}</span>`:''}
    ${m.d?`<span style="flex-shrink:0;font-size:10px;font-weight:700;color:var(--b2w-ink-soft,#6b7280)">${_cbFmtD(m.d)}</span>`:''}
    <span style="flex:1;text-align:right;font-weight:${aWin?'900':'700'};opacity:${bWin?'.6':'1'};color:${ca}">${_cbEsc(m.a||'미정')}</span>
    <span style="flex-shrink:0;font-weight:900;padding:2px 9px;border-radius:99px;background:var(--b2w-tag-bg,#f1f5f9);border:1px solid var(--b2w-tag-border,#e2e8f0)">${m.done?`${m.sa}:${m.sb}`:'예정'}</span>
    <span style="flex:1;font-weight:${bWin?'900':'700'};opacity:${aWin?'.6':'1'};color:${cb}">${_cbEsc(m.b||'미정')}</span>
  </div>`;
}

function _cbFormDots(form){
  return (form||[]).slice(-5).map(v=>{
    const win=(typeof v==='object')?v.win:!!v;
    return `<span style="display:inline-block;width:8px;height:8px;border-radius:99px;margin-right:3px;background:${win?'#16a34a':'#dc2626'}"></span>`;
  }).join('');
}

/* ══════════ 1) 조별리그 브리핑 ══════════ */
function rCompLeagueBriefing(tn){
  if(!tn) return `<div style="padding:30px;text-align:center;color:var(--gray-l)">대회를 선택하세요.</div>`;
  const groups=tn.groups||[];
  const all=_cbLeagueMatches(tn);
  const done=all.filter(m=>m.done);
  const pct=_cbPct(done.length,all.length);
  const teams=_cbTeamStats(all);
  const univCount=new Set(groups.flatMap(g=>g.univs||[]).concat(all.flatMap(m=>[m.a,m.b]))).size;
  const dates=[...new Set(done.map(m=>m.d).filter(Boolean))].sort();
  const setTotal=done.reduce((s,m)=>s+(m.sa||0)+(m.sb||0),0);
  const players_=_cbPlayerStats(all);
  const topPlayers=players_.slice().sort((a,b)=>b.w-a.w||b.rate-a.rate).slice(0,5);
  const undefeated=teams.filter(t=>t.g>=2&&t.l===0);
  const leaders=groups.map((grp,gi)=>{
    const rk=(typeof _calcGrpRank==='function')?_calcGrpRank(grp):[];
    const gm=(grp.matches||[]);
    const gd=gm.filter(m=>m.sa!=null&&m.sb!=null).length;
    return {gl:'ABCDEFGHIJ'[gi]||String(gi+1),name:grp.name||'',rank:rk,done:gd,total:gm.length};
  });
  const closest=done.slice().sort((a,b)=>Math.abs(a.sa-a.sb)-Math.abs(b.sa-b.sb));
  const recent=done.slice().sort((a,b)=>String(b.d||'').localeCompare(String(a.d||''))).slice(0,5);

  if(!all.length){
    return _cbShell('League Briefing',`${tn.name} 조별리그 브리핑`,'아직 등록된 조별리그 경기가 없습니다.','핵심 지표','조편성 후 경기를 등록하면 브리핑이 생성됩니다.',
      [['조 수',groups.length+'개'],['경기','0'],['완료','0'],['진행률','0%']],
      _cbEmpty('조별리그 경기를 추가하면 브리핑이 채워집니다.'));
  }

  const lead=teams[0];
  const headline=lead?`${_cbEsc(lead.u)} ${lead.w}승 ${lead.l}패 (세트 ${lead.sw}-${lead.sl})로 선두`:'집계 중';
  let body=_cbKpis([
    ['총 경기',`${all.length}경기`,`${groups.length}개 조 · ${univCount}팀`],
    ['완료',`${done.length}경기`,`남은 경기 ${all.length-done.length}경기`],
    ['진행률',`${pct}%`,dates.length?`${_cbFmtD(dates[0])} ~ ${_cbFmtD(dates[dates.length-1])}`:'일정 미정'],
    ['누적 세트',`${setTotal}세트`,`경기당 평균 ${done.length?(setTotal/done.length).toFixed(1):'0.0'}세트`]
  ]);
  body+=`<div style="margin-top:12px">${_cbBar(pct,pct===100?'#16a34a':pct>=50?'var(--b2w-accent,#2563eb)':'#d97706')}</div>`;

  body+=_cbSection('조별 현황','각 조 선두와 진행 상황',
    `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px">
      ${leaders.map(L=>{
        const p=_cbPct(L.done,L.total);
        const top=L.rank[0];
        return `<div class="b2w2-card" style="padding:13px;border:1px solid var(--b2w-rule-soft,#e5e7eb);border-radius:12px;background:var(--b2w-paper-alt,#fff)">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
            <span style="font-size:11px;font-weight:900;color:#fff;background:var(--b2w-accent,#2563eb);padding:3px 10px;border-radius:99px">${L.gl}조</span>
            <span style="margin-left:auto;font-size:11px;font-weight:700;color:var(--b2w-ink-soft,#6b7280)">${L.done}/${L.total} · ${p}%</span>
          </div>
          ${_cbBar(p)}
          <div style="margin-top:9px;display:flex;flex-direction:column;gap:5px">
            ${L.rank.length?L.rank.slice(0,3).map((r,i)=>`<div style="display:flex;align-items:center;gap:7px;font-size:12px">
              <span style="font-weight:900;color:${i===0?'var(--b2w-gold,#b8862c)':'var(--b2w-ink-soft,#6b7280)'};min-width:14px">${i+1}</span>
              ${_cbTeamChip(r.u)}
              <span style="margin-left:auto;font-weight:800;color:var(--b2w-ink-mid,#374151)">${r.w}승 ${r.l}패</span>
              <span style="font-weight:700;color:var(--b2w-ink-soft,#6b7280)">${r.sw-r.sl>0?'+':''}${r.sw-r.sl}</span>
            </div>`).join(''):_cbEmpty('기록 없음')}
          </div>
        </div>`;
      }).join('')}
    </div>`);

  body+=`<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px;margin-top:4px">
    <div>${_cbSection('팀 성적 TOP 5','승수 · 세트 득실 기준',_cbRankList(teams.slice(0,5).map(t=>({
      name:t.u,icon:(typeof _univIconTag==='function')?_univIconTag(t.u,17):'',
      sub:`세트 ${t.sw}-${t.sl}`,value:`${t.w}승 ${t.l}패`
    }))))}</div>
    <div>${_cbSection('개인 다승 TOP 5','조별리그 세부 게임 기준',_cbRankList(topPlayers.map(p=>({
      name:p.name,color:_cbUcol(p.univ),
      sub:`${_cbFormDots(p.form)} ${p.rate}%`,value:`${p.w}승 ${p.l}패`
    }))))}</div>
  </div>`;

  body+=_cbSection('주목할 포인트','무패 팀 · 접전 경기',
    `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:12px">
      <div class="b2w2-card" style="padding:13px;border:1px solid var(--b2w-rule-soft,#e5e7eb);border-radius:12px;background:var(--b2w-paper-alt,#fff)">
        <div style="font-weight:900;margin-bottom:8px">🔥 무패 행진</div>
        ${undefeated.length?undefeated.slice(0,5).map(t=>`<div style="display:flex;align-items:center;gap:8px;padding:5px 0">${_cbTeamChip(t.u)}<span style="margin-left:auto;font-weight:800">${t.w}전 전승</span></div>`).join(''):_cbEmpty('아직 2경기 이상 무패 팀이 없습니다.')}
      </div>
      <div class="b2w2-card" style="padding:13px;border:1px solid var(--b2w-rule-soft,#e5e7eb);border-radius:12px;background:var(--b2w-paper-alt,#fff)">
        <div style="font-weight:900;margin-bottom:8px">⚡ 최고 접전</div>
        ${closest.length?closest.slice(0,3).map(m=>_cbMatchRow(m,`${m.grpLetter}조`)).join(''):_cbEmpty('완료된 경기가 없습니다.')}
      </div>
    </div>`);

  body+=_cbSection('최근 경기 결과','가장 최근에 기록된 5경기',
    recent.length?recent.map(m=>_cbMatchRow(m,`${m.grpLetter}조`)).join(''):_cbEmpty('완료된 경기가 없습니다.'));

  return _cbShell('League Briefing',`${tn.name} 조별리그 브리핑`,
    `조별리그 ${all.length}경기 중 ${done.length}경기가 완료됐습니다. 조별 판도와 팀·선수 흐름을 한 화면에서 정리했습니다.`,
    '핵심 지표',headline,
    [['진행률',`${pct}%`],['조 수',`${groups.length}개`],['참가 팀',`${univCount}팀`],['남은 경기',`${all.length-done.length}경기`]],
    body);
}

/* ══════════ 2) 토너먼트 브리핑 ══════════ */
function rCompTourBriefing(tn){
  if(!tn) return `<div style="padding:30px;text-align:center;color:var(--gray-l)">대회를 선택하세요.</div>`;
  const all=_cbBktMatches(tn);
  const done=all.filter(m=>m.done);
  const pct=_cbPct(done.length,all.length);
  const teams=_cbTeamStats(all);
  const players_=_cbPlayerStats(all).sort((a,b)=>b.w-a.w||b.rate-a.rate);
  const rounds={};
  all.forEach(m=>{ if(!rounds[m.rLabel]) rounds[m.rLabel]={label:m.rLabel,r:m.r,list:[]}; rounds[m.rLabel].list.push(m); });
  const roundArr=Object.values(rounds).sort((a,b)=>(a.r===-1?9999:a.r)-(b.r===-1?9999:b.r));
  const finals=(rounds['결승']?.list||[]).filter(m=>m.done);
  const champ=finals.length?finals[finals.length-1].winner:'';
  const runnerUp=finals.length?(finals[finals.length-1].winner===finals[finals.length-1].a?finals[finals.length-1].b:finals[finals.length-1].a):'';
  const sweeps=done.filter(m=>Math.abs(m.sa-m.sb)>=2&&Math.min(m.sa,m.sb)===0);
  const closest=done.slice().sort((a,b)=>Math.abs(a.sa-a.sb)-Math.abs(b.sa-b.sb));
  const dates=[...new Set(done.map(m=>m.d).filter(Boolean))].sort();
  const roundTier={'결승':'#f59e0b','4강':'#a855f7','8강':'#2563eb','16강':'#14b8a6'};

  if(!all.length){
    return _cbShell('Tournament Briefing',`${tn.name} 토너먼트 브리핑`,'아직 등록된 대진표 경기 기록이 없습니다.','핵심 지표','대진표 기록을 입력하면 브리핑이 생성됩니다.',
      [['라운드','-'],['경기','0'],['완료','0'],['진행률','0%']],
      _cbEmpty('대진표 기록에서 결과를 입력하면 여기에 정리됩니다.'));
  }

  let body='';
  if(champ){
    body+=`<div style="display:flex;align-items:center;gap:12px;padding:14px 18px;border-radius:14px;background:linear-gradient(135deg,#f59e0b,#d97706);box-shadow:0 6px 18px rgba(245,158,11,.28);margin-bottom:14px">
      <span style="font-size:26px">🏆</span>
      <div>
        <div style="font-size:11px;font-weight:900;color:rgba(255,255,255,.85);letter-spacing:.08em">CHAMPION</div>
        <div style="font-size:19px;font-weight:900;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.25)">${_cbEsc(champ)}</div>
      </div>
      ${runnerUp?`<div style="margin-left:auto;text-align:right">
        <div style="font-size:10px;font-weight:900;color:rgba(255,255,255,.85)">준우승</div>
        <div style="font-size:14px;font-weight:900;color:#fff">${_cbEsc(runnerUp)}</div>
      </div>`:''}
    </div>`;
  }
  body+=_cbKpis([
    ['총 경기',`${all.length}경기`,`${roundArr.length}개 라운드`],
    ['완료',`${done.length}경기`,`남은 경기 ${all.length-done.length}경기`],
    ['진행률',`${pct}%`,dates.length?`${_cbFmtD(dates[0])} ~ ${_cbFmtD(dates[dates.length-1])}`:'일정 미정'],
    ['우승팀',champ?_cbEsc(champ):'미정',champ?`준우승 ${_cbEsc(runnerUp||'-')}`:'결승 결과 대기']
  ]);
  body+=`<div style="margin-top:12px">${_cbBar(pct,pct===100?'#16a34a':'var(--b2w-accent,#2563eb)')}</div>`;

  body+=_cbSection('라운드별 진행','8강 → 4강 → 결승 흐름',
    `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px">
      ${roundArr.map(R=>{
        const dc=R.list.filter(m=>m.done).length;
        const p=_cbPct(dc,R.list.length);
        const col=roundTier[R.label]||'#64748b';
        return `<div class="b2w2-card" style="padding:13px;border:1px solid var(--b2w-rule-soft,#e5e7eb);border-top:4px solid ${col};border-radius:12px;background:var(--b2w-paper-alt,#fff)">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
            <span style="font-size:11px;font-weight:900;color:#fff;background:${col};padding:3px 10px;border-radius:99px">${_cbEsc(R.label)}</span>
            <span style="margin-left:auto;font-size:11px;font-weight:700;color:var(--b2w-ink-soft,#6b7280)">${dc}/${R.list.length} · ${p}%</span>
          </div>
          ${_cbBar(p,col)}
          <div style="margin-top:9px">${R.list.map(m=>_cbMatchRow(m,'')).join('')}</div>
        </div>`;
      }).join('')}
    </div>`);

  body+=`<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px">
    <div>${_cbSection('팀 성적 TOP 5','토너먼트 승수 기준',_cbRankList(teams.slice(0,5).map(t=>({
      name:t.u,icon:(typeof _univIconTag==='function')?_univIconTag(t.u,17):'',
      sub:`세트 ${t.sw}-${t.sl}`,value:`${t.w}승 ${t.l}패`
    }))))}</div>
    <div>${_cbSection('개인 다승 TOP 5','토너먼트 세부 게임 기준',_cbRankList(players_.slice(0,5).map(p=>({
      name:p.name,color:_cbUcol(p.univ),
      sub:`${_cbFormDots(p.form)} ${p.rate}%`,value:`${p.w}승 ${p.l}패`
    }))))}</div>
  </div>`;

  body+=_cbSection('주목할 경기','완승과 접전',
    `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:12px">
      <div class="b2w2-card" style="padding:13px;border:1px solid var(--b2w-rule-soft,#e5e7eb);border-radius:12px;background:var(--b2w-paper-alt,#fff)">
        <div style="font-weight:900;margin-bottom:8px">💥 완승 경기</div>
        ${sweeps.length?sweeps.slice(0,3).map(m=>_cbMatchRow(m,m.rLabel)).join(''):_cbEmpty('셧아웃 경기가 없습니다.')}
      </div>
      <div class="b2w2-card" style="padding:13px;border:1px solid var(--b2w-rule-soft,#e5e7eb);border-radius:12px;background:var(--b2w-paper-alt,#fff)">
        <div style="font-weight:900;margin-bottom:8px">⚡ 최고 접전</div>
        ${closest.length?closest.slice(0,3).map(m=>_cbMatchRow(m,m.rLabel)).join(''):_cbEmpty('완료된 경기가 없습니다.')}
      </div>
    </div>`);

  return _cbShell('Tournament Briefing',`${tn.name} 토너먼트 브리핑`,
    `대진표 ${all.length}경기 중 ${done.length}경기가 기록됐습니다. 라운드별 진행과 결승 결과를 정리했습니다.`,
    '핵심 지표',champ?`🏆 ${_cbEsc(champ)} 우승`:'결승 결과 대기 중',
    [['진행률',`${pct}%`],['라운드',`${roundArr.length}개`],['참가 팀',`${teams.length}팀`],['남은 경기',`${all.length-done.length}경기`]],
    body);
}

/* ══════════ 3) 대회 종합 브리핑 ══════════ */
function rCompOverallBriefing(tn){
  if(!tn) return `<div style="padding:30px;text-align:center;color:var(--gray-l)">대회를 선택하세요.</div>`;
  const lg=_cbLeagueMatches(tn);
  const bk=_cbBktMatches(tn);
  const all=lg.concat(bk);
  const lgDone=lg.filter(m=>m.done), bkDone=bk.filter(m=>m.done);
  const done=lgDone.length+bkDone.length;
  const pct=_cbPct(done,all.length);
  const teams=_cbTeamStats(all);
  const lgPs=_cbPlayerStats(lg), bkPs=_cbPlayerStats(bk);
  const pmap={};
  [...lgPs,...bkPs].forEach(p=>{
    if(!pmap[p.name]) pmap[p.name]={name:p.name,univ:p.univ,w:0,l:0,form:[],lgW:0,bkW:0};
    pmap[p.name].w+=p.w; pmap[p.name].l+=p.l; pmap[p.name].form=pmap[p.name].form.concat(p.form);
  });
  lgPs.forEach(p=>{pmap[p.name].lgW=p.w;});
  bkPs.forEach(p=>{pmap[p.name].bkW=p.w;});
  const allPs=Object.values(pmap).map(p=>{
    const total=p.w+p.l;
    const form=p.form.slice().sort((a,b)=>(a.d||'').localeCompare(b.d||''));
    return {...p,total,rate:total?Math.round(p.w/total*100):0,form};
  }).filter(p=>p.total>0);
  const mvp=allPs.slice().sort((a,b)=>b.w-a.w||b.rate-a.rate)[0]||null;
  const bestRate=allPs.filter(p=>p.total>=3).sort((a,b)=>b.rate-a.rate||b.w-a.w).slice(0,5);
  const mostGames=allPs.slice().sort((a,b)=>b.total-a.total).slice(0,5);
  const finals=bk.filter(m=>m.rLabel==='결승'&&m.done);
  const champ=finals.length?finals[finals.length-1].winner:'';
  const dates=[...new Set(all.filter(m=>m.done).map(m=>m.d).filter(Boolean))].sort();
  const setTotal=all.filter(m=>m.done).reduce((s,m)=>s+(m.sa||0)+(m.sb||0),0);

  if(!all.length){
    return _cbShell('Competition Briefing',`${tn.name} 대회 브리핑`,'아직 등록된 경기가 없습니다.','핵심 지표','조별리그와 대진표 기록이 쌓이면 종합 브리핑이 생성됩니다.',
      [['경기','0'],['완료','0'],['진행률','0%'],['우승팀','미정']],
      _cbEmpty('경기 결과를 입력하면 종합 브리핑이 채워집니다.'));
  }

  let body='';
  if(champ){
    body+=`<div style="display:flex;align-items:center;gap:12px;padding:14px 18px;border-radius:14px;background:linear-gradient(135deg,#f59e0b,#d97706);box-shadow:0 6px 18px rgba(245,158,11,.28);margin-bottom:14px">
      <span style="font-size:26px">🏆</span>
      <div>
        <div style="font-size:11px;font-weight:900;color:rgba(255,255,255,.85);letter-spacing:.08em">CHAMPION</div>
        <div style="font-size:19px;font-weight:900;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.25)">${_cbEsc(champ)}</div>
      </div>
      ${mvp?`<div style="margin-left:auto;text-align:right">
        <div style="font-size:10px;font-weight:900;color:rgba(255,255,255,.85)">대회 MVP</div>
        <div style="font-size:14px;font-weight:900;color:#fff">${_cbEsc(mvp.name)} · ${mvp.w}승</div>
      </div>`:''}
    </div>`;
  }
  body+=_cbKpis([
    ['전체 경기',`${all.length}경기`,`조별 ${lg.length} · 대진표 ${bk.length}`],
    ['완료',`${done}경기`,`조별 ${lgDone.length} · 대진표 ${bkDone.length}`],
    ['진행률',`${pct}%`,dates.length?`${_cbFmtD(dates[0])} ~ ${_cbFmtD(dates[dates.length-1])}`:'일정 미정'],
    ['참가 선수',`${allPs.length}명`,`누적 ${setTotal}세트`]
  ]);
  body+=`<div style="margin-top:12px">${_cbBar(pct,pct===100?'#16a34a':'var(--b2w-accent,#2563eb)')}</div>`;

  body+=_cbSection('단계별 진행','조별리그와 대진표 진행 현황',
    `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px">
      ${[['📅 조별리그',lg.length,lgDone.length,'var(--b2w-accent,#2563eb)'],['🗂️ 대진표',bk.length,bkDone.length,'#f59e0b']].map(([lbl,t,d,col])=>{
        const p=_cbPct(d,t);
        return `<div class="b2w2-card" style="padding:13px;border:1px solid var(--b2w-rule-soft,#e5e7eb);border-top:4px solid ${col};border-radius:12px;background:var(--b2w-paper-alt,#fff)">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
            <span style="font-weight:900">${lbl}</span>
            <span style="margin-left:auto;font-size:11px;font-weight:700;color:var(--b2w-ink-soft,#6b7280)">${d}/${t} · ${p}%</span>
          </div>
          ${_cbBar(p,col)}
        </div>`;
      }).join('')}
    </div>`);

  body+=`<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px">
    <div>${_cbSection('팀 종합 순위 TOP 5','조별리그 + 대진표 합산',_cbRankList(teams.slice(0,5).map(t=>({
      name:t.u,icon:(typeof _univIconTag==='function')?_univIconTag(t.u,20):'',
      sub:`세트 ${t.sw}-${t.sl}`,value:`${t.w}승 ${t.l}패`
    }))))}</div>
    <div>${_cbSection('개인 다승 TOP 5','대회 전체 세부 게임 기준',_cbRankList(allPs.slice().sort((a,b)=>b.w-a.w||b.rate-a.rate).slice(0,5).map(p=>({
      name:p.name,color:_cbUcol(p.univ),icon:_cbPlayerAvatar(p.name,28),
      sub:`${_cbFormDots(p.form)} 조별 ${p.lgW}승 · 대진표 ${p.bkW}승`,value:`${p.w}승 ${p.l}패`
    }))))}</div>
    <div>${_cbSection('승률 TOP 5','3경기 이상',_cbRankList(bestRate.map(p=>({
      name:p.name,color:_cbUcol(p.univ),icon:_cbPlayerAvatar(p.name,28),
      sub:`${p.w}승 ${p.l}패`,value:`${p.rate}%`
    }))))}</div>
    <div>${_cbSection('최다 출전 TOP 5','세부 게임 출전 수',_cbRankList(mostGames.map(p=>({
      name:p.name,color:_cbUcol(p.univ),icon:_cbPlayerAvatar(p.name,28),
      sub:`${p.w}승 ${p.l}패`,value:`${p.total}게임`
    }))))}</div>
  </div>`;

  /* ── 조별리그 팀 승패 / 승률 TOP ── */
  const lgTeams=_cbTeamStats(lg).filter(t=>t.g>0);
  const lgWinTop=lgTeams.slice(0,5);
  const lgRateTop=lgTeams.filter(t=>t.g>=2).slice().sort((a,b)=>b.rate-a.rate||b.w-a.w||b.diff-a.diff).slice(0,5);
  body+=`<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px">
    <div>${_cbSection('조별리그 승패 TOP 5','승수 · 세트 득실 기준',_cbRankList(lgWinTop.map(t=>({
      name:t.u,icon:(typeof _univIconTag==='function')?_univIconTag(t.u,20):'',
      sub:`세트 ${t.sw}-${t.sl} (${t.diff>0?'+':''}${t.diff})`,value:`${t.w}승 ${t.l}패`
    }))))}</div>
    <div>${_cbSection('조별리그 승률 TOP 5','2경기 이상',_cbRankList(lgRateTop.map(t=>({
      name:t.u,icon:(typeof _univIconTag==='function')?_univIconTag(t.u,20):'',
      sub:`${t.w}승 ${t.l}패`,value:`${t.rate}%`
    }))))}</div>
  </div>`;

  /* ── 조별 순위 (조 색상 배지) ── */
  const grpCards=(tn.groups||[]).map((grp,gi)=>{
    const gl='ABCDEFGHIJ'[gi]||String(gi+1);
    const col=_cbGrpColor(gi);
    const rk=(typeof _calcGrpRank==='function')?_calcGrpRank(grp):[];
    const gm=(grp.matches||[]);
    const gd=gm.filter(m=>m.sa!=null&&m.sb!=null).length;
    const pr=_cbPct(gd,gm.length);
    return `<div class="b2w2-card" style="padding:13px;border:1px solid var(--b2w-rule-soft,#e5e7eb);border-top:4px solid ${col};border-radius:12px;background:var(--b2w-paper-alt,#fff)">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
        ${_cbGrpBadge(gl,gi,grp.name||(gl+'조'))}
        <span style="margin-left:auto;font-size:11px;font-weight:700;color:var(--b2w-ink-soft,#6b7280)">${gd}/${gm.length} · ${pr}%</span>
      </div>
      ${_cbBar(pr,col)}
      <div style="margin-top:10px;display:flex;flex-direction:column;gap:6px">
        ${rk.length?rk.map((r,i)=>{
          const tot=r.w+r.l;
          return `<div style="display:flex;align-items:center;gap:8px;font-size:12px">
            <span style="font-weight:900;min-width:16px;color:${i===0?col:'var(--b2w-ink-soft,#6b7280)'}">${i+1}</span>
            ${_cbTeamChip(r.u)}
            <span style="margin-left:auto;font-weight:800;color:var(--b2w-ink-mid,#374151)">${r.w}승 ${r.l}패</span>
            <span style="font-weight:800;color:${col}">${tot?Math.round(r.w/tot*100):0}%</span>
            <span style="font-weight:700;color:var(--b2w-ink-soft,#6b7280)">${r.sw-r.sl>0?'+':''}${r.sw-r.sl}</span>
          </div>`;
        }).join(''):_cbEmpty('기록 없음')}
      </div>
    </div>`;
  }).join('');
  body+=_cbSection('조별 순위','조별 승패 · 승률 · 세트 득실',
    grpCards?`<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px">${grpCards}</div>`:_cbEmpty('조편성이 없습니다.'));

  /* ── 대진표 기록 (라운드별) ── */
  const bkRounds={};
  bk.forEach(m=>{ if(!bkRounds[m.rLabel]) bkRounds[m.rLabel]={label:m.rLabel,r:m.r,list:[]}; bkRounds[m.rLabel].list.push(m); });
  const bkRoundArr=Object.values(bkRounds).sort((a,b)=>(a.r===-1?9999:a.r)-(b.r===-1?9999:b.r));
  const _cbRoundTier={'결승':'#f59e0b','4강':'#a855f7','8강':'#2563eb','16강':'#14b8a6'};
  body+=_cbSection('대진표 기록','라운드별 경기 결과',
    bkRoundArr.length?`<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px">
      ${bkRoundArr.map(R=>{
        const dc=R.list.filter(m=>m.done).length;
        const pr=_cbPct(dc,R.list.length);
        const col=_cbRoundTier[R.label]||'#64748b';
        return `<div class="b2w2-card" style="padding:13px;border:1px solid var(--b2w-rule-soft,#e5e7eb);border-top:4px solid ${col};border-radius:12px;background:var(--b2w-paper-alt,#fff)">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
            <span style="font-size:11px;font-weight:900;color:#fff;background:${col};padding:3px 10px;border-radius:99px">${_cbEsc(R.label)}</span>
            <span style="margin-left:auto;font-size:11px;font-weight:700;color:var(--b2w-ink-soft,#6b7280)">${dc}/${R.list.length} · ${pr}%</span>
          </div>
          ${_cbBar(pr,col)}
          <div style="margin-top:9px">${R.list.map(m=>_cbMatchRow(m,'')).join('')}</div>
        </div>`;
      }).join('')}
    </div>`:_cbEmpty('대진표 기록이 없습니다.'));

  return _cbShell('Competition Briefing',`${tn.name} 대회 브리핑`,
    `조별리그와 대진표를 합쳐 ${all.length}경기 중 ${done}경기가 기록됐습니다. 대회 전체 흐름을 종합해 정리했습니다.`,
    '핵심 지표',champ?`🏆 ${_cbEsc(champ)} 우승${mvp?` · MVP ${_cbEsc(mvp.name)}`:''}`:(mvp?`MVP 후보 ${_cbEsc(mvp.name)} (${mvp.w}승)`:'집계 중'),
    [['진행률',`${pct}%`],['참가 팀',`${teams.length}팀`],['참가 선수',`${allPs.length}명`],['우승팀',champ?_cbEsc(champ):'미정']],
    body);
}

try{
  window.rCompLeagueBriefing = rCompLeagueBriefing;
  window.rCompTourBriefing = rCompTourBriefing;
  window.rCompOverallBriefing = rCompOverallBriefing;
}catch(e){}
