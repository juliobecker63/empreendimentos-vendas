/* Seletor R$ / US$ / € nas calculadoras. So aparece quando o site esta traduzido (bandeira EN/ES). */
(function(){
var RATE={USD:4.8,EUR:5.5},cur='BRL',bar;
window.moedaFmt=function(n){
if(cur==='BRL')return null;
var v=(Number(n)||0)/RATE[cur];
return cur==='USD'?'US$ '+v.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}):v.toLocaleString('de-DE',{minimumFractionDigits:2,maximumFractionDigits:2})+' €';
};
function refresh(){[].forEach.call(document.querySelectorAll('#calcEntrada,#calcEnt,input[type=range]'),function(i){i.dispatchEvent(new Event('input',{bubbles:true}));});}
function set(c){
cur=c;
if(bar)[].forEach.call(bar.querySelectorAll('button'),function(b){b.className=b.dataset.c===c?'on':'';});
refresh();
}
function build(){
var a=document.querySelector('#calcEntrada')||document.querySelector('input[type=range]');
if(!a)return;
var host=a.closest('.info')||a.closest('section');
bar=document.createElement('div');
bar.className='notranslate';bar.setAttribute('translate','no');
bar.style.cssText='display:none;gap:8px;align-items:center;margin-bottom:16px;font-size:14px';
bar.innerHTML='<style>#moedaBar button{border:1px solid #c9a227;background:#fff;color:#0a1626;border-radius:8px;padding:7px 16px;font-weight:700;cursor:pointer}#moedaBar button.on{background:#c9a227;color:#fff}</style><button data-c="BRL">R$</button><button data-c="USD">US$</button><button data-c="EUR">€</button>';
bar.id='moedaBar';
bar.addEventListener('click',function(e){var c=e.target.dataset&&e.target.dataset.c;if(c)set(c);});
host.insertBefore(bar,host.firstChild);
}
function onLang(){
if(!bar)return;
var l=(document.documentElement.lang||'pt').slice(0,2).toLowerCase();
var want=l==='en'?'USD':l==='es'?'EUR':'BRL';
bar.style.display=want==='BRL'?'none':'flex';
if(bar.dataset.l!==l){bar.dataset.l=l;set(want);}
}
function init(){build();if(!bar)return;onLang();new MutationObserver(onLang).observe(document.documentElement,{attributes:true,attributeFilter:['lang','class']});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
