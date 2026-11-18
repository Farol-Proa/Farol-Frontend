# Guia: conectar o conteúdo das ilhas a um backend

Este guia descreve a migração da interface de aprendizagem das ilhas para uma API. O objetivo é manter a página e os componentes React: o backend fornece e persiste dados; o frontend continua responsável pela apresentação.

## Estado atual

- `src/pages/Ilhas/learningData.js` contém conteúdo demonstrativo e `getIslandLearning(island)` fornece conteúdo pelo ID.
- `src/pages/Ilhas/learningRepository.js` persiste progresso e anotações no `localStorage`.
- `src/pages/Ilhas/IslandLearningPanel.jsx` apresenta o conteúdo e chama as funções de repositório.
- `src/pages/Ilhas.jsx` abre o painel e projeta o progresso no roadmap.

Os IDs das ilhas vêm do roadmap. Um roadmap criado pelo servidor precisa fornecer IDs estáveis para ilhas, tópicos, tarefas, quizzes e questões.

## Contrato de dados recomendado

O conteúdo é compartilhável e não carrega progresso do usuário:

```json
{
  "id": "ilha-id",
  "roadmapId": "roadmap-id",
  "title": "Fundamentos",
  "description": "Descrição curta",
  "topics": [{
    "id": "topico-id",
    "title": "Conceito",
    "description": "Resumo",
    "required": true,
    "sections": [{ "id": "secao-id", "title": "Introdução", "content": "Texto" }],
    "references": [{ "id": "ref-id", "title": "Documentação", "url": "https://example.org", "type": "documentation" }],
    "quiz": {
      "id": "quiz-id",
      "required": false,
      "passingScore": 70,
      "questions": [{ "id": "pergunta-id", "prompt": "Pergunta?", "options": ["A", "B"], "correctIndex": 0, "explanation": "Explicação" }]
    }
  }],
  "tasks": [{ "id": "tarefa-id", "title": "Praticar", "description": "Opcional", "topicId": "topico-id", "required": false }]
}
```

O servidor deve validar os dados recebidos, inclusive URLs e IDs únicos. Para quizzes avaliados, não envie `correctIndex` nem explicações ao navegador antes da submissão; mantenha as respostas corretas no servidor e crie endpoints de tentativa e resultado. Os dados de exemplo atuais incluem respostas corretas no cliente e servem apenas para demonstração.

O progresso deve ser separado do conteúdo e associado a usuário e roadmap, por exemplo:

```json
{
  "userId": "usuario-id",
  "roadmapId": "roadmap-id",
  "islandId": "ilha-id",
  "topics": { "topico-id": { "status": "completed", "quizPassed": true, "bestScore": 90 } },
  "completedTasks": ["tarefa-id"],
  "status": "in_progress",
  "completedAt": null
}
```

Anotações devem ser registros distintos com `id`, `userId`, `roadmapId`, `islandId`, `topicId` opcional, `content`, `createdAt` e `updatedAt`.

## Passo a passo de implementação

1. **Defina a API e as permissões.** Combine autenticação, isolamento por usuário, formato de erros e identificadores. Não aceite `userId` do corpo como prova de identidade: o backend deve obtê-lo da sessão/token.
2. **Implemente conteúdo.** Crie endpoints de leitura, por exemplo `GET /roadmaps/:roadmapId/islands/:islandId`. Se conteúdo for criado por IA, valide-o no servidor antes de persistir/servir. IA retorna dados estruturados, nunca componentes ou CSS.
3. **Implemente progresso.** Crie leitura e atualização idempotente do progresso do usuário, por exemplo `GET` e `PUT /me/roadmaps/:roadmapId/islands/:islandId/progress`. Calcule estado concluído no servidor com base nos tópicos obrigatórios e quizzes obrigatórios. Tarefas só bloqueiam conclusão se marcadas como obrigatórias.
4. **Implemente tentativas de quiz.** Receba IDs das questões e respostas escolhidas; o servidor corrige, aplica `passingScore`, registra tentativa e retorna pontuação, aprovação e feedback seguro. Permita novas tentativas.
5. **Implemente anotações.** Forneça listar/criar/editar/excluir sob escopo autenticado, com associação ao roadmap/ilha/tópico e validação de tamanho.
6. **Crie clientes de serviço no frontend.** Em `src/services/`, use `requisicaoAPI` (já existente em `src/services/api.js`) para métodos de conteúdo, progresso e notas. Preserve uma interface semelhante à do repositório local para reduzir mudanças nos componentes.
7. **Troque a origem de conteúdo.** Faça o serviço buscar e validar a resposta da API. Durante desenvolvimento, mantenha fixture isolada como fallback explícito; não misture mocks com JSX.
8. **Troque persistência.** `IslandLearningPanel` não deve ler/escrever `localStorage` diretamente. Ele chama serviços; serviços tratam API, erros e estado otimista quando necessário. Trate loading, falha, retry e conflito de atualização.
9. **Sincronize o roadmap.** `Ilhas.jsx` deve consumir o progresso retornado pelo serviço como fonte única. Ao atualizar progresso, atualize o estado compartilhado e projete `status`, `completed` e `total` nas ilhas enviadas a `RoadmapCanvas`. Ao reabrir, recarregue ou use cache sincronizado.
10. **Migre os dados locais se necessário.** Se dados de demonstração precisarem ser preservados, implemente uma migração autenticada uma única vez; caso contrário informe que progresso/anotações locais não serão enviados. Não copie chaves do localStorage cegamente para outro usuário.
11. **Remova mocks e valide.** Depois de confirmar a API em ambiente de desenvolvimento, apague fixtures não utilizadas e rode lint/build; verifique permissões, estados vazios, falhas de rede, tentativas repetidas e duas contas distintas.

## O que retirar ou manter

- **`learningData.js`:** retire-o quando todas as ilhas tiverem conteúdo vindo da API e nenhum fallback local for necessário. Até lá, mantenha como fixture de desenvolvimento. A interface não precisa ser reescrita: substitua a origem por um `islandService` que retorne o mesmo formato normalizado.
- **`learningRepository.js`:** não remova antes de substituir chamadas de progresso e notas por serviços de API. Pode ser removido depois que nenhum componente depender dele. Alternativamente, mantenha-o como adaptador de desenvolvimento atrás da mesma interface do serviço remoto.
- **`IslandLearningPanel.jsx`:** mantenha. Ele é a página/interface do usuário e deve continuar recebendo dados e callbacks/ações abstratos, sem conhecer `localStorage`, SQL ou detalhes HTTP.
- **`Ilhas.jsx`:** mantenha o fluxo de seleção e o painel. Troque a origem de roadmap/progresso conforme os endpoints, preservando `selectedIslandId` e o canvas.

Não é necessário adicionar uma camada de abstração para cada tipo de dado. Um `islandService`, `progressService` e `noteService` são suficientes para separar rede e interface. O backend, banco e integração com IA ficam fora deste frontend.

## Prompt curto para uma IA implementar a etapa seguinte

> Integre a interface de aprendizagem das ilhas do Farol com a API existente. Preserve integralmente `IslandLearningPanel.jsx` e o fluxo visual ao selecionar/fechar uma ilha. Primeiro leia `docs/GUIA-BACKEND-CONTEUDO-ILHAS.md`, `src/services/api.js`, `src/pages/Ilhas.jsx`, `src/pages/Ilhas/learningData.js` e `src/pages/Ilhas/learningRepository.js`. Use os endpoints e autenticação já existentes; não invente endpoints sem conferir o backend. Crie serviços frontend para conteúdo, progresso e notas e injete esses serviços na tela. Não coloque chamadas HTTP ou localStorage nos componentes. Valide respostas, mantenha progresso separado do conteúdo, associe notas ao roadmap/ilha/tópico, apresente loading/erro/retry, e mantenha o roadmap sincronizado com uma única fonte de progresso. Não exponha respostas corretas do quiz ao cliente em produção: use submissão/correção no servidor. Não remova mocks até verificar que a API cobre os dados necessários; depois remova fixtures não usadas. Não altere páginas não relacionadas nem implemente backend neste repositório. Ao final, liste arquivos alterados, endpoints usados, premissas e verificações executadas.
