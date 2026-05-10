import React, { useState, useCallback, useEffect } from 'react';
import { Bot, Network, Plug, RefreshCw, CheckCircle2, XCircle, Loader2, Settings2, ExternalLink, FolderOpen, BarChart3, Globe, Key, Eye, EyeOff, Edit3, Pencil, Plus, Save, X, Download, Trash2, Search } from 'lucide-react';
import { useAIStore, API_PROVIDER_DEFAULTS } from '../../stores/aiStore';
import { useSettingsStore } from '../../stores/settingsStore';
import TokenUsage from './TokenUsage';

const OllamaSettings: React.FC = () => {
  const [tab, setTab] = useState<'settings' | 'usage' | 'api' | 'prompts' | 'models'>('settings');
  const ollama = useAIStore((s) => s.ollama);
  const apiConfig = useAIStore((s) => s.apiConfig);
  const updateApiConfig = useAIStore((s) => s.updateApiConfig);
  const testApiConnection = useAIStore((s) => s.testApiConnection);
  const defaultWorkspacePath = useSettingsStore((s) => s.defaultWorkspacePath);
  const setDefaultWorkspacePath = useSettingsStore((s) => s.setDefaultWorkspacePath);
  const updateOllama = useAIStore((s) => s.updateOllama);
  const testOllamaConnection = useAIStore((s) => s.testOllamaConnection);
  const refreshOllamaModels = useAIStore((s) => s.refreshOllamaModels);
  const customPrompts = useAIStore((s) => s.customPrompts);
  const addCustomPrompt = useAIStore((s) => s.addCustomPrompt);
  const updateCustomPrompt = useAIStore((s) => s.updateCustomPrompt);
  const deleteCustomPrompt = useAIStore((s) => s.deleteCustomPrompt);

  const [localConfig, setLocalConfig] = useState({
    host: ollama.host, port: ollama.port, model: ollama.model, enabled: ollama.enabled,
  });
  const [testing, setTesting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [apiTesting, setApiTesting] = useState(false);
  const [apiTestResult, setApiTestResult] = useState<string | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<{ id: string; name: string; content: string } | null>(null);
  const [newPromptName, setNewPromptName] = useState('');
  const [newPromptContent, setNewPromptContent] = useState('');
  const [hfQuery, setHfQuery] = useState('');
  const [hfResults, setHfResults] = useState<any[]>([]);
  const [hfLoading, setHfLoading] = useState(false);
  const [hfToken, setHfToken] = useState(apiConfig.apiKey || '');
  const [localModels, setLocalModels] = useState<any[]>([]);
  const [downloadProgress, setDownloadProgress] = useState<Record<string, string>>({});

  const applyChanges = useCallback(() => {
    updateOllama({ host: localConfig.host, port: localConfig.port, model: localConfig.model, enabled: localConfig.enabled });
  }, [localConfig, updateOllama]);

  const handleTestConnection = useCallback(async () => {
    setTesting(true); applyChanges(); await testOllamaConnection(); setTesting(false);
  }, [applyChanges, testOllamaConnection]);

  const handleRefreshModels = useCallback(async () => {
    setRefreshing(true); applyChanges(); await refreshOllamaModels(); setRefreshing(false);
  }, [applyChanges, refreshOllamaModels]);

  const connectionColor = () => {
    switch (ollama.connectionStatus) {
      case 'connected': return 'var(--green)';
      case 'connecting': return 'var(--orange)';
      case 'error': return 'var(--red)';
      default: return 'var(--text-dim)';
    }
  };

  const connectionIcon = () => {
    switch (ollama.connectionStatus) {
      case 'connected': return <CheckCircle2 size={14} />;
      case 'connecting': return <Loader2 size={14} className="spin" />;
      case 'error': return <XCircle size={14} />;
      default: return <Plug size={14} />;
    }
  };

  const statusLabel = () => {
    switch (ollama.connectionStatus) {
      case 'connected': return 'Connected';
      case 'connecting': return 'Connecting...';
      case 'error': return ollama.errorMessage || 'Connection failed';
      default: return 'Not connected';
    }
  };

  const rowStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '8px 0', borderBottom: '1px solid var(--border)',
  };

  const inputStyle: React.CSSProperties = {
    background: 'var(--input-bg)', border: '1px solid var(--border)',
    borderRadius: 4, color: 'var(--text)', fontSize: 13,
    padding: '6px 10px', width: 160, outline: 'none',
    fontFamily: 'var(--font-mono)',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 13, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6,
  };

  const btnStyle: React.CSSProperties = {
    padding: '6px 12px', borderRadius: 4, fontSize: 12, fontWeight: 500,
    border: '1px solid var(--border)', cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: 4,
    transition: 'all 0.15s',
  };

  const loadLocalModels = useCallback(async () => {
    try {
      const result = await window.electronAPI?.hf.listLocal('G:\\ollama\\models');
      if (result?.success) setLocalModels(result.files || []);
    } catch {}
  }, []);

  useEffect(() => { if (tab === 'models') loadLocalModels(); }, [tab, loadLocalModels]);

  const handleHfSearch = useCallback(async () => {
    if (!hfQuery.trim()) return;
    setHfLoading(true); setHfResults([]);
    try {
      const result = await window.electronAPI?.hf.search(hfQuery, hfToken || undefined);
      if (result?.success) setHfResults(result.models || []);
      else alert(result?.error || 'Search failed');
    } catch (err: any) { alert(err.message || 'Search failed'); } finally { setHfLoading(false); }
  }, [hfQuery, hfToken]);

  const handleHfDownload = useCallback(async (modelId: string) => {
    const filename = modelId.split('/').pop() + '.gguf';
    setDownloadProgress((p) => ({ ...p, [modelId]: 'Downloading...' }));
    try {
      const result = await window.electronAPI?.hf.download(modelId, filename, 'G:\\ollama\\models', hfToken || undefined);
      if (result?.success) {
        setDownloadProgress((p) => ({ ...p, [modelId]: 'Downloaded!' }));
        loadLocalModels();
        setTimeout(() => {
          setDownloadProgress((p) => {
            const n = { ...p };
            delete n[modelId];
            return n;
          });
        }, 3000);
      } else {
        setDownloadProgress((p) => ({ ...p, [modelId]: 'Error: ' + (result?.error || 'unknown') }));
      }
    } catch (err: any) {
      setDownloadProgress((p) => ({ ...p, [modelId]: 'Error: ' + err.message }));
    }
  }, [hfToken, loadLocalModels]);

  const renderTabContent = () => {
    if (tab === 'usage') return <TokenUsage />;

    if (tab === 'api') {
      return (
        <div style={{ flex: 1, overflow: 'auto', paddingRight: 4 }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>API Provider</div>
            <div style={rowStyle}>
              <span style={labelStyle}><Globe size={14} /> Provider</span>
              <select style={{ ...inputStyle, width: 160, cursor: 'pointer' }} value={apiConfig.provider}
                onChange={(e) => updateApiConfig({ provider: e.target.value as any })}>
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic</option>
                <option value="groq">Groq</option>
                <option value="mistral">Mistral</option>
                <option value="deepseek">DeepSeek</option>
                <option value="google">Google (Gemini)</option>
                <option value="together">Together AI</option>
                <option value="openrouter">OpenRouter</option>
                <option value="perplexity">Perplexity</option>
                <option value="cohere">Cohere</option>
                <option value="github">GitHub Models</option>
                <option value="xai">xAI (Grok)</option>
                <option value="huggingface">Hugging Face</option>
                <option value="replicate">Replicate</option>
                <option value="anyscale">Anyscale</option>
                <option value="deepinfra">DeepInfra</option>
                <option value="nomic">Nomic</option>
                <option value="octoai">OctoAI</option>
                <option value="clarifai">Clarifai</option>
                <option value="custom">Custom (OpenAI-compat)</option>
              </select>
            </div>
            <div style={rowStyle}>
              <span style={labelStyle}><Key size={14} /> API Key</span>
              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <input style={{ ...inputStyle, width: 120 }} type={showApiKey ? 'text' : 'password'} value={apiConfig.apiKey}
                  onChange={(e) => updateApiConfig({ apiKey: e.target.value })} placeholder="sk-..." />
                <button onClick={() => setShowApiKey((s) => !s)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: 4, display: 'flex' }}>
                  {showApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            {apiConfig.provider !== 'anthropic' && apiConfig.provider !== 'google' && (
              <div style={rowStyle}>
                <span style={labelStyle}><Network size={14} /> Endpoint</span>
                <input style={{ ...inputStyle, width: 160 }} value={apiConfig.endpoint}
                  onChange={(e) => updateApiConfig({ endpoint: e.target.value })} placeholder="https://api.openai.com/v1" />
              </div>
            )}
            <div style={rowStyle}>
              <span style={labelStyle}><Bot size={14} /> Model</span>
              <input style={{ ...inputStyle, width: 160 }} value={apiConfig.model}
                onChange={(e) => updateApiConfig({ model: e.target.value })} placeholder={API_PROVIDER_DEFAULTS[apiConfig.provider]?.model || 'gpt-4o'} />
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Test Connection</div>
            {apiTestResult && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'var(--hover-bg)', borderRadius: 6, fontSize: 12,
                color: apiTestResult === 'Connected' ? 'var(--green)' : 'var(--red)', marginBottom: 8 }}>
                {apiTestResult === 'Connected' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                <span>{apiTestResult}</span>
              </div>
            )}
            <button style={{ ...btnStyle, color: 'var(--text)', background: 'var(--hover-bg)' }}
              onClick={async () => { setApiTesting(true); setApiTestResult(null); const result = await testApiConnection(); setApiTestResult(result); setApiTesting(false); }}
              disabled={apiTesting || !apiConfig.apiKey}>
              {apiTesting ? <Loader2 size={12} className="spin" /> : <RefreshCw size={12} />}
              Test Connection
            </button>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-dim)', lineHeight: 1.5 }}>
            <p>When Ollama is disabled and an API key is configured, chat and agent will use the remote API instead.</p>
            <p style={{ marginTop: 4 }}>API key is stored locally in your browser's localStorage.</p>
          </div>
        </div>
      );
    }

    if (tab === 'prompts') {
      return (
        <div style={{ flex: 1, overflow: 'auto', paddingRight: 4 }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Saved Prompts ({customPrompts.length})</div>
            {customPrompts.length === 0 && <div style={{ fontSize: 12, color: 'var(--text-dim)', padding: '8px 0' }}>No custom prompts yet. Create one below.</div>}
            {customPrompts.map((p) => (
              <div key={p.id} style={{ marginBottom: 8, padding: 8, background: 'var(--hover-bg)', borderRadius: 6 }}>
                {editingPrompt?.id === p.id ? (
                  <>
                    <input style={{ width: '100%', marginBottom: 4, padding: '4px 8px', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 3, color: 'var(--text)', fontSize: 12, outline: 'none' }}
                      value={editingPrompt.name} onChange={(e) => setEditingPrompt({ ...editingPrompt, name: e.target.value })} placeholder="Prompt name" />
                    <textarea style={{ width: '100%', marginBottom: 4, padding: '4px 8px', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 3, color: 'var(--text)', fontSize: 11, outline: 'none', resize: 'vertical', minHeight: 60, fontFamily: 'var(--font-mono)' }}
                      value={editingPrompt.content} onChange={(e) => setEditingPrompt({ ...editingPrompt, content: e.target.value })} placeholder="System prompt content..." rows={4} />
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button onClick={() => { updateCustomPrompt(p.id, { name: editingPrompt.name, content: editingPrompt.content }); setEditingPrompt(null); }}
                        style={{ padding: '4px 10px', fontSize: 11, borderRadius: 3, cursor: 'pointer', border: 'none', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Save size={12} /> Save
                      </button>
                      <button onClick={() => setEditingPrompt(null)} style={{ padding: '4px 10px', fontSize: 11, borderRadius: 3, cursor: 'pointer', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-dim)' }}>Cancel</button>
                    </div>
                  </>
                ) : (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{p.name}</span>
                      <button onClick={() => setEditingPrompt({ id: p.id, name: p.name, content: p.content })} style={{ padding: 2, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex' }}><Pencil size={12} /></button>
                      <button onClick={() => deleteCustomPrompt(p.id)} style={{ padding: 2, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)', display: 'flex' }}><X size={12} /></button>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-dim)', lineHeight: 1.4, whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: 80, overflow: 'hidden' }}>{p.content}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div style={{ padding: 8, background: 'var(--hover-bg)', borderRadius: 6 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-dim)', marginBottom: 6 }}>Add New Prompt</div>
            <input style={{ width: '100%', marginBottom: 4, padding: '4px 8px', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 3, color: 'var(--text)', fontSize: 12, outline: 'none' }}
              value={newPromptName} onChange={(e) => setNewPromptName(e.target.value)} placeholder="Prompt name" />
            <textarea style={{ width: '100%', marginBottom: 4, padding: '4px 8px', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 3, color: 'var(--text)', fontSize: 11, outline: 'none', resize: 'vertical', minHeight: 60, fontFamily: 'var(--font-mono)' }}
              value={newPromptContent} onChange={(e) => setNewPromptContent(e.target.value)} placeholder="System prompt content..." rows={4} />
            <button onClick={() => { if (newPromptName.trim() && newPromptContent.trim()) { addCustomPrompt(newPromptName.trim(), newPromptContent.trim()); setNewPromptName(''); setNewPromptContent(''); } }}
              disabled={!newPromptName.trim() || !newPromptContent.trim()}
              style={{ padding: '4px 10px', fontSize: 11, borderRadius: 3, cursor: 'pointer', border: 'none', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', gap: 4, opacity: (!newPromptName.trim() || !newPromptContent.trim()) ? 0.5 : 1 }}>
              <Plus size={12} /> Add Prompt
            </button>
          </div>
        </div>
      );
    }

    if (tab === 'models') {
      return (
        <div style={{ flex: 1, overflow: 'auto', paddingRight: 4 }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Hugging Face Token</div>
            <div style={rowStyle}>
              <span style={labelStyle}><Key size={14} /> HF Token</span>
              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <input style={{ ...inputStyle, width: 120 }} type={showApiKey ? 'text' : 'password'} value={hfToken}
                  onChange={(e) => { setHfToken(e.target.value); updateApiConfig({ apiKey: e.target.value }); }} placeholder="hf_..." />
                <button onClick={() => setShowApiKey((s) => !s)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: 4, display: 'flex' }}>
                  {showApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Search HF Models</div>
            <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
              <input style={{ flex: 1, ...inputStyle }} value={hfQuery} onChange={(e) => setHfQuery(e.target.value)} placeholder="Search GGUF models..." onKeyDown={(e) => { if (e.key === 'Enter') handleHfSearch(); }} />
              <button onClick={handleHfSearch} disabled={hfLoading || !hfQuery.trim()}
                style={{ ...btnStyle, background: 'var(--accent)', color: '#fff', opacity: (hfLoading || !hfQuery.trim()) ? 0.5 : 1 }}>
                {hfLoading ? <Loader2 size={12} className="spin" /> : <Search size={12} />}
                Search
              </button>
            </div>
            {hfResults.length > 0 && (
              <div style={{ maxHeight: 200, overflow: 'auto', background: 'var(--hover-bg)', borderRadius: 6, padding: 4 }}>
                {hfResults.slice(0, 10).map((m: any, i: number) => (
                  <div key={i} style={{ padding: '6px 8px', borderBottom: '1px solid var(--border)', fontSize: 12 }}>
                    <div style={{ fontWeight: 600, color: 'var(--text)' }}>{m.modelId || m.id}</div>
                    <div style={{ color: 'var(--text-dim)', fontSize: 11, marginTop: 2 }}>{m.tags?.join(', ')}</div>
                    <button onClick={() => handleHfDownload(m.modelId || m.id)} disabled={downloadProgress[m.modelId || m.id]}
                      style={{ ...btnStyle, marginTop: 4, fontSize: 11, padding: '3px 8px' }}>
                      {downloadProgress[m.modelId || m.id] ? <Loader2 size={10} className="spin" /> : <Download size={10} />}
                      {downloadProgress[m.modelId || m.id] || 'Download'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Downloaded Models</div>
            {localModels.length === 0 ? (
              <div style={{ fontSize: 12, color: 'var(--text-dim)', padding: '8px 0' }}>No models downloaded yet.</div>
            ) : (
              <div style={{ maxHeight: 200, overflow: 'auto' }}>
                {localModels.map((f: any, i: number) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px', borderBottom: '1px solid var(--border)', fontSize: 12 }}>
                    <span style={{ color: 'var(--text)' }}>{f.name}</span>
                    <span style={{ color: 'var(--text-dim)', fontSize: 11 }}>{(f.size / 1024 / 1024).toFixed(1)} GB</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    // Default: Settings tab (Ollama)
    return (
      <div style={{ flex: 1, overflow: 'auto', paddingRight: 4 }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Workspace</div>
          <div style={rowStyle}>
            <span style={labelStyle}><FolderOpen size={14} /> Default Path</span>
            <button onClick={async () => {
                const result = await window.electronAPI?.fileSystem.openFolderDialog(defaultWorkspacePath || undefined);
                if (result && !result.canceled && result.filePaths?.[0]) setDefaultWorkspacePath(result.filePaths[0]);
              }} style={{ ...btnStyle, color: 'var(--text)', background: 'var(--hover-bg)', fontSize: 11, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              title={defaultWorkspacePath || 'Click to select'}>
              {defaultWorkspacePath || 'Not set — click to choose'}
            </button>
          </div>
          {defaultWorkspacePath && (
            <div style={{ marginTop: 4 }}>
              <button onClick={() => setDefaultWorkspacePath('')} style={{ padding: '2px 8px', fontSize: 11, color: 'var(--text-dim)', background: 'transparent', border: 'none' }}>Clear</button>
            </div>
          )}
        </div>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Connection</div>
          <div style={rowStyle}>
            <span style={labelStyle}><Network size={14} /> Host</span>
            <input style={{ ...inputStyle, width: 160 }} value={localConfig.host}
              onChange={(e) => setLocalConfig((c) => ({ ...c, host: e.target.value }))} onBlur={applyChanges} placeholder="localhost" />
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}><Settings2 size={14} /> Port</span>
            <input style={{ ...inputStyle, width: 80 }} type="number" min={1} max={65535} value={localConfig.port}
              onChange={(e) => setLocalConfig((c) => ({ ...c, port: parseInt(e.target.value) || 11434 }))} onBlur={applyChanges} />
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}><Plug size={14} /> Enabled</span>
            <div onClick={() => {
                const next = !localConfig.enabled;
                setLocalConfig((c) => ({ ...c, enabled: next })); updateOllama({ enabled: next });
              }} style={{ width: 36, height: 20, borderRadius: 10, background: localConfig.enabled ? 'var(--accent)' : 'var(--border)', position: 'relative', cursor: 'pointer', transition: 'background 0.2s' }}>
              <div style={{ position: 'absolute', top: 2, left: localConfig.enabled ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
            </div>
          </div>
        </div>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Status</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'var(--hover-bg)', borderRadius: 6, fontSize: 12, color: connectionColor(), marginBottom: 8 }}>
            {connectionIcon()}
            <span>{statusLabel()}</span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button style={{ ...btnStyle, color: 'var(--text)', background: 'var(--hover-bg)' }} onClick={handleTestConnection} disabled={testing}>
              {testing ? <Loader2 size={12} className="spin" /> : <RefreshCw size={12} />}
              Test Connection
            </button>
          </div>
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Model</span>
            <button onClick={handleRefreshModels} disabled={refreshing} title="Refresh models from server" style={{ ...btnStyle, padding: '3px 8px', fontSize: 11, color: 'var(--text-dim)', background: 'transparent' }}>
              <RefreshCw size={10} className={refreshing ? 'spin' : ''} />
            </button>
          </div>
          <select style={{ width: '100%', padding: '6px 10px', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--text)', fontSize: 13, outline: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}
            value={localConfig.model} onChange={(e) => {
              setLocalConfig((c) => ({ ...c, model: e.target.value })); updateOllama({ model: e.target.value });
            }}>
            {ollama.availableModels.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <div style={{ marginTop: 12, fontSize: 11, color: 'var(--text-dim)', lineHeight: 1.5 }}>
            <p>Ollama must be running on your machine for local AI features.</p>
            <p style={{ marginTop: 4 }}>
              Download from{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); window.electronAPI?.shell?.openExternal('https://ollama.ai'); }} style={{ color: 'var(--accent)', cursor: 'pointer' }}>ollama.ai</a>
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: '12px 16px', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <Bot size={20} style={{ color: 'var(--accent)' }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Settings</div>
          <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>Configuration & usage</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
        <button onClick={() => setTab('settings')} style={{ flex: 1, padding: '6px 0', fontSize: 11, borderRadius: 4, cursor: 'pointer',
          background: tab === 'settings' ? 'var(--accent)' : 'var(--hover-bg)', color: tab === 'settings' ? '#fff' : 'var(--text-dim)',
          border: 'none', fontWeight: tab === 'settings' ? 600 : 400, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
          <Settings2 size={12} /> Config
        </button>
        <button onClick={() => setTab('api')} style={{ flex: 1, padding: '6px 0', fontSize: 11, borderRadius: 4, cursor: 'pointer',
          background: tab === 'api' ? 'var(--accent)' : 'var(--hover-bg)', color: tab === 'api' ? '#fff' : 'var(--text-dim)',
          border: 'none', fontWeight: tab === 'api' ? 600 : 400, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
          <Globe size={12} /> API
        </button>
        <button onClick={() => setTab('usage')} style={{ flex: 1, padding: '6px 0', fontSize: 11, borderRadius: 4, cursor: 'pointer',
          background: tab === 'usage' ? 'var(--accent)' : 'var(--hover-bg)', color: tab === 'usage' ? '#fff' : 'var(--text-dim)',
          border: 'none', fontWeight: tab === 'usage' ? 600 : 400, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
          <BarChart3 size={12} /> Usage
        </button>
        <button onClick={() => setTab('prompts')} style={{ flex: 1, padding: '6px 0', fontSize: 11, borderRadius: 4, cursor: 'pointer',
          background: tab === 'prompts' ? 'var(--accent)' : 'var(--hover-bg)', color: tab === 'prompts' ? '#fff' : 'var(--text-dim)',
          border: 'none', fontWeight: tab === 'prompts' ? 600 : 400, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
          <Edit3 size={12} /> Prompts
        </button>
        <button onClick={() => setTab('models')} style={{ flex: 1, padding: '6px 0', fontSize: 11, borderRadius: 4, cursor: 'pointer',
          background: tab === 'models' ? 'var(--accent)' : 'var(--hover-bg)', color: tab === 'models' ? '#fff' : 'var(--text-dim)',
          border: 'none', fontWeight: tab === 'models' ? 600 : 400, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
          <Download size={12} /> Models
        </button>
      </div>
      {renderTabContent()}
    </div>
  );
};

export default OllamaSettings;
