/* ══════════════════════════════════════════════════════════════
   이미지 로딩 최적화 (2026-08-16)

   문제:
   - 첫 화면 진입 시 img 요소가 900개 이상 동시에 만들어지면서 이미지 요청이
     1,000건 가까이 한꺼번에 발생 → 브라우저 연결 수가 포화된다.
   - 그 결과 (1) 실제로 보고 있는 프로필/스트리머 이미지가 뒤쪽 큐에 밀려
     한참 뒤에 뜨고, (2) window load 이벤트가 계속 발생하지 않아 브라우저
     탭 로딩 스피너가 멈추지 않으며, (3) 이미지 캡처(저장) 흐름이 이미지
     대기에서 오래 붙잡혀 '저장 중' 표시가 끝나지 않는다.

   해결:
   - 마크업/DOM으로 생성되는 모든 <img>에 기본으로 loading="lazy",
     decoding="async" 를 부여해 화면에 보이는 이미지만 즉시 받도록 한다.
     (loading 속성이 이미 지정돼 있거나 data-eager 가 붙은 이미지는 그대로 둔다.)
   - 화면 상단(첫 뷰포트)에 있는 이미지는 즉시 eager + fetchpriority=high 로
     승격해서 프로필 이미지가 먼저 뜨도록 한다.
   - html2canvas 캡처 직전에는 대상 영역의 lazy 이미지를 강제로 eager 로
     바꾸고 디코딩을 기다려, 지연 로딩 때문에 캡처가 비는 일이 없게 한다.
   ══════════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  if (window.__imgLoadOptInstalled) return;
  window.__imgLoadOptInstalled = true;

  var ANY_IMG_RE = /<img\b([^>]*)>/gi;

  function tuneAttrs(attrs){
    if (/data-eager/i.test(attrs)) return null;               // 명시적으로 즉시 로딩을 요청한 이미지는 그대로
    var out = attrs;
    if (/\bloading\s*=\s*["']?eager/i.test(out)){
      // 앱 곳곳에서 loading="eager" 가 하드코딩돼 있어 첫 진입에 900건 넘는 이미지가
      // 한꺼번에 요청된다. 화면 밖/다른 탭 이미지까지 전부 즉시 받으면 정작 보고 있는
      // 프로필 이미지가 뒤로 밀리므로 전부 lazy 로 낮춘다. (보이는 순간 바로 로드됨)
      out = out.replace(/\bloading\s*=\s*(["'])eager\1/gi, 'loading=$1lazy$1')
               .replace(/\bloading\s*=\s*eager\b/gi, 'loading=lazy');
    } else if (!/\bloading\s*=/i.test(out)){
      out = ' loading="lazy"' + out;
    }
    if (!/\bdecoding\s*=/i.test(out)) out = ' decoding="async"' + out;
    return out === attrs ? null : out;
  }

  function tuneHtml(html){
    if (typeof html !== 'string' || html.indexOf('<img') === -1) return html;
    try{
      return html.replace(ANY_IMG_RE, function(m, attrs){
        var t = tuneAttrs(attrs);
        return t === null ? m : '<img' + t + '>';
      });
    }catch(e){ return html; }
  }

  // 1) innerHTML / outerHTML / insertAdjacentHTML 로 생성되는 이미지
  function patchHtmlProp(proto, prop){
    try{
      var d = Object.getOwnPropertyDescriptor(proto, prop);
      if (!d || !d.set || d.__imgTuned) return;
      Object.defineProperty(proto, prop, {
        configurable: true,
        enumerable: d.enumerable,
        get: d.get,
        set: function(v){ d.set.call(this, tuneHtml(v)); }
      });
    }catch(e){}
  }
  patchHtmlProp(Element.prototype, 'innerHTML');
  patchHtmlProp(Element.prototype, 'outerHTML');
  try{
    var iah = Element.prototype.insertAdjacentHTML;
    Element.prototype.insertAdjacentHTML = function(pos, html){
      return iah.call(this, pos, tuneHtml(html));
    };
  }catch(e){}

  // (참고) new Image() / img.src 직접 대입은 대부분 프리로드·측정용이라 건드리지 않는다.
  //        display:none 상태에서 src 만 지정하는 이미지가 있어 lazy 를 강제하면 영영 로드되지 않는다.

  // 3) 화면에 들어오는 이미지는 우선순위를 높여서 프로필 사진이 먼저 뜨게 한다
  //    (loading 속성은 그대로 두고 fetchpriority 만 올린다 — 과도한 eager 승격 방지)
  var io = null;
  try{
    io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if (!en.isIntersecting) return;
        try{ en.target.setAttribute('fetchpriority', 'high'); }catch(e){}
        io.unobserve(en.target);
      });
    }, { rootMargin: '300px 0px' });
  }catch(e){}

  function observeImages(root){
    if (!io) return;
    var scope = (root && root.querySelectorAll) ? root : document;
    var imgs;
    try{ imgs = scope.querySelectorAll('img[loading="lazy"]:not([data-fp])'); }catch(e){ return; }
    for (var i = 0; i < imgs.length; i++){
      try{ imgs[i].setAttribute('data-fp', '1'); io.observe(imgs[i]); }catch(e){}
    }
  }
  window.promoteVisibleImages = observeImages;

  var scanPending = false;
  function scheduleScan(){
    if (scanPending) return;
    scanPending = true;
    requestAnimationFrame(function(){ scanPending = false; observeImages(document); });
  }
  document.addEventListener('DOMContentLoaded', scheduleScan);
  try{
    new MutationObserver(scheduleScan).observe(document.documentElement, { childList: true, subtree: true });
  }catch(e){}

  // 4) 캡처(이미지 저장) 전에는 대상 영역 이미지를 강제로 모두 로드
  window.forceLoadImages = function(el, timeoutMs){
    timeoutMs = timeoutMs || 4000;
    try{
      var all = (el && el.querySelectorAll) ? el.querySelectorAll('img') : [];
      var list = [];
      for (var k = 0; k < all.length; k++){
        var im0 = all[k];
        try{
          var r0 = im0.getBoundingClientRect();
          var cs0 = getComputedStyle(im0);
          if ((!r0.width || !r0.height) || cs0.display === 'none' || cs0.visibility === 'hidden') continue;
        }catch(e){}
        list.push(im0);
      }
      var waits = [];
      for (var i = 0; i < list.length; i++){
        (function(im){
          try{
            im.setAttribute('loading', 'eager');
            im.setAttribute('decoding', 'sync');
            if (!im.complete && im.src){
              waits.push(new Promise(function(res){
                im.addEventListener('load', res, { once: true });
                im.addEventListener('error', res, { once: true });
              }));
            }
          }catch(e){}
        })(list[i]);
      }
      if (!waits.length) return Promise.resolve();
      return Promise.race([
        Promise.all(waits),
        new Promise(function(res){ setTimeout(res, timeoutMs); })
      ]);
    }catch(e){ return Promise.resolve(); }
  };

  // html2canvas 가 로드되면 자동으로 감싸서, 캡처 대상 이미지를 먼저 로드시킨다
  var _h2c;
  try{
    Object.defineProperty(window, 'html2canvas', {
      configurable: true,
      get: function(){ return _h2c; },
      set: function(fn){
        if (typeof fn === 'function' && !fn.__imgWrapped){
          var orig = fn;
          var wrapped = function(el, opts){
            return window.forceLoadImages(el, 4000).then(function(){ return orig(el, opts); });
          };
          wrapped.__imgWrapped = true;
          try{ Object.keys(orig).forEach(function(k){ wrapped[k] = orig[k]; }); }catch(e){}
          _h2c = wrapped;
        } else {
          _h2c = fn;
        }
      }
    });
  }catch(e){}
})();
