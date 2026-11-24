import { useState, useEffect, useCallback } from "react";
import { requisicaoAPI } from "../../services/api";

const menu = [
  { id: "inicio", label: "Visão geral", icon: "◫" },
  { id: "solicitacoes", label: "Solicitações", icon: "✉" },
  { id: "mentorados", label: "Meus mentorados", icon: "♧" },
  { id: "perfil", label: "Meu perfil", icon: "◉" },
];

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#315CF5] text-xl">
        🗼
      </div>
      <span className="text-2xl font-extrabold tracking-tight text-white">
        Farol
      </span>
    </div>
  );
}

function Avatar({ nome = "Mentor", inicial, cor = "bg-blue-600", tamanho = "h-11 w-11" }) {
  const letra = inicial || (nome ? nome.trim()[0].toUpperCase() : "M");
  return (
    <div
      className={`${tamanho} ${cor} flex shrink-0 items-center justify-center rounded-full font-bold text-white`}
      title={nome}
    >
      {letra}
    </div>
  );
}

function Card({ children, className = "", id }) {
  return (
    <section
      id={id}
      className={`rounded-2xl border border-[#26395C] bg-[#12203E] p-5 ${className}`}
    >
      {children}
    </section>
  );
}

function SectionTitle({ title, subtitle, action }) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="text-lg font-bold text-white">{title}</h2>
        {subtitle && (
          <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export default function PainelMentor({ onLogout }) {
  const [secaoAtiva, setSecaoAtiva] = useState("inicio");
  const [perfil, setPerfil] = useState(null);
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [vinculos, setVinculos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  // Modal para aceitar solicitação informando o link da reunião
  const [modalAceitar, setModalAceitar] = useState(null);
  const [salvandoAceite, setSalvandoAceite] = useState(false);

  // Modal para atualizar link de reunião de um vínculo ativo
  const [modalLink, setModalLink] = useState(null);
  const [salvandoLink, setSalvandoLink] = useState(false);

  const carregarDados = useCallback(async () => {
    setCarregando(true);
    setErro("");

    try {
      const dadosPerfil = await requisicaoAPI("/mentoria/perfil-atual");
      setPerfil(dadosPerfil);

      const [dadosSolicitacoes, dadosVinculos] = await Promise.all([
        requisicaoAPI("/mentoria/mentor/solicitacoes"),
        requisicaoAPI("/mentoria/mentor/mentorados"),
      ]);

      setSolicitacoes(dadosSolicitacoes.filter((s) => s.status === "PENDENTE"));
      setVinculos(dadosVinculos);
    } catch (err) {
      setErro(err.message || "Erro ao carregar dados do painel do mentor.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  function navegar(secao) {
    setSecaoAtiva(secao);
    const elemento = document.getElementById(secao);
    if (elemento) {
      elemento.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function handleLogout() {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("usuario");
    if (onLogout) {
      onLogout();
    } else {
      window.location.href = "/";
    }
  }

  async function recusarSolicitacao(id) {
    if (!window.confirm("Deseja realmente recusar esta solicitação de mentoria?")) return;

    try {
      await requisicaoAPI(`/mentoria/mentor/solicitacoes/${id}/responder`, {
        method: "POST",
        body: JSON.stringify({ aceitar: false }),
      });
      setMensagem("Solicitação recusada.");
      setTimeout(() => setMensagem(""), 4000);
      carregarDados();
    } catch (err) {
      alert(err.message || "Não foi possível recusar a solicitação.");
    }
  }

  function abrirModalAceitar(solicitacao) {
    setModalAceitar({
      solicitacaoId: solicitacao.id,
      mentoradoNome: solicitacao.mentoradoNome,
      linkReuniao: perfil?.linkReuniaoPadrao || "https://meet.google.com/",
    });
  }

  async function confirmarAceite(event) {
    event.preventDefault();
    if (!modalAceitar?.linkReuniao?.trim()) {
      alert("Informe um link de reunião válido.");
      return;
    }

    setSalvandoAceite(true);
    try {
      await requisicaoAPI(`/mentoria/mentor/solicitacoes/${modalAceitar.solicitacaoId}/responder`, {
        method: "POST",
        body: JSON.stringify({
          aceitar: true,
          linkReuniao: modalAceitar.linkReuniao.trim(),
        }),
      });
      setModalAceitar(null);
      setMensagem("Mentoria aceita com sucesso! O vínculo foi estabelecido.");
      setTimeout(() => setMensagem(""), 4000);
      carregarDados();
    } catch (err) {
      alert(err.message || "Não foi possível aceitar a solicitação.");
    } finally {
      setSalvandoAceite(false);
    }
  }

  function abrirModalLink(vinculo) {
    setModalLink({
      vinculoId: vinculo.id,
      mentoradoNome: vinculo.mentoradoNome,
      linkReuniao: vinculo.linkReuniao,
    });
  }

  async function confirmarAtualizacaoLink(event) {
    event.preventDefault();
    if (!modalLink?.linkReuniao?.trim()) {
      alert("Informe um link de reunião válido.");
      return;
    }

    setSalvandoLink(true);
    try {
      await requisicaoAPI(`/mentoria/mentor/vinculos/${modalLink.vinculoId}/link`, {
        method: "PATCH",
        body: JSON.stringify({
          linkReuniao: modalLink.linkReuniao.trim(),
        }),
      });
      setModalLink(null);
      setMensagem("Link da reunião atualizado com sucesso!");
      setTimeout(() => setMensagem(""), 4000);
      carregarDados();
    } catch (err) {
      alert(err.message || "Não foi possível atualizar o link da reunião.");
    } finally {
      setSalvandoLink(false);
    }
  }

  async function encerrarVinculo(vinculoId) {
    if (!window.confirm("Deseja realmente encerrar este vínculo de mentoria? O histórico será preservado.")) {
      return;
    }

    try {
      await requisicaoAPI(`/mentoria/vinculos/${vinculoId}/encerrar`, {
        method: "POST",
      });
      setMensagem("Vínculo de mentoria encerrado com sucesso.");
      setTimeout(() => setMensagem(""), 4000);
      carregarDados();
    } catch (err) {
      alert(err.message || "Não foi possível encerrar a mentoria.");
    }
  }

  const hoje = new Date();
  const dataAtual = hoje.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const nomeMentor = perfil?.nome || "Mentor";
  const vinculosAtivos = vinculos.filter((v) => v.status === "ATIVO");

  return (
    <div className="min-h-screen bg-[#070C16] text-white">
      <div className="flex min-h-screen">

        {/* SIDEBAR */}
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-[#26395C] bg-[#091326] lg:flex">
          <div className="border-b border-[#26395C] px-6 py-5">
            <Logo />
          </div>

          <div className="px-4 py-6">
            <p className="mb-3 px-3 text-xs font-bold uppercase tracking-widest text-slate-500">
              Área do mentor
            </p>

            <nav className="space-y-2">
              {menu.map((item) => (
                <button
                  key={item.id}
                  onClick={() => navegar(item.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                    secaoAtiva === item.id
                      ? "bg-[#315CF5] text-white shadow-lg shadow-blue-950/30"
                      : "text-slate-400 hover:bg-[#14264A] hover:text-white"
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="mt-auto p-4">
            <div className="rounded-2xl border border-blue-900 bg-[#12264D] p-4">
              <div className="mb-3 text-2xl">🗼</div>
              <h3 className="font-bold">Continue iluminando caminhos!</h3>
              <p className="mt-2 text-xs leading-relaxed text-blue-200">
                Sua experiência pode fazer a diferença na jornada de outra
                pessoa.
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="mt-4 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
            >
              ↪ Sair da conta
            </button>
          </div>
        </aside>

        {/* CONTEÚDO */}
        <main className="min-w-0 flex-1 lg:ml-64">

          {/* HEADER */}
          <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[#26395C] bg-[#091326]/95 px-5 backdrop-blur-md lg:px-9">
            <div>
              <p className="text-sm font-semibold text-white">
                Área do Mentor
              </p>
              <p className="hidden text-xs text-slate-500 sm:block">
                Farol — Que ilumina o seu caminho!
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Avatar nome={nomeMentor} />
                <div className="hidden sm:block">
                  <p className="text-sm font-bold">{nomeMentor}</p>
                  <p className="text-xs text-blue-400">{perfil?.cargo || "Mentor voluntário"}</p>
                </div>
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-7xl space-y-8 p-5 lg:p-9">

            {/* ALERTA DE ERRO OU SUCESSO */}
            {erro && (
              <div className="rounded-xl border border-red-800 bg-red-500/10 p-4 text-sm text-red-300">
                {erro}
              </div>
            )}

            {mensagem && (
              <div className="rounded-xl border border-green-800 bg-green-500/10 p-4 text-sm text-green-300">
                {mensagem}
              </div>
            )}

            {carregando && (
              <div className="text-sm text-slate-400">Carregando informações da mentoria...</div>
            )}

            {/* BOAS-VINDAS */}
            <section id="inicio" className="scroll-mt-24">
              <div className="flex flex-col justify-between gap-5 rounded-2xl border border-blue-900 bg-gradient-to-r from-[#102B69] via-[#122F72] to-[#10203D] p-6 md:flex-row md:items-center md:p-8">
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-300">
                    Painel do mentor voluntário
                  </p>

                  <h1 className="text-2xl font-extrabold sm:text-3xl">
                    Olá, {nomeMentor}!
                  </h1>

                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-blue-100">
                    Sua experiência orienta pessoas e transforma jornadas. Aqui você gerencia suas solicitações e mentorados.
                  </p>

                  <p className="mt-4 text-xs capitalize text-blue-300">
                    {dataAtual}
                  </p>
                </div>

                <div className="flex h-32 items-center justify-center text-7xl md:w-40">
                  🗼
                </div>
              </div>
            </section>

            {/* INDICADORES */}
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                {
                  label: "Mentorados ativos",
                  valor: vinculosAtivos.length,
                  icon: "♧",
                  cor: "text-blue-400",
                },
                {
                  label: "Solicitações pendentes",
                  valor: solicitacoes.length,
                  icon: "✉",
                  cor: "text-yellow-400",
                },
                {
                  label: "Total de mentorias realizadas",
                  valor: vinculos.length,
                  icon: "✓",
                  cor: "text-green-400",
                },
              ].map((item) => (
                <Card key={item.label}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">{item.label}</p>
                      <p className="mt-2 text-3xl font-extrabold">{item.valor}</p>
                    </div>
                    <span className={`text-3xl ${item.cor}`}>
                      {item.icon}
                    </span>
                  </div>
                </Card>
              ))}
            </section>

            {/* SOLICITAÇÕES */}
            <section id="solicitacoes" className="scroll-mt-24">
              <Card>
                <SectionTitle
                  title="Solicitações de mentoria"
                  subtitle="Pessoas que procuram sua orientação para atingir seus objetivos."
                  action={
                    <span className="rounded-full bg-blue-500/15 px-3 py-1 text-xs font-bold text-blue-300">
                      {solicitacoes.length} pendentes
                    </span>
                  }
                />

                {solicitacoes.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[#35496E] p-8 text-center">
                    <div className="text-3xl">🧭</div>
                    <p className="mt-3 font-semibold">
                      Nenhuma solicitação pendente no momento
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      Quando um usuário enviar um pedido de mentoria para o seu perfil, ele aparecerá aqui.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 xl:grid-cols-2">
                    {solicitacoes.map((solicitacao) => (
                      <div
                        key={solicitacao.id}
                        className="rounded-xl border border-[#26395C] bg-[#0D1930] p-4"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar nome={solicitacao.mentoradoNome} />

                          <div className="min-w-0 flex-1">
                            <h3 className="font-bold">{solicitacao.mentoradoNome}</h3>
                            <p className="text-xs text-blue-300">
                              {solicitacao.mentoradoEmail}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 rounded-lg bg-[#14264A] p-3">
                          <p className="text-xs font-bold text-slate-400">
                            OBJETIVO DO MENTORADO
                          </p>
                          <p className="mt-2 text-sm leading-relaxed text-slate-200">
                            {solicitacao.objetivo}
                          </p>
                        </div>

                        <div className="mt-4 flex gap-2">
                          <button
                            onClick={() => recusarSolicitacao(solicitacao.id)}
                            className="flex-1 rounded-lg border border-[#35496E] px-3 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-[#26395C]"
                          >
                            Recusar
                          </button>

                          <button
                            onClick={() => abrirModalAceitar(solicitacao)}
                            className="flex-1 rounded-lg bg-[#315CF5] px-3 py-2.5 text-sm font-bold text-white transition hover:bg-blue-500"
                          >
                            Aceitar mentoria
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </section>

            {/* MENTORADOS */}
            <section id="mentorados" className="scroll-mt-24">
              <Card>
                <SectionTitle
                  title="Meus mentorados"
                  subtitle="Acompanhe as pessoas vinculadas à sua mentoria."
                  action={
                    <span className="text-xs text-blue-400">
                      {vinculosAtivos.length} ativos
                    </span>
                  }
                />

                {vinculos.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[#35496E] p-8 text-center text-slate-400">
                    Nenhum mentorado vinculado até o momento.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {vinculos.map((vinculo) => {
                      const ativo = vinculo.status === "ATIVO";
                      return (
                        <div
                          key={vinculo.id}
                          className="flex flex-col gap-4 rounded-xl border border-[#26395C] bg-[#0D1930] p-4 sm:flex-row sm:items-center"
                        >
                          <Avatar nome={vinculo.mentoradoNome} />

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold">{vinculo.mentoradoNome}</h3>
                              <span
                                className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                                  ativo
                                    ? "bg-green-500/20 text-green-400"
                                    : "bg-slate-700 text-slate-400"
                                }`}
                              >
                                {ativo ? "Ativo" : "Encerrado"}
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-slate-400">
                              {vinculo.mentoradoEmail}
                            </p>
                            <p className="mt-2 text-sm text-slate-300">
                              <span className="font-semibold text-slate-400">Objetivo: </span>
                              {vinculo.objetivo}
                            </p>
                          </div>

                          <div className="flex flex-col gap-2 sm:items-end">
                            {ativo ? (
                              <>
                                <a
                                  href={vinculo.linkReuniao}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="rounded-lg bg-[#315CF5] px-4 py-2 text-center text-xs font-bold text-white transition hover:bg-blue-500"
                                >
                                  Entrar na reunião ↗
                                </a>

                                <div className="flex gap-2">
                                  <button
                                    onClick={() => abrirModalLink(vinculo)}
                                    className="rounded-lg border border-[#35496E] px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-[#1A2944]"
                                  >
                                    Alterar link
                                  </button>

                                  <button
                                    onClick={() => encerrarVinculo(vinculo.id)}
                                    className="rounded-lg border border-red-800/60 px-3 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-500/10"
                                  >
                                    Encerrar
                                  </button>
                                </div>
                              </>
                            ) : (
                              <span className="text-xs text-slate-500">
                                Encerrado em {new Date(vinculo.encerradoEm).toLocaleDateString("pt-BR")}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            </section>

            {/* PERFIL */}
            <section id="perfil" className="scroll-mt-24">
              <Card>
                <SectionTitle
                  title="Meu perfil de mentor"
                  subtitle="Informações apresentadas para os mentorados."
                />

                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                  <Avatar nome={nomeMentor} tamanho="h-20 w-20 text-2xl" />

                  <div className="flex-1">
                    <h3 className="text-xl font-bold">{nomeMentor}</h3>
                    <p className="mt-1 text-sm text-blue-300">
                      {perfil?.cargo || "Mentor voluntário"} · {perfil?.area || ""}
                    </p>
                    <p className="mt-2 text-sm text-slate-400">
                      {perfil?.bio || "Sem biografia cadastrada."}
                    </p>
                    {perfil?.linkedin && (
                      <a
                        href={perfil.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-block text-xs font-semibold text-blue-400 hover:underline"
                      >
                        Perfil no LinkedIn ↗
                      </a>
                    )}
                  </div>
                </div>

                <div className="mt-6 border-t border-[#26395C] pt-5">
                  <h4 className="mb-3 text-sm font-bold text-slate-300">
                    Habilidades e temas
                  </h4>

                  <div className="flex flex-wrap gap-2">
                    {perfil?.habilidades?.length > 0 ? (
                      perfil.habilidades.map((hab) => (
                        <span
                          key={hab}
                          className="rounded-full border border-blue-800 bg-blue-500/10 px-4 py-1.5 text-xs text-blue-300"
                        >
                          {hab}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500">Nenhuma habilidade listada.</span>
                    )}
                  </div>
                </div>

                <div className="mt-6 border-t border-[#26395C] pt-5">
                  <h4 className="mb-2 text-sm font-bold text-slate-300">
                    Link padrão de reunião
                  </h4>
                  <p className="text-xs text-slate-400">
                    {perfil?.linkReuniaoPadrao || "Não configurado."}
                  </p>
                </div>
              </Card>
            </section>

            {/* RODAPÉ */}
            <footer className="border-t border-[#26395C] py-6 text-center text-xs text-slate-500">
              Farol — Que ilumina o seu caminho!
              <p className="mt-1">
                Obrigado por compartilhar seu conhecimento voluntário.
              </p>
            </footer>
          </div>
        </main>
      </div>

      {/* MODAL PARA ACEITAR SOLICITAÇÃO INFORMANDO LINK */}
      {modalAceitar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#26395C] bg-[#0D1930] p-6 shadow-2xl">
            <h3 className="text-lg font-bold">Aceitar mentoria</h3>
            <p className="mt-1 text-xs text-slate-400">
              Defina o link da sala de reunião para orientar <strong>{modalAceitar.mentoradoNome}</strong>.
            </p>

            <form onSubmit={confirmarAceite} className="mt-5 space-y-4">
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-300">
                  Link da reunião (Google Meet, Zoom, etc.)
                </label>
                <input
                  type="url"
                  required
                  value={modalAceitar.linkReuniao}
                  onChange={(e) =>
                    setModalAceitar((ant) => ({ ...ant, linkReuniao: e.target.value }))
                  }
                  placeholder="https://meet.google.com/..."
                  className="w-full rounded-xl border border-[#35496E] bg-[#14264A] px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500"
                />
                <p className="mt-1 text-[11px] text-slate-500">
                  Cada mentoria possui seu próprio link, que poderá ser atualizado a qualquer momento.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalAceitar(null)}
                  className="flex-1 rounded-xl border border-[#35496E] py-2.5 text-sm font-semibold text-slate-300 hover:bg-[#1A2944]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvandoAceite}
                  className="flex-1 rounded-xl bg-[#315CF5] py-2.5 text-sm font-bold text-white hover:bg-blue-500 disabled:opacity-50"
                >
                  {salvandoAceite ? "Aceitando..." : "Confirmar e Vincular"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PARA ALTERAR LINK DA REUNIÃO */}
      {modalLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#26395C] bg-[#0D1930] p-6 shadow-2xl">
            <h3 className="text-lg font-bold">Atualizar link da reunião</h3>
            <p className="mt-1 text-xs text-slate-400">
              Mentorado: <strong>{modalLink.mentoradoNome}</strong>
            </p>

            <form onSubmit={confirmarAtualizacaoLink} className="mt-5 space-y-4">
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-300">
                  Novo link da sala de reunião
                </label>
                <input
                  type="url"
                  required
                  value={modalLink.linkReuniao}
                  onChange={(e) =>
                    setModalLink((ant) => ({ ...ant, linkReuniao: e.target.value }))
                  }
                  placeholder="https://meet.google.com/..."
                  className="w-full rounded-xl border border-[#35496E] bg-[#14264A] px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalLink(null)}
                  className="flex-1 rounded-xl border border-[#35496E] py-2.5 text-sm font-semibold text-slate-300 hover:bg-[#1A2944]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvandoLink}
                  className="flex-1 rounded-xl bg-[#315CF5] py-2.5 text-sm font-bold text-white hover:bg-blue-500 disabled:opacity-50"
                >
                  {salvandoLink ? "Salvando..." : "Salvar link"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NAVEGAÇÃO MOBILE */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex justify-around border-t border-[#26395C] bg-[#091326] px-2 py-3 lg:hidden">
        {menu.map((item) => (
          <button
            key={item.id}
            onClick={() => navegar(item.id)}
            className={`flex flex-col items-center gap-1 text-[10px] ${
              secaoAtiva === item.id
                ? "text-blue-400"
                : "text-slate-400"
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
