# 매일 아침: 입출고 시트(미입고 오더·예약발송일) + 예약발송 현황을 기존 stock.json(이지어드민 재고)에 다시 붙여 알림·출고 위험 재계산
# usage: python3 stk/refresh_inb.py stock.json inbound.tsv rsv.tsv preorder.json "YYYY-MM-DD HH:MM" out.json
import sys, json, csv, datetime as dt
sys.path.insert(0, 'stk')
import inb_lib as L
S, INB, RSV, POJ, NOW, OUT = sys.argv[1:7]
J = json.load(open(S, encoding='utf-8'))
P = J['P']; today = dt.date.fromisoformat(NOW[:10])
ix = L.name_index(P, J.get('NA', {}))
rows = list(csv.DictReader(open(INB, encoding='utf-8'), delimiter='\t'))
un = L.attach_inbound(P, rows, today, ix)
raw = L.read_rsv_tsv(RSV, today)
try: po = json.load(open(POJ, encoding='utf-8'))['items']
except Exception: po = []
AL, ER = L.compute(P, today, L.sheet_rsv_by_ko(raw, ix, today), po)
J.update({'alerts': AL, 'errs': ER, 'inbAsof': NOW, 'rsvRaw': raw})
json.dump(J, open(OUT, 'w'), ensure_ascii=False, separators=(',', ':'))
print('ROWS', len(rows), 'UNMATCHED', len(un)); [print('  ', u) for u in un]
rk = [a for a in AL if a['risk']]
print('ALERTS', len(AL), 'RISK', sum(a['risk'][0] == '위험' for a in rk), 'WARN', sum(a['risk'][0] == '주의' for a in rk))
for a in AL:
    if a['risk']: print('RISK', a['b'], a['risk'][0], a['p'], a['c'], a['s'], '가용', a['av'], '입고', a['inq'], '→', a['aa'], '|', a['risk'][1])
