/* ══════════════════════════════════════
   Share Card Match Theme
══════════════════════════════════════ */
function __shareCardMatchHexToHsl(hex){
  let h=(hex||'').replace('#','');
  if(h.length===3) h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
  if(h.length!==6) return null;
  let r=parseInt(h.slice(0,2),16)/255;
  let g=parseInt(h.slice(2,4),16)/255;
  let b=parseInt(h.slice(4,6),16)/255;
  const max=Math.max(r,g,b),min=Math.min(r,g,b);
  let hue=0,sat=0,lit=(max+min)/2;
  if(max!==min){
    const d=max-min;
    sat=lit>.5?d/(2-max-min):d/(max+min);
    if(max===r) hue=((g-b)/d+(g<b?6:0))/6;
    else if(max===g) hue=((b-r)/d+2)/6;
    else hue=((r-g)/d+4)/6;
  }
  return { h:Math.round(hue*360), s:Math.round(sat*100), l:Math.round(lit*100) };
}

function __shareCardMatchMakeCardTheme(hex){
  const hsl=__shareCardMatchHexToHsl(hex);
  if(!hsl) return {
    headerBg:'#1e293b', bodyBg:'#f8fafc',
    accentHex:hex||'#6366f1', accentDark:'#1e293b',
    text:'#1e293b', textDim:'rgba(30,41,59,.55)', divider:'rgba(30,41,59,.12)'
  };
  const {h,s,l}=hsl;
  const headerBg=`hsl(${h},${Math.min(s+5,90)}%,${Math.max(l-5,20)}%)`;
  const bodyBgL=Math.min(97, l+52);
  const bodyBgS=Math.min(s*0.25, 18);
  const bodyBg=`hsl(${h},${bodyBgS}%,${bodyBgL}%)`;
  const accentDark=`hsl(${h},${Math.min(s+10,95)}%,${Math.max(l-15,15)}%)`;
  const divider=`hsla(${h},${Math.min(s*0.5,35)}%,${Math.max(l-20,30)}%,.18)`;
  const textDim=`hsla(${h},${Math.min(s*0.4,30)}%,${Math.max(l-45,12)}%,.6)`;
  return {
    headerBg, bodyBg, accentHex:hex, accentDark,
    text:`hsl(${h},${Math.min(s*0.6,45)}%,${Math.max(l-52,8)}%)`,
    textDim, divider
  };
}

function __shareCardMatchHexToRgb(hex){
  let h=(hex||'').replace('#','');
  if(h.length===3) h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
  if(h.length!==6) return '128,128,128';
  return parseInt(h.slice(0,2),16)+','+parseInt(h.slice(2,4),16)+','+parseInt(h.slice(4,6),16);
}

try{
  window.__shareCardMatchHexToHsl = __shareCardMatchHexToHsl;
  window.__shareCardMatchMakeCardTheme = __shareCardMatchMakeCardTheme;
  window.__shareCardMatchHexToRgb = __shareCardMatchHexToRgb;
}catch(e){}
