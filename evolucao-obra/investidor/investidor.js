(function(){
var S=SIM,fm=C.fmt,esc=C.esc,app=document.getElementById('app'),wa=app.dataset.wa,g=function(i){return document.getElementById(i)};
var MES=['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],r2=function(v){return Math.round(v*100)/100};
var emp=C.Q.get('emp'),un=C.Q.get('un'),tt=C.Q.get('t'),vv=C.Q.get('v');
var ach=(emp&&un&&DADOS.emp[emp])?S.acharUnidade(emp,un,tt,vv):null;
var alvo=ach?{emp:emp,u:ach.u}:null;
var empValid=emp&&DADOS.emp[emp];
function waLink(t){return 'https://wa.me/'+wa+'?text='+encodeURIComponent(t)}
var h='<h1>Calculadora do investidor</h1><p class="sub">Monte o seu plano em segundos, sem compromisso. Dê uma entrada e financie o restante direto com a construtora em 30 parcelas, com reforços anuais ou semestrais, ou escolha a condição aprovada pela construtora (10% + 40% até as chaves + 50% financiado no banco).</p>';
if(!alvo){
  if(empValid){
    h+='<div class="card"><h3>Escolha o modelo</h3><p class="note" style="margin:0 0 12px">Imóvel: <b>'+esc(DADOS.emp[emp].nome)+'</b></p><div id="modelos">'+modelosHTML(emp)+'</div></div>';
  } else {
  h+='<div class="card"><h3>Escolha o imóvel</h3><div class="row"><label for="s_emp">Empreendimento</label><select id="s_emp"><option value="">Selecione</option>'+Object.keys(DADOS.emp).map(function(k){return '<option value="'+k+'">'+esc(DADOS.emp[k].nome)+'</option>'}).join('')+'</select></div><div id="modelos"></div></div>';
  }
}
h+='<div id="calc"></div>';
app.innerHTML=h;
var mes0=(function(){var d=new Date(),m=d.getMonth()+1,y=d.getFullYear();return {m:m,y:y}})();
function rotulo(i){var m=mes0.m+i,y=mes0.y;while(m>12){m-=12;y++}return MES[m-1]+'/'+y}
var ctx=null;
function monta(e,u){
  ctx={emp:e,u:u};cbuilt=false;var valor=u[3],nomeE=DADOS.emp[e].nome;
  var c='<div class="linha"><div class="card"><div class="lbl">Valor do imóvel</div><div class="val">'+fm(valor)+'</div><div class="note">'+esc(nomeE)+' – apartamento '+esc(String(u[1]).replace(/ da (Torre|Bloco) [A-Za-z0-9]+$/,''))+' ('+esc(u[0])+'). Valor fixo.</div></div><div class="card"><div class="lbl">Financiamento direto com a construtora</div><div class="val">30 parcelas</div><div class="note">Entrada + 30 mensais + reforços opcionais.</div></div></div>';
  var fx=window.PLANO&&PLANO.FLUXO[e];
  c+='<div class="card"><div class="lbl">Como você quer pagar?</div><div class="opt" style="margin-top:6px"><input type="radio" name="md" id="mD" value="D" checked><label for="mD">Parcelamento direto (30 parcelas)</label>'+'<input type="radio" name="md" id="mC" value="C"><label for="mC">Condição da construtora</label>'+'</div><p class="note">Condição da construtora (sugestão: 10% de entrada, 40% em parcelas até as chaves'+(fx?' ('+PLANO.rotulo(fx)+')':'')+' e 50% financiado no banco). Ajuste abaixo como preferir.</p><div id="nbox" hidden><label>Meses até a entrega (previsão, a confirmar com a construtora): <b id="t_nc"></b></label><input id="i_nc" type="range" min="12" max="48" value="36"></div></div>';
  c+='<div class="aviso"><b>Atenção:</b> durante a obra, o valor das parcelas é atualizado pelo CUB.</div>';
  c+='<div id="modoC" hidden></div><div id="modoD">';
  c+='<div class="linha"><div class="card"><div class="lbl">Entrada</div><div class="val" id="v_ent"></div><input id="i_ent" type="range" min="'+Math.round(valor*0.1)+'" max="'+Math.round(valor*0.9)+'" step="1" value="'+Math.round(valor*0.1)+'"><div class="note">Percentual do valor do imóvel: <b id="t_ent"></b></div></div><div class="card evo" id="e_ent"></div></div>';
  c+='<div class="linha"><div class="card"><div class="lbl">Reforços</div><div class="opt" style="margin-top:6px"><input type="radio" name="rf" id="r0" value="0" checked><label for="r0">Sem reforços</label><input type="radio" name="rf" id="rS" value="S"><label for="rS">Semestrais</label><input type="radio" name="rf" id="rA" value="A"><label for="rA">Anuais</label></div><div id="rbox" hidden style="margin-top:10px"><label>Quantidade: <b id="t_nr"></b></label><input id="i_nr" type="range" min="1" max="5" value="1"><label for="i_vr" style="margin-top:8px">Valor de cada reforço (R$)</label><input id="i_vr" type="text" inputmode="decimal"></div><div class="val" id="v_ref" style="margin-top:8px"></div></div><div class="card evo" id="e_ref"></div></div>';
  c+='<div class="linha"><div class="card"><div class="lbl">Parcelas mensais</div><div class="val" id="v_men"></div><div class="note">30 parcelas, a partir do mês que vem. Acertam-se sozinhas para fechar o valor do imóvel.</div></div><div class="card evo" id="e_men"></div></div>';
  c+='<div id="fecho"></div><div class="card"><details><summary>Pagamento mês a mês</summary><div id="d_mes"></div></details></div></div>';
  c+='<div class="card noprint"><h3>Quer receber esta simulação por e-mail ou WhatsApp?</h3><p class="note" style="margin:4px 0 10px">Escolha como prefere receber — enviamos para você e para o corretor.</p><div class="opt" style="margin:0 0 12px"><input type="radio" name="canal" id="cE" value="email" checked><label for="cE">Por e-mail</label><input type="radio" name="canal" id="cW" value="whats"><label for="cW">Por WhatsApp</label></div><div class="g2"><div class="row"><label for="i_nome">Seu nome</label><input id="i_nome" type="text"></div><div class="row"><label for="i_fone">WhatsApp com DDD</label><input id="i_fone" type="tel" inputmode="tel"></div></div><div class="g2"><div class="row" id="row_mail"><label for="i_mail">Seu e-mail</label><input id="i_mail" type="email"></div><div style="align-self:end"><button id="b_mail" type="button" style="width:100%;margin:0 0 16px">Enviar a simulação</button></div></div><p id="m_ok" class="note"></p></div>';
  c+='<div class="card noprint" style="border-color:#c9a227"><h3>Pronto para o próximo passo?</h3><p style="margin:4px 0 0">Envie seus documentos e começamos agora o processo de COMPRA do seu apartamento.</p><a class="btn green" id="a_doc" href="#">Enviar meus documentos</a></div>';
  c+='<div class="noprint"><a class="btn green" id="a_wa" href="#">Falar com o corretor no WhatsApp</a> <button class="lite" onclick="window.print()">🖨 Imprimir tudo</button></div>';
  g('calc').innerHTML=c;
  parValor('i_ent');
  ['i_ent','i_nr','i_vr'].forEach(function(i){g(i).addEventListener('input',render)});
  g('i_nc').addEventListener('input',render);
  [].forEach.call(document.querySelectorAll('[name=rf],[name=md]'),function(x){x.addEventListener('change',render)});
  window.addEventListener('beforeprint',function(){[].forEach.call(document.querySelectorAll('details'),function(d){d.open=true})});
  g('b_mail').addEventListener('click',enviar);[].forEach.call(document.querySelectorAll('[name=canal]'),function(x){x.addEventListener('change',function(){g('row_mail').style.display=(document.querySelector('[name=canal]:checked').value==='whats')?'none':'';})});
  render();
}
function plano(){
  var u=ctx.u,valor=u[3],r=document.querySelector('[name=rf]:checked').value,ent=+g('i_ent').value,pct=Math.round(ent/valor*1000)/10;
  var passo=r==='S'?6:12,max=r==='S'?5:2,nr=r==='0'?0:Math.min(+g('i_nr').value,max);
  var vr=C.num(g('i_vr').value),totRef=r2(nr*vr),resto=r2(valor-ent-totRef),men=r2(resto/30);
  var rows=[];for(var i=0;i<30;i++){var ref=(nr>0&&(i+1)%passo===0&&(i+1)/passo<=nr)?vr:0;rows.push({mes:rotulo(i),mensal:men,reforco:ref,total:r2(men+ref)})}
  return {valor:valor,pct:pct,ent:ent,r:r,nr:nr,vr:vr,totRef:totRef,resto:resto,men:men,rows:rows};
}
function evo(id,cum,valor){
  var falta=r2(valor-cum),pct=Math.max(0,Math.min(100,cum/valor*100)),b=g(id),cheio=Math.abs(falta)<1;
  b.className='card evo'+(cheio?' cheio':'');
  b.innerHTML='<div class="lbl">Evolução do pagamento</div><div class="bar"><i style="width:'+pct.toFixed(1)+'%"></i></div>'+(cheio?'<b class="p">100% do valor do imóvel</b>':'<div>Coberto: <b>'+fm(cum)+'</b> ('+pct.toFixed(1).replace('.',',')+'%)</div><div>Falta: <b>'+fm(Math.max(0,falta))+'</b></div>'+(falta<0?'<div class="obs">Observação: passou do valor do imóvel em '+fm(-falta)+'.</div>':''));
}
var pl=null;
var cbuilt=false;
function modoC(){
  var u=ctx.u,valor=u[3],fx=PLANO.FLUXO[ctx.emp];
  var meses=fx?PLANO.mesesObra(ctx.emp,new Date()).map(function(x){return MES[x.m-1]+'/'+x.a}):null,n=meses?meses.length:+g('i_nc').value;
  g('t_nc').textContent=n;
  if(!cbuilt){cbuilt=true;
    g('modoC').innerHTML='<div class="linha"><div class="card"><div class="lbl">Entrada</div><div class="val" id="c_ent"></div><input id="i_ce" type="range" min="'+Math.round(valor*0.1)+'" max="'+Math.round(valor*0.9)+'" step="1" value="'+Math.round(valor*0.1)+'"><div class="note">Percentual do valor do imóvel: <b id="t_ce"></b></div></div><div class="card evo" id="c_e1"></div></div>'+
    '<div class="linha"><div class="card"><div class="lbl">Reforços</div><div class="opt" style="margin-top:6px"><input type="radio" name="rfc" id="cr0" value="0" checked><label for="cr0">Sem reforços</label><input type="radio" name="rfc" id="crS" value="S"><label for="crS">Semestrais</label><input type="radio" name="rfc" id="crA" value="A"><label for="crA">Anuais</label></div><div id="cbox" hidden style="margin-top:10px"><label>Quantidade: <b id="t_cn"></b></label><input id="i_cn" type="range" min="1" max="5" value="1"><label for="i_cv" style="margin-top:8px">Valor de cada reforço (R$)</label><input id="i_cv" type="text" inputmode="decimal"></div><div class="val" id="c_ref" style="margin-top:8px"></div></div><div class="card evo" id="c_e2"></div></div>'+
    '<div class="linha"><div class="card"><div class="lbl">Parcelas mensais até as chaves</div><div class="val" id="c_men"></div><div class="note" id="c_mn"></div></div><div class="card evo" id="c_e3"></div></div>'+
    '<div class="linha"><div class="card"><div class="lbl">Financiamento bancário</div><div class="val" id="c_fin"></div><input id="i_cf" type="range" min="0" max="'+Math.round(valor*0.5)+'" step="1" value="'+Math.round(valor*0.5)+'"><div class="note">Percentual do valor do imóvel: <b id="t_cf"></b>. Quitado com o banco na entrega das chaves. Empresa (CNPJ): quem financia é o sócio (pessoa física), com renda comprovada por pró-labore, extratos e imposto de renda.</div></div><div class="card evo" id="c_e4"></div></div>'+
    '<div id="c_fecho"></div><div class="card"><details><summary>Pagamento mês a mês</summary><div id="c_mes"></div></details></div>';
    parValor('i_ce');parValor('i_cf');
    ['i_ce','i_cn','i_cv','i_cf'].forEach(function(i){g(i).addEventListener('input',render)});
    [].forEach.call(document.querySelectorAll('[name=rfc]'),function(x){x.addEventListener('change',render)});
  }
  var r=document.querySelector('[name=rfc]:checked').value;g('cbox').hidden=r==='0';
  var passo=r==='S'?6:12,max=Math.max(1,Math.min(r==='S'?5:2,Math.floor(n/passo)));g('i_cn').max=max;if(+g('i_cn').value>max)g('i_cn').value=max;
  if(r!=='0'&&g('i_cv').dataset.r!==r){g('i_cv').dataset.r=r;g('i_cv').value=String(Math.round(valor*(r==='S'?0.02:0.04))).replace(/\B(?=(\d{3})+$)/g,'.')+',00'}
  var ent=+g('i_ce').value,pct=Math.round(ent/valor*1000)/10,fin=+g('i_cf').value,fp=Math.round(fin/valor*1000)/10;
  var nr=r==='0'?0:Math.min(+g('i_cn').value,Math.floor(n/passo)),vr=C.num(g('i_cv').value),totRef=r2(nr*vr);
  var resto=r2(valor-ent-fin-totRef),men=n?r2(Math.max(0,resto)/n):0;
  var rows=[];for(var i=0;i<n;i++){var ref=(nr>0&&(i+1)%passo===0&&(i+1)/passo<=nr)?vr:0;rows.push({mes:meses?meses[i]:rotulo(i),v:men,ref:ref,tot:r2(men+ref)})}
  var chaves=fx?PLANO.rotulo(fx):'Entrega';
  pl={c:true,valor:valor,ent:ent,pct:pct,fin:fin,fp:fp,r:r,nr:nr,vr:vr,totRef:totRef,n:n,men:men,chaves:chaves,rows:rows};
  g('c_ent').textContent=fm(ent);g('t_ce').textContent=String(pct).replace('.',',')+'%';g('t_cn').textContent=nr||g('i_cn').value;
  g('c_ref').textContent=nr?nr+' de '+fm(vr):'';g('c_men').textContent=n+' de '+fm(men);
  g('c_mn').textContent='Parcelas mensais de agora até '+(fx?chaves:'a entrega')+'. Atualizadas pelo CUB durante a obra. Acertam-se sozinhas para fechar o valor do imóvel.';
  g('c_fin').textContent=fm(fin);g('t_cf').textContent=String(fp).replace('.',',')+'%';
  evo('c_e1',ent,valor);evo('c_e2',ent+totRef,valor);evo('c_e3',ent+totRef+men*n,valor);evo('c_e4',ent+totRef+men*n+fin,valor);
  g('c_fecho').innerHTML=resto<0?'<div class="banner warn"><b>Observação:</b> a entrada, os reforços e o financiamento passam do valor do imóvel. Reduza algum deles.</div>':'<div class="banner ok"><b>100% do valor do imóvel</b> coberto por este plano.</div>';
  g('c_mes').innerHTML='<div class="tw"><table><thead><tr><th>Mês</th><th>Mensal</th><th>Reforço</th><th>Total do mês</th></tr></thead><tbody><tr><td>Hoje</td><td colspan="3">'+fm(ent)+' (entrada)</td></tr>'+rows.map(function(x){return '<tr><td>'+x.mes+'</td><td>'+fm(x.v)+'</td><td>'+(x.ref?fm(x.ref):'-')+'</td><td>'+fm(x.tot)+'</td></tr>'}).join('')+'<tr><td>'+chaves+'</td><td colspan="3">'+fm(fin)+' (financiamento bancário)</td></tr></tbody></table></div>';
  g('a_doc').href='/evolucao-obra/documentos/'+C.qs();g('a_wa').href=waLink('Olá! Sou investidor e simulei o '+DADOS.emp[ctx.emp].nome+' (apartamento '+ctx.u[1]+') na condição da construtora: entrada de '+fm(ent)+', '+n+' parcelas de '+fm(men)+(nr?', '+nr+' reforços de '+fm(vr):'')+' e '+fm(fin)+' financiados. Quero conversar.');
}
function render(){
  var c=document.querySelector('[name=md]:checked').value==='C';g('modoC').hidden=!c;g('modoD').hidden=c;g('nbox').hidden=!(c&&!PLANO.FLUXO[ctx.emp]);
  if(c){modoC();return}
  var r=document.querySelector('[name=rf]:checked').value;g('rbox').hidden=r==='0';
  var max=r==='S'?5:2;g('i_nr').max=max;if(+g('i_nr').value>max)g('i_nr').value=max;
  if(r!=='0'&&g('i_vr').dataset.r!==r){g('i_vr').dataset.r=r;g('i_vr').value=String(Math.round(ctx.u[3]*(r==='S'?0.02:0.04))).replace(/\B(?=(\d{3})+$)/g,'.')+',00'}
  pl=plano();var valor=pl.valor;
  g('v_ent').textContent=fm(pl.ent);g('t_ent').textContent=String(pl.pct).replace('.',',')+'%';g('t_nr').textContent=pl.nr||g('i_nr').value;
  g('v_ref').textContent=pl.nr?pl.nr+' de '+fm(pl.vr):'';g('v_men').textContent='30 de '+fm(pl.men);
  evo('e_ent',pl.ent,valor);evo('e_ref',pl.ent+pl.totRef,valor);evo('e_men',pl.ent+pl.totRef+pl.men*30,valor);
  var falta=r2(valor-pl.ent-pl.totRef-pl.men*30);
  g('fecho').innerHTML=pl.resto<0?'<div class="banner warn"><b>Observação:</b> a entrada mais os reforços passam do valor do imóvel. Reduza algum deles.</div>':'<div class="banner ok"><b>100% do valor do imóvel</b> coberto por este plano.</div>';
  g('d_mes').innerHTML='<div class="tw"><table><thead><tr><th>Mês</th><th>Mensal</th><th>Reforço</th><th>Total do mês</th></tr></thead><tbody>'+pl.rows.map(function(x){return '<tr><td>'+x.mes+'</td><td>'+fm(x.mensal)+'</td><td>'+(x.reforco?fm(x.reforco):'-')+'</td><td>'+fm(x.total)+'</td></tr>'}).join('')+'</tbody></table></div>';
  g('a_wa').href=waLink('Olá! Sou investidor e simulei o '+DADOS.emp[ctx.emp].nome+' (apartamento '+ctx.u[1]+'): entrada de '+fm(pl.ent)+' e 30 parcelas de '+fm(pl.men)+'. Quero conversar.');
}
function texto(){
  var u=ctx.u;if(pl.c)return ['SIMULAÇÃO INVESTIDOR - CONDIÇÃO DA CONSTRUTORA','Empreendimento: '+DADOS.emp[ctx.emp].nome,'Apartamento: '+u[1]+' ('+u[0]+') - '+fm(u[3]),'Entrada ('+pl.pct+'%): '+fm(pl.ent),'Reforços: '+(pl.nr?pl.nr+' '+(pl.r==='S'?'semestrais':'anuais')+' de '+fm(pl.vr):'nenhum'),'Mensais até as chaves: '+pl.n+' x '+fm(pl.men),'Obs.: durante a obra, o valor das parcelas é atualizado pelo CUB.','Financiamento bancário ('+pl.fp+'%) em '+pl.chaves+': '+fm(pl.fin),'','Mês | mensal | reforço | total'].concat(pl.rows.map(function(x){return x.mes+' | '+fm(x.v)+' | '+fm(x.ref)+' | '+fm(x.tot)})).join('\n');
  return ['SIMULAÇÃO INVESTIDOR','Empreendimento: '+DADOS.emp[ctx.emp].nome,'Apartamento: '+u[1]+' ('+u[0]+') - '+fm(u[3]),'Entrada ('+pl.pct+'%): '+fm(pl.ent),'Reforços: '+(pl.nr?pl.nr+' '+(pl.r==='S'?'semestrais':'anuais')+' de '+fm(pl.vr):'nenhum'),'Mensais: 30 x '+fm(pl.men),'Obs.: durante a obra, o valor das parcelas é atualizado pelo CUB.','','Mês | mensal | reforço | total'].concat(pl.rows.map(function(x){return x.mes+' | '+fm(x.mensal)+' | '+fm(x.reforco)+' | '+fm(x.total)})).join('\n');
}
function enviar(){
  var em=g('i_mail').value.trim(),nome=g('i_nome').value.trim(),fone=g('i_fone').value.trim();
  var canal=(document.querySelector('[name=canal]:checked')||{}).value||'email';
  if(!nome){g('m_ok').textContent='Preencha o seu nome.';return}
  if(canal==='email'){
    if(!/^\S+@\S+\.\S+$/.test(em)){g('m_ok').textContent='Informe um e-mail válido (ou escolha WhatsApp).';return}
    C.enviar('Simulação investidor - '+nome,{Nome:nome,Email:em,WhatsApp:fone,Canal:'E-mail',Simulacao:texto(),_copia_cliente:'sim'});
    g('m_ok').textContent='Pronto! Enviamos a simulação para '+em+' e para o corretor. Se não encontrar, olhe também a caixa de spam.';
  }else{
    if(fone.length<10){g('m_ok').textContent='Informe o seu WhatsApp com DDD.';return}
    C.enviar('Simulação investidor (WhatsApp) - '+nome,{Nome:nome,Email:em,WhatsApp:fone,Canal:'WhatsApp',Simulacao:texto()});
    try{window.open(waLink('Olá! Sou '+nome+'. Esta é a minha simulação do '+DADOS.emp[ctx.emp].nome+':\n\n'+texto()),'_blank')}catch(e){}
    g('m_ok').textContent='Abrimos o WhatsApp com a sua simulação — é só tocar em enviar. Uma cópia também vai para o corretor.';
  }
}
function modelosHTML(e){return DADOS.emp[e].u.map(function(u,i){return '<div style="display:flex;align-items:center;justify-content:space-between;gap:14px;padding:13px 2px;border-top:1px solid #e6e9ee"><div><b>'+esc(String(u[1]).replace(/ da (Torre|Bloco) [A-Za-z0-9]+$/,''))+(u[0]?' – '+esc(u[0]):'')+'</b><div style="color:#a9761c;font-weight:800;font-size:18px">'+fm(u[3])+'</div></div><button type="button" class="um" data-i="'+i+'">Simular</button></div>'}).join('')}
function bindCards(e){var us=DADOS.emp[e].u;[].forEach.call(document.querySelectorAll('#modelos .um'),function(b){b.addEventListener('click',function(){monta(e,us[+this.getAttribute('data-i')])})})}
if(alvo) monta(alvo.emp,alvo.u);
else if(empValid){bindCards(emp);if(DADOS.emp[emp].u.length===1)monta(emp,DADOS.emp[emp].u[0]);}
else{
  g('s_emp').addEventListener('change',function(){var k=this.value;g('modelos').innerHTML=k?modelosHTML(k):'';g('calc').innerHTML='';if(k)bindCards(k)});
}
})();
