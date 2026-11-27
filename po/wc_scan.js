// W컨셉 2단계: https://www.wconcept.co.kr/ 아무 페이지에서 실행. __NEW__ 자리에 1단계 new의 상품번호 배열(JSON, 예: ["309300001"]) 넣기.
// W컨셉은 빨리 많이 열면 "Too Many Requests"로 막혀서 한 번에 하나씩 천천히.
const W=ms=>new Promise(r=>setTimeout(r,ms));const NEWIDS=__NEW__;
const IDS=(await fetch('https://raw.githubusercontent.com/lovlovseoul/lovlovsales/main/po/ids.json?'+Date.now()).then(r=>r.json())).ids.wconcept.map(x=>x[0]);
const all=[...new Set([...IDS,...NEWIDS])];
const dec=s=>{const t=document.createElement('textarea');t.innerHTML=s;return t.value;};
const hits=[],fails=[];let gone=0,slow=0;
for(const id of all){let h='',ok=false;for(let t=0;t<3&&!ok;t++){try{const r=await fetch('/Product/'+id);h=await r.text();if(r.status===429||h.length<5000){slow++;await W(8000*(t+1));continue;}ok=true;}catch(e){await W(3000);}}
 if(!ok){fails.push(id);continue;}
 if(!/class="pdt_name|class="product_name|class="price_wrap/.test(h)&&!/maintransdate/.test(h)){gone++;continue;}
 if(/class="reservation"/.test(h)){const di=dec(((h.match(/<dd class="delivery_info">\s*<p>([\s\S]*?)<\/p>/)||[])[1]||'').replace(/<[^>]+>/g,' ')).replace(/\s+/g,' ').trim();const d=(h.match(/var maintransdate\s*=\s*'([^']*)'/)||[])[1]||'';
  const nt=[...h.matchAll(/<h4>([^<]*예약[^<]*)<\/h4>\s*<div class="reservation_cont">([\s\S]{0,700}?)<\/div>\s*<\/div>/g)].map(m=>dec((m[1]+': '+m[2]).replace(/<[^>]+>/g,' ')).replace(/\s+/g,' ').trim()).join(' / ');
  hits.push([id,d,(nt||di).slice(0,220)]);}
 await W(700);}
window.__po=JSON.stringify({ch:'wconcept',scanned:all.length,gone,slow,fails,hits});
[window.__po.length,window.__po.slice(0,900)].join(' ')
