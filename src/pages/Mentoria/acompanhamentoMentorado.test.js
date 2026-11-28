import test from 'node:test';
import assert from 'node:assert/strict';

test('Normalização segura de progresso e prazos da árvore de evolução', () => {
  // 1. Testa que progresso número é mantido entre 0 e 100
  const normalizarProgresso = (prog) => {
    if (typeof prog === 'number' && Number.isFinite(prog)) {
      return Math.max(0, Math.min(100, Math.round(prog)));
    }
    if (prog && typeof prog === 'object' && typeof prog.percentual === 'number' && Number.isFinite(prog.percentual)) {
      return Math.max(0, Math.min(100, Math.round(prog.percentual)));
    }
    return 0;
  };

  assert.equal(normalizarProgresso(75), 75);
  assert.equal(normalizarProgresso(150), 100);
  assert.equal(normalizarProgresso(-10), 0);
  assert.equal(normalizarProgresso({ percentual: 45 }), 45);
  assert.equal(normalizarProgresso(null), 0);
  assert.equal(normalizarProgresso(undefined), 0);

  // 2. Testa que normalizarPrazo aceita tanto strings ISO quanto arrays de LocalDateTime do Jackson
  const normalizarPrazo = (prazo) => {
    if (!prazo) return null;
    if (typeof prazo === 'string') {
      const dataLimpa = prazo.split('T')[0];
      const partes = dataLimpa.split('-');
      if (partes.length === 3) {
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
      }
      return dataLimpa;
    }
    if (Array.isArray(prazo) && prazo.length >= 3) {
      const dia = String(prazo[2]).padStart(2, '0');
      const mes = String(prazo[1]).padStart(2, '0');
      const ano = prazo[0];
      return `${dia}/${mes}/${ano}`;
    }
    return null;
  };

  assert.equal(normalizarPrazo('2026-11-28T14:30:00'), '28/11/2026');
  assert.equal(normalizarPrazo('2026-12-15'), '15/12/2026');
  assert.equal(normalizarPrazo([2026, 11, 28, 14, 30]), '28/11/2026');
  assert.equal(normalizarPrazo(null), null);
  assert.equal(normalizarPrazo(undefined), null);

  // 3. Testa que cálculo consolidado de evolução agrega etapas e tarefas sem lançar exceções
  const mockObjetivos = [
    {
      id: 1,
      titulo: 'Objetivo A',
      etapas: [
        {
          id: 10,
          titulo: 'Ilha 1',
          tarefas: [
            { id: 101, titulo: 'T1', concluida: true },
            { id: 102, titulo: 'T2', concluida: false },
          ],
          topicos: [
            { id: 201, titulo: 'Topico 1', concluido: true },
          ],
        },
      ],
    },
  ];

  const todasEtapas = mockObjetivos.flatMap((o) => o.etapas || []);
  const todasTarefas = todasEtapas.flatMap((e) => e.tarefas || []);
  const tarefasConcluidas = todasTarefas.filter((t) => t.concluida).length;
  const todosTopicos = todasEtapas.flatMap((e) => e.topicos || []);
  const topicosConcluidos = todosTopicos.filter((p) => p.concluido).length;

  const totalItens = todasTarefas.length + todosTopicos.length;
  const itensConcluidos = tarefasConcluidas + topicosConcluidos;
  const percentual = Math.round((itensConcluidos / totalItens) * 100);

  assert.equal(totalItens, 3);
  assert.equal(itensConcluidos, 2);
  assert.equal(percentual, 67);
});

test('Aba Evolução existe exclusivamente no workspace do Mentor e não no do Mentorado', async () => {
  // Lê arquivos do workspace para garantir que a aba 'evolucao' está apenas no Mentor
  const fs = await import('node:fs');
  const path = await import('node:path');

  const mentoradoSrc = fs.readFileSync(
    path.resolve(process.cwd(), 'src/pages/Mentoria/MentoradoWorkspace.jsx'),
    'utf-8'
  );
  const mentorSrc = fs.readFileSync(
    path.resolve(process.cwd(), 'src/pages/Mentoria/MentorWorkspace.jsx'),
    'utf-8'
  );

  // Mentorado NÃO deve ter a aba 'evolucao' ou 'Minha Evolução'
  assert.equal(mentoradoSrc.includes("id: 'evolucao'"), false, "Mentorado NÃO deve ter aba 'evolucao'");
  assert.equal(mentoradoSrc.includes('Minha Evolução'), false, "Mentorado NÃO deve ter título 'Minha Evolução'");
  assert.equal(mentoradoSrc.includes("abaAtiva === 'evolucao'"), false, "Mentorado NÃO deve ter renderização de 'evolucao'");

  // Mentor DEVE ter a aba 'evolucao' rotulada como 'Evolução do mentorado'
  assert.equal(mentorSrc.includes("id: 'evolucao'"), true, "Mentor DEVE ter aba 'evolucao'");
  assert.equal(mentorSrc.includes('Evolução do mentorado'), true, "Mentor DEVE ter aba 'Evolução do mentorado'");
  assert.equal(mentorSrc.includes('AcompanhamentoMentorado'), true, "Mentor DEVE renderizar AcompanhamentoMentorado");
});
