(function(){
  window.SettingsModules = window.SettingsModules || {};

  function escMaybe(v){
    if(typeof window.esc === 'function') return window.esc(v);
    return String(v ?? '').replace(/[&<>"']/g, m => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[m]));
  }

  function renderCfgTabLabelsSection(_scfgD){
    const groups = [
      { title:'🧭 상단 메인 탭', ctx:'main', items:[
        {id:'total', d:'스트리머'},
        {id:'board2', d:'현황판'},
        {id:'tier', d:'티어 순위표'},
        {id:'hist', d:'대전 기록'},
        {id:'ind', d:'개인전/끝장전'},
        {id:'univm', d:'대학전'},
        {id:'comp', d:'대회/티어'},
        {id:'pro', d:'프로리그'},
        {id:'stats', d:'통계'},
        {id:'cal', d:'캘린더'},
        {id:'roulette', d:'룰렛'},
        {id:'cfg', d:'설정'}
      ]},
      { title:'📊 현황판 하위탭', ctx:'board2', items:[
        {id:'femco', d:'🧩 펨코스타일'},
        {id:'univ', d:'🏟️ 대학별 신현황판'},
        {id:'free', d:'🚶 무소속'},
        {id:'players', d:'👤 이미지별'},
        {id:'old', d:'📊 구현황판'}
      ]},
      { title:'📅 대전기록 하위탭', ctx:'history', items:[
        {id:'all', d:'📋 전체 통합'},
        {id:'psearch', d:'🔍 스트리머별 검색'},
        {id:'race', d:'🧬 종족 승률'},
        {id:'vs', d:'⚔️ 1:1 상대전적'},
        {id:'ind', d:'🎮 개인전'},
        {id:'gj', d:'⚔️ 끝장전'},
        {id:'mini', d:'⚡ 미니대전'},
        {id:'ck', d:'🤝 대학CK'},
        {id:'univm', d:'🏟️ 대학대전'},
        {id:'civil', d:'⚔️ 시빌워'},
        {id:'tourney', d:'🎖️ 대회 (토너먼트)'},
        {id:'tiertour', d:'🎯 티어대회'},
        {id:'pro', d:'🏅 일반'},
        {id:'progj', d:'⚔️ 끝장전'},
        {id:'procomp', d:'🏆 대회'},
        {id:'ext', d:'📎 외부'},
        {id:'ext2', d:'🌐 외부2'},
        {id:'ext3', d:'🌐 외부3'},
        {id:'univstat', d:'🏛️ 대학별 기록'},
        {id:'univrank', d:'🏛️ 대학별 포인트'},
        {id:'univcomp', d:'⚔️ 대학 전력 비교'}
      ]},
      { title:'📅 대전기록 그룹 이름', ctx:'historyGroup', items:[
        {id:'종합', d:'종합'},
        {id:'개인', d:'개인'},
        {id:'팀경기', d:'팀경기'},
        {id:'대회', d:'대회'},
        {id:'프로리그', d:'프로리그'},
        {id:'통계', d:'통계'},
        {id:'외부', d:'외부'}
      ]},
      { title:'🎮 개인전/대학대전 상단 하위탭', ctx:'mergedInd', items:[
        {id:'ind', d:'🎮 개인전'},
        {id:'gj', d:'⚔️ 끝장전'}
      ]},
      { title:'🏟️ 대학대전 상단 하위탭', ctx:'mergedUniv', items:[
        {id:'civil', d:'⚔️ 시빌워'},
        {id:'mini', d:'⚡ 미니대전'},
        {id:'univm', d:'🏟️ 대학대전'},
        {id:'univck', d:'🤝 대학CK'}
      ]},
      { title:'🏆 대회 상단 하위탭', ctx:'mergedComp', items:[
        {id:'comp', d:'🎖️ 대회'},
        {id:'tiertour', d:'🎯 티어대회'}
      ]},
      { title:'🏅 프로리그 상단 하위탭', ctx:'mergedPro', items:[
        {id:'pro', d:'🏅 일반'},
        {id:'gj', d:'⚔️ 끝장전'},
        {id:'comp', d:'🎖️ 대회'}
      ]},
      { title:'⚡ 미니대전/시빌워 하위메뉴', ctx:'mini', items:[
        {id:'input', d:'📝 경기 입력'},
        {id:'rank', d:'🏆 순위'},
        {id:'records', d:'📋 기록'}
      ]},
      { title:'🎮 개인전 하위메뉴', ctx:'ind', items:[
        {id:'input', d:'📝 경기 입력'},
        {id:'rank', d:'🏆 순위'},
        {id:'records', d:'📋 기록'}
      ]},
      { title:'⚔️ 끝장전 하위메뉴', ctx:'gj', items:[
        {id:'input', d:'📝 경기 입력'},
        {id:'rank', d:'🏆 순위'},
        {id:'records', d:'📋 기록'}
      ]},
      { title:'🤝 대학CK 하위메뉴', ctx:'ck', items:[
        {id:'input', d:'📝 경기 입력'},
        {id:'records', d:'📋 기록'},
        {id:'rank', d:'🏅 순위'}
      ]},
      { title:'🏟️ 대학대전 하위메뉴', ctx:'univm', items:[
        {id:'input', d:'📝 경기 입력'},
        {id:'rank', d:'🏆 순위'},
        {id:'records', d:'📋 기록'}
      ]},
      { title:'🏅 프로리그 하위메뉴', ctx:'pro', items:[
        {id:'input', d:'📝 경기 입력'},
        {id:'rank', d:'🏆 순위'},
        {id:'records', d:'📋 기록'}
      ]},
      { title:'🎖️ 일반 대회 하위메뉴', ctx:'comp', items:[
        {id:'league', d:'📅 조별리그 일정'},
        {id:'grprank', d:'📊 조별 순위'},
        {id:'tour', d:'🗂️ 대진표'},
        {id:'tourschedule', d:'📋 토너먼트'},
        {id:'comprank', d:'🏅 개인 순위'},
        {id:'grpedit', d:'🏗️ 조편성 관리'},
        {id:'tiertour', d:'🎯 티어대회'}
      ]},
      { title:'🎯 티어대회 하위메뉴', ctx:'tiertour', items:[
        {id:'input', d:'📝 일반'},
        {id:'records', d:'📋 일반 기록'},
        {id:'rank', d:'🏆 개인 순위'},
        {id:'league', d:'📅 조별리그'},
        {id:'grprecords', d:'📋 조별리그 기록'},
        {id:'grprank', d:'📊 조별 순위'},
        {id:'tourschedule', d:'🗂️ 토너먼트'},
        {id:'bktrecords', d:'🏆 토너먼트 기록'},
        {id:'grpedit', d:'🏗️ 조편성'}
      ]},
      { title:'🏆 프로리그대회 하위메뉴', ctx:'procomp', items:[
        {id:'league', d:'📅 조별리그'},
        {id:'grprank', d:'📊 순위'},
        {id:'tour', d:'🗂️ 대진표'},
        {id:'tourmatch', d:'🗂️ 대진표 기록'},
        {id:'team', d:'🤝 팀전'},
        {id:'gj', d:'🔥 중장전'},
        {id:'stats', d:'📈 통계'},
        {id:'grpedit', d:'🏗️ 관리'}
      ]},
      { title:'📈 통계 하위메뉴', ctx:'stats', items:[
        {id:'overview', d:'🏛️ 종합'},
        {id:'tierRank', d:'🚀 티어 랭킹'},
        {id:'starsystem', d:'⭐ 스타시스템'},
        {id:'elo', d:'📈 ELO 그래프'},
        {id:'growth', d:'📊 성장 곡선'},
        {id:'award', d:'🏆 이달의 스트리머'},
        {id:'records', d:'🎖️ 최다 기록'},
        {id:'killer', d:'🗡️ 킬러/피해자'},
        {id:'clutch', d:'⚡ 클러치 지수'},
        {id:'streakhist', d:'🔥 역대 연속 기록'},
        {id:'playervs', d:'⚔️ 스트리머 비교'},
        {id:'radar', d:'🕸️ 대학 레이더'},
        {id:'univmatrix', d:'🏛️ 대학 매트릭스'},
        {id:'univmatrix2', d:'🏛️ 대학 매트릭스+'},
        {id:'univwinbar', d:'📊 대학별 승률'},
        {id:'period', d:'🗓️ 주간/월간 분석'},
        {id:'mismatch', d:'⚡ 미스매치'},
        {id:'heatmap', d:'📅 활동 히트맵'},
        {id:'tierwin', d:'🎯 티어별 승률(개인)'},
        {id:'tiermatch', d:'🎖️ 티어별 승률(팀전)'},
        {id:'maprank', d:'🗺️ 맵별 특화'},
        {id:'racetrend', d:'🔬 종족 트렌드'},
        {id:'seasonal', d:'📅 요일/시즌 승률'},
        {id:'psearch', d:'🔍 스트리머 검색'},
        {id:'sharecard', d:'🎴 공유 카드'},
        {id:'advsearch', d:'🔍 고급 검색'},
        {id:'csvexport', d:'📥 CSV 내보내기'}
      ]},
      { title:'📈 통계 그룹 이름', ctx:'statsGroup', items:[
        {id:'🏆 개인', d:'🏆 개인'},
        {id:'🏛️ 대학', d:'🏛️ 대학'},
        {id:'📊 경기', d:'📊 경기'},
        {id:'🔍 기록실', d:'🔍 기록실'}
      ]},
      { title:'📅 캘린더 하위메뉴', ctx:'calendar', items:[
        {id:'all', d:'전체'},
        {id:'mini', d:'⚡ 미니'},
        {id:'univm', d:'🏟️ 대학'},
        {id:'ck', d:'🤝 CK'},
        {id:'pro', d:'🏅 프로'},
        {id:'ind', d:'🎮 개인전'},
        {id:'gj', d:'⚔️ 끝장전'},
        {id:'tt', d:'🎯 티어대회'},
        {id:'comp', d:'🎖️ 대회'},
        {id:'sched', d:'📌 예정'}
      ]}
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
        상단 메인 탭, 각 탭의 하위탭, 하위메뉴의 <b>표시 이름(라벨)</b>만 바꿉니다. (내부 데이터 id는 그대로 유지)<br>
        빈칸으로 두면 기본값으로 돌아갑니다.
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:10px">
        <button class="btn btn-w btn-sm" onclick="if(confirm('상단 메인 탭 라벨을 모두 초기화할까요?')){ if(typeof resetTabLabels==='function') resetTabLabels('main'); try{ if(typeof applyMainTabLabels==='function') applyMainTabLabels(); if(typeof render==='function')render(); }catch(e){} }">🔄 상단 탭 초기화</button>
        <button class="btn btn-w btn-sm" onclick="if(confirm('하위탭/하위메뉴 라벨을 모두 초기화할까요?')){ ['board2','history','mergedInd','mergedUniv','mergedComp','mergedPro','mini','ind','gj','ck','univm','pro','comp','tiertour','procomp','stats','calendar'].forEach(x=>{ try{ if(typeof resetTabLabels==='function') resetTabLabels(x); }catch(e){} }); try{ if(typeof render==='function')render(); }catch(e){} }">🔄 하위메뉴 초기화</button>
        <button class="btn btn-w btn-sm" onclick="if(confirm('모든 메뉴 이름 변경을 초기화할까요?')){ try{ if(typeof resetTabLabels==='function') resetTabLabels(); }catch(e){} try{ if(typeof applyMainTabLabels==='function') applyMainTabLabels(); if(typeof render==='function')render(); }catch(e){} }">🗑️ 전체 초기화</button>
      </div>
      <div style="padding:12px 14px;border:1px solid var(--border);border-radius:12px;background:var(--surface);margin-bottom:12px">
        <div style="font-weight:900;color:var(--text2);margin-bottom:8px">💾 라벨 내보내기 / 가져오기</div>
        <div style="font-size:11px;color:var(--gray-l);line-height:1.6;margin-bottom:8px">현재 메뉴 이름 변경 설정을 JSON으로 복사하거나 붙여넣어 다른 기기에도 적용할 수 있습니다.</div>
        <textarea id="cfg-tab-labels-io" style="width:100%;min-height:120px;border:1px solid var(--border2);border-radius:10px;padding:10px 12px;font-size:12px;line-height:1.6;box-sizing:border-box;resize:vertical;background:var(--white)" placeholder='{"main":{"stats":"분석"}}'></textarea>
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:10px">
          <button class="btn btn-w btn-sm" onclick="try{ const el=document.getElementById('cfg-tab-labels-io'); if(el && typeof exportTabLabels==='function') el.value=exportTabLabels(); }catch(e){}">내보내기</button>
          <button class="btn btn-w btn-sm" onclick="try{ const el=document.getElementById('cfg-tab-labels-io'); if(el) el.select(); document.execCommand('copy'); if(typeof showToast==='function') showToast('✅ 라벨 설정 복사 완료'); }catch(e){}">복사</button>
          <button class="btn btn-b btn-sm" onclick="try{ const el=document.getElementById('cfg-tab-labels-io'); if(!el) return; if(typeof importTabLabels==='function') importTabLabels(el.value); if(typeof applyMainTabLabels==='function') applyMainTabLabels(); if(typeof render==='function') render(); if(typeof showToast==='function') showToast('✅ 라벨 설정 가져오기 완료'); }catch(e){ alert('가져오기 실패: '+(e.message||e)); }">가져오기</button>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr;gap:12px">
        ${groups.map(g=>`
          <div style="padding:12px 14px;border:1px solid var(--border);border-radius:12px;background:var(--surface)">
            <div style="display:flex;align-items:center;gap:8px;justify-content:space-between;margin-bottom:10px;flex-wrap:wrap">
              <div style="font-weight:900;color:var(--text2)">${g.title}</div>
              <button class="btn btn-w btn-xs" onclick="if(confirm('${g.title.replace(/'/g,"\\'")} 라벨을 모두 초기화할까요?')){ if(typeof resetTabLabels==='function') resetTabLabels('${g.ctx}'); try{ if('${g.ctx}'==='main' && typeof applyMainTabLabels==='function') applyMainTabLabels(); if(typeof render==='function')render(); }catch(e){} }">초기화</button>
            </div>
            ${g.items.map(x=>row(g.ctx,x)).join('')}
          </div>
        `).join('')}
      </div>
    </details>`;
  }

  window.renderCfgTabLabelsSection = renderCfgTabLabelsSection;
  window.SettingsModules.tabs = { renderCfgTabLabelsSection };
})();
