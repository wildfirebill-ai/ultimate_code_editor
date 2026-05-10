import { create } from 'zustand';
import { Theme } from '@shared/types';

interface SettingsStore {
  theme: Theme;
  themes: Theme[];
  activeSidebarView: string;
  terminalVisible: boolean;
  terminalHeight: number;
  commandPaletteOpen: boolean;
  searchVisible: boolean;
  gitVisible: boolean;
  extensionsVisible: boolean;
  defaultWorkspacePath: string;

  setTheme: (id: string) => void;
  setActiveSidebarView: (view: string) => void;
  toggleTerminal: () => void;
  setTerminalHeight: (h: number) => void;
  setCommandPaletteOpen: (o: boolean) => void;
  toggleCommandPalette: () => void;
  setSearchVisible: (v: boolean) => void;
  setGitVisible: (v: boolean) => void;
  setExtensionsVisible: (v: boolean) => void;
  setDefaultWorkspacePath: (path: string) => void;
}

const darkTheme: Theme = {
  id: 'dark-modern',
  name: 'Dark Modern',
  type: 'dark',
  colors: {
    bg: '#0d1117',
    sidebarBg: '#161b22',
    titleBg: '#0d1117',
    tabBg: '#0d1117',
    tabActiveBg: '#1a1f2e',
    tabHoverBg: '#1c2333',
    line: '#21262d',
    text: '#e6edf3',
    textDim: '#8b949e',
    accent: '#58a6ff',
    accent2: '#3b82f6',
    green: '#3fb950',
    orange: '#d29922',
    red: '#f85149',
    purple: '#bc8cff',
    cyan: '#39d2c0',
    pink: '#f778ba',
    border: '#30363d',
    hoverBg: '#1c2333',
    activeBg: '#1f2937',
    inputBg: '#0d1117',
    scrollbar: '#30363d',
    terminalBg: '#0a0e14',
    chatBg: '#0d1117',
    chatUserBg: '#1a1f2e',
    chatBotBg: '#161b22',
    lineHighlight: '#1a1f2e',
    selectionBg: '#264f78',
    minimapBg: '#0d1117',
  },
};

const lightTheme: Theme = {
  id: 'light-modern',
  name: 'Light Modern',
  type: 'light',
  colors: {
    bg: '#ffffff',
    sidebarBg: '#f3f4f6',
    titleBg: '#ffffff',
    tabBg: '#ffffff',
    tabActiveBg: '#ffffff',
    tabHoverBg: '#f3f4f6',
    line: '#e5e7eb',
    text: '#1f2937',
    textDim: '#6b7280',
    accent: '#2563eb',
    accent2: '#3b82f6',
    green: '#059669',
    orange: '#d97706',
    red: '#dc2626',
    purple: '#7c3aed',
    cyan: '#0891b2',
    pink: '#db2777',
    border: '#d1d5db',
    hoverBg: '#f3f4f6',
    activeBg: '#e5e7eb',
    inputBg: '#ffffff',
    scrollbar: '#d1d5db',
    terminalBg: '#f9fafb',
    chatBg: '#ffffff',
    chatUserBg: '#f3f4f6',
    chatBotBg: '#f9fafb',
    lineHighlight: '#f0f9ff',
    selectionBg: '#bfdbfe',
    minimapBg: '#ffffff',
  },
};

const highContrast: Theme = {
  id: 'high-contrast',
  name: 'High Contrast',
  type: 'high-contrast',
  colors: {
    bg: '#000000',
    sidebarBg: '#0a0a0a',
    titleBg: '#000000',
    tabBg: '#000000',
    tabActiveBg: '#1a1a1a',
    tabHoverBg: '#1a1a1a',
    line: '#333333',
    text: '#ffffff',
    textDim: '#cccccc',
    accent: '#00ff00',
    accent2: '#00ccff',
    green: '#00ff00',
    orange: '#ffff00',
    red: '#ff0000',
    purple: '#ff00ff',
    cyan: '#00ffff',
    pink: '#ff69b4',
    border: '#ffffff',
    hoverBg: '#1a1a1a',
    activeBg: '#333333',
    inputBg: '#000000',
    scrollbar: '#666666',
    terminalBg: '#000000',
    chatBg: '#000000',
    chatUserBg: '#1a1a1a',
    chatBotBg: '#0a0a0a',
    lineHighlight: '#1a1a1a',
    selectionBg: '#333333',
    minimapBg: '#000000',
  },
};

export const useSettingsStore = create<SettingsStore>()((set, get) => ({
  theme: darkTheme,
  themes: [darkTheme, lightTheme, highContrast],
  activeSidebarView: 'files',
  terminalVisible: false,
  terminalHeight: 200,
  commandPaletteOpen: false,
  searchVisible: false,
  gitVisible: false,
  extensionsVisible: false,
  defaultWorkspacePath: '',

  setTheme: (id) => {
    const theme = get().themes.find((t) => t.id === id);
    if (theme) set({ theme });
  },

  setActiveSidebarView: (view) => set({ activeSidebarView: view }),

  toggleTerminal: () => set((s) => ({ terminalVisible: !s.terminalVisible })),

  setTerminalHeight: (h) => set({ terminalHeight: Math.max(100, Math.min(600, h)) }),

  setCommandPaletteOpen: (o) => set({ commandPaletteOpen: o }),

  toggleCommandPalette: () => set((s) => ({ commandPaletteOpen: !s.commandPaletteOpen })),

  setSearchVisible: (v) => set({ searchVisible: v }),

  setGitVisible: (v) => set({ gitVisible: v }),

  setExtensionsVisible: (v) => set({ extensionsVisible: v }),
  setDefaultWorkspacePath: (path) => set({ defaultWorkspacePath: path }),
}));

