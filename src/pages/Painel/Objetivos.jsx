import { useState } from 'react';
import { calcularProgressoEtapas } from '../../objetivos/progresso';

function Objetivos({
  objetivos,
  onAbrirObjetivo,
  onAdicionarObjetivo,
  onAlternarObjetivo,
  onRemoverObjetivo,
  onAdicionarEtapa,
  onAlternarEtapa,
  onRemoverEtapa,
}) {
  const [novoObjetivo, setNovoObjetivo] = useState('');
  const [novaEtapa, setNovaEtapa] = useState('');
  const [mostrarFormularioObjetivo, setMostrarFormularioObjetivo] = useState(false);

  function enviarObjetivo(event) {
    event.preventDefault();
    if (!novoObjetivo.trim()) return;

    onAdicionarObjetivo(novoObjetivo);
    setNovoObjetivo('');
    setMostrarFormularioObjetivo(false);
  }

  function enviarEtapa(event, idObjetivo) {
    event.preventDefault();
    if (!novaEtapa.trim()) return;

    onAdicionarEtapa(idObjetivo, novaEtapa);
    setNovaEtapa('');
  }

  return (
    <article className="painel-card col-span-2 min-w-0 p-4 max-[950px]:col-span-1" id="mapas">
      <h3>Minhas Ilhas</h3>

      {mostrarFormularioObjetivo && (
        <form className="form-objetivo mb-4 flex flex-wrap gap-2" onSubmit={enviarObjetivo}>
          <input
            type="text"
            placeholder="Qual é o seu objetivo?"
            value={novoObjetivo}
            onChange={(event) => setNovoObjetivo(event.target.value)}
          />
          <button type="submit">Criar objetivo</button>
          <button type="button" onClick={() => setMostrarFormularioObjetivo(false)}>
            Cancelar
          </button>
        </form>
      )}

      <div className="flex flex-wrap gap-3">
        {objetivos.map((objetivo) => {
          // O mesmo valor alimenta o texto e a barra de progresso deste cartão.
          const progresso = calcularProgressoEtapas(objetivo.etapas);

          return (
            <div
              className={`objetivo-card ${objetivo.concluido ? 'objetivo-concluido' : ''}`}
              key={objetivo.id}
            >
              <div className="flex min-w-0 flex-1 items-center justify-between gap-2.5">
                <button
                  type="button"
                  className="cursor-pointer border-0 bg-transparent p-0 text-left text-inherit"
                  onClick={() => onAbrirObjetivo(objetivo.id)}
                >
                  {objetivo.nome}
                </button>

                <button
                  type="button"
                  className="remover-objetivo"
                  onClick={() => onRemoverObjetivo(objetivo.id)}
                  aria-label={`Excluir objetivo ${objetivo.nome}`}
                >
                  <span aria-hidden="true">×</span>
                </button>
              </div>

              <label className="mt-2.5 flex cursor-pointer items-center gap-1.5 text-[13px]">
                <input
                  type="checkbox"
                  checked={objetivo.concluido || false}
                  onChange={() => onAlternarObjetivo(objetivo.id)}
                />
                Concluído
              </label>

              <div className="progresso-objetivo">
                <div className="progresso-objetivo-info">
                  <span>Progresso</span>
                  <span>{progresso}%</span>
                </div>
                <progress value={progresso} max="100" />
              </div>

              <form className="form-etapa" onSubmit={(event) => enviarEtapa(event, objetivo.id)}>
                <input
                  type="text"
                  placeholder="Digite uma etapa..."
                  value={novaEtapa}
                  onChange={(event) => setNovaEtapa(event.target.value)}
                />
                <button type="submit">Adicionar etapa</button>
              </form>

              <div className="lista-etapas">
                {objetivo.etapas.map((etapa) => (
                  <div className="item-etapa" key={etapa.id}>
                    <label>
                      <input
                        type="checkbox"
                        checked={etapa.concluida}
                        onChange={() => onAlternarEtapa(objetivo.id, etapa.id)}
                      />
                      <span className={etapa.concluida ? 'etapa-concluida' : ''}>
                        {etapa.texto}
                      </span>
                    </label>

                    <button
                      type="button"
                      onClick={() => onRemoverEtapa(objetivo.id, etapa.id)}
                      aria-label={`Excluir etapa ${etapa.texto}`}
                    >
                      <span aria-hidden="true">×</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        <button
          type="button"
          className="w-[75px] cursor-pointer rounded-[14px] border-2 border-farol-primary bg-transparent text-[32px] text-farol-primary"
          onClick={() => setMostrarFormularioObjetivo(true)}
          aria-label="Adicionar objetivo"
        >
          +
        </button>
      </div>
    </article>
  );
}

export default Objetivos;
