// 29CM: https://www.29cm.co.kr/store/search?keyword=로브로브&sort=RECOMMENDED&page=1 페이지에서 실행
const W=ms=>new Promise(r=>setTimeout(r,ms));
const IDS=(await fetch('https://raw.githubusercontent.com/lovlovseoul/lovlovsales/main/po/ids.json?'+Date.now()).then(r=>r.json())).ids['29cm'].map(x=>x[0]);
const S=new Map();const grab=()=>document.querySelectorAll('a[href*="/catalog/"]').forEach(a=>{const m=a.href.match(/catalog\/(\d+)/);if(m&&!S.has(m[1]))S.set(m[1],(a.getAttribute('title')||'').replace(/\s+/g,' ').trim().slice(0,70));});
await W(2500);for(let p=1;p<=15;p++){for(let i=0;i<10;i++){window.scrollBy(0,2500);await W(250);}await W(600);grab();const nx=[...document.querySelectorAll('button,a')].find(b=>b.textContent.trim()===String(p+1));if(!nx)break;nx.click();await W(2200);window.scrollTo(0,0);}
const all=[...new Set([...IDS,...S.keys()])];const NEW=[...S.keys()].filter(x=>!IDS.includes(x)).map(x=>[x,S.get(x)]);
const g=(h,k)=>{const m=h.match(new RegExp('\\\\?"'+k+'\\\\?":\\\\?("([^"\\\\]*)|[\\d.]+|null|true|false)'));return m?(m[2]!==undefined?m[2]:m[1]):'';};
const hits=[],fails=[];let gone=0;const q=[...all];
await Promise.all(Array.from({length:4},async()=>{while(q.length){const id=q.shift();try{const r=await fetch('/products/'+id);if(r.status===404){gone++;continue;}const h=await r.text();const ty=g(h,'shippingOutType');if(!ty){fails.push(id);continue;}const b=g(h,'estimatedShippingBeginTimestamp');const o=g(h,'hasOptionReservationShipping');if((b&&b!=='null')||o==='true'){const d=(b&&b!=='null')?b.slice(0,10):'';hits.push([id,d,o==='true'&&!d?'옵션별 예약 배송':'예약 배송 · '+(d?(+d.slice(5,7))+'/'+(+d.slice(8,10)):'')+' 이내 배송 시작'+(o==='true'?' (옵션별 예약 있음)':'')]);}}catch(e){fails.push(id);}await W(150);}}));
window.__po=JSON.stringify({ch:'29cm',listed:S.size,scanned:all.length,gone,fails,hits,new:NEW});
[window.__po.length,window.__po.slice(0,900)].join(' ')
