(function(){
  function shareMatchScoreText(v, fb){
    const s = String((v ?? fb ?? '')).trim();
    return s==='' ? '-' : s;
  }

  function buildShareMatchScoreInline(args){
    const {
      kind='default', scp={}, ca, cb, aWin, bWin,
      isPersonalScoreCard=false, saTxt='-', sbTxt='-'
    } = args || {};
    const scoreCol = (hex, isWinner) => {
      if(isPersonalScoreCard) return isWinner ? '#ffffff' : 'rgba(241,245,249,.74)';
      return isWinner ? '#ffffff' : 'rgba(241,245,249,.82)';
    };
    const scoreShadow = (hex) => {
      if(isPersonalScoreCard) return 'rgba(2,6,23,.58)';
      const base = String(hex||'#64748b');
      if(typeof window._scMixHex==='function') return window._scMixHex(base, '#020617', .42);
      return 'rgba(2,6,23,.45)';
    };
    const isMinimal = scp.mode==='minimal' || scp.mode==='mono';
    const winA = scoreCol(ca, aWin);
    const winB = scoreCol(cb, bWin);
    const loseA = isPersonalScoreCard ? 'rgba(255,255,255,.78)' : 'rgba(255,255,255,.82)';
    const loseB = isPersonalScoreCard ? 'rgba(255,255,255,.78)' : 'rgba(255,255,255,.82)';
    const colA = aWin ? winA : loseA;
    const colB = bWin ? winB : loseB;
    const baseSize = kind==='compact' ? 22 : kind==='personal' ? 24 : 26;
    const size = Math.round(baseSize * (scp.fontScale||1));
    const colon = Math.round(size * .72);
    const shA = aWin ? scoreShadow(ca) : 'rgba(2,6,23,.38)';
    const shB = bWin ? scoreShadow(cb) : 'rgba(2,6,23,.38)';
    const pad = isMinimal ? '0' : '1px 0';
    return `<div class="share-score-inline share-score-inline--${kind}" style="display:inline-flex;align-items:center;gap:5px;font-size:${size}px;font-weight:1000;letter-spacing:-.5px;padding:${pad};white-space:nowrap">
      <span style="color:${colA};text-shadow:0 2px 10px ${shA}">${saTxt}</span>
      <span style="font-size:${colon}px;color:rgba(255,255,255,.82)">:</span>
      <span style="color:${colB};text-shadow:0 2px 10px ${shB}">${sbTxt}</span>
    </div>`;
  }

  window._shareMatchScoreText = shareMatchScoreText;
  window._buildShareMatchScoreInline = buildShareMatchScoreInline;
})();
