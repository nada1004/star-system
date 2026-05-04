window.iconifyUI = window.iconifyUI || function(root){
  try{
    root = root || document.body;
    const MAP = {
      '🔍': `<svg class="svg-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>`,
      '🌙': `<svg class="svg-ico" viewBox="0 0 24 24" fill="currentColor"><path d="M21 14.5A8.5 8.5 0 0 1 9.5 3a7 7 0 1 0 11.5 11.5Z"/></svg>`,
      '🔐': `<svg class="svg-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 11V8a5 5 0 0 1 10 0v3"/><rect x="6" y="11" width="12" height="10" rx="2"/><path d="M12 15v3"/></svg>`,
      '📋': `<svg class="svg-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="8" y="4" width="12" height="18" rx="2"/><path d="M16 2H6a2 2 0 0 0-2 2v14"/><path d="M12 4V2"/><path d="M10 6h6"/></svg>`,
      '📊': `<svg class="svg-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19V5"/><path d="M4 19h16"/><path d="M8 17V9"/><path d="M12 17V7"/><path d="M16 17v-5"/></svg>`,
      '📅': `<svg class="svg-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/></svg>`,
      '🏆': `<svg class="svg-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 4h8v3a4 4 0 0 1-8 0V4Z"/><path d="M6 4H4v3a3 3 0 0 0 3 3"/><path d="M18 4h2v3a3 3 0 0 1-3 3"/><path d="M10 14h4"/><path d="M9 20h6"/><path d="M10 14v3a2 2 0 0 1-2 2"/><path d="M14 14v3a2 2 0 0 0 2 2"/></svg>`,
      '🏅': `<svg class="svg-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 2l5 7 5-7"/><circle cx="12" cy="16" r="5"/><path d="M12 13v6"/></svg>`,
      '⚔️': `<svg class="svg-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 3l7 7-4 4-7-7 4-4Z"/><path d="M10 7l-7 7 4 4 7-7-4-4Z"/><path d="M8 15l-4 4"/><path d="M16 15l4 4"/></svg>`,
      '🎯': `<svg class="svg-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/><path d="M12 12l7-7"/></svg>`,
      '🎰': `<svg class="svg-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="6" width="14" height="14" rx="2"/><path d="M18 10h2a2 2 0 0 1 2 2v2"/><path d="M7 10h8"/><path d="M7 14h8"/><path d="M7 18h8"/></svg>`,
      '▶': `<svg class="svg-ico" viewBox="0 0 24 24" fill="currentColor"><path d="M9 6l10 6-10 6V6Z"/></svg>`,
      '◀': `<svg class="svg-ico" viewBox="0 0 24 24" fill="currentColor"><path d="M15 6L5 12l10 6V6Z"/></svg>`,
      '➡️': `<svg class="svg-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h12"/><path d="M13 6l6 6-6 6"/></svg>`,
      '🔄': `<svg class="svg-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 0 0-15.5-6.4"/><path d="M3 4v6h6"/><path d="M3 12a9 9 0 0 0 15.5 6.4"/><path d="M21 20v-6h-6"/></svg>`,
      '🗑': `<svg class="svg-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>`,
      '🗺️': `<svg class="svg-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l-6 3V6l6-3 6 3 6-3v15l-6 3-6-3Z"/><path d="M9 3v15"/><path d="M15 6v15"/></svg>`,
      '✅': `<svg class="svg-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>`,
      '✏️': `<svg class="svg-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5Z"/></svg>`,
      '⚙️': `<svg class="svg-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/><path d="M19.4 15a7.9 7.9 0 0 0 .1-1l2-1.2-2-3.4-2.3.5a7.7 7.7 0 0 0-1.7-1l-.4-2.4H9l-.4 2.4c-.6.3-1.2.6-1.7 1l-2.3-.5-2 3.4 2 1.2a7.9 7.9 0 0 0 .1 1 7.9 7.9 0 0 0-.1 1l-2 1.2 2 3.4 2.3-.5c.5.4 1.1.7 1.7 1l.4 2.4h6l.4-2.4c.6-.3 1.2-.6 1.7-1l2.3.5 2-3.4-2-1.2c.1-.3.1-.7.1-1Z"/></svg>`,
    };
    const RX = new RegExp('^(' + Object.keys(MAP).map(k=>k.replace(/[.*+?^${}()|[\\]\\\\]/g,'\\$&')).join('|') + ')\\s*');
    const targets = root.querySelectorAll('button, .tab, .bnav-item, summary, .pill, .btn, .flabel, label');
    targets.forEach(el=>{
      if(!el) return;
      if(el.querySelector && el.querySelector('.svg-ico')) return;
      const tn = Array.from(el.childNodes||[]).find(n=>n && n.nodeType===3 && String(n.nodeValue||'').trim().length>0);
      if(!tn) return;
      const raw = tn.nodeValue || '';
      const m = raw.match(RX);
      if(!m) return;
      const emo = m[1];
      const rest = raw.replace(RX,'').replace(/^\s+/,'');
      const wrap = document.createElement('span');
      wrap.className = 'svg-ico-wrap';
      wrap.innerHTML = MAP[emo] || '';
      el.insertBefore(wrap, tn);
      tn.nodeValue = (rest ? ' ' + rest : '');
    });
  }catch(e){}
};
