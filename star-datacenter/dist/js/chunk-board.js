/* cloud-apply.js */
var A=Object.defineProperty;var _=Object.getOwnPropertySymbols;var b=Object.prototype.hasOwnProperty,w=Object.prototype.propertyIsEnumerable;var S=(n,s,e)=>s in n?A(n,s,{enumerable:!0,configurable:!0,writable:!0,value:e}):n[s]=e,g=(n,s)=>{for(var e in s||(s={}))b.call(s,e)&&S(n,e,s[e]);if(_)for(var e of _(s))w.call(s,e)&&S(n,e,s[e]);return n};var M=(n,s)=>{var e={};for(var t in n)b.call(n,t)&&s.indexOf(t)<0&&(e[t]=n[t]);if(n!=null&&_)for(var t of _(n))s.indexOf(t)<0&&w.call(n,t)&&(e[t]=n[t]);return e};function _syncWindowDataRefs(){try{typeof miniM!="undefined"&&(window.miniM=miniM)}catch(n){}try{typeof univM!="undefined"&&(window.univM=univM)}catch(n){}try{typeof ckM!="undefined"&&(window.ckM=ckM)}catch(n){}try{typeof proM!="undefined"&&(window.proM=proM)}catch(n){}try{typeof ttM!="undefined"&&(window.ttM=ttM)}catch(n){}try{typeof comps!="undefined"&&(window.comps=comps)}catch(n){}try{typeof indM!="undefined"&&(window.indM=indM)}catch(n){}try{typeof gjM!="undefined"&&(window.gjM=gjM)}catch(n){}try{typeof tourneys!="undefined"&&(window.tourneys=tourneys)}catch(n){}try{typeof proTourneys!="undefined"&&(window.proTourneys=proTourneys)}catch(n){}try{typeof players!="undefined"&&(window.players=players)}catch(n){}}try{window._syncWindowDataRefs=_syncWindowDataRefs}catch(n){}function _fbArr(n,s){return n?Array.isArray(n)?n:typeof n=="object"?Object.keys(n).sort((e,t)=>Number(e)-Number(t)).map(e=>n[e]).filter(e=>e!=null):s||[]:s||[]}function _decompressCloudData(n){if(n&&typeof n._lz=="string")try{const s=LZString.decompressFromBase64(n._lz);return JSON.parse(s)}catch(s){console.warn("[_decompressCloudData] \uC555\uCD95 \uD574\uC81C \uC2E4\uD328:",s)}return n}function _pcMergeById(n,s,e){const t=[],a=new Set,i=(f,r)=>{try{return String(e?e(f,r):f&&f._id||r)}catch(c){return String(r)}};return(Array.isArray(n)?n:[]).forEach((f,r)=>{t.push(f),a.add(i(f,r))}),(Array.isArray(s)?s:[]).forEach((f,r)=>{const c=i(f,r);a.has(c)||(t.push(f),a.add(c))}),t}function _mergeRecordLike(n,s){const e=g({},n||{}),t=s||{};return["a","b","wName","lName","d","map","memo","note","n","compName","teamALabel","teamBLabel","winner","stage","hostUniv","u","type","rndLabel"].forEach(i=>{(e[i]===void 0||e[i]===null||e[i]==="")&&t[i]!==void 0&&t[i]!==null&&t[i]!==""&&(e[i]=t[i])}),["sa","sb"].forEach(i=>{(e[i]===void 0||e[i]===null)&&t[i]!==void 0&&t[i]!==null&&(e[i]=t[i])}),(!Array.isArray(e.sets)||!e.sets.length)&&Array.isArray(t.sets)&&t.sets.length&&(e.sets=t.sets),(!Array.isArray(e.games)||!e.games.length)&&Array.isArray(t.games)&&t.games.length&&(e.games=t.games),(!Array.isArray(e.teamAMembers)||!e.teamAMembers.length)&&Array.isArray(t.teamAMembers)&&t.teamAMembers.length&&(e.teamAMembers=t.teamAMembers),(!Array.isArray(e.teamBMembers)||!e.teamBMembers.length)&&Array.isArray(t.teamBMembers)&&t.teamBMembers.length&&(e.teamBMembers=t.teamBMembers),(!Array.isArray(e.teamA)||!e.teamA.length)&&Array.isArray(t.teamA)&&t.teamA.length&&(e.teamA=t.teamA),(!Array.isArray(e.teamB)||!e.teamB.length)&&Array.isArray(t.teamB)&&t.teamB.length&&(e.teamB=t.teamB),(!e.univWins||!Object.keys(e.univWins||{}).length)&&t.univWins&&(e.univWins=t.univWins),(!e.univLosses||!Object.keys(e.univLosses||{}).length)&&t.univLosses&&(e.univLosses=t.univLosses),e}function _mergeRecordCollection(n,s,e){const t=(r,c)=>{try{return String(e?e(r,c):r&&(r._id||r.sid||`${r.d||""}|${r.a||r.wName||""}|${r.b||r.lName||""}|${r.map||""}`)||c)}catch(o){return String(c)}},a=new Map;(Array.isArray(s)?s:[]).forEach((r,c)=>a.set(t(r,c),r));const i=[],f=new Set;return(Array.isArray(n)?n:[]).forEach((r,c)=>{const o=t(r,c);i.push(_mergeRecordLike(r,a.get(o))),f.add(o)}),window._mergeRemoteIsNewer||(Array.isArray(s)?s:[]).forEach((r,c)=>{const o=t(r,c);f.has(o)||i.push(r)}),i}function _pcMergeStageRecordArrays(n,s){return _pcMergeById(n,s,(t,a)=>t&&(t._id||`${t.a||""}|${t.b||""}|${t.d||""}|${t.map||""}|${t.winner||""}`)||a)}const _pcMergeGroupMatches=_pcMergeStageRecordArrays;function _pcMergeBracket(n,s){const e=_fbArr(n,[]),t=_fbArr(s,[]),a=Math.max(e.length,t.length),i=[];for(let f=0;f<a;f++){const r=_fbArr(e[f],[]),c=_fbArr(t[f],[]),o=Math.max(r.length,c.length),p=[];for(let m=0;m<o;m++){const u=r[m],l=c[m];if(!u&&l){p.push(l);continue}if(u&&!l){p.push(u);continue}if(!u&&!l){p.push(null);continue}const d=g({},u||{});(!d.a||d.a==="TBD")&&l&&l.a&&(d.a=l.a),(!d.b||d.b==="TBD")&&l&&l.b&&(d.b=l.b),!d.winner&&l&&l.winner&&(d.winner=l.winner),!d.d&&l&&l.d&&(d.d=l.d),!d.map&&l&&l.map&&(d.map=l.map),(!Array.isArray(d._games)||!d._games.length)&&l&&Array.isArray(l._games)&&l._games.length&&(d._games=l._games),p.push(d)}i.push(p.filter(m=>m!=null))}return i}function _mergeGenericGroups(n,s){const e=_fbArr(n,[]),t=_fbArr(s,[]),a=e.map((i,f)=>{const r=t[f]||t.find(o=>o&&i&&o.name===i.name)||{},c=g({},i||{});return c.univs=_pcMergeById(_fbArr(c.univs,[]),_fbArr(r.univs,[]),(o,p)=>String(o||p)),c.players=_pcMergeById(_fbArr(c.players,[]),_fbArr(r.players,[]),(o,p)=>String(o||p)),c.matches=_mergeRecordCollection(_fbArr(c.matches,[]),_fbArr(r.matches,[])),c});return t.forEach((i,f)=>{a.some((c,o)=>o===f||c&&i&&c.name&&i.name&&c.name===i.name)||a.push(i)}),a}function _mergeBracketDetailObject(n,s){const e=n&&typeof n=="object"?n:{},t=s&&typeof s=="object"?s:{},a=g({},e);return Object.keys(t).forEach(i=>{a[i]?a[i]=_mergeRecordLike(a[i],t[i]):a[i]=t[i]}),a}function _mergeSingleTourney(n,s){const e=g({},n||{}),t=s||{};if(!e.name&&t.name&&(e.name=t.name),!e.type&&t.type&&(e.type=t.type),!e.createdAt&&t.createdAt&&(e.createdAt=t.createdAt),e.groups=_mergeGenericGroups(e.groups,t.groups),e.bracket||t.bracket){const a=e.bracket&&typeof e.bracket=="object"?g({},e.bracket):{},i=t.bracket&&typeof t.bracket=="object"?t.bracket:{};(!a.manualMatches||!a.manualMatches.length)&&Array.isArray(i.manualMatches)&&i.manualMatches.length?a.manualMatches=i.manualMatches:a.manualMatches=_mergeRecordCollection(_fbArr(a.manualMatches,[]),_fbArr(i.manualMatches,[])),a.matchDetails=_mergeBracketDetailObject(a.matchDetails,i.matchDetails),Object.keys(i).forEach(f=>{(a[f]===void 0||a[f]===null||a[f]==="")&&(a[f]=i[f])}),e.bracket=a}return e}function _mergeTourneysRemoteWithLocal(n,s){const e=_fbArr(n,[]),t=_fbArr(s,[]),a=e.map(i=>{const f=String(i&&i.id||""),r=t.find(c=>String(c&&c.id||"")===f);return r?_mergeSingleTourney(i,r):i});return window._mergeRemoteIsNewer||t.forEach(i=>{const f=String(i&&i.id||"");a.some(r=>String(r&&r.id||"")===f)||a.push(i)}),a}function _mergeSingleProTourney(n,s){const e=g({},n||{}),t=s||{};!e.name&&t.name&&(e.name=t.name),!e.createdAt&&t.createdAt&&(e.createdAt=t.createdAt);const a=_fbArr(e.groups,[]),i=_fbArr(t.groups,[]);e.groups=a.map((o,p)=>{const m=i[p]||i.find(l=>l&&o&&l.name===o.name)||{},u=g({},o||{});return u.players=_pcMergeById(_fbArr(o&&o.players,[]),_fbArr(m.players,[]),(l,d)=>String(l||d)),u.univs=_pcMergeById(_fbArr(o&&o.univs,[]),_fbArr(m.univs,[]),(l,d)=>String(l||d)),u.matches=_pcMergeGroupMatches(_fbArr(o&&o.matches,[]),_fbArr(m.matches,[])),u}),i.forEach((o,p)=>{e.groups.some((u,l)=>l===p||u&&o&&u.name&&o.name&&u.name===o.name)||e.groups.push(o)});const f=e.stageRecords&&typeof e.stageRecords=="object"?e.stageRecords:{},r=t.stageRecords&&typeof t.stageRecords=="object"?t.stageRecords:{},c=new Set([...Object.keys(f),...Object.keys(r)]);if(e.stageRecords={},c.forEach(o=>{e.stageRecords[o]=_pcMergeStageRecordArrays(_fbArr(f[o],[]),_fbArr(r[o],[]))}),e.bracket=_pcMergeBracket(e.bracket,t.bracket),!e.thirdPlace&&t.thirdPlace)e.thirdPlace=t.thirdPlace;else if(e.thirdPlace&&t.thirdPlace){const o=g({},e.thirdPlace);(!o.a||o.a==="TBD")&&t.thirdPlace.a&&(o.a=t.thirdPlace.a),(!o.b||o.b==="TBD")&&t.thirdPlace.b&&(o.b=t.thirdPlace.b),!o.winner&&t.thirdPlace.winner&&(o.winner=t.thirdPlace.winner),!o.d&&t.thirdPlace.d&&(o.d=t.thirdPlace.d),!o.map&&t.thirdPlace.map&&(o.map=t.thirdPlace.map),(!Array.isArray(o._games)||!o._games.length)&&Array.isArray(t.thirdPlace._games)&&t.thirdPlace._games.length&&(o._games=t.thirdPlace._games),e.thirdPlace=o}return e.teamMatches=_pcMergeById(_fbArr(e.teamMatches,[]),_fbArr(t.teamMatches,[]),(o,p)=>o&&o._id||p),e}function _mergeProTourneysRemoteWithLocal(n,s){const e=_fbArr(n,[]),t=_fbArr(s,[]),a=e.map(i=>{const f=String(i&&i.id||""),r=t.find(c=>String(c&&c.id||"")===f);return r?_mergeSingleProTourney(i,r):i});return window._mergeRemoteIsNewer||t.forEach(i=>{const f=String(i&&i.id||"");a.some(r=>String(r&&r.id||"")===f)||a.push(i)}),a}function _applyCloudData(n){n=_decompressCloudData(n);try{window._applyingCloudData=!0}catch(e){}const s=e=>n[e]!==void 0&&n[e]!==null;try{const e=Number(n&&n.savedAt||0)||0,t=Math.max(Number(window._lastAdminSaveTime||0)||0,Number(localStorage.getItem("su_last_admin_save")||0)||0);window._mergeRemoteIsNewer=e>0&&e>t+1e3}catch(e){window._mergeRemoteIsNewer=!1}{const e=n.players||n.player;if(e!==void 0){players=_fbArr(e,[]),players.forEach(t=>{t.history&&(t.history=_fbArr(t.history,[]))});try{const t=n.playerPhotos||n.pPhotoMap||n.playerPhotoMap||null;t&&players.forEach(a=>{a&&a.name&&!a.photo&&t[a.name]&&(a.photo=t[a.name])})}catch(t){}}}(s("univCfg")||s("univConfig")||s("universities"))&&(univCfg=_fbArr(n.univCfg||n.univConfig||n.universities,univCfg)),s("maps")&&(maps=_fbArr(n.maps||n.map,maps)),s("tourD")&&(tourD=_fbArr(n.tourD||n.tournamentDates,Array(15).fill("")));{const e=n.miniM||n.mini||n.miniMatches,t=e?_fbArr(e,[]):s("miniM")?[]:null;t!==null&&(miniM=_mergeRecordCollection(t,_fbArr(typeof miniM!="undefined"?miniM:[],[])),miniM.forEach(a=>{a.sets&&(a.sets=_fbArr(a.sets,[])),a.sets&&a.sets.forEach(i=>{i.games&&(i.games=_fbArr(i.games,[]))})}))}{const e=n.univM||n.univ||n.univMatches,t=e?_fbArr(e,[]):s("univM")?[]:null;t!==null&&(univM=_mergeRecordCollection(t,_fbArr(typeof univM!="undefined"?univM:[],[])),univM.forEach(a=>{a.sets&&(a.sets=_fbArr(a.sets,[])),a.sets&&a.sets.forEach(i=>{i.games&&(i.games=_fbArr(i.games,[]))})}))}{const e=n.comps||n.comp||n.competitions,t=e?_fbArr(e,[]):s("comps")?[]:null;t!==null&&(comps=_mergeRecordCollection(t,_fbArr(typeof comps!="undefined"?comps:[],[])))}{const e=n.ckM||n.ck||n.ckMatches,t=e?_fbArr(e,[]):s("ckM")?[]:null;t!==null&&(ckM=_mergeRecordCollection(t,_fbArr(typeof ckM!="undefined"?ckM:[],[])),ckM.forEach(a=>{a.sets&&(a.sets=_fbArr(a.sets,[])),a.teamAMembers&&(a.teamAMembers=_fbArr(a.teamAMembers,[])),a.teamBMembers&&(a.teamBMembers=_fbArr(a.teamBMembers,[])),a.sets&&a.sets.forEach(i=>{i.games&&(i.games=_fbArr(i.games,[]))})}))}s("compNames")&&(compNames=_fbArr(n.compNames||n.competitionNames,[])),(s("curComp")||n.savedAt)&&(curComp=n.curComp||n.currentComp||"");{const e=n.proM||n.pro||n.proMatches,t=e?_fbArr(e,[]):s("proM")?[]:null;t!==null&&(proM=_mergeRecordCollection(t,_fbArr(typeof proM!="undefined"?proM:[],[])),proM.forEach(a=>{a.sets&&(a.sets=_fbArr(a.sets,[])),a.teamAMembers&&(a.teamAMembers=_fbArr(a.teamAMembers,[])),a.teamBMembers&&(a.teamBMembers=_fbArr(a.teamBMembers,[])),a.sets&&a.sets.forEach(i=>{i.games&&(i.games=_fbArr(i.games,[]))})}))}{const e=n.proTourneys,t=e?_fbArr(e,[]):s("proTourneys")?[]:null;if(t!==null){const a=_fbArr(typeof proTourneys!="undefined"?proTourneys:[],[]);proTourneys=_mergeProTourneysRemoteWithLocal(t,a)}}{const e=n.tourneys||n.tournaments||n.tourney,t=e?_fbArr(e,[]):s("tourneys")?[]:null;t!==null&&(tourneys=_mergeTourneysRemoteWithLocal(t,_fbArr(typeof tourneys!="undefined"?tourneys:[],[])),tourneys.forEach(a=>{a.groups=_fbArr(a.groups,[]),a.groups.forEach(i=>{i.univs=_fbArr(i.univs,[]),i.matches=_fbArr(i.matches,[]),i.matches.forEach(f=>{f.sets=_fbArr(f.sets,[])})})}))}{const e=n.ttM||n.tiertour||n.tierTourM,t=e?_fbArr(e,[]):s("ttM")?[]:null;if(t!==null){ttM=_mergeRecordCollection(t,_fbArr(typeof ttM!="undefined"?ttM:[],[]));try{(ttM||[]).forEach(a=>{a.sets&&(a.sets=_fbArr(a.sets,[])),(a.sets||[]).forEach(i=>{i.games&&(i.games=_fbArr(i.games,[]))})})}catch(a){}try{typeof _ttMigrated!="undefined"&&(_ttMigrated=!1)}catch(a){}}}{const e=n.indM||n.ind,t=e?_fbArr(e,[]):s("indM")?[]:null;t!==null&&(indM=_mergeRecordCollection(t,_fbArr(typeof indM!="undefined"?indM:[],[])))}{const e=n.gjM,t=e?_fbArr(e,[]):s("gjM")?[]:null;t!==null&&(gjM=_mergeRecordCollection(t,_fbArr(typeof gjM!="undefined"?gjM:[],[])))}if(n.tiers&&n.tiers.length&&typeof TIERS!="undefined"&&TIERS.splice(0,TIERS.length,...n.tiers),n.boardPlayerOrder!==void 0&&typeof boardPlayerOrder!="undefined"&&(Object.keys(boardPlayerOrder).forEach(e=>delete boardPlayerOrder[e]),Object.assign(boardPlayerOrder,n.boardPlayerOrder||{}),typeof saveBoardPlayerOrder=="function"&&saveBoardPlayerOrder()),n.boardOrder!==void 0&&typeof boardOrder!="undefined"&&(boardOrder=n.boardOrder),n.userMapAlias!==void 0&&typeof userMapAlias!="undefined"&&(userMapAlias=n.userMapAlias),n.playerStatusIcons!==void 0&&typeof playerStatusIcons!="undefined"){Object.keys(playerStatusIcons).forEach(e=>delete playerStatusIcons[e]),Object.assign(playerStatusIcons,n.playerStatusIcons||{});try{typeof _iconPersistState=="function"&&_iconPersistState()}catch(e){}}if(n.notices!==void 0&&typeof notices!="undefined"&&(notices=n.notices),n.seasons!==void 0&&typeof seasons!="undefined"&&(seasons=_fbArr(n.seasons,[])),n.calScheduled!==void 0&&typeof calScheduled!="undefined"&&(calScheduled=_fbArr(n.calScheduled,[]),window._calScheduled=calScheduled),n.voteAgg!==void 0&&typeof voteData!="undefined"){const e={};Object.entries(voteData||{}).forEach(([t,a])=>{t.endsWith("_my")&&(e[t]=a)}),Object.keys(voteData).forEach(t=>delete voteData[t]),Object.assign(voteData,n.voteAgg||{},e),localStorage.setItem("su_votes",JSON.stringify(voteData))}if(n.curProComp!==void 0&&typeof curProComp!="undefined"&&(curProComp=n.curProComp),n._ttCurComp!==void 0&&typeof _ttCurComp!="undefined"&&(_ttCurComp=n._ttCurComp),n.appSettings!==void 0){const e=n.appSettings;e.fabTabs&&localStorage.setItem("su_fabTabs",JSON.stringify(e.fabTabs)),e.globalImgSettings&&localStorage.setItem("su_b2_global_img_settings",JSON.stringify(e.globalImgSettings)),e.imgSettings&&localStorage.setItem("su_img_settings",JSON.stringify(e.imgSettings)),e.fabHideMobile!==void 0&&localStorage.setItem("su_fabHideMobile",e.fabHideMobile?"1":"0"),e.fabHidePC!==void 0&&localStorage.setItem("su_fabHidePC",e.fabHidePC?"1":"0"),e.darkMode!==void 0&&localStorage.setItem("su_dark",e.darkMode?"1":"0"),e.b2LabelAlpha!==void 0&&localStorage.setItem("su_b2la",e.b2LabelAlpha),e.b2BgAlpha!==void 0&&localStorage.setItem("su_b2ba",e.b2BgAlpha);try{const a=e.ls||e.localStorage||null;if(a&&typeof a=="object"){let i=0,f=0;try{i=Number(localStorage.getItem("su_hist_ext_last_modified")||0)||0}catch(c){}try{f=Number(a.su_hist_ext_last_modified||0)||0}catch(c){}const r=new Set(["su_hist_ext_data_v1","su_hist_ext_proxy_presets_v1","su_hist_ext_proxy_preset_sel_v1","su_hist_ext_last_modified"]);Object.entries(a).forEach(([c,o])=>{if(!(!c||typeof c!="string")&&c.startsWith("su_")&&!c.startsWith("su_pp")&&!(c==="su_fb_pw"||c==="su_gh_token"||c==="su_admin_hash"||c==="su_admin_hashes")&&!(c==="su_last_admin_save"||c==="su_last_save_time")&&!(r.has(c)&&i&&i>f))try{localStorage.setItem(c,String(o))}catch(p){}})}}catch(a){}typeof updateFabVisibility=="function"&&updateFabVisibility(),typeof updateFabButtonOnclick=="function"&&updateFabButtonOnclick();try{typeof applyProfileShapeVars=="function"&&applyProfileShapeVars()}catch(a){}e.darkMode!==void 0&&(document.body.classList.toggle("dark",e.darkMode),window._fixHdrBtns&&window._fixHdrBtns()),e.b2LabelAlpha!==void 0&&(b2LabelAlpha=parseInt(e.b2LabelAlpha)),e.b2BgAlpha!==void 0&&(b2BgAlpha=parseInt(e.b2BgAlpha));const t=document.getElementById("b2-content");t&&typeof _b2UnivView=="function"&&(t.innerHTML=_b2UnivView(),typeof injectUnivIcons=="function"&&injectUnivIcons(t));try{e.bgmEnabled!==void 0&&localStorage.setItem("su_bgm_enabled",e.bgmEnabled?"1":"0"),e.bgmShuffle!==void 0&&localStorage.setItem("su_bgm_shuffle",e.bgmShuffle?"1":"0"),e.bgmVolume!==void 0&&localStorage.setItem("su_bgm_volume",String(e.bgmVolume)),e.bgmList!==void 0&&localStorage.setItem("su_bgm_list",String(e.bgmList||"")),e.soopList!==void 0&&localStorage.setItem("su_soop_list",String(e.soopList||"")),typeof window.bgmApplySettings=="function"&&window.bgmApplySettings(),typeof window.soopApplySettings=="function"&&window.soopApplySettings()}catch(a){}try{e.histExtData!==void 0&&localStorage.setItem("su_hist_ext_data_v1",String(e.histExtData||"")),e.histExtProxyPresets!==void 0&&localStorage.setItem("su_hist_ext_proxy_presets_v1",String(e.histExtProxyPresets||"")),e.histExtProxyPresetSel!==void 0&&localStorage.setItem("su_hist_ext_proxy_preset_sel_v1",String(e.histExtProxyPresetSel||""))}catch(a){}try{e.designV2On!==void 0&&localStorage.setItem("su_design_v2",e.designV2On?"1":"0"),e.designV2Preset!==void 0&&localStorage.setItem("su_design_v2_preset",String(e.designV2Preset||"base")),e.designV2Bright!==void 0&&localStorage.setItem("su_design_v2_bright",String(e.designV2Bright||"0")),e.designV2Dark!==void 0&&localStorage.setItem("su_design_v2_dark",String(e.designV2Dark||"0")),e.designV2Colors!==void 0&&localStorage.setItem("su_design_v2_colors",String(e.designV2Colors||"{}")),e.designV2Effects!==void 0&&localStorage.setItem("su_design_v2_effects",String(e.designV2Effects||"{}")),e.appFontPreset!==void 0&&localStorage.setItem("su_app_font_preset",String(e.appFontPreset||"noto")),e.appFontCss!==void 0&&localStorage.setItem("su_app_font_css",String(e.appFontCss||"")),e.appFontFamily!==void 0&&localStorage.setItem("su_app_font_family",String(e.appFontFamily||"")),e.appFontCssText!==void 0&&localStorage.setItem("su_app_font_css_text",String(e.appFontCssText||"")),e.appFontAliasMap!==void 0&&localStorage.setItem("su_app_font_alias_map",String(e.appFontAliasMap||"{}")),e.appFontScalePct!==void 0&&localStorage.setItem("su_app_font_scale_pct",String(e.appFontScalePct||"100")),e.appFontScalePcPct!==void 0&&localStorage.setItem("su_app_font_scale_pc_pct",String(e.appFontScalePcPct||"100")),e.appFontScaleTbPct!==void 0&&localStorage.setItem("su_app_font_scale_tb_pct",String(e.appFontScaleTbPct||"100")),e.appFontScaleMbPct!==void 0&&localStorage.setItem("su_app_font_scale_mb_pct",String(e.appFontScaleMbPct||"100")),e.uiScalePct!==void 0&&localStorage.setItem("su_ui_scale_pct",String(e.uiScalePct||"100")),e.uiScalePcPct!==void 0&&localStorage.setItem("su_ui_scale_pc_pct",String(e.uiScalePcPct||"100")),e.uiScaleTbPct!==void 0&&localStorage.setItem("su_ui_scale_tb_pct",String(e.uiScaleTbPct||"100")),e.uiScaleMbPct!==void 0&&localStorage.setItem("su_ui_scale_mb_pct",String(e.uiScaleMbPct||"100")),typeof window._applyAppFont=="function"&&window._applyAppFont(),typeof window._applyAppFontScale=="function"&&window._applyAppFontScale(),typeof window.applyDesignV2=="function"&&window.applyDesignV2(),typeof window._applyUiScale=="function"&&window._applyUiScale()}catch(a){}try{e.femcoSettings!=null&&localStorage.setItem("b2_femco_settings_v1",String(e.femcoSettings)),e.femcoUniv!=null&&localStorage.setItem("cfg_femco_univ",String(e.femcoUniv))}catch(a){}}try{window._applyingCloudData=!1}catch(e){}try{window._mergeRemoteIsNewer=!1}catch(e){}}window.onFirebaseLoad=function(n){const m=n,{admin_pw:s}=m,e=M(m,["admin_pw"]);try{window._lastFbDataSize=JSON.stringify(n).length,window._lastFbLoadTime=Date.now()}catch(u){}const t=u=>{try{return Number(u&&u.savedAt||0)||0}catch(l){return 0}},a=()=>{try{const u=Number(window._lastAdminSaveTime||0)||0,l=Number(localStorage.getItem("su_last_admin_save")||0)||0;return Math.max(u,l)}catch(u){return Number(window._lastAdminSaveTime||0)||0}},i=u=>{try{u&&localStorage.setItem("su_sync_last_remote_saved_at",String(u)),localStorage.setItem("su_sync_last_received_at",String(Date.now()))}catch(l){}};try{const u=t(e),l=a(),d=Number(window._lastAppliedSavedAt||0)||0;if(!window._forcingSync&&window._isSaving){const y=t(window._fbPendingData);(!window._fbPendingData||u>=y)&&(window._fbPendingData=e);const h=document.getElementById("fbLastSync");h&&(h.textContent="\u23F3 \uC800\uC7A5 \uC911 \uC218\uC2E0 \uB300\uAE30");return}if(!window._forcingSync&&u&&d&&u<=d){i(u);const y=document.getElementById("fbLastSync");y&&(y.textContent="\u{1F504} "+new Date().toLocaleTimeString("ko-KR"));return}if(!window._forcingSync&&u&&l&&u<l){console.warn("[sync] stale remote ignored",{remoteSavedAt:u,localSavedAt:l});try{typeof window.refreshCloudSyncStatus=="function"&&window.refreshCloudSyncStatus("\u23ED\uFE0F \uC624\uB798\uB41C \uC6D0\uACA9 \uB370\uC774\uD130 \uBB34\uC2DC","#d97706")}catch(y){}i(u);return}u&&(window._lastAppliedSavedAt=Math.max(d,u)),i(u)}catch(u){}_applyCloudData(e);try{typeof window._syncWindowDataRefs=="function"&&window._syncWindowDataRefs()}catch(u){}typeof localSave=="function"&&localSave();try{typeof window._primeMatchSyncSignature=="function"&&window._primeMatchSyncSignature(!0)}catch(u){}typeof fixPoints=="function"&&fixPoints(),window._compListCache={},window._shareAllMatchesCached=null,window._histTourneyCache={},typeof render=="function"&&render();const f=document.getElementById("playerModal"),r=typeof getPlayerDetailState=="function"?getPlayerDetailState():window.PlayerDetailState||{};f&&f.style.display!=="none"&&r.currentName&&typeof openPlayerModal=="function"&&openPlayerModal(r.currentName);const c=document.getElementById("univModal"),o=typeof getUnivDetailState=="function"?getUnivDetailState():window.UnivDetailState||{};c&&c.style.display!=="none"&&o.currentName&&typeof openUnivModal=="function"&&openUnivModal(o.currentName);const p=document.getElementById("fbLastSync");p&&(p.textContent="\u{1F504} "+new Date().toLocaleTimeString("ko-KR"))};try{window._fbArr=_fbArr}catch(n){}try{window._decompressCloudData=_decompressCloudData}catch(n){}try{window._applyCloudData=_applyCloudData}catch(n){}

/* cloud-status.js */
function gsSetStatus(t,i="var(--gray-l)"){const s=document.getElementById("cloudStatus");s&&(s.textContent=t,s.style.color=i)}try{window.gsSetStatus=gsSetStatus}catch(t){}function _fmtSyncTs(t){const i=Number(t||0)||0;if(!i)return"\uAE30\uB85D \uC5C6\uC74C";try{return new Date(i).toLocaleString("ko-KR")}catch(s){return"\uAE30\uB85D \uC5C6\uC74C"}}function _getSyncFreshnessMeta(){const t=Math.max(Number(window._lastAdminSaveTime||0)||0,Number(localStorage.getItem("su_last_admin_save")||0)||0,Number(localStorage.getItem("su_last_save_time")||0)||0),i=Number(localStorage.getItem("su_sync_last_remote_saved_at")||0)||0,s=t-i,l=1500;let o="unknown",a="\uBE44\uAD50 \uC815\uBCF4 \uBD80\uC871",e="var(--gray-l)";return t&&i?Math.abs(s)<=l?(o="same",a="\uB85C\uCEEC/\uC6D0\uACA9 \uAC70\uC758 \uB3D9\uC77C",e="#16a34a"):s>0?(o="local_newer",a="\uB85C\uCEEC\uC774 \uB354 \uCD5C\uC2E0",e="#d97706"):(o="remote_newer",a="\uC6D0\uACA9\uC774 \uB354 \uCD5C\uC2E0",e="#2563eb"):t?(o="local_only",a="\uB85C\uCEEC \uC800\uC7A5 \uAE30\uB85D\uB9CC \uC788\uC74C",e="#d97706"):i&&(o="remote_only",a="\uC6D0\uACA9 \uC800\uC7A5 \uAE30\uB85D\uB9CC \uC788\uC74C",e="#2563eb"),{localLatest:t,remoteLatest:i,diff:s,state:o,label:a,color:e}}function _canViewSyncDebugInfo(){try{return!!(typeof isLoggedIn!="undefined"&&isLoggedIn)&&!(typeof isSubAdmin!="undefined"&&isSubAdmin)}catch(t){return!1}}function refreshCloudSyncStatus(t,i){const s=document.getElementById("cloudStatus"),l=document.getElementById("cfg-fb-sync-result"),o=_canViewSyncDebugInfo(),a=Number(localStorage.getItem("su_sync_last_upload_ok_at")||0)||0,e=Number(localStorage.getItem("su_sync_last_received_at")||0)||0,d=Number(localStorage.getItem("su_sync_last_remote_saved_at")||0)||0,r=_getSyncFreshnessMeta(),c=Number(localStorage.getItem("su_sync_last_firebase_signal_at")||0)||0,b=Number(localStorage.getItem("su_sync_last_firebase_signal_push_at")||0)||0,g=(()=>{try{return JSON.parse(localStorage.getItem("su_sync_missing_months")||"[]")||[]}catch(v){return[]}})(),n=String(localStorage.getItem("su_sync_last_fail_msg")||"").trim(),f=o?`\uC800\uC7A5 ${_fmtSyncTs(a)} / \uC218\uC2E0 ${_fmtSyncTs(e)}${d?` / \uC6D0\uACA9\uC800\uC7A5 ${_fmtSyncTs(d)}`:""}${c?` / \uC2E0\uD638 ${_fmtSyncTs(c)}`:""}${r.state!=="unknown"?` / ${r.label}`:""}`:n?"\uB3D9\uAE30\uD654 \uBB38\uC81C \uC788\uC74C":t||"\uB3D9\uAE30\uD654 \uB300\uAE30";if(s&&(s.style.color=i||(n?"#dc2626":"var(--gray-l)"),s.textContent=o&&t?`${t} \xB7 ${f}`:f),l){if(!o){l.innerHTML=`
        <div style="display:grid;gap:6px">
          <div><b>\uCD5C\uADFC \uC0C1\uD0DC:</b> ${t||(n?"\uB3D9\uAE30\uD654 \uBB38\uC81C \uC788\uC74C":"\uB300\uAE30 \uC911")}</div>
          ${n?`<div style="color:#dc2626"><b>\uCD5C\uADFC \uC2E4\uD328:</b> ${n}</div>`:""}
        </div>`;return}l.innerHTML=`
      <div style="display:grid;gap:6px">
        <div><b>\uB85C\uCEEC \uCD5C\uC2E0 \uC800\uC7A5:</b> ${_fmtSyncTs(r.localLatest)}</div>
        <div><b>\uCD5C\uADFC \uC5C5\uB85C\uB4DC:</b> ${_fmtSyncTs(a)}</div>
        <div><b>\uCD5C\uADFC \uC218\uC2E0:</b> ${_fmtSyncTs(e)}</div>
        <div><b>\uC6D0\uACA9 savedAt:</b> ${_fmtSyncTs(d)}</div>
        <div><b>\uCD5C\uC2E0 \uBE44\uAD50:</b> <span style="color:${r.color};font-weight:700">${r.label}</span></div>
        <div><b>\uBCF4\uC870 \uC2E0\uD638 \uC218\uC2E0:</b> ${_fmtSyncTs(c)}</div>
        <div><b>\uBCF4\uC870 \uC2E0\uD638 \uBC1C\uD589:</b> ${_fmtSyncTs(b)}</div>
        <div><b>\uB204\uB77D \uC6D4 \uD30C\uC77C:</b> ${g.length?g.join(", "):"\uC5C6\uC74C"}</div>
        <div><b>\uCD5C\uADFC \uC0C1\uD0DC:</b> ${t||(n?"\uC5C5\uB85C\uB4DC \uC2E4\uD328 \uAE30\uB85D \uC788\uC74C":"\uB300\uAE30 \uC911")}</div>
        ${n?`<div style="color:#dc2626"><b>\uCD5C\uADFC \uC2E4\uD328:</b> ${n}</div>`:""}
      </div>`}}async function checkFbSyncStatus(){const t=document.getElementById("cfg-fb-sync-result");if(!t)return;t.innerHTML='<span style="color:var(--blue)">\u{1F504} \uD655\uC778 \uC911...</span>';const i=_canViewSyncDebugInfo(),s=typeof window.fbSet=="function",l=!!localStorage.getItem("su_gh_token"),o=localStorage.getItem("su_last_save_time"),a=Number(localStorage.getItem("su_sync_last_firebase_signal_at")||0)||0,e=_getSyncFreshnessMeta(),d=(()=>{try{return JSON.parse(localStorage.getItem("su_sync_missing_months")||"[]")||[]}catch(n){return[]}})(),r=(()=>{let n=0;for(let f in localStorage)f.startsWith("su_")&&(n+=(localStorage.getItem(f)||"").length*2);return n})(),c=n=>n>=1024*1024?(n/1024/1024).toFixed(2)+"MB":n>=1024?(n/1024).toFixed(1)+"KB":n+"B",b=window._lastFbDataSize||null;let g=`
    <div style="display:grid;gap:8px">
      <div style="display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:8px;background:${s?"#f0fdf4":"#fef2f2"};border:1px solid ${s?"#bbf7d0":"#fecaca"}">
        <span style="font-size:16px">${s?"\u2705":"\u274C"}</span>
        <div>
          <div style="font-weight:700;font-size:12px">GitHub \uB3D9\uAE30\uD654 \uBAA8\uB4C8</div>
          <div style="font-size:11px;color:var(--gray-l)">${s?"\uC815\uC0C1 \uC5F0\uACB0\uB428":"GitHub \uB3D9\uAE30\uD654 \uBAA8\uB4C8 \uBBF8\uB85C\uB4DC"}</div>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:8px;background:${l?"#f0fdf4":"#fffbeb"};border:1px solid ${l?"#bbf7d0":"#fde68a"}">
        <span style="font-size:16px">${l?"\u{1F511}":"\u26A0\uFE0F"}</span>
        <div>
          <div style="font-weight:700;font-size:12px">GitHub \uD1A0\uD070</div>
          <div style="font-size:11px;color:var(--gray-l)">${l?"\uC124\uC815\uB428 \u2014 \uC218\uB3D9 \uBC84\uD2BC\uC73C\uB85C GitHub data.json \uC5C5\uB85C\uB4DC \uAC00\uB2A5":"\uBBF8\uC124\uC815 \u2014 GitHub \uC5C5\uB85C\uB4DC \uBD88\uAC00, \uB85C\uCEEC\uB9CC \uC800\uC7A5"}</div>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:8px;background:${a?"#eff6ff":"#f8fafc"};border:1px solid ${a?"#bfdbfe":"var(--border)"}">
        <span style="font-size:16px">\u{1F4E1}</span>
        <div>
          <div style="font-weight:700;font-size:12px">\uBCF4\uC870 \uC2E0\uD638 \uCC44\uB110</div>
          <div style="font-size:11px;color:var(--gray-l)">${i?a?`\uCD5C\uADFC \uC2E0\uD638 ${new Date(a).toLocaleString("ko-KR")}`:"\uC544\uC9C1 \uC218\uC2E0 \uAE30\uB85D \uC5C6\uC74C":a?"\uC0C8 \uB370\uC774\uD130 \uC218\uC2E0 \uAE30\uB85D \uC788\uC74C":"\uC544\uC9C1 \uC218\uC2E0 \uAE30\uB85D \uC5C6\uC74C"}</div>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:8px;background:${d.length?"#fff7ed":"var(--surface)"};border:1px solid ${d.length?"#fdba74":"var(--border)"}">
        <span style="font-size:16px">${d.length?"\u26A0\uFE0F":"\u{1F5C2}\uFE0F"}</span>
        <div>
          <div style="font-weight:700;font-size:12px">\uC6D4\uBCC4 \uAE30\uB85D \uD30C\uC77C</div>
          <div style="font-size:11px;color:var(--gray-l)">${d.length?`\uB204\uB77D: ${d.join(", ")}`:"\uB204\uB77D \uC5C6\uC74C"}</div>
        </div>
      </div>
      ${i?`
      <div style="display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:8px;background:var(--surface);border:1px solid var(--border)">
        <span style="font-size:16px">\u{1F4BE}</span>
        <div>
          <div style="font-weight:700;font-size:12px">\uB9C8\uC9C0\uB9C9 \uC800\uC7A5</div>
          <div style="font-size:11px;color:var(--gray-l)">${o?new Date(parseInt(o)).toLocaleString("ko-KR"):"\uAE30\uB85D \uC5C6\uC74C"}</div>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:8px;background:${e.state==="local_newer"?"#fff7ed":e.state==="remote_newer"?"#eff6ff":"#f0fdf4"};border:1px solid ${e.state==="local_newer"?"#fdba74":e.state==="remote_newer"?"#bfdbfe":"#bbf7d0"}">
        <span style="font-size:16px">${e.state==="local_newer"?"\u{1F5A5}\uFE0F":e.state==="remote_newer"?"\u2601\uFE0F":"\u{1F91D}"}</span>
        <div>
          <div style="font-weight:700;font-size:12px">\uB85C\uCEEC/\uC6D0\uACA9 \uCD5C\uC2E0 \uBE44\uAD50</div>
          <div style="font-size:11px;color:${e.color}">${e.label}</div>
          <div style="font-size:10px;color:var(--gray-l)">\uB85C\uCEEC ${_fmtSyncTs(e.localLatest)} / \uC6D0\uACA9 ${_fmtSyncTs(e.remoteLatest)}</div>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:8px;background:var(--surface);border:1px solid var(--border)">
        <span style="font-size:16px">\u{1F4E6}</span>
        <div>
          <div style="font-weight:700;font-size:12px">\uB85C\uCEEC \uB370\uC774\uD130 \uD06C\uAE30</div>
          <div style="font-size:11px;color:var(--gray-l)">${c(r)} ${b?`/ \uB3D9\uAE30\uD654 \uB370\uC774\uD130: ${c(b*2)}`:"(\uB3D9\uAE30\uD654 \uD06C\uAE30 \uBBF8\uD655\uC778)"}</div>
        </div>
      </div>`:""}
      <div style="display:grid;gap:8px;grid-template-columns:1fr">
        ${d.length?`<button class="btn btn-w btn-sm" onclick="(async(btn)=>{const old=btn.textContent;btn.disabled=true;btn.textContent='\u{1F504} \uB204\uB77D \uC6D4 \uC7AC\uC218\uC2E0 \uC911...';try{if(typeof fbRetryMissingMonths==='function') await fbRetryMissingMonths();}catch(e){console.error('[fbRetryMissingMonths]',e);}finally{btn.disabled=false;btn.textContent=old;setTimeout(checkFbSyncStatus,300);}})(this)" style="width:100%">\u{1F5C2}\uFE0F \uB204\uB77D \uC6D4 \uB2E4\uC2DC\uBC1B\uAE30</button>`:""}
        ${isLoggedIn&&l?`<button class="btn btn-b btn-sm" onclick="(async(btn)=>{const old=btn.textContent;btn.disabled=true;btn.textContent='\u23EB \uC5C5\uB85C\uB4DC \uC911...';try{await fbCloudSave();localStorage.setItem('su_last_save_time',Date.now());btn.textContent='\u2705 \uC644\uB8CC';}catch(e){btn.textContent='\u274C \uC2E4\uD328';}finally{setTimeout(()=>{btn.disabled=false;btn.textContent=old;checkFbSyncStatus();},500);}})(this)" style="width:100%">\u2B06\uFE0F \uC9C0\uAE08 GitHub data.json\uC5D0 \uC5C5\uB85C\uB4DC</button>`:""}
      </div>
    </div>`;t.innerHTML=g}try{window._fmtSyncTs=_fmtSyncTs}catch(t){}try{window._getSyncFreshnessMeta=_getSyncFreshnessMeta}catch(t){}try{window._canViewSyncDebugInfo=_canViewSyncDebugInfo}catch(t){}try{window.refreshCloudSyncStatus=refreshCloudSyncStatus}catch(t){}try{window.checkFbSyncStatus=checkFbSyncStatus}catch(t){}

/* cloud-board-state.js */
var F=Object.defineProperty;var M=Object.getOwnPropertySymbols;var L=Object.prototype.hasOwnProperty,z=Object.prototype.propertyIsEnumerable;var T=(t,e,o)=>e in t?F(t,e,{enumerable:!0,configurable:!0,writable:!0,value:o}):t[e]=o,P=(t,e)=>{for(var o in e||(e={}))L.call(e,o)&&T(t,o,e[o]);if(M)for(var o of M(e))z.call(e,o)&&T(t,o,e[o]);return t};var O=(t,e)=>{var o={};for(var n in t)L.call(t,n)&&e.indexOf(n)<0&&(o[n]=t[n]);if(t!=null&&M)for(var n of M(t))e.indexOf(n)<0&&z.call(t,n)&&(o[n]=t[n]);return o};const GITHUB_JSON_URL="https://raw.githubusercontent.com/nada1004/star-system/main/star-datacenter/data.json",_FB_PW_DEFAULT="haram1019!@";function _boardCanManage(){try{return!!(typeof isLoggedIn!="undefined"&&isLoggedIn)&&!(typeof isSubAdmin!="undefined"&&isSubAdmin)}catch(t){return!1}}async function fbCloudSave(t){var y,h;const e=!(t&&t.includeSettings===!1);if(!localStorage.getItem("su_gh_token")||!_boardCanManage()||typeof window.fbSet!="function")return;const n=Date.now();window._lastAdminSaveTime=n,window._isSaving=!0,localStorage.setItem("su_last_admin_save",String(n));const i={},r=(players||[]).map(s=>{const a=P({},s);return a.photo&&(i[a.name]=a.photo,delete a.photo),a.history&&a.history.length&&(a.history=a.history.map(x=>{var f=x,{eloAfter:c}=f,u=O(f,["eloAfter"]);return u})),a}),d={};if(e)try{for(let s=0;s<localStorage.length;s++){const a=localStorage.key(s);if(!a||typeof a!="string"||!a.startsWith("su_")||a.startsWith("su_pp")||a==="su_fb_pw"||a==="su_gh_token"||a==="su_admin_hash"||a==="su_admin_hashes"||a==="su_last_admin_save"||a==="su_last_save_time"||a==="su_hist_ext_data_v1"||a==="su_hist_ext_proxy_presets_v1"||a==="su_hist_ext_proxy_preset_sel_v1"||a==="su_hist_ext_last_modified")continue;const c=localStorage.getItem(a);c!=null&&(String(c).length>2e5||(d[a]=c))}}catch(s){}const l={players:r,playerPhotos:i,univCfg,maps,tourD,miniM,univM,comps,ckM,compNames,curComp,proM,proTourneys,tiers:TIERS,tourneys,indM,gjM,ttM:typeof ttM!="undefined"?ttM:[],boardPlayerOrder,boardOrder,userMapAlias,playerStatusIcons,notices,curProComp,_ttCurComp,seasons,calScheduled,voteAgg:(()=>{const s={};return Object.entries(voteData||{}).forEach(([a,c])=>{!a.endsWith("_my")&&c&&typeof c=="object"&&(s[a]=c)}),s})(),savedAt:n};window.playerPhotos=i,Object.entries(i).forEach(([s,a])=>{_brdPhotoCacheSet(s,a)}),e&&(l.appSettings={fabTabs:JSON.parse(localStorage.getItem("su_fabTabs")||"{}"),globalImgSettings:JSON.parse(localStorage.getItem("su_b2_global_img_settings")||"{}"),imgSettings:JSON.parse(localStorage.getItem("su_img_settings")||"{}"),fabHideMobile:localStorage.getItem("su_fabHideMobile")==="1",fabHidePC:localStorage.getItem("su_fabHidePC")==="1",darkMode:localStorage.getItem("su_dark")==="1",b2LabelAlpha:localStorage.getItem("su_b2la")||"16",b2BgAlpha:localStorage.getItem("su_b2ba")||"9",designV2On:localStorage.getItem("su_design_v2")==="1",designV2Preset:localStorage.getItem("su_design_v2_preset")||"base",designV2Bright:localStorage.getItem("su_design_v2_bright")||"0",designV2Dark:localStorage.getItem("su_design_v2_dark")||"0",designV2Colors:localStorage.getItem("su_design_v2_colors")||"{}",designV2Effects:localStorage.getItem("su_design_v2_effects")||"{}",appFontPreset:localStorage.getItem("su_app_font_preset")||"noto",appFontCss:localStorage.getItem("su_app_font_css")||"",appFontFamily:localStorage.getItem("su_app_font_family")||"",appFontCssText:localStorage.getItem("su_app_font_css_text")||"",appFontAliasMap:localStorage.getItem("su_app_font_alias_map")||"{}",uiScalePct:localStorage.getItem("su_ui_scale_pct")||"100",uiScalePcPct:localStorage.getItem("su_ui_scale_pc_pct")||localStorage.getItem("su_ui_scale_pct")||"100",uiScaleTbPct:localStorage.getItem("su_ui_scale_tb_pct")||localStorage.getItem("su_ui_scale_pct")||"100",uiScaleMbPct:localStorage.getItem("su_ui_scale_mb_pct")||localStorage.getItem("su_ui_scale_pct")||"100",bgmEnabled:((y=localStorage.getItem("su_bgm_enabled"))!=null?y:"1")==="1",bgmShuffle:((h=localStorage.getItem("su_bgm_shuffle"))!=null?h:"0")==="1",bgmVolume:parseInt(localStorage.getItem("su_bgm_volume")||"50",10)||50,bgmList:localStorage.getItem("su_bgm_list")||"",soopList:localStorage.getItem("su_soop_list")||"",femcoSettings:localStorage.getItem("b2_femco_settings_v1")||null,femcoUniv:localStorage.getItem("cfg_femco_univ")||null,ls:d});let p=0;try{p=JSON.stringify(l).length;const s=document.getElementById("cloudStatus"),a=typeof window.__suEstimateSplitStore=="function"?window.__suEstimateSplitStore(l):null;let c,u;if(a&&a.maxBytes)c=a.maxBytes,u=`\uBD84\uB9AC \uC800\uC7A5 \uCD5C\uB300 \uD30C\uC77C ${(c/1024/1024).toFixed(1)}MB`;else{const x=Math.round(p*.5);c=x,u=`\uB370\uC774\uD130 ${(p/1024/1024).toFixed(1)}MB (\uC555\uCD95 \uD6C4 \uC57D ${(x/1024/1024).toFixed(1)}MB)`}c>3*1024*1024?(s&&(s.style.color="#dc2626",s.textContent=`\u26A0\uFE0F ${u} \u2014 \uC800\uC7A5 \uC2E4\uD328 \uAC00\uB2A5`),console.warn("[fbCloudSave] \uD06C\uAE30 \uC704\uD5D8:",(c/1024).toFixed(0)+"KB")):c>2*1024*1024&&(s&&(s.style.color="#d97706",s.textContent=`\u26A0\uFE0F ${u} \u2014 \uACE7 \uC800\uC7A5 \uC2E4\uD328\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4`),console.warn("[fbCloudSave] \uD06C\uAE30 \uACBD\uACE0:",(c/1024).toFixed(0)+"KB")),console.log("[fbCloudSave] \uD398\uC774\uB85C\uB4DC \uD06C\uAE30:",(p/1024).toFixed(0)+"KB")}catch(s){}function g(s){if(Array.isArray(s))return s.map(g);if(s!==null&&typeof s=="object"){const a={};return Object.keys(s).forEach(c=>{s[c]!==void 0&&(a[c]=g(s[c]))}),a}return s}const m=async s=>{const a=g(s),c=JSON.stringify(a),u=LZString.compressToBase64(c),x={_lz:u};return console.log("[fbCloudSave] \uC6D0\uBCF8:",(c.length/1024).toFixed(0)+"KB \u2192 \uC555\uCD95:",(u.length/1024).toFixed(0)+"KB ("+((1-u.length/c.length)*100).toFixed(0)+"% \uC808\uAC10)"),window.fbSet(x)};try{await m(l);try{window._lastAppliedSavedAt=Math.max(Number(window._lastAppliedSavedAt||0)||0,n),localStorage.setItem("su_sync_last_upload_ok_at",String(Date.now())),localStorage.setItem("su_sync_last_remote_saved_at",String(n)),typeof window.refreshCloudSyncStatus=="function"&&window.refreshCloudSyncStatus("\u2705 \uC5C5\uB85C\uB4DC \uC644\uB8CC","#16a34a")}catch(s){}}catch(s){const a=s.code||"",c=s.message||"",u=String(s),x=s.name||"",f=[a,c,x,u].filter(Boolean).filter((I,w,A)=>A.indexOf(I)===w).join(" | ");console.error("[fbCloudSave] \uC0C1\uC138:",{code:a,message:c,name:x,full:u,error:s});const _=document.getElementById("cloudStatus");if(_){const I=f.includes("exceeded")||f.includes("too large")||f.includes("payload")||f.includes("413"),w=f.includes("Permission")||f.includes("PERMISSION")||f.includes("auth")||f.includes("denied")||f.includes("401")||f.includes("403"),A=I?" \u2192 \uB370\uC774\uD130 \uD06C\uAE30 \uCD08\uACFC":w?" \u2192 GitHub \uD1A0\uD070/\uAD8C\uD55C \uBB38\uC81C":"",b=f||"\uC54C \uC218 \uC5C6\uB294 \uC624\uB958 (\uCF58\uC194 F12 \uD655\uC778)";_.style.color="#dc2626",_.innerHTML="\u274C GitHub \uC800\uC7A5 \uC2E4\uD328: "+b+A+` <button onclick="this.parentElement.textContent=''" style="margin-left:6px;background:none;border:1px solid #dc2626;border-radius:4px;color:#dc2626;font-size:11px;cursor:pointer;padding:1px 6px">\uB2EB\uAE30</button>`}throw s}finally{if(window._isSaving=!1,window._fbPendingData){const s=window._fbPendingData;window._fbPendingData=null,setTimeout(()=>{const a=Number(s&&s.savedAt||0)||0,c=(()=>{try{return Math.max(Number(window._lastAdminSaveTime||0)||0,Number(localStorage.getItem("su_last_admin_save")||0)||0)}catch(x){return Number(window._lastAdminSaveTime||0)||0}})(),u=Number(window._lastAppliedSavedAt||0)||0;if(a&&c&&a<c){console.warn("[sync] pending stale remote ignored",{pendingSavedAt:a,localSavedAt:c});return}if(!(a&&u&&a<=u)&&typeof _applyCloudData=="function"){a&&(window._lastAppliedSavedAt=Math.max(u,a)),_applyCloudData(s);try{typeof window._syncWindowDataRefs=="function"&&window._syncWindowDataRefs()}catch(x){}typeof localSave=="function"&&localSave();try{typeof window._primeMatchSyncSignature=="function"&&window._primeMatchSyncSignature(!0)}catch(x){}typeof fixPoints=="function"&&fixPoints(),window._compListCache={},window._shareAllMatchesCached=null,window._histTourneyCache={},typeof render=="function"&&render()}},200)}}}async function githubDataSave(t){const e=localStorage.getItem("su_gh_token");if(!e)return;const o="https://api.github.com/repos/nada1004/star-system/contents/star-datacenter/data.json",n=await fetch(o,{headers:{Authorization:`token ${e}`,Accept:"application/vnd.github.v3+json"}});if(!n.ok)throw new Error("GitHub \uD30C\uC77C \uC870\uD68C \uC2E4\uD328: "+n.status);const i=await n.json(),d={_lz:LZString.compressToBase64(JSON.stringify(t))},l=JSON.stringify(d),p=btoa(unescape(encodeURIComponent(l))),g=await fetch(o,{method:"PUT",headers:{Authorization:`token ${e}`,Accept:"application/vnd.github.v3+json","Content-Type":"application/json"},body:JSON.stringify({message:`\uB370\uC774\uD130 \uC5C5\uB370\uC774\uD2B8 ${new Date().toLocaleString("ko-KR")}`,content:p,sha:i.sha})});if(!g.ok)throw new Error("GitHub \uC800\uC7A5 \uC2E4\uD328: "+g.status)}try{window.fbCloudSave=fbCloudSave}catch(t){}async function _fetchGithubData(){if(typeof window.__suFetchGithubMergedData=="function")return await window.__suFetchGithubMergedData();const t=GITHUB_JSON_URL,o=[t+"?nocache="+Date.now(),"https://cdn.jsdelivr.net/gh/nada1004/star-system@main/star-datacenter/data.json","https://api.github.com/repos/nada1004/star-system/contents/star-datacenter/data.json","https://corsproxy.io/?url="+encodeURIComponent(t),"https://api.allorigins.win/raw?url="+encodeURIComponent(t)],n=async i=>{const r=new AbortController,d=setTimeout(()=>r.abort(),12e3);try{const l=await fetch(i,{cache:"no-store",mode:"cors",signal:r.signal});if(clearTimeout(d),!l.ok)throw new Error("HTTP "+l.status);const p=(await l.text()).replace(/^\uFEFF/,"").trim();if(p.startsWith("<"))throw new Error("HTML \uC751\uB2F5");const g=JSON.parse(p);if(g&&g.content&&g.encoding==="base64"){const m=atob(g.content.replace(/\s/g,"")),y=new Uint8Array(m.length);for(let h=0;h<m.length;h++)y[h]=m.charCodeAt(h);return JSON.parse(new TextDecoder("utf-8").decode(y))}return g}catch(l){throw clearTimeout(d),l}};try{return await Promise.any(o.map(n))}catch(i){const r=(i.errors||[i]).map((d,l)=>`[${l+1}] ${(d==null?void 0:d.message)||d}`).join(`
`);throw new Error(`\uB370\uC774\uD130\uB97C \uBD88\uB7EC\uC62C \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.

\uC6D0\uC778:
`+r+`

\uD574\uACB0\uBC29\uBC95:
\xB7 \uC778\uD130\uB137 \uC5F0\uACB0 \uD655\uC778
\xB7 GitHub \uC800\uC7A5\uC18C(nada1004/star-system)\uAC00 \uACF5\uAC1C(Public) \uC0C1\uD0DC\uC778\uC9C0 \uD655\uC778
\xB7 data.json \uD30C\uC77C\uC774 main \uBE0C\uB79C\uCE58\uC5D0 \uC788\uB294\uC9C0 \uD655\uC778`)}}function _applyFetchedCloudData(t){_applyCloudData(t),console.log("[\uBD88\uB7EC\uC624\uAE30] \uB370\uC774\uD130 \uAD6C\uC870:",{players:players.length,miniM:miniM.length,univM:univM.length,comps:comps.length,ckM:ckM.length,proM:proM.length,tourneys:tourneys.length}),localSave(),fixPoints(),window._compListCache={},window._shareAllMatchesCached=null,window._histTourneyCache={},curTab="total",statsSub="overview",histSub="mini",compSub="league",(function(){const i=[...t.miniM||[],...t.univM||[],...t.comps||[],...t.ckM||[],...t.proM||[]];mergeValidYearsIntoOptions(yearOptions,i)})(),filterYear="\uC804\uCCB4",filterMonth="\uC804\uCCB4",init();const e=(t.comps||[]).length,o=(t.tourneys||[]).reduce((i,r)=>i+(r.groups||[]).reduce((d,l)=>d+(l.matches||[]).filter(p=>p.sa!=null).length,0),0),n=(t.miniM||[]).length;return{compCount:e,tourCount:o,miniCount:n}}window.cloudLoad=async function(){try{gsSetStatus("\u{1F4E5} \uBD88\uB7EC\uC624\uB294 \uC911...","var(--blue)");const t=document.getElementById("btnCloudLoad");t&&(t.disabled=!0,t.textContent="\u23F3 \uBD88\uB7EC\uC624\uB294 \uC911...");const e=await _fetchGithubData();if(!confirm(`GitHub \uB370\uC774\uD130\uB97C \uBD88\uB7EC\uC635\uB2C8\uB2E4.

\u26A0\uFE0F \uD604\uC7AC \uB85C\uCEEC \uB370\uC774\uD130\uAC00 \uB36E\uC5B4\uC50C\uC6CC\uC9D1\uB2C8\uB2E4. \uACC4\uC18D\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?`)){t&&(t.disabled=!1,t.innerHTML="<span>\u2601\uFE0F</span> \uB370\uC774\uD130 \uBD88\uB7EC\uC624\uAE30");return}const{compCount:o,tourCount:n,miniCount:i}=_applyFetchedCloudData(e),r=document.getElementById("btnCloudLoad");r&&(r.disabled=!1,r.innerHTML="<span>\u2601\uFE0F</span> \uB370\uC774\uD130 \uBD88\uB7EC\uC624\uAE30"),gsSetStatus(`\u2705 \uBD88\uB7EC\uC624\uAE30 \uC644\uB8CC (${new Date().toLocaleTimeString()}) \u2014 \uBBF8\uB2C8 ${i}\uAC74\xB7\uB300\uD68C ${o+n}\uAC74`,"var(--green)")}catch(t){const e=document.getElementById("btnCloudLoad");e&&(e.disabled=!1,e.innerHTML="<span>\u2601\uFE0F</span> \uB370\uC774\uD130 \uBD88\uB7EC\uC624\uAE30");const o=t.message||String(t);gsSetStatus("\u274C \uBD88\uB7EC\uC624\uAE30 \uC2E4\uD328 (\uD558\uB2E8 \uBA54\uC2DC\uC9C0 \uD655\uC778)","var(--red)"),console.error("[cloudLoad \uC624\uB958]",t);const n=o.split(`
`).slice(0,3).join(`
`);setTimeout(()=>alert(`\u26A0\uFE0F \uB370\uC774\uD130 \uBD88\uB7EC\uC624\uAE30 \uC2E4\uD328

`+n),100)}},window._autoSyncApply=async function(){const t=await _fetchGithubData();return _applyFetchedCloudData(t)};var _brdPhotoCache=(function(){try{const t=localStorage.getItem("su_brd_photo_cache");return t?JSON.parse(t):{}}catch(t){return{}}})();(async function(){try{if(typeof MiscStore=="undefined")return;const e=await MiscStore.get("su_brd_photo_cache");e&&typeof e=="object"&&(_brdPhotoCache=e)}catch(e){}})();function _brdPhotoCacheSet(t,e){e?_brdPhotoCache[t]=e:delete _brdPhotoCache[t];try{typeof MiscStore!="undefined"?MiscStore.set("su_brd_photo_cache",_brdPhotoCache):localStorage.setItem("su_brd_photo_cache",JSON.stringify(_brdPhotoCache))}catch(o){}}function _getBrdPhoto(t){return t.photo||window.playerPhotos&&window.playerPhotos[t.name]||_brdPhotoCache[t.name]||""}let boardSelUniv="\uC804\uCCB4",boardCompactMode=!1,boardGridCols=1,boardCardView=!1,boardCardShape="circle",boardCollapsed=new Set;var boardChipPhotoShape=localStorage.getItem("su_bcp_shape")||"circle",boardChipPhotoSize=parseInt(localStorage.getItem("su_bcp_size")||"26",10),boardChipLayoutScale=parseInt(localStorage.getItem("su_bcp_layout")||"100",10);function saveBoardChipPhotoSettings(){localStorage.setItem("su_bcp_shape",boardChipPhotoShape),localStorage.setItem("su_bcp_size",String(boardChipPhotoSize)),localStorage.setItem("su_bcp_layout",String(boardChipLayoutScale||100));try{typeof window.cfgTouchPrefsSync=="function"&&window.cfgTouchPrefsSync()}catch(t){}try{typeof applyProfileShapeVars=="function"&&applyProfileShapeVars()}catch(t){}}var boardPlayerOrder=J("su_bpo")||{};function _findBrdCardByUniv(t,e){try{const o=e||document.getElementById("board-wrap")||document,n=o&&o.querySelectorAll?o.querySelectorAll(".brd-card"):[];for(const i of n)if(i&&i.dataset&&i.dataset.univ===t)return i;return null}catch(o){return null}}function _getBoardUnivs(){const t=getAllUnivs();if(!boardOrder.length)return t;const e=[],o=new Set;return boardOrder.forEach(n=>{const i=t.find(r=>r.name===n);i&&!o.has(i.name)&&(e.push(i),o.add(i.name))}),t.forEach(n=>{o.has(n.name)||(e.push(n),o.add(n.name))}),e}function toggleBoardUniv(t){if(typeof boardSelUniv=="undefined")return;boardSelUniv=boardSelUniv===t?"\uC804\uCCB4":t;const e=document.getElementById("board-univ-sel");e&&(e.value=boardSelUniv),_updateBoardSaveLabel(),render()}function _brdCollapseToggle(t){boardCollapsed.has(t)?boardCollapsed.delete(t):boardCollapsed.add(t);const e=_findBrdCardByUniv(t);if(!e)return;const o=e.querySelector(".brd-card-body");o&&(o.style.display=boardCollapsed.has(t)?"none":"");const n=e.querySelector(".brd-collapse-btn");n&&(n.textContent=boardCollapsed.has(t)?"\u25B6":"\u25BC")}function _brdCollapseAll(){_getBoardUnivs().forEach(t=>boardCollapsed.add(t.name)),document.querySelectorAll(".brd-card").forEach(t=>{const e=t.querySelector(".brd-card-body");e&&(e.style.display="none");const o=t.querySelector(".brd-collapse-btn");o&&(o.textContent="\u25B6")})}function _brdExpandAll(){boardCollapsed.clear(),document.querySelectorAll(".brd-card").forEach(t=>{const e=t.querySelector(".brd-card-body");e&&(e.style.display="");const o=t.querySelector(".brd-collapse-btn");o&&(o.textContent="\u25BC")})}function _updateBoardSaveLabel(){const t=document.getElementById("btn-img-save-label"),e=document.getElementById("brd-save-btn-label"),o=boardSelUniv&&boardSelUniv!=="\uC804\uCCB4"?boardSelUniv+" \uC774\uBBF8\uC9C0\uC800\uC7A5":"\uC774\uBBF8\uC9C0\uC800\uC7A5";t&&(t.textContent=o),e&&(e.textContent=o)}function _captureErrText(t){try{if(!t)return"\uC54C \uC218 \uC5C6\uB294 \uC624\uB958";if(typeof t=="string")return t;if(t instanceof Error)return t.message||String(t);if(typeof Event!="undefined"&&t instanceof Event)return"\uC774\uBCA4\uD2B8 \uC624\uB958("+(t&&t.type?t.type:"event")+")";if(t&&typeof t=="object"){if(typeof t.message=="string"&&t.message)return t.message;if(typeof t.type=="string"&&t.type)return"\uC774\uBCA4\uD2B8 \uC624\uB958("+t.type+")"}return String(t)}catch(e){return"\uC54C \uC218 \uC5C6\uB294 \uC624\uB958"}}window.saveCurrentView=async function(){const e=document.getElementById("cap");if(!e){alert("\uCEA1\uCC98\uD560 \uC601\uC5ED\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.");return}const o=document.getElementById("btn-img-save"),n=o?o.innerHTML:"";o&&(o.disabled=!0,o.innerHTML="\u23F3 \uC800\uC7A5\uC911");const i=g=>{try{const m=document.getElementById("_save-toast");m&&(m.innerHTML=g)}catch(m){}},r=document.createElement("div"),d=e.getBoundingClientRect(),l=Math.max(320,Math.round(d.width||e.scrollWidth||900)),p=Math.max(200,Math.round(e.scrollHeight||e.offsetHeight||d.height||600));r.style.cssText=`position:fixed;left:-9999px;top:0;width:${l}px;min-height:${p}px;background:#ffffff;padding:24px;box-sizing:border-box;`,r.innerHTML=e.innerHTML,r.querySelectorAll(".no-export").forEach(g=>g.remove()),document.body.appendChild(r);try{typeof _showSaveLoading=="function"&&_showSaveLoading(),i('<span style="display:inline-block;animation:_spin .8s linear infinite">\u23F3</span> \uC900\uBE44 \uC911...');try{const a="download"in document.createElement("a"),c=String(navigator.userAgent||""),u=/iPad|iPhone|iPod/i.test(c),x=/KAKAOTALK|Instagram|FBAN|FBAV|NAVER|Whale|Line/i.test(c);if(!a||u||x){const f=window.open("","_blank");if(f){try{f.document.write('<html><head><meta charset="utf-8"><title>\uC774\uBBF8\uC9C0 \uC0DD\uC131 \uC911...</title></head><body style="margin:0;font-family:sans-serif;background:#111;color:#fff;padding:14px">\uC774\uBBF8\uC9C0 \uC0DD\uC131 \uC911\uC785\uB2C8\uB2E4... \uC7A0\uC2DC\uB9CC \uAE30\uB2E4\uB824\uC8FC\uC138\uC694.</body></html>'),f.document.close()}catch(_){}window.__captureDlWin=f}}}catch(s){}try{typeof _applyBoardBgAutoSizing=="function"&&_applyBoardBgAutoSizing(r),typeof _b2ApplyBgAutoSizing=="function"&&_b2ApplyBgAutoSizing(r)}catch(s){}const g=Math.max(320,r.scrollWidth||l),m=Math.max(200,r.scrollHeight||p),h=`\uC2A4\uD0C0\uB300\uD559_${{total:"\uC2A4\uD2B8\uB9AC\uBA38",board2:"\uD604\uD669\uD310",tier:"\uD2F0\uC5B4\uC21C\uC704",mini:"\uBBF8\uB2C8\uB300\uC804",univm:"\uB300\uD559\uB300\uC804",univck:"\uB300\uD559CK",comp:"\uB300\uD68C",pro:"\uD504\uB85C\uB9AC\uADF8",hist:"\uB300\uC804\uAE30\uB85D",stats:"\uD1B5\uACC4",cal:"\uCE98\uB9B0\uB354"}[window.curTab]||window.curTab||"\uD654\uBA74"}_${new Date().toISOString().slice(0,10)}.png`;await _captureAndSave(r,g,m,h)}catch(g){alert("\uC774\uBBF8\uC9C0 \uC800\uC7A5 \uC624\uB958: "+_captureErrText(g))}finally{r.parentNode&&document.body.removeChild(r),typeof _hideSaveLoading=="function"&&_hideSaveLoading(),o&&(o.disabled=!1,o.innerHTML=n)}};function _getBoardPlayers(t,e=!1){const o=players.filter(r=>r.univ===t&&(e||!r.retired)&&!r.hideFromBoard&&!r.hidden),n=boardPlayerOrder[t]||[];if(!n.length)return t==="\uBB34\uC18C\uC18D"?[...o].sort((r,d)=>TIERS.indexOf(r.tier)-TIERS.indexOf(d.tier)||d.points-r.points):[...o].sort((r,d)=>{const l=getRoleOrder(r.role),p=getRoleOrder(d.role);return l!==p?l-p:TIERS.indexOf(r.tier)-TIERS.indexOf(d.tier)||d.points-r.points});const i=[];return n.forEach(r=>{const d=o.find(l=>l.name===r);d&&i.push(d)}),o.forEach(r=>{n.includes(r.name)||i.push(r)}),i}function saveBoardPlayerOrder(){localStorage.setItem("su_bpo",JSON.stringify(boardPlayerOrder))}const _brdBgImageMeta={};let _brdBgAutoResizeBound=!1;function _loadBoardBgImageMeta(t,e){try{const o=toHttpsUrl(t||"");if(!o){e&&e(null);return}if(_brdBgImageMeta[o]&&_brdBgImageMeta[o].w&&_brdBgImageMeta[o].h){e&&e(_brdBgImageMeta[o]);return}const n=new Image;n.onload=function(){_brdBgImageMeta[o]={w:n.naturalWidth||0,h:n.naturalHeight||0},e&&e(_brdBgImageMeta[o])},n.onerror=function(){e&&e(null)},n.src=o}catch(o){e&&e(null)}}function _resolveBoardAutoFit(t,e,o,n){const i=String(e||"auto");if(i==="cover"||i==="contain"||i==="fill")return i;const r=window.innerWidth||1280;if(!o||!o.width||!o.height)return t==="card"?r<=900?"contain":"cover":t==="profile"?r<=640?"contain":"cover":r<=900?"contain":"cover";if(!n||!n.w||!n.h)return t==="profile"?r<=640||o.width<=70?"contain":"cover":t==="card"?r<=900||o.width<120?"contain":"cover":r<=640||o.width<300?"contain":"cover";const d=o.width/o.height,l=n.w/n.h,p=Math.abs(Math.log(l/d));return t==="profile"?r<=640?p>.33?"contain":"cover":r<=1024?p>.3?"contain":"cover":l>1.55||l<.7||p>.28?"contain":"cover":t==="card"?r<=640?p>.24?"contain":"cover":r<=1024?p>.28?"contain":"cover":l>1.14||l<.5||p>.3?"contain":"cover":r<=640?p>.32?"contain":"cover":r<=1024?p>.3?"contain":"cover":o.width<280||o.height<220?p>.24?"contain":"cover":l>1.75||l<.64||p>.4?"contain":"cover"}function _resolveBoardBgSizeMode(t,e,o){return _resolveBoardAutoFit("bg",t,e,o)}function _resolveBoardAutoPosition(t,e,o,n){if(e!=="cover")return"center center";const i=n&&n.w&&n.h?n.w/n.h:1,r=o&&o.width&&o.height?o.width/o.height:1;if(!i||!r)return"center center";const d=r/i;return t==="bg"?d>2.1&&o&&o.height>=260?"bottom center":d>1.35?"top center":"center center":t==="card"?d>1.55||d>1.2?"top center":"center center":t==="profile"&&d>1.45?"top center":"center center"}function _applyBoardBgAutoSizing(t){try{const e=t||document,o=r=>{const d=[];return e&&e.matches&&e.matches(r)&&d.push(e),e&&e.querySelectorAll&&d.push(...e.querySelectorAll(r)),d};o(".brd-bg-layer[data-bg-size-mode]").forEach(r=>{const d=r.getAttribute("data-bg-size-mode")||"auto",l=r.closest(".brd-body")||r.parentElement,p=l?l.getBoundingClientRect():null;if(d!=="auto"){r.style.backgroundSize=d;return}const g=r.getAttribute("data-bg-src")||"";_loadBoardBgImageMeta(g,y=>{const h=_resolveBoardBgSizeMode(d,p,y);r.style.backgroundSize=h,r.setAttribute("data-bg-size-resolved",h)})}),o(".brd-fit-auto[data-fit-kind]").forEach(r=>{const d=r.getAttribute("data-fit-mode")||"auto",l=r.getAttribute("data-fit-kind")||"profile",p=r.getBoundingClientRect?r.getBoundingClientRect():null,g=y=>{const h=_resolveBoardAutoFit(l,d,p,y);r.style.objectFit=h;const s=_resolveBoardAutoPosition(l,h,p,y);r.style.objectPosition=s,r.setAttribute("data-fit-resolved",h)},m=r.currentSrc||r.getAttribute("src")||"";_loadBoardBgImageMeta(m,g)})}catch(e){}}function _bindBoardBgAutoResize(){if(_brdBgAutoResizeBound)return;_brdBgAutoResizeBound=!0;const t=()=>{try{const e=document.getElementById("board-wrap");if(!e)return;requestAnimationFrame(()=>_applyBoardBgAutoSizing(e))}catch(e){}};window.addEventListener("resize",t),window.addEventListener("orientationchange",()=>setTimeout(t,80)),document.addEventListener("visibilitychange",()=>{document.visibilityState==="visible"&&setTimeout(t,60)})}function rBoard(t,e){e.textContent="\u{1F4CA} \uD604\uD669\uD310";const o=_getBoardUnivs(),n=_boardCanManage(),i=(n?o:o.filter(b=>!b.hidden)).filter(b=>!b.dissolved);if(!o.length){t.innerHTML='<div style="padding:40px;text-align:center;color:var(--gray-l)">\uB4F1\uB85D\uB41C \uC120\uC218\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.</div>';return}const r=(b,v)=>{try{const S=String(b||"#64748b").replace("#",""),$=parseInt(S.slice(0,2),16),B=parseInt(S.slice(2,4),16),k=parseInt(S.slice(4,6),16);return`rgba(${$},${B},${k},${v})`}catch(S){return`rgba(100,116,139,${v||.2})`}},d=b=>{try{const v=String(b||"").replace("#","").trim(),S=parseInt(v.slice(0,2),16),$=parseInt(v.slice(2,4),16),B=parseInt(v.slice(4,6),16),k=C=>(C/=255,C<=.03928?C/12.92:Math.pow((C+.055)/1.055,2.4)),E=.2126*k(S)+.7152*k($)+.0722*k(B);return(1+.05)/(E+.05)>=(E+.05)/(.02+.05)?"#ffffff":"#0f172a"}catch(v){return"#ffffff"}},l=Math.max(.7,Math.min(1.8,(boardChipLayoutScale||100)/100)),p=Math.round(7*l),g=Math.round(5*l),m=Math.round(10*l),y=Math.round(12*l),h=Math.round(9*l),s=i.flatMap(b=>_getBoardPlayers(b.name)),a={};s.forEach(b=>{const v=b.tier||"?";a[v]=(a[v]||0)+1});const c=i.length>0&&i.every(b=>boardCollapsed.has(b.name)),u=boardSelUniv!=="\uC804\uCCB4"&&gc(boardSelUniv)||"#2563eb",x=d(u),f=boardSelUniv!=="\uC804\uCCB4"?boardSelUniv:"\uC804\uCCB4 \uB300\uD559",_=TIERS.filter(b=>a[b]).map(b=>`<span style="font-size:10px;font-weight:800;padding:3px 8px;border-radius:999px;background:${getTierBtnColor(b)||"#64748b"};color:${getTierBtnTextColor(b)||"#fff"}">${b} ${a[b]}</span>`).join(""),I=`<div class="brd-mini-stats">
    <div class="brd-mini-stat" style="--stat-accent:#6366f1"><div class="brd-mini-stat-label">\uD45C\uC2DC \uC2A4\uD2B8\uB9AC\uBA38</div><div class="brd-mini-stat-value">${s.length}</div><div class="brd-mini-stat-sub">\uAD6C\uD604\uD669\uD310 \uAE30\uC900 \uC778\uC6D0</div></div>
    <div class="brd-mini-stat" style="--stat-accent:#0ea5e9"><div class="brd-mini-stat-label">\uD65C\uC131 \uB300\uD559</div><div class="brd-mini-stat-value">${i.length}</div><div class="brd-mini-stat-sub">\uC228\uAE40/\uD574\uCCB4 \uC81C\uC678</div></div>
    <div class="brd-mini-stat" style="--stat-accent:${u}"><div class="brd-mini-stat-label">\uD604\uC7AC \uBCF4\uAE30</div><div class="brd-mini-stat-value" style="font-size:18px;color:${u}">${f}</div><div class="brd-mini-stat-sub">${boardSelUniv!=="\uC804\uCCB4"?"\uC120\uD0DD \uB300\uD559 \uC911\uC2EC":"\uC804\uCCB4 \uD750\uB984 \uBCF4\uAE30"}</div></div>
    <div class="brd-mini-stat" style="--stat-accent:#f59e0b"><div class="brd-mini-stat-label">\uD2F0\uC5B4 \uBD84\uD3EC</div><div class="brd-mini-stat-tier">${_||'<span style="font-size:11px;color:var(--text3);font-weight:700">\uC9D1\uACC4 \uC5C6\uC74C</span>'}</div></div>
  </div>`;let w=`
  <style>
    .brd-shell{display:flex;flex-direction:column;gap:14px}
    .brd-hero{position:relative;overflow:hidden;display:flex;align-items:flex-start;justify-content:space-between;gap:16px;padding:20px 22px;border-radius:26px;background:linear-gradient(180deg,rgba(255,255,255,.99),rgba(248,250,252,.96));border:1px solid rgba(148,163,184,.18);box-shadow:0 18px 34px rgba(15,23,42,.06)}
    .brd-hero::after{content:'';position:absolute;right:-70px;top:-70px;width:220px;height:220px;border-radius:999px;background:${r(u,.16)};filter:blur(2px);pointer-events:none}
    .brd-hero-copy,.brd-hero-side{position:relative;z-index:1}
    .brd-hero-copy{display:flex;flex-direction:column;gap:7px;min-width:0}
    .brd-hero-kicker{font-size:11px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;color:${u}}
    .brd-hero-title{font-size:25px;font-weight:950;letter-spacing:-.03em;color:var(--text1);line-height:1.14}
    .brd-hero-desc{font-size:13px;line-height:1.6;color:var(--text3);max-width:720px}
    .brd-hero-badges{display:flex;flex-wrap:wrap;gap:8px}
    .brd-hero-badge{display:inline-flex;align-items:center;gap:6px;padding:8px 12px;border-radius:999px;background:${r(u,.1)};border:1px solid ${r(u,.18)};font-size:12px;font-weight:800;color:${u};box-shadow:0 10px 18px rgba(15,23,42,.05)}
    .brd-hero-side{display:flex;flex-wrap:wrap;gap:10px;justify-content:flex-end}
    .brd-toolbar-card{padding:14px 16px;border-radius:24px;background:linear-gradient(180deg,rgba(255,255,255,.99),rgba(248,250,252,.96));border:1px solid rgba(148,163,184,.18);box-shadow:0 18px 34px rgba(15,23,42,.06)}
    .brd-toolbar-top{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;flex-wrap:wrap}
    .brd-toolbar-controls{display:flex;flex-direction:column;gap:10px;min-width:min(100%,720px)}
    .brd-toolbar-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
    .brd-toolbar-note{font-size:11px;color:var(--text3);font-weight:700}
    .brd-mini-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px;min-width:min(100%,520px)}
    .brd-mini-stat{padding:14px 16px;border-radius:16px;border:1px solid rgba(148,163,184,.16);background:linear-gradient(180deg,rgba(255,255,255,.99),rgba(248,250,252,.94));box-shadow:0 6px 16px rgba(15,23,42,.05);position:relative;overflow:hidden}
    .brd-mini-stat::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--stat-accent,#2563eb);border-radius:16px 16px 0 0;opacity:.7}
    .brd-mini-stat-label{font-size:10px;font-weight:900;color:var(--text3);letter-spacing:.06em;text-transform:uppercase}
    .brd-mini-stat-value{margin-top:5px;font-size:24px;font-weight:950;letter-spacing:-.03em;color:var(--text1)}
    .brd-mini-stat-sub{margin-top:3px;font-size:11px;font-weight:700;color:var(--text3)}
    .brd-mini-stat-tier{margin-top:8px;display:flex;flex-wrap:wrap;gap:5px}
    .brd-card{background:var(--brd-col,#dbeafe);border-radius:18px;overflow:hidden;box-shadow:0 4px 18px var(--brd-shd,rgba(37,99,235,.15)),0 1px 6px rgba(0,0,0,.07);position:relative;transition:transform .18s,box-shadow .18s;align-self:start;border:1px solid rgba(0,0,0,.06);}
    .brd-card:hover{transform:translateY(-2px);box-shadow:0 10px 32px var(--brd-shd,rgba(37,99,235,.22)),0 3px 10px rgba(0,0,0,.1);}
    .brd-card.drag-over{outline:3px solid rgba(0,0,0,.2);opacity:.85;}
    .brd-card.dragging{opacity:.45;transform:scale(.97);}
    .brd-hdr{padding:16px 18px 13px;position:relative;z-index:1;cursor:grab;}
    .brd-hdr:active{cursor:grabbing;}
    .brd-hdr::before{content:'';position:absolute;inset:0;background:linear-gradient(145deg,rgba(255,255,255,.18) 0%,rgba(255,255,255,0) 55%);pointer-events:none;z-index:0;}
    .brd-circle{position:absolute;border-radius:50%;background:rgba(255,255,255,.15);pointer-events:none;}
    .brd-row{display:flex;align-items:center;gap:${p}px;padding:${g}px ${m}px;border-radius:9px;background:rgba(255,255,255,.82);border:1px solid rgba(255,255,255,.7);transition:background .12s,box-shadow .12s;}
    .brd-row:hover{box-shadow:0 2px 8px rgba(0,0,0,.1);}
    .brd-row-btn{cursor:pointer;flex:1;display:flex;align-items:center;gap:7px;background:none;border:none;padding:0;font-family:'Noto Sans KR',sans-serif;min-width:0;}
    .brd-photo{width:${boardChipPhotoSize}px;height:${boardChipPhotoSize}px;border-radius:var(--su_profile_radius,50%);clip-path:var(--su_profile_clip,none);object-fit:cover;flex-shrink:0;background:rgba(0,0,0,.08);border:1.5px solid rgba(255,255,255,.7);}
    .brd-photo-placeholder{width:${boardChipPhotoSize}px;height:${boardChipPhotoSize}px;border-radius:var(--su_profile_radius,50%);clip-path:var(--su_profile_clip,none);flex-shrink:0;background:rgba(255,255,255,.4);border:1.5px solid rgba(255,255,255,.5);display:flex;align-items:center;justify-content:center;font-size:${Math.round(12*l)}px;color:rgba(0,0,0,.35);}
    .brd-race{font-size:9px;font-weight:800;padding:2px 6px;border-radius:5px;flex-shrink:0;letter-spacing:.3px;}
    .brd-name{font-weight:700;font-size:${y}px;color:#1e293b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1;min-width:0;text-align:left;}
    .brd-role-main{font-size:${h}px;padding:1px 5px;border-radius:4px;font-weight:700;white-space:nowrap;flex-shrink:0;border:1px solid;}
    .brd-role-sub{font-size:${h}px;padding:1px 5px;border-radius:4px;font-weight:600;white-space:nowrap;flex-shrink:0;background:rgba(100,116,139,.1);color:#475569;border:1px solid rgba(100,116,139,.2);}
    .brd-move-btn{display:flex;flex-direction:column;gap:1px;flex-shrink:0;opacity:.55;}
    .brd-move-btn button{background:none;border:none;cursor:pointer;font-size:9px;padding:0 2px;line-height:1;color:#1e293b;transition:opacity .12s;}
    .brd-move-btn button:hover{opacity:.5;}
    .brd-move-btn button:disabled{opacity:.18;cursor:default;}
    .brd-sep{height:1px;background:rgba(0,0,0,.1);margin:0 18px;}
    .brd-body{padding:10px 10px 14px;display:flex;flex-direction:column;gap:4px;overflow:hidden;}
    .brd-row-drag{cursor:grab;}.brd-row-drag:active{cursor:grabbing;}
    .brd-tier-lbl{font-size:9px;font-weight:700;color:rgba(0,0,0,.45);letter-spacing:.8px;text-transform:uppercase;padding:0 2px;margin:6px 0 2px;}
    .brd-tier-lbl:first-child{margin-top:0;}
    .brd-univ-name-btn{font-weight:900;font-size:18px;color:#fff;letter-spacing:.2px;line-height:1.15;text-shadow:0 1px 4px rgba(0,0,0,.2);cursor:pointer;border:none;background:none;padding:0;font-family:'Noto Sans KR',sans-serif;text-align:left;transition:opacity .15s;}
    .brd-univ-name-btn:hover{text-decoration:underline;text-underline-offset:3px;opacity:.8;}
    .brd-drag-hint{font-size:10px;color:rgba(255,255,255,.5);margin-left:auto;padding:2px 6px;border-radius:4px;background:rgba(255,255,255,.1);cursor:grab;flex-shrink:0;user-select:none;}
    .brd-side-panel{float:right;width:230px;margin:0 0 6px 10px;}
    .brd-bottom-img{max-width:200px;max-height:160px;object-fit:contain;}
    @media(max-width:640px){.brd-side-panel{display:none!important;}.brd-bottom-section-img{display:none!important;}}
    /* \uC774\uB3D9 \uD31D\uC5C5 */
    .brd-move-popup{position:fixed;z-index:5000;background:#fff;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,.22);padding:10px;min-width:220px;max-width:260px;max-height:90vh;overflow-y:auto;border:1px solid var(--border);}
    .brd-move-popup-title{font-size:11px;font-weight:700;color:var(--text3);padding:4px 6px 8px;border-bottom:1px solid var(--border);margin-bottom:6px;}
    .brd-move-popup-btn{display:flex;align-items:center;gap:8px;width:100%;padding:7px 10px;border:none;background:none;border-radius:7px;cursor:pointer;font-family:'Noto Sans KR',sans-serif;font-size:12px;font-weight:600;color:var(--text);transition:background .1s;text-align:left;}
    .brd-move-popup-btn:hover{background:var(--blue-l);color:var(--blue);}
    .brd-move-popup-btn:disabled{opacity:.35;cursor:default;background:none;}
    .brd-move-popup-sep{height:1px;background:var(--border);margin:4px 0;}
    .brd-toolbar{position:sticky;top:0;z-index:100;background:transparent!important;padding-bottom:6px;}
    body.dark .brd-hero,body.dark .brd-toolbar-card{background:linear-gradient(180deg,rgba(15,23,42,.94),rgba(15,23,42,.9));border-color:#334155;box-shadow:0 20px 38px rgba(0,0,0,.28)}
    body.dark .brd-hero-title{color:#f8fafc}
    body.dark .brd-hero-desc,body.dark .brd-toolbar-note{color:#94a3b8}
    body.dark .brd-hero-badge{background:${r(u,.2)};border-color:${r(u,.28)};color:${x}}
    body.dark .brd-mini-stat{background:linear-gradient(180deg,rgba(15,23,42,.92),rgba(30,41,59,.88));border-color:#334155}
    body.dark .brd-mini-stat-value{color:#e2e8f0}
    body.dark .brd-mini-stat-label,body.dark .brd-mini-stat-sub{color:#94a3b8}
    @media(max-width:900px){.brd-hero{flex-direction:column;padding:18px;border-radius:22px}.brd-hero-side{justify-content:flex-start}.brd-toolbar-top{flex-direction:column}.brd-toolbar-controls,.brd-mini-stats{min-width:100%}}
    @media(max-width:768px){#board-wrap{grid-template-columns:1fr!important;}}
  </style>
  <div class="brd-shell">
  <section class="brd-hero no-export">
    <div class="brd-hero-copy">
      <div class="brd-hero-kicker">Classic Board</div>
      <div class="brd-hero-title">\u{1F4CA} \uAD6C\uD604\uD669\uD310</div>
      <div class="brd-hero-desc">${boardSelUniv!=="\uC804\uCCB4"?`${boardSelUniv} \uC911\uC2EC\uC73C\uB85C \uAE30\uC874 \uD604\uD669\uD310 \uB808\uC774\uC544\uC6C3\uC744 \uB354 \uAE54\uB054\uD55C \uCE74\uB4DC\uD615 UI\uB85C \uC815\uB9AC\uD588\uC2B5\uB2C8\uB2E4.`:"\uAE30\uC874 \uD604\uD669\uD310 \uD750\uB984\uC740 \uC720\uC9C0\uD558\uBA74\uC11C \uC0C1\uB2E8 \uD0D0\uC0C9\uACFC \uD1B5\uACC4 \uC601\uC5ED\uC744 \uB354 \uBCF4\uAE30 \uC88B\uACE0 \uC9C1\uAD00\uC801\uC73C\uB85C \uB2E4\uB4EC\uC5C8\uC2B5\uB2C8\uB2E4."}</div>
      <div class="brd-hero-badges">
        <span class="brd-hero-badge">\uD604\uC7AC \uBCF4\uAE30 \xB7 ${f}</span>
        <span class="brd-hero-badge">\uD45C\uC2DC \uC2A4\uD2B8\uB9AC\uBA38 ${s.length}\uBA85</span>
        <span class="brd-hero-badge">\uB300\uD559 ${i.length}\uACF3</span>
        <span class="brd-hero-badge">${boardCardView?"\uD3EC\uD1A0\uCE74\uB4DC":"\uAE30\uBCF8 \uCE74\uB4DC"} \xB7 ${boardGridCols===2?"2\uC5F4":"1\uC5F4"}</span>
      </div>
    </div>
    <div class="brd-hero-side">
      <span class="brd-hero-badge" style="background:linear-gradient(135deg,${u},${r(u,.82)});border-color:${u};color:${x};box-shadow:0 16px 28px ${r(u,.22)}">${f}</span>
    </div>
  </section>
  <div class="brd-toolbar-card no-export">
  <div class="fbar" style="overflow-x:auto;flex-wrap:nowrap;-webkit-overflow-scrolling:touch;scrollbar-width:none;gap:4px;margin-bottom:10px">
    <button class="pill ${boardGridCols===2?"on":""}" style="flex-shrink:0;white-space:nowrap" onclick="boardGridCols=boardGridCols===2?1:2;render()" title="1\uC5F4/2\uC5F4 \uBCF4\uAE30 \uC804\uD658">${boardGridCols===2?"\u25A6 1\uC5F4":"\u229E 2\uC5F4"}</button>
    <button class="pill ${boardCardView?"on":""}" style="flex-shrink:0;white-space:nowrap" onclick="boardCardView=!boardCardView;if(boardCardView)boardCardShape=boardCardShape==='circle'?'square':'circle';render()" title="\uD3EC\uD1A0\uCE74\uB4DC \uBDF0 \uC804\uD658">\u25A6 \uD3EC\uD1A0\uCE74\uB4DC</button>
    <button class="pill ${boardCompactMode?"on":""}" style="flex-shrink:0;white-space:nowrap" onclick="boardCompactMode=!boardCompactMode;render()" title="\uC18C\uD615/\uB300\uD615 \uCE69 \uC804\uD658">${boardCompactMode?"\u2B1B \uD06C\uAC8C\uBCF4\uAE30":"\u{1F532} \uC18C\uD615\uC73C\uB85C"}</button>
    <button class="pill ${c?"on":""}" style="flex-shrink:0;white-space:nowrap" onclick="${c?"_brdExpandAll()":"_brdCollapseAll()"}" title="${c?"\uBAA8\uB450 \uD3BC\uCE58\uAE30":"\uBAA8\uB450 \uC811\uAE30"}">${c?"\u2295 \uD3BC\uCE58\uAE30":"\u2296 \uC811\uAE30"}</button>
  </div>
  <div class="brd-toolbar brd-toolbar-top">
    <div class="brd-toolbar-controls">
      <div class="brd-toolbar-row">
      <div style="position:relative">
        <select id="board-univ-sel" onchange="boardSelUniv=this.value;_updateBoardSaveLabel();render();if(boardSelUniv!=='\uC804\uCCB4'){setTimeout(()=>{const c=document.querySelector(\`.brd-card[data-univ='\${boardSelUniv}']\`);if(c)c.scrollIntoView({behavior:'smooth',block:'center'});},120);}" style="appearance:none;-webkit-appearance:none;padding:6px 28px 6px 12px;border-radius:9px;border:1.5px solid var(--border2);font-size:12px;font-weight:700;color:var(--text);background:var(--surface);cursor:pointer;outline:none;min-width:120px;">
          <option value="\uC804\uCCB4">\u{1F3EB} \uC804\uCCB4 \uBCF4\uAE30</option>
          ${i.map(b=>`<option value="${b.name}"${boardSelUniv===b.name?" selected":""}>${b.name}${n&&b.hidden?" (\uC228\uAE40)":""}</option>`).join("")}
        </select>
        <svg style="position:absolute;right:8px;top:50%;transform:translateY(-50%);pointer-events:none;color:var(--gray-l)" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m6 9 6 6 6-6"/></svg>
      </div>
      <button class="pill" onclick="boardSelUniv&&boardSelUniv!=='\uC804\uCCB4'?downloadBoardSel():downloadBoardAll()" id="brd-save-btn">
        \u{1F4F7} <span id="brd-save-btn-label">${boardSelUniv&&boardSelUniv!=="\uC804\uCCB4"?boardSelUniv+" \uC774\uBBF8\uC9C0\uC800\uC7A5":"\uC774\uBBF8\uC9C0\uC800\uC7A5"}</span>
      </button>
      <div style="display:flex;align-items:center;gap:5px;padding:4px 10px;border-radius:9px;border:1.5px solid var(--border2);background:var(--surface)">
        <span style="font-size:10px;color:var(--gray-l);font-weight:700;white-space:nowrap">\uBC30\uACBD</span>
        <button onclick="b2BgAlpha=Math.max(0,b2BgAlpha-5);localStorage.setItem('su_b2ba',b2BgAlpha);render();if(typeof save==='function')save()" style="padding:1px 6px;border-radius:5px;border:1px solid var(--border2);background:var(--white);font-size:11px;cursor:pointer;line-height:1.4" title="\uBC30\uACBD \uB354 \uC5F0\uD558\uAC8C">\u2212</button>
        <input type="range" min="0" max="100" value="${b2BgAlpha}" id="brd-bg-range" style="width:55px;height:4px;cursor:pointer" title="\uBC30\uACBD \uC9C4\uD558\uAE30 (${b2BgAlpha})" oninput="b2BgAlpha=+this.value;localStorage.setItem('su_b2ba',b2BgAlpha);render();if(typeof save==='function')save()">
        <button onclick="b2BgAlpha=Math.min(100,b2BgAlpha+5);localStorage.setItem('su_b2ba',b2BgAlpha);render();if(typeof save==='function')save()" style="padding:1px 6px;border-radius:5px;border:1px solid var(--border2);background:var(--white);font-size:11px;cursor:pointer;line-height:1.4" title="\uBC30\uACBD \uB354 \uC9C4\uD558\uAC8C">+</button>
        <span style="font-size:10px;color:var(--gray-l);font-weight:700;white-space:nowrap;margin-left:4px">\uB77C\uBCA8</span>
        <button onclick="b2LabelAlpha=Math.max(0,b2LabelAlpha-5);localStorage.setItem('su_b2la',b2LabelAlpha);render();if(typeof save==='function')save()" style="padding:1px 6px;border-radius:5px;border:1px solid var(--border2);background:var(--white);font-size:11px;cursor:pointer;line-height:1.4" title="\uB77C\uBCA8 \uB354 \uC5F0\uD558\uAC8C">\u2212</button>
        <input type="range" min="0" max="100" value="${b2LabelAlpha}" id="brd-label-range" style="width:55px;height:4px;cursor:pointer" title="\uB77C\uBCA8 \uC9C4\uD558\uAE30 (${b2LabelAlpha})" oninput="b2LabelAlpha=+this.value;localStorage.setItem('su_b2la',b2LabelAlpha);render();if(typeof save==='function')save()">
        <button onclick="b2LabelAlpha=Math.min(100,b2LabelAlpha+5);localStorage.setItem('su_b2la',b2LabelAlpha);render();if(typeof save==='function')save()" style="padding:1px 6px;border-radius:5px;border:1px solid var(--border2);background:var(--white);font-size:11px;cursor:pointer;line-height:1.4" title="\uB77C\uBCA8 \uB354 \uC9C4\uD558\uAC8C">+</button>
      </div>
      </div>
      <div class="brd-toolbar-note">${n?'\u{1F5B1}\uFE0F \uD5E4\uB354 \uB4DC\uB798\uADF8\xB7\u25C0\u25B6 = \uB300\uD559\uC21C\uC11C | \uC2A4\uD2B8\uB9AC\uBA38 \uB4DC\uB798\uADF8/\uD074\uB9AD = \uC21C\uC11C\xB7\uB300\uD559\uC774\uB3D9 <button onclick="openCfgHome()" style="margin-left:6px;background:var(--surface);border:1px solid var(--border2);border-radius:8px;padding:4px 10px;font-size:11px;cursor:pointer;color:var(--text2);font-weight:700">\u2699\uFE0F \uB300\uD559 \uC0C9\uC0C1\xB7\uC228\uAE30\uAE30</button>':"\u{1F446} \uC2A4\uD2B8\uB9AC\uBA38 \uD074\uB9AD \u2192 \uC2A4\uD2B8\uB9AC\uBA38 \uC0C1\uC138"}</div>
    </div>
    ${I}
  </div>
  </div>
  <div id="board-wrap" style="display:grid;grid-template-columns:${boardGridCols===2?"repeat(2,1fr)":"1fr"};gap:14px;align-items:start">`;(boardSelUniv==="\uC804\uCCB4"?i:i.filter(b=>b.name===boardSelUniv)).forEach(b=>{w+=buildUnivBoardCard(b)}),w+=`</div>
</div>
`,t.innerHTML=w,injectUnivIcons(t),requestAnimationFrame(()=>{injectUnivIcons(t),initBoardDrag(),_bindBoardBgAutoResize(),_applyBoardBgAutoSizing(t)}),_brdPopupListenerAdded||(document.addEventListener("click",_closeBrdPopup,{capture:!0}),_brdPopupListenerAdded=!0)}

/* cloud-board-render.js */
function buildUnivBoardCard(e,r){if(!e)return"";const n=typeof escJS=="function"?escJS(e.name):String(e.name||"").replace(/\\/g,"\\\\").replace(/'/g,"\\'").replace(/\r/g,"\\r").replace(/\n/g,"\\n"),t=gc(e.name),a=UNIV_ICONS[e.name]||(univCfg.find(w=>w.name===e.name)||{}).icon||"",d=_getBoardPlayers(e.name);if(!d.length&&!r)return`<div class="brd-card" data-univ="${escAttr(e.name)}" style="border:2px dashed ${t}66;border-radius:14px;padding:20px 18px;background:${t}08;display:flex;align-items:center;gap:10px;opacity:.75">
      ${a?`<img src="${toHttpsUrl(a)}" style="width:var(--su_univ_logo_size,32px);height:var(--su_univ_logo_size,32px);object-fit:contain;border-radius:var(--su_univ_logo_radius,10px)" onerror="this.style.display='none'">`:""}
      <span style="font-weight:900;font-size:15px;color:${t}">${e.name}</span>
      <span style="font-size:11px;color:var(--gray-l)">\uB4F1\uB85D\uB41C \uC2A4\uD2B8\uB9AC\uBA38 \uC5C6\uC74C</span>
    </div>`;const i=d.length,l=getAllUnivs(),T={T:{bg:"#dbeafe",col:"#1e40af",txt:"\uD14C"},Z:{bg:"#ede9fe",col:"#5b21b6",txt:"\uC800"},P:{bg:"#fef3c7",col:"#92400e",txt:"\uD504"},N:{bg:"#f1f5f9",col:"#475569",txt:"?"}},u=(w,h)=>{const C=parseInt(w.slice(1,3),16),z=parseInt(w.slice(3,5),16),b=parseInt(w.slice(5,7),16);return`rgba(${C},${z},${b},${h})`},y=(w,h=.72)=>{const C=parseInt(w.slice(1,3),16),z=parseInt(w.slice(3,5),16),b=parseInt(w.slice(5,7),16),s=Math.round(C*(1-h)+255*h),x=Math.round(z*(1-h)+255*h),$=Math.round(b*(1-h)+255*h);return"#"+[s,x,$].map(_=>_.toString(16).padStart(2,"0")).join("")},c=r?t:y(t,Math.max(.35,.95-b2BgAlpha*.01)),M=t,L=u(t,.18);return(w=>{const h=d.filter(o=>o.role&&MAIN_ROLES.includes(o.role)),C=d.filter(o=>!o.role||!MAIN_ROLES.includes(o.role)),z={};C.forEach(o=>{const p=o.tier||"\uAE30\uD0C0";z[p]||(z[p]=[]),z[p].push(o)});const b=TIERS.filter(o=>z[o]);z.\uAE30\uD0C0&&!TIERS.includes("\uAE30\uD0C0")&&b.push("\uAE30\uD0C0");const s=(o,p)=>{const v=typeof escJS=="function"?escJS(o&&o.name):String(o&&o.name||"").replace(/\\/g,"\\\\").replace(/'/g,"\\'").replace(/\r/g,"\\r").replace(/\n/g,"\\n"),B=typeof window.escHTML=="function"?window.escHTML(o&&o.name):String(o&&o.name||""),f=typeof window.escHTML=="function"?window.escHTML(o&&o.role):String(o&&o.role||""),g=T[o.race]||{bg:"#f1f5f9",col:"#475569",txt:o.race||"?"},S=o.role&&MAIN_ROLES.includes(o.role),R=ROLE_COLORS[o.role]||"",j=ROLE_ICONS[o.role]||"",k=_getBrdPhoto(o);if(boardCardView){const W=g.col||t,Y=o.tier?getTierBtnColor(o.tier)||"#64748b":null,J=o.tier&&getTierBtnTextColor(o.tier)||"#fff",A=g.txt||o.race||"?",U=boardCardShape==="square"?"8px":"10px",F=k?`<img src="${toHttpsUrl(k)}" class="brd-fit-auto" data-fit-kind="card" data-fit-mode="auto" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center;border-radius:${U}" onload="_applyBoardBgAutoSizing(this)" ${r?"":` onerror="this.style.display='none'"`}>`+(r?"":`<div style="position:absolute;inset:0;background:linear-gradient(135deg,${t},${t}aa);display:none;align-items:center;justify-content:center;font-size:30px;font-weight:900;color:#fff;border-radius:${U}">${A}</div>`):`<div style="position:absolute;inset:0;background:linear-gradient(135deg,${t},${t}aa);display:flex;align-items:center;justify-content:center;font-size:30px;font-weight:900;color:#fff;border-radius:${U}">${A}</div>`,le=`<div style="position:absolute;top:6px;left:6px;display:flex;gap:3px;flex-wrap:wrap"><span style="font-size:9px;font-weight:900;background:${g.col||"#64748b"};color:#fff;border-radius:4px;padding:1px 5px;line-height:1.5;text-shadow:0 1px 2px rgba(0,0,0,.4)">${A}</span>`+(o.tier?`<span style="font-size:9px;font-weight:800;background:${Y};color:${J};border-radius:4px;padding:1px 5px;line-height:1.5;text-shadow:0 1px 2px rgba(0,0,0,.3)">${o.tier}</span>`:"")+"</div>",ce='<div style="position:absolute;bottom:0;left:0;right:0;background:linear-gradient(transparent,rgba(0,0,0,.82));border-radius:0 0 10px 10px;padding:22px 6px 7px;text-align:center">'+(o.role?`<div style="font-size:9px;font-weight:700;color:#ffffffbb;margin-bottom:1px">${f}</div>`:"")+`<div style="font-weight:800;font-size:11px;color:#fff;word-break:break-all;text-shadow:0 1px 3px #000a">${B}</div>`+(o.channelUrl?r?`<div style="margin-top:4px;font-size:9px;font-weight:700;color:${t};background:rgba(255,255,255,.9);border-radius:4px;padding:1px 6px;display:inline-block">\u25B6 \uBC29\uC1A1</div>`:`<a href="${o.channelUrl}" target="_blank" onclick="event.stopPropagation()" style="margin-top:4px;display:inline-block;font-size:9px;font-weight:700;color:${t};background:rgba(255,255,255,.9);border-radius:4px;padding:1px 6px;text-decoration:none">\u25B6 \uBC29\uC1A1</a>`:"")+"</div>",K=`<div style="position:relative;width:100%;${r?"height:110px;padding-top:0":"aspect-ratio:3/4"};overflow:hidden;border-radius:10px">${F}${le}${ce}</div>`;if(r)return`<div style="border-radius:10px;overflow:hidden;border:2px solid ${u(t,.5)}">${K}</div>`;const ge=d.length,be=_boardCanManage()?`openBrdPlayerPopupFromChip(event,'${v}','${n}',${p!=null?p:0},${ge})`:"openRandomPlayerModal()";return`<div class="brd-chip" data-player="${escAttr(o.name)}" data-univ="${escAttr(e.name)}" data-idx="${p!=null?p:0}"${_boardCanManage()?' draggable="true"':""} style="border-radius:10px;overflow:hidden;border:2px solid ${u(t,.5)};cursor:pointer;transition:box-shadow .15s,transform .15s" onmouseover="this.style.boxShadow='0 6px 20px ${u(t,.5)}';this.style.transform='translateY(-3px)'" onmouseout="this.style.boxShadow='';this.style.transform=''" onclick="event.stopPropagation();${be}" ondragstart="if(_boardCanManage()){event.stopPropagation();event.dataTransfer.setData('text/chip',this.dataset.player);}">`+K+"</div>"}if(r){const W=u(t,.16),Y=u(t,.45),J=g.txt||o.race||"?",A=o.tier?getTierBtnColor(o.tier)||t:"#9ca3af",U=o.tier&&getTierBtnTextColor(o.tier)||"#fff",F="var(--su_profile_radius,50%)";return`<span style="display:inline-flex;align-items:center;gap:12px;background:${W};border-radius:16px;padding:10px 18px 10px 10px;margin:5px;box-shadow:0 2px 10px rgba(0,0,0,.13);border:2px solid ${Y}">
          ${k?`<img src="${toHttpsUrl(k)}" class="brd-fit-auto" data-fit-kind="profile" data-fit-mode="auto" style="width:64px;height:64px;border-radius:${F};object-fit:cover;flex-shrink:0;border:3px solid ${t};box-shadow:0 2px 10px ${u(t,.4)}" onload="_applyBoardBgAutoSizing(this)">`:`<span style="width:64px;height:64px;border-radius:${F};background:${t};color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:26px;font-weight:900;flex-shrink:0;border:3px solid ${u(t,.7)}">${J}</span>`}
          <span style="display:inline-flex;flex-direction:column;gap:3px;min-width:0">
            ${S?`<span style="font-size:11px;font-weight:900;color:#fff;background:${t};border-radius:5px;padding:2px 8px;display:inline-block">${j}${o.role}</span>`:""}
            <span style="font-weight:900;color:#111;font-size:16px;line-height:1.3;white-space:nowrap">${o.name}</span>
            <span style="display:inline-flex;align-items:center;gap:5px;line-height:1.2">
              <span style="font-size:12px;font-weight:900;background:${g.col};color:#fff;border-radius:6px;padding:2px 8px">${J}</span>
              ${o.tier?`<span style="font-size:11px;font-weight:800;background:${A};color:${U};border-radius:6px;padding:2px 8px">${o.tier}</span>`:""}
            </span>
          </span>
        </span>`}const m=boardCompactMode,H=d.length,ee=_boardCanManage()?`openBrdPlayerPopupFromChip(event,'${v}','${n}',${p!=null?p:0},${H})`:"openRandomPlayerModal()",te=o.tier?getTierBtnColor(o.tier)||t:"#9ca3af",oe=o.tier&&getTierBtnTextColor(o.tier)||"#fff",V=u(t,.16),re=u(t,.28),X=u(t,.45),q=g.txt||o.race||"?",D=m?"36px":"64px",G=m?"14px":"26px",ne=m?"5px 10px 5px 6px":"10px 18px 10px 10px",ie=m?"7px":"12px",ae=m?"13px":"16px",de=m?"10px":"12px",se=m?"9px":"11px",pe=k?`<span style="width:${D};height:${D};border-radius:var(--su_profile_radius,50%);flex-shrink:0;position:relative;display:inline-flex;align-items:center;justify-content:center;overflow:hidden;border:${m?"2":"3"}px solid ${t};box-shadow:0 2px 10px ${u(t,.4)};background:${t};color:#fff;font-size:${G};font-weight:900">${q}<img src="${toHttpsUrl(k)}" class="brd-fit-auto" data-fit-kind="profile" data-fit-mode="auto" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:var(--su_profile_radius,50%)" onload="_applyBoardBgAutoSizing(this)" onerror="this.style.display='none'"></span>`:`<span style="width:${D};height:${D};border-radius:var(--su_profile_radius,50%);background:${t};color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:${G};font-weight:900;flex-shrink:0;border:${m?"2":"3"}px solid ${u(t,.7)}">${q}</span>`;return`<span class="brd-chip" data-player="${escAttr(o.name)}" data-univ="${escAttr(e.name)}" data-idx="${p!=null?p:0}"${_boardCanManage()?' draggable="true"':""} style="display:inline-flex;align-items:center;gap:${ie};background:${V};border-radius:16px;padding:${ne};margin:${m?"3px":"5px"};cursor:${_boardCanManage()?"grab":"pointer"};transition:all .15s;box-shadow:0 2px 10px rgba(0,0,0,.13);border:2px solid ${X}" onmouseover="this.style.background='${re}';this.style.boxShadow='0 5px 18px rgba(0,0,0,.2)';this.style.borderColor='${u(t,.65)}'" onmouseout="this.style.background='${V}';this.style.boxShadow='0 2px 10px rgba(0,0,0,.13)';this.style.borderColor='${X}'" onclick="event.stopPropagation();${ee}" ondragstart="if(_boardCanManage()){event.stopPropagation();event.dataTransfer.setData('text/chip',this.dataset.player);}">
        ${pe}
        <span style="display:inline-flex;flex-direction:column;gap:${m?"2px":"3px"};min-width:0">
          ${S&&!m?`<span style="font-size:11px;font-weight:900;color:#fff;background:${t};border-radius:5px;padding:2px 8px;display:inline-block">${j}${o.role}</span>`:""}
          <span style="font-weight:900;color:#111;font-size:${ae};line-height:1.3;white-space:nowrap;${o.inactive?"opacity:.6":""}">${m&&S?`${j}`:""}${B}${getStatusIconHTML(o.name)}${o.inactive?'<span style="font-size:9px;background:#fff7ed;color:#9a3412;border-radius:4px;padding:1px 4px;font-weight:700;margin-left:3px">\u23F8\uFE0F</span>':""}${!o.transferDate||!o.prevUniv?"":(new Date-new Date(o.transferDate))/864e5<=30?`<span style="font-size:9px;background:#fef3c7;color:#92400e;border-radius:4px;padding:1px 5px;font-weight:800;margin-left:3px;border:1px solid #fcd34d" title="${escAttr(o.prevUniv)}\uC5D0\uC11C \uC774\uC801 (${escAttr(o.transferDate)})">\u{1F504} \uC774\uC801</span>`:""}</span>
          <span style="display:inline-flex;align-items:center;gap:${m?"3px":"5px"};line-height:1.2">
            <span style="font-size:${de};font-weight:900;background:${g.col};color:#fff;border-radius:6px;padding:${m?"1px 5px":"2px 8px"}">${q}</span>
            ${o.tier?`<span style="font-size:${se};font-weight:800;background:${te};color:${oe};border-radius:6px;padding:${m?"1px 5px":"2px 8px"}">${o.tier}</span>`:""}
          </span>
        </span>
      </span>`},x={};d.forEach((o,p)=>{x[o.name]=p});const $=MAIN_ROLES.map(o=>h.filter(p=>p.role===o)).filter(o=>o.length>0),_=$.length>0?$.map(o=>{const p=o[0].role,v=ROLE_ICONS[p]||"",B=ROLE_COLORS[p]||t;return`<div style="margin-bottom:6px;padding:6px 8px 8px;border-radius:10px;background:${u(t,.1)};border:1.5px solid ${u(t,.25)}">
            <div style="font-size:10px;font-weight:900;color:#fff;padding:2px 9px;margin-bottom:4px;background:${B};border-radius:5px;display:inline-block;line-height:1.6">${v}${p}</div>
            <div style="${boardCardView&&!r?"display:grid;grid-template-columns:repeat(auto-fill,minmax(90px,1fr));gap:8px;padding:4px 0":"display:flex;flex-wrap:wrap;gap:0"}">${o.map(f=>{var g;return s(f,(g=x[f.name])!=null?g:0)}).join("")}</div>
          </div>`}).join(""):"";let P="",O="";if(e.name==="\uBB34\uC18C\uC18D"&&!r){const o=[...d].sort((f,g)=>TIERS.indexOf(f.tier)-TIERS.indexOf(g.tier)||g.points-f.points),p={};o.forEach((f,g)=>{p[f.name]=g});const v={};o.forEach(f=>{const g=f.tier||"\uAE30\uD0C0";v[g]||(v[g]=[]),v[g].push(f)}),P=[...TIERS.filter(f=>v[f]),...v.\uAE30\uD0C0?["\uAE30\uD0C0"]:[]].map(f=>{const g=v[f],S=getTierBtnColor(f)||t,R=getTierBtnTextColor(f)||"#fff";return`<div style="padding:4px 0 2px;border-bottom:1px solid ${u(t,.22)}">
          <div style="font-size:10px;font-weight:900;color:${R};letter-spacing:1px;padding:2px 9px;margin-bottom:3px;background:${y(S,Math.max(0,(50-b2LabelAlpha)*.005))}!important;border-radius:5px;box-shadow:0 1px 4px rgba(0,0,0,.15);display:inline-block;line-height:1.5">${f}</div>
          <div style="${boardCardView&&!r?"display:grid;grid-template-columns:repeat(auto-fill,minmax(90px,1fr));gap:8px;padding:4px 0":"display:flex;flex-wrap:wrap;gap:0"}">${g.map(j=>{var k;return s(j,(k=p[j.name])!=null?k:0)}).join("")}</div>
        </div>`}).join(""),O=P}else P=b.map((o,p)=>{const v=z[o],B=getTierBtnColor(o)||t,f=getTierBtnTextColor(o)||"#fff";return`<div style="padding:4px 0 2px;border-bottom:1px solid ${u(t,.22)}">
          <div style="font-size:10px;font-weight:900;color:${f};letter-spacing:1px;padding:2px 9px;margin-bottom:3px;background:${y(B,Math.max(0,(50-b2LabelAlpha)*.005))}!important;border-radius:5px;box-shadow:0 1px 4px rgba(0,0,0,.15);display:inline-block;line-height:1.5">${o}</div>
          <div style="${boardCardView&&!r?"display:grid;grid-template-columns:repeat(auto-fill,minmax(90px,1fr));gap:8px;padding:4px 0":"display:flex;flex-wrap:wrap;gap:0"}">${v.map(g=>{var S;return s(g,(S=x[g.name])!=null?S:0)}).join("")}</div>
        </div>`}).join(""),O=_+P;const Z=_boardCanManage()&&!r?` draggable="true" ondragstart="event.stopPropagation();const card=this.closest('.brd-card');const wrap=document.getElementById('board-wrap');_brdDragSrc=card;card.classList.add('dragging');event.dataTransfer.effectAllowed='move';event.dataTransfer.setData('text/card',card.dataset.univ);" ondragend="event.stopPropagation();const card=this.closest('.brd-card');card.classList.remove('dragging');const wrap=document.getElementById('board-wrap');if(wrap){boardOrder=[...wrap.querySelectorAll('.brd-card')].map(c=>c.dataset.univ);save();syncBoardOrderToUnivCfg();}wrap&&wrap.querySelectorAll('.brd-card').forEach(c=>c.classList.remove('drag-over'));_brdDragSrc=null;"`:"",Q=e.bgImgPos||"center center",I=e.bgImgSize||"auto",N=e.bgImg?(()=>{const o=["top","center","bottom"],p=["left","center","right"];return`<div onclick="event.stopPropagation()" style="display:flex;flex-direction:column;gap:1px" title="\uBC30\uACBD \uC704\uCE58">${o.map(v=>`<div style="display:flex;gap:1px">${p.map(B=>{const f=`${v} ${B}`,g=Q===f;return`<button onclick="event.stopPropagation();setBoardBgImgPos('${n}','${f}')" style="width:10px;height:10px;border-radius:2px;border:1px solid ${g?"rgba(255,255,255,.9)":"rgba(255,255,255,.3)"};background:${g?"rgba(255,255,255,.6)":"rgba(255,255,255,.15)"};cursor:pointer;padding:0" title="${f}"></button>`}).join("")}</div>`).join("")}</div>`})():"";return`<div class="brd-card" data-univ="${escAttr(e.name)}" style="position:relative;--brd-col:${y(t,Math.min(1,Math.max(.35,.95-b2BgAlpha*.01)+.08))};--brd-shd:${L}${w?";grid-column:1/-1":""}" draggable="false">
      <div class="brd-hdr" style="background:linear-gradient(135deg,${t} 0%,${u(t,.85)} 100%);border-radius:18px 18px 0 0;cursor:${_boardCanManage()&&!r?"grab":"default"};overflow:hidden"${Z}>
        <div style="display:flex;align-items:center;gap:10px;position:relative;z-index:1">
          <div style="width:var(--su_univ_logo_box,46px);height:var(--su_univ_logo_box,46px);border-radius:var(--su_univ_logo_radius,13px);background:rgba(255,255,255,.20);border:2px solid rgba(255,255,255,.35);display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden;${r?"":"cursor:pointer"}" draggable="false" ${r?"":`onmousedown="event.stopPropagation()" onclick="event.stopPropagation();if(typeof openUnivModal==='function')openUnivModal('${n}')"`} title="\uB300\uD559 \uC0C1\uC138 \uBCF4\uAE30">
            ${a?`<img src="${toHttpsUrl(a)}" style="width:var(--su_univ_logo_size,34px);height:var(--su_univ_logo_size,34px);object-fit:contain;border-radius:var(--su_univ_logo_radius,10px)" onerror="this.parentElement.innerHTML='\u{1F3EB}'">`:'<span style="font-size:22px">\u{1F3EB}</span>'}
          </div>
          <div style="flex:1;min-width:0">
            <div style="display:flex;align-items:center;gap:6px;flex-wrap:nowrap;min-width:0;overflow:hidden">
              <button class="brd-univ-name-btn" style="color:#fff!important;font-weight:900;text-shadow:0 1px 4px rgba(0,0,0,.25);font-size:18px;display:inline-flex;align-items:center;gap:7px;flex-shrink:0" ${r?"":`onclick="event.stopPropagation();toggleBoardUniv('${n}')"`}>
                ${e.name||""}${!r&&(boardSelUniv||"")===e.name?`<span style="background:rgba(255,255,255,.95);color:${t};border-radius:50%;width:22px;height:22px;display:inline-flex;align-items:center;justify-content:center;font-size:14px;font-weight:900;box-shadow:0 2px 6px rgba(0,0,0,.2);flex-shrink:0">\u2713</span>`:""}</button>
              ${(e.championships||0)>0?`<span style="display:flex;gap:1px;flex-shrink:0">${'<span style="font-size:15px">\u2B50</span>'.repeat(e.championships||0)}</span>`:""}
              ${_boardCanManage()&&!r?`<input type="text" placeholder="\u{1F4CC} \uBA54\uBAA8..." value="${escAttr(e.memo2||"")}" style="margin-left:4px;background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.35);border-radius:6px;padding:2px 8px;font-size:12px;color:#fff;outline:none;font-family:inherit;min-width:60px;width:200px;max-width:45%;flex:0 1 auto" onmousedown="event.stopPropagation()" onclick="event.stopPropagation()" onchange="setBoardMemo2('${n}',this.value)" onblur="setBoardMemo2('${n}',this.value)">`:e.memo2?`<span style="margin-left:4px;font-size:12px;color:rgba(255,255,255,.92);font-weight:600;background:rgba(255,255,255,.15);border-radius:6px;padding:2px 8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex-shrink:1;max-width:45%">${typeof window.escHTML=="function"?window.escHTML(e.memo2):e.memo2}</span>`:""}
            </div>
            <div style="font-size:11px;color:rgba(255,255,255,.8);margin-top:3px;display:flex;align-items:center;gap:5px">${i}\uBA85 <button class="brd-collapse-btn no-export" onclick="event.stopPropagation();_brdCollapseToggle('${n}')"
              style="background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.35);border-radius:4px;color:#fff;font-size:10px;padding:0 5px;height:16px;cursor:pointer;line-height:1;font-weight:700">${boardCollapsed.has(e.name)?"\u25B6":"\u25BC"}</button>${e.dissolved?`<span style="background:rgba(0,0,0,.4);font-size:10px;padding:1px 7px;border-radius:10px;color:#fca5a5">\u{1F3DA}\uFE0F \uD574\uCCB4${e.dissolvedDate?" "+e.dissolvedDate:""}</span>`:""}${_boardCanManage()&&e.hidden?'<span style="background:rgba(0,0,0,.4);font-size:10px;padding:1px 7px;border-radius:10px">\u{1F6AB} \uBC29\uBB38\uC790 \uC228\uAE40</span>':""}</div>
          </div>
          ${r?"":`<div class="no-export" style="display:flex;flex-direction:column;gap:3px;flex-shrink:0">
            ${_boardCanManage()?`<div style="display:flex;gap:3px;flex-wrap:wrap;justify-content:flex-end">
{{ ... }
              <button onclick="event.stopPropagation();boardCardMove('${escJS(e.name)}','left')" style="background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.35);border-radius:5px;color:#fff;font-size:11px;padding:0 7px;height:22px;cursor:pointer" title="\uC67C\uCABD \uC774\uB3D9">\u25C0</button>
              <button onclick="event.stopPropagation();boardCardMove('${escJS(e.name)}','right')" style="background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.35);border-radius:5px;color:#fff;font-size:11px;padding:0 7px;height:22px;cursor:pointer" title="\uC624\uB978\uCABD \uC774\uB3D9">\u25B6</button>
              <button onclick="event.stopPropagation();toggleBoardHide('${escJS(e.name)}')" style="background:${e.hidden?"rgba(239,68,68,.55)":"rgba(255,255,255,.18)"};border:1px solid ${e.hidden?"rgba(239,68,68,.8)":"rgba(255,255,255,.35)"};border-radius:5px;color:#fff;font-size:12px;padding:0 7px;height:22px;cursor:pointer" title="${e.hidden?"\uC228\uAE40":"\uD45C\uC2DC"}">${e.hidden?"\u{1F6AB}":"\u{1F441}\uFE0F"}</button>
              <label style="background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.35);border-radius:5px;color:#fff;font-size:12px;padding:0 7px;height:22px;cursor:pointer;display:flex;align-items:center;position:relative;overflow:hidden" onclick="event.stopPropagation()" title="\uC0C9\uC0C1">\u{1F3A8}<input type="color" value="${t}" style="position:absolute;opacity:0;width:100%;height:100%;cursor:pointer;top:0;left:0" onchange="event.stopPropagation();changeBoardUnivColor('${e.name}',this.value)"></label>
              <button onclick="event.stopPropagation();adjustChampionship('${escJS(e.name)}',1)" style="background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.35);border-radius:5px;color:#fff;font-size:11px;padding:0 7px;height:22px;cursor:pointer" title="\uC6B0\uC2B9 \uCD94\uAC00">\u2B50+</button>
              <button onclick="event.stopPropagation();adjustChampionship('${escJS(e.name)}',-1)" style="background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.35);border-radius:5px;color:#fff;font-size:11px;padding:0 7px;height:22px;cursor:pointer" title="\uC6B0\uC2B9 \uC81C\uAC70">\u2B50-</button>
              ${(()=>{const o=univCfg.findIndex(p=>p.name===e.name);return o<0?"":e.dissolved?`<button onclick="event.stopPropagation();univCfg[${o}].dissolved=false;univCfg[${o}].hidden=false;delete univCfg[${o}].dissolvedDate;save();render()" style="background:rgba(34,197,94,.35);border:1px solid rgba(134,239,172,.8);border-radius:5px;color:#fff;font-size:11px;padding:0 7px;height:22px;cursor:pointer" title="\uD574\uCCB4 \uBCF5\uAD6C">\u{1F504} \uBCF5\uAD6C</button>`:`<button onclick="event.stopPropagation();(function(){const _i=${o};if(typeof openDissolveModal==='function'){openDissolveModal(_i);}else{if(!confirm('${e.name.replace(/'/g,"\\'")} \uB300\uD559\uC744 \uD574\uCCB4\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?'))return;univCfg[_i].dissolved=true;univCfg[_i].hidden=true;univCfg[_i].dissolvedDate=new Date().toISOString().slice(0,10);save();render();}})()" style="background:rgba(234,88,12,.35);border:1px solid rgba(253,186,116,.8);border-radius:5px;color:#fff;font-size:11px;padding:0 7px;height:22px;cursor:pointer" title="\uB300\uD559 \uD574\uCCB4">\u{1F3DA}\uFE0F \uD574\uCCB4</button>`})()}
              <label style="background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.35);border-radius:5px;color:#fff;font-size:11px;padding:0 7px;height:22px;cursor:pointer;display:flex;align-items:center;gap:2px" onclick="event.stopPropagation()" title="\uBC30\uACBD \uC774\uBBF8\uC9C0 \uD30C\uC77C \uC5C5\uB85C\uB4DC">\u{1F5BC}\uFE0F<input type="file" accept="image/*" style="display:none" onchange="event.stopPropagation();(function(f,n){if(!f)return;const r=new FileReader();r.onload=function(e){setBoardBgImg(n,e.target.result);};r.readAsDataURL(f);})(this.files[0],'${n}')"></label>
              <button onclick="event.stopPropagation();promptBoardBgImgUrl('${n}')" style="background:${e.bgImg&&!e.bgImg.startsWith("data:")?"rgba(99,102,241,.45)":"rgba(255,255,255,.18)"};border:1px solid ${e.bgImg&&!e.bgImg.startsWith("data:")?"rgba(165,180,252,.8)":"rgba(255,255,255,.35)"};border-radius:5px;color:#fff;font-size:11px;padding:0 7px;height:22px;cursor:pointer" title="\uBC30\uACBD \uC774\uBBF8\uC9C0 URL \uB9C1\uD06C">\u{1F517}</button>
              ${e.bgImg?`<button onclick="event.stopPropagation();removeBoardBgImg('${n}')" style="background:rgba(239,68,68,.35);border:1px solid rgba(239,68,68,.6);border-radius:5px;color:#fff;font-size:11px;padding:0 7px;height:22px;cursor:pointer" title="\uBC30\uACBD \uC81C\uAC70">\u{1F5D1}\uFE0F</button>
              <button onclick="event.stopPropagation();setBoardBgImgSize('${n}','${I==="cover"?"contain":I==="contain"?"auto":"cover"}')" style="background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.35);border-radius:5px;color:#fff;font-size:10px;padding:0 6px;height:22px;cursor:pointer" title="${I==="cover"?"\uB9DE\uCD94\uAE30(contain)":I==="contain"?"\uC790\uB3D9(auto)":"\uCC44\uC6B0\uAE30(cover)"}">${I==="cover"?"\u2194\uB9DE\uCD94\uAE30":I==="contain"?"\u{1FA84}\uC790\uB3D9":"\u2B1B\uCC44\uC6B0\uAE30"}</button>
              ${N}`:""}
            </div>`:""}
          </div>`}
        </div>
      </div>
      <div class="brd-sep" style="background:${u(t,.25)}"></div>
      <div class="brd-card-body brd-body" style="background:${e.bgImg?"transparent":y(t,Math.max(.3,.88-b2BgAlpha*.01))};overflow:hidden;position:relative;${boardCollapsed.has(e.name)?"display:none":""}">${e.bgImg?`<div class="brd-bg-layer" data-bg-src="${String(e.bgImg).replace(/"/g,"&quot;")}" data-bg-size-mode="${I}" style="position:absolute;inset:0;background:url('${String(e.bgImg).replace(/'/g,"%27")}') ${e.bgImgPos||"center center"}/${I==="auto"?"cover":I} no-repeat;opacity:0.35;pointer-events:none;z-index:0"></div>`:""}<div style="position:relative;z-index:1;background:${e.bgImg?"rgba(255,255,255,0.75)":"transparent"};min-height:100%">${(()=>{const o=e.memo||"",p=(e.memoImgs||[]).length?e.memoImgs:e.memoImg?[e.memoImg]:[],v=e.name.replace(/'/g,"\\'").replace(/"/g,"&quot;"),B="border-radius:10px;padding:8px;background:rgba(255,255,255,.25);border:1px solid rgba(255,255,255,.45);backdrop-filter:blur(8px);box-shadow:0 2px 12px rgba(0,0,0,.1)";let f="";if(_boardCanManage()&&!r){const k=p.map((m,H)=>`<div style="position:relative;margin-bottom:5px">
            <img src="${m}" style="width:100%;border-radius:7px;display:block" onerror="this.style.display='none'">
            <button onclick="event.stopPropagation();removeBoardMemoImg('${v}',${H})" style="position:absolute;top:3px;right:3px;font-size:9px;background:rgba(239,68,68,.75);border:none;border-radius:4px;padding:1px 5px;color:#fff;cursor:pointer">\u2715</button>
          </div>`).join("");f=`<div class="brd-side-panel no-export" style="${B}">
            ${k}
            <textarea placeholder="\u{1F4DD} \uC0AC\uC774\uB4DC \uBA54\uBAA8..." rows="2" style="width:100%;box-sizing:border-box;border:1px solid rgba(255,255,255,.55);border-radius:7px;padding:4px 6px;font-size:11px;background:rgba(255,255,255,.45);resize:none;outline:none;font-family:inherit;color:#222;margin-top:${p.length?"2px":"0"}" onmousedown="event.stopPropagation()" onclick="event.stopPropagation()" onchange="setBoardMemo('${v}',this.value)" onblur="setBoardMemo('${v}',this.value)">${o}</textarea>
            <div style="display:flex;gap:4px;margin-top:4px">
              <label style="display:inline-flex;align-items:center;gap:2px;cursor:pointer;font-size:10px;font-weight:700;background:rgba(255,255,255,.6);border:1px solid rgba(255,255,255,.65);border-radius:5px;padding:2px 6px" onclick="event.stopPropagation()" title="\uD30C\uC77C \uC5C5\uB85C\uB4DC">\u{1F5BC}\uFE0F \uC5C5\uB85C\uB4DC<input type="file" accept="image/*" style="display:none" onchange="event.stopPropagation();(function(f,n){if(!f)return;const r=new FileReader();r.onload=function(e){addBoardMemoImg(n,e.target.result);};r.readAsDataURL(f);})(this.files[0],'${v}')"></label>
              <button onclick="event.stopPropagation();promptBoardMemoImgUrl('${v}')" style="display:inline-flex;align-items:center;gap:2px;cursor:pointer;font-size:10px;font-weight:700;background:rgba(255,255,255,.6);border:1px solid rgba(255,255,255,.65);border-radius:5px;padding:2px 6px" title="\uC774\uBBF8\uC9C0 URL \uB9C1\uD06C">\u{1F517} \uB9C1\uD06C</button>
            </div>
          </div>`}else if(!r&&(o||p.length)){const k=p.map(m=>`<img src="${m}" style="width:100%;border-radius:7px;margin-bottom:5px;display:block" onerror="this.style.display='none'">`).join("");f=`<div class="brd-side-panel no-export" style="${B}">${k}${o?`<div style="font-size:11px;color:#333;white-space:pre-wrap;line-height:1.5;margin-top:${p.length?"4px":"0"}">${o}</div>`:""}</div>`}const g=e.bMemo||"",S=(e.bMemoImgs||[]).concat(e.bMemoImg?[e.bMemoImg]:[]);let R="";if(_boardCanManage()&&!r){const k=S.map((m,H)=>`<div style="display:inline-flex;flex-direction:column;gap:3px;margin-right:6px;vertical-align:top">
            <img src="${m}" class="brd-bottom-section-img" style="max-width:130px;max-height:110px;object-fit:contain;border-radius:8px;display:block" onerror="this.style.display='none'">
            <button onclick="event.stopPropagation();removeBoardNoteImg('${v}',${H})" style="font-size:10px;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.25);border-radius:5px;padding:2px 6px;color:#dc2626;cursor:pointer">\u{1F5D1}\uFE0F \uC0AD\uC81C</button>
          </div>`).join("");R=`<div style="margin-top:8px;padding-top:8px;border-top:1px solid rgba(0,0,0,.08);display:flex;flex-direction:column;gap:5px">
            ${k?`<div style="display:flex;flex-wrap:wrap;gap:4px">${k}</div>`:""}
            <textarea placeholder="\u{1F4CB} \uD558\uB2E8 \uBA54\uBAA8 \uC785\uB825..." rows="2" style="width:100%;box-sizing:border-box;border:1px solid rgba(0,0,0,.12);border-radius:7px;padding:5px 8px;font-size:11px;background:rgba(255,255,255,.55);resize:none;outline:none;font-family:inherit;color:#222" onmousedown="event.stopPropagation()" onclick="event.stopPropagation()" onchange="setBoardNote('${v}',this.value)" onblur="setBoardNote('${v}',this.value)">${g}</textarea>
            <div style="display:flex;gap:5px;align-items:center">
              <label style="display:inline-flex;align-items:center;gap:3px;cursor:pointer;font-size:11px;font-weight:700;background:rgba(255,255,255,.7);border:1px solid rgba(0,0,0,.12);border-radius:6px;padding:3px 8px" onclick="event.stopPropagation()" title="\uD30C\uC77C \uC5C5\uB85C\uB4DC">\u{1F5BC}\uFE0F \uC5C5\uB85C\uB4DC<input type="file" accept="image/*" style="display:none" onchange="event.stopPropagation();(function(f,n){if(!f)return;const r=new FileReader();r.onload=function(e){addBoardNoteImg(n,e.target.result);};r.readAsDataURL(f);})(this.files[0],'${v}')"></label>
              <button onclick="event.stopPropagation();promptBoardNoteImgUrl('${v}')" style="display:inline-flex;align-items:center;gap:3px;cursor:pointer;font-size:11px;font-weight:700;background:rgba(255,255,255,.7);border:1px solid rgba(0,0,0,.12);border-radius:6px;padding:3px 8px" title="\uC774\uBBF8\uC9C0 URL \uB9C1\uD06C">\u{1F517} \uB9C1\uD06C</button>
            </div>
          </div>`}else if(g||S.length){const k=S.map(m=>`<img src="${m}" class="brd-bottom-section-img" style="max-width:130px;max-height:110px;object-fit:contain;border-radius:8px;display:block" onerror="this.style.display='none'">`).join("");R=`<div style="margin-top:8px;padding:8px;border-radius:8px;background:rgba(255,255,255,.35)">${k?`<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:${g?"6px":"0"}">${k}</div>`:""}${g?`<div style="font-size:12px;color:#333;white-space:pre-wrap;line-height:1.6">${g}</div>`:""}</div>`}return`<div style="position:relative;z-index:1">${`<div style="overflow:hidden">${f}${_}${P}</div>`}${R}</div>`})()}</div></div>
    </div>`})(e.name==="\uBB34\uC18C\uC18D")}function _brdToast(e,r=2800){const n=document.getElementById("brd-toast");n&&n.remove();const t=document.createElement("div");t.id="brd-toast",t.textContent=e,t.style.cssText="position:fixed;bottom:28px;left:50%;transform:translateX(-50%) translateY(20px);background:#1e293b;color:#fff;padding:10px 20px;border-radius:10px;font-size:13px;font-weight:600;z-index:9999;box-shadow:0 4px 20px rgba(0,0,0,.3);opacity:0;transition:opacity .25s,transform .25s;pointer-events:none;font-family:'Noto Sans KR',sans-serif;",document.body.appendChild(t),requestAnimationFrame(()=>{t.style.opacity="1",t.style.transform="translateX(-50%) translateY(0)"}),setTimeout(()=>{t.style.opacity="0",t.style.transform="translateX(-50%) translateY(10px)",setTimeout(()=>t.remove(),300)},r)}let _brdPopup=null,_brdPopupListenerAdded=!1;function _closeBrdPopup(e){_brdPopup&&(_brdPopup.contains(e.target)||_brdClose())}function openRandomPlayerModal(){const e=(window.players||[]).filter(n=>n&&n.name&&!n.hidden&&!n.retired);if(!e.length)return;const r=e[Math.floor(Math.random()*e.length)];openPlayerModal(r.name)}function _brdClose(){_brdPopup&&(_brdPopup.remove(),_brdPopup=null);const e=document.getElementById("brd-popup-dim");e&&e.remove()}function openBrdPlayerPopupFromChip(e,r,n,t,a){if(!_boardCanManage()){openRandomPlayerModal();return}e.stopPropagation(),_brdClose();const d=_getBoardUnivs(),i=players.find(b=>b.name===r);if(!i)return;const l=document.createElement("div");l.className="brd-move-popup",_brdPopup=l;const u=d.filter(b=>b.name!==n&&!b.dissolved).map(b=>`<option value="${b.name}">${b.name}</option>`).join(""),y=r.replace(/[^a-zA-Z0-9가-힣]/g,""),c=typeof escJS=="function"?escJS(r):String(r||"").replace(/\\/g,"\\\\").replace(/'/g,"\\'").replace(/\r/g,"\\r").replace(/\n/g,"\\n"),M=typeof escJS=="function"?escJS(n):String(n||"").replace(/\\/g,"\\\\").replace(/'/g,"\\'").replace(/\r/g,"\\r").replace(/\n/g,"\\n"),L=typeof window.escHTML=="function"?window.escHTML(r):String(r||""),E=typeof window.escHTML=="function"?window.escHTML(n):String(n||""),w=TIERS.indexOf(i.tier||"\uBBF8\uC815"),h=w>0?TIERS[w-1]:null,C=w<TIERS.length-1?TIERS[w+1]:null;if(l.innerHTML=`
    <div class="brd-move-popup-title">\u{1F464} ${L} <span style="font-size:10px;font-weight:400">(${E})</span></div>
    <div style="padding:5px 6px 8px;border-bottom:1px solid var(--border)">
      <div style="font-size:10px;font-weight:700;color:var(--text3);margin-bottom:4px">\u{1F3AD} \uC0C1\uD0DC \uC544\uC774\uCF58 <span style="margin-left:4px">${getStatusIconHTML(r)||""}</span></div>
      <div style="display:flex;flex-wrap:wrap;gap:2px;max-height:90px;overflow-y:auto" id="brd-icon-grid-${y}">
        ${(()=>{const b=getStatusIcon(r);return Object.entries(STATUS_ICON_DEFS).map(([s,x])=>{const $=s==="none"&&!b||x.emoji&&b===x.emoji,_=x.emoji?_siIsImg(x.emoji)?_siRender(x.emoji,"15px"):x.emoji:'<span style="font-size:9px">\uC5C6\uC74C</span>';return`<button type="button" title="${x.label.replace(/"/g,"&quot;")}" onclick="setBrdStatusIcon(this,'${c}','${s}')" data-icon-id="${s}" style="padding:2px 5px;border-radius:4px;border:2px solid ${$?"#16a34a":"var(--border)"};background:${$?"#dcfce7":"var(--white)"};cursor:pointer;font-size:${s==="none"?"9px":"12px"};min-width:26px;display:inline-flex;align-items:center;justify-content:center">${_}</button>`}).join("")})()}
      </div>
    </div>
    <div class="brd-move-popup-sep"></div>
    <div style="padding:4px 6px 6px;font-size:11px;font-weight:700;color:var(--text3)">\u{1F3F7}\uFE0F \uC9C1\uCC45 \uC218\uC815</div>
    <div style="display:flex;gap:4px;flex-wrap:wrap;padding:0 6px 4px">
      ${["\uC774\uC0AC\uC7A5","\uB3D9\uC544\uB9AC \uD68C\uC7A5","\uCD1D\uC7A5","\uBD80\uCD1D\uC7A5","\uCD1D\uAD04","\uAD50\uC218","\uCF54\uCE58"].map(b=>`<button class="btn btn-xs ${i.role===b?"btn-b":"btn-w"}" onclick="setBrdRole('${c}','${b}')" style="font-size:10px">${b}</button>`).join("")}
      <button class="btn btn-xs btn-w" onclick="setBrdRole('${c}','')" style="font-size:10px;color:#dc2626">\uD574\uC81C</button>
    </div>
    <div style="display:flex;gap:4px;padding:0 6px 4px;align-items:center">
      <input id="brd-role-chip-${y}" type="text" placeholder="\uC9C1\uC811 \uC785\uB825..." style="flex:1;padding:4px 7px;border-radius:6px;border:1px solid var(--border2);font-size:11px">
      <button class="btn btn-b btn-xs" onclick="(function(){const inp=document.getElementById('brd-role-chip-${y}');if(inp&&inp.value.trim())setBrdRole('${c}',inp.value.trim())})()">\uC124\uC815</button>
    </div>
    ${n!=="\uBB34\uC18C\uC18D"?`<button onclick="const p=players.find(x=>x.name==='${c}');if(p){const from=p.univ;p.univ='\uBB34\uC18C\uC18D';delete p.role;if(boardPlayerOrder[from])boardPlayerOrder[from]=boardPlayerOrder[from].filter(n=>n!=='${c}');save();_brdClose();_refreshBoardCard(from);_refreshBoardCard('\uBB34\uC18C\uC18D');_brdToast('\u{1F6B6} \uBB34\uC18C\uC18D\uC73C\uB85C \uC774\uB3D9 \uC644\uB8CC');}" style="width:calc(100% - 12px);margin:0 6px 6px;padding:5px;border-radius:6px;border:1.5px solid #cbd5e1;background:#f8fafc;font-size:11px;font-weight:700;cursor:pointer;color:#475569">\u{1F6B6} \uBB34\uC18C\uC18D\uC73C\uB85C \uC774\uB3D9</button>`:""}
    <div class="brd-move-popup-sep"></div>
    <div style="padding:4px 6px 2px;font-size:11px;font-weight:700;color:var(--text3)">\u2B50 \uD2F0\uC5B4</div>
    <div style="display:flex;align-items:center;gap:5px;padding:3px 6px 8px">
      <button onclick="${h?`setBrdTier('${c}','${h}')`:"void 0"}" ${h?"":"disabled"} style="padding:3px 10px;border-radius:6px;border:1px solid var(--border2);background:var(--surface);font-size:12px;font-weight:700;cursor:pointer;opacity:${h?"1":".3"}">\u25B2</button>
      <span style="flex:1;text-align:center;font-size:13px;font-weight:800;color:var(--text)">${i.tier||"\uBBF8\uC815"}</span>
      <button onclick="${C?`setBrdTier('${c}','${C}')`:"void 0"}" ${C?"":"disabled"} style="padding:3px 10px;border-radius:6px;border:1px solid var(--border2);background:var(--surface);font-size:12px;font-weight:700;cursor:pointer;opacity:${C?"1":".3"}">\u25BC</button>
    </div>
    <div class="brd-move-popup-sep"></div>
    <div style="padding:4px 6px 6px;font-size:11px;font-weight:700;color:var(--text3)">\u{1F3EB} \uB2E4\uB978 \uB300\uD559\uC73C\uB85C \uC774\uB3D9</div>
    <div style="display:flex;gap:6px;padding:0 6px 6px">
      <select id="brd-chip-univ-target" style="flex:1;padding:5px 8px;border-radius:7px;border:1px solid var(--border2);font-size:12px;background:var(--white)">${u||"<option disabled>\uB300\uD559 \uC5C6\uC74C</option>"}</select>
      <button class="btn btn-b btn-xs" onclick="boardTransferPlayerFromChip('${c}','${M}')">\uC774\uB3D9</button>
    </div>
    <div class="brd-move-popup-sep"></div>
    <div style="padding:4px 6px 6px">
      <div style="font-size:10px;font-weight:700;color:var(--text3);margin-bottom:4px">\u{1F5BC}\uFE0F \uD504\uB85C\uD544 \uC774\uBBF8\uC9C0</div>
      <div style="display:flex;gap:4px">
        <input id="brd-photo-chip-${y}" type="text" placeholder="\uC774\uBBF8\uC9C0 URL \uC785\uB825..." value="${(i.photo||"").replace(/"/g,"&quot;")}" style="flex:1;padding:3px 7px;border-radius:6px;border:1px solid var(--border2);font-size:11px">
        <button class="btn btn-b btn-xs" onclick="setBrdPhoto('${c}',document.getElementById('brd-photo-chip-${y}').value)">\uC800\uC7A5</button>
      </div>
      ${i.photo?`<button onclick="setBrdPhoto('${c}','')" style="margin-top:3px;width:100%;padding:2px;border-radius:5px;border:1px solid #fca5a5;background:#fff1f2;font-size:10px;font-weight:700;cursor:pointer;color:#dc2626">\u{1F5D1}\uFE0F \uC774\uBBF8\uC9C0 \uC0AD\uC81C</button>`:""}
    </div>
    <div class="brd-move-popup-sep"></div>
    <div style="padding:4px 6px 6px">
      <div style="font-size:10px;font-weight:700;color:var(--text3);margin-bottom:5px">\u{1F527} \uC0C1\uD0DC</div>
      <div style="display:flex;gap:4px">
        <button onclick="(function(){const p=players.find(x=>x.name==='${c}');if(!p)return;p.retired=!p.retired;save();_brdClose();render();_brdToast(p.retired?'\u{1F397}\uFE0F \uC740\uD1F4 \uCC98\uB9AC\uB428':'\u21A9\uFE0F \uC740\uD1F4 \uD574\uC81C\uB428');})()" style="flex:1;padding:5px;border-radius:6px;border:1.5px solid ${i.retired?"#6b7280":"#e2e8f0"};background:${i.retired?"#f1f5f9":"var(--white)"};font-size:11px;font-weight:700;cursor:pointer;color:${i.retired?"#374151":"#64748b"}">\u{1F397}\uFE0F ${i.retired?"\uC740\uD1F4 \uD574\uC81C":"\uC740\uD1F4"}</button>
        <button onclick="(function(){const p=players.find(x=>x.name==='${c}');if(!p)return;p.hidden=!p.hidden;save();_brdClose();render();_brdToast(p.hidden?'\u{1F6AB} \uD604\uD669\uD310\uC5D0\uC11C \uC228\uAE40':'\u{1F441}\uFE0F \uD604\uD669\uD310\uC5D0 \uD45C\uC2DC\uB428');})()" style="flex:1;padding:5px;border-radius:6px;border:1.5px solid ${i.hidden?"#f87171":"#e2e8f0"};background:${i.hidden?"#fff1f2":"var(--white)"};font-size:11px;font-weight:700;cursor:pointer;color:${i.hidden?"#dc2626":"#64748b"}">\u{1F6AB} ${i.hidden?"\uC228\uAE40 \uD574\uC81C":"\uD604\uD669\uD310 \uC228\uAE30\uAE30"}</button>
      </div>
    </div>
    <button class="brd-move-popup-btn" onclick="_brdClose();openPlayerModal('${c}')">\u{1F464} \uC2A4\uD2B8\uB9AC\uBA38 \uC0C1\uC138 \uBCF4\uAE30</button>
  `,document.body.appendChild(l),window.innerWidth<=768){const b=document.createElement("div");b.id="brd-popup-dim",b.style.cssText="position:fixed;inset:0;background:rgba(15,23,42,.45);z-index:4999;backdrop-filter:blur(2px)",b.onclick=()=>{b.remove(),_brdClose()},document.body.insertBefore(b,l),l.style.zIndex="5000"}else{const b=e.target.closest(".brd-chip"),s=(b==null?void 0:b.getBoundingClientRect())||{left:e.clientX,top:e.clientY,width:0,height:0};let x=s.right+6,$=s.top;const _=240,P=300;x+_>window.innerWidth&&(x=s.left-_-6),$+P>window.innerHeight&&($=window.innerHeight-P-10),$<8&&($=8),l.style.left=x+"px",l.style.top=$+"px"}}function boardTransferPlayerFromChip(e,r){if(!_boardCanManage()){alert("\uCD1D\uAD00\uB9AC\uC790\uB9CC \uC774\uB3D9\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.");return}const n=document.getElementById("brd-chip-univ-target"),t=n==null?void 0:n.value;if(!t||t===r){alert("\uC774\uB3D9\uD560 \uB300\uD559\uC744 \uC120\uD0DD\uD558\uC138\uC694.");return}_brdClose();const a=players.find(d=>d.name===e);a&&confirm(`"${e}"\uC744(\uB97C) "${r}" \u2192 "${t}"\uB85C \uC774\uB3D9\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?`)&&(a.prevUniv=r,a.transferDate=new Date().toISOString().slice(0,10),a.univ=t,boardPlayerOrder[r]&&(boardPlayerOrder[r]=boardPlayerOrder[r].filter(d=>d!==e)),save(),saveBoardPlayerOrder(),_refreshBoardCard(r),_refreshBoardCard(t),_brdToast(`\u2705 "${e}" \u2192 "${t}" \uC774\uB3D9 \uC644\uB8CC`))}function openBrdPlayerPopup(e,r,n,t,a){if(!_boardCanManage()){openRandomPlayerModal();return}e.stopPropagation(),_brdClose();const d=_getBoardUnivs(),i=players.find(s=>s.name===r);if(!i)return;const l=document.createElement("div");l.className="brd-move-popup",_brdPopup=l;const u=d.filter(s=>s.name!==n&&!s.dissolved).map(s=>`<option value="${s.name}">${s.name}</option>`).join(""),y=r.replace(/[^a-zA-Z0-9가-힣]/g,""),c=typeof escJS=="function"?escJS(r):String(r||"").replace(/\\/g,"\\\\").replace(/'/g,"\\'").replace(/\r/g,"\\r").replace(/\n/g,"\\n"),M=typeof escJS=="function"?escJS(n):String(n||"").replace(/\\/g,"\\\\").replace(/'/g,"\\'").replace(/\r/g,"\\r").replace(/\n/g,"\\n"),L=typeof window.escHTML=="function"?window.escHTML(r):String(r||""),E=typeof window.escHTML=="function"?window.escHTML(n):String(n||""),w=getStatusIcon(r),h=TIERS.indexOf(i.tier||"\uBBF8\uC815"),C=h>0?TIERS[h-1]:null,z=h<TIERS.length-1?TIERS[h+1]:null;if(l.innerHTML=`
    <div style="padding:8px 10px 6px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;gap:6px">
      <div style="font-size:12px;font-weight:800;color:var(--text)">\u{1F464} ${L} <span style="font-size:10px;font-weight:500;color:var(--text3)">(${E})</span></div>
      <button onclick="_brdClose()" style="background:none;border:none;color:var(--gray-l);font-size:14px;cursor:pointer;padding:0 2px;line-height:1">\u2715</button>
    </div>
    <div style="display:flex;gap:4px;padding:6px 8px;border-bottom:1px solid var(--border)">
      <button onclick="boardMovePlayer('${c}','${M}','top')" title="\uB9E8 \uC704\uB85C" ${t===0?"disabled":""} style="flex:1;padding:4px;border-radius:6px;border:1px solid var(--border2);background:var(--surface);font-size:16px;cursor:pointer;opacity:${t===0?".3":"1"}">\u2B06\uFE0F</button>
      <button onclick="boardMovePlayer('${c}','${M}','up')" title="\uC704\uB85C" ${t===0?"disabled":""} style="flex:1;padding:4px;border-radius:6px;border:1px solid var(--border2);background:var(--surface);font-size:16px;cursor:pointer;opacity:${t===0?".3":"1"}">\u{1F53C}</button>
      <button onclick="boardMovePlayer('${c}','${M}','down')" title="\uC544\uB798\uB85C" ${t>=a-1?"disabled":""} style="flex:1;padding:4px;border-radius:6px;border:1px solid var(--border2);background:var(--surface);font-size:16px;cursor:pointer;opacity:${t>=a-1?".3":"1"}">\u{1F53D}</button>
      <button onclick="boardMovePlayer('${c}','${M}','bottom')" title="\uB9E8 \uC544\uB798\uB85C" ${t>=a-1?"disabled":""} style="flex:1;padding:4px;border-radius:6px;border:1px solid var(--border2);background:var(--surface);font-size:16px;cursor:pointer;opacity:${t>=a-1?".3":"1"}">\u2B07\uFE0F</button>
    </div>
    <div style="padding:5px 8px;border-bottom:1px solid var(--border)">
      <div style="font-size:10px;font-weight:700;color:var(--text3);margin-bottom:4px">\u{1F3F7}\uFE0F \uC9C1\uCC45</div>
      <div style="display:flex;gap:3px;flex-wrap:wrap">
        ${["\uC774\uC0AC\uC7A5","\uB3D9\uC544\uB9AC \uD68C\uC7A5","\uCD1D\uC7A5","\uCD1D\uAD04","\uAD50\uC218","\uCF54\uCE58"].map(s=>`<button class="btn btn-xs ${i.role===s?"btn-b":"btn-w"}" onclick="setBrdRole('${c}','${s}')" style="font-size:10px;padding:2px 7px">${s}</button>`).join("")}
        <button class="btn btn-xs btn-w" onclick="setBrdRole('${c}','')" style="font-size:10px;padding:2px 7px;color:#dc2626">\uD574\uC81C</button>
      </div>
      <div style="display:flex;gap:4px;margin-top:4px">
        <input id="brd-role-custom-${y}" type="text" placeholder="\uC9C1\uC811 \uC785\uB825..." style="flex:1;padding:3px 7px;border-radius:6px;border:1px solid var(--border2);font-size:11px">
        <button class="btn btn-b btn-xs" onclick="(function(){const inp=document.getElementById('brd-role-custom-${y}');if(inp&&inp.value.trim())setBrdRole('${c}',inp.value.trim())})()" style="font-size:11px">\uC124\uC815</button>
      </div>
      ${n!=="\uBB34\uC18C\uC18D"?`<button onclick="const p=players.find(x=>x.name==='${c}');if(p){const from=p.univ;p.univ='\uBB34\uC18C\uC18D';delete p.role;if(boardPlayerOrder[from])boardPlayerOrder[from]=boardPlayerOrder[from].filter(n=>n!=='${c}');save();_brdClose();_refreshBoardCard(from);_refreshBoardCard('\uBB34\uC18C\uC18D');_brdToast('\u{1F6B6} \uBB34\uC18C\uC18D\uC73C\uB85C \uC774\uB3D9 \uC644\uB8CC');}" style="width:100%;margin-top:5px;padding:4px;border-radius:6px;border:1.5px solid #cbd5e1;background:#f8fafc;font-size:11px;font-weight:700;cursor:pointer;color:#475569">\u{1F6B6} \uBB34\uC18C\uC18D\uC73C\uB85C \uC774\uB3D9</button>`:""}
    </div>
    <div style="padding:5px 8px;border-bottom:1px solid var(--border)">
      <div style="font-size:10px;font-weight:700;color:var(--text3);margin-bottom:4px">\u2B50 \uD2F0\uC5B4</div>
      <div style="display:flex;align-items:center;gap:5px">
        <button onclick="${C?`setBrdTier('${c}','${C}')`:"void 0"}" ${C?"":"disabled"} style="padding:3px 10px;border-radius:6px;border:1px solid var(--border2);background:var(--surface);font-size:12px;font-weight:700;cursor:pointer;opacity:${C?"1":".3"}">\u25B2</button>
        <span style="flex:1;text-align:center;font-size:13px;font-weight:800;color:var(--text)">${i.tier||"\uBBF8\uC815"}</span>
        <button onclick="${z?`setBrdTier('${c}','${z}')`:"void 0"}" ${z?"":"disabled"} style="padding:3px 10px;border-radius:6px;border:1px solid var(--border2);background:var(--surface);font-size:12px;font-weight:700;cursor:pointer;opacity:${z?"1":".3"}">\u25BC</button>
      </div>
    </div>
    <div style="padding:5px 8px;border-bottom:1px solid var(--border)">
      <div style="font-size:10px;font-weight:700;color:var(--text3);margin-bottom:4px">\u{1F3AD} \uC0C1\uD0DC \uC544\uC774\uCF58</div>
      <div style="display:flex;flex-wrap:wrap;gap:3px" id="brd-icon-grid-${y}">
        ${Object.entries(STATUS_ICON_DEFS).map(([s,x])=>{const $=s==="none"&&!w||x.emoji&&w===x.emoji,_=x.emoji?_siIsImg(x.emoji)?_siRender(x.emoji,"16px"):x.emoji:'<span style="font-size:10px">\uC5C6\uC74C</span>';return`<button type="button" title="${x.label}" onclick="setBrdStatusIcon(this,'${c}','${s}')" data-icon-id="${s}" style="padding:3px 6px;border-radius:5px;border:2px solid ${$?"#16a34a":"var(--border)"};background:${$?"#dcfce7":"var(--white)"};cursor:pointer;font-size:${s==="none"?"10px":"13px"};min-width:28px;transition:.1s;display:inline-flex;align-items:center;justify-content:center">${_}</button>`}).join("")}
      </div>
      <div style="display:flex;gap:3px;margin-top:5px;align-items:center">
        <input id="brd-si-url-${y}" type="text" placeholder="\u{1F517} \uC774\uBBF8\uC9C0 URL \uC785\uB825" style="flex:1;padding:3px 7px;border-radius:5px;border:1px solid var(--border2);font-size:11px" oninput="_brdSiPreview('${y}',this.value)">
        <span id="brd-si-prev-${y}" style="width:22px;height:22px;display:inline-flex;align-items:center;justify-content:center;border:1px solid var(--border);border-radius:5px;background:var(--white);font-size:14px;flex-shrink:0"></span>
        <button class="btn btn-b btn-xs" onclick="_brdAddCustomIcon('${y}','${c}')">\uCD94\uAC00</button>
      </div>
    </div>
    <div style="padding:5px 8px;border-bottom:1px solid var(--border)">
      <div style="font-size:10px;font-weight:700;color:var(--text3);margin-bottom:4px">\u{1F5BC}\uFE0F \uD504\uB85C\uD544 \uC774\uBBF8\uC9C0</div>
      <div style="display:flex;gap:4px">
        <input id="brd-photo-${y}" type="text" placeholder="\uC774\uBBF8\uC9C0 URL \uC785\uB825..." value="${(i.photo||"").replace(/"/g,"&quot;")}" style="flex:1;padding:3px 7px;border-radius:6px;border:1px solid var(--border2);font-size:11px">
        <button class="btn btn-b btn-xs" onclick="setBrdPhoto('${c}',document.getElementById('brd-photo-${y}').value)">\uC800\uC7A5</button>
      </div>
      ${i.photo?`<button onclick="setBrdPhoto('${c}','')" style="margin-top:3px;width:100%;padding:2px;border-radius:5px;border:1px solid #fca5a5;background:#fff1f2;font-size:10px;font-weight:700;cursor:pointer;color:#dc2626">\u{1F5D1}\uFE0F \uC774\uBBF8\uC9C0 \uC0AD\uC81C</button>`:""}
    </div>
    <div style="padding:5px 8px;border-bottom:1px solid var(--border)">
      <div style="font-size:10px;font-weight:700;color:var(--text3);margin-bottom:4px">\u{1F3EB} \uB300\uD559 \uC774\uB3D9</div>
      <div style="display:flex;gap:4px">
        <select id="brd-univ-target" style="flex:1;padding:4px 8px;border-radius:6px;border:1px solid var(--border2);font-size:12px;background:var(--white)">${u||"<option disabled>\uB300\uD559 \uC5C6\uC74C</option>"}</select>
        <button class="btn btn-b btn-xs" onclick="boardTransferPlayer('${c}','${M}')">\uC774\uB3D9</button>
      </div>
    </div>
    <div style="padding:5px 8px;border-bottom:1px solid var(--border)">
      <div style="font-size:10px;font-weight:700;color:var(--text3);margin-bottom:5px">\u{1F527} \uC0C1\uD0DC</div>
      <div style="display:flex;gap:4px">
        <button onclick="(function(){const p=players.find(x=>x.name==='${c}');if(!p)return;p.retired=!p.retired;save();_brdClose();render();_brdToast(p.retired?'\u{1F397}\uFE0F \uC740\uD1F4 \uCC98\uB9AC\uB428':'\u21A9\uFE0F \uC740\uD1F4 \uD574\uC81C\uB428');})()" style="flex:1;padding:5px;border-radius:6px;border:1.5px solid ${i.retired?"#6b7280":"#e2e8f0"};background:${i.retired?"#f1f5f9":"var(--white)"};font-size:11px;font-weight:700;cursor:pointer;color:${i.retired?"#374151":"#64748b"}">\u{1F397}\uFE0F ${i.retired?"\uC740\uD1F4 \uD574\uC81C":"\uC740\uD1F4"}</button>
        <button onclick="(function(){const p=players.find(x=>x.name==='${c}');if(!p)return;p.hidden=!p.hidden;save();_brdClose();render();_brdToast(p.hidden?'\u{1F6AB} \uD604\uD669\uD310\uC5D0\uC11C \uC228\uAE40':'\u{1F441}\uFE0F \uD604\uD669\uD310\uC5D0 \uD45C\uC2DC\uB428');})()" style="flex:1;padding:5px;border-radius:6px;border:1.5px solid ${i.hidden?"#f87171":"#e2e8f0"};background:${i.hidden?"#fff1f2":"var(--white)"};font-size:11px;font-weight:700;cursor:pointer;color:${i.hidden?"#dc2626":"#64748b"}">\u{1F6AB} ${i.hidden?"\uC228\uAE40 \uD574\uC81C":"\uD604\uD669\uD310 \uC228\uAE30\uAE30"}</button>
      </div>
    </div>
    <div style="display:flex;gap:4px;padding:6px 8px">
      <button style="flex:1;padding:6px;border-radius:7px;border:none;background:#2563eb;color:#fff;font-size:11px;font-weight:800;cursor:pointer;font-family:'Noto Sans KR',sans-serif" onclick="_brdClose();_refreshBoardCard('${M}');save();_brdToast('\u2705 \uC800\uC7A5 \uC644\uB8CC')">\u{1F4BE} \uC800\uC7A5</button>
      <button style="flex:1;padding:6px;border-radius:7px;border:1px solid var(--border2);background:var(--surface);color:var(--text);font-size:11px;font-weight:600;cursor:pointer;font-family:'Noto Sans KR',sans-serif" onclick="_brdClose();openPlayerModal('${c}')">\u{1F4CB} \uC0C1\uC138</button>
    </div>
  `,document.body.appendChild(l),window.innerWidth<=768){const s=document.createElement("div");s.id="brd-popup-dim",s.style.cssText="position:fixed;inset:0;background:rgba(15,23,42,.45);z-index:4999;backdrop-filter:blur(2px)",s.onclick=()=>{s.remove(),_brdClose()},document.body.insertBefore(s,l),l.style.zIndex="5000"}else{const s=e.target.closest(".brd-row, .brd-chip"),x=(s==null?void 0:s.getBoundingClientRect())||{left:e.clientX,top:e.clientY,width:0,height:0};let $=x.left+x.width+6,_=x.top;const P=256,O=420;$+P>window.innerWidth&&($=x.left-P-6),_+O>window.innerHeight&&(_=window.innerHeight-O-10),_<8&&(_=8),l.style.left=$+"px",l.style.top=_+"px"}}function setBrdTier(e,r){const n=players.find(t=>t.name===e);n&&(n.tier=r,save(),_brdClose(),_refreshBoardCard(n.univ),_brdToast("\u2B50 \uD2F0\uC5B4 \uBCC0\uACBD: "+r))}function setBrdRole(e,r){const n=players.find(t=>t.name===e);n&&(n.role=r||void 0,boardPlayerOrder[n.univ]&&(delete boardPlayerOrder[n.univ],saveBoardPlayerOrder()),save(),_brdClose(),_refreshBoardCard(n.univ))}function setBrdPhoto(e,r){const n=players.find(a=>a.name===e);if(!n)return;const t=r.trim();t?n.photo=t:delete n.photo,_brdPhotoCacheSet(e,t),save(),_refreshBoardCard(n.univ),_brdToast(t?"\u{1F5BC}\uFE0F \uD504\uB85C\uD544 \uC774\uBBF8\uC9C0 \uC800\uC7A5 \uC644\uB8CC":"\u{1F5D1}\uFE0F \uD504\uB85C\uD544 \uC774\uBBF8\uC9C0 \uC0AD\uC81C")}function _brdSiPreview(e,r){const n=document.getElementById("brd-si-prev-"+e);n&&(n.innerHTML=r&&(r.startsWith("http")||r.startsWith("data:"))?`<img src="${r}" style="width:18px;height:18px;object-fit:contain" onerror="this.style.display='none'">`:r)}function _brdAddCustomIcon(e,r){const n=document.getElementById("brd-si-url-"+e);if(!n||!n.value.trim())return;const t=typeof escJS=="function"?escJS(r):String(r||"").replace(/\\/g,"\\\\").replace(/'/g,"\\'").replace(/\r/g,"\\r").replace(/\n/g,"\\n");addCustomStatusIcon("\uCEE4\uC2A4\uD140",n.value.trim()),n.value="";const a=document.getElementById("brd-si-prev-"+e);a&&(a.innerHTML="");const d=document.getElementById("brd-icon-grid-"+e);if(!d)return;const i=playerStatusIcons[r]||"";d.innerHTML=Object.entries(STATUS_ICON_DEFS).map(([l,T])=>{const u=l==="none"&&!i||T.emoji&&i===T.emoji,y=T.emoji?_siIsImg(T.emoji)?_siRender(T.emoji,"16px"):T.emoji:'<span style="font-size:10px">\uC5C6\uC74C</span>';return`<button type="button" title="${T.label}" onclick="setBrdStatusIcon(this,'${t}','${l}')" data-icon-id="${l}" style="padding:3px 6px;border-radius:5px;border:2px solid ${u?"#16a34a":"var(--border)"};background:${u?"#dcfce7":"var(--white)"};cursor:pointer;font-size:${l==="none"?"10px":"13px"};min-width:28px;transition:.1s;display:inline-flex;align-items:center;justify-content:center">${y}</button>`}).join("")}function setBrdStatusIcon(e,r,n){setStatusIcon(r,n);const t=e.closest('[id^="brd-icon-grid-"]');t&&t.querySelectorAll("button[data-icon-id]").forEach(d=>{const i=d.dataset.iconId===n;d.style.border="2px solid "+(i?"#16a34a":"var(--border)"),d.style.background=i?"#dcfce7":"var(--white)"});const a=players.find(d=>d.name===r);a&&_refreshBoardCard(a.univ)}function boardMovePlayer(e,r,n){if(!_boardCanManage())return;_brdClose();const t=_getBoardPlayers(r),a=t.findIndex(l=>l.name===e);if(a<0)return;const d=t.map(l=>l.name);let i=a;n==="up"?i=Math.max(0,a-1):n==="down"?i=Math.min(d.length-1,a+1):n==="top"?i=0:n==="bottom"&&(i=d.length-1),i!==a&&(d.splice(a,1),d.splice(i,0,e),boardPlayerOrder[r]=d,saveBoardPlayerOrder(),clearTimeout(window._bpoSaveTm),window._bpoSaveTm=setTimeout(()=>{typeof save=="function"&&save()},1500),_refreshBoardCard(r))}function boardTransferPlayer(e,r){if(!_boardCanManage()){alert("\uCD1D\uAD00\uB9AC\uC790\uB9CC \uC774\uB3D9\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.");return}const n=document.getElementById("brd-univ-target"),t=n==null?void 0:n.value;if(!t||t===r){alert("\uC774\uB3D9\uD560 \uB300\uD559\uC744 \uC120\uD0DD\uD558\uC138\uC694.");return}_brdClose();const a=players.find(i=>i.name===e);if(!a||!confirm(`"${e}"\uC744(\uB97C) "${r}" \u2192 "${t}"\uB85C \uC774\uB3D9\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?

\uC2A4\uD2B8\uB9AC\uBA38 \uBAA9\uB85D\xB7\uD2F0\uC5B4 \uC21C\uC704\uD45C\xB7\uC2A4\uD2B8\uB9AC\uBA38 \uC0C1\uC138\xB7\uB300\uD559 \uC0C1\uC138\uAC00 \uBAA8\uB450 \uC790\uB3D9 \uBC18\uC601\uB429\uB2C8\uB2E4.`))return;a.prevUniv=r,a.transferDate=new Date().toISOString().slice(0,10),a.univ=t,boardPlayerOrder[r]&&(boardPlayerOrder[r]=boardPlayerOrder[r].filter(i=>i!==e)),save(),saveBoardPlayerOrder(),_refreshBoardCard(r),_refreshBoardCard(t);const d=document.getElementById("playerModal");if(d&&d.style.display!=="none"){const i=d.querySelector(".brd-univ-name-btn, [data-player-name]");d.innerHTML&&d.innerHTML.includes(e)&&openPlayerModal(e)}_brdToast(`\u2705 "${e}" \u2192 "${t}" \uC774\uB3D9 \uC644\uB8CC`)}function _refreshBoardCard(e){const r=document.getElementById("board-wrap");if(!r){render();return}const n=getAllUnivs().find(l=>l.name===e),t=_findBrdCardByUniv(e,r);if(!n||!players.some(l=>l.univ===e)){t&&t.remove();return}const a=buildUnivBoardCard(n);if(!a){t&&t.remove();return}const d=document.createElement("div");d.innerHTML=a;const i=d.firstElementChild;t?t.replaceWith(i):r.appendChild(i),injectUnivIcons(i),initBoardDragCard(i,r),_boardCanManage()&&i.querySelectorAll(".brd-body").forEach(l=>initBoardPlayerDrag(l))}function boardCardMove(e,r){if(!_boardCanManage())return;const n=document.getElementById("board-wrap");if(!n)return;const t=[...n.querySelectorAll(".brd-card")],a=t.findIndex(l=>l.dataset.univ===e);if(a<0)return;let d;if(r==="left"?d=a-1:d=a+1,d<0||d>=t.length)return;const i=t[d];r==="left"?i.before(t[a]):i.after(t[a]),boardOrder=[...n.querySelectorAll(".brd-card")].map(l=>l.dataset.univ),save(),syncBoardOrderToUnivCfg(),t[a].style.outline="3px solid rgba(255,255,255,.9)",setTimeout(()=>{t[a].style.outline=""},500)}

/* cloud-board-drag.js */
var R=Object.defineProperty,q=Object.defineProperties;var B=Object.getOwnPropertyDescriptors;var U=Object.getOwnPropertySymbols;var D=Object.prototype.hasOwnProperty,H=Object.prototype.propertyIsEnumerable;var P=(e,l,t)=>l in e?R(e,l,{enumerable:!0,configurable:!0,writable:!0,value:t}):e[l]=t,L=(e,l)=>{for(var t in l||(l={}))D.call(l,t)&&P(e,t,l[t]);if(U)for(var t of U(l))H.call(l,t)&&P(e,t,l[t]);return e},T=(e,l)=>q(e,B(l));function initBoardDrag(){const e=document.getElementById("board-wrap");e&&(e.querySelectorAll(".brd-card").forEach(l=>initBoardDragCard(l,e)),_boardCanManage()&&e.querySelectorAll(".brd-body").forEach(l=>initBoardPlayerDrag(l)))}let _brdDragSrc=null,_brdRowDragSrc=null;function initBoardDragCard(e,l){e.addEventListener("dragover",t=>{_brdRowDragSrc||_brdDragSrc&&(t.preventDefault(),t.dataTransfer.dropEffect="move",_brdDragSrc!==e&&(l.querySelectorAll(".brd-card").forEach(c=>c.classList.remove("drag-over")),e.classList.add("drag-over")))}),e.addEventListener("dragleave",t=>{t.currentTarget.contains(t.relatedTarget)||e.classList.remove("drag-over")}),e.addEventListener("drop",t=>{if(!_brdRowDragSrc){if(t.preventDefault(),_brdDragSrc&&_brdDragSrc!==e){const c=[...l.querySelectorAll(".brd-card")],i=c.indexOf(_brdDragSrc),n=c.indexOf(e);i<n?e.after(_brdDragSrc):e.before(_brdDragSrc)}e.classList.remove("drag-over")}})}function initBoardPlayerDrag(e){if(!_boardCanManage())return;const l=()=>{var t,c;return((c=(t=e.closest(".brd-card"))==null?void 0:t.dataset)==null?void 0:c.univ)||""};e.addEventListener("dragover",t=>{_brdRowDragSrc&&(t.preventDefault(),t.stopPropagation(),t.dataTransfer.dropEffect="move",e.style.outline="2px dashed rgba(255,255,255,.6)")}),e.addEventListener("dragleave",t=>{e.contains(t.relatedTarget)||(e.style.outline="")}),e.addEventListener("drop",t=>{if(e.style.outline="",!_brdRowDragSrc)return;const c=l(),i=_brdRowDragSrc.dataset.univ,n=_brdRowDragSrc.dataset.player;if(c&&c!==i){if(t.preventDefault(),t.stopPropagation(),!confirm(`"${n}"\uC744(\uB97C) "${i}" \u2192 "${c}"\uB85C \uC774\uB3D9\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?`))return;const u=players.find(r=>r.name===n);if(!u)return;u.prevUniv=i,u.transferDate=new Date().toISOString().slice(0,10),u.univ=c,boardPlayerOrder[i]&&(boardPlayerOrder[i]=boardPlayerOrder[i].filter(r=>r!==n)),save(),saveBoardPlayerOrder(),_refreshBoardCard(i),_refreshBoardCard(c),_brdToast(`\u2705 "${n}" \u2192 "${c}" \uC774\uB3D9 \uC644\uB8CC`)}}),e.querySelectorAll(".brd-row[data-player], .brd-chip[data-player]").forEach(t=>{t.addEventListener("dragstart",c=>{c.stopPropagation(),_brdRowDragSrc=t,t.style.opacity=".45",c.dataTransfer.effectAllowed="move",c.dataTransfer.setData("text/player",t.dataset.player+"|"+t.dataset.univ)}),t.addEventListener("dragend",c=>{t.style.opacity="",document.querySelectorAll(".brd-row, .brd-chip").forEach(i=>i.style.outline=""),document.querySelectorAll(".brd-body").forEach(i=>i.style.outline=""),_brdRowDragSrc=null}),t.addEventListener("dragover",c=>{_brdRowDragSrc&&(c.preventDefault(),c.stopPropagation(),c.dataTransfer.dropEffect="move",_brdRowDragSrc!==t&&(e.querySelectorAll(".brd-row, .brd-chip").forEach(i=>i.style.outline=""),t.style.outline="2px solid rgba(255,255,255,.85)"))}),t.addEventListener("dragleave",c=>{t.style.outline=""}),t.addEventListener("drop",c=>{if(c.preventDefault(),c.stopPropagation(),t.style.outline="",!_brdRowDragSrc||_brdRowDragSrc===t)return;const i=t.dataset.univ,n=_brdRowDragSrc.dataset.univ;if(i!==n){const a=_brdRowDragSrc.dataset.player;if(!confirm(`"${a}"\uC744(\uB97C) "${n}" \u2192 "${i}"\uB85C \uC774\uB3D9\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?`))return;const w=players.find(y=>y.name===a);if(!w)return;w.prevUniv=n,w.transferDate=new Date().toISOString().slice(0,10),w.univ=i,boardPlayerOrder[n]&&(boardPlayerOrder[n]=boardPlayerOrder[n].filter(y=>y!==a));const g=(boardPlayerOrder[i]||[]).indexOf(t.dataset.player);boardPlayerOrder[i]||(boardPlayerOrder[i]=_getBoardPlayers(i).map(y=>y.name)),g>=0?boardPlayerOrder[i].splice(g,0,a):boardPlayerOrder[i].push(a),save(),saveBoardPlayerOrder(),_refreshBoardCard(n),_refreshBoardCard(i),_brdToast(`\u2705 "${a}" \u2192 "${i}" \uC774\uB3D9 \uC644\uB8CC`);return}const u=[...e.querySelectorAll(".brd-row[data-player], .brd-chip[data-player]")],r=u.indexOf(_brdRowDragSrc),s=u.indexOf(t);if(r>=0&&s>=0&&r!==s){r<s?t.after(_brdRowDragSrc):t.before(_brdRowDragSrc);const a=[...e.querySelectorAll(".brd-row[data-player], .brd-chip[data-player]")].map(w=>w.dataset.player);boardPlayerOrder[i]=a,saveBoardPlayerOrder()}})})}const _imgDataUrlCache=window._imgDataUrlCache=window._imgDataUrlCache||{},_imgDataUrlInflight=window._imgDataUrlInflight=window._imgDataUrlInflight||{},_imgDataUrlCacheOrder=window._imgDataUrlCacheOrder=window._imgDataUrlCacheOrder||[];async function _imgToDataUrls(e,l=8e3,t){const c=[...e.querySelectorAll("img")],i=20;let n=0,u=0;const r=h=>String(h||"").replace(/^https?:\/\//i,""),s=h=>{const m=String(h||"");return m+(m.includes("?")?"&":"?")+"_x="+Date.now()},a={};async function w(h){return await new Promise(m=>{if(!h||typeof h!="object"){m();return}let o=h.getAttribute("src")||"";if(!o||o.startsWith("data:")||o.startsWith("blob:")){m();return}try{if(typeof toHttpsUrl=="function"){const p=toHttpsUrl(o);if(p&&p!==o){o=p;try{h.setAttribute("src",p)}catch(v){}}}}catch(p){}try{const p=_imgDataUrlCache[o];if(p&&typeof p=="string"&&p.startsWith("data:image/")){h.src=p,m();return}}catch(p){}if(a[o]){a[o].then(p=>{if(p)try{h.src=p}catch(v){}m()}).catch(()=>m());return}let f=!1,d;const b=new Promise(p=>{d=p});a[o]=b;const x=p=>{if(!f){f=!0;try{d(p||null)}catch(v){}try{delete a[o]}catch(v){}m()}},_=setTimeout(()=>{x(null)},l),I=[o],W=[s(o),"https://images.weserv.nl/?url="+encodeURIComponent(r(o))+"&n=-1&cb="+Date.now()];let O=0;const S=()=>{if(f)return;let p;if(O===0?p=I[O++]:p=W[O-1]||null,!p){clearTimeout(_),x(null);return}const v=new Image;v.crossOrigin="anonymous",v.onload=()=>{if(!f){if(!v.naturalWidth||!v.naturalHeight){O===0?S():x(null);return}try{const k=document.createElement("canvas");if(!k){S();return}k.width=v.naturalWidth,k.height=v.naturalHeight;const A=k.getContext("2d");if(!A){S();return}A.drawImage(v,0,0);const C=(()=>{try{const E=document.createElement("canvas");return E?E.toDataURL("image/webp").startsWith("data:image/webp"):!1}catch(E){return!1}})()?k.toDataURL("image/webp",.75):k.toDataURL("image/jpeg",.75);if(!C||C==="data:,"){S();return}h&&typeof h=="object"&&(h.src=C);try{if(_imgDataUrlCache[o]||_imgDataUrlCacheOrder.push(o),_imgDataUrlCache[o]=C,_imgDataUrlCacheOrder.length>1e3){const E=_imgDataUrlCacheOrder.shift();E&&delete _imgDataUrlCache[E]}}catch(E){}clearTimeout(_),x(C)}catch(k){S()}}},v.onerror=()=>{S()},v.src=p};S()})}async function g(){for(;;){const h=n++;if(h>=c.length)break;try{await w(c[h])}catch(m){}if(u++,typeof t=="function")try{t(u,c.length)}catch(m){}}}const y=Array.from({length:Math.min(i,c.length)},()=>g());await Promise.all(y)}async function _precacheImgDataUrl(e,l){const t=String(e||"");if(!t)return!1;if(_imgDataUrlCache[t]&&String(_imgDataUrlCache[t]).startsWith("data:image/"))return!0;if(_imgDataUrlInflight[t])return await _imgDataUrlInflight[t];const c=u=>String(u||"").replace(/^https?:\/\//i,""),i=u=>{const r=String(u||"");return r+(r.includes("?")?"&":"?")+"_x="+Date.now()},n=new Promise(u=>{let r=t;try{if(typeof toHttpsUrl=="function"){const m=toHttpsUrl(r);m&&(r=m)}}catch(m){}if(_imgDataUrlCache[r]&&String(_imgDataUrlCache[r]).startsWith("data:image/")){u(!0);return}const s=[];s.push(i(r)),s.push("https://images.weserv.nl/?url="+encodeURIComponent(c(r))+"&n=-1&cb="+Date.now()),s.push("https://corsproxy.io/?"+encodeURIComponent(r));let a=0,w=!1;const g=m=>{w||(w=!0,u(!!m))},y=setTimeout(()=>g(!1),Math.max(1200,l||8e3)),h=()=>{if(w)return;const m=s[a++];if(!m){clearTimeout(y),g(!1);return}const o=new Image;o.crossOrigin="anonymous",o.onload=()=>{if(!w){if(!o.naturalWidth||!o.naturalHeight){h();return}try{const f=document.createElement("canvas");f.width=o.naturalWidth,f.height=o.naturalHeight,f.getContext("2d").drawImage(o,0,0);const x=(()=>{try{return document.createElement("canvas").toDataURL("image/webp").startsWith("data:image/webp")}catch(_){return!1}})()?f.toDataURL("image/webp",.88):f.toDataURL("image/jpeg",.88);if(!x||x==="data:,"){h();return}try{if(_imgDataUrlCache[r]||_imgDataUrlCacheOrder.push(r),_imgDataUrlCache[r]=x,_imgDataUrlCacheOrder.length>500){const _=_imgDataUrlCacheOrder.shift();_&&delete _imgDataUrlCache[_]}}catch(_){}clearTimeout(y),g(!0)}catch(f){h()}}},o.onerror=()=>{h()},o.src=m};h()}).finally(()=>{try{delete _imgDataUrlInflight[t]}catch(u){}});return _imgDataUrlInflight[t]=n,await n}window._precacheVisibleImages=window._precacheVisibleImages||function(e,l){try{if(!e||!e.querySelectorAll)return;const t=Math.max(1,parseInt(l,10)||160),c=[],i=new Set;if(e.querySelectorAll("img[src]").forEach(r=>{const s=r.getAttribute("src")||"";if(!s||s.startsWith("data:")||s.startsWith("blob:"))return;let a=s;try{typeof toHttpsUrl=="function"&&(a=toHttpsUrl(a)||a)}catch(w){}i.has(a)||(i.add(a),!(_imgDataUrlCache[a]&&String(_imgDataUrlCache[a]).startsWith("data:image/"))&&c.push(a))}),!c.length)return;const n=c.slice(0,t),u=async()=>{let s=0;const a=async()=>{for(;;){const w=s++;if(w>=n.length)break;try{await _precacheImgDataUrl(n[w],8e3)}catch(g){}}};await Promise.all(Array.from({length:Math.min(4,n.length)},()=>a()))};if("requestIdleCallback"in window)try{window.requestIdleCallback(()=>{u()},{timeout:1200})}catch(r){setTimeout(()=>{u()},60)}else setTimeout(()=>{u()},60)}catch(t){}};async function _waitForImages(e,l){const t=Math.max(300,parseInt(l,10)||900),c=e?[...e.querySelectorAll("img[src]")]:[];if(!c.length)return!0;const i=c.map(n=>{try{if(!n||typeof n!="object")return Promise.resolve(!1);if(n.complete&&n.naturalWidth>0)return Promise.resolve(!0);if(typeof n.decode=="function")return n.decode().then(()=>!0).catch(()=>!1)}catch(u){}return new Promise(u=>{let r=!1;const s=a=>{r||(r=!0,u(!!a))};try{n&&typeof n=="object"?(n.addEventListener("load",()=>s(!0),{once:!0}),n.addEventListener("error",()=>s(!1),{once:!0})):s(!1)}catch(a){s(!1)}setTimeout(()=>s(!1),t)})});return await Promise.race([Promise.allSettled(i),new Promise(n=>setTimeout(n,t))]),!0}async function _dlCanvasBoard(e,l){if(!e||e.width===0||e.height===0)return alert("\uC774\uBBF8\uC9C0 \uC0DD\uC131 \uC2E4\uD328: \uCE94\uBC84\uC2A4\uAC00 \uBE44\uC5B4\uC788\uC2B5\uB2C8\uB2E4. \uB2E4\uC2DC \uC2DC\uB3C4\uD574\uC8FC\uC138\uC694."),!1;const t=l.replace(/\.jpg$/i,".png"),c=r=>{try{const s=document.getElementById("__img_save_overlay");s&&s.remove();const a=document.createElement("div");a.id="__img_save_overlay",a.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,.72);z-index:999999;display:flex;align-items:center;justify-content:center;padding:16px;";const w=String(t||"image.png").replace(/</g,"&lt;").replace(/>/g,"&gt;");a.innerHTML=`
        <div style="width:min(980px,96vw);max-height:92vh;background:#0b1220;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,.12);box-shadow:0 18px 60px rgba(0,0,0,.45);display:flex;flex-direction:column">
          <div style="display:flex;gap:10px;align-items:center;padding:12px 14px;background:rgba(15,23,42,.92);color:#fff">
            <div style="font-weight:900;font-size:13px">\uC774\uBBF8\uC9C0 \uC800\uC7A5</div>
            <div style="font-size:12px;opacity:.8">\uC790\uB3D9 \uB2E4\uC6B4\uB85C\uB4DC\uAC00 \uB9C9\uD614\uC2B5\uB2C8\uB2E4. PC\uB294 \uC6B0\uD074\uB9AD \uC800\uC7A5 / \uBAA8\uBC14\uC77C\uC740 \uAE38\uAC8C \uB20C\uB7EC \uC800\uC7A5</div>
            <a href="${r}" download="${w}" style="margin-left:auto;text-decoration:none;color:#fff;background:#2563eb;border:1px solid rgba(255,255,255,.14);border-radius:10px;padding:6px 10px;font-weight:900;font-size:12px">\uB2E4\uC6B4\uB85C\uB4DC</a>
            <button id="__img_save_overlay_close" style="border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.06);color:#fff;border-radius:10px;padding:6px 10px;font-weight:900;cursor:pointer;font-size:12px">\uB2EB\uAE30</button>
          </div>
          <div style="padding:12px;overflow:auto;background:#111">
            <img src="${r}" style="max-width:100%;display:block;margin:0 auto;border-radius:12px;background:#111">
          </div>
        </div>
      `,a.addEventListener("click",y=>{y.target===a&&a.remove()}),document.body.appendChild(a);const g=document.getElementById("__img_save_overlay_close");g&&(g.onclick=()=>a.remove())}catch(s){}},i=(()=>{try{const r=window.__captureDlWin;if(r&&!r.closed)return r}catch(r){}return null})();try{window.__captureDlWin=null}catch(r){}if(!i&&typeof window._saveCanvasImage=="function")return await window._saveCanvasImage(e,t,"png"),!0;const n=(r,s)=>{if(i)try{if(s){try{i.location.href=r}catch(a){}return}i.document.open(),i.document.write('<html><head><meta charset="utf-8"><title>\uC774\uBBF8\uC9C0 \uC800\uC7A5</title></head><body style="margin:0;background:#111;color:#fff;font-family:sans-serif"><div style="padding:12px;font-size:13px">\uC774\uBBF8\uC9C0\uAC00 \uC790\uB3D9 \uB2E4\uC6B4\uB85C\uB4DC\uB418\uC9C0 \uC54A\uC73C\uBA74, \uC544\uB798 \uC774\uBBF8\uC9C0\uB97C \uAE38\uAC8C \uB20C\uB7EC \uC800\uC7A5\uD558\uC138\uC694.</div><img src="'+r+'" style="max-width:100%;display:block;margin:0 auto"></body></html>'),i.document.close()}catch(a){}},u=r=>{try{const s=document.createElement("a");return s.href=r,s.download=t,document.body.appendChild(s),s.click(),setTimeout(()=>{try{document.body.removeChild(s)}catch(a){}},300),!0}catch(s){return!1}};return await new Promise(r=>{try{e.toBlob(s=>{if(!s){try{const g=e.toDataURL("image/png");if(!g||g==="data:,"){alert("\uC774\uBBF8\uC9C0 \uC800\uC7A5 \uC2E4\uD328: \uBE48 \uC774\uBBF8\uC9C0\uC785\uB2C8\uB2E4."),r(!1);return}if(!u(g)&&!i){let h=null;try{h=window.open(g,"_blank","noopener")}catch(m){}h||c(g)}n(g,!1),r(!0)}catch(g){const y=g&&g.message?g.message:String(g||"\uC624\uB958");/insecure|security/i.test(y)?alert(`\uC774\uBBF8\uC9C0 \uC800\uC7A5 \uC2E4\uD328: \uBCF4\uC548 \uC815\uCC45(CORS)\uC73C\uB85C \uC778\uD574 \uCE94\uBC84\uC2A4\uB97C \uC800\uC7A5\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.

\uC678\uBD80 \uC774\uBBF8\uC9C0(\uD504\uB85C\uD544/\uB85C\uACE0/\uBC30\uACBD)\uAC00 \uD3EC\uD568\uB418\uC5B4 \uC788\uC73C\uBA74 \uC800\uC7A5\uC774 \uCC28\uB2E8\uB420 \uC218 \uC788\uC2B5\uB2C8\uB2E4.`):alert("\uC774\uBBF8\uC9C0 \uC800\uC7A5 \uC2E4\uD328: "+y),r(!1)}return}const a=URL.createObjectURL(s);if(!u(a)&&!i){let g=null;try{g=window.open(a,"_blank","noopener")}catch(y){}g||c(a)}i?(n(a,!0),setTimeout(()=>{try{URL.revokeObjectURL(a)}catch(g){}},12e4)):setTimeout(()=>{try{URL.revokeObjectURL(a)}catch(g){}},800),r(!0)},"image/png")}catch(s){const a=s&&s.message?s.message:String(s||"\uC624\uB958");/insecure|security/i.test(a)?alert(`\uC774\uBBF8\uC9C0 \uC800\uC7A5 \uC2E4\uD328: \uBCF4\uC548 \uC815\uCC45(CORS)\uC73C\uB85C \uC778\uD574 \uCE94\uBC84\uC2A4\uB97C \uC800\uC7A5\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.

\uC678\uBD80 \uC774\uBBF8\uC9C0(\uD504\uB85C\uD544/\uB85C\uACE0/\uBC30\uACBD)\uAC00 \uD3EC\uD568\uB418\uC5B4 \uC788\uC73C\uBA74 \uC800\uC7A5\uC774 \uCC28\uB2E8\uB420 \uC218 \uC788\uC2B5\uB2C8\uB2E4.`):alert("\uC774\uBBF8\uC9C0 \uC800\uC7A5 \uC2E4\uD328: "+a),r(!1)}})}async function _captureAndSave(e,l,t,c){try{await(window.ensureHtml2Canvas&&window.ensureHtml2Canvas())}catch(n){}if(typeof html2canvas!="function")throw new Error("html2canvas\uB97C \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.");try{await new Promise(n=>requestAnimationFrame(()=>requestAnimationFrame(n))),typeof _applyBoardBgAutoSizing=="function"&&_applyBoardBgAutoSizing(e),typeof _b2ApplyBgAutoSizing=="function"&&_b2ApplyBgAutoSizing(e),await new Promise(n=>requestAnimationFrame(n))}catch(n){}try{const n=e.querySelectorAll("img").length,u=document.getElementById("_save-toast");n&&u&&(u.innerHTML='<span style="display:inline-block;animation:_spin .8s linear infinite">\u23F3</span> \uC774\uBBF8\uC9C0 \uBCC0\uD658 (0/'+n+")")}catch(n){}await _imgToDataUrls(e,12e3,(n,u)=>{try{const r=document.getElementById("_save-toast");r&&(r.innerHTML='<span style="display:inline-block;animation:_spin .8s linear infinite">\u23F3</span> \uC774\uBBF8\uC9C0 \uBCC0\uD658 ('+n+"/"+u+")")}catch(r){}});const i=document.body.classList.contains("dark");i&&document.body.classList.remove("dark");try{const n=document.getElementById("_save-toast");n&&(n.innerHTML='<span style="display:inline-block;animation:_spin .8s linear infinite">\u23F3</span> \uCEA1\uCC98 \uC911...');try{await _waitForImages(e,1500)}catch(o){}const u=(()=>{try{const o=window.getComputedStyle?getComputedStyle(e).backgroundColor:"";if(o&&o!=="transparent"&&o!=="rgba(0, 0, 0, 0)")return o}catch(o){}return"#f0f2f5"})(),r=o=>function(f){try{if(f&&f.adoptedStyleSheets&&f.adoptedStyleSheets.length)try{f.adoptedStyleSheets=[]}catch(d){}}catch(d){}if(o){try{f.querySelectorAll("svg").forEach(d=>d.remove())}catch(d){}try{f.querySelectorAll("img").forEach(d=>{try{const b=String(d.getAttribute("src")||d.src||"");if(!b)return;(b.includes("data:image/svg+xml")||/\.svg(\?|#|$)/i.test(b))&&(d.style.display="none")}catch(b){}})}catch(d){}try{f.querySelectorAll('[style*="background-image"]').forEach(d=>{try{const b=String(d.style&&d.style.backgroundImage?d.style.backgroundImage:"");b&&b.includes("url(")&&!b.includes("data:image/")&&(d.style.backgroundImage="none")}catch(b){}})}catch(d){}}},s={scale:1,backgroundColor:u,logging:!1,imageTimeout:2e4,width:l,height:t,windowWidth:l+100,windowHeight:t+100,x:0,y:0,scrollX:0,scrollY:0},a=/waterfox/i.test(navigator.userAgent),w=/firefox/i.test(navigator.userAgent),g=[{useCORS:!0,allowTaint:!1,foreignObjectRendering:!1,onclone:r(!1)},{useCORS:!0,allowTaint:!1,foreignObjectRendering:!0,onclone:r(!1)},{useCORS:!0,allowTaint:!1,foreignObjectRendering:!1,onclone:r(!0),ignoreElements:o=>o&&o.tagName&&o.tagName.toLowerCase()==="svg"},...a||w?[{useCORS:!0,allowTaint:!1,foreignObjectRendering:!1,onclone:r(!0),ignoreElements:o=>{if(!o||!o.tagName)return!1;const f=o.tagName.toLowerCase();if(f==="svg")return!0;if(f==="img")try{const d=String(o.getAttribute("src")||o.src||"");if(d&&d.includes("://")&&!d.includes(window.location.hostname)&&!d.startsWith("data:"))return!0}catch(d){}return!!(o.style&&o.style.backgroundImage&&String(o.style.backgroundImage).includes("url(")&&!String(o.style.backgroundImage).includes("data:image/"))}}]:[]];let y=null,h=null;for(const o of g)try{if(y=await html2canvas(e,L(L({},s),o)),y&&y.width>0&&y.height>0){h=null;break}h=new Error("\uCE94\uBC84\uC2A4 \uC0DD\uC131 \uC2E4\uD328")}catch(f){h=f;const d=_captureErrText(f);if(d.includes(`can't access property "type"`)||d.includes("can't access property 'type'")||d==="[object Event]"||d.startsWith("\uC774\uBCA4\uD2B8 \uC624\uB958("))continue;break}if(h)throw new Error(_captureErrText(h));if(!y||y.width===0||y.height===0)throw new Error("\uCE94\uBC84\uC2A4 \uC0DD\uC131 \uC2E4\uD328");let m=await _dlCanvasBoard(y,c);if(!m){try{e.querySelectorAll("img").forEach(f=>{try{const d=String(f.getAttribute("src")||f.src||"");if(!d)return;const b=String(window.location.hostname||"");d.startsWith("data:")||d.startsWith("blob:")||b&&d.includes(b)||(f.style.display="none")}catch(d){}}),e.querySelectorAll('[style*="background-image"]').forEach(f=>{try{const d=String(f.style&&f.style.backgroundImage?f.style.backgroundImage:"");d&&d.includes("url(")&&!d.includes("data:image/")&&(f.style.backgroundImage="none")}catch(d){}})}catch(f){}const o=await html2canvas(e,T(L({},s),{useCORS:!0,allowTaint:!1,foreignObjectRendering:!1,onclone:r(!0)}));if(!o||o.width===0||o.height===0)throw new Error("\uCE94\uBC84\uC2A4 \uC0DD\uC131 \uC2E4\uD328");if(m=await _dlCanvasBoard(o,c),!m)throw new Error("\uC774\uBBF8\uC9C0 \uC800\uC7A5 \uC2E4\uD328")}}finally{i&&document.body.classList.add("dark")}}async function downloadBoardAll(){const e=event==null?void 0:event.currentTarget;e&&(e.disabled=!0,e._ot=e.textContent,e.textContent="\u23F3...");const l=document.createElement("div");try{try{await(window.ensureHtml2Canvas&&window.ensureHtml2Canvas())}catch(r){}if(typeof html2canvas!="function")throw new Error("html2canvas\uB97C \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.");const t=document.getElementById("board-wrap");if(!t||!t.children.length){alert("\uD45C\uC2DC \uC911\uC778 \uD604\uD669\uD310\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.");return}const c=t.scrollWidth||900;l.style.cssText=`position:absolute;left:-9999px;top:0;width:${c}px;background:#f0f2f5;font-family:'Noto Sans KR',sans-serif;box-sizing:border-box;`;const i=document.getElementById("rcont"),n=i?i.querySelector("style"):null;l.innerHTML=(n?n.outerHTML:"")+t.innerHTML,l.querySelectorAll(".no-export,.no-export-movebtns").forEach(r=>r.remove()),l.querySelectorAll(".brd-card").forEach(r=>{const s=univCfg.find(a=>a.name===r.dataset.univ);s&&s.hidden&&r.remove()}),document.body.appendChild(l),await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))),await _imgToDataUrls(l,12e3);const u=document.body.classList.contains("dark");u&&document.body.classList.remove("dark");try{const r=l.scrollWidth||c,s=Math.max(l.scrollHeight,l.offsetHeight,200),a=await html2canvas(l,{scale:1,useCORS:!0,allowTaint:!1,backgroundColor:"#f0f2f5",logging:!1,imageTimeout:2e4,width:r,height:s,windowWidth:r+200,windowHeight:s+200});if(!a||a.width===0||a.height===0)throw new Error("\uCE94\uBC84\uC2A4 \uC0DD\uC131 \uC2E4\uD328");await _dlCanvasBoard(a,"\uD604\uD669\uD310_\uC804\uCCB4\uC800\uC7A5.png")}finally{u&&document.body.classList.add("dark")}}catch(t){alert("\uB2E4\uC6B4\uB85C\uB4DC \uC2E4\uD328: "+t.message)}finally{l.parentNode&&document.body.removeChild(l),e&&(e.disabled=!1,e.textContent=e._ot||e.textContent)}}

/* cloud-board-rank-sync.js */
var v=Object.defineProperty,m=Object.defineProperties;var b=Object.getOwnPropertyDescriptors;var p=Object.getOwnPropertySymbols;var h=Object.prototype.hasOwnProperty,S=Object.prototype.propertyIsEnumerable;var u=(t,e,n)=>e in t?v(t,e,{enumerable:!0,configurable:!0,writable:!0,value:n}):t[e]=n,f=(t,e)=>{for(var n in e||(e={}))h.call(e,n)&&u(t,n,e[n]);if(p)for(var n of p(e))S.call(e,n)&&u(t,n,e[n]);return t},g=(t,e)=>m(t,b(e));function buildBoardRankViewHTML(t){const e=new Set(t.map(o=>o.name)),n=(players||[]).filter(o=>o.univ&&e.has(o.univ)&&(o.win||0)+(o.loss||0)>0).map(o=>g(f({},o),{_univ:o.univ,_col:gc(o.univ)}));if(n.sort((o,l)=>(l.points||0)-(o.points||0)),!n.length)return'<div style="padding:40px;text-align:center;color:var(--gray-l)">\uC2A4\uD2B8\uB9AC\uBA38 \uC5C6\uC74C</div>';const a={G:"\u{1F451}",K:"\u{1F31F}",JA:"\u26A1",J:"\u{1F525}",S:"\u{1F48E}","0\uD2F0\uC5B4":"\u2B50","1\uD2F0\uC5B4":"\u{1F947}","2\uD2F0\uC5B4":"\u{1F948}","3\uD2F0\uC5B4":"\u{1F949}"};let r=`<div style="background:var(--white);border-radius:14px;border:1px solid var(--border);overflow:hidden">
    <div style="padding:14px 18px;font-weight:900;font-size:15px;color:var(--blue);border-bottom:2px solid var(--blue-ll)">\u{1F3C5} \uD3EC\uC778\uD2B8 \uC21C \uC804\uCCB4 \uB7AD\uD0B9</div>
    <table style="width:100%;border-collapse:collapse">
      <thead><tr style="background:var(--bg2)">
        <th style="padding:8px 12px;text-align:center;font-size:12px;color:var(--text3)">\uC21C\uC704</th>
        <th style="padding:8px 12px;text-align:left;font-size:12px;color:var(--text3)">\uC120\uC218</th>
        <th style="padding:8px 12px;text-align:left;font-size:12px;color:var(--text3)">\uB300\uD559</th>
        <th style="padding:8px 12px;text-align:center;font-size:12px;color:var(--text3)">\uD2F0\uC5B4</th>
        <th style="padding:8px 12px;text-align:center;font-size:12px;color:var(--text3)">\uC2B9</th>
        <th style="padding:8px 12px;text-align:center;font-size:12px;color:var(--text3)">\uD328</th>
        <th style="padding:8px 12px;text-align:center;font-size:12px;color:var(--text3)">\uD3EC\uC778\uD2B8</th>
      </tr></thead><tbody>`;return n.forEach((o,l)=>{const d=a[o.tier]||"",i=l===0?'<span class="rk1">1</span>':l===1?'<span class="rk2">2</span>':l===2?'<span class="rk3">3</span>':`<span style="font-weight:700">${l+1}</span>`,s=o.points||0,c=s>0?"#16a34a":s<0?"#dc2626":"#64748b",x=typeof escJS=="function"?escJS(o.name):String(o.name||"").replace(/\\/g,"\\\\").replace(/'/g,"\\'").replace(/\r/g,"\\r").replace(/\n/g,"\\n"),y=typeof escJS=="function"?escJS(o._univ):String(o._univ||"").replace(/\\/g,"\\\\").replace(/'/g,"\\'").replace(/\r/g,"\\r").replace(/\n/g,"\\n");r+=`<tr style="border-top:1px solid var(--border)">
      <td style="padding:7px 12px;text-align:center">${i}</td>
      <td style="padding:7px 12px;text-align:left">
        <div style="display:flex;align-items:center;gap:6px;cursor:pointer" onclick="openPlayerModal('${x}')">
          ${getPlayerPhotoHTML(o.name,"24px")}
          <span style="font-weight:700;font-size:13px">${o.name||""}</span>
        </div>
      </td>
      <td style="padding:7px 12px">
        <span class="ubadge clickable-univ" style="background:${o._col};font-size:10px;padding:2px 7px" onclick="openUnivModal('${y}')">${o._univ||""}</span>
      </td>
      <td style="padding:7px 12px;text-align:center;font-size:12px">${d}${o.tier||""}</td>
      <td style="padding:7px 12px;text-align:center;color:#16a34a;font-weight:700">${o.win||0}</td>
      <td style="padding:7px 12px;text-align:center;color:#dc2626;font-weight:700">${o.loss||0}</td>
      <td style="padding:7px 12px;text-align:center;font-weight:900;font-size:14px;color:${c}">${s>0?"+":""}${s}</td>
    </tr>`}),r+="</tbody></table></div>",r}async function downloadBoardSel(){const t=event==null?void 0:event.currentTarget;t&&(t.disabled=!0,t._ot=t.textContent,t.textContent="\u23F3...");const e=document.createElement("div");try{if(!boardSelUniv||boardSelUniv==="\uC804\uCCB4"){alert("\uB300\uD559\uC744 \uC120\uD0DD\uD558\uC138\uC694.");return}const n=getAllUnivs().find(i=>i.name===boardSelUniv);if(!n){alert("\uD574\uB2F9 \uB300\uD559\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.");return}const a=document.getElementById("board-wrap");if(a){const i=_findBrdCardByUniv(boardSelUniv,a);if(i){const s=[...i.querySelectorAll("[data-player]")].map(c=>c.dataset.player).filter(Boolean);s.length>0&&(boardPlayerOrder[boardSelUniv]=s)}}e.style.cssText="position:absolute;left:-9999px;top:0;width:900px;background:#f0f2f5;padding:12px;font-family:'Noto Sans KR',sans-serif;box-sizing:border-box;";const r=document.getElementById("rcont"),o=r?r.querySelector("style"):null;e.innerHTML=(o?o.outerHTML:"")+buildUnivBoardCard(n,!0),e.querySelectorAll(".no-export,.no-export-movebtns").forEach(i=>i.remove()),document.body.appendChild(e),injectUnivIcons(e),await new Promise(i=>requestAnimationFrame(()=>requestAnimationFrame(i))),e.getBoundingClientRect();const l=e.offsetWidth||900,d=Math.max(e.scrollHeight,e.offsetHeight,100);await _captureAndSave(e,l,d,"\uD604\uD669\uD310_"+boardSelUniv+".png")}catch(n){alert("\uB2E4\uC6B4\uB85C\uB4DC \uC2E4\uD328: "+n.message)}finally{e.parentNode&&document.body.removeChild(e),t&&(t.disabled=!1,t.textContent=t._ot||t.textContent)}}let _autoSyncTimer=null,_lastRemoteSavedAt=0;async function _checkRemoteSavedAt(){try{const t=[GITHUB_JSON_URL+"?_="+Date.now(),"https://cdn.jsdelivr.net/gh/nada1004/star-system@main/star-datacenter/data.json?_="+Date.now()];for(const e of t)try{const n=await fetch(e,{cache:"no-store",mode:"cors",signal:AbortSignal.timeout(8e3)});if(!n.ok)continue;const a=(await n.text()).replace(/^\uFEFF/,"").trim(),r=JSON.parse(a);return Number(r&&r.savedAt||0)||0}catch(n){continue}}catch(t){}return 0}function _autoSyncShouldDefer(){try{const t=document.activeElement;if(t&&(t.tagName==="INPUT"||t.tagName==="TEXTAREA"||t.isContentEditable)||Array.from(document.querySelectorAll('.modal,[id$="Modal"],[id$="modal"]')).find(n=>{const a=window.getComputedStyle(n);return a.display!=="none"&&a.visibility!=="hidden"}))return!0}catch(t){}return!1}async function _autoSyncCheck(){if(_boardCanManage()&&!window._isSaving)try{const t=await _checkRemoteSavedAt();if(!t)return;_lastRemoteSavedAt=t;const e=Math.max(Number(window._lastAdminSaveTime||0)||0,Number(localStorage.getItem("su_last_admin_save")||0)||0,Number(window._lastAppliedSavedAt||0)||0);if(t>e+3e3){if(_autoSyncShouldDefer()){console.log("[autoSync] \uBAA8\uB2EC/\uC785\uB825 \uC911 - \uC774\uBC88 \uC8FC\uAE30\uB294 \uBCF4\uB958 (\uB2E4\uC74C 30\uCD08\uC5D0 \uC7AC\uC2DC\uB3C4)");return}if(console.log("[autoSync] \uC6D0\uACA9\uC5D0 \uC0C8 \uB370\uC774\uD130 \uAC10\uC9C0 - \uC790\uB3D9 \uB3D9\uAE30\uD654 \uC2DC\uC791"),typeof window._autoSyncApply=="function")try{await window._autoSyncApply(),console.log("[autoSync] \uC790\uB3D9 \uB3D9\uAE30\uD654 \uC644\uB8CC"),typeof showToast=="function"&&showToast("\u2705 \uB2E4\uB978 \uAE30\uAE30\uC758 \uBCC0\uACBD \uC0AC\uD56D\uC774 \uC790\uB3D9\uC73C\uB85C \uB3D9\uAE30\uD654\uB418\uC5C8\uC2B5\uB2C8\uB2E4.",3e3)}catch(n){console.error("[autoSync] \uC790\uB3D9 \uB3D9\uAE30\uD654 \uC2E4\uD328:",n);const a=document.getElementById("cloudStatus");a&&(a.style.color="#2563eb",a.innerHTML='\u{1F504} GitHub\uC5D0 \uC0C8 \uB370\uC774\uD130 \uC788\uC74C <button onclick="window.cloudLoad()" style="margin-left:6px;padding:2px 8px;border:1px solid #2563eb;border-radius:4px;background:#eff6ff;color:#2563eb;font-size:11px;cursor:pointer">\uBD88\uB7EC\uC624\uAE30</button>')}}}catch(t){console.warn("[autoSync] \uCCB4\uD06C \uC2E4\uD328:",t)}}(function(){const t=()=>{try{typeof _autoSyncCheck=="function"&&_autoSyncCheck()}catch(e){}};document.addEventListener("visibilitychange",()=>{document.visibilityState==="visible"&&t()}),window.addEventListener("focus",t)})();function startAutoSync(){_autoSyncTimer&&clearInterval(_autoSyncTimer),_autoSyncTimer=setInterval(_autoSyncCheck,30*1e3),console.log("[autoSync] \uC790\uB3D9 \uB3D9\uAE30\uD654 \uC2DC\uC791 (30\uCD08 \uAC04\uACA9)")}function stopAutoSync(){_autoSyncTimer&&(clearInterval(_autoSyncTimer),_autoSyncTimer=null,console.log("[autoSync] \uC790\uB3D9 \uB3D9\uAE30\uD654 \uC911\uC9C0"))}window.addEventListener("DOMContentLoaded",()=>{setTimeout(()=>{typeof isLoggedIn!="undefined"&&isLoggedIn&&(startAutoSync(),setTimeout(_autoSyncCheck,5e3));const t=window.fbCloudSave;t&&(window.fbCloudSave=async function(...e){const n=await t.apply(this,e);return setTimeout(_autoSyncCheck,3e4),n})},2e3)},{once:!0});

/* board2-image-utils.js */
var Y=Object.defineProperty;var A=Object.getOwnPropertySymbols;var j=Object.prototype.hasOwnProperty,B=Object.prototype.propertyIsEnumerable;var X=(n,t,e)=>t in n?Y(n,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):n[t]=e,m=(n,t)=>{for(var e in t||(t={}))j.call(t,e)&&X(n,e,t[e]);if(A)for(var e of A(t))B.call(t,e)&&X(n,e,t[e]);return n};let _b2GlobalImgSettings=JSON.parse(localStorage.getItem("su_b2_global_img_settings")||"{}");const _b2ImgMetaCache={};let _b2ImgSettingsSaveTimer=null,_b2ImgSettingsSavePending=!1;function _b2FlushImgSettingsSave(){_b2ImgSettingsSaveTimer&&(clearTimeout(_b2ImgSettingsSaveTimer),_b2ImgSettingsSaveTimer=null),_b2ImgSettingsSavePending&&(_b2ImgSettingsSavePending=!1,typeof save=="function"&&typeof isLoggedIn!="undefined"&&isLoggedIn&&save())}function _b2CancelImgSettingsSave(){_b2ImgSettingsSaveTimer&&(clearTimeout(_b2ImgSettingsSaveTimer),_b2ImgSettingsSaveTimer=null),_b2ImgSettingsSavePending=!1}function _b2ScheduleImgSettingsSave(){typeof save=="function"&&typeof isLoggedIn!="undefined"&&isLoggedIn&&(_b2ImgSettingsSavePending=!0,_b2ImgSettingsSaveTimer&&clearTimeout(_b2ImgSettingsSaveTimer),_b2ImgSettingsSaveTimer=setTimeout(()=>{_b2FlushImgSettingsSave()},800))}try{window._b2FlushImgSettingsSave=_b2FlushImgSettingsSave}catch(n){}try{window._b2CancelImgSettingsSave=_b2CancelImgSettingsSave}catch(n){}try{document.addEventListener("visibilitychange",()=>{document.visibilityState==="hidden"&&_b2CancelImgSettingsSave()}),window.addEventListener("beforeunload",_b2CancelImgSettingsSave)}catch(n){}function _b2DeviceKey(){const n=Math.max(320,Math.min(1920,window.innerWidth||1024));return n<=768?"mb":n<=1024?"tb":"pc"}function _b2EnsureDeviceImgSettings(){try{(!_b2GlobalImgSettings||typeof _b2GlobalImgSettings!="object")&&(_b2GlobalImgSettings={});const n={primary:_b2DefaultSingleImgSettings(),secondary:_b2DefaultSingleImgSettings()};if(!_b2GlobalImgSettings.__byDevice||typeof _b2GlobalImgSettings.__byDevice!="object"){const e=_b2GlobalImgSettings.primary&&typeof _b2GlobalImgSettings.primary=="object"?m(m({},n.primary),_b2GlobalImgSettings.primary):m({},n.primary),s=_b2GlobalImgSettings.secondary&&typeof _b2GlobalImgSettings.secondary=="object"?m(m({},n.secondary),_b2GlobalImgSettings.secondary):m({},n.secondary);_b2GlobalImgSettings.__byDevice={pc:{primary:m({},e),secondary:m({},s)},tb:{primary:m({},e),secondary:m({},s)},mb:{primary:m({},e),secondary:m({},s)}}}const t=_b2DeviceKey();(!_b2GlobalImgSettings.__byDevice[t]||typeof _b2GlobalImgSettings.__byDevice[t]!="object")&&(_b2GlobalImgSettings.__byDevice[t]={primary:_b2DefaultSingleImgSettings(),secondary:_b2DefaultSingleImgSettings()}),["primary","secondary"].forEach(e=>{(!_b2GlobalImgSettings.__byDevice[t][e]||typeof _b2GlobalImgSettings.__byDevice[t][e]!="object")&&(_b2GlobalImgSettings.__byDevice[t][e]=_b2DefaultSingleImgSettings())})}catch(n){}}function _b2SaveImgSettings(){_b2EnsureDeviceImgSettings(),localStorage.setItem("su_b2_global_img_settings",JSON.stringify(_b2GlobalImgSettings)),_b2ScheduleImgSettingsSave()}function _b2DefaultSingleImgSettings(){return{scale:100,brightness:100,fit:"cover",autoAdjust:!0,manualCenter:!1,offsetX:0,offsetY:0,zoom:100,fill:"cover",posX:0,posY:0}}function _b2GetImgSettings(n,t){_b2EnsureDeviceImgSettings();const e=_b2DeviceKey(),s=t==="secondary"?"secondary":"primary";_b2GlobalImgSettings.__byDevice[e][s]||(_b2GlobalImgSettings.__byDevice[e][s]=_b2DefaultSingleImgSettings());try{const o=_b2GlobalImgSettings.__byDevice[e][s];o&&typeof o=="object"&&(o.autoAdjust==null&&(o.autoAdjust=!0),o.fit==null&&typeof o.fill=="string"&&(o.fit=o.fill),o.scale==null&&o.zoom!=null&&(o.scale=o.zoom),o.offsetX==null&&o.posX!=null&&(o.offsetX=o.posX),o.offsetY==null&&o.posY!=null&&(o.offsetY=o.posY))}catch(o){console.warn("[_b2LoadSingleImgSettings] \uB808\uAC70\uC2DC \uC124\uC815 \uBCF4\uC815 \uC2E4\uD328:",o.message)}return _b2GlobalImgSettings.__byDevice[e][s].zoom=_b2GlobalImgSettings.__byDevice[e][s].scale,_b2GlobalImgSettings.__byDevice[e][s].fill=_b2GlobalImgSettings.__byDevice[e][s].fit,_b2GlobalImgSettings.__byDevice[e][s].posX=_b2GlobalImgSettings.__byDevice[e][s].offsetX,_b2GlobalImgSettings.__byDevice[e][s].posY=_b2GlobalImgSettings.__byDevice[e][s].offsetY,_b2GlobalImgSettings.__byDevice[e][s]}function _b2SetImgSetting(n,t,e,s){s===void 0&&(s=e,e=t,t="primary");const o=_b2GetImgSettings(n,t);o[e]=s,_b2SaveImgSettings()}window._b2ResetImgSettings=function(n,t){_b2EnsureDeviceImgSettings();const e=_b2DeviceKey();(t==="primary"||t==="secondary")&&(_b2GlobalImgSettings.__byDevice[e][t]=_b2DefaultSingleImgSettings(),_b2SaveImgSettings())};function _b2GetImgDomId(n){return n==="secondary"?"b2-main-img-2":"b2-main-img-1"}function _b2GetImgControlPrefix(n){return n==="secondary"?"b2-secondary":"b2-primary"}function _b2GetImgTransform(n){return`translate(${n.offsetX||0}px, ${n.offsetY||0}px) scale(${(n.scale||100)/100})`}function _b2LoadImgMeta(n,t){try{const e=toHttpsUrl(n||"");if(!e){t&&t(null);return}if(_b2ImgMetaCache[e]&&_b2ImgMetaCache[e].w&&_b2ImgMetaCache[e].h){t&&t(_b2ImgMetaCache[e]);return}const s=new Image;s.onload=function(){_b2ImgMetaCache[e]={w:s.naturalWidth||0,h:s.naturalHeight||0},t&&t(_b2ImgMetaCache[e])},s.onerror=function(){t&&t(null)},s.src=e}catch(e){t&&t(null)}}function _b2ResolveAutoFit(n,t){const e=window.innerWidth||1280;if(!n||!n.width||!n.height)return e<=900?"contain":"cover";if(!t||!t.w||!t.h)return e<=640?"contain":"cover";const s=n.width/n.height,o=t.w/t.h,i=Math.abs(Math.log(o/s));return e<=640?i>.28?"contain":"cover":e<=1024?i>.3?"contain":"cover":o>1.75||o<.64||i>.36?"contain":"cover"}function _b2ResolveAutoPosition(n,t,e){if(e!=="cover")return"center center";const s=t&&t.w&&t.h?t.w/t.h:1,o=n&&n.width&&n.height?n.width/n.height:1;return!s||!o?"center center":o/s>1.5?"top center":"center center"}function _b2IsAutoFitEligible(n){var i,l,a,d,_,v;if(!n)return!0;if(n.autoAdjust===!1)return!1;const t=String(n.fit||n.fill||"cover"),e=Number((l=(i=n.scale)!=null?i:n.zoom)!=null?l:100)||100,s=Number((d=(a=n.offsetX)!=null?a:n.posX)!=null?d:0)||0,o=Number((v=(_=n.offsetY)!=null?_:n.posY)!=null?v:0)||0;return!n.manualCenter&&t==="cover"&&e===100&&s===0&&o===0}function _b2ApplyImgSettingsToElement(n,t){if(!(!n||!t)&&(n.style.objectFit=t.fit||"contain",n.style.objectPosition=t.manualCenter?"center center":"center",n.style.filter=`brightness(${(t.brightness||100)/100})`,n.style.transform=_b2GetImgTransform(t),_b2IsAutoFitEligible(t))){const e=n.getBoundingClientRect?n.getBoundingClientRect():null;_b2LoadImgMeta(n.currentSrc||n.getAttribute("src")||"",s=>{try{const o=_b2ResolveAutoFit(e,s);n.style.objectFit=o,n.style.objectPosition=_b2ResolveAutoPosition(e,s,o),n.setAttribute("data-b2-fit-resolved",o)}catch(o){}})}}function _b2ApplyImgSettingsToDom(n,t){_b2ApplyImgSettingsToElement(document.getElementById(_b2GetImgDomId(t)),_b2GetImgSettings(n,t))}function _b2PreviewImgSetting(n,t,e,s){try{e={zoom:"scale",fill:"fit",posX:"offsetX",posY:"offsetY"}[e]||e;const i=_b2GetImgSettings(n,t),l=i[e],a=parseInt(s,10);i[e]=isNaN(a)?s:a,i.zoom=i.scale,i.fill=i.fit,i.posX=i.offsetX,i.posY=i.offsetY,_b2ApplyImgSettingsToDom(n,t),i[e]=l,i.zoom=i.scale,i.fill=i.fit,i.posX=i.offsetX,i.posY=i.offsetY}catch(o){}}function _b2CenterImageCfg(n,t){const e=_b2GetImgSettings(n,t);e.autoAdjust=!1,e.manualCenter=!0,e.offsetX=0,e.offsetY=0,e.posX=0,e.posY=0,_b2SaveImgSettings();try{_b2ApplyImgSettingsToDom(n,t),typeof window._b2RefreshImageControls=="function"&&window._b2RefreshImageControls(n,t)}catch(s){}typeof _renderCfgImgSettings=="function"&&_renderCfgImgSettings(n)}function _b2ApplySettingsToAll(n,t){const e=_b2GetImgSettings(n,t);_b2SaveImgSettings(),alert(`\uC774\uBBF8\uC9C0 ${t==="primary"?"1":"2"} \uC124\uC815\uC774 \uBAA8\uB4E0 \uC120\uC218\uC5D0\uAC8C \uC801\uC6A9\uB418\uC5C8\uC2B5\uB2C8\uB2E4. (\uD06C\uAE30: ${e.scale}%, \uBC1D\uAE30: ${e.brightness}%, \uBC30\uCE58: ${e.fit})`),typeof _renderCfgImgSettings=="function"&&_renderCfgImgSettings(n)}function _renderCfgImgSettings(n){const t=document.getElementById("cfg-img-settings-area");if(!n){t&&(t.style.display="none");return}t&&(t.style.display="block");const e=players.find(v=>v.name===n),s=!!(e&&e.photo),o=!!(e&&e.secondProfileFile),i=_b2GetImgSettings(n,"primary"),l=_b2GetImgSettings(n,"secondary"),a=n.replace(/'/g,"\\'"),d=document.getElementById("cfg-img-primary-controls"),_=document.getElementById("cfg-img-secondary-controls");d&&(d.innerHTML=s?`
      <div style="margin-bottom:10px">
        <div style="font-size:12px;margin-bottom:4px">\uD06C\uAE30: <span id="cfg-p-scale">${i.scale}%</span></div>
        <input type="range" min="50" max="220" value="${i.scale}" style="width:100%" oninput="_b2UpdateImgSetting('${a}','primary','scale',this.value);document.getElementById('cfg-p-scale').textContent=this.value+'%'">
      </div>
      <div style="margin-bottom:10px">
        <div style="font-size:12px;margin-bottom:4px">\uBC1D\uAE30: <span id="cfg-p-bright">${i.brightness}%</span></div>
        <input type="range" min="20" max="180" value="${i.brightness}" style="width:100%" oninput="_b2UpdateImgSetting('${a}','primary','brightness',this.value);document.getElementById('cfg-p-bright').textContent=this.value+'%'">
      </div>
      <div style="margin-bottom:10px">
        <div style="font-size:12px;margin-bottom:4px">\uBC30\uCE58</div>
        <div style="display:flex;gap:4px;flex-wrap:wrap">
          <button class="btn btn-xs ${i.fit==="cover"?"btn-b":"btn-w"}" onclick="_b2UpdateImgSetting('${a}','primary','fit','cover');_renderCfgImgSettings('${a}')">\uCC44\uC6B0\uAE30</button>
          <button class="btn btn-xs ${i.fit==="contain"?"btn-b":"btn-w"}" onclick="_b2UpdateImgSetting('${a}','primary','fit','contain');_renderCfgImgSettings('${a}')">\uB9DE\uCDA4</button>
          <button class="btn btn-xs ${i.fit==="fill"?"btn-b":"btn-w"}" onclick="_b2UpdateImgSetting('${a}','primary','fit','fill');_renderCfgImgSettings('${a}')">\uB298\uB9AC\uAE30</button>
        </div>
      </div>
      <div style="margin-bottom:10px">
        <div style="font-size:12px;margin-bottom:4px">\uC704\uCE58 \uC774\uB3D9</div>
        <div style="display:flex;gap:4px;flex-wrap:wrap">
          <button class="btn btn-xs btn-w" onclick="_b2MoveImg('${a}','primary',0,-12)">\u2191</button>
          <button class="btn btn-xs btn-w" onclick="_b2MoveImg('${a}','primary',0,12)">\u2193</button>
          <button class="btn btn-xs btn-w" onclick="_b2MoveImg('${a}','primary',-12,0)">\u2190</button>
          <button class="btn btn-xs btn-w" onclick="_b2MoveImg('${a}','primary',12,0)">\u2192</button>
          <button class="btn btn-xs btn-w" onclick="_b2CenterImageCfg('${a}','primary')">\uC911\uC559</button>
        </div>
      </div>
      <div>
        <button class="btn btn-xs btn-r" onclick="_b2ResetImgSettings('${a}','primary');_renderCfgImgSettings('${a}')">\uCD08\uAE30\uD654</button>
      </div>
    `:'<div style="color:var(--gray-l);font-size:12px">\uB4F1\uB85D\uB41C \uC774\uBBF8\uC9C0 \uC5C6\uC74C</div>'),_&&(_.innerHTML=o?`
      <div style="margin-bottom:10px">
        <div style="font-size:12px;margin-bottom:4px">\uD06C\uAE30: <span id="cfg-s-scale">${l.scale}%</span></div>
        <input type="range" min="50" max="220" value="${l.scale}" style="width:100%" oninput="_b2UpdateImgSetting('${a}','secondary','scale',this.value);document.getElementById('cfg-s-scale').textContent=this.value+'%'">
      </div>
      <div style="margin-bottom:10px">
        <div style="font-size:12px;margin-bottom:4px">\uBC1D\uAE30: <span id="cfg-s-bright">${l.brightness}%</span></div>
        <input type="range" min="20" max="180" value="${l.brightness}" style="width:100%" oninput="_b2UpdateImgSetting('${a}','secondary','brightness',this.value);document.getElementById('cfg-s-bright').textContent=this.value+'%'">
      </div>
      <div style="margin-bottom:10px">
        <div style="font-size:12px;margin-bottom:4px">\uBC30\uCE58</div>
        <div style="display:flex;gap:4px;flex-wrap:wrap">
          <button class="btn btn-xs ${l.fit==="cover"?"btn-b":"btn-w"}" onclick="_b2UpdateImgSetting('${a}','secondary','fit','cover');_renderCfgImgSettings('${a}')">\uCC44\uC6B0\uAE30</button>
          <button class="btn btn-xs ${l.fit==="contain"?"btn-b":"btn-w"}" onclick="_b2UpdateImgSetting('${a}','secondary','fit','contain');_renderCfgImgSettings('${a}')">\uB9DE\uCDA4</button>
          <button class="btn btn-xs ${l.fit==="fill"?"btn-b":"btn-w"}" onclick="_b2UpdateImgSetting('${a}','secondary','fit','fill');_renderCfgImgSettings('${a}')">\uB298\uB9AC\uAE30</button>
        </div>
      </div>
      <div style="margin-bottom:10px">
        <div style="font-size:12px;margin-bottom:4px">\uC704\uCE58 \uC774\uB3D9</div>
        <div style="display:flex;gap:4px;flex-wrap:wrap">
          <button class="btn btn-xs btn-w" onclick="_b2MoveImg('${a}','secondary',0,-12)">\u2191</button>
          <button class="btn btn-xs btn-w" onclick="_b2MoveImg('${a}','secondary',0,12)">\u2193</button>
          <button class="btn btn-xs btn-w" onclick="_b2MoveImg('${a}','secondary',-12,0)">\u2190</button>
          <button class="btn btn-xs btn-w" onclick="_b2MoveImg('${a}','secondary',12,0)">\u2192</button>
          <button class="btn btn-xs btn-w" onclick="_b2CenterImageCfg('${a}','secondary')">\uC911\uC559</button>
        </div>
      </div>
      <div>
        <button class="btn btn-xs btn-r" onclick="_b2ResetImgSettings('${a}','secondary');_renderCfgImgSettings('${a}')">\uCD08\uAE30\uD654</button>
      </div>
    `:'<div style="color:var(--gray-l);font-size:12px">\uB4F1\uB85D\uB41C \uC774\uBBF8\uC9C0 \uC5C6\uC74C</div>')}function _b2ClearSwapTimer(n){n&&n._swapTimer&&(clearTimeout(n._swapTimer),n._swapTimer=null),n&&(n._swapIdx=0)}function _b2ScheduleImageSwap(n){const t=document.getElementById("b2-players-main-box");if(!t)return;_b2ClearSwapTimer(t),t._swapGen=(t._swapGen||0)+1;const e=t._swapGen,s=r=>!!String(r||"").trim(),o=typeof players!="undefined"?players.find(r=>r.name===n):null,i=o?[{slot:1,url:o.photo},{slot:2,url:o.secondProfileFile},{slot:3,url:o.profileFile3},{slot:4,url:o.profileFile4},{slot:5,url:o.profileFile5}].filter(r=>r&&s(r.url)):[],l=(r,f)=>{const c=parseFloat(r);return isNaN(c)?f:Math.max(.2,Math.min(60,c))},a=r=>document.getElementById("b2-main-img-"+r),d=r=>!!(r&&r.tagName==="VIDEO"),_=r=>{try{const f=a(r);if(!d(f))return{handled:!1};try{f.loop=!1}catch(c){}try{f.muted=!0}catch(c){}try{f.playsInline=!0}catch(c){}try{f.currentTime=0}catch(c){}try{f.__b2SwapDone=!1}catch(c){}try{const c=f.play&&f.play();c&&typeof c.catch=="function"&&c.catch(()=>{})}catch(c){}return{handled:!0,el:f}}catch(f){return{handled:!1}}},v=(r,f)=>{var c,h,S,x,$,u,g,b,y,D,T,E,M;try{if(!o)return 1e3;if(f===1)return Math.round(r===2?l((h=(c=o.photoDelay21)!=null?c:o.photoDelay51)!=null?h:4,4)*1e3:r===3?l((x=(S=o.photoDelay31)!=null?S:o.photoDelay51)!=null?x:4,4)*1e3:r===4?l((u=($=o.photoDelay41)!=null?$:o.photoDelay51)!=null?u:4,4)*1e3:r===5?l((g=o.photoDelay51)!=null?g:4,4)*1e3:l((b=o.photoDelay51)!=null?b:4,4)*1e3);if(r===1)return Math.round(l((y=o.photoDelay12)!=null?y:4,4)*1e3);if(r===2)return Math.round(l((D=o.photoDelay23)!=null?D:4,4)*1e3);if(r===3)return Math.round(l((T=o.photoDelay34)!=null?T:4,4)*1e3);if(r===4)return Math.round(l((E=o.photoDelay45)!=null?E:4,4)*1e3);if(r===5)return Math.round(l((M=o.photoDelay51)!=null?M:4,4)*1e3)}catch(k){}return 1e3};if(i.length<2){const r=i[0]&&i[0].slot?i[0].slot:1,f=document.getElementById("b2-main-img-"+r);f&&(f.style.opacity="1");for(let c=1;c<=5;c++){if(c===r)continue;const h=document.getElementById("b2-main-img-"+c);h&&(h.style.opacity="0")}return}const p=i[0].slot;for(let r=1;r<=5;r++){const f=document.getElementById("b2-main-img-"+r);f&&(f.style.opacity=r===p?"1":"0")}try{const r=document.getElementById("b2-cur-img-slot");r&&(r.textContent="\u{1F5BC}\uFE0F \uC774\uBBF8\uC9C0 "+p)}catch(r){}t._swapIdx=0;const I=i.length;_(p);function w(){const r=t._swapIdx;t._swapIdx=(r+1)%I;const f=t._swapIdx,c=i[f]?i[f].slot:1;t._swapCurSlot=c;for(let u=1;u<=5;u++){const g=document.getElementById("b2-main-img-"+u);g&&(g.style.opacity=u===c?"1":"0")}try{const u=document.getElementById("b2-cur-img-slot");u&&(u.textContent="\u{1F5BC}\uFE0F \uC774\uBBF8\uC9C0 "+c)}catch(u){}try{for(let u=0;u<I;u++){const g=i[u]?i[u].slot:1,b=a(g);if(d(b)&&g!==c){try{b.onended=null}catch(y){}try{b.onloadedmetadata=null}catch(y){}try{b.pause&&b.pause()}catch(y){}try{b.__b2SwapDone=!1}catch(y){}}}}catch(u){}t._swapTimer&&clearTimeout(t._swapTimer);const h=(f+1)%I,S=i[f]?i[f].slot:1,x=i[h]?i[h].slot:1,$=_(c);if($.handled&&$.el)try{const u=$.el,g=Number(u.duration);if(Number.isFinite(g)&&g>0){try{u.__b2SwapDone=!1}catch(y){}u.onended=()=>{try{if(t._swapGen!==e||t._swapIdx!==f||t._swapCurSlot!==c||u.__b2SwapDone)return;u.__b2SwapDone=!0}catch(y){}try{t._swapTimer&&clearTimeout(t._swapTimer)}catch(y){}try{w()}catch(y){}};const b=Math.max(.2,g-Number(u.currentTime||0));t._swapTimer=setTimeout(()=>{try{if(t._swapGen!==e||t._swapIdx!==f||t._swapCurSlot!==c||u.__b2SwapDone)return;u.__b2SwapDone=!0}catch(y){}w()},Math.round(b*1e3)+180);return}try{u.__b2SwapDone=!1}catch(b){}try{u.onended=()=>{try{if(t._swapGen!==e||t._swapIdx!==f||t._swapCurSlot!==c||u.__b2SwapDone)return;u.__b2SwapDone=!0}catch(b){}try{t._swapTimer&&clearTimeout(t._swapTimer)}catch(b){}try{w()}catch(b){}}}catch(b){}try{u.onloadedmetadata=()=>{try{if(t._swapGen!==e||t._swapIdx!==f||t._swapCurSlot!==c)return;const b=Number(u.duration);if(!(Number.isFinite(b)&&b>0))return;t._swapTimer&&clearTimeout(t._swapTimer),t._swapTimer=setTimeout(()=>{try{if(t._swapGen!==e||t._swapIdx!==f||t._swapCurSlot!==c||u.__b2SwapDone)return;u.__b2SwapDone=!0}catch(y){}w()},Math.round(b*1e3)+180)}catch(b){}}}catch(b){}t._swapTimer=setTimeout(w,6e4);return}catch(u){}t._swapTimer=setTimeout(w,v(S,x))}let C=i[0]&&i[1]?v(i[0].slot,i[1].slot):1e3;try{const r=a(p);if(d(r)){const f=Number(r.duration);Number.isFinite(f)&&f>0?C=Math.round(f*1e3)+180:(C=6e4,r.onloadedmetadata=()=>{try{if(t._swapGen!==e||t._swapIdx!==0||t._swapCurSlot!==p)return;const c=Number(r.duration);if(Number.isFinite(c)&&c>0){t._swapTimer&&clearTimeout(t._swapTimer);try{r.__b2SwapDone=!1}catch(h){}t._swapTimer=setTimeout(()=>{try{if(t._swapGen!==e||t._swapIdx!==0||t._swapCurSlot!==p||r.__b2SwapDone)return;r.__b2SwapDone=!0}catch(h){}w()},Math.round(c*1e3)+180)}}catch(c){}});try{r.__b2SwapDone=!1}catch(c){}r.onended=()=>{try{if(t._swapGen!==e||t._swapIdx!==0||t._swapCurSlot!==p||r.__b2SwapDone)return;r.__b2SwapDone=!0}catch(c){}try{t._swapTimer&&clearTimeout(t._swapTimer)}catch(c){}try{w()}catch(c){}}}}catch(r){}t._swapCurSlot=p,t._swapTimer=setTimeout(w,C)}window._b2RefreshImageControls=function(n,t){const e=_b2GetImgSettings(n,t);e.zoom=e.scale,e.fill=e.fit,e.posX=e.offsetX,e.posY=e.offsetY;const s=_b2GetImgControlPrefix(t),o=document.getElementById(`${s}-scale-val`),i=document.getElementById(`${s}-brightness-val`),l=document.getElementById(`${s}-offset-val`);o&&(o.textContent=`${e.scale}%`),i&&(i.textContent=`${e.brightness}%`),l&&(l.textContent=`${e.offsetX}px, ${e.offsetY}px`),document.querySelectorAll(`[data-b2-fit-slot="${t}"]`).forEach(a=>{a.classList.toggle("active",a.dataset.fit===e.fit)}),document.querySelectorAll(`[data-b2-auto-slot="${t}"]`).forEach(a=>{const d=a.dataset.autoAdjust==="on";a.classList.toggle("active",d?e.autoAdjust!==!1:e.autoAdjust===!1)}),_b2ApplyImgSettingsToDom(n,t)},window._b2SetImgAutoAdjust=function(n,t,e){const s=_b2GetImgSettings(n,t);s.autoAdjust=!!e,e&&(s.manualCenter=!1),_b2SaveImgSettings(),typeof window._b2RefreshImageControls=="function"?window._b2RefreshImageControls(n,t):_b2ApplyImgSettingsToDom(n,t)},window._b2CenterImage=function(n,t){const e=_b2GetImgSettings(n,t);e.autoAdjust=!1,e.manualCenter=!0,e.offsetX=0,e.offsetY=0,e.posX=0,e.posY=0,_b2SaveImgSettings();const s=_b2GetImgControlPrefix(t),o=document.getElementById(`${s}-offset-val`);o&&(o.textContent="0px, 0px"),_b2ApplyImgSettingsToDom(n,t)};function _b2BuildImageControlGroup(n,t,e,s){const o=_b2GetImgSettings(n,t),i=(n||"").replace(/\\/g,"\\\\").replace(/'/g,"\\'"),l=_b2GetImgControlPrefix(t),a=s?"":"disabled";return`
    <div class="b2-players-slot-card ${s?"":"is-disabled"}">
      <div class="b2-players-slot-title">${e}${s?"":" <span>\uBBF8\uB4F1\uB85D</span>"}</div>
      <div class="b2-players-img-control-group">
        <div class="b2-players-img-label">\uC790\uB3D9 \uBCF4\uC815</div>
        <div class="b2-players-img-btns">
          <button class="b2-players-img-btn ${o.autoAdjust!==!1?"active":""}" data-b2-auto-slot="${t}" data-auto-adjust="on" ${a} onclick="_b2SetImgAutoAdjust('${i}','${t}',true)">ON</button>
          <button class="b2-players-img-btn ${o.autoAdjust===!1?"active":""}" data-b2-auto-slot="${t}" data-auto-adjust="off" ${a} onclick="_b2SetImgAutoAdjust('${i}','${t}',false)">OFF</button>
        </div>
      </div>
      <div class="b2-players-img-control-group">
        <div class="b2-players-img-label">\uD06C\uAE30 <span id="${l}-scale-val">${o.scale}%</span></div>
        <input type="range" class="b2-players-img-slider" min="50" max="220" value="${o.scale}" ${a}
          oninput="document.getElementById('${l}-scale-val').textContent=this.value+'%';_b2PreviewImgSetting('${i}','${t}','scale',this.value);this.dataset.pendingValue=this.value"
          onchange="_b2UpdateImgSetting('${i}','${t}','scale',this.value)">
      </div>
      <div class="b2-players-img-control-group">
        <div class="b2-players-img-label">\uBC1D\uAE30 <span id="${l}-brightness-val">${o.brightness}%</span></div>
        <input type="range" class="b2-players-img-slider" min="20" max="180" value="${o.brightness}" ${a}
          oninput="document.getElementById('${l}-brightness-val').textContent=this.value+'%';_b2PreviewImgSetting('${i}','${t}','brightness',this.value);this.dataset.pendingValue=this.value"
          onchange="_b2UpdateImgSetting('${i}','${t}','brightness',this.value)">
      </div>
      <div class="b2-players-img-control-group">
        <div class="b2-players-img-label">\uBC30\uCE58</div>
        <div class="b2-players-img-btns">
          <button class="b2-players-img-btn ${o.fit==="cover"?"active":""}" data-b2-fit-slot="${t}" data-fit="cover" ${a} onclick="_b2UpdateImgSetting('${i}','${t}','fit','cover')">\uCC44\uC6B0\uAE30</button>
          <button class="b2-players-img-btn ${o.fit==="contain"?"active":""}" data-b2-fit-slot="${t}" data-fit="contain" ${a} onclick="_b2UpdateImgSetting('${i}','${t}','fit','contain')">\uB9DE\uCDA4</button>
          <button class="b2-players-img-btn ${o.fit==="fill"?"active":""}" data-b2-fit-slot="${t}" data-fit="fill" ${a} onclick="_b2UpdateImgSetting('${i}','${t}','fit','fill')">\uB298\uB9AC\uAE30</button>
          <button class="b2-players-img-btn" ${a} onclick="_b2UpdateImgSetting('${i}','${t}','scale',200)">2\uBC30 \uD655\uB300</button>
          <button class="b2-players-img-btn" ${a} onclick="_b2CenterImage('${i}','${t}')">\uC911\uC559 \uC815\uB82C</button>
        </div>
      </div>
      <div class="b2-players-img-control-group">
        <div class="b2-players-img-label">\uC704\uCE58 <span id="${l}-offset-val">${o.offsetX}px, ${o.offsetY}px</span></div>
        <div class="b2-players-img-btns">
          <button class="b2-players-img-btn b2-players-img-btn-sm" ${a} onclick="_b2MoveImg('${i}','${t}',0,-12)">\uC0C1</button>
          <button class="b2-players-img-btn b2-players-img-btn-sm" ${a} onclick="_b2MoveImg('${i}','${t}',0,12)">\uD558</button>
          <button class="b2-players-img-btn b2-players-img-btn-sm" ${a} onclick="_b2MoveImg('${i}','${t}',-12,0)">\uC88C</button>
          <button class="b2-players-img-btn b2-players-img-btn-sm" ${a} onclick="_b2MoveImg('${i}','${t}',12,0)">\uC6B0</button>
          <button class="b2-players-img-btn b2-players-img-btn-sm" ${a} onclick="_b2ResetImgSettings('${i}','${t}');_b2RefreshImageControls('${i}','${t}')">\uCD08\uAE30\uD654</button>
        </div>
      </div>
    </div>
  `}window._b2UpdateImgSetting=function(n,t,e,s){s===void 0&&(s=e,e=t,t="primary"),e={zoom:"scale",fill:"fit",posX:"offsetX",posY:"offsetY"}[e]||e;const i=_b2GetImgSettings(n,t);(e==="fit"||e==="scale"||e==="offsetX"||e==="offsetY")&&(i.autoAdjust=!1,i.manualCenter=!1);const l=parseInt(s,10);i[e]=isNaN(l)?s:l,i.zoom=i.scale,i.fill=i.fit,i.posX=i.offsetX,i.posY=i.offsetY,_b2SaveImgSettings();const a=_b2GetImgControlPrefix(t),d=document.getElementById(`${a}-scale-val`),_=document.getElementById(`${a}-brightness-val`),v=document.getElementById(`${a}-offset-val`);d&&(d.textContent=`${i.scale}%`),_&&(_.textContent=`${i.brightness}%`),v&&(v.textContent=`${i.offsetX}px, ${i.offsetY}px`),document.querySelectorAll(`[data-b2-fit-slot="${t}"]`).forEach(p=>{p.classList.toggle("active",p.dataset.fit===i.fit)}),document.querySelectorAll(`[data-b2-auto-slot="${t}"]`).forEach(p=>{const I=p.dataset.autoAdjust==="on";p.classList.toggle("active",I?i.autoAdjust!==!1:i.autoAdjust===!1)}),_b2ApplyImgSettingsToDom(n,t)},window._b2MoveImg=function(n,t,e,s){s===void 0&&(s=e,e=t,t="primary");const o=_b2GetImgSettings(n,t);o.autoAdjust=!1,o.manualCenter=!1,o.offsetX+=e,o.offsetY+=s,o.posX=o.offsetX,o.posY=o.offsetY,_b2SaveImgSettings();const i=_b2GetImgControlPrefix(t),l=document.getElementById(`${i}-offset-val`);l&&(l.textContent=`${o.offsetX}px, ${o.offsetY}px`),_b2ApplyImgSettingsToDom(n,t)};try{window.Board2ImageUtils=window.Board2ImageUtils||{getImgSettings:_b2GetImgSettings,renderCfgImgSettings:_renderCfgImgSettings}}catch(n){}

/* board2-card-utils.js */
function _b2NameTag(e,t,r){const n=e.crewName&&typeof _gcCrew=="function"&&_gcCrew(e.crewName)||"",a=(e.name||"").replace(/'/g,"\\'");return`
    <div style="display:flex;align-items:center;gap:6px;padding:3px 8px 3px 3px;border-radius:20px;cursor:pointer;transition:background .12s"
      onmouseover="this.style.background='${t}14'"
      onmouseout="this.style.background='transparent'">
      <div onclick="openPlayerModal('${a}')" style="display:flex;align-items:center;gap:6px;flex:1">
      ${_b2Avatar(e,n||t,58)}
      <span style="font-weight:700;font-size:18px;color:var(--text1);white-space:nowrap;${e.inactive?"opacity:.6":""}">${e.name||""}</span>
      ${e.race&&e.race!=="N"?`<span class="rbadge r${e.race}" style="font-size:10px;flex-shrink:0">${e.race}</span>`:""}
      ${r&&e.tier?`<span style="font-size:10px;font-weight:700;padding:1px 5px;border-radius:4px;background:${getTierBtnColor(e.tier)};color:${getTierBtnTextColor(e.tier)||"#fff"};flex-shrink:0">${e.tier}</span>`:""}
      ${e.inactive?'<span style="font-size:9px;background:#fff7ed;color:#9a3412;border-radius:4px;padding:1px 4px;font-weight:700;flex-shrink:0">\u23F8\uFE0F</span>':""}
      </div>
    </div>`}function _b2PlayerRowCompact(e,t){const r=getTierBtnColor(e.tier||""),n=getTierBtnTextColor(e.tier||"")||"#fff",a=(e.name||"").replace(/'/g,"\\'");return`
    <div style="display:flex;align-items:center;gap:8px;cursor:pointer;flex:1"
      onmouseover="this.querySelector('.b2name').style.color='${t}'"
      onmouseout="this.querySelector('.b2name').style.color='var(--text1)'">
      <div onclick="openPlayerModal('${a}')" style="display:flex;align-items:center;gap:8px;flex:1">
      ${_b2Avatar(e,t,58)}
      <span class="b2name" style="font-weight:700;font-size:18px;color:var(--text1);transition:color .1s;${e.inactive?"opacity:.6":""}">${e.name||""}</span>
      ${e.inactive?'<span style="font-size:9px;background:#fff7ed;color:#9a3412;border-radius:4px;padding:1px 4px;font-weight:700;flex-shrink:0">\u23F8\uFE0F</span>':""}
      ${e.race&&e.race!=="N"?`<span class="rbadge r${e.race}" style="font-size:11px;flex-shrink:0">${e.race}</span>`:""}
      <span style="font-size:11px;font-weight:700;padding:2px 8px;border-radius:6px;background:${r};color:${n}">${e.tier||"?"}</span>
      </div>
    </div>`}function _b2Chip(e,t){const r=e.crewName&&typeof _gcCrew=="function"&&_gcCrew(e.crewName)||"",n=`border:1.5px solid ${t}44`;return`
    <div onclick="openPlayerModal('${(e.name||"").replace(/'/g,"\\'")}')"
      style="display:flex;align-items:center;gap:7px;padding:5px 13px 5px 5px;border-radius:24px;background:var(--white);${n};cursor:pointer;box-shadow:0 1px 3px #0001;transition:transform .1s,box-shadow .1s"
      onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 10px ${t}33'"
      onmouseout="this.style.transform='';this.style.boxShadow='0 1px 3px #0001'">
      ${_b2Avatar(e,r||t,36)}
      <span style="font-weight:700;font-size:13px;color:var(--text1);white-space:nowrap">${e.name||""}</span>
    </div>`}function _b2Avatar(e,t,r){const n={T:"T",Z:"Z",P:"P",N:"?"}[e.race||"N"]||"?",a=typeof window.escAttr=="function"?window.escAttr:s=>String(s||"").replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;"),c=typeof window.escJS=="function"?window.escJS:s=>String(s||"").replace(/\\/g,"\\\\").replace(/'/g,"\\'").replace(/\r/g,"\\r").replace(/\n/g,"\\n"),u=r||28;let p=1;try{const s=parseInt(localStorage.getItem("su_bcp_size")||"26",10);p=Math.max(.6,Math.min(2.4,s/26))}catch(s){console.warn("[_b2Avatar] \uC544\uBC14\uD0C0 \uD06C\uAE30 \uC124\uC815 \uB85C\uB4DC \uC2E4\uD328:",s.message)}const o=Math.round(u*p),i=Math.round(o*.38),l=getStatusIcon(e.name),d=getStatusIconHTML(e.name),w=a(t),y=c(t),b=c(n),$=c(e&&e.name?e.name:""),f=o/2,g=i/2,m=Math.round(f*.134-g),_=Math.round(f*.5-g),x=l&&(typeof window._siIsImg=="function"?window._siIsImg(l):!1),v=x?`<img src="${a(l)}" crossorigin="anonymous" style="width:${i}px;height:${i}px;border-radius:50%;object-fit:cover;opacity:.82" onerror="this.style.display='none';console.warn('[\uD604\uD669\uD310] \uC0C1\uD0DC \uC544\uC774\uCF58 \uB85C\uB4DC \uC2E4\uD328:', this.src)">`:d.replace(/margin-left:[^;]+;/g,"").replace(/font-size:[^;]+;/g,""),h=d?`<span style="position:absolute;top:${m}px;right:${_}px;width:${i}px;height:${i}px;border-radius:50%;background:${x?"rgba(255,255,255,.72)":"transparent"};overflow:hidden;display:flex;align-items:center;justify-content:center;font-size:${Math.round(i*.82)}px;line-height:1;filter:drop-shadow(0 1px 2px rgba(0,0,0,.65))">${v}</span>`:"";return e.photo?`<span style="width:${o}px;height:${o}px;flex-shrink:0;display:inline-flex;position:relative">
      <img src="${a(toHttpsUrl(e.photo))}" crossorigin="anonymous" loading="lazy" decoding="async" fetchpriority="low" data-b2-photo="1" style="width:${o}px;height:${o}px;border-radius:var(--su_profile_radius,6px);clip-path:var(--su_profile_clip,none);object-fit:cover;flex-shrink:0" onerror="console.warn('[\uD604\uD669\uD310] \uC120\uC218 \uD504\uB85C\uD544 \uC774\uBBF8\uC9C0 \uB85C\uB4DC \uC2E4\uD328:', this.src, '\uC120\uC218:', '${$}');this.parentNode.innerHTML=_b2AvatarFallback('${b}','${y}',${o})">
      ${h}
    </span>`:`<span style="width:${o}px;height:${o}px;border-radius:var(--su_profile_radius,6px);clip-path:var(--su_profile_clip,none);background:${w};display:inline-flex;align-items:center;justify-content:center;font-weight:900;font-size:${Math.round(o*.45)}px;color:#fff;flex-shrink:0;position:relative">${n}${h}</span>`}function _b2AvatarFallback(e,t,r){const n=r||28;return`<span style="width:${n}px;height:${n}px;border-radius:var(--su_profile_radius,6px);clip-path:var(--su_profile_clip,none);background:${t};display:inline-flex;align-items:center;justify-content:center;font-weight:900;font-size:${Math.round(n*.45)}px;color:#fff;flex-shrink:0;border:2px solid ${t}88">${e}</span>`}try{window._b2NameTag=_b2NameTag,window._b2PlayerRowCompact=_b2PlayerRowCompact,window._b2Chip=_b2Chip,window._b2Avatar=_b2Avatar,window.Board2CardUtils=window.Board2CardUtils||{nameTag:_b2NameTag,playerRowCompact:_b2PlayerRowCompact,chip:_b2Chip,avatar:_b2Avatar}}catch(e){}

/* board2-core.js */
var k,T,I,$,B,S;function _b2InjectAndRunScripts(n){n.querySelectorAll("script").forEach(r=>{const i=document.createElement("script");r.src?i.src=r.src:i.textContent=r.textContent,r.parentNode.replaceChild(i,r)})}if(typeof window._siIsImg!="function"&&(window._siIsImg=function(n){return typeof n=="string"&&(n.startsWith("http")||n.startsWith("data:"))}),typeof window._siRender!="function"&&(window._siRender=function(n,t){return t=t||"16px",n?window._siIsImg(n)?`<img src="${n}" style="width:${t};height:${t};object-fit:contain;vertical-align:middle;flex-shrink:0" onerror="this.style.display='none'">`:n:""}),typeof _b2NameTag!="function")var _b2NameTag=function(n,t,r){try{if(window.Board2CardUtils&&typeof window.Board2CardUtils.nameTag=="function")return window.Board2CardUtils.nameTag(n,t,r);if(typeof window._b2NameTag=="function")return window._b2NameTag(n,t,r)}catch(h){}const i=n&&n.name||"",o=String(i).replace(/'/g,"\\'"),a=n&&n.tier||"",c=n&&n.race||"",u=!!(n&&n.inactive),g=typeof getTierBtnColor=="function"?getTierBtnColor(a):"#64748b",y=typeof getTierBtnTextColor=="function"&&getTierBtnTextColor(a)||"#fff";return`
      <div style="display:flex;align-items:center;gap:6px;padding:6px 10px;border-radius:20px;cursor:pointer;transition:background .12s"
        onmouseover="this.style.background='${t}14'"
        onmouseout="this.style.background='transparent'"
        onclick="openPlayerModal('${o}')">
        <span style="font-weight:700;font-size:18px;color:var(--text1);white-space:nowrap;${u?"opacity:.6":""}">${i}</span>
        ${c&&c!=="N"?`<span class="rbadge r${c}" style="font-size:10px;flex-shrink:0">${c}</span>`:""}
        ${r&&a?`<span style="font-size:10px;font-weight:700;padding:1px 5px;border-radius:4px;background:${g};color:${y};flex-shrink:0">${a}</span>`:""}
      </div>`};var _b2View="univ",_b2SaveUniv="\uC804\uCCB4",_b2LineupUniv="",_b2LineupCardMode=(()=>{try{const n=localStorage.getItem("su_b2_lineup_card_mode")||"default";return n==="list"?"default":n}catch(n){return"default"}})();function _b2SetLineupCardMode(n){_b2LineupCardMode=["default","stat","table"].includes(String(n||""))?String(n):"default";try{localStorage.setItem("su_b2_lineup_card_mode",_b2LineupCardMode)}catch(r){}const t=document.getElementById("b2-content");t&&(t.innerHTML=_b2LineupView(),typeof injectUnivIcons=="function"&&injectUnivIcons(t)),typeof render=="function"&&render()}var _b2Collapsed=new Set,_b2PlayersUnivFilter="\uC804\uCCB4",_b2PlayersFilter="all",_b2PlayersTierFilter="\uC804\uCCB4",_b2SelectedPlayer=null,_b2PlayersSort="default";const _b2BgImageMeta={};let _b2AutoFitResizeBound=!1;function _b2LoadBgImageMeta(n,t){try{const r=toHttpsUrl(n||"");if(!r){t&&t(null);return}if(_b2BgImageMeta[r]&&_b2BgImageMeta[r].w&&_b2BgImageMeta[r].h){t&&t(_b2BgImageMeta[r]);return}const i=new Image;i.onload=function(){_b2BgImageMeta[r]={w:i.naturalWidth||0,h:i.naturalHeight||0},t&&t(_b2BgImageMeta[r])},i.onerror=function(){t&&t(null)},i.src=r}catch(r){t&&t(null)}}function _b2ResolveBgAutoFit(n,t,r){const i=String(n||"auto");if(i==="cover"||i==="contain"||i==="fill")return i;const o=window.innerWidth||1280;if(!t||!t.width||!t.height)return o<=900?"contain":"cover";if(!r||!r.w||!r.h)return o<=640||t.width<300?"contain":"cover";const a=t.width/t.height,c=r.w/r.h,u=Math.abs(Math.log(c/a));return o<=640?u>.32?"contain":"cover":o<=1024?u>.3?"contain":"cover":c>1.78||c<.64||u>.4?"contain":"cover"}function _b2ResolveImgAutoFit(n,t,r,i){const o=String(t||"auto");if(o==="cover"||o==="contain"||o==="fill")return o;const a=window.innerWidth||1280;if(!r||!r.width||!r.height)return n==="thumb"?a<=900?"contain":"cover":n==="crew"?a<=1024?"contain":"cover":a<=900?"contain":"cover";if(!i||!i.w||!i.h)return a<=640||n==="thumb"&&r.width<100?"contain":"cover";const c=r.width/r.height,u=i.w/i.h,g=Math.abs(Math.log(u/c));return n==="thumb"?a<=640?g>.24?"contain":"cover":a<=1024?g>.22?"contain":"cover":u>1.32||u<.76||g>.24?"contain":"cover":n==="crew"?a<=640?g>.26?"contain":"cover":a<=1024?g>.24?"contain":"cover":u>1.26||u<.78||g>.27?"contain":"cover":_b2ResolveBgAutoFit(t,r,i)}function _b2ResolveImgAutoPosition(n,t,r,i){if(t!=="cover")return"center center";const o=i&&i.w&&i.h?i.w/i.h:1,a=r&&r.width&&r.height?r.width/r.height:1;if(!o||!a)return"center center";const c=a/o;return n==="thumb"?c>1.25?"top center":"center center":n==="crew"?c>1.9&&r&&r.height>=150?"bottom center":c>1.25?"top center":"center center":n==="bg"?c>2.1&&r&&r.height>=260?"bottom center":c>1.35?"top center":"center center":"center center"}function _b2ApplyUnivWatermarkSizing(n){}function _b2ApplyBgAutoSizing(n){try{const t=n||document,r=[];t&&t.matches&&t.matches(".b2-bg-layer[data-bg-size-mode]")&&r.push(t),t&&t.querySelectorAll&&r.push(...t.querySelectorAll(".b2-bg-layer[data-bg-size-mode]")),r.forEach(o=>{const a=o.getAttribute("data-bg-size-mode")||"auto",c=o.closest(".b2-bg-host")||o.parentElement,u=c&&c.getBoundingClientRect?c.getBoundingClientRect():null,g=o.getAttribute("data-bg-src")||"";_b2LoadBgImageMeta(g,y=>{try{const h=_b2ResolveBgAutoFit(a,u,y);o.style.backgroundSize=h,o.setAttribute("data-bg-size-resolved",h)}catch(h){}})});const i=[];t&&t.matches&&t.matches(".b2-fit-auto[data-fit-kind]")&&i.push(t),t&&t.querySelectorAll&&i.push(...t.querySelectorAll(".b2-fit-auto[data-fit-kind]")),i.forEach(o=>{const a=o.getAttribute("data-fit-mode")||"auto",c=o.getAttribute("data-fit-kind")||"thumb",u=o.getBoundingClientRect?o.getBoundingClientRect():null,g=o.currentSrc||o.getAttribute("src")||"";_b2LoadBgImageMeta(g,y=>{try{const h=_b2ResolveImgAutoFit(c,a,u,y);o.style.objectFit=h;const x=_b2ResolveImgAutoPosition(c,h,u,y);o.style.objectPosition=x,o.setAttribute("data-fit-resolved",h)}catch(h){}})})}catch(t){}}let _b2BgLazyIO=null;function _b2LazyLoadBgLayers(n){try{const t=n||document,r=[];if(t&&t.matches&&t.matches(".b2-bg-layer[data-bg-src]")&&r.push(t),t&&t.querySelectorAll&&r.push(...t.querySelectorAll(".b2-bg-layer[data-bg-src]")),!r.length)return;const i=o=>{try{if(!o||o.getAttribute("data-bg-loaded")==="1")return;let a=o.getAttribute("data-bg-src")||"";if(typeof toHttpsUrl=="function"){const u=toHttpsUrl(a);u&&(a=u)}const c=o.getAttribute("data-bg-pos")||"center center";if(a){o.style.backgroundImage=`url("${String(a).replace(/"/g,'\\"')}")`,o.style.backgroundPosition=c,o.style.backgroundRepeat="no-repeat",o.setAttribute("data-bg-loaded","1");try{_b2ApplyBgAutoSizing(o)}catch(u){}}}catch(a){}};if(!(window&&"IntersectionObserver"in window)){r.forEach(i);return}_b2BgLazyIO||(_b2BgLazyIO=new IntersectionObserver(o=>{o.forEach(a=>{if(a&&(a.isIntersecting||(a.intersectionRatio||0)>0)){i(a.target);try{_b2BgLazyIO.unobserve(a.target)}catch(c){}}})},{root:null,rootMargin:"600px 0px",threshold:.01})),r.forEach(o=>{if(!(!o||o.getAttribute("data-bg-loaded")==="1"))try{_b2BgLazyIO.observe(o)}catch(a){i(o)}})}catch(t){}}function _b2BindAutoFitResize(){if(_b2AutoFitResizeBound)return;_b2AutoFitResizeBound=!0;const n=()=>{try{const t=document.getElementById("b2-content");if(!t)return;requestAnimationFrame(()=>{_b2ApplyBgAutoSizing(t);try{_b2View==="players"&&_b2SelectedPlayer&&typeof _b2ApplyImgSettingsToDom=="function"&&(_b2ApplyImgSettingsToDom(_b2SelectedPlayer.name,"primary"),_b2ApplyImgSettingsToDom(_b2SelectedPlayer.name,"secondary"),typeof window._b2RefreshImageControls=="function"&&(window._b2RefreshImageControls(_b2SelectedPlayer.name,"primary"),window._b2RefreshImageControls(_b2SelectedPlayer.name,"secondary")))}catch(r){}})}catch(t){}};window.addEventListener("resize",n),window.addEventListener("orientationchange",()=>setTimeout(n,80)),document.addEventListener("visibilitychange",()=>{document.visibilityState==="visible"&&setTimeout(n,60)})}function _b2ThisWeekRange(){const n=new Date,t=n.getDay(),r=new Date(n);r.setHours(0,0,0,0),r.setDate(n.getDate()+(t===0?-6:1-t));const i=new Date(n);i.setHours(23,59,59,999);const o=a=>parseInt(a.toISOString().slice(0,10).replace(/-/g,""));return{fromN:o(r),toN:o(i)}}function _b2DateNum(n){const t=String(n||"").replace(/\D/g,"");return t.length<8?0:parseInt(t.slice(0,8),10)||0}var b2LabelAlpha=typeof b2LabelAlpha!="undefined"?b2LabelAlpha:(k=J("su_b2la"))!=null?k:16,b2BgAlpha=typeof b2BgAlpha!="undefined"?b2BgAlpha:(T=J("su_b2ba"))!=null?T:9,b2BgImgAlpha=typeof b2BgImgAlpha!="undefined"?b2BgImgAlpha:(I=J("su_b2bia"))!=null?I:12,b2FreeBgAlpha=typeof b2FreeBgAlpha!="undefined"?b2FreeBgAlpha:($=J("su_b2fba"))!=null?$:25,b2FreeTierBgAlpha=typeof b2FreeTierBgAlpha!="undefined"?b2FreeTierBgAlpha:(B=J("su_b2ftba"))!=null?B:15,b2ProfileBgAlpha=typeof b2ProfileBgAlpha!="undefined"?b2ProfileBgAlpha:(S=J("su_b2pba"))!=null?S:10;if(typeof _b2AlphaHex!="function")var _b2AlphaHex=function(n){return Math.round((n||0)/100*255).toString(16).padStart(2,"0")};function _b2ToggleCard(n,t){_b2Collapsed.has(t)?_b2Collapsed.delete(t):_b2Collapsed.add(t);const r=n.closest("[data-b2card]");if(!r)return;const i=r.querySelector(".b2-card-body");i&&(i.style.display=_b2Collapsed.has(t)?"none":""),n.textContent=_b2Collapsed.has(t)?"\u25B6":"\u25BC"}function _b2CollapseAll(){_b2VisUnivs().filter(t=>t.name!=="\uBB34\uC18C\uC18D").forEach(t=>_b2Collapsed.add(t.name));const n=document.getElementById("b2-content");n&&(n.innerHTML=_b2UnivView(),injectUnivIcons(n))}function _b2ExpandAll(){_b2Collapsed.clear();const n=document.getElementById("b2-content");n&&(n.innerHTML=_b2UnivView(),injectUnivIcons(n))}const _B2_ROLE_ORDER=["\uC774\uC0AC\uC7A5","\uB3D9\uC544\uB9AC \uD68C\uC7A5","\uCD1D\uC7A5","\uBD80\uCD1D\uC7A5","\uAD50\uC218","\uCF54\uCE58","\uC120\uC7A5","\uB3D9\uC544\uB9AC\uC7A5","\uBC18\uC7A5","\uCD1D\uAD04"];function _b2RoleRank(n){const t=_B2_ROLE_ORDER.indexOf(n.role||"");return t>=0?t:99}function _b2VisUnivs(){return getAllUnivs().filter(n=>!n.hidden&&!n.dissolved)}function rBoard2(n,t){try{let a=function(e,s,l){return`<button class="pill b2-tab-pill ${_b2View===e?"on":""}" style="flex-shrink:0;white-space:nowrap" onclick="_b2View='${e}';render();this.blur()">${l}</button>`};var r=a;t.innerText="\u{1F4CA} \uD604\uD669\uD310";const i=e=>String(e||"").trim();(!window._b2DissSet||typeof window._b2DissSetSig=="undefined"||window._b2DissSetSig!==(typeof univCfg!="undefined"?univCfg.length:0))&&(window._b2DissSet=new Set((typeof univCfg!="undefined"?univCfg:[]).filter(e=>e.dissolved||e.hidden).map(e=>String(e.name||"").trim())),window._b2DissSetSig=typeof univCfg!="undefined"?univCfg.length:0);const o=_b2VisUnivs().filter(e=>e.name!=="\uBB34\uC18C\uC18D");_b2View==="old"&&!isLoggedIn&&(_b2View="univ");let c="";if(_b2View==="univ")c=`<div style="display:flex;align-items:center;gap:6px;flex-shrink:0">
      <div style="position:relative">
        <select id="b2-save-sel" class="b2-toolbar-select" onchange="_b2SaveUniv=this.value" style="padding:4px 28px 4px 10px;border-radius:8px;border:1px solid var(--border2);font-size:12px;background:var(--white);color:var(--text2);appearance:none;cursor:pointer">
          <option value="\uC804\uCCB4">\u{1F3EB} \uC804\uCCB4</option>
          ${o.map(e=>`<option value="${e.name}"${_b2SaveUniv===e.name?" selected":""}>${e.name}</option>`).join("")}
        </select>
        <svg style="position:absolute;right:6px;top:50%;transform:translateY(-50%);pointer-events:none;color:var(--gray-l)" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m6 9 6 6 6-6"/></svg>
      </div>
      <button class="b2-toolbar-btn" onclick="saveB2Img()" style="padding:4px 12px;border-radius:8px;border:1px solid var(--border2);background:var(--white);color:var(--text2);font-size:12px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:4px;margin-bottom:0">\u{1F4F7} \uC774\uBBF8\uC9C0\uC800\uC7A5</button>
    </div>`;else if(_b2View==="free")c=`<div style="flex-shrink:0">
      <button class="b2-toolbar-btn" onclick="saveB2FreeImg()" style="padding:4px 12px;border-radius:8px;border:1px solid var(--border2);background:var(--white);color:var(--text2);font-size:12px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:4px">\u{1F4F7} \uC774\uBBF8\uC9C0\uC800\uC7A5</button>
    </div>`;else if(_b2View==="femco")c=`<div style="display:flex;gap:6px;flex-shrink:0">
      <button class="b2-toolbar-btn" onclick="saveB2FemcoAllImg()" style="padding:4px 12px;border-radius:8px;border:1px solid var(--border2);background:var(--white);color:var(--text2);font-size:12px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:4px">\u{1F4BE} \uC804\uCCB4 \uC800\uC7A5</button>
    </div>`;else if(_b2View==="lineup"){(!_b2LineupUniv||!o.some(s=>s.name===_b2LineupUniv))&&(_b2LineupUniv=o[0]?o[0].name:"");const e=(s,l)=>`<button type="button" class="b2-toolbar-btn" onclick="_b2SetLineupCardMode('${s}')" style="padding:4px 10px;border-radius:8px;border:1px solid ${_b2LineupCardMode===s?"#2563eb":"var(--border2)"};background:${_b2LineupCardMode===s?"linear-gradient(135deg,#eff6ff,#dbeafe)":"var(--white)"};color:${_b2LineupCardMode===s?"#1d4ed8":"var(--text2)"};font-size:12px;font-weight:${_b2LineupCardMode===s?900:700};cursor:pointer;margin-bottom:0">${l}</button>`;c=`<div style="display:flex;align-items:center;gap:6px;flex-shrink:0;flex-wrap:wrap">
      <div style="position:relative">
        <select id="b2-lineup-sel" class="b2-toolbar-select" onchange="_b2LineupUniv=this.value;document.getElementById('b2-content').innerHTML=_b2LineupView();injectUnivIcons(document.getElementById('b2-content'));render();" style="padding:4px 28px 4px 10px;border-radius:8px;border:1px solid var(--border2);font-size:12px;background:var(--white);color:var(--text2);appearance:none;cursor:pointer">
          ${o.map(s=>`<option value="${s.name}"${_b2LineupUniv===s.name?" selected":""}>${s.name}</option>`).join("")}
        </select>
        <svg style="position:absolute;right:6px;top:50%;transform:translateY(-50%);pointer-events:none;color:var(--gray-l)" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m6 9 6 6 6-6"/></svg>
      </div>
      <div style="display:flex;align-items:center;gap:6px">
        <span style="font-size:11px;font-weight:800;color:var(--text3);flex-shrink:0">\uBAA8\uB4DC</span>
        <div style="display:flex;gap:4px">
          ${e("default","\u{1F5BC}\uFE0F \uAE30\uBCF8")}
          ${e("stat","\u{1F4CA} \uD1B5\uACC4\uCE74\uB4DC")}
          ${e("table","\u{1F5C2}\uFE0F \uD14C\uC774\uBE14")}
        </div>
      </div>
      <button class="b2-toolbar-btn" onclick="saveB2LineupImg()" style="padding:4px 12px;border-radius:8px;border:1px solid var(--border2);background:var(--white);color:var(--text2);font-size:12px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:4px;margin-bottom:0">\u{1F4F7} \uC774\uBBF8\uC9C0\uC800\uC7A5</button>
    </div>`}const u="\u{1F464} \uD504\uB85C\uD544",g=typeof univCfg!="undefined"?new Set((univCfg.filter(e=>e.dissolved)||[]).map(e=>i(e.name))):new Set,y=typeof univCfg!="undefined"?new Set((univCfg.filter(e=>e.hidden)||[]).map(e=>i(e.name))):new Set,h=players.filter(e=>{const s=i(e==null?void 0:e.univ);return!e.hidden&&!e.retired&&!e.hideFromBoard&&!g.has(s)&&!y.has(s)}),x=[...new Set(h.map(e=>i(e.univ)).filter(e=>e&&e!=="\uBB34\uC18C\uC18D"))];typeof univCfg!="undefined"?x.sort((e,s)=>{const l=univCfg.findIndex(v=>v.name===e),b=univCfg.findIndex(v=>v.name===s);return(l>=0?l:999)-(b>=0?b:999)}):x.sort();const L=_b2PlayersUnivFilter&&_b2PlayersUnivFilter!=="\uC804\uCCB4"?`<button class="pill b2-current-filter" style="flex-shrink:0;white-space:nowrap"
        onclick="_b2PlayersUnivFilter='\uC804\uCCB4';document.getElementById('b2-content').innerHTML=_b2PlayersView();setTimeout(()=>{if(_b2SelectedPlayer)_b2UpdateMainDisplay(_b2SelectedPlayer.name)},0)">\uD604\uC7AC: ${_b2PlayersUnivFilter} \u2715</button>`:"",M=_b2View==="players"?`
    <div class="b2-nav-playerfilters" style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;flex-shrink:0">
      <div style="width:1px;height:24px;background:var(--border2);display:inline-block"></div>
      <div style="position:relative">
        <select id="b2-players-univ-sel" class="b2-toolbar-select" onchange="_b2PlayersUnivFilter=this.value;document.getElementById('b2-content').innerHTML=_b2PlayersView();setTimeout(()=>{if(_b2SelectedPlayer)_b2UpdateMainDisplay(_b2SelectedPlayer.name)},0)" style="padding:6px 28px 6px 12px;border-radius:20px;border:1px solid var(--border2);font-size:13px;background:var(--white);color:var(--text2);appearance:none;cursor:pointer">
          <option value="\uC804\uCCB4" ${_b2PlayersUnivFilter==="\uC804\uCCB4"?"selected":""}>\u{1F3EB} \uC804\uCCB4 \uB300\uD559</option>
          ${x.map(e=>`<option value="${e}" ${_b2PlayersUnivFilter===e?"selected":""}>${e}</option>`).join("")}
        </select>
        <svg style="position:absolute;right:8px;top:50%;transform:translateY(-50%);pointer-events:none;color:var(--gray-l)" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m6 9 6 6 6-6"/></svg>
      </div>
      ${L}
      <div style="position:relative">
        <select id="b2-players-race-sel" class="b2-toolbar-select" onchange="_b2PlayersFilter=this.value;document.getElementById('b2-content').innerHTML=_b2PlayersView();setTimeout(()=>{if(_b2SelectedPlayer)_b2UpdateMainDisplay(_b2SelectedPlayer.name)},0)" style="padding:6px 28px 6px 12px;border-radius:20px;border:1px solid var(--border2);font-size:13px;background:var(--white);color:var(--text2);appearance:none;cursor:pointer">
          <option value="all" ${_b2PlayersFilter==="all"?"selected":""}>\u{1F3AE} \uC804\uCCB4 \uC885\uC871</option>
          <option value="P" ${_b2PlayersFilter==="P"?"selected":""}>\u{1F52E} \uD504\uB85C\uD1A0\uC2A4</option>
          <option value="T" ${_b2PlayersFilter==="T"?"selected":""}>\u2694\uFE0F \uD14C\uB780</option>
          <option value="Z" ${_b2PlayersFilter==="Z"?"selected":""}>\u{1F98E} \uC800\uADF8</option>
        </select>
        <svg style="position:absolute;right:8px;top:50%;transform:translateY(-50%);pointer-events:none;color:var(--gray-l)" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m6 9 6 6 6-6"/></svg>
      </div>
      <div style="position:relative">
        <select id="b2-players-tier-sel" class="b2-toolbar-select" onchange="_b2PlayersTierFilter=this.value;document.getElementById('b2-content').innerHTML=_b2PlayersView();setTimeout(()=>{if(_b2SelectedPlayer)_b2UpdateMainDisplay(_b2SelectedPlayer.name)},0)" style="padding:6px 28px 6px 12px;border-radius:20px;border:1px solid var(--border2);font-size:13px;background:var(--white);color:var(--text2);appearance:none;cursor:pointer">
          <option value="\uC804\uCCB4" ${_b2PlayersTierFilter==="\uC804\uCCB4"?"selected":""}>\u{1F3C5} \uC804\uCCB4 \uD2F0\uC5B4</option>
          ${(typeof TIERS!="undefined"?TIERS:[]).map(e=>`<option value="${e}" ${_b2PlayersTierFilter===e?"selected":""}>${e}\uD2F0\uC5B4</option>`).join("")}
        </select>
        <svg style="position:absolute;right:8px;top:50%;transform:translateY(-50%);pointer-events:none;color:var(--gray-l)" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m6 9 6 6 6-6"/></svg>
      </div>
    </div>
  `:"",A=a("weekly","#f59e0b",typeof getTabLabel=="function"?getTabLabel("board2","weekly","\u{1F4C5} \uBE0C\uB9AC\uD551"):"\u{1F4C5} \uBE0C\uB9AC\uD551"),U=isLoggedIn?a("old","#64748b",typeof getTabLabel=="function"?getTabLabel("board2","old","\u{1F4CA} \uAD6C\uD604\uD669\uD310"):"\u{1F4CA} \uAD6C\uD604\uD669\uD310"):"",C=a("summary","#10b981",typeof getTabLabel=="function"?getTabLabel("board2","summary","\u{1F4CA} \uC694\uC57D"):"\u{1F4CA} \uC694\uC57D"),E=a("compare","#ef4444",typeof getTabLabel=="function"?getTabLabel("board2","compare","\u2694\uFE0F \uB300\uD559\uBE44\uAD50"):"\u2694\uFE0F \uB300\uD559\uBE44\uAD50"),O=a("ranking","#f97316",typeof getTabLabel=="function"?getTabLabel("board2","ranking","\u{1F947} \uB7AD\uD0B9"):"\u{1F947} \uB7AD\uD0B9"),H=a("radar","#a855f7",typeof getTabLabel=="function"?getTabLabel("board2","radar","\u{1F578}\uFE0F \uB808\uC774\uB354"):"\u{1F578}\uFE0F \uB808\uC774\uB354"),V=a("heatmap","#db2777",typeof getTabLabel=="function"?getTabLabel("board2","heatmap","\u{1F5FA}\uFE0F \uD788\uD2B8\uB9F5"):"\u{1F5FA}\uFE0F \uD788\uD2B8\uB9F5"),z=a("bubble","#0891b2",typeof getTabLabel=="function"?getTabLabel("board2","bubble","\u{1F310} \uBC84\uBE14\uB9F5"):"\u{1F310} \uBC84\uBE14\uB9F5"),P=c,R=_b2View==="players"?"#b2-nav.b2-nav-new { padding-top: 0; }":"",{fromN:j,toN:D}=_b2ThisWeekRange(),F=_b2DateNum;try{const e=(function(){try{return[miniM,univM,ckM,proM,ttM,comps,tourneys,proTourneys,indM,gjM].map(l=>Array.isArray(l)?l.length:0).join("|")}catch(s){return""}})();if(typeof window.__b2_hist_sig=="undefined"&&(window.__b2_hist_sig=""),window.__b2_hist_sig!==e&&typeof _rebuildAllPlayerHistoryCore=="function"){const s=e.split("|").some(b=>Number(b)>0),l=typeof players!="undefined"&&Array.isArray(players)?players.some(b=>Array.isArray(b==null?void 0:b.history)&&b.history.length):!1;s&&!l&&_rebuildAllPlayerHistoryCore(),window.__b2_hist_sig=e}}catch(e){}const w=(()=>{const e=new Set,s=f=>{const p=String(f||"").trim();p&&e.add(p)},l=f=>{(f||[]).forEach(p=>s(typeof p=="string"?p:(p==null?void 0:p.name)||p))},b=f=>{((f==null?void 0:f.sets)||[]).forEach(p=>{((p==null?void 0:p.games)||[]).forEach(d=>{s(d==null?void 0:d.playerA),s(d==null?void 0:d.playerB),s(d==null?void 0:d.a1),s(d==null?void 0:d.a2),s(d==null?void 0:d.b1),s(d==null?void 0:d.b2),s(d==null?void 0:d.a),s(d==null?void 0:d.b),l(d==null?void 0:d.teamA),l(d==null?void 0:d.teamB)})})},v=f=>{!Array.isArray(f)||!f.length||f.forEach(p=>{const d=F((p==null?void 0:p.d)||(p==null?void 0:p.date)||"");d<j||d>D||(s(p==null?void 0:p.wName),s(p==null?void 0:p.lName),b(p))})};v(typeof miniM!="undefined"?miniM:[]),v(typeof univM!="undefined"?univM:[]),v(typeof ckM!="undefined"?ckM:[]),v(typeof proM!="undefined"?proM:[]),v(typeof ttM!="undefined"?ttM:[]),v(typeof comps!="undefined"?comps:[]),v(typeof indM!="undefined"?indM:[]),v(typeof gjM!="undefined"?gjM:[]);const W=new Set(h.map(f=>String((f==null?void 0:f.name)||"").trim()).filter(Boolean));let _=0;return e.forEach(f=>{W.has(f)&&_++}),_})(),m={univ:{label:"\uB300\uD559\uBCC4",desc:"\uB300\uD559 \uCE74\uB4DC \uC911\uC2EC\uC73C\uB85C \uC18C\uC18D \uD604\uD669\uACFC \uD65C\uB3D9 \uD750\uB984\uC744 \uBE60\uB974\uAC8C \uC0B4\uD3B4\uBCFC \uC218 \uC788\uC2B5\uB2C8\uB2E4."},free:{label:"\uBB34\uC18C\uC18D",desc:"\uBB34\uC18C\uC18D \uC2A4\uD2B8\uB9AC\uBA38\uB9CC \uBAA8\uC544\uC11C \uD604\uC7AC \uACF5\uBC31 \uAD6C\uAC04\uACFC \uAC1C\uBCC4 \uC0C1\uD0DC\uB97C \uBCF4\uAE30 \uC27D\uAC8C \uC815\uB9AC\uD569\uB2C8\uB2E4."},femco:{label:"\uD3A8\uCF54",desc:"\uCEEC\uB7EC \uC911\uC2EC\uC758 \uD604\uD669\uD310 \uB808\uC774\uC544\uC6C3\uC73C\uB85C \uD55C\uB208\uC5D0 \uBCF4\uAE30 \uC88B\uC740 \uAD6C\uC131\uC744 \uC81C\uACF5\uD569\uB2C8\uB2E4."},players:{label:"\uD504\uB85C\uD544",desc:"\uD504\uB85C\uD544 \uC911\uC2EC\uC73C\uB85C \uD544\uD130\uB97C \uBC14\uAFD4\uAC00\uBA70 \uC2A4\uD2B8\uB9AC\uBA38\uBCC4 \uC0C1\uD0DC\uB97C \uC9C1\uAD00\uC801\uC73C\uB85C \uD655\uC778\uD569\uB2C8\uB2E4."},weekly:{label:"\uBE0C\uB9AC\uD551",desc:"\uC774\uBC88 \uC8FC\uC640 \uC774\uBC88 \uB2EC \uD65C\uB3D9 \uD750\uB984\uC744 \uC694\uC57D \uCE74\uB4DC \uC704\uC8FC\uB85C \uBE60\uB974\uAC8C \uD6D1\uC5B4\uBCFC \uC218 \uC788\uC2B5\uB2C8\uB2E4."},ranking:{label:"\uB7AD\uD0B9",desc:"\uB300\uD559\uBCC4 \uC131\uACFC\uB97C \uB9AC\uB354\uBCF4\uB4DC \uD615\uD0DC\uB85C \uC815\uB9AC\uD574 \uBE44\uAD50\uAC00 \uC27D\uB3C4\uB85D \uAD6C\uC131\uD569\uB2C8\uB2E4."},heatmap:{label:"\uD788\uD2B8\uB9F5",desc:"\uBD84\uD3EC\uC640 \uC9D1\uC911 \uAD6C\uAC04\uC744 \uC0C9 \uBC00\uB3C4\uB85C \uD655\uC778\uD560 \uC218 \uC788\uAC8C \uC815\uB9AC\uD569\uB2C8\uB2E4."},bubble:{label:"\uBC84\uBE14\uB9F5",desc:"\uADDC\uBAA8\uC640 \uBE44\uC911\uC744 \uC2DC\uAC01\uC801\uC73C\uB85C \uBE44\uAD50\uD558\uAE30 \uC27D\uAC8C \uBC30\uCE58\uD569\uB2C8\uB2E4."},radar:{label:"\uB808\uC774\uB354",desc:"\uB300\uD559\uBCC4 \uAC15\uC810\uACFC \uADE0\uD615\uAC10\uC744 \uB2E4\uCC28\uC6D0\uC73C\uB85C \uBE44\uAD50\uD574\uC11C \uBCF4\uC5EC\uC90D\uB2C8\uB2E4."},summary:{label:"\uC694\uC57D",desc:"\uD575\uC2EC \uC22B\uC790\uC640 \uD750\uB984\uB9CC \uBAA8\uC544 \uAC04\uACB0\uD558\uAC8C \uD655\uC778\uD560 \uC218 \uC788\uB3C4\uB85D \uAD6C\uC131\uD569\uB2C8\uB2E4."},compare:{label:"\uB300\uD559\uBE44\uAD50",desc:"\uC5EC\uB7EC \uB300\uD559 \uC9C0\uD45C\uB97C \uD55C \uC790\uB9AC\uC5D0\uC11C \uBE44\uAD50\uD558\uAE30 \uC88B\uAC8C \uC815\uB9AC\uD569\uB2C8\uB2E4."},old:{label:"\uAD6C\uD604\uD669\uD310",desc:"\uAE30\uC874 \uD604\uD669\uD310 \uB808\uC774\uC544\uC6C3\uC744 \uADF8\uB300\uB85C \uC720\uC9C0\uD558\uBA74\uC11C \uD604\uC7AC \uB370\uC774\uD130\uC640 \uC5F0\uACB0\uD569\uB2C8\uB2E4."}}[_b2View]||{label:"\uD604\uD669\uD310",desc:"\uC5EC\uB7EC \uC2DC\uAC01\uD654\uC640 \uCE74\uB4DC\uD615 \uD654\uBA74\uC73C\uB85C \uD604\uD669\uC744 \uBE60\uB974\uAC8C \uD0D0\uC0C9\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4."},N=`
    ${`
    <style>
      #rtitle { caret-color: transparent; }
      #rcont { caret-color: transparent; }
      #rcont input, #rcont textarea, #rcont [contenteditable="true"] { caret-color: auto; }
      .b2-shell{display:flex;flex-direction:column;gap:14px}
      .b2-hero{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;padding:22px 24px;border-radius:28px;border:1px solid rgba(148,163,184,.18);background:linear-gradient(180deg,rgba(255,255,255,.99),rgba(248,250,252,.97));box-shadow:0 20px 36px rgba(15,23,42,.06)}
      .b2-hero-main{display:flex;flex-direction:column;gap:10px;min-width:0}
      .b2-hero-kicker{font-size:11px;font-weight:900;letter-spacing:.08em;color:#2563eb;text-transform:uppercase}
      .b2-hero-title{font-size:30px;font-weight:950;letter-spacing:-.04em;color:var(--text1);line-height:1.08}
      .b2-hero-desc{font-size:13px;line-height:1.65;color:var(--text3);max-width:760px}
      .b2-hero-badges{display:flex;flex-wrap:wrap;gap:8px}
      .b2-hero-badge{display:inline-flex;align-items:center;gap:6px;padding:8px 12px;border-radius:999px;border:1px solid rgba(148,163,184,.18);background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.94));box-shadow:0 10px 18px rgba(15,23,42,.05);font-size:12px;font-weight:800;color:var(--text2)}
      .b2-hero-stats{display:grid;grid-template-columns:repeat(3,minmax(112px,1fr));gap:10px;min-width:min(100%,360px)}
      .b2-hero-stat{padding:14px 14px 12px;border-radius:20px;border:1px solid rgba(148,163,184,.18);background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.94));box-shadow:0 10px 20px rgba(15,23,42,.05)}
      .b2-hero-stat-label{font-size:11px;font-weight:800;color:var(--text3);margin-bottom:6px}
      .b2-hero-stat-value{font-size:22px;font-weight:950;letter-spacing:-.03em;color:var(--text1);line-height:1}
      .b2-hero-stat-sub{margin-top:5px;font-size:11px;font-weight:700;color:var(--text3)}
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
      ${R}
      body.dark .b2-hero,
      body.dark .b2-toolbar-card,
      body.dark .b2-content-shell{background:linear-gradient(180deg,rgba(15,23,42,.95),rgba(15,23,42,.90));border-color:#334155;box-shadow:0 20px 34px rgba(0,0,0,.24),inset 0 1px 0 rgba(255,255,255,.03)}
      body.dark .b2-hero-badge,
      body.dark .b2-hero-stat{background:linear-gradient(180deg,rgba(30,41,59,.90),rgba(15,23,42,.88));border-color:#334155;box-shadow:none}
      body.dark .b2-tab-pill{background:rgba(15,23,42,.82);border-color:#334155;box-shadow:none}
      body.dark .b2-current-filter{background:rgba(59,130,246,.16)!important;border-color:rgba(96,165,250,.28)!important;color:#bfdbfe!important}
      @media (max-width:980px){
        .b2-hero{flex-direction:column}
        .b2-hero-stats{width:100%;grid-template-columns:repeat(3,minmax(0,1fr))}
      }
      @media (max-width:760px){
        .b2-hero{padding:18px 16px;border-radius:22px}
        .b2-hero-title{font-size:24px}
        .b2-hero-stats{grid-template-columns:1fr}
        .b2-toolbar-card,.b2-content-shell{padding:10px;border-radius:20px}
      }
    </style>`}
    <div class="b2-shell">
      <section class="b2-hero">
        <div class="b2-hero-main">
          <div class="b2-hero-kicker">Board Dashboard</div>
          <div class="b2-hero-title">\uD604\uD669\uD310</div>
          <div class="b2-hero-desc">${m.desc}</div>
          <div class="b2-hero-badges">
            <span class="b2-hero-badge">\uD604\uC7AC \uBCF4\uAE30 \xB7 ${m.label}</span>
            <span class="b2-hero-badge">\uD45C\uC2DC \uC2A4\uD2B8\uB9AC\uBA38 ${h.length}\uBA85</span>
            <span class="b2-hero-badge">\uB300\uD559 ${o.length}\uACF3</span>
            <span class="b2-hero-badge">\uC774\uBC88\uC8FC \uD65C\uB3D9 ${w}\uBA85</span>
          </div>
        </div>
        <div class="b2-hero-stats">
          <div class="b2-hero-stat">
            <div class="b2-hero-stat-label">\uD604\uC7AC \uBCF4\uAE30</div>
            <div class="b2-hero-stat-value">${m.label}</div>
            <div class="b2-hero-stat-sub">\uC790\uC8FC \uC4F0\uB294 \uD558\uC704 \uD654\uBA74\uC73C\uB85C \uC989\uC2DC \uC804\uD658</div>
          </div>
          <div class="b2-hero-stat">
            <div class="b2-hero-stat-label">\uD45C\uC2DC \uC778\uC6D0</div>
            <div class="b2-hero-stat-value">${h.length}</div>
            <div class="b2-hero-stat-sub">\uC228\uAE40\xB7\uC740\uD1F4 \uC81C\uC678 \uAE30\uC900</div>
          </div>
          <div class="b2-hero-stat">
            <div class="b2-hero-stat-label">\uD65C\uC131 \uB300\uD559</div>
            <div class="b2-hero-stat-value">${o.length}</div>
            <div class="b2-hero-stat-sub">\uC774\uBC88\uC8FC \uD65C\uB3D9 ${w}\uBA85</div>
          </div>
        </div>
      </section>
      <div class="b2-toolbar-card">
        <div id="b2-nav" class="b2-nav b2-nav-new">
          <div class="b2-toolbar-main">
        ${A}
        ${a("lineup","#dc2626",typeof getTabLabel=="function"?getTabLabel("board2","lineup","\u{1F3BD} \uB77C\uC778\uC5C5"):"\u{1F3BD} \uB77C\uC778\uC5C5")}
        ${a("univ","var(--blue)",typeof getTabLabel=="function"?getTabLabel("board2","univ","\u{1F3DF}\uFE0F \uB300\uD559\uBCC4"):"\u{1F3DF}\uFE0F \uB300\uD559\uBCC4")}
        ${a("femco","var(--blue)",typeof getTabLabel=="function"?getTabLabel("board2","femco","\u{1F9E9} \uD3A8\uCF54"):"\u{1F9E9} \uD3A8\uCF54")}
        ${a("free","var(--blue)",typeof getTabLabel=="function"?getTabLabel("board2","free","\u{1F6B6} \uBB34\uC18C\uC18D"):"\u{1F6B6} \uBB34\uC18C\uC18D")}
        ${a("players","var(--purple)",typeof getTabLabel=="function"?getTabLabel("board2","players",u):u)}
        <span style="width:1px;height:20px;background:var(--border2);display:inline-block;flex-shrink:0"></span>
        ${V}
        ${z}
        ${H}
        <span style="width:1px;height:20px;background:var(--border2);display:inline-block;flex-shrink:0"></span>
        ${C}
        ${E}
        ${U}
          </div>
          ${M}
          <div class="b2-toolbar-actions">${P}</div>
        </div>
      </div>
      ${_b2View==="lineup"?`
      <div style="display:flex;align-items:center;gap:8px;margin:-6px 0 14px;padding:8px 12px;background:var(--surface);border:1px solid var(--border);border-radius:12px;overflow-x:auto;scrollbar-width:none" class="b2-lineup-jumpbar">
        <span style="font-size:11px;font-weight:800;color:var(--gray-l);flex-shrink:0;white-space:nowrap">\u{1F3EB} \uBC14\uB85C\uAC00\uAE30</span>
        <span style="width:1px;height:14px;background:var(--border2);flex-shrink:0"></span>
        ${o.map(e=>{const s=gc(e.name),l=e.name===_b2LineupUniv;return`<button type="button" onclick="_b2LineupUniv='${e.name.replace(/'/g,"\\'")}';document.getElementById('b2-content').innerHTML=_b2LineupView();injectUnivIcons(document.getElementById('b2-content'));render();" style="padding:2px 9px;border-radius:999px;border:1px solid ${l?s:"transparent"};background:${l?s+"1a":"var(--white)"};color:${l?s:"var(--text3)"};font-size:10px;font-weight:${l?900:700};cursor:pointer;white-space:nowrap;flex-shrink:0;transition:all .15s">${e.name}</button>`}).join("")}
      </div>
      `:""}
      <div class="b2-content-shell">
        <div id="b2-content"></div>
      </div>
    </div>
  `;n.innerHTML=N;try{const e=()=>{try{if(typeof prewarmImageUrls!="function")return;const s=new Set((typeof univCfg!="undefined"?univCfg:[]).filter(b=>b.dissolved||b.hidden).map(b=>String(b.name||"").trim())),l=[];(Array.isArray(players)?players:[]).filter(b=>b&&!b.hidden&&!b.retired&&!b.hideFromBoard&&!s.has(String((b==null?void 0:b.univ)||"").trim())).slice(0,220).forEach(b=>{b.photo&&l.push(b.photo)}),prewarmImageUrls(l,180)}catch(s){}};typeof window.requestIdleCallback=="function"?window.requestIdleCallback(e,{timeout:1200}):setTimeout(e,450)}catch(e){}const G=document.getElementById("b2-content"),q=()=>{const e=document.getElementById("b2-content");if(!e)return;if(new Set(["univ","femco","free","players","lineup","summary","weekly","ranking","radar","compare","heatmap","bubble","old"]).has(String(_b2View||""))||(_b2View="univ"),_b2View==="univ"){e.innerHTML=_b2UnivView(),injectUnivIcons(e),_b2BindAutoFitResize();try{_b2LazyLoadBgLayers(e)}catch(l){}setTimeout(()=>{try{window._precacheVisibleImages&&window._precacheVisibleImages(e,60)}catch(l){}},120)}else _b2View==="femco"?(e.innerHTML=_b2FemcoView(),injectUnivIcons(e),setTimeout(()=>{try{window._precacheVisibleImages&&window._precacheVisibleImages(e,80)}catch(l){}},120),requestAnimationFrame(()=>{try{e.querySelectorAll(".b2-femco-grid").forEach(l=>{l.scrollLeft=0})}catch(l){console.warn("[rBoard] \uD3A8\uCF54 \uADF8\uB9AC\uB4DC \uC2A4\uD06C\uB864 \uCD08\uAE30\uD654 \uC2E4\uD328:",l.message)}})):_b2View==="free"?(e.innerHTML=_b2FreeView(),injectUnivIcons(e),setTimeout(()=>{try{window._precacheVisibleImages&&window._precacheVisibleImages(e,60)}catch(l){}},120)):_b2View==="players"?(e.innerHTML=_b2PlayersView(),_b2BindAutoFitResize(),setTimeout(()=>{try{_b2SelectedPlayer&&typeof _b2ApplyImgSettingsToDom=="function"&&(_b2ApplyImgSettingsToDom(_b2SelectedPlayer.name,"primary"),_b2ApplyImgSettingsToDom(_b2SelectedPlayer.name,"secondary")),_b2ApplyBgAutoSizing(e)}catch(l){console.error("[rBoard] \uC774\uBBF8\uC9C0 \uC124\uC815 \uC801\uC6A9 \uC2E4\uD328:",l.message)}},0),setTimeout(()=>{try{window._precacheVisibleImages&&window._precacheVisibleImages(e,80)}catch(l){}},160)):_b2View==="lineup"?(e.innerHTML=_b2LineupView(),injectUnivIcons&&injectUnivIcons(e),setTimeout(()=>{try{window._precacheVisibleImages&&window._precacheVisibleImages(e,60)}catch(l){}},120)):_b2View==="summary"?(e.innerHTML=_b2SummaryView(),injectUnivIcons&&injectUnivIcons(e)):_b2View==="weekly"?(e.innerHTML=_b2WeeklyBriefingView(),injectUnivIcons&&injectUnivIcons(e),_b2InjectAndRunScripts(e)):_b2View==="ranking"?(e.innerHTML=_b2RankingView(),injectUnivIcons&&injectUnivIcons(e)):_b2View==="radar"?(e.innerHTML=_b2RadarView(),_b2InjectAndRunScripts(e)):_b2View==="compare"?(e.innerHTML=_b2CompareView(),injectUnivIcons&&injectUnivIcons(e)):_b2View==="heatmap"?(e.innerHTML=_b2HeatmapView(),_b2InjectAndRunScripts(e)):_b2View==="bubble"?(e.innerHTML=_b2BubbleView(),_b2InjectAndRunScripts(e)):_b2View==="old"&&(typeof rBoard=="function"?rBoard(e,t):(e.innerHTML='<div style="padding:40px;text-align:center;color:var(--gray-l)">\uAD6C\uD604\uD669\uD310 \uB85C\uB529 \uC911...</div>',(async()=>{try{typeof window._ensureCloudBoardLoaded=="function"&&await window._ensureCloudBoardLoaded()}catch(l){}try{if(_b2View!=="old")return;typeof rBoard=="function"?rBoard(e,t):e.innerHTML='<div style="padding:40px;text-align:center;color:var(--gray-l)">\uAD6C\uD604\uD669\uD310\uC744 \uBD88\uB7EC\uC62C \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.</div>'}catch(l){e.innerHTML='<div style="padding:40px;text-align:center;color:#dc2626">\uAD6C\uD604\uD669\uD310 \uC624\uB958: '+String(l&&l.message||l)+"</div>"}})()))};try{q()}catch(e){console.error("[rBoard2] sub render fail",e);try{const s=document.getElementById("b2-content");s&&(s.innerHTML='<div style="padding:40px;text-align:center;color:#dc2626">\uD604\uD669\uD310 \uB80C\uB354\uB9C1 \uC624\uB958: '+String(e&&e.message||e)+"</div>")}catch(s){}}}catch(i){console.error("[rBoard2] \uC624\uB958:",i),n.innerHTML=`<div style="padding:40px;text-align:center;color:#dc2626">
      <div style="font-weight:700;margin-bottom:8px">\uD604\uD669\uD310 \uB85C\uB529 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4</div>
      <div style="font-size:12px;color:var(--gray-l)">${i.message}</div>
    </div>`}}

/* board2-univ-views.js */
var at=Object.defineProperty,st=Object.defineProperties;var lt=Object.getOwnPropertyDescriptors;var Ve=Object.getOwnPropertySymbols;var dt=Object.prototype.hasOwnProperty,ct=Object.prototype.propertyIsEnumerable;var Ze=(e,t,n)=>t in e?at(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,Te=(e,t)=>{for(var n in t||(t={}))dt.call(t,n)&&Ze(e,n,t[n]);if(Ve)for(var n of Ve(t))ct.call(t,n)&&Ze(e,n,t[n]);return e},Ae=(e,t)=>st(e,lt(t));function _b2UnivView(){let e=_b2VisUnivs().filter(i=>i.name!=="\uBB34\uC18C\uC18D"&&i.name);if(!e.length)return'<div style="text-align:center;color:var(--text3);padding:40px">\uD45C\uC2DC\uD560 \uB300\uD559\uC774 \uC5C6\uC2B5\uB2C8\uB2E4</div>';const t=new Set((typeof univCfg!="undefined"?univCfg:[]).filter(i=>i.dissolved).map(i=>String(i.name||"").trim())),n=new Set(e.map(i=>String(i&&i.name||"").trim()).filter(Boolean)),c={},o=[];(players||[]).forEach(i=>{const $=String((i==null?void 0:i.univ)||"").trim();n.has($)&&(i.hidden||i.retired||i.hideFromBoard||t.has($)||(o.push(i),(c[$]||(c[$]=[])).push(i)))});const b={};o.forEach(i=>{const $=i.tier||"?";b[$]=(b[$]||0)+1});const{fromN:a,toN:f}=_b2ThisWeekRange(),g=_b2WeeklyAggregate(o,String(a).replace(/(\d{4})(\d{2})(\d{2})/,"$1-$2-$3"),String(f).replace(/(\d{4})(\d{2})(\d{2})/,"$1-$2-$3")),x=g.filter(i=>i.total>0).length,r=g.reduce((i,$)=>i+$.total,0),d={P:0,T:0,Z:0};o.forEach(i=>{const $=String(i.race||"").trim().toUpperCase();($==="P"||$==="T"||$==="Z")&&d[$]++});const s=d.P+d.T+d.Z,m=s>0?["T","P","Z"].map(i=>{const $={T:{cls:"race-T",label:"\uD14C\uB780"},P:{cls:"race-P",label:"\uD504\uB85C\uD1A0\uC2A4"},Z:{cls:"race-Z",label:"\uC800\uADF8"}}[i];if(!d[i])return"";const I=Math.round(d[i]/s*100);return`<button type="button" class="b2-race-badge ${$.cls}" title="${$.label} ${I}%" style="cursor:pointer" onclick="if(typeof openB2RaceTierModal==='function')openB2RaceTierModal('${i}')">${i}<span style="opacity:.75;font-size:10px;margin-left:6px">${I}%</span></button>`}).filter(Boolean).join(""):"",T=(Array.isArray(TIERS)?TIERS:[]).filter(i=>b[i]).map(i=>{const $=typeof getTierBtnColor=="function"?getTierBtnColor(i):"#64748b",I=typeof getTierBtnTextColor=="function"&&getTierBtnTextColor(i)||"#fff";return`<button type="button" class="b2-tier-badge" title="${i}\uD2F0\uC5B4 ${b[i]}\uBA85" style="cursor:pointer;background:${$};color:${I};border:1px solid ${$}55" onclick="if(typeof openB2TierUnivModal==='function')openB2TierUnivModal('${String(i).replace(/\\/g,"\\\\").replace(/'/g,"\\'")}')">${i}</button>`}).join("");try{window._b2LastAllVisPlayers=o}catch(i){}const k=e.map(i=>{if(!(c[String(i.name||"").trim()]||[]).length)return"";const I=gc(i.name),A=_b2ContrastColor(I);return`<button class="b2-jump-chip" onclick="const el=document.getElementById('${"b2-univ-anchor-"+i.name.replace(/[^a-zA-Z0-9가-힣]/g,"_")}');if(el){el.scrollIntoView({behavior:'smooth',block:'start'});}" style="--chip-color:${I}40;border:1.5px solid ${I}bb;background:linear-gradient(135deg,${I}ee,${I}cc);color:${A}"><span style="letter-spacing:-.01em">${i.name}</span></button>`}).join(""),h=_b2GetUnivProfileViewMode(),C=(i,$)=>`
    <button type="button" class="b2-jump-chip" onclick="_b2SetUnivProfileViewMode('${i}')" style="border:${h===i?"1.5px solid #2563eb":"1.5px solid rgba(148,163,184,.20)"};background:${h===i?"linear-gradient(135deg,#eff6ff,#dbeafe)":"linear-gradient(135deg,rgba(255,255,255,.98),rgba(248,250,252,.94))"};color:${h===i?"#1d4ed8":"var(--text2)"};box-shadow:${h===i?"0 6px 16px rgba(37,99,235,.12)":"0 4px 10px rgba(15,23,42,.04)"}">${$}</button>`,M=`<div style="margin-bottom:12px">
    <div style="padding:14px;border-radius:22px;border:1px solid rgba(148,163,184,.18);background:linear-gradient(180deg,rgba(255,255,255,.99),rgba(248,250,252,.96));box-shadow:0 16px 28px rgba(15,23,42,.05)">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px">
        <div style="padding:13px 14px;border-radius:18px;border:1px solid rgba(148,163,184,.14);background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.94))">
          <div style="font-size:11px;font-weight:800;color:var(--text3)">\uD45C\uC2DC \uC120\uC218</div>
          <div style="margin-top:6px;font-size:22px;font-weight:950;letter-spacing:-.03em;color:var(--text1)">${o.length}</div>
          <div style="margin-top:4px;font-size:11px;font-weight:700;color:var(--text3)">\uD604\uD669\uD310 \uAE30\uC900 \uD45C\uC2DC \uC778\uC6D0</div>
        </div>
        <div style="padding:13px 14px;border-radius:18px;border:1px solid rgba(148,163,184,.14);background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.94))">
          <div style="font-size:11px;font-weight:800;color:var(--text3)">\uD65C\uC131 \uB300\uD559</div>
          <div style="margin-top:6px;font-size:22px;font-weight:950;letter-spacing:-.03em;color:var(--text1)">${e.length}</div>
          <div style="margin-top:4px;font-size:11px;font-weight:700;color:var(--text3)">\uBB34\uC18C\uC18D \uC81C\uC678 \uB300\uD559 \uC218</div>
        </div>
        <div style="padding:13px 14px;border-radius:18px;border:1px solid rgba(148,163,184,.14);background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.94))">
          <div style="font-size:11px;font-weight:800;color:var(--text3)">\uC774\uBC88\uC8FC \uAE30\uB85D \uC218</div>
          <div style="margin-top:6px;font-size:22px;font-weight:950;letter-spacing:-.03em;color:#2563eb">${r}</div>
          <div style="margin-top:4px;font-size:11px;font-weight:700;color:var(--text3)">\uAC1C\uC778\uC804\xB7\uD300\uC804\xB7\uB300\uD68C \uAE30\uC900</div>
        </div>
        <div style="padding:13px 14px;border-radius:18px;border:1px solid rgba(148,163,184,.14);background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.94))">
          <div style="font-size:11px;font-weight:800;color:var(--text3)">\uC774\uBC88\uC8FC \uD65C\uB3D9 \uC2A4\uD2B8\uB9AC\uBA38</div>
          <div style="margin-top:6px;font-size:22px;font-weight:950;letter-spacing:-.03em;color:#f59e0b">${x}</div>
          <div style="margin-top:4px;font-size:11px;font-weight:700;color:var(--text3)">\uC6D4~\uC624\uB298 \uAE30\uB85D 1\uD68C \uC774\uC0C1</div>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:12px;padding-top:12px;border-top:1px solid rgba(148,163,184,.14)">
        <span class="b2-jump-label">\uC885\uC871 \uBE44\uC911</span>
        ${m||'<span style="font-size:11px;font-weight:700;color:var(--gray-l)">\uC9D1\uACC4 \uC5C6\uC74C</span>'}
        ${T?`<span style="width:1px;height:20px;background:var(--border2);display:inline-block;margin:0 4px;flex-shrink:0"></span><span class="b2-jump-label">\uD2F0\uC5B4</span>${T}`:""}
      </div>
      <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:12px;padding-top:12px;border-top:1px solid rgba(148,163,184,.14)">
        <span class="b2-jump-label">\u{1F3DB}\uFE0F \uBC14\uB85C\uAC00\uAE30</span>
        ${k}
      </div>
      <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:10px;padding-top:10px;border-top:1px dashed rgba(148,163,184,.14)">
        <span class="b2-jump-label">\u{1F5BC}\uFE0F \uBAA8\uB4DC</span>
        ${C("default","\uAE30\uBCF8")}
        ${C("poster","\uD3EC\uC2A4\uD130")}
        ${C("glass","\u2728 \uAE00\uB798\uC2A4")}
        ${C("table","\u{1F4CB} \uD14C\uC774\uBE14")}
      </div>
    </div>
  </div>`,l=typeof boardGridCols!="undefined"&&boardGridCols===2?"repeat(2,1fr)":"1fr";let v=M+"<style>.b2-bottom-img{max-width:130px;max-height:110px;object-fit:contain;}.b2-side-panel{float:right;width:230px;margin:0 0 6px 10px;border-radius:10px;padding:8px;box-sizing:border-box;}@media(min-width:769px) and (max-width:1024px){.b2-univ-grid{grid-template-columns:1fr!important;}.b2-side-panel{width:180px;}}@media(max-width:900px){.b2-univ-grid{grid-template-columns:1fr!important;}}@media(max-width:640px){.b2-side-panel{display:none!important;}.b2-bottom-img{display:none!important;}}</style>";return v+=`<div class="b2-univ-grid" style="display:grid;grid-template-columns:${l};gap:12px;align-items:start">`,e.forEach(i=>{if(!i.name){console.warn("[\uD604\uD669\uD310] \uB300\uD559 \uC774\uB984\uC774 \uC5C6\uB294 \uB370\uC774\uD130\uAC00 \uBC1C\uACAC\uB418\uC5C8\uC2B5\uB2C8\uB2E4:",i);return}const $=c[String(i.name||"").trim()]||[],I="b2-univ-anchor-"+i.name.replace(/[^a-zA-Z0-9가-힣]/g,"_");v+=`<div id="${I}" style="scroll-margin-top:56px">`+_b2UnivBlock(i.name,gc(i.name),$)+"</div>"}),v+="</div>",v}try{window.openB2RaceTierModal||(window.openB2RaceTierModal=function(e){try{const t=Array.isArray(window._b2LastAllVisPlayers)?window._b2LastAllVisPlayers:[],n=String(e||"").trim().toUpperCase(),c=n==="P"?"\uD504\uB85C\uD1A0\uC2A4":n==="T"?"\uD14C\uB780":n==="Z"?"\uC800\uADF8":"\uC885\uC871",o=t.filter(r=>String((r==null?void 0:r.race)||"").trim().toUpperCase()===n),b=Array.isArray(window.TIERS)&&window.TIERS.length?window.TIERS.slice():["S","A","B","C","D","E","F","?"],a={},f={};if(o.forEach(r=>{const d=String((r==null?void 0:r.tier)||"?"),s=String((r==null?void 0:r.univ)||"\uBB34\uC18C\uC18D");a[d]=(a[d]||0)+1,f[s]=(f[s]||0)+1}),window._b2RaceTierState=window._b2RaceTierState||{},window._b2RaceTierState.race=n,window._b2RaceTierState.tier=window._b2RaceTierState.tier||"ALL",window._b2RaceTierState.univ=window._b2RaceTierState.univ||"ALL",window._b2RaceTierState.list=o,window._b2RaceTierState.counts=a,window._b2RaceTierState.univCounts=f,window._b2RaceTierState.tiers=b,window._b2RaceTierState.label=c,!document.getElementById("b2RaceTierStyle")){const r=document.createElement("style");r.id="b2RaceTierStyle",r.textContent=`
            #b2RaceTierOverlay{display:none;position:fixed;inset:0;z-index:6000;background:rgba(2,6,23,.42);backdrop-filter:blur(6px)}
            #b2RaceTierOverlay .su-modal{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:min(1120px,calc(100vw - 28px));height:min(820px,calc(100vh - 28px));background:linear-gradient(180deg,rgba(255,255,255,.985),rgba(248,250,252,.96));border:1px solid rgba(148,163,184,.18);border-radius:26px;box-shadow:0 30px 64px rgba(15,23,42,.22);display:flex;flex-direction:column;overflow:hidden}
            #b2RaceTierOverlay .su-modal-hd{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:14px 16px;border-bottom:1px solid rgba(148,163,184,.14);background:linear-gradient(135deg,rgba(239,246,255,.96),rgba(255,255,255,.92))}
            #b2RaceTierOverlay .su-modal-bd{padding:14px 14px 16px;overflow:auto;flex:1;min-height:0}
            #b2RaceTierOverlay .b2rt-title{font-size:16px;font-weight:1000;letter-spacing:-.02em;color:var(--text1)}
            #b2RaceTierOverlay .b2rt-sub{font-size:11px;font-weight:800;color:var(--text3)}
            #b2RaceTierOverlay .b2rt-summary{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:10px}
            #b2RaceTierOverlay .b2rt-summarycard{padding:12px 13px;border-radius:18px;background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.94));border:1px solid rgba(148,163,184,.14);box-shadow:0 10px 24px rgba(15,23,42,.06)}
            #b2RaceTierOverlay .b2rt-summarylabel{font-size:10px;font-weight:900;letter-spacing:.08em;color:var(--text3);text-transform:uppercase}
            #b2RaceTierOverlay .b2rt-summaryvalue{margin-top:7px;font-size:20px;font-weight:1000;letter-spacing:-.03em;color:var(--text1)}
            #b2RaceTierOverlay .b2rt-summarymeta{margin-top:4px;font-size:11px;font-weight:800;color:var(--text3)}
            #b2RaceTierOverlay .b2rt-univbar{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}
            #b2RaceTierOverlay .b2rt-univbtn{display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border-radius:999px;border:1px solid rgba(148,163,184,.16);background:rgba(248,250,252,.98);font-size:11px;font-weight:900;color:var(--text2);cursor:pointer}
            #b2RaceTierOverlay .b2rt-univbtn.on{border-color:rgba(37,99,235,.35);background:linear-gradient(180deg,rgba(239,246,255,.98),rgba(219,234,254,.92));color:#1d4ed8}
            #b2RaceTierOverlay .b2rt-groupgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px;margin-top:12px;margin-bottom:2px}
            #b2RaceTierOverlay .b2rt-groupcard{padding:12px 13px;border-radius:18px;background:linear-gradient(180deg,rgba(255,255,255,.99),rgba(248,250,252,.95));border:1px solid rgba(148,163,184,.14);box-shadow:0 10px 22px rgba(15,23,42,.06);cursor:pointer}
            #b2RaceTierOverlay .b2rt-grouphead{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px}
            #b2RaceTierOverlay .b2rt-groupname{font-size:13px;font-weight:950;color:var(--text1);display:flex;align-items:center;gap:6px;min-width:0}
            #b2RaceTierOverlay .b2rt-groupcount{font-size:11px;font-weight:900;color:var(--text3);flex-shrink:0}
            #b2RaceTierOverlay .b2rt-groupavatars{display:flex;flex-wrap:wrap;gap:6px}
            #b2RaceTierOverlay .b2rt-av{width:44px;height:44px;border-radius:16px;overflow:hidden;border:1px solid rgba(148,163,184,.16);background:linear-gradient(160deg,rgba(148,163,184,.26),rgba(15,23,42,.12));box-shadow:0 6px 14px rgba(15,23,42,.08);cursor:pointer;padding:0}
            #b2RaceTierOverlay .b2rt-av img{width:100%;height:100%;object-fit:cover;object-position:top center;display:block}
            #b2RaceTierOverlay .b2rt-av span{display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:14px;font-weight:1000;color:rgba(255,255,255,.75)}
            #b2RaceTierOverlay .b2rt-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:12px;margin-top:12px}
            #b2RaceTierOverlay .b2rt-card{position:relative;border-radius:18px;overflow:hidden;aspect-ratio:0.78;background:#0b1120;border:1px solid rgba(255,255,255,.14);box-shadow:0 10px 22px rgba(15,23,42,.10);cursor:pointer}
            #b2RaceTierOverlay .b2rt-card img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center}
            #b2RaceTierOverlay .b2rt-topbadges{position:absolute;left:10px;right:10px;top:10px;display:flex;align-items:center;justify-content:space-between;gap:8px;z-index:2}
            #b2RaceTierOverlay .b2rt-pill{display:inline-flex;align-items:center;gap:4px;padding:5px 9px;border-radius:999px;background:rgba(15,23,42,.72);border:1px solid rgba(255,255,255,.28);backdrop-filter:blur(10px);font-size:11px;font-weight:900;color:#fff}
            #b2RaceTierOverlay .b2rt-fb{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:1000;color:rgba(255,255,255,.85);background:linear-gradient(160deg,rgba(71,85,105,.55),rgba(15,23,42,.42))}
            #b2RaceTierOverlay .b2rt-bottom{position:absolute;left:0;right:0;bottom:0;padding:10px 10px 12px;display:flex;flex-direction:column;gap:4px}
            #b2RaceTierOverlay .b2rt-bottom::before{content:'';position:absolute;left:0;right:0;bottom:0;height:78%;background:linear-gradient(180deg,rgba(15,23,42,0) 0%,rgba(15,23,42,.40) 24%,rgba(4,7,18,.92) 100%);pointer-events:none}
            #b2RaceTierOverlay .b2rt-bottom>*{position:relative;z-index:1}
            #b2RaceTierOverlay .b2rt-name{font-size:13px;font-weight:950;color:#fff;letter-spacing:-.02em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-shadow:0 2px 8px rgba(0,0,0,.5)}
            #b2RaceTierOverlay .b2rt-meta{display:flex;align-items:center;gap:6px;font-size:11px;font-weight:850;color:rgba(255,255,255,.92);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-shadow:0 1px 5px rgba(0,0,0,.5)}
            #b2RaceTierOverlay .b2rt-ubadge{display:inline-flex;align-items:center;gap:4px;max-width:100%;padding:2px 8px;border-radius:999px;border:1px solid rgba(255,255,255,.3);font-size:10.5px;font-weight:900;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;backdrop-filter:blur(6px);background:rgba(15,23,42,.55)!important}
            @media (max-width:780px){#b2RaceTierOverlay .su-modal{height:min(860px,calc(100vh - 14px));width:min(100vw - 14px,1120px);border-radius:22px}#b2RaceTierOverlay .b2rt-summary{grid-template-columns:1fr}#b2RaceTierOverlay .b2rt-grid{grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px}#b2RaceTierOverlay .b2rt-groupgrid{grid-template-columns:1fr}}
          `,document.head.appendChild(r)}let g=document.getElementById("b2RaceTierOverlay");if(!g){g=document.createElement("div"),g.id="b2RaceTierOverlay",g.innerHTML=`
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
          `,document.body.appendChild(g),g.addEventListener("click",d=>{try{d.target&&d.target.id==="b2RaceTierOverlay"&&window.closeB2RaceTierModal()}catch(s){}});const r=g.querySelector("#b2rtClose");r&&r.addEventListener("click",()=>window.closeB2RaceTierModal()),window.closeB2RaceTierModal=function(){const d=document.getElementById("b2RaceTierOverlay");d&&(d.style.display="none")}}window._b2RaceTierRender=function(){const r=window._b2RaceTierState||{},d=document.getElementById("b2RaceTierOverlay");if(!d)return;const s=d.querySelector("#b2rtTitle"),m=d.querySelector("#b2rtSub"),T=d.querySelector("#b2rtSummary"),k=d.querySelector("#b2rtUnivBar"),h=d.querySelector("#b2rtGroup"),C=d.querySelector("#b2rtGrid");s&&(s.textContent=`\uC885\uC871 \uBE44\uC911 \xB7 ${r.label||""}`);const M=r.univ&&r.univ!=="ALL"?(r.list||[]).filter(l=>String((l==null?void 0:l.univ)||"\uBB34\uC18C\uC18D")===r.univ):r.list||[];if(m&&(m.textContent=`${r.univ&&r.univ!=="ALL"?`${r.univ} \xB7 `:""}${M.length}\uBA85`),T){const l=Object.entries(r.counts||{}).sort((i,$)=>$[1]-i[1]||i[0].localeCompare($[0]))[0],v=Object.keys(r.univCounts||{}).length;T.innerHTML=`
              <div class="b2rt-summarycard">
                <div class="b2rt-summarylabel">\uCD1D \uC778\uC6D0</div>
                <div class="b2rt-summaryvalue">${M.length}</div>
                <div class="b2rt-summarymeta">${r.univ&&r.univ!=="ALL"?"\uC120\uD0DD \uB300\uD559 \uAE30\uC900":"\uC804\uCCB4 \uD45C\uC2DC \uAE30\uC900"}</div>
              </div>
              <div class="b2rt-summarycard">
                <div class="b2rt-summarylabel">\uBD84\uD3EC \uB300\uD559</div>
                <div class="b2rt-summaryvalue">${r.univ&&r.univ!=="ALL"?"1":v}</div>
                <div class="b2rt-summarymeta">${r.univ&&r.univ!=="ALL"?r.univ:"\uB300\uD559\uBCC4 \uBD84\uD3EC"}</div>
              </div>
              <div class="b2rt-summarycard">
                <div class="b2rt-summarylabel">\uD575\uC2EC \uD2F0\uC5B4</div>
                <div class="b2rt-summaryvalue">${l?l[0]:"-"}</div>
                <div class="b2rt-summarymeta">${l?`${l[1]}\uBA85`:"\uC9D1\uACC4 \uB300\uAE30"}</div>
              </div>`}if(k){const l=["ALL"].concat(Object.keys(r.univCounts||{}).sort((v,i)=>(r.univCounts[i]||0)-(r.univCounts[v]||0)||v.localeCompare(i)));k.innerHTML=l.map(v=>{const i=v==="ALL"?(r.list||[]).length:(r.univCounts||{})[v]||0,$=(r.univ||"ALL")===v,I=v==="ALL"?`\uC804\uCCB4 (${i})`:`${v} (${i})`;return`<button type="button" class="b2rt-univbtn ${$?"on":""}" onclick="window._b2RaceTierSetUniv && window._b2RaceTierSetUniv('${String(v).replace(/'/g,"\\'")}')">${I}</button>`}).join("")}if(h)if((r.univ||"ALL")==="ALL"){const l=new Map;M.forEach(i=>{const $=String((i==null?void 0:i.univ)||"\uBB34\uC18C\uC18D");l.has($)?l.get($).push(i):l.set($,[i])});const v=Array.from(l.entries()).sort((i,$)=>$[1].length-i[1].length||i[0].localeCompare($[0]));h.innerHTML=`<div class="b2rt-groupgrid">${v.map(([i,$])=>{const I=typeof gc=="function"&&gc(i)||"#64748b",A=i&&i!=="\uBB34\uC18C\uC18D"&&typeof gUI=="function"?gUI(i,typeof getUnivLogoSizeStr=="function"?getUnivLogoSizeStr(i,"players","16px"):"16px"):"";return`<div class="b2rt-groupcard" onclick="window._b2RaceTierSetUniv && window._b2RaceTierSetUniv('${String(i).replace(/'/g,"\\'")}')">
                  <div class="b2rt-grouphead">
                    <div class="b2rt-groupname" title="${String(i).replace(/"/g,"&quot;")}"><span class="b2rt-pill" style="position:static;background:${I}22;border-color:${I}55;color:${I}">${A}${i}</span></div>
                    <div class="b2rt-groupcount">${$.length}\uBA85</div>
                  </div>
                  <div class="b2rt-groupavatars">${$.slice(0,8).map(P=>{const H=String((P==null?void 0:P.name)||""),_=H.replace(/\\/g,"\\\\").replace(/'/g,"\\'"),L=String((P==null?void 0:P.photo)||"").trim();return`<button type="button" class="b2rt-av" onclick="event.stopPropagation();if(typeof openPlayerModal==='function')openPlayerModal('${_}')" title="${H.replace(/"/g,"&quot;")}">${L?`<img src="${toHttpsUrl(L).replace(/\"/g,"&quot;")}" loading="lazy" decoding="async" onerror="this.parentNode.innerHTML='<span>${String((P==null?void 0:P.race)||"?")}</span>'">`:`<span>${String((P==null?void 0:P.race)||"?")}</span>`}</button>`}).join("")}</div>
                </div>`}).join("")}</div>`}else h.innerHTML="";C&&(C.innerHTML=M.map(l=>{const v=String((l==null?void 0:l.name)||""),i=String((l==null?void 0:l.univ)||"\uBB34\uC18C\uC18D"),$=String((l==null?void 0:l.tier)||"?"),I=String((l==null?void 0:l.photo)||"").trim(),A=typeof gc=="function"&&gc(i)||"#64748b",P=i&&i!=="\uBB34\uC18C\uC18D"&&typeof gUI=="function"?gUI(i,typeof getUnivLogoSizeStr=="function"?getUnivLogoSizeStr(i,"players","16px"):"16px"):"",H=v.replace(/\\/g,"\\\\").replace(/'/g,"\\'"),_=I?`<img src="${toHttpsUrl(I).replace(/\"/g,"&quot;")}" loading="lazy" decoding="async" onerror="this.style.display='none'">`:"",L=`<div class="b2rt-fb" style="display:${I?"none":"flex"}">${String((l==null?void 0:l.race)||"?")}</div>`;return`<div class="b2rt-card" onclick="if(typeof openPlayerModal==='function')openPlayerModal('${H}')">
                <div class="b2rt-topbadges">
                  <span class="b2rt-pill">${$}\uD2F0\uC5B4</span>
                  <span class="b2rt-pill" style="background:${A}55;border-color:${A}88">${String((l==null?void 0:l.race)||"?")}</span>
                </div>
                ${_}${L}
                <div class="b2rt-bottom">
                  <div class="b2rt-name" title="${v.replace(/\"/g,"&quot;")}">${v}</div>
                  <div class="b2rt-meta"><span>${$}\uD2F0\uC5B4</span><span class="b2rt-ubadge" style="background:${A}22;border-color:${A}55;color:#fff">${P}${i}</span></div>
                </div>
              </div>`}).join(""))},window._b2RaceTierSetUniv=function(r){window._b2RaceTierState=window._b2RaceTierState||{},window._b2RaceTierState.univ=String(r||"ALL"),window._b2RaceTierRender&&window._b2RaceTierRender()};const x=document.getElementById("b2RaceTierOverlay");x&&(x.style.display="block"),window._b2RaceTierSetUniv("ALL")}catch(t){console.error(t)}})}catch(e){}try{window.openB2TierUnivModal||(window.openB2TierUnivModal=function(e){try{const t=Array.isArray(window._b2LastAllVisPlayers)?window._b2LastAllVisPlayers:[],n=String(e||"?").trim(),c=t.filter(s=>String((s==null?void 0:s.tier)||"?")===n),o=new Map;c.forEach(s=>{const m=String((s==null?void 0:s.univ)||"\uBB34\uC18C\uC18D");o.has(m)?o.get(m).push(s):o.set(m,[s])});const b=Array.from(o.entries()).sort((s,m)=>m[1].length-s[1].length||s[0].localeCompare(m[0]));if(!document.getElementById("b2TierUnivStyle")){const s=document.createElement("style");s.id="b2TierUnivStyle",s.textContent=`
            #b2TierUnivOverlay{display:none;position:fixed;inset:0;z-index:6000;background:rgba(2,6,23,.42);backdrop-filter:blur(6px)}
            #b2TierUnivOverlay .su-modal{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:min(1120px,calc(100vw - 28px));height:min(860px,calc(100vh - 28px));background:linear-gradient(180deg,rgba(255,255,255,.985),rgba(248,250,252,.96));border:1px solid rgba(148,163,184,.18);border-radius:26px;box-shadow:0 30px 64px rgba(15,23,42,.22);display:flex;flex-direction:column;overflow:hidden}
            #b2TierUnivOverlay .su-modal-hd{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:14px 16px;border-bottom:1px solid rgba(148,163,184,.14);background:linear-gradient(135deg,rgba(239,246,255,.96),rgba(255,255,255,.92))}
            #b2TierUnivOverlay .su-modal-bd{padding:14px 14px 16px;overflow:auto;flex:1;min-height:0}
            #b2TierUnivOverlay .b2tu-title{font-size:16px;font-weight:1000;letter-spacing:-.02em;color:var(--text1)}
            #b2TierUnivOverlay .b2tu-sub{font-size:11px;font-weight:800;color:var(--text3)}
            #b2TierUnivOverlay .b2tu-summary{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-bottom:12px}
            #b2TierUnivOverlay .b2tu-summarycard{padding:12px 13px;border-radius:18px;background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.94));border:1px solid rgba(148,163,184,.14);box-shadow:0 10px 24px rgba(15,23,42,.06)}
            #b2TierUnivOverlay .b2tu-summarylabel{font-size:10px;font-weight:900;letter-spacing:.08em;color:var(--text3);text-transform:uppercase}
            #b2TierUnivOverlay .b2tu-summaryvalue{margin-top:7px;font-size:20px;font-weight:1000;letter-spacing:-.03em;color:var(--text1)}
            #b2TierUnivOverlay .b2tu-summarymeta{margin-top:4px;font-size:11px;font-weight:800;color:var(--text3)}
            #b2TierUnivOverlay .b2tu-filter{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px}
            #b2TierUnivOverlay .b2tu-filterbtn{display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border-radius:999px;border:1px solid rgba(148,163,184,.16);background:rgba(248,250,252,.98);font-size:11px;font-weight:900;color:var(--text2);cursor:pointer}
            #b2TierUnivOverlay .b2tu-filterbtn.on{border-color:rgba(37,99,235,.35);background:linear-gradient(180deg,rgba(239,246,255,.98),rgba(219,234,254,.92));color:#1d4ed8}
            #b2TierUnivOverlay .b2tu-groupgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px;margin-bottom:12px}
            #b2TierUnivOverlay .b2tu-groupcard{padding:12px 13px;border-radius:18px;background:linear-gradient(180deg,rgba(255,255,255,.99),rgba(248,250,252,.95));border:1px solid rgba(148,163,184,.14);box-shadow:0 10px 22px rgba(15,23,42,.06)}
            #b2TierUnivOverlay .b2tu-grouphead{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px}
            #b2TierUnivOverlay .b2tu-groupname{font-size:13px;font-weight:950;color:var(--text1);display:flex;align-items:center;gap:6px;min-width:0}
            #b2TierUnivOverlay .b2tu-groupcount{font-size:11px;font-weight:900;color:var(--text3)}
            #b2TierUnivOverlay .b2tu-groupavatars{display:flex;flex-wrap:wrap;gap:6px}
            #b2TierUnivOverlay .b2tu-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:12px}
            #b2TierUnivOverlay .b2tu-card{position:relative;border-radius:18px;overflow:hidden;aspect-ratio:0.78;background:#0b1120;border:1px solid rgba(255,255,255,.14);box-shadow:0 10px 22px rgba(15,23,42,.10);cursor:pointer}
            #b2TierUnivOverlay .b2tu-card img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center}
            #b2TierUnivOverlay .b2tu-topbadges{position:absolute;left:10px;right:10px;top:10px;display:flex;align-items:center;justify-content:space-between;gap:8px;z-index:2}
            #b2TierUnivOverlay .b2tu-pill{display:inline-flex;align-items:center;gap:4px;padding:5px 9px;border-radius:999px;background:rgba(15,23,42,.72);border:1px solid rgba(255,255,255,.28);backdrop-filter:blur(10px);font-size:11px;font-weight:900;color:#fff}
            #b2TierUnivOverlay .b2tu-fb{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:1000;color:rgba(255,255,255,.85);background:linear-gradient(160deg,rgba(71,85,105,.55),rgba(15,23,42,.42))}
            #b2TierUnivOverlay .b2tu-bottom{position:absolute;left:0;right:0;bottom:0;padding:10px 10px 12px;display:flex;flex-direction:column;gap:4px}
            #b2TierUnivOverlay .b2tu-bottom::before{content:'';position:absolute;left:0;right:0;bottom:0;height:78%;background:linear-gradient(180deg,rgba(15,23,42,0) 0%,rgba(15,23,42,.40) 24%,rgba(4,7,18,.92) 100%);pointer-events:none}
            #b2TierUnivOverlay .b2tu-bottom>*{position:relative;z-index:1}
            #b2TierUnivOverlay .b2tu-name{font-size:13px;font-weight:950;color:#fff;letter-spacing:-.02em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-shadow:0 2px 8px rgba(0,0,0,.5)}
            #b2TierUnivOverlay .b2tu-meta{display:flex;align-items:center;gap:6px;font-size:11px;font-weight:850;color:rgba(255,255,255,.92);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-shadow:0 1px 5px rgba(0,0,0,.5)}
            #b2TierUnivOverlay .b2tu-ubadge{display:inline-flex;align-items:center;gap:4px;max-width:100%;padding:2px 8px;border-radius:999px;border:1px solid rgba(255,255,255,.3);font-size:10.5px;font-weight:900;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;backdrop-filter:blur(6px);background:rgba(15,23,42,.55)!important}
            #b2TierUnivOverlay .b2tu-heat{display:grid;grid-template-columns:repeat(auto-fill,44px);gap:8px}
            #b2TierUnivOverlay .b2tu-av{width:44px;height:44px;border-radius:16px;overflow:hidden;border:1px solid rgba(148,163,184,.16);background:linear-gradient(160deg,rgba(148,163,184,.26),rgba(15,23,42,.12));box-shadow:0 6px 14px rgba(15,23,42,.08);cursor:pointer;padding:0}
            #b2TierUnivOverlay .b2tu-av img{width:100%;height:100%;object-fit:cover;object-position:top center;display:block}
            #b2TierUnivOverlay .b2tu-av span{display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:14px;font-weight:1000;color:rgba(255,255,255,.75)}
            @media (max-width:780px){#b2TierUnivOverlay .su-modal{height:min(920px,calc(100vh - 14px));width:min(100vw - 14px,1120px);border-radius:22px}#b2TierUnivOverlay .b2tu-summary{grid-template-columns:1fr}#b2TierUnivOverlay .b2tu-groupgrid{grid-template-columns:1fr}#b2TierUnivOverlay .b2tu-grid{grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px}}
          `,document.head.appendChild(s)}let a=document.getElementById("b2TierUnivOverlay");if(!a){a=document.createElement("div"),a.id="b2TierUnivOverlay",a.innerHTML=`
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
          `,document.body.appendChild(a),a.addEventListener("click",m=>{try{m.target&&m.target.id==="b2TierUnivOverlay"&&window.closeB2TierUnivModal()}catch(T){}});const s=a.querySelector("#b2tuClose");s&&s.addEventListener("click",()=>window.closeB2TierUnivModal()),window.closeB2TierUnivModal=function(){const m=document.getElementById("b2TierUnivOverlay");m&&(m.style.display="none")}}window._b2TierUnivState={tier:n,pool:c,ordered:b,selectedUniv:"ALL"};const f=a.querySelector("#b2tuTitle"),g=a.querySelector("#b2tuSub"),x=a.querySelector("#b2tuBody"),r=a.querySelector("#b2tuFilter"),d=a.querySelector("#b2tuSummary");f&&(f.textContent=`\uD2F0\uC5B4 \xB7 ${n}\uD2F0\uC5B4`),window._b2TierUnivRender=function(){const s=window._b2TierUnivState||{},m=s.selectedUniv||"ALL";r&&(r.innerHTML=["ALL"].concat((s.ordered||[]).map(([k])=>k)).map(k=>{const h=k==="ALL"?(s.pool||[]).length:(((s.ordered||[]).find(([M])=>M===k)||[])[1]||[]).length;return`<button type="button" class="b2tu-filterbtn ${m===k?"on":""}" onclick="window._b2TierUnivSetFilter && window._b2TierUnivSetFilter('${String(k).replace(/'/g,"\\'")}')">${k==="ALL"?`\uC804\uCCB4 (${h})`:`${k} (${h})`}</button>`}).join(""));const T=m==="ALL"?s.pool||[]:(s.pool||[]).filter(k=>String((k==null?void 0:k.univ)||"\uBB34\uC18C\uC18D")===m);if(g&&(g.textContent=`${m!=="ALL"?`${m} \xB7 `:""}${T.length}\uBA85`),d){const k=s.ordered||[],h=k[0];d.innerHTML=`
              <div class="b2tu-summarycard">
                <div class="b2tu-summarylabel">\uCD1D \uC778\uC6D0</div>
                <div class="b2tu-summaryvalue">${T.length}</div>
                <div class="b2tu-summarymeta">${m==="ALL"?"\uC804\uCCB4 \uAE30\uC900":"\uC120\uD0DD \uB300\uD559 \uAE30\uC900"}</div>
              </div>
              <div class="b2tu-summarycard">
                <div class="b2tu-summarylabel">\uBD84\uD3EC \uB300\uD559</div>
                <div class="b2tu-summaryvalue">${m==="ALL"?k.length:1}</div>
                <div class="b2tu-summarymeta">${m==="ALL"?"\uD2F0\uC5B4 \uBD84\uD3EC \uB300\uD559 \uC218":m}</div>
              </div>
              <div class="b2tu-summarycard">
                <div class="b2tu-summarylabel">\uCD5C\uB2E4 \uBCF4\uC720 \uB300\uD559</div>
                <div class="b2tu-summaryvalue">${h?h[0]:"-"}</div>
                <div class="b2tu-summarymeta">${h?`${h[1].length}\uBA85`:"\uC9D1\uACC4 \uB300\uAE30"}</div>
              </div>`}if(x){const k=m==="ALL"?`<div class="b2tu-groupgrid">${(s.ordered||[]).map(([h,C])=>{const M=typeof gc=="function"&&gc(h)||"#64748b",l=h&&h!=="\uBB34\uC18C\uC18D"&&typeof gUI=="function"?gUI(h,typeof getUnivLogoSizeStr=="function"?getUnivLogoSizeStr(h,"players","16px"):"16px"):"";return`<div class="b2tu-groupcard">
                    <div class="b2tu-grouphead">
                      <div class="b2tu-groupname" title="${String(h).replace(/"/g,"&quot;")}"><span class="b2tu-pill" style="background:${M}20;border-color:${M}44;color:${M}">${l}${h}</span></div>
                      <div class="b2tu-groupcount">${C.length}\uBA85</div>
                    </div>
                    <div class="b2tu-groupavatars">${C.slice(0,8).map(v=>{const i=String((v==null?void 0:v.name)||""),$=i.replace(/\\/g,"\\\\").replace(/'/g,"\\'"),I=String((v==null?void 0:v.photo)||"").trim();return`<button type="button" class="b2tu-av" onclick="if(typeof openPlayerModal==='function')openPlayerModal('${$}')" title="${i.replace(/"/g,"&quot;")}">${I?`<img src="${toHttpsUrl(I).replace(/\"/g,"&quot;")}" loading="lazy" decoding="async" onerror="this.parentNode.innerHTML='<span>${String((v==null?void 0:v.race)||"?")}</span>'">`:`<span>${String((v==null?void 0:v.race)||"?")}</span>`}</button>`}).join("")}</div>
                  </div>`}).join("")}</div>`:"";x.innerHTML=T.length?`${k}<div class="b2tu-grid">${T.map(h=>{const C=String((h==null?void 0:h.name)||""),M=String((h==null?void 0:h.photo)||"").trim(),l=String((h==null?void 0:h.race)||"?"),v=String((h==null?void 0:h.univ)||"\uBB34\uC18C\uC18D"),i=typeof gc=="function"&&gc(v)||"#64748b",$=v&&v!=="\uBB34\uC18C\uC18D"&&typeof gUI=="function"?gUI(v,typeof getUnivLogoSizeStr=="function"?getUnivLogoSizeStr(v,"players","16px"):"16px"):"",I=C.replace(/\\/g,"\\\\").replace(/'/g,"\\'"),A=M?`<img src="${toHttpsUrl(M).replace(/\"/g,"&quot;")}" loading="lazy" decoding="async" onerror="this.style.display='none'">`:"",P=`<div class="b2tu-fb" style="display:${M?"none":"flex"}">${l}</div>`;return`<div class="b2tu-card" onclick="if(typeof openPlayerModal==='function')openPlayerModal('${I}')">
                <div class="b2tu-topbadges">
                  <span class="b2tu-pill">${n}\uD2F0\uC5B4</span>
                  <span class="b2tu-pill" style="background:${i}55;border-color:${i}88">${l}</span>
                </div>
                ${A}${P}
                <div class="b2tu-bottom">
                  <div class="b2tu-name" title="${C.replace(/\"/g,"&quot;")}">${C}</div>
                  <div class="b2tu-meta"><span>${l}</span><span class="b2tu-ubadge" style="background:${i}22;border-color:${i}55;color:#fff">${$}${v}</span></div>
                </div>
              </div>`}).join("")}</div>`:'<div style="padding:24px;text-align:center;color:var(--text3);font-weight:800">\uD45C\uC2DC\uD560 \uC120\uC218\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.</div>'}},window._b2TierUnivSetFilter=function(s){window._b2TierUnivState=window._b2TierUnivState||{},window._b2TierUnivState.selectedUniv=String(s||"ALL"),window._b2TierUnivRender&&window._b2TierUnivRender()},window._b2TierUnivSetFilter("ALL"),a.style.display="block"}catch(t){console.error(t)}})}catch(e){}function _b2FemcoView(){var we,$e,_e,Se,pe;const e=()=>({autoLayout:1,logoSize:150,logoPos:"top",logoAttachTitle:1,headGap:10,logoOffsetX:0,logoOffsetY:0,titleSize:28,titleFont:"system",titlePos:"top",titleOffsetX:0,titleOffsetY:0,playerImgSize:76,playerImgShape:"square",rowsPerCol:5,colWidth:170,colGap:10,univGap:18,countFontSize:12,contentPadX:16,contentAlign:"left",contentOffsetX:0,univSubtitles:{},subtitleSize:12,subtitleWeight:800,subtitleColor:"",nameFontSize:18,roleFontSize:10,tierBadgeSize:10,tierBadgePadX:6,starSize:15,statusIconSize:18,bgOverlay:0,univColorOverrides:{},univBgMedia:{}});let t=typeof window._cfgFemcoLoad=="function"?window._cfgFemcoLoad():(function(){try{return JSON.parse(localStorage.getItem("b2_femco_settings_v1")||"null")||e()}catch(y){return e()}})();window._b2FemcoOpenBgMedia=function(y,p){const S=String(y||""),z=String(p||"").trim();if(!z)return;const U=z.toLowerCase(),R=/\.(mp4|webm|ogg)(\?|#|$)/i.test(U);if(/(youtube\.com|youtu\.be|twitch\.tv)/i.test(U)){try{window.open(z,"_blank","noopener")}catch(G){location.href=z}return}if(!R){try{window.open(z,"_blank","noopener")}catch(G){location.href=z}return}const w=document.getElementById("b2-femco-bg-modal");w&&w.remove();const B=document.createElement("div");B.id="b2-femco-bg-modal",B.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,.60);z-index:var(--z-modal-5);display:flex;align-items:center;justify-content:center;padding:16px";const V=(S||"\uC601\uC0C1").replace(/</g,"&lt;").replace(/>/g,"&gt;");B.innerHTML=`
        <div style="width:min(980px,96vw);background:var(--white);border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,.16);box-shadow:0 18px 60px rgba(0,0,0,.35)">
          <div style="display:flex;align-items:center;gap:10px;padding:12px 14px;background:linear-gradient(to bottom, rgba(255,255,255,.95), rgba(255,255,255,.85));border-bottom:1px solid var(--border)">
            <div style="font-weight:1000;color:var(--text2)">\u{1F39E}\uFE0F ${V} \uBC30\uACBD \uC601\uC0C1</div>
            <span style="color:var(--gray-l);font-size:12px">\uD074\uB9AD\uD574\uC11C \uC7AC\uC0DD\uB429\uB2C8\uB2E4</span>
            <button style="margin-left:auto;border:1px solid var(--border);background:var(--surface);border-radius:10px;padding:6px 10px;cursor:pointer;font-weight:1000" onclick="document.getElementById('b2-femco-bg-modal')?.remove()">\uB2EB\uAE30</button>
          </div>
          <div style="padding:12px 14px">
            <video src="${z}" controls playsinline style="width:100%;max-height:72vh;border-radius:12px;background:#000"></video>
          </div>
        </div>
      `,B.addEventListener("click",G=>{G.target===B&&B.remove()}),document.body.appendChild(B)};const n=_b2VisUnivs().filter(y=>y.name);if(!n.length)return'<div style="text-align:center;color:var(--text3);padding:40px">\uD45C\uC2DC\uD560 \uB300\uD559\uC774 \uC5C6\uC2B5\uB2C8\uB2E4</div>';typeof univCfg!="undefined"&&univCfg.length?n.sort((y,p)=>{const S=univCfg.findIndex(U=>U.name===y.name),z=univCfg.findIndex(U=>U.name===p.name);return(S>=0?S:999)-(z>=0?z:999)}):n.sort((y,p)=>(y.name||"").localeCompare(p.name||"","ko",{sensitivity:"base"}));const c=new Set((typeof univCfg!="undefined"?univCfg:[]).filter(y=>y.dissolved).map(y=>String(y.name||"").trim())),o={};n.forEach(y=>{o[y.name]=players.filter(p=>String((p==null?void 0:p.univ)||"").trim()===String(y.name||"").trim()&&!p.hidden&&!p.retired&&!p.hideFromBoard&&!c.has(String((p==null?void 0:p.univ)||"").trim()))});const b=Math.max(60,Math.min(520,parseInt(t.logoSize||150,10)||150)),a=Math.max(-120,Math.min(120,parseInt((we=t.logoOffsetX)!=null?we:0,10)||0)),f=Math.max(-120,Math.min(120,parseInt(($e=t.logoOffsetY)!=null?$e:0,10)||0)),g=Math.max(-120,Math.min(120,parseInt((_e=t.titleOffsetX)!=null?_e:0,10)||0)),x=Math.max(-120,Math.min(120,parseInt((Se=t.titleOffsetY)!=null?Se:0,10)||0)),r=Math.max(0,Math.min(70,parseInt((pe=t.bgOverlay)!=null?pe:0,10))),d=r/70*.22,s=r/70*.52,m=Math.max(16,Math.min(44,parseInt(t.titleSize||28,10)||28)),T=Math.max(28,Math.min(160,parseInt(t.playerImgSize||64,10)||64)),k={sharp:"0px",roundedsm:"6px",square:"10px",roundedlg:"22px",roundedxl:"34px",circle:"50%"}[t.playerImgShape]||"10px",h=Math.max(2,Math.min(12,parseInt(t.rowsPerCol||5,10)||5)),C=Math.max(80,Math.min(360,parseInt(t.colWidth||170,10)||170)),M=Math.max(0,Math.min(28,parseInt(t.colGap||10,10)||10)),l=10,v=Math.max(0,Math.min(120,parseInt(t.univGap||18,10)||18)),i=Math.max(10,Math.min(18,parseInt(t.countFontSize||12,10)||12)),$=Math.max(0,Math.min(40,parseInt(t.contentPadX||16,10)||16)),I=t.contentAlign==="left"||t.contentAlign==="center"?t.contentAlign:"left",A=Math.max(-40,Math.min(40,parseInt(t.contentOffsetX||0,10)||0)),P=Math.max(0,Math.min(80,parseInt(t.headGap||10,10)||10)),H=!(t.autoLayout===0||t.autoLayout===!1),_=typeof window!="undefined"&&(document.documentElement.clientWidth||window.innerWidth)||1280,L=Math.max(0,Math.min(80,$+A)),j=Math.max(0,Math.min(80,$-A));function E(y){let p=5;y>=55?p=9:y>=45?p=8:y>=35?p=7:y>=25?p=6:p=5;let S=175;return _<=520?(p=Math.max(p,8),S=150):_<=768?(p=Math.max(p,7),S=160):_<=1024?(p=Math.max(p,6),S=170):S=y>=45?160:175,p=Math.max(4,Math.min(12,p)),S=Math.max(130,Math.min(220,S)),{rowsPerCol:p,colWidth:S}}const q=Math.max(10,Math.min(24,parseInt(t.subtitleSize||12,10)||12)),N=[400,500,600,700,800,900].includes(parseInt(t.subtitleWeight||800,10))?parseInt(t.subtitleWeight||800,10):800,K=typeof t.subtitleColor=="string"?t.subtitleColor:"",me=Math.max(10,Math.min(28,parseInt(t.nameFontSize||16,10)||16)),ne=Math.max(9,Math.min(16,parseInt(t.roleFontSize||10,10)||10)),re=Math.max(9,Math.min(16,parseInt(t.tierBadgeSize||10,10)||10)),ae=Math.max(4,Math.min(12,parseInt(t.tierBadgePadX||6,10)||6)),ve=Math.max(10,Math.min(28,parseInt(t.starSize||15,10)||15)),oe=(()=>{switch(t.titleFont){case"app":return"var(--app-font)";case"noto":return"'Noto Sans KR', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif";case"pretendard":return"'Pretendard Variable', Pretendard, system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif";case"nanum":return"'Nanum Gothic', 'Noto Sans KR', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif";case"gmarket":return"'GmarketSans', 'Noto Sans KR', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif";default:return"system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif"}})();(function(){const y=document.head||document.getElementsByTagName("head")[0];if(!y)return;const p=(U,R)=>{if(!R){const w=document.getElementById(U);w&&w.remove();return}let u=document.getElementById(U);u||(u=document.createElement("link"),u.id=U,u.rel="stylesheet",y.appendChild(u)),u.href=R},S={noto:"https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700;900&display=swap",pretendard:"https://cdn.jsdelivr.net/gh/orioncactus/pretendard@latest/dist/web/variable/pretendardvariable.css",nanum:"https://fonts.googleapis.com/css2?family=Nanum+Gothic:wght@400;700;800&display=swap",gmarket:"https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/GmarketSans.css"},z=t.titleFont;p("femco-titlefont-css",S[z]||"")})();const Q=y=>{const p=y.tier||"",S=typeof TIERS!="undefined"&&TIERS.includes(p)?TIERS.indexOf(p):999;return S>=0?S:999},he=y=>{const p=(y.role||"").trim(),z=["\uC774\uC0AC\uC7A5","\uCD1D\uC7A5","\uAD50\uC218","\uCF54\uCE58"].indexOf(p);return z>=0?z:99},se=y=>y.race==="P"?"P":y.race==="T"?"T":y.race==="Z"?"Z":"?",ee=y=>{const p=String(y||"").replace("#","").trim();if(p.length<6)return null;const S=parseInt(p.slice(0,2),16),z=parseInt(p.slice(2,4),16),U=parseInt(p.slice(4,6),16);return[S,z,U].some(R=>Number.isNaN(R))?null:{r:S,g:z,b:U}},ze=(y,p,S)=>"#"+[y,p,S].map(z=>Math.max(0,Math.min(255,Math.round(z))).toString(16).padStart(2,"0")).join(""),W=(y,p,S)=>{const z=ee(y),U=ee(p);if(!z||!U)return y||p||"#94a3b8";const R=Math.max(0,Math.min(1,+S||0));return ze(z.r*(1-R)+U.r*R,z.g*(1-R)+U.g*R,z.b*(1-R)+U.b*R)},le=y=>{const p=ee(y);if(!p)return 0;const S=u=>(u/=255,u<=.03928?u/12.92:Math.pow((u+.055)/1.055,2.4)),z=S(p.r),U=S(p.g),R=S(p.b);return .2126*z+.7152*U+.0722*R},ye=(y,p)=>{const S=le(y),z=le(p),U=Math.max(S,z),R=Math.min(S,z);return(U+.05)/(R+.05)},de=(y,p=3)=>{let S=y||"#94a3b8";if(ye(S,"#ffffff")>=p)return S;const z=[.25,.4,.55,.7];for(const U of z){const R=W(S,"#0f172a",U);if(ye(R,"#ffffff")>=p)return R}return W(S,"#0f172a",.75)},Me=(y,p)=>{const S=y.race==="P"?"#c084fc":y.race==="T"?"#38bdf8":y.race==="Z"?"#34d399":"#94a3b8",z=p?W(S,p,.22):S;return de(z,3)};function Ie(y,p){var u;const S=y&&y.photo?String(y.photo):"",z=y&&y.name?String(y.name).slice(0,1):"?",U=`${p}55`;let R="";try{const w=getStatusIcon(y.name),B=getStatusIconHTML(y.name),V=T,G=parseInt((u=t.statusIconSize)!=null?u:18,10),Z=G===0?0:Math.max(10,Math.min(36,G||Math.round(V*.38))),F=w&&(typeof _siIsImg=="function"?_siIsImg(w):!1),Le=F?`<img src="${w}" style="width:${Z}px;height:${Z}px;border-radius:50%;object-fit:cover;opacity:.86" onerror="this.style.display='none'">`:B?B.replace(/margin-left:[^;]+;/g,"").replace(/font-size:[^;]+;/g,""):"",ke=F?"rgba(255,255,255,.72)":"transparent",Oe=-Math.round(Z*.26),te=-Math.round(Z*.26);R=B?`<span style="position:absolute;top:${Oe}px;left:${te}px;width:${Z}px;height:${Z}px;border-radius:50%;background:${ke};overflow:hidden;display:flex;align-items:center;justify-content:center;font-size:${Math.round(Z*.82)}px;line-height:1;filter:drop-shadow(0 1px 2px rgba(0,0,0,.65))">${Le}</span>`:""}catch(w){console.warn("[femcoAvatarSquare] \uC0C1\uD0DC \uC544\uC774\uCF58 \uC0DD\uC131 \uC2E4\uD328:",w.message)}return S?`<span style="position:relative;display:block;width:100%;height:100%">
        <img src="${S}" decoding="async" fetchpriority="high" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;border:2px solid ${U};background:rgba(255,255,255,.25)" onerror="this.closest('span').outerHTML='<div style=&quot;position:relative;width:100%;height:100%;border-radius:inherit;background:${p};display:flex;align-items:center;justify-content:center;font-weight:1000;font-size:22px;color:#fff;border:2px solid ${U}&quot;>${z}</div>'">
        ${R}
      </span>`:`<div style="position:relative;width:100%;height:100%;border-radius:inherit;background:${p};display:flex;align-items:center;justify-content:center;font-weight:1000;font-size:22px;color:#fff;border:2px solid ${U}">${z}${R}</div>`}let ce=`
    <style>
      .b2-femco-wrap{display:flex;flex-direction:column;gap:${v}px}
      .b2-femco-univ{border-radius:22px;overflow:hidden;box-shadow:0 4px 28px rgba(0,0,0,.14);transition:background-color .35s ease, box-shadow .35s ease, transform .22s ease}
      .b2-femco-univ:hover{transform:translateY(-2px);box-shadow:0 10px 36px rgba(0,0,0,.20)}
      .b2-femco-head{padding:16px 16px 12px;text-align:center;position:relative}
      .b2-femco-headrow{display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap}
      .b2-femco-headcol{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:${P}px}
      .b2-femco-logo{display:flex;justify-content:center;margin-bottom:0}
      .b2-femco-title-row{display:flex;align-items:center;gap:6px;justify-content:center}
      .b2-femco-title{font-weight:1000;font-size:${m}px;letter-spacing:-.04em;line-height:1.1;font-family:${oe}}
      .b2-femco-stars{display:inline-flex;gap:1px;align-items:center;opacity:.95}
      .b2-femco-stars span{font-size:${ve}px;line-height:1}
      .b2-femco-subtitle{margin-top:6px;font-size:${q}px;font-weight:${N};line-height:1.2;opacity:.95}
      /* \uC778\uC6D0\uC218: \uC88C\uCE21 \uC0C1\uB2E8 \uACE0\uC815 (\uBC30\uACBD \uC5C6\uC74C) */
      .b2-femco-countbox{
        position:absolute;top:10px;left:10px;
        display:flex;flex-direction:column;gap:2px;align-items:flex-start;justify-content:flex-start;
        padding:0;border-radius:0;background:transparent;border:none;color:inherit;
        max-width:45%;
      }
      .b2-femco-countbox div{font-size:${i}px;font-weight:1000;line-height:1.15;white-space:nowrap}
      .b2-femco-meta{margin-top:6px;display:flex;justify-content:center;gap:8px;flex-wrap:wrap}
      .b2-femco-pill{font-size:12px;font-weight:1000;padding:3px 10px;border-radius:999px;border:1px solid rgba(255,255,255,.55);background:rgba(255,255,255,.16)}
      .b2-femco-body{padding:12px 12px 16px}
      .b2-femco-group{margin-top:10px}
      .b2-femco-group:first-child{margin-top:0}
      .b2-femco-ghead{display:flex;align-items:center;gap:8px;margin:0 0 8px}
      .b2-femco-glabel{font-size:12px;font-weight:1000;background:rgba(255,255,255,.78);border:1px solid rgba(0,0,0,.10);padding:3px 10px;border-radius:999px}
      .b2-femco-gcount{font-size:11px;font-weight:900;opacity:.85}

      /* \u2705 \uBC30\uCE58 \uADDC\uCE59(\uC694\uAD6C\uC0AC\uD56D)
         - 1\uBC88(\uCCAB \uCEEC\uB7FC) \uC704\u2192\uC544\uB798\uB85C 5\uBA85 \uCC44\uC6C0
         - 5\uBA85 \uB418\uBA74 \uC6B0\uCE21(\uB2E4\uC74C \uCEEC\uB7FC) 1\uBC88\uC73C\uB85C \uB2E4\uC2DC \uC704\u2192\uC544\uB798\uB85C 5\uBA85
      */
      .b2-femco-grid{
        display:grid;
        --rowsPerCol:${h};
        --colWidth:${C}px;
        column-gap:${l}px;
        row-gap:${M}px;
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
      .b2-femco-avatar{width:${T}px;height:${T}px;border-radius:${k};overflow:hidden;flex-shrink:0;position:relative}
      .b2-femco-text{display:flex!important;flex-direction:column!important;align-items:flex-start!important;text-align:left!important;gap:2px;min-width:0}
      .b2-femco-tier{font-size:10px;font-weight:1000;display:inline-flex;align-items:center;gap:4px}
      .b2-femco-tierbadge{font-size:${re}px;padding:2px ${ae}px;border-radius:999px;border:1px solid rgba(0,0,0,.12);display:inline-flex;align-items:center;line-height:1}
      .b2-femco-role{font-size:${ne}px;font-weight:1000;opacity:.9}
      .b2-femco-name{font-size:${me}px;font-weight:1000;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .b2-femco-race-pill{display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:1000;padding:1px 6px;border-radius:999px;background:rgba(255,255,255,.85);border:1px solid rgba(0,0,0,.10)}

      @media(max-width:520px){ .b2-femco-title{font-size:20px} }
    </style>
    <div class="b2-femco-wrap">
  `;return n.forEach(y=>{var We;const p=y.name,S=o[p]||[];if(!S.length)return;const U=(t.univColorOverrides||{})[p]||gc(p),R=_b2ContrastColor(U),u=(typeof univCfg!="undefined"?univCfg.find(O=>O.name===p):null)||{},w=(()=>{const O=parseInt(u.logoSizeFemco||"",10);return!isNaN(O)&&O>0?Math.max(60,Math.min(520,O)):b})(),B=u.icon||u.img||"",V=B?`<img src="${toHttpsUrl(B)}" style="width:${w}px;height:${w}px;object-fit:contain" onerror="this.style.display='none'">`:`<span style="display:inline-flex;align-items:center;justify-content:center;width:${Math.round(w*.62)}px;height:${Math.round(w*.62)}px;opacity:.85;font-size:${Math.round(w*.48)}px;line-height:1">\u{1F3EB}</span>`,G=S.filter(O=>(O.role||"").trim()==="\uC774\uC0AC\uC7A5").length,Z=S.filter(O=>["\uAD50\uC218","\uCF54\uCE58"].includes((O.role||"").trim())).length,F=Math.max(0,S.length-G-Z),Le=[...S].sort((O,Y)=>{const D=he(O),fe=he(Y);if(D!==fe)return D-fe;const xe=Q(O),ue=Q(Y);return xe!==ue?xe-ue:(O.name||"").localeCompare(Y.name||"","ko",{sensitivity:"base"})}),ke=((t.univSubtitles||{})[p]||"").trim(),Oe=K&&K.trim()?K:R,te=(t.univBgMedia||{})[p]||"",X=(function(){const O={url:"",alpha:30,sizeMode:"cover",sizeVal:90,pos:"center",repeat:"no-repeat",ox:0,oy:0};return te?typeof te=="string"?Ae(Te({},O),{url:String(te).trim()}):typeof te=="object"?Ae(Te(Te({},O),te),{url:String(te.url||"").trim()}):O:O})(),J=(X.url||"").trim(),Ue=J.toLowerCase(),Re=J&&/\.(png|jpe?g|webp|gif)(\?|#|$)/i.test(Ue),Be=J&&/\.(mp4|webm|ogg)(\?|#|$)/i.test(Ue),Ce=J&&/(youtube\.com|youtu\.be|twitch\.tv)/i.test(Ue),Pe=Be||Ce||J&&!Re?`<button class="b2-femco-pill no-export" style="cursor:pointer" onclick="_b2FemcoOpenBgMedia('${p.replace(/'/g,"\\'")}', '${J.replace(/'/g,"\\'")}');event.stopPropagation();">${Be?"\u{1F39E}\uFE0F \uBC30\uACBD\uC601\uC0C1":Ce?"\u{1F517} \uBC30\uACBD\uB9C1\uD06C":"\u{1F5BC}\uFE0F \uBC30\uACBD\uB9C1\uD06C"}</button>`:"",Fe=t.logoPos||"top",ie=["left","right","top","bottom","center"].includes(Fe)?Fe:"top",He=!!((We=t.logoAttachTitle)==null||We),Ne=t.titlePos||"bottom",je=["left","right","top","bottom"].includes(Ne)?Ne:"bottom",Xe=(u.championships||0)>0?`<span class="b2-femco-stars">${"<span>\u2B50</span>".repeat(u.championships)}</span>`:"",ge=`
      <div style="min-width:220px;transform:translate(${g}px,${x}px)">
        <div class="b2-femco-title-row">
          <div class="b2-femco-title">${p}</div>
          ${Xe}
        </div>
        ${ke?`<div class="b2-femco-subtitle" style="color:${Oe}">${ke}</div>`:""}
        ${Pe?`<div class="b2-femco-meta">${Pe}</div>`:""}
      </div>
    `,Ye=(()=>{if(He)return"";const O=$;return ie==="left"?`position:absolute;left:${O}px;top:50%;transform:translateY(-50%) translate(${a}px,${f}px);`:ie==="right"?`position:absolute;right:${O}px;top:50%;transform:translateY(-50%) translate(${a}px,${f}px);`:ie==="bottom"?`position:absolute;left:50%;bottom:10px;transform:translateX(-50%) translate(${a}px,${f}px);`:`position:absolute;left:50%;top:10px;transform:translateX(-50%) translate(${a}px,${f}px);`})(),Je=(()=>{if(!He){const D=Math.max(0,Math.round(w*.55)+16);return`
          <div class="b2-femco-headrow" style="padding-left:${ie==="left"?D:0}px;padding-right:${ie==="right"?D:0}px">
            <div class="b2-femco-logo" style="${Ye}">${V}</div>
            ${ge}
          </div>
        `}const O=ie==="left"?"justify-content:flex-start":ie==="right"?"justify-content:flex-end":"justify-content:center",Y=`<div class="b2-femco-logo" style="transform:translate(${a}px,${f}px)">${V}</div>`;return je==="left"?`<div class="b2-femco-headrow" style="${O}">${ge}${Y}</div>`:je==="right"?`<div class="b2-femco-headrow" style="${O}">${Y}${ge}</div>`:je==="top"?`<div class="b2-femco-headcol" style="${O}">${ge}${Y}</div>`:`<div class="b2-femco-headcol" style="${O}">${Y}${ge}</div>`})(),Ge=H?E(S.length):{rowsPerCol:h,colWidth:C},Ke=O=>{const Y=String(O||"center");return{center:[50,50],top:[50,0],bottom:[50,100],left:[0,50],right:[100,50],"top left":[0,0],"top right":[100,0],"bottom left":[0,100],"bottom right":[100,100]}[Y]||[50,50]},[Qe,et]=Ke(X.pos),tt=parseInt(X.ox||0,10)||0,it=parseInt(X.oy||0,10)||0,De=`calc(${Qe}% + ${tt}px) calc(${et}% + ${it}px)`;let be="cover";X.sizeMode==="contain"?be="contain":X.sizeMode==="pct"?be=`${Math.max(10,Math.min(220,parseInt(X.sizeVal||90,10)||90))}%`:X.sizeMode==="px"&&(be=`${Math.max(30,Math.min(900,parseInt(X.sizeVal||240,10)||240))}px`);const qe=Math.max(0,Math.min(100,parseInt(X.alpha||30,10)||0))/100,ot=["no-repeat","repeat","repeat-x","repeat-y"].includes(X.repeat)?X.repeat:"no-repeat",nt=Re&&J?`<img src="${toHttpsUrl(J).replace(/"/g,"&quot;")}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:${be};object-position:${De};opacity:${qe.toFixed(3)};pointer-events:none;z-index:0" onerror="this.style.display='none'">`:Be||Ce?`<div style="position:absolute;inset:0;background-image:url('${J.replace(/'/g,"%27")}');background-repeat:${ot};background-size:${be};background-position:${De};opacity:${qe.toFixed(3)};pointer-events:none;z-index:0"></div>`:"",rt=Re&&J&&r>0?`<div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(2,6,23,${d.toFixed(3)}), rgba(2,6,23,${s.toFixed(3)}));pointer-events:none;z-index:1"></div>`:"";ce+=`
      <section class="b2-femco-univ" style="position:relative;overflow:hidden;background:${U};">
        ${nt}${rt}
        <div class="b2-femco-head" style="position:relative;z-index:2;color:${R};padding-left:${L}px;padding-right:${j}px">
          <div class="b2-femco-countbox" style="color:${R};left:${L}px;${R==="#ffffff"?"text-shadow:0 1px 2px rgba(0,0,0,.45);":""}">
            <div>\uCD1D ${S.length}</div>
            <div>\uC774\uC0AC\uC7A5 ${G}</div>
            <div>\uAD50\uC218+\uCF54\uCE58 ${Z}</div>
            <div>\uD559\uC0DD ${F}</div>
          </div>
          ${Je}
        </div>

        <div class="b2-femco-body" style="position:relative;z-index:2;background:transparent;padding-left:${L}px;padding-right:${j}px">
          <div class="b2-femco-grid" style="--rowsPerCol:${Ge.rowsPerCol};--colWidth:${Ge.colWidth}px">
            ${Le.map(O=>{const Y=(O.name||"").replace(/'/g,"\\'"),D=O.tier||"?",fe=D&&D!=="?"&&typeof getTierBtnColor=="function"?getTierBtnColor(D):"#64748b",xe=D&&D!=="?"&&(typeof getTierBtnTextColor=="function"?getTierBtnTextColor(D):"#fff")||"#fff",ue=(O.role||"").trim(),Ee=Me(O,U);return`
                <div class="b2-femco-item" onclick="openPlayerModal('${Y}');event.stopPropagation();">
                  <div class="b2-femco-avatar">${Ie(O,Ee)}</div>
                  <div class="b2-femco-text" style="${O.inactive?"opacity:.65":""};color:${R}">
                    <div class="b2-femco-tier">
                      <span class="b2-femco-tierbadge" style="background:${fe};color:${xe}">${D}</span>
                    </div>
                    ${ue?`<div class="b2-femco-role">${ue}</div>`:""}
                    <div class="b2-femco-name">${O.name||""}</div>
                    <div><span class="b2-femco-race-pill" style="color:${Ee};border-color:${Ee}88;background:${R==="#ffffff"?"rgba(0,0,0,.28)":"rgba(255,255,255,.92)"};box-shadow:0 1px 2px rgba(0,0,0,.18)">${se(O)}</span></div>
                  </div>
                </div>
              `}).join("")}
          </div>
        </div>
      </section>
    `}),ce+="</div>",ce}function openB2PlayerCreateModal(){if(!isLoggedIn||typeof isSubAdmin!="undefined"&&isSubAdmin||document.getElementById("b2-player-create-modal"))return;const e=(typeof univCfg!="undefined"?univCfg:[]).map(o=>o.name).filter(Boolean),t=typeof TIERS!="undefined"&&Array.isArray(TIERS)?TIERS:["0","1","2","3","4","5","6","7","8","\uC720\uC2A4"],n=["\uD559\uC0DD","\uCF54\uCE58","\uAD50\uC218","\uCD1D\uC7A5","\uC774\uC0AC\uC7A5"],c=document.createElement("div");c.id="b2-player-create-modal",c.style.cssText="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:var(--z-modal-5)",c.innerHTML=`
    <div style="background:var(--white);border-radius:16px;padding:24px;max-width:560px;width:92%;max-height:84vh;overflow-y:auto;box-shadow:0 10px 40px rgba(0,0,0,0.3)">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px">
        <h3 style="margin:0;font-size:18px;font-weight:900;color:var(--text1)">\u{1F3AC} \uC2A4\uD2B8\uB9AC\uBA38 \uB4F1\uB85D</h3>
        <button onclick="document.getElementById('b2-player-create-modal').remove()" style="background:none;border:none;font-size:20px;cursor:pointer;color:var(--gray-l)">\u2715</button>
      </div>

      <div id="b2-newplayer-msg" style="font-size:12px;color:var(--gray-l);margin-bottom:12px">\uC800\uC7A5 \uD6C4 \uC790\uB3D9\uC73C\uB85C \uC785\uB825\uCE78\uC774 \uCD08\uAE30\uD654\uB418\uC5B4 \uC5F0\uC18D \uB4F1\uB85D\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.</div>

      <div style="display:grid;grid-template-columns:140px 1fr;gap:10px;align-items:center;margin-bottom:12px">
        <div style="font-size:13px;font-weight:800;color:var(--text2)">\uC774\uB984</div>
        <input id="b2-newplayer-name" type="text" placeholder="\uC608: \uD64D\uAE38\uB3D9" style="padding:8px 12px;border:1px solid var(--border2);border-radius:10px;font-size:13px">
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr;gap:10px;align-items:center;margin-bottom:12px">
        <div style="font-size:13px;font-weight:800;color:var(--text2)">\uB300\uD559</div>
        <select id="b2-newplayer-univ" style="padding:8px 12px;border:1px solid var(--border2);border-radius:10px;font-size:13px">
          <option value="">(\uC120\uD0DD)</option>
          ${e.map(o=>`<option value="${o}">${o}</option>`).join("")}
        </select>
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr;gap:10px;align-items:center;margin-bottom:12px">
        <div style="font-size:13px;font-weight:800;color:var(--text2)">\uC9C1\uAE09</div>
        <select id="b2-newplayer-role" style="padding:8px 12px;border:1px solid var(--border2);border-radius:10px;font-size:13px">
          ${n.map(o=>`<option value="${o}"${o==="\uD559\uC0DD"?" selected":""}>${o}</option>`).join("")}
        </select>
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr;gap:10px;align-items:center;margin-bottom:12px">
        <div style="font-size:13px;font-weight:800;color:var(--text2)">\uC885\uC871</div>
        <select id="b2-newplayer-race" style="padding:8px 12px;border:1px solid var(--border2);border-radius:10px;font-size:13px">
          <option value="P">\uD504\uB85C\uD1A0\uC2A4</option>
          <option value="T">\uD14C\uB780</option>
          <option value="Z">\uC800\uADF8</option>
          <option value="N" selected>\uBBF8\uC815</option>
        </select>
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr;gap:10px;align-items:center;margin-bottom:12px">
        <div style="font-size:13px;font-weight:800;color:var(--text2)">\uD2F0\uC5B4</div>
        <select id="b2-newplayer-tier" style="padding:8px 12px;border:1px solid var(--border2);border-radius:10px;font-size:13px">
          <option value="?" selected>\uBBF8\uC815</option>
          ${t.map(o=>`<option value="${o}">${o}</option>`).join("")}
        </select>
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr;gap:10px;align-items:center;margin-bottom:12px">
        <div style="font-size:13px;font-weight:800;color:var(--text2)">\uCC44\uB110 URL</div>
        <input id="b2-newplayer-channel" type="text" placeholder="https://..." style="padding:8px 12px;border:1px solid var(--border2);border-radius:10px;font-size:13px">
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr;gap:10px;align-items:center;margin-bottom:12px">
        <div style="font-size:13px;font-weight:800;color:var(--text2)">\uD504\uB85C\uD544 \uC774\uBBF8\uC9C0 1</div>
        <input id="b2-newplayer-photo" type="text" placeholder="https://... (base64 \uBD88\uAC00)" style="padding:8px 12px;border:1px solid var(--border2);border-radius:10px;font-size:13px">
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr;gap:10px;align-items:center;margin-bottom:4px">
        <div style="font-size:13px;font-weight:800;color:var(--text2)">\uD504\uB85C\uD544 \uC774\uBBF8\uC9C0 2</div>
        <input id="b2-newplayer-photo2" type="text" placeholder="https://... (\uC120\uD0DD)" style="padding:8px 12px;border:1px solid var(--border2);border-radius:10px;font-size:13px">
      </div>
      <div style="font-size:11px;color:var(--gray-l);margin:0 0 14px 150px">\u203B 2\uBC88 \uC774\uBBF8\uC9C0\uB294 \uC774\uBBF8\uC9C0\uBCC4(Players) \uBA54\uC778\uC5D0\uC11C 1\uCD08 \uD6C4 \uC790\uB3D9 \uAD50\uCCB4\uC6A9</div>

      <div style="display:flex;gap:10px;margin-top:18px">
        <button onclick="document.getElementById('b2-player-create-modal').remove()" style="flex:1;padding:10px 16px;background:var(--surface);border:1px solid var(--border2);border-radius:10px;color:var(--text2);font-size:13px;font-weight:700;cursor:pointer">\uB2EB\uAE30</button>
        <button onclick="saveB2NewPlayer()" style="flex:1;padding:10px 16px;background:var(--blue);border:1px solid var(--blue);border-radius:10px;color:#fff;font-size:13px;font-weight:800;cursor:pointer">\uC800\uC7A5</button>
      </div>
    </div>
  `,document.body.appendChild(c)}function saveB2NewPlayer(){var m,T,k,h,C,M,l,v;const e=document.getElementById("b2-newplayer-msg"),t=(((m=document.getElementById("b2-newplayer-name"))==null?void 0:m.value)||"").trim(),n=(((T=document.getElementById("b2-newplayer-univ"))==null?void 0:T.value)||"").trim(),c=(((k=document.getElementById("b2-newplayer-role"))==null?void 0:k.value)||"").trim(),o=(((h=document.getElementById("b2-newplayer-race"))==null?void 0:h.value)||"N").trim(),b=(((C=document.getElementById("b2-newplayer-tier"))==null?void 0:C.value)||"?").trim(),a=(((M=document.getElementById("b2-newplayer-channel"))==null?void 0:M.value)||"").trim(),f=(((l=document.getElementById("b2-newplayer-photo"))==null?void 0:l.value)||"").trim(),g=(((v=document.getElementById("b2-newplayer-photo2"))==null?void 0:v.value)||"").trim();if(!t){alert("\uC774\uB984\uC740 \uD544\uC218\uC785\uB2C8\uB2E4.");return}if(players.find(i=>i.name===t)){alert("\uC774\uBBF8 \uC874\uC7AC\uD558\uB294 \uC774\uB984\uC785\uB2C8\uB2E4: "+t);return}if(f&&f.startsWith("data:")){alert("\u274C base64 \uC774\uBBF8\uC9C0(data:...)\uB294 \uC800\uC7A5/\uB3D9\uAE30\uD654\uAC00 \uC2E4\uD328\uD560 \uC218 \uC788\uC5B4 \uAE08\uC9C0\uC785\uB2C8\uB2E4. URL\uC744 \uC0AC\uC6A9\uD558\uC138\uC694.");return}const x={name:t,univ:n||"\uBB34\uC18C\uC18D",role:c||"\uD559\uC0DD",race:o,tier:b,channelUrl:a||void 0,photo:f||void 0,secondProfileFile:g||void 0};players.push(x),save(),render(),["b2-newplayer-name","b2-newplayer-channel","b2-newplayer-photo","b2-newplayer-photo2"].forEach(i=>{const $=document.getElementById(i);$&&($.value="")});const r=document.getElementById("b2-newplayer-tier");r&&(r.value="?");const d=document.getElementById("b2-newplayer-race");d&&(d.value="N");const s=document.getElementById("b2-newplayer-role");s&&(s.value="\uD559\uC0DD"),e&&(e.style.color="#16a34a",e.textContent=`\u2705 \uC800\uC7A5\uB428: ${t} (\uB2E4\uC74C \uC2A4\uD2B8\uB9AC\uBA38\uB97C \uACC4\uC18D \uB4F1\uB85D\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4)`)}async function saveB2FemcoAllImg(){return _saveB2FemcoInternal()}async function _saveB2FemcoInternal(){const t=document.querySelector('[onclick="saveB2FemcoAllImg()"]');t&&(t.disabled=!0,t.textContent="\u23F3...");try{const f="download"in document.createElement("a"),g=String(navigator.userAgent||""),x=/iPad|iPhone|iPod/i.test(g),r=/KAKAOTALK|Instagram|FBAN|FBAV|NAVER|Whale|Line/i.test(g);if(!f||x||r){const d=window.open("","_blank");if(d){try{d.document.write('<html><head><meta charset="utf-8"><title>\uC774\uBBF8\uC9C0 \uC0DD\uC131 \uC911...</title></head><body style="margin:0;font-family:sans-serif;background:#111;color:#fff;padding:14px">\uD3A8\uCF54\uC2A4\uD0C0\uC77C \uC774\uBBF8\uC9C0 \uC0DD\uC131 \uC911\uC785\uB2C8\uB2E4... \uC7A0\uC2DC\uB9CC \uAE30\uB2E4\uB824\uC8FC\uC138\uC694.</body></html>'),d.document.close()}catch(s){}window.__captureDlWin=d}}}catch(a){}const n=document.createElement("div");n.style.cssText="position:fixed;left:-9999px;top:0;padding:24px;background:#0b1220;box-sizing:border-box;",n.innerHTML=_b2FemcoView(),document.body.appendChild(n),n.querySelectorAll(".b2-femco-subnav,.b2-femco-panel,.no-export,.no-export-movebtns").forEach(a=>a.remove()),await new Promise(a=>setTimeout(a,120));try{typeof injectUnivIcons=="function"&&injectUnivIcons(n)}catch(a){console.warn("[saveB2FemcoAllImg] \uB300\uD559 \uC544\uC774\uCF58 \uC8FC\uC785 \uC2E4\uD328:",a.message)}try{typeof _imgToDataUrls=="function"&&await _imgToDataUrls(n,12e3)}catch(a){}try{typeof _waitForImages=="function"&&await _waitForImages(n,1500)}catch(a){}const c=n.scrollHeight+32,o=n.scrollWidth,b="\uD3A8\uCF54\uD604\uD669\uD310_\uC804\uCCB4_"+new Date().toISOString().slice(0,10)+".png";try{if(console.log("[\uD3A8\uCF54] \uC774\uBBF8\uC9C0 \uC800\uC7A5 \uC2DC\uC791"),typeof window._captureAndSave!="function")throw new Error("\uC774\uBBF8\uC9C0 \uC800\uC7A5 \uAE30\uB2A5\uC744 \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.");await window._captureAndSave(n,o,c,b)}catch(a){console.error("[\uD3A8\uCF54\uD604\uD669 \uC774\uBBF8\uC9C0 \uC800\uC7A5 \uC2E4\uD328]",a),alert(`\u274C \uD3A8\uCF54\uC2A4\uD0C0\uC77C \uC774\uBBF8\uC9C0 \uC800\uC7A5 \uC2E4\uD328

`+(a.message||"\uC54C \uC218 \uC5C6\uB294 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4."))}finally{document.body.removeChild(n),t&&(t.disabled=!1,t.textContent="\u{1F4BE} \uC804\uCCB4 \uC800\uC7A5")}}function _b2UnivBlock(e,t,n,c=!1){var R;if(!e)return`<div style="border-radius:14px;border:2px dashed #ccc55;padding:16px 18px;background:#f5f5f5;display:flex;align-items:center;gap:10px;opacity:.7">
      <span style="font-weight:900;font-size:15px;color:#999;">[Unknown University]</span>
      <span style="font-size:11px;color:var(--gray-l)"> university name is undefined</span>
    </div>`;const o=univCfg.find(u=>u.name===e)||{},b=o.icon||o.img||UNIV_ICONS[e]||"",a=_b2ContrastColor(t),f=t+_b2AlphaHex(b2BgAlpha),g=t+_b2AlphaHex(b2LabelAlpha),x=!!o.bgImg,r="linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.94))",d=x?"rgba(255,255,255,.18)":"rgba(255,255,255,.55)",s=x?"linear-gradient(180deg,rgba(255,255,255,.00),rgba(248,250,252,.00))":r,m=x?"linear-gradient(180deg,rgba(255,255,255,.12),rgba(248,250,252,.04))":r,T=x?"rgba(255,255,255,.04)":d,k=x?"none":"0 10px 18px rgba(15,23,42,.04)";if(!n.length)return`<div style="border-radius:14px;border:2px dashed ${t}55;padding:16px 18px;background:${f};display:flex;align-items:center;gap:10px;opacity:.7">
      ${b?`<img src="${toHttpsUrl(b)}" style="width:var(--su_univ_logo_size,36px);height:var(--su_univ_logo_size,36px);object-fit:contain;border-radius:var(--su_univ_logo_radius,10px)" onerror="this.style.display='none'">`:""}
      <span style="font-weight:900;font-size:15px;color:${t};cursor:pointer" onclick="if(typeof openUnivModal==='function')openUnivModal('${e}')">${e}</span>
      <span style="font-size:11px;color:var(--gray-l)">\uB4F1\uB85D\uB41C \uC120\uC218 \uC5C6\uC74C</span>
    </div>`;const h=n.filter(u=>_B2_ROLE_ORDER.includes(u.role||""));h.sort((u,w)=>_b2RoleRank(u)-_b2RoleRank(w));const C=n.filter(u=>!_B2_ROLE_ORDER.includes(u.role||"")),M={};C.forEach(u=>{const w=u.tier||"?";M[w]||(M[w]=[]),M[w].push(u)});const l=TIERS.filter(u=>M[u]).concat(Object.keys(M).filter(u=>!TIERS.includes(u))),v=o.memo||"",i=(o.memoImgs||[]).concat(o.memoImg?[o.memoImg]:[]),$=!!(v||i.length),I=(u,w,B)=>`
    <div data-b2-univ-row="1" style="display:flex;align-items:stretch;gap:0;margin-bottom:8px">
      <div style="background:${g}!important;min-width:70px;width:70px;display:flex;align-items:center;justify-content:center;padding:10px 6px;flex-shrink:0;border-radius:16px 0 0 16px;border:1px solid ${t}33;border-right:none;box-shadow:inset 0 1px 0 rgba(255,255,255,.28)">
        <span style="font-size:11px;font-weight:900;color:${t};text-align:center;line-height:1.35;word-break:keep-all;letter-spacing:-.01em">${u}</span>
      </div>
      <div style="flex:1;background:${s};padding:10px 12px;border-radius:0 16px 16px 0;border:1px solid ${T};box-shadow:${k}">
        ${B}
      </div>
    </div>`,A={},P=[];h.forEach(u=>{const w=u.role||"";A[w]||(A[w]=[],P.push(w)),A[w].push(u)});const H=o.bgImgPos||"center center",_=o.bgImgSize||"auto",L=((R=o.bgImgAlpha)!=null?R:b2BgImgAlpha)/100,j=(x?Math.max(.64,L+.08):L).toFixed(2),E=String(e||"").trim(),q=E.toUpperCase(),N=(()=>{const u={wmGlobalOn:1,wmOn:1,wmScale:150,wmRight:120,wmBottom:30,bgScale:100};try{const w=String(localStorage.getItem("su_b2_univ_logo_overlay_v1")||"").trim(),B=w?JSON.parse(w)||{}:{},V=B&&B.default&&typeof B.default=="object"?B.default:{},G=B&&B.perUniv&&typeof B.perUniv=="object"?B.perUniv:{},Z=E&&G&&G[E]&&typeof G[E]=="object"?G[E]:{},F=Object.assign({},u,V,Z);return F.wmGlobalOn=F.wmGlobalOn==null||Number(F.wmGlobalOn)?1:0,F.wmOn=F.wmOn==null||Number(F.wmOn)?1:0,F.wmScale=Math.max(50,Math.min(250,parseInt(F.wmScale||150,10)||150)),F.wmRight=Math.max(0,Math.min(260,parseInt(F.wmRight||120,10)||120)),F.wmBottom=Math.max(0,Math.min(160,parseInt(F.wmBottom||30,10)||30)),F.bgScale=Math.max(60,Math.min(120,parseInt(F.bgScale||100,10)||100)),F}catch(w){return u}})(),K=["\uB287\uCE90\uC2AC","\uB274\uCEA3\uC2AC","\uCE84\uBAAC\uC2A4\uD0C0\uC988","\uCF00\uC774\uB300","\uC5E0\uBE44\uB300","\uC640\uD50C\uB300","\uC218\uC220\uB300","\uD751\uCE74\uB370\uBBF8"],me=E.includes("\uBAAC\uC2A4\uD0C0")||q.includes("MONSTAR"),ne=q==="HM"||q==="DM"||q==="SSG"||q==="JSA"||q==="BGM"||K.includes(E)||me,re="44% 50%",ae=(()=>{const u=q==="JSA"||q==="BGM"||K.includes(E)||me;return q==="JSA"||E==="\uD751\uCE74\uB370\uBBF8"?"min(72%,620px) auto":E==="\uC218\uC220\uB300"||E==="\uC5E0\uBE44\uB300"||E==="\uCF00\uC774\uB300"?"min(84%,740px) auto":u?"min(78%,680px) auto":"min(86%,760px) auto"})(),ve=(()=>{const u=(N.bgScale||100)/100;if(u===1)return ae;const w=String(ae||"").match(/min\(\s*(\d+)\s*%\s*,\s*(\d+)\s*px\s*\)/i);if(!w)return ae;const B=Math.max(10,Math.min(100,Math.round(parseInt(w[1],10)*u))),V=Math.max(80,Math.min(1200,Math.round(parseInt(w[2],10)*u)));return`min(${B}%,${V}px) auto`})(),oe=ne?String(Math.min(.48,parseFloat(j)||.48).toFixed(2)):j,Q=_b2GetUnivProfileViewMode(),he=o.bgImg?c?ne?`<img src="${o.bgImg}" crossorigin="anonymous" style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:${ve.replace(" auto","")};max-width:760px;max-height:78%;height:auto;object-fit:contain;object-position:${re};opacity:${oe};pointer-events:none;z-index:0" onerror="this.style.display='none'">`:`<img src="${o.bgImg}" crossorigin="anonymous" class="b2-fit-auto" data-fit-kind="bg" data-fit-mode="${_}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:${_==="auto"?"cover":_};object-position:${H};opacity:${oe};pointer-events:none;z-index:0" onload="_b2ApplyBgAutoSizing(this)">`:ne?`<div class="b2-bg-layer" data-bg-src="${String(o.bgImg).replace(/"/g,"&quot;")}" data-bg-pos="${re}" style="position:absolute;inset:0;opacity:${oe};pointer-events:none;z-index:0;background-position:${re};background-size:${ve};background-repeat:no-repeat"></div>`:`<div class="b2-bg-layer" data-bg-src="${String(o.bgImg).replace(/"/g,"&quot;")}" data-bg-pos="${String(H).replace(/"/g,"&quot;")}" data-bg-size-mode="${_}" style="position:absolute;inset:0;opacity:${oe};pointer-events:none;z-index:0;background-position:${H};background-size:${_==="auto"?"cover":_};background-repeat:no-repeat"></div>`:"";let se="",ee=!1;P.forEach(u=>{const w=A[u],B=_b2RenderUnivGroupCards(w,t,!0,Q,Q==="table"&&ee);Q==="table"&&w.length&&(ee=!0),se+=I(u,!0,B)}),l.forEach(u=>{const w=M[u];w.sort((V,G)=>(V.name||"").localeCompare(G.name||"","ko",{sensitivity:"base"}));const B=_b2RenderUnivGroupCards(w,t,!1,Q,Q==="table"&&ee);Q==="table"&&w.length&&(ee=!0),se+=I(u,!1,B)});const ze=$?`<div style="margin-top:10px;background:${m};padding:12px;box-sizing:border-box;overflow:hidden;border-radius:18px;border:1px solid ${d};box-shadow:0 14px 26px rgba(15,23,42,.06)">
    <div style="font-size:11px;font-weight:900;color:${t};margin-bottom:${i.length||v?"10px":"0"}">\uC0AC\uC774\uB4DC \uBA54\uBAA8</div>
    ${i.map((u,w)=>`<img src="${u}" style="width:100%;max-width:260px;border-radius:12px;${w<i.length-1||v?"margin-bottom:8px;":""}display:block;object-fit:contain;border:1px solid rgba(148,163,184,.14);background:#fff" onerror="this.style.display='none'">`).join("")}
    ${v?`<div style="font-size:11px;color:#334155;white-space:pre-wrap;line-height:1.65;margin-top:${i.length?"8px":"0"}">${v}</div>`:""}
  </div>`:"",W=(()=>{const u=String(e||"").trim(),w=u.toUpperCase();return w==="HM"||w==="DM"||w==="SSG"?{pct:20,max:148,op1:".34",op0:".24"}:w==="JSA"||u==="\uD751\uCE74\uB370\uBBF8"?{pct:22,max:160,op1:".36",op0:".26",right:66,bottom:28}:w==="JSA"||w==="BGM"||K.includes(u)||u.includes("\uBAAC\uC2A4\uD0C0")||w.includes("MONSTAR")?{pct:26,max:182,op1:".36",op0:".26",right:46,bottom:28}:{pct:22,max:160,op1:".36",op0:".26"}})(),le=(N.wmScale||100)/100,ye=Math.max(6,Math.min(60,Math.round(W.pct*le))),de=Math.max(60,Math.min(520,Math.round(W.max*le))),Me=typeof W.right=="number"?W.right:18,Ie=typeof W.bottom=="number"?W.bottom:22,ce=typeof N.wmRight=="number"?N.wmRight:Me,we=typeof N.wmBottom=="number"?N.wmBottom:Ie,$e=Math.round(de*.7),_e=(N.wmGlobalOn==null?!0:!!Number(N.wmGlobalOn))&&(N.wmOn==null?!0:!!Number(N.wmOn)),Se=`<div class="b2-bg-host" style="position:relative;overflow:hidden;background:${x?"transparent":"linear-gradient(180deg,rgba(255,255,255,.92),rgba(248,250,252,.82))"}">
    ${he}
    ${_e&&b?`<img src="${toHttpsUrl(b)}" aria-hidden="true" style="position:absolute;right:${ce}px;bottom:${we}px;width:min(${ye}%,${de}px);max-width:${de}px;max-height:${$e}px;opacity:${x?W.op1:W.op0};object-fit:contain;pointer-events:none;z-index:0;filter:drop-shadow(0 12px 28px rgba(15,23,42,.18))" onerror="this.style.display='none'">`:""}
    <div data-b2-univ-content="1" style="position:relative;z-index:1;padding:16px 20px 22px 16px;background:transparent">
      <div>${se}</div>
      ${ze}
    </div>
  </div>`,pe=String(o.createdAt||o.created||o.createDate||o.since||o.startDate||"").trim(),y=(()=>{if(!pe)return"";const u=String(pe).trim();let w=u.match(/^(\d{4})[.\-\/](\d{2})[.\-\/](\d{2})/);return w||(w=u.match(/^(\d{4})(\d{2})(\d{2})/)),w?`${w[1]}.${w[2]}.${w[3]}`:u.slice(0,10)})(),p=o.bMemo||"",S=(o.bMemoImgs||[]).concat(o.bMemoImg?[o.bMemoImg]:[]),z=S.map(u=>`<img class="b2-bottom-img" src="${u}" style="border-radius:12px;display:inline-block;border:1px solid rgba(148,163,184,.14);background:#fff" onerror="this.style.display='none'">`).join(""),U=p||S.length?`<div style="padding:14px 16px 16px;background:${x?"linear-gradient(180deg,rgba(255,255,255,.28),rgba(248,250,252,.14))":"linear-gradient(180deg,rgba(255,255,255,.92),rgba(248,250,252,.86))"};border-top:1px solid rgba(148,163,184,.16)">
    <div style="font-size:11px;font-weight:900;color:${t};margin-bottom:${z||p?"10px":"0"}">\uD558\uB2E8 \uBA54\uBAA8</div>
    ${z?`<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:${p?"8px":"0"}">${z}</div>`:""}
    ${p?`<div style="font-size:12px;color:#334155;white-space:pre-wrap;line-height:1.7">${p}</div>`:""}
  </div>`:"";return`
    <div data-b2card="${e.replace(/"/g,"&quot;")}" style="border-radius:22px;overflow:hidden;border:1px solid rgba(148,163,184,.16);background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.96));box-shadow:0 18px 32px rgba(15,23,42,.06)">
      <div style="background:linear-gradient(135deg,${t} 0%,${t}dd 100%);padding:16px 16px 14px;position:relative;overflow:hidden">
        <div style="position:absolute;inset:0;background:linear-gradient(145deg,rgba(255,255,255,${x?".08":".18"}),rgba(255,255,255,0) 58%);pointer-events:none"></div>
        <div style="display:flex;align-items:stretch;gap:12px;position:relative;z-index:1">
          ${b?`<img src="${toHttpsUrl(b)}" style="width:clamp(56px,var(--su_univ_logo_size,64px),76px);height:clamp(56px,var(--su_univ_logo_size,64px),76px);object-fit:contain;border-radius:var(--su_univ_logo_radius,16px);flex-shrink:0;cursor:pointer;background:rgba(255,255,255,.22);border:1px solid rgba(255,255,255,.28);padding:6px;box-shadow:0 14px 26px rgba(15,23,42,.12)" onclick="if(typeof openUnivModal==='function')openUnivModal('${e}')" onerror="this.style.display='none'">`:""}
          <div style="min-width:0;flex:1;display:flex;flex-direction:column;gap:7px">
            <div style="display:flex;align-items:flex-start;gap:10px;justify-content:space-between;flex-wrap:wrap">
              <div style="min-width:0;flex:1">
                <div style="display:flex;align-items:center;gap:8px;flex-wrap:nowrap;min-width:0">
                  <span style="font-weight:950;font-size:20px;color:${a};cursor:pointer;letter-spacing:-.03em;line-height:1.08;min-width:0;flex:0 1 auto;max-width:min(420px,62%);overflow:hidden;text-overflow:ellipsis;white-space:nowrap" onclick="if(typeof openUnivModal==='function')openUnivModal('${e}')">${e}</span>
                  <span style="display:inline-flex;align-items:center;gap:6px;flex-shrink:0;white-space:nowrap">
                    <span style="background:${a}1f;color:${a};font-size:11px;font-weight:800;padding:4px 9px;border-radius:999px;border:1px solid ${a}26;cursor:pointer;box-shadow:inset 0 1px 0 rgba(255,255,255,.06);white-space:nowrap" onclick="event.stopPropagation();openB2MemberBreakdown(this,'${e}')">${n.length}\uBA85</span>
                    ${y?`<span style="background:${a}18;color:${a};font-size:10px;font-weight:900;padding:4px 8px;border-radius:999px;border:1px solid ${a}22;box-shadow:inset 0 1px 0 rgba(255,255,255,.06);flex-shrink:0;white-space:nowrap">${y}</span>`:""}
                  </span>
                </div>
                ${o.memo2?`<div style="margin-top:5px;font-size:10px;font-weight:700;color:${a}dd;line-height:1.45;display:flex;align-items:center;gap:6px;flex-wrap:wrap">
                  <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:0 1 auto;max-width:48%;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.14);border-radius:999px;padding:3px 8px">${o.memo2}</span>
                </div>`:""}
              </div>
              <div style="display:flex;align-items:flex-start;gap:6px;flex-wrap:wrap;justify-content:flex-end">
                ${(o.championships||0)>0?`<span style="display:flex;gap:1px;flex-shrink:0;padding:5px 8px;border-radius:999px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.12)">${'<span style="font-size:15px">\u2B50</span>'.repeat(o.championships)}</span>`:""}
                ${isLoggedIn?`<button class="no-export" onclick="event.stopPropagation();_b2ToggleCard(this,'${e.replace(/'/g,"\\'")}')" style="background:${a}22;border:1px solid ${a}33;color:${a};font-size:11px;cursor:pointer;padding:4px 9px;border-radius:10px;flex-shrink:0;font-weight:800;z-index:var(--z-dropdown);position:relative;box-shadow:inset 0 1px 0 rgba(255,255,255,.08)" title="${_b2Collapsed.has(e)?"\uD3BC\uCE58\uAE30":"\uC811\uAE30"}">${_b2Collapsed.has(e)?"\u25B6 \uC811\uAE30 \uD574\uC81C":"\u25BC \uC811\uAE30"}</button>`:""}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="b2-card-body" style="${_b2Collapsed.has(e)?"display:none":""}">
        ${Se}
        ${U}
      </div>
    </div>`}function _b2FreeView(){const e=new Set((typeof univCfg!="undefined"?univCfg:[]).filter(_=>_.dissolved).map(_=>String(_.name||"").trim())),t=players.filter(_=>{const L=String((_==null?void 0:_.univ)||"").trim();return(!L||L==="\uBB34\uC18C\uC18D"||e.has(L))&&!_.hidden&&!_.retired&&!_.hideFromBoard});if(!t.length)return'<div style="text-align:center;color:var(--text3);padding:40px">\uBB34\uC18C\uC18D \uBA64\uBC84\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4</div>';const n=t.filter(_=>_B2_ROLE_ORDER.includes(_.role||""));n.sort((_,L)=>_b2RoleRank(_)-_b2RoleRank(L));const c=t.filter(_=>!_B2_ROLE_ORDER.includes(_.role||"")),o={};c.forEach(_=>{const L=_.tier||"?";o[L]||(o[L]=[]),o[L].push(_)});const b=TIERS.filter(_=>o[_]).concat(Object.keys(o).filter(_=>!TIERS.includes(_))),a=new Date,f=a.getDay(),g=new Date(a);g.setDate(a.getDate()+(f===0?-6:1-f));const x=parseInt(g.toISOString().slice(0,10).replace(/-/g,"")),r=parseInt(a.toISOString().slice(0,10).replace(/-/g,"")),d=_=>parseInt(String(_||"").replace(/[-\.]/g,""))||0;let s=0,m=0,T=0,k=0,h=0;c.forEach(_=>{let L=!1;(Array.isArray(_.history)?_.history:[]).forEach(j=>{j.result==="\uC2B9"?s++:j.result==="\uD328"&&m++;const E=d(j.date||j.d||"");E>=x&&E<=r&&(j.result==="\uC2B9"?T++:j.result==="\uD328"&&k++,L=!0)}),L&&h++});const C=s+m,M=C>0?Math.round(s/C*100):null,l=M===null?"#94a3b8":M>=60?"#10b981":M>=40?"#f59e0b":"#ef4444",v=T+k,i={P:0,T:0,Z:0,"?":0};c.forEach(_=>{const L=_.race||"?";i[L in i?L:"?"]++});const $=c.length||1,I="#64748b",A=_b2GetFreeViewMode(),P=(_,L)=>`
    <button type="button" class="no-export" onclick="_b2SetFreeViewMode('${_}')" style="padding:4px 11px;border-radius:999px;border:1px solid ${A===_?"rgba(255,255,255,.7)":"rgba(255,255,255,.22)"};background:${A===_?"rgba(255,255,255,.24)":"rgba(255,255,255,.08)"};color:#fff;font-size:10px;font-weight:900;cursor:pointer">${L}</button>`;let H=`<div style="border-radius:22px;overflow:hidden;border:1px solid rgba(148,163,184,.16);background:linear-gradient(180deg,rgba(255,255,255,.99),rgba(248,250,252,.96));box-shadow:0 18px 32px rgba(15,23,42,.06)">
    <div style="background:linear-gradient(135deg,${I} 0%,#475569 100%);padding:14px 16px 12px;position:relative;overflow:hidden">
      <div style="position:absolute;inset:0;background:linear-gradient(145deg,rgba(255,255,255,.14),rgba(255,255,255,0) 58%);pointer-events:none"></div>
      <div style="position:relative;z-index:1">
      <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
        <span style="font-weight:950;font-size:18px;color:#fff;letter-spacing:-.02em">\u{1F6B6} \uBB34\uC18C\uC18D</span>
        <span style="background:rgba(255,255,255,.18);color:#fff;font-size:11px;font-weight:800;padding:4px 9px;border-radius:999px;border:1px solid rgba(255,255,255,.15)">${t.length}\uBA85</span>
        ${h>0?`<span style="background:rgba(255,165,0,.35);color:#fef08a;font-size:10px;font-weight:900;padding:4px 8px;border-radius:999px;border:1px solid rgba(255,255,255,.12)">\u{1F525} \uC774\uBC88\uC8FC ${h}\uBA85</span>`:""}
        ${v>0?`<span style="background:rgba(0,0,0,.18);color:${T>=k?"#bbf7d0":"#fecaca"};font-size:10px;font-weight:900;padding:4px 8px;border-radius:999px;border:1px solid rgba(255,255,255,.12)">${T}\uC2B9${k}\uD328</span>`:""}
        ${M!==null?`<span style="background:rgba(0,0,0,.18);color:${l};font-size:10px;font-weight:900;padding:4px 8px;border-radius:999px;border:1px solid rgba(255,255,255,.12)" title="\uD1B5\uC0B0 ${s}\uC2B9 ${m}\uD328">\u{1F4CA} \uD1B5\uC0B0 ${M}%</span>`:""}
        <div style="margin-left:auto;display:flex;gap:4px;align-items:center">
          ${i.P?`<span style="font-size:10px;background:rgba(124,58,237,.4);color:#ede9fe;padding:4px 8px;border-radius:999px;font-weight:900;border:1px solid rgba(255,255,255,.12)">\u{1F52E}${i.P}</span>`:""}
          ${i.T?`<span style="font-size:10px;background:rgba(2,132,199,.4);color:#e0f2fe;padding:4px 8px;border-radius:999px;font-weight:900;border:1px solid rgba(255,255,255,.12)">\u2694\uFE0F${i.T}</span>`:""}
          ${i.Z?`<span style="font-size:10px;background:rgba(5,150,105,.4);color:#d1fae5;padding:4px 8px;border-radius:999px;font-weight:900;border:1px solid rgba(255,255,255,.12)">\u{1F98E}${i.Z}</span>`:""}
        </div>
      </div>
      <div style="display:flex;height:5px;border-radius:3px;overflow:hidden;margin-top:8px;background:rgba(255,255,255,.15)">
        ${i.P?`<div style="flex:${i.P};background:#7c3aed;opacity:.85"></div>`:""}
        ${i.T?`<div style="flex:${i.T};background:#0284c7;opacity:.85"></div>`:""}
        ${i.Z?`<div style="flex:${i.Z};background:#059669;opacity:.85"></div>`:""}
        ${i["?"]?`<div style="flex:${i["?"]};background:rgba(255,255,255,.2)"></div>`:""}
      </div>
      <div style="display:flex;align-items:center;gap:5px;flex-wrap:wrap;margin-top:10px;padding-top:10px;border-top:1px dashed rgba(255,255,255,.18)" class="no-export">
        <span style="font-size:10px;font-weight:800;color:rgba(255,255,255,.65);margin-right:2px">\u{1F5BC}\uFE0F \uBAA8\uB4DC</span>
        ${P("default","\uAE30\uBCF8")}
        ${P("stat","\u{1F4CA} \uD1B5\uACC4\uCE74\uB4DC")}
        ${P("table","\u{1F5C2}\uFE0F \uD14C\uC774\uBE14")}
      </div>
      </div>
    </div>
    <div style="background:linear-gradient(180deg,rgba(255,255,255,.96),rgba(248,250,252,.90));padding:16px">`;if(A==="stat"){const _=n.concat(b.flatMap(L=>o[L].slice().sort((j,E)=>(j.name||"").localeCompare(E.name||"","ko",{sensitivity:"base"}))));H+=`<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:14px">${_.map(L=>_b2LineupCard3(L,I)).join("")}</div>`}else if(A==="table"){const _=n.concat(b.flatMap(L=>o[L].slice().sort((j,E)=>(j.name||"").localeCompare(E.name||"","ko",{sensitivity:"base"}))));H+=_b2LineupTable(_,I)}else{const _=(j,E)=>`<div style="display:flex;align-items:stretch;gap:0;margin-bottom:8px">${j}<div style="flex:1;padding:10px 12px;background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.94));border:1px solid rgba(148,163,184,.14);border-left:none;border-radius:0 16px 16px 0;box-shadow:0 10px 18px rgba(15,23,42,.04)">${E}</div></div>`,L=(j,E)=>`<span style="font-size:12px;font-weight:900;color:${E?I:"var(--text3)"};width:68px;min-width:68px;text-align:center;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;background:#64748b${_b2AlphaHex(b2LabelAlpha)}!important;border:1px solid rgba(100,116,139,.28);border-right:none;border-radius:16px 0 0 16px;padding:8px 6px;box-shadow:inset 0 1px 0 rgba(255,255,255,.2)">${j}</span>`;n.forEach(j=>{H+=_(L(j.role||"",!0),_b2PlayerRow(j,I))}),b.forEach(j=>{const E=o[j];E.sort((N,K)=>(N.name||"").localeCompare(K.name||"","ko",{sensitivity:"base"}));const q=getTierBtnColor(j);H+=_(L(j,!1),`<div style="display:flex;flex-wrap:wrap;gap:5px;padding:2px 0">${E.map(N=>_b2NameTag(N,q,!1)).join("")}</div>`)})}return H+="</div></div>",H}function _b2GetFreeViewMode(){try{const e=String(localStorage.getItem("su_b2_free_view")||"").trim();return["default","stat","table"].includes(e)?e:"default"}catch(e){return"default"}}function _b2SetFreeViewMode(e){const t=["default","stat","table"].includes(String(e||""))?String(e):"default";try{localStorage.setItem("su_b2_free_view",t)}catch(n){}typeof render=="function"&&render()}function openB2MemberBreakdown(e,t){const n=document.getElementById("b2-mbp");if(n){const s=n._forEl;if(n.remove(),s===e)return}const c=gc(t),o=players.filter(s=>String((s==null?void 0:s.univ)||"").trim()===String(t||"").trim()&&!s.hidden&&!s.retired&&!s.hideFromBoard),b=o.filter(s=>_B2_ROLE_ORDER.includes(s.role||"")),a=o.filter(s=>!_B2_ROLE_ORDER.includes(s.role||"")),f={};a.forEach(s=>{const m=s.tier||"?";f[m]=(f[m]||0)+1});const g=TIERS.filter(s=>f[s]).concat(Object.keys(f).filter(s=>!TIERS.includes(s))),x=(s,m,T)=>`<div style="display:flex;justify-content:space-between;align-items:center;gap:16px;padding:2px 0">
    <span style="color:${T||"var(--text2)"};font-size:12px">${s}</span>
    <span style="font-weight:700;color:var(--text1);font-size:12px">${m}\uBA85</span></div>`,r=document.createElement("div");r.id="b2-mbp",r.style.cssText="position:fixed;z-index:var(--z-top);background:linear-gradient(180deg,rgba(255,255,255,.99),rgba(248,250,252,.96));border:1px solid rgba(148,163,184,.16);border-radius:18px;box-shadow:0 16px 38px rgba(15,23,42,.16);padding:14px 15px;min-width:220px;backdrop-filter:blur(12px)",r.innerHTML=`
    <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:10px">
      <div style="font-weight:900;font-size:14px;color:${c};letter-spacing:-.02em">${t} \uAD6C\uC131</div>
      <div style="font-size:11px;font-weight:900;color:var(--text3)">${o.length}\uBA85</div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-bottom:10px">
      <div style="padding:10px 11px;border-radius:14px;background:${c}12;border:1px solid ${c}22"><div style="font-size:10px;font-weight:900;color:var(--text3)">\uC9C1\uCC45\uC790</div><div style="margin-top:5px;font-size:18px;font-weight:1000;color:${c}">${b.length}</div></div>
      <div style="padding:10px 11px;border-radius:14px;background:${c}0a;border:1px solid ${c}18"><div style="font-size:10px;font-weight:900;color:var(--text3)">\uC77C\uBC18 \uC2A4\uD2B8\uB9AC\uBA38</div><div style="margin-top:5px;font-size:18px;font-weight:1000;color:var(--text1)">${a.length}</div></div>
    </div>
    ${x("\uC9C1\uCC45\uC790",b.length)}
    ${x("\uC77C\uBC18 \uC2A4\uD2B8\uB9AC\uBA38",a.length)}
    ${g.length?`<div style="border-top:1px solid var(--border2);margin:6px 0"></div>${g.map(s=>x(s,f[s],getTierBtnColor(s))).join("")}`:""}`,r._forEl=e,document.body.appendChild(r);const d=e.getBoundingClientRect();r.style.top=d.bottom+6+"px",r.style.left=d.left+"px",requestAnimationFrame(()=>{d.left+r.offsetWidth>window.innerWidth-8&&(r.style.left=d.right-r.offsetWidth+"px"),d.bottom+r.offsetHeight+6>window.innerHeight&&(r.style.top=d.top-r.offsetHeight-6+"px")}),setTimeout(()=>{function s(k){!r.contains(k.target)&&k.target!==e&&T()}function m(){T()}function T(){r.remove(),document.removeEventListener("click",s),window.removeEventListener("scroll",m,!0)}document.addEventListener("click",s),window.addEventListener("scroll",m,{capture:!0,once:!0})},0)}async function saveB2Img(){const e=_b2VisUnivs().filter(r=>r.name!=="\uBB34\uC18C\uC18D"),t=_b2SaveUniv==="\uC804\uCCB4"?e:e.filter(r=>r.name===_b2SaveUniv);if(!t.length){alert("\uC800\uC7A5\uD560 \uB300\uD559\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.");return}const n=document.querySelector('[onclick="saveB2Img()"]');n&&(n.disabled=!0,n.textContent="\u23F3...");const c=720,o=14,b=24,a=document.createElement("div");a.style.cssText=`position:fixed;left:-9999px;top:0;padding:${b}px;background:#f0f2f5;box-sizing:border-box;width:${c+b*2}px`,a.innerHTML=`<style>.b2-bottom-img{max-width:160px;max-height:130px;object-fit:contain;}</style>
    <div style="display:flex;flex-direction:column;gap:${o}px">
      ${t.map(r=>_b2UnivBlock(r.name,gc(r.name),players.filter(d=>String((d==null?void 0:d.univ)||"").trim()===String(r.name||"").trim()&&!d.hidden&&!d.retired&&!d.hideFromBoard),!0)).join("")}
    </div>`,document.body.appendChild(a),a.querySelectorAll(".no-export,.no-export-movebtns").forEach(r=>r.remove()),await new Promise(r=>setTimeout(r,100)),injectUnivIcons(a);const f=a.scrollHeight+32,g=a.scrollWidth,x=(_b2SaveUniv==="\uC804\uCCB4"?"\uB300\uD559\uBCC4\uD604\uD669\uD310_\uC804\uCCB4":`\uB300\uD559\uBCC4\uD604\uD669\uD310_${_b2SaveUniv}`)+"_"+new Date().toISOString().slice(0,10)+".png";try{if(typeof _captureAndSave!="function")throw new Error("\uC774\uBBF8\uC9C0 \uC800\uC7A5 \uAE30\uB2A5\uC744 \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.");await _captureAndSave(a,g,f,x)}catch(r){console.error("[\uD604\uD669\uD310 \uC774\uBBF8\uC9C0 \uC800\uC7A5 \uC2E4\uD328]",r),alert(`\u274C \uC774\uBBF8\uC9C0 \uC800\uC7A5 \uC2E4\uD328

`+(r.message||"\uC54C \uC218 \uC5C6\uB294 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4."))}finally{document.body.removeChild(a),n&&(n.disabled=!1,n.textContent="\u{1F4F7} \uC774\uBBF8\uC9C0\uC800\uC7A5")}}function _b2PastelBg(e,t){const{r:n,g:c,b:o}=typeof _hexToRgbObj=="function"?_hexToRgbObj(e):{r:100,g:116,b:139},b=typeof t=="number"?t:.1,a=f=>Math.round(255*(1-b)+f*b);return`rgb(${a(n)},${a(c)},${a(o)})`}function _b2GetUnivProfileViewMode(){try{const e=String(localStorage.getItem("su_b2_univ_profile_view")||"").trim();return e==="card"?"poster":e==="compact"||e==="media"||e==="board"||e==="split"?"rank":["default","poster","rank","glass","table"].includes(e)?e:"default"}catch(e){return"default"}}function _b2SetUnivProfileViewMode(e){const t=["default","poster","rank","glass","table"].includes(String(e||""))?String(e):"default";try{localStorage.setItem("su_b2_univ_profile_view",t)}catch(n){}typeof render=="function"&&render()}function _b2UnivRankRow(e,t,n,c){const o=(e.name||"").replace(/'/g,"\\'"),b=e.photo?toHttpsUrl(e.photo):"",a=e.race&&e.race!=="N"?e.race:"?",f={T:"#2563eb",P:"#d97706",Z:"#7c3aed"}[e.race]||"#475569",g=n&&(e.tier||e.role)||"",x=e.tier&&typeof getTierBtnColor=="function"?getTierBtnColor(e.tier):t,r=e.tier&&typeof getTierBtnTextColor=="function"&&getTierBtnTextColor(e.tier)||"#fff",d=Number(e.win||0),s=Number(e.loss||0),m=d+s,T=m?Math.round(d/m*100):null,k=T==null?"#94a3b8":T>=50?"#16a34a":"#dc2626",h=m?`${d}\uC2B9 ${s}\uD328`:"\uAE30\uB85D \uC5C6\uC74C";return`
    <div style="display:flex;align-items:center;gap:12px;padding:9px 14px;border-radius:16px;border:1px solid ${t}22;background:linear-gradient(120deg,${t}14 0%,${t}05 100%);box-shadow:0 6px 16px rgba(15,23,42,.06);cursor:pointer;transition:transform .16s ease,box-shadow .16s ease,border-color .16s ease"
      onclick="openPlayerModal('${o}')"
      onmouseenter="this.style.transform='translateX(3px)';this.style.boxShadow='0 10px 22px rgba(15,23,42,.14)';this.style.borderColor='${t}55'"
      onmouseleave="this.style.transform='';this.style.boxShadow='0 6px 16px rgba(15,23,42,.06)';this.style.borderColor='${t}22'">
      <div style="flex-shrink:0;width:20px;text-align:center;font-size:11px;font-weight:900;color:${t};opacity:.75">${c}</div>
      <div style="width:42px;height:42px;flex-shrink:0;border-radius:var(--su_profile_radius,50%);clip-path:var(--su_profile_clip,none);overflow:hidden;border:2px solid ${t}55;background:${t}22;box-shadow:0 4px 10px ${t}26">
        ${b?`<img src="${b}" crossorigin="anonymous" loading="lazy" decoding="async" style="width:100%;height:100%;object-fit:cover;object-position:top center" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><div style="display:none;align-items:center;justify-content:center;width:100%;height:100%;font-size:14px;font-weight:1000;color:${t}">${a}</div>`:`<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:14px;font-weight:1000;color:${t}">${a}</div>`}
      </div>
      <div style="min-width:0;flex:0 0 auto;width:112px">
        <div style="display:flex;align-items:center;gap:6px;min-width:0">
          <span style="font-size:13px;font-weight:950;color:var(--text1);letter-spacing:-.02em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;${e.inactive?"opacity:.6":""}">${e.name||""}</span>
        </div>
        <div style="display:flex;align-items:center;gap:5px;margin-top:3px;flex-wrap:wrap">
          ${e.race&&e.race!=="N"?`<span style="display:inline-flex;padding:1px 6px;border-radius:999px;background:${f};color:#fff;font-size:9px;font-weight:900">${e.race}</span>`:""}
          ${g?`<span style="display:inline-flex;padding:1px 6px;border-radius:999px;background:${x};color:${r};font-size:9px;font-weight:900">${g}</span>`:""}
        </div>
      </div>
      <div style="flex:1;min-width:100px;display:flex;flex-direction:column;gap:4px">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:6px">
          <span style="font-size:10px;font-weight:800;color:var(--text3);white-space:nowrap">${h}</span>
          <span style="font-size:11px;font-weight:950;color:${k};flex-shrink:0">${T==null?"-":T+"%"}</span>
        </div>
      </div>
    </div>`}function _b2UnivGlassCard(e,t,n){const c=(e.name||"").replace(/'/g,"\\'"),o=e.photo?toHttpsUrl(e.photo):"",b=e.race&&e.race!=="N"?e.race:"?",a={T:"#2563eb",P:"#d97706",Z:"#7c3aed"}[e.race]||"#475569",f=n&&(e.tier||e.role)||"",g=e.tier&&typeof getTierBtnColor=="function"?getTierBtnColor(e.tier):t,x=Number(e.win||0),r=Number(e.loss||0),d=x+r,s=d?Math.round(x/d*100):null,m=s==null?"#94a3b8":s>=50?"#16a34a":"#dc2626";return`
    <div style="width:150px;max-width:100%;border-radius:22px;overflow:hidden;cursor:pointer;background:rgba(255,255,255,.6);box-shadow:0 10px 22px rgba(15,23,42,.12);border:1px solid ${t}2e;transition:transform .18s,box-shadow .18s"
      onclick="openPlayerModal('${c}')"
      onmouseenter="this.style.transform='translateY(-4px)';this.style.boxShadow='0 16px 28px rgba(15,23,42,.2)'"
      onmouseleave="this.style.transform='';this.style.boxShadow='0 10px 22px rgba(15,23,42,.12)'">
      <div style="position:relative;width:100%;aspect-ratio:.86;overflow:hidden;background:linear-gradient(160deg,${t}40,${t}12)">
        ${o?`<img src="${o}" crossorigin="anonymous" loading="lazy" decoding="async" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><div style="display:none;position:absolute;inset:0;align-items:center;justify-content:center;font-size:34px;font-weight:1000;color:${t}">${b}</div>`:`<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:34px;font-weight:1000;color:${t}">${b}</div>`}
        ${e.race&&e.race!=="N"?`<div style="position:absolute;top:7px;right:7px;padding:2px 8px;border-radius:999px;background:${a}e6;color:#fff;font-size:10px;font-weight:900;box-shadow:0 2px 6px rgba(0,0,0,.22)">${e.race}</div>`:""}
        ${f?`<div style="position:absolute;top:7px;left:7px;padding:2px 8px;border-radius:999px;background:rgba(255,255,255,.85);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);color:${g};font-weight:900;font-size:10px;box-shadow:0 2px 6px rgba(0,0,0,.12)">${f}</div>`:""}
      </div>
      <div style="padding:9px 11px 10px;background:rgba(255,255,255,.7);backdrop-filter:blur(10px) saturate(1.3);-webkit-backdrop-filter:blur(10px) saturate(1.3);border-top:1px solid ${t}20">
        <div style="color:var(--text1);font-weight:950;font-size:13px;letter-spacing:-.02em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${e.name||""}</div>
        <div style="margin-top:6px;display:flex;align-items:center;justify-content:flex-end;gap:6px">
          <span style="font-size:11px;font-weight:900;color:${m};flex-shrink:0">${s==null?"-":s+"%"}</span>
        </div>
      </div>
    </div>`}function _b2UnivFrameCard(e,t,n){const c=(e.name||"").replace(/'/g,"\\'"),o=e.photo?toHttpsUrl(e.photo):"",b=e.race&&e.race!=="N"?e.race:"?",a={T:"#2563eb",P:"#d97706",Z:"#7c3aed"}[e.race]||"#475569",f=n&&(e.tier||e.role)||"",g=e.tier&&typeof getTierBtnColor=="function"?getTierBtnColor(e.tier):t,x=e.tier&&typeof getTierBtnTextColor=="function"&&getTierBtnTextColor(e.tier)||"#fff",r=Number(e.win||0),d=Number(e.loss||0),s=r+d,m=s?Math.round(r/s*100):null;return`
    <div style="width:150px;max-width:100%;border-radius:20px;overflow:hidden;cursor:pointer;border:3px solid ${t};box-shadow:0 10px 20px rgba(15,23,42,.14);transition:transform .16s,box-shadow .16s"
      onclick="openPlayerModal('${c}')"
      onmouseenter="this.style.transform='translateY(-3px)';this.style.boxShadow='0 14px 26px rgba(15,23,42,.22)'"
      onmouseleave="this.style.transform='';this.style.boxShadow='0 10px 20px rgba(15,23,42,.14)'">
      <div style="position:relative;width:100%;aspect-ratio:.86;overflow:hidden;background:linear-gradient(160deg,${t}45,${t}14)">
        ${o?`<img src="${o}" crossorigin="anonymous" loading="lazy" decoding="async" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><div style="display:none;position:absolute;inset:0;align-items:center;justify-content:center;font-size:34px;font-weight:1000;color:${t}">${b}</div>`:`<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:34px;font-weight:1000;color:${t}">${b}</div>`}
        ${f?`<div style="position:absolute;top:0;left:0;padding:3px 10px 3px 8px;border-radius:0 0 10px 0;background:${g};color:${x};font-weight:900;font-size:10px">${f}</div>`:""}
        ${e.race&&e.race!=="N"?`<div style="position:absolute;top:7px;right:7px;padding:2px 8px;border-radius:999px;background:${a}e6;color:#fff;font-size:10px;font-weight:900;box-shadow:0 2px 6px rgba(0,0,0,.22)">${e.race}</div>`:""}
      </div>
      <div style="padding:8px 10px 9px;background:${t};text-align:center">
        <div style="color:#fff;font-weight:950;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 1px 3px rgba(0,0,0,.22)">${e.name||""}</div>
        <div style="margin-top:4px;font-size:10px;font-weight:800;color:rgba(255,255,255,.92)">${s?`${r}\uC2B9 ${d}\uD328 \xB7 ${m}%`:"\uAE30\uB85D \uC5C6\uC74C"}</div>
      </div>
    </div>`}function _b2UnivPhotoCard(e,t,n){const c=(e.name||"").replace(/'/g,"\\'"),o=e.photo?toHttpsUrl(e.photo):"",b=e.race&&e.race!=="N"?e.race:"?",a="border-radius:var(--su_profile_radius,50%);clip-path:var(--su_profile_clip,none);",f=n&&(e.tier||e.role)||"",g=e.tier&&typeof getTierBtnColor=="function"?getTierBtnColor(e.tier):t,x=e.tier&&typeof getTierBtnTextColor=="function"&&getTierBtnTextColor(e.tier)||"#fff",r={T:"#2563eb",P:"#d97706",Z:"#7c3aed"}[e.race]||"#475569",d=o?`<img src="${o}" crossorigin="anonymous" loading="lazy" decoding="async" aria-hidden="true" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center;transform:scale(1.16);filter:blur(14px) saturate(1.08) brightness(.88);opacity:.88" onerror="this.style.display='none'">
       <div style="position:absolute;inset:0;background:linear-gradient(180deg,${t}24 0%,rgba(2,6,23,.12) 100%)"></div>`:`<div style="position:absolute;inset:0;background:linear-gradient(160deg,${t}44 0%,${t}18 100%)"></div>`,s=o?`<img src="${o}" crossorigin="anonymous" loading="lazy" decoding="async" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
       <div style="position:absolute;inset:0;display:none;align-items:center;justify-content:center;font-size:34px;font-weight:1000;color:${t};opacity:.78">${b}</div>`:`<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:34px;font-weight:1000;color:${t};opacity:.78">${b}</div>`;return`
    <div style="position:relative;width:122px;max-width:100%;aspect-ratio:.78;${a}overflow:hidden;border:1px solid rgba(255,255,255,.16);background:#0b1120;box-shadow:0 10px 20px rgba(15,23,42,.12);cursor:pointer;transition:transform .18s ease,box-shadow .18s ease" onclick="openPlayerModal('${c}')"
      onmouseenter="this.style.transform='translateY(-4px) scale(1.03)';this.style.boxShadow='0 16px 28px rgba(15,23,42,.24)'"
      onmouseleave="this.style.transform='';this.style.boxShadow='0 10px 20px rgba(15,23,42,.12)'">
      ${d}
      ${s}
      ${e.race&&e.race!=="N"?`<div style="position:absolute;top:8px;right:8px;padding:2px 8px;border-radius:999px;background:${r};color:#fff;font-size:10px;font-weight:900;z-index:2;box-shadow:0 2px 6px rgba(0,0,0,.26)">${e.race}</div>`:""}
      <div style="position:absolute;left:0;right:0;bottom:0;padding:9px 9px 10px;background:linear-gradient(180deg,rgba(2,6,23,0) 0%,rgba(2,6,23,.20) 30%,rgba(2,6,23,.62) 100%);z-index:2">
        ${f?`<div style="margin-bottom:3px"><span style="display:inline-flex;align-items:center;padding:2px 7px;border-radius:999px;background:${g};color:${x};font-size:10px;font-weight:900;line-height:1.4">${f}</span></div>`:""}
        <div style="color:#fff;font-size:12px;font-weight:950;letter-spacing:-.02em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 1px 4px rgba(0,0,0,.5)">${e.name||""}</div>
      </div>
    </div>`}function _b2UnivDefaultTag(e,t,n){const c=(e.name||"").replace(/'/g,"\\'"),o=e.crewName&&typeof _gcCrew=="function"&&_gcCrew(e.crewName)||"";return`
    <div style="display:flex;align-items:center;gap:8px;padding:4px 10px 4px 4px;border-radius:24px;cursor:pointer;transition:background .12s;white-space:nowrap;flex-shrink:0"
      onmouseover="this.style.background='${t}14'"
      onmouseout="this.style.background='transparent'">
      <div onclick="openPlayerModal('${c}')" style="display:flex;align-items:center;gap:8px;flex:1;min-width:0">
      ${_b2Avatar(e,o||t,58)}
      <span style="font-weight:800;font-size:20px;color:var(--text1);white-space:nowrap;${e.inactive?"opacity:.6":""}">${e.name||""}</span>
      ${e.race&&e.race!=="N"?`<span class="rbadge r${e.race}" style="font-size:11px;flex-shrink:0">${e.race}</span>`:""}
      ${n&&e.tier?`<span style="font-size:11px;font-weight:800;padding:2px 7px;border-radius:6px;background:${getTierBtnColor(e.tier)};color:${getTierBtnTextColor(e.tier)||"#fff"};flex-shrink:0">${e.tier}</span>`:""}
      ${e.inactive?'<span style="font-size:9px;background:#fff7ed;color:#9a3412;border-radius:4px;padding:1px 4px;font-weight:700;flex-shrink:0">\u23F8\uFE0F</span>':""}
      </div>
    </div>`}function _b2UnivHeatCard(e,t){const n=(e.name||"").replace(/'/g,"\\'"),c=e.photo?toHttpsUrl(e.photo):"",o=e.race&&e.race!=="N"?e.race:"?";return`<button type="button" title="${(e.name||"").replace(/"/g,"&quot;")}" onclick="openPlayerModal('${n}')" style="width:112px;height:112px;padding:0;border:none;border-radius:var(--su_profile_radius,50%);clip-path:var(--su_profile_clip,none);overflow:hidden;background:${t}22;box-shadow:0 8px 20px rgba(15,23,42,.09);cursor:pointer">
    ${c?`<img src="${c}" crossorigin="anonymous" loading="lazy" decoding="async" style="width:100%;height:100%;object-fit:cover;object-position:top center" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><span style="display:none;align-items:center;justify-content:center;width:100%;height:100%;font-size:32px;font-weight:1000;color:${t}">${o}</span>`:`<span style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:32px;font-weight:1000;color:${t}">${o}</span>`}
  </button>`}function _b2RenderUnivGroupCards(e,t,n,c,o){const b=Array.isArray(e)?e:[];return c==="poster"?`<div style="display:flex;flex-wrap:wrap;gap:14px">${b.map(a=>_b2UnivPhotoCard(a,t,n)).join("")}</div>`:c==="rank"?`<div style="display:flex;flex-direction:column;gap:8px">${b.slice().sort((f,g)=>{const x=Number(f.win||0),r=Number(f.loss||0),d=x+r,s=d?x/d:-1,m=Number(g.win||0),T=Number(g.loss||0),k=m+T,h=k?m/k:-1;return h!==s?h-s:m!==x?m-x:(f.name||"").localeCompare(g.name||"","ko",{sensitivity:"base"})}).map((f,g)=>_b2UnivRankRow(f,t,n,g+1)).join("")}</div>`:c==="glass"?`<div style="display:flex;flex-wrap:wrap;gap:14px">${b.map(a=>_b2UnivGlassCard(a,t,n)).join("")}</div>`:c==="table"?typeof _b2LineupTable=="function"?_b2LineupTable(b,t,"","",o):"":`<div style="display:grid;grid-template-columns:repeat(5,max-content);align-items:center;justify-content:start;column-gap:10px;row-gap:8px;max-width:100%;overflow-x:auto;overflow-y:hidden;padding-bottom:2px;scrollbar-width:thin">${b.map(a=>_b2UnivDefaultTag(a,t,n)).join("")}</div>`}(function(){if(typeof document=="undefined")return;const t=document.getElementById("b2-lineup-card3-style");t&&t.remove();const n=document.createElement("style");n.id="b2-lineup-card3-style",n.textContent=[".b2-lc3{position:relative;border-radius:18px;overflow:hidden;background:linear-gradient(165deg,var(--lc-col,#64748b)1f 0%,var(--lc-col,#64748b)08 34%,rgba(255,255,255,.98) 58%);box-shadow:0 4px 16px rgba(15,23,42,.16);cursor:pointer;transition:transform .18s ease,box-shadow .18s ease;border:1px solid var(--lc-col,#64748b)2e}",".b2-lc3:hover{transform:translateY(-4px) scale(1.035);box-shadow:0 16px 30px rgba(15,23,42,.22);z-index:2}",".b2-lc3-photo{position:relative;width:100%;aspect-ratio:.82;overflow:hidden;background:linear-gradient(160deg,var(--lc-col,#64748b)55 0%,var(--lc-col,#64748b)22 100%)}",".b2-lc3-photo img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center}",".b2-lc3-backdrop{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center;transform:scale(1.2);filter:blur(15px) saturate(1.1) brightness(.82)}",".b2-lc3-fallback{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:40px;font-weight:1000;color:#fff;opacity:.85}",".b2-lc3-overlay{position:absolute;left:0;right:0;bottom:0;z-index:2;padding:28px 12px 10px;text-align:left;background:linear-gradient(180deg,rgba(2,6,23,0) 0%,rgba(2,6,23,.30) 45%,rgba(2,6,23,.76) 100%)}",".b2-lc3-tierchip{display:inline-block;padding:2px 8px;border-radius:999px;font-size:10px;font-weight:900;color:#fff;line-height:1.6;margin-bottom:4px}",".b2-lc3-name{font-size:15px;font-weight:950;color:#fff;letter-spacing:-.02em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 1px 4px rgba(0,0,0,.5)}",".b2-lc3-sub{font-size:10px;font-weight:800;color:rgba(255,255,255,.82);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",".b2-lc3-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:9px 10px 10px}",".b2-lc3-box{border-radius:10px;padding:7px 4px;background:var(--lc-col,#64748b)14;text-align:center}",".b2-lc3-box-value{font-size:13px;font-weight:950;color:#0f172a}",".b2-lc3-box-label{font-size:10px;font-weight:800;color:#475569;margin-top:2px}"].join(""),document.head.appendChild(n)})();function _b2LineupCard3(e,t){const n=(e.name||"").replace(/'/g,"\\'"),c=e.race&&e.race!=="N"?e.race:"?",o=e.photo?toHttpsUrl(e.photo):"",b=Number(e.win||0),a=Number(e.loss||0),f=b+a,g=f?Math.round(b/f*100):null,x=g==null?"#0f172a":g>=50?"#16a34a":"#dc2626",r=typeof ELO_DEFAULT!="undefined"?ELO_DEFAULT:1200,d=Number(e.elo||r),s=d>=r?"#2563eb":"#dc2626",m=Number(e.points||0),T=e.tier&&typeof getTierBtnColor=="function"?getTierBtnColor(e.tier):t,k=e.tier&&typeof getTierBtnTextColor=="function"&&getTierBtnTextColor(e.tier)||"#fff";let h="";try{const l=[...typeof _tpHistAllForPlayer=="function"?_tpHistAllForPlayer(e):[]].sort((v,i)=>typeof _tpDateNum=="function"?_tpDateNum(i==null?void 0:i.date)-_tpDateNum(v==null?void 0:v.date):0);l[0]&&l[0].date&&(h=`\uCD5C\uADFC \uAE30\uB85D \xB7 ${l[0].date}`)}catch(M){}const C=[[f?`${b}\uC2B9 ${a}\uD328`:"\uAE30\uB85D \uC5C6\uC74C","\uC804\uC801","#0f172a"],[g==null?"-":`${g}%`,"\uC2B9\uB960",x],[pS(m),"\uD3EC\uC778\uD2B8","#0f172a"],[d,"ELO",s]];return`<div class="b2-lc3" style="--lc-col:${t}" onclick="openPlayerModal('${n}')">
    <div class="b2-lc3-photo">
      ${o?`<img class="b2-lc3-backdrop" src="${o}" crossorigin="anonymous" loading="lazy" decoding="async" aria-hidden="true" onerror="this.style.display='none'">
           <img src="${o}" crossorigin="anonymous" loading="lazy" decoding="async" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center;z-index:1" onerror="this.style.display='none';this.previousElementSibling.style.display='none';this.nextElementSibling.style.display='flex'">
           <div class="b2-lc3-fallback" style="display:none;z-index:1">${c}</div>`:`<div class="b2-lc3-fallback">${c}</div>`}
      <div class="b2-lc3-overlay">
        ${e.tier?`<div><span class="b2-lc3-tierchip" style="background:${T};color:${k}">${e.tier}</span></div>`:""}
        <div class="b2-lc3-name">${e.name||""}</div>
        ${e.role||h?`<div class="b2-lc3-sub">${e.role||""}${e.role&&h?" \xB7 ":""}${h}</div>`:""}
      </div>
    </div>
    <div class="b2-lc3-grid">
      ${C.map(([M,l,v])=>`<div class="b2-lc3-box"><div class="b2-lc3-box-value" style="color:${v}">${M}</div><div class="b2-lc3-box-label">${l}</div></div>`).join("")}
    </div>
  </div>`}(function(){if(typeof document=="undefined")return;const t=document.getElementById("b2-lineup-card4-style");t&&t.remove();const n=document.createElement("style");n.id="b2-lineup-card4-style",n.textContent=[".b2-lc4-wrap{width:100%;overflow-x:auto;border-radius:14px}",".b2-lc4{width:100%;border-collapse:separate;border-spacing:0;font-size:12px;min-width:520px}",".b2-lc4 thead th{position:sticky;top:0;text-align:left;padding:9px 12px;font-size:10px;font-weight:900;color:#64748b;text-transform:uppercase;letter-spacing:.05em;background:transparent!important;background-image:none!important;border-bottom:1px solid rgba(0,0,0,.08);white-space:nowrap}",".b2-lc4 thead th:first-child{border-radius:14px 0 0 0}",".b2-lc4 thead th:last-child{border-radius:0 14px 0 0;text-align:right}",".b2-lc4 tbody td{padding:7px 12px;border-bottom:1px solid rgba(0,0,0,.06);vertical-align:middle;background:transparent!important}",".b2-lc4 tbody tr:last-child td{border-bottom:none}",".b2-lc4 tbody tr:hover td{background:var(--lc-col,#64748b)16!important}",".b2-lc4 tbody tr{cursor:pointer;position:relative;transition:transform .18s cubic-bezier(.2,.8,.2,1),box-shadow .18s ease;transform-origin:center center}",".b2-lc4 tbody tr:hover{transform:scale(1.025);box-shadow:0 10px 22px rgba(15,23,42,.18);z-index:30}",".b2-lc4 tbody tr:hover td{background:var(--white,#fff)!important}",".b2-lc4-head{display:flex;align-items:center;gap:8px;padding:9px 12px}",".b2-lc4-head img{width:24px;height:24px;object-fit:contain;border-radius:6px;flex-shrink:0}",".b2-lc4-head span{font-size:12px;font-weight:900;color:#0f172a}",".b2-lc4-namecell{display:flex;align-items:center;gap:9px;min-width:120px}",".b2-lc4-avatar{position:relative;width:28px;height:28px;flex-shrink:0;border-radius:50%;overflow:hidden;border:1.5px solid var(--lc-col,#64748b)55;background:linear-gradient(160deg,var(--lc-col,#64748b)55,var(--lc-col,#64748b)22)}",".b2-lc4-avatar img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center}",".b2-lc4-fallback{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:1000;color:#fff}",".b2-lc4-name{font-weight:900;color:#0f172a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:130px}",".b2-lc4-chip{display:inline-flex;align-items:center;padding:1px 8px;border-radius:999px;font-size:10px;font-weight:900;color:#fff;line-height:1.6;white-space:nowrap}",".b2-lc4-wrcell{display:flex;align-items:center;justify-content:flex-end;gap:7px}",".b2-lc4-bartrack{width:44px;height:5px;border-radius:999px;background:var(--lc-col,#64748b)18;overflow:hidden}",".b2-lc4-barfill{height:100%;border-radius:999px}",".b2-lc4-wr{font-weight:950;width:32px;text-align:right}"].join(""),document.head.appendChild(n)})();function _b2LineupTableRow(e,t){const n=(e.name||"").replace(/'/g,"\\'"),c=e.race&&e.race!=="N"?e.race:"?",o=e.photo?toHttpsUrl(e.photo):"",b={T:"#2563eb",P:"#d97706",Z:"#7c3aed"}[e.race]||"#94a3b8",a=Number(e.win||0),f=Number(e.loss||0),g=a+f,x=g?Math.round(a/g*100):null,r=x==null?"#94a3b8":x>=50?"#16a34a":"#dc2626",d=e.tier&&typeof getTierBtnColor=="function"?getTierBtnColor(e.tier):t,s=e.tier&&typeof getTierBtnTextColor=="function"&&getTierBtnTextColor(e.tier)||"#fff";return`<tr onclick="openPlayerModal('${n}')">
    <td><div class="b2-lc4-namecell">
      <div class="b2-lc4-avatar">
        ${o?`<img src="${o}" crossorigin="anonymous" loading="lazy" decoding="async" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><div class="b2-lc4-fallback" style="display:none">${c}</div>`:`<div class="b2-lc4-fallback">${c}</div>`}
      </div>
      <span class="b2-lc4-name">${e.name||""}</span>
    </div></td>
    <td>${e.role||"\uC77C\uBC18"}</td>
    <td>${e.tier?`<span class="b2-lc4-chip" style="background:${d};color:${s}">${e.tier}</span>`:"\uBBF8\uC815"}</td>
    <td>${e.race&&e.race!=="N"?`<span class="b2-lc4-chip" style="background:${b}">${e.race}</span>`:"-"}</td>
    <td>${g?`${a}\uC2B9 ${f}\uD328`:"\uAE30\uB85D \uC5C6\uC74C"}</td>
    <td><div class="b2-lc4-wrcell">
      <span class="b2-lc4-wr" style="color:${r}">${x==null?"-":x+"%"}</span>
    </div></td>
  </tr>`}function _b2LineupTable(e,t,n,c,o){if(!e.length)return"";const b=n?`<div class="b2-lc4-head"><img src="${toHttpsUrl(n)}" alt="" onerror="this.style.display='none'"><span>${c||""}</span></div>`:"";return`<div class="b2-lc4-wrap" style="--lc-col:${t}">
    ${b}
    <table class="b2-lc4">
      ${o?"":"<thead><tr><th>\uC774\uB984</th><th>\uC5ED\uD560</th><th>\uD2F0\uC5B4</th><th>\uC885\uC871</th><th>\uC804\uC801</th><th>\uC2B9\uB960</th></tr></thead>"}
      <tbody>${e.map(a=>_b2LineupTableRow(a,t)).join("")}</tbody>
    </table>
  </div>`}function _b2LineupCard(e,t,n,c){const o=(e.name||"").replace(/'/g,"\\'"),b=e.race&&e.race!=="N"?e.race:"?",a=e.photo?toHttpsUrl(e.photo):"",f={T:"#2563eb",P:"#d97706",Z:"#7c3aed"}[e.race]||"#475569",g=n?e.role||"":e.tier||"",x=!n&&e.tier&&typeof getTierBtnColor=="function"?getTierBtnColor(e.tier):t,r=!n&&e.tier&&typeof getTierBtnTextColor=="function"&&getTierBtnTextColor(e.tier)||"#fff",d=a?`<img src="${a}" crossorigin="anonymous" loading="lazy" decoding="async" aria-hidden="true" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center;transform:scale(1.22);filter:blur(16px) saturate(1.15) brightness(.8);opacity:.85" onerror="this.style.display='none'">
       <div style="position:absolute;inset:0;background:linear-gradient(180deg,${t}33 0%,rgba(0,0,0,.18) 100%)"></div>`:`<div style="position:absolute;inset:0;background:linear-gradient(160deg,${t}44 0%,${t}1a 100%)"></div>`,s=a?`<img src="${a}" crossorigin="anonymous" loading="lazy" decoding="async" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
       <div style="position:absolute;inset:0;display:none;align-items:center;justify-content:center;flex-direction:column;gap:6px">
         <div style="font-size:56px;font-weight:900;color:${t};opacity:.7">${b}</div>
       </div>`:`<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:6px">
         <div style="font-size:56px;font-weight:900;color:${t};opacity:.7">${b}</div>
       </div>`,m=e.race&&e.race!=="N"?`<div style="position:absolute;top:10px;right:10px;padding:3px 10px;border-radius:999px;background:${f};color:#fff;font-size:12px;font-weight:800;box-shadow:0 2px 8px rgba(0,0,0,.32);z-index:2;letter-spacing:.02em">${e.race}</div>`:"",T=`
    <div style="position:absolute;bottom:0;left:0;right:0;z-index:2;padding:12px 14px 13px">
      ${g?`<div style="margin-bottom:4px"><span style="background:${x};color:${r};font-weight:900;font-size:13px;padding:2px 9px;border-radius:999px;white-space:nowrap;line-height:1.6;letter-spacing:-.01em">${g}</span></div>`:""}
      <div style="color:#fff;font-weight:900;font-size:19px;letter-spacing:-.02em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 1px 4px rgba(0,0,0,.5)">${e.name||""}</div>
    </div>`;return`
    <div style="position:relative;cursor:pointer;border-radius:16px;overflow:hidden;background:${_b2PastelBg(t,.1)};box-shadow:0 4px 16px rgba(15,23,42,.18);border:1px solid ${t}33;transition:transform .15s,box-shadow .15s" onclick="openPlayerModal('${o}')"
      onmouseenter="this.style.transform='translateY(-3px)';this.style.boxShadow='0 10px 26px rgba(15,23,42,.28)'"
      onmouseleave="this.style.transform='';this.style.boxShadow='0 4px 16px rgba(15,23,42,.18)'">
      <div style="position:relative;width:100%;aspect-ratio:3/4;overflow:hidden">
        ${d}
        ${s}
        ${m}
        ${T}
      </div>
    </div>`}function _b2LineupPoster(e,t,n=!1){if(!e)return'<div style="text-align:center;color:var(--text3);padding:40px">\uB300\uD559\uC744 \uC120\uD0DD\uD574\uC8FC\uC138\uC694</div>';const c=(typeof univCfg!="undefined"?univCfg.find(l=>l.name===e):null)||{},o=c.icon||c.img||UNIV_ICONS[e]||"",b=players.filter(l=>String((l==null?void 0:l.univ)||"").trim()===String(e||"").trim()&&!l.hidden&&!l.retired&&!l.hideFromBoard);if(!b.length)return`<div style="border-radius:18px;border:2px dashed ${t}55;padding:30px;background:${t}10;text-align:center;color:var(--text3)">\uB4F1\uB85D\uB41C \uC120\uC218\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4</div>`;const a=b.filter(l=>_B2_ROLE_ORDER.includes(l.role||""));a.sort((l,v)=>_b2RoleRank(l)-_b2RoleRank(v));const f=b.filter(l=>!_B2_ROLE_ORDER.includes(l.role||""));f.sort((l,v)=>{const i=TIERS.indexOf(l.tier||""),$=TIERS.indexOf(v.tier||""),I=i>=0?i:99,A=$>=0?$:99;return I!==A?I-A:(l.name||"").localeCompare(v.name||"","ko",{sensitivity:"base"})});const g=typeof _b2LineupCardMode!="undefined"?_b2LineupCardMode:"default",x=g==="stat"?_b2LineupCard3:null,d=g==="table"?"1fr":`repeat(auto-fill,minmax(${g==="stat"?190:170}px,1fr))`,s=g==="table"?0:16,m=g==="table"?_b2LineupTable(a,t,o,e):a.map(l=>x?x(l,t):_b2LineupCard(l,t,!0,o)).join(""),T=g==="table"?_b2LineupTable(f,t,a.length?"":o,e):f.map(l=>x?x(l,t):_b2LineupCard(l,t,!1,o)).join(""),k=new Date().toISOString().slice(0,10).replace(/-/g,"."),h={T:0,P:0,Z:0};f.forEach(l=>{h.hasOwnProperty(l.race)&&h[l.race]++});const M=[{k:"T",ico:"\u2694\uFE0F",col:"#2563eb"},{k:"P",ico:"\u{1F52E}",col:"#d97706"},{k:"Z",ico:"\u{1F98E}",col:"#7c3aed"}].filter(l=>h[l.k]>0).map(l=>`
    <span style="display:inline-flex;align-items:center;gap:4px;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.22);border-radius:999px;padding:5px 12px 5px 10px;color:#fff;font-size:12px;font-weight:800">
      <span style="font-size:12px">${l.ico}</span>${l.k} ${h[l.k]}
    </span>`).join("");return`
    <div data-b2lineup="${e.replace(/"/g,"&quot;")}" style="border-radius:24px;overflow:hidden;background:#0b1220;box-shadow:0 20px 40px rgba(15,23,42,.28)">
      <div style="padding:30px 30px 24px;position:relative;overflow:hidden;background:linear-gradient(135deg,${t} 0%,${t}cc 65%,#0b1220 130%)">
        <div style="position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,.14),transparent 58%);pointer-events:none"></div>
        ${o?`<img src="${toHttpsUrl(o)}" aria-hidden="true" style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);max-height:84%;max-width:160px;width:auto;height:auto;opacity:.20;object-fit:contain;pointer-events:none;filter:drop-shadow(0 0 20px ${t})" onerror="this.style.display='none'">`:""}
        <div style="position:relative;z-index:1;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap">
          <div style="display:flex;align-items:center;gap:14px;min-width:0">
            ${o?`<img src="${toHttpsUrl(o)}" style="width:62px;height:62px;object-fit:contain;border-radius:16px;background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.26);padding:7px;flex-shrink:0;box-shadow:0 4px 14px rgba(0,0,0,.22)" onerror="this.style.display='none'">`:""}
            <div style="min-width:0">
              <div style="color:rgba(255,255,255,.64);font-size:12px;font-weight:800;letter-spacing:.10em;text-transform:uppercase">SDC MEMBER LINEUP</div>
              <div style="color:#fff;font-weight:950;font-size:32px;letter-spacing:-.03em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 2px 8px rgba(0,0,0,.18)">${e}</div>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:8px;flex-shrink:0">
            <span style="background:rgba(255,255,255,.16);color:#fff;font-size:13px;font-weight:800;padding:7px 16px;border-radius:999px;border:1px solid rgba(255,255,255,.24);backdrop-filter:blur(8px)">\uCD1D ${b.length}\uBA85</span>
            <span style="color:rgba(255,255,255,.55);font-size:12px;font-weight:700">${k}</span>
          </div>
        </div>
        ${M?`<div style="position:relative;z-index:1;display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:16px">${M}</div>`:""}
      </div>
      <div style="position:relative;overflow:hidden;background:linear-gradient(180deg,${_b2PastelBg(t,.26)} 0%,${_b2PastelBg(t,.18)} 100%);padding:26px 28px 32px">
        ${o?`<img src="${toHttpsUrl(o)}" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:58%;max-width:560px;opacity:.16;object-fit:contain;pointer-events:none;z-index:0" onerror="this.style.display='none'">`:""}
        <div style="position:relative;z-index:1">
          ${m?`
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
            <div style="width:3px;height:14px;border-radius:999px;background:${t};flex-shrink:0"></div>
            <div style="font-size:11px;font-weight:900;color:${t};letter-spacing:.06em;text-transform:uppercase">\uC9C1\uAE09\uC790</div>
          </div>
          <div style="display:grid;grid-template-columns:${d};gap:${s}px;margin-bottom:24px">${m}</div>
          ${g==="table"?"":`<div style="height:1px;background:linear-gradient(90deg,${t}44,transparent);margin-bottom:20px"></div>`}
          `:""}
          <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px;flex-wrap:wrap">
            <div style="display:flex;align-items:center;gap:8px">
              <div style="width:3px;height:14px;border-radius:999px;background:${t}99;flex-shrink:0"></div>
              <div style="font-size:11px;font-weight:900;color:${t};letter-spacing:.06em;text-transform:uppercase">\uBA64\uBC84</div>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:${d};gap:${s}px">${T}</div>
        </div>
      </div>
    </div>`}function _b2LineupView(){const e=_b2VisUnivs().filter(n=>n.name!=="\uBB34\uC18C\uC18D");if(!e.length)return'<div style="text-align:center;color:var(--text3);padding:40px">\uB4F1\uB85D\uB41C \uB300\uD559\uC774 \uC5C6\uC2B5\uB2C8\uB2E4</div>';(!_b2LineupUniv||!e.some(n=>n.name===_b2LineupUniv))&&(_b2LineupUniv=e[0].name);const t=gc(_b2LineupUniv);return`<div style="max-width:1360px;margin:0 auto">${_b2LineupPoster(_b2LineupUniv,t,!1)}</div>`}async function _b2CaptureBoardHtml({btnSelector:e,cardWidth:t,pad:n,innerHtml:c,heightPad:o,filename:b,errorLabel:a}){const f=document.querySelector(e);f&&(f.disabled=!0,f.textContent="\u23F3...");const g=document.createElement("div");g.style.cssText=`position:fixed;left:-9999px;top:0;padding:${n}px;background:#f0f2f5;box-sizing:border-box;width:${t+n*2}px`,g.innerHTML=c,document.body.appendChild(g),g.querySelectorAll(".no-export,.no-export-movebtns").forEach(d=>d.remove()),await new Promise(d=>setTimeout(d,100)),injectUnivIcons(g);const x=g.scrollHeight+o,r=g.scrollWidth;try{if(typeof _captureAndSave!="function")throw new Error("\uC774\uBBF8\uC9C0 \uC800\uC7A5 \uAE30\uB2A5\uC744 \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.");await _captureAndSave(g,r,x,b)}catch(d){console.error(`[${a} \uC774\uBBF8\uC9C0 \uC800\uC7A5 \uC2E4\uD328]`,d),alert(`\u274C \uC774\uBBF8\uC9C0 \uC800\uC7A5 \uC2E4\uD328

`+(d.message||"\uC54C \uC218 \uC5C6\uB294 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4."))}finally{document.body.removeChild(g),f&&(f.disabled=!1,f.textContent="\u{1F4F7} \uC774\uBBF8\uC9C0\uC800\uC7A5")}}async function saveB2LineupImg(){const e=_b2VisUnivs().filter(n=>n.name!=="\uBB34\uC18C\uC18D");if((!_b2LineupUniv||!e.some(n=>n.name===_b2LineupUniv))&&(_b2LineupUniv=e[0]?e[0].name:""),!_b2LineupUniv){alert("\uC800\uC7A5\uD560 \uB300\uD559\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.");return}const t=gc(_b2LineupUniv);await _b2CaptureBoardHtml({btnSelector:'[onclick="saveB2LineupImg()"]',cardWidth:1360,pad:0,innerHtml:_b2LineupPoster(_b2LineupUniv,t,!0),heightPad:8,filename:`\uB300\uD559\uB77C\uC778\uC5C5_${_b2LineupUniv}_`+new Date().toISOString().slice(0,10)+".png",errorLabel:"\uB77C\uC778\uC5C5"})}async function saveB2FreeImg(){await _b2CaptureBoardHtml({btnSelector:'[onclick="saveB2FreeImg()"]',cardWidth:720,pad:24,innerHtml:`<style>.b2-bottom-img{max-width:160px;max-height:130px;object-fit:contain;}</style>${_b2FreeView()}`,heightPad:32,filename:"\uBB34\uC18C\uC18D\uD604\uD669\uD310_"+new Date().toISOString().slice(0,10)+".png",errorLabel:"\uBB34\uC18C\uC18D \uD604\uD669\uD310"})}function _b2ContrastColor(e){try{const t=String(e||"").replace("#","").trim(),n=parseInt(t.slice(0,2),16),c=parseInt(t.slice(2,4),16),o=parseInt(t.slice(4,6),16);if([n,c,o].some(x=>Number.isNaN(x)))return"#ffffff";const b=x=>(x/=255,x<=.03928?x/12.92:Math.pow((x+.055)/1.055,2.4)),a=.2126*b(n)+.7152*b(c)+.0722*b(o),f=(1+.05)/(a+.05),g=(a+.05)/(.02+.05);return f>=g?"#ffffff":"#0f172a"}catch(t){return"#ffffff"}}localStorage.removeItem("su_b2SelectedPlayer"),(function(){const e=players.filter(c=>c&&!c.hidden&&!c.retired&&!c.hideFromBoard),t=e.filter(c=>c.photo||window.playerPhotos&&window.playerPhotos[c.name]),n=t.length?t:e;n.length&&(_b2SelectedPlayer=n[Math.floor(Math.random()*n.length)])})();

/* board2-players.js */
function _b2TierLabel(z){const t=String(z||"").trim();return t?t.endsWith("\uD2F0\uC5B4")?t:t+"\uD2F0\uC5B4":"?\uD2F0\uC5B4"}function _b2PlayersView(){var ne;const z=typeof univCfg!="undefined"?new Set((univCfg.filter(e=>e.dissolved)||[]).map(e=>e.name)):new Set,t=players.filter(e=>!e.hidden&&!e.retired&&!e.hideFromBoard&&!z.has(e.univ)),_=_b2PlayersUnivFilter==="\uC804\uCCB4"?t:t.filter(e=>String((e==null?void 0:e.univ)||"").trim()===String(_b2PlayersUnivFilter||"").trim()),b=_b2PlayersFilter==="all"?_:_.filter(e=>e.race===_b2PlayersFilter);let l=_b2PlayersTierFilter==="\uC804\uCCB4"?b.filter(e=>e.tier&&e.tier!=="?"&&e.tier!=="\uBBF8\uC815"&&e.tier!=="\uBBF8\uD655\uC778"):b.filter(e=>e.tier===_b2PlayersTierFilter);const{fromN:$,toN:u}=_b2ThisWeekRange(),S=_b2DateNum,C=e=>{let r=0,o=0;return(Array.isArray(e.history)?e.history:[]).forEach(s=>{const d=S(s.date||s.d||"");d>=$&&d<=u&&(s.result==="\uC2B9"?r++:s.result==="\uD328"&&o++)}),{w:r,l:o,total:r+o}};if(!l.length)return`<div style="text-align:center;padding:60px 20px;color:var(--gray-l)">
      <div style="font-size:48px;margin-bottom:12px">\u{1F464}</div>
      <div style="font-weight:700">\uD45C\uC2DC\uD560 \uC120\uC218\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4</div>
    </div>`;if(!_b2SelectedPlayer||!l.find(e=>e.name===_b2SelectedPlayer.name)){const e=l.filter(o=>o.photo||window.playerPhotos&&window.playerPhotos[o.name]),r=e.length?e:l;_b2SelectedPlayer=r[Math.floor(Math.random()*r.length)]}const M=[...new Set(t.map(e=>String((e==null?void 0:e.univ)||"").trim()).filter(e=>e&&e!=="\uBB34\uC18C\uC18D"))];typeof univCfg!="undefined"?M.sort((e,r)=>{const o=univCfg.findIndex(d=>d.name===e),s=univCfg.findIndex(d=>d.name===r);return(o>=0?o:999)-(s>=0?s:999)}):M.sort();const T=((ne=localStorage.getItem("su_b2_profile_shuffle"))!=null?ne:"1")==="1";if(T){const e=[_b2PlayersUnivFilter,_b2PlayersFilter,_b2PlayersTierFilter].join("|");if(window._b2ShuffleKey!==e||!Array.isArray(window._b2ShuffledNames)){for(let r=l.length-1;r>0;r--){const o=Math.floor(Math.random()*(r+1)),s=l[r];l[r]=l[o],l[o]=s}window._b2ShuffleKey=e,window._b2ShuffledNames=l.map(r=>r.name)}else{const r={};window._b2ShuffledNames.forEach((o,s)=>{r[o]=s}),l.sort((o,s)=>{var d,v;return((d=r[o.name])!=null?d:9999)-((v=r[s.name])!=null?v:9999)})}}else{const e=["\uC774\uC0AC\uC7A5","\uCD1D\uC7A5","\uAD50\uC218","\uCF54\uCE58"],r=["0","1","2","3","4","5","6","7","8","\uC720\uC2A4"];l.sort((o,s)=>{const d=e.indexOf(o.role||""),v=e.indexOf(s.role||""),j=d>=0,L=v>=0;if(j&&!L)return-1;if(!j&&L)return 1;if(j&&L&&d!==v)return d-v;const R=o.tier||"?",N=s.tier||"?",G=r.indexOf(R),O=r.indexOf(N);if(G>=0&&O>=0&&G!==O)return G-O;const J=parseInt(R)||999,ae=parseInt(N)||999;return J!==ae?J-ae:(o.name||"").localeCompare(s.name||"","ko",{sensitivity:"base"})})}const P=(e,r)=>{const o=parseInt(e.slice(1,3),16),s=parseInt(e.slice(3,5),16),d=parseInt(e.slice(5,7),16);return`rgba(${o},${s},${d},${r})`},F=gc(_b2SelectedPlayer.univ)||"#6366f1",x=(b2ProfileBgAlpha||10)/100,g={glow:P(F,.3),bg:P(F,x),border:F},m=JSON.parse(localStorage.getItem("su_b2_layout")||"{}"),B=m.autoResize!==!1,i=m.autoHeight!==!1,p=m.rightSize||m.leftSize||55,c=m.pcHeight||600,a=m.mobileHeight||320,W=m.tabletHeight||400,A=Math.min(Math.max(p+7,60),76),U=Math.min(Math.max(p+5,58),74),f=Math.min(Math.max(p+3,56),72),E=W+220;let I=`
    <style>
      .b2-players-wrapper {
        display: flex;
        gap: 24px;
        height: calc(100vh - 140px);
        min-height: ${c}px;
        align-items: stretch;
        padding: 0 0 16px 0;
      }
      .b2-players-main {
        flex: 0 0 ${f}%;
        position: relative;
        min-width: 0;
      }
      .b2-players-grid-wrapper { min-width: 0; }
      ${B?`
      @media (min-width: 1400px) {
        .b2-players-main {
          flex: 0 0 ${A}%;
        }
      }
      @media (min-width: 1200px) and (max-width: 1399px) {
        .b2-players-main {
          flex: 0 0 ${U}%;
        }
      }
      @media (min-width: 1025px) and (max-width: 1199px) {
        .b2-players-main {
          flex: 0 0 ${f}%;
        }
      }
      `:""}
      .b2-players-main-content {
        width: 100%;
        height: 100%;
        background: ${g.bg};
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
        border-radius: 16px;
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
        background: ${g.border};
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
        border-radius: 10px;
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
          min-height: ${E}px;
          height: ${i?`clamp(${E}px, 78vh, ${c+220}px)`:`${E}px`};
        }
        .b2-players-grid-wrapper {
          flex: none;
          min-height: 0;
          max-height: none;
        }
      }
      @media (max-width: 768px) {
        .b2-players-main {
          min-height: ${a}px;
          height: ${i?`clamp(${a}px, 52vh, ${a+160}px)`:`${a}px`};
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
          min-height: ${a}px;
          height: clamp(${a}px, 52vh, ${a+160}px);
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
  `;I+='<div class="b2-players-wrapper">';const n=_b2GetImgSettings(_b2SelectedPlayer.name,"primary"),h=_b2GetImgSettings(_b2SelectedPlayer.name,"secondary"),y=n,k=(_b2SelectedPlayer.name||"").replace(/\\/g,"\\\\").replace(/'/g,"\\'"),w=e=>!!String(e||"").trim(),D=w(_b2SelectedPlayer.photo),V=w(_b2SelectedPlayer.secondProfileFile),X=(e,r,o)=>{try{if(e===!1)return"center center";const s=Number(r),d=Number(o);if(!Number.isFinite(s)||!Number.isFinite(d))return"center center";const v=Math.max(0,Math.min(100,s)),j=Math.max(0,Math.min(100,d));return`${v}% ${j}%`}catch(s){return"center center"}},q=X(_b2SelectedPlayer.photo3PosUse,_b2SelectedPlayer.photo3PosX,_b2SelectedPlayer.photo3PosY),Y=X(_b2SelectedPlayer.photo4PosUse,_b2SelectedPlayer.photo4PosX,_b2SelectedPlayer.photo4PosY),ee=X(_b2SelectedPlayer.photo5PosUse,_b2SelectedPlayer.photo5PosX,_b2SelectedPlayer.photo5PosY);try{typeof prewarmImageUrls=="function"&&prewarmImageUrls([_b2SelectedPlayer.photo,_b2SelectedPlayer.secondProfileFile,...l.map(e=>e.photo).filter(Boolean)],24)}catch(e){}const K=e=>{const r=String(e||"").trim().toLowerCase().split("#")[0].split("?")[0];return r.endsWith(".mp4")||r.endsWith(".webm")||r.endsWith(".ogg")||r.endsWith(".mov")||r.endsWith(".m4v")},H=(e,r,o)=>{const s=String(r||"").trim();if(!s)return"";const d=toHttpsUrl(s),v=K(s),j=o&&o.z!=null?o.z:e,L=o&&o.opacity!=null?o.opacity:e===1?1:0,R=o&&o.style?o.style:"",N=o&&o.onLoadJs?String(o.onLoadJs):"",O=N?` ${N?v?"onloadedmetadata":"onload":""}="${N}"`:"",J=`class="b2-players-main-image" id="b2-main-img-${e}" style="position:absolute;inset:0;width:100%;height:100%;min-width:100%;min-height:100%;z-index:${j};opacity:${L};pointer-events:none;${R}"`;return v?`<video ${J} src="${d}" preload="metadata" muted playsinline${O}></video>`:`<img ${J} src="${d}" decoding="async" fetchpriority="high"${O}>`},Z=_b2SelectedPlayer.name.replace(/'/g,"\\'"),se=w(_b2SelectedPlayer.photo)?H(1,_b2SelectedPlayer.photo,{z:1,opacity:1,onLoadJs:`_b2ScheduleImageSwap('${Z}'); if(typeof _b2ApplyImgSettingsToDom==='function'){ _b2ApplyImgSettingsToDom('${Z}', 'primary'); }`,style:`object-fit:${n.fit||"cover"};object-position:center center;transform:${_b2GetImgTransform(n)};filter:brightness(${(n.brightness||100)/100});transition:opacity 0.4s ease;`}):`<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.05);font-size:64px;font-weight:900;color:rgba(255,255,255,0.2)">${(_b2SelectedPlayer.name||"?")[0]}</div>`,le=w(_b2SelectedPlayer.secondProfileFile)?H(2,_b2SelectedPlayer.secondProfileFile,{z:2,opacity:0,onLoadJs:`if(typeof _b2ApplyImgSettingsToDom==='function'){ _b2ApplyImgSettingsToDom('${Z}', 'secondary'); }`,style:`object-fit:${h.fit||"cover"};object-position:center center;transform:${_b2GetImgTransform(h)};filter:brightness(${(h.brightness||100)/100});transition:opacity 0.4s ease;`}):"",pe=w(_b2SelectedPlayer.profileFile3)?H(3,_b2SelectedPlayer.profileFile3,{z:3,opacity:0,style:`object-fit:cover;object-position:${q};transition:opacity 0.4s ease;`}):"",de=w(_b2SelectedPlayer.profileFile4)?H(4,_b2SelectedPlayer.profileFile4,{z:4,opacity:0,style:`object-fit:cover;object-position:${Y};transition:opacity 0.4s ease;`}):"",ce=w(_b2SelectedPlayer.profileFile5)?H(5,_b2SelectedPlayer.profileFile5,{z:5,opacity:0,style:`object-fit:cover;object-position:${ee};transition:opacity 0.4s ease;`}):"",te=(()=>{const e=univCfg.find(r=>r.name===_b2SelectedPlayer.univ)||{};return e.icon||e.img||UNIV_ICONS[_b2SelectedPlayer.univ]||""})();I+=`
    <div class="b2-players-main">
      <div class="b2-players-main-content" id="b2-players-main-box" style="--img-zoom:${y.zoom/100};--img-brightness:${y.brightness/100};--img-pos-x:${y.posX}px;--img-pos-y:${y.posY}px;">
        ${se}
        ${le}
        ${pe}
        ${de}
        ${ce}
        
        <!-- \uC774\uBBF8\uC9C0 \uCEE8\uD2B8\uB864 \uD328\uB110 - \uAD00\uB9AC\uC790(\uB85C\uADF8\uC778)\uB9CC \uB80C\uB354 [BUGFIX-IMG-SETTINGS] -->
        ${isLoggedIn?`<div class="b2-players-img-controls" id="b2-img-controls" style="display:none">
          <div class="b2-players-controls-title">\u{1F3A8} \uC774\uBBF8\uC9C0 \uC124\uC815</div>
          ${_b2BuildImageControlGroup(k,"primary","\uC774\uBBF8\uC9C0 1",D)}
          ${_b2BuildImageControlGroup(k,"secondary","\uC774\uBBF8\uC9C0 2",V)}
        </div>`:""}
        
        <!-- \uCEE8\uD2B8\uB864 \uD328\uB110 \uD1A0\uAE00 \uBC84\uD2BC - \uAD00\uB9AC\uC790(\uB85C\uADF8\uC778 \uC0AC\uC6A9\uC790)\uB9CC \uD45C\uC2DC [BUGFIX-IMG-SETTINGS] -->
        ${isLoggedIn?`<button onclick="document.getElementById('b2-img-controls').style.display=document.getElementById('b2-img-controls').style.display==='none'?'block':'none'" style="position:absolute;top:16px;right:16px;z-index:var(--z-fixed);padding:8px 12px;background:rgba(0,0,0,0.75);backdrop-filter:blur(10px);border-radius:8px;color:#fff;font-size:12px;font-weight:700;cursor:pointer;border:1px solid rgba(255,255,255,0.2)">\u2699\uFE0F \uC124\uC815</button>`:""}
        
        <div class="b2-players-info">
          <div class="b2-players-name">${_b2SelectedPlayer.name||"\uC774\uB984 \uC5C6\uC74C"}</div>
          <div class="b2-players-details">
            <span class="b2-players-tier">${_b2TierLabel(_b2SelectedPlayer.tier)}</span>
            ${_b2SelectedPlayer.race==="P"||_b2SelectedPlayer.race==="T"||_b2SelectedPlayer.race==="Z"?`<span class="rbadge r${_b2SelectedPlayer.race}" style="font-size:14px;padding:5px 12px;box-shadow:0 2px 8px rgba(0,0,0,.35)">${_b2SelectedPlayer.race}</span>`:'<span class="b2-players-chip b2-players-race">\uC885\uC871\uBBF8\uC815</span>'}
            ${_b2SelectedPlayer.univ?te?`<span class="b2-players-chip"><img src="${toHttpsUrl(te)}" onerror="this.style.display='none'"><span>${_b2SelectedPlayer.univ}</span></span>`:`<span class="b2-players-chip">\u{1F3EB} ${_b2SelectedPlayer.univ}</span>`:'<span class="b2-players-chip">\u{1F3EB} \uBB34\uC18C\uC18D</span>'}
          </div>
          ${isLoggedIn?`<button onclick="openB2ProfileEditModal('${_b2SelectedPlayer.name.replace(/'/g,"\\'")}')" style="margin-top:12px;padding:8px 16px;background:#fff;border:2px solid rgba(255,255,255,0.5);border-radius:20px;color:var(--text1);font-size:13px;font-weight:700;cursor:pointer;transition:all 0.3s ease;box-shadow:0 2px 8px rgba(0,0,0,0.2)" onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 12px rgba(0,0,0,0.3)'" onmouseout="this.style.transform='';this.style.boxShadow='0 2px 8px rgba(0,0,0,0.2)'">\u270F\uFE0F \uD504\uB85C\uD544 \uC218\uC815</button>`:""}
        </div>
      </div>
    </div>
  `;const ie=[String(_b2PlayersUnivFilter||""),String(_b2PlayersFilter||""),String(_b2PlayersTierFilter||""),T?"1":"0"].join("|");window._b2PlayersRenderKey!==ie&&(window._b2PlayersRenderKey=ie,window._b2PlayersRenderLimit=240);const be=Math.max(60,parseInt(window._b2PlayersRenderLimit||0,10)||240),ge=Math.min(l.length,be);let Q=l.slice();const oe=Q.slice(0,ge),re=Math.max(0,Q.length-oe.length);return I+=`
    <div class="b2-players-grid-wrapper">
      <div class="b2-players-grid">
  `,oe.forEach(e=>{const r=_b2SelectedPlayer&&_b2SelectedPlayer.name===e.name,o=encodeURIComponent(String(e.name||"")),s=gc(e.univ)||"#6366f1",d={bg:P(s,.1),border:s},v=typeof getTierBtnColor=="function"&&e.tier?getTierBtnColor(e.tier):"#64748b",j=typeof getTierBtnTextColor=="function"&&e.tier&&getTierBtnTextColor(e.tier)||"#fff",L=e.race==="P"||e.race==="T"||e.race==="Z"?e.race:"",R=(()=>{const N=univCfg.find(G=>G.name===e.univ)||{};return N.icon||N.img||UNIV_ICONS[e.univ]||""})();I+=`
      <div class="b2-players-card" data-player-name="${typeof escAttr=="function"?escAttr(e.name||""):String(e.name||"").replace(/"/g,"&quot;")}" data-player-key="${o}" onclick="_b2UpdateMainDisplay(decodeURIComponent(this.dataset.playerKey||''))" style="position:relative;cursor:pointer;border-radius:18px;overflow:hidden;aspect-ratio:3/4;background:${d.bg};border:1.5px solid ${v}66;isolation:isolate">
        ${e.photo?`<img src="${toHttpsUrl(e.photo)}" loading="lazy" decoding="async" alt="${e.name}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center;z-index:0" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
             <div style="position:absolute;inset:0;display:none;align-items:center;justify-content:center;background:${d.bg};font-size:44px;font-weight:900;color:${v};z-index:0">${(e.name||"?")[0]}</div>`:`<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:${d.bg};font-size:44px;font-weight:900;color:${v};z-index:0">${(e.name||"?")[0]}</div>`}
        ${e.tier?`<span style="position:absolute;top:8px;left:8px;z-index:2;font-size:10px;font-weight:900;padding:1px 6px;border-radius:999px;background:${v};color:${j};line-height:1.5;opacity:.8">${e.tier}</span>`:""}
        <div style="position:absolute;bottom:0;left:0;right:0;z-index:1;height:62%;background:linear-gradient(180deg, transparent 0%, rgba(0,0,0,.15) 35%, rgba(0,0,0,.75) 100%);pointer-events:none"></div>
        <div style="position:absolute;bottom:0;left:0;right:0;z-index:2;padding:9px 10px 10px">
          <div style="display:flex;align-items:center;gap:5px;overflow:hidden">
            ${L?`<span class="rbadge r${L}" style="flex-shrink:0;font-size:10px;padding:1px 6px;opacity:.8">${L}</span>`:""}
            <span style="color:rgba(255,255,255,.85);font-size:13px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:-.01em;text-shadow:0 2px 8px rgba(0,0,0,.75),0 1px 3px rgba(0,0,0,.9)">${e.name||""}</span>
          </div>
          <div style="display:flex;align-items:center;gap:5px;margin-top:3px;flex-wrap:nowrap;overflow:hidden">
            ${R?`<img src="${toHttpsUrl(R)}" onerror="this.style.display='none'" style="flex-shrink:0;width:16px;height:16px;object-fit:contain;opacity:.85;filter:drop-shadow(0 1px 3px rgba(0,0,0,.8))">`:""}
            <span style="font-size:10.5px;color:rgba(255,255,255,.75);font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-shadow:0 2px 8px rgba(0,0,0,.85),0 1px 3px rgba(0,0,0,.95)">${e.univ||"\uBB34\uC18C\uC18D"}</span>
          </div>
        </div>
      </div>
    `}),I+=`
      </div>
      ${re>0?`<div style="grid-column:1 / -1;display:flex;justify-content:center;padding:10px 0 16px">
        <button class="btn btn-w" onclick="window._b2PlayersRenderLimit=Math.min(${Q.length},(parseInt(window._b2PlayersRenderLimit||0,10)||0)+240);document.getElementById('b2-content').innerHTML=_b2PlayersView();setTimeout(()=>{if(_b2SelectedPlayer)_b2UpdateMainDisplay(_b2SelectedPlayer.name)},0)">\u25BC ${re}\uBA85 \uB354 \uBCF4\uAE30</button>
      </div>`:""}
    </div>
  `,I+="</div>",I}function _b2UpdateMainDisplay(z){const t=players.find(n=>n.name===z);if(!t)return;try{typeof prewarmImageUrls=="function"&&prewarmImageUrls([t.photo,t.secondProfileFile],4)}catch(n){}_b2SelectedPlayer=t;const _=(n,h)=>{const y=parseInt(n.slice(1,3),16),k=parseInt(n.slice(3,5),16),w=parseInt(n.slice(5,7),16);return`rgba(${y},${k},${w},${h})`},b=gc(t.univ)||"#6366f1",l=(b2ProfileBgAlpha||10)/100,$={glow:_(b,.3),bg:_(b,l),border:b},u=(n,h,y)=>{try{if(n===!1)return"center center";const k=Number(h),w=Number(y);if(!Number.isFinite(k)||!Number.isFinite(w))return"center center";const D=Math.max(0,Math.min(100,k)),V=Math.max(0,Math.min(100,w));return`${D}% ${V}%`}catch(k){return"center center"}},S=u(t.photo3PosUse,t.photo3PosX,t.photo3PosY),C=u(t.photo4PosUse,t.photo4PosX,t.photo4PosY),M=u(t.photo5PosUse,t.photo5PosX,t.photo5PosY),T=n=>{const h=String(n||"").trim().toLowerCase().split("#")[0].split("?")[0];return h.endsWith(".mp4")||h.endsWith(".webm")||h.endsWith(".ogg")||h.endsWith(".mov")||h.endsWith(".m4v")},P=(n,h,y)=>{const k=String(h||"").trim();if(!k)return"";const w=toHttpsUrl(k),D=T(k),V=y&&y.z!=null?y.z:n,X=y&&y.opacity!=null?y.opacity:n===1?1:0,q=y&&y.style?y.style:"",Y=y&&y.onLoadJs?String(y.onLoadJs):"",K=Y?` ${Y?D?"onloadedmetadata":"onload":""}="${Y}"`:"",H=`class="b2-players-main-image" id="b2-main-img-${n}" style="position:absolute;inset:0;width:100%;height:100%;min-width:100%;min-height:100%;z-index:${V};opacity:${X};pointer-events:none;${q}"`;return D?`<video ${H} src="${w}" preload="metadata" muted playsinline${K}></video>`:`<img ${H} src="${w}" decoding="async" fetchpriority="high"${K}>`},F=t.name.replace(/'/g,"\\'"),x=n=>!!String(n||"").trim(),g=x(t.photo)?P(1,t.photo,{z:1,opacity:1,onLoadJs:`_b2ScheduleImageSwap('${F}')`,style:"transition:opacity 0.4s ease;"}):`<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.05);font-size:64px;font-weight:900;color:rgba(255,255,255,0.2)">${(t.name||"?")[0]}</div>`,m=x(t.secondProfileFile)?P(2,t.secondProfileFile,{z:2,opacity:0,style:"object-fit:cover;transition:opacity 0.4s ease;"}):"",B=x(t.profileFile3)?P(3,t.profileFile3,{z:3,opacity:0,style:`object-fit:cover;object-position:${S};transition:opacity 0.4s ease;`}):"",i=x(t.profileFile4)?P(4,t.profileFile4,{z:4,opacity:0,style:`object-fit:cover;object-position:${C};transition:opacity 0.4s ease;`}):"",p=x(t.profileFile5)?P(5,t.profileFile5,{z:5,opacity:0,style:`object-fit:cover;object-position:${M};transition:opacity 0.4s ease;`}):"",c=(()=>{const n=univCfg.find(h=>h.name===t.univ)||{};return n.icon||n.img||UNIV_ICONS[t.univ]||""})(),a=document.getElementById("b2-players-main-box"),W=_b2GetImgSettings(t.name,"primary"),A=_b2GetImgSettings(t.name,"secondary"),U=(t.name||"").replace(/\\/g,"\\\\").replace(/'/g,"\\'"),f=x(t.photo),E=x(t.secondProfileFile);if(a){_b2ClearSwapTimer(a),a.innerHTML=`
      ${g}
      ${m}
      ${B}
      ${i}
      ${p}
      
      <!-- \uC774\uBBF8\uC9C0 \uCEE8\uD2B8\uB864 \uD328\uB110 (\uBAA8\uB4E0 \uC0AC\uC6A9\uC790 \uC811\uADFC \uAC00\uB2A5) -->
      <!-- \uC774\uBBF8\uC9C0 \uCEE8\uD2B8\uB864 \uD328\uB110 - \uAD00\uB9AC\uC790(\uB85C\uADF8\uC778)\uB9CC \uB80C\uB354 [BUGFIX-IMG-SETTINGS] -->
      ${isLoggedIn?`<div class="b2-players-img-controls" id="b2-img-controls" style="display:none">
        <div class="b2-players-controls-title">\u{1F3A8} \uC774\uBBF8\uC9C0 \uC124\uC815</div>
        ${_b2BuildImageControlGroup(U,"primary","\uC774\uBBF8\uC9C0 1",f)}
        ${_b2BuildImageControlGroup(U,"secondary","\uC774\uBBF8\uC9C0 2",E)}
      </div>`:""}
      
      <!-- \uCEE8\uD2B8\uB864 \uD328\uB110 \uD1A0\uAE00 \uBC84\uD2BC - \uAD00\uB9AC\uC790(\uB85C\uADF8\uC778 \uC0AC\uC6A9\uC790)\uB9CC \uD45C\uC2DC [BUGFIX-IMG-SETTINGS] -->
      ${isLoggedIn?`<button onclick="document.getElementById('b2-img-controls').style.display=document.getElementById('b2-img-controls').style.display==='none'?'block':'none'" style="position:absolute;top:16px;right:16px;z-index:var(--z-fixed);padding:8px 12px;background:rgba(0,0,0,0.75);backdrop-filter:blur(10px);border-radius:8px;color:#fff;font-size:12px;font-weight:700;cursor:pointer;border:1px solid rgba(255,255,255,0.2)">\u2699\uFE0F \uC124\uC815</button>`:""}
      
      <div class="b2-players-info">
        <div class="b2-players-name">${t.name||"\uC774\uB984 \uC5C6\uC74C"}</div>
        <div class="b2-players-details">
          <span class="b2-players-tier" style="background:${$.border}">${_b2TierLabel(t.tier)}</span>
          ${t.race==="P"||t.race==="T"||t.race==="Z"?`<span class="rbadge r${t.race}" style="font-size:14px;padding:5px 12px;box-shadow:0 2px 8px rgba(0,0,0,.35)">${t.race}</span>`:'<span class="b2-players-chip b2-players-race">\uC885\uC871\uBBF8\uC815</span>'}
          ${t.univ?c?`<span class="b2-players-chip"><img src="${toHttpsUrl(c)}" onerror="this.style.display='none'"><span>${t.univ}</span></span>`:`<span class="b2-players-chip">\u{1F3EB} ${t.univ}</span>`:'<span class="b2-players-chip">\u{1F3EB} \uBB34\uC18C\uC18D</span>'}
        </div>
        ${isLoggedIn?`<button onclick="openB2ProfileEditModal('${t.name.replace(/'/g,"\\'")}')" style="margin-top:8px;padding:6px 12px;background:#fff;border:1px solid rgba(255,255,255,0.45);border-radius:12px;color:var(--text1);font-size:12px;font-weight:800;cursor:pointer;transition:all 0.15s ease" onmouseover="this.style.transform='translateY(-1px)'" onmouseout="this.style.transform=''">\u270F\uFE0F \uD504\uB85C\uD544 \uC218\uC815</button>`:""}
      </div>
    `,_b2ApplyImgSettingsToElement(document.getElementById("b2-main-img-1"),W),_b2ApplyImgSettingsToElement(document.getElementById("b2-main-img-2"),A);const n=document.getElementById("b2-main-img-1"),h=n&&n.tagName==="VIDEO";x(t.photo)?n&&!h&&n.complete&&_b2ScheduleImageSwap(t.name):_b2ScheduleImageSwap(t.name)}const I=String(z||"").trim();document.querySelectorAll(".b2-players-card").forEach(n=>{n.classList.remove("active")})}function openB2ProfileEditModal(z){const t=players.find(i=>i.name===z);if(!t)return;const _=i=>String(i||"").trim(),b=_(t.photo),l=_(t.secondProfileFile),$=_(t.profileFile3),u=_(t.profileFile4),S=_(t.profileFile5),C=[{slot:1,url:b},{slot:2,url:l},{slot:3,url:$},{slot:4,url:u},{slot:5,url:S}].filter(i=>!!i.url),M=(i,p)=>p===1?i===2?"photoDelay21":i===3?"photoDelay31":i===4?"photoDelay41":"photoDelay51":i===1?"photoDelay12":i===2?"photoDelay23":i===3?"photoDelay34":i===4?"photoDelay45":"",T=i=>{var c;const p=parseFloat((c=t==null?void 0:t[i])!=null?c:1);return isNaN(p)?1:Math.max(.2,Math.min(60,p))},P=i=>{const p=parseFloat(i);return isNaN(p)?1:Math.max(.2,Math.min(60,p))},F=C.length<2?'<div style="font-size:11px;color:var(--gray-l);line-height:1.65">\uB4F1\uB85D\uB41C \uC774\uBBF8\uC9C0\uAC00 1\uAC1C\uB77C \uC804\uD658 \uC2DC\uAC04 \uC124\uC815\uC774 \uD544\uC694\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.</div>':`<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px">${C.map((i,p)=>{const c=C[(p+1)%C.length],a=M(i.slot,c.slot);return a?`<div>
          <div style="font-size:11px;font-weight:800;color:var(--text3);margin-bottom:6px">${i.slot} \u2192 ${c.slot}</div>
          <input type="number" data-b2-delay-key="${a}" min="0.2" max="60" step="0.1" value="${T(a)}" style="width:100%;padding:8px 12px;border:1px solid var(--border2);border-radius:8px;font-size:13px">
        </div>`:""}).join("")}</div>`,x=document.createElement("div");x.id="b2-profile-edit-modal",x.style.cssText="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:var(--z-modal-5)",x.innerHTML=`
    <div style="background:var(--white);border-radius:16px;padding:24px;max-width:500px;width:90%;max-height:80vh;overflow-y:auto;box-shadow:0 10px 40px rgba(0,0,0,0.3)">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
        <h3 style="margin:0;font-size:18px;font-weight:800;color:var(--text1)">\u270F\uFE0F \uD504\uB85C\uD544 \uC218\uC815</h3>
        <button onclick="document.getElementById('b2-profile-edit-modal').remove()" style="background:none;border:none;font-size:20px;cursor:pointer;color:var(--gray-l)">\u2715</button>
      </div>
      <div style="margin-bottom:16px">
        <label style="font-size:13px;font-weight:700;color:var(--text2);display:block;margin-bottom:6px">\uC120\uC218 \uC774\uB984</label>
        <div style="font-size:14px;color:var(--text3);padding:8px 12px;background:var(--surface);border-radius:8px">${t.name}</div>
      </div>
      <div style="margin-bottom:16px">
        <label style="font-size:13px;font-weight:700;color:var(--text2);display:block;margin-bottom:6px">\uD504\uB85C\uD544 \uC774\uBBF8\uC9C0 1 (PC/\uAE30\uBCF8) <span style="font-size:10px;font-weight:400;color:var(--gray-l)">(\uC120\uD0DD \uC989\uC2DC \uD45C\uC2DC)</span></label>
        <div style="display:flex;gap:8px;align-items:center">
          <input type="text" id="b2-ed-photo" value="${b}" placeholder="https://... \uC774\uBBF8\uC9C0 URL \uC785\uB825" style="flex:1;padding:8px 12px;border:1px solid var(--border2);border-radius:8px;font-size:13px">
          <span id="b2-ed-photo-preview-wrap" style="position:relative;width:40px;height:40px;border-radius:var(--su_profile_radius,50%);overflow:hidden;flex-shrink:0;background:#e2e8f0;border:2px solid var(--border);display:${b&&!b.startsWith("data:")?"inline-block":"none"}">
            <img id="b2-ed-photo-preview" src="${b&&!b.startsWith("data:")?toHttpsUrl(b):""}" style="width:40px;height:40px;object-fit:cover;display:block" onerror="this.style.display='none'">
          </span>
        </div>
        <div id="b2-ed-photo-warn" style="font-size:10px;color:${b&&b.startsWith("data:")?"#dc2626":"var(--gray-l)"};margin-top:4px">${b&&b.startsWith("data:")?"\u274C base64 \uC774\uBBF8\uC9C0 \uC9C1\uC811 \uC785\uB825 \uBD88\uAC00 \u2014 imgur.com \uB4F1\uC5D0 \uC5C5\uB85C\uB4DC \uD6C4 URL \uC0AC\uC6A9":"\uC774\uBBF8\uC9C0 URL\uC744 \uBD99\uC5EC\uB123\uC73C\uBA74 \uD604\uD669\uD310 \uC120\uC218 \uCE74\uB4DC\uC5D0 \uD504\uB85C\uD544 \uC0AC\uC9C4\uC774 \uD45C\uC2DC\uB429\uB2C8\uB2E4."}</div>
      </div>
      <div style="margin-bottom:16px">
        <label style="font-size:13px;font-weight:700;color:var(--text2);display:block;margin-bottom:6px">\uD504\uB85C\uD544 \uC774\uBBF8\uC9C0 2 (\uBAA8\uBC14\uC77C/\uAD50\uCCB4\uC6A9) <span style="font-size:10px;font-weight:400;color:var(--gray-l)">(\uC124\uC815\uD55C \uC2DC\uAC04 \uD6C4 \uC790\uB3D9 \uAD50\uCCB4)</span></label>
        <div style="display:flex;gap:8px;align-items:center">
          <input type="text" id="b2-ed-second-profile" value="${l}" placeholder="https://... \uC774\uBBF8\uC9C0 URL \uC785\uB825" style="flex:1;padding:8px 12px;border:1px solid var(--border2);border-radius:8px;font-size:13px">
          <span id="b2-ed-photo2-preview-wrap" style="position:relative;width:40px;height:40px;border-radius:12px;overflow:hidden;flex-shrink:0;background:#e2e8f0;border:2px solid var(--border);display:${l&&!l.startsWith("data:")?"inline-flex":"none"};align-items:center;justify-content:center">
            <img id="b2-ed-photo2-preview" src="${l&&!l.startsWith("data:")?toHttpsUrl(l).replace(/\"/g,"&quot;"):""}" style="width:40px;height:40px;object-fit:cover;display:block" onerror="this.style.display='none'">
            <video id="b2-ed-photo2-preview-vid" src="" muted playsinline loop style="width:40px;height:40px;object-fit:cover;display:none"></video>
          </span>
        </div>
        <div style="font-size:10px;color:var(--gray-l);margin-top:4px">\uC2A4\uD2B8\uB9AC\uBA38 \uC120\uD0DD \uD6C4 \uC124\uC815\uD55C \uC2DC\uAC04 \uB4A4 \uC774 \uC774\uBBF8\uC9C0\uB85C \uC790\uB3D9 \uC804\uD658\uB429\uB2C8\uB2E4.</div>
      </div>
      <div style="margin-bottom:16px">
        <label style="font-size:13px;font-weight:700;color:var(--text2);display:block;margin-bottom:6px">\uD504\uB85C\uD544 \uC774\uBBF8\uC9C0 3 (\uC21C\uD658\uC6A9)</label>
        <div style="display:flex;gap:8px;align-items:center">
          <input type="text" id="b2-ed-photo3" value="${$}" placeholder="https://... (gif/mp4 \uAC00\uB2A5)" style="flex:1;padding:8px 12px;border:1px solid var(--border2);border-radius:8px;font-size:13px">
          <span id="b2-ed-photo3-preview-wrap" style="position:relative;width:40px;height:40px;border-radius:12px;overflow:hidden;flex-shrink:0;background:#e2e8f0;border:2px solid var(--border);display:${$&&!$.startsWith("data:")?"inline-flex":"none"};align-items:center;justify-content:center">
            <img id="b2-ed-photo3-preview" src="${$&&!$.startsWith("data:")?toHttpsUrl($).replace(/\"/g,"&quot;"):""}" style="width:40px;height:40px;object-fit:cover;display:block" onerror="this.style.display='none'">
            <video id="b2-ed-photo3-preview-vid" src="" muted playsinline loop style="width:40px;height:40px;object-fit:cover;display:none"></video>
          </span>
        </div>
      </div>
      <div style="margin-bottom:16px">
        <label style="font-size:13px;font-weight:700;color:var(--text2);display:block;margin-bottom:6px">\uD504\uB85C\uD544 \uC774\uBBF8\uC9C0 4 (\uC21C\uD658\uC6A9)</label>
        <div style="display:flex;gap:8px;align-items:center">
          <input type="text" id="b2-ed-photo4" value="${u}" placeholder="https://... (gif/mp4 \uAC00\uB2A5)" style="flex:1;padding:8px 12px;border:1px solid var(--border2);border-radius:8px;font-size:13px">
          <span id="b2-ed-photo4-preview-wrap" style="position:relative;width:40px;height:40px;border-radius:12px;overflow:hidden;flex-shrink:0;background:#e2e8f0;border:2px solid var(--border);display:${u&&!u.startsWith("data:")?"inline-flex":"none"};align-items:center;justify-content:center">
            <img id="b2-ed-photo4-preview" src="${u&&!u.startsWith("data:")?toHttpsUrl(u).replace(/\"/g,"&quot;"):""}" style="width:40px;height:40px;object-fit:cover;display:block" onerror="this.style.display='none'">
            <video id="b2-ed-photo4-preview-vid" src="" muted playsinline loop style="width:40px;height:40px;object-fit:cover;display:none"></video>
          </span>
        </div>
      </div>
      <div style="margin-bottom:16px">
        <label style="font-size:13px;font-weight:700;color:var(--text2);display:block;margin-bottom:6px">\uD504\uB85C\uD544 \uC774\uBBF8\uC9C0 5 (\uC21C\uD658\uC6A9)</label>
        <div style="display:flex;gap:8px;align-items:center">
          <input type="text" id="b2-ed-photo5" value="${S}" placeholder="https://... (gif/mp4 \uAC00\uB2A5)" style="flex:1;padding:8px 12px;border:1px solid var(--border2);border-radius:8px;font-size:13px">
          <span id="b2-ed-photo5-preview-wrap" style="position:relative;width:40px;height:40px;border-radius:12px;overflow:hidden;flex-shrink:0;background:#e2e8f0;border:2px solid var(--border);display:${S&&!S.startsWith("data:")?"inline-flex":"none"};align-items:center;justify-content:center">
            <img id="b2-ed-photo5-preview" src="${S&&!S.startsWith("data:")?toHttpsUrl(S).replace(/\"/g,"&quot;"):""}" style="width:40px;height:40px;object-fit:cover;display:block" onerror="this.style.display='none'">
            <video id="b2-ed-photo5-preview-vid" src="" muted playsinline loop style="width:40px;height:40px;object-fit:cover;display:none"></video>
          </span>
        </div>
        <div style="font-size:10px;color:var(--gray-l);margin-top:4px">\uC774\uBBF8\uC9C0\uBCC4 \uD0ED\uC5D0\uC11C 2\u21923\u21924\u21925(\u21921) \uC21C\uC11C\uB85C \uC804\uD658\uB429\uB2C8\uB2E4.</div>
      </div>
      <div style="margin-top:10px;margin-bottom:16px;padding:12px;background:rgba(37,99,235,.06);border:1px solid rgba(37,99,235,.18);border-radius:10px">
        <div style="font-size:13px;font-weight:800;color:var(--text2);margin-bottom:10px">\uC804\uD658 \uC2DC\uAC04(\uCD08)</div>
        ${F}
        <div style="font-size:10px;color:var(--gray-l);margin-top:10px">\u203B \uC2E4\uC81C \uC874\uC7AC\uD558\uB294 \uC774\uBBF8\uC9C0 \uC21C\uC11C\uB9CC \uC21C\uD658\uD569\uB2C8\uB2E4. mp4\uB294 \uB05D\uAE4C\uC9C0 \uC7AC\uC0DD \uD6C4 \uB2E4\uC74C \uC774\uBBF8\uC9C0\uB85C \uC774\uB3D9\uD569\uB2C8\uB2E4.</div>
      </div>
      <div style="display:flex;gap:8px;margin-top:20px">
        <button onclick="document.getElementById('b2-profile-edit-modal').remove()" style="flex:1;padding:10px 16px;background:var(--surface);border:1px solid var(--border2);border-radius:8px;color:var(--text2);font-size:13px;font-weight:600;cursor:pointer">\uCDE8\uC18C</button>
        <button onclick="saveB2Profile('${t.name.replace(/'/g,"\\'")}')" style="flex:1;padding:10px 16px;background:var(--blue);border:1px solid var(--blue);border-radius:8px;color:#fff;font-size:13px;font-weight:600;cursor:pointer">\uC800\uC7A5</button>
      </div>
    </div>
  `,document.body.appendChild(x);const g=i=>{const p=String(i||"").trim().toLowerCase().split("#")[0].split("?")[0];return p.endsWith(".mp4")||p.endsWith(".webm")||p.endsWith(".ogg")||p.endsWith(".mov")||p.endsWith(".m4v")},m=(i,p,c,a)=>{try{const W=document.getElementById(i),A=document.getElementById(p),U=document.getElementById(c),f=document.getElementById(a);if(!A||!U||!f)return;const E=String((W==null?void 0:W.value)||"").trim();if(!E||E.startsWith("data:")){A.style.display="none",U.style.display="none",f.style.display="none",U.removeAttribute("src"),f.removeAttribute("src");try{f.pause()}catch(n){}return}const I=toHttpsUrl(E);if(A.style.display="inline-flex",g(I)){U.style.display="none",f.style.display="block",f.src=I;try{f.currentTime=0}catch(n){}try{f.play&&f.play()}catch(n){}}else{f.style.display="none";try{f.pause()}catch(n){}f.removeAttribute("src"),U.style.display="block",U.src=I}}catch(W){}},B=document.getElementById("b2-ed-photo");B&&B.addEventListener("input",function(){const i=this.value.trim(),p=document.getElementById("b2-ed-photo-preview"),c=document.getElementById("b2-ed-photo-warn"),a=document.getElementById("b2-ed-photo-preview-wrap");i&&i.startsWith("data:")?(this.style.borderColor="#dc2626",c&&(c.style.color="#dc2626",c.textContent="\u274C base64 \uC774\uBBF8\uC9C0 \uC9C1\uC811 \uC785\uB825 \uBD88\uAC00 \u2014 imgur.com \uB4F1\uC5D0 \uC5C5\uB85C\uB4DC \uD6C4 URL \uC0AC\uC6A9")):(this.style.borderColor="",c&&(c.textContent="\uC774\uBBF8\uC9C0 URL\uC744 \uBD99\uC5EC\uB123\uC73C\uBA74 \uD604\uD669\uD310 \uC120\uC218 \uCE74\uB4DC\uC5D0 \uD504\uB85C\uD544 \uC0AC\uC9C4\uC774 \uD45C\uC2DC\uB429\uB2C8\uB2E4.",c.style.color="var(--gray-l)")),i&&!i.startsWith("data:")?(p.src=toHttpsUrl(i),p.style.display="block",a&&(a.style.display="inline-block")):a&&(a.style.display="none")}),["b2-ed-second-profile","b2-ed-photo3","b2-ed-photo4","b2-ed-photo5"].forEach((i,p)=>{const c=document.getElementById(i);if(!c)return;const a=[["b2-ed-photo2-preview-wrap","b2-ed-photo2-preview","b2-ed-photo2-preview-vid"],["b2-ed-photo3-preview-wrap","b2-ed-photo3-preview","b2-ed-photo3-preview-vid"],["b2-ed-photo4-preview-wrap","b2-ed-photo4-preview","b2-ed-photo4-preview-vid"],["b2-ed-photo5-preview-wrap","b2-ed-photo5-preview","b2-ed-photo5-preview-vid"]][p]||null;a&&(c.addEventListener("input",()=>m(i,a[0],a[1],a[2])),m(i,a[0],a[1],a[2]))})}function saveB2Profile(z){var M,T,P,F,x;const t=players.find(g=>g.name===z);if(!t)return;const _=(((M=document.getElementById("b2-ed-photo"))==null?void 0:M.value)||"").trim(),b=(((T=document.getElementById("b2-ed-second-profile"))==null?void 0:T.value)||"").trim(),l=(((P=document.getElementById("b2-ed-photo3"))==null?void 0:P.value)||"").trim(),$=(((F=document.getElementById("b2-ed-photo4"))==null?void 0:F.value)||"").trim(),u=(((x=document.getElementById("b2-ed-photo5"))==null?void 0:x.value)||"").trim(),S=g=>{const m=parseFloat(g);return isNaN(m)?1:Math.max(.2,Math.min(60,m))};if([_,b,l,$,u].some(g=>g&&g.startsWith("data:"))){alert(`\u274C \uD504\uB85C\uD544 \uC0AC\uC9C4\uC5D0 base64 \uC774\uBBF8\uC9C0(data:...)\uB97C \uC9C1\uC811 \uBD99\uC5EC\uB123\uC73C\uBA74 \uB3D9\uAE30\uD654 \uC800\uC7A5\uC774 \uC2E4\uD328\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.

\uC774\uBBF8\uC9C0\uB97C imgur.com, Discord \uB4F1\uC5D0 \uC5C5\uB85C\uB4DC\uD55C \uD6C4 URL\uC744 \uC0AC\uC6A9\uD558\uC138\uC694.`);return}t.photo=_||void 0,t.secondProfileFile=b||void 0,t.profileFile3=l||void 0,t.profileFile4=$||void 0,t.profileFile5=u||void 0;try{document.querySelectorAll("#b2-profile-edit-modal [data-b2-delay-key]").forEach(g=>{const m=String((g==null?void 0:g.getAttribute("data-b2-delay-key"))||"").trim();if(!m)return;const B=S((g==null?void 0:g.value)||"1");B===1?delete t[m]:t[m]=B})}catch(g){}save(),render(),document.getElementById("b2-profile-edit-modal").remove(),_b2SelectedPlayer&&_b2SelectedPlayer.name===z&&_b2UpdateMainDisplay(z)}window._b2RankingSort=window._b2RankingSort||"tier";

/* board2-analytics.js */
function _b2RankingView(){const H=new Set((typeof univCfg!="undefined"?univCfg:[]).filter(e=>e.dissolved||e.hidden).map(e=>String(e.name||"").trim())),C=players.filter(e=>!e.hidden&&!e.retired&&!e.hideFromBoard&&!H.has(String((e==null?void 0:e.univ)||"").trim())&&!_B2_ROLE_ORDER.includes(e.role||"")),N=_b2VisUnivs?_b2VisUnivs().filter(e=>e.name&&e.name!=="\uBB34\uC18C\uC18D"):[],j=typeof TIERS!="undefined"?TIERS:[],M=window._b2RankingSort||"tier",p=e=>{const i=j.indexOf(e);return i<0?0:Math.max(0,(j.length-i)*10)},{fromN:h,toN:b}=_b2ThisWeekRange(),x=_b2DateNum,A=new Date,P=A.getDay(),B=new Date(A);B.setDate(A.getDate()+(P===0?-6:1-P));const V=new Date(B);V.setDate(B.getDate()-7);const S=new Date(B);S.setDate(B.getDate()-1);const D=e=>parseInt(e.toISOString().slice(0,10).replace(/-/g,"")),u=D(V),I=D(S),O=N.map(e=>{var J;const i=C.filter(v=>String((v==null?void 0:v.univ)||"").trim()===e.name);if(!i.length)return null;const n=i.reduce((v,y)=>v+p(y.tier||""),0);let o=0,c=0,d=0,g=0;const $=new Set(i.map(v=>v.name));i.forEach(v=>{(Array.isArray(v.history)?v.history:[]).forEach(y=>{const F=x(y.date||y.d||"");F>=h&&F<=b&&(y.result==="\uC2B9"?o++:y.result==="\uD328"&&c++),F>=u&&F<=I&&(y.result==="\uC2B9"?d++:y.result==="\uD328"&&g++)})});try{(typeof indM!="undefined"&&Array.isArray(indM)?indM:[]).forEach(v=>{if(!v||!v.d||!v.wName||!v.lName)return;const y=x(v.d);$.has(v.wName)&&(y>=h&&y<=b?o++:y>=u&&y<=I&&d++),$.has(v.lName)&&(y>=h&&y<=b?c++:y>=u&&y<=I&&g++)})}catch(v){}try{(typeof gjM!="undefined"&&Array.isArray(gjM)?gjM:[]).forEach(v=>{if(!v||!v.d||!v.wName||!v.lName||v._proLabel)return;const y=x(v.d);$.has(v.wName)&&(y>=h&&y<=b?o++:y>=u&&y<=I&&d++),$.has(v.lName)&&(y>=h&&y<=b?c++:y>=u&&y<=I&&g++)})}catch(v){}const k=o+c,_=d+g,L=k>0?Math.round(o/k*100):null,W=_>0?Math.round(d/_*100):null,w=i.slice().sort((v,y)=>{const F=j.indexOf(v.tier||""),G=j.indexOf(y.tier||"");return(F>=0?F:999)-(G>=0?G:999)})[0],T=(w==null?void 0:w.tier)||"\uC5C6\uC74C",z=typeof getTierBtnColor=="function"?getTierBtnColor(T):"#64748b",Z=typeof getTierBtnTextColor=="function"&&getTierBtnTextColor(T)||"#fff",U={P:0,T:0,Z:0};i.forEach(v=>{v.race in U&&U[v.race]++});const X=((J=Object.entries(U).sort((v,y)=>y[1]-v[1])[0])==null?void 0:J[0])||"?",q={P:"\u{1F52E}",T:"\u2694\uFE0F",Z:"\u{1F98E}","?":"\u2753"}[X]||"\u2753";return{name:e.name,color:gc(e.name)||"#64748b",count:i.length,score:n,topTier:T,topTierCol:z,topTierTc:Z,races:U,dominantRace:X,raceEmoji:q,tw:o,tl:c,tg:k,wr:L,pwr:W}}).filter(Boolean),R=[...O].sort((e,i)=>{var n,o;return M==="tier"?i.score-e.score||i.count-e.count:M==="count"?i.count-e.count||i.score-e.score:M==="wr"?((n=i.wr)!=null?n:-1)-((o=e.wr)!=null?o:-1)||i.tg-e.tg:M==="games"?i.tg-e.tg||i.tw-e.tw:0}),E=[...O].sort((e,i)=>i.score-e.score||i.count-e.count),l={};E.forEach((e,i)=>{l[e.name]=i+1});const f=Math.max(...R.map(e=>e.score),1),m=Math.max(...R.map(e=>e.count),1),s=Math.max(...R.map(e=>e.tg),1),r=["\u{1F947}","\u{1F948}","\u{1F949}"],a=[{key:"tier",label:"\u{1F3C5} \uD2F0\uC5B4 \uC810\uC218"},{key:"count",label:"\u{1F465} \uC778\uC6D0\uC218"},{key:"wr",label:"\u{1F4C8} \uC774\uBC88\uC8FC \uC2B9\uB960"},{key:"games",label:"\u2694\uFE0F \uC774\uBC88\uC8FC \uACBD\uAE30\uC218"}];let t=`<style>
    .b2rk2-wrap {}
    .b2rk2-sortbar { display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px }
    .b2rk2-sbtn { padding:6px 14px;border-radius:20px;border:1.5px solid var(--border2);background:var(--surface);font-size:12px;font-weight:700;color:var(--text2);cursor:pointer;transition:all .15s }
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
    .b2rk2-score { font-size:13px;font-weight:900;min-width:52px;text-align:right }
    .b2rk2-badges { display:flex;gap:4px;flex-shrink:0;flex-wrap:wrap;align-items:center }
    .b2rk2-glow { position:absolute;inset:0;opacity:.05;pointer-events:none }
    .b2rk2-delta { font-size:11px;font-weight:800;margin-left:2px }
  </style>`;return t+=`<div style="margin-bottom:14px;padding:12px 16px;background:linear-gradient(135deg,#f97316,#fb923c);border-radius:14px;display:flex;align-items:center;gap:10px">
    <span style="font-size:24px">\u{1F3C6}</span>
    <div>
      <div style="font-size:15px;font-weight:900;color:#fff">\uB300\uD559\uBCC4 \uC885\uD569 \uB7AD\uD0B9</div>
      <div style="font-size:11px;color:rgba(255,255,255,.8)">\uC815\uB82C \uAE30\uC900\uC744 \uC120\uD0DD\uD574 \uB2E4\uC591\uD55C \uAD00\uC810\uC73C\uB85C \uBE44\uAD50</div>
    </div>
    <div style="margin-left:auto;text-align:right">
      <div style="font-size:20px;font-weight:900;color:#fff">${R.length}</div>
      <div style="font-size:10px;color:rgba(255,255,255,.8)">\uB300\uD559 \uCC38\uAC00</div>
    </div>
  </div>`,t+=`<div class="b2rk2-sortbar">
    ${a.map(e=>`<button class="b2rk2-sbtn${M===e.key?" on":""}" onclick="window._b2RankingSort='${e.key}';render()">${e.label}</button>`).join("")}
  </div>`,t+='<div class="b2rk2-wl-legend"><span><i style="background:#dc2626"></i>\uC774\uBC88\uC8FC \uC2B9</span><span><i style="background:#cbd5e1"></i>\uC774\uBC88\uC8FC \uD328</span></div>',t+='<div class="b2rk2-wrap">',R.forEach((e,i)=>{var w;const n=i+1,c=(l[e.name]||n)-n,d=r[i]||`<span style="font-size:14px;font-weight:900;color:var(--text3)">${n}</span>`,g=i<3;let $=0,k="";M==="tier"&&($=Math.round(e.score/f*100),k=`${e.score}pt`),M==="count"&&($=Math.round(e.count/m*100),k=`${e.count}\uBA85`),M==="wr"&&($=(w=e.wr)!=null?w:0,k=e.wr!==null?`${e.wr}%`:"-"),M==="games"&&($=Math.round(e.tg/Math.max(s,1)*100),k=`${e.tg}\uC804`);let _="";if(M==="tier"&&c!==0){const T=c>0?"#10b981":"#ef4444",z=c>0?"\u25B2":"\u25BC";_=`<span class="b2rk2-delta" style="color:${T}">${z}${Math.abs(c)}</span>`}const L=e.wr!==null?`<span style="font-size:10px;padding:2px 7px;border-radius:8px;background:${e.wr>=60?"#10b981":e.wr>=40?"#f59e0b":"#ef4444"};color:#fff;font-weight:800">\u{1F4C8} ${e.wr}%</span>`:"",W=e.wr!==null&&e.pwr!==null?`<span style="font-size:10px;color:${e.wr>=e.pwr?"#10b981":"#ef4444"};font-weight:700">${e.wr>=e.pwr?"\u25B2":"\u25BC"}${Math.abs(e.wr-e.pwr)}%</span>`:"";t+=`<div class="b2rk2-row" style="cursor:pointer;${g?`border-color:${e.color}66;background:${e.color}08`:""}" onclick="(function(el){document.querySelectorAll('.b2rk2-row').forEach(function(r){r.classList.remove('selected')});el.classList.toggle('selected');})(this);if(typeof openUnivModal==='function')openUnivModal('${typeof escJS=="function"?escJS(e.name):String(e.name).replace(/'/g,"\\'")}')">
      <div class="b2rk2-glow" style="background:radial-gradient(ellipse at 0% 50%,${e.color},transparent 60%)"></div>
      <div class="b2rk2-rank">${d}${_}</div>
      <div class="b2rk2-name" style="color:${e.color}">${e.name}</div>
      ${e.tg===0?'<div class="b2rk2-bar-wrap"></div>':`<div class="b2rk2-bar-wrap wl" title="\uC774\uBC88\uC8FC ${e.tw}\uC2B9 ${e.tl}\uD328 (${e.wr}%)">
        <div class="b2rk2-bar-win" style="width:${e.wr}%"></div>
        <div class="b2rk2-bar-loss"></div>
      </div>`}
      <div class="b2rk2-score" style="color:${e.color}">${k}</div>
      <div class="b2rk2-badges">
        <span style="font-size:10px;font-weight:800;padding:2px 8px;border-radius:8px;background:${e.topTierCol};color:${e.topTierTc}">TOP ${e.topTier}</span>
        <span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:8px;background:var(--surface);color:var(--text2)">${e.raceEmoji} ${e.count}\uBA85</span>
        ${e.tg>0?L:""}
        ${W}
      </div>
    </div>`}),t+="</div>",M==="tier"&&(t+=`<div style="margin-top:12px;padding:10px 14px;background:var(--surface);border-radius:10px;border:1px solid var(--border2)">
      <div style="font-size:11px;font-weight:700;color:var(--text3);margin-bottom:6px">\u{1F4CC} \uD2F0\uC5B4 \uC810\uC218 \uAE30\uC900</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px">
        ${j.filter(e=>C.some(i=>i.tier===e)).map(e=>{const i=typeof getTierBtnColor=="function"?getTierBtnColor(e):"#64748b",n=typeof getTierBtnTextColor=="function"&&getTierBtnTextColor(e)||"#fff";return`<span style="font-size:10px;font-weight:800;padding:2px 8px;border-radius:8px;background:${i};color:${n}">${e} = ${p(e)}pt</span>`}).join("")}
      </div>
    </div>`),t}function _b2RadarView(){const H=new Set((typeof univCfg!="undefined"?univCfg:[]).filter(r=>r.dissolved||r.hidden).map(r=>String(r.name||"").trim())),C=players.filter(r=>!r.hidden&&!r.retired&&!r.hideFromBoard&&!H.has(String((r==null?void 0:r.univ)||"").trim())&&!_B2_ROLE_ORDER.includes(r.role||"")),N=_b2VisUnivs?_b2VisUnivs().filter(r=>r.name&&r.name!=="\uBB34\uC18C\uC18D"):[],j=typeof TIERS!="undefined"?TIERS:[];try{const r=(function(){try{return[miniM,univM,ckM,proM,ttM,comps,tourneys,proTourneys,indM,gjM].map(t=>Array.isArray(t)?t.length:0).join("|")}catch(a){return""}})();typeof window.__b2_radar_hist_sig=="undefined"&&(window.__b2_radar_hist_sig=""),window.__b2_radar_hist_sig!==r&&typeof _rebuildAllPlayerHistoryCore=="function"&&(_rebuildAllPlayerHistoryCore(),window.__b2_radar_hist_sig=r)}catch(r){}const M=r=>{const a=j.indexOf(r);return a<0?0:Math.max(0,(j.length-a)*10)},p=r=>Array.isArray(r&&r.history)?r.history:[],h=r=>r?(r=String(r).trim(),r==="\uBBF8\uB2C8"||r==="\uCE5C\uC120"||r==="\uBBF8\uB2C8\uB300\uC804"||r.includes("\uBBF8\uB2C8")?"mini":r==="\uB300\uD559\uB300\uC804"||r==="\uB300\uD559"||r.includes("\uB300\uD559\uB300\uC804")?"univm":r==="CK"||r.includes("CK")?"ck":r==="\uD2F0\uC5B4\uB300\uD68C"||r.includes("\uD2F0\uC5B4")?"tt":r==="\uB300\uD68C"||r==="\uC77C\uBC18\uB300\uD68C"||r==="\uC870\uBCC4\uB9AC\uADF8"||r==="\uD1A0\uB108\uBA3C\uD2B8"||r==="\uC870\uBCC4\uB300\uD68C"||r.includes("\uC77C\uBC18\uB300\uD68C")||r.includes("\uB300\uD68C")||r.includes("\uC870\uBCC4")||r.includes("\uD1A0\uB108")?"comp":""):"",b=(function(){try{const a=[miniM,univM,ckM,proM,ttM,comps,tourneys,proTourneys,indM,gjM].map(o=>Array.isArray(o)?o.length:0).join("|"),t=Array.isArray(players)?players.length:0,e=(Array.isArray(players)?players:[]).reduce((o,c)=>o+(Array.isArray(c==null?void 0:c.history)?c.history.length:0),0),i=typeof univCfg!="undefined"&&Array.isArray(univCfg)?univCfg.length:0,n=(Array.isArray(players)?players:[]).map(o=>o.tier||"").join(",");return`${t}|${e}|${i}|${a}|${n}`}catch(r){return""}})();window.__b2_radar_stats_cache||(window.__b2_radar_stats_cache={sig:"",univStats:[]});let x=window.__b2_radar_stats_cache.sig===b?window.__b2_radar_stats_cache.univStats||[]:null;Array.isArray(x)||(x=N.map(r=>{const a=C.filter(g=>String((g==null?void 0:g.univ)||"").trim()===r.name);if(!a.length)return null;const t=a.length,e=a.reduce((g,$)=>g+M($.tier||""),0)/t,i={mini:0,univm:0,ck:0,tt:0,comp:0};let n=0,o=0;a.forEach(g=>{const $={mini:!1,univm:!1,ck:!1,tt:!1,comp:!1};p(g).forEach(k=>{const _=h(k&&k.mode);if(_&&_ in i){const L=String(k&&k.result||"").trim();L==="\uC2B9"?n++:L==="\uD328"&&o++}_&&_ in $&&($[_]=!0)}),Object.keys($).forEach(k=>{$[k]&&i[k]++})});const c=n+o,d=c>0?Math.round(n/c*100):null;return{name:r.name,color:gc(r.name)||"#64748b",total:t,avgScore:e,wins:n,losses:o,wr:d,partMini:i.mini/t,partUnivm:i.univm/t,partCk:i.ck/t,partTt:i.tt/t,partComp:i.comp/t}}).filter(Boolean).sort((r,a)=>a.total-r.total),window.__b2_radar_stats_cache.sig=b,window.__b2_radar_stats_cache.univStats=x);const A=Math.max(...x.map(r=>r.total),1),P=Math.max(...x.map(r=>r.avgScore),1),B=Math.max(...x.map(r=>r.wins||0),1),V=Math.max(...x.map(r=>r.losses||0),1),S=["\uC778\uC6D0","\uD3C9\uADE0\uD2F0\uC5B4","\uC2B9","\uD328","\uBBF8\uB2C8","\uB300\uD559\uB300\uC804","\uB300\uD559CK","\uD2F0\uC5B4\uB300\uD68C","\uC77C\uBC18\uB300\uD68C"],D=["\uC120\uC218 \uC218","\uD2F0\uC5B4 \uC810\uC218 \uD3C9\uADE0","\uCD1D \uC2B9\uB9AC\uC218","\uCD1D \uD328\uBC30\uC218","\uCC38\uAC00\uC728","\uCC38\uAC00\uC728","\uCC38\uAC00\uC728","\uCC38\uAC00\uC728","\uCC38\uAC00\uC728"],u=S.length,I=r=>[r.total/A,r.avgScore/P,(r.wins||0)/B,(r.losses||0)/V,r.partMini,r.partUnivm,r.partCk,r.partTt,r.partComp],O=S.map((r,a)=>{const t=x.map(e=>I(e)[a]);return t.reduce((e,i)=>e+i,0)/Math.max(t.length,1)}),R=r=>[r.total,Math.round(r.avgScore*10)/10,r.wins||0,r.losses||0,Math.round(r.partMini*100)+"%",Math.round(r.partUnivm*100)+"%",Math.round(r.partCk*100)+"%",Math.round(r.partTt*100)+"%",Math.round(r.partComp*100)+"%"],E=JSON.stringify(x.map(r=>({name:r.name,color:r.color,total:r.total,wr:r.wr,wins:r.wins,losses:r.losses,vals:I(r),raw:R(r)}))),l=JSON.stringify(S),f=JSON.stringify(D),m=JSON.stringify(O),s="rdr_"+Math.random().toString(36).slice(2,8);return`<style>
    #${s}-wrap {}
    #${s}-sel { display:flex; flex-wrap:wrap; gap:6px; margin-bottom:12px; }
    .${s}-chip { padding:5px 12px; border-radius:20px; border:1.5px solid var(--border2); background:var(--surface); font-size:11px; font-weight:700; color:var(--text2); cursor:pointer; transition:all .12s; }
    .${s}-chip.on { color:#fff; border-color:transparent; }
    .${s}-chip:hover:not(.on) { border-color:var(--text2); }
    #${s}-canvas { display:block; max-width:520px; margin:0 auto; cursor:crosshair; }
    #${s}-legend { display:flex; flex-wrap:wrap; gap:8px; margin-top:10px; justify-content:center; }
    #${s}-table { width:100%; border-collapse:collapse; margin-top:14px; font-size:11px; }
    #${s}-table th { padding:5px 8px; background:var(--bg); border-bottom:2px solid var(--border2); font-size:10px; font-weight:800; color:var(--text3); text-align:center; white-space:nowrap; position:sticky; top:0; z-index:1; }
    #${s}-table th:first-child { text-align:left; }
    #${s}-table td { padding:5px 8px; border-bottom:1px solid var(--border2); text-align:center; font-weight:700; }
    #${s}-table td:first-child { text-align:left; font-weight:900; }
    #${s}-table tr:hover td { background:var(--hover); }
    #${s}-table td.hi { background:#fef9c366; font-weight:900; }
    .${s}-avg-note { font-size:10px; color:var(--text3); display:flex; align-items:center; gap:4px; margin-top:4px; }
    #${s}-tooltip { position:fixed; pointer-events:none; opacity:0; background:var(--white); border:1px solid var(--border2); border-radius:10px; padding:8px 12px; box-shadow:0 4px 20px #0003; font-size:11px; font-weight:700; color:var(--text2); z-index:999; transition:opacity .1s; max-width:180px; }
  </style>
  <div id="${s}-wrap">
    <div style="margin-bottom:12px;padding:10px 14px;background:linear-gradient(135deg,#a855f7,#9333ea);border-radius:12px;display:flex;align-items:center;gap:8px">
      <span style="font-size:20px">\u{1F578}\uFE0F</span>
      <div>
        <div style="font-size:13px;font-weight:900;color:#fff">\uB300\uD559\uBCC4 \uB2E4\uCC28\uC6D0 \uB808\uC774\uB354</div>
        <div style="font-size:11px;color:rgba(255,255,255,.8)">\uCD5C\uB300 3\uAC1C \uC120\uD0DD \xB7 \uC810\uC120 = \uC804\uCCB4 \uD3C9\uADE0 \xB7 \uAC15\uC810 \uCD95 \uC790\uB3D9 \uD558\uC774\uB77C\uC774\uD2B8</div>
      </div>
    </div>
    <div style="margin-bottom:10px;padding:10px 14px;background:var(--surface);border:1px solid var(--border2);border-radius:12px;font-size:11px;color:var(--text3);line-height:1.6">
      <strong style="color:var(--text2)">\uCD95 \uC124\uBA85</strong> \u2014
      \uC2B9/\uD328: \uACF5\uC2DD \uAE30\uB85D \uAE30\uC900 \xB7 \uCC38\uAC00\uC728: \uD574\uB2F9 \uC885\uBAA9 1\uACBD\uAE30 \uC774\uC0C1 \uB6F4 \uBE44\uC728 \xB7 \uC778\uC6D0\xB7\uD3C9\uADE0\uD2F0\uC5B4: \uCD5C\uB300\uAC12 \uAE30\uC900 \uC815\uADDC\uD654
    </div>
    <div id="${s}-sel"></div>
    <div style="position:relative">
      <canvas id="${s}-canvas" width="520" height="480"></canvas>
      <div id="${s}-tooltip"></div>
    </div>
    <div id="${s}-legend"></div>
    <div style="overflow-x:auto;margin-top:4px">
      <table id="${s}-table"><thead></thead><tbody></tbody></table>
    </div>
  </div>
  <script>
  (function(){
    const UNIVS    = ${E};
    const AXES     = ${l};
    const AXES_DESC= ${f};
    const AVG_VALS = ${m};
    const N = AXES.length;
    const canvas  = document.getElementById('${s}-canvas');
    const selEl   = document.getElementById('${s}-sel');
    const legendEl= document.getElementById('${s}-legend');
    const tableEl = document.getElementById('${s}-table');
    const ttipEl  = document.getElementById('${s}-tooltip');
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
      chip.className = '${s}-chip';
      chip.textContent = u.name;
      chip.onclick = () => {
        if (selected.includes(u.name)) {
          selected = selected.filter(n=>n!==u.name);
        } else {
          if (selected.length >= 3) selected.shift();
          selected.push(u.name);
        }
        document.querySelectorAll('.${s}-chip').forEach(c => {
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
          ttipEl.innerHTML=\`<div style="color:\${bestU.color};font-weight:900">\${bestU.name}</div><div style="color:#475569">\${AXES[bestI]}: <strong>\${bestU.raw[bestI]}</strong></div><div style="font-size:10px;color:#94a3b8">\uC815\uADDC\uD654 \uD3C9\uADE0 \${Math.round((AVG_VALS[bestI]||0)*100)}%</div>\`;
        } else { ttipEl.style.opacity='0'; }
      }

      // \uBC94\uB840
      legendEl.innerHTML = activeUnivs.map(u=>{
        const str = getStrengthAxes(u).map(i=>AXES[i]).join(', ');
        return \`<div style="display:flex;align-items:center;gap:6px;padding:5px 10px;border-radius:10px;background:var(--surface);border:1.5px solid \${u.color}44">
          <span style="width:12px;height:12px;border-radius:50%;background:\${u.color};flex-shrink:0"></span>
          <span style="font-size:12px;font-weight:900;color:\${u.color}">\${u.name}</span>
          <span style="font-size:11px;color:var(--text3);">\${u.total}\uBA85\${u.wr!==null?' \xB7 '+u.wr+'%':''}\${(u.wins+u.losses)>0?' \xB7 '+(u.wins+u.losses)+'\uC804':''}</span>
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
      th.innerHTML = \`<tr><th>\uD56D\uBAA9</th>\${active.map(u=>\`<th style="color:\${u.color}">\${u.name}</th>\`).join('')}<th style="color:#94a3b8">\uC815\uADDC\uD654 \uD3C9\uADE0</th></tr>\`;
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
  <\/script>`}function _b2SummaryView(){const H=new Set((typeof univCfg!="undefined"?univCfg:[]).filter(t=>t.dissolved||t.hidden).map(t=>String(t.name||"").trim())),C=players.filter(t=>!t.hidden&&!t.retired&&!t.hideFromBoard&&!H.has(String((t==null?void 0:t.univ)||"").trim())),N=C.filter(t=>!_B2_ROLE_ORDER.includes(t.role||"")),j=C.filter(t=>_B2_ROLE_ORDER.includes(t.role||"")),M=_b2VisUnivs?_b2VisUnivs().filter(t=>t.name&&t.name!=="\uBB34\uC18C\uC18D"):[],p={P:0,T:0,Z:0,"?":0};N.forEach(t=>{const e=t.race||"?";p[e in p?e:"?"]++});const h={};N.forEach(t=>{const e=t.tier||"\uBBF8\uC815";h[e]=(h[e]||0)+1});const{fromN:b,toN:x}=_b2ThisWeekRange(),A=_b2DateNum;let P=0,B=0,V=new Set;N.forEach(t=>{(Array.isArray(t.history)?t.history:[]).forEach(e=>{e.result==="\uC2B9"?P++:e.result==="\uD328"&&B++;const i=A(e.date||e.d||"");i>=b&&i<=x&&V.add(t.name)})});const S=P+B,D=S>0?Math.round(P/S*100):null,u=new Date,I=new Date(u);I.setDate(u.getDate()-30);const O=A(I.toISOString().slice(0,10)),R=N.filter(t=>{const e=Array.isArray(t.history)?t.history:[];return e.length?Math.min(...e.map(n=>A(n.date||n.d||"")).filter(n=>n>0))>=O:!1}).sort((t,e)=>{const i=Math.min(...(Array.isArray(t.history)?t.history:[]).map(o=>A(o.date||o.d||"")).filter(o=>o>0));return Math.min(...(Array.isArray(e.history)?e.history:[]).map(o=>A(o.date||o.d||"")).filter(o=>o>0))-i}).slice(0,8),E=M.map(t=>{const e=N.filter(o=>String((o==null?void 0:o.univ)||"").trim()===String(t.name||"").trim()),i={P:0,T:0,Z:0};e.forEach(o=>{o.race in i&&i[o.race]++});const n={};return e.forEach(o=>{const c=o.tier||"\uBBF8\uC815";n[c]=(n[c]||0)+1}),{name:t.name,color:gc(t.name),count:e.length,races:i,tiers:n}}).filter(t=>t.count>0).sort((t,e)=>e.count-t.count),l=E.length>0?E[0].count:1,f=(typeof TIERS!="undefined"?TIERS:[]).filter(t=>h[t]),m=p.P+p.T+p.Z||1,s=()=>{const c=p.P+p.T+p.Z||1,d=[{val:p.P,col:"#7c3aed",label:"P"},{val:p.T,col:"#0284c7",label:"T"},{val:p.Z,col:"#059669",label:"Z"}].filter(_=>_.val>0),g=2*Math.PI*38;let $=0;return`<svg width="110" height="110" viewBox="0 0 110 110">
      <circle cx="55" cy="55" r="38" fill="none" stroke="var(--border2)" stroke-width="18"/>
      ${d.map(_=>{const L=_.val/c*g,W=`<circle cx="55" cy="55" r="38" fill="none" stroke="${_.col}" stroke-width="18" stroke-dasharray="${L.toFixed(2)} ${g.toFixed(2)}" stroke-dashoffset="${(-$).toFixed(2)}" transform="rotate(-90 55 55)"/>`;return $+=L,W}).join("")}
      <text x="55" y="49" text-anchor="middle" font-size="18" font-weight="900" fill="var(--text1)">${N.length}</text>
      <text x="55" y="65" text-anchor="middle" font-size="9" font-weight="600" fill="var(--text3)">\uC120\uC218</text>
    </svg>`};let r=`<style>
    .b2s-hero{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;padding:20px 22px;border-radius:26px;border:1px solid rgba(148,163,184,.18);background:linear-gradient(180deg,rgba(255,255,255,.99),rgba(248,250,252,.96));box-shadow:0 18px 32px rgba(15,23,42,.05);margin-bottom:16px}
    .b2s-hero-title{font-size:26px;font-weight:950;letter-spacing:-.04em;color:var(--text1);line-height:1.08}
    .b2s-hero-desc{margin-top:6px;font-size:13px;line-height:1.65;color:var(--text3);max-width:720px}
    .b2s-hero-badges{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}
    .b2s-hero-badge{display:inline-flex;align-items:center;gap:6px;padding:8px 12px;border-radius:999px;border:1px solid rgba(148,163,184,.18);background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.94));box-shadow:0 10px 18px rgba(15,23,42,.04);font-size:12px;font-weight:800;color:var(--text2)}
    .b2s-hero-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;min-width:min(100%,360px)}
    .b2s-hero-stat{padding:14px;border-radius:18px;border:1px solid rgba(148,163,184,.16);background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.94));box-shadow:0 10px 18px rgba(15,23,42,.04)}
    .b2s-hero-stat-label{font-size:11px;font-weight:800;color:var(--text3)}
    .b2s-hero-stat-value{margin-top:6px;font-size:22px;font-weight:950;letter-spacing:-.03em;color:var(--text1);line-height:1}
    .b2s-hero-stat-sub{margin-top:4px;font-size:11px;font-weight:700;color:var(--text3)}
    .b2s-grid7 { display:grid; grid-template-columns:repeat(7,1fr); gap:10px; margin-bottom:16px; }
    @media(max-width:700px){ .b2s-grid7{ grid-template-columns:repeat(4,1fr); } }
    @media(max-width:420px){ .b2s-grid7{ grid-template-columns:repeat(2,1fr); } }
    .b2s-kpi { border-radius:18px; padding:15px 12px; text-align:center; position:relative; overflow:hidden; border:1px solid rgba(148,163,184,.16); background:linear-gradient(180deg,rgba(255,255,255,.99),rgba(248,250,252,.96)); box-shadow:0 14px 24px rgba(15,23,42,.04); transition:transform .15s,box-shadow .15s; cursor:default; }
    .b2s-kpi:hover { transform:translateY(-2px); box-shadow:0 12px 28px rgba(15,23,42,.08); }
    .b2s-kpi-num { font-size:26px; font-weight:900; line-height:1.1; }
    .b2s-kpi-lbl { font-size:11px; font-weight:700; margin-top:3px; opacity:.75; }
    .b2s-kpi-sub { font-size:10px; opacity:.6; margin-top:1px; }
    .b2s-kpi-glow { position:absolute;inset:0;opacity:.08;pointer-events:none; }
    .b2s-2col { display:grid; grid-template-columns:1fr 1fr 1fr; gap:14px; margin-bottom:14px; }
    @media(max-width:780px){ .b2s-2col{ grid-template-columns:1fr 1fr; } }
    @media(max-width:520px){ .b2s-2col{ grid-template-columns:1fr; } }
    .b2s-panel { background:linear-gradient(180deg,rgba(255,255,255,.99),rgba(248,250,252,.96)); border:1px solid rgba(148,163,184,.16); border-radius:20px; padding:16px; box-shadow:0 16px 28px rgba(15,23,42,.04); }
    .b2s-panel-title { font-size:13px; font-weight:900; color:var(--text1); margin-bottom:12px; display:flex; align-items:center; gap:6px; }
    .b2s-univ-row { display:flex; align-items:center; gap:8px; padding:5px 0; }
    .b2s-univ-row + .b2s-univ-row { border-top:1px solid var(--border2); }
    .b2s-bar-track { flex:1; height:12px; border-radius:6px; overflow:hidden; background:var(--border2); display:flex; }
    .b2s-tier-chip { display:inline-flex; flex-direction:column; align-items:center; padding:8px 10px; border-radius:14px; min-width:54px; box-shadow:0 10px 16px rgba(15,23,42,.04); }
    .b2s-top-univ { display:grid; grid-template-columns:repeat(auto-fill,minmax(130px,1fr)); gap:8px; }
    .b2s-univ-card { border-radius:16px; padding:10px 12px; border:1.5px solid; position:relative; overflow:hidden; transition:transform .12s,box-shadow .12s; cursor:default; box-shadow:0 12px 18px rgba(15,23,42,.04); }
    .b2s-univ-card:hover { transform:translateY(-2px); box-shadow:0 12px 24px rgba(15,23,42,.08); }
    .b2s-new-player { display:inline-flex;align-items:center;gap:4px;padding:5px 9px;border-radius:999px;background:var(--surface);border:1px solid var(--border2);font-size:11px;font-weight:700;color:var(--text2);margin:2px; }
    @media(max-width:900px){ .b2s-hero{flex-direction:column}.b2s-hero-stats{width:100%;grid-template-columns:repeat(3,minmax(0,1fr));} }
    @media(max-width:640px){ .b2s-hero{padding:18px 16px;border-radius:22px}.b2s-hero-title{font-size:22px}.b2s-hero-stats{grid-template-columns:1fr} }
  </style>`;const a=[{num:C.length,lbl:"\uC804\uCCB4 \uC120\uC218",col:"#3b82f6",icon:"\u{1F465}"},{num:M.length,lbl:"\uD65C\uB3D9 \uB300\uD559",col:"#10b981",icon:"\u{1F3EB}"},{num:p.P,lbl:"\uD504\uB85C\uD1A0\uC2A4",col:"#7c3aed",icon:"\u{1F52E}"},{num:p.T,lbl:"\uD14C\uB780",col:"#0284c7",icon:"\u2694\uFE0F"},{num:p.Z,lbl:"\uC800\uADF8",col:"#059669",icon:"\u{1F98E}"},{num:V.size,lbl:"\uC774\uBC88\uC8FC \uD65C\uB3D9",col:"#f59e0b",icon:"\u{1F525}",sub:`${P}\uC2B9 ${B}\uD328`},{num:D!==null?`${D}%`:"-",lbl:"\uD1B5\uC0B0 \uC2B9\uB960",col:"#ec4899",icon:"\u{1F4CA}",sub:`${S.toLocaleString()}\uC804`}];return r+=`<section class="b2s-hero">
    <div>
      <div style="font-size:11px;font-weight:900;letter-spacing:.08em;color:#2563eb;text-transform:uppercase">Summary Dashboard</div>
      <div class="b2s-hero-title">\uD604\uD669\uD310 \uC694\uC57D</div>
      <div class="b2s-hero-desc">\uC804\uCCB4 \uC778\uC6D0, \uD65C\uB3D9 \uB300\uD559, \uC885\uC871 \uBD84\uD3EC, \uCD5C\uADFC \uC720\uC785\uACFC \uB300\uD559\uBCC4 \uAD6C\uC131\uC744 \uD55C \uD654\uBA74\uC5D0\uC11C \uBE60\uB974\uAC8C \uD6D1\uC744 \uC218 \uC788\uB3C4\uB85D \uC815\uB9AC\uD55C \uC694\uC57D \uD654\uBA74\uC785\uB2C8\uB2E4.</div>
      <div class="b2s-hero-badges">
        <span class="b2s-hero-badge">\uD45C\uC2DC \uC120\uC218 ${C.length}\uBA85</span>
        <span class="b2s-hero-badge">\uC77C\uBC18 ${N.length}\uBA85</span>
        <span class="b2s-hero-badge">\uC9C1\uCC45 ${j.length}\uBA85</span>
        <span class="b2s-hero-badge">\uCD5C\uADFC 30\uC77C \uC2E0\uADDC ${R.length}\uBA85</span>
      </div>
    </div>
    <div class="b2s-hero-stats">
      <div class="b2s-hero-stat">
        <div class="b2s-hero-stat-label">\uD65C\uB3D9 \uB300\uD559</div>
        <div class="b2s-hero-stat-value">${M.length}</div>
        <div class="b2s-hero-stat-sub">\uBB34\uC18C\uC18D \uC81C\uC678 \uAE30\uC900</div>
      </div>
      <div class="b2s-hero-stat">
        <div class="b2s-hero-stat-label">\uC774\uBC88\uC8FC \uD65C\uB3D9</div>
        <div class="b2s-hero-stat-value">${V.size}</div>
        <div class="b2s-hero-stat-sub">${P}\uC2B9 ${B}\uD328 \uB204\uC801</div>
      </div>
      <div class="b2s-hero-stat">
        <div class="b2s-hero-stat-label">\uD1B5\uC0B0 \uC2B9\uB960</div>
        <div class="b2s-hero-stat-value">${D!==null?`${D}%`:"-"}</div>
        <div class="b2s-hero-stat-sub">${S.toLocaleString()}\uC804 \uAE30\uC900</div>
      </div>
    </div>
  </section>`,r+=`<div class="b2s-grid7">
    ${a.map(t=>`
    <div class="b2s-kpi" style="background:linear-gradient(180deg,rgba(255,255,255,.99),rgba(248,250,252,.96))">
      <div class="b2s-kpi-glow" style="background:radial-gradient(circle at 50% 0%,${t.col},transparent 70%)"></div>
      <div style="font-size:20px;margin-bottom:2px">${t.icon}</div>
      <div class="b2s-kpi-num" style="color:${t.col}">${t.num}</div>
      <div class="b2s-kpi-lbl" style="color:${t.col}">${t.lbl}</div>
      ${t.sub?`<div class="b2s-kpi-sub" style="color:${t.col}">${t.sub}</div>`:""}
    </div>`).join("")}
  </div>`,r+=`<div class="b2s-2col">
    <div class="b2s-panel">
      <div class="b2s-panel-title">\u{1F3AE} \uC885\uC871 \uBE44\uC728
        <span style="margin-left:auto;font-size:11px;color:var(--text3);font-weight:600">${N.length}\uBA85 \uAE30\uC900</span>
      </div>
      <div style="display:flex;align-items:center;gap:16px">
        <div style="flex-shrink:0">${s()}</div>
        <div style="flex:1;display:flex;flex-direction:column;gap:8px">
          ${[{r:"P",c:"#7c3aed",l:"\u{1F52E} \uD504\uB85C\uD1A0\uC2A4"},{r:"T",c:"#0284c7",l:"\u2694\uFE0F \uD14C\uB780"},{r:"Z",c:"#059669",l:"\u{1F98E} \uC800\uADF8"}].map(({r:t,c:e,l:i})=>{const n=p[t],o=Math.round(n/m*100);return`<div>
              <div style="display:flex;justify-content:space-between;margin-bottom:3px">
                <span style="font-size:11px;font-weight:800;color:${e}">${i}</span>
                <span style="font-size:11px;font-weight:900;color:var(--text2)">${n}<span style="font-weight:600;color:var(--text3)"> (${o}%)</span></span>
              </div>
              <div style="height:7px;border-radius:4px;background:var(--border2);overflow:hidden">
                <div style="width:${o}%;height:100%;background:${e};border-radius:4px;transition:width .8s ease"></div>
              </div>
            </div>`}).join("")}
        </div>
      </div>
    </div>
    <div class="b2s-panel">
      <div class="b2s-panel-title">\u{1F3C6} \uD2F0\uC5B4 \uBD84\uD3EC</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px">
        ${f.map(t=>{const e=typeof getTierBtnColor=="function"?getTierBtnColor(t):"#64748b",i=typeof getTierBtnTextColor=="function"&&getTierBtnTextColor(t)||"#fff",n=h[t],o=Math.round(n/N.length*100);return`<div class="b2s-tier-chip" style="background:${e}18;border:1.5px solid ${e}55" title="${t}: ${n}\uBA85 (${o}%)">
            <div style="font-size:12px;font-weight:900;padding:2px 8px;border-radius:6px;background:${e};color:${i}">${t}</div>
            <div style="font-size:11px;font-weight:800;color:${e};margin-top:3px">${n}\uBA85</div>
            <div style="font-size:10px;color:var(--text3)">${o}%</div>
          </div>`}).join("")}
      </div>
    </div>
    <div class="b2s-panel">
      <div class="b2s-panel-title">\u{1F3EB} \uB300\uD559\uBCC4 \uD604\uD669
        <span style="margin-left:auto;font-size:11px;color:var(--text3);font-weight:600">${E.length}\uAC1C \uB300\uD559</span>
      </div>
      ${E.slice(0,10).map((t,e)=>{const i=Math.round(t.count/l*100);return`<div style="display:flex;align-items:center;gap:6px;padding:4px 0;border-bottom:1px solid var(--border2)">
          <span style="font-size:10px;font-weight:900;color:var(--text3);width:16px;text-align:center">${e+1}</span>
          <span style="font-size:11px;font-weight:800;color:${t.color};min-width:60px;max-width:72px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${t.name}</span>
          <div style="flex:1;height:8px;border-radius:4px;overflow:hidden;background:var(--border2);display:flex">
            <div style="width:${Math.round(t.races.P/t.count*i)}%;background:#7c3aed"></div>
            <div style="width:${Math.round(t.races.T/t.count*i)}%;background:#0284c7"></div>
            <div style="width:${Math.round(t.races.Z/t.count*i)}%;background:#059669"></div>
          </div>
          <span style="font-size:11px;font-weight:900;color:${t.color};min-width:20px;text-align:right">${t.count}</span>
        </div>`}).join("")}
      ${E.length>10?`<div style="text-align:center;color:var(--text3);font-size:11px;margin-top:6px">\uC678 ${E.length-10}\uAC1C \uB300\uD559</div>`:""}
    </div>
  </div>`,R.length>0&&(r+=`<div class="b2s-panel" style="margin-bottom:14px">
      <div class="b2s-panel-title">\u{1F195} \uCD5C\uADFC 30\uC77C \uCCAB \uACBD\uAE30 \uC120\uC218
        <span style="margin-left:auto;font-size:11px;color:var(--text3);font-weight:600">${R.length}\uBA85</span>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:4px">
        ${R.map(t=>{const e=gc(String((t==null?void 0:t.univ)||""))||"#64748b",i=typeof getTierBtnColor=="function"&&t.tier?getTierBtnColor(t.tier):"#64748b",n=typeof getTierBtnTextColor=="function"&&t.tier&&getTierBtnTextColor(t.tier)||"#fff",o=t.race==="P"?"\u{1F52E}":t.race==="T"?"\u2694\uFE0F":t.race==="Z"?"\u{1F98E}":"",c=Array.isArray(t.history)?t.history:[],d=c.length?String(Math.min(...c.map(g=>parseInt(String(g.date||g.d||"").replace(/[-\.]/g,""))||1/0))).replace(/(\d{4})(\d{2})(\d{2})/,"$1.$2.$3"):"";return`<span class="b2s-new-player" style="border-color:${e}44;background:${e}0d">
            <span style="color:${e};font-weight:900">${t.name}</span>
            ${o?`<span style="font-size:10px">${o}</span>`:""}
            ${t.tier?`<span style="font-size:9px;padding:1px 4px;border-radius:4px;background:${i};color:${n}">${t.tier}</span>`:""}
            <span style="font-size:9px;color:var(--text3)">${t.univ||""}</span>
          </span>`}).join("")}
      </div>
    </div>`),r+=`<div class="b2s-panel" style="margin-bottom:14px">
    <div class="b2s-panel-title">\u{1F3EB} \uB300\uD559\uBCC4 \uC778\uC6D0 \uD604\uD669
      <span style="margin-left:auto;font-size:11px;color:var(--text3);font-weight:600">${E.length}\uAC1C \uB300\uD559</span>
    </div>
    <div class="b2s-top-univ" style="margin-bottom:12px">
      ${E.slice(0,6).map((t,e)=>{const i=["\u{1F947}","\u{1F948}","\u{1F949}","4\uFE0F\u20E3","5\uFE0F\u20E3","6\uFE0F\u20E3"][e]||"",n=t.count>0?Math.round(t.races.P/t.count*100):0,o=t.count>0?Math.round(t.races.T/t.count*100):0,c=t.count>0?Math.round(t.races.Z/t.count*100):0;return`<div class="b2s-univ-card" style="border-color:${t.color}44;background:${t.color}0d">
          <div style="display:flex;align-items:center;gap:4px;margin-bottom:6px">
            <span style="font-size:14px">${i}</span>
            <span style="font-size:12px;font-weight:900;color:${t.color};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1">${t.name}</span>
            <span style="font-size:15px;font-weight:900;color:${t.color}">${t.count}</span>
          </div>
          <div style="height:6px;border-radius:3px;overflow:hidden;background:var(--border2);display:flex;margin-bottom:4px">
            <div style="width:${n}%;background:#7c3aed" title="P ${t.races.P}"></div>
            <div style="width:${o}%;background:#0284c7" title="T ${t.races.T}"></div>
            <div style="width:${c}%;background:#059669" title="Z ${t.races.Z}"></div>
          </div>
          <div style="display:flex;gap:3px;flex-wrap:wrap">
            ${t.races.P?`<span style="font-size:9px;background:#ede9fe;color:#5b21b6;padding:1px 5px;border-radius:5px;font-weight:800">P${t.races.P}</span>`:""}
            ${t.races.T?`<span style="font-size:9px;background:#e0f2fe;color:#075985;padding:1px 5px;border-radius:5px;font-weight:800">T${t.races.T}</span>`:""}
            ${t.races.Z?`<span style="font-size:9px;background:#d1fae5;color:#064e3b;padding:1px 5px;border-radius:5px;font-weight:800">Z${t.races.Z}</span>`:""}
          </div>
        </div>`}).join("")}
    </div>
    <div style="border-top:1px solid var(--border2);padding-top:10px">
      ${E.slice(0,20).map(t=>{const e=Math.round(t.count/l*100);return`<div class="b2s-univ-row">
          <span style="font-size:11px;font-weight:800;color:${t.color};min-width:68px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${t.name}</span>
          <div class="b2s-bar-track">
            <div title="\uD504\uB85C\uD1A0\uC2A4 ${t.races.P}" style="width:${Math.round(t.races.P/t.count*e)}%;background:#7c3aed;transition:width .6s ease"></div>
            <div title="\uD14C\uB780 ${t.races.T}" style="width:${Math.round(t.races.T/t.count*e)}%;background:#0284c7;transition:width .6s ease"></div>
            <div title="\uC800\uADF8 ${t.races.Z}" style="width:${Math.round(t.races.Z/t.count*e)}%;background:#059669;transition:width .6s ease"></div>
          </div>
          <span style="font-size:11px;font-weight:900;color:${t.color};min-width:22px;text-align:right">${t.count}</span>
          <div style="display:flex;gap:3px;margin-left:3px;min-width:70px">
            ${t.races.P?`<span style="font-size:9px;background:#ede9fe;color:#5b21b6;padding:1px 4px;border-radius:5px;font-weight:800">P${t.races.P}</span>`:""}
            ${t.races.T?`<span style="font-size:9px;background:#e0f2fe;color:#075985;padding:1px 4px;border-radius:5px;font-weight:800">T${t.races.T}</span>`:""}
            ${t.races.Z?`<span style="font-size:9px;background:#d1fae5;color:#064e3b;padding:1px 4px;border-radius:5px;font-weight:800">Z${t.races.Z}</span>`:""}
          </div>
        </div>`}).join("")}
      ${E.length>20?`<div style="text-align:center;color:var(--text3);font-size:12px;margin-top:8px;padding-top:6px;border-top:1px solid var(--border2)">\uC678 ${E.length-20}\uAC1C \uB300\uD559</div>`:""}
    </div>
  </div>`,r}let _b2CompareA="",_b2CompareB="";function _b2CompareView(){var I,O,R,E;const H=new Set((typeof univCfg!="undefined"?univCfg:[]).filter(l=>l.dissolved||l.hidden).map(l=>String(l.name||"").trim())),C=_b2VisUnivs?_b2VisUnivs().filter(l=>l.name&&l.name!=="\uBB34\uC18C\uC18D"):[];!_b2CompareA&&C.length>0&&(_b2CompareA=((I=C[0])==null?void 0:I.name)||""),!_b2CompareB&&C.length>1&&(_b2CompareB=((O=C[1])==null?void 0:O.name)||"");const N=_b2DateNum,j=l=>{var c;const f=players.filter(d=>String((d==null?void 0:d.univ)||"").trim()===l&&!d.hidden&&!d.retired&&!d.hideFromBoard&&!H.has(l)),m=f.filter(d=>!_B2_ROLE_ORDER.includes(d.role||"")),s=f.filter(d=>_B2_ROLE_ORDER.includes(d.role||"")),r={P:0,T:0,Z:0,N:0};f.forEach(d=>{const g=String(d.race||"").trim().toUpperCase();g==="P"||g==="T"||g==="Z"?r[g]++:r.N++});const a={};m.forEach(d=>{const g=d.tier||"\uBBF8\uC815";a[g]=(a[g]||0)+1});const t=m.length>0&&((c=m.slice().sort((d,g)=>{const $=typeof TIERS!="undefined"?TIERS:[],k=$.indexOf(d.tier||""),_=$.indexOf(g.tier||"");return(k>=0?k:999)-(_>=0?_:999)})[0])==null?void 0:c.tier)||"\uC5C6\uC74C";let e=0,i=0;m.forEach(d=>{e+=Number(d.win||0),i+=Number(d.loss||0)});const n=e+i,o=n>0?Math.round(e/n*100):null;return{members:f,tiered:m,roled:s,races:r,tiers:a,topTier:t,total:f.length,tw:e,tl:i,tg:n,wr:o}},M=(l,f)=>{const m=new Set(players.filter(t=>String((t==null?void 0:t.univ)||"").trim()===l&&!t.hidden&&!t.retired).map(t=>t.name)),s=new Set(players.filter(t=>String((t==null?void 0:t.univ)||"").trim()===f).map(t=>t.name));let r=0,a=0;players.filter(t=>m.has(t.name)).forEach(t=>{(Array.isArray(t.history)?t.history:[]).forEach(e=>{const i=String(e.oppUniv||e.univ||"").trim(),n=String(e.opp||"").trim();(i===f||s.has(n))&&(e.result==="\uC2B9"?r++:e.result==="\uD328"&&a++)})});try{(typeof indM!="undefined"&&Array.isArray(indM)?indM:[]).forEach(t=>{!t||!t.wName||!t.lName||(m.has(t.wName)&&s.has(t.lName)?r++:m.has(t.lName)&&s.has(t.wName)&&a++)})}catch(t){}try{(typeof gjM!="undefined"&&Array.isArray(gjM)?gjM:[]).forEach(t=>{!t||!t.wName||!t.lName||t._proLabel||(m.has(t.wName)&&s.has(t.lName)?r++:m.has(t.lName)&&s.has(t.wName)&&a++)})}catch(t){}try{(typeof ttM!="undefined"&&Array.isArray(ttM)?ttM:[]).forEach(t=>{(t.sets||[]).forEach(e=>{(e.games||[]).forEach(i=>{if(!i||!i.winner)return;const n=i.playerA||i.a1||"",o=i.playerB||i.b1||"";if(!n||!o)return;const c=i.winner==="A",d=i.winner==="B";m.has(n)&&s.has(o)?c?r++:d&&a++:m.has(o)&&s.has(n)&&(d?r++:c&&a++)})})})}catch(t){}try{[typeof miniM!="undefined"?miniM:[],typeof univM!="undefined"?univM:[],typeof ckM!="undefined"?ckM:[]].forEach(t=>{(Array.isArray(t)?t:[]).forEach(e=>{(e.sets||[]).forEach(i=>{(i.games||[]).forEach(n=>{if(!n||!n.winner)return;const o=n.playerA||n.a1||"",c=n.playerB||n.b1||"";if(!o||!c)return;const d=n.winner==="A",g=n.winner==="B";m.has(o)&&s.has(c)?d?r++:g&&a++:m.has(c)&&s.has(o)&&(g?r++:d&&a++)})})})})}catch(t){}return{aw:r,al:a,ag:r+a}},p=_b2CompareA&&gc(_b2CompareA)||"#64748b",h=_b2CompareB&&gc(_b2CompareB)||"#64748b",b=_b2CompareA?j(_b2CompareA):null,x=_b2CompareB?j(_b2CompareB):null,A=_b2CompareA&&_b2CompareB?M(_b2CompareA,_b2CompareB):{aw:0,al:0,ag:0},P=_b2CompareA&&_b2CompareB?M(_b2CompareB,_b2CompareA):{aw:0,al:0,ag:0},B=C.map(l=>`<option value="${l.name}"${_b2CompareA===l.name?" selected":""}>${l.name}</option>`).join(""),V=C.map(l=>`<option value="${l.name}"${_b2CompareB===l.name?" selected":""}>${l.name}</option>`).join(""),S=(l,f,m)=>{const s=typeof f=="number"?f:null,r=typeof m=="number"?m:null,a=s!==null&&r!==null&&s>r,t=s!==null&&r!==null&&r>s,e=s!==null&&r!==null?s+r:0,i=e>0?Math.round(s/e*100):50,n=e>0?Math.round(r/e*100):50,o=s!==null&&r!==null&&e>0;return`<div style="padding:7px 0;border-bottom:1px solid var(--border2)">
      <div style="display:grid;grid-template-columns:1fr auto 1fr;gap:8px;align-items:center;margin-bottom:${o?"5px":"0"}">
        <div style="text-align:right;font-size:13px;font-weight:${a?"900":"600"};color:${a?p:"var(--text2)"}">
          ${a?"\u25B2 ":""}${f}
        </div>
        <div style="font-size:10px;color:var(--text3);font-weight:700;text-align:center;white-space:nowrap;min-width:58px">${l}</div>
        <div style="text-align:left;font-size:13px;font-weight:${t?"900":"600"};color:${t?h:"var(--text2)"}">
          ${m}${t?" \u25B2":""}
        </div>
      </div>
      ${o?`<div style="display:flex;height:5px;border-radius:3px;overflow:hidden;background:var(--border2)">
        <div style="width:${i}%;background:${a?p:p+"88"};transition:width .5s ease"></div>
        <div style="width:${n}%;background:${t?h:h+"88"};transition:width .5s ease"></div>
      </div>`:""}
    </div>`},D=(l,f)=>{if(!l||!f)return"";const m=typeof TIERS!="undefined"?TIERS:[],s=w=>{const T=m.indexOf(w);return T<0?0:Math.max(0,(m.length-T)*10)},r=(w,T)=>Math.min(1,T>0?w/T:0),a=w=>w.tiered.reduce((T,z)=>T+s(z.tier||""),0)+w.total*5,t=a(l),e=a(f),i=[{label:"\uC804\uB825",vA:r(t,Math.max(t,e,1)),vB:r(e,Math.max(t,e,1))},{label:"\uC2B9\uB960",vA:l.wr!==null?l.wr/100:0,vB:f.wr!==null?f.wr/100:0},{label:"\uACBD\uAE30\uC218",vA:r(l.tg,Math.max(l.tg,f.tg,1)),vB:r(f.tg,Math.max(l.tg,f.tg,1))},{label:"\uD504\uB85C\uD1A0\uC2A4",vA:r(l.races.P,Math.max(l.races.P,f.races.P,1)),vB:r(f.races.P,Math.max(l.races.P,f.races.P,1))},{label:"\uD14C\uB780",vA:r(l.races.T,Math.max(l.races.T,f.races.T,1)),vB:r(f.races.T,Math.max(l.races.T,f.races.T,1))},{label:"\uC800\uADF8",vA:r(l.races.Z,Math.max(l.races.Z,f.races.Z,1)),vB:r(f.races.Z,Math.max(l.races.Z,f.races.Z,1))}],n=i.length,o=120,c=120,d=90,g=w=>Math.PI*2/n*w-Math.PI/2,$=(w,T)=>{const z=g(T),Z=w*d;return`${(o+Math.cos(z)*Z).toFixed(1)},${(c+Math.sin(z)*Z).toFixed(1)}`},k=w=>i.map((T,z)=>$(w(z),z)).join(" ");let _="";[.25,.5,.75,1].forEach(w=>{const T=i.map((z,Z)=>{const U=g(Z);return`${(o+Math.cos(U)*d*w).toFixed(1)},${(c+Math.sin(U)*d*w).toFixed(1)}`}).join(" ");_+=`<polygon points="${T}" fill="none" stroke="var(--border2)" stroke-width="1"/>`});const L=i.map((w,T)=>{const z=g(T);return`<line x1="${o}" y1="${c}" x2="${(o+Math.cos(z)*d).toFixed(1)}" y2="${(c+Math.sin(z)*d).toFixed(1)}" stroke="var(--border2)" stroke-width="1"/>`}).join(""),W=i.map((w,T)=>{const z=g(T),Z=(o+Math.cos(z)*(d+18)).toFixed(1),U=(c+Math.sin(z)*(d+18)).toFixed(1);return`<text x="${Z}" y="${U}" text-anchor="middle" dominant-baseline="middle" font-size="10" font-weight="700" fill="var(--text3)">${w.label}</text>`}).join("");return`<div style="display:flex;justify-content:center;margin:8px 0 4px">
      <svg width="240" height="240" viewBox="0 0 240 240" style="overflow:visible">
        ${_}${L}
        <polygon points="${k(w=>i[w].vA)}" fill="${p}" fill-opacity="0.18" stroke="${p}" stroke-width="2" stroke-linejoin="round"/>
        <polygon points="${k(w=>i[w].vB)}" fill="${h}" fill-opacity="0.18" stroke="${h}" stroke-width="2" stroke-linejoin="round" stroke-dasharray="5 3"/>
        ${W}
      </svg>
    </div>
    <div style="display:flex;justify-content:center;gap:16px;font-size:11px;font-weight:700">
      <span style="color:${p}">\u2501 ${_b2CompareA}</span>
      <span style="color:${h}">\u254C ${_b2CompareB}</span>
    </div>`};let u=`<style>
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
          style="width:100%;padding:8px 12px;border-radius:10px;border:2px solid ${p};font-size:13px;font-weight:700;background:var(--white);color:${p};cursor:pointer">
          ${B}
        </select>
      </div>
      <div style="text-align:center;font-size:18px;font-weight:900;color:var(--text3)">VS</div>
      <div>
        <select onchange="if(this.value===_b2CompareA){this.value=_b2CompareB;return;}; _b2CompareB=this.value;document.getElementById('b2-content').innerHTML=_b2CompareView()"
          style="width:100%;padding:8px 12px;border-radius:10px;border:2px solid ${h};font-size:13px;font-weight:700;background:var(--white);color:${h};cursor:pointer">
          ${V}
        </select>
      </div>
    </div>
    ${_b2CompareA===_b2CompareB?'<div style="text-align:center;padding:10px;color:#b45309;font-size:12px;font-weight:700;background:#fef9c3;border-radius:10px;margin-bottom:8px">\u26A0\uFE0F \uAC19\uC740 \uB300\uD559\uC744 \uC120\uD0DD\uD558\uBA74 \uBE44\uAD50\uAC00 \uC758\uBBF8 \uC5C6\uC2B5\uB2C8\uB2E4. \uB2E4\uB978 \uB300\uD559\uC744 \uC120\uD0DD\uD574 \uC8FC\uC138\uC694.</div>':""}`;if(b&&x){u+=`<div class="b2cv2-header">
      <div class="b2cv2-col" style="background:${p}15;border:2px solid ${p}44">
        <div style="font-size:22px;font-weight:900;color:${p}">${b.total}</div>
        <div style="font-size:12px;color:var(--text3)">\uCD1D \uC778\uC6D0</div>
        ${b.wr!==null?`<div style="font-size:14px;font-weight:900;color:${b.wr>=50?"#10b981":"#ef4444"};margin-top:4px">${b.wr}% \uC2B9\uB960</div>`:""}
      </div>
      <div class="b2cv2-col" style="background:${h}15;border:2px solid ${h}44">
        <div style="font-size:22px;font-weight:900;color:${h}">${x.total}</div>
        <div style="font-size:12px;color:var(--text3)">\uCD1D \uC778\uC6D0</div>
        ${x.wr!==null?`<div style="font-size:14px;font-weight:900;color:${x.wr>=50?"#10b981":"#ef4444"};margin-top:4px">${x.wr}% \uC2B9\uB960</div>`:""}
      </div>
    </div>`;{const r=A.aw+P.aw,a=r>0?Math.round(A.aw/r*100):50,t=r>0?Math.round(A.aw/r*100):null,e=r>0?Math.round(P.aw/r*100):null;r>0?u+=`<div class="b2cv2-h2h">
          <div style="font-size:12px;font-weight:800;color:var(--text3);margin-bottom:8px">\u2694\uFE0F \uC9C1\uC811 \uB9DE\uB300\uACB0 \uC804\uC801 <span style="font-size:10px;font-weight:600;color:var(--text3)">(\uCD1D ${r}\uC804)</span></div>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px">
            <div style="text-align:right;min-width:70px">
              <div style="font-size:16px;font-weight:900;color:${p}">${A.aw}\uC2B9 ${A.al}\uD328</div>
              ${t!==null?`<div style="font-size:11px;font-weight:800;color:${t>=50?p:"var(--text3)"}">${t}%</div>`:""}
            </div>
            <div style="flex:1;height:14px;border-radius:7px;overflow:hidden;background:var(--border2);display:flex">
              <div style="width:${a}%;background:${p};height:100%;transition:width .6s ease"></div>
              <div style="width:${100-a}%;background:${h};height:100%;transition:width .6s ease"></div>
            </div>
            <div style="text-align:left;min-width:70px">
              <div style="font-size:16px;font-weight:900;color:${h}">${P.aw}\uC2B9 ${P.al}\uD328</div>
              ${e!==null?`<div style="font-size:11px;font-weight:800;color:${e>=50?h:"var(--text3)"}">${e}%</div>`:""}
            </div>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:11px">
            <span style="color:${p};font-weight:800">${_b2CompareA}</span>
            <span style="color:var(--text3)">${a>50?_b2CompareA+"\uC774 \uC6B0\uC138":a<50?_b2CompareB+"\uC774 \uC6B0\uC138":"\uADE0\uD615"}</span>
            <span style="color:${h};font-weight:800">${_b2CompareB}</span>
          </div>
        </div>`:u+=`<div class="b2cv2-h2h" style="color:var(--text3);font-size:12px">
          \u2694\uFE0F \uC9C1\uC811 \uB9DE\uB300\uACB0 \uAE30\uB85D \uC5C6\uC74C <span style="font-size:11px">(\uACBD\uAE30 \uB370\uC774\uD130 \uB204\uC801 \uC2DC \uD45C\uC2DC)</span>
        </div>`}u+=`<div class="b2cv2-col" style="background:var(--surface);border:1px solid var(--border2);border-radius:14px;margin-bottom:12px;padding:14px">
      <div style="font-size:12px;font-weight:800;color:var(--text3);margin-bottom:4px;text-align:center">\u{1F4E1} \uB2E4\uCC28\uC6D0 \uBE44\uAD50</div>
      ${D(b,x)}
    </div>`,u+=`<div style="display:grid;grid-template-columns:1fr auto 1fr;gap:8px;align-items:center;padding:8px 0;border-bottom:2px solid var(--border2);margin-bottom:4px">
      <div style="text-align:right;font-size:14px;font-weight:900;color:${p}">${_b2CompareA}</div>
      <div style="width:60px;text-align:center"></div>
      <div style="text-align:left;font-size:14px;font-weight:900;color:${h}">${_b2CompareB}</div>
    </div>`,u+=S("\uC120\uC218 \uC218",b.tiered.length,x.tiered.length),u+=S("\uC9C1\uCC45\uC790",b.roled.length,x.roled.length),u+=S("\uD1B5\uC0B0 \uACBD\uAE30",b.tg,x.tg),u+=S("\uD1B5\uC0B0 \uC2B9",b.tw,x.tw),u+=S(b.wr!==null?`\uC2B9\uB960 (${b.wr}%)`:"\uC2B9\uB960",(R=b.wr)!=null?R:0,(E=x.wr)!=null?E:0),u+=`<div style="text-align:center;font-size:10px;color:var(--text3);font-weight:700;margin:6px 0 2px">\u{1F3AE} \uC885\uC871 \uBD84\uD3EC (\uC804\uCCB4 ${b.total}\uBA85 / ${x.total}\uBA85 \uAE30\uC900)</div>`,u+=S("\u{1F52E} \uD504\uB85C\uD1A0\uC2A4",b.races.P,x.races.P),u+=S("\u2694\uFE0F \uD14C\uB780",b.races.T,x.races.T),u+=S("\u{1F98E} \uC800\uADF8",b.races.Z,x.races.Z),(b.races.N>0||x.races.N>0)&&(u+=S("\u2754 \uC885\uC871 \uBBF8\uC815",b.races.N,x.races.N)),u+=S("\uCD5C\uC0C1\uC704 \uD2F0\uC5B4",b.topTier,x.topTier);const l=[...new Set([...Object.keys(b.tiers),...Object.keys(x.tiers)])],f=(typeof TIERS!="undefined"?TIERS.filter(r=>l.includes(r)):[]).concat(l.filter(r=>typeof TIERS=="undefined"||!TIERS.includes(r)));f.length&&(u+='<div style="margin-top:12px;font-size:12px;font-weight:700;color:var(--text3);text-align:center;margin-bottom:8px">\uD2F0\uC5B4\uBCC4 \uBE44\uAD50</div>',f.forEach(r=>{const a=b.tiers[r]||0,t=x.tiers[r]||0,e=typeof getTierBtnColor=="function"?getTierBtnColor(r):"#64748b",i=typeof getTierBtnTextColor=="function"&&getTierBtnTextColor(r)||"#fff",n=Math.max(a,t,1);u+=`<div style="display:grid;grid-template-columns:1fr 52px 1fr;gap:6px;align-items:center;margin-bottom:6px">
          <div style="display:flex;justify-content:flex-end">
            <div style="height:10px;width:${Math.round(a/n*100)}%;max-width:100%;background:${a>t?p:p+"88"};border-radius:5px 0 0 5px;min-width:${a?"8px":"0"}"></div>
          </div>
          <div style="text-align:center;font-size:11px;font-weight:800;padding:2px 6px;border-radius:8px;background:${e};color:${i}">${r}</div>
          <div>
            <div style="height:10px;width:${Math.round(t/n*100)}%;max-width:100%;background:${t>a?h:h+"88"};border-radius:0 5px 5px 0;min-width:${t?"8px":"0"}"></div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 52px 1fr;gap:6px;margin-bottom:4px">
          <div style="text-align:right;font-size:11px;color:${a>t?p:"var(--text3)"};font-weight:${a>t?"800":"400"}">${a?a+"\uBA85":""}</div>
          <div></div>
          <div style="font-size:11px;color:${t>a?h:"var(--text3)"};font-weight:${t>a?"800":"400"}">${t?t+"\uBA85":""}</div>
        </div>`}));const m=r=>r.slice().sort((a,t)=>{const e=typeof TIERS!="undefined"?TIERS:[],i=e.indexOf(a.tier||""),n=e.indexOf(t.tier||"");return(i>=0?i:999)-(n>=0?n:999)||(a.name||"").localeCompare(t.name||"","ko",{sensitivity:"base"})}),s=(r,a)=>{const t=m(r.tiered).map(i=>_b2NameTag(i,a,!0)).join(""),e=r.roled.length?`<div style="margin-top:6px;padding-top:6px;border-top:1px dashed var(--border2)">${r.roled.map(i=>_b2NameTag(i,a,!1)).join("")}</div>`:"";return t+e};u+=`<div style="background:var(--surface);border:1px solid var(--border2);border-radius:14px;padding:12px;margin-top:14px">
      <div style="font-size:11px;font-weight:800;color:var(--text3);margin-bottom:10px;text-align:center">\u{1F465} \uC120\uC218 \uBA85\uB2E8 (\uD074\uB9AD\uD558\uC5EC \uC0C1\uC138 \uBCF4\uAE30)</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div>
          <div style="font-size:12px;font-weight:900;color:${p};margin-bottom:6px;text-align:center;padding:4px 8px;background:${p}14;border-radius:8px">${_b2CompareA} \xB7 ${b.tiered.length}\uBA85</div>
          <div style="display:flex;flex-wrap:wrap;gap:2px">${s(b,p)}</div>
        </div>
        <div>
          <div style="font-size:12px;font-weight:900;color:${h};margin-bottom:6px;text-align:center;padding:4px 8px;background:${h}14;border-radius:8px">${_b2CompareB} \xB7 ${x.tiered.length}\uBA85</div>
          <div style="display:flex;flex-wrap:wrap;gap:2px">${s(x,h)}</div>
        </div>
      </div>
    </div>`}return u+="</div>",u}window._b2HeatmapMode=window._b2HeatmapMode||"count",window._b2HeatmapSortRow=window._b2HeatmapSortRow||"name",window._b2HeatmapSortCol=window._b2HeatmapSortCol||"tier";

/* board2-heatmap-bubble.js */
function _b2HeatmapCloseAll(){try{document.querySelectorAll(".b2hm2-popup").forEach(p=>p.classList.remove("show"))}catch(p){}}function _b2HeatmapCellClick(p){try{if(!p||!p.dataset)return;const T=p.dataset.hmUid||"",x=p.dataset.hmUniv||"",u=p.dataset.hmTier||"",S=p.dataset.hmColor||"#64748b";if(!T||!x||!u)return;_b2HeatmapCloseAll(),typeof _b2HeatmapShowPopup=="function"&&_b2HeatmapShowPopup(T,x,u,S)}catch(T){}}function _b2HeatmapTotalClick(p){try{if(!p||!p.dataset)return;const T=p.dataset.hmUid||"",x=p.dataset.hmUniv||"",u=p.dataset.hmColor||"#64748b";if(!T||!x)return;_b2HeatmapCloseAll(),typeof _b2HeatmapShowAllPopup=="function"&&_b2HeatmapShowAllPopup(T,x,u)}catch(T){}}function _b2HeatmapShowPopup(p,T,x,u){try{const S=document.getElementById(p+"-popup"),n=document.getElementById(p+"-popup-header"),l=document.getElementById(p+"-popup-body");if(!S||!l)return;const g=typeof escHTML=="function"?escHTML:i=>String(i||""),C=typeof escAttr=="function"?escAttr:i=>String(i||""),$=(Array.isArray(window.players)?window.players:[]).filter(i=>{const f=String(i&&i.univ||"").trim(),c=String(i&&i.tier||"\uBBF8\uC815");return f===T&&c===x&&!(i&&(i.hidden||i.retired||i.hideFromBoard))});if(!$.length)return;let v=0,k=0;$.forEach(i=>(Array.isArray(i&&i.history)?i.history:[]).forEach(f=>{f&&f.result==="\uC2B9"?v++:f&&f.result==="\uD328"&&k++}));const y=v+k,w=y>0?Math.round(v/y*100):null,z=w===null?"#94a3b8":w>=60?"#10b981":w>=40?"#f59e0b":"#ef4444",{fromN:I,toN:P}=_b2ThisWeekRange(),M=_b2DateNum;let A=0,m=0;$.forEach(i=>(Array.isArray(i&&i.history)?i.history:[]).forEach(f=>{const c=M(f&&(f.date||f.d||""));c>=I&&c<=P&&(f&&f.result==="\uC2B9"?A++:f&&f.result==="\uD328"&&m++)}));const r=typeof getTierBtnColor=="function"&&x?getTierBtnColor(x):"#64748b",h=typeof getTierBtnTextColor=="function"&&x&&getTierBtnTextColor(x)||"#fff";n&&(n.innerHTML='<div style="display:flex;align-items:center;gap:10px"><div style="width:12px;height:12px;border-radius:50%;background:'+u+";flex-shrink:0;box-shadow:0 0 0 3px "+u+'30"></div><span style="font-size:16px;font-weight:900;color:'+u+';">'+g(T)+'</span><span style="font-size:12px;padding:3px 10px;border-radius:20px;background:'+r+";color:"+h+';font-weight:800;letter-spacing:.3px">'+g(x)+'</span><div style="margin-left:auto;text-align:right">'+(w!==null?'<div style="font-size:18px;font-weight:900;color:'+z+'">'+w+'%</div><div style="font-size:10px;color:var(--text3);">'+v+"\uC2B9 "+k+"\uD328</div>":'<div style="font-size:13px;color:var(--text3)">\uAE30\uB85D \uC5C6\uC74C</div>')+"</div></div>");let b="";b+='<div class="b2hm2-stat-row"><div class="b2hm2-stat-box" style="background:'+u+"0d;border-color:"+u+'22"><div style="font-size:22px;font-weight:900;color:'+u+'">'+$.length+'</div><div style="font-size:10px;color:var(--text3);font-weight:700">\uCD1D \uC778\uC6D0</div></div>',y>0&&(b+='<div class="b2hm2-stat-box" style="background:'+z+"12;border-color:"+z+'30"><div style="font-size:22px;font-weight:900;color:'+z+'">'+w+'%</div><div style="font-size:10px;color:var(--text3);font-weight:700">'+v+"\uC2B9 "+k+"\uD328</div></div>"),A+m>0&&(b+='<div class="b2hm2-stat-box" style="background:#fff7ed;border-color:#fed7aa"><div style="font-size:20px;font-weight:900;color:#c2410c">\u{1F525} '+A+'\uC2B9</div><div style="font-size:10px;color:#c2410c;font-weight:700">\uC774\uBC88\uC8FC '+m+"\uD328</div></div>"),b+="</div>",b+='<div style="font-size:11px;font-weight:800;color:var(--text3);margin-bottom:10px;display:flex;align-items:center;gap:6px"><span style="width:20px;height:2px;background:var(--border2);display:inline-block;border-radius:1px"></span>'+$.length+'\uBA85<span style="flex:1;height:1px;background:var(--border2);display:inline-block;border-radius:1px"></span></div>',b+='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(84px,1fr));gap:8px">',$.sort((i,f)=>String(i&&i.name||"").localeCompare(String(f&&f.name||""),"ko",{sensitivity:"base"})).forEach(i=>{const f=i&&i.race==="P"?"\u{1F52E}":i&&i.race==="T"?"\u2694\uFE0F":i&&i.race==="Z"?"\u{1F98E}":"",c=i&&i.photo?typeof toHttpsUrl=="function"?toHttpsUrl(i.photo):i.photo:"",t=c?C(c):"",e=String(i&&i.name||"?").slice(0,1);let o=0,s=0;(Array.isArray(i&&i.history)?i.history:[]).forEach(_=>{_&&_.result==="\uC2B9"?o++:_&&_.result==="\uD328"&&s++});const a=o+s,d=a>0?Math.round(o/a*100):null,E=d===null?"#94a3b8":d>=60?"#10b981":d>=40?"#f59e0b":"#ef4444",R=C(i&&i.name||""),B=typeof getTierBtnColor=="function"&&i&&i.tier?getTierBtnColor(i.tier):"#64748b",H=typeof getTierBtnTextColor=="function"&&i&&i.tier&&getTierBtnTextColor(i.tier)||"#fff";b+='<div class="b2hm2-pcard" style="border-color:'+u+`55" onclick="openPlayerModal('`+R.replace(/'/g,"\\'")+`')">`,t?b+='<img class="b2hm2-pcard-photo" src="'+t+`" onerror="this.style.display='none';this.nextSibling.style.display='flex'"><div class="b2hm2-pcard-avatar" style="display:none;background:linear-gradient(160deg,`+u+"44,"+u+"22);color:"+u+'">'+g(e)+"</div>":b+='<div class="b2hm2-pcard-avatar" style="background:linear-gradient(160deg,'+u+"44,"+u+"22);color:"+u+'">'+g(e)+"</div>",b+='<div class="b2hm2-pcard-info">',i&&i.tier&&(b+='<span style="font-size:9px;font-weight:900;background:'+B+";color:"+H+';border-radius:4px;padding:1px 5px;margin-bottom:2px;line-height:1.6">'+g(i.tier)+"</span>"),b+='<div class="b2hm2-pcard-name">'+g(i&&i.name||"")+"</div>",b+='<div class="b2hm2-pcard-sub">'+(f?"<span>"+f+"</span>":"")+(d!==null?'<span style="color:'+E+';font-weight:900">'+d+"%</span>":"")+"</div>",b+="</div>",b+="</div>"}),b+="</div>",l.innerHTML=b,S.classList.add("show")}catch(S){}}function _b2HeatmapShowAllPopup(p,T,x){try{const u=document.getElementById(p+"-popup"),S=document.getElementById(p+"-popup-header"),n=document.getElementById(p+"-popup-body");if(!u||!n)return;const l=typeof escHTML=="function"?escHTML:r=>String(r||""),g=typeof escAttr=="function"?escAttr:r=>String(r||""),C=(Array.isArray(window.players)?window.players:[]).filter(r=>String(r&&r.univ||"").trim()===T&&!(r&&(r.hidden||r.retired||r.hideFromBoard)));if(!C.length)return;let $=0,v=0;C.forEach(r=>(Array.isArray(r&&r.history)?r.history:[]).forEach(h=>{h&&h.result==="\uC2B9"?$++:h&&h.result==="\uD328"&&v++}));const k=$+v,y=k>0?Math.round($/k*100):null,w=y===null?"#94a3b8":y>=60?"#10b981":y>=40?"#f59e0b":"#ef4444",{fromN:z,toN:I}=_b2ThisWeekRange(),P=_b2DateNum;let M=0,A=0;C.forEach(r=>(Array.isArray(r&&r.history)?r.history:[]).forEach(h=>{const b=P(h&&(h.date||h.d||""));b>=z&&b<=I&&(h&&h.result==="\uC2B9"?M++:h&&h.result==="\uD328"&&A++)})),S&&(S.innerHTML='<div style="display:flex;align-items:center;gap:10px"><div style="width:12px;height:12px;border-radius:50%;background:'+x+";flex-shrink:0;box-shadow:0 0 0 3px "+x+'30"></div><span style="font-size:16px;font-weight:900;color:'+x+';">'+l(T)+'</span><div style="margin-left:auto;text-align:right">'+(y!==null?'<div style="font-size:18px;font-weight:900;color:'+w+'">'+y+'%</div><div style="font-size:10px;color:var(--text3);">'+$+"\uC2B9 "+v+"\uD328</div>":'<div style="font-size:13px;color:var(--text3)">\uAE30\uB85D \uC5C6\uC74C</div>')+"</div></div>");let m="";m+='<div class="b2hm2-stat-row"><div class="b2hm2-stat-box" style="background:'+x+"0d;border-color:"+x+'22"><div style="font-size:22px;font-weight:900;color:'+x+'">'+C.length+'</div><div style="font-size:10px;color:var(--text3);font-weight:700">\uCD1D \uC778\uC6D0</div></div>',k>0&&(m+='<div class="b2hm2-stat-box" style="background:'+w+"12;border-color:"+w+'30"><div style="font-size:22px;font-weight:900;color:'+w+'">'+y+'%</div><div style="font-size:10px;color:var(--text3);font-weight:700">'+$+"\uC2B9 "+v+"\uD328</div></div>"),M+A>0&&(m+='<div class="b2hm2-stat-box" style="background:#fff7ed;border-color:#fed7aa"><div style="font-size:20px;font-weight:900;color:#c2410c">\u{1F525} '+M+'\uC2B9</div><div style="font-size:10px;color:#c2410c;font-weight:700">\uC774\uBC88\uC8FC '+A+"\uD328</div></div>"),m+="</div>",m+='<div style="font-size:11px;font-weight:800;color:var(--text3);margin-bottom:10px;display:flex;align-items:center;gap:6px"><span style="width:20px;height:2px;background:var(--border2);display:inline-block;border-radius:1px"></span>'+C.length+'\uBA85<span style="flex:1;height:1px;background:var(--border2);display:inline-block;border-radius:1px"></span></div>',m+='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(84px,1fr));gap:8px">',C.sort((r,h)=>String(r&&r.name||"").localeCompare(String(h&&h.name||""),"ko",{sensitivity:"base"})).forEach(r=>{const h=r&&r.race==="P"?"\u{1F52E}":r&&r.race==="T"?"\u2694\uFE0F":r&&r.race==="Z"?"\u{1F98E}":"",b=r&&r.photo?typeof toHttpsUrl=="function"?toHttpsUrl(r.photo):r.photo:"",i=b?g(b):"",f=String(r&&r.name||"?").slice(0,1),c=(typeof gc=="function"?gc(r&&r.univ):null)||x;let t=0,e=0;(Array.isArray(r&&r.history)?r.history:[]).forEach(B=>{B&&B.result==="\uC2B9"?t++:B&&B.result==="\uD328"&&e++});const o=t+e,s=o>0?Math.round(t/o*100):null,a=s===null?"#94a3b8":s>=60?"#10b981":s>=40?"#f59e0b":"#ef4444",d=g(r&&r.name||""),E=typeof getTierBtnColor=="function"&&r&&r.tier?getTierBtnColor(r.tier):"#64748b",R=typeof getTierBtnTextColor=="function"&&r&&r.tier&&getTierBtnTextColor(r.tier)||"#fff";m+='<div class="b2hm2-pcard" style="border-color:'+c+`55" onclick="openPlayerModal('`+safeNameAttr.replace(/'/g,"\\'")+`')">`,i?m+='<img class="b2hm2-pcard-photo" src="'+i+`" onerror="this.style.display='none';this.nextSibling.style.display='flex'"><div class="b2hm2-pcard-avatar" style="display:none;background:linear-gradient(160deg,`+c+"44,"+c+"22);color:"+c+'">'+l(f)+"</div>":m+='<div class="b2hm2-pcard-avatar" style="background:linear-gradient(160deg,'+c+"44,"+c+"22);color:"+c+'">'+l(f)+"</div>",m+='<div class="b2hm2-pcard-info">',r&&r.tier&&(m+='<span style="font-size:9px;font-weight:900;background:'+E+";color:"+R+';border-radius:4px;padding:1px 5px;margin-bottom:2px;line-height:1.6">'+l(r.tier)+"</span>"),m+='<div class="b2hm2-pcard-name">'+l(r&&r.name||"")+"</div>",m+='<div class="b2hm2-pcard-sub">'+(h?"<span>"+h+"</span>":"")+(s!==null?'<span style="color:'+a+';font-weight:900">'+s+"%</span>":"")+"</div>",m+="</div>",m+="</div>"}),m+="</div>",n.innerHTML=m,u.classList.add("show")}catch(u){}}function _b2HeatmapView(){const p="hm_"+Math.random().toString(36).slice(2,7),T=new Set((typeof univCfg!="undefined"?univCfg:[]).filter(t=>t.dissolved||t.hidden).map(t=>String(t.name||"").trim())),x=(_b2VisUnivs?_b2VisUnivs():[]).filter(t=>t.name&&t.name!=="\uBB34\uC18C\uC18D"),u=players.filter(t=>!t.hidden&&!t.retired&&!t.hideFromBoard&&!T.has(String((t==null?void 0:t.univ)||"").trim())),S=typeof TIERS!="undefined"?TIERS:[],n=window._b2HeatmapMode||"count",l=window._b2HeatmapSortRow||"name",g=window._b2HeatmapSortCol||"tier",C=[...new Set(u.map(t=>t.tier||"\uBBF8\uC815"))];let $=S.filter(t=>C.includes(t)).concat(C.filter(t=>!S.includes(t)));const v={};x.forEach(t=>{v[t.name]={}}),u.forEach(t=>{const e=String((t==null?void 0:t.univ)||"").trim(),o=t.tier||"\uBBF8\uC815";v[e]||(v[e]={}),v[e][o]||(v[e][o]={count:0,wins:0,losses:0}),v[e][o].count++,(Array.isArray(t.history)?t.history:[]).forEach(s=>{s.result==="\uC2B9"?v[e][o].wins++:s.result==="\uD328"&&v[e][o].losses++})});const k={};x.forEach(t=>{let e=0,o=0,s=0;$.forEach(a=>{var E;const d=(E=v[t.name])==null?void 0:E[a];d&&(e+=d.count,o+=d.wins,s+=d.losses)}),k[t.name]={count:e,wins:o,losses:s,wr:o+s>0?Math.round(o/(o+s)*100):null}});const y={};$.forEach(t=>{let e=0,o=0,s=0;x.forEach(a=>{var E;const d=(E=v[a.name])==null?void 0:E[t];d&&(e+=d.count,o+=d.wins,s+=d.losses)}),y[t]={count:e,wins:o,losses:s,wr:o+s>0?Math.round(o/(o+s)*100):null}});let w=[...x];l==="name"&&w.sort((t,e)=>(t.name||"").localeCompare(e.name||"","ko")),l==="count"&&w.sort((t,e)=>{var o,s;return(((o=k[e.name])==null?void 0:o.count)||0)-(((s=k[t.name])==null?void 0:s.count)||0)}),l==="wr"&&w.sort((t,e)=>{var o,s,a,d;return((s=(o=k[e.name])==null?void 0:o.wr)!=null?s:-1)-((d=(a=k[t.name])==null?void 0:a.wr)!=null?d:-1)});let z=[...$];g==="count"&&z.sort((t,e)=>{var o,s;return(((o=y[e])==null?void 0:o.count)||0)-(((s=y[t])==null?void 0:s.count)||0)}),g==="wr"&&z.sort((t,e)=>{var o,s,a,d;return((s=(o=y[e])==null?void 0:o.wr)!=null?s:-1)-((d=(a=y[t])==null?void 0:a.wr)!=null?d:-1)});const I=t=>{const e=String(t||"").trim().replace("#","");if(e.length===3){const o=parseInt(e[0]+e[0],16),s=parseInt(e[1]+e[1],16),a=parseInt(e[2]+e[2],16);return[o,s,a].some(d=>isNaN(d))?null:{r:o,g:s,b:a}}if(e.length>=6){const o=parseInt(e.slice(0,2),16),s=parseInt(e.slice(2,4),16),a=parseInt(e.slice(4,6),16);return[o,s,a].some(d=>isNaN(d))?null:{r:o,g:s,b:a}}return null},P=(t,e,o)=>{if(!t||e===0)return"transparent";const s=t/e;if(n==="count"){const a=I(o)||I("#3b82f6")||{r:59,g:130,b:246},d=Math.min(.92,Math.max(.12,s*.78+.12));return`rgba(${a.r},${a.g},${a.b},${d.toFixed(2)})`}else{const a=t<50?255:Math.round(255*(1-(t-50)/50)),d=t>50?255:Math.round(255*(t/50));return`rgba(${a},${d},80,0.55)`}},M=(t,e)=>!t||e===0?"var(--text3)":t/e>.55?"#fff":"var(--text1)",A=Math.max(1,...x.flatMap(t=>$.map(e=>{var o,s;return((s=(o=v[t.name])==null?void 0:o[e])==null?void 0:s.count)||0}))),m=[{key:"count",label:"\u{1F465} \uC778\uC6D0\uC218"},{key:"wr",label:"\u{1F4C8} \uC2B9\uB960"}];let r=`<style>
    .b2hm2-wrap { overflow-x:auto; }
    .b2hm2-ctrl { display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:12px;padding:10px 12px;background:var(--surface);border:1px solid var(--border2);border-radius:12px }
    .b2hm2-ctrl-group { display:flex;gap:4px;align-items:center;flex-wrap:wrap }
    .b2hm2-lbl { font-size:11px;font-weight:800;color:var(--text3);margin-right:2px }
    .b2hm2-btn { padding:4px 10px;border-radius:8px;border:1.5px solid var(--border2);background:var(--white);font-size:11px;font-weight:700;color:var(--text2);cursor:pointer;transition:all .12s;user-select:none }
    .b2hm2-btn.on { background:var(--text1);color:var(--white);border-color:var(--text1);box-shadow:inset 0 2px 4px rgba(0,0,0,.25) }
    .b2hm2-btn:not(.on):hover { border-color:var(--text1);color:var(--text1) }
    .b2hm2-btn:not(.on):active { background:var(--border2);transform:scale(.97) }
    .b2hm2-sel { padding:4px 10px;border-radius:8px;border:1.5px solid var(--border2);background:var(--white);font-size:11px;font-weight:700;color:var(--text2);cursor:pointer; }
    .b2hm2-sep { width:1px;height:22px;background:var(--border2);margin:0 4px }
    .b2hm2-tbl { border-collapse:separate;border-spacing:3px;min-width:100% }
    .b2hm2-tbl th { font-size:10px;font-weight:800;color:var(--text3);padding:4px 6px;text-align:center;white-space:nowrap;position:sticky }
    .b2hm2-tbl th.row-head { text-align:left;left:0;top:0;z-index:4;background:var(--bg) }
    .b2hm2-tbl th.col-head { top:0;z-index:2;background:var(--bg) }
    .b2hm2-tbl td { border-radius:8px;text-align:center;font-size:11px;font-weight:800;padding:6px 4px;min-width:44px;cursor:pointer;position:relative;transition:none }
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
    .b2hm2-pcard-name { font-size:11px;font-weight:900;line-height:1.2;color:#fff;text-shadow:0 1px 4px rgba(0,0,0,.5) }
    .b2hm2-pcard-sub { font-size:10px;color:rgba(255,255,255,.8);display:flex;align-items:center;gap:3px;flex-wrap:wrap;justify-content:center }
    .b2hm2-stat-row { display:flex;gap:8px;margin-bottom:12px }
    .b2hm2-stat-box { flex:1;padding:10px 8px;border-radius:12px;text-align:center;border:1.5px solid transparent }
    .b2hm2-week-badge { display:inline-flex;align-items:center;gap:5px;padding:5px 12px;border-radius:20px;background:#fff7ed;border:1px solid #fed7aa;font-size:11px;font-weight:800;color:#c2410c;margin-bottom:12px }
    .b2hm2-tbl td:hover { filter:none;box-shadow:none; }
    .b2hm2-tbl tr:hover td { filter:none; box-shadow:none; }
    .b2hm2-tbl td.univ-name { text-align:left;font-size:11px;font-weight:800;padding:4px 8px;white-space:nowrap;background:var(--bg);color:var(--text1);position:sticky;left:0;z-index:2;min-width:72px }
    .b2hm2-tbl td.total-cell { background:var(--surface);border:1px solid var(--border2);font-weight:900 }
    .b2hm2-legend { display:flex;align-items:center;gap:6px;margin-top:8px;font-size:11px;color:var(--text3) }
    .b2hm2-legend-bar { height:12px;width:120px;border-radius:6px }
    .b2hm2-empty { font-size:11px;color:var(--text3);padding:2px 4px }
  </style>`;r+=`<div class="b2hm2-ctrl">
    <div class="b2hm2-ctrl-group">
      <span class="b2hm2-lbl">\uD45C\uC2DC:</span>
      ${m.map(t=>`<button class="b2hm2-btn${n===t.key?" on":""}" onclick="window._b2HeatmapMode='${t.key}';render()">${t.label}</button>`).join("")}
    </div>
    <div class="b2hm2-sep"></div>
    <div class="b2hm2-ctrl-group">
      <span class="b2hm2-lbl">\uD589 \uC815\uB82C:</span>
      <select class="b2hm2-sel" onchange="window._b2HeatmapSortRow=this.value;render()">
        <option value="name"${l==="name"?" selected":""}>\u{1F524} \uC774\uB984</option>
        <option value="count"${l==="count"?" selected":""}>\u{1F465} \uC778\uC6D0</option>
        <option value="wr"${l==="wr"?" selected":""}>\u{1F4C8} \uC2B9\uB960</option>
      </select>
    </div>
    <div class="b2hm2-sep"></div>
    <div class="b2hm2-ctrl-group">
      <span class="b2hm2-lbl">\uC5F4 \uC815\uB82C:</span>
      <select class="b2hm2-sel" onchange="window._b2HeatmapSortCol=this.value;render()">
        <option value="tier"${g==="tier"?" selected":""}>\u{1F3C5} \uD2F0\uC5B4</option>
        <option value="count"${g==="count"?" selected":""}>\u{1F465} \uC778\uC6D0</option>
        <option value="wr"${g==="wr"?" selected":""}>\u{1F4C8} \uC2B9\uB960</option>
      </select>
    </div>
  </div>`,r+='<div class="b2hm2-wrap"><table class="b2hm2-tbl">';const h=100;r+=`<thead><tr>
    <th class="row-head col-head">\uB300\uD559 \\ \uD2F0\uC5B4</th>
    ${z.map(t=>{const e=typeof getTierBtnColor=="function"?getTierBtnColor(t):"#64748b",o=typeof getTierBtnTextColor=="function"&&getTierBtnTextColor(t)||"#fff",s=y[t],a=n==="count"?`${s.count}\uBA85`:s.wr!==null?`${s.wr}%`:"-";return`<th class="col-head"><div style="display:flex;flex-direction:column;align-items:center;gap:2px">
        <span style="padding:2px 8px;border-radius:6px;background:${e};color:${o}">${t}</span>
        <span style="font-size:9px;font-weight:700;color:var(--text3)">${a}</span>
      </div></th>`}).join("")}
    <th class="col-head" style="border-left:2px solid var(--border2)">\uD569\uACC4</th>
  </tr></thead><tbody>`,w.forEach(t=>{const e=gc&&gc(t.name)||"#64748b",o=k[t.name];o.count&&(r+=`<tr>
      <td class="univ-name" style="border-left:3px solid ${e};background:var(--bg) !important">
        <span style="color:${e}">${t.name}</span>
        <div style="font-size:9px;color:var(--text3);font-weight:600">${n==="count"?`${o.count}\uBA85`:o.wr!==null?`${o.wr}%`:"-"}</div>
      </td>
      ${z.map(s=>{var W;const a=(W=v[t.name])==null?void 0:W[s];if(!a||!a.count)return'<td style="background:var(--bg) !important"><span class="b2hm2-empty">-</span></td>';const d=n==="count"?a.count:a.wins+a.losses>0?Math.round(a.wins/(a.wins+a.losses)*100):0,E=n==="count"?A:100;let R=P(d,E,e),B=M(d,E);const H=n==="count"?`${a.count}\uBA85`:`${d}%`,_=n==="wr"?`${a.wins}\uC2B9${a.losses}\uD328`:"",L=typeof escAttr=="function"?escAttr:O=>String(O||"").replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;"),N=(a.wins||0)+(a.losses||0);return n==="wr"&&N>0&&N<5&&(R="rgba(148,163,184,0.16)",B="var(--text3)"),`<td style="background:${R} !important;color:${B}" title="${t.name} / ${s}: ${a.count}\uBA85 ${a.wins}\uC2B9 ${a.losses}\uD328" data-hm-uid="${p}" data-hm-univ="${L(t.name)}" data-hm-tier="${L(s)}" data-hm-color="${L(e)}" onclick="_b2HeatmapCellClick(this)">
          <div style="font-size:12px;font-weight:900">${H}</div>
          ${_?`<div style="font-size:9px;opacity:.8">${_}</div>`:""}
        </td>`}).join("")}
      <td class="total-cell" style="background:var(--surface) !important;color:${e}; cursor: pointer;" data-hm-uid="${p}" data-hm-univ="${typeof escAttr=="function"?escAttr(t.name):String(t.name||"").replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}" data-hm-color="${typeof escAttr=="function"?escAttr(e):String(e||"").replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}" onclick="_b2HeatmapTotalClick(this)">
        <div>${n==="count"?`${o.count}\uBA85`:o.wr!==null?`${o.wr}%`:"-"}</div>
        ${n==="wr"?`<div style="font-size:9px;color:var(--text3)">${o.wins}\uC2B9${o.losses}\uD328</div>`:`<div style="font-size:9px;color:var(--text3)">${o.wins}\uC2B9${o.losses}\uD328</div>`}
      </td>
    </tr>`)});const b=Object.values(k).reduce((t,e)=>t+e.wins,0),i=Object.values(k).reduce((t,e)=>t+e.losses,0),f=b+i,c=f>0?Math.round(b/f*100):null;return r+=`<tr style="border-top:2px solid var(--border2)">
    <td class="univ-name" style="background:var(--surface) !important;font-weight:900;color:var(--text1)">\uD569\uACC4</td>
    ${z.map(t=>{var s;const e=y[t],o=n==="count"?e.count:(s=e.wr)!=null?s:0;return`<td style="background:var(--surface);font-weight:900;color:var(--text2)">
        <div>${n==="count"?`${e.count}\uBA85`:e.wr!==null?`${e.wr}%`:"-"}</div>
        <div style="font-size:9px;color:var(--text3)">${e.wins}\uC2B9${e.losses}\uD328</div>
      </td>`}).join("")}
    <td class="total-cell" style="background:var(--surface) !important;font-weight:900;color:var(--text1)">
      <div>${n==="count"?`${u.length}\uBA85`:c!==null?`${c}%`:"-"}</div>
      <div style="font-size:9px;color:var(--text3)">${b}\uC2B9${i}\uD328</div>
    </td>
  </tr>`,r+="</tbody></table></div>",r+=`<div id="${p}-popup" class="b2hm2-popup" onclick="if(event.target===this)this.classList.remove('show')">
    <div class="b2hm2-popup-inner">
      <button class="b2hm2-popup-close" onclick="document.getElementById('${p}-popup').classList.remove('show')">\u2715</button>
      <div id="${p}-popup-header" class="b2hm2-popup-header"></div>
      <div id="${p}-popup-body" class="b2hm2-popup-body"></div>
    </div>
  </div>`,n==="count"?r+=`<div class="b2hm2-legend">
      <span>\uC801\uC74C</span>
      <div class="b2hm2-legend-bar" style="background:linear-gradient(90deg,rgba(59,130,246,.12),rgba(59,130,246,.9))"></div>
      <span>\uB9CE\uC74C</span>
    </div>`:r+=`<div class="b2hm2-legend">
      <span>0%</span>
      <div class="b2hm2-legend-bar" style="background:linear-gradient(90deg,rgba(255,80,80,.55),rgba(255,255,80,.4),rgba(80,255,80,.55))"></div>
      <span>100%</span>
    </div>`,r}function _b2BubbleView(){const p=new Set((typeof univCfg!="undefined"?univCfg:[]).filter(l=>l.dissolved||l.hidden).map(l=>String(l.name||"").trim())),T=(_b2VisUnivs?_b2VisUnivs():[]).filter(l=>l.name&&l.name!=="\uBB34\uC18C\uC18D"),x=players.filter(l=>!l.hidden&&!l.retired&&!l.hideFromBoard&&!p.has(String((l==null?void 0:l.univ)||"").trim())&&!_B2_ROLE_ORDER.includes(l.role||"")),u=T.map(l=>{var f;const g=x.filter(c=>String((c==null?void 0:c.univ)||"").trim()===l.name),C=g.filter(c=>c.race==="P").length,$=g.filter(c=>c.race==="T").length,v=g.filter(c=>c.race==="Z").length,k=gc(l.name)||"#64748b";let y=0,w=0;g.forEach(c=>{(Array.isArray(c.history)?c.history:[]).forEach(t=>{t.result==="\uC2B9"?y++:t.result==="\uD328"&&w++})});const z=y+w,I=z>0?Math.round(y/z*100):null,{fromN:P,toN:M}=_b2ThisWeekRange();let A=0;g.forEach(c=>{(Array.isArray(c.history)?c.history:[]).filter(o=>{const s=_b2DateNum(o.date||o.d||"");return s>=P&&s<=M}).length>0&&A++});const m=typeof TIERS!="undefined"?TIERS:[],h=((f=g.slice().sort((c,t)=>{const e=m.indexOf(c.tier||""),o=m.indexOf(t.tier||"");return(e>=0?e:999)-(o>=0?o:999)})[0])==null?void 0:f.tier)||null,b=typeof getTierBtnColor=="function"&&h?getTierBtnColor(h):"#94a3b8",i=typeof getTierBtnTextColor=="function"&&h&&getTierBtnTextColor(h)||"#fff";return{name:l.name,total:g.length,P:C,T:$,Z:v,color:k,wins:y,losses:w,games:z,wr:I,weekActive:A,topTier:h,topTierCol:b,topTierTc:i}}).filter(l=>l.total>0).sort((l,g)=>g.total-l.total),S=JSON.stringify(u),n="bbl_"+Math.random().toString(36).slice(2,8);return`<style>
    #${n}-wrap { position:relative; }
    #${n}-canvas { display:block; width:100%; cursor:pointer; border-radius:12px; }
    #${n}-tooltip { position:absolute; pointer-events:none; opacity:0; background:var(--white); border:1px solid var(--border2); border-radius:14px; padding:14px 16px; box-shadow:0 8px 32px #0003; transition:opacity .15s ease; min-width:180px; z-index:var(--z-dropdown,100); }
    #${n}-legend { display:flex; flex-wrap:wrap; gap:6px; margin-top:10px; }
    .${n}-sort-btn { padding:5px 12px; border-radius:20px; border:1.5px solid var(--border2); background:var(--surface); font-size:12px; font-weight:700; color:var(--text2); cursor:pointer; transition:all .15s; }
    .${n}-sort-btn.on { background:var(--text1); color:var(--white); border-color:var(--text1); }
    .${n}-sort-btn:hover:not(.on) { border-color:var(--text2); }
    #${n}-popup { display:none; position:fixed; inset:0; z-index:999; align-items:center; justify-content:center; background:rgba(0,0,0,.45); }
    #${n}-popup.show { display:flex; }
    #${n}-popup-inner { background:var(--white); border-radius:20px; padding:24px; max-width:340px; width:90%; box-shadow:0 20px 60px #0005; position:relative; animation:b2bblIn .25s ease; }
    @keyframes b2bblIn { from{opacity:0;transform:scale(.92) translateY(12px)} to{opacity:1;transform:none} }
    #${n}-popup-close { position:absolute;top:14px;right:14px;background:none;border:none;font-size:18px;cursor:pointer;color:var(--text3);line-height:1 }
    #${n}-popup-close:hover { color:var(--text1) }
  </style>
  <div id="${n}-wrap">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;flex-wrap:wrap">
      <span style="font-size:13px;font-weight:900;color:var(--text1)">\u{1F310} \uB300\uD559\uBCC4 \uBC84\uBE14\uB9F5</span>
      <span style="font-size:12px;color:var(--text3)">\uBC84\uBE14 \uD06C\uAE30 = \uC778\uC6D0 \xB7 \uD30C\uC774 = \uC885\uC871 \uBE44\uC728</span>
      <div style="margin-left:auto;display:flex;gap:4px;flex-wrap:wrap">
        <button class="${n}-sort-btn on" onclick="_${n}setSort('total',this)">\uC778\uC6D0\uC21C</button>
        <button class="${n}-sort-btn" onclick="_${n}setSort('wr',this)">\uC2B9\uB960\uC21C</button>
        <button class="${n}-sort-btn" onclick="_${n}setSort('P',this)">P\uBE44\uC728</button>
        <button class="${n}-sort-btn" onclick="_${n}setSort('T',this)">T\uBE44\uC728</button>
        <button class="${n}-sort-btn" onclick="_${n}setSort('Z',this)">Z\uBE44\uC728</button>
      </div>
    </div>
    <canvas id="${n}-canvas"></canvas>
    <div id="${n}-tooltip"></div>
    <div id="${n}-legend"></div>
  </div>

  <!-- \uD074\uB9AD \uC0C1\uC138 \uD31D\uC5C5 -->
  <div id="${n}-popup" onclick="if(event.target===this)this.classList.remove('show')">
    <div id="${n}-popup-inner">
      <button id="${n}-popup-close" onclick="document.getElementById('${n}-popup').classList.remove('show')">\u2715</button>
      <div id="${n}-popup-body"></div>
    </div>
  </div>

  <script>
  (function(){
    const RAW = ${S};
    const RACE_COLS = { P:'#7c3aed', T:'#0284c7', Z:'#059669', '?':'#94a3b8' };
    let sortKey = 'total';
    let hovIdx  = -1;
    let bubbles = [];
    let animProgress = 0;
    let animId = null;
    const canvas  = document.getElementById('${n}-canvas');
    const ttip    = document.getElementById('${n}-tooltip');
    const legendEl= document.getElementById('${n}-legend');
    const popup   = document.getElementById('${n}-popup');
    const popBody = document.getElementById('${n}-popup-body');
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
        <div style="font-weight:900;font-size:13px;color:\${b.color};margin-bottom:6px">\${b.name}</div>
        <div style="font-size:12px;font-weight:700;color:#334155;margin-bottom:2px">\u{1F465} \${b.total}\uBA85 \xB7 \uD65C\uC131 \${b.weekActive}\uBA85</div>
        \${b.wr!==null?'<div style="font-size:12px;font-weight:800;color:'+wrCol+'">\u{1F4C8} \uC2B9\uB960 '+b.wr+'% ('+b.wins+'\uC2B9'+b.losses+'\uD328)</div>':''}
        \${b.topTier?'<div style="font-size:11px;margin-top:4px"><span style="padding:1px 6px;border-radius:5px;background:'+b.topTierCol+';color:'+b.topTierTc+';font-size:10px;font-weight:800">TOP '+b.topTier+'</span></div>':''}
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
          <div style="font-size:18px;font-weight:900;color:\${b.color}">\${b.name}</div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">
          <div style="padding:10px;border-radius:12px;background:\${b.color}12;border:1px solid \${b.color}33;text-align:center">
            <div style="font-size:22px;font-weight:900;color:\${b.color}">\${b.total}</div>
            <div style="font-size:11px;color:#94a3b8">\uCD1D \uC778\uC6D0</div>
          </div>
          <div style="padding:10px;border-radius:12px;background:#f59e0b12;border:1px solid #f59e0b33;text-align:center">
            <div style="font-size:22px;font-weight:900;color:#f59e0b">\${b.weekActive}</div>
            <div style="font-size:11px;color:#94a3b8">\uC774\uBC88\uC8FC \uD65C\uB3D9</div>
          </div>
          \${b.wr!==null?'<div style="padding:10px;border-radius:12px;background:'+wrCol+'12;border:1px solid '+wrCol+'33;text-align:center"><div style="font-size:22px;font-weight:900;color:'+wrCol+'">'+b.wr+'%</div><div style="font-size:11px;color:#94a3b8">\uD1B5\uC0B0 \uC2B9\uB960</div></div>':''}
          <div style="padding:10px;border-radius:12px;background:#3b82f612;border:1px solid #3b82f633;text-align:center">
            <div style="font-size:15px;font-weight:900;color:#3b82f6">\${b.wins}\uC2B9 \${b.losses}\uD328</div>
            <div style="font-size:11px;color:#94a3b8">\uD1B5\uC0B0 \uC804\uC801</div>
          </div>
        </div>
        \${b.topTier?'<div style="margin-bottom:12px"><span style="padding:2px 10px;border-radius:8px;background:'+b.topTierCol+';color:'+b.topTierTc+';font-size:12px;font-weight:800">\u{1F3C5} \uCD5C\uC0C1\uC704 \uD2F0\uC5B4: '+b.topTier+'</span></div>':''}
        <div style="font-size:12px;font-weight:700;color:#94a3b8;margin-bottom:6px">\uC885\uC871 \uAD6C\uC131</div>
        \${[['\u{1F52E}','\uD504\uB85C\uD1A0\uC2A4','#7c3aed',b.P],['\u2694\uFE0F','\uD14C\uB780','#0284c7',b.T],['\u{1F98E}','\uC800\uADF8','#059669',b.Z]].filter(function(r){return r[3]>0;}).map(function(r){var ico=r[0],lbl=r[1],col=r[2],n=r[3];return '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><span>'+ico+'</span><span style="font-size:12px;font-weight:700;min-width:52px;color:'+col+'">'+lbl+'</span><div style="flex:1;height:8px;border-radius:4px;background:#f1f5f9;overflow:hidden"><div style="width:'+pct(n)+'%;height:100%;background:'+col+';border-radius:4px"></div></div><span style="font-size:12px;font-weight:900;color:'+col+'">'+n+'\uBA85 ('+pct(n)+'%)</span></div>';}).join('')}
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

    window['_${n}setSort']=function(key,btn){
      sortKey=key;
      document.querySelectorAll('.${n}-sort-btn').forEach(b=>b.classList.remove('on'));
      btn.classList.add('on');
      hovIdx=-1; bubbles=layout(); startAnim();
    };

    function buildLegend(){
      legendEl.innerHTML = '<span style="font-size:11px;font-weight:700;color:var(--text3)">\uC885\uC871 \uBC94\uB840:</span>' +
        [['#7c3aed','\u{1F52E} \uD504\uB85C\uD1A0\uC2A4'],['#0284c7','\u2694\uFE0F \uD14C\uB780'],['#059669','\u{1F98E} \uC800\uADF8'],['#94a3b8','\u2753 \uBBF8\uC815']].map(function(r){var c=r[0],l=r[1];return '<span style="display:flex;align-items:center;gap:4px;font-size:11px;font-weight:700;color:#334155"><span style="width:10px;height:10px;border-radius:50%;background:'+c+';display:inline-block"></span>'+l+'</span>';}).join('') +
        '<span style="font-size:11px;color:var(--text3);margin-left:6px">\uBC84\uBE14 \uC548 \uC22B\uC790 = \uC778\uC6D0 \xB7 % = \uC2B9\uB960</span>';
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
var P=Object.defineProperty,j=Object.defineProperties;var F=Object.getOwnPropertyDescriptors;var W=Object.getOwnPropertySymbols;var H=Object.prototype.hasOwnProperty,O=Object.prototype.propertyIsEnumerable;var C=(r,s,o)=>s in r?P(r,s,{enumerable:!0,configurable:!0,writable:!0,value:o}):r[s]=o,k=(r,s)=>{for(var o in s||(s={}))H.call(s,o)&&C(r,o,s[o]);if(W)for(var o of W(s))O.call(s,o)&&C(r,o,s[o]);return r},_=(r,s)=>j(r,F(s));function _b2CalcStreak(r,s){const o=[...r].sort((e,a)=>{const d=parseInt(String(e.date||"").replace(/[-\.\/]/g,""))||0,w=parseInt(String(a.date||"").replace(/[-\.\/]/g,""))||0;return w!==d?w-d:(a.time||0)-(e.time||0)});let i=0;for(const e of o)if(e.result===s)i++;else break;return i}function _b2RankSortUnivs(r,s){var o,i,e,a;return s.tw-r.tw||((o=s.wr)!=null?o:-1)-((i=r.wr)!=null?i:-1)||s.tg-r.tg||s.active.length-r.active.length||String(((e=r.u)==null?void 0:e.name)||"").localeCompare(String(((a=s.u)==null?void 0:a.name)||""),"ko",{sensitivity:"base"})}function _b2BuildRankedUnivs(r,s){const o={};return(s||[]).filter(i=>i.tg>0).slice().sort(_b2RankSortUnivs).forEach((i,e)=>{o[i.u.name]=e+1}),(r||[]).filter(i=>i.tg>0).slice().sort(_b2RankSortUnivs).map((i,e)=>{const a=e+1,d=o[i.u.name]||null,w=d?d-a:null;return _(k({},i),{rank:a,prevRank:d,rankDelta:w})})}function _b2BuildMvpCardHtml(r,s,o,i,e){var B,T;if(!r)return"";const a=e||{},d=!!a.isMonthly,w=a.mvpLabel||"MVP",v=a.mvpFxStyleAttr,g=a.mvpFxDesign,$=a.mvpFxOp,h=r.p,l=typeof getTierBtnColor=="function"&&h.tier?getTierBtnColor(h.tier):"#475569",x=typeof getTierBtnTextColor=="function"&&h.tier&&getTierBtnTextColor(h.tier)||"#fff",t=h.photo?typeof toHttpsUrl=="function"?toHttpsUrl(h.photo):h.photo:"",n=String(h.name||"-").trim().slice(0,1),c=String(h.name||"").replace(/\\/g,"\\\\").replace(/'/g,"\\'"),f=o?"b2w2-mvp-worst":s===1?"b2w2-mvp-first":"b2w2-mvp-second",y=i==="b2w2-mvp-card-mini"?o?"3\uB4F1":s===1?"1\uB4F1":"2\uB4F1":o?d?"\uC774\uB2EC\uC758 \uCD5C\uC545":"\uC774\uBC88\uC8FC \uCD5C\uC545":s===1?w:d?"\uC774\uB2EC\uC758 2\uC704":"\uC774\uBC88\uC8FC 2\uC704",b=o?"\u{1F480}":s===1?"\u{1F3C6}":"\u{1F948}",m="b2w2-mvp-sv-win",E="b2w2-mvp-sv-loss",S="b2w2-mvp-sv-rate",A=(N,z,R)=>`<span class="b2w2-mvp-stat"><b class="b2w2-mvp-sv ${R}">${N}</b><i class="b2w2-mvp-sl">${z}</i></span>`,M='<span class="b2w2-mvp-statline-sep"></span>',u=o?`${A(r.losses,"\uD328",E)}${M}${A(r.wins,"\uC2B9",m)}${M}${A(((B=r.winRate)!=null?B:0)+"%","\uC2B9\uB960",S)}`:`${A(r.wins,"\uC2B9",m)}${M}${A(r.losses,"\uD328",E)}${M}${A(((T=r.winRate)!=null?T:0)+"%","\uC2B9\uB960",S)}`;return`<div class="b2w2-mvp-card ${f}${i?" "+i:""}" data-fx="${v}" data-design="${g}" style="--b2mvp-fx-op:${$}" onclick="openPlayerModal('${c}')">
    ${t?`<img class="b2w2-mvp-bg" src="${t}" alt="${h.name||""}"
           onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`:""}
    <div class="b2w2-mvp-bg-fallback" style="${t?"display:none":""}">${n}</div>
    <div class="b2w2-mvp-overlay"></div>
    <div class="b2w2-mvp-top-badge">${g==="ribbon"?y:`${b} ${y}`}</div>
    <div class="b2w2-mvp-bottom">
      <div class="b2w2-mvp-id">
        <div class="b2w2-mvp-name">${h.name||"-"}</div>
        <div class="b2w2-mvp-meta">
          <span class="b2w2-mvp-univ">${String(h.univ||"\uBB34\uC18C\uC18D")}</span>
          ${h.tier?`<span class="b2w2-mvp-tier" style="background:${l};color:${x}">${h.tier}</span>`:""}
        </div>
      </div>
      <div class="b2w2-mvp-statline">
        ${u}
        <div class="b2w2-mvp-statline-form">${_b2WeeklyForm(r.hist)}</div>
      </div>
    </div>
  </div>`}const _b2WeeklyAggregateCache=[],_B2_WEEKLY_AGG_CACHE_MAX=4;function _b2WeeklyAggregate(r,s,o){let i=null;try{let a="";try{a=String(localStorage.getItem("su_last_save_time")||"")}catch(v){}const d=r.map(v=>v&&v.name).join(",");i=`${s}|${o}|${a}|${d}`;const w=_b2WeeklyAggregateCache.find(v=>v.key===i);if(w)return w.result}catch(a){i=null}const e=_b2WeeklyAggregateCompute(r,s,o);return i&&(_b2WeeklyAggregateCache.push({key:i,result:e}),_b2WeeklyAggregateCache.length>_B2_WEEKLY_AGG_CACHE_MAX&&_b2WeeklyAggregateCache.shift()),e}function _b2WeeklyAggregateCompute(r,s,o){const i=t=>parseInt(String(t||"").replace(/[-\.\/]/g,""))||0,e=i(s),a=i(o),d=t=>{const n=i(t);return n>=e&&n<=a},w=t=>{const n=String(t||"").trim();return n&&!["\uC2A4\uD3F0\uC11C","\uC2A4\uD06C\uB9AC\uBBF8\uC9C0","\uC5F0\uC2B5",""].includes(n)},v=t=>{const n=String(t||"").trim();return n.indexOf("\uD504\uB85C\uB9AC\uADF8")!==-1||n.indexOf("\uAC1C\uC778\uC804")!==-1||n.indexOf("\uB05D\uC7A5\uC804")!==-1},g={},$=(t,n,c,f,p)=>{!t||!n||!c||d(n)&&(v(p)||(g[t]||(g[t]=[]),g[t].push({date:n,result:c,oppRace:f||"",mode:p||""})))},h=t=>Array.isArray(t)?t.map(n=>n&&typeof n=="object"?String(n.name||"").trim():String(n||"").trim()).filter(Boolean):String(t||"").split(/[,+，]/).map(n=>n.trim()).filter(Boolean),l=(t,n,c)=>{if(!t||!n||!t.winner)return;const f=Array.isArray(t.teamA)&&t.teamA.length?h(t.teamA):t.a1||t.a2?[t.a1,t.a2].filter(Boolean):h(t.playerA),p=Array.isArray(t.teamB)&&t.teamB.length?h(t.teamB):t.b1||t.b2?[t.b1,t.b2].filter(Boolean):h(t.playerB);if(f.length>=2&&p.length>=2){const y=t.winner==="A"?f:p,b=t.winner==="A"?p:f;return y.forEach(m=>$(m,n,"\uC2B9","",c)),b.forEach(m=>$(m,n,"\uD328","",c)),!0}return!1};try{(typeof indM!="undefined"&&Array.isArray(indM)?indM:[]).forEach(t=>{if(!t||!t.d||!t.wName||!t.lName)return;const n=r.find(f=>f.name===t.wName),c=r.find(f=>f.name===t.lName);$(t.wName,t.d,"\uC2B9",(c==null?void 0:c.race)||"",t.mode||"\uAC1C\uC778\uC804"),$(t.lName,t.d,"\uD328",(n==null?void 0:n.race)||"",t.mode||"\uAC1C\uC778\uC804")})}catch(t){}try{(typeof gjM!="undefined"&&Array.isArray(gjM)?gjM:[]).forEach(t=>{if(!t||!t.d||!t.wName||!t.lName||t._proLabel)return;const n=r.find(f=>f.name===t.wName),c=r.find(f=>f.name===t.lName);$(t.wName,t.d,"\uC2B9",(c==null?void 0:c.race)||"",t.mode||"\uB05D\uC7A5\uC804"),$(t.lName,t.d,"\uD328",(n==null?void 0:n.race)||"",t.mode||"\uB05D\uC7A5\uC804")})}catch(t){}try{(typeof ttM!="undefined"&&Array.isArray(ttM)?ttM:[]).forEach(t=>{!t||!t.d||(t.sets||[]).forEach(n=>{(n.games||[]).forEach(c=>{if(l(c,t.d,"\uD2F0\uC5B4\uB300\uD68C")||!c||!c.playerA||!c.playerB||!c.winner)return;const f=r.find(m=>m.name===c.playerA),p=r.find(m=>m.name===c.playerB),y=c.winner==="A",b=c.winner==="B";$(c.playerA,t.d,y?"\uC2B9":"\uD328",(p==null?void 0:p.race)||"","\uD2F0\uC5B4\uB300\uD68C"),$(c.playerB,t.d,b?"\uC2B9":"\uD328",(f==null?void 0:f.race)||"","\uD2F0\uC5B4\uB300\uD68C")})})})}catch(t){}const x=(t,n)=>{try{(Array.isArray(t)?t:[]).forEach(c=>{!c||!c.d||(c.sets||[]).forEach(f=>{(f.games||[]).forEach(p=>{if(!(!p||!p.winner)&&!l(p,c.d,n)&&p.playerA&&p.playerB){const y=r.find(m=>m.name===p.playerA),b=r.find(m=>m.name===p.playerB);$(p.playerA,c.d,p.winner==="A"?"\uC2B9":"\uD328",(b==null?void 0:b.race)||"",n),$(p.playerB,c.d,p.winner==="B"?"\uC2B9":"\uD328",(y==null?void 0:y.race)||"",n)}})})})}catch(c){}};x(typeof miniM!="undefined"?miniM:[],"\uBBF8\uB2C8\uB300\uC804"),x(typeof univM!="undefined"?univM:[],"\uB300\uD559\uB300\uC804"),x(typeof ckM!="undefined"?ckM:[],"\uB300\uD559CK");try{(typeof tourneys!="undefined"&&Array.isArray(tourneys)?tourneys:[]).forEach(t=>{(t.groups||[]).forEach(n=>{(n.matches||[]).forEach(c=>{!c||!c.d||(c.sets||[]).forEach(f=>{(f.games||[]).forEach(p=>{if(l(p,c.d,"\uB300\uD68C")||!p||!p.playerA||!p.playerB||!p.winner)return;const y=r.find(m=>m.name===p.playerA),b=r.find(m=>m.name===p.playerB);$(p.playerA,c.d,p.winner==="A"?"\uC2B9":"\uD328",(b==null?void 0:b.race)||"","\uB300\uD68C"),$(p.playerB,c.d,p.winner==="B"?"\uC2B9":"\uD328",(y==null?void 0:y.race)||"","\uB300\uD68C")})})})}),Object.values((t.bracket||{}).matchDetails||{}).forEach(n=>{!n||!n.d||(n.sets||[]).forEach(c=>{(c.games||[]).forEach(f=>{if(l(f,n.d,"\uB300\uD68C")||!f||!f.playerA||!f.playerB||!f.winner)return;const p=r.find(b=>b.name===f.playerA),y=r.find(b=>b.name===f.playerB);$(f.playerA,n.d,f.winner==="A"?"\uC2B9":"\uD328",(y==null?void 0:y.race)||"","\uB300\uD68C"),$(f.playerB,n.d,f.winner==="B"?"\uC2B9":"\uD328",(p==null?void 0:p.race)||"","\uB300\uD68C")})})}),(t.normalMatches||[]).forEach(n=>{!n||!n.d||(n.sets||[]).forEach(c=>{(c.games||[]).forEach(f=>{if(l(f,n.d,"\uB300\uD68C")||!f||!f.playerA||!f.playerB||!f.winner)return;const p=r.find(b=>b.name===f.playerA),y=r.find(b=>b.name===f.playerB);$(f.playerA,n.d,f.winner==="A"?"\uC2B9":"\uD328",(y==null?void 0:y.race)||"","\uB300\uD68C"),$(f.playerB,n.d,f.winner==="B"?"\uC2B9":"\uD328",(p==null?void 0:p.race)||"","\uB300\uD68C")})})})})}catch(t){}return r.map(t=>{const n=(Array.isArray(t.history)?t.history:[]).filter(u=>d(u.date||u.d||"")&&!v(u.mode||u.label||u.type||u.kind||u.cat||"")),c=(g[t.name]||[]).filter(u=>!v(u.mode||"")),f=new Set(n.map(u=>`${u.date||u.d||""}|${u.result||""}`)),p=c.filter(u=>!f.has(`${u.date||""}|${u.result||""}`)),y=[...n,...p],b=y.filter(u=>u.result==="\uC2B9").length,m=y.filter(u=>u.result==="\uD328").length,E=b+m,S=y.filter(u=>w(u.mode)),A=y.filter(u=>!w(u.mode)),M={P:{w:0,l:0},T:{w:0,l:0},Z:{w:0,l:0}};return y.forEach(u=>{const B=String(u.oppRace||"").trim().toUpperCase();M[B]&&(u.result==="\uC2B9"?M[B].w++:M[B].l++)}),{p:t,wins:b,losses:m,total:E,winRate:E?Math.round(b/E*100):null,offWins:S.filter(u=>u.result==="\uC2B9").length,offLosses:S.filter(u=>u.result==="\uD328").length,spWins:A.filter(u=>u.result==="\uC2B9").length,spLosses:A.filter(u=>u.result==="\uD328").length,vsRace:M,hist:y}})}function _b2WeeklyUnivStats(r,s,o,i){const e=_b2WeeklyAggregate(r,s,o);return i.map(a=>{const d=e.filter(l=>{var x;return String(((x=l.p)==null?void 0:x.univ)||"").trim()===a.name}),w=d.filter(l=>l.total>0),v=w.reduce((l,x)=>l+x.wins,0),g=w.reduce((l,x)=>l+x.losses,0),$=v+g,h={P:{w:0,l:0},T:{w:0,l:0},Z:{w:0,l:0}};return w.forEach(l=>{["P","T","Z"].forEach(x=>{h[x].w+=l.vsRace[x].w,h[x].l+=l.vsRace[x].l})}),{u:a,members:d,active:w,tw:v,tl:g,tg:$,wr:$?Math.round(v/$*100):null,raceCount:h}}).sort((a,d)=>d.tg-a.tg)}function _b2WeeklyMVP(r){let s=null,o=-1;return r.forEach(i=>{i.active.forEach(e=>{var d;if(e.total<3||String(((d=e.p)==null?void 0:d.gender)||"").trim()!=="F")return;const a=e.wins*3+(e.total>0?e.wins/e.total*10:0)+e.offWins*2;a>o&&(o=a,s=e)})}),s}function _b2WeeklyMVP2(r,s){var a;let o=null,i=-1;const e=((a=s==null?void 0:s.p)==null?void 0:a.name)||null;return r.forEach(d=>{d.active.forEach(w=>{var g,$;if(w.total<3||String(((g=w.p)==null?void 0:g.gender)||"").trim()!=="F"||e&&(($=w.p)==null?void 0:$.name)===e)return;const v=w.wins*3+(w.total>0?w.wins/w.total*10:0)+w.offWins*2;v>i&&(i=v,o=w)})}),o}function _b2WeeklyWorst(r){let s=null,o=-1;return r.forEach(i=>{i.active.forEach(e=>{var d;if(e.total<2||String(((d=e.p)==null?void 0:d.gender)||"").trim()!=="F")return;const a=e.losses*3+(e.total>0?(e.total-e.wins)/e.total*10:0);a>o&&(o=a,s=e)})}),s}function _b2WeeklyUnivMVP(r){const s=(Array.isArray(r)?r:[]).filter(e=>e&&e.total>0).map(e=>{var v;const a=(e.wins||0)-(e.losses||0),d=e.total>0?(v=e.winRate)!=null?v:Math.round((e.wins||0)/e.total*100):null,w=(e.offWins||0)+(e.offLosses||0);return _(k({},e),{netWins:a,offTotal:w,aceQualified:e.total>=3&&(d!=null?d:0)>=50&&a>=1,aceScore:a*100+(d!=null?d:0)*2+w*4+(e.wins||0)})}),o=(e,a)=>{var d,w;return a.aceScore-e.aceScore||a.netWins-e.netWins||((d=a.winRate)!=null?d:-1)-((w=e.winRate)!=null?w:-1)||a.offTotal-e.offTotal||a.total-e.total||a.wins-e.wins},i=s.filter(e=>e.aceQualified).sort(o);return i.length?i[0]:null}function _b2WeeklyForm(r){return[...r].sort((o,i)=>{const e=parseInt(String(o.date||"").replace(/[-\.\/]/g,""))||0,a=parseInt(String(i.date||"").replace(/[-\.\/]/g,""))||0;return e!==a?e-a:(o.time||0)-(i.time||0)}).slice(-5).map(o=>{const i=o.result==="\uC2B9"?"#dc2626":o.result==="\uD328"?"#64748b":"#94a3b8",e=o.result==="\uC2B9"?"W":o.result==="\uD328"?"L":"-";return`<span style="display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;border-radius:50%;background:${i};font-size:9px;color:#fff;font-weight:900;flex-shrink:0">${e}</span>`}).join("")}function _b2WeeklyBarChart(r){const s=r.filter(l=>l.tg>0).slice(0,10);if(!s.length)return"";const o=Math.max(...s.map(l=>l.tg),1),i=28,e=6,a=90,d=160,w=14,g=s.length*(i+e)+w+10,$="100%";let h="";return s.forEach((l,x)=>{const t=w+x*(i+e),n=(gc?gc(l.u.name):"#64748b")||"#64748b",c=`${Math.round(l.tw/o*100)}%`,f=`${Math.round(l.tl/o*100)}%`,p=l.wr!==null?`${l.wr}%`:"-",y=l.wr===null?"#94a3b8":l.wr>=60?"#10b981":l.wr>=40?"#f59e0b":"#ef4444";h+=`
      <text x="${a-6}" y="${t+i/2+4}" text-anchor="end" font-size="11" font-weight="700" fill="var(--text2)" style="font-family:inherit">${l.u.name.length>6?l.u.name.slice(0,6)+"\u2026":l.u.name}</text>
      <rect x="${a}" y="${t}" width="0" height="${i*.55}" rx="3" fill="${n}" opacity="0.85">
        <animate attributeName="width" from="0" to="${c}" dur="0.5s" fill="freeze" calcMode="spline" keySplines="0.4 0 0.2 1"/>
      </rect>
      <rect x="${a}" y="${t+i*.58}" width="0" height="${i*.38}" rx="3" fill="${n}" opacity="0.35">
        <animate attributeName="width" from="0" to="${f}" dur="0.5s" fill="freeze" calcMode="spline" keySplines="0.4 0 0.2 1"/>
      </rect>
      <text x="${a+4}" y="${t+i*.55-5}" font-size="10" fill="${n}" font-weight="800">${l.tw}\uC2B9</text>
      <text x="${a+4}" y="${t+i-4}" font-size="10" fill="${n}" opacity="0.7">${l.tl}\uD328</text>
      <text x="calc(${a}px + ${c})" y="${t+i/2+4}" font-size="12" font-weight="900" fill="${y}" style="font-family:inherit">${p}</text>`}),`<div style="width:100%;overflow:hidden;padding:4px 0">
    <svg viewBox="0 0 520 ${g}" width="100%" style="overflow:visible;display:block">
      <defs>
        <style>.b2wchart-label{font-family:inherit}</style>
      </defs>
      ${s.map((l,x)=>{const t=w+x*(i+e),n=(gc?gc(l.u.name):"#64748b")||"#64748b",c=Math.round(l.tw/o*(520-a-d)),f=Math.round(l.tl/o*(520-a-d)),p=l.wr!==null?`${l.wr}%`:"-",y=l.wr===null?"#94a3b8":l.wr>=60?"#10b981":l.wr>=40?"#f59e0b":"#ef4444",b=l.u.name.length>6?l.u.name.slice(0,6)+"\u2026":l.u.name,m=520-a-d;return`
          <text x="${a-6}" y="${t+i*.62}" text-anchor="end" font-size="11" font-weight="700" fill="var(--text2)">${b}</text>
          <rect x="${a}" y="${t}" width="${c}" height="${i*.52}" rx="3" fill="${n}" opacity="0.9"/>
          <rect x="${a}" y="${t+i*.56}" width="${f}" height="${i*.38}" rx="3" fill="${n}" opacity="0.3"/>
          ${l.tw>0?`<text x="${a+c+4}" y="${t+i*.44}" font-size="10" font-weight="900" fill="${n}">${l.tw}\uC2B9</text>`:""}
          ${l.tl>0?`<text x="${a+f+4}" y="${t+i*.88}" font-size="10" fill="${n}" opacity="0.7">${l.tl}\uD328</text>`:""}
          <text x="${520-d+8}" y="${t+i*.62}" font-size="13" font-weight="900" fill="${y}">${p}</text>
          <text x="${520-d+50}" y="${t+i*.62}" font-size="11" fill="var(--text3)">${l.tg}\uC804 ${l.active.length}\uBA85</text>`}).join("")}
    </svg>
  </div>`}function _b2WeeklyRaceStats(r){return`<div class="b2w2-race-table">
    <div class="b2w2-race-head">
      <span>\uC0C1\uB300 \uC885\uC871</span>
      <span>\uC2B9</span>
      <span>\uD328</span>
      <span>\uCD1D\uC804</span>
      <span>\uC2B9\uB960</span>
    </div>
    ${[{key:"P",label:"\uD504\uB85C\uD1A0\uC2A4",ico:"\u{1F52E}",color:"#8b5cf6"},{key:"T",label:"\uD14C\uB780",ico:"\u2694\uFE0F",color:"#3b82f6"},{key:"Z",label:"\uC800\uADF8",ico:"\u{1F98E}",color:"#f59e0b"}].map(({key:i,label:e,ico:a,color:d})=>{const{w,l:v}=r[i],g=w+v,$=g?Math.round(w/g*100):null,h=$===null?"#94a3b8":$>=60?"#10b981":$>=40?"#f59e0b":"#ef4444";return`<div class="b2w2-race-row">
      <div class="b2w2-race-cell b2w2-race-cell-main">
        <span style="font-size:13px;width:20px;text-align:center;flex-shrink:0">${a}</span>
        <span style="font-size:11px;font-weight:800;color:var(--text2);white-space:nowrap">${e}</span>
      </div>
      <div class="b2w2-race-cell"><span class="b2w2-race-pill win">${w}</span></div>
      <div class="b2w2-race-cell"><span class="b2w2-race-pill loss">${v}</span></div>
      <div class="b2w2-race-cell"><span class="b2w2-race-count">${g}</span></div>
      <div class="b2w2-race-cell"><span class="b2w2-race-rate" style="color:${h};border-color:${d}2e;background:${d}10">${$!==null?`${$}%`:"-"}</span></div>
    </div>`}).join("")}
  </div>`}function _b2WeeklyDelta(r,s){if(s===null||r===null)return"";const o=r-s;if(o===0)return`<span style="font-size:10px;color:var(--text3);margin-left:4px">\u2501 ${s}%</span>`;const i=o>0?"\u25B2":"\u25BC";return`<span style="font-size:10px;font-weight:800;color:${o>0?"#10b981":"#ef4444"};margin-left:4px">${i}${Math.abs(o)}%</span><span style="font-size:10px;color:var(--text3);margin-left:2px">vs \uC804\uC8FC</span>`}

/* board2-briefing.js */
var Gt=Object.defineProperty,At=Object.defineProperties;var Lt=Object.getOwnPropertyDescriptors;var ct=Object.getOwnPropertySymbols;var Yt=Object.prototype.hasOwnProperty,Kt=Object.prototype.propertyIsEnumerable;var wt=(o,a,r)=>a in o?Gt(o,a,{enumerable:!0,configurable:!0,writable:!0,value:r}):o[a]=r,oe=(o,a)=>{for(var r in a||(a={}))Yt.call(a,r)&&wt(o,r,a[r]);if(ct)for(var r of ct(a))Kt.call(a,r)&&wt(o,r,a[r]);return o},ie=(o,a)=>At(o,Lt(a));function _b2WeeklyGetDefaultRange(o){const a=new Date,r=o||0,b=a.getDay(),l=b===0?-6:1-b,d=new Date(a);d.setDate(a.getDate()+l+r*7);const k=new Date(d);k.setDate(d.getDate()+6);const m=R=>R.toISOString().slice(0,10);return{from:m(d),to:m(k)}}function _b2MonthlyGetDefaultRange(o,a){const r=new Date,b=o||0,l=new Date(r.getFullYear(),r.getMonth()+b,1),d=new Date(l.getFullYear(),l.getMonth(),1),k=a?new Date(l.getFullYear(),l.getMonth()+1,0):b===0?new Date(r.getFullYear(),r.getMonth(),r.getDate()):new Date(l.getFullYear(),l.getMonth()+1,0),m=R=>R.toISOString().slice(0,10);return{from:m(d),to:m(k)}}function _b2EnsureStyleTag(o,a){try{const r=document.head||document.getElementsByTagName&&document.getElementsByTagName("head")[0];if(!r)return;const b=String(a||"");let l=document.getElementById(o);if(!l){l=document.createElement("style"),l.id=o,l.type="text/css",l.appendChild(document.createTextNode(b)),r.appendChild(l);return}(l.textContent||"")!==b&&(l.textContent=b)}catch(r){}}function _b2MvpFxDefaults(){return{on:!0,style:"fade",intensity:45,design:"photo"}}const _B2_MVP_FX_STYLES=["fade","vignette","topbottom","tint","spotlight","noir","diagonal","glass","none"],_B2_MVP_DESIGNS=["photo","panel","frame","glasscard","border","ribbon","split","poster"];function _b2MvpFxLoad(){const o=_b2MvpFxDefaults();try{const a=localStorage.getItem("su_b2mvp_fx_on"),r=localStorage.getItem("su_b2mvp_fx_style"),b=localStorage.getItem("su_b2mvp_fx_intensity"),l=localStorage.getItem("su_b2mvp_design_mode"),d=a===null?o.on:a==="1",k=_B2_MVP_FX_STYLES.includes(r)?r:o.style,m=_B2_MVP_DESIGNS.includes(l)?l:o.design,R=parseInt(b,10),ne=Number.isFinite(R)?Math.max(0,Math.min(100,R)):o.intensity;return{on:d,style:k,intensity:ne,design:m}}catch(a){return o}}const _B2_BRIEFING_THEMES=["classic","minimal","vivid","mono","elegant","pastel","luxury","sports","esports","pop","nature","ocean","sunset","neon"];function _b2BriefingThemeLoad(){try{const o=localStorage.getItem("su_b2_briefing_theme");return _B2_BRIEFING_THEMES.includes(o)?o:"classic"}catch(o){return"classic"}}function _b2IsValidDateStr(o){return/^\d{4}-\d{2}-\d{2}$/.test(String(o||"").trim())}function _b2NormalizeBriefingRange(o,a){const r=String(o||"").trim().slice(0,10),b=String(a||"").trim().slice(0,10);if(!_b2IsValidDateStr(r)||!_b2IsValidDateStr(b))return{from:r,to:b,swapped:!1};const l=parseInt(r.replace(/-/g,""),10)||0,d=parseInt(b.replace(/-/g,""),10)||0;return l&&d&&l>d?{from:b,to:r,swapped:!0}:{from:r,to:b,swapped:!1}}function _b2BriefingLoadState(){try{const o=localStorage.getItem("b2w2_state_v1");if(!o)return null;const a=JSON.parse(o);if(!a||typeof a!="object")return null;const r=String(a.preset||"").trim(),b=String(a.from||"").trim(),l=String(a.to||"").trim(),d=String(a.univ||"").trim()||"\uC804\uCCB4",k=["thisWeek","lastWeek","thisMonth","lastMonth","custom"].includes(r),m=_b2NormalizeBriefingRange(b,l);return{preset:k?r:null,from:_b2IsValidDateStr(m.from)?m.from:null,to:_b2IsValidDateStr(m.to)?m.to:null,univ:d}}catch(o){return null}}function _b2BriefingSaveState(){try{const o=String(window._b2WeeklyPreset||"").trim(),a=String(window._b2WeeklyDateFrom||"").trim(),r=String(window._b2WeeklyDateTo||"").trim(),b=String(window._b2WeeklyUniv||"\uC804\uCCB4").trim()||"\uC804\uCCB4",l={preset:["thisWeek","lastWeek","thisMonth","lastMonth","custom"].includes(o)?o:"custom",from:a,to:r,univ:b};localStorage.setItem("b2w2_state_v1",JSON.stringify(l))}catch(o){}}function _b2BriefingPresetRange(o){const a=String(o||"thisWeek");return a==="lastWeek"?_b2WeeklyGetDefaultRange(-1):a==="thisMonth"?_b2MonthlyGetDefaultRange(0,!1):a==="lastMonth"?_b2MonthlyGetDefaultRange(-1,!0):_b2WeeklyGetDefaultRange(0)}function _b2SetBriefingPreset(o){const a=_b2BriefingPresetRange(o);window._b2WeeklyPreset=String(o||"thisWeek"),window._b2WeeklyDateFrom=a.from,window._b2WeeklyDateTo=a.to,_b2BriefingSaveState(),typeof render=="function"&&render()}function _b2GetBriefingInputValues(){const o=document.getElementById("b2w2-from"),a=document.getElementById("b2w2-to"),r=document.getElementById("b2w2-univ"),b=_b2BriefingPresetRange("thisWeek");return{from:o&&o.value||window._b2WeeklyDateFrom||b.from,to:a&&a.value||window._b2WeeklyDateTo||b.to,univ:r&&r.value||window._b2WeeklyUniv||"\uC804\uCCB4"}}function _b2SyncBriefingCustomInputs(o){const a=_b2GetBriefingInputValues(),r=_b2NormalizeBriefingRange(a.from,a.to);if(window._b2WeeklyDateFrom=r.from,window._b2WeeklyDateTo=r.to,window._b2WeeklyUniv=a.univ,window._b2WeeklyPreset="custom",r.swapped){const b=document.getElementById("b2w2-from"),l=document.getElementById("b2w2-to");b&&(b.value=r.from),l&&(l.value=r.to)}_b2BriefingSaveState(),o&&typeof render=="function"&&render()}function _b2ApplyBriefingCustomFromInputs(){_b2SyncBriefingCustomInputs(!0)}function _b2ActivateBriefingCustom(o){_b2SyncBriefingCustomInputs(!0),o&&setTimeout(()=>{const a=document.getElementById("b2w2-from");a&&typeof a.focus=="function"&&a.focus();try{a&&typeof a.showPicker=="function"&&a.showPicker()}catch(r){}},30)}function _b2SetBriefingRecentDays(o){const a=Math.max(1,Number(o)||7),r=new Date;r.setHours(0,0,0,0);const b=new Date(r);b.setDate(r.getDate()-(a-1));const l=d=>d.toISOString().slice(0,10);window._b2WeeklyPreset="custom",window._b2WeeklyDateFrom=l(b),window._b2WeeklyDateTo=l(r),_b2BriefingSaveState(),typeof render=="function"&&render()}function _b2OpenBriefingDateInput(o){const a=o==="to"?"b2w2-to":"b2w2-from",r=document.getElementById(a);if(!r)return;try{typeof r.focus=="function"&&r.focus()}catch(k){}try{if(typeof r.showPicker=="function"){r.showPicker();return}}catch(k){}const b=String(r.value||(o==="to"?window._b2WeeklyDateTo:window._b2WeeklyDateFrom)||"").trim(),l=window.prompt("\uB0A0\uC9DC\uB97C YYYY-MM-DD \uD615\uC2DD\uC73C\uB85C \uC785\uB825\uD558\uC138\uC694.",b);if(l==null)return;const d=String(l).trim().replace(/\./g,"-").replace(/\//g,"-");if(!/^\d{4}-\d{2}-\d{2}$/.test(d)){alert("\uB0A0\uC9DC \uD615\uC2DD\uC740 YYYY-MM-DD \uB85C \uC785\uB825\uD574\uC8FC\uC138\uC694.");return}r.value=d,_b2SyncBriefingCustomInputs(!0)}function _b2WeeklyBriefingView(){var o,a,r,b,l,d,k,m,R,ne,$e,_e,ze,De,Se,We,Pe,Me,Be,Re,Te,Ie,Ce,Fe,je,Ue,Ne,Ee,Ve,Ge,Ae,Le,Ye;try{if(typeof window._b2WeeklyPreset=="undefined"||!window._b2WeeklyDateFrom||!window._b2WeeklyDateTo||typeof window._b2WeeklyUniv=="undefined"){const e=_b2BriefingLoadState();e&&(typeof window._b2WeeklyPreset=="undefined"&&e.preset&&(window._b2WeeklyPreset=e.preset),!window._b2WeeklyDateFrom&&e.from&&(window._b2WeeklyDateFrom=e.from),!window._b2WeeklyDateTo&&e.to&&(window._b2WeeklyDateTo=e.to),typeof window._b2WeeklyUniv=="undefined"&&e.univ&&(window._b2WeeklyUniv=e.univ))}if(typeof window._b2WeeklyPreset=="undefined"&&(window._b2WeeklyPreset="thisWeek"),!window._b2WeeklyDateFrom||!window._b2WeeklyDateTo){const e=_b2BriefingPresetRange(window._b2WeeklyPreset);window._b2WeeklyDateFrom=e.from,window._b2WeeklyDateTo=e.to}typeof window._b2WeeklyUniv=="undefined"&&(window._b2WeeklyUniv="\uC804\uCCB4");const H=_b2NormalizeBriefingRange(window._b2WeeklyDateFrom,window._b2WeeklyDateTo);window._b2WeeklyDateFrom=H.from,window._b2WeeklyDateTo=H.to;const u=String(window._b2WeeklyPreset||"thisWeek"),T=window._b2WeeklyDateFrom,j=window._b2WeeklyDateTo,Ot=e=>parseInt(String(e||"").replace(/[-\.\/]/g,""))||0,Ke=Math.round((new Date(j)-new Date(T))/864e5)+1,se=new Date(T);se.setDate(se.getDate()-1);const we=new Date(se);we.setDate(we.getDate()-(Ke-1));const Oe=e=>e.toISOString().slice(0,10),J=Oe(we),X=Oe(se),gt=new Set((typeof univCfg!="undefined"?univCfg:[]).filter(e=>e.dissolved||e.hidden).map(e=>String(e.name||"").trim())),le=players.filter(e=>!e.hidden&&!e.retired&&!e.hideFromBoard&&!gt.has(String((e==null?void 0:e.univ)||"").trim())),ge=(_b2VisUnivs?_b2VisUnivs():[]).filter(e=>e.name&&e.name!=="\uBB34\uC18C\uC18D"),D=window._b2WeeklyUniv||"\uC804\uCCB4",y=e=>String(e||"").slice(0,10).replace(/-/g,"."),Ze={thisWeek:{kicker:"Weekly Briefing",title:"\uBE0C\uB9AC\uD551",short:"\uC774\uBC88\uC8FC",prevLabel:"\uC9C0\uB09C\uC8FC",desc:"\uC774\uBC88 \uC8FC \uD65C\uB3D9\uACFC \uD750\uB984\uC744 \uCE74\uB4DC \uC704\uC8FC\uB85C \uBE60\uB974\uAC8C \uD6D1\uC5B4\uBCFC \uC218 \uC788\uB3C4\uB85D \uC815\uB9AC\uD55C \uD654\uBA74\uC785\uB2C8\uB2E4."},lastWeek:{kicker:"Weekly Briefing",title:"\uBE0C\uB9AC\uD551",short:"\uC9C0\uB09C\uC8FC",prevLabel:"\uADF8 \uC804 \uC8FC",desc:"\uC9C0\uB09C\uC8FC \uD65C\uB3D9 \uD750\uB984\uACFC \uC8FC\uC694 \uBCC0\uD654\uB97C \uB418\uC9DA\uC5B4\uBCF4\uAE30 \uC88B\uAC8C \uC815\uB9AC\uD55C \uD654\uBA74\uC785\uB2C8\uB2E4."},thisMonth:{kicker:"Monthly Briefing",title:"\uC6D4\uAC04 \uBE0C\uB9AC\uD551",short:"\uC774\uBC88\uB2EC",prevLabel:"\uC9C0\uB09C\uB2EC",desc:"\uC774\uBC88 \uB2EC \uD65C\uB3D9 \uD750\uB984\uACFC \uC6D4\uAC04 \uBCC0\uD654 \uD3EC\uC778\uD2B8\uB97C \uD55C \uD654\uBA74\uC5D0\uC11C \uBCF4\uAE30 \uC88B\uAC8C \uC815\uB9AC\uD55C \uD654\uBA74\uC785\uB2C8\uB2E4."},lastMonth:{kicker:"Monthly Briefing",title:"\uC6D4\uAC04 \uBE0C\uB9AC\uD551",short:"\uC9C0\uB09C\uB2EC",prevLabel:"\uADF8 \uC804 \uB2EC",desc:"\uC9C0\uB09C\uB2EC \uD65C\uB3D9 \uD750\uB984\uACFC \uC6D4\uAC04 \uC694\uC57D\uC744 \uB418\uB3CC\uC544\uBCF4\uAE30 \uC88B\uAC8C \uC815\uB9AC\uD55C \uD654\uBA74\uC785\uB2C8\uB2E4."},custom:{kicker:"Period Briefing",title:"\uAE30\uAC04 \uBE0C\uB9AC\uD551",short:"\uC0AC\uC6A9\uC790 \uAE30\uAC04",prevLabel:"\uC774\uC804 \uAE30\uAC04",desc:"\uC9C1\uC811 \uC9C0\uC815\uD55C \uAE30\uAC04\uC758 \uD65C\uB3D9 \uD750\uB984\uACFC \uD575\uC2EC \uBCC0\uD654\uB97C \uBE44\uAD50\uD574\uC11C \uBCF4\uB294 \uD654\uBA74\uC785\uB2C8\uB2E4."}},U=Ze[u]||Ze.custom,v=u==="thisMonth"||u==="lastMonth",S=u==="custom",He=u==="thisMonth"?"\uC774\uB2EC MVP":u==="lastMonth"?"\uC9C0\uB09C\uB2EC MVP":"\uC774\uBC88 \uC8FC MVP",vt=v?"\uD65C\uB3D9 \uB9CE\uC740 \uB300\uD559 TOP 5":"\uD65C\uB3D9 \uB9CE\uC740 \uB300\uD559 TOP 3",ft=v?5:3,z=_b2WeeklyUnivStats(le,T,j,ge),Je=_b2WeeklyUnivStats(le,J,X,ge),Xe={};Je.forEach(e=>{Xe[e.u.name]=e});const ve=D==="\uC804\uCCB4"?z:z.filter(e=>e.u.name===D),qe=_b2WeeklyMVP(z),Zt=_b2WeeklyMVP2(z,qe),Ht=_b2WeeklyWorst(z),q=_b2MvpFxLoad(),mt=((q.on?q.intensity:0)/100).toFixed(3),xt=q.on?q.style:"none",ht=(e,t,i,n)=>_b2BuildMvpCardHtml(e,t,i,n,{isMonthly:v,mvpLabel:He,mvpFxStyleAttr:xt,mvpFxDesign:q.design,mvpFxOp:mt}),ut=_b2WeeklyAggregate(le,T,j),yt=_b2WeeklyAggregate(le,J,X),fe={};yt.forEach(e=>{var t;fe[((t=e.p)==null?void 0:t.name)||""]=e});const I=ut.filter(e=>e.total>0),W=[...z].filter(e=>e.tg>0).sort((e,t)=>{var i,n;return t.tg-e.tg||t.active.length-e.active.length||((i=t.wr)!=null?i:-1)-((n=e.wr)!=null?n:-1)}).slice(0,ft),A=z.filter(e=>e.tg===0).map(e=>e.u.name),L=I.map(e=>{var s,g,p;const t=fe[((s=e.p)==null?void 0:s.name)||""]||null,i=t&&t.total>0&&(g=t.winRate)!=null?g:0,n=t&&t.total||0;return ie(oe({},e),{wrDelta:((p=e.winRate)!=null?p:0)-i,totalDelta:e.total-n,prevTotal:n})}).filter(e=>e.total>=2).sort((e,t)=>t.wrDelta-e.wrDelta||t.totalDelta-e.totalDelta||t.wins-e.wins),x=L[0]||null,be=L.filter(e=>e.prevTotal>=2&&e.wrDelta<0).slice().sort((e,t)=>e.wrDelta-t.wrDelta||e.totalDelta-t.totalDelta),C=be[0]||null,Qe=_b2CalcStreak,et=I.map(e=>ie(oe({},e),{streak:Qe(e.hist,"\uC2B9")})).filter(e=>e.streak>=2).sort((e,t)=>t.streak-e.streak),Q=et[0]||null,tt=I.map(e=>ie(oe({},e),{streak:Qe(e.hist,"\uD328")})).filter(e=>e.streak>=2).sort((e,t)=>t.streak-e.streak),ee=tt[0]||null,me=I.filter(e=>e.total>=3).slice().sort((e,t)=>{var i,n;return((i=t.winRate)!=null?i:-1)-((n=e.winRate)!=null?n:-1)||t.total-e.total}),$=me[0]||null,xe=I.filter(e=>(e.wins||0)>0).slice().sort((e,t)=>{var i,n;return t.wins-e.wins||t.total-e.total||((i=t.winRate)!=null?i:-1)-((n=e.winRate)!=null?n:-1)}),N=xe[0]||null,he=I.filter(e=>e.total>0).slice().sort((e,t)=>{var i,n;return t.total-e.total||((i=t.winRate)!=null?i:-1)-((n=e.winRate)!=null?n:-1)}),E=he[0]||null,at=[...I].sort((e,t)=>{var i,n;return t.total-e.total||t.wins-e.wins||((i=t.winRate)!=null?i:-1)-((n=e.winRate)!=null?n:-1)}).slice(0,5),Jt=at[0]||null,Xt=_b2RankSortUnivs,P=_b2BuildRankedUnivs(z,Je),rt=P,ot=P.map(e=>ie(oe({},e),{ace:_b2WeeklyUnivMVP(e.active)})),pe=rt.length,it=`b2w2-monthly-ranks-more-${u}`,nt=`b2w2-monthly-ranks-btn-${u}`,st=`b2w2-monthly-aces-more-${u}`,lt=`b2w2-monthly-aces-btn-${u}`,ue=ot.find(e=>e.ace)||null,bt=(()=>{var t,i,n;const e=[];return v&&P[0]?e.push(`${P[0].u.name} ${P[0].tw}\uC2B9 ${P[0].tl}\uD328 \xB7 \uC2B9\uB960 ${(t=P[0].wr)!=null?t:0}%\uB85C 1\uC704`):W[0]&&e.push(`${W[0].u.name} \uD65C\uB3D9\uB7C9 1\uC704 \xB7 ${W[0].tg}\uC804 \xB7 \uD65C\uB3D9 ${W[0].active.length}\uBA85`),x&&x.wrDelta>0&&e.push(`${((i=x.p)==null?void 0:i.name)||"-"} \uC2B9\uB960 \uBCC0\uB3D9 ${x.wrDelta>0?"+":""}${x.wrDelta}%p`),v&&ue&&e.push(`${ue.u.name} \uC5D0\uC774\uC2A4 ${((n=ue.ace.p)==null?void 0:n.name)||"-"}`),A.length&&e.push(`\uAE30\uB85D \uC5C6\uB294 \uB300\uD559 ${A.length}\uACF3`),e.length?`${e.join(" \xB7 ")}.`:"\uC120\uD0DD \uAE30\uAC04 \uD65C\uB3D9\uB7C9\uACFC \uBE44\uAD50 \uC9C0\uD45C\uB97C \uC815\uB9AC\uD588\uC2B5\uB2C8\uB2E4."})(),kt=(()=>{var e;if(v&&P[0]){const t=P[0],i=t.rankDelta===null?"\uCCAB \uC9D1\uACC4":t.rankDelta>0?`\uC804\uAE30 \uB300\uBE44 \u25B2${t.rankDelta}`:t.rankDelta<0?`\uC804\uAE30 \uB300\uBE44 \u25BC${Math.abs(t.rankDelta)}`:"\uC804\uAE30\uC640 \uB3D9\uC77C";return`${t.u.name} 1\uC704 \xB7 ${t.tw}\uC2B9 ${t.tl}\uD328 \xB7 \uC2B9\uB960 ${(e=t.wr)!=null?e:0}% \xB7 ${i}`}return W[0]?`${W[0].u.name} \uD65C\uB3D9\uB7C9 1\uC704 \xB7 ${W[0].tg}\uC804 \xB7 \uD65C\uB3D9 ${W[0].active.length}\uBA85`:"\uC120\uD0DD \uAE30\uAC04 \uD575\uC2EC \uC9C0\uD45C\uB97C \uBE60\uB974\uAC8C \uD655\uC778\uD560 \uC218 \uC788\uB3C4\uB85D \uC815\uB9AC\uD588\uC2B5\uB2C8\uB2E4"})(),$t=v?"\uC9D1\uACC4 \uBC94\uC704":S?"\uC0AC\uC6A9\uC790 \uAE30\uAC04":"\uC8FC\uAC04 \uBC94\uC704",_t=v?`\uB300\uD559 ${P.length}\uACF3`:`\uD65C\uB3D9 ${I.length}\uBA85`,zt=`${U.prevLabel} ${y(J)} ~ ${y(X)}`;_b2EnsureStyleTag("b2w2-style",`
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
      .b2w2-hero-spotlight {
        padding: 14px 0 0;
        border-top: 1px solid var(--b2w-rule-soft);
      }
      .b2w2-hero-spotlight-kicker {
        font-size: 10px;
        font-weight: 800;
        letter-spacing: .16em;
        text-transform: uppercase;
        color: var(--b2w-accent);
      }
      .b2w2-hero-spotlight-title {
        margin-top: 5px;
        font-family: 'Noto Serif KR', Georgia, serif;
        font-size: 19px;
        font-weight: 800;
        letter-spacing: -.01em;
        line-height: 1.3;
        color: var(--b2w-ink);
      }
      .b2w2-hero-spotlight-sub { margin-top: 8px; display: flex; gap: 14px; flex-wrap: wrap }
      .b2w2-hero-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 0;
        background: none;
        border: none;
        font-size: 11px;
        font-weight: 700;
        color: var(--b2w-ink-soft);
      }
      .b2w2-hero-pill:not(:last-child) { border-right: 1px solid var(--b2w-rule-soft); padding-right: 14px }
      .b2w2-hero-badges { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px }
      .b2w2-hero-badge {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 3px 9px;
        border: 1px solid var(--b2w-rule-soft);
        background: var(--b2w-paper-alt);
        border-radius: 999px;
        font-size: 10px;
        font-weight: 700;
        color: var(--b2w-ink-soft);
        letter-spacing: .02em;
      }
      .b2w2-hero-stats {
        display: grid;
        grid-template-columns: repeat(2, minmax(0,1fr));
        gap: 0;
        min-width: min(100%, 260px);
        border: 1px solid var(--b2w-rule);
        border-radius: var(--b2w-r-lg);
        overflow: hidden;
        background: var(--b2w-paper-alt);
        box-shadow: var(--b2w-shadow-sm);
        flex-shrink: 0;
      }
      .b2w2-hero-stat {
        padding: 14px 16px;
        border-right: 1px solid var(--b2w-rule-soft);
        border-bottom: 1px solid var(--b2w-rule-soft);
        transition: background .14s ease;
      }
      .b2w2-hero-stat:hover { background: var(--b2w-accent-soft) }
      .b2w2-hero-stat:nth-child(2n) { border-right: none }
      .b2w2-hero-stat:nth-last-child(-n+2) { border-bottom: none }
      .b2w2-hero-stat-label { font-size: 10px; font-weight: 800; color: var(--b2w-ink-soft); text-transform: uppercase; letter-spacing: .1em }
      .b2w2-hero-stat-value {
        margin-top: 6px;
        font-family: 'Noto Serif KR', Georgia, serif;
        font-size: 18px;
        font-weight: 800;
        letter-spacing: -.01em;
        color: var(--b2w-ink);
        line-height: 1.15;
      }
      .b2w2-hero-stat-sub { margin-top: 4px; font-size: 10px; font-weight: 600; color: var(--b2w-ink-soft) }

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

      /* \u2500\u2500 \uBAA8\uB4DC \uC120\uD0DD \uBC14 \u2500\u2500 */
      .b2w2-modebar {
        display: grid;
        grid-template-columns: repeat(3, minmax(0,1fr));
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
        border-radius: 16px;
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

      /* \uC2A4\uD0EF + \uCD5C\uADFC \uD3FC \uD1B5\uD569 \uB77C\uC778 \u2014 \uAE00\uB77C\uC2A4 \uBC30\uACBD */
      .b2w2-mvp-statline {
        display: flex;
        align-items: center;
        gap: 7px;
        border-radius: 999px;
        border: 1px solid rgba(255,255,255,.16);
        backdrop-filter: blur(14px) saturate(160%);
        -webkit-backdrop-filter: blur(14px) saturate(160%);
        background: linear-gradient(180deg, rgba(255,255,255,.14), rgba(255,255,255,.04));
        box-shadow: inset 0 1px 0 rgba(255,255,255,.14), 0 6px 16px rgba(0,0,0,.18);
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
        background: rgba(255,255,255,.22);
        flex-shrink: 0;
      }
      .b2w2-mvp-sv {
        font-family: 'Noto Serif KR', Georgia, serif;
        font-size: 13px;
        font-weight: 900;
        letter-spacing: -.02em;
        line-height: 1;
        color: #fff;
      }
      .b2w2-mvp-sl {
        font-size: 8px;
        font-style: normal;
        font-weight: 800;
        color: rgba(255,255,255,.62);
        letter-spacing: .02em;
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

      /* \u2500\u2500 \uC6D4\uAC04 \uADF8\uB9AC\uB4DC \u2500\u2500 */
      .b2w2-monthly-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        margin-bottom: 22px;
      }

      /* \u2500\u2500 \uC6D4\uAC04 \uC21C\uC704 \uB9AC\uC2A4\uD2B8 \u2500\u2500 */
      .b2w2-rank-list, .b2w2-ace-list { display: flex; flex-direction: column; gap: 0 }
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
      .b2w2-more-stack { display: flex; flex-direction: column; gap: 0; margin-top: 0 }
      .b2w2-more-btn {
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
        padding: 12px 4px;
        border-bottom: 1px solid var(--b2w-rule-soft);
        background: none;
        box-shadow: none;
      }
      .b2w2-ace-card:last-child { border-bottom: none }
      .b2w2-ace-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 9px }
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
      .b2w2-ace-player-name {
        font-family: 'Noto Serif KR', Georgia, serif;
        font-size: 17px;
        font-weight: 800;
        color: var(--b2w-ink);
        letter-spacing: -.01em;
        cursor: pointer;
        transition: color .12s ease;
      }
      .b2w2-ace-player-name:hover { color: var(--b2w-accent) }
      .b2w2-ace-player-sub { margin-top: 4px; font-size: 11px; color: var(--b2w-ink-soft); display: flex; gap: 7px; flex-wrap: wrap }
      .b2w2-ace-badges { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 9px }
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
      .b2w2-ace-empty { padding: 13px 4px; border-bottom: 1px dashed var(--b2w-rule-soft) }
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
        padding: 14px 16px;
        border-radius: var(--b2w-r);
        border: 1.5px solid var(--gold-b, rgba(180,83,9,.2));
        background: linear-gradient(135deg, var(--gold-bg, #fffbeb), var(--gold-b, #fef9c3));
      }
      .b2w2-card-spotlight-kicker { font-size: 10px; font-weight: 800; color: var(--gold, #92651b); letter-spacing: .08em; text-transform: uppercase }
      .b2w2-card-spotlight-title { margin-top: 6px; font-family: 'Noto Serif KR', Georgia, serif; font-size: 16px; font-weight: 800; color: var(--b2w-ink); display: flex; align-items: center; gap: 6px; flex-wrap: wrap }
      .b2w2-card-spotlight-sub { margin-top: 5px; font-size: 11px; color: var(--b2w-ink-soft); display: flex; gap: 8px; flex-wrap: wrap }

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
        .b2w2-hero-stats{width:100%;border-top:1px solid var(--b2w-rule-soft);grid-template-columns:repeat(2,minmax(0,1fr));padding-top:12px}
      }
      @media(max-width:600px){
        .b2w2-hero{padding:0 0 14px}
        .b2w2-hero-title{font-size:26px}
        .b2w2-hero-stats{grid-template-columns:1fr}
        .b2w2-kpi-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
        .b2w2-modebar{grid-template-columns:1fr;gap:8px}
        .b2w2-highlight-grid{grid-template-columns:1fr;gap:8px}
        .b2w2-monthly-grid{grid-template-columns:1fr;gap:8px}
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
        .b2w2-monthly-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
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
    `);let w="";const Dt=z.reduce((e,t)=>e+(t.tg||0),0),St=z.filter(e=>e.tg>0).length,V=Ke;if(w+=`<div class="b2w2-wrap" id="b2w2-export-root" data-theme="${_b2BriefingThemeLoad()}">
      <div class="b2w2-masthead">
        <span class="b2w2-masthead-brand"><span class="b2w2-masthead-mark"></span>STAR DATACENTER</span>
        <span>${y(T)} ~ ${y(j)} \uBC1C\uD589</span>
      </div>
      <section class="b2w2-hero">
        <div class="b2w2-hero-main">
          <div style="font-size:11px;font-weight:900;letter-spacing:.08em;color:var(--b2w-gold);text-transform:uppercase">${U.kicker}</div>
          <div class="b2w2-hero-title">${U.title}</div>
          <div class="b2w2-hero-desc">${bt}</div>
          <div class="b2w2-hero-spotlight">
            <div class="b2w2-hero-spotlight-kicker">\uD575\uC2EC \uC9C0\uD45C</div>
            <div class="b2w2-hero-spotlight-title">${kt}</div>
            <div class="b2w2-hero-spotlight-sub">
              <span class="b2w2-hero-pill">${$t}</span>
              <span class="b2w2-hero-pill">${_t}</span>
              <span class="b2w2-hero-pill">${zt}</span>
            </div>
          </div>
          <div class="b2w2-hero-badges">
            <span class="b2w2-hero-badge">${U.short}</span>
            <span class="b2w2-hero-badge">\uC120\uD0DD \uAE30\uAC04 ${y(T)} ~ ${y(j)}</span>
            <span class="b2w2-hero-badge">\uD544\uD130 ${D}</span>
          </div>
        </div>
        <div class="b2w2-hero-stats">
          <div class="b2w2-hero-stat">
            <div class="b2w2-hero-stat-label">\uC120\uD0DD \uBC94\uC704</div>
            <div class="b2w2-hero-stat-value">${D==="\uC804\uCCB4"?"\uC804\uCCB4 \uB300\uD559":D}</div>
            <div class="b2w2-hero-stat-sub">\uD544\uD130 \uC989\uC2DC \uBCC0\uACBD \uAC00\uB2A5</div>
          </div>
          <div class="b2w2-hero-stat">
            <div class="b2w2-hero-stat-label">\uBE44\uAD50 \uAE30\uC900</div>
            <div class="b2w2-hero-stat-value">${U.prevLabel}</div>
            <div class="b2w2-hero-stat-sub">${y(J)} ~ ${y(X)}</div>
          </div>
        </div>
      </section>
      <div class="b2w2-modebar">
        <div class="b2w2-modecard ${!v&&!S?"is-active":""}" onclick="_b2SetBriefingPreset('thisWeek')">
          <div class="b2w2-modehead">
            <div>
              <div class="b2w2-modekicker">\uC8FC\uAC04 \uBAA8\uB4DC</div>
              <div class="b2w2-modetitle">\uC8FC\uAC04</div>
            </div>
            <span class="b2w2-modebadge">${!v&&!S?"\uC120\uD0DD\uB428":"\uBE60\uB978 \uD655\uC778"}</span>
          </div>
          <div class="b2w2-modedesc">\uC774\uBC88\uC8FC\uC640 \uC9C0\uB09C\uC8FC \uD750\uB984\uC744 \uBE60\uB974\uAC8C \uBE44\uAD50\uD560 \uB54C \uBCF4\uAE30 \uC88B\uC2B5\uB2C8\uB2E4.</div>
          <div class="b2w2-presetrow">
            ${[["thisWeek","\uC774\uBC88\uC8FC"],["lastWeek","\uC9C0\uB09C\uC8FC"]].map(([e,t])=>`<button type="button" class="b2w2-preset${u===e?" on":""}" onclick="event.stopPropagation();_b2SetBriefingPreset('${e}')">${t}</button>`).join("")}
          </div>
        </div>
        <div class="b2w2-modecard ${v?"is-active":""}" onclick="_b2SetBriefingPreset('thisMonth')">
          <div class="b2w2-modehead">
            <div>
              <div class="b2w2-modekicker">\uC6D4\uAC04 \uBAA8\uB4DC</div>
              <div class="b2w2-modetitle">\uC6D4\uAC04</div>
            </div>
            <span class="b2w2-modebadge">${v?"\uC120\uD0DD\uB428":"\uAE4A\uAC8C \uBCF4\uAE30"}</span>
          </div>
          <div class="b2w2-modedesc">\uC774\uBC88\uB2EC\uACFC \uC9C0\uB09C\uB2EC \uD750\uB984\uC744 \uC870\uAE08 \uB354 \uB113\uAC8C \uD655\uC778\uD560 \uB54C \uC801\uD569\uD569\uB2C8\uB2E4.</div>
          <div class="b2w2-presetrow">
            ${[["thisMonth","\uC774\uBC88\uB2EC"],["lastMonth","\uC9C0\uB09C\uB2EC"]].map(([e,t])=>`<button type="button" class="b2w2-preset${u===e?" on":""}" onclick="event.stopPropagation();_b2SetBriefingPreset('${e}')">${t}</button>`).join("")}
          </div>
        </div>
        <div class="b2w2-modecard ${S?"is-active":""}" onclick="_b2ActivateBriefingCustom(true)">
          <div class="b2w2-modehead">
            <div>
              <div class="b2w2-modekicker">\uC0AC\uC6A9\uC790 \uAE30\uAC04</div>
              <div class="b2w2-modetitle">\uAE30\uAC04</div>
            </div>
            <span class="b2w2-modebadge">${S?"\uC0AC\uC6A9 \uC911":"\uC9C1\uC811 \uC9C0\uC815"}</span>
          </div>
          <div class="b2w2-modedesc">\uC6D0\uD558\uB294 \uB0A0\uC9DC \uBC94\uC704\uB97C \uC9C1\uC811 \uC785\uB825\uD574 \uD2B9\uC815 \uAE30\uAC04 \uBE0C\uB9AC\uD551\uC73C\uB85C \uBCFC \uC218 \uC788\uC2B5\uB2C8\uB2E4.</div>
          <div class="b2w2-presetrow">
            <button type="button" class="b2w2-preset${S&&V===7?" on":""}" onclick="event.stopPropagation();_b2SetBriefingRecentDays(7)">\uCD5C\uADFC 7\uC77C</button>
            <button type="button" class="b2w2-preset${S&&V===14?" on":""}" onclick="event.stopPropagation();_b2SetBriefingRecentDays(14)">\uCD5C\uADFC 14\uC77C</button>
            <button type="button" class="b2w2-preset${S&&V===30?" on":""}" onclick="event.stopPropagation();_b2SetBriefingRecentDays(30)">\uCD5C\uADFC 30\uC77C</button>
            <button type="button" class="b2w2-preset${S&&![7,14,30].includes(V)?" on":""}" onclick="event.stopPropagation();_b2ActivateBriefingCustom(true)">\uC9C1\uC811 \uC9C0\uC815</button>
            <button type="button" class="b2w2-preset${S&&![7,14,30].includes(V)?" on":""}" onclick="event.stopPropagation();_b2ApplyBriefingCustomFromInputs()">${S?`${y(T)} ~ ${y(j)}`:"\uC785\uB825\uAC12 \uC870\uD68C"}</button>
          </div>
        </div>
      </div>
      <div class="b2w2-hdr">
      <span style="font-size:16px">\u{1F4C5}</span>
      <span style="font-size:14px;font-weight:900;color:var(--text1)">${U.title}</span>
      <input type="date" class="b2w2-din" id="b2w2-from" value="${T}" onchange="_b2SyncBriefingCustomInputs(true)" title="\uC2DC\uC791 \uB0A0\uC9DC \uBCC0\uACBD">
      <button type="button" class="b2w2-datebtn" onclick="_b2OpenBriefingDateInput('from')" title="\uC2DC\uC791 \uB0A0\uC9DC \uC120\uD0DD">\u{1F4C5} \uC2DC\uC791\uC77C</button>
      <span style="font-size:12px;color:var(--text3);font-weight:700">~</span>
      <input type="date" class="b2w2-din" id="b2w2-to" value="${j}" onchange="_b2SyncBriefingCustomInputs(true)" title="\uC885\uB8CC \uB0A0\uC9DC \uBCC0\uACBD">
      <button type="button" class="b2w2-datebtn" onclick="_b2OpenBriefingDateInput('to')" title="\uC885\uB8CC \uB0A0\uC9DC \uC120\uD0DD">\u{1F4C5} \uC885\uB8CC\uC77C</button>
      <select class="b2w2-sel" id="b2w2-univ" onchange="_b2SyncBriefingCustomInputs(true)">
        <option value="\uC804\uCCB4"${D==="\uC804\uCCB4"?" selected":""}>\u{1F3EB} \uC804\uCCB4 \uB300\uD559</option>
        ${ge.map(e=>`<option value="${e.name}"${D===e.name?" selected":""}>${e.name}</option>`).join("")}
      </select>
      <button type="button" class="b2w2-btn" onclick="_b2ApplyBriefingCustomFromInputs()">\uC870\uD68C</button>
      <button type="button" class="b2w2-btn no-export" onclick="captureBriefingArticle('split')" style="background:#111827">\u{1F4F0} \uC800\uC7A5(\uBD84\uD560)</button>
      <button type="button" class="b2w2-btn no-export" onclick="captureBriefingArticle('single')" style="background:#334155">\u{1F4F0} \uC800\uC7A5(1\uC7A5)</button>
      <span style="font-size:11px;color:var(--text3);margin-left:auto">${y(T)} ~ ${y(j)}</span>
      <span style="font-size:10px;color:var(--text3)">(${U.prevLabel}: ${y(J)}~${y(X)})</span>
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
    </div>`,!ve.some(e=>e.tg>0))return w+='<div class="b2w2-empty"><div style="font-size:28px;margin-bottom:8px">\u{1F4ED}</div>\uD574\uB2F9 \uAE30\uAC04\uC5D0 \uAE30\uB85D\uB41C \uACBD\uAE30\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.<div style="font-size:11px;margin-top:4px">\uAE30\uAC04\uC744 \uBCC0\uACBD\uD574\uBCF4\uC138\uC694</div></div></div>',w;const M=v?P[0]:W[0],Wt=v?"\uC120\uB450 \uB300\uD559":"\uD65C\uB3D9\uB7C9 1\uC704 \uB300\uD559",Pt=M?M.u.name:"-",Mt=M&&typeof gc=="function"&&gc(M.u.name)||"#f59e0b",Bt=M?v?`${M.tw}\uC2B9 ${M.tl}\uD328 \xB7 \uC2B9\uB960 ${(o=M.wr)!=null?o:0}%`:`${M.tg}\uC804 \xB7 \uD65C\uB3D9 ${M.active.length}\uBA85`:"\uC9D1\uACC4 \uB370\uC774\uD130 \uC5C6\uC74C",Rt=$?`${((a=$.p)==null?void 0:a.name)||"-"} \xB7 ${$.total}\uC804`:"\uD45C\uBCF8 \uBD80\uC871";w+=`<section class="b2w2-kpi-grid">
      <article class="b2w2-kpi-card" style="--kpi-accent:#6366f1">
        <div class="b2w2-kpi-label">\u{1F3EB} \uD65C\uB3D9 \uB300\uD559</div>
        <div class="b2w2-kpi-value">${St}<span style="font-size:14px;font-weight:700;color:var(--b2w-ink-soft);margin-left:2px">\uACF3</span></div>
        <div class="b2w2-kpi-sub">\uACBD\uAE30 \uAE30\uB85D \uC788\uB294 \uB300\uD559 \uC218</div>
      </article>
      <article class="b2w2-kpi-card" style="--kpi-accent:#0ea5e9">
        <div class="b2w2-kpi-label">\u{1F3AE} \uCD1D \uACBD\uAE30 \uC218</div>
        <div class="b2w2-kpi-value">${Dt}<span style="font-size:14px;font-weight:700;color:var(--b2w-ink-soft);margin-left:2px">\uC804</span></div>
        <div class="b2w2-kpi-sub">${V}\uC77C \uC9D1\uACC4 \uAE30\uC900</div>
      </article>
      <article class="b2w2-kpi-card" style="--kpi-accent:${Mt}">
        <div class="b2w2-kpi-label">\u{1F451} ${Wt}</div>
        <div class="b2w2-kpi-value" style="font-size:18px;margin-top:8px">${Pt}</div>
        <div class="b2w2-kpi-sub">${Bt}</div>
      </article>
      <article class="b2w2-kpi-card" style="--kpi-accent:#10b981">
        <div class="b2w2-kpi-label">\u{1F3AF} \uCD5C\uACE0 \uC2B9\uB960</div>
        <div class="b2w2-kpi-value" style="color:#10b981">${$?`${$.winRate}%`:"-"}</div>
        <div class="b2w2-kpi-sub">${Rt}</div>
      </article>
    </section>`,w+=`<section class="b2w2-highlight-grid">
      <article class="b2w2-highlight-card b2w2-lead-card" style="border-color:var(--b2w-accent-border);--hc-top:var(--b2w-accent)">
        <div class="b2w2-highlight-kicker" style="color:var(--b2w-accent)">\uAE30\uAC04 \uC694\uC57D</div>
        <div class="b2w2-highlight-title">\uAE30\uAC04 \uD575\uC2EC \uC694\uC57D</div>
        <div class="b2w2-highlight-desc">${bt}</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <span class="b2w2-note-chip" style="border-color:var(--b2w-tag-accent-border);color:var(--b2w-accent);background:var(--b2w-tag-accent-bg)">\uD65C\uB3D9 \uC2A4\uD2B8\uB9AC\uBA38 ${I.length}\uBA85</span>
          <span class="b2w2-note-chip">${V}\uC77C \uC9D1\uACC4</span>
        </div>
      </article>
      <article class="b2w2-highlight-card" style="--hc-top:#f59e0b">
        <div class="b2w2-highlight-kicker" style="color:#b45309">\u{1F3EB} \uB300\uD559 \uD65C\uB3D9\uB7C9</div>
        <div class="b2w2-highlight-title">${vt}</div>
        <div class="b2w2-highlight-list">
          ${W.length?W.map((e,t)=>`
            <div class="b2w2-highlight-row">
              <div style="display:flex;align-items:center;gap:8px;min-width:0">
                <span style="font-size:11px;font-weight:900;color:${gc?gc(e.u.name):"#64748b"}">${t+1}</span>
                <span style="font-size:12px;font-weight:900;color:var(--text1)">${e.u.name}</span>
              </div>
              <div style="font-size:11px;font-weight:800;color:var(--text3)">${e.tg}\uC804 \xB7 \uD65C\uB3D9 ${e.active.length}\uBA85</div>
            </div>
          `).join(""):'<div class="b2w2-highlight-desc">\uD65C\uB3D9 \uB300\uD559\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.</div>'}
        </div>
      </article>
      <article class="b2w2-highlight-card" style="--hc-top:#10b981">
        <div class="b2w2-highlight-kicker" style="color:#15803d">\u{1F4C8} \uC2B9\uB960 \uBCC0\uB3D9</div>
        <div class="b2w2-highlight-title">\uC804\uAE30 \uB300\uBE44 \uC2B9\uB960 \uBCC0\uD654</div>
        <div class="b2w2-dual-card">
          <div class="b2w2-dual-block">
            ${x?`
              <div class="b2w2-dual-head">
                <div style="min-width:0">
                  <div class="b2w2-dual-title" style="color:#15803d">\uC0C1\uC2B9\uC138</div>
                  <div class="b2w2-dual-sub"><span style="font-weight:900;color:var(--text1);cursor:pointer" onclick="openPlayerModal('${((b=(r=x.p)==null?void 0:r.name)==null?void 0:b.replace(/\\/g,"\\\\").replace(/'/g,"\\'"))||""}')">${((l=x.p)==null?void 0:l.name)||"-"}</span> \xB7 ${String(((d=x.p)==null?void 0:d.univ)||"\uBB34\uC18C\uC18D")}</div>
                </div>
                <span class="b2w2-note-chip" style="border-color:#bbf7d0;color:#15803d;background:#f0fdf4">${x.wrDelta>=0?"+":""}${x.wrDelta}%p</span>
              </div>
              <div class="b2w2-mini-list">
                <div class="b2w2-mini-row"><span style="color:var(--text3)">\uC804\uC801</span><span style="color:var(--text1)">${x.wins}\uC2B9 ${x.losses}\uD328</span></div>
                <div class="b2w2-mini-row"><span style="color:var(--text3)">\uACBD\uAE30 \uC218 \uBCC0\uD654</span><span style="color:var(--text1)">${x.totalDelta>=0?"+":""}${x.totalDelta}\uC804</span></div>
                ${L[1]?`<div class="b2w2-mini-row"><span style="color:var(--text3)">\uB2E4\uC74C</span><span style="color:#15803d">${((k=L[1].p)==null?void 0:k.name)||"-"} ${L[1].wrDelta>=0?"+":""}${L[1].wrDelta}%p</span></div>`:""}
              </div>
            `:'<div class="b2w2-highlight-desc">\uC804\uC8FC\uC640 \uBE44\uAD50\uD560 \uB9CC\uD07C \uC0C1\uC2B9\uD55C \uC2A4\uD2B8\uB9AC\uBA38\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.</div>'}
          </div>
          <div class="b2w2-dual-block">
            ${C?`
              <div class="b2w2-dual-head">
                <div style="min-width:0">
                  <div class="b2w2-dual-title" style="color:#dc2626">\uD558\uB77D\uC138</div>
                  <div class="b2w2-dual-sub"><span style="font-weight:900;color:var(--text1);cursor:pointer" onclick="openPlayerModal('${((R=(m=C.p)==null?void 0:m.name)==null?void 0:R.replace(/\\/g,"\\\\").replace(/'/g,"\\'"))||""}')">${((ne=C.p)==null?void 0:ne.name)||"-"}</span> \xB7 ${String((($e=C.p)==null?void 0:$e.univ)||"\uBB34\uC18C\uC18D")}</div>
                </div>
                <span class="b2w2-note-chip" style="border-color:#fecaca;color:#dc2626;background:#fef2f2">${C.wrDelta}%p</span>
              </div>
              <div class="b2w2-mini-list">
                <div class="b2w2-mini-row"><span style="color:var(--text3)">\uC804\uC801</span><span style="color:var(--text1)">${C.wins}\uC2B9 ${C.losses}\uD328</span></div>
                <div class="b2w2-mini-row"><span style="color:var(--text3)">\uACBD\uAE30 \uC218 \uBCC0\uD654</span><span style="color:var(--text1)">${C.totalDelta>=0?"+":""}${C.totalDelta}\uC804</span></div>
                ${be[1]?`<div class="b2w2-mini-row"><span style="color:var(--text3)">\uB2E4\uC74C</span><span style="color:#dc2626">${((_e=be[1].p)==null?void 0:_e.name)||"-"} ${be[1].wrDelta}%p</span></div>`:""}
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
            ${Q?`
              <div class="b2w2-dual-head">
                <div style="min-width:0">
                  <div class="b2w2-dual-title" style="color:#0891b2">\uC5F0\uC2B9</div>
                  <div class="b2w2-dual-sub"><span style="font-weight:900;color:var(--text1);cursor:pointer" onclick="openPlayerModal('${((De=(ze=Q.p)==null?void 0:ze.name)==null?void 0:De.replace(/\\/g,"\\\\").replace(/'/g,"\\'"))||""}')">${((Se=Q.p)==null?void 0:Se.name)||"-"}</span> \xB7 ${String(((We=Q.p)==null?void 0:We.univ)||"\uBB34\uC18C\uC18D")}</div>
                </div>
                <span class="b2w2-note-chip" style="border-color:#a5f3fc;color:#0891b2;background:#ecfeff">\u{1F525} ${Q.streak}\uC5F0\uC2B9</span>
              </div>
              <div class="b2w2-mini-list">
                ${et.slice(1,3).map((e,t)=>{var i;return`
                  <div class="b2w2-mini-row">
                    <span style="color:var(--text1)">${t+2}. ${((i=e.p)==null?void 0:i.name)||"-"}</span>
                    <span style="color:#0891b2">${e.streak}\uC5F0\uC2B9</span>
                  </div>
                `}).join("")||'<div class="b2w2-mini-row"><span style="color:var(--text3)">\uBCF4\uC870 \uB7AD\uD06C</span><span style="color:#0891b2">\uB2E8\uB3C5 \uC120\uB450</span></div>'}
              </div>
            `:'<div class="b2w2-highlight-desc">2\uC5F0\uC2B9 \uC774\uC0C1 \uAE30\uB85D \uC911\uC778 \uC2A4\uD2B8\uB9AC\uBA38\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.</div>'}
          </div>
          <div class="b2w2-dual-block">
            ${ee?`
              <div class="b2w2-dual-head">
                <div style="min-width:0">
                  <div class="b2w2-dual-title" style="color:#7c3aed">\uC5F0\uD328</div>
                  <div class="b2w2-dual-sub"><span style="font-weight:900;color:var(--text1);cursor:pointer" onclick="openPlayerModal('${((Me=(Pe=ee.p)==null?void 0:Pe.name)==null?void 0:Me.replace(/\\/g,"\\\\").replace(/'/g,"\\'"))||""}')">${((Be=ee.p)==null?void 0:Be.name)||"-"}</span> \xB7 ${String(((Re=ee.p)==null?void 0:Re.univ)||"\uBB34\uC18C\uC18D")}</div>
                </div>
                <span class="b2w2-note-chip" style="border-color:#ddd6fe;color:#7c3aed;background:#f5f3ff">\u{1F4A7} ${ee.streak}\uC5F0\uD328</span>
              </div>
              <div class="b2w2-mini-list">
                ${tt.slice(1,3).map((e,t)=>{var i;return`
                  <div class="b2w2-mini-row">
                    <span style="color:var(--text1)">${t+2}. ${((i=e.p)==null?void 0:i.name)||"-"}</span>
                    <span style="color:#7c3aed">${e.streak}\uC5F0\uD328</span>
                  </div>
                `}).join("")||'<div class="b2w2-mini-row"><span style="color:var(--text3)">\uBCF4\uC870 \uB7AD\uD06C</span><span style="color:#7c3aed">\uB2E8\uB3C5 \uC9D1\uACC4</span></div>'}
              </div>
            `:'<div class="b2w2-highlight-desc">2\uC5F0\uD328 \uC774\uC0C1 \uAE30\uB85D \uC911\uC778 \uC2A4\uD2B8\uB9AC\uBA38\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.</div>'}
          </div>
        </div>
      </article>
      <article class="b2w2-highlight-card" style="--hc-top:#16a34a">
        <div class="b2w2-highlight-kicker" style="color:#16a34a">\u{1F3C5} \uC2B9\uB960 \uC9C0\uD45C</div>
        <div class="b2w2-highlight-title">\uCD5C\uACE0 \uC2B9\uB960</div>
        ${$?`
          <div style="display:flex;align-items:center;justify-content:space-between;gap:12px">
            <div>
              <div style="font-size:18px;font-weight:950;color:var(--text1);cursor:pointer" onclick="openPlayerModal('${((Ie=(Te=$.p)==null?void 0:Te.name)==null?void 0:Ie.replace(/\\/g,"\\\\").replace(/'/g,"\\'"))||""}')">${((Ce=$.p)==null?void 0:Ce.name)||"-"}</div>
              <div style="font-size:12px;color:var(--text3);margin-top:4px">${String(((Fe=$.p)==null?void 0:Fe.univ)||"\uBB34\uC18C\uC18D")}</div>
            </div>
            <span class="b2w2-note-chip" style="border-color:#bbf7d0;color:#16a34a;background:#f0fdf4">${$.winRate}%</span>
          </div>
          <div class="b2w2-highlight-list">
            <div class="b2w2-highlight-row"><span style="font-size:11px;color:var(--text3)">\uC804\uC801</span><strong style="font-size:12px;color:var(--text1)">${$.total}\uC804 ${$.wins}\uC2B9 ${$.losses}\uD328</strong></div>
          </div>
          ${me.length>1?`
          <div class="b2w2-highlight-list" style="margin-top:4px;padding-top:8px;border-top:1px dashed rgba(148,163,184,.25)">
            ${me.slice(1,3).map((e,t)=>{var i,n,s;return`
              <div class="b2w2-highlight-row">
                <span style="font-size:12px;font-weight:800;color:var(--text1);cursor:pointer" onclick="openPlayerModal('${((n=(i=e.p)==null?void 0:i.name)==null?void 0:n.replace(/\\/g,"\\\\").replace(/'/g,"\\'"))||""}')">${t+2}. ${((s=e.p)==null?void 0:s.name)||"-"}</span>
                <strong style="font-size:11px;color:#16a34a">${e.winRate}%</strong>
              </div>
            `}).join("")}
          </div>`:""}
        `:'<div class="b2w2-highlight-desc">3\uC804 \uC774\uC0C1 \uAE30\uB85D\uD55C \uC2A4\uD2B8\uB9AC\uBA38\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.</div>'}
      </article>
      <article class="b2w2-highlight-card" style="--hc-top:#7c3aed">
        <div class="b2w2-highlight-kicker" style="color:#7c3aed">\u2694\uFE0F \uC804\uCCB4 \uACBD\uAE30 \uC9C0\uD45C</div>
        <div class="b2w2-highlight-title">\uCD5C\uB2E4 \uC804\uCCB4 \uACBD\uAE30</div>
        ${E?`
          <div style="display:flex;align-items:center;justify-content:space-between;gap:12px">
            <div>
              <div style="font-size:18px;font-weight:950;color:var(--text1);cursor:pointer" onclick="openPlayerModal('${((Ue=(je=E.p)==null?void 0:je.name)==null?void 0:Ue.replace(/\\/g,"\\\\").replace(/'/g,"\\'"))||""}')">${((Ne=E.p)==null?void 0:Ne.name)||"-"}</div>
              <div style="font-size:12px;color:var(--text3);margin-top:4px">${String(((Ee=E.p)==null?void 0:Ee.univ)||"\uBB34\uC18C\uC18D")}</div>
            </div>
            <span class="b2w2-note-chip" style="border-color:#ddd6fe;color:#7c3aed;background:#f5f3ff">${E.total}\uC804</span>
          </div>
          <div class="b2w2-highlight-list">
            <div class="b2w2-highlight-row"><span style="font-size:11px;color:var(--text3)">\uC804\uCCB4 \uC804\uC801</span><strong style="font-size:12px;color:var(--text1)">${E.wins}\uC2B9 ${E.losses}\uD328 \xB7 ${(Ve=E.winRate)!=null?Ve:"-"}%</strong></div>
          </div>
          ${he.length>1?`
          <div class="b2w2-highlight-list" style="margin-top:4px;padding-top:8px;border-top:1px dashed rgba(148,163,184,.25)">
            ${he.slice(1,3).map((e,t)=>{var i,n,s;return`
              <div class="b2w2-highlight-row">
                <span style="font-size:12px;font-weight:800;color:var(--text1);cursor:pointer" onclick="openPlayerModal('${((n=(i=e.p)==null?void 0:i.name)==null?void 0:n.replace(/\\/g,"\\\\").replace(/'/g,"\\'"))||""}')">${t+2}. ${((s=e.p)==null?void 0:s.name)||"-"}</span>
                <strong style="font-size:11px;color:#7c3aed">${e.total}\uC804</strong>
              </div>
            `}).join("")}
          </div>`:""}
        `:'<div class="b2w2-highlight-desc">\uACBD\uAE30 \uAE30\uB85D\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.</div>'}
      </article>
      <article class="b2w2-highlight-card" style="--hc-top:#f97316">
        <div class="b2w2-highlight-kicker" style="color:#f97316">\u{1F3C6} \uC2B9\uC218 \uC9C0\uD45C</div>
        <div class="b2w2-highlight-title">\uCD5C\uB2E4 \uC2B9\uC218</div>
        ${N?`
          <div style="display:flex;align-items:center;justify-content:space-between;gap:12px">
            <div>
              <div style="font-size:18px;font-weight:950;color:var(--text1);cursor:pointer" onclick="openPlayerModal('${((Ae=(Ge=N.p)==null?void 0:Ge.name)==null?void 0:Ae.replace(/\\/g,"\\\\").replace(/'/g,"\\'"))||""}')">${((Le=N.p)==null?void 0:Le.name)||"-"}</div>
              <div style="font-size:12px;color:var(--text3);margin-top:4px">${String(((Ye=N.p)==null?void 0:Ye.univ)||"\uBB34\uC18C\uC18D")}</div>
            </div>
            <span class="b2w2-note-chip" style="border-color:#fed7aa;color:#c2410c;background:#fff7ed">${N.wins}\uC2B9</span>
          </div>
          <div class="b2w2-highlight-list">
            <div class="b2w2-highlight-row"><span style="font-size:11px;color:var(--text3)">\uC804\uC801</span><strong style="font-size:12px;color:var(--text1)">${N.total}\uC804 ${N.wins}\uC2B9 ${N.losses}\uD328</strong></div>
          </div>
          ${xe.length>1?`
          <div class="b2w2-highlight-list" style="margin-top:4px;padding-top:8px;border-top:1px dashed rgba(148,163,184,.25)">
            ${xe.slice(1,3).map((e,t)=>{var i,n,s;return`
              <div class="b2w2-highlight-row">
                <span style="font-size:12px;font-weight:800;color:var(--text1);cursor:pointer" onclick="openPlayerModal('${((n=(i=e.p)==null?void 0:i.name)==null?void 0:n.replace(/\\/g,"\\\\").replace(/'/g,"\\'"))||""}')">${t+2}. ${((s=e.p)==null?void 0:s.name)||"-"}</span>
                <strong style="font-size:11px;color:#c2410c">${e.wins}\uC2B9</strong>
              </div>
            `}).join("")}
          </div>`:""}
        `:'<div class="b2w2-highlight-desc">\uC2B9\uB9AC \uAE30\uB85D\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.</div>'}
      </article>
      ${(()=>{const e=qe||at[0]||null;return e?ht(e,1,!1,"b2w2-mvp-card-lead"):`<article class="b2w2-highlight-card" style="display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:6px;--hc-top:#f59e0b">
            <div class="b2w2-highlight-kicker" style="color:#b45309">\u{1F3C6} ${He}</div>
            <div class="b2w2-highlight-desc">\uC9D1\uACC4\uD560 \uAE30\uB85D\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.</div>
          </article>`})()}
    </section>`;const Tt=e=>{if(!e.length)return'<div class="b2w2-highlight-desc">\uC6D4\uAC04 \uB300\uD559 \uC21C\uC704\uB97C \uACC4\uC0B0\uD560 \uAE30\uB85D\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.</div>';const t=s=>{var _;const g=(typeof gc=="function"?gc(s.u.name):"#64748b")||"#64748b",p=s.rankDelta===null?"new":s.rankDelta>0?"up":s.rankDelta<0?"down":"same",c=s.rankDelta===null?"NEW":s.rankDelta>0?`\u25B2${s.rankDelta}`:s.rankDelta<0?`\u25BC${Math.abs(s.rankDelta)}`:"\uC720\uC9C0";return`
              <div class="b2w2-rank-row" style="cursor:pointer" onclick="if(typeof openUnivModal==='function')openUnivModal('${s.u.name.replace(/\\/g,"\\\\").replace(/'/g,"\\'")}')">
                <div class="b2w2-rank-main">
                  <span class="b2w2-rank-badge" style="background:${g}18;color:${g}">${s.rank}</span>
                  <div style="min-width:0">
                    <div class="b2w2-rank-name">${s.u.name}</div>
                    <div class="b2w2-rank-sub">
                      <span>${s.tw}\uC2B9 ${s.tl}\uD328</span>
                      <span>\uC2B9\uB960 ${(_=s.wr)!=null?_:0}%</span>
                      <span>${s.tg}\uC804</span>
                    </div>
                  </div>
                </div>
                <span class="b2w2-rank-delta ${p}">${c}</span>
              </div>`},i=e.slice(0,pe),n=e.slice(pe);return`${i.map(t).join("")}${n.length?`
        <div id="${it}" class="b2w2-more-stack" style="display:none">${n.map(t).join("")}</div>
        <button type="button" id="${nt}" class="b2w2-more-btn" onclick="(function(){const more=document.getElementById('${it}');const btn=document.getElementById('${nt}');if(!more||!btn)return;const isOpen=more.style.display!=='none';more.style.display=isOpen?'none':'';btn.textContent=isOpen?'\uC21C\uC704 \uB354 \uBCF4\uAE30':'\uC21C\uC704 \uC811\uAE30';})()">\uC21C\uC704 \uB354 \uBCF4\uAE30</button>
      `:""}`},It=e=>{if(!e.length)return'<div class="b2w2-highlight-desc">\uB300\uD559\uBCC4 \uC5D0\uC774\uC2A4\uB97C \uBF51\uC744 \uC218 \uC788\uB294 \uAE30\uB85D\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.</div>';const t=s=>{var G,_,K,O,te,ae,re,h,de,ye;const g=(typeof gc=="function"?gc(s.u.name):"#64748b")||"#64748b",p=s.ace;if(!p)return`
              <div class="b2w2-ace-empty">
                <div class="b2w2-ace-head" style="margin-bottom:0">
                  <div class="b2w2-ace-univ">
                    <span class="b2w2-ace-dot" style="background:${g}"></span>
                    <span class="b2w2-ace-univ-name">${s.u.name}</span>
                  </div>
                  <span class="b2w2-ace-rank">${s.rank}\uC704 \uB300\uD559</span>
                </div>
                <div class="b2w2-ace-empty-title">\uD655\uC2E4\uD55C \uC5D0\uC774\uC2A4 \uC5C6\uC74C</div>
                <div class="b2w2-ace-empty-sub">\uC774\uBC88 \uAE30\uAC04\uC740 \uAE30\uC900\uC744 \uB9CC\uC871\uD55C \uC2A4\uD2B8\uB9AC\uBA38\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4. \uCD5C\uC18C 3\uC804, \uC2B9\uB960 50% \uC774\uC0C1, \uC21C\uC2B9 \uC6B0\uC138 \uC870\uAC74\uC744 \uC801\uC6A9\uD588\uC2B5\uB2C8\uB2E4.</div>
              </div>`;const c=((G=p.winRate)!=null?G:0)>=70&&((_=p.netWins)!=null?_:0)>=3?{bg:"var(--b2w-paper-alt)",badgeBg:"rgba(16,185,129,.14)",badgeCol:"var(--green)",badgeBorder:"rgba(16,185,129,.36)",label:"\uACE0\uC2B9\uB960"}:((K=p.winRate)!=null?K:0)>=60?{bg:"var(--b2w-paper-alt)",badgeBg:"var(--b2w-tag-accent-bg)",badgeCol:"var(--b2w-accent)",badgeBorder:"var(--b2w-tag-accent-border)",label:"\uC5D0\uC774\uC2A4"}:{bg:"var(--b2w-paper)",badgeBg:"var(--b2w-paper-alt)",badgeCol:"var(--b2w-ink-mid)",badgeBorder:"var(--b2w-rule)",label:"\uADFC\uC18C \uC6B0\uC138"};return`
              <div class="b2w2-ace-card" style="background:${c.bg};border-color:${g}22">
                <div class="b2w2-ace-head">
                  <div class="b2w2-ace-univ">
                    <span class="b2w2-ace-dot" style="background:${g}"></span>
                    <span class="b2w2-ace-univ-name">${s.u.name}</span>
                  </div>
                  <span class="b2w2-ace-rank">${s.rank}\uC704 \uB300\uD559</span>
                </div>
                <div class="b2w2-ace-player">
                  <div style="min-width:0">
                    <div class="b2w2-ace-player-name" onclick="openPlayerModal('${((te=(O=p.p)==null?void 0:O.name)==null?void 0:te.replace(/\\/g,"\\\\").replace(/'/g,"\\'"))||""}')">${((ae=p.p)==null?void 0:ae.name)||"-"}</div>
                    <div class="b2w2-ace-player-sub">
                      <span>${p.wins}\uC2B9 ${p.losses}\uD328</span>
                      <span style="color:${((re=p.winRate)!=null?re:0)>=60?"var(--green)":((h=p.winRate)!=null?h:0)>=50?"var(--b2w-accent)":"var(--gray)"}">\uC2B9\uB960 ${(de=p.winRate)!=null?de:0}%</span>
                      <span>\uC21C\uC2B9 +${(ye=p.netWins)!=null?ye:0}</span>
                      <span>${p.total}\uC804</span>
                    </div>
                  </div>
                  <div style="display:flex;align-items:center;gap:3px;flex-shrink:0">${_b2WeeklyForm(p.hist)}</div>
                </div>
                <div class="b2w2-ace-badges">
                  <span class="b2w2-ace-badge" style="background:${c.badgeBg};color:${c.badgeCol};border-color:${c.badgeBorder}">${c.label}</span>
                  ${(p.netWins||0)>=3?'<span class="b2w2-ace-badge">\uC21C\uC2B9 \uAC15\uC138</span>':""}
                </div>
              </div>`},i=e.slice(0,pe),n=e.slice(pe);return`${i.map(t).join("")}${n.length?`
        <div id="${st}" class="b2w2-more-stack" style="display:none">${n.map(t).join("")}</div>
        <button type="button" id="${lt}" class="b2w2-more-btn" onclick="(function(){const more=document.getElementById('${st}');const btn=document.getElementById('${lt}');if(!more||!btn)return;const isOpen=more.style.display!=='none';more.style.display=isOpen?'none':'';btn.textContent=isOpen?'\uC5D0\uC774\uC2A4 \uB354 \uBCF4\uAE30':'\uC5D0\uC774\uC2A4 \uC811\uAE30';})()">\uC5D0\uC774\uC2A4 \uB354 \uBCF4\uAE30</button>
      `:""}`};v&&D==="\uC804\uCCB4"&&(w+=`<section class="b2w2-monthly-grid">
        <article class="b2w2-highlight-card">
          <div class="b2w2-highlight-kicker">University Ranking</div>
          <div class="b2w2-highlight-title">${u==="thisMonth"?"\uC774\uBC88\uB2EC \uB300\uD559 \uC21C\uC704":"\uC9C0\uB09C\uB2EC \uB300\uD559 \uC21C\uC704"}</div>
          <div class="b2w2-highlight-desc">\uC2B9 \uC218\uB97C \uC6B0\uC120\uC73C\uB85C \uC815\uB82C\uD558\uACE0, \uB3D9\uB960\uC77C \uB54C \uC2B9\uB960\uACFC \uACBD\uAE30 \uC218\uB97C \uD568\uAED8 \uBC18\uC601\uD588\uC2B5\uB2C8\uB2E4.</div>
          <div class="b2w2-rank-list">
            ${Tt(rt)}
          </div>
        </article>
        <article class="b2w2-highlight-card">
          <div class="b2w2-highlight-kicker">University Aces</div>
          <div class="b2w2-highlight-title">${u==="thisMonth"?"\uB300\uD559\uBCC4 \uC5D0\uC774\uC2A4":"\uC9C0\uB09C\uB2EC \uB300\uD559\uBCC4 \uC5D0\uC774\uC2A4"}</div>
          <div class="b2w2-highlight-desc">\uCD5C\uC18C 3\uC804, \uC2B9\uB960 50% \uC774\uC0C1, \uC21C\uC2B9 \uC6B0\uC120 \uAE30\uC900\uC73C\uB85C \uBF51\uC558\uC2B5\uB2C8\uB2E4. \uC870\uAC74 \uBBF8\uB2EC \uB300\uD559\uC740 \uBCC4\uB3C4 \uC548\uB0B4\uB85C \uD45C\uC2DC\uD569\uB2C8\uB2E4.</div>
          <div class="b2w2-ace-list">
            ${It(ot)}
          </div>
        </article>
      </section>`),A.length&&(w+=`<div class="b2w2-note-row">
        <span style="font-size:11px;font-weight:900;color:var(--text3)">\uAE30\uB85D \uC5C6\uB294 \uB300\uD559</span>
        ${A.slice(0,8).map(e=>`<span class="b2w2-note-chip">${e}</span>`).join("")}
        ${A.length>8?`<span style="font-size:11px;color:var(--text3);font-weight:800">\uC678 ${A.length-8}\uACF3</span>`:""}
      </div>`),D==="\uC804\uCCB4"&&z.some(e=>e.tg>0)&&(w+=`<div class="b2w2-chart-box">
        <div class="b2w2-chart-title">\u{1F4CA} \uB300\uD559\uBCC4 \uC804\uC801 \uD604\uD669 (\uC774\uBC88 \uAE30\uAC04)</div>
        ${_b2WeeklyBarChart(z)}
        <div style="display:flex;align-items:center;gap:12px;margin-top:8px;flex-wrap:wrap">
          <div style="display:flex;align-items:center;gap:4px"><div style="width:12px;height:8px;border-radius:2px;background:#dc2626;opacity:.9"></div><span style="font-size:10px;font-weight:700;color:var(--text2)">\uC2B9</span></div>
          <div style="display:flex;align-items:center;gap:4px"><div style="width:12px;height:8px;border-radius:2px;background:#94a3b8;opacity:.85"></div><span style="font-size:10px;font-weight:700;color:var(--text2)">\uD328</span></div>
          <span style="font-size:10px;color:var(--text3)">\uC6B0\uCE21: \uC2B9\uB960 / \uACBD\uAE30\uC218</span>
        </div>
      </div>`);const Y={P:{w:0,l:0},T:{w:0,l:0},Z:{w:0,l:0}};if(ve.forEach(e=>{["P","T","Z"].forEach(t=>{Y[t].w+=e.raceCount[t].w,Y[t].l+=e.raceCount[t].l})}),["P","T","Z"].some(e=>Y[e].w+Y[e].l>0)){const t=["P","T","Z"].map(n=>{const{w:s,l:g}=Y[n],p=s+g;return{r:n,t:p,wr:p?Math.round(s/p*100):null}}).filter(n=>n.t>0).sort((n,s)=>{var g,p;return((g=s.wr)!=null?g:-1)-((p=n.wr)!=null?p:-1)})[0],i={P:"\uD504\uB85C\uD1A0\uC2A4",T:"\uD14C\uB780",Z:"\uC800\uADF8"};w+=`<div class="b2w2-chart-box">
        <div class="b2w2-chart-title">\u2694\uFE0F \uC885\uC871\uC804 \uBA54\uD0C0 (${D==="\uC804\uCCB4"?"\uC804\uCCB4":D} \xB7 ${U.short})</div>
        ${_b2WeeklyRaceStats(Y)}
        ${t?`<div style="margin-top:8px;font-size:11px;font-weight:700;color:var(--text3)">${i[t.r]} \uC9C4\uC601\uC774 \uC0C1\uB300 \uC885\uC871\uC804 \uC2B9\uB960 ${t.wr}%\uB85C \uAC00\uC7A5 \uAC15\uC138\uC785\uB2C8\uB2E4.</div>`:""}
      </div>`}return ve.filter(e=>e.tg>0).forEach((e,t)=>{const{u:i,active:n,tw:s,tl:g,tg:p,wr:c,raceCount:G}=e,_=(gc?gc(i.name):"#64748b")||"#64748b",K=Xe[i.name],O=K&&K.tg>0?K.wr:null,te=c===null?"":c>=60?"#10b981":c>=40?"#f59e0b":"#ef4444",ae=`b2w2-body-${t}`,re=`b2w2-ic-${t}`,h=_b2WeeklyUnivMVP(n),de=[...n].sort((B,F)=>{const f=B.total?B.wins/B.total:0,ce=F.total?F.wins/F.total:0;return f!==ce?ce-f:F.total-B.total});w+=`<div class="b2w2-card" style="border-top:3px solid ${_}">
        <div class="b2w2-card-head" style="background:linear-gradient(135deg, ${_}17 0%, ${_}08 55%, transparent 100%)" onclick="(function(){
          const b=document.getElementById('${ae}');
          const ic=document.getElementById('${re}');
          const sub=document.getElementById('b2w2-sub-${t}');
          if(!b)return;
          const show=b.style.display==='none';
          b.style.display=show?'':'none';
          if(ic)ic.textContent=show?'\u25BC':'\u25B6';
          if(sub)sub.style.display=show?'none':'flex';
        })()">
          <div class="b2w2-card-title">
            <span class="b2w2-card-dot" style="background:${_}"></span>
            <div style="min-width:0">
              <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
                <div class="b2w2-card-name">${i.name}</div>
                <button type="button" onclick="event.stopPropagation();if(typeof openUnivModal==='function')openUnivModal('${i.name.replace(/\\/g,"\\\\").replace(/'/g,"\\'")}')" style="font-size:10px;font-weight:800;padding:3px 9px;border-radius:999px;border:1.5px solid ${_};background:var(--b2w-paper-alt);color:${_};cursor:pointer;white-space:nowrap;line-height:1.6;box-shadow:0 1px 3px rgba(0,0,0,.08)">\u{1F3EB} \uB300\uD559\uC0C1\uC138</button>
              </div>
              <div id="b2w2-sub-${t}" class="b2w2-card-sub" style="display:none">
                <span>\uD65C\uB3D9 ${n.length}\uBA85</span>
                <span>${p}\uC804 ${s}\uC2B9 ${g}\uD328</span>
                ${c!==null?`<span style="font-weight:900;color:${te}">\uC2B9\uB960 ${c}%${_b2WeeklyDelta(c,O)}</span>`:""}
              </div>
            </div>
          </div>
          <span id="${re}" class="b2w2-card-chevron">\u25BC</span>
        </div>
        <div id="${ae}" class="b2w2-card-body">
          <div class="b2w2-card-summary">
            <div class="b2w2-card-kpis">
              <div class="b2w2-card-kpi">
                <div class="b2w2-card-kpi-label">\uD65C\uB3D9 \uC778\uC6D0</div>
                <div class="b2w2-card-kpi-value">${n.length}\uBA85</div>
                <div class="b2w2-card-kpi-sub">\uC774\uBC88 \uAE30\uAC04 \uCD9C\uC804 \uC2A4\uD2B8\uB9AC\uBA38</div>
              </div>
              <div class="b2w2-card-kpi">
                <div class="b2w2-card-kpi-label">\uD300 \uC804\uC801</div>
                <div class="b2w2-card-kpi-value">${s}<span style="color:#dc2626">\uC2B9</span> ${g}<span style="color:#64748b">\uD328</span></div>
                <div class="b2w2-card-kpi-sub">\uCD1D ${p}\uC804 \uC18C\uD654</div>
              </div>
              <div class="b2w2-card-kpi">
                <div class="b2w2-card-kpi-label">\uD300 \uC2B9\uB960</div>
                <div class="b2w2-card-kpi-value" style="color:${te}">${c!==null?`${c}%`:"-"}</div>
                <div class="b2w2-card-kpi-sub">${O!==null&&c!==null?`\uC804\uAE30 \uB300\uBE44 ${_b2WeeklyDelta(c,O)}`:"\uBE44\uAD50 \uB370\uC774\uD130 \uC5C6\uC74C"}</div>
              </div>
            </div>
            <div class="b2w2-card-spotlight">
              ${h?`
                <div class="b2w2-card-spotlight-kicker">\uB300\uD559\uBCC4 \uC5D0\uC774\uC2A4</div>
                <div class="b2w2-card-spotlight-title">
                  <span onclick="openPlayerModal(this.dataset.n);event.stopPropagation()" data-n="${h.p.name}" style="cursor:pointer;border-bottom:1.5px solid ${_}55">${h.p.name}</span>
                  ${h.p.tier?`<span style="font-size:10px;padding:2px 6px;border-radius:999px;background:${typeof getTierBtnColor=="function"?getTierBtnColor(h.p.tier):"#64748b"};color:${typeof getTierBtnTextColor=="function"&&getTierBtnTextColor(h.p.tier)||"#fff"}">${h.p.tier}</span>`:""}
                </div>
                <div class="b2w2-card-spotlight-sub">
                  <span>${h.wins}\uC2B9 ${h.losses}\uD328</span>
                  <span>\uC2B9\uB960 ${h.winRate}%</span>
                </div>
              `:`
                <div class="b2w2-card-spotlight-kicker">\uB300\uD559\uBCC4 \uC5D0\uC774\uC2A4</div>
                <div class="b2w2-card-spotlight-title">\uC774\uBC88 \uAE30\uAC04 \uD655\uC2E4\uD55C \uC5D0\uC774\uC2A4 \uC5C6\uC74C</div>
                <div class="b2w2-card-spotlight-sub">\uCD5C\uC18C \uACBD\uAE30 \uC218\uC640 \uC2B9\uB960 \uAE30\uC900\uC744 \uB3D9\uC2DC\uC5D0 \uB9CC\uC871\uD55C \uC2A4\uD2B8\uB9AC\uBA38\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.</div>
              `}
            </div>
          </div>`,w+=`<div class="b2w2-table-wrap"><table class="b2w2-tbl"><thead><tr>
        <th style="width:28px">#</th>
        <th>\uC2A4\uD2B8\uB9AC\uBA38</th>
        <th>\uC804\uCCB4 \uC804\uC801</th>
        <th>\uCD5C\uADFC \uD3FC</th>
      </tr></thead><tbody>`,de.forEach((B,F)=>{const{p:f,wins:ce,losses:Ct,total:Ft,winRate:Z,offWins:aa,offLosses:ra}=B,jt=Z===null?"#94a3b8":Z>=60?"#10b981":Z>=40?"#f59e0b":"#ef4444",Ut=typeof getTierBtnColor=="function"&&f.tier?getTierBtnColor(f.tier):"#64748b",Nt=typeof getTierBtnTextColor=="function"&&f.tier&&getTierBtnTextColor(f.tier)||"#fff",pt=f.race==="P"?"\u{1F52E}":f.race==="T"?"\u2694\uFE0F":f.race==="Z"?"\u{1F98E}":"",Et=F===0?"\u{1F947}":F===1?"\u{1F948}":F===2?"\u{1F949}":`${F+1}`,dt=h&&h.p===f,ke=fe[f.name]||null,Vt=ke&&ke.total>0?ke.winRate:null;w+=`<tr ${dt?'style="background:#fef9c322"':""}>
          <td style="font-size:11px;font-weight:900;color:var(--text3);text-align:center">${Et}</td>
          <td>
            <span onclick="openPlayerModal(this.dataset.n);event.stopPropagation()" data-n="${f.name}" style="font-size:13px;font-weight:900;color:var(--text1);cursor:pointer;border-bottom:1.5px solid var(--border2);padding-bottom:1px">${f.name}</span>
            ${pt?`<span style="font-size:13px;margin-left:2px">${pt}</span>`:""}
            ${f.tier?`<span style="font-size:12px;padding:1px 5px;border-radius:4px;background:${Ut};color:${Nt};margin-left:3px">${f.tier}</span>`:""}
            ${dt?'<span style="font-size:11px;background:#fef9c3;color:#b45309;padding:1px 4px;border-radius:4px;margin-left:3px;font-weight:800">MVP</span>':""}
          </td>
          <td>
            <div style="font-size:13px;font-weight:800;color:var(--text1)">${Ft}\uC804 <span style="color:#dc2626">${ce}\uC2B9</span> <span style="color:#64748b">${Ct}\uD328</span></div>
            ${Z!==null?`<div style="margin-top:2px;font-size:11px;font-weight:700;color:${jt}">${Z}%${_b2WeeklyDelta(Z,Vt)}</div>`:""}
          </td>
          <td><div style="display:flex;align-items:center;gap:2px">${_b2WeeklyForm(B.hist)}</div></td>
        </tr>`}),w+="</tbody></table></div>",["P","T","Z"].some(B=>G[B].w+G[B].l>0)&&(w+=`<div class="b2w2-race-box">
          <div class="b2w2-race-title">\u2694\uFE0F \uC885\uC871\uBCC4 \uC0C1\uB300 \uC804\uC801 (\uB300\uD559 \uC804\uCCB4)</div>
          ${_b2WeeklyRaceStats(G)}
        </div>`),w+="</div></div>"}),w+="</div>",w}catch(H){return console.error("[_b2WeeklyBriefingView v2] \uC624\uB958:",H),`<div style="padding:40px;text-align:center;color:#dc2626">\uBE0C\uB9AC\uD551 \uC624\uB958: ${H.message}</div>`}}
