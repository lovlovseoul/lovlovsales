(function(){
  fetch('colors.json?cb='+Date.now()).then(function(r){return r.json();}).then(function(data){
    var BP=data.byPlat||{}, PLATS=data.platforms||Object.keys(BP), days=data.days||[];
    var range = days.length ? (days[0].slice(5).replace('-','/')+'~'+days[days.length-1].slice(5).replace('-','/')) : '';
    // 클릭 가능한 상품 집합 (아무 플랫폼에서라도 판매된)
    var ALLPROD={}; PLATS.forEach(function(p){var c=BP[p]&&BP[p].colors;if(c)Object.keys(c).forEach(function(k){ALLPROD[k]=1;});});
    var st=document.createElement('style');
    st.textContent=
    '.colorpop{position:fixed;z-index:60;background:#14140f;border:1px solid #3a3a30;border-radius:12px;padding:16px 16px 14px;min-width:255px;max-width:340px;max-height:82vh;overflow:auto;box-shadow:0 10px 34px rgba(0,0,0,.55);font-size:13px;color:#eee}'+
    '.colorpop h4{margin:0 22px 2px 0;font-size:14px;line-height:1.3}'+
    '.colorpop .cpsub{font-size:11px;color:#8a8a80;margin-bottom:11px}'+
    '.colorpop .seclab{font-size:10.5px;letter-spacing:.04em;color:#8a8a80;margin:13px 0 7px;text-transform:none}'+
    '.colorpop .crow{margin:7px 0}'+
    '.colorpop .cline{display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px}'+
    '.colorpop .cq{color:#bdbdb2;white-space:nowrap;padding-left:10px}'+
    '.colorpop .cbarwrap{height:6px;background:#2a2a24;border-radius:3px;overflow:hidden}'+
    '.colorpop .cbar{height:100%;border-radius:3px;background:#c9a227}'+
    '.colorpop .sbar{background:#5b8aa6}'+
    '.colorpop .jbar{background:#7fae5f}'+
    '.colorpop .cempty{font-size:12px;color:#8a8a80;padding:4px 0}'+
    '.colorpop .cpclose{position:absolute;top:9px;right:11px;cursor:pointer;color:#8a8a80;font-size:13px}'+
    'tr.clk{cursor:pointer}tr.clk:hover{background:rgba(255,255,255,.05)}';
    document.head.appendChild(st);
    var pop=document.createElement('div');pop.className='colorpop';pop.hidden=true;document.body.appendChild(pop);
    function clean(n){return n.replace(/^\d+\s*/,'').replace(/\s*NEW\s*$/,'').trim();}
    function md(d){var p=d.split('-');return parseInt(p[1],10)+'/'+parseInt(p[2],10);}
    function sectionDaily(row){var el=row.parentElement;while(el&&el!==document.body){if(el.querySelector){var h=el.querySelector('h3');if(h)return /일별/.test(h.textContent);}el=el.parentElement;}return false;}
    function curD(){try{return (typeof curDay!=='undefined')?curDay:(days[days.length-1]);}catch(e){return days[days.length-1];}}
    function curPlat(){try{return (typeof cur!=='undefined')?cur:'전체통합';}catch(e){return '전체통합';}}
    function platList(){var p=curPlat();return (p==='전체통합'||!BP[p])?PLATS:[p];}
    // 선택 스코프(플랫폼/일별)에서 상품의 {키:[q,a]} 병합
    function getMap(prod,periodKey,dayKey,daily){
      var out={},any=false,pl=platList(),d=curD();
      pl.forEach(function(p){
        var src;
        if(daily){var dm=BP[p]&&BP[p][dayKey];src=dm&&dm[d]&&dm[d][prod];}
        else{src=BP[p]&&BP[p][periodKey]&&BP[p][periodKey][prod];}
        if(src){Object.keys(src).forEach(function(k){if(!out[k])out[k]=[0,0];out[k][0]+=src[k][0];out[k][1]+=src[k][1];any=true;});}
      });
      return any?out:null;
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
    function show(name,daily,x,y){
      var cd=getMap(name,'colors','dayColors',daily);
      var sd=getMap(name,'sizes','daySizes',daily);
      var jd=getMap(name,'combos','dayCombos',daily);
      var label=scopeLabel()+' · '+(daily?('일별 · '+md(curD())+' 기준'):('기간 총 · '+range));
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
        pop.innerHTML=h;
      }
      pop.hidden=false;
      var pw=pop.offsetWidth,ph=pop.offsetHeight;
      pop.style.left=Math.max(8,Math.min(x+12,innerWidth-pw-12))+'px';
      pop.style.top=Math.max(8,Math.min(y+12,innerHeight-ph-12))+'px';
      pop.querySelector('.cpclose').onclick=function(ev){ev.stopPropagation();hide();};
    }
    function hide(){pop.hidden=true;}
    function mark(){var rows=document.querySelectorAll('#views table tr');for(var i=0;i<rows.length;i++){var td=rows[i].querySelector('td');if(td&&ALLPROD[clean(td.textContent)])rows[i].classList.add('clk');}}
    document.addEventListener('click',function(e){
      if(pop.contains(e.target))return;
      var tr=e.target.closest('tr');
      if(tr){var td=tr.querySelector('td');if(td){var nm=clean(td.textContent);if(ALLPROD[nm]){show(nm,sectionDaily(tr),e.clientX,e.clientY);return;}}}
      hide();
    });
    // ===== 26FW 신상 판매 섹션 (전채널 합산) =====
    var FW26=["아티잔 워크 카고 팬츠","컷아웃 숄더 드레이핑 니트","랩 브이넥 니트 티","글로시 벨벳 스커트","헤리티지 트윌 치노 팬츠","웜 립 하렘 팬츠","아티잔 러플 블라우스","웜 파인 체크 셔츠","언발란스 랩 체크 셔츠","실키 볼륨 블라우스","마이 젠틀 가디건","레이어 카라 니트","컬러 라인 가디건","스컬프트 드레이핑 니트","더블 레이어 버튼 후디","레이어 슬릿 티","소프트 레이어 터틀 넥","소프트 히트 티","레트로 스트라이프 피케 티","멀티 스트라이프 피케 티","파인 스트라이프 실켓 티","마이 모먼트 스웨이드 봄버","릴렉스 레더 봄버","빈티지 크랙 레더 봄버","프렌치 트위드 자켓","헤리티지 워크자켓","모던 하이넥 점퍼","프렌치 워크 자켓"];
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
      var h='<h3>26FW 신상 판매</h3><div class="cs">전채널 합산 · 26FW 신상만 · 8/28 오픈 후 누적 · 총 '+totQ+'장 · '+won(tot)+'</div>';
      h+='<table><tr><th class="n">순위 · 상품</th><th>수량</th><th>실결제</th><th>비중</th></tr>';
      items.forEach(function(e,idx){var pct=Math.round(e.amt/tot*100);h+='<tr class="clk"><td class="n"><span class="rank">'+(idx+1)+'</span>'+e.name+'</td><td>'+e.qty+'</td><td>'+won(e.amt)+'</td><td>'+pct+'%</td></tr>';});
      h+='</table>';
      card.innerHTML=h;
      var dailyCard=null,h3s=document.querySelectorAll('#views .card h3');
      for(var i=0;i<h3s.length;i++){if(/일별/.test(h3s[i].textContent)){dailyCard=h3s[i].closest('.card');break;}}
      if(dailyCard&&dailyCard.parentNode){dailyCard.parentNode.insertBefore(card,dailyCard.nextSibling);}
      else{var v0=document.getElementById('views');if(v0)v0.appendChild(card);}
      mark();
    }
    var v=document.getElementById('views');
    if(v){new MutationObserver(function(){mark();if(!document.getElementById('fw26card'))renderFW26();}).observe(v,{childList:true,subtree:true});}
    mark();
    renderFW26();
  }).catch(function(){});
})();
