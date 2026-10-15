/* Viva Urban no simulador: a unidade/valor ja vem da simulador.js (DADOS.emp.viva_urban).
   Aqui so acrescentamos o FLUXO (chaves/pos-obra), que fica no plano.js e precisa ser
   setado DEPOIS que o plano.js carrega. Sem isso o plano/calculadora nao renderiza p/ a
   Viva Urban. Entrega mar/2030, pos-chaves ate 30 (mesma regra das 72 parcelas). */
(function () {
  try {
    if (window.PLANO && PLANO.FLUXO && !PLANO.FLUXO.viva_urban) {
      PLANO.FLUXO.viva_urban = { m: 3, a: 2030, pos: 30 };
    }
  } catch (e) {}
})();
