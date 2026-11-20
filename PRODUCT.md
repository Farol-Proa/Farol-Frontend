# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Pessoas entre aproximadamente 15 e 40 anos que:
- Têm dificuldade para estruturar e organizar seus objetivos pessoais, acadêmicos ou profissionais.
- Não sabem por onde começar e sentem sobrecarga ao encarar metas grandes.
- Enfrentam procrastinação e dificuldade para manter uma rotina e acompanhar seu progresso diário.
- Precisam de uma experiência acolhedora, clara e simples para desmembrar ambições em passos concretos.

## Product Purpose

O Farol é uma plataforma digital cujo propósito é transformar metas grandes e intimidadoras em etapas organizadas e tarefas menores, práticas e executáveis.
O sucesso para o usuário significa sair de uma sensação de paralisia ou deriva para um estado de clareza, direção e tração contínua na direção dos seus horizontes.

Slogan: *"Farol que ilumina o seu caminho."* / *"Menos à deriva. Mais perto do seu horizonte."*

## Positioning

Diferente de gerenciadores de tarefas genéricos (como listas to-do áridas ou quadros kanban corporativos excessivamente complexos), o Farol ancora o progresso em uma metáfora náutica espacial:
- **Objetivo → Etapas (Ilhas) → Tarefas**.
- O avanço é visualizado como uma rota de navegação guiada por um Farol em um mapa interativo de Ilhas conectadas, traduzindo esforço cognitivo em uma jornada visual tangível e motivadora.

## Operating Context

- **Ambiente de uso:** Navegador web (desktop prioritário para planejamento visual com mapa de Ilhas; navegação responsiva em telas menores).
- **Rituais de uso:**
  - *Planejamento & Estruturação:* Criação de um novo objetivo, desdobramento em etapas (Ilhas) e definição das tarefas de cada ilha.
  - *Acompanhamento Diário / Semanal:* Acesso ao Painel para checar o progresso geral da jornada, revisar tarefas da semana, consultar anotações e marcar tarefas concluídas.
  - *Navegação na Rota:* Exploração visual e espacial pelo mapa de Ilhas (canvas interativo) para celebrar conquistas de etapas concluídas e identificar o próximo passo.

## Capabilities and Constraints

### Capacidades Confirmadas:
- **Autenticação Segura:** Cadastro, login com JWT, confirmação de conta por e-mail transacional e fluxo de recuperação de senha por link temporário com invalidação de versão de segurança.
- **Hierarquia Funcional:** Cadastro e exclusão de Objetivos, criação e edição de Etapas, criação, alternância de conclusão e exclusão de Tarefas.
- **Mapa Visual Interativo:** Renderização de rota em canvas interativo (React Flow) com nós de farol e ilhas, estado visual de progresso (concluído, em andamento, travado) e persistência de posições no navegador.
- **Painel Centralizado:** Cálculo em tempo real do percentual de conclusão da jornada baseado nas tarefas reais concluídas; lista de tarefas agregada por etapa e objetivo.

### Restrições Técnicas:
- **Arquitetura Desacoplada:** Frontend React 19 (Vite) consumindo API REST Spring Boot (Java 25) sobre banco de dados relacional MySQL. O frontend nunca acessa dados diretamente.
- **Fonte da Verdade:** O backend é a fonte absoluta de integridade, autenticação e permissões.

### Modelo de Planos e Assinaturas (Confirmado):
- **Modelo Freemium:**
  - *Plano Gratuito:* Anotações, atividades com prazos, calendário, acompanhamento de progresso e desdobramento de objetivos em Ilhas.
  - *Plano Premium:* R$ 14,90/mês ou R$ 99,00/ano. Inclui todos os recursos do gratuito + temas personalizados, backup automático e mentoria com profissionais voluntários.
  - *Status da integração técnica:* Preços e periodicidade confirmados; gateway de pagamentos e webhooks a definir pela equipe antes da implementação.

### Módulo de Mentorias (Confirmado):
- Benefício exclusivo do plano Premium com profissionais voluntários.
- Painel exclusivo do mentor (autenticação separada) para gerenciar rotina, visualizar mentorados vinculados, acompanhar frequência e evolução, manter contato direto e organizar grade de horários.
- Controle de pacotes de sessões, prazos e reagendamentos com validação estrita no backend.

### Tarefas e Calendário (Diretriz Técnica Confirmada):
- Tarefas podem ter um prazo opcional; tarefas sem prazo continuam válidas. Quando definido, o prazo deve ser refletido no calendário do usuário.
- A Fase 2 implementou `prazo` como `LocalDate` no backend e integrou criação, edição e limpeza do prazo nas Ilhas com a visualização no calendário. O script SQL é manual; cada ambiente deve confirmar a coluna antes de aplicá-lo.

## Brand Commitments

- **Identidade e Nomenclatura:** Nome "Farol". Metáforas oficiais obrigatórias: Farol (ponto de partida / guia do objetivo), Ilhas (etapas do caminho) e Tarefas (ações práticas).
- **Voz e Tom:** Encorajador, claro, sóbrio e orientador. Evita pressão punitiva de produtividade tóxica ou infantilização excessiva; prioriza acolhimento ("Seu espaço, seu ritmo").
- **Identidade Visual Existente:**
  - Paleta base: Fundo escuro contemplativo (mar/noite: tons ardósia e azul petróleo escuro como `#0a0e17`, `#111622`), contrastando com amarelo quente/dourado de iluminação do farol (`--farol-primary`, `--farol-accent`).
  - Símbolos: Farol, faíscas/centelha (`sparkles`), chamas de consistência, nós de ilhas em relevo com anéis de progresso.

## Evidence on Hand

- **Código Frontend:** Telas funcionais em `src/pages/` (`LandingPage.jsx`, `Autenticacao.jsx`, `Painel.jsx`, `Ilhas.jsx`).
- **Ativos Visuais Reais:** Imagens em `public/images/` (`hero_farol.png`, `hero_objetivo.png`, `foto-da-home.png`, ícones svg).
- **Regras de Negócio e Contexto:** Arquivo de diretrizes do time em `.agents/skills/farol-project-context/SKILL.md`.
- **Backend:** Controladores e serviços REST operacionais em `Farol-Backend` (`UsuarioController`, `ObjetivoController`, `EtapaController`, `TarefaController`).
- **Ausências Reais (não fabricar):** Sem depoimentos de clientes reais cadastrados, sem catálogo de mentores, sem tabelas de preços/planos no banco.

## Product Principles

1. **Iluminar sem complicar:** A ferramenta deve diminuir a carga cognitiva do usuário, nunca adicionar fricção burocrática ou complexidade desnecessária para gerenciar a vida.
2. **Progresso fundamentado na realidade:** Métricas e percentuais de conclusão devem sempre refletir tarefas reais persistidas no sistema, sem cálculos artificiais ou dados mockados.
3. **Consistência e sincronia entre visões:** O que é alterado no mapa de Ilhas reflete imediatamente no Painel e vice-versa, mantendo o usuário ancorado em uma verdade única.
4. **Metáfora como guia, não obstáculo:** Os elementos visuais náuticos (Farol, Ilhas, Rotas) servem para dar clareza espacial e motivação, mantendo usabilidade fluida e direta.
5. **Evolução em fases:** Primeiro garantir consistência, acabamento e confiabilidade nas telas fundamentais (Painel, Ilhas, Autenticação) antes de expandir para módulos comerciais (Planos) ou de serviços (Mentorias).

## Accessibility & Inclusion

- Navegação acessível por teclado na barra lateral e botões de ação com rótulos `aria-label` adequados.
- Contraste legível sobre fundos escuros, preservando legibilidade de textos secundários e estados de foco nos formulários.
- Interfaces com feedback claro de estados de carregamento e mensagens de erro compreensíveis.
