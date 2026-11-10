import { useState } from 'react';

function Objetivos({ objetivos, onAdicionarObjetivo }) {
  const [nome, setNome] = useState('');
  const [formAberto, setFormAberto] = useState(false);

  function criarObjetivo(event) {
    event.preventDefault();
    if (!nome.trim()) return;
    onAdicionarObjetivo(nome);
    setNome('');
    setFormAberto(false);
  }

  return (
    <article className="painel-card painel-ilhas-card min-w-0 p-4" id="mapas">
      <h3>Minhas Ilhas</h3>
      {formAberto && (
        <form className="form-objetivo mb-4 flex flex-wrap gap-2" onSubmit={criarObjetivo}>
          <input
            autoFocus
            type="text"
            placeholder="Qual é o seu objetivo?"
            value={nome}
            onChange={(event) => setNome(event.target.value)}
          />
          <button type="submit">Criar objetivo</button>
          <button type="button" onClick={() => setFormAberto(false)}>
            Cancelar
          </button>
        </form>
      )}
      <div className="painel-ilhas-lista">
        {objetivos.map((objetivo) => (
          <div
            className="painel-ilha-card"
            key={objetivo.id}
            aria-hidden="true"
          >
            <img src="/images/ilha_painel.png" alt="" />
          </div>
        ))}
        <button
          className="painel-ilha-adicionar"
          type="button"
          onClick={() => setFormAberto(true)}
          aria-label="Criar uma nova ilha"
        >
          <span aria-hidden="true">+</span>
          <strong>Criar uma nova</strong>
        </button>
      </div>
    </article>
  );
}

export default Objetivos;
