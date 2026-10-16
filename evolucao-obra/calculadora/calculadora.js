(function(){
var S=SIM,PL=PLANO,fm=C.fmt,esc=C.esc,app=document.getElementById('app'),wa=app.dataset.wa;
var f=C.get('simViva'),emp=C.Q.get('emp')||(f&&f.emp),un=C.Q.get('un')||(f&&f.un),tt=C.Q.get('t')||(f&&f.t),vv=C.Q.get('v')||(f&&f.v);
if(!f){location.replace('/evolucao-obra/dados/'+C.qs());return}
var p=S.perfil(f),ach=un&&DADOS.emp[emp]?S.acharUnidade(emp,un,tt,vv):null;
if(!ach||!PL.FLUXO[emp]){location.replace('/evolucao-obra/resultado/'+C.qs());return}
var u=ach.u,valor=u[3],nomeEmp=DADOS.emp[emp].nome,primeiro=esc(f.nome.split(' ')[0]);
var unNome=ach?String(ach.u[1]).replace(/ da (Torre|Bloco) [A-Za-z0-9]+$/,''):un;var uLabel=esc(unNome)+(tt?' (torre/bloco '+esc(String(tt).toUpperCase())+')':'');
var waLink=function(t){return 'https://wa.me/'+wa+'?text='+encodeURIComponent(t)};
var msgs={idade:'A idade informada não permite o financiamento.',prazo:'Pela idade, o prazo de financiamento ficaria muito curto.',renda_baixa:'Sua renda está abaixo das faixas desta simulação (a partir de R$ 5.000,01).',renda_alta:'Sua renda está acima do limite do Minha Casa Minha Vida (R$ 13.000,00).'};
if(p.erro){
  app.innerHTML='<h1>'+primeiro+', vamos conversar?</h1><div class="banner warn">'+msgs[p.erro]+'<br>Queremos uma entrevista pessoal com você: temos opções para reformular a forma de pagamento e viabilizar a compra do seu novo imóvel.</div><div class="noprint"><a class="btn green" href="'+waLink('Olá! Sou '+f.nome+'. Fiz a simulação no site ('+nomeEmp+', apartamento '+un+') e quero marcar uma entrevista pessoal.')+'">Quero a entrevista pessoal</a></div>';
  C.rodape();return;
}
var cap=S.capacidadeDe(p,u),finTeto=Math.min(Math.round(u[4]*0.8),cap.fin),N=PL.mesesObra(emp,new Date()).length,fx=PL.FLUXO[emp];
var Nmax=Math.min(N,41),posMax=fx.pos;
var temFgts=p.cotista&&p.fgts>0,stepFin=1;
var h='<h1>'+primeiro+', monte o pagamento do seu apartamento</h1><p class="sub">'+esc(nomeEmp)+' – apartamento '+uLabel+'. Ajuste cada item e veja ao lado quanto já está coberto do valor do imóvel.</p>';
h+='<div class="linha"><div class="card"><div class="lbl">Valor do imóvel</div><div class="val">'+fm(valor)+'</div><div class="note">Valor fixo.</div></div><div class="card"><div class="lbl">Prestação do financiamento</div><div class="val" id="v_prest"></div><div class="note">Muda se você escolher financiar um valor menor.</div></div></div>';
h+='<div class="linha"><div class="card"><div class="lbl">Financiamento Caixa</div><div class="val" id="v_fin"></div><input id="i_fin" type="range" min="0" max="'+finTeto+'" step="'+stepFin+'" value="'+finTeto+'"><div class="note">Máximo para o seu perfil: '+fm(finTeto)+'.</div></div><div class="card evo" id="e_fin"></div></div>';
if(temFgts) h+='<div class="linha"><div class="card"><div class="lbl">FGTS</div><div class="val" id="v_fgts"></div><label style="font-weight:500;margin:6px 0 0"><input id="i_fgts" type="checkbox" checked> Usar meu FGTS ('+fm(p.fgts)+') na entrega das chaves</label></div><div class="card evo" id="e_fgts"></div></div>';
h+='<div class="linha"><div class="card"><div class="lbl">Entrada (mínimo R$ 1.000,00)</div><input id="i_ato" type="text" inputmode="decimal" value="1.000,00"></div><div class="card evo" id="e_ato"></div></div>';
h+='<div class="linha"><div class="card"><div class="lbl">Parcelas mensais até a entrega</div><div class="val" id="v_men"></div><input id="i_nm" type="range" min="0" max="'+Nmax+'" value="'+Nmax+'"><div class="note">As mensais se acertam sozinhas para fechar o valor do imóvel. Durante a obra, o valor das parcelas é atualizado pelo CUB.</div></div><div class="card evo" id="e_men"></div></div>';
h+='<div class="linha"><div class="card"><div class="lbl">Reforços</div><div class="opt" style="margin-top:6px"><input type="radio" name="rf" id="r0" value="0" checked><label for="r0">Sem reforços</label><input type="radio" name="rf" id="rS" value="S"><label for="rS">6 semestrais</label><input type="radio" name="rf" id="rA" value="A"><label for="rA">3 anuais</label></div><div id="rbox" hidden style="margin-top:10px"><label for="i_vr">Valor de cada reforço (R$)</label><input id="i_vr" type="text" inputmode="decimal" value=""></div><div class="val" id="v_ref" style="margin-top:8px"></div></div><div class="card evo" id="e_ref"></div></div>';
h+='<div class="linha"><div class="card"><div class="lbl">Pós-chaves</div><div class="val" id="v_pos"></div><label style="font-weight:500;margin-top:8px">Percentual do valor do imóvel: <b id="t_pp"></b> (máx. 6%)</label><input id="i_pp" type="range" min="0" max="'+Math.round(valor*0.06)+'" step="1" value="'+Math.round(valor*0.06)+'"><label style="font-weight:500;margin-top:8px">Parcelas: <b id="t_pn"></b></label><input id="i_pn" type="range" min="1" max="'+posMax+'" value="'+posMax+'"><div class="note">Até '+posMax+' parcelas, corrigidas pelo IGP-M mais juros de 1%.</div></div><div class="card evo" id="e_pos"></div></div>';
h+='<div id="fecho"></div>';
h+='<div class="card"><h3>Obra e prestação</h3><details><summary>Evolução da obra, mês a mês (até as chaves)</summary><div id="d_evo"></div></details><details><summary>Depois das chaves, mês a mês</summary><div id="d_pos"></div></details><p class="note">Durante a obra você paga à Caixa a evolução (percentual da obra × prestação) junto com as mensais. Evolução linear, apenas como estimativa. Durante a obra, o valor das parcelas é atualizado pelo CUB.</p></div>';
h+='<div class="card noprint"><h3>Quer receber esta simulação por e-mail ou WhatsApp?</h3><p class="note" style="margin:4px 0 10px">Escolha como prefere receber — enviamos para você e para o corretor.</p><div class="opt" style="margin:0 0 12px"><input type="radio" name="canal" id="cE" value="email" checked><label for="cE">Por e-mail</label><input type="radio" name="canal" id="cW" value="whats"><label for="cW">Por WhatsApp</label></div><div class="g2"><div class="row" id="row_mail"><label for="i_mail">Seu e-mail</label><input id="i_mail" type="email" placeholder="voce@email.com"></div><div style="align-self:end"><button id="b_mail" type="button" style="width:100%;margin:0 0 16px">Enviar a simulação</button></div></div><p id="m_ok" class="note"></p></div>';
h+='<div class="card noprint" style="border-color:#c9a227"><h3>Pronto para o próximo passo?</h3><p style="margin:4px 0 0">Envie seus documentos e começamos agora o processo de financiamento do seu apartamento.</p><a class="btn green" id="a_doc" href="#">Enviar meus documentos</a></div>';
h+='<div class="card noprint"><h3>Fale com um corretor</h3><p>Não entendeu como funciona a entrada parcelada, o financiamento pela Caixa ou o Minha Casa Minha Vida? Converse com um corretor: a gente explica cada passo com calma e monta a condição ideal pro seu bolso, sem compromisso.</p></div>';h+='<div class="noprint"><a class="btn green" id="a_wa" href="#">Falar com o corretor no WhatsApp</a> <button class="lite" onclick="window.print()">🖨 Imprimir tudo</button></div>';
app.innerHTML=h;
parValor('i_fin');parValor('i_pp');
var g=function(i){return document.getElementById(i)};
g('a_doc').href='/evolucao-obra/documentos/'+C.qs();
g('a_wa').href=waLink('Olá! Sou '+f.nome+'. Fiz a simulação no site e quero falar sobre o apartamento '+un+' do '+nomeEmp+'.');
var plano=null;
function opts(){var r=document.querySelector('[name=rf]:checked').value;return {ato:Math.max(1000,C.num(g('i_ato').value)),nMensais:+g('i_nm').value,freq:r,nRef:r==='S'?6:r==='A'?3:0,vRef:C.num(g('i_vr').value),posPct:+g('i_pp').value/valor*100,posN:+g('i_pn').value,usarFgts:!!(g('i_fgts')&&g('i_fgts').checked),fin:+g('i_fin').value}}
function evo(id,cum,total){
  var falta=Math.round((valor-cum)*100)/100,pct=Math.max(0,Math.min(100,cum/valor*100)),b=g(id),cheio=Math.abs(falta)<1;
  b.className='card evo'+(cheio?' cheio':'');
  b.innerHTML='<div class="lbl">Evolução do pagamento</div><div class="bar"><i style="width:'+pct.toFixed(1)+'%"></i></div>'+(cheio?'<b class="p">100% do valor do imóvel</b>':'<div>Coberto: <b>'+fm(cum)+'</b> ('+pct.toFixed(1).replace('.',',')+'%)</div><div>Falta: <b>'+fm(Math.max(0,falta))+'</b></div>'+(falta<0?'<div class="obs">Observação: passou do valor do imóvel em '+fm(-falta)+'.</div>':''));
}
function render(){
  var r=document.querySelector('[name=rf]:checked').value;
  var cnt=PL.mesesObra(emp,new Date()).filter(function(x){return r==='A'?x.m===12:(x.m===6||x.m===12)}).length;
  g('rbox').hidden=r==='0';
  if(r!=='0'&&!g('i_vr').dataset.t){}
  var o=opts();
  if(r!=='0'&&(!g('i_vr').value||g('i_vr').dataset.r!==r)){g('i_vr').dataset.r=r;g('i_vr').value=String(Math.round(valor*(r==='A'?0.02:0.01))).replace(/\B(?=(\d{3})+$)/g,'.')+',00';o.vRef=C.num(g('i_vr').value)}
  var pl=PL.calcula(p,u,emp,o);plano=pl;
  g('v_prest').textContent=fm(pl.prestacao);g('v_fin').textContent=fm(pl.fin);
  if(g('v_fgts')){g('v_fgts').textContent=fm(pl.fgts)}
  g('v_men').textContent=pl.nMensais+' meses de '+fm(pl.mensal);
  g('v_ref').textContent=pl.reforcos?pl.reforcos+' de '+fm(pl.vRef):'';
  g('v_pos').textContent=pl.posN+' de '+fm(pl.pos/pl.posN);
  g('t_pp').textContent=(g('i_pp').value/valor*100).toFixed(1).replace('.',',')+'%';g('t_pn').textContent=g('i_pn').value;
  var c=pl.fin;evo('e_fin',c);
  if(g('e_fgts')){c+=pl.fgts;evo('e_fgts',c)}
  c+=pl.ato;evo('e_ato',c);c+=pl.mensal*pl.nMensais;evo('e_men',c);c+=pl.totRef;evo('e_ref',c);c+=pl.pos;evo('e_pos',c);
  var falta=Math.round((valor-c)*100)/100;
  g('fecho').innerHTML=Math.abs(falta)<1?'<div class="banner ok"><b>100% do valor do imóvel</b> coberto por este plano.</div>':'<div class="banner warn"><b>Observação:</b> '+(falta>0?'ainda faltam '+fm(falta)+' para completar o valor do imóvel. Ajuste as mensais, os reforços ou o pós-chaves.':'o plano passa do valor do imóvel em '+fm(-falta)+'. Reduza a entrada, os reforços ou o pós-chaves.')+'</div>';
  var tr=function(a){return '<tr><td>'+a.join('</td><td>')+'</td></tr>'};
  g('d_evo').innerHTML='<p class="note">Prestação do financiamento: '+fm(pl.prestacao)+'. 1ª parcela da evolução: <b>'+fm(pl.rows[0].evolucao)+'</b> · última: <b>'+fm(pl.rows[pl.rows.length-1].evolucao)+'</b>.</p><div class="tw"><table><thead><tr><th>Mês</th><th>% da obra</th><th>Evolução (Caixa)</th><th>Mensal</th><th>Reforço</th><th>Total do mês</th></tr></thead><tbody>'+pl.rows.map(function(x,i){return '<tr'+(i==0||i==pl.rows.length-1?' class="hl"':'')+'><td>'+x.mes+'</td><td>'+(x.pct*100).toFixed(1).replace('.',',')+'%</td><td>'+fm(x.evolucao)+'</td><td>'+fm(x.mensal)+'</td><td>'+(x.reforco?fm(x.reforco):'-')+'</td><td>'+fm(x.total)+'</td></tr>'}).join('')+'</tbody></table></div>';
  g('d_pos').innerHTML='<div class="tw"><table><thead><tr><th>Mês</th><th>Prestação Caixa</th><th>Pós-chaves</th><th>Total do mês</th></tr></thead><tbody>'+pl.posRows.map(function(x){return tr([x.mes,fm(x.prestacao),fm(x.pos),fm(x.total)])}).join('')+'</tbody></table></div><p class="note">Pós-chaves corrigido pelo IGP-M mais juros de 1%.</p>';
}
['i_fin','i_fgts','i_ato','i_nm','i_vr','i_pp','i_pn'].forEach(function(i){var e=g(i);if(e){e.addEventListener('input',render);e.addEventListener('change',render)}});
[].forEach.call(document.querySelectorAll('[name=rf]'),function(e){e.addEventListener('change',render)});
window.addEventListener('beforeprint',function(){[].forEach.call(document.querySelectorAll('details'),function(d){d.open=true})});
render();
function texto(){return ['Cliente: '+f.nome,'WhatsApp: '+f.fone,'Idade: '+p.idade+' anos','Renda bruta familiar: '+fm(f.renda),'36 meses de FGTS: '+(f.cotista?'Sim':'Não'),'FGTS: '+(f.fgts?fm(f.fgts):'Não tem'),'Empreendimento: '+nomeEmp,'Apartamento: '+un+(tt?' ('+String(tt).toUpperCase()+')':'')+' - '+fm(valor),'',PL.texto(plano)].join('\n')}
g('b_mail').addEventListener('click',function(){
  var em=g('i_mail').value.trim();
  var canal=(document.querySelector('[name=canal]:checked')||{}).value||'email';
  if(canal==='email'){
    if(!/^\S+@\S+\.\S+$/.test(em)){g('m_ok').textContent='Digite um e-mail válido (ou escolha WhatsApp).';return}
    C.enviar('Simulação MCMV - '+f.nome,{Nome:f.nome,Email:em,WhatsApp:f.fone,Nascimento:f.nasc,Canal:'E-mail',Simulacao:texto(),_copia_cliente:'sim'});
    g('m_ok').textContent='Pronto! Enviamos a simulação para '+em+' e para o corretor. Se não encontrar, olhe também a caixa de spam. Se quiser, já pode enviar seus documentos aqui embaixo.';try{g('a_doc').scrollIntoView({behavior:'smooth',block:'center'})}catch(e){}
  }else{
    C.enviar('Simulação MCMV (WhatsApp) - '+f.nome,{Nome:f.nome,Email:em,WhatsApp:f.fone,Nascimento:f.nasc,Canal:'WhatsApp',Simulacao:texto()});
    try{window.open('https://wa.me/'+wa+'?text='+encodeURIComponent('Olá! Sou '+f.nome+'. Esta é a minha simulação do '+nomeEmp+' ('+un+'):\n\n'+texto()),'_blank')}catch(e){}
    g('m_ok').textContent='Abrimos o WhatsApp com a sua simulação — é só tocar em enviar. Uma cópia também vai para o corretor. Se quiser, já pode enviar seus documentos aqui embaixo.';try{g('a_doc').scrollIntoView({behavior:'smooth',block:'center'})}catch(e){}
  }
});
[].forEach.call(document.querySelectorAll('[name=canal]'),function(x){x.addEventListener('change',function(){g('row_mail').style.display=(document.querySelector('[name=canal]:checked').value==='whats')?'none':'';})});
var sig='calc|'+f.nome+'|'+f.fone+'|'+un+'|'+emp;
if(C.get('simEnvCalc')!==sig){C.set('simEnvCalc',sig);C.enviar('Nova simulação MCMV - '+f.nome,{Nome:f.nome,WhatsApp:f.fone,Nascimento:f.nasc,Simulacao:texto()})}
C.rodape();
})();
