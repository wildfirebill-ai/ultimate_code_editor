import { create } from 'zustand';
import { Tab, FileNode } from '@shared/types';

interface EditorStore {
  tabs: Tab[];
  activeTabId: string | null;
  workspacePath: string | null;
  fileTree: FileNode[];
  selectedFile: string | null;
  showMinimap: boolean;
  showBreadcrumbs: boolean;
  fontSize: number;
  tabSize: number;
  wordWrap: boolean;
  vimMode: boolean;
  sidebarWidth: number;
  sidebarVisible: boolean;
  agentPanelWidth: number;

  openFile: (path: string, content: string) => void;
  updateTabPath: (id: string, path: string, title: string) => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  updateTabContent: (id: string, content: string) => void;
  markTabClean: (id: string) => void;
  setWorkspace: (path: string | null, tree: FileNode[]) => void;
  setFileTree: (tree: FileNode[]) => void;
  setSelectedFile: (path: string | null) => void;
  toggleMinimap: () => void;
  toggleBreadcrumbs: () => void;
  setFontSize: (size: number) => void;
  setTabSize: (size: number) => void;
  toggleWordWrap: () => void;
  toggleVimMode: () => void;
  setSidebarWidth: (width: number) => void;
  toggleSidebar: () => void;
  setAgentPanelWidth: (width: number) => void;
  closeAllTabs: () => void;
  closeOtherTabs: (id: string) => void;
}

export const useEditorStore = create<EditorStore>()((set, get) => ({
  tabs: [],
  activeTabId: null,
  workspacePath: null,
  fileTree: [],
  selectedFile: null,
  showMinimap: true,
  showBreadcrumbs: true,
  fontSize: 14,
  tabSize: 2,
  wordWrap: false,
  vimMode: false,
  sidebarWidth: 260,
  sidebarVisible: true,
  agentPanelWidth: 380,

  openFile: (path, content) => {
    const state = get();
    const existing = state.tabs.find((t) => t.path === path);
    if (existing) {
      set({ activeTabId: existing.id });
      return;
    }

    const ext = path.split('.').pop() || '';
    const langMap: Record<string, string> = {
      js: 'javascript', ts: 'typescript', jsx: 'javascript', tsx: 'typescript',
      py: 'python', rs: 'rust', go: 'go', java: 'java', c: 'c', cpp: 'cpp',
      cs: 'csharp', rb: 'ruby', php: 'php', swift: 'swift', kt: 'kotlin',
      html: 'html', css: 'css', scss: 'scss', less: 'less', json: 'json',
      xml: 'xml', yaml: 'yaml', yml: 'yaml', toml: 'toml', md: 'markdown',
      sql: 'sql', sh: 'shell', bat: 'bat', ps1: 'powershell',
      r: 'r', dockerfile: 'dockerfile', vue: 'html', svelte: 'html',
      graphql: 'graphql', svg: 'xml', txt: 'plaintext',
    };

    const id = `tab-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const newTab: Tab = {
      id,
      title: path.split('\\').pop() || path.split('/').pop() || 'untitled',
      path,
      isDirty: false,
      language: langMap[ext] || 'plaintext',
      content,
      originalContent: content,
    };

    set({ tabs: [...state.tabs, newTab], activeTabId: id });
  },

  updateTabPath: (id, path, title) => {
    const state = get();
    set({
      tabs: state.tabs.map((t) =>
        t.id === id ? { ...t, path, title } : t
      ),
    });
  },

  closeTab: (id) => {
    const state = get();
    const idx = state.tabs.findIndex((t) => t.id === id);
    const newTabs = state.tabs.filter((t) => t.id !== id);
    let newActive = state.activeTabId;
    if (state.activeTabId === id) {
      if (newTabs.length > 0) {
        newActive = newTabs[Math.min(idx, newTabs.length - 1)].id;
      } else {
        newActive = null;
      }
    }
    set({ tabs: newTabs, activeTabId: newActive });
  },

  setActiveTab: (id) => {
    set({ activeTabId: id });
  },

  updateTabContent: (id, content) => {
    const state = get();
    set({
      tabs: state.tabs.map((t) =>
        t.id === id ? { ...t, content, isDirty: content !== t.originalContent } : t
      ),
    });
  },

  markTabClean: (id) => {
    const state = get();
    set({
      tabs: state.tabs.map((t) =>
        t.id === id ? { ...t, isDirty: false, originalContent: t.content } : t
      ),
    });
  },

  setWorkspace: (path, tree) => {
    set({ workspacePath: path, fileTree: tree });
  },

  setFileTree: (tree) => set({ fileTree: tree }),

  setSelectedFile: (path) => set({ selectedFile: path }),

  toggleMinimap: () => set((s) => ({ showMinimap: !s.showMinimap })),

  toggleBreadcrumbs: () => set((s) => ({ showBreadcrumbs: !s.showBreadcrumbs })),

  setFontSize: (size) => set({ fontSize: Math.max(10, Math.min(40, size)) }),

  setTabSize: (size) => set({ tabSize: size }),

  toggleWordWrap: () => set((s) => ({ wordWrap: !s.wordWrap })),

  toggleVimMode: () => set((s) => ({ vimMode: !s.vimMode })),

  setSidebarWidth: (width) => set({ sidebarWidth: Math.max(180, Math.min(500, width)) }),

  toggleSidebar: () => set((s) => ({ sidebarVisible: !s.sidebarVisible })),

  setAgentPanelWidth: (width) => set({ agentPanelWidth: Math.max(280, Math.min(700, width)) }),

  closeAllTabs: () => set({ tabs: [], activeTabId: null }),

  closeOtherTabs: (id) => {
    const state = get();
    const tab = state.tabs.find((t) => t.id === id);
    set({ tabs: tab ? [tab] : [], activeTabId: id });
  },
}));
