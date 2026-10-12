/* Plano de pagamento da venda (estimativa): ato + mensais + reforcos + FGTS + financiamento Caixa + pos-chaves.
   Mensal da construtora = o que sobra do valor do imovel. Durante a obra o cliente tambem paga a evolucao (juros de obra):
   % de avanco da obra x prestacao do financiamento. Depende de simulador.js. */
(function(){
  var S=window.SIM;
  // mes/ano das chaves (= mes do financiamento na planilha da construtora) e quantidade padrao de parcelas pos-chaves
  var FLUXO={aura:{m:6,a:2029,pos:30},gran_maltech:{m:10,a:2028,pos:24},visio_home:{m:3,a:2028,pos:24},viva_serenita:{m:4,a:2029,pos:24},vivanti:{m:2,a:2030,pos:30}};
  var MES=['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  var rotulo=function(x){return MES[x.m-1]+'/'+x.a};
  var r2=function(v){return Math.round(v*100)/100};

  // meses de obra: do mes seguinte a hoje ate o mes das chaves
  function mesesObra(emp,hoje){
    var f=FLUXO[emp],out=[],y=hoje.getFullYear(),m=hoje.getMonth()+2;
    if(m>12){m-=12;y++}
    while(y<f.a||(y===f.a&&m<=f.m)){out.push({m:m,a:y});m++;if(m>12){m=1;y=y+1}}
    return out;
  }
  function posMeses(emp,n){
    var f=FLUXO[emp],out=[],m=f.m+1,y=f.a;if(m>12){m=1;y++}
    for(var i=0;i<n;i++){out.push({m:m,a:y});m++;if(m>12){m=1;y++}}
    return out;
  }
  // o: {ato, nMensais, freq:'0'|'S'|'A', nRef, vRef, posPct, posN, usarFgts}
  function calcula(p,u,emp,o,hoje){
    hoje=hoje||new Date();
    var valor=u[3],cap=S.capacidadeDe(p,u),finMax=Math.round(u[4]*0.8),fin=Math.min(finMax,cap.fin);
    var prestacao=r2(fin*cap.parcela/cap.fin),obra=mesesObra(emp,hoje),N=obra.length;
    var nMen=Math.max(0,Math.min(o.nMensais,N)),pos=r2(valor*o.posPct/100),posN=Math.max(1,Math.min(24,o.posN));
    var fgts=(o.usarFgts&&p.cotista)?p.fgts:0;
    var refMeses=obra.filter(function(x){return o.freq==='A'?x.m===12:o.freq==='S'?(x.m===6||x.m===12):false}).slice(0,o.nRef);
    var totRef=r2(refMeses.length*o.vRef),ato=Math.min(o.ato,valor);
    var restante=r2(valor-ato-fin-pos-fgts-totRef),mensal=nMen>0?r2(restante/nMen):0;
    var rows=obra.map(function(x,i){
      var pct=(i+1)/N,ev=r2(prestacao*pct),men=i<nMen?mensal:0,ref=refMeses.indexOf(x)>=0?o.vRef:0;
      return {mes:rotulo(x),pct:pct,evolucao:ev,mensal:men,reforco:ref,total:r2(ev+men+ref)};
    });
    var posRows=posMeses(emp,posN).map(function(x){return {mes:rotulo(x),prestacao:prestacao,pos:r2(pos/posN),total:r2(prestacao+pos/posN)}});
    return {valor:valor,ato:ato,fin:fin,finMax:finMax,limitado:fin<finMax,prestacao:prestacao,nMensais:nMen,mensal:mensal,restante:restante,
      reforcos:refMeses.length,vRef:o.vRef,totRef:totRef,pos:pos,posN:posN,posPct:o.posPct,fgts:fgts,obraMeses:N,chaves:rotulo(FLUXO[emp]),
      inicio:N?rotulo(obra[0]):'',rows:rows,posRows:posRows,excede:restante<0,maxMensal:N>0?Math.max.apply(null,rows.map(function(r){return r.total})):0};
  }
  // texto do plano (e-mail)
  function texto(pl){
    var f=S.fmt,L=[];
    L.push('PLANO DE PAGAMENTO (estimativa)','Valor do imóvel: '+f(pl.valor),'Ato (assinatura): '+f(pl.ato),
      'Mensais: '+pl.nMensais+' x '+f(pl.mensal)+(pl.nMensais?' (início '+pl.inicio+')':''),
      'Reforços: '+(pl.reforcos?pl.reforcos+' x '+f(pl.vRef):'nenhum'),
      'FGTS na entrega: '+f(pl.fgts),'Financiamento Caixa: '+f(pl.fin)+(pl.limitado?' (limitado pela capacidade do cliente; máximo da cota 80% avaliação '+f(pl.finMax)+')':''),
      'Prestação do financiamento: '+f(pl.prestacao),'Pós-chaves ('+pl.posPct+'% do imóvel, corrigido pelo IGP-M mais juros de 1%): '+pl.posN+' x '+f(pl.pos/pl.posN)+' = '+f(pl.pos),
      'Chaves/financiamento: '+pl.chaves+(pl.excede?' | ATENÇÃO: o plano excede o valor do imóvel':''),'','EVOLUÇÃO DA OBRA (mês | % obra | evolução Caixa | mensal | reforço | total)');
    pl.rows.forEach(function(r){L.push(r.mes+' | '+(r.pct*100).toFixed(1)+'% | '+f(r.evolucao)+' | '+f(r.mensal)+' | '+f(r.reforco)+' | '+f(r.total))});
    L.push('','APÓS AS CHAVES (mês | prestação | pós-chaves | total)');
    pl.posRows.forEach(function(r){L.push(r.mes+' | '+f(r.prestacao)+' | '+f(r.pos)+' | '+f(r.total))});
    return L.join('\n');
  }
  window.PLANO={FLUXO:FLUXO,calcula:calcula,texto:texto,mesesObra:mesesObra};
})();
