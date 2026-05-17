/* ══════════════════════════════════════════════════════════════
   rec-side-profiles.js  –  기록 카드 양쪽 끝 참여자 프로필 패널
   켜기/끄기: su_rec_side_panel_on (기본 '1')

   [설정]
   - su_rsp_size         : 이미지 크기 (px)
   - su_rsp_valign       : 이미지 세로 위치 (top | center | bottom)
   - su_rsp_hoffset      : 이미지 수평 이동 (px, -200~+200, 양수=카드 중앙 방향)
   - su_rsp_voffset      : 이미지 수직 이동 (px, -200~+200, 양수=아래쪽)
   - su_rsp_brightness   : 밝기
   - su_rsp_effect       : 필터 효과
   - su_rsp_width        : 패널 너비 (px)
   - su_rsp_show_box     : 패널 배경/테두리 표시 ('1'=표시, 기본 '0'=이미지만)
   - su_rsp_image_type   : 'profile' | 'logo'  (기본: profile)
   - su_rsp_comp_on      : 대회탭(조별리그/토너먼트)에도 표시 (기본: '1')
   - su_rsp_rotate_on    : 참여자 슬라이드쇼 켜기/끄기 (기본: '1')
   - su_rsp_rotate_sec   : 슬라이드쇼 전환 주기(초) (기본: 5)

   [선수 선택 로직]
   - 승리팀: sets.games 에서 winner 일치 게임의 해당팀 선수만
     → 진 선수도 연하게(opacity 0.65) 함께 표시 (슬라이드쇼 순환)
   - 패배팀: sets.games 에서 winner 불일치 게임의 해당팀 선수만
     → 이긴 선수는 일반 색상(연하지 않게), 진 선수만 연하게
   - 게임 데이터 없으면: teamAMembers/teamBMembers 전원
   - 이미지/로고가 없으면 패널 자체를 렌더링하지 않음
══════════════════════════════════════════════════════════════ */
(function(){

  function _isOn(){
    try{ return (localStorage.getItem('su_rec_side_panel_on') ?? '1') !== '0'; }
    catch(e){ return true; }
  }

  function _isRotateOn(){
    try{ return (localStorage.getItem('su_rsp_rotate_on') ?? '1') !== '0'; }
    catch(e){ return true; }
  }

  function _getRotateSec(){
    try{ return Math.max(1, Math.min(60, parseInt(localStorage.getItem('su_rsp_rotate_sec')||'5',10)||5)); }
    catch(e){ return 5; }
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

  function _getWinTeamLoseOpacity(){
    try{ return Math.max(0.1, Math.min(1.0, parseFloat(localStorage.getItem('su_rsp_winteam_lose_opacity')||'0.50')||0.50)); }
    catch(e){ return 0.50; }
  }

  function _getWinTeamLoseGray(){
    try{ return Math.max(0, Math.min(1.0, parseFloat(localStorage.getItem('su_rsp_winteam_lose_gray')||'0.70')||0.70)); }
    catch(e){ return 0.70; }
  }

  function _getLoseTeamWinOpacity(){
    try{ return Math.max(0.1, Math.min(1.0, parseFloat(localStorage.getItem('su_rsp_loseteam_win_opacity')||'0.80')||0.80)); }
    catch(e){ return 0.80; }
  }

  function _getLoseTeamWinGray(){
    try{ return Math.max(0, Math.min(1.0, parseFloat(localStorage.getItem('su_rsp_loseteam_win_gray')||'0.15')||0.15)); }
    catch(e){ return 0.15; }
  }

  function _getLoseTeamLoseOpacity(){
    try{ return Math.max(0.1, Math.min(1.0, parseFloat(localStorage.getItem('su_rsp_loseteam_lose_opacity')||'0.45')||0.45)); }
    catch(e){ return 0.45; }
  }

  function _getLoseTeamLoseGray(){
    try{ return Math.max(0, Math.min(1.0, parseFloat(localStorage.getItem('su_rsp_loseteam_lose_gray')||'0.75')||0.75)); }
    catch(e){ return 0.75; }
  }


  function _cfg(key, def){
    try{ var v = localStorage.getItem(key); return v == null ? def : v; }
    catch(e){ return def; }
  }

  /* ── 승/패 선수 분리 수집 (양쪽 구분) ──
     반환: { winNames: [], loseNames: [] }
  */
  function _getWinLoseNamesSplit(m, side, isWinSide){
    var ordered = []; // {name, isWinner} — 게임 순서 유지
    var seen = {};
    function addOrdered(name, isWinner){
      if(!name) return;
      String(name).split(',').forEach(function(s){
        var t = s.trim();
        if(!t || seen[t]) return;
        seen[t] = 1;
        ordered.push({name: t, isWinner: isWinner});
      });
    }
    var isA = (side === 'a');
    var hasSets = m && m.sets && m.sets.length;

    if(hasSets){
      (m.sets||[]).forEach(function(s){
        (s.games||[]).forEach(function(g){
          var gWinA = (g.winner === 'A');
          var gWinB = (g.winner === 'B');
          if(isA){
            var pA = g.playerA || g.a1 || g.a || '';
            var pA2 = g.a2 || '';
            var aWon = gWinA;
            if(pA)  addOrdered(pA,  aWon);
            if(pA2) addOrdered(pA2, aWon);
          } else {
            var pB = g.playerB || g.b1 || g.b || '';
            var pB2 = g.b2 || '';
            var bWon = gWinB;
            if(pB)  addOrdered(pB,  bWon);
            if(pB2) addOrdered(pB2, bWon);
          }
        });
      });
    }

    // fallback: sets 없으면 저장 멤버 전원
    if(!ordered.length){
      var stored = isA ? (m && m.teamAMembers||[]) : (m && m.teamBMembers||[]);
      (stored||[]).forEach(function(x){
        var n = typeof x==='string'?x:(x&&x.name||'');
        if(n && !seen[n]){ seen[n]=1; ordered.push({name:n, isWinner:isWinSide}); }
      });
    }

    // winNames / loseNames 호환 반환 + ordered 배열도 함께 반환
    var winNames  = ordered.filter(function(e){ return  e.isWinner; }).map(function(e){ return e.name; });
    var loseNames = ordered.filter(function(e){ return !e.isWinner; }).map(function(e){ return e.name; });
    return { winNames: winNames, loseNames: loseNames, ordered: ordered };
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

  /* isLose: 해당 선수가 이 게임에서 진 선수인지
     winTeam: 이 패널이 승리팀 패널인지 (패배팀인지)
     playerWon: 해당 선수가 개인 승리한 적 있는지 */
  function _effectFilter(effect, brightness, isLose, winTeamPanel, playerWon){
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

    if(winTeamPanel){
      // 승리팀 패널: 진 선수(개인전 패)는 연하게
      if(isLose) combined += ' grayscale('+_getWinTeamLoseGray().toFixed(2)+') opacity('+_getWinTeamLoseOpacity().toFixed(2)+')';
      // 이긴 선수: 그대로 (normal)
    } else {
      // 패배팀 패널: 진 선수(개인전 패)는 연하게
      if(isLose && !playerWon) combined += ' grayscale('+_getLoseTeamLoseGray().toFixed(2)+') opacity('+_getLoseTeamLoseOpacity().toFixed(2)+')';
      // 패배팀에서 개인전 이긴 선수: 약간만 처리 (팀은 졌지만 개인전은 이겼으므로)
      if(!isLose && playerWon) combined += ' grayscale('+_getLoseTeamWinGray().toFixed(2)+') opacity('+_getLoseTeamWinOpacity().toFixed(2)+')';
    }
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

  /* ── 패널 1개 HTML (슬라이드쇼 지원) ──
     players: [{name, isWinner}] 배열
     isWinTeam: 이 패널이 승리팀인지
     col: 팀 컬러
     isLeft: 왼쪽 패널인지
  */

  /* ── 프로필 이미지 컨테이너 HTML 생성 헬퍼 ── */
  function _buildImgBox(raw, sizePx, radius, shadow, filterStr, isWinTeam, playerWon, col, pName, isLeft){
    var isCircle = (radius==='50%'||radius==='999px'||radius==='9999px'||parseInt(radius,10)>=50);

    // 팀 컬러 링
    var ringSize  = (playerWon && isWinTeam) ? 3 : 1.5;
    var ringColor = (playerWon && isWinTeam) ? col : 'rgba(148,163,184,0.25)';

    // 글로우 (팀 컬러 기반)
    var glowBase = (playerWon && isWinTeam)
      ? '0 4px 16px '+col+'55, 0 0 0 '+(ringSize+1)+'px '+col+'33'
      : shadow;
    var glowPeak = (playerWon && isWinTeam)
      ? '0 6px 28px '+col+'88, 0 0 0 '+(ringSize+2)+'px '+col+'55'
      : '0 6px 20px rgba(0,0,0,.22)';

    // 왕관 배지
    var crownBadge = (playerWon && isWinTeam)
      ? '<div class="rsp-crown">👑</div>'
      : '';

    // 이름 레이블 — textContent로 XSS 방지
    var nameLblColor = (playerWon && isWinTeam) ? col : 'var(--gray-l)';
    var nameLblGlow  = (playerWon && isWinTeam) ? '0 0 8px '+col+'77' : 'none';
    var shortName = pName ? (pName.length>6 ? pName.slice(0,6)+'…' : pName) : '';
    var nameLbl = shortName
      ? '<div class="rsp-namelbl" style="color:'+nameLblColor+';text-shadow:'+nameLblGlow+';">'+shortName.replace(/</g,'&lt;').replace(/>/g,'&gt;')+'</div>'
      : '';

    // 박스 크기: 링 + 여백 포함
    var boxW = sizePx + ringSize*2 + 6;
    var boxStyle = ''
      +'position:relative;display:flex;align-items:center;justify-content:center;'
      +'width:'+boxW+'px;height:'+boxW+'px;'
      +'flex-shrink:0;'
      +'--rsp-glow-base:'+glowBase+';'
      +'--rsp-glow-peak:'+glowPeak+';';

    var innerStyle = ''
      +'width:'+sizePx+'px;height:'+sizePx+'px;'
      +'border-radius:'+(isCircle?'50%':radius)+';'
      +'overflow:hidden;'
      +'display:flex;align-items:center;justify-content:center;'
      +'border:'+ringSize+'px solid '+ringColor+';'
      +'box-shadow:'+glowBase+';'
      +'filter:'+filterStr+';'
      +'background:#e2e8f0;';

    return '<div class="rsp-imgbox'+(playerWon&&isWinTeam?' rsp-imgbox--win':'')+(isCircle?' rsp-imgbox--circle':'')+'" style="'+boxStyle+'">'
      + crownBadge
      + '<div class="rsp-imginner" style="'+innerStyle+'">'
      + raw
      + '</div>'
      + '</div>'
      + nameLbl;
  }

  function _panel(players, isWinTeam, col, isLeft, matchIdx){
    if(!players || !players.length) return '';

    var sizePx    = Math.max(40, Math.min(160, parseInt(_cfg('su_rsp_size','72'),10)||72));
    var valign    = _cfg('su_rsp_valign','center');
    var brightness= _cfg('su_rsp_brightness','1.0');
    var effect    = _cfg('su_rsp_effect','none');
    var widthPx   = Math.max(60, Math.min(180, parseInt(_cfg('su_rsp_width','90'),10)||90));
    var radius    = _cfg('su_profile_radius','6px')||'6px';
    var imageType = _getImageType();
    var rawOffset = Math.max(-200,Math.min(200,parseInt(_cfg('su_rsp_hoffset','0'),10)||0));
    var hoffset   = isLeft ? rawOffset : -rawOffset;
    var voffset   = Math.max(-200,Math.min(200,parseInt(_cfg('su_rsp_voffset','0'),10)||0));
    var showBox   = (_cfg('su_rsp_show_box','0')!=='0');
    var rotateOn  = _isRotateOn();
    var rotateSec = _getRotateSec();

    // 유효 이미지 선수만 수집
    var validPlayers = [];
    for(var pi=0; pi<players.length; pi++){
      var pEntry = players[pi];
      var pName = pEntry.name;
      if(!pName) continue;
      var raw = '';
      if(imageType === 'logo'){
        raw = _univLogoImg(pName, sizePx);
      } else {
        if(typeof getPlayerPhotoHTML !== 'function') continue;
        var prev = window.__detailCtx;
        window.__detailCtx = 'recCard';
        raw = getPlayerPhotoHTML(pName, sizePx+'px','');
        window.__detailCtx = prev;
        if(!raw) continue;
        // 이미지도 이니셜도 모두 표시 (사진 없으면 이니셜 뱃지 표시)
      }
      validPlayers.push({name:pName, isWinner:pEntry.isWinner, raw:raw});
    }
    if(!validPlayers.length) return '';

    var jc = valign==='top'?'flex-start':valign==='bottom'?'flex-end':'center';
    var _tx = hoffset!==0?'translateX('+hoffset+'px)':'';
    var _ty = voffset!==0?'translateY('+voffset+'px)':'';
    var _tf = [_tx,_ty].filter(Boolean).join(' ');
    var translateStyle = _tf?'transform:'+_tf+';':'';
    var panelBg  = showBox?(isWinTeam?_rgba(col,0.12):'rgba(148,163,184,0.07)'):'transparent';
    var panelBrd = showBox?(isWinTeam?_rgba(col,0.30):'rgba(148,163,184,0.18)'):'transparent';
    var uid = 'rsp'+Math.random().toString(36).slice(2,9);

    // 슬라이드 1개짜리면 단순하게
    if(!rotateOn || validPlayers.length===1){
      var vp = validPlayers[0];
      var playerWon = !!vp.isWinner;
      var filterStr = _effectFilter(effect, brightness, !playerWon, isWinTeam, playerWon);
      var shadow = (isWinTeam&&playerWon)
        ?(showBox?'0 4px 18px '+_rgba(col,0.38):'0 4px 16px '+_rgba(col,0.32))
        :(showBox?'0 2px 8px rgba(0,0,0,0.10)':'0 2px 8px rgba(0,0,0,0.12)');
      var _imgBox = _buildImgBox(vp.raw, sizePx, radius, shadow, filterStr, isWinTeam, playerWon, col, vp.name, isLeft);
      return '<div class="rec-side-profiles rsp-styled'+(isWinTeam?' rec-side-profiles--win':' rec-side-profiles--lose')+(showBox?'':' rsp-no-box')+'" style="'
        +'background:'+panelBg+';outline:1px solid '+panelBrd+';'
        +'min-width:'+widthPx+'px;max-width:'+widthPx+'px;overflow:visible;'
        +'align-items:center;justify-content:'+jc+';">'
        +'<div class="rsp-inner" style="display:flex;align-items:'+jc+';justify-content:center;width:100%;overflow:visible;'+translateStyle+'">'
        +_imgBox+'</div></div>';
    }

    // 슬라이드쇼: 여러 명 — data-rsp-slot으로 전역 동기화
    var slides = '';
    for(var si=0; si<validPlayers.length; si++){
      var vp2 = validPlayers[si];
      var pw2 = !!vp2.isWinner;
      var fs2 = _effectFilter(effect, brightness, !pw2, isWinTeam, pw2);
      var sh2 = (isWinTeam&&pw2)
        ?(showBox?'0 4px 18px '+_rgba(col,0.38):'0 4px 16px '+_rgba(col,0.32))
        :(showBox?'0 2px 8px rgba(0,0,0,0.10)':'0 2px 8px rgba(0,0,0,0.12)');
      // 초기 표시: slot=0이면 0번, slot>0이면 모두 none (전역틱 applyTick이 교정)
      var initDisplay = (si === 0) ? 'flex' : 'none';
      var _sBox = _buildImgBox(vp2.raw, sizePx, radius, sh2, fs2, isWinTeam, pw2, col, vp2.name, isLeft);
      slides += '<div class="rsp-slide" style="'
        +'display:'+initDisplay+';align-items:'+jc+';justify-content:center;width:100%;">'
        +_sBox+'</div>';
    }

    var slot = (parseInt(matchIdx||0,10)||0);
    return '<div id="'+uid+'" class="rec-side-profiles rsp-styled'+(isWinTeam?' rec-side-profiles--win':' rec-side-profiles--lose')+(showBox?'':' rsp-no-box')+'" data-rsp-slides="1" data-rsp-slot="'+slot+'" style="'
      +'background:'+panelBg+';outline:1px solid '+panelBrd+';'
      +'min-width:'+widthPx+'px;max-width:'+widthPx+'px;overflow:visible;'
      +'align-items:center;justify-content:'+jc+';">'
      +'<div class="rsp-inner" style="display:flex;flex-direction:column;width:100%;overflow:visible;'+translateStyle+'">'
      +slides
      +'</div></div>';
  }

  /* ─────────────────────────────────────────────────────────────
     names 배열을 [{name, isWinner}] 형식으로 변환하는 헬퍼
  ───────────────────────────────────────────────────────────── */
  function _toPlayerList(names, isWinner){
    return (names||[]).map(function(n){ return { name: n, isWinner: isWinner }; });
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
          left:  univA ? _panel([{name:univA,isWinner:aWin}], aWin, ca, true) : '',
          right: univB ? _panel([{name:univB,isWinner:bWin}], bWin, cb, false) : '',
        };
      }

      // 프로필 모드: 게임 순서대로 선수 수집 (슬라이드쇼)
      var aSplit = _getWinLoseNamesSplit(m, 'a', aWin);
      var bSplit = _getWinLoseNamesSplit(m, 'b', bWin);

      // ordered 배열로 게임 순서 유지
      var aPlayers = aSplit.ordered && aSplit.ordered.length ? aSplit.ordered
        : _toPlayerList(aSplit.winNames, true).concat(_toPlayerList(aSplit.loseNames, false));
      var bPlayers = bSplit.ordered && bSplit.ordered.length ? bSplit.ordered
        : _toPlayerList(bSplit.winNames, true).concat(_toPlayerList(bSplit.loseNames, false));

      if(!aPlayers.length){
        var abaN = (ab && ab.a||[]).map(function(x){ return typeof x==='string'?x:(x&&x.name||''); }).filter(Boolean);
        aPlayers = _toPlayerList(abaN, aWin);
      }
      if(!bPlayers.length){
        var abbN = (ab && ab.b||[]).map(function(x){ return typeof x==='string'?x:(x&&x.name||''); }).filter(Boolean);
        bPlayers = _toPlayerList(abbN, bWin);
      }

      return {
        left:  aPlayers.length ? _panel(aPlayers, aWin, ca, true) : '',
        right: bPlayers.length ? _panel(bPlayers, bWin, cb, false) : '',
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

      var _mIdx = (matchData && matchData.matchNum != null) ? (matchData.matchNum - 1)
                : (matchData && matchData._matchIdx != null) ? matchData._matchIdx : 0;
      if(imageType === 'logo'){
        return {
          left:  teamA ? _panel([{name:teamA,isWinner:aWin}], aWin, ca, true, _mIdx) : '',
          right: teamB ? _panel([{name:teamB,isWinner:bWin}], bWin, cb, false, _mIdx) : '',
        };
      }

      // 프로필 모드: matchData sets에서 승패별 선수 분리 수집
      var buildPlayers = function(side, isWinSide){
        var split = _getWinLoseNamesSplit(matchData, side, isWinSide);
        var univName = (side === 'a') ? teamA : teamB;

        // 유니브 필터링
        function filterOrdered(orderedArr){
          if(!Array.isArray(window.players) || !univName) return orderedArr;
          var f = orderedArr.filter(function(e){
            var p = window.players.find(function(pl){ return pl.name === e.name; });
            return p && p.univ === univName;
          });
          return f.length ? f : orderedArr;
        }

        // ordered 배열로 게임 순서 유지
        var orderedPlayers = split.ordered && split.ordered.length
          ? filterOrdered(split.ordered)
          : _toPlayerList(filterOrdered(_toPlayerList(split.winNames,true).concat(_toPlayerList(split.loseNames,false)).map(function(e){return e.name;})), isWinSide);

        // ordered 없으면 winNames+loseNames fallback
        if(!orderedPlayers.length){
          var winN = split.winNames || [];
          var loseN = split.loseNames || [];
          orderedPlayers = _toPlayerList(winN, true).concat(_toPlayerList(loseN, false));
        }

        var players = orderedPlayers;

        if(!players.length && Array.isArray(window.players)){
          var pool = window.players.filter(function(p){ return p.univ === univName; });
          players = pool.map(function(p){ return {name:p.name, isWinner:isWinSide}; });
        }
        return players;
      };

      return {
        left:  _panel(buildPlayers('a', aWin), aWin, ca, true,  _mIdx),
        right: _panel(buildPlayers('b', bWin), bWin, cb, false, _mIdx),
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

  window.cfgSetRspVoffset = function(v){
    try{ localStorage.setItem('su_rsp_voffset', String(parseInt(v,10)||0)); if(typeof render==='function') render(); }catch(e){}
  };

  window.cfgSetRspShowBox = function(on){
    try{ localStorage.setItem('su_rsp_show_box', on ? '1' : '0'); if(typeof render==='function') render(); }catch(e){}
  };

  window.cfgSetRspRotateOn = function(){
    try{
      var on = !!(document.getElementById('cfg-rsp-rotate-on')||{}).checked;
      localStorage.setItem('su_rsp_rotate_on', on ? '1' : '0');
      if(typeof render === 'function') render();
    }catch(e){}
  };

  window.cfgSetRspRotateSec = function(v){
    try{ localStorage.setItem('su_rsp_rotate_sec', String(Math.max(1,Math.min(60,parseInt(v,10)||5)))); if(typeof render==='function') render(); }catch(e){}
  };

  window.cfgSetRspWinTeamLoseOpacity = function(v){
    try{ localStorage.setItem('su_rsp_winteam_lose_opacity', String(Math.max(0.1,Math.min(1.0,parseFloat(v)||0.65)).toFixed(2))); if(typeof render==='function') render(); }catch(e){}
  };

  window.cfgSetRspWinTeamLoseGray = function(v){
    try{ localStorage.setItem('su_rsp_winteam_lose_gray', String(Math.max(0,Math.min(1.0,parseFloat(v)||0.35)).toFixed(2))); if(typeof render==='function') render(); }catch(e){}
  };

  window.cfgSetRspLoseTeamWinOpacity = function(v){
    try{ localStorage.setItem('su_rsp_loseteam_win_opacity', String(Math.max(0.1,Math.min(1.0,parseFloat(v)||0.80)).toFixed(2))); if(typeof render==='function') render(); }catch(e){}
  };

  window.cfgSetRspLoseTeamWinGray = function(v){
    try{ localStorage.setItem('su_rsp_loseteam_win_gray', String(Math.max(0,Math.min(1.0,parseFloat(v)||0.15)).toFixed(2))); if(typeof render==='function') render(); }catch(e){}
  };

  window.cfgSetRspLoseTeamLoseOpacity = function(v){
    try{ localStorage.setItem('su_rsp_loseteam_lose_opacity', String(Math.max(0.1,Math.min(1.0,parseFloat(v)||0.45)).toFixed(2))); if(typeof render==='function') render(); }catch(e){}
  };

  window.cfgSetRspLoseTeamLoseGray = function(v){
    try{ localStorage.setItem('su_rsp_loseteam_lose_gray', String(Math.max(0,Math.min(1.0,parseFloat(v)||0.75)).toFixed(2))); if(typeof render==='function') render(); }catch(e){}
  };

})();

/* ══════════════════════════════════════════════════════════════
   전역 슬라이드쇼 매니저 v2 — 전체 경기 순서 동기화
   ─────────────────────────────────────────────────────────────
   [동작 방식]
   • window._rspGlobalTick : 전역 틱 카운터 (매 N초마다 +1)
   • 각 패널의 data-rsp-slot : "전체 참여자 풀에서 이 패널의 시작 오프셋"
   • 각 패널의 data-rsp-total: 전체 풀 크기
   • 현재 보여줄 슬라이드 인덱스 = (globalTick + slot) % slides.length
     → 1경기 A패널(slot=0) → 2경기 A패널(slot=N) → ... 순서로
        전체가 하나의 큰 순환처럼 돌아감
══════════════════════════════════════════════════════════════ */
(function(){
  // 전역 틱
  window._rspGlobalTick = window._rspGlobalTick || 0;
  var _globalTimer = null;

  function _getDefaultSec(){
    try{ return Math.max(1, Math.min(60, parseInt(localStorage.getItem('su_rsp_rotate_sec')||'5',10)||5)); }
    catch(e){ return 5; }
  }

  function _isRotateOn(){
    try{ return (localStorage.getItem('su_rsp_rotate_on') ?? '1') !== '0'; }
    catch(e){ return true; }
  }

  /* 전체 패널을 현재 globalTick에 맞게 갱신 */
  function _tickAllPanels(){
    window._rspGlobalTick = (window._rspGlobalTick + 1);
    var tick = window._rspGlobalTick;
    var panels = document.querySelectorAll('[data-rsp-slides="1"]');
    for(var i=0; i<panels.length; i++){
      _applyTick(panels[i], tick);
    }
  }

  function _applyTick(el, tick){
    var slides = el.querySelectorAll('.rsp-slide');
    if(!slides.length) return;
    var slot  = parseInt(el.getAttribute('data-rsp-slot')||'0', 10) || 0;
    var cur   = (tick + slot) % slides.length;
    for(var i=0; i<slides.length; i++){
      slides[i].style.display = (i === cur) ? 'flex' : 'none';
    }
  }

  /* 새 패널이 DOM에 삽입될 때 즉시 현재 틱으로 초기화 */
  function _initPanel(el){
    _applyTick(el, window._rspGlobalTick);
  }

  function _scanAndInit(root){
    var panels = (root||document).querySelectorAll('[data-rsp-slides="1"]');
    for(var i=0; i<panels.length; i++){
      _initPanel(panels[i]);
    }
  }

  /* 전역 타이머 시작/재시작 */
  function _startGlobalTimer(){
    if(_globalTimer) clearInterval(_globalTimer);
    if(!_isRotateOn()) return;
    var sec = _getDefaultSec();
    _globalTimer = setInterval(function(){
      _tickAllPanels();
    }, sec * 1000);
  }

  /* 설정 변경 시 외부에서 호출 */
  window._rspRestartGlobalTimer = function(){
    _startGlobalTimer();
    _scanAndInit(document);
  };

  // DOM 변경 감시
  var observer = new MutationObserver(function(mutations){
    for(var i=0; i<mutations.length; i++){
      var added = mutations[i].addedNodes;
      for(var j=0; j<added.length; j++){
        var node = added[j];
        if(node.nodeType !== 1) continue;
        if(node.hasAttribute && node.hasAttribute('data-rsp-slides')){
          _initPanel(node);
        } else if(node.querySelectorAll){
          _scanAndInit(node);
        }
      }
    }
  });

  function _init(){
    observer.observe(document.body, {childList:true, subtree:true});
    _scanAndInit(document);
    _startGlobalTimer();
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', _init);
  } else {
    _init();
  }
})();
