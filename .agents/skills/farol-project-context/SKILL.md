---
name: farol-project-context
description: Contexto arquitetural, regras de negócio, funcionalidades, monetização, mentorias e integrações do projeto Farol. Use sempre que trabalhar nos repositórios farol-frontend ou farol-backend.
---

# Farol Project Context

## 1. Objetivo desta skill

Esta skill contém o contexto técnico e funcional do projeto Farol.

Seu objetivo é garantir que agentes de IA, como Codex CLI e Antigravity, compreendam o funcionamento do sistema antes de realizar alterações.

O agente deve utilizar estas instruções como referência, mas sempre conferir o código atual dos repositórios antes de implementar qualquer funcionalidade.

**Regra fundamental:** preservar o projeto existente, respeitar as decisões da equipe e nunca inventar funcionalidades, endpoints, propriedades, preços ou regras de negócio.

---

## 2. Sobre o projeto Farol

O Farol é uma plataforma digital que ajuda pessoas a organizarem seus objetivos pessoais, acadêmicos e profissionais.

Sua proposta é transformar objetivos grandes e difíceis de alcançar em pequenas etapas organizadas e tarefas executáveis.

**Slogan:** Farol que ilumina o seu caminho.

### Público-alvo

Pessoas de aproximadamente 15 a 40 anos que:
- Têm dificuldade para organizar seus objetivos.
- Não sabem por onde começar.
- Procrastinam e têm dificuldade para manter uma rotina.
- Sentem dificuldade em dividir objetivos grandes em pequenas atividades.
- Precisam de orientação para acompanhar seu progresso.

### Proposta de valor

O Farol deve oferecer uma experiência simples, intuitiva e organizada, ajudando o usuário a encontrar um caminho para alcançar seus objetivos.

A plataforma não deve aumentar a complexidade da organização.

---

## 3. Conceito principal: Objetivos, Ilhas e Tarefas

A estrutura central do Farol segue esta hierarquia:

**Objetivo → Etapas (Ilhas) → Tarefas**

### Objetivo

Representa aquilo que o usuário deseja alcançar.

Exemplos:
- Conseguir um emprego na área de TI.
- Aprender inglês.
- Concluir a faculdade.
- Aprender programação.

### Etapas / Ilhas

Representam os passos necessários para alcançar um objetivo.

Exemplo:

Objetivo: Conseguir um emprego na área de TI.

Ilhas:
1. Aprender lógica de programação.
2. Estudar Java.
3. Aprender Spring Boot.
4. Desenvolver projetos.
5. Preparar o currículo.
6. Participar de processos seletivos.

As Ilhas devem ser apresentadas visualmente em um mapa ou roadmap, utilizando a implementação existente com React Flow.

### Tarefas

São atividades menores que pertencem a uma Ilha.

Exemplo:

Ilha: Estudar Java.

Tarefas:
- Estudar orientação a objetos.
- Praticar criação de classes.
- Desenvolver um pequeno projeto.
- Revisar os conteúdos estudados.

### Regras de relacionamento

- Um usuário possui seus próprios objetivos.
- Um objetivo pertence a um usuário.
- Um objetivo pode possuir várias etapas.
- Uma etapa pertence a um objetivo.
- Uma etapa pode possuir várias tarefas.
- Uma tarefa pertence a uma etapa.

Os dados devem respeitar os relacionamentos existentes no banco de dados.

---

## 4. Estrutura dos repositórios

O projeto é dividido em dois repositórios independentes.

### Repositório 1: farol-frontend

Responsável pela interface e interação com o usuário.

Tecnologias:
- React.
- JavaScript.
- Vite.
- Tailwind CSS.
- CSS personalizado.
- React Flow (`@xyflow/react`).

Responsabilidades:
- Apresentar páginas e componentes.
- Realizar navegação entre telas.
- Receber e validar informações dos formulários.
- Consumir os endpoints do backend.
- Exibir informações retornadas pela API.
- Atualizar visualmente os dados após operações.
- Apresentar mensagens de sucesso e erro.
- Manter a experiência responsiva e intuitiva.

### Repositório 2: farol-backend

Responsável pelas regras de negócio, segurança e persistência dos dados.

Tecnologias:
- Java.
- Spring Boot.
- Spring Security.
- Spring Data JPA.
- Hibernate.
- MySQL.
- API REST.

Responsabilidades:
- Disponibilizar endpoints REST.
- Validar informações recebidas.
- Executar regras de negócio.
- Autenticar e autorizar usuários.
- Garantir que cada usuário acesse somente seus próprios dados.
- Persistir informações no MySQL.
- Retornar respostas adequadas ao frontend.

### Regra de comunicação

O frontend não deve acessar o banco de dados diretamente.

Fluxo correto:

Frontend React → API REST → Spring Boot → JPA/Hibernate → MySQL.

---

## 5. Modelo de negócio: planos gratuitos e pagos

O Farol possui uma proposta de disponibilizar acesso gratuito e opções de planos pagos.

O objetivo é permitir que o usuário conheça e utilize a plataforma gratuitamente, com possibilidade de contratar recursos adicionais conforme as modalidades oferecidas pelo Farol.

### Plano gratuito

Deve permitir que o usuário utilize a plataforma e tenha acesso às funcionalidades previstas para a modalidade gratuita.

### Planos pagos

Devem oferecer benefícios ou recursos adicionais em relação ao plano gratuito.

Os benefícios exatos, limites de utilização, preços, periodicidade e quantidade de planos precisam ser confirmados na documentação atual do projeto e nas decisões da equipe.

### Regras obrigatórias para implementação

1. O usuário deve possuir uma modalidade de acesso identificável pelo sistema.
2. O backend deve ser responsável por validar quais recursos o usuário pode utilizar.
3. O frontend deve apresentar as funcionalidades disponíveis conforme as permissões retornadas pelo backend.
4. Não basta esconder um botão no frontend: as restrições precisam ser verificadas no backend.
5. A alteração de plano deve refletir corretamente as permissões do usuário.
6. O sistema deve preservar os dados do usuário caso ele altere ou perca um plano pago.
7. Não excluir objetivos, Ilhas, tarefas ou anotações apenas porque o usuário mudou de plano.
8. Não criar limitações artificiais sem autorização da equipe.

### Assinaturas e pagamentos

O projeto prevê integração com um provedor externo de pagamentos.

Antes de implementar essa integração:
- Identificar se já existe algum provedor escolhido.
- Verificar se existem contratos, endpoints ou configurações implementados.
- Identificar como o backend recebe a confirmação do pagamento.
- Verificar como o status da assinatura é atualizado.
- Garantir que a confirmação de pagamento seja validada pelo backend.
- Não confiar apenas no retorno enviado pelo navegador.
- Considerar notificações/webhooks do provedor.
- Não armazenar dados de cartão diretamente no Farol.
- Utilizar variáveis de ambiente para credenciais.

### Segurança das assinaturas

O backend deve ser a fonte de verdade para:
- Plano atual do usuário.
- Situação da assinatura.
- Período de validade.
- Permissões e benefícios.
- Alterações de plano.

Não permitir que o usuário consiga liberar funcionalidades pagas alterando o estado do React, parâmetros de requisição ou informações armazenadas no navegador.

### Atenção

Não inventar:
- Preços.
- Quantidade de planos.
- Limites de objetivos.
- Limites de tarefas.
- Recursos exclusivos.
- Períodos de teste.
- Regras de renovação ou cancelamento.

Quando essas informações não estiverem definidas no código ou na documentação, apresentar as dúvidas à equipe antes de implementar.

---

## 6. Mentorias

As mentorias são uma funcionalidade importante da proposta de valor do Farol.

A ideia é oferecer orientação para usuários que precisam de ajuda para organizar seus objetivos, encontrar caminhos e avançar em suas jornadas.

A mentoria deve complementar a organização individual oferecida pelas Ilhas, e não substituir o sistema de objetivos e tarefas.

### Objetivo da funcionalidade

Permitir que o usuário tenha acesso a orientação de pessoas que possam ajudá-lo em sua trajetória pessoal, acadêmica ou profissional.

### Aspectos funcionais a considerar

A funcionalidade pode envolver:
- Apresentação das mentorias disponíveis.
- Informações sobre mentores.
- Áreas de atuação e especialidades.
- Consulta de disponibilidade.
- Solicitação ou agendamento de mentorias.
- Acompanhamento de solicitações.
- Informações sobre encontros.
- Histórico de mentorias, quando previsto.

Esses itens são possibilidades funcionais que precisam ser comparadas com o planejamento e a implementação real da equipe.

### Integração com os planos

A disponibilidade de mentorias pode variar conforme a modalidade de acesso do usuário, caso essa seja a regra comercial definida pela equipe.

Antes de implementar:
- Identificar quais mentorias são gratuitas.
- Identificar quais mentorias são pagas.
- Verificar se existe cobrança por sessão ou inclusão em assinatura.
- Verificar se há regras específicas para agendamento e cancelamento.
- Identificar como o usuário acessa os serviços de mentoria.

Não presumir que todas as mentorias são pagas ou que estão disponíveis em todos os planos.

### Regras técnicas

- Proteger informações pessoais dos usuários e mentores.
- Validar agendamentos no backend.
- Evitar conflitos de horários, caso exista agenda.
- Garantir que somente usuários autorizados acessem os dados das mentorias.
- Não confirmar um agendamento sem persistência e validação no backend.
- Não inventar entidades ou endpoints antes de analisar o projeto.

---

## 7. Funcionalidades principais do sistema

### 7.1. Landing Page

Página inicial pública do Farol.

Responsabilidades:
- Apresentar a proposta da plataforma.
- Explicar como o Farol funciona.
- Apresentar seus recursos.
- Apresentar as modalidades de acesso, quando definidas.
- Direcionar o visitante para cadastro ou login.

### 7.2. Autenticação

Responsável pelo cadastro, login e gerenciamento de acesso.

Funcionalidades:
- Cadastro de usuário.
- Login.
- Verificação de e-mail.
- Recuperação de senha por e-mail.
- Redefinição de senha.
- Encerramento de sessão.

### 7.3. Painel / Início

É a central de acompanhamento do usuário.

Deve apresentar informações provenientes dos dados reais do backend:
- Minha Jornada: progresso geral dos objetivos.
- Minhas Ilhas: objetivos e seus respectivos progressos.
- Tarefas da Semana: atividades relacionadas aos objetivos.
- Calendário: visualização e organização de compromissos e tarefas.

### 7.4. Objetivos

Responsável pelo gerenciamento dos objetivos do usuário.

Funcionalidades esperadas:
- Listar objetivos.
- Criar objetivos.
- Consultar detalhes.
- Editar objetivos.
- Excluir objetivos.
- Exibir progresso.

### 7.5. Ilhas / Roadmap

Responsável por apresentar visualmente as etapas de cada objetivo.

Funcionalidades esperadas:
- Listar objetivos.
- Selecionar um objetivo.
- Exibir suas etapas.
- Criar etapas.
- Editar e excluir etapas, quando suportado pelo backend.
- Exibir tarefas de cada etapa.
- Atualizar progresso.
- Navegar pelo mapa utilizando React Flow.

### 7.6. Tarefas

Responsável pelo gerenciamento das atividades de cada etapa.

Funcionalidades:
- Criar tarefas.
- Listar tarefas.
- Marcar tarefas como concluídas.
- Desmarcar tarefas concluídas.
- Excluir tarefas.
- Atualizar o progresso da etapa e do objetivo.

### 7.7. Anotações, Calendário e Mentoria

São áreas complementares da plataforma.

Antes de implementar ou modificar qualquer uma delas, verificar quais funcionalidades já existem e quais estão efetivamente integradas ao backend.

### 7.8. Planos e assinaturas

Responsável pela apresentação das modalidades de acesso e gerenciamento da contratação de recursos pagos.

Deve respeitar as regras comerciais e de autorização definidas pela equipe.

---

## 8. Regras de progresso

O progresso deve ser calculado com base nas tarefas reais cadastradas.

- Cada tarefa concluída contribui para o progresso da etapa.
- O progresso da etapa deve considerar suas tarefas.
- O progresso do objetivo deve considerar as tarefas das suas etapas.
- O progresso geral deve considerar os objetivos do usuário, respeitando a fórmula adotada pela aplicação.

Exemplo:

Uma Ilha possui 4 tarefas:
- 2 concluídas.
- 1 em andamento.
- 1 não iniciada.

Progresso: 2 de 4 tarefas concluídas = 50%.

Cuidados:
- Não dividir por zero.
- Não considerar tarefas inexistentes como concluídas.
- Não criar valores fictícios.
- Evitar cálculos diferentes entre Painel e Ilhas.

---

## 9. Integração entre frontend e backend

A integração é uma das partes mais importantes do projeto.

O agente deve garantir que os dados exibidos no frontend representem os dados persistidos no banco.

### Endpoints conhecidos

Os seguintes caminhos foram utilizados ou identificados durante o desenvolvimento anterior.

São referências históricas e precisam ser conferidos nos Controllers atuais.

| Método | Endpoint conhecido | Finalidade |
|---|---|---|
| GET | `/api/objetivos` | Listar objetivos |
| POST | `/api/objetivos` | Criar objetivo |
| DELETE | `/api/objetivos/{id}` | Excluir objetivo |
| GET | `/api/objetivos/{objetivoId}/etapas` | Listar etapas |
| POST | `/api/objetivos/{objetivoId}/etapas` | Criar etapa |
| GET | `/api/etapas/{etapaId}/tarefas` | Listar tarefas |
| POST | `/api/etapas/{etapaId}/tarefas` | Criar tarefa |
| PATCH | `/api/tarefas/{id}/conclusao` | Atualizar conclusão |
| DELETE | `/api/tarefas/{id}` | Excluir tarefa |

Não inventar endpoints para assinaturas, pagamentos ou mentorias. Primeiro verificar o que já existe.

### Regras obrigatórias

- Utilizar o serviço centralizado de requisições existente no frontend.
- Respeitar métodos HTTP e contratos.
- Não inventar propriedades de DTOs.
- Tratar erros da API.
- Garantir persistência.
- Evitar dados mockados como substitutos da API em produção.

---

## 10. Sincronização entre Painel e Ilhas

As informações apresentadas no Painel e na página Ilhas representam os mesmos dados e devem permanecer consistentes.

Exemplo:
1. O usuário cria uma tarefa em uma Ilha.
2. A tarefa é salva no backend.
3. O usuário retorna ao Painel.
4. A tarefa aparece na área correspondente.
5. O usuário conclui a tarefa pelo Painel.
6. A alteração é persistida.
7. Ao retornar para Ilhas, a tarefa aparece concluída.

Regras:
- Evitar versões independentes e divergentes dos mesmos dados.
- Utilizar o backend como fonte de verdade.
- Atualizar os componentes após operações bem-sucedidas.
- Evitar requisições desnecessárias.
- Não atribuir datas inexistentes às tarefas.

---

## 11. Banco de dados e persistência

O banco utilizado é MySQL, com persistência por Spring Data JPA e Hibernate.

Entidades funcionais conhecidas:
- Usuário.
- Objetivo.
- Etapa.
- Tarefa.

Outras entidades podem ser necessárias para planos, assinaturas, pagamentos e mentorias, mas devem ser definidas com base nas regras reais da equipe.

Antes de modificar tabelas:
- Verificar como o projeto controla o schema.
- Identificar scripts ou ferramentas de migração.
- Preservar dados existentes.
- Documentar alterações.
- Não executar comandos destrutivos sem autorização.

---

## 12. Segurança e autenticação

O projeto utiliza ou utilizou anteriormente:
- Spring Security.
- JWT.
- BCrypt.
- Token armazenado no `sessionStorage`, com a chave `token`.

Conferir esses detalhes no código atual.

Regras:
- Nunca armazenar senhas em texto puro.
- Validar JWT no backend.
- Proteger endpoints privados.
- Verificar a propriedade dos recursos.
- Não confiar apenas no ID enviado pelo frontend.
- Não expor tokens, senhas ou credenciais nos logs.
- Utilizar variáveis de ambiente.

### Proteção de planos e mentorias

As permissões de acesso aos recursos pagos devem ser verificadas no backend.

Não confiar apenas em informações de plano recebidas do frontend.

---

## 13. Padrões de desenvolvimento

### Frontend

- Utilizar componentes React reutilizáveis.
- Respeitar a estrutura de pastas existente.
- Preferir responsabilidades bem definidas.
- Utilizar hooks para lógica compartilhada quando adequado.
- Manter consistência visual.
- Preservar a identidade visual.
- Tratar carregamento, sucesso e erro.
- Garantir responsividade.

### Backend

- Respeitar a separação Controller, Service e Repository.
- Utilizar DTOs para entrada e saída quando apropriado.
- Manter regras de negócio nos Services.
- Utilizar validações adequadas.
- Padronizar exceções.
- Respeitar as convenções Spring Boot existentes.

---

## 14. Regras para trabalhar com agentes de IA

### Regra 1 — Analisar antes de alterar

Antes de modificar arquivos:
1. Identificar qual repositório está sendo utilizado.
2. Verificar a estrutura de pastas.
3. Ler os arquivos relacionados.
4. Identificar implementações existentes.
5. Verificar compatibilidade entre frontend e backend.
6. Apresentar diagnóstico antes de mudanças importantes.

### Regra 2 — Preservar o trabalho da equipe

- Não apagar implementações existentes sem justificativa.
- Não sobrescrever arquivos completos quando uma alteração localizada for suficiente.
- Não remover funcionalidades de outros integrantes.
- Não executar `git reset --hard` sem autorização.
- Não executar `git push --force`.
- Não descartar alterações locais.
- Verificar `git status`, branches e histórico antes de operações sensíveis.
- Preservar contribuições válidas durante resolução de conflitos.

### Regra 3 — Implementar por etapas

1. Entender o comportamento esperado.
2. Identificar os arquivos afetados.
3. Explicar a solução.
4. Implementar a menor alteração necessária.
5. Executar testes.
6. Verificar impactos.
7. Documentar o resultado.

### Regra 4 — Não inventar funcionalidades

Se um endpoint, campo, entidade, preço, benefício ou comportamento não estiver definido:
- Informar que não foi encontrado.
- Procurar implementação equivalente.
- Explicar o que precisa ser definido.
- Solicitar confirmação quando envolver decisões de arquitetura ou negócio.

### Regra 5 — Validar a integração completa

Validar, quando aplicável:
- Interface.
- Requisição HTTP.
- Controller.
- Service.
- Repository.
- Banco de dados.
- Resposta da API.
- Atualização da interface.

---

## 15. Testes e critérios de conclusão

### Frontend

Verificar:
- Compilação.
- Navegação.
- Formulários.
- Comunicação com a API.
- Estados de carregamento e erro.
- Atualização dos dados.
- Responsividade.

### Backend

Verificar:
- Compilação.
- Inicialização.
- Endpoints.
- DTOs.
- Persistência no MySQL.
- Autenticação e autorização.
- Relacionamentos.
- Tratamento de exceções.

### Integração

Verificar:
- Cadastro e login.
- Carregamento dos objetivos.
- Carregamento das etapas.
- Carregamento das tarefas.
- Criação, edição e exclusão.
- Conclusão de tarefas.
- Sincronização entre Painel e Ilhas.
- Persistência após atualizar a página.
- Isolamento de dados entre usuários.
- Permissões de planos.
- Fluxos de mentoria, quando implementados.
- Fluxos de pagamento, quando implementados.

Não declarar testes aprovados sem executá-los.

---

## 16. Documentação e comunicação

Ao finalizar uma tarefa, apresentar:
1. O que foi identificado.
2. O que foi alterado.
3. Quais arquivos foram modificados.
4. Como a funcionalidade funciona.
5. Quais testes foram executados.
6. Quais pendências continuam existindo.

Utilizar linguagem simples e objetiva.

---

## 17. Instrução final para o agente

Você está trabalhando no projeto Farol, uma plataforma que ajuda pessoas a organizarem seus objetivos e transformarem grandes metas em etapas e tarefas menores.

O Farol também possui uma proposta de negócio com modalidades gratuitas e pagas, além de uma funcionalidade de mentorias.

Seu trabalho não é apenas gerar código.

Você deve preservar a arquitetura, manter a integração entre os dois repositórios, proteger os dados dos usuários e respeitar as regras funcionais e comerciais da plataforma.

**Prioridades:**

1. Preservar o código e o trabalho da equipe.
2. Compreender a implementação atual antes de modificar.
3. Manter frontend, backend e banco de dados integrados.
4. Respeitar as regras de negócio do Farol.
5. Considerar planos gratuitos, pagos e mentorias.
6. Não inventar preços, benefícios ou restrições comerciais.
7. Implementar soluções simples, seguras e sustentáveis.
8. Testar antes de considerar qualquer tarefa concluída.

Sempre trate o código atual como fonte de verdade e esta skill como o guia de contexto do projeto.