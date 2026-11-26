import {
  filtrarTarefasPorPrazo,
  formatarPrazo,
  extrairDataCivil,
  formatarHorarioPrazo,
} from '../../dashboard/taskDates';
import Icon from '../../components/Icon';

function obterDiasDoMes(mesExibido) {
  const ano = mesExibido.getFullYear();
  const mes = mesExibido.getMonth();
  const primeiroDia = new Date(ano, mes, 1);
  const totalDias = new Date(ano, mes + 1, 0).getDate();
  // JavaScript conta domingo como 0; a grade do produto começa na segunda-feira.
  const dias = Array.from({ length: (primeiroDia.getDay() + 6) % 7 }, () => null);

  for (let dia = 1; dia <= totalDias; dia++) {
    const dataFormatada = [
      ano,
      String(mes + 1).padStart(2, '0'),
      String(dia).padStart(2, '0'),
    ].join('-');

    dias.push({ dia, dataFormatada });
  }

  return dias;
}

function Calendario({ mesExibido, dataSelecionada, tarefas = [], onMudarMes, onSelecionarData, onNavegar }) {
  const dias = obterDiasDoMes(mesExibido);
  const tarefasDoDia = filtrarTarefasPorPrazo(tarefas, dataSelecionada);

  return (
    <article className="painel-card min-w-0 p-4" id="calendario">
      <h3>Meu calendário</h3>
      <p className="text-xs leading-relaxed text-farol-muted">
        Selecione um dia para ver os prazos das suas tarefas.
      </p>

      <div className="navegacao-mes">
        <button type="button" onClick={() => onMudarMes(-1)} aria-label="Mês anterior">
          ‹
        </button>

        <strong>
          {mesExibido.toLocaleDateString('pt-BR', {
            month: 'long',
            year: 'numeric',
          })}
        </strong>

        <button type="button" onClick={() => onMudarMes(1)} aria-label="Próximo mês">
          ›
        </button>
      </div>

      <div className="calendario-mensal">
        {['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'].map((dia) => (
          <strong className="nome-dia" key={dia}>
            {dia}
          </strong>
        ))}

        {dias.map((item, indice) => {
          if (item === null) {
            return <div className="dia-vazio" key={`vazio-${indice}`} />;
          }

          const temTarefa = tarefas.some(
            (tarefa) => extrairDataCivil(tarefa.prazo) === item.dataFormatada
          );

          return (
            <button
              type="button"
              key={item.dataFormatada}
              className={`dia ${dataSelecionada === item.dataFormatada ? 'dia-selecionado' : ''}`}
              onClick={() => onSelecionarData(item.dataFormatada)}
            >
              <span>{item.dia}</span>
              {temTarefa && <span className="dia-com-tarefa" aria-label="Há tarefas nesta data" />}
            </button>
          );
        })}
      </div>

      <p className="text-xs leading-relaxed text-farol-muted">
        {dataSelecionada ? `Tarefas para ${formatarPrazo(dataSelecionada)}` : 'Selecione uma data'}
      </p>
      {!dataSelecionada ? (
        <p className="calendario-dia-vazio text-xs text-farol-muted">
          Selecione um dia para ver as tarefas com prazo.
        </p>
      ) : tarefasDoDia.length === 0 ? (
        <p className="calendario-dia-vazio text-xs text-farol-muted">
          Nenhuma tarefa com prazo neste dia.
        </p>
      ) : (
        <ul className="calendario-tarefas-dia">
          {tarefasDoDia.map((tarefa) => {
            const horario = formatarHorarioPrazo(tarefa.prazo);

            return (
              <li
                key={tarefa.id}
                className="group relative transition hover:border-blue-500/50"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-medium border ${
                          tarefa.concluida
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                        }`}
                      >
                        {tarefa.concluida ? 'Concluída' : 'Pendente'}
                      </span>
                      {horario && (
                        <span className="flex items-center gap-1 rounded bg-sky-950/40 border border-sky-800/40 px-1.5 py-0.5 text-[10px] font-mono text-sky-300">
                          <Icon name="calendar" size={10} />
                          {horario}
                        </span>
                      )}
                    </div>

                    <p
                      className={`text-xs font-semibold leading-snug break-words ${
                        tarefa.concluida ? 'tarefa-concluida' : 'text-white'
                      }`}
                    >
                      {tarefa.texto}
                    </p>

                    <small className="block text-[11px] text-slate-400">
                      {tarefa.objetivoNome || 'Objetivo'} · {tarefa.etapaNome || 'Ilha'}
                    </small>
                  </div>

                  {onNavegar && (
                    <button
                      type="button"
                      onClick={() =>
                        onNavegar('Ilhas', {
                          objetivoId: tarefa.objetivoId,
                          etapaId: tarefa.etapaId,
                          tarefaId: tarefa.id,
                        })
                      }
                      title={`Abrir tarefa “${tarefa.texto}” na Ilha ${tarefa.etapaNome}`}
                      aria-label={`Abrir tarefa “${tarefa.texto}” na Ilha ${tarefa.etapaNome}`}
                      className="shrink-0 flex items-center gap-1 rounded-lg border border-[#26395C] bg-[#101D3D] px-2 py-1 text-[11px] font-medium text-yellow-400 hover:border-yellow-400 hover:text-yellow-300 transition"
                    >
                      <span>Ver na Ilha</span>
                      <Icon name="arrowRight" size={11} />
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {dataSelecionada && onNavegar && (
        <div className="mt-3 flex items-center justify-between border-t border-[#1F2B48] pt-2.5">
          <span className="text-[11px] text-slate-400">Definir tarefas no mapa:</span>
          <button
            type="button"
            className="cursor-pointer text-xs font-semibold text-yellow-400 transition hover:text-yellow-300"
            onClick={() => onNavegar('Ilhas')}
          >
            Gerenciar nas Ilhas →
          </button>
        </div>
      )}
    </article>
  );
}

export default Calendario;
