// 자사몰: https://lovlovseoul.com/ 아무 페이지에서 실행 (상품명 태그 + 옵션명 예약 표기 둘 다)
// 자사몰은 보통 옵션명에 "BEIGE(12/7 순차출고)"처럼 넣음 → 상세 HTML의 옵션값까지 읽음 (11/27 국주 요청)
// 백그라운드로 돌고 끝나면 window.__po 에 결과(JSON 문자열). 진행 확인: window.__po ? window.__po.length+' '+window.__po.slice(0,900) : '진행중 '+(window.__prog||'')  (상세 240개라 1~2분)
window.__po=null;window.__prog='';(async()=>{try{
const W=ms=>new Promise(r=>setTimeout(r,ms));
const IDS=(await fetch('https://raw.githubusercontent.com/lovlovseoul/lovlovsales/main/po/ids.json?'+Date.now()).then(r=>r.json())).ids.own.map(x=>x[0]);
const tagD=s=>{const m=s.match(/(\d{1,2})\s*[\/월.]\s*(\d{1,2})/);if(!m)return '';const now=new Date();let yy=now.getFullYear();if(+m[1]<now.getMonth()-5)yy++;return yy+'-'+String(+m[1]).padStart(2,'0')+'-'+String(+m[2]).padStart(2,'0');};
const M=new Map();for(let p=1;p<=20;p++){const h=await fetch('/product/list.html?cate_no=559&page='+p).then(r=>r.text());const d=new DOMParser().parseFromString(h,'text/html');const li=[...d.querySelectorAll('li[id^=anchorBoxId_]')];if(!li.length)break;let add=0;for(const x of li){const id=x.id.replace('anchorBoxId_','');const nm=(x.querySelector('.name')?.textContent||'').replace(/상품명\s*:?/,'').replace(/\s+/g,' ').trim();if(!M.has(id)){M.set(id,nm);add++;}}if(!add)break;await W(200);}
// 옵션값 전체가 '컬러(날짜 + 순차/예약/출고/발송)' 꼴인 것만 (예: BEIGE(12/7 순차출고), MELANGE GREY(12월9일 예약배송)) — 옵션 1개짜리 상품은 option_value 대신 title/텍스트로만 나옴
const OPTV=/^[A-Za-z가-힣][A-Za-z가-힣 .]{0,30}\s*\(\s*\d{1,2}\s*(?:[\/.]|월)\s*\d{1,2}\s*일?[^()]{0,20}(?:순차|예약|출고|발송)[^()]{0,10}\)$/;
const hits=[],fails=[],stale=[];const TODAY=new Date(Date.now()+9*3600e3).toISOString().slice(0,10);const q=[...M.keys()];
await Promise.all(Array.from({length:3},async()=>{while(q.length){const id=q.shift();window.__prog=(M.size-q.length)+'/'+M.size;const nm=M.get(id);
 const tags=(nm.match(/\[[^\]]*(예약|발송|출고|순차|reserv|pre-?order)[^\]]*\]/gi)||[]).join(' ');
 let opts=[];try{const h=await fetch('/product/detail.html?product_no='+id).then(r=>r.text());const seen=new Set();for(const m of h.matchAll(/(?:title|option_value|value)="([^"]{1,60})"|>([^<>]{1,60})</g)){const v=(m[1]||m[2]||'').replace(/&#40;/g,'(').replace(/&#41;/g,')').replace(/\s+/g,' ').trim();if(OPTV.test(v))seen.add(v);}opts=[...seen].filter(v=>![...seen].some(w=>w!==v&&v.endsWith(w)));}catch(e){fails.push(id);}
 if(tags||opts.length){const ds=[tagD(tags),...opts.map(o=>tagD(o.replace(/^[^(\[]*/,'')))].filter(Boolean).sort();
  const ot=opts.length?'옵션 '+opts.join(', '):'';
  const row=[id,ds[0]||'',[tags?'상품명 '+tags:'',ot].filter(Boolean).join(' / ')];
  if(!tags&&ds.length&&ds[ds.length-1]<TODAY)stale.push(row);else hits.push(row);}  // 옵션명에 지난 날짜만 남은 건 예약으로 안 셈(stale: 옵션명 정리 필요)
 await W(200);}}));
const NEW=[...M.keys()].filter(x=>!IDS.includes(x)).map(x=>[x,M.get(x).slice(0,70)]);
window.__po=JSON.stringify({ch:'own',listed:M.size,scanned:M.size,gone:0,fails,hits,stale,new:NEW});
}catch(e){window.__po=JSON.stringify({err:String(e)});}})();'started'
