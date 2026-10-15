/* Viva Urban no simulador, adicionado POR FORA do dados.js.
   O sync.py diario reconstroi o dados.js so para os 5 empreendimentos do portal,
   entao a Viva Urban (sem tabela no portal) vive aqui e sobrevive ao sync.
   ponytail: avaliacao = valor; o financiamento da Caixa e calculado pela renda
   no proprio simulador (capacidadeDe usa u[3] e u[4]). Entrega mar/2030. */
(function () {
  try {
    if (window.DADOS && DADOS.emp && !DADOS.emp.viva_urban) {
      DADOS.emp.viva_urban = {
        nome: 'Viva Urban Viarello Residence',
        u: [
          ['', '2 dormitórios', 47, 389000, 389000],
          ['', '2 dormitórios com suíte', 52, 464000, 464000]
        ]
      };
    }
    if (window.PLANO && PLANO.FLUXO && !PLANO.FLUXO.viva_urban) {
      PLANO.FLUXO.viva_urban = { m: 3, a: 2030, pos: 30 };
    }
  } catch (e) {}
})();
