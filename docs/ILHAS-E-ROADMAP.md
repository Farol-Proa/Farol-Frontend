# Guia de edição: Ilhas e roadmap

Este guia aponta onde alterar o mapa de ilhas sem precisar conhecer toda a aplicação. A tela é feita com dados locais em JavaScript e componentes React; não há banco de dados ligado a esse mapa.

## Onde cada coisa fica

| O que você quer mudar | Arquivo principal |
| --- | --- |
| Nome, posição, progresso e ícone das ilhas; conexões; cartões de objetivos | `src/pages/Ilhas/data.js` |
| Desenho SVG e conteúdo visual de cada ilha | `src/pages/Ilhas/IslandNode.jsx` |
| Farol ilustrado, linhas que conectam as ilhas, arraste, zoom e enquadramento | `src/pages/Ilhas/RoadmapCanvas.jsx` |
| Fundo, cores, grade, tamanhos visuais e comportamento responsivo | `src/pages/Ilhas.css` |
| Título, subtítulo, usuário e faixa de objetivos | `src/pages/Ilhas.jsx` |
| Lista de ícones que podem ser usados | `src/components/Icon.jsx` |
| Itens e aparência do menu lateral | `src/components/Sidebar.jsx` e `src/components/Sidebar.css` |
| Troca entre o painel e a tela Ilhas | `src/App.jsx` |
| Imagem do farol | `public/images/lighthouse-island.png` |

## Dados de uma ilha

As ilhas comuns estão no array `initialIslands`, em `src/pages/Ilhas/data.js`. Cada objeto segue este formato:

```js
{
  id: 'frontend',
  title: 'Frontend',
  category: 'Estudar fundamentos',
  status: 'done',
  completed: 10,
  total: 10,
  icon: 'layout',
  x: 780,
  y: 40,
  tag: 'Opcional',
}
```

- `id` é a chave interna da ilha. Deve ser única, sem espaços, e é usada pelas conexões. Se mudar um `id`, atualize também cada conexão que o usa.
- `title` e `category` são os textos exibidos no cartão.
- `status` aceita `done`, `progress` ou `locked`. O status define a etiqueta e também a cor da conexão que chega à ilha.
- `completed` e `total` alimentam a barra e o contador. Mantenha `total` maior que zero e `completed` entre zero e `total`.
- `icon` é um nome existente em `src/components/Icon.jsx`, como `braces`, `database`, `layout`, `users` ou `rocket`.
- `x` e `y` são a posição inicial no espaço do mapa, em unidades do próprio mapa. Não são coordenadas da tela. O botão de enquadramento ajusta o zoom para mostrar os nós existentes.
- `tag` é opcional. Se removido, a etiqueta pequena acima do cartão não aparece.

## Criar, apagar ou reorganizar ilhas

Para criar uma ilha, inclua um novo objeto em `initialIslands` com um `id` único, posição, status e os demais dados. Os cartões são renderizados automaticamente a partir desse array. O contador no mapa também usa seu tamanho; não é preciso atualizar um total separado.

Para apagar uma ilha comum, remova seu objeto de `initialIslands` e remova de `routes` todas as conexões que mencionam aquele `id`. Uma conexão com uma ponta inexistente não pode ser desenhada.

Para mudar a posição inicial, altere `x` e `y` no objeto. Arrastar uma ilha na tela altera a posição somente no estado temporário do React. Essa posição volta ao valor de `data.js` quando a tela é fechada ou recarregada; o arraste ainda não salva dados.

O tamanho-base dos cartões fica em `NODE_WIDTH` e `NODE_HEIGHT`, no mesmo `data.js`. Se alterar a altura, ajuste também `min-height` de `.island-node` em `Ilhas.css` para manter o cálculo do enquadramento coerente com o desenho.

## Conectar as ilhas

`routes`, em `data.js`, é uma lista de pares `[origem, destino]`. Cada par desenha uma curva entre os centros dos dois nós:

```js
export const routes = [
  ['farol', 'logica'],
  ['logica', 'backend'],
  ['logica', 'frontend'],
];
```

Os dois valores precisam corresponder a um `id` de ilha ou ao id especial `farol`. Para mudar o caminho, altere os pares. Para criar uma bifurcação, adicione mais de uma conexão com a mesma origem. A curva é calculada automaticamente em `RoadmapCanvas.jsx`.

A cor de cada linha acompanha o status do **destino**: concluída usa amarelo, em andamento usa azul claro e bloqueada usa branco fraco. Essas cores estão no trecho que calcula `color` e `opacity` dentro do desenho de `routes` em `RoadmapCanvas.jsx`.

## Farol especial

O farol grande não está dentro de `initialIslands`: ele é um nó especial com imagem. Sua posição, id e dimensões ficam em `LIGHTHOUSE`, em `data.js`; a imagem fica em `public/images/lighthouse-island.png`; e a renderização está no bloco `lighthouse-node` de `RoadmapCanvas.jsx`.

Para trocar a imagem, substitua o arquivo mantendo o mesmo caminho e nome. Para mudar o tamanho, altere `width` e `height` em `LIGHTHOUSE`. O tamanho é usado tanto para desenhar as conexões a partir do centro do farol quanto para o botão de enquadramento.

Para remover o farol, procure todas as referências a `LIGHTHOUSE` em `RoadmapCanvas.jsx`: elas inicializam sua posição, identificam seu tamanho e controlam seu arraste/seleção. Remova também o bloco `lighthouse-node` e a conexão de `routes` que parte de `farol`. Só apagar o objeto `LIGHTHOUSE` do arquivo de dados deixaria essas referências sem destino.

## Formato dos cartões de ilha

Os formatos irregulares estão no array `islandShapes`, em `IslandNode.jsx`. Cada item é um caminho SVG (`d`) dentro de uma área de 100 por 100. Os caminhos usam comandos SVG: `M` inicia o desenho, `C` cria curvas e `Z` fecha a forma.

Hoje o formato é escolhido pela posição da ilha no array: os três formatos se repetem em ciclo. Editar uma string altera o formato usado por todas as ilhas que recebem aquele índice. Para acrescentar um formato, inclua outro caminho no array; a alternância das formas acompanha automaticamente o novo tamanho do array.

O caminho tem duas camadas: `.island-shore` em `Ilhas.css` forma a borda/sombra inferior, e `.island-fill` pinta a ilha. A classe `.island-node.selected` muda a borda para amarelo quando a ilha está selecionada.

## Progresso, status e cartões de objetivos

O progresso do cartão de ilha é calculado por `completed / total` em `IslandNode.jsx`. Os textos dos status ficam em `statusLabel`, no mesmo arquivo; os selos e suas cores ficam nas classes `.island-status-*` de `Ilhas.css`.

O barco é colocado sobre a primeira ilha com `status: 'progress'`, no `RoadmapCanvas.jsx`. Se houver mais de uma ilha em andamento, os cartões ainda funcionam, mas o barco aparece apenas junto da primeira.

Os cartões inferiores são dados separados no array `goals`, em `data.js`. Seus campos `title`, `description`, `completed`, `total` e `active` controlam o conteúdo, a barra e o destaque em `Ilhas.jsx`. Esses valores são demonstrativos e não são calculados a partir das etapas das ilhas. O botão “Novo mapa” e os cartões também são apenas visuais neste momento.

## Cores, grade e aparência

No começo da regra `.roadmap-canvas`, em `Ilhas.css`, estão os controles mais diretos para as cores:

```css
--roadmap-background: #0a1030; /* fundo da área do mapa */
--roadmap-grid-line: rgb(174 188 255 / 0.12); /* cor e transparência das linhas */
```

Altere o primeiro valor para mudar o fundo e o segundo para mudar a grade. A transparência é o último valor entre `0` (invisível) e `1` (opaco). O espaçamento entre as linhas fica na constante `GRID`, em `RoadmapCanvas.jsx`; atualmente é `50` unidades antes do zoom.

As cores das ilhas (`.island-fill`, `.island-shore`), textos, cartões e pontos de destaque ficam nas demais regras de `Ilhas.css`. As cores das linhas de conexão ficam no código do mapa, como descrito acima.

## Ícones e navegação

`icon` usa um nome de `desenhos` em `src/components/Icon.jsx`. Para usar outro ícone, escolha um nome já listado. Para criar um, adicione outro desenho SVG ao objeto `desenhos` e use seu nome em `data.js`.

Os itens da sidebar ficam no array `itensNavegacao`, em `src/components/Sidebar.jsx`. A troca para a tela do mapa depende do texto `Ilhas` em `src/App.jsx` e da propriedade `activeItem` em `src/pages/Ilhas.jsx`. Se mudar o nome desse item, mantenha esses pontos sincronizados.

## Interações e limites atuais

`RoadmapCanvas.jsx` controla pan (arrastar o fundo), arrastar ilhas, seleção, zoom pela roda, botões de zoom e enquadramento inicial. Os limites do zoom ficam em `MIN_SCALE` e `MAX_SCALE`. Em geral, para trocar conteúdo, edite `data.js`; mexa no canvas apenas quando quiser mudar o comportamento das interações ou o desenho das conexões.

As posições arrastadas e a seleção existem apenas enquanto a tela está montada. A lista de ilhas, conexões e objetivos é fixa no código, sem salvamento permanente ou integração com os objetivos do painel.
