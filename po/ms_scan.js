// 무신사: https://www.musinsa.com/search/goods?keyword=로브로브&gf=A 페이지에서 실행
const W=ms=>new Promise(r=>setTimeout(r,ms));
const IDS=(await fetch('https://raw.githubusercontent.com/lovlovseoul/lovlovsales/main/po/ids.json?'+Date.now()).then(r=>r.json())).ids.musinsa.map(x=>x[0]);
const M=new Map();const grab=()=>document.querySelectorAll('a[href*="/products/"]').forEach(a=>{const m=a.href.match(/products\/(\d+)/);if(!m)return;let c=a;for(let k=0;k<6&&c&&!/%|원/.test(c.innerText||'');k++)c=c.parentElement;const t=((c&&c.innerText)||a.innerText||'').replace(/\s+/g,' ').trim().replace(/^(무신사 무진장 )?로브로브 /,'').replace(/\s+\d{1,2}%.*|\s+[\d,]+원.*/,'');if(!M.has(m[1])||t.length<(M.get(m[1])||'').length&&t)M.set(m[1],t.slice(0,70));});
await W(2500);let last=0,same=0;for(let i=0;i<200&&same<8;i++){grab();window.scrollBy(0,700);await W(450);if(M.size===last)same++;else{same=0;last=M.size;}}grab();
const all=[...new Set([...IDS,...M.keys()])];const NEW=[...M.keys()].filter(x=>!IDS.includes(x)).map(x=>[x,M.get(x)]);
const g=(h,k)=>{const m=h.match(new RegExp('"'+k+'":("([^"]*)"|[\\d.]+|null|true|false)'));return m?(m[2]!==undefined?m[2]:m[1]):'';};
const hits=[],fails=[];let gone=0;const q=[...all];
await Promise.all(Array.from({length:4},async()=>{while(q.length){const id=q.shift();try{const r=await fetch('/products/'+id);if(r.status===404){gone++;continue;}const h=await r.text();const t=g(h,'deliveryDueType');if(!t){fails.push(id);continue;}if(t==='RESERVATION')hits.push([id,g(h,'deliveryDueDay')||g(h,'willReleaseDate'),'예약배송 · '+md(g(h,'deliveryDueDay'))+' 이내 발송']);}catch(e){fails.push(id);}await W(150);}}));
function md(d){if(!d||d==='null')return '날짜 없음';const p=d.slice(0,10).split('-');return (+p[1])+'/'+(+p[2]);}
window.__po=JSON.stringify({ch:'musinsa',listed:M.size,scanned:all.length,gone,fails,hits,new:NEW});
[window.__po.length,window.__po.slice(0,900)].join(' ')
