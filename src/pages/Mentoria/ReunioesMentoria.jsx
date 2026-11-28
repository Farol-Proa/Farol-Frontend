import { useState, useEffect, useCallback } from 'react';
import {
  listarReunioesMentoria,
  criarReuniaoMentoria,
  atualizarStatusReuniao,
} from '../../services/mentoriaApi.js';
import Icon from '../../components/Icon.jsx';

export default function ReunioesMentoria({
  vinculoId,
  linkPadrao = '',
  permiteAgendar = true,
  tituloSeção = 'Sessões e Reuniões de Mentoria',
}) {
  const [reunioes, setReunioes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [mensagemSucesso, setMensagemSucesso] = useState('');

  // Modal de Agendamento
  const [modalAberto, setModalAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [pauta, setPauta] = useState('');
  const [dataHora, setDataHora] = useState('');
  const [duracaoMinutos, setDuracaoMinutos] = useState(60);
  const [linkReuniao, setLinkReuniao] = useState(linkPadrao || '');

  const carregarReunioes = useCallback(async () => {
    if (!vinculoId) return;
    setCarregando(true);
    setErro('');

    try {
      const lista = await listarReunioesMentoria(vinculoId);
      setReunioes(lista || []);
    } catch (err) {
      setErro(err.message || 'Erro ao carregar reuniões.');
    } finally {
      setCarregando(false);
    }
  }, [vinculoId]);

  useEffect(() => {
    carregarReunioes();
  }, [carregarReunioes]);

  async function handleAgendar(e) {
    e.preventDefault();
    if (!titulo.trim() || !dataHora) {
      alert('Por favor, informe ao menos o título e a data/hora da reunião.');
      return;
    }

    setSalvando(true);
    setErro('');

    try {
      const nova = await criarReuniaoMentoria(vinculoId, {
        titulo: titulo.trim(),
        pauta: pauta.trim() || null,
        dataHora,
        duracaoMinutos: Number(duracaoMinutos) || 60,
        linkReuniao: linkReuniao.trim() || linkPadrao || null,
      });

      setReunioes((prev) => [...prev, nova].sort((a, b) => new Date(a.dataHora) - new Date(b.dataHora)));
      setModalAberto(false);
      setTitulo('');
      setPauta('');
      setDataHora('');
      setMensagemSucesso('Reunião agendada com sucesso!');
      setTimeout(() => setMensagemSucesso(''), 4000);
    } catch (err) {
      setErro(err.message || 'Não foi possível agendar a reunião.');
    } finally {
      setSalvando(false);
    }
  }

  async function handleMudarStatus(reuniaoId, novoStatus) {
    try {
      const atualizada = await atualizarStatusReuniao(reuniaoId, novoStatus);
      setReunioes((prev) =>
        prev.map((r) => (r.id === reuniaoId ? atualizada : r))
      );
      setMensagemSucesso(`Status atualizado para ${novoStatus}.`);
      setTimeout(() => setMensagemSucesso(''), 3000);
    } catch (err) {
      alert(err.message || 'Erro ao atualizar status da reunião.');
    }
  }

  function formatarDataHora(iso) {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      return d.toLocaleString('pt-BR', {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  }

  const agora = new Date();
  const proximasReunioes = reunioes.filter(
    (r) => r.status === 'AGENDADA' && new Date(r.dataHora) >= agora
  );
  const reunioesPassadasOuFinalizadas = reunioes.filter(
    (r) => r.status !== 'AGENDADA' || new Date(r.dataHora) < agora
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-[#0D1930] border border-[#26395C]">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Icon name="calendar" size={22} className="text-sky-400" />
            {tituloSeção}
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Acompanhe suas sessões síncronas, pautas combinadas e links de videoconferência.
          </p>
        </div>

        {permiteAgendar && (
          <button
            type="button"
            onClick={() => {
              setLinkReuniao(linkPadrao || '');
              setModalAberto(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-medium text-sm flex items-center gap-2 shadow-lg transition-all"
          >
            <Icon name="plus" size={16} />
            <span>Agendar Reunião</span>
          </button>
        )}
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
          <span className="animate-spin inline-block mr-2">◌</span> Carregando reuniões...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Próximas Reuniões */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-slate-200 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              Próximas Reuniões ({proximasReunioes.length})
            </h3>

            {proximasReunioes.length === 0 ? (
              <div className="p-8 rounded-2xl bg-[#0D1930]/70 border border-[#26395C] text-center text-slate-400 text-sm">
                Nenhuma reunião futura agendada no momento.
              </div>
            ) : (
              proximasReunioes.map((r) => (
                <div
                  key={r.id}
                  className="p-5 rounded-2xl bg-[#0D1930] border border-[#26395C] hover:border-sky-500/50 transition-all shadow-md space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-slate-100 text-base">{r.titulo}</h4>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-950/70 text-emerald-300 border border-emerald-800">
                      Agendada
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5 text-sky-300 font-medium">
                      <Icon name="clock" size={14} />
                      {formatarDataHora(r.dataHora)}
                    </span>
                    <span>•</span>
                    <span>{r.duracaoMinutos || 60} minutos</span>
                  </div>

                  {r.pauta && (
                    <div className="p-3 rounded-xl bg-[#070C1E] border border-[#1E3156] text-xs text-slate-300 leading-relaxed">
                      <strong className="text-slate-400 block mb-1">Pauta / Tópicos:</strong>
                      {r.pauta}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    {r.linkReuniao ? (
                      <a
                        href={r.linkReuniao}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Icon name="video" size={14} />
                        <span>Entrar na Reunião</span>
                      </a>
                    ) : (
                      <span className="text-xs text-slate-500 italic">Sem link configurado</span>
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleMudarStatus(r.id, 'REALIZADA')}
                        className="px-2.5 py-1 rounded-lg bg-[#1A2C50] hover:bg-emerald-900/60 text-slate-300 hover:text-emerald-300 border border-[#26395C] text-xs transition-colors"
                        title="Marcar como realizada"
                      >
                        Concluir
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMudarStatus(r.id, 'CANCELADA')}
                        className="px-2.5 py-1 rounded-lg bg-[#1A2C50] hover:bg-rose-900/60 text-slate-300 hover:text-rose-300 border border-[#26395C] text-xs transition-colors"
                        title="Cancelar reunião"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Histórico / Realizadas */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-slate-300 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
              Histórico de Reuniões ({reunioesPassadasOuFinalizadas.length})
            </h3>

            {reunioesPassadasOuFinalizadas.length === 0 ? (
              <div className="p-8 rounded-2xl bg-[#0D1930]/40 border border-[#1E3156] text-center text-slate-500 text-sm">
                Nenhum histórico anterior de reuniões.
              </div>
            ) : (
              reunioesPassadasOuFinalizadas.map((r) => {
                const ehRealizada = r.status === 'REALIZADA';
                const ehCancelada = r.status === 'CANCELADA';
                return (
                  <div
                    key={r.id}
                    className="p-4 rounded-xl bg-[#0D1930]/60 border border-[#1E3156] space-y-2 opacity-85"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-medium text-slate-300 text-sm">{r.titulo}</h4>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                          ehRealizada
                            ? 'bg-blue-950/60 text-blue-300 border-blue-800'
                            : ehCancelada
                            ? 'bg-rose-950/60 text-rose-300 border-rose-800'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {ehRealizada ? 'Realizada' : ehCancelada ? 'Cancelada' : 'Finalizada'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400">
                      {formatarDataHora(r.dataHora)} • {r.duracaoMinutos || 60} min
                    </p>

                    {r.pauta && (
                      <p className="text-xs text-slate-400 italic bg-[#070C1E]/50 p-2 rounded-lg border border-[#1E3156]/50">
                        {r.pauta}
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Modal de Agendamento */}
      {modalAberto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg rounded-2xl border border-[#26395C] bg-[#0D1930] p-6 text-slate-100 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1E3156] pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Icon name="calendar" size={20} className="text-sky-400" />
                Agendar Reunião de Mentoria
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

            <form onSubmit={handleAgendar} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Título da Reunião *
                </label>
                <input
                  type="text"
                  required
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ex: Alinhamento de Metas e Revisão do Mapa"
                  className="w-full rounded-xl bg-[#070C1E] border border-[#26395C] px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Data e Hora *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={dataHora}
                    onChange={(e) => setDataHora(e.target.value)}
                    className="w-full rounded-xl bg-[#070C1E] border border-[#26395C] px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Duração (minutos)
                  </label>
                  <select
                    value={duracaoMinutos}
                    onChange={(e) => setDuracaoMinutos(e.target.value)}
                    className="w-full rounded-xl bg-[#070C1E] border border-[#26395C] px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
                  >
                    <option value={30}>30 minutos</option>
                    <option value={45}>45 minutos</option>
                    <option value={60}>60 minutos (1 hora)</option>
                    <option value={90}>90 minutos (1h 30m)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Link da Videoconferência (Google Meet, Zoom, etc.)
                </label>
                <input
                  type="url"
                  value={linkReuniao}
                  onChange={(e) => setLinkReuniao(e.target.value)}
                  placeholder="https://meet.google.com/..."
                  className="w-full rounded-xl bg-[#070C1E] border border-[#26395C] px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Pauta e Tópicos a Discutir
                </label>
                <textarea
                  rows={3}
                  value={pauta}
                  onChange={(e) => setPauta(e.target.value)}
                  placeholder="Dúvidas específicas, feedback sobre tarefas, próximos passos..."
                  className="w-full resize-none rounded-xl bg-[#070C1E] border border-[#26395C] px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
                />
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
                  {salvando ? 'Salvando...' : 'Confirmar Agendamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
