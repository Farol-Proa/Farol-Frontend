import { useMemo, useState } from 'react';
import { getIslandLearning } from './learningData';
import { noteRepository } from './learningRepository';

export default function IslandLearningPanel({ island, roadmapId, progress, onProgress, onClose }) {
  const [topicId, setTopicId] = useState(null);
  const [draft, setDraft] = useState('');
  const [editing, setEditing] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const content = useMemo(() => getIslandLearning(island), [island]);
  const topic = content.topics.find((item) => item.id === topicId);
  const topicProgress = progress.topics ?? {};
  const done = content.topics.filter((item) => topicProgress[item.id]?.status === 'completed').length;
  const notes = noteRepository.load(roadmapId, island.id, topicId);
  const setTopicDone = (id, completed) => onProgress({ ...progress, topics: { ...topicProgress, [id]: { ...topicProgress[id], status: completed ? 'completed' : 'in_progress' } } });
  const tasks = progress.tasks ?? {};
  const saveNote = (event) => {
    event.preventDefault(); if (!draft.trim()) return;
    const now = new Date().toISOString();
    noteRepository.save({ id: editing ?? crypto.randomUUID(), roadmapId, islandId: island.id, topicId, content: draft.trim(), createdAt: now, updatedAt: now });
    setDraft(''); setEditing(null); onProgress({ ...progress, noteRevision: (progress.noteRevision ?? 0) + 1 });
  };
  return <>
    <button className="learning-backdrop" aria-label="Fechar conteúdo" onClick={onClose} />
    <aside className="learning-panel" role="dialog" aria-modal="true" aria-label={island.title}>
      <header className="learning-header"><div><span className="learning-kicker">{island.category}</span><h2>{island.title}</h2><p>{content.description}</p></div><button onClick={onClose} aria-label="Fechar">×</button></header>
      <div className="learning-body">
        <section className="learning-progress"><strong>{done} de {content.topics.length} tópicos concluídos</strong><progress value={done} max={Math.max(content.topics.length, 1)} /></section>
        {!topic ? <>
          <h3>Trilha de estudo</h3><nav className="learning-topic-list">{content.topics.map((item) => <button key={item.id} onClick={() => { setTopicId(item.id); setResult(null); setAnswers({}); }}><span><b>{item.title}</b><small>{item.description}</small></span><span>{topicProgress[item.id]?.status === 'completed' ? 'Concluído ✓' : 'Estudar →'}</span></button>)}</nav>
          <h3>Tarefas</h3>{content.tasks.length ? content.tasks.map((task) => <label className="learning-task" key={task.id}><input type="checkbox" checked={!!tasks[task.id]} onChange={(e) => onProgress({ ...progress, tasks: { ...tasks, [task.id]: e.target.checked } })} /><span><b>{task.title}</b>{task.description && <small>{task.description}</small>}</span></label>) : <p>Nenhuma tarefa nesta ilha.</p>}
          <Notes notes={notes} draft={draft} setDraft={setDraft} editing={editing} setEditing={setEditing} saveNote={saveNote} changed={() => onProgress({ ...progress, noteRevision: (progress.noteRevision ?? 0) + 1 })} />
        </> : <>
          <button className="learning-back" onClick={() => setTopicId(null)}>← Voltar aos tópicos</button><h3>{topic.title}</h3><p>{topic.description}</p>
          {topic.sections.map((section, index) => <article className="learning-section" key={`${section.title}-${index}`}><h4>{section.title}</h4><p>{section.content}</p></article>)}
          <References references={topic.references} />
          {topic.quiz && <section className="learning-quiz"><h4>Quiz rápido</h4>{topic.quiz.questions.map((question) => <fieldset key={question.id}><legend>{question.prompt}</legend>{question.options.map((option, index) => <label key={option}><input type="radio" name={question.id} checked={answers[question.id] === index} onChange={() => setAnswers({ ...answers, [question.id]: index })} />{option}</label>)}{result && <p>{answers[question.id] === question.correctIndex ? 'Correto. ' : 'Revise: '}{question.explanation}</p>}</fieldset>)}<button onClick={() => { const score = Math.round(topic.quiz.questions.filter((q) => answers[q.id] === q.correctIndex).length / topic.quiz.questions.length * 100); const passed = score >= (topic.quiz.passingScore ?? 70); setResult({ score, passed }); onProgress({ ...progress, topics: { ...topicProgress, [topic.id]: { ...topicProgress[topic.id], bestScore: Math.max(score, topicProgress[topic.id]?.bestScore ?? 0), quizPassed: !!topicProgress[topic.id]?.quizPassed || passed, quizAttempts: [...(topicProgress[topic.id]?.quizAttempts ?? []), { score, at: new Date().toISOString() }] } } }); }}>Enviar respostas</button>{result && <strong>Resultado: {result.score}% — {result.passed ? 'aprovado' : 'tente novamente'}</strong>}</section>}
          <button className="learning-complete" onClick={() => setTopicDone(topic.id, topicProgress[topic.id]?.status !== 'completed')}>{topicProgress[topic.id]?.status === 'completed' ? 'Marcar como não concluído' : 'Marcar tópico como concluído'}</button>
          <Notes notes={notes} draft={draft} setDraft={setDraft} editing={editing} setEditing={setEditing} saveNote={saveNote} changed={() => onProgress({ ...progress, noteRevision: (progress.noteRevision ?? 0) + 1 })} />
        </>}
      </div>
    </aside>
  </>;
}
function References({ references = [] }) { return <section><h4>Referências</h4>{references.length ? references.map((ref) => <a className="learning-reference" key={ref.url} href={ref.url} target="_blank" rel="noopener noreferrer"><b>{ref.title}</b><small>{ref.type}{ref.description ? ` · ${ref.description}` : ''}</small></a>) : <p>Sem referências cadastradas.</p>}</section>; }
function Notes({ notes, draft, setDraft, editing, setEditing, saveNote, changed }) { return <section className="learning-notes"><h3>Anotações</h3>{notes.map((note) => <article key={note.id}><p>{note.content}</p><button onClick={() => { setEditing(note.id); setDraft(note.content); }}>Editar</button><button onClick={() => { noteRepository.remove(note.id); changed(); }}>Excluir</button></article>)}<form onSubmit={saveNote}><textarea value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Escreva uma anotação..." rows="3" /><button type="submit">{editing ? 'Salvar edição' : 'Adicionar anotação'}</button>{editing && <button type="button" onClick={() => { setEditing(null); setDraft(''); }}>Cancelar</button>}</form></section>; }
