import { useState, useEffect } from 'react';
import { requisicaoAPI } from '../services/api';
import Icon from '../components/Icon';
import Sidebar from '../components/Sidebar';
import RoadmapCanvas from './Ilhas/RoadmapCanvas';
import './Ilhas.css';

function MapHeader({ roadmap, onChangeRoadmap, todosRoadmaps, onNovoObjetivo }) {
  return (
    <header className="ilhas-header">
      <div className="ilhas-heading">
        <p className="ilhas-eyebrow"><span aria-hidden="true" /> Sua rota</p>
        <h1>{roadmap.title}</h1>
        <p className="ilhas-subtitle">{roadmap.objective}</p>
      </div>

      <div className="ilhas-profile-area">
        <button
          className="btn-novo-objetivo"
          type="button"
          onClick={onNovoObjetivo}
        >
          <Icon name="plus" size={17} />
          Novo objetivo
        </button>
        <label className="roadmap-select-label">
          <span>Trocar mapa</span>
          <select value={roadmap.id} onChange={(event) => onChangeRoadmap(event.target.value)}>
            {todosRoadmaps.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
          </select>
        </label>
        <button className="ilhas-notifications" type="button" aria-label="Notificações">
          <Icon name="bell" size={17} />
        </button>
        <div className="ilhas-profile"><span>AC</span><strong>Robriel</strong></div>
      </div>
    </header>
  );
}

function RoadmapsStrip({ selectedId, onSelectRoadmap, todosRoadmaps, onExcluirRoadmap }) {
  return (
    <section className="ilhas-goals" aria-label="Seus mapas">
      {todosRoadmaps.map((roadmap) => {
        // O resumo usa somente ilhas concluídas; etapas individuais não estão ligadas a esses dados demonstrativos.
        const completed = roadmap.islands.filter((island) => island.status === 'done').length;
        const isSelected = roadmap.id === selectedId;

        return (
          <div key={roadmap.id} className="goal-card-wrapper">
            <button
              type="button"
              aria-pressed={isSelected}
              className={`goal-card ${isSelected ? 'active' : ''}`}
              onClick={() => onSelectRoadmap(roadmap.id)}
            >
              <span className="goal-card-meta">
                <span className={isSelected ? 'is-active' : ''}>
                  <Icon name="map" size={14} />
                  {isSelected ? 'Mapa atual' : 'Mapa'}
                </span>
                <span>{completed}/{roadmap.islands.length} ilhas</span>
              </span>
              <strong className="goal-card-title">{roadmap.title}</strong>
              <span className="goal-card-description">{roadmap.objective}</span>
              <span className="goal-card-progress">
                <span className={isSelected ? 'is-active' : ''} style={{ width: `${(completed / roadmap.islands.length) * 100}%` }} />
              </span>
            </button>

            <button
              type="button"
              className="goal-card-delete"
              aria-label={`Excluir ${roadmap.title}`}
              title="Excluir roadmap"
              onClick={() => onExcluirRoadmap(roadmap.id, roadmap.title)}
            >
              <Icon name="trash" size={13} />
            </button>
          </div>
        );
      })}
    </section>
  );
}

function Ilhas({ onNavegar }) {
  const [selectedRoadmapId, setSelectedRoadmapId] = useState(null);
  const [selectedIslandId, setSelectedIslandId] = useState(null);
  const [meusObjetivos, setMeusObjetivos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [prioridade, setPrioridade] = useState('MEDIA');
  const [prazo, setPrazo] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [mostrarFormularioEtapa, setMostrarFormularioEtapa] = useState(false);
  const [tituloEtapa, setTituloEtapa] = useState('');
  const [descricaoEtapa, setDescricaoEtapa] = useState('');
  const [prazoEtapa, setPrazoEtapa] = useState('');
  const [salvandoEtapa, setSalvandoEtapa] = useState(false);
  const [objetivoEtapaId, setObjetivoEtapaId] = useState(null);

  useEffect(() => {
    async function carregarObjetivos() {
      try {
        const resposta = await requisicaoAPI('/objetivos');

        const mapasFormatados = await Promise.all(
          resposta.map(async (objetivo) => {
            const etapas = await requisicaoAPI(
              `/objetivos/${objetivo.id}/etapas`
            );

            const ilhas = etapas.map((etapa, index) => ({
              id: String(etapa.id),
              title: etapa.titulo,
              description: etapa.descricao,
              category: 'Etapa',

              status:
                etapa.status === 'CONCLUIDA'
                  ? 'done'
                  : etapa.status === 'EM_ANDAMENTO'
                    ? 'progress'
                    : 'locked',

              completed: 0,
              total: 0,
              icon: 'target',
              index,

              position: {
                x: 360 + index * 330,
                y: index % 2 === 0 ? 100 : 370,
              },
            }));

            const connections = ilhas.map((ilha, index) => ({
              source: index === 0 ? 'farol' : ilhas[index - 1].id,
              target: ilha.id,
            }));

            return {
              id: String(objetivo.id),
              title: objetivo.titulo,
              objective: objetivo.descricao || 'Objetivo em construção.',
              lighthouseCaption: 'Seu objetivo',
              islands: ilhas,
              connections,
            };
          })
        );

        setMeusObjetivos(mapasFormatados);

        if (mapasFormatados.length > 0) {
          setSelectedRoadmapId(mapasFormatados[0].id);
        }
      } catch (erro) {
        console.error('Erro ao carregar objetivos e etapas:', erro);
      } finally {
        setCarregando(false);
      }
    }

    carregarObjetivos();
  }, []);

  const todosRoadmaps = meusObjetivos;

  const roadmap =
    todosRoadmaps.find((item) => item.id === selectedRoadmapId) ??
    todosRoadmaps[0] ??
    null;

  function changeRoadmap(id) {
    setSelectedRoadmapId(id);
    // A seleção pertence ao mapa atual; ao trocar de mapa, não carregamos um id de ilha que pode não existir nele.
    setSelectedIslandId(null);
  }

  async function excluirRoadmap(id, nome) {
    const confirmar = window.confirm(
      `Tem certeza que deseja excluir o objetivo "${nome}"? Todas as etapas e tarefas relacionadas também serão excluídas.`
    );

    if (!confirmar) return;

    try {
      await requisicaoAPI(`/objetivos/${id}`, {
        method: 'DELETE',
      });

      const objetivosAtualizados = meusObjetivos.filter(
        (objetivo) => objetivo.id !== String(id)
      );

      setMeusObjetivos(objetivosAtualizados);

      if (selectedRoadmapId === String(id)) {
        setSelectedRoadmapId(objetivosAtualizados[0]?.id ?? null);
      }

      setSelectedIslandId(null);

    } catch (erro) {
      console.error('Erro ao excluir objetivo:', erro);
      alert(erro.message || 'Não foi possível excluir o objetivo.');
    }
  }

  async function cadastrarObjetivo(event) {
    event.preventDefault();

    if (!titulo.trim()) {
      alert('Digite o título do objetivo.');
      return;
    }

    setSalvando(true);

    try {
      const resposta = await requisicaoAPI('/objetivos', {
        method: 'POST',
        body: JSON.stringify({
          titulo: titulo.trim(),
          descricao: descricao.trim(),
          prioridade,
          prazo: prazo || null,
        }),
      });

      const novoMapa = {
        id: String(resposta.id),
        title: resposta.titulo,
        objective: resposta.descricao || 'Objetivo em construção.',
        lighthouseCaption: 'Seu objetivo',
        islands: [],
        connections: [],
      };

      setMeusObjetivos((atuais) => [...atuais, novoMapa]);
      setSelectedRoadmapId(novoMapa.id);
      setSelectedIslandId(null);

      setTitulo('');
      setDescricao('');
      setPrioridade('MEDIA');
      setPrazo('');
      setMostrarFormulario(false);
      setObjetivoEtapaId(novoMapa.id);
      setMostrarFormularioEtapa(true);

    } catch (erro) {
      console.error('Erro ao cadastrar objetivo:', erro);
      alert(erro.message || 'Não foi possível cadastrar o objetivo.');
    } finally {
      setSalvando(false);
    }

  }

  async function cadastrarEtapa(event) {
    event.preventDefault();

    if (!tituloEtapa.trim()) {
      alert('Digite o título da etapa.');
      return;
    }

    setSalvandoEtapa(true);

    try {
      const objetivoAtual = meusObjetivos.find(
        (objetivo) => objetivo.id === String(objetivoEtapaId)
      );

      const etapasAtuais = objetivoAtual?.islands ?? [];

      const resposta = await requisicaoAPI(
        `/objetivos/${objetivoEtapaId}/etapas`,
        {
          method: 'POST',
          body: JSON.stringify({
            titulo: tituloEtapa.trim(),
            descricao: descricaoEtapa.trim(),
            ordem: etapasAtuais.length,
            status: 'NAO_INICIADA',
            prazo: prazoEtapa || null,
          }),
        }
      );

      const novaIlha = {
        id: String(resposta.id),
        title: resposta.titulo,
        description: resposta.descricao,
        category: 'Etapa',
        status: 'locked',
        completed: 0,
        total: 0,
        icon: 'target',
        index: etapasAtuais.length,
        position: {
          x: 360 + etapasAtuais.length * 330,
          y: etapasAtuais.length % 2 === 0 ? 100 : 370,
        },
      };

      setMeusObjetivos((atuais) =>
        atuais.map((objetivo) =>
          objetivo.id === String(objetivoEtapaId)
            ? {
              ...objetivo,
              islands: [...objetivo.islands, novaIlha],
              connections: [
                ...objetivo.connections,
                {
                  source:
                    etapasAtuais.length === 0
                      ? 'farol'
                      : etapasAtuais[etapasAtuais.length - 1].id,
                  target: novaIlha.id,
                },
              ],
            }
            : objetivo
        )
      );

      setTituloEtapa('');
      setDescricaoEtapa('');
      setPrazoEtapa('');

    } catch (erro) {
      console.error('Erro ao cadastrar etapa:', erro);
      alert(erro.message || 'Não foi possível cadastrar a etapa.');
    } finally {
      setSalvandoEtapa(false);
    }
  }

  return (
    <div className="ilhas-screen">
      <Sidebar activeItem="Ilhas" onNavegar={onNavegar} />
      <main className="ilhas-main">
        {mostrarFormulario && (
          <div className="objetivo-modal-overlay">
            <form className="objetivo-modal" onSubmit={cadastrarObjetivo}>
              <div className="objetivo-modal-header">
                <div>
                  <span className="ilhas-eyebrow">NOVA JORNADA</span>
                  <h2>Criar objetivo</h2>
                  <p>Defina seu destino. Depois, você poderá criar as ilhas da sua jornada.</p>
                </div>

                <button
                  type="button"
                  className="objetivo-modal-close"
                  onClick={() => setMostrarFormulario(false)}
                  aria-label="Fechar formulário"
                >
                  <Icon name="x" size={20} />
                </button>
              </div>

              <label>
                Nome do objetivo *
                <input
                  type="text"
                  value={titulo}
                  onChange={(event) => setTitulo(event.target.value)}
                  placeholder="Ex.: Aprender Java"
                  maxLength={180}
                  required
                />
              </label>

              <label>
                Descrição
                <textarea
                  value={descricao}
                  onChange={(event) => setDescricao(event.target.value)}
                  placeholder="Descreva o que deseja alcançar..."
                  rows={3}
                />
              </label>

              <div className="objetivo-modal-fields">
                <label>
                  Prioridade
                  <select
                    value={prioridade}
                    onChange={(event) => setPrioridade(event.target.value)}
                  >
                    <option value="BAIXA">Baixa</option>
                    <option value="MEDIA">Média</option>
                    <option value="ALTA">Alta</option>
                  </select>
                </label>

                <label>
                  Prazo
                  <input
                    type="date"
                    value={prazo}
                    onChange={(event) => setPrazo(event.target.value)}
                  />
                </label>
              </div>

              <div className="objetivo-modal-actions">
                <button
                  type="button"
                  onClick={() => setMostrarFormulario(false)}
                  disabled={salvando}
                >
                  Cancelar
                </button>

                <button type="submit" disabled={salvando}>
                  <Icon name="plus" size={16} />
                  {salvando ? 'Salvando...' : 'Criar objetivo'}
                </button>
              </div>
            </form>
          </div>
        )}
        {mostrarFormularioEtapa && (
          <div className="objetivo-modal-overlay">
            <form className="objetivo-modal" onSubmit={cadastrarEtapa}>
              <div className="objetivo-modal-header">
                <div>
                  <span className="ilhas-eyebrow">SUA JORNADA</span>
                  <h2>Adicionar primeira etapa</h2>
                  <p>Divida seu objetivo em pequenas conquistas para avançar na sua jornada.</p>
                </div>

                <button
                  type="button"
                  className="objetivo-modal-close"
                  onClick={() => setMostrarFormularioEtapa(false)}
                  aria-label="Fechar formulário"
                >
                  <Icon name="x" size={20} />
                </button>
              </div>

              <label>
                Nome da etapa *
                <input
                  type="text"
                  value={tituloEtapa}
                  onChange={(event) => setTituloEtapa(event.target.value)}
                  placeholder="Ex.: Aprender lógica de programação"
                  maxLength={180}
                  required
                />
              </label>

              <label>
                Descrição
                <textarea
                  value={descricaoEtapa}
                  onChange={(event) => setDescricaoEtapa(event.target.value)}
                  placeholder="O que você precisa fazer nesta etapa?"
                  rows={3}
                />
              </label>

              <label>
                Prazo
                <input
                  type="date"
                  value={prazoEtapa}
                  onChange={(event) => setPrazoEtapa(event.target.value)}
                />
              </label>

              <div className="objetivo-modal-actions">
                <button
                  type="button"
                  onClick={() => {
                    setMostrarFormularioEtapa(false);
                    setTituloEtapa('');
                    setDescricaoEtapa('');
                    setPrazoEtapa('');
                  }}
                  disabled={salvandoEtapa}
                >
                  Concluir
                </button>

                <button type="submit" disabled={salvandoEtapa}>
                  <Icon name="plus" size={16} />
                  {salvandoEtapa ? 'Salvando...' : 'Adicionar etapa'}
                </button>
              </div>
            </form>
          </div>
        )}
        {carregando ? (
          <section className="ilhas-empty-state">
            <p>Carregando seus objetivos...</p>
          </section>
        ) : roadmap ? (
          <>
            <MapHeader
              roadmap={roadmap}
              onChangeRoadmap={changeRoadmap}
              todosRoadmaps={todosRoadmaps}
              onNovoObjetivo={() => setMostrarFormulario(true)}
            />

            <RoadmapCanvas
              roadmap={roadmap}
              onSelectIsland={setSelectedIslandId}
            />

            <RoadmapsStrip
              selectedId={selectedRoadmapId}
              onSelectRoadmap={changeRoadmap}
              todosRoadmaps={todosRoadmaps}
              onExcluirRoadmap={excluirRoadmap}
            />

            <span className="sr-only" aria-live="polite">
              {selectedIslandId
                ? `Ilha selecionada: ${roadmap.islands.find(
                  (island) => island.id === selectedIslandId
                )?.title ?? ''
                }`
                : ''}
            </span>
          </>
        ) : (
          <section className="ilhas-empty-state">
            <Icon name="map" size={36} />

            <h2>Sua jornada começa aqui!</h2>

            <p>
              Você ainda não possui objetivos cadastrados.
              Crie seu primeiro objetivo para começar a montar sua jornada.
            </p>

            <button
              className="btn-novo-objetivo"
              type="button"
              onClick={() => setMostrarFormulario(true)}
            >
              <Icon name="plus" size={17} />
              Criar primeiro objetivo
            </button>
          </section>
        )}
      </main>
    </div>
  );
}

export default Ilhas;
