// 지그재그: https://zigzag.kr/catalog/products/171292057 (아무 로브로브 상품 페이지)에서 실행 — ids.json 의 지그재그 전 상품 상세를 읽음 (11/27, zz_read.js 를 대신함)
// 기본 발송예정 문구(send_date_text) + 옵션 일부 발송일("*일부 옵션은 12. 07(월)에 발송됩니다." = item_guide_text) 둘 다. 결과는 res_zigzag.json 형식({ch,scanned,checked:[{id,d,txt}],fails}) 그대로.
// 백그라운드로 돌고 끝나면 window.__po 에 결과(JSON 문자열). 진행 확인: window.__po ? window.__po.length+' '+window.__po.slice(0,900) : '진행중 '+(window.__prog||'')  (254개 1분 안팎)
window.__po=null;window.__prog='';(async()=>{try{
const W=ms=>new Promise(r=>setTimeout(r,ms));
const IDS=(await fetch('https://raw.githubusercontent.com/lovlovseoul/lovlovsales/main/po/ids.json?'+Date.now()).then(r=>r.json())).ids.zigzag.map(x=>x[0]);
const dec=s=>s.replace(/\x5cu003c/g,'<').replace(/\x5cu003e/g,'>').replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();
const toD=s=>{const m=(s||'').match(/(\d{1,2})\.\s*(\d{1,2})\s*\(/);if(!m)return '';const now=new Date();let yy=now.getFullYear();if(+m[1]<now.getMonth()-5)yy++;return yy+'-'+String(+m[1]).padStart(2,'0')+'-'+String(+m[2]).padStart(2,'0');};
const TODAY=new Date(Date.now()+9*3600e3).toISOString().slice(0,10);
const checked=[],fails=[];const q=[...IDS];
await Promise.all(Array.from({length:3},async()=>{while(q.length){const id=q.shift();window.__prog=(IDS.length-q.length)+'/'+IDS.length;try{const h=await fetch('/catalog/products/'+id).then(r=>r.text());const s=dec((h.match(/"send_date_text"\s*:\s*"([^"]*)"/)||[])[1]||'');const g=dec((h.match(/"item_guide_text"\s*:\s*"([^"]*)"/)||[])[1]||'');if(!s&&!g){fails.push(id);continue;}let d=toD(s),txt=s;const gd=toD(g);if(gd&&gd>=TODAY){d=gd;txt=g.replace(/^\*/,'')+' (기본 '+s+')';}checked.push({id,d,txt:txt.slice(0,90)});}catch(e){fails.push(id);}await W(150);}}));
window.__po=JSON.stringify({ch:'zigzag',scanned:IDS.length,checked,fails});
}catch(e){window.__po=JSON.stringify({err:String(e)});}})();'started'
