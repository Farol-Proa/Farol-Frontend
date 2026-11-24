import { useState, useEffect, useRef } from 'react';
import './ModalGerarMapaIa.css';

const MENSAGENS_CARREGAMENTO = [
  'Iluminando o caminho do seu objetivo...',
  'Estruturando as ilhas da sua jornada...',
  'Definindo tópicos e tarefas práticas...',
  'Conectando os pontos do seu roadmap...',
  'Finalizando os detalhes do seu mapa de estudos...',
];

export default function ModalGerarMapaIa({ aberto, onFechar, onGerar }) {
  const [titulo, setTitulo] = useState('');
  const [nivelConhecimento, setNivelConhecimento] = useState('INICIANTE');
  const [conhecimentosPrevios, setConhecimentosPrevios] = useState('');
  const [disponibilidadeSemanalHoras, setDisponibilidadeSemanalHoras] = useState(10);
  const [prazoSemanas, setPrazoSemanas] = useState(8);
  const [preferencias, setPreferencias] = useState('');

  const [gerando, setGerando] = useState(false);
  const [indiceMensagem, setIndiceMensagem] = useState(0);
  const [erro, setErro] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (aberto) {
      setTitulo('');
      setConhecimentosPrevios('');
      setPreferencias('');
      setErro('');
      setGerando(false);
      setIndiceMensagem(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [aberto]);

  useEffect(() => {
    if (!gerando) return;
    const intervalo = setInterval(() => {
      setIndiceMensagem((atual) => (atual + 1) % MENSAGENS_CARREGAMENTO.length);
    }, 2800);
    return () => clearInterval(intervalo);
  }, [gerando]);

  if (!aberto) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!titulo.trim()) {
      setErro('Por favor, informe o que você deseja aprender.');
      return;
    }

    setErro('');
    setGerando(true);

    try {
      await onGerar({
        titulo: titulo.trim(),
        nivelConhecimento,
        conhecimentosPrevios: conhecimentosPrevios.trim() || null,
        disponibilidadeSemanalHoras: Number(disponibilidadeSemanalHoras) || 10,
        prazoSemanas: Number(prazoSemanas) || 8,
        preferencias: preferencias.trim() || null,
      });
      onFechar();
    } catch (err) {
      setErro(err.message || 'Não foi possível gerar o mapa com inteligência artificial. Tente novamente.');
      setGerando(false);
    }
  }

  return (
    <div className="modal-ia-backdrop" onClick={gerando ? undefined : onFechar}>
      <div
        className="modal-ia-conteudo"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-ia-titulo"
      >
        <header className="modal-ia-header">
          <div className="modal-ia-tag">
            <span aria-hidden="true">✨</span> Inteligência Artificial do Farol
          </div>
          <h2 id="modal-ia-titulo">Criar Trilha com IA</h2>
          <p className="modal-ia-subtitulo">
            Conte-nos seu objetivo de aprendizagem. Nossa IA estruturará as ilhas, tarefas e conexões do seu caminho.
          </p>
          {!gerando && (
            <button
              type="button"
              className="modal-ia-fechar"
              onClick={onFechar}
              aria-label="Fechar"
            >
              ✕
            </button>
          )}
        </header>

        {erro && (
          <div className="modal-ia-alerta-erro" role="alert">
            <span>⚠️</span> {erro}
          </div>
        )}

        {gerando ? (
          <div className="modal-ia-carregando" aria-live="polite">
            <div className="modal-ia-farol-animado">
              <span className="farol-icone" aria-hidden="true">🗼</span>
              <div className="farol-luz" />
            </div>
            <h3>Iluminando seu mapa de estudos</h3>
            <p className="modal-ia-mensagem-progresso">
              {MENSAGENS_CARREGAMENTO[indiceMensagem]}
            </p>
            <p className="modal-ia-dica">
              Isso leva poucos segundos. Estamos criando uma trilha estruturada e personalizada para você.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="modal-ia-form">
            <div className="campo-form">
              <label htmlFor="ia-titulo">
                O que você quer aprender? <span className="obrigatorio">*</span>
              </label>
              <input
                ref={inputRef}
                id="ia-titulo"
                type="text"
                placeholder="Ex: Aprender Java do zero até criar APIs REST com Spring Boot"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                maxLength={180}
                required
              />
            </div>

            <div className="linha-campos">
              <div className="campo-form flex-1">
                <label htmlFor="ia-nivel">Seu nível atual</label>
                <select
                  id="ia-nivel"
                  value={nivelConhecimento}
                  onChange={(e) => setNivelConhecimento(e.target.value)}
                >
                  <option value="INICIANTE">Iniciante (começando do zero)</option>
                  <option value="INTERMEDIARIO">Intermediário (já conheço a base)</option>
                  <option value="AVANCADO">Avançado (quero aprofundar)</option>
                </select>
              </div>

              <div className="campo-form flex-1">
                <label htmlFor="ia-prazo">Prazo desejado</label>
                <select
                  id="ia-prazo"
                  value={prazoSemanas}
                  onChange={(e) => setPrazoSemanas(Number(e.target.value))}
                >
                  <option value={4}>4 semanas (1 mês)</option>
                  <option value={8}>8 semanas (2 meses)</option>
                  <option value={12}>12 semanas (3 meses)</option>
                  <option value={24}>24 semanas (6 meses)</option>
                </select>
              </div>
            </div>

            <div className="campo-form">
              <label htmlFor="ia-disponibilidade">
                Disponibilidade semanal de estudo: <strong>{disponibilidadeSemanalHoras}h / semana</strong>
              </label>
              <input
                id="ia-disponibilidade"
                type="range"
                min={2}
                max={40}
                step={2}
                value={disponibilidadeSemanalHoras}
                onChange={(e) => setDisponibilidadeSemanalHoras(Number(e.target.value))}
              />
              <div className="labels-range">
                <span>2h/sem</span>
                <span>10h/sem</span>
                <span>20h/sem</span>
                <span>40h/sem</span>
              </div>
            </div>

            <div className="campo-form">
              <label htmlFor="ia-previos">
                Conhecimentos prévios <span className="opcional">(opcional)</span>
              </label>
              <textarea
                id="ia-previos"
                rows={2}
                placeholder="Ex: Já conheço lógica de programação e HTML básico..."
                value={conhecimentosPrevios}
                onChange={(e) => setConhecimentosPrevios(e.target.value)}
                maxLength={500}
              />
            </div>

            <div className="campo-form">
              <label htmlFor="ia-preferencias">
                Preferências de estudo <span className="opcional">(opcional)</span>
              </label>
              <input
                id="ia-preferencias"
                type="text"
                placeholder="Ex: Foco em projetos práticos, exercícios e construção de portfólio"
                value={preferencias}
                onChange={(e) => setPreferencias(e.target.value)}
                maxLength={300}
              />
            </div>

            <footer className="modal-ia-acoes">
              <button
                type="button"
                className="btn-cancelar"
                onClick={onFechar}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-gerar-ia"
              >
                <span>✨</span> Iluminar meu caminho com IA
              </button>
            </footer>
          </form>
        )}
      </div>
    </div>
  );
}
