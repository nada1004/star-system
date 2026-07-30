/* ══════════════════════════════════════════════════════════════
   설정 - 설정 검색(섹션 필터) (settings-cfg-apply.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

window.cfgSearchSettings = function(q){
  window._cfgSearchQ = String(q||'').trim();
  const qq = window._cfgSearchQ.toLowerCase();
  const _cfgAliasMap = {
    '밝기':['brightness','원색','광도','노출','환하게'],
    '원색':['밝기','색감','컬러','color','채도','saturate'],
    '색감':['원색','채도','컬러','color','saturate'],
    '흑백':['회색','gray','grey','grayscale','무채색'],
    '회색':['흑백','gray','grey','grayscale','무채색'],
    '채도':['원색','색감','saturate','컬러','color'],
    '투명도':['opacity','불투명도','알파','alpha'],
    '프로필':['사진','이미지','아바타','avatar','photo','img'],
    '사진':['프로필','이미지','아바타','avatar','photo','img'],
    '이미지':['사진','프로필','썸네일','thumbnail','img','photo'],
    '배경':['background','bg','뒷배경','배경색'],
    '테두리':['border','라인','선','외곽선'],
    '폰트':['글자','텍스트','서체','font','타이포'],
    '글자':['폰트','텍스트','font','타이포'],
    '맵':['map','맵명','지도'],
    '날짜':['date','일자','날자'],
    '진사람':['패자','패배','패배팀','loser','lose','진 선수'],
    '패자':['진사람','패배팀','loser','lose','진 선수'],
    '패배팀':['진사람','패자','loser','lose','진 팀'],
    '이긴사람':['승자','승리','winner','win','이긴 선수'],
    '승자':['이긴사람','승리','winner','win','이긴 선수'],
    '기록':['카드','기록카드','record','history'],
    '팝업':['모달','modal','상세'],
    '모달':['팝업','modal','상세'],
    '검색':['서치','찾기','필터','search'],
    '순위':['랭킹','포디움','rank','ranking'],
    '포디움':['순위','랭킹','1등','2등','3등','podium']
  };
  const _normCfgSearchText = function(v){
    return String(v||'')
      .replace(/<[^>]+>/g,' ')
      .replace(/\s+/g,' ')
      .trim()
      .toLowerCase();
  };
  const _expandCfgSearchToken = function(tok){
    const base = _normCfgSearchText(tok);
    const out = new Set(base ? [base] : []);
    if(!base) return [];
    Object.keys(_cfgAliasMap).forEach(function(key){
      const nk = _normCfgSearchText(key);
      const aliases = (_cfgAliasMap[key]||[]).map(_normCfgSearchText).filter(Boolean);
      if(base.includes(nk) || nk.includes(base) || aliases.some(function(a){ return a.includes(base) || base.includes(a); })){
        out.add(nk);
        aliases.forEach(function(a){ out.add(a); });
      }
    });
    return Array.from(out).filter(Boolean);
  };
  const _queryGroups = _normCfgSearchText(window._cfgSearchQ).split(' ').filter(Boolean).map(_expandCfgSearchToken);
  const _matchCfgSearch = function(hay){
    const hh = _normCfgSearchText(hay);
    if(!hh) return { hit:false, label:'' };
    if(!_queryGroups.length) return { hit:false, label:'' };
    const labels = [];
    for(let i=0;i<_queryGroups.length;i++){
      const group = _queryGroups[i]||[];
      let matched = '';
      for(let j=0;j<group.length;j++){
        const token = group[j];
        if(token && hh.includes(token)){
          matched = token;
          break;
        }
      }
      if(!matched) return { hit:false, label:'' };
      labels.push(matched);
    }
    return { hit:true, label:labels.join(', ') };
  };
  // 검색어 없으면 현재 카테고리 기준으로 복구
  if(!qq){
    try{ _cfgApplyCat(window._cfgCat, false); }catch(e){}
    try{ const cnt=document.getElementById('cfgSearchCnt'); if(cnt) cnt.textContent=''; }catch(e){}
    try{ const sug=document.getElementById('cfgSearchSug'); if(sug){ sug.innerHTML=''; sug.style.display='none'; } }catch(e){}
    return;
  }
  let shown=0;
  const hits=[];
  const _linkedTextMap = {};
  try{
    document.querySelectorAll('button[onclick*="cfgGo("], [onclick*="cfgGo("]').forEach(function(btn){
      try{
        const oc = String(btn.getAttribute('onclick')||'');
        const m = oc.match(/cfgGo\('([^']+)'\)/);
        if(!m || !m[1]) return;
        const id = String(m[1]).trim();
        if(!id) return;
        const txt = _normCfgSearchText([
          btn.textContent || '',
          btn.innerText || '',
          btn.getAttribute('title') || '',
          btn.getAttribute('aria-label') || ''
        ].join(' '));
        if(!txt) return;
        _linkedTextMap[id] = (_linkedTextMap[id] ? (_linkedTextMap[id] + ' ') : '') + txt;
      }catch(e){}
    });
    document.querySelectorAll('[data-cfg-bottom-panel]').forEach(function(panel){
      panel.style.display = '';
    });
    const secs=document.querySelectorAll('[data-cfg-sec]');
    for(let i=0;i<secs.length;i++){
      const el=secs[i];
      // 모달에 올라간 섹션은 숨기지 않음
      try{ if(el.closest && el.closest('#cfgModalBody')) continue; }catch(e){}
      const id=el.getAttribute('data-cfg-sec')||'';
      const t = (window._cfgSecTitle && window._cfgSecTitle[id]) ? String(window._cfgSecTitle[id]) : id;
      const plain = t.replace(/<[^>]+>/g,'').replace(/^[\u{1F300}-\u{1FAFF}\u2600-\u27BF]+\s*/u,'');
      // 섹션 제목뿐 아니라 내부 세부 설정 문구도 검색 대상에 포함.
      // data-cfg-searchtext 속성을 캐시로 사용하며, rCfg 렌더 시 속성이 제거돼 자동 재수집됨.
      let st = el.getAttribute('data-cfg-searchtext');
      if(!st){
        try{
          const raw = [el.textContent || '', el.innerText || ''].filter(Boolean).join(' ');
          const desc = (window._cfgSecDescMap && window._cfgSecDescMap[id]) ? String(window._cfgSecDescMap[id]) : '';
          const linked = _linkedTextMap[id] || '';
          // 빈 innerText는 캐싱하지 않음 (아직 화면에 없는 동적 섹션 대비)
          st = _normCfgSearchText(id + ' ' + plain + ' ' + desc + ' ' + linked + ' ' + raw);
          if(raw.trim()) el.setAttribute('data-cfg-searchtext', st);
        }catch(e){
          st = _normCfgSearchText(id + ' ' + plain);
        }
      }
      const titleMatch = _matchCfgSearch(id + ' ' + plain);
      const bodyMatch = _matchCfgSearch(st);
      const hit = !!(titleMatch.hit || bodyMatch.hit);
      el.style.display = hit ? '' : 'none';
      if(hit) shown++;
      if(hit) hits.push({
        id,
        t:plain,
        st,
        m:titleMatch.label || bodyMatch.label || '',
        score:(titleMatch.hit?100:0) + (bodyMatch.hit?20:0) + (st.includes(qq)?10:0)
      });
      if(el.tagName==='DETAILS') el.open=!!hit;
    }
  }catch(e){}
  try{ const cnt=document.getElementById('cfgSearchCnt'); if(cnt) cnt.textContent = `검색 ${shown}개`; }catch(e){}

  // (개선) 검색 결과 "바로가기" 추천 목록
  try{
    const sug=document.getElementById('cfgSearchSug');
    if(!sug) return;
    const uniq = [];
    const seen = new Set();
    hits.forEach(function(x){
      if(!x || !x.id || seen.has(x.id)) return;
      seen.add(x.id);
      uniq.push(x);
    });
    uniq.sort((a,b)=>(b.score||0)-(a.score||0) || a.t.localeCompare(b.t,'ko'));
    const top=uniq.slice(0,10);
    if(!top.length){
      sug.innerHTML='';
      sug.style.display='none';
      return;
    }
    sug.innerHTML = top.map(x=>`<button type="button" class="cfg-search-item" onclick="(function(){try{cfgGo('${x.id}');}catch(e){};try{document.getElementById('cfgSearchSug').style.display='none';}catch(e){}})()"><span style="display:block;font-size:var(--fs-sm);font-weight:900;color:var(--text2)">${x.t}</span><span style="display:block;font-size:10px;color:var(--gray-l);font-weight:700">${x.m ? '매칭: '+x.m : '내부 기능 설정 매칭'}</span></button>`).join('');
    sug.style.display='block';
  }catch(e){}
};

// 디버그 플래그 (기본 OFF): URL에 ?cfgdebug=1 이 포함되면 콘솔에 자세히 기록
try{
  if(typeof window.__CFG_DEBUG==='undefined'){
    window.__CFG_DEBUG = (typeof location!=='undefined' && (location.search||'').indexOf('cfgdebug=1')!==-1);
  }
}catch(e){}


// rCfg / reCfg 는 settings-render.js 에서 단독 정의됩니다. 이 파일에서는 정의하지 않습니다.
// (CRITICAL fix: 이중 정의 제거 — settings-render.js 가 권위 소스)



// ── 설정/메모 동기화(GitHub Gist) 상태 패널 ──
