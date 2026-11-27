// 지그재그 상품 상세 페이지(https://zigzag.kr/catalog/products/번호)에서 실행: 발송예정일 읽기
// 11/27: 옵션별 예약(예: BEIGE만 12/7)은 화면 기본 문구엔 안 나오고 "*일부 옵션은 12. 07(월)에 발송됩니다." (item_guide_text)로만 나옴 → 그것도 읽어서 d 를 그 날짜로
const W=ms=>new Promise(r=>setTimeout(r,ms));await W(2500);
const t=document.body.innerText.replace(/\s+/g,' ');
const nd=(document.getElementById('__NEXT_DATA__')||{}).textContent||'';
const dec=s=>s.replace(/\x5cu003c/g,'<').replace(/\x5cu003e/g,'>').replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();
const sendTxt=dec((nd.match(/"send_date_text"\s*:\s*"([^"]*)"/)||[])[1]||'');
const guide=dec((nd.match(/"item_guide_text"\s*:\s*"([^"]*)"/)||[])[1]||'');
const toD=s=>{const m=(s||'').match(/(\d{1,2})\.\s*(\d{1,2})\s*\(/);if(!m)return '';const now=new Date();let yy=now.getFullYear();if(+m[1]<now.getMonth()-5)yy++;return yy+'-'+String(+m[1]).padStart(2,'0')+'-'+String(+m[2]).padStart(2,'0');};
const m=t.match(/(\d{1,2})\.\s*(\d{1,2})\s*\([^)]\)\s*이내\s*판매자\s*발송예정/);
const base=m?m[0]:sendTxt;let d=toD(base);
let txt=base||(t.match(/직진배송[^.]{0,30}/)||['발송일 문구 없음'])[0];
const gd=toD(guide);
if(gd){d=gd;txt=guide.replace(/^\*/,'')+(base?' (기본 '+base+')':'');}
JSON.stringify({id:location.pathname.split('/').pop(),d,txt})
