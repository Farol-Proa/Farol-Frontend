import { useEffect, useState } from "react";
import { requisicaoAPI } from "../services/api";

export default function LoginMentor({ onLoginSucesso }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [avisoStatus, setAvisoStatus] = useState(null);

  const [precisaVerificar, setPrecisaVerificar] = useState(false);
  const [codigo, setCodigo] = useState("");
  const [contagemReenvio, setContagemReenvio] = useState(0);
  const [carregandoCodigo, setCarregandoCodigo] = useState(false);
  const [msgVerificacao, setMsgVerificacao] = useState("");
  const [erroVerificacao, setErroVerificacao] = useState("");
  const [sucessoVerificacao, setSucessoVerificacao] = useState("");

  useEffect(() => {
    if (contagemReenvio <= 0) return;
    const timer = setInterval(() => {
      setContagemReenvio((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [contagemReenvio]);

  async function entrar(event) {
    event.preventDefault();
    setErro("");
    setAvisoStatus(null);

    if (!email.trim() || !senha) {
      setErro("Preencha seu e-mail e sua senha.");
      return;
    }

    setCarregando(true);
    try {
      const resposta = await requisicaoAPI("/usuarios/login", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), senha }),
      });

      sessionStorage.setItem("token", resposta.token);
      sessionStorage.setItem("usuario", JSON.stringify(resposta.usuario));

      // Verifica o perfil de mentor do usuário
      try {
        const perfil = await requisicaoAPI("/mentoria/perfil-atual");
        if (perfil.status === "APROVADO") {
          if (onLoginSucesso) {
            onLoginSucesso(perfil);
          } else {
            window.location.pathname = "/painel-mentor";
          }
        } else if (perfil.status === "PENDENTE") {
          setAvisoStatus({
            tipo: "pendente",
            titulo: "Cadastro em análise",
            mensagem:
              "Seu cadastro de mentor foi recebido e está sob análise da equipe do Farol. Assim que for aprovado, seu painel será liberado.",
          });
        } else if (perfil.status === "REJEITADO") {
          setAvisoStatus({
            tipo: "rejeitado",
            titulo: "Cadastro não aprovado",
            mensagem: `Seu cadastro de mentor não foi aprovado pela equipe.${perfil.motivoRejeicao ? " Motivo: " + perfil.motivoRejeicao : ""}`,
          });
        }
      } catch (errPerfil) {
        if (errPerfil.status === 404) {
          setAvisoStatus({
            tipo: "sem_perfil",
            titulo: "Conta sem perfil de mentor",
            mensagem:
              "Sua conta está cadastrada no Farol, mas ainda não possui perfil de mentor voluntário.",
            link: "/cadastro-mentor",
            linkTexto: "Completar cadastro de mentor →",
          });
        } else {
          throw errPerfil;
        }
      }
    } catch (err) {
      const msg = err.message || "E-mail ou senha incorretos.";
      setErro(msg);
      if (msg.toLowerCase().includes("confirme seu e-mail")) {
        setPrecisaVerificar(true);
        setContagemReenvio(0);
        setErroVerificacao("");
        setMsgVerificacao("Seu e-mail precisa ser confirmado antes de entrar. Digite o código de 6 dígitos enviado ou solicite o reenvio.");
      }
    } finally {
      setCarregando(false);
    }
  }

  async function confirmarCodigo(event) {
    if (event) event.preventDefault();
    const codigoFormatado = codigo.trim();
    if (!codigoFormatado || codigoFormatado.length !== 6) {
      setErroVerificacao("O código deve conter exatamente 6 dígitos numéricos.");
      return;
    }

    setCarregandoCodigo(true);
    setErroVerificacao("");
    try {
      await requisicaoAPI("/usuarios/verificar-codigo", {
        method: "POST",
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          codigo: codigoFormatado,
        }),
      });
      setSucessoVerificacao("E-mail confirmado com sucesso! Digite sua senha para entrar.");
      setPrecisaVerificar(false);
      setCodigo("");
      setErro("");
    } catch (err) {
      setErroVerificacao(err.message || "Código inválido ou expirado.");
    } finally {
      setCarregandoCodigo(false);
    }
  }

  async function reenviarCodigo() {
    if (contagemReenvio > 0) return;
    setErroVerificacao("");
    try {
      await requisicaoAPI("/usuarios/reenviar-codigo", {
        method: "POST",
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      setContagemReenvio(60);
      setMsgVerificacao("Se a conta precisar de confirmação, enviaremos um novo código.");
    } catch (err) {
      setErroVerificacao(err.message || "Não foi possível reenviar o código agora.");
    }
  }

  function recuperarSenha() {
    window.location.href = "/?reset=1";
  }

  return (
    <main className="min-h-screen bg-[#070C16] text-white">
      <div className="grid min-h-screen lg:grid-cols-[0.85fr_1.15fr]">

        {/* LADO ESQUERDO */}
        <section className="relative hidden flex-col justify-between overflow-hidden bg-[#315CF5] p-10 lg:flex xl:p-14">
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full border border-white/10" />
          <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full border border-white/10" />

          <a href="/" className="relative flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-2xl">
              🗼
            </div>
            <span className="text-3xl font-extrabold">Farol</span>
          </a>

          <div className="relative max-w-lg">
            <span className="rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-widest">
              Área do mentor
            </span>

            <h1 className="mt-8 text-4xl font-extrabold leading-tight xl:text-5xl">
              Continue iluminando{" "}
              <span className="text-[#FFDF36]">novos caminhos.</span>
            </h1>

            <p className="mt-6 max-w-md text-base leading-relaxed text-blue-100">
              Acesse sua conta e continue compartilhando sua experiência
              para ajudar outras pessoas a alcançarem seus objetivos.
            </p>

            <div className="mt-10 space-y-5">
              {[
                ["01", "Acompanhe seus mentorados"],
                ["02", "Organize seus encontros"],
                ["03", "Compartilhe conhecimento"],
              ].map(([numero, texto]) => (
                <div key={numero} className="flex items-center gap-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#183DAD] font-bold text-[#FFDF36]">
                    {numero}
                  </span>
                  <p className="text-sm font-medium text-white">{texto}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex items-end justify-between">
            <p className="text-xs text-blue-100">
              Farol — Que ilumina o seu caminho!
            </p>
            <span className="text-7xl">🧭</span>
          </div>
        </section>

        {/* LADO DIREITO */}
        <section className="flex items-center justify-center px-4 py-10 sm:px-8 lg:px-12">
          <div className="w-full max-w-md">

            {/* CABEÇALHO MOBILE */}
            <div className="mb-10 flex items-center gap-3 lg:hidden">
              <a href="/" className="flex items-center gap-2">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#315CF5] text-2xl">
                  🗼
                </div>
                <span className="text-2xl font-extrabold">Farol</span>
              </a>
            </div>

            <div className="mb-8">
              <p className="text-xs font-bold uppercase tracking-widest text-blue-400">
                Acesso do mentor
              </p>

              <h2 className="mt-2 text-3xl font-extrabold">
                Que bom ter você de volta!
              </h2>

              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                Entre na sua conta para continuar sua jornada como mentor
                voluntário do Farol.
              </p>
            </div>

            {avisoStatus && (
              <div
                className={`mb-6 rounded-2xl border p-5 ${
                  avisoStatus.tipo === "pendente"
                    ? "border-yellow-700/50 bg-yellow-500/10 text-yellow-200"
                    : avisoStatus.tipo === "rejeitado"
                      ? "border-red-700/50 bg-red-500/10 text-red-200"
                      : "border-blue-700/50 bg-blue-500/10 text-blue-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">
                    {avisoStatus.tipo === "pendente" ? "⏳" : avisoStatus.tipo === "rejeitado" ? "❌" : "ℹ️"}
                  </span>
                  <div>
                    <h4 className="font-bold">{avisoStatus.titulo}</h4>
                    <p className="mt-1 text-xs leading-relaxed opacity-90">{avisoStatus.mensagem}</p>
                    {avisoStatus.link && (
                      <a
                        href={avisoStatus.link}
                        className="mt-3 inline-block text-xs font-bold underline hover:opacity-80"
                      >
                        {avisoStatus.linkTexto}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {sucessoVerificacao && (
              <div className="mb-6 rounded-2xl border border-green-500/40 bg-green-500/10 p-4 text-xs font-semibold text-green-300">
                {sucessoVerificacao}
              </div>
            )}

            {precisaVerificar ? (
              <div className="rounded-2xl border border-[#26395C] bg-[#0D1930] p-6 shadow-2xl sm:p-8">
                <div className="mb-6 text-center">
                  <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-3xl text-blue-400">
                    ✉️
                  </div>
                  <h3 className="text-2xl font-bold">Confirme seu e-mail</h3>
                  <p className="mt-2 text-sm text-slate-300">
                    Enviamos um código de 6 dígitos para <strong className="text-white">{email}</strong>.
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    O código é válido por <strong>10 minutos</strong>. Não esqueça de verificar a caixa de spam.
                  </p>
                </div>

                {msgVerificacao && (
                  <div className="mb-4 rounded-xl border border-green-500/30 bg-green-500/10 p-3.5 text-xs text-green-300">
                    {msgVerificacao}
                  </div>
                )}

                {erroVerificacao && (
                  <div role="alert" className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-300">
                    {erroVerificacao}
                  </div>
                )}

                <form onSubmit={confirmarCodigo} className="space-y-4">
                  <div>
                    <label htmlFor="codigo-verificacao-login-mentor" className="mb-2 block text-center text-sm font-semibold text-slate-200">
                      Código de 6 dígitos
                    </label>
                    <input
                      id="codigo-verificacao-login-mentor"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      autoFocus
                      autoComplete="one-time-code"
                      aria-label="Código de verificação de 6 dígitos"
                      placeholder="000000"
                      value={codigo}
                      onPaste={(e) => {
                        e.preventDefault();
                        const colado = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
                        setCodigo(colado);
                      }}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setCodigo(val);
                      }}
                      className="w-full h-14 rounded-xl border border-[#35496E] bg-[#14264A] text-center font-mono text-3xl font-extrabold tracking-[0.4em] text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={codigo.length !== 6 || carregandoCodigo}
                    className="w-full rounded-xl bg-[#FFDF36] py-3 font-extrabold text-[#101827] transition hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {carregandoCodigo ? "Confirmando..." : "Confirmar código"}
                  </button>

                  <div className="pt-2 flex flex-col gap-2">
                    <button
                      type="button"
                      disabled={contagemReenvio > 0}
                      onClick={reenviarCodigo}
                      className={`w-full py-2.5 text-xs font-semibold rounded-xl border transition ${
                        contagemReenvio > 0
                          ? "text-slate-500 border-slate-700 bg-slate-800/40 cursor-not-allowed"
                          : "text-blue-400 border-blue-500/30 hover:bg-blue-500/10"
                      }`}
                    >
                      {contagemReenvio > 0
                        ? `Reenviar código em ${contagemReenvio}s`
                        : "Reenviar código"}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPrecisaVerificar(false);
                        setErroVerificacao("");
                        setMsgVerificacao("");
                      }}
                      className="mt-1 text-center text-xs text-slate-400 hover:text-slate-200"
                    >
                      ← Voltar ao login de mentor
                    </button>
                  </div>
                </form>
              </div>
            ) : (
            <form
              onSubmit={entrar}
              className="rounded-2xl border border-[#26395C] bg-[#0D1930] p-5 shadow-2xl sm:p-7"
            >
              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    E-mail
                  </label>

                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="seuemail@exemplo.com"
                    autoComplete="email"
                    required
                    className="w-full rounded-xl border border-[#35496E] bg-[#14264A] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                  />
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-sm font-semibold">
                      Senha
                    </label>

                    <button
                      type="button"
                      onClick={recuperarSenha}
                      className="text-xs font-semibold text-blue-400 transition hover:text-blue-300"
                    >
                      Esqueceu a senha?
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type={mostrarSenha ? "text" : "password"}
                      value={senha}
                      onChange={(event) => setSenha(event.target.value)}
                      placeholder="Digite sua senha"
                      autoComplete="current-password"
                      required
                      className="w-full rounded-xl border border-[#35496E] bg-[#14264A] px-4 py-3 pr-20 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                    />

                    <button
                      type="button"
                      onClick={() => setMostrarSenha((atual) => !atual)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-blue-400 hover:text-blue-300"
                    >
                      {mostrarSenha ? "Ocultar" : "Mostrar"}
                    </button>
                  </div>
                </div>
              </div>

              {erro && (
                <div className="mt-5 rounded-xl border border-red-800 bg-red-500/10 p-3.5 text-sm text-red-300">
                  <p>{erro}</p>
                  {erro.toLowerCase().includes("confirme seu e-mail") && (
                    <button
                      type="button"
                      onClick={() => {
                        setPrecisaVerificar(true);
                        setContagemReenvio(0);
                        setErroVerificacao("");
                        setMsgVerificacao("Digite o código de 6 dígitos enviado para seu e-mail ou solicite o reenvio.");
                      }}
                      className="mt-2 block font-bold text-yellow-300 underline hover:text-yellow-200 text-xs text-left"
                    >
                      Confirmar meu e-mail com código de 6 dígitos →
                    </button>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={carregando}
                className="mt-7 w-full rounded-xl bg-[#FFDF36] py-3 font-extrabold text-[#101827] transition hover:bg-yellow-300 disabled:opacity-50"
              >
                {carregando ? "Entrando..." : "Entrar"}
              </button>
            </form>
            )}

            <p className="mt-7 text-center text-sm text-slate-400">
              Ainda não possui cadastro?{" "}
              <a
                href="/cadastro-mentor"
                className="font-bold text-blue-400 hover:text-blue-300"
              >
                Seja um mentor
              </a>
            </p>

            <p className="mt-5 text-center text-xs text-slate-600">
              Farol — Que ilumina o seu caminho!
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
