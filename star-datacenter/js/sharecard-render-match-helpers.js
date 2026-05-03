(function(){
  function sharecardHexToRgb(hex){
    let h=(hex||'').replace('#','');
    if(h.length===3)h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
    if(h.length!==6)return '128,128,128';
    return parseInt(h.slice(0,2),16)+','+parseInt(h.slice(2,4),16)+','+parseInt(h.slice(4,6),16);
  }

  function sharecardUnivIconHTML(params){
    const { name, size, logoFit, toHttpsUrl } = params || {};
    const url=UNIV_ICONS[name]||(univCfg.find(x=>x.name===name)||{}).icon||'';
    const s=size||'40px';
    const fitMode = ['contain','cover','fill','zoom'].includes(String(logoFit||'')) ? String(logoFit) : 'contain';
    const objFit = fitMode==='cover' ? 'cover' : fitMode==='fill' ? 'fill' : 'contain';
    const scale = fitMode==='zoom' ? 'transform:scale(1.16);' : '';
    if(url) return `<img src="${toHttpsUrl(url)}" style="width:${s};height:${s};object-fit:${objFit};${scale}" onerror="this.outerHTML='<svg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 24 24\\' fill=\\'white\\' width=\\'${s}\\' height=\\'${s}\\'><path d=\\'M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z\\'/></svg>'">`;
    return `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white' width='${s}' height='${s}'><path d='M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z'/></svg>`;
  }

  window._sharecardHexToRgb = sharecardHexToRgb;
  window._sharecardUnivIconHTML = sharecardUnivIconHTML;
})();
