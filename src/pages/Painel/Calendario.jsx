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

function Calendario({ mesExibido, dataSelecionada, tarefas, onMudarMes, onSelecionarData }) {
  const dias = obterDiasDoMes(mesExibido);

  return (
    <article className="painel-card min-w-0 p-4" id="calendario">
      <h3>Meu calendário</h3>
      <p className="text-xs leading-relaxed text-farol-muted">
        Organize seu tempo e suas prioridades.
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

          const temTarefa = tarefas.some((tarefa) => tarefa.data === item.dataFormatada);

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
        Data selecionada: {dataSelecionada}
      </p>
    </article>
  );
}

export default Calendario;
