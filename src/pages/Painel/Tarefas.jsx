import { useState } from 'react';
import { formatarPrazo } from '../../dashboard/taskDates';

function Tarefas({ tarefas, onAlternarTarefa, onRemoverTarefa }) {
  const [erro, setErro] = useState('');

  async function executarAcao(acao) {
    setErro('');
    try {
      await acao();
    } catch (requestError) {
      setErro(requestError.message || 'Não foi possível atualizar a tarefa.');
    }
  }

  return (
    <article className="painel-card min-w-0 p-4">
      <h3>Minhas tarefas</h3>
      <p className="mb-3 text-xs leading-relaxed text-farol-muted">
        Acompanhe o andamento e os prazos das tarefas dos seus objetivos.
      </p>
      {erro && (
        <p role="alert" className="text-xs text-red-300">
          {erro}
        </p>
      )}

      {tarefas.length === 0 ? (
        <p className="text-xs leading-relaxed text-farol-muted">Nenhuma tarefa cadastrada ainda.</p>
      ) : (
        <div className="grid gap-2">
          {tarefas.map((tarefa) => (
            <div className="item-tarefa" key={tarefa.id}>
              <label>
                <input
                  type="checkbox"
                  checked={tarefa.concluida}
                  onChange={() => executarAcao(() => onAlternarTarefa(tarefa.id, tarefa.concluida))}
                />
                <span className={tarefa.concluida ? 'tarefa-concluida' : ''}>
                  {tarefa.texto}
                  <small className="mt-1 block text-xs text-farol-muted">
                    {tarefa.objetivoNome} · {tarefa.etapaNome}
                    {tarefa.prazo && ` · Prazo ${formatarPrazo(tarefa.prazo)}`}
                  </small>
                </span>
              </label>

              <button
                type="button"
                className="remover-tarefa"
                onClick={() => executarAcao(() => onRemoverTarefa(tarefa.id))}
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
