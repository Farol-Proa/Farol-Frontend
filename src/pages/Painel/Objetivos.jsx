
function Objetivos({ objetivos, onNavegar }) {
  return (
    <article
      className="painel-card painel-ilhas-card min-w-0 p-4"
      id="mapas"
    >
      <h3>Minhas Ilhas</h3>

      <div className="painel-ilhas-lista">
        {objetivos.map((objetivo) => {
          const totalTarefas = (objetivo.etapas || []).reduce(
            (total, etapa) =>
              total + (etapa.tarefas || []).length,
            0
          );

          const tarefasConcluidas = (objetivo.etapas || []).reduce(
            (total, etapa) =>
              total +
              (etapa.tarefas || []).filter(
                (tarefa) => tarefa.concluida
              ).length,
            0
          );

          const progresso =
            totalTarefas > 0
              ? Math.round(
                (tarefasConcluidas / totalTarefas) * 100
              )
              : 0;

          return (
            <div
              className="painel-ilha-card"
              key={objetivo.id}
              role="button"
              tabIndex={0}
              onClick={() =>
                onNavegar('Ilhas', { objetivoId: objetivo.id })
              }
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onNavegar('Ilhas', { objetivoId: objetivo.id });
                }
              }}
            >
              <strong>{objetivo.nome}</strong>

              <span>{progresso}%</span>

              <div className="barra-progresso">
                <div
                  className="barra-progresso-preenchida"
                  style={{ width: `${progresso}%` }}
                />
              </div>

              <span>
                {tarefasConcluidas}/{totalTarefas} tarefas concluídas
              </span>
            </div>
          );
        })}

        <button
          className="painel-ilha-adicionar"
          type="button"
          onClick={() => onNavegar('Ilhas', { abrirModal: true })}
          aria-label="Ir para Ilhas e criar um novo objetivo"
        >
          <span aria-hidden="true">+</span>
          <strong>Criar uma nova</strong>
        </button>
      </div>
    </article>
  );
}

export default Objetivos;
