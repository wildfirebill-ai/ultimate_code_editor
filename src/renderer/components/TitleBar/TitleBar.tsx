import React, { useState } from 'react';
import { Minus, Square, X, PanelLeft } from 'lucide-react';
import { useEditorStore } from '../../stores/editorStore';
import { useSettingsStore } from '../../stores/settingsStore';

export default function TitleBar() {
  const [maximized, setMaximized] = useState(false);
  const { tabs, activeTabId, sidebarVisible, toggleSidebar } = useEditorStore();
  useSettingsStore();

  const activeTab = tabs.find((t) => t.id === activeTabId);
  const filePath = activeTab?.path || null;

  const api = (window as any).electronAPI;

  const handleMinimize = () => api?.window?.minimize();
  const handleMaximize = () => {
    api?.window?.maximize();
    setMaximized((v) => !v);
  };
  const handleClose = () => api?.window?.close();

  return (
    <div className="title-bar">
      <div className="title-bar-controls">
        <button
          className="title-btn"
          onClick={toggleSidebar}
          title={sidebarVisible ? 'Collapse sidebar (Ctrl+B)' : 'Expand sidebar (Ctrl+B)'}
        >
          <PanelLeft size={16} />
        </button>
        <span className="title-bar-title">Ultimate Editor</span>
      </div>

      <div className="title-bar-drag">
        {filePath && <span className="title-bar-title" style={{ fontSize: 11 }}>{filePath}</span>}
      </div>

      <div className="title-bar-controls">
        <button className="title-btn" onClick={handleMinimize} title="Minimize (Ctrl+M)">
          <Minus size={14} />
        </button>
        <button className="title-btn" onClick={handleMaximize} title={maximized ? 'Restore (Ctrl+Shift+M)' : 'Maximize (Ctrl+Shift+M)'}>
          <Square size={12} />
        </button>
        <button className="title-btn close" onClick={handleClose} title="Close (Alt+F4)">
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
