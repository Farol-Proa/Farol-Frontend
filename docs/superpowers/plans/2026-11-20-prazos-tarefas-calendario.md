# Prazos de tarefas e calendário Implementation Plan

> **For agentic workers:** implement this plan task by task and keep the existing local changes intact.

**Goal:** Criar e editar prazos de tarefas nas Ilhas e exibir tarefas reais por data no calendário do Painel.

**Architecture:** O backend mantém `LocalDate` como fonte de verdade e expõe uma operação PATCH própria para atualizar ou limpar o prazo. O frontend preserva a data `YYYY-MM-DD` sem conversão para timestamp, recarrega os dados após gravações e usa a mesma lista de tarefas nas Ilhas e no Painel.

**Tech Stack:** React, Vite, Java 25, Spring Boot, Spring Data JPA, MySQL; testes JavaScript com `node:test` e testes Java existentes do Maven.

**Spec:** Solicitação de continuidade da Fase 2 nesta conversa.

## Global Constraints

- Não sobrescrever alterações locais anteriores.
- Tarefas sem prazo continuam válidas; `prazo` pode ser nulo.
- O MySQL permanece sob `ddl-auto=none`; a migração é manual e não será executada automaticamente.
- Datas de prazo são datas civis `LocalDate`, sem conversão UTC/local no frontend.
- Não criar dados fictícios nem duplicar tarefas no carregamento.

## Review Focus

- Prazo nulo na criação e na atualização limpa a data — coberto pelo contrato da operação e teste de serviço.
- Data `YYYY-MM-DD` permanece igual em fusos diferentes — coberto por testes unitários do helper.
- Alterações e conclusão continuam preservadas após recarregar — coberto pelos testes de serviço/API e validação integrada.
- Datas fora do dia selecionado não aparecem na lista do calendário — coberto pelo helper de filtragem.
- Falha de gravação não deve apresentar a alteração como persistida — coberto pelo tratamento de erro da interface.

---

### Task 1: Regras de data compartilhadas no frontend

**Files:**

- Create: `src/dashboard/taskDates.js`
- Create: `src/dashboard/taskDates.test.js`
- Modify: `package.json`

**Interfaces:**

- Produces: `mapearTarefa(tarefa)`, `filtrarTarefasPorPrazo(tarefas, prazo)` e `formatarPrazo(prazo)`.

- [x] Escrever testes `node:test` para preservar o prazo ISO, filtrar somente tarefas do dia selecionado e formatar a data sem deslocamento.
- [x] Executar `npm test` e confirmar falha pelos exports ausentes.
- [x] Implementar os helpers e o script `test` usando o test runner nativo do Node.
- [x] Executar `npm test` e confirmar aprovação.

### Task 2: Atualização de prazo na API

**Files:**

- Modify: backend `TarefaController.java`, `TarefaService.java`
- Create ou adaptar DTO de atualização de prazo no backend
- Test: backend service/controller tests

**Interfaces:**

- Consumes: `PATCH /api/tarefas/{id}/prazo`, body `{ "prazo": "YYYY-MM-DD" | null }`.
- Produces: resposta `TarefaRespostaDTO` com o prazo atualizado.

- [x] Criar testes para salvar uma data, limpar com `null`, manter o vínculo/usuário e devolver a tarefa atualizada.
- [x] Executar os testes direcionados antes da implementação e observar as falhas esperadas.
- [x] Implementar a atualização autenticada no service/controller sem alterar o endpoint de conclusão.
- [x] Executar os testes direcionados e a suíte do backend.

### Task 3: Criação e edição de prazo nas Ilhas

**Files:**

- Modify: `src/dashboard/useDadosDashboard.js`, `src/App.jsx`, `src/pages/Ilhas.jsx`
- Test: `src/dashboard/taskDates.test.js` e validação manual da interface

**Interfaces:**

- Produces: `adicionarTarefa(etapaId, { titulo, prazo })` e `atualizarPrazoTarefa(id, prazo)`.

- [x] Estender testes para mapear tarefa sem prazo como valor vazio e preservar valores ISO.
- [x] Enviar prazo opcional ao criar tarefa e adicionar controle de prazo editável por tarefa existente.
- [x] Atualizar dados após sucesso e mostrar erro sem apresentar gravação não confirmada.
- [x] Executar testes de frontend.

### Task 4: Calendário do Painel

**Files:**

- Modify: `src/pages/Painel/Calendario.jsx`, possivelmente `src/pages/Painel/Tarefas.jsx`
- Test: helpers de data e validação visual

- [x] Marcar dias usando `prazo` e listar as tarefas correspondentes à data selecionada.
- [x] Manter tarefas sem prazo fora dos dias do calendário e atualizar textos auxiliares.
- [ ] Verificar visualmente navegação de mês, seleção de data e estados sem tarefas.

### Task 5: Migração e validação integrada

**Files:**

- Revisar alterações locais do backend e `src/main/resources/db/manual/V3__adicionar_prazo_tarefas.sql`.

- [x] Confirmar se a coluna existe no banco antes de qualquer aplicação; nunca executar DDL automaticamente.
- [x] Executar `npm test`, `npm run lint`, `npm run format:check`, `npm run build` e testes do backend.
- [x] Validar criação com/sem prazo, edição/limpeza, calendário, conclusão e recarga pelos contratos e testes automatizados.
- [x] Registrar resultados e limitações de ambiente.
