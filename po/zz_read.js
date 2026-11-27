// 지그재그 상품 상세 페이지(https://zigzag.kr/catalog/products/번호)에서 실행: 발송예정일 읽기
const W=ms=>new Promise(r=>setTimeout(r,ms));await W(2500);
const t=document.body.innerText.replace(/\s+/g,' ');const m=t.match(/(\d{1,2})\.\s*(\d{1,2})\s*\([^)]\)\s*이내\s*판매자\s*발송예정/);
let d='';if(m){const now=new Date();let yy=now.getFullYear();if(+m[1]<now.getMonth()-5)yy++;d=yy+'-'+String(+m[1]).padStart(2,'0')+'-'+String(+m[2]).padStart(2,'0');}
JSON.stringify({id:location.pathname.split('/').pop(),d,txt:m?m[0]:(t.match(/직진배송[^.]{0,30}/)||['발송일 문구 없음'])[0]})
