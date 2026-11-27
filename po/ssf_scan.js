// SSF: https://www.ssfshop.com/LOVLOV/main?brandShopNo=BDMA19BBY&brndShopId=RTLVL 페이지에서 실행
// 백그라운드로 돌고 끝나면 window.__po 에 결과(JSON 문자열). 진행 확인: window.__po ? window.__po.length+' '+window.__po.slice(0,900) : '진행중 '+(window.__prog||'')
window.__po=null;window.__prog='';(async()=>{try{
const W=ms=>new Promise(r=>setTimeout(r,ms));
const IDS=(await fetch('https://raw.githubusercontent.com/lovlovseoul/lovlovsales/main/po/ids.json?'+Date.now()).then(r=>r.json())).ids.ssf.map(x=>x[0]);
const all=[...IDS];const hits=[],fails=[];let gone=0;const q=[...all];
await Promise.all(Array.from({length:3},async()=>{while(q.length){const id=q.shift();window.__prog=(all.length-q.length)+'/'+all.length;try{const r=await fetch('/LOVLOV/'+id+'/good');const h=await r.text();const y=(h.match(/id="allResveSaleGodYn"\s+value="([YN])"/)||[])[1];if(!y){if(!/resveSaleGodYn/.test(h)){gone++;}else fails.push(id);continue;}
 if(y==='Y'){const d=(h.match(/id="tempResveOrdDlivyPrearngeDate"\s+value="([^"]*)"/)||[])[1]||'';hits.push([id,d,'예약판매 · '+(d?(+d.slice(5,7))+'/'+(+d.slice(8,10))+' 출발':'날짜 없음')]);}}catch(e){fails.push(id);}await W(200);}}));
window.__po=JSON.stringify({ch:'ssf',scanned:all.length,gone,fails,hits,new:[]});
}catch(e){window.__po=JSON.stringify({err:String(e)});}})();'started'
