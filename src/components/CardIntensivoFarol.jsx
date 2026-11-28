import { useState, useEffect, useCallback } from 'react';
import Icon from './Icon';
import FarolLuz from './FarolLuz';
import { obterDadosIntensivo } from '../services/intensivoApi';
import {
  obterProximoMarcoParaCelebrar,
  marcarMarcoVisualizado,
} from '../services/intensivoMilestones';
import './CardIntensivoFarol.css';

function CardIntensivoFarol({ tarefas = [] }) {
  const usuario = JSON.parse(sessionStorage.getItem('usuario') || '{}');
  const usuarioId = usuario.id || usuario.email || 'padrao';

  const [dados, setDados] = useState({
    diasConsecutivos: 0,
    recordePessoal: 0,
    concluiuHoje: false,
    nivelLuz: 0,
    historico7Dias: [],
    proximoMarco: null,
    marcos: [],
    mensagem: null,
  });

  const [marcoCelebracao, setMarcoCelebracao] = useState(null);

  const carregarIntensivo = useCallback(async () => {
    try {
      const resposta = await obterDadosIntensivo();
      if (resposta) {
        setDados(resposta);

        // Verificar se há novo marco alcançado para celebrar
        const novoMarco = obterProximoMarcoParaCelebrar(usuarioId, resposta.marcos);
        if (novoMarco) {
          setMarcoCelebracao(novoMarco);
        }
      }
    } catch (e) {
      console.warn('Erro ao carregar dados do intensivo:', e);
    }
  }, [usuarioId]);

  useEffect(() => {
    carregarIntensivo();

    function onAtualizacao() {
      carregarIntensivo();
    }

    window.addEventListener('farol:intensivo-atualizado', onAtualizacao);
    return () => {
      window.removeEventListener('farol:intensivo-atualizado', onAtualizacao);
    };
  }, [carregarIntensivo, tarefas]);

  function fecharCelebracao() {
    if (marcoCelebracao) {
      marcarMarcoVisualizado(usuarioId, marcoCelebracao.dias);
      setMarcoCelebracao(null);
    }
  }

  const {
    diasConsecutivos,
    recordePessoal,
    concluiuHoje,
    nivelLuz,
    historico7Dias = [],
    proximoMarco,
    mensagem,
  } = dados;

  // Cálculo da barra de progresso para o próximo marco
  const percentualProximoMarco = proximoMarco
    ? Math.min(
        100,
        Math.round(
          ((proximoMarco.dias - proximoMarco.diasRestantes) / proximoMarco.dias) * 100,
        ),
      )
    : 100;

  return (
    <article className="painel-card card-intensivo-farol" id="intensivo-farol">
      {/* Cabeçalho do Intensivo */}
      <header className="intensivo-header">
        <div className="intensivo-tag-wrapper">
          <span className="intensivo-tag">
            <Icon name="lighthouse" size={15} />
            <span>Intensivo do Farol</span>
          </span>
          {recordePessoal > 0 && (
            <span className="intensivo-recorde" title="Maior sequência alcançada">
              Recorde: {recordePessoal} {recordePessoal === 1 ? 'dia' : 'dias'}
            </span>
          )}
        </div>

        <div className="intensivo-dias-bloco">
          <h3 className="intensivo-dias-valor">
            {diasConsecutivos}{' '}
            <span className="intensivo-dias-rotulo">
              {diasConsecutivos === 1 ? 'dia consecutivo' : 'dias consecutivos'}
            </span>
          </h3>
        </div>
      </header>

      {/* Ilustração Visual da Luz do Farol */}
      <div className="intensivo-farol-visual">
        <FarolLuz nivelLuz={nivelLuz} concluiuHoje={concluiuHoje} />
      </div>

      {/* Status da Luz de Hoje & Mensagem Motivacional */}
      <div className={`intensivo-status-banner ${concluiuHoje ? 'status-concluido' : 'status-pendente'}`}>
        <div className="intensivo-status-badge">
          <span className="intensivo-status-dot" aria-hidden="true" />
          <span className="intensivo-status-texto">
            {concluiuHoje ? 'Luz do Farol ativa hoje' : 'Aguardando tarefa de hoje'}
          </span>
        </div>
        <p className="intensivo-status-mensagem">
          {mensagem?.subtitulo ||
            (concluiuHoje
              ? 'Você concluiu sua tarefa de hoje! Seu farol continua iluminando seu caminho.'
              : 'Conclua uma tarefa hoje para acender seu farol e manter sua sequência viva.')}
        </p>
      </div>

      {/* Histórico dos Últimos 7 Dias */}
      {historico7Dias.length > 0 && (
        <div className="intensivo-historico-secao">
          <div className="intensivo-historico-rotulo">Últimos 7 dias</div>
          <div className="intensivo-historico-grid" role="list" aria-label="Histórico dos últimos 7 dias">
            {historico7Dias.map((dia) => {
              const statusClasse = dia.status.toLowerCase();
              return (
                <div
                  key={dia.data}
                  className={`historico-dia-item ${statusClasse} ${dia.hoje ? 'dia-hoje' : ''}`}
                  role="listitem"
                  title={`${dia.diaSemana} (${dia.data}): ${
                    dia.concluiu
                      ? 'Tarefa concluída'
                      : dia.hoje
                        ? 'Hoje: aguardando conclusão'
                        : dia.status === 'PERDIDO'
                          ? 'Sem tarefa concluída'
                          : 'Futuro'
                  }`}
                >
                  <div className="historico-dia-indicador">
                    {dia.concluiu ? (
                      <span className="indicador-luz-acesa" aria-hidden="true">
                        <Icon name="sparkles" size={12} />
                      </span>
                    ) : dia.hoje ? (
                      <span className="indicador-luz-hoje" aria-hidden="true" />
                    ) : (
                      <span className="indicador-luz-apagada" aria-hidden="true" />
                    )}
                  </div>
                  <span className="historico-dia-nome">{dia.diaSemana}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Progresso do Próximo Marco */}
      {proximoMarco && (
        <div className="intensivo-proximo-marco">
          <div className="proximo-marco-info">
            <span className="proximo-marco-titulo">
              Próximo marco: <strong>{proximoMarco.titulo}</strong> ({proximoMarco.dias} dias)
            </span>
            <span className="proximo-marco-restantes">
              {proximoMarco.diasRestantes === 1
                ? 'Falta 1 dia'
                : `Faltam ${proximoMarco.diasRestantes} dias`}
            </span>
          </div>
          <div
            className="proximo-marco-barra-trilha"
            role="progressbar"
            aria-valuenow={percentualProximoMarco}
            aria-valuemin="0"
            aria-valuemax="100"
            aria-label={`Progresso para o marco ${proximoMarco.titulo}`}
          >
            <div
              className="proximo-marco-barra-preenchimento"
              style={{ width: `${percentualProximoMarco}%` }}
            />
          </div>
        </div>
      )}

      {/* Modal / Alerta de Celebração de Marco */}
      {marcoCelebracao && (
        <div className="intensivo-celebracao-overlay" role="dialog" aria-modal="true">
          <div className="intensivo-celebracao-modal">
            <div className="celebracao-icone-wrapper">
              <Icon name="lighthouse" size={32} />
            </div>
            <span className="celebracao-tag">Nova Conquista Desbloqueada!</span>
            <h4 className="celebracao-titulo">{marcoCelebracao.titulo}</h4>
            <p className="celebracao-descricao">{marcoCelebracao.descricao}</p>
            <p className="celebracao-dias">
              Você manteve <strong>{marcoCelebracao.dias} dias consecutivos</strong> de consistência. Seu farol
              agora ilumina as águas com mais vigor!
            </p>
            <button
              type="button"
              className="celebracao-botao-fechar"
              onClick={fecharCelebracao}
            >
              Continuar iluminando
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

export default CardIntensivoFarol;
