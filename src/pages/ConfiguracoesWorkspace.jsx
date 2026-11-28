import { useState, useEffect, useMemo, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import Icon from '../components/Icon';
import { requisicaoAPI } from '../services/api';
import {
  obterPreferencias,
  salvarPreferencias,
  restaurarPreferenciasPadrao,
  PREFERENCIAS_PADRAO,
} from '../services/preferenciasUsuario';
import './ConfiguracoesWorkspace.css';

const SECOES = [
  { id: 'perfil', label: 'Perfil', icone: 'user', descricao: 'Dados cadastrais e plano' },
  { id: 'painel', label: 'Personalizar painel', icone: 'layout', descricao: 'Módulos visíveis no início' },
  { id: 'jornada', label: 'Minha Jornada', icone: 'flame', descricao: 'Acompanhamento do progresso' },
  { id: 'ilhas', label: 'Minhas Ilhas', icone: 'map', descricao: 'Preferências dos mapas mentais' },
  { id: 'notificacoes', label: 'Notificações', icone: 'bell', descricao: 'Lembretes e avisos' },
  { id: 'seguranca', label: 'Conta e segurança', icone: 'shield', descricao: 'Senha e encerramento' },
];

function SwitchToggle({ id, label, descricao, checked, onChange, disabled = false }) {
  return (
    <div className="farol-config-toggle-row">
      <div className="farol-config-toggle-info">
        <label htmlFor={id} className="farol-config-toggle-label">
          {label}
        </label>
        {descricao && <p className="farol-config-toggle-desc">{descricao}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`farol-switch ${checked ? 'is-checked' : ''} ${disabled ? 'is-disabled' : ''}`}
      >
        <span className="farol-switch-thumb" />
      </button>
    </div>
  );
}

export default function ConfiguracoesWorkspace({
  onNavegar = () => {},
  onLogout = () => {},
  objetivos = [],
}) {
  const usuario = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem('usuario') || '{}');
    } catch {
      return {};
    }
  }, []);

  const planoFormatado = useMemo(() => {
    const raw = (
      usuario.plano ||
      usuario.tipoPlano ||
      usuario.planoAssinatura ||
      usuario.role ||
      ''
    )
      .toString()
      .toLowerCase();
    if (raw.includes('anual')) return 'Premium Anual';
    if (raw.includes('premium') || raw.includes('mensal')) return 'Premium Mensal';
    if (usuario.isPremium || usuario.premium) return 'Premium';
    return 'Freemium';
  }, [usuario]);

  const [secaoAtiva, setSecaoAtiva] = useState('perfil');
  const [preferenciasSalvas, setPreferenciasSalvas] = useState(() => obterPreferencias(usuario));
  const [rascunho, setRascunho] = useState(() => JSON.parse(JSON.stringify(preferenciasSalvas)));
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [mensagemErro, setMensagemErro] = useState('');
  const [enviandoRecuperacao, setEnviandoRecuperacao] = useState(false);
  const [feedbackRecuperacao, setFeedbackRecuperacao] = useState(null);

  // Calcula se há alterações pendentes
  const temAlteracoes = useMemo(() => {
    return JSON.stringify(preferenciasSalvas) !== JSON.stringify(rascunho);
  }, [preferenciasSalvas, rascunho]);

  // Sincroniza se preferências externas mudarem
  useEffect(() => {
    function aoAtualizar(e) {
      if (e?.detail) {
        setPreferenciasSalvas(e.detail);
      }
    }
    window.addEventListener('farol:preferencias-atualizadas', aoAtualizar);
    return () => window.removeEventListener('farol:preferencias-atualizadas', aoAtualizar);
  }, []);

  // Rolagem suave para a seção selecionada
  const navegarParaSecao = useCallback((idSecao) => {
    setSecaoAtiva(idSecao);
    const elemento = document.getElementById(`secao-${idSecao}`);
    if (elemento) {
      elemento.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  // Atualizador de campo no rascunho
  const atualizarCampo = useCallback((categoria, campo, valor) => {
    setRascunho((anterior) => ({
      ...anterior,
      [categoria]: {
        ...anterior[categoria],
        [campo]: valor,
      },
    }));
    setMensagemSucesso('');
    setMensagemErro('');
  }, []);

  // Salvar alterações
  const handleSalvar = useCallback(() => {
    try {
      const resultado = salvarPreferencias(rascunho, usuario);
      if (resultado.sucesso) {
        setPreferenciasSalvas(JSON.parse(JSON.stringify(rascunho)));
        setMensagemSucesso('Suas configurações foram salvas com sucesso!');
        setMensagemErro('');
        setTimeout(() => setMensagemSucesso(''), 4000);
      } else {
        setMensagemErro(resultado.erro || 'Falha ao salvar preferências.');
      }
    } catch (e) {
      setMensagemErro(e?.message || 'Erro inesperado ao salvar.');
    }
  }, [rascunho, usuario]);

  // Cancelar alterações e restaurar valores salvos
  const handleCancelar = useCallback(() => {
    setRascunho(JSON.parse(JSON.stringify(preferenciasSalvas)));
    setMensagemSucesso('');
    setMensagemErro('');
  }, [preferenciasSalvas]);

  // Restaurar padrões de fábrica
  const handleRestaurarPadrao = useCallback(() => {
    if (window.confirm('Deseja restaurar todas as configurações para o padrão original do Farol?')) {
      const res = restaurarPreferenciasPadrao(usuario);
      if (res.sucesso) {
        setPreferenciasSalvas(res.dados);
        setRascunho(JSON.parse(JSON.stringify(res.dados)));
        setMensagemSucesso('Configurações restauradas para o padrão.');
        setTimeout(() => setMensagemSucesso(''), 4000);
      }
    }
  }, [usuario]);

  // Ação de voltar protegendo alterações pendentes
  const handleVoltar = useCallback(() => {
    if (temAlteracoes) {
      const confirmar = window.confirm(
        'Você possui alterações não salvas. Deseja descartá-las e voltar ao painel?'
      );
      if (!confirmar) return;
    }
    onNavegar('Início');
  }, [temAlteracoes, onNavegar]);

  // Solicitar redefinição de senha real
  const handleSolicitarRedefinicaoSenha = useCallback(async () => {
    if (!usuario.email) {
      setFeedbackRecuperacao({
        tipo: 'erro',
        texto: 'Não foi possível identificar o e-mail da sua conta.',
      });
      return;
    }

    try {
      setEnviandoRecuperacao(true);
      setFeedbackRecuperacao(null);
      await requisicaoAPI('/usuarios/solicitar-recuperacao', {
        method: 'POST',
        body: JSON.stringify({ email: usuario.email }),
      });
      setFeedbackRecuperacao({
        tipo: 'sucesso',
        texto: `Instruções de redefinição foram enviadas para ${usuario.email}. Verifique sua caixa de entrada.`,
      });
    } catch (erro) {
      setFeedbackRecuperacao({
        tipo: 'erro',
        texto: erro?.message || 'Não foi possível enviar o e-mail de recuperação no momento.',
      });
    } finally {
      setEnviandoRecuperacao(false);
    }
  }, [usuario.email]);

  // Solicitação de permissão de notificação no navegador
  const [permissaoNotificacao, setPermissaoNotificacao] = useState(() => {
    return typeof window !== 'undefined' && 'Notification' in window
      ? Notification.permission
      : 'unsupported';
  });

  const handlePedirPermissaoNotificacao = useCallback(async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const resultado = await Notification.requestPermission();
        setPermissaoNotificacao(resultado);
      } catch {
        // silencioso
      }
    }
  }, []);

  return (
    <div className="farol-config-workspace-root">
      {/* Sidebar do Farol */}
      <Sidebar activeItem="Configurações" onNavegar={onNavegar} onLogout={onLogout} />

      {/* Conteúdo da Workspace de Configurações */}
      <main className="farol-config-main">
        {/* Topbar / Cabeçalho */}
        <header className="farol-config-header">
          <div className="farol-config-header-left">
            <button
              type="button"
              onClick={handleVoltar}
              className="farol-config-btn-back"
              aria-label="Voltar ao Painel Principal"
            >
              <Icon name="arrowLeft" size={16} />
              <span>Painel</span>
            </button>
            <div className="farol-config-titles">
              <span className="farol-config-eyebrow">PREFERÊNCIAS & CONTA</span>
              <h1>Configurações</h1>
              <p>Personalize sua experiência, módulos do painel e visualização no Farol.</p>
            </div>
          </div>

          <div className="farol-config-header-actions">
            {temAlteracoes && (
              <div className="farol-config-pending-alert" role="status">
                <span className="farol-config-pending-dot" />
                <span>Alterações pendentes</span>
              </div>
            )}
            <button
              type="button"
              onClick={handleCancelar}
              disabled={!temAlteracoes}
              className={`farol-config-btn-cancel ${!temAlteracoes ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSalvar}
              disabled={!temAlteracoes}
              className={`farol-config-btn-save ${!temAlteracoes ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Icon name="check" size={16} />
              <span>Salvar alterações</span>
            </button>
          </div>
        </header>

        {/* Feedback flutuante / de status */}
        {mensagemSucesso && (
          <div className="farol-config-feedback success" role="alert">
            <Icon name="check" size={16} />
            <span>{mensagemSucesso}</span>
          </div>
        )}
        {mensagemErro && (
          <div className="farol-config-feedback error" role="alert">
            <Icon name="close" size={16} />
            <span>{mensagemErro}</span>
          </div>
        )}

        {/* Layout: Navegação Interna Lateral + Área de Cartões */}
        <div className="farol-config-layout">
          {/* Navegação interna de seções */}
          <aside className="farol-config-sidebar-nav" aria-label="Menu de Configurações">
            <nav>
              <ul>
                {SECOES.map((secao) => {
                  const ativa = secaoAtiva === secao.id;
                  return (
                    <li key={secao.id}>
                      <button
                        type="button"
                        onClick={() => navegarParaSecao(secao.id)}
                        className={`farol-config-nav-item ${ativa ? 'is-active' : ''}`}
                        aria-current={ativa ? 'true' : undefined}
                      >
                        <span className="farol-config-nav-icon">
                          <Icon name={secao.icone} size={18} />
                        </span>
                        <div className="farol-config-nav-text">
                          <span className="farol-config-nav-label">{secao.label}</span>
                          <span className="farol-config-nav-sub">{secao.descricao}</span>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="farol-config-nav-footer">
              <button
                type="button"
                onClick={handleRestaurarPadrao}
                className="farol-config-btn-restore"
              >
                Restaurar padrões
              </button>
            </div>
          </aside>

          {/* Área Principal de Cartões */}
          <div className="farol-config-cards-container">
            {/* SEÇÃO 1: PERFIL */}
            <section id="secao-perfil" className="farol-config-card">
              <div className="farol-config-card-header">
                <span className="farol-config-card-badge blue">
                  <Icon name="user" size={20} />
                </span>
                <div>
                  <h2>Perfil & Identificação</h2>
                  <p>Informações visuais da sua conta autenticada no Farol.</p>
                </div>
              </div>

              <div className="farol-config-profile-box">
                <div className="farol-config-avatar-wrapper">
                  <div className="farol-config-avatar" aria-hidden="true">
                    {usuario.nome?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="farol-config-avatar-badge" title="Conta ativa">
                    <Icon name="check" size={12} />
                  </span>
                </div>

                <div className="farol-config-profile-fields">
                  <div className="farol-config-field-group">
                    <span className="farol-config-field-label">Nome de exibição</span>
                    <p className="farol-config-field-value">{usuario.nome || 'Usuário Farol'}</p>
                  </div>

                  <div className="farol-config-field-group">
                    <span className="farol-config-field-label">E-mail da conta</span>
                    <p className="farol-config-field-value">{usuario.email || 'Não informado'}</p>
                  </div>

                  <div className="farol-config-field-group">
                    <span className="farol-config-field-label">Plano Farol</span>
                    <div className="farol-config-plan-badge">
                      <span className="farol-config-plan-tag">{planoFormatado}</span>
                      <button
                        type="button"
                        onClick={() => onNavegar('Planos')}
                        className="farol-config-plan-link"
                      >
                        Ver planos →
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="farol-config-card-note">
                <Icon name="sparkles" size={16} />
                <span>
                  A edição de avatar e troca de e-mail requerem autenticação avançada e estarão disponíveis em breve.
                </span>
              </div>
            </section>

            {/* SEÇÃO 2: PERSONALIZAR PAINEL */}
            <section id="secao-painel" className="farol-config-card">
              <div className="farol-config-card-header">
                <span className="farol-config-card-badge amber">
                  <Icon name="layout" size={20} />
                </span>
                <div>
                  <h2>Personalizar Painel</h2>
                  <p>Escolha quais módulos e cartões serão visíveis na tela inicial do Farol.</p>
                </div>
              </div>

              <div className="farol-config-switches-list">
                <SwitchToggle
                  id="toggle-notas"
                  label="Notas Diárias"
                  descricao="Bloco de anotações rápidas e pensamentos do dia integrado ao painel."
                  checked={rascunho.painel?.notasDiarias !== false}
                  onChange={(val) => atualizarCampo('painel', 'notasDiarias', val)}
                />

                <SwitchToggle
                  id="toggle-calendario"
                  label="Calendário"
                  descricao="Mini visualização mensal e compromissos com data da semana."
                  checked={rascunho.painel?.calendario !== false}
                  onChange={(val) => atualizarCampo('painel', 'calendario', val)}
                />

                <SwitchToggle
                  id="toggle-jornada"
                  label="Minha Jornada"
                  descricao="Anel de progresso geral e percentual de tarefas concluídas."
                  checked={rascunho.painel?.minhaJornada !== false}
                  onChange={(val) => atualizarCampo('painel', 'minhaJornada', val)}
                />

                <SwitchToggle
                  id="toggle-ilhas"
                  label="Minhas Ilhas"
                  descricao="Resumo dos seus objetivos mapeados e rotas de aprendizado ativas."
                  checked={rascunho.painel?.minhasIlhas !== false}
                  onChange={(val) => atualizarCampo('painel', 'minhasIlhas', val)}
                />

                <SwitchToggle
                  id="toggle-tarefas"
                  label="Tarefas da Semana"
                  descricao="Lista de atividades pendentes com prazos e status de conclusão."
                  checked={rascunho.painel?.tarefasSemana !== false}
                  onChange={(val) => atualizarCampo('painel', 'tarefasSemana', val)}
                />

                <SwitchToggle
                  id="toggle-frase"
                  label="Frase do Dia"
                  descricao="Saudação de boas-vindas com citação inspiradora no topo do painel."
                  checked={rascunho.painel?.fraseDoDia !== false}
                  onChange={(val) => atualizarCampo('painel', 'fraseDoDia', val)}
                />
              </div>
            </section>

            {/* SEÇÃO 3: MINHA JORNADA */}
            <section id="secao-jornada" className="farol-config-card">
              <div className="farol-config-card-header">
                <span className="farol-config-card-badge blue">
                  <Icon name="flame" size={20} />
                </span>
                <div>
                  <h2>Minha Jornada</h2>
                  <p>Personalize a exibição do seu progresso pessoal e rotina de objetivos.</p>
                </div>
              </div>

              <div className="farol-config-group">
                <span className="farol-config-group-title">Modo de Exibição do Progresso</span>
                <p className="farol-config-group-desc">
                  Escolha como o cartão da jornada apresenta seu avanço geral.
                </p>
                <div className="farol-config-radio-cards">
                  <button
                    type="button"
                    onClick={() => atualizarCampo('jornada', 'modoVisualizacao', 'completo')}
                    className={`farol-config-radio-card ${rascunho.jornada?.modoVisualizacao === 'completo' ? 'is-selected' : ''}`}
                  >
                    <span className="farol-config-radio-title">Completo (Recomendado)</span>
                    <span className="farol-config-radio-desc">
                      Exibe o anel com porcentagem e a contagem de tarefas concluídas.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => atualizarCampo('jornada', 'modoVisualizacao', 'resumido')}
                    className={`farol-config-radio-card ${rascunho.jornada?.modoVisualizacao === 'resumido' ? 'is-selected' : ''}`}
                  >
                    <span className="farol-config-radio-title">Foco Direto</span>
                    <span className="farol-config-radio-desc">
                      Apresentação minimalista focada exclusivamente na porcentagem de avanço.
                    </span>
                  </button>
                </div>
              </div>

              <div className="farol-config-switches-list mt-4">
                <SwitchToggle
                  id="toggle-mensagem-jornada"
                  label="Mensagens Motivacionais"
                  descricao="Exibir frases de incentivo nos cartões de jornada e marcos alcançados."
                  checked={rascunho.jornada?.mensagemMotivacional !== false}
                  onChange={(val) => atualizarCampo('jornada', 'mensagemMotivacional', val)}
                />

                <SwitchToggle
                  id="toggle-streak"
                  label="Destaque de Passos (Streak)"
                  descricao="Destacar cartão 'Sua Jornada: Cada passo conta' na barra lateral."
                  checked={rascunho.jornada?.destacarStreak !== false}
                  onChange={(val) => atualizarCampo('jornada', 'destacarStreak', val)}
                />
              </div>
            </section>

            {/* SEÇÃO 4: MINHAS ILHAS */}
            <section id="secao-ilhas" className="farol-config-card">
              <div className="farol-config-card-header">
                <span className="farol-config-card-badge teal">
                  <Icon name="map" size={20} />
                </span>
                <div>
                  <h2>Minhas Ilhas & Mapas</h2>
                  <p>Preferências visuais para o canvas de aprendizado, temas e nós de etapas.</p>
                </div>
              </div>

              <div className="farol-config-group">
                <label htmlFor="select-mapa-padrao" className="farol-config-group-title">
                  Mapa Inicial Padrão
                </label>
                <p className="farol-config-group-desc">
                  Escolha qual mapa de objetivos abrir automaticamente ao acessar a área de Ilhas.
                </p>
                <select
                  id="select-mapa-padrao"
                  value={rascunho.ilhas?.mapaPadraoId || 'ultimo'}
                  onChange={(e) => atualizarCampo('ilhas', 'mapaPadraoId', e.target.value)}
                  className="farol-config-select"
                >
                  <option value="ultimo">Abrir último mapa acessado</option>
                  {objetivos.map((obj) => (
                    <option key={obj.id} value={String(obj.id)}>
                      {obj.nome || `Objetivo #${obj.id}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="farol-config-group mt-5">
                <label htmlFor="select-estilo-oceano" className="farol-config-group-title">
                  Tema Visual do Oceano
                </label>
                <p className="farol-config-group-desc">
                  Gradiente e estilo de fundo utilizado no canvas de ilhas.
                </p>
                <select
                  id="select-estilo-oceano"
                  value={rascunho.ilhas?.estiloOceano || 'oceano-noturno'}
                  onChange={(e) => atualizarCampo('ilhas', 'estiloOceano', e.target.value)}
                  className="farol-config-select"
                >
                  <option value="oceano-noturno">Oceano Noturno Farol (Padrão)</option>
                  <option value="oceano-profundo">Oceano Profundo (Azul Escuro)</option>
                  <option value="contraste-suave">Contraste Suave (Alta Legibilidade)</option>
                </select>
              </div>

              <div className="farol-config-switches-list mt-4">
                <SwitchToggle
                  id="toggle-progresso-nos"
                  label="Barra de Progresso nos Nós"
                  descricao="Exibir linha de progresso em porcentagem dentro de cada ilha do mapa."
                  checked={rascunho.ilhas?.exibirProgressoNos !== false}
                  onChange={(val) => atualizarCampo('ilhas', 'exibirProgressoNos', val)}
                />

                <SwitchToggle
                  id="toggle-barco"
                  label="Barco de Navegação Animado"
                  descricao="Exibir o ícone do barco sobre a ilha atualmente em andamento."
                  checked={rascunho.ilhas?.exibirBarco !== false}
                  onChange={(val) => atualizarCampo('ilhas', 'exibirBarco', val)}
                />
              </div>
            </section>

            {/* SEÇÃO 5: NOTIFICAÇÕES */}
            <section id="secao-notificacoes" className="farol-config-card">
              <div className="farol-config-card-header">
                <span className="farol-config-card-badge yellow">
                  <Icon name="bell" size={20} />
                </span>
                <div>
                  <h2>Notificações & Lembretes</h2>
                  <p>Configure alertas no navegador para prazos de tarefas e rotina de estudos.</p>
                </div>
              </div>

              {permissaoNotificacao !== 'granted' && permissaoNotificacao !== 'unsupported' && (
                <div className="farol-config-permission-box">
                  <div className="farol-config-permission-info">
                    <Icon name="bell" size={18} />
                    <div>
                      <strong>Notificações no navegador</strong>
                      <p>Receba avisos de tarefas e lembretes de estudos no seu computador.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handlePedirPermissaoNotificacao}
                    className="farol-config-btn-permission"
                  >
                    Ativar no navegador
                  </button>
                </div>
              )}

              <div className="farol-config-switches-list">
                <SwitchToggle
                  id="toggle-notif-tarefas"
                  label="Lembretes de Tarefas"
                  descricao="Sinalizar tarefas agendadas com prazo próximo no painel diário."
                  checked={rascunho.notificacoes?.lembretesTarefas !== false}
                  onChange={(val) => atualizarCampo('notificacoes', 'lembretesTarefas', val)}
                />

                <SwitchToggle
                  id="toggle-notif-estudo"
                  label="Lembretes de Estudo"
                  descricao="Lembrar de registrar notas e revisar tópicos das suas ilhas."
                  checked={rascunho.notificacoes?.lembretesEstudo !== false}
                  onChange={(val) => atualizarCampo('notificacoes', 'lembretesEstudo', val)}
                />

                <SwitchToggle
                  id="toggle-som-conclusao"
                  label="Sinal Sonoro de Conclusão"
                  descricao="Tocar som suave ao concluir tarefas ou etapas no sistema."
                  checked={rascunho.notificacoes?.somConclusao !== false}
                  onChange={(val) => atualizarCampo('notificacoes', 'somConclusao', val)}
                />
              </div>

              <div className="farol-config-group mt-5">
                <label htmlFor="select-horario-lembrete" className="farol-config-group-title">
                  Horário Preferencial de Lembretes
                </label>
                <p className="farol-config-group-desc">
                  Momento recomendado para revisão diária dos seus objetivos.
                </p>
                <select
                  id="select-horario-lembrete"
                  value={rascunho.notificacoes?.horarioLembrete || '08:00'}
                  onChange={(e) => atualizarCampo('notificacoes', 'horarioLembrete', e.target.value)}
                  className="farol-config-select"
                >
                  <option value="08:00">08:00 — Manhã (Início do dia)</option>
                  <option value="12:00">12:00 — Meio-dia (Pausa de almoço)</option>
                  <option value="18:00">18:00 — Fim de tarde (Encerramento de expediente)</option>
                  <option value="21:00">21:00 — Noite (Revisão antes de dormir)</option>
                </select>
              </div>

              <div className="farol-config-card-note mt-4">
                <Icon name="sparkles" size={16} />
                <span>
                  Resumo semanal consolidado por e-mail e push em segundo plano estão em fase de homologação no servidor.
                </span>
              </div>
            </section>

            {/* SEÇÃO 6: CONTA E SEGURANÇA */}
            <section id="secao-seguranca" className="farol-config-card">
              <div className="farol-config-card-header">
                <span className="farol-config-card-badge red">
                  <Icon name="shield" size={20} />
                </span>
                <div>
                  <h2>Conta & Segurança</h2>
                  <p>Controle de credenciais, redefinição de senha e encerramento de sessão.</p>
                </div>
              </div>

              <div className="farol-config-security-box">
                <div className="farol-config-security-row">
                  <div>
                    <h3 className="farol-config-security-title">Redefinição de Senha</h3>
                    <p className="farol-config-security-desc">
                      Receba um link seguro no seu e-mail cadastrado ({usuario.email}) para cadastrar uma nova senha.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSolicitarRedefinicaoSenha}
                    disabled={enviandoRecuperacao}
                    className="farol-config-btn-security"
                  >
                    {enviandoRecuperacao ? 'Enviando...' : 'Redefinir senha por e-mail'}
                  </button>
                </div>

                {feedbackRecuperacao && (
                  <div
                    className={`farol-config-feedback-inline ${feedbackRecuperacao.tipo === 'sucesso' ? 'success' : 'error'}`}
                    role="alert"
                  >
                    <Icon
                      name={feedbackRecuperacao.tipo === 'sucesso' ? 'check' : 'close'}
                      size={15}
                    />
                    <span>{feedbackRecuperacao.texto}</span>
                  </div>
                )}

                <div className="farol-config-security-divider" />

                <div className="farol-config-security-row">
                  <div>
                    <h3 className="farol-config-security-title">Sessão e Acesso</h3>
                    <p className="farol-config-security-desc">
                      Sua sessão está ativa via token seguro Bearer JWT. Encerre para desconectar este dispositivo.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onLogout}
                    className="farol-config-btn-logout"
                  >
                    <Icon name="log-out" size={16} />
                    <span>Encerrar sessão</span>
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
