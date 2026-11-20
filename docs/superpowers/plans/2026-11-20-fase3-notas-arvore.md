# Fase 3 — Notas e Árvore de Objetivos Implementation Plan

> **For agentic workers:** execute task by task in this session, preserving existing local changes. Tests precede production changes.

**Goal:** Persistir as notas diárias por usuário e substituir o carregamento encadeado da hierarquia por uma API consolidada.

**Architecture:** O Backend adiciona CRUD autenticado de notas e uma consulta da árvore em DTOs por usuário. A árvore será carregada em lote, sem alterar relacionamentos para EAGER. O Frontend usa `requisicaoAPI` e mantém uma única fonte de objetivos, etapas e tarefas compartilhada entre Painel e Ilhas.

**Tech Stack:** React, Vite, JavaScript, Node `node:test`, Java, Spring Boot, Spring Data JPA, Hibernate, MySQL e JUnit.

**Spec:** `docs/superpowers/specs/2026-11-20-fase3-notas-arvore-design.md` e solicitação da Fase 3 nesta conversa.

## Global Constraints

- Não executar SQL/migrações nem operações destrutivas.
- Não descartar alterações locais nem alterar regras aprovadas.
- Cada nota pertence exclusivamente ao usuário autenticado.
- Não criar categoria, limite ou campo além dos dados já usados pela interface (`texto`, `concluida`).
- A árvore preserva a estrutura Objetivo → Ilha/Etapa → Tarefa, status, progresso derivado e prazo opcional.
- Nenhuma coleção será alterada para `FetchType.EAGER`.
- As anotações do módulo de aprendizagem das Ilhas permanecem inalteradas.

## Review Focus

- Usuário tenta consultar/editar/excluir nota alheia — serviços devem restringir consultas pelo usuário autenticado e testes afirmam não exposição nem mutação.
- Usuário não tem notas — API retorna lista vazia e interface mantém estado vazio útil.
- API de notas falha — texto digitado permanece e a interface não anuncia gravação concluída.
- Objetivos sem etapas e etapas sem tarefas — árvore preserva pais e listas vazias sem duplicação.
- Prazo/status — DTOs mantêm valores originais, sem conversão de data civil nem perda de conclusão.

## Task 1: Contrato e testes de Notas no Backend

**Files:**

- Test: `Farol-Backend/src/test/java/com/farol/farol_backend/service/NotaServiceTest.java`
- Test: `Farol-Backend/src/test/java/com/farol/farol_backend/controller/NotaControllerTest.java`
- Create: DTOs de entrada e resposta em `src/main/java/com/farol/farol_backend/dto/`
- Create: `src/main/java/com/farol/farol_backend/model/Nota.java`
- Create: `src/main/java/com/farol/farol_backend/repository/NotaRepository.java`
- Create: `src/main/java/com/farol/farol_backend/service/NotaService.java`
- Create: `src/main/java/com/farol/farol_backend/controller/NotaController.java`
- Create, only after schema check: `src/main/resources/db/manual/V4__criar_tabela_notas.sql`

**Interfaces:**

- `GET /api/notas` lists only authenticated user's notes.
- `POST /api/notas` accepts the existing note fields and returns the saved note.
- `PUT /api/notas/{id}` updates only a note owned by the authenticated user.
- `DELETE /api/notas/{id}` removes only a note owned by the authenticated user.

- [x] Add tests for create/list/update/delete and isolation, including other-user access attempts.
- [x] Run focused tests and confirm expected red failures.
- [x] Inspect the configured MySQL schema read-only; `notas` is absent. Add only an additive manual script and never apply it.
- [x] Implement entity/DTO/repository/service/controller following repository patterns.
- [x] Run focused tests and full `mvn verify` (16 tests passed); live note persistence requires the pending manual table migration.

## Task 2: Notas do Frontend

**Files:**

- Test: `src/dashboard/notasApi.test.js`
- Test: `src/dashboard/objectiveTree.test.js`
- Test: `src/dashboard/sessionVersion.test.js`
- Create: `src/dashboard/sessionVersion.js`
- Modify: `src/dashboard/useDadosDashboard.js`
- Modify: `src/App.jsx` only if state/actions must be passed differently
- Modify: `src/pages/Painel/Notas.jsx`
- Modify: `src/pages/Painel.css` only for necessary state presentation

**Interfaces:**

- The shared dashboard hook loads and mutates notes through `requisicaoAPI`.
- Existing visible note text and completion control remain intact.

- [x] Add focused tests for API loading, create/update/delete, and failed operations.
- [x] Run focused tests and confirm expected red failures.
- [x] Implement the API adapter and loading/error/empty/success UI states; prevent duplicate submissions and retain drafts on error.
- [x] Run frontend tests (12 passed), changed-file lint, targeted format check, and production build. Full-repository lint and format checks still report existing issues outside this work; see completion report.

## Task 3: Contract and tests for the consolidated objective tree

**Files:**

- Test: Backend service/controller tests under `src/test/java/com/farol/farol_backend/`
- Create: tree response DTOs under `src/main/java/com/farol/farol_backend/dto/`
- Modify: `ObjetivoRepository.java`, or add focused repository query interfaces as needed
- Modify: `ObjetivoService.java`, `ObjetivoController.java`

**Interfaces:**

- `GET /api/objetivos/arvore` returns only the authenticated user's hierarchy with current fields and ordered child lists.

- [x] Add tests for parent ownership, empty child collections, hierarchy integrity, status, and task prazo.
- [x] Run focused tests and confirm expected red failures.
- [x] Implement batched loading and DTO assembly, avoiding collection fetch-join cartesian duplication and N+1.
- [x] Verify the tree uses a fixed set of bulk queries (objectives, stages, tasks), independent of objective/island count.
- [x] Run backend tests/build through `mvn verify`.

## Task 4: Frontend tree integration and regression validation

**Files:**

- Test: dashboard data mapping tests
- Modify: `src/dashboard/useDadosDashboard.js`
- Modify: existing consumers only if response shape requires a localized adapter (`src/pages/Ilhas.jsx`, `src/pages/Painel.jsx` and calendar components)

- [x] Add a failing test for the consolidated response mapping and preservation of status/prazo.
- [x] Replace nested GET loading with one `GET /objetivos/arvore`, retaining the existing shared dashboard state.
- [x] Run frontend tests, changed-file lint, targeted format check, and production build; full-repository lint/format have pre-existing failures.
- [x] Run backend tests and package build; cross-repo contract checks pass. Live note persistence still requires manual migration and local MySQL/API/browser validation.
- [x] Review scope: Phase 1/2 flows and Islands learning notes were preserved.

## Completion Report

Record changed files, endpoints, manual SQL pending, query strategy, exact test/build results, remaining manual UI/API checks, and unresolved environment limitations. Do not begin Phase 4.

### Execution results (2026-11-20)

- Backend: `mvn verify` passed, 16 tests, 0 failures/errors/skips; package build succeeded.
- Frontend: `npm.cmd run test` passed (12 tests); changed-file ESLint and targeted Prettier checks passed; `npm.cmd run build` succeeded. A session-version guard prevents late note responses from repopulating state after logout.
- Full frontend `npm.cmd run lint` remains red on 48 repository-wide findings, and `npm.cmd run format:check` reports many existing files outside the Phase 3 scope. These were not changed as unrelated cleanup.
- MySQL was inspected read-only. `notas` is absent, so `src/main/resources/db/manual/V4__criar_tabela_notas.sql` is pending manual application; no migration or DDL was executed.
- Before release, manually apply V4 in the intended database, start both local servers, then verify note CRUD across refresh and user isolation, plus Dashboard/Ilhas/tree/calendar regression flows in a browser. No live MySQL-backed note CRUD or browser visual validation was possible in this session.
- Phase 3 remains pending that manual database/application validation. Phase 4 was not started.
