import { useEffect, useState } from 'react';
import { requisicaoAPI } from '../services/api';

export default function ConfirmarMentor() {
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [dados, setDados] = useState(null);
  const [motivoRejeicao, setMotivoRejeicao] = useState('');
  const [processando, setProcessando] = useState(false);
  const [sucesso, setSucesso] = useState(null);

  const parametros = new URLSearchParams(window.location.search);
  const token = parametros.get('token');

  useEffect(() => {
    async function carregarDetalhes() {
      if (!token) {
        setErro('Token de confirmação não informado na URL.');
        setCarregando(false);
        return;
      }

      try {
        const resposta = await requisicaoAPI(
          `/mentoria/decisao-admin/detalhes?token=${encodeURIComponent(token)}`
        );
        setDados(resposta);
      } catch (err) {
        setErro(
          err.message ||
            'Este link de confirmação é inválido, expirou ou já foi utilizado.'
        );
      } finally {
        setCarregando(false);
      }
    }

    carregarDetalhes();
  }, [token]);

  async function confirmarDecisao(event) {
    if (event) event.preventDefault();
    if (!token) return;

    setProcessando(true);
    setErro('');

    try {
      const resposta = await requisicaoAPI('/mentoria/decisao-admin/executar', {
        method: 'POST',
        body: JSON.stringify({
          token,
          motivoRejeicao: motivoRejeicao.trim() || null,
        }),
      });

      setSucesso({
        status: resposta.status,
        mensagem: resposta.mensagem,
        acao: dados?.acao,
      });
    } catch (err) {
      setErro(
        err.message ||
          'Não foi possível processar a decisão. O link pode ter expirado ou já ter sido utilizado.'
      );
    } finally {
      setProcessando(false);
    }
  }

  const ehAprovacao = dados?.acao?.toUpperCase() === 'APROVAR';

  return (
    <div className="min-h-screen bg-[#080E1A] text-slate-100 flex flex-col justify-between p-4 sm:p-6 md:p-8">
      {/* Topo / Marca */}
      <header className="max-w-xl mx-auto w-full flex items-center justify-between pb-6 border-b border-[#1A2944]">
        <a href="/" className="flex items-center gap-3 group">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#315CF5] text-xl shadow-lg shadow-blue-500/20 group-hover:scale-105 transition">
            🗼
          </span>
          <div>
            <h1 className="text-lg font-bold tracking-tight">Farol</h1>
            <p className="text-xs text-slate-400">Validação de Mentores</p>
          </div>
        </a>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
          Decisão Administrativa
        </span>
      </header>

      {/* Conteúdo Central */}
      <main className="max-w-xl mx-auto w-full my-auto py-8">
        {carregando ? (
          <div className="rounded-2xl border border-[#26395C] bg-[#0D1930] p-8 text-center shadow-2xl">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-3 border-[#315CF5] border-t-transparent" />
            <h2 className="text-lg font-semibold text-slate-200">
              Validando link de segurança...
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Verificando autenticidade e validade do token de decisão.
            </p>
          </div>
        ) : sucesso ? (
          <div className="rounded-2xl border border-[#26395C] bg-[#0D1930] p-8 text-center shadow-2xl">
            <div
              className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl text-3xl ${
                ehAprovacao
                  ? 'bg-green-500/10 text-green-400'
                  : 'bg-red-500/10 text-red-400'
              }`}
            >
              {ehAprovacao ? '✓' : '✕'}
            </div>
            <h2 className="text-2xl font-bold text-slate-100">
              {ehAprovacao
                ? 'Mentor aprovado com sucesso!'
                : 'Cadastro de mentor rejeitado'}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              {ehAprovacao
                ? `O perfil de ${dados?.nome} foi ativado. Enviamos um e-mail comemorativo com orientações para o candidato acessar o painel de mentoria.`
                : `A recusa do cadastro de ${dados?.nome} foi confirmada. O candidato recebeu uma notificação cordial por e-mail.`}
            </p>
            <div className="mt-6 pt-6 border-t border-[#1A2944] flex justify-center">
              <a
                href="/"
                className="rounded-xl bg-[#315CF5] px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-blue-600 transition"
              >
                Ir para o início
              </a>
            </div>
          </div>
        ) : erro ? (
          <div className="rounded-2xl border border-red-500/30 bg-[#0D1930] p-8 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-3xl text-red-400">
              ⚠️
            </div>
            <h2 className="text-xl font-bold text-slate-100">
              Link de decisão indisponível
            </h2>
            <p className="mt-3 text-sm text-slate-300 leading-relaxed">
              {erro}
            </p>
            <p className="mt-2 text-xs text-slate-400">
              Por segurança, tokens expiram ou são invalidados imediatamente após o uso.
            </p>
            <div className="mt-6 pt-6 border-t border-[#1A2944] flex justify-center">
              <a
                href="/"
                className="rounded-xl border border-[#35496E] px-6 py-2.5 text-sm font-semibold text-slate-300 hover:bg-[#1A2944] transition"
              >
                Voltar à página inicial
              </a>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-[#26395C] bg-[#0D1930] p-6 sm:p-8 shadow-2xl">
            {/* Cabeçalho da ação */}
            <div
              className={`rounded-xl p-4 border flex items-center gap-3 ${
                ehAprovacao
                  ? 'bg-green-500/10 border-green-500/30 text-green-300'
                  : 'bg-red-500/10 border-red-500/30 text-red-300'
              }`}
            >
              <span className="text-2xl">{ehAprovacao ? '✓' : '✕'}</span>
              <div>
                <h3 className="font-bold text-sm sm:text-base">
                  {ehAprovacao
                    ? 'Confirmar Aprovação de Mentor'
                    : 'Confirmar Rejeição de Mentor'}
                </h3>
                <p className="text-xs opacity-90">
                  {ehAprovacao
                    ? 'Esta ação ativará o painel de mentoria do candidato.'
                    : 'Esta ação registrará o encerramento da candidatura.'}
                </p>
              </div>
            </div>

            {/* Resumo do candidato */}
            <div className="mt-6 rounded-xl border border-[#1E355B] bg-[#12203E]/60 p-4 space-y-2.5 text-sm">
              <div className="flex justify-between border-b border-[#1E355B]/60 pb-2">
                <span className="text-slate-400 text-xs">Candidato:</span>
                <span className="font-semibold text-slate-100">{dados?.nome}</span>
              </div>
              <div className="flex justify-between border-b border-[#1E355B]/60 pb-2">
                <span className="text-slate-400 text-xs">E-mail:</span>
                <span className="text-slate-200">{dados?.email}</span>
              </div>
              <div className="flex justify-between border-b border-[#1E355B]/60 pb-2">
                <span className="text-slate-400 text-xs">Cargo / Profissão:</span>
                <span className="text-slate-200">{dados?.cargo}</span>
              </div>
              <div className="flex justify-between border-b border-[#1E355B]/60 pb-2">
                <span className="text-slate-400 text-xs">Área:</span>
                <span className="text-slate-200">{dados?.area}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 text-xs">Status atual:</span>
                <span className="text-yellow-400 font-semibold text-xs uppercase tracking-wide">
                  Pendente de Análise
                </span>
              </div>
            </div>

            {/* Campo de motivo se for rejeição */}
            {!ehAprovacao && (
              <div className="mt-5">
                <label
                  htmlFor="motivoRejeicao"
                  className="block text-xs font-semibold text-slate-300 mb-1.5"
                >
                  Motivo da recusa (opcional — será enviado ao candidato):
                </label>
                <textarea
                  id="motivoRejeicao"
                  rows="3"
                  value={motivoRejeicao}
                  onChange={(e) => setMotivoRejeicao(e.target.value)}
                  placeholder="Ex: Não preenche os requisitos de experiência para a trilha selecionada..."
                  className="w-full rounded-xl border border-[#35496E] bg-[#0A1324] p-3 text-sm text-slate-100 placeholder-slate-500 focus:border-[#315CF5] focus:outline-none focus:ring-1 focus:ring-[#315CF5]"
                />
              </div>
            )}

            {/* Botões de Ação */}
            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={confirmarDecisao}
                disabled={processando}
                className={`w-full rounded-xl py-3 text-sm font-bold shadow-lg transition disabled:opacity-60 disabled:cursor-not-allowed ${
                  ehAprovacao
                    ? 'bg-green-600 hover:bg-green-500 text-white shadow-green-600/20'
                    : 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/20'
                }`}
              >
                {processando
                  ? 'Processando decisão...'
                  : ehAprovacao
                  ? 'Confirmar Aprovação do Mentor'
                  : 'Confirmar Rejeição do Mentor'}
              </button>

              <a
                href="/"
                className="w-full text-center py-2.5 text-xs text-slate-400 hover:text-slate-200 transition"
              >
                Cancelar e voltar ao início
              </a>
            </div>

            <p className="mt-4 text-center text-[11px] text-slate-500">
              🔒 Operação autenticada por token criptográfico de uso único.
            </p>
          </div>
        )}
      </main>

      {/* Rodapé */}
      <footer className="max-w-xl mx-auto w-full pt-4 text-center text-xs text-slate-500 border-t border-[#1A2944]">
        Farol · Que ilumina o seu caminho.
      </footer>
    </div>
  );
}
