import React, { useCallback, useRef, useEffect, useState } from 'react';
import { X, PanelRight } from 'lucide-react';
import { useEditorStore } from '../../stores/editorStore';

const EXT_ICONS: Record<string, string> = {
  ts: '🟦',
  tsx: '⚛️',
  js: '🟨',
  jsx: '⚛️',
  py: '🐍',
  rs: '🦀',
  go: '🔷',
  java: '☕',
  rb: '💎',
  php: '🐘',
  css: '🎨',
  html: '🌐',
  json: '📋',
  md: '📝',
  yaml: '📄',
  toml: '⚙️',
};

const getFileIcon = (title: string): string => {
  const ext = title.split('.').pop()?.toLowerCase() || '';
  return EXT_ICONS[ext] || '📄';
};

interface ContextMenuState {
  x: number;
  y: number;
  tabId: string;
}

const TabBar: React.FC = () => {
  const tabs = useEditorStore((s) => s.tabs);
  const activeTabId = useEditorStore((s) => s.activeTabId);
  const setActiveTab = useEditorStore((s) => s.setActiveTab);
  const closeTab = useEditorStore((s) => s.closeTab);
  const closeAllTabs = useEditorStore((s) => s.closeAllTabs);
  const closeOtherTabs = useEditorStore((s) => s.closeOtherTabs);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  const handleContextMenu = useCallback((e: React.MouseEvent, tabId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, tabId });
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  useEffect(() => {
    const handler = () => closeContextMenu();
    window.addEventListener('click', handler);
    window.addEventListener('scroll', handler, true);
    return () => {
      window.removeEventListener('click', handler);
      window.removeEventListener('scroll', handler, true);
    };
  }, [closeContextMenu]);

  const handleMiddleClick = useCallback(
    (e: React.MouseEvent, tabId: string) => {
      if (e.button === 1) {
        e.preventDefault();
        closeTab(tabId);
      }
    },
    [closeTab]
  );

  const handleDoubleClick = useCallback(
    (tabId: string) => {
      closeTab(tabId);
    },
    [closeTab]
  );

  if (tabs.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        background: 'var(--sidebar-bg)',
        borderBottom: '1px solid var(--border)',
        position: 'relative',
      }}
    >
      <div
        ref={scrollRef}
        style={{
          display: 'flex',
          overflowX: 'auto',
          overflowY: 'hidden',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          flex: 1,
        }}
        className="tab-bar-scroll"
      >
        <style>{`.tab-bar-scroll::-webkit-scrollbar { display: none; }`}</style>
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              className={`tab${isActive ? ' active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              onMouseDown={(e) => handleMiddleClick(e, tab.id)}
              onDoubleClick={() => handleDoubleClick(tab.id)}
              onContextMenu={(e) => handleContextMenu(e, tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 10px',
                fontSize: 13,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                borderRight: '1px solid var(--border)',
                borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                background: isActive ? 'var(--bg)' : 'transparent',
                color: isActive ? 'var(--text)' : 'var(--text-dim)',
                userSelect: 'none',
                minWidth: 0,
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: 14, lineHeight: 1 }}>{getFileIcon(tab.title)}</span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 140 }}>
                {tab.title}
              </span>
              {tab.isDirty && (
                <span
                  className="tab-dirty"
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: 'var(--accent)',
                    flexShrink: 0,
                  }}
                />
              )}
              <button
                className="tab-close"
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.id);
                }}
                title="Close"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: isActive ? 'var(--text-dim)' : 'transparent',
                  padding: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 3,
                  width: 18,
                  height: 18,
                  flexShrink: 0,
                  marginLeft: 'auto',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--hover-bg)';
                  e.currentTarget.style.color = 'var(--text)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = isActive ? 'var(--text-dim)' : 'transparent';
                }}
              >
                <X size={12} />
              </button>
            </div>
          );
        })}
      </div>

      <button
        title="Show more tabs"
        style={{
          background: 'none',
          border: 'none',
          borderLeft: '1px solid var(--border)',
          cursor: 'pointer',
          color: 'var(--text-dim)',
          padding: '6px 8px',
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--hover-bg)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
      >
        <PanelRight size={14} />
      </button>

      {contextMenu && (
        <div
          style={{
            position: 'fixed',
            top: contextMenu.y,
            left: contextMenu.x,
            background: 'var(--sidebar-bg)',
            border: '1px solid var(--border)',
            borderRadius: 6,
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            padding: '4px 0',
            zIndex: 1000,
            minWidth: 160,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="context-menu-item"
            onClick={() => { closeTab(contextMenu.tabId); setContextMenu(null); }}
            style={{
              padding: '6px 16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 13,
              color: 'var(--text)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--hover-bg)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <X size={14} />
            Close
          </div>
          <div
            className="context-menu-item"
            onClick={() => { closeOtherTabs(contextMenu.tabId); setContextMenu(null); }}
            style={{
              padding: '6px 16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 13,
              color: 'var(--text)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--hover-bg)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <X size={14} />
            Close Others
          </div>
          <div
            className="context-menu-item"
            onClick={() => { closeAllTabs(); setContextMenu(null); }}
            style={{
              padding: '6px 16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 13,
              color: 'var(--text)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--hover-bg)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <X size={14} />
            Close All
          </div>
        </div>
      )}
    </div>
  );
};

export default TabBar;
