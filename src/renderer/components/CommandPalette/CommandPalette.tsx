import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, File, FolderOpen, Save, Terminal, Bot, Sidebar, Minimize2, Type, WrapText, Keyboard, PanelRight, GitBranch, Palette, X } from 'lucide-react';
import { useSettingsStore } from '../../stores/settingsStore';
import { useEditorStore } from '../../stores/editorStore';
import { useAIStore } from '../../stores/aiStore';

const commands = [
  { icon: FolderOpen, label: 'Open File', shortcut: 'Ctrl+O', action: () => {} },
  { icon: FolderOpen, label: 'Open Folder', shortcut: 'Ctrl+K Ctrl+O', action: () => {} },
  { icon: Save, label: 'Save', shortcut: 'Ctrl+S', action: () => {} },
  { icon: Sidebar, label: 'Toggle Sidebar', shortcut: 'Ctrl+B', action: ({ toggleSidebar }) => toggleSidebar() },
  { icon: Terminal, label: 'Toggle Terminal', shortcut: 'Ctrl+`', action: ({ toggleTerminal }) => toggleTerminal() },
  { icon: Bot, label: 'Toggle Agent Mode', shortcut: 'Ctrl+Shift+I', action: ({ toggleAgent }) => toggleAgent() },
  { icon: Minimize2, label: 'Toggle Minimap', shortcut: 'Alt+M', action: ({ toggleMinimap }) => toggleMinimap() },
  { icon: WrapText, label: 'Toggle Word Wrap', shortcut: 'Alt+Z', action: ({ toggleWordWrap }) => toggleWordWrap() },
  { icon: Keyboard, label: 'Toggle Vim Mode', shortcut: 'Alt+V', action: ({ toggleVimMode }) => toggleVimMode() },
  { icon: PanelRight, label: 'Toggle Breadcrumbs', shortcut: 'Alt+B', action: ({ toggleBreadcrumbs }) => toggleBreadcrumbs() },
  { icon: X, label: 'Close All Tabs', shortcut: 'Ctrl+Shift+W', action: ({ closeAllTabs }) => closeAllTabs() },
  { icon: Palette, label: 'Change Theme', shortcut: 'Ctrl+K Ctrl+T', action: ({ setTheme, themes }) => {
    const current = themes.indexOf(document.documentElement.getAttribute('data-theme') || 'dark');
    setTheme(themes[(current + 1) % themes.length]);
  }},
  { icon: File, label: 'View Files', shortcut: '', action: ({ setActiveSidebarView }) => setActiveSidebarView('files') },
  { icon: Search, label: 'View Search', shortcut: '', action: ({ setActiveSidebarView }) => setActiveSidebarView('search') },
  { icon: GitBranch, label: 'View Git', shortcut: '', action: ({ setActiveSidebarView }) => setActiveSidebarView('git') },
  { icon: Search, label: 'View Extensions', shortcut: '', action: ({ setActiveSidebarView }) => setActiveSidebarView('extensions') },
  { icon: Type, label: 'Increase Font Size', shortcut: 'Ctrl+=', action: ({ setFontSize }) => setFontSize(1) },
  { icon: Type, label: 'Decrease Font Size', shortcut: 'Ctrl+-', action: ({ setFontSize }) => setFontSize(-1) },
];

export default function CommandPalette() {
  const commandPaletteOpen = useSettingsStore((s) => s.commandPaletteOpen);
  const setCommandPaletteOpen = useSettingsStore((s) => s.setCommandPaletteOpen);
  const toggleSidebar = useEditorStore((s) => s.toggleSidebar);
  const toggleMinimap = useEditorStore((s) => s.toggleMinimap);
  const toggleVimMode = useEditorStore((s) => s.toggleVimMode);
  const toggleWordWrap = useEditorStore((s) => s.toggleWordWrap);
  const setFontSize = useEditorStore((s) => s.setFontSize);
  const closeAllTabs = useEditorStore((s) => s.closeAllTabs);
  const toggleBreadcrumbs = useEditorStore((s) => s.toggleBreadcrumbs);
  const toggleAgent = useAIStore((s) => s.toggleAgent);
  const toggleTerminal = useSettingsStore((s) => s.toggleTerminal);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const themes = useSettingsStore((s) => s.themes);
  const setActiveSidebarView = useSettingsStore((s) => s.setActiveSidebarView);

  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const filtered = commands.filter((c) =>
    c.label.toLowerCase().includes(search.toLowerCase())
  );

  const handleClose = useCallback(() => {
    setCommandPaletteOpen(false);
    setSearch('');
  }, [setCommandPaletteOpen]);

  const execute = useCallback((cmd) => {
    cmd.action({ toggleSidebar, toggleMinimap, toggleVimMode, toggleWordWrap, setFontSize, closeAllTabs, toggleBreadcrumbs, toggleAgent, toggleTerminal, setTheme, themes, setActiveSidebarView });
    handleClose();
  }, [toggleSidebar, toggleMinimap, toggleVimMode, toggleWordWrap, setFontSize, closeAllTabs, toggleBreadcrumbs, toggleAgent, toggleTerminal, setTheme, themes, setActiveSidebarView, handleClose]);

  useEffect(() => {
    if (commandPaletteOpen) {
      setSearch('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [commandPaletteOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  useEffect(() => {
    const el = listRef.current?.children?.[selectedIndex];
    if (el) el.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  useEffect(() => {
    if (!commandPaletteOpen) return;
    const handler = (e) => {
      if (e.key === 'Escape') {
        handleClose();
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
        return;
      }
      if (e.key === 'Enter' && filtered[selectedIndex]) {
        e.preventDefault();
        execute(filtered[selectedIndex]);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [commandPaletteOpen, filtered, selectedIndex, handleClose, execute]);

  if (!commandPaletteOpen) return null;

  return (
    <div className="command-palette-overlay" onClick={handleClose}>
      <div className="command-palette" onClick={(e) => e.stopPropagation()}>
        <div className="command-palette-input">
          <Search size={16} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="command-palette-list" ref={listRef}>
          {filtered.length === 0 && (
            <div className="command-palette-item disabled">No matching commands</div>
          )}
          {filtered.map((cmd, i) => {
            const Icon = cmd.icon;
            return (
              <div
                key={cmd.label}
                className={`command-palette-item${i === selectedIndex ? ' selected' : ''}`}
                onClick={() => execute(cmd)}
                onMouseEnter={() => setSelectedIndex(i)}
              >
                <Icon size={16} />
                <span>{cmd.label}</span>
                {cmd.shortcut && <kbd>{cmd.shortcut}</kbd>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
