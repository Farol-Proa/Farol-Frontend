const PROGRESS_KEY = 'farol:learning:progress:v1';
const NOTES_KEY = 'farol:learning:notes:v1';

function read(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; } catch { return fallback; }
}
function write(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* A sessão continua funcional sem persistência local. */ }
}

export const progressRepository = {
  load: (roadmapId) => read(PROGRESS_KEY, {})[roadmapId] ?? {},
  save(roadmapId, progress) {
    const all = read(PROGRESS_KEY, {}); all[roadmapId] = progress; write(PROGRESS_KEY, all);
  },
};
export const noteRepository = {
  load: (roadmapId, islandId, topicId) => read(NOTES_KEY, []).filter((note) => note.roadmapId === roadmapId && note.islandId === islandId && (note.topicId ?? null) === (topicId ?? null)),
  save(note) {
    const all = read(NOTES_KEY, []); const index = all.findIndex((item) => item.id === note.id);
    if (index < 0) all.push(note); else all[index] = note;
    write(NOTES_KEY, all);
  },
  remove(id) { write(NOTES_KEY, read(NOTES_KEY, []).filter((note) => note.id !== id)); },
};
