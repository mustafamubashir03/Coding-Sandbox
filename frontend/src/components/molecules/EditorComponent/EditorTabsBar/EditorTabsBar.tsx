import { useParams } from 'react-router-dom';

import EditorButton from '../../../atoms/EditorButton/EditorButton';
import React from 'react';
import { useActiveFileTabStore } from '../../../../store/activeFileTabStore';
import { useEditorSocketStore } from '../../../../store/editorSocketStore';

const EditorTabsBar = () => {
  const { openFiles, activeFileTab, closeFile } = useActiveFileTabStore();
  const { editorSocket } = useEditorSocketStore();
  const { projectId } = useParams();

  const handleTabClick = (path: string) => {
    if (activeFileTab?.path !== path) {
      editorSocket?.emit('readFile', {
        projectId,
        pathToFileFolder: path,
      });
    }
  };

  const handleClose = (e: React.MouseEvent, path: string) => {
    e.stopPropagation();
    closeFile(path);
  };

  return (
    <div
      style={{
        display: 'flex',
        gap: '2px',
        background: 'rgba(15,17,26,0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '0 8px',
        overflowX: 'auto',
      }}
    >
      {openFiles.map((file) => (
        <EditorButton
          key={file.path}
          active={activeFileTab?.path === file.path}
          filename={file.filename}
          onClick={() => handleTabClick(file.path)}
          onClose={(e) => handleClose(e, file.path)}
        />
      ))}
    </div>
  );
};

export default EditorTabsBar;
