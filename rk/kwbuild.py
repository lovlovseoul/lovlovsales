# 사용: python3 kwbuild.py day D out.json kw_ms.json web_kw.json prev.json [base.json]   ('-'는 없음, base=같은 날 먼저 만든 파일)
#       python3 kwbuild.py index out.json date1 date2 ...
import json, sys
def load(p):
    if not p or p=='-': return None
    try: return json.load(open(p,encoding='utf-8'))
    except Exception: return None
def day(D,out,ms,web,prevf,base=None):
    K={}; T={}; S={}
    if base:   # 같은 날 먼저 만든 파일의 리스트·시각을 깔고, 이번에 받은 것만 덮어씀
        T=dict(base.get('T') or {}); S=dict(base.get('S') or {})
        for k,lst in base['K'].items(): K[k]=[[e[0],e[1]]+([e[3]] if len(e)>3 and e[3] is not None else []) for e in lst]
    if ms:
        T['무신사']=ms.get('time')
        for name,rows in ms['lists'].items(): K[f'무신사|{name}']=[[kw,rk] for kw,rk in rows]
    for w in (web or []):
        p=w['p']; T[p]=w.get('time'); S[p]=w.get('stamp') or ''
        K[f'{p}|인기']=[[r[0],r[1]]+([r[2]] if len(r)>2 else []) for r in w['list']]
    prev=load(prevf); PK=[]
    for k,lst in K.items():
        pl=prev['K'].get(k) if prev else None
        if pl is not None:
            PK.append(k); pm={e[0]:e[1] for e in pl}
            for e in lst: e[2:]=[pm.get(e[0])]          # [검색어, 순위, 전날 순위(없으면 null=신규)]
        else:
            for e in lst:
                if len(e)>2: e[2:]=[None,e[2]]           # 전날 기록 없음: [검색어, 순위, null, 플랫폼이 준 변동]
    T={k:v for k,v in T.items() if v}
    json.dump({'v':1,'date':D,'prevDate':prev['date'] if prev else None,'PK':PK,'T':T,'S':S,'K':K},open(out,'w',encoding='utf-8'),ensure_ascii=False,separators=(',',':'))
    print('kwday',D,{k:len(v) for k,v in K.items()},'prev',prev['date'] if prev else None)
def index(out,dates):
    dates=sorted(set(d for d in dates if d))
    json.dump({'v':1,'dates':dates},open(out,'w',encoding='utf-8'),separators=(',',':')); print('kw_index',dates)
if __name__=='__main__':
    a=sys.argv
    if a[1]=='day': day(a[2],a[3],load(a[4]),load(a[5]),a[6] if len(a)>6 else None,load(a[7]) if len(a)>7 else None)
    elif a[1]=='index': index(a[2],a[3:])
