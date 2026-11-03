(function(){
  fetch('colors.json?cb='+Date.now()).then(function(r){return r.json();}).then(function(data){
    var BP=data.byPlat||{}, PLATS=data.platforms||Object.keys(BP), days=data.days||[];
    var range = days.length ? (days[0].slice(5).replace('-','/')+'~'+days[days.length-1].slice(5).replace('-','/')) : '';
    // 클릭 가능한 상품 집합 (아무 플랫폼에서라도 판매된)
    var ALLPROD={}; PLATS.forEach(function(p){var c=BP[p]&&BP[p].colors;if(c)Object.keys(c).forEach(function(k){ALLPROD[k]=1;});});
    var st=document.createElement('style');
    st.textContent=
    '.colorpop{position:fixed;z-index:60;background:#FFFFFF;border:1px solid #DCDFE4;border-radius:12px;padding:16px 16px 14px;min-width:255px;max-width:340px;max-height:82vh;overflow:auto;box-shadow:0 10px 30px rgba(16,24,40,.14);font-size:13px;color:#1A1D21}'+
    '.colorpop h4{margin:0 22px 2px 0;font-size:14px;line-height:1.3}'+
    '.colorpop .cpsub{font-size:11px;color:#9AA3AD;margin-bottom:11px}'+
    '.colorpop .seclab{font-size:10.5px;letter-spacing:.04em;color:#9AA3AD;margin:13px 0 7px;text-transform:none}'+
    '.colorpop .crow{margin:7px 0}'+
    '.colorpop .cline{display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px}'+
    '.colorpop .cq{color:#5B6470;white-space:nowrap;padding-left:10px}'+
    '.colorpop .cbarwrap{height:6px;background:#EEF0F3;border-radius:3px;overflow:hidden}'+
    '.colorpop .cbar{height:100%;border-radius:3px;background:#2563EB}'+
    '.colorpop .sbar{background:#EA5529}'+
    '.colorpop .jbar{background:#16A34A}'+
    '.colorpop .cempty{font-size:12px;color:#9AA3AD;padding:4px 0}'+
    '.colorpop .cpclose{position:absolute;top:9px;right:11px;cursor:pointer;color:#9AA3AD;font-size:13px}'+
    '.colorpop.wide{max-width:560px}'+'.chcell{min-width:150px;text-align:left!important}'+'.chbar{display:flex;height:7px;border-radius:4px;overflow:hidden;background:#EEF0F3;margin-bottom:3px;max-width:180px}'+'.chbar span{display:block;height:100%}'+'.chtxt{font-size:11px;color:#5B6470;white-space:nowrap}'+'.chtxt b{font-weight:600}'+'th.chh{text-align:left!important}'+'#views .card{overflow-x:auto}'+'@media(max-width:600px){.chcell{min-width:110px}.chbar{max-width:120px}}'+'.colorpop .pbar{background:#7C3AED}'+'.colorpop .mx{border-collapse:collapse;width:100%;font-size:11.5px;margin-top:2px}'+'.colorpop .mx th{font-weight:600;color:#5B6470;padding:4px 6px;border-bottom:1px solid #DCDFE4;text-align:right;white-space:nowrap}'+'.colorpop .mx th:first-child,.colorpop .mx td:first-child{text-align:left}'+'.colorpop .mx td{padding:4px 6px;border-bottom:1px solid #F0F1F3;text-align:right;white-space:nowrap}'+'.colorpop .mx tr.tot td{font-weight:600;border-top:1px solid #DCDFE4}'+'.colorpop .mx .z{color:#C5CAD1}'+'.colorpop .mx .pc{display:block;font-size:10px;color:#9AA3AD;font-weight:400}'+'.colorpop .mxwrap{overflow-x:auto}'+'tr.clk{cursor:pointer}tr.clk:hover{background:#F4F5F7}';
    document.head.appendChild(st);
    var pop=document.createElement('div');pop.className='colorpop';pop.hidden=true;document.body.appendChild(pop);
    function clean(n){return n.replace(/^\d+\s*/,'').replace(/\s*NEW\s*$/,'').trim();}
    function md(d){var p=d.split('-');return parseInt(p[1],10)+'/'+parseInt(p[2],10);}
    function sectionDaily(row){var el=row.parentElement;while(el&&el!==document.body){if(el.querySelector){var h=el.querySelector('h3');if(h)return /일별/.test(h.textContent);}el=el.parentElement;}return false;}
    function curD(){try{return (typeof curDay!=='undefined')?curDay:(days[days.length-1]);}catch(e){return days[days.length-1];}}
    function curPlat(){try{return (typeof cur!=='undefined')?cur:'전체통합';}catch(e){return '전체통합';}}
    function platList(){var p=curPlat();return (p==='전체통합'||!BP[p])?PLATS:[p];}
    // 선택 스코프(플랫폼/일별)에서 상품의 {키:[q,a]} 병합
    function mdays_(){try{if(typeof curMonth!=='undefined'&&typeof DM!=='undefined'&&DM[curMonth])return DM[curMonth].days;}catch(e){}return days;}
    function getMap(prod,periodKey,dayKey,daily,fw){
      var out={},any=false,pl=(fw===true)?PLATS:platList(),d=curD(),mdays=mdays_();
      function acc(s){if(s)Object.keys(s).forEach(function(k){if(!out[k])out[k]=[0,0];out[k][0]+=s[k][0];out[k][1]+=s[k][1];any=true;});}
      pl.forEach(function(p){
        var dm=BP[p]&&BP[p][dayKey]; if(!dm)return;
        if(fw){var fs=(fw===true?'2026-08-28':fw);Object.keys(dm).forEach(function(dd){if(dd>=fs)acc(dm[dd]&&dm[dd][prod]);});}
        else if(daily){acc(dm[d]&&dm[d][prod]);}
        else{mdays.forEach(function(dd){acc(dm[dd]&&dm[dd][prod]);});}
      });
      return any?out:null;
    }
    function getMapP(prod,dayKey,daily,fw,p){
      var out={},any=false,d=curD(),mdays=mdays_(),dm=BP[p]&&BP[p][dayKey]; if(!dm)return null;
      function acc(x){if(x)Object.keys(x).forEach(function(k){if(!out[k])out[k]=[0,0];out[k][0]+=x[k][0];out[k][1]+=x[k][1];any=true;});}
      if(fw){var fs=(fw===true?'2026-08-28':fw);Object.keys(dm).forEach(function(dd){if(dd>=fs)acc(dm[dd]&&dm[dd][prod]);});}
      else if(daily){acc(dm[d]&&dm[d][prod]);}
      else{mdays.forEach(function(dd){acc(dm[dd]&&dm[dd][prod]);});}
      return any?out:null;
    }
    function chanMatrix(name,daily,fw,cd,sd){
      var useSize=false, dk='dayColors', lab='컬러';
      if(Object.keys(cd).length<=1 && sd){var rk=Object.keys(sd).filter(function(k){return k!=='FREE'&&k!=='(미분류)';}); if(rk.length>1){useSize=true;dk='daySizes';lab='사이즈';}}
      var rows=useSize?Object.keys(sd).filter(function(k){return k!=='(미분류)';}):Object.keys(cd);
      var per={},ptot={};
      ((fw===true)?PLATS:platList()).forEach(function(p){var m=getMapP(name,dk,daily,fw,p); if(m){per[p]=m; ptot[p]=Object.keys(m).reduce(function(s,k){return s+m[k][0];},0);}});
      var pl=Object.keys(ptot).filter(function(p){return ptot[p]>0;}).sort(function(a,b){return ptot[b]-ptot[a];});
      if(!pl.length)return '';
      var all=pl.reduce(function(s,p){return s+ptot[p];},0)||1;
      var cobj={}; pl.forEach(function(p){cobj[p]=[ptot[p],0];});
      var h='<div class="seclab">채널별</div>'+bars(cobj,'pbar');
      if(pl.length<2) return h;
      var rt={}; rows.forEach(function(r){rt[r]=pl.reduce(function(s,p){return s+((per[p][r]||[0])[0]);},0);});
      rows=rows.filter(function(r){return rt[r]>0;}).sort(function(a,b){return rt[b]-rt[a];});
      h+='<div class="seclab">채널 × '+lab+' (장)</div><div class="mxwrap"><table class="mx"><tr><th>'+lab+'</th>';
      pl.forEach(function(p){h+='<th>'+p+'</th>';}); h+='<th>합계</th></tr>';
      rows.forEach(function(r){h+='<tr><td>'+r+'</td>'; pl.forEach(function(p){var q=(per[p][r]||[0])[0]; h+= q?'<td>'+q+'</td>':'<td class="z">·</td>';}); h+='<td><b>'+rt[r]+'</b></td></tr>';});
      h+='<tr class="tot"><td>합계</td>'; pl.forEach(function(p){h+='<td>'+ptot[p]+'<span class="pc">'+Math.round(ptot[p]/all*100)+'%</span></td>';}); h+='<td>'+all+'</td></tr></table></div>';
      return h;
    }
    function bars(obj,cls){
      var ents=Object.keys(obj).map(function(k){return [k,obj[k]];}).sort(function(a,b){return b[1][0]-a[1][0];});
      var tot=ents.reduce(function(s,e){return s+e[1][0];},0)||1;
      var h='';
      ents.forEach(function(e){var c=e[0],v=e[1];var pct=Math.round(v[0]/tot*100);h+='<div class="crow"><div class="cline"><span>'+c+'</span><span class="cq">'+v[0]+'장 · '+pct+'%</span></div><div class="cbarwrap"><div class="cbar '+cls+'" style="width:'+pct+'%"></div></div></div>';});
      return h;
    }
    function jointObj(co){
      var o={},any=false;
      if(co){Object.keys(co).forEach(function(k){var p=k.split('|');var color=p[0],sz=p[1];if(sz!=='FREE'&&sz!=='(미분류)'){o[color+' · '+sz]=co[k];any=true;}});}
      return any?o:null;
    }
    function scopeLabel(){var p=curPlat();return (p==='전체통합')?'전채널':p;}
    function show(name,daily,x,y,fw){
      var cd=getMap(name,'colors','dayColors',daily,fw);
      var sd=getMap(name,'sizes','daySizes',daily,fw);
      var jd=getMap(name,'combos','dayCombos',daily,fw);
      var mdys=mdays_();var mrange=mdys.length?(mdys[0].slice(5).replace('-','/')+'~'+mdys[mdys.length-1].slice(5).replace('-','/')):range;var label=fw?(fw===true?'전채널 · 8/28~ 누적':(scopeLabel()+' · '+fw.slice(5).replace('-','/').replace(/^0/,'')+'~ 누적')):(scopeLabel()+' · '+(daily?('일별 · '+md(curD())+' 기준'):('기간 총 · '+mrange)));
      var h='<span class="cpclose">✕</span><h4>'+name+'</h4>';
      if(!cd){pop.innerHTML=h+'<div class="cpsub">'+label+'</div><div class="cempty">이 조건 데이터가 없어요<br>(컬러 집계 '+range+' 커버)</div>';}
      else{
        var tot=Object.keys(cd).reduce(function(s,k){return s+cd[k][0];},0)||1;
        h+='<div class="cpsub">'+label+' · 총 '+tot+'장</div>';
        h+='<div class="seclab">컬러별</div>'+bars(cd,'');
        var jo=jointObj(jd);
        if(jo){ h+='<div class="seclab">컬러 × 사이즈</div>'+bars(jo,'jbar'); }
        if(sd){
          var real={},hasReal=false;
          Object.keys(sd).forEach(function(k){ if(k!=='(미분류)'){ real[k]=sd[k]; if(k!=='FREE') hasReal=true; } });
          if(hasReal){ h+='<div class="seclab">사이즈별</div>'+bars(real,'sbar'); }
        }
        var wide=false; if(fw===true||platList().length>1){var mxh=chanMatrix(name,daily,fw,cd,sd); if(mxh){h+=mxh; wide=mxh.indexOf('<table')>=0;}}
        pop.classList.toggle('wide',wide);
        pop.innerHTML=h;
      }
      pop.hidden=false;
      var pw=pop.offsetWidth,ph=pop.offsetHeight;
      pop.style.left=Math.max(8,Math.min(x+12,innerWidth-pw-12))+'px';
      pop.style.top=Math.max(8,Math.min(y+12,innerHeight-ph-12))+'px';
      pop.querySelector('.cpclose').onclick=function(ev){ev.stopPropagation();hide();};
    }
    function hide(){pop.hidden=true;}
    function prodOf(tr){if(!tr)return '';if(tr.dataset&&tr.dataset.prod)return tr.dataset.prod;var td=tr.querySelector('td');return td?clean(td.textContent):'';}
    var SHORT={'W컨셉':'W','29CM':'29CM','롯데온':'롯데','자사몰':'자사','지그재그':'지그','무신사':'무신사','퀸잇':'퀸잇'};
    function pcol(p){try{if(typeof PCH!=='undefined'&&PCH[p])return PCH[p];}catch(e){}return '#9AA3AD';}
    function chanCell(prod,daily,fw){
      var arr=[],tot=0;
      PLATS.forEach(function(p){var m=getMapP(prod,'dayColors',daily,fw,p);if(!m)return;var q=Object.keys(m).reduce(function(s,k){return s+m[k][0];},0);if(q>0){arr.push([p,q]);tot+=q;}});
      if(!tot)return '<span class="chtxt">-</span>';
      arr.sort(function(a,b){return b[1]-a[1];});
      var bar='<div class="chbar">'+arr.map(function(e){return '<span style="width:'+(e[1]/tot*100)+'%;background:'+pcol(e[0])+'"></span>';}).join('')+'</div>';
      var txt=arr.slice(0,3).map(function(e){return '<b>'+SHORT[e[0]]+'</b> '+e[1];}).join(' · ')+(arr.length>3?' · 외 '+(arr.length-3):'');
      var tip=arr.map(function(e){return e[0]+' '+e[1]+'장 ('+Math.round(e[1]/tot*100)+'%)';}).join(', ');
      return '<div title="'+tip+'">'+bar+'<span class="chtxt">'+txt+'</span></div>';
    }
    var N2START='2026-09-28';
    function fwOf(tr){if(!tr.closest)return false;if(tr.closest('#fw26card'))return true;if(tr.closest('.card[data-new2]'))return N2START;return false;}
    function renderNew2(){
      var h3s=document.querySelectorAll('#views .card h3'),card=null;
      for(var i=0;i<h3s.length;i++){if(/2차 신상 판매현황/.test(h3s[i].textContent)){card=h3s[i].closest('.card');break;}}
      if(!card||card.getAttribute('data-new2')===curPlat())return;
      var set={};try{NEWSET.forEach(function(n){set[n]=1;});}catch(e){}
      set['스노우블룸 집업']=1;set['마이 시어링 무스탕']=1;
      var pl=platList(),items=[];
      Object.keys(set).forEach(function(prod){var q=0,a=0;pl.forEach(function(p){var dc=BP[p]&&BP[p].dayColors;if(dc)Object.keys(dc).forEach(function(d){if(d>=N2START&&dc[d][prod]){var cd=dc[d][prod];Object.keys(cd).forEach(function(k){q+=cd[k][0];a+=cd[k][1];});}});});if(q>0)items.push({name:prod,qty:q,amt:a});});
      items.sort(function(x,y){return y.amt-x.amt;});
      var tot=items.reduce(function(s,e){return s+e.amt;},0),totQ=items.reduce(function(s,e){return s+e.qty;},0);
      var all=curPlat()==='전체통합';
      var h='<h3>26FW 2차 신상 판매현황 <span class="new">NEW</span></h3><div class="cs">'+(all?'전채널 합산':curPlat())+' · 9/28 오픈 후 누적 · 2차 신상만</div>';
      if(!items.length){h+='<div class="cs" style="padding:12px 2px">2차 신상 판매 내역 없음</div>';}
      else{
        h+='<div style="font-size:15px;font-weight:700;color:var(--text);margin:2px 0 10px">총 '+totQ+'장 · '+won(tot)+'</div>';
        h+='<table><tr><th class="n">순위 · 상품</th><th>수량</th><th>실결제</th><th>비중</th></tr>';
        items.forEach(function(e,idx){h+='<tr class="'+(idx==0?'r1':'')+'" data-prod="'+String(e.name).replace(/"/g,'&quot;')+'"><td class="n"><span class="rank">'+(idx+1)+'</span>'+e.name+'</td><td>'+e.qty+'</td><td>'+won(e.amt)+'</td><td>'+(e.amt/(tot||1)*100).toFixed(1)+'%</td></tr>';});
        h+='</table>';
      }
      card.setAttribute('data-new2',curPlat());card.innerHTML=h;
    }
    function mark(){
      var rows=document.querySelectorAll('#views table tr');var all=curPlat()==='전체통합';
      for(var i=0;i<rows.length;i++){var tr=rows[i];var nm=prodOf(tr);if(!ALLPROD[nm])continue;tr.classList.add('clk');
        if(!all||tr.querySelector('td.chcell'))continue;
        var fw=fwOf(tr);var daily=fw?false:sectionDaily(tr);
        var td=document.createElement('td');td.className='chcell';td.innerHTML=chanCell(nm,daily,fw);tr.appendChild(td);
        var tb=tr.closest('table');var hr=tb&&tb.querySelector('tr');if(hr&&hr.querySelector('th')&&!hr.querySelector('th.chh')){var th=document.createElement('th');th.className='chh';th.textContent='채널별';hr.appendChild(th);}
      }
    }
    document.addEventListener('click',function(e){
      if(pop.contains(e.target))return;
      var tr=e.target.closest('tr');
      if(tr){var nm=prodOf(tr);if(ALLPROD[nm]){var fw=fwOf(tr);show(nm,fw?false:sectionDaily(tr),e.clientX,e.clientY,fw);return;}}
      hide();
    });
    // ===== 26FW 신상 판매 섹션 (전채널 합산) =====
    var FW26=["아티잔 워크 카고 팬츠","컷아웃 숄더 드레이핑 니트","랩 브이넥 니트 티","글로시 벨벳 스커트","헤리티지 트윌 치노 팬츠","웜 립 하렘 팬츠","아티잔 러플 블라우스","웜 파인 체크 셔츠","언발란스 랩 체크 셔츠","실키 볼륨 블라우스","마이 젠틀 가디건","레이어 카라 니트","컬러 라인 가디건","스컬프트 드레이핑 니트","더블 레이어 버튼 후디","레이어 슬릿 티","소프트 레이어 터틀 넥","소프트 히트 티","레트로 스트라이프 피케 티","멀티 스트라이프 피케 티","파인 스트라이프 실켓 티","마이 모먼트 스웨이드 봄버","릴렉스 레더 봄버","빈티지 크랙 레더 봄버","프렌치 트위드 자켓","헤리티지 워크자켓","모던 하이넥 점퍼","프렌치 워크 자켓","프렌치 러플 블라우스"];
    function won(n){return '₩'+Math.round(n).toLocaleString('en-US');}
    function cprodTotal(prod){var q=0,a=0;PLATS.forEach(function(p){var dc=BP[p]&&BP[p].dayColors;if(dc)Object.keys(dc).forEach(function(d){if(d>='2026-08-28'&&dc[d][prod]){var cd=dc[d][prod];Object.keys(cd).forEach(function(k){q+=cd[k][0];a+=cd[k][1];});}});});return [q,a];}
    function renderFW26(){
      var items=[];
      FW26.forEach(function(p){var t=cprodTotal(p);if(t[0]>0)items.push({name:p,qty:t[0],amt:t[1]});});
      items.sort(function(x,y){return y.amt-x.amt;});
      var old=document.getElementById('fw26card'); if(old)old.remove();
      if(!items.length)return;
      var tot=items.reduce(function(s,e){return s+e.amt;},0)||1;
      var totQ=items.reduce(function(s,e){return s+e.qty;},0);
      var card=document.createElement('div'); card.className='card'; card.id='fw26card';
      var h='<h3>26FW 1차 신상 판매</h3><div class="cs">전채널 합산 · 26FW 신상만 · 8/28 오픈 후 누적 · 총 '+totQ+'장 · '+won(tot)+'</div>';
      h+='<table><tr><th class="n">순위 · 상품</th><th>수량</th><th>실결제</th><th>비중</th></tr>';
      items.forEach(function(e,idx){var pct=Math.round(e.amt/tot*100);h+='<tr class="clk" data-prod="'+String(e.name).replace(/"/g,'&quot;')+'"><td class="n"><span class="rank">'+(idx+1)+'</span>'+e.name+'</td><td>'+e.qty+'</td><td>'+won(e.amt)+'</td><td>'+pct+'%</td></tr>';});
      h+='</table>';
      card.innerHTML=h;
      var dailyCard=null,h3s=document.querySelectorAll('#views .card h3');
      for(var i=0;i<h3s.length;i++){if(/일별/.test(h3s[i].textContent)){dailyCard=h3s[i].closest('.card');break;}}
      if(dailyCard&&dailyCard.parentNode){dailyCard.parentNode.insertBefore(card,dailyCard.nextSibling);}
      else{var v0=document.getElementById('views');if(v0)v0.appendChild(card);}
      mark();
    }
    var v=document.getElementById('views');
    if(v){new MutationObserver(function(){renderNew2();mark();if(!document.getElementById('fw26card'))renderFW26();}).observe(v,{childList:true,subtree:true});}
    renderNew2();
    mark();
    renderFW26();
  }).catch(function(){});
})();
