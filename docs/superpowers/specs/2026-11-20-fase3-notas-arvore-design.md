# Fase 3: Persistência de Notas e Árvore de Objetivos

## Intenção

Persistir as notas diárias do Painel no MySQL vinculadas à conta autenticada e permitir que o Frontend obtenha Objetivos, Ilhas e Tarefas em uma resposta autenticada. A hierarquia e os dados exibidos continuam sendo os já existentes no Farol.

## Escopo

- CRUD de notas do Painel com os campos já usados pela interface: `texto` e `concluida`.
- Isolamento completo de notas por usuário autenticado.
- Endpoint `GET /api/objetivos/arvore`, com dados existentes de objetivos, etapas e tarefas, incluindo status e prazo.
- Migração SQL manual aditiva, caso a inspeção do schema confirme que a tabela de notas ainda não existe.
- Integração do Frontend pelo serviço `requisicaoAPI`, com estados claros e sem duplicar a fonte de dados.

## Fora de escopo

- Alterar as anotações do módulo de aprendizagem das Ilhas, que são outro recurso e usam armazenamento próprio.
- Criar categorias, limites, campos ou regras adicionais para notas.
- Executar migrações, apagar ou modificar dados existentes.
- Alterar preços, planos, limites de mapas, mentoria ou fluxos de IA.
- Remover os endpoints existentes de objetivos, etapas ou tarefas.

## Abordagem

As notas serão modeladas conforme o comportamento atual do Painel, sem propriedades de produto novas. O usuário será obtido da identidade autenticada no servidor; o cliente não escolherá o proprietário da nota. Os endpoints e Services limitarão leitura e mutações às notas desse usuário.

A árvore será montada em DTOs. A estratégia preferida é carregar objetivos do usuário, etapas dos objetivos e tarefas das etapas em consultas em lote (número de consultas fixo, sem uma consulta por pai), preservando ordenação e os campos atuais. Relacionamentos JPA não serão tornados EAGER. A implementação será validada contra o modelo real e os padrões de teste existentes antes de fixar o contrato.

No Frontend, o hook compartilhado manterá a árvore como fonte comum para Painel e Ilhas. A leitura passará a usar o endpoint consolidado; após mutações existentes, a recarga continuará refletindo a API. As notas serão carregadas e alteradas pela API, com estado de carregamento, erro recuperável e lista vazia.

## Migração e dados

O Backend usa `ddl-auto=none` e scripts SQL manuais. O dump `document/bancoFarol.sql` e uma consulta somente leitura ao MySQL local confirmaram que não há tabela `notas`; foi preparado um script manual aditivo. Nenhuma migração será executada nesta implementação. As notas diárias atuais são apenas estado em memória, portanto não há dados persistidos desse recurso a transferir. As notas do módulo de aprendizagem não serão tocadas.

## Verificação

- Testes de serviço/API para criar, listar, editar e excluir notas, incluindo isolamento entre usuários.
- Testes do endpoint da árvore para propriedade, hierarquia, status e prazo, sem duplicação.
- Testes do mapeamento e das ações do Frontend, incluindo erros e carregamento.
- Suítes automatizadas e builds dos dois repositórios.
- A validação com MySQL da tabela de notas depende da migração manual no ambiente de teste; não será alegada antes de ser executada.

## Aprovação

Direção aprovada pelo usuário em 2026-11-20 após apresentação do diagnóstico da Etapa 1. As decisões de implementação permanecem limitadas ao escopo acima.
