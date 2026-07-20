/* cloud-apply.js */
var __defProp=Object.defineProperty;var __getOwnPropSymbols=Object.getOwnPropertySymbols;var __hasOwnProp=Object.prototype.hasOwnProperty,__propIsEnum=Object.prototype.propertyIsEnumerable;var __defNormalProp=(obj,key,value)=>key in obj?__defProp(obj,key,{enumerable:!0,configurable:!0,writable:!0,value}):obj[key]=value,__spreadValues=(a,b)=>{for(var prop in b||(b={}))__hasOwnProp.call(b,prop)&&__defNormalProp(a,prop,b[prop]);if(__getOwnPropSymbols)for(var prop of __getOwnPropSymbols(b))__propIsEnum.call(b,prop)&&__defNormalProp(a,prop,b[prop]);return a};var __objRest=(source,exclude)=>{var target={};for(var prop in source)__hasOwnProp.call(source,prop)&&exclude.indexOf(prop)<0&&(target[prop]=source[prop]);if(source!=null&&__getOwnPropSymbols)for(var prop of __getOwnPropSymbols(source))exclude.indexOf(prop)<0&&__propIsEnum.call(source,prop)&&(target[prop]=source[prop]);return target};function _syncWindowDataRefs(){try{typeof miniM!="undefined"&&(window.miniM=miniM)}catch(e){}try{typeof univM!="undefined"&&(window.univM=univM)}catch(e){}try{typeof ckM!="undefined"&&(window.ckM=ckM)}catch(e){}try{typeof proM!="undefined"&&(window.proM=proM)}catch(e){}try{typeof ttM!="undefined"&&(window.ttM=ttM)}catch(e){}try{typeof comps!="undefined"&&(window.comps=comps)}catch(e){}try{typeof indM!="undefined"&&(window.indM=indM)}catch(e){}try{typeof gjM!="undefined"&&(window.gjM=gjM)}catch(e){}try{typeof tourneys!="undefined"&&(window.tourneys=tourneys)}catch(e){}try{typeof proTourneys!="undefined"&&(window.proTourneys=proTourneys)}catch(e){}try{typeof players!="undefined"&&(window.players=players)}catch(e){}}try{window._syncWindowDataRefs=_syncWindowDataRefs}catch(e){}function _fbArr(val,fallback){return val?Array.isArray(val)?val:typeof val=="object"?Object.keys(val).sort((a,b)=>Number(a)-Number(b)).map(k=>val[k]).filter(v=>v!=null):fallback||[]:fallback||[]}function _decompressCloudData(d){if(d&&typeof d._lz=="string")try{const json=LZString.decompressFromBase64(d._lz);return JSON.parse(json)}catch(e){console.warn("[_decompressCloudData] \uC555\uCD95 \uD574\uC81C \uC2E4\uD328:",e)}return d}function _pcMergeById(remoteArr,localArr,keyFn){const out=[],seen=new Set,keyOf=(v,i)=>{try{return String(keyFn?keyFn(v,i):v&&v._id||i)}catch(e){return String(i)}};return(Array.isArray(remoteArr)?remoteArr:[]).forEach((v,i)=>{out.push(v),seen.add(keyOf(v,i))}),(Array.isArray(localArr)?localArr:[]).forEach((v,i)=>{const k=keyOf(v,i);seen.has(k)||(out.push(v),seen.add(k))}),out}function _mergeRecordLike(remoteItem,localItem){const r=__spreadValues({},remoteItem||{}),l=localItem||{};return["a","b","wName","lName","d","map","memo","note","n","compName","teamALabel","teamBLabel","winner","stage","hostUniv","u","type","rndLabel"].forEach(k=>{(r[k]===void 0||r[k]===null||r[k]==="")&&l[k]!==void 0&&l[k]!==null&&l[k]!==""&&(r[k]=l[k])}),["sa","sb"].forEach(k=>{(r[k]===void 0||r[k]===null)&&l[k]!==void 0&&l[k]!==null&&(r[k]=l[k])}),(!Array.isArray(r.sets)||!r.sets.length)&&Array.isArray(l.sets)&&l.sets.length&&(r.sets=l.sets),(!Array.isArray(r.games)||!r.games.length)&&Array.isArray(l.games)&&l.games.length&&(r.games=l.games),(!Array.isArray(r.teamAMembers)||!r.teamAMembers.length)&&Array.isArray(l.teamAMembers)&&l.teamAMembers.length&&(r.teamAMembers=l.teamAMembers),(!Array.isArray(r.teamBMembers)||!r.teamBMembers.length)&&Array.isArray(l.teamBMembers)&&l.teamBMembers.length&&(r.teamBMembers=l.teamBMembers),(!Array.isArray(r.teamA)||!r.teamA.length)&&Array.isArray(l.teamA)&&l.teamA.length&&(r.teamA=l.teamA),(!Array.isArray(r.teamB)||!r.teamB.length)&&Array.isArray(l.teamB)&&l.teamB.length&&(r.teamB=l.teamB),(!r.univWins||!Object.keys(r.univWins||{}).length)&&l.univWins&&(r.univWins=l.univWins),(!r.univLosses||!Object.keys(r.univLosses||{}).length)&&l.univLosses&&(r.univLosses=l.univLosses),r}function _mergeRecordCollection(remoteArr,localArr,keyFn){const keyOf=(m,i)=>{try{return String(keyFn?keyFn(m,i):m&&(m._id||m.sid||`${m.d||""}|${m.a||m.wName||""}|${m.b||m.lName||""}|${m.map||""}`)||i)}catch(e){return String(i)}},localMap=new Map;(Array.isArray(localArr)?localArr:[]).forEach((m,i)=>localMap.set(keyOf(m,i),m));const out=[],seen=new Set;return(Array.isArray(remoteArr)?remoteArr:[]).forEach((m,i)=>{const k=keyOf(m,i);out.push(_mergeRecordLike(m,localMap.get(k))),seen.add(k)}),window._mergeRemoteIsNewer||(Array.isArray(localArr)?localArr:[]).forEach((m,i)=>{const k=keyOf(m,i);seen.has(k)||out.push(m)}),out}function _pcMergeStageRecordArrays(remoteArr,localArr){return _pcMergeById(remoteArr,localArr,(m,i)=>m&&(m._id||`${m.a||""}|${m.b||""}|${m.d||""}|${m.map||""}|${m.winner||""}`)||i)}const _pcMergeGroupMatches=_pcMergeStageRecordArrays;function _pcMergeBracket(remoteBracket,localBracket){const rB=_fbArr(remoteBracket,[]),lB=_fbArr(localBracket,[]),len=Math.max(rB.length,lB.length),out=[];for(let ri=0;ri<len;ri++){const rr=_fbArr(rB[ri],[]),lr=_fbArr(lB[ri],[]),mlen=Math.max(rr.length,lr.length),row=[];for(let mi=0;mi<mlen;mi++){const rm=rr[mi],lm=lr[mi];if(!rm&&lm){row.push(lm);continue}if(rm&&!lm){row.push(rm);continue}if(!rm&&!lm){row.push(null);continue}const merged=__spreadValues({},rm||{});(!merged.a||merged.a==="TBD")&&lm&&lm.a&&(merged.a=lm.a),(!merged.b||merged.b==="TBD")&&lm&&lm.b&&(merged.b=lm.b),!merged.winner&&lm&&lm.winner&&(merged.winner=lm.winner),!merged.d&&lm&&lm.d&&(merged.d=lm.d),!merged.map&&lm&&lm.map&&(merged.map=lm.map),(!Array.isArray(merged._games)||!merged._games.length)&&lm&&Array.isArray(lm._games)&&lm._games.length&&(merged._games=lm._games),row.push(merged)}out.push(row.filter(v=>v!=null))}return out}function _mergeGenericGroups(remoteGroups,localGroups){const rg=_fbArr(remoteGroups,[]),lg=_fbArr(localGroups,[]),out=rg.map((g,gi)=>{const gl=lg[gi]||lg.find(x=>x&&g&&x.name===g.name)||{},mg=__spreadValues({},g||{});return mg.univs=_pcMergeById(_fbArr(mg.univs,[]),_fbArr(gl.univs,[]),(v,i)=>String(v||i)),mg.players=_pcMergeById(_fbArr(mg.players,[]),_fbArr(gl.players,[]),(v,i)=>String(v||i)),mg.matches=_mergeRecordCollection(_fbArr(mg.matches,[]),_fbArr(gl.matches,[])),mg});return lg.forEach((g,gi)=>{out.some((x,i)=>i===gi||x&&g&&x.name&&g.name&&x.name===g.name)||out.push(g)}),out}function _mergeBracketDetailObject(remoteObj,localObj){const r=remoteObj&&typeof remoteObj=="object"?remoteObj:{},l=localObj&&typeof localObj=="object"?localObj:{},out=__spreadValues({},r);return Object.keys(l).forEach(k=>{out[k]?out[k]=_mergeRecordLike(out[k],l[k]):out[k]=l[k]}),out}function _mergeSingleTourney(remoteTn,localTn){const rt=__spreadValues({},remoteTn||{}),lt=localTn||{};if(!rt.name&&lt.name&&(rt.name=lt.name),!rt.type&&lt.type&&(rt.type=lt.type),!rt.createdAt&&lt.createdAt&&(rt.createdAt=lt.createdAt),rt.groups=_mergeGenericGroups(rt.groups,lt.groups),rt.bracket||lt.bracket){const rb=rt.bracket&&typeof rt.bracket=="object"?__spreadValues({},rt.bracket):{},lb=lt.bracket&&typeof lt.bracket=="object"?lt.bracket:{};(!rb.manualMatches||!rb.manualMatches.length)&&Array.isArray(lb.manualMatches)&&lb.manualMatches.length?rb.manualMatches=lb.manualMatches:rb.manualMatches=_mergeRecordCollection(_fbArr(rb.manualMatches,[]),_fbArr(lb.manualMatches,[])),rb.matchDetails=_mergeBracketDetailObject(rb.matchDetails,lb.matchDetails),Object.keys(lb).forEach(k=>{(rb[k]===void 0||rb[k]===null||rb[k]==="")&&(rb[k]=lb[k])}),rt.bracket=rb}return rt}function _mergeTourneysRemoteWithLocal(remoteArr,localArr){const remote=_fbArr(remoteArr,[]),local=_fbArr(localArr,[]),out=remote.map(rt=>{const id=String(rt&&rt.id||""),lt=local.find(x=>String(x&&x.id||"")===id);return lt?_mergeSingleTourney(rt,lt):rt});return window._mergeRemoteIsNewer||local.forEach(lt=>{const id=String(lt&&lt.id||"");out.some(rt=>String(rt&&rt.id||"")===id)||out.push(lt)}),out}function _mergeSingleProTourney(remoteTn,localTn){const rt=__spreadValues({},remoteTn||{}),lt=localTn||{};!rt.name&&lt.name&&(rt.name=lt.name),!rt.createdAt&&lt.createdAt&&(rt.createdAt=lt.createdAt);const rGroups=_fbArr(rt.groups,[]),lGroups=_fbArr(lt.groups,[]);rt.groups=rGroups.map((g,gi)=>{const lg=lGroups[gi]||lGroups.find(x=>x&&g&&x.name===g.name)||{},mg=__spreadValues({},g||{});return mg.players=_pcMergeById(_fbArr(g&&g.players,[]),_fbArr(lg.players,[]),(v,i)=>String(v||i)),mg.univs=_pcMergeById(_fbArr(g&&g.univs,[]),_fbArr(lg.univs,[]),(v,i)=>String(v||i)),mg.matches=_pcMergeGroupMatches(_fbArr(g&&g.matches,[]),_fbArr(lg.matches,[])),mg}),lGroups.forEach((lg,gi)=>{rt.groups.some((g,i)=>i===gi||g&&lg&&g.name&&lg.name&&g.name===lg.name)||rt.groups.push(lg)});const rStage=rt.stageRecords&&typeof rt.stageRecords=="object"?rt.stageRecords:{},lStage=lt.stageRecords&&typeof lt.stageRecords=="object"?lt.stageRecords:{},rounds=new Set([...Object.keys(rStage),...Object.keys(lStage)]);if(rt.stageRecords={},rounds.forEach(r=>{rt.stageRecords[r]=_pcMergeStageRecordArrays(_fbArr(rStage[r],[]),_fbArr(lStage[r],[]))}),rt.bracket=_pcMergeBracket(rt.bracket,lt.bracket),!rt.thirdPlace&&lt.thirdPlace)rt.thirdPlace=lt.thirdPlace;else if(rt.thirdPlace&&lt.thirdPlace){const tp=__spreadValues({},rt.thirdPlace);(!tp.a||tp.a==="TBD")&&lt.thirdPlace.a&&(tp.a=lt.thirdPlace.a),(!tp.b||tp.b==="TBD")&&lt.thirdPlace.b&&(tp.b=lt.thirdPlace.b),!tp.winner&&lt.thirdPlace.winner&&(tp.winner=lt.thirdPlace.winner),!tp.d&&lt.thirdPlace.d&&(tp.d=lt.thirdPlace.d),!tp.map&&lt.thirdPlace.map&&(tp.map=lt.thirdPlace.map),(!Array.isArray(tp._games)||!tp._games.length)&&Array.isArray(lt.thirdPlace._games)&&lt.thirdPlace._games.length&&(tp._games=lt.thirdPlace._games),rt.thirdPlace=tp}return rt.teamMatches=_pcMergeById(_fbArr(rt.teamMatches,[]),_fbArr(lt.teamMatches,[]),(m,i)=>m&&m._id||i),rt}function _mergeProTourneysRemoteWithLocal(remoteArr,localArr){const remote=_fbArr(remoteArr,[]),local=_fbArr(localArr,[]),out=remote.map(rt=>{const id=String(rt&&rt.id||""),lt=local.find(x=>String(x&&x.id||"")===id);return lt?_mergeSingleProTourney(rt,lt):rt});return window._mergeRemoteIsNewer||local.forEach(lt=>{const id=String(lt&&lt.id||"");out.some(rt=>String(rt&&rt.id||"")===id)||out.push(lt)}),out}function _applyCloudData(d){d=_decompressCloudData(d);try{window._applyingCloudData=!0}catch(e){}const _has=key=>d[key]!==void 0&&d[key]!==null;try{const remoteSavedAt=Number(d&&d.savedAt||0)||0,localSavedAt=Math.max(Number(window._lastAdminSaveTime||0)||0,Number(localStorage.getItem("su_last_admin_save")||0)||0);window._mergeRemoteIsNewer=remoteSavedAt>0&&remoteSavedAt>localSavedAt+1e3}catch(e){window._mergeRemoteIsNewer=!1}{const v=d.players||d.player;if(v!==void 0){players=_fbArr(v,[]),players.forEach(p=>{p.history&&(p.history=_fbArr(p.history,[]))});try{const pm=d.playerPhotos||d.pPhotoMap||d.playerPhotoMap||null;pm&&players.forEach(p=>{p&&p.name&&!p.photo&&pm[p.name]&&(p.photo=pm[p.name])})}catch(e){}}}(_has("univCfg")||_has("univConfig")||_has("universities"))&&(univCfg=_fbArr(d.univCfg||d.univConfig||d.universities,univCfg)),_has("maps")&&(maps=_fbArr(d.maps||d.map,maps)),_has("tourD")&&(tourD=_fbArr(d.tourD||d.tournamentDates,Array(15).fill("")));{const v=d.miniM||d.mini||d.miniMatches,arr=v?_fbArr(v,[]):_has("miniM")?[]:null;arr!==null&&(miniM=_mergeRecordCollection(arr,_fbArr(typeof miniM!="undefined"?miniM:[],[])),miniM.forEach(m=>{m.sets&&(m.sets=_fbArr(m.sets,[])),m.sets&&m.sets.forEach(s=>{s.games&&(s.games=_fbArr(s.games,[]))})}))}{const v=d.univM||d.univ||d.univMatches,arr=v?_fbArr(v,[]):_has("univM")?[]:null;arr!==null&&(univM=_mergeRecordCollection(arr,_fbArr(typeof univM!="undefined"?univM:[],[])),univM.forEach(m=>{m.sets&&(m.sets=_fbArr(m.sets,[])),m.sets&&m.sets.forEach(s=>{s.games&&(s.games=_fbArr(s.games,[]))})}))}{const v=d.comps||d.comp||d.competitions,arr=v?_fbArr(v,[]):_has("comps")?[]:null;arr!==null&&(comps=_mergeRecordCollection(arr,_fbArr(typeof comps!="undefined"?comps:[],[])))}{const v=d.ckM||d.ck||d.ckMatches,arr=v?_fbArr(v,[]):_has("ckM")?[]:null;arr!==null&&(ckM=_mergeRecordCollection(arr,_fbArr(typeof ckM!="undefined"?ckM:[],[])),ckM.forEach(m=>{m.sets&&(m.sets=_fbArr(m.sets,[])),m.teamAMembers&&(m.teamAMembers=_fbArr(m.teamAMembers,[])),m.teamBMembers&&(m.teamBMembers=_fbArr(m.teamBMembers,[])),m.sets&&m.sets.forEach(s=>{s.games&&(s.games=_fbArr(s.games,[]))})}))}_has("compNames")&&(compNames=_fbArr(d.compNames||d.competitionNames,[])),(_has("curComp")||d.savedAt)&&(curComp=d.curComp||d.currentComp||"");{const v=d.proM||d.pro||d.proMatches,arr=v?_fbArr(v,[]):_has("proM")?[]:null;arr!==null&&(proM=_mergeRecordCollection(arr,_fbArr(typeof proM!="undefined"?proM:[],[])),proM.forEach(m=>{m.sets&&(m.sets=_fbArr(m.sets,[])),m.teamAMembers&&(m.teamAMembers=_fbArr(m.teamAMembers,[])),m.teamBMembers&&(m.teamBMembers=_fbArr(m.teamBMembers,[])),m.sets&&m.sets.forEach(s=>{s.games&&(s.games=_fbArr(s.games,[]))})}))}{const v=d.proTourneys,arr=v?_fbArr(v,[]):_has("proTourneys")?[]:null;if(arr!==null){const localProTourneys=_fbArr(typeof proTourneys!="undefined"?proTourneys:[],[]);proTourneys=_mergeProTourneysRemoteWithLocal(arr,localProTourneys)}}{const v=d.tourneys||d.tournaments||d.tourney,arr=v?_fbArr(v,[]):_has("tourneys")?[]:null;arr!==null&&(tourneys=_mergeTourneysRemoteWithLocal(arr,_fbArr(typeof tourneys!="undefined"?tourneys:[],[])),tourneys.forEach(tn=>{tn.groups=_fbArr(tn.groups,[]),tn.groups.forEach(g=>{g.univs=_fbArr(g.univs,[]),g.matches=_fbArr(g.matches,[]),g.matches.forEach(m=>{m.sets=_fbArr(m.sets,[])})})}))}{const v=d.ttM||d.tiertour||d.tierTourM,arr=v?_fbArr(v,[]):_has("ttM")?[]:null;if(arr!==null){ttM=_mergeRecordCollection(arr,_fbArr(typeof ttM!="undefined"?ttM:[],[]));try{(ttM||[]).forEach(m=>{m.sets&&(m.sets=_fbArr(m.sets,[])),(m.sets||[]).forEach(s=>{s.games&&(s.games=_fbArr(s.games,[]))})})}catch(e){}try{typeof _ttMigrated!="undefined"&&(_ttMigrated=!1)}catch(e){}}}{const v=d.indM||d.ind,arr=v?_fbArr(v,[]):_has("indM")?[]:null;arr!==null&&(indM=_mergeRecordCollection(arr,_fbArr(typeof indM!="undefined"?indM:[],[])))}{const v=d.gjM,arr=v?_fbArr(v,[]):_has("gjM")?[]:null;arr!==null&&(gjM=_mergeRecordCollection(arr,_fbArr(typeof gjM!="undefined"?gjM:[],[])))}if(d.tiers&&d.tiers.length&&typeof TIERS!="undefined"&&TIERS.splice(0,TIERS.length,...d.tiers),d.boardPlayerOrder!==void 0&&typeof boardPlayerOrder!="undefined"&&(Object.keys(boardPlayerOrder).forEach(k=>delete boardPlayerOrder[k]),Object.assign(boardPlayerOrder,d.boardPlayerOrder||{}),typeof saveBoardPlayerOrder=="function"&&saveBoardPlayerOrder()),d.boardOrder!==void 0&&typeof boardOrder!="undefined"&&(boardOrder=d.boardOrder),d.userMapAlias!==void 0&&typeof userMapAlias!="undefined"&&(userMapAlias=d.userMapAlias),d.playerStatusIcons!==void 0&&typeof playerStatusIcons!="undefined"){Object.keys(playerStatusIcons).forEach(k=>delete playerStatusIcons[k]),Object.assign(playerStatusIcons,d.playerStatusIcons||{});try{typeof _iconPersistState=="function"&&_iconPersistState()}catch(e){}}if(d.notices!==void 0&&typeof notices!="undefined"&&(notices=d.notices),d.seasons!==void 0&&typeof seasons!="undefined"&&(seasons=_fbArr(d.seasons,[])),d.calScheduled!==void 0&&typeof calScheduled!="undefined"&&(calScheduled=_fbArr(d.calScheduled,[]),window._calScheduled=calScheduled),d.voteAgg!==void 0&&typeof voteData!="undefined"){const myVotes={};Object.entries(voteData||{}).forEach(([k,v])=>{k.endsWith("_my")&&(myVotes[k]=v)}),Object.keys(voteData).forEach(k=>delete voteData[k]),Object.assign(voteData,d.voteAgg||{},myVotes),localStorage.setItem("su_votes",JSON.stringify(voteData))}if(d.curProComp!==void 0&&typeof curProComp!="undefined"&&(curProComp=d.curProComp),d._ttCurComp!==void 0&&typeof _ttCurComp!="undefined"&&(_ttCurComp=d._ttCurComp),d.appSettings!==void 0){const s=d.appSettings;s.fabTabs&&localStorage.setItem("su_fabTabs",JSON.stringify(s.fabTabs)),s.globalImgSettings&&localStorage.setItem("su_b2_global_img_settings",JSON.stringify(s.globalImgSettings)),s.imgSettings&&localStorage.setItem("su_img_settings",JSON.stringify(s.imgSettings)),s.fabHideMobile!==void 0&&localStorage.setItem("su_fabHideMobile",s.fabHideMobile?"1":"0"),s.fabHidePC!==void 0&&localStorage.setItem("su_fabHidePC",s.fabHidePC?"1":"0"),s.darkMode!==void 0&&localStorage.setItem("su_dark",s.darkMode?"1":"0"),s.b2LabelAlpha!==void 0&&localStorage.setItem("su_b2la",s.b2LabelAlpha),s.b2BgAlpha!==void 0&&localStorage.setItem("su_b2ba",s.b2BgAlpha);try{const ls=s.ls||s.localStorage||null;if(ls&&typeof ls=="object"){let localExtTs=0,cloudExtTs=0;try{localExtTs=Number(localStorage.getItem("su_hist_ext_last_modified")||0)||0}catch(e){}try{cloudExtTs=Number(ls.su_hist_ext_last_modified||0)||0}catch(e){}const extKeys=new Set(["su_hist_ext_data_v1","su_hist_ext_proxy_presets_v1","su_hist_ext_proxy_preset_sel_v1","su_hist_ext_last_modified"]);Object.entries(ls).forEach(([k,v])=>{if(!(!k||typeof k!="string")&&k.startsWith("su_")&&!k.startsWith("su_pp")&&!(k==="su_fb_pw"||k==="su_gh_token"||k==="su_admin_hash"||k==="su_admin_hashes")&&!(k==="su_last_admin_save"||k==="su_last_save_time")&&!(extKeys.has(k)&&localExtTs&&localExtTs>cloudExtTs))try{localStorage.setItem(k,String(v))}catch(e){}})}}catch(e){}typeof updateFabVisibility=="function"&&updateFabVisibility(),typeof updateFabButtonOnclick=="function"&&updateFabButtonOnclick();try{typeof applyProfileShapeVars=="function"&&applyProfileShapeVars()}catch(e){}s.darkMode!==void 0&&(document.body.classList.toggle("dark",s.darkMode),window._fixHdrBtns&&window._fixHdrBtns()),s.b2LabelAlpha!==void 0&&(b2LabelAlpha=parseInt(s.b2LabelAlpha)),s.b2BgAlpha!==void 0&&(b2BgAlpha=parseInt(s.b2BgAlpha));const b2Content=document.getElementById("b2-content");b2Content&&typeof _b2UnivView=="function"&&(b2Content.innerHTML=_b2UnivView(),typeof injectUnivIcons=="function"&&injectUnivIcons(b2Content));try{s.bgmEnabled!==void 0&&localStorage.setItem("su_bgm_enabled",s.bgmEnabled?"1":"0"),s.bgmShuffle!==void 0&&localStorage.setItem("su_bgm_shuffle",s.bgmShuffle?"1":"0"),s.bgmVolume!==void 0&&localStorage.setItem("su_bgm_volume",String(s.bgmVolume)),s.bgmList!==void 0&&localStorage.setItem("su_bgm_list",String(s.bgmList||"")),s.soopList!==void 0&&localStorage.setItem("su_soop_list",String(s.soopList||"")),typeof window.bgmApplySettings=="function"&&window.bgmApplySettings(),typeof window.soopApplySettings=="function"&&window.soopApplySettings()}catch(e){}try{s.histExtData!==void 0&&localStorage.setItem("su_hist_ext_data_v1",String(s.histExtData||"")),s.histExtProxyPresets!==void 0&&localStorage.setItem("su_hist_ext_proxy_presets_v1",String(s.histExtProxyPresets||"")),s.histExtProxyPresetSel!==void 0&&localStorage.setItem("su_hist_ext_proxy_preset_sel_v1",String(s.histExtProxyPresetSel||""))}catch(e){}try{s.designV2On!==void 0&&localStorage.setItem("su_design_v2",s.designV2On?"1":"0"),s.designV2Preset!==void 0&&localStorage.setItem("su_design_v2_preset",String(s.designV2Preset||"base")),s.designV2Bright!==void 0&&localStorage.setItem("su_design_v2_bright",String(s.designV2Bright||"0")),s.designV2Dark!==void 0&&localStorage.setItem("su_design_v2_dark",String(s.designV2Dark||"0")),s.designV2Colors!==void 0&&localStorage.setItem("su_design_v2_colors",String(s.designV2Colors||"{}")),s.designV2Effects!==void 0&&localStorage.setItem("su_design_v2_effects",String(s.designV2Effects||"{}")),s.appFontPreset!==void 0&&localStorage.setItem("su_app_font_preset",String(s.appFontPreset||"noto")),s.appFontCss!==void 0&&localStorage.setItem("su_app_font_css",String(s.appFontCss||"")),s.appFontFamily!==void 0&&localStorage.setItem("su_app_font_family",String(s.appFontFamily||"")),s.appFontCssText!==void 0&&localStorage.setItem("su_app_font_css_text",String(s.appFontCssText||"")),s.appFontAliasMap!==void 0&&localStorage.setItem("su_app_font_alias_map",String(s.appFontAliasMap||"{}")),s.appFontScalePct!==void 0&&localStorage.setItem("su_app_font_scale_pct",String(s.appFontScalePct||"100")),s.appFontScalePcPct!==void 0&&localStorage.setItem("su_app_font_scale_pc_pct",String(s.appFontScalePcPct||"100")),s.appFontScaleTbPct!==void 0&&localStorage.setItem("su_app_font_scale_tb_pct",String(s.appFontScaleTbPct||"100")),s.appFontScaleMbPct!==void 0&&localStorage.setItem("su_app_font_scale_mb_pct",String(s.appFontScaleMbPct||"100")),s.uiScalePct!==void 0&&localStorage.setItem("su_ui_scale_pct",String(s.uiScalePct||"100")),s.uiScalePcPct!==void 0&&localStorage.setItem("su_ui_scale_pc_pct",String(s.uiScalePcPct||"100")),s.uiScaleTbPct!==void 0&&localStorage.setItem("su_ui_scale_tb_pct",String(s.uiScaleTbPct||"100")),s.uiScaleMbPct!==void 0&&localStorage.setItem("su_ui_scale_mb_pct",String(s.uiScaleMbPct||"100")),typeof window._applyAppFont=="function"&&window._applyAppFont(),typeof window._applyAppFontScale=="function"&&window._applyAppFontScale(),typeof window.applyDesignV2=="function"&&window.applyDesignV2(),typeof window._applyUiScale=="function"&&window._applyUiScale()}catch(e){}try{s.femcoSettings!=null&&localStorage.setItem("b2_femco_settings_v1",String(s.femcoSettings)),s.femcoUniv!=null&&localStorage.setItem("cfg_femco_univ",String(s.femcoUniv))}catch(e){}}try{window._applyingCloudData=!1}catch(e){}try{window._mergeRemoteIsNewer=!1}catch(e){}}window.onFirebaseLoad=function(data){const _a=data,{admin_pw:_}=_a,clean=__objRest(_a,["admin_pw"]);try{window._lastFbDataSize=JSON.stringify(data).length,window._lastFbLoadTime=Date.now()}catch(e){}const _getSavedAt=obj=>{try{return Number(obj&&obj.savedAt||0)||0}catch(e){return 0}},_getLocalSavedAt=()=>{try{const a=Number(window._lastAdminSaveTime||0)||0,b=Number(localStorage.getItem("su_last_admin_save")||0)||0;return Math.max(a,b)}catch(e){return Number(window._lastAdminSaveTime||0)||0}},_markReceiveMeta=sa=>{try{sa&&localStorage.setItem("su_sync_last_remote_saved_at",String(sa)),localStorage.setItem("su_sync_last_received_at",String(Date.now()))}catch(e){}};try{const sa=_getSavedAt(clean),localSavedAt=_getLocalSavedAt(),lastApplied=Number(window._lastAppliedSavedAt||0)||0;if(!window._forcingSync&&window._isSaving){const pendingSa=_getSavedAt(window._fbPendingData);(!window._fbPendingData||sa>=pendingSa)&&(window._fbPendingData=clean);const fbTs2=document.getElementById("fbLastSync");fbTs2&&(fbTs2.textContent="\u23F3 \uC800\uC7A5 \uC911 \uC218\uC2E0 \uB300\uAE30");return}if(!window._forcingSync&&sa&&lastApplied&&sa<=lastApplied){_markReceiveMeta(sa);const fbTs2=document.getElementById("fbLastSync");fbTs2&&(fbTs2.textContent="\u{1F504} "+new Date().toLocaleTimeString("ko-KR"));return}if(!window._forcingSync&&sa&&localSavedAt&&sa<localSavedAt){console.warn("[sync] stale remote ignored",{remoteSavedAt:sa,localSavedAt});try{typeof window.refreshCloudSyncStatus=="function"&&window.refreshCloudSyncStatus("\u23ED\uFE0F \uC624\uB798\uB41C \uC6D0\uACA9 \uB370\uC774\uD130 \uBB34\uC2DC","#d97706")}catch(e){}_markReceiveMeta(sa);return}sa&&(window._lastAppliedSavedAt=Math.max(lastApplied,sa)),_markReceiveMeta(sa)}catch(e){}_applyCloudData(clean);try{typeof window._syncWindowDataRefs=="function"&&window._syncWindowDataRefs()}catch(e){}typeof localSave=="function"&&localSave();try{typeof window._primeMatchSyncSignature=="function"&&window._primeMatchSyncSignature(!0)}catch(e){}typeof fixPoints=="function"&&fixPoints(),window._compListCache={},window._shareAllMatchesCached=null,window._histTourneyCache={},typeof render=="function"&&render();const _openModal=document.getElementById("playerModal"),pst=typeof getPlayerDetailState=="function"?getPlayerDetailState():window.PlayerDetailState||{};_openModal&&_openModal.style.display!=="none"&&pst.currentName&&typeof openPlayerModal=="function"&&openPlayerModal(pst.currentName);const _openUnivModal=document.getElementById("univModal"),ust=typeof getUnivDetailState=="function"?getUnivDetailState():window.UnivDetailState||{};_openUnivModal&&_openUnivModal.style.display!=="none"&&ust.currentName&&typeof openUnivModal=="function"&&openUnivModal(ust.currentName);const fbTs=document.getElementById("fbLastSync");fbTs&&(fbTs.textContent="\u{1F504} "+new Date().toLocaleTimeString("ko-KR"))};try{window._fbArr=_fbArr}catch(e){}try{window._decompressCloudData=_decompressCloudData}catch(e){}try{window._applyCloudData=_applyCloudData}catch(e){}

/* cloud-status.js */
function gsSetStatus(msg,color="var(--gray-l)"){const el=document.getElementById("cloudStatus");el&&(el.textContent=msg,el.style.color=color)}try{window.gsSetStatus=gsSetStatus}catch(e){}function _fmtSyncTs(ts){const n=Number(ts||0)||0;if(!n)return"\uAE30\uB85D \uC5C6\uC74C";try{return new Date(n).toLocaleString("ko-KR")}catch(e){return"\uAE30\uB85D \uC5C6\uC74C"}}function _getSyncFreshnessMeta(){const localLatest=Math.max(Number(window._lastAdminSaveTime||0)||0,Number(localStorage.getItem("su_last_admin_save")||0)||0,Number(localStorage.getItem("su_last_save_time")||0)||0),remoteLatest=Number(localStorage.getItem("su_sync_last_remote_saved_at")||0)||0,diff=localLatest-remoteLatest,threshold=1500;let state="unknown",label="\uBE44\uAD50 \uC815\uBCF4 \uBD80\uC871",color="var(--gray-l)";return localLatest&&remoteLatest?Math.abs(diff)<=threshold?(state="same",label="\uB85C\uCEEC/\uC6D0\uACA9 \uAC70\uC758 \uB3D9\uC77C",color="#16a34a"):diff>0?(state="local_newer",label="\uB85C\uCEEC\uC774 \uB354 \uCD5C\uC2E0",color="#d97706"):(state="remote_newer",label="\uC6D0\uACA9\uC774 \uB354 \uCD5C\uC2E0",color="#2563eb"):localLatest?(state="local_only",label="\uB85C\uCEEC \uC800\uC7A5 \uAE30\uB85D\uB9CC \uC788\uC74C",color="#d97706"):remoteLatest&&(state="remote_only",label="\uC6D0\uACA9 \uC800\uC7A5 \uAE30\uB85D\uB9CC \uC788\uC74C",color="#2563eb"),{localLatest,remoteLatest,diff,state,label,color}}function _canViewSyncDebugInfo(){try{return!!(typeof isLoggedIn!="undefined"&&isLoggedIn)&&!(typeof isSubAdmin!="undefined"&&isSubAdmin)}catch(e){return!1}}function refreshCloudSyncStatus(msg,color){const el=document.getElementById("cloudStatus"),panel=document.getElementById("cfg-fb-sync-result"),canViewDebug=_canViewSyncDebugInfo(),lastUploadOk=Number(localStorage.getItem("su_sync_last_upload_ok_at")||0)||0,lastReceived=Number(localStorage.getItem("su_sync_last_received_at")||0)||0,lastRemoteSaved=Number(localStorage.getItem("su_sync_last_remote_saved_at")||0)||0,freshness=_getSyncFreshnessMeta(),lastSignalSeen=Number(localStorage.getItem("su_sync_last_firebase_signal_at")||0)||0,lastSignalPush=Number(localStorage.getItem("su_sync_last_firebase_signal_push_at")||0)||0,missingMonths=(()=>{try{return JSON.parse(localStorage.getItem("su_sync_missing_months")||"[]")||[]}catch(e){return[]}})(),failMsg=String(localStorage.getItem("su_sync_last_fail_msg")||"").trim(),summary=canViewDebug?`\uC800\uC7A5 ${_fmtSyncTs(lastUploadOk)} / \uC218\uC2E0 ${_fmtSyncTs(lastReceived)}${lastRemoteSaved?` / \uC6D0\uACA9\uC800\uC7A5 ${_fmtSyncTs(lastRemoteSaved)}`:""}${lastSignalSeen?` / \uC2E0\uD638 ${_fmtSyncTs(lastSignalSeen)}`:""}${freshness.state!=="unknown"?` / ${freshness.label}`:""}`:failMsg?"\uB3D9\uAE30\uD654 \uBB38\uC81C \uC788\uC74C":msg||"\uB3D9\uAE30\uD654 \uB300\uAE30";if(el&&(el.style.color=color||(failMsg?"#dc2626":"var(--gray-l)"),el.textContent=canViewDebug&&msg?`${msg} \xB7 ${summary}`:summary),panel){if(!canViewDebug){panel.innerHTML=`
        <div style="display:grid;gap:6px">
          <div><b>\uCD5C\uADFC \uC0C1\uD0DC:</b> ${msg||(failMsg?"\uB3D9\uAE30\uD654 \uBB38\uC81C \uC788\uC74C":"\uB300\uAE30 \uC911")}</div>
          ${failMsg?`<div style="color:#dc2626"><b>\uCD5C\uADFC \uC2E4\uD328:</b> ${failMsg}</div>`:""}
        </div>`;return}panel.innerHTML=`
      <div style="display:grid;gap:6px">
        <div><b>\uB85C\uCEEC \uCD5C\uC2E0 \uC800\uC7A5:</b> ${_fmtSyncTs(freshness.localLatest)}</div>
        <div><b>\uCD5C\uADFC \uC5C5\uB85C\uB4DC:</b> ${_fmtSyncTs(lastUploadOk)}</div>
        <div><b>\uCD5C\uADFC \uC218\uC2E0:</b> ${_fmtSyncTs(lastReceived)}</div>
        <div><b>\uC6D0\uACA9 savedAt:</b> ${_fmtSyncTs(lastRemoteSaved)}</div>
        <div><b>\uCD5C\uC2E0 \uBE44\uAD50:</b> <span style="color:${freshness.color};font-weight:700">${freshness.label}</span></div>
        <div><b>\uBCF4\uC870 \uC2E0\uD638 \uC218\uC2E0:</b> ${_fmtSyncTs(lastSignalSeen)}</div>
        <div><b>\uBCF4\uC870 \uC2E0\uD638 \uBC1C\uD589:</b> ${_fmtSyncTs(lastSignalPush)}</div>
        <div><b>\uB204\uB77D \uC6D4 \uD30C\uC77C:</b> ${missingMonths.length?missingMonths.join(", "):"\uC5C6\uC74C"}</div>
        <div><b>\uCD5C\uADFC \uC0C1\uD0DC:</b> ${msg||(failMsg?"\uC5C5\uB85C\uB4DC \uC2E4\uD328 \uAE30\uB85D \uC788\uC74C":"\uB300\uAE30 \uC911")}</div>
        ${failMsg?`<div style="color:#dc2626"><b>\uCD5C\uADFC \uC2E4\uD328:</b> ${failMsg}</div>`:""}
      </div>`}}async function checkFbSyncStatus(){const el=document.getElementById("cfg-fb-sync-result");if(!el)return;el.innerHTML='<span style="color:var(--blue)">\u{1F504} \uD655\uC778 \uC911...</span>';const canViewDebug=_canViewSyncDebugInfo(),fbConnected=typeof window.fbSet=="function",hasPw=!!localStorage.getItem("su_gh_token"),lastSave=localStorage.getItem("su_last_save_time"),lastSignal=Number(localStorage.getItem("su_sync_last_firebase_signal_at")||0)||0,freshness=_getSyncFreshnessMeta(),missingMonths=(()=>{try{return JSON.parse(localStorage.getItem("su_sync_missing_months")||"[]")||[]}catch(e){return[]}})(),localSize=(()=>{let t=0;for(let k in localStorage)k.startsWith("su_")&&(t+=(localStorage.getItem(k)||"").length*2);return t})(),fmt=b=>b>=1024*1024?(b/1024/1024).toFixed(2)+"MB":b>=1024?(b/1024).toFixed(1)+"KB":b+"B",fbSize=window._lastFbDataSize||null;let rows=`
    <div style="display:grid;gap:8px">
      <div style="display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:8px;background:${fbConnected?"#f0fdf4":"#fef2f2"};border:1px solid ${fbConnected?"#bbf7d0":"#fecaca"}">
        <span style="font-size:16px">${fbConnected?"\u2705":"\u274C"}</span>
        <div>
          <div style="font-weight:700;font-size:12px">GitHub \uB3D9\uAE30\uD654 \uBAA8\uB4C8</div>
          <div style="font-size:11px;color:var(--gray-l)">${fbConnected?"\uC815\uC0C1 \uC5F0\uACB0\uB428":"GitHub \uB3D9\uAE30\uD654 \uBAA8\uB4C8 \uBBF8\uB85C\uB4DC"}</div>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:8px;background:${hasPw?"#f0fdf4":"#fffbeb"};border:1px solid ${hasPw?"#bbf7d0":"#fde68a"}">
        <span style="font-size:16px">${hasPw?"\u{1F511}":"\u26A0\uFE0F"}</span>
        <div>
          <div style="font-weight:700;font-size:12px">GitHub \uD1A0\uD070</div>
          <div style="font-size:11px;color:var(--gray-l)">${hasPw?"\uC124\uC815\uB428 \u2014 \uC218\uB3D9 \uBC84\uD2BC\uC73C\uB85C GitHub data.json \uC5C5\uB85C\uB4DC \uAC00\uB2A5":"\uBBF8\uC124\uC815 \u2014 GitHub \uC5C5\uB85C\uB4DC \uBD88\uAC00, \uB85C\uCEEC\uB9CC \uC800\uC7A5"}</div>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:8px;background:${lastSignal?"#eff6ff":"#f8fafc"};border:1px solid ${lastSignal?"#bfdbfe":"var(--border)"}">
        <span style="font-size:16px">\u{1F4E1}</span>
        <div>
          <div style="font-weight:700;font-size:12px">\uBCF4\uC870 \uC2E0\uD638 \uCC44\uB110</div>
          <div style="font-size:11px;color:var(--gray-l)">${canViewDebug?lastSignal?`\uCD5C\uADFC \uC2E0\uD638 ${new Date(lastSignal).toLocaleString("ko-KR")}`:"\uC544\uC9C1 \uC218\uC2E0 \uAE30\uB85D \uC5C6\uC74C":lastSignal?"\uC0C8 \uB370\uC774\uD130 \uC218\uC2E0 \uAE30\uB85D \uC788\uC74C":"\uC544\uC9C1 \uC218\uC2E0 \uAE30\uB85D \uC5C6\uC74C"}</div>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:8px;background:${missingMonths.length?"#fff7ed":"var(--surface)"};border:1px solid ${missingMonths.length?"#fdba74":"var(--border)"}">
        <span style="font-size:16px">${missingMonths.length?"\u26A0\uFE0F":"\u{1F5C2}\uFE0F"}</span>
        <div>
          <div style="font-weight:700;font-size:12px">\uC6D4\uBCC4 \uAE30\uB85D \uD30C\uC77C</div>
          <div style="font-size:11px;color:var(--gray-l)">${missingMonths.length?`\uB204\uB77D: ${missingMonths.join(", ")}`:"\uB204\uB77D \uC5C6\uC74C"}</div>
        </div>
      </div>
      ${canViewDebug?`
      <div style="display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:8px;background:var(--surface);border:1px solid var(--border)">
        <span style="font-size:16px">\u{1F4BE}</span>
        <div>
          <div style="font-weight:700;font-size:12px">\uB9C8\uC9C0\uB9C9 \uC800\uC7A5</div>
          <div style="font-size:11px;color:var(--gray-l)">${lastSave?new Date(parseInt(lastSave)).toLocaleString("ko-KR"):"\uAE30\uB85D \uC5C6\uC74C"}</div>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:8px;background:${freshness.state==="local_newer"?"#fff7ed":freshness.state==="remote_newer"?"#eff6ff":"#f0fdf4"};border:1px solid ${freshness.state==="local_newer"?"#fdba74":freshness.state==="remote_newer"?"#bfdbfe":"#bbf7d0"}">
        <span style="font-size:16px">${freshness.state==="local_newer"?"\u{1F5A5}\uFE0F":freshness.state==="remote_newer"?"\u2601\uFE0F":"\u{1F91D}"}</span>
        <div>
          <div style="font-weight:700;font-size:12px">\uB85C\uCEEC/\uC6D0\uACA9 \uCD5C\uC2E0 \uBE44\uAD50</div>
          <div style="font-size:11px;color:${freshness.color}">${freshness.label}</div>
          <div style="font-size:10px;color:var(--gray-l)">\uB85C\uCEEC ${_fmtSyncTs(freshness.localLatest)} / \uC6D0\uACA9 ${_fmtSyncTs(freshness.remoteLatest)}</div>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:8px;background:var(--surface);border:1px solid var(--border)">
        <span style="font-size:16px">\u{1F4E6}</span>
        <div>
          <div style="font-weight:700;font-size:12px">\uB85C\uCEEC \uB370\uC774\uD130 \uD06C\uAE30</div>
          <div style="font-size:11px;color:var(--gray-l)">${fmt(localSize)} ${fbSize?`/ \uB3D9\uAE30\uD654 \uB370\uC774\uD130: ${fmt(fbSize*2)}`:"(\uB3D9\uAE30\uD654 \uD06C\uAE30 \uBBF8\uD655\uC778)"}</div>
        </div>
      </div>`:""}
      <div style="display:grid;gap:8px;grid-template-columns:1fr">
        ${missingMonths.length?`<button class="btn btn-w btn-sm" onclick="(async(btn)=>{const old=btn.textContent;btn.disabled=true;btn.textContent='\u{1F504} \uB204\uB77D \uC6D4 \uC7AC\uC218\uC2E0 \uC911...';try{if(typeof fbRetryMissingMonths==='function') await fbRetryMissingMonths();}catch(e){console.error('[fbRetryMissingMonths]',e);}finally{btn.disabled=false;btn.textContent=old;setTimeout(checkFbSyncStatus,300);}})(this)" style="width:100%">\u{1F5C2}\uFE0F \uB204\uB77D \uC6D4 \uB2E4\uC2DC\uBC1B\uAE30</button>`:""}
        ${isLoggedIn&&hasPw?`<button class="btn btn-b btn-sm" onclick="(async(btn)=>{const old=btn.textContent;btn.disabled=true;btn.textContent='\u23EB \uC5C5\uB85C\uB4DC \uC911...';try{await fbCloudSave();localStorage.setItem('su_last_save_time',Date.now());btn.textContent='\u2705 \uC644\uB8CC';}catch(e){btn.textContent='\u274C \uC2E4\uD328';}finally{setTimeout(()=>{btn.disabled=false;btn.textContent=old;checkFbSyncStatus();},500);}})(this)" style="width:100%">\u2B06\uFE0F \uC9C0\uAE08 GitHub data.json\uC5D0 \uC5C5\uB85C\uB4DC</button>`:""}
      </div>
    </div>`;el.innerHTML=rows}try{window._fmtSyncTs=_fmtSyncTs}catch(e){}try{window._getSyncFreshnessMeta=_getSyncFreshnessMeta}catch(e){}try{window._canViewSyncDebugInfo=_canViewSyncDebugInfo}catch(e){}try{window.refreshCloudSyncStatus=refreshCloudSyncStatus}catch(e){}try{window.checkFbSyncStatus=checkFbSyncStatus}catch(e){}

/* cloud-board-state.js */
var __defProp=Object.defineProperty;var __getOwnPropSymbols=Object.getOwnPropertySymbols;var __hasOwnProp=Object.prototype.hasOwnProperty,__propIsEnum=Object.prototype.propertyIsEnumerable;var __defNormalProp=(obj,key,value)=>key in obj?__defProp(obj,key,{enumerable:!0,configurable:!0,writable:!0,value}):obj[key]=value,__spreadValues=(a,b)=>{for(var prop in b||(b={}))__hasOwnProp.call(b,prop)&&__defNormalProp(a,prop,b[prop]);if(__getOwnPropSymbols)for(var prop of __getOwnPropSymbols(b))__propIsEnum.call(b,prop)&&__defNormalProp(a,prop,b[prop]);return a};var __objRest=(source,exclude)=>{var target={};for(var prop in source)__hasOwnProp.call(source,prop)&&exclude.indexOf(prop)<0&&(target[prop]=source[prop]);if(source!=null&&__getOwnPropSymbols)for(var prop of __getOwnPropSymbols(source))exclude.indexOf(prop)<0&&__propIsEnum.call(source,prop)&&(target[prop]=source[prop]);return target};const GITHUB_JSON_URL="https://raw.githubusercontent.com/nada1004/star-system/main/star-datacenter/data.json",_FB_PW_DEFAULT="haram1019!@";function _boardCanManage(){try{return!!(typeof isLoggedIn!="undefined"&&isLoggedIn)&&!(typeof isSubAdmin!="undefined"&&isSubAdmin)}catch(e){return!1}}async function fbCloudSave(opts){var _a,_b;const includeSettings=!(opts&&opts.includeSettings===!1);if(!localStorage.getItem("su_gh_token")||!_boardCanManage()||typeof window.fbSet!="function")return;const savedAt=Date.now();window._lastAdminSaveTime=savedAt,window._isSaving=!0,localStorage.setItem("su_last_admin_save",String(savedAt));const _pPhotoMap={},_pNoPhoto=(players||[]).map(p=>{const c=__spreadValues({},p);return c.photo&&(_pPhotoMap[c.name]=c.photo,delete c.photo),c.history&&c.history.length&&(c.history=c.history.map(_a2=>{var _b2=_a2,{eloAfter}=_b2,h=__objRest(_b2,["eloAfter"]);return h})),c}),_syncLs={};if(includeSettings)try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(!k||typeof k!="string"||!k.startsWith("su_")||k.startsWith("su_pp")||k==="su_fb_pw"||k==="su_gh_token"||k==="su_admin_hash"||k==="su_admin_hashes"||k==="su_last_admin_save"||k==="su_last_save_time"||k==="su_hist_ext_data_v1"||k==="su_hist_ext_proxy_presets_v1"||k==="su_hist_ext_proxy_preset_sel_v1"||k==="su_hist_ext_last_modified")continue;const v=localStorage.getItem(k);v!=null&&(String(v).length>2e5||(_syncLs[k]=v))}}catch(e){}const dataObj={players:_pNoPhoto,playerPhotos:_pPhotoMap,univCfg,maps,tourD,miniM,univM,comps,ckM,compNames,curComp,proM,proTourneys,tiers:TIERS,tourneys,indM,gjM,ttM:typeof ttM!="undefined"?ttM:[],boardPlayerOrder,boardOrder,userMapAlias,playerStatusIcons,notices,curProComp,_ttCurComp,seasons,calScheduled,voteAgg:(()=>{const agg={};return Object.entries(voteData||{}).forEach(([k,v])=>{!k.endsWith("_my")&&v&&typeof v=="object"&&(agg[k]=v)}),agg})(),savedAt};window.playerPhotos=_pPhotoMap,Object.entries(_pPhotoMap).forEach(([name,url])=>{_brdPhotoCacheSet(name,url)}),includeSettings&&(dataObj.appSettings={fabTabs:JSON.parse(localStorage.getItem("su_fabTabs")||"{}"),globalImgSettings:JSON.parse(localStorage.getItem("su_b2_global_img_settings")||"{}"),imgSettings:JSON.parse(localStorage.getItem("su_img_settings")||"{}"),fabHideMobile:localStorage.getItem("su_fabHideMobile")==="1",fabHidePC:localStorage.getItem("su_fabHidePC")==="1",darkMode:localStorage.getItem("su_dark")==="1",b2LabelAlpha:localStorage.getItem("su_b2la")||"16",b2BgAlpha:localStorage.getItem("su_b2ba")||"9",designV2On:localStorage.getItem("su_design_v2")==="1",designV2Preset:localStorage.getItem("su_design_v2_preset")||"base",designV2Bright:localStorage.getItem("su_design_v2_bright")||"0",designV2Dark:localStorage.getItem("su_design_v2_dark")||"0",designV2Colors:localStorage.getItem("su_design_v2_colors")||"{}",designV2Effects:localStorage.getItem("su_design_v2_effects")||"{}",appFontPreset:localStorage.getItem("su_app_font_preset")||"noto",appFontCss:localStorage.getItem("su_app_font_css")||"",appFontFamily:localStorage.getItem("su_app_font_family")||"",appFontCssText:localStorage.getItem("su_app_font_css_text")||"",appFontAliasMap:localStorage.getItem("su_app_font_alias_map")||"{}",uiScalePct:localStorage.getItem("su_ui_scale_pct")||"100",uiScalePcPct:localStorage.getItem("su_ui_scale_pc_pct")||localStorage.getItem("su_ui_scale_pct")||"100",uiScaleTbPct:localStorage.getItem("su_ui_scale_tb_pct")||localStorage.getItem("su_ui_scale_pct")||"100",uiScaleMbPct:localStorage.getItem("su_ui_scale_mb_pct")||localStorage.getItem("su_ui_scale_pct")||"100",bgmEnabled:((_a=localStorage.getItem("su_bgm_enabled"))!=null?_a:"1")==="1",bgmShuffle:((_b=localStorage.getItem("su_bgm_shuffle"))!=null?_b:"0")==="1",bgmVolume:parseInt(localStorage.getItem("su_bgm_volume")||"50",10)||50,bgmList:localStorage.getItem("su_bgm_list")||"",soopList:localStorage.getItem("su_soop_list")||"",femcoSettings:localStorage.getItem("b2_femco_settings_v1")||null,femcoUniv:localStorage.getItem("cfg_femco_univ")||null,ls:_syncLs});let _fbPayloadSize=0;try{_fbPayloadSize=JSON.stringify(dataObj).length;const statusEl=document.getElementById("cloudStatus"),splitInfo=typeof window.__suEstimateSplitStore=="function"?window.__suEstimateSplitStore(dataObj):null;let warnBytes,warnLabel;if(splitInfo&&splitInfo.maxBytes)warnBytes=splitInfo.maxBytes,warnLabel=`\uBD84\uB9AC \uC800\uC7A5 \uCD5C\uB300 \uD30C\uC77C ${(warnBytes/1024/1024).toFixed(1)}MB`;else{const compressedEstimate=Math.round(_fbPayloadSize*.5);warnBytes=compressedEstimate,warnLabel=`\uB370\uC774\uD130 ${(_fbPayloadSize/1024/1024).toFixed(1)}MB (\uC555\uCD95 \uD6C4 \uC57D ${(compressedEstimate/1024/1024).toFixed(1)}MB)`}warnBytes>3*1024*1024?(statusEl&&(statusEl.style.color="#dc2626",statusEl.textContent=`\u26A0\uFE0F ${warnLabel} \u2014 \uC800\uC7A5 \uC2E4\uD328 \uAC00\uB2A5`),console.warn("[fbCloudSave] \uD06C\uAE30 \uC704\uD5D8:",(warnBytes/1024).toFixed(0)+"KB")):warnBytes>2*1024*1024&&(statusEl&&(statusEl.style.color="#d97706",statusEl.textContent=`\u26A0\uFE0F ${warnLabel} \u2014 \uACE7 \uC800\uC7A5 \uC2E4\uD328\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4`),console.warn("[fbCloudSave] \uD06C\uAE30 \uACBD\uACE0:",(warnBytes/1024).toFixed(0)+"KB")),console.log("[fbCloudSave] \uD398\uC774\uB85C\uB4DC \uD06C\uAE30:",(_fbPayloadSize/1024).toFixed(0)+"KB")}catch(e){}function _removeUndefined(obj){if(Array.isArray(obj))return obj.map(_removeUndefined);if(obj!==null&&typeof obj=="object"){const result={};return Object.keys(obj).forEach(k=>{obj[k]!==void 0&&(result[k]=_removeUndefined(obj[k]))}),result}return obj}const _tryFbSet=async obj=>{const clean=_removeUndefined(obj),jsonStr=JSON.stringify(clean),compressed=LZString.compressToBase64(jsonStr),payload={_lz:compressed};return console.log("[fbCloudSave] \uC6D0\uBCF8:",(jsonStr.length/1024).toFixed(0)+"KB \u2192 \uC555\uCD95:",(compressed.length/1024).toFixed(0)+"KB ("+((1-compressed.length/jsonStr.length)*100).toFixed(0)+"% \uC808\uAC10)"),window.fbSet(payload)};try{await _tryFbSet(dataObj);try{window._lastAppliedSavedAt=Math.max(Number(window._lastAppliedSavedAt||0)||0,savedAt),localStorage.setItem("su_sync_last_upload_ok_at",String(Date.now())),localStorage.setItem("su_sync_last_remote_saved_at",String(savedAt)),typeof window.refreshCloudSyncStatus=="function"&&window.refreshCloudSyncStatus("\u2705 \uC5C5\uB85C\uB4DC \uC644\uB8CC","#16a34a")}catch(e){}}catch(e){const errCode=e.code||"",errMsg=e.message||"",errStr=String(e),errName=e.name||"",fullErr=[errCode,errMsg,errName,errStr].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).join(" | ");console.error("[fbCloudSave] \uC0C1\uC138:",{code:errCode,message:errMsg,name:errName,full:errStr,error:e});const statusEl=document.getElementById("cloudStatus");if(statusEl){const isSizeErr=fullErr.includes("exceeded")||fullErr.includes("too large")||fullErr.includes("payload")||fullErr.includes("413"),isAuthErr=fullErr.includes("Permission")||fullErr.includes("PERMISSION")||fullErr.includes("auth")||fullErr.includes("denied")||fullErr.includes("401")||fullErr.includes("403"),hint=isSizeErr?" \u2192 \uB370\uC774\uD130 \uD06C\uAE30 \uCD08\uACFC":isAuthErr?" \u2192 GitHub \uD1A0\uD070/\uAD8C\uD55C \uBB38\uC81C":"",display=fullErr||"\uC54C \uC218 \uC5C6\uB294 \uC624\uB958 (\uCF58\uC194 F12 \uD655\uC778)";statusEl.style.color="#dc2626",statusEl.innerHTML="\u274C GitHub \uC800\uC7A5 \uC2E4\uD328: "+display+hint+` <button onclick="this.parentElement.textContent=''" style="margin-left:6px;background:none;border:1px solid #dc2626;border-radius:4px;color:#dc2626;font-size:var(--fs-caption);cursor:pointer;padding:1px 6px">\uB2EB\uAE30</button>`}throw e}finally{if(window._isSaving=!1,window._fbPendingData){const pending=window._fbPendingData;window._fbPendingData=null,setTimeout(()=>{const pendingSa=Number(pending&&pending.savedAt||0)||0,localSavedAt=(()=>{try{return Math.max(Number(window._lastAdminSaveTime||0)||0,Number(localStorage.getItem("su_last_admin_save")||0)||0)}catch(e){return Number(window._lastAdminSaveTime||0)||0}})(),lastApplied=Number(window._lastAppliedSavedAt||0)||0;if(pendingSa&&localSavedAt&&pendingSa<localSavedAt){console.warn("[sync] pending stale remote ignored",{pendingSavedAt:pendingSa,localSavedAt});return}if(!(pendingSa&&lastApplied&&pendingSa<=lastApplied)&&typeof _applyCloudData=="function"){pendingSa&&(window._lastAppliedSavedAt=Math.max(lastApplied,pendingSa)),_applyCloudData(pending);try{typeof window._syncWindowDataRefs=="function"&&window._syncWindowDataRefs()}catch(e){}typeof localSave=="function"&&localSave();try{typeof window._primeMatchSyncSignature=="function"&&window._primeMatchSyncSignature(!0)}catch(e){}typeof fixPoints=="function"&&fixPoints(),window._compListCache={},window._shareAllMatchesCached=null,window._histTourneyCache={},typeof render=="function"&&render()}},200)}}}async function githubDataSave(dataObj){const token=localStorage.getItem("su_gh_token");if(!token)return;const apiUrl="https://api.github.com/repos/nada1004/star-system/contents/star-datacenter/data.json",getRes=await fetch(apiUrl,{headers:{Authorization:`token ${token}`,Accept:"application/vnd.github.v3+json"}});if(!getRes.ok)throw new Error("GitHub \uD30C\uC77C \uC870\uD68C \uC2E4\uD328: "+getRes.status);const fileInfo=await getRes.json(),payload={_lz:LZString.compressToBase64(JSON.stringify(dataObj))},jsonStr=JSON.stringify(payload),b64=btoa(unescape(encodeURIComponent(jsonStr))),putRes=await fetch(apiUrl,{method:"PUT",headers:{Authorization:`token ${token}`,Accept:"application/vnd.github.v3+json","Content-Type":"application/json"},body:JSON.stringify({message:`\uB370\uC774\uD130 \uC5C5\uB370\uC774\uD2B8 ${new Date().toLocaleString("ko-KR")}`,content:b64,sha:fileInfo.sha})});if(!putRes.ok)throw new Error("GitHub \uC800\uC7A5 \uC2E4\uD328: "+putRes.status)}try{window.fbCloudSave=fbCloudSave}catch(e){}async function _fetchGithubData(){if(typeof window.__suFetchGithubMergedData=="function")return await window.__suFetchGithubMergedData();const baseUrl=GITHUB_JSON_URL,urls=[baseUrl+"?nocache="+Date.now(),"https://cdn.jsdelivr.net/gh/nada1004/star-system@main/star-datacenter/data.json","https://api.github.com/repos/nada1004/star-system/contents/star-datacenter/data.json","https://corsproxy.io/?url="+encodeURIComponent(baseUrl),"https://api.allorigins.win/raw?url="+encodeURIComponent(baseUrl)],tryUrl=async url=>{const ctrl=new AbortController,timer=setTimeout(()=>ctrl.abort(),12e3);try{const res=await fetch(url,{cache:"no-store",mode:"cors",signal:ctrl.signal});if(clearTimeout(timer),!res.ok)throw new Error("HTTP "+res.status);const text=(await res.text()).replace(/^\uFEFF/,"").trim();if(text.startsWith("<"))throw new Error("HTML \uC751\uB2F5");const raw=JSON.parse(text);if(raw&&raw.content&&raw.encoding==="base64"){const bin=atob(raw.content.replace(/\s/g,"")),bytes=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);return JSON.parse(new TextDecoder("utf-8").decode(bytes))}return raw}catch(e){throw clearTimeout(timer),e}};try{return await Promise.any(urls.map(tryUrl))}catch(aggErr){const errs=(aggErr.errors||[aggErr]).map((e,i)=>`[${i+1}] ${(e==null?void 0:e.message)||e}`).join(`
`);throw new Error(`\uB370\uC774\uD130\uB97C \uBD88\uB7EC\uC62C \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.

\uC6D0\uC778:
`+errs+`

\uD574\uACB0\uBC29\uBC95:
\xB7 \uC778\uD130\uB137 \uC5F0\uACB0 \uD655\uC778
\xB7 GitHub \uC800\uC7A5\uC18C(nada1004/star-system)\uAC00 \uACF5\uAC1C(Public) \uC0C1\uD0DC\uC778\uC9C0 \uD655\uC778
\xB7 data.json \uD30C\uC77C\uC774 main \uBE0C\uB79C\uCE58\uC5D0 \uC788\uB294\uC9C0 \uD655\uC778`)}}function _applyFetchedCloudData(d){_applyCloudData(d),console.log("[\uBD88\uB7EC\uC624\uAE30] \uB370\uC774\uD130 \uAD6C\uC870:",{players:players.length,miniM:miniM.length,univM:univM.length,comps:comps.length,ckM:ckM.length,proM:proM.length,tourneys:tourneys.length}),localSave(),fixPoints(),window._compListCache={},window._shareAllMatchesCached=null,window._histTourneyCache={},curTab="total",statsSub="overview",histSub="mini",compSub="league",(function(){const allD=[...d.miniM||[],...d.univM||[],...d.comps||[],...d.ckM||[],...d.proM||[]];mergeValidYearsIntoOptions(yearOptions,allD)})(),filterYear="\uC804\uCCB4",filterMonth="\uC804\uCCB4",init();const compCount=(d.comps||[]).length,tourCount=(d.tourneys||[]).reduce((s,t)=>s+(t.groups||[]).reduce((ss,g)=>ss+(g.matches||[]).filter(m=>m.sa!=null).length,0),0),miniCount=(d.miniM||[]).length;return{compCount,tourCount,miniCount}}window.cloudLoad=async function(){try{gsSetStatus("\u{1F4E5} \uBD88\uB7EC\uC624\uB294 \uC911...","var(--blue)");const loadBtn=document.getElementById("btnCloudLoad");loadBtn&&(loadBtn.disabled=!0,loadBtn.textContent="\u23F3 \uBD88\uB7EC\uC624\uB294 \uC911...");const d=await _fetchGithubData();if(!confirm(`GitHub \uB370\uC774\uD130\uB97C \uBD88\uB7EC\uC635\uB2C8\uB2E4.

\u26A0\uFE0F \uD604\uC7AC \uB85C\uCEEC \uB370\uC774\uD130\uAC00 \uB36E\uC5B4\uC50C\uC6CC\uC9D1\uB2C8\uB2E4. \uACC4\uC18D\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?`)){loadBtn&&(loadBtn.disabled=!1,loadBtn.innerHTML="<span>\u2601\uFE0F</span> \uB370\uC774\uD130 \uBD88\uB7EC\uC624\uAE30");return}const{compCount,tourCount,miniCount}=_applyFetchedCloudData(d),_lb=document.getElementById("btnCloudLoad");_lb&&(_lb.disabled=!1,_lb.innerHTML="<span>\u2601\uFE0F</span> \uB370\uC774\uD130 \uBD88\uB7EC\uC624\uAE30"),gsSetStatus(`\u2705 \uBD88\uB7EC\uC624\uAE30 \uC644\uB8CC (${new Date().toLocaleTimeString()}) \u2014 \uBBF8\uB2C8 ${miniCount}\uAC74\xB7\uB300\uD68C ${compCount+tourCount}\uAC74`,"var(--green)")}catch(e){const _lb2=document.getElementById("btnCloudLoad");_lb2&&(_lb2.disabled=!1,_lb2.innerHTML="<span>\u2601\uFE0F</span> \uB370\uC774\uD130 \uBD88\uB7EC\uC624\uAE30");const errMsg=e.message||String(e);gsSetStatus("\u274C \uBD88\uB7EC\uC624\uAE30 \uC2E4\uD328 (\uD558\uB2E8 \uBA54\uC2DC\uC9C0 \uD655\uC778)","var(--red)"),console.error("[cloudLoad \uC624\uB958]",e);const shortMsg=errMsg.split(`
`).slice(0,3).join(`
`);setTimeout(()=>alert(`\u26A0\uFE0F \uB370\uC774\uD130 \uBD88\uB7EC\uC624\uAE30 \uC2E4\uD328

`+shortMsg),100)}},window._autoSyncApply=async function(){const d=await _fetchGithubData();return _applyFetchedCloudData(d)};var _brdPhotoCache=(function(){try{const raw=localStorage.getItem("su_brd_photo_cache");return raw?JSON.parse(raw):{}}catch(e){return{}}})();(async function(){try{if(typeof MiscStore=="undefined")return;const v=await MiscStore.get("su_brd_photo_cache");v&&typeof v=="object"&&(_brdPhotoCache=v)}catch(e){}})();function _brdPhotoCacheSet(name,url){url?_brdPhotoCache[name]=url:delete _brdPhotoCache[name];try{typeof MiscStore!="undefined"?MiscStore.set("su_brd_photo_cache",_brdPhotoCache):localStorage.setItem("su_brd_photo_cache",JSON.stringify(_brdPhotoCache))}catch(e){}}function _getBrdPhoto(p){return p.photo||window.playerPhotos&&window.playerPhotos[p.name]||_brdPhotoCache[p.name]||""}let boardSelUniv="\uC804\uCCB4",boardCompactMode=!1,boardGridCols=1,boardCardView=!1,boardCardShape="circle",boardCollapsed=new Set;var boardChipPhotoShape=localStorage.getItem("su_bcp_shape")||"circle",boardChipPhotoSize=parseInt(localStorage.getItem("su_bcp_size")||"26",10),boardChipLayoutScale=parseInt(localStorage.getItem("su_bcp_layout")||"100",10);function saveBoardChipPhotoSettings(){localStorage.setItem("su_bcp_shape",boardChipPhotoShape),localStorage.setItem("su_bcp_size",String(boardChipPhotoSize)),localStorage.setItem("su_bcp_layout",String(boardChipLayoutScale||100));try{typeof window.cfgTouchPrefsSync=="function"&&window.cfgTouchPrefsSync()}catch(e){}try{typeof applyProfileShapeVars=="function"&&applyProfileShapeVars()}catch(e){}}var boardPlayerOrder=J("su_bpo")||{};function _findBrdCardByUniv(univName,root){try{const base=root||document.getElementById("board-wrap")||document,cards=base&&base.querySelectorAll?base.querySelectorAll(".brd-card"):[];for(const c of cards)if(c&&c.dataset&&c.dataset.univ===univName)return c;return null}catch(e){return null}}function _getBoardUnivs(){const univs=getAllUnivs();if(!boardOrder.length)return univs;const ordered=[],seen=new Set;return boardOrder.forEach(name=>{const u=univs.find(x=>x.name===name);u&&!seen.has(u.name)&&(ordered.push(u),seen.add(u.name))}),univs.forEach(u=>{seen.has(u.name)||(ordered.push(u),seen.add(u.name))}),ordered}function toggleBoardUniv(name){if(typeof boardSelUniv=="undefined")return;boardSelUniv=boardSelUniv===name?"\uC804\uCCB4":name;const sel=document.getElementById("board-univ-sel");sel&&(sel.value=boardSelUniv),_updateBoardSaveLabel(),render()}function _brdCollapseToggle(univName){boardCollapsed.has(univName)?boardCollapsed.delete(univName):boardCollapsed.add(univName);const card=_findBrdCardByUniv(univName);if(!card)return;const body=card.querySelector(".brd-card-body");body&&(body.style.display=boardCollapsed.has(univName)?"none":"");const btn=card.querySelector(".brd-collapse-btn");btn&&(btn.textContent=boardCollapsed.has(univName)?"\u25B6":"\u25BC")}function _brdCollapseAll(){_getBoardUnivs().forEach(u=>boardCollapsed.add(u.name)),document.querySelectorAll(".brd-card").forEach(card=>{const body=card.querySelector(".brd-card-body");body&&(body.style.display="none");const btn=card.querySelector(".brd-collapse-btn");btn&&(btn.textContent="\u25B6")})}function _brdExpandAll(){boardCollapsed.clear(),document.querySelectorAll(".brd-card").forEach(card=>{const body=card.querySelector(".brd-card-body");body&&(body.style.display="");const btn=card.querySelector(".brd-collapse-btn");btn&&(btn.textContent="\u25BC")})}function _updateBoardSaveLabel(){const lbl=document.getElementById("btn-img-save-label"),brdLbl=document.getElementById("brd-save-btn-label"),text=boardSelUniv&&boardSelUniv!=="\uC804\uCCB4"?boardSelUniv+" \uC774\uBBF8\uC9C0\uC800\uC7A5":"\uC774\uBBF8\uC9C0\uC800\uC7A5";lbl&&(lbl.textContent=text),brdLbl&&(brdLbl.textContent=text)}function _captureErrText(e){try{if(!e)return"\uC54C \uC218 \uC5C6\uB294 \uC624\uB958";if(typeof e=="string")return e;if(e instanceof Error)return e.message||String(e);if(typeof Event!="undefined"&&e instanceof Event)return"\uC774\uBCA4\uD2B8 \uC624\uB958("+(e&&e.type?e.type:"event")+")";if(e&&typeof e=="object"){if(typeof e.message=="string"&&e.message)return e.message;if(typeof e.type=="string"&&e.type)return"\uC774\uBCA4\uD2B8 \uC624\uB958("+e.type+")"}return String(e)}catch(_e){return"\uC54C \uC218 \uC5C6\uB294 \uC624\uB958"}}window.saveCurrentView=async function(){const cap=document.getElementById("cap");if(!cap){alert("\uCEA1\uCC98\uD560 \uC601\uC5ED\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.");return}const btn=document.getElementById("btn-img-save"),oldBtnHtml=btn?btn.innerHTML:"";btn&&(btn.disabled=!0,btn.innerHTML="\u23F3 \uC800\uC7A5\uC911");const _setToast=text=>{try{const t=document.getElementById("_save-toast");t&&(t.innerHTML=text)}catch(e){}},tmpDiv=document.createElement("div"),capRect=cap.getBoundingClientRect(),capW=Math.max(320,Math.round(capRect.width||cap.scrollWidth||900)),capH=Math.max(200,Math.round(cap.scrollHeight||cap.offsetHeight||capRect.height||600));tmpDiv.style.cssText=`position:fixed;left:-9999px;top:0;width:${capW}px;min-height:${capH}px;background:#ffffff;padding:24px;box-sizing:border-box;`,tmpDiv.innerHTML=cap.innerHTML,tmpDiv.querySelectorAll(".no-export").forEach(el=>el.remove()),document.body.appendChild(tmpDiv);try{typeof _showSaveLoading=="function"&&_showSaveLoading(),_setToast('<span style="display:inline-block;animation:_spin .8s linear infinite">\u23F3</span> \uC900\uBE44 \uC911...');try{const supportsDownload="download"in document.createElement("a"),ua=String(navigator.userAgent||""),isIOS=/iPad|iPhone|iPod/i.test(ua),isInApp=/KAKAOTALK|Instagram|FBAN|FBAV|NAVER|Whale|Line/i.test(ua);if(!supportsDownload||isIOS||isInApp){const w2=window.open("","_blank");if(w2){try{w2.document.write('<html><head><meta charset="utf-8"><title>\uC774\uBBF8\uC9C0 \uC0DD\uC131 \uC911...</title></head><body style="margin:0;font-family:sans-serif;background:#111;color:#fff;padding:14px">\uC774\uBBF8\uC9C0 \uC0DD\uC131 \uC911\uC785\uB2C8\uB2E4... \uC7A0\uC2DC\uB9CC \uAE30\uB2E4\uB824\uC8FC\uC138\uC694.</body></html>'),w2.document.close()}catch(e){}window.__captureDlWin=w2}}}catch(e){}try{typeof _applyBoardBgAutoSizing=="function"&&_applyBoardBgAutoSizing(tmpDiv),typeof _b2ApplyBgAutoSizing=="function"&&_b2ApplyBgAutoSizing(tmpDiv)}catch(e){}const w=Math.max(320,tmpDiv.scrollWidth||capW),h=Math.max(200,tmpDiv.scrollHeight||capH),fname=`\uC2A4\uD0C0\uB300\uD559_${{total:"\uC2A4\uD2B8\uB9AC\uBA38",board2:"\uD604\uD669\uD310",tier:"\uD2F0\uC5B4\uC21C\uC704",mini:"\uBBF8\uB2C8\uB300\uC804",univm:"\uB300\uD559\uB300\uC804",univck:"\uB300\uD559CK",comp:"\uB300\uD68C",pro:"\uD504\uB85C\uB9AC\uADF8",hist:"\uB300\uC804\uAE30\uB85D",stats:"\uD1B5\uACC4",cal:"\uCE98\uB9B0\uB354"}[window.curTab]||window.curTab||"\uD654\uBA74"}_${new Date().toISOString().slice(0,10)}.png`;await _captureAndSave(tmpDiv,w,h,fname)}catch(e){alert("\uC774\uBBF8\uC9C0 \uC800\uC7A5 \uC624\uB958: "+_captureErrText(e))}finally{tmpDiv.parentNode&&document.body.removeChild(tmpDiv),typeof _hideSaveLoading=="function"&&_hideSaveLoading(),btn&&(btn.disabled=!1,btn.innerHTML=oldBtnHtml)}};function _getBoardPlayers(univName,includeRetired=!1){const univPlayers=players.filter(p=>p.univ===univName&&(includeRetired||!p.retired)&&!p.hideFromBoard&&!p.hidden),order=boardPlayerOrder[univName]||[];if(!order.length)return univName==="\uBB34\uC18C\uC18D"?[...univPlayers].sort((a,b)=>TIERS.indexOf(a.tier)-TIERS.indexOf(b.tier)||b.points-a.points):[...univPlayers].sort((a,b)=>{const ra=getRoleOrder(a.role),rb=getRoleOrder(b.role);return ra!==rb?ra-rb:TIERS.indexOf(a.tier)-TIERS.indexOf(b.tier)||b.points-a.points});const sorted=[];return order.forEach(name=>{const p=univPlayers.find(x=>x.name===name);p&&sorted.push(p)}),univPlayers.forEach(p=>{order.includes(p.name)||sorted.push(p)}),sorted}function saveBoardPlayerOrder(){localStorage.setItem("su_bpo",JSON.stringify(boardPlayerOrder))}const _brdBgImageMeta={};let _brdBgAutoResizeBound=!1;function _loadBoardBgImageMeta(url,cb){try{const src=toHttpsUrl(url||"");if(!src){cb&&cb(null);return}if(_brdBgImageMeta[src]&&_brdBgImageMeta[src].w&&_brdBgImageMeta[src].h){cb&&cb(_brdBgImageMeta[src]);return}const img=new Image;img.onload=function(){_brdBgImageMeta[src]={w:img.naturalWidth||0,h:img.naturalHeight||0},cb&&cb(_brdBgImageMeta[src])},img.onerror=function(){cb&&cb(null)},img.src=src}catch(e){cb&&cb(null)}}function _resolveBoardAutoFit(kind,mode,rect,meta){const rawMode=String(mode||"auto");if(rawMode==="cover"||rawMode==="contain"||rawMode==="fill")return rawMode;const vw=window.innerWidth||1280;if(!rect||!rect.width||!rect.height)return kind==="card"?vw<=900?"contain":"cover":kind==="profile"?vw<=640?"contain":"cover":vw<=900?"contain":"cover";if(!meta||!meta.w||!meta.h)return kind==="profile"?vw<=640||rect.width<=70?"contain":"cover":kind==="card"?vw<=900||rect.width<120?"contain":"cover":vw<=640||rect.width<300?"contain":"cover";const cardRatio=rect.width/rect.height,imgRatio=meta.w/meta.h,diff=Math.abs(Math.log(imgRatio/cardRatio));return kind==="profile"?vw<=640?diff>.33?"contain":"cover":vw<=1024?diff>.3?"contain":"cover":imgRatio>1.55||imgRatio<.7||diff>.28?"contain":"cover":kind==="card"?vw<=640?diff>.24?"contain":"cover":vw<=1024?diff>.28?"contain":"cover":imgRatio>1.14||imgRatio<.5||diff>.3?"contain":"cover":vw<=640?diff>.32?"contain":"cover":vw<=1024?diff>.3?"contain":"cover":rect.width<280||rect.height<220?diff>.24?"contain":"cover":imgRatio>1.75||imgRatio<.64||diff>.4?"contain":"cover"}function _resolveBoardBgSizeMode(mode,rect,meta){return _resolveBoardAutoFit("bg",mode,rect,meta)}function _resolveBoardAutoPosition(kind,fit,rect,meta){if(fit!=="cover")return"center center";const imgRatio=meta&&meta.w&&meta.h?meta.w/meta.h:1,boxRatio=rect&&rect.width&&rect.height?rect.width/rect.height:1;if(!imgRatio||!boxRatio)return"center center";const portraitPressure=boxRatio/imgRatio;return kind==="bg"?portraitPressure>2.1&&rect&&rect.height>=260?"bottom center":portraitPressure>1.35?"top center":"center center":kind==="card"?portraitPressure>1.55||portraitPressure>1.2?"top center":"center center":kind==="profile"&&portraitPressure>1.45?"top center":"center center"}function _applyBoardBgAutoSizing(root){try{const scope=root||document,_collect=selector=>{const arr=[];return scope&&scope.matches&&scope.matches(selector)&&arr.push(scope),scope&&scope.querySelectorAll&&arr.push(...scope.querySelectorAll(selector)),arr};_collect(".brd-bg-layer[data-bg-size-mode]").forEach(el=>{const mode=el.getAttribute("data-bg-size-mode")||"auto",cardBody=el.closest(".brd-body")||el.parentElement,rect=cardBody?cardBody.getBoundingClientRect():null;if(mode!=="auto"){el.style.backgroundSize=mode;return}const src=el.getAttribute("data-bg-src")||"";_loadBoardBgImageMeta(src,meta=>{const resolved=_resolveBoardBgSizeMode(mode,rect,meta);el.style.backgroundSize=resolved,el.setAttribute("data-bg-size-resolved",resolved)})}),_collect(".brd-fit-auto[data-fit-kind]").forEach(el=>{const mode=el.getAttribute("data-fit-mode")||"auto",kind=el.getAttribute("data-fit-kind")||"profile",rect=el.getBoundingClientRect?el.getBoundingClientRect():null,apply=meta=>{const resolved=_resolveBoardAutoFit(kind,mode,rect,meta);el.style.objectFit=resolved;const pos=_resolveBoardAutoPosition(kind,resolved,rect,meta);el.style.objectPosition=pos,el.setAttribute("data-fit-resolved",resolved)},src=el.currentSrc||el.getAttribute("src")||"";_loadBoardBgImageMeta(src,apply)})}catch(e){}}function _bindBoardBgAutoResize(){if(_brdBgAutoResizeBound)return;_brdBgAutoResizeBound=!0;const rerun=()=>{try{const wrap=document.getElementById("board-wrap");if(!wrap)return;requestAnimationFrame(()=>_applyBoardBgAutoSizing(wrap))}catch(e){}};window.addEventListener("resize",rerun),window.addEventListener("orientationchange",()=>setTimeout(rerun,80)),document.addEventListener("visibilitychange",()=>{document.visibilityState==="visible"&&setTimeout(rerun,60)})}function rBoard(C,T){T.textContent="\u{1F4CA} \uD604\uD669\uD310";const univs=_getBoardUnivs(),_canManage=_boardCanManage(),visUnivs=(_canManage?univs:univs.filter(u=>!u.hidden)).filter(u=>!u.dissolved);if(!univs.length){C.innerHTML='<div style="padding:40px;text-align:center;color:var(--gray-l)">\uB4F1\uB85D\uB41C \uC120\uC218\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.</div>';return}const _hexToRgba=(h2,a)=>{try{const c=String(h2||"#64748b").replace("#",""),r=parseInt(c.slice(0,2),16),g=parseInt(c.slice(2,4),16),b=parseInt(c.slice(4,6),16);return`rgba(${r},${g},${b},${a})`}catch(e){return`rgba(100,116,139,${a||.2})`}},_contrastText=hex=>{try{const c=String(hex||"").replace("#","").trim(),r=parseInt(c.slice(0,2),16),g=parseInt(c.slice(2,4),16),b=parseInt(c.slice(4,6),16),f=v=>(v/=255,v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)),L=.2126*f(r)+.7152*f(g)+.0722*f(b);return(1+.05)/(L+.05)>=(L+.05)/(.02+.05)?"#ffffff":"#0f172a"}catch(e){return"#ffffff"}},_bcpScale=Math.max(.7,Math.min(1.8,(boardChipLayoutScale||100)/100)),_bcpGap=Math.round(7*_bcpScale),_bcpPadY=Math.round(5*_bcpScale),_bcpPadX=Math.round(10*_bcpScale),_bcpNameFs=Math.round(12*_bcpScale),_bcpRoleFs=Math.round(9*_bcpScale),_brdAllVis=visUnivs.flatMap(u=>_getBoardPlayers(u.name)),_brdTierCts={};_brdAllVis.forEach(p=>{const t=p.tier||"?";_brdTierCts[t]=(_brdTierCts[t]||0)+1});const _brdAllCollapsed=visUnivs.length>0&&visUnivs.every(u=>boardCollapsed.has(u.name)),_heroCol=boardSelUniv!=="\uC804\uCCB4"&&gc(boardSelUniv)||"#2563eb",_heroTc=_contrastText(_heroCol),_currentUnivLabel=boardSelUniv!=="\uC804\uCCB4"?boardSelUniv:"\uC804\uCCB4 \uB300\uD559",_tierBadges=TIERS.filter(t=>_brdTierCts[t]).map(t=>`<span style="font-size:10px;font-weight:800;padding:3px 8px;border-radius:999px;background:${getTierBtnColor(t)||"#64748b"};color:${getTierBtnTextColor(t)||"#fff"}">${t} ${_brdTierCts[t]}</span>`).join(""),_brdStatsHtml=`<div class="brd-mini-stats">
    <div class="brd-mini-stat" style="--stat-accent:#6366f1"><div class="brd-mini-stat-label">\uD45C\uC2DC \uC2A4\uD2B8\uB9AC\uBA38</div><div class="brd-mini-stat-value">${_brdAllVis.length}</div><div class="brd-mini-stat-sub">\uAD6C\uD604\uD669\uD310 \uAE30\uC900 \uC778\uC6D0</div></div>
    <div class="brd-mini-stat" style="--stat-accent:#0ea5e9"><div class="brd-mini-stat-label">\uD65C\uC131 \uB300\uD559</div><div class="brd-mini-stat-value">${visUnivs.length}</div><div class="brd-mini-stat-sub">\uC228\uAE40/\uD574\uCCB4 \uC81C\uC678</div></div>
    <div class="brd-mini-stat" style="--stat-accent:${_heroCol}"><div class="brd-mini-stat-label">\uD604\uC7AC \uBCF4\uAE30</div><div class="brd-mini-stat-value" style="font-size:var(--fs-lg);color:${_heroCol}">${_currentUnivLabel}</div><div class="brd-mini-stat-sub">${boardSelUniv!=="\uC804\uCCB4"?"\uC120\uD0DD \uB300\uD559 \uC911\uC2EC":"\uC804\uCCB4 \uD750\uB984 \uBCF4\uAE30"}</div></div>
    <div class="brd-mini-stat" style="--stat-accent:#f59e0b"><div class="brd-mini-stat-label">\uD2F0\uC5B4 \uBD84\uD3EC</div><div class="brd-mini-stat-tier">${_tierBadges||'<span style="font-size:var(--fs-caption);color:var(--text3);font-weight:700">\uC9D1\uACC4 \uC5C6\uC74C</span>'}</div></div>
  </div>`;let h=`
  <style>
    .brd-shell{display:flex;flex-direction:column;gap:14px}
    .brd-hero{position:relative;overflow:hidden;display:flex;align-items:flex-start;justify-content:space-between;gap:16px;padding:20px 22px;border-radius:26px;background:linear-gradient(180deg,rgba(255,255,255,.99),rgba(248,250,252,.96));border:1px solid rgba(148,163,184,.18);box-shadow:0 18px 34px rgba(15,23,42,.06)}
    .brd-hero::after{content:'';position:absolute;right:-70px;top:-70px;width:220px;height:220px;border-radius:999px;background:${_hexToRgba(_heroCol,.16)};filter:blur(2px);pointer-events:none}
    .brd-hero-copy,.brd-hero-side{position:relative;z-index:1}
    .brd-hero-copy{display:flex;flex-direction:column;gap:7px;min-width:0}
    .brd-hero-kicker{font-size:var(--fs-caption);font-weight:900;letter-spacing:.08em;text-transform:uppercase;color:${_heroCol}}
    .brd-hero-title{font-size:25px;font-weight:950;letter-spacing:-.03em;color:var(--text1);line-height:1.14}
    .brd-hero-desc{font-size:var(--fs-base);line-height:1.6;color:var(--text3);max-width:720px}
    .brd-hero-badges{display:flex;flex-wrap:wrap;gap:8px}
    .brd-hero-badge{display:inline-flex;align-items:center;gap:6px;padding:8px 12px;border-radius:999px;background:${_hexToRgba(_heroCol,.1)};border:1px solid ${_hexToRgba(_heroCol,.18)};font-size:var(--fs-sm);font-weight:800;color:${_heroCol};box-shadow:0 10px 18px rgba(15,23,42,.05)}
    .brd-hero-side{display:flex;flex-wrap:wrap;gap:10px;justify-content:flex-end}
    .brd-toolbar-card{padding:14px 16px;border-radius:24px;background:linear-gradient(180deg,rgba(255,255,255,.99),rgba(248,250,252,.96));border:1px solid rgba(148,163,184,.18);box-shadow:0 18px 34px rgba(15,23,42,.06)}
    .brd-toolbar-top{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;flex-wrap:wrap}
    .brd-toolbar-controls{display:flex;flex-direction:column;gap:10px;min-width:min(100%,720px)}
    .brd-toolbar-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
    .brd-toolbar-note{font-size:var(--fs-caption);color:var(--text3);font-weight:700}
    .brd-mini-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px;min-width:min(100%,520px)}
    .brd-mini-stat{padding:14px 16px;border-radius:var(--r2);border:1px solid rgba(148,163,184,.16);background:linear-gradient(180deg,rgba(255,255,255,.99),rgba(248,250,252,.94));box-shadow:0 6px 16px rgba(15,23,42,.05);position:relative;overflow:hidden}
    .brd-mini-stat::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--stat-accent,#2563eb);border-radius:var(--r2) 16px 0 0;opacity:.7}
    .brd-mini-stat-label{font-size:10px;font-weight:900;color:var(--text3);letter-spacing:.06em;text-transform:uppercase}
    .brd-mini-stat-value{margin-top:5px;font-size:24px;font-weight:950;letter-spacing:-.03em;color:var(--text1)}
    .brd-mini-stat-sub{margin-top:3px;font-size:var(--fs-caption);font-weight:700;color:var(--text3)}
    .brd-mini-stat-tier{margin-top:8px;display:flex;flex-wrap:wrap;gap:5px}
    .brd-card{background:var(--brd-col,#dbeafe);border-radius:18px;overflow:hidden;box-shadow:0 4px 18px var(--brd-shd,rgba(37,99,235,.15)),0 1px 6px rgba(0,0,0,.07);position:relative;transition:transform .18s,box-shadow .18s;align-self:start;border:1px solid rgba(0,0,0,.06);}
    .brd-card:hover{transform:translateY(-2px);box-shadow:0 10px 32px var(--brd-shd,rgba(37,99,235,.22)),0 3px 10px rgba(0,0,0,.1);}
    .brd-card.drag-over{outline:3px solid rgba(0,0,0,.2);opacity:.85;}
    .brd-card.dragging{opacity:.45;transform:scale(.97);}
    .brd-hdr{padding:16px 18px 13px;position:relative;z-index:1;cursor:grab;}
    .brd-hdr:active{cursor:grabbing;}
    .brd-hdr::before{content:'';position:absolute;inset:0;background:linear-gradient(145deg,rgba(255,255,255,.18) 0%,rgba(255,255,255,0) 55%);pointer-events:none;z-index:0;}
    .brd-circle{position:absolute;border-radius:50%;background:rgba(255,255,255,.15);pointer-events:none;}
    .brd-row{display:flex;align-items:center;gap:${_bcpGap}px;padding:${_bcpPadY}px ${_bcpPadX}px;border-radius:9px;background:rgba(255,255,255,.82);border:1px solid rgba(255,255,255,.7);transition:background .12s,box-shadow .12s;}
    .brd-row:hover{box-shadow:0 2px 8px rgba(0,0,0,.1);}
    .brd-row-btn{cursor:pointer;flex:1;display:flex;align-items:center;gap:7px;background:none;border:none;padding:0;font-family:'Noto Sans KR',sans-serif;min-width:0;}
    .brd-photo{width:${boardChipPhotoSize}px;height:${boardChipPhotoSize}px;border-radius:var(--su_profile_radius,50%);clip-path:var(--su_profile_clip,none);object-fit:cover;flex-shrink:0;background:rgba(0,0,0,.08);border:1.5px solid rgba(255,255,255,.7);}
    .brd-photo-placeholder{width:${boardChipPhotoSize}px;height:${boardChipPhotoSize}px;border-radius:var(--su_profile_radius,50%);clip-path:var(--su_profile_clip,none);flex-shrink:0;background:rgba(255,255,255,.4);border:1.5px solid rgba(255,255,255,.5);display:flex;align-items:center;justify-content:center;font-size:${Math.round(12*_bcpScale)}px;color:rgba(0,0,0,.35);}
    .brd-race{font-size:9px;font-weight:800;padding:2px 6px;border-radius:5px;flex-shrink:0;letter-spacing:.3px;}
    .brd-name{font-weight:700;font-size:${_bcpNameFs}px;color:#1e293b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1;min-width:0;text-align:left;}
    .brd-role-main{font-size:${_bcpRoleFs}px;padding:1px 5px;border-radius:4px;font-weight:700;white-space:nowrap;flex-shrink:0;border:1px solid;}
    .brd-role-sub{font-size:${_bcpRoleFs}px;padding:1px 5px;border-radius:4px;font-weight:600;white-space:nowrap;flex-shrink:0;background:rgba(100,116,139,.1);color:#475569;border:1px solid rgba(100,116,139,.2);}
    .brd-move-btn{display:flex;flex-direction:column;gap:1px;flex-shrink:0;opacity:.55;}
    .brd-move-btn button{background:none;border:none;cursor:pointer;font-size:9px;padding:0 2px;line-height:1;color:#1e293b;transition:opacity .12s;}
    .brd-move-btn button:hover{opacity:.5;}
    .brd-move-btn button:disabled{opacity:.18;cursor:default;}
    .brd-sep{height:1px;background:rgba(0,0,0,.1);margin:0 18px;}
    .brd-body{padding:10px 10px 14px;display:flex;flex-direction:column;gap:4px;overflow:hidden;}
    .brd-row-drag{cursor:grab;}.brd-row-drag:active{cursor:grabbing;}
    .brd-tier-lbl{font-size:9px;font-weight:700;color:rgba(0,0,0,.45);letter-spacing:.8px;text-transform:uppercase;padding:0 2px;margin:6px 0 2px;}
    .brd-tier-lbl:first-child{margin-top:0;}
    .brd-univ-name-btn{font-weight:900;font-size:var(--fs-lg);color:#fff;letter-spacing:.2px;line-height:1.15;text-shadow:0 1px 4px rgba(0,0,0,.2);cursor:pointer;border:none;background:none;padding:0;font-family:'Noto Sans KR',sans-serif;text-align:left;transition:opacity .15s;}
    .brd-univ-name-btn:hover{text-decoration:underline;text-underline-offset:3px;opacity:.8;}
    .brd-drag-hint{font-size:10px;color:rgba(255,255,255,.5);margin-left:auto;padding:2px 6px;border-radius:4px;background:rgba(255,255,255,.1);cursor:grab;flex-shrink:0;user-select:none;}
    .brd-side-panel{float:right;width:230px;margin:0 0 6px 10px;}
    .brd-bottom-img{max-width:200px;max-height:160px;object-fit:contain;}
    @media(max-width:640px){.brd-side-panel{display:none!important;}.brd-bottom-section-img{display:none!important;}}
    /* \uC774\uB3D9 \uD31D\uC5C5 */
    .brd-move-popup{position:fixed;z-index:5000;background:#fff;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,.22);padding:10px;min-width:220px;max-width:260px;max-height:90vh;overflow-y:auto;border:1px solid var(--border);}
    .brd-move-popup-title{font-size:var(--fs-caption);font-weight:700;color:var(--text3);padding:4px 6px 8px;border-bottom:1px solid var(--border);margin-bottom:6px;}
    .brd-move-popup-btn{display:flex;align-items:center;gap:8px;width:100%;padding:7px 10px;border:none;background:none;border-radius:7px;cursor:pointer;font-family:'Noto Sans KR',sans-serif;font-size:var(--fs-sm);font-weight:600;color:var(--text);transition:background .1s;text-align:left;}
    .brd-move-popup-btn:hover{background:var(--blue-l);color:var(--blue);}
    .brd-move-popup-btn:disabled{opacity:.35;cursor:default;background:none;}
    .brd-move-popup-sep{height:1px;background:var(--border);margin:4px 0;}
    .brd-toolbar{position:sticky;top:0;z-index:100;background:transparent!important;padding-bottom:6px;}
    body.dark .brd-hero,body.dark .brd-toolbar-card{background:linear-gradient(180deg,rgba(15,23,42,.94),rgba(15,23,42,.9));border-color:#334155;box-shadow:0 20px 38px rgba(0,0,0,.28)}
    body.dark .brd-hero-title{color:#f8fafc}
    body.dark .brd-hero-desc,body.dark .brd-toolbar-note{color:#94a3b8}
    body.dark .brd-hero-badge{background:${_hexToRgba(_heroCol,.2)};border-color:${_hexToRgba(_heroCol,.28)};color:${_heroTc}}
    body.dark .brd-mini-stat{background:linear-gradient(180deg,rgba(15,23,42,.92),rgba(30,41,59,.88));border-color:#334155}
    body.dark .brd-mini-stat-value{color:#e2e8f0}
    body.dark .brd-mini-stat-label,body.dark .brd-mini-stat-sub{color:#94a3b8}
    @media(max-width:900px){.brd-hero{flex-direction:column;padding:18px;border-radius:22px}.brd-hero-side{justify-content:flex-start}.brd-toolbar-top{flex-direction:column}.brd-toolbar-controls,.brd-mini-stats{min-width:100%}}
    @media(max-width:768px){#board-wrap{grid-template-columns:1fr!important;}}
    @media(max-width:640px){
      /* \uBAA8\uBC14\uC77C: \uC0C1\uB2E8 \uBC30\uC9C0(brd-hero-badges)\uC5D0 \uC774\uBBF8 \uAC19\uC740 \uC815\uBCF4\uAC00 \uC694\uC57D\uB3FC \uC788\uC73C\uBBC0\uB85C \uC911\uBCF5\uB418\uB294 \uBBF8\uB2C8 \uD1B5\uACC4 \uCE74\uB4DC\uB294 \uC228\uAE40 */
      .brd-mini-stats{display:none!important}
    }
  </style>
  <div class="brd-shell">
  <section class="brd-hero no-export">
    <div class="brd-hero-copy">
      <div class="brd-hero-kicker">Classic Board</div>
      <div class="brd-hero-title">\u{1F4CA} \uAD6C\uD604\uD669\uD310</div>
      <div class="brd-hero-desc">${boardSelUniv!=="\uC804\uCCB4"?`${boardSelUniv} \uC911\uC2EC\uC73C\uB85C \uAE30\uC874 \uD604\uD669\uD310 \uB808\uC774\uC544\uC6C3\uC744 \uB354 \uAE54\uB054\uD55C \uCE74\uB4DC\uD615 UI\uB85C \uC815\uB9AC\uD588\uC2B5\uB2C8\uB2E4.`:"\uAE30\uC874 \uD604\uD669\uD310 \uD750\uB984\uC740 \uC720\uC9C0\uD558\uBA74\uC11C \uC0C1\uB2E8 \uD0D0\uC0C9\uACFC \uD1B5\uACC4 \uC601\uC5ED\uC744 \uB354 \uBCF4\uAE30 \uC88B\uACE0 \uC9C1\uAD00\uC801\uC73C\uB85C \uB2E4\uB4EC\uC5C8\uC2B5\uB2C8\uB2E4."}</div>
      <div class="brd-hero-badges">
        <span class="brd-hero-badge">\uD604\uC7AC \uBCF4\uAE30 \xB7 ${_currentUnivLabel}</span>
        <span class="brd-hero-badge">\uD45C\uC2DC \uC2A4\uD2B8\uB9AC\uBA38 ${_brdAllVis.length}\uBA85</span>
        <span class="brd-hero-badge">\uB300\uD559 ${visUnivs.length}\uACF3</span>
        <span class="brd-hero-badge">${boardCardView?"\uD3EC\uD1A0\uCE74\uB4DC":"\uAE30\uBCF8 \uCE74\uB4DC"} \xB7 ${boardGridCols===2?"2\uC5F4":"1\uC5F4"}</span>
      </div>
    </div>
    <div class="brd-hero-side">
      <span class="brd-hero-badge" style="background:linear-gradient(135deg,${_heroCol},${_hexToRgba(_heroCol,.82)});border-color:${_heroCol};color:${_heroTc};box-shadow:0 16px 28px ${_hexToRgba(_heroCol,.22)}">${_currentUnivLabel}</span>
    </div>
  </section>
  <div class="brd-toolbar-card no-export">
  <div class="fbar" style="overflow-x:auto;flex-wrap:nowrap;-webkit-overflow-scrolling:touch;scrollbar-width:none;gap:4px;margin-bottom:10px">
    <button class="pill ${boardGridCols===2?"on":""}" style="flex-shrink:0;white-space:nowrap" onclick="boardGridCols=boardGridCols===2?1:2;render()" title="1\uC5F4/2\uC5F4 \uBCF4\uAE30 \uC804\uD658">${boardGridCols===2?"\u25A6 1\uC5F4":"\u229E 2\uC5F4"}</button>
    <button class="pill ${boardCardView?"on":""}" style="flex-shrink:0;white-space:nowrap" onclick="boardCardView=!boardCardView;if(boardCardView)boardCardShape=boardCardShape==='circle'?'square':'circle';render()" title="\uD3EC\uD1A0\uCE74\uB4DC \uBDF0 \uC804\uD658">\u25A6 \uD3EC\uD1A0\uCE74\uB4DC</button>
    <button class="pill ${boardCompactMode?"on":""}" style="flex-shrink:0;white-space:nowrap" onclick="boardCompactMode=!boardCompactMode;render()" title="\uC18C\uD615/\uB300\uD615 \uCE69 \uC804\uD658">${boardCompactMode?"\u2B1B \uD06C\uAC8C\uBCF4\uAE30":"\u{1F532} \uC18C\uD615\uC73C\uB85C"}</button>
    <button class="pill ${_brdAllCollapsed?"on":""}" style="flex-shrink:0;white-space:nowrap" onclick="${_brdAllCollapsed?"_brdExpandAll()":"_brdCollapseAll()"}" title="${_brdAllCollapsed?"\uBAA8\uB450 \uD3BC\uCE58\uAE30":"\uBAA8\uB450 \uC811\uAE30"}">${_brdAllCollapsed?"\u2295 \uD3BC\uCE58\uAE30":"\u2296 \uC811\uAE30"}</button>
  </div>
  <div class="brd-toolbar brd-toolbar-top">
    <div class="brd-toolbar-controls">
      <div class="brd-toolbar-row">
      <div style="position:relative">
        <select id="board-univ-sel" onchange="boardSelUniv=this.value;_updateBoardSaveLabel();render();if(boardSelUniv!=='\uC804\uCCB4'){setTimeout(()=>{const c=document.querySelector(\`.brd-card[data-univ='\${boardSelUniv}']\`);if(c)c.scrollIntoView({behavior:'smooth',block:'center'});},120);}" style="appearance:none;-webkit-appearance:none;padding:6px 28px 6px 12px;border-radius:9px;border:1.5px solid var(--border2);font-size:var(--fs-sm);font-weight:700;color:var(--text);background:var(--surface);cursor:pointer;outline:none;min-width:120px;">
          <option value="\uC804\uCCB4">\u{1F3EB} \uC804\uCCB4 \uBCF4\uAE30</option>
          ${visUnivs.map(u=>`<option value="${u.name}"${boardSelUniv===u.name?" selected":""}>${u.name}${_canManage&&u.hidden?" (\uC228\uAE40)":""}</option>`).join("")}
        </select>
        <svg style="position:absolute;right:8px;top:50%;transform:translateY(-50%);pointer-events:none;color:var(--gray-l)" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m6 9 6 6 6-6"/></svg>
      </div>
      <button class="pill" onclick="boardSelUniv&&boardSelUniv!=='\uC804\uCCB4'?downloadBoardSel():downloadBoardAll()" id="brd-save-btn">
        \u{1F4F7} <span id="brd-save-btn-label">${boardSelUniv&&boardSelUniv!=="\uC804\uCCB4"?boardSelUniv+" \uC774\uBBF8\uC9C0\uC800\uC7A5":"\uC774\uBBF8\uC9C0\uC800\uC7A5"}</span>
      </button>
      <div style="display:flex;align-items:center;gap:5px;padding:4px 10px;border-radius:9px;border:1.5px solid var(--border2);background:var(--surface)">
        <span style="font-size:10px;color:var(--gray-l);font-weight:700;white-space:nowrap">\uBC30\uACBD</span>
        <button onclick="b2BgAlpha=Math.max(0,b2BgAlpha-5);localStorage.setItem('su_b2ba',b2BgAlpha);render();if(typeof save==='function')save()" style="padding:1px 6px;border-radius:5px;border:1px solid var(--border2);background:var(--white);font-size:var(--fs-caption);cursor:pointer;line-height:1.4" title="\uBC30\uACBD \uB354 \uC5F0\uD558\uAC8C">\u2212</button>
        <input type="range" min="0" max="100" value="${b2BgAlpha}" id="brd-bg-range" style="width:55px;height:4px;cursor:pointer" title="\uBC30\uACBD \uC9C4\uD558\uAE30 (${b2BgAlpha})" oninput="b2BgAlpha=+this.value;localStorage.setItem('su_b2ba',b2BgAlpha);render();if(typeof save==='function')save()">
        <button onclick="b2BgAlpha=Math.min(100,b2BgAlpha+5);localStorage.setItem('su_b2ba',b2BgAlpha);render();if(typeof save==='function')save()" style="padding:1px 6px;border-radius:5px;border:1px solid var(--border2);background:var(--white);font-size:var(--fs-caption);cursor:pointer;line-height:1.4" title="\uBC30\uACBD \uB354 \uC9C4\uD558\uAC8C">+</button>
        <span style="font-size:10px;color:var(--gray-l);font-weight:700;white-space:nowrap;margin-left:4px">\uB77C\uBCA8</span>
        <button onclick="b2LabelAlpha=Math.max(0,b2LabelAlpha-5);localStorage.setItem('su_b2la',b2LabelAlpha);render();if(typeof save==='function')save()" style="padding:1px 6px;border-radius:5px;border:1px solid var(--border2);background:var(--white);font-size:var(--fs-caption);cursor:pointer;line-height:1.4" title="\uB77C\uBCA8 \uB354 \uC5F0\uD558\uAC8C">\u2212</button>
        <input type="range" min="0" max="100" value="${b2LabelAlpha}" id="brd-label-range" style="width:55px;height:4px;cursor:pointer" title="\uB77C\uBCA8 \uC9C4\uD558\uAE30 (${b2LabelAlpha})" oninput="b2LabelAlpha=+this.value;localStorage.setItem('su_b2la',b2LabelAlpha);render();if(typeof save==='function')save()">
        <button onclick="b2LabelAlpha=Math.min(100,b2LabelAlpha+5);localStorage.setItem('su_b2la',b2LabelAlpha);render();if(typeof save==='function')save()" style="padding:1px 6px;border-radius:5px;border:1px solid var(--border2);background:var(--white);font-size:var(--fs-caption);cursor:pointer;line-height:1.4" title="\uB77C\uBCA8 \uB354 \uC9C4\uD558\uAC8C">+</button>
      </div>
      </div>
      <div class="brd-toolbar-note">${_canManage?'\u{1F5B1}\uFE0F \uD5E4\uB354 \uB4DC\uB798\uADF8\xB7\u25C0\u25B6 = \uB300\uD559\uC21C\uC11C | \uC2A4\uD2B8\uB9AC\uBA38 \uB4DC\uB798\uADF8/\uD074\uB9AD = \uC21C\uC11C\xB7\uB300\uD559\uC774\uB3D9 <button onclick="openCfgHome()" style="margin-left:6px;background:var(--surface);border:1px solid var(--border2);border-radius:8px;padding:4px 10px;font-size:var(--fs-caption);cursor:pointer;color:var(--text2);font-weight:700">\u2699\uFE0F \uB300\uD559 \uC0C9\uC0C1\xB7\uC228\uAE30\uAE30</button>':"\u{1F446} \uC2A4\uD2B8\uB9AC\uBA38 \uD074\uB9AD \u2192 \uC2A4\uD2B8\uB9AC\uBA38 \uC0C1\uC138"}</div>
    </div>
    ${_brdStatsHtml}
  </div>
  </div>
  <div id="board-wrap" style="display:grid;grid-template-columns:${boardGridCols===2?"repeat(2,1fr)":"1fr"};gap:14px;align-items:start">`;(boardSelUniv==="\uC804\uCCB4"?visUnivs:visUnivs.filter(u=>u.name===boardSelUniv)).forEach(u=>{h+=buildUnivBoardCard(u)}),h+=`</div>
</div>
`,C.innerHTML=h,injectUnivIcons(C),requestAnimationFrame(()=>{injectUnivIcons(C),initBoardDrag(),_bindBoardBgAutoResize(),_applyBoardBgAutoSizing(C)}),_brdPopupListenerAdded||(document.addEventListener("click",_closeBrdPopup,{capture:!0}),_brdPopupListenerAdded=!0)}

/* cloud-board-render.js */
function buildUnivBoardCard(u,forExport){if(!u)return"";const uNameJs=typeof escJS=="function"?escJS(u.name):String(u.name||"").replace(/\\/g,"\\\\").replace(/'/g,"\\'").replace(/\r/g,"\\r").replace(/\n/g,"\\n"),col=gc(u.name),iconUrl=UNIV_ICONS[u.name]||(univCfg.find(x=>x.name===u.name)||{}).icon||"",sorted=_getBoardPlayers(u.name);if(!sorted.length&&!forExport)return`<div class="brd-card" data-univ="${escAttr(u.name)}" style="border:2px dashed ${col}66;border-radius:14px;padding:20px 18px;background:${col}08;display:flex;align-items:center;gap:10px;opacity:.75">
      ${iconUrl?`<img src="${toHttpsUrl(iconUrl)}" style="width:var(--su_univ_logo_size,32px);height:var(--su_univ_logo_size,32px);object-fit:contain;border-radius:var(--su_univ_logo_radius,10px)" onerror="this.style.display='none'">`:""}
      <span style="font-weight:900;font-size:var(--fs-md);color:${col}">${u.name}</span>
      <span style="font-size:var(--fs-caption);color:var(--gray-l)">\uB4F1\uB85D\uB41C \uC2A4\uD2B8\uB9AC\uBA38 \uC5C6\uC74C</span>
    </div>`;const cnt=sorted.length,allUnivs=getAllUnivs(),RACE_CFG={T:{bg:"#dbeafe",col:"#1e40af",txt:"\uD14C"},Z:{bg:"#ede9fe",col:"#5b21b6",txt:"\uC800"},P:{bg:"#fef3c7",col:"#92400e",txt:"\uD504"},N:{bg:"#f1f5f9",col:"#475569",txt:"?"}},hexToRgba=(h,a)=>{const r=parseInt(h.slice(1,3),16),g=parseInt(h.slice(3,5),16),b=parseInt(h.slice(5,7),16);return`rgba(${r},${g},${b},${a})`},toPastel=(hex,mix=.72)=>{const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16),pr=Math.round(r*(1-mix)+255*mix),pg=Math.round(g*(1-mix)+255*mix),pb=Math.round(b*(1-mix)+255*mix);return"#"+[pr,pg,pb].map(v=>v.toString(16).padStart(2,"0")).join("")},pastelCol=forExport?col:toPastel(col,Math.max(.35,.95-b2BgAlpha*.01)),headerCol=col,shd=hexToRgba(col,.18);return(isWide=>{const rolePlayers=sorted.filter(p=>p.role&&MAIN_ROLES.includes(p.role)),normalPlayers=sorted.filter(p=>!p.role||!MAIN_ROLES.includes(p.role)),tierMap={};normalPlayers.forEach(p=>{const t=p.tier||"\uAE30\uD0C0";tierMap[t]||(tierMap[t]=[]),tierMap[t].push(p)});const tierOrder=TIERS.filter(t=>tierMap[t]);tierMap.\uAE30\uD0C0&&!TIERS.includes("\uAE30\uD0C0")&&tierOrder.push("\uAE30\uD0C0");const buildPlayerChip=(p,chipIdx)=>{const pNameJs=typeof escJS=="function"?escJS(p&&p.name):String(p&&p.name||"").replace(/\\/g,"\\\\").replace(/'/g,"\\'").replace(/\r/g,"\\r").replace(/\n/g,"\\n"),pNameHtml=typeof window.escHTML=="function"?window.escHTML(p&&p.name):String(p&&p.name||""),pRoleHtml=typeof window.escHTML=="function"?window.escHTML(p&&p.role):String(p&&p.role||""),rc=RACE_CFG[p.race]||{bg:"#f1f5f9",col:"#475569",txt:p.race||"?"},isMain=p.role&&MAIN_ROLES.includes(p.role),rCol=ROLE_COLORS[p.role]||"",rIcon=ROLE_ICONS[p.role]||"",photoSrcChip=_getBrdPhoto(p);if(boardCardView){const rcBg=rc.col||col,cardTierCol=p.tier?getTierBtnColor(p.tier)||"#64748b":null,cardTierText=p.tier&&getTierBtnTextColor(p.tier)||"#fff",rTxtCard=rc.txt||p.race||"?",imgBorderRadius=boardCardShape==="square"?"8px":"10px",imgInner=photoSrcChip?`<img src="${toScaledUrl(photoSrcChip,320)}" data-orig="${toHttpsUrl(photoSrcChip)}" class="brd-fit-auto" data-fit-kind="card" data-fit-mode="auto" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center;border-radius:${imgBorderRadius}" onload="_applyBoardBgAutoSizing(this)" ${forExport?"":` onerror="if(this.dataset.orig&&this.src!==this.dataset.orig){this.src=this.dataset.orig;}else{this.style.display='none'}"`}>`+(forExport?"":`<div style="position:absolute;inset:0;background:linear-gradient(135deg,${col},${col}aa);display:none;align-items:center;justify-content:center;font-size:30px;font-weight:900;color:#fff;border-radius:${imgBorderRadius}">${rTxtCard}</div>`):`<div style="position:absolute;inset:0;background:linear-gradient(135deg,${col},${col}aa);display:flex;align-items:center;justify-content:center;font-size:30px;font-weight:900;color:#fff;border-radius:${imgBorderRadius}">${rTxtCard}</div>`,topBadges=`<div style="position:absolute;top:6px;left:6px;display:flex;gap:3px;flex-wrap:wrap"><span style="font-size:9px;font-weight:900;background:${rc.col||"#64748b"};color:#fff;border-radius:4px;padding:1px 5px;line-height:1.5;text-shadow:0 1px 2px rgba(0,0,0,.4)">${rTxtCard}</span>`+(p.tier?`<span style="font-size:9px;font-weight:800;background:${cardTierCol};color:${cardTierText};border-radius:4px;padding:1px 5px;line-height:1.5;text-shadow:0 1px 2px rgba(0,0,0,.3)">${p.tier}</span>`:"")+"</div>",overlay='<div style="position:absolute;bottom:0;left:0;right:0;background:linear-gradient(transparent,rgba(0,0,0,.82));border-radius:0 0 10px 10px;padding:22px 6px 7px;text-align:center">'+(p.role?`<div style="font-size:9px;font-weight:700;color:#ffffffbb;margin-bottom:1px">${pRoleHtml}</div>`:"")+`<div style="font-weight:800;font-size:var(--fs-caption);color:#fff;word-break:break-all;text-shadow:0 1px 3px #000a">${pNameHtml}</div>`+(p.channelUrl?forExport?`<div style="margin-top:4px;font-size:9px;font-weight:700;color:${col};background:rgba(255,255,255,.9);border-radius:4px;padding:1px 6px;display:inline-block">\u25B6 \uBC29\uC1A1</div>`:`<a href="${p.channelUrl}" target="_blank" onclick="event.stopPropagation()" style="margin-top:4px;display:inline-block;font-size:9px;font-weight:700;color:${col};background:rgba(255,255,255,.9);border-radius:4px;padding:1px 6px;text-decoration:none">\u25B6 \uBC29\uC1A1</a>`:"")+"</div>",cardInner=`<div style="position:relative;width:100%;${forExport?"height:110px;padding-top:0":"aspect-ratio:3/4"};overflow:hidden;border-radius:var(--r)">${imgInner}${topBadges}${overlay}</div>`;if(forExport)return`<div style="border-radius:var(--r);overflow:hidden;border:2px solid ${hexToRgba(col,.5)}">${cardInner}</div>`;const totalInUnivCard=sorted.length,clickFnCard=_boardCanManage()?`openBrdPlayerPopupFromChip(event,'${pNameJs}','${uNameJs}',${chipIdx!=null?chipIdx:0},${totalInUnivCard})`:"openRandomPlayerModal()";return`<div class="brd-chip" data-player="${escAttr(p.name)}" data-univ="${escAttr(u.name)}" data-idx="${chipIdx!=null?chipIdx:0}"${_boardCanManage()?' draggable="true"':""} style="border-radius:var(--r);overflow:hidden;border:2px solid ${hexToRgba(col,.5)};cursor:pointer;transition:box-shadow .15s,transform .15s" onmouseover="this.style.boxShadow='0 6px 20px ${hexToRgba(col,.5)}';this.style.transform='translateY(-3px)'" onmouseout="this.style.boxShadow='';this.style.transform=''" onclick="event.stopPropagation();${clickFnCard}" ondragstart="if(_boardCanManage()){event.stopPropagation();event.dataTransfer.setData('text/chip',this.dataset.player);}">`+cardInner+"</div>"}if(forExport){const cBgE=hexToRgba(col,.16),cBdE=hexToRgba(col,.45),rTxt2=rc.txt||p.race||"?",chipTierCol2=p.tier?getTierBtnColor(p.tier)||col:"#9ca3af",chipTierText2=p.tier&&getTierBtnTextColor(p.tier)||"#fff",imgRadius="var(--su_profile_radius,50%)";return`<span style="display:inline-flex;align-items:center;gap:12px;background:${cBgE};border-radius:var(--r2);padding:10px 18px 10px 10px;margin:5px;box-shadow:0 2px 10px rgba(0,0,0,.13);border:2px solid ${cBdE}">
          ${photoSrcChip?`<img src="${toThumbUrl(photoSrcChip,64)}" data-orig="${toHttpsUrl(photoSrcChip)}" class="brd-fit-auto" data-fit-kind="profile" data-fit-mode="auto" style="width:64px;height:64px;border-radius:${imgRadius};object-fit:cover;flex-shrink:0;border:3px solid ${col};box-shadow:0 2px 10px ${hexToRgba(col,.4)}" onload="_applyBoardBgAutoSizing(this)" onerror="if(this.dataset.orig&&this.src!==this.dataset.orig){this.src=this.dataset.orig;}">`:`<span style="width:64px;height:64px;border-radius:${imgRadius};background:${col};color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:26px;font-weight:900;flex-shrink:0;border:3px solid ${hexToRgba(col,.7)}">${rTxt2}</span>`}
          <span style="display:inline-flex;flex-direction:column;gap:3px;min-width:0">
            ${isMain?`<span style="font-size:var(--fs-caption);font-weight:900;color:#fff;background:${col};border-radius:5px;padding:2px 8px;display:inline-block">${rIcon}${p.role}</span>`:""}
            <span style="font-weight:900;color:#111;font-size:16px;line-height:1.3;white-space:nowrap">${p.name}</span>
            <span style="display:inline-flex;align-items:center;gap:5px;line-height:1.2">
              <span style="font-size:var(--fs-sm);font-weight:900;background:${rc.col};color:#fff;border-radius:6px;padding:2px 8px">${rTxt2}</span>
              ${p.tier?`<span style="font-size:var(--fs-caption);font-weight:800;background:${chipTierCol2};color:${chipTierText2};border-radius:6px;padding:2px 8px">${p.tier}</span>`:""}
            </span>
          </span>
        </span>`}const compact=boardCompactMode,totalInUniv=sorted.length,clickFn=_boardCanManage()?`openBrdPlayerPopupFromChip(event,'${pNameJs}','${uNameJs}',${chipIdx!=null?chipIdx:0},${totalInUniv})`:"openRandomPlayerModal()",chipTierCol=p.tier?getTierBtnColor(p.tier)||col:"#9ca3af",chipTierText=p.tier&&getTierBtnTextColor(p.tier)||"#fff",cBgL=hexToRgba(col,.16),cBgH=hexToRgba(col,.28),cBd=hexToRgba(col,.45),rTxt=rc.txt||p.race||"?",photoSz=compact?"36px":"64px",photoFs=compact?"14px":"26px",chipPad=compact?"5px 10px 5px 6px":"10px 18px 10px 10px",chipGap=compact?"7px":"12px",nameFs=compact?"13px":"16px",badgeFs=compact?"10px":"12px",tierBadgeFs=compact?"9px":"11px",_photoEl=photoSrcChip?`<span style="width:${photoSz};height:${photoSz};border-radius:var(--su_profile_radius,50%);flex-shrink:0;position:relative;display:inline-flex;align-items:center;justify-content:center;overflow:hidden;border:${compact?"2":"3"}px solid ${col};box-shadow:0 2px 10px ${hexToRgba(col,.4)};background:${col};color:#fff;font-size:${photoFs};font-weight:900">${rTxt}<img src="${toThumbUrl(photoSrcChip,compact?36:64)}" data-orig="${toHttpsUrl(photoSrcChip)}" class="brd-fit-auto" data-fit-kind="profile" data-fit-mode="auto" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:var(--su_profile_radius,50%)" onload="_applyBoardBgAutoSizing(this)" onerror="if(this.dataset.orig&&this.src!==this.dataset.orig){this.src=this.dataset.orig;}else{this.style.display='none'}"></span>`:`<span style="width:${photoSz};height:${photoSz};border-radius:var(--su_profile_radius,50%);background:${col};color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:${photoFs};font-weight:900;flex-shrink:0;border:${compact?"2":"3"}px solid ${hexToRgba(col,.7)}">${rTxt}</span>`;return`<span class="brd-chip" data-player="${escAttr(p.name)}" data-univ="${escAttr(u.name)}" data-idx="${chipIdx!=null?chipIdx:0}"${_boardCanManage()?' draggable="true"':""} style="display:inline-flex;align-items:center;gap:${chipGap};background:${cBgL};border-radius:var(--r2);padding:${chipPad};margin:${compact?"3px":"5px"};cursor:${_boardCanManage()?"grab":"pointer"};transition:all .15s;box-shadow:0 2px 10px rgba(0,0,0,.13);border:2px solid ${cBd}" onmouseover="this.style.background='${cBgH}';this.style.boxShadow='0 5px 18px rgba(0,0,0,.2)';this.style.borderColor='${hexToRgba(col,.65)}'" onmouseout="this.style.background='${cBgL}';this.style.boxShadow='0 2px 10px rgba(0,0,0,.13)';this.style.borderColor='${cBd}'" onclick="event.stopPropagation();${clickFn}" ondragstart="if(_boardCanManage()){event.stopPropagation();event.dataTransfer.setData('text/chip',this.dataset.player);}">
        ${_photoEl}
        <span style="display:inline-flex;flex-direction:column;gap:${compact?"2px":"3px"};min-width:0">
          ${isMain&&!compact?`<span style="font-size:var(--fs-caption);font-weight:900;color:#fff;background:${col};border-radius:5px;padding:2px 8px;display:inline-block">${rIcon}${p.role}</span>`:""}
          <span style="font-weight:900;color:#111;font-size:${nameFs};line-height:1.3;white-space:nowrap;${p.inactive?"opacity:.6":""}">${compact&&isMain?`${rIcon}`:""}${pNameHtml}${getStatusIconHTML(p.name)}${p.inactive?'<span style="font-size:9px;background:#fff7ed;color:#9a3412;border-radius:4px;padding:1px 4px;font-weight:700;margin-left:3px">\u23F8\uFE0F</span>':""}${!p.transferDate||!p.prevUniv?"":(new Date-new Date(p.transferDate))/864e5<=30?`<span style="font-size:9px;background:#fef3c7;color:#92400e;border-radius:4px;padding:1px 5px;font-weight:800;margin-left:3px;border:1px solid #fcd34d" title="${escAttr(p.prevUniv)}\uC5D0\uC11C \uC774\uC801 (${escAttr(p.transferDate)})">\u{1F504} \uC774\uC801</span>`:""}</span>
          <span style="display:inline-flex;align-items:center;gap:${compact?"3px":"5px"};line-height:1.2">
            <span style="font-size:${badgeFs};font-weight:900;background:${rc.col};color:#fff;border-radius:6px;padding:${compact?"1px 5px":"2px 8px"}">${rTxt}</span>
            ${p.tier?`<span style="font-size:${tierBadgeFs};font-weight:800;background:${chipTierCol};color:${chipTierText};border-radius:6px;padding:${compact?"1px 5px":"2px 8px"}">${p.tier}</span>`:""}
          </span>
        </span>
      </span>`},chipIdxMap={};sorted.forEach((p,i)=>{chipIdxMap[p.name]=i});const roleRowsArr=MAIN_ROLES.map(role=>rolePlayers.filter(p=>p.role===role)).filter(group=>group.length>0),roleSection=roleRowsArr.length>0?roleRowsArr.map(group=>{const role=group[0].role,rIcon=ROLE_ICONS[role]||"",rCol=ROLE_COLORS[role]||col;return`<div style="margin-bottom:6px;padding:6px 8px 8px;border-radius:var(--r);background:${hexToRgba(col,.1)};border:1.5px solid ${hexToRgba(col,.25)}">
            <div style="font-size:10px;font-weight:900;color:#fff;padding:2px 9px;margin-bottom:4px;background:${rCol};border-radius:5px;display:inline-block;line-height:1.6">${rIcon}${role}</div>
            <div style="${boardCardView&&!forExport?"display:grid;grid-template-columns:repeat(auto-fill,minmax(90px,1fr));gap:8px;padding:4px 0":"display:flex;flex-wrap:wrap;gap:0"}">${group.map(p=>{var _a;return buildPlayerChip(p,(_a=chipIdxMap[p.name])!=null?_a:0)}).join("")}</div>
          </div>`}).join(""):"";let tierRows="",allRows="";if(u.name==="\uBB34\uC18C\uC18D"&&!forExport){const tierSorted=[...sorted].sort((a,b)=>TIERS.indexOf(a.tier)-TIERS.indexOf(b.tier)||b.points-a.points),chipIdxMapElo={};tierSorted.forEach((p,i)=>{chipIdxMapElo[p.name]=i});const freeTierMap={};tierSorted.forEach(p=>{const t=p.tier||"\uAE30\uD0C0";freeTierMap[t]||(freeTierMap[t]=[]),freeTierMap[t].push(p)}),tierRows=[...TIERS.filter(t=>freeTierMap[t]),...freeTierMap.\uAE30\uD0C0?["\uAE30\uD0C0"]:[]].map(tier=>{const ps=freeTierMap[tier],tColor=getTierBtnColor(tier)||col,tText=getTierBtnTextColor(tier)||"#fff";return`<div style="padding:4px 0 2px;border-bottom:1px solid ${hexToRgba(col,.22)}">
          <div style="font-size:10px;font-weight:900;color:${tText};letter-spacing:1px;padding:2px 9px;margin-bottom:3px;background:${toPastel(tColor,Math.max(0,(50-b2LabelAlpha)*.005))}!important;border-radius:5px;box-shadow:0 1px 4px rgba(0,0,0,.15);display:inline-block;line-height:1.5">${tier}</div>
          <div style="${boardCardView&&!forExport?"display:grid;grid-template-columns:repeat(auto-fill,minmax(90px,1fr));gap:8px;padding:4px 0":"display:flex;flex-wrap:wrap;gap:0"}">${ps.map(p=>{var _a;return buildPlayerChip(p,(_a=chipIdxMapElo[p.name])!=null?_a:0)}).join("")}</div>
        </div>`}).join(""),allRows=tierRows}else tierRows=tierOrder.map((tier,tidx)=>{const ps=tierMap[tier],tColor=getTierBtnColor(tier)||col,tText=getTierBtnTextColor(tier)||"#fff";return`<div style="padding:4px 0 2px;border-bottom:1px solid ${hexToRgba(col,.22)}">
          <div style="font-size:10px;font-weight:900;color:${tText};letter-spacing:1px;padding:2px 9px;margin-bottom:3px;background:${toPastel(tColor,Math.max(0,(50-b2LabelAlpha)*.005))}!important;border-radius:5px;box-shadow:0 1px 4px rgba(0,0,0,.15);display:inline-block;line-height:1.5">${tier}</div>
          <div style="${boardCardView&&!forExport?"display:grid;grid-template-columns:repeat(auto-fill,minmax(90px,1fr));gap:8px;padding:4px 0":"display:flex;flex-wrap:wrap;gap:0"}">${ps.map(p=>{var _a;return buildPlayerChip(p,(_a=chipIdxMap[p.name])!=null?_a:0)}).join("")}</div>
        </div>`}).join(""),allRows=roleSection+tierRows;const hdrDrag=_boardCanManage()&&!forExport?` draggable="true" ondragstart="event.stopPropagation();const card=this.closest('.brd-card');const wrap=document.getElementById('board-wrap');_brdDragSrc=card;card.classList.add('dragging');event.dataTransfer.effectAllowed='move';event.dataTransfer.setData('text/card',card.dataset.univ);" ondragend="event.stopPropagation();const card=this.closest('.brd-card');card.classList.remove('dragging');const wrap=document.getElementById('board-wrap');if(wrap){boardOrder=[...wrap.querySelectorAll('.brd-card')].map(c=>c.dataset.univ);save();syncBoardOrderToUnivCfg();}wrap&&wrap.querySelectorAll('.brd-card').forEach(c=>c.classList.remove('drag-over'));_brdDragSrc=null;"`:"",_bgPos=u.bgImgPos||"center center",_bgSize=u.bgImgSize||"auto",_bgPosGrid=u.bgImg?(()=>{const vs=["top","center","bottom"],hs=["left","center","right"];return`<div onclick="event.stopPropagation()" style="display:flex;flex-direction:column;gap:1px" title="\uBC30\uACBD \uC704\uCE58">${vs.map(v=>`<div style="display:flex;gap:1px">${hs.map(h=>{const p=`${v} ${h}`,a=_bgPos===p;return`<button onclick="event.stopPropagation();setBoardBgImgPos('${uNameJs}','${p}')" style="width:10px;height:10px;border-radius:2px;border:1px solid ${a?"rgba(255,255,255,.9)":"rgba(255,255,255,.3)"};background:${a?"rgba(255,255,255,.6)":"rgba(255,255,255,.15)"};cursor:pointer;padding:0" title="${p}"></button>`}).join("")}</div>`).join("")}</div>`})():"";return`<div class="brd-card" data-univ="${escAttr(u.name)}" style="position:relative;--brd-col:${toPastel(col,Math.min(1,Math.max(.35,.95-b2BgAlpha*.01)+.08))};--brd-shd:${shd}${isWide?";grid-column:1/-1":""}" draggable="false">
      <div class="brd-hdr" style="background:linear-gradient(135deg,${col} 0%,${hexToRgba(col,.85)} 100%);border-radius:18px 18px 0 0;cursor:${_boardCanManage()&&!forExport?"grab":"default"};overflow:hidden"${hdrDrag}>
        <div style="display:flex;align-items:center;gap:10px;position:relative;z-index:1">
          <div style="width:var(--su_univ_logo_box,46px);height:var(--su_univ_logo_box,46px);border-radius:var(--su_univ_logo_radius,13px);background:rgba(255,255,255,.20);border:2px solid rgba(255,255,255,.35);display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden;${forExport?"":"cursor:pointer"}" draggable="false" ${forExport?"":`onmousedown="event.stopPropagation()" onclick="event.stopPropagation();if(typeof openUnivModal==='function')openUnivModal('${uNameJs}')"`} title="\uB300\uD559 \uC0C1\uC138 \uBCF4\uAE30">
            ${iconUrl?`<img src="${toHttpsUrl(iconUrl)}" style="width:var(--su_univ_logo_size,34px);height:var(--su_univ_logo_size,34px);object-fit:contain;border-radius:var(--su_univ_logo_radius,10px)" onerror="this.parentElement.innerHTML='\u{1F3EB}'">`:'<span style="font-size:22px">\u{1F3EB}</span>'}
          </div>
          <div style="flex:1;min-width:0">
            <div style="display:flex;align-items:center;gap:6px;flex-wrap:nowrap;min-width:0;overflow:hidden">
              <button class="brd-univ-name-btn" style="color:#fff!important;font-weight:900;text-shadow:0 1px 4px rgba(0,0,0,.25);font-size:var(--fs-lg);display:inline-flex;align-items:center;gap:7px;flex-shrink:0" ${forExport?"":`onclick="event.stopPropagation();toggleBoardUniv('${uNameJs}')"`}>
                ${u.name||""}${!forExport&&(boardSelUniv||"")===u.name?`<span style="background:rgba(255,255,255,.95);color:${col};border-radius:50%;width:22px;height:22px;display:inline-flex;align-items:center;justify-content:center;font-size:14px;font-weight:900;box-shadow:0 2px 6px rgba(0,0,0,.2);flex-shrink:0">\u2713</span>`:""}</button>
              ${(u.championships||0)>0?`<span style="display:flex;gap:1px;flex-shrink:0">${'<span style="font-size:var(--fs-md)">\u2B50</span>'.repeat(u.championships||0)}</span>`:""}
              ${_boardCanManage()&&!forExport?`<input type="text" placeholder="\u{1F4CC} \uBA54\uBAA8..." value="${escAttr(u.memo2||"")}" style="margin-left:4px;background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.35);border-radius:6px;padding:2px 8px;font-size:var(--fs-sm);color:#fff;outline:none;font-family:inherit;min-width:60px;width:200px;max-width:45%;flex:0 1 auto" onmousedown="event.stopPropagation()" onclick="event.stopPropagation()" onchange="setBoardMemo2('${uNameJs}',this.value)" onblur="setBoardMemo2('${uNameJs}',this.value)">`:u.memo2?`<span style="margin-left:4px;font-size:var(--fs-sm);color:rgba(255,255,255,.92);font-weight:600;background:rgba(255,255,255,.15);border-radius:6px;padding:2px 8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex-shrink:1;max-width:45%">${typeof window.escHTML=="function"?window.escHTML(u.memo2):u.memo2}</span>`:""}
            </div>
            <div style="font-size:var(--fs-caption);color:rgba(255,255,255,.8);margin-top:3px;display:flex;align-items:center;gap:5px">${cnt}\uBA85 <button class="brd-collapse-btn no-export" onclick="event.stopPropagation();_brdCollapseToggle('${uNameJs}')"
              style="background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.35);border-radius:4px;color:#fff;font-size:10px;padding:0 5px;height:16px;cursor:pointer;line-height:1;font-weight:700">${boardCollapsed.has(u.name)?"\u25B6":"\u25BC"}</button>${u.dissolved?`<span style="background:rgba(0,0,0,.4);font-size:10px;padding:1px 7px;border-radius:var(--r);color:#fca5a5">\u{1F3DA}\uFE0F \uD574\uCCB4${u.dissolvedDate?" "+u.dissolvedDate:""}</span>`:""}${_boardCanManage()&&u.hidden?'<span style="background:rgba(0,0,0,.4);font-size:10px;padding:1px 7px;border-radius:var(--r)">\u{1F6AB} \uBC29\uBB38\uC790 \uC228\uAE40</span>':""}</div>
          </div>
          ${forExport?"":`<div class="no-export" style="display:flex;flex-direction:column;gap:3px;flex-shrink:0">
            ${_boardCanManage()?`<div style="display:flex;gap:3px;flex-wrap:wrap;justify-content:flex-end">
{{ ... }
              <button onclick="event.stopPropagation();boardCardMove('${escJS(u.name)}','left')" style="background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.35);border-radius:5px;color:#fff;font-size:var(--fs-caption);padding:0 7px;height:22px;cursor:pointer" title="\uC67C\uCABD \uC774\uB3D9">\u25C0</button>
              <button onclick="event.stopPropagation();boardCardMove('${escJS(u.name)}','right')" style="background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.35);border-radius:5px;color:#fff;font-size:var(--fs-caption);padding:0 7px;height:22px;cursor:pointer" title="\uC624\uB978\uCABD \uC774\uB3D9">\u25B6</button>
              <button onclick="event.stopPropagation();toggleBoardHide('${escJS(u.name)}')" style="background:${u.hidden?"rgba(239,68,68,.55)":"rgba(255,255,255,.18)"};border:1px solid ${u.hidden?"rgba(239,68,68,.8)":"rgba(255,255,255,.35)"};border-radius:5px;color:#fff;font-size:var(--fs-sm);padding:0 7px;height:22px;cursor:pointer" title="${u.hidden?"\uC228\uAE40":"\uD45C\uC2DC"}">${u.hidden?"\u{1F6AB}":"\u{1F441}\uFE0F"}</button>
              <label style="background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.35);border-radius:5px;color:#fff;font-size:var(--fs-sm);padding:0 7px;height:22px;cursor:pointer;display:flex;align-items:center;position:relative;overflow:hidden" onclick="event.stopPropagation()" title="\uC0C9\uC0C1">\u{1F3A8}<input type="color" value="${col}" style="position:absolute;opacity:0;width:100%;height:100%;cursor:pointer;top:0;left:0" onchange="event.stopPropagation();changeBoardUnivColor('${u.name}',this.value)"></label>
              <button onclick="event.stopPropagation();adjustChampionship('${escJS(u.name)}',1)" style="background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.35);border-radius:5px;color:#fff;font-size:var(--fs-caption);padding:0 7px;height:22px;cursor:pointer" title="\uC6B0\uC2B9 \uCD94\uAC00">\u2B50+</button>
              <button onclick="event.stopPropagation();adjustChampionship('${escJS(u.name)}',-1)" style="background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.35);border-radius:5px;color:#fff;font-size:var(--fs-caption);padding:0 7px;height:22px;cursor:pointer" title="\uC6B0\uC2B9 \uC81C\uAC70">\u2B50-</button>
              ${(()=>{const _ci=univCfg.findIndex(x=>x.name===u.name);return _ci<0?"":u.dissolved?`<button onclick="event.stopPropagation();univCfg[${_ci}].dissolved=false;univCfg[${_ci}].hidden=false;delete univCfg[${_ci}].dissolvedDate;save();render()" style="background:rgba(34,197,94,.35);border:1px solid rgba(134,239,172,.8);border-radius:5px;color:#fff;font-size:var(--fs-caption);padding:0 7px;height:22px;cursor:pointer" title="\uD574\uCCB4 \uBCF5\uAD6C">\u{1F504} \uBCF5\uAD6C</button>`:`<button onclick="event.stopPropagation();(function(){const _i=${_ci};if(typeof openDissolveModal==='function'){openDissolveModal(_i);}else{if(!confirm('${u.name.replace(/'/g,"\\'")} \uB300\uD559\uC744 \uD574\uCCB4\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?'))return;univCfg[_i].dissolved=true;univCfg[_i].hidden=true;univCfg[_i].dissolvedDate=new Date().toISOString().slice(0,10);save();render();}})()" style="background:rgba(234,88,12,.35);border:1px solid rgba(253,186,116,.8);border-radius:5px;color:#fff;font-size:var(--fs-caption);padding:0 7px;height:22px;cursor:pointer" title="\uB300\uD559 \uD574\uCCB4">\u{1F3DA}\uFE0F \uD574\uCCB4</button>`})()}
              <label style="background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.35);border-radius:5px;color:#fff;font-size:var(--fs-caption);padding:0 7px;height:22px;cursor:pointer;display:flex;align-items:center;gap:2px" onclick="event.stopPropagation()" title="\uBC30\uACBD \uC774\uBBF8\uC9C0 \uD30C\uC77C \uC5C5\uB85C\uB4DC">\u{1F5BC}\uFE0F<input type="file" accept="image/*" style="display:none" onchange="event.stopPropagation();(function(f,n){if(!f)return;const r=new FileReader();r.onload=function(e){setBoardBgImg(n,e.target.result);};r.readAsDataURL(f);})(this.files[0],'${uNameJs}')"></label>
              <button onclick="event.stopPropagation();promptBoardBgImgUrl('${uNameJs}')" style="background:${u.bgImg&&!u.bgImg.startsWith("data:")?"rgba(99,102,241,.45)":"rgba(255,255,255,.18)"};border:1px solid ${u.bgImg&&!u.bgImg.startsWith("data:")?"rgba(165,180,252,.8)":"rgba(255,255,255,.35)"};border-radius:5px;color:#fff;font-size:var(--fs-caption);padding:0 7px;height:22px;cursor:pointer" title="\uBC30\uACBD \uC774\uBBF8\uC9C0 URL \uB9C1\uD06C">\u{1F517}</button>
              ${u.bgImg?`<button onclick="event.stopPropagation();removeBoardBgImg('${uNameJs}')" style="background:rgba(239,68,68,.35);border:1px solid rgba(239,68,68,.6);border-radius:5px;color:#fff;font-size:var(--fs-caption);padding:0 7px;height:22px;cursor:pointer" title="\uBC30\uACBD \uC81C\uAC70">\u{1F5D1}\uFE0F</button>
              <button onclick="event.stopPropagation();setBoardBgImgSize('${uNameJs}','${_bgSize==="cover"?"contain":_bgSize==="contain"?"auto":"cover"}')" style="background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.35);border-radius:5px;color:#fff;font-size:10px;padding:0 6px;height:22px;cursor:pointer" title="${_bgSize==="cover"?"\uB9DE\uCD94\uAE30(contain)":_bgSize==="contain"?"\uC790\uB3D9(auto)":"\uCC44\uC6B0\uAE30(cover)"}">${_bgSize==="cover"?"\u2194\uB9DE\uCD94\uAE30":_bgSize==="contain"?"\u{1FA84}\uC790\uB3D9":"\u2B1B\uCC44\uC6B0\uAE30"}</button>
              ${_bgPosGrid}`:""}
            </div>`:""}
          </div>`}
        </div>
      </div>
      <div class="brd-sep" style="background:${hexToRgba(col,.25)}"></div>
      <div class="brd-card-body brd-body" style="background:${u.bgImg?"transparent":toPastel(col,Math.max(.3,.88-b2BgAlpha*.01))};overflow:hidden;position:relative;${boardCollapsed.has(u.name)?"display:none":""}">${u.bgImg?`<div class="brd-bg-layer" data-bg-src="${String(u.bgImg).replace(/"/g,"&quot;")}" data-bg-size-mode="${_bgSize}" style="position:absolute;inset:0;background:url('${String(u.bgImg).replace(/'/g,"%27")}') ${u.bgImgPos||"center center"}/${_bgSize==="auto"?"cover":_bgSize} no-repeat;opacity:0.35;pointer-events:none;z-index:0"></div>`:""}<div style="position:relative;z-index:1;background:${u.bgImg?"rgba(255,255,255,0.75)":"transparent"};min-height:100%">${(()=>{const _memo=u.memo||"",_imgs=(u.memoImgs||[]).length?u.memoImgs:u.memoImg?[u.memoImg]:[],_uname=u.name.replace(/'/g,"\\'").replace(/"/g,"&quot;"),panelStyle="border-radius:var(--r);padding:8px;background:rgba(255,255,255,.25);border:1px solid rgba(255,255,255,.45);backdrop-filter:blur(8px);box-shadow:0 2px 12px rgba(0,0,0,.1)";let sidePanelHtml="";if(_boardCanManage()&&!forExport){const imgList=_imgs.map((src,i)=>`<div style="position:relative;margin-bottom:5px">
            <img src="${src}" style="width:100%;border-radius:7px;display:block" onerror="this.style.display='none'">
            <button onclick="event.stopPropagation();removeBoardMemoImg('${_uname}',${i})" style="position:absolute;top:3px;right:3px;font-size:9px;background:rgba(239,68,68,.75);border:none;border-radius:4px;padding:1px 5px;color:#fff;cursor:pointer">\u2715</button>
          </div>`).join("");sidePanelHtml=`<div class="brd-side-panel no-export" style="${panelStyle}">
            ${imgList}
            <textarea placeholder="\u{1F4DD} \uC0AC\uC774\uB4DC \uBA54\uBAA8..." rows="2" style="width:100%;box-sizing:border-box;border:1px solid rgba(255,255,255,.55);border-radius:7px;padding:4px 6px;font-size:var(--fs-caption);background:rgba(255,255,255,.45);resize:none;outline:none;font-family:inherit;color:#222;margin-top:${_imgs.length?"2px":"0"}" onmousedown="event.stopPropagation()" onclick="event.stopPropagation()" onchange="setBoardMemo('${_uname}',this.value)" onblur="setBoardMemo('${_uname}',this.value)">${_memo}</textarea>
            <div style="display:flex;gap:4px;margin-top:4px">
              <label style="display:inline-flex;align-items:center;gap:2px;cursor:pointer;font-size:10px;font-weight:700;background:rgba(255,255,255,.6);border:1px solid rgba(255,255,255,.65);border-radius:5px;padding:2px 6px" onclick="event.stopPropagation()" title="\uD30C\uC77C \uC5C5\uB85C\uB4DC">\u{1F5BC}\uFE0F \uC5C5\uB85C\uB4DC<input type="file" accept="image/*" style="display:none" onchange="event.stopPropagation();(function(f,n){if(!f)return;const r=new FileReader();r.onload=function(e){addBoardMemoImg(n,e.target.result);};r.readAsDataURL(f);})(this.files[0],'${_uname}')"></label>
              <button onclick="event.stopPropagation();promptBoardMemoImgUrl('${_uname}')" style="display:inline-flex;align-items:center;gap:2px;cursor:pointer;font-size:10px;font-weight:700;background:rgba(255,255,255,.6);border:1px solid rgba(255,255,255,.65);border-radius:5px;padding:2px 6px" title="\uC774\uBBF8\uC9C0 URL \uB9C1\uD06C">\u{1F517} \uB9C1\uD06C</button>
            </div>
          </div>`}else if(!forExport&&(_memo||_imgs.length)){const imgList=_imgs.map(src=>`<img src="${src}" style="width:100%;border-radius:7px;margin-bottom:5px;display:block" onerror="this.style.display='none'">`).join("");sidePanelHtml=`<div class="brd-side-panel no-export" style="${panelStyle}">${imgList}${_memo?`<div style="font-size:var(--fs-caption);color:#333;white-space:pre-wrap;line-height:1.5;margin-top:${_imgs.length?"4px":"0"}">${_memo}</div>`:""}</div>`}const _bnote=u.bMemo||"",_bimgs=(u.bMemoImgs||[]).concat(u.bMemoImg?[u.bMemoImg]:[]);let bottomHtml="";if(_boardCanManage()&&!forExport){const imgList=_bimgs.map((src,i)=>`<div style="display:inline-flex;flex-direction:column;gap:3px;margin-right:6px;vertical-align:top">
            <img src="${src}" class="brd-bottom-section-img" style="max-width:130px;max-height:110px;object-fit:contain;border-radius:8px;display:block" onerror="this.style.display='none'">
            <button onclick="event.stopPropagation();removeBoardNoteImg('${_uname}',${i})" style="font-size:10px;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.25);border-radius:5px;padding:2px 6px;color:#dc2626;cursor:pointer">\u{1F5D1}\uFE0F \uC0AD\uC81C</button>
          </div>`).join("");bottomHtml=`<div style="margin-top:8px;padding-top:8px;border-top:1px solid rgba(0,0,0,.08);display:flex;flex-direction:column;gap:5px">
            ${imgList?`<div style="display:flex;flex-wrap:wrap;gap:4px">${imgList}</div>`:""}
            <textarea placeholder="\u{1F4CB} \uD558\uB2E8 \uBA54\uBAA8 \uC785\uB825..." rows="2" style="width:100%;box-sizing:border-box;border:1px solid rgba(0,0,0,.12);border-radius:7px;padding:5px 8px;font-size:var(--fs-caption);background:rgba(255,255,255,.55);resize:none;outline:none;font-family:inherit;color:#222" onmousedown="event.stopPropagation()" onclick="event.stopPropagation()" onchange="setBoardNote('${_uname}',this.value)" onblur="setBoardNote('${_uname}',this.value)">${_bnote}</textarea>
            <div style="display:flex;gap:5px;align-items:center">
              <label style="display:inline-flex;align-items:center;gap:3px;cursor:pointer;font-size:var(--fs-caption);font-weight:700;background:rgba(255,255,255,.7);border:1px solid rgba(0,0,0,.12);border-radius:6px;padding:3px 8px" onclick="event.stopPropagation()" title="\uD30C\uC77C \uC5C5\uB85C\uB4DC">\u{1F5BC}\uFE0F \uC5C5\uB85C\uB4DC<input type="file" accept="image/*" style="display:none" onchange="event.stopPropagation();(function(f,n){if(!f)return;const r=new FileReader();r.onload=function(e){addBoardNoteImg(n,e.target.result);};r.readAsDataURL(f);})(this.files[0],'${_uname}')"></label>
              <button onclick="event.stopPropagation();promptBoardNoteImgUrl('${_uname}')" style="display:inline-flex;align-items:center;gap:3px;cursor:pointer;font-size:var(--fs-caption);font-weight:700;background:rgba(255,255,255,.7);border:1px solid rgba(0,0,0,.12);border-radius:6px;padding:3px 8px" title="\uC774\uBBF8\uC9C0 URL \uB9C1\uD06C">\u{1F517} \uB9C1\uD06C</button>
            </div>
          </div>`}else if(_bnote||_bimgs.length){const imgList=_bimgs.map(src=>`<img src="${src}" class="brd-bottom-section-img" style="max-width:130px;max-height:110px;object-fit:contain;border-radius:8px;display:block" onerror="this.style.display='none'">`).join("");bottomHtml=`<div style="margin-top:8px;padding:8px;border-radius:8px;background:rgba(255,255,255,.35)">${imgList?`<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:${_bnote?"6px":"0"}">${imgList}</div>`:""}${_bnote?`<div style="font-size:var(--fs-sm);color:#333;white-space:pre-wrap;line-height:1.6">${_bnote}</div>`:""}</div>`}return`<div style="position:relative;z-index:1">${`<div style="overflow:hidden">${sidePanelHtml}${roleSection}${tierRows}</div>`}${bottomHtml}</div>`})()}</div></div>
    </div>`})(u.name==="\uBB34\uC18C\uC18D")}function _brdToast(msg,duration=2800){const existing=document.getElementById("brd-toast");existing&&existing.remove();const el=document.createElement("div");el.id="brd-toast",el.textContent=msg,el.style.cssText="position:fixed;bottom:28px;left:50%;transform:translateX(-50%) translateY(20px);background:#1e293b;color:#fff;padding:10px 20px;border-radius:var(--r);font-size:var(--fs-base);font-weight:600;z-index:9999;box-shadow:0 4px 20px rgba(0,0,0,.3);opacity:0;transition:opacity .25s,transform .25s;pointer-events:none;font-family:'Noto Sans KR',sans-serif;",document.body.appendChild(el),requestAnimationFrame(()=>{el.style.opacity="1",el.style.transform="translateX(-50%) translateY(0)"}),setTimeout(()=>{el.style.opacity="0",el.style.transform="translateX(-50%) translateY(10px)",setTimeout(()=>el.remove(),300)},duration)}let _brdPopup=null,_brdPopupListenerAdded=!1;function _closeBrdPopup(e){_brdPopup&&(_brdPopup.contains(e.target)||_brdClose())}function openRandomPlayerModal(){const eligible=(window.players||[]).filter(p=>p&&p.name&&!p.hidden&&!p.retired);if(!eligible.length)return;const pick=eligible[Math.floor(Math.random()*eligible.length)];openPlayerModal(pick.name)}function _brdClose(){_brdPopup&&(_brdPopup.remove(),_brdPopup=null);const dim=document.getElementById("brd-popup-dim");dim&&dim.remove()}function openBrdPlayerPopupFromChip(e,playerName,univName,idx,total){if(!_boardCanManage()){openRandomPlayerModal();return}e.stopPropagation(),_brdClose();const allUnivs=_getBoardUnivs(),p=players.find(x=>x.name===playerName);if(!p)return;const popup=document.createElement("div");popup.className="brd-move-popup",_brdPopup=popup;const univOpts=allUnivs.filter(u=>u.name!==univName&&!u.dissolved).map(u=>`<option value="${u.name}">${u.name}</option>`).join(""),_pnSafeChip=playerName.replace(/[^a-zA-Z0-9가-힣]/g,""),pNameJs=typeof escJS=="function"?escJS(playerName):String(playerName||"").replace(/\\/g,"\\\\").replace(/'/g,"\\'").replace(/\r/g,"\\r").replace(/\n/g,"\\n"),uNameJs=typeof escJS=="function"?escJS(univName):String(univName||"").replace(/\\/g,"\\\\").replace(/'/g,"\\'").replace(/\r/g,"\\r").replace(/\n/g,"\\n"),pNameHtml=typeof window.escHTML=="function"?window.escHTML(playerName):String(playerName||""),uNameHtml=typeof window.escHTML=="function"?window.escHTML(univName):String(univName||""),_tierIdxChip=TIERS.indexOf(p.tier||"\uBBF8\uC815"),_prevTierChip=_tierIdxChip>0?TIERS[_tierIdxChip-1]:null,_nextTierChip=_tierIdxChip<TIERS.length-1?TIERS[_tierIdxChip+1]:null;if(popup.innerHTML=`
    <div class="brd-move-popup-title">\u{1F464} ${pNameHtml} <span style="font-size:10px;font-weight:400">(${uNameHtml})</span></div>
    <div style="padding:5px 6px 8px;border-bottom:1px solid var(--border)">
      <div style="font-size:10px;font-weight:700;color:var(--text3);margin-bottom:4px">\u{1F3AD} \uC0C1\uD0DC \uC544\uC774\uCF58 <span style="margin-left:4px">${getStatusIconHTML(playerName)||""}</span></div>
      <div style="display:flex;flex-wrap:wrap;gap:2px;max-height:90px;overflow-y:auto" id="brd-icon-grid-${_pnSafeChip}">
        ${(()=>{const _ci=getStatusIcon(playerName);return Object.entries(STATUS_ICON_DEFS).map(([id,d])=>{const sel=id==="none"&&!_ci||d.emoji&&_ci===d.emoji,inner=d.emoji?_siIsImg(d.emoji)?_siRender(d.emoji,"15px"):d.emoji:'<span style="font-size:9px">\uC5C6\uC74C</span>';return`<button type="button" title="${d.label.replace(/"/g,"&quot;")}" onclick="setBrdStatusIcon(this,'${pNameJs}','${id}')" data-icon-id="${id}" style="padding:2px 5px;border-radius:4px;border:2px solid ${sel?"#16a34a":"var(--border)"};background:${sel?"#dcfce7":"var(--white)"};cursor:pointer;font-size:${id==="none"?"9px":"12px"};min-width:26px;display:inline-flex;align-items:center;justify-content:center">${inner}</button>`}).join("")})()}
      </div>
    </div>
    <div class="brd-move-popup-sep"></div>
    <div style="padding:4px 6px 6px;font-size:var(--fs-caption);font-weight:700;color:var(--text3)">\u{1F3F7}\uFE0F \uC9C1\uCC45 \uC218\uC815</div>
    <div style="display:flex;gap:4px;flex-wrap:wrap;padding:0 6px 4px">
      ${["\uC774\uC0AC\uC7A5","\uB3D9\uC544\uB9AC \uD68C\uC7A5","\uCD1D\uC7A5","\uBD80\uCD1D\uC7A5","\uCD1D\uAD04","\uAD50\uC218","\uCF54\uCE58"].map(r=>`<button class="btn btn-xs ${p.role===r?"btn-b":"btn-w"}" onclick="setBrdRole('${pNameJs}','${r}')" style="font-size:10px">${r}</button>`).join("")}
      <button class="btn btn-xs btn-w" onclick="setBrdRole('${pNameJs}','')" style="font-size:10px;color:#dc2626">\uD574\uC81C</button>
    </div>
    <div style="display:flex;gap:4px;padding:0 6px 4px;align-items:center">
      <input id="brd-role-chip-${_pnSafeChip}" type="text" placeholder="\uC9C1\uC811 \uC785\uB825..." style="flex:1;padding:4px 7px;border-radius:6px;border:1px solid var(--border2);font-size:var(--fs-caption)">
      <button class="btn btn-b btn-xs" onclick="(function(){const inp=document.getElementById('brd-role-chip-${_pnSafeChip}');if(inp&&inp.value.trim())setBrdRole('${pNameJs}',inp.value.trim())})()">\uC124\uC815</button>
    </div>
    ${univName!=="\uBB34\uC18C\uC18D"?`<button onclick="const p=players.find(x=>x.name==='${pNameJs}');if(p){const from=p.univ;p.univ='\uBB34\uC18C\uC18D';delete p.role;if(boardPlayerOrder[from])boardPlayerOrder[from]=boardPlayerOrder[from].filter(n=>n!=='${pNameJs}');save();_brdClose();_refreshBoardCard(from);_refreshBoardCard('\uBB34\uC18C\uC18D');_brdToast('\u{1F6B6} \uBB34\uC18C\uC18D\uC73C\uB85C \uC774\uB3D9 \uC644\uB8CC');}" style="width:calc(100% - 12px);margin:0 6px 6px;padding:5px;border-radius:6px;border:1.5px solid #cbd5e1;background:#f8fafc;font-size:var(--fs-caption);font-weight:700;cursor:pointer;color:#475569">\u{1F6B6} \uBB34\uC18C\uC18D\uC73C\uB85C \uC774\uB3D9</button>`:""}
    <div class="brd-move-popup-sep"></div>
    <div style="padding:4px 6px 2px;font-size:var(--fs-caption);font-weight:700;color:var(--text3)">\u2B50 \uD2F0\uC5B4</div>
    <div style="display:flex;align-items:center;gap:5px;padding:3px 6px 8px">
      <button onclick="${_prevTierChip?`setBrdTier('${pNameJs}','${_prevTierChip}')`:"void 0"}" ${_prevTierChip?"":"disabled"} style="padding:3px 10px;border-radius:6px;border:1px solid var(--border2);background:var(--surface);font-size:var(--fs-sm);font-weight:700;cursor:pointer;opacity:${_prevTierChip?"1":".3"}">\u25B2</button>
      <span style="flex:1;text-align:center;font-size:var(--fs-base);font-weight:800;color:var(--text)">${p.tier||"\uBBF8\uC815"}</span>
      <button onclick="${_nextTierChip?`setBrdTier('${pNameJs}','${_nextTierChip}')`:"void 0"}" ${_nextTierChip?"":"disabled"} style="padding:3px 10px;border-radius:6px;border:1px solid var(--border2);background:var(--surface);font-size:var(--fs-sm);font-weight:700;cursor:pointer;opacity:${_nextTierChip?"1":".3"}">\u25BC</button>
    </div>
    <div class="brd-move-popup-sep"></div>
    <div style="padding:4px 6px 6px;font-size:var(--fs-caption);font-weight:700;color:var(--text3)">\u{1F3EB} \uB2E4\uB978 \uB300\uD559\uC73C\uB85C \uC774\uB3D9</div>
    <div style="display:flex;gap:6px;padding:0 6px 6px">
      <select id="brd-chip-univ-target" style="flex:1;padding:5px 8px;border-radius:7px;border:1px solid var(--border2);font-size:var(--fs-sm);background:var(--white)">${univOpts||"<option disabled>\uB300\uD559 \uC5C6\uC74C</option>"}</select>
      <button class="btn btn-b btn-xs" onclick="boardTransferPlayerFromChip('${pNameJs}','${uNameJs}')">\uC774\uB3D9</button>
    </div>
    <div class="brd-move-popup-sep"></div>
    <div style="padding:4px 6px 6px">
      <div style="font-size:10px;font-weight:700;color:var(--text3);margin-bottom:4px">\u{1F5BC}\uFE0F \uD504\uB85C\uD544 \uC774\uBBF8\uC9C0</div>
      <div style="display:flex;gap:4px">
        <input id="brd-photo-chip-${_pnSafeChip}" type="text" placeholder="\uC774\uBBF8\uC9C0 URL \uC785\uB825..." value="${(p.photo||"").replace(/"/g,"&quot;")}" style="flex:1;padding:3px 7px;border-radius:6px;border:1px solid var(--border2);font-size:var(--fs-caption)">
        <button class="btn btn-b btn-xs" onclick="setBrdPhoto('${pNameJs}',document.getElementById('brd-photo-chip-${_pnSafeChip}').value)">\uC800\uC7A5</button>
      </div>
      ${p.photo?`<button onclick="setBrdPhoto('${pNameJs}','')" style="margin-top:3px;width:100%;padding:2px;border-radius:5px;border:1px solid #fca5a5;background:#fff1f2;font-size:10px;font-weight:700;cursor:pointer;color:#dc2626">\u{1F5D1}\uFE0F \uC774\uBBF8\uC9C0 \uC0AD\uC81C</button>`:""}
    </div>
    <div class="brd-move-popup-sep"></div>
    <div style="padding:4px 6px 6px">
      <div style="font-size:10px;font-weight:700;color:var(--text3);margin-bottom:5px">\u{1F527} \uC0C1\uD0DC</div>
      <div style="display:flex;gap:4px">
        <button onclick="(function(){const p=players.find(x=>x.name==='${pNameJs}');if(!p)return;p.retired=!p.retired;save();_brdClose();render();_brdToast(p.retired?'\u{1F397}\uFE0F \uC740\uD1F4 \uCC98\uB9AC\uB428':'\u21A9\uFE0F \uC740\uD1F4 \uD574\uC81C\uB428');})()" style="flex:1;padding:5px;border-radius:6px;border:1.5px solid ${p.retired?"#6b7280":"#e2e8f0"};background:${p.retired?"#f1f5f9":"var(--white)"};font-size:var(--fs-caption);font-weight:700;cursor:pointer;color:${p.retired?"#374151":"#64748b"}">\u{1F397}\uFE0F ${p.retired?"\uC740\uD1F4 \uD574\uC81C":"\uC740\uD1F4"}</button>
        <button onclick="(function(){const p=players.find(x=>x.name==='${pNameJs}');if(!p)return;p.hidden=!p.hidden;save();_brdClose();render();_brdToast(p.hidden?'\u{1F6AB} \uD604\uD669\uD310\uC5D0\uC11C \uC228\uAE40':'\u{1F441}\uFE0F \uD604\uD669\uD310\uC5D0 \uD45C\uC2DC\uB428');})()" style="flex:1;padding:5px;border-radius:6px;border:1.5px solid ${p.hidden?"#f87171":"#e2e8f0"};background:${p.hidden?"#fff1f2":"var(--white)"};font-size:var(--fs-caption);font-weight:700;cursor:pointer;color:${p.hidden?"#dc2626":"#64748b"}">\u{1F6AB} ${p.hidden?"\uC228\uAE40 \uD574\uC81C":"\uD604\uD669\uD310 \uC228\uAE30\uAE30"}</button>
      </div>
    </div>
    <button class="brd-move-popup-btn" onclick="_brdClose();openPlayerModal('${pNameJs}')">\u{1F464} \uC2A4\uD2B8\uB9AC\uBA38 \uC0C1\uC138 \uBCF4\uAE30</button>
  `,document.body.appendChild(popup),window.innerWidth<=768){const dim=document.createElement("div");dim.id="brd-popup-dim",dim.style.cssText="position:fixed;inset:0;background:rgba(15,23,42,.45);z-index:4999;backdrop-filter:blur(2px)",dim.onclick=()=>{dim.remove(),_brdClose()},document.body.insertBefore(dim,popup),popup.style.zIndex="5000"}else{const targetEl=e.target.closest(".brd-chip"),rect=(targetEl==null?void 0:targetEl.getBoundingClientRect())||{left:e.clientX,top:e.clientY,width:0,height:0};let left=rect.right+6,top=rect.top;const pw=240,ph=300;left+pw>window.innerWidth&&(left=rect.left-pw-6),top+ph>window.innerHeight&&(top=window.innerHeight-ph-10),top<8&&(top=8),popup.style.left=left+"px",popup.style.top=top+"px"}}function boardTransferPlayerFromChip(playerName,fromUniv){if(!_boardCanManage()){alert("\uCD1D\uAD00\uB9AC\uC790\uB9CC \uC774\uB3D9\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.");return}const sel=document.getElementById("brd-chip-univ-target"),toUniv=sel==null?void 0:sel.value;if(!toUniv||toUniv===fromUniv){alert("\uC774\uB3D9\uD560 \uB300\uD559\uC744 \uC120\uD0DD\uD558\uC138\uC694.");return}_brdClose();const p=players.find(x=>x.name===playerName);p&&confirm(`"${playerName}"\uC744(\uB97C) "${fromUniv}" \u2192 "${toUniv}"\uB85C \uC774\uB3D9\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?`)&&(p.prevUniv=fromUniv,p.transferDate=new Date().toISOString().slice(0,10),p.univ=toUniv,boardPlayerOrder[fromUniv]&&(boardPlayerOrder[fromUniv]=boardPlayerOrder[fromUniv].filter(n=>n!==playerName)),save(),saveBoardPlayerOrder(),_refreshBoardCard(fromUniv),_refreshBoardCard(toUniv),_brdToast(`\u2705 "${playerName}" \u2192 "${toUniv}" \uC774\uB3D9 \uC644\uB8CC`))}function openBrdPlayerPopup(e,playerName,univName,idx,total){if(!_boardCanManage()){openRandomPlayerModal();return}e.stopPropagation(),_brdClose();const allUnivs=_getBoardUnivs(),p=players.find(x=>x.name===playerName);if(!p)return;const popup=document.createElement("div");popup.className="brd-move-popup",_brdPopup=popup;const univOpts=allUnivs.filter(u=>u.name!==univName&&!u.dissolved).map(u=>`<option value="${u.name}">${u.name}</option>`).join(""),_pnSafe=playerName.replace(/[^a-zA-Z0-9가-힣]/g,""),pNameJs=typeof escJS=="function"?escJS(playerName):String(playerName||"").replace(/\\/g,"\\\\").replace(/'/g,"\\'").replace(/\r/g,"\\r").replace(/\n/g,"\\n"),uNameJs=typeof escJS=="function"?escJS(univName):String(univName||"").replace(/\\/g,"\\\\").replace(/'/g,"\\'").replace(/\r/g,"\\r").replace(/\n/g,"\\n"),pNameHtml=typeof window.escHTML=="function"?window.escHTML(playerName):String(playerName||""),uNameHtml=typeof window.escHTML=="function"?window.escHTML(univName):String(univName||""),_curIcon=getStatusIcon(playerName),_tierIdx=TIERS.indexOf(p.tier||"\uBBF8\uC815"),_prevTier=_tierIdx>0?TIERS[_tierIdx-1]:null,_nextTier=_tierIdx<TIERS.length-1?TIERS[_tierIdx+1]:null;if(popup.innerHTML=`
    <div style="padding:8px 10px 6px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;gap:6px">
      <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text)">\u{1F464} ${pNameHtml} <span style="font-size:10px;font-weight:500;color:var(--text3)">(${uNameHtml})</span></div>
      <button onclick="_brdClose()" style="background:none;border:none;color:var(--gray-l);font-size:14px;cursor:pointer;padding:0 2px;line-height:1">\u2715</button>
    </div>
    <div style="display:flex;gap:4px;padding:6px 8px;border-bottom:1px solid var(--border)">
      <button onclick="boardMovePlayer('${pNameJs}','${uNameJs}','top')" title="\uB9E8 \uC704\uB85C" ${idx===0?"disabled":""} style="flex:1;padding:4px;border-radius:6px;border:1px solid var(--border2);background:var(--surface);font-size:16px;cursor:pointer;opacity:${idx===0?".3":"1"}">\u2B06\uFE0F</button>
      <button onclick="boardMovePlayer('${pNameJs}','${uNameJs}','up')" title="\uC704\uB85C" ${idx===0?"disabled":""} style="flex:1;padding:4px;border-radius:6px;border:1px solid var(--border2);background:var(--surface);font-size:16px;cursor:pointer;opacity:${idx===0?".3":"1"}">\u{1F53C}</button>
      <button onclick="boardMovePlayer('${pNameJs}','${uNameJs}','down')" title="\uC544\uB798\uB85C" ${idx>=total-1?"disabled":""} style="flex:1;padding:4px;border-radius:6px;border:1px solid var(--border2);background:var(--surface);font-size:16px;cursor:pointer;opacity:${idx>=total-1?".3":"1"}">\u{1F53D}</button>
      <button onclick="boardMovePlayer('${pNameJs}','${uNameJs}','bottom')" title="\uB9E8 \uC544\uB798\uB85C" ${idx>=total-1?"disabled":""} style="flex:1;padding:4px;border-radius:6px;border:1px solid var(--border2);background:var(--surface);font-size:16px;cursor:pointer;opacity:${idx>=total-1?".3":"1"}">\u2B07\uFE0F</button>
    </div>
    <div style="padding:5px 8px;border-bottom:1px solid var(--border)">
      <div style="font-size:10px;font-weight:700;color:var(--text3);margin-bottom:4px">\u{1F3F7}\uFE0F \uC9C1\uCC45</div>
      <div style="display:flex;gap:3px;flex-wrap:wrap">
        ${["\uC774\uC0AC\uC7A5","\uB3D9\uC544\uB9AC \uD68C\uC7A5","\uCD1D\uC7A5","\uCD1D\uAD04","\uAD50\uC218","\uCF54\uCE58"].map(r=>`<button class="btn btn-xs ${p.role===r?"btn-b":"btn-w"}" onclick="setBrdRole('${pNameJs}','${r}')" style="font-size:10px;padding:2px 7px">${r}</button>`).join("")}
        <button class="btn btn-xs btn-w" onclick="setBrdRole('${pNameJs}','')" style="font-size:10px;padding:2px 7px;color:#dc2626">\uD574\uC81C</button>
      </div>
      <div style="display:flex;gap:4px;margin-top:4px">
        <input id="brd-role-custom-${_pnSafe}" type="text" placeholder="\uC9C1\uC811 \uC785\uB825..." style="flex:1;padding:3px 7px;border-radius:6px;border:1px solid var(--border2);font-size:var(--fs-caption)">
        <button class="btn btn-b btn-xs" onclick="(function(){const inp=document.getElementById('brd-role-custom-${_pnSafe}');if(inp&&inp.value.trim())setBrdRole('${pNameJs}',inp.value.trim())})()" style="font-size:var(--fs-caption)">\uC124\uC815</button>
      </div>
      ${univName!=="\uBB34\uC18C\uC18D"?`<button onclick="const p=players.find(x=>x.name==='${pNameJs}');if(p){const from=p.univ;p.univ='\uBB34\uC18C\uC18D';delete p.role;if(boardPlayerOrder[from])boardPlayerOrder[from]=boardPlayerOrder[from].filter(n=>n!=='${pNameJs}');save();_brdClose();_refreshBoardCard(from);_refreshBoardCard('\uBB34\uC18C\uC18D');_brdToast('\u{1F6B6} \uBB34\uC18C\uC18D\uC73C\uB85C \uC774\uB3D9 \uC644\uB8CC');}" style="width:100%;margin-top:5px;padding:4px;border-radius:6px;border:1.5px solid #cbd5e1;background:#f8fafc;font-size:var(--fs-caption);font-weight:700;cursor:pointer;color:#475569">\u{1F6B6} \uBB34\uC18C\uC18D\uC73C\uB85C \uC774\uB3D9</button>`:""}
    </div>
    <div style="padding:5px 8px;border-bottom:1px solid var(--border)">
      <div style="font-size:10px;font-weight:700;color:var(--text3);margin-bottom:4px">\u2B50 \uD2F0\uC5B4</div>
      <div style="display:flex;align-items:center;gap:5px">
        <button onclick="${_prevTier?`setBrdTier('${pNameJs}','${_prevTier}')`:"void 0"}" ${_prevTier?"":"disabled"} style="padding:3px 10px;border-radius:6px;border:1px solid var(--border2);background:var(--surface);font-size:var(--fs-sm);font-weight:700;cursor:pointer;opacity:${_prevTier?"1":".3"}">\u25B2</button>
        <span style="flex:1;text-align:center;font-size:var(--fs-base);font-weight:800;color:var(--text)">${p.tier||"\uBBF8\uC815"}</span>
        <button onclick="${_nextTier?`setBrdTier('${pNameJs}','${_nextTier}')`:"void 0"}" ${_nextTier?"":"disabled"} style="padding:3px 10px;border-radius:6px;border:1px solid var(--border2);background:var(--surface);font-size:var(--fs-sm);font-weight:700;cursor:pointer;opacity:${_nextTier?"1":".3"}">\u25BC</button>
      </div>
    </div>
    <div style="padding:5px 8px;border-bottom:1px solid var(--border)">
      <div style="font-size:10px;font-weight:700;color:var(--text3);margin-bottom:4px">\u{1F3AD} \uC0C1\uD0DC \uC544\uC774\uCF58</div>
      <div style="display:flex;flex-wrap:wrap;gap:3px" id="brd-icon-grid-${_pnSafe}">
        ${Object.entries(STATUS_ICON_DEFS).map(([id,d])=>{const sel=id==="none"&&!_curIcon||d.emoji&&_curIcon===d.emoji,inner=d.emoji?_siIsImg(d.emoji)?_siRender(d.emoji,"16px"):d.emoji:'<span style="font-size:10px">\uC5C6\uC74C</span>';return`<button type="button" title="${d.label}" onclick="setBrdStatusIcon(this,'${pNameJs}','${id}')" data-icon-id="${id}" style="padding:3px 6px;border-radius:5px;border:2px solid ${sel?"#16a34a":"var(--border)"};background:${sel?"#dcfce7":"var(--white)"};cursor:pointer;font-size:${id==="none"?"10px":"13px"};min-width:28px;transition:.1s;display:inline-flex;align-items:center;justify-content:center">${inner}</button>`}).join("")}
      </div>
      <div style="display:flex;gap:3px;margin-top:5px;align-items:center">
        <input id="brd-si-url-${_pnSafe}" type="text" placeholder="\u{1F517} \uC774\uBBF8\uC9C0 URL \uC785\uB825" style="flex:1;padding:3px 7px;border-radius:5px;border:1px solid var(--border2);font-size:var(--fs-caption)" oninput="_brdSiPreview('${_pnSafe}',this.value)">
        <span id="brd-si-prev-${_pnSafe}" style="width:22px;height:22px;display:inline-flex;align-items:center;justify-content:center;border:1px solid var(--border);border-radius:5px;background:var(--white);font-size:14px;flex-shrink:0"></span>
        <button class="btn btn-b btn-xs" onclick="_brdAddCustomIcon('${_pnSafe}','${pNameJs}')">\uCD94\uAC00</button>
      </div>
    </div>
    <div style="padding:5px 8px;border-bottom:1px solid var(--border)">
      <div style="font-size:10px;font-weight:700;color:var(--text3);margin-bottom:4px">\u{1F5BC}\uFE0F \uD504\uB85C\uD544 \uC774\uBBF8\uC9C0</div>
      <div style="display:flex;gap:4px">
        <input id="brd-photo-${_pnSafe}" type="text" placeholder="\uC774\uBBF8\uC9C0 URL \uC785\uB825..." value="${(p.photo||"").replace(/"/g,"&quot;")}" style="flex:1;padding:3px 7px;border-radius:6px;border:1px solid var(--border2);font-size:var(--fs-caption)">
        <button class="btn btn-b btn-xs" onclick="setBrdPhoto('${pNameJs}',document.getElementById('brd-photo-${_pnSafe}').value)">\uC800\uC7A5</button>
      </div>
      ${p.photo?`<button onclick="setBrdPhoto('${pNameJs}','')" style="margin-top:3px;width:100%;padding:2px;border-radius:5px;border:1px solid #fca5a5;background:#fff1f2;font-size:10px;font-weight:700;cursor:pointer;color:#dc2626">\u{1F5D1}\uFE0F \uC774\uBBF8\uC9C0 \uC0AD\uC81C</button>`:""}
    </div>
    <div style="padding:5px 8px;border-bottom:1px solid var(--border)">
      <div style="font-size:10px;font-weight:700;color:var(--text3);margin-bottom:4px">\u{1F3EB} \uB300\uD559 \uC774\uB3D9</div>
      <div style="display:flex;gap:4px">
        <select id="brd-univ-target" style="flex:1;padding:4px 8px;border-radius:6px;border:1px solid var(--border2);font-size:var(--fs-sm);background:var(--white)">${univOpts||"<option disabled>\uB300\uD559 \uC5C6\uC74C</option>"}</select>
        <button class="btn btn-b btn-xs" onclick="boardTransferPlayer('${pNameJs}','${uNameJs}')">\uC774\uB3D9</button>
      </div>
    </div>
    <div style="padding:5px 8px;border-bottom:1px solid var(--border)">
      <div style="font-size:10px;font-weight:700;color:var(--text3);margin-bottom:5px">\u{1F527} \uC0C1\uD0DC</div>
      <div style="display:flex;gap:4px">
        <button onclick="(function(){const p=players.find(x=>x.name==='${pNameJs}');if(!p)return;p.retired=!p.retired;save();_brdClose();render();_brdToast(p.retired?'\u{1F397}\uFE0F \uC740\uD1F4 \uCC98\uB9AC\uB428':'\u21A9\uFE0F \uC740\uD1F4 \uD574\uC81C\uB428');})()" style="flex:1;padding:5px;border-radius:6px;border:1.5px solid ${p.retired?"#6b7280":"#e2e8f0"};background:${p.retired?"#f1f5f9":"var(--white)"};font-size:var(--fs-caption);font-weight:700;cursor:pointer;color:${p.retired?"#374151":"#64748b"}">\u{1F397}\uFE0F ${p.retired?"\uC740\uD1F4 \uD574\uC81C":"\uC740\uD1F4"}</button>
        <button onclick="(function(){const p=players.find(x=>x.name==='${pNameJs}');if(!p)return;p.hidden=!p.hidden;save();_brdClose();render();_brdToast(p.hidden?'\u{1F6AB} \uD604\uD669\uD310\uC5D0\uC11C \uC228\uAE40':'\u{1F441}\uFE0F \uD604\uD669\uD310\uC5D0 \uD45C\uC2DC\uB428');})()" style="flex:1;padding:5px;border-radius:6px;border:1.5px solid ${p.hidden?"#f87171":"#e2e8f0"};background:${p.hidden?"#fff1f2":"var(--white)"};font-size:var(--fs-caption);font-weight:700;cursor:pointer;color:${p.hidden?"#dc2626":"#64748b"}">\u{1F6AB} ${p.hidden?"\uC228\uAE40 \uD574\uC81C":"\uD604\uD669\uD310 \uC228\uAE30\uAE30"}</button>
      </div>
    </div>
    <div style="display:flex;gap:4px;padding:6px 8px">
      <button style="flex:1;padding:6px;border-radius:7px;border:none;background:#2563eb;color:#fff;font-size:var(--fs-caption);font-weight:800;cursor:pointer;font-family:'Noto Sans KR',sans-serif" onclick="_brdClose();_refreshBoardCard('${uNameJs}');save();_brdToast('\u2705 \uC800\uC7A5 \uC644\uB8CC')">\u{1F4BE} \uC800\uC7A5</button>
      <button style="flex:1;padding:6px;border-radius:7px;border:1px solid var(--border2);background:var(--surface);color:var(--text);font-size:var(--fs-caption);font-weight:600;cursor:pointer;font-family:'Noto Sans KR',sans-serif" onclick="_brdClose();openPlayerModal('${pNameJs}')">\u{1F4CB} \uC0C1\uC138</button>
    </div>
  `,document.body.appendChild(popup),window.innerWidth<=768){const dim=document.createElement("div");dim.id="brd-popup-dim",dim.style.cssText="position:fixed;inset:0;background:rgba(15,23,42,.45);z-index:4999;backdrop-filter:blur(2px)",dim.onclick=()=>{dim.remove(),_brdClose()},document.body.insertBefore(dim,popup),popup.style.zIndex="5000"}else{const targetEl=e.target.closest(".brd-row, .brd-chip"),rect=(targetEl==null?void 0:targetEl.getBoundingClientRect())||{left:e.clientX,top:e.clientY,width:0,height:0};let left=rect.left+rect.width+6,top=rect.top;const pw=256,ph=420;left+pw>window.innerWidth&&(left=rect.left-pw-6),top+ph>window.innerHeight&&(top=window.innerHeight-ph-10),top<8&&(top=8),popup.style.left=left+"px",popup.style.top=top+"px"}}function setBrdTier(playerName,newTier){const p=players.find(x=>x.name===playerName);p&&(p.tier=newTier,save(),_brdClose(),_refreshBoardCard(p.univ),_brdToast("\u2B50 \uD2F0\uC5B4 \uBCC0\uACBD: "+newTier))}function setBrdRole(playerName,role){const p=players.find(x=>x.name===playerName);p&&(p.role=role||void 0,boardPlayerOrder[p.univ]&&(delete boardPlayerOrder[p.univ],saveBoardPlayerOrder()),save(),_brdClose(),_refreshBoardCard(p.univ))}function setBrdPhoto(playerName,url){const p=players.find(x=>x.name===playerName);if(!p)return;const trimmed=url.trim();trimmed?p.photo=trimmed:delete p.photo,_brdPhotoCacheSet(playerName,trimmed),save(),_refreshBoardCard(p.univ),_brdToast(trimmed?"\u{1F5BC}\uFE0F \uD504\uB85C\uD544 \uC774\uBBF8\uC9C0 \uC800\uC7A5 \uC644\uB8CC":"\u{1F5D1}\uFE0F \uD504\uB85C\uD544 \uC774\uBBF8\uC9C0 \uC0AD\uC81C")}function _brdSiPreview(pnSafe,v){const el=document.getElementById("brd-si-prev-"+pnSafe);el&&(el.innerHTML=v&&(v.startsWith("http")||v.startsWith("data:"))?`<img src="${v}" style="width:18px;height:18px;object-fit:contain" onerror="this.style.display='none'">`:v)}function _brdAddCustomIcon(pnSafe,playerName){const urlEl=document.getElementById("brd-si-url-"+pnSafe);if(!urlEl||!urlEl.value.trim())return;const pnJs=typeof escJS=="function"?escJS(playerName):String(playerName||"").replace(/\\/g,"\\\\").replace(/'/g,"\\'").replace(/\r/g,"\\r").replace(/\n/g,"\\n");addCustomStatusIcon("\uCEE4\uC2A4\uD140",urlEl.value.trim()),urlEl.value="";const prev=document.getElementById("brd-si-prev-"+pnSafe);prev&&(prev.innerHTML="");const grid=document.getElementById("brd-icon-grid-"+pnSafe);if(!grid)return;const _curIcon=playerStatusIcons[playerName]||"";grid.innerHTML=Object.entries(STATUS_ICON_DEFS).map(([id,d])=>{const sel=id==="none"&&!_curIcon||d.emoji&&_curIcon===d.emoji,inner=d.emoji?_siIsImg(d.emoji)?_siRender(d.emoji,"16px"):d.emoji:'<span style="font-size:10px">\uC5C6\uC74C</span>';return`<button type="button" title="${d.label}" onclick="setBrdStatusIcon(this,'${pnJs}','${id}')" data-icon-id="${id}" style="padding:3px 6px;border-radius:5px;border:2px solid ${sel?"#16a34a":"var(--border)"};background:${sel?"#dcfce7":"var(--white)"};cursor:pointer;font-size:${id==="none"?"10px":"13px"};min-width:28px;transition:.1s;display:inline-flex;align-items:center;justify-content:center">${inner}</button>`}).join("")}function setBrdStatusIcon(btn,playerName,iconId){setStatusIcon(playerName,iconId);const grid=btn.closest('[id^="brd-icon-grid-"]');grid&&grid.querySelectorAll("button[data-icon-id]").forEach(b=>{const sel=b.dataset.iconId===iconId;b.style.border="2px solid "+(sel?"#16a34a":"var(--border)"),b.style.background=sel?"#dcfce7":"var(--white)"});const p=players.find(x=>x.name===playerName);p&&_refreshBoardCard(p.univ)}function boardMovePlayer(playerName,univName,dir){if(!_boardCanManage())return;_brdClose();const sorted=_getBoardPlayers(univName),idx=sorted.findIndex(p=>p.name===playerName);if(idx<0)return;const order=sorted.map(p=>p.name);let ni=idx;dir==="up"?ni=Math.max(0,idx-1):dir==="down"?ni=Math.min(order.length-1,idx+1):dir==="top"?ni=0:dir==="bottom"&&(ni=order.length-1),ni!==idx&&(order.splice(idx,1),order.splice(ni,0,playerName),boardPlayerOrder[univName]=order,saveBoardPlayerOrder(),clearTimeout(window._bpoSaveTm),window._bpoSaveTm=setTimeout(()=>{typeof save=="function"&&save()},1500),_refreshBoardCard(univName))}function boardTransferPlayer(playerName,fromUniv){if(!_boardCanManage()){alert("\uCD1D\uAD00\uB9AC\uC790\uB9CC \uC774\uB3D9\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.");return}const sel=document.getElementById("brd-univ-target"),toUniv=sel==null?void 0:sel.value;if(!toUniv||toUniv===fromUniv){alert("\uC774\uB3D9\uD560 \uB300\uD559\uC744 \uC120\uD0DD\uD558\uC138\uC694.");return}_brdClose();const p=players.find(x=>x.name===playerName);if(!p||!confirm(`"${playerName}"\uC744(\uB97C) "${fromUniv}" \u2192 "${toUniv}"\uB85C \uC774\uB3D9\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?

\uC2A4\uD2B8\uB9AC\uBA38 \uBAA9\uB85D\xB7\uD2F0\uC5B4 \uC21C\uC704\uD45C\xB7\uC2A4\uD2B8\uB9AC\uBA38 \uC0C1\uC138\xB7\uB300\uD559 \uC0C1\uC138\uAC00 \uBAA8\uB450 \uC790\uB3D9 \uBC18\uC601\uB429\uB2C8\uB2E4.`))return;p.prevUniv=fromUniv,p.transferDate=new Date().toISOString().slice(0,10),p.univ=toUniv,boardPlayerOrder[fromUniv]&&(boardPlayerOrder[fromUniv]=boardPlayerOrder[fromUniv].filter(n=>n!==playerName)),save(),saveBoardPlayerOrder(),_refreshBoardCard(fromUniv),_refreshBoardCard(toUniv);const pm=document.getElementById("playerModal");if(pm&&pm.style.display!=="none"){const nameEl=pm.querySelector(".brd-univ-name-btn, [data-player-name]");pm.innerHTML&&pm.innerHTML.includes(playerName)&&openPlayerModal(playerName)}_brdToast(`\u2705 "${playerName}" \u2192 "${toUniv}" \uC774\uB3D9 \uC644\uB8CC`)}function _refreshBoardCard(univName){const wrap=document.getElementById("board-wrap");if(!wrap){render();return}const u=getAllUnivs().find(x=>x.name===univName),existing=_findBrdCardByUniv(univName,wrap);if(!u||!players.some(p=>p.univ===univName)){existing&&existing.remove();return}const newHtml=buildUnivBoardCard(u);if(!newHtml){existing&&existing.remove();return}const tmp=document.createElement("div");tmp.innerHTML=newHtml;const newCard=tmp.firstElementChild;existing?existing.replaceWith(newCard):wrap.appendChild(newCard),injectUnivIcons(newCard),initBoardDragCard(newCard,wrap),_boardCanManage()&&newCard.querySelectorAll(".brd-body").forEach(body=>initBoardPlayerDrag(body))}function boardCardMove(univName,dir){if(!_boardCanManage())return;const wrap=document.getElementById("board-wrap");if(!wrap)return;const cards=[...wrap.querySelectorAll(".brd-card")],idx=cards.findIndex(c=>c.dataset.univ===univName);if(idx<0)return;let newIdx;if(dir==="left"?newIdx=idx-1:newIdx=idx+1,newIdx<0||newIdx>=cards.length)return;const target=cards[newIdx];dir==="left"?target.before(cards[idx]):target.after(cards[idx]),boardOrder=[...wrap.querySelectorAll(".brd-card")].map(c=>c.dataset.univ),save(),syncBoardOrderToUnivCfg(),cards[idx].style.outline="3px solid rgba(255,255,255,.9)",setTimeout(()=>{cards[idx].style.outline=""},500)}

/* cloud-board-drag.js */
var __defProp=Object.defineProperty,__defProps=Object.defineProperties;var __getOwnPropDescs=Object.getOwnPropertyDescriptors;var __getOwnPropSymbols=Object.getOwnPropertySymbols;var __hasOwnProp=Object.prototype.hasOwnProperty,__propIsEnum=Object.prototype.propertyIsEnumerable;var __defNormalProp=(obj,key,value)=>key in obj?__defProp(obj,key,{enumerable:!0,configurable:!0,writable:!0,value}):obj[key]=value,__spreadValues=(a,b)=>{for(var prop in b||(b={}))__hasOwnProp.call(b,prop)&&__defNormalProp(a,prop,b[prop]);if(__getOwnPropSymbols)for(var prop of __getOwnPropSymbols(b))__propIsEnum.call(b,prop)&&__defNormalProp(a,prop,b[prop]);return a},__spreadProps=(a,b)=>__defProps(a,__getOwnPropDescs(b));function initBoardDrag(){const wrap=document.getElementById("board-wrap");wrap&&(wrap.querySelectorAll(".brd-card").forEach(card=>initBoardDragCard(card,wrap)),_boardCanManage()&&wrap.querySelectorAll(".brd-body").forEach(body=>initBoardPlayerDrag(body)))}let _brdDragSrc=null,_brdRowDragSrc=null;function initBoardDragCard(card,wrap){card.addEventListener("dragover",e=>{_brdRowDragSrc||_brdDragSrc&&(e.preventDefault(),e.dataTransfer.dropEffect="move",_brdDragSrc!==card&&(wrap.querySelectorAll(".brd-card").forEach(c=>c.classList.remove("drag-over")),card.classList.add("drag-over")))}),card.addEventListener("dragleave",e=>{e.currentTarget.contains(e.relatedTarget)||card.classList.remove("drag-over")}),card.addEventListener("drop",e=>{if(!_brdRowDragSrc){if(e.preventDefault(),_brdDragSrc&&_brdDragSrc!==card){const cards=[...wrap.querySelectorAll(".brd-card")],si=cards.indexOf(_brdDragSrc),di=cards.indexOf(card);si<di?card.after(_brdDragSrc):card.before(_brdDragSrc)}card.classList.remove("drag-over")}})}function initBoardPlayerDrag(body){if(!_boardCanManage())return;const getUnivName=()=>{var _a,_b;return((_b=(_a=body.closest(".brd-card"))==null?void 0:_a.dataset)==null?void 0:_b.univ)||""};body.addEventListener("dragover",e=>{_brdRowDragSrc&&(e.preventDefault(),e.stopPropagation(),e.dataTransfer.dropEffect="move",body.style.outline="2px dashed rgba(255,255,255,.6)")}),body.addEventListener("dragleave",e=>{body.contains(e.relatedTarget)||(body.style.outline="")}),body.addEventListener("drop",e=>{if(body.style.outline="",!_brdRowDragSrc)return;const targetUniv=getUnivName(),srcUniv=_brdRowDragSrc.dataset.univ,playerName=_brdRowDragSrc.dataset.player;if(targetUniv&&targetUniv!==srcUniv){if(e.preventDefault(),e.stopPropagation(),!confirm(`"${playerName}"\uC744(\uB97C) "${srcUniv}" \u2192 "${targetUniv}"\uB85C \uC774\uB3D9\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?`))return;const p=players.find(x=>x.name===playerName);if(!p)return;p.prevUniv=srcUniv,p.transferDate=new Date().toISOString().slice(0,10),p.univ=targetUniv,boardPlayerOrder[srcUniv]&&(boardPlayerOrder[srcUniv]=boardPlayerOrder[srcUniv].filter(n=>n!==playerName)),save(),saveBoardPlayerOrder(),_refreshBoardCard(srcUniv),_refreshBoardCard(targetUniv),_brdToast(`\u2705 "${playerName}" \u2192 "${targetUniv}" \uC774\uB3D9 \uC644\uB8CC`)}}),body.querySelectorAll(".brd-row[data-player], .brd-chip[data-player]").forEach(row=>{row.addEventListener("dragstart",e=>{e.stopPropagation(),_brdRowDragSrc=row,row.style.opacity=".45",e.dataTransfer.effectAllowed="move",e.dataTransfer.setData("text/player",row.dataset.player+"|"+row.dataset.univ)}),row.addEventListener("dragend",e=>{row.style.opacity="",document.querySelectorAll(".brd-row, .brd-chip").forEach(r=>r.style.outline=""),document.querySelectorAll(".brd-body").forEach(b=>b.style.outline=""),_brdRowDragSrc=null}),row.addEventListener("dragover",e=>{_brdRowDragSrc&&(e.preventDefault(),e.stopPropagation(),e.dataTransfer.dropEffect="move",_brdRowDragSrc!==row&&(body.querySelectorAll(".brd-row, .brd-chip").forEach(r=>r.style.outline=""),row.style.outline="2px solid rgba(255,255,255,.85)"))}),row.addEventListener("dragleave",e=>{row.style.outline=""}),row.addEventListener("drop",e=>{if(e.preventDefault(),e.stopPropagation(),row.style.outline="",!_brdRowDragSrc||_brdRowDragSrc===row)return;const targetUniv=row.dataset.univ,srcUniv=_brdRowDragSrc.dataset.univ;if(targetUniv!==srcUniv){const playerName=_brdRowDragSrc.dataset.player;if(!confirm(`"${playerName}"\uC744(\uB97C) "${srcUniv}" \u2192 "${targetUniv}"\uB85C \uC774\uB3D9\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?`))return;const p=players.find(x=>x.name===playerName);if(!p)return;p.prevUniv=srcUniv,p.transferDate=new Date().toISOString().slice(0,10),p.univ=targetUniv,boardPlayerOrder[srcUniv]&&(boardPlayerOrder[srcUniv]=boardPlayerOrder[srcUniv].filter(n=>n!==playerName));const ti2=(boardPlayerOrder[targetUniv]||[]).indexOf(row.dataset.player);boardPlayerOrder[targetUniv]||(boardPlayerOrder[targetUniv]=_getBoardPlayers(targetUniv).map(p2=>p2.name)),ti2>=0?boardPlayerOrder[targetUniv].splice(ti2,0,playerName):boardPlayerOrder[targetUniv].push(playerName),save(),saveBoardPlayerOrder(),_refreshBoardCard(srcUniv),_refreshBoardCard(targetUniv),_brdToast(`\u2705 "${playerName}" \u2192 "${targetUniv}" \uC774\uB3D9 \uC644\uB8CC`);return}const allItems=[...body.querySelectorAll(".brd-row[data-player], .brd-chip[data-player]")],si=allItems.indexOf(_brdRowDragSrc),di=allItems.indexOf(row);if(si>=0&&di>=0&&si!==di){si<di?row.after(_brdRowDragSrc):row.before(_brdRowDragSrc);const newOrder=[...body.querySelectorAll(".brd-row[data-player], .brd-chip[data-player]")].map(r=>r.dataset.player);boardPlayerOrder[targetUniv]=newOrder,saveBoardPlayerOrder()}})})}const _imgDataUrlCache=window._imgDataUrlCache=window._imgDataUrlCache||{},_imgDataUrlInflight=window._imgDataUrlInflight=window._imgDataUrlInflight||{},_imgDataUrlCacheOrder=window._imgDataUrlCacheOrder=window._imgDataUrlCacheOrder||[];async function _imgToDataUrls(container,timeoutMs=8e3,onProgress){const imgs=[...container.querySelectorAll("img")],maxConcurrent=20;let idx=0,doneCount=0;const stripProto=u=>String(u||"").replace(/^https?:\/\//i,""),withCacheBust=u=>{const s=String(u||"");return s+(s.includes("?")?"&":"?")+"_x="+Date.now()},_inflight={};async function convertOne(img){return await new Promise(resolve=>{if(!img||typeof img!="object"){resolve();return}let src0=img.getAttribute("src")||"";if(!src0||src0.startsWith("data:")||src0.startsWith("blob:")){resolve();return}try{if(typeof toHttpsUrl=="function"){const s2=toHttpsUrl(src0);if(s2&&s2!==src0){src0=s2;try{img.setAttribute("src",s2)}catch(e){}}}}catch(e){}try{const cached=_imgDataUrlCache[src0];if(cached&&typeof cached=="string"&&cached.startsWith("data:image/")){img.src=cached,resolve();return}}catch(e){}if(_inflight[src0]){_inflight[src0].then(dataUrl=>{if(dataUrl)try{img.src=dataUrl}catch(e){}resolve()}).catch(()=>resolve());return}let done=!1,inflightResolve;const inflightPromise=new Promise(r=>{inflightResolve=r});_inflight[src0]=inflightPromise;const finish=dataUrl=>{if(!done){done=!0;try{inflightResolve(dataUrl||null)}catch(e){}try{delete _inflight[src0]}catch(e){}resolve()}},t=setTimeout(()=>{finish(null)},timeoutMs),tryUrls=[src0],fallbackUrls=[withCacheBust(src0),"https://images.weserv.nl/?url="+encodeURIComponent(stripProto(src0))+"&n=-1&cb="+Date.now()];let attempt=0;const tryLoad=()=>{if(done)return;let url;if(attempt===0?url=tryUrls[attempt++]:url=fallbackUrls[attempt-1]||null,!url){clearTimeout(t),finish(null);return}const loader=new Image;loader.crossOrigin="anonymous",loader.onload=()=>{if(!done){if(!loader.naturalWidth||!loader.naturalHeight){attempt===0?tryLoad():finish(null);return}try{const cv=document.createElement("canvas");if(!cv){tryLoad();return}cv.width=loader.naturalWidth,cv.height=loader.naturalHeight;const ctx2d=cv.getContext("2d");if(!ctx2d){tryLoad();return}ctx2d.drawImage(loader,0,0);const dataUrl=(()=>{try{const testCanvas=document.createElement("canvas");return testCanvas?testCanvas.toDataURL("image/webp").startsWith("data:image/webp"):!1}catch(e){return!1}})()?cv.toDataURL("image/webp",.75):cv.toDataURL("image/jpeg",.75);if(!dataUrl||dataUrl==="data:,"){tryLoad();return}img&&typeof img=="object"&&(img.src=dataUrl);try{if(_imgDataUrlCache[src0]||_imgDataUrlCacheOrder.push(src0),_imgDataUrlCache[src0]=dataUrl,_imgDataUrlCacheOrder.length>1e3){const drop=_imgDataUrlCacheOrder.shift();drop&&delete _imgDataUrlCache[drop]}}catch(e){}clearTimeout(t),finish(dataUrl)}catch(e){tryLoad()}}},loader.onerror=()=>{tryLoad()},loader.src=url};tryLoad()})}async function worker(){for(;;){const i=idx++;if(i>=imgs.length)break;try{await convertOne(imgs[i])}catch(e){}if(doneCount++,typeof onProgress=="function")try{onProgress(doneCount,imgs.length)}catch(e){}}}const workers=Array.from({length:Math.min(maxConcurrent,imgs.length)},()=>worker());await Promise.all(workers)}async function _precacheImgDataUrl(src0,timeoutMs){const key=String(src0||"");if(!key)return!1;if(_imgDataUrlCache[key]&&String(_imgDataUrlCache[key]).startsWith("data:image/"))return!0;if(_imgDataUrlInflight[key])return await _imgDataUrlInflight[key];const stripProto=u=>String(u||"").replace(/^https?:\/\//i,""),withCacheBust=u=>{const s=String(u||"");return s+(s.includes("?")?"&":"?")+"_x="+Date.now()},p=new Promise(resolve=>{let src=key;try{if(typeof toHttpsUrl=="function"){const s2=toHttpsUrl(src);s2&&(src=s2)}}catch(e){}if(_imgDataUrlCache[src]&&String(_imgDataUrlCache[src]).startsWith("data:image/")){resolve(!0);return}const tryUrls=[];tryUrls.push(withCacheBust(src)),tryUrls.push("https://images.weserv.nl/?url="+encodeURIComponent(stripProto(src))+"&n=-1&cb="+Date.now()),tryUrls.push("https://corsproxy.io/?"+encodeURIComponent(src));let attempt=0,done=!1;const finish=ok=>{done||(done=!0,resolve(!!ok))},t=setTimeout(()=>finish(!1),Math.max(1200,timeoutMs||8e3)),tryLoad=()=>{if(done)return;const url=tryUrls[attempt++];if(!url){clearTimeout(t),finish(!1);return}const loader=new Image;loader.crossOrigin="anonymous",loader.onload=()=>{if(!done){if(!loader.naturalWidth||!loader.naturalHeight){tryLoad();return}try{const cv=document.createElement("canvas");cv.width=loader.naturalWidth,cv.height=loader.naturalHeight,cv.getContext("2d").drawImage(loader,0,0);const dataUrl=(()=>{try{return document.createElement("canvas").toDataURL("image/webp").startsWith("data:image/webp")}catch(e){return!1}})()?cv.toDataURL("image/webp",.88):cv.toDataURL("image/jpeg",.88);if(!dataUrl||dataUrl==="data:,"){tryLoad();return}try{if(_imgDataUrlCache[src]||_imgDataUrlCacheOrder.push(src),_imgDataUrlCache[src]=dataUrl,_imgDataUrlCacheOrder.length>500){const drop=_imgDataUrlCacheOrder.shift();drop&&delete _imgDataUrlCache[drop]}}catch(e){}clearTimeout(t),finish(!0)}catch(e){tryLoad()}}},loader.onerror=()=>{tryLoad()},loader.src=url};tryLoad()}).finally(()=>{try{delete _imgDataUrlInflight[key]}catch(e){}});return _imgDataUrlInflight[key]=p,await p}window._precacheVisibleImages=window._precacheVisibleImages||function(container,limit){try{if(!container||!container.querySelectorAll)return;const max=Math.max(1,parseInt(limit,10)||160),urls=[],seen=new Set;if(container.querySelectorAll("img[src]").forEach(img=>{const src=img.getAttribute("src")||"";if(!src||src.startsWith("data:")||src.startsWith("blob:"))return;let s=src;try{typeof toHttpsUrl=="function"&&(s=toHttpsUrl(s)||s)}catch(e){}seen.has(s)||(seen.add(s),!(_imgDataUrlCache[s]&&String(_imgDataUrlCache[s]).startsWith("data:image/"))&&urls.push(s))}),!urls.length)return;const list=urls.slice(0,max),run=async()=>{let i=0;const worker=async()=>{for(;;){const k=i++;if(k>=list.length)break;try{await _precacheImgDataUrl(list[k],8e3)}catch(e){}}};await Promise.all(Array.from({length:Math.min(4,list.length)},()=>worker()))};if("requestIdleCallback"in window)try{window.requestIdleCallback(()=>{run()},{timeout:1200})}catch(e){setTimeout(()=>{run()},60)}else setTimeout(()=>{run()},60)}catch(e){}};async function _waitForImages(container,timeoutMs){const ms=Math.max(300,parseInt(timeoutMs,10)||900),imgs=container?[...container.querySelectorAll("img[src]")]:[];if(!imgs.length)return!0;const tasks=imgs.map(img=>{try{if(!img||typeof img!="object")return Promise.resolve(!1);if(img.complete&&img.naturalWidth>0)return Promise.resolve(!0);if(typeof img.decode=="function")return img.decode().then(()=>!0).catch(()=>!1)}catch(e){}return new Promise(resolve=>{let done=!1;const fin=ok=>{done||(done=!0,resolve(!!ok))};try{img&&typeof img=="object"?(img.addEventListener("load",()=>fin(!0),{once:!0}),img.addEventListener("error",()=>fin(!1),{once:!0})):fin(!1)}catch(e){fin(!1)}setTimeout(()=>fin(!1),ms)})});return await Promise.race([Promise.allSettled(tasks),new Promise(r=>setTimeout(r,ms))]),!0}async function _dlCanvasBoard(canvas,filename){if(!canvas||canvas.width===0||canvas.height===0)return alert("\uC774\uBBF8\uC9C0 \uC0DD\uC131 \uC2E4\uD328: \uCE94\uBC84\uC2A4\uAC00 \uBE44\uC5B4\uC788\uC2B5\uB2C8\uB2E4. \uB2E4\uC2DC \uC2DC\uB3C4\uD574\uC8FC\uC138\uC694."),!1;const pngName=filename.replace(/\.jpg$/i,".png"),showOverlay=src=>{try{const old=document.getElementById("__img_save_overlay");old&&old.remove();const ov=document.createElement("div");ov.id="__img_save_overlay",ov.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,.72);z-index:999999;display:flex;align-items:center;justify-content:center;padding:16px;";const safeName=String(pngName||"image.png").replace(/</g,"&lt;").replace(/>/g,"&gt;");ov.innerHTML=`
        <div style="width:min(980px,96vw);max-height:92vh;background:#0b1220;border-radius:var(--r2);overflow:hidden;border:1px solid rgba(255,255,255,.12);box-shadow:0 18px 60px rgba(0,0,0,.45);display:flex;flex-direction:column">
          <div style="display:flex;gap:10px;align-items:center;padding:12px 14px;background:rgba(15,23,42,.92);color:#fff">
            <div style="font-weight:900;font-size:var(--fs-base)">\uC774\uBBF8\uC9C0 \uC800\uC7A5</div>
            <div style="font-size:var(--fs-sm);opacity:.8">\uC790\uB3D9 \uB2E4\uC6B4\uB85C\uB4DC\uAC00 \uB9C9\uD614\uC2B5\uB2C8\uB2E4. PC\uB294 \uC6B0\uD074\uB9AD \uC800\uC7A5 / \uBAA8\uBC14\uC77C\uC740 \uAE38\uAC8C \uB20C\uB7EC \uC800\uC7A5</div>
            <a href="${src}" download="${safeName}" style="margin-left:auto;text-decoration:none;color:#fff;background:#2563eb;border:1px solid rgba(255,255,255,.14);border-radius:var(--r);padding:6px 10px;font-weight:900;font-size:var(--fs-sm)">\uB2E4\uC6B4\uB85C\uB4DC</a>
            <button id="__img_save_overlay_close" style="border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.06);color:#fff;border-radius:var(--r);padding:6px 10px;font-weight:900;cursor:pointer;font-size:var(--fs-sm)">\uB2EB\uAE30</button>
          </div>
          <div style="padding:12px;overflow:auto;background:#111">
            <img src="${src}" style="max-width:100%;display:block;margin:0 auto;border-radius:12px;background:#111">
          </div>
        </div>
      `,ov.addEventListener("click",e=>{e.target===ov&&ov.remove()}),document.body.appendChild(ov);const btn=document.getElementById("__img_save_overlay_close");btn&&(btn.onclick=()=>ov.remove())}catch(e){}},preWin=(()=>{try{const w=window.__captureDlWin;if(w&&!w.closed)return w}catch(e){}return null})();try{window.__captureDlWin=null}catch(e){}if(!preWin&&typeof window._saveCanvasImage=="function")return await window._saveCanvasImage(canvas,pngName,"png"),!0;const showInWindow=(src,isBlobUrl)=>{if(preWin)try{if(isBlobUrl){try{preWin.location.href=src}catch(e){}return}preWin.document.open(),preWin.document.write('<html><head><meta charset="utf-8"><title>\uC774\uBBF8\uC9C0 \uC800\uC7A5</title></head><body style="margin:0;background:#111;color:#fff;font-family:sans-serif"><div style="padding:12px;font-size:var(--fs-base)">\uC774\uBBF8\uC9C0\uAC00 \uC790\uB3D9 \uB2E4\uC6B4\uB85C\uB4DC\uB418\uC9C0 \uC54A\uC73C\uBA74, \uC544\uB798 \uC774\uBBF8\uC9C0\uB97C \uAE38\uAC8C \uB20C\uB7EC \uC800\uC7A5\uD558\uC138\uC694.</div><img src="'+src+'" style="max-width:100%;display:block;margin:0 auto"></body></html>'),preWin.document.close()}catch(e){}},tryDownload=href=>{try{const a=document.createElement("a");return a.href=href,a.download=pngName,document.body.appendChild(a),a.click(),setTimeout(()=>{try{document.body.removeChild(a)}catch(e){}},300),!0}catch(e){return!1}};return await new Promise(resolve=>{try{canvas.toBlob(blob=>{if(!blob){try{const dataUrl=canvas.toDataURL("image/png");if(!dataUrl||dataUrl==="data:,"){alert("\uC774\uBBF8\uC9C0 \uC800\uC7A5 \uC2E4\uD328: \uBE48 \uC774\uBBF8\uC9C0\uC785\uB2C8\uB2E4."),resolve(!1);return}if(!tryDownload(dataUrl)&&!preWin){let w=null;try{w=window.open(dataUrl,"_blank","noopener")}catch(e){}w||showOverlay(dataUrl)}showInWindow(dataUrl,!1),resolve(!0)}catch(e){const msg=e&&e.message?e.message:String(e||"\uC624\uB958");/insecure|security/i.test(msg)?alert(`\uC774\uBBF8\uC9C0 \uC800\uC7A5 \uC2E4\uD328: \uBCF4\uC548 \uC815\uCC45(CORS)\uC73C\uB85C \uC778\uD574 \uCE94\uBC84\uC2A4\uB97C \uC800\uC7A5\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.

\uC678\uBD80 \uC774\uBBF8\uC9C0(\uD504\uB85C\uD544/\uB85C\uACE0/\uBC30\uACBD)\uAC00 \uD3EC\uD568\uB418\uC5B4 \uC788\uC73C\uBA74 \uC800\uC7A5\uC774 \uCC28\uB2E8\uB420 \uC218 \uC788\uC2B5\uB2C8\uB2E4.`):alert("\uC774\uBBF8\uC9C0 \uC800\uC7A5 \uC2E4\uD328: "+msg),resolve(!1)}return}const url=URL.createObjectURL(blob);if(!tryDownload(url)&&!preWin){let w=null;try{w=window.open(url,"_blank","noopener")}catch(e){}w||showOverlay(url)}preWin?(showInWindow(url,!0),setTimeout(()=>{try{URL.revokeObjectURL(url)}catch(e){}},12e4)):setTimeout(()=>{try{URL.revokeObjectURL(url)}catch(e){}},800),resolve(!0)},"image/png")}catch(e){const msg=e&&e.message?e.message:String(e||"\uC624\uB958");/insecure|security/i.test(msg)?alert(`\uC774\uBBF8\uC9C0 \uC800\uC7A5 \uC2E4\uD328: \uBCF4\uC548 \uC815\uCC45(CORS)\uC73C\uB85C \uC778\uD574 \uCE94\uBC84\uC2A4\uB97C \uC800\uC7A5\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.

\uC678\uBD80 \uC774\uBBF8\uC9C0(\uD504\uB85C\uD544/\uB85C\uACE0/\uBC30\uACBD)\uAC00 \uD3EC\uD568\uB418\uC5B4 \uC788\uC73C\uBA74 \uC800\uC7A5\uC774 \uCC28\uB2E8\uB420 \uC218 \uC788\uC2B5\uB2C8\uB2E4.`):alert("\uC774\uBBF8\uC9C0 \uC800\uC7A5 \uC2E4\uD328: "+msg),resolve(!1)}})}async function _captureAndSave(tmpDiv,w,h,filename){try{await(window.ensureHtml2Canvas&&window.ensureHtml2Canvas())}catch(e){}if(typeof html2canvas!="function")throw new Error("html2canvas\uB97C \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.");try{await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))),typeof _applyBoardBgAutoSizing=="function"&&_applyBoardBgAutoSizing(tmpDiv),typeof _b2ApplyBgAutoSizing=="function"&&_b2ApplyBgAutoSizing(tmpDiv),await new Promise(r=>requestAnimationFrame(r))}catch(e){}try{const imgs=tmpDiv.querySelectorAll("img").length,t=document.getElementById("_save-toast");imgs&&t&&(t.innerHTML='<span style="display:inline-block;animation:_spin .8s linear infinite">\u23F3</span> \uC774\uBBF8\uC9C0 \uBCC0\uD658 (0/'+imgs+")")}catch(e){}await _imgToDataUrls(tmpDiv,12e3,(done,total)=>{try{const t=document.getElementById("_save-toast");t&&(t.innerHTML='<span style="display:inline-block;animation:_spin .8s linear infinite">\u23F3</span> \uC774\uBBF8\uC9C0 \uBCC0\uD658 ('+done+"/"+total+")")}catch(e){}});const wasDark=document.body.classList.contains("dark");wasDark&&document.body.classList.remove("dark");try{const t=document.getElementById("_save-toast");t&&(t.innerHTML='<span style="display:inline-block;animation:_spin .8s linear infinite">\u23F3</span> \uCEA1\uCC98 \uC911...');try{await _waitForImages(tmpDiv,1500)}catch(e){}const bg=(()=>{try{const c=window.getComputedStyle?getComputedStyle(tmpDiv).backgroundColor:"";if(c&&c!=="transparent"&&c!=="rgba(0, 0, 0, 0)")return c}catch(e){}return"#f0f2f5"})(),makeOnClone=aggressive=>function(clonedDoc){try{if(clonedDoc&&clonedDoc.adoptedStyleSheets&&clonedDoc.adoptedStyleSheets.length)try{clonedDoc.adoptedStyleSheets=[]}catch(e){}}catch(e){}if(aggressive){try{clonedDoc.querySelectorAll("svg").forEach(el=>el.remove())}catch(e){}try{clonedDoc.querySelectorAll("img").forEach(img=>{try{const src=String(img.getAttribute("src")||img.src||"");if(!src)return;(src.includes("data:image/svg+xml")||/\.svg(\?|#|$)/i.test(src))&&(img.style.display="none")}catch(e){}})}catch(e){}try{clonedDoc.querySelectorAll('[style*="background-image"]').forEach(el=>{try{const bi=String(el.style&&el.style.backgroundImage?el.style.backgroundImage:"");bi&&bi.includes("url(")&&!bi.includes("data:image/")&&(el.style.backgroundImage="none")}catch(e){}})}catch(e){}}},baseOpts={scale:1,backgroundColor:bg,logging:!1,imageTimeout:2e4,width:w,height:h,windowWidth:w+100,windowHeight:h+100,x:0,y:0,scrollX:0,scrollY:0},isWaterfox=/waterfox/i.test(navigator.userAgent),isFirefox=/firefox/i.test(navigator.userAgent),attempts=[{useCORS:!0,allowTaint:!1,foreignObjectRendering:!1,onclone:makeOnClone(!1)},{useCORS:!0,allowTaint:!1,foreignObjectRendering:!0,onclone:makeOnClone(!1)},{useCORS:!0,allowTaint:!1,foreignObjectRendering:!1,onclone:makeOnClone(!0),ignoreElements:el=>el&&el.tagName&&el.tagName.toLowerCase()==="svg"},...isWaterfox||isFirefox?[{useCORS:!0,allowTaint:!1,foreignObjectRendering:!1,onclone:makeOnClone(!0),ignoreElements:el=>{if(!el||!el.tagName)return!1;const tag=el.tagName.toLowerCase();if(tag==="svg")return!0;if(tag==="img")try{const src=String(el.getAttribute("src")||el.src||"");if(src&&src.includes("://")&&!src.includes(window.location.hostname)&&!src.startsWith("data:"))return!0}catch(e){}return!!(el.style&&el.style.backgroundImage&&String(el.style.backgroundImage).includes("url(")&&!String(el.style.backgroundImage).includes("data:image/"))}}]:[]];let canvas=null,lastErr=null;for(const opt of attempts)try{if(canvas=await html2canvas(tmpDiv,__spreadValues(__spreadValues({},baseOpts),opt)),canvas&&canvas.width>0&&canvas.height>0){lastErr=null;break}lastErr=new Error("\uCE94\uBC84\uC2A4 \uC0DD\uC131 \uC2E4\uD328")}catch(e){lastErr=e;const msg=_captureErrText(e);if(msg.includes(`can't access property "type"`)||msg.includes("can't access property 'type'")||msg==="[object Event]"||msg.startsWith("\uC774\uBCA4\uD2B8 \uC624\uB958("))continue;break}if(lastErr)throw new Error(_captureErrText(lastErr));if(!canvas||canvas.width===0||canvas.height===0)throw new Error("\uCE94\uBC84\uC2A4 \uC0DD\uC131 \uC2E4\uD328");let ok=await _dlCanvasBoard(canvas,filename);if(!ok){try{tmpDiv.querySelectorAll("img").forEach(img=>{try{const src=String(img.getAttribute("src")||img.src||"");if(!src)return;const host=String(window.location.hostname||"");src.startsWith("data:")||src.startsWith("blob:")||host&&src.includes(host)||(img.style.display="none")}catch(e){}}),tmpDiv.querySelectorAll('[style*="background-image"]').forEach(el=>{try{const bi=String(el.style&&el.style.backgroundImage?el.style.backgroundImage:"");bi&&bi.includes("url(")&&!bi.includes("data:image/")&&(el.style.backgroundImage="none")}catch(e){}})}catch(e){}const canvas2=await html2canvas(tmpDiv,__spreadProps(__spreadValues({},baseOpts),{useCORS:!0,allowTaint:!1,foreignObjectRendering:!1,onclone:makeOnClone(!0)}));if(!canvas2||canvas2.width===0||canvas2.height===0)throw new Error("\uCE94\uBC84\uC2A4 \uC0DD\uC131 \uC2E4\uD328");if(ok=await _dlCanvasBoard(canvas2,filename),!ok)throw new Error("\uC774\uBBF8\uC9C0 \uC800\uC7A5 \uC2E4\uD328")}}finally{wasDark&&document.body.classList.add("dark")}}async function downloadBoardAll(){const btn=event==null?void 0:event.currentTarget;btn&&(btn.disabled=!0,btn._ot=btn.textContent,btn.textContent="\u23F3...");const tmpDiv=document.createElement("div");try{try{await(window.ensureHtml2Canvas&&window.ensureHtml2Canvas())}catch(e){}if(typeof html2canvas!="function")throw new Error("html2canvas\uB97C \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.");const boardWrap=document.getElementById("board-wrap");if(!boardWrap||!boardWrap.children.length){alert("\uD45C\uC2DC \uC911\uC778 \uD604\uD669\uD310\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.");return}const bw=boardWrap.scrollWidth||900;tmpDiv.style.cssText=`position:absolute;left:-9999px;top:0;width:${bw}px;background:#f0f2f5;font-family:'Noto Sans KR',sans-serif;box-sizing:border-box;`;const rcont=document.getElementById("rcont"),brdStyle=rcont?rcont.querySelector("style"):null;tmpDiv.innerHTML=(brdStyle?brdStyle.outerHTML:"")+boardWrap.innerHTML,tmpDiv.querySelectorAll(".no-export,.no-export-movebtns").forEach(el=>el.remove()),tmpDiv.querySelectorAll(".brd-card").forEach(card=>{const uObj=univCfg.find(x=>x.name===card.dataset.univ);uObj&&uObj.hidden&&card.remove()}),document.body.appendChild(tmpDiv),await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))),await _imgToDataUrls(tmpDiv,12e3);const wasDark=document.body.classList.contains("dark");wasDark&&document.body.classList.remove("dark");try{const w=tmpDiv.scrollWidth||bw,h=Math.max(tmpDiv.scrollHeight,tmpDiv.offsetHeight,200),canvas=await html2canvas(tmpDiv,{scale:1,useCORS:!0,allowTaint:!1,backgroundColor:"#f0f2f5",logging:!1,imageTimeout:2e4,width:w,height:h,windowWidth:w+200,windowHeight:h+200});if(!canvas||canvas.width===0||canvas.height===0)throw new Error("\uCE94\uBC84\uC2A4 \uC0DD\uC131 \uC2E4\uD328");await _dlCanvasBoard(canvas,"\uD604\uD669\uD310_\uC804\uCCB4\uC800\uC7A5.png")}finally{wasDark&&document.body.classList.add("dark")}}catch(e){alert("\uB2E4\uC6B4\uB85C\uB4DC \uC2E4\uD328: "+e.message)}finally{tmpDiv.parentNode&&document.body.removeChild(tmpDiv),btn&&(btn.disabled=!1,btn.textContent=btn._ot||btn.textContent)}}

/* cloud-board-rank-sync.js */
var __defProp=Object.defineProperty,__defProps=Object.defineProperties;var __getOwnPropDescs=Object.getOwnPropertyDescriptors;var __getOwnPropSymbols=Object.getOwnPropertySymbols;var __hasOwnProp=Object.prototype.hasOwnProperty,__propIsEnum=Object.prototype.propertyIsEnumerable;var __defNormalProp=(obj,key,value)=>key in obj?__defProp(obj,key,{enumerable:!0,configurable:!0,writable:!0,value}):obj[key]=value,__spreadValues=(a,b)=>{for(var prop in b||(b={}))__hasOwnProp.call(b,prop)&&__defNormalProp(a,prop,b[prop]);if(__getOwnPropSymbols)for(var prop of __getOwnPropSymbols(b))__propIsEnum.call(b,prop)&&__defNormalProp(a,prop,b[prop]);return a},__spreadProps=(a,b)=>__defProps(a,__getOwnPropDescs(b));function buildBoardRankViewHTML(univs){const univNames=new Set(univs.map(u=>u.name)),allPlayers=(players||[]).filter(p=>p.univ&&univNames.has(p.univ)&&(p.win||0)+(p.loss||0)>0).map(p=>__spreadProps(__spreadValues({},p),{_univ:p.univ,_col:gc(p.univ)}));if(allPlayers.sort((a,b)=>(b.points||0)-(a.points||0)),!allPlayers.length)return'<div style="padding:40px;text-align:center;color:var(--gray-l)">\uC2A4\uD2B8\uB9AC\uBA38 \uC5C6\uC74C</div>';const TIER_ICONS={G:"\u{1F451}",K:"\u{1F31F}",JA:"\u26A1",J:"\u{1F525}",S:"\u{1F48E}","0\uD2F0\uC5B4":"\u2B50","1\uD2F0\uC5B4":"\u{1F947}","2\uD2F0\uC5B4":"\u{1F948}","3\uD2F0\uC5B4":"\u{1F949}"};let h=`<div style="background:var(--white);border-radius:14px;border:1px solid var(--border);overflow:hidden">
    <div style="padding:14px 18px;font-weight:900;font-size:var(--fs-md);color:var(--blue);border-bottom:2px solid var(--blue-ll)">\u{1F3C5} \uD3EC\uC778\uD2B8 \uC21C \uC804\uCCB4 \uB7AD\uD0B9</div>
    <table style="width:100%;border-collapse:collapse">
      <thead><tr style="background:var(--bg2)">
        <th style="padding:8px 12px;text-align:center;font-size:var(--fs-sm);color:var(--text3)">\uC21C\uC704</th>
        <th style="padding:8px 12px;text-align:left;font-size:var(--fs-sm);color:var(--text3)">\uC120\uC218</th>
        <th style="padding:8px 12px;text-align:left;font-size:var(--fs-sm);color:var(--text3)">\uB300\uD559</th>
        <th style="padding:8px 12px;text-align:center;font-size:var(--fs-sm);color:var(--text3)">\uD2F0\uC5B4</th>
        <th style="padding:8px 12px;text-align:center;font-size:var(--fs-sm);color:var(--text3)">\uC2B9</th>
        <th style="padding:8px 12px;text-align:center;font-size:var(--fs-sm);color:var(--text3)">\uD328</th>
        <th style="padding:8px 12px;text-align:center;font-size:var(--fs-sm);color:var(--text3)">\uD3EC\uC778\uD2B8</th>
      </tr></thead><tbody>`;return allPlayers.forEach((p,i)=>{const tierIcon=TIER_ICONS[p.tier]||"",rnk=i===0?'<span class="rk1">1</span>':i===1?'<span class="rk2">2</span>':i===2?'<span class="rk3">3</span>':`<span style="font-weight:700">${i+1}</span>`,pts=p.points||0,ptsCol=pts>0?"#16a34a":pts<0?"#dc2626":"#64748b",pNameJs=typeof escJS=="function"?escJS(p.name):String(p.name||"").replace(/\\/g,"\\\\").replace(/'/g,"\\'").replace(/\r/g,"\\r").replace(/\n/g,"\\n"),univNameJs=typeof escJS=="function"?escJS(p._univ):String(p._univ||"").replace(/\\/g,"\\\\").replace(/'/g,"\\'").replace(/\r/g,"\\r").replace(/\n/g,"\\n");h+=`<tr style="border-top:1px solid var(--border)">
      <td style="padding:7px 12px;text-align:center">${rnk}</td>
      <td style="padding:7px 12px;text-align:left">
        <div style="display:flex;align-items:center;gap:6px;cursor:pointer" onclick="openPlayerModal('${pNameJs}')">
          ${getPlayerPhotoHTML(p.name,"24px")}
          <span style="font-weight:700;font-size:var(--fs-base)">${p.name||""}</span>
        </div>
      </td>
      <td style="padding:7px 12px">
        <span class="ubadge clickable-univ" style="background:${p._col};font-size:10px;padding:2px 7px" onclick="openUnivModal('${univNameJs}')">${p._univ||""}</span>
      </td>
      <td style="padding:7px 12px;text-align:center;font-size:var(--fs-sm)">${tierIcon}${p.tier||""}</td>
      <td style="padding:7px 12px;text-align:center;color:#16a34a;font-weight:700">${p.win||0}</td>
      <td style="padding:7px 12px;text-align:center;color:#dc2626;font-weight:700">${p.loss||0}</td>
      <td style="padding:7px 12px;text-align:center;font-weight:900;font-size:14px;color:${ptsCol}">${pts>0?"+":""}${pts}</td>
    </tr>`}),h+="</tbody></table></div>",h}async function downloadBoardSel(){const btn=event==null?void 0:event.currentTarget;btn&&(btn.disabled=!0,btn._ot=btn.textContent,btn.textContent="\u23F3...");const tmpDiv=document.createElement("div");try{if(!boardSelUniv||boardSelUniv==="\uC804\uCCB4"){alert("\uB300\uD559\uC744 \uC120\uD0DD\uD558\uC138\uC694.");return}const u=getAllUnivs().find(x=>x.name===boardSelUniv);if(!u){alert("\uD574\uB2F9 \uB300\uD559\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.");return}const boardWrap=document.getElementById("board-wrap");if(boardWrap){const card=_findBrdCardByUniv(boardSelUniv,boardWrap);if(card){const domOrder=[...card.querySelectorAll("[data-player]")].map(el=>el.dataset.player).filter(Boolean);domOrder.length>0&&(boardPlayerOrder[boardSelUniv]=domOrder)}}tmpDiv.style.cssText="position:absolute;left:-9999px;top:0;width:900px;background:#f0f2f5;padding:12px;font-family:'Noto Sans KR',sans-serif;box-sizing:border-box;";const rcontSel=document.getElementById("rcont"),brdStyleSel=rcontSel?rcontSel.querySelector("style"):null;tmpDiv.innerHTML=(brdStyleSel?brdStyleSel.outerHTML:"")+buildUnivBoardCard(u,!0),tmpDiv.querySelectorAll(".no-export,.no-export-movebtns").forEach(el=>el.remove()),document.body.appendChild(tmpDiv),injectUnivIcons(tmpDiv),await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))),tmpDiv.getBoundingClientRect();const selW=tmpDiv.offsetWidth||900,selH=Math.max(tmpDiv.scrollHeight,tmpDiv.offsetHeight,100);await _captureAndSave(tmpDiv,selW,selH,"\uD604\uD669\uD310_"+boardSelUniv+".png")}catch(e){alert("\uB2E4\uC6B4\uB85C\uB4DC \uC2E4\uD328: "+e.message)}finally{tmpDiv.parentNode&&document.body.removeChild(tmpDiv),btn&&(btn.disabled=!1,btn.textContent=btn._ot||btn.textContent)}}let _autoSyncTimer=null,_lastRemoteSavedAt=0;async function _checkRemoteSavedAt(){try{const urls=[GITHUB_JSON_URL+"?_="+Date.now(),"https://cdn.jsdelivr.net/gh/nada1004/star-system@main/star-datacenter/data.json?_="+Date.now()];for(const url of urls)try{const res=await fetch(url,{cache:"no-store",mode:"cors",signal:AbortSignal.timeout(8e3)});if(!res.ok)continue;const text=(await res.text()).replace(/^\uFEFF/,"").trim(),raw=JSON.parse(text);return Number(raw&&raw.savedAt||0)||0}catch(e){continue}}catch(e){}return 0}function _autoSyncShouldDefer(){try{const active=document.activeElement;if(active&&(active.tagName==="INPUT"||active.tagName==="TEXTAREA"||active.isContentEditable)||Array.from(document.querySelectorAll('.modal,[id$="Modal"],[id$="modal"]')).find(el=>{const st=window.getComputedStyle(el);return st.display!=="none"&&st.visibility!=="hidden"}))return!0}catch(e){}return!1}async function _autoSyncCheck(){if(_boardCanManage()&&!window._isSaving)try{const remoteAt=await _checkRemoteSavedAt();if(!remoteAt)return;_lastRemoteSavedAt=remoteAt;const localSavedAt=Math.max(Number(window._lastAdminSaveTime||0)||0,Number(localStorage.getItem("su_last_admin_save")||0)||0,Number(window._lastAppliedSavedAt||0)||0);if(remoteAt>localSavedAt+3e3){if(_autoSyncShouldDefer()){console.log("[autoSync] \uBAA8\uB2EC/\uC785\uB825 \uC911 - \uC774\uBC88 \uC8FC\uAE30\uB294 \uBCF4\uB958 (\uB2E4\uC74C 30\uCD08\uC5D0 \uC7AC\uC2DC\uB3C4)");return}if(console.log("[autoSync] \uC6D0\uACA9\uC5D0 \uC0C8 \uB370\uC774\uD130 \uAC10\uC9C0 - \uC790\uB3D9 \uB3D9\uAE30\uD654 \uC2DC\uC791"),typeof window._autoSyncApply=="function")try{await window._autoSyncApply(),console.log("[autoSync] \uC790\uB3D9 \uB3D9\uAE30\uD654 \uC644\uB8CC"),typeof showToast=="function"&&showToast("\u2705 \uB2E4\uB978 \uAE30\uAE30\uC758 \uBCC0\uACBD \uC0AC\uD56D\uC774 \uC790\uB3D9\uC73C\uB85C \uB3D9\uAE30\uD654\uB418\uC5C8\uC2B5\uB2C8\uB2E4.",3e3)}catch(e){console.error("[autoSync] \uC790\uB3D9 \uB3D9\uAE30\uD654 \uC2E4\uD328:",e);const statusEl=document.getElementById("cloudStatus");statusEl&&(statusEl.style.color="#2563eb",statusEl.innerHTML='\u{1F504} GitHub\uC5D0 \uC0C8 \uB370\uC774\uD130 \uC788\uC74C <button onclick="window.cloudLoad()" style="margin-left:6px;padding:2px 8px;border:1px solid #2563eb;border-radius:4px;background:#eff6ff;color:#2563eb;font-size:var(--fs-caption);cursor:pointer">\uBD88\uB7EC\uC624\uAE30</button>')}}}catch(e){console.warn("[autoSync] \uCCB4\uD06C \uC2E4\uD328:",e)}}(function(){const _onVisible=()=>{try{typeof _autoSyncCheck=="function"&&_autoSyncCheck()}catch(e){}};document.addEventListener("visibilitychange",()=>{document.visibilityState==="visible"&&_onVisible()}),window.addEventListener("focus",_onVisible)})();function startAutoSync(){_autoSyncTimer&&clearInterval(_autoSyncTimer),_autoSyncTimer=setInterval(_autoSyncCheck,30*1e3),console.log("[autoSync] \uC790\uB3D9 \uB3D9\uAE30\uD654 \uC2DC\uC791 (30\uCD08 \uAC04\uACA9)")}function stopAutoSync(){_autoSyncTimer&&(clearInterval(_autoSyncTimer),_autoSyncTimer=null,console.log("[autoSync] \uC790\uB3D9 \uB3D9\uAE30\uD654 \uC911\uC9C0"))}window.addEventListener("DOMContentLoaded",()=>{setTimeout(()=>{typeof isLoggedIn!="undefined"&&isLoggedIn&&(startAutoSync(),setTimeout(_autoSyncCheck,5e3));const _origSave=window.fbCloudSave;_origSave&&(window.fbCloudSave=async function(...args){const result=await _origSave.apply(this,args);return setTimeout(_autoSyncCheck,3e4),result})},2e3)},{once:!0});

/* board2-image-utils.js */
var __defProp=Object.defineProperty;var __getOwnPropSymbols=Object.getOwnPropertySymbols;var __hasOwnProp=Object.prototype.hasOwnProperty,__propIsEnum=Object.prototype.propertyIsEnumerable;var __defNormalProp=(obj,key,value)=>key in obj?__defProp(obj,key,{enumerable:!0,configurable:!0,writable:!0,value}):obj[key]=value,__spreadValues=(a,b)=>{for(var prop in b||(b={}))__hasOwnProp.call(b,prop)&&__defNormalProp(a,prop,b[prop]);if(__getOwnPropSymbols)for(var prop of __getOwnPropSymbols(b))__propIsEnum.call(b,prop)&&__defNormalProp(a,prop,b[prop]);return a};let _b2GlobalImgSettings=JSON.parse(localStorage.getItem("su_b2_global_img_settings")||"{}");const _b2ImgMetaCache={};let _b2ImgSettingsSaveTimer=null,_b2ImgSettingsSavePending=!1;function _b2FlushImgSettingsSave(){_b2ImgSettingsSaveTimer&&(clearTimeout(_b2ImgSettingsSaveTimer),_b2ImgSettingsSaveTimer=null),_b2ImgSettingsSavePending&&(_b2ImgSettingsSavePending=!1,typeof save=="function"&&typeof isLoggedIn!="undefined"&&isLoggedIn&&save())}function _b2CancelImgSettingsSave(){_b2ImgSettingsSaveTimer&&(clearTimeout(_b2ImgSettingsSaveTimer),_b2ImgSettingsSaveTimer=null),_b2ImgSettingsSavePending=!1}function _b2ScheduleImgSettingsSave(){typeof save=="function"&&typeof isLoggedIn!="undefined"&&isLoggedIn&&(_b2ImgSettingsSavePending=!0,_b2ImgSettingsSaveTimer&&clearTimeout(_b2ImgSettingsSaveTimer),_b2ImgSettingsSaveTimer=setTimeout(()=>{_b2FlushImgSettingsSave()},800))}try{window._b2FlushImgSettingsSave=_b2FlushImgSettingsSave}catch(e){}try{window._b2CancelImgSettingsSave=_b2CancelImgSettingsSave}catch(e){}try{document.addEventListener("visibilitychange",()=>{document.visibilityState==="hidden"&&_b2CancelImgSettingsSave()}),window.addEventListener("beforeunload",_b2CancelImgSettingsSave)}catch(e){}function _b2DeviceKey(){const w=Math.max(320,Math.min(1920,window.innerWidth||1024));return w<=768?"mb":w<=1024?"tb":"pc"}function _b2EnsureDeviceImgSettings(){try{(!_b2GlobalImgSettings||typeof _b2GlobalImgSettings!="object")&&(_b2GlobalImgSettings={});const defaults={primary:_b2DefaultSingleImgSettings(),secondary:_b2DefaultSingleImgSettings()};if(!_b2GlobalImgSettings.__byDevice||typeof _b2GlobalImgSettings.__byDevice!="object"){const legacyPrimary=_b2GlobalImgSettings.primary&&typeof _b2GlobalImgSettings.primary=="object"?__spreadValues(__spreadValues({},defaults.primary),_b2GlobalImgSettings.primary):__spreadValues({},defaults.primary),legacySecondary=_b2GlobalImgSettings.secondary&&typeof _b2GlobalImgSettings.secondary=="object"?__spreadValues(__spreadValues({},defaults.secondary),_b2GlobalImgSettings.secondary):__spreadValues({},defaults.secondary);_b2GlobalImgSettings.__byDevice={pc:{primary:__spreadValues({},legacyPrimary),secondary:__spreadValues({},legacySecondary)},tb:{primary:__spreadValues({},legacyPrimary),secondary:__spreadValues({},legacySecondary)},mb:{primary:__spreadValues({},legacyPrimary),secondary:__spreadValues({},legacySecondary)}}}const dk=_b2DeviceKey();(!_b2GlobalImgSettings.__byDevice[dk]||typeof _b2GlobalImgSettings.__byDevice[dk]!="object")&&(_b2GlobalImgSettings.__byDevice[dk]={primary:_b2DefaultSingleImgSettings(),secondary:_b2DefaultSingleImgSettings()}),["primary","secondary"].forEach(slot=>{(!_b2GlobalImgSettings.__byDevice[dk][slot]||typeof _b2GlobalImgSettings.__byDevice[dk][slot]!="object")&&(_b2GlobalImgSettings.__byDevice[dk][slot]=_b2DefaultSingleImgSettings())})}catch(e){}}function _b2SaveImgSettings(){_b2EnsureDeviceImgSettings(),localStorage.setItem("su_b2_global_img_settings",JSON.stringify(_b2GlobalImgSettings)),_b2ScheduleImgSettingsSave()}function _b2DefaultSingleImgSettings(){return{scale:100,brightness:100,fit:"cover",autoAdjust:!0,manualCenter:!1,offsetX:0,offsetY:0,zoom:100,fill:"cover",posX:0,posY:0}}function _b2GetImgSettings(playerName,slot){_b2EnsureDeviceImgSettings();const dk=_b2DeviceKey(),key=slot==="secondary"?"secondary":"primary";_b2GlobalImgSettings.__byDevice[dk][key]||(_b2GlobalImgSettings.__byDevice[dk][key]=_b2DefaultSingleImgSettings());try{const s=_b2GlobalImgSettings.__byDevice[dk][key];s&&typeof s=="object"&&(s.autoAdjust==null&&(s.autoAdjust=!0),s.fit==null&&typeof s.fill=="string"&&(s.fit=s.fill),s.scale==null&&s.zoom!=null&&(s.scale=s.zoom),s.offsetX==null&&s.posX!=null&&(s.offsetX=s.posX),s.offsetY==null&&s.posY!=null&&(s.offsetY=s.posY))}catch(e){console.warn("[_b2LoadSingleImgSettings] \uB808\uAC70\uC2DC \uC124\uC815 \uBCF4\uC815 \uC2E4\uD328:",e.message)}return _b2GlobalImgSettings.__byDevice[dk][key].zoom=_b2GlobalImgSettings.__byDevice[dk][key].scale,_b2GlobalImgSettings.__byDevice[dk][key].fill=_b2GlobalImgSettings.__byDevice[dk][key].fit,_b2GlobalImgSettings.__byDevice[dk][key].posX=_b2GlobalImgSettings.__byDevice[dk][key].offsetX,_b2GlobalImgSettings.__byDevice[dk][key].posY=_b2GlobalImgSettings.__byDevice[dk][key].offsetY,_b2GlobalImgSettings.__byDevice[dk][key]}function _b2SetImgSetting(playerName,slot,key,val){val===void 0&&(val=key,key=slot,slot="primary");const s=_b2GetImgSettings(playerName,slot);s[key]=val,_b2SaveImgSettings()}window._b2ResetImgSettings=function(playerName,slot){_b2EnsureDeviceImgSettings();const dk=_b2DeviceKey();(slot==="primary"||slot==="secondary")&&(_b2GlobalImgSettings.__byDevice[dk][slot]=_b2DefaultSingleImgSettings(),_b2SaveImgSettings())};function _b2GetImgDomId(slot){return slot==="secondary"?"b2-main-img-2":"b2-main-img-1"}function _b2GetImgControlPrefix(slot){return slot==="secondary"?"b2-secondary":"b2-primary"}function _b2GetImgTransform(settings){return`translate(${settings.offsetX||0}px, ${settings.offsetY||0}px) scale(${(settings.scale||100)/100})`}function _b2LoadImgMeta(src,cb){try{const url=toHttpsUrl(src||"");if(!url){cb&&cb(null);return}if(_b2ImgMetaCache[url]&&_b2ImgMetaCache[url].w&&_b2ImgMetaCache[url].h){cb&&cb(_b2ImgMetaCache[url]);return}const img=new Image;img.onload=function(){_b2ImgMetaCache[url]={w:img.naturalWidth||0,h:img.naturalHeight||0},cb&&cb(_b2ImgMetaCache[url])},img.onerror=function(){cb&&cb(null)},img.src=url}catch(e){cb&&cb(null)}}function _b2ResolveAutoFit(rect,meta){const vw=window.innerWidth||1280;if(!rect||!rect.width||!rect.height)return vw<=900?"contain":"cover";if(!meta||!meta.w||!meta.h)return vw<=640?"contain":"cover";const boxRatio=rect.width/rect.height,imgRatio=meta.w/meta.h,diff=Math.abs(Math.log(imgRatio/boxRatio));return vw<=640?diff>.28?"contain":"cover":vw<=1024?diff>.3?"contain":"cover":imgRatio>1.75||imgRatio<.64||diff>.36?"contain":"cover"}function _b2ResolveAutoPosition(rect,meta,fit){if(fit!=="cover")return"center center";const imgRatio=meta&&meta.w&&meta.h?meta.w/meta.h:1,boxRatio=rect&&rect.width&&rect.height?rect.width/rect.height:1;return!imgRatio||!boxRatio?"center center":boxRatio/imgRatio>1.5?"top center":"center center"}function _b2IsAutoFitEligible(settings){var _a,_b,_c,_d,_e,_f;if(!settings)return!0;if(settings.autoAdjust===!1)return!1;const fit=String(settings.fit||settings.fill||"cover"),scale=Number((_b=(_a=settings.scale)!=null?_a:settings.zoom)!=null?_b:100)||100,ox=Number((_d=(_c=settings.offsetX)!=null?_c:settings.posX)!=null?_d:0)||0,oy=Number((_f=(_e=settings.offsetY)!=null?_e:settings.posY)!=null?_f:0)||0;return!settings.manualCenter&&fit==="cover"&&scale===100&&ox===0&&oy===0}function _b2ApplyImgSettingsToElement(el,settings){if(!(!el||!settings)&&(el.style.objectFit=settings.fit||"contain",el.style.objectPosition=settings.manualCenter?"center center":"center",el.style.filter=`brightness(${(settings.brightness||100)/100})`,el.style.transform=_b2GetImgTransform(settings),_b2IsAutoFitEligible(settings))){const rect=el.getBoundingClientRect?el.getBoundingClientRect():null;_b2LoadImgMeta(el.currentSrc||el.getAttribute("src")||"",meta=>{try{const resolved=_b2ResolveAutoFit(rect,meta);el.style.objectFit=resolved,el.style.objectPosition=_b2ResolveAutoPosition(rect,meta,resolved),el.setAttribute("data-b2-fit-resolved",resolved)}catch(e){}})}}function _b2ApplyImgSettingsToDom(playerName,slot){_b2ApplyImgSettingsToElement(document.getElementById(_b2GetImgDomId(slot)),_b2GetImgSettings(playerName,slot))}function _b2PreviewImgSetting(playerName,slot,key,val){try{key={zoom:"scale",fill:"fit",posX:"offsetX",posY:"offsetY"}[key]||key;const s=_b2GetImgSettings(playerName,slot),prev=s[key],numVal=parseInt(val,10);s[key]=isNaN(numVal)?val:numVal,s.zoom=s.scale,s.fill=s.fit,s.posX=s.offsetX,s.posY=s.offsetY,_b2ApplyImgSettingsToDom(playerName,slot),s[key]=prev,s.zoom=s.scale,s.fill=s.fit,s.posX=s.offsetX,s.posY=s.offsetY}catch(e){}}function _b2CenterImageCfg(playerName,slot){const s=_b2GetImgSettings(playerName,slot);s.autoAdjust=!1,s.manualCenter=!0,s.offsetX=0,s.offsetY=0,s.posX=0,s.posY=0,_b2SaveImgSettings();try{_b2ApplyImgSettingsToDom(playerName,slot),typeof window._b2RefreshImageControls=="function"&&window._b2RefreshImageControls(playerName,slot)}catch(e){}typeof _renderCfgImgSettings=="function"&&_renderCfgImgSettings(playerName)}function _b2ApplySettingsToAll(refPlayerName,slot){const settings=_b2GetImgSettings(refPlayerName,slot);_b2SaveImgSettings(),alert(`\uC774\uBBF8\uC9C0 ${slot==="primary"?"1":"2"} \uC124\uC815\uC774 \uBAA8\uB4E0 \uC120\uC218\uC5D0\uAC8C \uC801\uC6A9\uB418\uC5C8\uC2B5\uB2C8\uB2E4. (\uD06C\uAE30: ${settings.scale}%, \uBC1D\uAE30: ${settings.brightness}%, \uBC30\uCE58: ${settings.fit})`),typeof _renderCfgImgSettings=="function"&&_renderCfgImgSettings(refPlayerName)}function _renderCfgImgSettings(playerName){const area=document.getElementById("cfg-img-settings-area");if(!playerName){area&&(area.style.display="none");return}area&&(area.style.display="block");const player=players.find(p=>p.name===playerName),hasPrimary=!!(player&&player.photo),hasSecondary=!!(player&&player.secondProfileFile),primarySettings=_b2GetImgSettings(playerName,"primary"),secondarySettings=_b2GetImgSettings(playerName,"secondary"),safeName=playerName.replace(/'/g,"\\'"),primaryDiv=document.getElementById("cfg-img-primary-controls"),secondaryDiv=document.getElementById("cfg-img-secondary-controls");primaryDiv&&(primaryDiv.innerHTML=hasPrimary?`
      <div style="margin-bottom:10px">
        <div style="font-size:var(--fs-sm);margin-bottom:4px">\uD06C\uAE30: <span id="cfg-p-scale">${primarySettings.scale}%</span></div>
        <input type="range" min="50" max="220" value="${primarySettings.scale}" style="width:100%" oninput="_b2UpdateImgSetting('${safeName}','primary','scale',this.value);document.getElementById('cfg-p-scale').textContent=this.value+'%'">
      </div>
      <div style="margin-bottom:10px">
        <div style="font-size:var(--fs-sm);margin-bottom:4px">\uBC1D\uAE30: <span id="cfg-p-bright">${primarySettings.brightness}%</span></div>
        <input type="range" min="20" max="180" value="${primarySettings.brightness}" style="width:100%" oninput="_b2UpdateImgSetting('${safeName}','primary','brightness',this.value);document.getElementById('cfg-p-bright').textContent=this.value+'%'">
      </div>
      <div style="margin-bottom:10px">
        <div style="font-size:var(--fs-sm);margin-bottom:4px">\uBC30\uCE58</div>
        <div style="display:flex;gap:4px;flex-wrap:wrap">
          <button class="btn btn-xs ${primarySettings.fit==="cover"?"btn-b":"btn-w"}" onclick="_b2UpdateImgSetting('${safeName}','primary','fit','cover');_renderCfgImgSettings('${safeName}')">\uCC44\uC6B0\uAE30</button>
          <button class="btn btn-xs ${primarySettings.fit==="contain"?"btn-b":"btn-w"}" onclick="_b2UpdateImgSetting('${safeName}','primary','fit','contain');_renderCfgImgSettings('${safeName}')">\uB9DE\uCDA4</button>
          <button class="btn btn-xs ${primarySettings.fit==="fill"?"btn-b":"btn-w"}" onclick="_b2UpdateImgSetting('${safeName}','primary','fit','fill');_renderCfgImgSettings('${safeName}')">\uB298\uB9AC\uAE30</button>
        </div>
      </div>
      <div style="margin-bottom:10px">
        <div style="font-size:var(--fs-sm);margin-bottom:4px">\uC704\uCE58 \uC774\uB3D9</div>
        <div style="display:flex;gap:4px;flex-wrap:wrap">
          <button class="btn btn-xs btn-w" onclick="_b2MoveImg('${safeName}','primary',0,-12)">\u2191</button>
          <button class="btn btn-xs btn-w" onclick="_b2MoveImg('${safeName}','primary',0,12)">\u2193</button>
          <button class="btn btn-xs btn-w" onclick="_b2MoveImg('${safeName}','primary',-12,0)">\u2190</button>
          <button class="btn btn-xs btn-w" onclick="_b2MoveImg('${safeName}','primary',12,0)">\u2192</button>
          <button class="btn btn-xs btn-w" onclick="_b2CenterImageCfg('${safeName}','primary')">\uC911\uC559</button>
        </div>
      </div>
      <div>
        <button class="btn btn-xs btn-r" onclick="_b2ResetImgSettings('${safeName}','primary');_renderCfgImgSettings('${safeName}')">\uCD08\uAE30\uD654</button>
      </div>
    `:'<div style="color:var(--gray-l);font-size:var(--fs-sm)">\uB4F1\uB85D\uB41C \uC774\uBBF8\uC9C0 \uC5C6\uC74C</div>'),secondaryDiv&&(secondaryDiv.innerHTML=hasSecondary?`
      <div style="margin-bottom:10px">
        <div style="font-size:var(--fs-sm);margin-bottom:4px">\uD06C\uAE30: <span id="cfg-s-scale">${secondarySettings.scale}%</span></div>
        <input type="range" min="50" max="220" value="${secondarySettings.scale}" style="width:100%" oninput="_b2UpdateImgSetting('${safeName}','secondary','scale',this.value);document.getElementById('cfg-s-scale').textContent=this.value+'%'">
      </div>
      <div style="margin-bottom:10px">
        <div style="font-size:var(--fs-sm);margin-bottom:4px">\uBC1D\uAE30: <span id="cfg-s-bright">${secondarySettings.brightness}%</span></div>
        <input type="range" min="20" max="180" value="${secondarySettings.brightness}" style="width:100%" oninput="_b2UpdateImgSetting('${safeName}','secondary','brightness',this.value);document.getElementById('cfg-s-bright').textContent=this.value+'%'">
      </div>
      <div style="margin-bottom:10px">
        <div style="font-size:var(--fs-sm);margin-bottom:4px">\uBC30\uCE58</div>
        <div style="display:flex;gap:4px;flex-wrap:wrap">
          <button class="btn btn-xs ${secondarySettings.fit==="cover"?"btn-b":"btn-w"}" onclick="_b2UpdateImgSetting('${safeName}','secondary','fit','cover');_renderCfgImgSettings('${safeName}')">\uCC44\uC6B0\uAE30</button>
          <button class="btn btn-xs ${secondarySettings.fit==="contain"?"btn-b":"btn-w"}" onclick="_b2UpdateImgSetting('${safeName}','secondary','fit','contain');_renderCfgImgSettings('${safeName}')">\uB9DE\uCDA4</button>
          <button class="btn btn-xs ${secondarySettings.fit==="fill"?"btn-b":"btn-w"}" onclick="_b2UpdateImgSetting('${safeName}','secondary','fit','fill');_renderCfgImgSettings('${safeName}')">\uB298\uB9AC\uAE30</button>
        </div>
      </div>
      <div style="margin-bottom:10px">
        <div style="font-size:var(--fs-sm);margin-bottom:4px">\uC704\uCE58 \uC774\uB3D9</div>
        <div style="display:flex;gap:4px;flex-wrap:wrap">
          <button class="btn btn-xs btn-w" onclick="_b2MoveImg('${safeName}','secondary',0,-12)">\u2191</button>
          <button class="btn btn-xs btn-w" onclick="_b2MoveImg('${safeName}','secondary',0,12)">\u2193</button>
          <button class="btn btn-xs btn-w" onclick="_b2MoveImg('${safeName}','secondary',-12,0)">\u2190</button>
          <button class="btn btn-xs btn-w" onclick="_b2MoveImg('${safeName}','secondary',12,0)">\u2192</button>
          <button class="btn btn-xs btn-w" onclick="_b2CenterImageCfg('${safeName}','secondary')">\uC911\uC559</button>
        </div>
      </div>
      <div>
        <button class="btn btn-xs btn-r" onclick="_b2ResetImgSettings('${safeName}','secondary');_renderCfgImgSettings('${safeName}')">\uCD08\uAE30\uD654</button>
      </div>
    `:'<div style="color:var(--gray-l);font-size:var(--fs-sm)">\uB4F1\uB85D\uB41C \uC774\uBBF8\uC9C0 \uC5C6\uC74C</div>')}function _b2ClearSwapTimer(mainBox){mainBox&&mainBox._swapTimer&&(clearTimeout(mainBox._swapTimer),mainBox._swapTimer=null),mainBox&&(mainBox._swapIdx=0)}function _b2ScheduleImageSwap(playerName){const mainBox=document.getElementById("b2-players-main-box");if(!mainBox)return;_b2ClearSwapTimer(mainBox),mainBox._swapGen=(mainBox._swapGen||0)+1;const swapGen=mainBox._swapGen,_hasMediaUrl=v=>!!String(v||"").trim(),p=typeof players!="undefined"?players.find(x=>x.name===playerName):null,imgList=p?[{slot:1,url:p.photo},{slot:2,url:p.secondProfileFile},{slot:3,url:p.profileFile3},{slot:4,url:p.profileFile4},{slot:5,url:p.profileFile5}].filter(x=>x&&_hasMediaUrl(x.url)):[],clampSec=(v,d)=>{const n=parseFloat(v);return isNaN(n)?d:Math.max(.2,Math.min(60,n))},getEl=slot=>document.getElementById("b2-main-img-"+slot),isVideo=el=>!!(el&&el.tagName==="VIDEO"),applyMediaForSlot=slot=>{try{const el=getEl(slot);if(!isVideo(el))return{handled:!1};try{el.loop=!1}catch(e){}try{el.muted=!0}catch(e){}try{el.playsInline=!0}catch(e){}try{el.currentTime=0}catch(e){}try{el.__b2SwapDone=!1}catch(e){}try{const p2=el.play&&el.play();p2&&typeof p2.catch=="function"&&p2.catch(()=>{})}catch(e){}return{handled:!0,el}}catch(e){return{handled:!1}}},delayMs=(fromSlot,toSlot)=>{var _a,_b,_c,_d,_e,_f,_g,_h,_i,_j,_k,_l,_m;try{if(!p)return 1e3;if(toSlot===1)return Math.round(fromSlot===2?clampSec((_b=(_a=p.photoDelay21)!=null?_a:p.photoDelay51)!=null?_b:4,4)*1e3:fromSlot===3?clampSec((_d=(_c=p.photoDelay31)!=null?_c:p.photoDelay51)!=null?_d:4,4)*1e3:fromSlot===4?clampSec((_f=(_e=p.photoDelay41)!=null?_e:p.photoDelay51)!=null?_f:4,4)*1e3:fromSlot===5?clampSec((_g=p.photoDelay51)!=null?_g:4,4)*1e3:clampSec((_h=p.photoDelay51)!=null?_h:4,4)*1e3);if(fromSlot===1)return Math.round(clampSec((_i=p.photoDelay12)!=null?_i:4,4)*1e3);if(fromSlot===2)return Math.round(clampSec((_j=p.photoDelay23)!=null?_j:4,4)*1e3);if(fromSlot===3)return Math.round(clampSec((_k=p.photoDelay34)!=null?_k:4,4)*1e3);if(fromSlot===4)return Math.round(clampSec((_l=p.photoDelay45)!=null?_l:4,4)*1e3);if(fromSlot===5)return Math.round(clampSec((_m=p.photoDelay51)!=null?_m:4,4)*1e3)}catch(e){}return 1e3};if(imgList.length<2){const showSlot=imgList[0]&&imgList[0].slot?imgList[0].slot:1,_showEl=document.getElementById("b2-main-img-"+showSlot);_showEl&&(_showEl.style.opacity="1");for(let slot=1;slot<=5;slot++){if(slot===showSlot)continue;const el=document.getElementById("b2-main-img-"+slot);el&&(el.style.opacity="0")}return}const firstSlot=imgList[0].slot;for(let slot=1;slot<=5;slot++){const el=document.getElementById("b2-main-img-"+slot);el&&(el.style.opacity=slot===firstSlot?"1":"0")}try{const badge=document.getElementById("b2-cur-img-slot");badge&&(badge.textContent="\u{1F5BC}\uFE0F \uC774\uBBF8\uC9C0 "+firstSlot)}catch(e){}mainBox._swapIdx=0;const totalImgs=imgList.length;applyMediaForSlot(firstSlot);function doSwap(){const prev=mainBox._swapIdx;mainBox._swapIdx=(prev+1)%totalImgs;const cur=mainBox._swapIdx,curSlot=imgList[cur]?imgList[cur].slot:1;mainBox._swapCurSlot=curSlot;for(let slot=1;slot<=5;slot++){const el=document.getElementById("b2-main-img-"+slot);el&&(el.style.opacity=slot===curSlot?"1":"0")}try{const badge=document.getElementById("b2-cur-img-slot");badge&&(badge.textContent="\u{1F5BC}\uFE0F \uC774\uBBF8\uC9C0 "+curSlot)}catch(e){}try{for(let i=0;i<totalImgs;i++){const s=imgList[i]?imgList[i].slot:1,el=getEl(s);if(isVideo(el)&&s!==curSlot){try{el.onended=null}catch(e){}try{el.onloadedmetadata=null}catch(e){}try{el.pause&&el.pause()}catch(e){}try{el.__b2SwapDone=!1}catch(e){}}}}catch(e){}mainBox._swapTimer&&clearTimeout(mainBox._swapTimer);const next=(cur+1)%totalImgs,fromSlot=imgList[cur]?imgList[cur].slot:1,toSlot=imgList[next]?imgList[next].slot:1,media=applyMediaForSlot(curSlot);if(media.handled&&media.el)try{const el=media.el,dur=Number(el.duration);if(Number.isFinite(dur)&&dur>0){try{el.__b2SwapDone=!1}catch(e){}el.onended=()=>{try{if(mainBox._swapGen!==swapGen||mainBox._swapIdx!==cur||mainBox._swapCurSlot!==curSlot||el.__b2SwapDone)return;el.__b2SwapDone=!0}catch(e){}try{mainBox._swapTimer&&clearTimeout(mainBox._swapTimer)}catch(e){}try{doSwap()}catch(e){}};const remain=Math.max(.2,dur-Number(el.currentTime||0));mainBox._swapTimer=setTimeout(()=>{try{if(mainBox._swapGen!==swapGen||mainBox._swapIdx!==cur||mainBox._swapCurSlot!==curSlot||el.__b2SwapDone)return;el.__b2SwapDone=!0}catch(e){}doSwap()},Math.round(remain*1e3)+180);return}try{el.__b2SwapDone=!1}catch(e){}try{el.onended=()=>{try{if(mainBox._swapGen!==swapGen||mainBox._swapIdx!==cur||mainBox._swapCurSlot!==curSlot||el.__b2SwapDone)return;el.__b2SwapDone=!0}catch(e){}try{mainBox._swapTimer&&clearTimeout(mainBox._swapTimer)}catch(e){}try{doSwap()}catch(e){}}}catch(e){}try{el.onloadedmetadata=()=>{try{if(mainBox._swapGen!==swapGen||mainBox._swapIdx!==cur||mainBox._swapCurSlot!==curSlot)return;const d=Number(el.duration);if(!(Number.isFinite(d)&&d>0))return;mainBox._swapTimer&&clearTimeout(mainBox._swapTimer),mainBox._swapTimer=setTimeout(()=>{try{if(mainBox._swapGen!==swapGen||mainBox._swapIdx!==cur||mainBox._swapCurSlot!==curSlot||el.__b2SwapDone)return;el.__b2SwapDone=!0}catch(e){}doSwap()},Math.round(d*1e3)+180)}catch(e){}}}catch(e){}mainBox._swapTimer=setTimeout(doSwap,6e4);return}catch(e){}mainBox._swapTimer=setTimeout(doSwap,delayMs(fromSlot,toSlot))}let firstDelay=imgList[0]&&imgList[1]?delayMs(imgList[0].slot,imgList[1].slot):1e3;try{const el=getEl(firstSlot);if(isVideo(el)){const dur=Number(el.duration);Number.isFinite(dur)&&dur>0?firstDelay=Math.round(dur*1e3)+180:(firstDelay=6e4,el.onloadedmetadata=()=>{try{if(mainBox._swapGen!==swapGen||mainBox._swapIdx!==0||mainBox._swapCurSlot!==firstSlot)return;const d=Number(el.duration);if(Number.isFinite(d)&&d>0){mainBox._swapTimer&&clearTimeout(mainBox._swapTimer);try{el.__b2SwapDone=!1}catch(e){}mainBox._swapTimer=setTimeout(()=>{try{if(mainBox._swapGen!==swapGen||mainBox._swapIdx!==0||mainBox._swapCurSlot!==firstSlot||el.__b2SwapDone)return;el.__b2SwapDone=!0}catch(e){}doSwap()},Math.round(d*1e3)+180)}}catch(e){}});try{el.__b2SwapDone=!1}catch(e){}el.onended=()=>{try{if(mainBox._swapGen!==swapGen||mainBox._swapIdx!==0||mainBox._swapCurSlot!==firstSlot||el.__b2SwapDone)return;el.__b2SwapDone=!0}catch(e){}try{mainBox._swapTimer&&clearTimeout(mainBox._swapTimer)}catch(e){}try{doSwap()}catch(e){}}}}catch(e){}mainBox._swapCurSlot=firstSlot,mainBox._swapTimer=setTimeout(doSwap,firstDelay)}window._b2RefreshImageControls=function(playerName,slot){const settings=_b2GetImgSettings(playerName,slot);settings.zoom=settings.scale,settings.fill=settings.fit,settings.posX=settings.offsetX,settings.posY=settings.offsetY;const prefix=_b2GetImgControlPrefix(slot),scaleEl=document.getElementById(`${prefix}-scale-val`),brightnessEl=document.getElementById(`${prefix}-brightness-val`),offsetEl=document.getElementById(`${prefix}-offset-val`);scaleEl&&(scaleEl.textContent=`${settings.scale}%`),brightnessEl&&(brightnessEl.textContent=`${settings.brightness}%`),offsetEl&&(offsetEl.textContent=`${settings.offsetX}px, ${settings.offsetY}px`),document.querySelectorAll(`[data-b2-fit-slot="${slot}"]`).forEach(btn=>{btn.classList.toggle("active",btn.dataset.fit===settings.fit)}),document.querySelectorAll(`[data-b2-auto-slot="${slot}"]`).forEach(btn=>{const isOn=btn.dataset.autoAdjust==="on";btn.classList.toggle("active",isOn?settings.autoAdjust!==!1:settings.autoAdjust===!1)}),_b2ApplyImgSettingsToDom(playerName,slot)},window._b2SetImgAutoAdjust=function(playerName,slot,enabled){const settings=_b2GetImgSettings(playerName,slot);settings.autoAdjust=!!enabled,enabled&&(settings.manualCenter=!1),_b2SaveImgSettings(),typeof window._b2RefreshImageControls=="function"?window._b2RefreshImageControls(playerName,slot):_b2ApplyImgSettingsToDom(playerName,slot)},window._b2CenterImage=function(playerName,slot){const settings=_b2GetImgSettings(playerName,slot);settings.autoAdjust=!1,settings.manualCenter=!0,settings.offsetX=0,settings.offsetY=0,settings.posX=0,settings.posY=0,_b2SaveImgSettings();const prefix=_b2GetImgControlPrefix(slot),offsetEl=document.getElementById(`${prefix}-offset-val`);offsetEl&&(offsetEl.textContent="0px, 0px"),_b2ApplyImgSettingsToDom(playerName,slot)};function _b2BuildImageControlGroup(playerName,slot,label,hasImage){const settings=_b2GetImgSettings(playerName,slot),safeName=(playerName||"").replace(/\\/g,"\\\\").replace(/'/g,"\\'"),prefix=_b2GetImgControlPrefix(slot),disabled=hasImage?"":"disabled";return`
    <div class="b2-players-slot-card ${hasImage?"":"is-disabled"}">
      <div class="b2-players-slot-title">${label}${hasImage?"":" <span>\uBBF8\uB4F1\uB85D</span>"}</div>
      <div class="b2-players-img-control-group">
        <div class="b2-players-img-label">\uC790\uB3D9 \uBCF4\uC815</div>
        <div class="b2-players-img-btns">
          <button class="b2-players-img-btn ${settings.autoAdjust!==!1?"active":""}" data-b2-auto-slot="${slot}" data-auto-adjust="on" ${disabled} onclick="_b2SetImgAutoAdjust('${safeName}','${slot}',true)">ON</button>
          <button class="b2-players-img-btn ${settings.autoAdjust===!1?"active":""}" data-b2-auto-slot="${slot}" data-auto-adjust="off" ${disabled} onclick="_b2SetImgAutoAdjust('${safeName}','${slot}',false)">OFF</button>
        </div>
      </div>
      <div class="b2-players-img-control-group">
        <div class="b2-players-img-label">\uD06C\uAE30 <span id="${prefix}-scale-val">${settings.scale}%</span></div>
        <input type="range" class="b2-players-img-slider" min="50" max="220" value="${settings.scale}" ${disabled}
          oninput="document.getElementById('${prefix}-scale-val').textContent=this.value+'%';_b2PreviewImgSetting('${safeName}','${slot}','scale',this.value);this.dataset.pendingValue=this.value"
          onchange="_b2UpdateImgSetting('${safeName}','${slot}','scale',this.value)">
      </div>
      <div class="b2-players-img-control-group">
        <div class="b2-players-img-label">\uBC1D\uAE30 <span id="${prefix}-brightness-val">${settings.brightness}%</span></div>
        <input type="range" class="b2-players-img-slider" min="20" max="180" value="${settings.brightness}" ${disabled}
          oninput="document.getElementById('${prefix}-brightness-val').textContent=this.value+'%';_b2PreviewImgSetting('${safeName}','${slot}','brightness',this.value);this.dataset.pendingValue=this.value"
          onchange="_b2UpdateImgSetting('${safeName}','${slot}','brightness',this.value)">
      </div>
      <div class="b2-players-img-control-group">
        <div class="b2-players-img-label">\uBC30\uCE58</div>
        <div class="b2-players-img-btns">
          <button class="b2-players-img-btn ${settings.fit==="cover"?"active":""}" data-b2-fit-slot="${slot}" data-fit="cover" ${disabled} onclick="_b2UpdateImgSetting('${safeName}','${slot}','fit','cover')">\uCC44\uC6B0\uAE30</button>
          <button class="b2-players-img-btn ${settings.fit==="contain"?"active":""}" data-b2-fit-slot="${slot}" data-fit="contain" ${disabled} onclick="_b2UpdateImgSetting('${safeName}','${slot}','fit','contain')">\uB9DE\uCDA4</button>
          <button class="b2-players-img-btn ${settings.fit==="fill"?"active":""}" data-b2-fit-slot="${slot}" data-fit="fill" ${disabled} onclick="_b2UpdateImgSetting('${safeName}','${slot}','fit','fill')">\uB298\uB9AC\uAE30</button>
          <button class="b2-players-img-btn" ${disabled} onclick="_b2UpdateImgSetting('${safeName}','${slot}','scale',200)">2\uBC30 \uD655\uB300</button>
          <button class="b2-players-img-btn" ${disabled} onclick="_b2CenterImage('${safeName}','${slot}')">\uC911\uC559 \uC815\uB82C</button>
        </div>
      </div>
      <div class="b2-players-img-control-group">
        <div class="b2-players-img-label">\uC704\uCE58 <span id="${prefix}-offset-val">${settings.offsetX}px, ${settings.offsetY}px</span></div>
        <div class="b2-players-img-btns">
          <button class="b2-players-img-btn b2-players-img-btn-sm" ${disabled} onclick="_b2MoveImg('${safeName}','${slot}',0,-12)">\uC0C1</button>
          <button class="b2-players-img-btn b2-players-img-btn-sm" ${disabled} onclick="_b2MoveImg('${safeName}','${slot}',0,12)">\uD558</button>
          <button class="b2-players-img-btn b2-players-img-btn-sm" ${disabled} onclick="_b2MoveImg('${safeName}','${slot}',-12,0)">\uC88C</button>
          <button class="b2-players-img-btn b2-players-img-btn-sm" ${disabled} onclick="_b2MoveImg('${safeName}','${slot}',12,0)">\uC6B0</button>
          <button class="b2-players-img-btn b2-players-img-btn-sm" ${disabled} onclick="_b2ResetImgSettings('${safeName}','${slot}');_b2RefreshImageControls('${safeName}','${slot}')">\uCD08\uAE30\uD654</button>
        </div>
      </div>
    </div>
  `}window._b2UpdateImgSetting=function(playerName,slot,key,val){val===void 0&&(val=key,key=slot,slot="primary"),key={zoom:"scale",fill:"fit",posX:"offsetX",posY:"offsetY"}[key]||key;const s=_b2GetImgSettings(playerName,slot);(key==="fit"||key==="scale"||key==="offsetX"||key==="offsetY")&&(s.autoAdjust=!1,s.manualCenter=!1);const numVal=parseInt(val,10);s[key]=isNaN(numVal)?val:numVal,s.zoom=s.scale,s.fill=s.fit,s.posX=s.offsetX,s.posY=s.offsetY,_b2SaveImgSettings();const prefix=_b2GetImgControlPrefix(slot),scaleEl=document.getElementById(`${prefix}-scale-val`),brightnessEl=document.getElementById(`${prefix}-brightness-val`),offsetEl=document.getElementById(`${prefix}-offset-val`);scaleEl&&(scaleEl.textContent=`${s.scale}%`),brightnessEl&&(brightnessEl.textContent=`${s.brightness}%`),offsetEl&&(offsetEl.textContent=`${s.offsetX}px, ${s.offsetY}px`),document.querySelectorAll(`[data-b2-fit-slot="${slot}"]`).forEach(btn=>{btn.classList.toggle("active",btn.dataset.fit===s.fit)}),document.querySelectorAll(`[data-b2-auto-slot="${slot}"]`).forEach(btn=>{const isOn=btn.dataset.autoAdjust==="on";btn.classList.toggle("active",isOn?s.autoAdjust!==!1:s.autoAdjust===!1)}),_b2ApplyImgSettingsToDom(playerName,slot)},window._b2MoveImg=function(playerName,slot,dx,dy){dy===void 0&&(dy=dx,dx=slot,slot="primary");const s=_b2GetImgSettings(playerName,slot);s.autoAdjust=!1,s.manualCenter=!1,s.offsetX+=dx,s.offsetY+=dy,s.posX=s.offsetX,s.posY=s.offsetY,_b2SaveImgSettings();const prefix=_b2GetImgControlPrefix(slot),offsetEl=document.getElementById(`${prefix}-offset-val`);offsetEl&&(offsetEl.textContent=`${s.offsetX}px, ${s.offsetY}px`),_b2ApplyImgSettingsToDom(playerName,slot)};try{window.Board2ImageUtils=window.Board2ImageUtils||{getImgSettings:_b2GetImgSettings,renderCfgImgSettings:_renderCfgImgSettings}}catch(e){}

/* board2-card-utils.js */
function _b2NameTag(p,accentCol,showTier){const crewCol=p.crewName&&typeof _gcCrew=="function"&&_gcCrew(p.crewName)||"",safeName=(p.name||"").replace(/'/g,"\\'");return`
    <div style="display:flex;align-items:center;gap:6px;padding:3px 8px 3px 3px;border-radius:20px;cursor:pointer;transition:background .12s"
      onmouseover="this.style.background='${accentCol}14'"
      onmouseout="this.style.background='transparent'">
      <div onclick="openPlayerModal('${safeName}')" style="display:flex;align-items:center;gap:6px;flex:1">
      ${_b2Avatar(p,crewCol||accentCol,58)}
      <span style="font-weight:700;font-size:var(--fs-lg);color:var(--text1);white-space:nowrap;${p.inactive?"opacity:.6":""}">${p.name||""}</span>
      ${p.race&&p.race!=="N"?`<span class="rbadge r${p.race}" style="font-size:10px;flex-shrink:0">${p.race}</span>`:""}
      ${showTier&&p.tier?`<span style="font-size:10px;font-weight:700;padding:1px 5px;border-radius:4px;background:${getTierBtnColor(p.tier)};color:${getTierBtnTextColor(p.tier)||"#fff"};flex-shrink:0">${p.tier}</span>`:""}
      ${p.inactive?'<span style="font-size:9px;background:#fff7ed;color:#9a3412;border-radius:4px;padding:1px 4px;font-weight:700;flex-shrink:0">\u23F8\uFE0F</span>':""}
      </div>
    </div>`}function _b2PlayerRowCompact(p,accentCol){const tierCol=getTierBtnColor(p.tier||""),tierTextCol=getTierBtnTextColor(p.tier||"")||"#fff",safeName=(p.name||"").replace(/'/g,"\\'");return`
    <div style="display:flex;align-items:center;gap:8px;cursor:pointer;flex:1"
      onmouseover="this.querySelector('.b2name').style.color='${accentCol}'"
      onmouseout="this.querySelector('.b2name').style.color='var(--text1)'">
      <div onclick="openPlayerModal('${safeName}')" style="display:flex;align-items:center;gap:8px;flex:1">
      ${_b2Avatar(p,accentCol,58)}
      <span class="b2name" style="font-weight:700;font-size:var(--fs-lg);color:var(--text1);transition:color .1s;${p.inactive?"opacity:.6":""}">${p.name||""}</span>
      ${p.inactive?'<span style="font-size:9px;background:#fff7ed;color:#9a3412;border-radius:4px;padding:1px 4px;font-weight:700;flex-shrink:0">\u23F8\uFE0F</span>':""}
      ${p.race&&p.race!=="N"?`<span class="rbadge r${p.race}" style="font-size:var(--fs-caption);flex-shrink:0">${p.race}</span>`:""}
      <span style="font-size:var(--fs-caption);font-weight:700;padding:2px 8px;border-radius:6px;background:${tierCol};color:${tierTextCol}">${p.tier||"?"}</span>
      </div>
    </div>`}function _b2Chip(p,accentCol){const crewCol=p.crewName&&typeof _gcCrew=="function"&&_gcCrew(p.crewName)||"",borderStyle=`border:1.5px solid ${accentCol}44`;return`
    <div onclick="openPlayerModal('${(p.name||"").replace(/'/g,"\\'")}')"
      style="display:flex;align-items:center;gap:7px;padding:5px 13px 5px 5px;border-radius:24px;background:var(--white);${borderStyle};cursor:pointer;box-shadow:0 1px 3px #0001;transition:transform .1s,box-shadow .1s"
      onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 10px ${accentCol}33'"
      onmouseout="this.style.transform='';this.style.boxShadow='0 1px 3px #0001'">
      ${_b2Avatar(p,crewCol||accentCol,36)}
      <span style="font-weight:700;font-size:var(--fs-base);color:var(--text1);white-space:nowrap">${p.name||""}</span>
    </div>`}function _b2Avatar(p,col,size){const raceShort={T:"T",Z:"Z",P:"P",N:"?"}[p.race||"N"]||"?",_escAttr=typeof window.escAttr=="function"?window.escAttr:s2=>String(s2||"").replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;"),_escJS=typeof window.escJS=="function"?window.escJS:s2=>String(s2||"").replace(/\\/g,"\\\\").replace(/'/g,"\\'").replace(/\r/g,"\\r").replace(/\n/g,"\\n"),base=size||28;let mult=1;try{const chipPx=parseInt(localStorage.getItem("su_bcp_size")||"26",10);mult=Math.max(.6,Math.min(2.4,chipPx/26))}catch(e){console.warn("[_b2Avatar] \uC544\uBC14\uD0C0 \uD06C\uAE30 \uC124\uC815 \uB85C\uB4DC \uC2E4\uD328:",e.message)}const s=Math.round(base*mult),badgeSize=Math.round(s*.38),_rawIcon=getStatusIcon(p.name),statusHtml=getStatusIconHTML(p.name),_safeColAttr=_escAttr(col),_safeColJs=_escJS(col),_safeRaceJs=_escJS(raceShort),_safeNameJs=_escJS(p&&p.name?p.name:""),r=s/2,br=badgeSize/2,_bTop=Math.round(r*.134-br),_bRight=Math.round(r*.5-br),_isImgIcon=_rawIcon&&(typeof window._siIsImg=="function"?window._siIsImg(_rawIcon):!1),_badgeInner=_isImgIcon?`<img src="${_escAttr(_rawIcon)}" crossorigin="anonymous" style="width:${badgeSize}px;height:${badgeSize}px;border-radius:50%;object-fit:cover;opacity:.82" onerror="this.style.display='none';console.warn('[\uD604\uD669\uD310] \uC0C1\uD0DC \uC544\uC774\uCF58 \uB85C\uB4DC \uC2E4\uD328:', this.src)">`:statusHtml.replace(/margin-left:[^;]+;/g,"").replace(/font-size:[^;]+;/g,""),badge=statusHtml?`<span style="position:absolute;top:${_bTop}px;right:${_bRight}px;width:${badgeSize}px;height:${badgeSize}px;border-radius:50%;background:${_isImgIcon?"rgba(255,255,255,.72)":"transparent"};overflow:hidden;display:flex;align-items:center;justify-content:center;font-size:${Math.round(badgeSize*.82)}px;line-height:1;filter:drop-shadow(0 1px 2px rgba(0,0,0,.65))">${_badgeInner}</span>`:"";return p.photo?`<span style="width:${s}px;height:${s}px;flex-shrink:0;display:inline-flex;position:relative">
      <img src="${_escAttr(toThumbUrl(p.photo,s))}" data-orig="${_escAttr(toHttpsUrl(p.photo))}" crossorigin="anonymous" loading="lazy" decoding="async" fetchpriority="low" data-b2-photo="1" style="width:${s}px;height:${s}px;border-radius:var(--su_profile_radius,6px);clip-path:var(--su_profile_clip,none);object-fit:cover;flex-shrink:0" onerror="if(this.dataset.orig&&this.src!==this.dataset.orig){this.removeAttribute('crossorigin');this.src=this.dataset.orig;}else{console.warn('[\uD604\uD669\uD310] \uC120\uC218 \uD504\uB85C\uD544 \uC774\uBBF8\uC9C0 \uB85C\uB4DC \uC2E4\uD328:', this.src, '\uC120\uC218:', '${_safeNameJs}');this.parentNode.innerHTML=_b2AvatarFallback('${_safeRaceJs}','${_safeColJs}',${s})}">
      ${badge}
    </span>`:`<span style="width:${s}px;height:${s}px;border-radius:var(--su_profile_radius,6px);clip-path:var(--su_profile_clip,none);background:${_safeColAttr};display:inline-flex;align-items:center;justify-content:center;font-weight:900;font-size:${Math.round(s*.45)}px;color:#fff;flex-shrink:0;position:relative">${raceShort}${badge}</span>`}function _b2AvatarFallback(letter,col,size){const s=size||28;return`<span style="width:${s}px;height:${s}px;border-radius:var(--su_profile_radius,6px);clip-path:var(--su_profile_clip,none);background:${col};display:inline-flex;align-items:center;justify-content:center;font-weight:900;font-size:${Math.round(s*.45)}px;color:#fff;flex-shrink:0;border:2px solid ${col}88">${letter}</span>`}try{window._b2NameTag=_b2NameTag,window._b2PlayerRowCompact=_b2PlayerRowCompact,window._b2Chip=_b2Chip,window._b2Avatar=_b2Avatar,window.Board2CardUtils=window.Board2CardUtils||{nameTag:_b2NameTag,playerRowCompact:_b2PlayerRowCompact,chip:_b2Chip,avatar:_b2Avatar}}catch(e){}

/* board2-core.js */
var _a,_b,_c,_d,_e,_f;function _b2InjectAndRunScripts(container){container.querySelectorAll("script").forEach(oldScript=>{const newScript=document.createElement("script");oldScript.src?newScript.src=oldScript.src:newScript.textContent=oldScript.textContent,oldScript.parentNode.replaceChild(newScript,oldScript)})}if(typeof window._siIsImg!="function"&&(window._siIsImg=function(v){return typeof v=="string"&&(v.startsWith("http")||v.startsWith("data:"))}),typeof window._siRender!="function"&&(window._siRender=function(emoji,size){return size=size||"16px",emoji?window._siIsImg(emoji)?`<img src="${emoji}" style="width:${size};height:${size};object-fit:contain;vertical-align:middle;flex-shrink:0" onerror="this.style.display='none'">`:emoji:""}),typeof _b2NameTag!="function")var _b2NameTag=function(p,accentCol,showTier){try{if(window.Board2CardUtils&&typeof window.Board2CardUtils.nameTag=="function")return window.Board2CardUtils.nameTag(p,accentCol,showTier);if(typeof window._b2NameTag=="function")return window._b2NameTag(p,accentCol,showTier)}catch(e){}const name=p&&p.name||"",safeName=String(name).replace(/'/g,"\\'"),tier=p&&p.tier||"",race=p&&p.race||"",inactive=!!(p&&p.inactive),tierBg=typeof getTierBtnColor=="function"?getTierBtnColor(tier):"#64748b",tierFg=typeof getTierBtnTextColor=="function"&&getTierBtnTextColor(tier)||"#fff";return`
      <div style="display:flex;align-items:center;gap:6px;padding:6px 10px;border-radius:20px;cursor:pointer;transition:background .12s"
        onmouseover="this.style.background='${accentCol}14'"
        onmouseout="this.style.background='transparent'"
        onclick="openPlayerModal('${safeName}')">
        <span style="font-weight:700;font-size:var(--fs-lg);color:var(--text1);white-space:nowrap;${inactive?"opacity:.6":""}">${name}</span>
        ${race&&race!=="N"?`<span class="rbadge r${race}" style="font-size:10px;flex-shrink:0">${race}</span>`:""}
        ${showTier&&tier?`<span style="font-size:10px;font-weight:700;padding:1px 5px;border-radius:4px;background:${tierBg};color:${tierFg};flex-shrink:0">${tier}</span>`:""}
      </div>`};var _b2View="univ",_b2SaveUniv="\uC804\uCCB4",_b2LineupUniv="",_b2LineupCardMode=(()=>{try{const m=localStorage.getItem("su_b2_lineup_card_mode")||"default";return m==="list"?"default":m}catch(e){return"default"}})();function _b2SetLineupCardMode(mode){_b2LineupCardMode=["default","stat","table"].includes(String(mode||""))?String(mode):"default";try{localStorage.setItem("su_b2_lineup_card_mode",_b2LineupCardMode)}catch(e){}const el=document.getElementById("b2-content");el&&(el.innerHTML=_b2LineupView(),typeof injectUnivIcons=="function"&&injectUnivIcons(el)),typeof render=="function"&&render()}var _b2Collapsed=new Set,_b2PlayersUnivFilter="\uC804\uCCB4",_b2PlayersFilter="all",_b2PlayersTierFilter="\uC804\uCCB4",_b2SelectedPlayer=null,_b2PlayersSort="default";const _b2BgImageMeta={};let _b2AutoFitResizeBound=!1;function _b2LoadBgImageMeta(url,cb){try{const src=toHttpsUrl(url||"");if(!src){cb&&cb(null);return}if(_b2BgImageMeta[src]&&_b2BgImageMeta[src].w&&_b2BgImageMeta[src].h){cb&&cb(_b2BgImageMeta[src]);return}const img=new Image;img.onload=function(){_b2BgImageMeta[src]={w:img.naturalWidth||0,h:img.naturalHeight||0},cb&&cb(_b2BgImageMeta[src])},img.onerror=function(){cb&&cb(null)},img.src=src}catch(e){cb&&cb(null)}}function _b2ResolveBgAutoFit(mode,rect,meta){const rawMode=String(mode||"auto");if(rawMode==="cover"||rawMode==="contain"||rawMode==="fill")return rawMode;const vw=window.innerWidth||1280;if(!rect||!rect.width||!rect.height)return vw<=900?"contain":"cover";if(!meta||!meta.w||!meta.h)return vw<=640||rect.width<300?"contain":"cover";const boxRatio=rect.width/rect.height,imgRatio=meta.w/meta.h,diff=Math.abs(Math.log(imgRatio/boxRatio));return vw<=640?diff>.32?"contain":"cover":vw<=1024?diff>.3?"contain":"cover":imgRatio>1.78||imgRatio<.64||diff>.4?"contain":"cover"}function _b2ResolveImgAutoFit(kind,mode,rect,meta){const rawMode=String(mode||"auto");if(rawMode==="cover"||rawMode==="contain"||rawMode==="fill")return rawMode;const vw=window.innerWidth||1280;if(!rect||!rect.width||!rect.height)return kind==="thumb"?vw<=900?"contain":"cover":kind==="crew"?vw<=1024?"contain":"cover":vw<=900?"contain":"cover";if(!meta||!meta.w||!meta.h)return vw<=640||kind==="thumb"&&rect.width<100?"contain":"cover";const boxRatio=rect.width/rect.height,imgRatio=meta.w/meta.h,diff=Math.abs(Math.log(imgRatio/boxRatio));return kind==="thumb"?vw<=640?diff>.24?"contain":"cover":vw<=1024?diff>.22?"contain":"cover":imgRatio>1.32||imgRatio<.76||diff>.24?"contain":"cover":kind==="crew"?vw<=640?diff>.26?"contain":"cover":vw<=1024?diff>.24?"contain":"cover":imgRatio>1.26||imgRatio<.78||diff>.27?"contain":"cover":_b2ResolveBgAutoFit(mode,rect,meta)}function _b2ResolveImgAutoPosition(kind,fit,rect,meta){if(fit!=="cover")return"center center";const imgRatio=meta&&meta.w&&meta.h?meta.w/meta.h:1,boxRatio=rect&&rect.width&&rect.height?rect.width/rect.height:1;if(!imgRatio||!boxRatio)return"center center";const portraitPressure=boxRatio/imgRatio;return kind==="thumb"?portraitPressure>1.25?"top center":"center center":kind==="crew"?portraitPressure>1.9&&rect&&rect.height>=150?"bottom center":portraitPressure>1.25?"top center":"center center":kind==="bg"?portraitPressure>2.1&&rect&&rect.height>=260?"bottom center":portraitPressure>1.35?"top center":"center center":"center center"}function _b2ApplyUnivWatermarkSizing(root){}function _b2ApplyBgAutoSizing(root){try{const scope=root||document,els=[];scope&&scope.matches&&scope.matches(".b2-bg-layer[data-bg-size-mode]")&&els.push(scope),scope&&scope.querySelectorAll&&els.push(...scope.querySelectorAll(".b2-bg-layer[data-bg-size-mode]")),els.forEach(el=>{const mode=el.getAttribute("data-bg-size-mode")||"auto",body=el.closest(".b2-bg-host")||el.parentElement,rect=body&&body.getBoundingClientRect?body.getBoundingClientRect():null,src=el.getAttribute("data-bg-src")||"";_b2LoadBgImageMeta(src,meta=>{try{const resolved=_b2ResolveBgAutoFit(mode,rect,meta);el.style.backgroundSize=resolved,el.setAttribute("data-bg-size-resolved",resolved)}catch(e){}})});const imgs=[];scope&&scope.matches&&scope.matches(".b2-fit-auto[data-fit-kind]")&&imgs.push(scope),scope&&scope.querySelectorAll&&imgs.push(...scope.querySelectorAll(".b2-fit-auto[data-fit-kind]")),imgs.forEach(el=>{const mode=el.getAttribute("data-fit-mode")||"auto",kind=el.getAttribute("data-fit-kind")||"thumb",rect=el.getBoundingClientRect?el.getBoundingClientRect():null,src=el.currentSrc||el.getAttribute("src")||"";_b2LoadBgImageMeta(src,meta=>{try{const resolved=_b2ResolveImgAutoFit(kind,mode,rect,meta);el.style.objectFit=resolved;const pos=_b2ResolveImgAutoPosition(kind,resolved,rect,meta);el.style.objectPosition=pos,el.setAttribute("data-fit-resolved",resolved)}catch(e){}})})}catch(e){}}let _b2BgLazyIO=null;function _b2LazyLoadBgLayers(root){try{const scope=root||document,els=[];if(scope&&scope.matches&&scope.matches(".b2-bg-layer[data-bg-src]")&&els.push(scope),scope&&scope.querySelectorAll&&els.push(...scope.querySelectorAll(".b2-bg-layer[data-bg-src]")),!els.length)return;const loadOne=el=>{try{if(!el||el.getAttribute("data-bg-loaded")==="1")return;let src=el.getAttribute("data-bg-src")||"";if(typeof toHttpsUrl=="function"){const u=toHttpsUrl(src);u&&(src=u)}const pos=el.getAttribute("data-bg-pos")||"center center";if(src){el.style.backgroundImage=`url("${String(src).replace(/"/g,'\\"')}")`,el.style.backgroundPosition=pos,el.style.backgroundRepeat="no-repeat",el.setAttribute("data-bg-loaded","1");try{_b2ApplyBgAutoSizing(el)}catch(e){}}}catch(e){}};if(!(window&&"IntersectionObserver"in window)){els.forEach(loadOne);return}_b2BgLazyIO||(_b2BgLazyIO=new IntersectionObserver(entries=>{entries.forEach(ent=>{if(ent&&(ent.isIntersecting||(ent.intersectionRatio||0)>0)){loadOne(ent.target);try{_b2BgLazyIO.unobserve(ent.target)}catch(e){}}})},{root:null,rootMargin:"600px 0px",threshold:.01})),els.forEach(el=>{if(!(!el||el.getAttribute("data-bg-loaded")==="1"))try{_b2BgLazyIO.observe(el)}catch(e){loadOne(el)}})}catch(e){}}function _b2BindAutoFitResize(){if(_b2AutoFitResizeBound)return;_b2AutoFitResizeBound=!0;const rerun=()=>{try{const root=document.getElementById("b2-content");if(!root)return;requestAnimationFrame(()=>{_b2ApplyBgAutoSizing(root);try{_b2View==="players"&&_b2SelectedPlayer&&typeof _b2ApplyImgSettingsToDom=="function"&&(_b2ApplyImgSettingsToDom(_b2SelectedPlayer.name,"primary"),_b2ApplyImgSettingsToDom(_b2SelectedPlayer.name,"secondary"),typeof window._b2RefreshImageControls=="function"&&(window._b2RefreshImageControls(_b2SelectedPlayer.name,"primary"),window._b2RefreshImageControls(_b2SelectedPlayer.name,"secondary")))}catch(e){}})}catch(e){}};window.addEventListener("resize",rerun),window.addEventListener("orientationchange",()=>setTimeout(rerun,80)),document.addEventListener("visibilitychange",()=>{document.visibilityState==="visible"&&setTimeout(rerun,60)})}function _b2ThisWeekRange(){const now=new Date,day=now.getDay(),mon=new Date(now);mon.setHours(0,0,0,0),mon.setDate(now.getDate()+(day===0?-6:1-day));const toD=new Date(now);toD.setHours(23,59,59,999);const _fmt=d=>parseInt(d.toISOString().slice(0,10).replace(/-/g,""));return{fromN:_fmt(mon),toN:_fmt(toD)}}function _b2DateNum(s){const digits=String(s||"").replace(/\D/g,"");return digits.length<8?0:parseInt(digits.slice(0,8),10)||0}var b2LabelAlpha=typeof b2LabelAlpha!="undefined"?b2LabelAlpha:(_a=J("su_b2la"))!=null?_a:16,b2BgAlpha=typeof b2BgAlpha!="undefined"?b2BgAlpha:(_b=J("su_b2ba"))!=null?_b:9,b2BgImgAlpha=typeof b2BgImgAlpha!="undefined"?b2BgImgAlpha:(_c=J("su_b2bia"))!=null?_c:12,b2FreeBgAlpha=typeof b2FreeBgAlpha!="undefined"?b2FreeBgAlpha:(_d=J("su_b2fba"))!=null?_d:25,b2FreeTierBgAlpha=typeof b2FreeTierBgAlpha!="undefined"?b2FreeTierBgAlpha:(_e=J("su_b2ftba"))!=null?_e:15,b2ProfileBgAlpha=typeof b2ProfileBgAlpha!="undefined"?b2ProfileBgAlpha:(_f=J("su_b2pba"))!=null?_f:10;if(typeof _b2AlphaHex!="function")var _b2AlphaHex=function(pct){return Math.round((pct||0)/100*255).toString(16).padStart(2,"0")};function _b2ToggleCard(btn,univName){_b2Collapsed.has(univName)?_b2Collapsed.delete(univName):_b2Collapsed.add(univName);const card=btn.closest("[data-b2card]");if(!card)return;const body=card.querySelector(".b2-card-body");body&&(body.style.display=_b2Collapsed.has(univName)?"none":""),btn.textContent=_b2Collapsed.has(univName)?"\u25B6":"\u25BC"}function _b2CollapseAll(){_b2VisUnivs().filter(u=>u.name!=="\uBB34\uC18C\uC18D").forEach(u=>_b2Collapsed.add(u.name));const s=document.getElementById("b2-content");s&&(s.innerHTML=_b2UnivView(),injectUnivIcons(s))}function _b2ExpandAll(){_b2Collapsed.clear();const s=document.getElementById("b2-content");s&&(s.innerHTML=_b2UnivView(),injectUnivIcons(s))}const _B2_ROLE_ORDER=["\uC774\uC0AC\uC7A5","\uB3D9\uC544\uB9AC \uD68C\uC7A5","\uCD1D\uC7A5","\uBD80\uCD1D\uC7A5","\uAD50\uC218","\uCF54\uCE58","\uC120\uC7A5","\uB3D9\uC544\uB9AC\uC7A5","\uBC18\uC7A5","\uCD1D\uAD04"];function _b2RoleRank(p){const i=_B2_ROLE_ORDER.indexOf(p.role||"");return i>=0?i:99}function _b2VisUnivs(){return getAllUnivs().filter(u=>!u.hidden&&!u.dissolved)}function rBoard2(C,T){try{let _b2TabBtn2=function(view,color,label){return`<button class="pill b2-tab-pill ${_b2View===view?"on":""}" style="flex-shrink:0;white-space:nowrap" onclick="_b2View='${view}';render();this.blur()">${label}</button>`};var _b2TabBtn=_b2TabBtn2;T.innerText="\u{1F4CA} \uD604\uD669\uD310";const _normUnivName=u=>String(u||"").trim();(!window._b2DissSet||typeof window._b2DissSetSig=="undefined"||window._b2DissSetSig!==(typeof univCfg!="undefined"?univCfg.length:0))&&(window._b2DissSet=new Set((typeof univCfg!="undefined"?univCfg:[]).filter(u=>u.dissolved||u.hidden).map(u=>String(u.name||"").trim())),window._b2DissSetSig=typeof univCfg!="undefined"?univCfg.length:0);const univList=_b2VisUnivs().filter(u=>u.name!=="\uBB34\uC18C\uC18D");_b2View==="old"&&!isLoggedIn&&(_b2View="univ");let saveBar="";if(_b2View==="univ")saveBar=`<div style="display:flex;align-items:center;gap:6px;flex-shrink:0">
      <div style="position:relative">
        <select id="b2-save-sel" class="b2-toolbar-select" onchange="_b2SaveUniv=this.value" style="padding:4px 28px 4px 10px;border-radius:8px;border:1px solid var(--border2);font-size:var(--fs-sm);background:var(--white);color:var(--text2);appearance:none;cursor:pointer">
          <option value="\uC804\uCCB4">\u{1F3EB} \uC804\uCCB4</option>
          ${univList.map(u=>`<option value="${u.name}"${_b2SaveUniv===u.name?" selected":""}>${u.name}</option>`).join("")}
        </select>
        <svg style="position:absolute;right:6px;top:50%;transform:translateY(-50%);pointer-events:none;color:var(--gray-l)" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m6 9 6 6 6-6"/></svg>
      </div>
      <button class="b2-toolbar-btn" onclick="saveB2Img()" style="padding:4px 12px;border-radius:8px;border:1px solid var(--border2);background:var(--white);color:var(--text2);font-size:var(--fs-sm);font-weight:700;cursor:pointer;display:flex;align-items:center;gap:4px;margin-bottom:0">\u{1F4F7} \uC774\uBBF8\uC9C0\uC800\uC7A5</button>
    </div>`;else if(_b2View==="free")saveBar=`<div style="flex-shrink:0">
      <button class="b2-toolbar-btn" onclick="saveB2FreeImg()" style="padding:4px 12px;border-radius:8px;border:1px solid var(--border2);background:var(--white);color:var(--text2);font-size:var(--fs-sm);font-weight:700;cursor:pointer;display:flex;align-items:center;gap:4px">\u{1F4F7} \uC774\uBBF8\uC9C0\uC800\uC7A5</button>
    </div>`;else if(_b2View==="femco")saveBar=`<div style="display:flex;gap:6px;flex-shrink:0">
      <button class="b2-toolbar-btn" onclick="saveB2FemcoAllImg()" style="padding:4px 12px;border-radius:8px;border:1px solid var(--border2);background:var(--white);color:var(--text2);font-size:var(--fs-sm);font-weight:700;cursor:pointer;display:flex;align-items:center;gap:4px">\u{1F4BE} \uC804\uCCB4 \uC800\uC7A5</button>
    </div>`;else if(_b2View==="lineup"){(!_b2LineupUniv||!univList.some(u=>u.name===_b2LineupUniv))&&(_b2LineupUniv=univList[0]?univList[0].name:"");const _lcModeBtn=(mode,label)=>`<button type="button" class="b2-toolbar-btn" onclick="_b2SetLineupCardMode('${mode}')" style="padding:4px 10px;border-radius:8px;border:1px solid ${_b2LineupCardMode===mode?"#2563eb":"var(--border2)"};background:${_b2LineupCardMode===mode?"linear-gradient(135deg,#eff6ff,#dbeafe)":"var(--white)"};color:${_b2LineupCardMode===mode?"#1d4ed8":"var(--text2)"};font-size:var(--fs-sm);font-weight:${_b2LineupCardMode===mode?900:700};cursor:pointer;margin-bottom:0">${label}</button>`;saveBar=`<div style="display:flex;align-items:center;gap:6px;flex-shrink:0;flex-wrap:wrap">
      <div style="position:relative">
        <select id="b2-lineup-sel" class="b2-toolbar-select" onchange="_b2LineupUniv=this.value;document.getElementById('b2-content').innerHTML=_b2LineupView();injectUnivIcons(document.getElementById('b2-content'));render();" style="padding:4px 28px 4px 10px;border-radius:8px;border:1px solid var(--border2);font-size:var(--fs-sm);background:var(--white);color:var(--text2);appearance:none;cursor:pointer">
          ${univList.map(u=>`<option value="${u.name}"${_b2LineupUniv===u.name?" selected":""}>${u.name}</option>`).join("")}
        </select>
        <svg style="position:absolute;right:6px;top:50%;transform:translateY(-50%);pointer-events:none;color:var(--gray-l)" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m6 9 6 6 6-6"/></svg>
      </div>
      <div style="display:flex;align-items:center;gap:6px">
        <span style="font-size:var(--fs-caption);font-weight:800;color:var(--text3);flex-shrink:0">\uBAA8\uB4DC</span>
        <div style="display:flex;gap:4px">
          ${_lcModeBtn("default","\u{1F5BC}\uFE0F \uAE30\uBCF8")}
          ${_lcModeBtn("stat","\u{1F4CA} \uD1B5\uACC4\uCE74\uB4DC")}
          ${_lcModeBtn("table","\u{1F5C2}\uFE0F \uD14C\uC774\uBE14")}
        </div>
      </div>
      <button class="b2-toolbar-btn" onclick="saveB2LineupImg()" style="padding:4px 12px;border-radius:8px;border:1px solid var(--border2);background:var(--white);color:var(--text2);font-size:var(--fs-sm);font-weight:700;cursor:pointer;display:flex;align-items:center;gap:4px;margin-bottom:0">\u{1F4F7} \uC774\uBBF8\uC9C0\uC800\uC7A5</button>
    </div>`}const profileTabLabel="\u{1F464} \uD504\uB85C\uD544",dissolvedUnivs=typeof univCfg!="undefined"?new Set((univCfg.filter(u=>u.dissolved)||[]).map(u=>_normUnivName(u.name))):new Set,hiddenUnivs=typeof univCfg!="undefined"?new Set((univCfg.filter(u=>u.hidden)||[]).map(u=>_normUnivName(u.name))):new Set,visPlayers=players.filter(p=>{const pu=_normUnivName(p==null?void 0:p.univ);return!p.hidden&&!p.retired&&!p.hideFromBoard&&!dissolvedUnivs.has(pu)&&!hiddenUnivs.has(pu)}),playerUnivList=[...new Set(visPlayers.map(p=>_normUnivName(p.univ)).filter(u=>u&&u!=="\uBB34\uC18C\uC18D"))];typeof univCfg!="undefined"?playerUnivList.sort((a,b)=>{const idxA=univCfg.findIndex(u=>u.name===a),idxB=univCfg.findIndex(u=>u.name===b);return(idxA>=0?idxA:999)-(idxB>=0?idxB:999)}):playerUnivList.sort();const _selBadge=_b2PlayersUnivFilter&&_b2PlayersUnivFilter!=="\uC804\uCCB4"?`<button class="pill b2-current-filter" style="flex-shrink:0;white-space:nowrap"
        onclick="_b2PlayersUnivFilter='\uC804\uCCB4';document.getElementById('b2-content').innerHTML=_b2PlayersView();setTimeout(()=>{if(_b2SelectedPlayer)_b2UpdateMainDisplay(_b2SelectedPlayer.name)},0)">\uD604\uC7AC: ${_b2PlayersUnivFilter} \u2715</button>`:"",playerFilters=_b2View==="players"?`
    <div class="b2-nav-playerfilters" style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;flex-shrink:0">
      <div style="width:1px;height:24px;background:var(--border2);display:inline-block"></div>
      <div style="position:relative">
        <select id="b2-players-univ-sel" class="b2-toolbar-select" onchange="_b2PlayersUnivFilter=this.value;document.getElementById('b2-content').innerHTML=_b2PlayersView();setTimeout(()=>{if(_b2SelectedPlayer)_b2UpdateMainDisplay(_b2SelectedPlayer.name)},0)" style="padding:6px 28px 6px 12px;border-radius:20px;border:1px solid var(--border2);font-size:var(--fs-base);background:var(--white);color:var(--text2);appearance:none;cursor:pointer">
          <option value="\uC804\uCCB4" ${_b2PlayersUnivFilter==="\uC804\uCCB4"?"selected":""}>\u{1F3EB} \uC804\uCCB4 \uB300\uD559</option>
          ${playerUnivList.map(u=>`<option value="${u}" ${_b2PlayersUnivFilter===u?"selected":""}>${u}</option>`).join("")}
        </select>
        <svg style="position:absolute;right:8px;top:50%;transform:translateY(-50%);pointer-events:none;color:var(--gray-l)" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m6 9 6 6 6-6"/></svg>
      </div>
      ${_selBadge}
      <div style="position:relative">
        <select id="b2-players-race-sel" class="b2-toolbar-select" onchange="_b2PlayersFilter=this.value;document.getElementById('b2-content').innerHTML=_b2PlayersView();setTimeout(()=>{if(_b2SelectedPlayer)_b2UpdateMainDisplay(_b2SelectedPlayer.name)},0)" style="padding:6px 28px 6px 12px;border-radius:20px;border:1px solid var(--border2);font-size:var(--fs-base);background:var(--white);color:var(--text2);appearance:none;cursor:pointer">
          <option value="all" ${_b2PlayersFilter==="all"?"selected":""}>\u{1F3AE} \uC804\uCCB4 \uC885\uC871</option>
          <option value="P" ${_b2PlayersFilter==="P"?"selected":""}>\u{1F52E} \uD504\uB85C\uD1A0\uC2A4</option>
          <option value="T" ${_b2PlayersFilter==="T"?"selected":""}>\u2694\uFE0F \uD14C\uB780</option>
          <option value="Z" ${_b2PlayersFilter==="Z"?"selected":""}>\u{1F98E} \uC800\uADF8</option>
        </select>
        <svg style="position:absolute;right:8px;top:50%;transform:translateY(-50%);pointer-events:none;color:var(--gray-l)" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m6 9 6 6 6-6"/></svg>
      </div>
      <div style="position:relative">
        <select id="b2-players-tier-sel" class="b2-toolbar-select" onchange="_b2PlayersTierFilter=this.value;document.getElementById('b2-content').innerHTML=_b2PlayersView();setTimeout(()=>{if(_b2SelectedPlayer)_b2UpdateMainDisplay(_b2SelectedPlayer.name)},0)" style="padding:6px 28px 6px 12px;border-radius:20px;border:1px solid var(--border2);font-size:var(--fs-base);background:var(--white);color:var(--text2);appearance:none;cursor:pointer">
          <option value="\uC804\uCCB4" ${_b2PlayersTierFilter==="\uC804\uCCB4"?"selected":""}>\u{1F3C5} \uC804\uCCB4 \uD2F0\uC5B4</option>
          ${(typeof TIERS!="undefined"?TIERS:[]).map(t=>`<option value="${t}" ${_b2PlayersTierFilter===t?"selected":""}>${t}\uD2F0\uC5B4</option>`).join("")}
        </select>
        <svg style="position:absolute;right:8px;top:50%;transform:translateY(-50%);pointer-events:none;color:var(--gray-l)" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m6 9 6 6 6-6"/></svg>
      </div>
    </div>
  `:"",weeklyBtn=_b2TabBtn2("weekly","#f59e0b",typeof getTabLabel=="function"?getTabLabel("board2","weekly","\u{1F4C5} \uBE0C\uB9AC\uD551"):"\u{1F4C5} \uBE0C\uB9AC\uD551"),oldBtn=isLoggedIn?_b2TabBtn2("old","#64748b",typeof getTabLabel=="function"?getTabLabel("board2","old","\u{1F4CA} \uAD6C\uD604\uD669\uD310"):"\u{1F4CA} \uAD6C\uD604\uD669\uD310"):"",summaryBtn=_b2TabBtn2("summary","#10b981",typeof getTabLabel=="function"?getTabLabel("board2","summary","\u{1F4CA} \uC694\uC57D"):"\u{1F4CA} \uC694\uC57D"),compareBtn=_b2TabBtn2("compare","#ef4444",typeof getTabLabel=="function"?getTabLabel("board2","compare","\u2694\uFE0F \uB300\uD559\uBE44\uAD50"):"\u2694\uFE0F \uB300\uD559\uBE44\uAD50"),rankingBtn=_b2TabBtn2("ranking","#f97316",typeof getTabLabel=="function"?getTabLabel("board2","ranking","\u{1F947} \uB7AD\uD0B9"):"\u{1F947} \uB7AD\uD0B9"),radarBtn=_b2TabBtn2("radar","#a855f7",typeof getTabLabel=="function"?getTabLabel("board2","radar","\u{1F578}\uFE0F \uB808\uC774\uB354"):"\u{1F578}\uFE0F \uB808\uC774\uB354"),heatmapBtn=_b2TabBtn2("heatmap","#db2777",typeof getTabLabel=="function"?getTabLabel("board2","heatmap","\u{1F5FA}\uFE0F \uD788\uD2B8\uB9F5"):"\u{1F5FA}\uFE0F \uD788\uD2B8\uB9F5"),bubbleBtn=_b2TabBtn2("bubble","#0891b2",typeof getTabLabel=="function"?getTabLabel("board2","bubble","\u{1F310} \uBC84\uBE14\uB9F5"):"\u{1F310} \uBC84\uBE14\uB9F5"),rightBtns=saveBar,_navTight=_b2View==="players"?"#b2-nav.b2-nav-new { padding-top: 0; }":"",{fromN:_heroFromN,toN:_heroToN}=_b2ThisWeekRange(),_heroDateNum=_b2DateNum;try{const sig=(function(){try{return[miniM,univM,ckM,proM,ttM,comps,tourneys,proTourneys,indM,gjM].map(a=>Array.isArray(a)?a.length:0).join("|")}catch(e){return""}})();if(typeof window.__b2_hist_sig=="undefined"&&(window.__b2_hist_sig=""),window.__b2_hist_sig!==sig&&typeof _rebuildAllPlayerHistoryCore=="function"){const hasMatchData=sig.split("|").some(n=>Number(n)>0),hasAnyHistory=typeof players!="undefined"&&Array.isArray(players)?players.some(p=>Array.isArray(p==null?void 0:p.history)&&p.history.length):!1;hasMatchData&&!hasAnyHistory&&_rebuildAllPlayerHistoryCore(),window.__b2_hist_sig=sig}}catch(e){}const _heroWeekActive=(()=>{const actedNames=new Set,addName=v=>{const n=String(v||"").trim();n&&actedNames.add(n)},scanTeam=arr=>{(arr||[]).forEach(x=>addName(typeof x=="string"?x:(x==null?void 0:x.name)||x))},scanSets=m=>{((m==null?void 0:m.sets)||[]).forEach(s=>{((s==null?void 0:s.games)||[]).forEach(g=>{addName(g==null?void 0:g.playerA),addName(g==null?void 0:g.playerB),addName(g==null?void 0:g.a1),addName(g==null?void 0:g.a2),addName(g==null?void 0:g.b1),addName(g==null?void 0:g.b2),addName(g==null?void 0:g.a),addName(g==null?void 0:g.b),scanTeam(g==null?void 0:g.teamA),scanTeam(g==null?void 0:g.teamB)})})},scanMatchArr=arr=>{!Array.isArray(arr)||!arr.length||arr.forEach(m=>{const d=_heroDateNum((m==null?void 0:m.d)||(m==null?void 0:m.date)||"");d<_heroFromN||d>_heroToN||(addName(m==null?void 0:m.wName),addName(m==null?void 0:m.lName),scanSets(m))})};scanMatchArr(typeof miniM!="undefined"?miniM:[]),scanMatchArr(typeof univM!="undefined"?univM:[]),scanMatchArr(typeof ckM!="undefined"?ckM:[]),scanMatchArr(typeof proM!="undefined"?proM:[]),scanMatchArr(typeof ttM!="undefined"?ttM:[]),scanMatchArr(typeof comps!="undefined"?comps:[]),scanMatchArr(typeof indM!="undefined"?indM:[]),scanMatchArr(typeof gjM!="undefined"?gjM:[]);const visNameSet=new Set(visPlayers.map(p=>String((p==null?void 0:p.name)||"").trim()).filter(Boolean));let cnt=0;return actedNames.forEach(n=>{visNameSet.has(n)&&cnt++}),cnt})(),_curViewMeta={univ:{label:"\uB300\uD559\uBCC4",desc:"\uB300\uD559 \uCE74\uB4DC \uC911\uC2EC\uC73C\uB85C \uC18C\uC18D \uD604\uD669\uACFC \uD65C\uB3D9 \uD750\uB984\uC744 \uBE60\uB974\uAC8C \uC0B4\uD3B4\uBCFC \uC218 \uC788\uC2B5\uB2C8\uB2E4."},free:{label:"\uBB34\uC18C\uC18D",desc:"\uBB34\uC18C\uC18D \uC2A4\uD2B8\uB9AC\uBA38\uB9CC \uBAA8\uC544\uC11C \uD604\uC7AC \uACF5\uBC31 \uAD6C\uAC04\uACFC \uAC1C\uBCC4 \uC0C1\uD0DC\uB97C \uBCF4\uAE30 \uC27D\uAC8C \uC815\uB9AC\uD569\uB2C8\uB2E4."},femco:{label:"\uD3A8\uCF54",desc:"\uCEEC\uB7EC \uC911\uC2EC\uC758 \uD604\uD669\uD310 \uB808\uC774\uC544\uC6C3\uC73C\uB85C \uD55C\uB208\uC5D0 \uBCF4\uAE30 \uC88B\uC740 \uAD6C\uC131\uC744 \uC81C\uACF5\uD569\uB2C8\uB2E4."},players:{label:"\uD504\uB85C\uD544",desc:"\uD504\uB85C\uD544 \uC911\uC2EC\uC73C\uB85C \uD544\uD130\uB97C \uBC14\uAFD4\uAC00\uBA70 \uC2A4\uD2B8\uB9AC\uBA38\uBCC4 \uC0C1\uD0DC\uB97C \uC9C1\uAD00\uC801\uC73C\uB85C \uD655\uC778\uD569\uB2C8\uB2E4."},weekly:{label:"\uBE0C\uB9AC\uD551",desc:"\uC774\uBC88 \uC8FC\uC640 \uC774\uBC88 \uB2EC \uD65C\uB3D9 \uD750\uB984\uC744 \uC694\uC57D \uCE74\uB4DC \uC704\uC8FC\uB85C \uBE60\uB974\uAC8C \uD6D1\uC5B4\uBCFC \uC218 \uC788\uC2B5\uB2C8\uB2E4."},ranking:{label:"\uB7AD\uD0B9",desc:"\uB300\uD559\uBCC4 \uC131\uACFC\uB97C \uB9AC\uB354\uBCF4\uB4DC \uD615\uD0DC\uB85C \uC815\uB9AC\uD574 \uBE44\uAD50\uAC00 \uC27D\uB3C4\uB85D \uAD6C\uC131\uD569\uB2C8\uB2E4."},heatmap:{label:"\uD788\uD2B8\uB9F5",desc:"\uBD84\uD3EC\uC640 \uC9D1\uC911 \uAD6C\uAC04\uC744 \uC0C9 \uBC00\uB3C4\uB85C \uD655\uC778\uD560 \uC218 \uC788\uAC8C \uC815\uB9AC\uD569\uB2C8\uB2E4."},bubble:{label:"\uBC84\uBE14\uB9F5",desc:"\uADDC\uBAA8\uC640 \uBE44\uC911\uC744 \uC2DC\uAC01\uC801\uC73C\uB85C \uBE44\uAD50\uD558\uAE30 \uC27D\uAC8C \uBC30\uCE58\uD569\uB2C8\uB2E4."},radar:{label:"\uB808\uC774\uB354",desc:"\uB300\uD559\uBCC4 \uAC15\uC810\uACFC \uADE0\uD615\uAC10\uC744 \uB2E4\uCC28\uC6D0\uC73C\uB85C \uBE44\uAD50\uD574\uC11C \uBCF4\uC5EC\uC90D\uB2C8\uB2E4."},summary:{label:"\uC694\uC57D",desc:"\uD575\uC2EC \uC22B\uC790\uC640 \uD750\uB984\uB9CC \uBAA8\uC544 \uAC04\uACB0\uD558\uAC8C \uD655\uC778\uD560 \uC218 \uC788\uB3C4\uB85D \uAD6C\uC131\uD569\uB2C8\uB2E4."},compare:{label:"\uB300\uD559\uBE44\uAD50",desc:"\uC5EC\uB7EC \uB300\uD559 \uC9C0\uD45C\uB97C \uD55C \uC790\uB9AC\uC5D0\uC11C \uBE44\uAD50\uD558\uAE30 \uC88B\uAC8C \uC815\uB9AC\uD569\uB2C8\uB2E4."},old:{label:"\uAD6C\uD604\uD669\uD310",desc:"\uAE30\uC874 \uD604\uD669\uD310 \uB808\uC774\uC544\uC6C3\uC744 \uADF8\uB300\uB85C \uC720\uC9C0\uD558\uBA74\uC11C \uD604\uC7AC \uB370\uC774\uD130\uC640 \uC5F0\uACB0\uD569\uB2C8\uB2E4."}}[_b2View]||{label:"\uD604\uD669\uD310",desc:"\uC5EC\uB7EC \uC2DC\uAC01\uD654\uC640 \uCE74\uB4DC\uD615 \uD654\uBA74\uC73C\uB85C \uD604\uD669\uC744 \uBE60\uB974\uAC8C \uD0D0\uC0C9\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4."},filterBar=`
    ${`
    <style>
      #rtitle { caret-color: transparent; }
      #rcont { caret-color: transparent; }
      #rcont input, #rcont textarea, #rcont [contenteditable="true"] { caret-color: auto; }
      .b2-shell{display:flex;flex-direction:column;gap:14px}
      .b2-hero{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;padding:22px 24px;border-radius:28px;border:1px solid rgba(148,163,184,.18);background:linear-gradient(180deg,rgba(255,255,255,.99),rgba(248,250,252,.97));box-shadow:0 20px 36px rgba(15,23,42,.06)}
      .b2-hero-main{display:flex;flex-direction:column;gap:10px;min-width:0}
      .b2-hero-kicker{font-size:var(--fs-caption);font-weight:900;letter-spacing:.08em;color:#2563eb;text-transform:uppercase}
      .b2-hero-title{font-size:30px;font-weight:950;letter-spacing:-.04em;color:var(--text1);line-height:1.08}
      .b2-hero-desc{font-size:var(--fs-base);line-height:1.65;color:var(--text3);max-width:760px}
      .b2-hero-stats{display:grid;grid-template-columns:repeat(3,minmax(112px,1fr));gap:10px;min-width:min(100%,360px)}
      .b2-hero-stat{padding:14px 14px 12px;border-radius:20px;border:1px solid rgba(148,163,184,.18);background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.94));box-shadow:0 10px 20px rgba(15,23,42,.05)}
      .b2-hero-stat-label{font-size:var(--fs-caption);font-weight:800;color:var(--text3);margin-bottom:6px}
      .b2-hero-stat-value{font-size:22px;font-weight:950;letter-spacing:-.03em;color:var(--text1);line-height:1}
      .b2-hero-stat-sub{margin-top:5px;font-size:var(--fs-caption);font-weight:700;color:var(--text3)}
      .b2-toolbar-card{padding:12px;border-radius:24px;border:1px solid rgba(148,163,184,.18);background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.95));box-shadow:0 14px 28px rgba(15,23,42,.05)}
      #b2-nav.b2-nav-new{display:flex;align-items:center;gap:10px;flex-wrap:wrap;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none}
      #b2-nav.b2-nav-new::-webkit-scrollbar{display:none}
      .b2-toolbar-main{display:flex;align-items:center;gap:4px;flex-wrap:nowrap;flex-shrink:0}
      .b2-toolbar-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-left:auto}
      .b2-nav-playerfilters{display:flex;align-items:center;gap:6px;flex-wrap:wrap;min-width:0}
      .b2-tab-pill{border-color:rgba(148,163,184,.18);background:rgba(255,255,255,.88);box-shadow:0 6px 12px rgba(15,23,42,.04)}
      .b2-tab-pill.on{box-shadow:0 10px 18px rgba(37,99,235,.14)}
      .b2-toolbar-select{box-shadow:0 6px 14px rgba(15,23,42,.04)}
      .b2-toolbar-btn{box-shadow:0 8px 16px rgba(15,23,42,.05)}
      .b2-current-filter{background:rgba(37,99,235,.10)!important;border-color:rgba(37,99,235,.20)!important;color:#1d4ed8!important}
      .b2-filter-toggle{box-shadow:0 6px 14px rgba(15,23,42,.04)}
      .b2-filter-toggle.is-on{box-shadow:0 10px 18px rgba(245,158,11,.20)}
      .b2-content-shell{padding:14px;border-radius:26px;border:1px solid rgba(148,163,184,.18);background:linear-gradient(180deg,rgba(255,255,255,.99),rgba(248,250,252,.96));box-shadow:0 20px 34px rgba(15,23,42,.05)}
      #b2-content{min-height:260px}
      ${_navTight}
      body.dark .b2-hero,
      body.dark .b2-toolbar-card,
      body.dark .b2-content-shell{background:linear-gradient(180deg,rgba(15,23,42,.95),rgba(15,23,42,.90));border-color:#334155;box-shadow:0 20px 34px rgba(0,0,0,.24),inset 0 1px 0 rgba(255,255,255,.03)}
      body.dark .b2-hero-stat{background:linear-gradient(180deg,rgba(30,41,59,.90),rgba(15,23,42,.88));border-color:#334155;box-shadow:none}
      body.dark .b2-tab-pill{background:rgba(15,23,42,.82);border-color:#334155;box-shadow:none}
      body.dark .b2-current-filter{background:rgba(59,130,246,.16)!important;border-color:rgba(96,165,250,.28)!important;color:#bfdbfe!important}
      @media (max-width:980px){
        .b2-hero{flex-direction:column}
        .b2-hero-stats{width:100%;grid-template-columns:repeat(3,minmax(0,1fr))}
      }
      @media (max-width:760px){
        .b2-shell{overflow-x:hidden;max-width:100%}
        .b2-hero{display:none}
        .b2-toolbar-card,.b2-content-shell{padding:10px;border-radius:20px;overflow-x:hidden}
        #b2-content{overflow-x:hidden;max-width:100%}
      }
    </style>`}
    <div class="b2-shell">
      <section class="b2-hero">
        <div class="b2-hero-main">
          <div class="b2-hero-kicker">Board Dashboard</div>
          <div class="b2-hero-title">\uD604\uD669\uD310</div>
          <div class="b2-hero-desc">${_curViewMeta.desc}</div>
        </div>
        <div class="b2-hero-stats">
          <div class="b2-hero-stat">
            <div class="b2-hero-stat-label">\uD604\uC7AC \uBCF4\uAE30</div>
            <div class="b2-hero-stat-value">${_curViewMeta.label}</div>
            <div class="b2-hero-stat-sub">\uC790\uC8FC \uC4F0\uB294 \uD558\uC704 \uD654\uBA74\uC73C\uB85C \uC989\uC2DC \uC804\uD658</div>
          </div>
          <div class="b2-hero-stat">
            <div class="b2-hero-stat-label">\uD45C\uC2DC \uC2A4\uD2B8\uB9AC\uBA38</div>
            <div class="b2-hero-stat-value">${visPlayers.length}</div>
            <div class="b2-hero-stat-sub">\uC228\uAE40\xB7\uC740\uD1F4 \uC81C\uC678 \uAE30\uC900</div>
          </div>
          <div class="b2-hero-stat">
            <div class="b2-hero-stat-label">\uD65C\uC131 \uB300\uD559</div>
            <div class="b2-hero-stat-value">${univList.length}</div>
            <div class="b2-hero-stat-sub">\uC774\uBC88\uC8FC \uD65C\uB3D9 ${_heroWeekActive}\uBA85</div>
          </div>
        </div>
      </section>
      <div class="b2-toolbar-card">
        <div id="b2-nav" class="b2-nav b2-nav-new">
          <div class="b2-toolbar-main">
        ${weeklyBtn}
        ${_b2TabBtn2("lineup","#dc2626",typeof getTabLabel=="function"?getTabLabel("board2","lineup","\u{1F3BD} \uB77C\uC778\uC5C5"):"\u{1F3BD} \uB77C\uC778\uC5C5")}
        ${_b2TabBtn2("univ","var(--blue)",typeof getTabLabel=="function"?getTabLabel("board2","univ","\u{1F3DF}\uFE0F \uB300\uD559\uBCC4"):"\u{1F3DF}\uFE0F \uB300\uD559\uBCC4")}
        ${_b2TabBtn2("femco","var(--blue)",typeof getTabLabel=="function"?getTabLabel("board2","femco","\u{1F9E9} \uD3A8\uCF54"):"\u{1F9E9} \uD3A8\uCF54")}
        ${_b2TabBtn2("free","var(--blue)",typeof getTabLabel=="function"?getTabLabel("board2","free","\u{1F6B6} \uBB34\uC18C\uC18D"):"\u{1F6B6} \uBB34\uC18C\uC18D")}
        ${_b2TabBtn2("players","var(--purple)",typeof getTabLabel=="function"?getTabLabel("board2","players",profileTabLabel):profileTabLabel)}
        <span style="width:1px;height:20px;background:var(--border2);display:inline-block;flex-shrink:0"></span>
        ${heatmapBtn}
        ${bubbleBtn}
        ${radarBtn}
        <span style="width:1px;height:20px;background:var(--border2);display:inline-block;flex-shrink:0"></span>
        ${summaryBtn}
        ${compareBtn}
        ${oldBtn}
          </div>
          ${playerFilters}
          <div class="b2-toolbar-actions">${rightBtns}</div>
        </div>
      </div>
      ${_b2View==="lineup"?`
      <div style="display:flex;align-items:center;gap:8px;margin:-6px 0 14px;padding:8px 12px;background:var(--surface);border:1px solid var(--border);border-radius:12px;overflow-x:auto;scrollbar-width:none" class="b2-lineup-jumpbar">
        <span style="font-size:var(--fs-caption);font-weight:800;color:var(--gray-l);flex-shrink:0;white-space:nowrap">\u{1F3EB} \uBC14\uB85C\uAC00\uAE30</span>
        <span style="width:1px;height:14px;background:var(--border2);flex-shrink:0"></span>
        ${univList.map(u=>{const _uc=gc(u.name),_on=u.name===_b2LineupUniv;return`<button type="button" onclick="_b2LineupUniv='${u.name.replace(/'/g,"\\'")}';document.getElementById('b2-content').innerHTML=_b2LineupView();injectUnivIcons(document.getElementById('b2-content'));render();" style="padding:2px 9px;border-radius:999px;border:1px solid ${_on?_uc:"transparent"};background:${_on?_uc+"1a":"var(--white)"};color:${_on?_uc:"var(--text3)"};font-size:10px;font-weight:${_on?900:700};cursor:pointer;white-space:nowrap;flex-shrink:0;transition:all .15s">${u.name}</button>`}).join("")}
      </div>
      `:""}
      <div class="b2-content-shell">
        <div id="b2-content"></div>
      </div>
    </div>
  `;C.innerHTML=filterBar;try{const _b2SchedulePrewarm=()=>{try{if(typeof prewarmImageUrls!="function")return;const _dissSet2=new Set((typeof univCfg!="undefined"?univCfg:[]).filter(u=>u.dissolved||u.hidden).map(u=>String(u.name||"").trim())),photoUrls=[];(Array.isArray(players)?players:[]).filter(p=>p&&!p.hidden&&!p.retired&&!p.hideFromBoard&&!_dissSet2.has(String((p==null?void 0:p.univ)||"").trim())).slice(0,220).forEach(p=>{p.photo&&photoUrls.push(p.photo)}),prewarmImageUrls(photoUrls,180)}catch(e){}};typeof window.requestIdleCallback=="function"?window.requestIdleCallback(_b2SchedulePrewarm,{timeout:1200}):setTimeout(_b2SchedulePrewarm,450)}catch(e){}const sub=document.getElementById("b2-content"),_renderSub=()=>{const sub2=document.getElementById("b2-content");if(!sub2)return;if(new Set(["univ","femco","free","players","lineup","summary","weekly","ranking","radar","compare","heatmap","bubble","old"]).has(String(_b2View||""))||(_b2View="univ"),_b2View==="univ"){sub2.innerHTML=_b2UnivView(),injectUnivIcons(sub2),_b2BindAutoFitResize();try{_b2LazyLoadBgLayers(sub2)}catch(e){}setTimeout(()=>{try{window._precacheVisibleImages&&window._precacheVisibleImages(sub2,60)}catch(e){}},120)}else _b2View==="femco"?(sub2.innerHTML=_b2FemcoView(),injectUnivIcons(sub2),setTimeout(()=>{try{window._precacheVisibleImages&&window._precacheVisibleImages(sub2,80)}catch(e){}},120),requestAnimationFrame(()=>{try{sub2.querySelectorAll(".b2-femco-grid").forEach(g=>{g.scrollLeft=0})}catch(e){console.warn("[rBoard] \uD3A8\uCF54 \uADF8\uB9AC\uB4DC \uC2A4\uD06C\uB864 \uCD08\uAE30\uD654 \uC2E4\uD328:",e.message)}})):_b2View==="free"?(sub2.innerHTML=_b2FreeView(),injectUnivIcons(sub2),setTimeout(()=>{try{window._precacheVisibleImages&&window._precacheVisibleImages(sub2,60)}catch(e){}},120)):_b2View==="players"?(sub2.innerHTML=_b2PlayersView(),_b2BindAutoFitResize(),setTimeout(()=>{try{_b2SelectedPlayer&&typeof _b2ApplyImgSettingsToDom=="function"&&(_b2ApplyImgSettingsToDom(_b2SelectedPlayer.name,"primary"),_b2ApplyImgSettingsToDom(_b2SelectedPlayer.name,"secondary")),_b2ApplyBgAutoSizing(sub2)}catch(e){console.error("[rBoard] \uC774\uBBF8\uC9C0 \uC124\uC815 \uC801\uC6A9 \uC2E4\uD328:",e.message)}},0),setTimeout(()=>{try{window._precacheVisibleImages&&window._precacheVisibleImages(sub2,80)}catch(e){}},160)):_b2View==="lineup"?(sub2.innerHTML=_b2LineupView(),injectUnivIcons&&injectUnivIcons(sub2),setTimeout(()=>{try{window._precacheVisibleImages&&window._precacheVisibleImages(sub2,60)}catch(e){}},120)):_b2View==="summary"?(sub2.innerHTML=_b2SummaryView(),injectUnivIcons&&injectUnivIcons(sub2)):_b2View==="weekly"?(sub2.innerHTML=_b2WeeklyBriefingView(),injectUnivIcons&&injectUnivIcons(sub2),_b2InjectAndRunScripts(sub2)):_b2View==="ranking"?(sub2.innerHTML=_b2RankingView(),injectUnivIcons&&injectUnivIcons(sub2)):_b2View==="radar"?(sub2.innerHTML=_b2RadarView(),_b2InjectAndRunScripts(sub2)):_b2View==="compare"?(sub2.innerHTML=_b2CompareView(),injectUnivIcons&&injectUnivIcons(sub2)):_b2View==="heatmap"?(sub2.innerHTML=_b2HeatmapView(),_b2InjectAndRunScripts(sub2)):_b2View==="bubble"?(sub2.innerHTML=_b2BubbleView(),_b2InjectAndRunScripts(sub2)):_b2View==="old"&&(typeof rBoard=="function"?rBoard(sub2,T):(sub2.innerHTML='<div style="padding:40px;text-align:center;color:var(--gray-l)">\uAD6C\uD604\uD669\uD310 \uB85C\uB529 \uC911...</div>',(async()=>{try{typeof window._ensureCloudBoardLoaded=="function"&&await window._ensureCloudBoardLoaded()}catch(e){}try{if(_b2View!=="old")return;typeof rBoard=="function"?rBoard(sub2,T):sub2.innerHTML='<div style="padding:40px;text-align:center;color:var(--gray-l)">\uAD6C\uD604\uD669\uD310\uC744 \uBD88\uB7EC\uC62C \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.</div>'}catch(e){sub2.innerHTML='<div style="padding:40px;text-align:center;color:#dc2626">\uAD6C\uD604\uD669\uD310 \uC624\uB958: '+String(e&&e.message||e)+"</div>"}})()))};try{_renderSub()}catch(e){console.error("[rBoard2] sub render fail",e);try{const sub2=document.getElementById("b2-content");sub2&&(sub2.innerHTML='<div style="padding:40px;text-align:center;color:#dc2626">\uD604\uD669\uD310 \uB80C\uB354\uB9C1 \uC624\uB958: '+String(e&&e.message||e)+"</div>")}catch(_){}}}catch(e){console.error("[rBoard2] \uC624\uB958:",e),C.innerHTML=`<div style="padding:40px;text-align:center;color:#dc2626">
      <div style="font-weight:700;margin-bottom:8px">\uD604\uD669\uD310 \uB85C\uB529 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4</div>
      <div style="font-size:var(--fs-sm);color:var(--gray-l)">${e.message}</div>
    </div>`}}

/* board2-univ-views.js */
var __defProp=Object.defineProperty,__defProps=Object.defineProperties;var __getOwnPropDescs=Object.getOwnPropertyDescriptors;var __getOwnPropSymbols=Object.getOwnPropertySymbols;var __hasOwnProp=Object.prototype.hasOwnProperty,__propIsEnum=Object.prototype.propertyIsEnumerable;var __defNormalProp=(obj,key,value)=>key in obj?__defProp(obj,key,{enumerable:!0,configurable:!0,writable:!0,value}):obj[key]=value,__spreadValues=(a,b)=>{for(var prop in b||(b={}))__hasOwnProp.call(b,prop)&&__defNormalProp(a,prop,b[prop]);if(__getOwnPropSymbols)for(var prop of __getOwnPropSymbols(b))__propIsEnum.call(b,prop)&&__defNormalProp(a,prop,b[prop]);return a},__spreadProps=(a,b)=>__defProps(a,__getOwnPropDescs(b));function _b2UnivView(){let univList=_b2VisUnivs().filter(u=>u.name!=="\uBB34\uC18C\uC18D"&&u.name);if(!univList.length)return'<div style="text-align:center;color:var(--text3);padding:40px">\uD45C\uC2DC\uD560 \uB300\uD559\uC774 \uC5C6\uC2B5\uB2C8\uB2E4</div>';const _dissSet=new Set((typeof univCfg!="undefined"?univCfg:[]).filter(u=>u.dissolved).map(u=>String(u.name||"").trim())),_univNameSet=new Set(univList.map(u=>String(u&&u.name||"").trim()).filter(Boolean)),membersByUniv={},_allVis=[];(players||[]).forEach(p=>{const pu=String((p==null?void 0:p.univ)||"").trim();_univNameSet.has(pu)&&(p.hidden||p.retired||p.hideFromBoard||_dissSet.has(pu)||(_allVis.push(p),(membersByUniv[pu]||(membersByUniv[pu]=[])).push(p)))});const _tierCts={};_allVis.forEach(p=>{const t=p.tier||"?";_tierCts[t]=(_tierCts[t]||0)+1});const{fromN:_uvFromN,toN:_uvToN}=_b2ThisWeekRange(),_uvWeeklyStats=_b2WeeklyAggregate(_allVis,String(_uvFromN).replace(/(\d{4})(\d{2})(\d{2})/,"$1-$2-$3"),String(_uvToN).replace(/(\d{4})(\d{2})(\d{2})/,"$1-$2-$3")),_uvWeekActive=_uvWeeklyStats.filter(s=>s.total>0).length,_uvWeekG=_uvWeeklyStats.reduce((acc,s)=>acc+s.total,0),_uvRaces={P:0,T:0,Z:0};_allVis.forEach(p=>{const r=String(p.race||"").trim().toUpperCase();(r==="P"||r==="T"||r==="Z")&&_uvRaces[r]++});const _uvTotal=_uvRaces.P+_uvRaces.T+_uvRaces.Z,_uvRaceBar=_uvTotal>0?["T","P","Z"].map(r=>{const meta={T:{cls:"race-T",label:"\uD14C\uB780"},P:{cls:"race-P",label:"\uD504\uB85C\uD1A0\uC2A4"},Z:{cls:"race-Z",label:"\uC800\uADF8"}}[r];if(!_uvRaces[r])return"";const pct=Math.round(_uvRaces[r]/_uvTotal*100);return`<button type="button" class="b2-race-badge ${meta.cls}" title="${meta.label} ${pct}%" style="cursor:pointer" onclick="if(typeof openB2RaceTierModal==='function')openB2RaceTierModal('${r}')">${r}<span style="opacity:.75;font-size:10px;margin-left:6px">${pct}%</span></button>`}).filter(Boolean).join(""):"",_uvTierBtns=(Array.isArray(TIERS)?TIERS:[]).filter(t=>_tierCts[t]).map(t=>{const col=typeof getTierBtnColor=="function"?getTierBtnColor(t):"#64748b",txt=typeof getTierBtnTextColor=="function"&&getTierBtnTextColor(t)||"#fff";return`<button type="button" class="b2-tier-badge" title="${t}\uD2F0\uC5B4 ${_tierCts[t]}\uBA85" style="cursor:pointer;background:${col};color:${txt};border:1px solid ${col}55" onclick="if(typeof openB2TierUnivModal==='function')openB2TierUnivModal('${String(t).replace(/\\/g,"\\\\").replace(/'/g,"\\'")}')">${t}</button>`}).join("");try{window._b2LastAllVisPlayers=_allVis}catch(e){}const _jumpChips=univList.map(u=>{if(!(membersByUniv[String(u.name||"").trim()]||[]).length)return"";const col=gc(u.name),txtCol=_b2ContrastColor(col),anchorId="b2-univ-anchor-"+u.name.replace(/[^a-zA-Z0-9가-힣]/g,"_"),safeName=typeof window.escHTML=="function"?window.escHTML(u.name):String(u.name||"");return`<button class="b2-jump-chip" onclick="const el=document.getElementById('${anchorId}');if(el){el.scrollIntoView({behavior:'smooth',block:'start'});}" style="--chip-color:${col}40;border:1.5px solid ${col}bb;background:linear-gradient(135deg,${col}ee,${col}cc);color:${txtCol}"><span style="letter-spacing:-.01em">${safeName}</span></button>`}).join(""),_viewMode=_b2GetUnivProfileViewMode(),_viewBtn=[["default","\uAE30\uBCF8",""],["poster","\uD3EC\uC2A4\uD130",""],["glass","\uAE00\uB798\uC2A4","\u2728"],["table","\uD14C\uC774\uBE14","\u{1F4CB}"]].map(([mode,label,ico])=>`<button type="button" class="b2-seg-btn${_viewMode===mode?" on":""}" onclick="_b2SetUnivProfileViewMode('${mode}')">${ico?ico+" ":""}${label}</button>`).join(""),statsBar=`<div style="margin-bottom:12px">
    <div style="padding:14px;border-radius:22px;border:1px solid rgba(148,163,184,.18);background:linear-gradient(180deg,rgba(255,255,255,.99),rgba(248,250,252,.96));box-shadow:0 16px 28px rgba(15,23,42,.05);display:flex;flex-direction:column;gap:8px">
      <div class="b2-race-tier-row b2-stats-subrow">
        <span class="b2-section-label">\u2694\uFE0F \uC885\uC871 \uBE44\uC911</span>
        ${_uvRaceBar||'<span style="font-size:var(--fs-caption);font-weight:700;color:var(--gray-l)">\uC9D1\uACC4 \uC5C6\uC74C</span>'}
        ${_uvTierBtns?`<span class="b2-subrow-divider"></span><span class="b2-section-label">\u{1F3C5} \uD2F0\uC5B4</span>${_uvTierBtns}`:""}
      </div>
      <div class="b2-jump-row b2-stats-subrow">
        <span class="b2-section-label">\u{1F3DB}\uFE0F \uBC14\uB85C\uAC00\uAE30</span>
        ${_jumpChips}
      </div>
      <div class="b2-mode-row b2-stats-subrow" style="justify-content:space-between">
        <span class="b2-section-label">\u{1F5BC}\uFE0F \uBAA8\uB4DC</span>
        <div class="b2-seg-track">${_viewBtn}</div>
      </div>
    </div>
  </div>`,_b2Cols=typeof boardGridCols!="undefined"&&boardGridCols===2?"repeat(2,1fr)":"1fr";let h=statsBar+"<style>.b2-bottom-img{max-width:130px;max-height:110px;object-fit:contain;}.b2-side-panel{float:right;width:230px;margin:0 0 6px 10px;border-radius:var(--r);padding:8px;box-sizing:border-box;}@media(min-width:769px) and (max-width:1024px){.b2-univ-grid{grid-template-columns:1fr!important;}.b2-side-panel{width:180px;}}@media(max-width:900px){.b2-univ-grid{grid-template-columns:1fr!important;}}@media(max-width:640px){.b2-side-panel{display:none!important;}.b2-bottom-img{display:none!important;}.b2-univ-statsbar-grid{display:none!important;}}</style>";return h+=`<div class="b2-univ-grid" style="display:grid;grid-template-columns:${_b2Cols};gap:12px;align-items:start">`,univList.forEach(u=>{if(!u.name){console.warn("[\uD604\uD669\uD310] \uB300\uD559 \uC774\uB984\uC774 \uC5C6\uB294 \uB370\uC774\uD130\uAC00 \uBC1C\uACAC\uB418\uC5C8\uC2B5\uB2C8\uB2E4:",u);return}const members=membersByUniv[String(u.name||"").trim()]||[],_anchorId="b2-univ-anchor-"+u.name.replace(/[^a-zA-Z0-9가-힣]/g,"_");h+=`<div id="${_anchorId}" style="scroll-margin-top:56px">`+_b2UnivBlock(u.name,gc(u.name),members)+"</div>"}),h+="</div>",h}try{window.openB2RaceTierModal||(window.openB2RaceTierModal=function(race){try{const list=Array.isArray(window._b2LastAllVisPlayers)?window._b2LastAllVisPlayers:[],rc=String(race||"").trim().toUpperCase(),label=rc==="P"?"\uD504\uB85C\uD1A0\uC2A4":rc==="T"?"\uD14C\uB780":rc==="Z"?"\uC800\uADF8":"\uC885\uC871",pool=list.filter(p=>String((p==null?void 0:p.race)||"").trim().toUpperCase()===rc),tiers=Array.isArray(window.TIERS)&&window.TIERS.length?window.TIERS.slice():["S","A","B","C","D","E","F","?"],counts={},univCounts={};if(pool.forEach(p=>{const t=String((p==null?void 0:p.tier)||"?"),u=String((p==null?void 0:p.univ)||"\uBB34\uC18C\uC18D");counts[t]=(counts[t]||0)+1,univCounts[u]=(univCounts[u]||0)+1}),window._b2RaceTierState=window._b2RaceTierState||{},window._b2RaceTierState.race=rc,window._b2RaceTierState.tier=window._b2RaceTierState.tier||"ALL",window._b2RaceTierState.univ=window._b2RaceTierState.univ||"ALL",window._b2RaceTierState.list=pool,window._b2RaceTierState.counts=counts,window._b2RaceTierState.univCounts=univCounts,window._b2RaceTierState.tiers=tiers,window._b2RaceTierState.label=label,!document.getElementById("b2RaceTierStyle")){const st=document.createElement("style");st.id="b2RaceTierStyle",st.textContent=`
            #b2RaceTierOverlay{display:none;position:fixed;inset:0;z-index:6000;background:rgba(2,6,23,.42);backdrop-filter:blur(6px)}
            #b2RaceTierOverlay .su-modal{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:min(1120px,calc(100vw - 28px));height:min(820px,calc(100vh - 28px));background:linear-gradient(180deg,rgba(255,255,255,.985),rgba(248,250,252,.96));border:1px solid rgba(148,163,184,.18);border-radius:26px;box-shadow:0 30px 64px rgba(15,23,42,.22);display:flex;flex-direction:column;overflow:hidden}
            #b2RaceTierOverlay .su-modal-hd{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:14px 16px;border-bottom:1px solid rgba(148,163,184,.14);background:linear-gradient(135deg,rgba(239,246,255,.96),rgba(255,255,255,.92))}
            #b2RaceTierOverlay .su-modal-bd{padding:14px 14px 16px;overflow:auto;flex:1;min-height:0}
            #b2RaceTierOverlay .b2rt-title{font-size:16px;font-weight:1000;letter-spacing:-.02em;color:var(--text1)}
            #b2RaceTierOverlay .b2rt-sub{font-size:var(--fs-caption);font-weight:800;color:var(--text3)}
            #b2RaceTierOverlay .b2rt-summary{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:10px}
            #b2RaceTierOverlay .b2rt-summarycard{padding:12px 13px;border-radius:18px;background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.94));border:1px solid rgba(148,163,184,.14);box-shadow:0 10px 24px rgba(15,23,42,.06)}
            #b2RaceTierOverlay .b2rt-summarylabel{font-size:10px;font-weight:900;letter-spacing:.08em;color:var(--text3);text-transform:uppercase}
            #b2RaceTierOverlay .b2rt-summaryvalue{margin-top:7px;font-size:20px;font-weight:1000;letter-spacing:-.03em;color:var(--text1)}
            #b2RaceTierOverlay .b2rt-summarymeta{margin-top:4px;font-size:var(--fs-caption);font-weight:800;color:var(--text3)}
            #b2RaceTierOverlay .b2rt-univbar{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}
            #b2RaceTierOverlay .b2rt-univbtn{display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border-radius:999px;border:1px solid rgba(148,163,184,.16);background:rgba(248,250,252,.98);font-size:var(--fs-caption);font-weight:900;color:var(--text2);cursor:pointer}
            #b2RaceTierOverlay .b2rt-univbtn.on{border-color:rgba(37,99,235,.35);background:linear-gradient(180deg,rgba(239,246,255,.98),rgba(219,234,254,.92));color:#1d4ed8}
            #b2RaceTierOverlay .b2rt-groupgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px;margin-top:12px;margin-bottom:2px}
            #b2RaceTierOverlay .b2rt-groupcard{padding:12px 13px;border-radius:18px;background:linear-gradient(180deg,rgba(255,255,255,.99),rgba(248,250,252,.95));border:1px solid rgba(148,163,184,.14);box-shadow:0 10px 22px rgba(15,23,42,.06);cursor:pointer}
            #b2RaceTierOverlay .b2rt-grouphead{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px}
            #b2RaceTierOverlay .b2rt-groupname{font-size:var(--fs-base);font-weight:950;color:var(--text1);display:flex;align-items:center;gap:6px;min-width:0}
            #b2RaceTierOverlay .b2rt-groupcount{font-size:var(--fs-caption);font-weight:900;color:var(--text3);flex-shrink:0}
            #b2RaceTierOverlay .b2rt-groupavatars{display:flex;flex-wrap:wrap;gap:6px}
            #b2RaceTierOverlay .b2rt-av{width:44px;height:44px;border-radius:var(--r2);overflow:hidden;border:1px solid rgba(148,163,184,.16);background:linear-gradient(160deg,rgba(148,163,184,.26),rgba(15,23,42,.12));box-shadow:0 6px 14px rgba(15,23,42,.08);cursor:pointer;padding:0}
            #b2RaceTierOverlay .b2rt-av img{width:100%;height:100%;object-fit:cover;object-position:top center;display:block}
            #b2RaceTierOverlay .b2rt-av span{display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:14px;font-weight:1000;color:rgba(255,255,255,.75)}
            #b2RaceTierOverlay .b2rt-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:12px;margin-top:12px}
            #b2RaceTierOverlay .b2rt-card{position:relative;border-radius:18px;overflow:hidden;aspect-ratio:0.78;background:#0b1120;border:1px solid rgba(255,255,255,.14);box-shadow:0 10px 22px rgba(15,23,42,.10);cursor:pointer}
            #b2RaceTierOverlay .b2rt-card img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center}
            #b2RaceTierOverlay .b2rt-topbadges{position:absolute;left:10px;right:10px;top:10px;display:flex;align-items:center;justify-content:space-between;gap:8px;z-index:2}
            #b2RaceTierOverlay .b2rt-pill{display:inline-flex;align-items:center;gap:4px;padding:5px 9px;border-radius:999px;background:rgba(15,23,42,.72);border:1px solid rgba(255,255,255,.28);backdrop-filter:blur(10px);font-size:var(--fs-caption);font-weight:900;color:#fff}
            #b2RaceTierOverlay .b2rt-fb{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:1000;color:rgba(255,255,255,.85);background:linear-gradient(160deg,rgba(71,85,105,.55),rgba(15,23,42,.42))}
            #b2RaceTierOverlay .b2rt-bottom{position:absolute;left:0;right:0;bottom:0;padding:10px 10px 12px;display:flex;flex-direction:column;gap:4px}
            #b2RaceTierOverlay .b2rt-bottom::before{content:'';position:absolute;left:0;right:0;bottom:0;height:78%;background:linear-gradient(180deg,rgba(15,23,42,0) 0%,rgba(15,23,42,.40) 24%,rgba(4,7,18,.92) 100%);pointer-events:none}
            #b2RaceTierOverlay .b2rt-bottom>*{position:relative;z-index:1}
            #b2RaceTierOverlay .b2rt-name{font-size:var(--fs-base);font-weight:950;color:#fff;letter-spacing:-.02em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-shadow:0 2px 8px rgba(0,0,0,.5)}
            #b2RaceTierOverlay .b2rt-meta{display:flex;align-items:center;gap:6px;font-size:var(--fs-caption);font-weight:850;color:rgba(255,255,255,.92);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-shadow:0 1px 5px rgba(0,0,0,.5)}
            #b2RaceTierOverlay .b2rt-ubadge{display:inline-flex;align-items:center;gap:4px;max-width:100%;padding:2px 8px;border-radius:999px;border:1px solid rgba(255,255,255,.3);font-size:10.5px;font-weight:900;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;backdrop-filter:blur(6px);background:rgba(15,23,42,.55)!important}
            @media (max-width:780px){#b2RaceTierOverlay .su-modal{height:min(860px,calc(100vh - 14px));width:min(100vw - 14px,1120px);border-radius:22px}#b2RaceTierOverlay .b2rt-summary{grid-template-columns:1fr}#b2RaceTierOverlay .b2rt-grid{grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px}#b2RaceTierOverlay .b2rt-groupgrid{grid-template-columns:1fr}}
          `,document.head.appendChild(st)}let ov=document.getElementById("b2RaceTierOverlay");if(!ov){ov=document.createElement("div"),ov.id="b2RaceTierOverlay",ov.innerHTML=`
            <div class="su-modal">
              <div class="su-modal-hd">
                <div style="min-width:0;display:flex;flex-direction:column;gap:2px">
                  <div class="b2rt-title" id="b2rtTitle"></div>
                  <div class="b2rt-sub" id="b2rtSub"></div>
                </div>
                <button type="button" class="btn btn-r btn-sm" id="b2rtClose">\uB2EB\uAE30</button>
              </div>
              <div class="su-modal-bd">
                <div class="b2rt-summary" id="b2rtSummary"></div>
                <div class="b2rt-univbar" id="b2rtUnivBar"></div>
                <div id="b2rtGroup"></div>
                <div class="b2rt-grid" id="b2rtGrid"></div>
              </div>
            </div>
          `,document.body.appendChild(ov),ov.addEventListener("click",e=>{try{e.target&&e.target.id==="b2RaceTierOverlay"&&window.closeB2RaceTierModal()}catch(_){}});const btn=ov.querySelector("#b2rtClose");btn&&btn.addEventListener("click",()=>window.closeB2RaceTierModal()),window.closeB2RaceTierModal=function(){const el=document.getElementById("b2RaceTierOverlay");el&&(el.style.display="none")}}window._b2RaceTierRender=function(){const st=window._b2RaceTierState||{},ov2=document.getElementById("b2RaceTierOverlay");if(!ov2)return;const title=ov2.querySelector("#b2rtTitle"),sub=ov2.querySelector("#b2rtSub"),summary=ov2.querySelector("#b2rtSummary"),bar=ov2.querySelector("#b2rtUnivBar"),group=ov2.querySelector("#b2rtGroup"),grid=ov2.querySelector("#b2rtGrid");title&&(title.textContent=`\uC885\uC871 \uBE44\uC911 \xB7 ${st.label||""}`);const filtered=st.univ&&st.univ!=="ALL"?(st.list||[]).filter(p=>String((p==null?void 0:p.univ)||"\uBB34\uC18C\uC18D")===st.univ):st.list||[];if(sub&&(sub.textContent=`${st.univ&&st.univ!=="ALL"?`${st.univ} \xB7 `:""}${filtered.length}\uBA85`),summary){const topTierEntry=Object.entries(st.counts||{}).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]))[0],univLen=Object.keys(st.univCounts||{}).length;summary.innerHTML=`
              <div class="b2rt-summarycard">
                <div class="b2rt-summarylabel">\uCD1D \uC778\uC6D0</div>
                <div class="b2rt-summaryvalue">${filtered.length}</div>
                <div class="b2rt-summarymeta">${st.univ&&st.univ!=="ALL"?"\uC120\uD0DD \uB300\uD559 \uAE30\uC900":"\uC804\uCCB4 \uD45C\uC2DC \uAE30\uC900"}</div>
              </div>
              <div class="b2rt-summarycard">
                <div class="b2rt-summarylabel">\uBD84\uD3EC \uB300\uD559</div>
                <div class="b2rt-summaryvalue">${st.univ&&st.univ!=="ALL"?"1":univLen}</div>
                <div class="b2rt-summarymeta">${st.univ&&st.univ!=="ALL"?st.univ:"\uB300\uD559\uBCC4 \uBD84\uD3EC"}</div>
              </div>
              <div class="b2rt-summarycard">
                <div class="b2rt-summarylabel">\uD575\uC2EC \uD2F0\uC5B4</div>
                <div class="b2rt-summaryvalue">${topTierEntry?topTierEntry[0]:"-"}</div>
                <div class="b2rt-summarymeta">${topTierEntry?`${topTierEntry[1]}\uBA85`:"\uC9D1\uACC4 \uB300\uAE30"}</div>
              </div>`}if(bar){const univs=["ALL"].concat(Object.keys(st.univCounts||{}).sort((a,b)=>(st.univCounts[b]||0)-(st.univCounts[a]||0)||a.localeCompare(b)));bar.innerHTML=univs.map(u=>{const cnt=u==="ALL"?(st.list||[]).length:(st.univCounts||{})[u]||0,on=(st.univ||"ALL")===u,label2=u==="ALL"?`\uC804\uCCB4 (${cnt})`:`${u} (${cnt})`;return`<button type="button" class="b2rt-univbtn ${on?"on":""}" onclick="window._b2RaceTierSetUniv && window._b2RaceTierSetUniv('${String(u).replace(/'/g,"\\'")}')">${label2}</button>`}).join("")}if(group)if((st.univ||"ALL")==="ALL"){const groups=new Map;filtered.forEach(p=>{const u=String((p==null?void 0:p.univ)||"\uBB34\uC18C\uC18D");groups.has(u)?groups.get(u).push(p):groups.set(u,[p])});const ordered=Array.from(groups.entries()).sort((a,b)=>b[1].length-a[1].length||a[0].localeCompare(b[0]));group.innerHTML=`<div class="b2rt-groupgrid">${ordered.map(([univName,arr])=>{const col=typeof gc=="function"&&gc(univName)||"#64748b",logo=univName&&univName!=="\uBB34\uC18C\uC18D"&&typeof gUI=="function"?gUI(univName,typeof getUnivLogoSizeStr=="function"?getUnivLogoSizeStr(univName,"players","16px"):"16px"):"";return`<div class="b2rt-groupcard" onclick="window._b2RaceTierSetUniv && window._b2RaceTierSetUniv('${String(univName).replace(/'/g,"\\'")}')">
                  <div class="b2rt-grouphead">
                    <div class="b2rt-groupname" title="${String(univName).replace(/"/g,"&quot;")}"><span class="b2rt-pill" style="position:static;background:${col}22;border-color:${col}55;color:${col}">${logo}${univName}</span></div>
                    <div class="b2rt-groupcount">${arr.length}\uBA85</div>
                  </div>
                  <div class="b2rt-groupavatars">${arr.slice(0,8).map(p=>{const name=String((p==null?void 0:p.name)||""),nameJs=name.replace(/\\/g,"\\\\").replace(/'/g,"\\'"),photo=String((p==null?void 0:p.photo)||"").trim();return`<button type="button" class="b2rt-av" onclick="event.stopPropagation();if(typeof openPlayerModal==='function')openPlayerModal('${nameJs}')" title="${name.replace(/"/g,"&quot;")}">${photo?`<img src="${toHttpsUrl(photo).replace(/\"/g,"&quot;")}" loading="lazy" decoding="async" onerror="this.parentNode.innerHTML='<span>${String((p==null?void 0:p.race)||"?")}</span>'">`:`<span>${String((p==null?void 0:p.race)||"?")}</span>`}</button>`}).join("")}</div>
                </div>`}).join("")}</div>`}else group.innerHTML="";grid&&(grid.innerHTML=filtered.map(p=>{const name=String((p==null?void 0:p.name)||""),univ=String((p==null?void 0:p.univ)||"\uBB34\uC18C\uC18D"),tier=String((p==null?void 0:p.tier)||"?"),photo=String((p==null?void 0:p.photo)||"").trim(),uCol=typeof gc=="function"&&gc(univ)||"#64748b",uLogo=univ&&univ!=="\uBB34\uC18C\uC18D"&&typeof gUI=="function"?gUI(univ,typeof getUnivLogoSizeStr=="function"?getUnivLogoSizeStr(univ,"players","16px"):"16px"):"",nameJs=name.replace(/\\/g,"\\\\").replace(/'/g,"\\'"),img=photo?`<img src="${toHttpsUrl(photo).replace(/\"/g,"&quot;")}" loading="lazy" decoding="async" onerror="this.style.display='none'">`:"",fb=`<div class="b2rt-fb" style="display:${photo?"none":"flex"}">${String((p==null?void 0:p.race)||"?")}</div>`;return`<div class="b2rt-card" onclick="if(typeof openPlayerModal==='function')openPlayerModal('${nameJs}')">
                <div class="b2rt-topbadges">
                  <span class="b2rt-pill">${tier}\uD2F0\uC5B4</span>
                  <span class="b2rt-pill" style="background:${uCol}55;border-color:${uCol}88">${String((p==null?void 0:p.race)||"?")}</span>
                </div>
                ${img}${fb}
                <div class="b2rt-bottom">
                  <div class="b2rt-name" title="${name.replace(/\"/g,"&quot;")}">${name}</div>
                  <div class="b2rt-meta"><span>${tier}\uD2F0\uC5B4</span><span class="b2rt-ubadge" style="background:${uCol}22;border-color:${uCol}55;color:#fff">${uLogo}${univ}</span></div>
                </div>
              </div>`}).join(""))},window._b2RaceTierSetUniv=function(univ){window._b2RaceTierState=window._b2RaceTierState||{},window._b2RaceTierState.univ=String(univ||"ALL"),window._b2RaceTierRender&&window._b2RaceTierRender()};const ov3=document.getElementById("b2RaceTierOverlay");ov3&&(ov3.style.display="block"),window._b2RaceTierSetUniv("ALL")}catch(e){console.error(e)}})}catch(e){}try{window.openB2TierUnivModal||(window.openB2TierUnivModal=function(tier){try{const list=Array.isArray(window._b2LastAllVisPlayers)?window._b2LastAllVisPlayers:[],tt=String(tier||"?").trim(),pool=list.filter(p=>String((p==null?void 0:p.tier)||"?")===tt),groups=new Map;pool.forEach(p=>{const u=String((p==null?void 0:p.univ)||"\uBB34\uC18C\uC18D");groups.has(u)?groups.get(u).push(p):groups.set(u,[p])});const ordered=Array.from(groups.entries()).sort((a,b)=>b[1].length-a[1].length||a[0].localeCompare(b[0]));if(!document.getElementById("b2TierUnivStyle")){const st=document.createElement("style");st.id="b2TierUnivStyle",st.textContent=`
            #b2TierUnivOverlay{display:none;position:fixed;inset:0;z-index:6000;background:rgba(2,6,23,.42);backdrop-filter:blur(6px)}
            #b2TierUnivOverlay .su-modal{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:min(1120px,calc(100vw - 28px));height:min(860px,calc(100vh - 28px));background:linear-gradient(180deg,rgba(255,255,255,.985),rgba(248,250,252,.96));border:1px solid rgba(148,163,184,.18);border-radius:26px;box-shadow:0 30px 64px rgba(15,23,42,.22);display:flex;flex-direction:column;overflow:hidden}
            #b2TierUnivOverlay .su-modal-hd{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:14px 16px;border-bottom:1px solid rgba(148,163,184,.14);background:linear-gradient(135deg,rgba(239,246,255,.96),rgba(255,255,255,.92))}
            #b2TierUnivOverlay .su-modal-bd{padding:14px 14px 16px;overflow:auto;flex:1;min-height:0}
            #b2TierUnivOverlay .b2tu-title{font-size:16px;font-weight:1000;letter-spacing:-.02em;color:var(--text1)}
            #b2TierUnivOverlay .b2tu-sub{font-size:var(--fs-caption);font-weight:800;color:var(--text3)}
            #b2TierUnivOverlay .b2tu-summary{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-bottom:12px}
            #b2TierUnivOverlay .b2tu-summarycard{padding:12px 13px;border-radius:18px;background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.94));border:1px solid rgba(148,163,184,.14);box-shadow:0 10px 24px rgba(15,23,42,.06)}
            #b2TierUnivOverlay .b2tu-summarylabel{font-size:10px;font-weight:900;letter-spacing:.08em;color:var(--text3);text-transform:uppercase}
            #b2TierUnivOverlay .b2tu-summaryvalue{margin-top:7px;font-size:20px;font-weight:1000;letter-spacing:-.03em;color:var(--text1)}
            #b2TierUnivOverlay .b2tu-summarymeta{margin-top:4px;font-size:var(--fs-caption);font-weight:800;color:var(--text3)}
            #b2TierUnivOverlay .b2tu-filter{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px}
            #b2TierUnivOverlay .b2tu-filterbtn{display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border-radius:999px;border:1px solid rgba(148,163,184,.16);background:rgba(248,250,252,.98);font-size:var(--fs-caption);font-weight:900;color:var(--text2);cursor:pointer}
            #b2TierUnivOverlay .b2tu-filterbtn.on{border-color:rgba(37,99,235,.35);background:linear-gradient(180deg,rgba(239,246,255,.98),rgba(219,234,254,.92));color:#1d4ed8}
            #b2TierUnivOverlay .b2tu-groupgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px;margin-bottom:12px}
            #b2TierUnivOverlay .b2tu-groupcard{padding:12px 13px;border-radius:18px;background:linear-gradient(180deg,rgba(255,255,255,.99),rgba(248,250,252,.95));border:1px solid rgba(148,163,184,.14);box-shadow:0 10px 22px rgba(15,23,42,.06)}
            #b2TierUnivOverlay .b2tu-grouphead{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px}
            #b2TierUnivOverlay .b2tu-groupname{font-size:var(--fs-base);font-weight:950;color:var(--text1);display:flex;align-items:center;gap:6px;min-width:0}
            #b2TierUnivOverlay .b2tu-groupcount{font-size:var(--fs-caption);font-weight:900;color:var(--text3)}
            #b2TierUnivOverlay .b2tu-groupavatars{display:flex;flex-wrap:wrap;gap:6px}
            #b2TierUnivOverlay .b2tu-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:12px}
            #b2TierUnivOverlay .b2tu-card{position:relative;border-radius:18px;overflow:hidden;aspect-ratio:0.78;background:#0b1120;border:1px solid rgba(255,255,255,.14);box-shadow:0 10px 22px rgba(15,23,42,.10);cursor:pointer}
            #b2TierUnivOverlay .b2tu-card img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center}
            #b2TierUnivOverlay .b2tu-topbadges{position:absolute;left:10px;right:10px;top:10px;display:flex;align-items:center;justify-content:space-between;gap:8px;z-index:2}
            #b2TierUnivOverlay .b2tu-pill{display:inline-flex;align-items:center;gap:4px;padding:5px 9px;border-radius:999px;background:rgba(15,23,42,.72);border:1px solid rgba(255,255,255,.28);backdrop-filter:blur(10px);font-size:var(--fs-caption);font-weight:900;color:#fff}
            #b2TierUnivOverlay .b2tu-fb{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:1000;color:rgba(255,255,255,.85);background:linear-gradient(160deg,rgba(71,85,105,.55),rgba(15,23,42,.42))}
            #b2TierUnivOverlay .b2tu-bottom{position:absolute;left:0;right:0;bottom:0;padding:10px 10px 12px;display:flex;flex-direction:column;gap:4px}
            #b2TierUnivOverlay .b2tu-bottom::before{content:'';position:absolute;left:0;right:0;bottom:0;height:78%;background:linear-gradient(180deg,rgba(15,23,42,0) 0%,rgba(15,23,42,.40) 24%,rgba(4,7,18,.92) 100%);pointer-events:none}
            #b2TierUnivOverlay .b2tu-bottom>*{position:relative;z-index:1}
            #b2TierUnivOverlay .b2tu-name{font-size:var(--fs-base);font-weight:950;color:#fff;letter-spacing:-.02em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-shadow:0 2px 8px rgba(0,0,0,.5)}
            #b2TierUnivOverlay .b2tu-meta{display:flex;align-items:center;gap:6px;font-size:var(--fs-caption);font-weight:850;color:rgba(255,255,255,.92);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-shadow:0 1px 5px rgba(0,0,0,.5)}
            #b2TierUnivOverlay .b2tu-ubadge{display:inline-flex;align-items:center;gap:4px;max-width:100%;padding:2px 8px;border-radius:999px;border:1px solid rgba(255,255,255,.3);font-size:10.5px;font-weight:900;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;backdrop-filter:blur(6px);background:rgba(15,23,42,.55)!important}
            #b2TierUnivOverlay .b2tu-heat{display:grid;grid-template-columns:repeat(auto-fill,44px);gap:8px}
            #b2TierUnivOverlay .b2tu-av{width:44px;height:44px;border-radius:var(--r2);overflow:hidden;border:1px solid rgba(148,163,184,.16);background:linear-gradient(160deg,rgba(148,163,184,.26),rgba(15,23,42,.12));box-shadow:0 6px 14px rgba(15,23,42,.08);cursor:pointer;padding:0}
            #b2TierUnivOverlay .b2tu-av img{width:100%;height:100%;object-fit:cover;object-position:top center;display:block}
            #b2TierUnivOverlay .b2tu-av span{display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:14px;font-weight:1000;color:rgba(255,255,255,.75)}
            @media (max-width:780px){#b2TierUnivOverlay .su-modal{height:min(920px,calc(100vh - 14px));width:min(100vw - 14px,1120px);border-radius:22px}#b2TierUnivOverlay .b2tu-summary{grid-template-columns:1fr}#b2TierUnivOverlay .b2tu-groupgrid{grid-template-columns:1fr}#b2TierUnivOverlay .b2tu-grid{grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px}}
          `,document.head.appendChild(st)}let ov=document.getElementById("b2TierUnivOverlay");if(!ov){ov=document.createElement("div"),ov.id="b2TierUnivOverlay",ov.innerHTML=`
            <div class="su-modal">
              <div class="su-modal-hd">
                <div style="min-width:0;display:flex;flex-direction:column;gap:2px">
                  <div class="b2tu-title" id="b2tuTitle"></div>
                  <div class="b2tu-sub" id="b2tuSub"></div>
                </div>
                <button type="button" class="btn btn-r btn-sm" id="b2tuClose">\uB2EB\uAE30</button>
              </div>
              <div class="su-modal-bd">
                <div class="b2tu-summary" id="b2tuSummary"></div>
                <div class="b2tu-filter" id="b2tuFilter"></div>
                <div id="b2tuBody"></div>
              </div>
            </div>
          `,document.body.appendChild(ov),ov.addEventListener("click",e=>{try{e.target&&e.target.id==="b2TierUnivOverlay"&&window.closeB2TierUnivModal()}catch(_){}});const btn=ov.querySelector("#b2tuClose");btn&&btn.addEventListener("click",()=>window.closeB2TierUnivModal()),window.closeB2TierUnivModal=function(){const el=document.getElementById("b2TierUnivOverlay");el&&(el.style.display="none")}}window._b2TierUnivState={tier:tt,pool,ordered,selectedUniv:"ALL"};const title=ov.querySelector("#b2tuTitle"),sub=ov.querySelector("#b2tuSub"),body=ov.querySelector("#b2tuBody"),filter=ov.querySelector("#b2tuFilter"),summary=ov.querySelector("#b2tuSummary");title&&(title.textContent=`\uD2F0\uC5B4 \xB7 ${tt}\uD2F0\uC5B4`),window._b2TierUnivRender=function(){const st2=window._b2TierUnivState||{},selectedUniv=st2.selectedUniv||"ALL";filter&&(filter.innerHTML=["ALL"].concat((st2.ordered||[]).map(([univName])=>univName)).map(univName=>{const cnt=univName==="ALL"?(st2.pool||[]).length:(((st2.ordered||[]).find(([n])=>n===univName)||[])[1]||[]).length;return`<button type="button" class="b2tu-filterbtn ${selectedUniv===univName?"on":""}" onclick="window._b2TierUnivSetFilter && window._b2TierUnivSetFilter('${String(univName).replace(/'/g,"\\'")}')">${univName==="ALL"?`\uC804\uCCB4 (${cnt})`:`${univName} (${cnt})`}</button>`}).join(""));const filtered=selectedUniv==="ALL"?st2.pool||[]:(st2.pool||[]).filter(p=>String((p==null?void 0:p.univ)||"\uBB34\uC18C\uC18D")===selectedUniv);if(sub&&(sub.textContent=`${selectedUniv!=="ALL"?`${selectedUniv} \xB7 `:""}${filtered.length}\uBA85`),summary){const orderedNow=st2.ordered||[],topUniv=orderedNow[0];summary.innerHTML=`
              <div class="b2tu-summarycard">
                <div class="b2tu-summarylabel">\uCD1D \uC778\uC6D0</div>
                <div class="b2tu-summaryvalue">${filtered.length}</div>
                <div class="b2tu-summarymeta">${selectedUniv==="ALL"?"\uC804\uCCB4 \uAE30\uC900":"\uC120\uD0DD \uB300\uD559 \uAE30\uC900"}</div>
              </div>
              <div class="b2tu-summarycard">
                <div class="b2tu-summarylabel">\uBD84\uD3EC \uB300\uD559</div>
                <div class="b2tu-summaryvalue">${selectedUniv==="ALL"?orderedNow.length:1}</div>
                <div class="b2tu-summarymeta">${selectedUniv==="ALL"?"\uD2F0\uC5B4 \uBD84\uD3EC \uB300\uD559 \uC218":selectedUniv}</div>
              </div>
              <div class="b2tu-summarycard">
                <div class="b2tu-summarylabel">\uCD5C\uB2E4 \uBCF4\uC720 \uB300\uD559</div>
                <div class="b2tu-summaryvalue">${topUniv?topUniv[0]:"-"}</div>
                <div class="b2tu-summarymeta">${topUniv?`${topUniv[1].length}\uBA85`:"\uC9D1\uACC4 \uB300\uAE30"}</div>
              </div>`}if(body){const groupedHtml=selectedUniv==="ALL"?`<div class="b2tu-groupgrid">${(st2.ordered||[]).map(([univName,arr])=>{const col=typeof gc=="function"&&gc(univName)||"#64748b",logo=univName&&univName!=="\uBB34\uC18C\uC18D"&&typeof gUI=="function"?gUI(univName,typeof getUnivLogoSizeStr=="function"?getUnivLogoSizeStr(univName,"players","16px"):"16px"):"";return`<div class="b2tu-groupcard">
                    <div class="b2tu-grouphead">
                      <div class="b2tu-groupname" title="${String(univName).replace(/"/g,"&quot;")}"><span class="b2tu-pill" style="background:${col}20;border-color:${col}44;color:${col}">${logo}${univName}</span></div>
                      <div class="b2tu-groupcount">${arr.length}\uBA85</div>
                    </div>
                    <div class="b2tu-groupavatars">${arr.slice(0,8).map(p=>{const name=String((p==null?void 0:p.name)||""),nameJs=name.replace(/\\/g,"\\\\").replace(/'/g,"\\'"),photo=String((p==null?void 0:p.photo)||"").trim();return`<button type="button" class="b2tu-av" onclick="if(typeof openPlayerModal==='function')openPlayerModal('${nameJs}')" title="${name.replace(/"/g,"&quot;")}">${photo?`<img src="${toHttpsUrl(photo).replace(/\"/g,"&quot;")}" loading="lazy" decoding="async" onerror="this.parentNode.innerHTML='<span>${String((p==null?void 0:p.race)||"?")}</span>'">`:`<span>${String((p==null?void 0:p.race)||"?")}</span>`}</button>`}).join("")}</div>
                  </div>`}).join("")}</div>`:"";body.innerHTML=filtered.length?`${groupedHtml}<div class="b2tu-grid">${filtered.map(p=>{const name=String((p==null?void 0:p.name)||""),photo=String((p==null?void 0:p.photo)||"").trim(),race=String((p==null?void 0:p.race)||"?"),univName=String((p==null?void 0:p.univ)||"\uBB34\uC18C\uC18D"),col=typeof gc=="function"&&gc(univName)||"#64748b",logo=univName&&univName!=="\uBB34\uC18C\uC18D"&&typeof gUI=="function"?gUI(univName,typeof getUnivLogoSizeStr=="function"?getUnivLogoSizeStr(univName,"players","16px"):"16px"):"",nameJs=name.replace(/\\/g,"\\\\").replace(/'/g,"\\'"),img=photo?`<img src="${toHttpsUrl(photo).replace(/\"/g,"&quot;")}" loading="lazy" decoding="async" onerror="this.style.display='none'">`:"",fb=`<div class="b2tu-fb" style="display:${photo?"none":"flex"}">${race}</div>`;return`<div class="b2tu-card" onclick="if(typeof openPlayerModal==='function')openPlayerModal('${nameJs}')">
                <div class="b2tu-topbadges">
                  <span class="b2tu-pill">${tt}\uD2F0\uC5B4</span>
                  <span class="b2tu-pill" style="background:${col}55;border-color:${col}88">${race}</span>
                </div>
                ${img}${fb}
                <div class="b2tu-bottom">
                  <div class="b2tu-name" title="${name.replace(/\"/g,"&quot;")}">${name}</div>
                  <div class="b2tu-meta"><span>${race}</span><span class="b2tu-ubadge" style="background:${col}22;border-color:${col}55;color:#fff">${logo}${univName}</span></div>
                </div>
              </div>`}).join("")}</div>`:'<div style="padding:24px;text-align:center;color:var(--text3);font-weight:800">\uD45C\uC2DC\uD560 \uC120\uC218\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.</div>'}},window._b2TierUnivSetFilter=function(univName){window._b2TierUnivState=window._b2TierUnivState||{},window._b2TierUnivState.selectedUniv=String(univName||"ALL"),window._b2TierUnivRender&&window._b2TierUnivRender()},window._b2TierUnivSetFilter("ALL"),ov.style.display="block"}catch(e){console.error(e)}})}catch(e){}function _b2FemcoView(){var _a,_b,_c,_d,_e;const femcoFallback=()=>({autoLayout:1,logoSize:150,logoPos:"top",logoAttachTitle:1,headGap:10,logoOffsetX:0,logoOffsetY:0,titleSize:28,titleFont:"system",titlePos:"top",titleOffsetX:0,titleOffsetY:0,playerImgSize:76,playerImgShape:"square",rowsPerCol:5,colWidth:170,colGap:10,univGap:18,countFontSize:12,contentPadX:16,contentAlign:"left",contentOffsetX:0,univSubtitles:{},subtitleSize:12,subtitleWeight:800,subtitleColor:"",nameFontSize:18,roleFontSize:10,tierBadgeSize:10,tierBadgePadX:6,starSize:15,statusIconSize:18,bgOverlay:0,univColorOverrides:{},univBgMedia:{}});let femcoSettings=typeof window._cfgFemcoLoad=="function"?window._cfgFemcoLoad():(function(){try{return JSON.parse(localStorage.getItem("b2_femco_settings_v1")||"null")||femcoFallback()}catch(e){return femcoFallback()}})();window._b2FemcoOpenBgMedia=function(univName,url){const u=String(univName||""),link=String(url||"").trim();if(!link)return;const low=link.toLowerCase(),isVideo=/\.(mp4|webm|ogg)(\?|#|$)/i.test(low);if(/(youtube\.com|youtu\.be|twitch\.tv)/i.test(low)){try{window.open(link,"_blank","noopener")}catch(e){location.href=link}return}if(!isVideo){try{window.open(link,"_blank","noopener")}catch(e){location.href=link}return}const existing=document.getElementById("b2-femco-bg-modal");existing&&existing.remove();const ov=document.createElement("div");ov.id="b2-femco-bg-modal",ov.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,.60);z-index:var(--z-modal-5);display:flex;align-items:center;justify-content:center;padding:16px";const safeTitle=(u||"\uC601\uC0C1").replace(/</g,"&lt;").replace(/>/g,"&gt;");ov.innerHTML=`
        <div style="width:min(980px,96vw);background:var(--white);border-radius:var(--r2);overflow:hidden;border:1px solid rgba(255,255,255,.16);box-shadow:0 18px 60px rgba(0,0,0,.35)">
          <div style="display:flex;align-items:center;gap:10px;padding:12px 14px;background:linear-gradient(to bottom, rgba(255,255,255,.95), rgba(255,255,255,.85));border-bottom:1px solid var(--border)">
            <div style="font-weight:1000;color:var(--text2)">\u{1F39E}\uFE0F ${safeTitle} \uBC30\uACBD \uC601\uC0C1</div>
            <span style="color:var(--gray-l);font-size:var(--fs-sm)">\uD074\uB9AD\uD574\uC11C \uC7AC\uC0DD\uB429\uB2C8\uB2E4</span>
            <button style="margin-left:auto;border:1px solid var(--border);background:var(--surface);border-radius:var(--r);padding:6px 10px;cursor:pointer;font-weight:1000" onclick="document.getElementById('b2-femco-bg-modal')?.remove()">\uB2EB\uAE30</button>
          </div>
          <div style="padding:12px 14px">
            <video src="${link}" controls playsinline style="width:100%;max-height:72vh;border-radius:12px;background:#000"></video>
          </div>
        </div>
      `,ov.addEventListener("click",e=>{e.target===ov&&ov.remove()}),document.body.appendChild(ov)};const univList=_b2VisUnivs().filter(u=>u.name);if(!univList.length)return'<div style="text-align:center;color:var(--text3);padding:40px">\uD45C\uC2DC\uD560 \uB300\uD559\uC774 \uC5C6\uC2B5\uB2C8\uB2E4</div>';typeof univCfg!="undefined"&&univCfg.length?univList.sort((a,b)=>{const ia=univCfg.findIndex(u=>u.name===a.name),ib=univCfg.findIndex(u=>u.name===b.name);return(ia>=0?ia:999)-(ib>=0?ib:999)}):univList.sort((a,b)=>(a.name||"").localeCompare(b.name||"","ko",{sensitivity:"base"}));const _femcoDissSet=new Set((typeof univCfg!="undefined"?univCfg:[]).filter(u=>u.dissolved).map(u=>String(u.name||"").trim())),membersByUniv={};players.forEach(p=>{const pu=String((p==null?void 0:p.univ)||"").trim();!pu||p.hidden||p.retired||p.hideFromBoard||_femcoDissSet.has(pu)||(membersByUniv[pu]||(membersByUniv[pu]=[])).push(p)});const LOGO=Math.max(60,Math.min(520,parseInt(femcoSettings.logoSize||150,10)||150)),LOGO_OFF_X=Math.max(-120,Math.min(120,parseInt((_a=femcoSettings.logoOffsetX)!=null?_a:0,10)||0)),LOGO_OFF_Y=Math.max(-120,Math.min(120,parseInt((_b=femcoSettings.logoOffsetY)!=null?_b:0,10)||0)),TITLE_OFF_X=Math.max(-120,Math.min(120,parseInt((_c=femcoSettings.titleOffsetX)!=null?_c:0,10)||0)),TITLE_OFF_Y=Math.max(-120,Math.min(120,parseInt((_d=femcoSettings.titleOffsetY)!=null?_d:0,10)||0)),BG_OVERLAY=Math.max(0,Math.min(70,parseInt((_e=femcoSettings.bgOverlay)!=null?_e:0,10))),OV_TOP=BG_OVERLAY/70*.22,OV_BOT=BG_OVERLAY/70*.52,titleSize=Math.max(16,Math.min(44,parseInt(femcoSettings.titleSize||28,10)||28)),playerImgSize=Math.max(28,Math.min(160,parseInt(femcoSettings.playerImgSize||64,10)||64)),playerRadius={sharp:"0px",roundedsm:"6px",square:"10px",roundedlg:"22px",roundedxl:"34px",circle:"50%"}[femcoSettings.playerImgShape]||"10px",rowsPerCol=Math.max(2,Math.min(12,parseInt(femcoSettings.rowsPerCol||5,10)||5)),colWidth=Math.max(80,Math.min(360,parseInt(femcoSettings.colWidth||170,10)||170)),rowGap=Math.max(0,Math.min(28,parseInt(femcoSettings.colGap||10,10)||10)),colGap=10,univGap=Math.max(0,Math.min(120,parseInt(femcoSettings.univGap||18,10)||18)),countFontSize=Math.max(10,Math.min(18,parseInt(femcoSettings.countFontSize||12,10)||12)),contentPadX=Math.max(0,Math.min(40,parseInt(femcoSettings.contentPadX||16,10)||16)),contentAlign=femcoSettings.contentAlign==="left"||femcoSettings.contentAlign==="center"?femcoSettings.contentAlign:"left",contentOffsetX=Math.max(-40,Math.min(40,parseInt(femcoSettings.contentOffsetX||0,10)||0)),headGap=Math.max(0,Math.min(80,parseInt(femcoSettings.headGap||10,10)||10)),autoLayout=!(femcoSettings.autoLayout===0||femcoSettings.autoLayout===!1),vw=typeof window!="undefined"&&(document.documentElement.clientWidth||window.innerWidth)||1280,_padL=Math.max(0,Math.min(80,contentPadX+contentOffsetX)),_padR=Math.max(0,Math.min(80,contentPadX-contentOffsetX));function _autoLayoutForCount(cnt){let rows=5;cnt>=55?rows=9:cnt>=45?rows=8:cnt>=35?rows=7:cnt>=25?rows=6:rows=5;let cw=175;return vw<=520?(rows=Math.max(rows,8),cw=150):vw<=768?(rows=Math.max(rows,7),cw=160):vw<=1024?(rows=Math.max(rows,6),cw=170):cw=cnt>=45?160:175,rows=Math.max(4,Math.min(12,rows)),cw=Math.max(130,Math.min(220,cw)),{rowsPerCol:rows,colWidth:cw}}const subtitleSize=Math.max(10,Math.min(24,parseInt(femcoSettings.subtitleSize||12,10)||12)),subtitleWeight=[400,500,600,700,800,900].includes(parseInt(femcoSettings.subtitleWeight||800,10))?parseInt(femcoSettings.subtitleWeight||800,10):800,subtitleColor=typeof femcoSettings.subtitleColor=="string"?femcoSettings.subtitleColor:"",nameFontSize=Math.max(10,Math.min(28,parseInt(femcoSettings.nameFontSize||16,10)||16)),roleFontSize=Math.max(9,Math.min(16,parseInt(femcoSettings.roleFontSize||10,10)||10)),tierBadgeSize=Math.max(9,Math.min(16,parseInt(femcoSettings.tierBadgeSize||10,10)||10)),tierBadgePadX=Math.max(4,Math.min(12,parseInt(femcoSettings.tierBadgePadX||6,10)||6)),starSize=Math.max(10,Math.min(28,parseInt(femcoSettings.starSize||15,10)||15)),titleFontFamily=(()=>{switch(femcoSettings.titleFont){case"app":return"var(--app-font)";case"noto":return"'Noto Sans KR', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif";case"pretendard":return"'Pretendard Variable', Pretendard, system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif";case"nanum":return"'Nanum Gothic', 'Noto Sans KR', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif";case"gmarket":return"'GmarketSans', 'Noto Sans KR', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif";default:return"system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif"}})();(function(){const head=document.head||document.getElementsByTagName("head")[0];if(!head)return;const ensure=(id,href)=>{if(!href){const el2=document.getElementById(id);el2&&el2.remove();return}let el=document.getElementById(id);el||(el=document.createElement("link"),el.id=id,el.rel="stylesheet",head.appendChild(el)),el.href=href},cssMap={noto:"https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700;900&display=swap",pretendard:"https://cdn.jsdelivr.net/gh/orioncactus/pretendard@latest/dist/web/variable/pretendardvariable.css",nanum:"https://fonts.googleapis.com/css2?family=Nanum+Gothic:wght@400;700;800&display=swap",gmarket:"https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/GmarketSans.css"},key=femcoSettings.titleFont;ensure("femco-titlefont-css",cssMap[key]||"")})();const tierRank=p=>{const t=p.tier||"",i=typeof TIERS!="undefined"&&TIERS.includes(t)?TIERS.indexOf(t):999;return i>=0?i:999},rolePri=p=>{const r=(p.role||"").trim(),i=["\uC774\uC0AC\uC7A5","\uCD1D\uC7A5","\uAD50\uC218","\uCF54\uCE58"].indexOf(r);return i>=0?i:99},raceLabel=p=>p.race==="P"?"P":p.race==="T"?"T":p.race==="Z"?"Z":"?",_hexToRgb=hex=>{const h2=String(hex||"").replace("#","").trim();if(h2.length<6)return null;const r=parseInt(h2.slice(0,2),16),g=parseInt(h2.slice(2,4),16),b=parseInt(h2.slice(4,6),16);return[r,g,b].some(v=>Number.isNaN(v))?null:{r,g,b}},_rgbToHex=(r,g,b)=>"#"+[r,g,b].map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,"0")).join(""),_mixHex=(a,b,t)=>{const A=_hexToRgb(a),B=_hexToRgb(b);if(!A||!B)return a||b||"#94a3b8";const tt=Math.max(0,Math.min(1,+t||0));return _rgbToHex(A.r*(1-tt)+B.r*tt,A.g*(1-tt)+B.g*tt,A.b*(1-tt)+B.b*tt)},_relLum=hex=>{const c=_hexToRgb(hex);if(!c)return 0;const f=v=>(v/=255,v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)),R=f(c.r),G=f(c.g),B=f(c.b);return .2126*R+.7152*G+.0722*B},_contrast=(a,b)=>{const L1=_relLum(a),L2=_relLum(b),hi=Math.max(L1,L2),lo=Math.min(L1,L2);return(hi+.05)/(lo+.05)},_ensureOnWhite=(hex,min=3)=>{let c=hex||"#94a3b8";if(_contrast(c,"#ffffff")>=min)return c;const steps=[.25,.4,.55,.7];for(const t of steps){const d=_mixHex(c,"#0f172a",t);if(_contrast(d,"#ffffff")>=min)return d}return _mixHex(c,"#0f172a",.75)},raceColor=(p,univCol)=>{const base=p.race==="P"?"#c084fc":p.race==="T"?"#38bdf8":p.race==="Z"?"#34d399":"#94a3b8",themed=univCol?_mixHex(base,univCol,.22):base;return _ensureOnWhite(themed,3)};function femcoAvatarSquare(p,accent){var _a2;const img=p&&p.photo?toThumbUrl(String(p.photo),playerImgSize):"",imgOrig=p&&p.photo?toHttpsUrl(String(p.photo)):"",letter=p&&p.name?String(p.name).slice(0,1):"?",border=`${accent}55`;let badge="";try{const _rawIcon=getStatusIcon(p.name),statusHtml=getStatusIconHTML(p.name),s=playerImgSize,_rawIconSize=parseInt((_a2=femcoSettings.statusIconSize)!=null?_a2:18,10),badgeSize=_rawIconSize===0?0:Math.max(10,Math.min(36,_rawIconSize||Math.round(s*.38))),_isImgIcon=_rawIcon&&(typeof _siIsImg=="function"?_siIsImg(_rawIcon):!1),_badgeInner=_isImgIcon?`<img src="${_rawIcon}" style="width:${badgeSize}px;height:${badgeSize}px;border-radius:50%;object-fit:cover;opacity:.86" onerror="this.style.display='none'">`:statusHtml?statusHtml.replace(/margin-left:[^;]+;/g,"").replace(/font-size:[^;]+;/g,""):"",_badgeBg=_isImgIcon?"rgba(255,255,255,.72)":"transparent",_bTop=-Math.round(badgeSize*.26),_bLeft=-Math.round(badgeSize*.26);badge=statusHtml?`<span style="position:absolute;top:${_bTop}px;left:${_bLeft}px;width:${badgeSize}px;height:${badgeSize}px;border-radius:50%;background:${_badgeBg};overflow:hidden;display:flex;align-items:center;justify-content:center;font-size:${Math.round(badgeSize*.82)}px;line-height:1;filter:drop-shadow(0 1px 2px rgba(0,0,0,.65))">${_badgeInner}</span>`:""}catch(e){console.warn("[femcoAvatarSquare] \uC0C1\uD0DC \uC544\uC774\uCF58 \uC0DD\uC131 \uC2E4\uD328:",e.message)}return img?`<span style="position:relative;display:block;width:100%;height:100%">
        <img src="${img}" data-orig="${imgOrig}" decoding="async" fetchpriority="high" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;border:2px solid ${border};background:rgba(255,255,255,.25)" onerror="if(this.dataset.orig&&this.src!==this.dataset.orig){this.src=this.dataset.orig;}else{this.closest('span').outerHTML='<div style=&quot;position:relative;width:100%;height:100%;border-radius:inherit;background:${accent};display:flex;align-items:center;justify-content:center;font-weight:1000;font-size:22px;color:#fff;border:2px solid ${border}&quot;>${letter}</div>'}">
        ${badge}
      </span>`:`<div style="position:relative;width:100%;height:100%;border-radius:inherit;background:${accent};display:flex;align-items:center;justify-content:center;font-weight:1000;font-size:22px;color:#fff;border:2px solid ${border}">${letter}${badge}</div>`}let h=`
    <style>
      .b2-femco-wrap{display:flex;flex-direction:column;gap:${univGap}px}
      .b2-femco-univ{border-radius:22px;overflow:hidden;box-shadow:0 4px 28px rgba(0,0,0,.14);transition:background-color .35s ease, box-shadow .35s ease, transform .22s ease}
      .b2-femco-univ:hover{transform:translateY(-2px);box-shadow:0 10px 36px rgba(0,0,0,.20)}
      .b2-femco-head{padding:16px 16px 12px;text-align:center;position:relative}
      .b2-femco-headrow{display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap}
      .b2-femco-headcol{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:${headGap}px}
      .b2-femco-logo{display:flex;justify-content:center;margin-bottom:0}
      .b2-femco-title-row{display:flex;align-items:center;gap:6px;justify-content:center}
      .b2-femco-title{font-weight:1000;font-size:${titleSize}px;letter-spacing:-.04em;line-height:1.1;font-family:${titleFontFamily}}
      .b2-femco-stars{display:inline-flex;gap:1px;align-items:center;opacity:.95}
      .b2-femco-stars span{font-size:${starSize}px;line-height:1}
      .b2-femco-subtitle{margin-top:6px;font-size:${subtitleSize}px;font-weight:${subtitleWeight};line-height:1.2;opacity:.95}
      /* \uC778\uC6D0\uC218: \uC88C\uCE21 \uC0C1\uB2E8 \uACE0\uC815 (\uBC30\uACBD \uC5C6\uC74C) */
      .b2-femco-countbox{
        position:absolute;top:10px;left:10px;
        display:flex;flex-direction:column;gap:2px;align-items:flex-start;justify-content:flex-start;
        padding:0;border-radius:0;background:transparent;border:none;color:inherit;
        max-width:45%;
      }
      .b2-femco-countbox div{font-size:${countFontSize}px;font-weight:1000;line-height:1.15;white-space:nowrap}
      .b2-femco-meta{margin-top:6px;display:flex;justify-content:center;gap:8px;flex-wrap:wrap}
      .b2-femco-pill{font-size:var(--fs-sm);font-weight:1000;padding:3px 10px;border-radius:999px;border:1px solid rgba(255,255,255,.55);background:rgba(255,255,255,.16)}
      .b2-femco-body{padding:12px 12px 16px}
      .b2-femco-group{margin-top:10px}
      .b2-femco-group:first-child{margin-top:0}
      .b2-femco-ghead{display:flex;align-items:center;gap:8px;margin:0 0 8px}
      .b2-femco-glabel{font-size:var(--fs-sm);font-weight:1000;background:rgba(255,255,255,.78);border:1px solid rgba(0,0,0,.10);padding:3px 10px;border-radius:999px}
      .b2-femco-gcount{font-size:var(--fs-caption);font-weight:900;opacity:.85}

      /* \u2705 \uBC30\uCE58 \uADDC\uCE59(\uC694\uAD6C\uC0AC\uD56D)
         - 1\uBC88(\uCCAB \uCEEC\uB7FC) \uC704\u2192\uC544\uB798\uB85C 5\uBA85 \uCC44\uC6C0
         - 5\uBA85 \uB418\uBA74 \uC6B0\uCE21(\uB2E4\uC74C \uCEEC\uB7FC) 1\uBC88\uC73C\uB85C \uB2E4\uC2DC \uC704\u2192\uC544\uB798\uB85C 5\uBA85
      */
      .b2-femco-grid{
        display:grid;
        --rowsPerCol:${rowsPerCol};
        --colWidth:${colWidth}px;
        column-gap:${colGap}px;
        row-gap:${rowGap}px;
        grid-auto-flow:column;
        grid-template-rows:repeat(var(--rowsPerCol), minmax(0, auto));
        grid-auto-columns:var(--colWidth);
        overflow-x:auto;
        padding-bottom:6px;
        scrollbar-width:none;
        justify-content:flex-start;
      }
      .b2-femco-grid::-webkit-scrollbar{height:0}

      /* \uC2A4\uD2B8\uB9AC\uBA38 \uD56D\uBAA9(\uCE74\uB4DC\uD615\uC2DDX): \uD504\uB85C\uD544(\uB124\uBAA8, \uC791\uAC8C) + \uC6B0\uCE21 \uD14D\uC2A4\uD2B8 4\uC904 */
      /* \uCE74\uB4DC \uB290\uB08C \uC81C\uAC70: \uBC30\uACBD/\uD14C\uB450\uB9AC \uCD5C\uC18C\uD654 */
      .b2-femco-item{display:flex!important;flex-direction:row!important;align-items:center;gap:10px;padding:8px 10px;border-radius:14px;cursor:pointer;min-width:0;transition:background .15s,transform .18s cubic-bezier(.34,1.56,.64,1),box-shadow .15s;justify-self:start;width:fit-content;max-width:100%}
      .b2-femco-item:hover{background:rgba(255,255,255,.20);transform:translateY(-2px);box-shadow:0 6px 16px rgba(0,0,0,.14)}
      .b2-femco-avatar{width:${playerImgSize}px;height:${playerImgSize}px;border-radius:${playerRadius};overflow:hidden;flex-shrink:0;position:relative}
      .b2-femco-text{display:flex!important;flex-direction:column!important;align-items:flex-start!important;text-align:left!important;gap:2px;min-width:0}
      .b2-femco-tier{font-size:10px;font-weight:1000;display:inline-flex;align-items:center;gap:4px}
      .b2-femco-tierbadge{font-size:${tierBadgeSize}px;padding:2px ${tierBadgePadX}px;border-radius:999px;border:1px solid rgba(0,0,0,.12);display:inline-flex;align-items:center;line-height:1}
      .b2-femco-role{font-size:${roleFontSize}px;font-weight:1000;opacity:.9}
      .b2-femco-name{font-size:${nameFontSize}px;font-weight:1000;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .b2-femco-race-pill{display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:1000;padding:1px 6px;border-radius:999px;background:rgba(255,255,255,.85);border:1px solid rgba(0,0,0,.10)}

      @media(max-width:520px){ .b2-femco-title{font-size:20px} }
    </style>
    <div class="b2-femco-wrap">
  `;return univList.forEach(u=>{var _a2;const univName=u.name,all=membersByUniv[univName]||[];if(!all.length)return;const col=(femcoSettings.univColorOverrides||{})[univName]||gc(univName),textCol=_b2ContrastColor(col),uCfg=(typeof univCfg!="undefined"?univCfg.find(x=>x.name===univName):null)||{},_uLogo=(()=>{const v=parseInt(uCfg.logoSizeFemco||"",10);return!isNaN(v)&&v>0?Math.max(60,Math.min(520,v)):LOGO})(),iconUrl=uCfg.icon||uCfg.img||"",logoHtml=iconUrl?`<img src="${toHttpsUrl(iconUrl)}" style="width:${_uLogo}px;height:${_uLogo}px;object-fit:contain" onerror="this.style.display='none'">`:`<span style="display:inline-flex;align-items:center;justify-content:center;width:${Math.round(_uLogo*.62)}px;height:${Math.round(_uLogo*.62)}px;opacity:.85;font-size:${Math.round(_uLogo*.48)}px;line-height:1">\u{1F3EB}</span>`,bossCnt=all.filter(p=>(p.role||"").trim()==="\uC774\uC0AC\uC7A5").length,profCoachCnt=all.filter(p=>["\uAD50\uC218","\uCF54\uCE58"].includes((p.role||"").trim())).length,studentCnt=Math.max(0,all.length-bossCnt-profCoachCnt),list=[...all].sort((a,b)=>{const ra=rolePri(a),rb=rolePri(b);if(ra!==rb)return ra-rb;const ta=tierRank(a),tb=tierRank(b);return ta!==tb?ta-tb:(a.name||"").localeCompare(b.name||"","ko",{sensitivity:"base"})}),_subTxt=((femcoSettings.univSubtitles||{})[univName]||"").trim(),_subColor=subtitleColor&&subtitleColor.trim()?subtitleColor:textCol,_bgRaw=(femcoSettings.univBgMedia||{})[univName]||"",_bgCfg=(function(){const d={url:"",alpha:30,sizeMode:"cover",sizeVal:90,pos:"center",repeat:"no-repeat",ox:0,oy:0};return _bgRaw?typeof _bgRaw=="string"?__spreadProps(__spreadValues({},d),{url:String(_bgRaw).trim()}):typeof _bgRaw=="object"?__spreadProps(__spreadValues(__spreadValues({},d),_bgRaw),{url:String(_bgRaw.url||"").trim()}):d:d})(),_bgUrl=(_bgCfg.url||"").trim(),_bgLower=_bgUrl.toLowerCase(),_bgIsImage=_bgUrl&&/\.(png|jpe?g|webp|gif)(\?|#|$)/i.test(_bgLower),_bgIsVideo=_bgUrl&&/\.(mp4|webm|ogg)(\?|#|$)/i.test(_bgLower),_bgIsEmbed=_bgUrl&&/(youtube\.com|youtu\.be|twitch\.tv)/i.test(_bgLower),_bgBtn=_bgIsVideo||_bgIsEmbed||_bgUrl&&!_bgIsImage?`<button class="b2-femco-pill no-export" style="cursor:pointer" onclick="_b2FemcoOpenBgMedia('${univName.replace(/'/g,"\\'")}', '${_bgUrl.replace(/'/g,"\\'")}');event.stopPropagation();">${_bgIsVideo?"\u{1F39E}\uFE0F \uBC30\uACBD\uC601\uC0C1":_bgIsEmbed?"\u{1F517} \uBC30\uACBD\uB9C1\uD06C":"\u{1F5BC}\uFE0F \uBC30\uACBD\uB9C1\uD06C"}</button>`:"",_pos=femcoSettings.logoPos||"top",_posNorm=["left","right","top","bottom","center"].includes(_pos)?_pos:"top",_attach=!!((_a2=femcoSettings.logoAttachTitle)==null||_a2),_tpos=femcoSettings.titlePos||"bottom",_tposNorm=["left","right","top","bottom"].includes(_tpos)?_tpos:"bottom",starsHtml=(uCfg.championships||0)>0?`<span class="b2-femco-stars">${"<span>\u2B50</span>".repeat(uCfg.championships)}</span>`:"",titleBlock=`
      <div style="min-width:220px;transform:translate(${TITLE_OFF_X}px,${TITLE_OFF_Y}px)">
        <div class="b2-femco-title-row">
          <div class="b2-femco-title">${univName}</div>
          ${starsHtml}
        </div>
        ${_subTxt?`<div class="b2-femco-subtitle" style="color:${_subColor}">${_subTxt}</div>`:""}
        ${_bgBtn?`<div class="b2-femco-meta">${_bgBtn}</div>`:""}
      </div>
    `,logoOnlyStyle=(()=>{if(_attach)return"";const pad=contentPadX;return _posNorm==="left"?`position:absolute;left:${pad}px;top:50%;transform:translateY(-50%) translate(${LOGO_OFF_X}px,${LOGO_OFF_Y}px);`:_posNorm==="right"?`position:absolute;right:${pad}px;top:50%;transform:translateY(-50%) translate(${LOGO_OFF_X}px,${LOGO_OFF_Y}px);`:_posNorm==="bottom"?`position:absolute;left:50%;bottom:10px;transform:translateX(-50%) translate(${LOGO_OFF_X}px,${LOGO_OFF_Y}px);`:`position:absolute;left:50%;top:10px;transform:translateX(-50%) translate(${LOGO_OFF_X}px,${LOGO_OFF_Y}px);`})(),headLayout=(()=>{if(!_attach){const reserve=Math.max(0,Math.round(_uLogo*.55)+16);return`
          <div class="b2-femco-headrow" style="padding-left:${_posNorm==="left"?reserve:0}px;padding-right:${_posNorm==="right"?reserve:0}px">
            <div class="b2-femco-logo" style="${logoOnlyStyle}">${logoHtml}</div>
            ${titleBlock}
          </div>
        `}const _alignStyle=_posNorm==="left"?"justify-content:flex-start":_posNorm==="right"?"justify-content:flex-end":"justify-content:center",_logoEl=`<div class="b2-femco-logo" style="transform:translate(${LOGO_OFF_X}px,${LOGO_OFF_Y}px)">${logoHtml}</div>`;return _tposNorm==="left"?`<div class="b2-femco-headrow" style="${_alignStyle}">${titleBlock}${_logoEl}</div>`:_tposNorm==="right"?`<div class="b2-femco-headrow" style="${_alignStyle}">${_logoEl}${titleBlock}</div>`:_tposNorm==="top"?`<div class="b2-femco-headcol" style="${_alignStyle}">${titleBlock}${_logoEl}</div>`:`<div class="b2-femco-headcol" style="${_alignStyle}">${_logoEl}${titleBlock}</div>`})(),_lay=autoLayout?_autoLayoutForCount(all.length):{rowsPerCol,colWidth},_posToXY=p=>{const t=String(p||"center");return{center:[50,50],top:[50,0],bottom:[50,100],left:[0,50],right:[100,50],"top left":[0,0],"top right":[100,0],"bottom left":[0,100],"bottom right":[100,100]}[t]||[50,50]},[px,py]=_posToXY(_bgCfg.pos),ox=parseInt(_bgCfg.ox||0,10)||0,oy=parseInt(_bgCfg.oy||0,10)||0,_bgPos=`calc(${px}% + ${ox}px) calc(${py}% + ${oy}px)`;let _bgSize="cover";_bgCfg.sizeMode==="contain"?_bgSize="contain":_bgCfg.sizeMode==="pct"?_bgSize=`${Math.max(10,Math.min(220,parseInt(_bgCfg.sizeVal||90,10)||90))}%`:_bgCfg.sizeMode==="px"&&(_bgSize=`${Math.max(30,Math.min(900,parseInt(_bgCfg.sizeVal||240,10)||240))}px`);const _bgAlpha=Math.max(0,Math.min(100,parseInt(_bgCfg.alpha||30,10)||0))/100,_bgRepeat=["no-repeat","repeat","repeat-x","repeat-y"].includes(_bgCfg.repeat)?_bgCfg.repeat:"no-repeat",_bgLayer=_bgIsImage&&_bgUrl?`<img src="${toHttpsUrl(_bgUrl).replace(/"/g,"&quot;")}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:${_bgSize};object-position:${_bgPos};opacity:${_bgAlpha.toFixed(3)};pointer-events:none;z-index:0" onerror="this.style.display='none'">`:_bgIsVideo||_bgIsEmbed?`<div style="position:absolute;inset:0;background-image:url('${_bgUrl.replace(/'/g,"%27")}');background-repeat:${_bgRepeat};background-size:${_bgSize};background-position:${_bgPos};opacity:${_bgAlpha.toFixed(3)};pointer-events:none;z-index:0"></div>`:"",_ovLayer=_bgIsImage&&_bgUrl&&BG_OVERLAY>0?`<div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(2,6,23,${OV_TOP.toFixed(3)}), rgba(2,6,23,${OV_BOT.toFixed(3)}));pointer-events:none;z-index:1"></div>`:"";h+=`
      <section class="b2-femco-univ" style="position:relative;overflow:hidden;background:${col};">
        ${_bgLayer}${_ovLayer}
        <div class="b2-femco-head" style="position:relative;z-index:2;color:${textCol};padding-left:${_padL}px;padding-right:${_padR}px">
          <div class="b2-femco-countbox" style="color:${textCol};left:${_padL}px;${textCol==="#ffffff"?"text-shadow:0 1px 2px rgba(0,0,0,.45);":""}">
            <div>\uCD1D ${all.length}</div>
            <div>\uC774\uC0AC\uC7A5 ${bossCnt}</div>
            <div>\uAD50\uC218+\uCF54\uCE58 ${profCoachCnt}</div>
            <div>\uD559\uC0DD ${studentCnt}</div>
          </div>
          ${headLayout}
        </div>

        <div class="b2-femco-body" style="position:relative;z-index:2;background:transparent;padding-left:${_padL}px;padding-right:${_padR}px">
          <div class="b2-femco-grid" style="--rowsPerCol:${_lay.rowsPerCol};--colWidth:${_lay.colWidth}px">
            ${list.map(p=>{const safeName=(p.name||"").replace(/'/g,"\\'"),tier=p.tier||"?",tierBg=tier&&tier!=="?"&&typeof getTierBtnColor=="function"?getTierBtnColor(tier):"#64748b",tierFg=tier&&tier!=="?"&&(typeof getTierBtnTextColor=="function"?getTierBtnTextColor(tier):"#fff")||"#fff",roleLabel=(p.role||"").trim(),rcol=raceColor(p,col);return`
                <div class="b2-femco-item" onclick="openPlayerModal('${safeName}');event.stopPropagation();">
                  <div class="b2-femco-avatar">${femcoAvatarSquare(p,rcol)}</div>
                  <div class="b2-femco-text" style="${p.inactive?"opacity:.65":""};color:${textCol}">
                    <div class="b2-femco-tier">
                      <span class="b2-femco-tierbadge" style="background:${tierBg};color:${tierFg}">${tier}</span>
                    </div>
                    ${roleLabel?`<div class="b2-femco-role">${roleLabel}</div>`:""}
                    <div class="b2-femco-name">${p.name||""}</div>
                    <div><span class="b2-femco-race-pill" style="color:${rcol};border-color:${rcol}88;background:${textCol==="#ffffff"?"rgba(0,0,0,.28)":"rgba(255,255,255,.92)"};box-shadow:0 1px 2px rgba(0,0,0,.18)">${raceLabel(p)}</span></div>
                  </div>
                </div>
              `}).join("")}
          </div>
        </div>
      </section>
    `}),h+="</div>",h}function openB2PlayerCreateModal(){if(!isLoggedIn||typeof isSubAdmin!="undefined"&&isSubAdmin||document.getElementById("b2-player-create-modal"))return;const univs=(typeof univCfg!="undefined"?univCfg:[]).map(u=>u.name).filter(Boolean),tierOpts=typeof TIERS!="undefined"&&Array.isArray(TIERS)?TIERS:["0","1","2","3","4","5","6","7","8","\uC720\uC2A4"],roleOpts=["\uD559\uC0DD","\uCF54\uCE58","\uAD50\uC218","\uCD1D\uC7A5","\uC774\uC0AC\uC7A5"],modal=document.createElement("div");modal.id="b2-player-create-modal",modal.style.cssText="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:var(--z-modal-5)",modal.innerHTML=`
    <style>
      @media (max-width:480px){
        #b2-player-create-modal > div{ padding:18px 16px calc(18px + env(safe-area-inset-bottom,0px)) !important; width:100% !important; max-width:100% !important; max-height:92vh !important; border-radius:18px !important; }
        #b2-player-create-modal div[style*="grid-template-columns:140px 1fr"]{ grid-template-columns:1fr !important; gap:5px !important; margin-bottom:14px !important; }
        #b2-player-create-modal input, #b2-player-create-modal select{
          font-size:16px !important; min-height:44px !important; padding:10px 12px !important; width:100%; box-sizing:border-box;
        }
      }
    </style>
    <div style="background:var(--white);border-radius:var(--r2);padding:24px;max-width:560px;width:92%;max-height:84vh;overflow-y:auto;box-shadow:0 10px 40px rgba(0,0,0,0.3)">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px">
        <h3 style="margin:0;font-size:var(--fs-lg);font-weight:900;color:var(--text1)">\u{1F3AC} \uC2A4\uD2B8\uB9AC\uBA38 \uB4F1\uB85D</h3>
        <button onclick="document.getElementById('b2-player-create-modal').remove()" style="background:none;border:none;font-size:20px;cursor:pointer;color:var(--gray-l)">\u2715</button>
      </div>

      <div id="b2-newplayer-msg" style="font-size:var(--fs-sm);color:var(--gray-l);margin-bottom:12px">\uC800\uC7A5 \uD6C4 \uC790\uB3D9\uC73C\uB85C \uC785\uB825\uCE78\uC774 \uCD08\uAE30\uD654\uB418\uC5B4 \uC5F0\uC18D \uB4F1\uB85D\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.</div>

      <div style="display:grid;grid-template-columns:140px 1fr;gap:10px;align-items:center;margin-bottom:12px">
        <div style="font-size:var(--fs-base);font-weight:800;color:var(--text2)">\uC774\uB984</div>
        <input id="b2-newplayer-name" type="text" placeholder="\uC608: \uD64D\uAE38\uB3D9" style="padding:8px 12px;border:1px solid var(--border2);border-radius:var(--r);font-size:var(--fs-base)">
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr;gap:10px;align-items:center;margin-bottom:12px">
        <div style="font-size:var(--fs-base);font-weight:800;color:var(--text2)">\uB300\uD559</div>
        <select id="b2-newplayer-univ" style="padding:8px 12px;border:1px solid var(--border2);border-radius:var(--r);font-size:var(--fs-base)">
          <option value="">(\uC120\uD0DD)</option>
          ${univs.map(u=>`<option value="${u}">${u}</option>`).join("")}
        </select>
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr;gap:10px;align-items:center;margin-bottom:12px">
        <div style="font-size:var(--fs-base);font-weight:800;color:var(--text2)">\uC9C1\uAE09</div>
        <select id="b2-newplayer-role" style="padding:8px 12px;border:1px solid var(--border2);border-radius:var(--r);font-size:var(--fs-base)">
          ${roleOpts.map(r=>`<option value="${r}"${r==="\uD559\uC0DD"?" selected":""}>${r}</option>`).join("")}
        </select>
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr;gap:10px;align-items:center;margin-bottom:12px">
        <div style="font-size:var(--fs-base);font-weight:800;color:var(--text2)">\uC885\uC871</div>
        <select id="b2-newplayer-race" style="padding:8px 12px;border:1px solid var(--border2);border-radius:var(--r);font-size:var(--fs-base)">
          <option value="P">\uD504\uB85C\uD1A0\uC2A4</option>
          <option value="T">\uD14C\uB780</option>
          <option value="Z">\uC800\uADF8</option>
          <option value="N" selected>\uBBF8\uC815</option>
        </select>
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr;gap:10px;align-items:center;margin-bottom:12px">
        <div style="font-size:var(--fs-base);font-weight:800;color:var(--text2)">\uD2F0\uC5B4</div>
        <select id="b2-newplayer-tier" style="padding:8px 12px;border:1px solid var(--border2);border-radius:var(--r);font-size:var(--fs-base)">
          <option value="?" selected>\uBBF8\uC815</option>
          ${tierOpts.map(t=>`<option value="${t}">${t}</option>`).join("")}
        </select>
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr;gap:10px;align-items:center;margin-bottom:12px">
        <div style="font-size:var(--fs-base);font-weight:800;color:var(--text2)">\uCC44\uB110 URL</div>
        <input id="b2-newplayer-channel" type="text" placeholder="https://..." style="padding:8px 12px;border:1px solid var(--border2);border-radius:var(--r);font-size:var(--fs-base)">
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr;gap:10px;align-items:center;margin-bottom:12px">
        <div style="font-size:var(--fs-base);font-weight:800;color:var(--text2)">\uD504\uB85C\uD544 \uC774\uBBF8\uC9C0 1</div>
        <input id="b2-newplayer-photo" type="text" placeholder="https://... (base64 \uBD88\uAC00)" style="padding:8px 12px;border:1px solid var(--border2);border-radius:var(--r);font-size:var(--fs-base)">
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr;gap:10px;align-items:center;margin-bottom:4px">
        <div style="font-size:var(--fs-base);font-weight:800;color:var(--text2)">\uD504\uB85C\uD544 \uC774\uBBF8\uC9C0 2</div>
        <input id="b2-newplayer-photo2" type="text" placeholder="https://... (\uC120\uD0DD)" style="padding:8px 12px;border:1px solid var(--border2);border-radius:var(--r);font-size:var(--fs-base)">
      </div>
      <div style="font-size:var(--fs-caption);color:var(--gray-l);margin:0 0 14px 150px">\u203B 2\uBC88 \uC774\uBBF8\uC9C0\uB294 \uC774\uBBF8\uC9C0\uBCC4(Players) \uBA54\uC778\uC5D0\uC11C 1\uCD08 \uD6C4 \uC790\uB3D9 \uAD50\uCCB4\uC6A9</div>

      <div style="display:flex;gap:10px;margin-top:18px">
        <button onclick="document.getElementById('b2-player-create-modal').remove()" style="flex:1;padding:10px 16px;background:var(--surface);border:1px solid var(--border2);border-radius:var(--r);color:var(--text2);font-size:var(--fs-base);font-weight:700;cursor:pointer">\uB2EB\uAE30</button>
        <button onclick="saveB2NewPlayer()" style="flex:1;padding:10px 16px;background:var(--blue);border:1px solid var(--blue);border-radius:var(--r);color:#fff;font-size:var(--fs-base);font-weight:800;cursor:pointer">\uC800\uC7A5</button>
      </div>
    </div>
  `,document.body.appendChild(modal)}function saveB2NewPlayer(){var _a,_b,_c,_d,_e,_f,_g,_h;const msg=document.getElementById("b2-newplayer-msg"),name=(((_a=document.getElementById("b2-newplayer-name"))==null?void 0:_a.value)||"").trim(),univ=(((_b=document.getElementById("b2-newplayer-univ"))==null?void 0:_b.value)||"").trim(),role=(((_c=document.getElementById("b2-newplayer-role"))==null?void 0:_c.value)||"").trim(),race=(((_d=document.getElementById("b2-newplayer-race"))==null?void 0:_d.value)||"N").trim(),tier=(((_e=document.getElementById("b2-newplayer-tier"))==null?void 0:_e.value)||"?").trim(),channelUrl=(((_f=document.getElementById("b2-newplayer-channel"))==null?void 0:_f.value)||"").trim(),photo=(((_g=document.getElementById("b2-newplayer-photo"))==null?void 0:_g.value)||"").trim(),photo2=(((_h=document.getElementById("b2-newplayer-photo2"))==null?void 0:_h.value)||"").trim();if(!name){alert("\uC774\uB984\uC740 \uD544\uC218\uC785\uB2C8\uB2E4.");return}if(players.find(p2=>p2.name===name)){alert("\uC774\uBBF8 \uC874\uC7AC\uD558\uB294 \uC774\uB984\uC785\uB2C8\uB2E4: "+name);return}if(photo&&photo.startsWith("data:")){alert("\u274C base64 \uC774\uBBF8\uC9C0(data:...)\uB294 \uC800\uC7A5/\uB3D9\uAE30\uD654\uAC00 \uC2E4\uD328\uD560 \uC218 \uC788\uC5B4 \uAE08\uC9C0\uC785\uB2C8\uB2E4. URL\uC744 \uC0AC\uC6A9\uD558\uC138\uC694.");return}const p={name,univ:univ||"\uBB34\uC18C\uC18D",role:role||"\uD559\uC0DD",race,tier,channelUrl:channelUrl||void 0,photo:photo||void 0,secondProfileFile:photo2||void 0};players.push(p),save();const _b2ContentEl=document.getElementById("b2-content");if(_b2ContentEl&&typeof _b2FemcoView=="function"){_b2ContentEl.innerHTML=_b2FemcoView();try{typeof injectUnivIcons=="function"&&injectUnivIcons(_b2ContentEl)}catch(e){}}else render();["b2-newplayer-name","b2-newplayer-channel","b2-newplayer-photo","b2-newplayer-photo2"].forEach(id=>{const el=document.getElementById(id);el&&(el.value="")});const tierSel=document.getElementById("b2-newplayer-tier");tierSel&&(tierSel.value="?");const raceSel=document.getElementById("b2-newplayer-race");raceSel&&(raceSel.value="N");const roleSel=document.getElementById("b2-newplayer-role");roleSel&&(roleSel.value="\uD559\uC0DD"),msg&&(msg.style.color="#16a34a",msg.textContent=`\u2705 \uC800\uC7A5\uB428: ${name} (\uB2E4\uC74C \uC2A4\uD2B8\uB9AC\uBA38\uB97C \uACC4\uC18D \uB4F1\uB85D\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4)`)}async function saveB2FemcoAllImg(){return _saveB2FemcoInternal()}async function _saveB2FemcoInternal(){const btn=document.querySelector('[onclick="saveB2FemcoAllImg()"]');btn&&(btn.disabled=!0,btn.textContent="\u23F3...");try{const supportsDownload="download"in document.createElement("a"),ua=String(navigator.userAgent||""),isIOS=/iPad|iPhone|iPod/i.test(ua),isInApp=/KAKAOTALK|Instagram|FBAN|FBAV|NAVER|Whale|Line/i.test(ua);if(!supportsDownload||isIOS||isInApp){const w2=window.open("","_blank");if(w2){try{w2.document.write('<html><head><meta charset="utf-8"><title>\uC774\uBBF8\uC9C0 \uC0DD\uC131 \uC911...</title></head><body style="margin:0;font-family:sans-serif;background:#111;color:#fff;padding:14px">\uD3A8\uCF54\uC2A4\uD0C0\uC77C \uC774\uBBF8\uC9C0 \uC0DD\uC131 \uC911\uC785\uB2C8\uB2E4... \uC7A0\uC2DC\uB9CC \uAE30\uB2E4\uB824\uC8FC\uC138\uC694.</body></html>'),w2.document.close()}catch(e){}window.__captureDlWin=w2}}}catch(e){}const tmpDiv=document.createElement("div");tmpDiv.style.cssText="position:fixed;left:-9999px;top:0;padding:24px;background:#0b1220;box-sizing:border-box;",tmpDiv.innerHTML=_b2FemcoView(),document.body.appendChild(tmpDiv),tmpDiv.querySelectorAll(".b2-femco-subnav,.b2-femco-panel,.no-export,.no-export-movebtns").forEach(el=>el.remove()),await new Promise(r=>setTimeout(r,120));try{typeof injectUnivIcons=="function"&&injectUnivIcons(tmpDiv)}catch(e){console.warn("[saveB2FemcoAllImg] \uB300\uD559 \uC544\uC774\uCF58 \uC8FC\uC785 \uC2E4\uD328:",e.message)}try{typeof _imgToDataUrls=="function"&&await _imgToDataUrls(tmpDiv,12e3)}catch(e){}try{typeof _waitForImages=="function"&&await _waitForImages(tmpDiv,1500)}catch(e){}const h=tmpDiv.scrollHeight+32,w=tmpDiv.scrollWidth,fname="\uD3A8\uCF54\uD604\uD669\uD310_\uC804\uCCB4_"+new Date().toISOString().slice(0,10)+".png";try{if(console.log("[\uD3A8\uCF54] \uC774\uBBF8\uC9C0 \uC800\uC7A5 \uC2DC\uC791"),typeof window._captureAndSave!="function")throw new Error("\uC774\uBBF8\uC9C0 \uC800\uC7A5 \uAE30\uB2A5\uC744 \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.");await window._captureAndSave(tmpDiv,w,h,fname)}catch(e){console.error("[\uD3A8\uCF54\uD604\uD669 \uC774\uBBF8\uC9C0 \uC800\uC7A5 \uC2E4\uD328]",e),alert(`\u274C \uD3A8\uCF54\uC2A4\uD0C0\uC77C \uC774\uBBF8\uC9C0 \uC800\uC7A5 \uC2E4\uD328

`+(e.message||"\uC54C \uC218 \uC5C6\uB294 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4."))}finally{document.body.removeChild(tmpDiv),btn&&(btn.disabled=!1,btn.textContent="\u{1F4BE} \uC804\uCCB4 \uC800\uC7A5")}}function _b2UnivBlock(univName,col,members,forExport=!1){var _a;if(!univName)return`<div style="border-radius:14px;border:2px dashed #ccc55;padding:16px 18px;background:#f5f5f5;display:flex;align-items:center;gap:10px;opacity:.7">
      <span style="font-weight:900;font-size:var(--fs-md);color:#999;">[Unknown University]</span>
      <span style="font-size:var(--fs-caption);color:var(--gray-l)"> university name is undefined</span>
    </div>`;const uCfg=univCfg.find(x=>x.name===univName)||{},iconUrl=uCfg.icon||uCfg.img||UNIV_ICONS[univName]||"",textCol=_b2ContrastColor(col),lightCol=col+_b2AlphaHex(b2BgAlpha),labelCol=col+_b2AlphaHex(b2LabelAlpha),_hasBgImg=!!uCfg.bgImg,_softPanel="linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.94))",_softBorder=_hasBgImg?"rgba(255,255,255,.18)":"rgba(255,255,255,.55)",_rowPanelBg=_hasBgImg?"linear-gradient(180deg,rgba(255,255,255,.00),rgba(248,250,252,.00))":_softPanel,_memoPanelBg=_hasBgImg?"linear-gradient(180deg,rgba(255,255,255,.12),rgba(248,250,252,.04))":_softPanel,_rowPanelBorder=_hasBgImg?"rgba(255,255,255,.04)":_softBorder,_rowPanelShadow=_hasBgImg?"none":"0 10px 18px rgba(15,23,42,.04)";if(!members.length)return`<div style="border-radius:14px;border:2px dashed ${col}55;padding:16px 18px;background:${lightCol};display:flex;align-items:center;gap:10px;opacity:.7">
      ${iconUrl?`<img src="${toHttpsUrl(iconUrl)}" style="width:var(--su_univ_logo_size,36px);height:var(--su_univ_logo_size,36px);object-fit:contain;border-radius:var(--su_univ_logo_radius,10px)" onerror="this.style.display='none'">`:""}
      <span style="font-weight:900;font-size:var(--fs-md);color:${col};cursor:pointer" onclick="if(typeof openUnivModal==='function')openUnivModal('${univName}')">${univName}</span>
      <span style="font-size:var(--fs-caption);color:var(--gray-l)">\uB4F1\uB85D\uB41C \uC120\uC218 \uC5C6\uC74C</span>
    </div>`;const roledMembers=members.filter(p=>_B2_ROLE_ORDER.includes(p.role||""));roledMembers.sort((a,b)=>_b2RoleRank(a)-_b2RoleRank(b));const tieredMembers=members.filter(p=>!_B2_ROLE_ORDER.includes(p.role||"")),tierGroups={};tieredMembers.forEach(p=>{const t=p.tier||"?";tierGroups[t]||(tierGroups[t]=[]),tierGroups[t].push(p)});const orderedTierKeys=TIERS.filter(t=>tierGroups[t]).concat(Object.keys(tierGroups).filter(t=>!TIERS.includes(t))),_smemo=uCfg.memo||"",_simgs=(uCfg.memoImgs||[]).concat(uCfg.memoImg?[uCfg.memoImg]:[]),hasSide=!!(_smemo||_simgs.length),_tableRow=(label,isRole,chips)=>`
    <div data-b2-univ-row="1" class="b2-univ-row" style="display:flex;align-items:stretch;gap:0;margin-bottom:8px">
      <div class="b2-univ-row-label" style="background:${labelCol}!important;min-width:70px;width:70px;display:flex;align-items:center;justify-content:center;padding:10px 6px;flex-shrink:0;border-radius:var(--r2) 0 0 16px;border:1px solid ${col}33;border-right:none;box-shadow:inset 0 1px 0 rgba(255,255,255,.28)">
        <span style="font-size:var(--fs-caption);font-weight:900;color:${col};text-align:center;line-height:1.35;word-break:keep-all;letter-spacing:-.01em">${label}</span>
      </div>
      <div class="b2-univ-row-body" style="flex:1;min-width:0;background:${_rowPanelBg};padding:10px 12px;border-radius:0 16px 16px 0;border:1px solid ${_rowPanelBorder};box-shadow:${_rowPanelShadow}">
        ${chips}
      </div>
    </div>`,roleGroups={},roleOrder=[];roledMembers.forEach(p=>{const r=p.role||"";roleGroups[r]||(roleGroups[r]=[],roleOrder.push(r)),roleGroups[r].push(p)});const _bgPos=uCfg.bgImgPos||"center center",_bgSize=uCfg.bgImgSize||"auto",_bgOpacityNum=((_a=uCfg.bgImgAlpha)!=null?_a:b2BgImgAlpha)/100,_bgOpacity=(_hasBgImg?Math.max(.64,_bgOpacityNum+.08):_bgOpacityNum).toFixed(2),_uKeyRaw=String(univName||"").trim(),_uKey=_uKeyRaw.toUpperCase(),_logoOverlayCfg=(()=>{const def={wmGlobalOn:1,wmOn:1,wmScale:150,wmRight:120,wmBottom:30,bgScale:100};try{const raw=String(localStorage.getItem("su_b2_univ_logo_overlay_v1")||"").trim(),parsed=raw?JSON.parse(raw)||{}:{},d=parsed&&parsed.default&&typeof parsed.default=="object"?parsed.default:{},per=parsed&&parsed.perUniv&&typeof parsed.perUniv=="object"?parsed.perUniv:{},over=_uKeyRaw&&per&&per[_uKeyRaw]&&typeof per[_uKeyRaw]=="object"?per[_uKeyRaw]:{},out=Object.assign({},def,d,over);return out.wmGlobalOn=out.wmGlobalOn==null||Number(out.wmGlobalOn)?1:0,out.wmOn=out.wmOn==null||Number(out.wmOn)?1:0,out.wmScale=Math.max(50,Math.min(250,parseInt(out.wmScale||150,10)||150)),out.wmRight=Math.max(0,Math.min(260,parseInt(out.wmRight||120,10)||120)),out.wmBottom=Math.max(0,Math.min(160,parseInt(out.wmBottom||30,10)||30)),out.bgScale=Math.max(60,Math.min(120,parseInt(out.bgScale||100,10)||100)),out}catch(e){return def}})(),_logoUnivNames=["\uB287\uCE90\uC2AC","\uB274\uCEA3\uC2AC","\uCE84\uBAAC\uC2A4\uD0C0\uC988","\uCF00\uC774\uB300","\uC5E0\uBE44\uB300","\uC640\uD50C\uB300","\uC218\uC220\uB300","\uD751\uCE74\uB370\uBBF8"],_isMonstarName=_uKeyRaw.includes("\uBAAC\uC2A4\uD0C0")||_uKey.includes("MONSTAR"),_bgIsLogo=_uKey==="HM"||_uKey==="DM"||_uKey==="SSG"||_uKey==="JSA"||_uKey==="BGM"||_logoUnivNames.includes(_uKeyRaw)||_isMonstarName,_bgLogoPos="44% 50%",_bgLogoSizeBase=(()=>{const isSmall=_uKey==="JSA"||_uKey==="BGM"||_logoUnivNames.includes(_uKeyRaw)||_isMonstarName;return _uKey==="JSA"||_uKeyRaw==="\uD751\uCE74\uB370\uBBF8"?"min(72%,620px) auto":_uKeyRaw==="\uC218\uC220\uB300"||_uKeyRaw==="\uC5E0\uBE44\uB300"||_uKeyRaw==="\uCF00\uC774\uB300"?"min(84%,740px) auto":isSmall?"min(78%,680px) auto":"min(86%,760px) auto"})(),_bgLogoSize=(()=>{const sc=(_logoOverlayCfg.bgScale||100)/100;if(sc===1)return _bgLogoSizeBase;const m=String(_bgLogoSizeBase||"").match(/min\(\s*(\d+)\s*%\s*,\s*(\d+)\s*px\s*\)/i);if(!m)return _bgLogoSizeBase;const pct=Math.max(10,Math.min(100,Math.round(parseInt(m[1],10)*sc))),px=Math.max(80,Math.min(1200,Math.round(parseInt(m[2],10)*sc)));return`min(${pct}%,${px}px) auto`})(),_bgOpacity2=_bgIsLogo?String(Math.min(.48,parseFloat(_bgOpacity)||.48).toFixed(2)):_bgOpacity,_profileViewMode=_b2GetUnivProfileViewMode(),bgImgHtml=uCfg.bgImg?forExport?_bgIsLogo?`<img src="${uCfg.bgImg}" crossorigin="anonymous" style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:${_bgLogoSize.replace(" auto","")};max-width:760px;max-height:78%;height:auto;object-fit:contain;object-position:${_bgLogoPos};opacity:${_bgOpacity2};pointer-events:none;z-index:0" onerror="this.style.display='none'">`:`<img src="${uCfg.bgImg}" crossorigin="anonymous" class="b2-fit-auto" data-fit-kind="bg" data-fit-mode="${_bgSize}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:${_bgSize==="auto"?"cover":_bgSize};object-position:${_bgPos};opacity:${_bgOpacity2};pointer-events:none;z-index:0" onload="_b2ApplyBgAutoSizing(this)">`:_bgIsLogo?`<div class="b2-bg-layer" data-bg-src="${String(uCfg.bgImg).replace(/"/g,"&quot;")}" data-bg-pos="${_bgLogoPos}" style="position:absolute;inset:0;opacity:${_bgOpacity2};pointer-events:none;z-index:0;background-position:${_bgLogoPos};background-size:${_bgLogoSize};background-repeat:no-repeat"></div>`:`<div class="b2-bg-layer" data-bg-src="${String(uCfg.bgImg).replace(/"/g,"&quot;")}" data-bg-pos="${String(_bgPos).replace(/"/g,"&quot;")}" data-bg-size-mode="${_bgSize}" style="position:absolute;inset:0;opacity:${_bgOpacity2};pointer-events:none;z-index:0;background-position:${_bgPos};background-size:${_bgSize==="auto"?"cover":_bgSize};background-repeat:no-repeat"></div>`:"";let rows="",_tableHeadShown=!1;roleOrder.forEach(role=>{const group=roleGroups[role],chips=_b2RenderUnivGroupCards(group,col,!0,_profileViewMode,_profileViewMode==="table"&&_tableHeadShown);_profileViewMode==="table"&&group.length&&(_tableHeadShown=!0),rows+=_tableRow(role,!0,chips)}),orderedTierKeys.forEach(tier=>{const group=tierGroups[tier];group.sort((a,b)=>(a.name||"").localeCompare(b.name||"","ko",{sensitivity:"base"}));const chips=_b2RenderUnivGroupCards(group,col,!1,_profileViewMode,_profileViewMode==="table"&&_tableHeadShown);_profileViewMode==="table"&&group.length&&(_tableHeadShown=!0),rows+=_tableRow(tier,!1,chips)});const sidePanelHtml=hasSide?`<div style="margin-top:10px;background:${_memoPanelBg};padding:12px;box-sizing:border-box;overflow:hidden;border-radius:18px;border:1px solid ${_softBorder};box-shadow:0 14px 26px rgba(15,23,42,.06)">
    <div style="font-size:var(--fs-caption);font-weight:900;color:${col};margin-bottom:${_simgs.length||_smemo?"10px":"0"}">\uC0AC\uC774\uB4DC \uBA54\uBAA8</div>
    ${_simgs.map((src,i)=>`<img src="${src}" style="width:100%;max-width:260px;border-radius:12px;${i<_simgs.length-1||_smemo?"margin-bottom:8px;":""}display:block;object-fit:contain;border:1px solid rgba(148,163,184,.14);background:#fff" onerror="this.style.display='none'">`).join("")}
    ${_smemo?`<div style="font-size:var(--fs-caption);color:#334155;white-space:pre-wrap;line-height:1.65;margin-top:${_simgs.length?"8px":"0"}">${_smemo}</div>`:""}
  </div>`:"",_wmSpec=(()=>{const kRaw=String(univName||"").trim(),k=kRaw.toUpperCase();return k==="HM"||k==="DM"||k==="SSG"?{pct:20,max:148,op1:".34",op0:".24"}:k==="JSA"||kRaw==="\uD751\uCE74\uB370\uBBF8"?{pct:22,max:160,op1:".36",op0:".26",right:66,bottom:28}:k==="JSA"||k==="BGM"||_logoUnivNames.includes(kRaw)||kRaw.includes("\uBAAC\uC2A4\uD0C0")||k.includes("MONSTAR")?{pct:26,max:182,op1:".36",op0:".26",right:46,bottom:28}:{pct:22,max:160,op1:".36",op0:".26"}})(),_wmScale=(_logoOverlayCfg.wmScale||100)/100,_wmPct=Math.max(6,Math.min(60,Math.round(_wmSpec.pct*_wmScale))),_wmMax=Math.max(60,Math.min(520,Math.round(_wmSpec.max*_wmScale))),_wmRightBase=typeof _wmSpec.right=="number"?_wmSpec.right:18,_wmBottomBase=typeof _wmSpec.bottom=="number"?_wmSpec.bottom:22,_wmRight=typeof _logoOverlayCfg.wmRight=="number"?_logoOverlayCfg.wmRight:_wmRightBase,_wmBottom=typeof _logoOverlayCfg.wmBottom=="number"?_logoOverlayCfg.wmBottom:_wmBottomBase,_wmMaxH=Math.round(_wmMax*.7),_wmOn=(_logoOverlayCfg.wmGlobalOn==null?!0:!!Number(_logoOverlayCfg.wmGlobalOn))&&(_logoOverlayCfg.wmOn==null?!0:!!Number(_logoOverlayCfg.wmOn)),bodyContent=`<div class="b2-bg-host" style="position:relative;overflow:hidden;background:${_hasBgImg?"transparent":"linear-gradient(180deg,rgba(255,255,255,.92),rgba(248,250,252,.82))"}">
    ${bgImgHtml}
    ${_wmOn&&iconUrl?`<img src="${toHttpsUrl(iconUrl)}" aria-hidden="true" style="position:absolute;right:${_wmRight}px;bottom:${_wmBottom}px;width:min(${_wmPct}%,${_wmMax}px);max-width:${_wmMax}px;max-height:${_wmMaxH}px;opacity:${_hasBgImg?_wmSpec.op1:_wmSpec.op0};object-fit:contain;pointer-events:none;z-index:0;filter:drop-shadow(0 12px 28px rgba(15,23,42,.18))" onerror="this.style.display='none'">`:""}
    <div data-b2-univ-content="1" style="position:relative;z-index:1;padding:16px 20px 22px 16px;background:transparent">
      <div>${rows}</div>
      ${sidePanelHtml}
    </div>
  </div>`,_ubCreatedRaw=String(uCfg.createdAt||uCfg.created||uCfg.createDate||uCfg.since||uCfg.startDate||"").trim(),_ubCreatedLabel=(()=>{if(!_ubCreatedRaw)return"";const raw=String(_ubCreatedRaw).trim();let m=raw.match(/^(\d{4})[.\-\/](\d{2})[.\-\/](\d{2})/);return m||(m=raw.match(/^(\d{4})(\d{2})(\d{2})/)),m?`${m[1]}.${m[2]}.${m[3]}`:raw.slice(0,10)})(),_bnote=uCfg.bMemo||"",_bimgs=(uCfg.bMemoImgs||[]).concat(uCfg.bMemoImg?[uCfg.bMemoImg]:[]),_bimgHtmls=_bimgs.map(src=>`<img class="b2-bottom-img" src="${src}" style="border-radius:12px;display:inline-block;border:1px solid rgba(148,163,184,.14);background:#fff" onerror="this.style.display='none'">`).join(""),bottomSection=_bnote||_bimgs.length?`<div style="padding:14px 16px 16px;background:${_hasBgImg?"linear-gradient(180deg,rgba(255,255,255,.28),rgba(248,250,252,.14))":"linear-gradient(180deg,rgba(255,255,255,.92),rgba(248,250,252,.86))"};border-top:1px solid rgba(148,163,184,.16)">
    <div style="font-size:var(--fs-caption);font-weight:900;color:${col};margin-bottom:${_bimgHtmls||_bnote?"10px":"0"}">\uD558\uB2E8 \uBA54\uBAA8</div>
    ${_bimgHtmls?`<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:${_bnote?"8px":"0"}">${_bimgHtmls}</div>`:""}
    ${_bnote?`<div style="font-size:var(--fs-sm);color:#334155;white-space:pre-wrap;line-height:1.7">${_bnote}</div>`:""}
  </div>`:"";return`
    <div data-b2card="${univName.replace(/"/g,"&quot;")}" style="border-radius:22px;overflow:hidden;border:1px solid rgba(148,163,184,.16);background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.96));box-shadow:0 18px 32px rgba(15,23,42,.06)">
      <div style="background:linear-gradient(135deg,${col} 0%,${col}dd 100%);padding:16px 16px 14px;position:relative;overflow:hidden">
        <div style="position:absolute;inset:0;background:linear-gradient(145deg,rgba(255,255,255,${_hasBgImg?".08":".18"}),rgba(255,255,255,0) 58%);pointer-events:none"></div>
        <div style="display:flex;align-items:stretch;gap:12px;position:relative;z-index:1">
          ${iconUrl?`<img src="${toHttpsUrl(iconUrl)}" style="width:clamp(56px,var(--su_univ_logo_size,64px),76px);height:clamp(56px,var(--su_univ_logo_size,64px),76px);object-fit:contain;border-radius:var(--su_univ_logo_radius,16px);flex-shrink:0;cursor:pointer;background:rgba(255,255,255,.22);border:1px solid rgba(255,255,255,.28);padding:6px;box-shadow:0 14px 26px rgba(15,23,42,.12)" onclick="if(typeof openUnivModal==='function')openUnivModal('${univName}')" onerror="this.style.display='none'">`:""}
          <div style="min-width:0;flex:1;display:flex;flex-direction:column;gap:7px">
            <div style="display:flex;align-items:flex-start;gap:10px;justify-content:space-between;flex-wrap:wrap">
              <div style="min-width:0;flex:1">
                <div style="display:flex;align-items:center;gap:8px;flex-wrap:nowrap;min-width:0">
                  <span style="font-weight:950;font-size:20px;color:${textCol};cursor:pointer;letter-spacing:-.03em;line-height:1.08;min-width:0;flex:0 1 auto;max-width:min(420px,62%);overflow:hidden;text-overflow:ellipsis;white-space:nowrap" onclick="if(typeof openUnivModal==='function')openUnivModal('${univName}')">${univName}</span>
                  <span style="display:inline-flex;align-items:center;gap:6px;flex-shrink:0;white-space:nowrap">
                    <span style="background:${textCol}1f;color:${textCol};font-size:var(--fs-caption);font-weight:800;padding:4px 9px;border-radius:999px;border:1px solid ${textCol}26;cursor:pointer;box-shadow:inset 0 1px 0 rgba(255,255,255,.06);white-space:nowrap" onclick="event.stopPropagation();openB2MemberBreakdown(this,'${univName}')">${members.length}\uBA85</span>
                    ${_ubCreatedLabel?`<span style="background:${textCol}18;color:${textCol};font-size:10px;font-weight:900;padding:4px 8px;border-radius:999px;border:1px solid ${textCol}22;box-shadow:inset 0 1px 0 rgba(255,255,255,.06);flex-shrink:0;white-space:nowrap">${_ubCreatedLabel}</span>`:""}
                  </span>
                </div>
                ${uCfg.memo2?`<div style="margin-top:5px;font-size:10px;font-weight:700;color:${textCol}dd;line-height:1.45;display:flex;align-items:center;gap:6px;flex-wrap:wrap">
                  <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:0 1 auto;max-width:48%;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.14);border-radius:999px;padding:3px 8px">${uCfg.memo2}</span>
                </div>`:""}
              </div>
              <div style="display:flex;align-items:flex-start;gap:6px;flex-wrap:wrap;justify-content:flex-end">
                ${(uCfg.championships||0)>0?`<span style="display:flex;gap:1px;flex-shrink:0;padding:5px 8px;border-radius:999px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.12)">${'<span style="font-size:var(--fs-md)">\u2B50</span>'.repeat(uCfg.championships)}</span>`:""}
                ${isLoggedIn?`<button class="no-export" onclick="event.stopPropagation();_b2ToggleCard(this,'${univName.replace(/'/g,"\\'")}')" style="background:${textCol}22;border:1px solid ${textCol}33;color:${textCol};font-size:var(--fs-caption);cursor:pointer;padding:4px 9px;border-radius:var(--r);flex-shrink:0;font-weight:800;z-index:var(--z-dropdown);position:relative;box-shadow:inset 0 1px 0 rgba(255,255,255,.08)" title="${_b2Collapsed.has(univName)?"\uD3BC\uCE58\uAE30":"\uC811\uAE30"}">${_b2Collapsed.has(univName)?"\u25B6 \uC811\uAE30 \uD574\uC81C":"\u25BC \uC811\uAE30"}</button>`:""}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="b2-card-body" style="${_b2Collapsed.has(univName)?"display:none":""}">
        ${bodyContent}
        ${bottomSection}
      </div>
    </div>`}function _b2FreeView(){const _freeDissSet=new Set((typeof univCfg!="undefined"?univCfg:[]).filter(u=>u.dissolved).map(u=>String(u.name||"").trim())),freeMembers=players.filter(p=>{const pu=String((p==null?void 0:p.univ)||"").trim();return(!pu||pu==="\uBB34\uC18C\uC18D"||_freeDissSet.has(pu))&&!p.hidden&&!p.retired&&!p.hideFromBoard});if(!freeMembers.length)return'<div style="text-align:center;color:var(--text3);padding:40px">\uBB34\uC18C\uC18D \uBA64\uBC84\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4</div>';const roledFree=freeMembers.filter(p=>_B2_ROLE_ORDER.includes(p.role||""));roledFree.sort((a,b)=>_b2RoleRank(a)-_b2RoleRank(b));const tieredFree=freeMembers.filter(p=>!_B2_ROLE_ORDER.includes(p.role||"")),tierGroups={};tieredFree.forEach(p=>{const t=p.tier||"?";tierGroups[t]||(tierGroups[t]=[]),tierGroups[t].push(p)});const orderedTierKeys=TIERS.filter(t=>tierGroups[t]).concat(Object.keys(tierGroups).filter(t=>!TIERS.includes(t))),_fvNow=new Date,_fvDay=_fvNow.getDay(),_fvMon=new Date(_fvNow);_fvMon.setDate(_fvNow.getDate()+(_fvDay===0?-6:1-_fvDay));const _fvFromN=parseInt(_fvMon.toISOString().slice(0,10).replace(/-/g,"")),_fvToN=parseInt(_fvNow.toISOString().slice(0,10).replace(/-/g,"")),_fvDN=s=>parseInt(String(s||"").replace(/[-\.]/g,""))||0;let _fvTw=0,_fvTl=0,_fvWw=0,_fvWl=0,_fvActive=0;tieredFree.forEach(p=>{let acted=!1;(Array.isArray(p.history)?p.history:[]).forEach(h2=>{h2.result==="\uC2B9"?_fvTw++:h2.result==="\uD328"&&_fvTl++;const d=_fvDN(h2.date||h2.d||"");d>=_fvFromN&&d<=_fvToN&&(h2.result==="\uC2B9"?_fvWw++:h2.result==="\uD328"&&_fvWl++,acted=!0)}),acted&&_fvActive++});const _fvTg=_fvTw+_fvTl,_fvWr=_fvTg>0?Math.round(_fvTw/_fvTg*100):null,_fvWrc=_fvWr===null?"#94a3b8":_fvWr>=60?"#10b981":_fvWr>=40?"#f59e0b":"#ef4444",_fvWwT=_fvWw+_fvWl,rCts={P:0,T:0,Z:0,"?":0};tieredFree.forEach(p=>{const r=p.race||"?";rCts[r in rCts?r:"?"]++});const rTotal=tieredFree.length||1,defCol="#64748b",_fvMode=_b2GetFreeViewMode(),_fvModeBtn=(mode,label)=>`
    <button type="button" class="no-export" onclick="_b2SetFreeViewMode('${mode}')" style="padding:4px 11px;border-radius:999px;border:1px solid ${_fvMode===mode?"rgba(255,255,255,.7)":"rgba(255,255,255,.22)"};background:${_fvMode===mode?"rgba(255,255,255,.24)":"rgba(255,255,255,.08)"};color:#fff;font-size:10px;font-weight:900;cursor:pointer">${label}</button>`;let h=`<div style="border-radius:22px;overflow:hidden;border:1px solid rgba(148,163,184,.16);background:linear-gradient(180deg,rgba(255,255,255,.99),rgba(248,250,252,.96));box-shadow:0 18px 32px rgba(15,23,42,.06)">
    <div style="background:linear-gradient(135deg,${defCol} 0%,#475569 100%);padding:14px 16px 12px;position:relative;overflow:hidden">
      <div style="position:absolute;inset:0;background:linear-gradient(145deg,rgba(255,255,255,.14),rgba(255,255,255,0) 58%);pointer-events:none"></div>
      <div style="position:relative;z-index:1">
      <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
        <span style="font-weight:950;font-size:var(--fs-lg);color:#fff;letter-spacing:-.02em">\u{1F6B6} \uBB34\uC18C\uC18D</span>
        <span style="background:rgba(255,255,255,.18);color:#fff;font-size:var(--fs-caption);font-weight:800;padding:4px 9px;border-radius:999px;border:1px solid rgba(255,255,255,.15)">${freeMembers.length}\uBA85</span>
        ${_fvActive>0?`<span style="background:rgba(255,165,0,.35);color:#fef08a;font-size:10px;font-weight:900;padding:4px 8px;border-radius:999px;border:1px solid rgba(255,255,255,.12)">\u{1F525} \uC774\uBC88\uC8FC ${_fvActive}\uBA85</span>`:""}
        ${_fvWwT>0?`<span style="background:rgba(0,0,0,.18);color:${_fvWw>=_fvWl?"#bbf7d0":"#fecaca"};font-size:10px;font-weight:900;padding:4px 8px;border-radius:999px;border:1px solid rgba(255,255,255,.12)">${_fvWw}\uC2B9${_fvWl}\uD328</span>`:""}
        ${_fvWr!==null?`<span style="background:rgba(0,0,0,.18);color:${_fvWrc};font-size:10px;font-weight:900;padding:4px 8px;border-radius:999px;border:1px solid rgba(255,255,255,.12)" title="\uD1B5\uC0B0 ${_fvTw}\uC2B9 ${_fvTl}\uD328">\u{1F4CA} \uD1B5\uC0B0 ${_fvWr}%</span>`:""}
        <div style="margin-left:auto;display:flex;gap:4px;align-items:center">
          ${rCts.P?`<span style="font-size:10px;background:rgba(124,58,237,.4);color:#ede9fe;padding:4px 8px;border-radius:999px;font-weight:900;border:1px solid rgba(255,255,255,.12)">\u{1F52E}${rCts.P}</span>`:""}
          ${rCts.T?`<span style="font-size:10px;background:rgba(2,132,199,.4);color:#e0f2fe;padding:4px 8px;border-radius:999px;font-weight:900;border:1px solid rgba(255,255,255,.12)">\u2694\uFE0F${rCts.T}</span>`:""}
          ${rCts.Z?`<span style="font-size:10px;background:rgba(5,150,105,.4);color:#d1fae5;padding:4px 8px;border-radius:999px;font-weight:900;border:1px solid rgba(255,255,255,.12)">\u{1F98E}${rCts.Z}</span>`:""}
        </div>
      </div>
      <div style="display:flex;height:5px;border-radius:3px;overflow:hidden;margin-top:8px;background:rgba(255,255,255,.15)">
        ${rCts.P?`<div style="flex:${rCts.P};background:#7c3aed;opacity:.85"></div>`:""}
        ${rCts.T?`<div style="flex:${rCts.T};background:#0284c7;opacity:.85"></div>`:""}
        ${rCts.Z?`<div style="flex:${rCts.Z};background:#059669;opacity:.85"></div>`:""}
        ${rCts["?"]?`<div style="flex:${rCts["?"]};background:rgba(255,255,255,.2)"></div>`:""}
      </div>
      <div style="display:flex;align-items:center;gap:5px;flex-wrap:wrap;margin-top:10px;padding-top:10px;border-top:1px dashed rgba(255,255,255,.18)" class="no-export">
        <span style="font-size:10px;font-weight:800;color:rgba(255,255,255,.65);margin-right:2px">\u{1F5BC}\uFE0F \uBAA8\uB4DC</span>
        ${_fvModeBtn("default","\uAE30\uBCF8")}
        ${_fvModeBtn("stat","\u{1F4CA} \uD1B5\uACC4\uCE74\uB4DC")}
        ${_fvModeBtn("table","\u{1F5C2}\uFE0F \uD14C\uC774\uBE14")}
      </div>
      </div>
    </div>
    <div style="background:linear-gradient(180deg,rgba(255,255,255,.96),rgba(248,250,252,.90));padding:16px">`;if(_fvMode==="stat"){const _allFree=roledFree.concat(orderedTierKeys.flatMap(t=>tierGroups[t].slice().sort((a,b)=>(a.name||"").localeCompare(b.name||"","ko",{sensitivity:"base"}))));h+=`<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:14px">${_allFree.map(p=>_b2LineupCard3(p,defCol)).join("")}</div>`}else if(_fvMode==="table"){const _allFree=roledFree.concat(orderedTierKeys.flatMap(t=>tierGroups[t].slice().sort((a,b)=>(a.name||"").localeCompare(b.name||"","ko",{sensitivity:"base"}))));h+=_b2LineupTable(_allFree,defCol)}else{const _frow=(labelEl,contentEl)=>`<div style="display:flex;align-items:stretch;gap:0;margin-bottom:8px">${labelEl}<div style="flex:1;padding:10px 12px;background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.94));border:1px solid rgba(148,163,184,.14);border-left:none;border-radius:0 16px 16px 0;box-shadow:0 10px 18px rgba(15,23,42,.04)">${contentEl}</div></div>`,_fl=(text,isRole)=>`<span style="font-size:var(--fs-sm);font-weight:900;color:${isRole?defCol:"var(--text3)"};width:68px;min-width:68px;text-align:center;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;background:#64748b${_b2AlphaHex(b2LabelAlpha)}!important;border:1px solid rgba(100,116,139,.28);border-right:none;border-radius:var(--r2) 0 0 16px;padding:8px 6px;box-shadow:inset 0 1px 0 rgba(255,255,255,.2)">${text}</span>`;roledFree.forEach(p=>{h+=_frow(_fl(p.role||"",!0),_b2PlayerRow(p,defCol))}),orderedTierKeys.forEach(tier=>{const group=tierGroups[tier];group.sort((a,b)=>(a.name||"").localeCompare(b.name||"","ko",{sensitivity:"base"}));const col=getTierBtnColor(tier);h+=_frow(_fl(tier,!1),`<div style="display:flex;flex-wrap:wrap;gap:5px;padding:2px 0">${group.map(p=>_b2NameTag(p,col,!1)).join("")}</div>`)})}return h+="</div></div>",h}function _b2GetFreeViewMode(){try{const raw=String(localStorage.getItem("su_b2_free_view")||"").trim();return["default","stat","table"].includes(raw)?raw:"default"}catch(e){return"default"}}function _b2SetFreeViewMode(mode){const nextMode=["default","stat","table"].includes(String(mode||""))?String(mode):"default";try{localStorage.setItem("su_b2_free_view",nextMode)}catch(e){}typeof render=="function"&&render()}function openB2MemberBreakdown(el,univName){const existing=document.getElementById("b2-mbp");if(existing){const wasEl=existing._forEl;if(existing.remove(),wasEl===el)return}const col=gc(univName),members=players.filter(p=>String((p==null?void 0:p.univ)||"").trim()===String(univName||"").trim()&&!p.hidden&&!p.retired&&!p.hideFromBoard),roled=members.filter(p=>_B2_ROLE_ORDER.includes(p.role||"")),tiered=members.filter(p=>!_B2_ROLE_ORDER.includes(p.role||"")),tierCounts={};tiered.forEach(p=>{const t=p.tier||"?";tierCounts[t]=(tierCounts[t]||0)+1});const orderedTiers=TIERS.filter(t=>tierCounts[t]).concat(Object.keys(tierCounts).filter(t=>!TIERS.includes(t))),row=(label,val,c)=>`<div style="display:flex;justify-content:space-between;align-items:center;gap:16px;padding:2px 0">
    <span style="color:${c||"var(--text2)"};font-size:var(--fs-sm)">${label}</span>
    <span style="font-weight:700;color:var(--text1);font-size:var(--fs-sm)">${val}\uBA85</span></div>`,popup=document.createElement("div");popup.id="b2-mbp",popup.style.cssText="position:fixed;z-index:var(--z-top);background:linear-gradient(180deg,rgba(255,255,255,.99),rgba(248,250,252,.96));border:1px solid rgba(148,163,184,.16);border-radius:18px;box-shadow:0 16px 38px rgba(15,23,42,.16);padding:14px 15px;min-width:220px;backdrop-filter:blur(12px)",popup.innerHTML=`
    <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:10px">
      <div style="font-weight:900;font-size:14px;color:${col};letter-spacing:-.02em">${univName} \uAD6C\uC131</div>
      <div style="font-size:var(--fs-caption);font-weight:900;color:var(--text3)">${members.length}\uBA85</div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-bottom:10px">
      <div style="padding:10px 11px;border-radius:14px;background:${col}12;border:1px solid ${col}22"><div style="font-size:10px;font-weight:900;color:var(--text3)">\uC9C1\uCC45\uC790</div><div style="margin-top:5px;font-size:var(--fs-lg);font-weight:1000;color:${col}">${roled.length}</div></div>
      <div style="padding:10px 11px;border-radius:14px;background:${col}0a;border:1px solid ${col}18"><div style="font-size:10px;font-weight:900;color:var(--text3)">\uC77C\uBC18 \uC2A4\uD2B8\uB9AC\uBA38</div><div style="margin-top:5px;font-size:var(--fs-lg);font-weight:1000;color:var(--text1)">${tiered.length}</div></div>
    </div>
    ${row("\uC9C1\uCC45\uC790",roled.length)}
    ${row("\uC77C\uBC18 \uC2A4\uD2B8\uB9AC\uBA38",tiered.length)}
    ${orderedTiers.length?`<div style="border-top:1px solid var(--border2);margin:6px 0"></div>${orderedTiers.map(t=>row(t,tierCounts[t],getTierBtnColor(t))).join("")}`:""}`,popup._forEl=el,document.body.appendChild(popup);const rect=el.getBoundingClientRect();popup.style.top=rect.bottom+6+"px",popup.style.left=rect.left+"px",requestAnimationFrame(()=>{rect.left+popup.offsetWidth>window.innerWidth-8&&(popup.style.left=rect.right-popup.offsetWidth+"px"),rect.bottom+popup.offsetHeight+6>window.innerHeight&&(popup.style.top=rect.top-popup.offsetHeight-6+"px")}),setTimeout(()=>{function _c(e){!popup.contains(e.target)&&e.target!==el&&_close()}function _s(){_close()}function _close(){popup.remove(),document.removeEventListener("click",_c),window.removeEventListener("scroll",_s,!0)}document.addEventListener("click",_c),window.addEventListener("scroll",_s,{capture:!0,once:!0})},0)}async function saveB2Img(){const univList=_b2VisUnivs().filter(u=>u.name!=="\uBB34\uC18C\uC18D"),targets=_b2SaveUniv==="\uC804\uCCB4"?univList:univList.filter(u=>u.name===_b2SaveUniv);if(!targets.length){alert("\uC800\uC7A5\uD560 \uB300\uD559\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.");return}const btn=document.querySelector('[onclick="saveB2Img()"]');btn&&(btn.disabled=!0,btn.textContent="\u23F3...");const CARD_W=720,gap=14,PAD=24,tmpDiv=document.createElement("div");tmpDiv.style.cssText=`position:fixed;left:-9999px;top:0;padding:${PAD}px;background:#f0f2f5;box-sizing:border-box;width:${CARD_W+PAD*2}px`,tmpDiv.innerHTML=`<style>.b2-bottom-img{max-width:160px;max-height:130px;object-fit:contain;}</style>
    <div style="display:flex;flex-direction:column;gap:${gap}px">
      ${targets.map(u=>_b2UnivBlock(u.name,gc(u.name),players.filter(p=>String((p==null?void 0:p.univ)||"").trim()===String(u.name||"").trim()&&!p.hidden&&!p.retired&&!p.hideFromBoard),!0)).join("")}
    </div>`,document.body.appendChild(tmpDiv),tmpDiv.querySelectorAll(".no-export,.no-export-movebtns").forEach(el=>el.remove()),await new Promise(r=>setTimeout(r,100)),injectUnivIcons(tmpDiv);const h=tmpDiv.scrollHeight+32,w=tmpDiv.scrollWidth,fname=(_b2SaveUniv==="\uC804\uCCB4"?"\uB300\uD559\uBCC4\uD604\uD669\uD310_\uC804\uCCB4":`\uB300\uD559\uBCC4\uD604\uD669\uD310_${_b2SaveUniv}`)+"_"+new Date().toISOString().slice(0,10)+".png";try{if(typeof _captureAndSave!="function")throw new Error("\uC774\uBBF8\uC9C0 \uC800\uC7A5 \uAE30\uB2A5\uC744 \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.");await _captureAndSave(tmpDiv,w,h,fname)}catch(e){console.error("[\uD604\uD669\uD310 \uC774\uBBF8\uC9C0 \uC800\uC7A5 \uC2E4\uD328]",e),alert(`\u274C \uC774\uBBF8\uC9C0 \uC800\uC7A5 \uC2E4\uD328

`+(e.message||"\uC54C \uC218 \uC5C6\uB294 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4."))}finally{document.body.removeChild(tmpDiv),btn&&(btn.disabled=!1,btn.textContent="\u{1F4F7} \uC774\uBBF8\uC9C0\uC800\uC7A5")}}function _b2PastelBg(hex,ratio){const{r,g,b}=typeof _hexToRgbObj=="function"?_hexToRgbObj(hex):{r:100,g:116,b:139},t=typeof ratio=="number"?ratio:.1,mix=c=>Math.round(255*(1-t)+c*t);return`rgb(${mix(r)},${mix(g)},${mix(b)})`}function _b2GetUnivProfileViewMode(){try{const raw=String(localStorage.getItem("su_b2_univ_profile_view")||"").trim();return raw==="card"?"poster":raw==="compact"||raw==="media"||raw==="board"||raw==="split"?"rank":["default","poster","rank","glass","table"].includes(raw)?raw:"default"}catch(e){return"default"}}function _b2SetUnivProfileViewMode(mode){const nextMode=["default","poster","rank","glass","table"].includes(String(mode||""))?String(mode):"default";try{localStorage.setItem("su_b2_univ_profile_view",nextMode)}catch(e){}typeof render=="function"&&render()}function _b2UnivRankRow(p,accentCol,showBadge,idx){const safeName=(p.name||"").replace(/'/g,"\\'"),photo=p.photo?toThumbUrl(p.photo,42):"",photoOrig=p.photo?toHttpsUrl(p.photo):"",raceLetter=p.race&&p.race!=="N"?p.race:"?",raceCol={T:"#2563eb",P:"#d97706",Z:"#7c3aed"}[p.race]||"#475569",badgeTxt=showBadge&&(p.tier||p.role)||"",badgeBg=p.tier&&typeof getTierBtnColor=="function"?getTierBtnColor(p.tier):accentCol,badgeFg=p.tier&&typeof getTierBtnTextColor=="function"&&getTierBtnTextColor(p.tier)||"#fff",win=Number(p.win||0),loss=Number(p.loss||0),games=win+loss,wr=games?Math.round(win/games*100):null,wrCol=wr==null?"#94a3b8":wr>=50?"#16a34a":"#dc2626",recordTxt=games?`${win}\uC2B9 ${loss}\uD328`:"\uAE30\uB85D \uC5C6\uC74C";return`
    <div style="display:flex;align-items:center;gap:12px;padding:9px 14px;border-radius:var(--r2);border:1px solid ${accentCol}22;background:linear-gradient(120deg,${accentCol}14 0%,${accentCol}05 100%);box-shadow:0 6px 16px rgba(15,23,42,.06);cursor:pointer;transition:transform .16s ease,box-shadow .16s ease,border-color .16s ease"
      onclick="openPlayerModal('${safeName}')"
      onmouseenter="this.style.transform='translateX(3px)';this.style.boxShadow='0 10px 22px rgba(15,23,42,.14)';this.style.borderColor='${accentCol}55'"
      onmouseleave="this.style.transform='';this.style.boxShadow='0 6px 16px rgba(15,23,42,.06)';this.style.borderColor='${accentCol}22'">
      <div style="flex-shrink:0;width:20px;text-align:center;font-size:var(--fs-caption);font-weight:900;color:${accentCol};opacity:.75">${idx}</div>
      <div style="width:42px;height:42px;flex-shrink:0;border-radius:var(--su_profile_radius,50%);clip-path:var(--su_profile_clip,none);overflow:hidden;border:2px solid ${accentCol}55;background:${accentCol}22;box-shadow:0 4px 10px ${accentCol}26">
        ${photo?`<img src="${photo}" data-orig="${photoOrig}" crossorigin="anonymous" loading="lazy" decoding="async" style="width:100%;height:100%;object-fit:cover;object-position:top center" onerror="if(this.dataset.orig&&this.src!==this.dataset.orig){this.removeAttribute('crossorigin');this.src=this.dataset.orig;}else{this.style.display='none';this.nextElementSibling.style.display='flex'}"><div style="display:none;align-items:center;justify-content:center;width:100%;height:100%;font-size:14px;font-weight:1000;color:${accentCol}">${raceLetter}</div>`:`<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:14px;font-weight:1000;color:${accentCol}">${raceLetter}</div>`}
      </div>
      <div style="min-width:0;flex:0 0 auto;width:112px">
        <div style="display:flex;align-items:center;gap:6px;min-width:0">
          <span style="font-size:var(--fs-base);font-weight:950;color:var(--text1);letter-spacing:-.02em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;${p.inactive?"opacity:.6":""}">${p.name||""}</span>
        </div>
        <div style="display:flex;align-items:center;gap:5px;margin-top:3px;flex-wrap:wrap">
          ${p.race&&p.race!=="N"?`<span style="display:inline-flex;padding:1px 6px;border-radius:999px;background:${raceCol};color:#fff;font-size:9px;font-weight:900">${p.race}</span>`:""}
          ${badgeTxt?`<span style="display:inline-flex;padding:1px 6px;border-radius:999px;background:${badgeBg};color:${badgeFg};font-size:9px;font-weight:900">${badgeTxt}</span>`:""}
        </div>
      </div>
      <div style="flex:1;min-width:100px;display:flex;flex-direction:column;gap:4px">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:6px">
          <span style="font-size:10px;font-weight:800;color:var(--text3);white-space:nowrap">${recordTxt}</span>
          <span style="font-size:var(--fs-caption);font-weight:950;color:${wrCol};flex-shrink:0">${wr==null?"-":wr+"%"}</span>
        </div>
      </div>
    </div>`}function _b2UnivGlassCard(p,accentCol,showBadge){const safeName=(p.name||"").replace(/'/g,"\\'"),photo=p.photo?toScaledUrl(p.photo,300):"",photoOrig=p.photo?toHttpsUrl(p.photo):"",raceLetter=p.race&&p.race!=="N"?p.race:"?",raceCol={T:"#2563eb",P:"#d97706",Z:"#7c3aed"}[p.race]||"#475569",badgeTxt=showBadge&&(p.tier||p.role)||"",badgeBg=p.tier&&typeof getTierBtnColor=="function"?getTierBtnColor(p.tier):accentCol,win=Number(p.win||0),loss=Number(p.loss||0),games=win+loss,wr=games?Math.round(win/games*100):null,wrCol=wr==null?"#94a3b8":wr>=50?"#16a34a":"#dc2626";return`
    <div style="width:150px;max-width:100%;border-radius:22px;overflow:hidden;cursor:pointer;background:rgba(255,255,255,.6);box-shadow:0 10px 22px rgba(15,23,42,.12);border:1px solid ${accentCol}2e;transition:transform .18s,box-shadow .18s"
      onclick="openPlayerModal('${safeName}')"
      onmouseenter="this.style.transform='translateY(-4px)';this.style.boxShadow='0 16px 28px rgba(15,23,42,.2)'"
      onmouseleave="this.style.transform='';this.style.boxShadow='0 10px 22px rgba(15,23,42,.12)'">
      <div style="position:relative;width:100%;aspect-ratio:.86;overflow:hidden;background:linear-gradient(160deg,${accentCol}40,${accentCol}12)">
        ${photo?`<img src="${photo}" data-orig="${photoOrig}" crossorigin="anonymous" loading="lazy" decoding="async" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center" onerror="if(this.dataset.orig&&this.src!==this.dataset.orig){this.removeAttribute('crossorigin');this.src=this.dataset.orig;}else{this.style.display='none';this.nextElementSibling.style.display='flex'}"><div style="display:none;position:absolute;inset:0;align-items:center;justify-content:center;font-size:34px;font-weight:1000;color:${accentCol}">${raceLetter}</div>`:`<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:34px;font-weight:1000;color:${accentCol}">${raceLetter}</div>`}
        ${p.race&&p.race!=="N"?`<div style="position:absolute;top:7px;right:7px;padding:2px 8px;border-radius:999px;background:${raceCol}e6;color:#fff;font-size:10px;font-weight:900;box-shadow:0 2px 6px rgba(0,0,0,.22)">${p.race}</div>`:""}
        ${badgeTxt?`<div style="position:absolute;top:7px;left:7px;padding:2px 8px;border-radius:999px;background:rgba(255,255,255,.85);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);color:${badgeBg};font-weight:900;font-size:10px;box-shadow:0 2px 6px rgba(0,0,0,.12)">${badgeTxt}</div>`:""}
      </div>
      <div style="padding:9px 11px 10px;background:rgba(255,255,255,.7);backdrop-filter:blur(10px) saturate(1.3);-webkit-backdrop-filter:blur(10px) saturate(1.3);border-top:1px solid ${accentCol}20">
        <div style="color:var(--text1);font-weight:950;font-size:var(--fs-base);letter-spacing:-.02em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${p.name||""}</div>
        <div style="margin-top:6px;display:flex;align-items:center;justify-content:flex-end;gap:6px">
          <span style="font-size:var(--fs-caption);font-weight:900;color:${wrCol};flex-shrink:0">${wr==null?"-":wr+"%"}</span>
        </div>
      </div>
    </div>`}function _b2UnivFrameCard(p,accentCol,showBadge){const safeName=(p.name||"").replace(/'/g,"\\'"),photo=p.photo?toScaledUrl(p.photo,300):"",photoOrig=p.photo?toHttpsUrl(p.photo):"",raceLetter=p.race&&p.race!=="N"?p.race:"?",raceCol={T:"#2563eb",P:"#d97706",Z:"#7c3aed"}[p.race]||"#475569",badgeTxt=showBadge&&(p.tier||p.role)||"",badgeBg=p.tier&&typeof getTierBtnColor=="function"?getTierBtnColor(p.tier):accentCol,badgeFg=p.tier&&typeof getTierBtnTextColor=="function"&&getTierBtnTextColor(p.tier)||"#fff",win=Number(p.win||0),loss=Number(p.loss||0),games=win+loss,wr=games?Math.round(win/games*100):null;return`
    <div style="width:150px;max-width:100%;border-radius:20px;overflow:hidden;cursor:pointer;border:3px solid ${accentCol};box-shadow:0 10px 20px rgba(15,23,42,.14);transition:transform .16s,box-shadow .16s"
      onclick="openPlayerModal('${safeName}')"
      onmouseenter="this.style.transform='translateY(-3px)';this.style.boxShadow='0 14px 26px rgba(15,23,42,.22)'"
      onmouseleave="this.style.transform='';this.style.boxShadow='0 10px 20px rgba(15,23,42,.14)'">
      <div style="position:relative;width:100%;aspect-ratio:.86;overflow:hidden;background:linear-gradient(160deg,${accentCol}45,${accentCol}14)">
        ${photo?`<img src="${photo}" data-orig="${photoOrig}" crossorigin="anonymous" loading="lazy" decoding="async" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center" onerror="if(this.dataset.orig&&this.src!==this.dataset.orig){this.removeAttribute('crossorigin');this.src=this.dataset.orig;}else{this.style.display='none';this.nextElementSibling.style.display='flex'}"><div style="display:none;position:absolute;inset:0;align-items:center;justify-content:center;font-size:34px;font-weight:1000;color:${accentCol}">${raceLetter}</div>`:`<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:34px;font-weight:1000;color:${accentCol}">${raceLetter}</div>`}
        ${badgeTxt?`<div style="position:absolute;top:0;left:0;padding:3px 10px 3px 8px;border-radius:0 0 10px 0;background:${badgeBg};color:${badgeFg};font-weight:900;font-size:10px">${badgeTxt}</div>`:""}
        ${p.race&&p.race!=="N"?`<div style="position:absolute;top:7px;right:7px;padding:2px 8px;border-radius:999px;background:${raceCol}e6;color:#fff;font-size:10px;font-weight:900;box-shadow:0 2px 6px rgba(0,0,0,.22)">${p.race}</div>`:""}
      </div>
      <div style="padding:8px 10px 9px;background:${accentCol};text-align:center">
        <div style="color:#fff;font-weight:950;font-size:var(--fs-base);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 1px 3px rgba(0,0,0,.22)">${p.name||""}</div>
        <div style="margin-top:4px;font-size:10px;font-weight:800;color:rgba(255,255,255,.92)">${games?`${win}\uC2B9 ${loss}\uD328 \xB7 ${wr}%`:"\uAE30\uB85D \uC5C6\uC74C"}</div>
      </div>
    </div>`}function _b2UnivPhotoCard(p,accentCol,showBadge){const safeName=(p.name||"").replace(/'/g,"\\'"),photo=p.photo?toScaledUrl(p.photo,300):"",photoOrig=p.photo?toHttpsUrl(p.photo):"",raceLetter=p.race&&p.race!=="N"?p.race:"?",shapeStyle="border-radius:var(--su_profile_radius,50%);clip-path:var(--su_profile_clip,none);",badgeTxt=showBadge&&(p.tier||p.role)||"",badgeBg=p.tier&&typeof getTierBtnColor=="function"?getTierBtnColor(p.tier):accentCol,badgeFg=p.tier&&typeof getTierBtnTextColor=="function"&&getTierBtnTextColor(p.tier)||"#fff",raceCol={T:"#2563eb",P:"#d97706",Z:"#7c3aed"}[p.race]||"#475569",backdrop=photo?`<img src="${photo}" data-orig="${photoOrig}" crossorigin="anonymous" loading="lazy" decoding="async" aria-hidden="true" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center;transform:scale(1.16);filter:blur(14px) saturate(1.08) brightness(.88);opacity:.88" onerror="if(this.dataset.orig&&this.src!==this.dataset.orig){this.removeAttribute('crossorigin');this.src=this.dataset.orig;}else{this.style.display='none'}">
       <div style="position:absolute;inset:0;background:linear-gradient(180deg,${accentCol}24 0%,rgba(2,6,23,.12) 100%)"></div>`:`<div style="position:absolute;inset:0;background:linear-gradient(160deg,${accentCol}44 0%,${accentCol}18 100%)"></div>`,photoHtml=photo?`<img src="${photo}" data-orig="${photoOrig}" crossorigin="anonymous" loading="lazy" decoding="async" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center" onerror="if(this.dataset.orig&&this.src!==this.dataset.orig){this.removeAttribute('crossorigin');this.src=this.dataset.orig;}else{this.style.display='none';this.nextElementSibling.style.display='flex'}">
       <div style="position:absolute;inset:0;display:none;align-items:center;justify-content:center;font-size:34px;font-weight:1000;color:${accentCol};opacity:.78">${raceLetter}</div>`:`<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:34px;font-weight:1000;color:${accentCol};opacity:.78">${raceLetter}</div>`;return`
    <div style="position:relative;width:122px;max-width:100%;aspect-ratio:.78;${shapeStyle}overflow:hidden;border:1px solid rgba(255,255,255,.16);background:#0b1120;box-shadow:0 10px 20px rgba(15,23,42,.12);cursor:pointer;transition:transform .18s ease,box-shadow .18s ease" onclick="openPlayerModal('${safeName}')"
      onmouseenter="this.style.transform='translateY(-4px) scale(1.03)';this.style.boxShadow='0 16px 28px rgba(15,23,42,.24)'"
      onmouseleave="this.style.transform='';this.style.boxShadow='0 10px 20px rgba(15,23,42,.12)'">
      ${backdrop}
      ${photoHtml}
      ${p.race&&p.race!=="N"?`<div style="position:absolute;top:8px;right:8px;padding:2px 8px;border-radius:999px;background:${raceCol};color:#fff;font-size:10px;font-weight:900;z-index:2;box-shadow:0 2px 6px rgba(0,0,0,.26)">${p.race}</div>`:""}
      <div style="position:absolute;left:0;right:0;bottom:0;padding:9px 9px 10px;background:linear-gradient(180deg,rgba(2,6,23,0) 0%,rgba(2,6,23,.20) 30%,rgba(2,6,23,.62) 100%);z-index:2">
        ${badgeTxt?`<div style="margin-bottom:3px"><span style="display:inline-flex;align-items:center;padding:2px 7px;border-radius:999px;background:${badgeBg};color:${badgeFg};font-size:10px;font-weight:900;line-height:1.4">${badgeTxt}</span></div>`:""}
        <div style="color:#fff;font-size:var(--fs-sm);font-weight:950;letter-spacing:-.02em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 1px 4px rgba(0,0,0,.5)">${p.name||""}</div>
      </div>
    </div>`}function _b2UnivDefaultTag(p,accentCol,showTier){const safeName=(p.name||"").replace(/'/g,"\\'"),crewCol=p.crewName&&typeof _gcCrew=="function"&&_gcCrew(p.crewName)||"";return`
    <div class="b2-def-tag-item" style="display:flex;align-items:center;gap:8px;padding:4px 10px 4px 4px;border-radius:24px;cursor:pointer;transition:background .12s;white-space:nowrap;flex-shrink:0"
      onmouseover="this.style.background='${accentCol}14'"
      onmouseout="this.style.background='transparent'">
      <div onclick="openPlayerModal('${safeName}')" style="display:flex;align-items:center;gap:8px;flex:1;min-width:0">
      ${_b2Avatar(p,crewCol||accentCol,58)}
      <span style="font-weight:800;font-size:20px;color:var(--text1);white-space:nowrap;${p.inactive?"opacity:.6":""}">${p.name||""}</span>
      ${p.race&&p.race!=="N"?`<span class="rbadge r${p.race}" style="font-size:var(--fs-caption);flex-shrink:0">${p.race}</span>`:""}
      ${showTier&&p.tier?`<span style="font-size:var(--fs-caption);font-weight:800;padding:2px 7px;border-radius:6px;background:${getTierBtnColor(p.tier)};color:${getTierBtnTextColor(p.tier)||"#fff"};flex-shrink:0">${p.tier}</span>`:""}
      ${p.inactive?'<span style="font-size:9px;background:#fff7ed;color:#9a3412;border-radius:4px;padding:1px 4px;font-weight:700;flex-shrink:0">\u23F8\uFE0F</span>':""}
      </div>
    </div>`}function _b2UnivHeatCard(p,accentCol){const safeName=(p.name||"").replace(/'/g,"\\'"),photo=p.photo?toThumbUrl(p.photo,112):"",photoOrig=p.photo?toHttpsUrl(p.photo):"",raceLetter=p.race&&p.race!=="N"?p.race:"?";return`<button type="button" title="${(p.name||"").replace(/"/g,"&quot;")}" onclick="openPlayerModal('${safeName}')" style="width:112px;height:112px;padding:0;border:none;border-radius:var(--su_profile_radius,50%);clip-path:var(--su_profile_clip,none);overflow:hidden;background:${accentCol}22;box-shadow:0 8px 20px rgba(15,23,42,.09);cursor:pointer">
    ${photo?`<img src="${photo}" data-orig="${photoOrig}" crossorigin="anonymous" loading="lazy" decoding="async" style="width:100%;height:100%;object-fit:cover;object-position:top center" onerror="if(this.dataset.orig&&this.src!==this.dataset.orig){this.removeAttribute('crossorigin');this.src=this.dataset.orig;}else{this.style.display='none';this.nextElementSibling.style.display='flex'}"><span style="display:none;align-items:center;justify-content:center;width:100%;height:100%;font-size:32px;font-weight:1000;color:${accentCol}">${raceLetter}</span>`:`<span style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:32px;font-weight:1000;color:${accentCol}">${raceLetter}</span>`}
  </button>`}function _b2RenderUnivGroupCards(group,accentCol,showBadge,mode,hideTableHead){const items=Array.isArray(group)?group:[];return mode==="poster"?`<div style="display:flex;flex-wrap:wrap;gap:14px">${items.map(p=>_b2UnivPhotoCard(p,accentCol,showBadge)).join("")}</div>`:mode==="rank"?`<div style="display:flex;flex-direction:column;gap:8px">${items.slice().sort((a,b)=>{const aw=Number(a.win||0),al=Number(a.loss||0),ag=aw+al,awr=ag?aw/ag:-1,bw=Number(b.win||0),bl=Number(b.loss||0),bg=bw+bl,bwr=bg?bw/bg:-1;return bwr!==awr?bwr-awr:bw!==aw?bw-aw:(a.name||"").localeCompare(b.name||"","ko",{sensitivity:"base"})}).map((p,i)=>_b2UnivRankRow(p,accentCol,showBadge,i+1)).join("")}</div>`:mode==="glass"?`<div style="display:flex;flex-wrap:wrap;gap:14px">${items.map(p=>_b2UnivGlassCard(p,accentCol,showBadge)).join("")}</div>`:mode==="table"?typeof _b2LineupTable=="function"?_b2LineupTable(items,accentCol,"","",hideTableHead):"":`<div class="b2-def-tag-grid" style="display:grid;grid-template-columns:repeat(5,max-content);align-items:center;justify-content:start;column-gap:10px;row-gap:8px;max-width:100%;overflow-x:auto;overflow-y:hidden;padding-bottom:2px;scrollbar-width:thin">${items.map(p=>_b2UnivDefaultTag(p,accentCol,showBadge)).join("")}</div>`}(function(){if(typeof document=="undefined")return;const prev=document.getElementById("b2-lineup-card3-style");prev&&prev.remove();const s=document.createElement("style");s.id="b2-lineup-card3-style",s.textContent=[".b2-lc3{position:relative;border-radius:18px;overflow:hidden;background:linear-gradient(165deg,var(--lc-col,#64748b)1f 0%,var(--lc-col,#64748b)08 34%,rgba(255,255,255,.98) 58%);box-shadow:0 4px 16px rgba(15,23,42,.16);cursor:pointer;transition:transform .18s ease,box-shadow .18s ease;border:1px solid var(--lc-col,#64748b)2e}",".b2-lc3:hover{transform:translateY(-4px) scale(1.035);box-shadow:0 16px 30px rgba(15,23,42,.22);z-index:2}",".b2-lc3-photo{position:relative;width:100%;aspect-ratio:.82;overflow:hidden;background:linear-gradient(160deg,var(--lc-col,#64748b)55 0%,var(--lc-col,#64748b)22 100%)}",".b2-lc3-photo img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center}",".b2-lc3-backdrop{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center;transform:scale(1.2);filter:blur(15px) saturate(1.1) brightness(.82)}",".b2-lc3-fallback{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:40px;font-weight:1000;color:#fff;opacity:.85}",".b2-lc3-overlay{position:absolute;left:0;right:0;bottom:0;z-index:2;padding:28px 12px 10px;text-align:left;background:linear-gradient(180deg,rgba(2,6,23,0) 0%,rgba(2,6,23,.30) 45%,rgba(2,6,23,.76) 100%)}",".b2-lc3-tierchip{display:inline-block;padding:2px 8px;border-radius:999px;font-size:10px;font-weight:900;color:#fff;line-height:1.6;margin-bottom:4px}",".b2-lc3-name{font-size:var(--fs-md);font-weight:950;color:#fff;letter-spacing:-.02em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 1px 4px rgba(0,0,0,.5)}",".b2-lc3-sub{font-size:10px;font-weight:800;color:rgba(255,255,255,.82);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",".b2-lc3-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:9px 10px 10px}",".b2-lc3-box{border-radius:var(--r);padding:7px 4px;background:var(--lc-col,#64748b)14;text-align:center}",".b2-lc3-box-value{font-size:var(--fs-base);font-weight:950;color:#0f172a}",".b2-lc3-box-label{font-size:10px;font-weight:800;color:#475569;margin-top:2px}"].join(""),document.head.appendChild(s)})();function _b2LineupCard3(p,col){const safeName=(p.name||"").replace(/'/g,"\\'"),raceLetter=p.race&&p.race!=="N"?p.race:"?",photo=p.photo?toScaledUrl(p.photo,300):"",photoOrig=p.photo?toHttpsUrl(p.photo):"",win=Number(p.win||0),loss=Number(p.loss||0),games=win+loss,wr=games?Math.round(win/games*100):null,wrCol=wr==null?"#0f172a":wr>=50?"#16a34a":"#dc2626",eloDefault=typeof ELO_DEFAULT!="undefined"?ELO_DEFAULT:1200,elo=Number(p.elo||eloDefault),eloCol=elo>=eloDefault?"#2563eb":"#dc2626",points=Number(p.points||0),tierCol=p.tier&&typeof getTierBtnColor=="function"?getTierBtnColor(p.tier):col,tierTxt=p.tier&&typeof getTierBtnTextColor=="function"&&getTierBtnTextColor(p.tier)||"#fff";let dateLine="";try{const sorted=[...typeof _tpHistAllForPlayer=="function"?_tpHistAllForPlayer(p):[]].sort((a,b)=>typeof _tpDateNum=="function"?_tpDateNum(b==null?void 0:b.date)-_tpDateNum(a==null?void 0:a.date):0);sorted[0]&&sorted[0].date&&(dateLine=`\uCD5C\uADFC \uAE30\uB85D \xB7 ${sorted[0].date}`)}catch(e){}const boxes=[[games?`${win}\uC2B9 ${loss}\uD328`:"\uAE30\uB85D \uC5C6\uC74C","\uC804\uC801","#0f172a"],[wr==null?"-":`${wr}%`,"\uC2B9\uB960",wrCol],[pS(points),"\uD3EC\uC778\uD2B8","#0f172a"],[elo,"ELO",eloCol]];return`<div class="b2-lc3" style="--lc-col:${col}" onclick="openPlayerModal('${safeName}')">
    <div class="b2-lc3-photo">
      ${photo?`<img class="b2-lc3-backdrop" src="${photo}" data-orig="${photoOrig}" crossorigin="anonymous" loading="lazy" decoding="async" aria-hidden="true" onerror="if(this.dataset.orig&&this.src!==this.dataset.orig){this.removeAttribute('crossorigin');this.src=this.dataset.orig;}else{this.style.display='none'}">
           <img src="${photo}" data-orig="${photoOrig}" crossorigin="anonymous" loading="lazy" decoding="async" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center;z-index:1" onerror="if(this.dataset.orig&&this.src!==this.dataset.orig){this.removeAttribute('crossorigin');this.src=this.dataset.orig;}else{this.style.display='none';this.previousElementSibling.style.display='none';this.nextElementSibling.style.display='flex'}">
           <div class="b2-lc3-fallback" style="display:none;z-index:1">${raceLetter}</div>`:`<div class="b2-lc3-fallback">${raceLetter}</div>`}
      <div class="b2-lc3-overlay">
        ${p.tier?`<div><span class="b2-lc3-tierchip" style="background:${tierCol};color:${tierTxt}">${p.tier}</span></div>`:""}
        <div class="b2-lc3-name">${p.name||""}</div>
        ${p.role||dateLine?`<div class="b2-lc3-sub">${p.role||""}${p.role&&dateLine?" \xB7 ":""}${dateLine}</div>`:""}
      </div>
    </div>
    <div class="b2-lc3-grid">
      ${boxes.map(([value,label,vcol])=>`<div class="b2-lc3-box"><div class="b2-lc3-box-value" style="color:${vcol}">${value}</div><div class="b2-lc3-box-label">${label}</div></div>`).join("")}
    </div>
  </div>`}(function(){if(typeof document=="undefined")return;const prev=document.getElementById("b2-lineup-card4-style");prev&&prev.remove();const s=document.createElement("style");s.id="b2-lineup-card4-style",s.textContent=[".b2-lc4-wrap{width:100%;overflow-x:auto;border-radius:14px}",".b2-lc4{width:100%;border-collapse:separate;border-spacing:0;font-size:var(--fs-sm);min-width:520px}",".b2-lc4 thead th{position:sticky;top:0;text-align:left;padding:9px 12px;font-size:10px;font-weight:900;color:#64748b;text-transform:uppercase;letter-spacing:.05em;background:transparent!important;background-image:none!important;border-bottom:1px solid rgba(0,0,0,.08);white-space:nowrap}",".b2-lc4 thead th:first-child{border-radius:14px 0 0 0}",".b2-lc4 thead th:last-child{border-radius:0 14px 0 0;text-align:right}",".b2-lc4 tbody td{padding:7px 12px;border-bottom:1px solid rgba(0,0,0,.06);vertical-align:middle;background:transparent!important}",".b2-lc4 tbody tr:last-child td{border-bottom:none}",".b2-lc4 tbody tr:hover td{background:var(--lc-col,#64748b)16!important}",".b2-lc4 tbody tr{cursor:pointer;position:relative;transition:transform .18s cubic-bezier(.2,.8,.2,1),box-shadow .18s ease;transform-origin:center center}",".b2-lc4 tbody tr:hover{transform:scale(1.025);box-shadow:0 10px 22px rgba(15,23,42,.18);z-index:30}",".b2-lc4 tbody tr:hover td{background:var(--white,#fff)!important}",".b2-lc4-head{display:flex;align-items:center;gap:8px;padding:9px 12px}",".b2-lc4-head img{width:24px;height:24px;object-fit:contain;border-radius:6px;flex-shrink:0}",".b2-lc4-head span{font-size:var(--fs-sm);font-weight:900;color:#0f172a}",".b2-lc4-namecell{display:flex;align-items:center;gap:9px;min-width:120px}",".b2-lc4-avatar{position:relative;width:28px;height:28px;flex-shrink:0;border-radius:50%;overflow:hidden;border:1.5px solid var(--lc-col,#64748b)55;background:linear-gradient(160deg,var(--lc-col,#64748b)55,var(--lc-col,#64748b)22)}",".b2-lc4-avatar img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center}",".b2-lc4-fallback{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:var(--fs-caption);font-weight:1000;color:#fff}",".b2-lc4-name{font-weight:900;color:#0f172a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:130px}",".b2-lc4-chip{display:inline-flex;align-items:center;padding:1px 8px;border-radius:999px;font-size:10px;font-weight:900;color:#fff;line-height:1.6;white-space:nowrap}",".b2-lc4-wrcell{display:flex;align-items:center;justify-content:flex-end;gap:7px}",".b2-lc4-bartrack{width:44px;height:5px;border-radius:999px;background:var(--lc-col,#64748b)18;overflow:hidden}",".b2-lc4-barfill{height:100%;border-radius:999px}",".b2-lc4-wr{font-weight:950;width:32px;text-align:right}"].join(""),document.head.appendChild(s)})();function _b2LineupTableRow(p,col){const safeName=(p.name||"").replace(/'/g,"\\'"),raceLetter=p.race&&p.race!=="N"?p.race:"?",photo=p.photo?toThumbUrl(p.photo,28):"",photoOrig=p.photo?toHttpsUrl(p.photo):"",raceCol={T:"#2563eb",P:"#d97706",Z:"#7c3aed"}[p.race]||"#94a3b8",win=Number(p.win||0),loss=Number(p.loss||0),games=win+loss,wr=games?Math.round(win/games*100):null,wrCol=wr==null?"#94a3b8":wr>=50?"#16a34a":"#dc2626",tierCol=p.tier&&typeof getTierBtnColor=="function"?getTierBtnColor(p.tier):col,tierTxt=p.tier&&typeof getTierBtnTextColor=="function"&&getTierBtnTextColor(p.tier)||"#fff";return`<tr onclick="openPlayerModal('${safeName}')">
    <td><div class="b2-lc4-namecell">
      <div class="b2-lc4-avatar">
        ${photo?`<img src="${photo}" data-orig="${photoOrig}" crossorigin="anonymous" loading="lazy" decoding="async" onerror="if(this.dataset.orig&&this.src!==this.dataset.orig){this.removeAttribute('crossorigin');this.src=this.dataset.orig;}else{this.style.display='none';this.nextElementSibling.style.display='flex'}"><div class="b2-lc4-fallback" style="display:none">${raceLetter}</div>`:`<div class="b2-lc4-fallback">${raceLetter}</div>`}
      </div>
      <span class="b2-lc4-name">${p.name||""}</span>
    </div></td>
    <td>${p.role||"\uC77C\uBC18"}</td>
    <td>${p.tier?`<span class="b2-lc4-chip" style="background:${tierCol};color:${tierTxt}">${p.tier}</span>`:"\uBBF8\uC815"}</td>
    <td>${p.race&&p.race!=="N"?`<span class="b2-lc4-chip" style="background:${raceCol}">${p.race}</span>`:"-"}</td>
    <td>${games?`${win}\uC2B9 ${loss}\uD328`:"\uAE30\uB85D \uC5C6\uC74C"}</td>
    <td><div class="b2-lc4-wrcell">
      <span class="b2-lc4-wr" style="color:${wrCol}">${wr==null?"-":wr+"%"}</span>
    </div></td>
  </tr>`}function _b2LineupTable(members,col,iconUrl,univName,hideHead){if(!members.length)return"";const headBar=iconUrl?`<div class="b2-lc4-head"><img src="${toHttpsUrl(iconUrl)}" alt="" onerror="this.style.display='none'"><span>${univName||""}</span></div>`:"";return`<div class="b2-lc4-wrap" style="--lc-col:${col}">
    ${headBar}
    <table class="b2-lc4">
      ${hideHead?"":"<thead><tr><th>\uC774\uB984</th><th>\uC5ED\uD560</th><th>\uD2F0\uC5B4</th><th>\uC885\uC871</th><th>\uC804\uC801</th><th>\uC2B9\uB960</th></tr></thead>"}
      <tbody>${members.map(p=>_b2LineupTableRow(p,col)).join("")}</tbody>
    </table>
  </div>`}function _b2LineupCard(p,col,big,iconUrl){const safeName=(p.name||"").replace(/'/g,"\\'"),raceLetter=p.race&&p.race!=="N"?p.race:"?",photo=p.photo?toScaledUrl(p.photo,340):"",photoOrig=p.photo?toHttpsUrl(p.photo):"",_raceCol={T:"#2563eb",P:"#d97706",Z:"#7c3aed"}[p.race]||"#475569",badgeTxt=big?p.role||"":p.tier||"",_tierBadgeCol=!big&&p.tier&&typeof getTierBtnColor=="function"?getTierBtnColor(p.tier):col,_tierBadgeTxt=!big&&p.tier&&typeof getTierBtnTextColor=="function"&&getTierBtnTextColor(p.tier)||"#fff",_fillBackdrop=photo?`<img src="${photo}" data-orig="${photoOrig}" crossorigin="anonymous" loading="lazy" decoding="async" aria-hidden="true" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center;transform:scale(1.22);filter:blur(16px) saturate(1.15) brightness(.8);opacity:.85" onerror="if(this.dataset.orig&&this.src!==this.dataset.orig){this.removeAttribute('crossorigin');this.src=this.dataset.orig;}else{this.style.display='none'}">
       <div style="position:absolute;inset:0;background:linear-gradient(180deg,${col}33 0%,rgba(0,0,0,.18) 100%)"></div>`:`<div style="position:absolute;inset:0;background:linear-gradient(160deg,${col}44 0%,${col}1a 100%)"></div>`,photoHtml=photo?`<img src="${photo}" data-orig="${photoOrig}" crossorigin="anonymous" loading="lazy" decoding="async" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center" onerror="if(this.dataset.orig&&this.src!==this.dataset.orig){this.removeAttribute('crossorigin');this.src=this.dataset.orig;}else{this.style.display='none';this.nextElementSibling.style.display='flex'}">
       <div style="position:absolute;inset:0;display:none;align-items:center;justify-content:center;flex-direction:column;gap:6px">
         <div style="font-size:56px;font-weight:900;color:${col};opacity:.7">${raceLetter}</div>
       </div>`:`<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:6px">
         <div style="font-size:56px;font-weight:900;color:${col};opacity:.7">${raceLetter}</div>
       </div>`,_raceBadge=p.race&&p.race!=="N"?`<div style="position:absolute;top:10px;right:10px;padding:3px 10px;border-radius:999px;background:${_raceCol};color:#fff;font-size:var(--fs-sm);font-weight:800;box-shadow:0 2px 8px rgba(0,0,0,.32);z-index:2;letter-spacing:.02em">${p.race}</div>`:"",_nameBar=`
    <div style="position:absolute;bottom:0;left:0;right:0;z-index:2;padding:12px 14px 13px">
      ${badgeTxt?`<div style="margin-bottom:4px"><span style="background:${_tierBadgeCol};color:${_tierBadgeTxt};font-weight:900;font-size:var(--fs-base);padding:2px 9px;border-radius:999px;white-space:nowrap;line-height:1.6;letter-spacing:-.01em">${badgeTxt}</span></div>`:""}
      <div style="color:#fff;font-weight:900;font-size:19px;letter-spacing:-.02em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 1px 4px rgba(0,0,0,.5)">${p.name||""}</div>
    </div>`;return`
    <div style="position:relative;cursor:pointer;border-radius:var(--r2);overflow:hidden;background:${_b2PastelBg(col,.1)};box-shadow:0 4px 16px rgba(15,23,42,.18);border:1px solid ${col}33;transition:transform .15s,box-shadow .15s" onclick="openPlayerModal('${safeName}')"
      onmouseenter="this.style.transform='translateY(-3px)';this.style.boxShadow='0 10px 26px rgba(15,23,42,.28)'"
      onmouseleave="this.style.transform='';this.style.boxShadow='0 4px 16px rgba(15,23,42,.18)'">
      <div style="position:relative;width:100%;aspect-ratio:3/4;overflow:hidden">
        ${_fillBackdrop}
        ${photoHtml}
        ${_raceBadge}
        ${_nameBar}
      </div>
    </div>`}function _b2LineupPoster(univName,col,forExport=!1){if(!univName)return'<div style="text-align:center;color:var(--text3);padding:40px">\uB300\uD559\uC744 \uC120\uD0DD\uD574\uC8FC\uC138\uC694</div>';const uCfg=(typeof univCfg!="undefined"?univCfg.find(x=>x.name===univName):null)||{},iconUrl=uCfg.icon||uCfg.img||UNIV_ICONS[univName]||"",members=players.filter(p=>String((p==null?void 0:p.univ)||"").trim()===String(univName||"").trim()&&!p.hidden&&!p.retired&&!p.hideFromBoard);if(!members.length)return`<div style="border-radius:18px;border:2px dashed ${col}55;padding:30px;background:${col}10;text-align:center;color:var(--text3)">\uB4F1\uB85D\uB41C \uC120\uC218\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4</div>`;const roleMembers=members.filter(p=>_B2_ROLE_ORDER.includes(p.role||""));roleMembers.sort((a,b)=>_b2RoleRank(a)-_b2RoleRank(b));const rosterMembers=members.filter(p=>!_B2_ROLE_ORDER.includes(p.role||""));rosterMembers.sort((a,b)=>{const ta=TIERS.indexOf(a.tier||""),tb=TIERS.indexOf(b.tier||""),ra=ta>=0?ta:99,rb=tb>=0?tb:99;return ra!==rb?ra-rb:(a.name||"").localeCompare(b.name||"","ko",{sensitivity:"base"})});const _lcMode=typeof _b2LineupCardMode!="undefined"?_b2LineupCardMode:"default",_cardFn=_lcMode==="stat"?_b2LineupCard3:null,_lcGridCols=_lcMode==="table"?"1fr":`repeat(auto-fill,minmax(${_lcMode==="stat"?190:170}px,1fr))`,_lcGridGap=_lcMode==="table"?0:16,roleCardsHtml=_lcMode==="table"?_b2LineupTable(roleMembers,col,iconUrl,univName):roleMembers.map(p=>_cardFn?_cardFn(p,col):_b2LineupCard(p,col,!0,iconUrl)).join(""),rosterCardsHtml=_lcMode==="table"?_b2LineupTable(rosterMembers,col,roleMembers.length?"":iconUrl,univName):rosterMembers.map(p=>_cardFn?_cardFn(p,col):_b2LineupCard(p,col,!1,iconUrl)).join(""),dateTxt=new Date().toISOString().slice(0,10).replace(/-/g,"."),raceCount={T:0,P:0,Z:0};rosterMembers.forEach(p=>{raceCount.hasOwnProperty(p.race)&&raceCount[p.race]++});const raceStatHtml=[{k:"T",ico:"\u2694\uFE0F",col:"#2563eb"},{k:"P",ico:"\u{1F52E}",col:"#d97706"},{k:"Z",ico:"\u{1F98E}",col:"#7c3aed"}].filter(r=>raceCount[r.k]>0).map(r=>`
    <span style="display:inline-flex;align-items:center;gap:4px;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.22);border-radius:999px;padding:5px 12px 5px 10px;color:#fff;font-size:var(--fs-sm);font-weight:800">
      <span style="font-size:var(--fs-sm)">${r.ico}</span>${r.k} ${raceCount[r.k]}
    </span>`).join("");return`
    <div data-b2lineup="${univName.replace(/"/g,"&quot;")}" style="border-radius:24px;overflow:hidden;background:#0b1220;box-shadow:0 20px 40px rgba(15,23,42,.28)">
      <div style="padding:30px 30px 24px;position:relative;overflow:hidden;background:linear-gradient(135deg,${col} 0%,${col}cc 65%,#0b1220 130%)">
        <div style="position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,.14),transparent 58%);pointer-events:none"></div>
        ${iconUrl?`<img src="${toHttpsUrl(iconUrl)}" aria-hidden="true" style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);max-height:84%;max-width:160px;width:auto;height:auto;opacity:.20;object-fit:contain;pointer-events:none;filter:drop-shadow(0 0 20px ${col})" onerror="this.style.display='none'">`:""}
        <div style="position:relative;z-index:1;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap">
          <div style="display:flex;align-items:center;gap:14px;min-width:0">
            ${iconUrl?`<img src="${toHttpsUrl(iconUrl)}" style="width:62px;height:62px;object-fit:contain;border-radius:var(--r2);background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.26);padding:7px;flex-shrink:0;box-shadow:0 4px 14px rgba(0,0,0,.22)" onerror="this.style.display='none'">`:""}
            <div style="min-width:0">
              <div style="color:rgba(255,255,255,.64);font-size:var(--fs-sm);font-weight:800;letter-spacing:.10em;text-transform:uppercase">SDC MEMBER LINEUP</div>
              <div style="color:#fff;font-weight:950;font-size:32px;letter-spacing:-.03em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 2px 8px rgba(0,0,0,.18)">${univName}</div>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:8px;flex-shrink:0">
            <span style="background:rgba(255,255,255,.16);color:#fff;font-size:var(--fs-base);font-weight:800;padding:7px 16px;border-radius:999px;border:1px solid rgba(255,255,255,.24);backdrop-filter:blur(8px)">\uCD1D ${members.length}\uBA85</span>
            <span style="color:rgba(255,255,255,.55);font-size:var(--fs-sm);font-weight:700">${dateTxt}</span>
          </div>
        </div>
        ${raceStatHtml?`<div style="position:relative;z-index:1;display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:16px">${raceStatHtml}</div>`:""}
      </div>
      <div style="position:relative;overflow:hidden;background:linear-gradient(180deg,${_b2PastelBg(col,.26)} 0%,${_b2PastelBg(col,.18)} 100%);padding:26px 28px 32px">
        ${iconUrl?`<img src="${toHttpsUrl(iconUrl)}" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:58%;max-width:560px;opacity:.16;object-fit:contain;pointer-events:none;z-index:0" onerror="this.style.display='none'">`:""}
        <div style="position:relative;z-index:1">
          ${roleCardsHtml?`
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
            <div style="width:3px;height:14px;border-radius:999px;background:${col};flex-shrink:0"></div>
            <div style="font-size:var(--fs-caption);font-weight:900;color:${col};letter-spacing:.06em;text-transform:uppercase">\uC9C1\uAE09\uC790</div>
          </div>
          <div style="display:grid;grid-template-columns:${_lcGridCols};gap:${_lcGridGap}px;margin-bottom:24px">${roleCardsHtml}</div>
          ${_lcMode==="table"?"":`<div style="height:1px;background:linear-gradient(90deg,${col}44,transparent);margin-bottom:20px"></div>`}
          `:""}
          <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px;flex-wrap:wrap">
            <div style="display:flex;align-items:center;gap:8px">
              <div style="width:3px;height:14px;border-radius:999px;background:${col}99;flex-shrink:0"></div>
              <div style="font-size:var(--fs-caption);font-weight:900;color:${col};letter-spacing:.06em;text-transform:uppercase">\uBA64\uBC84</div>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:${_lcGridCols};gap:${_lcGridGap}px">${rosterCardsHtml}</div>
        </div>
      </div>
    </div>`}function _b2LineupView(){const univList=_b2VisUnivs().filter(u=>u.name!=="\uBB34\uC18C\uC18D");if(!univList.length)return'<div style="text-align:center;color:var(--text3);padding:40px">\uB4F1\uB85D\uB41C \uB300\uD559\uC774 \uC5C6\uC2B5\uB2C8\uB2E4</div>';(!_b2LineupUniv||!univList.some(u=>u.name===_b2LineupUniv))&&(_b2LineupUniv=univList[0].name);const col=gc(_b2LineupUniv);return`<div style="max-width:1360px;margin:0 auto">${_b2LineupPoster(_b2LineupUniv,col,!1)}</div>`}async function _b2CaptureBoardHtml({btnSelector,cardWidth,pad,innerHtml,heightPad,filename,errorLabel}){const btn=document.querySelector(btnSelector);btn&&(btn.disabled=!0,btn.textContent="\u23F3...");const tmpDiv=document.createElement("div");tmpDiv.style.cssText=`position:fixed;left:-9999px;top:0;padding:${pad}px;background:#f0f2f5;box-sizing:border-box;width:${cardWidth+pad*2}px`,tmpDiv.innerHTML=innerHtml,document.body.appendChild(tmpDiv),tmpDiv.querySelectorAll(".no-export,.no-export-movebtns").forEach(el=>el.remove()),await new Promise(r=>setTimeout(r,100)),injectUnivIcons(tmpDiv);const h=tmpDiv.scrollHeight+heightPad,w=tmpDiv.scrollWidth;try{if(typeof _captureAndSave!="function")throw new Error("\uC774\uBBF8\uC9C0 \uC800\uC7A5 \uAE30\uB2A5\uC744 \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.");await _captureAndSave(tmpDiv,w,h,filename)}catch(e){console.error(`[${errorLabel} \uC774\uBBF8\uC9C0 \uC800\uC7A5 \uC2E4\uD328]`,e),alert(`\u274C \uC774\uBBF8\uC9C0 \uC800\uC7A5 \uC2E4\uD328

`+(e.message||"\uC54C \uC218 \uC5C6\uB294 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4."))}finally{document.body.removeChild(tmpDiv),btn&&(btn.disabled=!1,btn.textContent="\u{1F4F7} \uC774\uBBF8\uC9C0\uC800\uC7A5")}}async function saveB2LineupImg(){const univList=_b2VisUnivs().filter(u=>u.name!=="\uBB34\uC18C\uC18D");if((!_b2LineupUniv||!univList.some(u=>u.name===_b2LineupUniv))&&(_b2LineupUniv=univList[0]?univList[0].name:""),!_b2LineupUniv){alert("\uC800\uC7A5\uD560 \uB300\uD559\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.");return}const col=gc(_b2LineupUniv);await _b2CaptureBoardHtml({btnSelector:'[onclick="saveB2LineupImg()"]',cardWidth:1360,pad:0,innerHtml:_b2LineupPoster(_b2LineupUniv,col,!0),heightPad:8,filename:`\uB300\uD559\uB77C\uC778\uC5C5_${_b2LineupUniv}_`+new Date().toISOString().slice(0,10)+".png",errorLabel:"\uB77C\uC778\uC5C5"})}async function saveB2FreeImg(){await _b2CaptureBoardHtml({btnSelector:'[onclick="saveB2FreeImg()"]',cardWidth:720,pad:24,innerHtml:`<style>.b2-bottom-img{max-width:160px;max-height:130px;object-fit:contain;}</style>${_b2FreeView()}`,heightPad:32,filename:"\uBB34\uC18C\uC18D\uD604\uD669\uD310_"+new Date().toISOString().slice(0,10)+".png",errorLabel:"\uBB34\uC18C\uC18D \uD604\uD669\uD310"})}function _b2ContrastColor(hex){try{const c=String(hex||"").replace("#","").trim(),r=parseInt(c.slice(0,2),16),g=parseInt(c.slice(2,4),16),b=parseInt(c.slice(4,6),16);if([r,g,b].some(v=>Number.isNaN(v)))return"#ffffff";const f=v=>(v/=255,v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)),L=.2126*f(r)+.7152*f(g)+.0722*f(b),contrastW=(1+.05)/(L+.05),contrastD=(L+.05)/(.02+.05);return contrastW>=contrastD?"#ffffff":"#0f172a"}catch(e){return"#ffffff"}}localStorage.removeItem("su_b2SelectedPlayer"),(function(){const all=players.filter(p=>p&&!p.hidden&&!p.retired&&!p.hideFromBoard),withPhoto=all.filter(p=>p.photo||window.playerPhotos&&window.playerPhotos[p.name]),pool=withPhoto.length?withPhoto:all;pool.length&&(_b2SelectedPlayer=pool[Math.floor(Math.random()*pool.length)])})();

/* board2-players.js */
function _b2TierLabel(t){const s=String(t||"").trim();return s?s.endsWith("\uD2F0\uC5B4")?s:s+"\uD2F0\uC5B4":"?\uD2F0\uC5B4"}function _b2PlayersView(){var _a;const dissolvedUnivs=typeof univCfg!="undefined"?new Set((univCfg.filter(u=>u.dissolved)||[]).map(u=>u.name)):new Set,visPlayers=players.filter(p=>!p.hidden&&!p.retired&&!p.hideFromBoard&&!dissolvedUnivs.has(p.univ)),univFilteredPlayers=_b2PlayersUnivFilter==="\uC804\uCCB4"?visPlayers:visPlayers.filter(p=>String((p==null?void 0:p.univ)||"").trim()===String(_b2PlayersUnivFilter||"").trim()),filteredPlayers=_b2PlayersFilter==="all"?univFilteredPlayers:univFilteredPlayers.filter(p=>p.race===_b2PlayersFilter);let tierFilteredPlayers=_b2PlayersTierFilter==="\uC804\uCCB4"?filteredPlayers.filter(p=>p.tier&&p.tier!=="?"&&p.tier!=="\uBBF8\uC815"&&p.tier!=="\uBBF8\uD655\uC778"):filteredPlayers.filter(p=>p.tier===_b2PlayersTierFilter);const{fromN:_b2pFromN,toN:_b2pToN}=_b2ThisWeekRange(),_b2pDateNum=_b2DateNum,_b2pWeekStats=p=>{let w=0,l=0;return(Array.isArray(p.history)?p.history:[]).forEach(h2=>{const d=_b2pDateNum(h2.date||h2.d||"");d>=_b2pFromN&&d<=_b2pToN&&(h2.result==="\uC2B9"?w++:h2.result==="\uD328"&&l++)}),{w,l,total:w+l}};if(!tierFilteredPlayers.length)return`<div style="text-align:center;padding:60px 20px;color:var(--gray-l)">
      <div style="font-size:48px;margin-bottom:12px">\u{1F464}</div>
      <div style="font-weight:700">\uD45C\uC2DC\uD560 \uC120\uC218\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4</div>
    </div>`;if(!_b2SelectedPlayer||!tierFilteredPlayers.find(p=>p.name===_b2SelectedPlayer.name)){const withPhoto2=tierFilteredPlayers.filter(p=>p.photo||window.playerPhotos&&window.playerPhotos[p.name]),pool2=withPhoto2.length?withPhoto2:tierFilteredPlayers;_b2SelectedPlayer=pool2[Math.floor(Math.random()*pool2.length)]}const univList=[...new Set(visPlayers.map(p=>String((p==null?void 0:p.univ)||"").trim()).filter(u=>u&&u!=="\uBB34\uC18C\uC18D"))];typeof univCfg!="undefined"?univList.sort((a,b)=>{const idxA=univCfg.findIndex(u=>u.name===a),idxB=univCfg.findIndex(u=>u.name===b);return(idxA>=0?idxA:999)-(idxB>=0?idxB:999)}):univList.sort();const _shuffleOn=((_a=localStorage.getItem("su_b2_profile_shuffle"))!=null?_a:"1")==="1";if(_shuffleOn){const _sfKey=[_b2PlayersUnivFilter,_b2PlayersFilter,_b2PlayersTierFilter].join("|");if(window._b2ShuffleKey!==_sfKey||!Array.isArray(window._b2ShuffledNames)){for(let i=tierFilteredPlayers.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1)),t=tierFilteredPlayers[i];tierFilteredPlayers[i]=tierFilteredPlayers[j],tierFilteredPlayers[j]=t}window._b2ShuffleKey=_sfKey,window._b2ShuffledNames=tierFilteredPlayers.map(p=>p.name)}else{const _nameIdx={};window._b2ShuffledNames.forEach((n,i)=>{_nameIdx[n]=i}),tierFilteredPlayers.sort((a,b)=>{var _a2,_b;return((_a2=_nameIdx[a.name])!=null?_a2:9999)-((_b=_nameIdx[b.name])!=null?_b:9999)})}}else{const roleOrder=["\uC774\uC0AC\uC7A5","\uCD1D\uC7A5","\uAD50\uC218","\uCF54\uCE58"],tierOrder=["0","1","2","3","4","5","6","7","8","\uC720\uC2A4"];tierFilteredPlayers.sort((a,b)=>{const aRoleIdx=roleOrder.indexOf(a.role||""),bRoleIdx=roleOrder.indexOf(b.role||""),aHasRole=aRoleIdx>=0,bHasRole=bRoleIdx>=0;if(aHasRole&&!bHasRole)return-1;if(!aHasRole&&bHasRole)return 1;if(aHasRole&&bHasRole&&aRoleIdx!==bRoleIdx)return aRoleIdx-bRoleIdx;const aTier=a.tier||"?",bTier=b.tier||"?",aTierIdx=tierOrder.indexOf(aTier),bTierIdx=tierOrder.indexOf(bTier);if(aTierIdx>=0&&bTierIdx>=0&&aTierIdx!==bTierIdx)return aTierIdx-bTierIdx;const aTierNum=parseInt(aTier)||999,bTierNum=parseInt(bTier)||999;return aTierNum!==bTierNum?aTierNum-bTierNum:(a.name||"").localeCompare(b.name||"","ko",{sensitivity:"base"})})}const hexToRgba=(h2,a)=>{const r=parseInt(h2.slice(1,3),16),g=parseInt(h2.slice(3,5),16),b=parseInt(h2.slice(5,7),16);return`rgba(${r},${g},${b},${a})`},univColor=gc(_b2SelectedPlayer.univ)||"#6366f1",bgAlpha=(b2ProfileBgAlpha||10)/100,theme={glow:hexToRgba(univColor,.3),bg:hexToRgba(univColor,bgAlpha),border:univColor},layoutSettings=JSON.parse(localStorage.getItem("su_b2_layout")||"{}"),autoResize=layoutSettings.autoResize!==!1,autoHeight=layoutSettings.autoHeight!==!1,leftSize=layoutSettings.rightSize||layoutSettings.leftSize||55,pcHeight=layoutSettings.pcHeight||600,mobileHeight=layoutSettings.mobileHeight||320,tabletHeight=layoutSettings.tabletHeight||400,pcMainWide=Math.min(Math.max(leftSize+7,60),76),pcMainMid=Math.min(Math.max(leftSize+5,58),74),pcMainNarrow=Math.min(Math.max(leftSize+3,56),72),tallTabletHeight=tabletHeight+220;let h=`
    <style>
      .b2-players-wrapper {
        display: flex;
        gap: 24px;
        height: calc(100vh - 140px);
        min-height: ${pcHeight}px;
        align-items: stretch;
        padding: 0 0 16px 0;
      }
      .b2-players-main {
        flex: 0 0 ${pcMainNarrow}%;
        position: relative;
        min-width: 0;
      }
      .b2-players-grid-wrapper { min-width: 0; }
      ${autoResize?`
      @media (min-width: 1400px) {
        .b2-players-main {
          flex: 0 0 ${pcMainWide}%;
        }
      }
      @media (min-width: 1200px) and (max-width: 1399px) {
        .b2-players-main {
          flex: 0 0 ${pcMainMid}%;
        }
      }
      @media (min-width: 1025px) and (max-width: 1199px) {
        .b2-players-main {
          flex: 0 0 ${pcMainNarrow}%;
        }
      }
      `:""}
      .b2-players-main-content {
        width: 100%;
        height: 100%;
        background: ${theme.bg};
        backdrop-filter: blur(25px);
        border: 1px solid rgba(255,255,255,0.2);
        border-radius: 24px;
        overflow: hidden;
        box-shadow: 0 20px 50px rgba(0,0,0,0.3);
        transition: all 0.5s ease;
        padding: 0;
        box-sizing: border-box;
      }
      .b2-players-main-image {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        min-width: 100%;
        min-height: 100%;
        object-fit: contain;
        object-position: center;
        transition: opacity 0.35s ease, transform 0.25s ease, filter 0.25s ease;
        will-change: transform, filter, opacity;
      }
      /* \uBAA8\uBC14\uC77C/\uD0DC\uBE14\uB9BF\uC5D0\uC11C\uB3C4 \uC0AC\uC6A9\uC790\uAC00 \uC9C0\uC815\uD55C \uC774\uBBF8\uC9C0\uBCC4 \uC124\uC815(\uCC44\uC6B0\uAE30/\uB9DE\uCDA4/\uD655\uB300/\uC774\uB3D9/\uBC1D\uAE30)\uC744 \uADF8\uB300\uB85C \uC0AC\uC6A9 */
      .b2-players-img-controls {
        position: absolute;
        top: 16px;
        left: 16px;
        background: rgba(0,0,0,0.75);
        backdrop-filter: blur(10px);
        border-radius:var(--r2);
        padding: 12px;
        z-index: 10;
        width: min(320px, calc(100% - 32px));
        max-height: calc(100% - 120px);
        overflow-y: auto;
        scrollbar-width: thin;
      }
      .b2-players-controls-title {
        font-size: 13px;
        font-weight: 800;
        color: #fff;
        margin-bottom: 10px;
      }
      .b2-players-slot-card {
        padding: 10px;
        border-radius: 12px;
        background: rgba(255,255,255,0.08);
        border: 1px solid rgba(255,255,255,0.12);
        margin-bottom: 10px;
      }
      .b2-players-slot-card.is-disabled {
        opacity: 0.55;
      }
      .b2-players-slot-title {
        font-size: 12px;
        font-weight: 800;
        color: #fff;
        margin-bottom: 8px;
      }
      .b2-players-slot-title span {
        font-size: 10px;
        color: rgba(255,255,255,0.65);
      }
      .b2-players-img-controls::-webkit-scrollbar {
        width: 4px;
      }
      .b2-players-img-controls::-webkit-scrollbar-thumb {
        background: rgba(255,255,255,0.3);
        border-radius: 4px;
      }
      .b2-players-img-control-group {
        margin-bottom: 10px;
        padding-bottom: 10px;
        border-bottom: 1px solid rgba(255,255,255,0.2);
      }
      .b2-players-img-control-group:last-child {
        margin-bottom: 0;
        padding-bottom: 0;
        border-bottom: none;
      }
      .b2-players-img-label {
        font-size: 11px;
        font-weight: 700;
        color: #fff;
        margin-bottom: 6px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .b2-players-img-label span {
        font-size: 10px;
        color: rgba(255,255,255,0.7);
      }
      .b2-players-img-slider {
        width: 100%;
        height: 4px;
        -webkit-appearance: none;
        appearance: none;
        background: rgba(255,255,255,0.3);
        border-radius: 2px;
        outline: none;
        margin-bottom: 8px;
      }
      .b2-players-img-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 14px;
        height: 14px;
        background: #3b82f6;
        border-radius: 50%;
        cursor: pointer;
      }
      .b2-players-img-btns {
        display: flex;
        gap: 4px;
        flex-wrap: wrap;
      }
      .b2-players-img-btn {
        padding: 4px 8px;
        border-radius: 6px;
        border: none;
        background: rgba(255,255,255,0.2);
        color: #fff;
        font-size: 11px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        flex: 1;
        min-width: 45px;
      }
      .b2-players-img-btn:hover {
        background: rgba(255,255,255,0.3);
      }
      .b2-players-img-btn.active {
        background: #3b82f6;
      }
      .b2-players-img-btn-sm {
        padding: 3px 6px;
        font-size: 10px;
        min-width: 30px;
      }
      .b2-players-info {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 24px;
        z-index: 12;
      }
      .b2-players-info .b2-players-name,
      .b2-players-info .b2-players-race {
        text-shadow: 0 2px 10px rgba(0,0,0,.7), 0 1px 3px rgba(0,0,0,.9);
      }
      .b2-players-name {
        font-size: 36px;
        font-weight: 800;
        margin-bottom: 8px;
        color: #fff;
      }
      .b2-players-details {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: center;
        margin-bottom: 12px;
      }
      .b2-players-tier {
        background: ${theme.border};
        color: #fff;
        padding: 4px 12px;
        border-radius: 12px;
        font-weight: 700;
        font-size: 13px;
      }
      .b2-players-race {
        font-size: 14px;
        font-weight: 900;
      }
      .b2-players-chip {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 8px 14px;
        border-radius: 999px;
        background: rgba(0,0,0,0.4);
        border: 1.5px solid rgba(255,255,255,0.35);
        color: #fff;
        font-size: 13px;
        font-weight: 900;
      }
      .b2-players-chip img {
        width: 26px;
        height: 26px;
        object-fit: contain;
      }
      .b2-players-grid-wrapper {
        flex: 1;
        background: linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04));
        backdrop-filter: blur(15px);
        border: 1px solid rgba(255,255,255,0.12);
        border-radius: 26px;
        padding: 22px;
        overflow-y: auto;
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.05);
      }
      .b2-players-grid-wrapper::-webkit-scrollbar {
        width: 6px;
      }
      .b2-players-grid-wrapper::-webkit-scrollbar-thumb {
        background: rgba(255,255,255,0.2);
        border-radius:var(--r);
      }
      .b2-players-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
        gap: 13px;
      }
      @media (min-width: 769px) and (max-width: 1024px) {
        .b2-players-wrapper {
          flex-direction: column;
          gap: 16px;
          height: auto;
          min-height: auto;
        }
        .b2-players-main {
          flex: none;
          width: 100%;
          min-height: ${tallTabletHeight}px;
          height: ${autoHeight?`clamp(${tallTabletHeight}px, 78vh, ${pcHeight+220}px)`:`${tallTabletHeight}px`};
        }
        .b2-players-grid-wrapper {
          flex: none;
          min-height: 0;
          max-height: none;
        }
      }
      @media (max-width: 768px) {
        .b2-players-main {
          min-height: ${mobileHeight}px;
          height: ${autoHeight?`clamp(${mobileHeight}px, 52vh, ${mobileHeight+160}px)`:`${mobileHeight}px`};
        }
      }
      .b2-players-card {
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
        position: relative;
      }
      .b2-players-card:hover {
        transform: translateY(-8px);
      }
      .b2-players-card.active {
        transform: translateY(-4px);
      }
      @media (max-width: 768px) {
        .b2-players-wrapper {
          flex-direction: column;
          height: auto;
          min-height: auto;
          gap: 14px;
        }
        .b2-players-main {
          flex: none;
          width: 100%;
          min-height: ${mobileHeight}px;
          height: clamp(${mobileHeight}px, 52vh, ${mobileHeight+160}px);
          order: 0;
          position: sticky;
          top: 0;
          z-index: 4;
        }
        .b2-players-main-content {
          height: 100%;
          border-radius: 18px;
        }
        .b2-players-img-controls {
          width: calc(100% - 20px);
          padding: 8px;
          top: 10px;
          left: 10px;
          max-height: 48%;
        }
        .b2-players-img-label {
          font-size: 10px;
        }
        .b2-players-img-btn {
          padding: 3px 6px;
          font-size: 10px;
          min-width: 35px;
        }
        .b2-players-grid-wrapper {
          flex: none;
          height: auto;
          max-height: none;
          order: 1;
        }
        .b2-players-grid {
          grid-template-columns: repeat(2, 1fr);
          max-height: none;
          overflow-y: visible;
        }
        .b2-players-name {
          font-size: 24px;
        }
        .b2-players-info {
          padding: 20px;
        }
        .b2-players-thumbnail {
          height: 80px;
          font-size: 28px;
        }
      }
      @media (min-width: 769px) and (max-width: 1024px) {
        .b2-players-main {
          order: 0;
          position: sticky;
          top: 0;
          z-index: 4;
        }
        .b2-players-main-content {
          height: 100%;
          border-radius: 18px;
        }
        .b2-players-img-controls {
          width: calc(100% - 20px);
          padding: 8px;
          top: 10px;
          left: 10px;
          max-height: 48%;
        }
        .b2-players-img-label {
          font-size: 10px;
        }
        .b2-players-img-btn {
          padding: 3px 6px;
          font-size: 10px;
          min-width: 35px;
        }
        .b2-players-grid-wrapper {
          flex: none;
          height: auto;
          order: 1;
          overflow-y: visible;
        }
        .b2-players-grid {
          grid-template-columns: repeat(3, 1fr);
          max-height: none;
          overflow-y: visible;
        }
        .b2-players-name {
          font-size: 24px;
        }
        .b2-players-info {
          padding: 20px;
        }
        .b2-players-thumbnail {
          height: 80px;
          font-size: 28px;
        }
      }
      .b2-players-filter-btn {
        background: rgba(255,255,255,0.1);
        border: 1px solid rgba(255,255,255,0.2);
        color: var(--text3);
        padding: 6px 16px;
        border-radius: 20px;
        cursor: pointer;
        font-size: 13px;
        font-weight: 600;
        transition: all 0.3s ease;
      }
      .b2-players-filter-btn:hover {
        background: rgba(255,255,255,0.2);
        color: var(--text1);
      }
      .b2-players-filter-btn.active {
        background: #3b82f6;
        border-color: #3b82f6;
        color: #fff;
        box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
      }
      @media (max-width: 768px) {
        .b2-players-wrapper {
          flex-direction: column;
          height: auto;
        }
        .b2-players-main {
          flex: none;
          max-height: none;
        }
        .b2-players-grid-wrapper {
          height: auto;
          min-height: 0;
        }
      }
    </style>
  `;h+='<div class="b2-players-wrapper">';const primarySettings=_b2GetImgSettings(_b2SelectedPlayer.name,"primary"),secondarySettings=_b2GetImgSettings(_b2SelectedPlayer.name,"secondary"),imgSettings=primarySettings,safeName=(_b2SelectedPlayer.name||"").replace(/\\/g,"\\\\").replace(/'/g,"\\'"),_hasMediaUrl=v=>!!String(v||"").trim(),hasPrimary=_hasMediaUrl(_b2SelectedPlayer.photo),hasSecondary=_hasMediaUrl(_b2SelectedPlayer.secondProfileFile),_b2PosPct=(useFlag,x,y)=>{try{if(useFlag===!1)return"center center";const xx=Number(x),yy=Number(y);if(!Number.isFinite(xx)||!Number.isFinite(yy))return"center center";const cx=Math.max(0,Math.min(100,xx)),cy=Math.max(0,Math.min(100,yy));return`${cx}% ${cy}%`}catch(e){return"center center"}},_p3pos=_b2PosPct(_b2SelectedPlayer.photo3PosUse,_b2SelectedPlayer.photo3PosX,_b2SelectedPlayer.photo3PosY),_p4pos=_b2PosPct(_b2SelectedPlayer.photo4PosUse,_b2SelectedPlayer.photo4PosX,_b2SelectedPlayer.photo4PosY),_p5pos=_b2PosPct(_b2SelectedPlayer.photo5PosUse,_b2SelectedPlayer.photo5PosX,_b2SelectedPlayer.photo5PosY);try{typeof prewarmImageUrls=="function"&&prewarmImageUrls([_b2SelectedPlayer.photo,_b2SelectedPlayer.secondProfileFile,...tierFilteredPlayers.map(p=>p.photo).filter(Boolean)],24)}catch(e){}const _b2IsVideoUrl=u=>{const s=String(u||"").trim().toLowerCase().split("#")[0].split("?")[0];return s.endsWith(".mp4")||s.endsWith(".webm")||s.endsWith(".ogg")||s.endsWith(".mov")||s.endsWith(".m4v")},_b2MainMediaHTML=(slot,rawUrl,opt)=>{const url=String(rawUrl||"").trim();if(!url)return"";const src=toHttpsUrl(url),isVid=_b2IsVideoUrl(url),z=opt&&opt.z!=null?opt.z:slot,opacity=opt&&opt.opacity!=null?opt.opacity:slot===1?1:0,style=opt&&opt.style?opt.style:"",onLoadJs=opt&&opt.onLoadJs?String(opt.onLoadJs):"",evPart=onLoadJs?` ${onLoadJs?isVid?"onloadedmetadata":"onload":""}="${onLoadJs}"`:"",common=`class="b2-players-main-image" id="b2-main-img-${slot}" style="position:absolute;inset:0;width:100%;height:100%;min-width:100%;min-height:100%;z-index:${z};opacity:${opacity};pointer-events:none;${style}"`;return isVid?`<video ${common} src="${src}" preload="metadata" muted playsinline${evPart}></video>`:`<img ${common} src="${src}" decoding="async" fetchpriority="high"${evPart}>`},_b2NameEsc=_b2SelectedPlayer.name.replace(/'/g,"\\'"),_slot1=_hasMediaUrl(_b2SelectedPlayer.photo)?_b2MainMediaHTML(1,_b2SelectedPlayer.photo,{z:1,opacity:1,onLoadJs:`_b2ScheduleImageSwap('${_b2NameEsc}'); if(typeof _b2ApplyImgSettingsToDom==='function'){ _b2ApplyImgSettingsToDom('${_b2NameEsc}', 'primary'); }`,style:`object-fit:${primarySettings.fit||"cover"};object-position:center center;transform:${_b2GetImgTransform(primarySettings)};filter:brightness(${(primarySettings.brightness||100)/100});transition:opacity 0.4s ease;`}):`<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.05);font-size:64px;font-weight:900;color:rgba(255,255,255,0.2)">${(_b2SelectedPlayer.name||"?")[0]}</div>`,_slot2=_hasMediaUrl(_b2SelectedPlayer.secondProfileFile)?_b2MainMediaHTML(2,_b2SelectedPlayer.secondProfileFile,{z:2,opacity:0,onLoadJs:`if(typeof _b2ApplyImgSettingsToDom==='function'){ _b2ApplyImgSettingsToDom('${_b2NameEsc}', 'secondary'); }`,style:`object-fit:${secondarySettings.fit||"cover"};object-position:center center;transform:${_b2GetImgTransform(secondarySettings)};filter:brightness(${(secondarySettings.brightness||100)/100});transition:opacity 0.4s ease;`}):"",_slot3=_hasMediaUrl(_b2SelectedPlayer.profileFile3)?_b2MainMediaHTML(3,_b2SelectedPlayer.profileFile3,{z:3,opacity:0,style:`object-fit:cover;object-position:${_p3pos};transition:opacity 0.4s ease;`}):"",_slot4=_hasMediaUrl(_b2SelectedPlayer.profileFile4)?_b2MainMediaHTML(4,_b2SelectedPlayer.profileFile4,{z:4,opacity:0,style:`object-fit:cover;object-position:${_p4pos};transition:opacity 0.4s ease;`}):"",_slot5=_hasMediaUrl(_b2SelectedPlayer.profileFile5)?_b2MainMediaHTML(5,_b2SelectedPlayer.profileFile5,{z:5,opacity:0,style:`object-fit:cover;object-position:${_p5pos};transition:opacity 0.4s ease;`}):"",_selUnivIcon=(()=>{const uCfg=univCfg.find(x=>x.name===_b2SelectedPlayer.univ)||{};return uCfg.icon||uCfg.img||UNIV_ICONS[_b2SelectedPlayer.univ]||""})();h+=`
    <div class="b2-players-main">
      <div class="b2-players-main-content" id="b2-players-main-box" style="--img-zoom:${imgSettings.zoom/100};--img-brightness:${imgSettings.brightness/100};--img-pos-x:${imgSettings.posX}px;--img-pos-y:${imgSettings.posY}px;">
        ${_slot1}
        ${_slot2}
        ${_slot3}
        ${_slot4}
        ${_slot5}
        
        <!-- \uC774\uBBF8\uC9C0 \uCEE8\uD2B8\uB864 \uD328\uB110 - \uAD00\uB9AC\uC790(\uB85C\uADF8\uC778)\uB9CC \uB80C\uB354 [BUGFIX-IMG-SETTINGS] -->
        ${isLoggedIn?`<div class="b2-players-img-controls" id="b2-img-controls" style="display:none">
          <div class="b2-players-controls-title">\u{1F3A8} \uC774\uBBF8\uC9C0 \uC124\uC815</div>
          ${_b2BuildImageControlGroup(safeName,"primary","\uC774\uBBF8\uC9C0 1",hasPrimary)}
          ${_b2BuildImageControlGroup(safeName,"secondary","\uC774\uBBF8\uC9C0 2",hasSecondary)}
        </div>`:""}
        
        <!-- \uCEE8\uD2B8\uB864 \uD328\uB110 \uD1A0\uAE00 \uBC84\uD2BC - \uAD00\uB9AC\uC790(\uB85C\uADF8\uC778 \uC0AC\uC6A9\uC790)\uB9CC \uD45C\uC2DC [BUGFIX-IMG-SETTINGS] -->
        ${isLoggedIn?`<button onclick="document.getElementById('b2-img-controls').style.display=document.getElementById('b2-img-controls').style.display==='none'?'block':'none'" style="position:absolute;top:16px;right:16px;z-index:var(--z-fixed);padding:8px 12px;background:rgba(0,0,0,0.75);backdrop-filter:blur(10px);border-radius:8px;color:#fff;font-size:var(--fs-sm);font-weight:700;cursor:pointer;border:1px solid rgba(255,255,255,0.2)">\u2699\uFE0F \uC124\uC815</button>`:""}
        
        <div class="b2-players-info">
          <div class="b2-players-name">${_b2SelectedPlayer.name||"\uC774\uB984 \uC5C6\uC74C"}</div>
          <div class="b2-players-details">
            <span class="b2-players-tier">${_b2TierLabel(_b2SelectedPlayer.tier)}</span>
            ${_b2SelectedPlayer.race==="P"||_b2SelectedPlayer.race==="T"||_b2SelectedPlayer.race==="Z"?`<span class="rbadge r${_b2SelectedPlayer.race}" style="font-size:14px;padding:5px 12px;box-shadow:0 2px 8px rgba(0,0,0,.35)">${_b2SelectedPlayer.race}</span>`:'<span class="b2-players-chip b2-players-race">\uC885\uC871\uBBF8\uC815</span>'}
            ${_b2SelectedPlayer.univ?_selUnivIcon?`<span class="b2-players-chip"><img src="${toHttpsUrl(_selUnivIcon)}" onerror="this.style.display='none'"><span>${_b2SelectedPlayer.univ}</span></span>`:`<span class="b2-players-chip">\u{1F3EB} ${_b2SelectedPlayer.univ}</span>`:'<span class="b2-players-chip">\u{1F3EB} \uBB34\uC18C\uC18D</span>'}
          </div>
          ${isLoggedIn?`<button onclick="openB2ProfileEditModal('${_b2SelectedPlayer.name.replace(/'/g,"\\'")}')" style="margin-top:12px;padding:8px 16px;background:#fff;border:2px solid rgba(255,255,255,0.5);border-radius:20px;color:var(--text1);font-size:var(--fs-base);font-weight:700;cursor:pointer;transition:all 0.3s ease;box-shadow:0 2px 8px rgba(0,0,0,0.2)" onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 12px rgba(0,0,0,0.3)'" onmouseout="this.style.transform='';this.style.boxShadow='0 2px 8px rgba(0,0,0,0.2)'">\u270F\uFE0F \uD504\uB85C\uD544 \uC218\uC815</button>`:""}
        </div>
      </div>
    </div>
  `;const _renderKey=[String(_b2PlayersUnivFilter||""),String(_b2PlayersFilter||""),String(_b2PlayersTierFilter||""),_shuffleOn?"1":"0"].join("|");window._b2PlayersRenderKey!==_renderKey&&(window._b2PlayersRenderKey=_renderKey,window._b2PlayersRenderLimit=240);const _lim0=Math.max(60,parseInt(window._b2PlayersRenderLimit||0,10)||240),_limit=Math.min(tierFilteredPlayers.length,_lim0);let _gridList=tierFilteredPlayers.slice();const _gridShow=_gridList.slice(0,_limit),_remain=Math.max(0,_gridList.length-_gridShow.length);return h+=`
    <div class="b2-players-grid-wrapper">
      <div class="b2-players-grid">
  `,_gridShow.forEach(p=>{const isActive=_b2SelectedPlayer&&_b2SelectedPlayer.name===p.name,encodedPlayerName=encodeURIComponent(String(p.name||"")),playerColor=gc(p.univ)||"#6366f1",playerTheme={bg:hexToRgba(playerColor,.1),border:playerColor},tierCol=typeof getTierBtnColor=="function"&&p.tier?getTierBtnColor(p.tier):"#64748b",tierTc=typeof getTierBtnTextColor=="function"&&p.tier&&getTierBtnTextColor(p.tier)||"#fff",raceTxt=p.race==="P"||p.race==="T"||p.race==="Z"?p.race:"",gridUnivIcon=(()=>{const uCfg=univCfg.find(x=>x.name===p.univ)||{};return uCfg.icon||uCfg.img||UNIV_ICONS[p.univ]||""})();h+=`
      <div class="b2-players-card" data-player-name="${typeof escAttr=="function"?escAttr(p.name||""):String(p.name||"").replace(/"/g,"&quot;")}" data-player-key="${encodedPlayerName}" onclick="_b2UpdateMainDisplay(decodeURIComponent(this.dataset.playerKey||''))" style="position:relative;cursor:pointer;border-radius:18px;overflow:hidden;aspect-ratio:3/4;background:${playerTheme.bg};border:1.5px solid ${tierCol}66;isolation:isolate">
        ${p.photo?`<img src="${toScaledUrl(p.photo,260)}" data-orig="${toHttpsUrl(p.photo)}" loading="lazy" decoding="async" alt="${p.name}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center;z-index:0" onerror="if(this.dataset.orig&&this.src!==this.dataset.orig){this.src=this.dataset.orig;}else{this.style.display='none';this.nextElementSibling.style.display='flex'}">
             <div style="position:absolute;inset:0;display:none;align-items:center;justify-content:center;background:${playerTheme.bg};font-size:44px;font-weight:900;color:${tierCol};z-index:0">${(p.name||"?")[0]}</div>`:`<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:${playerTheme.bg};font-size:44px;font-weight:900;color:${tierCol};z-index:0">${(p.name||"?")[0]}</div>`}
        ${p.tier?`<span style="position:absolute;top:8px;left:8px;z-index:2;font-size:10px;font-weight:900;padding:1px 6px;border-radius:999px;background:${tierCol};color:${tierTc};line-height:1.5;opacity:.8">${p.tier}</span>`:""}
        <div style="position:absolute;bottom:0;left:0;right:0;z-index:1;height:62%;background:linear-gradient(180deg, transparent 0%, rgba(0,0,0,.15) 35%, rgba(0,0,0,.75) 100%);pointer-events:none"></div>
        <div style="position:absolute;bottom:0;left:0;right:0;z-index:2;padding:9px 10px 10px">
          <div style="display:flex;align-items:center;gap:5px;overflow:hidden">
            ${raceTxt?`<span class="rbadge r${raceTxt}" style="flex-shrink:0;font-size:10px;padding:1px 6px;opacity:.8">${raceTxt}</span>`:""}
            <span style="color:rgba(255,255,255,.85);font-size:var(--fs-base);font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:-.01em;text-shadow:0 2px 8px rgba(0,0,0,.75),0 1px 3px rgba(0,0,0,.9)">${p.name||""}</span>
          </div>
          <div style="display:flex;align-items:center;gap:5px;margin-top:3px;flex-wrap:nowrap;overflow:hidden">
            ${gridUnivIcon?`<img src="${toHttpsUrl(gridUnivIcon)}" onerror="this.style.display='none'" style="flex-shrink:0;width:16px;height:16px;object-fit:contain;opacity:.85;filter:drop-shadow(0 1px 3px rgba(0,0,0,.8))">`:""}
            <span style="font-size:10.5px;color:rgba(255,255,255,.75);font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-shadow:0 2px 8px rgba(0,0,0,.85),0 1px 3px rgba(0,0,0,.95)">${p.univ||"\uBB34\uC18C\uC18D"}</span>
          </div>
        </div>
      </div>
    `}),h+=`
      </div>
      ${_remain>0?`<div style="grid-column:1 / -1;display:flex;justify-content:center;padding:10px 0 16px">
        <button class="btn btn-w" onclick="window._b2PlayersRenderLimit=Math.min(${_gridList.length},(parseInt(window._b2PlayersRenderLimit||0,10)||0)+240);document.getElementById('b2-content').innerHTML=_b2PlayersView();setTimeout(()=>{if(_b2SelectedPlayer)_b2UpdateMainDisplay(_b2SelectedPlayer.name)},0)">\u25BC ${_remain}\uBA85 \uB354 \uBCF4\uAE30</button>
      </div>`:""}
    </div>
  `,h+="</div>",h}function _b2UpdateMainDisplay(playerName){const player=players.find(p=>p.name===playerName);if(!player)return;try{typeof prewarmImageUrls=="function"&&prewarmImageUrls([player.photo,player.secondProfileFile],4)}catch(e){}_b2SelectedPlayer=player;const hexToRgba=(h,a)=>{const r=parseInt(h.slice(1,3),16),g=parseInt(h.slice(3,5),16),b=parseInt(h.slice(5,7),16);return`rgba(${r},${g},${b},${a})`},univColor=gc(player.univ)||"#6366f1",bgAlpha=(b2ProfileBgAlpha||10)/100,theme={glow:hexToRgba(univColor,.3),bg:hexToRgba(univColor,bgAlpha),border:univColor},_b2PosPct=(useFlag,x,y)=>{try{if(useFlag===!1)return"center center";const xx=Number(x),yy=Number(y);if(!Number.isFinite(xx)||!Number.isFinite(yy))return"center center";const cx=Math.max(0,Math.min(100,xx)),cy=Math.max(0,Math.min(100,yy));return`${cx}% ${cy}%`}catch(e){return"center center"}},_p3pos=_b2PosPct(player.photo3PosUse,player.photo3PosX,player.photo3PosY),_p4pos=_b2PosPct(player.photo4PosUse,player.photo4PosX,player.photo4PosY),_p5pos=_b2PosPct(player.photo5PosUse,player.photo5PosX,player.photo5PosY),_b2IsVideoUrl=u=>{const s=String(u||"").trim().toLowerCase().split("#")[0].split("?")[0];return s.endsWith(".mp4")||s.endsWith(".webm")||s.endsWith(".ogg")||s.endsWith(".mov")||s.endsWith(".m4v")},_b2MainMediaHTML=(slot,rawUrl,opt)=>{const url=String(rawUrl||"").trim();if(!url)return"";const src=toHttpsUrl(url),isVid=_b2IsVideoUrl(url),z=opt&&opt.z!=null?opt.z:slot,opacity=opt&&opt.opacity!=null?opt.opacity:slot===1?1:0,style=opt&&opt.style?opt.style:"",onLoadJs=opt&&opt.onLoadJs?String(opt.onLoadJs):"",evPart=onLoadJs?` ${onLoadJs?isVid?"onloadedmetadata":"onload":""}="${onLoadJs}"`:"",common=`class="b2-players-main-image" id="b2-main-img-${slot}" style="position:absolute;inset:0;width:100%;height:100%;min-width:100%;min-height:100%;z-index:${z};opacity:${opacity};pointer-events:none;${style}"`;return isVid?`<video ${common} src="${src}" preload="metadata" muted playsinline${evPart}></video>`:`<img ${common} src="${src}" decoding="async" fetchpriority="high"${evPart}>`},_nameEsc=player.name.replace(/'/g,"\\'"),_hasMediaUrl2=v=>!!String(v||"").trim(),_slot1=_hasMediaUrl2(player.photo)?_b2MainMediaHTML(1,player.photo,{z:1,opacity:1,onLoadJs:`_b2ScheduleImageSwap('${_nameEsc}')`,style:"transition:opacity 0.4s ease;"}):`<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.05);font-size:64px;font-weight:900;color:rgba(255,255,255,0.2)">${(player.name||"?")[0]}</div>`,_slot2=_hasMediaUrl2(player.secondProfileFile)?_b2MainMediaHTML(2,player.secondProfileFile,{z:2,opacity:0,style:"object-fit:cover;transition:opacity 0.4s ease;"}):"",_slot3=_hasMediaUrl2(player.profileFile3)?_b2MainMediaHTML(3,player.profileFile3,{z:3,opacity:0,style:`object-fit:cover;object-position:${_p3pos};transition:opacity 0.4s ease;`}):"",_slot4=_hasMediaUrl2(player.profileFile4)?_b2MainMediaHTML(4,player.profileFile4,{z:4,opacity:0,style:`object-fit:cover;object-position:${_p4pos};transition:opacity 0.4s ease;`}):"",_slot5=_hasMediaUrl2(player.profileFile5)?_b2MainMediaHTML(5,player.profileFile5,{z:5,opacity:0,style:`object-fit:cover;object-position:${_p5pos};transition:opacity 0.4s ease;`}):"",_updUnivIcon=(()=>{const uCfg=univCfg.find(x=>x.name===player.univ)||{};return uCfg.icon||uCfg.img||UNIV_ICONS[player.univ]||""})(),mainBox=document.getElementById("b2-players-main-box"),primarySettings=_b2GetImgSettings(player.name,"primary"),secondarySettings=_b2GetImgSettings(player.name,"secondary"),safeName=(player.name||"").replace(/\\/g,"\\\\").replace(/'/g,"\\'"),hasPrimary=_hasMediaUrl2(player.photo),hasSecondary=_hasMediaUrl2(player.secondProfileFile);if(mainBox){_b2ClearSwapTimer(mainBox),mainBox.innerHTML=`
      ${_slot1}
      ${_slot2}
      ${_slot3}
      ${_slot4}
      ${_slot5}
      
      <!-- \uC774\uBBF8\uC9C0 \uCEE8\uD2B8\uB864 \uD328\uB110 (\uBAA8\uB4E0 \uC0AC\uC6A9\uC790 \uC811\uADFC \uAC00\uB2A5) -->
      <!-- \uC774\uBBF8\uC9C0 \uCEE8\uD2B8\uB864 \uD328\uB110 - \uAD00\uB9AC\uC790(\uB85C\uADF8\uC778)\uB9CC \uB80C\uB354 [BUGFIX-IMG-SETTINGS] -->
      ${isLoggedIn?`<div class="b2-players-img-controls" id="b2-img-controls" style="display:none">
        <div class="b2-players-controls-title">\u{1F3A8} \uC774\uBBF8\uC9C0 \uC124\uC815</div>
        ${_b2BuildImageControlGroup(safeName,"primary","\uC774\uBBF8\uC9C0 1",hasPrimary)}
        ${_b2BuildImageControlGroup(safeName,"secondary","\uC774\uBBF8\uC9C0 2",hasSecondary)}
      </div>`:""}
      
      <!-- \uCEE8\uD2B8\uB864 \uD328\uB110 \uD1A0\uAE00 \uBC84\uD2BC - \uAD00\uB9AC\uC790(\uB85C\uADF8\uC778 \uC0AC\uC6A9\uC790)\uB9CC \uD45C\uC2DC [BUGFIX-IMG-SETTINGS] -->
      ${isLoggedIn?`<button onclick="document.getElementById('b2-img-controls').style.display=document.getElementById('b2-img-controls').style.display==='none'?'block':'none'" style="position:absolute;top:16px;right:16px;z-index:var(--z-fixed);padding:8px 12px;background:rgba(0,0,0,0.75);backdrop-filter:blur(10px);border-radius:8px;color:#fff;font-size:var(--fs-sm);font-weight:700;cursor:pointer;border:1px solid rgba(255,255,255,0.2)">\u2699\uFE0F \uC124\uC815</button>`:""}
      
      <div class="b2-players-info">
        <div class="b2-players-name">${player.name||"\uC774\uB984 \uC5C6\uC74C"}</div>
        <div class="b2-players-details">
          <span class="b2-players-tier" style="background:${theme.border}">${_b2TierLabel(player.tier)}</span>
          ${player.race==="P"||player.race==="T"||player.race==="Z"?`<span class="rbadge r${player.race}" style="font-size:14px;padding:5px 12px;box-shadow:0 2px 8px rgba(0,0,0,.35)">${player.race}</span>`:'<span class="b2-players-chip b2-players-race">\uC885\uC871\uBBF8\uC815</span>'}
          ${player.univ?_updUnivIcon?`<span class="b2-players-chip"><img src="${toHttpsUrl(_updUnivIcon)}" onerror="this.style.display='none'"><span>${player.univ}</span></span>`:`<span class="b2-players-chip">\u{1F3EB} ${player.univ}</span>`:'<span class="b2-players-chip">\u{1F3EB} \uBB34\uC18C\uC18D</span>'}
        </div>
        ${isLoggedIn?`<button onclick="openB2ProfileEditModal('${player.name.replace(/'/g,"\\'")}')" style="margin-top:8px;padding:6px 12px;background:#fff;border:1px solid rgba(255,255,255,0.45);border-radius:12px;color:var(--text1);font-size:var(--fs-sm);font-weight:800;cursor:pointer;transition:all 0.15s ease" onmouseover="this.style.transform='translateY(-1px)'" onmouseout="this.style.transform=''">\u270F\uFE0F \uD504\uB85C\uD544 \uC218\uC815</button>`:""}
      </div>
    `,_b2ApplyImgSettingsToElement(document.getElementById("b2-main-img-1"),primarySettings),_b2ApplyImgSettingsToElement(document.getElementById("b2-main-img-2"),secondarySettings);const _slot1El=document.getElementById("b2-main-img-1"),_isSlot1Video=_slot1El&&_slot1El.tagName==="VIDEO";_hasMediaUrl2(player.photo)?_slot1El&&!_isSlot1Video&&_slot1El.complete&&_b2ScheduleImageSwap(player.name):_b2ScheduleImageSwap(player.name)}const _selName=String(playerName||"").trim();document.querySelectorAll(".b2-players-card").forEach(card=>{card.classList.remove("active")})}function openB2ProfileEditModal(playerName){const player=players.find(p=>p.name===playerName);if(!player)return;const _trimMedia=v=>String(v||"").trim(),_media1=_trimMedia(player.photo),_media2=_trimMedia(player.secondProfileFile),_media3=_trimMedia(player.profileFile3),_media4=_trimMedia(player.profileFile4),_media5=_trimMedia(player.profileFile5),_slotOrder=[{slot:1,url:_media1},{slot:2,url:_media2},{slot:3,url:_media3},{slot:4,url:_media4},{slot:5,url:_media5}].filter(item=>!!item.url),_swapDelayKey=(from,to)=>to===1?from===2?"photoDelay21":from===3?"photoDelay31":from===4?"photoDelay41":"photoDelay51":from===1?"photoDelay12":from===2?"photoDelay23":from===3?"photoDelay34":from===4?"photoDelay45":"",_swapDelayVal=key=>{var _a;const n=parseFloat((_a=player==null?void 0:player[key])!=null?_a:1);return isNaN(n)?1:Math.max(.2,Math.min(60,n))},clampDelay=v=>{const n=parseFloat(v);return isNaN(n)?1:Math.max(.2,Math.min(60,n))},_swapDelayInputs=_slotOrder.length<2?'<div style="font-size:var(--fs-caption);color:var(--gray-l);line-height:1.65">\uB4F1\uB85D\uB41C \uC774\uBBF8\uC9C0\uAC00 1\uAC1C\uB77C \uC804\uD658 \uC2DC\uAC04 \uC124\uC815\uC774 \uD544\uC694\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.</div>':`<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px">${_slotOrder.map((item,idx)=>{const next=_slotOrder[(idx+1)%_slotOrder.length],key=_swapDelayKey(item.slot,next.slot);return key?`<div>
          <div style="font-size:var(--fs-caption);font-weight:800;color:var(--text3);margin-bottom:6px">${item.slot} \u2192 ${next.slot}</div>
          <input type="number" data-b2-delay-key="${key}" min="0.2" max="60" step="0.1" value="${_swapDelayVal(key)}" style="width:100%;padding:8px 12px;border:1px solid var(--border2);border-radius:8px;font-size:var(--fs-base)">
        </div>`:""}).join("")}</div>`,modal=document.createElement("div");modal.id="b2-profile-edit-modal",modal.style.cssText="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:var(--z-modal-5)",modal.innerHTML=`
    <div style="background:var(--white);border-radius:var(--r2);padding:24px;max-width:500px;width:90%;max-height:80vh;overflow-y:auto;box-shadow:0 10px 40px rgba(0,0,0,0.3)">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
        <h3 style="margin:0;font-size:var(--fs-lg);font-weight:800;color:var(--text1)">\u270F\uFE0F \uD504\uB85C\uD544 \uC218\uC815</h3>
        <button onclick="document.getElementById('b2-profile-edit-modal').remove()" style="background:none;border:none;font-size:20px;cursor:pointer;color:var(--gray-l)">\u2715</button>
      </div>
      <div style="margin-bottom:16px">
        <label style="font-size:var(--fs-base);font-weight:700;color:var(--text2);display:block;margin-bottom:6px">\uC120\uC218 \uC774\uB984</label>
        <div style="font-size:14px;color:var(--text3);padding:8px 12px;background:var(--surface);border-radius:8px">${player.name}</div>
      </div>
      <div style="margin-bottom:16px">
        <label style="font-size:var(--fs-base);font-weight:700;color:var(--text2);display:block;margin-bottom:6px">\uD504\uB85C\uD544 \uC774\uBBF8\uC9C0 1 (PC/\uAE30\uBCF8) <span style="font-size:10px;font-weight:400;color:var(--gray-l)">(\uC120\uD0DD \uC989\uC2DC \uD45C\uC2DC)</span></label>
        <div style="display:flex;gap:8px;align-items:center">
          <input type="text" id="b2-ed-photo" value="${_media1}" placeholder="https://... \uC774\uBBF8\uC9C0 URL \uC785\uB825" style="flex:1;padding:8px 12px;border:1px solid var(--border2);border-radius:8px;font-size:var(--fs-base)">
          <span id="b2-ed-photo-preview-wrap" style="position:relative;width:40px;height:40px;border-radius:var(--su_profile_radius,50%);overflow:hidden;flex-shrink:0;background:#e2e8f0;border:2px solid var(--border);display:${_media1&&!_media1.startsWith("data:")?"inline-block":"none"}">
            <img id="b2-ed-photo-preview" src="${_media1&&!_media1.startsWith("data:")?toHttpsUrl(_media1):""}" style="width:40px;height:40px;object-fit:cover;display:block" onerror="this.style.display='none'">
          </span>
        </div>
        <div id="b2-ed-photo-warn" style="font-size:10px;color:${_media1&&_media1.startsWith("data:")?"#dc2626":"var(--gray-l)"};margin-top:4px">${_media1&&_media1.startsWith("data:")?"\u274C base64 \uC774\uBBF8\uC9C0 \uC9C1\uC811 \uC785\uB825 \uBD88\uAC00 \u2014 imgur.com \uB4F1\uC5D0 \uC5C5\uB85C\uB4DC \uD6C4 URL \uC0AC\uC6A9":"\uC774\uBBF8\uC9C0 URL\uC744 \uBD99\uC5EC\uB123\uC73C\uBA74 \uD604\uD669\uD310 \uC120\uC218 \uCE74\uB4DC\uC5D0 \uD504\uB85C\uD544 \uC0AC\uC9C4\uC774 \uD45C\uC2DC\uB429\uB2C8\uB2E4."}</div>
      </div>
      <div style="margin-bottom:16px">
        <label style="font-size:var(--fs-base);font-weight:700;color:var(--text2);display:block;margin-bottom:6px">\uD504\uB85C\uD544 \uC774\uBBF8\uC9C0 2 (\uBAA8\uBC14\uC77C/\uAD50\uCCB4\uC6A9) <span style="font-size:10px;font-weight:400;color:var(--gray-l)">(\uC124\uC815\uD55C \uC2DC\uAC04 \uD6C4 \uC790\uB3D9 \uAD50\uCCB4)</span></label>
        <div style="display:flex;gap:8px;align-items:center">
          <input type="text" id="b2-ed-second-profile" value="${_media2}" placeholder="https://... \uC774\uBBF8\uC9C0 URL \uC785\uB825" style="flex:1;padding:8px 12px;border:1px solid var(--border2);border-radius:8px;font-size:var(--fs-base)">
          <span id="b2-ed-photo2-preview-wrap" style="position:relative;width:40px;height:40px;border-radius:12px;overflow:hidden;flex-shrink:0;background:#e2e8f0;border:2px solid var(--border);display:${_media2&&!_media2.startsWith("data:")?"inline-flex":"none"};align-items:center;justify-content:center">
            <img id="b2-ed-photo2-preview" src="${_media2&&!_media2.startsWith("data:")?toHttpsUrl(_media2).replace(/\"/g,"&quot;"):""}" style="width:40px;height:40px;object-fit:cover;display:block" onerror="this.style.display='none'">
            <video id="b2-ed-photo2-preview-vid" src="" muted playsinline loop style="width:40px;height:40px;object-fit:cover;display:none"></video>
          </span>
        </div>
        <div style="font-size:10px;color:var(--gray-l);margin-top:4px">\uC2A4\uD2B8\uB9AC\uBA38 \uC120\uD0DD \uD6C4 \uC124\uC815\uD55C \uC2DC\uAC04 \uB4A4 \uC774 \uC774\uBBF8\uC9C0\uB85C \uC790\uB3D9 \uC804\uD658\uB429\uB2C8\uB2E4.</div>
      </div>
      <div style="margin-bottom:16px">
        <label style="font-size:var(--fs-base);font-weight:700;color:var(--text2);display:block;margin-bottom:6px">\uD504\uB85C\uD544 \uC774\uBBF8\uC9C0 3 (\uC21C\uD658\uC6A9)</label>
        <div style="display:flex;gap:8px;align-items:center">
          <input type="text" id="b2-ed-photo3" value="${_media3}" placeholder="https://... (gif/mp4 \uAC00\uB2A5)" style="flex:1;padding:8px 12px;border:1px solid var(--border2);border-radius:8px;font-size:var(--fs-base)">
          <span id="b2-ed-photo3-preview-wrap" style="position:relative;width:40px;height:40px;border-radius:12px;overflow:hidden;flex-shrink:0;background:#e2e8f0;border:2px solid var(--border);display:${_media3&&!_media3.startsWith("data:")?"inline-flex":"none"};align-items:center;justify-content:center">
            <img id="b2-ed-photo3-preview" src="${_media3&&!_media3.startsWith("data:")?toHttpsUrl(_media3).replace(/\"/g,"&quot;"):""}" style="width:40px;height:40px;object-fit:cover;display:block" onerror="this.style.display='none'">
            <video id="b2-ed-photo3-preview-vid" src="" muted playsinline loop style="width:40px;height:40px;object-fit:cover;display:none"></video>
          </span>
        </div>
      </div>
      <div style="margin-bottom:16px">
        <label style="font-size:var(--fs-base);font-weight:700;color:var(--text2);display:block;margin-bottom:6px">\uD504\uB85C\uD544 \uC774\uBBF8\uC9C0 4 (\uC21C\uD658\uC6A9)</label>
        <div style="display:flex;gap:8px;align-items:center">
          <input type="text" id="b2-ed-photo4" value="${_media4}" placeholder="https://... (gif/mp4 \uAC00\uB2A5)" style="flex:1;padding:8px 12px;border:1px solid var(--border2);border-radius:8px;font-size:var(--fs-base)">
          <span id="b2-ed-photo4-preview-wrap" style="position:relative;width:40px;height:40px;border-radius:12px;overflow:hidden;flex-shrink:0;background:#e2e8f0;border:2px solid var(--border);display:${_media4&&!_media4.startsWith("data:")?"inline-flex":"none"};align-items:center;justify-content:center">
            <img id="b2-ed-photo4-preview" src="${_media4&&!_media4.startsWith("data:")?toHttpsUrl(_media4).replace(/\"/g,"&quot;"):""}" style="width:40px;height:40px;object-fit:cover;display:block" onerror="this.style.display='none'">
            <video id="b2-ed-photo4-preview-vid" src="" muted playsinline loop style="width:40px;height:40px;object-fit:cover;display:none"></video>
          </span>
        </div>
      </div>
      <div style="margin-bottom:16px">
        <label style="font-size:var(--fs-base);font-weight:700;color:var(--text2);display:block;margin-bottom:6px">\uD504\uB85C\uD544 \uC774\uBBF8\uC9C0 5 (\uC21C\uD658\uC6A9)</label>
        <div style="display:flex;gap:8px;align-items:center">
          <input type="text" id="b2-ed-photo5" value="${_media5}" placeholder="https://... (gif/mp4 \uAC00\uB2A5)" style="flex:1;padding:8px 12px;border:1px solid var(--border2);border-radius:8px;font-size:var(--fs-base)">
          <span id="b2-ed-photo5-preview-wrap" style="position:relative;width:40px;height:40px;border-radius:12px;overflow:hidden;flex-shrink:0;background:#e2e8f0;border:2px solid var(--border);display:${_media5&&!_media5.startsWith("data:")?"inline-flex":"none"};align-items:center;justify-content:center">
            <img id="b2-ed-photo5-preview" src="${_media5&&!_media5.startsWith("data:")?toHttpsUrl(_media5).replace(/\"/g,"&quot;"):""}" style="width:40px;height:40px;object-fit:cover;display:block" onerror="this.style.display='none'">
            <video id="b2-ed-photo5-preview-vid" src="" muted playsinline loop style="width:40px;height:40px;object-fit:cover;display:none"></video>
          </span>
        </div>
        <div style="font-size:10px;color:var(--gray-l);margin-top:4px">\uC774\uBBF8\uC9C0\uBCC4 \uD0ED\uC5D0\uC11C 2\u21923\u21924\u21925(\u21921) \uC21C\uC11C\uB85C \uC804\uD658\uB429\uB2C8\uB2E4.</div>
      </div>
      <div style="margin-top:10px;margin-bottom:16px;padding:12px;background:rgba(37,99,235,.06);border:1px solid rgba(37,99,235,.18);border-radius:var(--r)">
        <div style="font-size:var(--fs-base);font-weight:800;color:var(--text2);margin-bottom:10px">\uC804\uD658 \uC2DC\uAC04(\uCD08)</div>
        ${_swapDelayInputs}
        <div style="font-size:10px;color:var(--gray-l);margin-top:10px">\u203B \uC2E4\uC81C \uC874\uC7AC\uD558\uB294 \uC774\uBBF8\uC9C0 \uC21C\uC11C\uB9CC \uC21C\uD658\uD569\uB2C8\uB2E4. mp4\uB294 \uB05D\uAE4C\uC9C0 \uC7AC\uC0DD \uD6C4 \uB2E4\uC74C \uC774\uBBF8\uC9C0\uB85C \uC774\uB3D9\uD569\uB2C8\uB2E4.</div>
      </div>
      <div style="display:flex;gap:8px;margin-top:20px">
        <button onclick="document.getElementById('b2-profile-edit-modal').remove()" style="flex:1;padding:10px 16px;background:var(--surface);border:1px solid var(--border2);border-radius:8px;color:var(--text2);font-size:var(--fs-base);font-weight:600;cursor:pointer">\uCDE8\uC18C</button>
        <button onclick="saveB2Profile('${player.name.replace(/'/g,"\\'")}')" style="flex:1;padding:10px 16px;background:var(--blue);border:1px solid var(--blue);border-radius:8px;color:#fff;font-size:var(--fs-base);font-weight:600;cursor:pointer">\uC800\uC7A5</button>
      </div>
    </div>
  `,document.body.appendChild(modal);const _b2IsVideoUrl=u=>{const s=String(u||"").trim().toLowerCase().split("#")[0].split("?")[0];return s.endsWith(".mp4")||s.endsWith(".webm")||s.endsWith(".ogg")||s.endsWith(".mov")||s.endsWith(".m4v")},_b2SyncSmallPreview=(inputId,wrapId,imgId,vidId)=>{try{const inp=document.getElementById(inputId),wrap=document.getElementById(wrapId),img=document.getElementById(imgId),vid=document.getElementById(vidId);if(!wrap||!img||!vid)return;const v=String((inp==null?void 0:inp.value)||"").trim();if(!v||v.startsWith("data:")){wrap.style.display="none",img.style.display="none",vid.style.display="none",img.removeAttribute("src"),vid.removeAttribute("src");try{vid.pause()}catch(e){}return}const src=toHttpsUrl(v);if(wrap.style.display="inline-flex",_b2IsVideoUrl(src)){img.style.display="none",vid.style.display="block",vid.src=src;try{vid.currentTime=0}catch(e){}try{vid.play&&vid.play()}catch(e){}}else{vid.style.display="none";try{vid.pause()}catch(e){}vid.removeAttribute("src"),img.style.display="block",img.src=src}}catch(e){}},photoInput=document.getElementById("b2-ed-photo");photoInput&&photoInput.addEventListener("input",function(){const v=this.value.trim(),img=document.getElementById("b2-ed-photo-preview"),warn=document.getElementById("b2-ed-photo-warn"),wrap=document.getElementById("b2-ed-photo-preview-wrap");v&&v.startsWith("data:")?(this.style.borderColor="#dc2626",warn&&(warn.style.color="#dc2626",warn.textContent="\u274C base64 \uC774\uBBF8\uC9C0 \uC9C1\uC811 \uC785\uB825 \uBD88\uAC00 \u2014 imgur.com \uB4F1\uC5D0 \uC5C5\uB85C\uB4DC \uD6C4 URL \uC0AC\uC6A9")):(this.style.borderColor="",warn&&(warn.textContent="\uC774\uBBF8\uC9C0 URL\uC744 \uBD99\uC5EC\uB123\uC73C\uBA74 \uD604\uD669\uD310 \uC120\uC218 \uCE74\uB4DC\uC5D0 \uD504\uB85C\uD544 \uC0AC\uC9C4\uC774 \uD45C\uC2DC\uB429\uB2C8\uB2E4.",warn.style.color="var(--gray-l)")),v&&!v.startsWith("data:")?(img.src=toHttpsUrl(v),img.style.display="block",wrap&&(wrap.style.display="inline-block")):wrap&&(wrap.style.display="none")}),["b2-ed-second-profile","b2-ed-photo3","b2-ed-photo4","b2-ed-photo5"].forEach((id,idx)=>{const el=document.getElementById(id);if(!el)return;const map=[["b2-ed-photo2-preview-wrap","b2-ed-photo2-preview","b2-ed-photo2-preview-vid"],["b2-ed-photo3-preview-wrap","b2-ed-photo3-preview","b2-ed-photo3-preview-vid"],["b2-ed-photo4-preview-wrap","b2-ed-photo4-preview","b2-ed-photo4-preview-vid"],["b2-ed-photo5-preview-wrap","b2-ed-photo5-preview","b2-ed-photo5-preview-vid"]][idx]||null;map&&(el.addEventListener("input",()=>_b2SyncSmallPreview(id,map[0],map[1],map[2])),_b2SyncSmallPreview(id,map[0],map[1],map[2]))})}function saveB2Profile(playerName){var _a,_b,_c,_d,_e;const player=players.find(p=>p.name===playerName);if(!player)return;const photoUrl=(((_a=document.getElementById("b2-ed-photo"))==null?void 0:_a.value)||"").trim(),secondProfileUrl=(((_b=document.getElementById("b2-ed-second-profile"))==null?void 0:_b.value)||"").trim(),thirdProfileUrl=(((_c=document.getElementById("b2-ed-photo3"))==null?void 0:_c.value)||"").trim(),fourthProfileUrl=(((_d=document.getElementById("b2-ed-photo4"))==null?void 0:_d.value)||"").trim(),fifthProfileUrl=(((_e=document.getElementById("b2-ed-photo5"))==null?void 0:_e.value)||"").trim(),clampDelay=v=>{const n=parseFloat(v);return isNaN(n)?1:Math.max(.2,Math.min(60,n))};if([photoUrl,secondProfileUrl,thirdProfileUrl,fourthProfileUrl,fifthProfileUrl].some(u=>u&&u.startsWith("data:"))){alert(`\u274C \uD504\uB85C\uD544 \uC0AC\uC9C4\uC5D0 base64 \uC774\uBBF8\uC9C0(data:...)\uB97C \uC9C1\uC811 \uBD99\uC5EC\uB123\uC73C\uBA74 \uB3D9\uAE30\uD654 \uC800\uC7A5\uC774 \uC2E4\uD328\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.

\uC774\uBBF8\uC9C0\uB97C imgur.com, Discord \uB4F1\uC5D0 \uC5C5\uB85C\uB4DC\uD55C \uD6C4 URL\uC744 \uC0AC\uC6A9\uD558\uC138\uC694.`);return}player.photo=photoUrl||void 0,player.secondProfileFile=secondProfileUrl||void 0,player.profileFile3=thirdProfileUrl||void 0,player.profileFile4=fourthProfileUrl||void 0,player.profileFile5=fifthProfileUrl||void 0;try{document.querySelectorAll("#b2-profile-edit-modal [data-b2-delay-key]").forEach(inp=>{const key=String((inp==null?void 0:inp.getAttribute("data-b2-delay-key"))||"").trim();if(!key)return;const v=clampDelay((inp==null?void 0:inp.value)||"1");v===1?delete player[key]:player[key]=v})}catch(e){}save(),document.getElementById("b2-profile-edit-modal").remove();const _b2ContentEl=document.getElementById("b2-content");if(_b2ContentEl&&typeof _b2PlayersView=="function"){_b2ContentEl.innerHTML=_b2PlayersView();try{typeof injectUnivIcons=="function"&&injectUnivIcons(_b2ContentEl)}catch(e){}_b2SelectedPlayer&&_b2SelectedPlayer.name===playerName&&_b2UpdateMainDisplay(playerName)}else render(),_b2SelectedPlayer&&_b2SelectedPlayer.name===playerName&&_b2UpdateMainDisplay(playerName)}window._b2RankingSort=window._b2RankingSort||"tier";

/* board2-analytics.js */
function _b2RankingView(){const _dissSet=new Set((typeof univCfg!="undefined"?univCfg:[]).filter(u=>u.dissolved||u.hidden).map(u=>String(u.name||"").trim())),tieredVis=players.filter(p=>!p.hidden&&!p.retired&&!p.hideFromBoard&&!_dissSet.has(String((p==null?void 0:p.univ)||"").trim())&&!_B2_ROLE_ORDER.includes(p.role||"")),univList=_b2VisUnivs?_b2VisUnivs().filter(u=>u.name&&u.name!=="\uBB34\uC18C\uC18D"):[],TIERS_LOCAL=typeof TIERS!="undefined"?TIERS:[],sortMode=window._b2RankingSort||"tier",tierScore=tier=>{const idx=TIERS_LOCAL.indexOf(tier);return idx<0?0:Math.max(0,(TIERS_LOCAL.length-idx)*10)},{fromN:thisFromN,toN:thisToN}=_b2ThisWeekRange(),dateNum=_b2DateNum,_rkNow=new Date,_rkDay=_rkNow.getDay(),_rkThisMon=new Date(_rkNow);_rkThisMon.setDate(_rkNow.getDate()+(_rkDay===0?-6:1-_rkDay));const prevMon=new Date(_rkThisMon);prevMon.setDate(_rkThisMon.getDate()-7);const prevSun=new Date(_rkThisMon);prevSun.setDate(_rkThisMon.getDate()-1);const _fmtN=d=>parseInt(d.toISOString().slice(0,10).replace(/-/g,"")),prevFromN=_fmtN(prevMon),prevToN=_fmtN(prevSun),univStats=univList.map(u=>{var _a;const members=tieredVis.filter(p=>String((p==null?void 0:p.univ)||"").trim()===u.name);if(!members.length)return null;const score=members.reduce((s,p)=>s+tierScore(p.tier||""),0);let tw=0,tl=0,pw=0,pl=0;const memberNames=new Set(members.map(p=>p.name));members.forEach(p=>{(Array.isArray(p.history)?p.history:[]).forEach(h2=>{const d=dateNum(h2.date||h2.d||"");d>=thisFromN&&d<=thisToN&&(h2.result==="\uC2B9"?tw++:h2.result==="\uD328"&&tl++),d>=prevFromN&&d<=prevToN&&(h2.result==="\uC2B9"?pw++:h2.result==="\uD328"&&pl++)})});try{(typeof indM!="undefined"&&Array.isArray(indM)?indM:[]).forEach(m=>{if(!m||!m.d||!m.wName||!m.lName)return;const d=dateNum(m.d);memberNames.has(m.wName)&&(d>=thisFromN&&d<=thisToN?tw++:d>=prevFromN&&d<=prevToN&&pw++),memberNames.has(m.lName)&&(d>=thisFromN&&d<=thisToN?tl++:d>=prevFromN&&d<=prevToN&&pl++)})}catch(e){}try{(typeof gjM!="undefined"&&Array.isArray(gjM)?gjM:[]).forEach(m=>{if(!m||!m.d||!m.wName||!m.lName||m._proLabel)return;const d=dateNum(m.d);memberNames.has(m.wName)&&(d>=thisFromN&&d<=thisToN?tw++:d>=prevFromN&&d<=prevToN&&pw++),memberNames.has(m.lName)&&(d>=thisFromN&&d<=thisToN?tl++:d>=prevFromN&&d<=prevToN&&pl++)})}catch(e){}const tg=tw+tl,pg=pw+pl,wr=tg>0?Math.round(tw/tg*100):null,pwr=pg>0?Math.round(pw/pg*100):null,topMember=members.slice().sort((a,b)=>{const ia=TIERS_LOCAL.indexOf(a.tier||""),ib=TIERS_LOCAL.indexOf(b.tier||"");return(ia>=0?ia:999)-(ib>=0?ib:999)})[0],topTier=(topMember==null?void 0:topMember.tier)||"\uC5C6\uC74C",topTierCol=typeof getTierBtnColor=="function"?getTierBtnColor(topTier):"#64748b",topTierTc=typeof getTierBtnTextColor=="function"&&getTierBtnTextColor(topTier)||"#fff",races={P:0,T:0,Z:0};members.forEach(p=>{p.race in races&&races[p.race]++});const dominantRace=((_a=Object.entries(races).sort((a,b)=>b[1]-a[1])[0])==null?void 0:_a[0])||"?",raceEmoji={P:"\u{1F52E}",T:"\u2694\uFE0F",Z:"\u{1F98E}","?":"\u2753"}[dominantRace]||"\u2753";return{name:u.name,color:gc(u.name)||"#64748b",count:members.length,score,topTier,topTierCol,topTierTc,races,dominantRace,raceEmoji,tw,tl,tg,wr,pwr}}).filter(Boolean),sorted=[...univStats].sort((a,b)=>{var _a,_b;return sortMode==="tier"?b.score-a.score||b.count-a.count:sortMode==="count"?b.count-a.count||b.score-a.score:sortMode==="wr"?((_a=b.wr)!=null?_a:-1)-((_b=a.wr)!=null?_b:-1)||b.tg-a.tg:sortMode==="games"?b.tg-a.tg||b.tw-a.tw:0}),tierSorted=[...univStats].sort((a,b)=>b.score-a.score||b.count-a.count),prevRankMap={};tierSorted.forEach((u,i)=>{prevRankMap[u.name]=i+1});const maxScore=Math.max(...sorted.map(u=>u.score),1),maxCount=Math.max(...sorted.map(u=>u.count),1),maxGames=Math.max(...sorted.map(u=>u.tg),1),medals=["\u{1F947}","\u{1F948}","\u{1F949}"],sortBtns=[{key:"tier",label:"\u{1F3C5} \uD2F0\uC5B4 \uC810\uC218"},{key:"count",label:"\u{1F465} \uC778\uC6D0\uC218"},{key:"wr",label:"\u{1F4C8} \uC774\uBC88\uC8FC \uC2B9\uB960"},{key:"games",label:"\u2694\uFE0F \uC774\uBC88\uC8FC \uACBD\uAE30\uC218"}];let h=`<style>
    .b2rk2-wrap {}
    .b2rk2-sortbar { display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px }
    .b2rk2-sbtn { padding:6px 14px;border-radius:20px;border:1.5px solid var(--border2);background:var(--surface);font-size:var(--fs-sm);font-weight:700;color:var(--text2);cursor:pointer;transition:all .15s }
    .b2rk2-sbtn.on { background:var(--text1);color:var(--white);border-color:var(--text1) }
    .b2rk2-sbtn:hover:not(.on) { border-color:var(--text2) }
    .b2rk2-row { display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:14px;margin-bottom:6px;border:1.5px solid var(--border2);background:var(--white);cursor:pointer;position:relative;overflow:hidden;transition:border-color .12s,background .12s }
    .b2rk2-row:hover { background:var(--hover) }
    .b2rk2-row.selected { border-color:var(--text1);background:var(--hover);box-shadow:0 0 0 3px rgba(0,0,0,.06) }
    .b2rk2-row:active { transform:scale(.995) }
    .b2rk2-rank { font-size:22px;min-width:36px;text-align:center;font-weight:900 }
    .b2rk2-name { font-size:14px;font-weight:900;min-width:64px }
    .b2rk2-bar-wrap { flex:1;height:12px;border-radius:6px;background:var(--border2);overflow:hidden }
    .b2rk2-bar { height:100%;border-radius:6px;transition:width .7s ease }
    .b2rk2-bar-wrap.wl { display:flex;align-items:stretch;background:#cbd5e1;gap:1px;position:relative }
    .b2rk2-bar-win { height:100%;background:#dc2626;transition:width .7s ease }
    .b2rk2-bar-loss { height:100%;flex:1;background:#cbd5e1 }
    .b2rk2-wl-legend { display:flex;align-items:center;gap:10px;margin-bottom:10px;font-size:10.5px;font-weight:800;color:var(--text3) }
    .b2rk2-wl-legend span { display:inline-flex;align-items:center;gap:4px }
    .b2rk2-wl-legend i { width:9px;height:9px;border-radius:3px;display:inline-block }
    .b2rk2-score { font-size:var(--fs-base);font-weight:900;min-width:52px;text-align:right }
    .b2rk2-badges { display:flex;gap:4px;flex-shrink:0;flex-wrap:wrap;align-items:center }
    .b2rk2-glow { position:absolute;inset:0;opacity:.05;pointer-events:none }
    .b2rk2-delta { font-size:var(--fs-caption);font-weight:800;margin-left:2px }
  </style>`;return h+=`<div style="margin-bottom:14px;padding:12px 16px;background:linear-gradient(135deg,#f97316,#fb923c);border-radius:14px;display:flex;align-items:center;gap:10px">
    <span style="font-size:24px">\u{1F3C6}</span>
    <div>
      <div style="font-size:var(--fs-md);font-weight:900;color:#fff">\uB300\uD559\uBCC4 \uC885\uD569 \uB7AD\uD0B9</div>
      <div style="font-size:var(--fs-caption);color:rgba(255,255,255,.8)">\uC815\uB82C \uAE30\uC900\uC744 \uC120\uD0DD\uD574 \uB2E4\uC591\uD55C \uAD00\uC810\uC73C\uB85C \uBE44\uAD50</div>
    </div>
    <div style="margin-left:auto;text-align:right">
      <div style="font-size:20px;font-weight:900;color:#fff">${sorted.length}</div>
      <div style="font-size:10px;color:rgba(255,255,255,.8)">\uB300\uD559 \uCC38\uAC00</div>
    </div>
  </div>`,h+=`<div class="b2rk2-sortbar">
    ${sortBtns.map(b=>`<button class="b2rk2-sbtn${sortMode===b.key?" on":""}" onclick="window._b2RankingSort='${b.key}';render()">${b.label}</button>`).join("")}
  </div>`,h+='<div class="b2rk2-wl-legend"><span><i style="background:#dc2626"></i>\uC774\uBC88\uC8FC \uC2B9</span><span><i style="background:#cbd5e1"></i>\uC774\uBC88\uC8FC \uD328</span></div>',h+='<div class="b2rk2-wrap">',sorted.forEach((u,i)=>{var _a;const rank=i+1,rankDelta=(prevRankMap[u.name]||rank)-rank,rankDisplay=medals[i]||`<span style="font-size:14px;font-weight:900;color:var(--text3)">${rank}</span>`,isTop3=i<3;let barW=0,scoreLabel="";sortMode==="tier"&&(barW=Math.round(u.score/maxScore*100),scoreLabel=`${u.score}pt`),sortMode==="count"&&(barW=Math.round(u.count/maxCount*100),scoreLabel=`${u.count}\uBA85`),sortMode==="wr"&&(barW=(_a=u.wr)!=null?_a:0,scoreLabel=u.wr!==null?`${u.wr}%`:"-"),sortMode==="games"&&(barW=Math.round(u.tg/Math.max(maxGames,1)*100),scoreLabel=`${u.tg}\uC804`);let deltaHtml="";if(sortMode==="tier"&&rankDelta!==0){const col=rankDelta>0?"#10b981":"#ef4444",arrow=rankDelta>0?"\u25B2":"\u25BC";deltaHtml=`<span class="b2rk2-delta" style="color:${col}">${arrow}${Math.abs(rankDelta)}</span>`}const wrBadge=u.wr!==null?`<span style="font-size:10px;padding:2px 7px;border-radius:8px;background:${u.wr>=60?"#10b981":u.wr>=40?"#f59e0b":"#ef4444"};color:#fff;font-weight:800">\u{1F4C8} ${u.wr}%</span>`:"",pWrDelta=u.wr!==null&&u.pwr!==null?`<span style="font-size:10px;color:${u.wr>=u.pwr?"#10b981":"#ef4444"};font-weight:700">${u.wr>=u.pwr?"\u25B2":"\u25BC"}${Math.abs(u.wr-u.pwr)}%</span>`:"";h+=`<div class="b2rk2-row" style="cursor:pointer;${isTop3?`border-color:${u.color}66;background:${u.color}08`:""}" onclick="(function(el){document.querySelectorAll('.b2rk2-row').forEach(function(r){r.classList.remove('selected')});el.classList.toggle('selected');})(this);if(typeof openUnivModal==='function')openUnivModal('${typeof escJS=="function"?escJS(u.name):String(u.name).replace(/'/g,"\\'")}')">
      <div class="b2rk2-glow" style="background:radial-gradient(ellipse at 0% 50%,${u.color},transparent 60%)"></div>
      <div class="b2rk2-rank">${rankDisplay}${deltaHtml}</div>
      <div class="b2rk2-name" style="color:${u.color}">${typeof window.escHTML=="function"?window.escHTML(u.name):String(u.name||"")}</div>
      ${u.tg===0?'<div class="b2rk2-bar-wrap"></div>':`<div class="b2rk2-bar-wrap wl" title="\uC774\uBC88\uC8FC ${u.tw}\uC2B9 ${u.tl}\uD328 (${u.wr}%)">
        <div class="b2rk2-bar-win" style="width:${u.wr}%"></div>
        <div class="b2rk2-bar-loss"></div>
      </div>`}
      <div class="b2rk2-score" style="color:${u.color}">${scoreLabel}</div>
      <div class="b2rk2-badges">
        <span style="font-size:10px;font-weight:800;padding:2px 8px;border-radius:8px;background:${u.topTierCol};color:${u.topTierTc}">TOP ${u.topTier}</span>
        <span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:8px;background:var(--surface);color:var(--text2)">${u.raceEmoji} ${u.count}\uBA85</span>
        ${u.tg>0?wrBadge:""}
        ${pWrDelta}
      </div>
    </div>`}),h+="</div>",sortMode==="tier"&&(h+=`<div style="margin-top:12px;padding:10px 14px;background:var(--surface);border-radius:var(--r);border:1px solid var(--border2)">
      <div style="font-size:var(--fs-caption);font-weight:700;color:var(--text3);margin-bottom:6px">\u{1F4CC} \uD2F0\uC5B4 \uC810\uC218 \uAE30\uC900</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px">
        ${TIERS_LOCAL.filter(t=>tieredVis.some(p=>p.tier===t)).map(t=>{const col=typeof getTierBtnColor=="function"?getTierBtnColor(t):"#64748b",tc=typeof getTierBtnTextColor=="function"&&getTierBtnTextColor(t)||"#fff";return`<span style="font-size:10px;font-weight:800;padding:2px 8px;border-radius:8px;background:${col};color:${tc}">${t} = ${tierScore(t)}pt</span>`}).join("")}
      </div>
    </div>`),h}function _b2RadarView(){const _dissSet=new Set((typeof univCfg!="undefined"?univCfg:[]).filter(u=>u.dissolved||u.hidden).map(u=>String(u.name||"").trim())),tieredVis=players.filter(p=>!p.hidden&&!p.retired&&!p.hideFromBoard&&!_dissSet.has(String((p==null?void 0:p.univ)||"").trim())&&!_B2_ROLE_ORDER.includes(p.role||"")),univList=_b2VisUnivs?_b2VisUnivs().filter(u=>u.name&&u.name!=="\uBB34\uC18C\uC18D"):[],TIERS_LOCAL=typeof TIERS!="undefined"?TIERS:[];try{const sig=(function(){try{return[miniM,univM,ckM,proM,ttM,comps,tourneys,proTourneys,indM,gjM].map(a=>Array.isArray(a)?a.length:0).join("|")}catch(e){return""}})();typeof window.__b2_radar_hist_sig=="undefined"&&(window.__b2_radar_hist_sig=""),window.__b2_radar_hist_sig!==sig&&typeof _rebuildAllPlayerHistoryCore=="function"&&(_rebuildAllPlayerHistoryCore(),window.__b2_radar_hist_sig=sig)}catch(e){}const tierScore=t=>{const i=TIERS_LOCAL.indexOf(t);return i<0?0:Math.max(0,(TIERS_LOCAL.length-i)*10)},_hist=p=>Array.isArray(p&&p.history)?p.history:[],_modeKey=m=>m?(m=String(m).trim(),m==="\uBBF8\uB2C8"||m==="\uCE5C\uC120"||m==="\uBBF8\uB2C8\uB300\uC804"||m.includes("\uBBF8\uB2C8")?"mini":m==="\uB300\uD559\uB300\uC804"||m==="\uB300\uD559"||m.includes("\uB300\uD559\uB300\uC804")?"univm":m==="CK"||m.includes("CK")?"ck":m==="\uD2F0\uC5B4\uB300\uD68C"||m.includes("\uD2F0\uC5B4")?"tt":m==="\uB300\uD68C"||m==="\uC77C\uBC18\uB300\uD68C"||m==="\uC870\uBCC4\uB9AC\uADF8"||m==="\uD1A0\uB108\uBA3C\uD2B8"||m==="\uC870\uBCC4\uB300\uD68C"||m.includes("\uC77C\uBC18\uB300\uD68C")||m.includes("\uB300\uD68C")||m.includes("\uC870\uBCC4")||m.includes("\uD1A0\uB108")?"comp":""):"",_radarCacheSig=(function(){try{const lens=[miniM,univM,ckM,proM,ttM,comps,tourneys,proTourneys,indM,gjM].map(a=>Array.isArray(a)?a.length:0).join("|"),pLen=Array.isArray(players)?players.length:0,hLen=(Array.isArray(players)?players:[]).reduce((s,p)=>s+(Array.isArray(p==null?void 0:p.history)?p.history.length:0),0),uLen=typeof univCfg!="undefined"&&Array.isArray(univCfg)?univCfg.length:0,tierHash=(Array.isArray(players)?players:[]).map(p=>p.tier||"").join(",");return`${pLen}|${hLen}|${uLen}|${lens}|${tierHash}`}catch(e){return""}})();window.__b2_radar_stats_cache||(window.__b2_radar_stats_cache={sig:"",univStats:[]});let univStats=window.__b2_radar_stats_cache.sig===_radarCacheSig?window.__b2_radar_stats_cache.univStats||[]:null;Array.isArray(univStats)||(univStats=univList.map(u=>{const members=tieredVis.filter(p=>String((p==null?void 0:p.univ)||"").trim()===u.name);if(!members.length)return null;const total=members.length,avgScore=members.reduce((s,p)=>s+tierScore(p.tier||""),0)/total,part={mini:0,univm:0,ck:0,tt:0,comp:0};let wins=0,losses=0;members.forEach(p=>{const seen={mini:!1,univm:!1,ck:!1,tt:!1,comp:!1};_hist(p).forEach(h=>{const k=_modeKey(h&&h.mode);if(k&&k in part){const r2=String(h&&h.result||"").trim();r2==="\uC2B9"?wins++:r2==="\uD328"&&losses++}k&&k in seen&&(seen[k]=!0)}),Object.keys(seen).forEach(k=>{seen[k]&&part[k]++})});const games=wins+losses,wr=games>0?Math.round(wins/games*100):null;return{name:u.name,color:gc(u.name)||"#64748b",total,avgScore,wins,losses,wr,partMini:part.mini/total,partUnivm:part.univm/total,partCk:part.ck/total,partTt:part.tt/total,partComp:part.comp/total}}).filter(Boolean).sort((a,b)=>b.total-a.total),window.__b2_radar_stats_cache.sig=_radarCacheSig,window.__b2_radar_stats_cache.univStats=univStats);const maxTotal=Math.max(...univStats.map(u=>u.total),1),maxAvg=Math.max(...univStats.map(u=>u.avgScore),1),maxWins=Math.max(...univStats.map(u=>u.wins||0),1),maxLoss=Math.max(...univStats.map(u=>u.losses||0),1),AXES=["\uC778\uC6D0","\uD3C9\uADE0\uD2F0\uC5B4","\uC2B9","\uD328","\uBBF8\uB2C8","\uB300\uD559\uB300\uC804","\uB300\uD559CK","\uD2F0\uC5B4\uB300\uD68C","\uC77C\uBC18\uB300\uD68C"],AXES_DESC=["\uC120\uC218 \uC218","\uD2F0\uC5B4 \uC810\uC218 \uD3C9\uADE0","\uCD1D \uC2B9\uB9AC\uC218","\uCD1D \uD328\uBC30\uC218","\uCC38\uAC00\uC728","\uCC38\uAC00\uC728","\uCC38\uAC00\uC728","\uCC38\uAC00\uC728","\uCC38\uAC00\uC728"],N=AXES.length,getVals=u=>[u.total/maxTotal,u.avgScore/maxAvg,(u.wins||0)/maxWins,(u.losses||0)/maxLoss,u.partMini,u.partUnivm,u.partCk,u.partTt,u.partComp],avgVals=AXES.map((_,i)=>{const vals=univStats.map(u=>getVals(u)[i]);return vals.reduce((s,v)=>s+v,0)/Math.max(vals.length,1)}),getRawVals=u=>[u.total,Math.round(u.avgScore*10)/10,u.wins||0,u.losses||0,Math.round(u.partMini*100)+"%",Math.round(u.partUnivm*100)+"%",Math.round(u.partCk*100)+"%",Math.round(u.partTt*100)+"%",Math.round(u.partComp*100)+"%"],univDataJson=JSON.stringify(univStats.map(u=>({name:u.name,color:u.color,total:u.total,wr:u.wr,wins:u.wins,losses:u.losses,vals:getVals(u),raw:getRawVals(u)}))),axesJson=JSON.stringify(AXES),axesDescJson=JSON.stringify(AXES_DESC),avgJson=JSON.stringify(avgVals),uid="rdr_"+Math.random().toString(36).slice(2,8);return`<style>
    #${uid}-wrap {}
    #${uid}-sel { display:flex; flex-wrap:wrap; gap:6px; margin-bottom:12px; }
    .${uid}-chip { padding:5px 12px; border-radius:20px; border:1.5px solid var(--border2); background:var(--surface); font-size:var(--fs-caption); font-weight:700; color:var(--text2); cursor:pointer; transition:all .12s; }
    .${uid}-chip.on { color:#fff; border-color:transparent; }
    .${uid}-chip:hover:not(.on) { border-color:var(--text2); }
    #${uid}-canvas { display:block; max-width:520px; margin:0 auto; cursor:crosshair; }
    #${uid}-legend { display:flex; flex-wrap:wrap; gap:8px; margin-top:10px; justify-content:center; }
    #${uid}-table { width:100%; border-collapse:collapse; margin-top:14px; font-size:var(--fs-caption); }
    #${uid}-table th { padding:5px 8px; background:var(--bg); border-bottom:2px solid var(--border2); font-size:10px; font-weight:800; color:var(--text3); text-align:center; white-space:nowrap; position:sticky; top:0; z-index:1; }
    #${uid}-table th:first-child { text-align:left; }
    #${uid}-table td { padding:5px 8px; border-bottom:1px solid var(--border2); text-align:center; font-weight:700; }
    #${uid}-table td:first-child { text-align:left; font-weight:900; }
    #${uid}-table tr:hover td { background:var(--hover); }
    #${uid}-table td.hi { background:#fef9c366; font-weight:900; }
    .${uid}-avg-note { font-size:10px; color:var(--text3); display:flex; align-items:center; gap:4px; margin-top:4px; }
    #${uid}-tooltip { position:fixed; pointer-events:none; opacity:0; background:var(--white); border:1px solid var(--border2); border-radius:var(--r); padding:8px 12px; box-shadow:0 4px 20px #0003; font-size:var(--fs-caption); font-weight:700; color:var(--text2); z-index:999; transition:opacity .1s; max-width:180px; }
  </style>
  <div id="${uid}-wrap">
    <div style="margin-bottom:12px;padding:10px 14px;background:linear-gradient(135deg,#a855f7,#9333ea);border-radius:12px;display:flex;align-items:center;gap:8px">
      <span style="font-size:20px">\u{1F578}\uFE0F</span>
      <div>
        <div style="font-size:var(--fs-base);font-weight:900;color:#fff">\uB300\uD559\uBCC4 \uB2E4\uCC28\uC6D0 \uB808\uC774\uB354</div>
        <div style="font-size:var(--fs-caption);color:rgba(255,255,255,.8)">\uCD5C\uB300 3\uAC1C \uC120\uD0DD \xB7 \uC810\uC120 = \uC804\uCCB4 \uD3C9\uADE0 \xB7 \uAC15\uC810 \uCD95 \uC790\uB3D9 \uD558\uC774\uB77C\uC774\uD2B8</div>
      </div>
    </div>
    <div style="margin-bottom:10px;padding:10px 14px;background:var(--surface);border:1px solid var(--border2);border-radius:12px;font-size:var(--fs-caption);color:var(--text3);line-height:1.6">
      <strong style="color:var(--text2)">\uCD95 \uC124\uBA85</strong> \u2014
      \uC2B9/\uD328: \uACF5\uC2DD \uAE30\uB85D \uAE30\uC900 \xB7 \uCC38\uAC00\uC728: \uD574\uB2F9 \uC885\uBAA9 1\uACBD\uAE30 \uC774\uC0C1 \uB6F4 \uBE44\uC728 \xB7 \uC778\uC6D0\xB7\uD3C9\uADE0\uD2F0\uC5B4: \uCD5C\uB300\uAC12 \uAE30\uC900 \uC815\uADDC\uD654
    </div>
    <div id="${uid}-sel"></div>
    <div style="position:relative">
      <canvas id="${uid}-canvas" width="520" height="480"></canvas>
      <div id="${uid}-tooltip"></div>
    </div>
    <div id="${uid}-legend"></div>
    <div style="overflow-x:auto;margin-top:4px">
      <table id="${uid}-table"><thead></thead><tbody></tbody></table>
    </div>
  </div>
  <script>
  (function(){
    const UNIVS    = ${univDataJson};
    const AXES     = ${axesJson};
    const AXES_DESC= ${axesDescJson};
    const AVG_VALS = ${avgJson};
    const N = AXES.length;
    const canvas  = document.getElementById('${uid}-canvas');
    const selEl   = document.getElementById('${uid}-sel');
    const legendEl= document.getElementById('${uid}-legend');
    const tableEl = document.getElementById('${uid}-table');
    const ttipEl  = document.getElementById('${uid}-tooltip');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const _cssVar = k => { try{ return String(getComputedStyle(document.documentElement).getPropertyValue(k)||'').trim(); }catch(e){ return ''; } };
    const TEXT2  = ()=> _cssVar('--text2') || '#475569';
    const TEXT3  = ()=> _cssVar('--text3') || '#64748b';
    const BORDER = ()=> _cssVar('--border2') || '#e2e8f0';
    let selected = [];
    let mousePos = null;

    const W=520,H=480,cx=260,cy=240,R=155;
    // DPR \uCC98\uB9AC: \uACE0\uD574\uC0C1\uB3C4 \uB514\uC2A4\uD50C\uB808\uC774\uC5D0\uC11C \uC120\uBA85\uD558\uAC8C \uB80C\uB354
    const _dpr = Math.min(window.devicePixelRatio || 1, 3);
    canvas.width  = W * _dpr;
    canvas.height = H * _dpr;
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';
    ctx.scale(_dpr, _dpr);
    const angle = i => (Math.PI*2*i/N) - Math.PI/2;
    const radarPt = (val,i) => { const a=angle(i); return {x:cx+Math.cos(a)*R*val, y:cy+Math.sin(a)*R*val}; };

    // \uAC15\uC810 \uCD95 \uACC4\uC0B0 (\uC120\uD0DD\uB41C \uB300\uD559\uC774 \uC804\uCCB4 \uD3C9\uADE0 \uB300\uBE44 \uAC00\uC7A5 \uB192\uC740 \uCD95)
    function getStrengthAxes(u) {
      return u.vals.map((v,i)=>({ i, diff:v-(AVG_VALS[i]||0) })).filter(d=>d.diff>0.12).sort((a,b)=>b.diff-a.diff).slice(0,2).map(d=>d.i);
    }

    // \uCE69 \uBE4C\uB4DC
    UNIVS.forEach(u => {
      const chip = document.createElement('button');
      chip.className = '${uid}-chip';
      chip.textContent = u.name;
      chip.onclick = () => {
        if (selected.includes(u.name)) {
          selected = selected.filter(n=>n!==u.name);
        } else {
          if (selected.length >= 3) selected.shift();
          selected.push(u.name);
        }
        document.querySelectorAll('.${uid}-chip').forEach(c => {
          const un = UNIVS.find(u2=>u2.name===c.textContent);
          const isOn = selected.includes(c.textContent);
          c.classList.toggle('on', isOn);
          c.style.background = isOn && un ? un.color : '';
        });
        draw(); buildTable();
      };
      selEl.appendChild(chip);
    });

    function draw() {
      ctx.clearRect(0,0,W,H);
      const t2=TEXT2(), t3=TEXT3(), bd=BORDER();
      const activeUnivs = UNIVS.filter(u=>selected.includes(u.name));

      // \uBC30\uACBD \uB9C1
      for (let r=1;r<=5;r++) {
        const ratio=r/5;
        ctx.beginPath();
        for (let i=0;i<N;i++) { const {x,y}=radarPt(ratio,i); i===0?ctx.moveTo(x,y):ctx.lineTo(x,y); }
        ctx.closePath();
        ctx.strokeStyle=\`rgba(100,116,139,\${r===5?0.25:0.12})\`;
        ctx.lineWidth=r===5?1.5:1; ctx.stroke();
        if(r===5){ ctx.fillStyle='rgba(100,116,139,0.04)'; ctx.fill(); }
        // \uB9C1 \uC218\uCE58
        ctx.save(); ctx.font='700 9px sans-serif'; ctx.fillStyle=t3; ctx.textAlign='left';
        ctx.fillText((ratio*100).toFixed(0)+'%', cx+4, cy-R*ratio+3);
        ctx.restore();
      }

      // \uC804\uCCB4 \uD3C9\uADE0\uC120 (\uC810\uC120)
      ctx.save();
      ctx.beginPath();
      AVG_VALS.forEach((v,i)=>{ const {x,y}=radarPt(Math.max(0.01,v),i); i===0?ctx.moveTo(x,y):ctx.lineTo(x,y); });
      ctx.closePath();
      ctx.setLineDash([4,4]); ctx.strokeStyle='rgba(148,163,184,0.7)'; ctx.lineWidth=1.5; ctx.stroke();
      ctx.fillStyle='rgba(148,163,184,0.06)'; ctx.fill();
      ctx.setLineDash([]); ctx.restore();

      // \uAC15\uC810 \uCD95 \uD558\uC774\uB77C\uC774\uD2B8 (\uC120\uD0DD\uB41C \uB300\uD559 \uAE30\uC900)
      const strengthSet = new Set();
      activeUnivs.forEach(u=>{ getStrengthAxes(u).forEach(i=>strengthSet.add(i)); });

      // \uCD95 \uB77C\uC778 + \uB808\uC774\uBE14
      for (let i=0;i<N;i++) {
        const {x,y}=radarPt(1,i);
        const isStrength = strengthSet.has(i);
        ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(x,y);
        ctx.strokeStyle = isStrength ? 'rgba(251,191,36,0.7)' : 'rgba(100,116,139,0.2)';
        ctx.lineWidth = isStrength ? 2.5 : 1.2; ctx.stroke();

        const la=angle(i), lx=cx+Math.cos(la)*(R+26), ly=cy+Math.sin(la)*(R+26);
        ctx.textAlign='center'; ctx.textBaseline='middle';
        if (isStrength) {
          ctx.font='900 13px sans-serif'; ctx.fillStyle='#b45309';
        } else {
          ctx.font='800 11px sans-serif'; ctx.fillStyle=t2;
        }
        ctx.fillText(AXES[i], lx, ly-6);
        ctx.font='600 9px sans-serif'; ctx.fillStyle=t3;
        ctx.fillText(AXES_DESC[i]||'', lx, ly+7);
      }

      // \uB370\uC774\uD130 \uD3F4\uB9AC\uACE4
      if (activeUnivs.length===0) {
        ctx.fillStyle=t3; ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.font='900 13px sans-serif'; ctx.fillText('\uB300\uD559\uC744 \uC120\uD0DD\uD558\uC138\uC694', cx, cy-10);
        ctx.font='700 11px sans-serif'; ctx.fillText('\uCD5C\uB300 3\uAC1C\uAE4C\uC9C0 \uB3D9\uC2DC \uBE44\uAD50 \uAC00\uB2A5', cx, cy+12);
        legendEl.innerHTML='';
        return;
      }

      activeUnivs.forEach(u => {
        ctx.beginPath();
        u.vals.forEach((v,i)=>{ const {x,y}=radarPt(Math.max(0.01,v),i); i===0?ctx.moveTo(x,y):ctx.lineTo(x,y); });
        ctx.closePath();
        ctx.fillStyle=u.color+'28'; ctx.fill();
        ctx.strokeStyle=u.color; ctx.lineWidth=2.5; ctx.stroke();
        // \uC810
        u.vals.forEach((v,i)=>{ const {x,y}=radarPt(Math.max(0.01,v),i);
          ctx.beginPath(); ctx.arc(x,y,5,0,Math.PI*2);
          ctx.fillStyle=u.color; ctx.fill();
          ctx.strokeStyle='#fff'; ctx.lineWidth=1.5; ctx.stroke();
        });
      });

      // \uB9C8\uC6B0\uC2A4 hover \u2192 \uAC00\uC7A5 \uAC00\uAE4C\uC6B4 \uC810 \uAC15\uC870
      if (mousePos) {
        let minDist=Infinity, bestU=null, bestI=-1;
        activeUnivs.forEach(u=>{ u.vals.forEach((v,i)=>{ const {x,y}=radarPt(Math.max(0.01,v),i); const d=Math.hypot(mousePos.x-x,mousePos.y-y); if(d<minDist){minDist=d;bestU=u;bestI=i;} }); });
        if (bestU && minDist<24) {
          const {x,y}=radarPt(Math.max(0.01,bestU.vals[bestI]),bestI);
          ctx.beginPath(); ctx.arc(x,y,9,0,Math.PI*2);
          ctx.strokeStyle=bestU.color; ctx.lineWidth=3; ctx.stroke();
          // \uD234\uD301
          ttipEl.style.opacity='1';
          ttipEl.style.left=(x/W*canvas.getBoundingClientRect().width+canvas.getBoundingClientRect().left+12)+'px';
          ttipEl.style.top=(y/H*canvas.getBoundingClientRect().height+canvas.getBoundingClientRect().top-30)+'px';
          ttipEl.innerHTML=\`<div style="color:\${bestU.color};font-weight:900">\${(typeof window.escHTML==='function'?window.escHTML(bestU.name):String(bestU.name||''))}</div><div style="color:#475569">\${AXES[bestI]}: <strong>\${bestU.raw[bestI]}</strong></div><div style="font-size:10px;color:#94a3b8">\uC815\uADDC\uD654 \uD3C9\uADE0 \${Math.round((AVG_VALS[bestI]||0)*100)}%</div>\`;
        } else { ttipEl.style.opacity='0'; }
      }

      // \uBC94\uB840
      legendEl.innerHTML = activeUnivs.map(u=>{
        const str = getStrengthAxes(u).map(i=>AXES[i]).join(', ');
        return \`<div style="display:flex;align-items:center;gap:6px;padding:5px 10px;border-radius:var(--r);background:var(--surface);border:1.5px solid \${u.color}44">
          <span style="width:12px;height:12px;border-radius:50%;background:\${u.color};flex-shrink:0"></span>
          <span style="font-size:var(--fs-sm);font-weight:900;color:\${u.color}">\${(typeof window.escHTML==='function'?window.escHTML(u.name):String(u.name||''))}</span>
          <span style="font-size:var(--fs-caption);color:var(--text3);">\${u.total}\uBA85\${u.wr!==null?' \xB7 '+u.wr+'%':''}\${(u.wins+u.losses)>0?' \xB7 '+(u.wins+u.losses)+'\uC804':''}</span>
          \${str?'<span style="font-size:10px;background:#fef9c3;color:#b45309;padding:1px 5px;border-radius:5px;font-weight:800">\uAC15\uC810: '+str+'</span>':''}
        </div>\`;
      }).join('');
    }

    // \uC218\uCE58 \uD14C\uC774\uBE14 \uBE4C\uB4DC
    function buildTable() {
      const active = UNIVS.filter(u=>selected.includes(u.name));
      if (!tableEl) return;
      if (!active.length) { tableEl.innerHTML=''; return; }
      const thead=tableEl.querySelector('thead'), tbody=tableEl.querySelector('tbody');
      if (!thead || !tbody) {
        // thead/tbody\uAC00 \uC5C6\uC73C\uBA74 \uC7AC\uC0DD\uC131
        tableEl.innerHTML='<thead></thead><tbody></tbody>';
      }
      const th=tableEl.querySelector('thead'), tb=tableEl.querySelector('tbody');
      if (!th || !tb) return;
      // \uAC01 \uCD95\uBCC4 \uCD5C\uACE0\uAC12 \uC778\uB371\uC2A4
      const maxIdx = AXES.map((_,ai)=>{
        let best=-1, bestV=-Infinity;
        active.forEach((u,ui)=>{ if(u.vals[ai]>bestV){bestV=u.vals[ai];best=ui;} });
        return best;
      });
      th.innerHTML = \`<tr><th>\uD56D\uBAA9</th>\${active.map(u=>\`<th style="color:\${u.color}">\${(typeof window.escHTML==='function'?window.escHTML(u.name):String(u.name||''))}</th>\`).join('')}<th style="color:#94a3b8">\uC815\uADDC\uD654 \uD3C9\uADE0</th></tr>\`;
      tb.innerHTML = AXES.map((ax,ai)=>{
        const avgRaw=(AVG_VALS[ai]*100).toFixed(0)+'%';
        return \`<tr>
          <td style="font-weight:800;color:var(--text2)">\${ax}<div style="font-size:9px;color:var(--text3);font-weight:600">\${AXES_DESC[ai]}</div></td>
          \${active.map((u,ui)=>\`<td class="\${ui===maxIdx[ai]?'hi':''}" style="color:\${ui===maxIdx[ai]?u.color:'var(--text2)'}">\${u.raw[ai]}\${ui===maxIdx[ai]?'<span style="font-size:9px;margin-left:2px">\u2605</span>':''}</td>\`).join('')}
          <td style="color:#94a3b8">\${avgRaw}</td>
        </tr>\`;
      }).join('');
    }

    canvas.addEventListener('mousemove', e => {
      const rect=canvas.getBoundingClientRect();
      const scX=W/rect.width, scY=H/rect.height;
      mousePos={ x:(e.clientX-rect.left)*scX, y:(e.clientY-rect.top)*scY };
      draw();
    });
    canvas.addEventListener('mouseleave', ()=>{ mousePos=null; ttipEl.style.opacity='0'; draw(); });

    // \uBC18\uC751\uD615
    const ro=new ResizeObserver(()=>draw());
    ro.observe(canvas.parentElement);
    draw(); buildTable();
  })();
  <\/script>`}function _b2SummaryView(){const _dissSet=new Set((typeof univCfg!="undefined"?univCfg:[]).filter(u=>u.dissolved||u.hidden).map(u=>String(u.name||"").trim())),vis=players.filter(p=>!p.hidden&&!p.retired&&!p.hideFromBoard&&!_dissSet.has(String((p==null?void 0:p.univ)||"").trim())),tieredVis=vis.filter(p=>!_B2_ROLE_ORDER.includes(p.role||"")),roledVis=vis.filter(p=>_B2_ROLE_ORDER.includes(p.role||"")),univList=_b2VisUnivs?_b2VisUnivs().filter(u=>u.name&&u.name!=="\uBB34\uC18C\uC18D"):[],raceCts={P:0,T:0,Z:0,"?":0};tieredVis.forEach(p=>{const r=p.race||"?";raceCts[r in raceCts?r:"?"]++});const tierCts={};tieredVis.forEach(p=>{const t=p.tier||"\uBBF8\uC815";tierCts[t]=(tierCts[t]||0)+1});const{fromN:thisFromN,toN:thisToN}=_b2ThisWeekRange(),dateNum=_b2DateNum;let totalW=0,totalL=0,weekActive=new Set;tieredVis.forEach(p=>{(Array.isArray(p.history)?p.history:[]).forEach(h2=>{h2.result==="\uC2B9"?totalW++:h2.result==="\uD328"&&totalL++;const d=dateNum(h2.date||h2.d||"");d>=thisFromN&&d<=thisToN&&weekActive.add(p.name)})});const totalG=totalW+totalL,totalWr=totalG>0?Math.round(totalW/totalG*100):null,now=new Date,thirtyDaysAgo=new Date(now);thirtyDaysAgo.setDate(now.getDate()-30);const recentN=dateNum(thirtyDaysAgo.toISOString().slice(0,10)),newPlayers=tieredVis.filter(p=>{const hist=Array.isArray(p.history)?p.history:[];return hist.length?Math.min(...hist.map(h2=>dateNum(h2.date||h2.d||"")).filter(d=>d>0))>=recentN:!1}).sort((a,b)=>{const fa=Math.min(...(Array.isArray(a.history)?a.history:[]).map(h2=>dateNum(h2.date||h2.d||"")).filter(d=>d>0));return Math.min(...(Array.isArray(b.history)?b.history:[]).map(h2=>dateNum(h2.date||h2.d||"")).filter(d=>d>0))-fa}).slice(0,8),univStats=univList.map(u=>{const members=tieredVis.filter(p=>String((p==null?void 0:p.univ)||"").trim()===String(u.name||"").trim()),rCts={P:0,T:0,Z:0};members.forEach(p=>{p.race in rCts&&rCts[p.race]++});const tierDist={};return members.forEach(p=>{const t=p.tier||"\uBBF8\uC815";tierDist[t]=(tierDist[t]||0)+1}),{name:u.name,color:gc(u.name),count:members.length,races:rCts,tiers:tierDist}}).filter(u=>u.count>0).sort((a,b)=>b.count-a.count),maxCount=univStats.length>0?univStats[0].count:1,orderedTiers=(typeof TIERS!="undefined"?TIERS:[]).filter(t=>tierCts[t]),total3=raceCts.P+raceCts.T+raceCts.Z||1,donutRings=()=>{const total=raceCts.P+raceCts.T+raceCts.Z||1,segs=[{val:raceCts.P,col:"#7c3aed",label:"P"},{val:raceCts.T,col:"#0284c7",label:"T"},{val:raceCts.Z,col:"#059669",label:"Z"}].filter(s=>s.val>0),circ=2*Math.PI*38;let offset=0;return`<svg width="110" height="110" viewBox="0 0 110 110">
      <circle cx="55" cy="55" r="38" fill="none" stroke="var(--border2)" stroke-width="18"/>
      ${segs.map(s=>{const dash=s.val/total*circ,el=`<circle cx="55" cy="55" r="38" fill="none" stroke="${s.col}" stroke-width="18" stroke-dasharray="${dash.toFixed(2)} ${circ.toFixed(2)}" stroke-dashoffset="${(-offset).toFixed(2)}" transform="rotate(-90 55 55)"/>`;return offset+=dash,el}).join("")}
      <text x="55" y="49" text-anchor="middle" font-size="18" font-weight="900" fill="var(--text1)">${tieredVis.length}</text>
      <text x="55" y="65" text-anchor="middle" font-size="9" font-weight="600" fill="var(--text3)">\uC120\uC218</text>
    </svg>`};let h=`<style>
    .b2s-hero{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;padding:20px 22px;border-radius:26px;border:1px solid rgba(148,163,184,.18);background:linear-gradient(180deg,rgba(255,255,255,.99),rgba(248,250,252,.96));box-shadow:0 18px 32px rgba(15,23,42,.05);margin-bottom:16px}
    .b2s-hero-title{font-size:26px;font-weight:950;letter-spacing:-.04em;color:var(--text1);line-height:1.08}
    .b2s-hero-desc{margin-top:6px;font-size:var(--fs-base);line-height:1.65;color:var(--text3);max-width:720px}
    .b2s-hero-badges{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}
    .b2s-hero-badge{display:inline-flex;align-items:center;gap:6px;padding:8px 12px;border-radius:999px;border:1px solid rgba(148,163,184,.18);background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.94));box-shadow:0 10px 18px rgba(15,23,42,.04);font-size:var(--fs-sm);font-weight:800;color:var(--text2)}
    .b2s-hero-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;min-width:min(100%,360px)}
    .b2s-hero-stat{padding:14px;border-radius:18px;border:1px solid rgba(148,163,184,.16);background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.94));box-shadow:0 10px 18px rgba(15,23,42,.04)}
    .b2s-hero-stat-label{font-size:var(--fs-caption);font-weight:800;color:var(--text3)}
    .b2s-hero-stat-value{margin-top:6px;font-size:22px;font-weight:950;letter-spacing:-.03em;color:var(--text1);line-height:1}
    .b2s-hero-stat-sub{margin-top:4px;font-size:var(--fs-caption);font-weight:700;color:var(--text3)}
    .b2s-grid7 { display:grid; grid-template-columns:repeat(7,1fr); gap:10px; margin-bottom:16px; }
    @media(max-width:700px){ .b2s-grid7{ grid-template-columns:repeat(4,1fr); } }
    @media(max-width:420px){ .b2s-grid7{ grid-template-columns:repeat(2,1fr); } }
    .b2s-kpi { border-radius:18px; padding:15px 12px; text-align:center; position:relative; overflow:hidden; border:1px solid rgba(148,163,184,.16); background:linear-gradient(180deg,rgba(255,255,255,.99),rgba(248,250,252,.96)); box-shadow:0 14px 24px rgba(15,23,42,.04); transition:transform .15s,box-shadow .15s; cursor:default; }
    .b2s-kpi:hover { transform:translateY(-2px); box-shadow:0 12px 28px rgba(15,23,42,.08); }
    .b2s-kpi-num { font-size:26px; font-weight:900; line-height:1.1; }
    .b2s-kpi-lbl { font-size:var(--fs-caption); font-weight:700; margin-top:3px; opacity:.75; }
    .b2s-kpi-sub { font-size:10px; opacity:.6; margin-top:1px; }
    .b2s-kpi-glow { position:absolute;inset:0;opacity:.08;pointer-events:none; }
    .b2s-2col { display:grid; grid-template-columns:1fr 1fr 1fr; gap:14px; margin-bottom:14px; }
    @media(max-width:780px){ .b2s-2col{ grid-template-columns:1fr 1fr; } }
    @media(max-width:520px){ .b2s-2col{ grid-template-columns:1fr; } }
    .b2s-panel { background:linear-gradient(180deg,rgba(255,255,255,.99),rgba(248,250,252,.96)); border:1px solid rgba(148,163,184,.16); border-radius:20px; padding:16px; box-shadow:0 16px 28px rgba(15,23,42,.04); }
    .b2s-panel-title { font-size:var(--fs-base); font-weight:900; color:var(--text1); margin-bottom:12px; display:flex; align-items:center; gap:6px; }
    .b2s-univ-row { display:flex; align-items:center; gap:8px; padding:5px 0; }
    .b2s-univ-row + .b2s-univ-row { border-top:1px solid var(--border2); }
    .b2s-bar-track { flex:1; height:12px; border-radius:6px; overflow:hidden; background:var(--border2); display:flex; }
    .b2s-tier-chip { display:inline-flex; flex-direction:column; align-items:center; padding:8px 10px; border-radius:14px; min-width:54px; box-shadow:0 10px 16px rgba(15,23,42,.04); }
    .b2s-top-univ { display:grid; grid-template-columns:repeat(auto-fill,minmax(130px,1fr)); gap:8px; }
    .b2s-univ-card { border-radius:var(--r2); padding:10px 12px; border:1.5px solid; position:relative; overflow:hidden; transition:transform .12s,box-shadow .12s; cursor:default; box-shadow:0 12px 18px rgba(15,23,42,.04); }
    .b2s-univ-card:hover { transform:translateY(-2px); box-shadow:0 12px 24px rgba(15,23,42,.08); }
    .b2s-new-player { display:inline-flex;align-items:center;gap:4px;padding:5px 9px;border-radius:999px;background:var(--surface);border:1px solid var(--border2);font-size:var(--fs-caption);font-weight:700;color:var(--text2);margin:2px; }
    @media(max-width:900px){ .b2s-hero{flex-direction:column}.b2s-hero-stats{width:100%;grid-template-columns:repeat(3,minmax(0,1fr));} }
    @media(max-width:640px){
      .b2s-hero{padding:18px 16px;border-radius:22px}
      .b2s-hero-title{font-size:22px}
      /* \uBAA8\uBC14\uC77C: \uBC30\uC9C0 \uC904\uC5D0 \uC774\uBBF8 \uAC19\uC740 \uC815\uBCF4\uAC00 \uC694\uC57D\uB3FC \uC788\uC73C\uBBC0\uB85C \uC911\uBCF5\uB418\uB294 \uD788\uC5B4\uB85C \uD1B5\uACC4 \uCE74\uB4DC\uB294 \uC228\uAE40 */
      .b2s-hero-stats{display:none!important}
    }
  </style>`;const kpis=[{num:vis.length,lbl:"\uC804\uCCB4 \uC120\uC218",col:"#3b82f6",icon:"\u{1F465}"},{num:univList.length,lbl:"\uD65C\uB3D9 \uB300\uD559",col:"#10b981",icon:"\u{1F3EB}"},{num:raceCts.P,lbl:"\uD504\uB85C\uD1A0\uC2A4",col:"#7c3aed",icon:"\u{1F52E}"},{num:raceCts.T,lbl:"\uD14C\uB780",col:"#0284c7",icon:"\u2694\uFE0F"},{num:raceCts.Z,lbl:"\uC800\uADF8",col:"#059669",icon:"\u{1F98E}"},{num:weekActive.size,lbl:"\uC774\uBC88\uC8FC \uD65C\uB3D9",col:"#f59e0b",icon:"\u{1F525}",sub:`${totalW}\uC2B9 ${totalL}\uD328`},{num:totalWr!==null?`${totalWr}%`:"-",lbl:"\uD1B5\uC0B0 \uC2B9\uB960",col:"#ec4899",icon:"\u{1F4CA}",sub:`${totalG.toLocaleString()}\uC804`}];return h+=`<section class="b2s-hero">
    <div>
      <div style="font-size:var(--fs-caption);font-weight:900;letter-spacing:.08em;color:#2563eb;text-transform:uppercase">Summary Dashboard</div>
      <div class="b2s-hero-title">\uD604\uD669\uD310 \uC694\uC57D</div>
      <div class="b2s-hero-desc">\uC804\uCCB4 \uC778\uC6D0, \uD65C\uB3D9 \uB300\uD559, \uC885\uC871 \uBD84\uD3EC, \uCD5C\uADFC \uC720\uC785\uACFC \uB300\uD559\uBCC4 \uAD6C\uC131\uC744 \uD55C \uD654\uBA74\uC5D0\uC11C \uBE60\uB974\uAC8C \uD6D1\uC744 \uC218 \uC788\uB3C4\uB85D \uC815\uB9AC\uD55C \uC694\uC57D \uD654\uBA74\uC785\uB2C8\uB2E4.</div>
      <div class="b2s-hero-badges">
        <span class="b2s-hero-badge">\uD45C\uC2DC \uC120\uC218 ${vis.length}\uBA85</span>
        <span class="b2s-hero-badge">\uC77C\uBC18 ${tieredVis.length}\uBA85</span>
        <span class="b2s-hero-badge">\uC9C1\uCC45 ${roledVis.length}\uBA85</span>
        <span class="b2s-hero-badge">\uCD5C\uADFC 30\uC77C \uC2E0\uADDC ${newPlayers.length}\uBA85</span>
      </div>
    </div>
    <div class="b2s-hero-stats">
      <div class="b2s-hero-stat">
        <div class="b2s-hero-stat-label">\uD65C\uB3D9 \uB300\uD559</div>
        <div class="b2s-hero-stat-value">${univList.length}</div>
        <div class="b2s-hero-stat-sub">\uBB34\uC18C\uC18D \uC81C\uC678 \uAE30\uC900</div>
      </div>
      <div class="b2s-hero-stat">
        <div class="b2s-hero-stat-label">\uC774\uBC88\uC8FC \uD65C\uB3D9</div>
        <div class="b2s-hero-stat-value">${weekActive.size}</div>
        <div class="b2s-hero-stat-sub">${totalW}\uC2B9 ${totalL}\uD328 \uB204\uC801</div>
      </div>
      <div class="b2s-hero-stat">
        <div class="b2s-hero-stat-label">\uD1B5\uC0B0 \uC2B9\uB960</div>
        <div class="b2s-hero-stat-value">${totalWr!==null?`${totalWr}%`:"-"}</div>
        <div class="b2s-hero-stat-sub">${totalG.toLocaleString()}\uC804 \uAE30\uC900</div>
      </div>
    </div>
  </section>`,h+=`<div class="b2s-grid7">
    ${kpis.map(k=>`
    <div class="b2s-kpi" style="background:linear-gradient(180deg,rgba(255,255,255,.99),rgba(248,250,252,.96))">
      <div class="b2s-kpi-glow" style="background:radial-gradient(circle at 50% 0%,${k.col},transparent 70%)"></div>
      <div style="font-size:20px;margin-bottom:2px">${k.icon}</div>
      <div class="b2s-kpi-num" style="color:${k.col}">${k.num}</div>
      <div class="b2s-kpi-lbl" style="color:${k.col}">${k.lbl}</div>
      ${k.sub?`<div class="b2s-kpi-sub" style="color:${k.col}">${k.sub}</div>`:""}
    </div>`).join("")}
  </div>`,h+=`<div class="b2s-2col">
    <div class="b2s-panel">
      <div class="b2s-panel-title">\u{1F3AE} \uC885\uC871 \uBE44\uC728
        <span style="margin-left:auto;font-size:var(--fs-caption);color:var(--text3);font-weight:600">${tieredVis.length}\uBA85 \uAE30\uC900</span>
      </div>
      <div style="display:flex;align-items:center;gap:16px">
        <div style="flex-shrink:0">${donutRings()}</div>
        <div style="flex:1;display:flex;flex-direction:column;gap:8px">
          ${[{r:"P",c:"#7c3aed",l:"\u{1F52E} \uD504\uB85C\uD1A0\uC2A4"},{r:"T",c:"#0284c7",l:"\u2694\uFE0F \uD14C\uB780"},{r:"Z",c:"#059669",l:"\u{1F98E} \uC800\uADF8"}].map(({r,c,l})=>{const n=raceCts[r],pct=Math.round(n/total3*100);return`<div>
              <div style="display:flex;justify-content:space-between;margin-bottom:3px">
                <span style="font-size:var(--fs-caption);font-weight:800;color:${c}">${l}</span>
                <span style="font-size:var(--fs-caption);font-weight:900;color:var(--text2)">${n}<span style="font-weight:600;color:var(--text3)"> (${pct}%)</span></span>
              </div>
              <div style="height:7px;border-radius:4px;background:var(--border2);overflow:hidden">
                <div style="width:${pct}%;height:100%;background:${c};border-radius:4px;transition:width .8s ease"></div>
              </div>
            </div>`}).join("")}
        </div>
      </div>
    </div>
    <div class="b2s-panel">
      <div class="b2s-panel-title">\u{1F3C6} \uD2F0\uC5B4 \uBD84\uD3EC</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px">
        ${orderedTiers.map(t=>{const col=typeof getTierBtnColor=="function"?getTierBtnColor(t):"#64748b",tcol=typeof getTierBtnTextColor=="function"&&getTierBtnTextColor(t)||"#fff",n=tierCts[t],pct=Math.round(n/tieredVis.length*100);return`<div class="b2s-tier-chip" style="background:${col}18;border:1.5px solid ${col}55" title="${t}: ${n}\uBA85 (${pct}%)">
            <div style="font-size:var(--fs-sm);font-weight:900;padding:2px 8px;border-radius:6px;background:${col};color:${tcol}">${t}</div>
            <div style="font-size:var(--fs-caption);font-weight:800;color:${col};margin-top:3px">${n}\uBA85</div>
            <div style="font-size:10px;color:var(--text3)">${pct}%</div>
          </div>`}).join("")}
      </div>
    </div>
    <div class="b2s-panel">
      <div class="b2s-panel-title">\u{1F3EB} \uB300\uD559\uBCC4 \uD604\uD669
        <span style="margin-left:auto;font-size:var(--fs-caption);color:var(--text3);font-weight:600">${univStats.length}\uAC1C \uB300\uD559</span>
      </div>
      ${univStats.slice(0,10).map((u,i)=>{const barW=Math.round(u.count/maxCount*100);return`<div style="display:flex;align-items:center;gap:6px;padding:4px 0;border-bottom:1px solid var(--border2)">
          <span style="font-size:10px;font-weight:900;color:var(--text3);width:16px;text-align:center">${i+1}</span>
          <span style="font-size:var(--fs-caption);font-weight:800;color:${u.color};min-width:60px;max-width:72px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${typeof window.escHTML=="function"?window.escHTML(u.name):String(u.name||"")}</span>
          <div style="flex:1;height:8px;border-radius:4px;overflow:hidden;background:var(--border2);display:flex">
            <div style="width:${Math.round(u.races.P/u.count*barW)}%;background:#7c3aed"></div>
            <div style="width:${Math.round(u.races.T/u.count*barW)}%;background:#0284c7"></div>
            <div style="width:${Math.round(u.races.Z/u.count*barW)}%;background:#059669"></div>
          </div>
          <span style="font-size:var(--fs-caption);font-weight:900;color:${u.color};min-width:20px;text-align:right">${u.count}</span>
        </div>`}).join("")}
      ${univStats.length>10?`<div style="text-align:center;color:var(--text3);font-size:var(--fs-caption);margin-top:6px">\uC678 ${univStats.length-10}\uAC1C \uB300\uD559</div>`:""}
    </div>
  </div>`,newPlayers.length>0&&(h+=`<div class="b2s-panel" style="margin-bottom:14px">
      <div class="b2s-panel-title">\u{1F195} \uCD5C\uADFC 30\uC77C \uCCAB \uACBD\uAE30 \uC120\uC218
        <span style="margin-left:auto;font-size:var(--fs-caption);color:var(--text3);font-weight:600">${newPlayers.length}\uBA85</span>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:4px">
        ${newPlayers.map(p=>{const col=gc(String((p==null?void 0:p.univ)||""))||"#64748b",tc=typeof getTierBtnColor=="function"&&p.tier?getTierBtnColor(p.tier):"#64748b",tt=typeof getTierBtnTextColor=="function"&&p.tier&&getTierBtnTextColor(p.tier)||"#fff",rIco=p.race==="P"?"\u{1F52E}":p.race==="T"?"\u2694\uFE0F":p.race==="Z"?"\u{1F98E}":"",hist=Array.isArray(p.history)?p.history:[],firstD=hist.length?String(Math.min(...hist.map(h2=>parseInt(String(h2.date||h2.d||"").replace(/[-\.]/g,""))||1/0))).replace(/(\d{4})(\d{2})(\d{2})/,"$1.$2.$3"):"";return`<span class="b2s-new-player" style="border-color:${col}44;background:${col}0d">
            <span style="color:${col};font-weight:900">${typeof window.escHTML=="function"?window.escHTML(p.name):String(p.name||"")}</span>
            ${rIco?`<span style="font-size:10px">${rIco}</span>`:""}
            ${p.tier?`<span style="font-size:9px;padding:1px 4px;border-radius:4px;background:${tc};color:${tt}">${p.tier}</span>`:""}
            <span style="font-size:9px;color:var(--text3)">${typeof window.escHTML=="function"?window.escHTML(p.univ||""):String(p.univ||"")}</span>
          </span>`}).join("")}
      </div>
    </div>`),h+=`<div class="b2s-panel" style="margin-bottom:14px">
    <div class="b2s-panel-title">\u{1F3EB} \uB300\uD559\uBCC4 \uC778\uC6D0 \uD604\uD669
      <span style="margin-left:auto;font-size:var(--fs-caption);color:var(--text3);font-weight:600">${univStats.length}\uAC1C \uB300\uD559</span>
    </div>
    <div class="b2s-top-univ" style="margin-bottom:12px">
      ${univStats.slice(0,6).map((u,i)=>{const medal=["\u{1F947}","\u{1F948}","\u{1F949}","4\uFE0F\u20E3","5\uFE0F\u20E3","6\uFE0F\u20E3"][i]||"",pP=u.count>0?Math.round(u.races.P/u.count*100):0,pT=u.count>0?Math.round(u.races.T/u.count*100):0,pZ=u.count>0?Math.round(u.races.Z/u.count*100):0;return`<div class="b2s-univ-card" style="border-color:${u.color}44;background:${u.color}0d">
          <div style="display:flex;align-items:center;gap:4px;margin-bottom:6px">
            <span style="font-size:14px">${medal}</span>
            <span style="font-size:var(--fs-sm);font-weight:900;color:${u.color};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1">${typeof window.escHTML=="function"?window.escHTML(u.name):String(u.name||"")}</span>
            <span style="font-size:var(--fs-md);font-weight:900;color:${u.color}">${u.count}</span>
          </div>
          <div style="height:6px;border-radius:3px;overflow:hidden;background:var(--border2);display:flex;margin-bottom:4px">
            <div style="width:${pP}%;background:#7c3aed" title="P ${u.races.P}"></div>
            <div style="width:${pT}%;background:#0284c7" title="T ${u.races.T}"></div>
            <div style="width:${pZ}%;background:#059669" title="Z ${u.races.Z}"></div>
          </div>
          <div style="display:flex;gap:3px;flex-wrap:wrap">
            ${u.races.P?`<span style="font-size:9px;background:#ede9fe;color:#5b21b6;padding:1px 5px;border-radius:5px;font-weight:800">P${u.races.P}</span>`:""}
            ${u.races.T?`<span style="font-size:9px;background:#e0f2fe;color:#075985;padding:1px 5px;border-radius:5px;font-weight:800">T${u.races.T}</span>`:""}
            ${u.races.Z?`<span style="font-size:9px;background:#d1fae5;color:#064e3b;padding:1px 5px;border-radius:5px;font-weight:800">Z${u.races.Z}</span>`:""}
          </div>
        </div>`}).join("")}
    </div>
    <div style="border-top:1px solid var(--border2);padding-top:10px">
      ${univStats.slice(0,20).map(u=>{const barW=Math.round(u.count/maxCount*100);return`<div class="b2s-univ-row">
          <span style="font-size:var(--fs-caption);font-weight:800;color:${u.color};min-width:68px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${typeof window.escHTML=="function"?window.escHTML(u.name):String(u.name||"")}</span>
          <div class="b2s-bar-track">
            <div title="\uD504\uB85C\uD1A0\uC2A4 ${u.races.P}" style="width:${Math.round(u.races.P/u.count*barW)}%;background:#7c3aed;transition:width .6s ease"></div>
            <div title="\uD14C\uB780 ${u.races.T}" style="width:${Math.round(u.races.T/u.count*barW)}%;background:#0284c7;transition:width .6s ease"></div>
            <div title="\uC800\uADF8 ${u.races.Z}" style="width:${Math.round(u.races.Z/u.count*barW)}%;background:#059669;transition:width .6s ease"></div>
          </div>
          <span style="font-size:var(--fs-caption);font-weight:900;color:${u.color};min-width:22px;text-align:right">${u.count}</span>
          <div style="display:flex;gap:3px;margin-left:3px;min-width:70px">
            ${u.races.P?`<span style="font-size:9px;background:#ede9fe;color:#5b21b6;padding:1px 4px;border-radius:5px;font-weight:800">P${u.races.P}</span>`:""}
            ${u.races.T?`<span style="font-size:9px;background:#e0f2fe;color:#075985;padding:1px 4px;border-radius:5px;font-weight:800">T${u.races.T}</span>`:""}
            ${u.races.Z?`<span style="font-size:9px;background:#d1fae5;color:#064e3b;padding:1px 4px;border-radius:5px;font-weight:800">Z${u.races.Z}</span>`:""}
          </div>
        </div>`}).join("")}
      ${univStats.length>20?`<div style="text-align:center;color:var(--text3);font-size:var(--fs-sm);margin-top:8px;padding-top:6px;border-top:1px solid var(--border2)">\uC678 ${univStats.length-20}\uAC1C \uB300\uD559</div>`:""}
    </div>
  </div>`,h}let _b2CompareA="",_b2CompareB="";function _b2CompareView(){var _a,_b,_c,_d;const _dissSet=new Set((typeof univCfg!="undefined"?univCfg:[]).filter(u=>u.dissolved||u.hidden).map(u=>String(u.name||"").trim())),univList=_b2VisUnivs?_b2VisUnivs().filter(u=>u.name&&u.name!=="\uBB34\uC18C\uC18D"):[];!_b2CompareA&&univList.length>0&&(_b2CompareA=((_a=univList[0])==null?void 0:_a.name)||""),!_b2CompareB&&univList.length>1&&(_b2CompareB=((_b=univList[1])==null?void 0:_b.name)||"");const dateNum=_b2DateNum,getStats=name=>{var _a2;const members=players.filter(p=>String((p==null?void 0:p.univ)||"").trim()===name&&!p.hidden&&!p.retired&&!p.hideFromBoard&&!_dissSet.has(name)),tiered=members.filter(p=>!_B2_ROLE_ORDER.includes(p.role||"")),roled=members.filter(p=>_B2_ROLE_ORDER.includes(p.role||"")),races={P:0,T:0,Z:0,N:0};members.forEach(p=>{const r=String(p.race||"").trim().toUpperCase();r==="P"||r==="T"||r==="Z"?races[r]++:races.N++});const tiers={};tiered.forEach(p=>{const t=p.tier||"\uBBF8\uC815";tiers[t]=(tiers[t]||0)+1});const topTier=tiered.length>0&&((_a2=tiered.slice().sort((a,b)=>{const ti=typeof TIERS!="undefined"?TIERS:[],ia=ti.indexOf(a.tier||""),ib=ti.indexOf(b.tier||"");return(ia>=0?ia:999)-(ib>=0?ib:999)})[0])==null?void 0:_a2.tier)||"\uC5C6\uC74C";let tw=0,tl=0;tiered.forEach(p=>{tw+=Number(p.win||0),tl+=Number(p.loss||0)});const tg=tw+tl,wr=tg>0?Math.round(tw/tg*100):null;return{members,tiered,roled,races,tiers,topTier,total:members.length,tw,tl,tg,wr}},getHeadToHead=(nameA,nameB)=>{const aPlayers=new Set(players.filter(p=>String((p==null?void 0:p.univ)||"").trim()===nameA&&!p.hidden&&!p.retired).map(p=>p.name)),bPlayers=new Set(players.filter(p=>String((p==null?void 0:p.univ)||"").trim()===nameB).map(p=>p.name));let aw=0,al=0;players.filter(p=>aPlayers.has(p.name)).forEach(p=>{(Array.isArray(p.history)?p.history:[]).forEach(h2=>{const oppU=String(h2.oppUniv||h2.univ||"").trim(),oppN=String(h2.opp||"").trim();(oppU===nameB||bPlayers.has(oppN))&&(h2.result==="\uC2B9"?aw++:h2.result==="\uD328"&&al++)})});try{(typeof indM!="undefined"&&Array.isArray(indM)?indM:[]).forEach(m=>{!m||!m.wName||!m.lName||(aPlayers.has(m.wName)&&bPlayers.has(m.lName)?aw++:aPlayers.has(m.lName)&&bPlayers.has(m.wName)&&al++)})}catch(e){}try{(typeof gjM!="undefined"&&Array.isArray(gjM)?gjM:[]).forEach(m=>{!m||!m.wName||!m.lName||m._proLabel||(aPlayers.has(m.wName)&&bPlayers.has(m.lName)?aw++:aPlayers.has(m.lName)&&bPlayers.has(m.wName)&&al++)})}catch(e){}try{(typeof ttM!="undefined"&&Array.isArray(ttM)?ttM:[]).forEach(m=>{(m.sets||[]).forEach(s=>{(s.games||[]).forEach(g=>{if(!g||!g.winner)return;const gA=g.playerA||g.a1||"",gB=g.playerB||g.b1||"";if(!gA||!gB)return;const wA=g.winner==="A",wB=g.winner==="B";aPlayers.has(gA)&&bPlayers.has(gB)?wA?aw++:wB&&al++:aPlayers.has(gB)&&bPlayers.has(gA)&&(wB?aw++:wA&&al++)})})})}catch(e){}try{[typeof miniM!="undefined"?miniM:[],typeof univM!="undefined"?univM:[],typeof ckM!="undefined"?ckM:[]].forEach(arr=>{(Array.isArray(arr)?arr:[]).forEach(m=>{(m.sets||[]).forEach(s=>{(s.games||[]).forEach(g=>{if(!g||!g.winner)return;const gA=g.playerA||g.a1||"",gB=g.playerB||g.b1||"";if(!gA||!gB)return;const wA=g.winner==="A",wB=g.winner==="B";aPlayers.has(gA)&&bPlayers.has(gB)?wA?aw++:wB&&al++:aPlayers.has(gB)&&bPlayers.has(gA)&&(wB?aw++:wA&&al++)})})})})}catch(e){}return{aw,al,ag:aw+al}},colA=_b2CompareA&&gc(_b2CompareA)||"#64748b",colB=_b2CompareB&&gc(_b2CompareB)||"#64748b",stA=_b2CompareA?getStats(_b2CompareA):null,stB=_b2CompareB?getStats(_b2CompareB):null,h2h=_b2CompareA&&_b2CompareB?getHeadToHead(_b2CompareA,_b2CompareB):{aw:0,al:0,ag:0},h2hB=_b2CompareA&&_b2CompareB?getHeadToHead(_b2CompareB,_b2CompareA):{aw:0,al:0,ag:0},univOptA=univList.map(u=>{const _n=typeof escAttr=="function"?escAttr(u.name):String(u.name||""),_nh=typeof window.escHTML=="function"?window.escHTML(u.name):String(u.name||"");return`<option value="${_n}"${_b2CompareA===u.name?" selected":""}>${_nh}</option>`}).join(""),univOptB=univList.map(u=>{const _n=typeof escAttr=="function"?escAttr(u.name):String(u.name||""),_nh=typeof window.escHTML=="function"?window.escHTML(u.name):String(u.name||"");return`<option value="${_n}"${_b2CompareB===u.name?" selected":""}>${_nh}</option>`}).join(""),compareRow=(label,valA,valB)=>{const numA=typeof valA=="number"?valA:null,numB=typeof valB=="number"?valB:null,winA=numA!==null&&numB!==null&&numA>numB,winB=numA!==null&&numB!==null&&numB>numA,tot=numA!==null&&numB!==null?numA+numB:0,pctA=tot>0?Math.round(numA/tot*100):50,pctB=tot>0?Math.round(numB/tot*100):50,showBar=numA!==null&&numB!==null&&tot>0;return`<div style="padding:7px 0;border-bottom:1px solid var(--border2)">
      <div style="display:grid;grid-template-columns:1fr auto 1fr;gap:8px;align-items:center;margin-bottom:${showBar?"5px":"0"}">
        <div style="text-align:right;font-size:var(--fs-base);font-weight:${winA?"900":"600"};color:${winA?colA:"var(--text2)"}">
          ${winA?"\u25B2 ":""}${valA}
        </div>
        <div style="font-size:10px;color:var(--text3);font-weight:700;text-align:center;white-space:nowrap;min-width:58px">${label}</div>
        <div style="text-align:left;font-size:var(--fs-base);font-weight:${winB?"900":"600"};color:${winB?colB:"var(--text2)"}">
          ${valB}${winB?" \u25B2":""}
        </div>
      </div>
      ${showBar?`<div style="display:flex;height:5px;border-radius:3px;overflow:hidden;background:var(--border2)">
        <div style="width:${pctA}%;background:${winA?colA:colA+"88"};transition:width .5s ease"></div>
        <div style="width:${pctB}%;background:${winB?colB:colB+"88"};transition:width .5s ease"></div>
      </div>`:""}
    </div>`},radarChart=(stA2,stB2)=>{if(!stA2||!stB2)return"";const TIERS_LOCAL=typeof TIERS!="undefined"?TIERS:[],tierScore=t=>{const i=TIERS_LOCAL.indexOf(t);return i<0?0:Math.max(0,(TIERS_LOCAL.length-i)*10)},normalize=(val,max)=>Math.min(1,max>0?val/max:0),powerScore=st=>st.tiered.reduce((s,p)=>s+tierScore(p.tier||""),0)+st.total*5,powA=powerScore(stA2),powB=powerScore(stB2),axes=[{label:"\uC804\uB825",vA:normalize(powA,Math.max(powA,powB,1)),vB:normalize(powB,Math.max(powA,powB,1))},{label:"\uC2B9\uB960",vA:stA2.wr!==null?stA2.wr/100:0,vB:stB2.wr!==null?stB2.wr/100:0},{label:"\uACBD\uAE30\uC218",vA:normalize(stA2.tg,Math.max(stA2.tg,stB2.tg,1)),vB:normalize(stB2.tg,Math.max(stA2.tg,stB2.tg,1))},{label:"\uD504\uB85C\uD1A0\uC2A4",vA:normalize(stA2.races.P,Math.max(stA2.races.P,stB2.races.P,1)),vB:normalize(stB2.races.P,Math.max(stA2.races.P,stB2.races.P,1))},{label:"\uD14C\uB780",vA:normalize(stA2.races.T,Math.max(stA2.races.T,stB2.races.T,1)),vB:normalize(stB2.races.T,Math.max(stA2.races.T,stB2.races.T,1))},{label:"\uC800\uADF8",vA:normalize(stA2.races.Z,Math.max(stA2.races.Z,stB2.races.Z,1)),vB:normalize(stB2.races.Z,Math.max(stA2.races.Z,stB2.races.Z,1))}],N=axes.length,cx=120,cy=120,R=90,angleOf=i=>Math.PI*2/N*i-Math.PI/2,pt=(val,i)=>{const a=angleOf(i),r=val*R;return`${(cx+Math.cos(a)*r).toFixed(1)},${(cy+Math.sin(a)*r).toFixed(1)}`},webPts=vFn=>axes.map((_,i)=>pt(vFn(i),i)).join(" ");let grid="";[.25,.5,.75,1].forEach(s=>{const pts=axes.map((_,i)=>{const a=angleOf(i);return`${(cx+Math.cos(a)*R*s).toFixed(1)},${(cy+Math.sin(a)*R*s).toFixed(1)}`}).join(" ");grid+=`<polygon points="${pts}" fill="none" stroke="var(--border2)" stroke-width="1"/>`});const axisLines=axes.map((_,i)=>{const a=angleOf(i);return`<line x1="${cx}" y1="${cy}" x2="${(cx+Math.cos(a)*R).toFixed(1)}" y2="${(cy+Math.sin(a)*R).toFixed(1)}" stroke="var(--border2)" stroke-width="1"/>`}).join(""),labels=axes.map((ax,i)=>{const a=angleOf(i),lx=(cx+Math.cos(a)*(R+18)).toFixed(1),ly=(cy+Math.sin(a)*(R+18)).toFixed(1);return`<text x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="middle" font-size="10" font-weight="700" fill="var(--text3)">${ax.label}</text>`}).join("");return`<div style="display:flex;justify-content:center;margin:8px 0 4px">
      <svg width="240" height="240" viewBox="0 0 240 240" style="overflow:visible">
        ${grid}${axisLines}
        <polygon points="${webPts(i=>axes[i].vA)}" fill="${colA}" fill-opacity="0.18" stroke="${colA}" stroke-width="2" stroke-linejoin="round"/>
        <polygon points="${webPts(i=>axes[i].vB)}" fill="${colB}" fill-opacity="0.18" stroke="${colB}" stroke-width="2" stroke-linejoin="round" stroke-dasharray="5 3"/>
        ${labels}
      </svg>
    </div>
    <div style="display:flex;justify-content:center;gap:16px;font-size:var(--fs-caption);font-weight:700">
      <span style="color:${colA}">\u2501 ${_b2CompareA}</span>
      <span style="color:${colB}">\u254C ${_b2CompareB}</span>
    </div>`};let h=`<style>
    .b2cv2-wrap { max-width:800px;margin:0 auto }
    .b2cv2-sel { display:grid;grid-template-columns:1fr 40px 1fr;gap:12px;align-items:center;margin-bottom:16px }
    .b2cv2-header { display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px }
    .b2cv2-col { border-radius:12px;padding:14px;text-align:center }
    .b2cv2-h2h { padding:12px 16px;background:var(--surface);border:1px solid var(--border2);border-radius:14px;margin-bottom:12px;text-align:center }
    @media(max-width:540px){ .b2cv2-sel{grid-template-columns:1fr} .b2cv2-header{grid-template-columns:1fr 1fr;gap:6px} }
  </style>
  <div class="b2cv2-wrap">
    <div class="b2cv2-sel">
      <div>
        <select onchange="if(this.value===_b2CompareB){this.value=_b2CompareA;return;}; _b2CompareA=this.value;document.getElementById('b2-content').innerHTML=_b2CompareView()"
          style="width:100%;padding:8px 12px;border-radius:var(--r);border:2px solid ${colA};font-size:var(--fs-base);font-weight:700;background:var(--white);color:${colA};cursor:pointer">
          ${univOptA}
        </select>
      </div>
      <div style="text-align:center;font-size:var(--fs-lg);font-weight:900;color:var(--text3)">VS</div>
      <div>
        <select onchange="if(this.value===_b2CompareA){this.value=_b2CompareB;return;}; _b2CompareB=this.value;document.getElementById('b2-content').innerHTML=_b2CompareView()"
          style="width:100%;padding:8px 12px;border-radius:var(--r);border:2px solid ${colB};font-size:var(--fs-base);font-weight:700;background:var(--white);color:${colB};cursor:pointer">
          ${univOptB}
        </select>
      </div>
    </div>
    ${_b2CompareA===_b2CompareB?'<div style="text-align:center;padding:10px;color:#b45309;font-size:var(--fs-sm);font-weight:700;background:#fef9c3;border-radius:var(--r);margin-bottom:8px">\u26A0\uFE0F \uAC19\uC740 \uB300\uD559\uC744 \uC120\uD0DD\uD558\uBA74 \uBE44\uAD50\uAC00 \uC758\uBBF8 \uC5C6\uC2B5\uB2C8\uB2E4. \uB2E4\uB978 \uB300\uD559\uC744 \uC120\uD0DD\uD574 \uC8FC\uC138\uC694.</div>':""}`;if(stA&&stB){h+=`<div class="b2cv2-header">
      <div class="b2cv2-col" style="background:${colA}15;border:2px solid ${colA}44">
        <div style="font-size:22px;font-weight:900;color:${colA}">${stA.total}</div>
        <div style="font-size:var(--fs-sm);color:var(--text3)">\uCD1D \uC778\uC6D0</div>
        ${stA.wr!==null?`<div style="font-size:14px;font-weight:900;color:${stA.wr>=50?"#10b981":"#ef4444"};margin-top:4px">${stA.wr}% \uC2B9\uB960</div>`:""}
      </div>
      <div class="b2cv2-col" style="background:${colB}15;border:2px solid ${colB}44">
        <div style="font-size:22px;font-weight:900;color:${colB}">${stB.total}</div>
        <div style="font-size:var(--fs-sm);color:var(--text3)">\uCD1D \uC778\uC6D0</div>
        ${stB.wr!==null?`<div style="font-size:14px;font-weight:900;color:${stB.wr>=50?"#10b981":"#ef4444"};margin-top:4px">${stB.wr}% \uC2B9\uB960</div>`:""}
      </div>
    </div>`;{const totalAg=h2h.aw+h2hB.aw,aWpct=totalAg>0?Math.round(h2h.aw/totalAg*100):50,aWr=totalAg>0?Math.round(h2h.aw/totalAg*100):null,bWr=totalAg>0?Math.round(h2hB.aw/totalAg*100):null;totalAg>0?h+=`<div class="b2cv2-h2h">
          <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text3);margin-bottom:8px">\u2694\uFE0F \uC9C1\uC811 \uB9DE\uB300\uACB0 \uC804\uC801 <span style="font-size:10px;font-weight:600;color:var(--text3)">(\uCD1D ${totalAg}\uC804)</span></div>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px">
            <div style="text-align:right;min-width:70px">
              <div style="font-size:16px;font-weight:900;color:${colA}">${h2h.aw}\uC2B9 ${h2h.al}\uD328</div>
              ${aWr!==null?`<div style="font-size:var(--fs-caption);font-weight:800;color:${aWr>=50?colA:"var(--text3)"}">${aWr}%</div>`:""}
            </div>
            <div style="flex:1;height:14px;border-radius:7px;overflow:hidden;background:var(--border2);display:flex">
              <div style="width:${aWpct}%;background:${colA};height:100%;transition:width .6s ease"></div>
              <div style="width:${100-aWpct}%;background:${colB};height:100%;transition:width .6s ease"></div>
            </div>
            <div style="text-align:left;min-width:70px">
              <div style="font-size:16px;font-weight:900;color:${colB}">${h2hB.aw}\uC2B9 ${h2hB.al}\uD328</div>
              ${bWr!==null?`<div style="font-size:var(--fs-caption);font-weight:800;color:${bWr>=50?colB:"var(--text3)"}">${bWr}%</div>`:""}
            </div>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:var(--fs-caption)">
            <span style="color:${colA};font-weight:800">${_b2CompareA}</span>
            <span style="color:var(--text3)">${aWpct>50?_b2CompareA+"\uC774 \uC6B0\uC138":aWpct<50?_b2CompareB+"\uC774 \uC6B0\uC138":"\uADE0\uD615"}</span>
            <span style="color:${colB};font-weight:800">${_b2CompareB}</span>
          </div>
        </div>`:h+=`<div class="b2cv2-h2h" style="color:var(--text3);font-size:var(--fs-sm)">
          \u2694\uFE0F \uC9C1\uC811 \uB9DE\uB300\uACB0 \uAE30\uB85D \uC5C6\uC74C <span style="font-size:var(--fs-caption)">(\uACBD\uAE30 \uB370\uC774\uD130 \uB204\uC801 \uC2DC \uD45C\uC2DC)</span>
        </div>`}h+=`<div class="b2cv2-col" style="background:var(--surface);border:1px solid var(--border2);border-radius:14px;margin-bottom:12px;padding:14px">
      <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text3);margin-bottom:4px;text-align:center">\u{1F4E1} \uB2E4\uCC28\uC6D0 \uBE44\uAD50</div>
      ${radarChart(stA,stB)}
    </div>`,h+=`<div style="display:grid;grid-template-columns:1fr auto 1fr;gap:8px;align-items:center;padding:8px 0;border-bottom:2px solid var(--border2);margin-bottom:4px">
      <div style="text-align:right;font-size:14px;font-weight:900;color:${colA}">${_b2CompareA}</div>
      <div style="width:60px;text-align:center"></div>
      <div style="text-align:left;font-size:14px;font-weight:900;color:${colB}">${_b2CompareB}</div>
    </div>`,h+=compareRow("\uC120\uC218 \uC218",stA.tiered.length,stB.tiered.length),h+=compareRow("\uC9C1\uCC45\uC790",stA.roled.length,stB.roled.length),h+=compareRow("\uD1B5\uC0B0 \uACBD\uAE30",stA.tg,stB.tg),h+=compareRow("\uD1B5\uC0B0 \uC2B9",stA.tw,stB.tw),h+=compareRow(stA.wr!==null?`\uC2B9\uB960 (${stA.wr}%)`:"\uC2B9\uB960",(_c=stA.wr)!=null?_c:0,(_d=stB.wr)!=null?_d:0),h+=`<div style="text-align:center;font-size:10px;color:var(--text3);font-weight:700;margin:6px 0 2px">\u{1F3AE} \uC885\uC871 \uBD84\uD3EC (\uC804\uCCB4 ${stA.total}\uBA85 / ${stB.total}\uBA85 \uAE30\uC900)</div>`,h+=compareRow("\u{1F52E} \uD504\uB85C\uD1A0\uC2A4",stA.races.P,stB.races.P),h+=compareRow("\u2694\uFE0F \uD14C\uB780",stA.races.T,stB.races.T),h+=compareRow("\u{1F98E} \uC800\uADF8",stA.races.Z,stB.races.Z),(stA.races.N>0||stB.races.N>0)&&(h+=compareRow("\u2754 \uC885\uC871 \uBBF8\uC815",stA.races.N,stB.races.N)),h+=compareRow("\uCD5C\uC0C1\uC704 \uD2F0\uC5B4",stA.topTier,stB.topTier);const allTiers=[...new Set([...Object.keys(stA.tiers),...Object.keys(stB.tiers)])],sortedTiers=(typeof TIERS!="undefined"?TIERS.filter(t=>allTiers.includes(t)):[]).concat(allTiers.filter(t=>typeof TIERS=="undefined"||!TIERS.includes(t)));sortedTiers.length&&(h+='<div style="margin-top:12px;font-size:var(--fs-sm);font-weight:700;color:var(--text3);text-align:center;margin-bottom:8px">\uD2F0\uC5B4\uBCC4 \uBE44\uAD50</div>',sortedTiers.forEach(t=>{const nA=stA.tiers[t]||0,nB=stB.tiers[t]||0,col=typeof getTierBtnColor=="function"?getTierBtnColor(t):"#64748b",tcol=typeof getTierBtnTextColor=="function"&&getTierBtnTextColor(t)||"#fff",maxN=Math.max(nA,nB,1);h+=`<div style="display:grid;grid-template-columns:1fr 52px 1fr;gap:6px;align-items:center;margin-bottom:6px">
          <div style="display:flex;justify-content:flex-end">
            <div style="height:10px;width:${Math.round(nA/maxN*100)}%;max-width:100%;background:${nA>nB?colA:colA+"88"};border-radius:5px 0 0 5px;min-width:${nA?"8px":"0"}"></div>
          </div>
          <div style="text-align:center;font-size:var(--fs-caption);font-weight:800;padding:2px 6px;border-radius:8px;background:${col};color:${tcol}">${t}</div>
          <div>
            <div style="height:10px;width:${Math.round(nB/maxN*100)}%;max-width:100%;background:${nB>nA?colB:colB+"88"};border-radius:0 5px 5px 0;min-width:${nB?"8px":"0"}"></div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 52px 1fr;gap:6px;margin-bottom:4px">
          <div style="text-align:right;font-size:var(--fs-caption);color:${nA>nB?colA:"var(--text3)"};font-weight:${nA>nB?"800":"400"}">${nA?nA+"\uBA85":""}</div>
          <div></div>
          <div style="font-size:var(--fs-caption);color:${nB>nA?colB:"var(--text3)"};font-weight:${nB>nA?"800":"400"}">${nB?nB+"\uBA85":""}</div>
        </div>`}));const _sortPlayers=arr=>arr.slice().sort((a,b)=>{const ti=typeof TIERS!="undefined"?TIERS:[],ia=ti.indexOf(a.tier||""),ib=ti.indexOf(b.tier||"");return(ia>=0?ia:999)-(ib>=0?ib:999)||(a.name||"").localeCompare(b.name||"","ko",{sensitivity:"base"})}),_makePlayerList=(st,col)=>{const tieredHtml=_sortPlayers(st.tiered).map(p=>_b2NameTag(p,col,!0)).join(""),roledHtml=st.roled.length?`<div style="margin-top:6px;padding-top:6px;border-top:1px dashed var(--border2)">${st.roled.map(p=>_b2NameTag(p,col,!1)).join("")}</div>`:"";return tieredHtml+roledHtml};h+=`<div style="background:var(--surface);border:1px solid var(--border2);border-radius:14px;padding:12px;margin-top:14px">
      <div style="font-size:var(--fs-caption);font-weight:800;color:var(--text3);margin-bottom:10px;text-align:center">\u{1F465} \uC120\uC218 \uBA85\uB2E8 (\uD074\uB9AD\uD558\uC5EC \uC0C1\uC138 \uBCF4\uAE30)</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div>
          <div style="font-size:var(--fs-sm);font-weight:900;color:${colA};margin-bottom:6px;text-align:center;padding:4px 8px;background:${colA}14;border-radius:8px">${_b2CompareA} \xB7 ${stA.tiered.length}\uBA85</div>
          <div style="display:flex;flex-wrap:wrap;gap:2px">${_makePlayerList(stA,colA)}</div>
        </div>
        <div>
          <div style="font-size:var(--fs-sm);font-weight:900;color:${colB};margin-bottom:6px;text-align:center;padding:4px 8px;background:${colB}14;border-radius:8px">${_b2CompareB} \xB7 ${stB.tiered.length}\uBA85</div>
          <div style="display:flex;flex-wrap:wrap;gap:2px">${_makePlayerList(stB,colB)}</div>
        </div>
      </div>
    </div>`}return h+="</div>",h}window._b2HeatmapMode=window._b2HeatmapMode||"count",window._b2HeatmapSortRow=window._b2HeatmapSortRow||"name",window._b2HeatmapSortCol=window._b2HeatmapSortCol||"tier";

/* board2-heatmap-bubble.js */
function _b2HeatmapCloseAll(){try{document.querySelectorAll(".b2hm2-popup").forEach(p=>p.classList.remove("show"))}catch(e){}}function _b2HeatmapCellClick(el){try{if(!el||!el.dataset)return;const uid=el.dataset.hmUid||"",univName=el.dataset.hmUniv||"",tier=el.dataset.hmTier||"",color=el.dataset.hmColor||"#64748b";if(!uid||!univName||!tier)return;_b2HeatmapCloseAll(),typeof _b2HeatmapShowPopup=="function"&&_b2HeatmapShowPopup(uid,univName,tier,color)}catch(e){}}function _b2HeatmapTotalClick(el){try{if(!el||!el.dataset)return;const uid=el.dataset.hmUid||"",univName=el.dataset.hmUniv||"",color=el.dataset.hmColor||"#64748b";if(!uid||!univName)return;_b2HeatmapCloseAll(),typeof _b2HeatmapShowAllPopup=="function"&&_b2HeatmapShowAllPopup(uid,univName,color)}catch(e){}}function _b2HeatmapShowPopup(uid,univName,tier,color){try{const popup=document.getElementById(uid+"-popup"),header=document.getElementById(uid+"-popup-header"),body=document.getElementById(uid+"-popup-body");if(!popup||!body)return;const escH=typeof escHTML=="function"?escHTML:s=>String(s||""),escA=typeof escAttr=="function"?escAttr:s=>String(s||""),members=(Array.isArray(window.players)?window.players:[]).filter(p=>{const pu=String(p&&p.univ||"").trim(),pt=String(p&&p.tier||"\uBBF8\uC815");return pu===univName&&pt===tier&&!(p&&(p.hidden||p.retired||p.hideFromBoard))});if(!members.length)return;let tw=0,tl=0;members.forEach(p=>(Array.isArray(p&&p.history)?p.history:[]).forEach(h=>{h&&h.result==="\uC2B9"?tw++:h&&h.result==="\uD328"&&tl++}));const tg=tw+tl,wr=tg>0?Math.round(tw/tg*100):null,wrc=wr===null?"#94a3b8":wr>=60?"#10b981":wr>=40?"#f59e0b":"#ef4444",{fromN,toN}=_b2ThisWeekRange(),dNum=_b2DateNum;let ww=0,wl=0;members.forEach(p=>(Array.isArray(p&&p.history)?p.history:[]).forEach(h=>{const d=dNum(h&&(h.date||h.d||""));d>=fromN&&d<=toN&&(h&&h.result==="\uC2B9"?ww++:h&&h.result==="\uD328"&&wl++)}));const tierCol=typeof getTierBtnColor=="function"&&tier?getTierBtnColor(tier):"#64748b",tierTc=typeof getTierBtnTextColor=="function"&&tier&&getTierBtnTextColor(tier)||"#fff";header&&(header.innerHTML='<div style="display:flex;align-items:center;gap:10px"><div style="width:12px;height:12px;border-radius:50%;background:'+color+";flex-shrink:0;box-shadow:0 0 0 3px "+color+'30"></div><span style="font-size:16px;font-weight:900;color:'+color+';">'+escH(univName)+'</span><span style="font-size:var(--fs-sm);padding:3px 10px;border-radius:20px;background:'+tierCol+";color:"+tierTc+';font-weight:800;letter-spacing:.3px">'+escH(tier)+'</span><div style="margin-left:auto;text-align:right">'+(wr!==null?'<div style="font-size:var(--fs-lg);font-weight:900;color:'+wrc+'">'+wr+'%</div><div style="font-size:10px;color:var(--text3);">'+tw+"\uC2B9 "+tl+"\uD328</div>":'<div style="font-size:var(--fs-base);color:var(--text3)">\uAE30\uB85D \uC5C6\uC74C</div>')+"</div></div>");let bodyHtml="";bodyHtml+='<div class="b2hm2-stat-row"><div class="b2hm2-stat-box" style="background:'+color+"0d;border-color:"+color+'22"><div style="font-size:22px;font-weight:900;color:'+color+'">'+members.length+'</div><div style="font-size:10px;color:var(--text3);font-weight:700">\uCD1D \uC778\uC6D0</div></div>',tg>0&&(bodyHtml+='<div class="b2hm2-stat-box" style="background:'+wrc+"12;border-color:"+wrc+'30"><div style="font-size:22px;font-weight:900;color:'+wrc+'">'+wr+'%</div><div style="font-size:10px;color:var(--text3);font-weight:700">'+tw+"\uC2B9 "+tl+"\uD328</div></div>"),ww+wl>0&&(bodyHtml+='<div class="b2hm2-stat-box" style="background:#fff7ed;border-color:#fed7aa"><div style="font-size:20px;font-weight:900;color:#c2410c">\u{1F525} '+ww+'\uC2B9</div><div style="font-size:10px;color:#c2410c;font-weight:700">\uC774\uBC88\uC8FC '+wl+"\uD328</div></div>"),bodyHtml+="</div>",bodyHtml+='<div style="font-size:var(--fs-caption);font-weight:800;color:var(--text3);margin-bottom:10px;display:flex;align-items:center;gap:6px"><span style="width:20px;height:2px;background:var(--border2);display:inline-block;border-radius:1px"></span>'+members.length+'\uBA85<span style="flex:1;height:1px;background:var(--border2);display:inline-block;border-radius:1px"></span></div>',bodyHtml+='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(84px,1fr));gap:8px">',members.sort((a,b)=>String(a&&a.name||"").localeCompare(String(b&&b.name||""),"ko",{sensitivity:"base"})).forEach(p=>{const rIco=p&&p.race==="P"?"\u{1F52E}":p&&p.race==="T"?"\u2694\uFE0F":p&&p.race==="Z"?"\u{1F98E}":"",rawPhoto=p&&p.photo?typeof toThumbUrl=="function"?toThumbUrl(p.photo,84):p.photo:"",rawPhotoOrig=p&&p.photo?typeof toHttpsUrl=="function"?toHttpsUrl(p.photo):p.photo:"",safePhoto=rawPhoto?escA(rawPhoto):"",safePhotoOrig=rawPhotoOrig?escA(rawPhotoOrig):"",initials=String(p&&p.name||"?").slice(0,1);let pw=0,pl=0;(Array.isArray(p&&p.history)?p.history:[]).forEach(h=>{h&&h.result==="\uC2B9"?pw++:h&&h.result==="\uD328"&&pl++});const pg=pw+pl,pwr=pg>0?Math.round(pw/pg*100):null,pc=pwr===null?"#94a3b8":pwr>=60?"#10b981":pwr>=40?"#f59e0b":"#ef4444",safeNameAttr2=escA(p&&p.name||""),tierCol1=typeof getTierBtnColor=="function"&&p&&p.tier?getTierBtnColor(p.tier):"#64748b",tierTxt1=typeof getTierBtnTextColor=="function"&&p&&p.tier&&getTierBtnTextColor(p.tier)||"#fff";bodyHtml+='<div class="b2hm2-pcard" style="border-color:'+color+`55" onclick="openPlayerModal('`+safeNameAttr2.replace(/'/g,"\\'")+`')">`,safePhoto?bodyHtml+='<img class="b2hm2-pcard-photo" src="'+safePhoto+'" data-orig="'+safePhotoOrig+`" onerror="if(this.dataset.orig&&this.src!==this.dataset.orig){this.src=this.dataset.orig;}else{this.style.display='none';this.nextSibling.style.display='flex'}"><div class="b2hm2-pcard-avatar" style="display:none;background:linear-gradient(160deg,`+color+"44,"+color+"22);color:"+color+'">'+escH(initials)+"</div>":bodyHtml+='<div class="b2hm2-pcard-avatar" style="background:linear-gradient(160deg,'+color+"44,"+color+"22);color:"+color+'">'+escH(initials)+"</div>",bodyHtml+='<div class="b2hm2-pcard-info">',p&&p.tier&&(bodyHtml+='<span style="font-size:9px;font-weight:900;background:'+tierCol1+";color:"+tierTxt1+';border-radius:4px;padding:1px 5px;margin-bottom:2px;line-height:1.6">'+escH(p.tier)+"</span>"),bodyHtml+='<div class="b2hm2-pcard-name">'+escH(p&&p.name||"")+"</div>",bodyHtml+='<div class="b2hm2-pcard-sub">'+(rIco?"<span>"+rIco+"</span>":"")+(pwr!==null?'<span style="color:'+pc+';font-weight:900">'+pwr+"%</span>":"")+"</div>",bodyHtml+="</div>",bodyHtml+="</div>"}),bodyHtml+="</div>",body.innerHTML=bodyHtml,popup.classList.add("show")}catch(e){}}function _b2HeatmapShowAllPopup(uid,univName,color){try{const popup=document.getElementById(uid+"-popup"),header=document.getElementById(uid+"-popup-header"),body=document.getElementById(uid+"-popup-body");if(!popup||!body)return;const escH=typeof escHTML=="function"?escHTML:s=>String(s||""),escA=typeof escAttr=="function"?escAttr:s=>String(s||""),members=(Array.isArray(window.players)?window.players:[]).filter(p=>String(p&&p.univ||"").trim()===univName&&!(p&&(p.hidden||p.retired||p.hideFromBoard)));if(!members.length)return;let tw=0,tl=0;members.forEach(p=>(Array.isArray(p&&p.history)?p.history:[]).forEach(h=>{h&&h.result==="\uC2B9"?tw++:h&&h.result==="\uD328"&&tl++}));const tg=tw+tl,wr=tg>0?Math.round(tw/tg*100):null,wrc=wr===null?"#94a3b8":wr>=60?"#10b981":wr>=40?"#f59e0b":"#ef4444",{fromN,toN}=_b2ThisWeekRange(),dNum=_b2DateNum;let ww=0,wl=0;members.forEach(p=>(Array.isArray(p&&p.history)?p.history:[]).forEach(h=>{const d=dNum(h&&(h.date||h.d||""));d>=fromN&&d<=toN&&(h&&h.result==="\uC2B9"?ww++:h&&h.result==="\uD328"&&wl++)})),header&&(header.innerHTML='<div style="display:flex;align-items:center;gap:10px"><div style="width:12px;height:12px;border-radius:50%;background:'+color+";flex-shrink:0;box-shadow:0 0 0 3px "+color+'30"></div><span style="font-size:16px;font-weight:900;color:'+color+';">'+escH(univName)+'</span><div style="margin-left:auto;text-align:right">'+(wr!==null?'<div style="font-size:var(--fs-lg);font-weight:900;color:'+wrc+'">'+wr+'%</div><div style="font-size:10px;color:var(--text3);">'+tw+"\uC2B9 "+tl+"\uD328</div>":'<div style="font-size:var(--fs-base);color:var(--text3)">\uAE30\uB85D \uC5C6\uC74C</div>')+"</div></div>");let bodyHtml="";bodyHtml+='<div class="b2hm2-stat-row"><div class="b2hm2-stat-box" style="background:'+color+"0d;border-color:"+color+'22"><div style="font-size:22px;font-weight:900;color:'+color+'">'+members.length+'</div><div style="font-size:10px;color:var(--text3);font-weight:700">\uCD1D \uC778\uC6D0</div></div>',tg>0&&(bodyHtml+='<div class="b2hm2-stat-box" style="background:'+wrc+"12;border-color:"+wrc+'30"><div style="font-size:22px;font-weight:900;color:'+wrc+'">'+wr+'%</div><div style="font-size:10px;color:var(--text3);font-weight:700">'+tw+"\uC2B9 "+tl+"\uD328</div></div>"),ww+wl>0&&(bodyHtml+='<div class="b2hm2-stat-box" style="background:#fff7ed;border-color:#fed7aa"><div style="font-size:20px;font-weight:900;color:#c2410c">\u{1F525} '+ww+'\uC2B9</div><div style="font-size:10px;color:#c2410c;font-weight:700">\uC774\uBC88\uC8FC '+wl+"\uD328</div></div>"),bodyHtml+="</div>",bodyHtml+='<div style="font-size:var(--fs-caption);font-weight:800;color:var(--text3);margin-bottom:10px;display:flex;align-items:center;gap:6px"><span style="width:20px;height:2px;background:var(--border2);display:inline-block;border-radius:1px"></span>'+members.length+'\uBA85<span style="flex:1;height:1px;background:var(--border2);display:inline-block;border-radius:1px"></span></div>',bodyHtml+='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(84px,1fr));gap:8px">',members.sort((a,b)=>String(a&&a.name||"").localeCompare(String(b&&b.name||""),"ko",{sensitivity:"base"})).forEach(p=>{const rIco=p&&p.race==="P"?"\u{1F52E}":p&&p.race==="T"?"\u2694\uFE0F":p&&p.race==="Z"?"\u{1F98E}":"",rawPhoto=p&&p.photo?typeof toThumbUrl=="function"?toThumbUrl(p.photo,84):p.photo:"",rawPhotoOrig=p&&p.photo?typeof toHttpsUrl=="function"?toHttpsUrl(p.photo):p.photo:"",safePhoto=rawPhoto?escA(rawPhoto):"",safePhotoOrig=rawPhotoOrig?escA(rawPhotoOrig):"",initials=String(p&&p.name||"?").slice(0,1),pColor=(typeof gc=="function"?gc(p&&p.univ):null)||color;let pw=0,pl=0;(Array.isArray(p&&p.history)?p.history:[]).forEach(h=>{h&&h.result==="\uC2B9"?pw++:h&&h.result==="\uD328"&&pl++});const pg=pw+pl,pwr=pg>0?Math.round(pw/pg*100):null,pc=pwr===null?"#94a3b8":pwr>=60?"#10b981":pwr>=40?"#f59e0b":"#ef4444",safeNameAttr2=escA(p&&p.name||""),tierCol2=typeof getTierBtnColor=="function"&&p&&p.tier?getTierBtnColor(p.tier):"#64748b",tierTxt2=typeof getTierBtnTextColor=="function"&&p&&p.tier&&getTierBtnTextColor(p.tier)||"#fff";bodyHtml+='<div class="b2hm2-pcard" style="border-color:'+pColor+`55" onclick="openPlayerModal('`+safeNameAttr.replace(/'/g,"\\'")+`')">`,safePhoto?bodyHtml+='<img class="b2hm2-pcard-photo" src="'+safePhoto+'" data-orig="'+safePhotoOrig+`" onerror="if(this.dataset.orig&&this.src!==this.dataset.orig){this.src=this.dataset.orig;}else{this.style.display='none';this.nextSibling.style.display='flex'}"><div class="b2hm2-pcard-avatar" style="display:none;background:linear-gradient(160deg,`+pColor+"44,"+pColor+"22);color:"+pColor+'">'+escH(initials)+"</div>":bodyHtml+='<div class="b2hm2-pcard-avatar" style="background:linear-gradient(160deg,'+pColor+"44,"+pColor+"22);color:"+pColor+'">'+escH(initials)+"</div>",bodyHtml+='<div class="b2hm2-pcard-info">',p&&p.tier&&(bodyHtml+='<span style="font-size:9px;font-weight:900;background:'+tierCol2+";color:"+tierTxt2+';border-radius:4px;padding:1px 5px;margin-bottom:2px;line-height:1.6">'+escH(p.tier)+"</span>"),bodyHtml+='<div class="b2hm2-pcard-name">'+escH(p&&p.name||"")+"</div>",bodyHtml+='<div class="b2hm2-pcard-sub">'+(rIco?"<span>"+rIco+"</span>":"")+(pwr!==null?'<span style="color:'+pc+';font-weight:900">'+pwr+"%</span>":"")+"</div>",bodyHtml+="</div>",bodyHtml+="</div>"}),bodyHtml+="</div>",body.innerHTML=bodyHtml,popup.classList.add("show")}catch(e){}}function _b2HeatmapView(){const hmUid="hm_"+Math.random().toString(36).slice(2,7),_dissSet=new Set((typeof univCfg!="undefined"?univCfg:[]).filter(u=>u.dissolved||u.hidden).map(u=>String(u.name||"").trim())),univList=(_b2VisUnivs?_b2VisUnivs():[]).filter(u=>u.name&&u.name!=="\uBB34\uC18C\uC18D"),vis=players.filter(p=>!p.hidden&&!p.retired&&!p.hideFromBoard&&!_dissSet.has(String((p==null?void 0:p.univ)||"").trim())),TIERS_LOCAL=typeof TIERS!="undefined"?TIERS:[],mode=window._b2HeatmapMode||"count",sortRow=window._b2HeatmapSortRow||"name",sortCol=window._b2HeatmapSortCol||"tier",usedTiers=[...new Set(vis.map(p=>p.tier||"\uBBF8\uC815"))];let orderedTiers=TIERS_LOCAL.filter(t=>usedTiers.includes(t)).concat(usedTiers.filter(t=>!TIERS_LOCAL.includes(t)));const cellData={};univList.forEach(u=>{cellData[u.name]={}}),vis.forEach(p=>{const u=String((p==null?void 0:p.univ)||"").trim(),t=p.tier||"\uBBF8\uC815";cellData[u]||(cellData[u]={}),cellData[u][t]||(cellData[u][t]={count:0,wins:0,losses:0}),cellData[u][t].count++,(Array.isArray(p.history)?p.history:[]).forEach(h2=>{h2.result==="\uC2B9"?cellData[u][t].wins++:h2.result==="\uD328"&&cellData[u][t].losses++})});const univTotals={};univList.forEach(u=>{let cnt=0,w=0,l=0;orderedTiers.forEach(t=>{var _a;const c=(_a=cellData[u.name])==null?void 0:_a[t];c&&(cnt+=c.count,w+=c.wins,l+=c.losses)}),univTotals[u.name]={count:cnt,wins:w,losses:l,wr:w+l>0?Math.round(w/(w+l)*100):null}});const tierTotals={};orderedTiers.forEach(t=>{let cnt=0,w=0,l=0;univList.forEach(u=>{var _a;const c=(_a=cellData[u.name])==null?void 0:_a[t];c&&(cnt+=c.count,w+=c.wins,l+=c.losses)}),tierTotals[t]={count:cnt,wins:w,losses:l,wr:w+l>0?Math.round(w/(w+l)*100):null}});let sortedUnivs=[...univList];sortRow==="name"&&sortedUnivs.sort((a,b)=>(a.name||"").localeCompare(b.name||"","ko")),sortRow==="count"&&sortedUnivs.sort((a,b)=>{var _a,_b;return(((_a=univTotals[b.name])==null?void 0:_a.count)||0)-(((_b=univTotals[a.name])==null?void 0:_b.count)||0)}),sortRow==="wr"&&sortedUnivs.sort((a,b)=>{var _a,_b,_c,_d;return((_b=(_a=univTotals[b.name])==null?void 0:_a.wr)!=null?_b:-1)-((_d=(_c=univTotals[a.name])==null?void 0:_c.wr)!=null?_d:-1)});let sortedTiers=[...orderedTiers];sortCol==="count"&&sortedTiers.sort((a,b)=>{var _a,_b;return(((_a=tierTotals[b])==null?void 0:_a.count)||0)-(((_b=tierTotals[a])==null?void 0:_b.count)||0)}),sortCol==="wr"&&sortedTiers.sort((a,b)=>{var _a,_b,_c,_d;return((_b=(_a=tierTotals[b])==null?void 0:_a.wr)!=null?_b:-1)-((_d=(_c=tierTotals[a])==null?void 0:_c.wr)!=null?_d:-1)});const _hexToRgb=hex=>{const h2=String(hex||"").trim().replace("#","");if(h2.length===3){const r=parseInt(h2[0]+h2[0],16),g=parseInt(h2[1]+h2[1],16),b=parseInt(h2[2]+h2[2],16);return[r,g,b].some(x=>isNaN(x))?null:{r,g,b}}if(h2.length>=6){const r=parseInt(h2.slice(0,2),16),g=parseInt(h2.slice(2,4),16),b=parseInt(h2.slice(4,6),16);return[r,g,b].some(x=>isNaN(x))?null:{r,g,b}}return null},heatColor=(val,max,baseHex)=>{if(!val||max===0)return"transparent";const t=val/max;if(mode==="count"){const rgb=_hexToRgb(baseHex)||_hexToRgb("#3b82f6")||{r:59,g:130,b:246},a=Math.min(.92,Math.max(.12,t*.78+.12));return`rgba(${rgb.r},${rgb.g},${rgb.b},${a.toFixed(2)})`}else{const r=val<50?255:Math.round(255*(1-(val-50)/50)),g=val>50?255:Math.round(255*(val/50));return`rgba(${r},${g},80,0.55)`}},textColor=(val,max)=>!val||max===0?"var(--text3)":val/max>.55?"#fff":"var(--text1)",maxCount=Math.max(1,...univList.flatMap(u=>orderedTiers.map(t=>{var _a,_b;return((_b=(_a=cellData[u.name])==null?void 0:_a[t])==null?void 0:_b.count)||0}))),modeBtns=[{key:"count",label:"\u{1F465} \uC778\uC6D0\uC218"},{key:"wr",label:"\u{1F4C8} \uC2B9\uB960"}];let h=`<style>
    .b2hm2-wrap { overflow-x:auto; }
    .b2hm2-ctrl { display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:12px;padding:10px 12px;background:var(--surface);border:1px solid var(--border2);border-radius:12px }
    .b2hm2-ctrl-group { display:flex;gap:4px;align-items:center;flex-wrap:wrap }
    .b2hm2-lbl { font-size:var(--fs-caption);font-weight:800;color:var(--text3);margin-right:2px }
    .b2hm2-btn { padding:4px 10px;border-radius:8px;border:1.5px solid var(--border2);background:var(--white);font-size:var(--fs-caption);font-weight:700;color:var(--text2);cursor:pointer;transition:all .12s;user-select:none }
    .b2hm2-btn.on { background:var(--text1);color:var(--white);border-color:var(--text1);box-shadow:inset 0 2px 4px rgba(0,0,0,.25) }
    .b2hm2-btn:not(.on):hover { border-color:var(--text1);color:var(--text1) }
    .b2hm2-btn:not(.on):active { background:var(--border2);transform:scale(.97) }
    .b2hm2-sel { padding:4px 10px;border-radius:8px;border:1.5px solid var(--border2);background:var(--white);font-size:var(--fs-caption);font-weight:700;color:var(--text2);cursor:pointer; }
    .b2hm2-sep { width:1px;height:22px;background:var(--border2);margin:0 4px }
    .b2hm2-tbl { border-collapse:separate;border-spacing:3px;min-width:100% }
    .b2hm2-tbl th { font-size:10px;font-weight:800;color:var(--text3);padding:4px 6px;text-align:center;white-space:nowrap;position:sticky }
    .b2hm2-tbl th.row-head { text-align:left;left:0;top:0;z-index:4;background:var(--bg) }
    .b2hm2-tbl th.col-head { top:0;z-index:2;background:var(--bg) }
    .b2hm2-tbl td { border-radius:8px;text-align:center;font-size:var(--fs-caption);font-weight:800;padding:6px 4px;min-width:44px;cursor:pointer;position:relative;transition:none }
    .b2hm2-popup { display:none;position:fixed;inset:0;z-index:9999;align-items:center;justify-content:center;background:rgba(0,0,0,.55);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px) }
    .b2hm2-popup.show { display:flex }
    .b2hm2-popup-inner { background:var(--white);border-radius:22px;padding:0;max-width:400px;width:92%;max-height:85vh;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 24px 72px rgba(0,0,0,.28),0 0 0 1px rgba(0,0,0,.06);position:relative;animation:b2hmIn .22s cubic-bezier(.34,1.56,.64,1) }
    .b2hm2-popup-header { padding:18px 20px 14px;border-bottom:1px solid var(--border2);flex-shrink:0;background:var(--surface) }
    .b2hm2-popup-body { padding:16px 20px 20px;overflow-y:auto;flex:1 }
    @keyframes b2hmIn { from{opacity:0;transform:scale(.88) translateY(16px)} to{opacity:1;transform:none} }
    .b2hm2-popup-close { position:absolute;top:14px;right:16px;background:var(--border2);border:none;width:28px;height:28px;border-radius:50%;font-size:14px;cursor:pointer;color:var(--text2);display:flex;align-items:center;justify-content:center;transition:all .15s;z-index:2 }
    .b2hm2-popup-close:hover { background:var(--text1);color:#fff }
    .b2hm2-pcard { display:flex;flex-direction:column;align-items:center;gap:0;padding:0;border-radius:14px;border:1.5px solid transparent;text-align:center;transition:all .18s;cursor:pointer;overflow:hidden;position:relative }
    .b2hm2-pcard:hover { border-color:var(--border2);box-shadow:0 4px 16px rgba(0,0,0,.14);transform:translateY(-2px) scale(1.03) }
    .b2hm2-pcard-photo { width:100%;aspect-ratio:3/4;object-fit:cover;object-position:center top;flex-shrink:0;display:block }
    .b2hm2-pcard-avatar { width:100%;aspect-ratio:3/4;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:900;flex-shrink:0 }
    .b2hm2-pcard-info { position:absolute;bottom:0;left:0;right:0;padding:18px 6px 7px;background:linear-gradient(transparent,rgba(0,0,0,.78));display:flex;flex-direction:column;gap:2px;align-items:center }
    .b2hm2-pcard-name { font-size:var(--fs-caption);font-weight:900;line-height:1.2;color:#fff;text-shadow:0 1px 4px rgba(0,0,0,.5) }
    .b2hm2-pcard-sub { font-size:10px;color:rgba(255,255,255,.8);display:flex;align-items:center;gap:3px;flex-wrap:wrap;justify-content:center }
    .b2hm2-stat-row { display:flex;gap:8px;margin-bottom:12px }
    .b2hm2-stat-box { flex:1;padding:10px 8px;border-radius:12px;text-align:center;border:1.5px solid transparent }
    .b2hm2-week-badge { display:inline-flex;align-items:center;gap:5px;padding:5px 12px;border-radius:20px;background:#fff7ed;border:1px solid #fed7aa;font-size:var(--fs-caption);font-weight:800;color:#c2410c;margin-bottom:12px }
    .b2hm2-tbl td:hover { filter:none;box-shadow:none; }
    .b2hm2-tbl tr:hover td { filter:none; box-shadow:none; }
    .b2hm2-tbl td.univ-name { text-align:left;font-size:var(--fs-caption);font-weight:800;padding:4px 8px;white-space:nowrap;background:var(--bg);color:var(--text1);position:sticky;left:0;z-index:2;min-width:72px }
    .b2hm2-tbl td.total-cell { background:var(--surface);border:1px solid var(--border2);font-weight:900 }
    .b2hm2-legend { display:flex;align-items:center;gap:6px;margin-top:8px;font-size:var(--fs-caption);color:var(--text3) }
    .b2hm2-legend-bar { height:12px;width:120px;border-radius:6px }
    .b2hm2-empty { font-size:var(--fs-caption);color:var(--text3);padding:2px 4px }
  </style>`;h+=`<div class="b2hm2-ctrl">
    <div class="b2hm2-ctrl-group">
      <span class="b2hm2-lbl">\uD45C\uC2DC:</span>
      ${modeBtns.map(b=>`<button class="b2hm2-btn${mode===b.key?" on":""}" onclick="window._b2HeatmapMode='${b.key}';render()">${b.label}</button>`).join("")}
    </div>
    <div class="b2hm2-sep"></div>
    <div class="b2hm2-ctrl-group">
      <span class="b2hm2-lbl">\uD589 \uC815\uB82C:</span>
      <select class="b2hm2-sel" onchange="window._b2HeatmapSortRow=this.value;render()">
        <option value="name"${sortRow==="name"?" selected":""}>\u{1F524} \uC774\uB984</option>
        <option value="count"${sortRow==="count"?" selected":""}>\u{1F465} \uC778\uC6D0</option>
        <option value="wr"${sortRow==="wr"?" selected":""}>\u{1F4C8} \uC2B9\uB960</option>
      </select>
    </div>
    <div class="b2hm2-sep"></div>
    <div class="b2hm2-ctrl-group">
      <span class="b2hm2-lbl">\uC5F4 \uC815\uB82C:</span>
      <select class="b2hm2-sel" onchange="window._b2HeatmapSortCol=this.value;render()">
        <option value="tier"${sortCol==="tier"?" selected":""}>\u{1F3C5} \uD2F0\uC5B4</option>
        <option value="count"${sortCol==="count"?" selected":""}>\u{1F465} \uC778\uC6D0</option>
        <option value="wr"${sortCol==="wr"?" selected":""}>\u{1F4C8} \uC2B9\uB960</option>
      </select>
    </div>
  </div>`,h+='<div class="b2hm2-wrap"><table class="b2hm2-tbl">';const maxWr=100;h+=`<thead><tr>
    <th class="row-head col-head">\uB300\uD559 \\ \uD2F0\uC5B4</th>
    ${sortedTiers.map(t=>{const col=typeof getTierBtnColor=="function"?getTierBtnColor(t):"#64748b",tcol=typeof getTierBtnTextColor=="function"&&getTierBtnTextColor(t)||"#fff",tot=tierTotals[t],sub=mode==="count"?`${tot.count}\uBA85`:tot.wr!==null?`${tot.wr}%`:"-";return`<th class="col-head"><div style="display:flex;flex-direction:column;align-items:center;gap:2px">
        <span style="padding:2px 8px;border-radius:6px;background:${col};color:${tcol}">${t}</span>
        <span style="font-size:9px;font-weight:700;color:var(--text3)">${sub}</span>
      </div></th>`}).join("")}
    <th class="col-head" style="border-left:2px solid var(--border2)">\uD569\uACC4</th>
  </tr></thead><tbody>`,sortedUnivs.forEach(u=>{const color=gc&&gc(u.name)||"#64748b",tot=univTotals[u.name];tot.count&&(h+=`<tr>
      <td class="univ-name" style="border-left:3px solid ${color};background:var(--bg) !important">
        <span style="color:${color}">${u.name}</span>
        <div style="font-size:9px;color:var(--text3);font-weight:600">${mode==="count"?`${tot.count}\uBA85`:tot.wr!==null?`${tot.wr}%`:"-"}</div>
      </td>
      ${sortedTiers.map(t=>{var _a;const c=(_a=cellData[u.name])==null?void 0:_a[t];if(!c||!c.count)return'<td style="background:var(--bg) !important"><span class="b2hm2-empty">-</span></td>';const val=mode==="count"?c.count:c.wins+c.losses>0?Math.round(c.wins/(c.wins+c.losses)*100):0,max=mode==="count"?maxCount:100;let bg=heatColor(val,max,color),fc=textColor(val,max);const label=mode==="count"?`${c.count}\uBA85`:`${val}%`,sub=mode==="wr"?`${c.wins}\uC2B9${c.losses}\uD328`:"",_au=typeof escAttr=="function"?escAttr:s=>String(s||"").replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;"),games=(c.wins||0)+(c.losses||0);return mode==="wr"&&games>0&&games<5&&(bg="rgba(148,163,184,0.16)",fc="var(--text3)"),`<td style="background:${bg} !important;color:${fc}" title="${u.name} / ${t}: ${c.count}\uBA85 ${c.wins}\uC2B9 ${c.losses}\uD328" data-hm-uid="${hmUid}" data-hm-univ="${_au(u.name)}" data-hm-tier="${_au(t)}" data-hm-color="${_au(color)}" onclick="_b2HeatmapCellClick(this)">
          <div style="font-size:var(--fs-sm);font-weight:900">${label}</div>
          ${sub?`<div style="font-size:9px;opacity:.8">${sub}</div>`:""}
        </td>`}).join("")}
      <td class="total-cell" style="background:var(--surface) !important;color:${color}; cursor: pointer;" data-hm-uid="${hmUid}" data-hm-univ="${typeof escAttr=="function"?escAttr(u.name):String(u.name||"").replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}" data-hm-color="${typeof escAttr=="function"?escAttr(color):String(color||"").replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}" onclick="_b2HeatmapTotalClick(this)">
        <div>${mode==="count"?`${tot.count}\uBA85`:tot.wr!==null?`${tot.wr}%`:"-"}</div>
        ${mode==="wr"?`<div style="font-size:9px;color:var(--text3)">${tot.wins}\uC2B9${tot.losses}\uD328</div>`:`<div style="font-size:9px;color:var(--text3)">${tot.wins}\uC2B9${tot.losses}\uD328</div>`}
      </td>
    </tr>`)});const grandW=Object.values(univTotals).reduce((s,u)=>s+u.wins,0),grandL=Object.values(univTotals).reduce((s,u)=>s+u.losses,0),grandG=grandW+grandL,grandWr=grandG>0?Math.round(grandW/grandG*100):null;return h+=`<tr style="border-top:2px solid var(--border2)">
    <td class="univ-name" style="background:var(--surface) !important;font-weight:900;color:var(--text1)">\uD569\uACC4</td>
    ${sortedTiers.map(t=>{var _a;const tot=tierTotals[t],val=mode==="count"?tot.count:(_a=tot.wr)!=null?_a:0;return`<td style="background:var(--surface);font-weight:900;color:var(--text2)">
        <div>${mode==="count"?`${tot.count}\uBA85`:tot.wr!==null?`${tot.wr}%`:"-"}</div>
        <div style="font-size:9px;color:var(--text3)">${tot.wins}\uC2B9${tot.losses}\uD328</div>
      </td>`}).join("")}
    <td class="total-cell" style="background:var(--surface) !important;font-weight:900;color:var(--text1)">
      <div>${mode==="count"?`${vis.length}\uBA85`:grandWr!==null?`${grandWr}%`:"-"}</div>
      <div style="font-size:9px;color:var(--text3)">${grandW}\uC2B9${grandL}\uD328</div>
    </td>
  </tr>`,h+="</tbody></table></div>",h+=`<div id="${hmUid}-popup" class="b2hm2-popup" onclick="if(event.target===this)this.classList.remove('show')">
    <div class="b2hm2-popup-inner">
      <button class="b2hm2-popup-close" onclick="document.getElementById('${hmUid}-popup').classList.remove('show')">\u2715</button>
      <div id="${hmUid}-popup-header" class="b2hm2-popup-header"></div>
      <div id="${hmUid}-popup-body" class="b2hm2-popup-body"></div>
    </div>
  </div>`,mode==="count"?h+=`<div class="b2hm2-legend">
      <span>\uC801\uC74C</span>
      <div class="b2hm2-legend-bar" style="background:linear-gradient(90deg,rgba(59,130,246,.12),rgba(59,130,246,.9))"></div>
      <span>\uB9CE\uC74C</span>
    </div>`:h+=`<div class="b2hm2-legend">
      <span>0%</span>
      <div class="b2hm2-legend-bar" style="background:linear-gradient(90deg,rgba(255,80,80,.55),rgba(255,255,80,.4),rgba(80,255,80,.55))"></div>
      <span>100%</span>
    </div>`,h}function _b2BubbleView(){const _dissSet=new Set((typeof univCfg!="undefined"?univCfg:[]).filter(u=>u.dissolved||u.hidden).map(u=>String(u.name||"").trim())),univList=(_b2VisUnivs?_b2VisUnivs():[]).filter(u=>u.name&&u.name!=="\uBB34\uC18C\uC18D"),tieredVis=players.filter(p=>!p.hidden&&!p.retired&&!p.hideFromBoard&&!_dissSet.has(String((p==null?void 0:p.univ)||"").trim())&&!_B2_ROLE_ORDER.includes(p.role||"")),univData=univList.map(u=>{var _a;const members=tieredVis.filter(p=>String((p==null?void 0:p.univ)||"").trim()===u.name),P=members.filter(p=>p.race==="P").length,T=members.filter(p=>p.race==="T").length,Z=members.filter(p=>p.race==="Z").length,color=gc(u.name)||"#64748b";let wins=0,losses=0;members.forEach(p=>{(Array.isArray(p.history)?p.history:[]).forEach(h=>{h.result==="\uC2B9"?wins++:h.result==="\uD328"&&losses++})});const games=wins+losses,wr=games>0?Math.round(wins/games*100):null,{fromN,toN}=_b2ThisWeekRange();let weekActive=0;members.forEach(p=>{(Array.isArray(p.history)?p.history:[]).filter(h=>{const dn=_b2DateNum(h.date||h.d||"");return dn>=fromN&&dn<=toN}).length>0&&weekActive++});const TIERS_LOCAL=typeof TIERS!="undefined"?TIERS:[],topTier=((_a=members.slice().sort((a,b)=>{const ia=TIERS_LOCAL.indexOf(a.tier||""),ib=TIERS_LOCAL.indexOf(b.tier||"");return(ia>=0?ia:999)-(ib>=0?ib:999)})[0])==null?void 0:_a.tier)||null,topTierCol=typeof getTierBtnColor=="function"&&topTier?getTierBtnColor(topTier):"#94a3b8",topTierTc=typeof getTierBtnTextColor=="function"&&topTier&&getTierBtnTextColor(topTier)||"#fff";return{name:u.name,total:members.length,P,T,Z,color,wins,losses,games,wr,weekActive,topTier,topTierCol,topTierTc}}).filter(u=>u.total>0).sort((a,b)=>b.total-a.total),dataJson=JSON.stringify(univData),uid="bbl_"+Math.random().toString(36).slice(2,8);return`<style>
    #${uid}-wrap { position:relative; }
    #${uid}-canvas { display:block; width:100%; cursor:pointer; border-radius:12px; }
    #${uid}-tooltip { position:absolute; pointer-events:none; opacity:0; background:var(--white); border:1px solid var(--border2); border-radius:14px; padding:14px 16px; box-shadow:0 8px 32px #0003; transition:opacity .15s ease; min-width:180px; z-index:var(--z-dropdown,100); }
    #${uid}-legend { display:flex; flex-wrap:wrap; gap:6px; margin-top:10px; }
    .${uid}-sort-btn { padding:5px 12px; border-radius:20px; border:1.5px solid var(--border2); background:var(--surface); font-size:var(--fs-sm); font-weight:700; color:var(--text2); cursor:pointer; transition:all .15s; }
    .${uid}-sort-btn.on { background:var(--text1); color:var(--white); border-color:var(--text1); }
    .${uid}-sort-btn:hover:not(.on) { border-color:var(--text2); }
    #${uid}-popup { display:none; position:fixed; inset:0; z-index:999; align-items:center; justify-content:center; background:rgba(0,0,0,.45); }
    #${uid}-popup.show { display:flex; }
    #${uid}-popup-inner { background:var(--white); border-radius:20px; padding:24px; max-width:340px; width:90%; box-shadow:0 20px 60px #0005; position:relative; animation:b2bblIn .25s ease; }
    @keyframes b2bblIn { from{opacity:0;transform:scale(.92) translateY(12px)} to{opacity:1;transform:none} }
    #${uid}-popup-close { position:absolute;top:14px;right:14px;background:none;border:none;font-size:var(--fs-lg);cursor:pointer;color:var(--text3);line-height:1 }
    #${uid}-popup-close:hover { color:var(--text1) }
  </style>
  <div id="${uid}-wrap">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;flex-wrap:wrap">
      <span style="font-size:var(--fs-base);font-weight:900;color:var(--text1)">\u{1F310} \uB300\uD559\uBCC4 \uBC84\uBE14\uB9F5</span>
      <span style="font-size:var(--fs-sm);color:var(--text3)">\uBC84\uBE14 \uD06C\uAE30 = \uC778\uC6D0 \xB7 \uD30C\uC774 = \uC885\uC871 \uBE44\uC728</span>
      <div style="margin-left:auto;display:flex;gap:4px;flex-wrap:wrap">
        <button class="${uid}-sort-btn on" onclick="_${uid}setSort('total',this)">\uC778\uC6D0\uC21C</button>
        <button class="${uid}-sort-btn" onclick="_${uid}setSort('wr',this)">\uC2B9\uB960\uC21C</button>
        <button class="${uid}-sort-btn" onclick="_${uid}setSort('P',this)">P\uBE44\uC728</button>
        <button class="${uid}-sort-btn" onclick="_${uid}setSort('T',this)">T\uBE44\uC728</button>
        <button class="${uid}-sort-btn" onclick="_${uid}setSort('Z',this)">Z\uBE44\uC728</button>
      </div>
    </div>
    <canvas id="${uid}-canvas"></canvas>
    <div id="${uid}-tooltip"></div>
    <div id="${uid}-legend"></div>
  </div>

  <!-- \uD074\uB9AD \uC0C1\uC138 \uD31D\uC5C5 -->
  <div id="${uid}-popup" onclick="if(event.target===this)this.classList.remove('show')">
    <div id="${uid}-popup-inner">
      <button id="${uid}-popup-close" onclick="document.getElementById('${uid}-popup').classList.remove('show')">\u2715</button>
      <div id="${uid}-popup-body"></div>
    </div>
  </div>

  <script>
  (function(){
    const RAW = ${dataJson};
    const RACE_COLS = { P:'#7c3aed', T:'#0284c7', Z:'#059669', '?':'#94a3b8' };
    let sortKey = 'total';
    let hovIdx  = -1;
    let bubbles = [];
    let animProgress = 0;
    let animId = null;
    const canvas  = document.getElementById('${uid}-canvas');
    const ttip    = document.getElementById('${uid}-tooltip');
    const legendEl= document.getElementById('${uid}-legend');
    const popup   = document.getElementById('${uid}-popup');
    const popBody = document.getElementById('${uid}-popup-body');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function sortedData() {
      return [...RAW].sort((a,b) => {
        if (sortKey === 'total') return b.total - a.total;
        if (sortKey === 'wr')   return (b.wr??-1) - (a.wr??-1);
        const ra = a.total>0?a[sortKey]/a.total:0, rb = b.total>0?b[sortKey]/b.total:0;
        return rb - ra;
      });
    }

    function layout() {
      const W = canvas.parentElement.offsetWidth || 700;
      const data = sortedData();
      const n = data.length;
      if (!n) return [];
      const maxT = Math.max(...data.map(d=>d.total), 1);
      const minR = 18, maxR = Math.max(44, Math.min(72, W/(Math.sqrt(n)*2.2)));
      const cols = Math.max(3, Math.min(8, Math.floor(W/(maxR*2.4))));
      const cellW = W/cols, cellH = maxR*2.6;
      const H = Math.ceil(n/cols)*cellH + 20;
      canvas.width  = W*devicePixelRatio;
      canvas.height = H*devicePixelRatio;
      canvas.style.height = H+'px';
      ctx.setTransform(1,0,0,1,0,0);
      ctx.scale(devicePixelRatio, devicePixelRatio);
      return data.map((d,i) => {
        const col=i%cols, row=Math.floor(i/cols);
        const cx=cellW*col+cellW/2, cy=row*cellH+cellH/2+10;
        const r=minR+(d.total/maxT)*(maxR-minR);
        return {...d, cx, cy, r, idx:i};
      });
    }

    function easeOut(t){ return 1-(1-t)*(1-t)*(1-t); }

    function drawPie(bbl, scale) {
      const {cx,cy,r,P,T,Z,total,color} = bbl;
      const rr = r*scale;
      const segs=[{val:P,col:RACE_COLS.P},{val:T,col:RACE_COLS.T},{val:Z,col:RACE_COLS.Z},{val:total-P-T-Z,col:RACE_COLS['?']}].filter(s=>s.val>0);
      if (!segs.length) {
        ctx.beginPath(); ctx.arc(cx,cy,rr,0,Math.PI*2);
        ctx.fillStyle=color+'44'; ctx.fill(); return;
      }
      let angle=-Math.PI/2;
      segs.forEach(seg=>{
        const slice=(seg.val/total)*Math.PI*2;
        ctx.beginPath(); ctx.moveTo(cx,cy); ctx.arc(cx,cy,rr,angle,angle+slice); ctx.closePath();
        ctx.fillStyle=seg.col; ctx.fill();
        angle+=slice;
      });
      ctx.beginPath(); ctx.arc(cx,cy,rr,0,Math.PI*2);
      ctx.strokeStyle='rgba(255,255,255,0.55)'; ctx.lineWidth=2.5; ctx.stroke();
    }

    function drawLabel(bbl, isHov, scale) {
      const {cx,cy,r,name,total,wr} = bbl;
      const rr=r*scale;
      ctx.save();
      if (isHov) {
        ctx.beginPath(); ctx.arc(cx,cy,rr+5,0,Math.PI*2);
        ctx.strokeStyle='rgba(0,0,0,0.3)'; ctx.lineWidth=2.5; ctx.stroke();
        // \uAE00\uB85C\uC6B0
        ctx.shadowColor=bbl.color; ctx.shadowBlur=14;
        ctx.beginPath(); ctx.arc(cx,cy,rr,0,Math.PI*2);
        ctx.strokeStyle=bbl.color+'88'; ctx.lineWidth=2; ctx.stroke();
        ctx.shadowBlur=0;
      }
      const fs=Math.max(9,Math.min(12,rr*0.28));
      const shortName=name.length>5?name.slice(0,5)+'\u2026':name;
      ctx.font=\`bold \${fs}px sans-serif\`; ctx.textAlign='center';
      ctx.fillStyle='var(--text2,#334155)';
      ctx.fillText(shortName,cx,cy+rr+fs+2);
      ctx.font=\`900 \${Math.max(10,Math.min(16,rr*0.38))}px sans-serif\`;
      ctx.fillStyle='#fff'; ctx.shadowColor='rgba(0,0,0,0.4)'; ctx.shadowBlur=3;
      ctx.fillText(total,cx,cy+(wr!==null?-4:4));
      ctx.shadowBlur=0;
      if (wr!==null && rr>22) {
        ctx.font=\`700 \${Math.max(8,Math.min(11,rr*0.26))}px sans-serif\`;
        ctx.fillStyle='rgba(255,255,255,0.85)';
        ctx.fillText(wr+'%',cx,cy+10);
      }
      ctx.restore();
    }

    function draw(progress) {
      if (!bubbles.length) return;
      const sc = easeOut(Math.min(progress||1, 1));
      ctx.clearRect(0,0,canvas.width,canvas.height);
      bubbles.forEach((b,i)=>{ drawPie(b,sc); drawLabel(b,i===hovIdx,sc); });
    }

    function startAnim() {
      if(animId) cancelAnimationFrame(animId);
      animProgress=0;
      const start=performance.now(), dur=420;
      function step(now){
        animProgress=Math.min((now-start)/dur,1);
        draw(animProgress);
        if(animProgress<1) animId=requestAnimationFrame(step);
      }
      animId=requestAnimationFrame(step);
    }

    function showTooltip(b, mx, my) {
      const pct=n=>b.total>0?Math.round(n/b.total*100):0;
      const wrCol=b.wr===null?'#94a3b8':b.wr>=60?'#10b981':b.wr>=40?'#f59e0b':'#ef4444';
      ttip.innerHTML=\`
        <div style="font-weight:900;font-size:var(--fs-base);color:\${b.color};margin-bottom:6px">\${b.name}</div>
        <div style="font-size:var(--fs-sm);font-weight:700;color:#334155;margin-bottom:2px">\u{1F465} \${b.total}\uBA85 \xB7 \uD65C\uC131 \${b.weekActive}\uBA85</div>
        \${b.wr!==null?'<div style="font-size:var(--fs-sm);font-weight:800;color:'+wrCol+'">\u{1F4C8} \uC2B9\uB960 '+b.wr+'% ('+b.wins+'\uC2B9'+b.losses+'\uD328)</div>':''}
        \${b.topTier?'<div style="font-size:var(--fs-caption);margin-top:4px"><span style="padding:1px 6px;border-radius:5px;background:'+b.topTierCol+';color:'+b.topTierTc+';font-size:10px;font-weight:800">TOP '+b.topTier+'</span></div>':''}
        <div style="font-size:10px;color:#94a3b8;margin-top:6px">\uD074\uB9AD \u2192 \uC0C1\uC138 \uC815\uBCF4</div>
      \`;
      const wrap=canvas.parentElement.getBoundingClientRect();
      let left=mx+14,top=my+14;
      if(left+180>wrap.width)left=mx-190;
      if(top+140>wrap.height)top=my-140;
      ttip.style.left=left+'px'; ttip.style.top=top+'px'; ttip.style.opacity='1';
    }
    function hideTooltip(){ ttip.style.opacity='0'; }

    function showPopup(b) {
      const pct=n=>b.total>0?Math.round(n/b.total*100):0;
      const wrCol=b.wr===null?'#94a3b8':b.wr>=60?'#10b981':b.wr>=40?'#f59e0b':'#ef4444';
      popBody.innerHTML=\`
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
          <div style="width:14px;height:14px;border-radius:50%;background:\${b.color}"></div>
          <div style="font-size:var(--fs-lg);font-weight:900;color:\${b.color}">\${b.name}</div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">
          <div style="padding:10px;border-radius:12px;background:\${b.color}12;border:1px solid \${b.color}33;text-align:center">
            <div style="font-size:22px;font-weight:900;color:\${b.color}">\${b.total}</div>
            <div style="font-size:var(--fs-caption);color:#94a3b8">\uCD1D \uC778\uC6D0</div>
          </div>
          <div style="padding:10px;border-radius:12px;background:#f59e0b12;border:1px solid #f59e0b33;text-align:center">
            <div style="font-size:22px;font-weight:900;color:#f59e0b">\${b.weekActive}</div>
            <div style="font-size:var(--fs-caption);color:#94a3b8">\uC774\uBC88\uC8FC \uD65C\uB3D9</div>
          </div>
          \${b.wr!==null?'<div style="padding:10px;border-radius:12px;background:'+wrCol+'12;border:1px solid '+wrCol+'33;text-align:center"><div style="font-size:22px;font-weight:900;color:'+wrCol+'">'+b.wr+'%</div><div style="font-size:var(--fs-caption);color:#94a3b8">\uD1B5\uC0B0 \uC2B9\uB960</div></div>':''}
          <div style="padding:10px;border-radius:12px;background:#3b82f612;border:1px solid #3b82f633;text-align:center">
            <div style="font-size:var(--fs-md);font-weight:900;color:#3b82f6">\${b.wins}\uC2B9 \${b.losses}\uD328</div>
            <div style="font-size:var(--fs-caption);color:#94a3b8">\uD1B5\uC0B0 \uC804\uC801</div>
          </div>
        </div>
        \${b.topTier?'<div style="margin-bottom:12px"><span style="padding:2px 10px;border-radius:8px;background:'+b.topTierCol+';color:'+b.topTierTc+';font-size:var(--fs-sm);font-weight:800">\u{1F3C5} \uCD5C\uC0C1\uC704 \uD2F0\uC5B4: '+b.topTier+'</span></div>':''}
        <div style="font-size:var(--fs-sm);font-weight:700;color:#94a3b8;margin-bottom:6px">\uC885\uC871 \uAD6C\uC131</div>
        \${[['\u{1F52E}','\uD504\uB85C\uD1A0\uC2A4','#7c3aed',b.P],['\u2694\uFE0F','\uD14C\uB780','#0284c7',b.T],['\u{1F98E}','\uC800\uADF8','#059669',b.Z]].filter(function(r){return r[3]>0;}).map(function(r){var ico=r[0],lbl=r[1],col=r[2],n=r[3];return '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><span>'+ico+'</span><span style="font-size:var(--fs-sm);font-weight:700;min-width:52px;color:'+col+'">'+lbl+'</span><div style="flex:1;height:8px;border-radius:4px;background:#f1f5f9;overflow:hidden"><div style="width:'+pct(n)+'%;height:100%;background:'+col+';border-radius:4px"></div></div><span style="font-size:var(--fs-sm);font-weight:900;color:'+col+'">'+n+'\uBA85 ('+pct(n)+'%)</span></div>';}).join('')}
      \`;
      popup.classList.add('show');
    }

    function findBubble(mx,my){ return bubbles.findIndex(b=>{ const dx=mx-b.cx,dy=my-b.cy; return Math.sqrt(dx*dx+dy*dy)<b.r+6; }); }

    canvas.addEventListener('mousemove',e=>{
      const rect=canvas.getBoundingClientRect();
      const scX=canvas.width/devicePixelRatio/rect.width, scY=canvas.height/devicePixelRatio/rect.height;
      const mx=(e.clientX-rect.left)*scX, my=(e.clientY-rect.top)*scY;
      const idx=findBubble(mx,my);
      if(idx!==hovIdx){ hovIdx=idx; if(animProgress>=1)draw(1); }
      if(idx>=0){ showTooltip(bubbles[idx],e.clientX-rect.left,e.clientY-rect.top); canvas.style.cursor='pointer'; }
      else { hideTooltip(); canvas.style.cursor='default'; }
    });
    canvas.addEventListener('mouseleave',()=>{ hovIdx=-1; if(animProgress>=1)draw(1); hideTooltip(); });
    canvas.addEventListener('click',e=>{
      const rect=canvas.getBoundingClientRect();
      const mx=(e.clientX-rect.left)*(canvas.width/devicePixelRatio/rect.width);
      const my=(e.clientY-rect.top)*(canvas.height/devicePixelRatio/rect.height);
      const idx=findBubble(mx,my);
      if(idx>=0){ hideTooltip(); showPopup(bubbles[idx]); }
    });

    window['_${uid}setSort']=function(key,btn){
      sortKey=key;
      document.querySelectorAll('.${uid}-sort-btn').forEach(b=>b.classList.remove('on'));
      btn.classList.add('on');
      hovIdx=-1; bubbles=layout(); startAnim();
    };

    function buildLegend(){
      legendEl.innerHTML = '<span style="font-size:var(--fs-caption);font-weight:700;color:var(--text3)">\uC885\uC871 \uBC94\uB840:</span>' +
        [['#7c3aed','\u{1F52E} \uD504\uB85C\uD1A0\uC2A4'],['#0284c7','\u2694\uFE0F \uD14C\uB780'],['#059669','\u{1F98E} \uC800\uADF8'],['#94a3b8','\u2753 \uBBF8\uC815']].map(function(r){var c=r[0],l=r[1];return '<span style="display:flex;align-items:center;gap:4px;font-size:var(--fs-caption);font-weight:700;color:#334155"><span style="width:10px;height:10px;border-radius:50%;background:'+c+';display:inline-block"></span>'+l+'</span>';}).join('') +
        '<span style="font-size:var(--fs-caption);color:var(--text3);margin-left:6px">\uBC84\uBE14 \uC548 \uC22B\uC790 = \uC778\uC6D0 \xB7 % = \uC2B9\uB960</span>';
    }

    function tryInit(attempt){
      const w=canvas.parentElement?canvas.parentElement.offsetWidth:0;
      if(w>0){ bubbles=layout(); buildLegend(); startAnim(); }
      else if(attempt<15){ requestAnimationFrame(()=>tryInit(attempt+1)); }
      else { setTimeout(()=>{ bubbles=layout(); buildLegend(); startAnim(); },200); }
    }
    let resizeTimer;
    const ro=new ResizeObserver(()=>{ clearTimeout(resizeTimer); resizeTimer=setTimeout(()=>{ ctx.setTransform(1,0,0,1,0,0); bubbles=layout(); draw(1); },120); });
    ro.observe(canvas.parentElement);
    requestAnimationFrame(()=>tryInit(0));
  })();
  <\/script>`}

/* board2-briefing-data.js */
var __defProp=Object.defineProperty,__defProps=Object.defineProperties;var __getOwnPropDescs=Object.getOwnPropertyDescriptors;var __getOwnPropSymbols=Object.getOwnPropertySymbols;var __hasOwnProp=Object.prototype.hasOwnProperty,__propIsEnum=Object.prototype.propertyIsEnumerable;var __defNormalProp=(obj,key,value)=>key in obj?__defProp(obj,key,{enumerable:!0,configurable:!0,writable:!0,value}):obj[key]=value,__spreadValues=(a,b)=>{for(var prop in b||(b={}))__hasOwnProp.call(b,prop)&&__defNormalProp(a,prop,b[prop]);if(__getOwnPropSymbols)for(var prop of __getOwnPropSymbols(b))__propIsEnum.call(b,prop)&&__defNormalProp(a,prop,b[prop]);return a},__spreadProps=(a,b)=>__defProps(a,__getOwnPropDescs(b));function _b2CalcStreak(hist,want){const sorted=[...hist].sort((a,b)=>{const da=parseInt(String(a.date||"").replace(/[-\.\/]/g,""))||0,db=parseInt(String(b.date||"").replace(/[-\.\/]/g,""))||0;return db!==da?db-da:(b.time||0)-(a.time||0)});let streak=0;for(const h of sorted)if(h.result===want)streak++;else break;return streak}function _b2RankSortUnivs(a,b){var _a,_b,_c,_d;return b.tw-a.tw||((_a=b.wr)!=null?_a:-1)-((_b=a.wr)!=null?_b:-1)||b.tg-a.tg||b.active.length-a.active.length||String(((_c=a.u)==null?void 0:_c.name)||"").localeCompare(String(((_d=b.u)==null?void 0:_d.name)||""),"ko",{sensitivity:"base"})}function _b2BuildRankedUnivs(list,prevList){const prevRankMap={};return(prevList||[]).filter(ud=>ud.tg>0).slice().sort(_b2RankSortUnivs).forEach((ud,idx)=>{prevRankMap[ud.u.name]=idx+1}),(list||[]).filter(ud=>ud.tg>0).slice().sort(_b2RankSortUnivs).map((ud,idx)=>{const rank=idx+1,prevRank=prevRankMap[ud.u.name]||null,rankDelta=prevRank?prevRank-rank:null;return __spreadProps(__spreadValues({},ud),{rank,prevRank,rankDelta})})}function _b2BuildMvpCardHtml(s,rank,isWorst,extraClass,opts){var _a,_b;if(!s)return"";const o=opts||{},isMonthly=!!o.isMonthly,mvpLabel=o.mvpLabel||"MVP",mvpFxStyleAttr=o.mvpFxStyleAttr,mvpFxDesign=o.mvpFxDesign,mvpFxOp=o.mvpFxOp,mp=s.p,tc=typeof getTierBtnColor=="function"&&mp.tier?getTierBtnColor(mp.tier):"#475569",tt=typeof getTierBtnTextColor=="function"&&mp.tier&&getTierBtnTextColor(mp.tier)||"#fff",photo=mp.photo?typeof toHttpsUrl=="function"?toHttpsUrl(mp.photo):mp.photo:"",initial=String(mp.name||"-").trim().slice(0,1),nameEsc=String(mp.name||"").replace(/\\/g,"\\\\").replace(/'/g,"\\'"),cardClass=isWorst?"b2w2-mvp-worst":rank===1?"b2w2-mvp-first":"b2w2-mvp-second",badgeText=extraClass==="b2w2-mvp-card-mini"?isWorst?"3\uB4F1":rank===1?"1\uB4F1":"2\uB4F1":isWorst?isMonthly?"\uC774\uB2EC\uC758 \uCD5C\uC545":"\uC774\uBC88\uC8FC \uCD5C\uC545":rank===1?mvpLabel:isMonthly?"\uC774\uB2EC\uC758 2\uC704":"\uC774\uBC88\uC8FC 2\uC704",badgeEmoji=isWorst?"\u{1F480}":rank===1?"\u{1F3C6}":"\u{1F948}",winColor="b2w2-mvp-sv-win",lossColor="b2w2-mvp-sv-loss",rateColor="b2w2-mvp-sv-rate",_statItem=(val,label,colorClass)=>`<span class="b2w2-mvp-stat"><b class="b2w2-mvp-sv ${colorClass}">${val}</b><i class="b2w2-mvp-sl">${label}</i></span>`,_sep='<span class="b2w2-mvp-statline-sep"></span>',statsHtml=isWorst?`${_statItem(s.losses,"\uD328",lossColor)}${_sep}${_statItem(s.wins,"\uC2B9",winColor)}${_sep}${_statItem(((_a=s.winRate)!=null?_a:0)+"%","\uC2B9\uB960",rateColor)}`:`${_statItem(s.wins,"\uC2B9",winColor)}${_sep}${_statItem(s.losses,"\uD328",lossColor)}${_sep}${_statItem(((_b=s.winRate)!=null?_b:0)+"%","\uC2B9\uB960",rateColor)}`;return`<div class="b2w2-mvp-card ${cardClass}${extraClass?" "+extraClass:""}" data-fx="${mvpFxStyleAttr}" data-design="${mvpFxDesign}" style="--b2mvp-fx-op:${mvpFxOp}" onclick="openPlayerModal('${nameEsc}')">
    ${photo?`<img class="b2w2-mvp-bg" src="${photo}" alt="${mp.name||""}"
           onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`:""}
    <div class="b2w2-mvp-bg-fallback" style="${photo?"display:none":""}">${initial}</div>
    <div class="b2w2-mvp-overlay"></div>
    <div class="b2w2-mvp-top-badge">${mvpFxDesign==="ribbon"?badgeText:`${badgeEmoji} ${badgeText}`}</div>
    <div class="b2w2-mvp-bottom">
      <div class="b2w2-mvp-id">
        <div class="b2w2-mvp-name">${mp.name||"-"}</div>
        <div class="b2w2-mvp-meta">
          <span class="b2w2-mvp-univ">${String(mp.univ||"\uBB34\uC18C\uC18D")}</span>
          ${mp.tier?`<span class="b2w2-mvp-tier" style="background:${tc};color:${tt}">${mp.tier}</span>`:""}
        </div>
      </div>
      <div class="b2w2-mvp-statline">
        ${statsHtml}
        <div class="b2w2-mvp-statline-form">${_b2WeeklyForm(s.hist)}</div>
      </div>
    </div>
  </div>`}const _b2WeeklyAggregateCache=[],_B2_WEEKLY_AGG_CACHE_MAX=4;function _b2WeeklyAggregate(players2,dateFrom,dateTo){let cacheKey=null;try{let saveSig="";try{saveSig=String(localStorage.getItem("su_last_save_time")||"")}catch(e){}const namesSig=players2.map(p=>p&&p.name).join(",");cacheKey=`${dateFrom}|${dateTo}|${saveSig}|${namesSig}`;const hit=_b2WeeklyAggregateCache.find(e=>e.key===cacheKey);if(hit)return hit.result}catch(e){cacheKey=null}const result=_b2WeeklyAggregateCompute(players2,dateFrom,dateTo);return cacheKey&&(_b2WeeklyAggregateCache.push({key:cacheKey,result}),_b2WeeklyAggregateCache.length>_B2_WEEKLY_AGG_CACHE_MAX&&_b2WeeklyAggregateCache.shift()),result}function _b2WeeklyAggregateCompute(players2,dateFrom,dateTo){const dateNum=s=>parseInt(String(s||"").replace(/[-\.\/]/g,""))||0,fromN=dateNum(dateFrom),toN=dateNum(dateTo),inRange=d=>{const dn=dateNum(d);return dn>=fromN&&dn<=toN},isOff=mode=>{const m=String(mode||"").trim();return m&&!["\uC2A4\uD3F0\uC11C","\uC2A4\uD06C\uB9AC\uBBF8\uC9C0","\uC5F0\uC2B5",""].includes(m)},isBriefingExcluded=mode=>{const m=String(mode||"").trim();return m.indexOf("\uD504\uB85C\uB9AC\uADF8")!==-1||m.indexOf("\uAC1C\uC778\uC804")!==-1||m.indexOf("\uB05D\uC7A5\uC804")!==-1},extMap={};let gameCount=0;const addExt=(name,date,result,oppRace,mode)=>{!name||!date||!result||inRange(date)&&(isBriefingExcluded(mode)||(extMap[name]||(extMap[name]=[]),extMap[name].push({date,result,oppRace:oppRace||"",mode:mode||""})))},_b2CountGame=(date,mode)=>{date&&inRange(date)&&!isBriefingExcluded(mode)&&gameCount++},_b2TeamNames=side=>Array.isArray(side)?side.map(x=>x&&typeof x=="object"?String(x.name||"").trim():String(x||"").trim()).filter(Boolean):String(side||"").split(/[,+，]/).map(x=>x.trim()).filter(Boolean),_b2AddTeamGameExt=(game,date,modeLabel)=>{if(!game||!date||!game.winner)return;const teamA=Array.isArray(game.teamA)&&game.teamA.length?_b2TeamNames(game.teamA):game.a1||game.a2?[game.a1,game.a2].filter(Boolean):_b2TeamNames(game.playerA),teamB=Array.isArray(game.teamB)&&game.teamB.length?_b2TeamNames(game.teamB):game.b1||game.b2?[game.b1,game.b2].filter(Boolean):_b2TeamNames(game.playerB);if(teamA.length>=2&&teamB.length>=2){const winTeam=game.winner==="A"?teamA:teamB,loseTeam=game.winner==="A"?teamB:teamA;return winTeam.forEach(name=>addExt(name,date,"\uC2B9","",modeLabel)),loseTeam.forEach(name=>addExt(name,date,"\uD328","",modeLabel)),_b2CountGame(date,modeLabel),!0}return!1};try{(typeof indM!="undefined"&&Array.isArray(indM)?indM:[]).forEach(m=>{if(!m||!m.d||!m.wName||!m.lName)return;const wp=players2.find(p=>p.name===m.wName),lp=players2.find(p=>p.name===m.lName);addExt(m.wName,m.d,"\uC2B9",(lp==null?void 0:lp.race)||"",m.mode||"\uAC1C\uC778\uC804"),addExt(m.lName,m.d,"\uD328",(wp==null?void 0:wp.race)||"",m.mode||"\uAC1C\uC778\uC804")})}catch(e){}try{(typeof gjM!="undefined"&&Array.isArray(gjM)?gjM:[]).forEach(m=>{if(!m||!m.d||!m.wName||!m.lName||m._proLabel)return;const wp=players2.find(p=>p.name===m.wName),lp=players2.find(p=>p.name===m.lName);addExt(m.wName,m.d,"\uC2B9",(lp==null?void 0:lp.race)||"",m.mode||"\uB05D\uC7A5\uC804"),addExt(m.lName,m.d,"\uD328",(wp==null?void 0:wp.race)||"",m.mode||"\uB05D\uC7A5\uC804")})}catch(e){}try{(typeof ttM!="undefined"&&Array.isArray(ttM)?ttM:[]).forEach(m=>{!m||!m.d||(m.sets||[]).forEach(s=>{(s.games||[]).forEach(g=>{if(_b2AddTeamGameExt(g,m.d,"\uD2F0\uC5B4\uB300\uD68C")||!g||!g.playerA||!g.playerB||!g.winner)return;const pA=players2.find(p=>p.name===g.playerA),pB=players2.find(p=>p.name===g.playerB),wA=g.winner==="A",wB=g.winner==="B";addExt(g.playerA,m.d,wA?"\uC2B9":"\uD328",(pB==null?void 0:pB.race)||"","\uD2F0\uC5B4\uB300\uD68C"),addExt(g.playerB,m.d,wB?"\uC2B9":"\uD328",(pA==null?void 0:pA.race)||"","\uD2F0\uC5B4\uB300\uD68C"),_b2CountGame(m.d,"\uD2F0\uC5B4\uB300\uD68C")})})})}catch(e){}const _scanTeamMatches=(arr,modeLabel)=>{try{(Array.isArray(arr)?arr:[]).forEach(m=>{!m||!m.d||(m.sets||[]).forEach(s=>{(s.games||[]).forEach(g=>{if(!(!g||!g.winner)&&!_b2AddTeamGameExt(g,m.d,modeLabel)&&g.playerA&&g.playerB){const pA=players2.find(p=>p.name===g.playerA),pB=players2.find(p=>p.name===g.playerB);addExt(g.playerA,m.d,g.winner==="A"?"\uC2B9":"\uD328",(pB==null?void 0:pB.race)||"",modeLabel),addExt(g.playerB,m.d,g.winner==="B"?"\uC2B9":"\uD328",(pA==null?void 0:pA.race)||"",modeLabel),_b2CountGame(m.d,modeLabel)}})})})}catch(e){}};_scanTeamMatches(typeof miniM!="undefined"?miniM:[],"\uBBF8\uB2C8\uB300\uC804"),_scanTeamMatches(typeof univM!="undefined"?univM:[],"\uB300\uD559\uB300\uC804"),_scanTeamMatches(typeof ckM!="undefined"?ckM:[],"\uB300\uD559CK");try{(typeof tourneys!="undefined"&&Array.isArray(tourneys)?tourneys:[]).forEach(tn=>{(tn.groups||[]).forEach(grp=>{(grp.matches||[]).forEach(m=>{!m||!m.d||(m.sets||[]).forEach(s=>{(s.games||[]).forEach(g=>{if(_b2AddTeamGameExt(g,m.d,"\uB300\uD68C")||!g||!g.playerA||!g.playerB||!g.winner)return;const pA=players2.find(p=>p.name===g.playerA),pB=players2.find(p=>p.name===g.playerB);addExt(g.playerA,m.d,g.winner==="A"?"\uC2B9":"\uD328",(pB==null?void 0:pB.race)||"","\uB300\uD68C"),addExt(g.playerB,m.d,g.winner==="B"?"\uC2B9":"\uD328",(pA==null?void 0:pA.race)||"","\uB300\uD68C"),_b2CountGame(m.d,"\uB300\uD68C")})})})}),Object.values((tn.bracket||{}).matchDetails||{}).forEach(m=>{!m||!m.d||(m.sets||[]).forEach(s=>{(s.games||[]).forEach(g=>{if(_b2AddTeamGameExt(g,m.d,"\uB300\uD68C")||!g||!g.playerA||!g.playerB||!g.winner)return;const pA=players2.find(p=>p.name===g.playerA),pB=players2.find(p=>p.name===g.playerB);addExt(g.playerA,m.d,g.winner==="A"?"\uC2B9":"\uD328",(pB==null?void 0:pB.race)||"","\uB300\uD68C"),addExt(g.playerB,m.d,g.winner==="B"?"\uC2B9":"\uD328",(pA==null?void 0:pA.race)||"","\uB300\uD68C"),_b2CountGame(m.d,"\uB300\uD68C")})})}),(tn.normalMatches||[]).forEach(m=>{!m||!m.d||(m.sets||[]).forEach(s=>{(s.games||[]).forEach(g=>{if(_b2AddTeamGameExt(g,m.d,"\uB300\uD68C")||!g||!g.playerA||!g.playerB||!g.winner)return;const pA=players2.find(p=>p.name===g.playerA),pB=players2.find(p=>p.name===g.playerB);addExt(g.playerA,m.d,g.winner==="A"?"\uC2B9":"\uD328",(pB==null?void 0:pB.race)||"","\uB300\uD68C"),addExt(g.playerB,m.d,g.winner==="B"?"\uC2B9":"\uD328",(pA==null?void 0:pA.race)||"","\uB300\uD68C"),_b2CountGame(m.d,"\uB300\uD68C")})})})})}catch(e){}const _result=players2.map(p=>{const phist=(Array.isArray(p.history)?p.history:[]).filter(h=>inRange(h.date||h.d||"")&&!isBriefingExcluded(h.mode||h.label||h.type||h.kind||h.cat||"")),extHist=(extMap[p.name]||[]).filter(h=>!isBriefingExcluded(h.mode||"")),histKeys=new Set(phist.map(h=>`${h.date||h.d||""}|${h.result||""}`)),extFiltered=extHist.filter(h=>!histKeys.has(`${h.date||""}|${h.result||""}`)),hist=[...phist,...extFiltered],wins=hist.filter(h=>h.result==="\uC2B9").length,losses=hist.filter(h=>h.result==="\uD328").length,total=wins+losses,offH=hist.filter(h=>isOff(h.mode)),spH=hist.filter(h=>!isOff(h.mode)),vsRace={P:{w:0,l:0},T:{w:0,l:0},Z:{w:0,l:0}};return hist.forEach(h=>{const r=String(h.oppRace||"").trim().toUpperCase();vsRace[r]&&(h.result==="\uC2B9"?vsRace[r].w++:vsRace[r].l++)}),{p,wins,losses,total,winRate:total?Math.round(wins/total*100):null,offWins:offH.filter(h=>h.result==="\uC2B9").length,offLosses:offH.filter(h=>h.result==="\uD328").length,spWins:spH.filter(h=>h.result==="\uC2B9").length,spLosses:spH.filter(h=>h.result==="\uD328").length,vsRace,hist}});return _result.gameCount=gameCount,_result}function _b2WeeklyUnivStats(players2,dateFrom,dateTo,univList,sortBy){const stats=_b2WeeklyAggregate(players2,dateFrom,dateTo),result=univList.map(u=>{const members=stats.filter(s=>{var _a;return String(((_a=s.p)==null?void 0:_a.univ)||"").trim()===u.name}),active=members.filter(s=>s.total>0),tw=active.reduce((a,s)=>a+s.wins,0),tl=active.reduce((a,s)=>a+s.losses,0),tg=tw+tl,raceCount={P:{w:0,l:0},T:{w:0,l:0},Z:{w:0,l:0}};return active.forEach(s=>{["P","T","Z"].forEach(r=>{raceCount[r].w+=s.vsRace[r].w,raceCount[r].l+=s.vsRace[r].l})}),{u,members,active,tw,tl,tg,wr:tg?Math.round(tw/tg*100):null,raceCount}});return result.gameCount=stats.gameCount||0,sortBy==="winrate"?result.sort((a,b)=>{var _a,_b;return((_a=b.wr)!=null?_a:-1)-((_b=a.wr)!=null?_b:-1)||b.tg-a.tg}):result.sort((a,b)=>b.tg-a.tg)}function _b2WeeklyMVP(univStats){let best=null,bestScore=-1;return univStats.forEach(ud=>{ud.active.forEach(s=>{var _a;if(s.total<3||String(((_a=s.p)==null?void 0:_a.gender)||"").trim()!=="F")return;const score=s.wins*3+(s.total>0?s.wins/s.total*10:0)+s.offWins*2;score>bestScore&&(bestScore=score,best=s)})}),best}function _b2WeeklyMVP2(univStats,mvp1){var _a;let best=null,bestScore=-1;const mvp1Name=((_a=mvp1==null?void 0:mvp1.p)==null?void 0:_a.name)||null;return univStats.forEach(ud=>{ud.active.forEach(s=>{var _a2,_b;if(s.total<3||String(((_a2=s.p)==null?void 0:_a2.gender)||"").trim()!=="F"||mvp1Name&&((_b=s.p)==null?void 0:_b.name)===mvp1Name)return;const score=s.wins*3+(s.total>0?s.wins/s.total*10:0)+s.offWins*2;score>bestScore&&(bestScore=score,best=s)})}),best}function _b2WeeklyWorst(univStats){let worst=null,worstScore=-1;return univStats.forEach(ud=>{ud.active.forEach(s=>{var _a;if(s.total<2||String(((_a=s.p)==null?void 0:_a.gender)||"").trim()!=="F")return;const score=s.losses*3+(s.total>0?(s.total-s.wins)/s.total*10:0);score>worstScore&&(worstScore=score,worst=s)})}),worst}function _b2WeeklyUnivMVP(active){const candidates=(Array.isArray(active)?active:[]).filter(s=>s&&s.total>0).map(s=>{var _a;const netWins=(s.wins||0)-(s.losses||0),winRate=s.total>0?(_a=s.winRate)!=null?_a:Math.round((s.wins||0)/s.total*100):null,offTotal=(s.offWins||0)+(s.offLosses||0);return __spreadProps(__spreadValues({},s),{netWins,offTotal,aceQualified:s.total>=3&&(winRate!=null?winRate:0)>=50&&netWins>=1,aceScore:netWins*100+(winRate!=null?winRate:0)*2+offTotal*4+(s.wins||0)})}),sorter=(a,b)=>{var _a,_b;return b.aceScore-a.aceScore||b.netWins-a.netWins||((_a=b.winRate)!=null?_a:-1)-((_b=a.winRate)!=null?_b:-1)||b.offTotal-a.offTotal||b.total-a.total||b.wins-a.wins},qualified=candidates.filter(s=>s.aceQualified).sort(sorter);return qualified.length?qualified[0]:null}const _B2_MVP_HISTORY_KEY="su_mvp_history_v1";function _b2MvpHistoryLoad(){try{const raw=localStorage.getItem(_B2_MVP_HISTORY_KEY),arr=raw?JSON.parse(raw):[];return Array.isArray(arr)?arr:[]}catch(e){return[]}}function _b2MvpHistorySave(arr){try{localStorage.setItem(_B2_MVP_HISTORY_KEY,JSON.stringify(Array.isArray(arr)?arr:[]))}catch(e){}}const _B2_MVP_HISTORY_MIGRATION_FLAG="su_mvp_history_reset_v4";(function(){try{if(localStorage.getItem(_B2_MVP_HISTORY_MIGRATION_FLAG))return;localStorage.removeItem(_B2_MVP_HISTORY_KEY),localStorage.setItem(_B2_MVP_HISTORY_MIGRATION_FLAG,"1")}catch(e){}})();function _b2SyncMvpHistory(preset,dateFrom,dateTo,mvpStat){const type=preset==="week"||preset==="thisWeek"||preset==="lastWeek"?"week":preset==="month"||preset==="thisMonth"||preset==="lastMonth"?"month":null;if(!type||!dateFrom||!dateTo)return;const key=`${type}:${dateFrom}`,arr=_b2MvpHistoryLoad(),idx=arr.findIndex(e=>e&&e.key===key);if(!mvpStat||!mvpStat.p||!mvpStat.p.name){idx>=0&&(arr.splice(idx,1),_b2MvpHistorySave(arr));return}const entry={key,type,from:dateFrom,to:dateTo,name:String(mvpStat.p.name||"").trim(),univ:String(mvpStat.p.univ||"").trim()||"\uBB34\uC18C\uC18D",wins:mvpStat.wins||0,losses:mvpStat.losses||0,updatedAt:Date.now()};idx>=0?arr[idx]=entry:arr.push(entry),arr.length>500&&arr.splice(0,arr.length-500),_b2MvpHistorySave(arr)}function _b2GetPlayerMvpStats(playerName){const nm=String(playerName||"").trim();if(!nm)return{weekCount:0,monthCount:0,entries:[]};const raw=_b2MvpHistoryLoad().filter(e=>e&&String(e.name||"").trim()===nm),byPeriod=new Map;raw.forEach(e=>{const pk=`${e.type}:${String(e.from||"").slice(0,10)}`,prev=byPeriod.get(pk);(!prev||(e.updatedAt||0)>=(prev.updatedAt||0))&&byPeriod.set(pk,e)});const mine=[...byPeriod.values()].sort((a,b)=>String(b.from||"").localeCompare(String(a.from||"")));return{weekCount:mine.filter(e=>e.type==="week").length,monthCount:mine.filter(e=>e.type==="month").length,entries:mine}}function _b2GenAllWeekRanges(seasonStartStr){const seasonStart=new Date(seasonStartStr+"T00:00:00"),day=seasonStart.getDay(),diffToMon=day===0?-6:1-day,firstMon=new Date(seasonStart);firstMon.setDate(seasonStart.getDate()+diffToMon);const now=new Date,today=new Date(now.getFullYear(),now.getMonth(),now.getDate()),ranges=[],cur=new Date(firstMon);let guard=0;for(;cur<=now&&guard<600;){const sun=new Date(cur);sun.setDate(cur.getDate()+6);const to=today>=cur&&today<=sun?today:sun;ranges.push({from:_b2FmtLocalYMD(cur),to:_b2FmtLocalYMD(to)}),cur.setDate(cur.getDate()+7),guard++}return ranges}function _b2GenAllMonthRanges(seasonStartStr){const seasonStart=new Date(seasonStartStr+"T00:00:00"),now=new Date,ranges=[];let y=seasonStart.getFullYear(),m=seasonStart.getMonth(),guard=0;for(;(y<now.getFullYear()||y===now.getFullYear()&&m<=now.getMonth())&&guard<200;){const isCurrent=y===now.getFullYear()&&m===now.getMonth(),from=new Date(y,m,1),to=isCurrent?new Date(now.getFullYear(),now.getMonth(),now.getDate()):new Date(y,m+1,0);ranges.push({from:_b2FmtLocalYMD(from),to:_b2FmtLocalYMD(to)}),m++,m>11&&(m=0,y++),guard++}return ranges}const _B2_MVP_SEASON_START="2026-01-01";function _b2PruneStaleMvpHistory(validKeys){try{const arr=_b2MvpHistoryLoad(),kept=arr.filter(e=>e&&validKeys.has(e.key));kept.length!==arr.length&&_b2MvpHistorySave(kept)}catch(e){}}let _b2MvpHistoryFreshAt=0;function _b2EnsureMvpHistoryFresh(force){try{const now=Date.now();if(!force&&_b2MvpHistoryFreshAt&&now-_b2MvpHistoryFreshAt<6e4||typeof players=="undefined"||!Array.isArray(players)||typeof _b2WeeklyUnivStats!="function"||typeof _b2WeeklyMVP!="function")return;const _dissSet=new Set((typeof univCfg!="undefined"?univCfg:[]).filter(u=>u.dissolved||u.hidden).map(u=>String(u.name||"").trim())),vis=players.filter(p=>!p.hidden&&!p.retired&&!p.hideFromBoard&&!_dissSet.has(String((p==null?void 0:p.univ)||"").trim())),univList=(typeof _b2VisUnivs=="function"?_b2VisUnivs():[]).filter(u=>u.name&&u.name!=="\uBB34\uC18C\uC18D"),weekRanges=_b2GenAllWeekRanges(_B2_MVP_SEASON_START),monthRanges=_b2GenAllMonthRanges(_B2_MVP_SEASON_START),validKeys=new Set;weekRanges.forEach(r=>{validKeys.add(`week:${r.from}`);const stats=_b2WeeklyUnivStats(vis,r.from,r.to,univList),mvp=_b2WeeklyMVP(stats);_b2SyncMvpHistory("week",r.from,r.to,mvp)}),monthRanges.forEach(r=>{validKeys.add(`month:${r.from}`);const stats=_b2WeeklyUnivStats(vis,r.from,r.to,univList),mvp=_b2WeeklyMVP(stats);_b2SyncMvpHistory("month",r.from,r.to,mvp)}),_b2PruneStaleMvpHistory(validKeys),_b2MvpHistoryFreshAt=now}catch(e){}}try{window._b2EnsureMvpHistoryFresh=_b2EnsureMvpHistoryFresh,window._b2GenAllWeekRanges=_b2GenAllWeekRanges,window._b2GenAllMonthRanges=_b2GenAllMonthRanges}catch(e){}try{window._b2MvpHistoryLoad=_b2MvpHistoryLoad,window._b2SyncMvpHistory=_b2SyncMvpHistory,window._b2GetPlayerMvpStats=_b2GetPlayerMvpStats}catch(e){}function _b2RenderMvpArchiveBody(entries,typeFilter,univFilter,univList){const fmtD=s=>String(s||"").slice(0,10).replace(/-/g,"."),filtered=(Array.isArray(entries)?entries:[]).filter(e=>!(typeFilter!=="all"&&e.type!==typeFilter||univFilter!=="\uC804\uCCB4"&&String(e.univ||"").trim()!==univFilter)),_typeBtn=(key,label)=>`<button type="button" class="b2w2-preset${typeFilter===key?" on":""}" onclick="_b2SetMvpArchiveType('${key}')">${label}</button>`,filterBar=`
    <div class="b2w2-hdr">
      <span style="font-size:16px">\u{1F3C6}</span>
      <span style="font-size:14px;font-weight:900;color:var(--text1)">MVP \uC544\uCE74\uC774\uBE0C</span>
      <div class="b2w2-presetrow" style="margin:0">
        ${_typeBtn("all","\uC804\uCCB4")}
        ${_typeBtn("week","\uC8FC\uAC04\uB9CC")}
        ${_typeBtn("month","\uC6D4\uAC04\uB9CC")}
      </div>
      <select class="b2w2-sel" onchange="_b2SetMvpArchiveUniv(this.value)">
        <option value="\uC804\uCCB4"${univFilter==="\uC804\uCCB4"?" selected":""}>\u{1F3EB} \uC804\uCCB4 \uB300\uD559</option>
        ${(univList||[]).map(u=>{const _n=typeof escAttr=="function"?escAttr(u.name):String(u.name||""),_nh=typeof window.escHTML=="function"?window.escHTML(u.name):String(u.name||"");return`<option value="${_n}"${univFilter===u.name?" selected":""}>${_nh}</option>`}).join("")}
      </select>
      <span style="font-size:var(--fs-caption);color:var(--text3);margin-left:auto">\uCD1D ${filtered.length}\uAC74</span>
      <button type="button" class="b2w2-preset" onclick="(function(){const bodies=[...document.getElementsByClassName('b2w2-mvp-arch-body')];const chevs=[...document.getElementsByClassName('b2w2-mvp-arch-chev')];const anyOpen=bodies.some(b=>b.style.display!=='none');bodies.forEach(b=>{b.style.display=anyOpen?'none':'';});chevs.forEach(c=>{c.textContent=anyOpen?'\u25B6':'\u25BC';});})()">\uC804\uCCB4 \uD3BC\uCE58\uAE30/\uC811\uAE30</button>
    </div>`;if(!filtered.length)return`${filterBar}<div class="b2w2-empty"><div style="font-size:28px;margin-bottom:8px">\u{1F3C6}</div>\uC870\uAC74\uC5D0 \uB9DE\uB294 MVP \uAE30\uB85D\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.<div style="font-size:var(--fs-caption);margin-top:4px">\uD544\uD130\uB97C \uBCC0\uACBD\uD574\uBCF4\uC138\uC694</div></div>`;const _renderCard=e=>{const col=typeof gc=="function"&&gc(e.univ)||"#64748b",total=(e.wins||0)+(e.losses||0),winRate=total>0?Math.round(e.wins/total*1e3)/10:0,nameEsc=String(e.name||"").replace(/\\/g,"\\\\").replace(/'/g,"\\'"),player=typeof players!="undefined"&&Array.isArray(players)?players.find(p=>String((p==null?void 0:p.name)||"").trim()===String(e.name||"").trim()):null,photo=player!=null&&player.photo?typeof toHttpsUrl=="function"?toHttpsUrl(player.photo):player.photo:"",nameSafe=typeof window.escHTML=="function"?window.escHTML(e.name||""):String(e.name||""),univSafe=typeof window.escHTML=="function"?window.escHTML(e.univ||""):String(e.univ||""),isMonth=e.type==="month";return`
      <div class="b2w2-ace-card" style="border-color:${col}22">
        <div class="b2w2-ace-head">
          <div class="b2w2-ace-univ">
            <span class="b2w2-ace-dot" style="background:${col}"></span>
            <span class="b2w2-ace-univ-name">${univSafe}</span>
          </div>
          <span class="b2w2-ace-rank" style="background:${isMonth?"var(--b2w-gold-soft)":"var(--b2w-tag-accent-bg)"};border-color:${isMonth?"rgba(184,134,44,.35)":"var(--b2w-tag-accent-border)"};color:${isMonth?"var(--b2w-gold)":"var(--b2w-accent)"};font-weight:900">${isMonth?"\uC6D4\uAC04":"\uC8FC\uAC04"} MVP</span>
        </div>
        <div class="b2w2-ace-player">
          <div class="b2w2-ace-player-main">
            <div class="b2w2-ace-photo" style="--_c:${col}">
              ${photo?`<img src="${photo}" alt="${nameSafe}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`:""}
              <div class="b2w2-ace-photo-fallback" style="${photo?"display:none":""}">${String(e.name||"-").trim().slice(0,1)}</div>
            </div>
            <div style="min-width:0">
              <div class="b2w2-ace-player-name" onclick="openPlayerModal('${nameEsc}')">${nameSafe}</div>
              <div class="b2w2-ace-player-sub">
                <span>${e.wins||0}\uC2B9 ${e.losses||0}\uD328</span>
                <span style="color:${winRate>=60?"var(--green)":winRate>=50?"var(--b2w-accent)":"var(--gray)"}">\uC2B9\uB960 ${winRate}%</span>
              </div>
            </div>
          </div>
        </div>
        <div class="b2w2-ace-badges">
          <span class="b2w2-ace-badge">${fmtD(e.from)} ~ ${fmtD(e.to)}</span>
        </div>
      </div>`},_groups=new Map;filtered.forEach(e=>{const ym=String(e.from||"").slice(0,7);_groups.has(ym)||_groups.set(ym,[]),_groups.get(ym).push(e)});const cards=[..._groups.keys()].sort((a,b)=>b.localeCompare(a)).map((ym,idx)=>{const list=_groups.get(ym),weekN=list.filter(e=>e.type==="week").length,monthN=list.filter(e=>e.type==="month").length,[y,m]=ym.split("-"),label=`${y}\uB144 ${parseInt(m,10)}\uC6D4`,isOpen=idx<2,bodyId=`b2w2-mvp-arch-${ym}`,chevId=`b2w2-mvp-arch-chev-${ym}`;return`
      <div class="b2w2-card" style="margin-bottom:10px">
        <div class="b2w2-card-head" onclick="(function(){const b=document.getElementById('${bodyId}');const c=document.getElementById('${chevId}');if(!b)return;const show=b.style.display==='none';b.style.display=show?'':'none';if(c)c.textContent=show?'\u25BC':'\u25B6';})()">
          <div class="b2w2-card-title">
            <span class="b2w2-card-dot" style="background:var(--b2w-accent)"></span>
            <div>
              <div class="b2w2-card-name" style="font-size:var(--fs-md)">${label}</div>
              <div class="b2w2-card-sub">
                <span style="color:var(--b2w-accent);font-weight:800">\uC8FC\uAC04 ${weekN}\uAC74</span>
                <span style="color:var(--b2w-gold);font-weight:800">\uC6D4\uAC04 ${monthN}\uAC74</span>
              </div>
            </div>
          </div>
          <span id="${chevId}" class="b2w2-card-chevron b2w2-mvp-arch-chev">${isOpen?"\u25BC":"\u25B6"}</span>
        </div>
        <div id="${bodyId}" class="b2w2-card-body b2w2-mvp-arch-body" style="${isOpen?"":"display:none"}">
          <section class="b2w2-ace-list">${list.map(_renderCard).join("")}</section>
        </div>
      </div>`}).join("");return`${filterBar}<div style="margin-top:14px">${cards}</div>`}try{window._b2RenderMvpArchiveBody=_b2RenderMvpArchiveBody}catch(e){}function _b2TierRankTooltip(tier){try{const list=typeof TIERS!="undefined"&&Array.isArray(TIERS)&&TIERS.length?TIERS:["G","K","JA","J","S","0\uD2F0\uC5B4","1\uD2F0\uC5B4","2\uD2F0\uC5B4","3\uD2F0\uC5B4","4\uD2F0\uC5B4","5\uD2F0\uC5B4","6\uD2F0\uC5B4","7\uD2F0\uC5B4","8\uD2F0\uC5B4","\uC720\uC2A4","\uBBF8\uC815"],idx=list.indexOf(tier),order=list.join(" > ");return idx===-1?`\uD2F0\uC5B4 \uC21C\uC704: ${order}`:`\uD2F0\uC5B4 \uC21C\uC704(\uB192\uC74C\u2192\uB0AE\uC74C): ${order}
\uD604\uC7AC "${tier}" = \uC0C1\uC704 ${idx+1}\uBC88\uC9F8 \uB4F1\uAE09`}catch(e){return""}}try{window._b2TierRankTooltip=_b2TierRankTooltip}catch(e){}function _b2WeeklyForm(hist){const sorted=[...hist].sort((a,b)=>{const da=parseInt(String(a.date||"").replace(/[-\.\/]/g,""))||0,db=parseInt(String(b.date||"").replace(/[-\.\/]/g,""))||0;return da!==db?da-db:(a.time||0)-(b.time||0)}).slice(-5),pad=5-sorted.length;let out="";for(let i=0;i<pad;i++)out+='<span style="display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;border-radius:50%;background:var(--border,#e2e8f0);flex-shrink:0"></span>';return out+=sorted.map(h=>{const c=h.result==="\uC2B9"?"var(--win-col,#dc2626)":h.result==="\uD328"?"var(--lose-col,#2563eb)":"#94a3b8",t=h.result==="\uC2B9"?"W":h.result==="\uD328"?"L":"-";return`<span style="display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;border-radius:50%;background:${c};font-size:9px;color:#fff;font-weight:900;flex-shrink:0">${t}</span>`}).join(""),out}function _b2WeeklyBarChart(univStats){const visible=univStats.filter(ud=>ud.tg>0).slice(0,10);if(!visible.length)return"";const maxGames=Math.max(...visible.map(ud=>ud.tg),1),ROW_H=34,BAR_H=13,LEFT=90,RIGHT=160,TOP=14,H=visible.length*ROW_H+TOP+10,MAX_W=520-LEFT-RIGHT,rows=visible.map((ud,i)=>{const y=TOP+i*ROW_H,color=(gc?gc(ud.u.name):"#64748b")||"#64748b",totalW=Math.max(2,Math.round(ud.tg/maxGames*MAX_W)),winW=ud.tg>0?Math.round(totalW*ud.tw/ud.tg):0,lossW=Math.max(0,totalW-winW),wr=ud.wr!==null?`${ud.wr}%`:"-",wrColor=ud.wr===null?"#94a3b8":ud.wr>=60?"#10b981":ud.wr>=40?"#f59e0b":"#ef4444",name=ud.u.name.length>6?ud.u.name.slice(0,6)+"\u2026":ud.u.name,clipId=`b2wbar-clip-${i}`;return`
      <text x="${LEFT-6}" y="${y+BAR_H*.9}" text-anchor="end" font-size="11" font-weight="700" fill="var(--text2)">${name}</text>
      <defs><clipPath id="${clipId}"><rect x="${LEFT}" y="${y}" width="${totalW}" height="${BAR_H}" rx="4"/></clipPath></defs>
      <rect x="${LEFT}" y="${y}" width="${MAX_W}" height="${BAR_H}" rx="4" fill="var(--border,#e2e8f0)" opacity="0.35"/>
      <g clip-path="url(#${clipId})">
        ${winW>0?`<rect x="${LEFT}" y="${y}" width="${winW}" height="${BAR_H}" fill="${color}"/>`:""}
        ${lossW>0?`<rect x="${LEFT+winW}" y="${y}" width="${lossW}" height="${BAR_H}" fill="${color}" opacity="0.32"/>`:""}
      </g>
      <text x="${LEFT}" y="${y+BAR_H+12}" font-size="10" font-weight="800" fill="${color}">${ud.tw}\uC2B9</text>
      <text x="${LEFT+32}" y="${y+BAR_H+12}" font-size="10" fill="${color}" opacity="0.65">${ud.tl}\uD328</text>
      <text x="${520-RIGHT+8}" y="${y+BAR_H*.9}" font-size="13" font-weight="900" fill="${wrColor}">${wr}</text>
      <text x="${520-RIGHT+50}" y="${y+BAR_H*.9}" font-size="11" fill="var(--text3)">${ud.tg}\uC804 ${ud.active.length}\uBA85</text>`}).join("");return`<div style="width:100%;overflow:hidden;padding:4px 0">
    <svg viewBox="0 0 520 ${H}" width="100%" style="overflow:visible;display:block">
      ${rows}
    </svg>
  </div>`}function _b2WeeklyRaceStats(raceCount){return`<div class="b2w2-race-table">
    <div class="b2w2-race-head">
      <span>\uC0C1\uB300 \uC885\uC871</span>
      <span>\uC2B9</span>
      <span>\uD328</span>
      <span>\uCD1D\uC804</span>
      <span>\uC2B9\uB960</span>
    </div>
    ${[{key:"P",label:"\uD504\uB85C\uD1A0\uC2A4",ico:"\u{1F52E}",color:"#8b5cf6"},{key:"T",label:"\uD14C\uB780",ico:"\u2694\uFE0F",color:"#3b82f6"},{key:"Z",label:"\uC800\uADF8",ico:"\u{1F98E}",color:"#f59e0b"}].map(({key,label,ico,color})=>{const{w,l}=raceCount[key],t=w+l,wr=t?Math.round(w/t*100):null,wrColor=wr===null?"#94a3b8":wr>=60?"#10b981":wr>=40?"#f59e0b":"#ef4444";return`<div class="b2w2-race-row">
      <div class="b2w2-race-cell b2w2-race-cell-main">
        <span style="font-size:var(--fs-base);width:20px;text-align:center;flex-shrink:0">${ico}</span>
        <span style="font-size:var(--fs-caption);font-weight:800;color:var(--text2);white-space:nowrap">${label}</span>
      </div>
      <div class="b2w2-race-cell"><span class="b2w2-race-pill win">${w}</span></div>
      <div class="b2w2-race-cell"><span class="b2w2-race-pill loss">${l}</span></div>
      <div class="b2w2-race-cell"><span class="b2w2-race-count">${t}</span></div>
      <div class="b2w2-race-cell"><span class="b2w2-race-rate" style="color:${wrColor};border-color:${color}2e;background:${color}10">${wr!==null?`${wr}%`:"-"}</span></div>
    </div>`}).join("")}
  </div>`}function _b2WeeklyDelta(curr,prev){if(prev===null||curr===null)return"";const d=curr-prev;if(d===0)return`<span style="font-size:10px;color:var(--text3);margin-left:4px">\u2501 ${prev}%</span>`;const arrow=d>0?"\u25B2":"\u25BC";return`<span style="font-size:10px;font-weight:800;color:${d>0?"#10b981":"#ef4444"};margin-left:4px">${arrow}${Math.abs(d)}%</span><span style="font-size:10px;color:var(--text3);margin-left:2px">vs \uC804\uC8FC</span>`}

/* board2-briefing.js */
var __defProp=Object.defineProperty,__defProps=Object.defineProperties;var __getOwnPropDescs=Object.getOwnPropertyDescriptors;var __getOwnPropSymbols=Object.getOwnPropertySymbols;var __hasOwnProp=Object.prototype.hasOwnProperty,__propIsEnum=Object.prototype.propertyIsEnumerable;var __defNormalProp=(obj,key,value)=>key in obj?__defProp(obj,key,{enumerable:!0,configurable:!0,writable:!0,value}):obj[key]=value,__spreadValues=(a,b)=>{for(var prop in b||(b={}))__hasOwnProp.call(b,prop)&&__defNormalProp(a,prop,b[prop]);if(__getOwnPropSymbols)for(var prop of __getOwnPropSymbols(b))__propIsEnum.call(b,prop)&&__defNormalProp(a,prop,b[prop]);return a},__spreadProps=(a,b)=>__defProps(a,__getOwnPropDescs(b));function _b2FmtLocalYMD(d){const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,"0"),day=String(d.getDate()).padStart(2,"0");return`${y}-${m}-${day}`}function _b2WeeklyGetDefaultRange(offsetWeeks){const now=new Date,offset=offsetWeeks||0,day=now.getDay(),diffToMon=day===0?-6:1-day,mon=new Date(now);mon.setDate(now.getDate()+diffToMon+offset*7);const sun=new Date(mon);sun.setDate(mon.getDate()+6);const today=new Date(now.getFullYear(),now.getMonth(),now.getDate()),to=offset===0&&today<sun?today:sun;return{from:_b2FmtLocalYMD(mon),to:_b2FmtLocalYMD(to)}}function _b2MonthlyGetDefaultRange(offsetMonths,fullMonth){const now=new Date,offset=offsetMonths||0,base=new Date(now.getFullYear(),now.getMonth()+offset,1),from=new Date(base.getFullYear(),base.getMonth(),1),to=fullMonth?new Date(base.getFullYear(),base.getMonth()+1,0):offset===0?new Date(now.getFullYear(),now.getMonth(),now.getDate()):new Date(base.getFullYear(),base.getMonth()+1,0);return{from:_b2FmtLocalYMD(from),to:_b2FmtLocalYMD(to)}}function _b2EnsureStyleTag(id,cssText){try{const head=document.head||document.getElementsByTagName&&document.getElementsByTagName("head")[0];if(!head)return;const css=String(cssText||"");let el=document.getElementById(id);if(!el){el=document.createElement("style"),el.id=id,el.type="text/css",el.appendChild(document.createTextNode(css)),head.appendChild(el);return}(el.textContent||"")!==css&&(el.textContent=css)}catch(e){}}function _b2MvpFxDefaults(){return{on:!0,style:"fade",intensity:45,design:"photo"}}const _B2_MVP_FX_STYLES=["fade","vignette","topbottom","tint","spotlight","noir","diagonal","glass","none"],_B2_MVP_DESIGNS=["photo","panel","frame","glasscard","border","ribbon","split","poster"];function _b2MvpFxLoad(){const d=_b2MvpFxDefaults();try{const onRaw=localStorage.getItem("su_b2mvp_fx_on"),styleRaw=localStorage.getItem("su_b2mvp_fx_style"),intRaw=localStorage.getItem("su_b2mvp_fx_intensity"),designRaw=localStorage.getItem("su_b2mvp_design_mode"),on=onRaw===null?d.on:onRaw==="1",style=_B2_MVP_FX_STYLES.includes(styleRaw)?styleRaw:d.style,design=_B2_MVP_DESIGNS.includes(designRaw)?designRaw:d.design,intN=parseInt(intRaw,10),intensity=Number.isFinite(intN)?Math.max(0,Math.min(100,intN)):d.intensity;return{on,style,intensity,design}}catch(e){return d}}const _B2_BRIEFING_THEMES=["classic","minimal","vivid","mono","elegant","pastel","luxury","sports","esports","pop","nature","ocean","sunset","neon"];function _b2BriefingThemeLoad(){try{const v=localStorage.getItem("su_b2_briefing_theme");return _B2_BRIEFING_THEMES.includes(v)?v:"classic"}catch(e){return"classic"}}function _b2IsValidDateStr(s){return/^\d{4}-\d{2}-\d{2}$/.test(String(s||"").trim())}function _b2NormalizeBriefingRange(from,to){const f=String(from||"").trim().slice(0,10),t=String(to||"").trim().slice(0,10);if(!_b2IsValidDateStr(f)||!_b2IsValidDateStr(t))return{from:f,to:t,swapped:!1};const fn=parseInt(f.replace(/-/g,""),10)||0,tn=parseInt(t.replace(/-/g,""),10)||0;return fn&&tn&&fn>tn?{from:t,to:f,swapped:!0}:{from:f,to:t,swapped:!1}}function _b2BriefingLoadState(){try{const raw=localStorage.getItem("b2w2_state_v1");if(!raw)return null;const st=JSON.parse(raw);if(!st||typeof st!="object")return null;const preset=String(st.preset||"").trim(),from=String(st.from||"").trim(),to=String(st.to||"").trim(),univ=String(st.univ||"").trim()||"\uC804\uCCB4",okPreset=["thisWeek","lastWeek","thisMonth","lastMonth","custom","mvpArchive"].includes(preset),norm=_b2NormalizeBriefingRange(from,to);return{preset:okPreset?preset:null,from:_b2IsValidDateStr(norm.from)?norm.from:null,to:_b2IsValidDateStr(norm.to)?norm.to:null,univ}}catch(e){return null}}function _b2BriefingSaveState(){try{const preset=String(window._b2WeeklyPreset||"").trim(),from=String(window._b2WeeklyDateFrom||"").trim(),to=String(window._b2WeeklyDateTo||"").trim(),univ=String(window._b2WeeklyUniv||"\uC804\uCCB4").trim()||"\uC804\uCCB4",payload={preset:["thisWeek","lastWeek","thisMonth","lastMonth","custom","mvpArchive"].includes(preset)?preset:"custom",from,to,univ};localStorage.setItem("b2w2_state_v1",JSON.stringify(payload))}catch(e){}}function _b2BriefingPresetRange(preset){const key=String(preset||"thisWeek");return key==="lastWeek"?_b2WeeklyGetDefaultRange(-1):key==="thisMonth"?_b2MonthlyGetDefaultRange(0,!1):key==="lastMonth"?_b2MonthlyGetDefaultRange(-1,!0):_b2WeeklyGetDefaultRange(0)}function _b2SetBriefingPreset(preset){const r=_b2BriefingPresetRange(preset);window._b2WeeklyPreset=String(preset||"thisWeek"),window._b2WeeklyDateFrom=r.from,window._b2WeeklyDateTo=r.to,_b2BriefingSaveState(),typeof render=="function"&&render()}function _b2ResetBriefingFilters(){window._b2WeeklyUniv="\uC804\uCCB4",window._b2WeeklyChartSort="games";try{localStorage.setItem("b2w2_chart_sort_v1","games")}catch(e){}_b2SetBriefingPreset("thisWeek")}function _b2GetBriefingInputValues(){const f=document.getElementById("b2w2-from"),t=document.getElementById("b2w2-to"),s=document.getElementById("b2w2-univ"),fallback=_b2BriefingPresetRange("thisWeek");return{from:f&&f.value||window._b2WeeklyDateFrom||fallback.from,to:t&&t.value||window._b2WeeklyDateTo||fallback.to,univ:s&&s.value||window._b2WeeklyUniv||"\uC804\uCCB4"}}function _b2SyncBriefingCustomInputs(applyNow){const v=_b2GetBriefingInputValues(),norm=_b2NormalizeBriefingRange(v.from,v.to);if(window._b2WeeklyDateFrom=norm.from,window._b2WeeklyDateTo=norm.to,window._b2WeeklyUniv=v.univ,window._b2WeeklyPreset="custom",norm.swapped){const f=document.getElementById("b2w2-from"),t=document.getElementById("b2w2-to");f&&(f.value=norm.from),t&&(t.value=norm.to)}_b2BriefingSaveState(),applyNow&&typeof render=="function"&&render()}function _b2ApplyBriefingCustomFromInputs(){_b2SyncBriefingCustomInputs(!0)}function _b2ActivateBriefingCustom(focusInput){_b2SyncBriefingCustomInputs(!0),focusInput&&setTimeout(()=>{const el=document.getElementById("b2w2-from");el&&typeof el.focus=="function"&&el.focus();try{el&&typeof el.showPicker=="function"&&el.showPicker()}catch(e){}},30)}function _b2SetBriefingRecentDays(days){const n=Math.max(1,Number(days)||7),to=new Date;to.setHours(0,0,0,0);const from=new Date(to);from.setDate(to.getDate()-(n-1)),window._b2WeeklyPreset="custom",window._b2WeeklyDateFrom=_b2FmtLocalYMD(from),window._b2WeeklyDateTo=_b2FmtLocalYMD(to),_b2BriefingSaveState(),typeof render=="function"&&render()}function _b2SetMvpArchiveType(kind){window._b2MvpArchiveType=["week","month"].includes(kind)?kind:"all",typeof render=="function"&&render()}function _b2SetMvpArchiveUniv(val){window._b2MvpArchiveUniv=String(val||"\uC804\uCCB4").trim()||"\uC804\uCCB4",typeof render=="function"&&render()}function _b2OpenBriefingDateInput(which){const id=which==="to"?"b2w2-to":"b2w2-from",el=document.getElementById(id);if(!el)return;try{typeof el.focus=="function"&&el.focus()}catch(e){}try{if(typeof el.showPicker=="function"){el.showPicker();return}}catch(e){}const current=String(el.value||(which==="to"?window._b2WeeklyDateTo:window._b2WeeklyDateFrom)||"").trim(),input=window.prompt("\uB0A0\uC9DC\uB97C YYYY-MM-DD \uD615\uC2DD\uC73C\uB85C \uC785\uB825\uD558\uC138\uC694.",current);if(input==null)return;const raw=String(input).trim().replace(/\./g,"-").replace(/\//g,"-");if(!/^\d{4}-\d{2}-\d{2}$/.test(raw)){alert("\uB0A0\uC9DC \uD615\uC2DD\uC740 YYYY-MM-DD \uB85C \uC785\uB825\uD574\uC8FC\uC138\uC694.");return}el.value=raw,_b2SyncBriefingCustomInputs(!0)}function _b2SetWeeklyChartSort(mode){const next=mode==="winrate"?"winrate":"games";if(window._b2WeeklyChartSort!==next){window._b2WeeklyChartSort=next;try{localStorage.setItem("b2w2_chart_sort_v1",next)}catch(e){}typeof render=="function"&&render()}}try{typeof window._b2WeeklyChartSort=="undefined"&&(window._b2WeeklyChartSort=(()=>{try{return localStorage.getItem("b2w2_chart_sort_v1")||"games"}catch(e){return"games"}})())}catch(e){}function _b2WeeklyBriefingView(){var _a,_b,_c,_d,_e,_f,_g,_h,_i,_j,_k,_l,_m,_n,_o,_p,_q,_r,_s,_t,_u,_v,_w,_x,_y,_z,_A,_B,_C,_D,_E,_F,_G;try{if(typeof window._b2WeeklyPreset=="undefined"||!window._b2WeeklyDateFrom||!window._b2WeeklyDateTo||typeof window._b2WeeklyUniv=="undefined"){const st=_b2BriefingLoadState();st&&(typeof window._b2WeeklyPreset=="undefined"&&st.preset&&(window._b2WeeklyPreset=st.preset),!window._b2WeeklyDateFrom&&st.from&&(window._b2WeeklyDateFrom=st.from),!window._b2WeeklyDateTo&&st.to&&(window._b2WeeklyDateTo=st.to),typeof window._b2WeeklyUniv=="undefined"&&st.univ&&(window._b2WeeklyUniv=st.univ))}if(typeof window._b2WeeklyPreset=="undefined"&&(window._b2WeeklyPreset="thisWeek"),!window._b2WeeklyDateFrom||!window._b2WeeklyDateTo){const def=_b2BriefingPresetRange(window._b2WeeklyPreset);window._b2WeeklyDateFrom=def.from,window._b2WeeklyDateTo=def.to}typeof window._b2WeeklyUniv=="undefined"&&(window._b2WeeklyUniv="\uC804\uCCB4");const _normInit=_b2NormalizeBriefingRange(window._b2WeeklyDateFrom,window._b2WeeklyDateTo);window._b2WeeklyDateFrom=_normInit.from,window._b2WeeklyDateTo=_normInit.to;const preset=String(window._b2WeeklyPreset||"thisWeek"),dateFrom=window._b2WeeklyDateFrom,dateTo=window._b2WeeklyDateTo,fmtN=s=>parseInt(String(s||"").replace(/[-\.\/]/g,""))||0,diffDays=Math.round((new Date(dateTo)-new Date(dateFrom))/864e5)+1,prevTo=new Date(dateFrom);prevTo.setDate(prevTo.getDate()-1);const prevFrom=new Date(prevTo);prevFrom.setDate(prevFrom.getDate()-(diffDays-1));const prevDateFrom=_b2FmtLocalYMD(prevFrom),prevDateTo=_b2FmtLocalYMD(prevTo),_dissSet=new Set((typeof univCfg!="undefined"?univCfg:[]).filter(u=>u.dissolved||u.hidden).map(u=>String(u.name||"").trim())),vis=players.filter(p=>!p.hidden&&!p.retired&&!p.hideFromBoard&&!_dissSet.has(String((p==null?void 0:p.univ)||"").trim())),univList=(_b2VisUnivs?_b2VisUnivs():[]).filter(u=>u.name&&u.name!=="\uBB34\uC18C\uC18D"),selUniv=window._b2WeeklyUniv||"\uC804\uCCB4",fmtDate=s=>String(s||"").slice(0,10).replace(/-/g,"."),_briefingMeta={thisWeek:{kicker:"Weekly Briefing",title:"\uBE0C\uB9AC\uD551",short:"\uC774\uBC88\uC8FC",prevLabel:"\uC9C0\uB09C\uC8FC",desc:"\uC774\uBC88 \uC8FC \uD65C\uB3D9\uACFC \uD750\uB984\uC744 \uCE74\uB4DC \uC704\uC8FC\uB85C \uBE60\uB974\uAC8C \uD6D1\uC5B4\uBCFC \uC218 \uC788\uB3C4\uB85D \uC815\uB9AC\uD55C \uD654\uBA74\uC785\uB2C8\uB2E4."},lastWeek:{kicker:"Weekly Briefing",title:"\uBE0C\uB9AC\uD551",short:"\uC9C0\uB09C\uC8FC",prevLabel:"\uADF8 \uC804 \uC8FC",desc:"\uC9C0\uB09C\uC8FC \uD65C\uB3D9 \uD750\uB984\uACFC \uC8FC\uC694 \uBCC0\uD654\uB97C \uB418\uC9DA\uC5B4\uBCF4\uAE30 \uC88B\uAC8C \uC815\uB9AC\uD55C \uD654\uBA74\uC785\uB2C8\uB2E4."},thisMonth:{kicker:"Monthly Briefing",title:"\uC6D4\uAC04 \uBE0C\uB9AC\uD551",short:"\uC774\uBC88\uB2EC",prevLabel:"\uC9C0\uB09C\uB2EC",desc:"\uC774\uBC88 \uB2EC \uD65C\uB3D9 \uD750\uB984\uACFC \uC6D4\uAC04 \uBCC0\uD654 \uD3EC\uC778\uD2B8\uB97C \uD55C \uD654\uBA74\uC5D0\uC11C \uBCF4\uAE30 \uC88B\uAC8C \uC815\uB9AC\uD55C \uD654\uBA74\uC785\uB2C8\uB2E4."},lastMonth:{kicker:"Monthly Briefing",title:"\uC6D4\uAC04 \uBE0C\uB9AC\uD551",short:"\uC9C0\uB09C\uB2EC",prevLabel:"\uADF8 \uC804 \uB2EC",desc:"\uC9C0\uB09C\uB2EC \uD65C\uB3D9 \uD750\uB984\uACFC \uC6D4\uAC04 \uC694\uC57D\uC744 \uB418\uB3CC\uC544\uBCF4\uAE30 \uC88B\uAC8C \uC815\uB9AC\uD55C \uD654\uBA74\uC785\uB2C8\uB2E4."},custom:{kicker:"Period Briefing",title:"\uAE30\uAC04 \uBE0C\uB9AC\uD551",short:"\uC0AC\uC6A9\uC790 \uAE30\uAC04",prevLabel:"\uC774\uC804 \uAE30\uAC04",desc:"\uC9C1\uC811 \uC9C0\uC815\uD55C \uAE30\uAC04\uC758 \uD65C\uB3D9 \uD750\uB984\uACFC \uD575\uC2EC \uBCC0\uD654\uB97C \uBE44\uAD50\uD574\uC11C \uBCF4\uB294 \uD654\uBA74\uC785\uB2C8\uB2E4."}},_briefingInfo=_briefingMeta[preset]||_briefingMeta.custom,_isMonthly=preset==="thisMonth"||preset==="lastMonth",_isCustom=preset==="custom",_isArchive=preset==="mvpArchive",_mvpLabel=preset==="thisMonth"?"\uC774\uB2EC MVP":preset==="lastMonth"?"\uC9C0\uB09C\uB2EC MVP":"\uC774\uBC88 \uC8FC MVP",_topLabel=_isMonthly?"\uD65C\uB3D9 \uB9CE\uC740 \uB300\uD559 TOP 5":"\uD65C\uB3D9 \uB9CE\uC740 \uB300\uD559 TOP 3",_topLimit=_isMonthly?5:3,_chartSort=window._b2WeeklyChartSort==="winrate"?"winrate":"games",curStats=_b2WeeklyUnivStats(vis,dateFrom,dateTo,univList,_chartSort),prevStats=_b2WeeklyUnivStats(vis,prevDateFrom,prevDateTo,univList),prevMap={};prevStats.forEach(ud=>{prevMap[ud.u.name]=ud});const targetStats=selUniv==="\uC804\uCCB4"?curStats:curStats.filter(ud=>ud.u.name===selUniv),mvp=_b2WeeklyMVP(curStats),mvp2=_b2WeeklyMVP2(curStats,mvp),worstPlayer=_b2WeeklyWorst(curStats),_mvpFx=_b2MvpFxLoad(),_mvpFxOp=((_mvpFx.on?_mvpFx.intensity:0)/100).toFixed(3),_mvpFxStyleAttr=_mvpFx.on?_mvpFx.style:"none",_mkMvpCard=(s,rank,isWorst,extraClass)=>_b2BuildMvpCardHtml(s,rank,isWorst,extraClass,{isMonthly:_isMonthly,mvpLabel:_mvpLabel,mvpFxStyleAttr:_mvpFxStyleAttr,mvpFxDesign:_mvpFx.design,mvpFxOp:_mvpFxOp}),curPlayerStats=_b2WeeklyAggregate(vis,dateFrom,dateTo),prevPlayerStats=_b2WeeklyAggregate(vis,prevDateFrom,prevDateTo),prevPlayerMap={};prevPlayerStats.forEach(s=>{var _a2;prevPlayerMap[((_a2=s.p)==null?void 0:_a2.name)||""]=s});const activePlayers=curPlayerStats.filter(s=>s.total>0),topUnivs=[...curStats].filter(ud=>ud.tg>0).sort((a,b)=>{var _a2,_b2;return b.tg-a.tg||b.active.length-a.active.length||((_a2=b.wr)!=null?_a2:-1)-((_b2=a.wr)!=null?_b2:-1)}).slice(0,_topLimit),silentUnivs=curStats.filter(ud=>ud.tg===0).map(ud=>ud.u.name),risingPlayers=activePlayers.map(s=>{var _a2,_b2,_c2;const prev=prevPlayerMap[((_a2=s.p)==null?void 0:_a2.name)||""]||null,prevWr=prev&&prev.total>0&&(_b2=prev.winRate)!=null?_b2:0,prevTotal=prev&&prev.total||0;return __spreadProps(__spreadValues({},s),{wrDelta:((_c2=s.winRate)!=null?_c2:0)-prevWr,totalDelta:s.total-prevTotal,prevTotal})}).filter(s=>s.total>=2).sort((a,b)=>b.wrDelta-a.wrDelta||b.totalDelta-a.totalDelta||b.wins-a.wins),hotPlayer=risingPlayers[0]||null,decliningPlayers=risingPlayers.filter(s=>s.prevTotal>=2&&s.wrDelta<0).slice().sort((a,b)=>a.wrDelta-b.wrDelta||a.totalDelta-b.totalDelta),coldPlayer=decliningPlayers[0]||null,_calcStreak=_b2CalcStreak,streakPlayers=activePlayers.map(s=>__spreadProps(__spreadValues({},s),{streak:_calcStreak(s.hist,"\uC2B9")})).filter(s=>s.streak>=2).sort((a,b)=>b.streak-a.streak),streakPlayer=streakPlayers[0]||null,loseStreakPlayers=activePlayers.map(s=>__spreadProps(__spreadValues({},s),{streak:_calcStreak(s.hist,"\uD328")})).filter(s=>s.streak>=2).sort((a,b)=>b.streak-a.streak),loseStreakPlayer=loseStreakPlayers[0]||null,bestWrPlayers=activePlayers.filter(s=>s.total>=3).slice().sort((a,b)=>{var _a2,_b2;return((_a2=b.winRate)!=null?_a2:-1)-((_b2=a.winRate)!=null?_b2:-1)||b.total-a.total}),bestWrPlayer=bestWrPlayers[0]||null,mostWinsPlayers=activePlayers.filter(s=>(s.wins||0)>0).slice().sort((a,b)=>{var _a2,_b2;return b.wins-a.wins||b.total-a.total||((_a2=b.winRate)!=null?_a2:-1)-((_b2=a.winRate)!=null?_b2:-1)}),mostWinsPlayer=mostWinsPlayers[0]||null,mostActivePlayers=activePlayers.filter(s=>s.total>0).slice().sort((a,b)=>{var _a2,_b2;return b.total-a.total||((_a2=b.winRate)!=null?_a2:-1)-((_b2=a.winRate)!=null?_b2:-1)}),mostActivePlayer=mostActivePlayers[0]||null,monthlyTopPlayers=[...activePlayers].sort((a,b)=>{var _a2,_b2;return b.total-a.total||b.wins-a.wins||((_a2=b.winRate)!=null?_a2:-1)-((_b2=a.winRate)!=null?_b2:-1)}).slice(0,5),monthlyMvp=monthlyTopPlayers[0]||null,_rankSort=_b2RankSortUnivs,rankedUnivs=_b2BuildRankedUnivs(curStats,prevStats),rankedUnivLeaders=rankedUnivs,monthlyUnivAces=rankedUnivs.map(ud=>__spreadProps(__spreadValues({},ud),{ace:_b2WeeklyUnivMVP(ud.active)})),_monthlyPreviewCount=rankedUnivLeaders.length,_monthlyRankMoreId=`b2w2-monthly-ranks-more-${preset}`,_monthlyRankBtnId=`b2w2-monthly-ranks-btn-${preset}`,_monthlyAceMoreId=`b2w2-monthly-aces-more-${preset}`,_monthlyAceBtnId=`b2w2-monthly-aces-btn-${preset}`,monthlyAceSpotlight=monthlyUnivAces.find(item=>item.ace)||null,_bfEsc=typeof window.escHTML=="function"?window.escHTML:s=>String(s!=null?s:""),_heroSummary=(()=>{var _a2,_b2,_c2;const parts=[];return _isMonthly&&rankedUnivs[0]?parts.push(`${_bfEsc(rankedUnivs[0].u.name)} ${rankedUnivs[0].tw}\uC2B9 ${rankedUnivs[0].tl}\uD328 \xB7 \uC2B9\uB960 ${(_a2=rankedUnivs[0].wr)!=null?_a2:0}%\uB85C 1\uC704`):topUnivs[0]&&parts.push(`${_bfEsc(topUnivs[0].u.name)} \uD65C\uB3D9\uB7C9 1\uC704 \xB7 ${topUnivs[0].tg}\uC804 \xB7 \uD65C\uB3D9 ${topUnivs[0].active.length}\uBA85`),hotPlayer&&hotPlayer.wrDelta>0&&parts.push(`${_bfEsc(((_b2=hotPlayer.p)==null?void 0:_b2.name)||"-")} \uC2B9\uB960 \uBCC0\uB3D9 ${hotPlayer.wrDelta>0?"+":""}${hotPlayer.wrDelta}%p`),_isMonthly&&monthlyAceSpotlight&&parts.push(`${_bfEsc(monthlyAceSpotlight.u.name)} \uC5D0\uC774\uC2A4 ${_bfEsc(((_c2=monthlyAceSpotlight.ace.p)==null?void 0:_c2.name)||"-")}`),silentUnivs.length&&parts.push(`\uAE30\uB85D \uC5C6\uB294 \uB300\uD559 ${silentUnivs.length}\uACF3`),parts.length?`${parts.join(" \xB7 ")}.`:"\uC120\uD0DD \uAE30\uAC04 \uD65C\uB3D9\uB7C9\uACFC \uBE44\uAD50 \uC9C0\uD45C\uB97C \uC815\uB9AC\uD588\uC2B5\uB2C8\uB2E4."})(),_heroSpotlight=(()=>{var _a2;if(_isMonthly&&rankedUnivs[0]){const leader=rankedUnivs[0],rankDeltaTxt=leader.rankDelta===null?"\uCCAB \uC9D1\uACC4":leader.rankDelta>0?`\uC804\uAE30 \uB300\uBE44 \u25B2${leader.rankDelta}`:leader.rankDelta<0?`\uC804\uAE30 \uB300\uBE44 \u25BC${Math.abs(leader.rankDelta)}`:"\uC804\uAE30\uC640 \uB3D9\uC77C";return`${_bfEsc(leader.u.name)} 1\uC704 \xB7 ${leader.tw}\uC2B9 ${leader.tl}\uD328 \xB7 \uC2B9\uB960 ${(_a2=leader.wr)!=null?_a2:0}% \xB7 ${rankDeltaTxt}`}return topUnivs[0]?`${_bfEsc(topUnivs[0].u.name)} \uD65C\uB3D9\uB7C9 1\uC704 \xB7 ${topUnivs[0].tg}\uC804 \xB7 \uD65C\uB3D9 ${topUnivs[0].active.length}\uBA85`:"\uC120\uD0DD \uAE30\uAC04 \uD575\uC2EC \uC9C0\uD45C\uB97C \uBE60\uB974\uAC8C \uD655\uC778\uD560 \uC218 \uC788\uB3C4\uB85D \uC815\uB9AC\uD588\uC2B5\uB2C8\uB2E4"})(),_heroFocusLabel=_isMonthly?"\uC9D1\uACC4 \uBC94\uC704":_isCustom?"\uC0AC\uC6A9\uC790 \uAE30\uAC04":"\uC8FC\uAC04 \uBC94\uC704",_heroFocusValue=_isMonthly?`\uB300\uD559 ${rankedUnivs.length}\uACF3`:`\uD65C\uB3D9 ${activePlayers.length}\uBA85`,_heroCompareText=`${_briefingInfo.prevLabel} ${fmtDate(prevDateFrom)} ~ ${fmtDate(prevDateTo)}`;_b2EnsureStyleTag("b2w2-style",`
      /* \u2500\u2500 \uBE0C\uB9AC\uD551 \uB798\uD37C: \uC2E0\uBB38/\uB9E4\uAC70\uC9C4 \uCEE8\uC149 \uC720\uC9C0, \uAC00\uB3C5\uC131\xB7\uACC4\uCE35\xB7\uC0C9\uC0C1 \uC804\uBA74 \uAC15\uD654 \u2500\u2500 */
      .b2w2-wrap {
        width: min(100%, 1320px);
        max-width: 1320px;
        margin: 0 auto;
        font-family: 'Noto Sans KR', -apple-system, sans-serif;
        /* \uD1A0\uD070 */
        --b2w-accent: var(--blue, #2563eb);
        --b2w-accent-strong: var(--blue-d, #1a3fb0);
        --b2w-accent-soft: var(--blue-l, rgba(37,99,235,.08));
        --b2w-gold: #b8862c;
        --b2w-gold-soft: rgba(184,134,44,.14);
        --b2w-ink: var(--text1, #111827);
        --b2w-ink-mid: var(--text2, #374151);
        --b2w-ink-soft: var(--text3, #6b7280);
        --b2w-rule: var(--border, rgba(17,24,39,.15));
        --b2w-rule-hard: var(--border2, rgba(17,24,39,.55));
        --b2w-rule-soft: var(--border, rgba(17,24,39,.10));
        --b2w-paper: var(--surface, #f8f8f5);
        --b2w-paper-alt: var(--white, #fffdf9);
        --b2w-paper-warm: var(--surface, #faf7f0);
        --b2w-shadow: var(--sh2, 0 12px 32px rgba(15,23,42,.09));
        --b2w-shadow-sm: var(--sh, 0 3px 9px rgba(15,23,42,.055));
        --b2w-r: 14px;
        --b2w-r-lg: 20px;
        --b2w-accent-border: rgba(37,99,235,.22);
        --b2w-accent-shadow: rgba(37,99,235,.10);
        --b2w-accent-shadow-strong: rgba(37,99,235,.16);
        --b2w-btn-text: #fff;
        --b2w-tag-bg: var(--surface, #f1f5f9);
        --b2w-tag-border: var(--border, #e2e8f0);
        --b2w-tag-text: var(--text2, #374151);
        --b2w-tag-muted: var(--text3, #6b7280);
        --b2w-tag-accent-bg: var(--blue-l, #eff6ff);
        --b2w-tag-accent-border: rgba(37,99,235,.22);
        /* \uAC00\uB3C5\uC131 \uAC15\uD654: \uC605\uC740 \uD68C\uC0C9 \uBCF4\uC870 \uD14D\uC2A4\uD2B8\uAC00 \uC798 \uC548 \uBCF4\uC778\uB2E4\uB294 \uD53C\uB4DC\uBC31 \uBC18\uC601 */
        --text3: #52525b;
      }
      body.dark .b2w2-wrap {
        --b2w-accent-border: rgba(96,165,250,.30);
        --b2w-accent-shadow: rgba(96,165,250,.14);
        --b2w-accent-shadow-strong: rgba(96,165,250,.20);
        --b2w-btn-text: #0f172a;
        --b2w-tag-accent-border: rgba(96,165,250,.28);
        --b2w-gold: #e0b45a;
        --b2w-gold-soft: rgba(224,180,90,.16);
        --text3: #b8c2cf;
      }
      .b2w2-wrap *, .b2w2-wrap *::before, .b2w2-wrap *::after { box-sizing: border-box; }
      .b2w2-wrap b, .b2w2-wrap strong { font-weight: 800 }

      /* \u2500\u2500 Masthead \u2500\u2500 */
      .b2w2-masthead {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 0 12px;
        margin-bottom: 6px;
        font-size: 10px;
        font-weight: 800;
        letter-spacing: .18em;
        text-transform: uppercase;
        color: var(--b2w-ink-soft);
      }
      .b2w2-masthead::after {
        content: '';
        position: absolute;
        left: 0; right: 0; bottom: 0;
        height: 3px;
        background: linear-gradient(90deg, var(--b2w-accent) 0%, var(--b2w-accent) 28%, var(--b2w-gold) 28%, var(--b2w-gold) 38%, var(--b2w-rule-hard) 38%, var(--b2w-rule-hard) 100%);
        opacity: .9;
      }
      .b2w2-masthead-brand {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        color: var(--b2w-ink);
      }
      .b2w2-masthead-mark {
        width: 16px; height: 16px;
        border-radius: 4px;
        background: linear-gradient(135deg, var(--b2w-gold), var(--b2w-accent) 60%, var(--b2w-accent-strong));
        box-shadow: 0 2px 6px var(--b2w-accent-shadow-strong, rgba(37,99,235,.2));
        flex-shrink: 0;
      }

      /* \u2500\u2500 Hero \u2500\u2500 */
      .b2w2-hero {
        position: relative;
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 24px;
        padding: 22px 24px 24px;
        margin-bottom: 20px;
        border-bottom: 3px double var(--b2w-rule-hard);
        background:
          radial-gradient(circle at 6px 6px, var(--b2w-rule-soft) 1px, transparent 1.6px) 0 0/18px 18px,
          linear-gradient(180deg, var(--b2w-accent-soft) 0%, transparent 65%);
        border-radius: var(--b2w-r-lg) var(--b2w-r-lg) 0 0;
        box-shadow: var(--b2w-shadow-sm);
      }
      .b2w2-hero-main { display: flex; flex-direction: column; gap: 10px; min-width: 0; flex: 1 }
      .b2w2-hero-title {
        position: relative;
        font-family: 'Noto Serif KR', Georgia, serif;
        font-size: 36px;
        font-weight: 900;
        letter-spacing: -.02em;
        color: var(--b2w-ink);
        line-height: 1.04;
        background: linear-gradient(180deg, var(--b2w-ink) 55%, var(--b2w-ink-mid) 130%);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      .b2w2-hero-desc {
        position: relative;
        margin-top: 4px;
        font-size: 13px;
        line-height: 1.75;
        color: var(--b2w-ink-mid);
        max-width: 880px;
        font-family: 'Noto Serif KR', Georgia, serif;
        font-style: italic;
        border-left: 3px solid var(--b2w-gold);
        padding-left: 13px;
        background: var(--b2w-accent-soft);
        padding-top: 6px;
        padding-bottom: 6px;
        border-radius: 0 var(--b2w-r) var(--b2w-r) 0;
      }
      .b2w2-hero-meta {
        display: flex;
        flex-direction: column;
        min-width: min(100%, 300px);
        flex-shrink: 0;
        padding: 16px 18px;
        border: 1px solid var(--b2w-rule);
        border-radius: var(--b2w-r-lg);
        background: var(--b2w-paper-alt);
        box-shadow: var(--b2w-shadow-sm);
      }
      .b2w2-hero-meta-kicker {
        font-size: 10px;
        font-weight: 800;
        letter-spacing: .16em;
        text-transform: uppercase;
        color: var(--b2w-accent);
      }
      .b2w2-hero-meta-headline {
        margin-top: 6px;
        font-family: 'Noto Serif KR', Georgia, serif;
        font-size: 16px;
        font-weight: 800;
        letter-spacing: -.01em;
        line-height: 1.35;
        color: var(--b2w-ink);
        padding-bottom: 12px;
        border-bottom: 1px solid var(--b2w-rule-soft);
      }
      .b2w2-hero-meta-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0,1fr));
        gap: 12px 10px;
        margin-top: 12px;
      }
      .b2w2-hero-meta-label { font-size: 10px; font-weight: 800; color: var(--b2w-ink-soft); text-transform: uppercase; letter-spacing: .06em }
      .b2w2-hero-meta-value { margin-top: 4px; font-size: 13px; font-weight: 800; color: var(--b2w-ink); letter-spacing: -.01em; word-break: keep-all }


      /* \u2500\u2500 KPI Grid \u2500\u2500 */
      .b2w2-kpi-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0,1fr));
        gap: 10px;
        margin-bottom: 20px;
      }
      .b2w2-kpi-card {
        padding: 14px 16px;
        border-radius: 14px;
        border: 1px solid var(--b2w-rule);
        background: linear-gradient(165deg, var(--b2w-paper-alt) 0%, var(--b2w-paper-alt) 72%, rgba(15,23,42,.03) 100%);
        background: linear-gradient(165deg, var(--b2w-paper-alt) 0%, var(--b2w-paper-alt) 70%, color-mix(in srgb, var(--kpi-accent, var(--b2w-accent)) 7%, var(--b2w-paper-alt)) 100%);
        box-shadow: var(--b2w-shadow-sm);
        transition: transform .16s cubic-bezier(.2,.8,.3,1.2), box-shadow .16s ease, border-color .16s ease;
        position: relative;
        overflow: hidden;
      }
      .b2w2-kpi-card::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 3px;
        background: linear-gradient(90deg, var(--kpi-accent, var(--b2w-accent)), transparent);
        border-radius: 14px 14px 0 0;
      }
      .b2w2-kpi-card::after {
        content: '';
        position: absolute;
        top: -20px; right: -20px;
        width: 70px; height: 70px;
        border-radius: 50%;
        background: radial-gradient(circle, var(--kpi-accent, var(--b2w-accent)), transparent 72%);
        opacity: .12;
        pointer-events: none;
      }
      .b2w2-kpi-card:hover { transform: translateY(-3px); box-shadow: 0 10px 26px rgba(0,0,0,.10); border-color: rgba(148,163,184,.22) }
      .b2w2-kpi-label { font-size: 10px; font-weight: 800; color: var(--b2w-ink-soft); letter-spacing: .1em; text-transform: uppercase }
      .b2w2-kpi-value {
        margin-top: 6px;
        font-size: 28px;
        font-weight: 900;
        letter-spacing: -.03em;
        color: var(--b2w-ink);
        line-height: 1.1;
      }
      .b2w2-kpi-sub { margin-top: 4px; font-size: 11px; font-weight: 600; color: var(--b2w-ink-soft); line-height: 1.4 }

      /* \u2500\u2500 \uCEE8\uD2B8\uB864 \uD5E4\uB354 \u2500\u2500 */
      .b2w2-hdr {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
        padding: 10px 14px;
        border: 1px solid var(--b2w-rule);
        border-radius: var(--b2w-r-lg);
        margin-bottom: 16px;
        background: var(--b2w-paper);
        box-shadow: var(--b2w-shadow-sm);
      }
      .b2w2-din {
        padding: 5px 10px;
        border-radius: var(--b2w-r);
        border: 1px solid var(--b2w-rule);
        font-size: 12px;
        background: var(--white);
        color: var(--text2);
        box-shadow: var(--b2w-shadow-sm);
        min-width: 132px;
        cursor: pointer;
        transition: border-color .14s ease;
      }
      .b2w2-din:focus { border-color: var(--b2w-accent); outline: none }
      .b2w2-datebtn {
        padding: 5px 10px;
        border-radius: var(--b2w-r);
        border: 1px solid var(--b2w-rule);
        background: var(--b2w-paper-alt);
        font-size: 12px;
        font-weight: 700;
        color: var(--b2w-ink-mid);
        cursor: pointer;
        box-shadow: var(--b2w-shadow-sm);
        transition: border-color .14s ease, color .14s ease, background .14s ease;
      }
      .b2w2-datebtn:hover { border-color: var(--b2w-accent); color: var(--b2w-accent); background: var(--b2w-accent-soft) }
      .b2w2-din::-webkit-calendar-picker-indicator { cursor: pointer; opacity: .95 }
      .b2w2-sel {
        padding: 5px 10px;
        border-radius: var(--b2w-r);
        border: 1px solid var(--b2w-rule);
        font-size: 12px;
        background: var(--white);
        color: var(--text2);
        max-width: 220px;
        box-shadow: var(--b2w-shadow-sm);
      }
      .b2w2-btn {
        padding: 6px 16px;
        border-radius: var(--b2w-r);
        background: var(--b2w-accent);
        color: var(--b2w-btn-text);
        border: none;
        font-size: 12px;
        font-weight: 800;
        cursor: pointer;
        letter-spacing: .02em;
        box-shadow: var(--b2w-shadow-sm);
        transition: background .14s ease, transform .1s ease;
      }
      .b2w2-btn:hover { background: var(--b2w-accent-strong); transform: translateY(-1px) }
      .b2w2-btn:focus-visible { outline: 2px solid var(--b2w-accent); outline-offset: 2px }
      .b2w2-savebtn {
        background: linear-gradient(135deg, #fff5f5, #fee2e2 60%, #fecaca);
        color: #9f1d1d;
        border: 1px solid rgba(159,29,29,.28);
        box-shadow: 0 4px 14px rgba(159,29,29,.16), inset 0 1px 0 rgba(255,255,255,.7);
        font-weight: 900;
      }
      .b2w2-savebtn:hover {
        background: linear-gradient(135deg, #fee2e2, #fecaca 55%, #fca5a5);
        color: #7f1414;
        box-shadow: 0 8px 20px rgba(159,29,29,.22), inset 0 1px 0 rgba(255,255,255,.7);
      }

      /* \u2500\u2500 \uBAA8\uB4DC \uC120\uD0DD \uBC14 \u2500\u2500 */
      .b2w2-modebar {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px,1fr));
        gap: 10px;
        margin-bottom: 20px;
      }
      .b2w2-modecard {
        padding: 16px 18px;
        border-radius: var(--b2w-r-lg);
        border: 1.5px solid var(--b2w-rule);
        background: var(--b2w-paper);
        box-shadow: var(--b2w-shadow-sm);
        display: flex;
        flex-direction: column;
        gap: 10px;
        transition: border-color .16s ease, box-shadow .16s ease, background .16s ease, transform .16s ease;
        cursor: pointer;
      }
      .b2w2-modecard:hover {
        border-color: var(--b2w-accent-border);
        background: var(--b2w-paper-warm);
        box-shadow: 0 4px 14px var(--b2w-accent-shadow);
        transform: translateY(-1px);
      }
      .b2w2-modecard.is-active {
        background: var(--b2w-paper-alt);
        border-color: var(--b2w-accent);
        box-shadow: 0 0 0 3px var(--b2w-accent-soft), 0 4px 14px var(--b2w-accent-shadow-strong);
      }
      .b2w2-modecard.is-active .b2w2-modekicker { color: var(--b2w-accent) }
      .b2w2-modecard.is-active .b2w2-modetitle { color: var(--b2w-ink) }
      .b2w2-modecard.is-active .b2w2-modebadge {
        border-color: var(--b2w-accent);
        color: var(--b2w-accent);
        background: var(--b2w-accent-soft);
      }
      .b2w2-modehead { display: flex; align-items: center; justify-content: space-between; gap: 8px }
      .b2w2-modekicker { font-size: 10px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; color: var(--b2w-ink-soft) }
      .b2w2-modetitle {
        font-family: 'Noto Serif KR', Georgia, serif;
        font-size: 17px;
        font-weight: 800;
        color: var(--b2w-ink-mid);
        letter-spacing: -.01em;
      }
      .b2w2-modedesc { font-size: 11px; line-height: 1.65; color: var(--b2w-ink-soft) }
      .b2w2-presetrow { display: flex; gap: 6px; flex-wrap: wrap }
      .b2w2-preset {
        padding: 4px 11px;
        border-radius: 999px;
        border: 1px solid var(--b2w-rule);
        background: var(--white);
        font-size: 11px;
        font-weight: 700;
        color: var(--b2w-ink-mid);
        cursor: pointer;
        transition: border-color .12s ease, background .12s ease, color .12s ease;
      }
      .b2w2-preset:hover { border-color: var(--b2w-accent); color: var(--b2w-accent); background: var(--b2w-accent-soft) }
      .b2w2-preset.on { background: var(--b2w-accent); color: var(--b2w-btn-text); border-color: var(--b2w-accent) }
      .b2w2-preset:focus-visible { outline: 2px solid var(--b2w-accent); outline-offset: 2px }
      .b2w2-modebadge {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 3px 9px;
        border-radius: 999px;
        border: 1px solid var(--b2w-rule);
        background: var(--white);
        font-size: 10px;
        font-weight: 800;
        color: var(--b2w-ink-soft);
        letter-spacing: .03em;
        white-space: nowrap;
      }

      /* \u2500\u2500 MVP \uD2B8\uB9AC\uD50C \uBC30\uB108 \u2500\u2500 */
      .b2w2-mvp-triple {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 16px;
        margin-bottom: 20px;
      }
      /* \u2500\u2500 \uC804\uCCB4 \uC774\uBBF8\uC9C0\uD615 MVP \uCE74\uB4DC \u2500\u2500 */
      .b2w2-mvp-card {
        border-radius:var(--r2);
        border: none;
        position: relative;
        overflow: hidden;
        aspect-ratio: 4/3;
        min-height: 150px;
        cursor: pointer;
        transition: transform .22s cubic-bezier(.34,1.56,.64,1), box-shadow .22s ease;
        isolation: isolate;
      }
      .b2w2-mvp-card:hover {
        transform: translateY(-4px) scale(1.012);
        /* \uAC80\uC740\uC0C9 \uADF8\uB9BC\uC790 + \uD604\uC7AC \uBE0C\uB9AC\uD551 \uD14C\uB9C8\uC758 \uD3EC\uC778\uD2B8 \uCEEC\uB7EC\uB97C \uC0B4\uC9DD \uC5B9\uC740 \uAE00\uB85C\uC6B0 \uB9C1 \u2014 \uD14C\uB9C8\uB9C8\uB2E4 hover \uB290\uB08C\uC774 \uB2EC\uB77C\uC9D0 */
        box-shadow: 0 20px 44px rgba(0,0,0,.20), 0 0 0 1px var(--b2w-accent-shadow-strong, rgba(0,0,0,.12)), 0 10px 26px var(--b2w-accent-shadow, rgba(0,0,0,.10));
      }
      /* hover \uC2DC \uCE74\uB4DC \uC704\uB85C \uB300\uAC01\uC120 \uD558\uC774\uB77C\uC774\uD2B8\uAC00 \uD55C \uBC88 \uC2A4\uC73D \uC9C0\uB098\uAC00\uB294 \uC0E4\uC778 \uC2A4\uC715 \uC5F0\uCD9C */
      .b2w2-mvp-card::after {
        content: '';
        position: absolute;
        inset: 0;
        z-index: 4;
        pointer-events: none;
        background: linear-gradient(115deg, transparent 42%, rgba(255,255,255,.32) 50%, transparent 58%);
        transform: translateX(-130%);
        transition: transform .6s ease;
      }
      .b2w2-mvp-card:hover::after {
        transform: translateX(130%);
      }

      /* \uBC30\uACBD \uC774\uBBF8\uC9C0 \uB808\uC774\uC5B4 */
      .b2w2-mvp-bg {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center top;
        transition: transform .3s ease;
        z-index: 0;
      }
      .b2w2-mvp-card:hover .b2w2-mvp-bg { transform: scale(1.04) }

      /* \uC774\uBBF8\uC9C0 \uC5C6\uC744 \uB54C \uD3F4\uBC31 \uBC30\uACBD */
      .b2w2-mvp-bg-fallback {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 72px;
        font-weight: 900;
        z-index: 0;
        letter-spacing: -.04em;
      }

      /* \uD504\uB85C\uD544 \uC774\uBBF8\uC9C0 \uC704 \uAC00\uB3C5\uC131 \uBCF4\uC870 \uC624\uBC84\uB808\uC774 \u2014 \uAC15\uB3C4/\uC2A4\uD0C0\uC77C\uC740 \uC124\uC815\uD0ED "\uBE0C\uB9AC\uD551 MVP \uCE74\uB4DC \uD6A8\uACFC"\uC5D0\uC11C \uC870\uC808 \uAC00\uB2A5 */
      .b2w2-mvp-overlay {
        display: block;
        position: absolute;
        inset: 0;
        z-index: 1;
        pointer-events: none;
        /* \uAE30\uBCF8(fade) \uC2A4\uD0C0\uC77C: --b2mvp-fx-op(0~1)\uB85C \uAC15\uB3C4\uB97C \uC870\uC808, \uC6D0\uBCF8 100% \uAC15\uB3C4 \uAE30\uC900 \uC0C9\uC0C1\uAC12\uC740 \uC720\uC9C0 */
        background: linear-gradient(180deg,
          rgba(15,23,42,0) 0%,
          rgba(15,23,42, calc(var(--b2mvp-fx-op, 0.45) * 0.10)) 25%,
          rgba(15,23,42, calc(var(--b2mvp-fx-op, 0.45) * 0.52)) 65%,
          rgba(2,6,23, calc(var(--b2mvp-fx-op, 0.45) * 0.86)) 100%);
      }
      /* \uD6A8\uACFC \uC2A4\uD0C0\uC77C: \uBE44\uB124\uD2B8 \u2014 \uD558\uB2E8 \uC911\uC559\uC5D0\uC11C \uC740\uC740\uD558\uAC8C \uD37C\uC9C0\uB294 \uC74C\uC601 */
      .b2w2-mvp-card[data-fx="vignette"] .b2w2-mvp-overlay {
        background:
          radial-gradient(ellipse at 50% 118%, rgba(2,6,23, calc(var(--b2mvp-fx-op, 0.45) * 1.35)) 0%, rgba(2,6,23,0) 60%),
          linear-gradient(180deg, rgba(15,23,42,0) 62%, rgba(15,23,42, calc(var(--b2mvp-fx-op, 0.45) * 0.42)) 100%);
      }
      /* \uD6A8\uACFC \uC2A4\uD0C0\uC77C: \uC0C1\uD558 \uADF8\uB77C\uB514\uC5B8\uD2B8 \u2014 \uC0C1\uB2E8 \uBC43\uC9C0 \uAC00\uB3C5\uC131\uAE4C\uC9C0 \uD568\uAED8 \uBCF4\uAC15 */
      .b2w2-mvp-card[data-fx="topbottom"] .b2w2-mvp-overlay {
        background: linear-gradient(180deg,
          rgba(15,23,42, calc(var(--b2mvp-fx-op, 0.45) * 0.34)) 0%,
          rgba(15,23,42,0) 22%,
          rgba(15,23,42,0) 55%,
          rgba(2,6,23, calc(var(--b2mvp-fx-op, 0.45) * 0.80)) 100%);
      }
      /* \uD6A8\uACFC \uC2A4\uD0C0\uC77C: \uCEEC\uB7EC \uD2F4\uD2B8 \u2014 \uC21C\uC704 \uC0C9\uC0C1\uC744 \uC740\uC740\uD558\uAC8C \uC5B9\uC740 \uD558\uB2E8 \uADF8\uB77C\uB514\uC5B8\uD2B8 */
      .b2w2-mvp-card.b2w2-mvp-first[data-fx="tint"] .b2w2-mvp-overlay {
        background: linear-gradient(180deg, rgba(245,158,11,0) 0%, rgba(245,158,11, calc(var(--b2mvp-fx-op, 0.45) * 0.16)) 35%, rgba(120,53,15, calc(var(--b2mvp-fx-op, 0.45) * 0.80)) 100%);
      }
      .b2w2-mvp-card.b2w2-mvp-second[data-fx="tint"] .b2w2-mvp-overlay {
        background: linear-gradient(180deg, rgba(148,163,184,0) 0%, rgba(148,163,184, calc(var(--b2mvp-fx-op, 0.45) * 0.14)) 35%, rgba(30,41,59, calc(var(--b2mvp-fx-op, 0.45) * 0.80)) 100%);
      }
      .b2w2-mvp-card.b2w2-mvp-worst[data-fx="tint"] .b2w2-mvp-overlay {
        background: linear-gradient(180deg, rgba(239,68,68,0) 0%, rgba(239,68,68, calc(var(--b2mvp-fx-op, 0.45) * 0.16)) 35%, rgba(69,10,10, calc(var(--b2mvp-fx-op, 0.45) * 0.80)) 100%);
      }
      /* \uD6A8\uACFC \uC2A4\uD0C0\uC77C: \uC5C6\uC74C \u2014 \uC6D0\uBCF8 \uC0AC\uC9C4 \uADF8\uB300\uB85C \uB178\uCD9C (\uD14D\uC2A4\uD2B8 \uC790\uCCB4 \uADF8\uB9BC\uC790\uB85C\uB9CC \uAC00\uB3C5\uC131 \uD655\uBCF4) */
      .b2w2-mvp-card[data-fx="none"] .b2w2-mvp-overlay {
        display: none;
      }
      /* \uD6A8\uACFC \uC2A4\uD0C0\uC77C: \uC2A4\uD3EC\uD2B8\uB77C\uC774\uD2B8 \u2014 \uD558\uB2E8 \uC911\uC559\uC5D0\uC11C \uBB34\uB300 \uC870\uBA85\uCC98\uB7FC \uC740\uC740\uD558\uAC8C \uBC88\uC9C0\uB294 \uC74C\uC601 */
      .b2w2-mvp-card[data-fx="spotlight"] .b2w2-mvp-overlay {
        background: radial-gradient(ellipse 140% 90% at 50% 100%,
          rgba(2,6,23, calc(var(--b2mvp-fx-op, 0.45) * 0.95)) 0%,
          rgba(2,6,23, calc(var(--b2mvp-fx-op, 0.45) * 0.40)) 45%,
          rgba(2,6,23,0) 78%);
      }
      /* \uD6A8\uACFC \uC2A4\uD0C0\uC77C: \uB290\uC640\uB974 \u2014 \uACE0\uB300\uBE44 \uD751\uBC31\uD1A4 + \uC9D9\uC740 \uD558\uB2E8 \uADF8\uB77C\uB514\uC5B8\uD2B8 */
      .b2w2-mvp-card[data-fx="noir"] .b2w2-mvp-bg {
        filter: grayscale(.6) contrast(1.18) brightness(.96);
      }
      .b2w2-mvp-card[data-fx="noir"] .b2w2-mvp-overlay {
        background: linear-gradient(180deg,
          rgba(0,0,0,0) 0%,
          rgba(0,0,0, calc(var(--b2mvp-fx-op, 0.45) * 0.28)) 30%,
          rgba(0,0,0, calc(var(--b2mvp-fx-op, 0.45) * 0.95)) 100%);
      }
      /* \uD6A8\uACFC \uC2A4\uD0C0\uC77C: \uB300\uAC01\uC120 \u2014 \uBAA8\uC11C\uB9AC\uC5D0\uC11C \uBE44\uC2A4\uB4EC\uD788 \uC9D9\uC5B4\uC9C0\uB294 \uADF8\uB77C\uB514\uC5B8\uD2B8 (\uC5ED\uB3D9\uC801\uC778 \uB290\uB08C) */
      .b2w2-mvp-card[data-fx="diagonal"] .b2w2-mvp-overlay {
        background:
          linear-gradient(135deg, rgba(2,6,23, calc(var(--b2mvp-fx-op, 0.45) * 0.55)) 0%, rgba(2,6,23,0) 48%),
          linear-gradient(180deg, rgba(15,23,42,0) 55%, rgba(2,6,23, calc(var(--b2mvp-fx-op, 0.45) * 0.72)) 100%);
      }
      /* \uD6A8\uACFC \uC2A4\uD0C0\uC77C: \uAE00\uB798\uC2A4 \u2014 \uADF8\uB77C\uB514\uC5B8\uD2B8 \uB300\uC2E0 \uD558\uB2E8\uBD80\uC5D0 \uBC18\uD22C\uBA85 \uC720\uB9AC\uC9C8\uAC10 \uD328\uB110 */
      .b2w2-mvp-card[data-fx="glass"] .b2w2-mvp-overlay {
        display: none;
      }
      .b2w2-mvp-card[data-fx="glass"] .b2w2-mvp-bottom {
        background: rgba(15,23,42, calc(var(--b2mvp-fx-op, 0.45) * 0.34));
        backdrop-filter: blur(calc(4px + var(--b2mvp-fx-op, 0.45) * 10px)) saturate(160%);
        -webkit-backdrop-filter: blur(calc(4px + var(--b2mvp-fx-op, 0.45) * 10px)) saturate(160%);
        border-top: 1px solid rgba(255,255,255, calc(var(--b2mvp-fx-op, 0.45) * 0.30));
      }
      /* \uB514\uC790\uC778 \uBAA8\uB4DC: \uD558\uB2E8 \uD328\uB110\uD615 \u2014 \uC0AC\uC9C4 \uC804\uCCB4 \uB300\uC2E0 \uD558\uB2E8 \uBC14 \uD615\uD0DC\uB85C\uB9CC \uC5B4\uB461\uAC8C \uCC98\uB9AC */
      .b2w2-mvp-card[data-design="panel"] .b2w2-mvp-overlay {
        display: none;
      }
      .b2w2-mvp-card[data-design="panel"] .b2w2-mvp-bottom {
        background: linear-gradient(180deg,
          rgba(2,6,23,0) 0%,
          rgba(2,6,23, calc(0.55 + var(--b2mvp-fx-op, 0.45) * 0.45)) 32%,
          rgba(2,6,23, calc(0.55 + var(--b2mvp-fx-op, 0.45) * 0.45)) 100%);
        border-radius: 0 0 16px 16px;
        padding-top: 16px;
      }
      /* \uB514\uC790\uC778 \uBAA8\uB4DC: \uBBF8\uB2C8\uBA40 \uD504\uB808\uC784\uD615 \u2014 \uC624\uBC84\uB808\uC774 \uC5C6\uC774 \uC774\uB984\uD45C\uB97C \uB5A0 \uC788\uB294 \uCEA1\uC290\uB85C \uD45C\uC2DC */
      .b2w2-mvp-card[data-design="frame"] .b2w2-mvp-overlay {
        display: none;
      }
      .b2w2-mvp-card[data-design="frame"] {
        box-shadow: inset 0 0 0 2px rgba(255,255,255,.55);
      }
      /* hover \uC2DC \uAE30\uBCF8 box-shadow\uAC00 \uD1B5\uC9F8\uB85C \uB36E\uC5B4\uC368\uC11C \uD504\uB808\uC784 \uD14C\uB450\uB9AC\uAC00 \uC0AC\uB77C\uC9C0\uB358 \uBB38\uC81C \uC218\uC815 */
      .b2w2-mvp-card[data-design="frame"]:hover {
        box-shadow: inset 0 0 0 2px rgba(255,255,255,.55), 0 20px 44px rgba(0,0,0,.20), 0 0 0 1px var(--b2w-accent-shadow-strong, rgba(0,0,0,.12));
      }
      .b2w2-mvp-card[data-design="frame"] .b2w2-mvp-bottom {
        padding: 9px;
      }
      .b2w2-mvp-card[data-design="frame"] .b2w2-mvp-id {
        display: inline-flex;
        flex-direction: column;
        gap: 3px;
        width: fit-content;
        max-width: 100%;
        padding: 6px 10px;
        border-radius: 12px;
        background: rgba(15,23,42, calc(0.32 + var(--b2mvp-fx-op, 0.45) * 0.25));
        border: 1px solid rgba(255,255,255,.20);
        backdrop-filter: blur(10px) saturate(160%);
        -webkit-backdrop-filter: blur(10px) saturate(160%);
      }
      .b2w2-mvp-card[data-design="frame"] .b2w2-mvp-statline {
        margin-top: 4px;
      }
      /* \uB514\uC790\uC778 \uBAA8\uB4DC: \uAE00\uB798\uC2A4\uCE74\uB4DC\uD615 \u2014 \uCE74\uB4DC \uC804\uCCB4 \uD558\uB2E8\uC5D0 \uD1B5\uC720\uB9AC \uC7AC\uC9C8 \uD328\uB110, \uC774\uB984/\uC2A4\uD0EF \uC804\uBD80 \uADF8 \uC704\uC5D0 \uD45C\uC2DC */
      .b2w2-mvp-card[data-design="glasscard"] .b2w2-mvp-overlay {
        display: none;
      }
      .b2w2-mvp-card[data-design="glasscard"] .b2w2-mvp-bottom {
        margin: 8px;
        border-radius: 14px;
        padding: 10px 12px 9px;
        background: rgba(15,23,42, calc(0.30 + var(--b2mvp-fx-op, 0.45) * 0.30));
        border: 1px solid rgba(255,255,255,.22);
        backdrop-filter: blur(16px) saturate(180%);
        -webkit-backdrop-filter: blur(16px) saturate(180%);
        box-shadow: 0 8px 24px rgba(2,6,23,.28);
        left: 0; right: 0; bottom: 8px;
      }
      .b2w2-mvp-card[data-design="glasscard"] .b2w2-mvp-top-badge {
        backdrop-filter: blur(14px) saturate(180%);
        -webkit-backdrop-filter: blur(14px) saturate(180%);
      }
      /* \uB514\uC790\uC778 \uBAA8\uB4DC: \uCEEC\uB7EC \uD14C\uB450\uB9AC \uAC15\uC870\uD615 \u2014 \uC21C\uC704 \uC0C9\uC0C1\uC758 \uAD75\uC740 \uD14C\uB450\uB9AC\uB85C \uCE74\uB4DC \uC790\uCCB4\uB97C \uAC15\uC870 */
      .b2w2-mvp-card[data-design="border"] {
        box-shadow: inset 0 0 0 3px var(--b2mvp-rank-color, rgba(255,255,255,.55));
      }
      /* hover \uC2DC \uAE30\uBCF8 box-shadow\uAC00 \uD1B5\uC9F8\uB85C \uB36E\uC5B4\uC368\uC11C \uD14C\uB450\uB9AC\uAC00 \uC0AC\uB77C\uC9C0\uB358 \uBB38\uC81C \uC218\uC815 \u2014 \uD14C\uB450\uB9AC + \uADF8\uB9BC\uC790\uB97C \uD568\uAED8 \uC720\uC9C0 */
      .b2w2-mvp-card[data-design="border"]:hover {
        box-shadow: inset 0 0 0 3px var(--b2mvp-rank-color, rgba(255,255,255,.55)), 0 20px 44px rgba(0,0,0,.20), 0 0 0 1px var(--b2w-accent-shadow-strong, rgba(0,0,0,.12));
      }
      .b2w2-mvp-card.b2w2-mvp-first[data-design="border"]  { --b2mvp-rank-color: rgba(245,158,11,.88); }
      .b2w2-mvp-card.b2w2-mvp-second[data-design="border"] { --b2mvp-rank-color: rgba(148,163,184,.88); }
      .b2w2-mvp-card.b2w2-mvp-worst[data-design="border"]  { --b2mvp-rank-color: rgba(239,68,68,.88); }
      .b2w2-mvp-card[data-design="border"] .b2w2-mvp-bottom {
        background: linear-gradient(180deg,
          rgba(2,6,23,0) 0%,
          rgba(2,6,23, calc(0.38 + var(--b2mvp-fx-op, 0.45) * 0.40)) 100%);
        /* \uD14C\uB450\uB9AC \uC0C9\uC0C1\uC744 \uD558\uB2E8 \uD328\uB110 \uC0C1\uB2E8\uC5D0 \uC587\uAC8C \uBC18\uC601\uD574 \uD1B5\uC77C\uAC10 \uBD80\uC5EC */
        box-shadow: inset 0 1px 0 var(--b2mvp-rank-color, rgba(255,255,255,.4));
      }
      /* \uB514\uC790\uC778 \uBAA8\uB4DC: \uB9AC\uBCF8\uD615 \u2014 \uC0C1\uB2E8 \uBC30\uC9C0 \uB300\uC2E0 \uBAA8\uC11C\uB9AC\uB97C \uAC00\uB85C\uC9C0\uB974\uB294 \uB300\uAC01\uC120 \uB9AC\uBCF8\uC73C\uB85C \uC21C\uC704 \uD45C\uC2DC */
      .b2w2-mvp-card[data-design="ribbon"] .b2w2-mvp-top-badge {
        top: 16px;
        left: -36px;
        width: 148px;
        justify-content: center;
        border-radius: 0;
        padding: 4px 0;
        transform: rotate(-45deg);
        box-shadow: 0 3px 8px rgba(2,6,23,.30);
        letter-spacing: .02em;
      }
      /* \uBBF8\uB2C8 \uCE74\uB4DC(\uD2B8\uB9AC\uD50C \uBC30\uB108)\uB294 \uD3ED\uC774 \uC881\uC544 \uB9AC\uBCF8 \uD06C\uAE30\xB7\uC704\uCE58\uB97C \uBCC4\uB3C4\uB85C \uCD95\uC18C \uBCF4\uC815 */
      .b2w2-mvp-card-mini[data-design="ribbon"] .b2w2-mvp-top-badge {
        top: 10px;
        left: -30px;
        width: 118px;
        padding: 3px 0;
        font-size: 7px;
      }
      /* \uD558\uC774\uB77C\uC774\uD2B8 \uB9AC\uB4DC \uCE74\uB4DC\uB294 \uD3ED\uC774 \uB113\uC5B4 \uB9AC\uBCF8\uC744 \uC870\uAE08 \uB354 \uAE38\uAC8C \uBCF4\uC815 */
      .b2w2-mvp-card-lead[data-design="ribbon"] .b2w2-mvp-top-badge {
        top: 20px;
        left: -42px;
        width: 172px;
        padding: 5px 0;
      }
      /* \uB514\uC790\uC778 \uBAA8\uB4DC: \uC2A4\uD50C\uB9BF\uD615 \u2014 \uD558\uB2E8\uC744 \uC21C\uC704 \uC0C9 \uB77C\uC778\uC73C\uB85C \uAD6C\uBD84\uD55C \uBD88\uD22C\uBA85 \uD328\uB110\uB85C \uD45C\uC2DC */
      .b2w2-mvp-card[data-design="split"] .b2w2-mvp-overlay {
        display: none;
      }
      .b2w2-mvp-card.b2w2-mvp-first[data-design="split"]  { --b2mvp-rank-color: #f59e0b; }
      .b2w2-mvp-card.b2w2-mvp-second[data-design="split"] { --b2mvp-rank-color: #94a3b8; }
      .b2w2-mvp-card.b2w2-mvp-worst[data-design="split"]  { --b2mvp-rank-color: #ef4444; }
      .b2w2-mvp-card[data-design="split"] .b2w2-mvp-bottom {
        background: rgba(8,12,24, calc(0.62 + var(--b2mvp-fx-op, 0.45) * 0.30));
        border-top: 3px solid var(--b2mvp-rank-color, rgba(255,255,255,.5));
        padding-top: 10px;
        /* \uC0AC\uC9C4\uC5D0\uC11C \uBD88\uD22C\uBA85 \uD328\uB110\uB85C \uB118\uC5B4\uAC00\uB294 \uACBD\uACC4\uAC00 \uB531\uB531\uD574 \uBCF4\uC774\uC9C0 \uC54A\uB3C4\uB85D \uC704\uCABD\uC5D0 \uBD80\uB4DC\uB7EC\uC6B4 \uADF8\uB9BC\uC790 \uBE14\uB80C\uB4DC \uCD94\uAC00 */
        box-shadow: inset 0 10px 12px -8px rgba(0,0,0,.45);
      }
      /* \uB514\uC790\uC778 \uBAA8\uB4DC: \uD3EC\uC2A4\uD130\uD615 \u2014 \uC0AC\uC9C4 \uB300\uBE44\uB97C \uC0B4\uB9AC\uACE0 \uD558\uB2E8\uC740 \uC644\uC804 \uBD88\uD22C\uBA85 \uBE14\uB85D\uC73C\uB85C \uCC98\uB9AC\uD574 \uD0C0\uC774\uD3EC\uB97C \uAC15\uC870 */
      .b2w2-mvp-card[data-design="poster"] .b2w2-mvp-overlay {
        display: none;
      }
      .b2w2-mvp-card[data-design="poster"] .b2w2-mvp-bg {
        filter: contrast(1.10) saturate(1.16);
      }
      .b2w2-mvp-card[data-design="poster"] .b2w2-mvp-bottom {
        background: #0b0f19;
        padding: 12px 11px 10px;
        /* \uC0AC\uC9C4 \u2192 \uBD88\uD22C\uBA85 \uBE14\uB85D \uACBD\uACC4\uB97C \uC790\uC5F0\uC2A4\uB7FD\uAC8C \uBE14\uB80C\uB4DC */
        box-shadow: inset 0 14px 16px -10px rgba(0,0,0,.55);
      }
      /* \uD3EC\uC2A4\uD130 \uD2B9\uC720\uC758 \uAD75\uACE0 \uAC15\uD55C \uD0C0\uC774\uD3EC \uAC15\uC870 \u2014 \uAE30\uC874\uC5D0 \uC2E4\uC81C\uB85C \uC874\uC7AC\uD558\uC9C0 \uC54A\uB294 \uC120\uD0DD\uC790(.b2w2-mvp-id b)\uB97C \uC798\uBABB \uC9C0\uC815\uD588\uB358 \uAC83\uC744 \uC218\uC815\uD558\uACE0
         \uC774\uB984 \uD45C\uAE30 \uC790\uCCB4\uB97C \uB354 \uD06C\uACE0 \uC784\uD329\uD2B8\uC788\uAC8C \uC870\uC815 */
      .b2w2-mvp-card[data-design="poster"] .b2w2-mvp-name {
        font-size: 16px;
        letter-spacing: -.01em;
      }
      .b2w2-mvp-card-mini[data-design="poster"] .b2w2-mvp-name {
        font-size: 13px;
      }

      /* \u2500\u2500 \uBE0C\uB9AC\uD551 \uB514\uC790\uC778 \uD14C\uB9C8 (\uC124\uC815\uD0ED "\uBE0C\uB9AC\uD551 \uB514\uC790\uC778 & \uD6A8\uACFC"\uC5D0\uC11C \uC120\uD0DD) \u2500\u2500
         classic(\uAE30\uBCF8)\uC740 \uBCC4\uB3C4 override \uC5C6\uC774 \uC704\uC758 \uAE30\uBCF8 \uD1A0\uD070\uC744 \uADF8\uB300\uB85C \uC0AC\uC6A9 */
      .b2w2-wrap[data-theme="minimal"] {
        --b2w-accent: #64748b;
        --b2w-accent-strong: #475569;
        --b2w-accent-soft: rgba(100,116,139,.06);
        --b2w-rule-hard: rgba(17,24,39,.22);
        --b2w-rule-soft: rgba(17,24,39,.07);
        --b2w-shadow: 0 3px 12px rgba(15,23,42,.045);
        --b2w-shadow-sm: 0 1px 3px rgba(15,23,42,.03);
        --b2w-accent-border: rgba(100,116,139,.16);
        --b2w-accent-shadow: rgba(100,116,139,.08);
        --b2w-accent-shadow-strong: rgba(100,116,139,.12);
        --b2w-tag-accent-bg: rgba(100,116,139,.08);
        --b2w-tag-accent-border: rgba(100,116,139,.18);
      }
      .b2w2-wrap[data-theme="vivid"] {
        --b2w-accent: #7c3aed;
        --b2w-accent-strong: #db2777;
        --b2w-accent-soft: rgba(124,58,237,.10);
        --b2w-paper-warm: var(--b2w-paper);
        --b2w-accent-border: rgba(124,58,237,.32);
        --b2w-accent-shadow: rgba(124,58,237,.18);
        --b2w-accent-shadow-strong: rgba(219,39,119,.24);
        --b2w-tag-accent-bg: rgba(124,58,237,.10);
        --b2w-tag-accent-border: rgba(124,58,237,.28);
      }
      .b2w2-wrap[data-theme="mono"] {
        --b2w-accent: #1c1a17;
        --b2w-accent-strong: #000000;
        --b2w-accent-soft: rgba(28,26,23,.05);
        --b2w-paper: #f4f1ea;
        --b2w-paper-alt: #fdfbf6;
        --b2w-paper-warm: #f4f1ea;
        --b2w-ink: #1c1a17;
        --b2w-ink-mid: #3f3b35;
        --b2w-ink-soft: #7a7266;
        --b2w-rule-hard: rgba(28,26,23,.55);
        --b2w-rule-soft: rgba(28,26,23,.12);
        --b2w-accent-border: rgba(28,26,23,.25);
        --b2w-accent-shadow: rgba(28,26,23,.10);
        --b2w-accent-shadow-strong: rgba(28,26,23,.16);
        --b2w-tag-accent-bg: rgba(28,26,23,.06);
        --b2w-tag-accent-border: rgba(28,26,23,.20);
      }
      /* \uC138\uB828\uB41C \xB7 \uC5D8\uB808\uAC15\uD2B8 \u2014 \uB124\uC774\uBE44 & \uACE8\uB4DC, \uCC28\uBD84\uD558\uACE0 \uACE0\uAE09\uC2A4\uB7EC\uC6B4 \uD1A4 */
      .b2w2-wrap[data-theme="elegant"] {
        --b2w-accent: #1e3a5f;
        --b2w-accent-strong: #0f2942;
        --b2w-accent-soft: rgba(30,58,95,.07);
        --b2w-paper: #f7f5f0;
        --b2w-paper-alt: #ffffff;
        --b2w-paper-warm: #f4f0e8;
        --b2w-ink: #1a1a2e;
        --b2w-ink-mid: #3d3d52;
        --b2w-ink-soft: #6b6b80;
        --b2w-rule-hard: rgba(26,26,46,.35);
        --b2w-rule-soft: rgba(26,26,46,.10);
        --b2w-shadow: 0 8px 24px rgba(15,41,66,.08);
        --b2w-shadow-sm: 0 2px 6px rgba(15,41,66,.05);
        --b2w-accent-border: rgba(30,58,95,.28);
        --b2w-accent-shadow: rgba(30,58,95,.14);
        --b2w-accent-shadow-strong: rgba(191,161,74,.30);
        --b2w-tag-accent-bg: rgba(191,161,74,.12);
        --b2w-tag-accent-border: rgba(191,161,74,.35);
      }
      /* \uC774\uC05C \xB7 \uD30C\uC2A4\uD154 \u2014 \uD551\uD06C\xB7\uB77C\uBCA4\uB354 \uD1A4, \uC0AC\uB791\uC2A4\uB7FD\uACE0 \uBD80\uB4DC\uB7EC\uC6B4 \uB290\uB08C */
      .b2w2-wrap[data-theme="pastel"] {
        --b2w-accent: #ec4899;
        --b2w-accent-strong: #db2777;
        --b2w-accent-soft: rgba(236,72,153,.08);
        --b2w-paper: #fdf4ff;
        --b2w-paper-alt: #ffffff;
        --b2w-paper-warm: #fef2f8;
        --b2w-ink: #3f2a3d;
        --b2w-ink-mid: #6b4c68;
        --b2w-ink-soft: #9c7d98;
        --b2w-rule-hard: rgba(219,39,119,.18);
        --b2w-rule-soft: rgba(219,39,119,.06);
        --b2w-shadow: 0 6px 18px rgba(236,72,153,.10);
        --b2w-shadow-sm: 0 2px 5px rgba(236,72,153,.06);
        --b2w-accent-border: rgba(236,72,153,.25);
        --b2w-accent-shadow: rgba(236,72,153,.12);
        --b2w-accent-shadow-strong: rgba(167,139,250,.22);
        --b2w-tag-accent-bg: rgba(167,139,250,.10);
        --b2w-tag-accent-border: rgba(167,139,250,.25);
      }
      /* \uD654\uB824\uD55C \xB7 \uB7ED\uC154\uB9AC \u2014 \uBE14\uB799 & \uACE8\uB4DC, \uC9C4\uD558\uACE0 \uACE0\uAE09\uC2A4\uB7EC\uC6B4 \uB2E4\uD06C \uD1A4 */
      .b2w2-wrap[data-theme="luxury"] {
        --b2w-accent: #c9a227;
        --b2w-accent-strong: #8a6d1a;
        --b2w-accent-soft: rgba(201,162,39,.09);
        --b2w-paper: #14120d;
        --b2w-paper-alt: #1c1a13;
        --b2w-paper-warm: #18160f;
        --b2w-ink: #f5ecd7;
        --b2w-ink-mid: #d9c9a0;
        --b2w-ink-soft: #a99a75;
        --b2w-rule-hard: rgba(201,162,39,.45);
        --b2w-rule-soft: rgba(201,162,39,.15);
        --b2w-shadow: 0 10px 30px rgba(0,0,0,.45);
        --b2w-shadow-sm: 0 3px 8px rgba(0,0,0,.35);
        --b2w-accent-border: rgba(201,162,39,.45);
        --b2w-accent-shadow: rgba(201,162,39,.20);
        --b2w-accent-shadow-strong: rgba(201,162,39,.30);
        --b2w-btn-text: #14120d;
        --b2w-tag-accent-bg: rgba(201,162,39,.14);
        --b2w-tag-accent-border: rgba(201,162,39,.35);
      }
      /* \uC2A4\uD3EC\uCE20 \uC2A4\uD0C0\uC77C \u2014 \uB808\uB4DC & \uBE14\uB8E8\uC758 \uB2E4\uC774\uB098\uBBF9\uD55C \uACBD\uAE30\uC7A5 \uD1A4 */
      .b2w2-wrap[data-theme="sports"] {
        --b2w-accent: #dc2626;
        --b2w-accent-strong: #991b1b;
        --b2w-accent-soft: rgba(220,38,38,.08);
        --b2w-paper: #f8fafc;
        --b2w-paper-alt: #ffffff;
        --b2w-paper-warm: #f1f5f9;
        --b2w-ink: #0f172a;
        --b2w-ink-mid: #334155;
        --b2w-ink-soft: #64748b;
        --b2w-rule-hard: rgba(15,23,42,.30);
        --b2w-rule-soft: rgba(15,23,42,.08);
        --b2w-shadow: 0 8px 22px rgba(220,38,38,.10);
        --b2w-shadow-sm: 0 2px 6px rgba(15,23,42,.05);
        --b2w-accent-border: rgba(220,38,38,.30);
        --b2w-accent-shadow: rgba(220,38,38,.16);
        --b2w-accent-shadow-strong: rgba(37,99,235,.22);
        --b2w-tag-accent-bg: rgba(37,99,235,.08);
        --b2w-tag-accent-border: rgba(37,99,235,.24);
      }
      /* e\uC2A4\uD3EC\uCE20 \uC2A4\uD0C0\uC77C \u2014 \uD37C\uD50C\xB7\uC2DC\uC548 \uB124\uC628\uC758 \uC0AC\uC774\uBC84/\uAC8C\uC774\uBC0D \uB2E4\uD06C \uD1A4 */
      .b2w2-wrap[data-theme="esports"] {
        --b2w-accent: #a855f7;
        --b2w-accent-strong: #7c3aed;
        --b2w-accent-soft: rgba(168,85,247,.10);
        --b2w-paper: #0b0f19;
        --b2w-paper-alt: #131a2a;
        --b2w-paper-warm: #0f1524;
        --b2w-ink: #e5e9f5;
        --b2w-ink-mid: #b8c0d9;
        --b2w-ink-soft: #7a86a8;
        --b2w-rule-hard: rgba(34,211,238,.40);
        --b2w-rule-soft: rgba(34,211,238,.14);
        --b2w-shadow: 0 0 24px rgba(168,85,247,.25);
        --b2w-shadow-sm: 0 0 10px rgba(34,211,238,.18);
        --b2w-accent-border: rgba(168,85,247,.45);
        --b2w-accent-shadow: rgba(168,85,247,.25);
        --b2w-accent-shadow-strong: rgba(34,211,238,.35);
        --b2w-btn-text: #0b0f19;
        --b2w-tag-accent-bg: rgba(34,211,238,.12);
        --b2w-tag-accent-border: rgba(34,211,238,.35);
      }
      /* \uD31D \uCEEC\uB7EC \u2014 \uC624\uB80C\uC9C0 & \uD2F8\uC758 \uBC1C\uB784\uD558\uACE0 \uACBD\uCF8C\uD55C \uD1A4 */
      .b2w2-wrap[data-theme="pop"] {
        --b2w-accent: #f97316;
        --b2w-accent-strong: #ea580c;
        --b2w-accent-soft: rgba(249,115,22,.09);
        --b2w-paper: #fffdf7;
        --b2w-paper-alt: #ffffff;
        --b2w-paper-warm: #fff8ec;
        --b2w-ink: #1f2937;
        --b2w-ink-mid: #4b5563;
        --b2w-ink-soft: #9ca3af;
        --b2w-rule-hard: rgba(249,115,22,.28);
        --b2w-rule-soft: rgba(249,115,22,.08);
        --b2w-shadow: 0 6px 18px rgba(249,115,22,.10);
        --b2w-shadow-sm: 0 2px 6px rgba(249,115,22,.06);
        --b2w-accent-border: rgba(249,115,22,.32);
        --b2w-accent-shadow: rgba(249,115,22,.16);
        --b2w-accent-shadow-strong: rgba(20,184,166,.28);
        --b2w-tag-accent-bg: rgba(20,184,166,.10);
        --b2w-tag-accent-border: rgba(20,184,166,.28);
      }
      /* \uB124\uC774\uCC98 \u2014 \uD3B8\uC548\uD55C \uADF8\uB9B0 \uD1A4, \uCC28\uBD84\uD558\uACE0 \uC790\uC5F0\uC2A4\uB7EC\uC6B4 \uB290\uB08C */
      .b2w2-wrap[data-theme="nature"] {
        --b2w-accent: #16a34a;
        --b2w-accent-strong: #15803d;
        --b2w-accent-soft: rgba(22,163,74,.08);
        --b2w-paper: #f6f9f4;
        --b2w-paper-alt: #ffffff;
        --b2w-paper-warm: #f1f6ee;
        --b2w-ink: #1c2b1f;
        --b2w-ink-mid: #3f5745;
        --b2w-ink-soft: #718775;
        --b2w-rule-hard: rgba(22,101,52,.28);
        --b2w-rule-soft: rgba(22,101,52,.08);
        --b2w-shadow: 0 6px 18px rgba(22,101,52,.08);
        --b2w-shadow-sm: 0 2px 5px rgba(22,101,52,.05);
        --b2w-accent-border: rgba(22,163,74,.28);
        --b2w-accent-shadow: rgba(22,163,74,.14);
        --b2w-accent-shadow-strong: rgba(22,163,74,.20);
        --b2w-tag-accent-bg: rgba(22,163,74,.09);
        --b2w-tag-accent-border: rgba(22,163,74,.24);
      }
      /* \uC624\uC158 \u2014 \uC2DC\uC6D0\uD55C \uBE14\uB8E8 \uADF8\uB77C\uB514\uC5B8\uD2B8 \uD1A4 */
      .b2w2-wrap[data-theme="ocean"] {
        --b2w-accent: #0891b2;
        --b2w-accent-strong: #0e7490;
        --b2w-accent-soft: rgba(8,145,178,.08);
        --b2w-paper: #f0f9fb;
        --b2w-paper-alt: #ffffff;
        --b2w-paper-warm: #eaf6f8;
        --b2w-ink: #0c2b33;
        --b2w-ink-mid: #2f5761;
        --b2w-ink-soft: #6b8b93;
        --b2w-rule-hard: rgba(8,145,178,.28);
        --b2w-rule-soft: rgba(8,145,178,.08);
        --b2w-shadow: 0 6px 18px rgba(8,145,178,.10);
        --b2w-shadow-sm: 0 2px 5px rgba(8,145,178,.06);
        --b2w-accent-border: rgba(8,145,178,.30);
        --b2w-accent-shadow: rgba(8,145,178,.14);
        --b2w-accent-shadow-strong: rgba(14,116,144,.22);
        --b2w-tag-accent-bg: rgba(8,145,178,.09);
        --b2w-tag-accent-border: rgba(8,145,178,.25);
      }
      /* \uC120\uC14B \u2014 \uC624\uB80C\uC9C0 & \uD551\uD06C\uC758 \uB530\uB73B\uD55C \uB178\uC744 \uADF8\uB77C\uB514\uC5B8\uD2B8 \uD1A4 */
      .b2w2-wrap[data-theme="sunset"] {
        --b2w-accent: #f5760a;
        --b2w-accent-strong: #db2777;
        --b2w-accent-soft: rgba(245,118,10,.09);
        --b2w-paper: #fff7f2;
        --b2w-paper-alt: #ffffff;
        --b2w-paper-warm: #fef1ea;
        --b2w-ink: #3a1f24;
        --b2w-ink-mid: #6b4048;
        --b2w-ink-soft: #a1767c;
        --b2w-rule-hard: rgba(219,39,119,.22);
        --b2w-rule-soft: rgba(245,118,10,.08);
        --b2w-shadow: 0 8px 22px rgba(245,118,10,.12);
        --b2w-shadow-sm: 0 2px 6px rgba(245,118,10,.07);
        --b2w-accent-border: rgba(245,118,10,.30);
        --b2w-accent-shadow: rgba(245,118,10,.16);
        --b2w-accent-shadow-strong: rgba(219,39,119,.26);
        --b2w-tag-accent-bg: rgba(219,39,119,.10);
        --b2w-tag-accent-border: rgba(219,39,119,.26);
      }
      /* \uB124\uC628 \u2014 \uC2DC\uC548 & \uB9C8\uC820\uD0C0 \uD615\uAD11\uC758 \uD654\uB824\uD55C \uB2E4\uD06C \uD1A4 */
      .b2w2-wrap[data-theme="neon"] {
        --b2w-accent: #22d3ee;
        --b2w-accent-strong: #d946ef;
        --b2w-accent-soft: rgba(34,211,238,.10);
        --b2w-paper: #0a0a0f;
        --b2w-paper-alt: #121218;
        --b2w-paper-warm: #0d0d13;
        --b2w-ink: #eafcff;
        --b2w-ink-mid: #b6ecf5;
        --b2w-ink-soft: #7fa8b0;
        --b2w-rule-hard: rgba(217,70,239,.45);
        --b2w-rule-soft: rgba(34,211,238,.16);
        --b2w-shadow: 0 0 26px rgba(34,211,238,.28);
        --b2w-shadow-sm: 0 0 12px rgba(217,70,239,.22);
        --b2w-accent-border: rgba(34,211,238,.45);
        --b2w-accent-shadow: rgba(34,211,238,.22);
        --b2w-accent-shadow-strong: rgba(217,70,239,.32);
        --b2w-btn-text: #0a0a0f;
        --b2w-tag-accent-bg: rgba(217,70,239,.12);
        --b2w-tag-accent-border: rgba(217,70,239,.32);
      }

      /* \uBC30\uACBD \uC774\uBBF8\uC9C0 \uC5C6\uC744 \uB54C \uC0C9\uC0C1 */
      .b2w2-mvp-first .b2w2-mvp-bg-fallback  { background: linear-gradient(160deg,#fef3c7,#f59e0b); color: #92400e }
      .b2w2-mvp-second .b2w2-mvp-bg-fallback { background: linear-gradient(160deg,#e2e8f0,#94a3b8); color: #334155 }
      .b2w2-mvp-worst .b2w2-mvp-bg-fallback  { background: linear-gradient(160deg,#fee2e2,#ef4444); color: #7f1d1d }

      /* \uC0C1\uB2E8 \uBC43\uC9C0 */
      .b2w2-mvp-top-badge {
        position: absolute;
        top: 9px;
        left: 9px;
        z-index: 3;
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 3px 8px;
        border-radius: 999px;
        font-size: 9px;
        font-weight: 900;
        letter-spacing: .05em;
        text-transform: uppercase;
        backdrop-filter: blur(12px) saturate(180%);
        -webkit-backdrop-filter: blur(12px) saturate(180%);
        white-space: nowrap;
      }
      .b2w2-mvp-first .b2w2-mvp-top-badge  { background: rgba(251,191,36,.85); color: #78350f; border: 1px solid rgba(245,158,11,.5) }
      .b2w2-mvp-second .b2w2-mvp-top-badge { background: rgba(255,255,255,.75); color: #334155; border: 1px solid rgba(148,163,184,.4) }
      .b2w2-mvp-worst .b2w2-mvp-top-badge  { background: rgba(239,68,68,.82); color: #fff; border: 1px solid rgba(239,68,68,.6) }

      /* \uC6B0\uCE21 \uC0C1\uB2E8 \uC885\uC871 \uC544\uC774\uCF58 */
      .b2w2-mvp-race-badge {
        position: absolute;
        top: 9px;
        right: 9px;
        z-index: 3;
        font-size: 15px;
        filter: drop-shadow(0 1px 4px rgba(0,0,0,.5));
      }

      /* \uD558\uB2E8 \uCF58\uD150\uCE20 \u2014 \uC774\uBBF8\uC9C0 \uC704 \uD6A8\uACFC \uC5C6\uC74C, \uD14D\uC2A4\uD2B8 \uC790\uCCB4 \uADF8\uB9BC\uC790\uB85C\uB9CC \uAC00\uB3C5\uC131 \uD655\uBCF4 */
      .b2w2-mvp-bottom {
        position: absolute;
        bottom: 0;
        left: 0; right: 0;
        z-index: 2;
        padding: 10px 10px 9px;
        display: flex;
        flex-direction: column;
        gap: 5px;
      }

      .b2w2-mvp-name {
        font-family: 'Noto Serif KR', Georgia, serif;
        font-size: 15px;
        font-weight: 900;
        color: #fff;
        letter-spacing: -.02em;
        line-height: 1.15;
        text-shadow: 0 1px 8px rgba(0,0,0,.6);
        cursor: pointer;
        transition: opacity .12s;
      }
      .b2w2-mvp-name:hover { opacity: .88 }

      .b2w2-mvp-id { display: flex; flex-direction: column; gap: 3px; }

      .b2w2-mvp-meta {
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .b2w2-mvp-univ {
        font-size: 10px;
        font-weight: 700;
        color: rgba(255,255,255,.78);
        letter-spacing: .01em;
        text-shadow: 0 1px 4px rgba(0,0,0,.5);
      }

      /* \uC2A4\uD0EF + \uCD5C\uADFC \uD3FC \uD1B5\uD569 \uB77C\uC778 \u2014 \uAE00\uB77C\uC2A4 \uBC30\uACBD (\uBC1D\uC740 \uC0AC\uC9C4 \uC704\uC5D0\uC11C\uB3C4 \uD56D\uC0C1 \uC77D\uD788\uB3C4\uB85D \uC5B4\uB461\uAC8C \uBCF4\uAC15) */
      .b2w2-mvp-statline {
        display: flex;
        align-items: center;
        gap: 7px;
        border-radius: 999px;
        border: 1px solid rgba(255,255,255,.18);
        backdrop-filter: blur(14px) saturate(160%);
        -webkit-backdrop-filter: blur(14px) saturate(160%);
        background: linear-gradient(180deg, rgba(10,10,16,.30), rgba(10,10,16,.52));
        box-shadow: inset 0 1px 0 rgba(255,255,255,.14), 0 6px 16px rgba(0,0,0,.28);
        padding: 6px 10px;
      }
      .b2w2-mvp-stat {
        display: flex;
        align-items: baseline;
        gap: 3px;
        flex-shrink: 0;
      }
      .b2w2-mvp-statline-sep {
        width: 1px;
        height: 10px;
        background: rgba(255,255,255,.28);
        flex-shrink: 0;
      }
      .b2w2-mvp-sv {
        font-family: 'Noto Serif KR', Georgia, serif;
        font-size: 13px;
        font-weight: 900;
        letter-spacing: -.02em;
        line-height: 1;
        color: #fff;
        text-shadow: 0 1px 6px rgba(0,0,0,.7), 0 1px 2px rgba(0,0,0,.55);
      }
      .b2w2-mvp-sl {
        font-size: 8px;
        font-style: normal;
        font-weight: 800;
        color: rgba(255,255,255,.78);
        letter-spacing: .02em;
        text-shadow: 0 1px 4px rgba(0,0,0,.6);
      }
      .b2w2-mvp-first .b2w2-mvp-sv-win   { color: #f87171 }
      .b2w2-mvp-first .b2w2-mvp-sv-loss  { color: #cbd5e1 }
      .b2w2-mvp-first .b2w2-mvp-sv-rate  { color: #fbbf24 }
      .b2w2-mvp-second .b2w2-mvp-sv-win  { color: #fca5a5 }
      .b2w2-mvp-second .b2w2-mvp-sv-loss { color: #94a3b8 }
      .b2w2-mvp-second .b2w2-mvp-sv-rate { color: #e2e8f0 }
      .b2w2-mvp-worst .b2w2-mvp-sv-win   { color: #fda4af }
      .b2w2-mvp-worst .b2w2-mvp-sv-loss  { color: #94a3b8 }
      .b2w2-mvp-worst .b2w2-mvp-sv-rate  { color: #fca5a5 }

      /* \uCD5C\uADFC \uD3FC dots \u2014 statline \uC6B0\uCE21 \uC815\uB82C */
      .b2w2-mvp-statline-form {
        display: flex;
        align-items: center;
        gap: 3px;
        margin-left: auto;
        flex-shrink: 0;
        padding-left: 7px;
        border-left: 1px solid rgba(255,255,255,.16);
      }

      /* \uD2F0\uC5B4 \uBC43\uC9C0 */
      .b2w2-mvp-tier {
        display: inline-flex;
        align-items: center;
        padding: 1px 7px;
        border-radius: 4px;
        font-size: 9px;
        font-weight: 900;
        letter-spacing: .02em;
      }

      /* \u2500\u2500 \uD558\uC774\uB77C\uC774\uD2B8 \uADF8\uB9AC\uB4DC\uC6A9 \uB2E8\uC77C MVP \uCE74\uB4DC (\uB354 \uAE38\uAC8C) \u2500\u2500 */
      .b2w2-mvp-card.b2w2-mvp-card-lead {
        aspect-ratio: 3/4;
        min-height: 280px;
      }

      /* \u2500\u2500 MVP \uD2B8\uB9AC\uD50C \uBC30\uB108\uC6A9 \uBBF8\uB2C8 \uCE74\uB4DC (\uC57D 1/3 \uD06C\uAE30, \uC138\uB85C\uD615) \u2500\u2500 */
      .b2w2-mvp-card.b2w2-mvp-card-mini {
        aspect-ratio: 3/4;
        min-height: 170px;
        width: 160px;
        flex: 0 0 160px;
      }
      .b2w2-mvp-card-mini .b2w2-mvp-top-badge {
        top: 6px; left: 6px; gap: 3px;
        padding: 2px 6px;
        font-size: 7px;
      }
      .b2w2-mvp-card-mini .b2w2-mvp-race-badge {
        top: 6px; right: 6px;
        font-size: 11px;
      }
      .b2w2-mvp-card-mini .b2w2-mvp-bottom {
        padding: 7px 7px 7px;
        gap: 4px;
      }
      .b2w2-mvp-card-mini .b2w2-mvp-name { font-size: 12px; }
      .b2w2-mvp-card-mini .b2w2-mvp-univ { font-size: 8.5px; }
      .b2w2-mvp-card-mini .b2w2-mvp-tier { font-size: 7px; padding: 1px 5px; }
      .b2w2-mvp-card-mini .b2w2-mvp-statline { border-radius: 999px; padding: 4px 7px; gap: 5px; }
      .b2w2-mvp-card-mini .b2w2-mvp-sv { font-size: 10px; }
      .b2w2-mvp-card-mini .b2w2-mvp-sl { font-size: 6px; }
      .b2w2-mvp-card-mini .b2w2-mvp-statline-form { gap: 2px; padding-left: 5px; }
      .b2w2-mvp-card-mini .b2w2-mvp-statline-form span {
        width: 11px !important;
        height: 11px !important;
        font-size: 6px !important;
      }
      @media (max-width: 640px) {
        .b2w2-mvp-triple { flex-direction: column; align-items: center }
        .b2w2-mvp-card { aspect-ratio: 4/3; min-height: 130px }
        .b2w2-mvp-card.b2w2-mvp-card-mini { aspect-ratio: 3/4; min-height: 170px; width: 200px; flex: 0 0 auto }
      }
      @media (min-width: 641px) and (max-width: 900px) {
        .b2w2-mvp-card { min-height: 140px }
      }

      /* \u2500\u2500 \uCC28\uD2B8 \uBC15\uC2A4 \u2500\u2500 */
      .b2w2-chart-box {
        background: var(--b2w-paper);
        border: 1px solid var(--b2w-rule);
        border-radius: var(--b2w-r-lg);
        padding: 18px 20px;
        margin-bottom: 20px;
        box-shadow: var(--b2w-shadow-sm);
      }
      .b2w2-chart-title {
        font-family: 'Noto Serif KR', Georgia, serif;
        font-size: 14px;
        font-weight: 800;
        color: var(--b2w-ink);
        margin-bottom: 14px;
        padding-bottom: 10px;
        border-bottom: 1px solid var(--b2w-rule-soft);
      }

      /* \u2500\u2500 \uD558\uC774\uB77C\uC774\uD2B8 \uADF8\uB9AC\uB4DC (\uC0C1\uB2E8 \uC694\uC57D \uCE74\uB4DC\uB4E4) \u2500\u2500 */
      .b2w2-highlight-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px,1fr));
        gap: 12px;
        margin-bottom: 22px;
      }
      .b2w2-lead-card { background: var(--b2w-paper-alt) }
      .b2w2-lead-card .b2w2-highlight-title { font-size: 21px }
      .b2w2-lead-card .b2w2-highlight-desc { font-size: 13px; line-height: 1.75 }
      .b2w2-highlight-card {
        padding: 16px 18px;
        border-radius: var(--b2w-r);
        border: 1px solid var(--b2w-rule);
        background: var(--b2w-paper);
        box-shadow: var(--b2w-shadow-sm);
        display: flex;
        flex-direction: column;
        gap: 10px;
        position: relative;
        overflow: hidden;
        transition: box-shadow .18s ease, transform .18s ease, border-color .18s ease;
      }
      .b2w2-highlight-card::after {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0; height: 3px;
        background: linear-gradient(90deg, var(--hc-top, var(--b2w-rule-soft)), var(--b2w-gold, rgba(255,255,255,.55)));
        border-radius: var(--b2w-r) var(--b2w-r) 0 0;
      }
      .b2w2-highlight-card::before {
        content: '';
        position: absolute;
        top: -30px; right: -30px;
        width: 90px; height: 90px;
        border-radius: 50%;
        background: radial-gradient(circle, var(--hc-top, var(--b2w-accent)), transparent 72%);
        opacity: .10;
        pointer-events: none;
      }
      .b2w2-highlight-card:hover {
        box-shadow: 0 6px 24px rgba(0,0,0,.11);
        transform: translateY(-3px);
        border-color: rgba(148,163,184,.22);
      }
      .b2w2-highlight-kicker {
        font-size: 10px;
        font-weight: 900;
        letter-spacing: .12em;
        text-transform: uppercase;
        color: var(--b2w-ink-soft);
        display: flex;
        align-items: center;
        gap: 5px;
      }
      .b2w2-highlight-title {
        font-family: 'Noto Serif KR', Georgia, serif;
        font-size: 17px;
        font-weight: 800;
        letter-spacing: -.01em;
        color: var(--b2w-ink);
        line-height: 1.25;
        padding-bottom: 8px;
        border-bottom: 1px solid var(--b2w-rule-soft);
      }
      .b2w2-highlight-desc { font-size: 12px; line-height: 1.7; color: var(--b2w-ink-mid) }
      .b2w2-highlight-list { display: flex; flex-direction: column; gap: 0 }
      .b2w2-highlight-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 7px 0;
        border-bottom: 1px solid var(--b2w-rule-soft);
        transition: background .1s ease;
      }
      .b2w2-highlight-row:last-child { border-bottom: none }

      /* \u2500\u2500 \uB4C0\uC5BC \uBE14\uB85D \u2500\u2500 */
      .b2w2-dual-card { display: flex; flex-direction: column; gap: 0; border-top: 1px solid var(--b2w-rule-soft) }
      .b2w2-dual-block {
        padding: 10px 0;
        border-bottom: 1px solid var(--b2w-rule-soft);
      }
      .b2w2-dual-block:last-child { border-bottom: none }
      .b2w2-dual-head { display: flex; align-items: center; justify-content: space-between; gap: 10px }
      .b2w2-dual-title {
        font-family: 'Noto Serif KR', Georgia, serif;
        font-size: 13px;
        font-weight: 800;
        color: var(--b2w-ink);
        letter-spacing: -.01em;
      }
      .b2w2-dual-sub { margin-top: 3px; font-size: 11px; color: var(--b2w-ink-soft) }
      .b2w2-mini-list { display: flex; flex-direction: column; gap: 4px; margin-top: 7px; padding-top: 7px; border-top: 1px dashed var(--b2w-rule-soft) }
      .b2w2-mini-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; font-size: 11px; font-weight: 700 }

      /* \u2500\u2500 \uB370\uC774\uD130 \uBC94\uC704 \uB178\uD2B8 \u2500\u2500 */
      .b2w2-note-row {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-wrap: wrap;
        padding: 10px 14px;
        border: 1px solid var(--b2w-rule-soft);
        border-radius: var(--b2w-r-lg);
        background: var(--b2w-paper-alt);
        margin-bottom: 18px;
      }
      .b2w2-note-chip {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 3px 9px;
        border-radius: 999px;
        background: var(--white);
        border: 1px solid var(--b2w-rule-soft);
        font-size: 11px;
        font-weight: 700;
        color: var(--b2w-ink-mid);
        box-shadow: var(--b2w-shadow-sm);
      }

      /* \u2500\u2500 \uC6D4\uAC04 \uADF8\uB9AC\uB4DC: \uC21C\uC704(\uC0C1\uB2E8)/\uC5D0\uC774\uC2A4(\uD558\uB2E8) \uC644\uC804 \uBD84\uB9AC \u2014 \uC808\uBC18 \uD3ED\uC5D0 \uB20C\uB824\uC788\uB358 \uBB38\uC81C \uD574\uACB0 \u2500\u2500 */
      .b2w2-monthly-grid {
        display: flex;
        flex-direction: column;
        gap: 16px;
        margin-bottom: 22px;
      }

      /* \u2500\u2500 \uC6D4\uAC04 \uC21C\uC704 \uB9AC\uC2A4\uD2B8: \uC804\uCCB4 \uD3ED\uC744 \uD65C\uC6A9\uD558\uB3C4\uB85D 2\uC5F4\uB85C \uD750\uB974\uAC8C \u2500\u2500 */
      .b2w2-rank-list {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 0 20px;
      }
      /* \u2500\u2500 \uB300\uD559\uBCC4 \uC5D0\uC774\uC2A4: \uB9AC\uC2A4\uD2B8\uAC00 \uC544\uB2C8\uB77C \uCE74\uB4DC \uADF8\uB9AC\uB4DC\uB85C \u2500\u2500 */
      .b2w2-ace-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 12px;
      }
      .b2w2-rank-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 10px 4px;
        border-bottom: 1px solid var(--b2w-rule-soft);
        transition: background .1s ease;
      }
      .b2w2-rank-row:hover { background: var(--b2w-paper-alt); margin: 0 -4px; padding-left: 8px; padding-right: 8px; border-radius: var(--b2w-r); cursor: pointer; }
      .b2w2-rank-row:last-child { border-bottom: none }
      .b2w2-rank-main { display: flex; align-items: center; gap: 10px; min-width: 0 }
      .b2w2-rank-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 26px;
        height: 26px;
        border-radius: 999px;
        font-size: 12px;
        font-weight: 800;
        flex-shrink: 0;
        border: 1.5px solid currentColor;
      }
      .b2w2-rank-name { font-size: 14px; font-weight: 800; color: var(--b2w-ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis }
      .b2w2-rank-sub { margin-top: 3px; font-size: 11px; color: var(--b2w-ink-soft); display: flex; gap: 6px; flex-wrap: wrap }
      .b2w2-rank-delta {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 50px;
        padding: 4px 8px;
        border-radius: 999px;
        font-size: 11px;
        font-weight: 800;
        white-space: nowrap;
        border: 1px solid transparent;
      }
      .b2w2-rank-delta.up { color: #15803d; background: #f0fdf4; border-color: #bbf7d0 }
      .b2w2-rank-delta.down { color: #b91c1c; background: #fef2f2; border-color: #fecaca }
      .b2w2-rank-delta.same { color: var(--b2w-ink-soft); background: var(--b2w-paper-alt); border-color: var(--b2w-rule-soft) }
      .b2w2-rank-delta.new { color: #5b21b6; background: #f5f3ff; border-color: #ddd6fe }

      /* \u2500\u2500 More \uBC84\uD2BC \u2500\u2500 */
      .b2w2-more-stack { display: contents }
      .b2w2-more-btn {
        grid-column: 1 / -1;
        margin-top: 10px;
        width: 100%;
        padding: 9px 12px;
        border-radius: var(--b2w-r);
        border: 1px dashed var(--b2w-rule);
        background: none;
        font-size: 11px;
        font-weight: 800;
        color: var(--b2w-ink-soft);
        cursor: pointer;
        letter-spacing: .04em;
        transition: border-color .14s ease, color .14s ease, background .14s ease;
      }
      .b2w2-more-btn:hover { border-color: var(--b2w-accent); color: var(--b2w-accent); background: var(--b2w-accent-soft) }
      .b2w2-more-btn:focus-visible { outline: 2px solid var(--b2w-accent); outline-offset: 2px }
      .b2w2-datebtn:focus-visible, .b2w2-din:focus-visible, .b2w2-sel:focus-visible { outline: 2px solid var(--b2w-accent); outline-offset: 2px }

      /* \u2500\u2500 \uC5D0\uC774\uC2A4 \uCE74\uB4DC \u2500\u2500 */
      .b2w2-ace-card {
        display: flex;
        flex-direction: column;
        padding: 14px 14px 13px;
        border: 1px solid var(--b2w-rule-soft);
        border-radius: var(--b2w-r-lg);
        background: var(--b2w-paper-alt);
        box-shadow: var(--b2w-shadow-sm);
        transition: transform .16s ease, box-shadow .16s ease, border-color .16s ease;
      }
      .b2w2-ace-card:hover { transform: translateY(-3px); box-shadow: var(--b2w-shadow); border-color: var(--b2w-accent-border) }
      .b2w2-ace-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 10px }
      .b2w2-ace-univ { display: flex; align-items: center; gap: 8px; min-width: 0 }
      .b2w2-ace-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0 }
      .b2w2-ace-univ-name {
        font-size: 11px;
        font-weight: 800;
        color: var(--b2w-ink-mid);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        text-transform: uppercase;
        letter-spacing: .04em;
      }
      .b2w2-ace-rank {
        font-size: 10px;
        font-weight: 800;
        color: var(--b2w-ink-soft);
        padding: 2px 8px;
        border-radius: 999px;
        background: var(--b2w-paper-alt);
        border: 1px solid var(--b2w-rule-soft);
      }
      .b2w2-ace-player { display: flex; align-items: center; justify-content: space-between; gap: 10px }
      .b2w2-ace-player-main { display: flex; align-items: center; gap: 10px; min-width: 0 }
      .b2w2-ace-photo {
        position: relative; width: 40px; height: 40px; flex-shrink: 0; overflow: hidden;
        border-radius: var(--su_profile_radius,50%); clip-path: var(--su_profile_clip,none);
        background: linear-gradient(160deg,#3f3a33,#171512);
        border: 2px solid var(--_c,#64748b);
        filter: drop-shadow(0 2px 6px rgba(15,23,42,.18));
        display: flex; align-items: center; justify-content: center;
      }
      .b2w2-ace-photo img { width: 100%; height: 100%; object-fit: cover; display: block }
      .b2w2-ace-photo-fallback { width: 100%; height: 100%; align-items: center; justify-content: center; display: flex; font-size: 15px; font-weight: 900; color: #fff }
      .b2w2-ace-player-name {
        font-family: 'Noto Serif KR', Georgia, serif;
        font-size: 17px;
        font-weight: 800;
        color: var(--b2w-ink);
        letter-spacing: -.01em;
        cursor: pointer;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        transition: color .12s ease;
      }
      .b2w2-ace-player-name:hover { color: var(--b2w-accent) }
      .b2w2-ace-player-sub { margin-top: 4px; font-size: 11px; color: var(--b2w-ink-soft); display: flex; gap: 7px; flex-wrap: wrap }
      .b2w2-ace-badges { display: flex; gap: 6px; flex-wrap: wrap; margin-top: auto; padding-top: 9px }
      .b2w2-ace-badge {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 3px 9px;
        border-radius: 999px;
        font-size: 10px;
        font-weight: 800;
        border: 1px solid var(--b2w-rule-soft);
        background: var(--white);
        color: var(--b2w-ink-mid);
      }
      .b2w2-ace-empty { padding: 14px 14px 13px; border: 1px dashed var(--b2w-rule); border-radius: var(--b2w-r-lg); background: var(--b2w-paper) }
      .b2w2-ace-empty-title { font-size: 14px; font-weight: 800; color: var(--b2w-ink-mid) }
      .b2w2-ace-empty-sub { margin-top: 5px; font-size: 11px; line-height: 1.6; color: var(--b2w-ink-soft) }

      /* \u2500\u2500 \uC6D4\uAC04 MVP \u2500\u2500 */
      .b2w2-monthly-mvp {
        padding: 14px 4px;
        border-top: 2px solid var(--b2w-ink);
      }
      .b2w2-monthly-mvp-head { display: flex; align-items: center; justify-content: space-between; gap: 10px }
      .b2w2-monthly-mvp-name {
        font-family: 'Noto Serif KR', Georgia, serif;
        font-size: 18px;
        font-weight: 800;
        color: var(--b2w-ink);
        letter-spacing: -.01em;
        cursor: pointer;
        transition: color .12s ease;
      }
      .b2w2-monthly-mvp-name:hover { color: #92651b }
      .b2w2-monthly-mvp-sub { margin-top: 4px; font-size: 11px; color: var(--b2w-ink-soft); display: flex; gap: 6px; flex-wrap: wrap }
      .b2w2-monthly-mvp-metrics {
        display: grid;
        grid-template-columns: repeat(3, minmax(0,1fr));
        gap: 0;
        margin-top: 12px;
        border: 1px solid var(--b2w-rule-soft);
        border-radius: var(--b2w-r);
        overflow: hidden;
      }
      .b2w2-monthly-mvp-metric {
        padding: 10px 10px;
        text-align: center;
        background: var(--b2w-paper-alt);
        border-right: 1px solid var(--b2w-rule-soft);
      }
      .b2w2-monthly-mvp-metric:last-child { border-right: none }
      .b2w2-monthly-mvp-metric-label { font-size: 10px; font-weight: 800; color: var(--b2w-ink-soft); text-transform: uppercase; letter-spacing: .04em }
      .b2w2-monthly-mvp-metric-value { margin-top: 5px; font-family: 'Noto Serif KR', Georgia, serif; font-size: 17px; font-weight: 800; color: var(--b2w-ink) }
      .b2w2-monthly-mvp-form { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-top: 10px; padding-top: 10px; border-top: 1px dotted var(--b2w-rule-soft) }

      /* \u2500\u2500 \uB300\uD559\uBCC4 \uCE74\uB4DC \u2500\u2500 */
      .b2w2-card {
        background: var(--b2w-paper);
        border: 1px solid var(--b2w-rule);
        border-radius: var(--b2w-r-lg);
        margin-bottom: 14px;
        overflow: hidden;
        box-shadow: var(--b2w-shadow-sm);
        transition: box-shadow .18s ease, transform .18s ease;
      }
      .b2w2-card:hover { box-shadow: var(--b2w-shadow); transform: translateY(-1px) }
      .b2w2-card-head {
        position: relative;
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
        padding: 14px 18px;
        cursor: pointer;
        transition: filter .14s ease;
        border-bottom: 1px solid var(--b2w-rule-soft);
      }
      .b2w2-card-head:hover { filter: brightness(.97) }
      .b2w2-chip { font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 999px }
      .b2w2-card-title { display: flex; align-items: flex-start; gap: 10px; min-width: 0 }
      .b2w2-card-dot { width: 10px; height: 10px; border-radius: 50%; margin-top: 5px; flex-shrink: 0 }
      .b2w2-card-name {
        font-family: 'Noto Serif KR', Georgia, serif;
        font-size: 18px;
        font-weight: 800;
        color: var(--b2w-ink);
        letter-spacing: -.01em;
      }
      .b2w2-card-sub { margin-top: 4px; font-size: 11px; font-weight: 600; color: var(--b2w-ink-mid); display: flex; gap: 8px; flex-wrap: wrap }
      .b2w2-card-chevron { margin-left: auto; font-size: 12px; color: var(--b2w-ink-soft); padding-top: 3px; flex-shrink: 0 }
      .b2w2-card-body { padding: 14px 18px 18px }
      .b2w2-card-summary { display: grid; grid-template-columns: minmax(0,1.2fr) minmax(260px,.8fr); gap: 14px; padding-bottom: 14px }
      .b2w2-card-kpis {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(118px,1fr));
        gap: 0;
        border: 1px solid var(--b2w-rule-soft);
        border-radius: var(--b2w-r);
        overflow: hidden;
      }
      .b2w2-card-kpi { padding: 12px 14px; border-right: 1px solid var(--b2w-rule-soft); background: var(--b2w-paper-alt) }
      .b2w2-card-kpi:last-child { border-right: none }
      .b2w2-card-kpi-label { font-size: 10px; font-weight: 800; color: var(--b2w-ink-soft); text-transform: uppercase; letter-spacing: .04em }
      .b2w2-card-kpi-value { margin-top: 6px; font-family: 'Noto Serif KR', Georgia, serif; font-size: 20px; font-weight: 800; letter-spacing: -.01em; color: var(--b2w-ink) }
      .b2w2-card-kpi-sub { margin-top: 3px; font-size: 11px; font-weight: 600; color: var(--b2w-ink-soft) }
      .b2w2-card-spotlight {
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 14px 16px;
        border-radius: var(--b2w-r);
        border: 1.5px solid color-mix(in srgb, var(--spot-c, var(--gold, #92651b)) 32%, transparent);
        background: linear-gradient(135deg, color-mix(in srgb, var(--spot-c, var(--gold, #92651b)) 8%, var(--white,#fff)) 0%, color-mix(in srgb, var(--spot-c, var(--gold, #92651b)) 15%, var(--white,#fff)) 100%);
      }
      .b2w2-card-spotlight-kicker { font-size: 10px; font-weight: 800; color: color-mix(in srgb, var(--spot-c, var(--gold, #92651b)) 75%, black 15%); letter-spacing: .08em; text-transform: uppercase }
      .b2w2-card-spotlight-title { margin-top: 6px; font-family: 'Noto Serif KR', Georgia, serif; font-size: 16px; font-weight: 800; color: var(--b2w-ink); display: flex; align-items: center; gap: 6px; flex-wrap: wrap }
      .b2w2-card-spotlight-sub { margin-top: 5px; font-size: 11px; color: var(--b2w-ink-soft); display: flex; gap: 8px; flex-wrap: wrap }
      .b2w2-card-spotlight-body { display: flex; align-items: center; gap: 12px }
      .b2w2-card-spotlight-photo {
        position: relative; width: 56px; height: 56px; flex-shrink: 0; overflow: hidden;
        border-radius: var(--su_profile_radius,50%); clip-path: var(--su_profile_clip,none);
        background: linear-gradient(160deg,#3f3a33,#171512);
        border: 3px solid var(--_c,#92651b);
        box-shadow: 0 0 0 3px var(--b2w-paper,#fff), 0 0 0 4px color-mix(in srgb, var(--_c,#92651b) 38%, transparent), 0 3px 7px rgba(15,23,42,.18);
        display: flex; align-items: center; justify-content: center;
      }
      .b2w2-card-spotlight-photo img { width: 100%; height: 100%; object-fit: cover; display: block }
      .b2w2-card-spotlight-photo-fallback { width: 100%; height: 100%; align-items: center; justify-content: center; display: flex; font-size: 19px; font-weight: 900; color: #fff }
      .b2w2-card-spotlight-wr-badge {
        display: inline-flex; align-items: center; font-weight: 900; font-size: 11px;
        padding: 2px 9px; border-radius: 999px; letter-spacing: -.01em;
      }

      /* \u2500\u2500 \uD14C\uC774\uBE14 \u2500\u2500 */
      .b2w2-table-wrap { border: 1px solid var(--b2w-rule-soft); border-radius: var(--b2w-r); overflow: hidden; background: var(--white) }
      .b2w2-tbl { width: 100%; border-collapse: collapse }
      .b2w2-tbl th {
        font-size: 13px;
        font-weight: 800;
        color: var(--b2w-ink-soft);
        padding: 9px 12px;
        text-align: left;
        border-bottom: 1.5px solid var(--b2w-rule);
        background: var(--b2w-paper-alt);
        white-space: nowrap;
        text-transform: uppercase;
        letter-spacing: .06em;
      }
      .b2w2-tbl td { font-size: 13px; font-weight: 600; padding: 9px 12px; border-bottom: 1px solid var(--b2w-rule-soft); vertical-align: middle }
      .b2w2-tbl tr:last-child td { border-bottom: none }
      .b2w2-tbl tr:hover td { background: var(--b2w-paper-alt) }

      /* \u2500\u2500 \uC885\uC871\uC804 \uBC15\uC2A4 \u2500\u2500 */
      .b2w2-race-box { margin-top: 14px; padding: 14px 16px; border: 1px solid var(--b2w-rule-soft); border-radius: var(--b2w-r); background: var(--b2w-paper-alt) }
      .b2w2-race-title { font-size: 11px; font-weight: 800; color: var(--b2w-ink-soft); margin-bottom: 10px; text-transform: uppercase; letter-spacing: .05em }
      .b2w2-race-table { display: flex; flex-direction: column; gap: 6px }
      .b2w2-race-head, .b2w2-race-row { display: grid; grid-template-columns: minmax(110px,1.4fr) repeat(4,minmax(0,.7fr)); align-items: center; gap: 8px }
      .b2w2-race-head { padding: 0 12px; font-size: 10px; font-weight: 800; color: var(--b2w-ink-soft); letter-spacing: .04em; text-transform: uppercase }
      .b2w2-race-head span { text-align: center }
      .b2w2-race-head span:first-child { text-align: left }
      .b2w2-race-row { padding: 8px 12px; border-radius: var(--b2w-r); border: 1px solid var(--b2w-rule-soft); background: var(--white); box-shadow: var(--b2w-shadow-sm); transition: box-shadow .12s ease }
      .b2w2-race-row:hover { box-shadow: 0 2px 8px rgba(0,0,0,.08) }
      .b2w2-race-cell { display: flex; align-items: center; justify-content: center }
      .b2w2-race-cell-main { justify-content: flex-start; gap: 8px }
      .b2w2-race-pill { display: inline-flex; align-items: center; justify-content: center; min-width: 38px; padding: 3px 8px; border-radius: 999px; font-size: 11px; font-weight: 800 }
      .b2w2-race-pill.win { background: #fef2f2; color: #dc2626 }
      .b2w2-race-pill.loss { background: #f1f5f9; color: #475569 }
      .b2w2-race-count { font-size: 12px; font-weight: 800; color: var(--b2w-ink) }
      .b2w2-race-rate { display: inline-flex; align-items: center; justify-content: center; min-width: 52px; padding: 4px 8px; border-radius: 999px; font-size: 11px; font-weight: 800; border: 1px solid var(--b2w-rule-soft) }

      /* \u2500\u2500 \uBE48 \uC0C1\uD0DC \u2500\u2500 */
      .b2w2-empty { text-align: center; padding: 40px 16px; color: var(--b2w-ink-soft); font-size: 13px; font-family: 'Noto Serif KR', Georgia, serif }

      /* \u2500\u2500 \uBC18\uC751\uD615 \u2500\u2500 */
      @media(min-width:1180px){
        .b2w2-highlight-grid{grid-template-columns:repeat(5,minmax(0,1fr))}
        .b2w2-lead-card{grid-column:span 2}
        /* \uAE30\uAC04 \uC694\uC57D(2\uCE78) + \uC77C\uBC18 \uCE74\uB4DC 6\uAC1C(6\uCE78) + MVP \uCE74\uB4DC(2\uCE78) = 10\uCE78 = 5\uC5F4 x 2\uC904\uB85C \uC815\uD655\uD788 \uCC44\uC6C0.
           MVP \uCE74\uB4DC\uB97C 1\uCE78\uC73C\uB85C \uB450\uBA74 9\uCE78\uC774 \uB418\uC5B4 \uB9C8\uC9C0\uB9C9 \uC904\uC5D0 \uBE48 \uC2AC\uB86F\uC774 \uD558\uB098 \uB0A8\uB294 \uBB38\uC81C\uB97C \uBC29\uC9C0. */
        .b2w2-mvp-card-lead{grid-column:span 2}
      }
      @media(max-width:900px){
        .b2w2-hero{flex-direction:column}
      }
      @media(max-width:600px){
        .b2w2-hero{padding:0 0 14px}
        .b2w2-hero-title{font-size:26px}
        .b2w2-kpi-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
        .b2w2-modebar{grid-template-columns:1fr;gap:8px}
        .b2w2-highlight-grid{grid-template-columns:1fr;gap:8px}
        .b2w2-card-summary{grid-template-columns:1fr}
        .b2w2-card-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}
        .b2w2-race-head,.b2w2-race-row{grid-template-columns:minmax(92px,1.1fr) repeat(4,minmax(0,.7fr));gap:6px}
        .b2w2-tbl th:nth-child(5),.b2w2-tbl td:nth-child(5),
        .b2w2-tbl th:nth-child(4),.b2w2-tbl td:nth-child(4){display:none}
      }
      @media(min-width:601px) and (max-width:960px){
        .b2w2-kpi-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
        .b2w2-modebar{grid-template-columns:repeat(2,minmax(0,1fr))}
        .b2w2-highlight-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
        .b2w2-card-summary{grid-template-columns:1fr}
      }
      @media(min-width:961px) and (max-width:1179px){
        .b2w2-highlight-grid{grid-template-columns:repeat(3,minmax(0,1fr));}
        /* 1180px \uBBF8\uB9CC\uC5D0\uC11C\uB294 lead/MVP \uCE74\uB4DC\uC758 span 2\uAC00 \uC801\uC6A9\uB418\uC9C0 \uC54A\uC73C\uBBC0\uB85C(\uBBF8\uB514\uC5B4\uCFFC\uB9AC \uC2A4\uCF54\uD504 \uBC16)
           \uBAA8\uB4E0 \uCE74\uB4DC\uAC00 1\uCE78\uC529 \uCC28\uC9C0\uD574 \uC790\uC5F0\uC2A4\uB7FD\uAC8C \uD750\uB978\uB2E4. \uC774 \uAD6C\uAC04\uC5D0\uC11C\uB9CC \uBCC4\uB3C4 span \uCC98\uB9AC\uB294 \uBD88\uD544\uC694. */
      }

      /* \u2500\u2500 \uC740\uC740\uD55C \uB4F1\uC7A5 \uC560\uB2C8\uBA54\uC774\uC158 \u2500\u2500 */
      @keyframes b2w2FadeUp {
        from { opacity: 0; transform: translateY(10px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .b2w2-kpi-card, .b2w2-highlight-card, .b2w2-mvp-card, .b2w2-card {
        animation: b2w2FadeUp .42s cubic-bezier(.2,.7,.3,1) both;
      }
      .b2w2-kpi-grid .b2w2-kpi-card:nth-child(1){animation-delay:.02s}
      .b2w2-kpi-grid .b2w2-kpi-card:nth-child(2){animation-delay:.06s}
      .b2w2-kpi-grid .b2w2-kpi-card:nth-child(3){animation-delay:.10s}
      .b2w2-kpi-grid .b2w2-kpi-card:nth-child(4){animation-delay:.14s}
      .b2w2-highlight-grid .b2w2-highlight-card:nth-child(1){animation-delay:.04s}
      .b2w2-highlight-grid .b2w2-highlight-card:nth-child(2){animation-delay:.08s}
      .b2w2-highlight-grid .b2w2-highlight-card:nth-child(3){animation-delay:.12s}
      .b2w2-highlight-grid .b2w2-highlight-card:nth-child(4){animation-delay:.16s}
      .b2w2-highlight-grid .b2w2-highlight-card:nth-child(5){animation-delay:.20s}
      @media (prefers-reduced-motion: reduce) {
        .b2w2-kpi-card, .b2w2-highlight-card, .b2w2-mvp-card, .b2w2-card { animation: none }
      }
    `);let h="";const _totalGames=curStats.gameCount||0,_activeUnivs=curStats.filter(ud=>ud.tg>0).length,_periodDays=diffDays,_totalWins=curStats.reduce((s,ud)=>s+(ud.tw||0),0),_totalLosses=curStats.reduce((s,ud)=>s+(ud.tl||0),0),_prevTotalGames=prevStats.gameCount||0,_gamesDelta=_totalGames-_prevTotalGames,_overallWr=_totalWins+_totalLosses>0?Math.round(_totalWins/(_totalWins+_totalLosses)*1e3)/10:null,_univAcesForExport=_isMonthly?monthlyUnivAces:[...curStats].filter(ud=>ud.tg>0).sort((a,b)=>{var _a2,_b2;return b.tg-a.tg||b.active.length-a.active.length||((_a2=b.wr)!=null?_a2:-1)-((_b2=a.wr)!=null?_b2:-1)}).map(ud=>__spreadProps(__spreadValues({},ud),{ace:_b2WeeklyUnivMVP(ud.active)})),_exportRaceCount={P:{w:0,l:0},T:{w:0,l:0},Z:{w:0,l:0}};targetStats.forEach(ud=>{["P","T","Z"].forEach(r=>{_exportRaceCount[r].w+=ud.raceCount[r].w,_exportRaceCount[r].l+=ud.raceCount[r].l})});const _allActivePlayersRanked=[...activePlayers].sort((a,b)=>{var _a2,_b2;return b.total-a.total||b.wins-a.wins||((_a2=b.winRate)!=null?_a2:-1)-((_b2=a.winRate)!=null?_b2:-1)});try{window._b2BriefingExportCtx={preset,dateFrom,dateTo,prevDateFrom,prevDateTo,selUniv,isMonthly:_isMonthly,isCustom:_isCustom,briefingInfo:_briefingInfo,mvpLabel:_mvpLabel,heroSummary:_heroSummary,heroSpotlight:_heroSpotlight,mvp,mvp2,worstPlayer,topUnivs,rankedUnivs,univAces:_univAcesForExport,raceCountGlobal:_exportRaceCount,allActivePlayersRanked:_allActivePlayersRanked,hotPlayer,coldPlayer,streakPlayer,loseStreakPlayer,bestWrPlayer,mostWinsPlayer,mostActivePlayer,monthlyMvp,monthlyTopPlayers,silentUnivs,totalGames:_totalGames,activeUnivs:_activeUnivs,activePlayerCount:activePlayers.length,periodDays:_periodDays}}catch(e){}let _archiveEntries=[],_archiveWeekCount=0,_archiveMonthCount=0;if(_isArchive)try{typeof _b2EnsureMvpHistoryFresh=="function"&&_b2EnsureMvpHistoryFresh(!1),_archiveEntries=(typeof _b2MvpHistoryLoad=="function"?_b2MvpHistoryLoad():[]).filter(e=>e&&e.name).sort((a,b)=>String(b.from||"").localeCompare(String(a.from||""))),_archiveWeekCount=_archiveEntries.filter(e=>e.type==="week").length,_archiveMonthCount=_archiveEntries.filter(e=>e.type==="month").length}catch(e){}const _archiveTypeFilter=["week","month"].includes(window._b2MvpArchiveType)?window._b2MvpArchiveType:"all",_archiveUnivFilter=window._b2MvpArchiveUniv||"\uC804\uCCB4";if(h+=`<div class="b2w2-wrap" id="b2w2-export-root" data-theme="${_b2BriefingThemeLoad()}">
      <div class="b2w2-masthead">
        <span class="b2w2-masthead-brand"><span class="b2w2-masthead-mark"></span>STAR DATACENTER</span>
        <span>${_isArchive?`${fmtDate(_B2_MVP_SEASON_START)} ~ \uD604\uC7AC`:`${fmtDate(dateFrom)} ~ ${fmtDate(dateTo)} \uBC1C\uD589`}</span>
      </div>
      <section class="b2w2-hero">
        <div class="b2w2-hero-main">
          <div style="font-size:var(--fs-caption);font-weight:900;letter-spacing:.08em;color:var(--b2w-gold);text-transform:uppercase">${_isArchive?"MVP Archive":_briefingInfo.kicker}</div>
          <div class="b2w2-hero-title">${_isArchive?"MVP \uC544\uCE74\uC774\uBE0C":_briefingInfo.title}</div>
          <div class="b2w2-hero-desc">${_isArchive?"\uC2DC\uC98C\uC774 \uC2DC\uC791\uB41C \uC774\uD6C4 \uC9C0\uAE08\uAE4C\uC9C0\uC758 \uBAA8\uB4E0 \uC8FC\uAC04\xB7\uC6D4\uAC04 MVP \uC218\uC0C1 \uAE30\uB85D\uC744 \uBAA8\uC544\uBD24\uC2B5\uB2C8\uB2E4.":_heroSummary}</div>
        </div>
        <div class="b2w2-hero-meta">
          <div class="b2w2-hero-meta-kicker">\uD575\uC2EC \uC9C0\uD45C</div>
          <div class="b2w2-hero-meta-headline">${_isArchive?`\uC8FC\uAC04 MVP ${_archiveWeekCount}\uD68C \xB7 \uC6D4\uAC04 MVP ${_archiveMonthCount}\uD68C \uAE30\uB85D`:_heroSpotlight}</div>
          <div class="b2w2-hero-meta-grid">
            <div class="b2w2-hero-meta-cell">
              <div class="b2w2-hero-meta-label">${_isArchive?"\uC9D1\uACC4 \uC2DC\uC791":"\uD604\uC7AC \uBCF4\uAE30"}</div>
              <div class="b2w2-hero-meta-value">${_isArchive?fmtDate(_B2_MVP_SEASON_START):_briefingInfo.short}</div>
            </div>
            <div class="b2w2-hero-meta-cell">
              <div class="b2w2-hero-meta-label">${_isArchive?"\uC8FC\uAC04 MVP":_heroFocusLabel}</div>
              <div class="b2w2-hero-meta-value">${_isArchive?`${_archiveWeekCount}\uD68C`:_heroFocusValue}</div>
            </div>
            <div class="b2w2-hero-meta-cell">
              <div class="b2w2-hero-meta-label">${_isArchive?"\uC6D4\uAC04 MVP":"\uBE44\uAD50 \uAE30\uC900"}</div>
              <div class="b2w2-hero-meta-value">${_isArchive?`${_archiveMonthCount}\uD68C`:_heroCompareText}</div>
            </div>
            <div class="b2w2-hero-meta-cell">
              <div class="b2w2-hero-meta-label">\uD544\uD130</div>
              <div class="b2w2-hero-meta-value">${_isArchive?_archiveUnivFilter==="\uC804\uCCB4"?"\uC804\uCCB4 \uB300\uD559":_archiveUnivFilter:selUniv==="\uC804\uCCB4"?"\uC804\uCCB4 \uB300\uD559":selUniv}</div>
            </div>
          </div>
        </div>
      </section>
      <div class="b2w2-modebar">
        <div class="b2w2-modecard ${!_isMonthly&&!_isCustom&&!_isArchive?"is-active":""}" onclick="_b2SetBriefingPreset('thisWeek')">
          <div class="b2w2-modehead">
            <div>
              <div class="b2w2-modekicker">\uC8FC\uAC04 \uBAA8\uB4DC</div>
              <div class="b2w2-modetitle">\uC8FC\uAC04</div>
            </div>
            <span class="b2w2-modebadge">${!_isMonthly&&!_isCustom&&!_isArchive?"\uC120\uD0DD\uB428":"\uBE60\uB978 \uD655\uC778"}</span>
          </div>
          <div class="b2w2-modedesc">\uC774\uBC88\uC8FC\uC640 \uC9C0\uB09C\uC8FC \uD750\uB984\uC744 \uBE60\uB974\uAC8C \uBE44\uAD50\uD560 \uB54C \uBCF4\uAE30 \uC88B\uC2B5\uB2C8\uB2E4.</div>
          <div class="b2w2-presetrow">
            ${[["thisWeek","\uC774\uBC88\uC8FC"],["lastWeek","\uC9C0\uB09C\uC8FC"]].map(([key,label])=>`<button type="button" class="b2w2-preset${preset===key?" on":""}" onclick="event.stopPropagation();_b2SetBriefingPreset('${key}')">${label}</button>`).join("")}
          </div>
        </div>
        <div class="b2w2-modecard ${_isMonthly?"is-active":""}" onclick="_b2SetBriefingPreset('thisMonth')">
          <div class="b2w2-modehead">
            <div>
              <div class="b2w2-modekicker">\uC6D4\uAC04 \uBAA8\uB4DC</div>
              <div class="b2w2-modetitle">\uC6D4\uAC04</div>
            </div>
            <span class="b2w2-modebadge">${_isMonthly?"\uC120\uD0DD\uB428":"\uAE4A\uAC8C \uBCF4\uAE30"}</span>
          </div>
          <div class="b2w2-modedesc">\uC774\uBC88\uB2EC\uACFC \uC9C0\uB09C\uB2EC \uD750\uB984\uC744 \uC870\uAE08 \uB354 \uB113\uAC8C \uD655\uC778\uD560 \uB54C \uC801\uD569\uD569\uB2C8\uB2E4.</div>
          <div class="b2w2-presetrow">
            ${[["thisMonth","\uC774\uBC88\uB2EC"],["lastMonth","\uC9C0\uB09C\uB2EC"]].map(([key,label])=>`<button type="button" class="b2w2-preset${preset===key?" on":""}" onclick="event.stopPropagation();_b2SetBriefingPreset('${key}')">${label}</button>`).join("")}
          </div>
        </div>
        <div class="b2w2-modecard ${_isCustom?"is-active":""}" onclick="_b2ActivateBriefingCustom(true)">
          <div class="b2w2-modehead">
            <div>
              <div class="b2w2-modekicker">\uC0AC\uC6A9\uC790 \uAE30\uAC04</div>
              <div class="b2w2-modetitle">\uAE30\uAC04</div>
            </div>
            <span class="b2w2-modebadge">${_isCustom?"\uC0AC\uC6A9 \uC911":"\uC9C1\uC811 \uC9C0\uC815"}</span>
          </div>
          <div class="b2w2-modedesc">\uC6D0\uD558\uB294 \uB0A0\uC9DC \uBC94\uC704\uB97C \uC9C1\uC811 \uC785\uB825\uD574 \uD2B9\uC815 \uAE30\uAC04 \uBE0C\uB9AC\uD551\uC73C\uB85C \uBCFC \uC218 \uC788\uC2B5\uB2C8\uB2E4.</div>
          <div class="b2w2-presetrow">
            <button type="button" class="b2w2-preset${_isCustom&&_periodDays===7?" on":""}" onclick="event.stopPropagation();_b2SetBriefingRecentDays(7)">\uCD5C\uADFC 7\uC77C</button>
            <button type="button" class="b2w2-preset${_isCustom&&_periodDays===14?" on":""}" onclick="event.stopPropagation();_b2SetBriefingRecentDays(14)">\uCD5C\uADFC 14\uC77C</button>
            <button type="button" class="b2w2-preset${_isCustom&&_periodDays===30?" on":""}" onclick="event.stopPropagation();_b2SetBriefingRecentDays(30)">\uCD5C\uADFC 30\uC77C</button>
            <button type="button" class="b2w2-preset${_isCustom&&![7,14,30].includes(_periodDays)?" on":""}" onclick="event.stopPropagation();_b2ActivateBriefingCustom(true)">\uC9C1\uC811 \uC9C0\uC815</button>
            <button type="button" class="b2w2-preset${_isCustom&&![7,14,30].includes(_periodDays)?" on":""}" onclick="event.stopPropagation();_b2ApplyBriefingCustomFromInputs()">${_isCustom?`${fmtDate(dateFrom)} ~ ${fmtDate(dateTo)}`:"\uC785\uB825\uAC12 \uC870\uD68C"}</button>
          </div>
        </div>
        <div class="b2w2-modecard ${_isArchive?"is-active":""}" onclick="_b2SetBriefingPreset('mvpArchive')">
          <div class="b2w2-modehead">
            <div>
              <div class="b2w2-modekicker">MVP \uC544\uCE74\uC774\uBE0C</div>
              <div class="b2w2-modetitle">MVP</div>
            </div>
            <span class="b2w2-modebadge">${_isArchive?"\uBCF4\uB294 \uC911":"\uC804\uCCB4 \uAE30\uB85D"}</span>
          </div>
          <div class="b2w2-modedesc">\uC2DC\uC98C \uC2DC\uC791\uBD80\uD130 \uC9C0\uAE08\uAE4C\uC9C0\uC758 \uC8FC\uAC04\xB7\uC6D4\uAC04 MVP\uB97C \uD55C \uBC88\uC5D0 \uBAA8\uC544\uBD05\uB2C8\uB2E4.</div>
          <div class="b2w2-presetrow">
            <button type="button" class="b2w2-preset${_isArchive?" on":""}" onclick="event.stopPropagation();_b2SetBriefingPreset('mvpArchive')">\uC544\uCE74\uC774\uBE0C \uBCF4\uAE30</button>
          </div>
        </div>
      </div>`,_isArchive)return h+=_b2RenderMvpArchiveBody(_archiveEntries,_archiveTypeFilter,_archiveUnivFilter,univList),h+="</div>",h;if(h+=`<div class="b2w2-hdr">
      <span style="font-size:16px">\u{1F4C5}</span>
      <span style="font-size:14px;font-weight:900;color:var(--text1)">${_briefingInfo.title}</span>
      <input type="date" class="b2w2-din" id="b2w2-from" value="${dateFrom}" onchange="_b2SyncBriefingCustomInputs(true)" title="\uC2DC\uC791 \uB0A0\uC9DC \uBCC0\uACBD">
      <button type="button" class="b2w2-datebtn" onclick="_b2OpenBriefingDateInput('from')" title="\uC2DC\uC791 \uB0A0\uC9DC \uC120\uD0DD">\u{1F4C5} \uC2DC\uC791\uC77C</button>
      <span style="font-size:var(--fs-sm);color:var(--text3);font-weight:700">~</span>
      <input type="date" class="b2w2-din" id="b2w2-to" value="${dateTo}" onchange="_b2SyncBriefingCustomInputs(true)" title="\uC885\uB8CC \uB0A0\uC9DC \uBCC0\uACBD">
      <button type="button" class="b2w2-datebtn" onclick="_b2OpenBriefingDateInput('to')" title="\uC885\uB8CC \uB0A0\uC9DC \uC120\uD0DD">\u{1F4C5} \uC885\uB8CC\uC77C</button>
      <select class="b2w2-sel" id="b2w2-univ" onchange="_b2SyncBriefingCustomInputs(true)">
        <option value="\uC804\uCCB4"${selUniv==="\uC804\uCCB4"?" selected":""}>\u{1F3EB} \uC804\uCCB4 \uB300\uD559</option>
        ${univList.map(u=>{const _n2=typeof escAttr=="function"?escAttr(u.name):String(u.name||""),_nh=typeof window.escHTML=="function"?window.escHTML(u.name):String(u.name||"");return`<option value="${_n2}"${selUniv===u.name?" selected":""}>${_nh}</option>`}).join("")}
      </select>
      <button type="button" class="b2w2-btn" onclick="_b2ApplyBriefingCustomFromInputs()">\uC870\uD68C</button>
      <button type="button" class="b2w2-btn no-export" style="background:var(--b2w-paper-alt);color:var(--text2);border:1px solid rgba(148,163,184,.3)" onclick="_b2ResetBriefingFilters()" title="\uC774\uBC88\uC8FC \uBE0C\uB9AC\uD551\uC73C\uB85C \uCD08\uAE30\uD654">\u21BA \uCD08\uAE30\uD654</button>
      <button type="button" class="b2w2-btn no-export b2w2-savebtn" style="margin-left:auto" onclick="captureBriefingArticle()">\u{1F4F0} \uBE0C\uB9AC\uD551 \uC800\uC7A5</button>
    </div>
    <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;padding:7px 2px 10px;border-bottom:1px dashed var(--b2w-rule-soft);margin-bottom:16px">
      <span style="font-size:10px;font-weight:800;color:var(--b2w-tag-muted);letter-spacing:.06em;text-transform:uppercase;flex-shrink:0">\uB370\uC774\uD130 \uBC94\uC704</span>
      <span style="font-size:10px;color:var(--b2w-tag-text);background:var(--b2w-tag-bg);border:1px solid var(--b2w-tag-border);border-radius:4px;padding:2px 7px;font-weight:700">\uBBF8\uB2C8\uB300\uC804</span>
      <span style="font-size:10px;color:var(--b2w-tag-text);background:var(--b2w-tag-bg);border:1px solid var(--b2w-tag-border);border-radius:4px;padding:2px 7px;font-weight:700">\uB300\uD559\uB300\uC804</span>
      <span style="font-size:10px;color:var(--b2w-tag-text);background:var(--b2w-tag-bg);border:1px solid var(--b2w-tag-border);border-radius:4px;padding:2px 7px;font-weight:700">\uB300\uD559CK</span>
      <span style="font-size:10px;color:var(--b2w-tag-text);background:var(--b2w-tag-bg);border:1px solid var(--b2w-tag-border);border-radius:4px;padding:2px 7px;font-weight:700">\uB300\uD68C \xB7 \uC77C\uBC18</span>
      <span style="font-size:10px;color:var(--b2w-tag-text);background:var(--b2w-tag-bg);border:1px solid var(--b2w-tag-border);border-radius:4px;padding:2px 7px;font-weight:700">\uB300\uD68C \xB7 \uC870\uBCC4\uB9AC\uADF8</span>
      <span style="font-size:10px;color:var(--b2w-tag-text);background:var(--b2w-tag-bg);border:1px solid var(--b2w-tag-border);border-radius:4px;padding:2px 7px;font-weight:700">\uB300\uD68C \xB7 \uB300\uC9C4\uD45C\uAE30\uB85D</span>
      <span style="font-size:10px;color:var(--b2w-accent);background:var(--b2w-tag-accent-bg);border:1px solid var(--b2w-tag-accent-border);border-radius:4px;padding:2px 7px;font-weight:700">\uD2F0\uC5B4\uB300\uD68C \xB7 \uC77C\uBC18</span>
      <span style="font-size:10px;color:var(--b2w-accent);background:var(--b2w-tag-accent-bg);border:1px solid var(--b2w-tag-accent-border);border-radius:4px;padding:2px 7px;font-weight:700">\uD2F0\uC5B4\uB300\uD68C \xB7 \uC870\uBCC4\uB9AC\uADF8</span>
      <span style="font-size:10px;color:var(--b2w-accent);background:var(--b2w-tag-accent-bg);border:1px solid var(--b2w-tag-accent-border);border-radius:4px;padding:2px 7px;font-weight:700">\uD2F0\uC5B4\uB300\uD68C \xB7 \uB300\uC9C4\uD45C\uAE30\uB85D</span>
      <span style="font-size:10px;color:var(--b2w-tag-muted);margin-left:2px">\u203B \uAC1C\uC778\uC804\xB7\uB05D\uC7A5\uC804\xB7\uD504\uB85C\uB9AC\uADF8 \uAE30\uB85D\uC740 \uBE0C\uB9AC\uD551 \uC9D1\uACC4\uC5D0\uC11C \uC81C\uC678\uB429\uB2C8\uB2E4</span>
    </div>`,!targetStats.some(ud=>ud.tg>0))return h+='<div class="b2w2-empty"><div style="font-size:28px;margin-bottom:8px">\u{1F4ED}</div>\uD574\uB2F9 \uAE30\uAC04\uC5D0 \uAE30\uB85D\uB41C \uACBD\uAE30\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.<div style="font-size:var(--fs-caption);margin-top:4px">\uAE30\uAC04\uC744 \uBCC0\uACBD\uD574\uBCF4\uC138\uC694</div></div></div>',h;const _leaderForKpi=_isMonthly?rankedUnivs[0]:topUnivs[0],_leaderLabel=_isMonthly?"\uC120\uB450 \uB300\uD559":"\uD65C\uB3D9\uB7C9 1\uC704 \uB300\uD559",_leaderValue=_leaderForKpi?_leaderForKpi.u.name:"-",_leaderColor=_leaderForKpi&&typeof gc=="function"&&gc(_leaderForKpi.u.name)||"#f59e0b",_leaderSub=_leaderForKpi?_isMonthly?`${_leaderForKpi.tw}\uC2B9 ${_leaderForKpi.tl}\uD328 \xB7 \uC2B9\uB960 ${(_a=_leaderForKpi.wr)!=null?_a:0}%`:`${_leaderForKpi.tg}\uC804 \xB7 \uD65C\uB3D9 ${_leaderForKpi.active.length}\uBA85`:"\uC9D1\uACC4 \uB370\uC774\uD130 \uC5C6\uC74C",_bestWrSub=bestWrPlayer?`${((_b=bestWrPlayer.p)==null?void 0:_b.name)||"-"} \xB7 ${bestWrPlayer.total}\uC804`:"\uD45C\uBCF8 \uBD80\uC871";h+=`<section class="b2w2-kpi-grid">
      <article class="b2w2-kpi-card" style="--kpi-accent:#6366f1">
        <div class="b2w2-kpi-label">\u{1F3EB} \uD65C\uB3D9 \uB300\uD559</div>
        <div class="b2w2-kpi-value">${_activeUnivs}<span style="font-size:14px;font-weight:700;color:var(--b2w-ink-soft);margin-left:2px">\uACF3</span></div>
        <div class="b2w2-kpi-sub">\uACBD\uAE30 \uAE30\uB85D \uC788\uB294 \uB300\uD559 \uC218</div>
      </article>
      <article class="b2w2-kpi-card" style="--kpi-accent:#0ea5e9">
        <div class="b2w2-kpi-label">\u{1F3AE} \uCD1D \uACBD\uAE30 \uC218</div>
        <div class="b2w2-kpi-value">${_totalGames}<span style="font-size:14px;font-weight:700;color:var(--b2w-ink-soft);margin-left:2px">\uC804</span></div>
        <div class="b2w2-kpi-sub">${_periodDays}\uC77C \uC9D1\uACC4 \uAE30\uC900</div>
      </article>
      <article class="b2w2-kpi-card" style="--kpi-accent:${_leaderColor}">
        <div class="b2w2-kpi-label">\u{1F451} ${_leaderLabel}</div>
        <div class="b2w2-kpi-value" style="font-size:var(--fs-lg);margin-top:8px">${_leaderValue}</div>
        <div class="b2w2-kpi-sub">${_leaderSub}</div>
      </article>
      <article class="b2w2-kpi-card" style="--kpi-accent:#10b981">
        <div class="b2w2-kpi-label">\u{1F3AF} \uCD5C\uACE0 \uC2B9\uB960</div>
        <div class="b2w2-kpi-value" style="color:#10b981">${bestWrPlayer?`${bestWrPlayer.winRate}%`:"-"}</div>
        <div class="b2w2-kpi-sub">${_bestWrSub}</div>
      </article>
    </section>`,h+=`<section class="b2w2-highlight-grid">
      <article class="b2w2-highlight-card b2w2-lead-card" style="border-color:var(--b2w-accent-border);--hc-top:var(--b2w-accent)">
        <div class="b2w2-highlight-kicker" style="color:var(--b2w-accent)">\uC804\uCCB4 \uC804\uC801</div>
        <div class="b2w2-highlight-title">\uC885\uD569 \uC2B9\uD328 \uAC1C\uC694</div>
        <div class="b2w2-highlight-desc">\uC804\uCCB4 \uB300\uD559 \uD569\uC0B0 \uC2B9\uB960\uC740 ${_overallWr!==null?`${_overallWr}%`:"\uC9D1\uACC4 \uBD88\uAC00"}\uC774\uBA70, \uC804\uAE30 \uB300\uBE44 \uACBD\uAE30 \uC218\uB294 ${_gamesDelta>0?`${_gamesDelta}\uC804 \uB298\uC5C8\uC2B5\uB2C8\uB2E4`:_gamesDelta<0?`${Math.abs(_gamesDelta)}\uC804 \uC904\uC5C8\uC2B5\uB2C8\uB2E4`:"\uB3D9\uC77C\uD569\uB2C8\uB2E4"}.</div>
        <div class="b2w2-highlight-list" style="margin-top:2px">
          <div class="b2w2-highlight-row"><span style="font-size:var(--fs-caption);color:var(--text3)">\uC804\uCCB4 \uC2B9/\uD328</span><strong style="font-size:var(--fs-sm);color:var(--text1)">${_totalWins}\uC2B9 ${_totalLosses}\uD328</strong></div>
          <div class="b2w2-highlight-row"><span style="font-size:var(--fs-caption);color:var(--text3)">\uC804\uAE30 \uB300\uBE44 \uACBD\uAE30 \uC218</span><strong style="font-size:var(--fs-sm);color:${_gamesDelta>0?"#15803d":_gamesDelta<0?"#dc2626":"var(--text1)"}">${_gamesDelta>0?"\u25B2+":_gamesDelta<0?"\u25BC":"\u2501"}${Math.abs(_gamesDelta)}\uC804</strong></div>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <span class="b2w2-note-chip" style="border-color:var(--b2w-tag-accent-border);color:var(--b2w-accent);background:var(--b2w-tag-accent-bg)">\uD65C\uB3D9 \uC2A4\uD2B8\uB9AC\uBA38 ${activePlayers.length}\uBA85</span>
          <span class="b2w2-note-chip">${_periodDays}\uC77C \uC9D1\uACC4</span>
          <span class="b2w2-note-chip">${_briefingInfo.prevLabel} \uB300\uBE44 \uBE44\uAD50</span>
        </div>
      </article>
      <article class="b2w2-highlight-card" style="--hc-top:#6366f1">
        <div class="b2w2-highlight-kicker" style="color:#4f46e5">\u{1F3EB} \uB300\uD559 \uD65C\uB3D9\uB7C9</div>
        <div class="b2w2-highlight-title">${_topLabel}</div>
        <div class="b2w2-highlight-list">
          ${topUnivs.length?topUnivs.map((ud,idx)=>`
            <div class="b2w2-highlight-row">
              <div style="display:flex;align-items:center;gap:8px;min-width:0">
                <span style="font-size:var(--fs-caption);font-weight:900;color:${gc?gc(ud.u.name):"#64748b"}">${idx+1}</span>
                <span style="font-size:var(--fs-sm);font-weight:900;color:var(--text1)">${typeof window.escHTML=="function"?window.escHTML(ud.u.name):String(ud.u.name||"")}</span>
              </div>
              <div style="font-size:var(--fs-caption);font-weight:800;color:var(--text3)">${ud.tg}\uC804 \xB7 \uD65C\uB3D9 ${ud.active.length}\uBA85</div>
            </div>
          `).join(""):'<div class="b2w2-highlight-desc">\uD65C\uB3D9 \uB300\uD559\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.</div>'}
        </div>
      </article>
      <article class="b2w2-highlight-card" style="--hc-top:#10b981">
        <div class="b2w2-highlight-kicker" style="color:#15803d">\u{1F4C8} \uC2B9\uB960 \uBCC0\uB3D9</div>
        <div class="b2w2-highlight-title">\uC804\uAE30 \uB300\uBE44 \uC2B9\uB960 \uBCC0\uD654</div>
        <div class="b2w2-dual-card">
          <div class="b2w2-dual-block">
            ${hotPlayer?`
              <div class="b2w2-dual-head">
                <div style="min-width:0">
                  <div class="b2w2-dual-title" style="color:#15803d">\uC0C1\uC2B9\uC138</div>
                  <div class="b2w2-dual-sub"><span style="font-weight:900;color:var(--text1);cursor:pointer" onclick="openPlayerModal('${((_d=(_c=hotPlayer.p)==null?void 0:_c.name)==null?void 0:_d.replace(/\\/g,"\\\\").replace(/'/g,"\\'"))||""}')">${((_e=hotPlayer.p)==null?void 0:_e.name)||"-"}</span> \xB7 ${String(((_f=hotPlayer.p)==null?void 0:_f.univ)||"\uBB34\uC18C\uC18D")}</div>
                </div>
                <span class="b2w2-note-chip" style="border-color:#bbf7d0;color:#15803d;background:#f0fdf4">${hotPlayer.wrDelta>=0?"+":""}${hotPlayer.wrDelta}%p</span>
              </div>
              <div class="b2w2-mini-list">
                <div class="b2w2-mini-row"><span style="color:var(--text3)">\uC804\uC801</span><span style="color:var(--text1)">${hotPlayer.wins}\uC2B9 ${hotPlayer.losses}\uD328</span></div>
                <div class="b2w2-mini-row"><span style="color:var(--text3)">\uACBD\uAE30 \uC218 \uBCC0\uD654</span><span style="color:var(--text1)">${hotPlayer.totalDelta>=0?"+":""}${hotPlayer.totalDelta}\uC804</span></div>
                ${risingPlayers[1]?`<div class="b2w2-mini-row"><span style="color:var(--text3)">2\uC704</span><span style="color:#15803d">${((_g=risingPlayers[1].p)==null?void 0:_g.name)||"-"} ${risingPlayers[1].wrDelta>=0?"+":""}${risingPlayers[1].wrDelta}%p</span></div>`:""}
              </div>
            `:'<div class="b2w2-highlight-desc">\uC804\uC8FC\uC640 \uBE44\uAD50\uD560 \uB9CC\uD07C \uC0C1\uC2B9\uD55C \uC2A4\uD2B8\uB9AC\uBA38\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.</div>'}
          </div>
          <div class="b2w2-dual-block">
            ${coldPlayer?`
              <div class="b2w2-dual-head">
                <div style="min-width:0">
                  <div class="b2w2-dual-title" style="color:#dc2626">\uD558\uB77D\uC138</div>
                  <div class="b2w2-dual-sub"><span style="font-weight:900;color:var(--text1);cursor:pointer" onclick="openPlayerModal('${((_i=(_h=coldPlayer.p)==null?void 0:_h.name)==null?void 0:_i.replace(/\\/g,"\\\\").replace(/'/g,"\\'"))||""}')">${((_j=coldPlayer.p)==null?void 0:_j.name)||"-"}</span> \xB7 ${String(((_k=coldPlayer.p)==null?void 0:_k.univ)||"\uBB34\uC18C\uC18D")}</div>
                </div>
                <span class="b2w2-note-chip" style="border-color:#fecaca;color:#dc2626;background:#fef2f2">${coldPlayer.wrDelta}%p</span>
              </div>
              <div class="b2w2-mini-list">
                <div class="b2w2-mini-row"><span style="color:var(--text3)">\uC804\uC801</span><span style="color:var(--text1)">${coldPlayer.wins}\uC2B9 ${coldPlayer.losses}\uD328</span></div>
                <div class="b2w2-mini-row"><span style="color:var(--text3)">\uACBD\uAE30 \uC218 \uBCC0\uD654</span><span style="color:var(--text1)">${coldPlayer.totalDelta>=0?"+":""}${coldPlayer.totalDelta}\uC804</span></div>
                ${decliningPlayers[1]?`<div class="b2w2-mini-row"><span style="color:var(--text3)">2\uC704</span><span style="color:#dc2626">${((_l=decliningPlayers[1].p)==null?void 0:_l.name)||"-"} ${decliningPlayers[1].wrDelta}%p</span></div>`:""}
              </div>
            `:'<div class="b2w2-highlight-desc">\uC804\uC8FC\uC640 \uBE44\uAD50\uD560 \uB9CC\uD07C \uD558\uB77D\uD55C \uC2A4\uD2B8\uB9AC\uBA38\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.</div>'}
          </div>
        </div>
      </article>
      <article class="b2w2-highlight-card" style="--hc-top:#0891b2">
        <div class="b2w2-highlight-kicker" style="color:#0891b2">\u{1F525} \uC5F0\uC18D \uAE30\uB85D</div>
        <div class="b2w2-highlight-title">\uC5F0\uC2B9 / \uC5F0\uD328 \uD604\uD669</div>
        <div class="b2w2-dual-card">
          <div class="b2w2-dual-block">
            ${streakPlayer?`
              <div class="b2w2-dual-head">
                <div style="min-width:0">
                  <div class="b2w2-dual-title" style="color:#0891b2">\uC5F0\uC2B9</div>
                  <div class="b2w2-dual-sub"><span style="font-weight:900;color:var(--text1);cursor:pointer" onclick="openPlayerModal('${((_n=(_m=streakPlayer.p)==null?void 0:_m.name)==null?void 0:_n.replace(/\\/g,"\\\\").replace(/'/g,"\\'"))||""}')">${((_o=streakPlayer.p)==null?void 0:_o.name)||"-"}</span> \xB7 ${String(((_p=streakPlayer.p)==null?void 0:_p.univ)||"\uBB34\uC18C\uC18D")}</div>
                </div>
                <span class="b2w2-note-chip" style="border-color:#a5f3fc;color:#0891b2;background:#ecfeff">\u{1F525} ${streakPlayer.streak}\uC5F0\uC2B9</span>
              </div>
              <div class="b2w2-mini-list">
                ${streakPlayers.slice(1,3).map((s,idx)=>{var _a2;return`
                  <div class="b2w2-mini-row">
                    <span style="color:var(--text1)">${idx+2}. ${((_a2=s.p)==null?void 0:_a2.name)||"-"}</span>
                    <span style="color:#0891b2">${s.streak}\uC5F0\uC2B9</span>
                  </div>
                `}).join("")||'<div class="b2w2-mini-row"><span style="color:var(--text3)">\uBCF4\uC870 \uB7AD\uD06C</span><span style="color:#0891b2">\uB2E8\uB3C5 \uC120\uB450</span></div>'}
              </div>
            `:'<div class="b2w2-highlight-desc">2\uC5F0\uC2B9 \uC774\uC0C1 \uAE30\uB85D \uC911\uC778 \uC2A4\uD2B8\uB9AC\uBA38\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.</div>'}
          </div>
          <div class="b2w2-dual-block">
            ${loseStreakPlayer?`
              <div class="b2w2-dual-head">
                <div style="min-width:0">
                  <div class="b2w2-dual-title" style="color:#dc2626">\uC5F0\uD328</div>
                  <div class="b2w2-dual-sub"><span style="font-weight:900;color:var(--text1);cursor:pointer" onclick="openPlayerModal('${((_r=(_q=loseStreakPlayer.p)==null?void 0:_q.name)==null?void 0:_r.replace(/\\/g,"\\\\").replace(/'/g,"\\'"))||""}')">${((_s=loseStreakPlayer.p)==null?void 0:_s.name)||"-"}</span> \xB7 ${String(((_t=loseStreakPlayer.p)==null?void 0:_t.univ)||"\uBB34\uC18C\uC18D")}</div>
                </div>
                <span class="b2w2-note-chip" style="border-color:#fecaca;color:#dc2626;background:#fef2f2">\u{1F4A7} ${loseStreakPlayer.streak}\uC5F0\uD328</span>
              </div>
              <div class="b2w2-mini-list">
                ${loseStreakPlayers.slice(1,3).map((s,idx)=>{var _a2;return`
                  <div class="b2w2-mini-row">
                    <span style="color:var(--text1)">${idx+2}. ${((_a2=s.p)==null?void 0:_a2.name)||"-"}</span>
                    <span style="color:#dc2626">${s.streak}\uC5F0\uD328</span>
                  </div>
                `}).join("")||'<div class="b2w2-mini-row"><span style="color:var(--text3)">\uBCF4\uC870 \uB7AD\uD06C</span><span style="color:#dc2626">\uB2E8\uB3C5 \uC9D1\uACC4</span></div>'}
              </div>
            `:'<div class="b2w2-highlight-desc">2\uC5F0\uD328 \uC774\uC0C1 \uAE30\uB85D \uC911\uC778 \uC2A4\uD2B8\uB9AC\uBA38\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.</div>'}
          </div>
        </div>
      </article>
      <article class="b2w2-highlight-card" style="--hc-top:#16a34a">
        <div class="b2w2-highlight-kicker" style="color:#16a34a">\u{1F3C5} \uC2B9\uB960 \uC9C0\uD45C</div>
        <div class="b2w2-highlight-title">\uCD5C\uACE0 \uC2B9\uB960</div>
        ${bestWrPlayer?`
          <div style="display:flex;align-items:center;justify-content:space-between;gap:12px">
            <div>
              <div style="font-size:var(--fs-lg);font-weight:950;color:var(--text1);cursor:pointer" onclick="openPlayerModal('${((_v=(_u=bestWrPlayer.p)==null?void 0:_u.name)==null?void 0:_v.replace(/\\/g,"\\\\").replace(/'/g,"\\'"))||""}')">${((_w=bestWrPlayer.p)==null?void 0:_w.name)||"-"}</div>
              <div style="font-size:var(--fs-sm);color:var(--text3);margin-top:4px">${String(((_x=bestWrPlayer.p)==null?void 0:_x.univ)||"\uBB34\uC18C\uC18D")}</div>
            </div>
            <span class="b2w2-note-chip" style="border-color:#bbf7d0;color:#16a34a;background:#f0fdf4">${bestWrPlayer.winRate}%</span>
          </div>
          <div class="b2w2-highlight-list">
            <div class="b2w2-highlight-row"><span style="font-size:var(--fs-caption);color:var(--text3)">\uC804\uC801</span><strong style="font-size:var(--fs-sm);color:var(--text1)">${bestWrPlayer.total}\uC804 ${bestWrPlayer.wins}\uC2B9 ${bestWrPlayer.losses}\uD328</strong></div>
          </div>
          ${bestWrPlayers.length>1?`
          <div class="b2w2-highlight-list" style="margin-top:4px;padding-top:8px;border-top:1px dashed rgba(148,163,184,.25)">
            ${bestWrPlayers.slice(1,3).map((s,idx)=>{var _a2,_b2,_c2;return`
              <div class="b2w2-highlight-row">
                <span style="font-size:var(--fs-sm);font-weight:800;color:var(--text1);cursor:pointer" onclick="openPlayerModal('${((_b2=(_a2=s.p)==null?void 0:_a2.name)==null?void 0:_b2.replace(/\\/g,"\\\\").replace(/'/g,"\\'"))||""}')">${idx+2}. ${((_c2=s.p)==null?void 0:_c2.name)||"-"}</span>
                <strong style="font-size:var(--fs-caption);color:#16a34a">${s.winRate}%</strong>
              </div>
            `}).join("")}
          </div>`:""}
        `:'<div class="b2w2-highlight-desc">3\uC804 \uC774\uC0C1 \uAE30\uB85D\uD55C \uC2A4\uD2B8\uB9AC\uBA38\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.</div>'}
      </article>
      <article class="b2w2-highlight-card" style="--hc-top:#0ea5e9">
        <div class="b2w2-highlight-kicker" style="color:#0284c7">\u2694\uFE0F \uC804\uCCB4 \uACBD\uAE30 \uC9C0\uD45C</div>
        <div class="b2w2-highlight-title">\uCD5C\uB2E4 \uC804\uCCB4 \uACBD\uAE30</div>
        ${mostActivePlayer?`
          <div style="display:flex;align-items:center;justify-content:space-between;gap:12px">
            <div>
              <div style="font-size:var(--fs-lg);font-weight:950;color:var(--text1);cursor:pointer" onclick="openPlayerModal('${((_z=(_y=mostActivePlayer.p)==null?void 0:_y.name)==null?void 0:_z.replace(/\\/g,"\\\\").replace(/'/g,"\\'"))||""}')">${((_A=mostActivePlayer.p)==null?void 0:_A.name)||"-"}</div>
              <div style="font-size:var(--fs-sm);color:var(--text3);margin-top:4px">${String(((_B=mostActivePlayer.p)==null?void 0:_B.univ)||"\uBB34\uC18C\uC18D")}</div>
            </div>
            <span class="b2w2-note-chip" style="border-color:#bae6fd;color:#0284c7;background:#f0f9ff">${mostActivePlayer.total}\uC804</span>
          </div>
          <div class="b2w2-highlight-list">
            <div class="b2w2-highlight-row"><span style="font-size:var(--fs-caption);color:var(--text3)">\uC804\uCCB4 \uC804\uC801</span><strong style="font-size:var(--fs-sm);color:var(--text1)">${mostActivePlayer.wins}\uC2B9 ${mostActivePlayer.losses}\uD328 \xB7 ${(_C=mostActivePlayer.winRate)!=null?_C:"-"}%</strong></div>
          </div>
          ${mostActivePlayers.length>1?`
          <div class="b2w2-highlight-list" style="margin-top:4px;padding-top:8px;border-top:1px dashed rgba(148,163,184,.25)">
            ${mostActivePlayers.slice(1,3).map((s,idx)=>{var _a2,_b2,_c2;return`
              <div class="b2w2-highlight-row">
                <span style="font-size:var(--fs-sm);font-weight:800;color:var(--text1);cursor:pointer" onclick="openPlayerModal('${((_b2=(_a2=s.p)==null?void 0:_a2.name)==null?void 0:_b2.replace(/\\/g,"\\\\").replace(/'/g,"\\'"))||""}')">${idx+2}. ${((_c2=s.p)==null?void 0:_c2.name)||"-"}</span>
                <strong style="font-size:var(--fs-caption);color:#0284c7">${s.total}\uC804</strong>
              </div>
            `}).join("")}
          </div>`:""}
        `:'<div class="b2w2-highlight-desc">\uACBD\uAE30 \uAE30\uB85D\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.</div>'}
      </article>
      <article class="b2w2-highlight-card" style="--hc-top:#f97316">
        <div class="b2w2-highlight-kicker" style="color:#f97316">\u{1F3C6} \uC2B9\uC218 \uC9C0\uD45C</div>
        <div class="b2w2-highlight-title">\uCD5C\uB2E4 \uC2B9\uC218</div>
        ${mostWinsPlayer?`
          <div style="display:flex;align-items:center;justify-content:space-between;gap:12px">
            <div>
              <div style="font-size:var(--fs-lg);font-weight:950;color:var(--text1);cursor:pointer" onclick="openPlayerModal('${((_E=(_D=mostWinsPlayer.p)==null?void 0:_D.name)==null?void 0:_E.replace(/\\/g,"\\\\").replace(/'/g,"\\'"))||""}')">${((_F=mostWinsPlayer.p)==null?void 0:_F.name)||"-"}</div>
              <div style="font-size:var(--fs-sm);color:var(--text3);margin-top:4px">${String(((_G=mostWinsPlayer.p)==null?void 0:_G.univ)||"\uBB34\uC18C\uC18D")}</div>
            </div>
            <span class="b2w2-note-chip" style="border-color:#fed7aa;color:#c2410c;background:#fff7ed">${mostWinsPlayer.wins}\uC2B9</span>
          </div>
          <div class="b2w2-highlight-list">
            <div class="b2w2-highlight-row"><span style="font-size:var(--fs-caption);color:var(--text3)">\uC804\uC801</span><strong style="font-size:var(--fs-sm);color:var(--text1)">${mostWinsPlayer.total}\uC804 ${mostWinsPlayer.wins}\uC2B9 ${mostWinsPlayer.losses}\uD328</strong></div>
          </div>
          ${mostWinsPlayers.length>1?`
          <div class="b2w2-highlight-list" style="margin-top:4px;padding-top:8px;border-top:1px dashed rgba(148,163,184,.25)">
            ${mostWinsPlayers.slice(1,3).map((s,idx)=>{var _a2,_b2,_c2;return`
              <div class="b2w2-highlight-row">
                <span style="font-size:var(--fs-sm);font-weight:800;color:var(--text1);cursor:pointer" onclick="openPlayerModal('${((_b2=(_a2=s.p)==null?void 0:_a2.name)==null?void 0:_b2.replace(/\\/g,"\\\\").replace(/'/g,"\\'"))||""}')">${idx+2}. ${((_c2=s.p)==null?void 0:_c2.name)||"-"}</span>
                <strong style="font-size:var(--fs-caption);color:#c2410c">${s.wins}\uC2B9</strong>
              </div>
            `}).join("")}
          </div>`:""}
        `:'<div class="b2w2-highlight-desc">\uC2B9\uB9AC \uAE30\uB85D\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.</div>'}
      </article>
      ${(()=>{const _profileMvp=mvp||monthlyTopPlayers[0]||null;return _profileMvp?_mkMvpCard(_profileMvp,1,!1,"b2w2-mvp-card-lead"):`<article class="b2w2-highlight-card" style="display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:6px;--hc-top:#f59e0b">
            <div class="b2w2-highlight-kicker" style="color:#b45309">\u{1F3C6} ${_mvpLabel}</div>
            <div class="b2w2-highlight-desc">\uC9D1\uACC4\uD560 \uAE30\uB85D\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.</div>
          </article>`})()}
    </section>`;const _renderMonthlyRankRows=list=>{if(!list.length)return'<div class="b2w2-highlight-desc">\uC6D4\uAC04 \uB300\uD559 \uC21C\uC704\uB97C \uACC4\uC0B0\uD560 \uAE30\uB85D\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.</div>';const _renderRow=ud=>{var _a2;const col=(typeof gc=="function"?gc(ud.u.name):"#64748b")||"#64748b",deltaClass=ud.rankDelta===null?"new":ud.rankDelta>0?"up":ud.rankDelta<0?"down":"same",deltaText=ud.rankDelta===null?"NEW":ud.rankDelta>0?`\u25B2${ud.rankDelta}`:ud.rankDelta<0?`\u25BC${Math.abs(ud.rankDelta)}`:"\uC720\uC9C0";return`
              <div class="b2w2-rank-row" style="cursor:pointer" onclick="if(typeof openUnivModal==='function')openUnivModal('${ud.u.name.replace(/\\/g,"\\\\").replace(/'/g,"\\'")}')">
                <div class="b2w2-rank-main">
                  <span class="b2w2-rank-badge" style="background:${col}18;color:${col}">${ud.rank}</span>
                  <div style="min-width:0">
                    <div class="b2w2-rank-name">${typeof window.escHTML=="function"?window.escHTML(ud.u.name):String(ud.u.name||"")}</div>
                    <div class="b2w2-rank-sub">
                      <span><span style="color:var(--win-col,#dc2626);font-weight:800">${ud.tw}\uC2B9</span> <span style="color:var(--lose-col,#2563eb);font-weight:800">${ud.tl}\uD328</span></span>
                      <span>\uC2B9\uB960 ${(_a2=ud.wr)!=null?_a2:0}%</span>
                      <span style="color:${col};font-weight:800">${ud.tg}\uC804</span>
                    </div>
                  </div>
                </div>
                <span class="b2w2-rank-delta ${deltaClass}">${deltaText}</span>
              </div>`},visible=list.slice(0,_monthlyPreviewCount),hidden=list.slice(_monthlyPreviewCount);return`${visible.map(_renderRow).join("")}${hidden.length?`
        <div id="${_monthlyRankMoreId}" class="b2w2-more-stack" style="display:none">${hidden.map(_renderRow).join("")}</div>
        <button type="button" id="${_monthlyRankBtnId}" class="b2w2-more-btn" onclick="(function(){const more=document.getElementById('${_monthlyRankMoreId}');const btn=document.getElementById('${_monthlyRankBtnId}');if(!more||!btn)return;const isOpen=more.style.display!=='none';more.style.display=isOpen?'none':'';btn.textContent=isOpen?'\uC21C\uC704 \uB354 \uBCF4\uAE30':'\uC21C\uC704 \uC811\uAE30';})()">\uC21C\uC704 \uB354 \uBCF4\uAE30</button>
      `:""}`},_renderMonthlyAceCards=list=>{if(!list.length)return'<div class="b2w2-highlight-desc">\uB300\uD559\uBCC4 \uC5D0\uC774\uC2A4\uB97C \uBF51\uC744 \uC218 \uC788\uB294 \uAE30\uB85D\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.</div>';const _renderCard=item=>{var _a2,_b2,_c2,_d2,_e2,_f2,_g2,_h2,_i2,_j2,_k2,_l2;const col=(typeof gc=="function"?gc(item.u.name):"#64748b")||"#64748b",ace=item.ace;if(!ace)return`
              <div class="b2w2-ace-empty">
                <div class="b2w2-ace-head" style="margin-bottom:0">
                  <div class="b2w2-ace-univ">
                    <span class="b2w2-ace-dot" style="background:${col}"></span>
                    <span class="b2w2-ace-univ-name">${typeof window.escHTML=="function"?window.escHTML(item.u.name):String(item.u.name||"")}</span>
                  </div>
                  <span class="b2w2-ace-rank">${item.rank}\uC704 \uB300\uD559</span>
                </div>
                <div class="b2w2-ace-empty-title">\uD655\uC2E4\uD55C \uC5D0\uC774\uC2A4 \uC5C6\uC74C</div>
                <div class="b2w2-ace-empty-sub">\uC774\uBC88 \uAE30\uAC04\uC740 \uAE30\uC900\uC744 \uB9CC\uC871\uD55C \uC2A4\uD2B8\uB9AC\uBA38\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4. \uCD5C\uC18C 3\uC804, \uC2B9\uB960 50% \uC774\uC0C1, \uC21C\uC2B9 \uC6B0\uC138 \uC870\uAC74\uC744 \uC801\uC6A9\uD588\uC2B5\uB2C8\uB2E4.</div>
              </div>`;const aceTone=((_a2=ace.winRate)!=null?_a2:0)>=70&&((_b2=ace.netWins)!=null?_b2:0)>=3?{bg:"var(--b2w-paper-alt)",badgeBg:"rgba(16,185,129,.14)",badgeCol:"var(--green)",badgeBorder:"rgba(16,185,129,.36)",label:"\uACE0\uC2B9\uB960"}:((_c2=ace.winRate)!=null?_c2:0)>=60?{bg:"var(--b2w-paper-alt)",badgeBg:"var(--b2w-tag-accent-bg)",badgeCol:"var(--b2w-accent)",badgeBorder:"var(--b2w-tag-accent-border)",label:"\uC5D0\uC774\uC2A4"}:{bg:"var(--b2w-paper)",badgeBg:"var(--b2w-paper-alt)",badgeCol:"var(--b2w-ink-mid)",badgeBorder:"var(--b2w-rule)",label:"\uADFC\uC18C \uC6B0\uC138"};return`
              <div class="b2w2-ace-card" style="background:${aceTone.bg};border-color:${col}22">
                <div class="b2w2-ace-head">
                  <div class="b2w2-ace-univ">
                    <span class="b2w2-ace-dot" style="background:${col}"></span>
                    <span class="b2w2-ace-univ-name">${typeof window.escHTML=="function"?window.escHTML(item.u.name):String(item.u.name||"")}</span>
                  </div>
                  <span class="b2w2-ace-rank">${item.rank}\uC704 \uB300\uD559</span>
                </div>
                <div class="b2w2-ace-player">
                  <div class="b2w2-ace-player-main">
                    <div class="b2w2-ace-photo" style="--_c:${col}">
                      ${(()=>{var _a3,_b3;const _ph=(_a3=ace.p)!=null&&_a3.photo?typeof toHttpsUrl=="function"?toHttpsUrl(ace.p.photo):ace.p.photo:"";return _ph?`<img src="${_ph}" alt="${((_b3=ace.p)==null?void 0:_b3.name)||""}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`:""})()}
                      <div class="b2w2-ace-photo-fallback" style="${(_d2=ace.p)!=null&&_d2.photo?"display:none":""}">${String(((_e2=ace.p)==null?void 0:_e2.name)||"-").trim().slice(0,1)}</div>
                    </div>
                    <div style="min-width:0">
                      <div class="b2w2-ace-player-name" onclick="openPlayerModal('${((_g2=(_f2=ace.p)==null?void 0:_f2.name)==null?void 0:_g2.replace(/\\/g,"\\\\").replace(/'/g,"\\'"))||""}')">${((_h2=ace.p)==null?void 0:_h2.name)||"-"}</div>
                      <div class="b2w2-ace-player-sub">
                        <span>${ace.wins}\uC2B9 ${ace.losses}\uD328</span>
                        <span style="color:${((_i2=ace.winRate)!=null?_i2:0)>=60?"var(--green)":((_j2=ace.winRate)!=null?_j2:0)>=50?"var(--b2w-accent)":"var(--gray)"}">\uC2B9\uB960 ${(_k2=ace.winRate)!=null?_k2:0}%</span>
                        <span>\uC21C\uC2B9 +${(_l2=ace.netWins)!=null?_l2:0}</span>
                        <span>${ace.total}\uC804</span>
                      </div>
                    </div>
                  </div>
                  <div style="display:flex;align-items:center;gap:3px;flex-shrink:0">${_b2WeeklyForm(ace.hist)}</div>
                </div>
                <div class="b2w2-ace-badges">
                  <span class="b2w2-ace-badge" style="background:${aceTone.badgeBg};color:${aceTone.badgeCol};border-color:${aceTone.badgeBorder}">${aceTone.label}</span>
                  ${(ace.netWins||0)>=3?'<span class="b2w2-ace-badge">\uC21C\uC2B9 \uAC15\uC138</span>':""}
                </div>
              </div>`},visible=list.slice(0,_monthlyPreviewCount),hidden=list.slice(_monthlyPreviewCount);return`${visible.map(_renderCard).join("")}${hidden.length?`
        <div id="${_monthlyAceMoreId}" class="b2w2-more-stack" style="display:none">${hidden.map(_renderCard).join("")}</div>
        <button type="button" id="${_monthlyAceBtnId}" class="b2w2-more-btn" onclick="(function(){const more=document.getElementById('${_monthlyAceMoreId}');const btn=document.getElementById('${_monthlyAceBtnId}');if(!more||!btn)return;const isOpen=more.style.display!=='none';more.style.display=isOpen?'none':'';btn.textContent=isOpen?'\uC5D0\uC774\uC2A4 \uB354 \uBCF4\uAE30':'\uC5D0\uC774\uC2A4 \uC811\uAE30';})()">\uC5D0\uC774\uC2A4 \uB354 \uBCF4\uAE30</button>
      `:""}`};_isMonthly&&selUniv==="\uC804\uCCB4"&&(h+=`<section class="b2w2-monthly-grid">
        <article class="b2w2-highlight-card">
          <div class="b2w2-highlight-kicker">University Ranking</div>
          <div class="b2w2-highlight-title">${preset==="thisMonth"?"\uC774\uBC88\uB2EC \uB300\uD559 \uC21C\uC704":"\uC9C0\uB09C\uB2EC \uB300\uD559 \uC21C\uC704"}</div>
          <div class="b2w2-highlight-desc">\uC2B9 \uC218\uB97C \uC6B0\uC120\uC73C\uB85C \uC815\uB82C\uD558\uACE0, \uB3D9\uB960\uC77C \uB54C \uC2B9\uB960\uACFC \uACBD\uAE30 \uC218\uB97C \uD568\uAED8 \uBC18\uC601\uD588\uC2B5\uB2C8\uB2E4.</div>
          <div class="b2w2-rank-list">
            ${_renderMonthlyRankRows(rankedUnivLeaders)}
          </div>
        </article>
        <article class="b2w2-highlight-card">
          <div class="b2w2-highlight-kicker">University Aces</div>
          <div class="b2w2-highlight-title">${preset==="thisMonth"?"\uB300\uD559\uBCC4 \uC5D0\uC774\uC2A4":"\uC9C0\uB09C\uB2EC \uB300\uD559\uBCC4 \uC5D0\uC774\uC2A4"}</div>
          <div class="b2w2-highlight-desc">\uCD5C\uC18C 3\uC804, \uC2B9\uB960 50% \uC774\uC0C1, \uC21C\uC2B9 \uC6B0\uC120 \uAE30\uC900\uC73C\uB85C \uBF51\uC558\uC2B5\uB2C8\uB2E4. \uC870\uAC74 \uBBF8\uB2EC \uB300\uD559\uC740 \uBCC4\uB3C4 \uC548\uB0B4\uB85C \uD45C\uC2DC\uD569\uB2C8\uB2E4.</div>
          <div class="b2w2-ace-list">
            ${_renderMonthlyAceCards(monthlyUnivAces)}
          </div>
        </article>
      </section>`),silentUnivs.length&&(h+=`<div class="b2w2-note-row">
        <span style="font-size:var(--fs-caption);font-weight:900;color:var(--text3)">\uAE30\uB85D \uC5C6\uB294 \uB300\uD559</span>
        ${silentUnivs.slice(0,8).map(name=>`<span class="b2w2-note-chip">${name}</span>`).join("")}
        ${silentUnivs.length>8?`<span style="font-size:var(--fs-caption);color:var(--text3);font-weight:800">\uC678 ${silentUnivs.length-8}\uACF3</span>`:""}
      </div>`),selUniv==="\uC804\uCCB4"&&curStats.some(ud=>ud.tg>0)&&(h+=`<div class="b2w2-chart-box">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap">
          <div class="b2w2-chart-title">\u{1F4CA} \uB300\uD559\uBCC4 \uC804\uC801 \uD604\uD669 (\uC774\uBC88 \uAE30\uAC04)</div>
          <div style="display:flex;gap:4px;background:var(--surface,#f1f5f9);padding:3px;border-radius:999px">
            <button type="button" onclick="_b2SetWeeklyChartSort('games')" style="font-size:10px;font-weight:800;padding:4px 10px;border-radius:999px;border:none;cursor:pointer;background:${_chartSort==="games"?"var(--b2w-paper,#fff)":"transparent"};color:${_chartSort==="games"?"var(--text1)":"var(--text3)"};box-shadow:${_chartSort==="games"?"0 1px 3px rgba(0,0,0,.12)":"none"}">\uC804\uC801\uC21C</button>
            <button type="button" onclick="_b2SetWeeklyChartSort('winrate')" style="font-size:10px;font-weight:800;padding:4px 10px;border-radius:999px;border:none;cursor:pointer;background:${_chartSort==="winrate"?"var(--b2w-paper,#fff)":"transparent"};color:${_chartSort==="winrate"?"var(--text1)":"var(--text3)"};box-shadow:${_chartSort==="winrate"?"0 1px 3px rgba(0,0,0,.12)":"none"}">\uC2B9\uB960\uC21C</button>
          </div>
        </div>
        ${_b2WeeklyBarChart(curStats)}
        <div style="display:flex;align-items:center;gap:12px;margin-top:8px;flex-wrap:wrap">
          <div style="display:flex;align-items:center;gap:4px"><div style="width:12px;height:8px;border-radius:2px;background:#dc2626;opacity:.9"></div><span style="font-size:10px;font-weight:700;color:var(--text2)">\uC2B9</span></div>
          <div style="display:flex;align-items:center;gap:4px"><div style="width:12px;height:8px;border-radius:2px;background:#94a3b8;opacity:.85"></div><span style="font-size:10px;font-weight:700;color:var(--text2)">\uD328</span></div>
          <span style="font-size:10px;color:var(--text3)">\uC6B0\uCE21: \uC2B9\uB960 / \uACBD\uAE30\uC218</span>
          <span style="font-size:10px;color:var(--text3)">\xB7 \uB9C9\uB300 \uAE38\uC774 = \uCD5C\uB2E4 \uC804\uC801 \uB300\uD559 \uB300\uBE44 \uC0C1\uB300 \uC804\uC801</span>
        </div>
      </div>`);const _metaRaceCount={P:{w:0,l:0},T:{w:0,l:0},Z:{w:0,l:0}};if(targetStats.forEach(ud=>{["P","T","Z"].forEach(r=>{_metaRaceCount[r].w+=ud.raceCount[r].w,_metaRaceCount[r].l+=ud.raceCount[r].l})}),["P","T","Z"].some(r=>_metaRaceCount[r].w+_metaRaceCount[r].l>0)){const _metaTop=["P","T","Z"].map(r=>{const{w,l}=_metaRaceCount[r],t=w+l;return{r,t,wr:t?Math.round(w/t*100):null}}).filter(x=>x.t>0).sort((a,b)=>{var _a2,_b2;return((_a2=b.wr)!=null?_a2:-1)-((_b2=a.wr)!=null?_b2:-1)})[0],_metaRaceLabel={P:"\uD504\uB85C\uD1A0\uC2A4",T:"\uD14C\uB780",Z:"\uC800\uADF8"};h+=`<div class="b2w2-chart-box">
        <div class="b2w2-chart-title">\u2694\uFE0F \uC885\uC871\uC804 \uBA54\uD0C0 (${selUniv==="\uC804\uCCB4"?"\uC804\uCCB4":selUniv} \xB7 ${_briefingInfo.short})</div>
        ${_b2WeeklyRaceStats(_metaRaceCount)}
        ${_metaTop?`<div style="margin-top:8px;font-size:var(--fs-caption);font-weight:700;color:var(--text3)">${_metaRaceLabel[_metaTop.r]} \uC9C4\uC601\uC774 \uC0C1\uB300 \uC885\uC871\uC804 \uC2B9\uB960 ${_metaTop.wr}%\uB85C \uAC00\uC7A5 \uAC15\uC138\uC785\uB2C8\uB2E4.</div>`:""}
      </div>`}return targetStats.filter(ud=>ud.tg>0).forEach((ud,ui)=>{var _a2,_b2,_c2,_d2,_e2;const{u,active,tw,tl,tg,wr,raceCount}=ud,color=(gc?gc(u.name):"#64748b")||"#64748b",prevUd=prevMap[u.name],prevWr=prevUd&&prevUd.tg>0?prevUd.wr:null,wrClass=wr===null?"":wr>=60?"#10b981":wr>=40?"#f59e0b":"#ef4444",cid=`b2w2-body-${ui}`,icid=`b2w2-ic-${ui}`,univMVP=_b2WeeklyUnivMVP(active),sorted=[...active].sort((a,b)=>{const ra=a.total?a.wins/a.total:0,rb=b.total?b.wins/b.total:0;return ra!==rb?rb-ra:b.total-a.total});h+=`<div class="b2w2-card" style="border-top:3px solid ${color}">
        <div class="b2w2-card-head" style="background:linear-gradient(135deg, ${color}17 0%, ${color}08 55%, transparent 100%)" onclick="(function(){
          const b=document.getElementById('${cid}');
          const ic=document.getElementById('${icid}');
          const sub=document.getElementById('b2w2-sub-${ui}');
          if(!b)return;
          const show=b.style.display==='none';
          b.style.display=show?'':'none';
          if(ic)ic.textContent=show?'\u25BC':'\u25B6';
          if(sub)sub.style.display=show?'none':'flex';
        })()">
          <div class="b2w2-card-title">
            <span class="b2w2-card-dot" style="background:${color}"></span>
            <div style="min-width:0">
              <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
                <div class="b2w2-card-name">${typeof window.escHTML=="function"?window.escHTML(u.name):String(u.name||"")}</div>
                <button type="button" onclick="event.stopPropagation();if(typeof openUnivModal==='function')openUnivModal('${u.name.replace(/\\/g,"\\\\").replace(/'/g,"\\'")}')" style="font-size:10px;font-weight:800;padding:3px 9px;border-radius:999px;border:1.5px solid ${color};background:var(--b2w-paper-alt);color:${color};cursor:pointer;white-space:nowrap;line-height:1.6;box-shadow:0 1px 3px rgba(0,0,0,.08)">\u{1F3EB} \uB300\uD559\uC0C1\uC138</button>
              </div>
              <div id="b2w2-sub-${ui}" class="b2w2-card-sub" style="display:none">
                <span>\uD65C\uB3D9 ${active.length}\uBA85</span>
                <span><span style="color:${color};font-weight:800">${tg}\uC804</span> <span style="color:var(--win-col,#dc2626);font-weight:800">${tw}\uC2B9</span> <span style="color:var(--lose-col,#2563eb);font-weight:800">${tl}\uD328</span></span>
                ${wr!==null?`<span style="font-weight:900;color:${wrClass}">\uC2B9\uB960 ${wr}%${_b2WeeklyDelta(wr,prevWr)}</span>`:""}
              </div>
            </div>
          </div>
          <span id="${icid}" class="b2w2-card-chevron">\u25BC</span>
        </div>
        <div id="${cid}" class="b2w2-card-body">
          <div class="b2w2-card-summary">
            <div class="b2w2-card-kpis">
              <div class="b2w2-card-kpi">
                <div class="b2w2-card-kpi-label">\uD65C\uB3D9 \uC778\uC6D0</div>
                <div class="b2w2-card-kpi-value">${active.length}\uBA85</div>
                <div class="b2w2-card-kpi-sub">\uC774\uBC88 \uAE30\uAC04 \uCD9C\uC804 \uC2A4\uD2B8\uB9AC\uBA38</div>
              </div>
              <div class="b2w2-card-kpi">
                <div class="b2w2-card-kpi-label">\uD300 \uC804\uC801</div>
                <div class="b2w2-card-kpi-value"><span style="color:var(--win-col,#dc2626)">${tw}\uC2B9</span> <span style="color:var(--lose-col,#2563eb)">${tl}\uD328</span></div>
                <div class="b2w2-card-kpi-sub">\uCD1D <span style="color:${color};font-weight:900">${tg}</span>\uC804 \uC18C\uD654</div>
              </div>
              <div class="b2w2-card-kpi">
                <div class="b2w2-card-kpi-label">\uD300 \uC2B9\uB960</div>
                <div class="b2w2-card-kpi-value" style="color:${wrClass}">${wr!==null?`${wr}%`:"-"}</div>
                <div class="b2w2-card-kpi-sub">${prevWr!==null&&wr!==null?`\uC804\uAE30 \uB300\uBE44 ${_b2WeeklyDelta(wr,prevWr)}`:"\uBE44\uAD50 \uB370\uC774\uD130 \uC5C6\uC74C"}</div>
              </div>
            </div>
            <div class="b2w2-card-spotlight" style="--spot-c:${color}">
              ${univMVP?`
                <div class="b2w2-card-spotlight-kicker">\uB300\uD559\uBCC4 \uC5D0\uC774\uC2A4</div>
                <div class="b2w2-card-spotlight-body" style="margin-top:8px">
                  <div class="b2w2-card-spotlight-photo" style="--_c:${color}">
                    ${(()=>{const _ph=univMVP.p.photo?typeof toHttpsUrl=="function"?toHttpsUrl(univMVP.p.photo):univMVP.p.photo:"",_altSafe=typeof escAttr=="function"?escAttr(univMVP.p.name||""):String(univMVP.p.name||"");return _ph?`<img src="${_ph}" alt="${_altSafe}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`:""})()}
                    <div class="b2w2-card-spotlight-photo-fallback" style="${univMVP.p.photo?"display:none":""}">${String(univMVP.p.name||"-").trim().slice(0,1)}</div>
                  </div>
                  <div style="min-width:0;flex:1">
                    <div class="b2w2-card-spotlight-title" style="margin-top:0">
                      <span onclick="openPlayerModal(this.dataset.n);event.stopPropagation()" data-n="${typeof escAttr=="function"?escAttr(univMVP.p.name||""):String(univMVP.p.name||"")}" style="cursor:pointer;border-bottom:1.5px solid ${color}55">${typeof window.escHTML=="function"?window.escHTML(univMVP.p.name||""):String(univMVP.p.name||"")}</span>
                      ${univMVP.p.tier?`<span title="${typeof escAttr=="function"?escAttr(_b2TierRankTooltip(univMVP.p.tier)):""}" style="font-size:10px;padding:2px 6px;border-radius:999px;background:${typeof getTierBtnColor=="function"?getTierBtnColor(univMVP.p.tier):"#64748b"};color:${typeof getTierBtnTextColor=="function"&&getTierBtnTextColor(univMVP.p.tier)||"#fff"};cursor:help">${univMVP.p.tier}</span>`:""}
                    </div>
                    <div class="b2w2-card-spotlight-sub">
                      <span style="color:var(--win-col,#dc2626);font-weight:800">${univMVP.wins}\uC2B9</span>
                      <span style="color:var(--lose-col,#2563eb);font-weight:800">${univMVP.losses}\uD328</span>
                      <span class="b2w2-card-spotlight-wr-badge" style="background:${((_a2=univMVP.winRate)!=null?_a2:0)>=70?"rgba(220,38,38,.12)":((_b2=univMVP.winRate)!=null?_b2:0)>=50?"rgba(245,158,11,.16)":"rgba(100,116,139,.14)"};color:${((_c2=univMVP.winRate)!=null?_c2:0)>=70?"#dc2626":((_d2=univMVP.winRate)!=null?_d2:0)>=50?"#b45309":"#64748b"}">${(_e2=univMVP.winRate)!=null?_e2:0}%</span>
                    </div>
                  </div>
                </div>
              `:`
                <div class="b2w2-card-spotlight-kicker">\uB300\uD559\uBCC4 \uC5D0\uC774\uC2A4</div>
                <div class="b2w2-card-spotlight-title" style="margin-top:6px">\uC774\uBC88 \uAE30\uAC04 \uD655\uC2E4\uD55C \uC5D0\uC774\uC2A4 \uC5C6\uC74C</div>
                <div class="b2w2-card-spotlight-sub">\uCD5C\uC18C \uACBD\uAE30 \uC218\uC640 \uC2B9\uB960 \uAE30\uC900\uC744 \uB3D9\uC2DC\uC5D0 \uB9CC\uC871\uD55C \uC2A4\uD2B8\uB9AC\uBA38\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.</div>
              `}
            </div>
          </div>`,h+=`<div class="b2w2-table-wrap"><table class="b2w2-tbl"><thead><tr>
        <th style="width:28px">#</th>
        <th>\uC2A4\uD2B8\uB9AC\uBA38</th>
        <th>\uC804\uCCB4 \uC804\uC801</th>
        <th>\uCD5C\uADFC \uD3FC</th>
      </tr></thead><tbody>`,sorted.forEach((s,i)=>{const{p,wins,losses,total,winRate,offWins,offLosses}=s,wrCls=winRate===null?"#94a3b8":winRate>=60?"#10b981":winRate>=40?"#f59e0b":"#ef4444",tc2=typeof getTierBtnColor=="function"&&p.tier?getTierBtnColor(p.tier):"#64748b",tt2=typeof getTierBtnTextColor=="function"&&p.tier&&getTierBtnTextColor(p.tier)||"#fff",medal=i===0?"\u{1F947}":i===1?"\u{1F948}":i===2?"\u{1F949}":`${i+1}`,isMVP=univMVP&&univMVP.p===p,prevS=prevPlayerMap[p.name]||null,prevWr2=prevS&&prevS.total>0?prevS.winRate:null,_zebraBg=i%2===1?"var(--surface,#f8fafc)":"transparent";h+=`<tr style="background:${isMVP?"#fef9c322":_zebraBg}">
          <td style="font-size:var(--fs-caption);font-weight:900;color:var(--text3);text-align:center">${medal}</td>
          <td>
            <span onclick="openPlayerModal(this.dataset.n);event.stopPropagation()" data-n="${typeof escAttr=="function"?escAttr(p.name||""):String(p.name||"")}" style="font-size:var(--fs-base);font-weight:900;color:var(--text1);cursor:pointer;border-bottom:1.5px solid var(--border2);padding-bottom:1px">${typeof window.escHTML=="function"?window.escHTML(p.name||""):String(p.name||"")}</span>
            ${p.tier?`<span title="${typeof escAttr=="function"?escAttr(_b2TierRankTooltip(p.tier)):""}" style="font-size:var(--fs-sm);padding:1px 5px;border-radius:4px;background:${tc2};color:${tt2};margin-left:3px;cursor:help">${p.tier}</span>`:""}
            ${isMVP?'<span style="font-size:var(--fs-caption);background:#fef9c3;color:#b45309;padding:1px 4px;border-radius:4px;margin-left:3px;font-weight:800">MVP</span>':""}
          </td>
          <td>
            <div style="display:flex;align-items:center;gap:5px;flex-wrap:wrap">
              <span style="font-size:var(--fs-sm);font-weight:900;color:var(--text1);background:var(--surface,#f8fafc);border:1px solid var(--border,#e2e8f0);padding:1px 8px;border-radius:999px">${total}\uC804</span>
              <span style="font-size:var(--fs-caption);font-weight:900;color:var(--win-col,#dc2626);background:color-mix(in srgb, var(--win-col,#dc2626) 14%, transparent);padding:1px 7px;border-radius:999px">${wins}\uC2B9</span>
              <span style="font-size:var(--fs-caption);font-weight:900;color:var(--lose-col,#2563eb);background:color-mix(in srgb, var(--lose-col,#2563eb) 14%, transparent);padding:1px 7px;border-radius:999px">${losses}\uD328</span>
            </div>
            ${winRate!==null?`<div style="margin-top:3px;font-size:var(--fs-caption);font-weight:700;color:${wrCls}">${winRate}%${_b2WeeklyDelta(winRate,prevWr2)}</div>`:""}
          </td>
          <td><div style="display:flex;align-items:center;gap:2px">${_b2WeeklyForm(s.hist)}</div></td>
        </tr>`}),h+="</tbody></table></div>",["P","T","Z"].some(r=>raceCount[r].w+raceCount[r].l>0)&&(h+=`<div class="b2w2-race-box">
          <div class="b2w2-race-title">\u2694\uFE0F \uC885\uC871\uBCC4 \uC0C1\uB300 \uC804\uC801 (\uB300\uD559 \uC804\uCCB4)</div>
          ${_b2WeeklyRaceStats(raceCount)}
        </div>`),h+="</div></div>"}),h+="</div>",h}catch(e){return console.error("[_b2WeeklyBriefingView v2] \uC624\uB958:",e),`<div style="padding:40px;text-align:center;color:#dc2626">\uBE0C\uB9AC\uD551 \uC624\uB958: ${e.message}</div>`}}
