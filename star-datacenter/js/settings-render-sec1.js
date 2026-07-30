// settings-render.js에서 분리됨 (설정 탭 렌더링 — 공지/대학/맵/헤더/BGM/멀티뷰/붙여넣기자동분리)
function _cfgSecGroup1(ctx){
  const {isLoggedIn,isSubAdmin,_escHTML,_escJS,_escAttr,esc,_players,localStorage,notices,univCfg,_catSecs,_cfgCats,_cfgCatIcons,_catLabel,_cfgCatDesc,_cfgSecTitle,typeOpts,_curSecs,_regBtn,_menuBtn,_afOn,_rcOn,_rcAccent,_rcBg,_rcHd,_rcIc,_rcUnivFont,_ymScale,_rcMemoOn,_sfxOn,_sfxMode,_sfxInt,_sfxLen,_sfxTail,_sfxSoft,_sfxEdge,_avaScale,_mvpFxOn,_mvpFxStyle,_mvpFxIntensity,_mvpDesignMode,_briefingTheme,_cfgSecDescFallback,_cfgSecDesc,_getCfgSecDesc,_secButtons,_catCardAccents,_catCardsHtml,_secBtnColors,_secBtnIcColors,_secButtonsHtml,_cfgHeroStats,_cfgHeroStatsHtml} = ctx;
  return `<div class="cfg-page">
  <div class="no-export cfg-topbar" style="position:sticky;top:0;z-index:10;background:var(--bg);padding:0;margin-bottom:0;border-bottom:1px solid var(--border)">
    <!-- ① 스티키 헤더: 검색 -->
    <div class="cfg-toolbar-row" style="display:flex;align-items:center;gap:7px;padding:7px 2px;flex-wrap:nowrap">
      <div class="cfg-search-wrap" style="position:relative;flex:1;min-width:0">
        <span style="position:absolute;left:9px;top:50%;transform:translateY(-50%);font-size:var(--fs-sm);pointer-events:none;opacity:.4">🔎</span>
        <input id="cfgSearchInp" placeholder="설정 검색 (예: 프로필, 배경, 폰트...)" value="${esc(String(window._cfgSearchQ||''))}"
          style="width:100%;padding:6px 10px 6px 28px;border:1.5px solid var(--border2);border-radius:20px;font-size:var(--fs-sm);font-weight:700;background:var(--surface);box-sizing:border-box"
          oninput="cfgSearchSettings(this.value)">
        <div id="cfgSearchSug" class="cfg-search-sug" style="display:none"></div>
      </div>
      <span id="cfgSearchCnt" class="cfg-search-count" style="font-size:10px;color:var(--gray-l);font-weight:900;white-space:nowrap;flex-shrink:0"></span>
      ${_menuBtn}
      ${_regBtn}
    </div>
  </div>

  <section class="no-export cfg-hero">
    <div class="cfg-hero__main">
      <div class="cfg-hero__eyebrow">⚙️ 설정</div>
      <div class="cfg-hero__title">설정 탭</div>
      <div class="cfg-hero__desc">
        <strong>${_catLabel(window._cfgCat)}</strong> — ${_cfgCatDesc[window._cfgCat] || '원하는 카테고리를 선택해 설정을 찾아보세요.'}
      </div>
    </div>
    <div class="cfg-hero__stats">
      ${_cfgHeroStatsHtml}
    </div>
  </section>

  <!-- ② 카테고리 카드 그리드 + 세부 설정 목록 (단일 레이아웃) -->
  <div class="no-export cfg-overview-block" style="margin:10px 0 6px">
    <div class="cfg-subpanel__label" style="font-size:10px;font-weight:900;color:var(--gray-l);margin-bottom:6px">🗂️ 카테고리 선택</div>
    <div class="cfg-cat-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:7px;margin-bottom:10px">
      ${_catCardsHtml}
    </div>
    <div class="cfg-subpanel cfg-subpanel--surface" data-cfg-bottom-panel="1" style="padding:10px;border:1px solid var(--border);border-radius:14px;background:var(--surface)">
      <div class="cfg-section-head" style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:7px">
        <div class="cfg-section-title" style="font-size:var(--fs-caption);font-weight:900;color:var(--text2)">📚 <span data-cfg-cur-cat-label="1">${_catLabel(window._cfgCat)}</span></div>
        <span style="font-size:10px;font-weight:800;color:var(--gray-l)">${_curSecs.length}개 항목</span>
      </div>
      <div class="cfg-sec-grid" data-cfg-cur-sec-buttons="1" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:5px">
        ${_secButtonsHtml}
      </div>
    </div>
  </div>
<div class="cfg-bottom-sections-grid">
${_scfgD('notice','📢 공지 관리')}
    <div style="font-size:var(--fs-sm);color:var(--gray-l);margin-bottom:14px">접속 시 팝업으로 표시됩니다. 활성화된 공지만 보여집니다.</div>
    <div id="notice-list-area" style="margin-bottom:16px">
    ${notices.length===0?`<div style="padding:18px;text-align:center;color:var(--gray-l);background:var(--surface);border-radius:var(--r);font-size:var(--fs-base)">등록된 공지 없음</div>`:
      notices.map((n,i)=>`<div style="border:1px solid var(--border);border-radius:var(--r);padding:12px 14px;margin-bottom:8px;background:${n.active?'var(--white)':'var(--surface)'};opacity:${n.active?1:0.6}">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
          <span style="font-size:var(--fs-lg)">${n.type||'📢'}</span>
          <span style="font-weight:700;flex:1;font-size:var(--fs-base)">${n.title||'(제목 없음)'}</span>
          <span style="font-size:var(--fs-caption);color:var(--gray-l)">${n.date||''}</span>
          <button class="btn btn-xs" style="background:${n.active?'#f0fdf4':'#f1f5f9'};color:${n.active?'#16a34a':'#64748b'};border:1px solid ${n.active?'#86efac':'#cbd5e1'};min-width:52px"
            onclick="notices[${i}].active=!notices[${i}].active;save();render()">
            ${n.active?'✅ 활성':'⭕ 비활성'}</button>
          <button class="btn btn-r btn-xs" onclick="if(confirm('공지를 삭제할까요?')){notices.splice(${i},1);save();render()}">🗑️</button>
        </div>
        ${(n.body||'').length>120
          ? `<div id="notice-body-${i}" style="font-size:var(--fs-sm);color:var(--text2);white-space:pre-wrap;max-height:60px;overflow:hidden">${(n.body||'').slice(0,120)}...</div>
             <button onclick="(function(){const el=document.getElementById('notice-body-${i}');const btn=document.getElementById('notice-exp-${i}');const open=el.style.maxHeight!=='none';el.style.maxHeight=open?'none':'60px';el.textContent=open?notices[${i}].body:notices[${i}].body.slice(0,120)+'...';btn.textContent=open?'▲ 접기':'▼ 전체보기';})()" id="notice-exp-${i}" style="background:none;border:none;color:var(--blue);font-size:var(--fs-caption);cursor:pointer;padding:2px 0;font-weight:600">▼ 전체보기</button>`
          : `<div style="font-size:var(--fs-sm);color:var(--text2);white-space:pre-wrap">${n.body||''}</div>`
        }
      </div>`).join('')
    }
    </div>
    <div style="border:1.5px dashed var(--border2);border-radius:12px;padding:16px;background:var(--surface)">
      <div style="font-size:var(--fs-sm);font-weight:700;color:var(--text2);margin-bottom:10px">+ 새 공지 작성</div>
      <div style="display:flex;gap:8px;margin-bottom:8px;flex-wrap:wrap">
        <select id="new-notice-type" style="width:140px;border:1px solid var(--border2);border-radius:7px;padding:5px 8px;font-size:var(--fs-base)">
          ${typeOpts.map(o=>`<option value="${o.v}">${o.l}</option>`).join('')}
        </select>
        <input type="text" id="new-notice-title" placeholder="공지 제목" style="flex:1;min-width:180px">
      </div>
      <textarea id="new-notice-body" placeholder="공지 내용을 입력하세요..." style="width:100%;height:80px;resize:vertical;border:1px solid var(--border2);border-radius:8px;padding:8px 10px;font-size:var(--fs-base);box-sizing:border-box"></textarea>
      <div style="display:flex;align-items:center;gap:10px;margin-top:8px">
        <label style="display:flex;align-items:center;gap:5px;font-size:var(--fs-sm);cursor:pointer">
          <input type="checkbox" id="new-notice-active" checked> 즉시 활성화
        </label>
        <button class="btn btn-b" style="margin-left:auto" onclick="
          const t=document.getElementById('new-notice-title').value.trim();
          const b=document.getElementById('new-notice-body').value.trim();
          const tp=document.getElementById('new-notice-type').value;
          const ac=document.getElementById('new-notice-active').checked;
          if(!t){alert('제목을 입력하세요');return;}
          notices.unshift({id:Date.now(),type:tp,title:t,body:b,active:ac,date:new Date().toLocaleDateString('ko-KR')});
          save();render();">📢 공지 등록</button>
      </div>
    </div>
  </details>
  ${(()=>{
    const seen={};const dupNames=[];
    _players.forEach(p=>{if(seen[p.name])dupNames.push(p.name);else seen[p.name]=true;});
    const uniq=[...new Set(dupNames)];
    if(!uniq.length) return '';
    return `<div class="ssec" style="border:2px solid #fca5a5;background:#fff5f5">
      <h4 style="color:#dc2626">⚠️ 동명이인 감지 (${uniq.length}건)</h4>
      <div style="font-size:var(--fs-sm);color:#7f1d1d;margin-bottom:12px">중복 이름이 있으면 승패·기록이 뒤섞입니다. 한 명의 이름을 바꿔 구분하세요.</div>
      ${uniq.map(name=>{
        const dupes=_players.map((p,i)=>({p,i})).filter(({p})=>p.name===name);
        return `<div style="background:var(--white);border:1px solid #fca5a5;border-radius:8px;padding:10px 12px;margin-bottom:8px">
          <div style="font-weight:800;color:#dc2626;font-size:var(--fs-base);margin-bottom:6px">👥 "${name}" — ${dupes.length}명 중복</div>
          ${dupes.map(({p,i})=>`<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;flex-wrap:wrap">
            <span style="font-size:var(--fs-caption);background:#fee2e2;color:#991b1b;border-radius:4px;padding:1px 7px;font-weight:700">${p.univ||'무소속'}</span>
            <span style="font-size:var(--fs-caption);color:var(--gray-l)">${p.tier||'-'} · ${p.race||'-'}</span>
            <input type="text" id="dupfix-${i}" placeholder="새 이름..." style="flex:1;min-width:100px;padding:3px 7px;border-radius:5px;border:1px solid #fca5a5;font-size:var(--fs-sm)">
            <button class="btn btn-xs" style="background:#dc2626;color:#fff;border-color:#dc2626" onclick="(function(){
              const inp=document.getElementById('dupfix-${i}');
              const nw=(inp?.value||'').trim();
              if(!nw){alert('새 이름을 입력하세요.');return;}
              const _players = Array.isArray(window.players) ? window.players : [];
              if(!_players[${i}]){alert('대상 스트리머를 찾을 수 없습니다.');return;}
              if(_players.find((x,xi)=>x && x.name===nw && xi!==${i})){alert('이미 존재하는 이름입니다.');return;}
              window.editName = _players[${i}].name;
              try{ const _em=document.getElementById('emBody'); if(_em) _em.innerHTML=''; }catch(e){}
              const oldN = _players[${i}].name;
              _players[${i}].name = nw;
              _players.forEach(other=>{(other && other.history || []).forEach(h=>{if(h && h.opp===oldN) h.opp=nw;});});
              [window.miniM,window.univM,window.comps,window.ckM,window.proM,window.ttM].filter(Array.isArray).forEach(arr=>arr.forEach(m=>{
                if(!m) return;
                if(m.a===oldN)m.a=nw;if(m.b===oldN)m.b=nw;
                (m.sets||[]).forEach(s=>(s.games||[]).forEach(g=>{if(!g)return;if(g.playerA===oldN)g.playerA=nw;if(g.playerB===oldN)g.playerB=nw;}));
              }));
              (Array.isArray(window.tourneys)?window.tourneys:[]).forEach(tn=>{
                if(!tn) return;
                (tn.groups||[]).forEach(grp=>{(grp.matches||[]).forEach(m=>{if(!m)return;if(m.a===oldN)m.a=nw;if(m.b===oldN)m.b=nw;});});
                const br=tn.bracket||{};
                Object.values(br.matchDetails||{}).forEach(m=>{if(m&&m.a===oldN)m.a=nw;if(m&&m.b===oldN)m.b=nw;});
                (br.manualMatches||[]).forEach(m=>{if(!m)return;if(m.a===oldN)m.a=nw;if(m.b===oldN)m.b=nw;});
              });
              (Array.isArray(window.proTourneys)?window.proTourneys:[]).forEach(tn=>{
                if(!tn) return;
                (tn.groups||[]).forEach(grp=>{(grp.matches||[]).forEach(m=>{if(!m)return;if(m.a===oldN)m.a=nw;if(m.b===oldN)m.b=nw;});});
              });
              try{ if(typeof window.save==='function') window.save(); }catch(e){}
              try{ if(typeof window.render==='function') window.render(); }catch(e){}
            })()">✅ 적용</button>
          </div>`).join('')}
        </div>`;
      }).join('')}
    </div>`;
  })()}
  ${_scfgD('univ','🏛️ 대학 관리')}
    <div style="font-size:var(--fs-caption);color:var(--gray-l);margin:8px 0 10px">👁️ 숨김 처리된 대학은 비로그인 상태에서 현황판에 표시되지 않습니다.</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:12px">
      <button class="btn btn-w btn-sm" onclick="cfgGo('univlogoimg')">🏫 대학 로고 이미지(URL) 설정</button>
      <span style="font-size:var(--fs-caption);color:var(--gray-l)">※ 대학명 옆 로고(아이콘) 표시용</span>
    </div>
    ${univCfg.map((u,idx)=>({u,idx})).filter(x=>x.u && !x.u.dissolved).map(({u,idx:i})=>{
      const isHidden = !!u.hidden;
      const _dSz = parseInt(u.logoSizeDetail || '', 10);
      const _pSz = parseInt(u.logoSizePlayers || '', 10);
      return `<div class="srow" style="background:${isHidden?'var(--surface)':'transparent'};border-radius:8px;padding:4px 6px;margin:-2px -6px;flex-wrap:wrap;gap:4px">
        <div class="cdot" style="background:${u.color};opacity:${isHidden?0.4:1}"></div>
        <input type="text" value="${u.name}" style="flex:1;max-width:130px;opacity:${isHidden?0.5:1}" onblur="const oldName=univCfg[${i}].name;const v=this.value.trim();if(!v){this.value=oldName;return;}if(v!==oldName&&univCfg.some((x,xi)=>xi!==${i}&&x.name===v)){alert('이미 추가된 대학명입니다.');this.value=oldName;return;}if(v!==oldName){renameUnivAcrossData(oldName,v);univCfg[${i}].name=v;save();render();}">
        <input id="cfg-univ-c-${i}" type="color" value="${u.color}" style="width:36px;height:30px;padding:2px;border-radius:5px;cursor:pointer;border:1px solid var(--border2)" title="대학 색상"
          onchange="cfgUnivSetColor(${i},this.value)">
        <input id="cfg-univ-hex-${i}" type="text" value="${u.color}" placeholder="#RRGGBB" title="대학 색상 HEX 입력" style="width:96px;padding:4px 8px;border:1px solid var(--border2);border-radius:8px;font-size:var(--fs-sm);font-weight:800"
          onblur="cfgUnivSetColor(${i},this.value)">
        <button class="btn btn-w btn-xs" title="색상 선택" onclick="cfgUnivPickColor(${i},this)">🎨</button>
        <button class="btn btn-xs" style="background:${isHidden?'#fef2f2':'#f0fdf4'};color:${isHidden?'#dc2626':'#16a34a'};border:1px solid ${isHidden?'#fca5a5':'#86efac'};min-width:58px"
          onclick="univCfg[${i}].hidden=!univCfg[${i}].hidden;saveCfg();render()">
          ${isHidden?'👁️ 숨김':'✅ 표시'}</button>
        <button class="btn btn-xs" style="background:#fff7ed;color:#ea580c;border:1px solid #fed7aa" onclick="openDissolveModal(${i})">🏚️ 해체</button>
        <button class="btn btn-r btn-xs" onclick="delUniv(${i})">🗑️ 삭제</button>
        <div style="width:100%;padding:6px 0 2px 16px;display:flex;flex-direction:column;gap:8px">
          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
            <div style="font-size:var(--fs-caption);font-weight:800;color:var(--text2);min-width:154px">🏛️ 대학상세 로고 크기</div>
            <input type="range" min="28" max="72" step="2" value="${isNaN(_dSz)?46:Math.max(28,Math.min(72,_dSz))}" style="flex:1;min-width:140px;accent-color:var(--blue)"
              oninput="univCfg[${i}].logoSizeDetail=+this.value;saveCfg();try{this.parentElement.querySelector('span').textContent=this.value+'px';}catch(e){};try{if(typeof applyUnivLogoVars==='function')applyUnivLogoVars();}catch(e){};try{window._cfgSoftRefreshLive&&window._cfgSoftRefreshLive();}catch(e){}">
            <span style="font-size:var(--fs-caption);color:var(--gray-l);min-width:42px;font-weight:900">${isNaN(_dSz)?46:Math.max(28,Math.min(72,_dSz))}px</span>
            <button class="btn btn-w btn-xs" onclick="delete univCfg[${i}].logoSizeDetail;saveCfg();try{if(typeof applyUnivLogoVars==='function')applyUnivLogoVars();}catch(e){};try{const p=this.parentElement;const r=p.querySelector('input[type=range]');if(r)r.value='46';const s=p.querySelector('span');if(s)s.textContent='46px';}catch(e){};try{window._cfgSoftRefreshLive&&window._cfgSoftRefreshLive();}catch(e){}" title="대학별 값 제거(기본값 사용)">초기화</button>
          </div>
          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
            <div style="font-size:var(--fs-caption);font-weight:800;color:var(--text2);min-width:154px">🎬 스트리머탭 로고 크기</div>
            <input type="range" min="16" max="40" step="1" value="${isNaN(_pSz)?26:Math.max(16,Math.min(40,_pSz))}" style="flex:1;min-width:140px;accent-color:var(--blue)"
              oninput="univCfg[${i}].logoSizePlayers=+this.value;saveCfg();try{this.parentElement.querySelector('span').textContent=this.value+'px';}catch(e){};try{window._cfgSoftRefreshLive&&window._cfgSoftRefreshLive();}catch(e){}">
            <span style="font-size:var(--fs-caption);color:var(--gray-l);min-width:42px;font-weight:900">${isNaN(_pSz)?26:Math.max(16,Math.min(40,_pSz))}px</span>
            <button class="btn btn-w btn-xs" onclick="delete univCfg[${i}].logoSizePlayers;saveCfg();try{const p=this.parentElement;const r=p.querySelector('input[type=range]');if(r)r.value='26';const s=p.querySelector('span');if(s)s.textContent='26px';}catch(e){};try{window._cfgSoftRefreshLive&&window._cfgSoftRefreshLive();}catch(e){}" title="대학별 값 제거(기본값 사용)">초기화</button>
          </div>
        </div>
      </div>`;
    }).join('')}
    ${(()=>{
      const dis = univCfg.map((u,idx)=>({u,idx})).filter(x=>x.u && x.u.dissolved);
      if(!dis.length) return '';
      return `<details style="margin-top:14px;border:1px dashed #fca5a5;background:#fff5f5;border-radius:12px;padding:10px 12px">
        <summary style="cursor:pointer;font-weight:900;color:#dc2626;list-style:none">🏚️ 해체된 대학 (${dis.length}) <span style="font-size:var(--fs-caption);font-weight:600;color:#7f1d1d">(펼치기)</span></summary>
        <div style="margin-top:10px;display:flex;flex-direction:column;gap:8px">
          ${dis.map(({u,idx:i})=>{
            const _dSz = parseInt(u.logoSizeDetail || '', 10);
            const _pSz = parseInt(u.logoSizePlayers || '', 10);
            return `<div class="srow" style="background:var(--white);border:1px solid #fecaca;border-radius:var(--r);padding:8px 10px;flex-wrap:wrap;gap:6px">
              <div class="cdot" style="background:${u.color};opacity:.8"></div>
              <div style="font-weight:900;color:#7f1d1d;min-width:120px">${esc(u.name||'')}</div>
              <span style="font-size:10px;background:#fee2e2;color:#dc2626;border:1px solid #fca5a5;border-radius:5px;padding:1px 6px;font-weight:800">🏚️ 해체 ${u.dissolvedDate||''}</span>
              <button class="btn btn-xs" style="background:#f0fdf4;color:#16a34a;border:1px solid #86efac" onclick="univCfg[${i}].dissolved=false;univCfg[${i}].hidden=false;delete univCfg[${i}].dissolvedDate;saveCfg();render()">🔄 복구</button>
              <button class="btn btn-r btn-xs" onclick="delUniv(${i})">🗑️ 삭제</button>
              <div style="width:100%;padding:6px 0 0 16px;display:flex;flex-direction:column;gap:8px">
                <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
                  <div style="font-size:var(--fs-caption);font-weight:800;color:#7f1d1d;min-width:154px">🏛️ 대학상세 로고 크기</div>
                  <input type="range" min="28" max="72" step="2" value="${isNaN(_dSz)?46:Math.max(28,Math.min(72,_dSz))}" style="flex:1;min-width:140px;accent-color:#dc2626"
                    oninput="univCfg[${i}].logoSizeDetail=+this.value;saveCfg();try{this.parentElement.querySelector('span').textContent=this.value+'px';}catch(e){};try{if(typeof applyUnivLogoVars==='function')applyUnivLogoVars();}catch(e){};try{window._cfgSoftRefreshLive&&window._cfgSoftRefreshLive();}catch(e){}">
                  <span style="font-size:var(--fs-caption);color:#7f1d1d;min-width:42px;font-weight:900">${isNaN(_dSz)?46:Math.max(28,Math.min(72,_dSz))}px</span>
                  <button class="btn btn-w btn-xs" onclick="delete univCfg[${i}].logoSizeDetail;saveCfg();try{if(typeof applyUnivLogoVars==='function')applyUnivLogoVars();}catch(e){};try{const p=this.parentElement;const r=p.querySelector('input[type=range]');if(r)r.value='46';const s=p.querySelector('span');if(s)s.textContent='46px';}catch(e){};try{window._cfgSoftRefreshLive&&window._cfgSoftRefreshLive();}catch(e){}">초기화</button>
                </div>
                <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
                  <div style="font-size:var(--fs-caption);font-weight:800;color:#7f1d1d;min-width:154px">🎬 스트리머탭 로고 크기</div>
                  <input type="range" min="16" max="40" step="1" value="${isNaN(_pSz)?26:Math.max(16,Math.min(40,_pSz))}" style="flex:1;min-width:140px;accent-color:#dc2626"
                    oninput="univCfg[${i}].logoSizePlayers=+this.value;saveCfg();try{this.parentElement.querySelector('span').textContent=this.value+'px';}catch(e){};try{window._cfgSoftRefreshLive&&window._cfgSoftRefreshLive();}catch(e){}">
                  <span style="font-size:var(--fs-caption);color:#7f1d1d;min-width:42px;font-weight:900">${isNaN(_pSz)?26:Math.max(16,Math.min(40,_pSz))}px</span>
                  <button class="btn btn-w btn-xs" onclick="delete univCfg[${i}].logoSizePlayers;saveCfg();try{const p=this.parentElement;const r=p.querySelector('input[type=range]');if(r)r.value='26';const s=p.querySelector('span');if(s)s.textContent='26px';}catch(e){};try{window._cfgSoftRefreshLive&&window._cfgSoftRefreshLive();}catch(e){}">초기화</button>
                </div>
              </div>
            </div>`;
          }).join('')}
        </div>
      </details>`;
    })()}
    <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap;align-items:center">
      <input type="text" id="nu-n" placeholder="새 대학명" style="width:150px">
      <input type="color" id="nu-c" value="#2563eb" style="width:40px;height:34px;padding:2px;border-radius:5px;cursor:pointer;border:1px solid var(--border2)">
      <button class="btn btn-b" onclick="addUniv()">+ 대학 추가</button>
    </div></details>
  ${_scfgD('univlogoimg','🏫 대학 로고 이미지(URL)')}
    <div style="font-size:var(--fs-sm);color:var(--gray-l);margin-bottom:10px;line-height:1.6">
      대학명 옆에 표시되는 <b>로고(아이콘) 이미지 URL</b>을 대학별로 지정합니다.<br>
      권장: <code>https://</code>로 시작하는 직접 이미지 링크(png/jpg/webp/svg)
    </div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r)">
      ${(()=>{
        const _logoRow = (u,i,dissolved) => {
          const url=String(u.icon||u.img||'');
          const disp=url?toHttpsUrl(url):'';
          const hasLogo = !!url;
          return `<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;border:1px solid ${dissolved?'#fecaca':'var(--border)'};border-radius:12px;padding:10px 12px;background:${dissolved?'#fff5f5':'var(--white)'};margin-bottom:8px">
            <div class="cdot" style="background:${u.color||'#64748b'};opacity:${dissolved?0.6:1}"></div>
            <div style="min-width:120px;font-weight:900;color:${dissolved?'#b91c1c':'var(--text2)'}">
              ${esc(u.name||'')}${dissolved?` <span style="font-size:10px;background:#fee2e2;color:#dc2626;border-radius:4px;padding:1px 5px;font-weight:700">해체</span>`:''}
            </div>
            ${disp?`<img src="${esc(disp)}" alt="" style="width:28px;height:28px;object-fit:contain;border-radius:6px;background:#fff;border:1px solid var(--border2)" onerror="this.style.display='none'">`
                 :`<div style="width:28px;height:28px;border-radius:6px;background:var(--surface);border:1px dashed var(--border2);display:flex;align-items:center;justify-content:center;font-size:var(--fs-caption);color:var(--gray-l)">없음</div>`}
            ${hasLogo?`<span style="font-size:10px;background:#f0fdf4;color:#16a34a;border:1px solid #86efac;border-radius:4px;padding:1px 5px;font-weight:700">✓ 설정됨</span>`:''}
            <input type="text" value="${esc(url)}" placeholder="https://... (로고 이미지 URL)" style="flex:1;min-width:200px;border-color:${dissolved?'#fca5a5':'var(--border2)'}"
              onblur="const v=this.value.trim(); if(v){univCfg[${i}].icon=toHttpsUrl(v);} else {delete univCfg[${i}].icon;} saveCfg(); if(typeof showToast==='function')showToast('✅ 저장됨'); render();">
            <button class="btn btn-w btn-xs" onclick="const inp=this.parentElement.querySelector('input'); if(inp) inp.value=''; delete univCfg[${i}].icon; delete univCfg[${i}].img; saveCfg(); if(typeof showToast==='function')showToast('🧹 로고 삭제됨'); render();">삭제</button>
          </div>`;
        };
        const active = univCfg.map((u,i)=>({u,i})).filter(x=>x.u&&!x.u.dissolved);
        const dissolved = univCfg.map((u,i)=>({u,i})).filter(x=>x.u&&x.u.dissolved);
        const withLogo = active.filter(x=>!!(x.u.icon||x.u.img));
        const withoutLogo = active.filter(x=>!(x.u.icon||x.u.img));
        let html = '';
        if(withLogo.length){
          html += `<div style="font-size:var(--fs-caption);font-weight:800;color:var(--text2);margin-bottom:6px;margin-top:4px">🖼️ 로고 설정된 대학 (${withLogo.length})</div>`;
          html += withLogo.map(({u,i})=>_logoRow(u,i,false)).join('');
        }
        if(withoutLogo.length){
          html += `<div style="font-size:var(--fs-caption);font-weight:800;color:var(--text2);margin-bottom:6px;margin-top:${withLogo.length?'14px':'4px'}">📭 로고 미설정 대학 (${withoutLogo.length})</div>`;
          html += withoutLogo.map(({u,i})=>_logoRow(u,i,false)).join('');
        }
        if(dissolved.length){
          html += `<details style="margin-top:14px"><summary style="cursor:pointer;font-size:var(--fs-caption);font-weight:700;color:#b91c1c;list-style:none">🏚️ 해체된 대학 (${dissolved.length}) — 펼치기</summary><div style="margin-top:8px">${dissolved.map(({u,i})=>_logoRow(u,i,true)).join('')}</div></details>`;
        }
        if(!active.length && !dissolved.length) html = '<div style="color:var(--gray-l);font-size:var(--fs-base);padding:10px">등록된 대학이 없습니다.</div>';
        return html;
      })()}
      <div style="font-size:var(--fs-caption);color:var(--gray-l);margin-top:10px">※ URL이 막히면(깨짐/CORS) 다른 이미지 호스팅을 사용해 주세요.</div>
    </div>
  </details>
  ${_scfgD('maps','🗺️ 맵 관리')}<div id="map-list">
    ${maps.map((m,i)=>`<div class="srow">
      <span style="font-size:14px">📍</span>
      <input type="text" value="${m}" style="flex:1" onblur="maps[${i}]=this.value;saveCfg();refreshSel()">
      <button class="btn btn-r btn-xs" onclick="delMap(${i})">🗑️ 삭제</button>
    </div>`).join('')}
  </div><div style="margin-top:12px;display:flex;gap:8px">
    <input type="text" id="nm" placeholder="새 맵 이름" style="width:200px" onkeydown="if(event.key==='Enter')addMap()">
    <button class="btn btn-b" onclick="addMap()">+ 맵 추가</button>
  </div></details>
  ${_scfgD('mAlias','⚡ 맵 약자 관리')}
    <div style="font-size:var(--fs-sm);color:var(--gray-l);margin-bottom:10px">
      약자를 입력하면 경기 결과 붙여넣기 시 자동으로 전체 맵 이름으로 변환됩니다.<br>
      <span style="color:var(--blue);font-weight:600">예:</span> <code style="background:var(--surface);padding:1px 6px;border-radius:4px">녹 → 녹아웃</code>, <code style="background:var(--surface);padding:1px 6px;border-radius:4px">폴 → 폴리포이드</code>
    </div>
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:10px 12px;margin-bottom:12px">
      <div style="font-size:var(--fs-caption);font-weight:700;color:var(--text2);margin-bottom:6px">📦 기본 내장 약자 <span style="font-weight:400;color:var(--gray-l);font-size:10px">(✕ 클릭 시 비활성화)</span></div>
      <div style="display:flex;flex-wrap:wrap;gap:5px">
        ${Object.entries(PASTE_MAP_ALIAS_DEFAULT).filter(([k,v])=>k!==v).map(([k,v])=>{
          const disabled=(userMapAlias||{}).hasOwnProperty(k+'__disabled');
          return disabled
            ? `<span style="display:inline-flex;align-items:center;gap:3px;background:#f1f5f9;border:1px solid var(--border);border-radius:6px;padding:2px 6px 2px 9px;font-size:var(--fs-caption);opacity:.5;text-decoration:line-through"><span style="font-family:monospace"><b>${k}</b> → ${v}</span><button onclick="restoreDefaultMapAlias('${encodeURIComponent(k)}')" style="background:none;border:none;cursor:pointer;color:#16a34a;font-size:10px;padding:0 2px;line-height:1;text-decoration:none" title="복원">↩</button></span>`
            : `<span style="display:inline-flex;align-items:center;gap:3px;background:var(--white);border:1px solid var(--border);border-radius:6px;padding:2px 6px 2px 9px;font-size:var(--fs-caption)"><span style="font-family:monospace"><b>${k}</b> → ${v}</span><button onclick="delDefaultMapAlias('${encodeURIComponent(k)}','${encodeURIComponent(v)}')" style="background:none;border:none;cursor:pointer;color:#dc2626;font-size:10px;padding:0 2px;line-height:1" title="비활성화">✕</button></span>`;
        }).join('')}
      </div>
    </div>
    <div style="font-size:var(--fs-sm);font-weight:700;color:var(--text2);margin-bottom:8px">🔧 사용자 정의 약자</div>
    <div id="alias-list" style="margin-bottom:10px"></div>
    <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
      <input type="text" id="alias-key" placeholder="약자 (예: 녹)" style="width:90px" maxlength="10" onkeydown="if(event.key==='Enter')addMapAlias()">
      <span style="color:var(--gray-l)">→</span>
      <input type="text" id="alias-val" list="alias-val-list" placeholder="맵 이름 입력..." autocomplete="off" style="width:180px;border:1px solid var(--border2);border-radius:7px;padding:5px 8px;font-size:var(--fs-base)" onkeydown="if(event.key==='Enter')addMapAlias()">
      <datalist id="alias-val-list">${maps.map(m=>`<option value="${m}">`).join('')}</datalist>
      <button class="btn btn-b" onclick="addMapAlias()">+ 약자 추가</button>
    </div>
    <div style="margin-top:12px;padding:10px 12px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r)">
      <div style="font-size:var(--fs-sm);font-weight:900;color:var(--text2);margin-bottom:6px">🧪 약자 변환 테스트</div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <input type="text" id="alias-test-in" placeholder="예: 폴 / 투혼II / 녹" style="width:200px"
          oninput="try{const v=this.value.trim();const out=document.getElementById('alias-test-out');if(!out)return; if(!v){out.textContent='';return;} if(typeof resolveMapName==='function'){out.textContent='→ '+resolveMapName(v);} else {out.textContent='(resolveMapName 로딩 전)';}}catch(e){}">
        <div id="alias-test-out" style="font-size:var(--fs-sm);color:var(--text2);font-weight:900"></div>
      </div>
      <div style="font-size:var(--fs-caption);color:var(--gray-l);margin-top:6px">※ 붙여넣기 자동인식에서 실제로 적용되는 변환과 동일합니다.</div>
    </div>
    <div id="alias-msg" style="font-size:var(--fs-sm);margin-top:6px;min-height:16px"></div>
  </details>
  ${(typeof window.renderCfgTabLabelsSection==='function' ? window.renderCfgTabLabelsSection(_scfgD) : '')}
  ${_scfgD('hdr','🖼️ 헤더(상단바) 커스텀')}
    ${(()=>{ 
      const _t = (localStorage.getItem('su_hdr_title')||'스타대학 데이터 센터');
      const _li = (localStorage.getItem('su_hdr_left_icon')||'🏆');
      const _ls = parseInt(localStorage.getItem('su_hdr_left_size')||'22',10)||22;
      const _ri = (localStorage.getItem('su_hdr_right_img')||'');
      const _rs = parseInt(localStorage.getItem('su_hdr_right_size')||'32',10)||32;
      const _bg = (localStorage.getItem('su_hdr_bg_img')||'');
      const _hh = parseInt(localStorage.getItem('su_hdr_height')||'0',10)||0;
      const _fx = (localStorage.getItem('su_hdr_fx')||'classic');
      const _c1 = (localStorage.getItem('su_hdr_c1')||'#1e3a8a');
      const _c2 = (localStorage.getItem('su_hdr_c2')||'#2563eb');
      const _sync = (localStorage.getItem('su_hdr_sync_theme')||'0')==='1';
      // 프리셋
      let _ps=[], _sel='';
      try{ _ps = JSON.parse(localStorage.getItem('su_hdr_presets_v1')||'null'); if(!Array.isArray(_ps)) _ps=[]; }catch(e){ _ps=[]; }
      try{ _sel = localStorage.getItem('su_hdr_preset_sel_v1')||''; }catch(e){ _sel=''; }
      if(!_ps.length){ _ps=[{id:'tmp',name:'기본'}]; _sel=_ps[0].id; }
      if(!_sel || !_ps.some(p=>p.id===_sel)) _sel=_ps[0].id;
      return `
        <div style="font-size:var(--fs-sm);color:var(--gray-l);margin-bottom:10px">상단 헤더의 제목/아이콘/이미지/배경을 커스텀합니다. (URL은 https:// 로 시작)</div>
        <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r);display:flex;flex-direction:column;gap:12px">
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            <div style="font-size:var(--fs-caption);color:var(--text3);font-weight:900;min-width:84px">프리셋</div>
            <select id="cfg-hdr-preset" onchange="hdrPresetSelect(this.value)" style="min-width:220px">
              ${_ps.map(p=>`<option value="${p.id}"${p.id===_sel?' selected':''}>${esc(p.name||'')}</option>`).join('')}
            </select>
            <button class="btn btn-w btn-xs" onclick="hdrPresetAdd()">+ 추가</button>
            <button class="btn btn-w btn-xs" onclick="hdrPresetRename()">이름변경</button>
            <button class="btn btn-b btn-xs" onclick="hdrPresetSaveCurrent()">현재값 저장</button>
            <button class="btn btn-r btn-xs" onclick="hdrPresetDelete()">삭제</button>
            <button class="btn btn-p btn-xs" onclick="hdrPresetInstallThemePack()" title="봄/여름/가을/겨울, 기념일, 스타크래프트 테마 프리셋 자동 추가">🎨 테마팩 추가</button>
          </div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            <div style="font-size:var(--fs-caption);color:var(--text3);font-weight:900;min-width:84px">스타일</div>
            <select id="cfg-hdr-fx" onchange="cfgSetHeaderSettings()" style="min-width:220px">
              <option value="classic"${_fx==='classic'?' selected':''}>클래식(기본)</option>
              <option value="solid"${_fx==='solid'?' selected':''}>솔리드(단색)</option>
              <option value="glass"${_fx==='glass'?' selected':''}>글래스(유리)</option>
              <option value="aurora"${_fx==='aurora'?' selected':''}>오로라(움직임)</option>
              <option value="mesh"${_fx==='mesh'?' selected':''}>메쉬(패턴)</option>
            </select>
            <label style="display:flex;align-items:center;gap:6px;font-size:var(--fs-sm);font-weight:900;color:var(--text2);cursor:pointer">
              <input type="checkbox" id="cfg-hdr-sync" ${_sync?'checked':''} onchange="cfgSetHeaderSettings()">
              헤더색 → 전체 주색
            </label>
          </div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            <div style="font-size:var(--fs-caption);color:var(--text3);font-weight:900;min-width:84px">색상</div>
            <input id="cfg-hdr-c1" type="color" value="${esc(_c1)}" onchange="cfgSetHeaderSettings()" style="width:42px;height:34px;padding:2px;border-radius:8px;border:1px solid var(--border2);background:var(--white);cursor:pointer">
            <input id="cfg-hdr-c2" type="color" value="${esc(_c2)}" onchange="cfgSetHeaderSettings()" style="width:42px;height:34px;padding:2px;border-radius:8px;border:1px solid var(--border2);background:var(--white);cursor:pointer">
            <span style="font-size:var(--fs-caption);color:var(--gray-l)">왼쪽/오른쪽(그라데이션 기준)</span>
          </div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            <div style="font-size:var(--fs-caption);color:var(--text3);font-weight:800;min-width:84px">제목</div>
            <input id="cfg-hdr-title" type="text" value="${esc(_t)}" placeholder="예: 스타대학 데이터 센터" style="flex:1;min-width:220px" onblur="cfgSetHeaderSettings()">
          </div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            <div style="font-size:var(--fs-caption);color:var(--text3);font-weight:800;min-width:84px">좌측 아이콘</div>
            <input id="cfg-hdr-left" type="text" value="${esc(_li)}" placeholder="이모지 또는 이미지 URL" style="flex:1;min-width:220px" onblur="cfgSetHeaderSettings()">
            <span style="font-size:var(--fs-caption);color:var(--text3);font-weight:800">크기</span>
            <input id="cfg-hdr-left-sz" type="range" min="14" max="44" step="2" value="${Math.max(14,Math.min(44,_ls))}" oninput="document.getElementById('cfg-hdr-left-sz-v').textContent=this.value+'px'" onchange="cfgSetHeaderSettings()" style="width:160px">
            <span id="cfg-hdr-left-sz-v" style="font-size:var(--fs-caption);color:var(--gray-l);min-width:40px;font-weight:900">${Math.max(14,Math.min(44,_ls))}px</span>
          </div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            <div style="font-size:var(--fs-caption);color:var(--text3);font-weight:800;min-width:84px">우측 이미지</div>
            <input id="cfg-hdr-right" type="text" value="${esc(_ri)}" placeholder="이미지 URL (없으면 비움)" style="flex:1;min-width:220px" onblur="cfgSetHeaderSettings()">
            <span style="font-size:var(--fs-caption);color:var(--text3);font-weight:800">크기</span>
            <input id="cfg-hdr-right-sz" type="range" min="18" max="70" step="2" value="${Math.max(18,Math.min(70,_rs))}" oninput="document.getElementById('cfg-hdr-right-sz-v').textContent=this.value+'px'" onchange="cfgSetHeaderSettings()" style="width:160px">
            <span id="cfg-hdr-right-sz-v" style="font-size:var(--fs-caption);color:var(--gray-l);min-width:40px;font-weight:900">${Math.max(18,Math.min(70,_rs))}px</span>
          </div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            <div style="font-size:var(--fs-caption);color:var(--text3);font-weight:800;min-width:84px">배경 이미지</div>
            <input id="cfg-hdr-bg" type="text" value="${esc(_bg)}" placeholder="배경 이미지 URL (없으면 비움)" style="flex:1;min-width:220px" onblur="cfgSetHeaderSettings()">
          </div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            <div style="font-size:var(--fs-caption);color:var(--text3);font-weight:800;min-width:84px">헤더 높이</div>
            <input id="cfg-hdr-h" type="range" min="0" max="120" step="4" value="${Math.max(0,Math.min(120,_hh))}" oninput="document.getElementById('cfg-hdr-h-v').textContent=(this.value==0?'자동':this.value+'px')" onchange="cfgSetHeaderSettings()" style="width:240px">
            <span id="cfg-hdr-h-v" style="font-size:var(--fs-caption);color:var(--gray-l);min-width:56px;font-weight:900">${_hh?(_hh+'px'):'자동'}</span>
          </div>
        </div>
      </details>`;
    })()}
  ${(()=>{ 
    const on = (localStorage.getItem('su_bgm_enabled') ?? '1') === '1';
    const vol = parseInt(localStorage.getItem('su_bgm_volume')||'50',10) || 50;
    const sh = (localStorage.getItem('su_bgm_shuffle') ?? '0') === '1';
    const list = (localStorage.getItem('su_bgm_list') || '').trim();
    return _scfgD('bgm','🎵 유튜브 배경음악(BGM)') + `
      <div style="font-size:var(--fs-sm);color:var(--gray-l);margin-bottom:10px">
        상단 검색바 왼쪽의 ▶/⏸ 버튼으로 재생/일시정지합니다. (모바일은 첫 재생 시 사용자 터치가 필요할 수 있습니다)
      </div>
      <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r);display:flex;flex-direction:column;gap:12px">
        <label style="display:flex;align-items:center;gap:8px;font-size:var(--fs-sm);cursor:pointer;font-weight:900;color:var(--text2)">
          <input type="checkbox" id="cfg-bgm-on" style="width:15px;height:15px" ${on?'checked':''} onchange="cfgSaveBgmSettings()">
          BGM 기능 사용
        </label>
        <label style="display:flex;align-items:center;gap:8px;font-size:var(--fs-sm);cursor:pointer;font-weight:900;color:var(--text2)">
          <input type="checkbox" id="cfg-bgm-shuffle" style="width:15px;height:15px" ${sh?'checked':''} onchange="cfgSaveBgmSettings()">
          랜덤 재생(셔플)
        </label>
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
          <div style="font-size:var(--fs-sm);font-weight:900;color:var(--text2);min-width:84px">볼륨</div>
          <input id="cfg-bgm-vol" type="range" min="0" max="100" step="5" value="${Math.max(0,Math.min(100,vol))}"
            oninput="document.getElementById('cfg-bgm-vol-v').textContent=this.value" onchange="cfgSaveBgmSettings()" style="width:220px">
          <span id="cfg-bgm-vol-v" style="font-size:var(--fs-caption);color:var(--gray-l);min-width:24px;font-weight:900">${Math.max(0,Math.min(100,vol))}</span>
        </div>
        <div style="font-size:var(--fs-sm);font-weight:900;color:var(--text2)">유튜브 링크 목록 (한 줄에 1개)</div>
        <textarea id="cfg-bgm-list" rows="6" placeholder="예) https://www.youtube.com/watch?v=xxxxxxxxxxx" style="width:100%;border:1.5px solid var(--border);border-radius:var(--r);padding:10px 12px;font-size:var(--fs-sm);line-height:1.6;resize:vertical;background:var(--white);color:var(--text1);box-sizing:border-box" oninput="cfgSaveBgmSettings()" onblur="cfgSaveBgmSettings()">${esc(list)}</textarea>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn btn-b btn-sm" onclick="cfgSaveBgmSettings();if(typeof showToast==='function')showToast('저장됨');">저장</button>
          <button class="btn btn-w btn-sm" onclick="document.getElementById('cfg-bgm-list').value='';cfgSaveBgmSettings();">목록 비우기</button>
        </div>
      </div>
    </details>`;
  })()}
  ${(()=>{ 
    const list = (localStorage.getItem('su_soop_list') || '').trim();
    return _scfgD('soopmv','📺 SOOP(숲) 멀티뷰') + `
      <div style="font-size:var(--fs-sm);color:var(--gray-l);margin-bottom:10px;line-height:1.6">
        상단에 <b>SOOP</b> 버튼이 생기며, 버튼을 누르면 <b>2분할 멀티뷰</b> 팝업이 열립니다.<br>
        (주소가 1개도 없으면 버튼은 숨겨집니다)
      </div>
      <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r);display:flex;flex-direction:column;gap:10px">
        <div style="font-size:var(--fs-sm);font-weight:1000;color:var(--text2)">SOOP 주소 목록 (한 줄에 1개)</div>
        <textarea id="cfg-soop-list" rows="7" placeholder="예) https://...." style="width:100%;border:1.5px solid var(--border);border-radius:var(--r);padding:10px 12px;font-size:var(--fs-sm);line-height:1.6;resize:vertical;background:var(--white);color:var(--text1);box-sizing:border-box" oninput="cfgSaveSoopSettings()" onblur="cfgSaveSoopSettings()">${esc(list)}</textarea>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn btn-b btn-sm" onclick="cfgSaveSoopSettings();if(typeof showToast==='function')showToast('저장됨');">저장</button>
          <button class="btn btn-w btn-sm" onclick="document.getElementById('cfg-soop-list').value='';cfgSaveSoopSettings();">목록 비우기</button>
        </div>
      </div>
    </details>`;
  })()}
  ${(()=>{ 
    const rules = (localStorage.getItem('su_paste_route_rules') || '').trim();
    return _scfgD('pasteRoute','🧠 결과 붙여넣기 자동 분리') + `
      <div style="font-size:var(--fs-sm);color:var(--gray-l);margin-bottom:10px;line-height:1.6">
        붙여넣기 텍스트의 <b>메모/원문</b>에 특정 키워드가 포함되면, 저장 시 자동으로 기록탭을 분리합니다.<br>
        형식: <code>/정규식/flags =&gt; 모드</code> 또는 <code>키워드 =&gt; 모드</code><br>
        예) <code>E-SCORE TOURNAMENT =&gt; 끝장전</code> / <code>/ASL\\s*S\\d+/i =&gt; 개인전</code>
      </div>
      <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r);display:flex;flex-direction:column;gap:10px">
        <div style="font-size:var(--fs-sm);font-weight:1000;color:var(--text2)">규칙 목록 (한 줄에 1개)</div>
        <textarea id="cfg-paste-route" rows="7" placeholder="예)\nE-SCORE TOURNAMENT => 끝장전\n/mini\\s*league/i => 미니대전\n/civil\\s*war/i => 시빌워" style="width:100%;border:1.5px solid var(--border);border-radius:var(--r);padding:10px 12px;font-size:var(--fs-sm);line-height:1.6;resize:vertical;background:var(--white);color:var(--text1);box-sizing:border-box" oninput="cfgSavePasteRouteRules()" onblur="cfgSavePasteRouteRules()">${esc(rules)}</textarea>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn btn-b btn-sm" onclick="cfgSavePasteRouteRules();if(typeof showToast==='function')showToast('저장됨');">저장</button>
          <button class="btn btn-w btn-sm" onclick="document.getElementById('cfg-paste-route').value='';cfgSavePasteRouteRules();">규칙 비우기</button>
        </div>
        <div style="font-size:var(--fs-caption);color:var(--gray-l);line-height:1.5">
          모드 예시: 개인전 / 끝장전 / 미니대전 / 시빌워 / 대학대전 / 대학CK / 프로리그 / 티어대회 / 대회<br>
          ※ 현재 자동 분리는 우선 <b>개인전/끝장전/미니대전(시빌워)</b>에 가장 안정적으로 동작합니다.
        </div>
      </div>
    </details>`;
  })()}
  `;
}
