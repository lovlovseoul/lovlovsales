// 롯데온: https://www.lotteon.com/ 아무 페이지에서 실행 (공식 로브로브 상품번호만, 타 판매자 제외)
const W=ms=>new Promise(r=>setTimeout(r,ms));
const IDS=(await fetch('https://raw.githubusercontent.com/lovlovseoul/lovlovsales/main/po/ids.json?'+Date.now()).then(r=>r.json())).ids.lotteon.map(x=>x[0]);
const dec=s=>s.replace(/&quot;/g,'"').replace(/&amp;/g,'&');
const tagD=s=>{const m=s.match(/(\d{1,2})\s*[\/월.]\s*(\d{1,2})\s*일?/);if(!m)return '';const y=new Date().getFullYear();let mm=+m[1],dd=+m[2];const now=new Date();let yy=y;if(mm<now.getMonth()-5)yy=y+1;return yy+'-'+String(mm).padStart(2,'0')+'-'+String(dd).padStart(2,'0');};
const hits=[],fails=[];let gone=0;const q=[...IDS];
await Promise.all(Array.from({length:4},async()=>{while(q.length){const id=q.shift();try{const r=await fetch('/p/product/'+id);const h=dec(await r.text());const ty=(h.match(/"dvPdTypCd"\s*:\s*"([^"]*)"/)||[])[1];if(!ty){gone++;continue;}
 const nm=((h.match(/<title>([^<]*)<\/title>/)||[])[1]||'').replace(/\s*:\s*롯데ON.*/,'').trim();const tags=(nm.match(/\[[^\]]*(예약|발송|출고|순차)[^\]]*\]/g)||[]).join(' ');
 if(ty==='OD_MFG'||tags){hits.push([id,tagD(tags),(tags?'상품명 '+tags:'')+(ty==='OD_MFG'?(tags?' / ':'')+'주문제작 설정':'')]);}}catch(e){fails.push(id);}await W(150);}}));
window.__po=JSON.stringify({ch:'lotteon',scanned:IDS.length,gone,fails,hits,new:[]});
[window.__po.length,window.__po.slice(0,900)].join(' ')
