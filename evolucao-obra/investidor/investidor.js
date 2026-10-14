(function(){
var S=SIM,fm=C.fmt,esc=C.esc,app=document.getElementById('app'),wa=app.dataset.wa,g=function(i){return document.getElementById(i)};
var MES=['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],r2=function(v){return Math.round(v*100)/100};
var emp=C.Q.get('emp'),un=C.Q.get('un'),tt=C.Q.get('t'),vv=C.Q.get('v');
var ach=(emp&&un&&DADOS.emp[emp])?S.acharUnidade(emp,un,tt,vv):null;
var alvo=ach?{emp:emp,u:ach.u}:null;
function waLink(t){return 'https://wa.me/'+wa+'?text='+encodeURIComponent(t)}
var h='<h1>Calculadora do investidor</h1><p class="sub">Dê uma entrada e financie o restante direto com a construtora em 30 parcelas, com reforços anuais ou semestrais, ou escolha a condição aprovada pela construtora (10% + 40% até as chaves + 50% financiado no banco).</p>';
if(!alvo){
  h+='<div class="card"><h3>Escolha o imóvel</h3><div class="g2"><div class="row"><label for="s_emp">Empreendimento</label><select id="s_emp"><option value="">Selecione</option>'+Object.keys(DADOS.emp).map(function(k){return '<option value="'+k+'">'+esc(DADOS.emp[k].nome)+'</option>'}).join('')+'</select></div><div class="row"><label for="s_un">Apartamento</label><select id="s_un"><option value="">Escolha o empreendimento</option></select></div></div></div>';
}
h+='<div id="calc"></div>';
app.innerHTML=h;
var mes0=(function(){var d=new Date(),m=d.getMonth()+1,y=d.getFullYear();return {m:m,y:y}})();
function rotulo(i){var m=mes0.m+i,y=mes0.y;while(m>12){m-=12;y++}return MES[m-1]+'/'+y}
var ctx=null;
function monta(e,u){
  ctx={emp:e,u:u};var valor=u[3],nomeE=DADOS.emp[e].nome;
  var c='<div class="linha"><div class="card"><div class="lbl">Valor do imóvel</div><div class="val">'+fm(valor)+'</div><div class="note">'+esc(nomeE)+' – apartamento '+esc(String(u[1]).replace(/ da (Torre|Bloco) [A-Za-z0-9]+$/,''))+' ('+esc(u[0])+'). Valor fixo.</div></div><div class="card"><div class="lbl">Financiamento direto com a construtora</div><div class="val">30 parcelas</div><div class="note">Entrada + 30 mensais + reforços opcionais.</div></div></div>';
  var fx=window.PLANO&&PLANO.FLUXO[e];
  c+='<div class="card"><div class="lbl">Como você quer pagar?</div><div class="opt" style="margin-top:6px"><input type="radio" name="md" id="mD" value="D" checked><label for="mD">Parcelamento direto (30 parcelas)</label>'+(fx?'<input type="radio" name="md" id="mC" value="C"><label for="mC">Condição da construtora</label>':'')+'</div><p class="note">'+(fx?'Condição da construtora: 10% de entrada, 40% em parcelas até as chaves ('+PLANO.rotulo(fx)+') e 50% financiado no banco.':'')+'</p></div>';
  c+='<div id="modoC" hidden></div><div id="modoD">';
  c+='<div class="linha"><div class="card"><div class="lbl">Entrada</div><div class="val" id="v_ent"></div><input id="i_ent" type="range" min="5" max="90" step="1" value="10"><div class="note">Percentual do valor do imóvel: <b id="t_ent"></b></div></div><div class="card evo" id="e_ent"></div></div>';
  c+='<div class="linha"><div class="card"><div class="lbl">Reforços</div><div class="opt" style="margin-top:6px"><input type="radio" name="rf" id="r0" value="0" checked><label for="r0">Sem reforços</label><input type="radio" name="rf" id="rS" value="S"><label for="rS">Semestrais</label><input type="radio" name="rf" id="rA" value="A"><label for="rA">Anuais</label></div><div id="rbox" hidden style="margin-top:10px"><label>Quantidade: <b id="t_nr"></b></label><input id="i_nr" type="range" min="1" max="5" value="1"><label for="i_vr" style="margin-top:8px">Valor de cada reforço (R$)</label><input id="i_vr" type="text" inputmode="decimal"></div><div class="val" id="v_ref" style="margin-top:8px"></div></div><div class="card evo" id="e_ref"></div></div>';
  c+='<div class="linha"><div class="card"><div class="lbl">Parcelas mensais</div><div class="val" id="v_men"></div><div class="note">30 parcelas, a partir do mês que vem. Acertam-se sozinhas para fechar o valor do imóvel.</div></div><div class="card evo" id="e_men"></div></div>';
  c+='<div id="fecho"></div><div class="card"><details><summary>Pagamento mês a mês</summary><div id="d_mes"></div></details></div></div>';
  c+='<div class="card noprint"><h3>Quer receber esta simulação por e-mail?</h3><p class="note" style="margin:4px 0 10px">Enviamos para você e para o corretor.</p><div class="g2"><div class="row"><label for="i_nome">Seu nome</label><input id="i_nome" type="text"></div><div class="row"><label for="i_fone">WhatsApp com DDD</label><input id="i_fone" type="tel" inputmode="tel"></div></div><div class="g2"><div class="row"><label for="i_mail">Seu e-mail</label><input id="i_mail" type="email"></div><div style="align-self:end"><button id="b_mail" type="button" style="width:100%;margin:0 0 16px">Sim, enviar a simulação</button></div></div><p id="m_ok" class="note"></p></div>';
  c+='<div class="noprint"><a class="btn green" id="a_wa" href="#">Falar com o corretor no WhatsApp</a> <button class="lite" onclick="window.print()">🖨 Imprimir tudo</button></div>';
  g('calc').innerHTML=c;
  ['i_ent','i_nr','i_vr'].forEach(function(i){g(i).addEventListener('input',render)});
  [].forEach.call(document.querySelectorAll('[name=rf],[name=md]'),function(x){x.addEventListener('change',render)});
  window.addEventListener('beforeprint',function(){[].forEach.call(document.querySelectorAll('details'),function(d){d.open=true})});
  g('b_mail').addEventListener('click',enviar);
  render();
}
function plano(){
  var u=ctx.u,valor=u[3],r=document.querySelector('[name=rf]:checked').value,pct=+g('i_ent').value,ent=Math.round(valor*pct/100);
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
function modoC(){
  var u=ctx.u,valor=u[3],ent=r2(valor*0.1),obra=r2(valor*0.4),fin=r2(valor-ent-obra),fx=PLANO.FLUXO[ctx.emp];
  var meses=PLANO.mesesObra(ctx.emp,new Date()),n=meses.length,men=n?r2(obra/n):0;
  var rows=meses.map(function(x){return {mes:MES[x.m-1]+'/'+x.a,v:men}});
  pl={c:true,valor:valor,ent:ent,obra:obra,fin:fin,n:n,men:men,chaves:PLANO.rotulo(fx),rows:rows};
  g('modoC').innerHTML='<div class="linha"><div class="card"><div class="lbl">Entrada (10%)</div><div class="val">'+fm(ent)+'</div></div><div class="card evo" id="c_e1"></div></div>'+
    '<div class="linha"><div class="card"><div class="lbl">Até as chaves (40%)</div><div class="val">'+(n?n+' de '+fm(men):fm(obra))+'</div><div class="note">Parcelas mensais de agora até '+pl.chaves+'.</div></div><div class="card evo" id="c_e2"></div></div>'+
    '<div class="linha"><div class="card"><div class="lbl">Financiamento bancário (50%)</div><div class="val">'+fm(fin)+'</div><div class="note">Quitado com o banco na entrega das chaves ('+pl.chaves+').</div></div><div class="card evo" id="c_e3"></div></div>'+
    '<div class="banner ok"><b>100% do valor do imóvel</b> coberto por este plano.</div>'+
    '<div class="card"><details><summary>Pagamento mês a mês</summary><div class="tw"><table><thead><tr><th>Mês</th><th>Parcela</th></tr></thead><tbody><tr><td>Hoje</td><td>'+fm(ent)+' (entrada)</td></tr>'+rows.map(function(x){return '<tr><td>'+x.mes+'</td><td>'+fm(x.v)+'</td></tr>'}).join('')+'<tr><td>'+pl.chaves+'</td><td>'+fm(fin)+' (financiamento)</td></tr></tbody></table></div></details></div>';
  evo('c_e1',ent,valor);evo('c_e2',ent+obra,valor);evo('c_e3',valor,valor);
  g('a_wa').href=waLink('Olá! Sou investidor e simulei o '+DADOS.emp[ctx.emp].nome+' (apartamento '+ctx.u[1]+') na condição da construtora: entrada de '+fm(ent)+', '+n+' parcelas de '+fm(men)+' até as chaves e '+fm(fin)+' financiados. Quero conversar.');
}
function render(){
  var c=document.querySelector('[name=md]:checked').value==='C';g('modoC').hidden=!c;g('modoD').hidden=c;
  if(c){modoC();return}
  var r=document.querySelector('[name=rf]:checked').value;g('rbox').hidden=r==='0';
  var max=r==='S'?5:2;g('i_nr').max=max;if(+g('i_nr').value>max)g('i_nr').value=max;
  if(r!=='0'&&g('i_vr').dataset.r!==r){g('i_vr').dataset.r=r;g('i_vr').value=String(Math.round(ctx.u[3]*(r==='S'?0.02:0.04))).replace(/\B(?=(\d{3})+$)/g,'.')+',00'}
  pl=plano();var valor=pl.valor;
  g('v_ent').textContent=fm(pl.ent);g('t_ent').textContent=pl.pct+'%';g('t_nr').textContent=pl.nr||g('i_nr').value;
  g('v_ref').textContent=pl.nr?pl.nr+' de '+fm(pl.vr):'';g('v_men').textContent='30 de '+fm(pl.men);
  evo('e_ent',pl.ent,valor);evo('e_ref',pl.ent+pl.totRef,valor);evo('e_men',pl.ent+pl.totRef+pl.men*30,valor);
  var falta=r2(valor-pl.ent-pl.totRef-pl.men*30);
  g('fecho').innerHTML=pl.resto<0?'<div class="banner warn"><b>Observação:</b> a entrada mais os reforços passam do valor do imóvel. Reduza algum deles.</div>':'<div class="banner ok"><b>100% do valor do imóvel</b> coberto por este plano.</div>';
  g('d_mes').innerHTML='<div class="tw"><table><thead><tr><th>Mês</th><th>Mensal</th><th>Reforço</th><th>Total do mês</th></tr></thead><tbody>'+pl.rows.map(function(x){return '<tr><td>'+x.mes+'</td><td>'+fm(x.mensal)+'</td><td>'+(x.reforco?fm(x.reforco):'-')+'</td><td>'+fm(x.total)+'</td></tr>'}).join('')+'</tbody></table></div>';
  g('a_wa').href=waLink('Olá! Sou investidor e simulei o '+DADOS.emp[ctx.emp].nome+' (apartamento '+ctx.u[1]+'): entrada de '+fm(pl.ent)+' e 30 parcelas de '+fm(pl.men)+'. Quero conversar.');
}
function texto(){
  var u=ctx.u;if(pl.c)return ['SIMULAÇÃO INVESTIDOR - CONDIÇÃO DA CONSTRUTORA','Empreendimento: '+DADOS.emp[ctx.emp].nome,'Apartamento: '+u[1]+' ('+u[0]+') - '+fm(u[3]),'Entrada (10%): '+fm(pl.ent),'Até as chaves (40%): '+pl.n+' x '+fm(pl.men),'Financiamento bancário (50%) em '+pl.chaves+': '+fm(pl.fin),'','Mês | parcela'].concat(pl.rows.map(function(x){return x.mes+' | '+fm(x.v)})).join('\n');
  return ['SIMULAÇÃO INVESTIDOR','Empreendimento: '+DADOS.emp[ctx.emp].nome,'Apartamento: '+u[1]+' ('+u[0]+') - '+fm(u[3]),'Entrada ('+pl.pct+'%): '+fm(pl.ent),'Reforços: '+(pl.nr?pl.nr+' '+(pl.r==='S'?'semestrais':'anuais')+' de '+fm(pl.vr):'nenhum'),'Mensais: 30 x '+fm(pl.men),'','Mês | mensal | reforço | total'].concat(pl.rows.map(function(x){return x.mes+' | '+fm(x.mensal)+' | '+fm(x.reforco)+' | '+fm(x.total)})).join('\n');
}
function enviar(){
  var em=g('i_mail').value.trim(),nome=g('i_nome').value.trim(),fone=g('i_fone').value.trim();
  if(!nome||fone.length<10||!/^\S+@\S+\.\S+$/.test(em)){g('m_ok').textContent='Preencha nome, WhatsApp e um e-mail válido.';return}
  C.enviar('Simulação investidor - '+nome,{Nome:nome,Email:em,WhatsApp:fone,Simulacao:texto(),_copia_cliente:'sim'});
  g('m_ok').textContent='Pronto! Enviamos a simulação para '+em+' e para o corretor. Se não encontrar, olhe também a caixa de spam.';
}
if(alvo) monta(alvo.emp,alvo.u);
else{
  g('s_emp').addEventListener('change',function(){var k=this.value,s=g('s_un');s.innerHTML='<option value="">Selecione</option>'+(k?DADOS.emp[k].u.map(function(u,i){return '<option value="'+i+'">'+esc(String(u[1]).replace(/ da (Torre|Bloco) [A-Za-z0-9]+$/,''))+' – '+esc(u[0])+' – '+fm(u[3])+'</option>'}).join(''):'');g('calc').innerHTML=''});
  g('s_un').addEventListener('change',function(){var k=g('s_emp').value;if(k&&this.value!=='')monta(k,DADOS.emp[k].u[+this.value])});
}
})();
