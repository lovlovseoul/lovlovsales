# 무신사 여성 검색어 랭킹: 인기(1067) / 급상승(2449) → kw_ms.json
import json, sys, datetime, urllib.request, time
NOW=datetime.datetime.now(datetime.timezone.utc)+datetime.timedelta(hours=9)
out={'p':'무신사','date':NOW.strftime('%Y-%m-%d'),'time':NOW.strftime('%H:%M'),'lists':{},'errors':[]}
for name,sid in (('인기',1067),('급상승',2449)):
    u=f'https://client.musinsa.com/api/home/web/v5/pans/ranking/sections/{sid}?storeCode=musinsa&gf=F'
    try:
        for t in range(3):
            try:
                with urllib.request.urlopen(urllib.request.Request(u,headers={'Accept':'application/json'}),timeout=30) as r: j=json.load(r); break
            except Exception:
                if t==2: raise
                time.sleep(2)
        rows=[]
        for m in j['data']['modules']:
            if m.get('type')=='RANKING_SEARCH':
                kw=((m.get('title') or {}).get('text') or '').strip()
                if kw: rows.append([kw,int(m['rank'])])
        out['lists'][name]=rows
    except Exception as e: out['errors'].append(f'{name}: {e}')
json.dump(out,open(sys.argv[1] if len(sys.argv)>1 else 'kw_ms.json','w',encoding='utf-8'),ensure_ascii=False,separators=(',',':'))
print(out['date'],out['time'],{k:len(v) for k,v in out['lists'].items()},out['errors'])
