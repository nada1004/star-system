function rTierTourCfg(C,T){
  T.innerText='⚙️ 설정';
  if(!isLoggedIn || isSubAdmin){
    C.innerHTML='<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 20px;text-align:center;gap:16px"><div style="font-size:48px">🔒</div><div style="font-size:var(--fs-lg);font-weight:800;color:var(--text)">총관리자 전용 페이지</div><div style="font-size:var(--fs-base);color:var(--gray-l)">설정 탭은 총관리자만 이용할 수 있습니다.</div>'+(!isLoggedIn?'<button class="btn btn-b" onclick="om(\'loginModal\')">&#128273; 로그인</button>':'')+'</div>';
    return;
  }
  const typeOpts=[{v:'📢',l:'📢 일반 공지'},{v:'🔥',l:'🔥 중요'},{v:'⚠️',l:'⚠️ 경고/주의'},{v:'🎉',l:'🎉 이벤트'}];
  let h=`${_cfgD('notice','📢 공지 관리')}
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
    players.forEach(p=>{if(seen[p.name])dupNames.push(p.name);else seen[p.name]=true;});
    const uniq=[...new Set(dupNames)];
    if(!uniq.length) return '';
    return `<div class="ssec" style="border:2px solid #fca5a5;background:#fff5f5">
      <h4 style="color:#dc2626">⚠️ 동명이인 감지 (${uniq.length}건)</h4>
      <div style="font-size:var(--fs-sm);color:#7f1d1d;margin-bottom:12px">중복 이름이 있으면 승패·기록이 뒤섞입니다. 한 명의 이름을 바꿔 구분하세요.</div>
      ${uniq.map(name=>{
        const dupes=players.map((p,i)=>({p,i})).filter(({p})=>p.name===name);
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
              if(players.find((x,xi)=>x.name===nw&&xi!==${i})){alert('이미 존재하는 이름입니다.');return;}
              editName=players[${i}].name;
              document.getElementById('emBody').innerHTML='';
              const oldN=players[${i}].name;
              players[${i}].name=nw;
              players.forEach(other=>{(other.history||[]).forEach(h=>{if(h.opp===oldN)h.opp=nw;});});
              [miniM,univM,comps,ckM,proM,ttM].forEach(arr=>(arr||[]).forEach(m=>{
                if(m.a===oldN)m.a=nw;if(m.b===oldN)m.b=nw;
                (m.sets||[]).forEach(s=>(s.games||[]).forEach(g=>{if(g.playerA===oldN)g.playerA=nw;if(g.playerB===oldN)g.playerB=nw;}));
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
  })()}
  ${_cfgD('univ','🏛️ 대학 관리')}
    <div style="font-size:var(--fs-caption);color:var(--gray-l);margin:8px 0 10px">👁️ 숨김 처리된 대학은 비로그인 상태에서 현황판에 표시되지 않습니다.</div>`;
  univCfg.forEach((u,i)=>{
    const isHidden = !!u.hidden;
    const isDissolved = !!u.dissolved;
    h+=`<div class="srow" style="background:${isHidden?'var(--surface)':'transparent'};border-radius:8px;padding:4px 6px;margin:-2px -6px;flex-wrap:wrap;gap:4px">
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
  h+=`<div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap;align-items:center">
    <input type="text" id="nu-n" placeholder="새 대학명" style="width:150px">
    <input type="color" id="nu-c" value="#2563eb" style="width:40px;height:34px;padding:2px;border-radius:5px;cursor:pointer;border:1px solid var(--border2)">
    <button class="btn btn-b" onclick="addUniv()">+ 대학 추가</button>
  </div></details>
  ${_cfgD('maps','🗺️ 맵 관리')}<div id="map-list">`;
  maps.forEach((m,i)=>{
    h+=`<div class="srow">
      <span style="font-size:14px">📍</span>
      <input type="text" value="${m}" style="flex:1" onblur="maps[${i}]=this.value;saveCfg();refreshSel()">
      <button class="btn btn-r btn-xs" onclick="delMap(${i})">🗑️ 삭제</button>
    </div>`;
  });
  h+=`</div><div style="margin-top:12px;display:flex;gap:8px">
    <input type="text" id="nm" placeholder="새 맵 이름" style="width:200px" onkeydown="if(event.key==='Enter')addMap()">
    <button class="btn btn-b" onclick="addMap()">+ 맵 추가</button>
  </div></details>
  ${_cfgD('mAlias','⚡ 맵 약자 관리 <span style="font-size:var(--fs-caption);font-weight:400;color:var(--gray-l)">붙여넣기 입력 시 자동 변환</span>')}
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
    <div id="alias-msg" style="font-size:var(--fs-sm);margin-top:6px;min-height:16px"></div>
  </details>
  ${_cfgD('si','🏷️ 스트리머 상태 아이콘 관리')}
    <div style="font-size:var(--fs-sm);color:var(--gray-l);margin-bottom:12px">이름 우측에 표시될 상태 아이콘을 스트리머별로 지정합니다. 현황판·순위표·이미지 저장 모두 반영됩니다.</div>
    <!-- 커스텀 아이콘 추가 (URL/링크) -->
    <div style="padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:8px;margin-bottom:14px">
      <div style="font-size:var(--fs-sm);font-weight:700;color:var(--blue);margin-bottom:10px">🔗 커스텀 아이콘 추가 (URL · 이모지)</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-bottom:10px">
        <input type="text" id="si-url" placeholder="이미지 URL 또는 이모지 입력" style="flex:1;min-width:200px;padding:5px 8px;border:1px solid var(--border2);border-radius:6px;font-size:var(--fs-sm)">
        <input type="text" id="si-label" placeholder="이름 (선택)" style="width:110px;padding:5px 8px;border:1px solid var(--border2);border-radius:6px;font-size:var(--fs-sm)">
        <button class="btn btn-b btn-sm" onclick="var e=document.getElementById('si-url').value.trim(),l=document.getElementById('si-label').value.trim();if(!e){alert('URL 또는 이모지를 입력하세요.');return;}addCustomStatusIcon(l||'커스텀',e);document.getElementById('si-url').value='';document.getElementById('si-label').value='';render()">+ 추가</button>
      </div>
      ${_customStatusIcons.length?`<div style="display:flex;flex-wrap:wrap;gap:6px">${_customStatusIcons.map((c,i)=>`<span style="display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:7px;background:var(--white);border:1.5px solid var(--blue);font-size:14px"><span style="display:inline-flex;align-items:center">${_siRender(c.emoji,'20px')||c.emoji}</span><span style="font-size:var(--fs-caption);color:var(--gray-l);max-width:80px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${c.label||''}</span><button onclick="removeCustomStatusIcon(${i});render()" style="background:none;border:none;color:#dc2626;cursor:pointer;font-size:14px;padding:0;line-height:1;margin-left:2px" title="삭제">×</button></span>`).join('')}</div>`
      :'<div style="font-size:var(--fs-caption);color:var(--gray-l)">추가된 커스텀 아이콘 없음</div>'}
    </div>
    <!-- 기본 아이콘 목록 -->
    <div style="padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:8px;margin-bottom:14px">
      <div style="font-size:var(--fs-sm);font-weight:700;color:var(--blue);margin-bottom:10px">🎭 기본 상태 아이콘</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px">
        ${Object.entries(STATUS_ICON_DEFS).filter(([id])=>id!=='none'&&!id.startsWith('_c')).map(([id,d])=>`<span style="padding:4px 10px;border-radius:7px;background:var(--white);border:1px solid var(--border);font-size:16px" title="${d.label}">${_siRender(d.emoji,'20px')||d.emoji}</span>`).join('')}
      </div>
      <div style="font-size:var(--fs-caption);color:var(--gray-l);margin-top:8px">스트리머 정보 수정 또는 현황판 클릭 팝업에서 아이콘을 설정하세요.</div>
    </div>
    <!-- 스트리머별 아이콘 지정 -->
    <div style="font-size:var(--fs-sm);font-weight:700;color:var(--text2);margin-bottom:8px">스트리머별 상태 아이콘 지정</div>
    <div id="cfg-si-list" style="max-height:320px;overflow-y:auto;border:1px solid var(--border);border-radius:8px">
      <div style="padding:16px;text-align:center;color:var(--gray-l);font-size:var(--fs-sm)">로딩 중...</div>
    </div>
    <button class="btn btn-r btn-sm" style="margin-top:10px" onclick="if(confirm('모든 상태 아이콘을 초기화할까요?')){playerStatusIcons={};playerStatusExpiry={};if(typeof _iconPersistState==='function')_iconPersistState();render();}">전체 초기화</button>
  </details>
  ${_cfgD('tier','🎭 티어 관리')}
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
    <div style="font-size:var(--fs-caption);color:var(--gray-l);margin-top:6px">※ 기본 티어(G/K/JA/J/S/0티어)는 삭제할 수 없습니다.</div>
  </details>
  ${_cfgD('acct','👤 관리자 계정 관리')}
    <div style="font-size:var(--fs-sm);color:var(--gray-l);margin-bottom:4px">• <b>총관리자</b>: 모든 기능 + 설정 접근 가능</div>
    <div style="font-size:var(--fs-sm);color:var(--gray-l);margin-bottom:14px">• <b>부관리자</b>: 경기 기록 입력만 가능 (설정/회원관리 불가)</div>
    <div style="margin-bottom:14px;padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:8px">
      <div style="font-size:var(--fs-sm);font-weight:700;color:var(--blue);margin-bottom:10px">등록된 계정 (<span id="adm-count">-</span>명)</div>
      <div id="adm-list"></div>
      <button class="btn btn-r btn-xs" style="margin-top:10px" onclick="clearAllAdmins()">⚠️ 전체 초기화 (기본값 리셋)</button>
    </div>
    <div style="font-size:var(--fs-sm);font-weight:700;color:var(--text2);margin-bottom:8px">+ 새 계정 추가</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:8px">
      <input type="text" id="adm-id" placeholder="아이디" style="width:140px" autocomplete="off">
      <input type="password" id="adm-pw" placeholder="비밀번호 (8자 이상)" style="width:150px" autocomplete="new-password">
      <select id="adm-role" style="border:1px solid var(--border2);border-radius:7px;padding:5px 8px;font-size:var(--fs-base)">
        <option value="admin">👑 총관리자</option>
        <option value="sub-admin">🔰 부관리자</option>
      </select>
      <button class="btn btn-p" onclick="addAdminAccount()">+ 추가</button>
    </div>
    <div id="adm-msg" style="font-size:var(--fs-sm);min-height:18px"></div>
  </details>
  <div class="ssec">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
      <h4 style="margin:0">💾 로컬 저장소 사용량</h4>
      <button id="cfg-storage-toggle2" class="btn btn-w btn-xs" onclick="(function(){const c=document.getElementById('cfg-storage-wrap2');const btn=document.getElementById('cfg-storage-toggle2');if(c.style.display==='none'){c.style.display='';btn.textContent='▲ 접기';renderStorageInfo();}else{c.style.display='none';btn.textContent='▼ 펼치기';}})()">▼ 펼치기</button>
    </div>
    <div id="cfg-storage-wrap2" style="display:none">
      <div id="cfg-storage-info"><div style="color:var(--gray-l);font-size:var(--fs-sm)">계산 중...</div></div>
      <button class="btn btn-w btn-sm" style="margin-top:8px" onclick="renderStorageInfo()">🔄 새로고침</button>
    </div>
  </div>
  <div class="ssec">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;gap:8px;flex-wrap:wrap">
      <h4 style="margin:0">☁️ 동기화 관리</h4>
      <button class="btn btn-w btn-xs" onclick="openUnifiedSyncSettings()">설정탭에서 열기 ↗</button>
    </div>
    <div style="padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r)">
      <div style="font-size:var(--fs-sm);font-weight:900;color:var(--text2);margin-bottom:6px">동기화 설정은 한 곳에서만 관리됩니다.</div>
      <div style="font-size:var(--fs-caption);color:var(--gray-l);line-height:1.6;margin-bottom:10px">
        실제 데이터 원본은 GitHub에 저장되고, 보조 신호 채널은 다른 기기에 새 데이터 알림을 더 빠르게 전달합니다.<br>
        비밀번호, 토큰, 누락 월 다시받기, 전체 다시 동기화는 설정탭 <b>☁️ GitHub 동기화</b> 섹션에서만 관리합니다.
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-b btn-sm" onclick="openUnifiedSyncSettings()">☁️ 동기화 설정 열기</button>
        <button class="btn btn-w btn-sm" onclick="(async()=>{try{if(typeof window.fbForceSync==='function') await window.fbForceSync();}catch(e){console.error(e);}})()">🔄 지금 동기화</button>
      </div>
    </div>
  </div>
  ${_cfgD('season','🏆 시즌 관리','id="cfg-season-sec"')}
    <p style="font-size:var(--fs-sm);color:var(--gray-l);margin-bottom:12px">시즌을 정의하면 대전기록·통계 등 모든 탭에서 시즌 단위로 필터링할 수 있습니다.</p>
    <div id="cfg-season-list" style="margin-bottom:12px"></div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:flex-end;padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:8px">
      <div>
        <label style="font-size:var(--fs-caption);font-weight:700;color:var(--text3);display:block;margin-bottom:4px">시즌 이름</label>
        <input type="text" id="cfg-season-name" placeholder="예: 2025 스프링" style="width:140px;font-size:var(--fs-sm)">
      </div>
      <div>
        <label style="font-size:var(--fs-caption);font-weight:700;color:var(--text3);display:block;margin-bottom:4px">시작일</label>
        <input type="date" id="cfg-season-from" style="font-size:var(--fs-sm)">
      </div>
      <div>
        <label style="font-size:var(--fs-caption);font-weight:700;color:var(--text3);display:block;margin-bottom:4px">종료일</label>
        <input type="date" id="cfg-season-to" style="font-size:var(--fs-sm)">
      </div>
      <button class="btn btn-b btn-sm" onclick="addSeason()">+ 시즌 추가</button>
    </div>
  </details>
    <div class="ssec">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
      <h4 style="margin:0">📅 날짜 일괄 변경</h4>
      <button id="cfg-bulk-date-toggle" class="btn btn-w btn-xs" onclick="(function(){const c=document.getElementById('cfg-bulk-date-body');const btn=document.getElementById('cfg-bulk-date-toggle');if(c.style.display==='none'){c.style.display='';btn.textContent='▲ 접기';}else{c.style.display='none';btn.textContent='▼ 펼치기';}})()">▼ 펼치기</button>
    </div>
    <div id="cfg-bulk-date-body" style="display:none">
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r)">
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:8px">
        <label style="font-size:var(--fs-sm);font-weight:600;color:var(--text2)">변경 전 날짜</label>
        <input type="date" id="bulk-date-from" style="font-size:var(--fs-sm)">
        <label style="font-size:var(--fs-sm);font-weight:600;color:var(--text2)">→ 변경 후</label>
        <input type="date" id="bulk-date-to" style="font-size:var(--fs-sm)">
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">
        <label style="font-size:var(--fs-caption);font-weight:600;color:var(--text3)">대상:</label>
        ${['mini','univm','ck','pro','tt','ind','gj','comp'].map(m=>`
        <label style="display:inline-flex;align-items:center;gap:3px;font-size:var(--fs-caption);cursor:pointer">
          <input type="checkbox" id="bulk-date-chk-${m}" checked style="cursor:pointer">
          ${{ mini:'미니대전', univm:'대학대전', ck:'CK', pro:'프로리그', tt:'티어대회', ind:'개인전', gj:'끝장전', comp:'대회' }[m]}
        </label>`).join('')}
      </div>
      <button class="btn btn-b btn-sm" onclick="bulkChangeDate()">📅 날짜 일괄 변경</button>
      <span id="bulk-date-result" style="font-size:var(--fs-sm);margin-left:8px;color:var(--green)"></span>
    </div>
    </div>
  </div>
  <div class="ssec">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
      <h4 style="margin:0">🗺️ 맵 이름 일괄 교체</h4>
      <button id="cfg-bulk-map-toggle" class="btn btn-w btn-xs" onclick="(function(){const c=document.getElementById('cfg-bulk-map-body');const btn=document.getElementById('cfg-bulk-map-toggle');if(c.style.display==='none'){c.style.display='';btn.textContent='▲ 접기';}else{c.style.display='none';btn.textContent='▼ 펼치기';}})()">▼ 펼치기</button>
    </div>
    <div id="cfg-bulk-map-body" style="display:none">
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r)">
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:8px">
        <label style="font-size:var(--fs-sm);font-weight:600;color:var(--text2)">교체 전</label>
        <input type="text" id="bulk-map-from" placeholder="예: 투혼II" style="font-size:var(--fs-sm);width:120px">
        <label style="font-size:var(--fs-sm);font-weight:600;color:var(--text2)">→ 교체 후</label>
        <input type="text" id="bulk-map-to" placeholder="예: 투혼" style="font-size:var(--fs-sm);width:120px">
      </div>
      <button class="btn btn-b btn-sm" onclick="bulkChangeMap()">🗺️ 맵 일괄 교체</button>
      <span id="bulk-map-result" style="font-size:var(--fs-sm);margin-left:8px;color:var(--green)"></span>
    </div>
    </div>
  </div>
  <div class="ssec">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
      <h4 style="margin:0">🎖️ 선수 일괄 티어 변경</h4>
      <button id="cfg-bulk-tier-toggle" class="btn btn-w btn-xs" onclick="(function(){const c=document.getElementById('cfg-bulk-tier-body');const btn=document.getElementById('cfg-bulk-tier-toggle');if(c.style.display==='none'){c.style.display='';btn.textContent='▲ 접기';}else{c.style.display='none';btn.textContent='▼ 펼치기';}})()">▼ 펼치기</button>
    </div>
    <div id="cfg-bulk-tier-body" style="display:none">
    <div style="padding:14px;background:#f0f9ff;border:1px solid #bae6fd;border-radius:var(--r)">
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:8px">
        <label style="font-size:var(--fs-sm);font-weight:600;color:var(--text2)">현재 티어</label>
        <select id="bulk-tier-from" style="font-size:var(--fs-sm);padding:3px 8px;border-radius:6px;border:1px solid var(--border2)">
          <option value="">전체 (상관없음)</option>
          ${TIERS.map(t=>`<option value="${t}">${getTierLabel(t)||t}</option>`).join('')}
          <option value="미정">미정</option>
        </select>
        <label style="font-size:var(--fs-sm);font-weight:600;color:var(--text2)">→ 변경할 티어</label>
        <select id="bulk-tier-to" style="font-size:var(--fs-sm);padding:3px 8px;border-radius:6px;border:1px solid var(--border2)">
          <option value="">선택</option>
          ${TIERS.map(t=>`<option value="${t}">${getTierLabel(t)||t}</option>`).join('')}
          <option value="미정">미정</option>
        </select>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:8px">
        <label style="font-size:var(--fs-sm);font-weight:600;color:var(--text2)">대상 대학</label>
        <select id="bulk-tier-univ" style="font-size:var(--fs-sm);padding:3px 8px;border-radius:6px;border:1px solid var(--border2)">
          <option value="">전체 대학</option>
          ${getAllUnivs().map(u=>`<option value="${u.name}">${u.name}</option>`).join('')}
        </select>
      </div>
      <button class="btn btn-b btn-sm" onclick="bulkChangeTier()">🎖️ 티어 일괄 변경</button>
      <span id="bulk-tier-result" style="font-size:var(--fs-sm);margin-left:8px;color:var(--blue)"></span>
    </div>
    </div>
  </div>
  <div class="ssec">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
      <h4 style="margin:0">🗑️ 날짜 범위 일괄 삭제</h4>
      <button id="cfg-bulk-del-toggle" class="btn btn-w btn-xs" onclick="(function(){const c=document.getElementById('cfg-bulk-del-body');const btn=document.getElementById('cfg-bulk-del-toggle');if(c.style.display==='none'){c.style.display='';btn.textContent='▲ 접기';}else{c.style.display='none';btn.textContent='▼ 펼치기';}})()">▼ 펼치기</button>
    </div>
    <div id="cfg-bulk-del-body" style="display:none">
    <div style="padding:14px;background:#fff5f5;border:1px solid #fca5a5;border-radius:var(--r)">
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:8px">
        <label style="font-size:var(--fs-sm);font-weight:600;color:var(--text2)">시작일</label>
        <input type="date" id="bulk-del-from" style="font-size:var(--fs-sm)">
        <label style="font-size:var(--fs-sm);font-weight:600;color:var(--text2)">~</label>
        <input type="date" id="bulk-del-to" style="font-size:var(--fs-sm)">
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">
        <label style="font-size:var(--fs-caption);font-weight:600;color:var(--text3)">대상:</label>
        ${['mini','univm','ck','pro','tt','ind','gj','comp'].map(m=>`
        <label style="display:inline-flex;align-items:center;gap:3px;font-size:var(--fs-caption);cursor:pointer">
          <input type="checkbox" id="bulk-del-chk-${m}" style="cursor:pointer">
          ${{ mini:'미니대전', univm:'대학대전', ck:'CK', pro:'프로리그', tt:'티어대회', ind:'개인전', gj:'끝장전', comp:'대회' }[m]}
        </label>`).join('')}
      </div>
      <button class="btn btn-r btn-sm" onclick="bulkDeleteByDate()">🗑️ 범위 삭제 (되돌릴 수 없음)</button>
      <span id="bulk-del-result" style="font-size:var(--fs-sm);margin-left:8px;color:var(--red)"></span>
    </div>
    </div>
  </div>
  <div class="ssec">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
      <h4 style="margin:0">🔄 세트제 → 게임수 합산 일괄 변환</h4>
      <button id="cfg-bulk-conv-toggle" class="btn btn-w btn-xs" onclick="(function(){const c=document.getElementById('cfg-bulk-conv-body');const btn=document.getElementById('cfg-bulk-conv-toggle');if(c.style.display==='none'){c.style.display='';btn.textContent='▲ 접기';}else{c.style.display='none';btn.textContent='▼ 펼치기';}})()">▼ 펼치기</button>
    </div>
    <div id="cfg-bulk-conv-body" style="display:none">
    <div style="padding:14px;background:#fefce8;border:1px solid #fde68a;border-radius:var(--r)">
      <div style="font-size:var(--fs-caption);color:var(--text3);margin-bottom:10px">sets 배열의 게임 수 합산으로 sa/sb를 재계산합니다.<br>세트 수와 게임 수가 다른 경기만 변환됩니다.</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">
        <label style="font-size:var(--fs-caption);font-weight:600;color:var(--text3)">대상:</label>
        ${['mini','univm','ck','pro','tt'].map(m=>`
        <label style="display:inline-flex;align-items:center;gap:3px;font-size:var(--fs-caption);cursor:pointer">
          <input type="checkbox" id="bulk-conv-chk-${m}" checked style="cursor:pointer">
          ${{ mini:'미니대전', univm:'대학대전', ck:'CK', pro:'프로리그', tt:'티어대회' }[m]}
        </label>`).join('')}
      </div>
      <button class="btn btn-b btn-sm" onclick="bulkConvertToGameScore()">🔄 게임수 합산으로 변환</button>
      <span id="bulk-conv-result" style="font-size:var(--fs-sm);margin-left:8px;color:var(--blue)"></span>
    </div>
    </div>
  </div>
  <div class="ssec">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
      <h4 style="margin:0">🖼️ 현황판 라벨 배경 이미지별 설정</h4>
      <button id="cfg-board-bg-toggle" class="btn btn-w btn-xs" onclick="(function(){const c=document.getElementById('cfg-board-bg-body');const btn=document.getElementById('cfg-board-bg-toggle');if(c.style.display==='none'){c.style.display='';btn.textContent='▲ 접기';}else{c.style.display='none';btn.textContent='▼ 펼치기';}})()">▼ 펼치기</button>
    </div>
    <div id="cfg-board-bg-body" style="display:none">
    <p style="font-size:var(--fs-sm);color:var(--gray-l);margin-bottom:12px">각 대학 라벨에 배경 이미지를 설정할 수 있습니다. 이미지 위치와 크기도 조절 가능합니다.</p>
    <div style="margin-bottom:14px;padding:14px;background:#f0f9ff;border:1px solid #bae6fd;border-radius:var(--r)">
      <div style="font-size:var(--fs-sm);font-weight:700;color:#0369a1;margin-bottom:10px">📋 일괄 설정 (전체 대학)</div>
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:8px;flex-wrap:wrap">
        <label style="font-size:var(--fs-sm);font-weight:600;color:var(--text2)">이미지 URL:</label>
        <input type="text" id="bulk-bg-img-url" placeholder="https://..." style="flex:1;min-width:200px;padding:5px 8px;border:1px solid var(--border2);border-radius:6px;font-size:var(--fs-sm)">
      </div>
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:8px;flex-wrap:wrap">
        <label style="font-size:var(--fs-sm);font-weight:600;color:var(--text2)">위치:</label>
        <select id="bulk-bg-img-pos" style="padding:4px 8px;border:1px solid var(--border2);border-radius:6px;font-size:var(--fs-sm)">
          <option value="top left">좌상단</option>
          <option value="top center">중상단</option>
          <option value="top right">우상단</option>
          <option value="center left">좌중앙</option>
          <option value="center center" selected>중앙</option>
          <option value="center right">우중앙</option>
          <option value="bottom left">좌하단</option>
          <option value="bottom center">중하단</option>
          <option value="bottom right">우하단</option>
        </select>
        <label style="font-size:var(--fs-sm);font-weight:600;color:var(--text2)">크기:</label>
        <select id="bulk-bg-img-size" style="padding:4px 8px;border:1px solid var(--border2);border-radius:6px;font-size:var(--fs-sm)">
          <option value="cover" selected>채우기 (cover)</option>
          <option value="contain">맞춤 (contain)</option>
          <option value="fill">늘리기 (fill)</option>
        </select>
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:8px">
        <button class="btn btn-b btn-sm" onclick="bulkSetBoardBgImg()">📋 전체 적용</button>
        <button class="btn btn-r btn-sm" onclick="bulkClearBoardBgImg()">🗑️ 전체 삭제</button>
      </div>
    </div>
    <div id="cfg-board-bg-list" style="max-height:400px;overflow-y:auto"></div>
    </div>
  </div>
  ${_cfgD('sync','🔄 데이터 동기화')}
    <div style="font-size:var(--fs-sm);color:var(--gray-l);margin-bottom:10px">경기 기록을 각 탭 기록 및 스트리머 최근 경기에 반영합니다.</div>
    <div style="display:flex;flex-direction:column;gap:10px;padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r)">
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <button class="btn btn-b btn-sm" onclick="
          _ttMigrated=false;_migrateTierTourneys();
          const n=syncAllHistory?syncAllHistory():0;
          alert('✅ 티어대회 기록 동기화 + '+n+'건 스트리머 반영 완료');render();">🔄 전체 동기화 (기록탭 + 스트리머)</button>
        <span style="font-size:var(--fs-caption);color:var(--gray-l)">티어대회 기록탭·대전기록 반영 + 스트리머 최근 경기 소급 반영</span>
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <button class="btn btn-p btn-sm" onclick="
          _ttMigrated=false;_migrateTierTourneys();
          const before=ttM.length;save();render();
          alert('✅ 티어대회 기록 동기화 완료\\n추가된 기록: '+(ttM.length-before)+'건');">🎯 티어대회 기록 동기화</button>
        <span style="font-size:var(--fs-caption);color:var(--gray-l)">조별리그·토너먼트 경기를 기록탭·대전기록에 반영 (누락 시 사용)</span>
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <button class="btn btn-b btn-sm" onclick="syncAllHistoryBtn()">📋 스트리머 최근 경기 반영</button>
        <span style="font-size:var(--fs-caption);color:var(--gray-l)">모든 경기를 스트리머 상세의 최근 경기에 소급 반영</span>
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <button class="btn btn-w btn-sm" onclick="
          const seen=new Set();let removed=0;
          ttM=ttM.filter(m=>{if(!m._id)return true;if(seen.has(m._id)){removed++;return false;}seen.add(m._id);return true;});
          save();render();alert('✅ ttM 중복 제거 완료: '+removed+'건 삭제');
        ">🗑️ 중복 경기 제거</button>
        <span style="font-size:var(--fs-caption);color:var(--gray-l)">같은 _id로 이중 등록된 티어대회 경기 제거</span>
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <button class="btn btn-y btn-sm" onclick="deduplicatePlayerHistory()">🧹 중복 기록 제거</button>
        <span style="font-size:var(--fs-caption);color:var(--gray-l)">스트리머 history에서 중복 항목만 제거 (승패/ELO 재계산)</span>
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <button class="btn btn-r btn-sm" onclick="rebuildAllPlayerHistory()">🔄 전체 경기 기록 복구</button>
        <span style="font-size:var(--fs-caption);color:var(--gray-l)">대전 데이터에서 스트리머 history 재구성 (기존 history 초기화됨)</span>
      </div>
    </div>
  </details>
  ${_cfgD('b2layout','📐 이미지탭 레이아웃')}
    <div style="font-size:var(--fs-sm);color:var(--gray-l);margin-bottom:10px">이미지탭(프로필 탭)의 좌우 비율과 높이를 설정합니다. 저장 즉시 반영됩니다.</div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r);display:flex;flex-direction:column;gap:14px">
      <div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
          <label style="font-size:var(--fs-sm);font-weight:700;color:var(--text2)">좌측(이미지) 너비</label>
          <span id="cfg-b2-left-size-val" style="font-size:var(--fs-sm);font-weight:700;color:var(--blue)">55%</span>
        </div>
        <input type="range" id="cfg-b2-left-size" min="30" max="70" step="1" value="55" style="width:100%;accent-color:var(--blue)"
          oninput="this.value=Math.min(70,Math.max(30,this.value));document.getElementById('cfg-b2-left-size-val').textContent=this.value+'%';document.getElementById('cfg-b2-right-size').value=100-parseInt(this.value);document.getElementById('cfg-b2-right-size-val').textContent=(100-parseInt(this.value))+'%'">
        <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--gray-l);margin-top:2px"><span>30%</span><span>70%</span></div>
      </div>
      <div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
          <label style="font-size:var(--fs-sm);font-weight:700;color:var(--text2)">우측(목록) 너비</label>
          <span id="cfg-b2-right-size-val" style="font-size:var(--fs-sm);font-weight:700;color:var(--blue)">45%</span>
        </div>
        <input type="range" id="cfg-b2-right-size" min="30" max="70" step="1" value="45" style="width:100%;accent-color:var(--blue)"
          oninput="this.value=Math.min(70,Math.max(30,this.value));document.getElementById('cfg-b2-right-size-val').textContent=this.value+'%';document.getElementById('cfg-b2-left-size').value=100-parseInt(this.value);document.getElementById('cfg-b2-left-size-val').textContent=(100-parseInt(this.value))+'%'">
        <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--gray-l);margin-top:2px"><span>30%</span><span>70%</span></div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <div>
          <label style="font-size:var(--fs-sm);font-weight:700;color:var(--text2);display:block;margin-bottom:4px">PC 높이 <span style="font-weight:400;color:var(--gray-l)">(px)</span></label>
          <input type="number" id="cfg-b2-pc-height" value="600" min="400" max="900" step="20" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:var(--fs-base);font-weight:700">
        </div>
        <div>
          <label style="font-size:var(--fs-sm);font-weight:700;color:var(--text2);display:block;margin-bottom:4px">태블릿 높이 <span style="font-weight:400;color:var(--gray-l)">(px)</span></label>
          <input type="number" id="cfg-b2-tablet-height" value="400" min="300" max="700" step="20" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:var(--fs-base);font-weight:700">
        </div>
        <div>
          <label style="font-size:var(--fs-sm);font-weight:700;color:var(--text2);display:block;margin-bottom:4px">모바일 높이 <span style="font-weight:400;color:var(--gray-l)">(px)</span></label>
          <input type="number" id="cfg-b2-mobile-height" value="320" min="200" max="600" step="20" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:var(--fs-base);font-weight:700">
        </div>
        <div style="display:flex;align-items:flex-end;padding-bottom:4px">
          <label style="display:flex;align-items:center;gap:6px;font-size:var(--fs-sm);cursor:pointer;font-weight:700">
            <input type="checkbox" id="cfg-b2-auto-resize" checked style="width:15px;height:15px"> 자동 크기 조절
          </label>
        </div>
      </div>
      <button class="btn btn-b" onclick="saveB2LayoutSettings()" style="align-self:flex-start">💾 레이아웃 저장</button>
    </div>
  </details>
  ${_cfgD('imgsettings','🖼️ 이미지탭 이미지 설정')}
    <div style="font-size:var(--fs-sm);color:var(--gray-l);margin-bottom:10px">이미지탭 ⚙️ 버튼과 동일한 설정입니다. 크기·밝기·배치·위치를 조절하면 즉시 반영됩니다.</div>
    <div id="cfg-b2-img-settings-wrap" style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r)">
      <div style="font-size:var(--fs-sm);color:var(--gray-l)">로딩 중...</div>
    </div>
    <div style="font-size:var(--fs-caption);color:var(--gray-l);margin-top:6px;padding:0 2px">※ 스트리머 상세 모달 이미지 설정은 아래 별도 항목에서 설정</div>
  </details>
  ${_cfgD('imgmodalsettings','🖼️ 스트리머 상세 이미지 설정')}
    <div style="font-size:var(--fs-sm);color:var(--gray-l);margin-bottom:10px">스트리머 상세 모달의 이미지 크기·밝기를 설정합니다.</div>
    <div style="font-size:var(--fs-caption);color:var(--gray-l);margin-bottom:8px">모바일/태블릿/PC 크기를 따로 저장합니다.</div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r);display:flex;flex-direction:column;gap:12px">
      <label style="display:flex;align-items:center;gap:6px;font-size:var(--fs-sm);cursor:pointer;font-weight:600">
        <input type="checkbox" id="cfg-img-fill" style="width:14px;height:14px"> 이미지 채우기 (cover) — 해제 시 맞춤 (contain)
      </label>
      <div>
        <div style="display:flex;justify-content:space-between;margin-bottom:4px">
          <label style="font-size:var(--fs-sm);font-weight:700;color:var(--text2)">기본 크기</label>
          <span id="cfg-img-scale-val" style="font-size:var(--fs-sm);font-weight:700;color:var(--blue)">1.0x</span>
        </div>
        <input type="range" id="cfg-img-scale" min="0.5" max="2" step="0.1" value="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-img-scale-val').textContent=parseFloat(this.value).toFixed(1)+'x'">
        <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--gray-l);margin-top:2px"><span>0.5x</span><span>2.0x</span></div>
      </div>
      <div>
        <div style="display:flex;justify-content:space-between;margin-bottom:4px">
          <label style="font-size:var(--fs-sm);font-weight:700;color:var(--text2)">기본 밝기</label>
          <span id="cfg-img-brightness-val" style="font-size:var(--fs-sm);font-weight:700;color:var(--blue)">1.0x</span>
        </div>
        <input type="range" id="cfg-img-brightness" min="0.3" max="2" step="0.1" value="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-img-brightness-val').textContent=parseFloat(this.value).toFixed(1)+'x'">
        <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--gray-l);margin-top:2px"><span>0.3x</span><span>2.0x</span></div>
      </div>
      <div>
        <div style="display:flex;justify-content:space-between;margin-bottom:4px">
          <label style="font-size:var(--fs-sm);font-weight:700;color:var(--text2)">모바일 크기</label>
          <span id="cfg-img-scale-left-val" style="font-size:var(--fs-sm);font-weight:700;color:var(--blue)">1.0x</span>
        </div>
        <input type="range" id="cfg-img-scale-left" min="0.5" max="2" step="0.1" value="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-img-scale-left-val').textContent=parseFloat(this.value).toFixed(1)+'x'">
      </div>
      <div>
        <div style="display:flex;justify-content:space-between;margin-bottom:4px">
          <label style="font-size:var(--fs-sm);font-weight:700;color:var(--text2)">태블릿 크기</label>
          <span id="cfg-img-scale-tablet-val" style="font-size:var(--fs-sm);font-weight:700;color:var(--blue)">1.0x</span>
        </div>
        <input type="range" id="cfg-img-scale-tablet" min="0.5" max="2" step="0.1" value="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-img-scale-tablet-val').textContent=parseFloat(this.value).toFixed(1)+'x'">
      </div>
      <div>
        <div style="display:flex;justify-content:space-between;margin-bottom:4px">
          <label style="font-size:var(--fs-sm);font-weight:700;color:var(--text2)">PC 크기</label>
          <span id="cfg-img-scale-right-val" style="font-size:var(--fs-sm);font-weight:700;color:var(--blue)">1.0x</span>
        </div>
        <input type="range" id="cfg-img-scale-right" min="0.5" max="2" step="0.1" value="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-img-scale-right-val').textContent=parseFloat(this.value).toFixed(1)+'x'">
      </div>
      <button class="btn btn-b" onclick="saveImageSettings()" style="align-self:flex-start">💾 설정 저장</button>
    </div>
  </details>
  <div class="ssec">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
      <h4 style="margin:0">🎨 스트리머 상세 스타일 설정</h4>
      <button id="cfg-pd-toggle" class="btn btn-w btn-xs" onclick="(function(){const c=document.getElementById('cfg-pd-body');const btn=document.getElementById('cfg-pd-toggle');if(c.style.display==='none'){c.style.display='';btn.textContent='▲ 접기';_renderCfgPdSection();}else{c.style.display='none';btn.textContent='▼ 펼치기';}})()">▼ 펼치기</button>
    </div>
    <div id="cfg-pd-body" style="display:none"></div>
  </div>
  ${_cfgD('fab','🔘 FAB 버튼 탭 설정')}
    <div style="font-size:var(--fs-sm);color:var(--gray-l);margin-bottom:14px">하단 FAB 버튼 클릭 시 이동할 탭을 설정합니다.</div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r)">
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px">
        <label style="font-size:var(--fs-sm);font-weight:600;color:var(--text2);min-width:80px">캘린더:</label>
        <select id="cfg-fab-cal" style="flex:1;max-width:200px;padding:5px 8px;border:1px solid var(--border2);border-radius:6px;font-size:var(--fs-sm)">
          <option value="cal">📅 캘린더</option>
          <option value="stats">📊 통계</option>
          <option value="roulette">🎰 룰렛/게임</option>
        </select>
      </div>
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px">
        <label style="font-size:var(--fs-sm);font-weight:600;color:var(--text2);min-width:80px">대회:</label>
        <select id="cfg-fab-comp" style="flex:1;max-width:200px;padding:5px 8px;border:1px solid var(--border2);border-radius:6px;font-size:var(--fs-sm)">
          <option value="comp">🏆 대회</option>
          <option value="pro">🏅 프로리그</option>
          <option value="stats">📊 통계</option>
        </select>
      </div>
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px">
        <label style="font-size:var(--fs-sm);font-weight:600;color:var(--text2);min-width:80px">대학대전:</label>
        <select id="cfg-fab-univm" style="flex:1;max-width:200px;padding:5px 8px;border:1px solid var(--border2);border-radius:6px;font-size:var(--fs-sm)">
          <option value="univm">🏫 대학대전</option>
          <option value="ck">🏆 CK</option>
          <option value="stats">📊 통계</option>
        </select>
      </div>
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px">
        <label style="font-size:var(--fs-sm);font-weight:600;color:var(--text2);min-width:80px">개인전:</label>
        <select id="cfg-fab-ind" style="flex:1;max-width:200px;padding:5px 8px;border:1px solid var(--border2);border-radius:6px;font-size:var(--fs-sm)">
          <option value="ind">👤 개인전</option>
          <option value="gj">⚔️ 끝장전</option>
          <option value="stats">📊 통계</option>
        </select>
      </div>
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px">
        <label style="font-size:var(--fs-sm);font-weight:600;color:var(--text2);min-width:80px">프로리그:</label>
        <select id="cfg-fab-pro" style="flex:1;max-width:200px;padding:5px 8px;border:1px solid var(--border2);border-radius:6px;font-size:var(--fs-sm)">
          <option value="pro">🏅 프로리그</option>
          <option value="comp">🏆 대회</option>
          <option value="stats">📊 통계</option>
        </select>
      </div>
    </div>
    <div style="margin-top:16px;padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r)">
      <div style="font-size:var(--fs-sm);font-weight:700;color:var(--text2);margin-bottom:10px">FAB 버튼 표시 설정</div>
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:8px">
        <label style="display:flex;align-items:center;gap:6px;font-size:var(--fs-sm);cursor:pointer">
          <input type="checkbox" id="cfg-fab-hide-mobile" onchange="saveFabVisibilitySettings()">
          모바일에서 숨기기
        </label>
      </div>
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:8px">
        <label style="display:flex;align-items:center;gap:6px;font-size:var(--fs-sm);cursor:pointer">
          <input type="checkbox" id="cfg-fab-hide-pc" onchange="saveFabVisibilitySettings()">
          PC에서 숨기기
        </label>
      </div>
    </div>
  </details>
  <div class="ssec">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
      <h4 style="margin:0">🎨 구현황판 카드 배경/라벨 밝기 조절</h4>
      <button id="cfg-old-bright-toggle" class="btn btn-w btn-xs" onclick="(function(){const c=document.getElementById('cfg-old-bright-body');const btn=document.getElementById('cfg-old-bright-toggle');if(c.style.display==='none'){c.style.display='';btn.textContent='▲ 접기';}else{c.style.display='none';btn.textContent='▼ 펼치기';}})()">▼ 펼치기</button>
    </div>
    <div id="cfg-old-bright-body" style="display:none">
    <p style="font-size:var(--fs-sm);color:var(--gray-l);margin-bottom:12px">구현황판 카드의 배경과 라벨 밝기를 조절합니다. (구현황판 툴바에서도 조절 가능)</p>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r)">
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px">
        <label style="font-size:var(--fs-sm);font-weight:600;color:var(--text2);min-width:80px">배경 밝기:</label>
        <input type="range" id="cfg-b2-bg-alpha" min="0" max="30" value="9" style="flex:1;accent-color:var(--blue)" oninput="document.getElementById('cfg-b2-bg-alpha-val').textContent=this.value+'%'">
        <span style="font-size:var(--fs-caption);color:var(--gray-l);min-width:30px;text-align:right;font-weight:700" id="cfg-b2-bg-alpha-val">9%</span>
      </div>
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px">
        <label style="font-size:var(--fs-sm);font-weight:600;color:var(--text2);min-width:80px">라벨 밝기:</label>
        <input type="range" id="cfg-b2-label-alpha" min="0" max="40" value="16" style="flex:1;accent-color:var(--blue)" oninput="document.getElementById('cfg-b2-label-alpha-val').textContent=this.value+'%'">
        <span style="font-size:var(--fs-caption);color:var(--gray-l);min-width:30px;text-align:right;font-weight:700" id="cfg-b2-label-alpha-val">16%</span>
      </div>
      <button class="btn btn-b" onclick="saveOldDashboardBrightness()">💾 저장</button>
    </div>
    </div>
  </div>
  `;

  // 관리자 목록 + 맵 약자 목록 렌더링
  setTimeout(()=>{
    if(typeof _renderCfgSiList==='function') _renderCfgSiList();
    renderStorageInfo();
    renderSeasonList();
    const el=document.getElementById('adm-count');
    const listEl=document.getElementById('adm-list');
    const accounts=getAdminAccounts();
    if(el)el.textContent=accounts.length;
    if(listEl){
      if(!accounts.length){listEl.innerHTML='<div style="font-size:var(--fs-sm);color:var(--gray-l)">등록된 계정 없음</div>';return;}
      listEl.innerHTML=accounts.map((a,i)=>`
        <div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border)">
          <span style="flex:1;font-size:var(--fs-base);font-weight:600">${a.label||'(이름없음)'}</span>
          <span style="padding:2px 9px;border-radius:5px;font-size:10px;font-weight:700;${a.role==='sub-admin'?'background:#fef3c7;color:#92400e;border:1px solid #fde68a':'background:#dbeafe;color:#1e40af;border:1px solid #bfdbfe'}">${a.role==='sub-admin'?'🔰 부관리자':'👑 총관리자'}</span>
          <button class="btn btn-r btn-xs" onclick="deleteAdminAccount(${i})">🗑️ 삭제</button>
        </div>`).join('');
    }
    // 현황판 배경 설정 렌더링
    const bgListEl=document.getElementById('cfg-board-bg-list');
    if(bgListEl){
      bgListEl.innerHTML=univCfg.map((u,i)=>`<div style="border:1px solid var(--border);border-radius:8px;padding:10px 12px;margin-bottom:8px;background:var(--white)">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
          <div class="cdot" style="background:${u.color}"></div>
          <span style="flex:1;font-weight:700;font-size:var(--fs-base)">${u.name}</span>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px">
          <button class="btn btn-xs btn-w" onclick="promptBoardBgImgUrl('${u.name.replace(/'/g,"\\'")}')">URL 설정</button>
          ${u.bgImg?`<button class="btn btn-xs btn-r" onclick="removeBoardBgImg('${u.name.replace(/'/g,"\\'")}')">삭제</button>`:''}
        </div>
        ${u.bgImg?`<div style="margin-top:8px">
          <div style="font-size:var(--fs-caption);font-weight:600;color:var(--text2);margin-bottom:6px">위치</div>
          <select onchange="setBoardBgImgPos('${u.name.replace(/'/g,"\\'")}',this.value)" style="padding:4px 8px;border:1px solid var(--border2);border-radius:6px;font-size:var(--fs-sm)">
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
          <div style="font-size:var(--fs-caption);font-weight:600;color:var(--text2);margin-bottom:6px;margin-top:8px">크기</div>
          <select onchange="setBoardBgImgSize('${u.name.replace(/'/g,"\\'")}',this.value)" style="padding:4px 8px;border:1px solid var(--border2);border-radius:6px;font-size:var(--fs-sm)">
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
    if(_cfgB2ImgWrap&&typeof _b2BuildImageControlGroup==='function'){
      _cfgB2ImgWrap.innerHTML=`
        <div style="font-weight:700;font-size:var(--fs-sm);color:var(--text2);margin-bottom:10px">이미지 1 (기본 이미지)</div>
        ${_b2BuildImageControlGroup('','primary','이미지 1',true)}
        <div style="font-weight:700;font-size:var(--fs-sm);color:var(--text2);margin:14px 0 10px">이미지 2 (두번째 이미지)</div>
        ${_b2BuildImageControlGroup('','secondary','이미지 2',true)}
      `;
    }
    // 스트리머 상세 이미지 설정 초기화
    const imgSettings = (typeof suReadImgSettings==='function')
      ? suReadImgSettings()
      : (JSON.parse(localStorage.getItem('su_img_settings')||'{}'));
    if(document.getElementById('cfg-img-fill'))document.getElementById('cfg-img-fill').checked=imgSettings.fill||false;
    if(document.getElementById('cfg-img-scale')){document.getElementById('cfg-img-scale').value=imgSettings.scale||1;document.getElementById('cfg-img-scale-val').textContent=(imgSettings.scale||1).toFixed(1)+'x';}
    if(document.getElementById('cfg-img-brightness')){document.getElementById('cfg-img-brightness').value=imgSettings.brightness||1;document.getElementById('cfg-img-brightness-val').textContent=(imgSettings.brightness||1).toFixed(1)+'x';}
    if(document.getElementById('cfg-img-scale-left')){document.getElementById('cfg-img-scale-left').value=imgSettings.scaleMb||1;document.getElementById('cfg-img-scale-left-val').textContent=(imgSettings.scaleMb||1).toFixed(1)+'x';}
    if(document.getElementById('cfg-img-scale-tablet')){document.getElementById('cfg-img-scale-tablet').value=imgSettings.scaleTb||1;document.getElementById('cfg-img-scale-tablet-val').textContent=(imgSettings.scaleTb||1).toFixed(1)+'x';}
    if(document.getElementById('cfg-img-scale-right')){document.getElementById('cfg-img-scale-right').value=imgSettings.scalePc||1;document.getElementById('cfg-img-scale-right-val').textContent=(imgSettings.scalePc||1).toFixed(1)+'x';}
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
    ['cfg-img-fill','cfg-img-scale','cfg-img-brightness','cfg-img-scale-left','cfg-img-scale-tablet','cfg-img-scale-right','cfg-img-random','cfg-img-interval'].forEach(id=>{
      const el=document.getElementById(id);
      if(el)el.addEventListener('change',saveImageSettings);
    });
  },50);
  C.innerHTML=h;
  setTimeout(_refreshAliasList, 10);
  setTimeout(function(){
    try{ if(typeof window.initFabTabSettings==='function') window.initFabTabSettings(); }catch(e){}
    try{ if(typeof window.initFabVisibilitySettings==='function') window.initFabVisibilitySettings(); }catch(e){}
  }, 50);
} // end first rCfg

/* ══════════════════════════════════════
   (버그픽스) 설정탭 버튼 누락 함수들
   - settings.js / tier-tour.js UI에서 호출하지만 정의가 없던 함수들을 추가
   - 안전한 범위에서만 일괄 수정/삭제 수행
══════════════════════════════════════ */
function _bulkArrMapAll(){
  // 존재하는 배열만 포함
  const m = { mini:miniM, univm:univM, ck:ckM, pro:proM, tt:ttM, ind: (typeof indM!=='undefined'?indM:[]), gj:(typeof gjM!=='undefined'?gjM:[]), comp:comps };
  return m;
}

// 티어대회(토너먼트 탭)에서 경기 결과 붙여넣기(자동인식) → "토너먼트 기록"으로 저장
// - 대진표 자동 생성/자동 반영은 하지 않음(사용자가 슬롯/승자 수동 입력)
function openTierBktPasteModal(tnId){
  if(!isLoggedIn) return alert('로그인이 필요합니다.');
  const tn=(tourneys||[]).find(t=>t && t.id===tnId) || null;
  if(tn && tn.name) _ttCurComp = tn.name;
  try{ window._pasteFromTierBkt = true; }catch(e){}
  try{ window._pasteFromHistExt = false; }catch(e){}
  try{
    if(typeof openTTPasteModal==='function') openTTPasteModal();
  }catch(e){}
  // 대회명 자동 채우기
  setTimeout(()=>{
    try{
      const inp=document.getElementById('paste-comp-name');
      if(inp && tn && tn.name) inp.value = tn.name;
    }catch(e){}
  }, 40);
}

// (추가) 설정탭 전용: "스트리머별 상태 아이콘 지정"만 보여주는 목록
function _renderCfgSiAssignList(){
  const el=document.getElementById('cfg-si-assign-list');
  if(!el) return;
  if(!players.length){
    el.innerHTML='<div style="padding:20px;text-align:center;color:var(--gray-l)">등록된 선수 없음</div>';
    return;
  }
  const q = String(window._cfgSiAssignQ || '').trim().toLowerCase();
  const iconOptCache = Object.entries(STATUS_ICON_DEFS);
  const match = (p)=>{
    if(!q) return true;
    const hay = `${p.name||''} ${(p.univ||'')} ${(p.tier||'')} ${(p.memo||'')}`.toLowerCase();
    return hay.includes(q);
  };
  const list = [...players].filter(match).sort((a,b)=>a.name.localeCompare(b.name,'ko'));
  el.innerHTML = list.map(p=>{
    const cur = playerStatusIcons[p.name] || '';
    const pN = p.name.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
    const encN=encodeURIComponent(p.name);
    const opts = iconOptCache.map(([id,d])=>`<option value="${id}"${(!cur&&id==='none')||(cur&&(cur===id||cur===d.emoji)&&id!=='none')?' selected':''}>${!_siIsImg(d.emoji)&&d.emoji?d.emoji+' ':''}${d.label}</option>`).join('');
    const clrBtn = cur ? `<button class="btn btn-w btn-xs" style="border-color:var(--border2);color:#dc2626" onclick="setStatusIcon('${pN}','none');_cfgRefreshSiAssignRow('${pN}')">×</button>` : '';
    return `<div style="border-bottom:1px solid var(--border);padding:8px 10px">
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
        <span style="flex-shrink:0">${getPlayerPhotoHTML(p.name,'30px')}</span>
        <span style="font-weight:800;flex:1;min-width:140px">${p.name}<span style="font-size:10px;color:var(--gray-l);margin-left:6px">${p.univ||''}·${p.tier||''}</span></span>
        <span id="cfg-si-assign-prev-${encN}" style="min-width:26px;text-align:center;display:inline-flex;align-items:center;justify-content:center">${cur?(_siIsImg(cur)?_siRender(cur,'22px'):cur):''}</span>
        <select onchange="setStatusIcon('${pN}',this.value);_cfgRefreshSiAssignRow('${pN}')" style="font-size:var(--fs-sm);padding:5px 8px;border:1px solid var(--border2);border-radius:var(--r);min-width:140px">${opts}</select>
        <span id="cfg-si-assign-clr-${encN}">${clrBtn}</span>
      </div>
    </div>`;
  }).join('') || '<div style="padding:18px;text-align:center;color:var(--gray-l);font-size:var(--fs-sm)">검색 결과 없음</div>';
}
function _cfgRefreshSiAssignRow(name){
  const encN=encodeURIComponent(name);
  const cur=playerStatusIcons[name]||'';
  const prevEl=document.getElementById('cfg-si-assign-prev-'+encN);
  if(prevEl) prevEl.innerHTML=cur?(_siIsImg(cur)?_siRender(cur,'22px'):cur):'';
  const clrEl=document.getElementById('cfg-si-assign-clr-'+encN);
  if(clrEl){
    const pN=name.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
    clrEl.innerHTML=cur?`<button class="btn btn-w btn-xs" style="border-color:var(--border2);color:#dc2626" onclick="setStatusIcon('${pN}','none');_cfgRefreshSiAssignRow('${pN}')">×</button>`:'';
  }
}
try{ window._renderCfgSiAssignList = _renderCfgSiAssignList; }catch(e){}

// ── (요청사항) 조편성 관리: 조별 경기 결과 일괄 입력(1줄=1게임) ──
// competition.js(대회/티어대회 조편성)에서 호출
window.openCompLeaguePasteModal = function(tnId, gi){
  if(!isLoggedIn) return alert('로그인이 필요합니다.');
  const tn = (typeof _findTourneyById==='function' ? _findTourneyById(tnId) : null) || (typeof tourneys!=='undefined' ? tourneys.find(t=>t.id===tnId) : null);
  if(!tn || !tn.groups || !tn.groups[gi]) return;
  // 티어대회 조편성 관리용(선수 vs 선수)
  _grpPasteState = {mode:'comp-league', tnId, gi};
  window._grpPasteMode = true;

  // pasteModal 초기화 (openGrpPasteModal과 동일 패턴)
  const textarea  = document.getElementById('paste-input');
  const previewEl = document.getElementById('paste-preview');
  const applyBtn  = document.getElementById('paste-apply-btn');
  const badge     = document.getElementById('paste-summary-badge');
  const pendWarn  = document.getElementById('paste-pending-warn');
  if (textarea)  textarea.value  = '';
  if (previewEl) previewEl.innerHTML = '';
  if (applyBtn)  { applyBtn.style.display = 'none'; applyBtn.textContent = '✅ 조에 저장'; }
  if (badge)     badge.style.display = 'none';
  if (pendWarn)  pendWarn.style.display = 'none';
  window._pasteResults = null;
  window._pasteErrors  = null;

  const dateInput = document.getElementById('paste-date');
  if (dateInput) dateInput.value = new Date().toISOString().slice(0,10);

  const modeSel = document.getElementById('paste-mode');
  if(modeSel){ modeSel.value='comp'; modeSel.style.display='none'; }
  const modeLabel = document.getElementById('paste-mode-label');
  if(modeLabel) modeLabel.style.display='none';
  const hintEl = document.getElementById('paste-mode-hint');
  if(hintEl){
    const GL='ABCDEFGHIJ';
    hintEl.innerHTML = `<div style="background:#eff6ff;border:1px solid #93c5fd;border-radius:8px;padding:8px 12px;margin-bottom:4px">
      <span style="color:#1d4ed8;font-weight:800">🏆 조별리그 일괄 입력</span>
      — <b>${tn.name}</b> · <b>GROUP ${GL[gi]||gi}조</b><br>
      <span style="font-size:var(--fs-caption);color:#6b7280">형식: 날짜 승자 패자 [맵] (여러 줄)</span>
    </div>`;
  }
  const compWrap = document.getElementById('paste-comp-wrap');
  if(compWrap){ compWrap.style.display='none'; compWrap.innerHTML=''; }
  const _pasteDetails=document.querySelector('#pasteModal details');
  if(_pasteDetails) _pasteDetails.style.display='none';

  // 세트/게임 모드 선택은 의미 없으니 숨김
  const _matchModeDiv=document.getElementById('paste-match-mode-game')?.closest('div[style]');
  if(_matchModeDiv) _matchModeDiv.style.display='none';

  const _pTitle=document.querySelector('#pasteModal .mtitle');
  if(_pTitle) _pTitle.textContent='📋 결과 붙여넣기';
  om('pasteModal');
};
function _bulkSelected(keys, prefix, defaultChecked=true){
  return keys.filter(k=>{
    const el=document.getElementById(prefix+k);
    return el ? !!el.checked : defaultChecked;
  });
}
function bulkChangeDate(){
  // (QA 드라이런/호환) 일부 환경은 isLoggedIn이 top-level let 으로 선언되어 window.isLoggedIn과 분리됨
  // - 드라이런은 window.isLoggedIn을 조작하므로 둘 다 허용
  const _li = (typeof isLoggedIn!=='undefined' ? !!isLoggedIn : false) || !!window.isLoggedIn;
  if(!_li) return;
  const from=document.getElementById('bulk-date-from')?.value||'';
  const to=document.getElementById('bulk-date-to')?.value||'';
  if(!from||!to){ alert('변경 전/후 날짜를 입력하세요.'); return; }
  const keys=_bulkSelected(['mini','univm','ck','pro','tt','ind','gj','comp'],'bulk-date-chk-');
  if(!keys.length){ alert('대상을 선택하세요.'); return; }
  const arrMap=_bulkArrMapAll();
  let changed=0;
  keys.forEach(k=>{
    const arr=arrMap[k]||[];
    arr.forEach(m=>{ if(m && m.d===from){ m.d=to; changed++; } });
  });
  if(changed){ save(); render(); }
  const el=document.getElementById('bulk-date-result');
  if(el){ el.textContent = changed?`✅ ${changed}건 변경 완료!`:'변경할 항목이 없습니다.'; setTimeout(()=>{ if(el) el.textContent=''; }, 3500); }
}
function bulkChangeMap(){
  const _li = (typeof isLoggedIn!=='undefined' ? !!isLoggedIn : false) || !!window.isLoggedIn;
  if(!_li){ alert('로그인이 필요합니다.'); return; }
  const from=(document.getElementById('bulk-map-from')?.value||'').trim();
  const to=(document.getElementById('bulk-map-to')?.value||'').trim();
  if(!from||!to){ alert('교체 전/후 맵 이름을 입력하세요.'); return; }
  if(typeof window.bulkReplaceMapEverywhere === 'function'){
    const changed = window.bulkReplaceMapEverywhere(from, to);
    if(changed){ save(); render(); }
    const el=document.getElementById('bulk-map-result');
    if(el){ el.textContent = changed?`✅ ${changed}개 맵명 교체 완료!`:'교체할 항목이 없습니다.'; setTimeout(()=>{ if(el) el.textContent=''; }, 3500); }
    return;
  }
  // (보강) 사용자가 '투혼 II' vs '투혼II' 같이 띄어쓰기 차이로 입력하는 경우가 많아서
  // - 비교는 "공백 제거 + 소문자"로 한 번 더 수행한다.
  const norm = (s)=>String(s||'').trim().toLowerCase().replace(/\s+/g,'');
  const fromN = norm(from);
  const arrMap=_bulkArrMapAll();
  const keys=Object.keys(arrMap); // 맵 교체는 전체 적용
  let changed=0;
  const rep=(obj)=>{
    if(!obj||typeof obj!=='object') return;
    if(typeof obj.map==='string'){
      const cur=obj.map.trim();
      if(cur===from || norm(cur)===fromN){ obj.map=to; changed++; }
    }
    // 세트/게임 내부도 체크
    (obj.sets||[]).forEach(st=>{
      if(typeof st.map==='string'){
        const cur=st.map.trim();
        if(cur===from || norm(cur)===fromN){ st.map=to; changed++; }
      }
      (st.games||[]).forEach(g=>{
        if(typeof g.map==='string'){
          const cur=g.map.trim();
          if(cur===from || norm(cur)===fromN){ g.map=to; changed++; }
        }
      });
    });
  };
  keys.forEach(k=>{ (arrMap[k]||[]).forEach(rep); });
  // 대회(tourneys) 내부의 games(map)도 교체
  (tourneys||[]).forEach(tn=>{
    (tn.groups||[]).forEach(grp=> (grp.matches||[]).forEach(rep));
    const br=tn.bracket||{};
    Object.values(br.matchDetails||{}).forEach(rep);
    (br.manualMatches||[]).forEach(rep);
  });
  // 맵 목록 자체도 교체(선택지 통일)
  try{
    if(Array.isArray(maps)){
      maps = maps.map(m=> ((String(m||'').trim()===from || norm(m)===fromN)?to:m));
    }
  }catch(e){}
  if(changed){ save(); render(); }
  const el=document.getElementById('bulk-map-result');
  if(el){ el.textContent = changed?`✅ ${changed}개 맵명 교체 완료!`:'교체할 항목이 없습니다.'; setTimeout(()=>{ if(el) el.textContent=''; }, 3500); }
}
function previewBulkChangeMap(){
  const _li = (typeof isLoggedIn!=='undefined' ? !!isLoggedIn : false) || !!window.isLoggedIn;
  if(!_li){ alert('로그인이 필요합니다.'); return; }
  const from=(document.getElementById('bulk-map-from')?.value||'').trim();
  if(!from){ alert('교체 전 맵 이름을 입력하세요.'); return; }
  const cnt=(typeof window.bulkCountMapEverywhere==='function') ? window.bulkCountMapEverywhere(from) : 0;
  const el=document.getElementById('bulk-map-result');
  if(el){
    el.textContent = cnt?`🔎 변경 예정 ${cnt}개`:'일치하는 맵이 없습니다.';
    setTimeout(()=>{ if(el && el.textContent.startsWith('🔎')) el.textContent=''; }, 3500);
  }
}
function bulkDeleteByDate(){
  const _li = (typeof isLoggedIn!=='undefined' ? !!isLoggedIn : false) || !!window.isLoggedIn;
  if(!_li) return;
  const from=document.getElementById('bulk-del-from')?.value||'';
  const to=document.getElementById('bulk-del-to')?.value||'';
  if(!from||!to){ alert('시작/종료 날짜를 입력하세요.'); return; }
  if(!confirm(`⚠️ ${from} ~ ${to} 범위의 기록을 삭제합니다. 되돌릴 수 없습니다.\n계속할까요?`)) return;
  const keys=_bulkSelected(['mini','univm','ck','pro','tt','ind','gj','comp'],'bulk-del-chk-', false);
  // bulk-del 체크박스는 기본 미체크라서, element 없으면 false가 자연스러움
  const arrMap=_bulkArrMapAll();
  let removed=0;
  const inRange=(d)=> d && d>=from && d<=to;
  keys.forEach(k=>{
    const arr=arrMap[k]||[];
    const before=arr.length;
    const next=arr.filter(m=> !(m && inRange(m.d)) );
    removed += (before-next.length);
    arrMap[k].length = 0;
    arrMap[k].push(...next);
  });
  if(removed){ save(); render(); }
  const el=document.getElementById('bulk-del-result');
  if(el){ el.textContent = removed?`✅ ${removed}건 삭제 완료!`:'삭제할 항목이 없습니다.'; setTimeout(()=>{ if(el) el.textContent=''; }, 3500); }
}

