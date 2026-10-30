# Repository Guidelines

## Project Structure & Module Organization

This repository is a React 19 single-page app built with Vite. Application code lives in `src/`: page-level screens are under `src/pages/`, shared UI under `src/components/`, and dashboard and objective logic under `src/dashboard/` and `src/objetivos/`. The Islands roadmap has its own folder at `src/pages/Ilhas/`; its data and editing guidance are in `data.js` and `docs/ILHAS-E-ROADMAP.md`. Static images and icons belong in `public/`. There is currently no test directory or test framework configured.

## Build, Test, and Development Commands

Run commands from the repository root:

- `npm install` installs dependencies.
- `npm run dev` starts the Vite development server.
- `npm run build` creates the production bundle in `dist/`.
- `npm run preview` serves the built bundle locally for review.
- `npm run lint` checks JavaScript and JSX with ESLint.
- `npm run format:check` checks formatting with Prettier.
- `npm run fix` applies ESLint fixes and formats files; review its changes before committing.

No automated test command is configured. For UI changes, run the app locally and check the affected screen at relevant viewport sizes.

## Coding Style & Naming Conventions

Use JavaScript and JSX with React functional components and hooks. Follow the existing two-space indentation, single-quoted JavaScript strings, and semicolon style; Prettier is the formatting source of truth. Use PascalCase for React component filenames and names (for example, `RoadmapCanvas.jsx`), camelCase for functions and variables, and descriptive CSS class names consistent with nearby files. Keep page-specific styles next to their page. Add concise comments only when a non-obvious decision needs explanation.

## Testing Guidelines

There is no test framework or coverage threshold yet. Before submitting, run `npm run lint`, `npm run format:check`, and `npm run build`. Manually verify changed interactions in the browser, especially drag, selection, and responsive behavior on the Islands map.

## Commit & Pull Request Guidelines

Recent history uses short, direct commit subjects, often in Portuguese (for example, `Configure ESLint and Prettier automation`). Keep each commit focused and describe the change in a concise imperative phrase. Pull requests should explain the user-facing change, list relevant checks, link an issue when available, and include screenshots for visual changes.
