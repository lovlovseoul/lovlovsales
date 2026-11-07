# 사용:
#  python3 build.py day D out.json [ms.json] [w.json] [c29.json] [prev_day.json] [base.json]   → 일자 파일 (base=같은 날 먼저 만든 파일, 새로 안 받은 플랫폼은 base 것 유지)
#  python3 build.py agg kind key out.json day1.json day2.json ...                  → 주간/월간 집계 파일
#  python3 build.py index out.json date1 date2 ...                                  → 날짜 목록
# 2026-11-07: 같은 날 다시 받아 덮어쓸 때 그날 더 높았던 순위를 H(리스트 → {상품: 그날 최고 순위})에 남김. HT=덮어쓰기 전 수집 시각.
#             주간·월간 집계의 최고 순위도 H를 반영.
import json, sys, datetime
NON=set('''무신사 스탠다드 우먼|무신사 스탠다드|무신사 스탠다드 스포츠|미쏘|스파오|탑텐|에잇세컨즈|후아유|지오다노|로엠|폴햄|마시모두띠|유니클로|자라|룰루레몬|젝시믹스|안다르|아디다스|나이키|뉴발란스|노스페이스|디스커버리 익스페디션|블랙야크|챔피온|살로몬|엄브로|아이더|디아도라|스노우피크 어패럴|내셔널지오그래픽|파타고니아|네파|데상트|데상트 골프|말본 골프|페어라이어 골프|다이나핏|시에라디자인|잔스포츠|스포츠 일러스트레이티드|스포츠챔버|디스커스 애슬레틱|코오롱스포츠|K2|컬럼비아|휠라|푸마|아식스|리복|컨버스|반스|언더아머|노티카|예일|펜필드|알파 인더스트리|캉골|엠엘비|리|디젤|라코스테|폴로 랄프 로렌|마리떼 프랑소와 저버|행텐|베이프|마리끌레르|지프|트루릴리젼|발렌티노|지방시|생로랑|바니스뉴욕|코닥|코닥어패럴|게스|지컷|랩(RAB)|엠바골프|디키즈|크록스|어그|오닐|폴로 랄프로렌'''.split('|'))
PRE={'무신사':'ms_','W컨셉':'wc_','29CM':'29_','지그재그':'zz_'}
def designer(b): return 0 if (b or '').strip() in NON else 1
def load(p):
    try: return json.load(open(p,encoding='utf-8'))
    except Exception: return None
def day(D,out,ms=None,w=None,c29=None,prevf=None,base=None):
    P={}; L={}; T0={}; H={}; HT={}
    newp={'무신사' if ms else None,'W컨셉' if w else None,'29CM' if c29 else None}
    if base:   # 같은 날 먼저 만든 파일: 이번에 새로 받지 않은 플랫폼 리스트는 그대로 둠
        T0={k:v for k,v in (base.get('T') or {}).items() if k not in newp}
        HT={k:v for k,v in (base.get('HT') or {}).items()}
        for k,v in (base.get('H') or {}).items():
            if k.split('|')[0] not in newp: H[k]=dict(v)
        for k,lst in base['L'].items():
            if k.split('|')[0] in newp: continue
            L[k]=[[e[0],e[1]] for e in lst]
            for e in lst:
                if e[0] in base['P']: P[e[0]]=base['P'][e[0]]
    def add(plat,sec,key,rows):
        lst=[]
        for r in rows:
            rk,pid,brand,name,price,cust,sale,img,sold=r[:9]
            k=PRE[plat]+str(pid)
            P[k]=[brand,name,price,cust if cust else price,sale or 0,img,1 if sold else 0,designer(brand)]
            lst.append([k,rk])
        L[f'{plat}|{sec}|{key}']=lst
    if ms:
        for k,rows in ms['lists'].items():
            sec,cat,sub=k.split('|'); add('무신사',sec,f'{cat}|{sub}',rows)
    if w:
        for cat,rows in w['lists'].items(): add('W컨셉','일간',f'{cat}|전체',rows)
    if c29:
        for cat,rows in c29['lists'].items(): add('29CM','일간',f'{cat}|전체',rows)
    if base:   # 덮어쓴 리스트: 먼저 받은 순위(+그때까지의 최고)가 지금보다 높았거나 지금 빠졌으면 H에 남김
        bH=base.get('H') or {}
        for k,lst in base['L'].items():
            pl=k.split('|')[0]
            if pl not in newp or k not in L: continue
            now={e[0]:e[1] for e in L[k]}; hk={}
            for e in lst:
                b=min(e[1],(bH.get(k) or {}).get(e[0],999))
                if b<now.get(e[0],999):
                    hk[e[0]]=b
                    if e[0] not in P and e[0] in base['P']: P[e[0]]=base['P'][e[0]]
            for pid,b in (bH.get(k) or {}).items():   # 먼저 받은 리스트에도 이미 빠져 있던 최고 기록
                if pid not in hk and b<now.get(pid,999) and pid in base['P']:
                    hk[pid]=min(b,hk.get(pid,999)); P.setdefault(pid,base['P'][pid])
            if hk: H[k]=hk
        for pl in newp:
            if pl and (base.get('T') or {}).get(pl): HT[pl]=HT.get(pl) or base['T'][pl]
    prev=load(prevf) if prevf else None
    pidx={}
    if prev:
        for k,lst in prev['L'].items(): pidx[k]={e[0]:e[1] for e in lst}
    for k,lst in L.items():
        pm=pidx.get(k)
        if pm is None: continue   # 전날 이 리스트가 없으면 비교값을 넣지 않음
        for e in lst: e.append(pm.get(e[0]))
    T=dict(T0); T.update({k:v for k,v in (('무신사',(ms or {}).get('time')),('W컨셉',(w or {}).get('time')),('29CM',(c29 or {}).get('time'))) if v})
    o={'v':2,'date':D,'prevDate':prev['date'] if prev else None,'T':T,'P':P,'L':L}
    if H: o['H']=H; o['HT']=HT
    json.dump(o,open(out,'w',encoding='utf-8'),ensure_ascii=False,separators=(',',':'))
    print('day',D,'lists',len(L),'products',len(P),'prev',prev['date'] if prev else None,'peaks',sum(len(v) for v in H.values()))
def agg(kind,key,out,files):
    days=[]; P={}; acc={}
    for f in files:
        d=load(f)
        if not d: continue
        days.append(d['date'])
    days=sorted(set(days)); di={x:i for i,x in enumerate(days)}
    for f in files:
        d=load(f)
        if not d: continue
        i=di[d['date']]
        P.update(d['P'])
        for k,lst in d['L'].items():
            A=acc.setdefault(k,{})
            for e in lst:
                pid,rk=e[0],e[1]
                a=A.setdefault(pid,[0,0,999,0,[0]*len(days)])
                a[0]+=max(0,101-rk); a[1]+=1; a[2]=min(a[2],rk); a[3]+=rk; a[4][i]=rk
        for k,hk in (d.get('H') or {}).items():   # 그날 더 높았던 순위 → 최고 순위에만 반영
            A=acc.get(k) or {}
            for pid,b in hk.items():
                if pid in A: A[pid][2]=min(A[pid][2],b)
    L={}; used=set()
    for k,A in acc.items():
        rows=sorted(A.items(),key=lambda x:(-x[1][0],x[1][2]))[:150]
        L[k]=[[pid,a[0],a[1],a[2],round(a[3]/a[1],1),','.join(str(x) if x else '' for x in a[4])] for pid,a in rows]
        used.update(pid for pid,_ in rows)
    P={k:v for k,v in P.items() if k in used}
    json.dump({'v':2,'kind':kind,'key':key,'days':days,'P':P,'L':L},open(out,'w',encoding='utf-8'),ensure_ascii=False,separators=(',',':'))
    print('agg',kind,key,'days',days,'lists',len(L),'products',len(P))
def wkey(D):
    y,w,_=datetime.date.fromisoformat(D).isocalendar(); return f'{y}-W{w:02d}'
def index(out,dates):
    dates=sorted(set(dates)); weeks={}; months=[]
    for d in dates:
        wk=wkey(d); weeks.setdefault(wk,[]).append(d)
        if d[:7] not in months: months.append(d[:7])
    W={}
    for wk,ds in weeks.items():
        y,w=wk.split('-W'); mon=datetime.date.fromisocalendar(int(y),int(w),1)
        W[wk]=[mon.isoformat(),(mon+datetime.timedelta(days=6)).isoformat(),ds]
    json.dump({'v':2,'dates':dates,'weeks':W,'months':months,'zz':'2026-11-06'},open(out,'w',encoding='utf-8'),ensure_ascii=False,separators=(',',':'))
    print('index',len(dates),list(W),months)
if __name__=='__main__':
    a=sys.argv
    if a[1]=='day':
        D,out=a[2],a[3]; rest=a[4:]+[None]*5
        g=lambda x:x if x and x!='-' else None
        day(D,out,load(g(rest[0])) if g(rest[0]) else None,load(g(rest[1])) if g(rest[1]) else None,load(g(rest[2])) if g(rest[2]) else None,g(rest[3]),load(g(rest[4])) if g(rest[4]) else None)
    elif a[1]=='agg': agg(a[2],a[3],a[4],a[5:])
    elif a[1]=='index': index(a[2],a[3:])
    elif a[1]=='wkey': print(wkey(a[2]))
