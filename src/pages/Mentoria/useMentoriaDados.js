import { useState, useEffect, useCallback } from 'react';
import {
  obterPerfilMentorAtual,
  obterVinculoAtivoMentorado,
  listarMentoresDisponiveis,
  listarMinhasSolicitacoes,
  listarMentoradosDoMentor,
  listarSolicitacoesDoMentor,
} from '../../services/mentoriaApi.js';

export function useMentoriaDados() {
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [papelAtivo, setPapelAtivo] = useState(null); // 'MENTOR' | 'MENTORADO'
  const [perfilMentor, setPerfilMentor] = useState(null);
  const [vinculoAtivo, setVinculoAtivo] = useState(null);
  const [solicitacaoPendente, setSolicitacaoPendente] = useState(null);
  const [mentoresDisponiveis, setMentoresDisponiveis] = useState([]);
  const [mentorados, setMentorados] = useState([]);
  const [solicitacoesMentor, setSolicitacoesMentor] = useState([]);

  const carregarDados = useCallback(async () => {
    setCarregando(true);
    setErro('');

    try {
      // 1. Tenta carregar perfil de mentor do usuário atual
      let perfil = null;
      try {
        perfil = await obterPerfilMentorAtual();
      } catch {
        perfil = null;
      }
      setPerfilMentor(perfil);

      const ehMentorAprovado = perfil && perfil.status === 'APROVADO';

      if (ehMentorAprovado) {
        setPapelAtivo((antigo) => antigo || 'MENTOR');
        // Carrega dados do mentor
        const [listaMentorados, listaSolicitacoes] = await Promise.all([
          listarMentoradosDoMentor().catch(() => []),
          listarSolicitacoesDoMentor().catch(() => []),
        ]);
        setMentorados(listaMentorados || []);
        setSolicitacoesMentor((listaSolicitacoes || []).filter((s) => s.status === 'PENDENTE'));
      } else {
        setPapelAtivo('MENTORADO');
        // Carrega dados do mentorado
        const vinculo = await obterVinculoAtivoMentorado().catch(() => null);
        setVinculoAtivo(vinculo || null);

        if (!vinculo) {
          const minhasSolicitacoes = await listarMinhasSolicitacoes().catch(() => []);
          const pendente = (minhasSolicitacoes || []).find((s) => s.status === 'PENDENTE');
          setSolicitacaoPendente(pendente || null);

          if (!pendente) {
            const mentores = await listarMentoresDisponiveis().catch(() => []);
            setMentoresDisponiveis(mentores || []);
          }
        }
      }
    } catch (err) {
      setErro(err.message || 'Erro ao carregar módulo de mentoria.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  return {
    carregando,
    erro,
    setErro,
    papelAtivo,
    setPapelAtivo,
    perfilMentor,
    vinculoAtivo,
    setVinculoAtivo,
    solicitacaoPendente,
    setSolicitacaoPendente,
    mentoresDisponiveis,
    setMentoresDisponiveis,
    mentorados,
    setMentorados,
    solicitacoesMentor,
    setSolicitacoesMentor,
    recarregar: carregarDados,
  };
}
