export interface Tab {
  id: string;
  title: string;
  path: string;
  isDirty: boolean;
  language: string;
  content: string;
  originalContent: string;
}

export interface FileNode {
  name: string;
  path: string;
  isDirectory: boolean;
  isFile: boolean;
  isSymlink: boolean;
  children?: FileNode[];
  expanded?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  codeBlock?: { language: string; code: string };
}

export interface AICompletion {
  id: string;
  text: string;
  position: { line: number; column: number };
}

export interface AgentAction {
  id: string;
  type: 'read' | 'write' | 'command' | 'think' | 'search' | 'error' | 'success';
  description: string;
  content?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  timestamp: number;
}

export interface TerminalTab {
  id: string;
  name: string;
  type: 'powershell' | 'cmd' | 'bash' | 'wsl';
  cwd: string;
}

export interface GitStatus {
  branch: string;
  changes: number;
  staged: number;
  modified: string[];
  untracked: string[];
}

export interface Theme {
  id: string;
  name: string;
  type: 'dark' | 'light' | 'high-contrast';
  colors: Record<string, string>;
}

export interface SearchResult {
  file: string;
  line: number;
  column: number;
  match: string;
  lineContent: string;
}

export interface Extension {
  id: string;
  name: string;
  version: string;
  description: string;
  publisher: string;
  enabled: boolean;
  installed: boolean;
}
