import { useState, useEffect, useId } from 'react';
import Icon from '../../components/Icon';

function normalizarUrl(url) {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function validarUrlSegura(url) {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

function gerarIdBloco() {
  return 'bloco_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7);
}

function normalizarBlocosIniciais(blocks) {
  if (!Array.isArray(blocks)) return [];
  return blocks.map((bloco) => {
    const id = bloco.id || gerarIdBloco();
    const type = bloco.type || 'paragraph';
    const content = bloco.content || {};

    if (type === 'list') {
      const rawItems = Array.isArray(content.items) ? content.items : [];
      const items = rawItems.map((item) => (typeof item === 'string' ? item : item?.text ?? ''));
      return { id, type, content: { items: items.length > 0 ? items : [''] } };
    }

    if (type === 'code') {
      return { id, type, content: { code: content.code ?? content.text ?? '' } };
    }

    if (type === 'reference') {
      return {
        id,
        type,
        content: {
          title: content.title ?? '',
          url: content.url ?? '',
        },
      };
    }

    return { id, type, content: { text: content.text ?? '' } };
  });
}

function BlocoItemLeitura({ bloco }) {
  if (bloco.type === 'heading') {
    return (
      <h3 className="text-lg font-bold text-[#F5D547] mt-5 first:mt-0 tracking-tight">
        {bloco.content?.text || <span className="italic opacity-50">Título sem texto</span>}
      </h3>
    );
  }

  if (bloco.type === 'list') {
    const itens = (bloco.content?.items ?? []).filter((it) => typeof it === 'string' && it.trim());
    if (itens.length === 0) {
      return <p className="text-sm italic text-slate-400">Lista vazia.</p>;
    }
    return (
      <ul className="my-2.5 space-y-1.5 pl-5 list-disc text-slate-200 text-sm leading-relaxed marker:text-[#F5D547]">
        {itens.map((item, idx) => (
          <li key={`${bloco.id}-item-${idx}`}>{item}</li>
        ))}
      </ul>
    );
  }

  if (bloco.type === 'callout') {
    return (
      <aside className="my-3 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-100 text-sm leading-relaxed shadow-inner">
        <span className="text-[#F5D547] mt-0.5 shrink-0">
          <Icon name="sparkles" size={18} />
        </span>
        <div className="flex-1 whitespace-pre-wrap">{bloco.content?.text || 'Destaque importante'}</div>
      </aside>
    );
  }

  if (bloco.type === 'code') {
    const codigo = bloco.content?.code ?? bloco.content?.text ?? '';
    return (
      <div className="my-3 rounded-xl border border-[#26395C] bg-[#050A1A] overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#1E293B] bg-[#0A1128] px-3.5 py-1.5 text-xs text-slate-400 font-mono">
          <span>Código / Comandos</span>
          <button
            type="button"
            onClick={() => navigator.clipboard?.writeText(codigo)}
            className="text-[11px] text-sky-400 hover:text-sky-300 transition"
          >
            Copiar
          </button>
        </div>
        <pre className="p-3.5 overflow-x-auto font-mono text-xs text-sky-200 leading-relaxed">
          <code>{codigo || '// Nenhum código inserido'}</code>
        </pre>
      </div>
    );
  }

  if (bloco.type === 'reference') {
    const titulo = bloco.content?.title || 'Link de referência';
    const rawUrl = bloco.content?.url || '';
    const safeUrl = normalizarUrl(rawUrl);
    const isValid = validarUrlSegura(safeUrl);

    return (
      <div className="my-2.5 flex items-center gap-2 rounded-lg border border-[#1E293B] bg-[#0D1930] p-3 text-sm text-slate-200">
        <Icon name="bookOpen" size={16} className="text-[#F5D547] shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-white truncate">{titulo}</p>
          {isValid ? (
            <a
              href={safeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 hover:underline truncate max-w-full"
            >
              <span>{safeUrl}</span>
              <Icon name="externalLink" size={12} />
            </a>
          ) : (
            <span className="text-xs text-slate-400">{rawUrl || 'URL não informada'}</span>
          )}
        </div>
      </div>
    );
  }

  // Parágrafo por padrão
  return (
    <p className="my-2 text-sm leading-relaxed text-slate-200 whitespace-pre-wrap">
      {bloco.content?.text || <span className="italic opacity-50">Parágrafo vazio</span>}
    </p>
  );
}

export default function EditorBlocosVisual({ blocks = [], onSave, onError }) {
  const [blocos, setBlocos] = useState(() => normalizarBlocosIniciais(blocks));
  const [modoEdicao, setModoEdicao] = useState(() => (blocks.length === 0));
  const [salvando, setSalvando] = useState(false);
  const [salvoFeedback, setSalvoFeedback] = useState(false);
  const [erroLocal, setErroLocal] = useState('');

  const idPrefix = useId();

  useEffect(() => {
    setBlocos(normalizarBlocosIniciais(blocks));
    if (blocks.length === 0) {
      setModoEdicao(true);
    }
  }, [blocks]);

  function adicionarBloco(tipo) {
    const id = gerarIdBloco();
    let novoBloco;

    if (tipo === 'heading') {
      novoBloco = { id, type: 'heading', content: { text: '' } };
    } else if (tipo === 'list') {
      novoBloco = { id, type: 'list', content: { items: [''] } };
    } else if (tipo === 'callout') {
      novoBloco = { id, type: 'callout', content: { text: '' } };
    } else if (tipo === 'code') {
      novoBloco = { id, type: 'code', content: { code: '' } };
    } else if (tipo === 'reference') {
      novoBloco = { id, type: 'reference', content: { title: '', url: 'https://' } };
    } else {
      novoBloco = { id, type: 'paragraph', content: { text: '' } };
    }

    setBlocos((atuais) => [...atuais, novoBloco]);
    setModoEdicao(true);
    setErroLocal('');
  }

  function removerBloco(index) {
    setBlocos((atuais) => atuais.filter((_, idx) => idx !== index));
    setErroLocal('');
  }

  function moverBloco(index, direcao) {
    setBlocos((atuais) => {
      const novaLista = [...atuais];
      const destino = index + direcao;
      if (destino < 0 || destino >= novaLista.length) return atuais;
      const [removido] = novaLista.splice(index, 1);
      novaLista.splice(destino, 0, removido);
      return novaLista;
    });
    setErroLocal('');
  }

  function atualizarTexto(index, valor) {
    setBlocos((atuais) =>
      atuais.map((b, idx) => {
        if (idx !== index) return b;
        return { ...b, content: { ...b.content, text: valor } };
      })
    );
  }

  function atualizarCodigo(index, valor) {
    setBlocos((atuais) =>
      atuais.map((b, idx) => {
        if (idx !== index) return b;
        return { ...b, content: { ...b.content, code: valor } };
      })
    );
  }

  function atualizarReferencia(index, campo, valor) {
    setBlocos((atuais) =>
      atuais.map((b, idx) => {
        if (idx !== index) return b;
        return { ...b, content: { ...b.content, [campo]: valor } };
      })
    );
  }

  function atualizarItemLista(indexBloco, indexItem, valor) {
    setBlocos((atuais) =>
      atuais.map((b, idx) => {
        if (idx !== indexBloco) return b;
        const items = [...(b.content?.items ?? [])];
        items[indexItem] = valor;
        return { ...b, content: { ...b.content, items } };
      })
    );
  }

  function adicionarItemLista(indexBloco) {
    setBlocos((atuais) =>
      atuais.map((b, idx) => {
        if (idx !== indexBloco) return b;
        const items = [...(b.content?.items ?? []), ''];
        return { ...b, content: { ...b.content, items } };
      })
    );
  }

  function removerItemLista(indexBloco, indexItem) {
    setBlocos((atuais) =>
      atuais.map((b, idx) => {
        if (idx !== indexBloco) return b;
        const items = (b.content?.items ?? []).filter((_, i) => i !== indexItem);
        return { ...b, content: { ...b.content, items: items.length > 0 ? items : [''] } };
      })
    );
  }

  async function handleSalvar() {
    setErroLocal('');
    setSalvando(true);
    setSalvoFeedback(false);

    try {
      // Normalizar blocos antes de enviar
      const blocosNormalizados = blocos.map((bloco) => {
        if (bloco.type === 'reference') {
          const urlNormalizada = normalizarUrl(bloco.content?.url);
          if (!validarUrlSegura(urlNormalizada)) {
            throw new Error(`A referência "${bloco.content?.title || 'Link'}" precisa ter uma URL válida (http ou https).`);
          }
          return {
            ...bloco,
            content: {
              title: (bloco.content?.title || '').trim(),
              url: urlNormalizada,
            },
          };
        }

        if (bloco.type === 'list') {
          const itemsLimpos = (bloco.content?.items ?? [])
            .map((item) => (typeof item === 'string' ? item.trim() : ''))
            .filter(Boolean);
          return {
            ...bloco,
            content: {
              items: itemsLimpos.length > 0 ? itemsLimpos : ['Item prático'],
            },
          };
        }

        return bloco;
      });

      await onSave(blocosNormalizados);
      setSalvoFeedback(true);
      setTimeout(() => setSalvoFeedback(false), 3000);
    } catch (err) {
      const msg = err.message || 'Não foi possível salvar o conteúdo.';
      setErroLocal(msg);
      onError?.(msg);
    } finally {
      setSalvando(false);
    }
  }

  const tiposBotoes = [
    { tipo: 'paragraph', label: 'Parágrafo', icone: 'edit' },
    { tipo: 'heading', label: 'Título', icone: 'sparkles' },
    { tipo: 'list', label: 'Lista', icone: 'list' },
    { tipo: 'callout', label: 'Destaque', icone: 'flame' },
    { tipo: 'code', label: 'Código', icone: 'code' },
    { tipo: 'reference', label: 'Link / Ref', icone: 'bookOpen' },
  ];

  return (
    <div className="space-y-4">
      {/* Barra de Ações do Editor */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#1E293B] bg-[#0B132B] p-3">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setModoEdicao(false)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              !modoEdicao
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:bg-[#1E293B] hover:text-white'
            }`}
          >
            Visualizar Guia
          </button>
          <button
            type="button"
            onClick={() => setModoEdicao(true)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              modoEdicao
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:bg-[#1E293B] hover:text-white'
            }`}
          >
            Editar Blocos ({blocos.length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          {salvoFeedback && (
            <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium animate-fade-in">
              <Icon name="check" size={14} />
              Conteúdo salvo!
            </span>
          )}
          <button
            type="button"
            disabled={salvando}
            onClick={handleSalvar}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
          >
            <Icon name="check" size={14} />
            {salvando ? 'Salvando...' : 'Salvar conteúdo'}
          </button>
        </div>
      </div>

      {erroLocal && (
        <div role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-200">
          {erroLocal}
        </div>
      )}

      {/* Modo de Leitura / Prévia */}
      {!modoEdicao && (
        <div className="rounded-xl border border-[#1E293B] bg-[#070C1E] p-5 shadow-inner">
          {blocos.length === 0 ? (
            <div className="py-8 text-center">
              <span className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#101F42] text-[#F5D547]">
                <Icon name="notebook" size={20} />
              </span>
              <p className="text-sm font-medium text-slate-300">Nenhum conteúdo cadastrado nesta ilha.</p>
              <p className="mt-1 text-xs text-slate-400">
                Adicione instruções, títulos, listas ou materiais de referência para orientar seus estudos.
              </p>
              <button
                type="button"
                onClick={() => setModoEdicao(true)}
                className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-500"
              >
                + Começar a escrever
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {blocos.map((bloco) => (
                <BlocoItemLeitura key={bloco.id} bloco={bloco} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modo de Edição Visual */}
      {modoEdicao && (
        <div className="space-y-4">
          {/* Barra rápida de inserção de blocos */}
          <div className="rounded-xl border border-[#26395C] bg-[#0A122A] p-3">
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 block mb-2">
              Adicionar novo bloco visual:
            </span>
            <div className="flex flex-wrap gap-2">
              {tiposBotoes.map(({ tipo, label, icone }) => (
                <button
                  key={tipo}
                  type="button"
                  onClick={() => adicionarBloco(tipo)}
                  className="flex items-center gap-1.5 rounded-lg border border-[#26395C] bg-[#101D3D] px-2.5 py-1.5 text-xs text-slate-200 transition hover:border-[#F5D547] hover:bg-[#152752] hover:text-white"
                >
                  <Icon name={icone} size={14} className="text-[#F5D547]" />
                  <span>+ {label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Lista de Blocos Editáveis */}
          {blocos.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#26395C] p-8 text-center text-slate-400">
              <p className="text-sm">Nenhum bloco de conteúdo ainda.</p>
              <p className="mt-1 text-xs text-slate-400">
                Clique em um dos botões acima para adicionar seu primeiro parágrafo, título ou lista.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {blocos.map((bloco, index) => {
                const isFirst = index === 0;
                const isLast = index === blocos.length - 1;

                return (
                  <div
                    key={bloco.id}
                    className="rounded-xl border border-[#1E293B] bg-[#0B142F] p-4 transition focus-within:border-blue-500/60"
                  >
                    {/* Cabeçalho do Bloco */}
                    <div className="flex items-center justify-between border-b border-[#1E293B]/70 pb-2.5 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-[#16254A] px-2 py-0.5 text-[11px] font-semibold text-[#F5D547]">
                          {index + 1}. {bloco.type === 'heading' && 'Título de Seção'}
                          {bloco.type === 'paragraph' && 'Parágrafo'}
                          {bloco.type === 'list' && 'Lista Prática'}
                          {bloco.type === 'callout' && 'Destaque / Aviso'}
                          {bloco.type === 'code' && 'Comandos / Código'}
                          {bloco.type === 'reference' && 'Link / Referência'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={isFirst}
                          onClick={() => moverBloco(index, -1)}
                          title="Mover para cima"
                          className="rounded p-1 text-slate-400 hover:bg-[#1E293B] hover:text-white disabled:opacity-30 transition"
                        >
                          <Icon name="arrowUp" size={14} />
                        </button>
                        <button
                          type="button"
                          disabled={isLast}
                          onClick={() => moverBloco(index, 1)}
                          title="Mover para baixo"
                          className="rounded p-1 text-slate-400 hover:bg-[#1E293B] hover:text-white disabled:opacity-30 transition"
                        >
                          <Icon name="arrowDown" size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => removerBloco(index)}
                          title="Excluir este bloco"
                          className="rounded p-1 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition ml-1"
                        >
                          <Icon name="trash" size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Corpo de Edição do Bloco */}
                    {bloco.type === 'heading' && (
                      <div>
                        <label
                          htmlFor={`${idPrefix}-bloco-${bloco.id}`}
                          className="block text-[11px] text-slate-400 mb-1"
                        >
                          Título da seção
                        </label>
                        <input
                          id={`${idPrefix}-bloco-${bloco.id}`}
                          type="text"
                          value={bloco.content?.text ?? ''}
                          onChange={(e) => atualizarTexto(index, e.target.value)}
                          placeholder="Ex.: Conceitos Fundamentais"
                          className="w-full rounded-lg border border-[#26395C] bg-[#070D1E] px-3 py-2 text-sm text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    )}

                    {bloco.type === 'paragraph' && (
                      <div>
                        <label
                          htmlFor={`${idPrefix}-bloco-${bloco.id}`}
                          className="block text-[11px] text-slate-400 mb-1"
                        >
                          Texto explicativo
                        </label>
                        <textarea
                          id={`${idPrefix}-bloco-${bloco.id}`}
                          rows={3}
                          value={bloco.content?.text ?? ''}
                          onChange={(e) => atualizarTexto(index, e.target.value)}
                          placeholder="Explique o que deve ser aprendido ou praticado nesta ilha..."
                          className="w-full rounded-lg border border-[#26395C] bg-[#070D1E] px-3 py-2 text-sm text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    )}

                    {bloco.type === 'list' && (
                      <div className="space-y-2">
                        <span className="block text-[11px] text-slate-400 mb-1">Itens da lista</span>
                        {(bloco.content?.items ?? ['']).map((item, itemIdx) => (
                          <div key={`${bloco.id}-item-${itemIdx}`} className="flex items-center gap-2">
                            <span className="text-xs text-[#F5D547]">•</span>
                            <input
                              type="text"
                              value={item}
                              onChange={(e) => atualizarItemLista(index, itemIdx, e.target.value)}
                              placeholder={`Item ${itemIdx + 1}`}
                              className="flex-1 rounded-lg border border-[#26395C] bg-[#070D1E] px-3 py-1.5 text-sm text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => removerItemLista(index, itemIdx)}
                              title="Remover este item"
                              className="rounded p-1 text-slate-400 hover:text-red-400 transition"
                            >
                              <Icon name="close" size={14} />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => adicionarItemLista(index)}
                          className="mt-1 inline-flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 font-medium"
                        >
                          <Icon name="plus" size={13} />
                          Adicionar mais um item
                        </button>
                      </div>
                    )}

                    {bloco.type === 'callout' && (
                      <div>
                        <label
                          htmlFor={`${idPrefix}-bloco-${bloco.id}`}
                          className="block text-[11px] text-amber-300 mb-1"
                        >
                          Dica ou nota de atenção
                        </label>
                        <textarea
                          id={`${idPrefix}-bloco-${bloco.id}`}
                          rows={2}
                          value={bloco.content?.text ?? ''}
                          onChange={(e) => atualizarTexto(index, e.target.value)}
                          placeholder="Dica prática, aviso sobre armadilhas comuns ou resumo..."
                          className="w-full rounded-lg border border-amber-500/40 bg-[#0B1524] px-3 py-2 text-sm text-amber-100 placeholder-amber-500/50 focus:border-amber-400 focus:outline-none"
                        />
                      </div>
                    )}

                    {bloco.type === 'code' && (
                      <div>
                        <label
                          htmlFor={`${idPrefix}-bloco-${bloco.id}`}
                          className="block text-[11px] text-slate-400 mb-1"
                        >
                          Trecho de código ou comando de terminal
                        </label>
                        <textarea
                          id={`${idPrefix}-bloco-${bloco.id}`}
                          rows={4}
                          value={bloco.content?.code ?? ''}
                          onChange={(e) => atualizarCodigo(index, e.target.value)}
                          placeholder="npm install ... ou function exemplo() { ... }"
                          className="w-full font-mono rounded-lg border border-[#26395C] bg-[#050A1A] px-3 py-2 text-xs text-sky-200 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    )}

                    {bloco.type === 'reference' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label
                            htmlFor={`${idPrefix}-bloco-${bloco.id}-title`}
                            className="block text-[11px] text-slate-400 mb-1"
                          >
                            Título / Nome do Link
                          </label>
                          <input
                            id={`${idPrefix}-bloco-${bloco.id}-title`}
                            type="text"
                            value={bloco.content?.title ?? ''}
                            onChange={(e) => atualizarReferencia(index, 'title', e.target.value)}
                            placeholder="Ex.: Documentação Oficial"
                            className="w-full rounded-lg border border-[#26395C] bg-[#070D1E] px-3 py-1.5 text-sm text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor={`${idPrefix}-bloco-${bloco.id}-url`}
                            className="block text-[11px] text-slate-400 mb-1"
                          >
                            Endereço URL (Web)
                          </label>
                          <input
                            id={`${idPrefix}-bloco-${bloco.id}-url`}
                            type="text"
                            value={bloco.content?.url ?? ''}
                            onChange={(e) => atualizarReferencia(index, 'url', e.target.value)}
                            onBlur={(e) => {
                              const norm = normalizarUrl(e.target.value);
                              if (norm !== e.target.value) atualizarReferencia(index, 'url', norm);
                            }}
                            placeholder="https://exemplo.com"
                            className="w-full rounded-lg border border-[#26395C] bg-[#070D1E] px-3 py-1.5 text-sm text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Rodapé do Modo Edição */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setModoEdicao(false)}
              className="text-xs text-slate-400 hover:text-white transition"
            >
              ← Voltar para modo de leitura
            </button>
            <button
              type="button"
              disabled={salvando}
              onClick={handleSalvar}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
            >
              <Icon name="check" size={14} />
              {salvando ? 'Salvando...' : 'Salvar conteúdo da ilha'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
