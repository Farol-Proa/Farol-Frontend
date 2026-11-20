---
name: farol-frontend
description: Orientações técnicas específicas do frontend Farol com React, Vite, JavaScript, CSS/Tailwind e integração REST. Use em tarefas no Farol-Front depois de ler farol-project-context.
---

# Farol Frontend

## Precedência

Leia primeiro `.agents/skills/farol-project-context/SKILL.md`. Esta Skill complementa o contexto do produto e não aprova, altera ou interpreta regras de negócio. Em conflito, informe os arquivos envolvidos e siga o contexto aprovado do Farol; se a decisão estiver pendente, peça definição à equipe.

## Stack e estrutura

- React 19, JavaScript e Vite.
- CSS personalizado e Tailwind CSS 4; siga os padrões já usados no arquivo e componente próximos.
- React Flow via `@xyflow/react` para o mapa de Ilhas.
- `src/pages/` contém páginas; componentes compartilhados ficam em `src/components/`; estado e lógica do Painel ficam em `src/dashboard/`; o mapa e os recursos das Ilhas ficam em `src/pages/Ilhas/`.
- Mantenha componentes funcionais e hooks coerentes com a estrutura existente. Evite adicionar dependências ou abstrações sem necessidade.

## UI, experiência e acessibilidade

- Preserve a identidade visual existente do Farol. Consulte `PRODUCT.md` e a interface próxima antes de escolher cores, tipografia, espaçamento ou linguagem.
- Mantenha formulários e interações responsivos, acessíveis por teclado e com estados claros de carregamento, sucesso, vazio e erro.
- Use rótulos acessíveis em controles sem texto visível e preserve foco visível e contraste.
- Use a Skill `impeccable` quando disponível e pertinente a UI/UX, hierarquia visual, responsividade ou acessibilidade. Primeiro confirme o arquivo/catálogo; não alegue uso sem consultar suas instruções.

## Estado e integração com a API

- O backend é a fonte de verdade. Não use fixtures ou estado local como substituto da API em produção.
- Reutilize `src/services/api.js` (`requisicaoAPI`) para chamadas REST, autenticação Bearer e tratamento de erros.
- Reutilize `src/dashboard/useDadosDashboard.js` para sincronização dos dados compartilhados entre Painel e Ilhas, respeitando o fluxo existente de recarga após gravações.
- Confira o controller e DTOs atuais do backend antes de assumir endpoint, campo ou formato. Preserve os contratos e os valores de data civil; não converta `YYYY-MM-DD` para timestamp sem requisito aprovado.
- Não duplicar cópias independentes de objetivos, Ilhas ou tarefas entre telas.

## Validação

- `npm run test` executa os testes Node configurados.
- `npm run lint`, `npm run format:check` e `npm run build` são verificações do projeto; informe resultados reais e não declare lint aprovado quando houver falhas.
- Para mudanças visuais, valide manualmente a tela e os tamanhos de viewport relevantes. Testes automatizados não substituem a revisão visual.
- Consulte `AGENTS.md` para comandos e convenções atualizados do repositório.
