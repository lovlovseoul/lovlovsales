# 예약발송 현황 데이터 만들기
# 사용: python3 build_po.py ids.json res_dir prev_preorder.json(없으면 -) out.json "YYYY-MM-DD HH:MM" [zz_candidates.json]
#   res_dir 안: res_wconcept.json res_musinsa.json res_29cm.json res_ssf.json res_lotteon.json res_own.json res_zigzag.json (없는 건 확인 못 함 처리)
#   zz_candidates.json 를 6번째 인자로 주면, 결과 대신 "지그재그에서 열어볼 상품번호" 목록만 만들어 줌 (1단계)
import json, sys, re, os, datetime
CH=['wconcept','29cm','musinsa','zigzag','lotteon','ssf','queenit','own']
LBL={'wconcept':'W컨셉','29cm':'29CM','musinsa':'무신사','zigzag':'지그재그','lotteon':'롯데온','ssf':'SSF','queenit':'퀸잇','own':'자사몰'}
ids=json.load(open(sys.argv[1],encoding='utf-8'))['ids']
RD=sys.argv[2]; PREV=sys.argv[3]; OUT=sys.argv[4]; ASOF=sys.argv[5]
TODAY=datetime.date.fromisoformat(ASOF[:10])
def load(p):
    try: return json.load(open(p,encoding='utf-8'))
    except Exception: return None
R={c:load(os.path.join(RD,f'res_{c}.json')) for c in CH+['wconcept_list']}
for c,v in list(R.items()):
    if v and v.get('err'): R[c]=None
def clean(n):
    n=re.sub(r'\[[^\]]*\]','',n or '').strip()
    col=''
    if '_' in n:
        b,cc=n.rsplit('_',1); n,col=b.strip(),cc.strip()
    n=re.sub(r'\((\d+)\s*col(or)?\)','',n,flags=re.I).strip()
    return re.sub(r'\s+',' ',n),col
# 상품번호 → (상품명, 컬러)
IM={c:{str(x[0]):(x[1],x[2]) for x in ids.get(c,[])} for c in CH}
for c,v in R.items():
    if c=='wconcept_list': c='wconcept'
    for x in (v or {}).get('new',[]) or []:
        if str(x[0]) not in IM[c]: IM[c][str(x[0])]=clean(x[1]) if x[1] else ('(새 상품 '+str(x[0])+')','')
single=lambda col: bool(col) and not re.search(r'colou?r|col\b|\d',col,re.I)
# 예약 걸린 상품 모으기
hits={}   # 상품명 -> ch -> [(id,d,t,col)]
WEAK=set()   # 롯데온 '주문제작'만 걸려 있고 태그·날짜 없는 것: 그것만으로는 예약 상품으로 안 셈
for c in ['wconcept','29cm','musinsa','lotteon','ssf','own']:
    v=R.get(c)
    if not v: continue
    for h in v.get('hits',[]):
        pid,d,t=str(h[0]),h[1] or '',h[2] or ''
        if c=='lotteon' and not d and t.strip()=='주문제작 설정': WEAK.add(pid); continue
        nm,col=IM[c].get(pid,('(알 수 없는 상품 '+pid+')',''))
        hits.setdefault(nm,{}).setdefault(c,[]).append((pid,d[:10] if d and d!='null' else '',t,col))
# 지그재그 전 상품 스캔(zz_scan.js) 결과에서 발송예정일이 오늘+5일 넘는 상품은 다른 채널 예약이 없어도 목록에 올림 (11/27)
for x in ((R.get('zigzag') or {}).get('checked') or []):
    if x.get('d') and (datetime.date.fromisoformat(x['d'])-TODAY).days>5 and str(x['id']) in IM['zigzag']:
        hits.setdefault(IM['zigzag'][str(x['id'])][0],{})
# 1단계: 지그재그 후보
if len(sys.argv)>6:
    zz=[pid for pid,(nm,col) in IM['zigzag'].items() if nm in hits]
    pv=load(PREV) if PREV!='-' else None
    pvn={it['name'] for it in (pv or {}).get('items',[])}
    wc=[pid for pid,(nm,col) in IM['wconcept'].items() if nm in hits or nm in pvn]
    wc+=[str(x[0]) for x in ((R.get('wconcept_list') or {}).get('new') or [])]
    json.dump({'zz':zz,'wc':sorted(set(wc))},open(sys.argv[6],'w'),ensure_ascii=False); print('지그재그 후보',len(zz),zz,'| W컨셉 추가 확인',len(set(wc))); sys.exit()
ZZ={str(x['id']):x for x in ((R.get('zigzag') or {}).get('checked') or [])}
items=[]
for nm,chs in hits.items():
    cols=sorted({col for c in chs.values() for (_,_,_,col) in c if single(col)})
    it={'name':nm,'opt':cols[0] if len(cols)==1 else '','ch':{}}
    for c in CH:
        mine=[pid for pid,(n,_) in IM[c].items() if n==nm]
        if not mine: it['ch'][c]={'s':'na'}; continue
        if c in chs:
            hs=sorted(chs[c],key=lambda x:x[1] or '9999')
            multi=len(mine)>1
            t=' / '.join(((col+': ') if multi and single(col) else '')+t for (_,_,t,col) in hs)
            it['ch'][c]={'s':'rv','d':hs[0][1],'t':t[:260],'i':hs[0][0]}
            continue
        if c=='queenit': it['ch'][c]={'s':'unk','i':mine[0]}; continue
        if c=='zigzag':
            z=[ZZ[p] for p in mine if p in ZZ]
            if not z: it['ch'][c]={'s':'unk','i':mine[0]}; continue
            zd=sorted([x for x in z if x.get('d')],key=lambda x:x['d'])
            if zd and (datetime.date.fromisoformat(zd[-1]['d'])-TODAY).days>5:
                x=zd[-1]; it['ch'][c]={'s':'rv','d':x['d'],'t':x.get('txt',''),'i':str(x['id'])}
            else:
                x=(zd or z)[0]; it['ch'][c]={'s':'gen' if zd else 'unk','t':(x.get('txt') or '')+(' (기본 리드타임)' if zd else ''),'i':str(x['id'])}
            continue
        v=R.get(c)
        if not v or all(p in (v.get('fails') or []) for p in mine): it['ch'][c]={'s':'unk','i':mine[0]}; continue
        wk=[p for p in mine if p in WEAK]
        if c=='lotteon' and wk: it['ch'][c]={'s':'rv','d':'','t':'주문제작 설정 (상품명 태그 없음 · 상세 발송예정일이 늦게 잡힘)','i':wk[0]}; continue
        it['ch'][c]={'s':'none' if c=='own' else 'gen','t':'상품명·옵션명에 예약 표기 없음' if c=='own' else '예약 표시 없음','i':mine[0]}
    items.append(it)
items.sort(key=lambda it:min([e.get('d') or '9999' for e in it['ch'].values() if e.get('s')=='rv'] or ['9999']))
def sc(c):
    v=R.get(c)
    if c=='queenit': return '상세에 발송일이 안 보여 확인 못 함'
    if c=='zigzag':
        return (f"전 상품 상세 {(R.get('zigzag') or {}).get('scanned')}개 (옵션 일부 발송일 포함)" if (R.get('zigzag') or {}).get('scanned') else f"예약 걸린 상품만 상세 확인 ({len(ZZ)}개)") if ZZ else '확인 못 함'
    if not v: return '이번엔 확인 못 함 (스캔 실패)'
    f=len(v.get('fails') or []); s=v.get('scanned',0)
    base={'wconcept':'전 상품 상세','29cm':'전 상품 상세','musinsa':'전 상품 상세','ssf':'전 상품 상세','lotteon':'공식 상품 상세(주문제작·상품명 태그)','own':'상품명 태그 + 옵션명 예약 표기'}[c]
    return f"{base} {s}개"+(f" · {f}개 응답 실패" if f else '')+(f" · 새 상품 {len(v.get('new') or [])}개" if v.get('new') else '')
out={'asof':ASOF,'scan':{c:sc(c) for c in CH},'items':items}
json.dump(out,open(OUT,'w',encoding='utf-8'),ensure_ascii=False,indent=1)
# 변경 요약
prev=load(PREV) if PREV!='-' else None
def keyd(o): return {(it['name'],c):e.get('d','') for it in o['items'] for c,e in it['ch'].items() if e.get('s')=='rv'}
chg=[]
if prev:
    a,b=keyd(prev),keyd(out)
    for k in sorted(set(a)|set(b)):
        if k not in a: chg.append(f"+ {k[0]} {LBL[k[1]]} 예약 {b[k][5:].replace('-','/') if b[k] else ''}")
        elif k not in b: chg.append(f"- {k[0]} {LBL[k[1]]} 예약 해제")
        elif a[k]!=b[k]: chg.append(f"~ {k[0]} {LBL[k[1]]} {a[k][5:]}→{b[k][5:]}")
print('ITEMS',len(items)); print('CHANGES',len(chg)); [print(x) for x in chg]
for c in CH: print('SCAN',LBL[c],out['scan'][c])
# 새 상품번호가 있으면 ids_next.json 으로 합쳐 둠 (po/ids.json 으로 올리면 다음부터 반영)
newc=0
for c,v in R.items():
    if c=='wconcept_list': c='wconcept'
    for x in (v or {}).get('new',[]) or []:
        pid=str(x[0])
        if pid not in {str(y[0]) for y in ids.get(c,[])}:
            nm,col=IM[c][pid]; ids.setdefault(c,[]).append([pid,nm,col]); newc+=1
if newc:
    json.dump({'v':1,'asof':ASOF[:10],'ids':ids},open('ids_next.json','w',encoding='utf-8'),ensure_ascii=False,separators=(',',':'))
print('NEW_IDS',newc)
