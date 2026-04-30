(function(){
  window.SettingsModules = window.SettingsModules || {};

  function escMaybe(v){
    if(typeof window.esc === 'function') return window.esc(v);
    return String(v ?? '').replace(/[&<>"']/g, m => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[m]));
  }

  function renderCfgTabLabelsSection(_scfgD){
    const b2=[
      {id:'femco', d:'🧩 펨코스타일'},
      {id:'univ', d:'🏟️ 대학별 신현황판'},
      {id:'free', d:'🚶 무소속'},
      {id:'players', d:'👤 이미지별'},
      {id:'old', d:'📊 구현황판'}
    ];
    const hist=[
      {id:'all', d:'📋 전체 통합'},
      {id:'psearch', d:'🔍 스트리머별 검색'},
      {id:'race', d:'🧬 종족 승률'},
      {id:'vs', d:'⚔️ 1:1 상대전적'},
      {id:'ind', d:'🎮 개인전'},
      {id:'gj', d:'⚔️ 중장전'},
      {id:'mini', d:'⚡ 미니대전'},
      {id:'ck', d:'🤝 대학CK'},
      {id:'univm', d:'🏟️ 대학대전'},
      {id:'civil', d:'⚔️ 시빌워'},
      {id:'tourney', d:'🎖️ 대회 (토너먼트)'},
      {id:'tiertour', d:'🎯 티어대회'},
      {id:'pro', d:'🏅 일반'},
      {id:'progj', d:'⚔️ 중장전'},
      {id:'procomp', d:'🏆 대회'},
      {id:'procomptn', d:'🗂️ 토너먼트'},
      {id:'procompteam', d:'🤝 팀전'},
      {id:'univstat', d:'🏛️ 대학별 기록'},
      {id:'univrank', d:'🏛️ 대학별 포인트'},
      {id:'univcomp', d:'⚔️ 대학 전력 비교'}
    ];
    const get=(ctx,id,def)=> (typeof getTabLabel==='function') ? getTabLabel(ctx,id,def) : def;
    const row=(ctx,x)=>`
      <div class="srow" style="gap:10px;align-items:center;flex-wrap:wrap">
        <div style="min-width:140px;font-weight:900;color:var(--text2)">${escMaybe(x.d)}</div>
        <div style="font-size:11px;color:var(--gray-l);min-width:92px">id: <code>${escMaybe(x.id)}</code></div>
        <input type="text" value="${escMaybe(get(ctx,x.id,x.d))}" style="flex:1;min-width:220px"
          placeholder="${escMaybe(x.d)}"
          onblur="if(typeof setTabLabel==='function'){setTabLabel('${ctx}','${x.id}',this.value);} try{if(typeof render==='function')render();}catch(e){}">
        <button class="btn btn-w btn-xs" onclick="this.previousElementSibling.value=''; if(typeof setTabLabel==='function'){setTabLabel('${ctx}','${x.id}','');} try{if(typeof render==='function')render();}catch(e){}">초기화</button>
      </div>`;
    return _scfgD('tablabels','🏷️ 탭 이름(라벨) 설정') + `
      <div style="font-size:12px;color:var(--gray-l);margin-bottom:12px;line-height:1.6">
        각 탭/하위탭의 <b>표시 이름(라벨)</b>만 바꿉니다. (내부 데이터 id는 그대로 유지)<br>
        빈칸으로 두면 기본값으로 돌아갑니다.
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:10px">
        <button class="btn btn-w btn-sm" onclick="if(confirm('현황판(탭) 라벨을 모두 초기화할까요?')){ if(typeof resetTabLabels==='function') resetTabLabels('board2'); try{if(typeof render==='function')render();}catch(e){} }">🔄 현황판 라벨 전체 초기화</button>
        <button class="btn btn-w btn-sm" onclick="if(confirm('대전기록(탭) 라벨을 모두 초기화할까요?')){ if(typeof resetTabLabels==='function') resetTabLabels('history'); try{if(typeof render==='function')render();}catch(e){} }">🔄 대전기록 라벨 전체 초기화</button>
      </div>
      <div style="display:grid;grid-template-columns:1fr;gap:12px">
        <div style="padding:12px 14px;border:1px solid var(--border);border-radius:12px;background:var(--surface)">
          <div style="font-weight:900;color:var(--text2);margin-bottom:10px">📊 현황판 탭</div>
          ${b2.map(x=>row('board2',x)).join('')}
        </div>
        <div style="padding:12px 14px;border:1px solid var(--border);border-radius:12px;background:var(--surface)">
          <div style="font-weight:900;color:var(--text2);margin-bottom:10px">📅 대전기록 탭</div>
          ${hist.map(x=>row('history',x)).join('')}
        </div>
      </div>
    </details>`;
  }

  window.renderCfgTabLabelsSection = renderCfgTabLabelsSection;
  window.SettingsModules.tabs = { renderCfgTabLabelsSection };
})();
