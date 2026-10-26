import { useState } from 'react';

function Tarefas({
  tarefas,
  dataSelecionada,
  onAdicionarTarefa,
  onAlternarTarefa,
  onRemoverTarefa,
}) {
  const [novaTarefa, setNovaTarefa] = useState('');
  const [novoHorario, setNovoHorario] = useState('09:00');
  const [novaPrioridade, setNovaPrioridade] = useState('Média');
  const tarefasDaData = tarefas.filter((tarefa) => tarefa.data === dataSelecionada);

  function enviarTarefa(event) {
    event.preventDefault();
    if (!novaTarefa.trim()) return;

    onAdicionarTarefa({
      texto: novaTarefa,
      data: dataSelecionada,
      horario: novoHorario,
      prioridade: novaPrioridade,
    });
    setNovaTarefa('');
    setNovoHorario('09:00');
    setNovaPrioridade('Média');
  }

  return (
    <article className="painel-card min-w-0 p-4">
      <h3>Tarefas da Semana</h3>

      <form className="form-tarefa mb-3.5 flex flex-wrap gap-2" onSubmit={enviarTarefa}>
        <input
          type="text"
          placeholder="Digite uma tarefa..."
          value={novaTarefa}
          onChange={(event) => setNovaTarefa(event.target.value)}
        />

        <input
          type="time"
          value={novoHorario}
          onChange={(event) => setNovoHorario(event.target.value)}
          aria-label="Horário da tarefa"
        />

        <select
          value={novaPrioridade}
          onChange={(event) => setNovaPrioridade(event.target.value)}
          aria-label="Prioridade da tarefa"
        >
          <option value="Baixa">Baixa prioridade</option>
          <option value="Média">Média prioridade</option>
          <option value="Alta">Alta prioridade</option>
        </select>

        <button type="submit">Adicionar</button>
      </form>

      {tarefasDaData.length === 0 ? (
        <p className="text-xs leading-relaxed text-farol-muted">
          {tarefas.length === 0
            ? 'Nenhuma tarefa cadastrada ainda.'
            : 'Nenhuma tarefa para esta data.'}
        </p>
      ) : (
        <div className="grid gap-2">
          {tarefasDaData.map((tarefa) => (
            <div className="item-tarefa" key={tarefa.id}>
              <label>
                <input
                  type="checkbox"
                  checked={tarefa.concluida}
                  onChange={() => onAlternarTarefa(tarefa.id)}
                />
                <span className={tarefa.concluida ? 'tarefa-concluida' : ''}>
                  {tarefa.texto}
                  <small className="mt-1 block text-xs text-farol-muted">
                    {tarefa.horario} &middot; Prioridade {tarefa.prioridade}
                  </small>
                </span>
              </label>

              <button
                type="button"
                className="remover-tarefa"
                onClick={() => onRemoverTarefa(tarefa.id)}
                aria-label={`Remover tarefa ${tarefa.texto}`}
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

export default Tarefas;
