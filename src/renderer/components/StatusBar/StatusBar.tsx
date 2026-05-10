import React from 'react';
import { GitBranch, Circle, Terminal, Keyboard, Palette, Brain } from 'lucide-react';
import { useEditorStore } from '../../stores/editorStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useAIStore } from '../../stores/aiStore';

export default function StatusBar() {
  const { tabs, activeTabId, workspacePath, vimMode, toggleVimMode, tabSize } = useEditorStore();
  const { toggleTerminal, theme, setTheme, themes } = useSettingsStore();
  const { isProcessing, selectedModel, setChatOpen } = useAIStore();

  const activeTab = tabs.find((t) => t.id === activeTabId);
  const folderName = workspacePath
    ? workspacePath.split('\\').pop()?.split('/').pop()
    : null;

  const cycleTabSize = () => {
    const sizes = [2, 4, 8];
    const idx = sizes.indexOf(tabSize);
    const next = sizes[(idx + 1) % sizes.length];
    useEditorStore.getState().setTabSize(next);
  };

  const cycleTheme = () => {
    const idx = themes.indexOf(theme);
    const next = themes[(idx + 1) % themes.length];
    setTheme(next.id);
  };

  return (
    <div className="status-bar">
      <div className="status-bar-left">
        <div className="status-item" title="Git branch: main">
          <GitBranch size={12} />
          <span>main</span>
        </div>
        <div className="status-item" title="0 errors, 0 warnings">
          <Circle size={12} className="green" />
          <span>0</span>
        </div>
        {folderName && (
          <div className="status-item" title={workspacePath!}>
            <span>{folderName}</span>
          </div>
        )}
      </div>

      <div className="status-bar-right">
        <div
          className="status-item"
          title={`AI Model: ${selectedModel}. Click to toggle chat`}
          onClick={() => setChatOpen(true)}
        >
          <Brain size={12} />
          <span>{selectedModel}</span>
        </div>
        {vimMode && (
          <div
            className="status-item"
            title="Vim mode enabled. Click to disable."
            onClick={toggleVimMode}
          >
            <Keyboard size={12} />
            <span>Vim</span>
          </div>
        )}
        <div className="status-item" title="Tab size" onClick={cycleTabSize}>
          <span>Spaces: {tabSize}</span>
        </div>
        <div className="status-item" title="Cycle theme" onClick={cycleTheme}>
          <Palette size={12} />
        </div>
        <div className="status-item" title="Toggle terminal" onClick={toggleTerminal}>
          <Terminal size={12} />
        </div>
        <div className="status-item" title="Encoding">
          <span>UTF-8</span>
        </div>
        <div className="status-item" title="Line ending">
          <span>LF</span>
        </div>
        {activeTab && (
          <>
            <div className="status-item" title={`Language: ${activeTab.language}`}>
              <span>{activeTab.language}</span>
            </div>
            <div className="status-item" title="Line 1, Column 1">
              <span>Ln 1, Col 1</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
