# Farol — Documentação do banco de dados

## 1. Visão geral

O banco de dados `farol` armazena as informações necessárias para o funcionamento da plataforma Farol, um sistema de organização de objetivos, etapas (chamadas de **Ilhas**), tarefas e calendário.

A estrutura também contempla:
- contas de usuários e preferências;
- planos gratuitos e Premium, limites, assinaturas e pagamentos;
- dispositivos autorizados e sincronização de dados;
- solicitações à inteligência artificial e aprovação de rascunhos;
- eventos e recorrências do calendário;
- registros relacionados à privacidade, consentimentos e auditoria.

O banco foi organizado em grupos funcionais para facilitar a compreensão e a manutenção.

## 2. Visão geral dos relacionamentos

O relacionamento principal do planejamento é:

```text
USUÁRIO
  └── OBJETIVOS
        └── ETAPAS (ILHAS)
              └── TAREFAS
```

Um usuário pode ter vários objetivos. Cada objetivo pode conter várias etapas, e cada etapa pode conter várias tarefas. Cada tarefa pertence a uma única etapa.

Outros grupos se conectam ao usuário para armazenar suas preferências, assinatura, dispositivos, histórico de IA, eventos de calendário e informações de privacidade.

## 3. Tabelas e suas responsabilidades

### 3.1 Usuários e preferências

| Tabela | Responsabilidade | Relacionamento principal |
|---|---|---|
| `usuarios` | Armazena os dados da conta, como nome, e-mail, hash da senha, nascimento e status. | Tabela central; relaciona-se com objetivos e os demais dados do usuário. |
| `preferencias_usuario` | Guarda configurações pessoais, como modo de planejamento, tema, fuso horário e sincronização. | Cada registro pertence a um usuário. O campo `usuario_id` é único, portanto há no máximo um conjunto de preferências por usuário. |

**Relacionamento:** `usuarios (1) — (0..1) preferencias_usuario`.

### 3.2 Planejamento: objetivos, Ilhas e tarefas

| Tabela | Responsabilidade | Relacionamento principal |
|---|---|---|
| `objetivos` | Guarda os objetivos criados pelo usuário, com título, descrição, prioridade, prazo, status e ordem. | Cada objetivo pertence a um usuário. |
| `etapas` | Representa as Ilhas, ou seja, as etapas que dividem um objetivo em partes menores. | Cada etapa pertence a um objetivo. |
| `tarefas` | Armazena as atividades que precisam ser realizadas dentro de uma Ilha. | Cada tarefa pertence a uma etapa. |

**Relacionamentos:**
- `usuarios (1) — (N) objetivos`;
- `objetivos (1) — (N) etapas`;
- `etapas (1) — (N) tarefas`.

Ao excluir um usuário, seus objetivos são excluídos em cascata. A exclusão de um objetivo também exclui suas etapas e tarefas; a exclusão de uma etapa exclui suas tarefas.

O progresso do objetivo pode ser calculado pela aplicação com base nas tarefas concluídas. Quando não houver tarefas, a interface deve apresentar **“Sem progresso”**, conforme a regra definida para o projeto.

### 3.3 Planos, limites, assinaturas e pagamentos

| Tabela | Responsabilidade | Relacionamento principal |
|---|---|---|
| `planos` | Registra os planos disponíveis, como Free e Premium, com descrição, preço, moeda e situação. | É referenciada por limites e assinaturas. |
| `limites_plano` | Define os limites de cada plano: quantidade de objetivos, etapas, tarefas e uso mensal da IA. | Cada registro pertence a um plano; `plano_id` é único, então há um conjunto de limites por plano. |
| `assinaturas` | Registra o plano associado ao usuário, identificador externo, status e datas da assinatura. | Cada assinatura pertence a um usuário e a um plano. |
| `pagamentos` | Guarda os pagamentos relacionados a uma assinatura, incluindo identificador da transação externa, valor, moeda, status e data. | Cada pagamento pertence a uma assinatura. |

**Relacionamentos:**
- `planos (1) — (0..1) limites_plano`;
- `usuarios (1) — (N) assinaturas`;
- `planos (1) — (N) assinaturas`;
- `assinaturas (1) — (N) pagamentos`.

O processamento financeiro é realizado por um provedor externo. O Farol armazena identificadores e informações da transação, mas não dados de cartão.

### 3.4 Dispositivos e sincronização

| Tabela | Responsabilidade | Relacionamento principal |
|---|---|---|
| `dispositivos` | Registra os dispositivos autorizados pelo usuário, com identificador, status e validade da autorização. | Cada dispositivo pertence a um usuário. |
| `sincronizacoes` | Registra cada tentativa de sincronização, seu tipo, status, dispositivo e horários. | Cada sincronização pertence a um usuário e a um dispositivo. |
| `itens_sincronizacao` | Registra os itens tratados em uma sincronização, suas versões local/nuvem, status e resolução de conflito. | Cada item pertence a uma sincronização. |

**Relacionamentos:**
- `usuarios (1) — (N) dispositivos`;
- `usuarios (1) — (N) sincronizacoes`;
- `dispositivos (1) — (N) sincronizacoes`;
- `sincronizacoes (1) — (N) itens_sincronizacao`.

A tabela `itens_sincronizacao` usa os campos `entidade`, `id_local` e `id_nuvem` para identificar registros de diferentes tipos. Por isso, esses identificadores não possuem uma chave estrangeira direta para cada tabela de negócio.

A resolução de conflitos deve ser apresentada ao usuário. O sistema não deve substituir silenciosamente uma versão pela outra.

### 3.5 Inteligência artificial

| Tabela | Responsabilidade | Relacionamento principal |
|---|---|---|
| `provedores_ia` | Registra os provedores de inteligência artificial que podem ser utilizados. | Um provedor pode disponibilizar vários modelos. |
| `modelos_ia` | Registra os modelos disponíveis e o provedor ao qual cada modelo pertence. | Cada modelo pertence a um provedor. |
| `solicitacoes_ia` | Armazena as solicitações feitas pelos usuários, incluindo operação, entrada, resposta, status e quantidade de tokens. | Cada solicitação pertence a um usuário e a um modelo. |
| `rascunhos_ia` | Guarda a proposta gerada pela IA e o estado de aprovação pelo usuário. | Cada rascunho pertence a uma solicitação; `solicitacao_id` é único, permitindo no máximo um rascunho por solicitação. |

**Relacionamentos:**
- `provedores_ia (1) — (N) modelos_ia`;
- `usuarios (1) — (N) solicitacoes_ia`;
- `modelos_ia (1) — (N) solicitacoes_ia`;
- `solicitacoes_ia (1) — (0..1) rascunhos_ia`.

A IA pode sugerir um planejamento, mas o conteúdo deve ser apresentado como rascunho. O usuário precisa aprovar antes que a sugestão seja aplicada ao planejamento.

O consumo mensal pode ser calculado a partir dos tokens de entrada e saída registrados em `solicitacoes_ia`. A aplicação deve controlar os limites de cada plano.

### 3.6 Calendário

| Tabela | Responsabilidade | Relacionamento principal |
|---|---|---|
| `evento_calendario` | Armazena disponibilidades, agendamentos e bloqueios. Também possui campos para recorrência e associação opcional a uma tarefa. | Cada evento pertence a um usuário e pode estar ligado a uma tarefa. Um evento também pode referenciar outro evento como origem de uma exceção. |

**Relacionamentos:**
- `usuarios (1) — (N) evento_calendario`;
- `tarefas (1) — (0..N) evento_calendario`;
- `evento_calendario (1) — (0..N) eventos de exceção`, por meio de `excecao_de_evento_id`.

Os campos de recorrência permitem indicar frequência diária, semanal ou mensal, além do tipo de encerramento da série. O campo `serie_id` identifica eventos que pertencem à mesma série.

A lógica para gerar ocorrências e tratar a edição de uma ocorrência isolada ou de toda a série deve ser implementada no backend.

### 3.7 Privacidade, LGPD e auditoria

| Tabela | Responsabilidade | Relacionamento principal |
|---|---|---|
| `politica_privacidade` | Registra versões da política de privacidade, referência ao conteúdo, publicação e situação ativa. | Pode ser referenciada por vários registros de aceite. |
| `registros_aceite` | Registra qual usuário aceitou determinada política, o tipo de aceite e a data. | Cada registro relaciona um usuário a uma política. |
| `consentimentos` | Guarda consentimentos por finalidade, com status e datas de concessão/revogação. | Cada consentimento pertence a um usuário. |
| `solicitacoes_titular` | Registra solicitações do titular, como acesso, correção, portabilidade, exclusão e revogação. | Pode estar relacionada a um usuário; o vínculo pode ficar nulo após a exclusão da conta. |
| `registros_auditoria` | Guarda eventos relevantes para rastreabilidade, com detalhes e data. | Pode estar relacionada a um usuário; o vínculo pode ficar nulo após a exclusão da conta. |

**Relacionamentos:**
- `usuarios (1) — (N) registros_aceite`;
- `politica_privacidade (1) — (N) registros_aceite`;
- `usuarios (1) — (N) consentimentos`;
- `usuarios (1) — (N) solicitacoes_titular` (o vínculo é opcional);
- `usuarios (1) — (N) registros_auditoria` (o vínculo é opcional).

Essas tabelas apoiam o registro de aceites, consentimentos, solicitações e eventos de auditoria. A implementação deve respeitar as regras de retenção, exclusão e anonimização definidas para o projeto. Esta modelagem técnica não substitui uma avaliação jurídica de conformidade com a LGPD.

## 4. Resumo dos relacionamentos

| Tabela de origem | Cardinalidade | Tabela relacionada | Significado |
|---|---:|---|---|
| `usuarios` | 1:N | `objetivos` | Um usuário pode criar vários objetivos. |
| `usuarios` | 1:0..1 | `preferencias_usuario` | Um usuário pode ter um registro de preferências. |
| `objetivos` | 1:N | `etapas` | Um objetivo pode ser dividido em várias Ilhas. |
| `etapas` | 1:N | `tarefas` | Uma Ilha pode conter várias tarefas. |
| `planos` | 1:0..1 | `limites_plano` | Um plano possui um conjunto de limites. |
| `usuarios` | 1:N | `assinaturas` | Um usuário pode ter registros de assinatura. |
| `planos` | 1:N | `assinaturas` | Um plano pode estar associado a várias assinaturas. |
| `assinaturas` | 1:N | `pagamentos` | Uma assinatura pode possuir vários pagamentos. |
| `usuarios` | 1:N | `dispositivos` | Um usuário pode autorizar vários dispositivos. |
| `usuarios` | 1:N | `sincronizacoes` | Um usuário pode realizar várias sincronizações. |
| `dispositivos` | 1:N | `sincronizacoes` | Um dispositivo pode participar de várias sincronizações. |
| `sincronizacoes` | 1:N | `itens_sincronizacao` | Uma sincronização pode processar vários itens. |
| `provedores_ia` | 1:N | `modelos_ia` | Um provedor pode oferecer vários modelos. |
| `usuarios` | 1:N | `solicitacoes_ia` | Um usuário pode fazer várias solicitações à IA. |
| `modelos_ia` | 1:N | `solicitacoes_ia` | Um modelo pode atender várias solicitações. |
| `solicitacoes_ia` | 1:0..1 | `rascunhos_ia` | Uma solicitação pode gerar um rascunho. |
| `usuarios` | 1:N | `evento_calendario` | Um usuário pode ter vários eventos. |
| `tarefas` | 1:0..N | `evento_calendario` | Uma tarefa pode estar associada a eventos. |
| `evento_calendario` | 1:N | `evento_calendario` | Um evento pode ser referenciado por eventos de exceção. |
| `usuarios` | 1:N | `registros_aceite` | Um usuário pode aceitar diferentes versões/tipos de política. |
| `politica_privacidade` | 1:N | `registros_aceite` | Uma política pode ter vários registros de aceite. |
| `usuarios` | 1:N | `consentimentos` | Um usuário pode registrar consentimentos por finalidade. |
| `usuarios` | 1:N opcional | `solicitacoes_titular` | Uma solicitação pode manter o histórico sem o vínculo da conta. |
| `usuarios` | 1:N opcional | `registros_auditoria` | Um registro de auditoria pode permanecer sem o vínculo da conta. |

**Legenda:** `1:N` significa um para muitos. `1:0..1` significa um para zero ou um. `1:0..N` significa um para zero ou muitos.

## 5. Regras importantes que ficam no backend

O banco armazena os dados e define relacionamentos, mas algumas regras precisam ser programadas na aplicação Spring Boot:

1. Validar os limites de objetivos, etapas, tarefas e uso mensal de IA conforme o plano do usuário.
2. Calcular o progresso dos objetivos a partir das tarefas concluídas.
3. Exigir aprovação do usuário antes de aplicar um rascunho criado pela IA.
4. Autorizar a sincronização apenas para contas Premium elegíveis e dispositivos com autorização válida.
5. Detectar conflitos de sincronização e permitir que o usuário escolha a versão.
6. Gerenciar recorrências e exceções do calendário.
7. Aplicar o fluxo de exclusão, retenção e anonimização de dados.
8. Controlar o estado da assinatura e o acesso aos dados em caso de cancelamento ou reativação.

## 6. Arquivos do modelo

- `farol.sql`: script de criação do banco e das tabelas.
- `farol_uml.mmd`: diagrama ER em Mermaid.
- `farol_modelo_dados.docx`: documento complementar do modelo de dados.
- `README.md`: esta explicação da finalidade das tabelas e de seus relacionamentos.

## 7. Observação sobre a versão do MySQL

O script SQL original foi preparado para MySQL 8.0+. O ambiente informado durante a configuração do projeto foi **MySQL 5.7.44**. Portanto, antes de executar o script completo nesse ambiente, será necessário adaptar e testar os recursos incompatíveis, incluindo a collation `utf8mb4_0900_ai_ci` e outros recursos cuja compatibilidade varie entre versões.

Não execute o script completo sem essa adaptação e validação.
