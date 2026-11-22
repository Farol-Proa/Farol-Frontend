function copiarConteudo(conteudo) {
  return Array.isArray(conteudo) ? JSON.parse(JSON.stringify(conteudo)) : [];
}

function documentoTemConteudo(conteudo) {
  return (conteudo ?? []).some((bloco) => {
    if (bloco.type !== 'paragraph') return true;
    const inline = Array.isArray(bloco.content) ? bloco.content : [];
    return inline.some((item) => item.type !== 'text' || Boolean(item.text));
  });
}

export const estadoInicialNotas = {
  notas: [],
  carregando: true,
  salvando: false,
  erro: '',
  sucesso: '',
  idSelecionado: null,
  notaNova: false,
  titulo: '',
  conteudo: [],
  tituloSalvo: '',
  conteudoSalvo: [],
  objetivoId: null,
  etapaId: null,
  revisao: null,
  conflito: false,
  chaveEditorNovo: 0,
};

export function rascunhoNotasSujo(estado) {
  if (estado.notaNova) {
    return Boolean(estado.titulo.trim()) || documentoTemConteudo(estado.conteudo);
  }
  return estado.titulo !== estado.tituloSalvo ||
    JSON.stringify(estado.conteudo) !== JSON.stringify(estado.conteudoSalvo);
}

export function dadosAtualizacaoNota(estado) {
  return {
    titulo: estado.titulo,
    conteudo: estado.conteudo,
    objetivoId: estado.objetivoId,
    etapaId: estado.etapaId,
    revisao: estado.revisao,
  };
}

function estadoDaNota(estado, nota) {
  const conteudo = copiarConteudo(nota.conteudo);
  return {
    ...estado,
    idSelecionado: nota.id,
    notaNova: false,
    titulo: nota.titulo,
    conteudo,
    tituloSalvo: nota.titulo,
    conteudoSalvo: copiarConteudo(conteudo),
    objetivoId: nota.objetivoId ?? null,
    etapaId: nota.etapaId ?? null,
    revisao: nota.revisao,
    erro: '',
    sucesso: '',
    conflito: false,
    salvando: false,
  };
}

export function notasReducer(estado, acao) {
  switch (acao.tipo) {
    case 'carregamento-iniciado':
      return { ...estado, carregando: true, erro: '' };
    case 'carregamento-concluido':
      return { ...estado, notas: acao.notas ?? [], carregando: false, erro: '' };
    case 'carregamento-falhou':
      return { ...estado, carregando: false, erro: acao.mensagem };
    case 'selecionar-nota':
      return estadoDaNota(estado, acao.nota);
    case 'criar-rascunho':
      return {
        ...estado,
        idSelecionado: null,
        notaNova: true,
        titulo: '',
        conteudo: [],
        tituloSalvo: '',
        conteudoSalvo: [],
        objetivoId: acao.objetivoId ?? null,
        etapaId: acao.etapaId ?? null,
        revisao: null,
        erro: '',
        sucesso: '',
        conflito: false,
        salvando: false,
        chaveEditorNovo: estado.chaveEditorNovo + 1,
      };
    case 'editar-titulo':
      return { ...estado, titulo: acao.titulo, erro: '', sucesso: '' };
    case 'editar-conteudo':
      return { ...estado, conteudo: copiarConteudo(acao.conteudo), erro: '', sucesso: '' };
    case 'alterar-associacao':
      return {
        ...estado,
        objetivoId: acao.objetivoId ?? null,
        etapaId: acao.etapaId ?? null,
        erro: '',
        sucesso: '',
      };
    case 'salvamento-iniciado':
      return { ...estado, salvando: true, erro: '', sucesso: '' };
    case 'nota-criada':
    case 'nota-atualizada': {
      const notas = estado.notas.filter((nota) => nota.id !== acao.nota.id);
      const atualizado = estadoDaNota(
        { ...estado, notas: [...notas, acao.nota] },
        acao.nota,
      );
      return {
        ...atualizado,
        sucesso: acao.tipo === 'nota-criada' ? 'Nota criada.' : 'Alterações salvas.',
      };
    }
    case 'salvamento-falhou':
      return {
        ...estado,
        salvando: false,
        erro: acao.conflito
          ? 'Esta nota foi modificada em outra sessão. Seu rascunho continua preservado; não tentamos sobrescrever a versão do servidor.'
          : acao.mensagem,
        conflito: Boolean(acao.conflito),
      };
    case 'exclusao-iniciada':
      return { ...estado, salvando: true, erro: '', sucesso: '' };
    case 'nota-excluida': {
      const notas = estado.notas.filter((nota) => nota.id !== acao.id);
      if (estado.idSelecionado !== acao.id) {
        return { ...estado, notas, salvando: false, sucesso: 'Nota excluída.' };
      }
      return {
        ...estado,
        notas,
        salvando: false,
        idSelecionado: null,
        notaNova: false,
        titulo: '',
        conteudo: [],
        tituloSalvo: '',
        conteudoSalvo: [],
        objetivoId: null,
        etapaId: null,
        revisao: null,
        conflito: false,
        sucesso: 'Nota excluída.',
      };
    }
    case 'exclusao-falhou':
      return { ...estado, salvando: false, erro: acao.mensagem };
    case 'descartar-rascunho': {
      if (estado.notaNova) {
        return {
          ...estado,
          idSelecionado: null,
          notaNova: false,
          titulo: '',
          conteudo: [],
          tituloSalvo: '',
          conteudoSalvo: [],
          objetivoId: null,
          etapaId: null,
          revisao: null,
          conflito: false,
          erro: '',
          sucesso: '',
        };
      }
      const notaSelecionada = estado.notas.find((nota) => nota.id === estado.idSelecionado);
      if (notaSelecionada) return estadoDaNota(estado, notaSelecionada);
      return estado;
    }
    default:
      return estado;
  }
}
