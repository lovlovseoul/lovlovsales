// 자사몰: https://lovlovseoul.com/ 아무 페이지에서 실행 (상품명 태그 기준)
const W=ms=>new Promise(r=>setTimeout(r,ms));
const IDS=(await fetch('https://raw.githubusercontent.com/lovlovseoul/lovlovsales/main/po/ids.json?'+Date.now()).then(r=>r.json())).ids.own.map(x=>x[0]);
const tagD=s=>{const m=s.match(/(\d{1,2})\s*[\/월.]\s*(\d{1,2})/);if(!m)return '';const now=new Date();let yy=now.getFullYear();if(+m[1]<now.getMonth()-5)yy++;return yy+'-'+String(+m[1]).padStart(2,'0')+'-'+String(+m[2]).padStart(2,'0');};
const M=new Map();for(let p=1;p<=20;p++){const h=await fetch('/product/list.html?cate_no=559&page='+p).then(r=>r.text());const d=new DOMParser().parseFromString(h,'text/html');const li=[...d.querySelectorAll('li[id^=anchorBoxId_]')];if(!li.length)break;let add=0;for(const x of li){const id=x.id.replace('anchorBoxId_','');const nm=(x.querySelector('.name')?.textContent||'').replace(/상품명\s*:?/,'').replace(/\s+/g,' ').trim();if(!M.has(id)){M.set(id,nm);add++;}}if(!add)break;await W(200);}
const hits=[];for(const [id,nm] of M){const tags=(nm.match(/\[[^\]]*(예약|발송|출고|순차|reserv|pre-?order)[^\]]*\]/gi)||[]).join(' ');if(tags)hits.push([id,tagD(tags),'상품명 '+tags]);}
const NEW=[...M.keys()].filter(x=>!IDS.includes(x)).map(x=>[x,M.get(x).slice(0,70)]);
window.__po=JSON.stringify({ch:'own',listed:M.size,scanned:M.size,gone:0,fails:[],hits,new:NEW});
[window.__po.length,window.__po.slice(0,900)].join(' ')
