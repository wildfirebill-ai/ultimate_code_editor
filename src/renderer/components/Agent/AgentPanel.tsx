import React, { useState, useRef, useEffect } from 'react';
import { Bot, Play, Square, Trash2, FileText, Terminal, Search, CheckCircle2, Loader2, AlertCircle, Brain, Pencil, ListTodo, Wrench, Bug, SearchCode, Plus, Save, X, Edit3, ChevronDown, Copy, RefreshCw, BookOpen, Code, GitPullRequest } from 'lucide-react';
import { useAIStore, AGENT_SYSTEM_PROMPTS, TOOL_INSTRUCTIONS, BUILTIN_PROMPT_IDS } from '../../stores/aiStore';
import { useEditorStore } from '../../stores/editorStore';
import { AgentAction } from '@shared/types';

const actionIcons: Record<string, React.ReactNode> = {
  read: <FileText size={14} />,
  write: <Pencil size={14} />,
  command: <Terminal size={14} />,
  think: <Brain size={14} />,
  search: <Search size={14} />,
  error: <AlertCircle size={14} />,
  success: <CheckCircle2 size={14} />,
};

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  running: 'Running',
  completed: 'Completed',
  failed: 'Failed',
};

function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

interface ActionCardProps {
  action: {
    id: string;
    type: string;
    description: string;
    content?: string;
    status: string;
    timestamp: number;
  };
}

function ActionCard({ action }: ActionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const hasContent = !!action.content;

  return (
    <div
      className={`agent-action ${action.status}`}
      onClick={() => hasContent && setExpanded(!expanded)}
      style={{ cursor: hasContent ? 'pointer' : 'default' }}
    >
      <div className="action-header">
        <span className="action-icon">{actionIcons[action.type] || <Bot size={14} />}</span>
        <span className="action-desc">{action.description}</span>
        <span className="action-time">{formatTime(action.timestamp)}</span>
        <span className={`action-status action-status-${action.status}`}>
          {action.status === 'running' ? <Loader2 size={12} className="spin" /> : null}
          {statusLabels[action.status]}
        </span>
      </div>
      {hasContent && expanded && (
        <div className="action-content">{action.content}</div>
      )}
    </div>
  );
}

export default function AgentPanel() {
  const {
    agentActive,
    agentMessages,
    agentActions,
    addAgentMessage,
    clearAgentMessages,
    addAgentAction,
    updateAgentAction,
    setAgentActive,
    clearAgentActions,
    sendAgentTask,
    sendMessages,
    agentMode,
    setAgentMode,
    customPrompts,
    addCustomPrompt,
    updateCustomPrompt,
    deleteCustomPrompt,
    ollama,
    apiConfig,
    updateOllama,
    updateApiConfig,
  } = useAIStore();
  const { activeTabId, tabs, workspacePath } = useEditorStore();

  const [input, setInput] = useState('');
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showPromptEditor, setShowPromptEditor] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<{ id: string; name: string; content: string } | null>(null);
  const [newPromptName, setNewPromptName] = useState('');
  const [newPromptContent, setNewPromptContent] = useState('');
  const modelSelectorRef = useRef<HTMLDivElement>(null);
  const actionsEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    actionsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [agentActions]);

  useEffect(() => {
    if (!showModelDropdown) return;
    const handler = (e: MouseEvent) => {
      if (modelSelectorRef.current && !modelSelectorRef.current.contains(e.target as Node)) {
        setShowModelDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showModelDropdown]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 80)}px`;
    }
  }, [input]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  function parseToolActions(response: string, baseTime: number): { type: string; description: string; content: string }[] {
    const tools: { type: string; description: string; content: string }[] = [];
    const blockRegex = /```(\w*)\n([\s\S]*?)```/g;
    let match;

    while ((match = blockRegex.exec(response)) !== null) {
      const lang = match[1].toLowerCase();
      const code = match[2].trim();
      if (!code) continue;

      const firstLine = code.split('\n')[0].trim();

      if (['bash', 'sh', 'shell', 'cmd', 'powershell', 'zsh'].includes(lang)) {
        const cmdDesc = firstLine.length > 60 ? firstLine.slice(0, 60) + '...' : firstLine;
        tools.push({ type: 'command', description: cmdDesc || 'Run command', content: code });
      } else if (firstLine.startsWith('//') || firstLine.startsWith('#')) {
        const filePath = firstLine.replace(/^\/\/\s*/, '').replace(/^#\s*/, '').trim();
        tools.push({ type: 'write', description: filePath || 'Write file', content: code });
      } else if (lang) {
        const codeDesc = code.split('\n').slice(0, 2).join(' ').slice(0, 60);
        tools.push({ type: 'read', description: codeDesc || 'Code snippet', content: code });
      }
    }

    return tools;
  }

  const resolveAgentPath = (desc: string): string => {
    if (desc.startsWith('/') || desc.startsWith('\\')) return desc;
    const wPath = workspacePath || '';
    if (!wPath) return desc;
    const sep = wPath.endsWith('/') || wPath.endsWith('\\') ? '' : '/';
    return `${wPath}${sep}${desc}`;
  };

  const executeToolAction = async (tool: { type: string; description: string; content?: string }): Promise<string> => {
    if (tool.type === 'write' && tool.content && window.electronAPI?.fileSystem?.writeFile) {
      const filePath = resolveAgentPath(tool.description);
      const parentDir = filePath.replace(/[/\\][^/\\]*$/, '');
      await window.electronAPI.fileSystem.createDirectory(parentDir).catch(() => {});
      await window.electronAPI.fileSystem.writeFile(filePath, tool.content);
      return `Written to ${filePath}`;
    }
    if (tool.type === 'read' && window.electronAPI?.fileSystem?.readFile) {
      const filePath = resolveAgentPath(tool.description);
      const result = await window.electronAPI.fileSystem.readFile(filePath);
      if (result.error) return `Error: ${result.error}`;
      return result.content || '(empty)';
    }
    if (tool.type === 'command' && window.electronAPI?.shell?.runCommand) {
      const cmdText = tool.content || tool.description;
      const result: any = await window.electronAPI.shell.runCommand(cmdText, workspacePath || undefined);
      return `Exit code: ${result.exitCode}\nStdout:\n${result.stdout || '(none)'}\nStderr:\n${result.stderr || '(none)'}`;
    }
    return `Tool ${tool.type} completed`;
  };

  const runAgentTask = async (task: string) => {
    setRunning(true);
    setAgentActive(true);
    setError('');

    abortRef.current?.abort();
    abortRef.current = new AbortController();
    const signal = abortRef.current.signal;

    addAgentMessage({
      id: `agent-msg-${Date.now()}`,
      role: 'user',
      content: task,
      timestamp: Date.now(),
    });

    const store = useAIStore.getState();
    const builtin = AGENT_SYSTEM_PROMPTS[store.agentMode];
    const custom = store.customPrompts.find((p) => p.id === store.agentMode);
    const systemMsg = (custom ? custom.content : (builtin || AGENT_SYSTEM_PROMPTS.plan)) + '\n\n' + TOOL_INSTRUCTIONS;

    const messages: { role: string; content: string }[] = [
      { role: 'system', content: systemMsg },
      { role: 'user', content: task },
    ];

    try {
      const response = await sendMessages(messages, signal);
      const toolActions = parseToolActions(response, Date.now());

      for (let i = 0; i < toolActions.length; i++) {
        const tool = toolActions[i];
        const actionId = `action-${Date.now()}-${i}`;

        addAgentAction({
          id: actionId,
          type: tool.type as AgentAction['type'],
          description: tool.description,
          status: 'running',
          timestamp: Date.now(),
          content: tool.content,
        });

        try {
          await executeToolAction(tool);
          updateAgentAction(actionId, { status: 'completed' });
        } catch (err: any) {
          updateAgentAction(actionId, { status: 'failed' });
        }
      }

      addAgentMessage({
        id: `agent-msg-${Date.now()}-r`,
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      });
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      setError(err.message || 'Agent request failed');
    } finally {
      setAgentActive(false);
      setRunning(false);
    }
  };

  const handleGo = () => {
    const text = input.trim();
    if (!text || running) return;
    setInput('');
    runAgentTask(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGo();
    }
  };

  const handleStop = () => {
    abortRef.current?.abort();
    setAgentActive(false);
    setRunning(false);
  };

  return (
    <div className="agent-panel">
      <div className="agent-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3>
            <Bot size={18} />
            Agent Mode
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              className="agent-header-btn"
              onClick={running || agentActive ? handleStop : () => { if (input.trim()) handleGo(); }}
              title={running || agentActive ? 'Stop' : 'Start'}
              style={{ color: running || agentActive ? 'var(--red)' : 'var(--green)' }}
            >
              {running || agentActive ? <Square size={16} /> : <Play size={16} />}
            </button>
            <button
              className="agent-header-btn"
              onClick={clearAgentActions}
              title="Clear history"
              style={{ color: 'var(--text-dim)' }}
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
        <div className="agent-status">
          <span
            style={{
              display: 'inline-block',
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: agentActive ? 'var(--green)' : 'var(--text-dim)',
              marginRight: 6,
              animation: agentActive ? 'pulse 1.5s ease-in-out infinite' : 'none',
            }}
          />
          {agentActive ? 'Active' : 'Idle'}
        </div>

        <div style={{ padding: '4px 12px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
          <span style={{ color: 'var(--text-dim)' }}>Model:</span>
          <div className="model-selector" ref={modelSelectorRef}>
            <button className="model-selector-btn" onClick={() => setShowModelDropdown(!showModelDropdown)}>
              {ollama.enabled ? ollama.model : apiConfig.model || 'Select model'}
              <ChevronDown size={12} />
            </button>
            {showModelDropdown && (
              <div className="model-dropdown" style={{ right: 'auto', left: 0 }}>
                {ollama.enabled ? (
                  ollama.availableModels.map((m) => (
                    <div
                      key={m}
                      className={`model-dropdown-item${ollama.model === m ? ' active' : ''}`}
                      onClick={() => { updateOllama({ model: m }); setShowModelDropdown(false); }}
                    >{m}</div>
                  ))
                ) : (
                  <div style={{ padding: '6px 8px' }}>
                    <input
                      style={{ width: '100%', padding: '4px 6px', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 3, color: 'var(--text)', fontSize: 11, outline: 'none' }}
                      value={apiConfig.model}
                      onChange={(e) => updateApiConfig({ model: e.target.value })}
                      placeholder="Enter model name"
                      autoFocus
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div style={{ padding: '6px 12px', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', gap: 2 }}>
            {BUILTIN_PROMPT_IDS.map((mode) => {
              const icons: Record<string, React.ReactNode> = {
                plan: <ListTodo size={12} />,
                build: <Wrench size={12} />,
                debug: <Bug size={12} />,
                analyze: <SearchCode size={12} />,
                refactor: <RefreshCw size={12} />,
                review: <Code size={12} />,
                document: <BookOpen size={12} />,
                test: <CheckCircle2 size={12} />,
                search: <GitPullRequest size={12} />,
              };
              const labels: Record<string, string> = { plan: 'Plan', build: 'Build', debug: 'Debug', analyze: 'Analyze', refactor: 'Refactor', review: 'Review', document: 'Docs', test: 'Test', search: 'Search' };
              return (
                <button
                  key={mode}
                  onClick={() => setAgentMode(mode)}
                  style={{
                    flex: 1, padding: '4px 0', fontSize: 10, fontWeight: agentMode === mode ? 600 : 400,
                    borderRadius: 4, cursor: 'pointer', border: 'none',
                    background: agentMode === mode ? 'var(--accent)' : 'transparent',
                    color: agentMode === mode ? '#fff' : 'var(--text-dim)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3,
                    transition: 'all 0.15s',
                  }}
                >
                  {icons[mode]} {labels[mode]}
                </button>
              );
            })}
          </div>

          {customPrompts.length > 0 && (
            <div style={{ display: 'flex', gap: 3, marginTop: 4, flexWrap: 'wrap' }}>
              {customPrompts.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setAgentMode(p.id as any)}
                  style={{
                    padding: '2px 8px', fontSize: 10, borderRadius: 4, cursor: 'pointer',
                    border: '1px solid var(--border)',
                    background: agentMode === p.id ? 'var(--accent)' : 'var(--hover-bg)',
                    color: agentMode === p.id ? '#fff' : 'var(--text-dim)',
                    display: 'flex', alignItems: 'center', gap: 3, transition: 'all 0.15s',
                  }}
                >
                  <Edit3 size={10} /> {p.name}
                </button>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
            <button
              onClick={() => {
                setShowPromptEditor(!showPromptEditor);
                setEditingPrompt(null);
                setNewPromptName('');
                setNewPromptContent('');
              }}
              style={{
                padding: '2px 8px', fontSize: 10, borderRadius: 4, cursor: 'pointer',
                border: '1px solid var(--border)', background: 'transparent',
                color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 3,
                transition: 'all 0.15s',
              }}
            >
              {showPromptEditor ? <X size={10} /> : <Plus size={10} />}
              {showPromptEditor ? 'Close Editor' : 'Custom Prompts'}
            </button>
          </div>
        </div>

        {showPromptEditor && (
          <div style={{ padding: '6px 12px', borderBottom: '1px solid var(--border)', maxHeight: 200, overflow: 'auto' }}>
            {customPrompts.map((p) => (
              <div key={p.id} style={{ marginBottom: 6, padding: 6, background: 'var(--hover-bg)', borderRadius: 4 }}>
                {editingPrompt?.id === p.id ? (
                  <>
                    <input
                      style={{ width: '100%', marginBottom: 4, padding: '3px 6px', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 3, color: 'var(--text)', fontSize: 11, outline: 'none' }}
                      value={editingPrompt.name}
                      onChange={(e) => setEditingPrompt({ ...editingPrompt, name: e.target.value })}
                      placeholder="Prompt name"
                    />
                    <textarea
                      style={{ width: '100%', marginBottom: 4, padding: '3px 6px', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 3, color: 'var(--text)', fontSize: 11, outline: 'none', resize: 'vertical', minHeight: 40, fontFamily: 'var(--font-mono)' }}
                      value={editingPrompt.content}
                      onChange={(e) => setEditingPrompt({ ...editingPrompt, content: e.target.value })}
                      placeholder="System prompt content..."
                      rows={3}
                    />
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button
                        onClick={() => { updateCustomPrompt(p.id, { name: editingPrompt.name, content: editingPrompt.content }); setEditingPrompt(null); }}
                        style={{ padding: '2px 8px', fontSize: 10, borderRadius: 3, cursor: 'pointer', border: 'none', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', gap: 2 }}
                      ><Save size={10} /> Save</button>
                      <button
                        onClick={() => setEditingPrompt(null)}
                        style={{ padding: '2px 8px', fontSize: 10, borderRadius: 3, cursor: 'pointer', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-dim)' }}
                      >Cancel</button>
                    </div>
                  </>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ flex: 1, fontSize: 11, fontWeight: 600, color: 'var(--text)' }}>{p.name}</span>
                    <button onClick={() => setEditingPrompt({ id: p.id, name: p.name, content: p.content })} style={{ padding: 2, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex' }}><Pencil size={11} /></button>
                    <button onClick={() => deleteCustomPrompt(p.id)} style={{ padding: 2, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)', display: 'flex' }}><X size={11} /></button>
                  </div>
                )}
              </div>
            ))}
            <div style={{ padding: 6, background: 'var(--hover-bg)', borderRadius: 4, marginTop: customPrompts.length > 0 ? 6 : 0 }}>
              <input
                style={{ width: '100%', marginBottom: 4, padding: '3px 6px', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 3, color: 'var(--text)', fontSize: 11, outline: 'none' }}
                value={newPromptName}
                onChange={(e) => setNewPromptName(e.target.value)}
                placeholder="New prompt name"
              />
              <textarea
                style={{ width: '100%', marginBottom: 4, padding: '3px 6px', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 3, color: 'var(--text)', fontSize: 11, outline: 'none', resize: 'vertical', minHeight: 40, fontFamily: 'var(--font-mono)' }}
                value={newPromptContent}
                onChange={(e) => setNewPromptContent(e.target.value)}
                placeholder="System prompt content..."
                rows={3}
              />
              <button
                onClick={() => { if (newPromptName.trim() && newPromptContent.trim()) { addCustomPrompt(newPromptName.trim(), newPromptContent.trim()); setNewPromptName(''); setNewPromptContent(''); } }}
                disabled={!newPromptName.trim() || !newPromptContent.trim()}
                style={{ padding: '2px 8px', fontSize: 10, borderRadius: 3, cursor: 'pointer', border: 'none', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', gap: 2, opacity: (!newPromptName.trim() || !newPromptContent.trim()) ? 0.5 : 1 }}
              ><Plus size={10} /> Add Prompt</button>
            </div>
          </div>
        )}
      </div>

      <div className="agent-actions">
        {agentMessages.length === 0 && agentActions.length === 0 ? (
          <div className="empty-state">
            <Bot size={40} />
            <p>Tell the agent what you want to build or fix.</p>
          </div>
        ) : (
          <>
            {agentMessages.map((msg) => (
              <div
                key={msg.id}
                className={`chat-message ${msg.role === 'user' ? 'chat-message-user' : 'chat-message-assistant'}`}
                style={{ padding: '4px 0' }}
              >
                <div className="chat-avatar">
                  {msg.role === 'user' ? <Bot size={14} /> : <Bot size={14} />}
                </div>
                <div className={`chat-bubble ${msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-assistant'}`}>
                  <div style={{ fontSize: 12, lineHeight: 1.4, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{msg.content}</div>
                  <button
                    onClick={() => navigator.clipboard.writeText(msg.content)}
                    title="Copy message"
                    style={{
                      position: 'absolute', top: 4, right: 4,
                      background: 'var(--hover-bg)', border: '1px solid var(--border)',
                      borderRadius: 4, cursor: 'pointer',
                      color: 'var(--text-dim)', padding: 2,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      opacity: 0, transition: 'opacity 0.15s',
                    }}
                    className="copy-btn"
                  ><Copy size={12} /></button>
                </div>
              </div>
            ))}
            {agentActions.map((action) => (
              <ActionCard key={action.id} action={action} />
            ))}
          </>
        )}
        <div ref={actionsEndRef} />
      </div>

      {error && (
        <div style={{ padding: '8px 14px', background: 'rgba(248,81,73,0.1)', borderTop: '1px solid var(--red)', display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--red)' }}>
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}

      <div className="agent-input-area">
        <textarea
          ref={inputRef}
          className="agent-input"
          placeholder={running ? 'Agent is running...' : 'What do you want to build or fix?'}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={running}
        />
        <button
          className="agent-go-btn"
          onClick={handleGo}
          disabled={!input.trim() || running}
        >
          Go
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .agent-action {
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .agent-action.running {
          box-shadow: 0 0 8px rgba(88, 166, 255, 0.2);
        }
        .agent-action .action-header {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--text-dim);
          font-size: 11px;
        }
        .agent-action .action-icon {
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }
        .agent-action .action-desc {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: var(--text);
          font-size: 12px;
        }
        .agent-action .action-time {
          flex-shrink: 0;
          font-size: 10px;
          color: var(--text-dim);
        }
        .agent-action .action-status {
          flex-shrink: 0;
          font-size: 10px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 3px;
          padding: 1px 6px;
          border-radius: 4px;
        }
        .agent-action .action-status-pending {
          color: var(--text-dim);
          background: rgba(139, 148, 158, 0.1);
        }
        .agent-action .action-status-running {
          color: var(--accent);
          background: rgba(88, 166, 255, 0.1);
        }
        .agent-action .action-status-completed {
          color: var(--green);
          background: rgba(63, 185, 80, 0.1);
        }
        .agent-action .action-status-failed {
          color: var(--red);
          background: rgba(248, 81, 73, 0.1);
        }
        .agent-action .action-content {
          margin-top: 6px;
          padding: 6px 8px;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 4px;
          font-family: var(--font-mono);
          font-size: 11px;
          white-space: pre-wrap;
          word-break: break-all;
          max-height: 150px;
          overflow-y: auto;
          color: var(--text-dim);
        }
        .chat-bubble {
          position: relative;
        }
        .chat-bubble:hover .copy-btn {
          opacity: 1 !important;
        }
        .agent-header-btn {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: background 0.15s;
        }
        .agent-header-btn:hover {
          background: var(--hover-bg);
        }
      `}</style>
    </div>
  );
}
