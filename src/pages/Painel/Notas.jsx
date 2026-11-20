import { useRef, useState } from 'react';

function Notas({
  notas,
  onAdicionarNota,
  onAtualizarNota,
  onAlternarNota,
  onRemoverNota,
  onRecarregar,
  carregando,
  operacaoPendente,
  erro,
}) {
  const [novaNota, setNovaNota] = useState('');
  const [notaEmEdicao, setNotaEmEdicao] = useState(null);
  const [textoEmEdicao, setTextoEmEdicao] = useState('');
  const [sucesso, setSucesso] = useState('');
  const campoNota = useRef(null);

  async function executarOperacao(operacao, mensagem) {
    setSucesso('');
    try {
      await operacao();
      setSucesso(mensagem);
      return true;
    } catch {
      return false;
    }
  }

  async function enviarNota(event) {
    event.preventDefault();
    if (!novaNota.trim()) return;

    const salva = await executarOperacao(() => onAdicionarNota(novaNota), 'Nota adicionada.');
    if (salva) setNovaNota('');
  }

  function iniciarEdicao(nota) {
    setNotaEmEdicao(nota.id);
    setTextoEmEdicao(nota.texto);
    setSucesso('');
  }

  function cancelarEdicao() {
    setNotaEmEdicao(null);
    setTextoEmEdicao('');
  }

  async function salvarEdicao(event, nota) {
    event.preventDefault();
    if (!textoEmEdicao.trim()) return;

    const salva = await executarOperacao(
      () => onAtualizarNota(nota.id, textoEmEdicao),
      'Nota atualizada.',
    );
    if (salva) cancelarEdicao();
  }

  return (
    <article className="painel-card min-w-0 p-4" id="anotacoes">
      <h3>
        Notas Diárias
        <button
          type="button"
          onClick={() => campoNota.current?.focus()}
          aria-label="Adicionar nota"
        >
          +
        </button>
      </h3>

      <form className="form-nota mb-3 flex gap-1.5" onSubmit={enviarNota}>
        <input
          ref={campoNota}
          type="text"
          placeholder="Escreva uma nova nota..."
          value={novaNota}
          onChange={(event) => setNovaNota(event.target.value)}
          disabled={operacaoPendente || carregando}
        />
        <button type="submit" disabled={operacaoPendente || carregando || !novaNota.trim()}>
          {operacaoPendente ? 'Salvando...' : carregando ? 'Carregando...' : 'Adicionar'}
        </button>
      </form>

      {erro && (
        <p role="alert" className="mb-3 text-xs">
          {erro}{' '}
          <button type="button" onClick={onRecarregar} disabled={carregando}>
            Tentar novamente
          </button>
        </p>
      )}
      {sucesso && (
        <p role="status" className="mb-3 text-xs">
          {sucesso}
        </p>
      )}

      <div className="grid gap-2">
        {carregando && (
          <p role="status" className="text-xs text-farol-muted">
            Carregando notas...
          </p>
        )}
        {!carregando && !erro && notas.length === 0 && (
          <p className="text-xs text-farol-muted">
            Suas notas aparecerão aqui. Escreva uma acima para começar.
          </p>
        )}
        {!carregando &&
          notas.map((nota) => (
            <div className={`nota ${nota.concluida ? 'nota-concluida' : ''}`} key={nota.id}>
              <label>
                <input
                  type="checkbox"
                  checked={nota.concluida}
                  aria-label={`${nota.concluida ? 'Desmarcar' : 'Marcar'} ${nota.texto} como concluída`}
                  onChange={() =>
                    executarOperacao(() => onAlternarNota(nota.id), 'Nota atualizada.')
                  }
                  disabled={operacaoPendente || notaEmEdicao === nota.id}
                />
                {notaEmEdicao !== nota.id && <span>{nota.texto}</span>}
              </label>

              {notaEmEdicao === nota.id ? (
                <form className="edicao-nota" onSubmit={(event) => salvarEdicao(event, nota)}>
                  <input
                    autoFocus
                    aria-label={`Editar nota ${nota.texto}`}
                    value={textoEmEdicao}
                    onChange={(event) => setTextoEmEdicao(event.target.value)}
                    disabled={operacaoPendente}
                  />
                  <button type="submit" disabled={operacaoPendente || !textoEmEdicao.trim()}>
                    Salvar
                  </button>
                  <button type="button" onClick={cancelarEdicao} disabled={operacaoPendente}>
                    Cancelar
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  className="editar-nota"
                  onClick={() => iniciarEdicao(nota)}
                  disabled={operacaoPendente || notaEmEdicao === nota.id}
                  aria-label={`Editar nota ${nota.texto}`}
                >
                  Editar
                </button>
              )}

              <button
                type="button"
                className="remover-nota"
                onClick={() => executarOperacao(() => onRemoverNota(nota.id), 'Nota excluída.')}
                disabled={operacaoPendente}
                aria-label={`Excluir nota ${nota.texto}`}
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
          ))}
      </div>
    </article>
  );
}

export default Notas;
