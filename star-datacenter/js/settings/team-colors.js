(function(){
  window.SettingsModules = window.SettingsModules || {};

  function getColor(key, fallback){
    try{ return (localStorage.getItem(key) || fallback || '').trim() || fallback; }catch(e){ return fallback; }
  }

  window.cfgSyncTeamColorPreview = function(){
    try{
      const ckA = document.getElementById('cfg-team-ck-a')?.value || getColor('su_team_color_ck_a', '#2563eb');
      const ckB = document.getElementById('cfg-team-ck-b')?.value || getColor('su_team_color_ck_b', '#6366f1');
      const proA = document.getElementById('cfg-team-pro-a')?.value || getColor('su_team_color_pro_a', '#0f766e');
      const proB = document.getElementById('cfg-team-pro-b')?.value || getColor('su_team_color_pro_b', '#4f46e5');
      const paint=(id,color,label)=>{
        const el=document.getElementById(id);
        if(!el) return;
        el.style.background=color;
        el.style.borderColor=color;
        el.textContent=label;
      };
      paint('cfg-team-ck-prev-a', ckA, `A팀 ${ckA}`);
      paint('cfg-team-ck-prev-b', ckB, `B팀 ${ckB}`);
      paint('cfg-team-pro-prev-a', proA, `A팀 ${proA}`);
      paint('cfg-team-pro-prev-b', proB, `B팀 ${proB}`);
    }catch(e){}
  };

  try{
    const migrations = [
      ['su_team_color_ck_a', '#0e7490', '#2563eb'],
      ['su_team_color_ck_b', '#b45309', '#6366f1'],
      ['su_team_color_pro_b', '#7c3aed', '#4f46e5']
    ];
    migrations.forEach(([key, oldV, nextV])=>{
      try{
        const cur = String(localStorage.getItem(key)||'').trim().toLowerCase();
        if(!cur || cur===oldV.toLowerCase()) localStorage.setItem(key, nextV);
      }catch(e){}
    });
  }catch(e){}

  window.buildSettingsTeamColorBlock = function(){
    const ckA = getColor('su_team_color_ck_a', '#2563eb');
    const ckB = getColor('su_team_color_ck_b', '#6366f1');
    const proA = getColor('su_team_color_pro_a', '#0f766e');
    const proB = getColor('su_team_color_pro_b', '#4f46e5');
    return `
      <div style="margin-bottom:10px;padding:12px 14px;border:1.5px solid #93c5fd;border-radius:12px;background:linear-gradient(135deg,#eff6ff,#eef2ff);box-shadow:0 8px 18px rgba(37,99,235,.08)">
        <div style="font-size:13px;font-weight:1000;color:#1e3a8a;margin-bottom:4px">🎯 프로리그 일반 / 대학CK 색상은 여기서 바꿉니다</div>
        <div style="font-size:11px;color:#475569;line-height:1.6">바로 아래의 <b>대학CK 팀 버튼 색상</b>, <b>프로리그 일반 팀 버튼 색상</b> 컬러피커가 경기 상세 상단 팀 버튼뿐 아니라 <b>기록 카드 양쪽 끝 색상</b>에도 공통 적용됩니다.</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">
          <button class="btn btn-w btn-xs no-export" onclick="try{document.getElementById('cfg-team-ck-a')?.scrollIntoView({behavior:'smooth',block:'center'});}catch(e){}" style="border-color:#93c5fd">🤝 대학CK 색상으로 이동</button>
          <button class="btn btn-w btn-xs no-export" onclick="try{document.getElementById('cfg-team-pro-a')?.scrollIntoView({behavior:'smooth',block:'center'});}catch(e){}" style="border-color:#c4b5fd">🏅 프로리그 일반 색상으로 이동</button>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;padding:12px;border:2px solid #c7d2fe;border-radius:14px;background:linear-gradient(180deg,#ffffff,#f8fbff);box-shadow:0 10px 24px rgba(79,70,229,.06)">
        <div style="display:flex;flex-direction:column;gap:8px">
          <div style="font-size:13px;font-weight:1000;color:#1e3a8a">🤝 대학CK 팀 버튼 색상</div>
          <label style="display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:12px;font-weight:700;color:var(--text2)">
            <span>A팀</span>
            <input type="color" id="cfg-team-ck-a" value="${ckA}" oninput="cfgSyncTeamColorPreview()" onchange="cfgSetRecCardSettings()" style="width:42px;height:30px;padding:2px;border-radius:8px;border:1px solid var(--border2);cursor:pointer">
          </label>
          <label style="display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:12px;font-weight:700;color:var(--text2)">
            <span>B팀</span>
            <input type="color" id="cfg-team-ck-b" value="${ckB}" oninput="cfgSyncTeamColorPreview()" onchange="cfgSetRecCardSettings()" style="width:42px;height:30px;padding:2px;border-radius:8px;border:1px solid var(--border2);cursor:pointer">
          </label>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
            <div id="cfg-team-ck-prev-a" style="min-height:36px;border-radius:10px;border:1px solid ${ckA};background:${ckA};color:#fff;font-size:11px;font-weight:900;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 18px rgba(15,23,42,.10)">A팀 ${ckA}</div>
            <div id="cfg-team-ck-prev-b" style="min-height:36px;border-radius:10px;border:1px solid ${ckB};background:${ckB};color:#fff;font-size:11px;font-weight:900;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 18px rgba(15,23,42,.10)">B팀 ${ckB}</div>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px">
          <div style="font-size:13px;font-weight:1000;color:#312e81">🏅 프로리그 일반 팀 버튼 색상</div>
          <label style="display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:12px;font-weight:700;color:var(--text2)">
            <span>A팀</span>
            <input type="color" id="cfg-team-pro-a" value="${proA}" oninput="cfgSyncTeamColorPreview()" onchange="cfgSetRecCardSettings()" style="width:42px;height:30px;padding:2px;border-radius:8px;border:1px solid var(--border2);cursor:pointer">
          </label>
          <label style="display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:12px;font-weight:700;color:var(--text2)">
            <span>B팀</span>
            <input type="color" id="cfg-team-pro-b" value="${proB}" oninput="cfgSyncTeamColorPreview()" onchange="cfgSetRecCardSettings()" style="width:42px;height:30px;padding:2px;border-radius:8px;border:1px solid var(--border2);cursor:pointer">
          </label>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
            <div id="cfg-team-pro-prev-a" style="min-height:36px;border-radius:10px;border:1px solid ${proA};background:${proA};color:#fff;font-size:11px;font-weight:900;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 18px rgba(15,23,42,.10)">A팀 ${proA}</div>
            <div id="cfg-team-pro-prev-b" style="min-height:36px;border-radius:10px;border:1px solid ${proB};background:${proB};color:#fff;font-size:11px;font-weight:900;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 18px rgba(15,23,42,.10)">B팀 ${proB}</div>
          </div>
          <div style="font-size:11px;color:var(--gray-l)">경기 상세 상단 팀 버튼, 기록 카드 양쪽 끝 색상, 관련 공유카드에 공통 적용됩니다.</div>
        </div>
      </div>
    `;
  };

  window.SettingsModules.teamColors = {
    syncPreview: window.cfgSyncTeamColorPreview,
    buildBlock: window.buildSettingsTeamColorBlock
  };
})();
