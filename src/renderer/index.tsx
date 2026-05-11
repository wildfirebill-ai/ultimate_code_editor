import React from 'react';
import ReactDOM from 'react-dom/client';
import { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import App from './App';

self.MonacoEnvironment = {
  getWorker(_workerId: string, label: string) {
    switch (label) {
      case 'json': return new Worker(new URL('monaco-editor/esm/vs/language/json/json.worker.js', import.meta.url));
      case 'css':
      case 'scss':
      case 'less': return new Worker(new URL('monaco-editor/esm/vs/language/css/css.worker.js', import.meta.url));
      case 'html':
      case 'handlebars':
      case 'razor': return new Worker(new URL('monaco-editor/esm/vs/language/html/html.worker.js', import.meta.url));
      case 'typescript':
      case 'javascript': return new Worker(new URL('monaco-editor/esm/vs/language/typescript/ts.worker.js', import.meta.url));
      default: return new Worker(new URL('monaco-editor/esm/vs/editor/editor.worker.js', import.meta.url));
    }
  }
};

loader.config({ monaco });

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
    <App />
);

declare global {
  interface Window {
    electronAPI: {
      window: {
        minimize: () => Promise<void>;
        maximize: () => Promise<void>;
        close: () => Promise<void>;
        isMaximized: () => Promise<boolean>;
      };
      fileSystem: {
        readFile: (filePath: string) => Promise<{ content?: string; error?: string; path?: string }>;
        writeFile: (filePath: string, content: string) => Promise<{ success?: boolean; error?: string }>;
        readDirectory: (dirPath: string) => Promise<{ files?: any[]; error?: string; path?: string }>;
        checkExists: (filePath: string) => Promise<boolean>;
        openFileDialog: () => Promise<{ canceled: boolean; filePaths: string[] }>;
        openFolderDialog: (defaultPath?: string) => Promise<{ canceled: boolean; filePaths: string[] }>;
        getUserHome: () => Promise<string>;
        deleteFile: (filePath: string) => Promise<{ success?: boolean; error?: string }>;
        createFile: (filePath: string) => Promise<{ success?: boolean; error?: string }>;
        createDirectory: (dirPath: string) => Promise<{ success?: boolean; error?: string }>;
        rename: (oldPath: string, newPath: string) => Promise<{ success?: boolean; error?: string }>;
        copy: (srcPath: string, destPath: string) => Promise<{ success?: boolean; error?: string }>;
        getInfo: (filePath: string) => Promise<{ size?: number; modifiedAt?: string; createdAt?: string; isDirectory?: boolean; error?: string }>;
        showSaveDialog: (options?: any) => Promise<{ canceled: boolean; filePath?: string }>;
        getAppPath: () => Promise<string>;
      };
      shell: {
        openExternal: (url: string) => Promise<void>;
        runCommand: (command: string, cwd?: string) => Promise<{ stdout: string; stderr: string; exitCode: number }>;
      };

      git: {
        status: (cwd: string) => Promise<{ files?: { path: string; raw: string; staged: boolean; status: string }[]; error?: string }>;
        branch: (cwd: string) => Promise<{ branch?: string; error?: string }>;
        log: (cwd: string, count?: number) => Promise<{ commits?: { hash: string; author: string; date: string; message: string }[]; error?: string }>;
        add: (cwd: string, files: string[]) => Promise<{ success?: boolean; error?: string }>;
        unstage: (cwd: string, files: string[]) => Promise<{ success?: boolean; error?: string }>;
        commit: (cwd: string, message: string) => Promise<{ success?: boolean; error?: string }>;
        diff: (cwd: string, filePath: string, staged?: boolean) => Promise<{ diff?: string; error?: string }>;
        push: (cwd: string, remote: string, branch: string) => Promise<{ success?: boolean; error?: string }>;
        pull: (cwd: string, remote: string, branch: string) => Promise<{ success?: boolean; error?: string }>;
        fetch: (cwd: string) => Promise<{ success?: boolean; error?: string }>;
        remote: (cwd: string) => Promise<{ remotes?: { name: string; url: string; type: string }[]; error?: string }>;
      };

      github: {
        getToken: () => Promise<{ token: string | null }>;
        setToken: (token: string) => Promise<{ success?: boolean; error?: string }>;
        validateToken: (token: string) => Promise<{ valid: boolean; user?: any; error?: string }>;
        user: (token: string) => Promise<{ user?: any; error?: string }>;
        orgs: (token: string) => Promise<{ orgs?: any[]; error?: string }>;
        userRepos: (token: string, page?: number) => Promise<{ repos?: any[]; error?: string }>;
        orgRepos: (token: string, org: string) => Promise<{ repos?: any[]; error?: string }>;
        clone: (url: string, destPath: string, token: string) => Promise<{ success?: boolean; error?: string }>;
        createRepo: (token: string, name: string, description: string, isPrivate: boolean) => Promise<{ repo?: any; error?: string }>;
        createPR: (token: string, owner: string, repo: string, title: string, body: string, head: string, base: string) => Promise<{ pr?: any; error?: string }>;
        listPRs: (token: string, owner: string, repo: string) => Promise<{ prs?: any[]; error?: string }>;
        listBranches: (token: string, owner: string, repo: string) => Promise<{ branches?: any[]; error?: string }>;
      };
      on: (channel: string, callback: (...args: any[]) => void) => void;
      send: (channel: string, ...args: any[]) => void;
      invoke: (channel: string, ...args: any[]) => Promise<any>;
      removeAllListeners: (channel: string) => void;
    };
  }
}
