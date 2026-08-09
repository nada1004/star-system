// settings-render.js에서 분리됨 (설정 탭 렌더링 — 상태아이콘/티어/계정/저장소/UI크기/스트리머뷰/티어랭크뷰/폰트/버튼/필터/자동인식)
function _cfgSecGroup2(ctx){
  const {isLoggedIn,isSubAdmin,_escHTML,_escJS,_escAttr,esc,_players,localStorage,notices,univCfg,_catSecs,_cfgCats,_cfgCatIcons,_catLabel,_cfgCatDesc,_cfgSecTitle,typeOpts,_curSecs,_regBtn,_menuBtn,_afOn,_rcOn,_rcAccent,_rcBg,_rcHd,_rcIc,_rcUnivFont,_ymScale,_rcMemoOn,_sfxOn,_sfxMode,_sfxInt,_sfxLen,_sfxTail,_sfxSoft,_sfxEdge,_avaScale,_mvpFxOn,_mvpFxStyle,_mvpFxIntensity,_mvpDesignMode,_briefingTheme,_cfgSecDescFallback,_cfgSecDesc,_getCfgSecDesc,_secButtons,_catCardAccents,_catCardsHtml,_secBtnColors,_secBtnIcColors,_secButtonsHtml,_cfgHeroStats,_cfgHeroStatsHtml} = ctx;
  return `${_scfgD('si','🎭 상태 아이콘 (목록/추가)')}
    <div style="font-size:var(--fs-sm);color:var(--gray-l);margin-bottom:12px;line-height:1.6">
      상태 아이콘의 <b>기본 목록</b>과 <b>커스텀 아이콘 추가</b>를 관리합니다.<br>
      스트리머별로 아이콘을 지정하는 기능은 아래의 <b>“🎭 스트리머별 상태 아이콘 지정”</b> 메뉴에서 합니다.
    </div>
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
      <div style="font-size:var(--fs-caption);color:var(--gray-l);margin-top:8px">지정은 “스트리머별 상태 아이콘 지정” 메뉴에서 합니다.</div>
    </div>
    <button class="btn btn-r btn-sm" onclick="if(confirm('모든 상태 아이콘 지정(스트리머별)을 초기화할까요?')){try{playerStatusIcons={};playerStatusExpiry={};if(typeof _iconPersistState==='function')_iconPersistState();}catch(e){};render();}">전체 초기화</button>
  </details>
  ${_scfgD('siAssign','🎭 스트리머별 상태 아이콘 지정')}
    <div style="font-size:var(--fs-sm);color:var(--gray-l);margin-bottom:12px;line-height:1.6">
      스트리머별로 표시될 상태 아이콘을 지정합니다. (현황판·순위표·이미지 저장 모두 반영)<br>
      검색 후 선택만 하면 바로 저장됩니다.
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:10px">
      <input id="cfg-si-assign-q" type="text" placeholder="🔍 이름/대학/티어 검색..." style="flex:1;min-width:220px;padding:6px 10px;border:1px solid var(--border2);border-radius:var(--r);font-size:var(--fs-sm)"
        oninput="try{window._cfgSiAssignQ=this.value; if(typeof _renderCfgSiAssignList==='function') _renderCfgSiAssignList();}catch(e){}">
      <button class="btn btn-w btn-sm" onclick="document.getElementById('cfg-si-assign-q').value='';window._cfgSiAssignQ=''; if(typeof _renderCfgSiAssignList==='function') _renderCfgSiAssignList();">초기화</button>
    </div>
    <div id="cfg-si-assign-list" style="max-height:380px;overflow-y:auto;border:1px solid var(--border);border-radius:var(--r);background:var(--white)">
      <div style="padding:16px;text-align:center;color:var(--gray-l);font-size:var(--fs-sm)">로딩 중...</div>
    </div>
  </details>
  ${_scfgD('tier','🎭 티어 관리')}
    ${(()=>{ 
      const th = (typeof getTierTheme==='function') ? getTierTheme() : {bg:{},icon:{},sat:1,bri:1};
      const bri = Math.round((parseFloat(th.bri)||1)*100);
      const sat = Math.round((parseFloat(th.sat)||1)*100);
      const _safeHex = (h) => {
        const s=String(h||'').trim();
        return /^#([0-9a-fA-F]{6})$/.test(s) ? s : '#64748b';
      };
      const _attr = (s)=>String(s??'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      const _jsq = (s)=>String(s??'').replace(/\\/g,'\\\\').replace(/'/g,"\\'");
      return `
      <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r);margin-bottom:14px">
        <div style="font-size:var(--fs-sm);font-weight:1000;color:var(--text2);margin-bottom:10px">🎨 티어 색상/밝기/이모지 커스텀</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;align-items:center;margin-bottom:12px">
          <div>
            <div style="font-size:var(--fs-caption);font-weight:800;color:var(--text3);margin-bottom:4px">밝기</div>
            <input type="range" min="60" max="160" step="1" value="${bri}" style="width:100%" oninput="document.getElementById('cfg-tier-bri-v').textContent=this.value+'%';cfgTierThemeSetBri(this.value)">
            <div style="font-size:var(--fs-caption);color:var(--gray-l)"><span id="cfg-tier-bri-v">${bri}%</span></div>
          </div>
          <div>
            <div style="font-size:var(--fs-caption);font-weight:800;color:var(--text3);margin-bottom:4px">채도</div>
            <input type="range" min="50" max="160" step="1" value="${sat}" style="width:100%" oninput="document.getElementById('cfg-tier-sat-v').textContent=this.value+'%';cfgTierThemeSetSat(this.value)">
            <div style="font-size:var(--fs-caption);color:var(--gray-l)"><span id="cfg-tier-sat-v">${sat}%</span></div>
          </div>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px">
          <button class="btn btn-w btn-sm" onclick="cfgTierThemeReset()">기본값으로 초기화</button>
          <span style="font-size:var(--fs-caption);color:var(--gray-l);align-self:center">※ 변경 즉시 전체 화면(배지/그래프)에 반영됩니다.</span>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:10px">
          ${TIERS.map((t,i)=>{
            const c=_safeHex(th.bg?.[t]||'');
            const ic=String(th.icon?.[t]||'');
            return `<div style="padding:10px 10px;background:var(--white);border:1px solid var(--border);border-radius:var(--r);display:flex;flex-direction:column;gap:8px">
              <div id="cfg-tier-prev-${i}" style="display:flex;justify-content:center">${getTierBadge(t)}</div>
              <div style="display:flex;gap:6px;align-items:center;justify-content:center;flex-wrap:wrap">
                <input id="cfg-tier-c-${encodeURIComponent(t)}" type="color" value="${c}" title="티어 색상" onchange="cfgTierThemeSetColor('${_jsq(t)}',this.value)">
                <input id="cfg-tier-hex-${encodeURIComponent(t)}" type="text" value="${c}" placeholder="#RRGGBB" title="티어 색상 HEX 입력" style="width:92px;padding:6px 8px;border:1px solid var(--border2);border-radius:8px;font-size:var(--fs-sm);font-weight:800;text-align:center" onblur="cfgTierThemeSetColor('${_jsq(t)}',this.value)">
                <button class="btn btn-w btn-xs" title="색상 선택" onclick="cfgTierThemePickColor('${_jsq(t)}',this)">🎨</button>
                <input type="text" value="${_attr(ic)}" placeholder="이모지" title="티어 이모지" style="width:64px;padding:6px 8px;border:1px solid var(--border2);border-radius:8px;font-size:var(--fs-base);text-align:center" oninput="cfgTierThemeSetIcon('${_jsq(t)}',this.value)">
              </div>
              <div style="font-size:10px;color:var(--gray-l);text-align:center">${t}</div>
            </div>`;
          }).join('')}
        </div>
      </div>`;
    })()}
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
  ${_scfgD('acct','👤 관리자 계정 관리')}
    <div style="font-size:var(--fs-sm);color:var(--gray-l);margin-bottom:4px">• <b>관리자</b>: 모든 기능 + 설정 접근 가능</div>
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
  ${_scfgD('storage','💾 로컬 저장소 사용량')}
    <div id="cfg-storage-wrap2">
      <div id="cfg-storage-info"><div style="color:var(--gray-l);font-size:var(--fs-sm)">계산 중...</div></div>
      <button class="btn btn-w btn-sm" style="margin-top:8px" onclick="renderStorageInfo()">🔄 새로고침</button>
    </div>
  </details>
  ${_scfgD('datacheck','🧾 데이터 검수')}
    <div style="font-size:var(--fs-sm);color:var(--gray-l);margin-bottom:10px">관리용 점검 패널입니다. 사진 누락, 대학/티어 미설정, 최근 30일 기록 없음, 날짜 형식 이상을 한 번에 확인할 수 있습니다.</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
      <button class="btn btn-b btn-sm" onclick="cfgRunDataAudit()">🔎 지금 점검</button>
      <span style="font-size:var(--fs-caption);color:var(--gray-l)">※ 클릭한 이름은 바로 상세 팝업으로 열 수 있습니다.</span>
    </div>
    <div id="cfg-datacheck-out" style="margin-top:10px"></div>
  </details>
  ${_scfgD('selfcheck','🧪 설정 기능 점검')}
    <div style="font-size:var(--fs-sm);color:var(--gray-l);margin-bottom:10px">설정 화면에서 버튼/토글이 “눌러도 안되는” 경우, 핸들러(함수) 누락이 원인일 수 있습니다.</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
      <button class="btn btn-b btn-sm" onclick="cfgRunSettingsSelfCheck()">🔎 설정 핸들러 점검</button>
      <button class="btn btn-g btn-sm" onclick="cfgRunFullQaDryRun()">🧪 전체 QA(드라이런) 점검</button>
      <button class="btn btn-b btn-sm" onclick="cfgRunMenuFuncCheck()">🔵🔴 메뉴별 작동 점검</button>
      <span style="font-size:var(--fs-caption);color:var(--gray-l)">※ 실제 데이터는 건드리지 않고, 임시 더미 데이터로 동작만 확인합니다. 메뉴별 점검은 각 메뉴 제목 옆에 파란색(정상)/빨간색(오류) 점으로도 표시됩니다.</span>
    </div>
    <div id="cfg-selfcheck-out" style="margin-top:10px"></div>
  </details>
  ${_scfgD('autofitall','📱 전역 자동 맞춤 (모든 탭)')}
    <div style="font-size:var(--fs-sm);color:var(--gray-l);margin-bottom:10px">모바일/태블릿에서 <b>간격·패딩·카드/그리드 밀도·테이블</b>을 화면에 맞춰 자동 조절합니다. (전 탭 공통)</div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r);display:flex;flex-direction:column;gap:10px">
      <label style="display:flex;align-items:center;gap:8px;font-size:var(--fs-sm);cursor:pointer;font-weight:900;color:var(--text2)">
        <input type="checkbox" id="cfg-autofitall-on" style="width:15px;height:15px" ${_afOn?'checked':''}
          onchange="cfgSetAutoFitAllTabs(this.checked)">
        전체 탭 자동 맞춤 사용
      </label>
      <div style="font-size:var(--fs-caption);color:var(--gray-l)">※ 켜면 화면 크기 변화(가로/세로 전환 포함)에 따라 자동 적용됩니다.</div>
    </div>
  </details>
  ${_scfgD('uisize','📱 모바일/태블릿 UI 크기 (버튼/메뉴/배지)')}
    <div style="font-size:var(--fs-sm);color:var(--gray-l);margin-bottom:10px">모바일/태블릿에서 버튼/메뉴가 너무 커 보일 때 여기서 한 번에 조절합니다. (코드 수정 없이)</div>
    <div id="cfg-uisize-body" style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r)">
      <div style="font-size:var(--fs-sm);color:var(--gray-l)">로딩 중...</div>
    </div>
  </details>
  ${(()=>{ 
    const sgPc = Math.max(0,Math.min(80,parseInt(localStorage.getItem('su_streamer_card_gap_pc')||'13',10)||13));
    const sgMb = Math.max(0,Math.min(80,parseInt(localStorage.getItem('su_streamer_card_gap_mb')||'9',10)||9));
    const tgPc = Math.max(0,Math.min(80,parseInt(localStorage.getItem('su_tier_card_gap_pc')||'26',10)||26));
    const tgMb = Math.max(0,Math.min(80,parseInt(localStorage.getItem('su_tier_card_gap_mb')||'18',10)||18));
    return _scfgD('cardgap','🧩 카드 간격(스트리머/티어)') + `
    <div style="font-size:var(--fs-sm);color:var(--gray-l);margin-bottom:10px">스트리머탭 카드형 / 티어 순위표 카드형에서 카드가 붙어 보일 때 간격을 조절합니다. (PC/모바일 별도)</div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r);display:flex;flex-direction:column;gap:14px">
      <div style="font-size:var(--fs-sm);font-weight:1000;color:var(--text2)">🎬 스트리머탭 카드형 간격</div>
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:var(--fs-caption);color:var(--gray-l);font-weight:900">PC</span>
          <input type="range" id="cfg-streamer-gap-pc" min="4" max="80" step="1"
            value="${sgPc}"
            oninput="document.getElementById('cfg-streamer-gap-pc-v').textContent=this.value+'px'" onchange="cfgSetStreamerCardGapSettings()" style="width:160px">
          <span id="cfg-streamer-gap-pc-v" style="font-size:var(--fs-caption);color:var(--gray-l);min-width:44px;font-weight:900">${sgPc}px</span>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:var(--fs-caption);color:var(--gray-l);font-weight:900">모바일</span>
          <input type="range" id="cfg-streamer-gap-mb" min="4" max="80" step="1"
            value="${sgMb}"
            oninput="document.getElementById('cfg-streamer-gap-mb-v').textContent=this.value+'px'" onchange="cfgSetStreamerCardGapSettings()" style="width:160px">
          <span id="cfg-streamer-gap-mb-v" style="font-size:var(--fs-caption);color:var(--gray-l);min-width:44px;font-weight:900">${sgMb}px</span>
        </div>
      </div>
      <div style="height:1px;background:var(--border2)"></div>
      <div style="font-size:var(--fs-sm);font-weight:1000;color:var(--text2)">📊 티어 순위표 카드형 간격</div>
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:var(--fs-caption);color:var(--gray-l);font-weight:900">PC</span>
          <input type="range" id="cfg-tier-gap-pc" min="10" max="80" step="1"
            value="${tgPc}"
            oninput="document.getElementById('cfg-tier-gap-pc-v').textContent=this.value+'px'" onchange="cfgSetTierCardGapSettings()" style="width:160px">
          <span id="cfg-tier-gap-pc-v" style="font-size:var(--fs-caption);color:var(--gray-l);min-width:44px;font-weight:900">${tgPc}px</span>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:var(--fs-caption);color:var(--gray-l);font-weight:900">모바일</span>
          <input type="range" id="cfg-tier-gap-mb" min="10" max="80" step="1"
            value="${tgMb}"
            oninput="document.getElementById('cfg-tier-gap-mb-v').textContent=this.value+'px'" onchange="cfgSetTierCardGapSettings()" style="width:160px">
          <span id="cfg-tier-gap-mb-v" style="font-size:var(--fs-caption);color:var(--gray-l);min-width:44px;font-weight:900">${tgMb}px</span>
        </div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
        <button class="btn btn-w btn-sm" onclick="try{localStorage.removeItem('su_streamer_card_gap_pc');localStorage.removeItem('su_streamer_card_gap_mb');localStorage.removeItem('su_tier_card_gap_pc');localStorage.removeItem('su_tier_card_gap_mb');}catch(e){};try{window.applyStreamerCardGap&&window.applyStreamerCardGap();}catch(e){};try{window.applyTierCardGap&&window.applyTierCardGap();}catch(e){};try{render();}catch(e){}">기본값으로</button>
        <span style="font-size:var(--fs-caption);color:var(--gray-l)">※ 카드형 화면에서 바로 체감됩니다.</span>
      </div>
    </div>
  </details>`;
  })()}
  ${(()=>{ 
    const q = (localStorage.getItem('su_cfg_streamer_channel_q') || '').trim();
    const players = (Array.isArray(window.players) ? window.players : []).filter(p=>p && !p.hidden && !p.retired && String(p.univ||'').trim() !== 'YB');
    const withUrl = players.filter(p=>String(p.channelUrl||'').trim()).length;
    return _scfgD('streamerchannel','📺 스트리머 방송국 URL') + `
    <div style="font-size:var(--fs-sm);color:var(--gray-l);margin-bottom:10px;line-height:1.6">
      스트리머별 <b>방송국 홈 URL</b>을 한 곳에서 빠르게 입력/수정합니다.<br>
      라이브탭 SOOP 미리보기/채널 이동은 여기 입력된 주소를 기준으로 동작합니다.
    </div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r);display:flex;flex-direction:column;gap:12px">
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
        <input id="cfg-streamer-channel-search" type="text" value="${(typeof escAttr==='function'?escAttr(q):String(q).replace(/"/g,'&quot;'))}" placeholder="이름/대학/티어/URL 검색"
          oninput="cfgFilterStreamerChannels(this.value)"
          style="width:min(320px,100%);padding:8px 12px;border-radius:20px;border:1px solid var(--border2);font-size:var(--fs-sm);background:var(--white);color:var(--text2)">
        <span style="font-size:var(--fs-caption);color:var(--gray-l);font-weight:800">총 ${players.length}명 · URL 설정 ${withUrl}명</span>
        <button class="btn btn-w btn-xs" onclick="document.getElementById('cfg-streamer-channel-search').value='';cfgFilterStreamerChannels('')">검색 지우기</button>
      </div>
      <div style="font-size:var(--fs-caption);color:var(--gray-l);line-height:1.5">
        입력 후 <b>포커스 아웃</b> 또는 <b>Enter</b> 시 바로 저장됩니다. 예: <code>https://ch.sooplive.co.kr/...</code>, <code>https://chzzk.naver.com/...</code>
      </div>
      <div id="cfg-streamer-channel-rows" style="display:flex;flex-direction:column;gap:8px;max-height:560px;overflow:auto">${typeof window.cfgGetStreamerChannelRowsHTML==='function' ? window.cfgGetStreamerChannelRowsHTML(q) : ''}</div>
    </div>
  </details>`;
  })()}
  ${_scfgD('streamer-view','🎬 스트리머탭 기본 뷰')}
    <div style="font-size:var(--fs-sm);color:var(--gray-l);margin-bottom:10px">스트리머탭 진입 시 기본으로 표시할 뷰 방식을 설정합니다. 탭 상단 버튼으로도 즉시 전환 가능합니다.</div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r)">
      <div style="display:flex;flex-wrap:wrap;gap:8px">
        ${(function(){
          const _cur = (()=>{try{return localStorage.getItem('su_streamer_view_mode')||'table';}catch(e){return 'table';}})();
          return [
            {id:'table',   icon:'☰',  title:'리스트형',   desc:'표 형식. 빠르고 정보 밀도 높음'},
            {id:'gallery', icon:'🪪', title:'카드형',     desc:'사진 중심 카드 대시보드'},
            {id:'focus',   icon:'🧾', title:'상세형',     desc:'좌측 목록 + 우측 상세'},
            {id:'simple',  icon:'✨', title:'심플형',     desc:'여백을 줄인 한 줄 미니멀 리스트'},
          ].map(v=>`<button type="button"
            onclick="try{localStorage.setItem('su_streamer_view_mode','${v.id}');if(typeof totalViewMode!=='undefined'){totalViewMode='${v.id}';}try{render();}catch(e){};}catch(e){};try{if(typeof window.cfgTouchPrefsSync==='function')window.cfgTouchPrefsSync();}catch(e){}"
            style="display:flex;flex-direction:column;align-items:center;gap:4px;padding:10px 14px;border-radius:var(--r);border:2px solid ${_cur===v.id?'var(--blue)':'var(--border2)'};background:${_cur===v.id?'#eff6ff':'var(--white)'};cursor:pointer;min-width:90px;transition:border-color .15s"
          >
            <span style="font-size:20px">${v.icon}</span>
            <span style="font-size:var(--fs-caption);font-weight:900;color:${_cur===v.id?'var(--blue)':'var(--text2)'}">${v.title}</span>
            <span style="font-size:10px;color:var(--gray-l);text-align:center;line-height:1.3">${v.desc}</span>
          </button>`).join('');
        })()}
      </div>
    </div>
  </details>
  ${(typeof window.renderCfgStreamerTabStyleSection==='function' ? window.renderCfgStreamerTabStyleSection(_scfgD) : '')}
  ${_scfgD('tierrank-view','📊 티어 순위표 보기 방식')}
    <div style="font-size:var(--fs-sm);color:var(--gray-l);margin-bottom:10px">스트리머탭 → 티어 순위표의 기본 뷰 방식을 설정합니다. 순위표 상단 아이콘 버튼으로도 즉시 전환할 수 있습니다.</div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r);display:flex;flex-direction:column;gap:14px">
      <div>
        <div style="font-size:var(--fs-caption);color:var(--text3);font-weight:800;margin-bottom:8px">기본 뷰 선택</div>
        <div style="display:flex;flex-wrap:wrap;gap:8px">
          ${(function(){
            const _cur = localStorage.getItem('su_tier_view_mode') || 'table';
            return [
              {id:'table',      icon:'📋', title:'테이블',        desc:'기존 테이블 형식. 모든 정보 한눈에'},
              {id:'magazine',   icon:'📷', title:'매거진/룩북',   desc:'프로필 카드 그리드. 한 눈에 보기 좋음'},
              {id:'podium',     icon:'🏆', title:'포디움',        desc:'1-2-3위 시상대 + 나머지 리스트'},
              {id:'compact',    icon:'📝', title:'컴팩트 리스트', desc:'한 줄로 밀도 높게. 많은 인원 빠르게'},
              {id:'tier-group', icon:'🎖️', title:'티어별 그룹',   desc:'티어 단위로 묶어 카드 표시'},
            ].map(v=>`<button type="button"
              onclick="localStorage.setItem('su_tier_view_mode','${v.id}');if(!window._tierViewMode||1){window._tierViewMode='${v.id}';};try{render();}catch(e){};try{if(typeof window.cfgTouchPrefsSync==="function")window.cfgTouchPrefsSync();}catch(e){}"
              style="display:flex;flex-direction:column;align-items:center;gap:4px;padding:10px 14px;border-radius:var(--r);border:2px solid ${_cur===v.id?'var(--blue)':'var(--border2)'};background:${_cur===v.id?'#eff6ff':'var(--white)'};cursor:pointer;min-width:90px;transition:border-color .15s"
            >
              <span style="font-size:20px">${v.icon}</span>
              <span style="font-size:var(--fs-caption);font-weight:900;color:${_cur===v.id?'var(--blue)':'var(--text2)'}">${v.title}</span>
              <span style="font-size:10px;color:var(--gray-l);text-align:center;line-height:1.3">${v.desc}</span>
            </button>`).join('');
          })()}
        </div>
      </div>
      <div style="font-size:var(--fs-caption);color:var(--gray-l);border-top:1px solid var(--border2);padding-top:8px">
        💡 순위표 상단 우측의 <b>📋 📷 🏆 📝 🎖️</b> 아이콘 버튼으로도 즉시 전환됩니다.
      </div>
    </div>
  </details>
  ${(typeof window.renderCfgRecCardSection==='function' ? window.renderCfgRecCardSection(_scfgD) : '')}
  ${(typeof window.renderCfgTourneyCardSection==='function' ? window.renderCfgTourneyCardSection(_scfgD) : '')}
  ${(()=>{ 
    const _chip = (localStorage.getItem('su_cal_chip_mode') ?? 'types');
    const _shareAdm = (localStorage.getItem('su_share_admin_only') ?? '0') === '1';
    return _scfgD('calui','📅 캘린더 표시/버튼') + `
    <div style="font-size:var(--fs-sm);color:var(--gray-l);margin-bottom:10px">캘린더 탭의 날짜 칸 표시와 카드 버튼 구성을 설정합니다.</div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r);display:flex;flex-direction:column;gap:12px">
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <div style="font-size:var(--fs-caption);color:var(--text3);font-weight:800">월간/주간 날짜칸 요약</div>
        <select id="cfg-cal-chip" onchange="cfgSetCalendarUiSettings()" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-size:var(--fs-sm);font-weight:900">
          <option value="total" ${_chip==='total'?'selected':''}>총 경기수만</option>
          <option value="types" ${_chip!=='total'?'selected':''}>총 + 상위2종류</option>
        </select>
      </div>
      <label style="display:flex;align-items:center;gap:8px;font-size:var(--fs-sm);cursor:pointer;font-weight:900;color:var(--text2)">
        <input type="checkbox" id="cfg-share-adminonly" style="width:15px;height:15px" ${_shareAdm?'checked':''} onchange="cfgSetCalendarUiSettings()">
        공유 버튼 숨기기(관리자만 표시)
      </label>
      <div style="font-size:var(--fs-caption);color:var(--gray-l)">※ 관리자=로그인 상태. 기록/대회/캘린더 카드의 공유 버튼이 함께 적용됩니다.</div>
    </div>
  </details>`;
  })()}
  ${(typeof window.renderCfgDesignV2Section==='function' ? window.renderCfgDesignV2Section(_scfgD) : '')}
  ${(typeof window.renderCfgDesignV2ColorsSection==='function' ? window.renderCfgDesignV2ColorsSection(_scfgD) : '')}
  ${(typeof window.renderCfgTabColorSection==='function' ? window.renderCfgTabColorSection(_scfgD) : '')}
  ${(typeof window.renderCfgStreamerHeaderSection==='function' ? window.renderCfgStreamerHeaderSection(_scfgD) : '')}
  ${(()=>{ 
    const p = (localStorage.getItem('su_app_font_preset') ?? 'noto');
    const css = (localStorage.getItem('su_app_font_css') ?? '');
    const fam = (localStorage.getItem('su_app_font_family') ?? '');
    const cssTxt = (localStorage.getItem('su_app_font_css_text') ?? '');
    const uiPctPc = parseInt(localStorage.getItem('su_ui_scale_pc_pct')||localStorage.getItem('su_ui_scale_pct')||'100',10)||100;
    const uiPctTb = parseInt(localStorage.getItem('su_ui_scale_tb_pct')||localStorage.getItem('su_ui_scale_pct')||'100',10)||100;
    const uiPctMb = parseInt(localStorage.getItem('su_ui_scale_mb_pct')||localStorage.getItem('su_ui_scale_pct')||'100',10)||100;
    const appFontScalePc = parseInt(localStorage.getItem('su_app_font_scale_pc_pct')||localStorage.getItem('su_app_font_scale_pct')||'100',10)||100;
    const appFontScaleTb = parseInt(localStorage.getItem('su_app_font_scale_tb_pct')||localStorage.getItem('su_app_font_scale_pct')||'100',10)||100;
    const appFontScaleMb = parseInt(localStorage.getItem('su_app_font_scale_mb_pct')||localStorage.getItem('su_app_font_scale_pct')||'100',10)||100;
    // CSS 직접입력에서 font-family 자동 추출 → 프리셋 드롭다운에도 합치기(요청)
    const customFams = (()=>{
      const out=[]; const seen=new Set();
      const re=/font-family\s*:\s*['"]?([^;'"\\n\\r]+)['"]?\s*;/gi;
      let m;
      while((m=re.exec(String(cssTxt||'')))){
        const name=String(m[1]||'').trim();
        if(!name) continue;
        const key=name.toLowerCase();
        if(seen.has(key)) continue;
        seen.add(key); out.push(name);
      }
      return out;
    })();
    const aliasMap = (()=>{
      try{ return JSON.parse(localStorage.getItem('su_app_font_alias_map')||'{}')||{}; }catch(e){ return {}; }
    })();
    const _dispFontName = (n)=>{
      const a = aliasMap[n];
      return a ? `${a} (${n})` : n;
    };
    const ffChoices = (()=>{
      const list=[];
      // 내장 추천
      list.push({k:'Pretendard, \"Noto Sans KR\", system-ui, -apple-system, Segoe UI, Roboto, sans-serif', l:'(추천) Pretendard'});
      list.push({k:'GmarketSans, \"Noto Sans KR\", system-ui, -apple-system, Segoe UI, Roboto, sans-serif', l:'(추천) GmarketSans'});
      list.push({k:'\"Noto Sans KR\", system-ui, -apple-system, Segoe UI, Roboto, sans-serif', l:'Noto Sans KR'});
      // 커스텀 폰트들 자동 생성(입력 없이 선택 가능)
      customFams.forEach(n=>{
        list.push({k:`${n}, \"Noto Sans KR\", sans-serif`, l:_dispFontName(n)});
      });
      // 중복 제거
      const seen=new Set(); return list.filter(x=>{const kk=x.k.toLowerCase(); if(seen.has(kk)) return false; seen.add(kk); return true;});
    })();
    const customPreset = (()=>{
      // 현재 fam의 첫 토큰이 커스텀 font인지 추정
      const curMain = String(fam||'').split(',')[0].replace(/['"]/g,'').trim().toLowerCase();
      if(!curMain) return '';
      const hit = customFams.find(x=>x.toLowerCase()===curMain);
      return hit ? ('custom:'+hit) : '';
    })();
    return _scfgD('appfont','🅰️ 전역 폰트') + `
    <div style="font-size:var(--fs-sm);color:var(--gray-l);margin-bottom:10px">앱 전체 폰트를 변경합니다. (프리셋 + 사용자 CSS URL 지원)</div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r);display:flex;flex-direction:column;gap:12px">
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text2);min-width:120px">프리셋</div>
        <select id="cfg-appfont-preset" onchange="cfgSetAppFontSettings()" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-size:var(--fs-sm);font-weight:900">
          <option value="system" ${p==='system'?'selected':''}>시스템</option>
          <option value="noto" ${p==='noto'?'selected':''}>Noto Sans KR</option>
          <option value="pretendard" ${p==='pretendard'?'selected':''}>Pretendard</option>
          <option value="nanum" ${p==='nanum'?'selected':''}>나눔고딕</option>
          <option value="gmarket" ${p==='gmarket'?'selected':''}>GmarketSans</option>
          <option value="dohyeon" ${p==='dohyeon'?'selected':''}>Do Hyeon (개성있는 한글)</option>
          <option value="blackhansans" ${p==='blackhansans'?'selected':''}>Black Han Sans (굵은 헤드라인)</option>
          <option value="ibmplexsans" ${p==='ibmplexsans'?'selected':''}>IBM Plex Sans KR (정갈함)</option>
          ${customFams.length?`<option value="" disabled>──────── 커스텀(저장한 폰트) ────────</option>`:''}
          ${customFams.map(n=>`<option value="custom:${esc(n)}" ${customPreset===('custom:'+n)?'selected':''}>${esc(_dispFontName(n))}</option>`).join('')}
        </select>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text2);min-width:120px">추가 CSS URL</div>
        <input type="text" id="cfg-appfont-css" value="${css.replace(/\"/g,'&quot;')}" placeholder="예) https://.../font.css" style="flex:1;min-width:260px" onchange="cfgSetAppFontSettings()">
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text2);min-width:120px">font-family</div>
        <input type="text" id="cfg-appfont-family" value="${fam.replace(/\"/g,'&quot;')}" placeholder="비우면 프리셋 기본값 사용" style="flex:1;min-width:260px" onchange="cfgSetAppFontSettings()">
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text2);min-width:120px">font-family 선택</div>
        <select onchange="cfgApplyFontFamilyChoice(this.value)" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-size:var(--fs-sm);font-weight:900;flex:1;min-width:260px">
          <option value="">(입력 없이 선택)</option>
          ${ffChoices.map(o=>`<option value="${esc(o.k)}">${esc(o.l)}</option>`).join('')}
        </select>
      </div>
      <div style="padding:12px;border:1px solid var(--border);border-radius:12px;background:var(--white)">
        <div style="font-size:var(--fs-caption);color:var(--text3);font-weight:900;margin-bottom:8px">전역 폰트 크기 (글자 전용)</div>
        <div style="display:grid;grid-template-columns:90px 1fr 52px;gap:10px;align-items:center;margin-bottom:6px">
          <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text2)">PC</div>
          <input type="range" id="cfg-appfont-scale-pc" min="85" max="130" step="5" value="${Math.max(85,Math.min(130,appFontScalePc))}" oninput="cfgSetAppFontScalePct('pc',this.value)" style="width:100%">
          <div id="cfg-appfont-scale-pc-v" style="font-size:var(--fs-caption);color:var(--gray-l);font-weight:900;text-align:right">${Math.max(85,Math.min(130,appFontScalePc))}%</div>
        </div>
        <div style="display:grid;grid-template-columns:90px 1fr 52px;gap:10px;align-items:center;margin-bottom:6px">
          <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text2)">태블릿</div>
          <input type="range" id="cfg-appfont-scale-tb" min="85" max="130" step="5" value="${Math.max(85,Math.min(130,appFontScaleTb))}" oninput="cfgSetAppFontScalePct('tb',this.value)" style="width:100%">
          <div id="cfg-appfont-scale-tb-v" style="font-size:var(--fs-caption);color:var(--gray-l);font-weight:900;text-align:right">${Math.max(85,Math.min(130,appFontScaleTb))}%</div>
        </div>
        <div style="display:grid;grid-template-columns:90px 1fr 52px;gap:10px;align-items:center">
          <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text2)">모바일</div>
          <input type="range" id="cfg-appfont-scale-mb" min="85" max="130" step="5" value="${Math.max(85,Math.min(130,appFontScaleMb))}" oninput="cfgSetAppFontScalePct('mb',this.value)" style="width:100%">
          <div id="cfg-appfont-scale-mb-v" style="font-size:var(--fs-caption);color:var(--gray-l);font-weight:900;text-align:right">${Math.max(85,Math.min(130,appFontScaleMb))}%</div>
        </div>
        <div style="font-size:var(--fs-caption);color:var(--gray-l);margin-top:6px;line-height:1.6">
          글자 크기만 전반적으로 조절합니다. 버튼/아이콘/탭 크기는 아래 <b>🎛️ 버튼 스타일 → 전역 UI 배율</b>에서 따로 조절할 수 있습니다.<br>
          현재 UI 배율: PC ${Math.max(80,Math.min(140,uiPctPc))}% / 태블릿 ${Math.max(80,Math.min(140,uiPctTb))}% / 모바일 ${Math.max(80,Math.min(140,uiPctMb))}%
          <button class="btn btn-w btn-xs" style="margin-left:8px" onclick="cfgResetAppFontScalePct()">초기화</button>
        </div>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text2);min-width:120px">커스텀 프리셋</div>
        <select id="cfg-appfont-custompreset" onchange="cfgApplyCustomFontPreset(this.value)" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-size:var(--fs-sm);font-weight:900;flex:1;min-width:260px">
          <option value="">(직접입력에서 자동 추출)</option>
        </select>
        <button class="btn btn-w btn-xs" onclick="cfgRenderCustomFontPresetOptions()" style="padding:6px 10px">🔄 새로고침</button>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:flex-start">
        <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text2);min-width:120px;padding-top:8px">CSS 직접 입력</div>
        <div style="flex:1;min-width:260px">
          <textarea id="cfg-appfont-csstext" rows="7" placeholder="@font-face { ... }\n(여기에 붙여넣으면 자동 저장/적용됩니다)\n\n여러 개는 @font-face 블록을 연달아 추가하세요."
            style="width:100%;resize:vertical"
            oninput="cfgSetAppFontSettings(); try{cfgRenderCustomFontPresetOptions();}catch(e){}">${esc(cssTxt)}</textarea>
          <div style="display:flex;gap:8px;align-items:center;margin-top:6px;flex-wrap:wrap">
            <button class="btn btn-w btn-xs" onclick="cfgSetAppFontSettings();alert('✅ 저장됨')" style="padding:6px 10px">💾 저장</button>
            <span style="font-size:var(--fs-caption);color:var(--gray-l)">※ 입력 후 다른 곳을 클릭하지 않아도 자동 저장됩니다.</span>
          </div>
        </div>
      </div>
      <div style="font-size:var(--fs-caption);color:var(--gray-l);line-height:1.5">
        • 예: <span style="font-family:ui-monospace,monospace">Pretendard Variable, Pretendard, Noto Sans KR, sans-serif</span><br>
        • 유튜브/트위치 같은 외부 사이트 폰트는 적용되지 않을 수 있습니다.
      </div>

      <div style="padding:12px;border:1px solid var(--border);border-radius:12px;background:var(--white)">
        <div style="font-size:var(--fs-caption);color:var(--text3);font-weight:900;margin-bottom:8px">미리보기</div>
        <div style="display:flex;gap:10px;align-items:flex-end;flex-wrap:wrap;margin-bottom:8px">
          <div style="font-family:var(--app-font);font-size:22px;font-weight:800">가나다ABC 123</div>
          <div style="font-family:var(--app-font);font-size:14px;font-weight:400">빠른 갈색 여우가 게으른 개를 뛰어넘는다. (The quick brown fox)</div>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
          <div style="font-family:var(--app-font);font-size:14px;font-weight:400">Regular 400</div>
          <div style="font-family:var(--app-font);font-size:14px;font-weight:700">Bold 700</div>
          <div style="font-family:var(--app-font);font-size:14px;font-weight:900">Black 900</div>
        </div>
      </div>

      <div style="padding:12px;border:1px solid var(--border);border-radius:12px;background:var(--white)">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px">
          <div style="font-size:var(--fs-caption);color:var(--text3);font-weight:900">커스텀 폰트 별칭(표시 이름)</div>
          <button class="btn btn-w btn-xs" onclick="cfgRenderAppFontAliasEditor()" style="padding:4px 8px">🔄 새로고침</button>
        </div>
        <div id="cfg-appfont-alias-wrap">${(()=>{ try{ return (typeof window!=='undefined' && typeof window.cfgGetCustomFontFamilies==='function' && !window.cfgGetCustomFontFamilies().length) ? `<div style="font-size:11px;color:var(--gray-l)">커스텀 폰트가 없습니다. (CSS 직접 입력에 @font-face를 추가하면 여기에 표시됩니다)</div>` : ''; }catch(e){ return ''; } })()}</div>
        <div style="font-size:var(--fs-caption);color:var(--gray-l);margin-top:6px">※ 별칭을 저장하면 ‘프리셋/선택 드롭다운’에 표시됩니다.</div>
      </div>
    </div>
  </details>`;
  })()}
  ${(()=>{ 
    const pct = parseInt(localStorage.getItem('su_btn_scale_pct')||'100',10)||100;
    const br  = parseInt(localStorage.getItem('su_btn_r')||'8',10)||8;
    const pr  = parseInt(localStorage.getItem('su_pill_r')||'20',10)||20;
    const uiPctPc = parseInt(localStorage.getItem('su_ui_scale_pc_pct')||localStorage.getItem('su_ui_scale_pct')||'100',10)||100;
    const uiPctTb = parseInt(localStorage.getItem('su_ui_scale_tb_pct')||localStorage.getItem('su_ui_scale_pct')||'100',10)||100;
    const uiPctMb = parseInt(localStorage.getItem('su_ui_scale_mb_pct')||localStorage.getItem('su_ui_scale_pct')||'100',10)||100;
    const topTabMbFont = parseInt(localStorage.getItem('su_top_tab_font_mb_px')||'10',10)||10;
    const topTabMbGap = parseInt(localStorage.getItem('su_top_tab_gap_mb_px')||'2',10)||2;
    const topTabMbAlign = (localStorage.getItem('su_top_tab_align_mb')||'start').trim();
    return _scfgD('uibtn','🎛️ 버튼 스타일') + `
    <div style="font-size:var(--fs-sm);color:var(--gray-l);margin-bottom:10px">앱 전체 버튼/필(탭·필터) 크기와 라운드를 조절합니다.</div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r);display:flex;flex-direction:column;gap:14px">
      <div>
        <div style="font-size:var(--fs-caption);color:var(--text3);font-weight:800;margin-bottom:6px">전역 UI 배율(글자/아이콘)</div>
        <div style="display:grid;grid-template-columns:90px 1fr 52px;gap:10px;align-items:center;margin-bottom:6px">
          <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text2)">PC</div>
          <input type="range" id="cfg-uiscale-pc" min="80" max="140" step="5" value="${Math.max(80,Math.min(140,uiPctPc))}" oninput="cfgSetUiScalePct('pc',this.value)" style="width:100%">
          <div id="cfg-uiscale-pc-v" style="font-size:var(--fs-caption);color:var(--gray-l);font-weight:900;text-align:right">${Math.max(80,Math.min(140,uiPctPc))}%</div>
        </div>
        <div style="display:grid;grid-template-columns:90px 1fr 52px;gap:10px;align-items:center;margin-bottom:6px">
          <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text2)">태블릿</div>
          <input type="range" id="cfg-uiscale-tb" min="80" max="140" step="5" value="${Math.max(80,Math.min(140,uiPctTb))}" oninput="cfgSetUiScalePct('tb',this.value)" style="width:100%">
          <div id="cfg-uiscale-tb-v" style="font-size:var(--fs-caption);color:var(--gray-l);font-weight:900;text-align:right">${Math.max(80,Math.min(140,uiPctTb))}%</div>
        </div>
        <div style="display:grid;grid-template-columns:90px 1fr 52px;gap:10px;align-items:center">
          <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text2)">모바일</div>
          <input type="range" id="cfg-uiscale-mb" min="80" max="140" step="5" value="${Math.max(80,Math.min(140,uiPctMb))}" oninput="cfgSetUiScalePct('mb',this.value)" style="width:100%">
          <div id="cfg-uiscale-mb-v" style="font-size:var(--fs-caption);color:var(--gray-l);font-weight:900;text-align:right">${Math.max(80,Math.min(140,uiPctMb))}%</div>
        </div>
        <div style="font-size:var(--fs-caption);color:var(--gray-l);margin-top:4px">※ 자동(기기 폭) 스케일에 추가로 곱해집니다. (100%=기본)
          <button class="btn btn-w btn-xs" style="margin-left:8px" onclick="cfgResetUiScalePct()">초기화</button>
        </div>
      </div>
      <div style="padding:12px;border:1px solid var(--border);border-radius:12px;background:var(--white)">
        <div style="font-size:var(--fs-caption);color:var(--text3);font-weight:900;margin-bottom:8px">📱 모바일 상단 메뉴(탭)</div>
        <div style="display:grid;grid-template-columns:96px 1fr 54px;gap:10px;align-items:center;margin-bottom:8px">
          <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text2)">글자 크기</div>
          <input type="range" id="cfg-top-tab-font-mb" min="8" max="16" step="1" value="${Math.max(8,Math.min(16,topTabMbFont))}" oninput="document.getElementById('cfg-top-tab-font-mb-v').textContent=this.value+'px'" onchange="cfgSetTopTabUiSettings()" style="width:100%">
          <div id="cfg-top-tab-font-mb-v" style="font-size:var(--fs-caption);color:var(--gray-l);font-weight:900;text-align:right">${Math.max(8,Math.min(16,topTabMbFont))}px</div>
        </div>
        <div style="display:grid;grid-template-columns:96px 1fr 54px;gap:10px;align-items:center;margin-bottom:8px">
          <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text2)">탭 간격</div>
          <input type="range" id="cfg-top-tab-gap-mb" min="0" max="16" step="1" value="${Math.max(0,Math.min(16,topTabMbGap))}" oninput="document.getElementById('cfg-top-tab-gap-mb-v').textContent=this.value+'px'" onchange="cfgSetTopTabUiSettings()" style="width:100%">
          <div id="cfg-top-tab-gap-mb-v" style="font-size:var(--fs-caption);color:var(--gray-l);font-weight:900;text-align:right">${Math.max(0,Math.min(16,topTabMbGap))}px</div>
        </div>
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
          <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text2);min-width:96px">정렬</div>
          <select id="cfg-top-tab-align-mb" onchange="cfgSetTopTabUiSettings()" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px">
            <option value="start" ${topTabMbAlign==='start'?'selected':''}>좌측 시작</option>
            <option value="center" ${topTabMbAlign==='center'?'selected':''}>가운데</option>
          </select>
          <button class="btn btn-w btn-xs" onclick="cfgResetTopTabUiSettings()">초기화</button>
        </div>
        <div style="font-size:var(--fs-caption);color:var(--gray-l);margin-top:6px">※ 이 설정은 상단 메인 탭 메뉴 전용입니다. 경기 팝업 상단 카드 정렬과는 별개입니다.</div>
      </div>
      <div>
        <div style="font-size:var(--fs-caption);color:var(--text3);font-weight:800;margin-bottom:4px">버튼 크기</div>
        <input type="range" id="cfg-btnscale" min="85" max="125" step="5" value="${Math.max(85,Math.min(125,pct))}"
          oninput="document.getElementById('cfg-btnscale-v').textContent=this.value+'%'" onchange="cfgSetUiBtnStyleSettings()" style="width:100%">
        <div style="font-size:var(--fs-caption);color:var(--gray-l)"><span id="cfg-btnscale-v">${Math.max(85,Math.min(125,pct))}%</span></div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;align-items:center">
        <div>
          <div style="font-size:var(--fs-caption);color:var(--text3);font-weight:800;margin-bottom:4px">버튼 라운드</div>
          <input type="range" id="cfg-btnr" min="4" max="18" step="1" value="${Math.max(4,Math.min(18,br))}"
            oninput="document.getElementById('cfg-btnr-v').textContent=this.value+'px'" onchange="cfgSetUiBtnStyleSettings()" style="width:100%">
          <div style="font-size:var(--fs-caption);color:var(--gray-l)"><span id="cfg-btnr-v">${Math.max(4,Math.min(18,br))}px</span></div>
        </div>
        <div>
          <div style="font-size:var(--fs-caption);color:var(--text3);font-weight:800;margin-bottom:4px">필(탭/정렬) 라운드</div>
          <input type="range" id="cfg-pillr" min="12" max="28" step="1" value="${Math.max(12,Math.min(28,pr))}"
            oninput="document.getElementById('cfg-pillr-v').textContent=this.value+'px'" onchange="cfgSetUiBtnStyleSettings()" style="width:100%">
          <div style="font-size:var(--fs-caption);color:var(--gray-l)"><span id="cfg-pillr-v">${Math.max(12,Math.min(28,pr))}px</span></div>
        </div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
        <button class="btn btn-w btn-sm" onclick="cfgResetUiBtnStyleSettings()">초기화</button>
        <span style="font-size:var(--fs-caption);color:var(--gray-l)">※ 모바일에서는 터치 편의 때문에 최소 높이가 유지될 수 있습니다.</span>
      </div>
      <div style="padding:12px;border:1px solid var(--border);border-radius:12px;background:var(--white)">
        <div style="font-size:var(--fs-caption);color:var(--text3);font-weight:900;margin-bottom:8px">미리보기</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-bottom:8px">
          <button class="btn btn-b">기본</button>
          <button class="btn btn-w">화이트</button>
          <button class="btn btn-p">포인트</button>
          <button class="btn btn-r">삭제</button>
          <button class="btn btn-w btn-sm">SM</button>
          <button class="btn btn-w btn-xs">XS</button>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center">
          <button class="pill on">필 ON</button>
          <button class="pill">필 OFF</button>
          <button class="sort-btn on">정렬 ON</button>
          <button class="sort-btn">정렬</button>
        </div>
      </div>
    </div>
  </details>`;
  })()}
  ${(()=>{ 
    const lock = (localStorage.getItem('su_filter_lock_open') ?? '0') === '1';
    const enabled = (localStorage.getItem('su_submenu_filter_enabled') ?? '1') === '1';
    return _scfgD('uifilter','🔽 필터/하위메뉴') + `
    <div style="font-size:var(--fs-sm);color:var(--gray-l);margin-bottom:10px">대전기록/통계/개인전/대학대전/대회/프로리그 등의 하위메뉴 표시 방식을 설정합니다.</div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r);display:flex;flex-direction:column;gap:10px">
      <label style="display:flex;align-items:center;gap:8px;font-size:var(--fs-sm);cursor:pointer;font-weight:900;color:var(--text2)">
        <input type="checkbox" id="cfg-filter-lock" style="width:15px;height:15px" ${lock?'checked':''} onchange="cfgSetUiFilterMenuSettings()">
        필터 항상 펼치기(접기 비활성)
      </label>
      <label style="display:flex;align-items:center;gap:8px;font-size:var(--fs-sm);cursor:pointer;font-weight:900;color:var(--text2)">
        <input type="checkbox" id="cfg-submenu-filter" style="width:15px;height:15px" ${enabled?'checked':''} onchange="cfgSetUiFilterMenuSettings()">
        하위메뉴를 ‘필터’로 접기/펼치기 사용
      </label>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:6px">
        <button class="btn btn-w btn-sm" onclick="cfgResetUiFilterMenuSettings()">초기화</button>
        <span style="font-size:var(--fs-caption);color:var(--gray-l)">※ 체크 해제 시 하위 메뉴가 항상 보이게 됩니다.</span>
      </div>
    </div>
  </details>`;
  })()}
  ${(()=>{ 
    const compat = (localStorage.getItem('su_paste_compat') ?? '1') === '1';
    const fmt = (function(){
      try{
        const d={includeRace:true,includeMap:true,mapBrackets:true,winnerEmphasis:'none',hideUnknownRace:true};
        const obj=JSON.parse(localStorage.getItem('su_auto_outfmt')||'{}')||{};
        return {...d,...obj};
      }catch(e){
        return {includeRace:true,includeMap:true,mapBrackets:true,winnerEmphasis:'none',hideUnknownRace:true};
      }
    })();
    return _scfgD('paste','🤖 자동인식') + `
    <div style="font-size:var(--fs-sm);color:var(--gray-l);margin-bottom:10px">경기 결과 붙여넣기 ‘자동인식’이 잘 안 될 때 호환 옵션을 켜두면 인식률이 올라갑니다.</div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r);display:flex;flex-direction:column;gap:10px">
      <label style="display:flex;align-items:center;gap:8px;font-size:var(--fs-sm);cursor:pointer;font-weight:900;color:var(--text2)">
        <input type="checkbox" id="cfg-paste-compat" style="width:15px;height:15px" ${compat?'checked':''} onchange="cfgSetPasteCompatSettings()">
        호환 모드 (전각괄호/🆚/VS 공백 없음 등)
      </label>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:6px">
        <button class="btn btn-w btn-sm" onclick="cfgResetPasteCompatSettings()">초기화</button>
        <span style="font-size:var(--fs-caption);color:var(--gray-l)">※ 기본값 ON 권장</span>
      </div>
    </div>
    <div style="height:12px"></div>
    <div style="padding:14px;background:var(--white);border:1px solid var(--border);border-radius:var(--r)">
      <div style="font-size:var(--fs-sm);font-weight:1000;color:var(--text2);margin-bottom:8px">🎛️ 출력 포맷(전역)</div>
      <div style="font-size:var(--fs-caption);color:var(--gray-l);line-height:1.6;margin-bottom:10px">붙여넣기 자동인식/변환툴 등에서 결과를 같은 형식으로 통일합니다.</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <label style="display:flex;align-items:center;gap:8px;font-size:var(--fs-sm);cursor:pointer;font-weight:900;color:var(--text2)">
          <input type="checkbox" id="cfg-auto-outfmt-race" style="width:15px;height:15px" ${fmt.includeRace?'checked':''} onchange="cfgAutoOutfmtUpd('includeRace', this.checked)">
          종족 포함 (선수(T))
        </label>
        <label style="display:flex;align-items:center;gap:8px;font-size:var(--fs-sm);cursor:pointer;font-weight:900;color:var(--text2)">
          <input type="checkbox" id="cfg-auto-outfmt-hideN" style="width:15px;height:15px" ${fmt.hideUnknownRace?'checked':''} onchange="cfgAutoOutfmtUpd('hideUnknownRace', this.checked)">
          미정(N) 숨김
        </label>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-top:6px">
        <label style="display:flex;align-items:center;gap:8px;font-size:var(--fs-sm);cursor:pointer;font-weight:900;color:var(--text2)">
          <input type="checkbox" id="cfg-auto-outfmt-map" style="width:15px;height:15px" ${fmt.includeMap?'checked':''} onchange="cfgAutoOutfmtUpd('includeMap', this.checked)">
          맵 포함
        </label>
        <label style="display:flex;align-items:center;gap:8px;font-size:var(--fs-sm);cursor:pointer;font-weight:900;color:var(--text2)">
          <input type="checkbox" id="cfg-auto-outfmt-mapb" style="width:15px;height:15px" ${fmt.mapBrackets?'checked':''} onchange="cfgAutoOutfmtUpd('mapBrackets', this.checked)">
          맵을 [ ]로 표시
        </label>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-top:8px">
        <div style="font-size:var(--fs-sm);font-weight:900;color:var(--text2);min-width:120px">승자 강조</div>
        <select id="cfg-auto-outfmt-emph" onchange="cfgAutoOutfmtUpd('winnerEmphasis', this.value)" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px">
          <option value="none"${fmt.winnerEmphasis==='none'?' selected':''}>없음</option>
          <option value="star"${fmt.winnerEmphasis==='star'?' selected':''}>★ 표시</option>
          <option value="md"${fmt.winnerEmphasis==='md'?' selected':''}>굵게(마크다운)</option>
        </select>
        <button class="btn btn-w btn-xs" onclick="cfgAutoOutfmtReset()">초기화</button>
      </div>
      <div style="margin-top:10px;font-size:var(--fs-caption);color:var(--gray-l)">미리보기</div>
      <pre id="cfg-auto-outfmt-preview" style="margin-top:6px;white-space:pre-wrap;word-break:break-word;background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:10px 12px;font-size:var(--fs-sm);line-height:1.6;min-height:46px"></pre>
    </div>
    <div style="height:12px"></div>
    <div style="padding:14px;background:var(--white);border:1px solid var(--border);border-radius:var(--r)">
      <div style="font-size:var(--fs-sm);font-weight:1000;color:var(--text2);margin-bottom:8px">🧩 선수 별명 매핑 (자동인식 보강)</div>
      <div style="font-size:var(--fs-caption);color:var(--gray-l);line-height:1.6;margin-bottom:10px">
        예: <b>샤이니</b> → <b>김재현</b> 처럼, 붙여넣기에서 들어오는 별명을 실제 스트리머로 강제 매핑합니다.
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:flex-start;margin-bottom:10px">
        <input id="cfg-pal-alias" type="text" placeholder="별명 입력 (예: 샤이니)" style="width:150px" onkeydown="if(event.key==='Enter'){document.getElementById('cfg-pal-player-search').focus();}">
        <div style="position:relative;display:inline-block">
          <input id="cfg-pal-player-search" type="text" placeholder="스트리머 검색..." autocomplete="off"
            style="width:170px;border:1px solid var(--border2);border-radius:8px;padding:6px 10px;font-size:var(--fs-base)"
            oninput="cfgPalSearchInput(this.value)"
            onkeydown="cfgPalSearchKey(event)"
            onfocus="cfgPalSearchInput(this.value)"
            onblur="setTimeout(()=>{const d=document.getElementById('cfg-pal-dropdown');if(d)d.style.display='none';},180)">
          <input type="hidden" id="cfg-pal-player">
          <div id="cfg-pal-dropdown" style="display:none;position:absolute;top:100%;left:0;min-width:170px;max-height:200px;overflow-y:auto;background:var(--white);border:1px solid var(--border2);border-radius:8px;box-shadow:0 4px 16px rgba(0,0,0,.13);z-index:9999;margin-top:2px"></div>
        </div>
        <button class="btn btn-b btn-sm" onclick="cfgAddPlayerAlias()">+ 추가</button>
        <button class="btn btn-w btn-sm" onclick="cfgResetPlayerAliasMap()">초기화</button>
      </div>
      <div id="cfg-pal-list" style="border:1px solid var(--border);border-radius:var(--r);max-height:220px;overflow:auto;background:var(--surface);padding:10px"></div>
    </div>
    <div style="padding:14px;background:var(--white);border:1px solid var(--border);border-radius:var(--r)">
      <div style="font-size:var(--fs-sm);font-weight:1000;color:var(--text2);margin-bottom:8px">🔁 변환툴 (리포트 포맷)</div>
      <div style="font-size:var(--fs-caption);color:var(--gray-l);line-height:1.6;margin-bottom:10px">
        가공되지 않은 텍스트를 붙여넣으면 아래 규칙으로 변환합니다: <b>승자 굵게</b> · ✅/⬜ · 🆚️ · 맵 약어 교정 · 최종 스코어 출력
      </div>
      <textarea id="cfg-paste-conv-in" rows="7" placeholder="여기에 원본 경기 텍스트를 붙여넣기..." style="width:100%;border:1.5px solid var(--border);border-radius:var(--r);padding:10px 12px;font-size:var(--fs-sm);line-height:1.6;resize:vertical;background:var(--surface);color:var(--text1);box-sizing:border-box"></textarea>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">
        <button class="btn btn-b btn-sm" onclick="cfgPasteConvertRun()">변환</button>
        <button class="btn btn-w btn-sm" onclick="cfgPasteConvertCopy()">복사</button>
      </div>
      <pre id="cfg-paste-conv-out" style="margin-top:12px;white-space:pre-wrap;word-break:break-word;background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:12px;font-size:var(--fs-sm);line-height:1.6;min-height:70px"></pre>
    </div>
  </details>`;
  })()}
  `;
}
