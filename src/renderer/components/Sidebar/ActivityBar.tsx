import React from 'react';
import { FolderTree, Search, GitBranch, Puzzle, Bot, Settings } from 'lucide-react';
import { useSettingsStore } from '../../stores/settingsStore';
import { useAIStore } from '../../stores/aiStore';

const ActivityBar: React.FC = () => {
  const activeSidebarView = useSettingsStore((s) => s.activeSidebarView);
  const setActiveSidebarView = useSettingsStore((s) => s.setActiveSidebarView);
  const isAgentOpen = useAIStore((s) => s.isAgentOpen);
  const toggleAgent = useAIStore((s) => s.toggleAgent);

  return (
    <div className="activity-bar">
      <div className="activity-top">
        <button
          className={`activity-btn${activeSidebarView === 'files' ? ' active' : ''}`}
          title="Files"
          onClick={() => setActiveSidebarView('files')}
        >
          <FolderTree size={20} />
        </button>
        <button
          className={`activity-btn${activeSidebarView === 'search' ? ' active' : ''}`}
          title="Search"
          onClick={() => setActiveSidebarView('search')}
        >
          <Search size={20} />
        </button>
        <button
          className={`activity-btn${activeSidebarView === 'git' ? ' active' : ''}`}
          title="Source Control"
          onClick={() => setActiveSidebarView('git')}
        >
          <GitBranch size={20} />
        </button>
        <button
          className={`activity-btn${activeSidebarView === 'extensions' ? ' active' : ''}`}
          title="Extensions"
          onClick={() => setActiveSidebarView('extensions')}
        >
          <Puzzle size={20} />
        </button>
      </div>
      <div className="activity-bottom">
        <button
          className={`activity-btn${isAgentOpen ? ' active' : ''}`}
          title="Agent Mode"
          onClick={toggleAgent}
        >
          <Bot size={20} />
        </button>
        <button
          className={`activity-btn${activeSidebarView === 'settings' ? ' active' : ''}`}
          title="Settings"
          onClick={() => setActiveSidebarView('settings')}
        >
          <Settings size={20} />
        </button>
      </div>
    </div>
  );
};

export default ActivityBar;
