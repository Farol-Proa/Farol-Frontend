import { useState, useEffect, useRef, useCallback } from 'react';
import { listarMensagensMentoria, enviarMensagemMentoria } from '../../services/mentoriaApi.js';
import Icon from '../../components/Icon.jsx';

export default function ChatMentoria({
  vinculoId,
  tituloConversa = 'Conversa com o Mentor',
  subtitulo = 'Canal direto para tirar dúvidas, alinhar objetivos e trocar orientações',
  nomeContato = 'Mentor',
  cargoContato = '',
}) {
  const [mensagens, setMensagens] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [novoTexto, setNovoTexto] = useState('');
  const [erro, setErro] = useState('');

  const fimMensagensRef = useRef(null);
  const usuarioLogado = JSON.parse(sessionStorage.getItem('usuario') || '{}');
  const meuEmail = (usuarioLogado.email || '').toLowerCase();

  const carregarMensagens = useCallback(async (silencioso = false) => {
    if (!vinculoId) return;
    if (!silencioso) setCarregando(true);
    setErro('');

    try {
      const lista = await listarMensagensMentoria(vinculoId);
      setMensagens(lista || []);
    } catch (err) {
      if (!silencioso) {
        setErro(err.message || 'Não foi possível carregar as mensagens.');
      }
    } finally {
      if (!silencioso) setCarregando(false);
    }
  }, [vinculoId]);

  useEffect(() => {
    carregarMensagens();
    const timer = setInterval(() => {
      carregarMensagens(true);
    }, 6000); // Polling suave para sincronização em tempo real
    return () => clearInterval(timer);
  }, [carregarMensagens]);

  useEffect(() => {
    fimMensagensRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens]);

  async function handleEnviar(event) {
    event?.preventDefault();
    const textoLimpo = novoTexto.trim();
    if (!textoLimpo || enviando || !vinculoId) return;

    setEnviando(true);
    setErro('');

    try {
      const enviada = await enviarMensagemMentoria(vinculoId, textoLimpo);
      setMensagens((anteriores) => [...anteriores, enviada]);
      setNovoTexto('');
    } catch (err) {
      setErro(err.message || 'Erro ao enviar mensagem.');
    } finally {
      setEnviando(false);
    }
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleEnviar();
    }
  }

  function formatarHora(dataHoraString) {
    if (!dataHoraString) return '';
    try {
      const d = new Date(dataHoraString);
      return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  }

  function formatarDataCabecalho(dataHoraString) {
    if (!dataHoraString) return '';
    try {
      const d = new Date(dataHoraString);
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return '';
    }
  }

  return (
    <div className="flex flex-col h-full rounded-2xl border border-[#26395C] bg-[#0A1224] overflow-hidden shadow-xl">
      {/* Cabeçalho do Chat */}
      <div className="flex items-center justify-between px-6 py-4 bg-[#0D1930] border-b border-[#1E3156]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-md">
            {nomeContato.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 flex items-center gap-2">
              {nomeContato}
              {cargoContato && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-sky-950/70 border border-sky-800 text-sky-300 font-normal">
                  {cargoContato}
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400">{subtitulo}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => carregarMensagens(false)}
          className="p-2 text-slate-400 hover:text-slate-200 hover:bg-[#1A2C50] rounded-lg transition-colors"
          title="Atualizar mensagens"
          aria-label="Atualizar mensagens"
        >
          <Icon name="refresh" size={16} />
        </button>
      </div>

      {/* Área de Mensagens */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-[#0A1224] to-[#070C1E]">
        {carregando && mensagens.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-400 text-sm">
            <span className="animate-spin inline-block mr-2">◌</span> Carregando conversa...
          </div>
        ) : erro && mensagens.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-rose-400 text-sm gap-2">
            <p>{erro}</p>
            <button
              onClick={() => carregarMensagens()}
              className="text-xs px-3 py-1 bg-rose-950/50 border border-rose-800 rounded-lg text-rose-200 hover:bg-rose-900/50"
            >
              Tentar novamente
            </button>
          </div>
        ) : mensagens.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 py-12 px-4">
            <div className="w-14 h-14 rounded-full bg-[#12203E] border border-[#26395C] flex items-center justify-center text-sky-400 mb-3 shadow-inner">
              <Icon name="message-square" size={26} />
            </div>
            <h4 className="text-base font-semibold text-slate-200">Nenhuma mensagem ainda</h4>
            <p className="text-sm text-slate-400 max-w-sm mt-1">
              Envie a primeira mensagem para iniciar o alinhamento com {nomeContato}.
            </p>
          </div>
        ) : (
          mensagens.map((msg, index) => {
            const enviadaPorMim = (msg.remetenteEmail || '').toLowerCase() === meuEmail;
            return (
              <div
                key={msg.id || index}
                className={`flex flex-col ${enviadaPorMim ? 'items-end' : 'items-start'}`}
              >
                <div className="text-[11px] text-slate-400 mb-1 px-1">
                  {enviadaPorMim ? 'Você' : msg.remetenteNome || nomeContato} • {formatarHora(msg.criadoEm)}
                </div>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm break-words whitespace-pre-wrap ${
                    enviadaPorMim
                      ? 'bg-sky-600 text-white rounded-tr-none'
                      : 'bg-[#15233E] border border-[#26395C] text-slate-100 rounded-tl-none'
                  }`}
                >
                  {msg.conteudo}
                </div>
              </div>
            );
          })
        )}
        <div ref={fimMensagensRef} />
      </div>

      {/* Caixa de Digitação */}
      <form onSubmit={handleEnviar} className="p-4 bg-[#0D1930] border-t border-[#1E3156]">
        {erro && <div className="text-xs text-rose-400 mb-2 px-1">{erro}</div>}
        <div className="flex items-end gap-2">
          <textarea
            value={novoTexto}
            onChange={(e) => setNovoTexto(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Escreva uma mensagem para ${nomeContato}... (Enter para enviar)`}
            rows={2}
            className="flex-1 resize-none rounded-xl bg-[#070C1E] border border-[#26395C] px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
          />
          <button
            type="submit"
            disabled={enviando || !novoTexto.trim()}
            className="px-4 py-3 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium rounded-xl text-sm transition-all shadow-md flex items-center gap-1.5"
            aria-label="Enviar mensagem"
          >
            <span>{enviando ? 'Enviando...' : 'Enviar'}</span>
            <Icon name="send" size={15} />
          </button>
        </div>
      </form>
    </div>
  );
}
