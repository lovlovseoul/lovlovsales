// W컨셉 1단계: https://display.wconcept.co.kr/search?keyword=로브로브 페이지에서 실행 (새 상품 번호만 찾음)
const W=ms=>new Promise(r=>setTimeout(r,ms));
const IDS=(await fetch('https://raw.githubusercontent.com/lovlovseoul/lovlovsales/main/po/ids.json?'+Date.now()).then(r=>r.json())).ids.wconcept.map(x=>x[0]);
const M=new Map();const grab=()=>{for(const im of document.querySelectorAll('img[src*="productimg/image/img"]')){const m=im.src.match(/image\/img\d+\/\d+\/(\d+)_/);if(!m||M.has(m[1]))continue;let c=im;for(let i=0;i<8;i++){c=c.parentElement;if(c&&c.innerText&&c.innerText.split('\n').length>=3)break}const L=(c?c.innerText:'').split('\n').map(s=>s.trim()).filter(Boolean);if(L[0]!=='로브로브')continue;M.set(m[1],(L[1]||'').slice(0,70));}};
await W(2500);let last=0,same=0;for(let i=0;i<250&&same<10;i++){grab();window.scrollBy(0,900);await W(400);if(M.size===last)same++;else{same=0;last=M.size;}}grab();
const NEW=[...M.keys()].filter(x=>!IDS.includes(x)).map(x=>[x,M.get(x)]);
window.__po=JSON.stringify({ch:'wconcept_list',listed:M.size,new:NEW});
[window.__po.length,window.__po.slice(0,900)].join(' ')
