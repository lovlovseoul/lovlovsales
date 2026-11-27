// 입출고 구글시트에서 미입고 오더 + 예약발송일 읽기 (docs.google.com 시트 탭에서 실행, 로그인 필요)
// 결과: window.__INB (tsv 문자열), window.__RSV (tsv 문자열), window.__prog
(async()=>{try{window.__prog='start';
const LOV='__LOV__', LES='__LES__';
const csv=async(id,gid)=>{const s=await (await fetch('/spreadsheets/d/'+id+'/export?format=csv&gid='+gid)).text();const rows=[];let row=[],f='',q=false;for(let i=0;i<s.length;i++){const c=s[i];if(q){if(c=='"'){if(s[i+1]=='"'){f+='"';i++}else q=false}else f+=c}else{if(c=='"')q=true;else if(c==','){row.push(f);f=''}else if(c=='\n'){row.push(f);rows.push(row);row=[];f=''}else if(c!='\r')f+=c}}row.push(f);rows.push(row);return rows};
const T=x=>(x||'').replace(/\s+/g,' ').trim();const N=x=>{const v=parseFloat(T(x).replace(/,/g,''));return isNaN(v)?null:v};
const out=[],rsv=[];
const run=async(id,gid,sheet,les)=>{const R=await csv(id,gid);let H=null,cur={};
for(const r of R){const ei=r.findIndex(x=>/입고\s*예정/.test(x));if(ei>=0&&r.some(x=>T(x)=='상품명')){H={};r.forEach((x,j)=>{x=T(x);if(!(x in H))H[x]=j});H.eta=ei;cur={};continue}if(!H)continue;
const g=k=>{const j=H[k];return j==null?'':T(r[j])};const qc=H['실입고량']!=null?'실입고량':'입고량';
if(g('상품명')){cur={name:g('상품명'),fac:g('생산처'),color:''};if(g('예약발송일'))rsv.push(cur.name+'\t'+g('예약발송일'))}
if(!cur.name)continue;if(g('생산처'))cur.fac=g('생산처');if(g('컬러'))cur.color=g('컬러');
if(g('차수')){cur.rd=g('차수');cur.od=g('오더날짜');cur.eta=T(r[H.eta]);cur.st=g('현황')}else{if(g('오더날짜'))cur.od=g('오더날짜');if(T(r[H.eta]))cur.eta=T(r[H.eta]);if(g('현황'))cur.st=g('현황')}
const oq=N(g('발주량')),iq=N(g(qc));if(!oq||oq<=0)continue;let rem;if(les){rem=oq-(iq||0);if(rem<=0)continue}else{if(iq!=null&&g(qc)!='-'){/* 11/27: 일부만 입고(파샬)된 차수는 남은 수량을 입고 예정으로 (예: 모엘 2차 85 중 35 입고, '파샬 나머지 12/11 예상') */if(iq<oq&&/파샬|나머지|잔량|잔여|미입고/.test((cur.eta||'')+' '+(cur.st||''))){rem=oq-iq}else continue}else rem=oq}
if(/완료|취소|보류|중단/.test((cur.eta||'')+' '+(cur.st||'')))continue;
out.push([sheet,cur.name,cur.color,g('사이즈'),rem,cur.eta||'미정',cur.od||'',cur.fac||'',cur.rd||''].join('\t'))}};
for(const [g,s] of [['1505270215','26FW'],['108623754','26SS'],['643605363','25FW'],['665766026','25FW']]){window.__prog=s;await run(LOV,g,s,false)}
window.__prog='LES';await run(LES,'0','LES',true);
window.__INB='sheet\tname\tcolor\tsize\tqty\teta\torderdate\tfactory\tround\n'+out.join('\n');
window.__RSV='name\trsv\n'+rsv.join('\n');window.__prog='done '+out.length+' '+rsv.length}catch(e){window.__prog='err '+e}})();'started'
