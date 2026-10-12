(function(){
var S=SIM,app=document.getElementById('app'),wa=app.dataset.wa,esc=function(t){return String(t).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
var AVISO='';
var f=null;try{f=JSON.parse(sessionStorage.getItem('simViva'))}catch(e){}
if(!f){app.innerHTML='<h1>Preencha a simulação primeiro</h1><p class="sub">Não encontramos seus dados.</p><a class="btn" href="/evolucao-obra/">Fazer a simulação</a>';return}
var p=S.perfil(f),primeiro=esc(f.nome.split(' ')[0]),all=S.todos(p),sel=all.filter(function(r){return r.key===f.emp})[0],outros=all.filter(function(r){return r.key!==f.emp});
var qtd=function(r){return r?r.cabe.length+r.ajuste.length:0},algum=all.some(function(r){return qtd(r)>0});
var msgs={idade:'A idade informada não permite o financiamento.',prazo:'Pela idade, o prazo de financiamento ficaria muito curto.',renda_baixa:'Sua renda está abaixo das faixas desta simulação (a partir de R$ 5.000,01).',renda_alta:'Sua renda está acima do limite do Minha Casa Minha Vida (R$ 13.000,00).'};
var waLink=function(t){return 'https://wa.me/'+wa+'?text='+encodeURIComponent(t)},pc=function(x){return (x*100).toFixed(2).replace('.',',')+'% a.a.'};
var porValor=function(a,b){return a.u[3]-b.u[3]};
var curto=function(u){return esc(u[1].replace(/ da (Torre|Bloco) [A-Za-z0-9]+$/,''))};
function linha(x){
  return '<tr class="'+(x.a.st==='ajuste'?'aj':'')+'"><td>'+curto(x.u)+(x.u[0]?' <small class="bl">'+esc(x.u[0])+'</small>':'')+'</td><td>'+(x.u[2]?x.u[2].toFixed(2).replace('.',',')+' m²':'-')+'</td><td>'+S.fmt(x.u[3])+'</td><td>'+S.fmt(x.u[5])+'</td><td>'+S.fmt(x.a.entrada)+(x.a.st==='ajuste'?'<small>inclui '+S.fmt(x.a.falta)+' a mais de entrada (pode usar o FGTS)</small>':'')+'</td></tr>';
}
function tabela(r){
  var rows=r.cabe.concat(r.ajuste).sort(porValor),LIM=10,id='t'+r.key;
  var h='<div class="tw"><table><thead><tr><th>Apartamento</th><th>Área</th><th>Valor</th><th>Financiamento</th><th>Entrada (ato)</th></tr></thead><tbody>'+rows.slice(0,LIM).map(linha).join('')+'</tbody>';
  if(rows.length>LIM) h+='<tbody id="'+id+'" hidden>'+rows.slice(LIM).map(linha).join('')+'</tbody>';
  h+='</table></div>';
  if(rows.length>LIM) h+='<button class="lite noprint" data-more="'+id+'">Mostrar todos os '+rows.length+' apartamentos</button>';
  return h;
}
function bloco(r){var n=qtd(r);return '<div class="card emp"><h3>'+esc(r.nome)+'<span>'+n+' apartamento'+(n>1?'s':'')+' no seu perfil</span></h3>'+tabela(r)+'</div>'}
function evolucao(parcela,titulo){
  return '<div class="card"><b>Evolução do pagamento durante a obra</b><p class="sub" style="margin:4px 0 8px">'+titulo+' Durante a obra você paga à Caixa, a cada mês, o percentual da parcela igual ao avanço da obra, até chegar a 100%.</p><label style="font-weight:600">Prazo da obra: <span id="ev_n">36</span> meses</label><input id="ev_r" type="range" min="12" max="48" value="36"><div class="res"><div><small>1ª parcela (mês 1)</small><b id="ev_a"></b></div><div><small>Última parcela (mês <span id="ev_l"></span>)</small><b id="ev_z"></b></div></div><p class="note" id="ev_t" style="margin:0 0 6px"></p><div class="tw"><table><thead><tr><th>Mês</th><th>% da obra</th><th>Paga à Caixa</th></tr></thead><tbody id="ev_b"></tbody></table></div><p class="note">Evolução linear de obra (mesmo percentual por mês), apenas como base de estimativa de despesa. A parcela estimada é de '+S.fmt(parcela)+' por mês após a obra.</p></div>';
}
function ligaEvolucao(parcela){
  var r=document.getElementById('ev_r');if(!r)return;
  function go(){var N=+r.value,rows='',tot=0;document.getElementById('ev_n').textContent=document.getElementById('ev_l').textContent=N;
    for(var m=1;m<=N;m++){var v=Math.round(parcela*m/N*100)/100;tot+=v;rows+='<tr'+(m==1||m==N?' class="hl"':'')+'><td>'+m+'</td><td>'+(m/N*100).toFixed(2).replace('.',',')+'%</td><td>'+S.fmt(v)+'</td></tr>'}
    document.getElementById('ev_b').innerHTML=rows;document.getElementById('ev_a').textContent=S.fmt(Math.round(parcela/N*100)/100);document.getElementById('ev_z').textContent=S.fmt(parcela);document.getElementById('ev_t').textContent='Total pago à Caixa durante a obra: '+S.fmt(tot)}
  r.addEventListener('input',go);go();
}
var nome=DADOS.emp[f.emp]?DADOS.emp[f.emp].nome:(f.emp==='viva_urban'?'Viva Urban':'(simulação geral)'),h='<h1>'+primeiro+', este é o seu resultado</h1><p class="sub">Simulação preliminar do Minha Casa Minha Vida.</p>'+AVISO,parcelaEvo=0,tituloEvo='';
var ach=f.un&&sel?S.acharUnidade(f.emp,f.un,f.t,f.v):null,uLabel=f.un?esc(f.un)+(f.t?' (torre/bloco '+esc(f.t.toUpperCase())+')':''):'';
if(p.erro){
  h+='<div class="banner warn">'+msgs[p.erro]+'<br>Queremos conversar com você pessoalmente: temos opções para reformular a forma de pagamento e tentar viabilizar a compra do seu novo imóvel.</div>';
}else{
  h+='<div class="card"><b>Seu financiamento estimado</b><p class="sub" style="margin:4px 0 8px">Renda familiar de '+S.fmt(f.renda)+' (parcela até 30% da renda). A faixa muda conforme o valor do imóvel.</p><div class="tw"><table><thead><tr><th>Valor do imóvel</th><th>Faixa</th><th>Sem redutor<br><small>(menos de 36 meses de FGTS)</small></th><th>Com redutor<br><small>(36 meses ou mais de FGTS)</small></th></tr></thead><tbody>'+S.cenarios(p).map(function(c){var a=c.sem.fin===c.com.fin;return '<tr><td>'+c.rotulo+'</td><td>Faixa '+c.faixa+'</td><td'+(!p.cotista?' style="background:#fff7da;font-weight:700"':'')+'>'+S.fmt(c.sem.fin)+'<small class="bl"> '+pc(c.sem.taxa)+'</small></td><td'+(p.cotista?' style="background:#fff7da;font-weight:700"':'')+'>'+(a?'<small class="bl">igual (Faixa 4 não tem redutor)</small><br>':'')+S.fmt(c.com.fin)+'<small class="bl"> '+pc(c.com.taxa)+'</small></td></tr>'}).join('')+'</tbody></table></div><p class="note" style="margin-top:8px">Destacado: o seu caso ('+(p.cotista?'com':'sem')+' redutor).'+(f.fgtsInformado?(p.cotista?' FGTS informado: '+S.fmt(f.fgtsInformado)+', que pode ajudar na entrada.':' O FGTS só pode ser usado na compra com 36 meses ou mais de contribuição, por isso não foi considerado.'):'')+'</p></div>';
  var fit=sel?sel.cabe.concat(sel.ajuste).sort(porValor):[];
  if(ach){
    var u=ach.u,a=S.avalia(p,u),valor=u[3];
    h+='<div class="card"><b>Apartamento solicitado</b><p style="margin-top:4px">'+esc(sel.nome)+' – apartamento '+uLabel+' – '+S.fmt(valor)+(ach.estimado?' <small class="bl">(valores de financiamento e entrada estimados)</small>':'')+'</p></div>';
    if(a){
      h+='<div class="banner ok">Boa notícia! O apartamento <b>'+uLabel+'</b> do <b>'+esc(sel.nome)+'</b> cabe no seu financiamento.'+(a.st==='ajuste'?' Será preciso uma entrada maior ('+S.fmt(a.entrada)+'), que pode ser coberta com o FGTS.':' Entrada (ato) estimada: '+S.fmt(a.entrada)+'.')+'</div>';
      parcelaEvo=S.parcelaDe(p,u);tituloEvo='Parcela estimada do apartamento '+uLabel+'.';
    }else{
      var acima=Math.min(u[3],u[4])>600000;
      h+='<div class="banner warn">O apartamento <b>'+uLabel+'</b> do <b>'+esc(sel.nome)+'</b> '+(acima?'tem valor acima do limite do Minha Casa Minha Vida (R$ 600 mil).':'ficou acima do financiamento que estimamos para o seu perfil.')+'</div>';
      if(fit.length){var m=fit[0];h+='<div class="banner ok"><b>Mas há opção no mesmo empreendimento!</b> O apartamento de menor valor que você consegue financiar no '+esc(sel.nome)+' é o <b>'+curto(m.u)+'</b> ('+esc(m.u[0])+'), de '+S.fmt(m.u[3])+'. Veja abaixo as opções.</div>';parcelaEvo=S.parcelaDe(p,m.u);tituloEvo='Parcela estimada do apartamento '+curto(m.u)+' ('+esc(m.u[0])+'), o de menor valor que cabe no seu perfil neste empreendimento.'}
      h+='<div class="alt"><b>Dá para comprar o apartamento que você escolheu mesmo assim.</b> A construtora permite uma alternativa para viabilizar a compra de um imóvel que não coube no financiamento. Fale com o corretor para montarmos a melhor forma de pagamento para você.</div>';
    }
  }else if(f.un&&sel){h+='<div class="card"><b>Apartamento solicitado</b><p style="margin-top:4px">'+esc(sel.nome)+' – apartamento '+uLabel+' (valor sob consulta). Veja abaixo o que cabe no seu perfil.</p></div>'}
  if(!sel&&f.emp==='viva_urban') h+='<div class="card"><b>Viva Urban</b><p style="margin-top:4px">O Viva Urban ainda não tem tabela de valores. Veja abaixo o que cabe no seu perfil nos outros empreendimentos Viva Corp, e fale com o corretor sobre o Viva Urban.</p></div>';
  if(!algum) h+='<div class="banner warn"><b>Ainda não encontramos um apartamento que caiba direto no seu perfil.</b><br>Mas isso tem solução: queremos uma <b>entrevista pessoal</b> com você, porque temos algumas opções de reformular as formas de pagamento e tentar conseguir a aquisição do seu novo imóvel.</div>';
  else if(!ach){
    if(qtd(sel)) h+='<div class="banner ok">Boa notícia! No <b>'+esc(sel.nome)+'</b> você se encaixa em <b>'+qtd(sel)+'</b> apartamento'+(qtd(sel)>1?'s':'')+'.</div>';
    else if(sel) h+='<div class="banner warn">No <b>'+esc(sel.nome)+'</b> ainda não encontramos apartamento que caiba direto no seu perfil — mas veja as opções abaixo em outros empreendimentos.</div>';
    if(fit.length){parcelaEvo=S.parcelaDe(p,fit[0].u);tituloEvo='Parcela estimada do apartamento '+curto(fit[0].u)+', o de menor valor que cabe no seu perfil neste empreendimento.'}
  }
  if(parcelaEvo) h+=evolucao(parcelaEvo,tituloEvo);
  h+='<div class="card"><b>Despesas de financiamento e registro</b><p style="margin-top:6px">As despesas de financiamento e de registro do imóvel são pagas pela construtora no dia da assinatura do financiamento junto à Caixa, e você pode pagar essa quantia à construtora <b>parcelada em até 24 vezes</b>.</p>'+(sel&&S.promoDespesas(f.emp)?'<p style="margin-top:8px;background:#e4f5ec;color:#0f5c38;border-radius:8px;padding:8px 12px"><b>Promoção neste empreendimento:</b> a construtora paga essas despesas para você.</p>':'<p class="note">Em algumas campanhas a construtora paga essas despesas. O corretor avisa em quais empreendimentos isso acontece.</p>')+'</div>';
  if(qtd(sel)&&!ach) h+='<h2>Empreendimento que você escolheu</h2>'+bloco(sel);
  else if(qtd(sel)) h+='<h2>Outros apartamentos que cabem no '+esc(sel.nome)+'</h2>'+bloco(sel);
  var op=outros.filter(function(r){return qtd(r)>0});
  if(op.length) h+='<h2>'+(qtd(sel)?'Outros empreendimentos que você também pode escolher':'Opções para você')+'</h2>'+op.map(bloco).join('');
  h+='<p class="note">Entrada = ato; linhas com faixa dourada precisam de entrada maior, que pode ser coberta com o FGTS.</p>';
}
var apt=f.un?'o apartamento '+f.un+' do '+nome:nome,msg=algum?'Olá! Sou '+f.nome+'. Fiz a simulação no site e quero falar sobre '+apt+' e os apartamentos do meu perfil.':'Olá! Sou '+f.nome+'. Fiz a simulação no site (interesse: '+apt+') e quero marcar uma entrevista pessoal para ajustar a compra do meu imóvel.';
h+=AVISO+'<div class="noprint"><a class="btn green" href="'+waLink(msg)+'">'+(algum?'Falar com o corretor no WhatsApp':'Quero a entrevista pessoal')+'</a> <button class="lite" onclick="window.print()">🖨 Imprimir</button> <a class="btn lite" href="/evolucao-obra/?emp='+esc(f.emp)+'">Refazer simulação</a></div>';
app.innerHTML=h;
if(parcelaEvo) ligaEvolucao(parcelaEvo);
app.addEventListener('click',function(e){var b=e.target.closest('[data-more]');if(b){document.getElementById(b.dataset.more).hidden=false;b.remove()}});
})();
