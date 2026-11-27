// W컨셉 2단계: https://www.wconcept.co.kr/ 아무 페이지에서 실행. __NEW__ 자리에 build_po.py 1단계가 만든 wc 배열(JSON, 예: ["309300001"]) 넣기.
// W컨셉은 빨리 많이 열면 "Too Many Requests"로 막혀서 한 번에 하나씩 천천히.
// 백그라운드로 돌고 끝나면 window.__po 에 결과(JSON 문자열). 진행 확인: window.__po ? window.__po.length+' '+window.__po.slice(0,900) : '진행중 '+(window.__prog||'')
window.__po=null;window.__prog='';(async()=>{try{
const W=ms=>new Promise(r=>setTimeout(r,ms));const NEWIDS=__NEW__;
const IDS=(await fetch('https://raw.githubusercontent.com/lovlovseoul/lovlovsales/main/po/ids.json?'+Date.now()).then(r=>r.json())).ids.wconcept.filter(x=>+x[0]>=308900000).map(x=>x[0]);  // 최근 상품만 (W컨셉 차단 방지) + __NEW__ 로 받은 후보
const all=[...new Set([...IDS,...NEWIDS])];
const dec=s=>{const t=document.createElement('textarea');t.innerHTML=s;return t.value;};
const hits=[],fails=[];let gone=0,slow=0;
let __i=0;for(const id of all){window.__prog=(++__i)+"/"+all.length;let h='',ok=false;for(let t=0;t<3&&!ok;t++){try{const r=await fetch('/Product/'+id);h=await r.text();if(r.status===429||h.length<5000){slow++;await W(8000*(t+1));continue;}ok=true;}catch(e){await W(3000);}}
 if(!ok){fails.push(id);continue;}
 if(!/var maintransdate/.test(h)){fails.push(id);continue;}
 if(/class="reservation"/.test(h)){const di=dec(((h.match(/<dd class="delivery_info">\s*<p>([\s\S]*?)<\/p>/)||[])[1]||'').replace(/<[^>]+>/g,' ')).replace(/\s+/g,' ').trim();const d=(h.match(/var maintransdate\s*=\s*'([^']*)'/)||[])[1]||'';
  const nt=[...h.matchAll(/<h4>([^<]*예약[^<]*)<\/h4>\s*<div class="reservation_cont">([\s\S]{0,700}?)<\/div>\s*<\/div>/g)].map(m=>dec((m[1]+': '+m[2]).replace(/<[^>]+>/g,' ')).replace(/\s+/g,' ').trim()).join(' / ');
  hits.push([id,d,(nt||di).slice(0,220)]);}
 await W(900);}
window.__po=JSON.stringify({ch:'wconcept',scanned:all.length,gone,slow,fails,hits});
}catch(e){window.__po=JSON.stringify({err:String(e)});}})();'started'
