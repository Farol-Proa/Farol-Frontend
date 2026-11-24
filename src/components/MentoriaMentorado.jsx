import { useState, useEffect, useCallback } from "react";
import { requisicaoAPI } from "../services/api";

export default function MentoriaMentorado() {
  const [vinculoAtivo, setVinculoAtivo] = useState(null);
  const [solicitacaoPendente, setSolicitacaoPendente] = useState(null);
  const [mentores, setMentores] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  // Modal para envio de nova solicitação
  const [mentorSelecionado, setMentorSelecionado] = useState(null);
  const [objetivo, setObjetivo] = useState("");
  const [enviandoSolicitacao, setEnviandoSolicitacao] = useState(false);

  const carregarDados = useCallback(async () => {
    setCarregando(true);
    setErro("");

    try {
      // 1. Verifica vínculo ativo
      const vinculo = await requisicaoAPI("/mentoria/meu-vinculo");
      setVinculoAtivo(vinculo || null);

      if (!vinculo) {
        // 2. Se não tem vínculo ativo, verifica solicitações
        const solicitacoes = await requisicaoAPI("/mentoria/solicitacoes/minhas");
        const pendente = solicitacoes.find((s) => s.status === "PENDENTE");
        setSolicitacaoPendente(pendente || null);

        // 3. Se não tem vínculo nem solicitação pendente, lista mentores disponíveis
        if (!pendente) {
          const listaMentores = await requisicaoAPI("/mentoria/mentores");
          setMentores(listaMentores);
        }
      }
    } catch (err) {
      setErro(err.message || "Erro ao carregar dados de mentoria.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  async function cancelarSolicitacao(id) {
    if (!window.confirm("Deseja realmente cancelar esta solicitação de mentoria?")) return;

    try {
      await requisicaoAPI(`/mentoria/solicitacoes/${id}/cancelar`, {
        method: "POST",
      });
      setMensagem("Solicitação cancelada.");
      setTimeout(() => setMensagem(""), 4000);
      carregarDados();
    } catch (err) {
      alert(err.message || "Não foi possível cancelar a solicitação.");
    }
  }

  async function encerrarVinculo(id) {
    if (!window.confirm("Deseja realmente encerrar sua mentoria? O histórico será preservado.")) return;

    try {
      await requisicaoAPI(`/mentoria/vinculos/${id}/encerrar`, {
        method: "POST",
      });
      setMensagem("Mentoria encerrada com sucesso.");
      setTimeout(() => setMensagem(""), 4000);
      carregarDados();
    } catch (err) {
      alert(err.message || "Não foi possível encerrar a mentoria.");
    }
  }

  async function enviarSolicitacao(event) {
    event.preventDefault();
    if (!objetivo.trim()) {
      alert("Por favor, descreva seu objetivo para a mentoria.");
      return;
    }

    setEnviandoSolicitacao(true);
    try {
      await requisicaoAPI("/mentoria/solicitacoes", {
        method: "POST",
        body: JSON.stringify({
          mentorId: mentorSelecionado.id,
          objetivo: objetivo.trim(),
        }),
      });
      setMentorSelecionado(null);
      setObjetivo("");
      setMensagem("Solicitação enviada com sucesso! Aguarde a resposta do mentor.");
      setTimeout(() => setMensagem(""), 4000);
      carregarDados();
    } catch (err) {
      alert(err.message || "Não foi possível enviar a solicitação.");
    } finally {
      setEnviandoSolicitacao(false);
    }
  }

  return (
    <article className="painel-card col-span-full min-w-0 p-5" id="mentoria">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-white">Mentoria Voluntária</h3>
          <p className="text-xs text-slate-400">
            Conecte-se com mentores experientes para orientar seus objetivos e jornada.
          </p>
        </div>

        {vinculoAtivo && (
          <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs font-bold text-green-400">
            Mentoria Ativa
          </span>
        )}
      </div>

      {erro && (
        <div className="mb-4 rounded-xl border border-red-800 bg-red-500/10 p-3 text-xs text-red-300">
          {erro}
        </div>
      )}

      {mensagem && (
        <div className="mb-4 rounded-xl border border-green-800 bg-green-500/10 p-3 text-xs text-green-300">
          {mensagem}
        </div>
      )}

      {carregando ? (
        <p className="text-xs text-slate-400">Carregando informações de mentoria...</p>
      ) : vinculoAtivo ? (
        /* ESTADO 1: MENTORIA ATIVA */
        <div className="rounded-xl border border-[#26395C] bg-[#0D1930] p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#315CF5] text-lg font-bold text-white">
                {vinculoAtivo.mentorNome ? vinculoAtivo.mentorNome[0].toUpperCase() : "M"}
              </div>

              <div>
                <h4 className="font-bold text-white">{vinculoAtivo.mentorNome}</h4>
                <p className="text-xs text-blue-400">
                  {vinculoAtivo.mentorCargo} · {vinculoAtivo.mentorArea}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Contato: {vinculoAtivo.mentorEmail}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <a
                href={vinculoAtivo.linkReuniao}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl bg-[#315CF5] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-blue-500"
              >
                Acessar sala de reunião ↗
              </a>

              <button
                onClick={() => encerrarVinculo(vinculoAtivo.id)}
                className="rounded-xl border border-red-800/60 px-4 py-2.5 text-xs font-semibold text-red-300 transition hover:bg-red-500/10"
              >
                Encerrar mentoria
              </button>
            </div>
          </div>

          <div className="mt-4 rounded-lg bg-[#14264A] p-3">
            <p className="text-[11px] font-bold text-slate-400">OBJETIVO DA MENTORIA</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-200">
              {vinculoAtivo.objetivo || "Orientação para desenvolvimento pessoal e profissional."}
            </p>
          </div>
        </div>
      ) : solicitacaoPendente ? (
        /* ESTADO 2: SOLICITAÇÃO PENDENTE */
        <div className="rounded-xl border border-yellow-700/40 bg-yellow-500/5 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⏳</span>
              <div>
                <h4 className="font-bold text-yellow-300">Solicitação em análise</h4>
                <p className="mt-1 text-xs text-slate-300">
                  Você enviou uma solicitação para o mentor{" "}
                  <strong>{solicitacaoPendente.mentorNome}</strong> (
                  {solicitacaoPendente.mentorCargo} · {solicitacaoPendente.mentorArea}).
                </p>
                <p className="mt-2 text-xs text-slate-400">
                  <strong>Seu objetivo informado:</strong> {solicitacaoPendente.objetivo}
                </p>
              </div>
            </div>

            <button
              onClick={() => cancelarSolicitacao(solicitacaoPendente.id)}
              className="rounded-xl border border-yellow-600/50 px-4 py-2 text-xs font-semibold text-yellow-300 hover:bg-yellow-500/10"
            >
              Cancelar solicitação
            </button>
          </div>
        </div>
      ) : (
        /* ESTADO 3: DISPONÍVEIS PARA SOLICITAÇÃO */
        <div>
          {mentores.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#26395C] p-6 text-center text-xs text-slate-400">
              Nenhum mentor disponível no momento. Novos mentores voluntários serão adicionados em breve!
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {mentores.map((m) => (
                <div
                  key={m.id}
                  className="flex flex-col justify-between rounded-xl border border-[#26395C] bg-[#0D1930] p-4 transition hover:border-blue-500/50"
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#183DAD] text-sm font-bold text-[#FFDF36]">
                        {m.nome ? m.nome[0].toUpperCase() : "M"}
                      </div>

                      <div className="min-w-0">
                        <h4 className="truncate font-bold text-white">{m.nome}</h4>
                        <p className="truncate text-xs text-blue-400">
                          {m.cargo} · {m.area}
                        </p>
                      </div>
                    </div>

                    <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-slate-300">
                      {m.bio}
                    </p>

                    {m.habilidades?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {m.habilidades.slice(0, 3).map((hab) => (
                          <span
                            key={hab}
                            className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] text-blue-300"
                          >
                            {hab}
                          </span>
                        ))}
                      </div>
                    )}

                    {m.disponibilidade?.length > 0 && (
                      <p className="mt-3 text-[11px] text-slate-400">
                        <span className="font-semibold text-slate-300">Turnos: </span>
                        {m.disponibilidade.join(", ")}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => setMentorSelecionado(m)}
                    className="mt-4 w-full rounded-xl bg-[#315CF5] py-2 text-xs font-bold text-white transition hover:bg-blue-500"
                  >
                    Solicitar mentoria
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL PARA SOLICITAR MENTORIA */}
      {mentorSelecionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#26395C] bg-[#0D1930] p-6 shadow-2xl">
            <h4 className="text-lg font-bold text-white">Solicitar mentoria</h4>
            <p className="mt-1 text-xs text-slate-400">
              Mentor: <strong>{mentorSelecionado.nome}</strong> ({mentorSelecionado.cargo})
            </p>

            <form onSubmit={enviarSolicitacao} className="mt-4 space-y-4">
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-300">
                  Descreva qual é o seu objetivo com esta mentoria:
                </label>
                <textarea
                  required
                  rows={4}
                  maxLength={1000}
                  value={objetivo}
                  onChange={(e) => setObjetivo(e.target.value)}
                  placeholder="Exemplo: Preciso de ajuda para estruturar minha transição de carreira para a área de tecnologia e organizar minha rotina de estudos..."
                  className="w-full rounded-xl border border-[#35496E] bg-[#14264A] p-3 text-xs text-white outline-none focus:border-blue-500"
                />
                <p className="mt-1 text-[11px] text-slate-500">
                  Limite de 1000 caracteres. Seja claro sobre o que deseja alcançar.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMentorSelecionado(null)}
                  className="flex-1 rounded-xl border border-[#35496E] py-2.5 text-xs font-semibold text-slate-300 hover:bg-[#1A2944]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={enviandoSolicitacao}
                  className="flex-1 rounded-xl bg-[#315CF5] py-2.5 text-xs font-bold text-white hover:bg-blue-500 disabled:opacity-50"
                >
                  {enviandoSolicitacao ? "Enviando..." : "Enviar solicitação"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </article>
  );
}
