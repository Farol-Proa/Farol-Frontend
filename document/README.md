# Farol-Front

O front End de um site que tem como o objetivo ser um meio de organização do dia a dia e planejamento de curto a longo-prazo para pessoas sem norte

## Corrigir estilo e problemas automáticos

No terminal, na pasta do projeto, rode:

```sh
npm run fix
```

Esse comando aplica as correções automáticas do ESLint e formata os arquivos com Prettier. Para conferir sem alterar arquivos, use `npm run lint` e `npm run format:check`.

No VS Code, instale as extensões recomendadas pelo projeto. Os arquivos serão formatados e as correções do ESLint serão aplicadas ao salvar. A regra `@theme` pertence ao Tailwind CSS 4; a configuração do editor evita marcá-la como uma regra CSS desconhecida.
