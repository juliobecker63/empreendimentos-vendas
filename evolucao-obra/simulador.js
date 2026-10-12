/* Simulador de enquadramento MCMV (estimativa preliminar). Depende de dados.js (window.DADOS).
   Regras:
   - Faixa efetiva = 4 se a renda > R$ 9.600 OU o imovel (menor entre venda e avaliacao) > R$ 400 mil; senao Faixa 3.
   - Teto do imovel: R$ 600 mil. Renda: R$ 5.000,01 a R$ 13.000 (limites da tabela da Caixa).
   - Financiamento: tabela da Caixa (renda -> financ.), s/ redutor ou c/ redutor (36 meses de contribuicao ao FGTS).
     Faixa 4 com renda < 9.600: extrapola a tabela da Faixa 4 (parcela 30% da renda, mesma inclinacao das linhas da tabela).
   - O FGTS so entra na entrada se o cliente tem 36 meses de contribuicao. */
(function(){
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
    var faixa=faixaDe(p,valor),cap=capacidade(p,faixa,p.cotista),falta=Math.max(0,u[5]-cap.fin);
    var base={faixa:faixa,taxa:cap.taxa,maxFin:cap.fin};
    if(falta===0) return Object.assign(base,{st:'cabe',falta:0,entrada:u[6]});
    if(falta<=p.fgts) return Object.assign(base,{st:'ajuste',falta:falta,entrada:u[6]+falta});
    return null;
  }

  function empreendimento(p,key){
    var e=D.emp[key],res={key:key,nome:e.nome,cabe:[],ajuste:[],total:e.u.length};
    e.u.forEach(function(u){var a=avalia(p,u);if(a){(a.st==='cabe'?res.cabe:res.ajuste).push({u:u,a:a})}});
    return res;
  }
  function todos(p){return Object.keys(D.emp).map(function(k){return empreendimento(p,k)})}

  window.SIM={fmt:fmt,perfil:perfil,cenarios:cenarios,empreendimento:empreendimento,todos:todos};
})();
