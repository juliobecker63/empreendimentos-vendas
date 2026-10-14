/* Campo para digitar o valor em R$ junto de um slider (slider em R$). Digitado = valor exato; arrastado = arredonda a R$ 500. */
window.parValor=function(sid){
  var s=document.getElementById(sid);if(!s||document.getElementById(sid+'_r'))return;
  var br=function(v){return Number(v).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})};
  var num=function(v){return parseFloat(String(v).replace(/\./g,'').replace(',','.'))||0};
  var lab=document.createElement('label'),t=document.createElement('input');
  t.type='text';t.inputMode='decimal';t.id=sid+'_r';t.style.marginTop='4px';
  lab.htmlFor=t.id;lab.textContent='Ou digite o valor (R$)';lab.style.cssText='font-weight:500;margin-top:8px;display:block';
  s.step='1';s.parentNode.insertBefore(t,s.nextSibling);s.parentNode.insertBefore(lab,t);
  var sync=function(){if(document.activeElement!==t)t.value=br(s.value)};
  s.addEventListener('input',function(e){
    if(e.isTrusted&&+s.max>5000){var r=Math.round(s.value/500)*500;s.value=Math.max(+s.min,Math.min(+s.max,r))}
    sync();
  });
  t.addEventListener('input',function(){
    var v=Math.max(+s.min,Math.min(+s.max,num(t.value)));s.value=v;s.dispatchEvent(new Event('input'));
  });
  t.addEventListener('blur',function(){t.value=br(s.value)});
  sync();setInterval(sync,400);
};
