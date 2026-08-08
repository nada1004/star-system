// settings-render.js에서 분리됨 (설정 탭 렌더링 — GitHub동기화/AI봇/시즌/팀매치/일괄편집/데이터동기화/이미지탭레이아웃/펨코)
function _cfgSecGroup3(ctx){
  const {isLoggedIn,isSubAdmin,_escHTML,_escJS,_escAttr,esc,_players,localStorage,notices,univCfg,_catSecs,_cfgCats,_cfgCatIcons,_catLabel,_cfgCatDesc,_cfgSecTitle,typeOpts,_curSecs,_regBtn,_menuBtn,_afOn,_rcOn,_rcAccent,_rcBg,_rcHd,_rcIc,_rcUnivFont,_ymScale,_rcMemoOn,_sfxOn,_sfxMode,_sfxInt,_sfxLen,_sfxTail,_sfxSoft,_sfxEdge,_avaScale,_mvpFxOn,_mvpFxStyle,_mvpFxIntensity,_mvpDesignMode,_briefingTheme,_cfgSecDescFallback,_cfgSecDesc,_getCfgSecDesc,_secButtons,_catCardAccents,_catCardsHtml,_secBtnColors,_secBtnIcColors,_secButtonsHtml,_cfgHeroStats,_cfgHeroStatsHtml} = ctx;
  return `${_scfgD('firebase','☁️ GitHub(깃허브) data.json 동기화')}
    <div id="cfg-fb-body">
    <p style="font-size:var(--fs-sm);color:var(--gray-l);margin-bottom:12px">관리자가 데이터를 저장할 때 GitHub <code>star-datacenter/data/</code> 폴더에 분리 저장됩니다. 다른 기기는 인덱스를 읽고 필요한 파일들을 합쳐 반영합니다.</p>
    <div style="margin-bottom:10px;padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:8px">
      <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text2);margin-bottom:6px">설정 변경 GitHub 자동 반영</div>
      <div style="font-size:var(--fs-caption);color:var(--gray-l);line-height:1.6;margin-bottom:10px">
        기본값은 <b>ON</b>입니다. 경기 기록 저장, 경기 수정, 스트리머/대학 상세 수정, 설정탭 설정 변경은 GitHub에도 반영되고, <b>새로고침만으로는 저장되지 않게</b> 유지합니다.
      </div>
      <label style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
        <input type="checkbox" ${(localStorage.getItem('su_cfg_remote_auto') ?? '1')==='1'?'checked':''} onchange="cfgSetRemoteCfgAuto(this.checked)">
        <span style="font-size:var(--fs-sm);font-weight:700;color:var(--text2)">설정 변경 시 GitHub에도 자동 반영</span>
      </label>
      <div id="cfg-remote-auto-status" style="font-size:var(--fs-caption);margin-top:8px;color:${(localStorage.getItem('su_cfg_remote_auto') ?? '1')==='1'?'#16a34a':'var(--gray-l)'}">${(localStorage.getItem('su_cfg_remote_auto') ?? '1')==='1'?'ON · 설정/상세 수정은 GitHub에도 반영, 새로고침만으로는 저장되지 않음':'OFF · 설정 변경은 로컬만 저장'}</div>
    </div>
    <div id="cfg-fb-sync-panel" style="margin-bottom:12px;padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r)">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;flex-wrap:wrap;gap:8px">
        <span style="font-size:var(--fs-sm);font-weight:700;color:var(--blue)">🔄 동기화 상태</span>
        <button class="btn btn-w btn-xs" onclick="checkFbSyncStatus()">🔍 지금 확인</button>
      </div>
      <div id="cfg-fb-sync-result" style="font-size:var(--fs-sm);color:var(--gray-l)">확인 버튼을 눌러 상태를 확인하세요.</div>
    </div>
    <div style="margin-bottom:10px;padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:8px">
      <div style="font-size:var(--fs-sm);font-weight:700;color:var(--blue);margin-bottom:8px">보조 신호 비밀번호</div>
      <div style="font-size:var(--fs-caption);color:var(--gray-l);margin-bottom:10px">실제 데이터 원본은 GitHub에 저장하고, 보조 신호 채널은 다른 기기에 <b>새 데이터 신호</b>를 더 빨리 전달하는 용도로만 사용합니다.</div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <input type="password" id="cfg-fb-pw" placeholder="보조 신호 비밀번호 입력..." style="width:220px" autocomplete="new-password">
        <button class="btn btn-b" onclick="saveFbPw()">💾 저장</button>
        <button class="btn btn-r btn-xs" onclick="clearFbPw()">지우기</button>
      </div>
      <div id="fb-pw-status" style="font-size:var(--fs-sm);margin-top:8px;min-height:16px;color:var(--gray-l)">${localStorage.getItem('su_fb_pw')?'✅ 보조 신호 비밀번호 설정됨':'미설정'}</div>
    </div>
    <div style="margin-bottom:10px;padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:8px">
      <div style="font-size:var(--fs-sm);font-weight:700;color:#16a34a;margin-bottom:8px">GitHub 토큰 (관람자 수천 명 무료 지원)</div>
      <div style="font-size:var(--fs-caption);color:var(--gray-l);margin-bottom:6px">설정 시: 동기화 섹션의 수동 업로드 버튼으로 GitHub <code>star-datacenter/data/</code> 아래 인덱스/코어/월별 기록 파일을 올릴 수 있습니다. 다른 기기/관람자는 이를 합쳐 반영합니다.</div>
      <div style="font-size:var(--fs-caption);color:var(--gray-l);margin-bottom:4px">권장: GitHub → Settings → Developer settings → Personal access tokens → Fine-grained token 사용. 대상 저장소는 <code>nada1004/star-system</code>, 권한은 <code>Contents: Read and Write</code>만 부여.</div>
      <div style="font-size:var(--fs-caption);color:var(--gray-l);margin-bottom:10px">Classic PAT의 <code>repo</code> 전체 권한은 사용하지 마세요.</div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <input type="password" id="cfg-gh-token" placeholder="ghp_xxxxxxxxxxxx" style="width:260px" autocomplete="new-password">
        <button class="btn btn-b" onclick="saveGhToken()">💾 저장</button>
        <button class="btn btn-r btn-xs" onclick="clearGhToken()">지우기</button>
      </div>
      <div id="gh-token-status" style="font-size:var(--fs-sm);margin-top:8px;min-height:16px;color:var(--gray-l)">${localStorage.getItem('su_gh_token')?'✅ 토큰 설정됨 (수동 GitHub 업로드 가능)':'미설정 (GitHub 저장 불가, 로컬만 저장)'}</div>
    </div>
    </div>
  </details>
  ${_scfgD('aibot','🤖 AI봇(Groq) 서버 설정')}
    <div style="font-size:var(--fs-sm);color:var(--gray-l);line-height:1.6;margin-bottom:10px">
      펨붕이봇(AI봇)은 기본적으로 <code>/api/aibot</code> 프록시 서버가 필요합니다.<br>
      관리자 전용으로 <b>API Key를 직접 입력</b>해서 사용할 수도 있습니다. (동기화 ON이면 다른 기기에도 적용)
    </div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r)">
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:8px">
        <label style="font-size:var(--fs-sm);font-weight:800;color:var(--text2)">AI봇 서버 주소</label>
        <input id="cfg-ai-proxy-url" type="text" placeholder="예: http://내서버:3000" style="width:320px;max-width:100%">
        <button class="btn btn-b btn-sm" onclick="cfgSaveAiProxyUrl()">💾 저장</button>
        <button class="btn btn-w btn-sm" onclick="cfgTestAiProxy()">🔍 테스트</button>
      </div>
      <div style="font-size:var(--fs-caption);color:var(--gray-l)">※ 저장 후 (관리자+동기화 ON이면) 다른 기기에도 자동 반영됩니다.</div>
      <div id="cfg-ai-proxy-status" style="font-size:var(--fs-sm);margin-top:8px;min-height:16px;color:var(--blue)"></div>
    </div>
    <div style="height:10px"></div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r)">
      <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text2);margin-bottom:6px">Groq API Key (관리자 전용)</div>
      <div style="font-size:var(--fs-caption);color:var(--gray-l);line-height:1.6;margin-bottom:10px">
        • 키를 저장하면 서버 없이도 AI봇을 바로 호출할 수 있습니다.<br>
        • <b>동기화 ON</b>이면 다른 기기에도 반영됩니다. (다른 기기에서 토큰이 없어도 pull로 받아옵니다)<br>
        • 주의: 이 경우 Gist를 아는 사람이면 키를 볼 수 있어 <b>유출 위험</b>이 있습니다.
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
        <input type="password" id="cfg-ai-api-key" placeholder="gsk_..." style="width:320px;max-width:100%" autocomplete="new-password">
        <button class="btn btn-b btn-sm" onclick="cfgSaveAiApiKey()">💾 저장</button>
        <button class="btn btn-r btn-xs" onclick="cfgClearAiApiKey()">지우기</button>
      </div>
      <div id="cfg-ai-key-status" style="font-size:var(--fs-sm);margin-top:8px;min-height:16px;color:var(--gray-l)"></div>
    </div>
  </details>
  ${_scfgD('season','🏆 시즌 관리','id="cfg-season-sec"')}
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
  ${_scfgD('teammatch','👥 팀 매치 설정 (2:2 / 3:3 / 4:4전)')}
    <div style="font-size:var(--fs-sm);color:var(--gray-l);margin-bottom:12px">붙여넣기 자동 인식 및 경기 입력에서 팀 매치(2:2·3:3·4:4전)를 지원합니다.</div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r);display:flex;flex-direction:column;gap:14px">
      <div>
        <div style="font-size:var(--fs-sm);font-weight:700;color:var(--text2);margin-bottom:8px">⚙️ 기본 팀 규모</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          ${['1v1','2v2','3v3','4v4'].map(t=>`<button class="pill ${(localStorage.getItem('su_teamMatchSize')||'1v1')===t?'on':''}" id="cfg-tm-${t.replace(':','')}" onclick="localStorage.setItem('su_teamMatchSize','${t}');document.querySelectorAll('[id^=cfg-tm-]').forEach(b=>b.classList.remove('on'));this.classList.add('on');try{if(typeof window.cfgTouchPrefsSync==='function')window.cfgTouchPrefsSync();}catch(e){}">${t}전</button>`).join('')}
        </div>
        <div style="font-size:var(--fs-caption);color:var(--gray-l);margin-top:6px">경기 입력 모달에서 사용할 기본 팀 규모 (기본: 1v1)</div>
      </div>
      <div>
        <div style="font-size:var(--fs-sm);font-weight:700;color:var(--text2);margin-bottom:6px">📋 자동인식 형식 안내</div>
        <div style="background:var(--white);border:1px solid var(--border);border-radius:8px;padding:10px 12px;font-size:var(--fs-caption);color:var(--text2);line-height:2">
          <div>• <code>선수A+선수B 승 선수C+선수D</code> → 2:2전 승리</div>
          <div>• <code>선수A+선수B+선수C 승 선수D+선수E+선수F</code> → 3:3전</div>
          <div>• <code>선수A+선수B > 선수C+선수D [맵명]</code> → 맵 포함</div>
          <div style="color:var(--gray-l);margin-top:4px">※ 붙여넣기 모달에서 "+" 기호로 팀원을 연결하면 자동 인식됩니다.</div>
        </div>
      </div>
    </div>
  </details>
    ${_scfgD('bulkdate','📅 날짜 일괄 변경')}
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
  </details>
  ${_scfgD('bulkmap','🗺️ 맵 이름 일괄 교체')}
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r)">
      <div style="font-size:var(--fs-caption);color:var(--gray-l);margin-bottom:8px">※ 띄어쓰기 차이(예: 투혼 II ↔ 투혼II)는 자동으로 무시하고 교체됩니다.</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:8px">
        <label style="font-size:var(--fs-sm);font-weight:600;color:var(--text2)">교체 전</label>
        <input type="text" id="bulk-map-from" placeholder="예: 투혼II" style="font-size:var(--fs-sm);width:120px">
        <label style="font-size:var(--fs-sm);font-weight:600;color:var(--text2)">→ 교체 후</label>
        <input type="text" id="bulk-map-to" placeholder="예: 투혼" style="font-size:var(--fs-sm);width:120px">
      </div>
      <button class="btn btn-w btn-sm" onclick="previewBulkChangeMap()">미리보기</button>
      <button class="btn btn-b btn-sm" onclick="bulkChangeMap()">🗺️ 맵 일괄 교체</button>
      <span id="bulk-map-result" style="font-size:var(--fs-sm);margin-left:8px;color:var(--green)"></span>
    </div>
  </details>
  ${_scfgD('bulktier','🎖️ 선수 일괄 티어 변경')}
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
  </details>
  ${_scfgD('bulkdel','🗑️ 날짜 범위 일괄 삭제')}
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
  </details>
  ${_scfgD('bulkconv','🔄 세트제 → 게임수 합산 일괄 변환')}
    <div style="padding:14px;background:#fefce8;border:1px solid #fde68a;border-radius:var(--r)">
      <div style="font-size:var(--fs-caption);color:var(--text3);margin-bottom:10px">
        sets 배열 기준으로 점수를 다시 계산합니다.<br>
        • <b>게임수(경기제)</b>: 각 세트의 scoreA/scoreB 합산<br>
        • <b>세트승(세트제)</b>: 각 세트의 winner(A/B) 개수 합산
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">
        <label style="font-size:var(--fs-caption);font-weight:600;color:var(--text3)">대상:</label>
        ${['mini','univm','ck','pro','tt'].map(m=>`
        <label style="display:inline-flex;align-items:center;gap:3px;font-size:var(--fs-caption);cursor:pointer">
          <input type="checkbox" id="bulk-conv-chk-${m}" checked style="cursor:pointer">
          ${{ mini:'미니대전', univm:'대학대전', ck:'CK', pro:'프로리그', tt:'티어대회' }[m]}
        </label>`).join('')}
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
        <button class="btn btn-b btn-sm" onclick="bulkConvertToGameScore()">🔄 게임수 합산으로 변환</button>
        <button class="btn btn-b btn-sm" onclick="bulkConvertToSetScore()">🔄 세트승으로 변환</button>
        <button class="btn btn-p btn-sm" onclick="bulkRecalcScoreByMode()">🧩 저장형식대로 재계산</button>
        <span id="bulk-conv-result" style="font-size:var(--fs-sm);color:var(--blue)"></span>
        <span id="bulk-conv2-result" style="font-size:var(--fs-sm);color:var(--blue)"></span>
        <span id="bulk-conv3-result" style="font-size:var(--fs-sm);color:var(--blue)"></span>
      </div>
    </div>
  </details>
  ${_scfgD('boardbg','🖼️ 현황판 라벨 배경 이미지별 설정')}
    <p style="font-size:var(--fs-sm);color:var(--gray-l);margin-bottom:12px">각 대학 라벨에 배경 이미지를 설정할 수 있습니다. 이미지 위치와 크기도 조절 가능합니다.</p>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r);margin-bottom:14px">
      <div style="display:flex;gap:8px;align-items:center">
        <label style="font-size:var(--fs-sm);font-weight:600;color:var(--text2);min-width:140px">🔆 대학 배경 밝기(전체):</label>
        <input type="range" id="cfg-b2-bgimg-alpha" min="0" max="100" value="${b2BgImgAlpha}" style="flex:1;accent-color:var(--blue)"
          oninput="document.getElementById('cfg-b2-bgimg-alpha-val').textContent=this.value+'%';clearTimeout(window._b2ImgAlphaLiveT);window._b2ImgAlphaLiveT=setTimeout(()=>{if(typeof setBoardBgAlphaGlobal==='function')setBoardBgAlphaGlobal(this.value,true);},120)">
        <span style="font-size:var(--fs-caption);color:var(--gray-l);min-width:34px;text-align:right;font-weight:700" id="cfg-b2-bgimg-alpha-val">${b2BgImgAlpha}%</span>
      </div>
      <div style="font-size:var(--fs-caption);color:var(--gray-l);margin-top:8px">모든 대학(로고형 배경 포함)이 같은 밝기값을 사용합니다. 특정 대학만 다르게 하려면 아래 목록에서 개별 설정하세요.</div>
    </div>
    <div id="cfg-board-bg-list" style="max-height:400px;overflow-y:auto"></div>
  </details>
  ${_scfgD('sync','🔄 데이터 동기화')}
    <div style="font-size:var(--fs-sm);color:var(--gray-l);margin-bottom:10px">경기 기록을 각 탭 기록 및 스트리머 최근 경기에 반영합니다.</div>
    <div style="display:flex;flex-direction:column;gap:10px;padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r)">
      <div style="padding:12px;background:var(--white);border:1px solid var(--border);border-radius:12px">
        <div style="font-weight:1000;font-size:var(--fs-sm);margin-bottom:6px">📦 설정 내보내기/가져오기 (다른 기기 적용)</div>
        <div style="font-size:var(--fs-caption);color:var(--gray-l);margin-bottom:8px">설정만 코드로 복사해 다른 기기(모바일/태블릿/PC)에 붙여넣어 적용할 수 있습니다. (경기 데이터는 포함 안됨)</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">
          <button class="btn btn-w btn-sm" onclick="cfgFillSettingsCode()">코드 생성</button>
          <button class="btn btn-w btn-sm" onclick="cfgCopySettingsCode()">복사</button>
          <button class="btn btn-b btn-sm" onclick="cfgImportSettingsCode()">이 기기에 적용</button>
        </div>
        <textarea id="cfg-sync-code" placeholder="여기에 코드가 표시됩니다 (또는 다른 기기에서 복사한 코드를 붙여넣으세요)" style="width:100%;min-height:90px;border:1px solid var(--border2);border-radius:var(--r);padding:10px;font-size:var(--fs-sm);font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono','Courier New',monospace;resize:vertical"></textarea>
      </div>
      <div style="padding:12px;background:var(--white);border:1px solid var(--border);border-radius:12px">
        <div style="font-weight:1000;font-size:var(--fs-sm);margin-bottom:6px">☁️ 설정/메모 동기화 (GitHub Gist)</div>
        <div style="font-size:var(--fs-caption);color:var(--gray-l);margin-bottom:10px">
          Gist ID만 있으면 다른 기기에서 불러오기가 가능합니다. 저장(업로드)은 관리자+토큰이 필요합니다. (이전 파일은 자동 마이그레이션)
        </div>
        <div id="cfg-gist-sync-status" style="font-size:var(--fs-sm);color:var(--text2);background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:10px 12px;line-height:1.6">
          동기화 상태를 불러오는 중...
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:10px">
          <label style="font-size:var(--fs-sm);font-weight:800;color:var(--text2)">Gist ID</label>
          <input id="cfg-gist-id" type="text" placeholder="예: a1b2c3d4..." style="width:240px;max-width:100%">
          ${(!isSubAdmin?`<label style="display:inline-flex;align-items:center;gap:6px;font-size:var(--fs-sm);font-weight:800;color:var(--text2);cursor:pointer"><input id="cfg-gist-enabled" type="checkbox"> 동기화 ON</label>`:'')}
          ${(!isSubAdmin?`<input id="cfg-gist-token" type="password" placeholder="GitHub 토큰(gist)" style="width:220px;max-width:100%" autocomplete="new-password">`:'')}
          ${(!isSubAdmin?`<button class="btn btn-b btn-sm" onclick="cfgGistSyncSaveCfg()">💾 저장</button>`:`<button class="btn btn-w btn-sm" onclick="cfgGistSyncSaveCfg()">💾 저장</button>`)}
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:10px">
          <button class="btn btn-w btn-sm" onclick="cfgGistSyncPull()">⬇️ 원격 불러오기</button>
          ${(!isSubAdmin?`<button class="btn btn-b btn-sm" onclick="cfgGistSyncPush()">⬆️ 원격 저장</button>`:'')}
          ${(!isSubAdmin?`<label style="display:inline-flex;align-items:center;gap:6px;font-size:var(--fs-sm);font-weight:800;color:var(--text2);cursor:pointer;margin-left:6px">
            <input id="cfg-gist-auto-push" type="checkbox" ${(window.SettingsStore && window.SettingsStore.getPrefsAutoPush && window.SettingsStore.getPrefsAutoPush())?'checked':''}
              onchange="cfgGistSyncSetAutoPush(this.checked)"> 설정 변경 시 자동 저장</label>`:'')}
          <span id="cfg-gist-sync-msg" style="font-size:var(--fs-caption);color:var(--gray-l)"></span>
        </div>
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <button class="btn btn-b btn-sm" onclick="
          try{
            window._ttMigrated=false;
            if(typeof window._migrateTierTourneys==='function') window._migrateTierTourneys();
            const n=(typeof window.syncAllHistory==='function')?window.syncAllHistory():0;
            alert('✅ 티어대회 기록 동기화 + '+n+'건 스트리머 반영 완료');
            if(typeof window.render==='function') window.render();
          }catch(e){
            alert('동기화 실패: '+String(e));
          }">🔄 전체 동기화 (기록탭 + 스트리머)</button>
        <span style="font-size:var(--fs-caption);color:var(--gray-l)">티어대회 기록탭·대전기록 반영 + 스트리머 최근 경기 소급 반영</span>
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <button class="btn btn-p btn-sm" onclick="
          try{
            window._ttMigrated=false;
            if(typeof window._migrateTierTourneys==='function') window._migrateTierTourneys();
            if(typeof window.ttM==='undefined' || !Array.isArray(window.ttM)) window.ttM=[];
            const before=window.ttM.length;
            if(typeof window.save==='function') window.save();
            if(typeof window.render==='function') window.render();
            alert('✅ 티어대회 기록 동기화 완료\\n추가된 기록: '+(window.ttM.length-before)+'건');
          }catch(e){
            alert('동기화 실패: '+String(e));
          }">🎯 티어대회 기록 동기화</button>
        <span style="font-size:var(--fs-caption);color:var(--gray-l)">조별리그·토너먼트 경기를 기록탭·대전기록에 반영 (누락 시 사용)</span>
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <button class="btn btn-b btn-sm" onclick="syncAllHistoryBtn()">📋 스트리머 최근 경기 반영</button>
        <span style="font-size:var(--fs-caption);color:var(--gray-l)">모든 경기를 스트리머 상세의 최근 경기에 소급 반영</span>
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <button class="btn btn-w btn-sm" onclick="
          try{
            if(typeof window.ttM==='undefined' || !Array.isArray(window.ttM)) window.ttM=[];
            const seen=new Set();let removed=0;
            window.ttM=window.ttM.filter(m=>{if(!m||!m._id)return true;if(seen.has(m._id)){removed++;return false;}seen.add(m._id);return true;});
            if(typeof window.save==='function') window.save();
            if(typeof window.render==='function') window.render();
            alert('✅ ttM 중복 제거 완료: '+removed+'건 삭제');
          }catch(e){
            alert('중복 제거 실패: '+String(e));
          }
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
  ${_scfgD('b2layout','📐 이미지탭 레이아웃')}
    <div style="font-size:var(--fs-sm);color:var(--gray-l);margin-bottom:10px">이미지탭(프로필 탭)의 좌우 비율과 높이를 설정합니다. 조절하면 바로 반영됩니다.</div>
    <div style="font-size:var(--fs-caption);color:var(--blue);font-weight:700;margin-bottom:6px">✓ 실시간 미리보기</div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r);display:flex;flex-direction:column;gap:14px">
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <button class="btn btn-b" onclick="cfgAutoFitBoard()">📱 이미지탭 자동 맞춤(원클릭)</button>
        <span style="font-size:var(--fs-caption);color:var(--gray-l)">※ “전역 자동 맞춤(모든 탭)”과 별개로, <b>이미지탭(프로필)</b> 전용 프리셋입니다.</span>
      </div>
      <div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
          <label style="font-size:var(--fs-sm);font-weight:700;color:var(--text2)">좌측(이미지) 너비</label>
          <span id="cfg-b2-left-size-val" style="font-size:var(--fs-sm);font-weight:700;color:var(--blue)">55%</span>
        </div>
        <input type="range" id="cfg-b2-left-size" min="30" max="70" step="1" value="55" style="width:100%;accent-color:var(--blue)"
          oninput="this.value=Math.min(70,Math.max(30,this.value));document.getElementById('cfg-b2-left-size-val').textContent=this.value+'%';document.getElementById('cfg-b2-right-size').value=100-parseInt(this.value);document.getElementById('cfg-b2-right-size-val').textContent=(100-parseInt(this.value))+'%';clearTimeout(window._b2LayoutLiveT);window._b2LayoutLiveT=setTimeout(()=>{if(typeof saveB2LayoutSettings==='function')saveB2LayoutSettings(true);},150)">
        <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--gray-l);margin-top:2px"><span>30%</span><span>70%</span></div>
      </div>
      <div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
          <label style="font-size:var(--fs-sm);font-weight:700;color:var(--text2)">우측(목록) 너비</label>
          <span id="cfg-b2-right-size-val" style="font-size:var(--fs-sm);font-weight:700;color:var(--blue)">45%</span>
        </div>
        <input type="range" id="cfg-b2-right-size" min="30" max="70" step="1" value="45" style="width:100%;accent-color:var(--blue)"
          oninput="this.value=Math.min(70,Math.max(30,this.value));document.getElementById('cfg-b2-right-size-val').textContent=this.value+'%';document.getElementById('cfg-b2-left-size').value=100-parseInt(this.value);document.getElementById('cfg-b2-left-size-val').textContent=(100-parseInt(this.value))+'%';clearTimeout(window._b2LayoutLiveT);window._b2LayoutLiveT=setTimeout(()=>{if(typeof saveB2LayoutSettings==='function')saveB2LayoutSettings(true);},150)">
        <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--gray-l);margin-top:2px"><span>30%</span><span>70%</span></div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <div>
          <label style="font-size:var(--fs-sm);font-weight:700;color:var(--text2);display:block;margin-bottom:4px">PC 높이 <span style="font-weight:400;color:var(--gray-l)">(px)</span></label>
          <input type="number" id="cfg-b2-pc-height" value="600" min="400" max="900" step="20" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:var(--fs-base);font-weight:700" oninput="clearTimeout(window._b2LayoutLiveT);window._b2LayoutLiveT=setTimeout(()=>{if(typeof saveB2LayoutSettings==='function')saveB2LayoutSettings(true);},150)">
        </div>
        <div>
          <label style="font-size:var(--fs-sm);font-weight:700;color:var(--text2);display:block;margin-bottom:4px">태블릿 높이 <span style="font-weight:400;color:var(--gray-l)">(px)</span></label>
          <input type="number" id="cfg-b2-tablet-height" value="400" min="300" max="700" step="20" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:var(--fs-base);font-weight:700" oninput="clearTimeout(window._b2LayoutLiveT);window._b2LayoutLiveT=setTimeout(()=>{if(typeof saveB2LayoutSettings==='function')saveB2LayoutSettings(true);},150)">
        </div>
        <div>
          <label style="font-size:var(--fs-sm);font-weight:700;color:var(--text2);display:block;margin-bottom:4px">모바일 높이 <span style="font-weight:400;color:var(--gray-l)">(px)</span></label>
          <input type="number" id="cfg-b2-mobile-height" value="320" min="200" max="600" step="20" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:var(--fs-base);font-weight:700" oninput="clearTimeout(window._b2LayoutLiveT);window._b2LayoutLiveT=setTimeout(()=>{if(typeof saveB2LayoutSettings==='function')saveB2LayoutSettings(true);},150)">
        </div>
        <div style="display:flex;align-items:flex-end;padding-bottom:4px">
          <div style="display:flex;flex-direction:column;gap:8px">
            <label style="display:flex;align-items:center;gap:6px;font-size:var(--fs-sm);cursor:pointer;font-weight:700">
              <input type="checkbox" id="cfg-b2-auto-resize" checked style="width:15px;height:15px" onchange="if(typeof saveB2LayoutSettings==='function')saveB2LayoutSettings(true)"> 자동 크기 조절(좌우 비율)
            </label>
            <label style="display:flex;align-items:center;gap:6px;font-size:var(--fs-sm);cursor:pointer;font-weight:700">
              <input type="checkbox" id="cfg-b2-auto-height" checked style="width:15px;height:15px" onchange="if(typeof saveB2LayoutSettings==='function')saveB2LayoutSettings(true)"> 모바일/태블릿 높이 자동 맞춤(추천)
            </label>
          </div>
        </div>
      </div>
      <button class="btn btn-b" onclick="saveB2LayoutSettings()" style="align-self:flex-start">💾 레이아웃 저장</button>
    </div>
  </details>
  ${_scfgD('femcoorder','🔀 펨코스타일 스타대학 순서')}
    <div style="font-size:var(--fs-sm);color:var(--gray-l);margin-bottom:10px;line-height:1.6">
      <b>펨코스타일</b> 및 <b>대학별 신현황판</b>에서 대학이 표시되는 순서(= <code>univCfg</code> 순서)를 조정합니다.<br>
      ※ 순서 변경 즉시 저장되며, 현황판에 바로 반영됩니다.
    </div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r)">
      ${(univCfg||[]).map((u,idx)=>({u,idx})).filter(x=>x.u && !x.u.dissolved).map(({u,idx:i})=>`
        <div class="srow" style="gap:8px;align-items:center;flex-wrap:wrap">
          <div class="cdot" style="background:${u.color||'#64748b'}"></div>
          <div style="flex:1;min-width:140px;font-weight:900;color:var(--text2)">${esc(u.name||'')}</div>
          <div style="display:flex;gap:6px;flex-shrink:0">
            <button class="btn btn-w btn-xs" onclick="cfgUnivOrderMove(${i},'up')">▲</button>
            <button class="btn btn-w btn-xs" onclick="cfgUnivOrderMove(${i},'down')">▼</button>
          </div>
        </div>
      `).join('')}
      <div style="font-size:var(--fs-caption);color:var(--gray-l);margin-top:8px">팁: ‘대학 관리’에서 대학명/색상도 함께 수정할 수 있습니다.</div>
    </div>
  </details>
  ${_scfgD('b2femco','🧩 펨코스타일 설정')}
    <div style="font-size:var(--fs-sm);color:var(--gray-l);margin-bottom:10px">현황판 &gt; <b>펨코스타일</b> 탭에서 사용하는 전용 설정입니다. 저장 즉시 반영됩니다.</div>
    <div style="padding:0;display:flex;flex-direction:column;gap:8px">
    <details class="cfg-grp" open style="border:1px solid var(--border);border-radius:10px;overflow:hidden">
      <summary style="cursor:pointer;display:flex;align-items:center;gap:8px;padding:10px 12px;background:var(--surface);font-weight:900;font-size:var(--fs-sm);color:var(--text2)">⚙️ 기본 레이아웃 · 로고 크기</summary>
      <div style="padding:12px;display:flex;flex-direction:column;gap:12px">
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
        <label style="display:flex;align-items:center;gap:8px;font-size:var(--fs-sm);cursor:pointer;font-weight:900;color:var(--text2)">
          <input type="checkbox" id="cfg-femco-autoLayout" style="width:15px;height:15px" onchange="cfgFemcoUpd('autoLayout', this.checked?1:0)">
          인원수/화면폭에 맞춰 자동 레이아웃(추천)
        </label>
        <button class="btn btn-w btn-xs" style="margin-left:auto" onclick="(function(){cfgFemcoUpd('autoLayout',1);try{document.getElementById('cfg-femco-autoLayout').checked=true;}catch(e){};alert('✅ 자동 레이아웃으로 되돌렸습니다');render();})()">🔄 자동으로 되돌리기</button>
        <span style="font-size:var(--fs-caption);color:var(--gray-l)">※ 아래 수동 값을 조절하면 자동 레이아웃이 자동으로 꺼집니다</span>
      </div>
      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:var(--fs-sm);font-weight:700;color:var(--text2)">대학 로고 크기</div>
        <input type="range" id="cfg-femco-logoSize" min="60" max="520" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-logoSizeNum').value=this.value;cfgFemcoUpd('logoSize',this.value)">
        <input type="number" id="cfg-femco-logoSizeNum" min="60" max="520" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:var(--fs-base);font-weight:700" onchange="document.getElementById('cfg-femco-logoSize').value=this.value;cfgFemcoUpd('logoSize',this.value)">
      </div>
      <!-- (버그픽스) 설정 모달에서 summary 클릭 시 바깥 클릭으로 인식되어 팝업이 닫히는 케이스가 있어 이벤트 전파 차단 -->
      <details style="border:1px dashed var(--border2);border-radius:12px;padding:10px 12px;background:var(--white)" onclick="event.stopPropagation()">
        <summary style="cursor:pointer;font-weight:900;color:var(--text2);list-style:none" onclick="event.stopPropagation()">🏫 대학별 로고 크기 (펨코스타일) <span style="font-size:var(--fs-caption);color:var(--gray-l);font-weight:600">(선택)</span></summary>
        <div style="font-size:var(--fs-caption);color:var(--gray-l);margin:8px 0 10px;line-height:1.6">
          위의 “대학 로고 크기”가 <b>기본(공통)</b>이고, 아래는 대학별로 <b>예외값</b>을 줄 때만 사용합니다.<br>
          초기화하면 공통값을 따릅니다.
        </div>
        <div style="display:flex;flex-direction:column;gap:10px">
          ${(univCfg||[]).map((u,idx)=>({u,idx})).filter(x=>x.u && !x.u.dissolved).map(({u,idx:i})=>{
            const _v = parseInt(u.logoSizeFemco||'',10);
            const cur = isNaN(_v) ? '' : Math.max(60, Math.min(520,_v));
            return `
              <div class="srow" style="gap:10px;align-items:center;flex-wrap:wrap">
                <div class="cdot" style="background:${u.color||'#64748b'}"></div>
                <div style="flex:1;min-width:120px;font-weight:900;color:var(--text2)">${esc(u.name||'')}</div>
                <input type="range" min="60" max="520" step="1" value="${cur||(()=>{try{return Math.max(60,Math.min(520,parseInt((J('su_femco_settings')||{}).logoSize||150,10)||150));}catch(e){return 150;}})()}" style="flex:1;min-width:180px;accent-color:var(--blue)"
                  oninput="univCfg[${i}].logoSizeFemco=+this.value;saveCfg();try{this.parentElement.querySelector('span').textContent=this.value+'px';}catch(e){};try{window._cfgSoftRefreshLive&&window._cfgSoftRefreshLive();}catch(e){}">
                <span style="font-size:var(--fs-caption);color:var(--gray-l);min-width:52px;font-weight:900">${cur?cur+'px':'(기본)'}</span>
                <button class="btn btn-w btn-xs" onclick="delete univCfg[${i}].logoSizeFemco;saveCfg();try{const p=this.parentElement;const r=p.querySelector('input[type=range]');if(r)r.value='150';const s=p.querySelector('span');if(s)s.textContent='(기본)';}catch(e){};try{window._cfgSoftRefreshLive&&window._cfgSoftRefreshLive();}catch(e){}">초기화</button>
              </div>
            `;
          }).join('')}
        </div>
      </details>

      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:var(--fs-sm);font-weight:700;color:var(--text2)">배경 크기(%)</div>
        <input type="range" id="cfg-femco-bgLogoPct" min="10" max="220" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-bgLogoPctNum').value=this.value;cfgFemcoUpd('bgLogoPct',this.value)">
        <input type="number" id="cfg-femco-bgLogoPctNum" min="10" max="220" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:var(--fs-base);font-weight:700" onchange="document.getElementById('cfg-femco-bgLogoPct').value=this.value;cfgFemcoUpd('bgLogoPct',this.value)">
      </div>
      <div style="font-size:var(--fs-caption);color:var(--gray-l);margin-top:-6px">로고형 배경(대학 로고 배경) 크기 기본값입니다. 100 = 카드 가로 100%</div>
      <details style="border:1px dashed var(--border2);border-radius:12px;padding:10px 12px;background:var(--white)" onclick="event.stopPropagation()">
        <summary style="cursor:pointer;font-weight:900;color:var(--text2);list-style:none" onclick="event.stopPropagation()">🖼️ 대학별 배경 크기 (펨코스타일) <span style="font-size:var(--fs-caption);color:var(--gray-l);font-weight:600">(선택)</span></summary>
        <div style="font-size:var(--fs-caption);color:var(--gray-l);margin:8px 0 10px;line-height:1.6">
          위의 “배경 크기(%)”가 <b>기본(공통)</b>이고, 아래는 대학별 <b>예외값</b>입니다. 초기화하면 공통값을 따릅니다.
        </div>
        <div style="display:flex;flex-direction:column;gap:10px">
          ${(univCfg||[]).map((u,idx)=>({u,idx})).filter(x=>x.u && !x.u.dissolved).map(({u,idx:i})=>{
            const _v = parseInt(u.femcoBgLogoPct||'',10);
            const cur = isNaN(_v) ? '' : Math.max(10, Math.min(220,_v));
            const _def = (()=>{try{return Math.max(10,Math.min(220,parseInt((J('b2_femco_settings_v1')||{}).bgLogoPct||42,10)||42));}catch(e){return 42;}})();
            return `
              <div class="srow" style="gap:10px;align-items:center;flex-wrap:wrap">
                <div class="cdot" style="background:${u.color||'#64748b'}"></div>
                <div style="flex:1;min-width:120px;font-weight:900;color:var(--text2)">${esc(u.name||'')}</div>
                <input type="range" min="10" max="220" step="1" value="${cur||_def}" style="flex:1;min-width:180px;accent-color:var(--blue)"
                  oninput="univCfg[${i}].femcoBgLogoPct=+this.value;saveCfg();try{this.parentElement.querySelector('span').textContent=this.value+'%';}catch(e){};try{window._cfgSoftRefreshLive&&window._cfgSoftRefreshLive();}catch(e){}">
                <span style="font-size:var(--fs-caption);color:var(--gray-l);min-width:52px;font-weight:900">${cur?cur+'%':'(기본)'}</span>
                <button class="btn btn-w btn-xs" onclick="delete univCfg[${i}].femcoBgLogoPct;saveCfg();try{const p=this.parentElement;const r=p.querySelector('input[type=range]');if(r)r.value='${_def}';const s=p.querySelector('span');if(s)s.textContent='(기본)';}catch(e){};try{window._cfgSoftRefreshLive&&window._cfgSoftRefreshLive();}catch(e){}">초기화</button>
              </div>
            `;
          }).join('')}
        </div>
      </details>

      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:var(--fs-sm);font-weight:700;color:var(--text2)">배경 투명(오버레이)</div>
        <input type="range" id="cfg-femco-bgOverlay" min="0" max="70" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-bgOverlayNum').value=this.value;cfgFemcoUpd('bgOverlay',this.value)">
        <input type="number" id="cfg-femco-bgOverlayNum" min="0" max="70" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:var(--fs-base);font-weight:700" onchange="document.getElementById('cfg-femco-bgOverlay').value=this.value;cfgFemcoUpd('bgOverlay',this.value)">
      </div>
      </div>
    </details>
    <details class="cfg-grp" style="border:1px solid var(--border);border-radius:10px;overflow:hidden">
      <summary style="cursor:pointer;display:flex;align-items:center;gap:8px;padding:10px 12px;background:var(--surface);font-weight:900;font-size:var(--fs-sm);color:var(--text2)">🎨 로고 · 제목 배치</summary>
      <div style="padding:12px;display:flex;flex-direction:column;gap:12px">
      <div style="font-size:var(--fs-caption);color:var(--gray-l);margin-top:-6px">0=투명(원본 그대로) · 70=글자 잘 보이게 진하게</div>

      <label style="display:flex;align-items:center;gap:8px;font-size:var(--fs-sm);cursor:pointer;font-weight:800;color:var(--text2)">
        <input type="checkbox" id="cfg-femco-logoAttachTitle" style="width:14px;height:14px" onchange="cfgFemcoUpd('logoAttachTitle', this.checked?1:0)">
        로고를 대학명과 같이 이동(체크 해제 시 ‘로고만’ 위치 이동)
      </label>

      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <div style="font-size:var(--fs-sm);font-weight:700;color:var(--text2);min-width:140px">대학 로고 위치</div>
        <select id="cfg-femco-logoPos" onchange="cfgFemcoUpd('logoPos',this.value)" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px">
          <option value="left">좌측</option>
          <option value="right">우측</option>
          <option value="top">상단</option>
          <option value="bottom">하단</option>
          <option value="center">가운데</option>
        </select>
      </div>

      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <div style="font-size:var(--fs-sm);font-weight:700;color:var(--text2);min-width:140px">대학명 위치(로고 기준)</div>
        <select id="cfg-femco-titlePos" onchange="cfgFemcoUpd('titlePos',this.value)" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px">
          <option value="right">로고 우측</option>
          <option value="left">로고 좌측</option>
          <option value="bottom">로고 아래</option>
          <option value="top">로고 위</option>
        </select>
        <span style="font-size:var(--fs-caption);color:var(--gray-l)">※ ‘로고를 대학명과 같이 이동’ 켠 상태에서 적용</span>
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:var(--fs-sm);font-weight:700;color:var(--text2)">로고 좌우 이동</div>
        <input type="range" id="cfg-femco-logoOffsetX" min="-80" max="80" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-logoOffsetXNum').value=this.value;cfgFemcoUpd('logoOffsetX',this.value)">
        <input type="number" id="cfg-femco-logoOffsetXNum" min="-80" max="80" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:var(--fs-base);font-weight:700" onchange="document.getElementById('cfg-femco-logoOffsetX').value=this.value;cfgFemcoUpd('logoOffsetX',this.value)">
      </div>
      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:var(--fs-sm);font-weight:700;color:var(--text2)">로고 상하 이동</div>
        <input type="range" id="cfg-femco-logoOffsetY" min="-80" max="80" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-logoOffsetYNum').value=this.value;cfgFemcoUpd('logoOffsetY',this.value)">
        <input type="number" id="cfg-femco-logoOffsetYNum" min="-80" max="80" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:var(--fs-base);font-weight:700" onchange="document.getElementById('cfg-femco-logoOffsetY').value=this.value;cfgFemcoUpd('logoOffsetY',this.value)">
      </div>
      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:var(--fs-sm);font-weight:700;color:var(--text2)">대학명 좌우 이동</div>
        <input type="range" id="cfg-femco-titleOffsetX" min="-80" max="80" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-titleOffsetXNum').value=this.value;cfgFemcoUpd('titleOffsetX',this.value)">
        <input type="number" id="cfg-femco-titleOffsetXNum" min="-80" max="80" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:var(--fs-base);font-weight:700" onchange="document.getElementById('cfg-femco-titleOffsetX').value=this.value;cfgFemcoUpd('titleOffsetX',this.value)">
      </div>
      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:var(--fs-sm);font-weight:700;color:var(--text2)">대학명 상하 이동</div>
        <input type="range" id="cfg-femco-titleOffsetY" min="-80" max="80" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-titleOffsetYNum').value=this.value;cfgFemcoUpd('titleOffsetY',this.value)">
        <input type="number" id="cfg-femco-titleOffsetYNum" min="-80" max="80" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:var(--fs-base);font-weight:700" onchange="document.getElementById('cfg-femco-titleOffsetY').value=this.value;cfgFemcoUpd('titleOffsetY',this.value)">
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:var(--fs-sm);font-weight:700;color:var(--text2)">로고-대학명 간격</div>
        <input type="range" id="cfg-femco-headGap" min="0" max="80" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-headGapNum').value=this.value;cfgFemcoUpd('headGap',this.value)">
        <input type="number" id="cfg-femco-headGapNum" min="0" max="80" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:var(--fs-base);font-weight:700" onchange="document.getElementById('cfg-femco-headGap').value=this.value;cfgFemcoUpd('headGap',this.value)">
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:var(--fs-sm);font-weight:700;color:var(--text2)">대학명 폰트 크기</div>
        <input type="range" id="cfg-femco-titleSize" min="16" max="44" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-titleSizeNum').value=this.value;cfgFemcoUpd('titleSize',this.value)">
        <input type="number" id="cfg-femco-titleSizeNum" min="16" max="44" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:var(--fs-base);font-weight:700" onchange="document.getElementById('cfg-femco-titleSize').value=this.value;cfgFemcoUpd('titleSize',this.value)">
      </div>

      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <div style="font-size:var(--fs-sm);font-weight:700;color:var(--text2);min-width:140px">대학명 폰트</div>
        <select id="cfg-femco-titleFont" onchange="cfgFemcoUpd('titleFont',this.value)" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px">
          <option value="system">기본(시스템)</option>
          <option value="app">전역 폰트</option>
          <option value="noto">Noto Sans KR</option>
          <option value="pretendard">Pretendard</option>
          <option value="nanum">나눔고딕</option>
          <option value="gmarket">GmarketSans</option>
        </select>
      </div>
      </div>
    </details>
    <details class="cfg-grp" style="border:1px solid var(--border);border-radius:10px;overflow:hidden">
      <summary style="cursor:pointer;display:flex;align-items:center;gap:8px;padding:10px 12px;background:var(--surface);font-weight:900;font-size:var(--fs-sm);color:var(--text2)">🖼️ 스트리머 카드 · 격자 표시</summary>
      <div style="padding:12px;display:flex;flex-direction:column;gap:12px">
      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:var(--fs-sm);font-weight:700;color:var(--text2)">스트리머 이미지 크기</div>
        <input type="range" id="cfg-femco-playerImgSize" min="28" max="160" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-playerImgSizeNum').value=this.value;cfgFemcoUpd('playerImgSize',this.value)">
        <input type="number" id="cfg-femco-playerImgSizeNum" min="28" max="160" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:var(--fs-base);font-weight:700" onchange="document.getElementById('cfg-femco-playerImgSize').value=this.value;cfgFemcoUpd('playerImgSize',this.value)">
      </div>

      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <div style="font-size:var(--fs-sm);font-weight:700;color:var(--text2);min-width:140px">이미지 모양</div>
        <select id="cfg-femco-playerImgShape" onchange="cfgFemcoUpd('playerImgShape',this.value)" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px">
          <option value="sharp">직각 네모</option>
          <option value="roundedsm">살짝 둥근 네모</option>
          <option value="square">둥근 네모</option>
          <option value="roundedlg">더 둥근 네모</option>
          <option value="roundedxl">아주 둥근 네모</option>
          <option value="circle">원</option>
        </select>
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:var(--fs-sm);font-weight:700;color:var(--text2)">이름 폰트 크기</div>
        <input type="range" id="cfg-femco-nameFontSize" min="10" max="28" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-nameFontSizeNum').value=this.value;cfgFemcoUpd('nameFontSize',this.value)">
        <input type="number" id="cfg-femco-nameFontSizeNum" min="10" max="28" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:var(--fs-base);font-weight:700" onchange="document.getElementById('cfg-femco-nameFontSize').value=this.value;cfgFemcoUpd('nameFontSize',this.value)">
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:var(--fs-sm);font-weight:700;color:var(--text2)">직급 폰트 크기</div>
        <input type="range" id="cfg-femco-roleFontSize" min="9" max="16" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-roleFontSizeNum').value=this.value;cfgFemcoUpd('roleFontSize',this.value)">
        <input type="number" id="cfg-femco-roleFontSizeNum" min="9" max="16" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:var(--fs-base);font-weight:700" onchange="document.getElementById('cfg-femco-roleFontSize').value=this.value;cfgFemcoUpd('roleFontSize',this.value)">
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:var(--fs-sm);font-weight:700;color:var(--text2)">티어 아이콘 크기</div>
        <input type="range" id="cfg-femco-tierBadgeSize" min="9" max="16" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-tierBadgeSizeNum').value=this.value;cfgFemcoUpd('tierBadgeSize',this.value)">
        <input type="number" id="cfg-femco-tierBadgeSizeNum" min="9" max="16" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:var(--fs-base);font-weight:700" onchange="document.getElementById('cfg-femco-tierBadgeSize').value=this.value;cfgFemcoUpd('tierBadgeSize',this.value)">
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:var(--fs-sm);font-weight:700;color:var(--text2)">티어 아이콘 좌우 여백</div>
        <input type="range" id="cfg-femco-tierBadgePadX" min="4" max="12" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-tierBadgePadXNum').value=this.value;cfgFemcoUpd('tierBadgePadX',this.value)">
        <input type="number" id="cfg-femco-tierBadgePadXNum" min="4" max="12" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:var(--fs-base);font-weight:700" onchange="document.getElementById('cfg-femco-tierBadgePadX').value=this.value;cfgFemcoUpd('tierBadgePadX',this.value)">
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:var(--fs-sm);font-weight:700;color:var(--text2)">⭐ 아이콘 크기</div>
        <input type="range" id="cfg-femco-starSize" min="10" max="28" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-starSizeNum').value=this.value;cfgFemcoUpd('starSize',this.value)">
        <input type="number" id="cfg-femco-starSizeNum" min="10" max="28" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:var(--fs-base);font-weight:700" onchange="document.getElementById('cfg-femco-starSize').value=this.value;cfgFemcoUpd('starSize',this.value)">
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:var(--fs-sm);font-weight:700;color:var(--text2)">상태 아이콘 크기</div>
        <input type="range" id="cfg-femco-statusIconSize" min="10" max="34" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-statusIconSizeNum').value=this.value;cfgFemcoUpd('statusIconSize',this.value)">
        <input type="number" id="cfg-femco-statusIconSizeNum" min="10" max="34" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:var(--fs-base);font-weight:700" onchange="document.getElementById('cfg-femco-statusIconSize').value=this.value;cfgFemcoUpd('statusIconSize',this.value)">
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:var(--fs-sm);font-weight:700;color:var(--text2)">세로 인원(줄)</div>
        <input type="range" id="cfg-femco-rowsPerCol" min="2" max="12" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-rowsPerColNum').value=this.value;cfgFemcoUpd('rowsPerCol',this.value)">
        <input type="number" id="cfg-femco-rowsPerColNum" min="2" max="12" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:var(--fs-base);font-weight:700" onchange="document.getElementById('cfg-femco-rowsPerCol').value=this.value;cfgFemcoUpd('rowsPerCol',this.value)">
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:var(--fs-sm);font-weight:700;color:var(--text2)">스트리머 폭</div>
        <input type="range" id="cfg-femco-colWidth" min="80" max="360" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-colWidthNum').value=this.value;cfgFemcoUpd('colWidth',this.value)">
        <input type="number" id="cfg-femco-colWidthNum" min="80" max="360" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:var(--fs-base);font-weight:700" onchange="document.getElementById('cfg-femco-colWidth').value=this.value;cfgFemcoUpd('colWidth',this.value)">
      </div>

      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <div style="font-size:var(--fs-sm);font-weight:700;color:var(--text2);min-width:140px">내용 정렬</div>
        <select id="cfg-femco-contentAlign" onchange="cfgFemcoUpd('contentAlign', this.value)" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px">
          <option value="left">왼쪽</option>
          <option value="center">가운데</option>
        </select>
        <span style="font-size:var(--fs-caption);color:var(--gray-l)">※ ‘너무 좌측’ 느낌이면 가운데 + 좌우 여백을 키워보세요</span>
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:var(--fs-sm);font-weight:700;color:var(--text2)">좌우 여백</div>
        <input type="range" id="cfg-femco-contentPadX" min="0" max="40" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-contentPadXNum').value=this.value;cfgFemcoUpd('contentPadX',this.value)">
        <input type="number" id="cfg-femco-contentPadXNum" min="0" max="40" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:var(--fs-base);font-weight:700" onchange="document.getElementById('cfg-femco-contentPadX').value=this.value;cfgFemcoUpd('contentPadX',this.value)">
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:var(--fs-sm);font-weight:700;color:var(--text2)">내용 좌우 이동</div>
        <input type="range" id="cfg-femco-contentOffsetX" min="-40" max="40" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-contentOffsetXNum').value=this.value;cfgFemcoUpd('contentOffsetX',this.value)">
        <input type="number" id="cfg-femco-contentOffsetXNum" min="-40" max="40" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:var(--fs-base);font-weight:700" onchange="document.getElementById('cfg-femco-contentOffsetX').value=this.value;cfgFemcoUpd('contentOffsetX',this.value)">
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:var(--fs-sm);font-weight:700;color:var(--text2)">상하(행) 간격</div>
        <input type="range" id="cfg-femco-colGap" min="0" max="28" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-colGapNum').value=this.value;cfgFemcoUpd('colGap',this.value)">
        <input type="number" id="cfg-femco-colGapNum" min="0" max="28" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:var(--fs-base);font-weight:700" onchange="document.getElementById('cfg-femco-colGap').value=this.value;cfgFemcoUpd('colGap',this.value)">
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:var(--fs-sm);font-weight:700;color:var(--text2)">대학 간 여백</div>
        <input type="range" id="cfg-femco-univGap" min="0" max="120" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-univGapNum').value=this.value;cfgFemcoUpd('univGap',this.value)">
        <input type="number" id="cfg-femco-univGapNum" min="0" max="120" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:var(--fs-base);font-weight:700" onchange="document.getElementById('cfg-femco-univGap').value=this.value;cfgFemcoUpd('univGap',this.value)">
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:var(--fs-sm);font-weight:700;color:var(--text2)">인원수 폰트 크기</div>
        <input type="range" id="cfg-femco-countFontSize" min="10" max="18" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-countFontSizeNum').value=this.value;cfgFemcoUpd('countFontSize',this.value)">
        <input type="number" id="cfg-femco-countFontSizeNum" min="10" max="18" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:var(--fs-base);font-weight:700" onchange="document.getElementById('cfg-femco-countFontSize').value=this.value;cfgFemcoUpd('countFontSize',this.value)">
      </div>

      </div>
    </details>
    <details class="cfg-grp" style="border:1px solid var(--border);border-radius:10px;overflow:hidden">
      <summary style="cursor:pointer;display:flex;align-items:center;gap:8px;padding:10px 12px;background:var(--surface);font-weight:900;font-size:var(--fs-sm);color:var(--text2)">🎓 대학별 설정 (배경 · 색상 · 문구)</summary>
      <div style="padding:12px;display:flex;flex-direction:column;gap:12px">
      <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text2)">대학별 설정</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <div style="font-size:var(--fs-sm);font-weight:700;color:var(--text2);min-width:140px">대학 선택</div>
        <select id="cfg-femco-univ" onchange="localStorage.setItem('cfg_femco_univ',this.value);cfgFemcoRefreshUnivFields();try{if(typeof window.cfgTouchPrefsSync==='function')window.cfgTouchPrefsSync();}catch(e){}" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px;min-width:160px"></select>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <div style="font-size:var(--fs-sm);font-weight:700;color:var(--text2);min-width:140px">대학 색상</div>
        <input type="color" id="cfg-femco-univColor" onchange="cfgFemcoSetUnivColor(this.value)">
        <button class="btn btn-xs" onclick="cfgFemcoClearUnivColor()">해제</button>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <div style="font-size:var(--fs-sm);font-weight:700;color:var(--text2);min-width:140px">대학명 아래 문구</div>
        <input type="text" id="cfg-femco-subtitle" placeholder="대학명 아래 문구" style="flex:1;min-width:240px" onchange="cfgFemcoSetSubtitle(this.value)">
        <button class="btn btn-xs" onclick="cfgFemcoClearSubtitle()">삭제</button>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <div style="font-size:var(--fs-sm);font-weight:700;color:var(--text2);min-width:140px">대학 배경 미디어</div>
        <input type="text" id="cfg-femco-bgMediaUrl" placeholder="https://... (jpg/png/gif/webp/mp4/유튜브/트위치)" style="flex:1;min-width:260px" onchange="cfgFemcoSetBgMedia(this.value)">
        <button class="btn btn-xs" onclick="cfgFemcoSetBgMedia('')">삭제</button>
        <span id="cfg-femco-bgMediaHint" style="font-size:var(--fs-caption);color:var(--gray-l)">미설정</span>
      </div>
      <div style="font-size:var(--fs-caption);color:var(--gray-l);line-height:1.45;margin-top:-6px">
        • 이미지/GIF: 대학 카드 배경으로 적용<br>
        • MP4/WEBM: 대학 카드에 “배경영상” 버튼 표시(클릭 재생)<br>
        • 유튜브/트위치: “배경링크” 버튼 표시(새창)
      </div>
      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center;margin-top:6px">
        <div style="font-size:var(--fs-sm);font-weight:700;color:var(--text2)">배경 이미지 투명도</div>
        <input type="range" id="cfg-femco-bgAlpha" min="0" max="100" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-bgAlphaNum').value=this.value;cfgFemcoSetBgOpt('alpha',this.value)">
        <input type="number" id="cfg-femco-bgAlphaNum" min="0" max="100" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:var(--fs-base);font-weight:700" onchange="document.getElementById('cfg-femco-bgAlpha').value=this.value;cfgFemcoSetBgOpt('alpha',this.value)">
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <div style="font-size:var(--fs-sm);font-weight:700;color:var(--text2);min-width:140px">배경 위치/반복</div>
        <select id="cfg-femco-bgPos" onchange="cfgFemcoSetBgOpt('pos',this.value)" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px">
          <option value="center">중앙</option>
          <option value="top">상단</option>
          <option value="bottom">하단</option>
          <option value="left">좌측</option>
          <option value="right">우측</option>
          <option value="top left">좌상</option>
          <option value="top right">우상</option>
          <option value="bottom left">좌하</option>
          <option value="bottom right">우하</option>
        </select>
        <select id="cfg-femco-bgRepeat" onchange="cfgFemcoSetBgOpt('repeat',this.value)" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px">
          <option value="no-repeat">반복 없음</option>
          <option value="repeat">바둑판 반복(여러곳)</option>
          <option value="repeat-x">가로 반복</option>
          <option value="repeat-y">세로 반복</option>
        </select>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <div style="font-size:var(--fs-sm);font-weight:700;color:var(--text2);min-width:140px">배경 크기</div>
        <select id="cfg-femco-bgSizeMode" onchange="cfgFemcoSetBgOpt('sizeMode',this.value)" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px">
          <option value="cover">채우기(cover)</option>
          <option value="contain">맞춤(contain)</option>
          <option value="pct">퍼센트(여러개 추천)</option>
          <option value="px">픽셀(여러개 추천)</option>
        </select>
        <input type="number" id="cfg-femco-bgSizeVal" min="30" max="600" step="1" style="width:120px;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:var(--fs-base);font-weight:700" onchange="cfgFemcoSetBgOpt('sizeVal',this.value)">
        <span style="font-size:var(--fs-caption);color:var(--gray-l)">pct: % / px: px</span>
      </div>
      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:var(--fs-sm);font-weight:700;color:var(--text2)">배경 X 오프셋</div>
        <input type="range" id="cfg-femco-bgOffX" min="-260" max="260" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-bgOffXNum').value=this.value;cfgFemcoSetBgOpt('ox',this.value)">
        <input type="number" id="cfg-femco-bgOffXNum" min="-260" max="260" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:var(--fs-base);font-weight:700" onchange="document.getElementById('cfg-femco-bgOffX').value=this.value;cfgFemcoSetBgOpt('ox',this.value)">
      </div>
      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:var(--fs-sm);font-weight:700;color:var(--text2)">배경 Y 오프셋</div>
        <input type="range" id="cfg-femco-bgOffY" min="-260" max="260" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-bgOffYNum').value=this.value;cfgFemcoSetBgOpt('oy',this.value)">
        <input type="number" id="cfg-femco-bgOffYNum" min="-260" max="260" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:var(--fs-base);font-weight:700" onchange="document.getElementById('cfg-femco-bgOffY').value=this.value;cfgFemcoSetBgOpt('oy',this.value)">
      </div>
      </div>
    </details>
    <details class="cfg-grp" style="border:1px solid var(--border);border-radius:10px;overflow:hidden">
      <summary style="cursor:pointer;display:flex;align-items:center;gap:8px;padding:10px 12px;background:var(--surface);font-weight:900;font-size:var(--fs-sm);color:var(--text2)">📝 문구 스타일 · 초기화</summary>
      <div style="padding:12px;display:flex;flex-direction:column;gap:12px">
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <div style="font-size:var(--fs-sm);font-weight:700;color:var(--text2);min-width:140px">문구 스타일</div>
        <span style="font-size:var(--fs-caption);color:var(--gray-l)">크기</span>
        <input type="range" id="cfg-femco-subtitleSize" min="10" max="24" step="1" style="width:180px;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-subtitleSizeNum').value=this.value;cfgFemcoUpd('subtitleSize',this.value)">
        <input type="number" id="cfg-femco-subtitleSizeNum" min="10" max="24" step="1" style="width:80px;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:var(--fs-base);font-weight:700" onchange="document.getElementById('cfg-femco-subtitleSize').value=this.value;cfgFemcoUpd('subtitleSize',this.value)">
        <span style="font-size:var(--fs-caption);color:var(--gray-l)">굵기</span>
        <select id="cfg-femco-subtitleWeight" onchange="cfgFemcoUpd('subtitleWeight',this.value)" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px">
          <option value="400">400</option><option value="500">500</option><option value="600">600</option><option value="700">700</option><option value="800">800</option><option value="900">900</option>
        </select>
        <span style="font-size:var(--fs-caption);color:var(--gray-l)">색</span>
        <input type="color" id="cfg-femco-subtitleColor" onchange="cfgFemcoUpd('subtitleColor',this.value)">
        <button class="btn btn-xs" onclick="cfgFemcoUpd('subtitleColor','')">자동</button>
      </div>

      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">
        <button class="btn btn-b" onclick="cfgFemcoReset()">초기화</button>
      </div>
      </div>
    </details>
    </div>
  </details>
  `;
}
