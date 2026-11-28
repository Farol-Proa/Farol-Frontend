import { useState } from 'react';
import Icon from '../../components/Icon';
import { normalizarConteudoIlha, conteudoTemMaterial } from '../../dashboard/conteudoIlha.js';

function BlocoLeituraGuia({ bloco }) {
  const [copiado, setCopiado] = useState(false);

  if (bloco.type === 'heading') {
    return (
      <h4 className="mt-4 first:mt-0 text-sm font-bold tracking-tight text-[#F5D547]">
        {bloco.content?.text || <span className="italic opacity-50">Título sem texto</span>}
      </h4>
    );
  }

  if (bloco.type === 'list') {
    const itens = (bloco.content?.items ?? []).filter((it) => typeof it === 'string' && it.trim());
    if (itens.length === 0) {
      return <p className="text-xs italic text-slate-400">Lista vazia.</p>;
    }
    return (
      <ul className="my-2 space-y-1 pl-4 list-disc text-xs text-slate-200 marker:text-[#F5D547] leading-relaxed">
        {itens.map((item, idx) => (
          <li key={`${bloco.id}-item-${idx}`}>{item}</li>
        ))}
      </ul>
    );
  }

  if (bloco.type === 'callout') {
    return (
      <aside className="my-2.5 flex items-start gap-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-100 leading-relaxed">
        <span className="text-[#F5D547] mt-0.5 shrink-0">
          <Icon name="sparkles" size={15} />
        </span>
        <div className="flex-1 whitespace-pre-wrap">{bloco.content?.text || 'Destaque'}</div>
      </aside>
    );
  }

  if (bloco.type === 'code') {
    const codigo = bloco.content?.code ?? bloco.content?.text ?? '';
    const copiarCodigo = () => {
      if (!codigo) return;
      navigator.clipboard?.writeText(codigo);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    };

    return (
      <div className="my-2.5 rounded-lg border border-[#26395C] bg-[#050A1A] overflow-hidden text-xs">
        <div className="flex items-center justify-between border-b border-[#1E293B] bg-[#0A1128] px-3 py-1 text-[11px] text-slate-400 font-mono">
          <span>Código / Comandos</span>
          <button
            type="button"
            onClick={copiarCodigo}
            className="text-[10px] text-sky-400 hover:text-sky-300 transition"
          >
            {copiado ? '✓ Copiado!' : 'Copiar'}
          </button>
        </div>
        <pre className="p-3 overflow-x-auto font-mono text-xs text-sky-200 leading-relaxed">
          <code>{codigo || '// Nenhum código informado'}</code>
        </pre>
      </div>
    );
  }

  if (bloco.type === 'reference') {
    const titulo = bloco.content?.title || 'Referência externa';
    const url = bloco.content?.url || '';

    return (
      <div className="my-2 flex items-center gap-2 rounded-lg border border-[#1E293B] bg-[#0D1930] p-2.5 text-xs text-slate-200">
        <Icon name="bookOpen" size={14} className="text-[#F5D547] shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-white truncate">{titulo}</p>
          {url ? (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300 hover:underline truncate max-w-full"
            >
              <span className="truncate">{url}</span>
              <Icon name="externalLink" size={10} className="shrink-0" />
            </a>
          ) : (
            <span className="text-[11px] text-slate-400">URL não informada</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <p className="my-2 text-xs leading-relaxed text-slate-200 whitespace-pre-wrap">
      {bloco.content?.text || <span className="italic opacity-50">Parágrafo sem texto</span>}
    </p>
  );
}

export default function PainelGuiaEstudo({
  ilha = null,
  mapaNome = '',
  onNavegar = () => {},
  onVincularIlha,
  aberto = true,
  onAlternarAberto,
}) {
  const [abaInterna, setAbaInterna] = useState('guia'); // 'guia' | 'topicos'

  if (!aberto) {
    return (
      <aside className="anotacoes-guia-colapsado" aria-label="Guia de Conteúdo colapsado">
        <button
          type="button"
          onClick={onAlternarAberto}
          className="anotacoes-guia-botao-expandir"
          title="Expandir Guia de Conteúdo da Ilha"
        >
          <Icon name="bookOpen" size={16} />
          <span className="rotulo-vertical">Guia da Ilha</span>
          {ilha && <span className="badge-ponto-ativo" />}
        </button>
      </aside>
    );
  }

  const conteudoNormalizado = normalizarConteudoIlha(ilha?.conteudo);
  const temMaterial = conteudoTemMaterial(conteudoNormalizado);
  const topicos = ilha?.topicos ?? [];
  const topicosConcluidos = topicos.filter((tp) => tp.concluido).length;

  return (
    <aside className="anotacoes-guia-painel" aria-label="Painel do Guia de Conteúdo da Ilha">
      {/* Cabeçalho do Painel */}
      <div className="anotacoes-guia-topo">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[#F5D547]">
            <Icon name="bookOpen" size={17} />
          </span>
          <div className="min-w-0">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 truncate">
              Guia da Ilha
            </h3>
            <p className="text-[10px] text-slate-400 truncate">Material de estudo simultâneo</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {ilha && (
            <button
              type="button"
              onClick={() => onNavegar('Ilhas', { etapaId: ilha.id, objetivoId: ilha.objetivoId })}
              className="anotacoes-guia-botao-acao"
              title="Abrir esta Ilha no Mapa"
            >
              <Icon name="map" size={13} />
              <span>Ver no Mapa</span>
            </button>
          )}

          {onAlternarAberto && (
            <button
              type="button"
              onClick={onAlternarAberto}
              className="anotacoes-guia-botao-fechar"
              title="Recolher painel"
              aria-label="Recolher painel de estudo"
            >
              <Icon name="x" size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Conteúdo do Painel */}
      <div className="anotacoes-guia-corpo">
        {!ilha ? (
          /* Estado sem Ilha vinculada */
          <div className="anotacoes-guia-vazio">
            <div className="anotacoes-guia-icone-vazio">
              <Icon name="map" size={28} />
            </div>
            <h4 className="text-sm font-semibold text-white">Nenhuma Ilha vinculada</h4>
            <p className="text-xs text-slate-300 leading-relaxed mt-1">
              Vincule esta anotação a uma Ilha do seu roadmap para visualizar aqui os conceitos, tópicos e guias de estudo enquanto você faz seus resumos.
            </p>
            {onVincularIlha && (
              <button
                type="button"
                onClick={onVincularIlha}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-sky-500/40 bg-sky-500/10 px-3 py-1.5 text-xs font-semibold text-sky-300 hover:bg-sky-500/20 transition"
              >
                <Icon name="sparkles" size={13} />
                <span>Vincular a uma Ilha</span>
              </button>
            )}
          </div>
        ) : (
          /* Estado com Ilha vinculada */
          <div className="space-y-4">
            {/* Card de Identificação da Ilha */}
            <div className="rounded-xl border border-[#26395C] bg-[#0B142B] p-3.5">
              {mapaNome && (
                <span className="text-[10px] font-semibold uppercase tracking-wider text-sky-400 block truncate">
                  Mapa · {mapaNome}
                </span>
              )}
              <h4 className="text-sm font-bold text-white mt-0.5 truncate">
                {ilha.texto ?? ilha.titulo ?? 'Ilha'}
              </h4>
              {ilha.descricao && (
                <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                  {ilha.descricao}
                </p>
              )}

              {/* Estatísticas rápidas da Ilha */}
              <div className="mt-3 flex flex-wrap items-center gap-2 pt-2 border-t border-[#1E293B] text-[11px] text-slate-300">
                <span className="inline-flex items-center gap-1 rounded bg-[#102040] px-2 py-0.5 font-medium">
                  <Icon name="target" size={11} className="text-sky-400" />
                  {topicos.length} conceitos
                </span>
                {topicos.length > 0 && (
                  <span className="text-slate-400">
                    ({topicosConcluidos}/{topicos.length} concluídos)
                  </span>
                )}
              </div>
            </div>

            {/* Alternador de Abas Internas: Guia vs Tópicos */}
            <div className="flex items-center rounded-lg border border-[#1E293B] bg-[#0A1128] p-1">
              <button
                type="button"
                onClick={() => setAbaInterna('guia')}
                className={`flex-1 rounded-md py-1 text-xs font-semibold transition ${
                  abaInterna === 'guia'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Guia de Conteúdo ({conteudoNormalizado.blocks.length})
              </button>
              <button
                type="button"
                onClick={() => setAbaInterna('topicos')}
                className={`flex-1 rounded-md py-1 text-xs font-semibold transition ${
                  abaInterna === 'topicos'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Tópicos ({topicos.length})
              </button>
            </div>

            {/* Visualização de Guia */}
            {abaInterna === 'guia' && (
              <div className="anotacoes-guia-blocos">
                {!temMaterial ? (
                  <div className="rounded-xl border border-dashed border-[#1E293B] p-5 text-center text-slate-400">
                    <Icon name="bookOpen" size={24} className="mx-auto text-slate-500 mb-2" />
                    <p className="text-xs font-medium text-slate-200">Nenhum material no guia ainda.</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Adicione explicações, links e comandos abrindo a Ilha no Mapa.
                    </p>
                    <button
                      type="button"
                      onClick={() => onNavegar('Ilhas', { etapaId: ilha.id, objetivoId: ilha.objetivoId, aba: 'conteudo' })}
                      className="mt-3 inline-flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 transition font-medium"
                    >
                      <span>Editar Guia na Ilha</span>
                      <Icon name="externalLink" size={11} />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {conteudoNormalizado.blocks.map((bloco) => (
                      <BlocoLeituraGuia key={bloco.id} bloco={bloco} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Visualização de Tópicos */}
            {abaInterna === 'topicos' && (
              <div className="space-y-2">
                {topicos.length === 0 ? (
                  <p className="text-xs italic text-slate-400 text-center py-4">
                    Nenhum tópico cadastrado nesta ilha.
                  </p>
                ) : (
                  topicos.map((topico) => (
                    <div
                      key={topico.id}
                      className="flex items-start gap-2.5 rounded-lg border border-[#1E293B] bg-[#0A1226] p-2.5 text-xs text-slate-200"
                    >
                      <span className={`mt-0.5 shrink-0 ${topico.concluido ? 'text-emerald-400' : 'text-slate-500'}`}>
                        <Icon name={topico.concluido ? 'checkCircle' : 'circle'} size={14} />
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium ${topico.concluido ? 'text-slate-400 line-through' : 'text-white'}`}>
                          {topico.titulo}
                        </p>
                        {topico.descricao && (
                          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                            {topico.descricao}
                          </p>
                        )}
                      </div>
                      {topico.obrigatorio && (
                        <span className="shrink-0 rounded bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-amber-300">
                          Essencial
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
