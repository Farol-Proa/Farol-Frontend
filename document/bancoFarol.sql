-- ============================================================
-- FAROL - Modelo inicial do banco de dados
-- MySQL 8.0+
-- DER conceitual aprovado pelo usuário em 02/11/2026.
-- Observação: valores comerciais dos limites e prazos são configuráveis.
-- ============================================================

CREATE DATABASE IF NOT EXISTS farol
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
USE farol;

-- 1. USUÁRIOS E PREFERÊNCIAS
CREATE TABLE usuarios (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  senha_hash VARCHAR(255) NOT NULL,
  telefone VARCHAR(30) NULL,
  data_nascimento DATE NOT NULL,
  status ENUM('ATIVO','PENDENTE_EXCLUSAO','EXCLUIDO','SUSPENSO') NOT NULL DEFAULT 'ATIVO',
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  excluido_em DATETIME NULL
) ENGINE=InnoDB;

CREATE TABLE preferencias_usuario (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id BIGINT UNSIGNED NOT NULL UNIQUE,
  modo_planejamento ENUM('MANUAL','IA') NOT NULL DEFAULT 'MANUAL',
  tema VARCHAR(30) NOT NULL DEFAULT 'SISTEMA',
  fuso_horario VARCHAR(64) NOT NULL DEFAULT 'America/Sao_Paulo',
  modo_sincronizacao ENUM('MANUAL','AUTOMATICA') NOT NULL DEFAULT 'MANUAL',
  intervalo_sincronizacao_minutos INT UNSIGNED NULL,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_preferencias_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ON DELETE CASCADE,
  CONSTRAINT chk_intervalo_sync CHECK (intervalo_sincronizacao_minutos IS NULL OR intervalo_sincronizacao_minutos > 0)
) ENGINE=InnoDB;

-- 2. PLANEJAMENTO
CREATE TABLE objetivos (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id BIGINT UNSIGNED NOT NULL,
  titulo VARCHAR(180) NOT NULL,
  descricao TEXT NULL,
  prioridade ENUM('BAIXA','MEDIA','ALTA') NOT NULL DEFAULT 'MEDIA',
  prazo DATE NULL,
  status ENUM('NAO_INICIADO','EM_ANDAMENTO','CONCLUIDO','PAUSADO','CANCELADO') NOT NULL DEFAULT 'NAO_INICIADO',
  origem_criacao ENUM('MANUAL','IA') NOT NULL DEFAULT 'MANUAL',
  ordem INT NOT NULL DEFAULT 0,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_objetivos_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ON DELETE CASCADE,
  INDEX idx_objetivos_usuario_ordem (usuario_id, ordem),
  INDEX idx_objetivos_usuario_status (usuario_id, status)
) ENGINE=InnoDB;

CREATE TABLE etapas (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  objetivo_id BIGINT UNSIGNED NOT NULL,
  titulo VARCHAR(180) NOT NULL,
  descricao TEXT NULL,
  ordem INT NOT NULL DEFAULT 0,
  status ENUM('NAO_INICIADA','EM_ANDAMENTO','CONCLUIDA','BLOQUEADA') NOT NULL DEFAULT 'NAO_INICIADA',
  prazo DATE NULL,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_etapas_objetivo FOREIGN KEY (objetivo_id) REFERENCES objetivos(id)
    ON DELETE CASCADE,
  INDEX idx_etapas_objetivo_ordem (objetivo_id, ordem)
) ENGINE=InnoDB;

CREATE TABLE tarefas (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  etapa_id BIGINT UNSIGNED NOT NULL,
  titulo VARCHAR(180) NOT NULL,
  descricao TEXT NULL,
  status ENUM('NAO_INICIADA','EM_ANDAMENTO','CONCLUIDA','BLOQUEADA') NOT NULL DEFAULT 'NAO_INICIADA',
  prazo DATETIME NULL,
  ordem INT NOT NULL DEFAULT 0,
  concluida_em DATETIME NULL,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_tarefas_etapa FOREIGN KEY (etapa_id) REFERENCES etapas(id)
    ON DELETE CASCADE,
  INDEX idx_tarefas_etapa_ordem (etapa_id, ordem),
  INDEX idx_tarefas_etapa_status (etapa_id, status)
) ENGINE=InnoDB;

-- 3. PLANOS, LIMITES, ASSINATURAS E PAGAMENTOS
CREATE TABLE planos (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(80) NOT NULL UNIQUE,
  descricao VARCHAR(500) NULL,
  preco DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  moeda CHAR(3) NOT NULL DEFAULT 'BRL',
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE limites_plano (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  plano_id BIGINT UNSIGNED NOT NULL UNIQUE,
  max_objetivos INT UNSIGNED NULL,
  max_etapas INT UNSIGNED NULL,
  max_tarefas INT UNSIGNED NULL,
  max_solicitacoes_ia_mes INT UNSIGNED NOT NULL,
  max_tokens_ia_mes BIGINT UNSIGNED NOT NULL,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_limites_plano FOREIGN KEY (plano_id) REFERENCES planos(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE assinaturas (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id BIGINT UNSIGNED NOT NULL,
  plano_id BIGINT UNSIGNED NOT NULL,
  identificador_provedor VARCHAR(190) NULL,
  status ENUM('ATIVA','CANCELADA','EXPIRADA','PENDENTE','INADIMPLENTE') NOT NULL,
  inicio_em DATETIME NOT NULL,
  fim_em DATETIME NULL,
  cancelada_em DATETIME NULL,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_assinaturas_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  CONSTRAINT fk_assinaturas_plano FOREIGN KEY (plano_id) REFERENCES planos(id),
  INDEX idx_assinaturas_usuario_status (usuario_id, status)
) ENGINE=InnoDB;

CREATE TABLE pagamentos (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  assinatura_id BIGINT UNSIGNED NOT NULL,
  identificador_transacao_externa VARCHAR(190) NOT NULL UNIQUE,
  valor DECIMAL(10,2) NOT NULL,
  moeda CHAR(3) NOT NULL DEFAULT 'BRL',
  status ENUM('PENDENTE','APROVADO','RECUSADO','ESTORNADO') NOT NULL,
  pago_em DATETIME NULL,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pagamentos_assinatura FOREIGN KEY (assinatura_id) REFERENCES assinaturas(id),
  INDEX idx_pagamentos_assinatura (assinatura_id)
) ENGINE=InnoDB;

-- 4. DISPOSITIVOS E SINCRONIZAÇÃO
CREATE TABLE dispositivos (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id BIGINT UNSIGNED NOT NULL,
  identificador_dispositivo VARCHAR(190) NOT NULL,
  nome VARCHAR(120) NULL,
  status ENUM('ATIVO','REVOGADO','EXPIRADO') NOT NULL DEFAULT 'ATIVO',
  autorizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  autorizacao_expira_em DATETIME NOT NULL,
  ultimo_acesso_em DATETIME NULL,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_dispositivos_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ON DELETE CASCADE,
  UNIQUE KEY uk_dispositivo_usuario (usuario_id, identificador_dispositivo),
  INDEX idx_dispositivos_usuario_status (usuario_id, status)
) ENGINE=InnoDB;

CREATE TABLE sincronizacoes (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id BIGINT UNSIGNED NOT NULL,
  dispositivo_id BIGINT UNSIGNED NOT NULL,
  tipo ENUM('MANUAL','AUTOMATICA') NOT NULL,
  status ENUM('INICIADA','CONCLUIDA','COM_CONFLITOS','FALHOU','CANCELADA') NOT NULL,
  iniciada_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  concluida_em DATETIME NULL,
  mensagem_erro TEXT NULL,
  CONSTRAINT fk_sincronizacoes_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  CONSTRAINT fk_sincronizacoes_dispositivo FOREIGN KEY (dispositivo_id) REFERENCES dispositivos(id),
  INDEX idx_sincronizacoes_usuario_data (usuario_id, iniciada_em)
) ENGINE=InnoDB;

CREATE TABLE itens_sincronizacao (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  sincronizacao_id BIGINT UNSIGNED NOT NULL,
  entidade VARCHAR(40) NOT NULL,
  id_local VARCHAR(100) NOT NULL,
  id_nuvem VARCHAR(100) NULL,
  versao_local BIGINT UNSIGNED NOT NULL,
  versao_nuvem BIGINT UNSIGNED NULL,
  status ENUM('PENDENTE','ENVIADO','RECEBIDO','CONFLITO','RESOLVIDO','FALHOU') NOT NULL,
  resolucao ENUM('VERSAO_LOCAL','VERSAO_NUVEM','MESCLADA') NULL,
  resolvido_em DATETIME NULL,
  CONSTRAINT fk_itens_sincronizacao FOREIGN KEY (sincronizacao_id) REFERENCES sincronizacoes(id)
    ON DELETE CASCADE,
  INDEX idx_itens_sync_status (sincronizacao_id, status)
) ENGINE=InnoDB;

-- 5. INTELIGÊNCIA ARTIFICIAL
CREATE TABLE provedores_ia (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL UNIQUE,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE modelos_ia (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  provedor_id BIGINT UNSIGNED NOT NULL,
  nome_modelo VARCHAR(150) NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_modelos_provedor FOREIGN KEY (provedor_id) REFERENCES provedores_ia(id),
  UNIQUE KEY uk_modelo_provedor (provedor_id, nome_modelo)
) ENGINE=InnoDB;

CREATE TABLE solicitacoes_ia (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id BIGINT UNSIGNED NOT NULL,
  modelo_id BIGINT UNSIGNED NOT NULL,
  tipo_operacao VARCHAR(80) NOT NULL,
  status ENUM('PENDENTE','PROCESSANDO','CONCLUIDA','FALHOU') NOT NULL,
  entrada LONGTEXT NOT NULL,
  resposta LONGTEXT NULL,
  versao_prompt VARCHAR(40) NULL,
  tokens_entrada INT UNSIGNED NOT NULL DEFAULT 0,
  tokens_saida INT UNSIGNED NOT NULL DEFAULT 0,
  solicitada_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  concluida_em DATETIME NULL,
  CONSTRAINT fk_solicitacoes_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  CONSTRAINT fk_solicitacoes_modelo FOREIGN KEY (modelo_id) REFERENCES modelos_ia(id),
  INDEX idx_solicitacoes_usuario_data (usuario_id, solicitada_em)
) ENGINE=InnoDB;

CREATE TABLE rascunhos_ia (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  solicitacao_id BIGINT UNSIGNED NOT NULL UNIQUE,
  conteudo LONGTEXT NOT NULL,
  status_aprovacao ENUM('PENDENTE','APROVADO','REJEITADO') NOT NULL DEFAULT 'PENDENTE',
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  aprovado_em DATETIME NULL,
  CONSTRAINT fk_rascunhos_solicitacao FOREIGN KEY (solicitacao_id) REFERENCES solicitacoes_ia(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. CALENDÁRIO
CREATE TABLE evento_calendario (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id BIGINT UNSIGNED NOT NULL,
  tarefa_id BIGINT UNSIGNED NULL,
  tipo ENUM('DISPONIBILIDADE','AGENDAMENTO','BLOQUEIO') NOT NULL,
  titulo VARCHAR(180) NULL,
  descricao TEXT NULL,
  inicio_em DATETIME NOT NULL,
  fim_em DATETIME NOT NULL,
  recorrencia_frequencia ENUM('DIARIA','SEMANAL','MENSAL') NULL,
  recorrencia_fim_tipo ENUM('SEM_FIM','DATA','QUANTIDADE') NULL,
  recorrencia_fim_em DATETIME NULL,
  recorrencia_quantidade INT UNSIGNED NULL,
  serie_id CHAR(36) NULL,
  excecao_de_evento_id BIGINT UNSIGNED NULL,
  status ENUM('ATIVO','CANCELADO') NOT NULL DEFAULT 'ATIVO',
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_evento_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_evento_tarefa FOREIGN KEY (tarefa_id) REFERENCES tarefas(id)
    ON DELETE SET NULL,
  CONSTRAINT fk_evento_excecao FOREIGN KEY (excecao_de_evento_id) REFERENCES evento_calendario(id)
    ON DELETE SET NULL,
  CONSTRAINT chk_evento_periodo CHECK (fim_em > inicio_em),
  INDEX idx_evento_usuario_inicio (usuario_id, inicio_em),
  INDEX idx_evento_serie (serie_id)
) ENGINE=InnoDB;

-- 7. LGPD E SEGURANÇA
CREATE TABLE politica_privacidade (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  versao VARCHAR(40) NOT NULL UNIQUE,
  referencia_conteudo VARCHAR(500) NOT NULL,
  publicada_em DATETIME NOT NULL,
  ativa BOOLEAN NOT NULL DEFAULT FALSE
) ENGINE=InnoDB;

CREATE TABLE registros_aceite (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id BIGINT UNSIGNED NOT NULL,
  politica_id BIGINT UNSIGNED NOT NULL,
  tipo_aceite VARCHAR(60) NOT NULL,
  aceito_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_aceite_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  CONSTRAINT fk_aceite_politica FOREIGN KEY (politica_id) REFERENCES politica_privacidade(id),
  INDEX idx_aceite_usuario_data (usuario_id, aceito_em)
) ENGINE=InnoDB;

CREATE TABLE consentimentos (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id BIGINT UNSIGNED NOT NULL,
  finalidade VARCHAR(120) NOT NULL,
  status ENUM('CONCEDIDO','REVOGADO') NOT NULL,
  registrado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  revogado_em DATETIME NULL,
  CONSTRAINT fk_consentimentos_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  INDEX idx_consentimentos_usuario_finalidade (usuario_id, finalidade)
) ENGINE=InnoDB;

CREATE TABLE solicitacoes_titular (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id BIGINT UNSIGNED NULL,
  tipo ENUM('ACESSO','CORRECAO','PORTABILIDADE','EXCLUSAO','REVOGACAO','OUTRO') NOT NULL,
  status ENUM('RECEBIDA','EM_ANALISE','CONCLUIDA','INDEFERIDA') NOT NULL DEFAULT 'RECEBIDA',
  solicitada_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  concluida_em DATETIME NULL,
  observacao TEXT NULL,
  CONSTRAINT fk_solicitacao_titular_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ON DELETE SET NULL,
  INDEX idx_solicitacao_titular_status (status, solicitada_em)
) ENGINE=InnoDB;

CREATE TABLE registros_auditoria (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id BIGINT UNSIGNED NULL,
  evento VARCHAR(100) NOT NULL,
  detalhes JSON NULL,
  registrado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_auditoria_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ON DELETE SET NULL,
  INDEX idx_auditoria_usuario_data (usuario_id, registrado_em)
) ENGINE=InnoDB;

-- Observações de implementação:
-- 1) A aplicação deve validar limites e permissões no backend.
-- 2) O consumo mensal de IA pode ser agregado por usuário e período a partir
--    de solicitacoes_ia (tokens_entrada + tokens_saida); se volume crescer,
--    criar uma tabela de agregação mensal sem perder o histórico detalhado.
-- 3) A política de exclusão/anonimização deve preservar apenas dados legalmente
--    necessários, com acesso restrito.
-- 4) Recorrências: serie_id identifica a série; ocorrências editadas isoladamente
--    devem ser representadas por exceções vinculadas à série.
-- 5) A aprovação do DER não substitui revisão jurídica da política LGPD.
