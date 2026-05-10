import React, { useEffect, useRef, useState } from 'react';
import { X, Plus, Maximize2, Minimize2, Terminal } from 'lucide-react';
import { useSettingsStore } from '../../stores/settingsStore';

interface CommandEntry {
  type: 'input' | 'output';
  text: string;
}

const WELCOME_LINES = [
  'Windows PowerShell',
  'Copyright (C) Microsoft Corporation. All rights reserved.',
  '',
  'Install the latest PowerShell for new features and improvements: https://aka.ms/PSWindows',
  '',
];

export default function TerminalPanel() {
  const { terminalHeight, setTerminalHeight, toggleTerminal } = useSettingsStore();
  const [maximized, setMaximized] = useState(false);
  const [activeTab, setActiveTab] = useState('powershell');
  const [tabs, setTabs] = useState(['powershell', 'bash']);
  const [lines, setLines] = useState<CommandEntry[]>([]);
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const startHeight = useRef(0);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [lines]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const delta = startY.current - e.clientY;
      const newHeight = startHeight.current + delta;
      setTerminalHeight(newHeight);
    };
    const handleMouseUp = () => {
      isDragging.current = false;
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [setTerminalHeight]);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    startY.current = e.clientY;
    startHeight.current = terminalHeight;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    setLines((prev) => [...prev, { type: 'input', text: `PS C:\\Users\\user> ${trimmed}` }, { type: 'output', text: `    // Command executed: ${trimmed}` }]);
    setInput('');
  };

  const addTab = () => {
    const idx = tabs.length + 1;
    const name = `tab-${idx}`;
    setTabs((prev) => [...prev, name]);
    setActiveTab(name);
  };

  const toggleSize = () => {
    setMaximized((prev) => !prev);
    if (maximized) {
      setTerminalHeight(200);
    } else {
      setTerminalHeight(600);
    }
  };

  const currentHeight = maximized ? 600 : terminalHeight;

  return (
    <div className="terminal-panel" style={{ height: currentHeight, display: 'flex', flexDirection: 'column', backgroundColor: '#0a0e14', borderTop: '1px solid #21262d' }}>
      <div className="terminal-resize-handle" onMouseDown={handleMouseDown} style={{ height: 4, cursor: 'ns-resize', backgroundColor: '#21262d', flexShrink: 0 }} />
      <div className="terminal-header" style={{ display: 'flex', alignItems: 'center', height: 32, backgroundColor: '#161b22', borderBottom: '1px solid #21262d', padding: '0 8px', flexShrink: 0, gap: 4 }}>
        <Terminal size={14} color="#8b949e" style={{ marginRight: 4 }} />
        <span style={{ color: '#8b949e', fontSize: 11, fontWeight: 600, letterSpacing: '0.5px', marginRight: 8 }}>TERMINAL</span>
        {tabs.map((tab) => (
          <div
            key={tab}
            className="terminal-header-tab"
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '2px 10px',
              fontSize: 12,
              color: tab === activeTab ? '#e6edf3' : '#8b949e',
              backgroundColor: tab === activeTab ? '#0a0e14' : 'transparent',
              cursor: 'pointer',
              borderRadius: 3,
              borderBottom: tab === activeTab ? '1px solid #3fb950' : '1px solid transparent',
            }}
          >
            {tab}
          </div>
        ))}
        <div style={{ flex: 1 }} />
        <button onClick={addTab} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8b949e', padding: 2, display: 'flex', alignItems: 'center' }} title="New Terminal">
          <Plus size={14} />
        </button>
        <button onClick={toggleSize} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8b949e', padding: 2, display: 'flex', alignItems: 'center' }} title={maximized ? 'Minimize' : 'Maximize'}>
          {maximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        </button>
        <button onClick={toggleTerminal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8b949e', padding: 2, display: 'flex', alignItems: 'center' }} title="Close Terminal">
          <X size={14} />
        </button>
      </div>
      <div
        ref={bodyRef}
        className="terminal-body"
        style={{
          flex: 1,
          backgroundColor: '#0a0e14',
          color: '#3fb950',
          fontFamily: '"Cascadia Code", "Fira Code", Consolas, "Courier New", monospace',
          fontSize: 13,
          padding: '8px 12px',
          overflowY: 'auto',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
          lineHeight: '1.5',
        }}
      >
        {WELCOME_LINES.map((line, i) => (
          <div key={`welcome-${i}`} style={{ color: i === 0 ? '#e6edf3' : '#3fb950' }}>{line}</div>
        ))}
        {lines.map((entry, i) => (
          <div
            key={i}
            style={{
              color: entry.type === 'input' ? '#e6edf3' : '#8b949e',
            }}
          >
            {entry.text}
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', color: '#e6edf3' }}>
          <span style={{ color: '#3fb950', marginRight: 0 }}>PS C:\Users\user&gt;</span>
          <form onSubmit={handleSubmit} style={{ display: 'inline-flex', flex: 1, margin: 0, padding: 0 }}>
            <input
              ref={inputRef}
              autoFocus
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#e6edf3',
                fontFamily: '"Cascadia Code", "Fira Code", Consolas, "Courier New", monospace',
                fontSize: 13,
                caretColor: '#3fb950',
                padding: 0,
                margin: 0,
              }}
            />
          </form>
        </div>
      </div>
    </div>
  );
}
