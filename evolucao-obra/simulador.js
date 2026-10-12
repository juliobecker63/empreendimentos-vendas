/* Simulador de enquadramento MCMV (estimativa preliminar). Depende de dados.js (window.DADOS). */
(function(){
  var D=window.DADOS, TETO={3:400000,4:600000}, IDADE_MAX_MESES=80*12+6, PRAZO=420;
  var fmt=function(v){return v.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})};
  var anuidade=function(i,n){return (1-Math.pow(1+i,-n))/i};

  function idadeMeses(nasc,hoje){ // nasc 'AAAA-MM-DD'
    var d=new Date(nasc+'T00:00:00'); if(isNaN(d)) return null;
    return (hoje.getFullYear()-d.getFullYear())*12+hoje.getMonth()-d.getMonth()-(hoje.getDate()<d.getDate()?1:0);
  }

  // f: {renda, nasc, cotista(bool: +36 meses CTPS), fgts(R$)}
  function perfil(f,hoje){
    hoje=hoje||new Date();
    var r={renda:f.renda,fgts:f.fgts||0,erro:null};
    var im=idadeMeses(f.nasc,hoje);
    if(im==null||im<18*12) {r.erro='idade';return r}
    r.idade=Math.floor(im/12);
    r.prazo=Math.min(PRAZO,IDADE_MAX_MESES-im);
    if(r.prazo<60){r.erro='prazo';return r}
    if(f.renda<D.tab[0][1]){r.erro='renda_baixa';return r}
    if(f.renda>D.tab[D.tab.length-1][1]){r.erro='renda_alta';return r}
    var lin=D.tab[0];
    D.tab.forEach(function(l){if(l[1]<=f.renda) lin=l});
    r.faixa=lin[0];
    r.taxa=f.cotista?lin[4]:lin[2];
    var base=f.cotista?lin[5]:lin[3];
    var i=r.taxa/12;
    r.maxFin=Math.round(base*anuidade(i,r.prazo)/anuidade(i,PRAZO)); // reduz se prazo < 420 meses
    r.parcelaMax=f.renda*0.30;
    return r;
  }

  // status: 'cabe' | 'ajuste' (cobre o que falta com FGTS/entrada extra) | null
  function avalia(p,u){
    if(p.erro) return null;
    var valor=Math.min(u[3],u[4]);
    if(valor>TETO[p.faixa]) return null;
    var falta=Math.max(0,u[5]-p.maxFin);
    if(falta===0) return {st:'cabe',falta:0,entrada:u[6]};
    if(falta<=p.fgts) return {st:'ajuste',falta:falta,entrada:u[6]+falta};
    return null;
  }

  function empreendimento(p,key){
    var e=D.emp[key],res={key:key,nome:e.nome,cabe:[],ajuste:[],total:e.u.length};
    e.u.forEach(function(u){var a=avalia(p,u);if(a){(a.st==='cabe'?res.cabe:res.ajuste).push({u:u,a:a})}});
    return res;
  }
  function todos(p){return Object.keys(D.emp).map(function(k){return empreendimento(p,k)})}

  window.SIM={fmt:fmt,perfil:perfil,empreendimento:empreendimento,todos:todos,TETO:TETO};
})();
