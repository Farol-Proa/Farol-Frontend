
import { useEffect, useState } from "react";
import { requisicaoAPI } from "../services/api";

const areasDisponiveis = [
  "Tecnologia",
  "Programação",
  "Design",
  "Educação",
  "Carreira",
  "Produtividade",
  "Empreendedorismo",
  "Finanças",
  "Comunicação",
  "Marketing",
  "Desenvolvimento pessoal",
  "Outros",
];

const turnosDisponiveis = ["Manhã", "Tarde", "Noite"];

export default function CadastroMentor() {
  const [etapa, setEtapa] = useState(1);

  const [dados, setDados] = useState({
    nome: "",
    email: "",
    senha: "",
    linkedin: "",
    cargo: "",
    area: "",
    habilidades: [],
    habilidadeAtual: "",
    bio: "",
    disponibilidade: [],
    linkReuniao: "",
  });

  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [etapaConfirmacao, setEtapaConfirmacao] = useState(false);
  const [codigoVerificacao, setCodigoVerificacao] = useState("");
  const [contagemReenvio, setContagemReenvio] = useState(0);
  const [carregandoCodigo, setCarregandoCodigo] = useState(false);
  const [msgCodigo, setMsgCodigo] = useState("");
  const [erroCodigo, setErroCodigo] = useState("");

  useEffect(() => {
    if (contagemReenvio <= 0) return;
    const timer = setInterval(() => {
      setContagemReenvio((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [contagemReenvio]);

  function atualizarCampo(campo, valor) {
    setDados((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  }

  function adicionarHabilidade(event) {
    event.preventDefault();

    const habilidade = dados.habilidadeAtual.trim();

    if (
      !habilidade ||
      dados.habilidades.some(
        (item) => item.toLowerCase() === habilidade.toLowerCase()
      )
    ) {
      return;
    }

    atualizarCampo("habilidades", [...dados.habilidades, habilidade]);
    atualizarCampo("habilidadeAtual", "");
  }

  function removerHabilidade(habilidade) {
    atualizarCampo(
      "habilidades",
      dados.habilidades.filter((item) => item !== habilidade)
    );
  }

  function alternarTurno(turno) {
    const selecionados = dados.disponibilidade;

    atualizarCampo(
      "disponibilidade",
      selecionados.includes(turno)
        ? selecionados.filter((item) => item !== turno)
        : [...selecionados, turno]
    );
  }

  function validarEtapa() {
    setErro("");

    if (etapa === 1) {
      if (!dados.nome.trim() || !dados.email.trim() || !dados.senha) {
        setErro("Preencha todos os campos obrigatórios.");
        return false;
      }

      if (dados.senha.length < 8) {
        setErro("A senha deve ter pelo menos 8 caracteres.");
        return false;
      }
    }

    if (etapa === 2) {
      if (
        !dados.linkedin.trim() ||
        !dados.cargo.trim() ||
        !dados.area ||
        dados.habilidades.length === 0 ||
        !dados.bio.trim()
      ) {
        setErro("Complete suas informações profissionais.");
        return false;
      }

      if (dados.bio.length > 250) {
        setErro("A biografia deve ter até 250 caracteres.");
        return false;
      }
    }

    if (etapa === 3) {
      if (
        dados.disponibilidade.length === 0 ||
        !dados.linkReuniao.trim()
      ) {
        setErro("Informe sua disponibilidade e o link da reunião.");
        return false;
      }

      try {
        const url = new URL(dados.linkReuniao);

        if (!["http:", "https:"].includes(url.protocol)) {
          throw new Error("Link inválido");
        }
      } catch {
        setErro("Informe um link de reunião válido, começando com https://.");
        return false;
      }
    }

    return true;
  }

  function avancar() {
    if (validarEtapa()) {
      setEtapa((atual) => Math.min(atual + 1, 3));
    }
  }

  function voltar() {
    setErro("");
    setEtapa((atual) => Math.max(atual - 1, 1));
  }

  async function enviarCadastro(event) {
    event.preventDefault();

    if (!validarEtapa()) return;

    setCarregando(true);
    setErro("");

    try {
      await requisicaoAPI('/mentoria/cadastro', {
        method: 'POST',
        body: JSON.stringify({
          nome: dados.nome,
          email: dados.email,
          senha: dados.senha,
          linkedin: dados.linkedin,
          cargo: dados.cargo,
          area: dados.area,
          habilidades: dados.habilidades,
          bio: dados.bio,
          disponibilidade: dados.disponibilidade,
          linkReuniaoPadrao: dados.linkReuniao,
        }),
      });
      setEtapaConfirmacao(true);
      setContagemReenvio(60);
      setMsgCodigo("Cadastro recebido! Enviamos um código de confirmação de 6 dígitos para o seu e-mail.");
      setErroCodigo("");
    } catch (err) {
      setErro(err.message || "Erro ao enviar cadastro de mentor.");
    } finally {
      setCarregando(false);
    }
  }

  async function confirmarCodigo(event) {
    if (event) event.preventDefault();
    const codigoFormatado = codigoVerificacao.trim();
    if (!codigoFormatado || codigoFormatado.length !== 6) {
      setErroCodigo("O código deve conter exatamente 6 dígitos numéricos.");
      return;
    }

    setCarregandoCodigo(true);
    setErroCodigo("");
    try {
      await requisicaoAPI('/usuarios/verificar-codigo', {
        method: 'POST',
        body: JSON.stringify({
          email: dados.email.trim().toLowerCase(),
          codigo: codigoFormatado,
        }),
      });
      setEtapaConfirmacao(false);
      setSucesso(true);
    } catch (err) {
      setErroCodigo(err.message || "Código inválido ou expirado.");
    } finally {
      setCarregandoCodigo(false);
    }
  }

  async function reenviarCodigo() {
    if (contagemReenvio > 0) return;
    setErroCodigo("");
    try {
      await requisicaoAPI('/usuarios/reenviar-codigo', {
        method: 'POST',
        body: JSON.stringify({ email: dados.email.trim().toLowerCase() }),
      });
      setContagemReenvio(60);
      setMsgCodigo("Se a conta precisar de confirmação, enviaremos um novo código.");
    } catch (err) {
      setErroCodigo(err.message || "Não foi possível reenviar o código agora.");
    }
  }

  const etapas = [
    "Dados de acesso",
    "Perfil profissional",
    "Disponibilidade",
  ];

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
              Seja um mentor voluntário
            </span>

            <h1 className="mt-8 text-4xl font-extrabold leading-tight xl:text-5xl">
              Sua experiência pode iluminar{" "}
              <span className="text-[#FFDF36]">novos caminhos.</span>
            </h1>

            <p className="mt-6 max-w-md text-base leading-relaxed text-blue-100">
              Compartilhe seus conhecimentos, ajude pessoas a superar
              desafios e faça parte de uma comunidade que acredita no
              desenvolvimento de todos.
            </p>

            <div className="mt-10 space-y-5">
              {[
                ["01", "Compartilhe sua experiência"],
                ["02", "Conecte-se com pessoas que precisam de orientação"],
                ["03", "Ajude outras pessoas a alcançar seus objetivos"],
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
        <section className="flex items-center justify-center px-4 py-8 sm:px-8 lg:px-12">
          <div className="w-full max-w-2xl">

            {/* CABEÇALHO MOBILE */}
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#315CF5] text-2xl">
                🗼
              </div>
              <span className="text-2xl font-extrabold">Farol</span>
            </div>

            <div className="mb-8">
              <p className="text-xs font-bold uppercase tracking-widest text-blue-400">
                Cadastro de mentor
              </p>

              <h2 className="mt-2 text-3xl font-extrabold">
                Faça parte do Farol!
              </h2>

              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                Preencha seus dados para oferecer orientação voluntária
                e compartilhar sua experiência.
              </p>
            </div>

            {/* INDICADOR DE ETAPAS */}
            <div className="mb-8">
              <div className="mb-3 flex items-center justify-between">
                {etapas.map((nome, index) => (
                  <div
                    key={nome}
                    className={`flex items-center gap-2 text-xs font-semibold ${
                      etapa === index + 1
                        ? "text-blue-400"
                        : etapa > index + 1
                          ? "text-green-400"
                          : "text-slate-500"
                    }`}
                  >
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full ${
                        etapa === index + 1
                          ? "bg-[#315CF5] text-white"
                          : etapa > index + 1
                            ? "bg-green-500/20 text-green-400"
                            : "bg-[#1A2944]"
                      }`}
                    >
                      {etapa > index + 1 ? "✓" : index + 1}
                    </span>

                    <span className="hidden sm:inline">{nome}</span>
                  </div>
                ))}
              </div>

              <div className="h-1.5 overflow-hidden rounded-full bg-[#1A2944]">
                <div
                  className="h-full rounded-full bg-[#315CF5] transition-all duration-300"
                  style={{ width: `${(etapa / 3) * 100}%` }}
                />
              </div>
            </div>

            {sucesso ? (
              <div className="rounded-2xl border border-[#26395C] bg-[#0D1930] p-8 text-center shadow-2xl">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500/10 text-3xl text-green-400">
                  ✓
                </div>
                <h3 className="text-2xl font-bold">E-mail confirmado e cadastro enviado!</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">
                  Seu e-mail foi verificado com sucesso e suas informações profissionais foram encaminhadas para <strong>análise da equipe do Farol</strong>.
                </p>
                <div className="mt-5 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-left text-xs leading-relaxed text-yellow-200">
                  <p className="font-bold">Aviso importante:</p>
                  <p className="mt-1">
                    A verificação do seu e-mail garante a segurança da sua conta, mas <strong>não significa aprovação imediata do perfil de mentor</strong>.
                    Nossa equipe revisará seu perfil (status: <em>Pendente</em>) e, assim que for aprovado, seu painel de mentoria será liberado.
                  </p>
                </div>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <a
                    href="/"
                    className="rounded-xl border border-[#35496E] px-6 py-3 font-semibold text-slate-300 transition hover:bg-[#1A2944]"
                  >
                    Voltar ao início
                  </a>
                  <a
                    href="/login-mentor"
                    className="rounded-xl bg-[#FFDF36] px-6 py-3 font-extrabold text-[#101827] transition hover:bg-yellow-300"
                  >
                    Acessar área do mentor →
                  </a>
                </div>
              </div>
            ) : etapaConfirmacao ? (
              <div className="rounded-2xl border border-[#26395C] bg-[#0D1930] p-6 shadow-2xl sm:p-8">
                <div className="mb-6 text-center">
                  <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-3xl text-blue-400">
                    ✉️
                  </div>
                  <h3 className="text-2xl font-bold">Confirme seu e-mail de mentor</h3>
                  <p className="mt-2 text-sm text-slate-300">
                    Enviamos um código de 6 dígitos para <strong className="text-white">{dados.email}</strong>.
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    O código é válido por <strong>10 minutos</strong>. Não esqueça de verificar a caixa de spam.
                  </p>
                </div>

                {msgCodigo && (
                  <div className="mb-4 rounded-xl border border-green-500/30 bg-green-500/10 p-3.5 text-xs text-green-300">
                    {msgCodigo}
                  </div>
                )}

                {erroCodigo && (
                  <div role="alert" className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-300">
                    {erroCodigo}
                  </div>
                )}

                <form onSubmit={confirmarCodigo} className="space-y-4">
                  <div>
                    <label htmlFor="codigo-verificacao-mentor" className="mb-2 block text-center text-sm font-semibold text-slate-200">
                      Código de 6 dígitos
                    </label>
                    <input
                      id="codigo-verificacao-mentor"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      autoFocus
                      autoComplete="one-time-code"
                      aria-label="Código de verificação de 6 dígitos para o mentor"
                      placeholder="000000"
                      value={codigoVerificacao}
                      onPaste={(e) => {
                        e.preventDefault();
                        const colado = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
                        setCodigoVerificacao(colado);
                      }}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setCodigoVerificacao(val);
                      }}
                      className="w-full h-14 rounded-xl border border-[#35496E] bg-[#14264A] text-center font-mono text-3xl font-extrabold tracking-[0.4em] text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={codigoVerificacao.length !== 6 || carregandoCodigo}
                    className="w-full rounded-xl bg-[#FFDF36] py-3 font-extrabold text-[#101827] transition hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {carregandoCodigo ? "Confirmando..." : "Confirmar código"}
                  </button>

                  <div className="pt-2">
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
                  </div>
                </form>
              </div>
            ) : (
            <form
              onSubmit={
                etapa === 3 ? enviarCadastro : (event) => {
                  event.preventDefault();
                  avancar();
                }
              }
              className="rounded-2xl border border-[#26395C] bg-[#0D1930] p-5 shadow-2xl sm:p-7"
            >

              {/* ETAPA 1 */}
              {etapa === 1 && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-xl font-bold">Dados de acesso</h3>
                    <p className="mt-1 text-sm text-slate-400">
                      Primeiro, precisamos conhecer você.
                    </p>
                  </div>

                  <Campo
                    label="Nome completo"
                    placeholder="Ex.: Roberto Silva"
                    value={dados.nome}
                    onChange={(v) => atualizarCampo("nome", v)}
                    required
                  />

                  <Campo
                    label="E-mail"
                    type="email"
                    placeholder="seuemail@exemplo.com"
                    value={dados.email}
                    onChange={(v) => atualizarCampo("email", v)}
                    required
                  />

                  <Campo
                    label="Senha"
                    type="password"
                    placeholder="Mínimo de 8 caracteres"
                    value={dados.senha}
                    onChange={(v) => atualizarCampo("senha", v)}
                    required
                  />

                  <p className="text-xs text-slate-500">
                    Utilize uma senha segura e não compartilhe seus dados
                    de acesso.
                  </p>
                </div>
              )}

              {/* ETAPA 2 */}
              {etapa === 2 && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-xl font-bold">
                      Perfil profissional
                    </h3>
                    <p className="mt-1 text-sm text-slate-400">
                      Conte sobre sua experiência e como pode ajudar.
                    </p>
                  </div>

                  <Campo
                    label="Link do LinkedIn"
                    placeholder="https://www.linkedin.com/in/seu-perfil"
                    value={dados.linkedin}
                    onChange={(v) => atualizarCampo("linkedin", v)}
                    required
                  />

                  <Campo
                    label="Cargo ou profissão"
                    placeholder="Ex.: Desenvolvedor de Software"
                    value={dados.cargo}
                    onChange={(v) => atualizarCampo("cargo", v)}
                    required
                  />

                  <div>
                    <label className="mb-2 block text-sm font-semibold">
                      Área de atuação
                    </label>
                    <select
                      required
                      value={dados.area}
                      onChange={(e) =>
                        atualizarCampo("area", e.target.value)
                      }
                      className="w-full rounded-xl border border-[#35496E] bg-[#14264A] px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500"
                    >
                      <option value="">Selecione sua área</option>
                      {areasDisponiveis.map((area) => (
                        <option key={area} value={area}>
                          {area}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold">
                      Habilidades e temas que domina
                    </label>

                    <p className="mb-3 text-xs text-slate-400">
                      Adicione palavras que representem seus conhecimentos.
                    </p>

                    <div className="flex gap-2">
                      <input
                        value={dados.habilidadeAtual}
                        onChange={(e) =>
                          atualizarCampo("habilidadeAtual", e.target.value)
                        }
                        placeholder="Ex.: Java, React, liderança..."
                        className="min-w-0 flex-1 rounded-xl border border-[#35496E] bg-[#14264A] px-4 py-3 text-sm outline-none focus:border-blue-500"
                      />

                      <button
                        type="button"
                        onClick={adicionarHabilidade}
                        className="rounded-xl bg-[#315CF5] px-5 font-bold transition hover:bg-blue-500"
                      >
                        +
                      </button>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {dados.habilidades.map((habilidade) => (
                        <button
                          type="button"
                          key={habilidade}
                          onClick={() => removerHabilidade(habilidade)}
                          className="rounded-full border border-blue-700 bg-blue-500/10 px-3 py-2 text-xs font-medium text-blue-300 transition hover:border-red-500 hover:text-red-300"
                          title="Remover habilidade"
                        >
                          {habilidade} ×
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex justify-between">
                      <label className="text-sm font-semibold">
                        Breve apresentação
                      </label>
                      <span
                        className={`text-xs ${
                          dados.bio.length > 250
                            ? "text-red-400"
                            : "text-slate-500"
                        }`}
                      >
                        {dados.bio.length}/250
                      </span>
                    </div>

                    <textarea
                      rows={4}
                      maxLength={250}
                      value={dados.bio}
                      onChange={(e) =>
                        atualizarCampo("bio", e.target.value)
                      }
                      placeholder="Conte brevemente sobre sua experiência e como pode ajudar outras pessoas..."
                      className="w-full resize-none rounded-xl border border-[#35496E] bg-[#14264A] px-4 py-3 text-sm leading-relaxed outline-none transition focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
              )}

              {/* ETAPA 3 */}
              {etapa === 3 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold">
                      Disponibilidade e reuniões
                    </h3>
                    <p className="mt-1 text-sm text-slate-400">
                      Informe quando pode orientar e onde acontecerão
                      as sessões.
                    </p>
                  </div>

                  <div>
                    <label className="mb-3 block text-sm font-semibold">
                      Quais turnos você tem disponibilidade?
                    </label>

                    <div className="grid grid-cols-3 gap-3">
                      {turnosDisponiveis.map((turno) => {
                        const selecionado =
                          dados.disponibilidade.includes(turno);

                        return (
                          <button
                            type="button"
                            key={turno}
                            onClick={() => alternarTurno(turno)}
                            className={`rounded-xl border p-4 text-center transition ${
                              selecionado
                                ? "border-blue-500 bg-blue-500/20 text-blue-300"
                                : "border-[#35496E] bg-[#14264A] text-slate-400 hover:border-blue-500"
                            }`}
                          >
                            <span className="mb-2 block text-xl">
                              {turno === "Manhã"
                                ? "☀"
                                : turno === "Tarde"
                                  ? "🌤"
                                  : "☾"}
                            </span>
                            <span className="text-sm font-semibold">
                              {turno}
                            </span>
                            {selecionado && (
                              <span className="mt-1 block text-xs">
                                ✓ Selecionado
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    <p className="mt-2 text-xs text-slate-500">
                      Você pode selecionar mais de um turno.
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold">
                      Link fixo da sala de reunião
                    </label>

                    <input
                      type="url"
                      required
                      value={dados.linkReuniao}
                      onChange={(e) =>
                        atualizarCampo("linkReuniao", e.target.value)
                      }
                      placeholder="https://meet.google.com/..."
                      className="w-full rounded-xl border border-[#35496E] bg-[#14264A] px-4 py-3 text-sm outline-none transition focus:border-blue-500"
                    />

                    <p className="mt-2 text-xs leading-relaxed text-slate-500">
                      Pode ser um link permanente do Google Meet, Zoom
                      ou Discord. Evite utilizar links pessoais que não
                      queira compartilhar com seus mentorados.
                    </p>
                  </div>

                  <div className="rounded-xl border border-yellow-700/40 bg-yellow-500/5 p-4">
                    <div className="flex gap-3">
                      <span className="text-xl">🛡️</span>
                      <div>
                        <p className="text-sm font-bold text-yellow-300">
                          Análise do cadastro
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-slate-400">
                          Seus dados profissionais serão analisados pela
                          equipe do Farol antes da liberação do perfil
                          como mentor voluntário.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ERRO */}
              {erro && (
                <div className="mt-5 rounded-xl border border-red-800 bg-red-500/10 p-3 text-sm text-red-300">
                  {erro}
                </div>
              )}

              {/* BOTÕES */}
              <div className="mt-7 flex gap-3">
                {etapa > 1 && (
                  <button
                    type="button"
                    onClick={voltar}
                    className="flex-1 rounded-xl border border-[#35496E] py-3 font-semibold text-slate-300 transition hover:bg-[#1A2944]"
                  >
                    Voltar
                  </button>
                )}

                {etapa < 3 ? (
                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-[#FFDF36] py-3 font-extrabold text-[#101827] transition hover:bg-yellow-300"
                  >
                    Continuar →
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={carregando}
                    className="flex-1 rounded-xl bg-[#FFDF36] py-3 font-extrabold text-[#101827] transition hover:bg-yellow-300 disabled:opacity-50"
                  >
                    {carregando ? "Enviando dados..." : "Enviar cadastro"}
                  </button>
                )}
              </div>
            </form>
            )}

            <p className="mt-6 text-center text-xs text-slate-500">
              Já possui cadastro?{" "}
              <a
                href="/login-mentor"
                className="font-bold text-blue-400 hover:text-blue-300"
              >
                Entrar
              </a>
            </p>

            <p className="mt-3 text-center text-xs text-slate-600">
              Farol — Que ilumina o seu caminho!
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

function Campo({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  required = false,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-[#35496E] bg-[#14264A] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
      />
    </div>
  );
}
