/* Seletor R$ / US$ / € nas calculadoras. So aparece quando o site esta traduzido (bandeira EN/ES).
   Converte: resultados (via moedaFmt), todo valor fixo da pagina ("R$ 1.234,56" / "US$ 1,234.56" / "1.234,56 €")
   e os campos de valor (label com R$). Cada valor e relido do proprio texto, entao nao briga com o Google Tradutor. */
(function(){
var RATE={USD:4.8,EUR:5.5},cur='BRL',bar,pairs=[],dirty=false,memo={};
var TOK=/(R\$|US\$)\s?(\d(?:[\d.,]*\d)?)(?!\s?(?:mil|mi|milh)\b)|(\d(?:[\d.,]*\d)?)\s?€|(R\$|US\$|€)/g;
/* "1.234,56" / "1,234.56" / "300.000" -> numero (o ultimo separador seguido de 1-2 digitos e o decimal) */
function parseNum(x){
var i=-1,r=/[.,](?=\d{1,2}$)/.exec(x);
if(r)i=r.index;
var ip=(i<0?x:x.slice(0,i)).replace(/[.,]/g,''),fp=i<0?'':x.slice(i+1);
return Number(ip+(fp?'.'+fp:''))||0;
}
function money(n){
if(cur==='BRL')return null;
var v=(Number(n)||0)/RATE[cur];
var r=cur==='USD'?'US$ '+v.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}):v.toLocaleString('de-DE',{minimumFractionDigits:2,maximumFractionDigits:2})+' €';
memo[r]=Number(n)||0;/* guarda o valor exato em reais p/ nao perder centavos ao reconverter */
return r;
}
window.moedaFmt=money;
function fmt(n){
if(cur!=='BRL')return money(n);
return 'R$ '+(Math.round(n*100)/100).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
}
function toBrl(sym,a,b,m){/* valor do token em reais */
var k=m.replace(/\s+/g,' ').trim();
if(sym!=='R$'&&memo[k]!==undefined)return memo[k];
if(b!==undefined)return parseNum(b)*RATE.EUR;
if(sym==='R$')return parseNum(a);
return parseNum(a)*RATE.USD;
}
function convert(s,bare){
return s.replace(TOK,function(m,sym,a,b,only){
if(only)return bare?(cur==='BRL'?'R$':cur==='USD'?'US$':'€'):m;
return fmt(toBrl(sym,a,b,m));
});
}
function paint(){
if(cur==='BRL'&&!dirty)return;/* pagina em portugues fica intocada */
if(cur!=='BRL')dirty=true;
var w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,{acceptNode:function(n){
var p=n.parentNode;
if(!p||/^(SCRIPT|STYLE|TEXTAREA|NOSCRIPT|TITLE)$/.test(p.nodeName)||p.closest('#moedaBar,#langbar'))return NodeFilter.FILTER_REJECT;
TOK.lastIndex=0;return TOK.test(n.nodeValue)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT;}});
var nodes=[],n;while((n=w.nextNode()))nodes.push(n);
nodes.forEach(function(t){
var bare=!!t.parentNode.closest('label');
var v=convert(t.nodeValue,bare);
if(v!==t.nodeValue)t.nodeValue=v;
});
}
/* campos de valor: em US$/€ o cliente digita na moeda dele; o campo original (em reais) fica escondido e alimenta a pagina */
function elVal(el){var s=el.value||'0';return el.type==='number'?Number(s)||0:Number(s.replace(/\./g,'').replace(',','.'))||0;}
function setEl(el,n){
n=Math.round(n*100)/100;
if(el.type==='number'){el.value=n;return;}
el.value=n.toLocaleString('pt-BR',Number.isInteger(n)?{}:{minimumFractionDigits:2,maximumFractionDigits:2});
}
function toTw(n){return (n/RATE[cur]).toLocaleString(cur==='USD'?'en-US':'de-DE',{maximumFractionDigits:2});}
function fromTw(s){return parseNum(s.replace(/[^\d.,]/g,''));}
function findMoneyInputs(){
[].forEach.call(document.querySelectorAll('.cfield,.field'),function(f){
var l=f.querySelector('label'),i=f.querySelector('input');
if(!l||!i||/^(checkbox|hidden|range|radio)$/.test(i.type)||!/R\$/.test(l.textContent))return;
pairs.push({el:i});
});
}
function syncTw(active){pairs.forEach(function(p){if(p.tw&&p.tw!==active)p.tw.value=toTw(elVal(p.el));});}
function twins(){
pairs.forEach(function(p){
if(cur==='BRL'){if(p.tw){p.tw.remove();p.tw=null;}p.el.style.display=p.disp||'';return;}
if(!p.tw){
p.disp=p.el.style.display;
var t=document.createElement('input');t.type='text';t.inputMode='decimal';t.className=p.el.className;t.style.cssText=p.el.style.cssText;t.setAttribute('translate','no');
t.addEventListener('input',function(){setEl(p.el,fromTw(t.value)*RATE[cur]);p.el.dispatchEvent(new Event('input',{bubbles:true}));setTimeout(function(){syncTw(t);},0);});
p.el.parentNode.insertBefore(t,p.el);p.tw=t;
}
p.el.style.display='none';p.tw.value=toTw(elVal(p.el));
});
}
function refresh(){
twins();
[].forEach.call(document.querySelectorAll('input[type=range]'),function(i){i.dispatchEvent(new Event('input',{bubbles:true}));});
pairs.forEach(function(p){p.el.dispatchEvent(new Event('input',{bubbles:true}));});
paint();
setTimeout(function(){syncTw();},0);
}
function set(c){
cur=c;
if(bar)[].forEach.call(bar.querySelectorAll('button'),function(b){b.className=b.dataset.c===c?'on':'';});
refresh();
}
function build(){
var a=document.querySelector('#calcEntrada')||document.querySelector('input[type=range]');
if(!a)return;
var host=a.closest('.info')||a.closest('section');
findMoneyInputs();
/* tabelas com coluna "Financiamento": marca as celulas p/ sumirem fora do pais */
[].forEach.call(document.querySelectorAll("table"),function(t){[].forEach.call(t.querySelectorAll("thead th"),function(th,i){if(/^s*Financiamento/i.test(th.textContent))[].forEach.call(t.rows,function(r){if(r.cells[i])r.cells[i].classList.add("col-banco");});});});
bar=document.createElement('div');
bar.className='notranslate';bar.setAttribute('translate','no');
bar.style.cssText='display:none;gap:8px;align-items:center;margin-bottom:16px;font-size:14px';
bar.innerHTML='<style>#moedaBar button{border:1px solid #c9a227;background:#fff;color:#0a1626;border-radius:8px;padding:7px 16px;font-weight:700;cursor:pointer}#moedaBar button.on{background:#c9a227;color:#fff}</style><button data-c="BRL">R$</button><button data-c="USD">US$</button><button data-c="EUR">€</button>';
bar.id='moedaBar';
document.head.insertAdjacentHTML('beforeend','<style>html.sem-banco .mode[data-m=banco],html.sem-banco .calc-row:has(#calcFgts),html.sem-banco .calc-row:has(#calcFinanciamento),html.sem-banco .cr:has(#rFgts),html.sem-banco .cr:has(#rFinanciamento){display:none!important}html.sem-banco .modes{grid-template-columns:1fr}.so-ext{display:none}html.sem-banco .so-ext{display:inline}html.sem-banco .so-br{display:none}html.sem-banco .col-banco{display:none!important}</style>');/* fora do pais nao ha financiamento bancario/FGTS: esconde e zera */
bar.addEventListener('click',function(e){var c=e.target.dataset&&e.target.dataset.c;if(c)set(c);});
host.insertBefore(bar,host.firstChild);
['click','change'].forEach(function(ev){document.addEventListener(ev,function(){if(cur!=='BRL')setTimeout(function(){syncTw();},0);});});
}
function onLang(){
if(!bar)return;
var l=(document.documentElement.lang||'pt').slice(0,2).toLowerCase();
var want=l==='en'?'USD':l==='es'?'EUR':'BRL';
bar.style.display=want==='BRL'?'none':'flex';
if(bar.dataset.l!==l){
var era=window.semBanco;
window.semBanco=l!=='pt';
document.documentElement.classList.toggle('sem-banco',window.semBanco);
if(window.semBanco||era){/* recalcula sem FGTS/financiamento (ou volta ao normal) */
var f=document.getElementById('calcFgts');if(f){f.checked=false;f.dispatchEvent(new Event('change',{bubbles:true}));}
var d=document.querySelector('.mode[data-m=direto]');if(d&&window.semBanco)d.click();
}
bar.dataset.l=l;set(want);
/* o Google ainda reescreve textos depois de trocar o idioma: repinta ate assentar */
[1200,3500,7000].forEach(function(ms){setTimeout(paint,ms);});
}
}
function init(){build();if(!bar)return;onLang();new MutationObserver(onLang).observe(document.documentElement,{attributes:true,attributeFilter:['lang','class']});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
