import React from 'react';
import { useSettingsStore } from '../../stores/settingsStore';
import { useEditorStore } from '../../stores/editorStore';
import FileExplorer from './FileExplorer';
import SearchPanel from './SearchPanel';
import GitPanel from './GitPanel';
import GitHubPanel from './GitHubPanel';
import FTPPanel from './FTPPanel';
import ExtensionsPanel from './ExtensionsPanel';
import OllamaSettings from './OllamaSettings';

const viewLabels: Record<string, string> = {
  files: 'Files',
  search: 'Search',
  git: 'Source Control',
  github: 'GitHub',
  ftp: 'FTP',
  extensions: 'Extensions',
  settings: 'Settings',
};

const Sidebar: React.FC = () => {
  const activeSidebarView = useSettingsStore((s) => s.activeSidebarView);
  const sidebarWidth = useEditorStore((s) => s.sidebarWidth);
  const setSidebarWidth = useEditorStore((s) => s.setSidebarWidth);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = sidebarWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientX - startX;
      setSidebarWidth(startWidth + delta);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const renderPanel = () => {
    switch (activeSidebarView) {
      case 'files':
        return <FileExplorer />;
      case 'search':
        return <SearchPanel />;
      case 'git':
        return <GitPanel />;
      case 'github':
        return <GitHubPanel />;
      case 'ftp':
        return <FTPPanel />;
      case 'extensions':
        return <ExtensionsPanel />;
      case 'settings':
        return <OllamaSettings />;
      default:
        return null;
    }
  };

  return (
    <div className="sidebar" style={{ width: sidebarWidth, height: '100%' }}>
      <div className="sidebar-header">
        {viewLabels[activeSidebarView] || activeSidebarView}
      </div>
      <div className="sidebar-body">
        {renderPanel()}
      </div>
      <div className="sidebar-resize-handle" onMouseDown={handleMouseDown} />
    </div>
  );
};

export default Sidebar;
