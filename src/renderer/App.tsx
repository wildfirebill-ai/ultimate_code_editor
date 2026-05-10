import React, { useEffect, useCallback } from 'react';
import { useEditorStore } from './stores/editorStore';
import { useAIStore } from './stores/aiStore';
import { useSettingsStore } from './stores/settingsStore';
import TitleBar from './components/TitleBar/TitleBar';
import ActivityBar from './components/Sidebar/ActivityBar';
import Sidebar from './components/Sidebar/Sidebar';
import TabBar from './components/Editor/TabBar';
import EditorPane from './components/Editor/EditorPane';
import StatusBar from './components/StatusBar/StatusBar';
import TerminalPanel from './components/Terminal/TerminalPanel';
import AgentPanel from './components/Agent/AgentPanel';
import CommandPalette from './components/CommandPalette/CommandPalette';
import './styles/global.css';

export default function App() {
  const editor = useEditorStore();
  const ai = useAIStore();
  const settings = useSettingsStore();

  const handleOpenFile = useCallback(async () => {
    if (!window.electronAPI) return;
    const result = await window.electronAPI.fileSystem.openFileDialog();
    if (result && !result.canceled && result.filePaths.length > 0) {
      const filePath = result.filePaths[0];
      const data = await window.electronAPI.fileSystem.readFile(filePath);
      if (data.content !== undefined) {
        editor.openFile(filePath, data.content);
      }
    }
  }, [editor]);

  const handleOpenFolder = useCallback(async () => {
    if (!window.electronAPI) return;
    const result = await window.electronAPI.fileSystem.openFolderDialog(settings.defaultWorkspacePath || undefined);
    if (result && !result.canceled && result.filePaths.length > 0) {
      const folderPath = result.filePaths[0];
      const data = await window.electronAPI.fileSystem.readDirectory(folderPath);
      if (data.files) {
        editor.setWorkspace(folderPath, data.files);
      }
    }
  }, [editor, settings.defaultWorkspacePath]);

  const handleNewFile = useCallback(() => {
    editor.openFile(`untitled-${Date.now()}`, '');
  }, [editor]);

  const handleSave = useCallback(async (saveAs?: boolean) => {
    const tab = editor.tabs.find((t) => t.id === editor.activeTabId);
    if (!tab) return;
    let filePath = tab.path;
    if (saveAs || filePath.startsWith('untitled-')) {
      if (!window.electronAPI) return;
      const result = await window.electronAPI.fileSystem.showSaveDialog();
      if (result.canceled || !result.filePath) return;
      filePath = result.filePath;
    }
    if (!window.electronAPI) return;
    await window.electronAPI.fileSystem.writeFile(filePath, tab.content);
    if (filePath !== tab.path) {
      const title = filePath.split('\\').pop() || filePath.split('/').pop() || 'untitled';
      editor.updateTabPath(tab.id, filePath, title);
    }
  }, [editor]);

  useEffect(() => {
    ai.testOllamaConnection();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const api = window.electronAPI;
    if (!api) return;

    const handler = (_event: unknown, action: string) => {
      switch (action) {
        case 'open-file': handleOpenFile(); break;
        case 'open-folder': handleOpenFolder(); break;
        case 'new-file': handleNewFile(); break;
        case 'save': handleSave(); break;
        case 'save-as': handleSave(true); break;
        case 'toggle-sidebar': editor.toggleSidebar(); break;
        case 'toggle-terminal': settings.toggleTerminal(); break;
        case 'toggle-agent': ai.toggleAgent(); break;
        case 'command-palette': settings.toggleCommandPalette(); break;
      }
    };

    api.on('menu-action', handler);
    return () => {
      api.removeAllListeners('menu-action');
    };
  }, [handleOpenFile, handleOpenFolder, handleNewFile, handleSave, settings, ai]);

  return (
    <div className="app-container">
      <TitleBar />

      <div className="main-content">
        <ActivityBar />

        {editor.sidebarVisible && <Sidebar />}

        <div className="editor-area">
          {editor.tabs.length > 0 && <TabBar />}

          <div className="editor-container" style={{ flex: 1, overflow: 'hidden' }}>
            {editor.activeTabId && editor.tabs.length > 0 ? (
              <EditorPane />
            ) : (
              <div className="welcome-screen">
                <div className="welcome-cards">
                  <div className="welcome-card" onClick={handleOpenFile}>
                    <h4>Open File</h4>
                    <p>Open a file from your computer</p>
                  </div>
                  <div className="welcome-card" onClick={handleOpenFolder}>
                    <h4>Open Folder</h4>
                    <p>Open a project folder</p>
                  </div>
                  <div className="welcome-card" onClick={handleNewFile}>
                    <h4>New File</h4>
                    <p>Create a new empty file</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {settings.terminalVisible && (
            <div style={{ height: settings.terminalHeight, flexShrink: 0 }}>
              <TerminalPanel />
            </div>
          )}
        </div>

        {ai.isAgentOpen && (
          <div className="agent-panel-overlay" style={{ width: editor.agentPanelWidth }}>
            <div
              className="agent-resize-handle"
              onMouseDown={(e) => {
                e.preventDefault();
                const startX = e.clientX;
                const startWidth = editor.agentPanelWidth;
                const handleMouseMove = (me: MouseEvent) => {
                  const delta = startX - me.clientX;
                  editor.setAgentPanelWidth(startWidth + delta);
                };
                const handleMouseUp = () => {
                  document.removeEventListener('mousemove', handleMouseMove);
                  document.removeEventListener('mouseup', handleMouseUp);
                };
                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
              }}
            />
            <AgentPanel />
          </div>
        )}
      </div>

      <StatusBar />

      {settings.commandPaletteOpen && <CommandPalette />}
    </div>
  );
}
