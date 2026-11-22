# Instruções do frontend Farol

As instruções da raiz `../AGENTS.md` valem também aqui. Consulte `../docs/README.md` e a especificação relevante antes de alterar fluxos de produto.

- React + Vite; entrada em `src/main.jsx`, composição em `src/App.jsx`, telas em `src/pages/`, componentes compartilhados em `src/components/`, integração em `src/services/`.
- Use React Router para rotas e mantenha a navegação declarativa. Não introduza Next.js.
- Centralize HTTP em `src/services/api.js`; componentes não devem duplicar autenticação, URLs-base ou tratamento de resposta.
- Backend é fonte de verdade para mapas, conteúdo e progresso. Não persistir dados de usuário em `localStorage` como substituto da API.
- Use `@xyflow/react` para canvas. Persista posições/conexões via API; handles e edges devem preservar acessibilidade e seleção.
- Use FullCalendar Standard sem recursos Premium quando adotado. Sessões de calendário são distintas de prazos de tarefas.
- BlockNote é candidato preferido para notas; confirmar compatibilidade/licença no uso necessário antes de adicionar. Guardar conteúdo estruturado JSON.
- Siga componentes funcionais, hooks, convenções existentes e CSS próximo à tela; providencie estados de carregamento, erro e vazio, navegação por teclado e rótulos acessíveis.
- Testes existentes usam Node test runner; rode testes, lint e build relevantes após mudanças. Não formate nem corrija arquivos fora do escopo.
- Consulte `.agents/skills/farol-project-context/SKILL.md` e `farol-frontend/SKILL.md` quando presentes e pertinentes. Serena auxilia navegação; não substitui documentação aprovada.
