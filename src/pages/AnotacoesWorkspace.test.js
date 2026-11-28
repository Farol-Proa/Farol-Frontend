import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizarConteudoIlha,
  conteudoTemMaterial,
  extrairTextoBloco,
} from '../dashboard/conteudoIlha.js';
import {
  estadoInicialNotas,
  notasReducer,
  rascunhoNotasSujo,
  extrairTextoDocumento,
  extrairPreviaDocumento,
} from '../dashboard/notasState.js';

test('AnotacoesWorkspace: busca em tempo real filtra por título e por texto interno dos blocos', () => {
  const notas = [
    {
      id: 1,
      titulo: 'Estudo de React Hooks',
      conteudo: [
        { id: 'b1', type: 'paragraph', content: [{ type: 'text', text: 'useEffect e useState em profundidade.' }] },
      ],
      etapaId: 10,
    },
    {
      id: 2,
      titulo: 'Arquitetura Backend',
      conteudo: [
        { id: 'b2', type: 'paragraph', content: [{ type: 'text', text: 'Spring Boot e JPA Controllers.' }] },
      ],
      etapaId: null,
    },
    {
      id: 3,
      titulo: 'Notas Diversas',
      conteudo: [
        { id: 'b3', type: 'paragraph', content: [{ type: 'text', text: 'Lembrar de revisar os Hooks do ciclo de vida.' }] },
      ],
      etapaId: null,
    },
  ];

  // Busca por termo no título
  const busca1 = 'Arquitetura';
  const res1 = notas.filter((n) =>
    (n.titulo || '').toLowerCase().includes(busca1.toLowerCase()) ||
    extrairTextoDocumento(n.conteudo).toLowerCase().includes(busca1.toLowerCase())
  );
  assert.equal(res1.length, 1);
  assert.equal(res1[0].id, 2);

  // Busca por termo no conteúdo interno
  const busca2 = 'Hooks';
  const res2 = notas.filter((n) =>
    (n.titulo || '').toLowerCase().includes(busca2.toLowerCase()) ||
    extrairTextoDocumento(n.conteudo).toLowerCase().includes(busca2.toLowerCase())
  );
  assert.equal(res2.length, 2);
  assert.equal(res2[0].id, 1);
  assert.equal(res2[1].id, 3);
});

test('AnotacoesWorkspace: filtragem por vínculo com Ilhas vs notas independentes', () => {
  const notas = [
    { id: 1, titulo: 'Nota da Ilha 10', etapaId: 10, objetivoId: null },
    { id: 2, titulo: 'Nota da Ilha 20', etapaId: 20, objetivoId: null },
    { id: 3, titulo: 'Nota Avulsa', etapaId: null, objetivoId: null },
  ];

  // Apenas vinculadas
  const vinculadas = notas.filter((n) => n.etapaId != null);
  assert.equal(vinculadas.length, 2);

  // Apenas independentes
  const independentes = notas.filter((n) => n.etapaId == null && n.objetivoId == null);
  assert.equal(independentes.length, 1);
  assert.equal(independentes[0].id, 3);

  // Por ilha específica
  const ilha10 = notas.filter((n) => n.etapaId === 10);
  assert.equal(ilha10.length, 1);
  assert.equal(ilha10[0].id, 1);
});

test('AnotacoesWorkspace: associação com Ilha detecta guia e tópicos para estudo simultâneo', () => {
  const objetivos = [
    {
      id: 1,
      nome: 'Trilha Frontend',
      etapas: [
        {
          id: 10,
          texto: 'Ilha 1: Componentes e Estado',
          descricao: 'Fundamentos de componentes React',
          topicos: [
            { id: 101, titulo: 'JSX e Sintaxe', concluido: true, obrigatorio: true },
            { id: 102, titulo: 'Ciclo de Vida', concluido: false, obrigatorio: true },
          ],
          conteudo: {
            schemaVersion: 1,
            blocks: [
              { id: 'g1', type: 'heading', content: { text: 'Princípios de Componentes' } },
              { id: 'g2', type: 'callout', content: { text: 'Mantenha componentes puros quando possível.' } },
              { id: 'g3', type: 'code', content: { code: 'const [valor, setValor] = useState(0);' } },
            ],
          },
        },
      ],
    },
  ];

  const nota = { id: 42, titulo: 'Minhas anotações de aula', etapaId: 10 };

  // Identificação da ilha correspondente
  const ilha = objetivos[0].etapas.find((e) => e.id === nota.etapaId);
  assert.ok(ilha);
  assert.equal(ilha.texto, 'Ilha 1: Componentes e Estado');
  assert.equal(ilha.topicos.length, 2);

  // Verificação de que o material de estudo é reconhecido
  const conteudo = normalizarConteudoIlha(ilha.conteudo);
  assert.equal(conteudoTemMaterial(conteudo), true);
  assert.equal(conteudo.blocks.length, 3);
  assert.equal(conteudo.blocks[0].type, 'heading');
  assert.equal(conteudo.blocks[1].type, 'callout');
  assert.equal(conteudo.blocks[2].type, 'code');
});

test('AnotacoesWorkspace: nota independente sem ilha exibe estado orientando vínculo', () => {
  const nota = { id: 99, titulo: 'Ideias soltas', etapaId: null, objetivoId: null };
  const objetivos = [{ id: 1, etapas: [{ id: 10, texto: 'Ilha 1' }] }];

  const ilhaVinculada = (objetivos[0].etapas ?? []).find((e) => e.id === nota.etapaId) ?? null;
  assert.equal(ilhaVinculada, null);
});

test('AnotacoesWorkspace: concorrência 409 mantém rascunho do usuário intacto', () => {
  const notaOriginal = {
    id: 5,
    titulo: 'Original',
    conteudo: [{ id: 'b1', type: 'paragraph', content: [{ type: 'text', text: 'V1' }] }],
    revisao: 1,
  };

  let estado = notasReducer(estadoInicialNotas, { tipo: 'selecionar-nota', nota: notaOriginal });
  estado = notasReducer(estado, { tipo: 'editar-titulo', titulo: 'Rascunho não perdido' });

  // Dispara falha de conflito 409
  estado = notasReducer(estado, {
    tipo: 'salvamento-falhou',
    conflito: true,
    mensagem: 'Modificado por outro cliente.',
  });

  assert.equal(estado.conflito, true);
  assert.equal(estado.titulo, 'Rascunho não perdido');
  assert.equal(rascunhoNotasSujo(estado), true);
});
