/* ══════════════════════════════════════════════════════════════
   rec-side-profiles.js  –  기록 카드 양쪽 끝 참여자 프로필 패널
   켜기/끄기: su_rec_side_panel_on (기본 '1')

   [설정]
   - su_rsp_size         : 이미지 크기 (px)
   - su_rsp_valign       : 이미지 세로 위치 (top | center | bottom)
   - su_rsp_hoffset      : 이미지 수평 이동 (px, -200~+200, 양수=카드 중앙 방향)
   - su_rsp_brightness   : 밝기
   - su_rsp_effect       : 필터 효과
   - su_rsp_width        : 패널 너비 (px)
   - su_rsp_show_box     : 패널 배경/테두리 표시 ('1'=표시, 기본 '0'=이미지만)
   - su_rsp_image_type   : 'profile' | 'logo'  (기본: profile)
   - su_rsp_comp_on      : 대회탭(조별리그/토너먼트)에도 표시 (기본: '1')

   [선수 선택 로직]
   - 승리팀: sets.games 에서 winner 일치 게임의 해당팀 선수만
   - 패배팀: sets.games 에서 winner 불일치 게임의 해당팀 선수만
   - 게임 데이터 없으면: teamAMembers/teamBMembers 전원
   - 이미지/로고가 없으면 패널 자체를 렌더링하지 않음
══════════════════════════════════════════════════════════════ */
(function(){

  function _isOn(){
    try{ return (localStorage.getItem('su_rec_side_panel_on') ?? '1') !== '0'; }
    catch(e){ return true; }
  }

  function _isCompOn(){
    try{ return (localStorage.getItem('su_rsp_comp_on') ?? '1') !== '0'; }
    catch(e){ return true; }
  }

  function _getImageType(){
    try{ return localStorage.getItem('su_rsp_image_type') || 'profile'; }
    catch(e){ return 'profile'; }
  }

  function _getHalign(){
    try{ return localStorage.getItem('su_rsp_halign') || 'center'; }
    catch(e){ return 'center'; }
  }

  function _cfg(key, def){
    try{ var v = localStorage.getItem(key); return v == null ? def : v; }
    catch(e){ return def; }
  }

  /* ── 승/패 선수 분리 수집 ──
     side: 'a' or 'b'
     isWinSide: 해당 side가 승리팀인지
     m: 매치 데이터 (sets, teamAMembers, teamBMembers 포함)
  */
  function _getWinLoseNames(m, side, isWinSide){
    var collected = {};
    function add(v){
      if(!v) return;
      String(v).split(',').forEach(function(s){ var t=s.trim(); if(t) collected[t]=1; });
    }
    var isA = (side === 'a');
    var hasSets = m && m.sets && m.sets.length;

    if(hasSets){
      (m.sets||[]).forEach(function(s){
        (s.games||[]).forEach(function(g){
          var gWinA = (g.winner === 'A');
          var gWinB = (g.winner === 'B');
          var noWinner = !g.winner;

          if(isA){
            var pA = g.playerA || g.a1 || g.a || '';
            var pA2 = g.a2 || '';
            if(isWinSide){
              if(gWinA){ if(pA) add(pA); if(pA2) add(pA2); if(g.wName && !pA) add(g.wName); }
              if(noWinner){ if(pA) add(pA); if(pA2) add(pA2); }
            } else {
              if(gWinB){ if(pA) add(pA); if(pA2) add(pA2); if(g.lName && !pA) add(g.lName); }
              if(noWinner){ if(pA) add(pA); if(pA2) add(pA2); }
            }
          } else {
            var pB = g.playerB || g.b1 || g.b || '';
            var pB2 = g.b2 || '';
            if(isWinSide){
              if(gWinB){ if(pB) add(pB); if(pB2) add(pB2); if(g.wName && !pB) add(g.wName); }
              if(noWinner){ if(pB) add(pB); if(pB2) add(pB2); }
            } else {
              if(gWinA){ if(pB) add(pB); if(pB2) add(pB2); if(g.lName && !pB) add(g.lName); }
              if(noWinner){ if(pB) add(pB); if(pB2) add(pB2); }
            }
          }
        });
      });
    }

    // 수집된 선수 없으면 저장 멤버 전원 fallback
    var names = Object.keys(collected);
    if(!names.length){
      var stored = isA ? (m && m.teamAMembers||[]) : (m && m.teamBMembers||[]);
      (stored||[]).forEach(function(x){ add(typeof x==='string'?x:(x&&x.name||'')); });
      names = Object.keys(collected);
    }
    return names;
  }

  function _pick(arr){
    if(!arr||!arr.length) return null;
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function _rgba(hex, a){
    var h = String(hex||'').replace('#','');
    if(h.length!==6) return 'rgba(148,163,184,'+a+')';
    return 'rgba('+parseInt(h.slice(0,2),16)+','+parseInt(h.slice(2,4),16)+','+parseInt(h.slice(4,6),16)+','+a+')';
  }

  function _effectFilter(effect, brightness, isLose){
    var br = parseFloat(brightness) || 1.0;
    var base = '';
    switch(effect){
      case 'sepia':   base = 'sepia(0.55) saturate(1.2)'; break;
      case 'warm':    base = 'sepia(0.3) saturate(1.4) hue-rotate(-15deg)'; break;
      case 'cool':    base = 'saturate(0.85) hue-rotate(20deg)'; break;
      case 'vivid':   base = 'saturate(1.7) contrast(1.1)'; break;
      case 'dark':    base = 'brightness(0.60) contrast(1.2)'; break;
      case 'mono':    base = 'grayscale(1) contrast(1.1)'; break;
      default:        base = ''; break;
    }
    var brPart = 'brightness(' + br.toFixed(2) + ')';
    var combined = base ? (base + ' ' + brPart) : brPart;
    if(isLose) combined += ' grayscale(0.75) opacity(0.45)';
    return combined;
  }

  function _univLogoImg(univName, sizePx){
    try{
      var url = (window.UNIV_ICONS && window.UNIV_ICONS[univName]) || '';
      if(!url && Array.isArray(window.univCfg)){
        var found = window.univCfg.find(function(x){ return x.name === univName; });
        if(found) url = found.icon || '';
      }
      if(!url) return '';
      var radius = _cfg('su_profile_radius', '6px') || '6px';
      return '<img src="' + (typeof toHttpsUrl==='function'?toHttpsUrl(url):url) + '"'
           + ' style="width:'+sizePx+'px;height:'+sizePx+'px;object-fit:contain;border-radius:'+radius+';display:block;"'
           + ' onerror="this.closest(\'.rec-side-profiles\')&&(this.closest(\'.rec-side-profiles\').style.display=\'none\')">';
    }catch(e){ return ''; }
  }

  /* ── 패널 1개 HTML ──
     이미지/로고가 없으면 '' 반환 → 레이아웃 없음
  */
  function _panel(name, isWin, col, isLeft){
    if(!name) return '';

    var sizePx    = Math.max(40, Math.min(160, parseInt(_cfg('su_rsp_size', '72'), 10) || 72));
    var valign    = _cfg('su_rsp_valign', 'center');
    var brightness= _cfg('su_rsp_brightness', '1.0');
    var effect    = _cfg('su_rsp_effect', 'none');
    var widthPx   = Math.max(60, Math.min(180, parseInt(_cfg('su_rsp_width', '90'), 10) || 90));
    var radius    = _cfg('su_profile_radius', '6px') || '6px';
    var imageType = _getImageType();
    // 수평 offset: 왼쪽 패널은 양수=오른쪽(카드 중앙), 오른쪽 패널은 양수=왼쪽(카드 중앙)
    var rawOffset = Math.max(-200, Math.min(200, parseInt(_cfg('su_rsp_hoffset', '0'), 10) || 0));
    var hoffset   = isLeft ? rawOffset : -rawOffset;
    // 네모 박스(배경/테두리) 표시 여부
    var showBox   = (_cfg('su_rsp_show_box', '0') !== '0');

    var raw = '';
    if(imageType === 'logo'){
      raw = _univLogoImg(name, sizePx);
    } else {
      if(typeof getPlayerPhotoHTML !== 'function') return '';
      var prev = window.__detailCtx;
      window.__detailCtx = 'recCard';
      raw = getPlayerPhotoHTML(name, sizePx + 'px', '');
      window.__detailCtx = prev;
    }

    // 이미지/로고 없으면 패널 렌더링 안 함
    if(!raw) return '';

    // 프로필 모드에서 race 이니셜만 있는 경우(이미지 없음) 패널 숨김
    if(imageType === 'profile' && raw.indexOf('<span') === 0 && raw.indexOf('<img') === -1){
      return '';
    }

    var filterStr = _effectFilter(effect, brightness, !isWin);
    var shadow = showBox
      ? (isWin ? '0 4px 18px ' + _rgba(col, 0.38) : '0 2px 8px rgba(0,0,0,0.10)')
      : (isWin ? '0 4px 16px ' + _rgba(col, 0.32) : '0 2px 8px rgba(0,0,0,0.12)');

    // 세로 정렬: top→flex-start, center→center, bottom→flex-end
    var jc = valign === 'top' ? 'flex-start' : valign === 'bottom' ? 'flex-end' : 'center';

    // 수평 offset: 왼쪽 패널은 오른쪽(+)이 카드 중앙 방향, 오른쪽 패널은 왼쪽(-)이 카드 중앙 방향
    // isLeft 여부는 호출 측에서 알 수 없으므로 translateX를 래퍼에 적용
    // → rsp-inner에 translateX 적용
    var translateStyle = hoffset !== 0 ? 'transform:translateX(' + hoffset + 'px);' : '';

    // 박스 스타일
    var panelBg  = showBox ? (isWin ? _rgba(col, 0.12) : 'rgba(148,163,184,0.07)') : 'transparent';
    var panelBrd = showBox ? (isWin ? _rgba(col, 0.30) : 'rgba(148,163,184,0.18)') : 'transparent';

    return '<div class="rec-side-profiles' + (isWin ? ' rec-side-profiles--win' : ' rec-side-profiles--lose')
         + (showBox ? '' : ' rsp-no-box')
         + '" style="'
         + 'background:' + panelBg + ';'
         + 'outline:1px solid ' + panelBrd + ';'
         + 'min-width:' + widthPx + 'px;'
         + 'max-width:' + widthPx + 'px;'
         + 'overflow:visible;'
         + 'align-items:center;'
         + 'justify-content:' + jc + ';'
         + '">'
         + '<div class="rsp-inner" style="justify-content:center;align-items:' + jc + ';width:100%;overflow:visible;' + translateStyle + '">'
         + '<div style="'
         + 'width:' + sizePx + 'px;'
         + 'height:' + sizePx + 'px;'
         + 'border-radius:' + radius + ';'
         + 'overflow:hidden;'
         + 'flex-shrink:0;'
         + 'box-shadow:' + shadow + ';'
         + 'filter:' + filterStr + ';'
         + 'display:flex;align-items:center;justify-content:center;'
         + '">'
         + raw
         + '</div>'
         + '</div>'
         + '</div>';
  }

  /* ── 메인: 일반 기록 카드용 (미니대전, 대학대전, 대학CK, 티어대회, 프로리그 등) ── */
  window._buildRecSideProfilePanel = function(m, ab, aWin, bWin, ca, cb){
    if(!_isOn()) return {left:'', right:''};
    try{
      var imageType = _getImageType();
      var isDone = aWin || bWin;

      if(imageType === 'logo'){
        var univA = (m && (m.a || m.univA || m.a_univ || '')) || '';
        var univB = (m && (m.b || m.univB || m.b_univ || '')) || '';
        if(!univA && Array.isArray(window.players)){
          var aN2 = (ab && ab.a||[]).map(function(x){ return typeof x==='string'?x:(x&&x.name||''); }).filter(Boolean);
          if(aN2.length){ var pA2=window.players.find(function(p){return p.name===aN2[0];}); if(pA2) univA=pA2.univ||''; }
        }
        if(!univB && Array.isArray(window.players)){
          var bN2 = (ab && ab.b||[]).map(function(x){ return typeof x==='string'?x:(x&&x.name||''); }).filter(Boolean);
          if(bN2.length){ var pB2=window.players.find(function(p){return p.name===bN2[0];}); if(pB2) univB=pB2.univ||''; }
        }
        return {
          left:  univA ? _panel(univA, aWin, ca, true) : '',
          right: univB ? _panel(univB, bWin, cb, false) : '',
        };
      }

      // 프로필 모드: 승패 기반 선수 선택
      var aNamesWin = isDone ? _getWinLoseNames(m, 'a', aWin) : [];
      var bNamesWin = isDone ? _getWinLoseNames(m, 'b', bWin) : [];

      if(!aNamesWin.length){
        aNamesWin = (ab && ab.a||[]).map(function(x){ return typeof x==='string'?x:(x&&x.name||''); }).filter(Boolean);
      }
      if(!bNamesWin.length){
        bNamesWin = (ab && ab.b||[]).map(function(x){ return typeof x==='string'?x:(x&&x.name||''); }).filter(Boolean);
      }

      return {
        left:  _panel(_pick(aNamesWin), aWin, ca, true),
        right: _panel(_pick(bNamesWin), bWin, cb, false),
      };
    }catch(e){
      return {left:'', right:''};
    }
  };

  /* ── 대회탭(조별리그/토너먼트)용 패널 빌드 ──
     teamA/teamB: 대학명
     matchData: 매치 전체 데이터 (sets 포함)
  */
  window._buildCompSidePanel = function(teamA, teamB, aWin, bWin, ca, cb, matchData){
    if(!_isOn()) return {left:'', right:''};
    if(!_isCompOn()) return {left:'', right:''};
    try{
      var imageType = _getImageType();

      if(imageType === 'logo'){
        return {
          left:  teamA ? _panel(teamA, aWin, ca, true) : '',
          right: teamB ? _panel(teamB, bWin, cb, false) : '',
        };
      }

      // 프로필 모드: matchData sets에서 승패 기반 선수 선택
      var pickWinLose = function(side, isWinSide){
        var names = [];
        if(matchData && matchData.sets && matchData.sets.length){
          names = _getWinLoseNames(matchData, side, isWinSide);
        }
        var univName = (side === 'a') ? teamA : teamB;
        if(!names.length && Array.isArray(window.players)){
          var pool = window.players.filter(function(p){ return p.univ === univName && p.photo; });
          if(!pool.length) pool = window.players.filter(function(p){ return p.univ === univName; });
          return _pick(pool) ? _pick(pool).name : '';
        }
        if(names.length && Array.isArray(window.players)){
          var filtered = names.filter(function(n){
            var p = window.players.find(function(pl){ return pl.name === n; });
            return p && (!univName || p.univ === univName);
          });
          if(filtered.length) return _pick(filtered);
        }
        return _pick(names);
      };

      return {
        left:  _panel(pickWinLose('a', aWin), aWin, ca, true),
        right: _panel(pickWinLose('b', bWin), bWin, cb, false),
      };
    }catch(e){
      return {left:'', right:''};
    }
  };

  /* ── 설정 저장 핸들러들 ── */
  window.cfgSetRecSidePanelSettings = function(){
    try{
      var on = !!(document.getElementById('cfg-rec-side-panel-on')||{}).checked;
      localStorage.setItem('su_rec_side_panel_on', on ? '1' : '0');
      if(typeof render === 'function') render();
    }catch(e){}
  };

  window.cfgSetRspSize = function(v){
    try{ localStorage.setItem('su_rsp_size', String(parseInt(v,10)||72)); if(typeof render==='function') render(); }catch(e){}
  };

  window.cfgSetRspWidth = function(v){
    try{ localStorage.setItem('su_rsp_width', String(parseInt(v,10)||90)); if(typeof render==='function') render(); }catch(e){}
  };

  window.cfgSetRspValign = function(v){
    try{ localStorage.setItem('su_rsp_valign', v||'center'); if(typeof render==='function') render(); }catch(e){}
  };

  window.cfgSetRspBrightness = function(v){
    try{ localStorage.setItem('su_rsp_brightness', String(parseFloat(v)||1.0)); if(typeof render==='function') render(); }catch(e){}
  };

  window.cfgSetRspEffect = function(v){
    try{ localStorage.setItem('su_rsp_effect', v||'none'); if(typeof render==='function') render(); }catch(e){}
  };

  window.cfgSetRspImageType = function(v){
    try{ localStorage.setItem('su_rsp_image_type', v||'profile'); if(typeof render==='function') render(); }catch(e){}
  };

  window.cfgSetRspCompOn = function(){
    try{
      var on = !!(document.getElementById('cfg-rsp-comp-on')||{}).checked;
      localStorage.setItem('su_rsp_comp_on', on ? '1' : '0');
      if(typeof render === 'function') render();
    }catch(e){}
  };

  window.cfgSetRspHalign = function(v){
    try{ localStorage.setItem('su_rsp_halign', v||'center'); if(typeof render==='function') render(); }catch(e){}
  };

  window.cfgSetRspHoffset = function(v){
    try{ localStorage.setItem('su_rsp_hoffset', String(parseInt(v,10)||0)); if(typeof render==='function') render(); }catch(e){}
  };

  window.cfgSetRspShowBox = function(on){
    try{ localStorage.setItem('su_rsp_show_box', on ? '1' : '0'); if(typeof render==='function') render(); }catch(e){}
  };

})();
