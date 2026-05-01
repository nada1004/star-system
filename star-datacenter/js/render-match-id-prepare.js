function ensureRenderMatchIdsPrepared(){
  (typeof gjM!=='undefined'?gjM:[]).forEach(m=>{
    if(!m._id) m._id=`gj_${m.d||''}${m.map||''}${(m.wName||'').replace(/\s+/g,'')}${(m.lName||'').replace(/\s+/g,'')}`;
  });
  (typeof indM!=='undefined'?indM:[]).forEach(m=>{
    if(!m._id) m._id=`ind_${m.d||''}${m.map||''}${(m.wName||'').replace(/\s+/g,'')}${(m.lName||'').replace(/\s+/g,'')}`;
  });
  (typeof tourneys!=='undefined'?tourneys:[]).forEach(tn=>{
    (tn.groups||[]).forEach(grp=>{
      (grp.matches||[]).forEach(m=>{
        if(!m._id) m._id=`tour_${tn.id||''}_${m.d||''}${(m.a||'').replace(/\s+/g,'')}${(m.b||'').replace(/\s+/g,'')}`;
      });
    });
    Object.values((tn.bracket||{}).matchDetails||{}).forEach(m=>{
      if(!m._id) m._id=`tour_${tn.id||''}_${m.d||''}${(m.a||'').replace(/\s+/g,'')}${(m.b||'').replace(/\s+/g,'')}`;
    });
  });
  (typeof comps!=='undefined'?comps:[]).forEach(comp=>{
    (comp.groups||[]).forEach(grp=>{
      (grp.matches||[]).forEach(m=>{
        if(!m._id) m._id=`comp_${comp.id||''}_${m.d||''}${(m.a||'').replace(/\s+/g,'')}${(m.b||'').replace(/\s+/g,'')}`;
      });
    });
    Object.values((comp.bracket||{}).matchDetails||{}).forEach(m=>{
      if(!m._id) m._id=`comp_${comp.id||''}_${m.d||''}${(m.a||'').replace(/\s+/g,'')}${(m.b||'').replace(/\s+/g,'')}`;
    });
  });
  (typeof proTourneys!=='undefined'?proTourneys:[]).forEach(tn=>{
    (tn.groups||[]).forEach(grp=>{
      (grp.matches||[]).forEach(m=>{
        if(!m._id) m._id=`protour_${tn.id||''}_${m.d||''}${(m.a||'').replace(/\s+/g,'')}${(m.b||'').replace(/\s+/g,'')}`;
      });
    });
    (tn.gjMatches||[]).forEach(m=>{
      if(!m._id) m._id=`protour_${tn.id||''}_${m.d||''}${(m.a||'').replace(/\s+/g,'')}${(m.b||'').replace(/\s+/g,'')}`;
    });
  });
}

try{
  window.ensureRenderMatchIdsPrepared = ensureRenderMatchIdsPrepared;
}catch(e){}
