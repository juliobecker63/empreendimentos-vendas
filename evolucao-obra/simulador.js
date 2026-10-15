/* Simulador de enquadramento MCMV (estimativa preliminar). Depende de dados.js (window.DADOS).
   Regras:
   - Faixa efetiva = 4 se a renda > R$ 9.600 OU o imovel (menor entre venda e avaliacao) > R$ 400 mil; senao Faixa 3.
   - Teto do imovel: R$ 600 mil. Renda: R$ 5.000,01 a R$ 13.000 (limites da tabela da Caixa).
   - Financiamento: tabela da Caixa (renda -> financ.), s/ redutor ou c/ redutor (36 meses de contribuicao ao FGTS).
     Faixa 4 com renda < 9.600: extrapola a tabela da Faixa 4 (parcela 30% da renda, mesma inclinacao das linhas da tabela).
   - O FGTS so entra na entrada se o cliente tem 36 meses de contribuicao. */
(function(){
  // Viva Urban: lancamento previsto p/ fim do mes, so ha 2 valores de referencia (a partir de). Fica aqui (e nao em dados.js) para o sync.py nao apagar.
  // Avaliacao assumida = valor; trocar por unidades reais quando a tabela chegar. [bloco, unidade, area, valor, avaliacao, financiamento 80%, ato]
  if(!window.DADOS.emp.viva_urban) window.DADOS.emp.viva_urban={nome:'Viva Urban Viarello Residence',u:[['A partir de','2 dormitórios',0,389000,389000,311200,0],['A partir de','2 dormitórios com suíte',0,464000,464000,371200,0]]};
  var D=window.DADOS, TETO=600000, LIM3=400000, RENDA3=9600, IDADE_MAX_MESES=80*12+6, PRAZO=420;
  var T3=D.tab.filter(function(l){return l[0]===3}), T4=D.tab.filter(function(l){return l[0]===4});
  var fmt=function(v){return v.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})};
  var anuidade=function(i,n){return (1-Math.pow(1+i,-n))/i};

  function idadeMeses(nasc,hoje){
    var d=new Date(nasc+'T00:00:00'); if(isNaN(d)) return null;
    return (hoje.getFullYear()-d.getFullYear())*12+hoje.getMonth()-d.getMonth()-(hoje.getDate()<d.getDate()?1:0);
  }
  function linha(tab,renda){var l=tab[0];tab.forEach(function(x){if(x[1]<=renda) l=x});return l}

  // f: {renda, nasc, cotista(bool: 36 meses de contribuicao FGTS), fgts(R$)}
  function perfil(f,hoje){
    hoje=hoje||new Date();
    var r={renda:f.renda,cotista:!!f.cotista,fgts:f.cotista?(f.fgts||0):0,fgtsInformado:f.fgts||0,erro:null};
    var im=idadeMeses(f.nasc,hoje);
    if(im==null||im<18*12){r.erro='idade';return r}
    r.idade=Math.floor(im/12);
    r.prazo=Math.min(PRAZO,IDADE_MAX_MESES-im);
    if(r.prazo<60){r.erro='prazo';return r}
    if(f.renda<D.tab[0][1]){r.erro='renda_baixa';return r}
    if(f.renda>T4[T4.length-1][1]){r.erro='renda_alta';return r}
    return r;
  }

  // capacidade de financiamento na faixa efetiva (3 ou 4), com ou sem redutor
  function capacidade(p,faixa,redutor){
    var taxa,fin,parcela,l;
    if(faixa===3){l=linha(T3,p.renda);taxa=redutor?l[5]:l[3];fin=redutor?l[6]:l[4];parcela=l[2]}
    else if(p.renda>RENDA3){l=linha(T4,p.renda);taxa=l[3];fin=l[4];parcela=l[2]}
    else{ // Faixa 4 com renda < 9.600: extrapola a tabela da Faixa 4
      var a=T4[0],b=T4[T4.length-1],slope=(b[4]-a[4])/(b[2]-a[2]);
      parcela=Math.round(p.renda*0.30*100)/100;taxa=a[3];fin=a[4]+slope*(parcela-a[2]);
    }
    var i=taxa/12;
    return {taxa:taxa,parcela:parcela,fin:Math.round(fin*anuidade(i,p.prazo)/anuidade(i,PRAZO))};
  }

  var faixaDe=function(p,valor){return (p.renda>RENDA3||valor>LIM3)?4:3};

  // dois cenarios (sem e com redutor) por tipo de imovel
  function cenarios(p){
    if(p.erro) return [];
    var def=[{rotulo:'Imóvel até R$ 400 mil',faixa:faixaDe(p,0)},{rotulo:'Imóvel de R$ 400 mil a R$ 600 mil',faixa:4}];
    return def.map(function(d){return {rotulo:d.rotulo,faixa:d.faixa,sem:capacidade(p,d.faixa,false),com:capacidade(p,d.faixa,true)}});
  }

  // st: 'cabe' | 'ajuste' (diferenca coberta por entrada maior, via FGTS) | null
  function avalia(p,u){
    if(p.erro) return null;
    var valor=Math.min(u[3],u[4]);
    if(valor>TETO) return null;
    var faixa=faixaDe(p,valor),cap=capacidade(p,faixa,p.cotista),fnec=Math.round(u[4]*0.8),falta=Math.max(0,fnec-cap.fin),fin=Math.min(fnec,cap.fin);
    var base={faixa:faixa,taxa:cap.taxa,maxFin:cap.fin,fin:fin};
    if(falta===0) return Object.assign(base,{st:'cabe',falta:0,entrada:u[3]-fin});
    if(falta<=p.fgts) return Object.assign(base,{st:'ajuste',falta:falta,entrada:u[3]-fin});
    return null;
  }

  function empreendimento(p,key){
    var e=D.emp[key],res={key:key,nome:e.nome,cabe:[],ajuste:[],total:e.u.length};
    e.u.forEach(function(u){var a=avalia(p,u);if(a){(a.st==='cabe'?res.cabe:res.ajuste).push({u:u,a:a})}});
    return res;
  }
  function todos(p){return Object.keys(D.emp).map(function(k){return empreendimento(p,k)})}


  // --- unidade solicitada a partir do botao do site (emp, un, t=torre/bloco, v=valor mostrado no site) ---
  var semEsp=function(x){return String(x||'').toLowerCase().replace(/\s+/g,'')};
  function numDe(u){return semEsp(u[1].replace(/^Apto\s+/i,'').replace(/\s+da\s+(Torre|Bloco)\s+\w+$/i,'').replace(/\s+BL\d+$/i,'').replace(/\s+[A-Z]$/,''))}
  function torreDe(u){return String(u[0]).replace(/^(Torre|Bloco)\s+/i,'').replace(/^0+/,'').toLowerCase()}
  var mediana=function(a){a=a.slice().sort(function(x,y){return x-y});return a[Math.floor(a.length/2)]};
  function acharUnidade(emp,un,t,v){
    var e=D.emp[emp];if(!e||!un) return null;
    var n=semEsp(un),tt=String(t||'').replace(/^0+/,'').toLowerCase();
    for(var i=0;i<e.u.length;i++){if(numDe(e.u[i])===n&&torreDe(e.u[i])===tt) return {u:e.u[i],estimado:false}}
    v=+v||0;if(!(v>0)) return null; // fora da tabela da construtora: estima pelas proporcoes do empreendimento
    var rf=mediana(e.u.map(function(x){return x[5]/x[3]})),ra=mediana(e.u.map(function(x){return x[4]/x[3]})),rt=mediana(e.u.map(function(x){return x[6]/x[3]}));
    return {u:['Torre/Bloco '+(t||''),un,0,v,Math.round(v*ra),Math.round(v*rf),Math.round(v*rt)],estimado:true};
  }

  // parcela estimada do financiamento de uma unidade (proporcional a relacao parcela/financiamento da tabela)
  function parcelaDe(p,u){
    var valor=Math.min(u[3],u[4]),cap=capacidade(p,faixaDe(p,valor),p.cotista);
    return Math.round(Math.min(Math.round(u[4]*0.8),cap.fin)*cap.parcela/cap.fin*100)/100;
  }

  // campanhas em que a construtora paga as despesas de financiamento/registro (chaves de DADOS.emp). O Julio avisa quais.
  var PROMO_DESPESAS=[];

  function capacidadeDe(p,u){var valor=Math.min(u[3],u[4]);return capacidade(p,faixaDe(p,valor),p.cotista)}
  window.SIM={paramsUnidade:function(u){return {un:numDe(u),t:torreDe(u)}},capacidadeDe:capacidadeDe,fmt:fmt,perfil:perfil,cenarios:cenarios,avalia:avalia,empreendimento:empreendimento,todos:todos,acharUnidade:acharUnidade,parcelaDe:parcelaDe,promoDespesas:function(k){return PROMO_DESPESAS.indexOf(k)>=0}};
})();
