import { createElement } from 'react';
import '@blocknote/core/fonts/inter.css';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/shadcn';
import '@blocknote/shadcn/style.css';

/**
 * Editor isolado: o conteúdo inicial é consumido ao montar. Ao trocar de nota,
 * o componente pai deve usar a identidade estável do documento como `key`.
 */
function BlockNoteEditor({ initialContent, onDocumentChange, readOnly = false }) {
  // Uma lista vazia usa o parágrafo inicial vazio padrão do BlockNote.
  const editor = useCreateBlockNote(
    Array.isArray(initialContent) && initialContent.length > 0
      ? { initialContent }
      : undefined,
  );

  return (
    <div className="farol-blocknote">
      {createElement(BlockNoteView, {
        editor,
        editable: !readOnly,
        theme: 'dark',
        onChange: (editorAtual) => onDocumentChange?.(editorAtual.document),
      })}
    </div>
  );
}

export default BlockNoteEditor;
