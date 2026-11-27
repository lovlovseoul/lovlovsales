// SSF: https://www.ssfshop.com/LOVLOV/main?brandShopNo=BDMA19BBY&brndShopId=RTLVL 페이지에서 실행
const W=ms=>new Promise(r=>setTimeout(r,ms));
const IDS=(await fetch('https://raw.githubusercontent.com/lovlovseoul/lovlovsales/main/po/ids.json?'+Date.now()).then(r=>r.json())).ids.ssf.map(x=>x[0]);
const all=[...IDS];const hits=[],fails=[];let gone=0;const q=[...all];
await Promise.all(Array.from({length:3},async()=>{while(q.length){const id=q.shift();try{const r=await fetch('/LOVLOV/'+id+'/good');const h=await r.text();const y=(h.match(/id="allResveSaleGodYn"\s+value="([YN])"/)||[])[1];if(!y){if(!/resveSaleGodYn/.test(h)){gone++;}else fails.push(id);continue;}
 if(y==='Y'){const d=(h.match(/id="tempResveOrdDlivyPrearngeDate"\s+value="([^"]*)"/)||[])[1]||'';hits.push([id,d,'예약판매 · '+(d?(+d.slice(5,7))+'/'+(+d.slice(8,10))+' 출발':'날짜 없음')]);}}catch(e){fails.push(id);}await W(200);}}));
window.__po=JSON.stringify({ch:'ssf',scanned:all.length,gone,fails,hits,new:[]});
[window.__po.length,window.__po.slice(0,900)].join(' ')
