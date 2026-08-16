// settings-render.js에서 분리됨 (설정 탭 렌더링 — 메뉴정리/이미지설정/경기상세/스트리머·대학상세디자인/FAB/현황판칩/구현황판/브리핑효과)
function _cfgSecGroup4(ctx){
  const {isLoggedIn,isSubAdmin,_escHTML,_escJS,_escAttr,esc,_players,localStorage,notices,univCfg,_catSecs,_cfgCats,_cfgCatIcons,_catLabel,_cfgCatDesc,_cfgSecTitle,typeOpts,_curSecs,_regBtn,_menuBtn,_afOn,_rcOn,_rcAccent,_rcBg,_rcHd,_rcIc,_rcUnivFont,_ymScale,_rcMemoOn,_sfxOn,_sfxMode,_sfxInt,_sfxLen,_sfxTail,_sfxSoft,_sfxEdge,_avaScale,_mvpFxOn,_mvpFxStyle,_mvpFxIntensity,_mvpDesignMode,_briefingTheme,_cfgSecDescFallback,_cfgSecDesc,_getCfgSecDesc,_secButtons,_catCardAccents,_catCardsHtml,_secBtnColors,_secBtnIcColors,_secButtonsHtml,_cfgHeroStats,_cfgHeroStatsHtml} = ctx;
  return `${_scfgD('cfgmenu','🧭 설정 메뉴 정리')}
    <div style="font-size:var(--fs-sm);color:var(--gray-l);margin-bottom:10px">카테고리 이동 + 섹션 순서 변경을 직접 정리할 수 있습니다. 변경 즉시 저장되며 새로고침 없이 반영됩니다.</div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r);display:flex;flex-direction:column;gap:12px">
      ${(()=>{
        const cats = (window._cfgCatOrder && Array.isArray(window._cfgCatOrder)) ? window._cfgCatOrder : Object.keys(_catSecs||{});
        const secTitle = window._cfgSecTitle || {};
        return cats.map((cat, catIdx)=>{
          const secs = (_catSecs[cat]||[]);
          return `
            <div style="border:1px solid var(--border);border-radius:var(--r);background:var(--white);padding:12px">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
                <div style="font-weight:900">${cat}</div>
                <span style="font-size:var(--fs-caption);color:var(--gray-l)">${secs.length}개</span>
                <span style="flex:1"></span>
                <button class="btn btn-xs" onclick="cfgMenuMoveCat('${cat.replace(/'/g,"\\'")}','up')" ${catIdx===0?'disabled':''}>▲</button>
                <button class="btn btn-xs" onclick="cfgMenuMoveCat('${cat.replace(/'/g,"\\'")}','down')" ${catIdx===cats.length-1?'disabled':''}>▼</button>
              </div>
              <div style="display:flex;flex-direction:column;gap:6px">
                ${secs.map((secId, i)=>{
                  const title = secTitle[secId] || secId;
                  return `
                    <div style="display:flex;align-items:center;gap:8px;border:1px solid var(--border2);border-radius:var(--r);padding:8px 10px;background:var(--surface)">
                      <div style="font-size:var(--fs-sm);font-weight:800;min-width:160px">${title}</div>
                      <button class="btn btn-xs" onclick="cfgMenuRenameSec('${secId}')" title="이름 변경">✏️</button>
                      <select onchange="cfgMenuSetCat('${secId}', this.value)" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px">
                        ${cats.map(c=>`<option value="${c}"${c===cat?' selected':''}>${c}</option>`).join('')}
                      </select>
                      <span style="flex:1"></span>
                      <button class="btn btn-xs" onclick="cfgMenuMoveSec('${secId}','up')" ${i===0?'disabled':''}>▲</button>
                      <button class="btn btn-xs" onclick="cfgMenuMoveSec('${secId}','down')" ${i===secs.length-1?'disabled':''}>▼</button>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          `;
        }).join('');
      })()}
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-b" onclick="cfgMenuReset()">기본 메뉴로 초기화</button>
        <button class="btn btn-p" onclick="cfgMenuReset();try{if(typeof showToast==='function')showToast('🤖 자동 정리 완료');}catch(e){}">🤖 자동 정리</button>
        <button class="btn btn-w" onclick="cfgMenuResetSecNames()">이름 변경 초기화</button>
      </div>
    </div>
  </details>
  ${(typeof _cfgTabVisSectionHTML==='function') ? _cfgTabVisSectionHTML() : ''}
  ${_scfgD('imgsettings','🖼️ 이미지탭 이미지 설정')}
    <div style="font-size:var(--fs-sm);color:var(--gray-l);margin-bottom:10px">이미지탭 ⚙️ 버튼과 동일한 설정입니다. 크기·밝기·배치·위치를 조절하면 즉시 반영됩니다.</div>
    <div id="cfg-b2-img-settings-wrap" style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r)">
      <div style="font-size:var(--fs-sm);color:var(--gray-l)">로딩 중...</div>
    </div>
    <div style="font-size:var(--fs-caption);color:var(--gray-l);margin-top:6px;padding:0 2px">※ 스트리머 상세 모달 이미지 설정은 아래 별도 항목에서 설정</div>
  </details>
  ${_scfgD('b2trans','🎞️ 이미지탭 슬라이드쇼 효과')}
    <div style="font-size:var(--fs-sm);color:var(--gray-l);margin-bottom:10px">현황판 프로필탭(이미지탭) 좌측 히어로 슬라이드쇼의 전환 효과와 시네마틱 모드를 설정합니다.</div>
    <div id="cfg-b2trans-body" style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r)">
      <div style="font-size:var(--fs-sm);color:var(--gray-l)">로딩 중...</div>
    </div>
  </details>
  ${_scfgD('imgmodalsettings','🖼️ 스트리머 상세 이미지 설정')}
    <div style="font-size:var(--fs-sm);color:var(--gray-l);margin-bottom:10px">스트리머 상세 모달의 이미지 크기·밝기를 설정합니다.</div>
    <div style="font-size:var(--fs-caption);color:var(--gray-l);margin-bottom:8px">모바일/태블릿/PC 크기를 따로 저장합니다.</div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r);display:flex;flex-direction:column;gap:12px">
      <label style="display:flex;align-items:center;gap:6px;font-size:var(--fs-sm);cursor:pointer;font-weight:600">
        <input type="checkbox" id="cfg-img-fill" style="width:14px;height:14px" onchange="if(typeof saveImageSettings==='function')saveImageSettings(true)"> 이미지 채우기 (cover) — 해제 시 맞춤 (contain)
      </label>
      <div style="font-size:var(--fs-caption);color:var(--blue);font-weight:700">✓ 실시간 미리보기 — 조절하면 스트리머 상세 팝업에 바로 반영됩니다</div>
      <div>
        <div style="display:flex;justify-content:space-between;margin-bottom:4px">
          <label style="font-size:var(--fs-sm);font-weight:700;color:var(--text2)">기본 크기</label>
          <span id="cfg-img-scale-val" style="font-size:var(--fs-sm);font-weight:700;color:var(--blue)">1.0x</span>
        </div>
        <input type="range" id="cfg-img-scale" min="0.5" max="2" step="0.1" value="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-img-scale-val').textContent=parseFloat(this.value).toFixed(1)+'x';clearTimeout(window._imgSetLiveT);window._imgSetLiveT=setTimeout(()=>{if(typeof saveImageSettings==='function')saveImageSettings(true);},150)">
        <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--gray-l);margin-top:2px"><span>0.5x</span><span>2.0x</span></div>
      </div>
      <div>
        <div style="display:flex;justify-content:space-between;margin-bottom:4px">
          <label style="font-size:var(--fs-sm);font-weight:700;color:var(--text2)">기본 밝기</label>
          <span id="cfg-img-brightness-val" style="font-size:var(--fs-sm);font-weight:700;color:var(--blue)">1.0x</span>
        </div>
        <input type="range" id="cfg-img-brightness" min="0.3" max="2" step="0.1" value="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-img-brightness-val').textContent=parseFloat(this.value).toFixed(1)+'x';clearTimeout(window._imgSetLiveT);window._imgSetLiveT=setTimeout(()=>{if(typeof saveImageSettings==='function')saveImageSettings(true);},150)">
        <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--gray-l);margin-top:2px"><span>0.3x</span><span>2.0x</span></div>
      </div>
      <div>
        <div style="display:flex;justify-content:space-between;margin-bottom:4px">
          <label style="font-size:var(--fs-sm);font-weight:700;color:var(--text2)">모바일 크기</label>
          <span id="cfg-img-scale-left-val" style="font-size:var(--fs-sm);font-weight:700;color:var(--blue)">1.0x</span>
        </div>
        <input type="range" id="cfg-img-scale-left" min="0.5" max="2" step="0.1" value="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-img-scale-left-val').textContent=parseFloat(this.value).toFixed(1)+'x';clearTimeout(window._imgSetLiveT);window._imgSetLiveT=setTimeout(()=>{if(typeof saveImageSettings==='function')saveImageSettings(true);},150)">
      </div>
      <div>
        <div style="display:flex;justify-content:space-between;margin-bottom:4px">
          <label style="font-size:var(--fs-sm);font-weight:700;color:var(--text2)">태블릿 크기</label>
          <span id="cfg-img-scale-tablet-val" style="font-size:var(--fs-sm);font-weight:700;color:var(--blue)">1.0x</span>
        </div>
        <input type="range" id="cfg-img-scale-tablet" min="0.5" max="2" step="0.1" value="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-img-scale-tablet-val').textContent=parseFloat(this.value).toFixed(1)+'x';clearTimeout(window._imgSetLiveT);window._imgSetLiveT=setTimeout(()=>{if(typeof saveImageSettings==='function')saveImageSettings(true);},150)">
      </div>
      <div>
        <div style="display:flex;justify-content:space-between;margin-bottom:4px">
          <label style="font-size:var(--fs-sm);font-weight:700;color:var(--text2)">PC 크기</label>
          <span id="cfg-img-scale-right-val" style="font-size:var(--fs-sm);font-weight:700;color:var(--blue)">1.0x</span>
        </div>
        <input type="range" id="cfg-img-scale-right" min="0.5" max="2" step="0.1" value="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-img-scale-right-val').textContent=parseFloat(this.value).toFixed(1)+'x';clearTimeout(window._imgSetLiveT);window._imgSetLiveT=setTimeout(()=>{if(typeof saveImageSettings==='function')saveImageSettings(true);},150)">
      </div>
      <button class="btn btn-b" onclick="saveImageSettings()" style="align-self:flex-start">💾 설정 저장</button>
    </div>
  </details>
  ${(typeof window.renderCfgProfileShapeCard==='function' ? window.renderCfgProfileShapeCard(_scfgD) : '')}
  ${_scfgD('matchdetail','🎮 경기 상세(팝업) 설정')}
    <div id="cfg-md-body"></div>
  </details>
  ${_scfgD('pdModeBadge','🎨 최근 경기 종목(종류) 배지 색상')}
    <div style="font-size:var(--fs-sm);color:var(--gray-l);margin-bottom:10px">스트리머 상세 → 최근 경기 기록의 “종목/종류” 배지 색상을 변경합니다.</div>
    <div id="cfg-pdmb-body"></div>
  </details>
  ${_scfgD('pd','🎨 스트리머 상세 스타일 설정')}
    <div id="cfg-pd-body"></div>
  </details>
  ${_scfgD('ud','🏫 대학 상세(팝업) 디자인 설정')}
    <div id="cfg-ud-body"></div>
  </details>
  ${_scfgD('fab','🔘 플로팅(FAB) 버튼 탭 설정')}
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
      <div style="display:flex;flex-direction:column;gap:8px">
        <!-- 클릭/터치가 잘 안 잡히는 문제 방지: label 전체를 클릭 영역으로 사용 -->
        <label for="cfg-fab-hide-mobile" style="display:flex;align-items:center;gap:10px;padding:12px 14px;border:1px solid var(--border);border-radius:12px;background:var(--white);cursor:pointer;user-select:none;touch-action:manipulation;-webkit-tap-highlight-color:transparent">
          <input type="checkbox" id="cfg-fab-hide-mobile" onchange="saveFabVisibilitySettings()" style="width:22px;height:22px;accent-color:var(--blue);flex-shrink:0">
          <div style="font-size:var(--fs-base);font-weight:800;color:var(--text2)">모바일에서 숨기기</div>
        </label>
        <label for="cfg-fab-hide-pc" style="display:flex;align-items:center;gap:10px;padding:12px 14px;border:1px solid var(--border);border-radius:12px;background:var(--white);cursor:pointer;user-select:none;touch-action:manipulation;-webkit-tap-highlight-color:transparent">
          <input type="checkbox" id="cfg-fab-hide-pc" onchange="saveFabVisibilitySettings()" style="width:22px;height:22px;accent-color:var(--blue);flex-shrink:0">
          <div style="font-size:var(--fs-base);font-weight:800;color:var(--text2)">PC에서 숨기기</div>
        </label>
      </div>
    </div>
  </details>
  ${_scfgD('boardchip','🏷️ 현황판 칩/대학로고 크기')}
    <div style="font-size:var(--fs-sm);color:var(--gray-l);margin-bottom:12px">현황판 칩/대학 로고 관련 설정입니다. <b>스트리머 프로필 이미지 전역 배율</b>과는 별개로 동작합니다.</div>
    <div style="padding:0;display:flex;flex-direction:column;gap:8px">
    <details class="cfg-grp" open style="border:1px solid var(--border);border-radius:10px;overflow:hidden">
      <summary style="cursor:pointer;display:flex;align-items:center;gap:8px;padding:10px 12px;background:var(--surface);font-weight:900;font-size:var(--fs-sm);color:var(--text2)">🖼️ 프로필/칩 표시</summary>
      <div style="padding:12px;display:flex;flex-direction:column;gap:14px">
      <div>
        <div style="font-size:var(--fs-sm);font-weight:700;color:var(--text2);margin-bottom:8px">📐 프로필 이미지 모양</div>
        <div style="font-size:var(--fs-caption);color:var(--gray-l);margin-bottom:8px">프로필 이미지 모양(원형/네모)은 별도 메뉴에서 전역으로 설정합니다.</div>
        <button class="btn btn-w btn-xs" onclick="cfgGo('profileshape')">⚙️ 프로필 이미지 모양 설정 열기</button>
      </div>
      <div>
        <div style="font-size:var(--fs-sm);font-weight:700;color:var(--text2);margin-bottom:8px">📏 프로필 이미지 크기 <span id="cfg-bcp-size-val" style="font-weight:400;color:var(--gray-l)">${(()=>{try{return parseInt(localStorage.getItem('su_bcp_size')||'26');}catch(e){return 26;}})()}px</span></div>
        <input type="range" min="16" max="56" step="2" value="${(()=>{try{return parseInt(localStorage.getItem('su_bcp_size')||'26');}catch(e){return 26;}})()}" style="width:100%;accent-color:var(--blue)"
          oninput="boardChipPhotoSize=+this.value;saveBoardChipPhotoSettings();document.getElementById('cfg-bcp-size-val').textContent=this.value+'px';try{window._cfgSoftRefreshLive&&window._cfgSoftRefreshLive();}catch(e){};try{if(typeof window.cfgTouchPrefsSync==='function')window.cfgTouchPrefsSync();}catch(e){}">
        <div style="display:flex;justify-content:space-between;font-size:var(--fs-caption);color:var(--gray-l);margin-top:2px"><span>16px</span><span>56px</span></div>
      </div>
      <div>
        <div style="font-size:var(--fs-sm);font-weight:700;color:var(--text2);margin-bottom:8px">📦 레이아웃 크기 <span id="cfg-bcp-layout-val" style="font-weight:400;color:var(--gray-l)">${(()=>{try{return parseInt(localStorage.getItem('su_bcp_layout')||'100');}catch(e){return 100;}})()}%</span></div>
        <input type="range" min="70" max="160" step="5" value="${(()=>{try{return parseInt(localStorage.getItem('su_bcp_layout')||'100');}catch(e){return 100;}})()}" style="width:100%;accent-color:var(--blue)"
          oninput="boardChipLayoutScale=+this.value;saveBoardChipPhotoSettings();document.getElementById('cfg-bcp-layout-val').textContent=this.value+'%';try{window._cfgSoftRefreshLive&&window._cfgSoftRefreshLive();}catch(e){}">
        <div style="display:flex;justify-content:space-between;font-size:var(--fs-caption);color:var(--gray-l);margin-top:2px"><span>70%</span><span>160%</span></div>
      </div>
      </div>
    </details>
    <details class="cfg-grp" open style="border:2px solid #93c5fd;border-radius:10px;overflow:hidden">
      <summary style="cursor:pointer;display:flex;align-items:center;gap:8px;padding:10px 12px;background:linear-gradient(135deg,#eff6ff,#eef2ff);font-weight:900;font-size:var(--fs-sm);color:var(--text2)">🌤️ 대학별 현황판 배경 밝기</summary>
      <div style="padding:12px;display:flex;flex-direction:column;gap:14px">
      <div style="padding:12px;border:1px solid var(--border);border-radius:12px;background:var(--white)">
        <div style="font-size:var(--fs-caption);color:var(--gray-l);line-height:1.5;margin-bottom:10px">대학 로고를 현황판 배경으로 깔 때 학교마다 진하기가 다르면 여기서 맞출 수 있습니다.</div>
        <div style="display:grid;grid-template-columns:84px 1fr 90px;gap:10px;align-items:center;margin-bottom:6px;padding-bottom:12px;border-bottom:1px dashed var(--border2)">
          <div style="font-size:var(--fs-sm);font-weight:800;color:var(--blue)">🌍 전체 공통</div>
          <input type="range" id="cfg-boardchip-bgAlphaGlobal" min="0" max="100" step="1" value="${(typeof b2BgImgAlpha!=='undefined'?b2BgImgAlpha:64)}" style="width:100%;accent-color:var(--blue)"
            oninput="document.getElementById('cfg-boardchip-bgAlphaGlobalNum').value=this.value"
            onchange="setBoardBgAlphaGlobal(this.value,true);try{window.cfgFemcoRefreshUnivFields&&window.cfgFemcoRefreshUnivFields();}catch(e){}">
          <input type="number" id="cfg-boardchip-bgAlphaGlobalNum" min="0" max="100" step="1" value="${(typeof b2BgImgAlpha!=='undefined'?b2BgImgAlpha:64)}" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:var(--fs-base);font-weight:700"
            onchange="document.getElementById('cfg-boardchip-bgAlphaGlobal').value=this.value;setBoardBgAlphaGlobal(this.value,true);try{window.cfgFemcoRefreshUnivFields&&window.cfgFemcoRefreshUnivFields();}catch(e){}">
        </div>
        <div style="font-size:var(--fs-caption);color:var(--gray-l);margin-bottom:10px">모든 대학이 기본으로 같이 쓰는 공통 밝기입니다. 특정 대학만 다르게 하고 싶으면 아래에서 대학을 골라 개별 조절하세요.</div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:10px">
          <div style="font-size:var(--fs-sm);font-weight:700;color:var(--text2);min-width:84px">대학 선택</div>
          <select id="cfg-boardchip-univ" onchange="localStorage.setItem('cfg_femco_univ',this.value);try{window.cfgFemcoRefreshUnivFields&&window.cfgFemcoRefreshUnivFields(this.value);}catch(e){};try{if(typeof window.cfgTouchPrefsSync==='function')window.cfgTouchPrefsSync();}catch(e){}" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px;min-width:180px;flex:1">
            ${(()=>{
              const names=(Array.isArray(window.univCfg)?window.univCfg:[]).map(u=>String(u&&u.name||'').trim()).filter(Boolean);
              if(!names.includes('무소속')) names.push('무소속');
              const cur=(()=>{try{return localStorage.getItem('cfg_femco_univ') || names[0] || '';}catch(e){return names[0]||'';}})();
              return names.map(n=>`<option value="${String(n).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}"${n===cur?' selected':''}>${String(n).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</option>`).join('');
            })()}
          </select>
        </div>
        <div style="display:grid;grid-template-columns:84px 1fr 90px;gap:10px;align-items:center">
          <div style="font-size:var(--fs-sm);font-weight:700;color:var(--text2)">밝기(개별)</div>
          <input type="range" id="cfg-boardchip-bgAlpha" min="0" max="100" step="1" value="64" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-boardchip-bgAlphaNum').value=this.value" onchange="window.cfgFemcoSetBoardBgAlpha&&window.cfgFemcoSetBoardBgAlpha(this.value)">
          <input type="number" id="cfg-boardchip-bgAlphaNum" min="0" max="100" step="1" value="64" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:var(--fs-base);font-weight:700" onchange="document.getElementById('cfg-boardchip-bgAlpha').value=this.value;window.cfgFemcoSetBoardBgAlpha&&window.cfgFemcoSetBoardBgAlpha(this.value)">
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-top:10px">
          <button class="btn btn-xs btn-w" onclick="window.cfgFemcoResetBoardBgAlpha&&window.cfgFemcoResetBoardBgAlpha()">이 대학만 전체값 사용(개별 해제)</button>
          <span id="cfg-boardchip-bgAlphaHint" style="font-size:var(--fs-caption);color:var(--gray-l)">전체값 사용 중</span>
        </div>
      </div>
      </div>
    </details>
    <details class="cfg-grp" style="border:1px solid var(--border);border-radius:10px;overflow:hidden">
      <summary style="cursor:pointer;display:flex;align-items:center;gap:8px;padding:10px 12px;background:var(--surface);font-weight:900;font-size:var(--fs-sm);color:var(--text2)">🏫 대학 로고 모양 · 크기</summary>
      <div style="padding:12px;display:flex;flex-direction:column;gap:14px">
      <div>
        <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text2);margin-bottom:10px">🏫 대학 로고 설정</div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:10px">
          <div style="font-size:var(--fs-sm);font-weight:700;color:var(--text2);margin-bottom:8px">📐 프로필(로고) 모양</div>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(80px,1fr));gap:7px">
            ${(()=>{
              const _ulShapes=[
                {v:'circle',label:'원형',icon:'⭕',preview:'border-radius:50%'},
                {v:'square',label:'네모',icon:'⬛',preview:'border-radius:6px'},
                {v:'rounded',label:'둥근 네모',icon:'🟦',preview:'border-radius:22%'},
                {v:'squircle',label:'스쿼클',icon:'🔷',preview:'border-radius:28%'},
                {v:'hexagon',label:'육각형',icon:'⬡',preview:'border-radius:50%;clip-path:polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)'},
                {v:'shield',label:'방패형',icon:'🛡️',preview:'border-radius:8px 8px 0 0;clip-path:polygon(0% 0%, 100% 0%, 100% 60%, 50% 100%, 0% 60%)'},
                {v:'pentagon',label:'오각형',icon:'⭐',preview:'border-radius:50%;clip-path:polygon(50% 0%,100% 38%,82% 100%,18% 100%,0% 38%)'},
                {v:'diamond',label:'다이아몬드',icon:'♦️',preview:'border-radius:50%;clip-path:polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'},
                {v:'star',label:'별모양',icon:'🌟',preview:'border-radius:50%;clip-path:polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)'},
                {v:'blob',label:'블롭',icon:'🫧',preview:'border-radius:40% 60% 55% 45% / 45% 55% 60% 40%'},
                {v:'leaf',label:'리프',icon:'🍃',preview:'border-radius:50%;clip-path:polygon(50% 0%,100% 50%,50% 100%,0% 50%)'},
                {v:'octagon',label:'팔각형',icon:'🔷',preview:'border-radius:50%;clip-path:polygon(30% 0%,70% 0%,100% 30%,100% 70%,70% 100%,30% 100%,0% 70%,0% 30%)'},
                {v:'heart',label:'하트',icon:'❤️',preview:'border-radius:50% 50% 50% 50%/60% 60% 40% 40%;transform:rotate(-45deg)'},
                {v:'badge',label:'뱃지',icon:'🎖️',preview:'clip-path:polygon(50% 0%,95% 15%,100% 55%,75% 92%,25% 92%,0% 55%,5% 15%)'},
                {v:'chevron',label:'쉐브론',icon:'🔰',preview:'clip-path:polygon(0% 0%,85% 0%,100% 50%,85% 100%,0% 100%,15% 50%)'},
                {v:'gem',label:'젬스톤',icon:'💎',preview:'clip-path:polygon(50% 0%,85% 20%,100% 55%,75% 100%,25% 100%,0% 55%,15% 20%)'},
                {v:'triangle',label:'삼각형',icon:'🔺',preview:'clip-path:polygon(50% 0%, 0% 100%, 100% 100%)'},
                {v:'arch',label:'아치',icon:'🏛️',preview:'border-radius:50% 50% 8px 8px / 60% 60% 8px 8px'},
                {v:'pill',label:'알약형',icon:'💊',preview:'border-radius:50px'},
                {v:'tv',label:'TV 화면',icon:'📺',preview:'border-radius:14%'},
                {v:'flower',label:'꽃잎',icon:'🌸',preview:'border-radius:50%;clip-path:polygon(50% 5%,61% 29%,84% 20%,74% 44%,98% 50%,74% 56%,84% 80%,61% 71%,50% 95%,39% 71%,16% 80%,26% 56%,2% 50%,26% 44%,16% 20%,39% 29%)'},
                {v:'kite',label:'연',icon:'🪁',preview:'clip-path:polygon(50% 0%,100% 40%,50% 100%,0% 40%)'},
              ];
              const _ulCur=(()=>{try{return localStorage.getItem('su_ul_shape')||'circle';}catch(e){return 'circle';}})();
              return _ulShapes.map(s=>{
                const sel=_ulCur===s.v;
                return `<button type="button" onclick="localStorage.setItem('su_ul_shape','${s.v}');try{if(typeof applyUnivLogoVars==='function')applyUnivLogoVars();}catch(e){};try{const g=this.parentElement; if(g){ g.querySelectorAll('button').forEach(b=>{b.style.border='1.5px solid var(--border)'; b.style.background='var(--white)'; b.style.boxShadow='none'; const sp=b.querySelector('span'); if(sp) sp.style.color='var(--text2)';}); this.style.border='2px solid var(--blue)'; this.style.background='linear-gradient(135deg,#eff6ff,#eef2ff)'; this.style.boxShadow='0 0 0 2px #2563eb22'; const sp=this.querySelector('span'); if(sp) sp.style.color='var(--blue)'; }}catch(e){};try{if(typeof window.cfgTouchPrefsSync==='function')window.cfgTouchPrefsSync();}catch(e){}" style="display:flex;flex-direction:column;align-items:center;gap:5px;padding:9px 6px;border-radius:var(--r);border:${sel?'2px solid var(--blue)':'1.5px solid var(--border)'};background:${sel?'linear-gradient(135deg,#eff6ff,#eef2ff)':'var(--white)'};cursor:pointer;box-shadow:${sel?'0 0 0 2px #2563eb22':'none'}">
                  <div style="width:32px;height:32px;background:linear-gradient(135deg,#6366f1,#a855f7);${s.preview};flex-shrink:0"></div>
                  <span style="font-size:10px;font-weight:900;color:${sel?'var(--blue)':'var(--text2)'};text-align:center;line-height:1.2">${s.label}</span>
                </button>`;
              }).join('');
            })()}
          </div>
        </div>
        <div style="margin-bottom:10px">
          <div style="font-size:var(--fs-sm);font-weight:700;color:var(--text2);margin-bottom:8px">📏 대학 로고 이미지 크기 <span id="cfg-ul-size-val" style="font-weight:400;color:var(--gray-l)">${(()=>{try{return parseInt(localStorage.getItem('su_ul_size')||'34');}catch(e){return 34;}})()}px</span></div>
          <input type="range" min="20" max="60" step="2" value="${(()=>{try{return parseInt(localStorage.getItem('su_ul_size')||'34');}catch(e){return 34;}})()}" style="width:100%;accent-color:var(--blue)"
            oninput="localStorage.setItem('su_ul_size',String(this.value));if(typeof applyUnivLogoVars==='function')applyUnivLogoVars();document.getElementById('cfg-ul-size-val').textContent=this.value+'px';try{window._cfgSoftRefreshLive&&window._cfgSoftRefreshLive();}catch(e){};try{if(typeof window.cfgTouchPrefsSync==='function')window.cfgTouchPrefsSync();}catch(e){}">
        </div>
        <div>
          <div style="font-size:var(--fs-sm);font-weight:700;color:var(--text2);margin-bottom:8px">📦 대학 로고 레이아웃 크기 <span id="cfg-ul-box-val" style="font-weight:400;color:var(--gray-l)">${(()=>{try{return parseInt(localStorage.getItem('su_ul_box')||'46');}catch(e){return 46;}})()}px</span></div>
          <input type="range" min="34" max="72" step="2" value="${(()=>{try{return parseInt(localStorage.getItem('su_ul_box')||'46');}catch(e){return 46;}})()}" style="width:100%;accent-color:var(--blue)"
            oninput="localStorage.setItem('su_ul_box',String(this.value));if(typeof applyUnivLogoVars==='function')applyUnivLogoVars();document.getElementById('cfg-ul-box-val').textContent=this.value+'px';try{window._cfgSoftRefreshLive&&window._cfgSoftRefreshLive();}catch(e){};try{if(typeof window.cfgTouchPrefsSync==='function')window.cfgTouchPrefsSync();}catch(e){}">
        </div>
      </div>
      </div>
    </details>
    <details class="cfg-grp" style="border:1px solid var(--border);border-radius:10px;overflow:hidden">
      <summary style="cursor:pointer;display:flex;align-items:center;gap:8px;padding:10px 12px;background:var(--surface);font-weight:900;font-size:var(--fs-sm);color:var(--text2)">🏛️ 대학 상세 · 현황판 로고 크기</summary>
      <div style="padding:12px;display:flex;flex-direction:column;gap:14px">
          <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text2);margin-bottom:10px">🏛️ 대학 상세(모달) 로고 크기</div>
          <div style="margin-bottom:10px">
            <div style="font-size:var(--fs-sm);font-weight:700;color:var(--text2);margin-bottom:8px">📏 로고 이미지 크기 <span id="cfg-ul-size-d-val" style="font-weight:400;color:var(--gray-l)">${(()=>{try{return parseInt(localStorage.getItem('su_ul_size_detail')||localStorage.getItem('su_ul_size')||'46');}catch(e){return 46;}})()}px</span></div>
            <input type="range" min="28" max="72" step="2" value="${(()=>{try{return parseInt(localStorage.getItem('su_ul_size_detail')||localStorage.getItem('su_ul_size')||'46');}catch(e){return 46;}})()}" style="width:100%;accent-color:var(--blue)"
              oninput="localStorage.setItem('su_ul_size_detail',String(this.value));if(typeof applyUnivLogoVars==='function')applyUnivLogoVars();document.getElementById('cfg-ul-size-d-val').textContent=this.value+'px';try{window._cfgSoftRefreshLive&&window._cfgSoftRefreshLive();}catch(e){};try{if(typeof window.cfgTouchPrefsSync==='function')window.cfgTouchPrefsSync();}catch(e){}">
          </div>
          <div>
            <div style="font-size:var(--fs-sm);font-weight:700;color:var(--text2);margin-bottom:8px">📦 로고 박스 크기 <span id="cfg-ul-box-d-val" style="font-weight:400;color:var(--gray-l)">${(()=>{try{return parseInt(localStorage.getItem('su_ul_box_detail')||localStorage.getItem('su_ul_box')||'72');}catch(e){return 72;}})()}px</span></div>
            <input type="range" min="48" max="110" step="2" value="${(()=>{try{return parseInt(localStorage.getItem('su_ul_box_detail')||localStorage.getItem('su_ul_box')||'72');}catch(e){return 72;}})()}" style="width:100%;accent-color:var(--blue)"
              oninput="localStorage.setItem('su_ul_box_detail',String(this.value));if(typeof applyUnivLogoVars==='function')applyUnivLogoVars();document.getElementById('cfg-ul-box-d-val').textContent=this.value+'px';try{window._cfgSoftRefreshLive&&window._cfgSoftRefreshLive();}catch(e){};try{if(typeof window.cfgTouchPrefsSync==='function')window.cfgTouchPrefsSync();}catch(e){}">
          </div>
        <div style="border-top:1px dashed var(--border2);padding-top:12px">
          <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text2);margin-bottom:10px">📊 현황판(대학별 신현황판) 대학 로고 크기</div>
          <div>
            <div style="font-size:var(--fs-sm);font-weight:700;color:var(--text2);margin-bottom:8px">📏 로고 크기 <span id="cfg-b2-ul-val" style="font-weight:400;color:var(--gray-l)">${(()=>{try{return parseInt(localStorage.getItem('su_b2_univ_logo_size')||'42');}catch(e){return 42;}})()}px</span></div>
            <input type="range" min="28" max="72" step="2" value="${(()=>{try{return parseInt(localStorage.getItem('su_b2_univ_logo_size')||'42');}catch(e){return 42;}})()}" style="width:100%;accent-color:var(--blue)"
              oninput="localStorage.setItem('su_b2_univ_logo_size',String(this.value));if(typeof applyBoard2LogoVars==='function')applyBoard2LogoVars();document.getElementById('cfg-b2-ul-val').textContent=this.value+'px';try{window._cfgSoftRefreshBoard2&&window._cfgSoftRefreshBoard2();}catch(e){};try{if(typeof window.cfgTouchPrefsSync==='function')window.cfgTouchPrefsSync();}catch(e){}">
          </div>
        </div>
      </div>
    </details>
    <details class="cfg-grp" style="border:1px solid var(--border);border-radius:10px;overflow:hidden">
      <summary style="cursor:pointer;display:flex;align-items:center;gap:8px;padding:10px 12px;background:var(--surface);font-weight:900;font-size:var(--fs-sm);color:var(--text2)">🖼️ 멤버 표시 모드</summary>
      <div style="padding:12px;display:flex;flex-direction:column;gap:14px">
          <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text2);margin-bottom:8px">🖼️ 현황판(대학별) 멤버 표시 모드</div>
          <div style="font-size:var(--fs-caption);color:var(--gray-l);margin-bottom:10px">대학 카드 안에서 멤버들을 어떤 형태로 보여줄지 선택합니다.</div>
          <div id="cfg-b2-univview" style="display:flex;flex-wrap:wrap;gap:8px">
            ${(()=>{
              const cur = (typeof window.cfgGetB2UnivProfileView==='function') ? window.cfgGetB2UnivProfileView() : 'default';
              const mkBtn = (v, label) => {
                const on = (cur===v);
                return `<button type="button" onclick="cfgSetB2UnivProfileView('${v}');try{const g=document.getElementById('cfg-b2-univview'); if(g){ g.querySelectorAll('button').forEach(b=>{ b.style.border='1.5px solid rgba(148,163,184,.20)'; b.style.background='linear-gradient(135deg,rgba(255,255,255,.98),rgba(248,250,252,.94))'; b.style.color='var(--text2)'; b.style.boxShadow='0 4px 10px rgba(15,23,42,.04)'; }); this.style.border='1.5px solid #2563eb'; this.style.background='linear-gradient(135deg,#eff6ff,#dbeafe)'; this.style.color='#1d4ed8'; this.style.boxShadow='0 6px 16px rgba(37,99,235,.12)'; }}catch(e){}"
                  style="border:${on?'1.5px solid #2563eb':'1.5px solid rgba(148,163,184,.20)'};background:${on?'linear-gradient(135deg,#eff6ff,#dbeafe)':'linear-gradient(135deg,rgba(255,255,255,.98),rgba(248,250,252,.94))'};color:${on?'#1d4ed8':'var(--text2)'};box-shadow:${on?'0 6px 16px rgba(37,99,235,.12)':'0 4px 10px rgba(15,23,42,.04)'};padding:8px 10px;border-radius:14px;font-size:var(--fs-sm);font-weight:900;cursor:pointer">${label}</button>`;
              };
              return [
                mkBtn('default','기본'),
                mkBtn('poster','포스터'),
                mkBtn('heat','히트맵'),
                mkBtn('split','리스트'),
                mkBtn('board','보드')
              ].join('');
            })()}
          </div>
      </div>
    </details>
    <details class="cfg-grp" style="border:1px solid var(--border);border-radius:10px;overflow:hidden">
      <summary style="cursor:pointer;display:flex;align-items:center;gap:8px;padding:10px 12px;background:var(--surface);font-weight:900;font-size:var(--fs-sm);color:var(--text2)">🧷 로고 워터마크(우측 아래/가운데)</summary>
      <div style="padding:12px;display:flex;flex-direction:column;gap:14px">
          <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text2);margin-bottom:8px">🧷 대학별 신현황판 워터마크(우측 아래/가운데)</div>
          <div style="font-size:var(--fs-caption);color:var(--gray-l);margin-bottom:10px">우측 아래 로고(작은 워터마크)와 가운데 로고(배경 로고)의 위치/크기를 전체 또는 대학별로 조정합니다.</div>
          ${(()=>{
            const _esc = (s)=>String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
            const _sel = (()=>{ try{ return (localStorage.getItem('su_cfg_b2_wm_univ')||'__ALL__').trim() || '__ALL__'; }catch(e){ return '__ALL__'; } })();
            const _list = (Array.isArray(window.univCfg)?window.univCfg:[]).map(u=>String(u&&u.name||'').trim()).filter(Boolean).sort((a,b)=>a.localeCompare(b,'ko'));
            const _cfg = (typeof window._cfgB2LogoOverlayGet==='function') ? window._cfgB2LogoOverlayGet(_sel) : { wmScale:150, wmRight:120, wmBottom:30, bgScale:100 };
            const _gcfg = (typeof window._cfgB2LogoOverlayGet==='function') ? window._cfgB2LogoOverlayGet('__ALL__') : { wmGlobalOn:1 };
            const _wmGlobalOn = (_gcfg.wmGlobalOn==null) ? 1 : Number(_gcfg.wmGlobalOn);
            const _wmScale = parseInt(_cfg.wmScale||150,10);
            const _wmRight = parseInt(_cfg.wmRight||120,10);
            const _wmBottom = parseInt(_cfg.wmBottom||30,10);
            const _bgScale = parseInt(_cfg.bgScale||100,10);
            return `
              <label style="display:flex;align-items:center;gap:8px;font-size:var(--fs-sm);cursor:pointer;font-weight:900;color:var(--text2);margin-bottom:12px">
                <input id="cfg-b2-wm-global-on" type="checkbox" style="width:15px;height:15px" ${_wmGlobalOn? 'checked' : ''} onchange="try{if(typeof window._cfgB2LogoOverlaySet==='function')window._cfgB2LogoOverlaySet('__ALL__','wmGlobalOn',this.checked?1:0);}catch(e){};try{window._cfgSoftRefreshBoard2&&window._cfgSoftRefreshBoard2();}catch(e){}">
                우측 아래 로고 전체 표시(ON/OFF)
              </label>
              <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:12px">
                <div style="font-size:var(--fs-sm);font-weight:700;color:var(--text2);min-width:44px">대상</div>
                <select id="cfg-b2-wm-univ" style="flex:1;min-width:220px" onchange="localStorage.setItem('su_cfg_b2_wm_univ',this.value);try{window._cfgB2LogoOverlayUiSync&&window._cfgB2LogoOverlayUiSync();}catch(e){}">
                  <option value="__ALL__"${_sel==='__ALL__'?' selected':''}>전체(기본)</option>
                  ${_list.map(n=>`<option value="${_esc(n)}"${_sel===n?' selected':''}>${_esc(n)}</option>`).join('')}
                </select>
                <button class="btn btn-xs btn-w" onclick="try{const sel=(document.getElementById('cfg-b2-wm-univ')||{}).value||'__ALL__';if(typeof window._cfgB2LogoOverlayReset==='function')window._cfgB2LogoOverlayReset(sel);localStorage.setItem('su_cfg_b2_wm_univ',sel);}catch(e){};try{window._cfgB2LogoOverlayUiSync&&window._cfgB2LogoOverlayUiSync();}catch(e){};try{window._cfgSoftRefreshBoard2&&window._cfgSoftRefreshBoard2();}catch(e){}">초기화</button>
              </div>
              <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px">
                <div style="padding:12px;background:var(--white);border:1px solid var(--border);border-radius:12px">
                  <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text2);margin-bottom:8px">우측 아래 로고</div>
                  <label style="display:flex;align-items:center;gap:8px;font-size:var(--fs-sm);cursor:pointer;font-weight:800;color:var(--text2);margin-bottom:10px">
                    <input id="cfg-b2-wm-on" type="checkbox" style="width:15px;height:15px" ${((_cfg.wmOn==null)?1:Number(_cfg.wmOn))? 'checked' : ''} onchange="try{const sel=(document.getElementById('cfg-b2-wm-univ')||{}).value||'__ALL__';if(typeof window._cfgB2LogoOverlaySet==='function')window._cfgB2LogoOverlaySet(sel,'wmOn',this.checked?1:0);}catch(e){};try{window._cfgSoftRefreshBoard2&&window._cfgSoftRefreshBoard2();}catch(e){}">
                    표시(ON/OFF)
                  </label>
                  <div style="margin-bottom:10px">
                    <div style="font-size:var(--fs-sm);font-weight:700;color:var(--text2);margin-bottom:6px">크기 <span id="cfg-b2-wm-scale-val" style="font-weight:400;color:var(--gray-l)">${_wmScale}% (x${(_wmScale/100).toFixed(2)})</span></div>
                    <input id="cfg-b2-wm-scale" type="range" min="50" max="250" step="5" value="${_wmScale}" style="width:100%;accent-color:var(--blue)"
                      oninput="try{const sel=(document.getElementById('cfg-b2-wm-univ')||{}).value||'__ALL__';if(typeof window._cfgB2LogoOverlaySet==='function')window._cfgB2LogoOverlaySet(sel,'wmScale',this.value);document.getElementById('cfg-b2-wm-scale-val').textContent=this.value+'% (x'+(this.value/100).toFixed(2)+')';}catch(e){};try{window._cfgSoftRefreshBoard2&&window._cfgSoftRefreshBoard2();}catch(e){}">
                  </div>
                  <div style="margin-bottom:10px">
                    <div style="font-size:var(--fs-sm);font-weight:700;color:var(--text2);margin-bottom:6px">좌측 이동(오른쪽에서) <span id="cfg-b2-wm-right-val" style="font-weight:400;color:var(--gray-l)">${_wmRight}px</span></div>
                    <input id="cfg-b2-wm-right" type="range" min="0" max="260" step="2" value="${_wmRight}" style="width:100%;accent-color:var(--blue)"
                      oninput="try{const sel=(document.getElementById('cfg-b2-wm-univ')||{}).value||'__ALL__';if(typeof window._cfgB2LogoOverlaySet==='function')window._cfgB2LogoOverlaySet(sel,'wmRight',this.value);document.getElementById('cfg-b2-wm-right-val').textContent=this.value+'px';}catch(e){};try{window._cfgSoftRefreshBoard2&&window._cfgSoftRefreshBoard2();}catch(e){}">
                  </div>
                  <div>
                    <div style="font-size:var(--fs-sm);font-weight:700;color:var(--text2);margin-bottom:6px">위로 이동(아래에서) <span id="cfg-b2-wm-bottom-val" style="font-weight:400;color:var(--gray-l)">${_wmBottom}px</span></div>
                    <input id="cfg-b2-wm-bottom" type="range" min="0" max="160" step="2" value="${_wmBottom}" style="width:100%;accent-color:var(--blue)"
                      oninput="try{const sel=(document.getElementById('cfg-b2-wm-univ')||{}).value||'__ALL__';if(typeof window._cfgB2LogoOverlaySet==='function')window._cfgB2LogoOverlaySet(sel,'wmBottom',this.value);document.getElementById('cfg-b2-wm-bottom-val').textContent=this.value+'px';}catch(e){};try{window._cfgSoftRefreshBoard2&&window._cfgSoftRefreshBoard2();}catch(e){}">
                  </div>
                </div>
                <div style="padding:12px;background:var(--white);border:1px solid var(--border);border-radius:12px">
                  <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text2);margin-bottom:8px">가운데 로고(배경)</div>
                  <div style="margin-bottom:10px">
                    <div style="font-size:var(--fs-sm);font-weight:700;color:var(--text2);margin-bottom:6px">크기 <span id="cfg-b2-bg-scale-val" style="font-weight:400;color:var(--gray-l)">${_bgScale}%</span></div>
                    <input id="cfg-b2-bg-scale" type="range" min="60" max="120" step="2" value="${_bgScale}" style="width:100%;accent-color:var(--blue)"
                      oninput="try{const sel=(document.getElementById('cfg-b2-wm-univ')||{}).value||'__ALL__';if(typeof window._cfgB2LogoOverlaySet==='function')window._cfgB2LogoOverlaySet(sel,'bgScale',this.value);document.getElementById('cfg-b2-bg-scale-val').textContent=this.value+'%';}catch(e){};try{window._cfgSoftRefreshBoard2&&window._cfgSoftRefreshBoard2();}catch(e){}">
                    <div style="font-size:var(--fs-caption);color:var(--gray-l);margin-top:8px">대학 배경이 로고형(가운데 배치)인 경우에만 적용됩니다.</div>
                  </div>
                </div>
              </div>
            `;
          })()}
        </div>
      </div>
    </details>
  </details>
  ${_scfgD('oldbright','🎨 구현황판 카드 배경/라벨 밝기 조절')}
    <p style="font-size:var(--fs-sm);color:var(--gray-l);margin-bottom:12px">구현황판 카드의 배경과 라벨 밝기를 조절합니다. (구현황판 툴바에서도 조절 가능)</p>
    <div style="font-size:var(--fs-caption);color:var(--blue);font-weight:700;margin-bottom:8px">✓ 실시간 미리보기 — 슬라이더를 움직이면 바로 반영됩니다</div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r)">
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px">
        <label style="font-size:var(--fs-sm);font-weight:600;color:var(--text2);min-width:80px">배경 밝기:</label>
        <input type="range" id="cfg-b2-bg-alpha" min="0" max="30" value="9" style="flex:1;accent-color:var(--blue)" oninput="document.getElementById('cfg-b2-bg-alpha-val').textContent=this.value+'%';clearTimeout(window._b2BrightLiveT);window._b2BrightLiveT=setTimeout(()=>{if(typeof saveOldDashboardBrightness==='function')saveOldDashboardBrightness(true);},150)">
        <span style="font-size:var(--fs-caption);color:var(--gray-l);min-width:30px;text-align:right;font-weight:700" id="cfg-b2-bg-alpha-val">9%</span>
      </div>
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px">
        <label style="font-size:var(--fs-sm);font-weight:600;color:var(--text2);min-width:80px">라벨 밝기:</label>
        <input type="range" id="cfg-b2-label-alpha" min="0" max="40" value="16" style="flex:1;accent-color:var(--blue)" oninput="document.getElementById('cfg-b2-label-alpha-val').textContent=this.value+'%';clearTimeout(window._b2BrightLiveT);window._b2BrightLiveT=setTimeout(()=>{if(typeof saveOldDashboardBrightness==='function')saveOldDashboardBrightness(true);},150)">
        <span style="font-size:var(--fs-caption);color:var(--gray-l);min-width:30px;text-align:right;font-weight:700" id="cfg-b2-label-alpha-val">16%</span>
      </div>
      <button class="btn btn-b" onclick="saveOldDashboardBrightness()">💾 저장</button>
    </div>
  </details>
  ${_scfgD('briefingfx','🎞️ 브리핑 디자인 & 효과')}
    <p style="font-size:var(--fs-sm);color:var(--gray-l);margin-bottom:12px">브리핑 탭 전체 디자인 테마와, 이달/이번주 MVP 카드의 프로필 사진 위 효과 강도·스타일, 카드 디자인 모드를 조절합니다. 변경하면 즉시 반영됩니다.</p>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r);display:flex;flex-direction:column;gap:16px">
      <div>
        <label style="font-size:var(--fs-sm);font-weight:700;color:var(--text2);display:block;margin-bottom:6px">🖋️ 브리핑 전체 디자인 테마</label>
        <select style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:8px;font-size:var(--fs-sm)"
          onchange="localStorage.setItem('su_b2_briefing_theme',this.value);render()">
          <option value="classic" ${_briefingTheme==='classic'?'selected':''}>클래식 (기본 · 신문/매거진 톤)</option>
          <option value="minimal" ${_briefingTheme==='minimal'?'selected':''}>미니멀 (그레이 톤 · 절제된 강조)</option>
          <option value="vivid" ${_briefingTheme==='vivid'?'selected':''}>비비드 (보라·핑크 포인트 컬러)</option>
          <option value="mono" ${_briefingTheme==='mono'?'selected':''}>모노 (세피아 신문지 느낌)</option>
          <option value="elegant" ${_briefingTheme==='elegant'?'selected':''}>엘레강트 (세련된 · 네이비·골드)</option>
          <option value="pastel" ${_briefingTheme==='pastel'?'selected':''}>파스텔 (이쁜 · 핑크·라벤더)</option>
          <option value="luxury" ${_briefingTheme==='luxury'?'selected':''}>럭셔리 (화려한 · 블랙·골드)</option>
          <option value="sports" ${_briefingTheme==='sports'?'selected':''}>스포츠 스타일 (레드·블루 다이나믹)</option>
          <option value="esports" ${_briefingTheme==='esports'?'selected':''}>e스포츠 스타일 (퍼플·시안 네온)</option>
          <option value="pop" ${_briefingTheme==='pop'?'selected':''}>팝 컬러 (오렌지·틸 발랄함)</option>
          <option value="nature" ${_briefingTheme==='nature'?'selected':''}>네이처 (편안한 그린 톤)</option>
          <option value="ocean" ${_briefingTheme==='ocean'?'selected':''}>오션 (시원한 블루 그라디언트)</option>
          <option value="sunset" ${_briefingTheme==='sunset'?'selected':''}>선셋 (따뜻한 노을 그라디언트)</option>
          <option value="neon" ${_briefingTheme==='neon'?'selected':''}>네온 (화려한 · 시안·마젠타)</option>
        </select>
        <div style="font-size:10px;color:var(--gray-l);margin-top:4px">헤더, 카드 테두리, 포인트 색상 등 브리핑 탭 전체 색감 톤이 바뀝니다.</div>
      </div>
      <hr style="border:none;border-top:1px solid var(--border);margin:0">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px">
        <label style="font-size:var(--fs-sm);font-weight:700;color:var(--text2)">MVP 카드 그라디언트 효과 사용</label>
        <input type="checkbox" id="cfg-b2mvp-fx-on" style="width:16px;height:16px" ${_mvpFxOn?'checked':''}
          onchange="localStorage.setItem('su_b2mvp_fx_on',this.checked?'1':'0');render()">
      </div>
      <div>
        <div style="display:flex;gap:8px;align-items:center;margin-bottom:4px">
          <label style="font-size:var(--fs-sm);font-weight:600;color:var(--text2);min-width:70px">효과 강도:</label>
          <input type="range" id="cfg-b2mvp-fx-intensity" min="0" max="100" step="5" value="${_mvpFxIntensity}" style="flex:1;accent-color:var(--blue)"
            oninput="document.getElementById('cfg-b2mvp-fx-intensity-val').textContent=this.value+'%'"
            onchange="localStorage.setItem('su_b2mvp_fx_intensity',this.value);render()">
          <span id="cfg-b2mvp-fx-intensity-val" style="font-size:var(--fs-caption);color:var(--gray-l);min-width:34px;text-align:right;font-weight:700">${_mvpFxIntensity}%</span>
        </div>
        <div style="font-size:10px;color:var(--gray-l)">기본값(45%)이 은은하게 어울립니다. 값이 높을수록 하단이 진하게 어두워집니다.</div>
      </div>
      <div>
        <label style="font-size:var(--fs-sm);font-weight:600;color:var(--text2);display:block;margin-bottom:6px">효과 스타일</label>
        <select style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:8px;font-size:var(--fs-sm)"
          onchange="localStorage.setItem('su_b2mvp_fx_style',this.value);render()">
          <option value="fade" ${_mvpFxStyle==='fade'?'selected':''}>하단 그라디언트 (기본)</option>
          <option value="vignette" ${_mvpFxStyle==='vignette'?'selected':''}>비네트 (모서리 음영)</option>
          <option value="topbottom" ${_mvpFxStyle==='topbottom'?'selected':''}>상하 그라디언트</option>
          <option value="tint" ${_mvpFxStyle==='tint'?'selected':''}>컬러 틴트 (순위 색상)</option>
          <option value="spotlight" ${_mvpFxStyle==='spotlight'?'selected':''}>스포트라이트 (무대 조명형)</option>
          <option value="noir" ${_mvpFxStyle==='noir'?'selected':''}>느와르 (고대비 흑백톤)</option>
          <option value="diagonal" ${_mvpFxStyle==='diagonal'?'selected':''}>대각선 (역동적인 음영)</option>
          <option value="glass" ${_mvpFxStyle==='glass'?'selected':''}>글래스 (하단 유리질감 패널)</option>
          <option value="none" ${_mvpFxStyle==='none'?'selected':''}>효과 없음 (원본 그대로)</option>
        </select>
      </div>
      <div>
        <label style="font-size:var(--fs-sm);font-weight:600;color:var(--text2);display:block;margin-bottom:6px">카드 디자인 모드</label>
        <select style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:8px;font-size:var(--fs-sm)"
          onchange="localStorage.setItem('su_b2mvp_design_mode',this.value);render()">
          <option value="photo" ${_mvpDesignMode==='photo'?'selected':''}>풀사진형 (기본)</option>
          <option value="panel" ${_mvpDesignMode==='panel'?'selected':''}>하단 패널형</option>
          <option value="frame" ${_mvpDesignMode==='frame'?'selected':''}>미니멀 프레임형</option>
          <option value="glasscard" ${_mvpDesignMode==='glasscard'?'selected':''}>글래스카드형 (떠 있는 유리 패널)</option>
          <option value="border" ${_mvpDesignMode==='border'?'selected':''}>컬러 테두리 강조형</option>
          <option value="ribbon" ${_mvpDesignMode==='ribbon'?'selected':''}>리본형 (대각선 순위 리본)</option>
          <option value="split" ${_mvpDesignMode==='split'?'selected':''}>스플릿형 (순위 컬러 라인 강조)</option>
          <option value="poster" ${_mvpDesignMode==='poster'?'selected':''}>포스터형 (고대비 타이포 강조)</option>
        </select>
      </div>
      <button class="btn btn-w btn-xs" style="align-self:flex-start"
        onclick="localStorage.removeItem('su_b2mvp_fx_on');localStorage.removeItem('su_b2mvp_fx_intensity');localStorage.removeItem('su_b2mvp_fx_style');localStorage.removeItem('su_b2mvp_design_mode');localStorage.removeItem('su_b2_briefing_theme');render()">↩️ 기본값으로 초기화</button>
    </div>
  </details>
  </div>
  `;
}
