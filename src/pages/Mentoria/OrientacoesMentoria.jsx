import { useState, useEffect, useCallback } from 'react';
import {
  listarOrientacoesMentoria,
  criarOrientacaoMentoria,
  atualizarStatusOrientacao,
} from '../../services/mentoriaApi.js';
import Icon from '../../components/Icon.jsx';

export default function OrientacoesMentoria({
  vinculoId,
  ehMentor = false,
  objetivosDisponiveis = [],
  tituloSeção = 'Orientações e Planos de Ação',
}) {
  const [orientacoes, setOrientacoes] = useState([]);
  const [filtroStatus, setFiltroStatus] = useState('TODAS');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [mensagemSucesso, setMensagemSucesso] = useState('');

  // Modal para criar orientação (exclusivo mentor)
  const [modalAberto, setModalAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [recomendacoes, setRecomendacoes] = useState('');
  const [objetivoId, setObjetivoId] = useState('');
  const [prazo, setPrazo] = useState('');

  const carregarOrientacoes = useCallback(async () => {
    if (!vinculoId) return;
    setCarregando(true);
    setErro('');

    try {
      const lista = await listarOrientacoesMentoria(vinculoId);
      setOrientacoes(lista || []);
    } catch (err) {
      setErro(err.message || 'Erro ao carregar orientações.');
    } finally {
      setCarregando(false);
    }
  }, [vinculoId]);

  useEffect(() => {
    carregarOrientacoes();
  }, [carregarOrientacoes]);

  async function handleCriar(e) {
    e.preventDefault();
    if (!titulo.trim() || !conteudo.trim()) {
      alert('Informe o título e o conteúdo da orientação.');
      return;
    }

    setSalvando(true);
    setErro('');

    try {
      const nova = await criarOrientacaoMentoria(vinculoId, {
        titulo: titulo.trim(),
        conteudo: conteudo.trim(),
        recomendacoes: recomendacoes.trim() || null,
        objetivoId: objetivoId ? Number(objetivoId) : null,
        prazo: prazo || null,
      });

      setOrientacoes((prev) => [nova, ...prev]);
      setModalAberto(false);
      setTitulo('');
      setConteudo('');
      setRecomendacoes('');
      setObjetivoId('');
      setPrazo('');
      setMensagemSucesso('Orientação registrada com sucesso!');
      setTimeout(() => setMensagemSucesso(''), 4000);
    } catch (err) {
      setErro(err.message || 'Erro ao registrar orientação.');
    } finally {
      setSalvando(false);
    }
  }

  async function handleMudarStatus(orientacaoId, novoStatus) {
    try {
      const atualizada = await atualizarStatusOrientacao(orientacaoId, novoStatus);
      setOrientacoes((prev) =>
        prev.map((o) => (o.id === orientacaoId ? atualizada : o))
      );
      setMensagemSucesso(`Status da orientação atualizado para ${novoStatus}.`);
      setTimeout(() => setMensagemSucesso(''), 3000);
    } catch (err) {
      alert(err.message || 'Erro ao atualizar status da orientação.');
    }
  }

  const orientacoesFiltradas = orientacoes.filter((o) => {
    if (filtroStatus === 'TODAS') return true;
    return o.status === filtroStatus;
  });

  function getBadgeStatus(status) {
    switch (status) {
      case 'CONCLUIDA':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-700">
            Concluída
          </span>
        );
      case 'EM_ANDAMENTO':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-950/80 text-amber-300 border border-amber-700">
            Em Andamento
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-950/80 text-sky-300 border border-sky-800">
            Pendente
          </span>
        );
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-[#0D1930] border border-[#26395C]">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Icon name="target" size={22} className="text-sky-400" />
            {tituloSeção}
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Direcionamentos estratégicos, recomendações e tarefas de evolução alinhadas com o mentor.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="rounded-xl bg-[#070C1E] border border-[#26395C] px-3 py-2 text-xs text-slate-200 focus:outline-none"
          >
            <option value="TODAS">Todos os Status</option>
            <option value="PENDENTE">Pendentes</option>
            <option value="EM_ANDAMENTO">Em Andamento</option>
            <option value="CONCLUIDA">Concluídas</option>
          </select>

          {ehMentor && (
            <button
              type="button"
              onClick={() => setModalAberto(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-medium text-sm flex items-center gap-2 shadow-lg transition-all"
            >
              <Icon name="plus" size={16} />
              <span>Nova Orientação</span>
            </button>
          )}
        </div>
      </div>

      {mensagemSucesso && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-sm flex items-center gap-2">
          <Icon name="check" size={18} className="text-emerald-400" />
          <span>{mensagemSucesso}</span>
        </div>
      )}

      {erro && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-sm">
          {erro}
        </div>
      )}

      {carregando ? (
        <div className="p-12 text-center text-slate-400">
          <span className="animate-spin inline-block mr-2">◌</span> Carregando orientações...
        </div>
      ) : orientacoesFiltradas.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#0D1930]/70 border border-[#26395C] text-center text-slate-400 space-y-2">
          <p className="text-base font-semibold text-slate-300">Nenhuma orientação encontrada</p>
          <p className="text-sm">
            {ehMentor
              ? 'Você ainda não registrou orientações para este mentorado. Clique no botão acima para adicionar a primeira.'
              : 'Seu mentor ainda não registrou orientações formais. Em breve novas recomendações aparecerão aqui.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {orientacoesFiltradas.map((o) => (
            <div
              key={o.id}
              className="p-5 rounded-2xl bg-[#0D1930] border border-[#26395C] hover:border-sky-500/50 transition-all shadow-md space-y-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-100">{o.titulo}</h3>
                    {getBadgeStatus(o.status)}
                  </div>
                  {o.objetivoTitulo && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-sky-400 font-medium">
                      <Icon name="target" size={13} />
                      Objetivo: {o.objetivoTitulo}
                    </span>
                  )}
                </div>

                {o.prazo && (
                  <span className="text-xs text-slate-400 bg-[#070C1E] px-2.5 py-1 rounded-lg border border-[#1E3156]">
                    Prazo sugerido: {o.prazo}
                  </span>
                )}
              </div>

              <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap bg-[#070C1E]/60 p-4 rounded-xl border border-[#1E3156]">
                {o.conteudo}
              </div>

              {o.recomendacoes && (
                <div className="p-3 rounded-xl bg-sky-950/30 border border-sky-800/40 text-xs text-sky-200 leading-relaxed">
                  <strong className="block text-sky-400 mb-1">Próximos Passos Recomendados:</strong>
                  {o.recomendacoes}
                </div>
              )}

              {/* Ações de Status */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1E3156]">
                <span className="text-xs text-slate-400 mr-2">Alterar status:</span>
                {o.status !== 'PENDENTE' && (
                  <button
                    type="button"
                    onClick={() => handleMudarStatus(o.id, 'PENDENTE')}
                    className="px-2.5 py-1 rounded-lg bg-[#1A2C50] text-slate-300 hover:text-white border border-[#26395C] text-xs transition-colors"
                  >
                    Pendente
                  </button>
                )}
                {o.status !== 'EM_ANDAMENTO' && (
                  <button
                    type="button"
                    onClick={() => handleMudarStatus(o.id, 'EM_ANDAMENTO')}
                    className="px-2.5 py-1 rounded-lg bg-amber-950/60 text-amber-300 hover:bg-amber-900/60 border border-amber-800 text-xs transition-colors"
                  >
                    Em Andamento
                  </button>
                )}
                {o.status !== 'CONCLUIDA' && (
                  <button
                    type="button"
                    onClick={() => handleMudarStatus(o.id, 'CONCLUIDA')}
                    className="px-2.5 py-1 rounded-lg bg-emerald-950/70 text-emerald-300 hover:bg-emerald-900/70 border border-emerald-800 text-xs font-semibold transition-colors"
                  >
                    Concluir Orientação ✓
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Criar Orientação */}
      {modalAberto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-xl rounded-2xl border border-[#26395C] bg-[#0D1930] p-6 text-slate-100 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#1E3156] pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Icon name="plus" size={20} className="text-sky-400" />
                Registrar Nova Orientação de Mentoria
              </h3>
              <button
                type="button"
                onClick={() => setModalAberto(false)}
                className="text-slate-400 hover:text-white"
                aria-label="Fechar modal"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCriar} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Título da Orientação *
                </label>
                <input
                  type="text"
                  required
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ex: Reforçar testes automatizados e arquitetura em camadas"
                  className="w-full rounded-xl bg-[#070C1E] border border-[#26395C] px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Conteúdo / Diagnóstico e Orientações *
                </label>
                <textarea
                  required
                  rows={4}
                  value={conteudo}
                  onChange={(e) => setConteudo(e.target.value)}
                  placeholder="Descreva detalhadamente o feedback, pontos a melhorar e o raciocínio por trás da recomendação..."
                  className="w-full resize-none rounded-xl bg-[#070C1E] border border-[#26395C] px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Passos Práticos / Recomendações
                </label>
                <textarea
                  rows={3}
                  value={recomendacoes}
                  onChange={(e) => setRecomendacoes(e.target.value)}
                  placeholder="1. Ler artigo tal; 2. Fazer exercício X; 3. Submeter PR..."
                  className="w-full resize-none rounded-xl bg-[#070C1E] border border-[#26395C] px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Vincular a Objetivo do Mentorado (Opcional)
                  </label>
                  <select
                    value={objetivoId}
                    onChange={(e) => setObjetivoId(e.target.value)}
                    className="w-full rounded-xl bg-[#070C1E] border border-[#26395C] px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
                  >
                    <option value="">Nenhum objetivo vinculado</option>
                    {objetivosDisponiveis.map((obj) => (
                      <option key={obj.id} value={obj.id}>
                        {obj.titulo}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Prazo Sugerido
                  </label>
                  <input
                    type="date"
                    value={prazo}
                    onChange={(e) => setPrazo(e.target.value)}
                    className="w-full rounded-xl bg-[#070C1E] border border-[#26395C] px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#1E3156]">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="px-4 py-2 rounded-xl border border-[#26395C] bg-[#1A2C50] text-slate-300 hover:text-white text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-medium text-sm shadow-md"
                >
                  {salvando ? 'Salvando...' : 'Salvar Orientação'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
