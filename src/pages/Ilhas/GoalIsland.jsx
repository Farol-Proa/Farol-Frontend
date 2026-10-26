import { useEffect, useRef, useState } from 'react';
import { Handle, Position } from '@xyflow/react';

const FAROL_IMAGE = '/images/lighthouse-island.png';

export function GoalNode({ data }) {
  const fileInputRef = useRef(null);
  const [imagemEscolhida, setImagemEscolhida] = useState(null);
  // A imagem selecionada pelo usuário vale apenas enquanto este nó estiver montado; caso contrário usamos os dados do mapa ou a imagem padrão.
  const imagemFundo = imagemEscolhida ?? data.image ?? FAROL_IMAGE;

  useEffect(() => {
    return () => {
      // Libera a URL temporária criada pelo navegador para não manter o arquivo em memória após a troca da imagem ou desmontagem.
      if (imagemEscolhida) URL.revokeObjectURL(imagemEscolhida);
    };
  }, [imagemEscolhida]);

  function handleArquivoSelecionado(event) {
    const arquivo = event.target.files?.[0];
    if (arquivo) setImagemEscolhida(URL.createObjectURL(arquivo));
    // Permite escolher novamente o mesmo arquivo: sem limpar o input, alguns navegadores não disparam onChange.
    event.target.value = '';
  }

  return (
    <div className="lighthouse-node roadmap-lighthouse-node">
      <Handle type="source" position={Position.Right} className="roadmap-handle" />
      <img src={imagemFundo} alt="" draggable="false" />
      <div className="lighthouse-caption">
        <p>{data.caption}</p>
        <strong>{data.title}</strong>
      </div>
      <input
        ref={fileInputRef}
        className="lighthouse-file-input nodrag"
        type="file"
        accept="image/*"
        onChange={handleArquivoSelecionado}
        tabIndex={-1}
        aria-hidden="true"
      />
      <button
        className="lighthouse-image-button nodrag"
        type="button"
        aria-label="Escolher imagem do objetivo"
        title="Escolher imagem do objetivo"
        onClick={() => fileInputRef.current?.click()}
      >
        Alterar imagem
      </button>
    </div>
  );
}
