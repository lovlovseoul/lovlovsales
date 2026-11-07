# 무신사 여성 일간 랭킹: 신상/전체/급상승 × 카테고리(+세부) 각 TOP100 → ms.json
import json, sys, datetime, urllib.request, time
H={'Accept':'application/json'}
SECS=[('신상',200),('전체',199),('급상승',201)]
CATS=[('전체','000',[]),
 ('상의','001000',[('긴소매 티셔츠','001010'),('맨투맨/스웨트','001005'),('셔츠/블라우스','001002'),('후드 티셔츠','001004'),('반소매 티셔츠','001001'),('피케/카라 티셔츠','001003'),('니트/스웨터','001006'),('민소매 티셔츠','001011'),('기타 상의','001008')]),
 ('아우터','002000',[('후드 집업','002022'),('블루종/MA-1','002001'),('레더/라이더스 재킷','002002'),('슈트/블레이저 재킷','002003'),('카디건','002020'),('경량 패딩/패딩 베스트','002027'),('사파리/헌팅 재킷','002014'),('트러커 재킷','002017'),('스타디움 재킷','002004'),('나일론/코치 재킷','002006'),('트레이닝 재킷','002018'),('아노락 재킷','002019'),('플리스/뽀글이','002023'),('환절기 코트','002008'),('베스트','002021'),('무스탕/퍼','002025'),('겨울 싱글 코트','002007'),('겨울 더블 코트','002024'),('겨울 기타 코트','002009'),('숏패딩/헤비 아우터','002012'),('롱패딩/헤비 아우터','002013'),('기타 아우터','002015')]),
 ('바지','003000',[('데님 팬츠','003002'),('트레이닝/조거 팬츠','003004'),('코튼 팬츠','003007'),('슈트 팬츠/슬랙스','003008'),('숏 팬츠','003009'),('레깅스','003005'),('점프 슈트/오버올','003010'),('기타 하의','003006')]),
 ('원피스/스커트','100000',[('미니원피스','100001'),('미디원피스','100002'),('맥시원피스','100003'),('미니스커트','100004'),('미디스커트','100005'),('롱스커트','100006')])]
def fetch(sec,code):
    u=f'https://client.musinsa.com/api/home/web/v5/pans/ranking/sections/{sec}?storeCode=musinsa&gf=F&ageBand=AGE_BAND_ALL&period=DAILY&soldOut=true&categoryCode={code}&page=1'
    for t in range(3):
        try:
            with urllib.request.urlopen(urllib.request.Request(u,headers=H),timeout=30) as r: j=json.load(r); break
        except Exception as e:
            if t==2: raise
            time.sleep(2)
    acc=[]
    def walk(o):
        if isinstance(o,dict):
            if o.get('type')=='PRODUCT_COLUMN': acc.append(o); return
            for v in o.values(): walk(v)
        elif isinstance(o,list):
            for v in o: walk(v)
    walk(j['data']['modules'])
    out={}
    for it in acc:
        rk=(it.get('image') or {}).get('rank')
        if rk and rk not in out: out[rk]=it
    res=[]
    for rk in sorted(out)[:100]:
        it=out[rk]; inf=it.get('info',{}); img=it.get('image') or {}
        pl=((img.get('onClickLike') or {}).get('eventLog') or {}).get('ga4',{}).get('payload',{})
        res.append([rk,str(it['id']),(inf.get('brandName') or '').strip(),(inf.get('productName') or '').strip(),inf.get('finalPrice'),pl.get('original_price'),inf.get('discountRatio') or 0,(img.get('url') or '').replace('https://image.msscdn.net/images/goods_img/',''),1 if inf.get('isSoldOut') else 0])
    return res
NOW=datetime.datetime.now(datetime.timezone.utc)+datetime.timedelta(hours=9); D=NOW.strftime('%Y-%m-%d'); TM=NOW.strftime('%H:%M')
lists={}; errs=[]
import concurrent.futures as cf
jobs=[(f'{sn}|{cn}|{sub}',sid,code) for sn,sid in SECS for cn,cc,subs in CATS for sub,code in [('전체',cc)]+subs]
def run(j):
    k,sid,code=j
    try: return k,fetch(sid,code),None
    except Exception as e: return k,None,f'{k}: {e}'
with cf.ThreadPoolExecutor(6) as ex:
    for k,res,err in ex.map(run,jobs):
        if err: errs.append(err)
        else: lists[k]=res
out=sys.argv[1] if len(sys.argv)>1 else 'ms.json'
json.dump({'date':D,'time':TM,'platform':'무신사','lists':lists,'errors':errs},open(out,'w',encoding='utf-8'),ensure_ascii=False,separators=(',',':'))
print(D,'lists',len(lists),'rows',sum(len(v) for v in lists.values()),'errors',errs[:5])
