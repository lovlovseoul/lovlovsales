# 입고 예정(입출고 시트) 붙이기 + 재고 알림 + 출고 위험 계산 — build_stock.py / refresh_inb.py 공용 (11/27)
import re, datetime as dt
from collections import defaultdict

def A(s): return re.sub(r'[^0-9A-Z가-힣]', '', str(s).upper())
SZ = {'FREE': 'FREE', 'F': 'FREE', 'ONESIZE': 'FREE', '미분류': '?', '': 'FREE'}
def ns(s):
    s = A(s); return SZ.get(s, s)

# 시트 사이즈 → 이지어드민 사이즈 (상품별 예외)
SIZE_ALIAS = {('비건 스웨이드 퍼 후드집업', 'XL'): '1L', ('비건 스웨이드 퍼 후드집업', '3XL'): '2XL'}
# 시트 상품명 별칭 (A() 정규화 키)
NAME_ALIAS = {'WARMTOUCHRELAXJOGGERPT': '웜 터치 릴렉스 조거',
              'HONEYCAMELREVERSIBLEMUSTANGFLUFFYFURBAGSET': None}  # None → 아래에서 HONEY CAMEL REVERSIBLE MUSTANG 으로

def parse_eta(t, today):
    t = str(t)
    m = re.search(r'(20\d\d)[.\-/]\s*(\d{1,2})[.\-/]\s*(\d{1,2})', t)
    if m: return dt.date(int(m[1]), int(m[2]), int(m[3]))
    m = re.search(r'(\d{1,2})\s*[/\-]\s*(\d{1,2})', t) or re.search(r'(\d{1,2})월\s*(\d{1,2})일', t)
    if m:
        mo, d = int(m[1]), int(m[2])
        if not (1 <= mo <= 12 and 1 <= d <= 31): return None
        y = today.year + (1 if mo < today.month - 6 else 0)
        try: return dt.date(y, mo, d)
        except ValueError: return None
    return None

def parse_rsv(text, today):
    """'BLACK 12/11 · ASH GRAY 12/2' → {'BLACK':date,'ASHGRAY':date}, '' 키 = 컬러 무관"""
    out = {}
    for m in re.finditer(r'([A-Za-z][A-Za-z ./]*?)?\s*(\d{1,2})/(\d{1,2})', str(text)):
        pre = A(m[1] or '')
        pre = re.sub(r'^(1차|2차|3차)', '', pre)
        try: d = dt.date(today.year + (1 if int(m[2]) < today.month - 6 else 0), int(m[2]), int(m[3]))
        except ValueError: continue
        k = pre if pre and not re.fullmatch(r'\d*차?', pre) else ''
        if k not in out or d < out[k]: out[k] = d
    return out

def name_index(P, extra=None):
    ix = {}
    for ko, p in P.items():
        ix[A(p['en'])] = ko; ix[A(ko)] = ko
    for k, ko in (extra or {}).items():
        if ko in P: ix[k] = ko
    for k, v in NAME_ALIAS.items():
        if v and v in P: ix[k] = v
    hc = ix.get(A('HONEY CAMEL REVERSIBLE MUSTANG'))
    if hc: ix['HONEYCAMELREVERSIBLEMUSTANGFLUFFYFURBAGSET'] = hc
    return ix

def attach_inbound(P, rows, today, ix):
    """rows: dict(name,color,size,qty,eta,factory,round). 옵션 x['in'] 채움. 미매칭 목록 반환"""
    for p in P.values():
        for x in p['o']: x.pop('in', None)
    unmatched = []
    for r in rows:
        ko = ix.get(A(r['name'])); p = P.get(ko)
        try: q = int(float(r['qty']))
        except Exception: continue
        eta = parse_eta(r['eta'], today); stale = eta is not None and eta < today - dt.timedelta(days=3)
        rec = {'q': q, 'eta': eta.isoformat() if eta else None, 'raw': str(r['eta'])[:30], 'f': r.get('factory', ''), 'rd': r.get('round', ''), 'stale': stale}
        if not p: unmatched.append((r['name'], r['color'], r['size'], q, '상품없음')); continue
        ca = A(r['color']); sz = ns(r['size']) if str(r['size']).strip() else ''
        sz = SIZE_ALIAS.get((ko, sz), sz)
        cand = [x for x in p['o'] if A(x['c']) == ca]
        if not cand and ca in ('MGREY', 'GREY'): cand = [x for x in p['o'] if A(x['c']) == 'MELANGEGREY']
        hit = [x for x in cand if sz and ns(x['s']) == sz]
        if not hit and sz:
            alt = [x for x in cand if re.sub(r'^\d', '', ns(x['s'])) == sz]
            if len(alt) == 1: hit = alt
        if not hit and sz in ('', 'FREE'): hit = cand
        if not hit: unmatched.append((r['name'], r['color'], r['size'], q, '옵션없음')); continue
        # 사이즈 비어 있고 컬러에 사이즈가 여러 개면 판매 비중으로 나눠 붙임
        if len(hit) > 1:
            tot = sum(x['sh'] for x in hit) or len(hit)
            for x in hit:
                share = (x['sh'] / tot) if sum(y['sh'] for y in hit) else 1 / len(hit)
                x.setdefault('in', []).append({**rec, 'q': round(q * share)})
        else:
            hit[0].setdefault('in', []).append(rec)
    return unmatched

def rsv_for(ko, color, sheet_rsv, po_items, today):
    """예약발송일: 시트 '예약발송일' 칸 + 예약발송 현황(preorder.json) 채널 중 가장 빠른 날"""
    best = None; src = []
    m = sheet_rsv.get(ko)
    if m:
        d = m.get(A(color)) or m.get('')
        if d: best = d; src.append('시트')
    for it in po_items or []:
        if it.get('name') != ko: continue
        if it.get('opt') and A(it['opt']) != A(color): continue
        ds = [dt.date.fromisoformat(v['d']) for v in it.get('ch', {}).values() if v.get('s') == 'rv' and v.get('d')]
        if ds:
            d = min(ds)
            if best is None or d < best: best = d
            src.append('채널')
    return best, src

def compute(P, today, sheet_rsv=None, po_items=None):
    sheet_rsv = sheet_rsv or {}
    def inq(x, until=None):
        return sum(i['q'] for i in x.get('in', []) if not i['stale'] and (until is None or (i['eta'] and i['eta'] <= until)))
    def first_eta(x):
        e = [i['eta'] for i in x.get('in', []) if i['eta'] and not i['stale']]; return min(e) if e else None
    AL = []
    for ko, p in P.items():
        for x in p['o']:
            rate = (p['v7'] or p['v28']) * x['sh']; cv = x['av'] / rate if rate > 0 else None
            if x['sj'] <= 0 and x['av'] < 0: continue
            if x['av'] < 0 and rate > 0: lvl = 3
            elif x['av'] < 0: continue
            elif cv is not None and cv <= 14 and rate >= 0.3: lvl = 2
            elif cv is not None and cv <= 30 and rate >= 0.3: lvl = 1
            else: continue
            incoming = inq(x); fe = first_eta(x)
            out_date = (today + dt.timedelta(days=max(cv, 0))).isoformat() if cv is not None else None
            after = round((x['av'] + incoming) / rate, 1) if rate > 0 and incoming else None
            covered = incoming > 0 and fe and (lvl == 3 or fe <= out_date) and after is not None and after > 30
            ins = sorted([[i['eta'], i['q']] for i in x.get('in', []) if not i['stale']], key=lambda a: (a[0] is None, a[0] or ''))
            stale = any(i['stale'] for i in x.get('in', []))
            # ── 출고 위험 ──
            rsv, src = rsv_for(ko, x['c'], sheet_rsv, po_items, today)
            miss = max(0, -x['av']); risk = None
            if miss > 0:
                cum = 0; cover_eta = 'none'
                for e, q in ins:
                    cum += q
                    if cum >= miss: cover_eta = e; break
                if incoming == 0:
                    risk = ['위험', '들어올 물량 없음' + (' (시트 예정일 지남)' if stale else '')]
                elif incoming < miss:
                    risk = ['위험', f'입고 {incoming} < 미송 {miss}']
                elif cover_eta is None:
                    risk = ['위험', '입고일 미정' + (f' · 발송 {rsv.month}/{rsv.day}' if rsv else ' · 예약발송 표기 없음')]
                elif cover_eta != 'none':
                    ce = dt.date.fromisoformat(cover_eta)
                    if rsv:
                        gap = (rsv - ce).days
                        if gap < 1: risk = ['위험', f'입고 {ce.month}/{ce.day} · 발송 {rsv.month}/{rsv.day}' + (' (입고가 더 늦음)' if gap < 0 else ' (당일)')]
                        elif gap <= 2: risk = ['주의', f'입고 {ce.month}/{ce.day} · 발송 {rsv.month}/{rsv.day} (여유 {gap}일)']
                    if ce < today: risk = risk or ['주의', f'입고 예정일 {ce.month}/{ce.day} 지남']
                if risk is None and not rsv:
                    risk = ['위험', '미송인데 예약발송 표기 없음']
            elif lvl == 2 and cv is not None:
                od = today + dt.timedelta(days=max(cv, 0))
                if not incoming: risk = ['주의', f'{od.month}/{od.day}경 품절 · 입고 예정 없음']
                elif not fe: risk = ['주의', f'{od.month}/{od.day}경 품절 · 리오더 입고일 미정']
                elif fe and dt.date.fromisoformat(fe) > od: risk = ['주의', f'입고 전 {od.month}/{od.day}경 품절 → 미송 예상']
            AL.append({'p': ko, 'c': x['c'], 's': x['s'], 'av': x['av'], 'sj': x['sj'], 'r': round(rate, 2), 'cv': None if cv is None else round(cv, 1), 'lv': lvl, 'b': p['b'],
                       'inq': incoming, 'aa': x['av'] + incoming, 'ins': ins, 'eta': fe, 'after': after, 'ok': bool(covered) and not (risk and risk[0] == '위험'), 'stale': stale,
                       'rsv': rsv.isoformat() if rsv else None, 'risk': risk})
    _seen = set(); AL = [a for a in AL if not ((a['p'], a['c'], a['s']) in _seen or _seen.add((a['p'], a['c'], a['s'])))]
    RK = {'위험': 0, '주의': 1}
    AL.sort(key=lambda a: (RK.get((a['risk'] or [''])[0], 2), a['ok'], -a['lv'], a['cv'] if a['cv'] is not None else -999))
    ER = []
    for ko, p in P.items():
        for x in p['o']:
            if x['st'] < 0: ER.append({'p': ko, 'c': x['c'], 's': x['s'], 'st': x['st'], 'sj': x['sj'], 'b': p['b']})
    return AL, ER

def read_rsv_tsv(path, today):
    out = {}
    if not path: return out
    import csv
    with open(path, encoding='utf-8') as f:
        for r in csv.DictReader(f, delimiter='\t'):
            out[r['name']] = r['rsv']
    return out

def sheet_rsv_by_ko(raw, ix, today):
    m = {}
    for name, txt in raw.items():
        ko = ix.get(A(name))
        if ko and str(txt).strip(): m[ko] = parse_rsv(txt, today)
    return m
