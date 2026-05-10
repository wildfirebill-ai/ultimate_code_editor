import { create } from 'zustand';
import { ChatMessage, AgentAction } from '@shared/types';

export interface TokenUsageEntry {
  id: string;
  model: string;
  promptTokens: number;
  responseTokens: number;
  totalTokens: number;
  timestamp: number;
}

function ollamaErrorMsg(status: number, model: string): string {
  if (status === 404) {
    return `Model "${model}" not found. Pull it with: ollama pull ${model}`;
  }
  return `Ollama error: ${status}`;
}

const TOKEN_USAGE_KEY = 'ultimate-editor-token-usage';

function loadTokenUsage(): TokenUsageEntry[] {
  try {
    const raw = localStorage.getItem(TOKEN_USAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveTokenUsage(entries: TokenUsageEntry[]): void {
  try {
    localStorage.setItem(TOKEN_USAGE_KEY, JSON.stringify(entries));
  } catch { /* ignore */ }
}

export const AGENT_SYSTEM_PROMPTS: Record<string, string> = {
  plan: 'You are a senior software architect. Given a task, produce a detailed step-by-step plan. Be specific with file paths, architecture decisions, and rationale. Do NOT write final code — focus on design and strategy. Use markdown for structure.',
  build: 'You are a coding agent. Follow the user\'s instructions precisely and do exactly what is asked — no more, no less. If they ask to create a folder, only create that folder. If they ask for a file, only create that file. Be specific with file paths, commands, and code snippets. Use markdown for code blocks.',
  debug: 'You are a debugging expert. Given an issue description, analyze the root cause methodically, suggest specific fixes, and explain why the fix works. Include reproduction steps and verification commands. Use markdown for code blocks.',
  analyze: 'You are a code reviewer. Given code or a feature request, analyze it for correctness, performance, security, and maintainability. Provide specific recommendations with before/after code examples. Use markdown for code blocks.',
};

export const BUILTIN_PROMPT_IDS = ['plan', 'build', 'debug', 'analyze'] as const;

export const DEFAULT_CUSTOM_PROMPTS: SavedPrompt[] = [
  { id: 'prompt-code-review', name: 'Code Reviewer', content: 'You are a thorough code reviewer. Analyze the given code for bugs, performance issues, security vulnerabilities, and maintainability concerns. Provide specific, actionable feedback with code examples for each issue found. Prioritize by severity.' },
  { id: 'prompt-test-gen', name: 'Test Generator', content: 'You are a testing expert. Generate comprehensive unit tests for the given code. Cover edge cases, error paths, and happy paths. Use the same testing framework and conventions as the existing codebase. Include mock setups where needed.' },
  { id: 'prompt-commit-msg', name: 'Commit Writer', content: 'You are a git expert. Given the provided diff or description, write a concise conventional commit message. Follow the format: type(scope): description. Types: feat, fix, refactor, test, docs, chore. Keep the subject under 72 characters.' },
  { id: 'prompt-api-design', name: 'API Designer', content: 'You are an API architect. Design RESTful or GraphQL API endpoints following best practices. Specify HTTP methods, request/response schemas, status codes, authentication requirements, and error handling. Consider pagination, rate limiting, and versioning.' },
  { id: 'prompt-db-design', name: 'DB Schema Designer', content: 'You are a database architect. Design database schemas with proper normalization, indexes, constraints, and relationships. Consider query patterns, data types, migration strategies, and performance implications. Include SQL or ORM definitions.' },
  { id: 'prompt-refactor', name: 'Refactoring Advisor', content: 'You are a code quality expert. Suggest refactoring improvements for the given code. Focus on reducing complexity, improving readability, eliminating duplication, and applying design patterns. Provide before/after code examples and explain the benefits of each change.' },
  { id: 'prompt-docs', name: 'Docs Writer', content: 'You are a technical writer. Generate clear, comprehensive documentation for the given code or feature. Include purpose, usage examples, API reference, edge cases, and configuration options. Use markdown formatting with appropriate headings and code blocks.' },
  { id: 'prompt-debug', name: 'Debugging Assistant', content: 'You are a debugging expert. Given an error message, stack trace, or bug description, systematically identify the root cause. Propose specific fixes with explanations. Include reproduction steps, verification commands, and preventative measures to avoid similar issues.' },
  { id: 'prompt-perf', name: 'Performance Optimizer', content: 'You are a performance engineer. Analyze the given code for performance bottlenecks. Suggest specific optimizations with before/after comparisons. Consider algorithmic complexity, memory usage, I/O patterns, caching strategies, and concurrency.' },
  { id: 'prompt-arch', name: 'Architecture Advisor', content: 'You are a software architect. Given a feature or system description, propose a high-level architecture. Consider design patterns, component boundaries, data flow, error handling, scalability, and technology choices. Provide diagrams using ASCII or mermaid if helpful.' },
];

export const TOOL_INSTRUCTIONS = `
You have access to tools for reading/writing files and running commands. Use them by outputting a code block with the appropriate format. After you use a tool, its result will be provided back to you so you can continue.

Available tools:

1. **write_file** - Create or overwrite a file. Use a code block whose first line is a comment with the file path:
\`\`\`
// path/to/file.ext
file content goes here
\`\`\`

2. **run_command** - Execute a shell command. Use a code block with the language set to bash, sh, shell, cmd, or powershell:
\`\`\`bash
your command here
\`\`\`

3. **read_file** - Read the contents of a file. Use a code block with language read_file:
\`\`\`read_file
path/to/file.ext
\`\`\`

IMPORTANT: Use tools step by step. After each tool use, continue based on the result. When the task is complete, provide a summary.`;

export interface SavedPrompt {
  id: string;
  name: string;
  content: string;
}

const CUSTOM_PROMPTS_KEY = 'ultimate-editor-custom-prompts';

function loadCustomPrompts(): SavedPrompt[] {
  try {
    const raw = localStorage.getItem(CUSTOM_PROMPTS_KEY);
    if (raw) return JSON.parse(raw);
    saveCustomPrompts(DEFAULT_CUSTOM_PROMPTS);
    return DEFAULT_CUSTOM_PROMPTS;
  } catch { return []; }
}

function saveCustomPrompts(prompts: SavedPrompt[]): void {
  try { localStorage.setItem(CUSTOM_PROMPTS_KEY, JSON.stringify(prompts)); } catch { /* ignore */ }
}

export interface OllamaConfig {
  enabled: boolean;
  host: string;
  port: number;
  model: string;
  availableModels: string[];
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  errorMessage: string;
}

export type ApiProviderType = 'openai' | 'anthropic' | 'groq' | 'mistral' | 'deepseek' | 'google' | 'together' | 'openrouter' | 'perplexity' | 'cohere' | 'github' | 'xai' | 'huggingface' | 'replicate' | 'anyscale' | 'deepinfra' | 'nomic' | 'octoai' | 'clarifai' | 'custom';

export const API_PROVIDER_DEFAULTS: Record<ApiProviderType, { endpoint: string; model: string }> = {
  openai: { endpoint: 'https://api.openai.com/v1', model: 'gpt-4o' },
  anthropic: { endpoint: 'https://api.anthropic.com/v1', model: 'claude-3-haiku-20240307' },
  groq: { endpoint: 'https://api.groq.com/openai/v1', model: 'llama3-70b-8192' },
  mistral: { endpoint: 'https://api.mistral.ai/v1', model: 'mistral-large-latest' },
  deepseek: { endpoint: 'https://api.deepseek.com/v1', model: 'deepseek-chat' },
  google: { endpoint: 'https://generativelanguage.googleapis.com/v1beta', model: 'gemini-2.0-flash' },
  together: { endpoint: 'https://api.together.xyz/v1', model: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo' },
  openrouter: { endpoint: 'https://openrouter.ai/api/v1', model: 'anthropic/claude-3.5-sonnet' },
  perplexity: { endpoint: 'https://api.perplexity.ai', model: 'sonar-pro' },
  cohere: { endpoint: 'https://api.cohere.ai/v1', model: 'command-r-plus' },
  github: { endpoint: 'https://models.inference.ai.azure.com', model: 'gpt-4o' },
  xai: { endpoint: 'https://api.x.ai/v1', model: 'grok-2' },
  huggingface: { endpoint: 'https://api-inference.huggingface.co/models', model: 'meta-llama/Meta-Llama-3.1-8B-Instruct' },
  replicate: { endpoint: 'https://api.replicate.com/v1', model: 'meta/llama-3.1-8b-instruct' },
  anyscale: { endpoint: 'https://api.endpoints.anyscale.com/v1', model: 'meta-llama/Meta-Llama-3.1-8B-Instruct' },
  deepinfra: { endpoint: 'https://api.deepinfra.io/v1', model: 'meta-llama/Meta-Llama-3.1-8B-Instruct' },
  nomic: { endpoint: 'https://api.nomic.ai/v1', model: 'nomic-embed-text-v1.5' },
  octoai: { endpoint: 'https://text.octoai.run/v1', model: 'meta-llama/Meta-Llama-3.1-8B-Instruct' },
  clarifai: { endpoint: 'https://api.clarifai.com/v1', model: 'meta-llama/Meta-Llama-3.1-8B-Instruct' },
  custom: { endpoint: '', model: '' },
};

export interface ApiProviderConfig {
  provider: ApiProviderType;
  apiKey: string;
  endpoint: string;
  model: string;
}

const API_KEY_STORAGE_KEY = 'ultimate-editor-api-config';

function loadApiConfig(): ApiProviderConfig {
  try {
    const raw = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { provider: 'openai', apiKey: '', endpoint: 'https://api.openai.com/v1', model: 'gpt-4o' };
}

function saveApiConfig(config: ApiProviderConfig): void {
  try { localStorage.setItem(API_KEY_STORAGE_KEY, JSON.stringify(config)); } catch { /* ignore */ }
}

interface AIStore {
  inlineCompletion: string | null;
  agentMessages: ChatMessage[];
  isAgentOpen: boolean;
  agentMode: 'plan' | 'build' | 'debug' | 'analyze';
  agentActions: AgentAction[];
  agentActive: boolean;
  customPrompts: SavedPrompt[];
  selectedModel: string;
  availableModels: string[];
  ollama: OllamaConfig;
  apiConfig: ApiProviderConfig;
  tokenUsage: TokenUsageEntry[];

  setInlineCompletion: (text: string | null) => void;
  setAgentMode: (m: 'plan' | 'build' | 'debug' | 'analyze') => void;
  setAgentOpen: (open: boolean) => void;
  toggleAgent: () => void;
  addCustomPrompt: (name: string, content: string) => void;
  updateCustomPrompt: (id: string, updates: Partial<SavedPrompt>) => void;
  deleteCustomPrompt: (id: string) => void;
  addAgentMessage: (msg: ChatMessage) => void;
  clearAgentMessages: () => void;
  addAgentAction: (a: AgentAction) => void;
  updateAgentAction: (id: string, updates: Partial<AgentAction>) => void;
  clearAgentActions: () => void;
  setAgentActive: (a: boolean) => void;
  setModel: (m: string) => void;
  updateOllama: (config: Partial<OllamaConfig>) => void;
  testOllamaConnection: () => Promise<boolean>;
  refreshOllamaModels: () => Promise<string[]>;
  sendAgentTask: (task: string, signal?: AbortSignal) => Promise<string>;
  sendMessages: (messages: { role: string; content: string }[], signal?: AbortSignal) => Promise<string>;
  addTokenUsage: (entry: TokenUsageEntry) => void;
  clearTokenUsage: () => void;
  updateApiConfig: (config: Partial<ApiProviderConfig>) => void;
  testApiConnection: () => Promise<string>;
  callApi: (messages: { role: string; content: string }[], signal?: AbortSignal) => Promise<string>;
}

export const useAIStore = create<AIStore>()((set, get) => ({
  inlineCompletion: null,
  agentMessages: [],
  isAgentOpen: false,
  agentMode: 'build',
  agentActions: [],
  agentActive: false,
  customPrompts: loadCustomPrompts(),
  tokenUsage: loadTokenUsage(),
  selectedModel: 'claude-3-opus',
  availableModels: [
    'claude-3-opus-20240229',
    'claude-3-sonnet-20240229',
    'claude-3-haiku-20240307',
    'gpt-4o',
    'gpt-4-turbo',
    'gpt-3.5-turbo',
    'codestral-latest',
    'deepseek-coder-v2',
    'tabby-8b',
    'starcoder2-15b',
  ],
  apiConfig: loadApiConfig(),
  ollama: {
    enabled: true,
    host: 'localhost',
    port: 11434,
    model: 'deepseek-coder-v2:16b',
    availableModels: ['codellama:7b', 'codellama:13b', 'llama3:8b', 'llama3:70b', 'mistral:7b', 'mixtral:8x7b', 'deepseek-coder:6.7b', 'deepseek-coder:33b', 'deepseek-coder-v2:16b', 'phi3:3.8b', 'neural-chat:7b', 'starling-lm:7b', 'qwen2.5-coder:7b', 'codegemma:2b', 'codegemma:7b', 'starcoder2:7b', 'starcoder2:15b'],
    connectionStatus: 'disconnected',
    errorMessage: '',
  },

  setInlineCompletion: (text) => set({ inlineCompletion: text }),
  setAgentMode: (m) => set({ agentMode: m }),
  setAgentOpen: (open) => set({ isAgentOpen: open }),
  toggleAgent: () => set((s) => ({ isAgentOpen: !s.isAgentOpen })),
  addCustomPrompt: (name, content) => {
    set((s) => {
      const updated: SavedPrompt[] = [...s.customPrompts, { id: `prompt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, name, content }];
      saveCustomPrompts(updated);
      return { customPrompts: updated };
    });
  },
  updateCustomPrompt: (id, updates) => {
    set((s) => {
      const updated = s.customPrompts.map((p) => p.id === id ? { ...p, ...updates } : p);
      saveCustomPrompts(updated);
      return { customPrompts: updated };
    });
  },
  deleteCustomPrompt: (id) => {
    set((s) => {
      const updated = s.customPrompts.filter((p) => p.id !== id);
      saveCustomPrompts(updated);
      return { customPrompts: updated };
    });
  },
  addAgentMessage: (msg) => set((s) => ({ agentMessages: [...s.agentMessages, msg] })),
  clearAgentMessages: () => set({ agentMessages: [] }),
  addAgentAction: (a) => set((s) => ({ agentActions: [...s.agentActions, a] })),
  updateAgentAction: (id, updates) =>
    set((s) => ({
      agentActions: s.agentActions.map((a) =>
        a.id === id ? { ...a, ...updates } : a
      ),
    })),
  clearAgentActions: () => set({ agentActions: [] }),
  setAgentActive: (a) => set({ agentActive: a }),
  setModel: (m) => set({ selectedModel: m }),

  addTokenUsage: (entry) => {
    set((s) => {
      const updated = [...s.tokenUsage, entry];
      saveTokenUsage(updated);
      return { tokenUsage: updated };
    });
  },

  clearTokenUsage: () => {
    saveTokenUsage([]);
    set({ tokenUsage: [] });
  },

  updateOllama: (config) =>
    set((s) => ({ ollama: { ...s.ollama, ...config } })),

  updateApiConfig: (config) => {
    set((s) => {
      let updated = { ...s.apiConfig, ...config };
      if (config.provider && config.provider !== s.apiConfig.provider) {
        const defaults = API_PROVIDER_DEFAULTS[config.provider];
        if (defaults) {
          updated.endpoint = defaults.endpoint;
          if (!updated.model || updated.model === API_PROVIDER_DEFAULTS[s.apiConfig.provider]?.model) {
            updated.model = defaults.model;
          }
        }
      }
      saveApiConfig(updated);
      return { apiConfig: updated };
    });
  },

  testApiConnection: async () => {
    const { apiConfig } = get();
    if (!apiConfig.apiKey) return 'No API key configured';
    try {
      if (apiConfig.provider === 'anthropic') {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-api-key': apiConfig.apiKey, 'anthropic-version': '2023-06-01' },
          body: JSON.stringify({ model: apiConfig.model || 'claude-3-haiku-20240307', max_tokens: 10, messages: [{ role: 'user', content: 'hi' }] }),
          signal: AbortSignal.timeout(10000),
        });
        return res.ok ? 'Connected' : `Error ${res.status}: ${res.statusText}`;
      }
      if (apiConfig.provider === 'google') {
        const url = `${apiConfig.endpoint.replace(/\/+$/, '')}/models/${apiConfig.model || 'gemini-2.0-flash'}:generateContent?key=${apiConfig.apiKey}`;
        const res = await fetch(url, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: 'hi' }] }] }),
          signal: AbortSignal.timeout(10000),
        });
        return res.ok ? 'Connected' : `Error ${res.status}: ${res.statusText}`;
      }
      if (apiConfig.provider === 'huggingface') {
        const base = apiConfig.endpoint.replace(/\/+$/, '');
        const model = apiConfig.model || 'meta-llama/Meta-Llama-3.1-8B-Instruct';
        const url = base + '/' + model + '/v1/chat/completions';
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiConfig.apiKey}` },
          body: JSON.stringify({ messages: [{ role: 'user', content: 'hi' }], max_tokens: 10 }),
          signal: AbortSignal.timeout(10000),
        });
        return res.ok ? 'Connected' : `Error ${res.status}: ${res.statusText}`;
      }
      if (apiConfig.provider === 'replicate') {
        const res = await fetch('https://api.replicate.com/v1/models', {
          headers: { Authorization: `Token ${apiConfig.apiKey}` },
          signal: AbortSignal.timeout(10000),
        });
        return res.ok ? 'Connected' : `Error ${res.status}: ${res.statusText}`;
      }
      const endpoint = apiConfig.endpoint.replace(/\/+$/, '') + '/chat/completions';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiConfig.apiKey}` },
        body: JSON.stringify({ model: apiConfig.model || 'gpt-4o', messages: [{ role: 'user', content: 'hi' }], max_tokens: 10 }),
        signal: AbortSignal.timeout(10000),
      });
      return res.ok ? 'Connected' : `Error ${res.status}: ${res.statusText}`;
    } catch (err: any) {
      return err.message || 'Connection failed';
    }
  },

  testOllamaConnection: async () => {
    const { ollama } = get();
    set((s) => ({ ollama: { ...s.ollama, connectionStatus: 'connecting', errorMessage: '' } }));
    try {
      const url = `http://${ollama.host}:${ollama.port}/api/tags`;
      const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (response.ok) {
        set((s) => ({ ollama: { ...s.ollama, connectionStatus: 'connected' } }));
        return true;
      }
      throw new Error(`Status ${response.status}`);
    } catch (err: any) {
      set((s) => ({
        ollama: {
          ...s.ollama,
          connectionStatus: 'error',
          errorMessage: err.message || 'Connection failed',
        },
      }));
      return false;
    }
  },

  refreshOllamaModels: async () => {
    const { ollama } = get();
    try {
      const url = `http://${ollama.host}:${ollama.port}/api/tags`;
      const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (response.ok) {
        const data = await response.json();
        const models = (data.models || []).map((m: any) => m.name);
        if (models.length > 0) {
          set((s) => ({ ollama: { ...s.ollama, availableModels: models } }));
        }
        return models;
      }
      return [];
    } catch {
      return [];
    }
  },

  callApi: async (messages: { role: string; content: string }[], signal?: AbortSignal): Promise<string> => {
    const { apiConfig, addTokenUsage } = get();
    let data: any;
    let modelName = apiConfig.model;

    if (apiConfig.provider === 'anthropic') {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiConfig.apiKey, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: modelName, max_tokens: 4096, messages }),
        signal,
      });
      if (!res.ok) {
        const errBody = await res.text().catch(() => '');
        throw new Error(`Anthropic API error ${res.status}: ${res.statusText}. ${errBody}`);
      }
      data = await res.json();
      if (data.usage) {
        addTokenUsage({
          id: `usage-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          model: modelName, promptTokens: data.usage.input_tokens || 0,
          responseTokens: data.usage.output_tokens || 0,
          totalTokens: (data.usage.input_tokens || 0) + (data.usage.output_tokens || 0),
          timestamp: Date.now(),
        });
      }
      return data.content?.[0]?.text || '';
    }

    if (apiConfig.provider === 'google') {
      const url = `${apiConfig.endpoint.replace(/\/+$/, '')}/models/${modelName}:generateContent?key=${apiConfig.apiKey}`;
      const contents = messages.map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }));
      const res = await fetch(url, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents }),
        signal,
      });
      if (!res.ok) {
        const errBody = await res.text().catch(() => '');
        throw new Error(`Google API error ${res.status}: ${res.statusText}. ${errBody}`);
      }
      data = await res.json();
      if (data.usageMetadata) {
        addTokenUsage({
          id: `usage-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          model: modelName, promptTokens: data.usageMetadata.promptTokenCount || 0,
          responseTokens: data.usageMetadata.candidatesTokenCount || 0,
          totalTokens: data.usageMetadata.totalTokenCount || 0,
          timestamp: Date.now(),
        });
      }
      return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    }

    if (apiConfig.provider === 'huggingface') {
      const endpoint = `${apiConfig.endpoint.replace(/\/+$/, '')}/${modelName}/v1/chat/completions`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiConfig.apiKey}` },
        body: JSON.stringify({ model: modelName, messages, max_tokens: 4096 }),
        signal,
      });
      if (!res.ok) {
        const errBody = await res.text().catch(() => '');
        throw new Error(`HuggingFace API error ${res.status}: ${res.statusText}. ${errBody}`);
      }
      data = await res.json();
      if (data.usage) {
        addTokenUsage({
          id: `usage-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          model: modelName, promptTokens: data.usage.prompt_tokens || 0,
          responseTokens: data.usage.completion_tokens || 0,
          totalTokens: data.usage.total_tokens || 0,
          timestamp: Date.now(),
        });
      }
      return data.choices?.[0]?.message?.content || '';
    }

    if (apiConfig.provider === 'replicate') {
      const res = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Token ${apiConfig.apiKey}` },
        body: JSON.stringify({ model: modelName, input: { prompt: messages[messages.length - 1]?.content || 'hi' } }),
        signal,
      });
      if (!res.ok) {
        const errBody = await res.text().catch(() => '');
        throw new Error(`Replicate API error ${res.status}: ${res.statusText}. ${errBody}`);
      }
      data = await res.json();
      return data.output || '';
    }

    const endpoint = apiConfig.endpoint.replace(/\/+$/, '') + '/chat/completions';
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiConfig.apiKey}` },
      body: JSON.stringify({ model: modelName, messages, max_tokens: 4096 }),
      signal,
    });
    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      throw new Error(`API error ${res.status}: ${res.statusText}. ${errBody}`);
    }
    data = await res.json();
    if (data.usage) {
      addTokenUsage({
        id: `usage-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        model: modelName, promptTokens: data.usage.prompt_tokens || 0,
        responseTokens: data.usage.completion_tokens || 0,
        totalTokens: data.usage.total_tokens || 0,
        timestamp: Date.now(),
      });
    }
    return data.choices?.[0]?.message?.content || '';
  },

  sendMessages: async (messages, signal) => {
    const { ollama, apiConfig, addTokenUsage } = get();
    if (ollama.enabled) {
      const url = `http://${ollama.host}:${ollama.port}/api/chat`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: ollama.model, messages, stream: false }),
        signal,
      });
      if (!response.ok) throw new Error(ollamaErrorMsg(response.status, ollama.model));
      const data = await response.json();
      const promptTokens = data.prompt_eval_count || 0;
      const responseTokens = data.eval_count || 0;
      if (promptTokens > 0 || responseTokens > 0) {
        addTokenUsage({
          id: `usage-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          model: ollama.model, promptTokens, responseTokens,
          totalTokens: promptTokens + responseTokens, timestamp: Date.now(),
        });
      }
      return data.message?.content || '';
    }
    if (apiConfig.apiKey) {
      return get().callApi(messages, signal);
    }
    throw new Error('No AI backend configured. Enable Ollama or configure an API provider in Settings.');
  },

  sendAgentTask: async (task, signal) => {
    const { ollama, apiConfig, addTokenUsage, agentMode, customPrompts } = get();
    const builtin = AGENT_SYSTEM_PROMPTS[agentMode];
    const custom = customPrompts.find((p) => p.id === agentMode);
    const systemMsg = (custom ? custom.content : (builtin || AGENT_SYSTEM_PROMPTS.plan)) + '\n\n' + TOOL_INSTRUCTIONS;

    if (ollama.enabled) {
      const url = `http://${ollama.host}:${ollama.port}/api/chat`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: ollama.model,
          messages: [{ role: 'system', content: systemMsg }, { role: 'user', content: task }],
          stream: false,
        }),
        signal,
      });
      if (!response.ok) throw new Error(ollamaErrorMsg(response.status, ollama.model));
      const data = await response.json();
      const promptTokens = data.prompt_eval_count || 0;
      const responseTokens = data.eval_count || 0;
      if (promptTokens > 0 || responseTokens > 0) {
        addTokenUsage({
          id: `usage-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          model: ollama.model,
          promptTokens,
          responseTokens,
          totalTokens: promptTokens + responseTokens,
          timestamp: Date.now(),
        });
      }
      return data.message?.content || '';
    }

    if (apiConfig.apiKey) {
      return get().callApi([{ role: 'system', content: systemMsg }, { role: 'user', content: task }], signal);
    }

    throw new Error('No AI backend configured. Enable Ollama or configure an API provider in Settings.');
  },
}));
