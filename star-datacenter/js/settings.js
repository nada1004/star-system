/* ══════════════════════════════════════
   ⚙️ settings.js — 설정 탭 전용
   tier-tour.js에서 분리됨. 이 파일의 버그가 티어대회 탭에 영향을 주지 않습니다.
══════════════════════════════════════ */

/* ══════════════════════════════════════
   ⚙️ 설정 섹션 접힘 상태 영속 헬퍼
══════════════════════════════════════ */
function _cfgOpen(id){try{return !!(JSON.parse(localStorage.getItem('su_cfg_open')||'{}')[id]);}catch(e){return false;}}
function _cfgToggle(id,el){try{const o=JSON.parse(localStorage.getItem('su_cfg_open')||'{}');o[id]=el.open;localStorage.setItem('su_cfg_open',JSON.stringify(o));const sp=el.querySelector('summary .cfg-toggle-txt');if(sp)sp.textContent=el.open?'▴ 접기':'▾ 펼치기';}catch(e){}}
function _cfgD(id,title,extra){const isOpen=_cfgOpen(id);return `<details class="ssec" ${isOpen?'open':''} ontoggle="_cfgToggle('${id}',this)"${extra?' '+extra:''}><summary style="cursor:pointer;list-style:none;outline:none;display:flex;align-items:center;gap:6px;-webkit-appearance:none"><h4 style="margin:0;display:inline">${title}</h4><span class="cfg-toggle-txt" style="font-size:11px;color:var(--gray-l);font-weight:400">${isOpen?'▴ 접기':'▾ 펼치기'}</span></summary>`;}

/* ══════════════════════════════════════
   카테고리 탭 전환
══════════════════════════════════════ */
function _cfgSwitchGroup(id){
  localStorage.setItem('su_cfg_group',id);
  document.querySelectorAll('[data-cfg-group]').forEach(el=>{
    el.style.display=el.dataset.cfgGroup===id?'':'none';
  });
  ['basic','data','appear','system','bulk'].forEach(tid=>{
    const btn=document.getElementById('cfg-tab-'+tid);
    if(!btn)return;
    const active=tid===id;
    btn.style.background=active?'var(--blue)':'var(--white)';
    btn.style.color=active?'#fff':'var(--text2)';
    btn.style.borderColor=active?'var(--blue)':'var(--border2)';
  });
}

/* ══════════════════════════════════════
   설정
══════════════════════════════════════ */
function rCfg(C,T){
  T.innerText='⚙️ 설정';
  if(!isLoggedIn){
    C.innerHTML='<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 20px;text-align:center;gap:16px"><div style="font-size:48px">🔒</div><div style="font-size:18px;font-weight:800;color:var(--text)">관리자 전용 페이지</div><div style="font-size:13px;color:var(--gray-l)">설정 탭은 관리자 로그인 후 이용할 수 있습니다.</div><button class="btn btn-b" onclick="om(\'loginModal\')">&#128273; 로그인</button></div>';
    return;
  }

  const AG=localStorage.getItem('su_cfg_group')||'basic';
  const _gw=(id,c)=>`<div data-cfg-group="${id}"${AG!==id?' style="display:none"':''}>${c}</div>`;

  // ─── 탭 바 ───
  const _tabDefs=[['basic','📋 기본'],['data','🗂️ 데이터'],['appear','🎨 외형'],['system','🔧 시스템'],['bulk','⚡ 일괄']];
  const tabBar=`<div style="display:flex;gap:5px;padding:10px 0 16px;flex-wrap:wrap;position:sticky;top:0;z-index:5;background:var(--bg)">${
    _tabDefs.map(([id,label])=>`<button onclick="_cfgSwitchGroup('${id}')" id="cfg-tab-${id}" style="flex:1;min-width:52px;padding:7px 4px;font-size:12px;font-weight:700;border-radius:8px;cursor:pointer;border:1.5px solid ${AG===id?'var(--blue)':'var(--border2)'};background:${AG===id?'var(--blue)':'var(--white)'};color:${AG===id?'#fff':'var(--text2)'};transition:all .15s">${label}</button>`).join('')
  }</div>`;

  /* ════════════════════════════════
     g1: 📋 기본 — 공지 / 시즌
  ════════════════════════════════ */
  const typeOpts=[{v:'📢',l:'📢 일반 공지'},{v:'🔥',l:'🔥 중요'},{v:'⚠️',l:'⚠️ 경고/주의'},{v:'🎉',l:'🎉 이벤트'}];
  let g1=`${_cfgD('notice','📢 공지 관리')}
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:14px">접속 시 팝업으로 표시됩니다. 활성화된 공지만 보여집니다.</div>
    <div id="notice-list-area" style="margin-bottom:16px">
    ${notices.length===0?`<div style="padding:18px;text-align:center;color:var(--gray-l);background:var(--surface);border-radius:10px;font-size:13px">등록된 공지 없음</div>`:
      notices.map((n,i)=>`<div style="border:1px solid var(--border);border-radius:10px;padding:12px 14px;margin-bottom:8px;background:${n.active?'var(--white)':'var(--surface)'};opacity:${n.active?1:0.6}">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
          <span style="font-size:18px">${n.type||'📢'}</span>
          <span style="font-weight:700;flex:1;font-size:13px">${n.title||'(제목 없음)'}</span>
          <span style="font-size:11px;color:var(--gray-l)">${n.date||''}</span>
          <button class="btn btn-xs" style="background:${n.active?'#f0fdf4':'#f1f5f9'};color:${n.active?'#16a34a':'#64748b'};border:1px solid ${n.active?'#86efac':'#cbd5e1'};min-width:52px"
            onclick="notices[${i}].active=!notices[${i}].active;save();render()">
            ${n.active?'✅ 활성':'⭕ 비활성'}</button>
          <button class="btn btn-r btn-xs" onclick="if(confirm('공지를 삭제할까요?')){notices.splice(${i},1);save();render()}">🗑️</button>
        </div>
        ${(n.body||'').length>120
          ? `<div id="notice-body-${i}" style="font-size:12px;color:var(--text2);white-space:pre-wrap;max-height:60px;overflow:hidden">${(n.body||'').slice(0,120)}...</div>
             <button onclick="(function(){const el=document.getElementById('notice-body-${i}');const btn=document.getElementById('notice-exp-${i}');const open=el.style.maxHeight!=='none';el.style.maxHeight=open?'none':'60px';el.textContent=open?notices[${i}].body:notices[${i}].body.slice(0,120)+'...';btn.textContent=open?'▲ 접기':'▼ 전체보기';})()" id="notice-exp-${i}" style="background:none;border:none;color:var(--blue);font-size:11px;cursor:pointer;padding:2px 0;font-weight:600">▼ 전체보기</button>`
          : `<div style="font-size:12px;color:var(--text2);white-space:pre-wrap">${n.body||''}</div>`
        }
      </div>`).join('')
    }
    </div>
    <div style="border:1.5px dashed var(--border2);border-radius:12px;padding:16px;background:var(--surface)">
      <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:10px">+ 새 공지 작성</div>
      <div style="display:flex;gap:8px;margin-bottom:8px;flex-wrap:wrap">
        <select id="new-notice-type" style="width:140px;border:1px solid var(--border2);border-radius:7px;padding:5px 8px;font-size:13px">
          ${typeOpts.map(o=>`<option value="${o.v}">${o.l}</option>`).join('')}
        </select>
        <input type="text" id="new-notice-title" placeholder="공지 제목" style="flex:1;min-width:180px">
      </div>
      <textarea id="new-notice-body" placeholder="공지 내용을 입력하세요..." style="width:100%;height:80px;resize:vertical;border:1px solid var(--border2);border-radius:8px;padding:8px 10px;font-size:13px;box-sizing:border-box"></textarea>
      <div style="display:flex;align-items:center;gap:10px;margin-top:8px">
        <label style="display:flex;align-items:center;gap:5px;font-size:12px;cursor:pointer">
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
  ${_cfgD('season','🏆 시즌 관리','id="cfg-season-sec"')}
    <p style="font-size:12px;color:var(--gray-l);margin-bottom:12px">시즌을 정의하면 대전기록·통계 등 모든 탭에서 시즌 단위로 필터링할 수 있습니다.</p>
    <div id="cfg-season-list" style="margin-bottom:12px"></div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:flex-end;padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:8px">
      <div>
        <label style="font-size:11px;font-weight:700;color:var(--text3);display:block;margin-bottom:4px">시즌 이름</label>
        <input type="text" id="cfg-season-name" placeholder="예: 2025 스프링" style="width:140px;font-size:12px">
      </div>
      <div>
        <label style="font-size:11px;font-weight:700;color:var(--text3);display:block;margin-bottom:4px">시작일</label>
        <input type="date" id="cfg-season-from" style="font-size:12px">
      </div>
      <div>
        <label style="font-size:11px;font-weight:700;color:var(--text3);display:block;margin-bottom:4px">종료일</label>
        <input type="date" id="cfg-season-to" style="font-size:12px">
      </div>
      <button class="btn btn-b btn-sm" onclick="addSeason()">+ 시즌 추가</button>
    </div>
  </details>`;

  /* ════════════════════════════════
     g2: 🗂️ 데이터 — 동명이인 / 대학 / 맵 / 맵약자 / 아이콘 / 티어
  ════════════════════════════════ */
  let g2=``;
  // 동명이인 감지
  (()=>{
    const seen={};const dupNames=[];
    players.forEach(p=>{if(seen[p.name])dupNames.push(p.name);else seen[p.name]=true;});
    const uniq=[...new Set(dupNames)];
    if(!uniq.length) return;
    g2+=`<div class="ssec" style="border:2px solid #fca5a5;background:#fff5f5">
      <h4 style="color:#dc2626">⚠️ 동명이인 감지 (${uniq.length}건)</h4>
      <div style="font-size:12px;color:#7f1d1d;margin-bottom:12px">중복 이름이 있으면 승패·기록이 뒤섞입니다. 한 명의 이름을 바꿔 구분하세요.</div>
      ${uniq.map(name=>{
        const dupes=players.map((p,i)=>({p,i})).filter(({p})=>p.name===name);
        return `<div style="background:var(--white);border:1px solid #fca5a5;border-radius:8px;padding:10px 12px;margin-bottom:8px">
          <div style="font-weight:800;color:#dc2626;font-size:13px;margin-bottom:6px">👥 "${name}" — ${dupes.length}명 중복</div>
          ${dupes.map(({p,i})=>`<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;flex-wrap:wrap">
            <span style="font-size:11px;background:#fee2e2;color:#991b1b;border-radius:4px;padding:1px 7px;font-weight:700">${p.univ||'무소속'}</span>
            <span style="font-size:11px;color:var(--gray-l)">${p.tier||'-'} · ${p.race||'-'}</span>
            <input type="text" id="dupfix-${i}" placeholder="새 이름..." style="flex:1;min-width:100px;padding:3px 7px;border-radius:5px;border:1px solid #fca5a5;font-size:12px">
            <button class="btn btn-xs" style="background:#dc2626;color:#fff;border-color:#dc2626" onclick="(function(){
              const inp=document.getElementById('dupfix-${i}');
              const nw=(inp?.value||'').trim();
              if(!nw){alert('새 이름을 입력하세요.');return;}
              if(players.find((x,xi)=>x.name===nw&&xi!==${i})){alert('이미 존재하는 이름입니다.');return;}
              editName=players[${i}].name;
              document.getElementById('emBody').innerHTML='';
              const oldN=players[${i}].name;
              players[${i}].name=nw;
              players.forEach(other=>{(other.history||[]).forEach(h=>{if(h.opp===oldN)h.opp=nw;});});
              [miniM,univM,comps,ckM,proM,ttM,indM,gjM].forEach(arr=>(arr||[]).forEach(m=>{
                if(m.a===oldN)m.a=nw;if(m.b===oldN)m.b=nw;
                (m.sets||[]).forEach(s=>(s.games||[]).forEach(g=>{
                  if(Array.isArray(g.playerA)){
                    g.playerA=g.playerA.map(p=>p===oldN?nw:p);
                  } else if(g.playerA===oldN) g.playerA=nw;
                  if(Array.isArray(g.playerB)){
                    g.playerB=g.playerB.map(p=>p===oldN?nw:p);
                  } else if(g.playerB===oldN) g.playerB=nw;
                }));
              }));
              (tourneys||[]).forEach(tn=>{
                (tn.groups||[]).forEach(grp=>{(grp.matches||[]).forEach(m=>{if(m.a===oldN)m.a=nw;if(m.b===oldN)m.b=nw;});});
                const br=tn.bracket||{};
                Object.values(br.matchDetails||{}).forEach(m=>{if(m&&m.a===oldN)m.a=nw;if(m&&m.b===oldN)m.b=nw;});
                (br.manualMatches||[]).forEach(m=>{if(m.a===oldN)m.a=nw;if(m.b===oldN)m.b=nw;});
              });
              (proTourneys||[]).forEach(tn=>{
                (tn.groups||[]).forEach(grp=>{(grp.matches||[]).forEach(m=>{if(m.a===oldN)m.a=nw;if(m.b===oldN)m.b=nw;});});
              });
              save();render();
            })()">✅ 적용</button>
          </div>`).join('')}
        </div>`;
      }).join('')}
    </div>`;
  })();

  // 대학 관리
  g2+=`${_cfgD('univ','🏛️ 대학 관리')}
    <div style="font-size:11px;color:var(--gray-l);margin:8px 0 10px">👁️ 숨김 처리된 대학은 비로그인 상태에서 현황판에 표시되지 않습니다.</div>`;
  univCfg.forEach((u,i)=>{
    const isHidden=!!u.hidden;
    const isDissolved=!!u.dissolved;
    g2+=`<div class="srow" style="background:${isHidden?'var(--surface)':'transparent'};border-radius:8px;padding:4px 6px;margin:-2px -6px;flex-wrap:wrap;gap:4px">
      <div class="cdot" style="background:${u.color};opacity:${isHidden?0.4:1}"></div>
      <input type="text" value="${u.name}" style="flex:1;max-width:130px;opacity:${isHidden?0.5:1}" onblur="const oldName=univCfg[${i}].name;const v=this.value.trim();if(!v){this.value=oldName;return;}if(v!==oldName&&univCfg.some((x,xi)=>xi!==${i}&&x.name===v)){alert('이미 추가된 대학명입니다.');this.value=oldName;return;}if(v!==oldName){renameUnivAcrossData(oldName,v);univCfg[${i}].name=v;save();render();}">
      ${isDissolved?`<span style="font-size:10px;background:#fef2f2;color:#dc2626;border:1px solid #fca5a5;border-radius:5px;padding:1px 6px;font-weight:700">🏚️ 해체 ${u.dissolvedDate||''}</span>`:''}
      <input type="color" value="${u.color}" style="width:36px;height:30px;padding:2px;border-radius:5px;cursor:pointer;border:1px solid var(--border2)" title="대학 색상" onchange="univCfg[${i}].color=this.value;this.previousElementSibling.previousElementSibling${isDissolved?'.previousElementSibling':''}.style.background=this.value;save();if(typeof renderBoard==='function')renderBoard()">
      ${isDissolved
        ? `<button class="btn btn-xs" style="background:#f0fdf4;color:#16a34a;border:1px solid #86efac" onclick="univCfg[${i}].dissolved=false;univCfg[${i}].hidden=false;delete univCfg[${i}].dissolvedDate;saveCfg();render()">🔄 복구</button>`
        : `<button class="btn btn-xs" style="background:${isHidden?'#fef2f2':'#f0fdf4'};color:${isHidden?'#dc2626':'#16a34a'};border:1px solid ${isHidden?'#fca5a5':'#86efac'};min-width:58px"
            onclick="univCfg[${i}].hidden=!univCfg[${i}].hidden;saveCfg();render()">
            ${isHidden?'👁️ 숨김':'✅ 표시'}</button>
          <button class="btn btn-xs" style="background:#fff7ed;color:#ea580c;border:1px solid #fed7aa" onclick="openDissolveModal(${i})">🏚️ 해체</button>`
      }
      <button class="btn btn-r btn-xs" onclick="delUniv(${i})">🗑️ 삭제</button>
    </div>`;
  });
  g2+=`<div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap;align-items:center">
    <input type="text" id="nu-n" placeholder="새 대학명" style="width:150px">
    <input type="color" id="nu-c" value="#2563eb" style="width:40px;height:34px;padding:2px;border-radius:5px;cursor:pointer;border:1px solid var(--border2)">
    <button class="btn btn-b" onclick="addUniv()">+ 대학 추가</button>
  </div></details>`;

  // 맵 관리
  g2+=`${_cfgD('maps','🗺️ 맵 관리')}<div id="map-list">`;
  maps.forEach((m,i)=>{
    g2+=`<div class="srow">
      <span style="font-size:14px">📍</span>
      <input type="text" value="${m}" style="flex:1" onblur="maps[${i}]=this.value;saveCfg();refreshSel()">
      <button class="btn btn-r btn-xs" onclick="delMap(${i})">🗑️ 삭제</button>
    </div>`;
  });
  g2+=`</div><div style="margin-top:12px;display:flex;gap:8px">
    <input type="text" id="nm" placeholder="새 맵 이름" style="width:200px" onkeydown="if(event.key==='Enter')addMap()">
    <button class="btn btn-b" onclick="addMap()">+ 맵 추가</button>
  </div></details>`;

  // 맵 약자 관리
  g2+=`${_cfgD('mAlias','⚡ 맵 약자 관리 <span style="font-size:11px;font-weight:400;color:var(--gray-l)">붙여넣기 입력 시 자동 변환</span>')}
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px">
      약자를 입력하면 경기 결과 붙여넣기 시 자동으로 전체 맵 이름으로 변환됩니다.<br>
      <span style="color:var(--blue);font-weight:600">예:</span> <code style="background:var(--surface);padding:1px 6px;border-radius:4px">녹 → 녹아웃</code>, <code style="background:var(--surface);padding:1px 6px;border-radius:4px">폴 → 폴리포이드</code>
    </div>
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:10px 12px;margin-bottom:12px">
      <div style="font-size:11px;font-weight:700;color:var(--text2);margin-bottom:6px">📦 기본 내장 약자 <span style="font-weight:400;color:var(--gray-l);font-size:10px">(✕ 클릭 시 비활성화)</span></div>
      <div style="display:flex;flex-wrap:wrap;gap:5px">
        ${Object.entries(PASTE_MAP_ALIAS_DEFAULT).filter(([k,v])=>k!==v).map(([k,v])=>{
          const disabled=(userMapAlias||{}).hasOwnProperty(k+'__disabled');
          return disabled
            ? `<span style="display:inline-flex;align-items:center;gap:3px;background:#f1f5f9;border:1px solid var(--border);border-radius:6px;padding:2px 6px 2px 9px;font-size:11px;opacity:.5;text-decoration:line-through"><span style="font-family:monospace"><b>${k}</b> → ${v}</span><button onclick="restoreDefaultMapAlias('${encodeURIComponent(k)}')" style="background:none;border:none;cursor:pointer;color:#16a34a;font-size:10px;padding:0 2px;line-height:1;text-decoration:none" title="복원">↩</button></span>`
            : `<span style="display:inline-flex;align-items:center;gap:3px;background:var(--white);border:1px solid var(--border);border-radius:6px;padding:2px 6px 2px 9px;font-size:11px"><span style="font-family:monospace"><b>${k}</b> → ${v}</span><button onclick="delDefaultMapAlias('${encodeURIComponent(k)}','${encodeURIComponent(v)}')" style="background:none;border:none;cursor:pointer;color:#dc2626;font-size:10px;padding:0 2px;line-height:1" title="비활성화">✕</button></span>`;
        }).join('')}
      </div>
    </div>
    <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:8px">🔧 사용자 정의 약자</div>
    <div id="alias-list" style="margin-bottom:10px"></div>
    <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
      <input type="text" id="alias-key" placeholder="약자 (예: 녹)" style="width:90px" maxlength="10" onkeydown="if(event.key==='Enter')addMapAlias()">
      <span style="color:var(--gray-l)">→</span>
      <input type="text" id="alias-val" list="alias-val-list" placeholder="맵 이름 입력..." autocomplete="off" style="width:180px;border:1px solid var(--border2);border-radius:7px;padding:5px 8px;font-size:13px" onkeydown="if(event.key==='Enter')addMapAlias()">
      <datalist id="alias-val-list">${maps.map(m=>`<option value="${m}">`).join('')}</datalist>
      <button class="btn btn-b" onclick="addMapAlias()">+ 약자 추가</button>
    </div>
    <div id="alias-msg" style="font-size:12px;margin-top:6px;min-height:16px"></div>
  </details>`;

  // 스트리머 상태 아이콘
  g2+=`${_cfgD('si','🏷️ 스트리머 상태 아이콘 관리')}
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:12px">이름 우측에 표시될 상태 아이콘을 스트리머별로 지정합니다. 현황판·순위표·이미지 저장 모두 반영됩니다.</div>
    <div style="padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:8px;margin-bottom:14px">
      <div style="font-size:12px;font-weight:700;color:var(--blue);margin-bottom:10px">🔗 커스텀 아이콘 추가 (URL · 이모지)</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-bottom:10px">
        <input type="text" id="si-url" placeholder="이미지 URL 또는 이모지 입력" style="flex:1;min-width:200px;padding:5px 8px;border:1px solid var(--border2);border-radius:6px;font-size:12px">
        <input type="text" id="si-label" placeholder="이름 (선택)" style="width:110px;padding:5px 8px;border:1px solid var(--border2);border-radius:6px;font-size:12px">
        <button class="btn btn-b btn-sm" onclick="var e=document.getElementById('si-url').value.trim(),l=document.getElementById('si-label').value.trim();if(!e){alert('URL 또는 이모지를 입력하세요.');return;}addCustomStatusIcon(l||'커스텀',e);document.getElementById('si-url').value='';document.getElementById('si-label').value='';render()">+ 추가</button>
      </div>
      ${_customStatusIcons.length?`<div style="display:flex;flex-wrap:wrap;gap:6px">${_customStatusIcons.map((c,i)=>`<span style="display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:7px;background:var(--white);border:1.5px solid var(--blue);font-size:14px"><span style="display:inline-flex;align-items:center">${_siRender(c.emoji,'20px')||c.emoji}</span><span style="font-size:11px;color:var(--gray-l);max-width:80px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${c.label||''}</span><button onclick="removeCustomStatusIcon(${i});render()" style="background:none;border:none;color:#dc2626;cursor:pointer;font-size:14px;padding:0;line-height:1;margin-left:2px" title="삭제">×</button></span>`).join('')}</div>`
      :'<div style="font-size:11px;color:var(--gray-l)">추가된 커스텀 아이콘 없음</div>'}
    </div>
    <div style="padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:8px;margin-bottom:14px">
      <div style="font-size:12px;font-weight:700;color:var(--blue);margin-bottom:10px">🎭 기본 상태 아이콘</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px">
        ${Object.entries(STATUS_ICON_DEFS).filter(([id])=>id!=='none'&&!id.startsWith('_c')).map(([id,d])=>`<span style="padding:4px 10px;border-radius:7px;background:var(--white);border:1px solid var(--border);font-size:16px" title="${d.label}">${_siRender(d.emoji,'20px')||d.emoji}</span>`).join('')}
      </div>
      <div style="font-size:11px;color:var(--gray-l);margin-top:8px">스트리머 정보 수정 또는 현황판 클릭 팝업에서 아이콘을 설정하세요.</div>
    </div>
    <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:8px">스트리머별 상태 아이콘 지정</div>
    <div id="cfg-si-list" style="max-height:320px;overflow-y:auto;border:1px solid var(--border);border-radius:8px">
      <div style="padding:16px;text-align:center;color:var(--gray-l);font-size:12px">로딩 중...</div>
    </div>
    <button class="btn btn-r btn-sm" style="margin-top:10px" onclick="if(confirm('모든 상태 아이콘을 초기화할까요?')){playerStatusIcons={};localStorage.setItem('su_psi','{}');render();}">전체 초기화</button>
  </details>`;

  // 티어 관리
  g2+=`${_cfgD('tier','🎭 티어 관리')}
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px">
      ${TIERS.map((t,i)=>`<div style="text-align:center;padding:8px 12px;background:var(--white);border:1px solid var(--border);border-radius:8px;display:flex;flex-direction:column;align-items:center;gap:4px">
        ${getTierBadge(t)}
        <div style="font-size:10px;color:var(--gray-l)">${i+1}순위</div>
        ${!['G','K','JA','J','S','0티어'].includes(t)?`<button class="btn btn-r btn-xs" onclick="delTier('${t}')">🗑️ 삭제</button>`:''}
      </div>`).join('')}
    </div>
    <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
      <input type="text" id="nt-name" placeholder="티어 이름 (예: 9티어)" style="width:160px">
      <button class="btn btn-b" onclick="addTier()">+ 티어 추가</button>
    </div>
    <div style="font-size:11px;color:var(--gray-l);margin-top:6px">※ 기본 티어(G/K/JA/J/S/0티어)는 삭제할 수 없습니다.</div>
  </details>`;

  /* ════════════════════════════════
     g3: 🎨 외형 — 프로필 / 이미지 / 현황판 / FAB
  ════════════════════════════════ */
  let g3=``;

  // 스트리머 프로필 스타일
  g3+=`${_cfgD('profilestyle','🎨 스트리머 프로필 스타일 설정')}
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px">현황판 및 시스템 전체에 표시되는 스트리머 프로필의 모양과 기본 크기를 설정합니다.</div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px;display:flex;flex-direction:column;gap:12px">
      <div>
        <label style="font-size:12px;font-weight:700;color:var(--text2);display:block;margin-bottom:6px">프로필 모양</label>
        <div style="display:flex;gap:8px">
          <button class="btn btn-sm ${profileShape==='circle'?'btn-b':'btn-w'}" onclick="profileShape='circle';saveProfileStyleSettings();render()">🟢 원형</button>
          <button class="btn btn-sm ${profileShape==='square'?'btn-b':'btn-w'}" onclick="profileShape='square';saveProfileStyleSettings();render()">🟦 사각형</button>
        </div>
      </div>
      <div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
          <label style="font-size:12px;font-weight:700;color:var(--text2)">기본 크기 (px)</label>
          <span id="cfg-profile-size-val" style="font-size:12px;font-weight:700;color:var(--blue)">${profileSize}px</span>
        </div>
        <input type="range" id="cfg-profile-size" min="20" max="60" step="1" value="${profileSize}" style="width:100%;accent-color:var(--blue)"
          oninput="document.getElementById('cfg-profile-size-val').textContent=this.value+'px'">
        <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--gray-l);margin-top:2px"><span>20px</span><span>60px</span></div>
      </div>
      <button class="btn btn-b" onclick="saveProfileStyleSettings()" style="align-self:flex-start">💾 설정 저장</button>
    </div>
  </details>`;

  // 이미지탭 레이아웃
  g3+=`${_cfgD('b2layout','📐 이미지탭 레이아웃')}
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px">이미지탭(프로필 탭)의 좌우 비율과 높이를 설정합니다. 저장 즉시 반영됩니다.</div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px;display:flex;flex-direction:column;gap:14px">
      <div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
          <label style="font-size:12px;font-weight:700;color:var(--text2)">좌측(이미지) 너비</label>
          <span id="cfg-b2-left-size-val" style="font-size:12px;font-weight:700;color:var(--blue)">55%</span>
        </div>
        <input type="range" id="cfg-b2-left-size" min="30" max="70" step="1" value="55" style="width:100%;accent-color:var(--blue)"
          oninput="this.value=Math.min(70,Math.max(30,this.value));document.getElementById('cfg-b2-left-size-val').textContent=this.value+'%';document.getElementById('cfg-b2-right-size').value=100-parseInt(this.value);document.getElementById('cfg-b2-right-size-val').textContent=(100-parseInt(this.value))+'%'">
        <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--gray-l);margin-top:2px"><span>30%</span><span>70%</span></div>
      </div>
      <div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
          <label style="font-size:12px;font-weight:700;color:var(--text2)">우측(목록) 너비</label>
          <span id="cfg-b2-right-size-val" style="font-size:12px;font-weight:700;color:var(--blue)">45%</span>
        </div>
        <input type="range" id="cfg-b2-right-size" min="30" max="70" step="1" value="45" style="width:100%;accent-color:var(--blue)"
          oninput="this.value=Math.min(70,Math.max(30,this.value));document.getElementById('cfg-b2-right-size-val').textContent=this.value+'%';document.getElementById('cfg-b2-left-size').value=100-parseInt(this.value);document.getElementById('cfg-b2-left-size-val').textContent=(100-parseInt(this.value))+'%'">
        <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--gray-l);margin-top:2px"><span>30%</span><span>70%</span></div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <div>
          <label style="font-size:12px;font-weight:700;color:var(--text2);display:block;margin-bottom:4px">PC 높이 <span style="font-weight:400;color:var(--gray-l)">(px)</span></label>
          <input type="number" id="cfg-b2-pc-height" value="600" min="400" max="900" step="20" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700">
        </div>
        <div>
          <label style="font-size:12px;font-weight:700;color:var(--text2);display:block;margin-bottom:4px">태블릿 높이 <span style="font-weight:400;color:var(--gray-l)">(px)</span></label>
          <input type="number" id="cfg-b2-tablet-height" value="400" min="300" max="700" step="20" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700">
        </div>
        <div>
          <label style="font-size:12px;font-weight:700;color:var(--text2);display:block;margin-bottom:4px">모바일 높이 <span style="font-weight:400;color:var(--gray-l)">(px)</span></label>
          <input type="number" id="cfg-b2-mobile-height" value="320" min="200" max="600" step="20" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700">
        </div>
        <div style="display:flex;align-items:flex-end;padding-bottom:4px">
          <label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer;font-weight:700">
            <input type="checkbox" id="cfg-b2-auto-resize" checked style="width:15px;height:15px"> 자동 크기 조절
          </label>
        </div>
      </div>
      <div style="display:flex;gap:15px;align-items:center;flex-wrap:wrap">
        <label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer;font-weight:700">
          <input type="checkbox" id="cfg-b2-auto-cycle" checked style="width:15px;height:15px"> 전체대학 5초 자동 전환
        </label>
        <div style="display:flex;align-items:center;gap:8px">
          <label style="font-size:12px;font-weight:700;color:var(--text2)">목록 레이아웃:</label>
          <select id="cfg-b2-players-rows" style="padding:4px 8px;border-radius:6px;border:1px solid var(--border2);font-size:12px;font-weight:700">
            <option value="1">1행 (세로형)</option>
            <option value="2">2행 (기본)</option>
          </select>
        </div>
      </div>
      <button class="btn btn-b" onclick="saveB2LayoutSettings()" style="align-self:flex-start">💾 레이아웃 저장</button>
    </div>
  </details>`;

  // 이미지탭 이미지 설정
  g3+=`${_cfgD('imgsettings','🖼️ 이미지탭 이미지 설정')}
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px">이미지탭 ⚙️ 버튼과 동일한 설정입니다. 크기·밝기·배치·위치를 조절하면 즉시 반영됩니다.</div>
    <div id="cfg-b2-img-settings-wrap" style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px">
      <div style="font-size:12px;color:var(--gray-l)">로딩 중...</div>
    </div>
    <div style="font-size:11px;color:var(--gray-l);margin-top:6px;padding:0 2px">※ 스트리머 상세 모달 이미지 설정은 아래 별도 항목에서 설정</div>
  </details>`;

  // 스트리머 상세 이미지 설정
  g3+=`${_cfgD('imgmodalsettings','🖼️ 스트리머 상세 이미지 설정')}
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px">스트리머 상세 모달의 이미지 크기·밝기를 설정합니다.</div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px;display:flex;flex-direction:column;gap:12px">
      <label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer;font-weight:600">
        <input type="checkbox" id="cfg-img-fill" style="width:14px;height:14px"> 이미지 채우기 (cover) — 해제 시 맞춤 (contain)
      </label>
      <div>
        <div style="display:flex;justify-content:space-between;margin-bottom:4px">
          <label style="font-size:12px;font-weight:700;color:var(--text2)">기본 크기</label>
          <span id="cfg-img-scale-val" style="font-size:12px;font-weight:700;color:var(--blue)">1.0x</span>
        </div>
        <input type="range" id="cfg-img-scale" min="0.5" max="2" step="0.1" value="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-img-scale-val').textContent=parseFloat(this.value).toFixed(1)+'x'">
        <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--gray-l);margin-top:2px"><span>0.5x</span><span>2.0x</span></div>
      </div>
      <div>
        <div style="display:flex;justify-content:space-between;margin-bottom:4px">
          <label style="font-size:12px;font-weight:700;color:var(--text2)">기본 밝기</label>
          <span id="cfg-img-brightness-val" style="font-size:12px;font-weight:700;color:var(--blue)">1.0x</span>
        </div>
        <input type="range" id="cfg-img-brightness" min="0.3" max="2" step="0.1" value="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-img-brightness-val').textContent=parseFloat(this.value).toFixed(1)+'x'">
        <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--gray-l);margin-top:2px"><span>0.3x</span><span>2.0x</span></div>
      </div>
      <div>
        <div style="display:flex;justify-content:space-between;margin-bottom:4px">
          <label style="font-size:12px;font-weight:700;color:var(--text2)">좌측(모바일) 크기</label>
          <span id="cfg-img-scale-left-val" style="font-size:12px;font-weight:700;color:var(--blue)">1.0x</span>
        </div>
        <input type="range" id="cfg-img-scale-left" min="0.5" max="2" step="0.1" value="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-img-scale-left-val').textContent=parseFloat(this.value).toFixed(1)+'x'">
      </div>
      <div>
        <div style="display:flex;justify-content:space-between;margin-bottom:4px">
          <label style="font-size:12px;font-weight:700;color:var(--text2)">우측(PC) 크기</label>
          <span id="cfg-img-scale-right-val" style="font-size:12px;font-weight:700;color:var(--blue)">1.0x</span>
        </div>
        <input type="range" id="cfg-img-scale-right" min="0.5" max="2" step="0.1" value="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-img-scale-right-val').textContent=parseFloat(this.value).toFixed(1)+'x'">
      </div>
      <label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer;font-weight:600">
        <input type="checkbox" id="cfg-img-use-right-scale" style="width:14px;height:14px"> 좌우 개별 크기 사용
      </label>
      <button class="btn btn-b" onclick="saveImageSettings()" style="align-self:flex-start">💾 설정 저장</button>
    </div>
  </details>`;

  // 스트리머 상세 스타일 설정
  g3+=`<div class="ssec">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
      <h4 style="margin:0">🎨 스트리머 상세 스타일 설정</h4>
      <button id="cfg-pd-toggle" class="btn btn-w btn-xs" onclick="(function(){const c=document.getElementById('cfg-pd-body');const btn=document.getElementById('cfg-pd-toggle');if(c.style.display==='none'){c.style.display='';btn.textContent='▲ 접기';_renderCfgPdSection();}else{c.style.display='none';btn.textContent='▼ 펼치기';}})()">▼ 펼치기</button>
    </div>
    <div id="cfg-pd-body" style="display:none"></div>
  </div>`;

  // 현황판 라벨 배경 이미지
  g3+=`<div class="ssec">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
      <h4 style="margin:0">🖼️ 현황판 라벨 배경 이미지별 설정</h4>
      <button id="cfg-board-bg-toggle" class="btn btn-w btn-xs" onclick="(function(){const c=document.getElementById('cfg-board-bg-body');const btn=document.getElementById('cfg-board-bg-toggle');if(c.style.display==='none'){c.style.display='';btn.textContent='▲ 접기';}else{c.style.display='none';btn.textContent='▼ 펼치기';}})()">▼ 펼치기</button>
    </div>
    <div id="cfg-board-bg-body" style="display:none">
    <p style="font-size:12px;color:var(--gray-l);margin-bottom:12px">각 대학 라벨에 배경 이미지를 설정할 수 있습니다. 이미지 위치와 크기도 조절 가능합니다.</p>
    <div style="margin-bottom:14px;padding:14px;background:#f0f9ff;border:1px solid #bae6fd;border-radius:10px">
      <div style="font-size:12px;font-weight:700;color:#0369a1;margin-bottom:10px">📋 일괄 설정 (전체 대학)</div>
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:8px;flex-wrap:wrap">
        <label style="font-size:12px;font-weight:600;color:var(--text2)">이미지 URL:</label>
        <input type="text" id="bulk-bg-img-url" placeholder="https://..." style="flex:1;min-width:200px;padding:5px 8px;border:1px solid var(--border2);border-radius:6px;font-size:12px">
      </div>
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:8px;flex-wrap:wrap">
        <label style="font-size:12px;font-weight:600;color:var(--text2)">위치:</label>
        <select id="bulk-bg-img-pos" style="padding:4px 8px;border:1px solid var(--border2);border-radius:6px;font-size:12px">
          <option value="top left">좌상단</option><option value="top center">중상단</option><option value="top right">우상단</option>
          <option value="center left">좌중앙</option><option value="center center" selected>중앙</option><option value="center right">우중앙</option>
          <option value="bottom left">좌하단</option><option value="bottom center">중하단</option><option value="bottom right">우하단</option>
        </select>
        <label style="font-size:12px;font-weight:600;color:var(--text2)">크기:</label>
        <select id="bulk-bg-img-size" style="padding:4px 8px;border:1px solid var(--border2);border-radius:6px;font-size:12px">
          <option value="cover" selected>채우기 (cover)</option><option value="contain">맞춤 (contain)</option><option value="fill">늘리기 (fill)</option>
        </select>
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:8px">
        <button class="btn btn-b btn-sm" onclick="bulkSetBoardBgImg()">📋 전체 적용</button>
        <button class="btn btn-r btn-sm" onclick="bulkClearBoardBgImg()">🗑️ 전체 삭제</button>
      </div>
    </div>
    <div id="cfg-board-bg-list" style="max-height:400px;overflow-y:auto"></div>
    </div>
  </div>`;

  // 구현황판 카드 배경/라벨 밝기
  g3+=`<div class="ssec">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
      <h4 style="margin:0">🎨 구현황판 카드 배경/라벨 밝기 조절</h4>
      <button id="cfg-old-bright-toggle" class="btn btn-w btn-xs" onclick="(function(){const c=document.getElementById('cfg-old-bright-body');const btn=document.getElementById('cfg-old-bright-toggle');if(c.style.display==='none'){c.style.display='';btn.textContent='▲ 접기';}else{c.style.display='none';btn.textContent='▼ 펼치기';}})()">▼ 펼치기</button>
    </div>
    <div id="cfg-old-bright-body" style="display:none">
    <p style="font-size:12px;color:var(--gray-l);margin-bottom:12px">구현황판 카드의 배경과 라벨 밝기를 조절합니다. (구현황판 툴바에서도 조절 가능)</p>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px">
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px">
        <label style="font-size:12px;font-weight:600;color:var(--text2);min-width:80px">배경 밝기:</label>
        <input type="range" id="cfg-b2-bg-alpha" min="0" max="30" value="9" style="flex:1;accent-color:var(--blue)" oninput="document.getElementById('cfg-b2-bg-alpha-val').textContent=this.value+'%'">
        <span style="font-size:11px;color:var(--gray-l);min-width:30px;text-align:right;font-weight:700" id="cfg-b2-bg-alpha-val">9%</span>
      </div>
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px">
        <label style="font-size:12px;font-weight:600;color:var(--text2);min-width:80px">라벨 밝기:</label>
        <input type="range" id="cfg-b2-label-alpha" min="0" max="40" value="16" style="flex:1;accent-color:var(--blue)" oninput="document.getElementById('cfg-b2-label-alpha-val').textContent=this.value+'%'">
        <span style="font-size:11px;color:var(--gray-l);min-width:30px;text-align:right;font-weight:700" id="cfg-b2-label-alpha-val">16%</span>
      </div>
      <button class="btn btn-b" onclick="saveOldDashboardBrightness()">💾 저장</button>
    </div>
    </div>
  </div>`;

  // FAB 버튼 설정
  g3+=`${_cfgD('fab','🔘 FAB 버튼 탭 설정')}
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:14px">하단 FAB 버튼 클릭 시 이동할 탭을 설정합니다.</div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px">
      ${[['cal','캘린더',['cal:📅 캘린더','stats:📊 통계','roulette:🎰 룰렛']],
         ['comp','대회',['comp:🏆 대회','pro:🏅 프로리그','stats:📊 통계']],
         ['univm','대학대전',['univm:🏫 대학대전','ck:🏆 CK','stats:📊 통계']],
         ['ind','개인전',['ind:👤 개인전','gj:⚔️ 끝장전','stats:📊 통계']],
         ['pro','프로리그',['pro:🏅 프로리그','comp:🏆 대회','stats:📊 통계']]
        ].map(([key,label,opts])=>`<div style="display:flex;gap:8px;align-items:center;margin-bottom:12px">
        <label style="font-size:12px;font-weight:600;color:var(--text2);min-width:80px">${label}:</label>
        <select id="cfg-fab-${key}" style="flex:1;max-width:200px;padding:5px 8px;border:1px solid var(--border2);border-radius:6px;font-size:12px">
          ${opts.map(o=>{const[v,l]=o.split(':');return `<option value="${v}">${l}</option>`;}).join('')}
        </select>
      </div>`).join('')}
    </div>
    <div style="margin-top:16px;padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px">
      <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:10px">FAB 버튼 표시 설정</div>
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:8px">
        <label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer">
          <input type="checkbox" id="cfg-fab-hide-mobile" onchange="saveFabVisibilitySettings()">
          모바일에서 숨기기
        </label>
      </div>
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:8px">
        <label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer">
          <input type="checkbox" id="cfg-fab-hide-pc" onchange="saveFabVisibilitySettings()">
          PC에서 숨기기
        </label>
      </div>
    </div>
  </details>`;

  /* ════════════════════════════════
     g4: 🔧 시스템 — 계정 / 저장소 / Firebase / 동기화
  ════════════════════════════════ */
  let g4=``;

  // 관리자 계정 관리
  g4+=`${_cfgD('acct','👤 관리자 계정 관리')}
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:4px">• <b>관리자</b>: 모든 기능 + 설정 접근 가능</div>
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:14px">• <b>부관리자</b>: 경기 기록 입력만 가능 (설정/회원관리 불가)</div>
    <div style="margin-bottom:14px;padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:8px">
      <div style="font-size:12px;font-weight:700;color:var(--blue);margin-bottom:10px">등록된 계정 (<span id="adm-count">-</span>명)</div>
      <div id="adm-list"></div>
      <button class="btn btn-r btn-xs" style="margin-top:10px" onclick="clearAllAdmins()">⚠️ 전체 초기화 (기본값 리셋)</button>
    </div>
    <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:8px">+ 새 계정 추가</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:8px">
      <input type="text" id="adm-id" placeholder="아이디" style="width:140px" autocomplete="off">
      <input type="password" id="adm-pw" placeholder="비밀번호 (4자 이상)" style="width:150px" autocomplete="new-password">
      <select id="adm-role" style="border:1px solid var(--border2);border-radius:7px;padding:5px 8px;font-size:13px">
        <option value="admin">👑 관리자</option>
        <option value="sub-admin">🔰 부관리자</option>
      </select>
      <button class="btn btn-p" onclick="addAdminAccount()">+ 추가</button>
    </div>
    <div id="adm-msg" style="font-size:12px;min-height:18px"></div>
  </details>`;

  // 로컬 저장소 사용량
  g4+=`<div class="ssec">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
      <h4 style="margin:0">💾 로컬 저장소 사용량</h4>
      <button id="cfg-storage-toggle2" class="btn btn-w btn-xs" onclick="(function(){const c=document.getElementById('cfg-storage-wrap2');const btn=document.getElementById('cfg-storage-toggle2');if(c.style.display==='none'){c.style.display='';btn.textContent='▲ 접기';renderStorageInfo();}else{c.style.display='none';btn.textContent='▼ 펼치기';}})()">▼ 펼치기</button>
    </div>
    <div id="cfg-storage-wrap2" style="display:none">
      <div id="cfg-storage-info"><div style="color:var(--gray-l);font-size:12px">계산 중...</div></div>
      <button class="btn btn-w btn-sm" style="margin-top:8px" onclick="renderStorageInfo()">🔄 새로고침</button>
    </div>
  </div>`;

  // Firebase 동기화
  g4+=`<div class="ssec">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
      <h4 style="margin:0">☁️ Firebase 실시간 동기화</h4>
      <button id="cfg-fb-toggle" class="btn btn-w btn-xs" onclick="(function(){const c=document.getElementById('cfg-fb-body');const btn=document.getElementById('cfg-fb-toggle');if(c.style.display==='none'){c.style.display='';btn.textContent='▲ 접기';}else{c.style.display='none';btn.textContent='▼ 펼치기';}})()">▼ 펼치기</button>
    </div>
    <div id="cfg-fb-body" style="display:none">
    <p style="font-size:12px;color:var(--gray-l);margin-bottom:12px">관리자가 데이터를 저장할 때 Firebase에 자동으로 업로드됩니다. 다른 기기에서도 실시간으로 반영됩니다.</p>
    <div id="cfg-fb-sync-panel" style="margin-bottom:12px;padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;flex-wrap:wrap;gap:8px">
        <span style="font-size:12px;font-weight:700;color:var(--blue)">🔄 동기화 상태</span>
        <button class="btn btn-w btn-xs" onclick="checkFbSyncStatus()">🔍 지금 확인</button>
      </div>
      <div id="cfg-fb-sync-result" style="font-size:12px;color:var(--gray-l)">확인 버튼을 눌러 상태를 확인하세요.</div>
    </div>
    <div style="margin-bottom:10px;padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:8px">
      <div style="font-size:12px;font-weight:700;color:var(--blue);margin-bottom:8px">Firebase 비밀번호</div>
      <div style="font-size:11px;color:var(--gray-l);margin-bottom:10px">Firebase Security Rules에서 설정한 admin_pw 값을 입력하세요. 저장 시 이 비밀번호로 쓰기 인증됩니다.</div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <input type="password" id="cfg-fb-pw" placeholder="Firebase 비밀번호 입력..." style="width:220px" autocomplete="new-password">
        <button class="btn btn-b" onclick="saveFbPw()">💾 저장</button>
        <button class="btn btn-r btn-xs" onclick="clearFbPw()">지우기</button>
      </div>
      <div id="fb-pw-status" style="font-size:12px;margin-top:8px;min-height:16px;color:var(--gray-l)">${localStorage.getItem('su_fb_pw')?'✅ 비밀번호 설정됨':'미설정'}</div>
    </div>
    <div style="margin-bottom:10px;padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:8px">
      <div style="font-size:12px;font-weight:700;color:#16a34a;margin-bottom:8px">GitHub 토큰 (관람자 수천 명 무료 지원)</div>
      <div style="font-size:11px;color:var(--gray-l);margin-bottom:6px">설정 시: 저장할 때 GitHub data.json도 자동 업로드 → 관람자들이 GitHub CDN에서 데이터를 받아 Firebase 동시접속 100명 제한 없이 수천 명도 무료로 지원됩니다.</div>
      <div style="font-size:11px;color:var(--gray-l);margin-bottom:10px">GitHub → Settings → Developer settings → Personal access tokens → Fine-grained token → Contents: Read and Write 권한 발급</div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <input type="password" id="cfg-gh-token" placeholder="ghp_xxxxxxxxxxxx" style="width:260px" autocomplete="new-password">
        <button class="btn btn-b" onclick="saveGhToken()">💾 저장</button>
        <button class="btn btn-r btn-xs" onclick="clearGhToken()">지우기</button>
      </div>
      <div id="gh-token-status" style="font-size:12px;margin-top:8px;min-height:16px;color:var(--gray-l)">${localStorage.getItem('su_gh_token')?'✅ 토큰 설정됨 (저장 시 GitHub 자동 업로드 활성)':'미설정 (관람자는 Firebase 사용 중)'}</div>
    </div>
    </div>
  </div>`;

  // 데이터 동기화
  g4+=`${_cfgD('sync','🔄 데이터 동기화')}
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px">경기 기록을 각 탭 기록 및 스트리머 최근 경기에 반영합니다.</div>
    <div style="display:flex;flex-direction:column;gap:10px;padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px">
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <button class="btn btn-b btn-sm" onclick="
          _ttMigrated=false;_migrateTierTourneys();
          const n=syncAllHistory?syncAllHistory():0;
          alert('✅ 티어대회 기록 동기화 + '+n+'건 스트리머 반영 완료');render();">🔄 전체 동기화 (기록탭 + 스트리머)</button>
        <span style="font-size:11px;color:var(--gray-l)">티어대회 기록탭·대전기록 반영 + 스트리머 최근 경기 소급 반영</span>
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <button class="btn btn-p btn-sm" onclick="
          _ttMigrated=false;_migrateTierTourneys();
          const before=ttM.length;save();render();
          alert('✅ 티어대회 기록 동기화 완료\\n추가된 기록: '+(ttM.length-before)+'건');">🎯 티어대회 기록 동기화</button>
        <span style="font-size:11px;color:var(--gray-l)">조별리그·토너먼트 경기를 기록탭·대전기록에 반영 (누락 시 사용)</span>
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <button class="btn btn-b btn-sm" onclick="syncAllHistoryBtn()">📋 스트리머 최근 경기 반영</button>
        <span style="font-size:11px;color:var(--gray-l)">모든 경기를 스트리머 상세의 최근 경기에 소급 반영</span>
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <button class="btn btn-w btn-sm" onclick="
          const seen=new Set();let removed=0;
          ttM=ttM.filter(m=>{if(!m._id)return true;if(seen.has(m._id)){removed++;return false;}seen.add(m._id);return true;});
          save();render();alert('✅ ttM 중복 제거 완료: '+removed+'건 삭제');
        ">🗑️ 중복 경기 제거</button>
        <span style="font-size:11px;color:var(--gray-l)">같은 _id로 이중 등록된 티어대회 경기 제거</span>
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <button class="btn btn-y btn-sm" onclick="deduplicatePlayerHistory()">🧹 중복 기록 제거</button>
        <span style="font-size:11px;color:var(--gray-l)">스트리머 history에서 중복 항목만 제거 (승패/ELO 재계산)</span>
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <button class="btn btn-r btn-sm" onclick="rebuildAllPlayerHistory()">🔄 전체 경기 기록 복구</button>
        <span style="font-size:11px;color:var(--gray-l)">대전 데이터에서 스트리머 history 재구성 (기존 history 초기화됨)</span>
      </div>
    </div>
  </details>`;

  /* ════════════════════════════════
     g5: ⚡ 일괄 — 날짜변경 / 범위삭제 / 맵교체 / 티어변경
  ════════════════════════════════ */
  let g5=``;

  // 날짜 일괄 변경
  g5+=`${_cfgD('bulkdate','📅 날짜 일괄 변경')}
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px">
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:8px">
        <label style="font-size:12px;font-weight:600;color:var(--text2)">변경 전 날짜</label>
        <input type="date" id="bulk-date-from" style="font-size:12px">
        <label style="font-size:12px;font-weight:600;color:var(--text2)">→ 변경 후</label>
        <input type="date" id="bulk-date-to" style="font-size:12px">
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">
        <label style="font-size:11px;font-weight:600;color:var(--text3)">대상:</label>
        ${['mini','univm','ck','pro','tt','ind','gj','comp'].map(m=>`
        <label style="display:inline-flex;align-items:center;gap:3px;font-size:11px;cursor:pointer">
          <input type="checkbox" id="bulk-date-chk-${m}" checked style="cursor:pointer">
          ${{ mini:'미니대전', univm:'대학대전', ck:'CK', pro:'프로리그', tt:'티어대회', ind:'개인전', gj:'끝장전', comp:'대회' }[m]}
        </label>`).join('')}
      </div>
      <button class="btn btn-b btn-sm" onclick="bulkChangeDate()">📅 날짜 일괄 변경</button>
      <span id="bulk-date-result" style="font-size:12px;margin-left:8px;color:var(--green)"></span>
    </div>
  </details>`;

  // 날짜 범위 일괄 삭제
  g5+=`${_cfgD('bulkdel','🗑️ 날짜 범위 일괄 삭제')}
    <div style="padding:14px;background:#fef2f2;border:1px solid #fecaca;border-radius:10px">
      <div style="font-size:12px;color:#dc2626;font-weight:700;margin-bottom:10px">⚠️ 주의: 선택한 기간 내의 모든 경기가 완전히 삭제됩니다.</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:8px">
        <label style="font-size:12px;font-weight:600;color:#991b1b">시작 날짜</label>
        <input type="date" id="bulk-del-from" style="font-size:12px">
        <label style="font-size:12px;font-weight:600;color:#991b1b">~ 종료 날짜</label>
        <input type="date" id="bulk-del-to" style="font-size:12px">
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">
        <label style="font-size:11px;font-weight:600;color:#991b1b">대상:</label>
        ${['mini','univm','ck','pro','tt','ind','gj','comp'].map(m=>`
        <label style="display:inline-flex;align-items:center;gap:3px;font-size:11px;cursor:pointer;color:#991b1b">
          <input type="checkbox" id="bulk-del-chk-${m}" checked style="cursor:pointer">
          ${{ mini:'미니대전', univm:'대학대전', ck:'CK', pro:'프로리그', tt:'티어대회', ind:'개인전', gj:'끝장전', comp:'대회' }[m]}
        </label>`).join('')}
      </div>
      <button class="btn btn-r btn-sm" onclick="bulkDeleteRecordsByDate()">🗑️ 범위 일괄 삭제</button>
      <span id="bulk-del-result" style="font-size:12px;margin-left:8px;color:#dc2626;font-weight:700"></span>
    </div>
  </details>`;

  // 맵 이름 일괄 교체
  g5+=`${_cfgD('bulkmap','🗺️ 맵 이름 일괄 교체')}
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px">
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:8px">
        <label style="font-size:12px;font-weight:600;color:var(--text2)">교체 전</label>
        <input type="text" id="bulk-map-from" placeholder="예: 투혼II" style="font-size:12px;width:120px">
        <label style="font-size:12px;font-weight:600;color:var(--text2)">→ 교체 후</label>
        <input type="text" id="bulk-map-to" placeholder="예: 투혼" style="font-size:12px;width:120px">
      </div>
      <button class="btn btn-b btn-sm" onclick="bulkChangeMap()">🗺️ 맵 일괄 교체</button>
      <span id="bulk-map-result" style="font-size:12px;margin-left:8px;color:var(--green)"></span>
    </div>
  </details>`;

  // 선수 일괄 티어 변경
  g5+=`<div class="ssec">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
      <h4 style="margin:0">🎖️ 선수 일괄 티어 변경</h4>
      <button id="cfg-bulk-tier-toggle" class="btn btn-w btn-xs" onclick="(function(){const c=document.getElementById('cfg-bulk-tier-body');const btn=document.getElementById('cfg-bulk-tier-toggle');if(c.style.display==='none'){c.style.display='';btn.textContent='▲ 접기';}else{c.style.display='none';btn.textContent='▼ 펼치기';}})()">▼ 펼치기</button>
    </div>
    <div id="cfg-bulk-tier-body" style="display:none">
    <div style="padding:14px;background:#f0f9ff;border:1px solid #bae6fd;border-radius:10px">
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:8px">
        <label style="font-size:12px;font-weight:600;color:var(--text2)">현재 티어</label>
        <select id="bulk-tier-from" style="font-size:12px;padding:3px 8px;border-radius:6px;border:1px solid var(--border2)">
          <option value="">전체 (상관없음)</option>
          ${TIERS.map(t=>`<option value="${t}">${getTierLabel(t)||t}</option>`).join('')}
          <option value="미정">미정</option>
        </select>
        <label style="font-size:12px;font-weight:600;color:var(--text2)">→ 변경할 티어</label>
        <select id="bulk-tier-to" style="font-size:12px;padding:3px 8px;border-radius:6px;border:1px solid var(--border2)">
          <option value="">선택</option>
          ${TIERS.map(t=>`<option value="${t}">${getTierLabel(t)||t}</option>`).join('')}
          <option value="미정">미정</option>
        </select>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:8px">
        <label style="font-size:12px;font-weight:600;color:var(--text2)">대상 대학</label>
        <select id="bulk-tier-univ" style="font-size:12px;padding:3px 8px;border-radius:6px;border:1px solid var(--border2)">
          <option value="">전체 대학</option>
          ${getAllUnivs().map(u=>`<option value="${u.name}">${u.name}</option>`).join('')}
        </select>
      </div>
      <button class="btn btn-b btn-sm" onclick="bulkChangeTier()">🎖️ 티어 일괄 변경</button>
      <span id="bulk-tier-result" style="font-size:12px;margin-left:8px;color:var(--blue)"></span>
    </div>
    </div>
  </div>`;

  /* ────────────────────────────────
     DOM 초기화 (50ms 후 실행)
  ──────────────────────────────── */
  setTimeout(()=>{
    if(typeof _renderCfgSiList==='function') _renderCfgSiList();
    renderStorageInfo();
    renderSeasonList();
    const el=document.getElementById('adm-count');
    const listEl=document.getElementById('adm-list');
    const accounts=getAdminAccounts();
    if(el)el.textContent=accounts.length;
    if(listEl){
      if(!accounts.length){listEl.innerHTML='<div style="font-size:12px;color:var(--gray-l)">등록된 계정 없음</div>';return;}
      listEl.innerHTML=accounts.map((a,i)=>`
        <div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border)">
          <span style="flex:1;font-size:13px;font-weight:600">${a.label||'(이름없음)'}</span>
          <span style="padding:2px 9px;border-radius:5px;font-size:10px;font-weight:700;${a.role==='sub-admin'?'background:#fef3c7;color:#92400e;border:1px solid #fde68a':'background:#dbeafe;color:#1e40af;border:1px solid #bfdbfe'}">${a.role==='sub-admin'?'🔰 부관리자':'👑 관리자'}</span>
          <button class="btn btn-r btn-xs" onclick="deleteAdminAccount(${i})">🗑️ 삭제</button>
        </div>`).join('');
    }
    // 현황판 배경 설정 렌더링
    const bgListEl=document.getElementById('cfg-board-bg-list');
    if(bgListEl){
      bgListEl.innerHTML=univCfg.map((u,i)=>`<div style="border:1px solid var(--border);border-radius:8px;padding:10px 12px;margin-bottom:8px;background:var(--white)">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
          <div class="cdot" style="background:${u.color}"></div>
          <span style="flex:1;font-weight:700;font-size:13px">${u.name}</span>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px">
          <button class="btn btn-xs btn-w" onclick="promptBoardBgImgUrl('${u.name.replace(/'/g,"\\'")}')">URL 설정</button>
          ${u.bgImg?`<button class="btn btn-xs btn-r" onclick="removeBoardBgImg('${u.name.replace(/'/g,"\\'")}')">삭제</button>`:''}
        </div>
        ${u.bgImg?`<div style="margin-top:8px">
          <div style="font-size:11px;font-weight:600;color:var(--text2);margin-bottom:6px">위치</div>
          <select onchange="setBoardBgImgPos('${u.name.replace(/'/g,"\\'")}',this.value)" style="padding:4px 8px;border:1px solid var(--border2);border-radius:6px;font-size:12px">
            <option value="top left" ${u.bgImgPos==='top left'?' selected':''}>좌상단</option>
            <option value="top center" ${u.bgImgPos==='top center'?' selected':''}>중상단</option>
            <option value="top right" ${u.bgImgPos==='top right'?' selected':''}>우상단</option>
            <option value="center left" ${u.bgImgPos==='center left'?' selected':''}>좌중앙</option>
            <option value="center center" ${u.bgImgPos==='center center'?' selected':''}>중앙</option>
            <option value="center right" ${u.bgImgPos==='center right'?' selected':''}>우중앙</option>
            <option value="bottom left" ${u.bgImgPos==='bottom left'?' selected':''}>좌하단</option>
            <option value="bottom center" ${u.bgImgPos==='bottom center'?' selected':''}>중하단</option>
            <option value="bottom right" ${u.bgImgPos==='bottom right'?' selected':''}>우하단</option>
          </select>
          <div style="font-size:11px;font-weight:600;color:var(--text2);margin-bottom:6px;margin-top:8px">크기</div>
          <select onchange="setBoardBgImgSize('${u.name.replace(/'/g,"\\'")}',this.value)" style="padding:4px 8px;border:1px solid var(--border2);border-radius:6px;font-size:12px">
            <option value="cover" ${u.bgImgSize==='cover'?' selected':''}>채우기 (cover)</option>
            <option value="contain" ${u.bgImgSize==='contain'?' selected':''}>맞춤 (contain)</option>
            <option value="fill" ${u.bgImgSize==='fill'?' selected':''}>늘리기 (fill)</option>
          </select>
        </div>`:''}
      </div>`).join('');
    }
    // 이미지탭 레이아웃 설정 초기화
    const b2Layout=JSON.parse(localStorage.getItem('su_b2_layout')||'{}');
    const _b2ls=b2Layout.leftSize||55, _b2rs=b2Layout.rightSize||45;
    const _b2lEl=document.getElementById('cfg-b2-left-size'), _b2rEl=document.getElementById('cfg-b2-right-size');
    if(_b2lEl){_b2lEl.value=_b2ls;const v=document.getElementById('cfg-b2-left-size-val');if(v)v.textContent=_b2ls+'%';}
    if(_b2rEl){_b2rEl.value=_b2rs;const v=document.getElementById('cfg-b2-right-size-val');if(v)v.textContent=_b2rs+'%';}
    if(document.getElementById('cfg-b2-pc-height'))document.getElementById('cfg-b2-pc-height').value=b2Layout.pcHeight||600;
    if(document.getElementById('cfg-b2-mobile-height'))document.getElementById('cfg-b2-mobile-height').value=b2Layout.mobileHeight||320;
    if(document.getElementById('cfg-b2-tablet-height'))document.getElementById('cfg-b2-tablet-height').value=b2Layout.tabletHeight||400;
    if(document.getElementById('cfg-b2-auto-resize'))document.getElementById('cfg-b2-auto-resize').checked=b2Layout.autoResize!==false;
    // 이미지탭 이미지 설정 (board2 전역 설정) 렌더링
    const _cfgB2ImgWrap=document.getElementById('cfg-b2-img-settings-wrap');
    if(_cfgB2ImgWrap){
      if(typeof _b2BuildImageControlGroup==='function') {
        _cfgB2ImgWrap.innerHTML=`
          <div style="font-weight:700;font-size:12px;color:var(--text2);margin-bottom:10px">이미지 1 (기본 이미지)</div>
          ${_b2BuildImageControlGroup('','primary','이미지 1',true)}
          <div style="font-weight:700;font-size:12px;color:var(--text2);margin:14px 0 10px">이미지 2 (두번째 이미지)</div>
          ${_b2BuildImageControlGroup('','secondary','이미지 2',true)}
        `;
      } else {
        _cfgB2ImgWrap.innerHTML=`<div style="font-size:12px;color:var(--gray-l);padding:10px 0;text-align:center">이미지 탭(현황판) 모듈이 로드되지 않았습니다. 현황판 탭을 먼저 열어주세요.</div>`;
      }
    }
    // 스트리머 상세 이미지 설정 초기화
    const imgSettings=JSON.parse(localStorage.getItem('su_img_settings')||'{}');
    if(document.getElementById('cfg-img-fill'))document.getElementById('cfg-img-fill').checked=imgSettings.fill||false;
    if(document.getElementById('cfg-img-scale')){document.getElementById('cfg-img-scale').value=imgSettings.scale||1;document.getElementById('cfg-img-scale-val').textContent=(imgSettings.scale||1).toFixed(1)+'x';}
    if(document.getElementById('cfg-img-brightness')){document.getElementById('cfg-img-brightness').value=imgSettings.brightness||1;document.getElementById('cfg-img-brightness-val').textContent=(imgSettings.brightness||1).toFixed(1)+'x';}
    if(document.getElementById('cfg-img-scale-left')){document.getElementById('cfg-img-scale-left').value=imgSettings.scaleLeft||1;document.getElementById('cfg-img-scale-left-val').textContent=(imgSettings.scaleLeft||1).toFixed(1)+'x';}
    if(document.getElementById('cfg-img-scale-right')){document.getElementById('cfg-img-scale-right').value=imgSettings.scaleRight||1;document.getElementById('cfg-img-scale-right-val').textContent=(imgSettings.scaleRight||1).toFixed(1)+'x';}
    if(document.getElementById('cfg-img-use-right-scale'))document.getElementById('cfg-img-use-right-scale').checked=imgSettings.useRightScale||false;
    if(document.getElementById('cfg-img-random'))document.getElementById('cfg-img-random').checked=imgSettings.randomRotation||false;
    if(document.getElementById('cfg-img-interval'))document.getElementById('cfg-img-interval').value=imgSettings.interval||5;
    // 구현황판 밝기 설정 초기화
    const b2LabelAlpha=parseInt(localStorage.getItem('su_b2la')||'16');
    const b2BgAlpha=parseInt(localStorage.getItem('su_b2ba')||'9');
    if(document.getElementById('cfg-b2-label-alpha')){document.getElementById('cfg-b2-label-alpha').value=b2LabelAlpha;document.getElementById('cfg-b2-label-alpha-val').textContent=b2LabelAlpha+'%';}
    if(document.getElementById('cfg-b2-bg-alpha')){document.getElementById('cfg-b2-bg-alpha').value=b2BgAlpha;document.getElementById('cfg-b2-bg-alpha-val').textContent=b2BgAlpha+'%';}
    // 레이아웃 자동 저장 이벤트 리스너
    ['cfg-b2-left-size','cfg-b2-right-size','cfg-b2-pc-height','cfg-b2-mobile-height','cfg-b2-tablet-height'].forEach(id=>{
      const el=document.getElementById(id);
      if(el)el.addEventListener('change',saveB2LayoutSettings);
    });
    const autoResizeEl=document.getElementById('cfg-b2-auto-resize');
    if(autoResizeEl)autoResizeEl.addEventListener('change',saveB2LayoutSettings);
    // 스트리머 상세 이미지 설정 자동 저장 이벤트 리스너
    ['cfg-img-fill','cfg-img-scale','cfg-img-brightness','cfg-img-scale-left','cfg-img-scale-right','cfg-img-random','cfg-img-interval'].forEach(id=>{
      const el=document.getElementById(id);
      if(el)el.addEventListener('change',saveImageSettings);
    });
  },50);

  C.innerHTML = tabBar + _gw('basic',g1) + _gw('data',g2) + _gw('appear',g3) + _gw('system',g4) + _gw('bulk',g5);

  setTimeout(_refreshAliasList, 10);
  // FAB 탭 설정 초기화
  window.saveFabTabSetting = function(btnKey, tabId){
    const settings=JSON.parse(localStorage.getItem('su_fabTabs')||'{}');
    settings[btnKey]=tabId;
    localStorage.setItem('su_fabTabs',JSON.stringify(settings));
    if(typeof updateFabButtonOnclick==='function')updateFabButtonOnclick();
    if(typeof save==='function' && typeof isLoggedIn!=='undefined' && isLoggedIn) save();
  };
  window.initFabTabSettings = function(){
    const settings=JSON.parse(localStorage.getItem('su_fabTabs')||'{}');
    const defaults={cal:'cal',comp:'comp',univm:'univm',ind:'ind',pro:'pro'};
    Object.keys(defaults).forEach(key=>{
      const el=document.getElementById('cfg-fab-'+key);
      if(el){
        el.value=settings[key]||defaults[key];
      }
    });
    if(typeof updateFabButtonOnclick==='function')updateFabButtonOnclick();
  };
  window.saveFabVisibilitySettings = function(){
    const hideMobile = document.getElementById('cfg-fab-hide-mobile')?.checked;
    const hidePC = document.getElementById('cfg-fab-hide-pc')?.checked;
    localStorage.setItem('su_fabHideMobile', hideMobile ? '1' : '0');
    localStorage.setItem('su_fabHidePC', hidePC ? '1' : '0');
    if(typeof updateFabVisibility==='function')updateFabVisibility();
    if(typeof save==='function')save();
  };
  window.initFabVisibilitySettings = function(){
    const hideMobile = localStorage.getItem('su_fabHideMobile') === '1';
    const hidePC = localStorage.getItem('su_fabHidePC') === '1';
    if(document.getElementById('cfg-fab-hide-mobile'))document.getElementById('cfg-fab-hide-mobile').checked = hideMobile;
    if(document.getElementById('cfg-fab-hide-pc'))document.getElementById('cfg-fab-hide-pc').checked = hidePC;
  };
  setTimeout(function(){window.initFabTabSettings();window.initFabVisibilitySettings();}, 50);
} // end rCfg

function renderStorageInfo(){
  const el=document.getElementById('cfg-storage-info');
  if(!el)return;
  try{
    let total=0;const rows=[];
    for(let i=0;i<localStorage.length;i++){
      const k=localStorage.key(i);const v=localStorage.getItem(k)||'';
      const bytes=(k.length+v.length)*2;total+=bytes;
      if(k.startsWith('su_'))rows.push({k,bytes});
    }
    rows.sort((a,b)=>b.bytes-a.bytes);
    const limit=5*1024*1024;
    const pct=Math.min(100,Math.round(total/limit*100));
    const barCol=pct>=90?'#dc2626':pct>=70?'#f59e0b':'#22c55e';
    const fmt=b=>b>=1024*1024?(b/1024/1024).toFixed(2)+'MB':b>=1024?(b/1024).toFixed(1)+'KB':b+'B';
    const LABELS={'su_p':'선수 데이터','su_pp':'선수 사진','su_mm':'미니대전','su_um':'대학대전','su_ck':'대학CK','su_pro':'프로리그','su_cm':'대회','su_tn':'토너먼트','su_mb':'회원관리','su_notices':'공지','su_psi':'상태아이콘'};
    el.innerHTML=`
    <div style="margin-bottom:10px">
      <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:5px">
        <span style="font-weight:700;color:var(--text)">${fmt(total)} / 5MB 사용</span>
        <span style="font-weight:700;color:${barCol}">${pct}%</span>
      </div>
      <div style="height:10px;border-radius:5px;background:var(--border2);overflow:hidden">
        <div style="height:100%;width:${pct}%;background:${barCol};border-radius:5px;transition:.3s"></div>
      </div>
      ${pct>=70?`<div style="font-size:11px;color:${barCol};margin-top:5px;font-weight:600">${pct>=90?'⚠️ 저장 공간이 거의 가득 찼습니다! 데이터를 정리해 주세요.':'⚠️ 저장 공간이 많이 사용되고 있습니다.'}</div>`:''}
    </div>
    <div style="font-size:11px;color:var(--gray-l);margin-bottom:4px">항목별 사용량 (상위 10개)</div>
    <div style="font-size:11px;line-height:1.8">
      ${rows.slice(0,10).map(({k,bytes})=>{
        const label=LABELS[k]||k;
        const bpct=Math.min(100,Math.round(bytes/limit*100));
        return `<div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">
          <span style="min-width:100px;color:var(--text2)">${label}</span>
          <div style="flex:1;height:6px;border-radius:3px;background:var(--border2);overflow:hidden"><div style="height:100%;width:${bpct}%;background:#60a5fa;border-radius:3px"></div></div>
          <span style="min-width:55px;text-align:right;color:var(--gray-l)">${fmt(bytes)}</span>
        </div>`;
      }).join('')}
    </div>`;
  }catch(e){el.innerHTML='<div style="color:var(--gray-l);font-size:12px">사용량 계산 불가</div>';}
}

// ── 이미지탭 레이아웃 저장 함수 ──
function saveB2LayoutSettings(){
  const settings = {
    autoResize: document.getElementById('cfg-b2-auto-resize')?.checked !== false,
    leftSize: parseInt(document.getElementById('cfg-b2-left-size')?.value) || 55,
    rightSize: parseInt(document.getElementById('cfg-b2-right-size')?.value) || 45,
    pcHeight: parseInt(document.getElementById('cfg-b2-pc-height')?.value) || 600,
    mobileHeight: parseInt(document.getElementById('cfg-b2-mobile-height')?.value) || 320,
    tabletHeight: parseInt(document.getElementById('cfg-b2-tablet-height')?.value) || 400,
    autoCycle: document.getElementById('cfg-b2-auto-cycle')?.checked !== false,
    playersRows: parseInt(document.getElementById('cfg-b2-players-rows')?.value) || 2
  };
  localStorage.setItem('su_b2_layout', JSON.stringify(settings));
  // 전역 변수 동기화
  if (typeof _b2AutoCycle !== 'undefined') window._b2AutoCycle = settings.autoCycle;
  if (typeof _b2PlayersRows !== 'undefined') window._b2PlayersRows = settings.playersRows;

  if(typeof save==='function')save();
  alert('이미지탭 레이아웃이 저장되었습니다.');
  if(typeof render === 'function') render();
}

function saveProfileStyleSettings() {
  const size = parseInt(document.getElementById('cfg-profile-size')?.value) || 32;
  profileShape = profileShape || 'circle'; // 이미 클릭 이벤트로 설정됨
  profileSize = size;

  localStorage.setItem('su_profile_shape', profileShape);
  localStorage.setItem('su_profile_size', profileSize);

  if(typeof save==='function')save();
  alert('프로필 스타일 설정이 저장되었습니다.');
  if(typeof render === 'function') render();
}

// ── 구현황판 밝기 저장 함수 ──
function saveOldDashboardBrightness(){
  const labelAlpha = parseInt(document.getElementById('cfg-b2-label-alpha')?.value) || 16;
  const bgAlpha = parseInt(document.getElementById('cfg-b2-bg-alpha')?.value) || 9;
  localStorage.setItem('su_b2la', labelAlpha);
  localStorage.setItem('su_b2ba', bgAlpha);
  if(typeof save==='function')save();
  alert('구현황판 밝기 설정이 저장되었습니다.');
  if(typeof render === 'function') render();
}

// ── 이미지 설정 저장 함수 ──
function saveImageSettings(){
  const settings = {
    fill: document.getElementById('cfg-img-fill')?.checked || false,
    scale: parseFloat(document.getElementById('cfg-img-scale')?.value) || 1,
    brightness: parseFloat(document.getElementById('cfg-img-brightness')?.value) || 1,
    scaleLeft: parseFloat(document.getElementById('cfg-img-scale-left')?.value) || 1,
    scaleRight: parseFloat(document.getElementById('cfg-img-scale-right')?.value) || 1,
    useRightScale: document.getElementById('cfg-img-use-right-scale')?.checked || false,
    randomRotation: document.getElementById('cfg-img-random')?.checked || false,
    interval: parseInt(document.getElementById('cfg-img-interval')?.value) || 5
  };
  localStorage.setItem('su_img_settings', JSON.stringify(settings));

  // 이미지탭(board2)과 동기화를 위한 저장
  const b2Settings = {
    primary: {
      fill: settings.fill ? 'contain' : 'cover',
      scale: settings.scale * 100,
      brightness: settings.brightness * 100,
      offsetX: 0,
      offsetY: 0,
      zoom: settings.scale * 100,
      posX: 0,
      posY: 0
    },
    secondary: {
      fill: settings.fill ? 'contain' : 'cover',
      scale: settings.scale * 100,
      brightness: settings.brightness * 100,
      offsetX: 0,
      offsetY: 0,
      zoom: settings.scale * 100,
      posX: 0,
      posY: 0
    }
  };
  localStorage.setItem('su_b2_global_img_settings', JSON.stringify(b2Settings));

  if(typeof save==='function')save();
  alert('이미지 설정이 저장되었습니다.');
  if(typeof render === 'function') render();
}

// ── 우클릭 이미지 조절 메뉴 ──
let _imgContextMenuEl = null;
let _currentImageTarget = null;

function showImageContextMenu(e, imgElement){
  e.preventDefault();
  _currentImageTarget = imgElement;

  // 기존 메뉴 제거
  if(_imgContextMenuEl){
    _imgContextMenuEl.remove();
  }

  const menu = document.createElement('div');
  menu.style.cssText = `
    position: fixed;
    left: ${e.clientX}px;
    top: ${e.clientY}px;
    background: var(--white);
    border: 1px solid var(--border2);
    border-radius: 8px;
    padding: 8px 0;
    min-width: 180px;
    z-index: 10000;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  `;

  const imgSettings = JSON.parse(localStorage.getItem('su_img_settings')||'{}');
  const currentScale = imgElement.dataset.scale || imgSettings.scale || 1;
  const currentBrightness = imgElement.dataset.brightness || imgSettings.brightness || 1;

  menu.innerHTML = `
    <div style="padding: 8px 16px; font-size: 12px; font-weight: 700; color: var(--text2); border-bottom: 1px solid var(--border);">
      🖼️ 이미지 조절
    </div>
    <div style="padding: 8px 16px;">
      <label style="font-size: 11px; font-weight: 600; color: var(--text3); display: block; margin-bottom: 4px;">크기: <span id="ctx-scale-val">${currentScale}x</span></label>
      <input type="range" id="ctx-scale" min="0.5" max="3" step="0.1" value="${currentScale}" style="width: 100%;" oninput="document.getElementById('ctx-scale-val').textContent=this.value+'x'">
    </div>
    <div style="padding: 8px 16px;">
      <label style="font-size: 11px; font-weight: 600; color: var(--text3); display: block; margin-bottom: 4px;">밝기: <span id="ctx-bright-val">${currentBrightness}x</span></label>
      <input type="range" id="ctx-bright" min="0.3" max="2" step="0.1" value="${currentBrightness}" style="width: 100%;" oninput="document.getElementById('ctx-bright-val').textContent=this.value+'x'">
    </div>
    <div style="padding: 8px 16px; border-top: 1px solid var(--border);">
      <button onclick="applyImageContextStyle()" style="width: 100%; padding: 6px 12px; background: var(--blue); color: #fff; border: none; border-radius: 6px; font-size: 12px; font-weight: 600; cursor:pointer;">✅ 적용</button>
    </div>
  `;

  document.body.appendChild(menu);
  _imgContextMenuEl = menu;

  // 메뉴 외부 클릭 시 닫기
  setTimeout(()=>{
    const closeMenu = (ev)=>{
      if(!menu.contains(ev.target)){
        menu.remove();
        _imgContextMenuEl = null;
        document.removeEventListener('click', closeMenu);
      }
    };
    document.addEventListener('click', closeMenu);
  }, 0);
}

function applyImageContextStyle(){
  if(!_currentImageTarget) return;

  const scale = document.getElementById('ctx-scale')?.value || 1;
  const brightness = document.getElementById('ctx-bright')?.value || 1;

  _currentImageTarget.style.transform = `scale(${scale})`;
  _currentImageTarget.style.filter = `brightness(${brightness})`;
  _currentImageTarget.dataset.scale = scale;
  _currentImageTarget.dataset.brightness = brightness;

  if(_imgContextMenuEl){
    _imgContextMenuEl.remove();
    _imgContextMenuEl = null;
  }
}

// ── 랜덤 이미지 회전 ──
let _randomRotationTimer = null;

function startRandomRotation(){
  stopRandomRotation();
  const imgSettings = JSON.parse(localStorage.getItem('su_img_settings')||'{}');
  if(!imgSettings.randomRotation) return;

  const interval = (imgSettings.interval || 5) * 1000;

  _randomRotationTimer = setInterval(()=>{
    rotateRandomImage();
  }, interval);
}

function stopRandomRotation(){
  if(_randomRotationTimer){
    clearInterval(_randomRotationTimer);
    _randomRotationTimer = null;
  }
}

function rotateRandomImage(){
  const imgSettings = JSON.parse(localStorage.getItem('su_img_settings')||'{}');
  if(!imgSettings.randomRotation) return;

  // 랜덤 스트리머 선택
  if(players && players.length > 0){
    const randomPlayer = players[Math.floor(Math.random() * players.length)];

    // 전체대학 보기
    if(currentTab === 'total'){
      const imgContainer = document.querySelector('.random-image-container');
      if(imgContainer && randomPlayer.photo){
        imgContainer.src = randomPlayer.photo;
      }
    }

    // 이미지탭(board2)
    const b2MainImg = document.getElementById('b2-main-img-1');
    if(b2MainImg && randomPlayer.photo && typeof _b2UpdateMainDisplay === 'function'){
      _b2UpdateMainDisplay(randomPlayer.name);
    }
  }
}

// 현재 탭 추적
let currentTab = 'total';

// 탭 변경 시 회전 제어
const originalSw = window.sw;
window.sw = function(tab, el){
  currentTab = tab;
  if(originalSw) originalSw(tab, el);

  const imgSettings = JSON.parse(localStorage.getItem('su_img_settings')||'{}');
  if(imgSettings.randomRotation){
    startRandomRotation();
  } else {
    stopRandomRotation();
  }
};

function bulkChangeTier(){
  if(!isLoggedIn) return;
  const fromTier=document.getElementById('bulk-tier-from')?.value||'';
  const toTier=document.getElementById('bulk-tier-to')?.value||'';
  const targetUniv=document.getElementById('bulk-tier-univ')?.value||'';
  if(!toTier){alert('변경할 티어를 선택하세요.');return;}
  const targets=players.filter(p=>{
    if(fromTier && (p.tier||'미정')!==fromTier) return false;
    if(targetUniv && p.univ!==targetUniv) return false;
    return true;
  });
  if(!targets.length){alert('해당하는 선수가 없습니다.');return;}
  if(!confirm(`${targets.length}명의 티어를 '${toTier}'으로 변경할까요?\n\n${targets.slice(0,5).map(p=>p.name).join(', ')}${targets.length>5?` 외 ${targets.length-5}명`:''}`)) return;
  targets.forEach(p=>{ p.tier=toTier; });
  save(); render();
  const el=document.getElementById('bulk-tier-result');
  if(el){ el.textContent=`✅ ${targets.length}명 변경 완료!`; setTimeout(()=>{if(el)el.textContent='';},3000); }
}
