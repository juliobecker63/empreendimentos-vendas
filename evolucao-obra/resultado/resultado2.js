(function(){
var S=SIM,PL=PLANO,app=document.getElementById('app'),wa=app.dataset.wa,esc=function(t){return String(t).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
var f=null;try{f=JSON.parse(sessionStorage.getItem('simViva'))}catch(e){}
if(!f){app.innerHTML='<h1>Preencha a simulação primeiro</h1><p class="sub">Não encontramos seus dados.</p><a class="btn" href="/evolucao-obra/">Fazer a simulação</a>';return}
var p=S.perfil(f),primeiro=esc(f.nome.split(' ')[0]),all=S.todos(p),sel=all.filter(function(r){return r.key===f.emp})[0],outros=all.filter(function(r){return r.key!==f.emp});
var qtd=function(r){return r?r.cabe.length:0},algum=all.some(function(r){return qtd(r)>0});
var msgs={idade:'A idade informada não permite o financiamento.',prazo:'Pela idade, o prazo de financiamento ficaria muito curto.',renda_baixa:'Sua renda está abaixo das faixas desta simulação (a partir de R$ 5.000,01).',renda_alta:'Sua renda está acima do limite do Minha Casa Minha Vida (R$ 13.000,00).'};
var waLink=function(t){return 'https://wa.me/'+wa+'?text='+encodeURIComponent(t)},pc=function(x){return (x*100).toFixed(2).replace('.',',')+'% a.a.'};
var porValor=function(a,b){return a.u[3]-b.u[3]};
var curto=function(u){return esc(u[1].replace(/ da (Torre|Bloco) [A-Za-z0-9]+$/,''))};
var num=function(v){return parseFloat(String(v).replace(/\./g,'').replace(',','.'))||0};
function linha(x,k){
  return '<tr><td>'+curto(x.u)+(x.u[0]?' <small class="bl">'+esc(x.u[0])+'</small>':'')+'</td><td>'+(x.u[2]?x.u[2].toFixed(2).replace('.',',')+' m²':'-')+'</td><td>'+S.fmt(x.u[3])+'</td><td>'+S.fmt(x.a.fin)+'</td><td>'+(k==='viva_urban'?'':'<a href="/evolucao-obra/calculadora/?emp='+k+'&un='+encodeURIComponent(S.paramsUnidade(x.u).un)+'&t='+encodeURIComponent(S.paramsUnidade(x.u).t)+'">Simular</a>')+'</td></tr>';
}
function tabela(r){
  var rows=r.cabe.slice().sort(porValor),LIM=10,id='t'+r.key;
  var h='<div class="tw"><table><thead><tr><th>Apartamento</th><th>Área</th><th>Valor</th><th>Financiamento</th><th></th></tr></thead><tbody>'+rows.slice(0,LIM).map(function(x){return linha(x,r.key)}).join('')+'</tbody>';
  if(rows.length>LIM) h+='<tbody id="'+id+'" hidden>'+rows.slice(LIM).map(function(x){return linha(x,r.key)}).join('')+'</tbody>';
  h+='</table></div>';
  if(rows.length>LIM) h+='<button class="lite noprint" data-more="'+id+'">Mostrar todos os '+rows.length+' apartamentos</button>';
  return h;
}
function bloco(r){var n=qtd(r);return '<div class="card emp"><h3>'+esc(r.nome)+'<span>'+n+' apartamento'+(n>1?'s':'')+' no seu perfil</span></h3>'+tabela(r)+'</div>'}

var nome=DADOS.emp[f.emp]?DADOS.emp[f.emp].nome:(f.emp==='viva_urban'?'Viva Urban':'(simulação geral)'),h='<h1>'+primeiro+', este é o seu resultado</h1><p class="sub">Simulação preliminar do Minha Casa Minha Vida.</p>';
var ach=f.un&&sel?S.acharUnidade(f.emp,f.un,f.t,f.v):null,uLabel=f.un?esc(f.un)+(f.t?' (torre/bloco '+esc(f.t.toUpperCase())+')':''):'';
var alvo=null,alvoTxt='',fit=sel?sel.cabe.slice().sort(porValor):[];
if(p.erro){
  h+='<div class="banner warn">'+msgs[p.erro]+'<br>Queremos conversar com você pessoalmente: temos opções para reformular a forma de pagamento e tentar viabilizar a compra do seu novo imóvel.</div>';
}else{
  h+='<div class="card"><b>Seu financiamento estimado</b><p class="sub" style="margin:4px 0 8px">Renda familiar de '+S.fmt(f.renda)+' (parcela até 30% da renda). A faixa muda conforme o valor do imóvel.</p><div class="tw"><table><thead><tr><th>Valor do imóvel</th><th>Faixa</th><th>Financiamento estimado</th><th>Juros</th></tr></thead><tbody>'+S.cenarios(p).map(function(c){var k=p.cotista?c.com:c.sem;return '<tr><td>'+c.rotulo+'</td><td>Faixa '+c.faixa+'</td><td><b>'+S.fmt(k.fin)+'</b></td><td>'+pc(k.taxa)+'</td></tr>'}).join('')+'</tbody></table></div><p class="note" style="margin-top:8px">Calculado '+(p.cotista?'com redutor (36 meses ou mais de FGTS)':'sem redutor (menos de 36 meses de FGTS)')+'.'+(f.fgtsInformado?(p.cotista?' FGTS informado: '+S.fmt(f.fgtsInformado)+', que pode ajudar na entrega das chaves.':' O FGTS só pode ser usado na compra com 36 meses ou mais de contribuição, por isso não foi considerado.'):'')+'</p></div>';
  if(ach){
    var u=ach.u,a=S.avalia(p,u);
    h+='<div class="card"><b>Apartamento solicitado</b><p style="margin-top:4px">'+esc(sel.nome)+' – apartamento '+uLabel+' – '+S.fmt(u[3])+(ach.estimado?' <small class="bl">(valor de avaliação estimado)</small>':'')+'</p></div>';
    alvo=u;alvoTxt='apartamento '+uLabel;
    if(a&&a.st==='cabe'){
      h+='<div class="banner ok">Boa notícia! O apartamento <b>'+uLabel+'</b> do <b>'+esc(sel.nome)+'</b> cabe no seu financiamento.'+' O restante, '+S.fmt(a.entrada)+', é pago à construtora (ato, mensais e pós-chaves): ajuste abaixo.</div>';
    }else{
      if(fit.length){var m=fit[0];h+='<div class="banner ok"><b>Opção no mesmo empreendimento:</b> o apartamento de menor valor que você consegue financiar no '+esc(sel.nome)+' é o <b>'+curto(m.u)+'</b> ('+esc(m.u[0])+'), de '+S.fmt(m.u[3])+'. Veja abaixo as opções.</div>'}
      h+='<div class="alt"><b>Podemos ajustar a compra do apartamento que você escolheu.</b> A construtora permite pagar a parte que o financiamento não cobre em ato, mensais, reforços e pós-chaves. O plano abaixo mostra como ficaria; ajuste e fale com o corretor.</div>';
    }
  }else if(f.un&&sel){h+='<div class="card"><b>Apartamento solicitado</b><p style="margin-top:4px">'+esc(sel.nome)+' – apartamento '+uLabel+' (valor sob consulta). Veja abaixo o que cabe no seu perfil.</p></div>'}
  if(!ach&&sel&&fit.length){alvo=fit[0].u;alvoTxt='apartamento '+curto(fit[0].u)+' ('+esc(fit[0].u[0])+'), o de menor valor que cabe no seu perfil'}
  if(!algum) h+='<div class="banner warn"><b>Ainda não encontramos um apartamento que caiba direto no seu perfil.</b><br>Mas isso tem solução: queremos uma <b>entrevista pessoal</b> com você, porque temos algumas opções de reformular as formas de pagamento e tentar conseguir a aquisição do seu novo imóvel.</div>';
  else if(!ach){
    if(qtd(sel)) h+='<div class="banner ok">Boa notícia! No <b>'+esc(sel.nome)+'</b> você se encaixa em <b>'+qtd(sel)+'</b> apartamento'+(qtd(sel)>1?'s':'')+'.</div>';
    else if(sel) h+='<div class="banner warn">No <b>'+esc(sel.nome)+'</b> ainda não encontramos apartamento que caiba direto no seu perfil — mas veja as opções abaixo em outros empreendimentos.</div>';
  }
  if(sel&&f.emp==='viva_urban') h+='<div class="card"><b>Viva Urban</b><p style="margin-top:4px">Valores de referência de lançamento (a partir de): 2 dormitórios R$ 389.000 e 2 dormitórios com suíte R$ 464.000. A tabela completa das unidades será divulgada no lançamento, previsto para o fim do mês; fale com o corretor.</p></div>';
  if(alvo&&PL.FLUXO[f.emp]) h+='<div id="plano"></div>';
  h+='<div class="card"><b>Despesas de financiamento e registro</b><p style="margin-top:6px">As despesas de financiamento e de registro do imóvel podem ser pagas pela construtora no dia da assinatura do financiamento junto à Caixa, e você pode pagar essa quantia à construtora <b>parcelada em até 24 vezes</b>.</p>'+(sel&&S.promoDespesas(f.emp)?'<p style="margin-top:8px;background:#e4f5ec;color:#0f5c38;border-radius:8px;padding:8px 12px"><b>Promoção neste empreendimento:</b> a construtora paga essas despesas para você.</p>':'<p class="note">Em algumas campanhas a construtora paga essas despesas. O corretor avisa em quais empreendimentos isso acontece.</p>')+'</div>';
  if(qtd(sel)&&!ach) h+='<h2>Empreendimento que você escolheu</h2>'+bloco(sel);
  else if(qtd(sel)) h+='<h2>Outros apartamentos que cabem no '+esc(sel.nome)+'</h2>'+bloco(sel);
  var op=outros.filter(function(r){return qtd(r)>0});
  if(op.length) h+='<h2>'+(qtd(sel)?'Outros empreendimentos que você também pode escolher':'Opções para você')+'</h2>'+op.map(bloco).join('');
  h+='<p class="note">Financiamento = cota de 80% da avaliação, limitada ao seu perfil.</p>';
}
var apt=f.un?'o apartamento '+f.un+' do '+nome:nome,msg=algum?'Olá! Sou '+f.nome+'. Fiz a simulação no site e quero falar sobre '+apt+' e os apartamentos do meu perfil.':'Olá! Sou '+f.nome+'. Fiz a simulação no site (interesse: '+apt+') e quero marcar uma entrevista pessoal para ajustar a compra do meu imóvel.';
h+='<div class="noprint"><a class="btn green" href="'+waLink(msg)+'">'+(algum?'Falar com o corretor no WhatsApp':'Quero a entrevista pessoal')+'</a> <button class="lite" onclick="window.print()">🖨 Imprimir tudo</button> <a class="btn lite" href="/evolucao-obra/?emp='+esc(f.emp)+'">Refazer simulação</a></div>';
app.innerHTML=h;
app.addEventListener('click',function(e){var b=e.target.closest('[data-more]');if(b){document.getElementById(b.dataset.more).hidden=false;b.remove()}});

// ---------- e-mail ao corretor (Edge Function enviar-contato) ----------
var planoAtual=null;
function resumoTexto(){
  var L=['Empreendimento de interesse: '+nome,'Apartamento solicitado: '+(f.un?f.un+(f.t?' (bloco/torre '+f.t.toUpperCase()+')':'')+(f.v?' - '+S.fmt(f.v):''):'nenhum (simulação geral)'),'Renda bruta familiar: '+S.fmt(f.renda),'36 meses de FGTS: '+(f.cotista?'Sim':'Não'),'FGTS informado: '+(f.fgtsInformado?S.fmt(f.fgtsInformado):'Não tem')];
  if(p.erro) L.push('Resultado: fora do enquadramento ('+p.erro+') - chamar para entrevista pessoal');
  else{L.push('Idade: '+p.idade+' anos');S.cenarios(p).forEach(function(c){L.push(c.rotulo+' (Faixa '+c.faixa+'): sem redutor '+S.fmt(c.sem.fin)+' | com redutor '+S.fmt(c.com.fin))});
    L.push('Apartamentos no perfil: '+all.map(function(r){return r.nome+' '+qtd(r)}).join(' | '));
    if(!algum) L.push('Resultado: NENHUM apartamento - chamar para entrevista pessoal')}
  if(planoAtual) L.push('','Plano para o '+alvoTxt.replace(/<[^>]*>/g,''),PL.texto(planoAtual));
  return L.join('\n');
}
function enviar(assunto){
  try{var b=new URLSearchParams({_subject:assunto+' - '+f.nome,_captcha:'false',_honey:'',Nome:f.nome,Nascimento:f.nasc,WhatsApp:f.fone||'(não informado)',Simulacao:resumoTexto()});
    navigator.sendBeacon('https://ljxijsfumxrstixkimyg.supabase.co/functions/v1/enviar-contato',b)}catch(e){}
}

window.addEventListener('beforeprint',function(){[].forEach.call(document.querySelectorAll('details'),function(d){d.open=true})});
// ---------- plano de pagamento ----------
if(alvo&&PL.FLUXO[f.emp]){
  var box=document.getElementById('plano'),fx=PL.FLUXO[f.emp],N=PL.mesesObra(f.emp,new Date()).length,valor=alvo[3];
  var padRef=Math.round(valor*0.02);
  box.innerHTML='<div class="card"><b>Monte o pagamento do '+alvoTxt+'</b><p class="sub" style="margin:4px 0 10px">Valor do imóvel: '+S.fmt(valor)+'. O financiamento da Caixa entra na entrega das chaves; o resto é pago à construtora. Ajuste ato, mensais, reforços e pós-chaves: as mensais se acertam sozinhas para fechar o valor do imóvel.</p>'+
   '<div class="ctl"><label>Ato (assinatura), R$</label><input id="pl_ato" type="text" inputmode="decimal" value="1.000,00"></div>'+
   '<div class="ctl"><label>Mensais até a entrega: <b id="pl_nm_v"></b></label><input id="pl_nm" type="range" min="1" max="'+N+'" value="'+N+'"></div>'+
   '<div class="ctl"><label>Reforços</label><select id="pl_fr"><option value="0">Sem reforços</option><option value="S">Semestrais (jun e dez)</option><option value="A">Anuais (dezembro)</option></select></div>'+
   '<div id="pl_refbox" hidden><div class="ctl"><label>Quantidade de reforços: <b id="pl_nr_v"></b></label><input id="pl_nr" type="range" min="1" max="1" value="1"></div><div class="ctl"><label>Valor de cada reforço, R$</label><input id="pl_vr" type="text" inputmode="decimal" value="'+String(padRef).replace(/\B(?=(\d{3})+$)/g,'.')+',00"></div></div>'+
   '<div class="ctl"><label>Pós-chaves: <b id="pl_pp_v"></b>% do valor do imóvel (máx. 6%)</label><input id="pl_pp" type="range" min="0" max="'+Math.round(alvo[3]*0.06)+'" step="1" value="'+Math.round(alvo[3]*0.06)+'"></div>'+
   '<div class="ctl"><label>Parcelas pós-chaves: <b id="pl_pn_v"></b></label><input id="pl_pn" type="range" min="1" max="24" value="24"><p class="note" style="margin:4px 0 0">Máximo de 24 parcelas, corrigidas pelo IGP-M mais juros de 1%.</p></div>'+
   ((p.cotista&&p.fgts>0)?'<div class="ctl"><label><input id="pl_fg" type="checkbox" checked> Usar meu FGTS ('+S.fmt(p.fgts)+') na entrega das chaves</label></div>':'')+
   '<div id="pl_out"></div><div class="noprint"><button id="pl_mail" class="lite">✉ Enviar este plano ao corretor por e-mail</button> <span id="pl_ok" class="note"></span></div></div><div id="pl_fin"></div><div id="pl_evo"></div><div id="pl_pos"></div>';
  var g=function(i){return document.getElementById(i)};
  function opts(){var fr=g('pl_fr').value;return {ato:num(g('pl_ato').value),nMensais:+g('pl_nm').value,freq:fr,nRef:fr==='0'?0:+g('pl_nr').value,vRef:num(g('pl_vr').value),posPct:+g('pl_pp').value/alvo[3]*100,posN:+g('pl_pn').value,usarFgts:!!(g('pl_fg')&&g('pl_fg').checked)}}
  function render(){
    var fr=g('pl_fr').value,nObra=PL.mesesObra(f.emp,new Date()).filter(function(x){return fr==='A'?x.m===12:fr==='S'?(x.m===6||x.m===12):false}).length;
    g('pl_refbox').hidden=fr==='0';var nr=g('pl_nr');nr.max=Math.max(1,nObra);if(+nr.value>nObra)nr.value=Math.max(1,nObra);
    g('pl_nm_v').textContent=g('pl_nm').value;g('pl_nr_v').textContent=nr.value;g('pl_pp_v').textContent=(g('pl_pp').value/alvo[3]*100).toFixed(1).replace('.',',');g('pl_pn_v').textContent=g('pl_pn').value;
    var pl=PL.calcula(p,alvo,f.emp,opts());planoAtual=pl;var fm=S.fmt;g('pl_pn_v').textContent=g('pl_pn').value+' de '+fm(pl.pos/pl.posN);g('pl_nm_v').textContent=g('pl_nm').value+' meses de '+fm(pl.mensal);
    var alerta='';
    if(pl.excede) alerta+='<div class="banner warn" style="font-size:15px">Os valores escolhidos passam do valor do imóvel em '+fm(-pl.restante)+'. Reduza o ato, os reforços ou o pós-chaves.</div>';
    else if(pl.mensal<0) alerta+='';
    if(pl.maxMensal>p.parcelaMax) alerta+='<div class="aviso">No mês mais pesado da obra você paga '+fm(pl.maxMensal)+' (evolução da obra + mensal + reforço), acima de 30% da sua renda ('+fm(p.parcelaMax)+'). Aumente as mensais ou o pós-chaves para aliviar.</div>';
    if(pl.limitado) alerta+='<div class="aviso">O financiamento da Caixa para o seu perfil é '+fm(pl.fin)+' (a cota seria '+fm(pl.finMax)+'); a diferença já está dentro das mensais e reforços.</div>';
    var tr=function(a,b,c,d){return '<tr><td>'+a+'</td><td>'+b+'</td><td>'+c+'</td><td>'+d+'</td></tr>'};
    var pct=function(v){return (v/pl.valor*100).toFixed(1).replace('.',',')+'%'};
    var resumo='<div class="tw"><table><thead><tr><th>Série</th><th>Parcelas</th><th>Valor da parcela</th><th>Total (% do imóvel)</th></tr></thead><tbody>'+
      tr('Ato (assinatura)',1,fm(pl.ato),fm(pl.ato)+' ('+pct(pl.ato)+')')+
      tr('Mensais ('+pl.inicio+' em diante)',pl.nMensais,fm(pl.mensal),fm(pl.mensal*pl.nMensais)+' ('+pct(pl.mensal*pl.nMensais)+')')+
      (pl.reforcos?tr('Reforços',pl.reforcos,fm(pl.vRef),fm(pl.totRef)+' ('+pct(pl.totRef)+')'):'')+
      (pl.fgts?tr('FGTS na entrega ('+pl.chaves+')',1,fm(pl.fgts),fm(pl.fgts)+' ('+pct(pl.fgts)+')'):'')+
      tr('Financiamento Caixa',1,fm(pl.fin),fm(pl.fin)+' ('+pct(pl.fin)+')')+
      tr('Pós-chaves',pl.posN,fm(pl.pos/pl.posN),fm(pl.pos)+' ('+pct(pl.pos)+')')+
      '</tbody></table></div>';
    var cap=S.capacidadeDe(p,alvo);var cards='<h3 style="margin:0 0 4px;font-size:18px">2. Financiamento da Caixa</h3><p class="note" style="margin:0 0 6px">Pago a partir das chaves ('+pl.chaves+'), em até '+p.prazo+' meses.</p><div class="res"><div><small>Valor financiado</small><b>'+fm(pl.fin)+'</b></div><div><small>Prestação do financiamento</small><b>'+fm(pl.prestacao)+'</b></div></div><p class="note">Taxa de juros: '+pc(cap.taxa)+'. Estimativa; a prestação real é definida pela Caixa.</p>';
    var evo='<h3 style="margin:0 0 4px;font-size:18px">3. Evolução da obra (até as chaves)</h3><p class="note" style="margin:0 0 6px">Durante a obra você paga à Caixa a evolução (percentual da obra × prestação de '+fm(pl.prestacao)+') junto com a mensal da construtora (durante a obra, o valor das parcelas é atualizado pelo CUB). 1ª parcela da evolução: <b>'+fm(pl.rows[0].evolucao)+'</b> · última: <b>'+fm(pl.rows[pl.rows.length-1].evolucao)+'</b>.</p><details><summary>Ver mês a mês</summary><div class="tw"><table><thead><tr><th>Mês</th><th>% da obra</th><th>Evolução (Caixa)</th><th>Mensal</th><th>Reforço</th><th>Total do mês</th></tr></thead><tbody>'+
      pl.rows.map(function(r,i){return '<tr'+(i==0||i==pl.rows.length-1?' class="hl"':'')+'><td>'+r.mes+'</td><td>'+(r.pct*100).toFixed(1).replace('.',',')+'%</td><td>'+fm(r.evolucao)+'</td><td>'+fm(r.mensal)+'</td><td>'+(r.reforco?fm(r.reforco):'-')+'</td><td>'+fm(r.total)+'</td></tr>'}).join('')+'</tbody></table></div></details>';
    var pos='<h3 style="margin:0 0 4px;font-size:18px">4. Depois das chaves</h3><p class="note" style="margin:0 0 6px">Prestação da Caixa + parcela do pós-chaves (as parcelas do pós-chaves serão corrigidas pelo IGP-M mais juros de 1%).</p><details><summary>Ver mês a mês</summary><div class="tw"><table><thead><tr><th>Mês</th><th>Prestação Caixa</th><th>Pós-chaves</th><th>Total do mês</th></tr></thead><tbody>'+
      pl.posRows.map(function(r){return '<tr><td>'+r.mes+'</td><td>'+fm(r.prestacao)+'</td><td>'+fm(r.pos)+'</td><td>'+fm(r.total)+'</td></tr>'}).join('')+'</tbody></table></div></details>';
    g('pl_out').innerHTML=alerta+'<h3 style="margin:12px 0 4px;font-size:18px">1. Pagamento da compra à construtora</h3>'+resumo;g('pl_fin').innerHTML='<div class="card">'+cards+'</div>';g('pl_evo').innerHTML='<div class="card">'+evo+'</div>';g('pl_pos').innerHTML='<div class="card">'+pos+'</div>';
  }
  parValor('pl_pp');
  ['pl_ato','pl_nm','pl_fr','pl_nr','pl_vr','pl_pp','pl_pn','pl_fg'].forEach(function(i){var e=g(i);if(e){e.addEventListener('input',render);e.addEventListener('change',render)}});
  g('pl_mail').addEventListener('click',function(){enviar('Plano ajustado - simulação MCMV');g('pl_ok').textContent='Plano enviado ao corretor.'});
  render();
}
// envio automatico (1x por simulação) com todo o material
var sig='env|'+f.nome+'|'+f.fone+'|'+f.un+'|'+f.emp+'|'+f.renda;
try{if(sessionStorage.getItem('simEnv')!==sig){sessionStorage.setItem('simEnv',sig);enviar('Nova simulação MCMV')}}catch(e){enviar('Nova simulação MCMV')}
})();
