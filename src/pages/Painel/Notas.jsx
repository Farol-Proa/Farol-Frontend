import { useRef, useState } from 'react';

function Notas({ notas, onAdicionarNota, onAlternarNota, onRemoverNota }) {
  const [novaNota, setNovaNota] = useState('');
  const campoNota = useRef(null);

  function enviarNota(event) {
    event.preventDefault();
    if (!novaNota.trim()) return;

    onAdicionarNota(novaNota);
    setNovaNota('');
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
        />
        <button type="submit">Adicionar</button>
      </form>

      <div className="grid gap-2">
        {notas.map((nota) => (
          <div className={`nota ${nota.concluida ? 'nota-concluida' : ''}`} key={nota.id}>
            <label>
              <input
                type="checkbox"
                checked={nota.concluida}
                onChange={() => onAlternarNota(nota.id)}
              />
              <span>{nota.texto}</span>
            </label>

            <button
              type="button"
              className="remover-nota"
              onClick={() => onRemoverNota(nota.id)}
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
