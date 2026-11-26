import test from 'node:test';
import assert from 'node:assert/strict';
import {
  extrairDataCivil,
  filtrarTarefasPorPrazo,
  formatarHorarioPrazo,
  formatarPrazo,
} from '../../dashboard/taskDates.js';

test('integração Calendário: mapeamento de tarefas da árvore mantém IDs e vínculos com objetivo e ilha', () => {
  const arvoreSimulada = [
    {
      id: 101,
      nome: 'Aprender Fullstack',
      etapas: [
        {
          id: 501,
          texto: 'Fundamentos React',
          tarefas: [
            {
              id: 9001,
              texto: 'Criar componentes funcionais',
              concluida: false,
              prazo: '2026-11-28T14:30:00',
            },
            {
              id: 9002,
              texto: 'Praticar hooks',
              concluida: true,
              prazo: '2026-11-28',
            },
            {
              id: 9003,
              texto: 'Estudar sem prazo',
              concluida: false,
              prazo: '',
            },
          ],
        },
      ],
    },
  ];

  // Simula o achatamento realizado em useDadosDashboard.js
  const tarefasAchatadas = arvoreSimulada.flatMap((objetivo) =>
    objetivo.etapas.flatMap((etapa) =>
      etapa.tarefas.map((tarefa) => ({
        ...tarefa,
        objetivoId: objetivo.id,
        objetivoNome: objetivo.nome,
        etapaId: etapa.id,
        etapaNome: etapa.texto,
      }))
    )
  );

  assert.equal(tarefasAchatadas.length, 3);
  assert.equal(tarefasAchatadas[0].objetivoId, 101);
  assert.equal(tarefasAchatadas[0].etapaId, 501);
  assert.equal(tarefasAchatadas[0].objetivoNome, 'Aprender Fullstack');
  assert.equal(tarefasAchatadas[0].etapaNome, 'Fundamentos React');

  // Filtragem no calendário para o dia 28/11/2026
  const tarefasDoDia = filtrarTarefasPorPrazo(tarefasAchatadas, '2026-11-28');
  assert.equal(tarefasDoDia.length, 2);

  // Ambas as tarefas do dia 28/11/2026 aparecem (uma com hora, outra pura)
  assert.equal(tarefasDoDia[0].id, 9001);
  assert.equal(formatarHorarioPrazo(tarefasDoDia[0].prazo), '14:30');
  assert.equal(formatarPrazo(tarefasDoDia[0].prazo), '28/11/2026');
  assert.equal(tarefasDoDia[0].concluida, false);

  assert.equal(tarefasDoDia[1].id, 9002);
  assert.equal(formatarHorarioPrazo(tarefasDoDia[1].prazo), '');
  assert.equal(formatarPrazo(tarefasDoDia[1].prazo), '28/11/2026');
  assert.equal(tarefasDoDia[1].concluida, true);

  // Tarefa sem prazo não aparece no calendário
  assert.equal(extrairDataCivil(tarefasAchatadas[2].prazo), '');
  assert.equal(filtrarTarefasPorPrazo(tarefasAchatadas, '2026-11-28').some((t) => t.id === 9003), false);

  // Simula payload de navegação gerado pelo clique na tarefa do Calendário
  const payloadNavegacao = {
    destino: 'Ilhas',
    opcoes: {
      objetivoId: tarefasDoDia[0].objetivoId,
      etapaId: tarefasDoDia[0].etapaId,
      tarefaId: tarefasDoDia[0].id,
    },
  };

  assert.equal(payloadNavegacao.destino, 'Ilhas');
  assert.equal(payloadNavegacao.opcoes.objetivoId, 101);
  assert.equal(payloadNavegacao.opcoes.etapaId, 501);
  assert.equal(payloadNavegacao.opcoes.tarefaId, 9001);
});

test('garante que não há duplicação de tarefas no calendário mesmo com recargas sucessivas', () => {
  const listaTarefas = [
    { id: 1, prazo: '2026-11-28T10:00:00', objetivoId: 10, etapaId: 20 },
    { id: 2, prazo: '2026-11-28T16:00:00', objetivoId: 10, etapaId: 20 },
  ];

  const filtradas = filtrarTarefasPorPrazo(listaTarefas, '2026-11-28');
  const ids = filtradas.map((t) => t.id);
  const idsUnicos = new Set(ids);
  assert.equal(ids.length, idsUnicos.size);
});
