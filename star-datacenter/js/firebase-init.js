/* ══════════════════════════════════════
   GitHub data.json 동기화 호환 레이어
   - 파일명은 firebase-init.js 유지(기존 참조 호환)
   - 실제 동작은 Firebase를 쓰지 않고 GitHub data.json 업로드/폴링만 수행
══════════════════════════════════════ */

const GH_API_URL = 'https://api.github.com/repos/nada1004/star-system/contents/star-datacenter/data.json';
const GH_RAW_URL = 'https://raw.githubusercontent.com/nada1004/star-system/main/star-datacenter/data.json';
const GH_CDN_URL = 'https://cdn.jsdelivr.net/gh/nada1004/star-system@main/star-datacenter/data.json';

let _pending = null;
let _lastSnapshot = null;
let _lastSavedAt = 0;

function _deliver(data) {
  _lastSnapshot = data;
  try{
    const sa = Number(data && data.savedAt || 0) || 0;
    if(sa) _lastSavedAt = sa;
  }catch(e){}
  if (typeof window.onFirebaseLoad === 'function') window.onFirebaseLoad(data);
  else _pending = data;
}

let _fbCallbackSet = false;
(function pollCallback() {
  if (_fbCallbackSet) return;
  if (typeof window.onFirebaseLoad === 'function' && _pending) {
    _fbCallbackSet = true;
    window.onFirebaseLoad(_pending);
    _pending = null;
  } else {
    setTimeout(pollCallback, 200);
  }
})();

function _decodeGithubPayload(raw){
  let d = raw;
  if(d && d.content && d.encoding === 'base64'){
    const b64 = String(d.content || '').replace(/\s/g,'');
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for(let i=0;i<bin.length;i++) bytes[i] = bin.charCodeAt(i);
    d = JSON.parse(new TextDecoder('utf-8').decode(bytes));
  }
  if(d && typeof d._lz === 'string' && window.LZString){
    d = JSON.parse(window.LZString.decompressFromBase64(d._lz));
  }
  return d;
}

async function _fetchGithubData(){
  const urls = [
    GH_RAW_URL + '?_=' + Date.now(),
    GH_CDN_URL + '?_=' + Date.now(),
    GH_API_URL
  ];
  let lastErr = null;
  for(const url of urls){
    try{
      const res = await fetch(url, { cache:'no-store', mode:'cors' });
      if(!res.ok) throw new Error('HTTP ' + res.status);
      const text = (await res.text()).replace(/^\uFEFF/, '').trim();
      if(!text || text.startsWith('<')) throw new Error('invalid response');
      const raw = JSON.parse(text);
      return _decodeGithubPayload(raw);
    }catch(e){
      lastErr = e;
    }
  }
  throw lastErr || new Error('GitHub data.json fetch failed');
}

async function _putGithubPayloadOnce(payloadObj){
  const token = localStorage.getItem('su_gh_token');
  if(!token) throw new Error('GitHub 토큰이 설정되어 있지 않습니다.');

  const getRes = await fetch(GH_API_URL, {
    headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3+json' }
  });
  if (!getRes.ok) throw new Error('GitHub 파일 조회 실패: ' + getRes.status);
  const fileInfo = await getRes.json();

  const jsonStr = JSON.stringify(payloadObj);
  const b64 = btoa(unescape(encodeURIComponent(jsonStr)));
  const putRes = await fetch(GH_API_URL, {
    method: 'PUT',
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: `data.json 업데이트 ${new Date().toLocaleString('ko-KR')}`,
      content: b64,
      sha: fileInfo.sha
    })
  });
  if (!putRes.ok) throw new Error('GitHub 저장 실패: ' + putRes.status);
}

async function _putGithubPayload(payloadObj){
  let lastErr = null;
  for(let attempt=0; attempt<3; attempt++){
    try{
      return await _putGithubPayloadOnce(payloadObj);
    }catch(e){
      lastErr = e;
      const msg = String((e && e.message) || e || '');
      // 409 = sha 충돌(다른 기기/탭에서 먼저 저장)
      if(!/409/.test(msg)) throw e;
      await new Promise(r=>setTimeout(r, 250 * (attempt + 1)));
    }
  }
  throw lastErr || new Error('GitHub 저장 실패: 409');
}

async function _pollGithubOnce(force){
  try{
    const d = await _fetchGithubData();
    const sa = Number(d && d.savedAt || 0) || 0;
    if(force || (sa && sa > _lastSavedAt) || !_lastSnapshot){
      _deliver(d);
    }
  }catch(e){}
}

// 데이터 쓰기 함수 (기존 fbSet 호환)
// - data는 보통 { _lz: '...' } 형태로 들어옴
window.fbSet = async function (data) {
  await _putGithubPayload(data);
};

// 부분 업데이트 호환
// - 현재 GitHub data.json을 읽어서 병합 후 다시 업로드
window.fbUpdate = async function (patch) {
  const cur = await _fetchGithubData().catch(()=>({}));
  const next = { ...(cur || {}), ...(patch || {}), savedAt: Date.now() };
  const compressed = window.LZString
    ? window.LZString.compressToBase64(JSON.stringify(next))
    : null;
  const payload = compressed ? { _lz: compressed } : next;
  await _putGithubPayload(payload);
};

// 강제 1회 fetch (수동 동기화 버튼용)
window.fbForceSync = async function () {
  const data = await _fetchGithubData();
  if (!data) return;
  _lastSnapshot = data;
  if (typeof window.onFirebaseLoad === 'function') {
    window._forcingSync = true;
    window.onFirebaseLoad(data);
    window._forcingSync = false;
  }
};

// 초기 로드 + 주기적 GitHub polling
setTimeout(()=>{ _pollGithubOnce(true); }, 600);
setInterval(()=>{
  if(document.visibilityState !== 'visible') return;
  _pollGithubOnce(false);
}, 10000);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') _pollGithubOnce(true);
});
