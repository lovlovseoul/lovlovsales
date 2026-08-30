(function(){
  fetch('colors.json?cb='+Date.now()).then(function(r){return r.json();}).then(function(data){
    var C=data.colors||{}, DC=data.dayColors||{}, SZ=data.sizes||{}, DSZ=data.daySizes||{}, days=data.days||[];
    var range = days.length ? (days[0].slice(5).replace('-','/')+'~'+days[days.length-1].slice(5).replace('-','/')) : '';
    var st=document.createElement('style');
    st.textContent=
    '.colorpop{position:fixed;z-index:60;background:#14140f;border:1px solid #3a3a30;border-radius:12px;padding:16px 16px 14px;min-width:255px;max-width:340px;box-shadow:0 10px 34px rgba(0,0,0,.55);font-size:13px;color:#eee}'+
    '.colorpop h4{margin:0 22px 2px 0;font-size:14px;line-height:1.3}'+
    '.colorpop .cpsub{font-size:11px;color:#8a8a80;margin-bottom:11px}'+
    '.colorpop .seclab{font-size:10.5px;letter-spacing:.04em;color:#8a8a80;margin:13px 0 7px;text-transform:none}'+
    '.colorpop .crow{margin:7px 0}'+
    '.colorpop .cline{display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px}'+
    '.colorpop .cq{color:#bdbdb2;white-space:nowrap;padding-left:10px}'+
    '.colorpop .cbarwrap{height:6px;background:#2a2a24;border-radius:3px;overflow:hidden}'+
    '.colorpop .cbar{height:100%;border-radius:3px;background:#c9a227}'+
    '.colorpop .sbar{background:#5b8aa6}'+
    '.colorpop .cempty{font-size:12px;color:#8a8a80;padding:4px 0}'+
    '.colorpop .cpclose{position:absolute;top:9px;right:11px;cursor:pointer;color:#8a8a80;font-size:13px}'+
    'tr.clk{cursor:pointer}tr.clk:hover{background:rgba(255,255,255,.05)}';
    document.head.appendChild(st);
    var pop=document.createElement('div');pop.className='colorpop';pop.hidden=true;document.body.appendChild(pop);
    function clean(n){return n.replace(/^\d+\s*/,'').replace(/\s*NEW\s*$/,'').trim();}
    function md(d){var p=d.split('-');return parseInt(p[1],10)+'/'+parseInt(p[2],10);}
    function sectionDaily(row){var el=row.parentElement;while(el&&el!==document.body){if(el.querySelector){var h=el.querySelector('h3');if(h)return /일별/.test(h.textContent);}el=el.parentElement;}return false;}
    function curD(){try{return (typeof curDay!=='undefined')?curDay:(days[days.length-1]);}catch(e){return days[days.length-1];}}
    function bars(obj,cls){
      var ents=Object.keys(obj).map(function(k){return [k,obj[k]];}).sort(function(a,b){return b[1][0]-a[1][0];});
      var tot=ents.reduce(function(s,e){return s+e[1][0];},0)||1;
      var h='';
      ents.forEach(function(e){var c=e[0],v=e[1];var pct=Math.round(v[0]/tot*100);h+='<div class="crow"><div class="cline"><span>'+c+'</span><span class="cq">'+v[0]+'장 · '+pct+'%</span></div><div class="cbarwrap"><div class="cbar '+cls+'" style="width:'+pct+'%"></div></div></div>';});
      return h;
    }
    function show(name,daily,x,y){
      var cd,sd,label;
      if(daily){var d=curD();cd=(DC[d]||{})[name];sd=(DSZ[d]||{})[name];label='일별 · '+md(d)+' 기준';}
      else{cd=C[name];sd=SZ[name];label='기간 총 · '+range;}
      var h='<span class="cpclose">✕</span><h4>'+name+'</h4>';
      if(!cd){pop.innerHTML=h+'<div class="cpsub">'+label+'</div><div class="cempty">이 날짜 컬러 데이터가 없어요<br>(컬러 집계 '+range+' 커버)</div>';}
      else{
        var tot=Object.keys(cd).reduce(function(s,k){return s+cd[k][0];},0)||1;
        h+='<div class="cpsub">'+label+' · 총 '+tot+'장</div>';
        h+='<div class="seclab">컬러별</div>'+bars(cd,'');
        // 사이즈: FREE/미분류만 있으면 생략
        if(sd){
          var real={}; var hasReal=false;
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
    function mark(){var rows=document.querySelectorAll('#views table tr');for(var i=0;i<rows.length;i++){var td=rows[i].querySelector('td');if(td&&C[clean(td.textContent)])rows[i].classList.add('clk');}}
    document.addEventListener('click',function(e){
      if(pop.contains(e.target))return;
      var tr=e.target.closest('tr');
      if(tr){var td=tr.querySelector('td');if(td){var nm=clean(td.textContent);if(C[nm]){show(nm,sectionDaily(tr),e.clientX,e.clientY);return;}}}
      hide();
    });
    var v=document.getElementById('views');
    if(v){new MutationObserver(mark).observe(v,{childList:true,subtree:true});}
    mark();
  }).catch(function(){});
})();
