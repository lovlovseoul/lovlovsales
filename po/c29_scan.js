// 29CM: https://www.29cm.co.kr/store/search?keyword=로브로브&sort=RECOMMENDED&page=1 페이지에서 실행
// 옵션별 예약(hasOptionReservationShipping)은 상품 HTML에 날짜가 없어서 옵션 API에서 옵션마다 estimatedShippingBeginTimestamp 읽음 (11/27)
// 백그라운드로 돌고 끝나면 window.__po 에 결과(JSON 문자열). 진행 확인: window.__po ? window.__po.length+' '+window.__po.slice(0,900) : '진행중 '+(window.__prog||'')
window.__po=null;window.__prog='';(async()=>{try{
const W=ms=>new Promise(r=>setTimeout(r,ms));
const IDS=(await fetch('https://raw.githubusercontent.com/lovlovseoul/lovlovsales/main/po/ids.json?'+Date.now()).then(r=>r.json())).ids['29cm'].map(x=>x[0]);
const S=new Map();const grab=()=>document.querySelectorAll('a[href*="/catalog/"]').forEach(a=>{const m=a.href.match(/catalog\/(\d+)/);if(m&&!S.has(m[1]))S.set(m[1],(a.getAttribute('title')||'').replace(/\s+/g,' ').trim().slice(0,70));});
await W(2500);for(let p=1;p<=15;p++){for(let i=0;i<10;i++){window.scrollBy(0,2500);await W(250);}await W(600);grab();const nx=[...document.querySelectorAll('button,a')].find(b=>b.textContent.trim()===String(p+1));if(!nx)break;nx.click();await W(2200);window.scrollTo(0,0);}
const all=[...new Set([...IDS,...S.keys()])];const NEW=[...S.keys()].filter(x=>!IDS.includes(x)).map(x=>[x,S.get(x)]);
const g=(h,k)=>{const m=h.match(new RegExp('\\\\?"'+k+'\\\\?":\\\\?("([^"\\\\]*)|[\\d.]+|null|true|false)'));return m?(m[2]!==undefined?m[2]:m[1]):'';};
const md=d=>d?(+d.slice(5,7))+'/'+(+d.slice(8,10)):'';
const opt29=async id=>{try{const j=await fetch('https://bff-api.29cm.co.kr/api/v6/product-detail/'+id+'/options',{credentials:'include'}).then(r=>r.json());const out=[];const walk=(arr,path)=>{for(const x of arr||[]){const p=[...path,x.title].filter(t=>t&&!/^(FREE|F|ONE ?SIZE)$/i.test(t));const ts=x.estimatedShippingBeginTimestamp;if(x.list&&x.list.length)walk(x.list,[...path,x.title]);else if(ts)out.push([p.join('/')||'전체',ts.slice(0,10)]);}};walk(j.data&&j.data.list,[]);return out;}catch(e){return [];}};
const hits=[],fails=[];let gone=0;const q=[...all];
await Promise.all(Array.from({length:4},async()=>{while(q.length){const id=q.shift();window.__prog=(all.length-q.length)+'/'+all.length;try{const r=await fetch('/products/'+id);if(r.status===404){gone++;continue;}const h=await r.text();const ty=g(h,'shippingOutType');if(!ty){fails.push(id);continue;}const b=g(h,'estimatedShippingBeginTimestamp');const o=g(h,'hasOptionReservationShipping');if((b&&b!=='null')||o==='true'){let d=(b&&b!=='null')?b.slice(0,10):'';let ot='';if(o==='true'){const L=await opt29(id);if(L.length){ot=L.map(x=>x[0]+' '+md(x[1])).join(', ');if(!d)d=L.map(x=>x[1]).sort()[0];}}hits.push([id,d,(b&&b!=='null')?'예약 배송 · '+md(d)+' 이내 배송 시작'+(ot?' (옵션: '+ot+')':(o==='true'?' (옵션별 예약 있음)':'')):'옵션별 예약 배송'+(ot?' · '+ot+' 이내 배송 시작':' (날짜 확인 못 함)')]);}}catch(e){fails.push(id);}await W(150);}}));
window.__po=JSON.stringify({ch:'29cm',listed:S.size,scanned:all.length,gone,fails,hits,new:NEW});
}catch(e){window.__po=JSON.stringify({err:String(e)});}})();'started'
