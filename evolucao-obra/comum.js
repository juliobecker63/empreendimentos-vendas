/* Utilitarios comuns das paginas do simulador. */
(function(){
  var Q=new URLSearchParams(location.search);
  var C={Q:Q,
    fmt:function(v){return v.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})},
    num:function(v){return parseFloat(String(v).replace(/\./g,'').replace(',','.'))||0},
    // querystring que acompanha o cliente entre as paginas (so dados do imovel, nunca dados pessoais)
    qs:function(){var o=new URLSearchParams();['emp','un','t','v'].forEach(function(k){if(Q.get(k))o.set(k,Q.get(k))});var s=o.toString();return s?'?'+s:''},
    esc:function(t){return String(t).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})},
    idade:function(nasc){var d=new Date(nasc+'T00:00:00');if(isNaN(d))return null;var h=new Date(),m=(h.getFullYear()-d.getFullYear())*12+h.getMonth()-d.getMonth()-(h.getDate()<d.getDate()?1:0);if(m<0)return null;return {anos:Math.floor(m/12),meses:m%12}},
    get:function(k){try{return JSON.parse(sessionStorage.getItem(k))}catch(e){return null}},
    set:function(k,v){try{sessionStorage.setItem(k,JSON.stringify(v))}catch(e){}},
    // envia e-mail pela Edge Function enviar-contato (chega no corretor; copia ao cliente quando Email informado)
    enviar:function(assunto,campos){
      try{var o={_subject:assunto,_captcha:'false',_honey:''};Object.keys(campos).forEach(function(k){o[k]=campos[k]});
        navigator.sendBeacon('https://ljxijsfumxrstixkimyg.supabase.co/functions/v1/enviar-contato',new URLSearchParams(o));return true}catch(e){return false}
    },
    rodape:function(){
      var t=['Esta simulação é apenas uma estimativa informativa, calculada pelo sistema SAC com base nas regras públicas do programa Minha Casa, Minha Vida e nos dados que você informou. Não é proposta, oferta, pré-aprovação nem garantia de crédito.',
        'Os valores reais de parcela, taxa de juros, prazo, cota de financiamento, TR, seguros (MIP e DFI), tarifas e a aprovação do crédito são definidos exclusivamente pela Caixa Econômica Federal, conforme análise de renda, idade, histórico de FGTS, avaliação do imóvel e normas vigentes na data da contratação. Esses itens podem mudar sem aviso prévio, e por isso o resultado pode diferir da simulação oficial.',
        'Esta ferramenta e quem a disponibiliza não se responsabilizam por diferenças entre esta estimativa e as condições efetivamente oferecidas pela Caixa. Antes de qualquer decisão de compra, faça a simulação oficial e confirme todas as condições diretamente com a Caixa.'];
      var f=document.createElement('footer');f.className='rodape';f.innerHTML='<p><b>Aviso importante</b></p>'+t.map(function(x){return '<p>'+x+'</p>'}).join('');document.body.appendChild(f);
    }
  };
  window.C=C;
})();
