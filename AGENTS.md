# Repository Guidelines

## Orientação do Codex e Skills

Antes de qualquer tarefa no Farol, leia integralmente `.agents/skills/farol-project-context/SKILL.md`. Essa é a referência principal para contexto e decisões compartilhadas do produto. Em seguida, leia `.agents/skills/farol-frontend/SKILL.md` para orientações técnicas deste repositório.

Hierarquia: instruções do ambiente e deste `AGENTS.md` → `farol-project-context` → Skill técnica do Frontend → Skills complementares pertinentes. Uma Skill complementar não altera uma regra de produto aprovada. Ao encontrar conflito, descreva os arquivos e os trechos em conflito, siga a decisão aprovada no contexto Farol e peça decisão da equipe se a regra ainda estiver pendente.

Descubra Skills pelos arquivos `SKILL.md` existentes em `.agents/skills/` e pelas Skills listadas no catálogo do ambiente. Confirme o caminho e leia as instruções antes de dizer que uma Skill foi usada. Não suponha que uma Skill disponível no Front também exista no Backend ou em outro ambiente. Use `impeccable` quando a tarefa envolver UI/UX ou qualidade visual e as Skills de brainstorming, planejamento, testes, depuração e revisão conforme a necessidade.

## Project Structure & Module Organization

This repository is a React 19 single-page app built with Vite. Application code lives in `src/`: page-level screens are under `src/pages/`, shared UI under `src/components/`, and dashboard and objective logic under `src/dashboard/` and `src/objetivos/`. The Islands roadmap has its own folder at `src/pages/Ilhas/`; its data and editing guidance are in `data.js` and `docs/ILHAS-E-ROADMAP.md`. Static images and icons belong in `public/`. Native Node tests are kept beside the code, such as `src/dashboard/*.test.js`.

## Build, Test, and Development Commands

Run commands from the repository root:

- `npm install` installs dependencies.
- `npm run dev` starts the Vite development server.
- `npm run build` creates the production bundle in `dist/`.
- `npm run preview` serves the built bundle locally for review.
- `npm run lint` checks JavaScript and JSX with ESLint.
- `npm run test` runs the configured Node test suite.
- `npm run format:check` checks formatting with Prettier.
- `npm run fix` applies ESLint fixes and formats files; review its changes before committing.

For UI changes, run the app locally and check the affected screen at relevant viewport sizes.

## Coding Style & Naming Conventions

Use JavaScript and JSX with React functional components and hooks. Follow the existing two-space indentation, single-quoted JavaScript strings, and semicolon style; Prettier is the formatting source of truth. Use PascalCase for React component filenames and names (for example, `RoadmapCanvas.jsx`), camelCase for functions and variables, and descriptive CSS class names consistent with nearby files. Keep page-specific styles next to their page. Add concise comments only when a non-obvious decision needs explanation.

## Testing Guidelines

There is no coverage threshold configured. Before submitting, run `npm run lint`, `npm run format:check`, `npm run test`, and `npm run build`. Manually verify changed interactions in the browser, especially drag, selection, and responsive behavior on the Islands map.

## Commit & Pull Request Guidelines

Recent history uses short, direct commit subjects, often in Portuguese (for example, `Configure ESLint and Prettier automation`). Keep each commit focused and describe the change in a concise imperative phrase. Pull requests should explain the user-facing change, list relevant checks, link an issue when available, and include screenshots for visual changes.
